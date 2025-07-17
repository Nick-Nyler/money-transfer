from flask import jsonify
from models.user import User
from models.wallet import Wallet
from models.transaction import Transaction
from sqlalchemy import func

def get_all_users_admin():
    users = User.query.all()
    return jsonify([
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "is_admin": user.is_admin
        } for user in users
    ]), 200

def get_system_stats():
    total_users = User.query.count()
    total_wallets = Wallet.query.count()
    total_transactions = Transaction.query.count()
    total_balance = db.session.query(func.sum(Wallet.balance)).scalar() or 0.0
    return jsonify({
    "total_users": total_users,
    "total_wallets": total_wallets,
    "total_transactions": total_transactions,
    "total_balance": total_balance
}), 200