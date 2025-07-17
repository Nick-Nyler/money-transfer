from models.user import User
from models.wallet import Wallet
from models.transaction import Transaction
from schemas.user_schema import user_schema
from schemas.wallet_schema import wallet_schema
from schemas.transaction_schema import transactions_schema
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

def register_user(data):
    email = data.get('email')
    phone = data.get('phone')

    if User.query.filter_by(email=email).first():
        raise ValueError("Email already exists")
    if User.query.filter_by(phone=phone).first():
        raise ValueError("Phone number already exists")

    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        email=email,
        password_hash=hashed_password,
        first_name=data['firstName'],
        last_name=data['lastName'],
        phone=phone,
        role='user',
        created_at=datetime.datetime.utcnow()
    )
    db.session.add(new_user)
    db.session.commit()

    # Create a wallet for the new user
    new_wallet = Wallet(user_id=new_user.id, balance=0, currency="KES")
    db.session.add(new_wallet)
    db.session.commit()

    return user_schema.dump(new_user)

def login_user(email, password):
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        raise ValueError("Invalid email or password")
    return user_schema.dump(user)

def get_current_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")
    return user_schema.dump(user)

def update_user_profile(user_id, data):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")

    # Prevent changing email or role via this endpoint
    user.first_name = data.get('firstName', user.first_name)
    user.last_name = data.get('lastName', user.last_name)
    user.phone = data.get('phone', user.phone)

    db.session.commit()
    return user_schema.dump(user)

def change_user_password(user_id, old_password, new_password):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")

    if not check_password_hash(user.password_hash, old_password):
        raise ValueError("Incorrect current password")

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return {"message": "Password changed successfully"}
