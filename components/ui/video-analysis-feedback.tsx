
'use client';

import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { 
  Trophy, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Award,
  FileText,
  Volume2,
  PlayCircle,
  Star,
  BookOpen,
  Timer
} from 'lucide-react';
import { VideoAnalysisResult, StepAnalysis, TimestampAnalysis, TimestampMoment } from '@/lib/types';
import { cn } from '@/lib/utils';

interface VideoAnalysisFeedbackProps {
  result: VideoAnalysisResult;
  skillName: string;
  onRetry?: () => void;
  className?: string;
}

export function VideoAnalysisFeedback({ 
  result, 
  skillName, 
  onRetry, 
  className 
}: VideoAnalysisFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  const stepAnalysis = result.stepAnalysis as StepAnalysis[];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Performance Header */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-orange-500" />
            Performance Analysis: {skillName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Overall Score */}
            <div className={cn('text-center p-4 rounded-lg', getScoreBackground(result.overallScore))}>
              <div className={cn('text-3xl font-bold mb-1', getScoreColor(result.overallScore))}>
                {Math.round(result.overallScore)}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
              <Badge variant="outline" className="mt-2">
                {getPerformanceLevel(result.overallScore)}
              </Badge>
            </div>

            {/* Individual Scores */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Technique</span>
                <span className={cn('font-medium', getScoreColor(result.techniqueScore))}>
                  {Math.round(result.techniqueScore)}%
                </span>
              </div>
              <Progress 
                value={result.techniqueScore} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sequence</span>
                <span className={cn('font-medium', getScoreColor(result.sequenceScore))}>
                  {Math.round(result.sequenceScore)}%
                </span>
              </div>
              <Progress 
                value={result.sequenceScore} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Timing</span>
                <span className={cn('font-medium', getScoreColor(result.timingScore))}>
                  {Math.round(result.timingScore)}%
                </span>
              </div>
              <Progress 
                value={result.timingScore} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Communication</span>
                <span className={cn('font-medium', getScoreColor(result.communicationScore))}>
                  {Math.round(result.communicationScore)}%
                </span>
              </div>
              <Progress 
                value={result.communicationScore} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="steps">Step Analysis</TabsTrigger>
          <TabsTrigger value="timestamps">Timestamps</TabsTrigger>
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="recommendations">Learning</TabsTrigger>
          <TabsTrigger value="transcript">Audio</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                Overall Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{result.overallFeedback}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-green-800">Detected Steps</h3>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {result.detectedSteps.length}
                </div>
                <p className="text-sm text-green-700">
                  Steps completed correctly
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="font-medium text-yellow-800">Missed Steps</h3>
                </div>
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {result.missedSteps.length}
                </div>
                <p className="text-sm text-yellow-700">
                  Steps not performed
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center mb-2">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="font-medium text-red-800">Incorrect Steps</h3>
                </div>
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {result.incorrectSteps.length}
                </div>
                <p className="text-sm text-red-700">
                  Steps performed incorrectly
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Step Analysis Tab */}
        <TabsContent value="steps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-500" />
                Step-by-Step Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stepAnalysis?.map((step, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Step {step.stepNumber}</Badge>
                        {step.detected ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600">
                          Accuracy: <span className={cn('font-medium', getScoreColor(step.accuracy))}>
                            {step.accuracy}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Timing: <span className={cn('font-medium', getScoreColor(step.timing))}>
                            {step.timing}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{step.feedback}</p>
                    
                    {step.criticalErrors && step.criticalErrors.length > 0 && (
                      <Alert className="border-red-200 bg-red-50 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription>
                          <div className="text-red-800">
                            <p className="font-medium">Critical Errors:</p>
                            <ul className="list-disc list-inside text-sm">
                              {step.criticalErrors.map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {step.suggestions && step.suggestions.length > 0 && (
                      <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                        <div className="flex items-start">
                          <Lightbulb className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Suggestions:</p>
                            <ul className="list-disc list-inside">
                              {step.suggestions.map((suggestion, i) => (
                                <li key={i}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timestamp Analysis Tab */}
        <TabsContent value="timestamps" className="space-y-4">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Timer className="h-5 w-5 mr-2 text-blue-500" />
                Timestamp-Based Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Excellent Moments */}
                {result.timestampAnalysis?.excellentMoments && result.timestampAnalysis.excellentMoments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-800 mb-3 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-green-600" />
                      Excellent Performance Moments
                    </h4>
                    <div className="space-y-3">
                      {result.timestampAnalysis.excellentMoments.map((moment, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="bg-green-100 rounded-full p-2">
                              <PlayCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline" className="text-green-700 border-green-300">
                                  {moment.time}
                                </Badge>
                                <Badge variant="outline" className="text-blue-700 border-blue-300">
                                  {moment.skill}
                                </Badge>
                              </div>
                              <p className="text-green-800 font-medium">{moment.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvement Moments */}
                {result.timestampAnalysis?.improvementMoments && result.timestampAnalysis.improvementMoments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-800 mb-3 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-orange-600" />
                      Areas for Improvement with Timestamps
                    </h4>
                    <div className="space-y-3">
                      {result.timestampAnalysis.improvementMoments.map((moment, index) => (
                        <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="bg-orange-100 rounded-full p-2">
                              <PlayCircle className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline" className="text-orange-700 border-orange-300">
                                  {moment.time}
                                </Badge>
                                <Badge variant="outline" className="text-blue-700 border-blue-300">
                                  {moment.skill}
                                </Badge>
                              </div>
                              <p className="text-orange-800 font-medium mb-2">{moment.description}</p>
                              {moment.suggestion && (
                                <div className="bg-orange-100 rounded-md p-2">
                                  <div className="flex items-start">
                                    <Lightbulb className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <p className="text-orange-700 text-sm">{moment.suggestion}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No timestamp analysis available */}
                {(!result.timestampAnalysis || 
                  ((!result.timestampAnalysis.excellentMoments || result.timestampAnalysis.excellentMoments.length === 0) && 
                   (!result.timestampAnalysis.improvementMoments || result.timestampAnalysis.improvementMoments.length === 0))) && (
                  <div className="text-center py-8">
                    <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Timestamp analysis not available for this video</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strengths Tab */}
        <TabsContent value="strengths" className="space-y-4">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Award className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{strength}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements" className="space-y-4">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-orange-500" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Key Areas to Focus On:</h4>
                  <div className="space-y-3">
                    {result.areasForImprovement.map((area, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Target className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{area}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Specific Recommendations:</h4>
                  <div className="space-y-3">
                    {result.specificRecommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Educational Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
                Educational Recommendations & Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Educational Recommendations */}
                {result.educationalRecommendations && result.educationalRecommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-purple-800 mb-3 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                      Personalized Learning Recommendations
                    </h4>
                    <div className="space-y-3">
                      {result.educationalRecommendations.map((recommendation, index) => (
                        <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="bg-purple-100 rounded-full p-2">
                              <Lightbulb className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-purple-800 font-medium">{recommendation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Step Analysis with Timestamps */}
                {stepAnalysis && stepAnalysis.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Step-by-Step Learning Focus
                    </h4>
                    <div className="space-y-3">
                      {stepAnalysis.map((step, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">Step {step.stepNumber}</Badge>
                              {step.detected ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-sm text-gray-600">
                                Accuracy: <span className={cn('font-medium', getScoreColor(step.accuracy))}>
                                  {step.accuracy}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">{step.feedback}</p>
                          
                          {/* Timestamp moments for this step */}
                          {step.timestampMoments && step.timestampMoments.length > 0 && (
                            <div className="bg-blue-50 rounded-md p-2 mb-2">
                              <div className="flex items-start">
                                <Timer className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-blue-800 text-sm font-medium mb-1">Observed at:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {step.timestampMoments.map((timestamp, i) => (
                                      <Badge key={i} variant="outline" className="text-blue-700 border-blue-300">
                                        {timestamp}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {step.suggestions && step.suggestions.length > 0 && (
                            <div className="text-sm text-purple-700 bg-purple-50 p-2 rounded">
                              <div className="flex items-start">
                                <Lightbulb className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">Learning Suggestions:</p>
                                  <ul className="list-disc list-inside">
                                    {step.suggestions.map((suggestion, i) => (
                                      <li key={i}>{suggestion}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No recommendations available */}
                {(!result.educationalRecommendations || result.educationalRecommendations.length === 0) && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Educational recommendations not available for this video</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Transcript Tab */}
        <TabsContent value="transcript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Volume2 className="h-5 w-5 mr-2 text-purple-500" />
                Audio Transcription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.audioTranscription ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {result.audioTranscription}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No audio transcription available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>Save Report</span>
        </button>
      </div>
    </div>
  );
}
