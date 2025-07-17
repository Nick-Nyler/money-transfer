from models.user import User
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from config import Config # Assuming Config is where your SECRET_KEY is defined

def register_user(first_name, last_name, email, password, phone):
    if User.query.filter_by(email=email).first():
        raise ValueError("Email already registered")
    if User.query.filter_by(phone=phone).first():
        raise ValueError("Phone number already registered")

    hashed_password = generate_password_hash(password)
    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password_hash=hashed_password,
        phone=phone
    )
    db.session.add(new_user)
    db.session.commit()
    return new_user

def login_user(email, password):
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        raise ValueError("Invalid email or password")

    # Generate a simple JWT token (for demo purposes)
    # In a real application, you'd use a more robust token system
    token_payload = {
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24) # Token expires in 24 hours
    }
    token = jwt.encode(token_payload, Config.SECRET_KEY, algorithm='HS256')

    return user.to_dict(), token

def verify_token(token):
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None # Token has expired
    except jwt.InvalidTokenError:
        return None # Invalid token

def get_current_user_profile(user_id):
    user = User.query.get(user_id)
    if user:
        return user.to_dict()
    return None

def update_user_profile(user_id, data):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")

    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            raise ValueError("Email already in use")
        user.email = data['email']
    if 'phone' in data and data['phone'] != user.phone:
        if User.query.filter_by(phone=data['phone']).first():
            raise ValueError("Phone number already in use")
        user.phone = data['phone']
    
    db.session.commit()
    return user.to_dict()

def change_user_password(user_id, old_password, new_password):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")

    if not check_password_hash(user.password_hash, old_password):
        raise ValueError("Incorrect old password")

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return {"message": "Password updated successfully"}
