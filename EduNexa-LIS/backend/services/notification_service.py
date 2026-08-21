"""
Gmail Notification Service
Provides email notification functionality for all user roles.
Uses Gmail SMTP with environment variable configuration.
"""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional, Dict, Any
from bson import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Email configuration from environment variables
SMTP_HOST = os.getenv("EMAIL_SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("EMAIL_SMTP_PORT", "587"))
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"


def validate_email(email: str) -> bool:
    """
    Validate email address format.
    
    Args:
        email: Email address to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not email or '@' not in email:
        return False
    return True


def send_email(to_address: str, subject: str, body: str, html: Optional[str] = None) -> bool:
    """
    Send email via Gmail SMTP.
    
    Args:
        to_address: Recipient email address
        subject: Email subject
        body: Plain text email body
        html: Optional HTML email body
        
    Returns:
        True if email sent successfully, False otherwise
    """
    # Check if email credentials are configured
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        logger.warning("Email credentials not configured. Skipping email send.")
        return False
    
    # Validate recipient email
    if not validate_email(to_address):
        logger.error(f"Invalid email address: {to_address}")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["From"] = EMAIL_ADDRESS
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
        return True
        
    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP authentication failed. Check EMAIL_ADDRESS and EMAIL_PASSWORD.")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error occurred: {e}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email to {to_address}: {e}")
        return False


def notify_users_by_role(
    db,
    roles: List[str],
    subject: str,
    body: str,
    html: Optional[str] = None,
    extra_filter: Optional[Dict[str, Any]] = None
) -> Dict[str, int]:
    """
    Send email notifications to users with specific roles.
    
    Args:
        db: MongoDB database instance
        roles: List of user roles to notify (e.g., ['student', 'teacher', 'admin'])
        subject: Email subject
        body: Plain text email body
        html: Optional HTML email body
        extra_filter: Optional additional MongoDB filter criteria
        
    Returns:
        Dictionary with success and failure counts
    """
    # Build query filter
    query = {"role": {"$in": roles}, "is_active": True}
    if extra_filter:
        query.update(extra_filter)
    
    # Fetch users from database
    try:
        users = list(db.users.find(query, {"email": 1, "name": 1}))
    except Exception as e:
        logger.error(f"Failed to fetch users from database: {e}")
        return {"success": 0, "failed": 0}
    
    if not users:
        logger.warning(f"No users found with roles {roles}")
        return {"success": 0, "failed": 0}
    
    # Send emails
    success_count = 0
    failed_count = 0
    
    for user in users:
        email = user.get("email")
        if not email:
            failed_count += 1
            continue
        
        # Personalize body with user name if available
        personalized_body = body
        if user.get("name"):
            personalized_body = f"Hello {user['name']},\n\n{body}"
        
        if send_email(email, subject, personalized_body, html):
            success_count += 1
        else:
            failed_count += 1
    
    logger.info(f"Notification sent: {success_count} success, {failed_count} failed")
    return {"success": success_count, "failed": failed_count}


def notify_user_by_id(
    db,
    user_id: str,
    subject: str,
    body: str,
    html: Optional[str] = None
) -> bool:
    """
    Send email notification to a specific user by ID.
    
    Args:
        db: MongoDB database instance
        user_id: User's MongoDB ObjectId as string
        subject: Email subject
        body: Plain text email body
        html: Optional HTML email body
        
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)}, {"email": 1, "name": 1})
        if not user:
            logger.error(f"User not found: {user_id}")
            return False
        
        email = user.get("email")
        if not email:
            logger.error(f"User {user_id} has no email address")
            return False
        
        # Personalize body with user name if available
        personalized_body = body
        if user.get("name"):
            personalized_body = f"Hello {user['name']},\n\n{body}"
        
        return send_email(email, subject, personalized_body, html)
        
    except Exception as e:
        logger.error(f"Failed to notify user {user_id}: {e}")
        return False


def notify_course_participants(
    db,
    course_id: str,
    subject: str,
    body: str,
    html: Optional[str] = None,
    include_teacher: bool = True
) -> Dict[str, int]:
    """
    Send email notifications to all participants of a course.
    
    Args:
        db: MongoDB database instance
        course_id: Course MongoDB ObjectId as string
        subject: Email subject
        body: Plain text email body
        html: Optional HTML email body
        include_teacher: Whether to include the course teacher
        
    Returns:
        Dictionary with success and failure counts
    """
    try:
        # Get course
        course = db.courses.find_one({"_id": ObjectId(course_id)})
        if not course:
            logger.error(f"Course not found: {course_id}")
            return {"success": 0, "failed": 0}
        
        # Get enrolled students
        enrollments = list(db.enrollments.find({"course_id": course_id}))
        student_ids = [enrollment["student_id"] for enrollment in enrollments]
        
        # Build user IDs list
        user_ids = student_ids.copy()
        if include_teacher and course.get("teacher_id"):
            user_ids.append(course["teacher_id"])
        
        # Fetch users
        users = list(db.users.find(
            {"_id": {"$in": [ObjectId(uid) for uid in user_ids]}, "is_active": True},
            {"email": 1, "name": 1}
        ))
        
        # Send emails
        success_count = 0
        failed_count = 0
        
        for user in users:
            email = user.get("email")
            if not email:
                failed_count += 1
                continue
            
            # Personalize body
            personalized_body = body
            if user.get("name"):
                personalized_body = f"Hello {user['name']},\n\n{body}"
            
            if send_email(email, subject, personalized_body, html):
                success_count += 1
            else:
                failed_count += 1
        
        logger.info(f"Course notification sent: {success_count} success, {failed_count} failed")
        return {"success": success_count, "failed": failed_count}
        
    except Exception as e:
        logger.error(f"Failed to notify course participants: {e}")
        return {"success": 0, "failed": 0}
