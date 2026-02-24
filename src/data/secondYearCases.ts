/**
 * 2nd Year Focused Cases
 *
 * These cases emphasize:
 * - Systematic ABCDE assessment
 * - Complete vital signs including GCS
 * - Blood glucose assessment
 * - Secondary survey technique
 * - Documentation accuracy and timing
 * - Basic clinical reasoning (recognizing patterns)
 * - Identifying red flags
 * - Basic procedural skills
 */

import type { CaseScenario } from '@/types';

const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

// ============================================================================
// 2ND YEAR CASES - Focus on Systematic Assessment & Clinical Reasoning
// ============================================================================

export const secondYearCases: CaseScenario[] = [
  // Case 1: Respiratory Distress - Systematic ABCDE, complete vitals, GCS
  createCase({
    id: 'y2-001',
    title: 'Asthma Exacerbation - Systematic Assessment Required',
    category: 'respiratory',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '22-year-old female with asthma attack, difficulty breathing',
      timeOfDay: 'evening',
      location: 'University campus in Sharjah',
      callerInfo: 'Friend (patient unable to speak)',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 22,
      gender: 'female',
      weight: 55,
      language: 'English',
      culturalConsiderations: ['Young adult, anxious', 'Friends present for support']
    },
    sceneInfo: {
      description: 'University common room, patient sitting on chair leaning forward',
      hazards: ['None identified'],
      bystanders: '3 friends present, one appears to know patient well',
      environment: 'Indoor, air conditioned'
    },
    initialPresentation: {
      generalImpression: 'Young female, tripod position, using accessory muscles, audible wheeze',
      position: 'Sitting upright, leaning forward with arms supporting',
      appearance: 'Anxious, cyanotic lips, diaphoretic',
      consciousness: 'Alert but anxious, able to nod/shake head only'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but compromised by respiratory effort', 'Speaking in 1-2 word sentences', 'Able to secretions but increased work'],
        interventions: ['Encourage calm environment', 'Prepare for airway adjuncts if needed']
      },
      breathing: {
        rate: 32,
        rhythm: 'Regular but rapid',
        depth: 'Shallow with prolonged expiration',
        spo2: 88,
        findings: [
          'Tachypneic (32/min)',
          'Bilateral expiratory wheeze',
          'Accessory muscle use visible',
          'Prolonged expiratory phase',
          'Tripod positioning',
          'SpO2 88% on room air'
        ],
        interventions: [
          'High-flow oxygen 15L/min via non-rebreather',
          'Assess lung sounds before and after interventions',
          'Prepare for nebulized bronchodilator',
          'Calm patient and encourage controlled breathing'
        ],
        auscultation: [
          'Bilateral expiratory wheeze (upper and lower fields)',
          'Reduced air entry at bases',
          'No crackles',
          'Wheeze louder on expiration'
        ]
      },
      circulation: {
        pulseRate: 125,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 145, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Warm, diaphoretic, cyanotic periorally',
        findings: [
          'Tachycardia (125/min) - likely respiratory driven',
          'Good peripheral perfusion',
          'Mild hypertension likely anxiety/pain related'
        ],
        interventions: ['Monitor cardiac status', 'IV access if protocols allow'],
        ivAccess: ['Consider 18G or 20G in AC if protocols allow']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal 3mm, reactive',
        bloodGlucose: 5.4,
        findings: [
          'Alert but anxious',
          'Speech limited to 1-2 words at a time',
          'Follows commands appropriately',
          'Blood glucose normal'
        ],
        interventions: [
          'Reassess GCS after improving respiratory status',
          'Monitor for deterioration due to hypoxia'
        ]
      },
      exposure: {
        findings: [
          'Diaphoresis present',
          'Cyanosis of lips and nail beds',
          'Medicalert bracelet visible - Asthma',
          'No signs of trauma',
          'Using respiratory accessory muscles (sternocleidomastoid, intercostals)'
        ],
        interventions: [
          'Loosen tight clothing',
          'Maintain patient dignity while assessing',
          'Keep patient calm'
        ]
      }
    },
    secondarySurvey: {
      head: ['Normal', 'No trauma', 'Cyanosis of oral mucosa'],
      neck: ['Trachea midline', 'No lymphadenopathy', 'Accessory muscle use visible'],
      chest: [
        'Barrel chest appearance',
        'Bilateral wheeze',
        'Increased anteroposterior diameter',
        'Use of accessory muscles',
        'Chest hyperresonant to percussion'
      ],
      abdomen: ['Soft, non-tender', 'Moving with respiration'],
      pelvis: ['Normal'],
      extremities: ['Warm and dry', 'No edema', 'Good peripheral pulses'],
      posterior: ['Spine non-tender', 'No posterior abnormalities'],
      neurological: ['Anxious but appropriate', 'No focal deficits', 'Moving all extremities']
    },
    history: {
      medications: [
        { name: 'Salbutamol (Albuterol) inhaler', dose: '100mcg', frequency: 'PRN', indication: 'Asthma' },
        { name: 'Fluticasone/Salmeterol', dose: '250/25', frequency: 'Twice daily', indication: 'Asthma maintenance' },
        { name: 'Montelukast', dose: '10mg', frequency: 'Evening', indication: 'Asthma' }
      ],
      allergies: [
        'Penicillin - rash',
        'Aspirin - wheeze (patient notes she avoids aspirin)'
      ],
      medicalConditions: [
        'Asthma since childhood',
        'Previous hospitalizations for asthma (2 in past year)',
        'Eczema'
      ],
      surgicalHistory: ['None'],
      lastMeal: 'Light lunch 4 hours ago - sandwich and juice',
      eventsLeading: 'Patient reports symptoms started 2 hours ago while studying. Used her rescue inhaler 3 times in the past hour with no relief. Symptoms progressively worsening. No specific trigger identified. Friend called ambulance when patient became too short of breath to speak.',
      socialHistory: {
        smoking: 'Non-smoker',
        alcohol: 'Social (1-2 drinks per week)',
        occupation: 'University student',
        livingSituation: 'Lives in campus dormitory'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '145/85', pulse: 125, respiration: 32, spo2: 88, gcs: 14, temperature: 37.2 },
      afterIntervention: { bp: '138/80', pulse: 110, respiration: 26, spo2: 94, gcs: 15 },
      deterioration: { bp: '155/95', pulse: 145, respiration: 40, spo2: 82, gcs: 12 }
    },
    expectedFindings: {
      keyObservations: [
        'Classic asthma exacerbation presentation',
        'Tripod positioning and accessory muscle use',
        'Audible wheeze',
        'History of multiple rescue inhaler use without relief',
        'Hypoxia present (SpO2 88%)',
        'Tachycardia and tachypnea'
      ],
      redFlags: [
        'Multiple inhaler use without relief - SEVERE attack',
        'Unable to speak in full sentences',
        'SpO2 below 90%',
        'History of previous hospitalizations',
        'Aspirin allergy (ASA-sensitive asthma possibility)'
      ],
      differentialDiagnoses: [
        'Acute asthma exacerbation',
        'Anaphylaxis (less likely - no rash or swelling noted)',
        'Pneumothorax (consider if unilateral symptoms)',
        'Pulmonary embolism',
        'Foreign body aspiration'
      ],
      mostLikelyDiagnosis: 'Acute severe asthma exacerbation',
      supportingEvidence: [
        'History of asthma with poor response to rescue inhaler',
        'Classic wheeze and tripod positioning',
        'Accessory muscle use',
        'Progressive worsening over hours',
        'No other obvious causes identified'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC approach with emphasis on Airway and Breathing',
        'High-flow oxygen (15L/min via non-rebreather)',
        'Position of comfort (usually upright)',
        'Systematic ABCDE assessment',
        'Complete vital signs including SpO2',
        'Auscultate lung sounds',
        'Check blood glucose'
      ],
      definitive: [
        'Nebulized bronchodilators (Salbutamol/Ipratropium) per protocol',
        'Consider IV access for medications if severe',
        'Consider systemic steroids if within protocols',
        'Continuous monitoring',
        'Transport to emergency department',
        'Pre-alert receiving hospital'
      ],
      monitoring: [
        'Reassess lung sounds after bronchodilators',
        'SpO2 monitoring continuously',
        'Repeat vital signs every 5 minutes',
        'Reassess GCS and mental status',
        'Monitor for fatigue/respiratory failure'
      ],
      transportConsiderations: [
        'Position patient for comfort (usually upright)',
        'Keep environment calm',
        'Continuously reassess en route',
        'Consider lights/sirens based on patient condition'
      ]
    },
    studentChecklist: [
      // 2nd Year Emphasis - Systematic ABCDE (35%)
      {
        id: 'y2-001-abcde-systematic',
        category: 'abcde',
        description: 'Perform systematic ABCDE assessment without skipping sections',
        points: 5,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Systematic approach ensures nothing is missed'
      },
      {
        id: 'y2-001-airway-assess',
        category: 'abcde',
        description: 'Airway assessment including ability to speak and secretions',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Airway status can change rapidly in respiratory distress'
      },
      {
        id: 'y2-001-breathing-comprehensive',
        category: 'abcde',
        description: 'Breathing: rate, rhythm, depth, SpO2, effort, sounds',
        points: 5,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Comprehensive breathing assessment identifies severity and response'
      },
      {
        id: 'y2-001-auscultation',
        category: 'abcde',
        description: 'Auscultate lung sounds bilaterally',
        points: 4,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Lung sounds provide crucial diagnostic information'
      },
      {
        id: 'y2-001-gcs-full',
        category: 'abcde',
        description: 'Calculate and document full GCS (E/V/M)',
        points: 4,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'GCS provides objective measure of consciousness'
      },
      {
        id: 'y2-001-glucose',
        category: 'abcde',
        description: 'Check blood glucose level',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Hypoglycemia can mimic respiratory distress symptoms'
      },
      {
        id: 'y2-001-vitals-complete',
        category: 'abcde',
        description: 'Complete set of vital signs with manual BP',
        points: 4,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Complete vitals establish baseline and show trends'
      },

      // 2nd Year Emphasis - Secondary Survey (20%)
      {
        id: 'y2-001-secondary-systematic',
        category: 'secondary',
        description: 'Systematic head-to-toe secondary survey',
        points: 4,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Secondary survey identifies additional findings'
      },
      {
        id: 'y2-001-chest-assess',
        category: 'secondary',
        description: 'Detailed chest assessment - inspection, palpation, auscultation',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Chest assessment identifies respiratory conditions'
      },
      {
        id: 'y2-001-compare-bilateral',
        category: 'secondary',
        description: 'Compare bilateral findings during secondary survey',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Bilateral comparison helps identify asymmetry'
      },

      // 2nd Year Emphasis - Clinical Reasoning (20%)
      {
        id: 'y2-001-recognize-severity',
        category: 'clinical-reasoning',
        description: 'Recognize severity based on failed rescue inhaler use',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Failed home treatment indicates severe exacerbation'
      },
      {
        id: 'y2-001-recognize-red-flags',
        category: 'clinical-reasoning',
        description: 'Identify red flags: unable to speak, SpO2 <90%, multiple inhaler use',
        points: 4,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Red flags indicate need for rapid transport'
      },
      {
        id: 'y2-001-consider-differentials',
        category: 'clinical-reasoning',
        description: 'Consider differential diagnoses beyond asthma',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Thinking broadly prevents missing other conditions'
      },

      // 2nd Year Emphasis - Documentation (15%)
      {
        id: 'y2-001-document-times',
        category: 'documentation',
        description: 'Document all times (assessment, interventions, changes)',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Time documentation shows progression'
      },
      {
        id: 'y2-001-document-vitals-trend',
        category: 'documentation',
        description: 'Document vital signs with trend notes',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Trends show improvement or deterioration'
      },
      {
        id: 'y2-001-document-findings',
        category: 'documentation',
        description: 'Document key assessment findings (wheeze, accessory muscles)',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Specific findings support diagnosis and treatment'
      },

      // 2nd Year Emphasis - Communication (10%)
      {
        id: 'y2-001-communicate-patient',
        category: 'communication',
        description: 'Communicate with patient considering their distress',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Patient communication is challenging in respiratory distress'
      },
      {
        id: 'y2-001-reassure',
        category: 'communication',
        description: 'Provide reassurance and calm environment',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Anxiety worsens respiratory distress'
      }
    ],
    teachingPoints: [
      'Systematic ABCDE is critical - don\'t get distracted and skip sections',
      'Always auscultate lung sounds - don\'t assume wheeze based on history alone',
      'GCS must be calculated properly: Eye (1-4) + Verbal (1-5) + Motor (1-6)',
      'Blood glucose can cause altered mental status - always check in respiratory distress',
      'Failed rescue inhaler use is a critical red flag',
      'SpO2 < 90% is concerning and requires oxygen and consideration of escalation',
      'Document times - trends show patient trajectory',
      'Bilateral comparison is essential in respiratory assessment'
    ],
    commonPitfalls: [
      'Skipping auscultation due to audible wheeze',
      'Not checking blood glucose in altered patient',
      'Inaccurate GCS calculation',
      'Not documenting times and trends',
      'Getting distracted and not completing systematic ABCDE',
      'Missing that failed rescue inhaler indicates severity',
      'Forgetting to reassess after interventions'
    ],
    references: [
      'Respiratory Emergencies - Asthma Chapter',
      'ABCDE Assessment Guidelines',
      'GCS Assessment Reference'
    ],
    visualResources: {
      images: [

      ],
      videos: []
    }
  }),

  // Case 2: Chest Pain - Systematic assessment, ECG, clinical reasoning
  createCase({
    id: 'y2-002',
    title: 'Cardiac Chest Pain - Assessment Focus',
    category: 'cardiac',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '55-year-old male with chest pain',
      timeOfDay: 'early-morning',
      location: 'Home in Dubai Marina',
      callerInfo: 'Wife (worried)',
      dispatchCode: 'Bravo-1'
    },
    patientInfo: {
      age: 55,
      gender: 'male',
      weight: 82,
      language: 'English',
      culturalConsiderations: ['Family present and anxious', 'Patient apprehensive']
    },
    sceneInfo: {
      description: 'Apartment, patient sitting on sofa holding chest',
      hazards: ['None identified'],
      bystanders: 'Wife and adult daughter present',
      environment: 'Comfortable home environment'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, appears unwell, clutching chest',
      position: 'Sitting forward, leaning left',
      appearance: 'Pale, diaphoretic, anxious',
      consciousness: 'Alert and appropriate'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking clearly but with effort'],
        interventions: ['Monitor airway status']
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Slightly shallow',
        spo2: 95,
        findings: [
          'Mild tachypnea (22/min) likely pain/anxiety related',
          'Clear lung sounds bilaterally',
          'No increased work of breathing aside from rate'
        ],
        interventions: ['Apply oxygen if SpO2 drops below 94%']
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Regular, slightly weak',
        bp: { systolic: 155, diastolic: 95 },
        capillaryRefill: 2,
        skin: 'Pale, cool, diaphoretic',
        findings: [
          'Mild tachycardia (95/min)',
          'Hypertension',
          'Skin changes suggesting sympathetic activation',
          'No peripheral edema'
        ],
        interventions: [
          'IV access if protocols allow',
          'Cardiac monitor',
          '12-lead ECG'
        ],
        ecgFindings: ['12-lead ECG required', 'Monitor for arrhythmias'],
        ivAccess: ['Consider 2x large bore IVs if protocols allow']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        bloodGlucose: 6.1,
        findings: [
          'Alert and oriented',
          'Anxious but appropriate',
          'Blood glucose normal'
        ],
        interventions: ['Reassess mental status if condition changes']
      },
      exposure: {
        findings: ['Diaphoresis generalized', 'No signs of trauma', 'Medicalert visible but unreadable at distance'],
        interventions: ['Full exposure while maintaining dignity', 'Check Medicalert']
      }
    },
    secondarySurvey: {
      head: ['Normal', 'No trauma'],
      neck: ['No JVD', 'Trachea midline', 'Carotids equal'],
      chest: [
        'No visible chest wall deformity',
        'Chest wall tender to palpation at left sternal border',
        'Clear lung sounds bilaterally',
        'No crepitus'
      ],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['No edema', 'Pulses equal bilaterally', 'Skin cool and pale'],
      posterior: ['No posterior chest tenderness'],
      neurological: ['Normal', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Atorvastatin', dose: '20mg', frequency: 'Nightly', indication: 'Cholesterol' },
        { name: 'Lisinopril', dose: '10mg', frequency: 'Daily', indication: 'Blood pressure' },
        { name: 'Aspirin', dose: '81mg', frequency: 'Daily', indication: 'Heart protection' }
      ],
      allergies: ['No known drug allergies'],
      medicalConditions: [
        'Hypertension (5 years)',
        'Hyperlipidemia',
        'Type 2 Diabetes (diet-controlled)',
        'Family history of heart disease'
      ],
      surgicalHistory: ['Appendectomy age 20'],
      lastMeal: 'Light dinner 4 hours ago',
      eventsLeading: 'Patient woke at 5 AM with central chest pain, pressure-like, 7/10 severity. Pain radiates to left jaw and arm. No prior episodes. Wife called ambulance when pain didn\'t resolve with rest. Patient took one aspirin when pain started. Diaphoresis developed within 30 minutes of pain onset.',
      socialHistory: {
        smoking: 'Ex-smoker (quit 5 years ago, 20 pack-year history)',
        alcohol: 'Occasional',
        occupation: 'Bank manager',
        livingSituation: 'Lives with wife and children'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '155/95', pulse: 95, respiration: 22, spo2: 95, gcs: 15, temperature: 37.0 },
      afterIntervention: { bp: '150/90', pulse: 92, respiration: 20, spo2: 96, gcs: 15 },
      deterioration: { bp: '135/80', pulse: 60, respiration: 14, spo2: 92, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Classic cardiac chest pain description',
        'Radiation to jaw and arm',
        'Diaphoresis present',
        'Risk factors: age, gender, hypertension, hyperlipidemia, smoking history',
        'Patient already took aspirin',
        'Multiple cardiac risk factors'
      ],
      redFlags: [
        'Chest pain with diaphoresis',
        'Radiation to jaw/arm',
        'Multiple cardiovascular risk factors',
        'Pain woke patient from sleep',
        'Hypertensive and diabetic'
      ],
      differentialDiagnoses: [
        'Acute Coronary Syndrome (ACS/MI)',
        'Unstable angina',
        'Gastroesophageal reflux (GERD)',
        'Costochondritis',
        'Pulmonary embolism',
        'Aortic dissection'
      ],
      mostLikelyDiagnosis: 'Acute Coronary Syndrome until proven otherwise',
      supportingEvidence: [
        'Central chest pressure with radiation',
        'Diaphoresis present',
        'Multiple risk factors',
        'Pain characteristics concerning',
        'Age and gender appropriate'
      ]
    },
    managementPathway: {
      immediate: [
        'Systematic ABCDE assessment',
        'Complete vital signs with manual BP (both arms)',
        '12-lead ECG within 10 minutes',
        'Cardiac monitor',
        'IV access if protocols allow',
        'Oxygen if SpO2 <94%',
        'SAMPLE history with cardiac emphasis',
        'OPQRS for pain assessment'
      ],
      definitive: [
        'Aspirin if not already taken and within protocols',
        'Transport to cardiac-capable hospital',
        'Pre-alert for possible STEMI',
        'Consider nitroglycerin if protocols allow and BP adequate',
        'Monitor for arrhythmias',
        'Reassess after interventions'
      ],
      monitoring: [
        'Continuous cardiac monitoring',
        'Vital signs every 5 minutes',
        'Reassess pain level',
        'Monitor for changes in level of consciousness',
        '12-lead ECG repeated if symptoms change'
      ]
    },
    studentChecklist: [
      // 2nd Year Emphasis - Systematic Assessment (35%)
      {
        id: 'y2-002-abcde',
        category: 'abcde',
        description: 'Complete systematic ABCDE assessment',
        points: 5,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Systematic approach ensures comprehensive assessment'
      },
      {
        id: 'y2-002-gcs',
        category: 'abcde',
        description: 'Calculate and document GCS (E/V/M)',
        points: 4,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'GCS provides baseline for neurological monitoring'
      },
      {
        id: 'y2-002-glucose',
        category: 'abcde',
        description: 'Check blood glucose',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Hypoglycemia and hyperglycemia can mimic cardiac symptoms'
      },
      {
        id: 'y2-002-vitals-12-lead',
        category: 'abcde',
        description: '12-lead ECG obtained within 10 minutes',
        points: 5,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: '12-lead ECG is essential for cardiac chest pain'
      },
      {
        id: 'y2-002-ecg-interpret',
        category: 'abcde',
        description: 'Basic ECG interpretation - normal vs abnormal',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Recognizing major ECG abnormalities is essential'
      },
      {
        id: 'y2-002-bp-both-arms',
        category: 'abcde',
        description: 'BP in both arms if dissection suspected',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'BP difference >20mmHg suggests aortic dissection'
      },
      {
        id: 'y2-002-lung-sounds',
        category: 'abcde',
        description: 'Auscultate lung sounds',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Lung sounds help differentiate cardiac vs respiratory cause'
      },

      // 2nd Year Emphasis - History Taking for Cardiac (25%)
      {
        id: 'y2-002-sample-full',
        category: 'history',
        description: 'Complete SAMPLE with cardiac emphasis',
        points: 4,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Cardiac history is crucial for assessment'
      },
      {
        id: 'y2-002-opqrs-cardiac',
        category: 'history',
        description: 'OPQRS: Onset, Provokes, Quality, Region/Radiation, Severity, Time',
        points: 5,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Detailed pain assessment differentiates cardiac causes'
      },
      {
        id: 'y2-002-risk-factors',
        category: 'history',
        description: 'Identify cardiac risk factors',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Risk factors help determine pre-test probability'
      },
      {
        id: 'y2-002-medications',
        category: 'history',
        description: 'Detailed medication history including compliance',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Current medications indicate known conditions'
      },

      // 2nd Year Emphasis - Clinical Reasoning (20%)
      {
        id: 'y2-002-recognize-red-flags',
        category: 'clinical-reasoning',
        description: 'Recognize cardiac red flags (diaphoresis, radiation, etc.)',
        points: 4,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Red flags identify high-risk patients'
      },
      {
        id: 'y2-002-differentials',
        category: 'clinical-reasoning',
        description: 'Consider non-cardiac differentials',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Not all chest pain is cardiac - think broadly'
      },
      {
        id: 'y2-002-ecg-normal-vs-abnormal',
        category: 'clinical-reasoning',
        description: 'Recognize whether ECG is normal or shows concerning changes',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'ECG interpretation is a core 2nd year skill'
      },

      // Documentation (15%)
      {
        id: 'y2-002-document-all',
        category: 'documentation',
        description: 'Complete documentation with times',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Documentation creates record of assessment and findings'
      },
      {
        id: 'y2-002-document-ecg-time',
        category: 'documentation',
        description: 'Document ECG time and interpretation',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'ECG timing is important for cardiac care'
      }
    ],
    teachingPoints: [
      'Systematic ABCDE prevents missing critical findings',
      'GCS must be calculated and documented correctly',
      'Blood glucose is essential - never assume "cardiac" without checking',
      '12-lead ECG within 10 minutes is the standard of care',
      'OPQRS should include Time (OPQRST) and remember Sample',
      'BP in both arms when dissection is a consideration',
      'Document times - cardiac care is time-sensitive',
      'Think about differentials but treat as cardiac until proven otherwise'
    ],
    commonPitfalls: [
      'Not checking blood glucose',
      'Inaccurate GCS calculation',
      'Missing ECG or delayed ECG',
      'Not getting complete SAMPLE history',
      'Forgetting to document times',
      'Not auscultating lung sounds',
      'Only thinking cardiac and missing differentials'
    ],
    references: [
      'Cardiac Emergencies Chapter',
      '12-Lead ECG Acquisition and Interpretation',
      'Chest Pain Differential Diagnosis'
    ]
  }),

  // Case 3: Stroke Assessment - GCS, pupils, secondary survey focus
  createCase({
    id: 'y2-003',
    title: 'Acute Stroke - Neurological Assessment Focus',
    category: 'neurological',
    priority: 'critical',
    complexity: 'intermediate',
    yearLevels: ['2nd-year'],
    estimatedDuration: 18,
    dispatchInfo: {
      callReason: '67-year-old male slurred speech, weak arm',
      timeOfDay: 'afternoon',
      location: 'Home in Abu Dhabi',
      callerInfo: 'Wife',
      dispatchCode: 'Bravo-1'
    },
    patientInfo: {
      age: 67,
      gender: 'male',
      weight: 78,
      language: 'Arabic',
      culturalConsiderations: ['Family very involved', 'Religious considerations']
    },
    sceneInfo: {
      description: 'Home, patient in living room, wife present',
      hazards: ['None identified'],
      bystanders: 'Wife present and cooperative',
      environment: 'Safe home environment'
    },
    initialPresentation: {
      generalImpression: 'Elderly male, alert but with obvious left-sided weakness',
      position: 'Sitting on sofa, leaning to left',
      appearance: 'Facial droop on left side, clothes disheveled',
      consciousness: 'Alert but has difficulty speaking'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but secretions may pool', 'Patient able to manage secretions'],
        interventions: ['Have suction ready', 'Position to maintain airway if needed']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Breathing adequately', 'No increased work of breathing'],
        interventions: ['Monitor respiratory status', 'Oxygen if SpO2 drops']
      },
      circulation: {
        pulseRate: 88,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 175, diastolic: 100 },
        capillaryRefill: 2,
        skin: 'Warm and dry, pink',
        findings: ['Hypertensive', 'Good perfusion', 'No signs of shock'],
        interventions: ['Monitor BP', 'Establish IV if protocols allow']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 3, motor: 5, total: 12 },
        pupils: ['Right: 3mm reactive', 'Left: 4mm sluggish'],
        bloodGlucose: 8.2,
        findings: [
          'Alert but aphasic (difficulty speaking)',
          'GCS 12 (E4, V3, M5) - verbal component affected',
          'Left pupil sluggish - possible uncal herniation sign',
          'Hyperglycemic (BSL 8.2) - may be stress response or diabetes',
          'Left-sided weakness (hemiparesis)',
          'Facial droop on left'
        ],
        interventions: [
          'Immediate blood glucose check',
          'Complete neurological assessment',
          'FAST assessment complete',
          'Protect weak side from injury',
          'Consider stroke team activation'
        ]
      },
      exposure: {
        findings: ['No signs of trauma', 'Incontinence present'],
        interventions: ['Full exposure while maintaining dignity', 'Check for rash signs of infection']
      }
    },
    secondarySurvey: {
      head: ['Facial asymmetry - left-sided droop', 'No trauma signs', 'No tongue bite'],
      neck: ['Supple, no meningismus', 'Carotids equal without bruit'],
      chest: ['Clear bilaterally', 'Regular heart rate and rhythm'],
      abdomen: ['Soft, non-tender', 'No guarding'],
      pelvis: ['Normal'],
      extremities: [
        'Left arm: decreased tone, weak grip (0/5 strength)',
        'Left leg: decreased tone, weak (2/5 strength)',
        'Right side: normal strength (5/5)',
        'No deformities'
      ],
      posterior: ['Normal spine, no tenderness'],
      neurological: [
        'Left facial droop',
        'Dysarthria (slurred speech)',
        'Left hemiparesis',
        'Left-sided hyperreflexia',
        'Babinski sign present on left'
      ]
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '10mg', frequency: 'Daily', indication: 'Blood pressure' },
        { name: 'Metformin', dose: '1000mg', frequency: 'Twice daily', indication: 'Diabetes' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: [
        'Hypertension (15 years)',
        'Type 2 Diabetes (10 years)',
        'Hyperlipidemia'
      ],
      surgicalHistory: ['Cataract surgery'],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Patient was fine, talking to wife, then suddenly developed slurred speech and left arm weakness. Wife noticed difficulty speaking immediately and called for ambulance. Patient denies headache. Wife reports no trauma. Patient was last seen normal 30 minutes before onset.',
      socialHistory: {
        smoking: 'Ex-smoker (quit 10 years ago)',
        alcohol: 'None',
        occupation: 'Retired teacher',
        livingSituation: 'Lives with wife'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '175/100', pulse: 88, respiration: 18, spo2: 97, gcs: 12, bloodGlucose: 8.2 }
    },
    expectedFindings: {
      keyObservations: [
        'Sudden onset neurological deficits',
        'Left hemiparesis',
        'Facial droop',
        'Dysarthria',
        'Left pupil sluggish',
        'Multiple stroke risk factors',
        'Hyperglycemia'
      ],
      redFlags: [
        'Sluggish pupil - possible sign of increased ICP',
        'Hyperglycemia - could indicate diabetes or stroke',
        'Hypertensive - may need BP management',
        'Sudden onset (time of onset critical for thrombolysis window)'
      ],
      differentialDiagnoses: [
        'Ischemic stroke (MCA distribution)',
        'Hemorrhagic stroke',
        'Hypoglycemia/hyperglycemia mimicking stroke',
        'Todd paralysis (post-seizure)',
        'Space-occupying lesion'
      ],
      mostLikelyDiagnosis: 'Acute Ischemic Stroke - Right MCA distribution until proven otherwise',
      supportingEvidence: [
        'Sudden onset focal deficits',
        'Left hemiparesis and facial droop',
        'Dysarthria',
        'Multiple cardiovascular risk factors',
        'Time course consistent with stroke'
      ]
    },
    managementPathway: {
      immediate: [
        'Systematic ABCDE',
        'Complete vital signs including blood glucose',
        'FAST assessment complete',
        'Determine exact time of onset',
        'Protect weak side',
        'Establish IV if protocols allow',
        'Cardiac monitor',
        'Consider stroke team activation'
      ],
      definitive: [
        'Rapid transport to stroke center',
        'Pre-alert hospital with FAST findings and time of onset',
        'Position to maintain airway and protect weak side',
        'Monitor GCS and pupil status',
        'Consider blood glucose management if protocols allow',
        'Do not give food or drink by mouth (NPO)'
      ],
      monitoring: [
        'Reassess GCS every 5-10 minutes',
        'Monitor pupil size and reactivity',
        'Monitor for deterioration (pupil changes, decreasing GCS)',
        'Monitor for seizure activity',
        'Repeat blood glucose if improving or worsening'
      ]
    },
    studentChecklist: [
      // 2nd Year Emphasis - Neurological Assessment (35%)
      {
        id: 'y2-003-gcs-accurate',
        category: 'abcde',
        description: 'Accurate GCS calculation including verbal score',
        points: 5,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Accurate GCS requires testing each component, not assuming'
      },
      {
        id: 'y2-003-pupils',
        category: 'abcde',
        description: 'Pupil assessment - size, equality, reactivity',
        points: 4,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Pupil changes are critical neurological signs'
      },
      {
        id: 'y2-003-glucose',
        category: 'abcde',
        description: 'Blood glucose check (stroke mimics)',
        points: 5,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Hypo/hyperglycemia can mimic stroke - treatable causes'
      },
      {
        id: 'y2-003-fasting',
        category: 'abcde',
        description: 'FAST assessment - Face, Arms, Speech, Time',
        points: 4,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'FAST identifies stroke quickly and accurately'
      },
      {
        id: 'y2-003-time-onset',
        category: 'history',
        description: 'Determine exact time of onset',
        points: 5,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Time of onset determines treatment eligibility (thrombolysis window)'
      },
      {
        id: 'y2-003-secondary-neuro',
        category: 'secondary',
        description: 'Complete neurological secondary survey',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Secondary survey identifies all neurological deficits'
      },
      {
        id: 'y2-003-limb-comparison',
        category: 'secondary',
        description: 'Compare bilateral limb strength',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Bilateral comparison highlights asymmetry'
      },

      // 2nd Year Emphasis - Clinical Reasoning (25%)
      {
        id: 'y2-003-pupil-significance',
        category: 'clinical-reasoning',
        description: 'Recognize significance of sluggish pupil',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Sluggish pupil suggests increased ICP - critical finding'
      },
      {
        id: 'y2-003-stroke-mimics',
        category: 'clinical-reasoning',
        description: 'Consider stroke mimics (hypo/hyperglycemia)',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Stroke mimics are treatable - don\'t anchor on stroke'
      },
      {
        id: 'y2-003-risk-factors',
        category: 'clinical-reasoning',
        description: 'Identify relevant stroke risk factors',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Risk factors support diagnosis and guide management'
      },

      // Documentation (20%)
      {
        id: 'y2-003-document-time',
        category: 'documentation',
        description: 'Document time of onset and last known normal',
        points: 3,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        critical: true,
        rationale: 'Time documentation is critical for stroke care'
      },
      {
        id: 'y2-003-document-gcs',
        category: 'documentation',
        description: 'Document GCS with breakdown (E/V/M)',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'GCS breakdown allows tracking changes'
      },
      {
        id: 'y2-003-document-neuro',
        category: 'documentation',
        description: 'Document neurological findings (pupils, limbs)',
        points: 2,
        yearLevel: ['2nd-year'],
        complexity: ['intermediate'],
        rationale: 'Neuro documentation provides baseline'
      }
    ],
    teachingPoints: [
      'Blood glucose is MANDATORY for all neurological presentations',
      'GCS must be calculated: Eye (1-4), Verbal (1-5), Motor (1-6)',
      'Pupil changes are late but critical signs of herniation',
      'Time of onset is the most important information',
      'Last known normal time determines treatment window',
      'FAST assessment: Face drooping, Arm weakness, Speech difficulties, Time',
      'Protect the weak side from injury during transport',
      'Document pupil findings with size and reactivity for EACH eye separately',
      'Stroke mimics exist - always consider alternatives'
    ],
    commonPitfalls: [
      'Not checking blood glucose',
      'Assuming GCS without testing each component',
      'Not documenting pupil findings separately',
      'Missing last known normal time',
      'Focusing only on obvious deficits and completing full assessment',
      'Forgetting to check blood sugar in diabetics',
      'Not protecting weak side'
    ],
    references: [
      'Neurological Emergencies - Stroke Chapter',
      'GCS Assessment Guide',
      'FAST Assessment Reference',
      'Blood Glucose in Neurological Emergencies'
    ]
  })
];

export default secondYearCases;
