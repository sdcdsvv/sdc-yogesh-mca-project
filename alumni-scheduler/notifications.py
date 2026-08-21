"""
Advanced notification system for Alumni Event Scheduler
Supports Email, SMS, and Push notifications with templates
"""
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from jinja2 import Template
import pytz

# Email providers
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

# SMS provider
try:
    from twilio.rest import Client as TwilioClient
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False

# Firebase Cloud Messaging
try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    FCM_AVAILABLE = True
except ImportError:
    FCM_AVAILABLE = False

from flask_mail import Mail as FlaskMail, Message
from config import Config

logger = logging.getLogger(__name__)

class NotificationTemplate:
    """Notification template handler"""
    
    def __init__(self):
        self.templates = {
            'event_created': {
                'subject': 'New Alumni Event: {{event_title}}',
                'email_body': '''
                <h2>New Alumni Event</h2>
                <p>Hello {{user_name}},</p>
                <p>A new event has been scheduled:</p>
                <h3>{{event_title}}</h3>
                <p><strong>Date:</strong> {{start_time}}</p>
                <p><strong>Location:</strong> {{venue}}</p>
                <p><strong>Description:</strong></p>
                <p>{{description}}</p>
                <p><a href="{{rsvp_link}}">RSVP Now</a></p>
                <p>Best regards,<br>Alumni Association</p>
                ''',
                'sms_body': 'New event: {{event_title}} on {{start_time}} at {{venue}}. RSVP: {{rsvp_link}}',
                'push_title': 'New Alumni Event',
                'push_body': '{{event_title}} - {{start_time}} at {{venue}}'
            },
            'rsvp_confirmation': {
                'subject': 'RSVP Confirmation: {{event_title}}',
                'email_body': '''
                <h2>RSVP Confirmation</h2>
                <p>Hello {{user_name}},</p>
                <p>Thank you for RSVPing <strong>{{status}}</strong> to:</p>
                <h3>{{event_title}}</h3>
                <p><strong>Date:</strong> {{start_time}}</p>
                <p><strong>Location:</strong> {{venue}}</p>
                {% if guests > 0 %}
                <p><strong>Guests:</strong> {{guests}}</p>
                {% endif %}
                {% if notes %}
                <p><strong>Notes:</strong> {{notes}}</p>
                {% endif %}
                <p><a href="{{event_link}}">View Event Details</a></p>
                <p>Best regards,<br>Alumni Association</p>
                ''',
                'sms_body': 'RSVP confirmed: {{status}} for {{event_title}} on {{start_time}}',
                'push_title': 'RSVP Confirmed',
                'push_body': 'You\'re {{status}} for {{event_title}}'
            },
            'event_reminder': {
                'subject': 'Event Reminder: {{event_title}}',
                'email_body': '''
                <h2>Event Reminder</h2>
                <p>Hello {{user_name}},</p>
                <p>Don't forget! This event is coming up soon:</p>
                <h3>{{event_title}}</h3>
                <p><strong>Date:</strong> {{start_time}}</p>
                <p><strong>Location:</strong> {{venue}}</p>
                <p><strong>Time until event:</strong> {{time_until}}</p>
                <p><a href="{{event_link}}">View Event Details</a></p>
                <p>Best regards,<br>Alumni Association</p>
                ''',
                'sms_body': 'Reminder: {{event_title}} in {{time_until}} at {{venue}}',
                'push_title': 'Event Reminder',
                'push_body': '{{event_title}} is in {{time_until}}'
            },
            'event_cancelled': {
                'subject': 'Event Cancelled: {{event_title}}',
                'email_body': '''
                <h2>Event Cancelled</h2>
                <p>Hello {{user_name}},</p>
                <p>We regret to inform you that the following event has been cancelled:</p>
                <h3>{{event_title}}</h3>
                <p><strong>Was scheduled for:</strong> {{start_time}}</p>
                <p><strong>Reason:</strong> {{cancellation_reason}}</p>
                <p>We apologize for any inconvenience.</p>
                <p>Best regards,<br>Alumni Association</p>
                ''',
                'sms_body': 'Event cancelled: {{event_title}} - {{cancellation_reason}}',
                'push_title': 'Event Cancelled',
                'push_body': '{{event_title}} has been cancelled'
            }
        }
    
    def render_template(self, template_name: str, template_type: str, variables: Dict[str, Any]) -> str:
        """Render a notification template with variables"""
        if template_name not in self.templates:
            raise ValueError(f"Template {template_name} not found")
        
        if template_type not in self.templates[template_name]:
            raise ValueError(f"Template type {template_type} not found in {template_name}")
        
        template_content = self.templates[template_name][template_type]
        template = Template(template_content)
        return template.render(**variables)

class EmailNotificationService:
    """Email notification service using SendGrid and Flask-Mail as fallback"""
    
    def __init__(self, config: Config):
        self.config = config
        self.template_handler = NotificationTemplate()
        
        # Initialize SendGrid if available
        if SENDGRID_AVAILABLE and config.SENDGRID_API_KEY:
            self.sendgrid_client = SendGridAPIClient(api_key=config.SENDGRID_API_KEY)
        else:
            self.sendgrid_client = None
            logger.warning("SendGrid not available, using Flask-Mail as fallback")
    
    def send_email(self, to_email: str, subject: str, html_content: str, 
                   text_content: str = None, from_email: str = None) -> bool:
        """Send email using SendGrid or Flask-Mail fallback"""
        try:
            if self.sendgrid_client:
                return self._send_via_sendgrid(to_email, subject, html_content, text_content, from_email)
            else:
                return self._send_via_flask_mail(to_email, subject, html_content, text_content, from_email)
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def _send_via_sendgrid(self, to_email: str, subject: str, html_content: str, 
                          text_content: str = None, from_email: str = None) -> bool:
        """Send email via SendGrid"""
        from_email = from_email or self.config.MAIL_USERNAME
        message = Mail(
            from_email=from_email,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        
        if text_content:
            message.plain_text_content = text_content
        
        response = self.sendgrid_client.send(message)
        return response.status_code in [200, 201, 202]
    
    def _send_via_flask_mail(self, to_email: str, subject: str, html_content: str, 
                            text_content: str = None, from_email: str = None) -> bool:
        """Send email via Flask-Mail (fallback)"""
        from flask import current_app
        from flask_mail import Message
        
        msg = Message(
            subject=subject,
            recipients=[to_email],
            html=html_content,
            sender=from_email or self.config.MAIL_USERNAME
        )
        
        if text_content:
            msg.body = text_content
        
        current_app.mail.send(msg)
        return True
    
    def send_template_email(self, to_email: str, template_name: str, variables: Dict[str, Any]) -> bool:
        """Send email using a template"""
        try:
            subject = self.template_handler.render_template(template_name, 'subject', variables)
            html_content = self.template_handler.render_template(template_name, 'email_body', variables)
            text_content = self.template_handler.render_template(template_name, 'sms_body', variables)
            
            return self.send_email(to_email, subject, html_content, text_content)
        except Exception as e:
            logger.error(f"Failed to send template email: {str(e)}")
            return False

class SMSNotificationService:
    """SMS notification service using Twilio"""
    
    def __init__(self, config: Config):
        self.config = config
        self.template_handler = NotificationTemplate()
        
        if TWILIO_AVAILABLE and config.TWILIO_SID and config.TWILIO_AUTH_TOKEN:
            self.twilio_client = TwilioClient(config.TWILIO_SID, config.TWILIO_AUTH_TOKEN)
        else:
            self.twilio_client = None
            logger.warning("Twilio not available")
    
    def send_sms(self, to_phone: str, message: str, from_phone: str = None) -> bool:
        """Send SMS via Twilio"""
        if not self.twilio_client:
            logger.error("Twilio client not initialized")
            return False
        
        try:
            from_phone = from_phone or self.config.TWILIO_PHONE_NUMBER
            message_obj = self.twilio_client.messages.create(
                body=message,
                from_=from_phone,
                to=to_phone
            )
            return message_obj.status in ['queued', 'sending', 'sent']
        except Exception as e:
            logger.error(f"Failed to send SMS to {to_phone}: {str(e)}")
            return False
    
    def send_template_sms(self, to_phone: str, template_name: str, variables: Dict[str, Any]) -> bool:
        """Send SMS using a template"""
        try:
            message = self.template_handler.render_template(template_name, 'sms_body', variables)
            return self.send_sms(to_phone, message)
        except Exception as e:
            logger.error(f"Failed to send template SMS: {str(e)}")
            return False

class PushNotificationService:
    """Push notification service using Firebase Cloud Messaging"""
    
    def __init__(self, config: Config):
        self.config = config
        self.template_handler = NotificationTemplate()
        
        if FCM_AVAILABLE and config.FCM_SERVER_KEY:
            # Initialize Firebase Admin SDK
            if not firebase_admin._apps:
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": "your-project-id",  # This should be in config
                    "private_key_id": "your-private-key-id",
                    "private_key": "your-private-key",
                    "client_email": "your-client-email",
                    "client_id": "your-client-id",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                })
                firebase_admin.initialize_app(cred)
            self.fcm_available = True
        else:
            self.fcm_available = False
            logger.warning("Firebase Cloud Messaging not available")
    
    def send_push_notification(self, device_tokens: List[str], title: str, body: str, 
                              data: Dict[str, str] = None) -> bool:
        """Send push notification via FCM"""
        if not self.fcm_available:
            logger.error("FCM not available")
            return False
        
        try:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                tokens=device_tokens
            )
            
            response = messaging.send_multicast(message)
            return response.success_count > 0
        except Exception as e:
            logger.error(f"Failed to send push notification: {str(e)}")
            return False
    
    def send_template_push(self, device_tokens: List[str], template_name: str, 
                          variables: Dict[str, Any]) -> bool:
        """Send push notification using a template"""
        try:
            title = self.template_handler.render_template(template_name, 'push_title', variables)
            body = self.template_handler.render_template(template_name, 'push_body', variables)
            return self.send_push_notification(device_tokens, title, body)
        except Exception as e:
            logger.error(f"Failed to send template push notification: {str(e)}")
            return False

class NotificationManager:
    """Main notification manager that coordinates all notification services"""
    
    def __init__(self, config: Config):
        self.config = config
        self.email_service = EmailNotificationService(config)
        self.sms_service = SMSNotificationService(config)
        self.push_service = PushNotificationService(config)
        self.template_handler = NotificationTemplate()
    
    def send_notification(self, user: Dict, notification_type: str, template_name: str, 
                         variables: Dict[str, Any], channels: List[str] = None) -> Dict[str, bool]:
        """Send notification through specified channels"""
        if channels is None:
            channels = ['email']  # Default to email only
        
        results = {}
        
        # Prepare common variables
        common_vars = {
            'user_name': user.get('name', 'Alumni'),
            'user_email': user.get('email', ''),
            **variables
        }
        
        # Send via email
        if 'email' in channels and self.config.ENABLE_EMAIL_NOTIFICATIONS:
            if user.get('preferences', {}).get('email', True):
                results['email'] = self.email_service.send_template_email(
                    user['email'], template_name, common_vars
                )
            else:
                results['email'] = False
                logger.info(f"Email notifications disabled for user {user['email']}")
        
        # Send via SMS
        if 'sms' in channels and self.config.ENABLE_SMS_NOTIFICATIONS:
            if user.get('preferences', {}).get('sms', False) and user.get('phone'):
                results['sms'] = self.sms_service.send_template_sms(
                    user['phone'], template_name, common_vars
                )
            else:
                results['sms'] = False
        
        # Send via push notification
        if 'push' in channels and self.config.ENABLE_PUSH_NOTIFICATIONS:
            if user.get('preferences', {}).get('push', True) and user.get('device_tokens'):
                results['push'] = self.push_service.send_template_push(
                    user['device_tokens'], template_name, common_vars
                )
            else:
                results['push'] = False
        
        return results
    
    def send_bulk_notification(self, users: List[Dict], template_name: str, 
                              variables: Dict[str, Any], channels: List[str] = None) -> Dict[str, int]:
        """Send notification to multiple users"""
        if channels is None:
            channels = ['email']
        
        results = {'success': 0, 'failed': 0, 'skipped': 0}
        
        for user in users:
            try:
                user_results = self.send_notification(user, 'bulk', template_name, variables, channels)
                
                # Check if any channel succeeded
                if any(user_results.values()):
                    results['success'] += 1
                else:
                    results['failed'] += 1
            except Exception as e:
                logger.error(f"Failed to send notification to user {user.get('email', 'unknown')}: {str(e)}")
                results['failed'] += 1
        
        return results
    
    def send_event_reminders(self, event: Dict, users: List[Dict], hours_before: int) -> Dict[str, int]:
        """Send event reminders to users"""
        # Calculate time until event
        now = datetime.utcnow()
        event_time = event['start_time']
        if isinstance(event_time, str):
            event_time = datetime.fromisoformat(event_time.replace('Z', '+00:00'))
        
        time_until = event_time - now
        time_until_str = f"{time_until.days} days, {time_until.seconds // 3600} hours"
        
        variables = {
            'event_title': event['title'],
            'start_time': event_time.strftime('%B %d, %Y at %I:%M %p'),
            'venue': event['venue'],
            'description': event.get('description', ''),
            'time_until': time_until_str,
            'event_link': f"{self.config.FRONTEND_URL}/events/{event['_id']}",
            'rsvp_link': f"{self.config.FRONTEND_URL}/events/{event['_id']}#rsvp"
        }
        
        return self.send_bulk_notification(users, 'event_reminder', variables)
