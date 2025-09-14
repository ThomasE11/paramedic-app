
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Demo mode - return empty locations for now
    if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log('Demo mode: Returning empty locations');
      return NextResponse.json([]);
    }

    const locations = await prisma.location.findMany({
      orderBy: [
        { building: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Locations fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      capacity,
      type = 'classroom',
      building,
      floor,
      equipment
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const newLocation = await prisma.location.create({
      data: {
        name,
        capacity: capacity || null,
        type,
        building: building || null,
        floor: floor || null,
        equipment: equipment || null
      }
    });

    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    console.error('Location creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
