# backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify, g, current_app
from functools import wraps

from controllers import auth_controller

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")

# --------------------------- helpers ---------------------------

def _json(silent=True):
    """Safely get JSON body."""
    return request.get_json(silent=silent) or {}

def _error(msg, code):
    return jsonify({"error": msg}), code

def _require_fields(data, fields):
    missing = [f for f in fields if not data.get(f)]
    if missing:
        raise ValueError(f"Missing fields: {', '.join(missing)}")

# Very basic auth: token == user_id (int)
def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization")
        if not header:
            return _error("Authorization token missing", 401)
        try:
            scheme, token = header.split(" ", 1)
            if scheme.lower() != "bearer":
                raise ValueError
            g.user_id = int(token)
        except Exception:
            return _error("Invalid token format", 401)
        return fn(*args, **kwargs)
    return wrapper

# --------------------------- routes ----------------------------

@auth_bp.route("/register", methods=["POST"])
def register():
    data = _json()
    try:
        _require_fields(data, ["email", "password", "firstName", "lastName", "phone"])
        user = auth_controller.register_user(data)
        return jsonify({"user": user, "token": user["id"]}), 201
    except ValueError as e:
        return _error(str(e), 400)
    except Exception:  # unexpected
        current_app.logger.exception("register crash")
        return _error("Internal Server Error", 500)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = _json()
    try:
        _require_fields(data, ["email", "password"])
        user = auth_controller.login_user(data["email"], data["password"])
        if user.get("role") == "deactivated":
            return _error("Your account has been deactivated", 403)
        return jsonify({"user": user, "token": user["id"]}), 200
    except ValueError as e:
        # bad creds or validation error from controller
        return _error(str(e), 401)
    except Exception:
        current_app.logger.exception("login crash")
        return _error("Internal Server Error", 500)


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    # nothing to do server-side with stateless tokens
    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/profile", methods=["GET"])
@login_required
def get_profile():
    try:
        user = auth_controller.get_current_user_profile(g.user_id)
        return jsonify(user), 200
    except ValueError as e:
        return _error(str(e), 404)
    except Exception:
        current_app.logger.exception("get_profile crash")
        return _error("Internal Server Error", 500)


@auth_bp.route("/profile", methods=["PUT"])
@login_required
def update_profile():
    data = _json()
    try:
        user = auth_controller.update_user_profile(g.user_id, data)
        return jsonify(user), 200
    except ValueError as e:
        return _error(str(e), 400)
    except Exception:
        current_app.logger.exception("update_profile crash")
        return _error("Internal Server Error", 500)


@auth_bp.route("/profile/password", methods=["PUT"])
@login_required
def change_password():
    data = _json()
    old_pwd = data.get("oldPassword")
    new_pwd = data.get("newPassword")
    if not old_pwd or not new_pwd:
        return _error("Missing oldPassword or newPassword", 400)

    try:
        result = auth_controller.change_user_password(g.user_id, old_pwd, new_pwd)
        return jsonify(result), 200
    except ValueError as e:
        return _error(str(e), 400)
    except Exception:
        current_app.logger.exception("change_password crash")
        return _error("Internal Server Error", 500)
