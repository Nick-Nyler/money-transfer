from models.beneficiary import Beneficiary
from schemas.beneficiary_schema import beneficiary_schema, beneficiaries_schema
from extensions import db
import datetime

def get_beneficiaries(user_id):
    beneficiaries = Beneficiary.query.filter_by(user_id=user_id).all()
    return beneficiaries_schema.dump(beneficiaries)

def add_beneficiary(user_id, data):
    new_beneficiary = Beneficiary(
        user_id=user_id,
        name=data['name'],
        phone=data['phone'],
        email=data.get('email'),
        account_number=data.get('accountNumber'),
        relationship=data.get('relationship'),
        created_at=datetime.datetime.utcnow()
    )
    db.session.add(new_beneficiary)
    db.session.commit()
    return beneficiary_schema.dump(new_beneficiary)

def remove_beneficiary(beneficiary_id):
    beneficiary = Beneficiary.query.get(beneficiary_id)
    if not beneficiary:
        raise ValueError("Beneficiary not found")
    db.session.delete(beneficiary)
    db.session.commit()
    return {"message": "Beneficiary removed successfully"}
