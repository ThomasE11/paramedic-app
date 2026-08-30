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
  'right-chest': { left: '43%', top: '31%' },
  'left-chest': { left: '57%', top: '31%' },
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
  'mechanical_ventilation', 'nebulised_adrenaline',
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
  const nebuliser = treatmentId.startsWith('nebulizer_') || treatmentId === 'nebulised_adrenaline';
  const ventilator = treatmentId === 'ventilator_setup' || treatmentId === 'mechanical_ventilation';

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
        <div className={bvm
          ? `absolute left-[65px] top-[4px] h-[92px] w-[138px] origin-[22%_48%] drop-shadow-[0_4px_8px_rgba(0,0,0,.8)] animate-in fade-in zoom-in-75 ${animatingStep === 'ventilate' ? 'procedure-bvm-deliver' : ''}`
          : `absolute left-1/2 top-[10px] -translate-x-1/2 drop-shadow-[0_4px_8px_rgba(0,0,0,.8)] animate-in fade-in zoom-in-75 ${treatmentActive ? 'motion-safe:animate-pulse' : ''}`}>
          <img
            src={equipmentAsset}
            alt=""
            draggable={false}
            className={`${bvm ? 'h-full w-full' : intubation ? 'h-20 w-10' : opa ? 'h-10 w-12' : suction ? 'h-16 w-10' : ventilator ? 'h-16 w-20' : cpap ? 'h-20 w-24' : treatmentId === 'oxygen_nasal' ? 'h-10 w-16' : 'h-16 w-16'} object-contain`}
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

function AirwayOpeningProcedurePreview({
  procedureId,
  completedSteps,
  animatingStep,
}: {
  procedureId: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  const jawThrust = procedureId === 'airway-jaw-thrust';
  const headTiltChinLift = procedureId === 'airway-head-tilt-chin-lift';
  if (!jawThrust && !headTiltChinLift) return null;
  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const positioned = jawThrust ? reached('align') : reached('position');
  const manoeuvre = reached('manoeuvre');
  const inspected = reached('clear');
  const confirmed = reached('confirm');

  return (
    <div data-procedure-preview={procedureId} className="pointer-events-none absolute inset-0 z-30">
      {positioned && jawThrust && (
        <>
          <span className="absolute left-1/2 top-[10px] h-[63px] w-[66px] -translate-x-1/2 rounded-[34px] border-2 border-sky-300/65 shadow-[0_0_14px_rgba(125,211,252,.45)]" aria-label="Head held in manual in-line stabilisation" />
          <span className="absolute right-1 top-[74px] rounded-full border border-sky-300/40 bg-sky-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-sky-100">Neutral alignment</span>
        </>
      )}
      {positioned && headTiltChinLift && (
        <>
          <Hand className="absolute left-[48px] top-[7px] h-12 w-12 rotate-[62deg] text-amber-100 drop-shadow-lg" aria-label="Hand supporting forehead" />
          <span className="absolute left-[114px] top-[13px] h-10 w-10 rounded-full border-r-2 border-t-2 border-sky-300 after:absolute after:right-0 after:top-0 after:h-2 after:w-2 after:rotate-12 after:border-r-2 after:border-t-2 after:border-sky-200" />
        </>
      )}
      {manoeuvre && jawThrust && (
        <>
          <Hand className="absolute left-[44px] top-[43px] h-12 w-12 -rotate-[16deg] scale-x-[-1] text-amber-100 drop-shadow-lg" />
          <Hand className="absolute right-[44px] top-[43px] h-12 w-12 rotate-[16deg] text-amber-100 drop-shadow-lg" />
          <span className="absolute left-[76px] top-[50px] h-8 w-8 -rotate-12 border-l-2 border-t-2 border-emerald-300" />
          <span className="absolute right-[76px] top-[50px] h-8 w-8 rotate-12 border-r-2 border-t-2 border-emerald-300" />
        </>
      )}
      {manoeuvre && headTiltChinLift && (
        <>
          <Hand className="absolute left-[86px] top-[45px] h-10 w-10 -rotate-[52deg] text-amber-100 drop-shadow-lg" aria-label="Fingers lifting the bony chin" />
          <span className="absolute left-[111px] top-[58px] h-7 w-0.5 bg-emerald-300 after:absolute after:-left-[4px] after:-top-0.5 after:h-2.5 after:w-2.5 after:rotate-45 after:border-l-2 after:border-t-2 after:border-emerald-200" />
        </>
      )}
      {inspected && (
        <span className="absolute left-1/2 top-[48px] h-7 w-10 -translate-x-1/2 rounded-b-[18px] border-2 border-emerald-200/75 bg-slate-950 shadow-[0_0_12px_rgba(52,211,153,.45)]" aria-label="Opened airway inspected for visible contamination" />
      )}
      {confirmed && (
        <>
          <span className="absolute left-1/2 top-[81px] h-[102px] w-[83px] -translate-x-1/2 rounded-[42px] border-2 border-cyan-300/60 shadow-[0_0_16px_rgba(34,211,238,.35)] motion-safe:animate-pulse" aria-label="Air movement and chest movement confirmed" />
          <span className="absolute bottom-3 left-1/2 w-max -translate-x-1/2 rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100 shadow-lg">Air moving · manoeuvre maintained</span>
        </>
      )}
    </div>
  );
}

function FrontOfNeckAirwayProcedurePreview({
  treatmentId,
  completedSteps,
  animatingStep,
}: {
  treatmentId: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  if (treatmentId !== 'surgical_cric') return null;
  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const landmarked = reached('position');
  const incised = reached('incise');
  const bougiePassed = reached('bougie');
  const tubePassed = reached('tube');
  const confirmed = reached('confirm');

  return (
    <div data-procedure-preview="front-of-neck-airway" className="pointer-events-none absolute inset-0 z-30">
      {landmarked && (
        <>
          <span className="absolute left-1/2 top-[61px] h-5 w-8 -translate-x-1/2 rounded-full border-2 border-amber-300/80 shadow-[0_0_14px_rgba(251,191,36,.65)]" aria-label="Cricothyroid membrane identified" />
          <span className="absolute left-[116px] top-[62px] h-px w-11 bg-amber-200" />
          <span className="absolute right-2 top-[53px] rounded-full border border-amber-300/40 bg-amber-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-amber-100">CT membrane</span>
        </>
      )}
      {incised && (
        <span className="absolute left-1/2 top-[68px] h-1 w-8 -translate-x-1/2 rounded-full bg-red-700 shadow-[0_0_5px_rgba(248,113,113,.8)]" aria-label="Cricothyroid membrane opened" />
      )}
      {bougiePassed && !tubePassed && (
        <span className="absolute left-1/2 top-[65px] h-24 w-2 -translate-x-1/2 rounded-full border border-yellow-200 bg-yellow-400 shadow" aria-label="Bougie passed into trachea" />
      )}
      {tubePassed && (
        <div className="absolute left-1/2 top-[61px] h-20 w-14 -translate-x-1/2 animate-in fade-in zoom-in-75">
          <span className="absolute left-1/2 top-0 h-7 w-10 -translate-x-1/2 rounded-lg border-2 border-white bg-slate-100/85 shadow" />
          <span className="absolute left-1/2 top-[8px] h-3 w-5 -translate-x-1/2 rounded-full border-2 border-teal-900 bg-teal-400" />
          <span className="absolute left-1/2 top-[18px] h-12 w-3 -translate-x-1/2 rounded-b-full border-2 border-cyan-100 bg-cyan-100/70" />
          <span className="absolute left-[30px] top-[56px] h-0.5 w-14 origin-left rotate-[24deg] bg-cyan-100" />
        </div>
      )}
      {confirmed && (
        <span className="absolute bottom-3 left-1/2 w-max -translate-x-1/2 rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100 shadow-lg">Sustained waveform EtCO₂ · tube secured</span>
      )}
    </div>
  );
}

function ForeignBodyRemovalProcedurePreview({
  treatmentId,
  completedSteps,
  animatingStep,
}: {
  treatmentId: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  if (treatmentId !== 'magill_forceps') return null;
  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const visualised = reached('visualise');
  const forcepsInserted = reached('insert');
  const removed = reached('remove');
  const confirmed = reached('confirm');

  return (
    <div data-procedure-preview="magill-forceps" className="pointer-events-none absolute inset-0 z-30">
      {visualised && (
        <>
          <span className="absolute left-1/2 top-[48px] h-11 w-12 -translate-x-1/2 rounded-b-[22px] border-2 border-sky-200/65 bg-slate-950 shadow-[0_0_16px_rgba(125,211,252,.35)]" aria-label="Airway visualised with laryngoscope" />
          {!removed && <span className="absolute left-1/2 top-[68px] h-3 w-4 -translate-x-1/2 rounded-full border border-amber-200 bg-amber-700 shadow" aria-label="Visible foreign body" />}
          <span className="absolute left-[66px] top-[46px] h-3 w-16 rotate-[18deg] rounded bg-gradient-to-r from-slate-700 to-slate-200 shadow" />
        </>
      )}
      {forcepsInserted && !removed && (
        <div className="absolute left-[92px] top-[59px] h-16 w-20 -rotate-6">
          <span className="absolute left-0 top-5 h-1.5 w-20 origin-left rotate-6 rounded bg-gradient-to-r from-slate-500 to-slate-100" />
          <span className="absolute left-0 top-8 h-1.5 w-20 origin-left -rotate-6 rounded bg-gradient-to-r from-slate-500 to-slate-100" />
          <span className="absolute right-0 top-[24px] h-5 w-3 rounded-r-full border-r-2 border-slate-100" />
        </div>
      )}
      {removed && (
        <>
          <span className="absolute left-[49px] top-[50px] h-3 w-4 rounded-full border border-amber-200 bg-amber-700 shadow" aria-label="Foreign body withdrawn" />
          <span className="absolute left-[66px] top-[58px] h-0.5 w-20 rotate-[-12deg] bg-emerald-300" />
          <span className="absolute left-[58px] top-[43px] rounded-full border border-emerald-300/45 bg-emerald-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100">Object removed</span>
        </>
      )}
      {confirmed && (
        <span className="absolute bottom-3 left-1/2 w-max -translate-x-1/2 rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100 shadow-lg">Air entry + SpO₂ + EtCO₂ reassessed</span>
      )}
    </div>
  );
}

function GastricTubeProcedurePreview({
  treatmentId,
  completedSteps,
  animatingStep,
}: {
  treatmentId: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  if (treatmentId !== 'orogastric_tube') return null;
  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const measured = reached('measure');
  const inserted = reached('insert');
  const secured = reached('secure');
  const confirmed = reached('confirm');
  const decompressing = reached('decompress');

  return (
    <div data-procedure-preview="orogastric-tube" className="pointer-events-none absolute inset-0 z-30">
      {measured && !inserted && (
        <>
          <span className="absolute left-[97px] top-[48px] h-[152px] w-px border-l border-dashed border-amber-200" />
          <span className="absolute right-1 top-[115px] rounded-full border border-amber-300/40 bg-amber-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-amber-100">Mouth → ear → xiphisternum</span>
        </>
      )}
      {inserted && (
        <span className="absolute left-[94px] top-[51px] h-[144px] w-2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-500 via-amber-100 to-amber-600 shadow" aria-label="Orogastric tube advanced to measured mark" />
      )}
      {secured && (
        <span className="absolute left-[82px] top-[46px] h-7 w-8 -rotate-6 rounded-md border-2 border-white/85 bg-white/55 shadow backdrop-blur-[1px]" aria-label="Tube secured and external length recorded" />
      )}
      {confirmed && (
        <span className="absolute right-2 top-[91px] rounded-lg border border-emerald-300/50 bg-emerald-950/95 px-2 py-1.5 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100 shadow-lg">Aspirate pH ≤ 5.5</span>
      )}
      {decompressing && (
        <>
          <span className="absolute left-[98px] top-[188px] h-0.5 w-12 rotate-[24deg] bg-amber-300" />
          <span className="absolute bottom-8 right-[29px] h-12 w-14 rounded-lg border-2 border-cyan-200/70 bg-cyan-100/25 shadow-inner" aria-label="Gastric drainage connected" />
          <span className="absolute bottom-3 left-1/2 w-max -translate-x-1/2 rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100 shadow-lg">Confirmed · drainage active</span>
        </>
      )}
    </div>
  );
}

function TubeConfirmationProcedurePreview({
  treatmentId,
  completedSteps,
  animatingStep,
}: {
  treatmentId: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  if (treatmentId !== 'ett_confirmation') return null;
  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const depthChecked = reached('depth');
  const capnographyAttached = reached('capnography');
  const chestChecked = reached('chest');
  const auscultated = reached('auscultate');
  const secured = reached('secure');
  const trending = reached('trend');

  return (
    <div data-procedure-preview="ett-confirmation" className="pointer-events-none absolute inset-0 z-30">
      {depthChecked && (
        <>
          <img src="/equipment-assets/et-tube.webp" alt="" draggable={false} className="absolute left-1/2 top-[33px] h-[79px] w-10 -translate-x-1/2 object-contain drop-shadow-lg animate-in fade-in zoom-in-75" />
          <span className="absolute left-[105px] top-[49px] rounded border border-amber-200/60 bg-amber-950/95 px-1.5 py-0.5 text-[7px] font-black uppercase text-amber-100 shadow" aria-label="Tube depth read at the lips">Depth recorded</span>
        </>
      )}
      {capnographyAttached && (
        <div className="absolute right-1 top-[80px] h-[46px] w-[82px] overflow-hidden rounded-lg border border-emerald-300/55 bg-slate-950/95 p-1 shadow-lg" aria-label="Sustained waveform capnography present">
          <svg viewBox="0 0 80 30" role="img" aria-label="Repeated square capnography waveform" className="h-full w-full">
            <path d="M0 25 L8 25 L10 22 L13 8 L28 8 L31 12 L33 25 L41 25 L44 21 L47 8 L63 8 L66 12 L68 25 L80 25" fill="none" stroke="#34d399" strokeWidth="2.2" strokeLinejoin="round" />
          </svg>
          <span className="absolute right-1 top-0.5 text-[6px] font-black text-emerald-200">EtCO₂</span>
        </div>
      )}
      {chestChecked && (
        <>
          <span className="absolute left-[56px] top-[83px] h-[94px] w-[38px] rounded-[28px] border-2 border-cyan-300/65 shadow-[0_0_16px_rgba(34,211,238,.35)] motion-safe:animate-pulse" />
          <span className="absolute right-[56px] top-[83px] h-[94px] w-[38px] rounded-[28px] border-2 border-cyan-300/65 shadow-[0_0_16px_rgba(34,211,238,.35)] motion-safe:animate-pulse" />
        </>
      )}
      {auscultated && (
        <div aria-label="Five-point auscultation completed">
          {[
            ['72px', '103px'], ['112px', '103px'], ['70px', '139px'], ['114px', '139px'], ['93px', '174px'],
          ].map(([left, top], index) => (
            <span key={index} className={`absolute h-3 w-3 rounded-full border-2 ${index === 4 ? 'border-amber-100 bg-amber-500' : 'border-emerald-100 bg-emerald-500'} shadow-[0_0_7px_rgba(52,211,153,.7)]`} style={{ left, top }} />
          ))}
        </div>
      )}
      {secured && (
        <span className="absolute left-[81px] top-[46px] h-7 w-9 -rotate-6 rounded-md border-2 border-white/90 bg-white/60 shadow" aria-label="Endotracheal tube secured at recorded depth" />
      )}
      {trending && (
        <span className="absolute bottom-3 left-1/2 w-max max-w-[178px] -translate-x-1/2 rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-center text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100 shadow-lg">Depth recorded · bilateral rise · sustained EtCO₂</span>
      )}
    </div>
  );
}

function PericardiocentesisProcedurePreview({
  procedureId,
  completedSteps,
  animatingStep,
}: {
  procedureId: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  if (procedureId !== 'ultrasound-guided-pericardiocentesis') return null;
  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const confirmedTamponade = reached('confirm');
  const prepared = reached('prepare');
  const windowSelected = reached('window');
  const sterile = reached('sterile');
  const needlePlaced = reached('needle');
  const spaceConfirmed = reached('confirm-space');
  const catheterPlaced = reached('catheter');
  const draining = reached('drain');
  const secured = reached('secure');

  return (
    <div data-procedure-preview="pericardiocentesis" className="pointer-events-none absolute inset-0 z-30">
      {confirmedTamponade && (
        <div className="absolute right-1 top-[13px] h-[61px] w-[84px] overflow-hidden rounded-lg border border-sky-300/60 bg-slate-950/95 p-1 shadow-lg" aria-label="Focused cardiac ultrasound confirms pericardial fluid and tamponade physiology">
          <svg viewBox="0 0 80 52" role="img" aria-label="Cardiac ultrasound with pericardial fluid" className="h-full w-full">
            <path d="M8 4L39 48 72 4Z" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
            <ellipse cx="41" cy="31" rx="16" ry="10" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M21 31c9-19 32-20 42 0-8-9-15-13-22-13s-14 4-20 13Z" fill="#0ea5e9" fillOpacity=".72" />
          </svg>
          <span className="absolute bottom-0.5 right-1 text-[6px] font-black uppercase text-sky-100">Effusion + collapse</span>
        </div>
      )}
      {prepared && (
        <span className="absolute left-1/2 top-[74px] h-[113px] w-[91px] -translate-x-1/2 rounded-[35px] border-2 border-sky-200/55 bg-sky-100/10 shadow-inner" aria-label="Chest exposed with continuous monitoring attached" />
      )}
      {sterile && (
        <span className="absolute left-1/2 top-[82px] h-[99px] w-[82px] -translate-x-1/2 rounded-2xl border-4 border-cyan-100/80 bg-cyan-200/12 shadow-[0_0_15px_rgba(165,243,252,.28)]" aria-label="Sterile drape and ultrasound probe cover applied" />
      )}
      {windowSelected && (
        <>
          <span className="absolute left-[112px] top-[129px] h-9 w-5 -rotate-[38deg] rounded-b-xl rounded-t-md border-2 border-slate-400 bg-slate-100 shadow" aria-label="Sterile cardiac ultrasound probe over selected drainage window" />
          <span className="absolute left-[92px] top-[137px] h-6 w-6 rounded-full border-2 border-amber-200 shadow-[0_0_14px_rgba(251,191,36,.7)]" />
        </>
      )}
      {needlePlaced && !catheterPlaced && (
        <span className="absolute left-[59px] top-[154px] h-1 w-[62px] origin-left -rotate-[18deg] rounded-full bg-gradient-to-r from-slate-500 via-white to-cyan-300 shadow" aria-label="Needle advanced along the continuously imaged trajectory" />
      )}
      {spaceConfirmed && !catheterPlaced && (
        <span className="absolute left-[42px] top-[144px] rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-[6px] font-black uppercase tracking-[0.07em] text-emerald-100">Tip in pericardial space</span>
      )}
      {catheterPlaced && (
        <>
          <span className="absolute left-[72px] top-[148px] h-1.5 w-[51px] origin-left -rotate-[15deg] rounded-full bg-cyan-200 shadow" />
          <span className="absolute left-[116px] top-[132px] h-6 w-6 rounded-full border-4 border-cyan-200 border-l-transparent" aria-label="Pigtail catheter positioned in pericardial space" />
          <span className="absolute left-[41px] top-[133px] h-1 w-[51px] -rotate-[16deg] rounded-full bg-amber-300" aria-label="Guidewire remains controlled during catheter placement" />
        </>
      )}
      {draining && (
        <>
          <span className="absolute left-[38px] top-[142px] h-1 w-[66px] -rotate-[17deg] rounded-full bg-rose-300" />
          <span className="absolute left-[9px] top-[117px] h-14 w-12 rounded-lg border-2 border-rose-200/70 bg-rose-950/75 shadow-inner" aria-label="Measured pericardial aspirate collected" />
          <span className="absolute left-[13px] top-[129px] h-6 w-10 rounded bg-rose-600/55" />
        </>
      )}
      {secured && (
        <>
          <span className="absolute left-[84px] top-[133px] h-10 w-10 rotate-6 rounded-lg border-2 border-white/90 bg-white/60 shadow" aria-label="Pericardial drain secured with a closed drainage system" />
          <span className="absolute bottom-3 left-1/2 w-max max-w-[178px] -translate-x-1/2 rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-center text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100 shadow-lg">Drain secured · BP + ECG + POCUS trending</span>
        </>
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

function TemperatureControlProcedurePreview({
  procedureId,
  completedSteps,
  animatingStep,
}: {
  procedureId: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  if (procedureId !== 'post-rosc-fever-prevention') return null;
  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const measured = reached('measure');
  const targetSet = reached('target');
  const padsApplied = reached('apply');
  const connected = reached('connect');
  const shiveringChecked = reached('shivering');
  const trending = reached('trend');

  return (
    <div data-procedure-preview="post-rosc-temperature-control" className="pointer-events-none absolute inset-0 z-30">
      {measured && (
        <>
          <span className="absolute left-[92px] top-[172px] h-[73px] w-1.5 rounded-full bg-amber-300 shadow" aria-label="Continuous core-temperature probe connected" />
          <span className="absolute left-[95px] top-[239px] h-0.5 w-[70px] rotate-[18deg] bg-amber-200" />
        </>
      )}
      {targetSet && (
        <div className="absolute right-1 top-[15px] h-[49px] w-[77px] rounded-lg border border-cyan-300/60 bg-slate-950/95 p-1 text-center shadow-lg" aria-label="Feedback controller target set to 37.5 degrees Celsius">
          <span className="block text-[6px] font-black uppercase tracking-[0.08em] text-cyan-200">Core target</span>
          <strong className="mt-0.5 block text-[15px] leading-none text-white">37.5°C</strong>
        </div>
      )}
      {padsApplied && (
        <>
          <span className="absolute left-1/2 top-[79px] h-[96px] w-[82px] -translate-x-1/2 rounded-[30px] border-2 border-cyan-100/80 bg-gradient-to-br from-cyan-100/70 via-sky-400/55 to-cyan-700/70 shadow-[0_0_15px_rgba(34,211,238,.28)]" aria-label="Water-circulating torso temperature pad applied" />
          <span className="absolute left-[62px] top-[184px] h-[91px] w-[29px] rotate-3 rounded-2xl border-2 border-cyan-100/75 bg-sky-400/60" />
          <span className="absolute right-[62px] top-[184px] h-[91px] w-[29px] -rotate-3 rounded-2xl border-2 border-cyan-100/75 bg-sky-400/60" />
        </>
      )}
      {connected && (
        <>
          <span className="absolute left-[55px] top-[143px] h-1.5 w-[55px] origin-right -rotate-[22deg] rounded-full bg-cyan-200" />
          <span className="absolute right-[55px] top-[143px] h-1.5 w-[55px] origin-left rotate-[22deg] rounded-full bg-sky-400" />
          <div className="absolute bottom-3 left-1 h-[55px] w-[48px] rounded-lg border-2 border-slate-400 bg-slate-950 p-1 shadow-lg">
            <span className="block h-5 rounded border border-cyan-300/50 bg-cyan-950 text-center text-[7px] font-black leading-5 text-cyan-100">37.5</span>
            <span className="mx-auto mt-2 block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.8)]" />
          </div>
        </>
      )}
      {shiveringChecked && (
        <span className="absolute bottom-[42px] left-1/2 w-max -translate-x-1/2 rounded-full border border-amber-300/45 bg-amber-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-amber-100">Shivering + skin + rhythm checked</span>
      )}
      {trending && (
        <span className="absolute bottom-3 left-1/2 w-max max-w-[178px] -translate-x-1/2 rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-center text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100 shadow-lg">Feedback active · fever prevention ≤37.5°C</span>
      )}
    </div>
  );
}

function PostRoscProcedurePreview({
  procedureId,
  completedSteps,
  animatingStep,
}: {
  procedureId: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  if (procedureId !== 'structured-post-rosc-care') return null;
  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const statusClass = 'rounded-md border border-emerald-300/50 bg-emerald-950/95 px-1.5 py-1 text-[6px] font-black uppercase tracking-[0.06em] text-emerald-100 shadow-lg animate-in fade-in zoom-in-90';

  return (
    <div data-procedure-preview="post-rosc-care" className="pointer-events-none absolute inset-0 z-30">
      {reached('rosc') && <span className="absolute left-1/2 top-2 w-max -translate-x-1/2 rounded-full border border-emerald-300/60 bg-emerald-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.09em] text-emerald-100 shadow-lg">Pulse + rhythm + EtCO₂ · ROSC</span>}
      {reached('airway') && (
        <>
          <span className="absolute left-[85px] top-[44px] h-9 w-5 rounded-b-xl border-2 border-cyan-100/80 bg-cyan-100/45" />
          <span className={`absolute left-1 top-[52px] ${statusClass}`}>Airway confirmed</span>
        </>
      )}
      {reached('oxygen') && <span className={`absolute right-1 top-[82px] ${statusClass}`}>SpO₂ 94–98%</span>}
      {reached('ventilation') && (
        <div className="absolute left-1 top-[91px] h-[37px] w-[71px] rounded-md border border-emerald-300/50 bg-slate-950/95 p-1 shadow-lg" aria-label="Waveform capnography target 35 to 45 millimetres of mercury">
          <svg viewBox="0 0 70 22" className="h-5 w-full"><path d="M0 19h8l3-12h17l3 12h8l3-12h17l3 12h8" fill="none" stroke="#34d399" strokeWidth="2" /></svg>
          <span className="absolute right-1 top-0 text-[5px] font-black text-emerald-100">35–45</span>
        </div>
      )}
      {reached('circulation') && <span className={`absolute right-1 top-[127px] ${statusClass}`}>SBP &gt;100 · access</span>}
      {reached('ecg') && (
        <div className="absolute left-1 top-[139px] h-[39px] w-[74px] rounded-md border border-rose-300/50 bg-slate-950/95 p-1 shadow-lg" aria-label="Diagnostic twelve lead ECG acquired">
          <svg viewBox="0 0 70 22" className="h-5 w-full"><path d="M0 15h12l4-7 6 14 7-11 5 4h36" fill="none" stroke="#fb7185" strokeWidth="2" /></svg>
          <span className="absolute bottom-0.5 right-1 text-[5px] font-black text-rose-100">12-LEAD</span>
        </div>
      )}
      {reached('disability') && <span className={`absolute right-1 top-[181px] ${statusClass}`}>GCS · pupils · BGL</span>}
      {reached('temperature') && <span className={`absolute left-1 top-[206px] ${statusClass}`}>Core temp ≤37.5°C</span>}
      {reached('transfer') && <span className="absolute bottom-3 left-1/2 w-max max-w-[179px] -translate-x-1/2 rounded-full border border-sky-300/55 bg-sky-950/95 px-2 py-1 text-center text-[7px] font-black uppercase tracking-[0.08em] text-sky-100 shadow-lg">Lines secured · arrest centre pre-alerted</span>}
    </div>
  );
}

const TOURNIQUET_PLACEMENT: Record<string, { left: string; top: string; rotate: string }> = {
  'right-arm': { left: '31%', top: '30%', rotate: '9deg' },
  'left-arm': { left: '69%', top: '30%', rotate: '-9deg' },
  'right-leg': { left: '43%', top: '63%', rotate: '3deg' },
  'left-leg': { left: '57%', top: '63%', rotate: '-3deg' },
};

function ThoracicProcedurePreview({
  treatmentId,
  selectedTarget,
  equipmentAsset,
  completedSteps,
  animatingStep,
}: {
  treatmentId: string;
  selectedTarget: ProcedureTarget | null;
  equipmentAsset: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  const seal = ['chest_seal_vented', 'vented_chest_seal', 'occlusive_dressing_3sided'].includes(treatmentId);
  const needle = treatmentId === 'needle_decompression';
  if ((!seal && !needle) || !selectedTarget?.id.endsWith('-chest')) return null;
  const reached = (...stepIds: string[]) => stepIds.some(id => completedSteps.includes(id) || animatingStep === id);
  const applied = seal ? reached('apply', 'confirm') : reached('insert', 'secure', 'reassess');
  if (!applied) return null;
  const patientRight = selectedTarget.id === 'right-chest';

  return (
    <div
      data-procedure-preview={needle ? 'needle-decompression' : 'chest-seal'}
      className={`pointer-events-none absolute top-[81px] z-20 -translate-x-1/2 animate-in fade-in zoom-in-75 ${patientRight ? 'left-[43%]' : 'left-[57%]'}`}
      aria-label={`${needle ? 'Decompression catheter' : 'Chest seal'} applied to ${selectedTarget.label}`}
    >
      <img
        src={equipmentAsset}
        alt=""
        draggable={false}
        className={`${needle ? 'h-14 w-7 rotate-12' : 'h-12 w-12 rotate-3 rounded-lg'} object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,.75)]`}
      />
      <span className="absolute left-1/2 top-full mt-1 w-max -translate-x-1/2 rounded-full border border-emerald-300/45 bg-emerald-950/95 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100">
        {selectedTarget.label}
      </span>
    </div>
  );
}

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

function PelvicBinderProcedurePreview({
  treatmentId,
  completedSteps,
  animatingStep,
}: {
  treatmentId: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  if (treatmentId !== 'pelvic_binder') return null;
  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const prepared = reached('prepare');
  const positioned = reached('position');
  const tensioned = reached('close');
  const reassessed = reached('reassess');

  return (
    <div data-procedure-preview="pelvic-binder" className="pointer-events-none absolute inset-0 z-20">
      {prepared && !positioned && (
        <>
          <span className="absolute left-[20px] top-[159px] h-px w-[150px] border-t border-dashed border-amber-200/80" />
          <span className="absolute left-1/2 top-[145px] -translate-x-1/2 rounded-full border border-amber-300/40 bg-amber-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-amber-100">Greater trochanter level</span>
        </>
      )}
      {positioned && (
        <div
          className="absolute left-1/2 top-[151px] h-[34px] w-[106px] -translate-x-1/2 animate-in fade-in zoom-in-75 duration-500"
          aria-label="Pelvic binder positioned level over both greater trochanters"
        >
          <span className="absolute inset-x-0 top-1 h-7 rounded-lg border-2 border-slate-400 bg-gradient-to-b from-slate-50 via-slate-200 to-slate-400 shadow-[0_4px_8px_rgba(0,0,0,.7)]" />
          <span className="absolute inset-x-0 top-1 h-1.5 rounded-t-lg bg-slate-700" />
          <span className="absolute inset-x-0 bottom-0.5 h-1.5 rounded-b-lg bg-slate-700" />
          <span className="absolute left-1/2 top-0 h-9 w-8 -translate-x-1/2 rounded-md border-2 border-slate-800 bg-slate-600 shadow" />
          <span className="absolute left-1/2 top-2 h-5 w-4 -translate-x-1/2 rounded-sm border border-slate-300 bg-slate-950" />
          {tensioned && (
            <>
              <span className="absolute left-[62px] top-[12px] h-2.5 w-48 origin-left scale-x-[0.27] rounded-r bg-gradient-to-r from-red-800 to-red-500 shadow" />
              <span className="absolute right-[-6px] top-[9px] h-4 w-4 rotate-45 rounded-sm border border-red-950 bg-red-600" />
            </>
          )}
        </div>
      )}
      {tensioned && !reassessed && (
        <span className="absolute left-1/2 top-[192px] w-max -translate-x-1/2 rounded-full border border-red-300/40 bg-red-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-red-100">Closed · do not loosen</span>
      )}
      {reassessed && (
        <span className="absolute bottom-3 left-1/2 w-max -translate-x-1/2 rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100 shadow-lg">Distal CSM + perfusion reassessed</span>
      )}
    </div>
  );
}

function ChokingProcedurePreview({
  treatmentId,
  completedSteps,
  animatingStep,
}: {
  treatmentId: string;
  completedSteps: string[];
  animatingStep: string | null;
}) {
  const backBlows = treatmentId === 'back_blows';
  const abdominalThrusts = treatmentId === 'abdominal_thrusts';
  if (!backBlows && !abdominalThrusts) return null;
  const reached = (stepId: string) => completedSteps.includes(stepId) || animatingStep === stepId;
  const positioned = reached('position');
  const firstBlows = reached('blow-1-2');
  const allBackBlows = reached('blow-3-5');
  const handsPlaced = reached('hands');
  const thrustsDelivered = reached('thrusts');
  const reassessed = reached('reassess');
  const completedAttempts = backBlows ? (allBackBlows ? 5 : firstBlows ? 2 : 0) : thrustsDelivered ? 5 : 0;

  return (
    <div data-procedure-preview={backBlows ? 'back-blows' : 'abdominal-thrusts'} className="pointer-events-none absolute inset-0 z-20">
      {positioned && backBlows && (
        <>
          <span className="absolute left-[54px] top-[78px] h-[104px] w-[82px] origin-bottom -rotate-6 rounded-[44px] border-2 border-sky-300/40" />
          <span className="absolute left-1/2 top-[190px] w-max -translate-x-1/2 rounded-full border border-sky-300/40 bg-sky-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-sky-100">Supported · leaned forward</span>
        </>
      )}
      {(firstBlows || allBackBlows) && backBlows && (
        <>
          <Hand className="absolute left-[18px] top-[102px] h-14 w-14 rotate-[82deg] text-amber-200 drop-shadow-[0_3px_6px_rgba(0,0,0,.8)]" />
          <span className="absolute left-[82px] top-[111px] h-12 w-12 rounded-full border-2 border-red-300/65 shadow-[0_0_18px_rgba(248,113,113,.65)]" />
        </>
      )}
      {positioned && abdominalThrusts && (
        <>
          <span className="absolute left-[22px] top-[124px] h-3 w-[58px] rotate-6 rounded-full bg-slate-300/80 shadow" />
          <span className="absolute right-[22px] top-[124px] h-3 w-[58px] -rotate-6 rounded-full bg-slate-300/80 shadow" />
          <span className="absolute left-1/2 top-[188px] w-max -translate-x-1/2 rounded-full border border-sky-300/40 bg-sky-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-sky-100">Rescuer behind · patient forward</span>
        </>
      )}
      {handsPlaced && abdominalThrusts && (
        <>
          <span className="absolute left-1/2 top-[132px] h-8 w-8 -translate-x-1/2 rounded-full border-4 border-amber-100 bg-amber-700 shadow-[0_4px_10px_rgba(0,0,0,.75)]" aria-label="Fist placed between umbilicus and lower sternum" />
          <span className="absolute left-1/2 top-[104px] h-8 w-0.5 -translate-x-1/2 bg-red-400 after:absolute after:-left-[4px] after:-top-0.5 after:h-2.5 after:w-2.5 after:rotate-45 after:border-l-2 after:border-t-2 after:border-red-300" />
        </>
      )}
      {completedAttempts > 0 && (
        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-1" aria-label={`${completedAttempts} of 5 attempts delivered`}>
          {[1, 2, 3, 4, 5].map(attempt => (
            <span key={attempt} className={`flex h-5 w-5 items-center justify-center rounded-full border text-[8px] font-black ${attempt <= completedAttempts ? 'border-red-300 bg-red-600 text-white' : 'border-slate-500 bg-slate-900 text-slate-500'}`}>{attempt}</span>
          ))}
        </div>
      )}
      {reassessed && (
        <span className="absolute bottom-3 left-1/2 w-max -translate-x-1/2 rounded-full border border-emerald-300/50 bg-emerald-950/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-emerald-100 shadow-lg">Airway + consciousness reassessed</span>
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

              <AirwayOpeningProcedurePreview
                procedureId={plan.id}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <FrontOfNeckAirwayProcedurePreview
                treatmentId={plan.treatmentId}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <ForeignBodyRemovalProcedurePreview
                treatmentId={plan.treatmentId}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <GastricTubeProcedurePreview
                treatmentId={plan.treatmentId}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <TubeConfirmationProcedurePreview
                treatmentId={plan.treatmentId}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <PericardiocentesisProcedurePreview
                procedureId={plan.id}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <ThermalProcedurePreview
                treatmentId={plan.treatmentId}
                equipmentAsset={plan.equipmentAsset}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <TemperatureControlProcedurePreview
                procedureId={plan.id}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <PostRoscProcedurePreview
                procedureId={plan.id}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <TourniquetProcedurePreview
                treatmentId={plan.treatmentId}
                selectedTarget={selectedTarget}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <PelvicBinderProcedurePreview
                treatmentId={plan.treatmentId}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <ChokingProcedurePreview
                treatmentId={plan.treatmentId}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              <ThoracicProcedurePreview
                treatmentId={plan.treatmentId}
                selectedTarget={selectedTarget}
                equipmentAsset={plan.equipmentAsset}
                completedSteps={completedSteps}
                animatingStep={animatingStep}
              />

              {animatingStep && nextStep && plan.treatmentId !== 'bvm_ventilation' && (
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
