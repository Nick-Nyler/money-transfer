from models.transaction import Transaction
from models.wallet import Wallet
from models.beneficiary import Beneficiary
from models.user import User
from database.db_init import db
import datetime

def get_transactions(user_id):
    """
    Fetches all transactions for a given user.
    """
    transactions = db.session.query(Transaction).filter_by(user_id=user_id).order_by(Transaction.created_at.desc()).all()
    return [t.to_dict() for t in transactions] # Return list of dictionaries

def send_money(user_id, beneficiary_id, amount, description):
    """
    Handles the logic for sending money from one user to a beneficiary.
    """
    user_wallet = db.session.query(Wallet).filter_by(user_id=user_id).first()
    if not user_wallet:
        return {"error": "User wallet not found"}, 404

    beneficiary = db.session.query(Beneficiary).get(beneficiary_id)
    if not beneficiary or beneficiary.user_id != user_id: # Ensure beneficiary belongs to the user
        return {"error": "Beneficiary not found or does not belong to you"}, 404

    # Calculate fee (1%)
    fee = round(amount * 0.01)
    total_amount = amount + fee

    if user_wallet.balance < total_amount:
        return {"error": "Insufficient funds"}, 400

    # Find the recipient user's wallet based on beneficiary phone
    recipient_user = db.session.query(User).filter_by(phone=beneficiary.phone).first()
    
    # If recipient_user is None, it means the beneficiary's phone is not associated with a registered user.
    # We can still proceed with the send transaction for the sender, but won't create a 'receive' transaction for the recipient.
    recipient_wallet = None
    if recipient_user:
        recipient_wallet = db.session.query(Wallet).filter_by(user_id=recipient_user.id).first()

    # Deduct from sender's wallet
    user_wallet.balance -= total_amount
    db.session.add(user_wallet)

    # Create transaction record for sender
    sender_transaction = Transaction(
        user_id=user_id,
        type="send",
        amount=amount,
        fee=fee,
        status="completed",
        description=description,
        recipient_name=beneficiary.name,
        recipient_phone=beneficiary.phone
    )
    db.session.add(sender_transaction)

    # Create transaction record for recipient if they are a registered user with a wallet
    if recipient_wallet:
        recipient_wallet.balance += amount # Recipient receives amount without fee
        db.session.add(recipient_wallet)
        
        # Fetch sender's details for recipient's transaction description
        sender_user = db.session.query(User).get(user_id)
        sender_name = f"{sender_user.first_name} {sender_user.last_name}" if sender_user else "Unknown Sender"
        sender_phone = sender_user.phone if sender_user else "Unknown Phone"

        recipient_transaction = Transaction(
            user_id=recipient_user.id,
            type="receive",
            amount=amount,
            fee=0, # No fee for receiving
            status="completed",
            description=f"Received from {sender_name}",
            recipient_name=sender_name, # Sender's name as recipient
            recipient_phone=sender_phone
        )
        db.session.add(recipient_transaction)

    db.session.commit()

    return {
        "message": "Money sent successfully",
        "transaction": sender_transaction.to_dict(),
        "wallet": user_wallet.to_dict()
    }, 200
