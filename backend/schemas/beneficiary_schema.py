from marshmallow import Schema, fields

class BeneficiarySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    phone_number = fields.Str(required=True)
    user_id = fields.Int(required=True)

beneficiary_schema = BeneficiarySchema()
beneficiaries_schema = BeneficiarySchema(many=True)