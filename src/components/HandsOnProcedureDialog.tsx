import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CircleDot, Hand, Play, RotateCcw } from 'lucide-react';
import type { CaseScenario } from '@/types';
import type { Treatment } from '@/data/enhancedTreatmentEffects';
import {
  getHandsOnProcedurePlan,
  type ProcedureTarget,
} from '@/lib/handsOnProcedures';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HandsOnProcedureDialogProps {
  open: boolean;
  treatment: Treatment | null;
  caseData: CaseScenario;
  onCancel: () => void;
  onComplete: (target: ProcedureTarget | null) => void;
}
const TARGET_POSITION: Record<string, { left: string; top: string }> = {
  head: { left: '50%', top: '8%' },
  face: { left: '50%', top: '11%' },
  neck: { left: '50%', top: '18%' },
  airway: { left: '50%', top: '15%' },
  chest: { left: '50%', top: '31%' },
  abdomen: { left: '50%', top: '43%' },
  pelvis: { left: '50%', top: '52%' },
  'right-arm': { left: '28%', top: '39%' },
  'left-arm': { left: '72%', top: '39%' },
  'right-leg': { left: '42%', top: '76%' },
  'left-leg': { left: '58%', top: '76%' },
  back: { left: '50%', top: '34%' },
};

export function HandsOnProcedureDialog({
  open,
  treatment,
  caseData,
  onCancel,
  onComplete,
}: HandsOnProcedureDialogProps) {
  const plan = useMemo(
    () => treatment ? getHandsOnProcedurePlan(treatment.id, caseData) : null,
    [caseData, treatment],
  );
  const [selectedTarget, setSelectedTarget] = useState<ProcedureTarget | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [animatingStep, setAnimatingStep] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open || !plan) return;
    setSelectedTarget(plan.requiresTarget && plan.targets.length === 1 ? plan.targets[0] : null);
    setCompletedSteps([]);
    setAnimatingStep(null);
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, [open, plan]);

  if (!plan) return null;

  const nextStep = plan.steps.find(step => !completedSteps.includes(step.id));
  const complete = completedSteps.length === plan.steps.length;
  const canStart = !plan.requiresTarget || selectedTarget != null;
  const isDefibrillatorPadProcedure = plan.id === 'defib-pads';
  const chestExposed = completedSteps.includes('expose');
  const bothPadsPlaced = completedSteps.includes('apical');
  const padsConnected = completedSteps.includes('connect');

  const performStep = () => {
    if (!nextStep || animatingStep || !canStart) return;
    setAnimatingStep(nextStep.id);
    timerRef.current = window.setTimeout(() => {
      setCompletedSteps(previous => [...previous, nextStep.id]);
      setAnimatingStep(null);
      timerRef.current = null;
    }, Math.min(1400, Math.max(650, nextStep.durationMs)));
  };

  const reset = () => {
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    setCompletedSteps([]);
    setAnimatingStep(null);
  };

  return (
    <Dialog open={open} onOpenChange={value => { if (!value && !animatingStep) onCancel(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hand className="h-5 w-5 text-sky-500" />
            {plan.title}
          </DialogTitle>
          <DialogDescription>{plan.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <section className="space-y-3 rounded-2xl border border-border/60 bg-slate-950 p-4 text-white">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Procedure field</p>
                <p className="text-xs text-slate-400">The selected site is the only site treated.</p>
              </div>
              <img src={plan.equipmentAsset} alt="" className="h-12 w-12 object-contain drop-shadow-lg" />
            </div>

            <div className="relative mx-auto h-[300px] w-[190px] overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-slate-800 to-slate-900">
              <div className="absolute left-1/2 top-4 h-14 w-14 -translate-x-1/2 rounded-full border-2 border-slate-500 bg-slate-700" />
              <div className={`absolute left-1/2 top-[72px] h-[116px] w-20 -translate-x-1/2 rounded-[44px] border-2 transition-colors duration-500 ${isDefibrillatorPadProcedure && chestExposed ? 'border-amber-200/55 bg-[#8f654f]' : 'border-slate-500 bg-slate-700'}`} />
              <div className="absolute left-[30px] top-[82px] h-32 w-7 rotate-[8deg] rounded-full border-2 border-slate-500 bg-slate-700" />
              <div className="absolute right-[30px] top-[82px] h-32 w-7 -rotate-[8deg] rounded-full border-2 border-slate-500 bg-slate-700" />
              <div className="absolute left-[62px] top-[178px] h-28 w-7 rotate-[3deg] rounded-full border-2 border-slate-500 bg-slate-700" />
              <div className="absolute right-[62px] top-[178px] h-28 w-7 -rotate-[3deg] rounded-full border-2 border-slate-500 bg-slate-700" />

              {isDefibrillatorPadProcedure && completedSteps.includes('sternal') && !bothPadsPlaced && (
                <span className="absolute left-[74px] top-[82px] z-10 h-7 w-5 -rotate-6 rounded-md border border-white/80 bg-stone-50 shadow-[0_4px_10px_rgba(0,0,0,0.45)]" aria-label="Sternal pad placed" />
              )}
              {isDefibrillatorPadProcedure && bothPadsPlaced && (
                <img
                  src="/equipment-assets/defib-pads-applied.webp"
                  alt="Defibrillator pads placed in anterior-lateral position"
                  className={`absolute left-1/2 top-[71px] z-10 h-[114px] w-[92px] -translate-x-1/2 scale-x-[-1] object-contain drop-shadow-lg transition ${padsConnected ? 'opacity-100' : 'opacity-90'}`}
                />
              )}
              {isDefibrillatorPadProcedure && padsConnected && (
                <span className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-emerald-300/50 bg-emerald-950/90 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-200 shadow-lg">
                  Lead connected
                </span>
              )}

              {selectedTarget && (
                <span
                  className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-200 bg-red-500/45 shadow-[0_0_22px_rgba(239,68,68,0.9)]"
                  style={TARGET_POSITION[selectedTarget.id]}
                  aria-label={`Selected site: ${selectedTarget.label}`}
                >
                  <CircleDot className="h-full w-full p-1 text-white" />
                </span>
              )}

              {animatingStep && nextStep && (
                <div className={`procedure-hands procedure-motion-${nextStep.motion}`} aria-label={`Performing ${nextStep.label}`}>
                  <Hand className="procedure-hand procedure-hand-left" />
                  <Hand className="procedure-hand procedure-hand-right" />
                </div>
              )}
            </div>

            {plan.requiresTarget && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Choose the treatment site</p>
                <div className="grid grid-cols-2 gap-2">
                  {plan.targets.map(target => (
                    <button
                      type="button"
                      key={target.id}
                      disabled={completedSteps.length > 0 || !!animatingStep}
                      onClick={() => setSelectedTarget(target)}
                      className={`rounded-xl border p-2 text-left transition ${selectedTarget?.id === target.id ? 'border-red-400 bg-red-500/20 ring-2 ring-red-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                    >
                      <span className="block text-xs font-semibold">{target.label}</span>
                      <span className="line-clamp-2 text-[10px] text-slate-400">{target.detail}</span>
                      {target.priority === 'injury' && <Badge className="mt-1 bg-red-500/20 text-[9px] text-red-200">Visible injury</Badge>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Hands-on sequence</p>
              <span className="text-xs font-semibold tabular-nums">{completedSteps.length}/{plan.steps.length}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${(completedSteps.length / plan.steps.length) * 100}%` }} />
            </div>

            <div className="space-y-2">
              {plan.steps.map((step, index) => {
                const done = completedSteps.includes(step.id);
                const active = nextStep?.id === step.id;
                const running = animatingStep === step.id;
                return (
                  <div key={step.id} className={`rounded-xl border p-3 transition ${done ? 'border-emerald-500/30 bg-emerald-500/5' : active ? 'border-sky-500/40 bg-sky-500/5 shadow-sm' : 'border-border/50 opacity-55'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${done ? 'bg-emerald-500 text-white' : active ? 'bg-sky-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{step.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{step.instruction}</p>
                        {(active || done) && <p className="mt-2 rounded-lg bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300"><strong>Clinical cue:</strong> {step.clinicalCue}</p>}
                      </div>
                      {running && <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {!canStart && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">Select the exact injury site before beginning.</p>}
          </section>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} disabled={!!animatingStep}>Cancel</Button>
            <Button variant="ghost" onClick={reset} disabled={!completedSteps.length || !!animatingStep}>
              <RotateCcw className="mr-1 h-4 w-4" /> Reset
            </Button>
          </div>
          {complete ? (
            <Button onClick={() => onComplete(selectedTarget)} className="bg-emerald-600 hover:bg-emerald-700">
              <Check className="mr-1 h-4 w-4" /> {plan.completionLabel}
            </Button>
          ) : (
            <Button onClick={performStep} disabled={!canStart || !!animatingStep || !nextStep}>
              <Play className="mr-1 h-4 w-4" /> {animatingStep ? 'Performing…' : `Perform: ${nextStep?.label ?? ''}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
