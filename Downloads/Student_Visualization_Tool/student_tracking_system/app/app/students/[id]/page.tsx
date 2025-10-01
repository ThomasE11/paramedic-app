
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
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      redirect('/auth/signin');
    }

    const { id } = await params;
    console.log('[Student Detail] Fetching student with ID:', id);

    // Fetch student with related data, fetch activities separately to handle potential issues
    let student;
    try {
      student = await prisma.student.findUnique({
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
      console.log('[Student Detail] Student fetched successfully:', !!student);
    } catch (dbError) {
      console.error('[Student Detail] Database error fetching student:', dbError);
      throw new Error(`Failed to fetch student: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    if (!student) {
      console.log('[Student Detail] Student not found, returning 404');
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
      console.log('[Student Detail] Activities fetched:', activities.length);
    } catch (error) {
      console.error('[Student Detail] Failed to fetch activities:', error);
      // Continue without activities if they fail to load
    }

    // Attach activities to student object for client component
    const studentWithActivities = {
      ...student,
      activities
    };

    console.log('[Student Detail] Rendering page successfully');
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto max-w-7xl px-4 py-8">
          <StudentDetailsContent student={studentWithActivities} />
        </main>
      </div>
    );
  } catch (error) {
    console.error('[Student Detail] Page error:', error);
    console.error('[Student Detail] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}
