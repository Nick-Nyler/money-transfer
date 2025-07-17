from .auth_routes import auth_bp
from .user_routes import user_bp
from .wallet_routes import wallet_bp
from .transaction_routes import transaction_bp
from .admin_routes import admin_bp

all_routes = [auth_bp, user_bp, wallet_bp, transaction_bp, admin_bp]