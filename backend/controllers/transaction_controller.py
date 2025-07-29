import re
import datetime
from extensions import db
from models.transaction import Transaction
from models.wallet import Wallet
from models.beneficiary import Beneficiary
from models.user import User
from schemas.transaction_schema import transaction_schema, transactions_schema

def normalize_phone(raw):
    """
    Normalize Kenyan phone numbers to E.164 (+2547XXXXXXXX).
    Strips non‑digits, drops leading zero, prepends 254.
    """
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("0"):
        digits = digits[1:]
    if not digits.startswith("254"):
        digits = "254" + digits
    return "+" + digits

def get_transactions(user_id):
    transactions = (
        Transaction.query
        .filter_by(user_id=user_id)
        .order_by(Transaction.created_at.desc())
        .all()
    )
    return transactions_schema.dump(transactions)

def send_money(user_id, beneficiary_id, amount, description):
    # Fetch sender wallet
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        raise ValueError("Wallet not found")

    # Fetch beneficiary
    beneficiary = Beneficiary.query.get(beneficiary_id)
    if not beneficiary or beneficiary.user_id != user_id:
        raise ValueError("Beneficiary not found or does not belong to you")

    # Compute fee and total
    fee = round(amount * 0.01, 2)  # 1% fee
    total_amount = amount + fee

    if wallet.balance < total_amount:
        raise ValueError("Insufficient funds")

    # Normalize beneficiary phone
    normalized_phone = normalize_phone(beneficiary.phone)

    # Deduct from sender's wallet
    wallet.balance -= total_amount
    db.session.add(wallet)

    # Create sender's transaction
    sender_transaction = Transaction(
        user_id=user_id,
        type="send",
        amount=amount,
        fee=fee,
        status="completed",
        description=description,
        recipient_name=beneficiary.name,
        recipient_phone=normalized_phone,
        created_at=datetime.datetime.utcnow()
    )
    db.session.add(sender_transaction)

    # If the beneficiary is a registered user, credit their wallet
   
    recipient_user = None
    if beneficiary.phone:
        recipient_user = User.query.filter_by(phone=beneficiary.phone).first()

    if recipient_user:
        recipient_wallet = Wallet.query.filter_by(user_id=recipient_user.id).first()
        if recipient_wallet:
            # Credit recipient (full amount, no fee)
            recipient_wallet.balance += amount
            db.session.add(recipient_wallet)

            recipient_transaction = Transaction(
                user_id=recipient_user.id,
                type="receive",
                amount=amount,
                fee=0,
                status="completed",
                description=f"Received from {wallet.user.first_name} {wallet.user.last_name}",
                recipient_name=f"{wallet.user.first_name} {wallet.user.last_name}",
                recipient_phone=normalize_phone(wallet.user.phone),
                created_at=datetime.datetime.utcnow()
            )
            db.session.add(recipient_transaction)

    # Commit all changes
    db.session.commit()

    # Return the sender's transaction object
    return transaction_schema.dump(sender_transaction)
