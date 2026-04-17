/**
 * ClassroomBroadcastBar — sticky banner rendered above the instructor's
 * live case view when hosting a classroom session.
 *
 * The instructor drives the exact same case UI the students see in
 * single-player mode (LIFEPAK, 3D body, ABCDE, treatments). This banner
 * layers the classroom-specific controls on top: live student count,
 * quick vitals-push buttons, reveal diagnosis / red flags, free-text
 * teaching message, and end-case / end-session controls.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Radio,
  Users,
  TrendingDown,
  Activity,
  Target,
  AlertTriangle,
  MessageSquare,
  X,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { CaseScenario } from '@/types';
import type { ClassroomBroadcast, ClassroomParticipant } from '@/hooks/useClassroomSession';

interface Props {
  caseData: CaseScenario;
  participants: ClassroomParticipant[];
  pin: string;
  onBroadcast: (payload: ClassroomBroadcast) => Promise<void> | void;
  onEndCase: () => Promise<void> | void;
  onEndSession: () => Promise<void> | void;
}

function vitalsToSummary(v: NonNullable<CaseScenario['vitalSignsProgression']['initial']>): string {
  const parts: string[] = [];
  if (v.bp) parts.push(`BP ${v.bp}`);
  if (v.pulse !== undefined) parts.push(`HR ${v.pulse}`);
  if (v.respiration !== undefined) parts.push(`RR ${v.respiration}`);
  if (v.spo2 !== undefined) parts.push(`SpO2 ${v.spo2}%`);
  if (v.gcs !== undefined) parts.push(`GCS ${v.gcs}`);
  if (v.temperature !== undefined) parts.push(`Temp ${v.temperature}°C`);
  return parts.join(' · ');
}

export function ClassroomBroadcastBar({
  caseData,
  participants,
  pin,
  onBroadcast,
  onEndCase,
  onEndSession,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [revealedDx, setRevealedDx] = useState(false);
  const [revealedFlags, setRevealedFlags] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const students = participants.filter(p => p.role === 'student');

  // ESC to collapse the expanded panel
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const pushVitals = async (stage: 'afterIntervention' | 'enRoute' | 'deterioration') => {
    const v = caseData.vitalSignsProgression?.[stage];
    if (!v) return;
    const labels = {
      afterIntervention: 'After intervention',
      enRoute: 'En route',
      deterioration: '⚠ Deterioration',
    } as const;
    await onBroadcast({
      kind: 'instructor_message',
      text: `📊 ${labels[stage]} vitals — ${vitalsToSummary(v)}`,
    });
    toast.success(`${labels[stage]} vitals sent to students`);
  };

  const revealDx = async () => {
    const dx = caseData.expectedFindings?.mostLikelyDiagnosis;
    if (!dx) return;
    await onBroadcast({ kind: 'instructor_message', text: `🎯 Working diagnosis: ${dx}` });
    setRevealedDx(true);
    toast.success('Diagnosis revealed to students');
  };

  const revealFlags = async () => {
    const flags = caseData.expectedFindings?.redFlags ?? [];
    if (flags.length === 0) return;
    await onBroadcast({
      kind: 'instructor_message',
      text: `🚩 Red flags to recognise:\n${flags.map(f => `• ${f}`).join('\n')}`,
    });
    setRevealedFlags(true);
    toast.success('Red flags shared with students');
  };

  const sendMessage = async () => {
    const text = message.trim();
    if (!text) return;
    await onBroadcast({ kind: 'instructor_message', text });
    toast.success('Message sent to students');
    setMessage('');
    inputRef.current?.focus();
  };

  return (
    <Card className="mb-4 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent">
      <CardContent className="py-3 px-4">
        {/* --- Always-visible collapsed row --- */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex items-center justify-center">
              <Radio className="w-4 h-4 text-emerald-500" />
              <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Classroom live
            </span>
          </div>

          <Badge variant="outline" className="gap-1 text-xs font-mono">
            PIN {pin}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="w-3 h-3" />
            <span className="text-xs font-medium">{students.length} student{students.length !== 1 ? 's' : ''}</span>
          </Badge>

          <div className="flex-1" />

          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(v => !v)}
              className="h-7 gap-1.5 text-xs"
              aria-expanded={expanded}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {expanded ? 'Hide controls' : 'Broadcast'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => void onEndCase()} className="h-7 text-xs">
              End case
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void onEndSession()}
              className="h-7 text-xs text-destructive hover:text-destructive"
              aria-label="End classroom session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* --- Expanded control panel --- */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Broadcast action row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void pushVitals('afterIntervention')}
                disabled={!caseData.vitalSignsProgression?.afterIntervention}
                className="h-7 gap-1.5 text-xs"
              >
                <Activity className="w-3 h-3" />
                Push post-int vitals
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void pushVitals('enRoute')}
                disabled={!caseData.vitalSignsProgression?.enRoute}
                className="h-7 gap-1.5 text-xs"
              >
                <Activity className="w-3 h-3" />
                Push en-route
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void pushVitals('deterioration')}
                disabled={!caseData.vitalSignsProgression?.deterioration}
                className="h-7 gap-1.5 text-xs text-amber-600 border-amber-300"
              >
                <TrendingDown className="w-3 h-3" />
                Deterioration
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void revealDx()}
                disabled={!caseData.expectedFindings?.mostLikelyDiagnosis || revealedDx}
                className="h-7 gap-1.5 text-xs"
              >
                <Target className="w-3 h-3" />
                {revealedDx ? 'Dx revealed' : 'Reveal diagnosis'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void revealFlags()}
                disabled={(caseData.expectedFindings?.redFlags?.length ?? 0) === 0 || revealedFlags}
                className="h-7 gap-1.5 text-xs"
              >
                <AlertTriangle className="w-3 h-3" />
                {revealedFlags ? 'Flags sent' : 'Send red flags'}
              </Button>
            </div>

            {/* Free-text message */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Teaching note to push to every student (Enter to send)"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                className="h-8 text-xs"
              />
              <Button size="sm" onClick={() => void sendMessage()} disabled={!message.trim()} className="h-8 text-xs gap-1.5 shrink-0">
                <MessageSquare className="w-3 h-3" />
                Send
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setExpanded(false)} className="h-8 w-8 p-0 shrink-0" aria-label="Close">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Student list */}
            {students.length > 0 && (
              <div className="text-[11px] text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider">Connected:</span>{' '}
                {students.map(s => s.displayName).join(' · ')}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ClassroomBroadcastBar;
