from flask import Blueprint, request, jsonify, g
from controllers import transaction_controller
from routes.auth_routes import login_required # Re-use login_required

transaction_bp = Blueprint('transaction_bp', __name__, url_prefix='/api/transactions')

@transaction_bp.route('/', methods=['GET'])
@login_required
def get_user_transactions():
    try:
        transactions = transaction_controller.get_transactions(g.user_id)
        return jsonify({"transactions": transactions}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@transaction_bp.route('/send', methods=['POST'])
@login_required
def send_money():
    data = request.get_json()
    beneficiary_id = data.get('beneficiaryId')
    amount = data.get('amount')
    description = data.get('description')

    if not beneficiary_id or not amount or not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"error": "Beneficiary ID and valid amount are required"}), 400

    try:
        transaction = transaction_controller.send_money(g.user_id, beneficiary_id, amount, description)
        return jsonify({"transaction": transaction}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
