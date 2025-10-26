# AI Assistant - User Guide for Elias Thomas

## Quick Start

### How to Access
1. **Log in** to the Student Tracking System
2. **Navigate to** `/ai-assistant` page
3. **Start typing** your instructions in plain English!

**Direct URL:** `http://localhost:3000/ai-assistant` (local) or `https://your-domain.vercel.app/ai-assistant` (production)

---

## How to Use

### Just Type What You Want!

Instead of clicking through menus and forms, you can now simply type instructions like you would tell an assistant:

**Example 1: Send Email**
```
Send reminder to H00601771 about clinical logs
```

**Example 2: Create Note**
```
Add note to H00541639 that she needs to complete PCR documentation
```

**Example 3: Query Students**
```
Show me all students in AEM230 module
```

**Example 4: Send Encouragement**
```
Send encouragement to H00601771 about her excellent attendance
```

---

## Real Example (What You Just Did)

**You typed:**
```
ask this student how far they are with the clinical logs and if they
have made any submissions in the workbook, if they do not understand
how to fill out their clinical log they should come see me for guidance
-H00601771
```

**AI understood and:**
1. ✅ Found student H00601771 (Meera)
2. ✅ Generated professional email asking about clinical logs
3. ✅ Included offer for guidance
4. ✅ Signed with "Elias Thomas"
5. ✅ Sent the email
6. ✅ Added note to student profile
7. ✅ Logged activity in system

**Result:**
```
Subject: Checking In: Clinical Logs and Workbook
From: Elias Thomas
To: H00601771@hct.ac.ae

Dear Meera,

I hope this email finds you well.

I'm writing to check in on your progress with your clinical logs and
workbook submissions. How are you finding the process so far? Have you
had a chance to make any entries?

Please don't hesitate to reach out if you're encountering any difficulties
or have questions about filling out your clinical log. I'm happy to provide
guidance and support to ensure you understand the requirements.

Feel free to schedule a time to meet with me if you'd like to go over
anything together.

Best regards,

Elias Thomas
```

---

## Supported Instructions

### 1. Send Email to Student

**Format:**
```
Send [email_type] to [student_id] about [topic]
```

**Email Types:**
- `reminder` - For deadlines, tasks, submissions
- `encouragement` - For motivation, support
- `feedback` - For assignment/performance feedback
- `custom` - For anything else (just describe what you want)

**Examples:**
```
Send reminder to H00601771 about practicals
Send encouragement to H00541639 about great progress
Send feedback to H00600337 about PCR evaluation
Email H00601771 about clinical log progress and workbook submissions
```

### 2. Create Note on Student Profile

**Format:**
```
Add note to [student_id] [about/saying/that] [content]
```

**Examples:**
```
Add note to H00601771 about excellent attendance
Add note to H00541639 that she needs PCR review
Note for H00600337: Follow up on clinical placement
```

### 3. Query Students

**Format:**
```
Show [me] [criteria]
Find students [criteria]
```

**Examples:**
```
Show me all students in AEM230
Find students who need follow-up
Show me students with low attendance
```

---

## What Gets Added Automatically

You **don't** need to specify:

1. ✅ **Your name** - "Elias Thomas" is automatically added to all emails
2. ✅ **Your email** - elias.thomas@hct.ac.ae is set as sender
3. ✅ **Professional tone** - AI generates professional, supportive language
4. ✅ **Proper format** - Subject lines, greetings, signatures all handled
5. ✅ **Safety checks** - Duplicate prevention, rate limiting applied automatically

---

## Safety Features (Always Active)

### 1. Duplicate Prevention
- ✅ Won't send similar email to same student within 1 hour
- ✅ Checks subject line similarity
- ✅ Prevents accidental re-sends

**Example:**
```
You: "Send reminder to H00601771 about practicals"
[Email sent successfully]

You: "Send reminder to H00601771 about practicals" (5 minutes later)
❌ Blocked: "Duplicate email prevented: Similar email already sent 5 minutes ago"
```

### 2. Rate Limiting
- ✅ Minimum 5 seconds between emails
- ✅ Prevents rapid-fire sending
- ✅ Protects against accidental loops

### 3. Automatic Logging
- ✅ Every email logged in activity history
- ✅ Every note recorded with timestamp
- ✅ Complete audit trail maintained

### 4. Single Recipient Only
- ✅ One email per instruction
- ✅ No bulk operations without explicit confirmation
- ✅ Prevents mass emails

---

## Tips for Best Results

### 1. Always Include Student ID
✅ **Good:** "Send reminder to H00601771 about practicals"
❌ **Bad:** "Send reminder to Meera about practicals" (name matching unreliable)

### 2. Be Specific About Topic
✅ **Good:** "Ask H00601771 about clinical log progress and workbook submissions"
❌ **Bad:** "Email H00601771 about stuff"

### 3. Use Natural Language
✅ **Good:** "Check in with H00601771 about how she's doing with clinical logs"
✅ **Good:** "Remind H00541639 to schedule practicals this week"
✅ **Good:** "Encourage H00600337 after recent improvements"

### 4. You Can Be Casual
The AI will:
- Convert your casual instruction to professional email
- Add proper greetings and signatures
- Use appropriate tone

**Your instruction:**
```
tell H00601771 she needs to finish her clinical logs asap
```

**AI generates:**
```
Dear Meera,

I hope this email finds you well. I wanted to reach out regarding your
clinical logs. It's important that you complete these as soon as possible
to stay on track with your program requirements.

Please let me know if you need any assistance.

Best regards,
Elias Thomas
```

---

## Common Use Cases

### 1. Following Up on Missing Work
```
Remind H00601771 to submit her PCR documentation by Friday
```

### 2. Checking Progress
```
Ask H00541639 how her clinical placement is going
```

### 3. Offering Support
```
Send encouragement to H00600337 about recent improvements
```

### 4. Administrative Reminders
```
Remind H00601771 about upcoming site visit requirements
```

### 5. Documentation
```
Add note to H00541639 that she attended extra practice session
```

---

## What You'll See

After sending an instruction, the AI will show:

```
✅ Success!
Action: send_email
Message: Successfully executed: send_email

Result:
📧 Emails sent: 1/1
- Student: H00601771
- Name: Meera Mohammed Rashed Khalifa Alkaabi
- Subject: [Generated subject]
- Status: sent
```

Or if something goes wrong:

```
❌ Failed
Error: Duplicate email prevented: Similar email "Reminder: Schedule Practical
Sessions" was already sent 10/26/2025, 1:31:20 AM
```

---

## Troubleshooting

### "Student not found"
- ✅ Check student ID format (should be H00XXXXXX)
- ✅ Verify student exists in system
- ✅ Try exact ID from student list

### "Duplicate email prevented"
- ✅ This is working correctly (safety feature)
- ✅ Wait 1 hour before sending similar email
- ✅ Or modify the instruction to make it different

### "Rate limited"
- ✅ This is working correctly (safety feature)
- ✅ Wait 5 seconds between emails
- ✅ System will auto-retry after delay

---

## Mobile/Quick Access

You can also use this from:
- **Dashboard** - Add AI assistant widget
- **Student Profile** - Quick action button
- **Email tab** - Direct access to AI composer

---

## Privacy & Security

- ✅ All AI interactions logged for audit
- ✅ Only instructors can access AI assistant
- ✅ All emails sent from your official account
- ✅ Student data stays in your database
- ✅ AI only generates content, you control sending

---

## Examples from Your Real Usage

### What You Said → What Happened

**1. First Request (Practicals Reminder)**
```
You: "use the AI to remind the student with this student number H00601771
      to please make time to have practicals with me, sent the student
      and email and also add a note on their profile"

Result: ✅ Email sent + Note added
Subject: "Reminder: Schedule Practical Sessions"
```

**2. Second Request (Clinical Logs)**
```
You: "ask this student how far they are with the clinical logs and if
      they have made any submissions in the workbook, if they do not
      understand how to fill out their clinical log they should come
      see me for guidance -H00601771"

Result: ✅ Email sent + Note added
Subject: "Checking In: Clinical Logs and Workbook"
```

---

## Next Steps

1. **Access the UI:** Go to `/ai-assistant` page
2. **Try an instruction:** Use one of the examples
3. **Check result:** View the generated email and confirmation
4. **Review logs:** Check student profile for note and activity

---

**Remember:** The AI is your assistant! Just tell it what you want in plain English, and it will:
- Generate professional emails signed with your name
- Add proper notes to student profiles
- Log everything for audit trails
- Keep students safe with duplicate prevention

**Questions?** Just try it out - the worst that can happen is the AI asks for clarification! 🚀
