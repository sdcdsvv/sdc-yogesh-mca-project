"""
Enhanced Notification Service
Provides comprehensive email and in-app notification functionality for all user roles.
Supports user preferences, role-specific templates, and notification history.
"""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Email configuration from environment variables
SMTP_HOST = os.getenv("EMAIL_SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("EMAIL_SMTP_PORT", "587"))
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"
FROM_NAME = os.getenv("NOTIFICATION_FROM_NAME", "EduNexa LMS")

# Feature toggles
ENABLE_EMAIL_NOTIFICATIONS = os.getenv("ENABLE_EMAIL_NOTIFICATIONS", "true").lower() == "true"
ENABLE_IN_APP_NOTIFICATIONS = os.getenv("ENABLE_IN_APP_NOTIFICATIONS", "true").lower() == "true"


def get_user_notification_settings(db, user_id: str) -> Dict[str, bool]:
    """
    Get user's notification preferences.
    
    Args:
        db: MongoDB database instance
        user_id: User ID
        
    Returns:
        Dictionary with notification settings
    """
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return {"email_enabled": True, "in_app_enabled": True}
        
        settings = user.get("notification_settings", {})
        return {
            "email_enabled": settings.get("email_enabled", True),
            "in_app_enabled": settings.get("in_app_enabled", True)
        }
    except Exception as e:
        logger.error(f"Error fetching notification settings for user {user_id}: {e}")
        return {"email_enabled": True, "in_app_enabled": True}


def update_user_notification_settings(db, user_id: str, email_enabled: Optional[bool] = None, 
                                      in_app_enabled: Optional[bool] = None) -> bool:
    """
    Update user's notification preferences.
    
    Args:
        db: MongoDB database instance
        user_id: User ID
        email_enabled: Enable/disable email notifications
        in_app_enabled: Enable/disable in-app notifications
        
    Returns:
        True if updated successfully
    """
    try:
        update_data = {}
        if email_enabled is not None:
            update_data["notification_settings.email_enabled"] = email_enabled
        if in_app_enabled is not None:
            update_data["notification_settings.in_app_enabled"] = in_app_enabled
        
        if not update_data:
            return False
        
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        return result.modified_count > 0
    except Exception as e:
        logger.error(f"Error updating notification settings for user {user_id}: {e}")
        return False


def get_role_specific_template(role: str, template_type: str, context: Dict[str, Any]) -> Dict[str, str]:
    """
    Get role-specific email template.
    
    Args:
        role: User role (student, teacher, admin)
        template_type: Type of notification
        context: Template context variables
        
    Returns:
        Dictionary with subject, body, and html
    """
    templates = {
        "student": {
            "assignment_created": {
                "subject": "New Assignment: {title}",
                "body": """Hello {name},

A new assignment has been posted in your course "{course_title}".

Assignment: {title}
Due Date: {due_date}
Points: {points}

Please log in to view the assignment details and submit your work on time.

Best regards,
{from_name}""",
                "html": """<h2>New Assignment Posted</h2>
<p>Hello {name},</p>
<p>A new assignment has been posted in your course <strong>{course_title}</strong>.</p>
<ul>
<li><strong>Assignment:</strong> {title}</li>
<li><strong>Due Date:</strong> {due_date}</li>
<li><strong>Points:</strong> {points}</li>
</ul>
<p>Please log in to view the assignment details and submit your work on time.</p>
<p>Best regards,<br>{from_name}</p>"""
            },
            "assignment_graded": {
                "subject": "Assignment Graded: {title}",
                "body": """Hello {name},

Your assignment "{title}" has been graded.

Score: {score}/{max_points}
Feedback: {feedback}

Log in to view detailed feedback and improve your performance.

Best regards,
{from_name}""",
                "html": """<h2>Assignment Graded</h2>
<p>Hello {name},</p>
<p>Your assignment <strong>{title}</strong> has been graded.</p>
<ul>
<li><strong>Score:</strong> {score}/{max_points}</li>
<li><strong>Feedback:</strong> {feedback}</li>
</ul>
<p>Log in to view detailed feedback and improve your performance.</p>
<p>Best regards,<br>{from_name}</p>"""
            },
            "course_enrolled": {
                "subject": "Welcome to {course_title}",
                "body": """Hello {name},

You have been successfully enrolled in "{course_title}".

Start exploring the course materials and assignments to begin your learning journey.

Best regards,
{from_name}""",
                "html": """<h2>Course Enrollment Confirmed</h2>
<p>Hello {name},</p>
<p>You have been successfully enrolled in <strong>{course_title}</strong>.</p>
<p>Start exploring the course materials and assignments to begin your learning journey.</p>
<p>Best regards,<br>{from_name}</p>"""
            }
        },
        "teacher": {
            "assignment_submitted": {
                "subject": "New Submission: {title}",
                "body": """Hello {name},

A student has submitted an assignment in your course "{course_title}".

Assignment: {title}
Student: {student_name}
Submitted: {submitted_at}

Please review and grade the submission at your earliest convenience.

Best regards,
{from_name}""",
                "html": """<h2>New Assignment Submission</h2>
<p>Hello {name},</p>
<p>A student has submitted an assignment in your course <strong>{course_title}</strong>.</p>
<ul>
<li><strong>Assignment:</strong> {title}</li>
<li><strong>Student:</strong> {student_name}</li>
<li><strong>Submitted:</strong> {submitted_at}</li>
</ul>
<p>Please review and grade the submission at your earliest convenience.</p>
<p>Best regards,<br>{from_name}</p>"""
            },
            "course_enrollment": {
                "subject": "New Student Enrolled: {course_title}",
                "body": """Hello {name},

A new student has enrolled in your course "{course_title}".

Student: {student_name}
Enrolled: {enrolled_at}

Best regards,
{from_name}""",
                "html": """<h2>New Student Enrollment</h2>
<p>Hello {name},</p>
<p>A new student has enrolled in your course <strong>{course_title}</strong>.</p>
<ul>
<li><strong>Student:</strong> {student_name}</li>
<li><strong>Enrolled:</strong> {enrolled_at}</li>
</ul>
<p>Best regards,<br>{from_name}</p>"""
            }
        },
        "admin": {
            "course_created": {
                "subject": "New Course Created: {course_title}",
                "body": """Hello {name},

A new course has been created in the system.

Course: {course_title}
Teacher: {teacher_name}
Created: {created_at}

Best regards,
{from_name}""",
                "html": """<h2>New Course Created</h2>
<p>Hello {name},</p>
<p>A new course has been created in the system.</p>
<ul>
<li><strong>Course:</strong> {course_title}</li>
<li><strong>Teacher:</strong> {teacher_name}</li>
<li><strong>Created:</strong> {created_at}</li>
</ul>
<p>Best regards,<br>{from_name}</p>"""
            },
            "user_registered": {
                "subject": "New User Registration: {user_name}",
                "body": """Hello {name},

A new user has registered in the system.

Name: {user_name}
Email: {user_email}
Role: {user_role}
Registered: {registered_at}

Best regards,
{from_name}""",
                "html": """<h2>New User Registration</h2>
<p>Hello {name},</p>
<p>A new user has registered in the system.</p>
<ul>
<li><strong>Name:</strong> {user_name}</li>
<li><strong>Email:</strong> {user_email}</li>
<li><strong>Role:</strong> {user_role}</li>
<li><strong>Registered:</strong> {registered_at}</li>
</ul>
<p>Best regards,<br>{from_name}</p>"""
            }
        }
    }
    
    # Get template for role and type
    role_templates = templates.get(role, templates.get("student", {}))
    template = role_templates.get(template_type, {
        "subject": "Notification from {from_name}",
        "body": "You have a new notification. Please log in to view details.",
        "html": "<p>You have a new notification. Please log in to view details.</p>"
    })
    
    # Format template with context
    context["from_name"] = FROM_NAME
    try:
        return {
            "subject": template["subject"].format(**context),
            "body": template["body"].format(**context),
            "html": template["html"].format(**context)
        }
    except KeyError as e:
        logger.error(f"Missing template context key: {e}")
        return template


def send_email(to_address: str, subject: str, body: str, html: Optional[str] = None) -> Dict[str, Any]:
    """
    Send email via SMTP.
    
    Args:
        to_address: Recipient email address
        subject: Email subject
        body: Plain text email body
        html: Optional HTML email body
        
    Returns:
        Dictionary with success status and message
    """
    # Check if email notifications are enabled globally
    if not ENABLE_EMAIL_NOTIFICATIONS:
        logger.info("Email notifications are disabled globally")
        return {"success": False, "message": "Email notifications disabled globally"}
    
    # Check if email credentials are configured
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        logger.warning("Email credentials not configured")
        return {"success": False, "message": "Email credentials not configured"}
    
    # Validate recipient email
    if not to_address or '@' not in to_address:
        logger.error(f"Invalid email address: {to_address}")
        return {"success": False, "message": "Invalid email address"}
    
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{FROM_NAME} <{EMAIL_ADDRESS}>"
        msg["To"] = to_address
        msg["Subject"] = subject
        
        # Attach plain text body
        part_text = MIMEText(body, "plain")
        msg.attach(part_text)
        
        # Attach HTML body if provided
        if html:
            part_html = MIMEText(html, "html")
            msg.attach(part_html)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            if EMAIL_USE_TLS:
                server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, to_address, msg.as_string())
        
        logger.info(f"Email sent successfully to {to_address}")
        return {"success": True, "message": "Email sent successfully"}
        
    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP authentication failed")
        return {"success": False, "message": "SMTP authentication failed"}
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error: {e}")
        return {"success": False, "message": f"SMTP error: {str(e)}"}
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return {"success": False, "message": f"Failed to send email: {str(e)}"}


def create_in_app_notification(db, user_id: str, title: str, message: str, 
                               notification_type: str = "info", link: Optional[str] = None) -> bool:
    """
    Create an in-app notification.
    
    Args:
        db: MongoDB database instance
        user_id: User ID
        title: Notification title
        message: Notification message
        notification_type: Type (info, success, warning, error)
        link: Optional link
        
    Returns:
        True if created successfully
    """
    # Check if in-app notifications are enabled globally
    if not ENABLE_IN_APP_NOTIFICATIONS:
        logger.info("In-app notifications are disabled globally")
        return False
    
    try:
        notification = {
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": notification_type,
            "link": link,
            "read": False,
            "created_at": datetime.utcnow(),
            "read_at": None
        }
        
        db.notifications.insert_one(notification)
        logger.info(f"In-app notification created for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to create in-app notification: {e}")
        return False


def log_notification_history(db, user_id: str, notification_type: str, channel: str, 
                            status: str, details: Dict[str, Any]) -> bool:
    """
    Log notification delivery to history.
    
    Args:
        db: MongoDB database instance
        user_id: User ID
        notification_type: Type of notification
        channel: Delivery channel (email, in_app)
        status: Delivery status (sent, failed, skipped)
        details: Additional details
        
    Returns:
        True if logged successfully
    """
    try:
        history_entry = {
            "user_id": user_id,
            "notification_type": notification_type,
            "channel": channel,
            "status": status,
            "details": details,
            "timestamp": datetime.utcnow()
        }
        
        db.notification_history.insert_one(history_entry)
        return True
    except Exception as e:
        logger.error(f"Failed to log notification history: {e}")
        return False


def send_notification(db, user_id: str, notification_type: str, context: Dict[str, Any],
                     in_app_title: Optional[str] = None, in_app_link: Optional[str] = None) -> Dict[str, Any]:
    """
    Send notification to a user via email and/or in-app based on their preferences.
    
    Args:
        db: MongoDB database instance
        user_id: User ID
        notification_type: Type of notification (e.g., 'assignment_created')
        context: Template context variables
        in_app_title: Optional custom in-app notification title
        in_app_link: Optional link for in-app notification
        
    Returns:
        Dictionary with delivery results
    """
    result = {
        "email": {"sent": False, "message": ""},
        "in_app": {"sent": False, "message": ""}
    }
    
    try:
        # Get user details
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            logger.error(f"User not found: {user_id}")
            return result
        
        # Get user notification settings
        settings = get_user_notification_settings(db, user_id)
        
        # Add user name to context
        context["name"] = user.get("name", "User")
        
        # Get role-specific template
        role = user.get("role", "student")
        template = get_role_specific_template(role, notification_type, context)
        
        # Send email if enabled
        if settings["email_enabled"] and user.get("email"):
            email_result = send_email(
                user["email"],
                template["subject"],
                template["body"],
                template["html"]
            )
            result["email"] = email_result
            
            # Log email delivery
            log_notification_history(
                db, user_id, notification_type, "email",
                "sent" if email_result["success"] else "failed",
                {"subject": template["subject"], "error": email_result.get("message")}
            )
        else:
            result["email"]["message"] = "Email notifications disabled by user"
            log_notification_history(
                db, user_id, notification_type, "email", "skipped",
                {"reason": "User preference"}
            )
        
        # Send in-app notification if enabled
        if settings["in_app_enabled"]:
            in_app_success = create_in_app_notification(
                db, user_id,
                in_app_title or template["subject"],
                context.get("message", template["body"][:200]),
                context.get("type", "info"),
                in_app_link
            )
            result["in_app"] = {
                "sent": in_app_success,
                "message": "In-app notification created" if in_app_success else "Failed to create in-app notification"
            }
            
            # Log in-app delivery
            log_notification_history(
                db, user_id, notification_type, "in_app",
                "sent" if in_app_success else "failed",
                {"title": in_app_title or template["subject"]}
            )
        else:
            result["in_app"]["message"] = "In-app notifications disabled by user"
            log_notification_history(
                db, user_id, notification_type, "in_app", "skipped",
                {"reason": "User preference"}
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Error sending notification to user {user_id}: {e}")
        return result


def send_bulk_notification(db, user_ids: List[str], notification_type: str, 
                          context: Dict[str, Any]) -> Dict[str, int]:
    """
    Send notifications to multiple users.
    
    Args:
        db: MongoDB database instance
        user_ids: List of user IDs
        notification_type: Type of notification
        context: Template context variables
        
    Returns:
        Dictionary with success and failure counts
    """
    results = {
        "email_sent": 0,
        "email_failed": 0,
        "in_app_sent": 0,
        "in_app_failed": 0
    }
    
    for user_id in user_ids:
        result = send_notification(db, user_id, notification_type, context.copy())
        
        if result["email"]["sent"]:
            results["email_sent"] += 1
        else:
            results["email_failed"] += 1
        
        if result["in_app"]["sent"]:
            results["in_app_sent"] += 1
        else:
            results["in_app_failed"] += 1
    
    logger.info(f"Bulk notification sent: {results}")
    return results


def notify_by_role(db, roles: List[str], notification_type: str, context: Dict[str, Any]) -> Dict[str, int]:
    """
    Send notifications to all users with specific roles.
    
    Args:
        db: MongoDB database instance
        roles: List of roles
        notification_type: Type of notification
        context: Template context variables
        
    Returns:
        Dictionary with delivery statistics
    """
    try:
        users = list(db.users.find(
            {"role": {"$in": roles}, "is_active": True},
            {"_id": 1}
        ))
        
        user_ids = [str(user["_id"]) for user in users]
        return send_bulk_notification(db, user_ids, notification_type, context)
        
    except Exception as e:
        logger.error(f"Error sending notifications by role: {e}")
        return {"email_sent": 0, "email_failed": 0, "in_app_sent": 0, "in_app_failed": 0}
