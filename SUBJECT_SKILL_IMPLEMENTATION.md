# Subject-Based Skills Implementation Guide

This guide explains how to implement the subject-based skills enrollment system using the skills mapping data.

## Overview

The new system automatically enrolls students into skills based on their subject enrollment, following the hierarchical structure from `skills_mapping.json`:

- **EMT-Basic (HEM1103)**: 17 foundational skills
- **Paramedic (HEM2105, HEM2024, HEM2033)**: 9 intermediate skills across 3 subjects
- **Advanced Paramedic (HEM3006, HEM3106, HEM4106)**: 18 advanced skills across 3 subjects

## Implementation Steps

### 1. Database Setup

Apply the enhanced schema if not already done:
```bash
cd /Users/eliastlcthomas/Downloads/Matrix_Management_System/paramedic_matrix_system/app
cp prisma/schema-enhanced.prisma prisma/schema.prisma
npx prisma generate
npx prisma db push
```

### 2. Seed Database with Skills Mapping

Run the seeding script to populate subjects and skills:
```bash
# Make sure you're in the app directory
cd /Users/eliastlcthomas/Downloads/Matrix_Management_System/paramedic_matrix_system/app

# Run the seeding script
npx tsx scripts/seed-skills-mapping.ts
```

This will create:
- **7 Subjects** from the mapping (HEM1103, HEM2105, HEM2024, HEM2033, HEM3006, HEM3106, HEM4106)
- **44 Skills** categorized by type (Airway Management, Life Support, etc.)
- **7 Categories** for organizing skills
- **Subject-Skill relationships** based on the mapping
- **Basic skill steps** for each skill (3 steps per skill)

### 3. Subject Structure

**EMT-Basic Level:**
- HEM1103: Emergency Medical Technician - Basic Level (17 skills)

**Paramedic Level:**
- HEM2105: Intermediate Paramedic Level - Airway Focus (3 skills)
- HEM2024: Intermediate Paramedic Level - Procedures Focus (3 skills)
- HEM2033: Intermediate Paramedic Level - Trauma Focus (3 skills)

**Advanced Paramedic Level:**
- HEM3006: Advanced Paramedic Level - Airway Mastery (6 skills)
- HEM3106: Advanced Paramedic Level - Life Support (6 skills)
- HEM4106: Advanced Paramedic Level - Advanced Procedures (6 skills)

### 4. Skill Categories Created

1. **Airway Management** (Blue - #3B82F6): Breathing and airway skills
2. **Life Support** (Red - #EF4444): CPR and life support procedures
3. **Vascular Access** (Green - #10B981): IV and vascular procedures
4. **Trauma Care** (Orange - #F59E0B): Trauma and injury management
5. **Assessment** (Purple - #8B5CF6): Patient assessment skills
6. **Procedures** (Cyan - #06B6D4): General medical procedures
7. **Communication** (Lime - #84CC16): Communication and documentation

### 5. Student Enrollment Process

When you enroll a student in a subject, they automatically get access to all skills for that subject:

```typescript
// Example: Enroll student in EMT-Basic
const response = await fetch('/api/admin/subject-enrollment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: 'student-id',
    subjectId: hemBasicSubjectId, // HEM1103
    action: 'enroll'
  })
});
```

This will:
- Create UserSubject enrollment record
- Create StudentProgress records for all 17 EMT-Basic skills
- Send notification to student
- Allow immediate access to practice skills

## API Endpoints

### Student Enrollment Management
- `POST /api/admin/subject-enrollment` - Enroll/unenroll students
- `GET /api/admin/subject-enrollment` - View enrollment information
- `PATCH /api/admin/subject-enrollment` - Bulk enrollment operations

### Subject-Skill Mapping Management
- `GET /api/admin/subject-skills` - View subject-skill mappings
- `POST /api/admin/subject-skills` - Create new mappings
- `PATCH /api/admin/subject-skills` - Update existing mappings
- `DELETE /api/admin/subject-skills` - Remove mappings

### Student Access
- `GET /api/student/enrolled-skills` - Updated to work with subject-based enrollment
- `GET /api/student/mastery` - View mastery progress across subjects

## Usage Examples

### 1. View Subject-Skill Mappings
```bash
# Get all mappings
curl -X GET "/api/admin/subject-skills"

# Get skills for specific subject
curl -X GET "/api/admin/subject-skills?subjectId=1&includeStats=true"

# Get subjects for specific skill
curl -X GET "/api/admin/subject-skills?skillId=5&includeStats=true"
```

### 2. Enroll Student in EMT-Basic
```javascript
const enrollStudent = async (studentId) => {
  const response = await fetch('/api/admin/subject-enrollment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: studentId,
      subjectId: 1, // HEM1103 EMT-Basic
      action: 'enroll'
    })
  });
  
  const result = await response.json();
  console.log(`Enrolled student in ${result.enrollment.skillsEnrolled} skills`);
};
```

### 3. Bulk Enroll Multiple Students
```javascript
const bulkEnroll = async (studentIds, subjectIds) => {
  const response = await fetch('/api/admin/subject-enrollment', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'bulk_enroll',
      studentIds: studentIds,
      subjectIds: subjectIds
    })
  });
  
  const result = await response.json();
  console.log(`Bulk enrollment completed: ${result.summary.successful} successful, ${result.summary.failed} failed`);
};
```

### 4. Add New Skill to Subject
```javascript
const addSkillToSubject = async (subjectId, skillId, isCore = true) => {
  const response = await fetch('/api/admin/subject-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subjectId: subjectId,
      skillId: skillId,
      isCore: isCore
    })
  });
  
  const result = await response.json();
  console.log(`Skill mapped to subject, ${result.studentsEnrolled} students auto-enrolled`);
};
```

## Hierarchy and Prerequisites

The system supports the hierarchical structure from the mapping:

1. **EMT-Basic** → Foundation level (required for higher levels)
2. **Paramedic** → Intermediate level (requires EMT-Basic)
3. **Advanced Paramedic** → Advanced level (requires EMT-Basic + Paramedic)

This can be enforced through:
- Subject enrollment prerequisites
- Skill prerequisite checking
- Progressive unlocking of higher-level subjects

## Student Experience

### Before Subject Enrollment:
- Student has no skills available
- Cannot practice or request mastery

### After Subject Enrollment (e.g., HEM1103):
- Automatically gets access to 17 EMT-Basic skills
- Can immediately start practicing
- Progress is tracked for each skill
- Can request mastery when ready

### Multi-Subject Enrollment:
- Skills appear in multiple subjects (if mapped)
- Progress is shared across subjects
- Single mastery request covers all subjects

## Lecturer/Admin Experience

### Subject Management:
- View all subject-skill mappings
- See enrollment statistics
- Manage bulk enrollments

### Skill Tracking:
- Monitor student progress across subjects
- View mastery requests by subject
- Analyze skill difficulty and completion rates

### System Administration:
- Add/remove skills from subjects
- Modify skill categorization
- Manage subject hierarchies

## Migration from Existing System

If you have existing student progress:

1. **Run the seeding script** to create the new structure
2. **Map existing progress** to new skill IDs
3. **Enroll students** in appropriate subjects based on their current access
4. **Verify progress transfer** for each student

## Troubleshooting

### Common Issues:

**Skills not appearing for student:**
- Check if student is enrolled in correct subjects
- Verify subject-skill mappings exist
- Check if UserSubject record is active

**Duplicate skills in student view:**
- Normal if skill is mapped to multiple subjects
- Frontend should handle deduplication
- Check `subjects` array in skill data

**Missing skills after enrollment:**
- Check if `autoEnrollStudentSkills` function ran successfully
- Verify StudentProgress records were created
- Check for database constraint violations

**Performance issues:**
- Use pagination for large subject lists
- Implement caching for subject-skill mappings
- Consider indexing on frequently queried fields

## Next Steps

1. **Frontend Integration**: Update enrollment interfaces to use new APIs
2. **Reporting**: Create reports showing progress by subject and skill
3. **Prerequisites**: Implement subject prerequisite checking
4. **Analytics**: Add analytics for skill difficulty and completion rates
5. **Mobile**: Ensure mobile app compatibility with new structure

## Database Schema Summary

Key tables and relationships:
- `subjects` → `subject_skills` → `skills` (many-to-many)
- `users` → `user_subjects` → `subjects` (enrollment)
- `users` → `student_progress` → `skills` (progress tracking)
- `skills` → `skill_attempts` (detailed attempt tracking)
- `students` → `mastery_requests` → `skills` (mastery workflow)