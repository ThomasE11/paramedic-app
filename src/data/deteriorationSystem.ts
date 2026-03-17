/**
 * Patient Deterioration System
 * 
 * Realistic vital sign deterioration over time when untreated
 * Different cases deteriorate at different rates based on severity
 */

import type { VitalSigns } from '@/types';

// Deterioration rate configuration
export interface DeteriorationRate {
  vitalSign: keyof VitalSigns;
  changePerMinute: number; // Positive = increase, negative = decrease
  minValue: number;
  maxValue: number;
  triggerCondition?: (vitals: VitalSigns) => boolean;
}

// Case type deterioration profiles
export type CaseSeverity = 'stable' | 'moderate' | 'severe' | 'critical' | 'periarrest';

export interface DeteriorationProfile {
  name: string;
  description: string;
  rates: DeteriorationRate[];
  timeToDeath: number; // minutes without treatment
  warningSigns: string[];
}

// Deterioration profiles for different case types
export const DETERIORATION_PROFILES: Record<CaseSeverity, DeteriorationProfile> = {
  stable: {
    name: 'Stable',
    description: 'Patient is stable with minimal deterioration risk',
    timeToDeath: 120, // 2 hours
    rates: [
      { vitalSign: 'spo2', changePerMinute: -0.1, minValue: 90, maxValue: 100 },
      { vitalSign: 'pulse', changePerMinute: 0.2, minValue: 60, maxValue: 100 },
    ],
    warningSigns: ['Mild tachycardia developing', 'Slight decrease in SpO2'],
  },
  
  moderate: {
    name: 'Moderate',
    description: 'Patient requires monitoring, slow deterioration',
    timeToDeath: 60, // 1 hour
    rates: [
      { vitalSign: 'spo2', changePerMinute: -0.3, minValue: 85, maxValue: 100 },
      { vitalSign: 'pulse', changePerMinute: 0.5, minValue: 55, maxValue: 110 },
      { vitalSign: 'respiration', changePerMinute: 0.3, minValue: 12, maxValue: 24 },
    ],
    warningSigns: ['Increasing work of breathing', 'Heart rate trending up'],
  },
  
  severe: {
    name: 'Severe',
    description: 'Patient requires urgent intervention',
    timeToDeath: 30, // 30 minutes
    rates: [
      { vitalSign: 'spo2', changePerMinute: -0.8, minValue: 75, maxValue: 100 },
      { vitalSign: 'pulse', changePerMinute: 1.0, minValue: 50, maxValue: 130 },
      { vitalSign: 'respiration', changePerMinute: 0.8, minValue: 8, maxValue: 35 },
      { 
        vitalSign: 'bp', 
        changePerMinute: -0.5, 
        minValue: 70, 
        maxValue: 200,
        triggerCondition: (vitals) => {
          const systolic = parseInt(String(vitals.bp || '120/80').split('/')[0]);
          return systolic < 90; // Only drop BP if already hypotensive
        }
      },
    ],
    warningSigns: ['Significant hypoxia', 'Tachycardia', 'Increased respiratory distress'],
  },
  
  critical: {
    name: 'Critical',
    description: 'Life-threatening, rapid deterioration',
    timeToDeath: 10, // 10 minutes
    rates: [
      { vitalSign: 'spo2', changePerMinute: -2.0, minValue: 60, maxValue: 100 },
      { vitalSign: 'pulse', changePerMinute: 2.0, minValue: 40, maxValue: 160 },
      { vitalSign: 'respiration', changePerMinute: 2.0, minValue: 6, maxValue: 50 },
      { 
        vitalSign: 'bp', 
        changePerMinute: -2.0, 
        minValue: 50, 
        maxValue: 200 
      },
      { vitalSign: 'gcs', changePerMinute: -0.5, minValue: 3, maxValue: 15 },
    ],
    warningSigns: ['Severe hypoxia', 'Shock developing', 'Altered consciousness'],
  },
  
  periarrest: {
    name: 'Peri-Arrest',
    description: 'Imminent cardiac arrest without immediate intervention',
    timeToDeath: 3, // 3 minutes
    rates: [
      { vitalSign: 'spo2', changePerMinute: -5.0, minValue: 40, maxValue: 100 },
      { vitalSign: 'pulse', changePerMinute: 5.0, minValue: 20, maxValue: 200 },
      { vitalSign: 'respiration', changePerMinute: 4.0, minValue: 4, maxValue: 60 },
      { vitalSign: 'bp', changePerMinute: -5.0, minValue: 30, maxValue: 200 },
      { vitalSign: 'gcs', changePerMinute: -2.0, minValue: 3, maxValue: 15 },
    ],
    warningSigns: ['Respiratory arrest imminent', 'Profound shock', 'Unresponsive'],
  },
};

// Parse BP string to get numeric value
function parseBPValue(bp: string): number {
  const parts = bp.split('/');
  return parseInt(parts[0]) || 120;
}

// Format BP from numeric value
function formatBP(systolic: number, diastolic?: number): string {
  const dia = diastolic || Math.round(systolic * 0.6);
  return `${Math.round(systolic)}/${Math.round(dia)}`;
}

// Apply deterioration for a given time period
export function applyDeterioration(
  vitals: VitalSigns,
  severity: CaseSeverity,
  minutesElapsed: number,
  activeTreatments: string[] = []
): { 
  newVitals: VitalSigns; 
  changes: string[]; 
  warningSigns: string[];
  isCritical: boolean;
} {
  const profile = DETERIORATION_PROFILES[severity];
  const newVitals = { ...vitals };
  const changes: string[] = [];
  let isCritical = false;
  
  // Check treatment coverage — proper treatment should halt or reverse deterioration
  const txLower = activeTreatments.map(t => t.toLowerCase()).join(' ');
  const hasOxygenTx = ['oxygen', 'o2', 'mask', 'cannula', 'high flow', 'nrb', 'non-rebreather', 'bvm', 'cpap', 'bipap']
    .some(k => txLower.includes(k));
  const hasFluidTx = ['fluid', 'saline', 'hartmann', 'bolus', 'ringer', 'crystalloid']
    .some(k => txLower.includes(k));
  const hasAirwayTx = ['airway', 'intubat', 'supraglottic', 'opa', 'npa', 'igel']
    .some(k => txLower.includes(k));
  const hasMedTx = ['adrenaline', 'epinephrine', 'atropine', 'amiodarone', 'adenosine']
    .some(k => txLower.includes(k));

  // Count how many treatment categories are covered
  const txCoverage = [hasOxygenTx, hasFluidTx, hasAirwayTx, hasMedTx].filter(Boolean).length;

  // With good treatment coverage, deterioration is halted or reversed
  // 0 treatments: full deterioration (1.0x)
  // 1 treatment: slowed (0.4x)
  // 2 treatments: nearly halted (0.1x)
  // 3+ treatments: reversed (-0.3x = improvement)
  const deteriorationMultiplier = txCoverage >= 3 ? -0.3
                                : txCoverage === 2 ? 0.1
                                : txCoverage === 1 ? 0.4
                                : 1.0;
  
  profile.rates.forEach(rate => {
    // Check trigger condition if present
    if (rate.triggerCondition && !rate.triggerCondition(newVitals)) {
      return;
    }
    
    const totalChange = rate.changePerMinute * minutesElapsed * deteriorationMultiplier;
    
    switch (rate.vitalSign) {
      case 'pulse':
        const oldPulse = newVitals.pulse || 80;
        newVitals.pulse = Math.max(rate.minValue, Math.min(rate.maxValue, oldPulse + totalChange));
        if (Math.abs(newVitals.pulse - oldPulse) > 1) {
          changes.push(`HR: ${oldPulse} → ${Math.round(newVitals.pulse)} bpm`);
        }
        break;
        
      case 'spo2':
        const oldSpO2 = newVitals.spo2 || 98;
        newVitals.spo2 = Math.max(rate.minValue, Math.min(rate.maxValue, oldSpO2 + totalChange));
        if (Math.abs(newVitals.spo2 - oldSpO2) > 0.5) {
          changes.push(`SpO2: ${oldSpO2}% → ${Math.round(newVitals.spo2)}%`);
        }
        if (newVitals.spo2 < 85) isCritical = true;
        break;
        
      case 'respiration':
        const oldRR = newVitals.respiration || 16;
        newVitals.respiration = Math.max(rate.minValue, Math.min(rate.maxValue, oldRR + totalChange));
        if (Math.abs(newVitals.respiration - oldRR) > 0.5) {
          changes.push(`RR: ${oldRR} → ${Math.round(newVitals.respiration)}/min`);
        }
        break;
        
      case 'bp':
        const oldBP = parseBPValue(String(newVitals.bp || '120/80'));
        const newSystolic = Math.max(rate.minValue, Math.min(rate.maxValue, oldBP + totalChange));
        newVitals.bp = formatBP(newSystolic);
        if (Math.abs(newSystolic - oldBP) > 2) {
          changes.push(`BP: ${oldBP} → ${Math.round(newSystolic)} mmHg`);
        }
        if (newSystolic < 70) isCritical = true;
        break;
        
      case 'gcs':
        const oldGCS = newVitals.gcs || 15;
        newVitals.gcs = Math.max(rate.minValue, Math.min(rate.maxValue, oldGCS + totalChange));
        if (Math.abs(newVitals.gcs - oldGCS) >= 1) {
          changes.push(`GCS: ${oldGCS} → ${Math.round(newVitals.gcs)}`);
        }
        if (newVitals.gcs < 9) isCritical = true;
        break;
        
      case 'temperature':
        const oldTemp = newVitals.temperature || 36.5;
        newVitals.temperature = Math.max(rate.minValue, Math.min(rate.maxValue, oldTemp + totalChange));
        break;
        
      case 'bloodGlucose':
        const oldGlucose = newVitals.bloodGlucose || 5.5;
        newVitals.bloodGlucose = Math.max(rate.minValue, Math.min(rate.maxValue, oldGlucose + totalChange));
        break;
    }
  });
  
  // Determine which warning signs to show based on current state
  const activeWarningSigns = profile.warningSigns.filter((_, index) => {
    // Show more warning signs as time progresses
    const progress = minutesElapsed / profile.timeToDeath;
    return progress > (index / profile.warningSigns.length);
  });
  
  return {
    newVitals,
    changes,
    warningSigns: activeWarningSigns,
    isCritical: isCritical || minutesElapsed > profile.timeToDeath * 0.8,
  };
}

// Get deterioration status for display
export function getDeteriorationStatus(
  severity: CaseSeverity,
  minutesWithoutTreatment: number
): {
  status: 'stable' | 'worsening' | 'critical' | 'periarrest';
  timeRemaining: number;
  percentDeteriorated: number;
  urgency: 'low' | 'medium' | 'high' | 'extreme';
} {
  const profile = DETERIORATION_PROFILES[severity];
  const timeRemaining = Math.max(0, profile.timeToDeath - minutesWithoutTreatment);
  const percentDeteriorated = Math.min(100, (minutesWithoutTreatment / profile.timeToDeath) * 100);
  
  let status: 'stable' | 'worsening' | 'critical' | 'periarrest' = 'stable';
  let urgency: 'low' | 'medium' | 'high' | 'extreme' = 'low';
  
  if (percentDeteriorated >= 90) {
    status = 'periarrest';
    urgency = 'extreme';
  } else if (percentDeteriorated >= 70) {
    status = 'critical';
    urgency = 'high';
  } else if (percentDeteriorated >= 40) {
    status = 'worsening';
    urgency = 'medium';
  }
  
  return {
    status,
    timeRemaining,
    percentDeteriorated,
    urgency,
  };
}

// Calculate recommended reassessment interval
export function getReassessmentInterval(severity: CaseSeverity): number {
  switch (severity) {
    case 'stable': return 15; // Every 15 minutes
    case 'moderate': return 10; // Every 10 minutes
    case 'severe': return 5; // Every 5 minutes
    case 'critical': return 2; // Every 2 minutes
    case 'periarrest': return 1; // Every minute
  }
}

// Determine severity from case category and initial vitals
export function determineSeverity(
  caseCategory: string,
  initialVitals: VitalSigns
): CaseSeverity {
  const category = caseCategory.toLowerCase();
  
  // Check for peri-arrest conditions
  if (
    initialVitals.pulse < 40 ||
    initialVitals.pulse > 150 ||
    initialVitals.spo2 < 80 ||
    initialVitals.gcs < 8
  ) {
    return 'periarrest';
  }
  
  // Check for critical conditions
  if (
    initialVitals.pulse < 50 ||
    initialVitals.pulse > 130 ||
    initialVitals.spo2 < 90 ||
    initialVitals.gcs < 12 ||
    category.includes('cardiac arrest') ||
    category.includes('trauma')
  ) {
    return 'critical';
  }
  
  // Check for severe conditions
  if (
    initialVitals.pulse < 60 ||
    initialVitals.pulse > 110 ||
    initialVitals.spo2 < 94 ||
    category.includes('cardiac') ||
    category.includes('respiratory')
  ) {
    return 'severe';
  }
  
  // Check for moderate conditions
  if (
    initialVitals.pulse < 70 ||
    initialVitals.pulse > 100 ||
    initialVitals.spo2 < 96 ||
    category.includes('general')
  ) {
    return 'moderate';
  }
  
  return 'stable';
}

export type { CaseSeverity };
