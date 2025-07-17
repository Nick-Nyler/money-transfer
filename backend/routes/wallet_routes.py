from flask import Blueprint, request
from controllers.wallet_controller import (
    create_wallet,
    get_wallet,
    get_wallet_balance
)

wallet_bp = Blueprint('wallet', __name__, url_prefix='/wallets')


@wallet_bp.route('/<int:wallet_id>', methods=['GET'])
def get_wallet_route(wallet_id):
    return get_wallet(wallet_id)


@wallet_bp.route('/<int:wallet_id>/balance', methods=['GET'])
def get_wallet_balance_route(wallet_id):
    return get_wallet_balance(wallet_id)


@wallet_bp.route('/create/<int:user_id>', methods=['POST'])
def create_wallet_route(user_id):
    return create_wallet(user_id)
