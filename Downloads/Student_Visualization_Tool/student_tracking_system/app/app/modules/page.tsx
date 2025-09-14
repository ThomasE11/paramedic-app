
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { ModulesContent } from './modules-content';

export default async function ModulesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 bg-white/20 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white">Modules</h1>
          <p className="text-white/80 mt-2">
            Overview of all EMS program modules
          </p>
        </div>
        <ModulesContent />
      </main>
    </div>
  );
}
