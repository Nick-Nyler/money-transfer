# backend/routes/auth_routes.py

from flask import Blueprint, request, jsonify, g
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
        # Return both user and mock token so frontend can store it immediately
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
        # Return same shape: user + mock token
        return jsonify({"user": user, "token": user['id']}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    # Stateless API: client just drops its token
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
    data = request.get_json()
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')
    try:
        result = auth_controller.change_user_password(g.user_id, old_password, new_password)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
