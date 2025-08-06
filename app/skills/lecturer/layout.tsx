
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LecturerNavigation } from '@/components/lecturer/lecturer-navigation';

export default async function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect('/auth/signin');
  }

  // Allow both lecturers and admins to access lecturer routes
  if (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Use actual session data or mock data for testing
  const mockUser = session.user;

  return (
    <div className="min-h-screen bg-background">
      <LecturerNavigation user={mockUser} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
