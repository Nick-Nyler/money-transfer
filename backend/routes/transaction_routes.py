from flask import Blueprint
from controllers.transaction_controller import (
    send_money, get_user_transactions
)

transaction_bp = Blueprint('transaction', __name__, url_prefix='/transactions')

transaction_bp.route('/send', methods=['POST'])(send_money)
transaction_bp.route('/<int:user_id>', methods=['GET'])(get_user_transactions)
