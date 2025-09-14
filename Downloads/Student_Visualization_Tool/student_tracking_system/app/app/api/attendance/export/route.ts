import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const moduleId = url.searchParams.get('moduleId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const dateRange = url.searchParams.get('dateRange'); // 'day', 'month', 'all'
    const specificDate = url.searchParams.get('specificDate');
    const format_type = url.searchParams.get('format') || 'csv'; // 'csv', 'json', 'xlsx'
    const includeNotes = url.searchParams.get('includeNotes') === 'true';
    const groupBy = url.searchParams.get('groupBy') || 'student'; // 'student', 'date', 'module'

    let dateFilter = {};

    // Handle different date range options
    if (dateRange === 'day' && specificDate) {
      const date = new Date(specificDate);
      dateFilter = {
        date: {
          gte: startOfDay(date),
          lte: endOfDay(date)
        }
      };
    } else if (dateRange === 'month' && specificDate) {
      const date = new Date(specificDate);
      dateFilter = {
        date: {
          gte: startOfMonth(date),
          lte: endOfMonth(date)
        }
      };
    } else if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    const where: any = {};
    if (moduleId) {
      where.classSession = {
        moduleId: moduleId
      };
    }

    // Build the query
    const attendanceRecords = await prisma.attendance.findMany({
      where,
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
            module: {
              select: {
                code: true,
                name: true
              }
            }
          }
        },
        classSession: {
          where: dateFilter,
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
            endTime: true,
            type: true,
            module: {
              select: {
                code: true,
                name: true
              }
            },
            location: {
              select: {
                name: true,
                building: true
              }
            }
          }
        },
        marker: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { classSession: { date: 'desc' } },
        { student: { lastName: 'asc' } }
      ]
    });

    // Filter records based on date if classSession date filter was applied
    const filteredRecords = attendanceRecords.filter(record => {
      if (!record.classSession) return false;

      if (dateRange === 'day' && specificDate) {
        const recordDate = format(new Date(record.classSession.date), 'yyyy-MM-dd');
        const targetDate = format(new Date(specificDate), 'yyyy-MM-dd');
        return recordDate === targetDate;
      }

      if (dateRange === 'month' && specificDate) {
        const recordMonth = format(new Date(record.classSession.date), 'yyyy-MM');
        const targetMonth = format(new Date(specificDate), 'yyyy-MM');
        return recordMonth === targetMonth;
      }

      if (startDate && endDate) {
        const recordDate = new Date(record.classSession.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return recordDate >= start && recordDate <= end;
      }

      return true;
    });

    if (format_type === 'json') {
      return NextResponse.json({
        data: filteredRecords,
        summary: {
          totalRecords: filteredRecords.length,
          dateRange: dateRange || 'custom',
          exportedAt: new Date().toISOString(),
          groupBy: groupBy
        }
      });
    }

    // Generate CSV content
    const csvData = generateCSV(filteredRecords, groupBy, includeNotes);

    // Set appropriate filename
    let filename = 'attendance_export';
    if (moduleId) {
      const module = await prisma.module.findUnique({ where: { id: moduleId } });
      filename += `_${module?.code || 'module'}`;
    }
    if (dateRange === 'day' && specificDate) {
      filename += `_${format(new Date(specificDate), 'yyyy-MM-dd')}`;
    } else if (dateRange === 'month' && specificDate) {
      filename += `_${format(new Date(specificDate), 'yyyy-MM')}`;
    } else if (startDate && endDate) {
      filename += `_${format(new Date(startDate), 'yyyy-MM-dd')}_to_${format(new Date(endDate), 'yyyy-MM-dd')}`;
    } else {
      filename += '_all_time';
    }
    filename += '.csv';

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Attendance export error:', error);
    return NextResponse.json(
      { error: 'Failed to export attendance' },
      { status: 500 }
    );
  }
}

function generateCSV(records: any[], groupBy: string, includeNotes: boolean): string {
  if (records.length === 0) {
    return 'No attendance records found for the specified criteria';
  }

  let headers: string[] = [];
  let rows: string[][] = [];

  if (groupBy === 'student') {
    headers = [
      'Student ID',
      'Student Name',
      'Module Code',
      'Module Name',
      'Class Date',
      'Class Title',
      'Class Time',
      'Location',
      'Status',
      'Marked At',
      'Marked By'
    ];

    if (includeNotes) {
      headers.push('Notes');
    }

    rows = records.map(record => {
      const row = [
        record.student?.studentId || '',
        record.student?.fullName || '',
        record.classSession?.module?.code || '',
        record.classSession?.module?.name || '',
        record.classSession ? format(new Date(record.classSession.date), 'yyyy-MM-dd') : '',
        record.classSession?.title || '',
        record.classSession ? `${record.classSession.startTime} - ${record.classSession.endTime}` : '',
        record.classSession?.location?.name || '',
        record.status,
        record.markedAt ? format(new Date(record.markedAt), 'yyyy-MM-dd HH:mm:ss') : '',
        record.marker?.name || ''
      ];

      if (includeNotes) {
        row.push(record.notes || '');
      }

      return row;
    });
  } else if (groupBy === 'date') {
    // Group by date for daily attendance summaries
    const dateGroups = records.reduce((groups: any, record) => {
      const date = record.classSession ? format(new Date(record.classSession.date), 'yyyy-MM-dd') : 'unknown';
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
      return groups;
    }, {});

    headers = [
      'Date',
      'Module Code',
      'Class Title',
      'Total Students',
      'Present',
      'Absent',
      'Late',
      'Excused',
      'Attendance Rate'
    ];

    rows = Object.entries(dateGroups).map(([date, records]: [string, any]) => {
      const total = records.length;
      const present = records.filter((r: any) => r.status === 'present').length;
      const absent = records.filter((r: any) => r.status === 'absent').length;
      const late = records.filter((r: any) => r.status === 'late').length;
      const excused = records.filter((r: any) => r.status === 'excused').length;
      const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

      return [
        date,
        records[0]?.classSession?.module?.code || '',
        records[0]?.classSession?.title || '',
        total.toString(),
        present.toString(),
        absent.toString(),
        late.toString(),
        excused.toString(),
        `${attendanceRate}%`
      ];
    });
  }

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}