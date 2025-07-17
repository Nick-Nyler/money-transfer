from flask import Blueprint
from controllers.admin_controller import get_all_users_admin, get_system_stats

admin_bp = Blueprint('admin', name, url_prefix='/admin')

admin_bp.route('/users', methods=['GET'])(get_all_users_admin)
admin_bp.route('/stats', methods=['GET'])(get_system_stats)