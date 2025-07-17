from extensions import ma
from models.beneficiary import Beneficiary

class BeneficiarySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Beneficiary
        load_instance = True

beneficiary_schema = BeneficiarySchema()
beneficiaries_schema = BeneficiarySchema(many=True)
