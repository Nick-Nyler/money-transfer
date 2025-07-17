from extensions import db

class Wallet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    balance = db.Column(db.Float, default=0.0, nullable=False)
    currency = db.Column(db.String(10), default='KES', nullable=False)

    def __repr__(self):
        return f'<Wallet UserID:{self.user_id} Balance:{self.balance}>'
