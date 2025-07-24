# backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify, g, current_app
from controllers import auth_controller
from functools import wraps

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')

# Simple authentication decorator (for demo purposes)
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization token missing"}), 401
        
        try:
            token_type, token = auth_header.split(' ', 1)
            if token_type.lower() != 'bearer':
                return jsonify({"error": "Invalid token type"}), 401
            
            user_id = int(token)  # Assuming token is user ID for simplicity
            g.user_id = user_id
        except (ValueError, IndexError):
            return jsonify({"error": "Invalid token format"}), 401
        
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        user = auth_controller.register_user(data)
        return jsonify({"user": user, "token": user['id']}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    try:
        user = auth_controller.login_user(email, password)
        # Block deactivated accounts
        if user.get('role') == 'deactivated':
            return jsonify({"error": "Your account has been deactivated"}), 403
        return jsonify({"user": user, "token": user['id']}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    return jsonify({"message": "Logged out successfully"}), 200

@auth_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    try:
        user = auth_controller.get_current_user_profile(g.user_id)
        return jsonify(user), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

@auth_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.get_json()
    try:
        user = auth_controller.update_user_profile(g.user_id, data)
        return jsonify(user), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/profile/password', methods=['PUT'])
@login_required
def change_password():
    # 🔑 force JSON parsing on PUT
    data = request.get_json(force=True) or {}
    if 'oldPassword' not in data or 'newPassword' not in data:
        return jsonify({"error": "Missing oldPassword or newPassword"}), 400

    old_password = str(data['oldPassword'])
    new_password = str(data['newPassword'])
    current_app.logger.debug(f"change_password payload: old={old_password!r}, new={new_password!r}")

    try:
        result = auth_controller.change_user_password(g.user_id, old_password, new_password)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
