from models.user import User
from models.wallet import Wallet
from models.transaction import Transaction
from schemas.user_schema import user_schema, users_schema
from schemas.wallet_schema import wallet_schema
from schemas.transaction_schema import transactions_schema, transaction_schema
from extensions import db
from sqlalchemy import or_
import datetime

def get_all_users():
    """
    Fetch all users for admin view.
    """
    users = User.query.all()
    return users_schema.dump(users)

def get_user_details_for_admin(user_id):
    """
    Fetch detailed info (user, wallet, transactions) for a specific user in admin context.
    """
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")

    wallet = Wallet.query.filter_by(user_id=user_id).first()
    transactions = (
        Transaction.query
        .filter_by(user_id=user_id)
        .order_by(Transaction.created_at.desc())
        .all()
    )

    user_data = user_schema.dump(user)
    wallet_data = wallet_schema.dump(wallet) if wallet else None
    transactions_data = transactions_schema.dump(transactions)

    return {
        **user_data,
        "wallet": wallet_data,
        "transactions": transactions_data
    }

def get_all_transactions():
    """
    Fetch all transactions (for admin monitoring dashboard).
    """
    transactions = (
        Transaction.query
        .order_by(Transaction.created_at.desc())
        .all()
    )
    return transactions_schema.dump(transactions)

def reverse_transaction(transaction_id):
    """
    Reverse a 'send' transaction: deducts recipient, refunds sender, and logs reversal.
    """
    tx = Transaction.query.get(transaction_id)
    if not tx:
        raise ValueError("Original transaction not found")
    if tx.status == "reversed":
        raise ValueError("Transaction already reversed")
    if tx.type != "send":
        raise ValueError("Only 'send' transactions can be reversed")

    # Normalize phone lookup (strip leading '+')
    raw_phone = tx.recipient_phone or ""
    clean_phone = raw_phone.lstrip("+")
    recipient_user = User.query.filter(
        or_(
            User.phone == raw_phone,
            User.phone == clean_phone
        )
    ).first()

    if not recipient_user:
        raise ValueError(f"No registered user matches phone '{raw_phone}'")

    # 1) Deduct from recipient
    recipient_wallet = Wallet.query.filter_by(user_id=recipient_user.id).first()
    if not recipient_wallet:
        raise ValueError("Recipient wallet not found")
    if recipient_wallet.balance < tx.amount:
        raise ValueError("Recipient has insufficient balance to reverse")
    recipient_wallet.balance -= tx.amount
    db.session.add(recipient_wallet)

    # Mark corresponding receive txn as reversed (best‑effort)
    recv_tx = (
        Transaction.query
        .filter_by(
            user_id=recipient_user.id,
            type="receive",
            amount=tx.amount,
            status="completed"
        )
        .order_by(Transaction.created_at.desc())
        .first()
    )
    if recv_tx:
        recv_tx.status = "reversed"
        db.session.add(recv_tx)

    # 2) Refund sender (amount + fee)
    sender_wallet = Wallet.query.filter_by(user_id=tx.user_id).first()
    if not sender_wallet:
        raise ValueError("Sender wallet not found")
    sender_wallet.balance += (tx.amount + tx.fee)
    db.session.add(sender_wallet)

    # 3) Mark original send as reversed
    tx.status = "reversed"
    db.session.add(tx)

    # 4) Create a reversal transaction record
    reversal_tx = Transaction(
        user_id=tx.user_id,
        type="refund",
        amount=tx.amount,
        fee=0,
        status="completed",
        description=f"Reversal for transaction {tx.id}",
        created_at=datetime.datetime.utcnow()
    )
    db.session.add(reversal_tx)

    # Commit all changes
    db.session.commit()
    return transaction_schema.dump(reversal_tx)
