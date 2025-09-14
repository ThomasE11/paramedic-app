
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, title, content, category } = body;

    if (!studentId || !title || !content) {
      return NextResponse.json(
        { error: 'Required fields: studentId, title, content' },
        { status: 400 }
      );
    }

    // Demo mode - return mock note
    if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log('Demo mode: Creating mock note');

      const mockNote = {
        id: Date.now().toString(),
        studentId,
        title,
        content,
        category: category || 'general',
        createdAt: new Date(),
        updatedAt: new Date(),
        student: { id: studentId, fullName: 'Demo Student' },
        user: { name: session.user.name, email: session.user.email }
      };

      return NextResponse.json({ note: mockNote }, { status: 201 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const note = await prisma.note.create({
      data: {
        studentId,
        userId: user.id,
        title,
        content,
        category: category || 'general'
      },
      include: {
        student: true,
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        studentId,
        type: 'note_added',
        description: `Note "${title}" was added`,
        metadata: { addedBy: session.user.email, category }
      }
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
