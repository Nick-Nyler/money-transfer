# backend/routes/wallet_routes.py

from flask import Blueprint, request, jsonify, g, make_response
from controllers import wallet_controller
from routes.auth_routes import login_required
from models.transaction import Transaction
import csv, io

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
    if not amount or not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400
    try:
        wallet = wallet_controller.add_funds_to_wallet(g.user_id, amount)
        return jsonify(wallet), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@wallet_bp.route('/statement', methods=['GET'])
@login_required
def download_statement():
    """
    Streams a CSV file of all transactions for the logged-in user.
    Columns: ID, Type, Amount, Fee, Status, Date
    """
    txs = Transaction.query.filter_by(user_id=g.user_id).order_by(Transaction.created_at).all()

    # Build CSV in memory
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
