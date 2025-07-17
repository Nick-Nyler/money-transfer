from flask import Blueprint, request, jsonify, g
from controllers import beneficiary_controller
from routes.auth_routes import login_required # Re-use login_required

beneficiary_bp = Blueprint('beneficiary_bp', __name__, url_prefix='/api/beneficiaries')

@beneficiary_bp.route('/', methods=['GET'])
@login_required
def get_all_beneficiaries():
    try:
        beneficiaries = beneficiary_controller.get_beneficiaries(g.user_id)
        return jsonify({"beneficiaries": beneficiaries}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@beneficiary_bp.route('/', methods=['POST'])
@login_required
def add_new_beneficiary():
    data = request.get_json()
    if not data.get('name') or not data.get('phone'):
        return jsonify({"error": "Name and phone are required"}), 400
    try:
        beneficiary = beneficiary_controller.add_beneficiary(g.user_id, data)
        return jsonify(beneficiary), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@beneficiary_bp.route('/<int:beneficiary_id>', methods=['DELETE'])
@login_required
def remove_existing_beneficiary(beneficiary_id):
    try:
        result = beneficiary_controller.remove_beneficiary(beneficiary_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
