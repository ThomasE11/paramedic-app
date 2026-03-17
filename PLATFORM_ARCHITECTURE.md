# UAE Paramedic Case Generator: Dual Platform Architecture
## Student Interactive Platform + Instructor Management Platform

---

## 1. Platform Overview

### Current State
Single instructor-focused tool: generates cases, displays vitals, allows treatment.

### Proposed Architecture
Two distinct but interconnected interfaces:

```
+----------------------------------+     +----------------------------------+
|     INSTRUCTOR PLATFORM          |     |     STUDENT PLATFORM             |
|  (Planning & Administration)     |     |  (Interactive Case Simulation)   |
+----------------------------------+     +----------------------------------+
|                                  |     |                                  |
|  Case Library & Creation         |<--->|  Case Selection / Assignment     |
|  ECG Library & Review            |     |  Timed Case Simulation           |
|  Student Management              |     |  LIFEPAK Monitor Interface       |
|  Performance Analytics           |     |  Treatment Decision-Making       |
|  Case Assignment                 |     |  Automated Debrief & Feedback    |
|  Resource Curation               |     |  Performance History             |
|  Grading & Feedback              |     |  Learning Resources              |
|                                  |     |                                  |
+----------------------------------+     +----------------------------------+
            |                                        |
            +------------- Shared Backend -----------+
            |  Case Database  |  User Auth  |  Analytics  |
            +------------------------------------------------+
```

---

## 2. Student Platform: Detailed Design

### 2.1 Student Dashboard (Home Screen)
```
+----------------------------------------------------------+
|  Welcome, [Student Name]         Year: 3rd Year          |
|  Cases Completed: 12/25   Average Score: 78%             |
+----------------------------------------------------------+
|                                                          |
|  [Start New Case]  [Continue Case]  [Review History]     |
|                                                          |
|  +-- Assigned Cases (from Instructor) --+                |
|  | Case 1: Cardiac Emergency    DUE: Today              |
|  | Case 2: Trauma MVA           DUE: Friday             |
|  +--------------------------------------+                |
|                                                          |
|  +-- Self-Practice (Choose Your Own) ---+                |
|  | Filter: Category | Difficulty | Year                  |
|  | [Generate Random]  [Browse Library]                   |
|  +--------------------------------------+                |
|                                                          |
|  +-- Performance Summary ---------------+                |
|  | Strengths: Airway management, ECG recognition         |
|  | Needs work: Treatment timing, Medication dosing       |
|  | Recent: 85% (STEMI) | 72% (Trauma) | 91% (Resp)     |
|  +--------------------------------------+                |
+----------------------------------------------------------+
```

### 2.2 Case Simulation Flow (Student Experience)

```
Step 1: CASE SELECTION
  - Instructor-assigned case (mandatory)
  - Self-selected from library (practice)
  - Random generation by category/year

Step 2: BRIEFING SCREEN
  - Dispatch information only (no clinical details yet)
  - "START CASE" button
  - Timer begins on click (CANNOT go back)
  - Student acknowledges: "I understand this is a timed simulation"

Step 3: SCENE ARRIVAL
  - Scene description revealed
  - Hazards assessment prompt
  - General impression of patient
  - Student must perform structured ABCDE assessment
  - Each assessment step reveals information progressively
  - Time stamps recorded for each action

Step 4: LIFEPAK MONITOR INTERFACE
  - Full LIFEPAK 20 simulator (as currently built)
  - Waveforms respond to patient condition
  - Student must connect leads, SpO2, etc.
  - 12-lead ECG available when requested
  - Vitals change based on:
    a) Deterioration timeline (untreated patient gets worse)
    b) Student's treatment decisions
    c) Elapsed time

Step 5: TREATMENT DECISIONS
  - Student selects treatments from categorized list
  - Each treatment is timestamped
  - Monitor reflects treatment effects (O2 -> SpO2 improves)
  - Wrong treatments have consequences (GTN in RV infarct -> BP drops)
  - Student can request consultation, call for backup, etc.
  - Transport decision: which facility, pre-alert content

Step 6: CASE COMPLETION
  - Case auto-completes based on:
    a) Patient stabilized (vitals in acceptable range)
    b) Handover at hospital
    c) Patient deteriorated to arrest -> CPR scenario
    d) Maximum time elapsed (20 minutes)
  - Student cannot skip steps or abort mid-case

Step 7: AUTOMATED DEBRIEF & SCORING
  (See Section 2.3 below)
```

### 2.3 Automated Debrief System

The debrief generates automatically after case completion, analyzing:

#### Performance Metrics
```
+-- CASE REPORT: Inferior STEMI with RV Infarction ---------+
|                                                            |
|  Overall Score: 82/100                   Grade: B+         |
|  Time to Complete: 14:32                                   |
|                                                            |
|  +-- TIMING ANALYSIS --------------------------------+     |
|  | Time to first assessment:     0:45  (Target: <1min) OK  |
|  | Time to identify hypoxia:     1:22  (Target: <2min) OK  |
|  | Time to apply oxygen:         1:45  (Target: <2min) OK  |
|  | Time to obtain ECG:           3:15  (Target: <3min) SLOW|
|  | Time to identify STEMI:       4:02  (Target: <5min) OK  |
|  | Time to give aspirin:         5:30  (Target: <5min) SLOW|
|  | Time to pre-alert hospital:   8:10  (Target: <7min) LATE|
|  +---------------------------------------------------+     |
|                                                            |
|  +-- TREATMENT ANALYSIS ------------------------------+    |
|  | CORRECT ACTIONS:                                    |    |
|  |   + High-flow oxygen applied                        |    |
|  |   + IV access established                           |    |
|  |   + Aspirin 300mg administered                      |    |
|  |   + 12-lead ECG obtained                            |    |
|  |   + STEMI correctly identified                      |    |
|  |                                                     |    |
|  | AREAS FOR IMPROVEMENT:                              |    |
|  |   ! GTN administered BEFORE checking V4R            |    |
|  |     -> This is dangerous in RV infarction           |    |
|  |     -> Patient's BP dropped to 60/35                |    |
|  |     -> Correct: Check V4R first, avoid nitrates     |    |
|  |                                                     |    |
|  |   ! Fluid bolus delayed (given at 9 minutes)        |    |
|  |     -> Hypotensive patient needed fluids earlier     |    |
|  |                                                     |    |
|  | MISSED ACTIONS:                                     |    |
|  |   x Did not perform V4R (RV infarct not confirmed)  |    |
|  |   x Did not prepare transcutaneous pacing           |    |
|  |   x Pre-alert was delayed                           |    |
|  +---------------------------------------------------+     |
|                                                            |
|  +-- LEARNING OUTCOMES MET ---------------------------+    |
|  | [x] Can perform systematic ABCDE assessment         |    |
|  | [x] Can identify STEMI on 12-lead ECG               |    |
|  | [ ] Understands RV infarction management            |    |
|  | [x] Can establish IV access and administer meds     |    |
|  | [ ] Appropriate pre-hospital communication          |    |
|  +---------------------------------------------------+     |
|                                                            |
|  +-- FURTHER READING ---------------------------------+    |
|  | 1. LITFL: RV Infarction                             |    |
|  |    https://litfl.com/right-ventricular-infarction/   |    |
|  | 2. AHA STEMI Guidelines 2013                        |    |
|  |    (Section on RV involvement)                      |    |
|  | 3. Paramedic Protocol: Acute Coronary Syndrome      |    |
|  |    DHA Clinical Practice Guidelines                 |    |
|  +---------------------------------------------------+     |
+------------------------------------------------------------+
```

#### Scoring Algorithm
```
Score = Sum of:
  - Checklist items completed (weighted by importance)
  - Timing penalties (late recognition, delayed treatment)
  - Treatment appropriateness (correct drugs, doses, contraindications)
  - Critical action bonuses (life-saving interventions)
  - Communication score (pre-alert quality, handover content)

Deductions:
  - Harmful actions (GTN in RV infarct, aggressive fluids in PE)
  - Missed critical findings (blown pupil, DVT, AV fistula)
  - Time penalties (>2min late on critical actions)
```

---

## 3. Instructor Platform: Detailed Design

### 3.1 Instructor Dashboard
```
+----------------------------------------------------------+
|  Instructor: [Name]              TW Recruitment           |
+----------------------------------------------------------+
|                                                          |
|  +-- Quick Actions ----------------------------------+    |
|  | [Create Case] [Assign Cases] [View Reports]       |    |
|  | [ECG Library] [Clinical Resources] [Settings]     |    |
|  +--------------------------------------------------+    |
|                                                          |
|  +-- Student Overview --------------------------------+   |
|  | Active Students: 24                                |   |
|  | Cases Completed This Week: 47                      |   |
|  | Average Score: 74%                                 |   |
|  | Students Needing Attention: 3                      |   |
|  +--------------------------------------------------+    |
|                                                          |
|  +-- Recent Activity ---------------------------------+   |
|  | Ahmed S. completed "STEMI" - Score: 91%            |   |
|  | Sarah K. completed "Trauma MVA" - Score: 65% (!)   |   |
|  | [View all activity...]                             |   |
|  +--------------------------------------------------+    |
+----------------------------------------------------------+
```

### 3.2 Instructor Features

#### Case Management
- **Browse full case library** with all clinical details visible
- **Preview cases** before assigning (see ECGs, expected findings, model answers)
- **Create custom cases** or modify existing ones
- **Assign cases** to individual students or groups
- **Set deadlines** and mandatory completion requirements
- **Review student performance** on each case

#### ECG Library & Review
- **Full ECG library** with all rhythms and pathologies
- **View 12-lead ECG strips** with grid calibration
- **Compare normal vs abnormal** side by side
- **Teaching annotations** on ECG strips
- **Link ECGs to clinical cases** (this ECG goes with this case)

#### Performance Analytics
- **Individual student reports** with strengths/weaknesses
- **Cohort analytics** (class averages, common pitfalls)
- **Trend analysis** (improving? declining? plateau?)
- **Competency mapping** against learning outcomes
- **Export reports** for academic records

#### Resource Curation
- **Curate learning resources** per case type
- **Add links** to guidelines, videos, journal articles
- **Sources organized by specialty**:
  - Cardiac/ECG: LITFL, AHA/ACC, ESC
  - Trauma: ATLS/ITLS, NAEMT PHTLS
  - Respiratory: BTS, ERC
  - Neurological: AHA/ASA, Brain Trauma Foundation
  - Metabolic: JBDS, toxicology databases
  - Paediatric: APLS, EPLS
  - Environmental: WMS guidelines

---

## 4. Key Differentiators: Student vs Instructor

| Feature | Student | Instructor |
|---------|---------|------------|
| Case details | Progressive reveal during simulation | Full visibility upfront |
| Model answers | Hidden until after completion | Always visible |
| ECG interpretation | Must interpret independently | Teaching annotations visible |
| Treatment guidance | No guidance — must decide independently | Best practice pathways shown |
| Vital sign progression | Real-time, responsive to treatment | Preview of all stages |
| Debrief | Automated after completion | Can add manual comments |
| Scoring | View own scores only | View all student scores |
| Case creation | Cannot create/modify | Full create/edit access |
| Learning resources | Shown after case completion | Curate and assign |
| Monetary/transport considerations | Visible (learning points) | Visible + editable |
| Expected clinical findings | Hidden during case | Always visible |

---

## 5. Data Model for Dual Platform

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  yearLevel?: StudentYear;        // Students only
  cohort?: string;                // e.g., "2024-Cohort-A"
  institution?: string;
  createdAt: string;
}
```

### Case Assignment
```typescript
interface CaseAssignment {
  id: string;
  caseId: string;
  studentId: string;
  assignedBy: string;             // Instructor ID
  assignedAt: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  maxAttempts?: number;
  currentAttempt: number;
}
```

### Case Session (Student Attempt)
```typescript
interface StudentCaseSession {
  id: string;
  studentId: string;
  caseId: string;
  assignmentId?: string;          // If instructor-assigned
  startedAt: string;
  completedAt?: string;
  duration: number;               // seconds

  // Timestamped action log
  actions: {
    timestamp: number;            // seconds from start
    type: 'assessment' | 'treatment' | 'communication' | 'monitoring';
    action: string;               // e.g., "Applied oxygen 15L/min NRB"
    isCorrect?: boolean;
    points?: number;
  }[];

  // Vital signs history at each point
  vitalsSnapshots: {
    timestamp: number;
    vitals: VitalSigns;
    trigger: string;              // What caused the change
  }[];

  // Scoring
  score: number;
  maxScore: number;
  grade: string;

  // Debrief
  autoDebrief: {
    strengths: string[];
    improvements: string[];
    missedActions: string[];
    harmfulActions: string[];
    timingAnalysis: { action: string; actual: number; target: number; status: 'ok' | 'slow' | 'late' }[];
    outcomesMetIds: string[];
    outcomesNotMetIds: string[];
    furtherReading: { title: string; url: string; source: string }[];
  };

  // Instructor can add manual feedback
  instructorFeedback?: string;
  instructorGrade?: string;
}
```

---

## 6. Implementation Phases

### Phase 1: Enhanced Current Platform (NOW)
- [x] LIFEPAK 20 simulator with realistic waveforms
- [x] Treatment effects on monitor
- [x] 12-lead ECG with grid calibration
- [x] LITFL-based real-life cases
- [x] Intervention logging with timestamps
- [ ] Automated debrief scoring engine
- [ ] Case completion detection

### Phase 2: Student Mode (NEXT)
- [ ] "Student Mode" toggle on existing platform
- [ ] Progressive information reveal
- [ ] Locked case flow (no going back)
- [ ] Timer and action logging
- [ ] Basic automated debrief after completion
- [ ] Score calculation and display
- [ ] Further reading links after debrief

### Phase 3: Multi-User Platform
- [ ] User authentication (student / instructor login)
- [ ] Instructor dashboard with student management
- [ ] Case assignment system
- [ ] Student performance tracking
- [ ] Cohort analytics
- [ ] Database backend (cases, sessions, users)

### Phase 4: Advanced Features
- [ ] Real-time instructor observation of student simulation
- [ ] Instructor can inject complications during student case
- [ ] Peer review of cases
- [ ] Competency-based progression (unlock harder cases)
- [ ] Integration with LMS (Moodle, Blackboard)
- [ ] Mobile-responsive design
- [ ] Offline mode for areas with poor connectivity

---

## 7. Technical Considerations

### Authentication Options
1. **Simple**: Email/password with role-based access
2. **Institutional**: SSO via university/college systems
3. **Hybrid**: Google/Microsoft login + role assignment

### Data Storage
- **Phase 1-2**: Local storage / browser-based (current approach)
- **Phase 3+**: Supabase or Firebase backend
  - Real-time sync for instructor monitoring
  - Secure student data storage
  - Analytics and reporting

### Deployment
- **Current**: Vite dev server / static build
- **Phase 2**: Vercel or Netlify deployment with auth
- **Phase 3+**: Full-stack deployment with backend API

---

## 8. Preserving Existing Features

The user explicitly wants to KEEP these elements (they add educational value):

- **Monetary requirements** (cost of treatment/transport)
- **Transportation considerations** (which facility, distance, capabilities)
- **Expected clinical findings** (hidden from student, visible to instructor)
- **Learning points** throughout cases
- **Detailed case scenarios** with realistic UAE context
- **All existing case data** (cardiac, trauma, respiratory, neurological, etc.)

These should be:
- **Visible to students** after case completion (learning opportunity)
- **Always visible to instructors** (planning and review)
- **Used in debrief** (did student consider transport? cost? appropriate facility?)

---

## 9. Debriefing Philosophy

Based on established simulation debriefing frameworks:

### GAS Model (Gather, Analyze, Summarize)
1. **Gather**: What happened? (automated timeline of student actions)
2. **Analyze**: Why did you do that? (compare actions to best practice)
3. **Summarize**: What will you do differently? (learning outcomes + further reading)

### Plus-Delta Framework
- **Plus**: What went well (correct actions, good timing)
- **Delta**: What to change next time (missed actions, delayed responses, harmful interventions)

### Structured Feedback Format
```
1. Case Summary (auto-generated from case data)
2. Your Actions Timeline (timestamped log)
3. Performance Analysis
   - Strengths (what you did right)
   - Areas for improvement (what to work on)
   - Critical missed actions (what you should not have missed)
4. Learning Outcomes Assessment
   - Met / Not Met for each outcome
5. Further Reading & Resources
   - Specialty-appropriate sources
   - Direct links to guidelines and articles
6. Instructor Comments (if assigned case)
```

---

## 10. Revenue & Sustainability Model (Future Consideration)

### For TW Recruitment / Training Division
- **Per-student licensing** to universities/colleges
- **Institutional subscriptions** for paramedic programs
- **Continuing education credits** for practicing paramedics
- **Custom case development** for specific institutional needs
- **White-label option** for training organizations

### Value Proposition
- Reduces need for expensive physical simulation equipment
- Available 24/7 (students practice anytime)
- Standardized assessment across cohorts
- Objective scoring removes assessor bias
- Rich analytics for program accreditation

---

*Document prepared: 17 March 2026*
*Author: Claude (AI Assistant) for Elias Thomas, TW Recruitment*
*Status: Brainstorming / Architecture Proposal*
