# JARVIS AI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Verify Environment (30 seconds)

Check that you have the required environment variable:

```bash
# In student_tracking_system/app/.env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 2: Start the Server (10 seconds)

```bash
cd student_tracking_system/app
npm run dev
```

### Step 3: Access Jarvis (10 seconds)

1. Open: http://localhost:3000
2. Click the **"AI Assistant"** button (or press `Cmd/Ctrl + J`)

### Step 4: Try Your First Command (1 minute)

Type one of these:

```
Show me all students
```

```
What's the system overview?
```

```
List HEM3923 students
```

### Step 5: Try an Action (2 minutes)

```
Email all HEM3923 students about tomorrow's class at 10AM
```

Jarvis will:
1. Identify the 6 HEM3923 students
2. Show you a preview
3. Ask for confirmation
4. Send personalized emails (after you confirm)

---

## 🎯 Most Useful Commands

### Information Queries (Instant)

```
How many students in HEM3923?
Show me ambulance 3 students
What's the average attendance?
List all modules
Who are my top performing students?
```

### Emails (Requires Confirmation)

```
Email all HEM3923 students about [topic]
Send reminder to students with low attendance
Email Fatima about tomorrow's practical
أرسل تذكير لجميع الطلاب عن الامتحان (Arabic)
```

### Reports & Analysis (Instant)

```
Generate attendance report for HEM3903
Show me performance analysis for responder students
Which students need attention?
Create grade report for ambulance students
```

### Student Management (Varies)

```
Create note for Mohammed about excellent performance
Group students by performance level
Show me students with attendance below 75%
```

### Assignments (Requires Confirmation)

```
Create PCR assignment for HEM3923 due Friday
Schedule practical session for ambulance students tomorrow at 2PM
```

---

## 💡 Tips for Success

### 1. Be Specific

❌ Don't: "Email students"
✅ Do: "Email all HEM3923 students about tomorrow's class"

### 2. Use Module Codes

- HEM3923 = Responder Practicum I
- HEM3903 = Ambulance Practicum III
- HEM2903 = Ambulance 1 Practical
- AEM230 = Apply Clinical Practicum

### 3. Review Before Confirming

Always check:
- Number of recipients
- Email subject
- Message content
- Module is correct

### 4. Use Natural Language

Jarvis understands:
- "responder students" → HEM3923
- "ambulance 3" → HEM3903
- "tomorrow" → calculates date
- "low attendance" → filters < 75%

### 5. Try Arabic Too!

```
أنشئ واجب للطلاب
أرسل تذكير عن الامتحان
اعرض لي طلاب HEM3923
```

---

## 🎓 Example Workflow

**Scenario: Weekly Check-in with Struggling Students**

**Step 1: Identify Students**
```
Show me students with attendance below 75% or grades below 70%
```

**Jarvis Response:**
```
Found 4 students matching criteria:
- Mohammed Al Shamsi (HEM3923): 68% attendance, 65% grade
- Fatima Al Mazrouei (HEM3903): 72% attendance, 68% grade
- ...
```

**Step 2: Document**
```
Create notes for each of these students documenting their performance
```

**Jarvis Actions:**
- Creates 4 individual notes
- Logs in activity feed
- Confirms completion

**Step 3: Reach Out**
```
Email them about scheduling a meeting to discuss support options
```

**Jarvis Preview:**
```
Subject: Academic Support - Let's Talk
Recipients: 4 students
[Shows personalized message preview]
Proceed? [Yes] [No]
```

**Result:** Complete intervention workflow in under 2 minutes!

---

## 🔧 Troubleshooting

### "I didn't understand that command"

**Solution:** Be more specific or use example commands from above

### "No recipients found"

**Solution:** Check module code is correct (HEM3923 not HEM3924)

### API Error

**Solutions:**
1. Check GEMINI_API_KEY in .env
2. Verify internet connection
3. Check server logs

---

## 📚 Learn More

- **Complete Guide:** See [JARVIS_AI_SYSTEM.md](JARVIS_AI_SYSTEM.md)
- **Implementation Details:** See [JARVIS_IMPLEMENTATION_SUMMARY.md](JARVIS_IMPLEMENTATION_SUMMARY.md)
- **JSON Fix:** See [JSON_PARSING_FIX.md](JSON_PARSING_FIX.md)

---

## 🎉 You're Ready!

Jarvis now knows:
- ✅ All your students
- ✅ All your modules
- ✅ All assignments and classes
- ✅ Attendance and grades
- ✅ Placements and site visits
- ✅ Everything in your system

Just ask in natural language and Jarvis will help!

**Start with:** "What can you help me with today?"

---

*JARVIS AI - Your Comprehensive Teaching Assistant* 🤖
