import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { format } from 'date-fns';

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: classId } = await params;

    // Fetch comprehensive class data with all relationships
    const classSession = await prisma.classSession.findUnique({
      where: { id: classId },
      include: {
        module: {
          include: {
            students: true
          }
        },
        subject: true,
        location: true,
        instructor: true,
        attendance: {
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                firstName: true,
                lastName: true,
                fullName: true,
                email: true,
                phone: true,
                dateOfBirth: true,
                address: true,
                emergencyContact: true,
                emergencyPhone: true
              }
            },
            markedBy: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: [
            { student: { lastName: 'asc' } },
            { student: { firstName: 'asc' } }
          ]
        }
      }
    });

    if (!classSession) {
      return NextResponse.json({ error: 'Class session not found' }, { status: 404 });
    }

    // Helper function to safely escape CSV fields
    const escapeCsvField = (field: any): string => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    // Format class date and time
    const classDate = format(new Date(classSession.date), 'EEEE, MMMM d, yyyy');
    const classTime = `${classSession.startTime} - ${classSession.endTime}`;

    // Create comprehensive class export data
    const exportData = {
      classDetails: {
        title: classSession.title,
        description: classSession.description || '',
        date: classDate,
        time: classTime,
        duration: `${classSession.duration} minutes`,
        type: classSession.type,
        status: classSession.status,
        capacity: classSession.capacity || 'Unlimited',
        notes: classSession.notes || ''
      },
      moduleInfo: classSession.module ? {
        code: classSession.module.code,
        name: classSession.module.name,
        description: classSession.module.description || '',
        credits: classSession.module.credits || '',
        semester: classSession.module.semester || '',
        totalEnrolledStudents: classSession.module.students?.length || 0
      } : null,
      subjectInfo: classSession.subject ? {
        code: classSession.subject.code,
        name: classSession.subject.name,
        description: classSession.subject.description || ''
      } : null,
      locationInfo: classSession.location ? {
        name: classSession.location.name,
        building: classSession.location.building || '',
        room: classSession.location.room || '',
        capacity: classSession.location.capacity || '',
        address: classSession.location.address || ''
      } : null,
      instructorInfo: classSession.instructor ? {
        name: classSession.instructor.name,
        email: classSession.instructor.email,
        phone: classSession.instructor.phone || ''
      } : null,
      attendanceStats: {
        totalRecorded: classSession.attendance.length,
        present: classSession.attendance.filter(a => a.status === 'present').length,
        late: classSession.attendance.filter(a => a.status === 'late').length,
        absent: classSession.attendance.filter(a => a.status === 'absent').length,
        excused: classSession.attendance.filter(a => a.status === 'excused').length,
        attendanceRate: classSession.attendance.length > 0
          ? Math.round((classSession.attendance.filter(a => ['present', 'late'].includes(a.status)).length / classSession.attendance.length) * 100)
          : 0
      },
      attendanceRecords: classSession.attendance
    };

    // Check if JSON export is requested
    const url = new URL(request.url);
    const format_param = url.searchParams.get('format');

    if (format_param === 'json') {
      const filename = `class-export-${classSession.title.replace(/[^a-zA-Z0-9]/g, '-')}-${format(new Date(classSession.date), 'yyyy-MM-dd')}.json`;

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    // Generate comprehensive CSV export
    let csvContent = '';

    // Class Information Section
    csvContent += 'CLASS INFORMATION\n';
    csvContent += `Title,${escapeCsvField(exportData.classDetails.title)}\n`;
    csvContent += `Description,${escapeCsvField(exportData.classDetails.description)}\n`;
    csvContent += `Date,${escapeCsvField(exportData.classDetails.date)}\n`;
    csvContent += `Time,${escapeCsvField(exportData.classDetails.time)}\n`;
    csvContent += `Duration,${escapeCsvField(exportData.classDetails.duration)}\n`;
    csvContent += `Type,${escapeCsvField(exportData.classDetails.type)}\n`;
    csvContent += `Status,${escapeCsvField(exportData.classDetails.status)}\n`;
    csvContent += `Capacity,${escapeCsvField(exportData.classDetails.capacity)}\n`;
    csvContent += `Notes,${escapeCsvField(exportData.classDetails.notes)}\n`;
    csvContent += '\n';

    // Module Information Section
    if (exportData.moduleInfo) {
      csvContent += 'MODULE INFORMATION\n';
      csvContent += `Code,${escapeCsvField(exportData.moduleInfo.code)}\n`;
      csvContent += `Name,${escapeCsvField(exportData.moduleInfo.name)}\n`;
      csvContent += `Description,${escapeCsvField(exportData.moduleInfo.description)}\n`;
      csvContent += `Credits,${escapeCsvField(exportData.moduleInfo.credits)}\n`;
      csvContent += `Semester,${escapeCsvField(exportData.moduleInfo.semester)}\n`;
      csvContent += `Total Enrolled Students,${exportData.moduleInfo.totalEnrolledStudents}\n`;
      csvContent += '\n';
    }

    // Subject Information Section
    if (exportData.subjectInfo) {
      csvContent += 'SUBJECT INFORMATION\n';
      csvContent += `Code,${escapeCsvField(exportData.subjectInfo.code)}\n`;
      csvContent += `Name,${escapeCsvField(exportData.subjectInfo.name)}\n`;
      csvContent += `Description,${escapeCsvField(exportData.subjectInfo.description)}\n`;
      csvContent += '\n';
    }

    // Location Information Section
    if (exportData.locationInfo) {
      csvContent += 'LOCATION INFORMATION\n';
      csvContent += `Name,${escapeCsvField(exportData.locationInfo.name)}\n`;
      csvContent += `Building,${escapeCsvField(exportData.locationInfo.building)}\n`;
      csvContent += `Room,${escapeCsvField(exportData.locationInfo.room)}\n`;
      csvContent += `Capacity,${escapeCsvField(exportData.locationInfo.capacity)}\n`;
      csvContent += `Address,${escapeCsvField(exportData.locationInfo.address)}\n`;
      csvContent += '\n';
    }

    // Instructor Information Section
    if (exportData.instructorInfo) {
      csvContent += 'INSTRUCTOR INFORMATION\n';
      csvContent += `Name,${escapeCsvField(exportData.instructorInfo.name)}\n`;
      csvContent += `Email,${escapeCsvField(exportData.instructorInfo.email)}\n`;
      csvContent += `Phone,${escapeCsvField(exportData.instructorInfo.phone)}\n`;
      csvContent += '\n';
    }

    // Attendance Statistics Section
    csvContent += 'ATTENDANCE STATISTICS\n';
    csvContent += `Total Recorded,${exportData.attendanceStats.totalRecorded}\n`;
    csvContent += `Present,${exportData.attendanceStats.present}\n`;
    csvContent += `Late,${exportData.attendanceStats.late}\n`;
    csvContent += `Absent,${exportData.attendanceStats.absent}\n`;
    csvContent += `Excused,${exportData.attendanceStats.excused}\n`;
    csvContent += `Attendance Rate,${exportData.attendanceStats.attendanceRate}%\n`;
    csvContent += '\n';

    // Detailed Attendance Records Section
    if (exportData.attendanceRecords.length > 0) {
      csvContent += 'DETAILED ATTENDANCE RECORDS\n';
      csvContent += 'Student ID,First Name,Last Name,Full Name,Email,Phone,Status,Time Marked,Marked By,Notes\n';

      exportData.attendanceRecords.forEach((record: any) => {
        const student = record.student;
        const markedTime = record.markedAt ? format(new Date(record.markedAt), 'yyyy-MM-dd HH:mm:ss') : '';
        const markedBy = record.markedBy?.name || 'System';

        csvContent += [
          escapeCsvField(student?.studentId || ''),
          escapeCsvField(student?.firstName || ''),
          escapeCsvField(student?.lastName || ''),
          escapeCsvField(student?.fullName || ''),
          escapeCsvField(student?.email || ''),
          escapeCsvField(student?.phone || ''),
          escapeCsvField(record.status || ''),
          escapeCsvField(markedTime),
          escapeCsvField(markedBy),
          escapeCsvField(record.notes || '')
        ].join(',') + '\n';
      });
    } else {
      csvContent += 'ATTENDANCE RECORDS\n';
      csvContent += 'No attendance records found for this class session.\n';
    }

    // Add export metadata
    csvContent += '\n';
    csvContent += 'EXPORT METADATA\n';
    csvContent += `Export Date,${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n`;
    csvContent += `Exported By,${session.user.name || session.user.email}\n`;
    csvContent += `Class ID,${classSession.id}\n`;

    const filename = `class-export-${classSession.title.replace(/[^a-zA-Z0-9]/g, '-')}-${format(new Date(classSession.date), 'yyyy-MM-dd')}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Class export error:', error);
    return NextResponse.json(
      { error: 'Failed to export class data' },
      { status: 500 }
    );
  }
}