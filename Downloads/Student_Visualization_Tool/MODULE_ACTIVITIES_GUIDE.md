# Adding Research Projects to Module Activities - Quick Guide

## Overview

You can now add all 14 research project assignments as **Module Activities** in HEM2903 (or any module). This makes them officially part of the module curriculum, trackable, and visible in the module management interface.

---

## How to Add Projects to Module Activities

### **Option 1: Using the AI Assistant (Easiest)**

Simply tell the AI in action mode:

```
"Add research projects to HEM2903 module activities"
```

or

```
"Add all 14 project assignments as module activities for HEM2903"
```

The AI will automatically:
- Create 14 module activities (one for each unique research project)
- Link them to the HEM2903 module
- Include all project details, assigned students, and objectives
- Track clinical hours (10 hours per project)

### **Option 2: Using the API Directly**

Make a POST request to:
```
POST /api/modules/add-project-activities
```

**Request Body:**
```json
{
  "moduleCode": "HEM2903",
  "force": false
}
```

**Parameters:**
- `moduleCode` (optional): Module to add activities to. Default: "HEM2903"
- `force` (optional): If true, updates existing activities. Default: false

---

## What Gets Created

For each of the 14 research projects, a **Module Activity** is created with:

### **Activity Details:**
- **Title:** "Project #[Number]: [Project Title]"
- **Type:** research_project
- **Duration:** 10 clinical hours
- **Target Audience:** Names of assigned students
- **Description:** Full project background and context

### **Content Stored:**
- Project number
- Project title
- List of assigned students
- Clinical hours
- Full project brief
- Research questions
- Deliverables

### **Objectives:**
- Conduct comprehensive literature review
- Answer all research questions with evidence
- Develop UAE-specific recommendations
- Create professional presentation

### **Example Activity:**

```
Title: Project #7: After the Call: Resilience, Stress, and Mental Wellbeing for Paramedics

Type: Research Project
Duration: 10 Clinical Hours
Assigned Students: Fatima Abdulla Salem Abdulla Alkaabi (H00542198)

Description:
Research Project Assignment #7
After the Call: Resilience, Stress, and Mental Wellbeing for Paramedics
Assigned to 1 student(s)

Objectives:
- Conduct comprehensive literature review
- Answer all research questions with evidence
- Develop UAE-specific recommendations
- Create professional presentation

Content:
{Full project brief with background, research questions, deliverables}
```

---

## Checking Current Activities

### **Using AI:**
```
"Show me the module activities for HEM2903"
"List all research project activities in HEM2903"
```

### **Using API:**
```
GET /api/modules/add-project-activities?moduleCode=HEM2903
```

This returns:
- Current count of project activities
- Expected count (14)
- Details of each activity

---

## Benefits

### **For Module Management:**
✅ All 14 projects visible in module curriculum
✅ Tracked as official module activities
✅ Clinical hours automatically counted
✅ Student assignments clearly documented

### **For Students:**
✅ See their assigned project in module activities
✅ Track their project progress
✅ Access full project brief from module interface
✅ Clear deliverables and objectives

### **For AI Assistant:**
✅ Full context awareness of module curriculum
✅ Can reference project activities when helping students
✅ Can track progress against module activities
✅ Can generate reports on project completion

---

## The 14 Research Projects

When you add them to module activities, you'll see:

1. **Project #1:** Manual Handling, Back Injury, and Innovation in EMS
2. **Project #2:** Evolution of the Modern Ambulance
3. **Project #3:** Expanding Roles of the Modern Paramedic
4. **Project #4:** The Paramedic's Uniform
5. **Project #5:** Communication and De-escalation
6. **Project #6:** Mental Health in Pre-Hospital Setting
7. **Project #7:** Resilience and Mental Wellbeing for Paramedics
8. **Project #8:** Mass Casualty Incident Triage
9. **Project #9:** Evidence-Based Practice in EMS
10. **Project #10:** Technology in the Ambulance
11. **Project #11:** The Golden Hour Myth
12. **Project #12:** Public Health and Prevention
13. **Project #13:** Ambulance Service Logistics
14. **Project #14:** End-of-Life Care

---

## Example AI Workflow

### **Step 1: Add to Module**
```
YOU: "Add research projects to HEM2903 module activities"

AI: ✅ Successfully created 14 research project activities in HEM2903:
    - Project #1: Manual Handling (1 student assigned)
    - Project #2: Evolution of Ambulance (1 student assigned)
    - Project #3: Expanding Roles (1 student assigned)
    ... (all 14 projects listed)
```

### **Step 2: Verify**
```
YOU: "Show me module activities for HEM2903"

AI: HEM2903 has 14 research project activities:
    Each project is assigned to specific students and tracks 10 clinical hours.
```

### **Step 3: Use Context**
```
YOU: "Help Fatima with her research project"

AI: Fatima is assigned to Project #7: Mental Wellbeing for Paramedics.
    This project focuses on PTSD, burnout, and resilience strategies.

    [Provides targeted assistance based on her specific project]
```

---

## Integration with Existing Features

### **Works With:**
- ✅ Student Notes (projects already in student profiles)
- ✅ Module Management (now officially part of module)
- ✅ AI Context Awareness (AI knows module curriculum)
- ✅ Progress Tracking (can track completion status)
- ✅ Reporting (can generate module activity reports)

### **Next Steps You Can Do:**
- Track student progress on their projects
- Generate completion reports
- Send reminders about project deadlines
- Create discussion forums for each project
- Schedule presentation sessions

---

## Quick Commands Summary

| What You Want | Command to AI |
|---------------|---------------|
| Add projects to module | "Add research projects to HEM2903 module activities" |
| Check current activities | "Show me HEM2903 module activities" |
| Help specific student | "Help Fatima with her research project" |
| Track progress | "Show progress on all research projects" |
| Send reminders | "Email all students reminder about project deadlines" |

---

## Technical Details

### **Database Schema:**
Activities are stored in the `module_activities` table with:
- `moduleId` → Links to HEM2903
- `title` → "Project #X: Title"
- `activityType` → "research_project"
- `content` → Full JSON with project details
- `objectives` → Learning objectives array
- `studentCount` → Number of assigned students

### **Files:**
- `/api/modules/add-project-activities/route.ts` - API endpoint
- `/lib/project-assignments.ts` - Project database
- `/api/ai-assistant/educational/route.ts` - AI integration

---

**Your research projects are now fully integrated into the module curriculum system!** 🎓📚
