from flask import Flask
from flask_cors import CORS
import os
from functools import wraps

# Import blueprints
from routes.auth import auth_bp
from routes.frontend import frontend_bp
from routes.logs import logs_bp
from routes.students import students_bp
from routes.schools import schools_bp
from routes.attendance import attendance_bp
app = Flask(__name__, static_folder="dist", static_url_path="/")
CORS(app, supports_credentials=True)
app.secret_key = "supersecretkey"  # Change this to a secure key
app.config["SESSION_COOKIE_SECURE"] = True  # Secure cookie for HTTPS
app.config["SESSION_COOKIE_HTTPONLY"] = True  # Prevent JS access
app.config["SESSION_COOKIE_SAMESITE"] = "None"  # Allow cross-origin cookies
# Increase max request size (adjust if needed)
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024  # 16MB limit
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(frontend_bp)
app.register_blueprint(logs_bp)
app.register_blueprint(students_bp)
app.register_blueprint(schools_bp)
app.register_blueprint(attendance_bp)


if __name__ == "__main__":
    # Check if running on Railway (production)
    if os.getenv("RAILWAY_ENVIRONMENT"):
        port = int(os.environ.get("PORT", 8000))  # Use dynamic port in production
    else:
        port = 5000  # Use port 5000 during development

    app.run(host="0.0.0.0", port=port, debug=not os.getenv("RAILWAY_ENVIRONMENT"))