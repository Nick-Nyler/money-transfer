from flask import Blueprint, jsonify
from controllers import user_controller
from routes.auth_routes import login_required # Re-use login_required

user_bp = Blueprint('user_bp', __name__, url_prefix='/api/users')

# This route might be more for admin access in a real app,
# but included for completeness based on the tree.
@user_bp.route('/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    try:
        user = user_controller.get_user_by_id(user_id)
        return jsonify(user), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
