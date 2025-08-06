
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const skillId = searchParams.get('skillId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build where clause for video analysis sessions
    const whereClause: any = {
      user: { role: 'STUDENT' },
      status: 'COMPLETED'
    };

    if (studentId) {
      whereClause.userId = studentId;
    }

    if (skillId) {
      whereClause.skillId = parseInt(skillId);
    }

    // Get AI analysis results from video sessions
    const aiAnalysis = await prisma.videoAnalysisSession.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          }
        },
        skill: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                name: true,
                colorCode: true,
              }
            }
          }
        },
        analysisResults: {
          orderBy: { createdAt: 'desc' },
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Get summary statistics
    const totalSessions = await prisma.videoAnalysisSession.count({
      where: whereClause,
    });

    const averageScores = await prisma.videoAnalysisResult.aggregate({
      where: {
        session: whereClause
      },
      _avg: {
        overallScore: true,
        techniqueScore: true,
        sequenceScore: true,
        timingScore: true,
        communicationScore: true,
      }
    });

    // Get performance trends
    const performanceTrends = await prisma.videoAnalysisResult.findMany({
      where: {
        session: whereClause
      },
      select: {
        overallScore: true,
        createdAt: true,
        session: {
          select: {
            user: {
              select: {
                name: true,
                id: true,
              }
            },
            skill: {
              select: {
                name: true,
                id: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json({
      aiAnalysis,
      summary: {
        totalSessions,
        averageScores: {
          overall: averageScores._avg.overallScore || 0,
          technique: averageScores._avg.techniqueScore || 0,
          sequence: averageScores._avg.sequenceScore || 0,
          timing: averageScores._avg.timingScore || 0,
          communication: averageScores._avg.communicationScore || 0,
        },
      },
      performanceTrends,
      pagination: {
        currentPage: page,
        limit,
        hasMore: aiAnalysis.length === limit,
      }
    });
  } catch (error) {
    console.error('Error fetching AI feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
