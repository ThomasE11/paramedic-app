
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { Progress } from './progress';
import { EnhancedVideoRecorder } from './enhanced-video-recorder';
import { VideoAnalysisFeedback } from './video-analysis-feedback';
import { GeminiLiveFeedback } from './gemini-live-feedback';
import { TrackingPerformanceAnalyzer } from './tracking-performance-analyzer';
import { 
  Video, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Upload,
  Activity,
  Target,
  Zap,
  BarChart3,
  Brain
} from 'lucide-react';
import { VideoAnalysisSession, VideoAnalysisResult, Skill } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface TrackingData {
  timestamp: number;
  handLandmarks: Array<{x: number, y: number, z: number}>[];
  poseLandmarks: Array<{x: number, y: number, z: number}>;
  targetHits: Array<{targetId: string, accuracy: number, timestamp: number}>;
  stepProgression: Array<{stepNumber: number, completedAt: number, accuracy: number}>;
  accuracyScores: Array<{timestamp: number, accuracy: number}>;
}

interface EnhancedVideoPracticePageProps {
  skill: Skill;
  onBack: () => void;
  className?: string;
}

type PracticeStep = 'recording' | 'uploading' | 'analyzing' | 'ai-analysis' | 'results';

export function EnhancedVideoPracticePage({ 
  skill, 
  onBack, 
  className 
}: EnhancedVideoPracticePageProps) {
  const [currentStep, setCurrentStep] = useState<PracticeStep>('recording');
  const [isUploading, setIsUploading] = useState(false);
  const [analysisSession, setAnalysisSession] = useState<VideoAnalysisSession | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentSkillStep, setCurrentSkillStep] = useState(1);
  const [realTimeFeedback, setRealTimeFeedback] = useState<string>('');
  const [aiCoachEnabled, setAICoachEnabled] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);

  // Enhanced tracking state
  const [handPositions, setHandPositions] = useState<Array<{x: number, y: number}>>([]);
  const [posePositions, setPosePositions] = useState<Array<{x: number, y: number}>>([]);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [targetHits, setTargetHits] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const handleRecordingComplete = async (
    videoBlob: Blob, 
    duration: number, 
    trackingData: TrackingData[]
  ) => {
    setCurrentStep('uploading');
    setIsUploading(true);
    setErrorMessage('');
    setTrackingData(trackingData);
    setVideoDuration(duration);

    try {
      // Create FormData for enhanced video upload
      const formData = new FormData();
      formData.append('video', videoBlob, 'enhanced-skill-recording.webm');
      formData.append('duration', duration.toString());
      formData.append('trackingData', JSON.stringify(trackingData));
      formData.append('aiCoachEnabled', aiCoachEnabled.toString());
      formData.append('trackingEnabled', trackingEnabled.toString());

      // Upload video with enhanced data
      const response = await fetch(`/api/skills/${skill.id}/enhanced-video-analysis`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload enhanced video');
      }

      const result = await response.json();
      
      setAnalysisSession({
        id: result.sessionId,
        userId: '',
        skillId: skill.id,
        videoPath: '',
        videoDuration: duration,
        status: 'PROCESSING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setCurrentStep('analyzing');
      startPollingForResults(result.sessionId);

      toast({
        title: 'Enhanced Video Uploaded Successfully',
        description: 'Your AI-tracked video is now being analyzed. Please wait...',
      });

    } catch (error) {
      console.error('Error uploading enhanced video:', error);
      setErrorMessage('Failed to upload enhanced video. Please try again.');
      setCurrentStep('recording');
      
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading your enhanced video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const startPollingForResults = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/skills/${skill.id}/enhanced-video-analysis?sessionId=${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analysis results');
        }

        const session = await response.json();
        
        if (session.status === 'COMPLETED' && session.analysisResults?.[0]) {
          setAnalysisResult(session.analysisResults[0]);
          setAnalysisSession(session);
          setCurrentStep('ai-analysis');
          clearInterval(interval);
          setPollInterval(null);
          
          // Start AI analysis after basic analysis is complete
          setTimeout(() => {
            setCurrentStep('results');
          }, 3000);
          
          toast({
            title: 'Analysis Complete',
            description: 'Your enhanced video has been analyzed successfully!',
          });
        } else if (session.status === 'FAILED') {
          setErrorMessage('Enhanced video analysis failed. Please try recording again.');
          setCurrentStep('recording');
          clearInterval(interval);
          setPollInterval(null);
          
          toast({
            title: 'Analysis Failed',
            description: 'There was an error analyzing your enhanced video. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error polling for results:', error);
        setErrorMessage('Failed to check analysis status. Please refresh the page.');
        clearInterval(interval);
        setPollInterval(null);
      }
    }, 5000);

    setPollInterval(interval);
  };

  const handleRetry = () => {
    setCurrentStep('recording');
    setAnalysisSession(null);
    setAnalysisResult(null);
    setErrorMessage('');
    setTrackingData([]);
    setVideoDuration(0);
    setCurrentSkillStep(1);
    setCompletedSteps(new Set());
    
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  const handleRecordingError = (error: string) => {
    setErrorMessage(error);
    toast({
      title: 'Recording Error',
      description: error,
      variant: 'destructive',
    });
  };

  const handleRealTimeFeedback = (feedback: string) => {
    setRealTimeFeedback(feedback);
  };

  const getStepStatus = (step: PracticeStep) => {
    const stepOrder: PracticeStep[] = ['recording', 'uploading', 'analyzing', 'ai-analysis', 'results'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepIcon = (step: PracticeStep) => {
    const status = getStepStatus(step);
    
    switch (step) {
      case 'recording':
        return status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Video className="h-5 w-5" />;
      case 'uploading':
        return status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Upload className="h-5 w-5" />;
      case 'analyzing':
        return status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Activity className="h-5 w-5" />;
      case 'ai-analysis':
        return status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Brain className="h-5 w-5" />;
      case 'results':
        return status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStepLabel = (step: PracticeStep) => {
    switch (step) {
      case 'recording':
        return 'AI-Enhanced Recording';
      case 'uploading':
        return 'Upload with Tracking Data';
      case 'analyzing':
        return 'Computer Vision Analysis';
      case 'ai-analysis':
        return 'AI Performance Analysis';
      case 'results':
        return 'Comprehensive Results';
      default:
        return 'Unknown';
    }
  };

  // Update tracking data for live feedback
  useEffect(() => {
    const trackingUpdate = {
      handPositions,
      posePositions,
      accuracyScore,
      targetHits
    };
    // This would be used by the GeminiLiveFeedback component
  }, [handPositions, posePositions, accuracyScore, targetHits]);

  return (
    <div className={cn('space-y-6 max-w-7xl mx-auto p-4', className)}>
      {/* Header */}
      <Card className="border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Practice
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enhanced AI Video Practice</h1>
                <p className="text-gray-600">{skill.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                <Target className="h-3 w-3 mr-1" />
                Computer Vision
              </Badge>
              <Badge variant="outline" className="border-purple-200 text-purple-700">
                <Zap className="h-3 w-3 mr-1" />
                AI Coach
              </Badge>
              <Badge variant="outline" className="border-green-200 text-green-700">
                <Activity className="h-3 w-3 mr-1" />
                Real-time Tracking
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {(['recording', 'uploading', 'analyzing', 'ai-analysis', 'results'] as PracticeStep[]).map((step, index) => {
              const status = getStepStatus(step);
              const isLast = index === 4;
              
              return (
                <div key={step} className="flex items-center">
                  <div className="flex items-center">
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                      status === 'completed' ? 'bg-green-100 border-green-500 text-green-700' :
                      status === 'current' ? 'bg-blue-100 border-blue-500 text-blue-700' :
                      'bg-gray-100 border-gray-300 text-gray-500'
                    )}>
                      {getStepIcon(step)}
                    </div>
                    <div className="ml-3">
                      <p className={cn(
                        'text-sm font-medium',
                        status === 'completed' ? 'text-green-700' :
                        status === 'current' ? 'text-blue-700' :
                        'text-gray-500'
                      )}>
                        {getStepLabel(step)}
                      </p>
                      {status === 'current' && (
                        <p className="text-xs text-gray-500">
                          {step === 'recording' && 'Record with AI tracking and coaching'}
                          {step === 'uploading' && 'Uploading video with tracking data...'}
                          {step === 'analyzing' && 'Analyzing computer vision data...'}
                          {step === 'ai-analysis' && 'AI processing comprehensive analysis...'}
                          {step === 'results' && 'View your detailed performance report'}
                        </p>
                      )}
                    </div>
                  </div>
                  {!isLast && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-4 transition-colors',
                      status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="text-red-800">
              <p className="font-medium">Error</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Real-time Feedback */}
      {realTimeFeedback && currentStep === 'recording' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="text-blue-800">
              <p className="font-medium">AI Coach Feedback</p>
              <p className="text-sm">{realTimeFeedback}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recording Step */}
          {currentStep === 'recording' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-500" />
                  AI-Enhanced Recording
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedVideoRecorder
                  skill={skill}
                  onRecordingComplete={handleRecordingComplete}
                  onRecordingError={handleRecordingError}
                  onRealTimeFeedback={handleRealTimeFeedback}
                />
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">✨ Enhanced Features Active</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Real-time hand and pose tracking</li>
                    <li>• Skill-specific target areas and accuracy measurement</li>
                    <li>• Live AI coaching and feedback</li>
                    <li>• Automatic step progression detection</li>
                    <li>• Comprehensive performance analytics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uploading Step */}
          {currentStep === 'uploading' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-blue-500" />
                  Uploading Enhanced Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 mb-2">Uploading video with tracking data...</p>
                  <p className="text-sm text-gray-500">Processing {trackingData.length} tracking data points</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analyzing Step */}
          {currentStep === 'analyzing' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-purple-500 animate-pulse" />
                  Computer Vision Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-8 w-8 text-purple-500 animate-spin" />
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">Analyzing computer vision data...</p>
                  <p className="text-sm text-gray-500">
                    Processing hand tracking, pose estimation, and target accuracy
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis Step */}
          {currentStep === 'ai-analysis' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-green-500 animate-pulse" />
                  AI Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-8 w-8 text-green-500 animate-bounce" />
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">AI analyzing comprehensive performance...</p>
                  <p className="text-sm text-gray-500">
                    Generating detailed insights and personalized recommendations
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Step */}
          {currentStep === 'results' && analysisResult && (
            <div className="space-y-6">
              <VideoAnalysisFeedback
                result={analysisResult}
                skillName={skill.name}
                onRetry={handleRetry}
              />
              
              <TrackingPerformanceAnalyzer
                skill={skill}
                trackingData={trackingData}
                videoDuration={videoDuration}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Coach */}
          {aiCoachEnabled && (
            <GeminiLiveFeedback
              skill={skill}
              currentStep={currentSkillStep}
              isRecording={currentStep === 'recording'}
              trackingData={{
                handPositions,
                posePositions,
                accuracyScore,
                targetHits
              }}
              onFeedbackReceived={handleRealTimeFeedback}
            />
          )}

          {/* Skill Information */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Step</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{currentSkillStep}</Badge>
                    <span className="text-sm text-gray-600">
                      {skill.steps?.[currentSkillStep - 1]?.title || 'Unknown step'}
                    </span>
                  </div>
                  <Progress value={(currentSkillStep / (skill.steps?.length || 1)) * 100} className="mt-2" />
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Completed Steps</h4>
                  <div className="text-sm text-gray-600">
                    {completedSteps.size} of {skill.steps?.length || 1} steps completed
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Coach</span>
                      <Badge variant={aiCoachEnabled ? "default" : "secondary"}>
                        {aiCoachEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tracking</span>
                      <Badge variant={trackingEnabled ? "default" : "secondary"}>
                        {trackingEnabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
