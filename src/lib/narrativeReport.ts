/**
 * Narrative Report Generator
 *
 * Produces an AI-style personalised narrative debrief from the student's
 * simulation timeline. Template-based — no external API calls required.
 *
 * Analyses:
 * - Assessment completeness and timing
 * - Treatment appropriateness and order
 * - Time-to-critical-actions (e.g., CPR start, defibrillation, oxygen)
 * - Vital sign trajectory (did the patient improve?)
 * - Critical omissions
 *
 * Output structure mirrors Body Interact's AI report:
 * - What went well
 * - Critical timing observations
 * - Patterns to develop
 */

import type { CaseScenario, AppliedTreatment, VitalSigns } from '@/types';

export interface NarrativeReport {
  summary: string;           // 2-3 sentence overall summary
  whatWentWell: string[];    // Positive observations (bullet points)
  timingObservations: string[]; // Critical timing notes
  patternsToImprove: string[];  // Development areas
  clinicalVerdict: 'excellent' | 'good' | 'acceptable' | 'needs-work';
}

interface NarrativeInputs {
  caseData: CaseScenario;
  appliedTreatments: AppliedTreatment[];
  appliedTreatmentIds: string[];
  vitalsHistory: VitalSigns[];
  caseStartTime: number | null;
  assessmentPerformedIds: string[];
  transportDecision: 'transport' | 'end' | null;
  totalScore: number;  // 0-100
}

export function generateNarrativeReport(inputs: NarrativeInputs): NarrativeReport {
  const {
    caseData, appliedTreatments, appliedTreatmentIds, vitalsHistory,
    caseStartTime, assessmentPerformedIds, transportDecision, totalScore,
  } = inputs;

  const whatWentWell: string[] = [];
  const timingObservations: string[] = [];
  const patternsToImprove: string[] = [];

  const sub = (caseData.subcategory || '').toLowerCase();
  const isArrest = sub.includes('arrest') || sub.includes('vfib') || sub.includes('asystole')
    || appliedTreatmentIds.includes('cpr');
  const isHypothermia = (caseData.vitalSignsProgression?.initial?.temperature ?? 37) < 30;
  const isRespiratory = caseData.category === 'respiratory';
  const isCardiac = caseData.category === 'cardiac' && !isArrest;
  const isTrauma = caseData.category === 'trauma';
  const isStroke = sub.includes('stroke');
  const isAnaphylaxis = sub.includes('anaphylaxis');

  // ============================================================================
  // ASSESSMENT COMPLETENESS
  // ============================================================================
  const primarySteps = ['scene-safety', 'airway', 'breathing', 'circulation', 'disability', 'exposure'];
  const primaryCompleted = primarySteps.filter(s => assessmentPerformedIds.includes(s));
  const abcdeComplete = primaryCompleted.length === primarySteps.length;

  if (abcdeComplete) {
    whatWentWell.push('Completed a full ABCDE primary survey — this systematic approach is the foundation of every case.');
  } else {
    const missing = primarySteps.filter(s => !primaryCompleted.includes(s));
    patternsToImprove.push(`Primary survey was incomplete — missed ${missing.map(s => s.replace('-', ' ')).join(', ')}. Always complete ABCDE before moving to interventions.`);
  }

  const historySteps = ['signs-symptoms', 'allergies', 'medications', 'past-medical', 'last-meal', 'events-leading'];
  const historyCompleted = historySteps.filter(s => assessmentPerformedIds.includes(s));
  if (historyCompleted.length >= 5) {
    whatWentWell.push('Took a thorough SAMPLE history — this gives you the context you need for safe medication decisions.');
  } else if (historyCompleted.length < 3) {
    patternsToImprove.push('SAMPLE history was thin. Allergies and current medications are especially important before giving any drug.');
  }

  // ============================================================================
  // TIMING ANALYSIS
  // ============================================================================
  const firstTxTime = appliedTreatments.length > 0 && caseStartTime
    ? Math.round((new Date(appliedTreatments[0].appliedAt).getTime() - caseStartTime) / 1000)
    : null;

  if (firstTxTime !== null) {
    if (firstTxTime <= 60) {
      timingObservations.push(`First intervention delivered at ${formatTime(firstTxTime)} — excellent rapid response under one minute.`);
    } else if (firstTxTime <= 180) {
      timingObservations.push(`First intervention at ${formatTime(firstTxTime)} — within the acceptable window for most cases.`);
    } else {
      timingObservations.push(`First intervention at ${formatTime(firstTxTime)} — this is slow. For critical patients, aim for the first life-saving action within 60 seconds of confirming the problem.`);
    }
  } else {
    patternsToImprove.push('No treatments were applied. Even a stable patient benefits from oxygen, IV access, and reassessment.');
  }

  // Time to CPR in cardiac arrest
  if (isArrest) {
    const cprTx = appliedTreatments.find(t => t.id === 'cpr');
    if (cprTx && caseStartTime) {
      const cprTime = Math.round((new Date(cprTx.appliedAt).getTime() - caseStartTime) / 1000);
      if (cprTime <= 30) {
        timingObservations.push(`CPR started at ${formatTime(cprTime)} — outstanding. Every second without compressions drops survival.`);
      } else if (cprTime <= 60) {
        timingObservations.push(`CPR started at ${formatTime(cprTime)} — acceptable but aim for under 30 seconds from arrest recognition.`);
      } else {
        timingObservations.push(`CPR not started until ${formatTime(cprTime)} — this is a significant delay in an arrest. Recognise arrest and start compressions immediately.`);
      }
    } else {
      patternsToImprove.push('CPR was not documented in this arrest case. Chest compressions are the single most important intervention in cardiac arrest.');
    }

    const defibTx = appliedTreatments.find(t => t.id === 'defibrillation');
    const isShockable = caseData.abcde?.circulation?.ecgFindings?.some(
      (f: string) => f.toLowerCase().includes('vf') || f.toLowerCase().includes('ventricular fibrillation') || f.toLowerCase().includes('vt')
    );
    if (isShockable) {
      if (defibTx && caseStartTime) {
        const defibTime = Math.round((new Date(defibTx.appliedAt).getTime() - caseStartTime) / 1000);
        if (defibTime <= 120) {
          timingObservations.push(`Defibrillation delivered at ${formatTime(defibTime)} — within the target window for shockable rhythm.`);
        } else {
          timingObservations.push(`Defibrillation delayed until ${formatTime(defibTime)}. For VF/VT, every minute without a shock drops survival by ~10%.`);
        }
      } else {
        patternsToImprove.push('Shockable rhythm was not defibrillated. In VF/VT, defibrillation is the definitive treatment — CPR alone will not convert the rhythm.');
      }
    }
  }

  // ============================================================================
  // CASE-SPECIFIC OBSERVATIONS
  // ============================================================================
  if (isRespiratory) {
    const o2 = appliedTreatmentIds.includes('oxygen_15l') || appliedTreatmentIds.includes('oxygen_6l') || appliedTreatmentIds.includes('bvm_ventilation');
    if (o2) whatWentWell.push('Applied supplemental oxygen early — correct first move in respiratory distress.');
    else patternsToImprove.push('No supplemental oxygen was given in a respiratory case. Oxygen is always your first intervention when SpO2 is low.');

    if (sub.includes('asthma') || sub.includes('copd')) {
      const bronchodilator = appliedTreatmentIds.some(id => id.includes('salbutamol') || id.includes('ipratropium') || id.includes('nebuliser'));
      if (bronchodilator) whatWentWell.push('Recognised the bronchospasm and treated with bronchodilator.');
      else patternsToImprove.push('In an obstructive airway disease, salbutamol is the first-line bronchodilator — reach for it early.');
    }
  }

  if (isCardiac) {
    if (sub.includes('stemi') || sub.includes('acs')) {
      const aspirin = appliedTreatmentIds.some(id => id.includes('aspirin'));
      const gtn = appliedTreatmentIds.some(id => id.includes('gtn') || id.includes('nitroglycerin'));
      if (aspirin) whatWentWell.push('Gave aspirin — appropriate antiplatelet for suspected ACS.');
      else patternsToImprove.push('Aspirin is the standard-of-care antiplatelet for suspected ACS. 300mg chewed.');
      if (gtn) whatWentWell.push('Used GTN for chest pain — appropriate if blood pressure allows.');
    }
  }

  if (isStroke) {
    const bgl = assessmentPerformedIds.includes('blood-glucose');
    const strokeScreen = assessmentPerformedIds.includes('stroke-screen');
    if (bgl) whatWentWell.push('Checked blood glucose — hypoglycaemia is a stroke mimic that you must rule out.');
    else patternsToImprove.push('Always check BGL in suspected stroke — hypoglycaemia can mimic a stroke perfectly and is immediately reversible.');
    if (strokeScreen) whatWentWell.push('Performed a FAST/NIHSS stroke screen — critical for pre-alert and destination selection.');
  }

  if (isAnaphylaxis) {
    const adrenalineIM = appliedTreatmentIds.some(id => id.includes('adrenaline_im'));
    if (adrenalineIM) whatWentWell.push('Gave IM adrenaline — this is the single life-saving intervention in anaphylaxis. Well done.');
    else patternsToImprove.push('IM adrenaline is the ONLY intervention that reliably saves lives in anaphylaxis. Give it first, before antihistamines or steroids.');
  }

  if (isHypothermia) {
    const medsGiven = appliedTreatments.some(t => t.id.includes('adrenaline') || t.id.includes('amiodarone'));
    if (!medsGiven) {
      whatWentWell.push('Correctly withheld medications in severe hypothermia — drug metabolism is impaired below 30°C and meds can accumulate to toxic levels.');
    } else {
      patternsToImprove.push('Avoid giving medications in severe hypothermia (<30°C). The drug metabolism is so slow that doses accumulate — rewarming is the treatment, not drugs.');
    }
    const rewarming = appliedTreatmentIds.some(id => id.includes('warm') || id.includes('blanket'));
    if (rewarming) whatWentWell.push('Initiated active rewarming — this is the definitive treatment for hypothermia.');
  }

  if (isTrauma) {
    const cSpine = assessmentPerformedIds.includes('neck-cspine');
    if (cSpine) whatWentWell.push('Checked the C-spine — essential in any mechanism with potential head or neck injury.');
  }

  // ============================================================================
  // VITAL SIGN TRAJECTORY
  // ============================================================================
  if (vitalsHistory.length >= 2) {
    const first = vitalsHistory[0];
    const last = vitalsHistory[vitalsHistory.length - 1];
    const firstSpo2 = parseInt(String(first.spo2)) || 0;
    const lastSpo2 = parseInt(String(last.spo2)) || 0;
    const firstHR = parseInt(String(first.pulse)) || 0;
    const lastHR = parseInt(String(last.pulse)) || 0;

    if (firstSpo2 < 94 && lastSpo2 >= 94) {
      whatWentWell.push(`Brought SpO2 up from ${firstSpo2}% to ${lastSpo2}% — your interventions worked.`);
    } else if (lastSpo2 < 90 && lastSpo2 > 0) {
      timingObservations.push(`Final SpO2 was ${lastSpo2}% — the patient was still hypoxic at handover. Re-evaluate your airway and oxygen delivery.`);
    }

    if (firstHR > 120 && lastHR < 110 && lastHR > 0) {
      whatWentWell.push(`Heart rate came down from ${firstHR} to ${lastHR} bpm — the patient is responding.`);
    }
  }

  // ============================================================================
  // TRANSPORT DECISION
  // ============================================================================
  if (transportDecision === 'transport') {
    whatWentWell.push('Made the decision to transport — the right call when you\'ve done what you can on scene and the patient needs definitive care.');
  }

  // ============================================================================
  // OVERALL VERDICT & SUMMARY
  // ============================================================================
  let verdict: NarrativeReport['clinicalVerdict'];
  let summary: string;
  if (totalScore >= 85) {
    verdict = 'excellent';
    summary = `Excellent performance on this ${caseData.category} case. You worked through the assessment methodically and your interventions matched the clinical picture. This is the kind of run you'd want on a real job.`;
  } else if (totalScore >= 70) {
    verdict = 'good';
    summary = `Solid performance. You caught most of the important actions and the patient trajectory reflected your work. A few refinements in timing or assessment order will take this from good to excellent.`;
  } else if (totalScore >= 50) {
    verdict = 'acceptable';
    summary = `Acceptable performance — the core elements were there but several critical actions were missed or delayed. Focus on completing your ABCDE every time before intervening, and on faster recognition of the life-threat.`;
  } else {
    verdict = 'needs-work';
    summary = `This case needs review. Several critical actions were missed and the patient would have deteriorated further without intervention. Work through the ABCDE framework deliberately and read the case debrief carefully before your next attempt.`;
  }

  // Fill out bullets if they're sparse
  if (whatWentWell.length === 0) {
    whatWentWell.push('You engaged with the simulator and saw the case through — every run is a learning opportunity.');
  }
  if (patternsToImprove.length === 0 && verdict !== 'excellent') {
    patternsToImprove.push('Review the debriefing resources below for the guideline-level approach to this presentation.');
  }
  if (timingObservations.length === 0) {
    timingObservations.push('Continue building a habit of timed, deliberate interventions — speed and accuracy both matter in prehospital care.');
  }

  return {
    summary,
    whatWentWell,
    timingObservations,
    patternsToImprove,
    clinicalVerdict: verdict,
  };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
