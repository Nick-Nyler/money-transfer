from flask import Blueprint, request, jsonify
from models import db, User, Wallet
import jwt
from config import Config
from functools import wraps

auth_bp = Blueprint('auth', name)

def token_required(f):
    @wraps(f)
    def decorated(args, *kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'msg': 'Token missing'}), 401
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            current_user = User.query.get(data['id'])
        except:
            return jsonify({'msg': 'Invalid token'}), 401
        return f(current_user, args, *kwargs)
    return decorated