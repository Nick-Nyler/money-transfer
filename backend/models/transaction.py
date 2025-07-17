from database.db_init import db
import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False) # e.g., 'send', 'receive', 'deposit'
    amount = db.Column(db.Float, nullable=False)
    fee = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(50), default='completed') # e.g., 'pending', 'completed', 'failed'
    description = db.Column(db.String(255), nullable=True)
    recipient_name = db.Column(db.String(100), nullable=True)
    recipient_phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f'<Transaction {self.id} Type: {self.type} Amount: {self.amount}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'amount': self.amount,
            'fee': self.fee,
            'status': self.status,
            'description': self.description,
            'recipient_name': self.recipient_name,
            'recipient_phone': self.recipient_phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
