# backend/models/user.py

from extensions import db
import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)  
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)  
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    wallets = db.relationship('Wallet', backref='user', lazy=True, uselist=False)
    beneficiaries = db.relationship('Beneficiary', backref='user', lazy=True)
    transactions = db.relationship('Transaction', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'
