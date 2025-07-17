from flask import Blueprint, request, jsonify, g
from controllers import auth_controller
from functools import wraps

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization token is missing"}), 401
        
        try:
            token_type, token = auth_header.split(' ', 1)
            if token_type.lower() != 'bearer':
                return jsonify({"error": "Invalid token type"}), 401
            
            user_id = auth_controller.verify_token(token)
            if not user_id:
                return jsonify({"error": "Invalid or expired token"}), 401
            g.user_id = user_id # Store user_id in Flask's global context
        except Exception as e:
            return jsonify({"error": "Token verification failed", "details": str(e)}), 401
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')

    if not all([first_name, last_name, email, password, phone]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        user = auth_controller.register_user(first_name, last_name, email, password, phone)
        return jsonify({"message": "User registered successfully", "user_id": user['id']}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user_data, token = auth_controller.login_user(email, password)
        return jsonify({"message": "Login successful", "token": token, "user": user_data}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    # For this stateless API, logout is just client-side token removal
    return jsonify({"message": "Logged out successfully"}), 200

@auth_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    try:
        user = auth_controller.get_current_user_profile(g.user_id)
        if user:
            return jsonify(user), 200
        return jsonify({"error": "User profile not found"}), 404
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
