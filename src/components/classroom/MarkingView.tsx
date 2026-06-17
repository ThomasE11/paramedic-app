/**
 * MarkingView — the instructor's "Marking" mode for the unified host.
 *
 * Kahoot-style: students join on the same session PIN, but instead of the
 * full digital spectator sim, the instructor gets a lean, iPad-friendly
 * surface for running a TRADITIONAL manikin simulation:
 *
 *   1. Pre-brief (INACSL PreBriefingPanel) — orient the students.
 *   2. Live marking — tick off the case checklist as the student performs
 *      each action on the manikin; running score + critical-action flags.
 *
 * No heavy 3D/monitor engine — this is a clipboard, not a patient simulator.
 */

import { useMemo, useState } from 'react';
import type { CaseScenario } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PreBriefingPanel } from '@/components/PreBriefingPanel';
import { CheckCircle2, Circle, Users, ClipboardCheck, Square, RotateCcw } from 'lucide-react';

interface MarkingViewProps {
  caseData: CaseScenario;
  pin: string;
  participantCount: number;
  onEndCase: () => void;
}

export function MarkingView({ caseData, pin, participantCount, onEndCase }: MarkingViewProps) {
  const [phase, setPhase] = useState<'prebrief' | 'marking'>('prebrief');
  const [done, setDone] = useState<Set<string>>(new Set());

  const checklist = useMemo(
    () => caseData.studentChecklist ?? [],
    [caseData.studentChecklist],
  );
  const totalPoints = useMemo(() => checklist.reduce((s, i) => s + (i.points || 0), 0), [checklist]);
  const earned = useMemo(
    () => checklist.filter(i => done.has(i.id)).reduce((s, i) => s + (i.points || 0), 0),
    [checklist, done],
  );
  const pct = totalPoints > 0 ? Math.round((earned / totalPoints) * 100) : 0;
  const criticalTotal = checklist.filter(i => i.critical).length;
  const criticalDone = checklist.filter(i => i.critical && done.has(i.id)).length;

  const toggle = (id: string) =>
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  if (phase === 'prebrief') {
    return (
      <div className="min-h-screen bg-background">
        <PinBar pin={pin} participantCount={participantCount} onEndCase={onEndCase} />
        <div className="max-w-3xl mx-auto px-4 py-6">
          <PreBriefingPanel
            caseData={caseData}
            onStartSimulation={() => setPhase('marking')}
            onSkip={() => setPhase('marking')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PinBar pin={pin} participantCount={participantCount} onEndCase={onEndCase} />
      <div className="max-w-3xl mx-auto px-4 py-5">
        {/* Score header */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Marking — {caseData.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tick each action as the student performs it on the manikin.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold tabular-nums">{pct}%</div>
            <div className="text-[11px] text-muted-foreground">{earned}/{totalPoints} pts</div>
          </div>
        </div>

        {/* Progress + critical chip */}
        <div className="mb-4">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {criticalTotal > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Critical actions: <span className={criticalDone === criticalTotal ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>{criticalDone}/{criticalTotal}</span>
            </p>
          )}
        </div>

        {/* Checklist — large tap targets for iPad */}
        <div className="space-y-2">
          {checklist.map(item => {
            const checked = done.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`w-full text-left rounded-xl border p-4 flex items-start gap-3 transition-colors active:scale-[0.99] ${
                  checked
                    ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20'
                    : 'border-border bg-card hover:bg-muted/40'
                }`}
              >
                {checked
                  ? <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                  : <Circle className="h-6 w-6 text-muted-foreground/40 shrink-0 mt-0.5" />}
                <span className="flex-1 min-w-0">
                  <span className={`text-sm ${checked ? 'font-medium' : ''}`}>{item.description}</span>
                  {item.critical && <Badge className="ml-2 bg-red-600 text-white text-[10px]">Critical</Badge>}
                </span>
                <span className="text-xs text-muted-foreground shrink-0 tabular-nums">+{item.points}</span>
              </button>
            );
          })}
          {checklist.length === 0 && (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">This case has no marking checklist.</CardContent></Card>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" onClick={() => setDone(new Set())} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" onClick={() => setPhase('prebrief')} className="gap-2">
            Back to pre-brief
          </Button>
          <Button onClick={onEndCase} className="gap-2 ml-auto bg-primary">
            <Square className="h-4 w-4" /> End case
          </Button>
        </div>
      </div>
    </div>
  );
}

function PinBar({ pin, participantCount, onEndCase }: { pin: string; participantCount: number; onEndCase: () => void }) {
  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Join code</span>
          <span className="font-mono text-xl font-bold tracking-wider">{pin.slice(0, 3)} {pin.slice(3)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> {participantCount}
          </span>
          <Button size="sm" variant="ghost" onClick={onEndCase} className="text-xs">End</Button>
        </div>
      </div>
    </div>
  );
}

export default MarkingView;
