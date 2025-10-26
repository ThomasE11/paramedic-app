# AI Assistant Test Guide

## Overview
This guide will help you test the AI Assistant's email functionality to send a congratulations message to elias@twetemo.com.

## Test Scenario
**Objective**: Test the AI Assistant's ability to understand natural language commands and send emails to external recipients.

**Test Command**: "Send an email to elias@twetemo.com saying congratulations on your new achievement. I wish you all the best for the journey ahead of you."

## Manual Testing Steps

### Step 1: Access the Application
1. The application is already running at: **http://localhost:3004**
2. Your browser should have already opened to this URL
3. You'll be redirected to the sign-in page

### Step 2: Sign In
**Demo Mode Credentials:**
- Email: `elias@twetemo.com`
- Password: `test123`

Or use your database credentials if you have an account.

### Step 3: Navigate to AI Assistant
1. After signing in, you should be on the Dashboard
2. Look for the AI Assistant interface (usually labeled "AI Assistant", "Claudia", or "JARVIS")
3. It should have a text input field for entering commands

### Step 4: Enter the Test Command
In the AI Assistant input field, type:
```
Send an email to elias@twetemo.com saying congratulations on your new achievement. I wish you all the best for the journey ahead of you.
```

### Step 5: Monitor the Response
The AI will:
1. **Understand the command** - It will recognize this as an external email request
2. **Request confirmation** - It should show you what it plans to send before executing
3. **Display recipients** - Should show: `elias@twetemo.com`
4. **Show email preview** - Subject and message content

### Step 6: Confirm and Send
1. Click the "Confirm" or "Send" button
2. Wait for the success message
3. Check the email results:
   - **Sent**: 1
   - **Failed**: 0

### Step 7: Verify Activity Log
1. On the Dashboard, scroll to the "Recent Activities" section
2. Look for an entry showing:
   - Type: `external_email_sent`
   - Description: Subject line of your email
   - Recipient: `elias@twetemo.com`
   - Timestamp: Recent time

### Step 8: Check Email
1. Open the email inbox for `elias@twetemo.com`
2. Look for an email with:
   - **From**: `elias@twetemo.com` (via Gmail)
   - **Subject**: Something related to "Congratulations"
   - **Content**: Your personalized message
   - **Template**: Professional HCT branding

## AI Assistant Capabilities

### Supported Actions
Based on the code analysis, the AI Assistant can:

1. **send_email** - Send emails to students or external recipients
2. **send_external_email** - Specifically for non-student emails
3. **send_reminder** - Automated reminders
4. **get_info** - Retrieve student data and analytics
5. **create_assignment** - Generate tasks and deadlines
6. **schedule_class** - Class scheduling
7. **generate_report** - Academic reports and analytics
8. **manage_students** - Update student information
9. **analyze_data** - Performance analysis and insights
10. **create_group** - Smart grouping by criteria
11. **track_progress** - Monitor student advancement

### Email Intelligence
The AI can:
- **Distinguish between student and external emails**
- **Recognize @hct.ac.ae emails as staff/faculty**
- **Personalize emails with actual student names** (no placeholders)
- **Handle multilingual content** (English and Arabic)
- **Require confirmation before sending** (safety feature)
- **Track all email activity** in the database

### Natural Language Understanding
The AI understands:
- Conversational requests
- Educational terminology
- Module codes and student groups
- Implied meanings from context
- Informal language
- Synonyms and abbreviations

## Expected Result

### Successful Test Output:
```json
{
  "understood": true,
  "action": "send_external_email",
  "recipients": [
    {
      "id": "external",
      "name": "Elias Thomas",
      "email": "elias@twetemo.com",
      "module": "external"
    }
  ],
  "subject": "Congratulations on Your Achievement",
  "message": "Congratulations on your new achievement. I wish you all the best for the journey ahead of you.",
  "summary": "Sending congratulations email to elias@twetemo.com",
  "recipient_type": "external",
  "requiresConfirmation": true,
  "confirmationMessage": "I understand you want to send a congratulations email to elias@twetemo.com. Should I proceed?",
  "success": true,
  "emailResults": {
    "sent": 1,
    "failed": 0,
    "errors": []
  }
}
```

### Email Template Preview:
The email will be formatted with:
- **Header**: Purple gradient with "Message from Student Tracking System"
- **Subheader**: "HCT Al Ain EMS Program"
- **Greeting**: "Dear [Recipient Name],"
- **Message**: Your custom congratulations text
- **Signature**: "Best regards, Your HCT Al Ain EMS Instructor"
- **Footer**: "This is an automated message from Student Tracking System"

## Troubleshooting

### Issue: "Unauthorized" Error
**Solution**: Make sure you're logged in with valid credentials

### Issue: "Gemini API temporarily unavailable"
**Solution**: The AI service might be experiencing connectivity issues. Wait a moment and try again.

### Issue: Email not sent
**Possible causes**:
1. Gmail credentials not configured correctly
2. Gmail App Password invalid
3. Network connectivity issues

**Check**:
```bash
# Verify .env file has:
GMAIL_USER=elias@twetemo.com
GMAIL_APP_PASSWORD=xwjmwjeqxtzwklcr
GEMINI_API_KEY=AIzaSyCc33AyVI12qGHKjyijVmwytQf1lSsVrus
```

### Issue: AI doesn't understand command
**Solution**: Try rephrasing:
- "Email elias@twetemo.com to congratulate on their achievement"
- "Send external email to elias@twetemo.com with congratulations message"

## Common Test Commands

### Test 1: External Email (Your Test)
```
Send an email to elias@twetemo.com saying congratulations on your new achievement. I wish you all the best for the journey ahead of you.
```

### Test 2: Student Group Email
```
Send an email to all HEM3923 Responder students reminding them about tomorrow's class at 9 AM.
```

### Test 3: Information Query
```
How many students are in the Responder Practicum module?
```

### Test 4: Staff Email
```
Send an email to ethomas@hct.ac.ae to schedule a meeting about student progress.
```

## System Architecture

### Email Flow:
1. User enters command → AI Assistant API
2. Gemini AI processes command → Generates structured response
3. System validates recipients and action
4. Requests user confirmation (if required)
5. Sends emails via Gmail SMTP
6. Logs activity to database
7. Returns results to user

### Database Activity Tracking:
Every email sent is logged with:
- Type (external_email_sent or email_sent)
- Description (subject line)
- Metadata (recipient, sender, timestamp, language)
- Student ID (if applicable)

## Success Criteria

✅ AI understands the command correctly
✅ AI identifies elias@twetemo.com as external recipient
✅ AI generates appropriate subject and message
✅ Confirmation is requested before sending
✅ Email is sent successfully (emailResults.sent = 1)
✅ Activity is logged in the database
✅ Email arrives in the inbox with proper formatting

## Next Steps After Testing

If all tests pass:
1. Test with different email addresses
2. Test with student group emails
3. Test multilingual emails (Arabic)
4. Test error handling (invalid emails)
5. Test bulk emails (multiple recipients)

## Contact
If you encounter any issues during testing, check:
1. Server logs in the terminal
2. Browser console for frontend errors
3. Database activity table for email logs
4. Gmail account for delivery status

---
**Test Date**: $(date)
**Application URL**: http://localhost:3004
**Environment**: Development
