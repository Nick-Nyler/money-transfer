# backend/routes/wallet_routes.py

from flask import Blueprint, request, jsonify, g, make_response
from routes.auth_routes import login_required
from controllers.wallet_controller import (
    get_wallet_balance,
    add_funds_to_wallet,
    initiate_mpesa_deposit,
    handle_mpesa_callback,
    get_transaction_status,
)
from models.transaction import Transaction
import csv, io

wallet_bp = Blueprint("wallet_bp", __name__, url_prefix="/api/wallet")


# ───────────────────────── Wallet Balance ─────────────────────────
@wallet_bp.get("/balance")
@login_required
def balance():
    try:
        data = get_wallet_balance(g.user_id)
        return jsonify(data), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


# ───────────────────────── Manual Top-Up (no MPesa) ─────────────────────────
@wallet_bp.post("/add-funds/manual")
@login_required
def add_funds_manual():
    body = request.get_json() or {}
    amount = body.get("amount")
    if not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400

    try:
        data = add_funds_to_wallet(g.user_id, float(amount))
        return jsonify({"message": "Funds added", "wallet": data}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


# ───────────────────────── STK Push Init ─────────────────────────
@wallet_bp.post("/add-funds")  # keep your old path but now it triggers STK
@login_required
def add_funds_mpesa():
    body = request.get_json() or {}
    amount = body.get("amount")
    phone = body.get("phone_number") or body.get("phone")  # support both keys

    if not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400
    if not phone:
        return jsonify({"error": "Phone number is required"}), 400

    try:
        resp = initiate_mpesa_deposit(g.user_id, phone, int(amount))
        return jsonify({
            "message": "STK Push initiated",
            **resp
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ───────────────────────── MPesa Callback ─────────────────────────
@wallet_bp.post("/mpesa/callback")
def mpesa_callback():
    """
    Safaricom hits here. Must ACK fast (ResultCode 0).
    """
    payload = request.get_json() or {}
    try:
        handle_mpesa_callback(payload)
    except Exception:
        # swallow to prevent endless retries
        pass
    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200


# ───────────────────────── TX Polling ─────────────────────────
@wallet_bp.get("/tx-status/<checkout_id>")
@login_required
def tx_status(checkout_id):
    try:
        data = get_transaction_status(checkout_id)
        return jsonify(data), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


# ───────────────────────── CSV Statement ─────────────────────────
@wallet_bp.get("/statement")
@login_required
def download_statement():
    """
    Streams a CSV for the logged-in user's transactions.
    """
    txs = Transaction.query.filter_by(user_id=g.user_id).order_by(Transaction.created_at).all()

    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(["ID", "Type", "Amount", "Fee", "Status", "Date"])
    for t in txs:
        cw.writerow([
            t.id,
            t.type,
            t.amount,
            t.fee,
            t.status,
            t.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])

    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=statement.csv"
    output.headers["Content-Type"] = "text/csv"
    return output
