# backend/controllers/beneficiaries_controller.py

import datetime
from models.beneficiary import Beneficiary
from schemas.beneficiary_schema import beneficiary_schema, beneficiaries_schema
from extensions import db

def get_beneficiaries(user_id):
    """
    Return list of all Beneficiaries for a given user.
    """
    bens = Beneficiary.query.filter_by(user_id=user_id).all()
    return beneficiaries_schema.dump(bens)


def add_beneficiary(user_id, data):
    """
    Create a new Beneficiary.
    Expects data keys: name, phone, email?, accountNumber?, relationship?
    """
    new_b = Beneficiary(
        user_id=user_id,
        name=data["name"],
        phone=data["phone"],
        email=data.get("email"),
        account_number=data.get("accountNumber"),
        relationship=data.get("relationship"),
        created_at=datetime.datetime.utcnow(),
    )
    db.session.add(new_b)
    db.session.commit()
    return beneficiary_schema.dump(new_b)


def update_beneficiary(beneficiary_id, data):
    """
    Update an existing Beneficiary.
    Data may include any of: name, phone, email, accountNumber, relationship.
    """
    b = Beneficiary.query.get(beneficiary_id)
    if not b:
        raise ValueError("Beneficiary not found")

    # Only update the provided fields
    if "name" in data:
        b.name = data["name"]
    if "phone" in data:
        b.phone = data["phone"]
    if "email" in data:
        b.email = data["email"]
    if "accountNumber" in data:
        b.account_number = data["accountNumber"]
    if "relationship" in data:
        b.relationship = data["relationship"]

    # Optional: track when edited
    if hasattr(b, "updated_at"):
        b.updated_at = datetime.datetime.utcnow()

    db.session.commit()
    return beneficiary_schema.dump(b)


def remove_beneficiary(beneficiary_id):
    """
    Delete a Beneficiary by ID.
    """
    b = Beneficiary.query.get(beneficiary_id)
    if not b:
        raise ValueError("Beneficiary not found")
    db.session.delete(b)
    db.session.commit()
    return {"id": beneficiary_id}
