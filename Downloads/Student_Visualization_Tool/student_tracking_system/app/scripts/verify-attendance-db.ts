#!/usr/bin/env tsx

/**
 * Verify attendance records directly in database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Verifying Attendance Records in Database\n');
  console.log('=' .repeat(60));

  try {
    // Get recent attendance records
    const recentAttendance = await prisma.attendance.findMany({
      take: 15,
      orderBy: { markedAt: 'desc' },
      include: {
        student: {
          select: {
            fullName: true,
            studentId: true
          }
        },
        classSession: {
          select: {
            title: true,
            date: true
          }
        },
        marker: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`\n📊 Found ${recentAttendance.length} recent attendance records:\n`);

    if (recentAttendance.length === 0) {
      console.log('⚠️  No attendance records found in database!\n');
      return;
    }

    // Group by class session
    const bySession = recentAttendance.reduce((acc, record) => {
      const sessionId = record.classSessionId;
      if (!acc[sessionId]) {
        acc[sessionId] = {
          session: record.classSession,
          records: []
        };
      }
      acc[sessionId].records.push(record);
      return acc;
    }, {} as any);

    for (const sessionId in bySession) {
      const { session, records } = bySession[sessionId];

      console.log(`\n📅 ${session.title}`);
      console.log(`   Date: ${new Date(session.date).toLocaleDateString()}`);
      console.log(`   Records: ${records.length}`);
      console.log('   ' + '-'.repeat(56));

      const statusCounts = {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0
      };

      for (const record of records) {
        statusCounts[record.status as keyof typeof statusCounts]++;

        const statusEmoji = {
          present: '✅',
          absent: '❌',
          late: '⏰',
          excused: '📝'
        }[record.status] || '❓';

        const studentDisplay = record.student.fullName.padEnd(35);
        const statusDisplay = record.status.padEnd(10);
        const markedAt = record.markedAt ? new Date(record.markedAt).toLocaleTimeString() : 'N/A';

        console.log(`   ${statusEmoji} ${studentDisplay} ${statusDisplay} ${markedAt}`);
      }

      console.log('   ' + '-'.repeat(56));
      console.log(`   Summary: Present: ${statusCounts.present}, Absent: ${statusCounts.absent}, Late: ${statusCounts.late}, Excused: ${statusCounts.excused}`);
    }

    // Overall statistics
    console.log('\n' + '='.repeat(60));
    console.log('\n📈 Overall Statistics:\n');

    const totalCount = await prisma.attendance.count();
    const totalStudents = await prisma.student.count();
    const totalSessions = await prisma.classSession.count();

    console.log(`   Total Attendance Records: ${totalCount}`);
    console.log(`   Total Students: ${totalStudents}`);
    console.log(`   Total Class Sessions: ${totalSessions}`);

    if (totalCount > 0) {
      const statusBreakdown = await prisma.attendance.groupBy({
        by: ['status'],
        _count: true
      });

      console.log('\n   Status Breakdown:');
      for (const item of statusBreakdown) {
        const percentage = ((item._count / totalCount) * 100).toFixed(1);
        console.log(`   - ${item.status}: ${item._count} (${percentage}%)`);
      }
    }

    console.log('\n✅ Database verification complete!\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
