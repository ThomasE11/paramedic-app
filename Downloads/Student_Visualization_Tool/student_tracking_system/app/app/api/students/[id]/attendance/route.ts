import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const moduleId = url.searchParams.get('moduleId');
    const includeStats = url.searchParams.get('includeStats') === 'true';

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        classSession: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      };
    }

    // Build module filter
    let moduleFilter = {};
    if (moduleId) {
      moduleFilter = {
        classSession: {
          moduleId: moduleId
        }
      };
    }

    // Get student info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        module: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: studentId,
        ...dateFilter,
        ...moduleFilter
      },
      include: {
        classSession: {
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
      orderBy: {
        classSession: {
          date: 'desc'
        }
      }
    });

    let response: any = {
      student: {
        id: student.id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        module: student.module
      },
      attendance: attendanceRecords
    };

    // Calculate statistics if requested
    if (includeStats) {
      const total = attendanceRecords.length;
      const present = attendanceRecords.filter(r => r.status === 'present').length;
      const absent = attendanceRecords.filter(r => r.status === 'absent').length;
      const late = attendanceRecords.filter(r => r.status === 'late').length;
      const excused = attendanceRecords.filter(r => r.status === 'excused').length;

      const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
      const punctualityRate = total > 0 ? Math.round(((present + excused) / total) * 100) : 0;

      // Group by month for trends
      const monthlyStats = attendanceRecords.reduce((acc: any, record) => {
        const month = format(new Date(record.classSession.date), 'yyyy-MM');
        if (!acc[month]) {
          acc[month] = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
        }
        acc[month].total++;
        acc[month][record.status]++;
        return acc;
      }, {});

      // Convert monthly stats to array with attendance rates
      const monthlyTrends = Object.entries(monthlyStats).map(([month, stats]: [string, any]) => ({
        month,
        ...stats,
        attendanceRate: Math.round((stats.present / stats.total) * 100)
      })).sort((a, b) => a.month.localeCompare(b.month));

      response.statistics = {
        overview: {
          totalSessions: total,
          presentCount: present,
          absentCount: absent,
          lateCount: late,
          excusedCount: excused,
          attendanceRate,
          punctualityRate
        },
        monthlyTrends,
        recentPattern: attendanceRecords.slice(0, 10).map(r => ({
          date: r.classSession.date,
          status: r.status,
          notes: r.notes
        }))
      };

      // Add alerts for concerning patterns
      const alerts = [];

      // Check recent absences
      const recentRecords = attendanceRecords.slice(0, 5);
      const recentAbsences = recentRecords.filter(r => r.status === 'absent').length;
      if (recentAbsences >= 3) {
        alerts.push({
          type: 'warning',
          message: `${recentAbsences} absences in the last 5 sessions`,
          severity: 'high'
        });
      }

      // Check overall attendance rate
      if (attendanceRate < 75) {
        alerts.push({
          type: 'danger',
          message: `Low attendance rate: ${attendanceRate}%`,
          severity: 'high'
        });
      } else if (attendanceRate < 85) {
        alerts.push({
          type: 'warning',
          message: `Below average attendance: ${attendanceRate}%`,
          severity: 'medium'
        });
      }

      // Check chronic lateness
      const lateRate = total > 0 ? Math.round((late / total) * 100) : 0;
      if (lateRate > 20) {
        alerts.push({
          type: 'info',
          message: `Frequent lateness: ${lateRate}% of sessions`,
          severity: 'medium'
        });
      }

      response.statistics.alerts = alerts;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Student attendance fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student attendance' },
      { status: 500 }
    );
  }
}