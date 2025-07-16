# backend/routes.py
from flask import Blueprint, request, jsonify
from models import db, Wallet, Beneficiary, Transaction, User
from auth import token_required

api_bp = Blueprint('api', __name__)

@api_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'name': current_user.name,
        'email': current_user.email
    })

@api_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.json
    current_user.name  = data.get('name', current_user.name)
    current_user.email = data.get('email', current_user.email)
    db.session.commit()
    return jsonify({'msg':'Profile updated'})

@api_bp.route('/wallet', methods=['GET'])
@token_required
def get_wallet(current_user):
    w = Wallet.query.filter_by(user_id=current_user.id).first()
    return jsonify({'balance': w.balance})

@api_bp.route('/wallet/add', methods=['POST'])
@token_required
def add_funds(current_user):
    amt = request.json['amount']
    w   = Wallet.query.filter_by(user_id=current_user.id).first()
    w.balance += amt
    db.session.commit()
    return jsonify({'balance': w.balance})

@api_bp.route('/beneficiaries', methods=['GET', 'POST'])
@token_required
def beneficiaries(current_user):
    if request.method == 'GET':
        b = Beneficiary.query.filter_by(user_id=current_user.id).all()
        return jsonify([{
            'id': x.id,
            'name': x.name,
            'ref': x.account_reference
        } for x in b])
    d = request.json
    new = Beneficiary(
        name=d['name'],
        account_reference=d['ref'],
        user_id=current_user.id
    )
    db.session.add(new)
    db.session.commit()
    return jsonify({'msg':'Added'})

@api_bp.route('/transactions', methods=['GET'])
@token_required
def txns(current_user):
    w = Wallet.query.filter_by(user_id=current_user.id).first()
    t = Transaction.query.filter_by(from_wallet=w.id).all()
    return jsonify([{
        'to': x.to_beneficiary,
        'amt': x.amount,
        'fee': x.fee,
        'when': x.timestamp
    } for x in t])

@api_bp.route('/transactions/send', methods=['POST'])
@token_required
def send(current_user):
    d   = request.json
    w   = Wallet.query.filter_by(user_id=current_user.id).first()
    amt = d['amount']
    fee = max(0.5, amt * 0.01)
    total = amt + fee
    if w.balance < total:
        return jsonify({'msg':'Insufficient'}), 400
    w.balance -= total
    txn = Transaction(
        from_wallet    = w.id,
        to_beneficiary = d['beneficiary_id'],
        amount         = amt,
        fee            = fee
    )
    db.session.add(txn)
    db.session.commit()
    return jsonify({'balance': w.balance, 'fee': fee})
