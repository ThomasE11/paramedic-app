import type { AppliedTreatment, CaseScenario, VitalSigns } from '@/types';
import type { PatientState } from '@/data/dynamicTreatmentEngine';
import {
  deriveAppliedTreatmentRealismCues,
  deriveCaseRealismProfile,
  type PatientRealismCue,
  type RealismSeverity,
} from '@/lib/patientRealism';

export interface RealismDirectorState {
  caseFamily: string;
  severity: RealismSeverity;
  headline: string;
  sceneConstraints: string[];
  visibleCues: PatientRealismCue[];
  reassessmentPrompts: string[];
  treatmentEvidence: string[];
  debriefTargets: string[];
}

export interface RealismDirectorInput {
  caseData: CaseScenario;
  vitals?: VitalSigns | null;
  patientState?: PatientState | null;
  appliedTreatmentIds?: string[];
  appliedTreatments?: AppliedTreatment[];
}

const severityRank: Record<RealismSeverity, number> = {
  normal: 0,
  observe: 1,
  warning: 2,
  critical: 3,
};

const unique = (items: string[]): string[] => Array.from(new Set(items.filter(Boolean)));

function parseSystolic(bp: string | undefined): number | undefined {
  if (!bp) return undefined;
  const match = String(bp).match(/\d{2,3}/);
  return match ? Number(match[0]) : undefined;
}

function highestSeverity(items: RealismSeverity[]): RealismSeverity {
  return items.reduce<RealismSeverity>(
    (highest, item) => (severityRank[item] > severityRank[highest] ? item : highest),
    'normal',
  );
}

function vitalSeverity(vitals: VitalSigns | null | undefined, patientState: PatientState | null | undefined): RealismSeverity {
  if (patientState?.isInArrest || vitals?.pulse === 0) return 'critical';

  const rr = vitals?.respiration;
  const spo2 = vitals?.spo2;
  const gcs = vitals?.gcs;
  const pulse = vitals?.pulse;
  const sbp = parseSystolic(vitals?.bp);

  if (
    (typeof spo2 === 'number' && spo2 < 90)
    || (typeof sbp === 'number' && sbp < 90)
    || (typeof gcs === 'number' && gcs <= 8)
    || (typeof rr === 'number' && (rr < 8 || rr > 32))
    || (typeof pulse === 'number' && pulse > 140)
  ) {
    return 'critical';
  }

  if (
    (typeof spo2 === 'number' && spo2 < 94)
    || (typeof sbp === 'number' && sbp < 100)
    || (typeof gcs === 'number' && gcs < 15)
    || (typeof rr === 'number' && (rr < 10 || rr > 24))
    || (typeof pulse === 'number' && pulse > 110)
  ) {
    return 'warning';
  }

  return 'observe';
}

function deriveSceneConstraints(caseData: CaseScenario): string[] {
  const scene = caseData.sceneInfo;
  return unique([
    scene.environment ? `Environment: ${scene.environment}` : '',
    ...(scene.hazards || []).slice(0, 2).map(hazard => `Hazard: ${hazard}`),
    ...(scene.accessIssues || []).slice(0, 2).map(issue => `Access: ${issue}`),
    scene.extricationNeeded ? 'Extrication: plan movement and packaging before treatment drift' : '',
    scene.bystanders ? `Bystanders: ${scene.bystanders}` : '',
  ]).slice(0, 5);
}

function includesAny(ids: Set<string>, fragments: string[]): boolean {
  return Array.from(ids).some(id => fragments.some(fragment => id.includes(fragment)));
}

function deriveTreatmentEvidence(appliedTreatmentIds: string[], appliedTreatments: AppliedTreatment[] = []): string[] {
  const ids = new Set(appliedTreatmentIds);
  const latest = [...appliedTreatments]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 2)
    .map(treatment => treatment.name || treatment.description || treatment.id)
    .filter(Boolean);

  return unique([
    includesAny(ids, ['oxygen', 'nonrebreather', 'nasal', 'nebulizer', 'cpap', 'bvm', 'ventilat'])
      ? 'Airway equipment should be visible on the face with chest response checked next'
      : '',
    includesAny(ids, ['iv', 'fluids', 'dextrose', 'txa'])
      ? 'Line or medication route should be visible; reassess BP, lungs, mentation, and perfusion'
      : '',
    includesAny(ids, ['bleeding', 'tourniquet', 'dressing', 'wound'])
      ? 'Source control should visibly slow bleeding before perfusion is credited'
      : '',
    includesAny(ids, ['splint', 'collar', 'binder', 'board', 'stretcher'])
      ? 'Immobilisation should match the injured region and reduce movement pain'
      : '',
    includesAny(ids, ['adrenaline', 'naloxone', 'glucose', 'salbutamol', 'ipratropium', 'aspirin', 'gtn'])
      ? 'Drug effect should create a reassessment moment, not an instant solved state'
      : '',
    ...latest.map(name => `Latest: ${name}`),
  ]).slice(0, 5);
}

function deriveReassessmentPrompts(input: RealismDirectorInput): string[] {
  const profile = deriveCaseRealismProfile(input.caseData);
  const ids = new Set(input.appliedTreatmentIds || []);
  const prompts: string[] = [];

  if (includesAny(ids, ['oxygen', 'nonrebreather', 'nasal', 'nebulizer', 'cpap', 'bvm', 'ventilat'])) {
    prompts.push('Recheck RR, SpO2, speech tolerance, air entry, and mask tolerance');
  }
  if (includesAny(ids, ['iv', 'fluids', 'dextrose', 'txa'])) {
    prompts.push('Recheck pulse quality, BP, capillary refill, lungs, and mental status');
  }
  if (includesAny(ids, ['bleeding', 'tourniquet', 'dressing', 'wound'])) {
    prompts.push('Inspect the wound again: bleeding control, distal pulse, pain, and shock trend');
  }
  if (includesAny(ids, ['adrenaline', 'naloxone', 'glucose', 'salbutamol', 'ipratropium', 'gtn', 'aspirin'])) {
    prompts.push('Ask what changed, repeat focused vitals, and watch for adverse response');
  }
  if (input.patientState?.isInArrest) {
    prompts.push('Maintain CPR rhythm: pulse/rhythm checks, EtCO2, reversible causes, and shock timing');
  }

  prompts.push(...profile.assessmentPriorities.slice(0, 3).map(item => `Assess: ${item}`));
  return unique(prompts).slice(0, 5);
}

export function deriveRealismDirectorState(input: RealismDirectorInput): RealismDirectorState {
  const profile = deriveCaseRealismProfile(input.caseData);
  const treatmentCues = deriveAppliedTreatmentRealismCues(input.caseData, input.appliedTreatmentIds || []);
  const visibleCues = [...profile.observableCues, ...treatmentCues].slice(0, 6);
  const severity = highestSeverity([
    vitalSeverity(input.vitals, input.patientState),
    ...visibleCues.map(cue => cue.severity),
  ]);

  return {
    caseFamily: profile.caseFamily,
    severity,
    headline: profile.summary,
    sceneConstraints: deriveSceneConstraints(input.caseData),
    visibleCues,
    reassessmentPrompts: deriveReassessmentPrompts(input),
    treatmentEvidence: deriveTreatmentEvidence(input.appliedTreatmentIds || [], input.appliedTreatments),
    debriefTargets: profile.debriefEndpoints.slice(0, 4),
  };
}
