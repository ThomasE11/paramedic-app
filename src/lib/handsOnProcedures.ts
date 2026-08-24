import type { CaseScenario } from '@/types';
import { inferInjuries, type BodyInjury, type BodyRegion } from '@/lib/injuryMap';

export type ProcedureMotion =
  | 'prepare'
  | 'expose'
  | 'place'
  | 'press'
  | 'wrap'
  | 'tighten'
  | 'connect'
  | 'ventilate'
  | 'laryngoscopy'
  | 'confirm';

export interface HandsOnProcedureStep {
  id: string;
  label: string;
  instruction: string;
  clinicalCue: string;
  motion: ProcedureMotion;
  durationMs: number;
}

export interface ProcedureTarget {
  id: BodyRegion;
  label: string;
  detail: string;
  priority: 'injury' | 'available';
}

export interface HandsOnProcedurePlan {
  id: string;
  title: string;
  subtitle: string;
  treatmentId: string;
  requiresTarget: boolean;
  targets: ProcedureTarget[];
  steps: HandsOnProcedureStep[];
  equipmentAsset: string;
  completionLabel: string;
}

const BLEEDING_KINDS = new Set<BodyInjury['kind']>(['bleeding', 'wound', 'amputation']);
const LIMB_REGIONS: BodyRegion[] = ['right-arm', 'left-arm', 'right-leg', 'left-leg'];
const GENERAL_WOUND_REGIONS: BodyRegion[] = ['head', 'chest', 'abdomen', 'pelvis', ...LIMB_REGIONS];

const REGION_LABELS: Record<BodyRegion, string> = {
  head: 'Head / scalp',
  face: 'Face',
  neck: 'Neck',
  airway: 'Airway',
  chest: 'Chest',
  abdomen: 'Abdomen',
  pelvis: 'Pelvis',
  'right-arm': 'Right arm',
  'left-arm': 'Left arm',
  'right-leg': 'Right leg',
  'left-leg': 'Left leg',
  back: 'Posterior / back',
};

function injuryTargets(caseData: CaseScenario, limbOnly: boolean): ProcedureTarget[] {
  const injuries = inferInjuries(caseData);
  const allowed = limbOnly ? LIMB_REGIONS : GENERAL_WOUND_REGIONS;
  const candidates = injuries.filter(injury =>
    allowed.includes(injury.region) && BLEEDING_KINDS.has(injury.kind),
  );
  const unique = new Map<BodyRegion, ProcedureTarget>();
  for (const injury of candidates) {
    unique.set(injury.region, {
      id: injury.region,
      label: REGION_LABELS[injury.region],
      detail: injury.detail,
      priority: 'injury',
    });
  }
  if (unique.size) return [...unique.values()];
  return allowed.map(region => ({
    id: region,
    label: REGION_LABELS[region],
    detail: limbOnly ? 'Select the limb with life-threatening haemorrhage.' : 'Select the visible bleeding wound.',
    priority: 'available',
  }));
}

const STEP = (
  id: string,
  label: string,
  instruction: string,
  clinicalCue: string,
  motion: ProcedureMotion,
  durationMs = 850,
): HandsOnProcedureStep => ({ id, label, instruction, clinicalCue, motion, durationMs });

export function getHandsOnProcedurePlan(
  treatmentId: string,
  caseData: CaseScenario,
): HandsOnProcedurePlan | null {
  if (treatmentId === 'aed' || treatmentId === 'monitor_pads') {
    return {
      id: 'defib-pads',
      title: 'Attach defibrillator pads',
      subtitle: 'Expose, prepare and connect the chest before rhythm analysis or shock.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/defib-pads.webp',
      completionLabel: 'Pads connected — analyse rhythm',
      steps: [
        STEP('expose', 'Expose the chest', 'Remove or cut clothing. Preserve dignity while fully clearing pad sites.', 'Chest fully exposed; remove medication patches and metal jewellery.', 'expose'),
        STEP('prepare', 'Prepare the skin', 'Dry moisture and rapidly shave only where hair prevents pad adhesion.', 'The adhesive must make full skin contact.', 'prepare'),
        STEP('sternal', 'Place sternal pad', 'Apply below the right clavicle, lateral to the sternum.', 'Do not place over bone, breast tissue, wounds or implanted devices.', 'place'),
        STEP('apical', 'Place apical pad', 'Apply on the left lateral chest, below the axilla.', 'Pads must be separated and form an anterior-lateral vector through the heart.', 'place'),
        STEP('connect', 'Connect and verify', 'Connect the pad lead to the monitor/AED and confirm a clean rhythm trace.', 'Pads attached. Nobody touches the patient during rhythm analysis.', 'connect'),
      ],
    };
  }

  if (treatmentId === 'bleeding_control') {
    return {
      id: 'bleeding-control',
      title: 'Control external haemorrhage',
      subtitle: 'Treat the wound you can see; source control applies only to the selected site.',
      treatmentId,
      requiresTarget: true,
      targets: injuryTargets(caseData, false),
      equipmentAsset: '/equipment-assets/bandages.webp',
      completionLabel: 'Secure dressing and reassess',
      steps: [
        STEP('expose', 'Expose the wound', 'Cut clothing away and identify the exact bleeding source.', 'Look for spurting, pooling, deep cavities and foreign bodies.', 'expose'),
        STEP('pressure', 'Apply direct pressure', 'Place a sterile dressing directly over the source and press firmly.', 'Maintain uninterrupted pressure; do not repeatedly lift the dressing to look.', 'press', 1100),
        STEP('pack', 'Pack if required', 'For a deep junctional cavity, pack firmly to the source before continuing pressure.', 'Pack the cavity, not just its surface. Do not pack chest or abdominal penetrations.', 'press', 1000),
        STEP('wrap', 'Secure pressure dressing', 'Wrap firmly enough to maintain pressure without losing distal perfusion.', 'Bleeding should stop; check distal colour, warmth, movement, sensation and pulse.', 'wrap', 1200),
        STEP('confirm', 'Reassess haemorrhage', 'Watch the selected site for breakthrough bleeding.', 'If blood soaks through, add pressure or escalate to tourniquet where anatomically appropriate.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'tourniquet') {
    return {
      id: 'tourniquet',
      title: 'Apply windlass tourniquet',
      subtitle: 'A tourniquet is site-specific and appropriate only for life-threatening limb haemorrhage.',
      treatmentId,
      requiresTarget: true,
      targets: injuryTargets(caseData, true),
      equipmentAsset: '/equipment-assets/tourniquet.webp',
      completionLabel: 'Bleeding stopped — record time',
      steps: [
        STEP('expose', 'Expose and locate', 'Identify the limb wound and clear clothing from the application site.', 'Place 5–7 cm proximal to the wound, never over a joint.', 'expose'),
        STEP('place', 'Position the strap', 'Route the strap around the selected limb, proximal to the wound.', 'If the wound cannot be seen in a time-critical situation, place high and tight.', 'place'),
        STEP('tighten', 'Remove all slack', 'Pull the free end firmly before using the windlass.', 'A loose strap makes windlass turns ineffective and increases pain.', 'tighten', 1000),
        STEP('windlass', 'Turn the windlass', 'Twist until bleeding stops and the distal pulse is absent.', 'Stopping because it hurts is not source control.', 'tighten', 1300),
        STEP('secure', 'Secure and document', 'Lock the windlass, expose the device and record application time.', 'Do not cover or periodically loosen the tourniquet in prehospital care.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'oxygen_nonrebreather' || treatmentId === 'oxygen_mask' || treatmentId === 'oxygen_nasal') {
    const nonRebreather = treatmentId === 'oxygen_nonrebreather';
    const nasal = treatmentId === 'oxygen_nasal';
    return {
      id: `oxygen-${treatmentId}`,
      title: nasal ? 'Apply nasal cannula' : nonRebreather ? 'Apply non-rebreather mask' : 'Apply oxygen mask',
      subtitle: 'Oxygen delivery requires a connected supply, selected flow and a fitted interface.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: nasal ? '/equipment-assets/nasal-cannula.webp' : nonRebreather ? '/equipment-assets/nonrebreather-mask.webp' : '/equipment-assets/oxygen-mask.webp',
      completionLabel: 'Oxygen running — reassess SpO₂',
      steps: [
        STEP('connect', 'Connect oxygen tubing', 'Attach tubing to the regulator outlet and open the cylinder.', 'Confirm adequate cylinder pressure and listen for flow.', 'connect'),
        ...(nonRebreather ? [STEP('reservoir', 'Pre-inflate reservoir', 'Set 10–15 L/min and occlude the valve until the reservoir fills.', 'Never place a collapsed reservoir mask on the patient.', 'ventilate', 1100)] : []),
        STEP('apply', nasal ? 'Position the prongs' : 'Seat the mask', nasal ? 'Insert prongs in the nares and route tubing over the ears.' : 'Place over nose and mouth, then position the elastic strap.', 'Check comfort, seal and skin pressure points.', 'place'),
        STEP('flow', 'Set prescribed flow', nasal ? 'Set 2–6 L/min according to target saturation.' : nonRebreather ? 'Maintain 10–15 L/min so the bag stays inflated during inspiration.' : 'Set 6–10 L/min to prevent CO₂ rebreathing.', 'Use the case-specific SpO₂ target; avoid uncontrolled oxygen in known CO₂ retainers.', 'connect'),
        STEP('confirm', 'Confirm response', 'Observe chest movement, work of breathing, SpO₂ trend and patient tolerance.', 'A number improving does not replace reassessment of the patient.', 'confirm'),
      ],
    };
  }

  if (treatmentId === 'intubation' || treatmentId === 'rsi_intubation') {
    const rsi = treatmentId === 'rsi_intubation';
    return {
      id: rsi ? 'rsi-intubation' : 'intubation',
      title: rsi ? 'Rapid sequence intubation' : 'Endotracheal intubation',
      subtitle: 'The airway is not secured until tube position is confirmed with waveform capnography.',
      treatmentId,
      requiresTarget: false,
      targets: [],
      equipmentAsset: '/equipment-assets/et-tube.webp',
      completionLabel: 'Tube secured — ventilate and monitor',
      steps: [
        STEP('prepare', 'Prepare and preoxygenate', 'Check suction, BVM, laryngoscope, tube, stylet, bougie and rescue airway. Preoxygenate.', 'State a failed-airway plan before induction.', 'prepare', 1200),
        ...(rsi ? [STEP('induction', 'Induce and paralyse', 'Administer weight-based induction and neuromuscular blockade with continuous monitoring.', 'Confirm drug, dose, route and onset before laryngoscopy.', 'prepare', 1000)] : []),
        STEP('position', 'Position the airway', 'Optimise head position while maintaining manual in-line stabilisation when indicated.', 'Use external laryngeal manipulation if the view is poor.', 'place'),
        STEP('visualise', 'Perform laryngoscopy', 'Insert from the right, sweep the tongue and identify epiglottis then vocal cords.', 'Do not pass a tube blindly. Abort and oxygenate if saturation falls.', 'laryngoscopy', 1300),
        STEP('tube', 'Pass the tube', 'Advance through the cords, remove stylet, inflate cuff and note depth at the teeth.', 'Watch the cuff pass just beyond the cords.', 'place', 1100),
        STEP('capnography', 'Confirm placement', 'Attach waveform capnography, observe sustained trace, auscultate both axillae and epigastrium.', 'Persistent waveform EtCO₂ is the primary confirmation; misting alone is unreliable.', 'connect', 1200),
        STEP('secure', 'Secure and reassess', 'Secure the tube, record depth and reassess after every movement.', 'Monitor EtCO₂, SpO₂, chest rise and tube depth continuously.', 'confirm'),
      ],
    };
  }

  return null;
}

export const isHandsOnTreatment = (treatmentId: string): boolean =>
  ['aed', 'monitor_pads', 'bleeding_control', 'tourniquet', 'oxygen_nonrebreather', 'oxygen_mask', 'oxygen_nasal', 'intubation', 'rsi_intubation'].includes(treatmentId);

export function procedureSiteToken(treatmentId: string, target: BodyRegion): string {
  return `site:${treatmentId}:${target}`;
}

export function parseProcedureSiteToken(token: string): { treatmentId: string; target: BodyRegion } | null {
  const match = token.match(/^site:([^:]+):(.+)$/);
  if (!match) return null;
  return { treatmentId: match[1], target: match[2] as BodyRegion };
}
