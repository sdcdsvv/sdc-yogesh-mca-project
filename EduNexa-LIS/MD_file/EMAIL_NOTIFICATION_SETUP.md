# Email Notification Setup & Fixes

## ✅ Fixed Issues:

### 1. Forgot Password Email
**Status:** FIXED ✅

**What was wrong:**
- Code had comment "In a real application, you would send an email here"
- Email was not being sent, only returning token in response

**What was fixed:**
- Added complete email sending functionality in `backend/routes/auth.py`
- Sends professional HTML email with reset link
- Link expires in 1 hour
- Includes both plain text and HTML versions

**Email includes:**
- Personalized greeting with user's name
- Reset password button/link
- Expiration warning (1 hour)
- Professional styling with EduNexa branding

---

### 2. Assignment Submission Notification
**Status:** ALREADY WORKING ✅

**Location:** `backend/routes/assignments.py` line 407

**What happens:**
When a student submits an assignment, the teacher receives:
- In-app notification
- Notification title: "New Assignment Submission"
- Message: "{Student Name} has submitted the assignment '{Assignment Title}'"
- Link to view the submission

**Email notification:** Currently only in-app, email can be added if needed.

---

### 3. Course Creation Notification
**Status:** NEEDS IMPLEMENTATION ⚠️

**Current state:** No notification sent when teacher creates a course

**Recommended implementation:**
- Notify admin/super_admin when new course is created
- Optionally notify enrolled students when course content is updated
- Email notification to department head

---

## 📧 Email Configuration Check:

### Current .env settings:
```
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_ADDRESS=your-yogesh.chauhan.ai@gmail.com
EMAIL_PASSWORD=wehs zbpq otgy hfbq
EMAIL_USE_TLS=true
ENABLE_EMAIL_NOTIFICATIONS=true
```

### ⚠️ IMPORTANT: Gmail App Password

The email password in .env appears to be a Gmail App Password (correct format).

**To verify it's working:**
1. Go to https://myaccount.google.com/apppasswords
2. Check if "EduNexa LMS" app password exists
3. If not, create a new one:
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → "EduNexa LMS"
   - Copy the 16-character password
   - Update EMAIL_PASSWORD in .env

**Gmail Requirements:**
- 2-Step Verification must be enabled on the Google account
- Use App Password, NOT regular Gmail password
- Format: 16 characters (4 groups of 4, spaces optional)

---

## 🧪 Testing Email Functionality:

### Test 1: Forgot Password
```bash
# Send request to forgot password endpoint
curl -X POST http://localhost:5010/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected result:**
- Response: "If an account with that email exists, a password reset link has been sent"
- Email should arrive within 1-2 minutes
- Check spam folder if not in inbox

### Test 2: Assignment Submission
1. Login as student
2. Go to any assignment
3. Submit the assignment
4. Teacher should receive in-app notification immediately
5. (Email notification can be added if needed)

---

## 🔧 Troubleshooting:

### If emails are not being sent:

1. **Check backend logs:**
   ```bash
   # Look for these messages:
   "Email sent successfully to {email}"
   "SMTP authentication failed"
   "Failed to send email"
   ```

2. **Test SMTP connection manually:**
   ```python
   # Run this in Python console:
   import smtplib
   server = smtplib.SMTP('smtp.gmail.com', 587)
   server.starttls()
   server.login('your-yogesh.chauhan.ai@gmail.com', 'wehs zbpq otgy hfbq')
   print("SMTP connection successful!")
   server.quit()
   ```

3. **Common issues:**
   - Gmail App Password expired or revoked
   - 2-Step Verification disabled
   - Gmail account locked due to suspicious activity
   - Firewall blocking port 587
   - Wrong email/password in .env

4. **Check Gmail account:**
   - Login to Gmail
   - Check for security alerts
   - Verify 2-Step Verification is ON
   - Check App Passwords list

---

## 📝 Adding Email to Course Creation:

If you want to add email notification when teacher creates a course:

```python
# In backend/routes/courses.py, after course creation:

# Send notification to admin
try:
    from services.notification_service import send_email
    
    # Get all admins
    admins = db.users.find({'role': {'$in': ['admin', 'super_admin']}})
    
    for admin in admins:
        if admin.get('email'):
            subject = f"New Course Created: {course_data['title']}"
            body = f"""
Hello {admin.get('name', 'Admin')},

A new course has been created on EduNexa LMS:

Course Title: {course_data['title']}
Created by: {user.get('name', 'Unknown')}
Category: {course_data.get('category', 'N/A')}
Difficulty: {course_data.get('difficulty', 'N/A')}

View course: http://localhost:3000/courses/{course_id}

Best regards,
EduNexa LMS Team
"""
            send_email(admin['email'], subject, body)
            
except Exception as e:
    print(f"Error sending course creation notification: {e}")
```

---

## ✅ Summary:

1. **Forgot Password Email:** ✅ FIXED - Now sends professional HTML email
2. **Assignment Submission:** ✅ WORKING - In-app notification working
3. **Course Creation:** ⚠️ Can be added if needed
4. **Email Config:** ✅ Properly configured (verify App Password)

## 🚀 Next Steps:

1. **Restart backend** to apply forgot password fix
2. **Test forgot password** with a real email
3. **Verify Gmail App Password** is valid
4. **Check backend logs** for email sending status
5. **Add course creation notification** if needed
