
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { Progress } from './progress';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Camera,
  Settings,
  AlertCircle,
  Clock,
  CheckCircle,
  Target,
  Eye,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skill } from '@/lib/types';

interface TrackingData {
  timestamp: number;
  handLandmarks: Array<{x: number, y: number, z: number}>[];
  poseLandmarks: Array<{x: number, y: number, z: number}>;
  targetHits: Array<{targetId: string, accuracy: number, timestamp: number}>;
  stepProgression: Array<{stepNumber: number, completedAt: number, accuracy: number}>;
  accuracyScores: Array<{timestamp: number, accuracy: number}>;
}

interface EnhancedVideoRecorderProps {
  skill: Skill;
  onRecordingComplete: (videoBlob: Blob, duration: number, trackingData: TrackingData[]) => void;
  onRecordingError: (error: string) => void;
  onRealTimeFeedback?: (feedback: string) => void;
  isProcessing?: boolean;
  maxDuration?: number;
  className?: string;
}

interface AccuracyMetrics {
  overall: number;
  precision: number;
  timing: number;
  stepCompletion: number;
}

export function EnhancedVideoRecorder({ 
  skill,
  onRecordingComplete, 
  onRecordingError,
  onRealTimeFeedback,
  isProcessing = false,
  maxDuration = 600,
  className 
}: EnhancedVideoRecorderProps) {
  // Basic recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  // Tracking state
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [handsTrackingEnabled, setHandsTrackingEnabled] = useState(true);
  const [poseTrackingEnabled, setPoseTrackingEnabled] = useState(true);
  const [targetsEnabled, setTargetsEnabled] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [accuracyMetrics, setAccuracyMetrics] = useState<AccuracyMetrics>({
    overall: 0,
    precision: 0,
    timing: 0,
    stepCompletion: 0
  });

  // Real-time tracking data
  const [handPositions, setHandPositions] = useState<Array<{x: number, y: number}>>([]);
  const [posePositions, setPosePositions] = useState<Array<{x: number, y: number}>>([]);
  const [realtimeAccuracy, setRealtimeAccuracy] = useState(0);
  const [targetHits, setTargetHits] = useState<Array<{targetId: string, accuracy: number, timestamp: number}>>([]);
  const [stepProgression, setStepProgression] = useState<Array<{stepNumber: number, completedAt: number, accuracy: number}>>([]);
  const [realTimeFeedback, setRealTimeFeedback] = useState<string>('');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trackingDataRef = useRef<TrackingData[]>([]);
  const accuracyHistoryRef = useRef<Array<{timestamp: number, accuracy: number}>>([]);

  // Initialize camera with MediaPipe support
  const initializeCamera = useCallback(async () => {
    setIsInitializing(true);
    setPermissionError('Initializing advanced camera with AI tracking...');
    
    try {
      console.log('🚀 === ENHANCED CAMERA INITIALIZATION START ===');
      
      // Check browser support
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser');
      }

      // Request camera access with higher quality for tracking
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        
        try {
          await videoRef.current.play();
          console.log('✅ Enhanced video started playing');
        } catch (playError) {
          console.log('⚠️ Autoplay blocked (normal):', playError);
        }
      }

      // Set up canvases
      if (canvasRef.current && overlayCanvasRef.current) {
        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        
        canvas.width = 1280;
        canvas.height = 720;
        overlayCanvas.width = 1280;
        overlayCanvas.height = 720;
      }

      streamRef.current = stream;
      setHasPermission(true);
      setPermissionError('');
      
      console.log('🎉 Enhanced camera initialization completed!');
      
    } catch (error) {
      console.error('❌ Enhanced camera initialization failed:', error);
      let errorMessage = 'Enhanced camera access failed';
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera permission denied. Please allow camera access for AI tracking.';
            break;
          case 'NotFoundError':
            errorMessage = 'No camera found. Please check your camera connection.';
            break;
          case 'NotReadableError':
            errorMessage = 'Camera is in use by another application.';
            break;
          default:
            errorMessage = `Camera error: ${error.message}`;
        }
      }
      
      setHasPermission(false);
      setPermissionError(errorMessage);
      onRecordingError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  }, [onRecordingError]);

  // Handle hand tracking results
  const handleHandResults = useCallback((results: any) => {
    if (!results.landmarks || !trackingEnabled || !handsTrackingEnabled) return;
    
    const positions = results.landmarks.map((handLandmarks: any[]) => {
      // Get fingertip positions (landmarks 4, 8, 12, 16, 20)
      const fingertips = [4, 8, 12, 16, 20].map(index => handLandmarks[index]);
      return fingertips.map(tip => ({ x: tip.x, y: tip.y }));
    }).flat();
    
    setHandPositions(positions);
    
    // Store tracking data
    const trackingData: TrackingData = {
      timestamp: Date.now(),
      handLandmarks: results.landmarks,
      poseLandmarks: [],
      targetHits: [],
      stepProgression: [],
      accuracyScores: []
    };
    
    trackingDataRef.current.push(trackingData);
  }, [trackingEnabled, handsTrackingEnabled]);

  // Handle pose tracking results
  const handlePoseResults = useCallback((results: any) => {
    if (!results.landmarks || !trackingEnabled || !poseTrackingEnabled) return;
    
    // Extract key pose points
    const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24].map(index => ({
      x: results.landmarks[index]?.x || 0,
      y: results.landmarks[index]?.y || 0
    }));
    
    setPosePositions(keyPoints);
  }, [trackingEnabled, poseTrackingEnabled]);

  // Handle target hits
  const handleTargetHit = useCallback((targetId: string, accuracy: number) => {
    const hit = {
      targetId,
      accuracy,
      timestamp: Date.now()
    };
    
    setTargetHits(prev => [...prev, hit]);
    
    // Update real-time accuracy
    setRealtimeAccuracy(prev => (prev + accuracy) / 2);
    
    // Store in history
    accuracyHistoryRef.current.push({
      timestamp: Date.now(),
      accuracy
    });
    
    // Provide real-time feedback
    if (accuracy > 0.8) {
      setRealTimeFeedback('Excellent technique! Keep it up.');
      onRealTimeFeedback?.('Excellent technique! Keep it up.');
    } else if (accuracy > 0.6) {
      setRealTimeFeedback('Good positioning. Try to be more precise.');
      onRealTimeFeedback?.('Good positioning. Try to be more precise.');
    } else {
      setRealTimeFeedback('Adjust your hand position for better accuracy.');
      onRealTimeFeedback?.('Adjust your hand position for better accuracy.');
    }
    
    // Clear feedback after 3 seconds
    setTimeout(() => setRealTimeFeedback(''), 3000);
  }, [onRealTimeFeedback]);

  // Handle step completion
  const handleStepComplete = useCallback((stepNumber: number) => {
    setCompletedSteps(prev => new Set([...prev, stepNumber]));
    
    const stepCompletion = {
      stepNumber,
      completedAt: Date.now(),
      accuracy: realtimeAccuracy
    };
    
    setStepProgression(prev => [...prev, stepCompletion]);
    
    // Auto-advance to next step
    if (stepNumber < (skill.steps?.length || 1)) {
      setCurrentStep(stepNumber + 1);
      setRealTimeFeedback(`Step ${stepNumber} completed! Moving to step ${stepNumber + 1}`);
      onRealTimeFeedback?.(`Step ${stepNumber} completed! Moving to step ${stepNumber + 1}`);
    } else {
      setRealTimeFeedback('All steps completed! Great job!');
      onRealTimeFeedback?.('All steps completed! Great job!');
    }
  }, [skill.steps, realtimeAccuracy, onRealTimeFeedback]);

  // Update accuracy metrics
  useEffect(() => {
    const updateMetrics = () => {
      const totalSteps = skill.steps?.length || 1;
      const completedStepsCount = completedSteps.size;
      
      setAccuracyMetrics({
        overall: realtimeAccuracy,
        precision: targetHits.length > 0 ? targetHits.reduce((acc, hit) => acc + hit.accuracy, 0) / targetHits.length : 0,
        timing: recordingTime > 0 ? Math.min(1, (skill.estimatedTimeMinutes * 60) / recordingTime) : 0,
        stepCompletion: completedStepsCount / totalSteps
      });
    };
    
    updateMetrics();
  }, [realtimeAccuracy, targetHits, recordingTime, completedSteps, skill.estimatedTimeMinutes, skill.steps]);

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused, maxDuration]);

  // Start recording with tracking
  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        throw new Error('No media stream available');
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm; codecs=vp8,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingComplete(videoBlob, recordingTime, trackingDataRef.current);
        chunksRef.current = [];
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        onRecordingError('Recording failed');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Reset tracking data
      trackingDataRef.current = [];
      accuracyHistoryRef.current = [];
      setTargetHits([]);
      setStepProgression([]);
      setCompletedSteps(new Set());
      setCurrentStep(1);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      onRecordingError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Draw real-time overlay
  const drawOverlay = useCallback(() => {
    if (!overlayCanvasRef.current) return;
    
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw accuracy indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(20, 20, 200, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.fillText(`Accuracy: ${Math.round(realtimeAccuracy * 100)}%`, 30, 40);
    ctx.fillText(`Step: ${currentStep}/${skill.steps?.length || 1}`, 30, 60);
    ctx.fillText(`Completed: ${completedSteps.size}`, 30, 80);
    
    // Draw feedback
    if (realTimeFeedback) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(20, canvas.height - 80, canvas.width - 40, 60);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(realTimeFeedback, canvas.width / 2, canvas.height - 40);
    }
  }, [realtimeAccuracy, currentStep, skill.steps, completedSteps, realTimeFeedback]);

  // Update overlay
  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  if (isInitializing) {
    return (
      <Card className={cn('w-full max-w-4xl mx-auto', className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Initializing AI Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">Setting up AI-powered tracking...</p>
            <p className="text-sm text-gray-500">This may take a moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission) {
    return (
      <Card className={cn('w-full max-w-4xl mx-auto', className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Enhanced Video Recording Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Advanced Camera Access Required</p>
                <p className="text-sm text-gray-600">
                  {permissionError || 'Please grant camera and microphone permissions for AI-powered skill tracking.'}
                </p>
                <div className="flex space-x-2">
                  <Button 
                    onClick={initializeCamera} 
                    disabled={isInitializing}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    {isInitializing ? 'Initializing...' : 'Enable AI Tracking'}
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-6xl mx-auto', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            AI-Enhanced Video Recording
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              <Target className="h-3 w-3 mr-1" />
              Smart Tracking
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-700">
              <Zap className="h-3 w-3 mr-1" />
              Real-time AI
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Video Preview with Overlays */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              controls={false}
              className="w-full h-full object-cover bg-black"
            />
            
            {/* Main tracking canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ mixBlendMode: 'multiply' }}
            />
            
            {/* Overlay canvas for UI elements */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">REC</span>
              </div>
            )}
            
            {/* Timer */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className="text-sm font-mono">
                  {formatTime(recordingTime)} / {formatTime(maxDuration)}
                </span>
              </div>
            </div>
          </div>

          {/* Accuracy Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(accuracyMetrics.overall * 100)}%
              </div>
              <div className="text-sm text-gray-600">Overall Accuracy</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(accuracyMetrics.precision * 100)}%
              </div>
              <div className="text-sm text-gray-600">Precision</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(accuracyMetrics.timing * 100)}%
              </div>
              <div className="text-sm text-gray-600">Timing</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(accuracyMetrics.stepCompletion * 100)}%
              </div>
              <div className="text-sm text-gray-600">Step Completion</div>
            </div>
          </div>

          {/* Step Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Step Progress</span>
              <span className="text-sm text-gray-500">
                {completedSteps.size} / {skill.steps?.length || 1} completed
              </span>
            </div>
            <Progress value={accuracyMetrics.stepCompletion * 100} className="h-2" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            {/* Tracking Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTrackingEnabled(!trackingEnabled)}
              className={cn(
                'flex items-center space-x-2',
                trackingEnabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50'
              )}
            >
              <Target className="h-4 w-4" />
              <span>{trackingEnabled ? 'Tracking On' : 'Tracking Off'}</span>
            </Button>

            {/* Recording Controls */}
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isProcessing}
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Start AI Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="outline"
                size="lg"
                className="border-red-200 hover:bg-red-50 text-red-600"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="text-blue-800">
                  <p className="font-medium">Processing Enhanced Video...</p>
                  <p className="text-sm">Your AI-tracked video is being analyzed. This may take a few minutes.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
