from flask import Blueprint, request, jsonify, g
from controllers import wallet_controller
from routes.auth_routes import login_required # Re-use login_required

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