
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { TimetablesContent } from './timetables-content';

export default async function TimetablesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 glass-morphism border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Student Timetables</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage student schedules and find optimal meeting times
          </p>
        </div>
        <TimetablesContent />
      </main>
    </div>
  );
}
