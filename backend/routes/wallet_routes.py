from flask import Blueprint
from controllers.wallet_controller import (
    create_wallet, get_wallet, fund_wallet, withdraw_wallet
)

wallet_bp = Blueprint('wallet', name, url_prefix='/wallets')

wallet_bp.route('/create', methods=['POST'])(create_wallet)
wallet_bp.route('/<int:user_id>', methods=['GET'])(get_wallet)
wallet_bp.route('/<int:user_id>/fund', methods=['POST'])(fund_wallet)
wallet_bp.route('/<int:user_id>/withdraw', methods=['POST'])(withdraw_wallet)