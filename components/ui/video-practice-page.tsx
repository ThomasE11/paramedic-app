
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { EnhancedVideoRecorder } from './enhanced-video-recorder';
import { VideoAnalysisFeedback } from './video-analysis-feedback';
import { 
  Video, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Upload
} from 'lucide-react';
import { VideoAnalysisSession, VideoAnalysisResult, Skill } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface VideoPracticePageProps {
  skill: Skill;
  onBack: () => void;
  className?: string;
}

type PracticeStep = 'recording' | 'uploading' | 'analyzing' | 'results';

export function VideoPracticePage({ 
  skill, 
  onBack, 
  className 
}: VideoPracticePageProps) {
  const [currentStep, setCurrentStep] = useState<PracticeStep>('recording');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisSession, setAnalysisSession] = useState<VideoAnalysisSession | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const handleRecordingComplete = async (videoBlob: Blob) => {
    setCurrentStep('uploading');
    setIsUploading(true);
    setErrorMessage('');

    try {
      // Estimate duration based on blob size (rough estimate: ~1MB per minute for webm)
      const estimatedDuration = Math.max(30, Math.min(300, videoBlob.size / (1024 * 1024) * 60));
      
      // Create FormData for video upload
      const formData = new FormData();
      formData.append('video', videoBlob, 'skill-recording.webm');
      formData.append('duration', estimatedDuration.toString());

      // Upload video with progress tracking
      const response = await fetch(`/api/skills/${skill.id}/video-analysis`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }

      const result = await response.json();
      
      setAnalysisSession({
        id: result.sessionId,
        userId: '',
        skillId: skill.id,
        videoPath: '',
        videoDuration: estimatedDuration,
        status: 'PROCESSING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setCurrentStep('analyzing');
      startPollingForResults(result.sessionId);

      toast({
        title: 'Video Uploaded Successfully',
        description: 'Your video is now being analyzed. Please wait...',
      });

    } catch (error) {
      console.error('Error uploading video:', error);
      setErrorMessage('Failed to upload video. Please try again.');
      setCurrentStep('recording');
      
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading your video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const startPollingForResults = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/skills/${skill.id}/video-analysis?sessionId=${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analysis results');
        }

        const session = await response.json();
        
        if (session.status === 'COMPLETED' && session.analysisResults?.[0]) {
          setAnalysisResult(session.analysisResults[0]);
          setAnalysisSession(session);
          setCurrentStep('results');
          clearInterval(interval);
          setPollInterval(null);
          
          toast({
            title: 'Analysis Complete',
            description: 'Your video has been analyzed successfully!',
          });
        } else if (session.status === 'FAILED') {
          setErrorMessage('Video analysis failed. Please try recording again.');
          setCurrentStep('recording');
          clearInterval(interval);
          setPollInterval(null);
          
          toast({
            title: 'Analysis Failed',
            description: 'There was an error analyzing your video. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error polling for results:', error);
        setErrorMessage('Failed to check analysis status. Please refresh the page.');
        clearInterval(interval);
        setPollInterval(null);
      }
    }, 5000); // Poll every 5 seconds

    setPollInterval(interval);
  };

  const handleRetry = () => {
    setCurrentStep('recording');
    setAnalysisSession(null);
    setAnalysisResult(null);
    setErrorMessage('');
    
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

  const getStepStatus = (step: PracticeStep) => {
    const stepOrder: PracticeStep[] = ['recording', 'uploading', 'analyzing', 'results'];
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
        return status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />;
      case 'results':
        return status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Eye className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStepLabel = (step: PracticeStep) => {
    switch (step) {
      case 'recording':
        return 'Record Performance';
      case 'uploading':
        return 'Upload Video';
      case 'analyzing':
        return 'AI Analysis';
      case 'results':
        return 'View Results';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={cn('space-y-6 max-w-6xl mx-auto p-4', className)}>
      {/* Header */}
      <Card className="border-orange-200">
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
                <h1 className="text-2xl font-bold text-gray-900">Video Practice</h1>
                <p className="text-gray-600">{skill.name}</p>
              </div>
            </div>
            <Badge variant="outline" className="border-orange-200 text-orange-700">
              AI-Powered Analysis
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {(['recording', 'uploading', 'analyzing', 'results'] as PracticeStep[]).map((step, index) => {
              const status = getStepStatus(step);
              const isLast = index === 3;
              
              return (
                <div key={step} className="flex items-center">
                  <div className="flex items-center">
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                      status === 'completed' ? 'bg-green-100 border-green-500 text-green-700' :
                      status === 'current' ? 'bg-orange-100 border-orange-500 text-orange-700' :
                      'bg-gray-100 border-gray-300 text-gray-500'
                    )}>
                      {getStepIcon(step)}
                    </div>
                    <div className="ml-3">
                      <p className={cn(
                        'text-sm font-medium',
                        status === 'completed' ? 'text-green-700' :
                        status === 'current' ? 'text-orange-700' :
                        'text-gray-500'
                      )}>
                        {getStepLabel(step)}
                      </p>
                      {status === 'current' && (
                        <p className="text-xs text-gray-500">
                          {step === 'recording' && 'Record your skill performance'}
                          {step === 'uploading' && 'Uploading video file...'}
                          {step === 'analyzing' && 'AI analyzing your performance...'}
                          {step === 'results' && 'Review your feedback'}
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

      {/* Skill Information */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Objectives Section */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Objectives</h4>
              <ul className="space-y-3">
                {skill.objectives?.map((objective, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="flex-1 leading-relaxed">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Key Steps Section */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Key Steps</h4>
              <ul className="space-y-3">
                {skill.steps?.slice(0, 5).map((step, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <Badge variant="outline" className="text-xs mr-3 mt-0.5 flex-shrink-0">
                      {step.stepNumber}
                    </Badge>
                    <span className="flex-1 leading-relaxed">{step.title}</span>
                  </li>
                ))}
                {skill.steps && skill.steps.length > 5 && (
                  <li className="text-sm text-gray-500 italic pl-2">
                    ... and {skill.steps.length - 5} more steps
                  </li>
                )}
              </ul>
            </div>
            
            {/* Additional Information in separate rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Indications */}
              {skill.indications && skill.indications.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Indications</h4>
                  <ul className="space-y-2">
                    {skill.indications.map((indication, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="flex-1 leading-relaxed">{indication}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Equipment */}
              {skill.equipment && Array.isArray(skill.equipment) && skill.equipment.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Equipment</h4>
                  <ul className="space-y-2">
                    {skill.equipment.map((item: any, index: number) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="flex-1 leading-relaxed">
                          {typeof item === 'string' ? item : item.item}
                          {typeof item === 'object' && item.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Recording Step */}
        {currentStep === 'recording' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2 text-blue-500" />
                Record Your Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedVideoRecorder
                onRecordingComplete={handleRecordingComplete}
                onError={handleRecordingError}
              />
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Recording Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure good lighting and clear view of your performance</li>
                  <li>• Speak clearly when explaining your actions</li>
                  <li>• Follow the skill steps in order</li>
                  <li>• Recommended duration: {skill.estimatedTimeMinutes} minutes</li>
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
                Uploading Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600 mb-2">Uploading your video...</p>
                <p className="text-sm text-gray-500">Please don't close this window</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analyzing Step */}
        {currentStep === 'analyzing' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-purple-500 animate-spin" />
                AI Analysis in Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
                  </div>
                </div>
                <p className="text-gray-600 mb-2">Analyzing your performance...</p>
                <p className="text-sm text-gray-500">
                  Our AI is evaluating your technique, timing, and communication. This may take a few minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Step */}
        {currentStep === 'results' && analysisResult && (
          <VideoAnalysisFeedback
            result={analysisResult}
            skillName={skill.name}
            onRetry={handleRetry}
          />
        )}
      </div>
    </div>
  );
}
