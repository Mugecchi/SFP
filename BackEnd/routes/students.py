from flask import Blueprint, request, jsonify,session
from db import execute_query
from utils import login_required

students_bp = Blueprint("students", __name__)

@students_bp.route("/api/students", methods=["GET"])
@login_required
def get_students():
    try:
        query = """
            SELECT 
                sp.first_name, 
                sp.middle_name, 
                sp.last_name, 
                sp.age,
                sp.sex,
                sp.gender,
                b.barangay,
                s.name,
                sp.grade_level,
                sp.birthday,
                b.id,
                s.id,
                sp.student_id,
                sp.address

            FROM student_profile sp
            LEFT JOIN barangays b ON sp.barangay_id = b.id
            LEFT JOIN schools s ON sp.school_id = s.id
            WHERE sp.is_deleted = 0
        """
        result = execute_query(query)
        students = [
        {
            "first_name": r[0],
            "middle_name": r[1],
            "last_name": r[2],
            "age": r[3],
            "sex": r[4],
            "gender": r[5],
            "barangay_name": r[6],
            "school_name": r[7],
            "grade_level": r[8],
            "birthday": r[9],
            "barangay_id": r[10],
            "school_id": r[11],
            "student_id": r[12],
            "address": r[13]

        }
        for r in result
    ]

        return jsonify(students), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@students_bp.route("/api/health_records", methods=["GET"])
@login_required
def get_health_records():
    try:
        query = """
        WITH ranked_records AS (
            SELECT *,
                   ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY created_at DESC) AS rn
            FROM health_records
        )
        SELECT 
            sp.student_id,
            CONCAT(sp.first_name, ' ', sp.middle_name, ' ', sp.last_name) AS name,

            -- Most recent record
            curr.height AS current_height,
            curr.weight AS current_weight,
            ROUND(curr.weight / POW(curr.height / 100, 2), 2) AS current_bmi,

            -- Second most recent record
            prev.height AS previous_height,
            prev.weight AS previous_weight,
            ROUND(prev.weight / POW(prev.height / 100, 2), 2) AS previous_bmi,
            curr.allergies

        FROM student_profile sp

        LEFT JOIN ranked_records curr 
            ON sp.student_id = curr.student_id AND curr.rn = 1

        LEFT JOIN ranked_records prev 
            ON sp.student_id = prev.student_id AND prev.rn = 2

        WHERE sp.is_deleted = 0;
        """

        result = execute_query(query)
        health_records = [
            {
                "student_id": r[0],
                "name": r[1],
                "height": r[2],
                "weight": r[3],
                "bmi": r[4],
                "prev_bmi": r[7],
                "allergies": r[8],
            }
            for r in result
        ]
        return jsonify(health_records), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@students_bp.route("/api/health_records", methods=["POST"])
@login_required
def add_health_record():
    data = request.get_json()
    query = """
        INSERT INTO health_records (student_id, weight, height, allergies)
        VALUES (%s, %s, %s, %s)
    """
    try:
        execute_query(query, (
            data["student_id"],
            data["weight"],
            data["height"],
            data.get("allergies") or None  # safely handles missing key
        ), commit=True)
        return jsonify({"message": "Health record added"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@students_bp.route("/api/students", methods=["POST"])
@login_required
def create_student():
    data = request.get_json()

    # Validate input data
    required_fields = ["first_name","middle_name","last_name", "age", "barangay_id", "school_id", "birthday","sex", "gender","grade_level","address"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    first_name = data["first_name"]
    middle_name = data["middle_name"]
    last_name = data["last_name"]
    age = data["age"]
    barangay_id = data["barangay_id"]
    birthday = data["birthday"]
    gender =data["gender"]
    school_id = data["school_id"]
    sex = data["sex"]
    grade_level = data["grade_level"]
    address = data["address"]

    # Check if a student with the same name already exists
    check_query = "SELECT student_id FROM student_profile WHERE first_name = %s AND last_name = %s AND middle_name = %s"
    existing = execute_query(check_query, [first_name, last_name, middle_name])
    if existing:
        return jsonify({"error": "A student with this name already exists."}), 409


    query = """
        INSERT INTO student_profile (first_name,middle_name,last_name, age,birthday,gender, barangay_id, school_id,sex,grade_level,address)
        VALUES (%s, %s, %s, %s, %s,%s,%s,%s,%s , %s, %s)
    """
    params = (first_name,middle_name,last_name, age, birthday,gender, barangay_id, school_id,sex,grade_level,address)

    try:
        execute_query(query, params, commit=True)
        return jsonify({"message": "Student created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@students_bp.route("/api/students/<int:student_id>", methods=["PUT"])
@login_required
def update_student(student_id):
    data = request.get_json()

    # Validate required fields
    required_fields = ["first_name", "middle_name", "last_name", "age", "barangay_id", "school_id", "birthday", "sex", "gender", "grade_level"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    try:
        query = """
            UPDATE student_profile
            SET first_name = %s,
                middle_name = %s,
                last_name = %s,
                age = %s,
                birthday = %s,
                gender = %s,
                barangay_id = %s,
                school_id = %s,
                sex = %s,
                grade_level = %s
            WHERE student_id = %s AND is_deleted = 0
        """
        params = (
            data["first_name"],
            data["middle_name"],
            data["last_name"],
            data["age"],
            data["birthday"],
            data["gender"],
            data["barangay_id"],
            data["school_id"],
            data["sex"],
            data["grade_level"],
            student_id
        )

        execute_query(query, params, commit=True)
        return jsonify({"message": "Student updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@students_bp.route("/api/sex_counts", methods=["GET"])
@login_required
def get_sex_counts():
    try:
        query = """
            SELECT
                COUNT(CASE WHEN sex = 'male' THEN 1 END) AS male_count,
                COUNT(CASE WHEN sex = 'female' THEN 1 END) AS female_count
            FROM student_profile;
"""
        result = execute_query(query)
        sex_counts = [
            {
                "male": r[0],
                "female": r[1]
            }
            for r in result
        ]
        return jsonify(sex_counts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    