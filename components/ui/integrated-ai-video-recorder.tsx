
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { Progress } from './progress';
import { Separator } from './separator';
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
  Zap,
  Brain,
  Hand,
  Users,
  BarChart3,
  TrendingUp,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skill } from '@/lib/types';

// Import our specialized tracking components
import MediaPipeHandsTracker from './mediapipe-hands-tracker';
import MediaPipePoseTracker from './mediapipe-pose-tracker';
import SkillTargetAreas from './skill-target-areas';
import GeminiLiveFeedback from './gemini-live-feedback';

interface TrackingData {
  timestamp: number;
  handLandmarks: Array<{x: number, y: number, z: number}>[];
  poseLandmarks: Array<{x: number, y: number, z: number}>;
  targetHits: Array<{targetId: string, accuracy: number, timestamp: number}>;
  stepProgression: Array<{stepNumber: number, completedAt: number, accuracy: number}>;
  accuracyScores: Array<{timestamp: number, accuracy: number}>;
}

interface AccuracyMetrics {
  overall: number;
  precision: number;
  timing: number;
  stepCompletion: number;
  consistency: number;
}

interface IntegratedAIVideoRecorderProps {
  skill: Skill;
  onRecordingComplete: (videoBlob: Blob, duration: number, trackingData: TrackingData[]) => void;
  onRecordingError: (error: string) => void;
  onRealTimeFeedback?: (feedback: string) => void;
  isProcessing?: boolean;
  maxDuration?: number;
  className?: string;
}

export function IntegratedAIVideoRecorder({ 
  skill,
  onRecordingComplete, 
  onRecordingError,
  onRealTimeFeedback,
  isProcessing = false,
  maxDuration = 600,
  className 
}: IntegratedAIVideoRecorderProps) {
  // Basic recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  // AI and tracking features
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [handsTrackingEnabled, setHandsTrackingEnabled] = useState(true);
  const [poseTrackingEnabled, setPoseTrackingEnabled] = useState(true);
  const [targetsEnabled, setTargetsEnabled] = useState(true);
  const [aiCoachEnabled, setAICoachEnabled] = useState(true);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(true);

  // Skill progress state
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [accuracyMetrics, setAccuracyMetrics] = useState<AccuracyMetrics>({
    overall: 0,
    precision: 0,
    timing: 0,
    stepCompletion: 0,
    consistency: 0
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

  // Initialize camera with all AI features
  const initializeCamera = useCallback(async () => {
    setIsInitializing(true);
    setPermissionError('Initializing comprehensive AI system...');
    
    try {
      console.log('🚀 === INTEGRATED AI SYSTEM INITIALIZATION START ===');
      
      // Check browser support
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser');
      }

      // Request high-quality camera access for AI processing
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });

      console.log('✅ High-quality camera stream obtained');

      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        
        try {
          await videoRef.current.play();
          console.log('✅ Video stream active');
        } catch (playError) {
          console.log('⚠️ Autoplay blocked (normal):', playError);
        }
      }

      // Set up canvases for AI processing
      if (canvasRef.current && overlayCanvasRef.current) {
        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        
        canvas.width = 1280;
        canvas.height = 720;
        overlayCanvas.width = 1280;
        overlayCanvas.height = 720;
        
        console.log('✅ AI processing canvases initialized');
      }

      streamRef.current = stream;
      setHasPermission(true);
      setPermissionError('');
      
      console.log('🎉 Integrated AI system initialization completed!');
      
    } catch (error) {
      console.error('❌ AI system initialization failed:', error);
      let errorMessage = 'AI system initialization failed';
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera permission denied. Please allow camera access for AI features.';
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
    
    // Store tracking data with enhanced information
    const trackingData: TrackingData = {
      timestamp: Date.now(),
      handLandmarks: results.landmarks,
      poseLandmarks: posePositions.map(pos => ({x: pos.x, y: pos.y, z: 0})),
      targetHits: [...targetHits],
      stepProgression: [...stepProgression],
      accuracyScores: [{timestamp: Date.now(), accuracy: realtimeAccuracy}]
    };
    
    trackingDataRef.current.push(trackingData);
  }, [trackingEnabled, handsTrackingEnabled, posePositions, targetHits, stepProgression, realtimeAccuracy]);

  // Handle pose tracking results
  const handlePoseResults = useCallback((results: any) => {
    if (!results.landmarks || !trackingEnabled || !poseTrackingEnabled) return;
    
    // Extract key pose points for analysis
    const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24].map(index => ({
      x: results.landmarks[index]?.x || 0,
      y: results.landmarks[index]?.y || 0
    }));
    
    setPosePositions(keyPoints);
  }, [trackingEnabled, poseTrackingEnabled]);

  // Handle target hits from skill target areas
  const handleTargetHit = useCallback((targetId: string, accuracy: number) => {
    const hit = {
      targetId,
      accuracy,
      timestamp: Date.now()
    };
    
    setTargetHits(prev => [...prev, hit]);
    
    // Update real-time accuracy
    setRealtimeAccuracy(prev => (prev + accuracy) / 2);
    
    // Store in accuracy history
    accuracyHistoryRef.current.push({
      timestamp: Date.now(),
      accuracy
    });
    
    // Provide contextual feedback
    if (accuracy > 0.85) {
      setRealTimeFeedback(`Perfect! Excellent technique on ${targetId}`);
    } else if (accuracy > 0.7) {
      setRealTimeFeedback(`Good work on ${targetId}. Fine-tune your positioning.`);
    } else {
      setRealTimeFeedback(`Adjust your position for ${targetId} to improve accuracy.`);
    }
    
    // Call parent feedback handler
    onRealTimeFeedback?.(realTimeFeedback);
    
    // Clear feedback after 3 seconds
    setTimeout(() => setRealTimeFeedback(''), 3000);
  }, [onRealTimeFeedback, realTimeFeedback]);

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
    } else {
      setRealTimeFeedback('All steps completed! Excellent work!');
    }
  }, [skill.steps, realtimeAccuracy]);

  // Update accuracy metrics in real-time
  useEffect(() => {
    const updateMetrics = () => {
      const totalSteps = skill.steps?.length || 1;
      const completedStepsCount = completedSteps.size;
      
      // Calculate consistency from accuracy history
      const recentAccuracy = accuracyHistoryRef.current.slice(-10);
      const consistency = recentAccuracy.length > 1 ? 
        1 - (Math.max(...recentAccuracy.map(a => a.accuracy)) - Math.min(...recentAccuracy.map(a => a.accuracy))) : 
        realtimeAccuracy;
      
      setAccuracyMetrics({
        overall: realtimeAccuracy,
        precision: targetHits.length > 0 ? targetHits.reduce((acc, hit) => acc + hit.accuracy, 0) / targetHits.length : 0,
        timing: recordingTime > 0 ? Math.min(1, (skill.estimatedTimeMinutes * 60) / recordingTime) : 0,
        stepCompletion: completedStepsCount / totalSteps,
        consistency
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

  // Start recording with all AI features
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
      
      // Reset all tracking data
      trackingDataRef.current = [];
      accuracyHistoryRef.current = [];
      setTargetHits([]);
      setStepProgression([]);
      setCompletedSteps(new Set());
      setCurrentStep(1);
      setRealTimeFeedback('Recording started. AI analysis active.');
      
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
      setRealTimeFeedback('Recording complete. Processing AI analysis...');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render initialization state
  if (isInitializing) {
    return (
      <Card className={cn('w-full max-w-6xl mx-auto', className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 animate-pulse" />
            Initializing AI System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="h-8 w-8 text-blue-500 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-600 mb-2">Setting up AI-powered analysis...</p>
            <p className="text-sm text-gray-500">Initializing computer vision, hand tracking, and AI coach</p>
            <div className="mt-4 flex justify-center space-x-4">
              <Badge variant="outline" className="animate-pulse">
                <Target className="h-3 w-3 mr-1" />
                Computer Vision
              </Badge>
              <Badge variant="outline" className="animate-pulse">
                <Hand className="h-3 w-3 mr-1" />
                Hand Tracking
              </Badge>
              <Badge variant="outline" className="animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                AI Coach
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render permission request
  if (!hasPermission) {
    return (
      <Card className={cn('w-full max-w-6xl mx-auto', className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            AI-Enhanced Video Recording Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Advanced AI System Ready</p>
                  <p className="text-sm text-gray-600">
                    {permissionError || 'Grant camera and microphone access to enable AI-powered skill analysis.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs font-medium">Computer Vision</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Hand className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-xs font-medium">Hand Tracking</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs font-medium">Pose Detection</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Zap className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-xs font-medium">AI Coach</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button 
                    onClick={initializeCamera} 
                    disabled={isInitializing}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {isInitializing ? 'Initializing...' : 'Enable AI System'}
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
    <Card className={cn('w-full max-w-7xl mx-auto', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Layers className="h-5 w-5 mr-2" />
            Integrated AI Video Recording
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              <Target className="h-3 w-3 mr-1" />
              Computer Vision
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-700">
              <Hand className="h-3 w-3 mr-1" />
              Hand Tracking
            </Badge>
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              <Users className="h-3 w-3 mr-1" />
              Pose Detection
            </Badge>
            <Badge variant="outline" className="border-orange-200 text-orange-700">
              <Zap className="h-3 w-3 mr-1" />
              AI Coach
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* AI System Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-3 h-3 rounded-full ${trackingEnabled ? 'bg-green-500' : 'bg-gray-300'} mr-2`} />
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium">Computer Vision</p>
              <p className="text-xs text-gray-600">{trackingEnabled ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-3 h-3 rounded-full ${handsTrackingEnabled ? 'bg-green-500' : 'bg-gray-300'} mr-2`} />
                <Hand className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium">Hand Tracking</p>
              <p className="text-xs text-gray-600">{handsTrackingEnabled ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-3 h-3 rounded-full ${poseTrackingEnabled ? 'bg-green-500' : 'bg-gray-300'} mr-2`} />
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium">Pose Detection</p>
              <p className="text-xs text-gray-600">{poseTrackingEnabled ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-3 h-3 rounded-full ${aiCoachEnabled ? 'bg-green-500' : 'bg-gray-300'} mr-2`} />
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-sm font-medium">AI Coach</p>
              <p className="text-xs text-gray-600">{aiCoachEnabled ? 'Active' : 'Inactive'}</p>
            </div>
          </div>

          {/* Video Preview with AI Overlays */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {/* Main video stream */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              controls={false}
              className="w-full h-full object-cover bg-black"
            />
            
            {/* AI tracking canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ mixBlendMode: 'multiply' }}
            />
            
            {/* Target areas overlay */}
            {targetsEnabled && (
              <div className="absolute inset-0">
                <SkillTargetAreas
                  skill={skill}
                  currentStep={currentStep}
                  onTargetHit={handleTargetHit}
                  onStepComplete={handleStepComplete}
                  handPositions={handPositions}
                  posePositions={posePositions}
                  canvasWidth={1280}
                  canvasHeight={720}
                  className="w-full h-full"
                />
              </div>
            )}
            
            {/* UI overlay canvas */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">AI REC</span>
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

            {/* Real-time feedback */}
            {realTimeFeedback && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">{realTimeFeedback}</span>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(accuracyMetrics.overall * 100)}%
              </div>
              <div className="text-sm text-gray-600">Overall Accuracy</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(accuracyMetrics.precision * 100)}%
              </div>
              <div className="text-sm text-gray-600">Precision</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {Math.round(accuracyMetrics.timing * 100)}%
              </div>
              <div className="text-sm text-gray-600">Timing</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(accuracyMetrics.stepCompletion * 100)}%
              </div>
              <div className="text-sm text-gray-600">Step Completion</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {Math.round(accuracyMetrics.consistency * 100)}%
              </div>
              <div className="text-sm text-gray-600">Consistency</div>
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
            <div className="text-xs text-gray-600">
              Current: Step {currentStep} - {skill.steps?.[currentStep - 1]?.title || 'Unknown'}
            </div>
          </div>

          <Separator />

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* AI Feature Toggles */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTrackingEnabled(!trackingEnabled)}
                className={cn(
                  'flex items-center space-x-1',
                  trackingEnabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50'
                )}
              >
                <Target className="h-3 w-3" />
                <span>{trackingEnabled ? 'CV On' : 'CV Off'}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHandsTrackingEnabled(!handsTrackingEnabled)}
                className={cn(
                  'flex items-center space-x-1',
                  handsTrackingEnabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50'
                )}
              >
                <Hand className="h-3 w-3" />
                <span>{handsTrackingEnabled ? 'Hands On' : 'Hands Off'}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAICoachEnabled(!aiCoachEnabled)}
                className={cn(
                  'flex items-center space-x-1',
                  aiCoachEnabled ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-gray-50'
                )}
              >
                <Zap className="h-3 w-3" />
                <span>{aiCoachEnabled ? 'AI On' : 'AI Off'}</span>
              </Button>
            </div>

            {/* Recording Controls */}
            <div className="flex items-center space-x-4">
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
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="text-blue-800">
                  <p className="font-medium">Processing AI-Enhanced Video...</p>
                  <p className="text-sm">
                    Analyzing {trackingDataRef.current.length} tracking data points with computer vision and AI.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default IntegratedAIVideoRecorder;
