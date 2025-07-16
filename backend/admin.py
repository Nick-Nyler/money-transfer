from flask import Blueprint, jsonify, request
from models import db, User, Transaction
from auth import token_required

admin_bp = Blueprint('admin', name)

@admin_bp.route('/users', methods=['GET','DELETE'])
@token_required
def manage_users(current_user):
    if not current_user.is_admin:
        return jsonify({'msg':'Nope'}),403
    if request.method=='GET':
        users = User.query.all()
        return jsonify([
          {'id':u.id,'email':u.email,'name':u.name} for u in users
        ])
    uid = request.args.get('id')
    u = User.query.get(uid)
    db.session.delete(u)
    db.session.commit()
    return jsonify({'msg':'Deleted'})

@admin_bp.route('/transactions/all', methods=['GET'])
@token_required
def all_txns(current_user):
    if not current_user.is_admin:
        return jsonify({'msg':'Nope'}),403
    t = Transaction.query.all()
    return jsonify([
      {'id':x.id,'amt':x.amount,'fee':x.fee} for x in t
    ])