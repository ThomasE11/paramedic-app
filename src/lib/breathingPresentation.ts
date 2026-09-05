import type { CaseScenario, VitalSigns } from '@/types';

/** Oxygenation alone cannot be used as evidence that ventilatory effort has
 * resolved. Keep the distressed presentation until both live signals agree. */
export function breathingEffortImproved(initial?: Partial<VitalSigns>, live?: Partial<VitalSigns> | null): boolean {
  return !!initial && !!live
    && ((initial.respiration ?? 16) > 24 || (initial.spo2 ?? 98) < 94)
    && typeof live.respiration === 'number' && live.respiration >= 10 && live.respiration <= 24
    && typeof live.spo2 === 'number' && live.spo2 >= 94;
}

export function liveBreathingDepth(authoredDepth: string, initial?: Partial<VitalSigns>, live?: Partial<VitalSigns> | null): number {
  if (breathingEffortImproved(initial, live)) return 1;
  if (/shallow|reduced|poor|agonal|gasp|minimal/i.test(authoredDepth)) return 0.45;
  if (/deep|laboured|labored|kussmaul|increased|heav/i.test(authoredDepth)) return 1.2;
  return 1;
}

export function getBreathingPattern(caseData: CaseScenario, liveVitals?: Partial<VitalSigns> | null) {
  const hasLiveRate = typeof liveVitals?.respiration === 'number';
  const rr = liveVitals?.respiration ?? caseData.vitalSignsProgression?.initial?.respiration ?? 16;
  const text = [
    caseData.title,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.generalImpression,
    ...(caseData.initialPresentation?.sounds || []),
    ...(caseData.abcde?.breathing?.findings || []),
    ...(caseData.secondarySurvey?.chest || []),
  ].filter(Boolean).join(' ').toLowerCase();

  if ((!hasLiveRate && /apnoea|apnea|not breathing|respiratory arrest/.test(text)) || rr === 0) {
    return { label: 'Apnoeic', rate: 0, detail: 'No visible chest rise. Begin ventilation immediately.', severity: 'critical' as const, asymmetry: null as string | null };
  }
  if (/agonal|gasp/.test(text) && (!hasLiveRate || rr < 10)) {
    return { label: 'Agonal gasps', rate: rr || 6, detail: 'Irregular gasping respirations with poor tidal volume.', severity: 'critical' as const, asymmetry: null as string | null };
  }
  if (/pneumothorax|absent.*right|right.*absent|absent.*left|left.*absent|unequal|asymmetric/.test(text)) {
    const side = /right/.test(text) && !/left.*absent/.test(text) ? 'right' : /left/.test(text) ? 'left' : 'one side';
    return { label: 'Asymmetric chest rise', rate: rr, detail: `Reduced movement on the ${side}; compare percussion and breath sounds.`, severity: 'warning' as const, asymmetry: side };
  }
  if (breathingEffortImproved(caseData.vitalSignsProgression?.initial, liveVitals)) {
    return { label: 'Effort easing', rate: rr, detail: 'Chest excursion and speech tolerance are improving. Reassess air entry and wheeze; oxygen saturation alone does not prove recovery.', severity: 'observe' as const, asymmetry: null as string | null };
  }
  if (rr > 24 || (!hasLiveRate && /severe distress|accessory|tripod|unable to speak|wheeze|asthma|copd/.test(text))) {
    return { label: 'Tachypnoeic, laboured', rate: rr, detail: 'Fast work of breathing with accessory muscle use and short phrases.', severity: 'warning' as const, asymmetry: null as string | null };
  }
  if (rr <= 8 || /shallow|hypoventilat|opioid|reduced respiratory/.test(text)) {
    return { label: 'Slow / shallow', rate: rr, detail: 'Reduced chest excursion; watch ventilation and consciousness closely.', severity: 'warning' as const, asymmetry: null as string | null };
  }
  if (/pain|splint|rib|chest injury|abdominal pain/.test(text)) {
    return { label: 'Shallow, splinting', rate: rr, detail: 'Smaller chest movement consistent with pain or guarding.', severity: 'observe' as const, asymmetry: null as string | null };
  }
  return { label: 'Regular chest rise', rate: rr, detail: 'Symmetrical rise and fall without obvious accessory muscle use.', severity: 'normal' as const, asymmetry: null as string | null };
}
