from marshmallow import Schema, fields

class WalletSchema(Schema):
    id = fields.Int(dump_only=True)
    balance = fields.Float()
    user_id = fields.Int(required=True)

wallet_schema = WalletSchema()
wallets_schema = WalletSchema(many=True)