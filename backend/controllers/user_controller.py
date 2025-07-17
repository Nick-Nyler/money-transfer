from flask import jsonify
from models.user import User

def get_all_users():
    users = User.query.all()
    return jsonify([{
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_admin": user.is_admin
    } for user in users])