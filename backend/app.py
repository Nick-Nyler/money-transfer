# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from config import Config
from extensions import db, ma
from database.db_init import init_db
from routes import register_blueprints

# Load environment variables from .env
load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ————— Enable CORS on all /api/* routes for our React frontend —————
    CORS(
        app,
        resources={r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "https://money-transfer-d.onrender.com"
            ]
        }},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Authorization"]
    )

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)

    # Register all blueprints
    register_blueprints(app)

    # Global error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Not Found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

    return app

if __name__ == "__main__":
    # Create app and initialize DB
    app = create_app()
    with app.app_context():
        init_db(app)

    # Run server
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)


