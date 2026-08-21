# Fix Password Reset Email Issue

## 🔍 Problem Identified:

Your `.env` file has:
```
EMAIL_ADDRESS=your-yogesh.chauhan.ai@gmail.com
```

The `your-` prefix is incorrect. It should be just the email address.

---

## ✅ Solution:

### Step 1: Fix Email Address in .env

Open `backend/.env` and change:

**FROM:**
```
EMAIL_ADDRESS=your-yogesh.chauhan.ai@gmail.com
```

**TO:**
```
EMAIL_ADDRESS=yogesh.chauhan.ai@gmail.com
```

### Step 2: Verify Gmail App Password

Make sure you have a valid Gmail App Password:

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → Type "EduNexa LMS"
   - Click "Generate"
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

3. **Update .env file:**
   ```
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```
   (Spaces are optional, can be: `xxxxxxxxxxxxxxxx`)

### Step 3: Test Email Configuration

Run the test script:
```bash
cd backend
python test_email.py
```

**Expected output:**
```
============================================================
EMAIL CONFIGURATION TEST
============================================================
SMTP Host: smtp.gmail.com
SMTP Port: 587
Email Address: yogesh.chauhan.ai@gmail.com
Password Set: Yes
Password Length: 16
============================================================

🔄 Testing SMTP connection...
✅ SMTP connection successful!
🔄 Testing authentication...
✅ Authentication successful!

============================================================
✅ EMAIL CONFIGURATION IS WORKING!
============================================================
```

### Step 4: Restart Backend

After fixing .env:
```bash
cd backend
python run.py
```

### Step 5: Test Password Reset

1. Go to: http://localhost:3000
2. Click "Forgot Password"
3. Enter a valid email from your database
4. Check inbox (and spam folder)

---

## 🔧 Troubleshooting:

### Issue 1: "Authentication failed"
**Solution:** 
- Regenerate App Password
- Make sure 2-Step Verification is ON
- Use the App Password, NOT your regular Gmail password

### Issue 2: "Email not received"
**Check:**
1. Spam/Junk folder
2. Backend logs for errors: `python run.py` (look for "Email sent successfully")
3. Email address exists in database
4. Gmail account not locked/suspended

### Issue 3: "SMTP connection timeout"
**Solution:**
- Check internet connection
- Check if port 587 is blocked by firewall
- Try port 465 with SSL instead of TLS

---

## 📧 Current Email Configuration:

```env
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_ADDRESS=yogesh.chauhan.ai@gmail.com  # ← Fix this (remove "your-")
EMAIL_PASSWORD=wehs zbpq otgy hfbq         # ← Verify this is valid
EMAIL_USE_TLS=true
ENABLE_EMAIL_NOTIFICATIONS=true
```

---

## ✅ Quick Fix Checklist:

- [ ] Remove "your-" from EMAIL_ADDRESS in .env
- [ ] Verify Gmail App Password is valid
- [ ] Run `python test_email.py` to test
- [ ] Restart backend server
- [ ] Test forgot password feature
- [ ] Check spam folder if email not in inbox

---

## 🎯 Expected Behavior:

When user clicks "Forgot Password" and enters email:

1. **Backend:** Creates reset token, saves to database
2. **Backend:** Sends email with reset link
3. **Backend logs:** Shows "Password reset email sent to {email}"
4. **User:** Receives email within 1-2 minutes
5. **Email:** Contains button "Reset Your Password"
6. **Link:** Valid for 1 hour

---

## 📝 Test with Real Email:

```bash
# Test forgot password API directly
curl -X POST http://localhost:5010/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected response:**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

**Check backend logs for:**
```
Password reset email sent to test@example.com
```

OR

```
Failed to send password reset email to test@example.com
SMTP authentication failed
```

---

## 🚀 After Fix:

Once email is working, you'll see beautiful professional emails with:
- EduNexa branding
- Purple-blue gradient header
- "Reset Password" button
- Expiration warning
- Security tips
- Professional footer

The email template is already implemented and looks great! Just need to fix the configuration.
