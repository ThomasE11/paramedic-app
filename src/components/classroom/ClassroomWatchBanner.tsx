/**
 * ClassroomWatchBanner — the banner students see above the live case when
 * they're NOT the driver. A lean, non-interactive version of
 * ClassroomBroadcastBar (which is instructor-focused) showing: LIVE dot,
 * who's driving, countdown timer, and connected-student count.
 */

import { useEffect, useState } from 'react';
import { Radio, Users, Stethoscope, Clock, LogOut, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ClassroomParticipant } from '@/hooks/useClassroomSession';

interface Props {
  pin: string;
  participants: ClassroomParticipant[];
  driverKeys: string[];
  selfKey: string;
  timerEndsAt: string | null;
  onLeave: () => void;
  /** Voice-chat state piped in from useClassroomVoice. */
  voice?: {
    isBroadcasting: boolean;
    activeSpeakers: string[];
    listenerMuted: boolean;
    hasIncomingAudio: boolean;
    canBroadcast: boolean;
    error: string | null;
    startBroadcast: () => Promise<void> | void;
    stopBroadcast: () => void;
    toggleListenerMute: () => void;
  };
}

function formatCountdown(endsAt: string | null): { text: string; urgent: boolean; expired: boolean } {
  if (!endsAt) return { text: '', urgent: false, expired: false };
  const remaining = new Date(endsAt).getTime() - Date.now();
  if (remaining <= 0) return { text: 'time up', urgent: true, expired: true };
  const total = Math.floor(remaining / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return { text: `${mm}:${ss}`, urgent: total <= 120, expired: false };
}

export function ClassroomWatchBanner({ pin, participants, driverKeys, selfKey, timerEndsAt, onLeave, voice }: Props) {
  const speakerNames = (voice?.activeSpeakers ?? [])
    .map(k => participants.find(p => p.key === k)?.displayName)
    .filter((n): n is string => Boolean(n));
  // Tick every second so the countdown refreshes.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!timerEndsAt) return;
    const id = window.setInterval(() => setTick(n => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerEndsAt]);

  const students = participants.filter(p => p.role === 'student');
  const driverNames = driverKeys
    .map(k => participants.find(p => p.key === k)?.displayName)
    .filter((n): n is string => Boolean(n));
  const selfIsDriver = driverKeys.includes(selfKey);
  const countdown = formatCountdown(timerEndsAt);

  return (
    <Card className="mb-4 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent">
      <CardContent className="py-3 px-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center justify-center">
            <Radio className="w-4 h-4 text-emerald-500" />
            <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Classroom · live
          </span>
        </div>

        <Badge variant="outline" className="gap-1 text-xs font-mono">
          PIN {pin}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Users className="w-3 h-3" />
          <span className="text-xs font-medium">{students.length} student{students.length !== 1 ? 's' : ''}</span>
        </Badge>

        {driverNames.length > 0 && (
          <Badge variant={selfIsDriver ? 'default' : 'secondary'} className="gap-1">
            <Stethoscope className="w-3 h-3" />
            <span className="text-xs font-medium">
              {selfIsDriver
                ? 'You are driving'
                : driverNames.length === 1
                  ? `${driverNames[0]} is driving`
                  : `Driving: ${driverNames.join(' + ')}`}
            </span>
          </Badge>
        )}

        {timerEndsAt && (
          <Badge
            variant={countdown.urgent ? 'destructive' : 'outline'}
            className={`gap-1 text-xs font-mono tabular-nums ${countdown.expired ? 'opacity-70' : ''}`}
          >
            <Clock className="w-3 h-3" />
            {countdown.text}
          </Badge>
        )}

        {voice?.hasIncomingAudio && speakerNames.length > 0 && (
          <Badge variant="default" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="text-xs font-medium">{speakerNames.join(', ')} speaking</span>
          </Badge>
        )}

        <div className="flex-1" />

        {voice && voice.canBroadcast && (
          <Button
            size="sm"
            variant={voice.isBroadcasting ? 'default' : 'outline'}
            onClick={() => {
              if (voice.isBroadcasting) voice.stopBroadcast();
              else void voice.startBroadcast();
            }}
            className={`h-7 gap-1.5 text-xs ${voice.isBroadcasting ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
            aria-pressed={voice.isBroadcasting}
          >
            {voice.isBroadcasting ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            {voice.isBroadcasting ? 'Speaking' : 'Talk'}
          </Button>
        )}

        {voice?.hasIncomingAudio && (
          <Button
            size="sm"
            variant="ghost"
            onClick={voice.toggleListenerMute}
            className="h-7 gap-1.5 text-xs"
            aria-pressed={voice.listenerMuted}
            aria-label={voice.listenerMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {voice.listenerMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={onLeave}
          className="h-7 text-xs text-destructive hover:text-destructive gap-1.5"
          aria-label="Leave session"
        >
          <LogOut className="w-3.5 h-3.5" />
          Leave
        </Button>
      </CardContent>
    </Card>
  );
}

export default ClassroomWatchBanner;
