/**
 * Medical Control Advisor
 *
 * Simulates a call to medical control / base hospital physician.
 * Provides context-aware clinical advice based on:
 * - Current vital signs
 * - Case presentation
 * - Treatments already applied
 * - Red flags / critical findings
 *
 * Template-based — no external API required.
 */

import type { CaseScenario, VitalSigns } from '@/types';

export interface MedicalControlAdvice {
  greeting: string;           // Opening line from med control
  sitrep: string;             // Their acknowledgement of the situation
  recommendations: string[];  // Specific recommendations
  authorizations: string[];   // Procedures/meds authorised
  redFlags: string[];         // Things they're warning you about
  signOff: string;            // Closing line
}

interface MedicalControlInputs {
  caseData: CaseScenario;
  currentVitals: VitalSigns;
  appliedTreatmentIds: string[];
  isInArrest: boolean;
  studentQuery?: string; // Optional: what the student is asking about
}

export function callMedicalControl(inputs: MedicalControlInputs): MedicalControlAdvice {
  const { caseData, currentVitals, appliedTreatmentIds, isInArrest } = inputs;

  const sub = (caseData.subcategory || '').toLowerCase();
  const category = caseData.category.toLowerCase();
  const age = caseData.patientInfo?.age;
  const gender = caseData.patientInfo?.gender;

  const spo2 = parseInt(String(currentVitals.spo2)) || 98;
  const hr = parseInt(String(currentVitals.pulse)) || 80;
  const rr = parseInt(String(currentVitals.respiration)) || 16;
  const gcs = parseInt(String(currentVitals.gcs)) || 15;
  const temp = currentVitals.temperature ?? 37;
  const bgl = typeof currentVitals.bloodGlucose === 'number' ? currentVitals.bloodGlucose : null;

  const bpParts = String(currentVitals.bp || '120/80').split('/');
  const sbp = parseInt(bpParts[0]) || 120;

  const recommendations: string[] = [];
  const authorizations: string[] = [];
  const redFlags: string[] = [];

  // Build a condensed sitrep
  const patientDesc = age && gender ? `${age}-year-old ${gender}` : 'patient';
  const sitrep = `Okay, I've got you. So you're on scene with a ${patientDesc} — ${sub || category} presentation. Vitals: BP ${currentVitals.bp}, HR ${hr}, RR ${rr}, SpO2 ${spo2}%, GCS ${gcs}${temp < 36 || temp > 38 ? `, temp ${temp}°C` : ''}. What's the situation?`;

  // ============================================================================
  // CARDIAC ARREST
  // ============================================================================
  if (isInArrest) {
    recommendations.push('Continue high-quality CPR — depth 5-6 cm, rate 100-120, full recoil, minimise pauses.');
    recommendations.push('Ventilate at 10 breaths per minute asynchronous with compressions once advanced airway is in place.');
    if (!appliedTreatmentIds.includes('adrenaline_1mg') && temp >= 30) {
      authorizations.push('Adrenaline 1mg IV every 3-5 minutes — authorised.');
    }
    if (temp < 30) {
      redFlags.push('Core temperature is below 30°C — withhold adrenaline and amiodarone. Focus on active rewarming. Limit defibrillation to 3 shocks until rewarmed.');
    }
    const isShockable = caseData.abcde?.circulation?.ecgFindings?.some(
      (f: string) => f.toLowerCase().includes('vf') || f.toLowerCase().includes('ventricular fibrillation')
    );
    if (isShockable && !appliedTreatmentIds.includes('defibrillation')) {
      authorizations.push('Defibrillate at 200J biphasic immediately — authorised.');
    }
    if (!appliedTreatmentIds.includes('ng_tube') && sub.includes('drowning')) {
      recommendations.push('Decompress the stomach with an NG/OG tube — drowning patients swallow significant water.');
    }
    recommendations.push('Do not stop CPR until ROSC or until you\'ve transported to definitive care.');
  }

  // ============================================================================
  // HYPOTHERMIA (non-arrest)
  // ============================================================================
  if (!isInArrest && temp < 35) {
    redFlags.push(`Core temperature ${temp}°C — this is significant hypothermia. Handle the patient gently; rough movement can precipitate VF.`);
    recommendations.push('Active rewarming: remove wet clothing, warm blankets, warmed IV fluids (40°C), heat packs to axillae and groin.');
    if (temp < 30) {
      redFlags.push('Below 30°C, drug metabolism is severely impaired. Withhold all medications until rewarmed.');
      recommendations.push('In severe hypothermia, bradycardia is protective — do NOT treat with atropine.');
    }
  }

  // ============================================================================
  // RESPIRATORY DISTRESS
  // ============================================================================
  if (category === 'respiratory' || spo2 < 94) {
    if (!appliedTreatmentIds.includes('oxygen_15l') && !appliedTreatmentIds.includes('bvm_ventilation')) {
      recommendations.push('Get high-flow oxygen on immediately — aim for SpO2 >94%, or >88% in COPD.');
    }
    if (sub.includes('asthma') || sub.includes('copd')) {
      if (!appliedTreatmentIds.some(id => id.includes('salbutamol'))) {
        authorizations.push('Salbutamol 5mg nebulised — authorised.');
      }
      if (!appliedTreatmentIds.some(id => id.includes('ipratropium'))) {
        authorizations.push('Ipratropium 500mcg nebulised combined with salbutamol — authorised for moderate-severe.');
      }
      if (sub.includes('severe') || spo2 < 90) {
        authorizations.push('Hydrocortisone 200mg IV — authorised for severe asthma.');
        if (rr > 30 || spo2 < 88) {
          authorizations.push('Magnesium sulfate 2g IV over 20 minutes — authorised for life-threatening asthma.');
        }
      }
    }
    if (sub.includes('pulmonary') && sub.includes('oedema')) {
      authorizations.push('GTN sublingual or IV infusion — authorised if SBP >100.');
      recommendations.push('Sit the patient up. CPAP if available. Furosemide 40-80mg IV.');
    }
  }

  // ============================================================================
  // CHEST PAIN / ACS
  // ============================================================================
  if (sub.includes('stemi') || sub.includes('acs') || sub.includes('angina') || sub.includes('mi')) {
    if (!appliedTreatmentIds.some(id => id.includes('aspirin'))) {
      authorizations.push('Aspirin 300mg chewed — authorised.');
    }
    if (sbp > 100 && !appliedTreatmentIds.some(id => id.includes('gtn'))) {
      authorizations.push('GTN 400mcg sublingual every 5 minutes, up to 3 doses — authorised if SBP remains above 100.');
    }
    if (sbp < 100) {
      redFlags.push(`SBP is ${sbp} — withhold GTN. Check for right ventricular infarction (inferior STEMI with V4R changes).`);
    }
    recommendations.push('12-lead ECG every 10 minutes. Pre-alert the receiving PCI centre with door-to-balloon goal under 90 minutes.');
    if (!appliedTreatmentIds.some(id => id.includes('morphine') || id.includes('fentanyl'))) {
      authorizations.push('Morphine 2.5-5mg IV for ongoing pain — authorised.');
    }
  }

  // ============================================================================
  // STROKE
  // ============================================================================
  if (sub.includes('stroke') || sub.includes('cva') || sub.includes('tia')) {
    recommendations.push('Check BGL immediately — hypoglycaemia is a stroke mimic and is immediately reversible.');
    recommendations.push('Confirm last known well time — this is the critical piece of information for thrombolysis eligibility.');
    recommendations.push('Pre-alert the stroke unit. FAST positive, last known well time, and ETA.');
    if (bgl !== null && bgl < 3.5) {
      authorizations.push('Dextrose 10% 10g IV — authorised if hypoglycaemic.');
    }
  }

  // ============================================================================
  // ANAPHYLAXIS
  // ============================================================================
  if (sub.includes('anaphylaxis') || sub.includes('allergy')) {
    if (!appliedTreatmentIds.some(id => id.includes('adrenaline_im'))) {
      authorizations.push('Adrenaline 0.5mg IM (0.5mL of 1:1,000) into the anterolateral thigh — authorised. This is your first-line life-saving intervention.');
    }
    recommendations.push('IV fluids bolus if hypotensive.');
    authorizations.push('Chlorphenamine 10mg IV and hydrocortisone 200mg IV as adjuncts — authorised after adrenaline.');
  }

  // ============================================================================
  // SEIZURE
  // ============================================================================
  if (sub.includes('seizure') || sub.includes('epilepsy') || sub.includes('status')) {
    if (!appliedTreatmentIds.some(id => id.includes('midazolam') || id.includes('diazepam'))) {
      authorizations.push('Midazolam 10mg buccal or 5mg IV for active seizure — authorised.');
    }
    recommendations.push('Check BGL — hypoglycaemia is a common cause of seizures and must be excluded.');
    if (gcs < 15) recommendations.push('Protect the airway — recovery position, suction, consider OPA once the seizure terminates.');
  }

  // ============================================================================
  // HYPOGLYCAEMIA
  // ============================================================================
  if (bgl !== null && bgl < 4.0) {
    redFlags.push(`BGL is ${bgl} mmol/L — treat immediately.`);
    if (gcs >= 14) {
      authorizations.push('Oral glucose 15-20g if patient is conscious and can swallow safely.');
    } else {
      authorizations.push('Dextrose 10% 10g IV (100mL) — authorised. Or glucagon 1mg IM if no IV access.');
    }
  }

  // ============================================================================
  // SEPSIS
  // ============================================================================
  if (sub.includes('sepsis') || (temp > 38.5 && hr > 100 && rr > 22)) {
    recommendations.push('This looks septic — follow the sepsis six: oxygen, blood cultures if possible, IV antibiotics, IV fluids, lactate, urine output.');
    authorizations.push('Normal saline 500mL IV bolus, repeat to 30mL/kg if hypotensive — authorised.');
    recommendations.push('Pre-alert the receiving unit with \"sepsis alert\" so they can initiate the sepsis bundle on arrival.');
  }

  // ============================================================================
  // TRAUMA
  // ============================================================================
  if (category === 'trauma') {
    recommendations.push('C-spine immobilisation if any head, neck, or high-velocity mechanism.');
    if (sbp < 90) {
      redFlags.push('Patient is hypotensive — permissive hypotension in trauma. Target SBP 80-90 in penetrating, 90-100 in blunt trauma.');
      authorizations.push('Tranexamic acid 1g IV over 10 minutes if within 3 hours of injury — authorised.');
    }
    if (sub.includes('burn')) {
      recommendations.push('Parkland formula: 2-4mL/kg/%TBSA over 24 hours, half in the first 8 hours.');
      authorizations.push('Morphine for burn pain — authorised.');
    }
  }

  // ============================================================================
  // LOW GCS
  // ============================================================================
  if (gcs <= 8) {
    redFlags.push(`GCS is ${gcs} — airway is at risk. Consider definitive airway management.`);
    recommendations.push('Position appropriately, maintain patent airway with OPA/NPA, BVM ventilation if inadequate respiration.');
  }

  // ============================================================================
  // DEFAULTS
  // ============================================================================
  if (recommendations.length === 0 && authorizations.length === 0 && redFlags.length === 0) {
    recommendations.push('Vitals look stable. Complete your primary survey, get a full set of baseline observations, and reassess every 5 minutes during transport.');
    recommendations.push('Continue symptomatic care. Transport to the most appropriate receiving facility.');
  }

  const greetings = [
    'Dr. Al Mansouri here, go ahead with your patient.',
    'This is medical control, what have you got?',
    'Go ahead paramedic, I\'m listening.',
  ];
  const signOffs = [
    'Keep me updated with any changes. Good luck.',
    'Call back if the patient deteriorates or you need additional orders.',
    'Good work, drive safe. Standing by if you need us.',
  ];

  return {
    greeting: greetings[Math.floor(Math.random() * greetings.length)],
    sitrep,
    recommendations,
    authorizations,
    redFlags,
    signOff: signOffs[Math.floor(Math.random() * signOffs.length)],
  };
}
