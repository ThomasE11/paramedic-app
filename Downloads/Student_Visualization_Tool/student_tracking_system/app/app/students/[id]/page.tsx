
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/header';
import { StudentDetailsContent } from './student-details-content';

export default async function StudentDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      module: true,
      notes: {
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!student) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <StudentDetailsContent student={student} />
      </main>
    </div>
  );
}
