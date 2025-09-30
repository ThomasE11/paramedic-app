# Production Database Setup Instructions

## Issue
The production deployment is showing an error because the database doesn't have the new tables for the AI grading system.

## Solution
Run the migration SQL script on your production database.

### Steps:

1. **Access Your Production Database**
   - Log into your Vercel dashboard
   - Go to your project settings
   - Find your database connection (likely Supabase or similar)
   - Open the SQL editor or database console

2. **Run the Migration**
   - Open the file: `PRODUCTION_MIGRATION.sql`
   - Copy all the SQL commands
   - Paste and execute them in your production database SQL editor
   - Verify all 4 tables were created: `assignments`, `rubrics`, `submissions`, `evaluations`

3. **Verify the Fix**
   - Go to https://student-tracking-system-rho.vercel.app/students
   - The page should now load without errors
   - The student detail pages should also work

4. **Access the New Features**
   - Navigate to `/assignments` to create assignments
   - Upload rubrics (PDF/Word files)
   - Upload student submissions
   - View AI-generated evaluations

## Alternative: Use Prisma Migrate (if you have direct database access)

If you have the production DATABASE_URL:

```bash
# Set the production database URL temporarily
export DATABASE_URL="your_production_database_url"

# Run the migration
npx prisma migrate deploy

# Or push the schema directly
npx prisma db push
```

## What This Adds

The migration creates 4 new tables:
- **assignments**: Assignment definitions with modules and due dates
- **rubrics**: Evaluation criteria (supports file uploads)
- **submissions**: Student work submissions (PDF/Word/Text)
- **evaluations**: AI-generated scores and feedback

## Need Help?

If you encounter any issues:
1. Check that all foreign key constraints are satisfied
2. Ensure your database user has CREATE TABLE permissions
3. Verify the `users`, `students`, and `modules` tables exist
4. Contact your database administrator if needed

## After Migration

Once the tables are created:
1. The students page will work again
2. You can access the Assignments feature at `/assignments`
3. The complete AI grading workflow will be functional
