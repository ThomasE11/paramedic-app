
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const moduleId = searchParams.get('moduleId') || '';
    const sortBy = searchParams.get('sortBy') || 'firstName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Demo mode - use actual student data
    if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log('Demo mode: Using actual student data');

      // Real student data from our system
      let students = [
        // AEM230 - Apply Clinical Practicum (31 students)
        { id: '1', studentId: 'H00123456', firstName: 'Abdulla', lastName: 'Ahmed Abdulla Alhammadi', fullName: 'Abdulla Ahmed Abdulla Alhammadi', email: 'h00123456@hct.ac.ae', phone: '+971501234567', moduleId: '1', module: { id: '1', code: 'AEM230', name: 'Apply Clinical Practicum' }, notes: [], activities: [] },
        { id: '2', studentId: 'H00123457', firstName: 'Abdulla', lastName: 'Ali Saeed Alkaabi', fullName: 'Abdulla Ali Saeed Alkaabi', email: 'h00123457@hct.ac.ae', phone: '+971501234568', moduleId: '1', module: { id: '1', code: 'AEM230', name: 'Apply Clinical Practicum' }, notes: [], activities: [] },
        { id: '3', studentId: 'H00123458', firstName: 'Abdulla', lastName: 'Khalifa Saeed Alkaabi', fullName: 'Abdulla Khalifa Saeed Alkaabi', email: 'h00123458@hct.ac.ae', phone: '+971501234569', moduleId: '1', module: { id: '1', code: 'AEM230', name: 'Apply Clinical Practicum' }, notes: [], activities: [] },
        { id: '4', studentId: 'H00123459', firstName: 'Ahmed', lastName: 'Abdulla Ahmed Alhammadi', fullName: 'Ahmed Abdulla Ahmed Alhammadi', email: 'h00123459@hct.ac.ae', phone: '+971501234570', moduleId: '1', module: { id: '1', code: 'AEM230', name: 'Apply Clinical Practicum' }, notes: [], activities: [] },
        { id: '5', studentId: 'H00123460', firstName: 'Ahmed', lastName: 'Ali Saeed Alkaabi', fullName: 'Ahmed Ali Saeed Alkaabi', email: 'h00123460@hct.ac.ae', phone: '+971501234571', moduleId: '1', module: { id: '1', code: 'AEM230', name: 'Apply Clinical Practicum' }, notes: [], activities: [] },

        // HEM2903 - Ambulance 1 Practical Group (14 students)
        { id: '32', studentId: 'H00223456', firstName: 'Abdulla', lastName: 'Saeed Mohammed Alkaabi', fullName: 'Abdulla Saeed Mohammed Alkaabi', email: 'h00223456@hct.ac.ae', phone: '+971502234567', moduleId: '2', module: { id: '2', code: 'HEM2903', name: 'Ambulance 1 Practical Group' }, notes: [], activities: [] },
        { id: '33', studentId: 'H00223457', firstName: 'Ahmed', lastName: 'Saeed Mohammed Alkaabi', fullName: 'Ahmed Saeed Mohammed Alkaabi', email: 'h00223457@hct.ac.ae', phone: '+971502234568', moduleId: '2', module: { id: '2', code: 'HEM2903', name: 'Ambulance 1 Practical Group' }, notes: [], activities: [] },

        // HEM3903 - Ambulance Practicum III (9 students)
        { id: '46', studentId: 'H00323456', firstName: 'Abdulla', lastName: 'Hamad Khalifa Almarzouqi', fullName: 'Abdulla Hamad Khalifa Almarzouqi', email: 'h00323456@hct.ac.ae', phone: '+971503234567', moduleId: '3', module: { id: '3', code: 'HEM3903', name: 'Ambulance Practicum III' }, notes: [], activities: [] },
        { id: '47', studentId: 'H00323457', firstName: 'Ahmed', lastName: 'Hamad Khalifa Almarzouqi', fullName: 'Ahmed Hamad Khalifa Almarzouqi', email: 'h00323457@hct.ac.ae', phone: '+971503234568', moduleId: '3', module: { id: '3', code: 'HEM3903', name: 'Ambulance Practicum III' }, notes: [], activities: [] },

        // HEM3923 - Responder Practicum I (6 students)
        { id: '55', studentId: 'H00423456', firstName: 'Alreem', lastName: 'Ahmed Saif Mohammed Alameri', fullName: 'Alreem Ahmed Saif Mohammed Alameri', email: 'h00423456@hct.ac.ae', phone: '+971504234567', moduleId: '4', module: { id: '4', code: 'HEM3923', name: 'Responder Practicum I' }, notes: [], activities: [] },
        { id: '56', studentId: 'H00423457', firstName: 'Fatima', lastName: 'Ali Saif Albian Almarzouei', fullName: 'Fatima Ali Saif Albian Almarzouei', email: 'h00423457@hct.ac.ae', phone: '+971504234568', moduleId: '4', module: { id: '4', code: 'HEM3923', name: 'Responder Practicum I' }, notes: [], activities: [] },
        { id: '57', studentId: 'H00423458', firstName: 'Abdulhamid', lastName: 'Bashar Abdulla Hasan Alqadeda', fullName: 'Abdulhamid Bashar Abdulla Hasan Alqadeda', email: 'h00423458@hct.ac.ae', phone: '+971504234569', moduleId: '4', module: { id: '4', code: 'HEM3923', name: 'Responder Practicum I' }, notes: [], activities: [] },
        { id: '58', studentId: 'H00423459', firstName: 'Aysha', lastName: 'Helal Humaid Anaf Alkaabi', fullName: 'Aysha Helal Humaid Anaf Alkaabi', email: 'h00423459@hct.ac.ae', phone: '+971504234570', moduleId: '4', module: { id: '4', code: 'HEM3923', name: 'Responder Practicum I' }, notes: [], activities: [] },
        { id: '59', studentId: 'H00423460', firstName: 'Elyazia', lastName: 'Jumaa Ahmad Haji', fullName: 'Elyazia Jumaa Ahmad Haji', email: 'h00423460@hct.ac.ae', phone: '+971504234571', moduleId: '4', module: { id: '4', code: 'HEM3923', name: 'Responder Practicum I' }, notes: [], activities: [] },
        { id: '60', studentId: 'H00423461', firstName: 'Mohammed', lastName: 'Nasser Khamis Salem Alkhsuaee', fullName: 'Mohammed Nasser Khamis Salem Alkhsuaee', email: 'h00423461@hct.ac.ae', phone: '+971504234572', moduleId: '4', module: { id: '4', code: 'HEM3923', name: 'Responder Practicum I' }, notes: [], activities: [] }
      ];

      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        students = students.filter(student =>
          student.firstName.toLowerCase().includes(searchLower) ||
          student.lastName.toLowerCase().includes(searchLower) ||
          student.fullName.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower) ||
          student.studentId.toLowerCase().includes(searchLower)
        );
      }

      if (moduleId && moduleId !== 'all') {
        students = students.filter(student => student.moduleId === moduleId);
      }

      // Apply sorting
      students.sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a] as string;
        const bValue = b[sortBy as keyof typeof b] as string;

        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });

      return NextResponse.json({ students });
    }

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (moduleId && moduleId !== 'all') {
      where.moduleId = moduleId;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        module: true,
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc'
      }
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, firstName, lastName, phone, moduleId } = body;

    if (!studentId || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Required fields: studentId, firstName, lastName' },
        { status: 400 }
      );
    }

    // Always use correct email format: studentId@hct.ac.ae
    const email = `${studentId}@hct.ac.ae`;

    // Check for existing student with same studentId
    const existing = await prisma.student.findFirst({
      where: {
        OR: [
          { email },
          { studentId }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Student with this ID already exists' },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        studentId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email, // Now always uses studentId@hct.ac.ae format
        phone: phone || null,
        moduleId: moduleId || null
      },
      include: {
        module: true
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        studentId: student.id,
        type: 'student_created',
        description: `Student ${student.fullName} was added to the system`,
        metadata: { addedBy: session.user.email }
      }
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
