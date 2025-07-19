from models.user import User
from models.wallet import Wallet
from models.transaction import Transaction
from schemas.user_schema import user_schema, users_schema
from schemas.wallet_schema import wallet_schema
from schemas.transaction_schema import transactions_schema

def get_all_users():
    users = User.query.all()
    return users_schema.dump(users)

def get_user_details_for_admin(user_id):
    user = User.query.get(user_id)
    if not user:
        raise ValueError("User not found")

    wallet = Wallet.query.filter_by(user_id=user_id).first()
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.created_at.desc()).all()

    user_data = user_schema.dump(user)
    wallet_data = wallet_schema.dump(wallet) if wallet else None
    transactions_data = transactions_schema.dump(transactions)

    # Flatten user_data into the root response for frontend
    return {
        **user_data,
        "wallet": wallet_data,
        "transactions": transactions_data
    }

def get_all_transactions():
    transactions = Transaction.query.order_by(Transaction.created_at.desc()).all()
    return transactions_schema.dump(transactions)
