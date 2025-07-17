from flask import Blueprint
from controllers.transaction_controller import (
    send_money, get_transactions_for_user
)

transaction_bp = Blueprint('transaction', name, url_prefix='/transactions')

transaction_bp.route('/send', methods=['POST'])(send_money)
transaction_bp.route('/<int:user_id>', methods=['GET'])(get_transactions_for_user)