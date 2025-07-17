from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db
from routes import all_routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    for route in all_routes:
        app.register_blueprint(route)

    @app.route("/")
    def home():
        return {"message": "Money Transfer API is running"}

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
