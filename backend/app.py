# backend/app.py

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from config import Config
from extensions import db, ma
from database.db_init import init_db
from routes import register_blueprints

# Load environment variables from .env (local) or Render dashboard (prod)
load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ─── CORS (Frontend ↔ Backend peace treaty) ────────────────────────────────
    # Comma‑separated list in env: ALLOWED_ORIGINS="http://localhost:5173,https://money-transfer-4bt2.onrender.com"
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Authorization"],
    )
    # ───────────────────────────────────────────────────────────────────────────

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)

    # Register all blueprints
    register_blueprints(app)

    # Optional tiny health check (nice for Render):
    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"}), 200

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
    app = create_app()
    with app.app_context():
        init_db(app)

    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)
