# Student Practice Time Reset Guide

## Overview
This guide explains where student practice times are stored in the paramedic training system and how to reset them to zero for a fresh start.

## Practice Time Storage Locations

### 1. Database (Primary Storage)
**Location**: `/prisma/dev.db` - SQLite database
**Table**: `student_progress`
**Key Fields**:
- `time_spent_minutes` - Practice session time
- `current_session_time` - Current session tracking
- `total_time_spent` - Cumulative practice time  
- `reflection_time` - Time spent on reflections

### 2. API Mock Data (Development/Testing)
**File**: `/app/api/progress/route.ts`
**Lines Modified**: 35, 60
- Changed `timeSpentMinutes: 120` → `timeSpentMinutes: 0`
- Changed `timeSpentMinutes: 90` → `timeSpentMinutes: 0`

### 3. Skills Definition Files (Time Estimates Only)
These files contain estimated times, not actual practice data:
- `/lib/comprehensive-skills-updated.ts` - Skill time estimates
- `/lib/enhanced-skills-data.ts` - Step time estimates

## Reset Methods

### Method 1: Database Reset Script (Recommended)
```bash
node reset-practice-times.js
```
This script:
- Resets all time fields to 0 in the database
- Updates timestamps
- Provides feedback on records affected

### Method 2: Manual Database Reset
```bash
sqlite3 prisma/dev.db "UPDATE student_progress SET time_spent_minutes = 0, current_session_time = 0, total_time_spent = 0, reflection_time = 0, updated_at = CURRENT_TIMESTAMP;"
```

### Method 3: Complete Database Clear
```bash
sqlite3 prisma/dev.db "DELETE FROM student_progress;"
```

## Files Modified for Fresh Start

### `/app/api/progress/route.ts`
```javascript
// Line 35: CPR Adult skill
timeSpentMinutes: 0,  // was 120

// Line 60: AED Use skill  
timeSpentMinutes: 0,  // was 90
```

## Verification Steps

1. **Check Database**:
   ```bash
   sqlite3 prisma/dev.db "SELECT COUNT(*) FROM student_progress WHERE time_spent_minutes > 0;"
   ```
   Should return `0` if all times are reset.

2. **Check API Response**:
   Visit `/api/progress` and verify `timeSpentMinutes` values are 0.

3. **Check Student Dashboard**:
   Navigate to student dashboard and verify practice time displays show 0 minutes/hours.

## Database Schema Reference

```sql
-- student_progress table structure
CREATE TABLE student_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  skill_id INTEGER NOT NULL,
  time_spent_minutes INTEGER DEFAULT 0,      -- ← Practice time
  current_session_time INTEGER DEFAULT 0,    -- ← Session time
  total_time_spent INTEGER DEFAULT 0,        -- ← Total time
  reflection_time INTEGER DEFAULT 0,         -- ← Reflection time
  -- other fields...
);
```

## Related Components

**Frontend Components That Display Practice Time**:
- `/app/skills/student/dashboard/page.tsx` - Student dashboard
- `/app/skills/student/progress/page.tsx` - Progress page
- Various skill practice components

**APIs That Handle Practice Time**:
- `/app/api/progress/route.ts` - Main progress API
- `/app/api/student/mastery/route.ts` - Mastery tracking
- `/app/api/skill-attempts/route.ts` - Skill attempts

## Maintenance Notes

- The system currently uses mock data for development
- When transitioning to production, ensure database is properly seeded
- Practice times are tracked in minutes
- The dashboard converts minutes to hours for display (Math.round(minutes / 60))

## Troubleshooting

**Issue**: Students still see old practice times
**Solution**: 
1. Clear browser cache
2. Restart development server
3. Verify database reset was successful

**Issue**: API still returns old values
**Solution**: 
1. Check both database AND mock API data
2. Restart Next.js development server
3. Verify correct API endpoint is being called

---

*Last Updated: August 2025*
*System: Paramedic Training Management System*