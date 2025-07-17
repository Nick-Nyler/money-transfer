	
from flask import jsonify, request
from models.wallet import Wallet
from config.db import db

def create_wallet(user_id):
    wallet = Wallet(user_id=user_id, balance=0.0)
    db.session.add(wallet)
    db.session.commit()
    return jsonify({"message": "Wallet created", "wallet_id": wallet.id}), 201

def get_wallet_balance(wallet_id):
    wallet = Wallet.query.get(wallet_id)
    if wallet:
        return jsonify({"wallet_id": wallet.id, "balance": wallet.balance})
    return jsonify({"error": "Wallet not found"}), 404