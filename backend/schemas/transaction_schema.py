from extensions import ma
from models.transaction import Transaction

class TransactionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Transaction
        load_instance = True

transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)
