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
            # In a real app, this would decode a JWT and verify it
            # For this mock, we assume the token is the user ID
            token_type, token = auth_header.split(' ', 1)
            if token_type.lower() != 'bearer':
                return jsonify({"error": "Invalid token type"}), 401
            
            user_id = int(token) # Assuming token is user ID for simplicity
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
        return jsonify(user), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    try:
        user = auth_controller.login_user(email, password)
        # In a real app, you'd return a JWT here
        return jsonify({"user": user, "token": user['id']}), 200 # Return user ID as mock token
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
