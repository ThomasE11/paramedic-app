
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
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

  // Fetch student with related data, fetch activities separately to handle potential issues
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

  // Fetch activities separately with error handling
  let activities: any[] = [];
  try {
    activities = await prisma.activity.findMany({
      where: { studentId: id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    // Continue without activities if they fail to load
  }

  // Attach activities to student object for client component
  const studentWithActivities = {
    ...student,
    activities
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <StudentDetailsContent student={studentWithActivities} />
      </main>
    </div>
  );
}
