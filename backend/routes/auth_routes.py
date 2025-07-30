from flask import Blueprint, request, jsonify, g, current_app
from controllers import auth_controller
from functools import wraps
from otp import generate_otp, send_otp_email, store_otp, validate_otp

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')


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

            user_id = int(token)
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


# ✅ UPDATED Login Route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = auth_controller.login_user(email, password)

        if user.get('role') == 'deactivated':
            return jsonify({"error": "Your account has been deactivated"}), 403

        # ✅ Skip OTP for admin
        if user.get('role') == 'admin':
            return jsonify({
                "token": user['id'],
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "role": user['role']
                },
                "otp_required": False
            }), 200

        # 🔐 Proceed with OTP for regular users
        otp_code = generate_otp()
        store_otp(email, otp_code)

        try:
            send_otp_email(email, otp_code)
        except Exception as e:
            current_app.logger.error(f"Failed to send OTP: {str(e)}")
            return jsonify({"error": "Failed to send OTP. Please try again."}), 500

        return jsonify({
            "otp_required": True,
            "user_id": user['id'],
            "email": email
        }), 200

    except ValueError as e:
        current_app.logger.warning(f"Login failed for {email}: {str(e)}")
        return jsonify({"error": str(e)}), 401


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp_code = data.get('otp')

    if not email or not otp_code:
        return jsonify({"error": "Email and OTP are required"}), 400

    try:
        if validate_otp(email, otp_code):
            user = auth_controller.get_user_by_email(email)
            if not user:
                return jsonify({"error": "User not found"}), 404

            user_data = {
                "id": user.id,
                "email": user.email,
                "phone": user.phone,
                "role": user.role
            }

            return jsonify({"user": user_data, "token": user.id}), 200
        else:
            return jsonify({"error": "Invalid or expired OTP"}), 401
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


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
    data = request.get_json(force=True)
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    if not old_password or not new_password:
        return jsonify({"error": "Missing oldPassword or newPassword"}), 400

    current_app.logger.debug(f"Change password for user {g.user_id}")

    try:
        result = auth_controller.change_user_password(g.user_id, old_password, new_password)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
