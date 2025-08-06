
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { Button } from './button';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Activity,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { Skill } from '@/lib/types';

interface TrackingData {
  timestamp: number;
  handLandmarks: Array<{x: number, y: number, z: number}>[];
  poseLandmarks: Array<{x: number, y: number, z: number}>;
  targetHits: Array<{targetId: string, accuracy: number, timestamp: number}>;
  stepProgression: Array<{stepNumber: number, completedAt: number, accuracy: number}>;
  accuracyScores: Array<{timestamp: number, accuracy: number}>;
}

interface PerformanceMetrics {
  overallAccuracy: number;
  precisionScore: number;
  timingScore: number;
  stepCompletionRate: number;
  consistencyScore: number;
  errorRate: number;
  totalTargetHits: number;
  averageResponseTime: number;
  skillMasteryLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface TrackingPerformanceAnalyzerProps {
  skill: Skill;
  trackingData: TrackingData[];
  videoDuration: number;
  onAnalysisComplete?: (metrics: PerformanceMetrics) => void;
  className?: string;
}

export function TrackingPerformanceAnalyzer({
  skill,
  trackingData,
  videoDuration,
  onAnalysisComplete,
  className = ''
}: TrackingPerformanceAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);

  // Calculate comprehensive performance metrics
  const calculateMetrics = useMemo(() => {
    if (!trackingData.length) return null;

    const allTargetHits = trackingData.flatMap(data => data.targetHits);
    const allStepProgression = trackingData.flatMap(data => data.stepProgression);
    const allAccuracyScores = trackingData.flatMap(data => data.accuracyScores);

    // Overall accuracy calculation
    const overallAccuracy = allAccuracyScores.length > 0 
      ? allAccuracyScores.reduce((sum, score) => sum + score.accuracy, 0) / allAccuracyScores.length
      : 0;

    // Precision score based on target hits
    const precisionScore = allTargetHits.length > 0
      ? allTargetHits.reduce((sum, hit) => sum + hit.accuracy, 0) / allTargetHits.length
      : 0;

    // Timing score based on expected vs actual duration
    const expectedDuration = skill.estimatedTimeMinutes * 60;
    const timingScore = Math.min(1, expectedDuration / videoDuration);

    // Step completion rate
    const totalSteps = skill.steps?.length || 1;
    const completedSteps = new Set(allStepProgression.map(step => step.stepNumber)).size;
    const stepCompletionRate = completedSteps / totalSteps;

    // Consistency score (variance in accuracy)
    const consistencyScore = allAccuracyScores.length > 1
      ? 1 - (calculateVariance(allAccuracyScores.map(s => s.accuracy)) / overallAccuracy)
      : overallAccuracy;

    // Error rate (percentage of missed targets)
    const totalAttempts = trackingData.length;
    const successfulHits = allTargetHits.filter(hit => hit.accuracy > 0.6).length;
    const errorRate = totalAttempts > 0 ? 1 - (successfulHits / totalAttempts) : 1;

    // Average response time
    const responseTimes = allStepProgression.map((step, index) => {
      const previousStep = allStepProgression[index - 1];
      return previousStep ? step.completedAt - previousStep.completedAt : 0;
    }).filter(time => time > 0);
    
    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Skill mastery level
    const skillMasteryLevel = determineSkillLevel(
      overallAccuracy,
      precisionScore,
      stepCompletionRate,
      consistencyScore
    );

    // Generate strengths, weaknesses, and recommendations
    const { strengths, weaknesses, recommendations } = generateFeedback(
      overallAccuracy,
      precisionScore,
      timingScore,
      stepCompletionRate,
      consistencyScore,
      errorRate,
      skill
    );

    return {
      overallAccuracy,
      precisionScore,
      timingScore,
      stepCompletionRate,
      consistencyScore,
      errorRate,
      totalTargetHits: allTargetHits.length,
      averageResponseTime,
      skillMasteryLevel,
      strengths,
      weaknesses,
      recommendations
    };
  }, [trackingData, videoDuration, skill]);

  const calculateVariance = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  const determineSkillLevel = (
    accuracy: number,
    precision: number,
    completion: number,
    consistency: number
  ): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' => {
    const overallScore = (accuracy + precision + completion + consistency) / 4;
    
    if (overallScore >= 0.9) return 'EXPERT';
    if (overallScore >= 0.75) return 'ADVANCED';
    if (overallScore >= 0.6) return 'INTERMEDIATE';
    return 'BEGINNER';
  };

  const generateFeedback = (
    accuracy: number,
    precision: number,
    timing: number,
    completion: number,
    consistency: number,
    errorRate: number,
    skill: Skill
  ) => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze strengths
    if (accuracy >= 0.8) strengths.push('Excellent overall accuracy');
    if (precision >= 0.8) strengths.push('High precision in target achievement');
    if (timing >= 0.8) strengths.push('Good timing and pace');
    if (completion >= 0.9) strengths.push('Thorough step completion');
    if (consistency >= 0.8) strengths.push('Consistent performance throughout');

    // Analyze weaknesses
    if (accuracy < 0.6) weaknesses.push('Overall accuracy needs improvement');
    if (precision < 0.6) weaknesses.push('Target precision could be better');
    if (timing < 0.6) weaknesses.push('Timing and pacing need work');
    if (completion < 0.8) weaknesses.push('Some steps were missed or incomplete');
    if (consistency < 0.6) weaknesses.push('Performance consistency varies');
    if (errorRate > 0.4) weaknesses.push('Error rate is higher than expected');

    // Generate recommendations
    if (accuracy < 0.7) {
      recommendations.push('Practice the skill more frequently to improve accuracy');
      recommendations.push('Focus on slow, deliberate movements initially');
    }
    if (precision < 0.7) {
      recommendations.push('Work on hand positioning and target acquisition');
      recommendations.push('Use practice aids to improve precision');
    }
    if (timing < 0.7) {
      recommendations.push('Practice with a timer to improve pacing');
      recommendations.push(`Aim for completion within ${skill.estimatedTimeMinutes} minutes`);
    }
    if (completion < 0.8) {
      recommendations.push('Review all skill steps and practice each one');
      recommendations.push('Use step-by-step checklists during practice');
    }

    return { strengths, weaknesses, recommendations };
  };

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const metrics = calculateMetrics;
    if (metrics) {
      setPerformanceMetrics(metrics);
      setAnalysisComplete(true);
      onAnalysisComplete?.(metrics);
    }
    
    setIsAnalyzing(false);
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'EXPERT': return 'bg-green-500';
      case 'ADVANCED': return 'bg-blue-500';
      case 'INTERMEDIATE': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isAnalyzing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            Analyzing Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <p className="text-gray-600 mb-2">Processing tracking data...</p>
            <p className="text-sm text-gray-500">
              Analyzing hand movements, target accuracy, and step progression
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisComplete) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
            <p className="text-gray-600 mb-6">
              Click below to analyze your tracking performance and get detailed insights
            </p>
            <Button onClick={performAnalysis} className="bg-blue-500 hover:bg-blue-600">
              <Eye className="h-4 w-4 mr-2" />
              Start Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!performanceMetrics) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Performance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance Overview
            </CardTitle>
            <Badge className={getMasteryColor(performanceMetrics.skillMasteryLevel)}>
              {performanceMetrics.skillMasteryLevel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(performanceMetrics.overallAccuracy)}`}>
                {Math.round(performanceMetrics.overallAccuracy * 100)}%
              </div>
              <div className="text-sm text-gray-600">Overall Accuracy</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(performanceMetrics.precisionScore)}`}>
                {Math.round(performanceMetrics.precisionScore * 100)}%
              </div>
              <div className="text-sm text-gray-600">Precision</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(performanceMetrics.timingScore)}`}>
                {Math.round(performanceMetrics.timingScore * 100)}%
              </div>
              <div className="text-sm text-gray-600">Timing</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(performanceMetrics.stepCompletionRate)}`}>
                {Math.round(performanceMetrics.stepCompletionRate * 100)}%
              </div>
              <div className="text-sm text-gray-600">Step Completion</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Consistency Score</span>
                <span className="text-sm text-gray-500">
                  {Math.round(performanceMetrics.consistencyScore * 100)}%
                </span>
              </div>
              <Progress value={performanceMetrics.consistencyScore * 100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm text-gray-500">
                  {Math.round(performanceMetrics.errorRate * 100)}%
                </span>
              </div>
              <Progress value={performanceMetrics.errorRate * 100} className="h-2 bg-red-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {performanceMetrics.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
              {performanceMetrics.strengths.length === 0 && (
                <li className="text-sm text-gray-500 italic">
                  Keep practicing to develop your strengths
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {performanceMetrics.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
              {performanceMetrics.weaknesses.length === 0 && (
                <li className="text-sm text-gray-500 italic">
                  Great job! No major weaknesses identified
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {performanceMetrics.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                </div>
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Detailed Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {performanceMetrics.totalTargetHits}
              </div>
              <div className="text-sm text-gray-600">Total Target Hits</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(performanceMetrics.averageResponseTime / 1000)}s
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(videoDuration / 60)}m {videoDuration % 60}s
              </div>
              <div className="text-sm text-gray-600">Total Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TrackingPerformanceAnalyzer;
