from flask import Blueprint, request, jsonify, g
from controllers import transaction_controller
from routes.auth_routes import login_required # Corrected import

transaction_bp = Blueprint('transaction_bp', __name__, url_prefix='/api/transactions')

@transaction_bp.route('/', methods=['GET'])
@login_required
def get_user_transactions():
    user_id = g.user_id
    transactions = transaction_controller.get_transactions(user_id)
    return jsonify({"transactions": transactions}), 200

@transaction_bp.route('/send', methods=['POST'])
@login_required
def send_money():
    data = request.get_json()
    beneficiary_id = data.get('beneficiary_id')
    amount = data.get('amount')
    description = data.get('description')

    if not all([beneficiary_id, amount, description]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        result, status_code = transaction_controller.send_money(g.user_id, beneficiary_id, amount, description)
        return jsonify(result), status_code
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred during money transfer."}), 500
