# backend/app.py

from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from dotenv import load_dotenv
import os

from config import Config
from extensions import db, ma
from database.db_init import init_db
from routes import register_blueprints

load_dotenv()


def create_app():
    app = Flask(__name__)
    print(">>> CORS patch loaded")  # sanity check in Render logs
    app.config.from_object(Config)

    # ─── CORS ────────────────────────────────────────────────────────────────
    # ALLOWED_ORIGINS="http://localhost:5173,https://money-transfer-4bt2.onrender.com"
    allowed_origins = [
        o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()
    ]

    # Flask-CORS handles normal responses
    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Authorization"],
        methods=["GET", POST := "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # Short-circuit preflight so headers are guaranteed
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS" and request.path.startswith("/api/"):
            origin = request.headers.get("Origin")
            resp = make_response("", 204)
            if origin in allowed_origins:
                resp.headers["Access-Control-Allow-Origin"] = origin
                resp.headers["Vary"] = "Origin"
                resp.headers["Access-Control-Allow-Credentials"] = "true"
                resp.headers["Access-Control-Allow-Headers"] = request.headers.get(
                    "Access-Control-Request-Headers", "Content-Type, Authorization"
                )
                resp.headers["Access-Control-Allow-Methods"] = request.headers.get(
                    "Access-Control-Request-Method", "GET,POST,PUT,PATCH,DELETE,OPTIONS"
                )
            return resp  # stop request chain

    # Add headers to every response (incl. errors)
    @app.after_request
    def add_cors_headers(resp):
        origin = request.headers.get("Origin")
        if origin in allowed_origins and request.path.startswith("/api/"):
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Vary"] = "Origin"
            resp.headers["Access-Control-Allow-Credentials"] = "true"
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return resp
    # ─────────────────────────────────────────────────────────────────────────

    # Extensions
    db.init_app(app)
    ma.init_app(app)

    # Blueprints
    register_blueprints(app)

    # Healthcheck
    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"}), 200

    # Errors
    @app.errorhandler(404)
    def not_found_error(_):
        return jsonify({"error": "Not Found"}), 404

    @app.errorhandler(500)
    def internal_error(_):
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        init_db(app)
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)
