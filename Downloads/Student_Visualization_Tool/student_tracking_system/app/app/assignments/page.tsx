import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { AssignmentsContent } from './assignments-content';

export default async function AssignmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 glass-morphism border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Assignment Management</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Create assignments, upload rubrics, and manage student submissions with AI evaluation
          </p>
        </div>
        <AssignmentsContent />
      </main>
    </div>
  );
}