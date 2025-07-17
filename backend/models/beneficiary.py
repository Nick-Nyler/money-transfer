from database.db_init import db
import datetime

class Beneficiary(db.Model):
    __tablename__ = 'beneficiaries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    bank_name = db.Column(db.String(100), nullable=True) # Added bank_name
    account_number = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f'<Beneficiary {self.name} Phone: {self.phone}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'phone': self.phone,
            'bank_name': self.bank_name,
            'account_number': self.account_number,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
