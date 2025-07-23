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


def _norm(origin: str | None) -> str:
    if not origin:
        return ""
    return origin.rstrip("/").lower()


def create_app():
    app = Flask(__name__)
    print(">>> CORS patch loaded")
    app.config.from_object(Config)

    # ---------- CORS ----------
    raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    allowed_origins = {_norm(o) for o in raw_origins if o.strip()}
    # If you ever want to allow everything, set ALLOWED_ORIGINS="*"
    allow_all = "*" in allowed_origins

    # Let flask-cors decorate “normal” responses
    CORS(
        app,
        resources={r"/api/*": {"origins": list(allowed_origins) if not allow_all else "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # Manually answer OPTIONS so headers are guaranteed
    @app.before_request
    def preflight():
        if request.method == "OPTIONS" and request.path.startswith("/api/"):
            origin = _norm(request.headers.get("Origin"))
            resp = make_response("", 204)
            if allow_all or origin in allowed_origins:
                resp.headers["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")
                resp.headers["Vary"] = "Origin"
                resp.headers["Access-Control-Allow-Credentials"] = "true"
                resp.headers["Access-Control-Allow-Headers"] = request.headers.get(
                    "Access-Control-Request-Headers", "Content-Type, Authorization"
                )
                resp.headers["Access-Control-Allow-Methods"] = request.headers.get(
                    "Access-Control-Request-Method", "GET,POST,PUT,PATCH,DELETE,OPTIONS"
                )
            return resp

    # Add headers to everything else (including errors)
    @app.after_request
    def add_cors(resp):
        if request.path.startswith("/api/"):
            origin = _norm(request.headers.get("Origin"))
            if allow_all or origin in allowed_origins:
                resp.headers["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")
                resp.headers["Vary"] = "Origin"
                resp.headers["Access-Control-Allow-Credentials"] = "true"
                resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return resp
    # -----------------------------------------

    # Extensions / blueprints
    db.init_app(app)
    ma.init_app(app)
    register_blueprints(app)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"}), 200

    @app.errorhandler(404)
    def not_found(_):
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
