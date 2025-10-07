-- CreateIndex: Add performance indexes for attendance queries
-- This migration adds optimized indexes for the attendance system to improve query performance

-- Index for attendance queries by class session (most common query pattern)
CREATE INDEX IF NOT EXISTS "idx_attendance_classSessionId_status" ON "attendance"("classSessionId", "status");

-- Index for attendance queries by student (student-specific lookups)
CREATE INDEX IF NOT EXISTS "idx_attendance_studentId_status" ON "attendance"("studentId", "status");

-- Index for date-based attendance queries via classSession
CREATE INDEX IF NOT EXISTS "idx_classSession_date_moduleId" ON "class_sessions"("date", "moduleId");

-- Index for user-based queries (who marked attendance)
CREATE INDEX IF NOT EXISTS "idx_attendance_markedBy_markedAt" ON "attendance"("markedBy", "markedAt") WHERE "markedBy" IS NOT NULL;

-- Composite index for export queries (module + date range)
CREATE INDEX IF NOT EXISTS "idx_classSession_moduleId_date_type" ON "class_sessions"("moduleId", "date", "type");

-- Index for student module lookups
CREATE INDEX IF NOT EXISTS "idx_student_moduleId" ON "students"("moduleId") WHERE "moduleId" IS NOT NULL;

-- Index for attendance with notes (for filtering)
CREATE INDEX IF NOT EXISTS "idx_attendance_notes" ON "attendance"("classSessionId") WHERE "notes" IS NOT NULL AND "notes" != '';