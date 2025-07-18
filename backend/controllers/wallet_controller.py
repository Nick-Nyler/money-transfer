from models.wallet import Wallet
from models.transaction import Transaction
from schemas.wallet_schema import wallet_schema
from extensions import db
import datetime

def get_wallet_balance(user_id):
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        raise ValueError("Wallet not found for this user")
    return wallet_schema.dump(wallet)

def add_funds_to_wallet(user_id, amount):
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        raise ValueError("Wallet not found")

    # ── Increase the balance ──
    wallet.balance += amount
    db.session.add(wallet)

    # ── Record the deposit transaction ──
    new_transaction = Transaction(
        user_id=user_id,
        type="deposit",
        amount=amount,
        fee=0,
        status="completed",
        description="Deposit via M-Pesa",
        created_at=datetime.datetime.utcnow()
    )
    db.session.add(new_transaction)

    db.session.commit()
    return wallet_schema.dump(wallet)
