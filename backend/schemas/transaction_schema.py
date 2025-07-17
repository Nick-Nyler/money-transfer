from marshmallow import Schema, fields

class TransactionSchema(Schema):
    id = fields.Int(dump_only=True)
    sender_id = fields.Int(required=True)
    receiver_id = fields.Int(required=True)
    amount = fields.Float(required=True)
    timestamp = fields.DateTime()

transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)