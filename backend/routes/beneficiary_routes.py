# backend/routes/beneficiary_routes.py

from flask import Blueprint, request, jsonify, g
from controllers import beneficiary_controller
from routes.auth_routes import login_required  # reuse login_required decorator

# Fix Blueprint instantiation: use _name, not _name
beneficiary_bp = Blueprint('beneficiary_bp', _name_, url_prefix='/api/beneficiaries')

@beneficiary_bp.route('/', methods=['GET'])
@login_required
def get_all_beneficiaries():
    try:
        bens = beneficiary_controller.get_beneficiaries(g.user_id)
        return jsonify({ "beneficiaries": bens }), 200
    except ValueError as e:
        return jsonify({ "error": str(e) }), 400
    except Exception as e:
        return jsonify({ "error": "Server error" }), 500

@beneficiary_bp.route('/', methods=['POST'])
@login_required
def add_new_beneficiary():
    data = request.get_json() or {}
    if not data.get('name') or not data.get('phone'):
        return jsonify({ "error": "Name and phone are required" }), 400
    try:
        ben = beneficiary_controller.add_beneficiary(g.user_id, data)
        return jsonify({ "beneficiary": ben }), 201
    except ValueError as e:
        return jsonify({ "error": str(e) }), 400

@beneficiary_bp.route('/<int:beneficiary_id>', methods=['PATCH'])
@login_required
def edit_beneficiary(beneficiary_id):
    data = request.get_json() or {}
    if not any(k in data for k in ("name", "phone", "email", "accountNumber", "relationship")):
        return jsonify({ "error": "No updatable fields provided" }), 400
    try:
        ben = beneficiary_controller.update_beneficiary(beneficiary_id, data)
        return jsonify({ "beneficiary": ben }), 200
    except ValueError as e:
        return jsonify({ "error": str(e) }), 404
    except Exception as e:
        return jsonify({ "error": str(e) }), 400

@beneficiary_bp.route('/<int:beneficiary_id>', methods=['DELETE'])
@login_required
def remove_existing_beneficiary(beneficiary_id):
    try:
        res = beneficiary_controller.remove_beneficiary(beneficiary_id)
        return jsonify(res), 200
    except ValueError as e:
        return jsonify({ "error": str(e) }), 404
    except Exception as e:
        return jsonify({ "error": str(e) }), 400