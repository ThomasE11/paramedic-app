import type { AssessmentStepId } from '@/data/assessmentFramework';
import type { TreatmentLoopState } from '@/lib/patientRealismDirector';

type StepGroup =
  | 'airway'
  | 'respiratory'
  | 'circulation'
  | 'neuro'
  | 'glucose'
  | 'cardiac'
  | 'wound'
  | 'limb'
  | 'spine'
  | 'pelvis'
  | 'temperature';

export interface ClinicalManagementDebriefItem {
  treatmentId: string;
  label: string;
  reassessmentPrompt: string;
  pendingNote: string;
}

export interface ClinicalManagementDebrief {
  totalCount: number;
  pendingCount: number;
  reassessedCount: number;
  pendingItems: ClinicalManagementDebriefItem[];
  reassessedItems: ClinicalManagementDebriefItem[];
  penaltyAmount: number;
  penaltyReasons: { label: string; amount: number }[];
  summary: string;
  coachingPoints: string[];
}

const STEP_GROUPS: Record<StepGroup, AssessmentStepId[]> = {
  airway: ['airway', 'breathing', 'face'],
  respiratory: ['airway', 'breathing', 'chest'],
  circulation: ['circulation', 'chest'],
  neuro: ['disability', 'blood-glucose', 'toxicology-screen'],
  glucose: ['blood-glucose', 'disability', 'airway'],
  cardiac: ['12-lead-ecg', 'pain-assessment', 'circulation', 'chest'],
  wound: ['circulation', 'chest', 'extremities', 'right-arm', 'left-arm', 'right-leg', 'left-leg'],
  limb: ['extremities', 'right-arm', 'left-arm', 'right-leg', 'left-leg', 'circulation'],
  spine: ['neck-cspine', 'disability', 'extremities'],
  pelvis: ['pelvis', 'circulation', 'extremities'],
  temperature: ['temperature', 'exposure', 'circulation'],
};

function includesAny(value: string, fragments: string[]): boolean {
  return fragments.some(fragment => value.includes(fragment));
}

function stepMatches(stepId: AssessmentStepId, group: StepGroup): boolean {
  return STEP_GROUPS[group].includes(stepId);
}

function toDebriefItem(loop: TreatmentLoopState): ClinicalManagementDebriefItem {
  return {
    treatmentId: loop.treatmentId,
    label: loop.categoryLabel,
    reassessmentPrompt: loop.reassessmentPrompt,
    pendingNote: loop.pendingNote,
  };
}

function labelList(items: ClinicalManagementDebriefItem[], maxItems = 4): string {
  const labels = [...new Set(items.map(item => item.label))].slice(0, maxItems);
  const suffix = items.length > maxItems ? ` +${items.length - maxItems} more` : '';
  return `${labels.join(', ')}${suffix}`;
}

/**
 * Turns treatment lifecycle state into end-of-case educator feedback.
 *
 * In real ambulance care, a high-impact intervention is incomplete until the
 * crew checks whether it worked and whether it caused harm. This model keeps
 * the penalty modest but explicit: students can still pass with good care, but
 * they cannot get a polished debrief while leaving oxygen, IVs, splints, GTN,
 * tourniquets, etc. without documented follow-up.
 */
export function deriveClinicalManagementDebrief(
  treatmentLoopStates: TreatmentLoopState[],
): ClinicalManagementDebrief {
  const pendingItems = treatmentLoopStates
    .filter(loop => loop.state === 'applied')
    .map(toDebriefItem);
  const reassessedItems = treatmentLoopStates
    .filter(loop => loop.state === 'reassessed')
    .map(toDebriefItem);
  const pendingCount = pendingItems.length;
  const reassessedCount = reassessedItems.length;
  const penaltyAmount = pendingCount > 0 ? Math.min(pendingCount * 4, 20) : 0;
  const penaltyReasons = penaltyAmount > 0
    ? [{
        label: `Treatment follow-up incomplete: ${labelList(pendingItems)} not reassessed`,
        amount: penaltyAmount,
      }]
    : [];
  const summary = pendingCount > 0
    ? `${pendingCount} high-impact treatment${pendingCount === 1 ? '' : 's'} still need${pendingCount === 1 ? 's' : ''} documented reassessment.`
    : reassessedCount > 0
      ? `All ${reassessedCount} high-impact treatment${reassessedCount === 1 ? '' : 's'} had documented follow-up.`
      : 'No high-impact treatment loop was created in this case.';
  const coachingPoints = pendingItems.length > 0
    ? pendingItems.slice(0, 4).map(item => `${item.label}: ${item.reassessmentPrompt}`)
    : reassessedItems.slice(0, 3).map(item => `${item.label}: follow-up documented`);

  return {
    totalCount: treatmentLoopStates.length,
    pendingCount,
    reassessedCount,
    pendingItems,
    reassessedItems,
    penaltyAmount,
    penaltyReasons,
    summary,
    coachingPoints,
  };
}

/**
 * Connects management to assessment in the simulator.
 *
 * A treatment is not clinically "done" until the student checks the expected
 * response: oxygen needs breathing/SpO2 reassessment, GTN needs pain/BP/ECG,
 * splints need distal neurovascular checks, and so on. This helper returns
 * the applied treatments that can be marked as reassessed by the assessment
 * step the student just performed.
 */
export function deriveTreatmentReassessmentMatches(
  stepId: AssessmentStepId,
  appliedTreatmentIds: string[],
): string[] {
  return appliedTreatmentIds.filter(treatmentId => {
    const id = treatmentId.toLowerCase();

    if (includesAny(id, ['oxygen', 'nonrebreather', 'nasal', 'nebulizer', 'salbutamol', 'ipratropium', 'cpap', 'niv'])) {
      return stepMatches(stepId, 'respiratory');
    }

    if (includesAny(id, ['bvm', 'ventilat', 'intubation', 'ett', 'opa_insert', 'suction'])) {
      return stepMatches(stepId, 'airway') || stepMatches(stepId, 'respiratory');
    }

    if (includesAny(id, ['iv_access', 'iv_cannula', 'io_access', 'fluids_', 'txa'])) {
      return stepMatches(stepId, 'circulation') || stepId === 'chest';
    }

    if (includesAny(id, ['adrenaline_im'])) {
      return stepMatches(stepId, 'respiratory') || stepMatches(stepId, 'circulation');
    }

    if (includesAny(id, ['naloxone'])) {
      return stepMatches(stepId, 'respiratory') || stepMatches(stepId, 'neuro');
    }

    if (includesAny(id, ['glucose', 'dextrose'])) {
      return stepMatches(stepId, 'glucose');
    }

    if (includesAny(id, ['aspirin', 'gtn', 'nitro'])) {
      return stepMatches(stepId, 'cardiac');
    }

    if (includesAny(id, ['chest_seal', 'occlusive_dressing'])) {
      return stepId === 'chest' || stepId === 'breathing';
    }

    if (includesAny(id, ['bleeding_control', 'dressing', 'tourniquet', 'haemostatic', 'hemostatic'])) {
      return stepMatches(stepId, 'wound');
    }

    if (includesAny(id, ['splint'])) {
      return stepMatches(stepId, 'limb');
    }

    if (includesAny(id, ['cervical_collar', 'c-collar', 'collar', 'head_blocks', 'spinal_board', 'scoop_stretcher', 'vacuum_mattress'])) {
      return stepMatches(stepId, 'spine');
    }

    if (includesAny(id, ['pelvic_binder'])) {
      return stepMatches(stepId, 'pelvis');
    }

    if (includesAny(id, ['warming_blanket', 'active_cooling', 'cooling'])) {
      return stepMatches(stepId, 'temperature');
    }

    return false;
  });
}
