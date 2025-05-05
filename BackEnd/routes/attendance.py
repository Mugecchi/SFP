from flask import Blueprint, request, jsonify, send_from_directory, current_app,session
from db import execute_query, exec_tuple
from utils import login_required,log_action

attendance_bp = Blueprint("attendance", __name__)

# Helper function to validate file types
@attendance_bp.route("/api/attendance/<int:student_id>", methods=["POST"])
@login_required
def add_attendance(student_id):  # <-- this was missing
    data = request.get_json()

    attendance_status = data.get("attendance_status", 0)  # Default to Absent (0)

    if attendance_status not in [0, 1]:
        return jsonify({"error": "Invalid attendance status. Use 0 for 'Absent' or 1 for 'Present'."}), 400

    query = """
        INSERT INTO attendance (student_id, attendance_status)
        VALUES (%s, %s)
    """
    
    try:
        execute_query(query, (student_id, attendance_status), commit=True)
        return jsonify({"message": "Attendance record added"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@attendance_bp.route("/api/attendance", methods=["GET"])
def get_attendance():
    try:
        query = """
            SELECT
                CONCAT(sp.first_name, ' ', sp.middle_name, ' ', sp.last_name) AS name,
                IFNULL(a.attendance_status, 0) AS attendance_status,
                sp.student_id,
                b.barangay,
                s.name as school_name
            FROM student_profile sp
            LEFT JOIN barangays b ON sp.barangay_id = b.id
            LEFT JOIN schools s ON sp.school_id = s.id
            LEFT JOIN (
                SELECT * FROM attendance
                WHERE DATE(timestamp) = CURRENT_DATE()
            ) a ON sp.student_id = a.student_id
            ORDER BY attendance_status ASC
        """
        results = execute_query(query)
        attendance_list = [
            {
                "name": row[0],
                "attendance_status": row[1],
                "student_id": row[2],
                "barangay": row[3],
                "school_name": row[4]
            }
            for row in results
        ]
        return jsonify(attendance_list), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch attendance", "details": str(e)}), 500
    
@attendance_bp.route("/api/attendance/count", methods=["GET"])
@login_required
def get_daily_attendance_count():
    try:
        query = """
            SELECT 
                s.name AS school_name,
                DATE(a.timestamp) AS date,
                COUNT(*) AS present_count
            FROM attendance a
            JOIN student_profile sp ON a.student_id = sp.student_id
            JOIN schools s ON sp.school_id = s.id
            WHERE a.attendance_status = 1
            GROUP BY s.name, DATE(a.timestamp)
            ORDER BY date ASC, date ASC, school_name
        """
        result = execute_query(query)
        attendance_counts = [
            {
                "school_name": row[0],
                "date": row[1].isoformat(),
                "attendance_count": row[2]
            }
            for row in result
        ]
        return jsonify(attendance_counts), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch daily attendance count", "details": str(e)}), 500

@attendance_bp.route("/api/bmi", methods=["GET"])
@login_required
def get_bmi_categories():
    try:
        query = """
    SELECT 
    CASE
        WHEN latest_weight / POW(latest_height / 100, 2) < 18.5 THEN 'Underweight'
        WHEN latest_weight / POW(latest_height / 100, 2) BETWEEN 18.5 AND 24.9 THEN 'Normal weight'
        WHEN latest_weight / POW(latest_height / 100, 2) >= 25 AND latest_weight / POW(latest_height / 100, 2) < 30 THEN 'Overweight'
        ELSE 'Obese'
    END AS bmi_category,
    COUNT(*) AS category_count
FROM (
    SELECT 
        student_id,
        MAX(height) AS latest_height, 
        MAX(weight) AS latest_weight,
        MAX(created_at) AS latest_created_at
    FROM health_records
    WHERE hr_id IN (
        SELECT MAX(hr_id) 
        FROM health_records
        GROUP BY student_id
    )
    GROUP BY student_id
) AS latest_records
GROUP BY bmi_category;


        """
        result = execute_query(query)
        bmi_categories = [
            {
                "category": row[0],
                "count": row[1]
            }
            for row in result
        ]
        return jsonify(bmi_categories), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch BMI categories", "details": str(e)}), 500
