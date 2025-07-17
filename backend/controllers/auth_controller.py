from flask import jsonify, request
from models.user import User
from config.db import db
import jwt
import datetime
from config.config import Config

def register_user():
    data = request.get_json()
    if not data.get("email") or not data.get("password") or not data.get("name"):
        return jsonify({"error": "Missing required fields"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "User already exists"}), 400

        user = User(name=data["name"], email=data["email"])
        user.set_password(data["password"])

        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201
    
def login_user():
    data = request.get_json()
    user = User.query.filter_by(email=data["email"]).first()
    if user and user.check_password(data["password"]):
        token = jwt.encode({
            "user_id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, Config.SECRET_KEY, algorithm="HS256")

        return jsonify({"token": token}), 200

    return jsonify({"error": "Invalid email or password"}), 401