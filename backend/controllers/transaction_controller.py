from models.transaction import Transaction
from models.wallet import Wallet
from models.beneficiary import Beneficiary
from schemas.transaction_schema import transactions_schema, transaction_schema
from extensions import db
import datetime

def get_transactions(user_id):
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.created_at.desc()).all()
    return transactions_schema.dump(transactions)

def send_money(user_id, beneficiary_id, amount, description):
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        raise ValueError("Wallet not found")

    beneficiary = Beneficiary.query.get(beneficiary_id)
    if not beneficiary or beneficiary.user_id != user_id: # Ensure beneficiary belongs to the user
        raise ValueError("Beneficiary not found or does not belong to you")

    fee = round(amount * 0.01, 2) # 1% fee
    total_amount = amount + fee

    if wallet.balance < total_amount:
        raise ValueError("Insufficient funds")

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
        recipient_phone=beneficiary.phone,
        created_at=datetime.datetime.utcnow()
    )
    db.session.add(sender_transaction)

    # Simulate recipient receiving money (if recipient is also a user in the system)
    # For this mock, we'll just log it or create a 'receive' transaction for the recipient if they exist
    recipient_user = None
    if beneficiary.phone:
        recipient_user = db.session.query(User).filter_by(phone=beneficiary.phone).first()

    if recipient_user:
        recipient_wallet = Wallet.query.filter_by(user_id=recipient_user.id).first()
        if recipient_wallet:
            recipient_wallet.balance += amount # Recipient receives full amount, sender pays fee
            db.session.add(recipient_wallet)
            recipient_transaction = Transaction(
                user_id=recipient_user.id,
                type="receive",
                amount=amount,
                fee=0, # Recipient doesn't pay fee
                status="completed",
                description=f"Received from {wallet.user.first_name} {wallet.user.last_name}",
                recipient_name=wallet.user.first_name + " " + wallet.user.last_name,
                recipient_phone=wallet.user.phone,
                created_at=datetime.datetime.utcnow()
            )
            db.session.add(recipient_transaction)

    db.session.commit()
    return transaction_schema.dump(sender_transaction)
