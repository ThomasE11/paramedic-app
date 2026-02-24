# UAE Paramedic Case Generator - Product Requirements Document

## 1. Overview

### 1.1 Purpose
A web-based training platform for UAE paramedic students to practice clinical case scenarios in a simulated environment. The system generates realistic emergency cases based on student year level and tracks their assessment performance.

### 1.2 Target Users
- **Students**: Paramedic students in UAE training programs
- **Instructors**: Lab instructors facilitating practical sessions
- **Institutions**: UAE paramedic training colleges and universities

## 2. Educational Framework

| Year Level | Qualification | Scope of Practice |
|------------|--------------|-------------------|
| 2nd Year | EMT-B (Emergency Medical Technician - Basic) | Basic life support, CPR, splinting, oxygen administration, basic airway management |
| 3rd Year | EMT-I (Emergency Medical Technician - Intermediate) | IV access, fluid resuscitation, advanced airway adjuncts, ECG interpretation, medication administration |
| 4th Year | ACP (Advanced Care Paramedic) | Advanced cardiac life support, advanced airway (intubation), surgical procedures, critical care transport, advanced medication protocols |
| Diploma | EMT-B Level | Same as 2nd Year |

### 2.1 Year Level to Complexity Mapping

**CRITICAL:** Each year level MUST only receive cases at their appropriate complexity level. Cases should NOT be tagged for multiple year levels unless they have variations.

| Year Level | Allowed Complexity Levels | Rationale |
|------------|---------------------------|-----------|
| Diploma / 2nd Year | **basic ONLY** | Students are learning foundational assessments and interventions. Cases should focus on: single-system presentations, clear presentations, standard BLS interventions, straightforward patient management |
| 3rd Year | **intermediate ONLY** | Students have IV/medication skills. Cases should involve: multi-system presentations, ECG interpretation, medication decisions, IV therapy, intermediate airway management |
| 4th Year | **advanced + expert ONLY** | Students are ACP-level. Cases should require: complex multi-system pathologies, advanced cardiac/airway interventions, RSI, surgical procedures, critical care, clinical leadership, complex decision-making under pressure |

### 2.2 Complexity Level Definitions

| Complexity | Clinical Characteristics | Example Presentations | Required Skills |
|------------|-------------------------|----------------------|-----------------|
| **basic** | Single-system problem, stable or slowly deteriorating, clear presentation, standard BLS interventions only | Simple syncope, minor trauma, stable hypoglycemia, basic respiratory distress, simple allergic reaction | ABCDE assessment, oxygen therapy, positioning, basic monitoring, patient history, BLS CPR |
| **intermediate** | Multi-system involvement, may be unstable, requires interpretation and medication decisions | STEMI, asthma exacerbation, moderate trauma with suspected fractures, seizure, moderate dehydration, overdose | All basic skills + IV access, medication administration (morphine, midazolam, salbutamol, etc.), ECG interpretation, fluid resuscitation, advanced airway adjuncts (OPA/NPA) |
| **advanced** | Complex multi-system, critically ill/unstable, requires advanced interventions and clinical reasoning | Cardiac arrest, STEMI with complications, severe trauma (polytrauma), respiratory failure, anaphylaxis with airway compromise, stroke with mimics, septic shock, obstetric emergency | All intermediate skills + advanced cardiac monitoring, CPAP, multiple medication infusions, complex clinical reasoning, team leadership, critical decision-making |
| **expert** | Critical, time-sensitive, rare presentations, requires advanced procedures and complex management | RSI indications, pediatric emergencies, trauma with surgical airway need, complex medical emergencies, toxicological emergencies, multiple-casualty incidents, special populations (extreme ages, pregnancy) | All advanced skills + RSI, surgical cricothyrotomy, needle thoracostomy, complex medication calculations, resource allocation, scene management, advanced communication challenges |

### 2.3 Case Assignment Rules

1. **Year-Specific Cases:** Each case should be assigned to ONE year level only, unless it has specific variations for different levels
2. **Complexity Consistency:** A case's complexity field MUST match the year level's allowed complexity
3. **No Cross-Level Tagging:** A case should not be tagged `['2nd-year', '4th-year']` - this indicates the case needs to be split into separate cases or use the variation system
4. **Variation System:** Use the `variations` field to create level-specific versions of the same condition with appropriate complexity

## 3. UAE Clinical Context

### 3.1 Emergency System
- **Emergency Number**: 999
- **Major Cities**: Dubai, Abu Dhabi, Sharjah, Al Ain, Ras Al Khaimah
- **Ambulance Services**: Dubai Corporation for Ambulance Services (DCAS), Abu Dhabi Police GHQ

### 3.2 Cultural Considerations
- Arabic and English as primary languages
- Islamic practices (prayer times, fasting during Ramadan, gender modesty)
- Family presence during care
- Gender preferences for healthcare providers

### 3.3 Geographic Context
- Urban high-rise environments
- Construction sites
- Desert/remote areas
- Highway incidents (Sheikh Zayed Road)
- Coastal/marine areas
- Industrial zones

### 3.4 UAE Ambulance Medications (Based on DCAS Protocols)

**EMT-B Approved:**
- Oxygen (various concentrations)
- Aspirin (chewable 300mg)
- GTN spray (0.4mg)
- Oral glucose
- Epinephrine auto-injector (0.3mg, 0.5mg)
- Activated charcoal

**EMT-I Approved (in addition to EMT-B):**
- Morphine sulfate (5mg IV/IM)
- Fentanyl (50mcg IN/IV)
- Midazolam (5mg IM/IV/IN)
- Ondansetron (4mg IV/IM)
- Salbutamol (2.5-5mg neb)
- Ipratropium bromide (0.5mg neb)
- Adrenaline (1:1,000, 1:10,000)
- Hydrocortisone (100mg IV)
- Amiodarone (150mg IV)
- Tranexamic acid (1g IV)

**ACP Approved (in addition to EMT-I):**
- Ketamine (dissociative sedation)
- Rocuronium (rapid sequence intubation)
- Etomidate (RSI induction)
- Magnesium sulfate (2g IV)
- Nitroglycerin infusion
- Dobutamine infusion
- Norepinephrine infusion
- CPAP (BiPAP)
- Surgical cricothyrotomy
- Needle thoracostomy
- Intraosseous access

## 4. Case Categories & Target Counts

| Category | Target Cases | Current | Gap |
|----------|--------------|---------|-----|
| Cardiac | 8 | 4 | -4 |
| Respiratory | 8 | 4 | -4 |
| Trauma | 10 | 3 | -7 |
| Neurological | 8 | 3 | -5 |
| Metabolic | 6 | 2 | -4 |
| Obstetric | 5 | 1 | -4 |
| Pediatric | 8 | 1 | -7 |
| Psychiatric | 5 | 1 | -4 |
| Environmental | 4 | 1 | -3 |
| Toxicology | 5 | 1 | -4 |
| Burns | 4 | 1 | -3 |
| Multiple Patients | 3 | 0 | -3 |
| Anxiety/Rule-out | 6 | 3 | -3 |
| Elderly Fall | 4 | 1 | -3 |
| Post-Discharge | 4 | 1 | -3 |
| **TOTAL** | **80** | **28** | **-52** |

### 4.1 Case Distribution by Year Level

| Year Level | Basic | Intermediate | Advanced | Expert | Total |
|-----------|-------|--------------|----------|--------|-------|
| Diploma / 2nd Year | 3 | 0 | 0 | 0 | 3 |
| 3rd Year | 0 | 9 | 0 | 0 | 9 |
| 4th Year | 0 | 0 | 11 | 5 | 16 |
| **TOTAL** | **3** | **9** | **11** | **5** | **28** |

## 5. Functional Requirements

### 5.1 Core Features
1. **Case Generation**
   - Filter by year level, category, priority
   - Random case selection within filters
   - Case preview before generation

2. **Case Display**
   - Dispatch information
   - Scene description
   - Patient demographics
   - Initial presentation
   - ABCDE assessment findings
   - Vital signs (initial, progression)
   - Secondary survey findings
   - Patient history
   - Management pathway

3. **Student Assessment**
   - Interactive checklist per case
   - Points-based scoring
   - Critical action tracking
   - Year-level appropriate items
   - Real-time progress display

4. **Instructor Tools**
   - Session notes
   - Expected findings (hidden from students)
   - Teaching points
   - Common pitfalls
   - References

5. **Session Management**
   - Session summary
   - Score calculation
   - Completed/missed items
   - Print/export functionality
   - Case history

### 5.2 New Features to Implement

1. **Progress Tracking**
   - Student progress over time
   - Weak area identification
   - Performance analytics
   - Session history

2. **Case Variations**
   - Same condition, different presentations
   - Difficulty modifiers
   - Vital sign variations

3. **Timer Functionality**
   - Session duration tracking
   - Time-based assessment
   - Performance metrics

4. **Instructor Mode**
   - Toggle student/instructor view
   - Hide/show answers
   - Facilitator notes

5. **Export Options**
   - PDF export
   - Session report
   - Performance summary

## 6. Data Structure Requirements

### 6.1 Case Schema
```typescript
{
  id: string
  title: string
  category: CaseCategory
  priority: 'critical' | 'high' | 'moderate' | 'low'
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert'
  yearLevels: StudentYear[]

  // Dispatch
  dispatchInfo: {
    callReason: string
    timeOfDay: 'early-morning' | 'morning' | 'afternoon' | 'evening'
    location: string
    callerInfo: string
    dispatchCode?: string
  }

  // Patient
  patientInfo: {
    age: number
    gender: 'male' | 'female'
    weight: number
    language: string
    culturalConsiderations?: string[]
  }

  // Scene
  sceneInfo: {
    description: string
    hazards: string[]
    bystanders: string
    environment: string
    accessIssues?: string[]
  }

  // Assessment
  abcde: ABCDEAssessment
  secondarySurvey: SecondarySurvey
  history: PatientHistory
  vitalSignsProgression: {
    initial: VitalSigns
    afterIntervention?: VitalSigns
    enRoute?: VitalSigns
    deterioration?: VitalSigns
  }

  // Outcomes
  expectedFindings: {
    keyObservations: string[]
    redFlags: string[]
    differentialDiagnoses: string[]
    mostLikelyDiagnosis: string
  }

  // Assessment
  studentChecklist: ChecklistItem[]
  teachingPoints: string[]
  commonPitfalls?: string[]
}
```

### 6.2 Medication Format
```typescript
{
  name: string              // UAE generic name
  uaeBrandName?: string      // Common UAE brand (if applicable)
  dose: string              // UAE protocol dose
  route: string             // PO, IV, IM, IO, IN, SL
  indication: string        // When to give
  contraindications: string[]
  sideEffects: string[]
 uaeSpecific: boolean       // Is this UAE-approved?
}
```

## 7. UI/UX Requirements

### 7.1 Home Screen
- Year level selection (prominent)
- Category selection (with case counts)
- Generate case button
- Statistics dashboard
- Recent cases history

### 7.2 Case Screen
- Tabbed interface (Case Details, Assessment, Summary)
- Always-accessible checklist sidebar
- Score tracker
- Quick info cards (patient, vitals, dispatch)
- Keyboard shortcuts
- Instructor notes area

### 7.3 Responsive Design
- Optimized for tablets (lab use)
- Landscape orientation support
- Touch-friendly controls
- Print-optimized summary

## 8. Technical Requirements

- React 19+ with TypeScript
- Vite build system
- Tailwind CSS for styling
- Local storage for session persistence
- PDF export capability
- Dark mode support

## 9. Success Metrics

- Minimum 50 unique cases
- All 13 categories represented
- Year-level appropriate checklists
- UAE-specific medications and protocols
- All cases reviewed for clinical accuracy
- Student progress tracking functional

## 10. User Workflows & Stories

### 10.1 Student Workflow

```
1. LAUNCH APPLICATION
   ↓
2. SELECT YEAR LEVEL (Diploma / 2nd / 3rd / 4th Year)
   ↓
3. [OPTIONAL] SELECT CATEGORY FILTER
   ↓
4. CLICK "GENERATE CASE"
   ↓
5. REVIEW CASE DETAILS
   - Dispatch information
   - Scene description
   - Patient presentation
   - ABCDE findings
   - Vital signs
   ↓
6. BEGIN ASSESSMENT
   - Instructor marks completed items
   - Real-time score tracking
   - Critical action warnings
   ↓
7. COMPLETE SESSION
   - View summary
   - Review teaching points
   - Export/print report
   ↓
8. GENERATE NEW CASE OR END SESSION
```

### 10.2 Instructor Workflow

```
1. SELECT APPROPRIATE YEAR LEVEL FOR STUDENT
   ↓
2. [OPTIONAL] SELECT CATEGORY BASED ON LEARNING OBJECTIVES
   ↓
3. GENERATE CASE AND PRESENT TO STUDENT
   ↓
4. OBSERVE STUDENT PERFORMANCE
   - Use checklist to track actions
   - Add notes in real-time
   - Identify missed critical actions
   ↓
5. DEBRIEF WITH STUDENT
   - Review completed vs missed items
   - Discuss teaching points
   - Address common pitfalls
   ↓
6. DOCUMENT SESSION
   - Save instructor notes
   - Export summary for records
```

### 10.3 User Stories

| ID | As A | I Want To | So That | Acceptance Criteria |
|----|------|-----------|---------|-------------------|
| US-001 | Student | Generate cases appropriate for my year level | I can practice at my skill level | Cases match year-level complexity |
| US-002 | Student | See my real-time progress | I know how I'm doing | Score updates as items are checked |
| US-003 | Student | Review teaching points after each case | I can learn from my mistakes | Teaching points visible in summary |
| US-004 | Instructor | Filter cases by category | I can target specific learning areas | Category filter works correctly |
| US-005 | Instructor | Add session notes | I can document student performance | Notes save with session |
| US-006 | Instructor | See critical action warnings | I don't miss important items | Critical items highlighted |
| US-007 | Admin | Export session to PDF | I can keep records | PDF generates correctly |
| US-008 | Student | Practice in dark mode | I can use the app in low-light environments | Dark mode toggle works |

## 11. Testing & Validation Requirements

### 11.1 Clinical Accuracy Validation

1. **Expert Review Process**
   - All cases reviewed by qualified paramedic instructors
   - Cross-reference with DCAS protocols
   - Validation of medication doses and indications
   - Verification of assessment sequences

2. **Validation Checklist**
   - [ ] Vital signs are realistic for presentation
   - [ ] ABCDE findings are clinically consistent
   - [ ] Medications match UAE protocols
   - [ ] Interventions are year-level appropriate
   - [ ] Differential diagnoses are plausible
   - [ ] Teaching points are evidence-based

### 11.2 Functional Testing

| Component | Test Cases | Priority |
|-----------|------------|----------|
| Case Generation | Filter by year, category, priority | High |
| Checklist Functionality | Toggle items, score calculation | High |
| Session Management | Save/load, export, history | High |
| Timer Functionality | Start/pause/reset, timeout alerts | Medium |
| PDF Export | Generate, format, download | Medium |
| Dark Mode | Toggle, persist state | Low |

### 11.3 User Acceptance Testing

| Scenario | Steps | Expected Outcome |
|----------|-------|------------------|
| Generate 4th Year Case | Select 4th Year → Generate | Only advanced/expert cases shown |
| Complete Assessment | Check items → View summary | Score calculated correctly |
| Export Session | Complete case → Export PDF | PDF with all details generated |
| Filter by Category | Select Cardiac → Generate | Only cardiac cases shown |

### 11.4 Browser Compatibility

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 120+ | Supported |
| Safari | 17+ | Supported |
| Firefox | 120+ | Supported |
| Edge | 120+ | Supported |

## 12. Accessibility Requirements

### 12.1 WCAG 2.1 Compliance (Level AA)

- **Perceivable**
  - Color contrast ratio ≥ 4.5:1 for normal text
  - Color contrast ratio ≥ 3:1 for large text
  - Text alternatives for non-text content
  - High contrast mode support (dark mode)

- **Operable**
  - All functionality available via keyboard
  - No keyboard traps
  - Sufficient time limits (adjustable timer)
  - Skip navigation links

- **Understandable**
  - Readable text (minimum 12px body)
  - Predictable navigation
  - Input assistance (labels, instructions)
  - Error identification and suggestions

- **Robust**
  - Compatible with assistive technologies
  - Valid HTML markup
  - ARIA labels where needed

### 12.2 Specific Accessibility Features

| Feature | Implementation |
|---------|----------------|
| Screen Reader | Proper ARIA labels on all interactive elements |
| Keyboard Navigation | Full keyboard support with visible focus indicators |
| Color Blindness | Not rely on color alone to convey information |
| Touch Targets | Minimum 44x44 pixels for interactive elements |
| Text Scaling | Support 200% zoom without loss of functionality |

## 13. Security & Privacy

### 13.1 Data Privacy

1. **No Personal Data Collection**
   - No student names stored by default
   - No IP address logging
   - No analytics tracking
   - Local storage only (no cloud sync)

2. **Session Data**
   - Stored locally in browser
   - Cleared on user request
   - No server transmission
   - Export only (user-controlled)

### 13.2 Content Security

1. **XSS Prevention**
   - No `dangerouslySetInnerHTML` without sanitization
   - Content Security Policy headers
   - Input sanitization

2. **Data Integrity**
   - Read-only case database
   - No client-side modifications to case data
   - Version tracking for cases

### 13.3 Deployment Security

- HTTPS only in production
- Subresource Integrity (SRI) for CDN resources
- No exposed API endpoints
- Regular dependency updates

## 14. Deployment Requirements

### 14.1 Build Process

```bash
# Development
npm run dev

# Production Build
npm run build

# Preview Production Build
npm run preview
```

### 14.2 Hosting Options

| Option | Suitability | Notes |
|--------|-------------|-------|
| Static Hosting (Vercel, Netlify) | ✅ Recommended | Simplest, free tier available |
| Institutional Server | ✅ Suitable | Requires web server configuration |
| Local File System | ✅ Supported | Works directly from file:// |
| Cloud Containers | ⚠️ Overkill | Unnecessary for static app |

### 14.3 Environment Variables

```bash
# Optional: Analytics (disabled by default)
VITE_ANALYTICS_ID=xxx

# Optional: API endpoints (for future features)
VITE_API_URL=xxx
```

### 14.4 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Bundle Size | < 500KB gzipped | Build output |
| Lighthouse Score | > 90 | All categories |

## 15. Future Roadmap

### Phase 1: Core Enhancement (Current)
- ✅ Basic case generation
- ✅ Year-level filtering
- ✅ Assessment checklist
- ✅ Session summary
- ⏳ PDF export

### Phase 2: Content Expansion (Q2 2025)
- [ ] Add 52 additional cases (reach 80 total)
- [ ] Case variations for same condition
- [ ] Expanded category coverage
- [ ] Pediatric-specific cases
- [ ] Obstetric cases
- [ ] Multiple-patient scenarios

### Phase 3: Advanced Features (Q3 2025)
- [ ] Student accounts and login
- [ ] Longitudinal progress tracking
- [ ] Performance analytics dashboard
- [ ] Weak area identification
- [ ] Spaced repetition recommendations
- [ ] Instructor reports

### Phase 4: Collaboration (Q4 2025)
- [ ] Case sharing between institutions
- [ ] Community case contributions
- [ ] Peer review system
- [ ] Case rating system
- [ ] Discussion forums

### Phase 5: Mobile (2026)
- [ ] Native mobile apps (iOS/Android)
- [ ] Offline case access
- [ ] Push notifications for assignments
- [ ] Camera integration for documentation

## 16. Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-01-28 | Initial PRD creation | System |
| 1.1 | 2025-01-30 | Added complexity mapping definitions | System |
| 1.2 | 2025-01-30 | Added year-level distribution tables | System |
| 1.3 | 2025-01-30 | Added user workflows & stories | System |
| 1.3 | 2025-01-30 | Added testing requirements | System |
| 1.3 | 2025-01-30 | Added accessibility requirements | System |
| 1.3 | 2025-01-30 | Added security & privacy section | System |
| 1.3 | 2025-01-30 | Added deployment requirements | System |
| 1.3 | 2025-01-30 | Added future roadmap | System |
| 1.3 | 2025-01-30 | Updated case counts to 28 total | System |

---

**Document Status**: ✅ Complete
**Last Updated**: 2025-01-30
**Next Review**: 2025-03-01
