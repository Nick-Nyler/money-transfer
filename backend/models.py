from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

wallets = db.relationship('Wallet', backref='owner', lazy=True)
beneficiaries = db.relationship('Beneficiary', backref='owner', lazy=True)

def set_password(self, pw):
    self.password_hash = generate_password_hash(pw)

def check_password(self, pw):
    return check_password_hash(self.password_hash, pw)