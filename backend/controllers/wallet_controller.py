# backend/controllers/wallet_controller.py

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
    """
    Manual/instant top-up (no MPesa flow). Keeps your original behavior.
    """
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        raise ValueError("Wallet not found")

    wallet.balance += amount
    db.session.add(wallet)

    new_transaction = Transaction(
        user_id=user_id,
        type="deposit",
        amount=amount,
        fee=0,
        status="completed",
        description="Manual Deposit",
        created_at=datetime.datetime.utcnow(),
    )
    db.session.add(new_transaction)

    db.session.commit()
    return wallet_schema.dump(wallet)


def credit_wallet_from_mpesa(
    user_id: int,
    amount: float,
    receipt: str,
    phone: str,
    checkout_id: str = None,
    merchant_id: str = None,
    trans_time: datetime.datetime = None,
):
    """
    Called by MPesa callback on successful STK Push.
    Adds the amount to the user's wallet and records a Transaction.
    """

    if not user_id:
        raise ValueError("user_id is required to credit wallet")

    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        raise ValueError("Wallet not found")

    wallet.balance += amount
    db.session.add(wallet)

    tx = Transaction(
        user_id=user_id,
        type="deposit",
        amount=amount,
        fee=0,
        status="completed",
        description="Deposit via M-Pesa",
        mpesa_receipt=receipt if hasattr(Transaction, "mpesa_receipt") else None,
        phone=phone if hasattr(Transaction, "phone") else None,
        checkout_request_id=checkout_id if hasattr(Transaction, "checkout_request_id") else None,
        merchant_request_id=merchant_id if hasattr(Transaction, "merchant_request_id") else None,
        created_at=trans_time or datetime.datetime.utcnow(),
    )
    db.session.add(tx)

    db.session.commit()
    return wallet_schema.dump(wallet)
