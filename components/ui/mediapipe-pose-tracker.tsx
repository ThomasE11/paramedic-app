
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pose, Results, NormalizedLandmark } from '@mediapipe/pose';

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseResults {
  landmarks: PoseLandmark[];
  worldLandmarks: PoseLandmark[];
  segmentationMask?: any;
}

interface MediaPipePoseTrackerProps {
  onResults?: (results: PoseResults) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
  confidence?: number;
  complexity?: number;
  smoothing?: boolean;
  className?: string;
}

export function MediaPipePoseTracker({
  onResults,
  onError,
  enabled = true,
  confidence = 0.5,
  complexity = 1,
  smoothing = true,
  className = ''
}: MediaPipePoseTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleResults = useCallback((results: Results) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Process pose landmarks
    if (results.poseLandmarks) {
      const poseResults: PoseResults = {
        landmarks: results.poseLandmarks,
        worldLandmarks: results.poseWorldLandmarks || [],
        segmentationMask: results.segmentationMask
      };

      // Draw pose landmarks and connections
      drawPoseLandmarks(ctx, results.poseLandmarks, canvas.width, canvas.height);
      
      // Call callback with results
      onResults?.(poseResults);
    }
  }, [onResults]);

  const drawPoseLandmarks = useCallback((
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    width: number,
    height: number
  ) => {
    // Define pose connections
    const connections = [
      // Face
      [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
      // Body
      [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
      [16, 18], [18, 20], [16, 20], [16, 22], [12, 14], [14, 16],
      // Arms
      [11, 23], [12, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29],
      [28, 30], [29, 31], [30, 32], [27, 31], [28, 32],
      // Legs
      [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30],
      [29, 31], [30, 32]
    ];

    // Draw connections
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      if (startPoint && endPoint && startPoint.visibility && endPoint.visibility && 
          startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });

    // Draw landmark points
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility && landmark.visibility > 0.5) {
        const x = landmark.x * width;
        const y = landmark.y * height;
        
        // Color coding for different body parts
        let color = '#00ff00';
        if (index <= 10) color = '#ff0000'; // Face
        else if (index <= 16) color = '#0000ff'; // Torso
        else if (index <= 22) color = '#ffff00'; // Arms
        else color = '#ff00ff'; // Legs
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add landmark labels for key points
        if ([0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(index)) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(index.toString(), x, y - 10);
        }
      }
    });
  }, []);

  const initializeMediaPipe = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError('');

    try {
      // Initialize MediaPipe Pose
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      pose.setOptions({
        modelComplexity: complexity as (0 | 1 | 2),
        smoothLandmarks: smoothing,
        enableSegmentation: true,
        smoothSegmentation: smoothing,
        minDetectionConfidence: confidence,
        minTrackingConfidence: confidence
      });

      pose.onResults(handleResults);
      poseRef.current = pose;

      // Initialize camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      // Process video frames
      const processFrame = async () => {
        if (poseRef.current && enabled && videoRef.current) {
          await poseRef.current.send({ image: videoRef.current });
        }
        if (enabled) {
          requestAnimationFrame(processFrame);
        }
      };

      videoRef.current.onloadedmetadata = () => {
        processFrame();
      };

      setIsInitialized(true);
      setIsLoading(false);

    } catch (error) {
      console.error('MediaPipe Pose initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize pose tracking';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  }, [enabled, confidence, complexity, smoothing, handleResults, onError]);

  useEffect(() => {
    if (enabled && !isInitialized && !isLoading) {
      initializeMediaPipe();
    }

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [enabled, isInitialized, isLoading, initializeMediaPipe]);

  // Update MediaPipe settings when props change
  useEffect(() => {
    if (poseRef.current && isInitialized) {
      poseRef.current.setOptions({
        modelComplexity: complexity as (0 | 1 | 2),
        smoothLandmarks: smoothing,
        enableSegmentation: true,
        smoothSegmentation: smoothing,
        minDetectionConfidence: confidence,
        minTrackingConfidence: confidence
      });
    }
  }, [confidence, complexity, smoothing, isInitialized]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pose tracking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={initializeMediaPipe}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover rounded-lg"
        width={1280}
        height={720}
      />
      
      {/* Overlay information */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        Pose Tracking: {enabled ? 'Active' : 'Inactive'}
      </div>
    </div>
  );
}

export default MediaPipePoseTracker;
