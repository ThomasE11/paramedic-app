-- Run this SQL script on your production database to add the assignment grading system tables

-- Create assignments table
CREATE TABLE IF NOT EXISTS "assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'case_reflection',
    "moduleId" TEXT NOT NULL,
    "subjectId" TEXT,
    "createdBy" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assignments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "assignments_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create rubrics table
CREATE TABLE IF NOT EXISTS "rubrics" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "criteria" JSONB NOT NULL,
    "fileName" TEXT,
    "filePath" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "extractedText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rubrics_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rubrics_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rubrics_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS "submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extractedText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "submissions_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "submissions_assignmentId_studentId_key" UNIQUE ("assignmentId", "studentId")
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS "evaluations" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "rubricId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT NOT NULL,
    "criteriaScores" JSONB NOT NULL,
    "strengths" TEXT,
    "improvements" TEXT,
    "evaluatedBy" TEXT NOT NULL DEFAULT 'ai',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "evaluations_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubrics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evaluations_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "evaluations_submissionId_rubricId_key" UNIQUE ("submissionId", "rubricId")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "assignments_moduleId_isActive_idx" ON "assignments"("moduleId", "isActive");
CREATE INDEX IF NOT EXISTS "rubrics_assignmentId_isActive_idx" ON "rubrics"("assignmentId", "isActive");
CREATE INDEX IF NOT EXISTS "submissions_studentId_assignmentId_idx" ON "submissions"("studentId", "assignmentId");
CREATE INDEX IF NOT EXISTS "submissions_status_submittedAt_idx" ON "submissions"("status", "submittedAt");
CREATE INDEX IF NOT EXISTS "evaluations_submissionId_idx" ON "evaluations"("submissionId");

-- Grant permissions (adjust as needed for your database user)
-- GRANT ALL ON "assignments" TO your_database_user;
-- GRANT ALL ON "rubrics" TO your_database_user;
-- GRANT ALL ON "submissions" TO your_database_user;
-- GRANT ALL ON "evaluations" TO your_database_user;

COMMENT ON TABLE "assignments" IS 'Stores assignment/task definitions for modules';
COMMENT ON TABLE "rubrics" IS 'Evaluation criteria and rubrics for assignments';
COMMENT ON TABLE "submissions" IS 'Student submissions for assignments';
COMMENT ON TABLE "evaluations" IS 'AI-generated evaluations of submissions against rubrics';
