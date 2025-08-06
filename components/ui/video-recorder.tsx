
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
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
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoRecorderProps {
  onRecordingComplete: (videoBlob: Blob, duration: number) => void;
  onRecordingError: (error: string) => void;
  isProcessing?: boolean;
  maxDuration?: number; // in seconds
  className?: string;
}

export function VideoRecorder({ 
  onRecordingComplete, 
  onRecordingError, 
  isProcessing = false,
  maxDuration = 600, // 10 minutes default
  className 
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused' | 'completed'>('idle');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isComponentMounted, setIsComponentMounted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(false);

  // Initialize component
  useEffect(() => {
    console.log('📋 VideoRecorder component mounted');
    mountedRef.current = true;
    setIsComponentMounted(true);
    setPermissionError('Click "Grant Camera Access" to enable video recording.');
    
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, []);

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

  const waitForVideoElement = (): Promise<HTMLVideoElement> => {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50; // Increased attempts
      let attempts = 0;
      
      const checkVideoElement = () => {
        attempts++;
        console.log(`🔍 Checking video element - Attempt ${attempts}/${maxAttempts}`);
        
        // Check if video element exists and is in DOM
        if (videoRef.current && mountedRef.current && isComponentMounted) {
          // Additional check: ensure video element is actually in the DOM
          if (document.contains(videoRef.current)) {
            console.log('✅ Video element found, mounted, and in DOM');
            // Small delay to ensure DOM is fully ready
            setTimeout(() => resolve(videoRef.current!), 50);
            return;
          } else {
            console.log('⚠️ Video element exists but not in DOM yet');
          }
        }
        
        if (attempts >= maxAttempts) {
          console.log('❌ Video element not found after maximum attempts');
          reject(new Error('Video element not ready after multiple attempts'));
          return;
        }
        
        // Use requestAnimationFrame for better DOM timing
        requestAnimationFrame(() => {
          setTimeout(checkVideoElement, 50);
        });
      };
      
      checkVideoElement();
    });
  };

  const initializeCamera = async () => {
    console.log('🖱️ BUTTON CLICKED - initializeCamera function called');
    setIsInitializing(true);
    setPermissionError('Initializing camera...');
    
    try {
      console.log('🚀 === CAMERA INITIALIZATION START ===');
      
      // Step 1: Verify basic browser support
      console.log('Step 1: Checking browser support...');
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser');
      }
      console.log('✅ Browser supports getUserMedia');

      // Step 2: Wait for video element to be ready with better timing
      console.log('Step 2: Waiting for video element to be ready...');
      const videoElement = await waitForVideoElement();
      console.log('✅ Video element is ready and in DOM');

      // Step 3: Request camera access
      console.log('Step 3: Requesting camera access...');
      setPermissionError('🎥 Requesting camera access - PLEASE ALLOW WHEN PROMPTED');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      console.log('✅ SUCCESS: Camera stream obtained!', {
        id: stream.id,
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
      
      // Step 4: Connect stream to video element
      console.log('Step 4: Connecting stream to video element...');
      videoElement.srcObject = stream;
      
      try {
        await videoElement.play();
        console.log('✅ Video started playing');
      } catch (playError) {
        console.log('⚠️ Autoplay blocked (normal):', playError);
      }

      // Step 5: Get available video devices
      console.log('Step 5: Getting video devices...');
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(videoDevices);
        
        // Set the current device as selected
        const currentVideoTrack = stream.getVideoTracks()[0];
        if (currentVideoTrack) {
          setSelectedVideoDevice(currentVideoTrack.getSettings().deviceId || '');
        }
        
        console.log('✅ Found video devices:', videoDevices.length);
      } catch (deviceError) {
        console.log('⚠️ Could not enumerate devices:', deviceError);
      }

      // Step 6: Update component state
      console.log('Step 6: Updating component state...');
      streamRef.current = stream;
      setHasPermission(true);
      setPermissionError('');
      
      // Set track states
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) {
        setIsVideoEnabled(videoTrack.enabled);
        console.log('✅ Video track enabled:', videoTrack.enabled);
      }
      if (audioTrack) {
        setIsAudioEnabled(audioTrack.enabled);
        console.log('✅ Audio track enabled:', audioTrack.enabled);
      }
      
      console.log('🎉 Camera initialization completed successfully!');
      
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      
      let errorMessage = 'Camera access failed';
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera permission denied. Please allow camera access and try again.';
            break;
          case 'NotFoundError':
            errorMessage = 'No camera found. Please check your camera connection.';
            break;
          case 'NotReadableError':
            errorMessage = 'Camera is in use by another application. Please close other apps and try again.';
            break;
          case 'SecurityError':
            errorMessage = 'Camera access blocked by browser security settings.';
            break;
          default:
            if (error.message.includes('Video element not ready')) {
              errorMessage = 'Video element not ready. Please wait a moment and try again.';
            } else {
              errorMessage = `Camera error: ${error.message}`;
            }
        }
      }
      
      setHasPermission(false);
      setPermissionError(errorMessage);
      onRecordingError(errorMessage);
      
    } finally {
      setIsInitializing(false);
      console.log('🏁 === CAMERA INITIALIZATION END ===');
    }
  };

  const switchCamera = async (deviceId: string) => {
    console.log('🔄 === CAMERA SWITCH START ===');
    
    try {
      // Stop current stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Wait for video element to be ready
      const videoElement = await waitForVideoElement();
      console.log('✅ Video element ready for camera switch');

      // Request new camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: true
      });
      
      console.log('✅ New camera stream obtained');

      // Update video element
      videoElement.srcObject = stream;
      try {
        await videoElement.play();
      } catch (playError) {
        console.log('⚠️ Autoplay blocked (expected):', playError);
      }

      // Update state
      streamRef.current = stream;
      setSelectedVideoDevice(deviceId);
      
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) setIsVideoEnabled(videoTrack.enabled);
      if (audioTrack) setIsAudioEnabled(audioTrack.enabled);
      
      console.log('✅ Camera switch completed');
      
    } catch (error) {
      console.error('❌ Camera switch failed:', error);
      onRecordingError('Failed to switch camera. Please try again.');
    } finally {
      console.log('🏁 === CAMERA SWITCH END ===');
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

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
        onRecordingComplete(videoBlob, recordingTime);
        chunksRef.current = [];
        setRecordingStatus('completed');
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        onRecordingError('Recording failed');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      
      setIsRecording(true);
      setIsPaused(false);
      setRecordingStatus('recording');
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      onRecordingError('Failed to start recording');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setRecordingStatus('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setRecordingStatus('recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (recordingStatus) {
      case 'recording':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (recordingStatus) {
      case 'recording':
        return 'Recording';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Completed';
      default:
        return 'Ready';
    }
  };

  if (isInitializing) {
    return (
      <Card className={cn('w-full max-w-4xl mx-auto', className)}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Initializing Camera
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">Setting up your camera...</p>
            <p className="text-sm text-gray-500">Please allow camera and microphone access if prompted</p>
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
            Video Recording Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Camera and Microphone Access Required</p>
                <p className="text-sm text-gray-600">
                  {permissionError || 'Please grant camera and microphone permissions to record your skill practice.'}
                </p>
                <div className="flex space-x-2">
                  <Button 
                    onClick={initializeCamera} 
                    disabled={isInitializing}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {isInitializing ? 'Initializing...' : 'Grant Camera Access'}
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('Manual retry initiated');
                      setPermissionError('');
                      initializeCamera();
                    }}
                    variant="outline"
                    disabled={isInitializing}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <p>🔧 Troubleshooting:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Make sure your browser supports camera access</li>
                    <li>Check if camera permissions are blocked in browser settings</li>
                    <li>Ensure no other applications are using your camera</li>
                    <li>Try refreshing the page if the problem persists</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Video className="h-5 w-5 mr-2" />
            Video Recording
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className={cn('w-3 h-3 rounded-full', getStatusColor())} />
            <Badge variant="outline">{getStatusText()}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              controls={false}
              className="w-full h-full object-cover bg-black"
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'cover',
                background: '#000'
              }}
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

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            {/* Video Toggle */}
            <Button
              variant="outline"
              size="lg"
              onClick={toggleVideo}
              className={cn(
                'flex items-center space-x-2',
                !isVideoEnabled && 'bg-red-50 border-red-200 text-red-600'
              )}
            >
              {isVideoEnabled ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
              <span>{isVideoEnabled ? 'Video On' : 'Video Off'}</span>
            </Button>

            {/* Audio Toggle */}
            <Button
              variant="outline"
              size="lg"
              onClick={toggleAudio}
              className={cn(
                'flex items-center space-x-2',
                !isAudioEnabled && 'bg-red-50 border-red-200 text-red-600'
              )}
            >
              {isAudioEnabled ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
              <span>{isAudioEnabled ? 'Audio On' : 'Audio Off'}</span>
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
                Start Recording
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                {!isPaused ? (
                  <Button
                    onClick={pauseRecording}
                    variant="outline"
                    size="lg"
                    className="border-yellow-200 hover:bg-yellow-50"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={resumeRecording}
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
                
                <Button
                  onClick={stopRecording}
                  variant="outline"
                  size="lg"
                  className="border-red-200 hover:bg-red-50 text-red-600"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            )}
          </div>

          {/* Camera Selection */}
          {videoDevices.length > 1 && (
            <div className="flex items-center justify-center space-x-4">
              <Settings className="h-4 w-4 text-gray-500" />
              <select
                value={selectedVideoDevice}
                onChange={(e) => switchCamera(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                disabled={isRecording}
              >
                {videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="text-blue-800">
                  <p className="font-medium">Processing Video...</p>
                  <p className="text-sm">Your video is being analyzed. This may take a few minutes.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
