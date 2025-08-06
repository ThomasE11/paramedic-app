
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { StudentNavigation } from '@/components/student/student-navigation';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect('/auth/signin');
  }

  // Allow access if user is a student OR if user is a lecturer in student view mode OR admin
  if (session.user.role !== 'STUDENT' && 
      !(session.user.role === 'LECTURER' && session.user.viewMode === 'student') && 
      session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-background">
      <StudentNavigation user={user} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
