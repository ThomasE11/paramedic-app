
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

interface TrackingData {
  timestamp: number;
  handLandmarks: Array<{x: number, y: number, z: number}>[];
  poseLandmarks: Array<{x: number, y: number, z: number}>;
  targetHits: Array<{targetId: string, accuracy: number, timestamp: number}>;
  stepProgression: Array<{stepNumber: number, completedAt: number, accuracy: number}>;
  accuracyScores: Array<{timestamp: number, accuracy: number}>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skillId = parseInt(params.id);
    if (isNaN(skillId)) {
      return NextResponse.json({ error: 'Invalid skill ID' }, { status: 400 });
    }

    // Verify skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: {
        steps: true,
        assessmentCriteria: true
      }
    });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const duration = parseInt(formData.get('duration') as string);
    const trackingDataString = formData.get('trackingData') as string;
    const aiCoachEnabled = formData.get('aiCoachEnabled') === 'true';
    const trackingEnabled = formData.get('trackingEnabled') === 'true';

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Parse tracking data
    let trackingData: TrackingData[] = [];
    if (trackingDataString) {
      try {
        trackingData = JSON.parse(trackingDataString);
      } catch (error) {
        console.error('Error parsing tracking data:', error);
      }
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'uploads', 'enhanced-videos');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `enhanced-${session.user.id}-${skillId}-${timestamp}.webm`;
    const filepath = path.join(uploadDir, filename);

    // Save video file
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Process tracking data for database storage
    const processedTrackingData = processTrackingDataForStorage(trackingData);

    // Create enhanced video analysis session
    const analysisSession = await prisma.videoAnalysisSession.create({
      data: {
        userId: session.user.id,
        skillId: skillId,
        videoPath: filepath,
        videoDuration: duration,
        status: 'PROCESSING'
      }
    });

    // Start background processing
    processEnhancedVideoAnalysis(analysisSession.id, filepath, trackingData, skill);

    return NextResponse.json({
      sessionId: analysisSession.id,
      status: 'PROCESSING',
      message: 'Enhanced video uploaded and analysis started'
    });

  } catch (error) {
    console.error('Error in enhanced video analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get analysis session with results
    const analysisSession = await prisma.videoAnalysisSession.findUnique({
      where: { id: sessionId },
      include: {
        analysisResults: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        skill: {
          select: {
            id: true,
            name: true,
            steps: true
          }
        }
      }
    });

    if (!analysisSession) {
      return NextResponse.json({ error: 'Analysis session not found' }, { status: 404 });
    }

    if (analysisSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(analysisSession);

  } catch (error) {
    console.error('Error fetching enhanced analysis results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function processTrackingDataForStorage(trackingData: TrackingData[]) {
  // Process and aggregate tracking data for efficient storage
  return {
    totalDataPoints: trackingData.length,
    timeRange: {
      start: trackingData[0]?.timestamp || 0,
      end: trackingData[trackingData.length - 1]?.timestamp || 0
    },
    handTrackingStats: calculateHandTrackingStats(trackingData),
    poseTrackingStats: calculatePoseTrackingStats(trackingData),
    accuracyProgression: calculateAccuracyProgression(trackingData),
    stepProgression: extractStepProgression(trackingData),
    targetHitAnalysis: analyzeTargetHits(trackingData)
  };
}

function calculateAverageAccuracy(trackingData: TrackingData[]): number {
  const allAccuracyScores = trackingData.flatMap(data => data.accuracyScores);
  if (allAccuracyScores.length === 0) return 0;
  
  return allAccuracyScores.reduce((sum, score) => sum + score.accuracy, 0) / allAccuracyScores.length;
}

function extractCompletedSteps(trackingData: TrackingData[]): number[] {
  const allStepProgression = trackingData.flatMap(data => data.stepProgression);
  return [...new Set(allStepProgression.map(step => step.stepNumber))];
}

function countTotalTargetHits(trackingData: TrackingData[]): number {
  return trackingData.reduce((count, data) => count + data.targetHits.length, 0);
}

function calculateHandTrackingStats(trackingData: TrackingData[]) {
  const handDataPoints = trackingData.filter(data => data.handLandmarks.length > 0);
  
  return {
    totalDataPoints: handDataPoints.length,
    averageHandsDetected: handDataPoints.reduce((sum, data) => sum + data.handLandmarks.length, 0) / handDataPoints.length,
    trackingQuality: handDataPoints.length / trackingData.length
  };
}

function calculatePoseTrackingStats(trackingData: TrackingData[]) {
  const poseDataPoints = trackingData.filter(data => data.poseLandmarks.length > 0);
  
  return {
    totalDataPoints: poseDataPoints.length,
    trackingQuality: poseDataPoints.length / trackingData.length
  };
}

function calculateAccuracyProgression(trackingData: TrackingData[]) {
  const allAccuracyScores = trackingData.flatMap(data => data.accuracyScores);
  
  // Group by time intervals (e.g., every 10 seconds)
  const timeIntervals: Record<number, number[]> = {};
  allAccuracyScores.forEach(score => {
    const interval = Math.floor(score.timestamp / 10000) * 10000; // 10-second intervals
    if (!timeIntervals[interval]) {
      timeIntervals[interval] = [];
    }
    timeIntervals[interval].push(score.accuracy);
  });
  
  return Object.entries(timeIntervals).map(([timestamp, accuracies]) => ({
    timestamp: parseInt(timestamp),
    averageAccuracy: accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
  }));
}

function extractStepProgression(trackingData: TrackingData[]) {
  const allStepProgression = trackingData.flatMap(data => data.stepProgression);
  
  return allStepProgression.map(step => ({
    stepNumber: step.stepNumber,
    completedAt: step.completedAt,
    accuracy: step.accuracy
  }));
}

function analyzeTargetHits(trackingData: TrackingData[]) {
  const allTargetHits = trackingData.flatMap(data => data.targetHits);
  
  // Group by target ID
  const targetStats: Record<string, {
    hitCount: number;
    totalAccuracy: number;
    timestamps: number[];
  }> = {};
  
  allTargetHits.forEach(hit => {
    if (!targetStats[hit.targetId]) {
      targetStats[hit.targetId] = {
        hitCount: 0,
        totalAccuracy: 0,
        timestamps: []
      };
    }
    targetStats[hit.targetId].hitCount++;
    targetStats[hit.targetId].totalAccuracy += hit.accuracy;
    targetStats[hit.targetId].timestamps.push(hit.timestamp);
  });
  
  return Object.entries(targetStats).map(([targetId, stats]) => ({
    targetId,
    hitCount: stats.hitCount,
    averageAccuracy: stats.totalAccuracy / stats.hitCount,
    firstHitTime: Math.min(...stats.timestamps),
    lastHitTime: Math.max(...stats.timestamps)
  }));
}

async function processEnhancedVideoAnalysis(
  sessionId: string,
  videoPath: string,
  trackingData: TrackingData[],
  skill: any
) {
  try {
    // This function would run in the background
    // For now, we'll simulate the processing
    
    setTimeout(async () => {
      try {
        // Generate enhanced analysis results
        const enhancedResults = await generateEnhancedAnalysisResults(trackingData, skill);
        
        // Save results to database
        await prisma.videoAnalysisResult.create({
          data: {
            sessionId: sessionId,
            overallScore: enhancedResults.overallScore,
            techniqueScore: enhancedResults.techniqueScore,
            sequenceScore: enhancedResults.sequenceScore,
            timingScore: enhancedResults.timingScore,
            communicationScore: enhancedResults.communicationScore,
            overallFeedback: enhancedResults.overallFeedback,
            strengths: enhancedResults.strengths,
            areasForImprovement: enhancedResults.areasForImprovement,
            specificRecommendations: enhancedResults.specificRecommendations,
            stepAnalysis: enhancedResults.stepAnalysis,
            detectedSteps: enhancedResults.detectedSteps,
            missedSteps: enhancedResults.missedSteps,
            incorrectSteps: enhancedResults.incorrectSteps
          }
        });
        
        // Update session status
        await prisma.videoAnalysisSession.update({
          where: { id: sessionId },
          data: { status: 'COMPLETED' }
        });
        
        console.log(`✅ Enhanced analysis completed for session ${sessionId}`);
        
      } catch (error) {
        console.error('Error in enhanced analysis processing:', error);
        
        // Mark session as failed
        await prisma.videoAnalysisSession.update({
          where: { id: sessionId },
          data: { status: 'FAILED' }
        });
      }
    }, 5000); // Simulate processing time
    
  } catch (error) {
    console.error('Error starting enhanced analysis:', error);
  }
}

async function generateEnhancedAnalysisResults(trackingData: TrackingData[], skill: any) {
  // Calculate enhanced metrics based on tracking data
  const averageAccuracy = calculateAverageAccuracy(trackingData);
  const completedSteps = extractCompletedSteps(trackingData);
  const totalSteps = skill.steps?.length || 1;
  const stepCompletionRate = completedSteps.length / totalSteps;
  
  const overallScore = (averageAccuracy + stepCompletionRate) / 2;
  const techniqueScore = averageAccuracy;
  const sequenceScore = stepCompletionRate;
  const timingScore = calculateTimingScore(trackingData, skill);
  const communicationScore = 0.8; // Placeholder
  
  // Generate comprehensive feedback
  const feedback = generateEnhancedFeedback(trackingData, skill);
  
  return {
    overallScore,
    techniqueScore,
    sequenceScore,
    timingScore,
    communicationScore,
    overallFeedback: feedback.overall,
    strengths: feedback.strengths,
    areasForImprovement: feedback.improvements,
    specificRecommendations: feedback.recommendations,
    stepAnalysis: generateStepAnalysis(trackingData, skill),
    detectedSteps: completedSteps,
    missedSteps: findMissedSteps(completedSteps, totalSteps),
    incorrectSteps: [], // Would be determined by analysis
    timestampAnalysis: generateTimestampAnalysis(trackingData),
    educationalRecommendations: generateEducationalRecommendations(trackingData, skill)
  };
}

function calculateTimingScore(trackingData: TrackingData[], skill: any): number {
  const sessionDuration = trackingData.length > 0 ? 
    (trackingData[trackingData.length - 1].timestamp - trackingData[0].timestamp) / 1000 : 0;
  const expectedDuration = skill.estimatedTimeMinutes * 60;
  
  return Math.min(1, expectedDuration / sessionDuration);
}

function generateEnhancedFeedback(trackingData: TrackingData[], skill: any) {
  const averageAccuracy = calculateAverageAccuracy(trackingData);
  const completedSteps = extractCompletedSteps(trackingData);
  
  const overall = `Based on your enhanced video analysis, you achieved ${Math.round(averageAccuracy * 100)}% accuracy and completed ${completedSteps.length} out of ${skill.steps?.length || 1} steps.`;
  
  const strengths = [];
  const improvements = [];
  const recommendations = [];
  
  if (averageAccuracy > 0.8) {
    strengths.push('Excellent hand positioning and target accuracy');
  }
  if (completedSteps.length / (skill.steps?.length || 1) > 0.8) {
    strengths.push('Good step completion rate');
  }
  
  if (averageAccuracy < 0.6) {
    improvements.push('Hand positioning and target accuracy need improvement');
    recommendations.push('Practice with slower, more deliberate movements');
  }
  
  return {
    overall,
    strengths,
    improvements,
    recommendations
  };
}

function generateStepAnalysis(trackingData: TrackingData[], skill: any) {
  const stepProgression = extractStepProgression(trackingData);
  
  return skill.steps?.map((step: any) => {
    const stepData = stepProgression.find(sp => sp.stepNumber === step.stepNumber);
    
    return {
      stepNumber: step.stepNumber,
      detected: !!stepData,
      accuracy: stepData?.accuracy || 0,
      timing: stepData?.completedAt || 0,
      feedback: stepData ? 'Step completed successfully' : 'Step not detected or completed',
      criticalErrors: [],
      suggestions: stepData ? [] : ['Focus on completing this step more clearly']
    };
  }) || [];
}

function findMissedSteps(completedSteps: number[], totalSteps: number): number[] {
  const allSteps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  return allSteps.filter(step => !completedSteps.includes(step));
}

interface TimestampMoment {
  time: string;
  description: string;
  skill: string;
  suggestion: string;
}

function generateTimestampAnalysis(trackingData: TrackingData[]) {
  const excellentMoments: TimestampMoment[] = [];
  const improvementMoments: TimestampMoment[] = [];
  
  trackingData.forEach(data => {
    data.accuracyScores.forEach(score => {
      if (score.accuracy > 0.9) {
        excellentMoments.push({
          time: new Date(score.timestamp).toISOString(),
          description: 'Excellent technique demonstrated',
          skill: 'Hand positioning',
          suggestion: 'Keep up this level of precision'
        });
      } else if (score.accuracy < 0.4) {
        improvementMoments.push({
          time: new Date(score.timestamp).toISOString(),
          description: 'Technique needs improvement',
          skill: 'Hand positioning',
          suggestion: 'Focus on more precise movements'
        });
      }
    });
  });
  
  return {
    excellentMoments,
    improvementMoments
  };
}

function generateEducationalRecommendations(trackingData: TrackingData[], skill: any): string[] {
  const recommendations = [];
  const averageAccuracy = calculateAverageAccuracy(trackingData);
  
  if (averageAccuracy < 0.7) {
    recommendations.push('Practice hand positioning exercises to improve accuracy');
    recommendations.push('Use visual guides and targets during practice');
  }
  
  recommendations.push('Review the skill demonstration video');
  recommendations.push('Practice with a mentor or instructor for feedback');
  
  return recommendations;
}
