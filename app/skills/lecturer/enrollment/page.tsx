
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EnrollmentManagement from './_components/enrollment-management';

export default async function EnrollmentPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user || (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN')) {
    redirect('/auth/signin');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Enrollment Management</h1>
        <p className="text-muted-foreground">
          Manage student enrollments across all HEM subjects with complete control over assignments and bulk operations.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <EnrollmentManagement />
      </Suspense>
    </div>
  );
}
