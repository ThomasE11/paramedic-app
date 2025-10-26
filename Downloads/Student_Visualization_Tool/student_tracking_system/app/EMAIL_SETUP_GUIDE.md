# Gmail Email Setup Guide

## Error: "535-5.7.8 Username and password not accepted"

This error occurs because the Gmail App Password is not configured correctly.

## Current Issue:
Your `.env` file has:
```env
GMAIL_USER=elias@twetemo.com
GMAIL_APP_PASSWORD="secure_password_here"  ← PLACEHOLDER, NOT A REAL PASSWORD
```

## Solution: Generate a Gmail App Password

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2FA if not already enabled
5. **IMPORTANT:** You MUST have 2FA enabled to create App Passwords

### Step 2: Generate an App Password

1. Go to: https://myaccount.google.com/apppasswords
   - OR go to Security → 2-Step Verification → Scroll down to "App passwords"

2. You may need to sign in again

3. In the "Select app" dropdown, choose **"Mail"**

4. In the "Select device" dropdown, choose **"Other (Custom name)"**
   - Enter: `HCT Student Tracker`

5. Click **GENERATE**

6. Google will show you a 16-character password like: `abcd efgh ijkl mnop`
   - **IMPORTANT:** Remove the spaces when copying

### Step 3: Update Your .env File

1. Open `/student_tracking_system/app/.env`

2. Replace the placeholder password:

```env
GMAIL_USER=elias@twetemo.com
GMAIL_APP_PASSWORD="abcdefghijklmnop"  ← Use the 16-char password WITHOUT SPACES
```

**Example:**
```env
# If Google shows: abcd efgh ijkl mnop
# Remove spaces and use: abcdefghijklmnop

GMAIL_USER=elias@twetemo.com
GMAIL_APP_PASSWORD="abcdefghijklmnop"
```

### Step 4: Restart the Server

After updating `.env`:

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

The environment variables are loaded on server startup, so you MUST restart.

### Step 5: Test Email Sending

1. Go to Assignments page
2. Open an evaluated submission
3. Click "Draft & Send Feedback Email"
4. Generate and send an email
5. Check your Gmail sent folder

---

## Troubleshooting

### If you still get "Username and password not accepted":

**Check 1: Spaces in Password**
```env
# ❌ WRONG - Has spaces
GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"

# ✅ CORRECT - No spaces
GMAIL_APP_PASSWORD="abcdefghijklmnop"
```

**Check 2: Quotes**
```env
# ✅ Both work:
GMAIL_APP_PASSWORD="abcdefghijklmnop"
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Check 3: Correct Gmail Address**
```env
# Make sure this is YOUR Gmail address
GMAIL_USER=elias@twetemo.com
```

**Check 4: 2FA is Enabled**
- App Passwords ONLY work if 2-Factor Authentication is enabled
- Check: https://myaccount.google.com/security

### If emails send but don't appear in sent folder:

This is normal for App Passwords. Emails sent via SMTP may not always appear in your Gmail sent folder, but they ARE being sent to recipients.

To verify emails are actually sending:
1. Send a test email to yourself
2. Check your inbox (not sent folder)
3. Or ask a student to confirm they received it

### Alternative: Check Server Logs

When an email is sent successfully, you'll see in the terminal:
```
Email sent successfully: <message-id>
```

When it fails, you'll see:
```
Email sending error: [error details]
```

---

## Security Notes

⚠️  **IMPORTANT:**
- Never commit your App Password to GitHub
- The `.env` file should be in `.gitignore`
- If password is exposed, revoke it at: https://myaccount.google.com/apppasswords
- Generate a new one

⚠️  **App Password vs Regular Password:**
- DO NOT use your regular Gmail password
- ALWAYS use an App Password (16 characters)
- Regular passwords will not work with SMTP

---

## Quick Checklist

- [ ] 2-Factor Authentication enabled on Gmail
- [ ] App Password generated at myaccount.google.com/apppasswords
- [ ] Password copied WITHOUT spaces
- [ ] .env file updated with correct password
- [ ] Server restarted (npm run dev)
- [ ] Test email sent successfully

---

## Still Having Issues?

If you continue to have problems:

1. **Revoke the old App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Find "HCT Student Tracker"
   - Click REMOVE

2. **Generate a fresh one:**
   - Repeat Step 2 above
   - Use a different custom name: "HCT Tracker v2"

3. **Check Gmail Security Settings:**
   - Go to: https://myaccount.google.com/security
   - Ensure "Less secure app access" is OFF (we're using App Passwords, not this)
   - Ensure 2FA is ON

4. **Verify Email in Code:**
   - Open `/lib/email.ts`
   - Confirm it's using the correct environment variables

---

## Current Configuration

Your email system is configured to use:

**SMTP Settings:**
- Service: Gmail
- Host: smtp.gmail.com
- Port: 587
- Secure: false (uses STARTTLS)
- Auth: App Password

**Email Templates:**
- Class Reminders
- Attendance Alerts
- General Messages
- **Feedback Emails** (newly added)

All emails are sent with:
- From: "HCT Student Tracker" <elias@twetemo.com>
- Professional HTML formatting
- Plain text fallback

---

After completing these steps, your email system will be fully functional!
