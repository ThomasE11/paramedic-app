
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Hands, Results, NormalizedLandmark } from '@mediapipe/hands';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface HandResults {
  landmarks: HandLandmark[][];
  worldLandmarks: HandLandmark[][];
  handedness: Array<{
    index: number;
    score: number;
    label: string;
  }>;
}

interface MediaPipeHandsTrackerProps {
  onResults?: (results: HandResults) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
  confidence?: number;
  maxHands?: number;
  className?: string;
}

export function MediaPipeHandsTracker({
  onResults,
  onError,
  enabled = true,
  confidence = 0.5,
  maxHands = 2,
  className = ''
}: MediaPipeHandsTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<Hands | null>(null);
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

    // Process hand landmarks
    if (results.multiHandLandmarks && results.multiHandedness) {
      const handResults: HandResults = {
        landmarks: results.multiHandLandmarks,
        worldLandmarks: results.multiHandWorldLandmarks || [],
        handedness: results.multiHandedness.map((hand, index) => ({
          index,
          score: hand.score || 0,
          label: hand.label || 'Unknown'
        }))
      };

      // Draw hand landmarks
      drawHandLandmarks(ctx, results.multiHandLandmarks, canvas.width, canvas.height);
      
      // Call callback with results
      onResults?.(handResults);
    }
  }, [onResults]);

  const drawHandLandmarks = useCallback((
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[][],
    width: number,
    height: number
  ) => {
    landmarks.forEach((handLandmarks, handIndex) => {
      // Draw hand connections
      const connections = [
        // Thumb
        [0, 1], [1, 2], [2, 3], [3, 4],
        // Index finger
        [0, 5], [5, 6], [6, 7], [7, 8],
        // Middle finger
        [0, 9], [9, 10], [10, 11], [11, 12],
        // Ring finger
        [0, 13], [13, 14], [14, 15], [15, 16],
        // Pinky
        [0, 17], [17, 18], [18, 19], [19, 20],
        // Palm
        [0, 5], [5, 9], [9, 13], [13, 17]
      ];

      // Draw connections
      ctx.strokeStyle = handIndex === 0 ? '#ff6b6b' : '#4ecdc4';
      ctx.lineWidth = 2;
      connections.forEach(([start, end]) => {
        const startPoint = handLandmarks[start];
        const endPoint = handLandmarks[end];
        if (startPoint && endPoint) {
          ctx.beginPath();
          ctx.moveTo(startPoint.x * width, startPoint.y * height);
          ctx.lineTo(endPoint.x * width, endPoint.y * height);
          ctx.stroke();
        }
      });

      // Draw landmark points
      ctx.fillStyle = handIndex === 0 ? '#ff6b6b' : '#4ecdc4';
      handLandmarks.forEach((landmark, index) => {
        const x = landmark.x * width;
        const y = landmark.y * height;
        
        ctx.beginPath();
        ctx.arc(x, y, index === 0 ? 8 : 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add landmark labels for key points
        if ([0, 4, 8, 12, 16, 20].includes(index)) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(index.toString(), x, y - 10);
          ctx.fillStyle = handIndex === 0 ? '#ff6b6b' : '#4ecdc4';
        }
      });
    });
  }, []);

  const initializeMediaPipe = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError('');

    try {
      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: maxHands,
        modelComplexity: 1,
        minDetectionConfidence: confidence,
        minTrackingConfidence: confidence
      });

      hands.onResults(handleResults);
      handsRef.current = hands;

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
        if (handsRef.current && enabled && videoRef.current) {
          await handsRef.current.send({ image: videoRef.current });
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
      console.error('MediaPipe initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize hand tracking';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  }, [enabled, confidence, maxHands, handleResults, onError]);

  useEffect(() => {
    if (enabled && !isInitialized && !isLoading) {
      initializeMediaPipe();
    }

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [enabled, isInitialized, isLoading, initializeMediaPipe]);

  // Update MediaPipe settings when props change
  useEffect(() => {
    if (handsRef.current && isInitialized) {
      handsRef.current.setOptions({
        maxNumHands: maxHands,
        modelComplexity: 1,
        minDetectionConfidence: confidence,
        minTrackingConfidence: confidence
      });
    }
  }, [confidence, maxHands, isInitialized]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hand tracking...</p>
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
        Hand Tracking: {enabled ? 'Active' : 'Inactive'}
      </div>
    </div>
  );
}

export default MediaPipeHandsTracker;
