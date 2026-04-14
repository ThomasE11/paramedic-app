/**
 * ED Outcome Generator
 *
 * Generates a realistic ED / hospital outcome narrative based on:
 * - Pre-hospital care quality (score)
 * - Treatment appropriateness
 * - Case severity and type
 * - Transport decisions (priority, pre-alert, destination)
 *
 * Simulates what happens in the first 24 hours post-handover.
 */

import type { CaseScenario, VitalSigns } from '@/types';

export interface EDOutcome {
  arrivalHandover: string;             // What you handed over
  arrivalVitals: VitalSigns;           // What the ED measured on arrival
  edAssessment: string;                // ED physician's initial note
  confirmedDiagnosis: string;          // Final ED diagnosis
  treatmentInED: string[];             // What the ED did
  disposition: 'discharged' | 'admitted' | 'icu' | 'cath-lab' | 'theatre' | 'stroke-unit' | 'morgue';
  dispositionLabel: string;            // Human-readable
  twentyFourHourOutcome: string;       // Narrative of how the patient did
  preAlertImpact: 'helpful' | 'neutral' | 'missed-opportunity';
  preAlertComment: string;             // Feedback on the pre-alert
  suspicionAccuracy: 'correct' | 'partial' | 'incorrect';
  suspicionComment: string;            // Feedback on your diagnostic impression
}

interface EDOutcomeInputs {
  caseData: CaseScenario;
  finalVitals: VitalSigns;
  appliedTreatmentIds: string[];
  totalScore: number;
  transportPreAlert: boolean;
  transportDestination?: string;
  suspectedDiagnosis?: string;
}

export function generateEDOutcome(inputs: EDOutcomeInputs): EDOutcome {
  const { caseData, finalVitals, appliedTreatmentIds, totalScore, transportPreAlert, suspectedDiagnosis } = inputs;

  const sub = (caseData.subcategory || '').toLowerCase();
  const category = caseData.category.toLowerCase();
  const actualDiagnosis = caseData.expectedFindings?.mostLikelyDiagnosis || sub || category;

  // Slight degradation of vitals en route if not well managed, slight improvement if well managed
  const quality = totalScore / 100;
  const degradation = (1 - quality) * 0.2; // 0 to 0.2

  const finalSpo2 = parseInt(String(finalVitals.spo2)) || 95;
  const finalHR = parseInt(String(finalVitals.pulse)) || 80;
  const finalRR = parseInt(String(finalVitals.respiration)) || 16;

  const arrivalVitals: VitalSigns = {
    ...finalVitals,
    spo2: Math.max(70, Math.round(finalSpo2 - degradation * 10)),
    pulse: Math.round(finalHR + (quality < 0.5 ? 10 : -5)),
    respiration: Math.round(finalRR + (quality < 0.5 ? 4 : -2)),
    time: new Date().toISOString(),
  };

  // Case-type-specific ED pathways
  let confirmedDiagnosis = actualDiagnosis;
  let treatmentInED: string[] = [];
  let disposition: EDOutcome['disposition'] = 'admitted';
  let dispositionLabel = 'Admitted to ward';
  let twentyFourHourOutcome = '';

  // Cardiac / ACS
  if (sub.includes('stemi') || sub.includes('acs')) {
    confirmedDiagnosis = sub.includes('anterior') ? 'Anterior STEMI confirmed on 12-lead ECG, troponin elevated'
      : sub.includes('inferior') ? 'Inferior STEMI confirmed, troponin elevated'
      : sub.includes('lateral') ? 'Lateral STEMI confirmed'
      : 'STEMI confirmed, troponin rising';
    treatmentInED = [
      'Repeat 12-lead ECG and cardiology consult',
      'Ticagrelor 180mg loading dose',
      'Heparin bolus',
      'Straight to cath lab for primary PCI',
    ];
    disposition = 'cath-lab';
    dispositionLabel = 'Direct to cath lab for primary PCI';
    if (quality > 0.8 && transportPreAlert) {
      twentyFourHourOutcome = 'Door-to-balloon time: 52 minutes. Culprit lesion identified and stented. Patient stable post-PCI, transferred to CCU. Echo shows preserved LVEF. On track for discharge in 72 hours.';
    } else if (quality > 0.6) {
      twentyFourHourOutcome = 'Door-to-balloon time: 78 minutes — within the 90-minute target. Successful PCI, stent deployed. Mild LV dysfunction post-infarct. Expected good recovery.';
    } else {
      twentyFourHourOutcome = 'Door-to-balloon time: 110 minutes — outside the target window. The delay contributed to a larger infarct. Post-PCI LVEF is 35%, likely to develop heart failure. Longer ICU stay anticipated.';
    }
  }
  // Stroke
  else if (sub.includes('stroke') || sub.includes('cva')) {
    confirmedDiagnosis = 'Acute ischaemic stroke confirmed on CT';
    treatmentInED = [
      'Immediate CT head (non-contrast) within 10 min of arrival',
      'Stroke team activated',
      'NIHSS recorded',
      'Thrombolysis assessment',
    ];
    disposition = 'stroke-unit';
    dispositionLabel = 'Transferred to acute stroke unit';
    if (quality > 0.75 && transportPreAlert) {
      twentyFourHourOutcome = 'Door-to-needle time: 35 minutes. Alteplase administered. Significant neurological improvement in 24 hours — NIHSS dropped from 12 to 4. Excellent prognosis.';
    } else if (quality > 0.5) {
      twentyFourHourOutcome = 'Door-to-needle time: 55 minutes. Alteplase given but later in the therapeutic window. Partial improvement, ongoing rehabilitation needed.';
    } else {
      twentyFourHourOutcome = 'Patient arrived outside the thrombolysis window or with unclear last-known-well time. No reperfusion therapy possible. Significant residual deficit expected.';
    }
  }
  // Respiratory — Asthma
  else if (sub.includes('asthma')) {
    confirmedDiagnosis = 'Acute severe asthma exacerbation';
    treatmentInED = [
      'Back-to-back salbutamol nebulisers',
      'IV hydrocortisone 200mg',
      'IV magnesium sulfate 2g',
      'ABG and chest X-ray',
    ];
    if (finalSpo2 < 90 || quality < 0.5) {
      disposition = 'icu';
      dispositionLabel = 'Admitted to ICU for possible intubation';
      twentyFourHourOutcome = 'Required non-invasive ventilation in ICU. Gradually improved over 48 hours. Discharged on day 5 with updated asthma action plan and inhaled corticosteroid step-up.';
    } else {
      disposition = 'admitted';
      dispositionLabel = 'Admitted to respiratory ward';
      twentyFourHourOutcome = 'Responded well to ED treatment — no need for ICU. Weaned off nebulisers by 12 hours. Discharged next day on oral prednisolone and stepped-up inhaler therapy.';
    }
  }
  // Respiratory — COPD
  else if (sub.includes('copd')) {
    confirmedDiagnosis = 'Infective exacerbation of COPD';
    treatmentInED = [
      'Controlled oxygen to target SpO2 88-92%',
      'Nebulised salbutamol + ipratropium',
      'IV hydrocortisone',
      'IV antibiotics',
      'ABG',
    ];
    disposition = 'admitted';
    dispositionLabel = 'Admitted to respiratory ward';
    twentyFourHourOutcome = 'Responded to bronchodilators and steroids. Antibiotics initiated for suspected bacterial exacerbation. Improving over 48 hours.';
  }
  // Cardiac arrest
  else if (sub.includes('arrest') || sub.includes('vfib') || sub.includes('asystole') || appliedTreatmentIds.includes('cpr')) {
    if (finalHR > 0 && finalSpo2 > 85) {
      confirmedDiagnosis = 'Post-cardiac-arrest syndrome — ROSC achieved prehospital';
      treatmentInED = [
        'Targeted temperature management (33-36°C)',
        '12-lead ECG and troponin',
        'Urgent cardiology and critical care consult',
        'Immediate cath lab activation if STEMI',
      ];
      disposition = 'icu';
      dispositionLabel = 'Transferred to cardiac ICU for post-arrest care';
      if (quality > 0.75) {
        twentyFourHourOutcome = 'Excellent neurological outcome. Extubated at 24 hours. Alert and communicating. Culprit cardiac lesion addressed. CPC 1-2, expected full recovery.';
      } else {
        twentyFourHourOutcome = 'Stable haemodynamically. Neurological status pending after rewarming. Family aware, awaiting prognostication at 72 hours.';
      }
    } else {
      confirmedDiagnosis = 'Cardiac arrest — no ROSC achieved';
      treatmentInED = [
        'Continued ACLS for 20 minutes on arrival',
        'Bedside echo showed no cardiac activity',
        'Resuscitation terminated per ACLS protocol',
      ];
      disposition = 'morgue';
      dispositionLabel = 'Termination of resuscitation';
      twentyFourHourOutcome = 'Despite maximal ED efforts, no return of spontaneous circulation was achieved. Resuscitation was terminated. Family notified and supported by the ED team. Case will be reviewed at M&M.';
    }
  }
  // Anaphylaxis
  else if (sub.includes('anaphylaxis')) {
    confirmedDiagnosis = 'Anaphylaxis';
    treatmentInED = [
      'Further IM adrenaline if ongoing symptoms',
      'IV fluids',
      'Chlorphenamine and hydrocortisone',
      'Allergen history and discharge planning',
    ];
    if (appliedTreatmentIds.some(id => id.includes('adrenaline_im'))) {
      disposition = 'admitted';
      dispositionLabel = 'Admitted for 6-hour observation';
      twentyFourHourOutcome = 'Symptoms resolved with prehospital adrenaline and ED supportive care. Observed for biphasic reaction for 6 hours, then discharged with EpiPen and allergen clinic referral.';
    } else {
      disposition = 'icu';
      dispositionLabel = 'Admitted to ICU';
      twentyFourHourOutcome = 'Required ED-administered adrenaline and fluid resuscitation. Significant airway swelling necessitated ICU admission. Improved over 24 hours, extubated day 2.';
    }
  }
  // Trauma
  else if (category === 'trauma') {
    confirmedDiagnosis = 'Multi-system trauma, see imaging';
    treatmentInED = [
      'Primary and secondary trauma survey',
      'Whole-body CT (trauma series)',
      'Blood products if hypotensive',
      'Surgical consult',
    ];
    if (quality > 0.7) {
      disposition = 'theatre';
      dispositionLabel = 'To theatre for operative management';
      twentyFourHourOutcome = 'Identified injuries addressed surgically. Patient stable post-op, transferred to surgical ICU for monitoring. Good prognosis.';
    } else {
      disposition = 'icu';
      dispositionLabel = 'Admitted to trauma ICU';
      twentyFourHourOutcome = 'Haemodynamically unstable on arrival — required massive transfusion protocol. Stabilised in theatre. Prolonged ICU course anticipated.';
    }
  }
  // Diabetic emergency
  else if (sub.includes('dka') || sub.includes('diabetic') || sub.includes('hypogly')) {
    confirmedDiagnosis = sub.includes('dka') ? 'Diabetic ketoacidosis' : sub.includes('hhs') ? 'Hyperosmolar hyperglycaemic state' : 'Hypoglycaemia';
    treatmentInED = [
      'IV fluids and electrolyte correction',
      'Fixed-rate insulin infusion if DKA',
      'Hourly BGL and potassium monitoring',
    ];
    disposition = 'admitted';
    dispositionLabel = 'Admitted to endocrine unit';
    twentyFourHourOutcome = 'Responded to DKA protocol. Gap closed in 12 hours. Transitioned to subcut insulin. Diabetes education pre-discharge.';
  }
  // Default
  else {
    treatmentInED = [
      'Full set of bloods including FBC, U&E, CRP, lactate',
      'ECG and chest X-ray',
      'Targeted investigations based on presentation',
    ];
    disposition = 'admitted';
    dispositionLabel = 'Admitted for further workup';
    twentyFourHourOutcome = 'Stable overnight. Further investigations ongoing. Likely discharge within 24-48 hours depending on results.';
  }

  // Pre-alert feedback
  let preAlertImpact: EDOutcome['preAlertImpact'];
  let preAlertComment: string;
  if (transportPreAlert && (disposition === 'cath-lab' || disposition === 'stroke-unit' || disposition === 'theatre' || disposition === 'icu')) {
    preAlertImpact = 'helpful';
    preAlertComment = 'The pre-alert gave the receiving team time to prepare resources and activate the relevant pathway. This directly contributed to the time-critical outcome.';
  } else if (transportPreAlert) {
    preAlertImpact = 'neutral';
    preAlertComment = 'Pre-alert was placed appropriately, though the case turned out to be less time-critical than suspected. Better to pre-alert and find out than not to.';
  } else if (disposition === 'cath-lab' || disposition === 'stroke-unit' || disposition === 'theatre') {
    preAlertImpact = 'missed-opportunity';
    preAlertComment = 'No pre-alert was placed for a time-critical case. The receiving team had to mobilise resources on arrival, adding minutes to the time-to-treatment. Pre-alerts save lives in STEMI, stroke, and major trauma.';
  } else {
    preAlertImpact = 'neutral';
    preAlertComment = 'No pre-alert was needed for this presentation.';
  }

  // Suspicion accuracy
  let suspicionAccuracy: EDOutcome['suspicionAccuracy'];
  let suspicionComment: string;
  if (suspectedDiagnosis && actualDiagnosis.toLowerCase().includes(suspectedDiagnosis.toLowerCase())) {
    suspicionAccuracy = 'correct';
    suspicionComment = `Your working diagnosis matched the ED's final diagnosis. Your clinical reasoning was on point.`;
  } else if (suspectedDiagnosis) {
    suspicionAccuracy = 'partial';
    suspicionComment = `You suspected "${suspectedDiagnosis}" but the final diagnosis was "${actualDiagnosis}". Review the differential and what findings should have pointed you in the right direction.`;
  } else {
    suspicionAccuracy = 'partial';
    suspicionComment = `You didn't formally document a working diagnosis. In practice, this is what you communicate on the pre-alert and handover. Always have a leading hypothesis.`;
  }

  // Arrival handover template
  const arrivalHandover = `${caseData.patientInfo?.age}-year-old ${caseData.patientInfo?.gender}, ${caseData.dispatchInfo?.callReason}. On examination: ${caseData.initialPresentation?.generalImpression || 'see notes'}. Treatments given: ${appliedTreatmentIds.length > 0 ? appliedTreatmentIds.slice(0, 5).join(', ') : 'supportive care only'}. Current vitals as handover.`;

  const edAssessment = `ED assessment: ${confirmedDiagnosis}. Priority ${disposition === 'cath-lab' || disposition === 'stroke-unit' || disposition === 'theatre' ? '1 — immediate' : disposition === 'icu' ? '1 — critical care' : '2 — urgent'}. Team activated, investigations initiated.`;

  return {
    arrivalHandover,
    arrivalVitals,
    edAssessment,
    confirmedDiagnosis,
    treatmentInED,
    disposition,
    dispositionLabel,
    twentyFourHourOutcome,
    preAlertImpact,
    preAlertComment,
    suspicionAccuracy,
    suspicionComment,
  };
}
