from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session, Response
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
from flask_moment import Moment
from datetime import datetime, timedelta
import uuid
import json
from functools import wraps
import secrets # --- MODIFIED ---: Imported the secrets module
import re
import csv
from io import StringIO
from flask_wtf.csrf import CSRFProtect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
moment = Moment(app)
# --- MODIFIED ---: Use a random secret key on each startup to invalidate old sessions.
app.secret_key = secrets.token_hex(16)

# --- NEW: CSRF Protection Setup ---
app.config['WTF_CSRF_ENABLED'] = True
app.config['WTF_CSRF_TIME_LIMIT'] = 3600  # 1 hour
csrf = CSRFProtect(app)

# --- NEW: Rate Limiter Setup ---
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"]
)

# Configuration
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)  # 1 hour session timeout
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}

# MongoDB setup
# client = MongoClient(os.getenv("MONGO_URI","mongodb://localhost:27017"))
client = MongoClient(os.getenv("MONGO_URI","mongodb+srv:alu:262122@evnet.k1uvmwe.mongodb.net/?retryWrites=true&w=majority&appName=evnet"))
db = client["alumni_db"]
users_collection = db["users"]
events_collection = db["events"]
rsvps_collection = db["rsvps"]
notifications_collection = db["notifications"]
password_reset_tokens_collection = db["password_reset_tokens"]
comments_collection = db["comments"]
jobs_collection = db["jobs"] # --- NEW COLLECTION ---
job_applications_collection = db["job_applications"] # --- NEW COLLECTION ---

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# --- Session management functions (unchanged) ---
def get_user_session_key(user_type):
    return f"{user_type}_user_id"

def set_user_session(user_type, user_id):
    session[get_user_session_key(user_type)] = str(user_id)
    session[f"{user_type}_logged_in"] = True

def get_user_session(user_type):
    return session.get(get_user_session_key(user_type))

def clear_user_session(user_type):
    session.pop(get_user_session_key(user_type), None)
    session.pop(f"{user_type}_logged_in", None)

def is_user_logged_in(user_type):
    return session.get(f"{user_type}_logged_in", False)

def get_current_user():
    if is_user_logged_in("admin"):
        user_id = get_user_session("admin")
        if user_id:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if user:
                return User(user)
    elif is_user_logged_in("alumni"):
        user_id = get_user_session("alumni")
        if user_id:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if user:
                return User(user)
    return None

# --- Decorators (unchanged) ---
def alumni_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_user_logged_in("alumni"):
            flash("Please log in as an alumni to access this page.", "error")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

def admin_required_new(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_user_logged_in("admin"):
            flash("Admin access required.", "error")
            return redirect(url_for("admin_login"))
        return f(*args, **kwargs)
    return decorated_function

def general_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_user_logged_in("admin") and not is_user_logged_in("alumni"):
            flash("You must be logged in to access this page.", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function


# Flask-Mail setup (unchanged)
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
mail = Mail(app)

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# User activity tracking collection
user_activity_collection = db["user_activity"]

# Server start time for session management
SERVER_START_TIME = datetime.now()

@app.before_request
def before_request():
    """Handle session timeout and server restart detection"""
    # Check for session timeout
    if 'alumni_id' in session or 'admin_id' in session:
        if 'last_activity' not in session:
            session['last_activity'] = datetime.now().isoformat()
        else:
            last_activity = datetime.fromisoformat(session['last_activity'])
            # 1 hour session timeout
            if datetime.now() - last_activity > timedelta(hours=1):
                session.clear()
                return redirect(url_for('login'))
        session['last_activity'] = datetime.now().isoformat()
    
    # Clear sessions on server restart
    if 'server_start_time' not in session:
        session['server_start_time'] = SERVER_START_TIME.isoformat()
    else:
        session_start = datetime.fromisoformat(session['server_start_time'])
        # If server was restarted, clear sessions
        if session_start < SERVER_START_TIME:
            session.clear()
            return redirect(url_for('login'))

# Create default admin user if it doesn't exist (unchanged)
def create_default_admin():
    if not users_collection.find_one({"is_admin": True}):
        admin_user = {
            "name": "Admin User", "email": "yogesh.chauhan.ai@gmail.com",
            "password": generate_password_hash("admin123"), "is_admin": True,
            "is_active": True, "phone": "+1234567890", "grad_year": "2020",
            "profile_picture": "", "preferences": {"email": True, "sms": False, "push": True},
            "created_at": datetime.utcnow(), "last_login": None
        }
        users_collection.insert_one(admin_user)
        print("✅ Default admin user created!")

create_default_admin()

@app.context_processor
def inject_user():
    def calculate_profile_completeness(user):
        """Calculate profile completeness percentage"""
        if not user:
            return 0
        
        score = 0
        total = 8
        
        if user.get('name'): score += 1
        if user.get('bio'): score += 1
        if user.get('phone'): score += 1
        if user.get('profile_picture'): score += 1
        if user.get('skills') and len(user.get('skills', [])) > 0: score += 1
        if user.get('interests') and len(user.get('interests', [])) > 0: score += 1
        if user.get('social_links') and any([
            user.get('social_links', {}).get('linkedin'),
            user.get('social_links', {}).get('twitter'),
            user.get('social_links', {}).get('github')
        ]): score += 1
        if user.get('grad_year'): score += 1
        
        return round((score / total) * 100)
    
    def get_unread_notifications():
        """Get unread notifications for current user"""
        current_user = get_current_user()
        if not current_user:
            return []
        
        notifications = list(notifications_collection.find({
            "user_id": ObjectId(current_user.id),
            "read": False
        }).sort("created_at", -1).limit(5))
        
        return notifications
    
    def get_notification_count():
        """Get count of unread notifications"""
        current_user = get_current_user()
        if not current_user:
            return 0
        
        return notifications_collection.count_documents({
            "user_id": ObjectId(current_user.id),
            "read": False
        })
    
    return dict(
        get_current_user=get_current_user,
        calculate_profile_completeness=calculate_profile_completeness,
        get_unread_notifications=get_unread_notifications,
        get_notification_count=get_notification_count
    )

# --- MODIFIED: Enhanced User class ---
class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data["_id"])
        self.email = user_data["email"]
        self.name = user_data.get("name", "")
        self.is_admin = user_data.get("is_admin", False)
        self.phone = user_data.get("phone", "")
        self.grad_year = user_data.get("grad_year", "")
        self.profile_picture = user_data.get("profile_picture", "")
        self.preferences = user_data.get("preferences", {})
        self._is_active = user_data.get("is_active", True)
        # --- NEW fields for enhanced profile ---
        self.bio = user_data.get("bio", "")
        self.skills = user_data.get("skills", [])
        self.interests = user_data.get("interests", [])
        self.social_links = user_data.get("social_links", {})

    @property
    def is_active(self):
        return self._is_active
    
    @property
    def is_authenticated(self):
        return True

@login_manager.user_loader
def load_user(user_id):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        return User(user)
    return None

# Helper functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def send_notification_email(recipients, subject, body):
    if not isinstance(recipients, list): recipients = [recipients]
    try:
        msg = Message(subject, sender=app.config["MAIL_USERNAME"], recipients=recipients)
        msg.html = body
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False

def track_user_activity(user_id, action, details=None):
    """Track user activity for analytics and security"""
    try:
        activity_log = {
            "user_id": ObjectId(user_id),
            "action": action,
            "details": details or {},
            "timestamp": datetime.now(),
            "ip_address": request.remote_addr if request else None,
            "user_agent": request.headers.get('User-Agent') if request else None
        }
        user_activity_collection.insert_one(activity_log)
    except Exception as e:
        print(f"Failed to track user activity: {e}")

# --- Core Routes ---
@app.route("/")
def index():
    """Enhanced landing page with better stats and recent events"""
    # Get upcoming events instead of all events
    recent_events = list(events_collection.find({
        "date": {"$gte": datetime.now()}
    }).sort("date", 1).limit(6))
    
    # Enhanced statistics
    stats = {
        "total_events": events_collection.count_documents({}),
        "total_users": users_collection.count_documents({"is_active": True}),
        "upcoming_events": events_collection.count_documents({"date": {"$gte": datetime.now()}}),
        "active_jobs": jobs_collection.count_documents({"is_active": True}),
        "this_month_events": events_collection.count_documents({
            "date": {
                "$gte": datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0),
                "$lt": (datetime.now().replace(day=1) + timedelta(days=32)).replace(day=1)
            }
        })
    }
    
    return render_template("index.html", recent_events=recent_events, stats=stats)

@app.route("/landing")
def landing():
    """Alternative landing page for marketing"""
    return redirect(url_for("index"))

# --- MODIFIED ROUTE ---
@app.route("/register", methods=["GET", "POST"])
@limiter.limit("5 per hour")
def register():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]
        confirm_password = request.form.get("confirm_password", "")
        name = request.form["name"]
        grad_year = request.form["grad_year"]
        
        # --- (Your validation logic should be here, e.g., checking if user exists) ---
        if users_collection.find_one({"email": email}):
            flash("An account with this email already exists.", "error")
            return redirect(url_for("register"))
        if password != confirm_password:
            flash("Passwords do not match.", "error")
            return redirect(url_for("register"))
        if len(password) < 6:
            flash("Password must be at least 6 characters long.", "error")
            return redirect(url_for("register"))
        
        user_data = {
            "email": email,
            "password": generate_password_hash(password, method="pbkdf2:sha256"),
            "name": name.strip(), "grad_year": int(grad_year),
            "is_admin": users_collection.count_documents({}) == 0, # First user is an admin
            "is_active": True, "profile_picture": "", "created_at": datetime.now(),
            "last_login": None,
            "failed_login_attempts": 0, "lockout_until": None,
            "bio": "", "skills": [], "interests": [],
            "social_links": {"linkedin": "", "twitter": "", "github": ""},
            "profile_privacy": "alumni_only" 
        }

        result = users_collection.insert_one(user_data)
        
        # Track registration activity
        track_user_activity(result.inserted_id, "registration", {"email": email, "name": name})
        
        # Auto-login the user after registration
        clear_user_session("alumni")
        set_user_session("alumni", result.inserted_id)
        
        flash("Registration successful! Welcome to the alumni community!", "success")
        return redirect(url_for("alumni_dashboard"))
        
        # Insert the user and get the result, which contains the new ID
        result = users_collection.insert_one(user_data)
        new_user_id = result.inserted_id

        # Automatically log the user in
        set_user_session("alumni", new_user_id)

        # Check if the new user is an admin and redirect accordingly
        if user_data["is_admin"]:
            # If they are an admin, also set the admin session
            set_user_session("admin", new_user_id)
            flash(f"Registration successful! Welcome, Admin {name.strip()}!", "success")
            return redirect(url_for("admin_dashboard"))
        else:
            # If they are a regular alumni, redirect to the alumni dashboard
            flash(f"Registration successful! Welcome, {name.strip()}!", "success")
            return redirect(url_for("alumni_dashboard"))
        
        
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
@limiter.limit("10 per minute") # --- NEW: Rate limiting
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]
        user = users_collection.find_one({"email": email})

        # --- NEW: Account Lockout Logic ---
        if user and user.get("lockout_until") and user["lockout_until"] > datetime.now():
            flash("Your account is locked. Please try again later.", "error")
            return redirect(url_for("login"))

        if user and check_password_hash(user["password"], password):
            # Check if account is active
            if not user.get("is_active", True):
                flash("Account is deactivated. Please contact administrator.", "error")
                return redirect(url_for("login"))
            
            # Reset failed attempts on success
            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"failed_login_attempts": 0, "lockout_until": None, "last_login": datetime.now()}}
            )
            
            # Track login activity
            track_user_activity(user["_id"], "login", {"user_type": "admin" if user.get("is_admin", False) else "alumni"})
            
            # Session handling logic - clear alumni session and set new one
            clear_user_session("alumni")
            set_user_session("alumni", user["_id"])
            
            # Redirect based on user type
            if user.get("is_admin", False):
                # Also set admin session for admin users
                clear_user_session("admin")
                set_user_session("admin", user["_id"])
                flash(f"Welcome back, {user.get('name', 'Admin')}!", "success")
                return redirect(url_for("admin_dashboard"))
            else:
                flash(f"Welcome back, {user.get('name', 'User')}!", "success")
                return redirect(url_for("index"))
        else:
            # Increment failed attempts
            if user:
                attempts = user.get("failed_login_attempts", 0) + 1
                update_data = {"$set": {"failed_login_attempts": attempts}}
                if attempts >= 5: # Lock after 5 attempts
                    update_data["$set"]["lockout_until"] = datetime.now() + timedelta(minutes=15)
                    flash("Account locked for 15 minutes.", "error")
                else:
                    flash("Invalid email or password.", "error")
                users_collection.update_one({"_id": user["_id"]}, update_data)
            else:
                flash("Invalid email or password.", "error")
            return redirect(url_for("login"))
    return render_template("login.html")

# --- Forgot/Reset Password Routes ---
@app.route('/forgot-password', methods=['GET', 'POST'])
@limiter.limit("5 per hour")
def forgot_password():
    """Forgot password functionality"""
    if request.method == "POST":
        email = request.form["email"]
        
        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            flash("Please enter a valid email address.", "error")
            return redirect(url_for("forgot_password"))
        
        user = users_collection.find_one({"email": email})
        
        if user:
            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(hours=1)  # Token expires in 1 hour
            
            # Store reset token in database
            password_reset_tokens_collection.delete_many({"email": email})  # Remove old tokens
            password_reset_tokens_collection.insert_one({
                "email": email,
                "token": reset_token,
                "expires_at": expires_at,
                "created_at": datetime.now(),
                "used": False
            })
            
            # Send reset email
            reset_url = url_for('reset_password', token=reset_token, _external=True)
            email_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px;">Alumni Event Scheduler</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
                </div>
                
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                        We received a request to reset your password. Click the button below to create a new password:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_url}" 
                            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                    color: white; padding: 15px 30px; text-decoration: none; 
                                    border-radius: 8px; font-weight: bold; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        If you didn't request this password reset, please ignore this email. 
                        This link will expire in 1 hour for security reasons.
                    </p>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="{reset_url}" style="color: #667eea; word-break: break-all;">{reset_url}</a>
                    </p>
                </div>
                
                <div style="padding: 20px; background: #e9ecef; text-align: center; color: #666; font-size: 12px;">
                    <p style="margin: 0;">© 2024 Alumni Event Scheduler. All rights reserved.</p>
                </div>
            </div>
            """
            
            if send_notification_email([email], "Reset Your Password - Alumni Event Scheduler", email_body):
                flash("Password reset instructions have been sent to your email.", "success")
            else:
                flash("Failed to send reset email. Please try again later.", "error")
        else:
            # Don't reveal if email exists or not for security
            flash("If an account with that email exists, password reset instructions have been sent.", "info")
        
        return redirect(url_for("forgot_password"))
    
    return render_template("forgot_password.html")

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
@limiter.limit("10 per hour")
def reset_password(token):
    """Reset password with token"""
    # Verify token
    reset_request = password_reset_tokens_collection.find_one({
        "token": token,
        "used": False,
        "expires_at": {"$gt": datetime.now()}
    })
    
    if not reset_request:
        flash("Invalid or expired reset token. Please request a new password reset.", "error")
        return redirect(url_for("forgot_password"))
    
    if request.method == "POST":
        password = request.form["password"]
        confirm_password = request.form["confirm_password"]
        
        # Validate passwords
        if not password or len(password) < 6:
            flash("Password must be at least 6 characters long.", "error")
            return render_template("reset_password.html", token=token)
        
        if password != confirm_password:
            flash("Passwords do not match.", "error")
            return render_template("reset_password.html", token=token)
        
        # Update user password
        hashed_password = generate_password_hash(password, method="pbkdf2:sha256")
        users_collection.update_one(
            {"email": reset_request["email"]},
            {"$set": {
                "password": hashed_password,
                "failed_login_attempts": 0,
                "lockout_until": None,
                "updated_at": datetime.now()
            }}
        )
        
        # Mark token as used
        password_reset_tokens_collection.update_one(
            {"_id": reset_request["_id"]},
            {"$set": {"used": True, "used_at": datetime.now()}}
        )
        
        flash("Your password has been reset successfully. You can now log in with your new password.", "success")
        return redirect(url_for("login"))
    
    return render_template("reset_password.html", token=token)

@app.route("/logout")
def logout():
    """Logout and clear all sessions"""
    session.clear()
    flash("Logged out successfully!", "success")
    return redirect(url_for("index"))

@app.route("/admin/logout")
def admin_logout():
    """Admin logout and clear all sessions"""
    session.clear()
    flash("Admin logged out successfully!", "success")
    return redirect(url_for("admin_login"))

# ... (The rest of your code remains the same) ...

# --- Profile & Dashboard ---
@app.route("/dashboard")
@alumni_required
def alumni_dashboard():
    current_user = get_current_user()
    
    # Get user's upcoming events
    upcoming_events = list(events_collection.find({
        "date": {"$gte": datetime.now()}
    }).sort("date", 1).limit(5))
    
    # Get user's RSVPs
    user_rsvps = list(rsvps_collection.find({
        "user_id": ObjectId(current_user.id)
    }).sort("rsvp_date", -1).limit(5))
    
    # Get recent job postings
    recent_jobs = list(jobs_collection.find({
        "is_active": True
    }).sort("created_at", -1).limit(3))
    
    # Get statistics
    stats = {
        "upcoming_events": events_collection.count_documents({"date": {"$gte": datetime.now()}}),
        "total_alumni": users_collection.count_documents({"is_admin": False, "is_active": True}),
        "active_jobs": jobs_collection.count_documents({"is_active": True}),
        "user_rsvps": rsvps_collection.count_documents({"user_id": ObjectId(current_user.id)})
    }
    
    # Get recent user activity
    recent_activity = list(user_activity_collection.find({
        "user_id": ObjectId(current_user.id)
    }).sort("timestamp", -1).limit(5))
    
    return render_template("alumni_dashboard.html", 
                         upcoming_events=upcoming_events,
                         user_rsvps=user_rsvps,
                         recent_jobs=recent_jobs,
                         recent_activity=recent_activity,   
                         stats=stats)

@app.route("/profile")
@general_login_required
def profile():
    current_user = get_current_user()
    user_data = users_collection.find_one({"_id": ObjectId(current_user.id)})
    return render_template("profile.html", user=user_data)

@app.route("/profile/edit", methods=["GET", "POST"])
@general_login_required
def edit_profile():
    current_user = get_current_user()
    if request.method == "POST":
        # --- MODIFIED: Added new profile fields ---
        # Handle graduation year - make it optional for admin users
        grad_year = request.form.get("grad_year", "")
        try:
            grad_year_int = int(grad_year) if grad_year else None
        except (ValueError, TypeError):
            grad_year_int = None
        
        update_data = {
            "name": request.form["name"], 
            "phone": request.form.get("phone", ""),
            "bio": request.form.get("bio", ""),
            "skills": [s.strip() for s in request.form.get("skills", "").split(',') if s.strip()],
            "interests": [i.strip() for i in request.form.get("interests", "").split(',') if i.strip()],
            "social_links": {
                "linkedin": request.form.get("linkedin", ""),
                "twitter": request.form.get("twitter", ""),
                "github": request.form.get("github", "")
            },
            "profile_privacy": request.form.get("profile_privacy", "alumni_only"),
            "updated_at": datetime.now()
        }
        
        # Only update grad_year if it's provided and valid
        if grad_year_int is not None:
            update_data["grad_year"] = grad_year_int
        
        # Profile picture logic (unchanged)
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
                update_data["profile_picture"] = f"uploads/{unique_filename}"
        
        users_collection.update_one({"_id": ObjectId(current_user.id)}, {"$set": update_data})
        
        # Track profile update activity
        track_user_activity(current_user.id, "profile_update", {
            "updated_fields": list(update_data.keys())
        })
        
        flash("Profile updated successfully!", "success")
        return redirect(url_for("profile"))
    
    user_data = users_collection.find_one({"_id": ObjectId(current_user.id)})
    return render_template("edit_profile.html", user=user_data)

@app.route("/profile/settings", methods=["GET", "POST"])
@general_login_required
def profile_settings():
    """Profile settings and preferences"""
    current_user = get_current_user()
    if request.method == "POST":
        # Update notification preferences
        preferences = {
            "email_notifications": request.form.get("email_notifications") == "on",
            "sms_notifications": request.form.get("sms_notifications") == "on",
            "push_notifications": request.form.get("push_notifications") == "on",
            "event_reminders": request.form.get("event_reminders") == "on",
            "newsletter": request.form.get("newsletter") == "on"
        }
        
        users_collection.update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {"preferences": preferences, "updated_at": datetime.now()}}
        )
        
        flash("Settings updated successfully!", "success")
        return redirect(url_for("profile_settings"))
    
    user_data = users_collection.find_one({"_id": ObjectId(current_user.id)})
    return render_template("profile_settings.html", user=user_data)

@app.route("/profile/delete", methods=["GET", "POST"])
@general_login_required
def delete_profile():
    """Delete user profile (GDPR compliance)"""
    current_user = get_current_user()
    if request.method == "POST":
        confirmation = request.form.get("confirmation")
        if confirmation == "DELETE":
            # Anonymize user data instead of deleting
            users_collection.update_one(
                {"_id": ObjectId(current_user.id)},
                {"$set": {
                    "name": "Deleted User",
                    "email": f"deleted_{current_user.id}@example.com",
                    "is_active": False,
                    "profile_picture": "",
                    "bio": "",
                    "skills": [],
                    "interests": [],
                    "social_links": {},
                    "phone": "",
                    "deleted_at": datetime.now()
                }}
            )
            
            # Clear sessions
            clear_user_session("alumni")
            clear_user_session("admin")
            
            flash("Your profile has been deleted successfully.", "success")
            return redirect(url_for("index"))
        else:
            flash("Please type 'DELETE' to confirm account deletion.", "error")
    
    return render_template("delete_profile.html")

# --- NEW FEATURE: User Data Export (GDPR) ---
@app.route("/profile/export-data")
@general_login_required
def export_data():
    current_user = get_current_user()
    user_data = users_collection.find_one({"_id": ObjectId(current_user.id)})
    
    if not user_data: return "User not found", 404

    user_data.pop('password', None) # Remove sensitive info
    user_data['_id'] = str(user_data['_id'])
    
    return Response(
        json.dumps(user_data, indent=4, default=str),
        mimetype='application/json',
        headers={'Content-Disposition': 'attachment;filename=my_alumni_data.json'}
    )

# --- NEW FEATURE: Alumni Directory ---
@app.route("/directory")
@general_login_required
def directory():
    page = request.args.get('page', 1, type=int)
    per_page = 12
    skip = (page - 1) * per_page
    
    search_query = request.args.get('query', '')
    grad_year_filter = request.args.get('grad_year', '')

    query = {"is_admin": False, "profile_privacy": "alumni_only"}
    
    if search_query:
        regex = re.compile(search_query, re.IGNORECASE)
        query["$or"] = [{"name": regex}, {"skills": regex}, {"interests": regex}]
    if grad_year_filter:
        try: query["grad_year"] = int(grad_year_filter)
        except ValueError: pass

    alumni_list = list(users_collection.find(query).sort("name", 1).skip(skip).limit(per_page))
    total_alumni = users_collection.count_documents(query)
    # Fix graduation year sorting issue - convert all to int and filter out None/invalid values
    grad_years_raw = users_collection.distinct("grad_year")
    grad_years = []
    for year in grad_years_raw:
        try:
            if year is not None:
                grad_years.append(int(year))
        except (ValueError, TypeError):
            continue
    grad_years = sorted(grad_years)

    return render_template("directory.html", alumni_list=alumni_list, page=page, per_page=per_page, total_alumni=total_alumni, grad_years=grad_years, search_query=search_query, grad_year_filter=grad_year_filter)

@app.route("/profile/<user_id>")
@general_login_required
def view_profile(user_id):
    user_data = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user_data or user_data.get("profile_privacy") == "private":
        flash("This profile is private or does not exist.", "error")
        return redirect(url_for("directory"))
    return render_template("profile.html", user=user_data)


# --- NEW FEATURE: Job Board ---
@app.route("/jobs")
@general_login_required
def jobs():
    search_query = request.args.get('query', '')
    job_type_filter = request.args.get('type', '')

    query = {"is_active": True}
    if search_query:
        regex = re.compile(search_query, re.IGNORECASE)
        query["$or"] = [{"title": regex}, {"company": regex}, {"description": regex}]
    if job_type_filter:
        query["job_type"] = job_type_filter

    job_listings = list(jobs_collection.find(query).sort("created_at", -1))
    job_types = jobs_collection.distinct("job_type")
    return render_template("jobs.html", jobs=job_listings, job_types=job_types, search_query=search_query, job_type_filter=job_type_filter)

@app.route("/job/<job_id>")
@general_login_required
def job_detail(job_id):
    job = jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        flash("Job not found.", "error")
        return redirect(url_for("jobs"))
    return render_template("job_detail.html", job=job)

@app.route("/jobs/post", methods=["GET", "POST"])
@general_login_required
def post_job():
    current_user = get_current_user()
    if request.method == "POST":
        title = request.form["title"]
        company = request.form["company"]
        location = request.form["location"]
        job_type = request.form["job_type"]
        description = request.form["description"]
        apply_url = request.form.get("apply_url", "")
        
        job_data = {
            "title": title, "company": company,
            "location": location, "job_type": job_type,
            "description": description, "apply_url": apply_url,
            "posted_by_id": ObjectId(current_user.id), "posted_by_name": current_user.name,
            "created_at": datetime.now(), "is_active": True
        }
        result = jobs_collection.insert_one(job_data)
        
        # Create in-app notifications for all users (except the poster)
        all_users = list(users_collection.find({
            "is_active": True, 
            "_id": {"$ne": ObjectId(current_user.id)}
        }))
        
        for user in all_users:
            notification = {
                "user_id": user["_id"],
                "title": "💼 New Job Opportunity!",
                "message": f"'{title}' at {company} in {location} - Posted by {current_user.name}",
                "type": "job_posted",
                "job_id": result.inserted_id,
                "created_at": datetime.now(),
                "read": False,
                "action_url": f"/job/{result.inserted_id}"
            }
            notifications_collection.insert_one(notification)
        
        # Send email notifications to users who opted in
        email_users = list(users_collection.find({
            "is_active": True, 
            "_id": {"$ne": ObjectId(current_user.id)},
            "$or": [
                {"preferences.job_notifications": True},
                {"preferences.job_notifications": {"$exists": False}}  # Default to True
            ]
        }))
        
        if email_users:
            recipients = [user["email"] for user in email_users]
            portal_link = request.url_root.rstrip('/') + url_for('job_detail', job_id=result.inserted_id)
            
            email_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 15px;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                            <span style="color: white; font-size: 30px;">💼</span>
                        </div>
                        <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">New Job Opportunity!</h1>
                    </div>
                    
                    <div style="background: #fff5f5; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #f093fb;">
                        <h2 style="color: #f093fb; margin: 0 0 15px 0; font-size: 24px;">{title}</h2>
                        <div style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            <p style="margin: 0 0 10px 0;"><strong>🏢 Company:</strong> {company}</p>
                            <p style="margin: 0 0 10px 0;"><strong>📍 Location:</strong> {location}</p>
                            <p style="margin: 0 0 10px 0;"><strong>💼 Type:</strong> {job_type}</p>
                            <p style="margin: 0;"><strong>👤 Posted by:</strong> {current_user.name}</p>
                        </div>
                        <div style="color: #555; line-height: 1.6;">
                            <p style="margin: 0;"><strong>Description:</strong></p>
                            <p style="margin: 10px 0 0 0;">{description[:200]}{'...' if len(description) > 200 else ''}</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                        <a href="{portal_link}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 5px 15px rgba(240, 147, 251, 0.4); transition: all 0.3s ease;">
                            🔍 View Job Details
                        </a>
                    </div>
                    
                    <div style="text-align: center; color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
                        <p style="margin: 0 0 10px 0;">Expand your career opportunities with fellow alumni!</p>
                        <p style="margin: 0;"><a href="{request.url_root.rstrip('/')}" style="color: #f093fb; text-decoration: none;">Visit Alumni Portal</a></p>
                    </div>
                </div>
            </div>
            """
            
            send_notification_email(
                recipients,
                f"💼 New Job: {title} at {company}",
                email_body
            )
        
        flash("Job posted successfully! All alumni have been notified.", "success")
        return redirect(url_for("jobs"))
    return render_template("post_job.html")


@app.route("/events")
def events():
    page = request.args.get('page', 1, type=int)
    per_page = 6
    skip = (page - 1) * per_page
    
    # Get filter parameters
    search = request.args.get('search', '')
    category = request.args.get('category', '')
    date_filter = request.args.get('date', '')
    
    # Build query
    query = {}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}}
        ]
    if category:
        query["category"] = category
    if date_filter == "upcoming":
        query["date"] = {"$gte": datetime.now()}
    elif date_filter == "past":
        query["date"] = {"$lt": datetime.now()}
    
    events = list(events_collection.find(query).sort("date", 1).skip(skip).limit(per_page))
    total_events = events_collection.count_documents(query)
    
    # Get categories for filter
    categories = events_collection.distinct("category")
    
    return render_template("events.html", 
                           events=events, 
                           page=page, 
                           per_page=per_page,
                           total_events=total_events,
                           search=search,
                           category=category,
                           date_filter=date_filter,
                           categories=categories)

@app.route("/event/<event_id>")
@alumni_required
def event_detail(event_id): # --- MODIFIED ---
    current_user = get_current_user()
    event = events_collection.find_one({"_id": ObjectId(event_id)})
    if not event:
        flash("Event not found.", "error")
        return redirect(url_for("events"))
    
    # Get user's RSVP
    user_rsvp = rsvps_collection.find_one({
        "event_id": ObjectId(event_id),
        "user_id": ObjectId(current_user.id)
    })
    
    # Get all RSVPs for this event
    all_rsvps = list(rsvps_collection.find({"event_id": ObjectId(event_id)}))
    
    # Calculate RSVP statistics
    rsvp_stats = {
        "yes": len([r for r in all_rsvps if r["status"] == "Yes"]),
        "no": len([r for r in all_rsvps if r["status"] == "No"]),
        "maybe": len([r for r in all_rsvps if r["status"] == "Maybe"]),
        "total_guests": sum([r.get("guest_count", 0) for r in all_rsvps if r["status"] == "Yes"])
    }
    
    # Get assigned alumni details
    assigned_alumni = []
    if event.get("assigned_alumni"):
        assigned_alumni_ids = [oid for oid in event["assigned_alumni"] if isinstance(oid, ObjectId)]
        if assigned_alumni_ids:
            assigned_alumni = list(users_collection.find(
                {"_id": {"$in": assigned_alumni_ids}},
                {"name": 1, "email": 1, "grad_year": 1}
            ))
            
    # --- NEW: Fetch comments for the event ---
    comments = list(comments_collection.find({"event_id": ObjectId(event_id)}).sort("created_at", 1))

    return render_template("event_detail.html", 
                           event=event, 
                           user_rsvp=user_rsvp,
                           rsvp_stats=rsvp_stats,
                           assigned_alumni=assigned_alumni,
                           comments=comments) # --- MODIFIED ---

# --- NEW FEATURE START: Event Commenting System ---

@app.route("/event/<event_id>/add_comment", methods=["POST"])
@general_login_required # Use general login required so both alumni and admin can comment
def add_comment(event_id):
    current_user = get_current_user()
    comment_text = request.form.get("comment_text")

    if not comment_text or not comment_text.strip():
        flash("Comment cannot be empty.", "error")
        return redirect(url_for("event_detail", event_id=event_id))

    comment_data = {
        "event_id": ObjectId(event_id),
        "user_id": ObjectId(current_user.id),
        "user_name": current_user.name,
        "user_profile_pic": current_user.profile_picture, # Store profile pic for display
        "comment_text": comment_text,
        "created_at": datetime.utcnow()
    }
    comments_collection.insert_one(comment_data)

    flash("Your comment has been posted.", "success")
    return redirect(url_for("event_detail", event_id=event_id))

# --- NEW FEATURE END: Event Commenting System ---


@app.route("/event/<event_id>/rsvp", methods=["POST"])
@alumni_required
def rsvp(event_id):
    current_user = get_current_user()
    event = events_collection.find_one({"_id": ObjectId(event_id)})
    if not event:
        flash("Event not found.", "error")
        return redirect(url_for("events"))
    
    status = request.form["status"]
    guest_count = int(request.form.get("guest_count", 1))
    dietary_restrictions = request.form.get("dietary_restrictions", "")
    comments = request.form.get("comments", "")
    
    # Check if user already RSVPed
    existing_rsvp = rsvps_collection.find_one({
        "event_id": ObjectId(event_id),
        "user_id": ObjectId(current_user.id)
    })
    
    rsvp_data = {
        "event_id": ObjectId(event_id),
        "user_id": ObjectId(current_user.id),
        "status": status,
        "guest_count": guest_count,
        "dietary_restrictions": dietary_restrictions,
        "comments": comments,
        "rsvp_date": datetime.now()
    }
    
    if existing_rsvp:
        rsvps_collection.update_one(
            {"_id": existing_rsvp["_id"]},
            {"$set": rsvp_data}
        )
        flash(f"RSVP updated to {status}.", "success")
    else:
        rsvps_collection.insert_one(rsvp_data)
        flash(f"RSVP recorded as {status}.", "success")
    
    # Track RSVP activity
    track_user_activity(current_user.id, "rsvp", {
        "event_id": str(event_id),
        "event_title": event["title"],
        "status": status,
        "guest_count": guest_count
    })
    
    # Send confirmation email to user
    send_notification_email(
        [current_user.email],
        "RSVP Confirmation",
        f"You have RSVPed {status} for the event: {event['title']} on {event['date'].strftime('%Y-%m-%d %H:%M')}"
    )
    
    # Send notification email to admin about the RSVP
    admin_users = list(users_collection.find({"is_admin": True, "is_active": True}, {"name": 1, "email": 1}))
    if admin_users:
        admin_portal_link = request.url_root.rstrip('/') + url_for('admin_event_rsvps', event_id=event_id)
        
        for admin in admin_users:
            # Determine status color
            status_color = '#28a745' if status == 'Yes' else '#ffc107' if status == 'Maybe' else '#dc3545'
            
            # Build dietary restrictions and comments sections
            dietary_section = f'<p style="margin: 0 0 10px 0;"><strong>🍽️ Dietary Restrictions:</strong> {dietary_restrictions}</p>' if dietary_restrictions else ''
            comments_section = f'<p style="margin: 0;"><strong>💬 Comments:</strong> {comments}</p>' if comments else ''
            
            admin_email_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 20px; border-radius: 15px;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                            <span style="color: white; font-size: 30px;">📝</span>
                        </div>
                        <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">New RSVP Response!</h1>
                        <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Hello {admin.get('name', 'Admin')}!</p>
                    </div>
                    
                    <div style="background: #fff5f5; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #ff6b6b;">
                        <h2 style="color: #ff6b6b; margin: 0 0 15px 0; font-size: 24px;">{event['title']}</h2>
                        <div style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            <p style="margin: 0 0 10px 0;"><strong>👤 Alumni:</strong> {current_user.name}</p>
                            <p style="margin: 0 0 10px 0;"><strong>📧 Email:</strong> {current_user.email}</p>
                            <p style="margin: 0 0 10px 0;"><strong>📅 Event Date:</strong> {event['date'].strftime('%B %d, %Y at %I:%M %p')}</p>
                            <p style="margin: 0 0 10px 0;"><strong>📍 Location:</strong> {event['location']}</p>
                            <p style="margin: 0 0 10px 0;"><strong>✅ RSVP Status:</strong> <span style="color: {status_color}; font-weight: bold;">{status}</span></p>
                            <p style="margin: 0 0 10px 0;"><strong>👥 Guest Count:</strong> {guest_count}</p>
                            {dietary_section}
                            {comments_section}
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                        <a href="{admin_portal_link}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4); transition: all 0.3s ease;">
                            📊 View All RSVPs
                        </a>
                    </div>
                    
                    <div style="text-align: center; color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
                        <p style="margin: 0 0 10px 0;">This is an automated notification about RSVP activity for your event.</p>
                        <p style="margin: 0;"><a href="{request.url_root.rstrip('/')}/admin" style="color: #ff6b6b; text-decoration: none;">Visit Admin Dashboard</a></p>
                    </div>
                </div>
            </div>
            """
            
            send_notification_email([admin["email"]], f"📝 New RSVP: {current_user.name} responded to {event['title']}", admin_email_body)
            
            # Create in-app notification for admin
            admin_notification = {
                "user_id": admin["_id"],
                "title": "📝 New RSVP Response",
                "message": f"{current_user.name} responded '{status}' to '{event['title']}'",
                "type": "rsvp_response",
                "event_id": ObjectId(event_id),
                "created_at": datetime.now(),
                "read": False,
                "action_url": f"/admin/events/{event_id}/rsvps"
            }
            notifications_collection.insert_one(admin_notification)
    
    return redirect(url_for("event_detail", event_id=event_id))

@app.route("/create_event", methods=["GET", "POST"])
@admin_required_new
def create_event():
    current_user = get_current_user()
    if request.method == "POST":
        title = request.form["title"]
        description = request.form["description"]
        date = request.form["date"]
        location = request.form["location"]
        capacity = int(request.form["capacity"])
        category = request.form.get("category", "General")
        venue_name = request.form.get("venue_name", "")
        venue_address = request.form.get("venue_address", "")
        venue_phone = request.form.get("venue_phone", "")
        tags = [tag.strip() for tag in request.form.get("tags", "").split(",") if tag.strip()]
        
        # Get assigned alumni IDs
        assigned_alumni = request.form.getlist("assigned_alumni")
        
        # Handle file uploads
        attachments = []
        if 'attachments' in request.files:
            files = request.files.getlist('attachments')
            for file in files:
                if file and file.filename and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    unique_filename = f"{uuid.uuid4()}_{filename}"
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                    file.save(file_path)
                    attachments.append({
                        "filename": filename,
                        "file_path": f"uploads/{unique_filename}",
                        "upload_date": datetime.now()
                    })
        
        event = {
            "title": title,
            "description": description,
            "date": datetime.strptime(date, "%Y-%m-%dT%H:%M"),
            "location": location,
            "capacity": capacity,
            "category": category,
            "venue": {
                "name": venue_name,
                "address": venue_address,
                "phone": venue_phone
            },
            "tags": tags,
            "attachments": attachments,
            "assigned_alumni": [ObjectId(alumni_id) for alumni_id in assigned_alumni if alumni_id],
            "created_by": ObjectId(current_user.id),
            "created_at": datetime.now(),
            "is_published": True,
            "rsvp_count": 0
        }
        
        result = events_collection.insert_one(event)
        
        # Create in-app notifications for all users
        all_users = list(users_collection.find({"is_active": True, "is_admin": False}))
        for user in all_users:
            notification = {
                "user_id": user["_id"],
                "title": "🎉 New Event Created!",
                "message": f"'{title}' has been scheduled for {datetime.strptime(date, '%Y-%m-%dT%H:%M').strftime('%B %d, %Y at %I:%M %p')} at {location}",
                "type": "event_created",
                "event_id": result.inserted_id,
                "created_at": datetime.now(),
                "read": False,
                "action_url": f"/event/{result.inserted_id}"
            }
            notifications_collection.insert_one(notification)
        
        # Send email notifications to selected alumni only
        if assigned_alumni:
            # Get details of selected alumni
            selected_alumni = list(users_collection.find(
                {"_id": {"$in": [ObjectId(alumni_id) for alumni_id in assigned_alumni if alumni_id]}},
                {"name": 1, "email": 1, "grad_year": 1}
            ))
            
            if selected_alumni:
                portal_link = request.url_root.rstrip('/') + url_for('event_detail', event_id=result.inserted_id)
                
                # Create personalized email for each selected alumni
                for alumni in selected_alumni:
                    email_body = f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
                        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                    <span style="color: white; font-size: 30px;">🎓</span>
                                </div>
                                <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: bold;">New Alumni Event!</h1>
                                <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Hello {alumni.get('name', 'Alumni')}!</p>
                            </div>
                            
                            <div style="background: #f8f9ff; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #667eea;">
                                <h2 style="color: #667eea; margin: 0 0 15px 0; font-size: 24px;">{title}</h2>
                                <div style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                    <p style="margin: 0 0 10px 0;"><strong>📅 Date:</strong> {datetime.strptime(date, '%Y-%m-%dT%H:%M').strftime('%B %d, %Y at %I:%M %p')}</p>
                                    <p style="margin: 0 0 10px 0;"><strong>📍 Location:</strong> {location}</p>
                                    <p style="margin: 0 0 10px 0;"><strong>🎯 Category:</strong> {category}</p>
                                    <p style="margin: 0;"><strong>👥 Capacity:</strong> {capacity} spots available</p>
                                </div>
                                <div style="color: #555; line-height: 1.6;">
                                    <p style="margin: 0;"><strong>Description:</strong></p>
                                    <p style="margin: 10px 0 0 0;">{description[:200]}{'...' if len(description) > 200 else ''}</p>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin-bottom: 25px;">
                                <a href="{portal_link}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                                    🎟️ View Event & RSVP
                                </a>
                            </div>
                            
                            <div style="text-align: center; color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
                                <p style="margin: 0 0 10px 0;">You've been specifically invited to this event! Don't miss out on this amazing opportunity to connect with fellow alumni!</p>
                                <p style="margin: 0;"><a href="{request.url_root.rstrip('/')}" style="color: #667eea; text-decoration: none;">Visit Alumni Portal</a></p>
                            </div>
                        </div>
                    </div>
                    """
                    
                    send_notification_email([alumni["email"]], f"🎉 You're Invited: {title}", email_body)
        
        flash("Event created successfully!", "success")
        return redirect(url_for("events"))
    
    categories = ["General", "Networking", "Social", "Professional", "Sports", "Cultural", "Educational"]
    users = list(users_collection.find({"is_active": True, "is_admin": False}, {"name": 1, "email": 1, "grad_year": 1}))
    return render_template("create_event.html", categories=categories, users=users)

@app.route("/event/<event_id>/edit", methods=["GET", "POST"])
@admin_required_new
def edit_event(event_id):
    event = events_collection.find_one({"_id": ObjectId(event_id)})
    if not event:
        flash("Event not found.", "error")
        return redirect(url_for("events"))
    
    if request.method == "POST":
        title = request.form["title"]
        description = request.form["description"]
        date = request.form["date"]
        location = request.form["location"]
        capacity = int(request.form["capacity"])
        category = request.form.get("category", "General")
        venue_name = request.form.get("venue_name", "")
        venue_address = request.form.get("venue_address", "")
        venue_phone = request.form.get("venue_phone", "")
        tags = [tag.strip() for tag in request.form.get("tags", "").split(",") if tag.strip()]
        
        # Handle new file uploads
        if 'attachments' in request.files:
            files = request.files.getlist('attachments')
            for file in files:
                if file and file.filename and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    unique_filename = f"{uuid.uuid4()}_{filename}"
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                    file.save(file_path)
                    if "attachments" not in event:
                        event["attachments"] = []
                    event["attachments"].append({
                        "filename": filename,
                        "file_path": f"uploads/{unique_filename}",
                        "upload_date": datetime.now()
                    })
        
        events_collection.update_one(
            {"_id": ObjectId(event_id)},
            {"$set": {
                "title": title,
                "description": description,
                "date": datetime.strptime(date, "%Y-%m-%dT%H:%M"),
                "location": location,
                "capacity": capacity,
                "category": category,
                "venue": {
                    "name": venue_name,
                    "address": venue_address,
                    "phone": venue_phone
                },
                "tags": tags,
                "attachments": event.get("attachments", []), # --- MODIFIED --- to save attachments
                "updated_at": datetime.now()
            }}
        )
        
        flash("Event updated successfully!", "success")
        return redirect(url_for("event_detail", event_id=event_id))
    
    categories = ["General", "Networking", "Social", "Professional", "Sports", "Cultural", "Educational"]
    # Convert date for the form input
    if event.get('date'):
        event['date_str'] = event['date'].strftime('%Y-%m-%dT%H:%M')
    return render_template("edit_event.html", event=event, categories=categories)

@app.route("/event/<event_id>/delete", methods=["POST"])
@admin_required_new
def delete_event(event_id):
    events_collection.delete_one({"_id": ObjectId(event_id)})
    rsvps_collection.delete_many({"event_id": ObjectId(event_id)})
    comments_collection.delete_many({"event_id": ObjectId(event_id)}) # --- MODIFIED --- delete comments too
    flash("Event deleted successfully!", "success")
    return redirect(url_for("events"))

# ... (rest of the admin routes are unchanged, so I'm omitting them for brevity)
# ... (all admin routes from /admin to the end of the file remain the same)
# The full code for all admin routes follows from here.
@app.route("/admin")
@admin_required_new
def admin_dashboard():
    current_user = get_current_user()
    # Get statistics
    stats = {
        "total_users": users_collection.count_documents({}),
        "total_events": events_collection.count_documents({}),
        "upcoming_events": events_collection.count_documents({"date": {"$gte": datetime.now()}}),
        "total_rsvps": rsvps_collection.count_documents({}),
        "active_users": users_collection.count_documents({"is_active": True})
    }
    
    # Get recent events
    recent_events = list(events_collection.find().sort("created_at", -1).limit(5))
    
    # Get recent users
    recent_users = list(users_collection.find().sort("created_at", -1).limit(5))
    
    # Get event statistics by category
    category_stats = list(events_collection.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]))
    
    return render_template("admin_dashboard.html", 
                           stats=stats, 
                           recent_events=recent_events,
                           recent_users=recent_users,
                           category_stats=category_stats)

@app.route("/admin/users")
@admin_required_new
def admin_users():
    users = list(users_collection.find().sort("created_at", -1))
    return render_template("admin_users.html", users=users)

@app.route("/admin/events")
@admin_required_new
def admin_events():
    events = list(events_collection.find().sort("date", 1))
    return render_template("admin_events.html", events=events, now=datetime.now())

@app.route("/api/events/<event_id>/rsvp-stats")
@admin_required_new
def rsvp_stats(event_id):
    rsvps = list(rsvps_collection.find({"event_id": ObjectId(event_id)}))
    
    stats = {
        "yes": len([r for r in rsvps if r["status"] == "Yes"]),
        "no": len([r for r in rsvps if r["status"] == "No"]),
        "maybe": len([r for r in rsvps if r["status"] == "Maybe"]),
        "total_guests": sum([r.get("guest_count", 0) for r in rsvps if r["status"] == "Yes"])
    }
    
    return jsonify(stats)

# Additional Admin Routes
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    """Admin login page"""
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]
        
        # Enhanced validation
        if not email or not password:
            flash("Please fill in all required fields.", "error")
            return redirect(url_for("admin_login"))
        
        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            flash("Please enter a valid email address.", "error")
            return redirect(url_for("admin_login"))
        
        user = users_collection.find_one({"email": email})
        if user and check_password_hash(user["password"], password):
            if not user.get("is_active", True):
                flash("Account is deactivated. Please contact a system administrator.", "error")
                return redirect(url_for("admin_login"))
                
            if user.get("is_admin", False):
                # Only clear admin session, keep alumni session if exists
                clear_user_session("admin")
                set_user_session("admin", user["_id"])
                
                # Update last login
                users_collection.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"last_login": datetime.now()}}
                )
                
                # Log admin login attempt
                print(f"Admin login successful: {email} at {datetime.now()}")
                
                flash(f"Welcome back, {user.get('name', 'Admin')}!", "success")
                return redirect(url_for("admin_dashboard"))
            else:
                # Log unauthorized admin access attempt
                print(f"Unauthorized admin access attempt: {email} at {datetime.now()}")
                flash("Access denied. Admin privileges required.", "error")
        else:
            # Log failed admin login attempt
            print(f"Failed admin login attempt: {email} at {datetime.now()}")
            flash("Invalid credentials.", "error")
    
    return render_template("admin_login.html")

@app.route("/admin/users/<user_id>/toggle-status", methods=["POST"])
@admin_required_new
def toggle_user_status(user_id):
    """Toggle user active/inactive status"""
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        new_status = not user.get("is_active", True)
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": new_status}}
        )
        status_text = "activated" if new_status else "deactivated"
        flash(f"User {status_text} successfully!", "success")
    else:
        flash("User not found.", "error")
    
    return redirect(url_for("admin_users"))

@app.route("/admin/users/<user_id>/toggle-block", methods=["POST"])
@admin_required_new
def toggle_user_block(user_id):
    """Toggle user blocked/unblocked status"""
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        new_status = not user.get("is_blocked", False)
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_blocked": new_status}}
        )
        status_text = "blocked" if new_status else "unblocked"
        flash(f"User {status_text} successfully!", "success")
    else:
        flash("User not found.", "error")
    
    return redirect(url_for("admin_users"))

@app.route("/admin/users/<user_id>/delete", methods=["POST"])
@admin_required_new
def delete_user(user_id):
    """Delete a user"""
    current_user = get_current_user()
    if user_id == str(current_user.id):
        flash("Cannot delete your own account.", "error")
        return redirect(url_for("admin_users"))
    
    # Delete user's RSVPs
    rsvps_collection.delete_many({"user_id": ObjectId(user_id)})
    
    # Delete user
    result = users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count > 0:
        flash("User deleted successfully!", "success")
    else:
        flash("User not found.", "error")
    
    return redirect(url_for("admin_users"))

@app.route("/admin/users/<user_id>/make-admin", methods=["POST"])
@admin_required_new
def make_admin(user_id):
    """Make a user an admin"""
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_admin": True}}
    )
    flash("User promoted to admin successfully!", "success")
    return redirect(url_for("admin_users"))

@app.route("/admin/users/<user_id>/remove-admin", methods=["POST"])
@admin_required_new
def remove_admin(user_id):
    """Remove admin privileges from a user"""
    current_user = get_current_user()
    if user_id == str(current_user.id):
        flash("Cannot remove admin privileges from your own account.", "error")
        return redirect(url_for("admin_users"))
    
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_admin": False}}
    )
    flash("Admin privileges removed successfully!", "success")
    return redirect(url_for("admin_users"))

@app.route("/admin/events/<event_id>/rsvps")
@admin_required_new
def admin_event_rsvps(event_id):
    """View RSVPs for a specific event"""
    event = events_collection.find_one({"_id": ObjectId(event_id)})
    if not event:
        flash("Event not found.", "error")
        return redirect(url_for("admin_events"))
    
    # Get RSVPs with user details
    rsvps = list(rsvps_collection.find({"event_id": ObjectId(event_id)}))
    rsvp_details = []
    
    for rsvp in rsvps:
        user = users_collection.find_one({"_id": rsvp["user_id"]})
        if user:
            rsvp_details.append({
                "rsvp": rsvp,
                "user": user
            })
    
    return render_template("admin_event_rsvps.html", event=event, rsvp_details=rsvp_details)

@app.route("/admin/events/<event_id>/export-rsvps")
@admin_required_new
def export_event_rsvps(event_id):
    """Export RSVPs for an event as CSV"""
    import csv
    from flask import make_response
    
    event = events_collection.find_one({"_id": ObjectId(event_id)})
    if not event:
        flash("Event not found.", "error")
        return redirect(url_for("admin_events"))
    
    # Get RSVPs with user details
    rsvps = list(rsvps_collection.find({"event_id": ObjectId(event_id)}))
    
    # Create CSV response
    output = []
    output.append(['Name', 'Email', 'Phone', 'Status', 'Guests', 'Dietary Restrictions', 'Comments', 'RSVP Date'])
    
    for rsvp in rsvps:
        user = users_collection.find_one({"_id": rsvp["user_id"]})
        if user:
            output.append([
                user.get("name", ""),
                user.get("email", ""),
                user.get("phone", ""),
                rsvp.get("status", ""),
                rsvp.get("guest_count", 0),
                rsvp.get("dietary_restrictions", ""),
                rsvp.get("comments", ""),
                rsvp.get("rsvp_date", "").strftime("%Y-%m-%d %H:%M") if rsvp.get("rsvp_date") else ""
            ])
    
    # Create response
    response = make_response('\n'.join([','.join([f'"{str(item)}"' for item in row]) for row in output]))
    response.headers['Content-Type'] = 'text/csv'
    response.headers['Content-Disposition'] = f'attachment; filename=rsvps_{event["title"].replace(" ", "_")}_{datetime.now().strftime("%Y%m%d")}.csv'
    
    return response

@app.route("/admin/notifications", methods=["GET", "POST"])
@admin_required_new
def admin_notifications():
    """Send notifications to users"""
    if request.method == "POST":
        notification_type = request.form["type"]
        subject = request.form["subject"]
        message = request.form["message"]
        target_users = request.form.getlist("target_users")
        
        if not target_users:
            flash("Please select at least one user.", "error")
            return redirect(url_for("admin_notifications"))
        
        # Send notifications
        sent_count = 0
        for user_id in target_users:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if user:
                try:
                    send_notification_email(user["email"], subject, message)
                    sent_count += 1
                except Exception as e:
                    print(f"Failed to send email to {user['email']}: {e}")
        
        flash(f"Notifications sent to {sent_count} users!", "success")
        return redirect(url_for("admin_notifications"))
    
    # Get all users for notification targeting
    users = list(users_collection.find({"is_active": True}, {"name": 1, "email": 1, "is_admin": 1}))
    
    return render_template("admin_notifications.html", users=users)

@app.route("/admin/settings", methods=["GET", "POST"])
@admin_required_new
def admin_settings():
    """Admin settings page"""
    if request.method == "POST":
        # Update settings (this would typically be stored in a settings collection)
        flash("Settings updated successfully!", "success")
        return redirect(url_for("admin_settings"))
    
    return render_template("admin_settings.html")

@app.route("/admin/analytics")
@admin_required_new
def admin_analytics():
    """Advanced analytics dashboard with real statistics"""
    # Get comprehensive statistics
    stats = {
        "total_users": users_collection.count_documents({}),
        "active_users": users_collection.count_documents({"is_active": True}),
        "total_events": events_collection.count_documents({}),
        "upcoming_events": events_collection.count_documents({"date": {"$gte": datetime.now()}}),
        "total_rsvps": rsvps_collection.count_documents({}),
        "total_jobs": jobs_collection.count_documents({"is_active": True}),
        "total_notifications": notifications_collection.count_documents({}),
        "admin_users": users_collection.count_documents({"is_admin": True}),
        "alumni_users": users_collection.count_documents({"is_admin": False, "is_active": True})
    }
    
    # Event attendance analytics
    event_attendance = list(events_collection.aggregate([
        {
            "$lookup": {
                "from": "rsvps",
                "localField": "_id",
                "foreignField": "event_id",
                "as": "rsvps"
            }
        },
        {
            "$project": {
                "title": 1,
                "date": 1,
                "capacity": 1,
                "category": 1,
                "location": 1,
                "total_rsvps": {"$size": "$rsvps"},
                "yes_rsvps": {
                    "$size": {
                        "$filter": {
                            "input": "$rsvps",
                            "cond": {"$eq": ["$$this.status", "Yes"]}
                        }
                    }
                },
                "maybe_rsvps": {
                    "$size": {
                        "$filter": {
                            "input": "$rsvps",
                            "cond": {"$eq": ["$$this.status", "Maybe"]}
                        }
                    }
                },
                "no_rsvps": {
                    "$size": {
                        "$filter": {
                            "input": "$rsvps",
                            "cond": {"$eq": ["$$this.status", "No"]}
                        }
                    }
                }
            }
        },
        {"$sort": {"date": -1}}
    ]))
    
    # User engagement analytics
    user_engagement = list(users_collection.aggregate([
        {
            "$lookup": {
                "from": "rsvps",
                "localField": "_id",
                "foreignField": "user_id",
                "as": "rsvps"
            }
        },
        {
            "$project": {
                "name": 1,
                "email": 1,
                "grad_year": 1,
                "is_active": 1,
                "total_rsvps": {"$size": "$rsvps"},
                "yes_rsvps": {
                    "$size": {
                        "$filter": {
                            "input": "$rsvps",
                            "cond": {"$eq": ["$$this.status", "Yes"]}
                        }
                    }
                },
                "last_rsvp": {"$max": "$rsvps.rsvp_date"},
                "created_at": 1
            }
        },
        {"$match": {"is_active": True, "is_admin": False}},
        {"$sort": {"total_rsvps": -1}},
        {"$limit": 10}
    ]))
    
    # Monthly event statistics
    monthly_stats = list(events_collection.aggregate([
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$date"},
                    "month": {"$month": "$date"}
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id.year": -1, "_id.month": -1}},
        {"$limit": 12}
    ]))
    
    # Category statistics
    category_stats = list(events_collection.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]))
    
    # Recent activity
    recent_events = list(events_collection.find().sort("created_at", -1).limit(5))
    recent_users = list(users_collection.find().sort("created_at", -1).limit(5))
    
    return render_template("admin_analytics.html", 
                           stats=stats,
                           event_attendance=event_attendance,
                           user_engagement=user_engagement,
                           monthly_stats=monthly_stats,
                           now=datetime.now()) # --- MODIFIED ---

@app.route("/admin/export/events")
@admin_required_new
def export_events_data():
    """Export all events data as CSV"""         # --- MODIFIED ---
    import csv
    from flask import make_response
    
    # Get all events
    events = list(events_collection.find().sort("created_at", -1))
    
    # Create CSV response
    output = []
    output.append(['Event ID', 'Title', 'Description', 'Date', 'Location', 'Capacity', 'Category', 'Created By', 'Created At', 'Total RSVPs', 'Yes RSVPs'])
    
    for event in events:
        # Get RSVP statistics for this event
        rsvps = list(rsvps_collection.find({"event_id": event["_id"]}))
        total_rsvps = len(rsvps)
        yes_rsvps = len([r for r in rsvps if r["status"] == "Yes"])
        
        # Get creator name
        creator = users_collection.find_one({"_id": event.get("created_by")})
        creator_name = creator.get("name", "Unknown") if creator else "Unknown"
        
        output.append([
            str(event["_id"]),
            event.get("title", ""),
            event.get("description", ""),
            event.get("date", "").strftime("%Y-%m-%d %H:%M") if event.get("date") else "",
            event.get("location", ""),
            event.get("capacity", 0),
            event.get("category", ""),
            creator_name,
            event.get("created_at", "").strftime("%Y-%m-%d %H:%M") if event.get("created_at") else "",
            total_rsvps,
            yes_rsvps
        ])
    
    # Create response
    response = make_response('\n'.join([','.join([f'"{str(item)}"' for item in row]) for row in output]))
    response.headers['Content-Type'] = 'text/csv'
    response.headers['Content-Disposition'] = f'attachment; filename=events_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    
    return response

@app.route("/admin/export/users")
@admin_required_new
def export_users_data():
    """Export all users data as CSV"""         # --- MODIFIED ---
    import csv
    from flask import make_response
    
    # Get all users
    users = list(users_collection.find().sort("created_at", -1))
    
    # Create CSV response
    output = []
    output.append(['User ID', 'Name', 'Email', 'Phone', 'Graduation Year', 'Is Admin', 'Is Active', 'Profile Picture', 'Bio', 'Skills', 'Interests', 'Created At', 'Last Login'])
    
    for user in users:
        skills_str = ', '.join(user.get("skills", []))
        interests_str = ', '.join(user.get("interests", []))
        
        output.append([
            str(user["_id"]),
            user.get("name", ""),
            user.get("email", ""),
            user.get("phone", ""),
            user.get("grad_year", ""),
            "Yes" if user.get("is_admin", False) else "No",
            "Yes" if user.get("is_active", True) else "No",
            user.get("profile_picture", ""),
            user.get("bio", ""),
            skills_str,
            interests_str,
            user.get("created_at", "").strftime("%Y-%m-%d %H:%M") if user.get("created_at") else "",
            user.get("last_login", "").strftime("%Y-%m-%d %H:%M") if user.get("last_login") else ""
        ])
    
    # Create response
    response = make_response('\n'.join([','.join([f'"{str(item)}"' for item in row]) for row in output]))
    response.headers['Content-Type'] = 'text/csv'
    response.headers['Content-Disposition'] = f'attachment; filename=users_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    
    return response

@app.route("/admin/export/rsvps")
@admin_required_new
def export_rsvps_data():
    """Export all RSVPs data as CSV"""
    import csv
    from flask import make_response
    
    # Get all RSVPs with user and event details
    rsvps = list(rsvps_collection.find().sort("rsvp_date", -1))
    
    # Create CSV response
    output = []
    output.append(['RSVP ID', 'User Name', 'User Email', 'Event Title', 'Event Date', 'Event Location', 'RSVP Status', 'Guest Count', 'Dietary Restrictions', 'Comments', 'RSVP Date'])
    
    for rsvp in rsvps:
        # Get user details
        user = users_collection.find_one({"_id": rsvp["user_id"]})
        user_name = user.get("name", "Unknown") if user else "Unknown"
        user_email = user.get("email", "Unknown") if user else "Unknown"
        
        # Get event details
        event = events_collection.find_one({"_id": rsvp["event_id"]})
        event_title = event.get("title", "Unknown") if event else "Unknown"
        event_date = event.get("date", "").strftime("%Y-%m-%d %H:%M") if event and event.get("date") else "Unknown"
        event_location = event.get("location", "Unknown") if event else "Unknown"
        
        output.append([
            str(rsvp["_id"]),
            user_name,
            user_email,
            event_title,
            event_date,
            event_location,
            rsvp.get("status", ""),
            rsvp.get("guest_count", 0),
            rsvp.get("dietary_restrictions", ""),
            rsvp.get("comments", ""),
            rsvp.get("rsvp_date", "").strftime("%Y-%m-%d %H:%M") if rsvp.get("rsvp_date") else ""
        ])
    
    # Create response
    response = make_response('\n'.join([','.join([f'"{str(item)}"' for item in row]) for row in output]))
    response.headers['Content-Type'] = 'text/csv'
    response.headers['Content-Disposition'] = f'attachment; filename=rsvps_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    
    return response

@app.route("/admin/backup")
@admin_required_new
def admin_backup():
    """Backup data"""
    # This would typically trigger a backup process
    flash("Backup process started. You will be notified when complete.", "info")
    return redirect(url_for("admin_dashboard"))

@app.route("/admin/logs")
@admin_required_new
def admin_logs():
    """View system logs"""
    # This would typically read from log files
    logs = []  # Placeholder for actual log reading
    return render_template("admin_logs.html", logs=logs)

# Additional Features
@app.route("/calendar")
@app.route("/calendar/<int:year>/<int:month>")
@general_login_required
def calendar_view(year=None, month=None):
    """Calendar view of events with month navigation"""
    current_user = get_current_user()
    
    # Get current date or specified month
    now = datetime.now()
    
    if year and month:
        # Use specified year and month
        try:
            start_of_month = datetime(year, month, 1, 0, 0, 0)
        except ValueError:
            # Handle invalid month/year
            flash("Invalid date selected", "error")
            return redirect(url_for("calendar_view"))
    else:
        # Use current month
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Calculate end of month
    if start_of_month.month == 12:
        end_of_month = datetime(start_of_month.year + 1, 1, 1) - timedelta(days=1)
    else:
        end_of_month = datetime(start_of_month.year, start_of_month.month + 1, 1) - timedelta(days=1)
    
    # Get events for the selected month
    events_raw = list(events_collection.find({
        "date": {"$gte": start_of_month, "$lte": end_of_month.replace(hour=23, minute=59, second=59)}
    }).sort("date", 1))
    
    # Convert ObjectIds to strings for JSON serialization
    events = []
    for event in events_raw:
        event_dict = {
            "_id": str(event["_id"]),
            "title": event.get("title", ""),
            "description": event.get("description", ""),
            "date": event.get("date").isoformat() if event.get("date") else "",
            "location": event.get("location", ""),
            "category": event.get("category", "General")
        }
        events.append(event_dict)
    
    # Calculate previous and next month for navigation
    if start_of_month.month == 1:
        prev_month = (start_of_month.year - 1, 12)
    else:
        prev_month = (start_of_month.year, start_of_month.month - 1)
        
    if start_of_month.month == 12:
        next_month = (start_of_month.year + 1, 1)
    else:
        next_month = (start_of_month.year, start_of_month.month + 1)
    
    return render_template("calendar.html", 
                           events=events, 
                           now=start_of_month,
                           prev_month=prev_month,
                           next_month=next_month)

@app.route("/search")
def search_events():
    """Advanced event search with improved functionality"""
    query = request.args.get('q', '')
    category = request.args.get('category', '')
    date_from = request.args.get('date_from', '')
    date_to = request.args.get('date_to', '')
    sort_by = request.args.get('sort', 'date')
    sort_order = request.args.get('order', 'asc')
    
    search_query = {}
    
    if query:
        search_query["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"location": {"$regex": query, "$options": "i"}},
            {"tags": {"$in": [query]}}
        ]
    
    if category:
        search_query["category"] = category
    
    if date_from:
        search_query["date"] = {"$gte": datetime.strptime(date_from, "%Y-%m-%d")}
    
    if date_to:
        if "date" in search_query:
            search_query["date"]["$lte"] = datetime.strptime(date_to, "%Y-%m-%d")
        else:
            search_query["date"] = {"$lte": datetime.strptime(date_to, "%Y-%m-%d")}
    
    # Determine sort order
    sort_direction = 1 if sort_order == 'asc' else -1
    sort_field = sort_by if sort_by in ['date', 'title', 'created_at'] else 'date'
    
    events = list(events_collection.find(search_query).sort(sort_field, sort_direction))
    categories = events_collection.distinct("category")
    
    # Log search activity
    if get_current_user():
        search_log = {
            "user_id": ObjectId(get_current_user().id),
            "query": query,
            "filters": {
                "category": category,
                "date_from": date_from,
                "date_to": date_to,
                "sort_by": sort_by,
                "sort_order": sort_order
            },
            "results_count": len(events),
            "searched_at": datetime.now()
        }
        # Store search log (you might want to create a search_logs collection)
        # search_logs_collection.insert_one(search_log)
    
    return render_template("search.html", 
                           events=events, 
                           query=query,
                           category=category,
                           date_from=date_from,
                           date_to=date_to,
                           sort_by=sort_by,
                           sort_order=sort_order,
                           categories=categories)

@app.route("/notifications")
@general_login_required
def user_notifications():
    """User notifications page"""
    current_user = get_current_user()
    
    # Get user's notifications
    notifications = list(notifications_collection.find({
        "user_id": ObjectId(current_user.id)
    }).sort("created_at", -1))
    
    # Mark all notifications as read when viewing the page
    notifications_collection.update_many(
        {"user_id": ObjectId(current_user.id), "read": False},
        {"$set": {"read": True, "read_at": datetime.now()}}
    )
    
    return render_template("notifications.html", notifications=notifications)

@app.route("/notifications/mark-read/<notification_id>", methods=["POST"])
@general_login_required
def mark_notification_read(notification_id):
    """Mark a specific notification as read"""
    current_user = get_current_user()
    notifications_collection.update_one(
        {"_id": ObjectId(notification_id), "user_id": ObjectId(current_user.id)},
        {"$set": {"read": True, "read_at": datetime.now()}}
    )
    return jsonify({"success": True})

@app.route("/notifications/mark-all-read", methods=["POST"])
@general_login_required
def mark_all_notifications_read():
    """Mark all notifications as read"""
    current_user = get_current_user()
    result = notifications_collection.update_many(
        {"user_id": ObjectId(current_user.id), "read": False},
        {"$set": {"read": True, "read_at": datetime.now()}}
    )
    return jsonify({"success": True, "count": result.modified_count})

@app.route("/api/events/upcoming")
def api_upcoming_events():
    """API endpoint for upcoming events"""
    limit = request.args.get('limit', 10, type=int)
    events = list(events_collection.find({
        "date": {"$gte": datetime.now()}
    }).sort("date", 1).limit(limit))
    
    # Convert ObjectId to string for JSON serialization
    for event in events:
        event['_id'] = str(event['_id'])
        if 'created_by' in event:
            event['created_by'] = str(event['created_by'])
        if 'assigned_alumni' in event:
            event['assigned_alumni'] = [str(alumni_id) for alumni_id in event.get('assigned_alumni', [])]
    
    return jsonify(events)

@app.route("/api/events/<event_id>/attendees")
@alumni_required
def api_event_attendees(event_id):
    """API endpoint for event attendees"""
    current_user = get_current_user()
    
    # Get RSVPs for the event
    rsvps = list(rsvps_collection.find({"event_id": ObjectId(event_id)}))
    
    attendees = []
    for rsvp in rsvps:
        user = users_collection.find_one({"_id": rsvp["user_id"]})
        if user:
            attendees.append({
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "grad_year": user.get("grad_year", ""),
                "status": rsvp.get("status", ""),
                "guest_count": rsvp.get("guest_count", 0)
            })
    
    return jsonify(attendees)

@app.route("/api/user/activity")
@general_login_required
def api_user_activity():
    """API endpoint for user activity data"""
    current_user = get_current_user()
    limit = request.args.get('limit', 10, type=int)
    
    activities = list(user_activity_collection.find({
        "user_id": ObjectId(current_user.id)
    }).sort("timestamp", -1).limit(limit))
    
    # Convert ObjectId to string for JSON serialization
    for activity in activities:
        activity['_id'] = str(activity['_id'])
        activity['user_id'] = str(activity['user_id'])
        if activity.get('timestamp'):
            activity['timestamp'] = activity['timestamp'].isoformat()
    
    return jsonify(activities)


# if __name__ == "__main__":
#     app.run(debug=True)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))