
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content, category } = body;

    // Demo mode - return mock updated note
    if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log('Demo mode: Updating mock note');

      const mockNote = {
        id,
        title,
        content,
        category,
        updatedAt: new Date(),
        student: { id: 'demo', fullName: 'Demo Student' },
        user: { name: session.user.name, email: session.user.email }
      };

      return NextResponse.json({ note: mockNote });
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        category
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
        studentId: note.studentId,
        type: 'note_updated',
        description: `Note "${title}" was updated`,
        metadata: { updatedBy: session.user.email }
      }
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const note = await prisma.note.delete({
      where: { id },
      include: { student: true }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        studentId: note.studentId,
        type: 'note_deleted',
        description: `Note "${note.title}" was deleted`,
        metadata: { deletedBy: session.user.email }
      }
    });

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
