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
  appliedTreatmentIds?: string[];
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

const AIRWAY_PREVIEW_TREATMENTS = new Set([
  'oxygen_nonrebreather', 'oxygen_mask', 'oxygen_nasal', 'bvm_ventilation',
  'intubation', 'rsi_intubation', 'opa_insert', 'suction',
  'nebulizer_salbutamol', 'nebulizer_ipratropium', 'cpap_niv', 'ventilator_setup',
]);

function AirwayProcedurePreview({
  treatmentId,
  equipmentAsset,
  completedSteps,
  animatingStep,
}: {
  treatmentId: string;
  equipmentAsset: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  if (!AIRWAY_PREVIEW_TREATMENTS.has(treatmentId)) return null;

  const reached = (...stepIds: string[]) => stepIds.some(id => completedSteps.includes(id) || animatingStep === id);
  const oxygenInterface = ['oxygen_nonrebreather', 'oxygen_mask', 'oxygen_nasal'].includes(treatmentId);
  const bvm = treatmentId === 'bvm_ventilation';
  const intubation = treatmentId === 'intubation' || treatmentId === 'rsi_intubation';
  const opa = treatmentId === 'opa_insert';
  const suction = treatmentId === 'suction';
  const cpap = treatmentId === 'cpap_niv';
  const nebuliser = treatmentId.startsWith('nebulizer_');
  const ventilator = treatmentId === 'ventilator_setup';

  const supplyConnected = oxygenInterface ? reached('connect')
    : bvm ? reached('prepare')
      : cpap || nebuliser ? reached('assemble')
        : suction ? reached('prepare')
          : ventilator ? reached('assemble')
            : intubation ? reached('capnography')
              : false;
  const interfaceApplied = oxygenInterface ? reached('apply')
    : bvm ? reached('seal')
      : intubation ? reached('tube')
        : opa || suction ? reached('insert')
          : cpap || nebuliser ? reached('apply')
            : ventilator ? reached('connect')
              : false;
  const treatmentActive = oxygenInterface ? reached('flow')
    : bvm ? reached('ventilate')
      : intubation ? reached('capnography')
        : opa ? reached('seat')
          : suction ? reached('withdraw')
            : cpap || nebuliser ? reached('start')
              : ventilator ? reached('connect')
                : false;

  const status = treatmentActive
    ? oxygenInterface
      ? treatmentId === 'oxygen_nonrebreather' ? '10–15 L/min · reservoir inflated' : treatmentId === 'oxygen_nasal' ? '2–6 L/min · prongs seated' : '6–10 L/min · mask seated'
      : bvm ? 'Seal held · visible chest rise'
        : intubation ? 'Sustained waveform EtCO₂'
          : opa ? 'Flange seated · airway patent'
            : suction ? 'Suction applied on withdrawal'
              : cpap ? 'Pressure applied · leak checked'
                : nebuliser ? 'Aerosol visibly flowing'
                  : 'Circuit connected · breaths verified'
    : interfaceApplied ? 'Interface positioned'
      : supplyConnected ? 'Supply connected'
        : null;

  return (
    <div data-procedure-preview={treatmentId} className="pointer-events-none absolute inset-0 z-20">
      {supplyConnected && (oxygenInterface || bvm || cpap || nebuliser) && (
        <>
          <img src="/equipment-assets/oxygen-cylinder.webp" alt="" draggable={false} className="absolute bottom-2 -left-4 h-20 w-20 object-contain drop-shadow-lg animate-in fade-in slide-in-from-left-2" />
          <span className="absolute bottom-[66px] left-7 h-0.5 w-[188px] origin-left -rotate-[68deg] rounded-full bg-cyan-200/90 shadow-[0_0_5px_rgba(34,211,238,.75)]" />
        </>
      )}

      {suction && supplyConnected && (
        <img src="/equipment-assets/portable-suction.webp" alt="" draggable={false} className="absolute bottom-2 left-1 h-16 w-16 object-contain drop-shadow-lg animate-in fade-in slide-in-from-left-2" />
      )}

      {interfaceApplied && (
        <div className={`absolute left-1/2 top-[10px] -translate-x-1/2 drop-shadow-[0_4px_8px_rgba(0,0,0,.8)] animate-in fade-in zoom-in-75 ${treatmentActive ? 'motion-safe:animate-pulse' : ''}`}>
          <img
            src={equipmentAsset}
            alt=""
            draggable={false}
            className={`${intubation ? 'h-20 w-10' : opa ? 'h-10 w-12' : suction ? 'h-16 w-10' : ventilator ? 'h-16 w-20' : treatmentId === 'oxygen_nasal' ? 'h-10 w-16' : bvm ? 'h-20 w-20' : 'h-16 w-16'} object-contain`}
          />
        </div>
      )}

      {intubation && interfaceApplied && (
        <span className="absolute left-[88px] top-[58px] h-16 w-0.5 rotate-6 rounded-full bg-cyan-100/90 shadow-[0_0_4px_rgba(34,211,238,.7)]" />
      )}
      {suction && interfaceApplied && (
        <span className="absolute left-[70px] top-[49px] h-0.5 w-[68px] origin-left rotate-[132deg] rounded-full bg-slate-100/90" />
      )}

      {treatmentActive && (bvm || ventilator) && (
        <span aria-label="Visible bilateral chest rise" className="absolute left-1/2 top-[76px] h-[112px] w-[84px] -translate-x-1/2 rounded-[44px] border-2 border-cyan-300/60 shadow-[0_0_16px_rgba(34,211,238,.35)] motion-safe:animate-pulse" />
      )}

      {status && (
        <span className={`absolute bottom-3 left-1/2 w-max max-w-[168px] -translate-x-1/2 rounded-full border px-2 py-1 text-center text-[8px] font-black uppercase tracking-[0.09em] shadow-lg ${treatmentActive ? 'border-emerald-300/50 bg-emerald-950/95 text-emerald-200' : 'border-cyan-300/40 bg-cyan-950/95 text-cyan-100'}`}>
          {status}
        </span>
      )}
    </div>
  );
}

const THERMAL_PREVIEW_TREATMENTS = new Set(['active_cooling', 'warming_blanket']);

function ThermalProcedurePreview({
  treatmentId,
  equipmentAsset,
  completedSteps,
  animatingStep,
}: {
  treatmentId: string;
  equipmentAsset: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  if (!THERMAL_PREVIEW_TREATMENTS.has(treatmentId)) return null;

  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const cooling = treatmentId === 'active_cooling';
  const prepared = reached('prepare');
  const applied = reached('apply');
  const protectedLines = reached('protect');
  const confirmed = reached('confirm');

  return (
    <div data-procedure-preview={treatmentId} className="pointer-events-none absolute inset-0 z-20">
      {prepared && (
        <span className="absolute left-1/2 top-[74px] h-[112px] w-[78px] -translate-x-1/2 rounded-[40px] border border-amber-100/45 bg-[#9a6d55]/45 shadow-[inset_0_0_18px_rgba(255,255,255,.12)]" aria-label="Torso exposed for temperature treatment" />
      )}

      {applied && cooling && (
        <>
          <span className="absolute left-1/2 top-[78px] h-[108px] w-[82px] -translate-x-1/2 rounded-[38px] border border-cyan-200/50 bg-cyan-300/20 shadow-[0_0_22px_rgba(34,211,238,.32)] animate-in fade-in duration-500" aria-label="Cool wet sheet applied over torso" />
          {[
            { left: '48px', top: '89px', rotate: '-18deg' },
            { left: '118px', top: '89px', rotate: '18deg' },
            { left: '69px', top: '176px', rotate: '-8deg' },
            { left: '99px', top: '176px', rotate: '8deg' },
          ].map((position, index) => (
            <img
              key={index}
              src={equipmentAsset}
              alt=""
              draggable={false}
              className="absolute h-8 w-8 rounded-md object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,.7)] animate-in zoom-in-75 duration-300"
              style={{ left: position.left, top: position.top, rotate: position.rotate }}
            />
          ))}
          <span className="absolute left-1/2 top-[210px] -translate-x-1/2 rounded-full border border-cyan-200/50 bg-cyan-950/90 px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-cyan-100">
            Axillae + groins cooled
          </span>
        </>
      )}

      {applied && !cooling && (
        <div className="absolute left-1/2 top-[73px] h-[205px] w-[108px] -translate-x-1/2 overflow-hidden rounded-[38px_38px_22px_22px] border border-amber-200/55 bg-gradient-to-b from-amber-200/90 via-orange-300/85 to-amber-500/80 shadow-[0_8px_24px_rgba(245,158,11,.35)] animate-in fade-in duration-500" aria-label="Warming blanket covering torso and legs">
          <img src={equipmentAsset} alt="" draggable={false} className="h-full w-full object-cover opacity-55 mix-blend-multiply" />
        </div>
      )}

      {protectedLines && (
        <>
          <span className="absolute left-[17px] top-[134px] h-0.5 w-[72px] -rotate-6 rounded-full bg-emerald-200/90 shadow-[0_0_5px_rgba(52,211,153,.7)]" />
          <span className="absolute right-[17px] top-[146px] h-0.5 w-[72px] rotate-6 rounded-full bg-cyan-200/90 shadow-[0_0_5px_rgba(34,211,238,.7)]" />
        </>
      )}

      {confirmed && (
        <span className="absolute bottom-3 left-1/2 w-max max-w-[174px] -translate-x-1/2 rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-center text-[8px] font-black uppercase tracking-[0.08em] text-emerald-200 shadow-lg">
          {cooling ? 'Cooling active · trend core temperature' : 'Insulated · continue temperature checks'}
        </span>
      )}
    </div>
  );
}

const TOURNIQUET_PLACEMENT: Record<string, { left: string; top: string; rotate: string }> = {
  'right-arm': { left: '31%', top: '30%', rotate: '9deg' },
  'left-arm': { left: '69%', top: '30%', rotate: '-9deg' },
  'right-leg': { left: '43%', top: '63%', rotate: '3deg' },
  'left-leg': { left: '57%', top: '63%', rotate: '-3deg' },
};

function TourniquetProcedurePreview({
  treatmentId,
  selectedTarget,
  completedSteps,
  animatingStep,
}: {
  treatmentId: string;
  selectedTarget: ProcedureTarget | null;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  if (!treatmentId.includes('tourniquet') || !selectedTarget) return null;
  const placement = TOURNIQUET_PLACEMENT[selectedTarget.id];
  if (!placement) return null;

  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const strapPositioned = reached('place');
  const slackRemoved = reached('tighten');
  const windlassTurned = reached('windlass');
  const secured = reached('secure');

  if (!strapPositioned) return null;

  return (
    <div
      data-procedure-preview="tourniquet"
      aria-label={`Tourniquet positioned proximal to the wound on ${selectedTarget.label}`}
      className="pointer-events-none absolute z-30 h-12 w-14 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-75 duration-300"
      style={{ left: placement.left, top: placement.top, rotate: placement.rotate }}
    >
      <span className={`absolute left-0 top-5 h-3 w-full rounded-full border border-slate-400 bg-slate-950 shadow-[0_3px_5px_rgba(0,0,0,.8)] ${slackRemoved ? 'scale-x-95' : ''}`} />
      {windlassTurned && (
        <>
          <span className="absolute left-1/2 top-1 h-7 w-1.5 -translate-x-1/2 rotate-[68deg] rounded-full border border-slate-200 bg-slate-500 shadow" />
          <span className="absolute left-[18px] top-[15px] h-3 w-5 rounded border border-slate-300 bg-slate-800" />
        </>
      )}
      {secured && (
        <>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-amber-100 px-1 py-0.5 text-[6px] font-black tracking-wide text-slate-950 shadow">TIME</span>
          <span className="absolute -right-9 top-3 w-max rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-200 shadow-lg">Bleeding stopped</span>
        </>
      )}
    </div>
  );
}

export function HandsOnProcedureDialog({
  open,
  treatment,
  caseData,
  appliedTreatmentIds = [],
  onCancel,
  onComplete,
}: HandsOnProcedureDialogProps) {
  const plan = useMemo(
    () => treatment ? getHandsOnProcedurePlan(treatment.id, caseData, appliedTreatmentIds) : null,
    [appliedTreatmentIds, caseData, treatment],
  );
  const [selectedTarget, setSelectedTarget] = useState<ProcedureTarget | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [animatingStep, setAnimatingStep] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open || !plan) return;
    // A wound must be exposed before its site can be selected. Even when the
    // case has only one authored injury, do not silently choose it for the
    // student—the physical act of locating the source is part of treatment.
    setSelectedTarget(null);
    setCompletedSteps([]);
    setAnimatingStep(null);
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, [open, plan]);

  if (!plan) return null;

  const nextStep = plan.steps.find(step => !completedSteps.includes(step.id));
  const complete = completedSteps.length === plan.steps.length;
  const targetSelectionUnlocked = !plan.requiresTarget
    || plan.steps[0]?.id !== 'expose'
    || completedSteps.includes('expose');
  const canExposeBeforeTarget = plan.requiresTarget
    && completedSteps.length === 0
    && nextStep?.id === 'expose';
  const canStart = !plan.requiresTarget || selectedTarget != null || canExposeBeforeTarget;
  const isDefibrillatorPadProcedure = plan.id === 'defib-pads';
  const isLimbSplintProcedure = ['splinting', 'sam_splint', 'box_splint', 'vacuum_limb_splint', 'air_splint', 'traction_splint'].includes(plan.treatmentId);
  const chestExposed = completedSteps.includes('expose');
  const bothPadsPlaced = completedSteps.includes('apical');
  const padsConnected = completedSteps.includes('connect');
  const limbDevicePositioned = completedSteps.includes('apply')
    || completedSteps.includes('secure')
    || completedSteps.includes('csm-after')
    || animatingStep === 'apply';

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
    if (plan.requiresTarget) setSelectedTarget(null);
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
                <p className="text-xs text-slate-400">{plan.requiresTarget ? 'The selected site is the only site treated.' : 'Equipment appears as each physical step is completed.'}</p>
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

              {isLimbSplintProcedure && selectedTarget && limbDevicePositioned && (
                <div
                  data-procedure-equipment={plan.treatmentId}
                  aria-label={`${plan.title} positioned on ${selectedTarget.label}`}
                  className={`pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-75 duration-300 ${selectedTarget.id.endsWith('leg') ? 'h-[122px] w-[36px]' : 'h-[82px] w-[42px]'}`}
                  style={{
                    left: selectedTarget.id.startsWith('right') ? '42%' : '58%',
                    top: selectedTarget.id.endsWith('leg') ? '73%' : '43%',
                  }}
                >
                  <img
                    src={plan.equipmentAsset}
                    alt=""
                    draggable={false}
                    className="h-full w-full rotate-[4deg] rounded-md object-cover object-center mix-blend-screen drop-shadow-[0_4px_6px_rgba(0,0,0,0.7)]"
                  />
                  {plan.treatmentId === 'traction_splint' && <span className="absolute -bottom-2 left-1/2 h-5 w-8 -translate-x-1/2 rounded-b-full border-x-2 border-b-2 border-slate-300" />}
                </div>
              )}

              <AirwayProcedurePreview
                treatmentId={plan.treatmentId}
                equipmentAsset={plan.equipmentAsset}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <ThermalProcedurePreview
                treatmentId={plan.treatmentId}
                equipmentAsset={plan.equipmentAsset}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <TourniquetProcedurePreview
                treatmentId={plan.treatmentId}
                selectedTarget={selectedTarget}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              {animatingStep && nextStep && (
                <div className={`procedure-hands procedure-motion-${nextStep.motion}`} aria-label={`Performing ${nextStep.label}`}>
                  <Hand className="procedure-hand procedure-hand-left" />
                  <Hand className="procedure-hand procedure-hand-right" />
                </div>
              )}
            </div>

            {plan.requiresTarget && (
              <div className="space-y-2">
                {targetSelectionUnlocked ? (
                  <>
                    <p className="text-xs font-semibold">Choose the exposed treatment site</p>
                    <div className="grid grid-cols-2 gap-2">
                      {plan.targets.map(target => (
                        <button
                          type="button"
                          key={target.id}
                          disabled={completedSteps.length > 1 || !!animatingStep}
                          onClick={() => setSelectedTarget(target)}
                          className={`rounded-xl border p-2 text-left transition ${selectedTarget?.id === target.id ? 'border-red-400 bg-red-500/20 ring-2 ring-red-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                        >
                          <span className="block text-xs font-semibold">{target.label}</span>
                          <span className="line-clamp-2 text-[10px] text-slate-400">{target.detail}</span>
                          {target.priority === 'injury' && <Badge className="mt-1 bg-red-500/20 text-[9px] text-red-200">Visible injury</Badge>}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="rounded-xl border border-sky-400/25 bg-sky-400/10 p-3 text-xs text-sky-100">
                    Expose the patient first. The visible injury site will then become selectable.
                  </p>
                )}
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

            {!canStart && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-300">Select the exact exposed injury site before continuing.</p>}
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
