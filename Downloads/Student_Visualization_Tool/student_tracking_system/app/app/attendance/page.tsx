import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { AttendanceContent } from './attendance-content';

export default async function AttendancePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 glass-morphism rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-foreground">
            Attendance Register
          </h1>
          <p className="text-muted-foreground mt-2">
            Mark attendance for AEM230 and other modules
          </p>
        </div>
        <AttendanceContent />
      </main>
    </div>
  );
}