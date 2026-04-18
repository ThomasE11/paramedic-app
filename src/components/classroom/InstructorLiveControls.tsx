/**
 * InstructorLiveControls — off-case "puppet-master" panel for live teaching.
 *
 * The scenario is pre-scripted, but teaching rarely runs to the script. An
 * instructor needs live levers to steer the case: "let's make the third
 * shock convert, not the second", "drop the SpO2 to 82 to force them to
 * reassess oxygen", "flip to asystole so we can drill non-shockable
 * algorithm". That is what this panel is for.
 *
 * Architecture
 * ------------
 * - Rendered alongside the live StudentPanel on the INSTRUCTOR side only
 *   (ClassroomHost), never on the student side.
 * - Produces an `InstructorOverride` object with a bumping `nonce` every
 *   time the instructor commits a change. StudentPanel watches the nonce
 *   and merges the payload into its local patientState. That in turn
 *   trips the existing broadcast effects, so every student screen
 *   updates in real time — same wire we already use for rhythm / vitals
 *   / arrest-state sync.
 * - Completely dismissible (collapsed-by-default chip in the corner),
 *   because it's an instructor tool and must never distract from the
 *   clinical surface during demonstrations.
 */

import { useState } from 'react';
import {
  Wand2, X, Activity, Heart, HeartPulse, Zap,
  ThermometerSun, Droplet, Brain, AlertOctagon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { toast } from 'sonner';

/** Mirror of the patch StudentPanel will merge into patientState. */
export interface InstructorOverride {
  /** Bump this every commit so the downstream effect knows to re-apply. */
  nonce: number;
  vitals?: {
    bp?: string;
    pulse?: number;
    respiration?: number;
    spo2?: number;
    temperature?: number;
    gcs?: number;
    bloodGlucose?: number;
  };
  /** Override the cardiac rhythm (drives monitor waveform + heart sound). */
  currentRhythm?: string;
  /** Force the arrest flag (true sets pulse=0 + BP 0/0, false restores). */
  isInArrest?: boolean;
  /** Human-readable reason — surfaced in the feed for the session summary. */
  reason?: string;
}

interface Props {
  override: InstructorOverride | null;
  setOverride: (next: InstructorOverride) => void;
  /** Current driver-side values — shown as placeholders so the instructor
   *  can see what they're editing away from. */
  currentVitals?: {
    bp?: string; pulse?: number; respiration?: number;
    spo2?: number; temperature?: number; gcs?: number; bloodGlucose?: number;
  };
  currentRhythm?: string;
}

const RHYTHM_OPTIONS = [
  'Normal Sinus Rhythm',
  'Sinus Tachycardia',
  'Sinus Bradycardia',
  'Atrial Fibrillation',
  'Atrial Flutter',
  'SVT',
  'Ventricular Tachycardia',
  'Ventricular Fibrillation',
  'Asystole',
  'PEA',
  'Complete Heart Block',
  'Mobitz Type II',
  'Anterior STEMI',
  'Inferior STEMI',
];

export function InstructorLiveControls({
  override, setOverride, currentVitals, currentRhythm,
}: Props) {
  const [open, setOpen] = useState(false);
  // Local draft values — committed on "Apply" so typing doesn't immediately
  // mutate the patient (and broadcast) on every keystroke.
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [rr, setRr] = useState('');
  const [spo2, setSpo2] = useState('');
  const [temp, setTemp] = useState('');
  const [gcs, setGcs] = useState('');
  const [bgl, setBgl] = useState('');
  const [rhythm, setRhythm] = useState<string>('');

  const bump = (patch: Omit<InstructorOverride, 'nonce'>) => {
    setOverride({ nonce: (override?.nonce ?? 0) + 1, ...patch });
  };

  const applyVitalsDraft = () => {
    const v: InstructorOverride['vitals'] = {};
    if (bp.trim()) v.bp = bp.trim();
    if (pulse.trim() && !Number.isNaN(Number(pulse))) v.pulse = Number(pulse);
    if (rr.trim() && !Number.isNaN(Number(rr))) v.respiration = Number(rr);
    if (spo2.trim() && !Number.isNaN(Number(spo2))) v.spo2 = Number(spo2);
    if (temp.trim() && !Number.isNaN(Number(temp))) v.temperature = Number(temp);
    if (gcs.trim() && !Number.isNaN(Number(gcs))) v.gcs = Number(gcs);
    if (bgl.trim() && !Number.isNaN(Number(bgl))) v.bloodGlucose = Number(bgl);
    if (Object.keys(v).length === 0) {
      toast.info('Nothing to apply — fill at least one field first.');
      return;
    }
    bump({ vitals: v, reason: 'Instructor vitals override' });
    toast.success('Vitals pushed live', { description: Object.entries(v).map(([k, val]) => `${k}: ${val}`).join(' · ') });
    // Clear drafts after commit
    setBp(''); setPulse(''); setRr(''); setSpo2(''); setTemp(''); setGcs(''); setBgl('');
  };

  const applyRhythm = () => {
    if (!rhythm) return;
    // Arrest rhythms auto-set isInArrest=true; perfusing rhythms false.
    const arrestish = ['Asystole', 'PEA', 'Ventricular Fibrillation'].includes(rhythm);
    bump({
      currentRhythm: rhythm,
      isInArrest: arrestish ? true : false,
      reason: `Instructor rhythm change → ${rhythm}`,
    });
    toast.success(`Rhythm set to ${rhythm}`, {
      description: arrestish ? 'Patient is now in arrest.' : 'Perfusing rhythm restored.',
    });
  };

  const forceRosc = () => {
    bump({
      currentRhythm: 'Sinus Tachycardia',
      isInArrest: false,
      vitals: { pulse: 80, bp: '100/65', spo2: 92 },
      reason: 'Instructor forced ROSC',
    });
    toast.success('ROSC forced', { description: 'Sinus Tachycardia @ 80 bpm, BP 100/65, SpO2 92%.' });
  };

  const forceArrest = (to: string) => {
    bump({
      currentRhythm: to,
      isInArrest: true,
      vitals: { pulse: 0, bp: '0/0', spo2: 60 },
      reason: `Instructor forced ${to}`,
    });
    toast.warning(`Patient crashed to ${to}`);
  };

  if (!open) {
    // Collapsed — floating chip lower-left, out of the way.
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed left-3 bottom-3 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 shadow-xl ring-1 ring-emerald-400/40 text-xs font-semibold"
        aria-label="Open instructor live controls"
      >
        <Wand2 className="w-3.5 h-3.5" />
        Live controls
      </button>
    );
  }

  return (
    <aside className="fixed left-3 bottom-3 z-40 w-80 max-w-[94vw] rounded-xl border border-emerald-500/40 bg-background/96 backdrop-blur shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
      <header className="flex items-center justify-between px-3 py-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold">Instructor live controls</span>
          <Badge variant="outline" className="text-[9px] h-4 border-emerald-500/40 text-emerald-600">INSTR</Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-7 w-7 p-0" aria-label="Collapse">
          <X className="w-3.5 h-3.5" />
        </Button>
      </header>

      <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
        {/* --- Rhythm + arrest quick actions --- */}
        <section>
          <div className="flex items-center gap-1.5 mb-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Rhythm</span>
            {currentRhythm && (
              <Badge variant="secondary" className="text-[9px] h-4 ml-auto">Now: {currentRhythm}</Badge>
            )}
          </div>
          <div className="flex gap-1.5">
            <Select value={rhythm} onValueChange={setRhythm}>
              <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Pick rhythm…" /></SelectTrigger>
              <SelectContent>
                {RHYTHM_OPTIONS.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={applyRhythm} disabled={!rhythm} className="h-8 text-xs px-3 shrink-0">Apply</Button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <Button size="sm" variant="outline" onClick={() => forceArrest('Ventricular Fibrillation')} className="h-7 gap-1.5 text-[11px] text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950">
              <Zap className="w-3 h-3" /> Force VF
            </Button>
            <Button size="sm" variant="outline" onClick={() => forceArrest('Asystole')} className="h-7 gap-1.5 text-[11px] text-slate-600 border-slate-300">
              <AlertOctagon className="w-3 h-3" /> Force Asystole
            </Button>
            <Button size="sm" variant="outline" onClick={() => forceArrest('PEA')} className="h-7 gap-1.5 text-[11px] text-amber-700 border-amber-300">
              <Heart className="w-3 h-3" /> Force PEA
            </Button>
            <Button size="sm" onClick={forceRosc} className="h-7 gap-1.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white">
              <HeartPulse className="w-3 h-3" /> Force ROSC
            </Button>
          </div>
        </section>

        {/* --- Vitals override --- */}
        <section>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Override vitals</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Field icon={<HeartPulse className="w-3 h-3" />} label="HR" placeholder={currentVitals?.pulse?.toString() ?? '—'} value={pulse} onChange={setPulse} />
            <Field icon={<Activity className="w-3 h-3" />} label="BP" placeholder={currentVitals?.bp ?? '120/80'} value={bp} onChange={setBp} />
            <Field icon={<Droplet className="w-3 h-3" />} label="SpO₂" placeholder={currentVitals?.spo2?.toString() ?? '—'} value={spo2} onChange={setSpo2} />
            <Field icon={<Activity className="w-3 h-3" />} label="RR" placeholder={currentVitals?.respiration?.toString() ?? '—'} value={rr} onChange={setRr} />
            <Field icon={<ThermometerSun className="w-3 h-3" />} label="Temp" placeholder={currentVitals?.temperature?.toString() ?? '—'} value={temp} onChange={setTemp} />
            <Field icon={<Brain className="w-3 h-3" />} label="GCS" placeholder={currentVitals?.gcs?.toString() ?? '—'} value={gcs} onChange={setGcs} />
            <Field icon={<Droplet className="w-3 h-3" />} label="BGL" placeholder={currentVitals?.bloodGlucose?.toString() ?? '—'} value={bgl} onChange={setBgl} />
          </div>
          <Button onClick={applyVitalsDraft} className="w-full h-8 text-xs mt-2 gap-1.5">
            <Activity className="w-3 h-3" /> Push vitals live
          </Button>
          <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
            Fill one or more fields and press <strong>Push vitals live</strong>. Students will see the new values on their monitor instantly.
          </p>
        </section>
      </div>
    </aside>
  );
}

// Small labelled input — isolates the repetitive shape.
function Field({
  icon, label, placeholder, value, onChange,
}: {
  icon: React.ReactNode; label: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        {icon}{label}
      </span>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 text-xs tabular-nums"
      />
    </label>
  );
}

export default InstructorLiveControls;
