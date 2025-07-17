from flask import Blueprint

# Import blueprints from submodules
from .auth_routes import auth_bp
from .user_routes import user_bp
from .wallet_routes import wallet_bp
from .beneficiary_routes import beneficiary_bp
from .transaction_routes import transaction_bp
from .admin_routes import admin_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(wallet_bp)
    app.register_blueprint(beneficiary_bp)
    app.register_blueprint(transaction_bp)
    app.register_blueprint(admin_bp)
