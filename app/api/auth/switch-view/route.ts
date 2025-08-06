
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only lecturers can switch view modes
    if (session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { viewMode } = await request.json();

    // Validate viewMode
    if (!viewMode || !['lecturer', 'student'].includes(viewMode)) {
      return NextResponse.json({ error: 'Invalid view mode' }, { status: 400 });
    }

    // Return success - the actual session update will be handled by the client
    return NextResponse.json({ success: true, viewMode });
  } catch (error) {
    console.error('Error switching view mode:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
