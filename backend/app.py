from flask import Flask
from config import Config
from models import db
from auth import auth_bp
from routes import api_bp
from admin import admin_bp

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(api_bp,   url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/admin')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
