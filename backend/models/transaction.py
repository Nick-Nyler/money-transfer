from extensions import db
import datetime

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False) # 'send', 'receive', 'deposit'
    amount = db.Column(db.Float, nullable=False)
    fee = db.Column(db.Float, default=0.0, nullable=False)
    status = db.Column(db.String(20), default='completed', nullable=False) # 'completed', 'pending', 'failed'
    description = db.Column(db.String(255), nullable=True)
    recipient_name = db.Column(db.String(100), nullable=True)
    recipient_phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f'<Transaction {self.id} - {self.type} {self.amount}>'
