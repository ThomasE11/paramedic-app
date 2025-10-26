# JARVIS AI System - Comprehensive Documentation

## Overview

The **JARVIS AI System** is a comprehensive, Jarvis-like artificial intelligence assistant for the HCT Al Ain EMS Student Tracking System. It provides full platform awareness, context understanding, and the ability to perform complex multi-step tasks across the entire system.

---

## 🎯 Key Features

### 1. **Complete System Awareness**
- Real-time access to ALL database tables
- Understands students, modules, classes, assignments, placements, attendance
- Tracks system statistics and recent activities
- Maintains conversation history and user preferences

### 2. **Natural Language Understanding**
- Processes commands in English and Arabic
- Understands context, intent, and implicit meanings
- Handles ambiguous queries intelligently
- Learns from conversation history

### 3. **Multi-Step Task Execution**
- Can perform complex workflows automatically
- Chains multiple actions together
- Handles dependencies and sequencing
- Provides progress updates

### 4. **18 Comprehensive Tools**
Organized into 6 categories:
- **Communication** (4 tools): Emails, reminders, announcements
- **Student Management** (3 tools): Updates, notes, grouping
- **Academic** (4 tools): Assignments, grading, scheduling, attendance
- **Placements** (2 tools): Site assignments, visit scheduling
- **Analytics** (3 tools): Reports, performance analysis, data export
- **System** (2 tools): Notifications, module management

### 5. **Advanced Memory System**
- Stores conversation history
- Learns user preferences (language, common actions, frequent modules)
- Maintains context across sessions
- Extracts entities (students, modules, topics) from conversations

### 6. **Smart Confirmation Flow**
- Requires user confirmation for sensitive actions
- Shows clear preview of what will happen
- Displays affected recipients and counts
- Allows cancellation before execution

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      JARVIS AI SYSTEM                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ Context Builder│  │  Memory System  │  │  Tools Library  │
│                │  │                 │  │                 │
│ - Full Context │  │ - Conversation  │  │ - 18 Tools      │
│ - Quick Context│  │ - Preferences   │  │ - Validation    │
│ - Statistics   │  │ - Entity Extract│  │ - Categories    │
└───────┬────────┘  └────────┬────────┘  └────────┬────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Action Executor   │
                    │                    │
                    │ - 18 Actions       │
                    │ - Result Handling  │
                    │ - Error Recovery   │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Gemini AI API    │
                    │  (gemini-2.0-flash)│
                    └────────────────────┘
```

### File Structure

```
lib/ai/
├── jarvis-context.ts      # System context builder
├── jarvis-actions.ts      # Action execution framework
├── jarvis-memory.ts       # Conversation & memory
└── jarvis-tools.ts        # Tools definitions

app/api/ai-assistant/
├── route.ts               # Legacy AI assistant
└── jarvis/
    └── route.ts           # Enhanced Jarvis route
```

---

## 📚 Core Modules

### 1. **jarvis-context.ts** - Context Builder

Builds comprehensive system context for AI decision-making.

**Key Functions:**

```typescript
// Full context with all data
buildJarvisContext(userId: string): Promise<JarvisContext>

// Quick context for faster responses
buildQuickContext(userId: string): Promise<Partial<JarvisContext>>
```

**JarvisContext Structure:**

```typescript
interface JarvisContext {
  students: StudentContext[];        // All students with performance data
  modules: ModuleContext[];          // Modules with statistics
  classes: ClassContext[];           // Recent classes
  assignments: AssignmentContext[];  // All assignments
  attendance: AttendanceContext[];   // Attendance summary
  placements: PlacementContext[];    // Clinical placements
  notes: NoteContext[];              // Student notes
  activities: ActivityContext[];     // Recent activities
  systemStats: SystemStats;          // System overview
  recentActivities: RecentActivity[];// Last 24h activities
  currentUser: UserContext;          // Current instructor
  currentDate: Date;                 // Timestamp
  academicPeriod: AcademicPeriod;   // Semester info
}
```

**Example Usage:**

```typescript
const context = await buildJarvisContext(userId);
console.log(`Total students: ${context.students.length}`);
console.log(`Average attendance: ${context.systemStats.averageAttendance}%`);
```

---

### 2. **jarvis-actions.ts** - Action Executor

Executes all AI-requested actions with proper validation and logging.

**Key Function:**

```typescript
executeAction(params: ExecuteActionParams): Promise<ActionResult>
```

**Supported Actions:**

| Action | Description | Confirmation Required |
|--------|-------------|---------------------|
| `send_email` | Send single email | ✅ Yes |
| `send_bulk_email` | Send to multiple recipients | ✅ Yes |
| `create_assignment` | Create new assignment | ✅ Yes |
| `update_student` | Update student info | ✅ Yes |
| `create_note` | Add note to profile | ❌ No |
| `schedule_class` | Schedule class session | ✅ Yes |
| `mark_attendance` | Record attendance | ✅ Yes |
| `grade_submission` | Grade assignment | ✅ Yes |
| `create_placement` | Assign placement | ✅ Yes |
| `schedule_site_visit` | Plan site visit | ✅ Yes |
| `generate_report` | Create report | ❌ No |
| `send_reminder` | Send reminders | ✅ Yes |
| `create_announcement` | Post announcement | ❌ No |
| `update_module` | Modify module | ✅ Yes |
| `export_data` | Export system data | ❌ No |
| `analyze_performance` | Performance analysis | ❌ No |
| `create_group` | Group students | ❌ No |
| `send_notification` | In-app notification | ❌ No |

**Example Result:**

```typescript
{
  success: true,
  message: "Sent 6 emails, 0 failed",
  affectedCount: 6,
  data: {
    sent: 6,
    failed: 0,
    errors: []
  }
}
```

---

### 3. **jarvis-memory.ts** - Memory & Conversation

Maintains conversation history and learns from interactions.

**Key Functions:**

```typescript
// Store message
storeMessage(userId, role, content, metadata): Promise<ConversationMessage>

// Get history
getConversationHistory(userId, limit): Promise<ConversationMessage[]>

// Extract entities from conversation
extractEntities(messages): { students, modules, topics }

// Build conversation context
buildConversationContext(userId): Promise<ConversationContext>

// Get user preferences
getUserPreferences(userId): Promise<UserPreferences>

// Learn from feedback
learnFromFeedback(messageId, feedback, details): Promise<void>
```

**Conversation Features:**

- **Entity Extraction**: Automatically identifies students, modules, topics from conversations
- **Preference Learning**: Tracks user's preferred language, common actions, frequent modules
- **Context Awareness**: References previous messages for continuity
- **Smart Summarization**: Generates conversation summaries

**Example:**

```typescript
const preferences = await getUserPreferences(userId);
// Returns:
{
  preferredLanguage: 'ar',  // User prefers Arabic
  commonActions: ['send_email', 'generate_report'],
  frequentModules: ['HEM3923', 'HEM3903']
}
```

---

### 4. **jarvis-tools.ts** - Tools Library

Comprehensive catalog of all AI capabilities.

**Key Functions:**

```typescript
// Get all tools
JARVIS_TOOLS: AITool[]

// Get by category
getToolsByCategory(category: string): AITool[]

// Get specific tool
getTool(name: string): AITool | undefined

// Search tools
searchTools(query: string): AITool[]

// Validate parameters
validateToolParameters(toolName, parameters): ValidationResult

// Format for AI prompt
formatToolsForPrompt(tools): string

// Suggest tools for query
suggestTools(query: string): AITool[]
```

**Tool Structure:**

```typescript
interface AITool {
  name: string;                    // Action name
  description: string;             // What it does
  parameters: AIToolParameter[];   // Required/optional params
  category: string;                // Tool category
  requiresConfirmation: boolean;   // Needs user approval?
  examples: string[];              // Example commands
}
```

**Categories:**
- `communication`: Email, reminders, announcements
- `student_management`: Updates, notes, grouping
- `academic`: Assignments, classes, grading
- `placements`: Site assignments, visits
- `analytics`: Reports, analysis, exports
- `system`: Notifications, module updates

---

## 🚀 Usage Guide

### Basic Commands

#### 1. **Send Emails**

```
Email all HEM3923 students about tomorrow's practical at 10AM
```

**AI Response:**
- Identifies HEM3923 module (Responder Practicum I)
- Finds all 6 students in that module
- Composes professional email
- Shows preview with recipient list
- Asks for confirmation
- Sends personalized emails

#### 2. **Create Assignments**

```
Create PCR documentation assignment for responder students, due Friday, worth 100 points
```

**AI Actions:**
- Creates assignment in HEM3923 module
- Sets due date to this Friday
- Sets total points to 100
- Logs activity
- Optionally emails students about new assignment

#### 3. **Generate Reports**

```
Show me performance report for ambulance 3 students
```

**AI Analysis:**
- Filters students in HEM3903
- Calculates average grade and attendance
- Identifies top performers
- Flags students needing attention
- Returns structured report

#### 4. **Manage Attendance**

```
Mark all students present for today's HEM2903 practical
```

**AI Actions:**
- Finds today's HEM2903 class
- Marks all enrolled students as present
- Records in database
- Logs activity

#### 5. **Multi-Language Support**

```
أرسل تذكير لجميع الطلاب عن الامتحان النهائي يوم الخميس
(Send reminder to all students about final exam on Thursday)
```

**AI Understands:**
- Arabic command
- Sends email in Arabic
- Proper formatting and cultural context

---

### Advanced Use Cases

#### 1. **Complex Filtering**

```
Email all students with attendance below 70% and grades below 75% about academic support
```

**AI Process:**
1. Filters students: `attendanceRate < 70 AND currentGrade < 75`
2. Finds 3 students matching criteria
3. Composes supportive message
4. Shows filtered list
5. Awaits confirmation
6. Sends personalized emails

#### 2. **Multi-Step Workflows**

```
Create assignment for responder students and email them about it
```

**AI Workflow:**
1. **Step 1**: Create assignment
   - Generate assignment in HEM3923
   - Get assignment ID
2. **Step 2**: Email students
   - Compose announcement email
   - Include assignment details and link
   - Send to all HEM3923 students

#### 3. **Context-Aware Queries**

**Conversation:**
```
User: Show me HEM3923 students
AI: [Lists 6 responder students]

User: Email them about tomorrow's class
AI: [References previous query, emails those 6 students]

User: Also create a note for the student with lowest attendance
AI: [Identifies student from previous list, creates note]
```

#### 4. **Smart Grouping**

```
Create study groups of 3-4 students each based on performance level
```

**AI Logic:**
1. Analyzes all students' performance
2. Groups by performance level: excellent, good, average, needs_improvement
3. Creates balanced groups of 3-4
4. Ensures diversity within groups
5. Returns group assignments

---

## 🔧 Configuration

### Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_database_connection_string

# Optional
AI_CONTEXT_LEVEL=full  # or 'quick' for faster responses
AI_MAX_TOKENS=8192     # Max tokens for AI response
```

### API Endpoints

**Primary Jarvis Endpoint:**
```
POST /api/ai-assistant/jarvis
```

**Request Body:**
```json
{
  "command": "Email all HEM3923 students about tomorrow's class",
  "contextLevel": "quick" | "full",  // optional, default: "quick"
  "confirmed": false,                 // true if confirming pending action
  "pendingAction": null               // action data if confirming
}
```

**Response (Awaiting Confirmation):**
```json
{
  "success": true,
  "understood": true,
  "awaitingConfirmation": true,
  "action": "send_bulk_email",
  "parameters": {
    "recipients": [...],
    "subject": "...",
    "message": "..."
  },
  "summary": "Sending email to 6 HEM3923 students",
  "confirmationMessage": "I'll email 6 responder students. Proceed?",
  "affectedCount": 6
}
```

**Response (Executed):**
```json
{
  "success": true,
  "understood": true,
  "action": "send_bulk_email",
  "message": "Sent 6 emails, 0 failed",
  "affectedCount": 6,
  "data": {
    "sent": 6,
    "failed": 0
  }
}
```

---

## 💡 Best Practices

### 1. **Be Specific When Possible**

❌ **Vague:**
```
Email students about class
```

✅ **Specific:**
```
Email all HEM3923 students about tomorrow's practical at 10AM in Lab 3
```

### 2. **Use Natural Language**

❌ **Robotic:**
```
execute: send_email, module: HEM3923, subject: class
```

✅ **Natural:**
```
Send a reminder to responder students about tomorrow's class
```

### 3. **Leverage Context**

✅ **Good:**
```
User: Show me responder students
AI: [Lists students]

User: Email them about assignment
AI: [Emails those students - understands "them" from context]
```

### 4. **Confirm Important Actions**

The AI will automatically require confirmation for:
- Sending emails
- Creating assignments
- Updating student data
- Scheduling classes

Always review the preview before confirming!

### 5. **Use Both Languages**

Jarvis seamlessly handles English and Arabic:

```
English: Create assignment for ambulance students
Arabic: أنشئ واجب لطلاب الإسعاف
Mixed: Email HEM3923 students باللغة العربية about الامتحان
```

---

## 🎓 Example Scenarios

### Scenario 1: Weekly Email Blast

**Goal**: Send weekly update to all students

**Command:**
```
Email all students about this week's schedule and important dates
```

**AI Actions:**
1. Identifies all students across all modules
2. Composes professional email with weekly schedule
3. Includes important dates from calendar
4. Shows preview with 60 recipients
5. Awaits confirmation
6. Sends 60 personalized emails
7. Logs activity

**Result**: All students notified in under 30 seconds

---

### Scenario 2: Performance Intervention

**Goal**: Identify and contact struggling students

**Commands:**
```
1. Show me students with attendance below 75% or grades below 70%

2. Create individual notes for each one documenting their performance

3. Email them about scheduling a meeting to discuss support options
```

**AI Workflow:**
1. **Analysis**: Filters 5 students matching criteria
2. **Documentation**: Creates performance notes for each
3. **Outreach**: Sends personalized support emails
4. **Logging**: Records all actions in activity log

**Result**: Proactive intervention completed in 2 minutes

---

### Scenario 3: Assignment Workflow

**Goal**: Create, announce, and track assignment

**Commands:**
```
1. Create PCR evaluation assignment for HEM3923, due next Friday, 100 points

2. Email all responder students about it with detailed instructions

3. Set reminder to follow up with students who haven't submitted 2 days before deadline
```

**AI Workflow:**
1. Creates assignment in database
2. Sends announcement email to 6 students
3. Schedules automated reminder
4. Tracks submissions
5. Sends follow-up to non-submitters

**Result**: Complete assignment lifecycle managed

---

## 🔒 Security & Safety

### Confirmation Requirements

**Always Requires Confirmation:**
- Bulk emails (>1 recipient)
- Data modifications (students, assignments)
- Scheduling changes
- Grade updates

**No Confirmation Needed:**
- Information queries
- Report generation
- Data exports
- Note creation

### Data Validation

1. **Parameter Validation**: All tool parameters validated before execution
2. **Entity Verification**: Students/modules verified to exist before actions
3. **Permission Checks**: User authorization validated
4. **Data Integrity**: Database constraints enforced

### Privacy

- Conversation history stored securely
- No sensitive data in logs
- Email content not logged (only metadata)
- User activity tracked for improvement

---

## 🐛 Troubleshooting

### Issue: "AI didn't understand my command"

**Solution:**
- Be more specific about what you want
- Mention module codes (HEM3923, HEM3903, etc.)
- Use complete sentences
- Check for typos

**Example:**
```
❌ "email responders"
✅ "Email all HEM3923 responder students about tomorrow's class"
```

---

### Issue: "No recipients found"

**Solution:**
- Verify module code is correct
- Check if students exist in that module
- Review filter criteria

**Example:**
```
User: Email HEM3924 students
AI: No students found in module HEM3924. Did you mean HEM3923 (Responder Practicum I)?
```

---

### Issue: "Action failed to execute"

**Solutions:**
1. Check database connection
2. Verify GEMINI_API_KEY is set
3. Check user permissions
4. Review console logs for details

---

## 📊 Performance Optimization

### Context Levels

**Quick Context** (Default - Fast):
- Students basic info
- Modules list
- Recent activities only
- ~500ms response time

**Full Context** (Comprehensive - Slower):
- All students with performance data
- All assignments, attendance, placements
- Full statistics
- ~2-3s response time

**When to use each:**
- **Quick**: Simple emails, information queries
- **Full**: Complex analysis, multi-step workflows, performance reports

### Caching Strategy

- Conversation history: Last 20 messages cached
- User preferences: Cached for session
- Entity extraction: Results cached per conversation
- System stats: Refreshed every 5 minutes

---

## 🚧 Future Enhancements

### Planned Features

1. **Voice Commands**: Speak to Jarvis
2. **Predictive Actions**: AI suggests actions based on patterns
3. **Automated Workflows**: Schedule recurring tasks
4. **Advanced Analytics**: Machine learning insights
5. **Mobile Integration**: Native app support
6. **Multi-Instructor**: Team collaboration features
7. **Student Portal**: Student-facing Jarvis
8. **External Integrations**: Canvas, Blackboard, Google Classroom

---

## 📞 Support

### Documentation
- This file: `JARVIS_AI_SYSTEM.md`
- API docs: `app/api/ai-assistant/jarvis/route.ts`
- Tools reference: `lib/ai/jarvis-tools.ts`

### Contact
- Technical issues: Check console logs
- Feature requests: Submit GitHub issue
- General questions: Refer to examples in this doc

---

## 🎉 Quick Start

1. **Set up environment variables:**
```bash
GEMINI_API_KEY=your_key_here
DATABASE_URL=your_db_url
```

2. **Access Jarvis in UI:**
- Click "AI Assistant" button
- Or use keyboard shortcut: `Cmd/Ctrl + J`

3. **Start with simple command:**
```
Show me all students in HEM3923
```

4. **Try an action:**
```
Email HEM3923 students about tomorrow's class at 10AM
```

5. **Explore capabilities:**
```
What can you do?
```

---

## 🏆 Summary

**JARVIS AI is your comprehensive assistant with:**

✅ Complete system awareness (students, modules, classes, assignments, placements)
✅ 18 powerful tools across 6 categories
✅ Natural language understanding (English & Arabic)
✅ Conversation memory and learning
✅ Multi-step task execution
✅ Smart confirmation flow
✅ Context-aware responses
✅ Performance analysis & reporting
✅ Bulk operations
✅ Intelligent filtering and grouping

**Use Jarvis to:**
- Save hours on repetitive tasks
- Communicate effectively with students
- Track performance and attendance
- Manage assignments and grading
- Coordinate placements and site visits
- Generate insights and reports
- Streamline administrative work

**Think of it as your:**
- Teaching assistant
- Administrative coordinator
- Data analyst
- Communication manager
- All in one!

---

*JARVIS AI System v1.0 - Built for HCT Al Ain EMS Program*
*Powered by Gemini 2.0 Flash & Advanced Context Understanding*
