from config.db import db

class Wallet(db.Model):
    tablename = 'wallets'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    balance = db.Column(db.Float, default=0.0)

    transactions = db.relationship('Transaction', backref='wallet', lazy=True)