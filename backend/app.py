from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from config import Config
from extensions import db, ma
from database.db_init import init_db
from routes import register_blueprints

# Load environment variables from .env file
load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ————— Enable CORS on all /api/* routes —————
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)

    # Register all your blueprints
    register_blueprints(app)

    # Global error handler
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Not Found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    # Initialize database and seed data if needed
    with app.app_context():
        init_db(app)
    app.run(debug=True, port=5000)
