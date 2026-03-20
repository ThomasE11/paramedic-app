/**
 * Severity Variant Cases
 *
 * Cases that demonstrate the same condition at different severity levels.
 * These integrate with the treatmentProtocols.ts severity-aware engine
 * to provide realistic differential responses to treatment combinations.
 *
 * Key principle: treatment response varies based on severity AND the combination
 * of treatments applied — not just the individual medication.
 */

import type { CaseScenario } from '@/types';

const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

// ============================================================================
// ASTHMA SEVERITY VARIANTS
// ============================================================================

export const asthmaSeverityCases: CaseScenario[] = [
  // --- MILD ASTHMA ---
  createCase({
    id: 'asthma-mild-001',
    title: 'Mild Asthma Exacerbation',
    category: 'respiratory',
    subcategory: 'asthma',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year', '2nd-year', '3rd-year'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: 'Difficulty breathing, asthma attack',
      timeOfDay: 'afternoon',
      location: 'University campus clinic, Sharjah',
      callerInfo: 'Campus nurse',
      dispatchCode: 'Bravo-2',
      additionalInfo: ['Student with known asthma', 'Used salbutamol MDI without complete relief'],
    },
    patientInfo: {
      age: 19,
      gender: 'female',
      weight: 55,
      occupation: 'University student',
      language: 'English, Arabic',
    },
    sceneInfo: {
      description: 'Campus clinic room, patient sitting on examination table, mildly distressed',
      hazards: [],
      bystanders: 'Campus nurse present',
      environment: 'Air-conditioned, clean environment',
      accessIssues: [],
      extricationNeeded: false,
    },
    initialPresentation: {
      generalImpression: 'Young female, able to speak in full sentences, mild wheeze audible',
      position: 'Sitting upright',
      appearance: 'Slightly anxious, mild increased work of breathing',
      consciousness: 'Alert and oriented',
      sounds: ['Mild expiratory wheeze'],
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'No stridor', 'Speaking in full sentences'],
        interventions: [],
        adjunctsNeeded: [],
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Adequate',
        spo2: 95,
        findings: ['Mild bilateral wheeze', 'No accessory muscle use', 'Expiratory phase slightly prolonged'],
        interventions: ['Salbutamol nebulizer', 'Low-flow O2 if SpO2 <94%'],
        auscultation: ['Bilateral expiratory wheeze', 'Good air entry throughout', 'No crackles'],
      },
      circulation: {
        pulseRate: 92,
        pulseQuality: 'Regular, good volume',
        bp: { systolic: 120, diastolic: 75 },
        capillaryRefill: 2,
        skin: 'Warm, slightly clammy',
        findings: ['Mildly tachycardic from beta-agonist use', 'Well perfused'],
        interventions: [],
        ecgFindings: ['Sinus tachycardia'],
        ivAccess: [],
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.8,
        findings: ['No neurological deficits'],
        interventions: [],
      },
      exposure: {
        temperature: 36.6,
        findings: ['No rash', 'No signs of allergic reaction'],
        interventions: [],
      },
    },
    vitalSignsProgression: {
      initial: { pulse: 92, respiration: 20, spo2: 95, bp: '120/75', gcs: 15, temperature: 36.6 },
      withTreatment: { pulse: 78, respiration: 16, spo2: 98, bp: '115/72', gcs: 15, temperature: 36.6 },
      withoutTreatment: { pulse: 105, respiration: 24, spo2: 92, bp: '125/80', gcs: 15, temperature: 36.6 },
    },
    history: {
      chiefComplaint: 'Wheezing and shortness of breath for 2 hours',
      historyOfPresentIllness: 'Developed wheeze after exposure to dust during outdoor PE class. Used salbutamol MDI 2 puffs x2 with partial relief. No previous hospital admissions for asthma.',
      medications: ['Salbutamol MDI PRN', 'Beclomethasone 200mcg BD (poor compliance)'],
      allergies: ['Dust', 'Cats'],
      medicalConditions: ['Mild intermittent asthma since childhood', 'Eczema'],
      surgicalHistory: [],
      lastMeal: 'Lunch 3 hours ago',
      events: 'Exercised outdoors in dusty conditions',
    },
    expectedFindings: {
      keyObservations: ['Mild asthma exacerbation', 'Able to speak in full sentences', 'Good response expected to salbutamol nebulizer'],
      redFlags: ['Monitor for worsening despite treatment', 'Check compliance with preventer inhaler'],
      differentialDiagnoses: ['Mild asthma exacerbation', 'Exercise-induced bronchospasm', 'Viral wheeze'],
      mostLikelyDiagnosis: 'Mild Asthma Exacerbation',
    },
    treatmentOptions: {
      medications: ['Salbutamol 5mg nebulized (oxygen-driven)', 'Consider ipratropium if poor response'],
      procedures: ['Peak flow measurement', 'SpO2 monitoring'],
      positioning: ['Upright / Fowler\'s position'],
    },
    studentChecklist: [
      { id: 'am1', category: 'abcde', description: 'Recognise mild asthma exacerbation', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'am2', category: 'intervention', description: 'Position patient upright', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'am3', category: 'intervention', description: 'Administer salbutamol nebulizer', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'am4', category: 'intervention', description: 'Monitor SpO2 and reassess after nebulizer', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'am5', category: 'communication', description: 'Reassure patient and discuss inhaler technique', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
    ],
    teachingPoints: [
      'Mild asthma: able to speak in sentences, SpO2 >94%, mild wheeze, no accessory muscle use',
      'First-line treatment: nebulised salbutamol 5mg driven by O2 at 6-8L/min',
      'Upright positioning optimises diaphragm excursion and nebuliser delivery',
      'Check inhaler technique and preventer compliance — most exacerbations relate to poor adherence',
      'Peak flow measurement helps classify severity — >75% predicted = mild',
      'Single nebuliser may suffice for mild exacerbation — reassess after 15-20 minutes',
    ],
    commonPitfalls: [
      'Discharging without observing post-nebuliser response for 15-20 minutes',
      'Not checking preventer inhaler adherence — the most common cause of exacerbations',
      'Failing to provide a written asthma action plan on discharge',
      'Over-treating mild asthma with IV medications or aggressive interventions',
      'Not assessing peak flow before and after treatment to document response',
    ],
  }),

  // --- MODERATE ASTHMA ---
  createCase({
    id: 'asthma-mod-001',
    title: 'Moderate Asthma Exacerbation',
    category: 'respiratory',
    subcategory: 'asthma',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Asthma attack, struggling to breathe, not responding to inhalers',
      timeOfDay: 'night',
      location: 'Apartment in Dubai Marina',
      callerInfo: 'Patient\'s partner',
      dispatchCode: 'Bravo-1',
      additionalInfo: ['Known asthmatic', 'Has been using blue inhaler repeatedly', 'Getting worse over 4 hours'],
    },
    patientInfo: {
      age: 28,
      gender: 'male',
      weight: 72,
      occupation: 'IT consultant',
      language: 'English',
    },
    sceneInfo: {
      description: 'Bedroom in apartment, patient sitting on bed leaning forward, using accessory muscles',
      hazards: ['Cat visible in apartment — potential trigger'],
      bystanders: 'Partner present, anxious',
      environment: 'Air-conditioned apartment, cat in room',
      accessIssues: ['High-rise apartment, elevator access'],
      extricationNeeded: false,
    },
    initialPresentation: {
      generalImpression: 'Young adult male, moderate respiratory distress, speaking in short phrases',
      position: 'Sitting upright, leaning forward, tripod position',
      appearance: 'Anxious, using accessory muscles, slightly clammy',
      consciousness: 'Alert and oriented',
      sounds: ['Audible wheeze on expiration', 'Speaking in phrases'],
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking in short phrases only'],
        interventions: [],
        adjunctsNeeded: [],
      },
      breathing: {
        rate: 26,
        rhythm: 'Regular',
        depth: 'Moderate',
        spo2: 91,
        findings: ['Significant bilateral wheeze', 'Accessory muscle use — SCM and intercostals', 'Prolonged expiratory phase', 'Intercostal recession'],
        interventions: ['Salbutamol nebulizer 5mg', 'Ipratropium nebulizer 500mcg', 'High-flow oxygen 15L/min NRB'],
        auscultation: ['Polyphonic expiratory wheeze bilaterally', 'Reduced air entry at bases', 'No crackles'],
      },
      circulation: {
        pulseRate: 112,
        pulseQuality: 'Regular, bounding',
        bp: { systolic: 135, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Warm, clammy, mild pallor',
        findings: ['Tachycardic', 'Pulsus paradoxus noted'],
        interventions: ['IV access'],
        ecgFindings: ['Sinus tachycardia'],
        ivAccess: [],
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 6.2,
        findings: ['Anxious but no neurological deficits'],
        interventions: [],
      },
      exposure: {
        temperature: 36.8,
        findings: ['No rash'],
        interventions: [],
      },
    },
    vitalSignsProgression: {
      initial: { pulse: 112, respiration: 26, spo2: 91, bp: '135/85', gcs: 15, temperature: 36.8 },
      withTreatment: { pulse: 88, respiration: 18, spo2: 96, bp: '120/75', gcs: 15, temperature: 36.8 },
      withoutTreatment: { pulse: 135, respiration: 34, spo2: 84, bp: '140/90', gcs: 14, temperature: 36.8 },
    },
    history: {
      chiefComplaint: 'Worsening wheeze and breathlessness over 4 hours',
      historyOfPresentIllness: 'Gradual onset wheeze after visiting friend with cats. Used salbutamol MDI 8 puffs via spacer with minimal relief. Getting progressively worse. No previous ICU admissions. Last severe attack 6 months ago treated with nebulisers in ED.',
      medications: ['Salbutamol MDI PRN', 'Seretide 250 Evohaler BD', 'Montelukast 10mg nocte'],
      allergies: ['Cat dander', 'Aspirin — causes wheeze'],
      medicalConditions: ['Moderate persistent asthma', 'Allergic rhinitis', 'Aspirin-sensitive asthma'],
      surgicalHistory: [],
      lastMeal: 'Dinner 5 hours ago',
      events: 'Visited friend with cats 6 hours ago',
    },
    expectedFindings: {
      keyObservations: ['Moderate asthma exacerbation', 'Speaking in phrases', 'Accessory muscle use', 'SpO2 90-94%', 'Needs combination therapy'],
      redFlags: ['Watch for deterioration to severe/life-threatening', 'Pulsus paradoxus suggests significant bronchospasm', 'Aspirin allergy — avoid aspirin/NSAIDs'],
      differentialDiagnoses: ['Moderate asthma exacerbation', 'Allergic reaction', 'Acute bronchitis'],
      mostLikelyDiagnosis: 'Moderate Acute Asthma Exacerbation',
    },
    treatmentOptions: {
      medications: ['Salbutamol 5mg nebulized (back-to-back)', 'Ipratropium 500mcg nebulized', 'Hydrocortisone 200mg IV', 'Consider prednisolone 40mg PO'],
      procedures: ['IV access', 'SpO2 monitoring', 'Peak flow'],
      positioning: ['Upright / Fowler\'s position — critical for this severity'],
    },
    studentChecklist: [
      { id: 'amod1', category: 'abcde', description: 'Classify as moderate severity (speaking phrases, SpO2 90-94%)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'amod2', category: 'intervention', description: 'Position upright (Fowler\'s) — essential for breathing', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'amod3', category: 'intervention', description: 'High-flow O2 via non-rebreather mask', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'amod4', category: 'intervention', description: 'Salbutamol nebulizer — first dose', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'amod5', category: 'intervention', description: 'Add ipratropium nebulizer', points: 10, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'amod6', category: 'intervention', description: 'IV access and steroids (hydrocortisone 200mg)', points: 10, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'amod7', category: 'intervention', description: 'Reassess after treatment — repeat salbutamol if needed', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
    ],
    teachingPoints: [
      'Moderate asthma: speaking in phrases, SpO2 90-94%, accessory muscle use, peak flow 50-75% predicted',
      'Combination therapy is KEY in moderate asthma — salbutamol + ipratropium > salbutamol alone',
      'Dual bronchodilation: beta-2 agonist (salbutamol) works via cAMP, anticholinergic (ipratropium) via acetylcholine blockade — different mechanisms = additive effect',
      'Steroids (hydrocortisone IV or prednisolone PO) should be given EARLY — onset 4-6 hours but start immediately',
      'Upright positioning SIGNIFICANTLY improves ventilation — never lay an asthmatic flat',
      'Back-to-back nebulisers: if poor response to first salbutamol, repeat immediately',
      'Pulsus paradoxus >10mmHg indicates significant bronchospasm — useful clinical sign',
      'Aspirin-sensitive asthma (Samter\'s triad): asthma + nasal polyps + aspirin sensitivity',
      'Cat exposure is a common trigger — remove from environment if possible',
      'Document response to treatment — if failing to improve, escalate to severe protocol',
    ],
    commonPitfalls: [
      'Using salbutamol alone without ipratropium — combination therapy is evidence-based for moderate asthma',
      'Delaying steroid administration — give early even though onset is 4-6 hours',
      'Lying the patient flat for examination — never lay an asthmatic flat',
      'Not reassessing after first nebuliser — repeat immediately if poor response',
      'Failing to recognise deterioration from moderate to severe (silent chest, single words, exhaustion)',
      'Not documenting peak flow before and after treatment',
    ],
  }),

  // --- SEVERE ASTHMA ---
  createCase({
    id: 'asthma-sev-001',
    title: 'Severe Asthma — Failing to Respond',
    category: 'respiratory',
    subcategory: 'asthma',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year', 'diploma'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Severe asthma attack, cannot breathe, cannot speak',
      timeOfDay: 'evening',
      location: 'Family home in Abu Dhabi',
      callerInfo: 'Patient\'s mother (frantic)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Known severe asthmatic', 'Multiple hospital admissions', 'Getting worse rapidly'],
    },
    patientInfo: {
      age: 22,
      gender: 'female',
      weight: 58,
      occupation: 'Nursing student',
      language: 'English, Hindi',
    },
    sceneInfo: {
      description: 'Living room, patient in tripod position on sofa, obviously distressed',
      hazards: ['Strong incense burning — trigger'],
      bystanders: 'Mother and sister present, distressed',
      environment: 'Incense burning in room — immediate trigger',
      accessIssues: [],
      extricationNeeded: false,
    },
    initialPresentation: {
      generalImpression: 'Young female, severe respiratory distress, can only speak single words, exhausting',
      position: 'Tripod position, leaning forward on arms, severe use of accessory muscles',
      appearance: 'Pale, cyanotic lips, drenched in sweat, terrified',
      consciousness: 'Alert but unable to speak — single words only',
      sounds: ['Cannot hear wheeze without stethoscope — may indicate severe obstruction'],
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but severe air limitation', 'Single words only'],
        interventions: ['Prepare for potential intubation'],
        adjunctsNeeded: [],
      },
      breathing: {
        rate: 34,
        rhythm: 'Irregular — exhaustion',
        depth: 'Shallow',
        spo2: 85,
        findings: ['Severe diminished air entry bilaterally', 'Severe accessory muscle use — all muscles', 'Intercostal and subcostal recession', 'Cyanosis', 'Unable to complete sentences'],
        interventions: ['Salbutamol 5mg continuous neb', 'Ipratropium 500mcg neb', 'High-flow O2', 'IM adrenaline 0.5mg', 'IV MgSO4 2g', 'Hydrocortisone 200mg IV'],
        auscultation: ['Severely diminished air entry bilaterally', 'Faint expiratory wheeze — poor air movement', 'Silent in lower zones — minimal air movement'],
      },
      circulation: {
        pulseRate: 138,
        pulseQuality: 'Rapid, thready',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 3,
        skin: 'Pale, cyanotic, profusely diaphoretic',
        findings: ['Severely tachycardic', 'Tachycardia from hypoxia + beta-agonist', 'Pulsus paradoxus 15mmHg'],
        interventions: ['Large-bore IV access x2'],
        ecgFindings: ['Sinus tachycardia', 'Right axis deviation'],
        ivAccess: [],
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 7.8,
        findings: ['Anxious, terrified', 'Unable to speak in sentences — single words only'],
        interventions: [],
      },
      exposure: {
        temperature: 37.0,
        findings: ['Profuse diaphoresis', 'No rash'],
        interventions: ['Remove from incense exposure', 'Open windows'],
      },
    },
    vitalSignsProgression: {
      initial: { pulse: 138, respiration: 34, spo2: 85, bp: '110/70', gcs: 14, temperature: 37.0 },
      withTreatment: { pulse: 100, respiration: 22, spo2: 94, bp: '115/72', gcs: 15, temperature: 37.0 },
      withoutTreatment: { pulse: 160, respiration: 10, spo2: 70, bp: '90/55', gcs: 8, temperature: 37.0 },
    },
    history: {
      chiefComplaint: 'Cannot breathe — worst attack ever',
      historyOfPresentIllness: 'Rapid onset severe bronchospasm after incense exposure. Used salbutamol MDI 10+ puffs with no relief over 1 hour. Progressive worsening. Has had 3 hospital admissions this year, 1 ICU admission 8 months ago for near-fatal attack.',
      medications: ['Salbutamol MDI PRN', 'Seretide 500 Accuhaler BD', 'Montelukast 10mg nocte', 'Prednisolone 5mg maintenance dose'],
      allergies: ['Strong fragrances', 'NSAIDs'],
      medicalConditions: ['Severe persistent asthma', 'Previous ICU admission', 'Previous near-fatal attack'],
      surgicalHistory: [],
      lastMeal: 'Dinner 3 hours ago',
      events: 'Incense burning in house triggered acute attack',
    },
    expectedFindings: {
      keyObservations: ['Severe asthma — approaching life-threatening', 'Previous ICU admission = high risk', 'Needs full escalation protocol', 'Salbutamol alone will NOT resolve this'],
      redFlags: ['Previous near-fatal attack', 'Exhaustion risk', 'Diminished air entry suggests severe obstruction', 'If gets silent chest = imminent arrest'],
      differentialDiagnoses: ['Severe acute asthma', 'Near-fatal asthma', 'Anaphylaxis to incense'],
      mostLikelyDiagnosis: 'Severe Asthma Exacerbation',
    },
    treatmentOptions: {
      medications: ['Salbutamol 5mg continuous nebuliser', 'Ipratropium 500mcg nebuliser', 'Hydrocortisone 200mg IV', 'Adrenaline 0.5mg IM', 'Magnesium sulfate 2g IV over 20 min'],
      procedures: ['IV access x2', 'Continuous SpO2 monitoring', 'Prepare for intubation'],
      positioning: ['Upright / Fowler\'s — essential', 'DO NOT lay flat under any circumstances'],
    },
    studentChecklist: [
      { id: 'as1', category: 'abcde', description: 'Classify as severe asthma (single words, SpO2 <90%, RR >30)', points: 10, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['advanced', 'expert'] },
      { id: 'as2', category: 'intervention', description: 'Immediately remove trigger (incense)', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'as3', category: 'intervention', description: 'Position upright — NEVER lay flat', points: 5, yearLevel: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'as4', category: 'intervention', description: 'High-flow O2 via non-rebreather', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'as5', category: 'intervention', description: 'Salbutamol + ipratropium nebuliser (combined)', points: 10, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'as6', category: 'intervention', description: 'IV access and hydrocortisone 200mg', points: 10, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'as7', category: 'intervention', description: 'IM adrenaline 0.5mg for severe bronchospasm', points: 15, yearLevel: ['4th-year', 'diploma'], complexity: ['advanced', 'expert'] },
      { id: 'as8', category: 'intervention', description: 'IV magnesium sulfate 2g over 20 minutes', points: 10, yearLevel: ['4th-year', 'diploma'], complexity: ['advanced', 'expert'] },
      { id: 'as9', category: 'clinical-reasoning', description: 'Recognise salbutamol alone is insufficient — needs combination therapy', points: 15, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'as10', category: 'clinical-reasoning', description: 'Prepare for intubation if patient exhausts', points: 10, yearLevel: ['4th-year', 'diploma'], complexity: ['advanced', 'expert'] },
    ],
    teachingPoints: [
      'Severe asthma: single words only, SpO2 <90%, RR >25, peak flow <33% predicted',
      'COMBINATION THERAPY is essential in severe asthma — salbutamol alone will fail:',
      '  - Salbutamol 5mg nebulised (beta-2 agonist) — first-line bronchodilator',
      '  - Ipratropium 500mcg nebulised (anticholinergic) — dual bronchodilation',
      '  - Hydrocortisone 200mg IV (steroid) — reduces airway inflammation',
      '  - Adrenaline 0.5mg IM (systemic bronchodilator) — when inhaled route failing',
      '  - Magnesium sulfate 2g IV (smooth muscle relaxation) — additional bronchodilation',
      'Each additional treatment provides synergistic benefit — the combination is much more effective than any single agent',
      'Previous ICU admission is strongest predictor of future near-fatal attack',
      'Diminished air entry is more concerning than wheeze — wheeze means air is moving',
      'If patient becomes SILENT and exhausted, this is pre-arrest — prepare for intubation immediately',
      'POSITIONING MATTERS: upright reduces work of breathing by 20-30% compared to supine',
      'Avoid sedation (midazolam) — respiratory depression will kill',
      'Avoid morphine/fentanyl — histamine release can worsen bronchospasm',
      'Monitor for pneumothorax — severe bronchospasm can cause barotrauma',
    ],
    commonPitfalls: [
      'Giving only salbutamol without ipratropium in severe asthma — dual bronchodilation is standard of care',
      'Delaying steroids — they take 4-6 hours to work, so must be given EARLY',
      'Not considering IM adrenaline when inhaled route is failing — the drug cannot reach the airways if they are completely obstructed',
      'Laying patient flat — dramatically increases work of breathing and may precipitate arrest',
      'Over-relying on SpO2 — a patient can deteriorate rapidly even with "acceptable" SpO2',
      'Not preparing for intubation — patients can crash quickly in severe asthma',
    ],
  }),
];

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export const severityVariantCases: CaseScenario[] = [
  ...asthmaSeverityCases,
];

export default severityVariantCases;
