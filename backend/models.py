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
class Wallet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    balance = db.Column(db.Float, default=0.0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Beneficiary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    account_reference = db.Column(db.String(128), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    from_wallet = db.Column(db.Integer, db.ForeignKey('wallet.id'), nullable=False)
    to_beneficiary = db.Column(db.Integer, db.ForeignKey('beneficiary.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    fee = db.Column(db.Float, default=0.0)