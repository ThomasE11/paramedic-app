import { Clock, Play, Pause, RotateCcw, AlarmClock } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SessionTimerProps {
  duration?: number; // Default duration in minutes
  onTimerComplete?: () => void;
  onTimerStart?: () => void;
  onElapsedTimeChange?: (elapsedTime: string, seconds: number) => void;
  className?: string;
}

export function SessionTimer({
  duration = 20,
  onTimerComplete,
  onTimerStart,
  onElapsedTimeChange,
  className = ''
}: SessionTimerProps) {
  const [timeLimit, setTimeLimit] = useState(duration);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const handleTimerCompleteRef = useRef<(() => void) | null>(null);

  // Create audio element for alarm
  useEffect(() => {
    audioRef.current = new Audio('/alarm.mp3');
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setShowAlarm(true);
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
    if (onTimerComplete) {
      onTimerComplete();
    }
  }, [onTimerComplete]);

  // Keep ref updated with latest callback
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  // Update elapsed time when timer changes
  useEffect(() => {
    if (isRunning && !isPaused) {
      const elapsed = (timeLimit * 60) - timeRemaining;
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      const formatted = `${mins}m ${secs}s`;
      onElapsedTimeChange?.(formatted, elapsed);
    }
  }, [timeRemaining, isRunning, isPaused, timeLimit, onElapsedTimeChange]);

  // Timer effect - uses ref to avoid stale closure
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeRemaining]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    setShowAlarm(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (onTimerStart && !isPaused) {
      onTimerStart();
    }
  }, [onTimerStart, isPaused]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(timeLimit * 60);
    setShowAlarm(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [timeLimit]);

  const stopAlarm = useCallback(() => {
    setShowAlarm(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value) || 20;
    setTimeLimit(newDuration);
    if (!isRunning) {
      setTimeRemaining(newDuration * 60);
    }
  }, [isRunning]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get elapsed time
  const getElapsedTime = useCallback(() => {
    const elapsed = (timeLimit * 60) - timeRemaining;
    return formatTime(elapsed);
  }, [timeLimit, timeRemaining, formatTime]);

  // Calculate progress percentage
  const progressPercent = ((timeLimit * 60) - timeRemaining) / (timeLimit * 60) * 100;

  // Time-based color
  const getTimeColor = () => {
    const remainingPercent = (timeRemaining / (timeLimit * 60)) * 100;
    if (remainingPercent <= 10) return 'text-red-600 dark:text-red-400';
    if (remainingPercent <= 25) return 'text-orange-600 dark:text-orange-400';
    if (remainingPercent <= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      {/* Alarm Overlay */}
      {showAlarm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-pulse">
          <div className="bg-red-600 text-white p-8 rounded-lg shadow-2xl text-center">
            <AlarmClock className="w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold mb-2">TIME'S UP!</h2>
            <p className="text-lg mb-4">Case duration completed</p>
            <Button onClick={stopAlarm} variant="secondary" size="lg">
              Dismiss Alarm
            </Button>
          </div>
        </div>
      )}

      {/* Timer Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${getTimeColor()}`} />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Session Timer</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Elapsed: {getElapsedTime()}
        </div>
      </div>

      {/* Duration Input (only shown when not running) */}
      {!isRunning && (
        <div className="mb-4 flex items-center gap-2">
          <label htmlFor="duration" className="text-sm text-gray-600 dark:text-gray-400">
            Duration (min):
          </label>
          <Input
            id="duration"
            type="number"
            min={1}
            max={180}
            value={timeLimit}
            onChange={handleDurationChange}
            className="w-24"
          />
        </div>
      )}

      {/* Time Display */}
      <div className="relative">
        <div className={`text-6xl font-mono font-bold text-center py-6 ${getTimeColor()}`}>
          {formatTime(timeRemaining)}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              progressPercent >= 90 ? 'bg-red-500' :
              progressPercent >= 75 ? 'bg-orange-500' :
              progressPercent >= 50 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3 mt-6">
        {!isRunning ? (
          <Button
            onClick={startTimer}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Case
          </Button>
        ) : (
          <>
            {!isPaused ? (
              <Button
                onClick={pauseTimer}
                size="lg"
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={resumeTimer}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
            )}
            <Button
              onClick={resetTimer}
              size="lg"
              variant="outline"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </>
        )}
      </div>

      {/* Status Message */}
      {isRunning && !isPaused && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          Case in progress...
        </p>
      )}
      {isPaused && (
        <p className="text-center text-sm text-yellow-600 dark:text-yellow-400 mt-3">
          Timer paused
        </p>
      )}
    </div>
  );
}
