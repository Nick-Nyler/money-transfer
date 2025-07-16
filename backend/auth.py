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

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'msg':'Email exists'}),400
    u = User(name=data['name'], email=data['email'])
    u.set_password(data['password'])
    db.session.add(u)
    db.session.commit()
    w = Wallet(user_id=u.id)
    db.session.add(w)
    db.session.commit()
    return jsonify({'msg':'Registered'}),201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    u = User.query.filter_by(email=data['email']).first()
    if not u or not u.check_password(data['password']):
        return jsonify({'msg':'Bad creds'}),401
    token = jwt.encode({'id':u.id}, Config.SECRET_KEY, algorithm='HS256')
    return jsonify({'token':token})