from flask import Blueprint, request, jsonify, session
from db import execute_query
from utils import login_required , log_action

schools_bp = Blueprint("schools", __name__)

@schools_bp.route("/api/schools", methods=["GET"])
@login_required
def get_schools():
    try:
        query = """
        SELECT
            s.id,
            s.name,
            s.address,
            s.barangay_id,
            b.barangay
        FROM schools s
        LEFT JOIN barangays b ON s.barangay_id = b.id
        """
        result = execute_query(query)
        schools = [
            {
                "id": r[0],
                "name": r[1],
                "address": r[2],
                "barangay_id": r[3],
                "barangay_name": r[4]
            }
            for r in result
        ]
        return jsonify(schools), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@schools_bp.route("/api/schools/<int:school_id>", methods=["PUT"])
@login_required
def update_school(school_id):
    data = request.get_json()

    required_fields = ["name", "address", "barangay_id"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    name = data["name"]
    address = data["address"]
    barangay_id = data["barangay_id"]

    # ✅ Check for duplicate name (excluding current school)
    duplicate_check_query = """
        SELECT id FROM schools WHERE name = %s AND id != %s
    """
    duplicate = execute_query(duplicate_check_query, [name, school_id])
    if duplicate:
        return jsonify({"error": "Another school with this name already exists."}), 409

    update_query = """
        UPDATE schools
        SET name = %s, address = %s, barangay_id = %s
        WHERE id = %s
    """
    try:
        execute_query(update_query, [name, address, barangay_id, school_id], commit=True)
        return jsonify({"message": "School updated successfully"}), 200
    except Exception as e:
        print(f"Error updating school: {e}")
        return jsonify({"error": "Failed to update school", "details": str(e)}), 500
