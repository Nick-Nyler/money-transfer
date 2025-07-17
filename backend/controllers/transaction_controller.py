from flask import jsonify, request
from models.transaction import Transaction
from config.db import db
from datetime import datetime

def create_transaction():
    data = request.get_json()
    transaction = Transaction(
        user_id=data["user_id"],
        wallet_id=data["wallet_id"],
        amount=data["amount"],
        type=data["type"],
        timestamp=datetime.utcnow()
    )
    db.session.add(transaction)
    db.session.commit()
    return jsonify({"message": "Transaction recorded"}), 201
def get_user_transactions(user_id):
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": tx.id,
        "amount": tx.amount,
        "type": tx.type,
        "wallet_id": tx.wallet_id,
        "timestamp": tx.timestamp
    } for tx in transactions])