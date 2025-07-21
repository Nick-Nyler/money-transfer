from flask import Blueprint, jsonify, g, current_app
from controllers import admin_controller
from routes.auth_routes import login_required  # Re‑use login_required
from models.user import User  # Import User model to check role
from functools import wraps

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/admin')

# Admin‑specific decorator
def admin_required(f):
    @login_required
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = User.query.get(g.user_id)
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    try:
        users = admin_controller.get_all_users()
        return jsonify({"users": users}), 200
    except ValueError as e:
        current_app.logger.error(f"[get_all_users] {e}")
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_details(user_id):
    try:
        details = admin_controller.get_user_details_for_admin(user_id)
        return jsonify(details), 200
    except ValueError as e:
        current_app.logger.error(f"[get_user_details] user_id={user_id} => {e}")
        return jsonify({"error": str(e)}), 404

@admin_bp.route('/transactions', methods=['GET'])
@admin_required
def get_all_transactions():
    try:
        transactions = admin_controller.get_all_transactions()
        return jsonify({"transactions": transactions}), 200
    except ValueError as e:
        current_app.logger.error(f"[get_all_transactions] {e}")
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/transactions/<int:transaction_id>/reverse', methods=['POST'])
@admin_required
def reverse_transaction(transaction_id):
    try:
        reversed_tx = admin_controller.reverse_transaction(transaction_id)
        return jsonify({"transaction": reversed_tx}), 200
    except Exception as e:
        current_app.logger.error(f"[reverse_transaction] tx_id={transaction_id} => {e}")
        return jsonify({"error": str(e)}), 400
