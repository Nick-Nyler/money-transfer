# backend/routes/wallet_routes.py

from flask import Blueprint, request, jsonify, g, make_response
from controllers import wallet_controller
from routes.auth_routes import login_required
from models.transaction import Transaction
from models.wallet import Wallet
from extensions import db
import datetime, csv, io

from services.mpesa_service import MpesaService

wallet_bp = Blueprint('wallet_bp', __name__, url_prefix='/api/wallet')

@wallet_bp.route('/balance', methods=['GET'])
@login_required
def get_balance():
    try:
        wallet = wallet_controller.get_wallet_balance(g.user_id)
        return jsonify(wallet), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

@wallet_bp.route('/add-funds', methods=['POST'])
@login_required
def add_funds():
    data = request.get_json()
    amount = data.get('amount')
    phone  = data.get('phone_number')

    if not amount or not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400
    if not phone:
        return jsonify({"error": "Phone number is required"}), 400

    try:
        resp = MpesaService.lipa_na_mpesa(phone, amount, g.user_id, "Wallet Top‑up")
        return jsonify({
            "message": "STK Push initiated",
            "CheckoutRequestID": resp.get("CheckoutRequestID"),
            "MerchantRequestID": resp.get("MerchantRequestID"),
            **resp
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@wallet_bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    stk = data.get('Body', {}).get('stkCallback', {})
    result_code = stk.get('ResultCode')

    if result_code == 0:
        items = {item['Name']: item.get('Value') for item in stk
                 .get('CallbackMetadata', {}).get('Item', [])}
        amount            = items.get('Amount')
        phone_number      = items.get('PhoneNumber')
        receipt_no        = items.get('MpesaReceiptNumber')
        account_reference = stk.get('AccountReference')

        try:
            user_id = int(account_reference)
            wallet = Wallet.query.filter_by(user_id=user_id).first()
            wallet.balance += amount
            db.session.add(wallet)

            txn = Transaction(
                user_id=user_id,
                type='deposit',
                amount=amount,
                fee=0,
                status='completed',
                description=f'M-Pesa receipt {receipt_no}',
                recipient_phone=str(phone_number),
                created_at=datetime.datetime.utcnow()
            )
            db.session.add(txn)
            db.session.commit()
        except Exception:
            # swallow errors to avoid MPesa retry storms
            pass

    # ACK quickly so MPesa stops retrying
    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200

@wallet_bp.route('/statement', methods=['GET'])
@login_required
def download_statement():
    """
    Streams a CSV file of all transactions for the logged-in user.
    Columns: ID, Type, Amount, Fee, Status, Date
    """
    txs = Transaction.query.filter_by(user_id=g.user_id)\
                           .order_by(Transaction.created_at).all()

    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['ID', 'Type', 'Amount', 'Fee', 'Status', 'Date'])
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
