import { Clock, Play, Pause, RotateCcw, AlarmClock, Timer } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

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
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  // Synthesize alarm tone using Web Audio API (no external file needed)
  const playAlarmTone = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    // Play a repeating beep pattern
    const playBeep = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    };
    playBeep();
    alarmIntervalRef.current = window.setInterval(playBeep, 600);
  }, []);

  const stopAlarmTone = useCallback(() => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlarmTone();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stopAlarmTone]);

  // Use refs to avoid effect dependencies and prevent unnecessary parent re-renders
  const onElapsedTimeChangeRef = useRef(onElapsedTimeChange);
  onElapsedTimeChangeRef.current = onElapsedTimeChange;

  // Update elapsed time when timer changes - throttled to reduce parent re-renders
  useEffect(() => {
    if (isRunning && !isPaused) {
      const elapsed = (timeLimit * 60) - timeRemaining;
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      const formatted = `${mins}m ${secs}s`;
      // Use ref to avoid triggering effect when callback changes
      onElapsedTimeChangeRef.current?.(formatted, elapsed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
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

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setShowAlarm(true);
    playAlarmTone();
    if (onTimerComplete) {
      onTimerComplete();
    }
  }, [onTimerComplete, playAlarmTone]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    setShowAlarm(false);
    stopAlarmTone();
    if (onTimerStart && !isPaused) {
      onTimerStart();
    }
  }, [onTimerStart, isPaused, stopAlarmTone]);

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
    stopAlarmTone();
  }, [timeLimit, stopAlarmTone]);

  const stopAlarm = useCallback(() => {
    setShowAlarm(false);
    stopAlarmTone();
  }, [stopAlarmTone]);

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

  // Time-based color with enhanced styling
  const getTimeColor = () => {
    const remainingPercent = (timeRemaining / (timeLimit * 60)) * 100;
    if (remainingPercent <= 10) return 'text-red-600 dark:text-red-400';
    if (remainingPercent <= 25) return 'text-orange-600 dark:text-orange-400';
    if (remainingPercent <= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getTimeGradient = () => {
    const remainingPercent = (timeRemaining / (timeLimit * 60)) * 100;
    if (remainingPercent <= 10) return 'from-red-500 to-red-600';
    if (remainingPercent <= 25) return 'from-orange-500 to-orange-600';
    if (remainingPercent <= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getStatusBadge = () => {
    if (showAlarm) return <Badge variant="destructive" className="animate-pulse">TIME'S UP!</Badge>;
    if (isPaused) return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Paused</Badge>;
    if (isRunning) return <Badge variant="outline" className="text-green-600 border-green-600 animate-pulse">Running</Badge>;
    return <Badge variant="secondary">Ready</Badge>;
  };

  return (
    <>
      {/* Alarm Overlay */}
      {showAlarm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 animate-pop-in">
            <div className="relative">
              <AlarmClock className="w-20 h-20 mx-auto mb-4 animate-bounce" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <AlarmClock className="w-20 h-20 mx-auto" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-2">TIME'S UP!</h2>
            <p className="text-lg mb-6 opacity-90">Case duration completed</p>
            <Button 
              onClick={stopAlarm} 
              variant="secondary" 
              size="lg"
              className="bg-white text-red-600 hover:bg-white/90 font-semibold"
            >
              Dismiss Alarm
            </Button>
          </div>
        </div>
      )}

      {/* Timer Card */}
      <Card className={`card-interactive ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className={`p-1.5 rounded-lg ${getTimeColor().replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}/10`}>
                <Clock className={`h-4 w-4 ${getTimeColor()}`} />
              </div>
              Session Timer
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Duration Input (only shown when not running) */}
          {!isRunning && (
            <div className="flex items-center gap-3">
              <label htmlFor="duration" className="text-sm text-muted-foreground whitespace-nowrap">
                Duration:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={180}
                  value={timeLimit}
                  onChange={handleDurationChange}
                  className="w-20 text-center"
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </div>
          )}

          {/* Time Display */}
          <div className="relative">
            <div className={`text-5xl font-mono font-bold text-center py-4 tracking-wider ${getTimeColor()} animate-fade-in`}>
              {formatTime(timeRemaining)}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={`h-full bg-gradient-to-r ${getTimeGradient()} transition-all duration-1000 ease-linear relative`}
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>

            {/* Time markers */}
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>Elapsed: {getElapsedTime()}</span>
              <span>100%</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <Button
                onClick={startTimer}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg btn-glow"
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
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Resume
                  </Button>
                )}
                <Button
                  onClick={resetTimer}
                  size="lg"
                  variant="outline"
                  className="hover:bg-muted"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>

          {/* Status Message */}
          <div className="text-center">
            {isRunning && !isPaused && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 animate-fade-in">
                <Timer className="h-3 w-3 animate-pulse" />
                Case in progress...
              </p>
            )}
            {isPaused && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center justify-center gap-1 animate-fade-in">
                <Pause className="h-3 w-3" />
                Timer paused
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default SessionTimer;
