/**
 * Medical Control Advisor
 *
 * Simulates a call to medical control / base hospital physician.
 * Provides context-aware clinical advice based on:
 * - Current vital signs
 * - Case presentation (category + subcategory, plus expected diagnosis)
 * - Treatments already applied
 * - Red flags / critical findings
 *
 * Every branch references specific vital values and treatments already given,
 * so the same case gives different advice as it evolves and different cases
 * never produce identical output.
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

// Small helper so we don't get repeated seeds within one call.
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function callMedicalControl(inputs: MedicalControlInputs): MedicalControlAdvice {
  const { caseData, currentVitals, appliedTreatmentIds, isInArrest } = inputs;

  const sub = (caseData.subcategory || '').toLowerCase();
  const category = (caseData.category || '').toLowerCase();
  const age = caseData.patientInfo?.age;
  const gender = caseData.patientInfo?.gender;
  const diagnosis = (caseData.expectedFindings?.mostLikelyDiagnosis || '').toLowerCase();
  const callReason = (caseData.dispatchInfo?.callReason || '').toLowerCase();
  // Union of everything we might want to match against
  const hay = `${sub} ${category} ${diagnosis} ${callReason}`;

  const spo2 = parseInt(String(currentVitals.spo2)) || 98;
  const hr = parseInt(String(currentVitals.pulse)) || 80;
  const rr = parseInt(String(currentVitals.respiration)) || 16;
  const gcs = parseInt(String(currentVitals.gcs)) || 15;
  const temp = currentVitals.temperature ?? 37;
  const bgl = typeof currentVitals.bloodGlucose === 'number' ? currentVitals.bloodGlucose : null;

  const bpParts = String(currentVitals.bp || '120/80').split('/');
  const sbp = parseInt(bpParts[0]) || 120;
  const dbp = parseInt(bpParts[1]) || 80;

  const has = (needle: string) => hay.includes(needle);
  const hasTx = (partial: string) => appliedTreatmentIds.some(id => id.includes(partial));
  const treatmentCount = appliedTreatmentIds.length;

  const recommendations: string[] = [];
  const authorizations: string[] = [];
  const redFlags: string[] = [];

  // ============================================================================
  // CASE-TYPE CLASSIFICATION (fix for old bug where stem-anterior didn't match)
  // ============================================================================
  const isSTEMI = has('stem') || has('stemi') || has('myocardial infarct');
  const isACS = isSTEMI || has('acs') || has('angina') || has('unstable');
  const isArrhythmia = has('afib') || has('aflutter') || has('svt') || has('junctional')
    || has('bradycard') || has('heart block') || has('heart-block') || has('wpw');
  const isArrest = isInArrest || has('arrest') || has('asystole') || has('vfib') || has('v-fib') || has('pea');
  const isHeartFailure = has('heart failure') || has('heart-failure') || has('chf') || has('pulmonary oedema') || has('pulmonary edema');
  const isHypertensiveEmergency = has('hypertensive') || (sbp >= 180 && (gcs < 15 || has('headache')));
  const isStroke = has('stroke') || has('cva') || has('tia');
  const isSeizure = has('seizure') || has('epilep') || has('status') || has('febrile');
  const isAsthma = has('asthma');
  const isCOPD = has('copd');
  const isPneumothorax = has('pneumothorax') || has('tension');
  const isPE = has('pulmonary embol') || has(' pe ') || diagnosis.includes('embolism');
  const isAnaphylaxis = has('anaphylaxis') || has('allergy') || has('allergic');
  const isDKA = has('dka') || has('ketoacid');
  const isHypoglycaemia = has('hypogly') || (bgl !== null && bgl < 4);
  const isSepsis = has('sepsis') || has('septic') || (temp > 38.5 && hr > 100 && rr > 22);
  const isMeningitis = has('meningitis');
  const isHeatStroke = has('heat') || temp >= 40;
  const isHypothermia = temp < 35;
  const isTrauma = category === 'trauma' || has('trauma') || has('mva') || has('fall') || has('gsw') || has('stab');
  const isHeadInjury = has('head injury') || has('head-injury') || has('tbi');
  const isChestTrauma = has('chest trauma') || has('chest-trauma') || has('flail');
  const isBurn = has('burn');
  const isObstetric = category === 'obstetric' || has('obstetric') || has('postpartum') || has('haemorrhage') && gender === 'female';
  const isPsych = has('psychosis') || has('psych') || has('suicid') || has('agitat');
  const isToxidrome = has('overdose') || has('poisoning') || has('organophosphate') || has('opioid') || has('toxic');
  const isMassCasualty = has('mass casualty') || has('mass-casualty') || has('mci');
  const isSyncope = has('syncope') || has('faint');

  // ============================================================================
  // BUILD CASE-SPECIFIC SITREP (different framing per category)
  // ============================================================================
  const patientDesc = age && gender ? `${age}-year-old ${gender}` : 'patient';
  const vitalSummary = `B P ${currentVitals.bp}, heart rate ${hr}, resps ${rr}, sats ${spo2} percent, G C S ${gcs}${temp < 36 || temp > 38 ? `, temp ${temp} degrees` : ''}${bgl !== null ? `, B G L ${bgl}` : ''}`;
  const treatmentSummary = treatmentCount === 0
    ? `Nothing given yet.`
    : treatmentCount <= 3
      ? `You've given ${appliedTreatmentIds.slice(0, 3).map(t => t.replace(/_/g, ' ')).join(', ')}.`
      : `You've given ${treatmentCount} interventions so far — most recently ${appliedTreatmentIds.slice(-2).map(t => t.replace(/_/g, ' ')).join(' and ')}.`;

  let sitrepFraming = `Alright, I've got you. You're on scene with a ${patientDesc}`;
  if (isArrest) sitrepFraming += `, and I'm hearing this is a cardiac arrest`;
  else if (isSTEMI) sitrepFraming += ` with a suspected S T E M I`;
  else if (isACS) sitrepFraming += ` with an acute coronary syndrome picture`;
  else if (isStroke) sitrepFraming += ` with a suspected stroke`;
  else if (isSeizure) sitrepFraming += ` with seizure activity`;
  else if (isAnaphylaxis) sitrepFraming += ` with suspected anaphylaxis`;
  else if (isAsthma) sitrepFraming += ` with an asthma presentation`;
  else if (isCOPD) sitrepFraming += ` with a C O P D exacerbation`;
  else if (isPneumothorax) sitrepFraming += ` with a suspected pneumothorax`;
  else if (isPE) sitrepFraming += ` with a suspected pulmonary embolism`;
  else if (isHeartFailure) sitrepFraming += ` with heart failure and pulmonary oedema`;
  else if (isDKA) sitrepFraming += ` with diabetic ketoacidosis`;
  else if (isHypoglycaemia) sitrepFraming += ` who's hypoglycaemic`;
  else if (isSepsis) sitrepFraming += ` who looks septic`;
  else if (isMeningitis) sitrepFraming += ` with a suspected meningitis picture`;
  else if (isMassCasualty) sitrepFraming += ` at a mass casualty incident`;
  else if (isBurn) sitrepFraming += ` with significant burns`;
  else if (isHeadInjury) sitrepFraming += ` with a head injury`;
  else if (isChestTrauma) sitrepFraming += ` with chest trauma`;
  else if (isTrauma) sitrepFraming += ` with trauma injuries`;
  else if (isObstetric) sitrepFraming += ` with an obstetric emergency`;
  else if (isPsych) sitrepFraming += ` with a psychiatric presentation`;
  else if (isToxidrome) sitrepFraming += ` with a suspected overdose`;
  else if (isHypertensiveEmergency) sitrepFraming += ` with a hypertensive emergency`;
  else if (isArrhythmia) sitrepFraming += ` with a cardiac dysrhythmia`;
  else if (isSyncope) sitrepFraming += ` post syncopal episode`;
  else if (isHeatStroke) sitrepFraming += ` with heat stroke`;
  else if (isHypothermia) sitrepFraming += ` who's hypothermic`;
  else sitrepFraming += ` — ${sub || category} presentation`;

  const sitrep = `${sitrepFraming}. Your numbers — ${vitalSummary}. ${treatmentSummary} Right, here's what I want you thinking about.`;

  // ============================================================================
  // CARDIAC ARREST
  // ============================================================================
  if (isArrest) {
    recommendations.push(`High-quality C P R — depth 5 to 6 centimetres, rate 100 to 120, full recoil, keep your pauses under 10 seconds.`);
    if (hasTx('intubation') || hasTx('igel') || hasTx('supraglottic')) {
      recommendations.push(`Airway's in — ventilate asynchronously at 10 per minute and confirm tube placement with waveform capno.`);
    } else {
      recommendations.push(`Get an advanced airway in as soon as you can — i-gel or E T tube, then ventilate at 10 per minute asynchronous.`);
    }
    if (!hasTx('adrenaline_1mg') && temp >= 30) {
      authorizations.push(`Adrenaline 1 milligram I V every 3 to 5 minutes — authorised.`);
    }
    if (!hasTx('amiodarone') && temp >= 30 && (has('vfib') || has('v-fib') || has('vt'))) {
      authorizations.push(`Amiodarone 300 milligrams I V after the third shock — authorised.`);
    }
    if (temp < 30) {
      redFlags.push(`Core temp is ${temp} degrees — withhold adrenaline and amiodarone entirely. Limit defibrillation to a maximum of 3 shocks until core temp is above 30. Warm and dead, not cold and dead.`);
      recommendations.push(`Active rewarming is your priority — warm I V fluids, heat packs to axillae and groin, wrap warm.`);
    }
    const isShockable = caseData.abcde?.circulation?.ecgFindings?.some(
      (f: string) => f.toLowerCase().includes('vf') || f.toLowerCase().includes('ventricular fibrillation') || f.toLowerCase().includes('pulseless vt')
    );
    if (isShockable && !hasTx('defibrillation')) {
      authorizations.push(`Defibrillate at 200 joules biphasic — authorised. Minimise peri-shock pause.`);
    }
    if (has('drowning') && !hasTx('ng_tube')) {
      recommendations.push(`Drowning patients swallow significant water — drop an N G or O G tube and decompress the stomach.`);
    }
    if (has('hyperkal') || has('renal')) {
      recommendations.push(`If you're thinking hyperkalaemia — calcium gluconate 10 millilitres of 10 percent I V plus sodium bicarbonate 50 millilitres of 8.4 percent.`);
    }
    recommendations.push(`Don't stop compressions for transport. Load and go with C P R in progress.`);
  }

  // ============================================================================
  // STEMI / ACS
  // ============================================================================
  else if (isSTEMI || isACS) {
    const wallLocation = has('anterior') ? 'anterior' : has('inferior') ? 'inferior' : has('lateral') ? 'lateral' : has('lbbb') ? 'L B B B-associated' : '';
    if (wallLocation) {
      recommendations.push(`If this is an ${wallLocation} S T E M I, ${has('inferior') ? 'get a right-sided E C G — V4R — to rule out right ventricular infarction. A right-sided M I will crash their blood pressure if you give nitrates or morphine.' : 'your aim is primary P C I under 90 minutes door-to-balloon.'}`);
    }
    if (!hasTx('aspirin')) {
      authorizations.push(`Aspirin 300 milligrams chewed — authorised unless true allergy.`);
    }
    if (sbp > 100 && !hasTx('gtn') && !(has('inferior') && !hasTx('fluid'))) {
      authorizations.push(`G T N 400 micrograms sub-lingual every 5 minutes, up to 3 doses — authorised as long as systolic stays above 100.`);
    } else if (sbp <= 100) {
      redFlags.push(`Systolic is ${sbp} — absolute hold on nitrates. You'll drop their preload and crash them. Think right ventricular infarction if this is an inferior.`);
    }
    if (!hasTx('morphine') && !hasTx('fentanyl')) {
      authorizations.push(`Morphine 2.5 to 5 milligrams I V for ongoing ischaemic pain — authorised. Titrate to effect.`);
    }
    if (!hasTx('ticagrelor') && !hasTx('clopidogrel')) {
      authorizations.push(`Ticagrelor 180 milligram loading dose per our P C I protocol — authorised once S T E M I is confirmed on 12-lead.`);
    }
    recommendations.push(`Repeat 12-lead every 10 minutes — catch any evolution. Pre-alert the cath lab now, not on arrival. Give them your E T A and the wall location.`);
    if (hr < 50 && has('inferior')) {
      redFlags.push(`Heart rate of ${hr} with an inferior picture — suspicious for A V nodal ischaemia. Have atropine ready, and withhold beta-blockers.`);
    }
  }

  // ============================================================================
  // ARRHYTHMIA (non-arrest)
  // ============================================================================
  else if (isArrhythmia) {
    if (has('svt') || has('afib') || has('aflutter')) {
      if (sbp < 90 || gcs < 14) {
        redFlags.push(`They're unstable — systolic ${sbp}, G C S ${gcs}. This is a synchronised cardioversion call, not a drug call.`);
        authorizations.push(`Synchronised cardioversion: 70 to 120 joules for S V T or atrial flutter, 120 to 200 for A fib — authorised. Sedate first if conscious.`);
      } else if (has('svt')) {
        recommendations.push(`Try vagal manoeuvres first — modified Valsalva with leg raise is your best bet.`);
        if (!hasTx('adenosine')) {
          authorizations.push(`Adenosine 6 milligrams rapid I V push with a saline flush, then 12, then 12 if no conversion — authorised.`);
        }
      } else {
        recommendations.push(`Rate control rather than rhythm — they're stable. Don't chemically cardiovert A fib in the field unless you know duration is under 48 hours.`);
      }
    }
    if (has('bradycard') || has('heart-block') || has('heart block') || hr < 50) {
      if (sbp < 90 || gcs < 14 || has('chest pain')) {
        redFlags.push(`Symptomatic bradycardia at ${hr} — intervene now.`);
        if (!hasTx('atropine') && !has('heart block') && !has('heart-block')) {
          authorizations.push(`Atropine 500 micrograms I V, repeat to a max of 3 milligrams — authorised.`);
        }
        if (has('heart block') || has('heart-block')) {
          redFlags.push(`If this is a 2nd degree Mobitz 2 or complete heart block, atropine likely won't work — go straight to transcutaneous pacing.`);
          authorizations.push(`Transcutaneous pacing at 70 per minute, capture threshold plus 10 percent — authorised. Sedate and analgese.`);
        }
      } else {
        recommendations.push(`Asymptomatic bradycardia at ${hr} — just monitor. Don't treat a number, treat the patient.`);
      }
    }
  }

  // ============================================================================
  // HEART FAILURE / PULMONARY OEDEMA
  // ============================================================================
  else if (isHeartFailure) {
    recommendations.push(`Sit them bolt upright, legs dependent. Gravity is your friend here.`);
    if (sbp > 140 && !hasTx('gtn')) {
      authorizations.push(`G T N infusion or sub-lingual 400 micrograms every 5 minutes — authorised. Your primary goal is afterload reduction, not diuresis.`);
    }
    if (spo2 < 92) {
      recommendations.push(`C P A P at 5 to 10 centimetres of water if you've got it — this is the single most effective thing you can do right now.`);
    }
    if (!hasTx('furosemide') && sbp > 100) {
      authorizations.push(`Furosemide 40 to 80 milligrams I V — authorised, though the nitrates are doing the heavy lifting.`);
    }
    if (sbp < 90) {
      redFlags.push(`Systolic ${sbp} with pulmonary oedema — this is cardiogenic shock, not standard A P O. No nitrates, no furosemide. Think inotropes and rapid transport.`);
    }
  }

  // ============================================================================
  // HYPERTENSIVE EMERGENCY
  // ============================================================================
  else if (isHypertensiveEmergency) {
    redFlags.push(`${sbp} over ${dbp} with end-organ signs — this is a true emergency, not just a high number.`);
    recommendations.push(`Drop the pressure by no more than 20 to 25 percent in the first hour — aggressive reduction causes watershed strokes.`);
    recommendations.push(`Keep them calm, dim lights, minimal stimulation. Anxiety alone can push the pressure higher.`);
    if (has('stroke') || has('headache')) {
      recommendations.push(`If this looks like a stroke or intracerebral haemorrhage, do not drop the pressure below 180 systolic — you'll extend the penumbra.`);
    }
  }

  // ============================================================================
  // STROKE
  // ============================================================================
  else if (isStroke) {
    recommendations.push(`Your number one job right now is confirming last known well time — that's the clock for thrombolysis eligibility.`);
    recommendations.push(`Check the B G L immediately — hypoglycaemia is a stroke mimic and is instantly reversible. You don't want to activate the stroke team for a sugar.`);
    if (bgl !== null && bgl < 3.5) {
      authorizations.push(`Dextrose 10 percent, 10 grams I V — authorised. Re-check the exam after correction.`);
    }
    recommendations.push(`F A S T positive, last known well, current G C S, and your E T A — that's your pre-alert. Do it now, don't wait.`);
    if (sbp > 185) {
      redFlags.push(`Systolic ${sbp} — they won't qualify for thrombolysis until below 185. Don't you try to drop it pre-hospital unless specifically authorised.`);
    }
    recommendations.push(`Nil by mouth. Head of bed at 30 degrees. Positional management matters more than people think.`);
  }

  // ============================================================================
  // SEIZURE / STATUS
  // ============================================================================
  else if (isSeizure) {
    if (!hasTx('midazolam') && !hasTx('diazepam')) {
      authorizations.push(`Midazolam 10 milligrams buccal or 5 milligrams I V for active seizure — authorised. If seizure continues at 5 minutes, repeat once.`);
    } else {
      recommendations.push(`You've already given a benzo — if they're still seizing at 10 minutes total, that's refractory status. Escalate, consider second-line.`);
    }
    recommendations.push(`Check the B G L — hypoglycaemia is one of the commonest reversible causes of seizure, don't miss it.`);
    if (gcs < 15) recommendations.push(`Post-ictal airway management — recovery position, suction ready, O P A once jaw relaxes.`);
    if (has('febrile')) {
      recommendations.push(`Febrile seizure — cool the child, paracetamol, and reassure the family. Most are self-limiting but you still want a hospital workup to rule out meningitis.`);
    }
  }

  // ============================================================================
  // ASTHMA
  // ============================================================================
  else if (isAsthma) {
    if (!hasTx('salbutamol')) {
      authorizations.push(`Salbutamol 5 milligrams nebulised, back-to-back — authorised.`);
    }
    if (!hasTx('ipratropium')) {
      authorizations.push(`Ipratropium 500 micrograms nebulised combined with salbutamol — authorised for moderate to severe.`);
    }
    if (!hasTx('hydrocortisone') && (rr > 25 || spo2 < 92)) {
      authorizations.push(`Hydrocortisone 200 milligrams I V — authorised. Steroids take 4 to 6 hours to work, give it early.`);
    }
    if (rr > 30 || spo2 < 88) {
      redFlags.push(`Resp rate ${rr}, sats ${spo2} — this is life-threatening. Silent chest is even worse, and means imminent arrest.`);
      if (!hasTx('magnesium')) {
        authorizations.push(`Magnesium sulfate 2 grams I V over 20 minutes — authorised for life-threatening asthma.`);
      }
      authorizations.push(`I M adrenaline 500 micrograms if they're crashing and nebs aren't getting through — authorised.`);
    }
    recommendations.push(`Sit them up, encourage slow breathing. Their own anxiety is making the bronchospasm worse.`);
  }

  // ============================================================================
  // COPD
  // ============================================================================
  else if (isCOPD) {
    recommendations.push(`Target sats 88 to 92 percent — don't over-oxygenate a chronic retainer, you'll knock out their hypoxic drive.`);
    if (!hasTx('salbutamol')) {
      authorizations.push(`Salbutamol 5 milligrams plus ipratropium 500 micrograms nebulised with air, not oxygen — authorised.`);
    }
    if (!hasTx('hydrocortisone')) {
      authorizations.push(`Hydrocortisone 200 milligrams I V — authorised.`);
    }
    if (rr > 28 || spo2 < 85) {
      recommendations.push(`They're tiring. If you've got B i P A P, now's the time. Otherwise plan for assisted ventilation on arrival.`);
    }
  }

  // ============================================================================
  // PNEUMOTHORAX
  // ============================================================================
  else if (isPneumothorax) {
    if (has('tension') || (sbp < 90 && rr > 28)) {
      redFlags.push(`This sounds like a tension pneumothorax — tracheal deviation, absent breath sounds, haemodynamic compromise. Don't wait for confirmation.`);
      authorizations.push(`Needle decompression, 2nd intercostal space mid-clavicular or 5th intercostal space anterior axillary line — authorised immediately. 14 gauge cannula.`);
    } else {
      recommendations.push(`High-flow oxygen, monitor for tension. Analgesia for pleuritic pain. Don't delay transport for a definitive intervention you can't do in the field.`);
    }
  }

  // ============================================================================
  // PULMONARY EMBOLISM
  // ============================================================================
  else if (isPE) {
    recommendations.push(`Classic picture — unexplained hypoxia, tachycardia, clear chest, pleuritic pain. Don't miss it just because the chest is clear.`);
    if (sbp < 90) {
      redFlags.push(`Hypotensive P E is massive P E — mortality is above 50 percent without intervention. Pre-alert the receiving hospital for thrombolysis or E C M O consideration.`);
      recommendations.push(`Cautious fluids — 250 millilitre boluses. Over-fill and you'll worsen R V strain.`);
    }
    recommendations.push(`High-flow oxygen, analgesia, rapid transport. They need C T pulmonary angiogram on arrival.`);
  }

  // ============================================================================
  // ANAPHYLAXIS
  // ============================================================================
  else if (isAnaphylaxis) {
    if (!hasTx('adrenaline_im')) {
      authorizations.push(`Adrenaline 500 micrograms I M into the anterolateral thigh — authorised. This is your first, second, and third intervention. Don't mess about with antihistamines first.`);
    } else {
      recommendations.push(`You've already given I M adrenaline — if symptoms haven't resolved by 5 minutes, give a second dose.`);
    }
    if (sbp < 90 && !hasTx('fluid_bolus')) {
      authorizations.push(`Normal saline 20 millilitres per kilogram wide open — authorised. They've got massive distributive shock.`);
    }
    if (!hasTx('chlorphenamine')) {
      authorizations.push(`Chlorphenamine 10 milligrams I V and hydrocortisone 200 milligrams I V as adjuncts — authorised, but only after adrenaline.`);
    }
    recommendations.push(`Lay them flat unless they can't breathe — upright worsens the distributive shock.`);
  }

  // ============================================================================
  // DKA
  // ============================================================================
  else if (isDKA) {
    authorizations.push(`Normal saline 1 litre over the first hour — authorised. Fluid is the single most important intervention.`);
    recommendations.push(`Don't give insulin pre-hospital unless your protocol specifically allows it — the hospital will start a fixed-rate insulin infusion once they've got bloods back.`);
    recommendations.push(`Watch for Kussmaul breathing — that's the compensation, don't try to slow it down.`);
    if (bgl !== null) {
      recommendations.push(`B G L is ${bgl}. The ketoacidosis is the problem, not just the sugar.`);
    }
  }

  // ============================================================================
  // HYPOGLYCAEMIA
  // ============================================================================
  else if (isHypoglycaemia) {
    redFlags.push(bgl !== null ? `B G L is ${bgl} — treat now.` : `Hypoglycaemia suspected — check the B G L and treat immediately.`);
    if (gcs >= 14) {
      authorizations.push(`Oral glucose 15 to 20 grams if they can swallow safely.`);
    } else {
      authorizations.push(`Dextrose 10 percent, 100 millilitres I V — authorised. Or glucagon 1 milligram I M if no I V access.`);
    }
    recommendations.push(`Re-check the B G L 10 minutes after treatment. If they're on a sulphonylurea or long-acting insulin, they need hospital observation regardless of recovery.`);
  }

  // ============================================================================
  // SEPSIS
  // ============================================================================
  else if (isSepsis) {
    recommendations.push(`Sepsis six — oxygen, blood cultures if you can, broad-spectrum antibiotics, I V fluids, lactate, and urine output. Pre-hospital you can cover three of those.`);
    if (!hasTx('fluid_bolus') && sbp < 100) {
      authorizations.push(`Normal saline 500 millilitres I V stat, repeat up to 30 millilitres per kilogram for hypotension — authorised.`);
    }
    recommendations.push(`Pre-alert the E D with the words "sepsis alert" — that triggers their one-hour bundle on arrival.`);
    if (temp < 36) {
      redFlags.push(`Temp ${temp} — hypothermic sepsis carries a worse prognosis than febrile sepsis. Don't be reassured by the normal-looking temp.`);
    }
  }

  // ============================================================================
  // MENINGITIS
  // ============================================================================
  else if (isMeningitis) {
    recommendations.push(`If you've got non-blanching rash, photophobia, neck stiffness, and fever — don't wait for confirmation.`);
    authorizations.push(`Benzylpenicillin 1.2 grams I M or I V pre-hospital — authorised, and save lives. Don't delay for a cannula if you can give it I M.`);
    recommendations.push(`Notify the receiving E D now — they'll need to isolate on arrival and start contact tracing.`);
    if (gcs < 13) redFlags.push(`Reduced G C S with meningitis suggests raised I C P or early brain herniation — head up, avoid hypoxia, avoid hypotension.`);
  }

  // ============================================================================
  // BURNS
  // ============================================================================
  else if (isBurn) {
    recommendations.push(`Stop the burning process — cool with running water for 20 minutes, not ice. Then cover with cling film, longitudinally, not circumferentially.`);
    recommendations.push(`Parkland: 2 to 4 millilitres per kilogram per percent total body surface area over 24 hours, half of that in the first 8 hours.`);
    authorizations.push(`Morphine titrated to pain — authorised. Burns are extraordinarily painful, don't under-treat.`);
    if (has('inhalation') || has('facial') || has('smoke')) {
      redFlags.push(`Facial burns or inhalational injury — airway oedema is progressive and will close them off. Early intubation is safer than late. Pre-alert for airway support.`);
    }
  }

  // ============================================================================
  // HEAD INJURY
  // ============================================================================
  else if (isHeadInjury) {
    if (gcs <= 8) {
      redFlags.push(`G C S of ${gcs} — they need a definitive airway. Prepare for R S I hand-over on arrival.`);
    }
    recommendations.push(`Avoid hypoxia and hypotension — those are the two secondary insults that kill head-injured patients. One episode of either doubles mortality.`);
    recommendations.push(`Head up 30 degrees, neutral neck position, keep sats above 94 percent and systolic above 110.`);
    if (has('pupil') || gcs <= 8) {
      recommendations.push(`Cushing's triad — hypertension, bradycardia, irregular respirations — means herniation. Consider hyperventilation as a bridging measure only.`);
    }
  }

  // ============================================================================
  // CHEST TRAUMA
  // ============================================================================
  else if (isChestTrauma) {
    recommendations.push(`Work through the lethal six — airway obstruction, tension pneumothorax, open pneumothorax, flail chest, massive haemothorax, cardiac tamponade.`);
    if (rr > 30 && sbp < 90) {
      redFlags.push(`Tachypnoeic and hypotensive after chest trauma — tension pneumothorax until proven otherwise. Decompress first, ask questions later.`);
    }
    recommendations.push(`Analgesia is essential — splinting from pain worsens ventilation. Fentanyl or morphine.`);
  }

  // ============================================================================
  // GENERAL TRAUMA
  // ============================================================================
  else if (isTrauma) {
    recommendations.push(`Primary survey: catastrophic haemorrhage, then A B C D E. Catastrophic haemorrhage comes before airway — tourniquets, haemostatic dressings, direct pressure.`);
    if (sbp < 90) {
      redFlags.push(`Systolic ${sbp} — permissive hypotension in trauma. Target 80 to 90 for penetrating, 90 to 100 for blunt. Don't chase a normal B P, you'll dilute the clot.`);
      if (!hasTx('tranexamic')) {
        authorizations.push(`Tranexamic acid 1 gram I V over 10 minutes if within 3 hours of injury — authorised.`);
      }
    }
    recommendations.push(`C-spine immobilisation for any mechanism with head, neck, or high-velocity involvement. Pelvic binder for suspicion of pelvic injury.`);
  }

  // ============================================================================
  // OBSTETRIC
  // ============================================================================
  else if (isObstetric) {
    recommendations.push(`Left lateral tilt to relieve aortocaval compression — hypotension in a pregnant patient is almost always positional.`);
    if (has('haemorrhage') || has('postpartum')) {
      recommendations.push(`Postpartum haemorrhage — fundal massage, ensure placenta is delivered, then consider oxytocin 10 units I M.`);
      authorizations.push(`Tranexamic acid 1 gram I V — authorised for obstetric haemorrhage.`);
    }
    if (has('eclamps') || (sbp > 160 && has('pregnan'))) {
      authorizations.push(`Magnesium sulfate 4 grams I V over 5 minutes for eclampsia — authorised. This is your first-line for seizure in a pregnant patient, not midazolam.`);
    }
    recommendations.push(`Pre-alert obstetric team, not just the E D — they need to mobilise separately.`);
  }

  // ============================================================================
  // HEAT STROKE
  // ============================================================================
  else if (isHeatStroke) {
    redFlags.push(`Core temperature above 40 with altered mental status — this is heat stroke, not heat exhaustion. It's a true emergency.`);
    recommendations.push(`Rapid active cooling — ice packs to axillae, groin, neck. Cold water immersion if you've got it. Every minute matters.`);
    recommendations.push(`Target core temp under 39 within 30 minutes. Stop cooling at 38.5 to avoid overshoot hypothermia.`);
    recommendations.push(`Don't give paracetamol or aspirin — they don't work, heat stroke isn't a cytokine-mediated fever.`);
  }

  // ============================================================================
  // HYPOTHERMIA (non-arrest)
  // ============================================================================
  else if (isHypothermia) {
    redFlags.push(`Core temperature ${temp} degrees — significant hypothermia. Handle gently, rough movement can precipitate V F.`);
    recommendations.push(`Remove wet clothing, warm blankets, warmed I V fluids at 40 degrees, heat packs to axillae and groin.`);
    if (temp < 30) {
      redFlags.push(`Below 30 degrees, drug metabolism is severely impaired — withhold all medications.`);
      recommendations.push(`Bradycardia below 30 degrees is protective — do not treat with atropine. The heart is working exactly as it should.`);
    }
  }

  // ============================================================================
  // SYNCOPE
  // ============================================================================
  else if (isSyncope) {
    recommendations.push(`Get a 12-lead — long Q T, Brugada, H C M, W P W. Don't miss a cardiac cause hiding as "vasovagal".`);
    recommendations.push(`Postural B P — lying and standing. Orthostatic drop above 20 systolic is significant.`);
    recommendations.push(`Syncope with chest pain, syncope on exertion, or syncope with family history of sudden death — all high-risk, all need cardiac workup.`);
  }

  // ============================================================================
  // TOXIDROME / OVERDOSE
  // ============================================================================
  else if (isToxidrome) {
    if (has('opioid') || has('heroin')) {
      if (!hasTx('naloxone')) {
        authorizations.push(`Naloxone 400 micrograms I V or I M, titrated to respiratory rate not consciousness — authorised. Aim to reverse the hypoventilation, not the opioid effect.`);
      }
    }
    if (has('organophosphate')) {
      redFlags.push(`Organophosphate poisoning — S L U D G E, salivation, lacrimation, urination, defecation, G I distress, emesis. This kills via respiratory failure.`);
      authorizations.push(`Atropine 1 to 2 milligrams I V, doubling every 5 minutes until secretions dry — authorised. You may need enormous doses, don't be shy.`);
      recommendations.push(`Decontaminate yourselves and the patient — this is absorbed through skin. P P E on now.`);
    }
    if (has('benzo') || has('sedative')) {
      recommendations.push(`Supportive care — airway, breathing, circulation. Flumazenil is rarely indicated pre-hospital, it can precipitate seizures in polydrug overdoses.`);
    }
    if (has('tricyclic') || has('tca')) {
      redFlags.push(`T C A overdose — watch the Q R S. Above 100 milliseconds, give sodium bicarbonate. Wide complex tachycardia is pre-arrest.`);
    }
    recommendations.push(`Bring the empty packets, bottles, anything you can find — the E D needs to know what and how much.`);
  }

  // ============================================================================
  // PSYCHIATRIC
  // ============================================================================
  else if (isPsych) {
    recommendations.push(`Rule out the medical causes first — hypoglycaemia, hypoxia, head injury, sepsis, intoxication. "Acute psychosis" is a diagnosis of exclusion pre-hospital.`);
    recommendations.push(`Verbal de-escalation is your first tool. Respect personal space, calm voice, no sudden movements.`);
    if (has('agitat') || has('violent')) {
      authorizations.push(`Midazolam 5 to 10 milligrams I M for severe agitation — authorised, but only after verbal de-escalation and with safety team support.`);
    }
    recommendations.push(`Document capacity assessment. Mental Health Act section may be needed for involuntary transport.`);
  }

  // ============================================================================
  // MASS CASUALTY
  // ============================================================================
  else if (isMassCasualty) {
    recommendations.push(`Triage first, treat second — S T A R T or J u m p S T A R T for paediatrics. Red, yellow, green, black. Don't get tunnel vision on one patient.`);
    recommendations.push(`Establish incident command, request resources early, and don't move uninjured until they've been triaged.`);
    redFlags.push(`Scene safety is paramount — secondary devices, unstable structures, hostile actors. You can't help anyone if you become a casualty.`);
  }

  // ============================================================================
  // LOW GCS (applies on top of other blocks)
  // ============================================================================
  if (gcs <= 8 && !isArrest) {
    redFlags.push(`G C S of ${gcs} — airway is at risk. Definitive airway management is on the table if you're more than a few minutes out.`);
  }

  // ============================================================================
  // FALLBACK: vitals-driven generic advice (never hits if any branch above did)
  // ============================================================================
  if (recommendations.length === 0 && authorizations.length === 0 && redFlags.length === 0) {
    if (spo2 < 94) recommendations.push(`Sats of ${spo2} — get oxygen on and titrate to above 94.`);
    if (hr > 120) recommendations.push(`Tachycardic at ${hr} — work out why. Pain, fever, dehydration, hypoxia, haemorrhage, sepsis — it's never "just anxiety".`);
    if (sbp < 90) recommendations.push(`Hypotensive at ${sbp} — I V access, cautious fluids, and work backwards from the shock aetiology.`);
    if (rr > 24 || rr < 10) recommendations.push(`Resp rate ${rr} — abnormal respirations are the first sign of deterioration. Don't ignore them.`);
    if (recommendations.length === 0) {
      recommendations.push(`Vitals are stable. Complete your primary survey, document a full set of baseline obs, and reassess every 5 minutes during transport.`);
      recommendations.push(`Keep a low threshold for serial 12-leads and glucose checks — the diagnosis may evolve.`);
    }
  }

  // ============================================================================
  // CASE-TYPE-AWARE GREETINGS AND SIGN-OFFS
  // ============================================================================
  // A handful of greetings that match the tone of the case so two different
  // cases don't open identically.
  const genericGreetings = [
    'Dr. Al Mansouri here, go ahead with your patient.',
    'Medical control, this is Dr. Al Mansouri. What have you got for me?',
    'Go ahead paramedic, I\'m listening.',
    'This is base, go ahead with your sit rep.',
    'Medical control on the line. Tell me about your patient.',
  ];
  const criticalGreetings = [
    'This is Dr. Al Mansouri, go ahead. I\'m hearing this is time-critical.',
    'Medical control, go ahead fast. What do you need?',
    'Al Mansouri here — I\'m ready, give me the sitrep.',
  ];
  const arrestGreetings = [
    'This is Al Mansouri. I\'m hearing arrest — talk me through it.',
    'Medical control. You\'re in an arrest? Go ahead, I\'m with you.',
  ];

  const isCritical = isArrest || isSTEMI || isStroke || isAnaphylaxis || sbp < 90 || spo2 < 88 || gcs <= 8;
  const greeting = isArrest
    ? pick(arrestGreetings)
    : isCritical
      ? pick(criticalGreetings)
      : pick(genericGreetings);

  const arrestSignOffs = [
    'Don\'t stop C P R. Call me back on arrival or if you get R O S C.',
    'Keep compressions going. I\'ll alert the cardiac team. Good luck.',
  ];
  const criticalSignOffs = [
    'I\'m alerting the receiving team now. Drive fast, drive safe. Call back on arrival.',
    'We\'ll have the pathway activated by the time you arrive. Don\'t hesitate to call if you need more orders.',
    'Copy. Pre-alert placed on my end. Focus on the patient, we\'ve got it from here.',
  ];
  const stableSignOffs = [
    'Keep me updated with any changes. Good luck out there.',
    'Call back if the patient deteriorates, or if you need additional orders.',
    'Good work. Drive safe. We\'re standing by if you need us.',
    'Alright, you\'ve got this. Call me back if anything changes.',
  ];

  const signOff = isArrest
    ? pick(arrestSignOffs)
    : isCritical
      ? pick(criticalSignOffs)
      : pick(stableSignOffs);

  return {
    greeting,
    sitrep,
    recommendations,
    authorizations,
    redFlags,
    signOff,
  };
}
