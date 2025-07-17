from flask import Blueprint
from controllers.user_controller import get_user_profile, update_user_profile

user_bp = Blueprint('user', __name__, url_prefix='/users')

user_bp.route('/<int:user_id>', methods=['GET'])(get_user_profile)
user_bp.route('/<int:user_id>', methods=['PUT'])(update_user_profile)