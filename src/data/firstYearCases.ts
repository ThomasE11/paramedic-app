/**
 * 1st and 2nd Year Focused Cases
 *
 * These cases emphasize:
 * - Scene safety and BSI
 * - Patient introduction and consent
 * - Comprehensive SAMPLE history taking
 * - OPQRS pain assessment
 * - Systematic ABCDE assessment
 * - Complete vital signs
 * - Documentation skills
 *
 * Critical interventions are minimized to focus on assessment fundamentals.
 */

import type { CaseScenario } from '@/types';

const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

// ============================================================================
// 1ST YEAR CASES - Focus on Basics: Safety, Communication, History, Basic Assessment
// ============================================================================

export const firstYearCases: CaseScenario[] = [
  // Case 1: Simple fall - focus on scene safety, introduction, basic assessment
  createCase({
    id: 'y1-001',
    title: 'Elderly Female - Fall at Home',
    category: 'general',
    subcategory: 'fall',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '78-year-old female fallen, unable to get up',
      timeOfDay: 'morning',
      location: 'Apartment in Al Ain',
      callerInfo: 'Daughter (distressed)',
      dispatchCode: 'Alpha'
    },
    patientInfo: {
      age: 78,
      gender: 'female',
      weight: 60,
      language: 'Arabic',
      culturalConsiderations: ['Female patient may prefer female provider', 'Family presence important']
    },
    sceneInfo: {
      description: 'Ground floor apartment, patient on living room floor',
      hazards: ['Cluttered pathway', 'Rug beside patient', 'Limited space'],
      bystanders: 'Daughter present and anxious',
      environment: 'Warm apartment, air conditioning running'
    },
    initialPresentation: {
      generalImpression: 'Elderly female sitting on floor, alert and oriented',
      position: 'Sitting on floor, leaning against sofa',
      appearance: 'Calm, no visible distress',
      consciousness: 'Alert, responding appropriately'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking clearly', 'No stridor'],
        interventions: ['No intervention needed']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Breathing comfortably', 'No increased work of breathing', 'Good air entry bilaterally'],
        interventions: ['No intervention needed']
      },
      circulation: {
        pulseRate: 82,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 138, diastolic: 82 },
        capillaryRefill: 2,
        skin: 'Warm and dry, pink',
        findings: ['Good peripheral perfusion', 'No signs of shock'],
        interventions: ['No intervention needed']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive to light',
        findings: ['Fully oriented', 'No focal neurological deficits'],
        interventions: ['No intervention needed']
      },
      exposure: {
        findings: ['No obvious injuries', 'Possible bruise on right hip'],
        interventions: ['Check for injuries while maintaining dignity']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'Pupils equal and reactive'],
      neck: ['No pain on palpation', 'Full range of motion'],
      chest: ['Clear bilaterally', 'No tenderness'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable, no tenderness'],
      extremities: ['Right hip pain', 'No obvious deformity', 'Distal pulses present bilateral'],
      posterior: ['Patient reports back pain'],
      neurological: ['Sensation intact', 'Movement possible but painful at right hip']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Blood pressure' },
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Diabetes' },
        { name: 'Alendronate', dose: '70mg', frequency: 'Weekly', indication: 'Osteoporosis' }
      ],
      allergies: ['Penicillin - rash'],
      medicalConditions: ['Hypertension', 'Type 2 Diabetes', 'Osteoporosis', 'Glaucoma'],
      surgicalHistory: ['Cataract surgery (both eyes)', 'Hysterectomy'],
      lastMeal: 'Breakfast 2 hours ago - tea and bread',
      eventsLeading: 'Patient got up to go to bathroom, tripped on rug, fell onto carpet. Unable to get up due to hip pain. Daughter found her and called ambulance.',
      socialHistory: {
        smoking: 'Never smoked',
        alcohol: 'None',
        occupation: 'Retired teacher',
        livingSituation: 'Lives alone, daughter visits daily'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '138/82', pulse: 82, respiration: 18, spo2: 98, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Patient calm and cooperative',
        'No immediate life threats',
        'Possible hip injury from fall',
        'Good support from family'
      ],
      redFlags: [
        'Mechanism of fall (tripped vs collapsed)',
        'Possibility of prolonged time on floor',
        'Medication effects on fall risk'
      ],
      differentialDiagnoses: [
        'Hip fracture',
        'Soft tissue injury/bruising',
        'Pelvic fracture'
      ],
      mostLikelyDiagnosis: 'Possible hip fracture secondary to mechanical fall',
      supportingEvidence: [
        'Mechanical fall (tripped)',
        'Hip pain unable to bear weight',
        'Age and osteoporosis risk factors'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety - check for hazards',
        'Introduce self and role to patient',
        'Obtain consent for assessment',
        'Full set of vital signs',
        'SAMPLE history',
        'Check for time down on floor'
      ],
      definitive: [
        'Gentle examination focusing on painful areas',
        'Consider orthopedic padding vs full immobilization',
        'Transport to hospital for X-rays',
        'Pain management if needed and within protocols'
      ],
      monitoring: [
        'Repeat vital signs en route',
        'Monitor for changes in pain level',
        'Reassess distal circulation'
      ]
    },
    studentChecklist: [
      // 1st Year Emphasis - Safety and Communication (30%)
      {
        id: 'y1-scene-safety',
        category: 'safety',
        description: 'Assess scene safety before approaching patient',
        points: 5,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        critical: true,
        rationale: 'Scene safety is always the first priority'
      },
      {
        id: 'y1-bsi',
        category: 'safety',
        description: 'Apply appropriate PPE (gloves at minimum)',
        points: 5,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        critical: true,
        rationale: 'BSI protects both provider and patient'
      },
      {
        id: 'y1-introduction',
        category: 'communication',
        description: 'Introduce self, name, and role to patient',
        points: 3,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Professional introduction builds trust'
      },
      {
        id: 'y1-consent',
        category: 'communication',
        description: 'Ask permission before touching/examining patient',
        points: 3,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Respect patient autonomy and dignity'
      },
      {
        id: 'y1-level',
        category: 'communication',
        description: 'Get to patient\'s level (kneel/sit) when speaking',
        points: 2,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Eye level communication shows respect and improves connection'
      },

      // 1st Year Emphasis - History Taking (30%)
      {
        id: 'y1-sample-signs',
        category: 'history',
        description: 'SAMPLE: Signs/Symptoms - What prompted the call?',
        points: 3,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Understanding chief complaint guides assessment'
      },
      {
        id: 'y1-sample-allergies',
        category: 'history',
        description: 'SAMPLE: Allergies - Ask about allergies to meds/food/environment',
        points: 3,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Allergy information is critical for safety'
      },
      {
        id: 'y1-sample-medications',
        category: 'history',
        description: 'SAMPLE: Medications - Current medications and compliance',
        points: 3,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Medications help understand medical history and interactions'
      },
      {
        id: 'y1-sample-past',
        category: 'history',
        description: 'SAMPLE: Past medical history - Relevant conditions',
        points: 3,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Past history provides context for current presentation'
      },
      {
        id: 'y1-sample-lastmeal',
        category: 'history',
        description: 'SAMPLE: Last oral intake - When did patient last eat/drink?',
        points: 2,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Important if procedures or anesthesia might be needed'
      },
      {
        id: 'y1-sample-events',
        category: 'history',
        description: 'SAMPLE: Events leading - Detailed history of what happened',
        points: 3,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Understanding mechanism provides clues to injuries'
      },
      {
        id: 'y1-opqrs',
        category: 'history',
        description: 'OPQRS assessment for pain - Onset, Provokes, Quality, Region, Severity',
        points: 5,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Thorough pain assessment is essential for understanding complaints'
      },

      // 1st Year Emphasis - Systematic Assessment (25%)
      {
        id: 'y1-avpu',
        category: 'abcde',
        description: 'Assess AVPU (Alert, Voice, Pain, Unresponsive)',
        points: 3,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'AVPU is fundamental level of consciousness assessment'
      },
      {
        id: 'y1-breathing-assess',
        category: 'abcde',
        description: 'Breathing assessment - rate, effort, sounds',
        points: 3,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Basic breathing assessment identifies problems early'
      },
      {
        id: 'y1-circulation-check',
        category: 'abcde',
        description: 'Circulation check - pulse rate, skin color, temperature',
        points: 3,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Basic circulation assessment identifies shock'
      },
      {
        id: 'y1-vitals-bp',
        category: 'abcde',
        description: 'Obtain blood pressure',
        points: 4,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        critical: true,
        rationale: 'Blood pressure is a vital sign that must be measured'
      },
      {
        id: 'y1-vitals-pulse',
        category: 'abcde',
        description: 'Obtain pulse rate and quality',
        points: 2,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Pulse provides information about circulation'
      },
      {
        id: 'y1-vitals-rr',
        category: 'abcde',
        description: 'Obtain respiratory rate',
        points: 2,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Respiratory rate is an important vital sign'
      },
      {
        id: 'y1-vitals-spo2',
        category: 'abcde',
        description: 'Obtain SpO2 reading',
        points: 2,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Oxygen saturation assesses oxygenation'
      },
      {
        id: 'y1-head-to-toe',
        category: 'secondary',
        description: 'Perform basic head-to-toe examination',
        points: 4,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Systematic exam ensures nothing is missed'
      },

      // 1st Year Emphasis - Documentation (15%)
      {
        id: 'y1-document-vitals',
        category: 'documentation',
        description: 'Document all vital signs obtained',
        points: 2,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Documentation creates permanent record of assessment'
      },
      {
        id: 'y1-document-history',
        category: 'documentation',
        description: 'Document SAMPLE history findings',
        points: 2,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'History documentation is essential for continuity of care'
      },
      {
        id: 'y1-document-times',
        category: 'documentation',
        description: 'Document assessment time',
        points: 1,
        yearLevel: ['1st-year'],
        complexity: ['basic'],
        rationale: 'Time documentation is important for tracking'
      }
    ],
    teachingPoints: [
      'Always start with scene safety and BSI - these are non-negotiable',
      'Introduction and consent show respect and build trust',
      'SAMPLE is a framework - don\'t just recite letters, actually get the information',
      'OPQRS should be used for ANY pain or discomfort complaint',
      'Get to the patient\'s level - this improves communication and examination',
      'Don\'t rush - thorough assessment is more important than speed in 1st year',
      'Document as you go - don\'t rely on memory'
    ],
    commonPitfalls: [
      'Rushing introduction or skipping consent',
      'Missing SAMPLE components - especially medications and allergies',
      'Forgetting to ask OPQRS for pain',
      'Not documenting vital signs immediately',
      'Standing over patient instead of getting to their level',
      'Being task-focused instead of patient-focused'
    ],
    references: [
      'Patient Assessment Chapter - Fundamentals of Paramedic Practice',
      'Communication and Documentation Standards'
    ]
  }),

  // Case 2: Abdominal pain - focus on history taking, SAMPLE, OPQRS
  createCase({
    id: 'y1-002',
    title: 'Young Adult - Abdominal Pain',
    category: 'general',
    subcategory: 'abdominal-pain',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year'],
    estimatedDuration: 18,
    dispatchInfo: {
      callReason: '25-year-old male with abdominal pain',
      timeOfDay: 'afternoon',
      location: 'Office building in Dubai',
      callerInfo: 'Receptionist',
      dispatchCode: 'Alpha'
    },
    patientInfo: {
      age: 25,
      gender: 'male',
      weight: 75,
      language: 'English',
      culturalConsiderations: ['Professional setting, maintain privacy']
    },
    sceneInfo: {
      description: 'Private office, patient sitting in chair holding abdomen',
      hazards: ['None identified'],
      bystanders: 'Receptionist nearby',
      environment: 'Air conditioned office'
    },
    initialPresentation: {
      generalImpression: 'Young male, appears uncomfortable but not distressed',
      position: 'Sitting forward, holding right lower quadrant',
      appearance: 'Pale, guarding abdomen',
      consciousness: 'Alert, responding appropriately'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking full sentences'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Slightly shallow due to pain',
        spo2: 99,
        findings: ['Mild tachypnea possibly due to pain', 'Clear lung sounds'],
        interventions: []
      },
      circulation: {
        pulseRate: 88,
        pulseQuality: 'Regular and strong',
        bp: { systolic: 125, diastolic: 78 },
        capillaryRefill: 2,
        skin: 'Warm, slightly pale',
        findings: ['Mild tachycardia likely pain related'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Alert and oriented x4'],
        interventions: []
      },
      exposure: {
        findings: ['Guarding right lower quadrant', 'No obvious external signs of trauma'],
        interventions: ['Expose abdomen for examination while maintaining modesty']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Supple, no meningismus'],
      chest: ['Clear bilaterally'],
      abdomen: ['Guarding RLQ', 'Rebound tenderness present', 'McBurnery\'s point tender', 'Bowel sounds diminished'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['No known allergies'],
      medicalConditions: ['None reported'],
      surgicalHistory: ['Appendectomy age 12 (per patient)'],
      lastMeal: 'Lunch 4 hours ago',
      eventsLeading: 'Pain started around 10am this morning, initially around umbilicus, now localized to RLQ. Nausea but no vomiting. One episode of diarrhea.',
      socialHistory: {
        smoking: 'Social smoker',
        alcohol: 'Occasional',
        occupation: 'Accountant',
        livingSituation: 'Lives alone in apartment'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '125/78', pulse: 88, respiration: 20, spo2: 99, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'RLQ abdominal pain with rebound tenderness',
        'History of pain migration (periumbilical to RLQ)',
        'Previous appendectomy reported (may be unreliable)',
        'Nausea and one episode of diarrhea'
      ],
      redFlags: [
        'Rebound tenderness suggests peritoneal irritation',
        'Previous appendectomy vs current presentation',
        'Pain progression over several hours'
      ],
      differentialDiagnoses: [
        'Appendicitis (if previous surgery incorrect)',
        'Mesenteric adenitis',
        'Gastroenteritis',
        'Ovarian pathology if gender misidentified',
        'Renal colic'
      ],
      mostLikelyDiagnosis: 'Appendicitis (or other surgical abdomen)',
      supportingEvidence: [
        'Migratory pain pattern',
        'Rebound tenderness',
        'Anorexia, nausea',
        'Guarding behavior'
      ]
    },
    managementPathway: {
      immediate: [
        'Introduction and consent',
        'Thorough SAMPLE and OPQRS history',
        'Full set of vital signs',
        'Avoid oral intake (NPO)',
        'Position of comfort',
        'Monitor for changes'
      ],
      definitive: [
        'IV access if protocols allow',
        'Transport to emergency department',
        'Pain management if within protocols'
      ],
      monitoring: [
        'Vital signs every 5-10 minutes',
        'Pain assessment',
        'Monitor for perfusion changes'
      ]
    },
    studentChecklist: [
      // Safety and Communication
      { id: 'y1-002-scene', category: 'safety', description: 'Assess scene safety', points: 3, yearLevel: ['1st-year'], complexity: ['basic'], critical: true },
      { id: 'y1-002-intro', category: 'communication', description: 'Introduce self and obtain consent', points: 3, yearLevel: ['1st-year'], complexity: ['basic'] },
      { id: 'y1-002-privacy', category: 'communication', description: 'Maintain patient privacy during exam', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },

      // History - KEY EMPHASIS for abdominal pain case
      { id: 'y1-002-sample-full', category: 'history', description: 'Complete SAMPLE history', points: 5, yearLevel: ['1st-year'], complexity: ['basic'], critical: true },
      { id: 'y1-002-opqrs-onset', category: 'history', description: 'OPQRS: Onset - When did pain start?', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },
      { id: 'y1-002-opqrs-provokes', category: 'history', description: 'OPQRS: Provokes - What makes it better/worse?', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },
      { id: 'y1-002-opqrs-quality', category: 'history', description: 'OPQRS: Quality - Describe the pain', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },
      { id: 'y1-002-opqrs-region', category: 'history', description: 'OPQRS: Region/Radiation - Where does pain go?', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },
      { id: 'y1-002-opqrs-severity', category: 'history', description: 'OPQRS: Severity - Pain scale 1-10', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },
      { id: 'y1-002-last-meal', category: 'history', description: 'Determine last oral intake', points: 3, yearLevel: ['1st-year'], complexity: ['basic'], critical: true },
      { id: 'y1-002-surgical', category: 'history', description: 'Surgical history - especially abdominal', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },

      // Assessment
      { id: 'y1-002-vitals', category: 'abcde', description: 'Full set of vital signs', points: 5, yearLevel: ['1st-year'], complexity: ['basic'], critical: true },
      { id: 'y1-002-abdomen-assess', category: 'secondary', description: 'Abdominal assessment - inspection, auscultation', points: 3, yearLevel: ['1st-year'], complexity: ['basic'] },
      { id: 'y1-002-npo', category: 'intervention', description: 'Keep patient NPO (nothing by mouth)', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },

      // Documentation
      { id: 'y1-002-document', category: 'documentation', description: 'Document history and findings', points: 3, yearLevel: ['1st-year'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Abdominal pain requires thorough history - physical exam has limitations',
      'OPQRS is essential for any pain complaint',
      'SAMPLE medications must include prescription, OTC, and herbal',
      'Always ask about last meal for abdominal pain cases',
      'Surgical history is crucial - patient reports can be unreliable',
      'Maintain patient modesty during abdominal examination',
      'Nothing by mouth (NPO) for potential surgical cases'
    ],
    commonPitfalls: [
      'Not completing OPQRS for pain',
      'Forgetting to ask about surgical history',
      'Missing last oral intake',
      'Not maintaining patient privacy',
      'Making assumptions without thorough history'
    ],
    references: [
      'Abdominal Emergencies Chapter',
      'Patient Assessment - History Taking Section'
    ]
  }),

  // Case 3: Diabetic patient - focus on SAMPLE, blood glucose, communication
  createCase({
    id: 'y1-003',
    title: 'Middle-Aged Male - Feeling Unwell (Diabetic)',
    category: 'metabolic',
    subcategory: 'hypoglycemia',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: '45-year-old diabetic feeling "not right"',
      timeOfDay: 'evening',
      location: 'Residential home in Dubai',
      callerInfo: 'Wife',
      dispatchCode: 'Alpha'
    },
    patientInfo: {
      age: 45,
      gender: 'male',
      weight: 85,
      language: 'Arabic',
      culturalConsiderations: ['Wife very involved in care', 'Family presence desired']
    },
    sceneInfo: {
      description: 'Family home, patient in bedroom',
      hazards: ['None'],
      bystanders: 'Wife present and helpful',
      environment: 'Comfortable home environment'
    },
    initialPresentation: {
      generalImpression: 'Adult male, alert but appears tired and slightly confused',
      position: 'Lying in bed',
      appearance: 'Slightly diaphoretic, pale',
      consciousness: 'Alert but responds slowly'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: []
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Breathing normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 92,
        pulseQuality: 'Regular, slightly weak',
        bp: { systolic: 118, diastolic: 72 },
        capillaryRefill: 3,
        skin: 'Cool, diaphoretic',
        findings: ['Mild tachycardia', 'Delayed capillary refill'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal 3mm, reactive',
        bloodGlucose: 3.2,
        findings: ['Slightly confused', 'Blood glucose low'],
        interventions: ['Consider oral glucose if patient able to swallow safely']
      },
      exposure: {
        findings: ['Diaphoresis present', 'No signs of trauma'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['Cool to touch', 'Peripheral pulses present but weak'],
      posterior: ['Normal'],
      neurological: ['Mild confusion present', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Metformin', dose: '1000mg', frequency: 'Twice daily', indication: 'Diabetes' },
        { name: 'Sitagliptin', dose: '100mg', frequency: 'Daily', indication: 'Diabetes' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: ['Type 2 Diabetes (5 years)', 'Hypertension'],
      surgicalHistory: ['None'],
      lastMeal: 'Dinner 3 hours ago - ate normally',
      eventsLeading: 'Patient missed lunch today. Wife found him confused around 7pm. He has been "feeling off" since mid-afternoon.',
      socialHistory: {
        smoking: 'Ex-smoker',
        alcohol: 'Social',
        occupation: 'Office worker',
        livingSituation: 'Lives with wife and children'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '118/72', pulse: 92, respiration: 18, spo2: 98, gcs: 14, bloodGlucose: 3.2 },
      afterIntervention: { bp: '122/75', pulse: 88, respiration: 18, spo2: 99, gcs: 15, bloodGlucose: 5.8 }
    },
    expectedFindings: {
      keyObservations: [
        'Diabetic patient with altered mental status',
        'Blood glucose 3.2 mmol/L (hypoglycemic)',
        'History of missed meal',
        'Diaphoresis and confusion'
      ],
      redFlags: [
        'Hypoglycemia in diabetic patient',
        'Altered mental status',
        'Potential for rapid deterioration'
      ],
      differentialDiagnoses: [
        'Hypoglycemia',
        'Hyperglycemia (DKA early)',
        'Stroke',
        'Sepsis'
      ],
      mostLikelyDiagnosis: 'Hypoglycemia secondary to missed meals and diabetes medications',
      supportingEvidence: [
        'Low blood glucose reading',
        'Missed meal',
        'Diaphoresis, confusion',
        'Diabetic on medications'
      ]
    },
    managementPathway: {
      immediate: [
        'Scene safety, introduction, consent',
        'ABC assessment',
        'Check blood glucose',
        'SAMPLE history with emphasis on diabetes management',
        'Consider oral glucose if able to swallow'
      ],
      definitive: [
        'Reassess blood glucose',
        'Transport if unable to raise glucose or if symptoms persist',
        'Consider IV glucose if protocols allow and patient condition warrants'
      ],
      monitoring: [
        'Repeat blood glucose',
        'Monitor mental status',
        'Monitor vital signs'
      ]
    },
    studentChecklist: [
      // Safety and Communication
      { id: 'y1-003-scene', category: 'safety', description: 'Scene safety assessment', points: 3, yearLevel: ['1st-year'], complexity: ['basic'], critical: true },
      { id: 'y1-003-bsi', category: 'safety', description: 'BSI - gloves at minimum', points: 2, yearLevel: ['1st-year'], complexity: ['basic'], critical: true },
      { id: 'y1-003-intro', category: 'communication', description: 'Introduction and consent', points: 3, yearLevel: ['1st-year'], complexity: ['basic'] },
      { id: 'y1-003-family', category: 'communication', description: 'Include family in information gathering', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },

      // History - DIABETES FOCUS
      { id: 'y1-003-sample', category: 'history', description: 'Complete SAMPLE history', points: 5, yearLevel: ['1st-year'], complexity: ['basic'], critical: true },
      { id: 'y1-003-diabetes-meds', category: 'history', description: 'Specific diabetes medications and timing', points: 3, yearLevel: ['1st-year'], complexity: ['basic'], critical: true },
      { id: 'y1-003-meal-times', category: 'history', description: 'Last meal and eating pattern', points: 3, yearLevel: ['1st-year'], complexity: ['basic'], critical: true },
      { id: 'y1-003-symptoms', category: 'history', description: 'Current symptoms and onset', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },

      // Assessment - GLUCOSE FOCUS
      { id: 'y1-003-avpu', category: 'abcde', description: 'AVPU assessment', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },
      { id: 'y1-003-glucose', category: 'abcde', description: 'Check blood glucose', points: 5, yearLevel: ['1st-year'], complexity: ['basic'], critical: true },
      { id: 'y1-003-vitals', category: 'abcde', description: 'Full set of vital signs', points: 3, yearLevel: ['1st-year'], complexity: ['basic'] },
      { id: 'y1-003-skin', category: 'abcde', description: 'Skin assessment (diaphoresis)', points: 2, yearLevel: ['1st-year'], complexity: ['basic'] },

      // Documentation
      { id: 'y1-003-document-glucose', category: 'documentation', description: 'Document glucose reading and time', points: 3, yearLevel: ['1st-year'], complexity: ['basic'], critical: true }
    ],
    teachingPoints: [
      'Always check blood glucose in altered mental status',
      'SAMPLE for diabetic patients MUST include medication timing and meals',
      'Hypoglycemia can cause rapid deterioration - act quickly',
      'Skin assessment (diaphoresis) provides important clues',
      'Family members are valuable information sources',
      'Never assume altered mental status is "just diabetes"'
    ],
    commonPitfalls: [
      'Not checking blood glucose in confused patient',
      'Incomplete medication history',
      'Not asking about meal timing',
      'Focusing only on blood sugar and missing other causes',
      'Forgetting to document glucose reading with time'
    ],
    references: [
      'Diabetic Emergencies Chapter',
      'Blood Glucose Monitoring Guidelines'
    ]
  })
];

export default firstYearCases;
