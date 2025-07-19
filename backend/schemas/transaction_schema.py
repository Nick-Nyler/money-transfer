from extensions import ma
from models.transaction import Transaction
from models.user import User
from marshmallow import fields

class TransactionSchema(ma.SQLAlchemyAutoSchema):
    user_id = fields.Integer()  # <-- add this line
    user_name = fields.Method("get_user_name")
    user_email = fields.Method("get_user_email")
    created_at_formatted = fields.Method("get_created_at_formatted")

    class Meta:
        model = Transaction
        load_instance = True

    def get_user_name(self, obj):
        user = User.query.get(obj.user_id)
        return f"{user.first_name} {user.last_name}" if user else "Unknown"

    def get_user_email(self, obj):
        user = User.query.get(obj.user_id)
        return user.email if user else ""

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime("%Y-%m-%d %H:%M:%S") if obj.created_at else ""

transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)
