/**
 * Treatment Effects Module
 * 
 * Case-dependent treatment effect logic for the Patient Simulator
 * Optimized for realistic physiological responses based on case type
 */

import type { VitalSigns } from '@/types';

// Parse BP to get systolic/diastolic values
const parseBP = (bp: string): { systolic: number; diastolic: number } => {
  const parts = bp.split('/').map(p => parseInt(p.trim()));
  return { systolic: parts[0] || 120, diastolic: parts[1] || 80 };
};

// Format BP back to string
const formatBP = (systolic: number, diastolic: number): string => 
  `${Math.round(systolic)}/${Math.round(diastolic)}`;

// Ensure all vital signs fields are populated
const ensureCompleteVitals = (vitals: Partial<VitalSigns>): VitalSigns => ({
  bp: vitals.bp || '120/80',
  pulse: vitals.pulse ?? 80,
  respiration: vitals.respiration ?? 16,
  spo2: vitals.spo2 ?? 98,
  temperature: vitals.temperature ?? 36.5,
  gcs: vitals.gcs ?? 15,
  bloodGlucose: vitals.bloodGlucose ?? 5.5,
  etco2: vitals.etco2,
  painScore: vitals.painScore,
  time: vitals.time || new Date().toISOString(),
});

// Helper to determine case type from category
const getCaseType = (category: string): 'cardiac' | 'respiratory' | 'trauma' | 'neurological' | 'metabolic' | 'psychosis' | 'general' => {
  const lowerCategory = category.toLowerCase();
  if (['cardiac', 'cardiac-ecg', 'critical-care'].includes(lowerCategory)) return 'cardiac';
  if (['respiratory', 'thoracic'].includes(lowerCategory)) return 'respiratory';
  if (lowerCategory === 'trauma') return 'trauma';
  if (lowerCategory === 'neurological') return 'neurological';
  if (lowerCategory === 'metabolic') return 'metabolic';
  if (['psychosis', 'aggression', 'schizophrenia', 'acute-psychosis', 'psychiatric'].includes(lowerCategory)) return 'psychosis';
  return 'general';
};

// Filter treatments based on case type
export function getCaseSpecificTreatments(caseCategory: string): string[] {
  const caseType = getCaseType(caseCategory);
  const baseTreatments = [
    'Assess ABCDE',
    'Assess vitals',
    'Check responsiveness',
    'Establish airway',
    'Assess breathing',
    'Assess circulation',
    'Assess disability',
    'Expose and examine',
    'Monitor patient',
    'Document findings',
    'Communicate with dispatch',
    'Call for backup if needed',
  ];

  switch (caseType) {
    case 'cardiac':
      return [
        ...baseTreatments,
        'Assess for chest pain',
        'Check for signs of shock',
        'Administer aspirin',
        'Obtain 12-lead ECG',
        'Assess for signs of MI',
        'Monitor cardiac rhythm',
        'Prepare for potential defibrillation',
        'Prepare for cardiac medications',
        'Assess blood pressure',
        'Check peripheral pulses',
      ];

    case 'respiratory':
      return [
        ...baseTreatments,
        'Assess respiratory rate',
        'Assess oxygen saturation',
        'Administer oxygen',
        'Assess breath sounds',
        'Check for wheezing',
        'Check for retractions',
        'Assess work of breathing',
        'Prepare for nebulization',
        'Prepare for suctioning',
        'Assess lung expansion',
      ];

    case 'trauma':
      return [
        ...baseTreatments,
        'Assess for bleeding',
        'Control bleeding',
        'Check for shock',
        'Assess for deformities',
        'Check for open wounds',
        'Check for head injury',
        'Check for spinal injury',
        'Prepare for IV access',
        'Prepare for fluid resuscitation',
        'Check for other injuries',
      ];

    case 'neurological':
      return [
        ...baseTreatments,
        'Assess level of consciousness',
        'Check pupillary response',
        'Assess motor function',
        'Assess sensory function',
        'Check for signs of increased ICP',
        'Assess for seizures',
        'Monitor GCS',
        'Prepare for seizure management',
        'Check for focal neurological deficits',
      ];

    case 'metabolic':
      return [
        ...baseTreatments,
        'Assess blood glucose',
        'Check for signs of DKA',
        'Check for signs of hyperosmolar state',
        'Assess mental status',
        'Check for fruity odor',
        'Check for Kussmaul breathing',
        'Prepare for insulin',
        'Prepare for fluids',
        'Check electrolyte levels',
      ];

    case 'psychosis':
      return [
        ...baseTreatments,
        'Assess for agitation',
        'Assess for risk of violence',
        'Assess for hallucinations',
        'Assess for delusions',
        'Assess for safety',
        'Use de-escalation techniques',
        'Consider sedation if needed',
        'Consider restraint if needed',
        'Contact police if aggressive',
        'Prepare for transport to psychiatric facility',
      ];

    default:
      return baseTreatments;
  }
}

// Treatment effect result with tracking
export interface TreatmentEffectResult {
  vitals: VitalSigns;
  improvements: string[];
  hasImprovement: boolean;
}

/**
 * Apply treatment effects with case-dependent logic
 * 
 * @param itemDescription - Description of the treatment/intervention
 * @param currentVitalSigns - Current vital signs
 * @param caseCategory - Case category for case-specific effects
 * @returns Updated vital signs and improvement tracking
 */
export function applyTreatmentEffectEnhanced(
  itemDescription: string,
  currentVitalSigns: VitalSigns,
  caseCategory?: string
): TreatmentEffectResult {
  const desc = itemDescription.toLowerCase();
  const caseType = caseCategory ? getCaseType(caseCategory) : 'general';
  
  // Start with current vitals, ensuring all fields are complete
  const newVitals = ensureCompleteVitals({ ...currentVitalSigns });
  
  // Track improvements for notification
  const improvements: string[] = [];
  
  // Helper to record improvements
  const recordImprovement = (label: string, oldVal: number | string, newVal: number | string, unit: string = '') => {
    if (oldVal !== newVal) {
      improvements.push(`${label} ${oldVal}${unit} → ${newVal}${unit}`);
    }
  };
  
  // Store original values for comparison
  const originalVitals = { ...newVitals };
  
  // ============ OXYGEN THERAPY - Case-dependent effects ============
  if (desc.includes('oxygen') || desc.includes('o2') || desc.includes('spo2') || desc.includes('airway')) {
    // Cardiac cases: Focus on myocardial oxygenation
    if (caseType === 'cardiac') {
      if (newVitals.spo2 < 94) {
        const improvement = Math.min(12, 96 - newVitals.spo2);
        newVitals.spo2 = Math.min(98, newVitals.spo2 + improvement);
        recordImprovement('SpO₂', originalVitals.spo2, newVitals.spo2, '%');
      }
      // Cardiac patients may have anxiety - slight HR reduction
      if (newVitals.pulse > 100) {
        newVitals.pulse = Math.max(70, newVitals.pulse - 8);
        recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
      }
      // Slight BP improvement from reduced myocardial stress
      const bp = parseBP(newVitals.bp);
      if (bp.systolic < 100) {
        bp.systolic = Math.min(110, bp.systolic + 8);
        bp.diastolic = Math.min(75, bp.diastolic + 5);
        newVitals.bp = formatBP(bp.systolic, bp.diastolic);
        recordImprovement('BP', originalVitals.bp, newVitals.bp);
      }
    }
    // Respiratory cases: SpO2 improves but respiratory rate should DECREASE
    else if (caseType === 'respiratory') {
      if (newVitals.spo2 < 92) {
        const improvement = Math.min(18, 95 - newVitals.spo2);
        newVitals.spo2 = Math.min(96, newVitals.spo2 + improvement);
        recordImprovement('SpO₂', originalVitals.spo2, newVitals.spo2, '%');
      }
      // KEY: In respiratory cases, oxygen reduces the work of breathing
      if (newVitals.respiration > 20) {
        const rrReduction = Math.min(12, newVitals.respiration - 16);
        newVitals.respiration = newVitals.respiration - rrReduction;
        recordImprovement('RR', originalVitals.respiration, newVitals.respiration);
      }
      // Reduced work of breathing also reduces HR
      if (newVitals.pulse > 100) {
        newVitals.pulse = Math.max(80, newVitals.pulse - 12);
        recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
      }
    }
    // Trauma cases: Focus on tissue perfusion
    else if (caseType === 'trauma') {
      if (newVitals.spo2 < 90) {
        const improvement = Math.min(15, 95 - newVitals.spo2);
        newVitals.spo2 = Math.min(97, newVitals.spo2 + improvement);
        recordImprovement('SpO₂', originalVitals.spo2, newVitals.spo2, '%');
      }
      // May need to support perfusion
      const bp = parseBP(newVitals.bp);
      if (bp.systolic < 100) {
        bp.systolic = Math.min(110, bp.systolic + 8);
        bp.diastolic = Math.min(75, bp.diastolic + 5);
        newVitals.bp = formatBP(bp.systolic, bp.diastolic);
        recordImprovement('BP', originalVitals.bp, newVitals.bp);
      }
      // Reduced tissue hypoxia improves HR
      if (newVitals.pulse > 110) {
        newVitals.pulse = Math.max(85, newVitals.pulse - 15);
        recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
      }
    }
    // Neurological cases - oxygen supports brain perfusion
    else if (caseType === 'neurological') {
      if (newVitals.spo2 < 94) {
        const improvement = Math.min(12, 96 - newVitals.spo2);
        newVitals.spo2 = Math.min(98, newVitals.spo2 + improvement);
        recordImprovement('SpO₂', originalVitals.spo2, newVitals.spo2, '%');
      }
      // Better oxygenation may improve GCS slightly
      if (newVitals.gcs && newVitals.gcs < 15 && newVitals.gcs >= 13) {
        newVitals.gcs = Math.min(15, newVitals.gcs + 1);
        recordImprovement('GCS', originalVitals.gcs ?? 0, newVitals.gcs ?? 0);
      }
    }
    // General/metabolic cases
    else {
      if (newVitals.spo2 < 94) {
        const improvement = Math.min(10, 96 - newVitals.spo2);
        newVitals.spo2 = Math.min(98, newVitals.spo2 + improvement);
        recordImprovement('SpO₂', originalVitals.spo2, newVitals.spo2, '%');
      }
      if (newVitals.respiration > 24) {
        newVitals.respiration = Math.max(18, newVitals.respiration - 4);
        recordImprovement('RR', originalVitals.respiration, newVitals.respiration);
      }
    }
  }
  
  // ============ FLUIDS/IV FLUIDS - Case-dependent volume effects ============
  if (desc.includes('fluid') || desc.includes('iv access') || desc.includes('cannulation') || desc.includes('saline')) {
    const bp = parseBP(newVitals.bp);
    
    if (caseType === 'trauma') {
      // Trauma: More aggressive fluid response for hemorrhage
      if (bp.systolic < 100) {
        bp.systolic = Math.min(120, bp.systolic + 25);
        bp.diastolic = Math.min(80, bp.diastolic + 12);
        recordImprovement('BP', originalVitals.bp, `${bp.systolic}/${bp.diastolic}`);
      }
      // Trauma: Stabilize tachycardia from blood loss
      if (newVitals.pulse > 100) {
        newVitals.pulse = Math.max(75, newVitals.pulse - 25);
        recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
      }
    } else if (caseType === 'cardiac') {
      // Cardiac: More cautious fluid response
      if (bp.systolic < 90) {
        bp.systolic = Math.min(110, bp.systolic + 15);
        bp.diastolic = Math.min(75, bp.diastolic + 8);
        recordImprovement('BP', originalVitals.bp, `${bp.systolic}/${bp.diastolic}`);
      }
      if (newVitals.pulse > 110) {
        newVitals.pulse = Math.max(80, newVitals.pulse - 15);
        recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
      }
    } else {
      // General fluid response
      if (bp.systolic < 100) {
        bp.systolic = Math.min(115, bp.systolic + 18);
        bp.diastolic = Math.min(75, bp.diastolic + 10);
        recordImprovement('BP', originalVitals.bp, `${bp.systolic}/${bp.diastolic}`);
      }
      if (newVitals.pulse > 100) {
        newVitals.pulse = Math.max(80, newVitals.pulse - 18);
        recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
      }
    }
    
    newVitals.bp = formatBP(bp.systolic, bp.diastolic);
  }
  
  // ============ ADRENALINE/EPINEPHRINE - Cardiac stimulation ============
  if (desc.includes('adrenaline') || desc.includes('epinephrine')) {
    const bp = parseBP(newVitals.bp);
    
    if (caseType === 'cardiac') {
      // In cardiac arrest: Restore circulation
      if (newVitals.pulse === 0 || newVitals.pulse < 30) {
        newVitals.pulse = 60;
        bp.systolic = 60;
        bp.diastolic = 40;
        recordImprovement('HR', 0, 60);
        recordImprovement('BP', '0/0', '60/40');
      } else {
        bp.systolic = Math.min(130, bp.systolic + 30);
        bp.diastolic = Math.min(85, bp.diastolic + 18);
        newVitals.pulse = Math.min(120, newVitals.pulse + 30);
        recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
        recordImprovement('BP', originalVitals.bp, `${bp.systolic}/${bp.diastolic}`);
      }
    } else {
      bp.systolic = Math.min(140, bp.systolic + 25);
      bp.diastolic = Math.min(90, bp.diastolic + 15);
      newVitals.pulse = Math.min(120, newVitals.pulse + 25);
      recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
      recordImprovement('BP', originalVitals.bp, `${bp.systolic}/${bp.diastolic}`);
    }
    
    newVitals.bp = formatBP(bp.systolic, bp.diastolic);
  }
  
  // ============ DEFIBRILLATION - Restores normal rhythm ============
  if (desc.includes('defibrillat') || desc.includes('shock') || desc.includes('cardioversion')) {
    if (caseType === 'cardiac') {
      newVitals.pulse = 80;
      newVitals.bp = '120/80';
      newVitals.spo2 = Math.min(98, newVitals.spo2 + 10);
      
      recordImprovement('HR', originalVitals.pulse, 80);
      recordImprovement('BP', originalVitals.bp, '120/80');
      recordImprovement('SpO₂', originalVitals.spo2, newVitals.spo2, '%');
    }
  }
  
  // ============ GLUCOSE/DEXTROSE - Treats hypoglycemia ============
  if (desc.includes('glucose') || desc.includes('dextrose') || desc.includes('sugar') || desc.includes('hypoglycemia')) {
    if (newVitals.bloodGlucose && newVitals.bloodGlucose < 4) {
      const oldGlucose = newVitals.bloodGlucose;
      newVitals.bloodGlucose = Math.min(7, newVitals.bloodGlucose + 4);
      recordImprovement('Glucose', oldGlucose, newVitals.bloodGlucose, ' mmol/L');
      
      // Hypoglycemia correction improves mental status (GCS)
      if (newVitals.gcs && newVitals.gcs < 15) {
        const oldGCS = newVitals.gcs;
        newVitals.gcs = Math.min(15, newVitals.gcs + 3);
        recordImprovement('GCS', oldGCS, newVitals.gcs);
      }
    }
  }
  
  // ============ NEBULIZERS/BRONCHODILATORS - Respiratory cases show dramatic improvement ============
  if (desc.includes('nebuliz') || desc.includes('bronchodilator') || desc.includes('salbutamol') || desc.includes('inhaler') || desc.includes('ipratropium')) {
    if (caseType === 'respiratory') {
      // Significant improvement in respiratory rate
      if (newVitals.respiration > 20) {
        const rrReduction = Math.min(14, newVitals.respiration - 14);
        newVitals.respiration = newVitals.respiration - rrReduction;
        recordImprovement('RR', originalVitals.respiration, newVitals.respiration);
      }
      // SpO2 improves significantly
      if (newVitals.spo2 < 94) {
        newVitals.spo2 = Math.min(96, newVitals.spo2 + 12);
        recordImprovement('SpO₂', originalVitals.spo2, newVitals.spo2, '%');
      }
      // Reduced work of breathing reduces heart rate
      if (newVitals.pulse > 100) {
        newVitals.pulse = Math.max(75, newVitals.pulse - 18);
        recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
      }
    } else {
      // General response
      if (newVitals.respiration > 20) {
        newVitals.respiration = Math.max(16, newVitals.respiration - 6);
        recordImprovement('RR', originalVitals.respiration, newVitals.respiration);
      }
      if (newVitals.spo2 < 94) {
        newVitals.spo2 = Math.min(96, newVitals.spo2 + 6);
        recordImprovement('SpO₂', originalVitals.spo2, newVitals.spo2, '%');
      }
    }
  }
  
  // ============ STEROIDS - Gradual improvement, better in respiratory cases ============
  if (desc.includes('steroid') || desc.includes('hydrocortisone') || desc.includes('prednisolone') || desc.includes('dexamethasone')) {
    if (caseType === 'respiratory') {
      if (newVitals.respiration > 22) {
        newVitals.respiration = Math.max(18, newVitals.respiration - 6);
        recordImprovement('RR', originalVitals.respiration, newVitals.respiration);
      }
      if (newVitals.spo2 < 92) {
        newVitals.spo2 = Math.min(94, newVitals.spo2 + 6);
        recordImprovement('SpO₂', originalVitals.spo2, newVitals.spo2, '%');
      }
    } else {
      if (newVitals.respiration > 22) {
        newVitals.respiration = Math.max(18, newVitals.respiration - 3);
        recordImprovement('RR', originalVitals.respiration, newVitals.respiration);
      }
    }
  }
  
  // ============ PAIN RELIEF - Reduces pain score and associated vitals ============
  if (desc.includes('pain') || desc.includes('morphine') || desc.includes('analgesia') || desc.includes('fentanyl')) {
    if (newVitals.painScore && newVitals.painScore > 3) {
      const oldPain = newVitals.painScore;
      newVitals.painScore = Math.max(0, newVitals.painScore - 5);
      recordImprovement('Pain', oldPain, newVitals.painScore, '/10');
    }
    // Pain relief reduces HR and BP from sympathetic stimulation
    if (newVitals.pulse > 90) {
      newVitals.pulse = Math.max(70, newVitals.pulse - 12);
      recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
    }
    const bp = parseBP(newVitals.bp);
    if (bp.systolic > 140) {
      bp.systolic = Math.max(120, bp.systolic - 18);
      bp.diastolic = Math.max(70, bp.diastolic - 8);
      newVitals.bp = formatBP(bp.systolic, bp.diastolic);
      recordImprovement('BP', originalVitals.bp, newVitals.bp);
    }
  }
  
  // ============ ASPIRIN - Cardiac cases show perfusion improvement ============
  if (desc.includes('aspirin') || desc.includes('chest pain') || desc.includes('acs') || desc.includes('mi')) {
    if (caseType === 'cardiac') {
      if (newVitals.pulse > 100) {
        newVitals.pulse = Math.max(70, newVitals.pulse - 12);
        recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
      }
      // Antiplatelet effect improves coronary perfusion slightly
      const bp = parseBP(newVitals.bp);
      if (bp.systolic < 90) {
        bp.systolic = Math.min(100, bp.systolic + 12);
        bp.diastolic = Math.min(70, bp.diastolic + 6);
        newVitals.bp = formatBP(bp.systolic, bp.diastolic);
        recordImprovement('BP', originalVitals.bp, newVitals.bp);
      }
    }
  }
  
  // ============ GTN/NITROGLYCERIN - Reduces BP and cardiac workload ============
  if (desc.includes('gtn') || desc.includes('nitroglycerin') || desc.includes('nitrate')) {
    const bp = parseBP(newVitals.bp);
    if (bp.systolic > 140) {
      bp.systolic = Math.max(120, bp.systolic - 30);
      bp.diastolic = Math.max(70, bp.diastolic - 12);
      newVitals.bp = formatBP(bp.systolic, bp.diastolic);
      recordImprovement('BP', originalVitals.bp, newVitals.bp);
    }
    // Reduced afterload improves HR slightly
    if (newVitals.pulse > 100) {
      newVitals.pulse = Math.max(75, newVitals.pulse - 10);
      recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
    }
  }
  
  // ============ SEIZURE MANAGEMENT - Improves GCS and stabilizes vitals ============
  if (desc.includes('seizure') || desc.includes('midazolam') || desc.includes('diazepam') || desc.includes('lorazepam')) {
    if (caseType === 'neurological') {
      if (newVitals.gcs && newVitals.gcs < 15) {
        const oldGCS = newVitals.gcs;
        newVitals.gcs = Math.min(15, newVitals.gcs + 5);
        recordImprovement('GCS', oldGCS, newVitals.gcs);
      }
    } else {
      if (newVitals.gcs && newVitals.gcs < 15) {
        const oldGCS = newVitals.gcs;
        newVitals.gcs = Math.min(15, newVitals.gcs + 3);
        recordImprovement('GCS', oldGCS, newVitals.gcs);
      }
    }
    // Post-seizure stabilization
    if (newVitals.pulse > 100) {
      newVitals.pulse = Math.max(80, newVitals.pulse - 18);
      recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
    }
    if (newVitals.respiration > 25) {
      newVitals.respiration = Math.max(18, newVitals.respiration - 10);
      recordImprovement('RR', originalVitals.respiration, newVitals.respiration);
    }
  }
  
  // ============ CHEST COMPRESSIONS/CPR - Maintains perfusion ============
  if (desc.includes('compression') || desc.includes('cpr') || desc.includes('resuscitation')) {
    if (newVitals.pulse === 0 || newVitals.pulse < 30) {
      newVitals.pulse = 60;
      newVitals.bp = '60/40';
      recordImprovement('HR', 0, 60);
      recordImprovement('BP', '0/0', '60/40');
    }
  }
  
  // ============ TXA (Tranexamic Acid) - For bleeding/trauma ============
  if (desc.includes('txa') || desc.includes('tranexamic')) {
    if (caseType === 'trauma') {
      const bp = parseBP(newVitals.bp);
      if (bp.systolic < 90) {
        bp.systolic = Math.min(100, bp.systolic + 18);
        bp.diastolic = Math.min(70, bp.diastolic + 8);
        newVitals.bp = formatBP(bp.systolic, bp.diastolic);
        recordImprovement('BP', originalVitals.bp, newVitals.bp);
      }
      if (newVitals.pulse > 110) {
        newVitals.pulse = Math.max(90, newVitals.pulse - 18);
        recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
      }
    }
  }
  
  // ============ INSULIN - For DKA/Hyperglycemia ============
  if (desc.includes('insulin')) {
    if (newVitals.bloodGlucose && newVitals.bloodGlucose > 15) {
      const oldGlucose = newVitals.bloodGlucose;
      newVitals.bloodGlucose = Math.max(8, newVitals.bloodGlucose - 8);
      recordImprovement('Glucose', oldGlucose, newVitals.bloodGlucose, ' mmol/L');
    }
  }
  
  // ============ NEEDLE DECOMPRESSION/CHEST DRAIN ============
  if (desc.includes('needle decompress') || desc.includes('chest drain') || desc.includes('thoracostomy')) {
    if (caseType === 'respiratory' || caseType === 'trauma') {
      if (newVitals.spo2 < 90) {
        newVitals.spo2 = Math.min(96, newVitals.spo2 + 18);
        recordImprovement('SpO₂', originalVitals.spo2, newVitals.spo2, '%');
      }
      if (newVitals.respiration > 30) {
        newVitals.respiration = Math.max(18, newVitals.respiration - 18);
        recordImprovement('RR', originalVitals.respiration, newVitals.respiration);
      }
      const bp = parseBP(newVitals.bp);
      if (bp.systolic < 90) {
        bp.systolic = Math.min(110, bp.systolic + 25);
        newVitals.bp = formatBP(bp.systolic, bp.diastolic);
        recordImprovement('BP', originalVitals.bp, newVitals.bp);
      }
    }
  }
  
  // ============ COOLING/ACTIVE COOLING - For heat-related illness ============
  if (desc.includes('cooling') || desc.includes('active cooling') || desc.includes('ice packs')) {
    if (newVitals.temperature && newVitals.temperature > 38) {
      const oldTemp = newVitals.temperature;
      newVitals.temperature = Math.max(37, newVitals.temperature - 1.5);
      recordImprovement('Temp', oldTemp, newVitals.temperature, '°C');
    }
    // Cooling reduces HR
    if (newVitals.pulse > 100) {
      newVitals.pulse = Math.max(80, newVitals.pulse - 15);
      recordImprovement('HR', originalVitals.pulse, newVitals.pulse);
    }
  }
  
  // ============ ANTIHYPERTENSIVES ============
  if (desc.includes('antihypertensive') || desc.includes('labetalol') || desc.includes('hydralazine')) {
    const bp = parseBP(newVitals.bp);
    if (bp.systolic > 160) {
      bp.systolic = Math.max(140, bp.systolic - 35);
      bp.diastolic = Math.max(80, bp.diastolic - 15);
      newVitals.bp = formatBP(bp.systolic, bp.diastolic);
      recordImprovement('BP', originalVitals.bp, newVitals.bp);
    }
  }
  
  // Check if there was any improvement
  const hasImprovement = improvements.length > 0;
  
  return {
    vitals: newVitals,
    improvements,
    hasImprovement
  };
}

// Re-export ensureCompleteVitals for use in other modules
export { ensureCompleteVitals, getCaseType, parseBP, formatBP };
