import os
from flask import Blueprint, request, jsonify, session, send_from_directory
from werkzeug.utils import secure_filename
from db import execute_query
from utils import verify_password, login_required, role_required, hash_password,send_email
import smtplib
from email.message import EmailMessage

auth_bp = Blueprint("auth", __name__)

UPLOAD_FOLDER = "uploads/profile_pictures"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = execute_query(
        """SELECT id, username, password, role, user_firstname, user_middlename, 
                  user_lastname, user_office, user_email, user_image 
           FROM users WHERE username = %s""",
        (username,), fetch_one=True,
    )

    if not user:
        return jsonify({"error": "User not found"}), 401

    if verify_password(password, user[2]):
        session["user_id"] = user[0]
        session["username"] = user[1]
        session["role"] = user[3]  # 🔥 Add this!

        return jsonify({"message": "Login successful"}), 200

    return jsonify({"error": "Invalid credentials"}), 401



# ✅ Logout
@auth_bp.route("/api/logout", methods=["POST"])
@login_required
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully!"}), 200


# ✅ Get Current User
@auth_bp.route("/api/user", methods=["GET"])
@login_required
def get_current_user():
    user = execute_query(
        """SELECT id, username, role, user_firstname, user_middlename, 
                  user_lastname, user_office, user_email, user_image 
           FROM users WHERE id = %s""",
        (session.get("user_id"),),
        fetch_one=True,
    )

    if not user:
        return jsonify({"error": "User not found"}), 404

    user_data = {
        "id": user[0],
        "username": user[1],
        "role": user[2],
        "user_firstname": user[3],
        "user_middlename": user[4],
        "user_lastname": user[5],
        "user_office": user[6],
        "user_email": user[7],
        "user_image": user[8],
    }

    return jsonify(user_data), 200


# ✅ Create New User with Profile Picture Upload and Barangay
@auth_bp.route("/api/users", methods=["POST"])
@login_required
@role_required("admin")
def create_user():
    data = request.form
    file = request.files.get("user_image")

    required_fields = [
        "username", "password", "role", "user_firstname", "user_middlename",
        "user_lastname", "user_office", "user_email", "barangay"
    ]
    if not all(field in data and data[field].strip() for field in required_fields):
        return jsonify({"error": "All fields are required"}), 400

    username = data["username"].strip()
    password = hash_password(data["password"].strip())
    role = data["role"].strip()
    barangay = int(data["barangay"])

    # Check if username already exists
    existing_user = execute_query("SELECT 1 FROM users WHERE username = %s LIMIT 1", (username,), fetch_one=True)
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    # Handle profile picture
    filename = None
    if file and allowed_file(file.filename):
        import uuid
        ext = file.filename.rsplit('.', 1)[-1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        file.save(os.path.join(UPLOAD_FOLDER, filename))

    # Insert user including barangay
    query = """INSERT INTO users 
        (username, password, role, user_firstname, user_middlename, user_lastname, 
         user_office, user_email, barangay, user_image) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
    params = (
        username, password, role,
        data["user_firstname"], data["user_middlename"], data["user_lastname"],
        data["user_office"], data["user_email"], barangay, filename
    )

    execute_query(query, params, commit=True)

    # Email Notification
    subject = "Welcome to CAUAYANCARES"
    body = f"Hello {data['user_firstname']} {data['user_lastname']},\n\nYour account has been successfully created.\nUsername: {username}"
    send_email(subject, body, data["user_email"])

    return jsonify({"message": "User created successfully", "user_image": filename}), 201

# ✅ Fetch All Users (Admin Only)
@auth_bp.route("/api/users", methods=["GET"])
@login_required
def get_users():
    user_id = session.get("user_id")
    user_role = session.get("role")

    if user_role == "admin":
        users = execute_query(
            """SELECT 
                users.id, 
                users.username, 
                users.role, 
                users.user_firstname, 
                users.user_middlename, 
                users.user_lastname, 
                users.user_office, 
                users.user_email, 
                users.user_image, 
                barangays.barangay AS barangay_name,
                barangays.id
            FROM users
            LEFT JOIN barangays ON users.barangay = barangays.id"""
        )
    else:
        users = execute_query(
            """SELECT 
                users.id, 
                users.username, 
                users.role, 
                users.user_firstname, 
                users.user_middlename, 
                users.user_lastname, 
                users.user_office, 
                users.user_email, 
                users.user_image, 
                barangays.barangay AS barangay_name,
                barangays.id
            FROM users
            LEFT JOIN barangays ON users.barangay = barangays.id
            WHERE users.id = %s
            """,
            (user_id,),
        )

    return jsonify([
        {
            "id": u[0],
            "username": u[1],
            "role": u[2],
            "user_firstname": u[3],
            "user_middlename": u[4],
            "user_lastname": u[5],
            "user_office": u[6],
            "user_email": u[7],
            "user_image": u[8],
            "barangay": u[9],
            "barangay_id": u[10]

        } for u in users
    ]), 200



@auth_bp.route("/api/barangay", methods=["GET"])
@login_required
def get_barangays():
    query = "SELECT id, barangay FROM barangays ORDER BY barangay ASC"
    results = execute_query(query)
    barangays = [{"id": row[0], "name": row[1]} for row in results]
    return jsonify(barangays)


# ✅ Update User
@auth_bp.route("/api/users/<int:user_id>", methods=["PUT"])
@login_required
@role_required("admin")
def update_user(user_id):
    data = request.form  # Get form data (for text fields)
    file = request.files.get("user_image")  # Get the uploaded profile picture

    fields = ["role", "password", "user_firstname", "user_middlename", "user_lastname",
              "user_office", "user_email", "barangay"]

    updates = []
    values = []

    # ✅ Update text fields
    for field in fields:
        if field in data:
            if field == "password" and data[field].strip():
                updates.append(f"{field} = %s")
                values.append(hash_password(data[field]))  # Hash password before storing
            elif field != "password":
                updates.append(f"{field} = %s")
                values.append(data[field])

    # ✅ Handle profile picture upload
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Update the user_image field in the database
        updates.append("user_image = %s")
        values.append(filename)  # Store the file path

    if not updates:
        return jsonify({"error": "No valid fields provided for update"}), 400

    values.append(user_id)
    query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
    execute_query(query, tuple(values), commit=True)

    return jsonify({"message": "User updated successfully"}), 200


# ✅ Delete User (Admin Only)
@auth_bp.route("/api/users/<int:user_id>", methods=["DELETE"])
@login_required
@role_required("admin")
def delete_user(user_id):
    execute_query("DELETE FROM users WHERE id = %s", (user_id,), commit=True)
    return jsonify({"message": "User deleted successfully"}), 200


# ✅ Serve Profile Pictures

@auth_bp.route("/uploads/profile_pictures/<filename>")
def uploaded_avatar(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@auth_bp.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = execute_query("SELECT id, username FROM users WHERE user_email = %s", (email,), fetch_one=True)
    if not user:
        return jsonify({"error": "Email not found"}), 404

    # Generate token (in production, use uuid4 or JWT with expiry)
    reset_token = str(user[0])

    # Create a password reset link (replace with actual frontend URL)
    reset_link = f"http://yourdomain.com/reset-password/{reset_token}"

    subject = "Password Reset Request"
    body = f"""
    Hi {user[1]},
    
    You requested to reset your password. Please click the link below to reset it:
    {reset_link}
    
    If you did not request this, please ignore this email.

    Thanks,
    CAUAYANCARES Support Team
    """

    # Send the email
    try:
        send_email(subject, body, email)
        return jsonify({"message": "Password reset link has been sent to your email."}), 200
    except Exception as e:
        return jsonify({"error": "Failed to send email", "details": str(e)}), 500
