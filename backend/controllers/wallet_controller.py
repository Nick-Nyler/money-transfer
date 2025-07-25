# backend/controllers/wallet_controller.py

import json
from datetime import datetime
from flask import current_app
from extensions import db, socketio
from models.wallet import Wallet
from models.transaction import Transaction
from schemas.wallet_schema import wallet_schema
from services.mpesa_service import MpesaService

# ───────────── Helpers ─────────────
def _set_if_attr(obj, attr, value):
    if hasattr(obj, attr):
        setattr(obj, attr, value)


# ───────────── Queries ─────────────
def get_wallet_balance(user_id: int):
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        raise ValueError("Wallet not found for this user")
    return wallet_schema.dump(wallet)


def add_funds_to_wallet(user_id: int, amount: float):
    """Manual/instant top‑up (no M‑Pesa)."""
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
        description="Manual Deposit",
        created_at=datetime.utcnow(),
    )
    db.session.add(tx)
    db.session.commit()

    return wallet_schema.dump(wallet)


# ───────────── STK Push Flow ─────────────
def initiate_mpesa_deposit(user_id: int, phone: str, amount: int):
    """Send STK push + create pending txn."""
    if amount < 1:
        raise ValueError("Amount must be >= 1")

    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        raise ValueError("Wallet not found")

    stk = MpesaService.lipa_na_mpesa(
        phone_number=phone,
        amount=amount,
        account_reference=user_id,
        transaction_desc="Wallet top-up"
    )

    tx = Transaction(
        user_id=user_id,
        type="deposit",
        amount=amount,
        fee=0,
        status="pending",
        description="STK Push - Awaiting Confirmation",
        created_at=datetime.utcnow()
    )
    _set_if_attr(tx, "checkout_request_id", stk.get("CheckoutRequestID"))
    _set_if_attr(tx, "merchant_request_id", stk.get("MerchantRequestID"))

    db.session.add(tx)
    db.session.commit()

    return {
        "checkoutRequestID": stk.get("CheckoutRequestID"),
        "customerMessage": stk.get("CustomerMessage"),
        "transactionId": tx.id
    }


def handle_mpesa_callback(payload: dict):
    """Mark txn completed/failed + credit wallet, then emit real-time update."""
    try:
        stk_cb = payload["Body"]["stkCallback"]
        result_code = stk_cb["ResultCode"]
        result_desc = stk_cb["ResultDesc"]
        checkout_id = stk_cb["CheckoutRequestID"]
    except KeyError:
        current_app.logger.error("Invalid callback payload: %s", json.dumps(payload))
        return {"ok": False, "reason": "invalid payload"}

    # Find the pending transaction
    tx = None
    if hasattr(Transaction, "checkout_request_id"):
        tx = Transaction.query.filter_by(checkout_request_id=checkout_id).first()
    if not tx:
        tx = (
            Transaction.query
            .filter_by(type="deposit", status="pending")
            .order_by(Transaction.created_at.desc())
            .first()
        )
        if not tx:
            current_app.logger.warning(f"Transaction not found for {checkout_id}")
            return {"ok": True, "note": "txn not found"}

    # Handle failure
    if result_code != 0:
        tx.status = "failed"
        tx.description = result_desc
        db.session.add(tx)
        db.session.commit()
        socketio.emit(
            "mpesa_status",
            {"checkoutRequestID": checkout_id, "resultCode": result_code},
            namespace="/mpesa"
        )
        return {"ok": True}

    # Success path: extract metadata
    items = stk_cb.get("CallbackMetadata", {}).get("Item", [])
    meta = {item["Name"]: item.get("Value") for item in items}

    amount_val = float(meta.get("Amount", tx.amount))
    receipt = meta.get("MpesaReceiptNumber")
    phone_num = meta.get("PhoneNumber")

    # Update tx and wallet
    tx.status = "completed"
    tx.description = f"Deposit via M-Pesa ({receipt})"
    _set_if_attr(tx, "mpesa_receipt", receipt)
    _set_if_attr(tx, "phone", phone_num)
    _set_if_attr(tx, "completed_at", datetime.utcnow())
    db.session.add(tx)

    wallet = Wallet.query.filter_by(user_id=tx.user_id).first()
    wallet.balance += amount_val
    db.session.add(wallet)

    db.session.commit()

    # Emit success event for real-time UI update
    socketio.emit(
        "mpesa_status",
        {
            "checkoutRequestID": checkout_id,
            "resultCode": result_code,
            "newBalance": wallet.balance
        },
        namespace="/mpesa"
    )

    return {"ok": True}


def get_transaction_status(checkout_id: str):
    """Frontend polling endpoint (fallback)."""
    tx = None
    if hasattr(Transaction, "checkout_request_id"):
        tx = Transaction.query.filter_by(checkout_request_id=checkout_id).first()
    if not tx:
        tx = (
            Transaction.query
            .filter_by(type="deposit", status="pending")
            .order_by(Transaction.created_at.desc())
            .first()
        )
    if not tx:
        raise ValueError("Transaction not found")
    return {"status": tx.status, "id": tx.id}


# ───────────── Utility (manual credit) ─────────────
def credit_wallet_from_mpesa(
    user_id: int,
    amount: float,
    receipt: str,
    phone: str,
    checkout_id: str = None,
    merchant_id: str = None,
    trans_time: datetime = None,
):
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
        created_at=trans_time or datetime.utcnow(),
    )
    _set_if_attr(tx, "mpesa_receipt", receipt)
    _set_if_attr(tx, "phone", phone)
    _set_if_attr(tx, "checkout_request_id", checkout_id)
    _set_if_attr(tx, "merchant_request_id", merchant_id)

    db.session.add(tx)
    db.session.commit()

    return wallet_schema.dump(wallet)
