# backend/controllers/auth_controller.py

from models.user import User
from models.wallet import Wallet
from models.transaction import Transaction  # kept if other funcs use it elsewhere
from schemas.user_schema import user_schema
from schemas.wallet_schema import wallet_schema
from schemas.transaction_schema import transactions_schema
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
import datetime


# --- helpers ---------------------------------------------------------------

def _norm_email(e: str | None) -> str:
    return (e or "").strip().lower()

def _map_incoming_user(data: dict) -> dict:
    """
    Normalize camelCase coming from the React app to snake_case/DB fields.
    """
    return {
        "email": _norm_email(data.get("email")),
        "password": data.get("password"),
        "first_name": data.get("firstName") or data.get("first_name"),
        "last_name": data.get("lastName") or data.get("last_name"),
        "phone": data.get("phone") or data.get("phone_number"),
    }


# --- public API used by routes --------------------------------------------

def register_user(data: dict):
    fields = _map_incoming_user(data)

    # basic validation
    missing = [k for k in ("email", "password", "first_name", "last_name", "phone") if not fields.get(k)]
    if missing:
        raise ValueError(f"Missing fields: {', '.join(missing)}")

    if len(fields["password"]) < 6:
        raise ValueError("Password must be at least 6 characters")

    # uniqueness checks
    if User.query.filter_by(email=fields["email"]).first():
        raise ValueError("Email already exists")
    if User.query.filter_by(phone=fields["phone"]).first():
        raise ValueError("Phone number already exists")

    try:
        user = User(
            email=fields["email"],
            password_hash=generate_password_hash(fields["password"]),
            first_name=fields["first_name"],
            last_name=fields["last_name"],
            phone=fields["phone"],
            role="user",
            created_at=datetime.datetime.utcnow(),
        )
        db.session.add(user)
        db.session.flush()  # get user.id without full commit

        wallet = Wallet(user_id=user.id, balance=0, currency="KES")
        db.session.add(wallet)

        db.session.commit()
        return user_schema.dump(user)
    except IntegrityError:
        db.session.rollback()
        # race condition / duplicate
        raise ValueError("Email or phone already exists")


def login_user(email: str | None, password: str | None):
    if not email or not password:
        raise ValueError("Email and password are required")

    user = User.query.filter_by(email=_norm_email(email)).first()
    if not user or not check_password_hash(user.password_hash, password):
        raise ValueError("Invalid email or password")

    return user_schema.dump(user)


def get_current_user_profile(user_id: int):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")
    return user_schema.dump(user)


def update_user_profile(user_id: int, data: dict):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")

    # accept both snake & camel
    first_name = data.get("firstName", data.get("first_name", user.first_name))
    last_name  = data.get("lastName",  data.get("last_name",  user.last_name))
    phone      = data.get("phone",     data.get("phone_number", user.phone))

    # optional uniqueness check if phone changed
    if phone != user.phone and User.query.filter_by(phone=phone).first():
        raise ValueError("Phone number already exists")

    user.first_name = first_name
    user.last_name = last_name
    user.phone = phone

    db.session.commit()
    return user_schema.dump(user)


def change_user_password(user_id: int, old_password: str, new_password: str):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")

    if not check_password_hash(user.password_hash, old_password):
        raise ValueError("Incorrect current password")

    if not new_password or len(new_password) < 6:
        raise ValueError("New password must be at least 6 characters")

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return {"message": "Password changed successfully"}
