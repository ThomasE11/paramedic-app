import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from '@/lib/auth';

export default async function SkillsPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect('/auth/signin');
  }

  // Redirect based on user role to appropriate skills dashboard
  const role = session.user?.role;
  
  switch (role) {
    case 'ADMIN':
      redirect('/skills/admin/dashboard');
    case 'LECTURER':
      redirect('/skills/lecturer/dashboard');
    case 'STUDENT':
    default:
      redirect('/skills/student/dashboard');
  }
}