import type { CaseScenario } from '@/types';

// Import enhanced cases
import { enhancedCaseDatabase } from './enhancedCases';

// Import visual resources
import { getTraumaResourcesByCondition } from './traumaVisualResources';

// Helper function to create a case with enhanced structure
const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

// Comprehensive Case Database - 50+ Scenarios with Enhanced Detail
export const caseDatabase: CaseScenario[] = [
  // ==================== CARDIAC CASES (8 cases) ====================
  createCase({
    id: 'cardiac-001',
    title: 'Acute Anterior STEMI',
    category: 'cardiac',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Severe chest pain, patient called 999 himself',
      timeOfDay: 'morning',
      location: 'Private villa in Al Barsha, Dubai',
      callerInfo: 'Patient (45-year-old male)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient sounds distressed', 'No history of this pain before']
    },
    patientInfo: {
      age: 45,
      gender: 'male',
      weight: 85,
      occupation: 'Business executive',
      language: 'English, Arabic',
      culturalConsiderations: ['Prefers male healthcare providers']
    },
    sceneInfo: {
      description: 'Well-maintained villa, patient sitting on living room sofa',
      hazards: [],
      bystanders: 'Wife present, anxious',
      environment: 'Air-conditioned, comfortable temperature',
      accessIssues: ['Security gate - code provided'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, diaphoretic, clutching chest',
      position: 'Sitting upright, leaning forward',
      appearance: 'Pale, sweaty, distressed',
      consciousness: 'Alert and oriented',
      sounds: ['Groaning with pain']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'No stridor', 'Able to speak in short sentences'],
        interventions: ['Maintain patent airway'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 24,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Tachypneic', 'Clear bilateral air entry', 'No added sounds'],
        interventions: ['High-flow oxygen 15L/min via non-rebreather'],
        auscultation: ['Clear air entry bilaterally', 'No crackles', 'No wheeze']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Weak, thready',
        bp: { systolic: 90, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, clammy, diaphoretic',
        findings: ['Tachycardic', 'Hypotensive', 'Poor perfusion'],
        interventions: ['IV access x2', 'Aspirin 300mg', 'GTN spray'],
        ecgFindings: ['ST elevation V1-V4', 'Tombstone ST segments'],
        ivAccess: ['16G cannula right AC fossa']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive to light',
        findings: ['No focal neurological deficits'],
        interventions: []
      },
      exposure: {
        findings: ['No rashes', 'No external bleeding'],
        interventions: ['Keep warm']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'No JVD'],
      neck: ['Trachea central', 'No subcutaneous emphysema'],
      chest: ['Equal chest expansion', 'Heart sounds S1S2 present'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Equal pulses bilaterally', 'No edema'],
      posterior: ['No bruising'],
      neurological: ['GCS 15', 'No deficits']
    },
    history: {
      medications: [
        { name: 'Atorvastatin', dose: '40mg', frequency: 'Once daily', indication: 'High cholesterol', route: 'PO' },
        { name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', indication: 'Hypertension', route: 'PO' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Hypertension', 'Hyperlipidemia', 'Smoker (20 pack-years)'],
      surgicalHistory: ['Appendectomy 2010'],
      lastMeal: 'Breakfast 2 hours ago',
      eventsLeading: 'Chest pain started 30 minutes ago while at rest, described as crushing pressure radiating to left arm and jaw',
      socialHistory: {
        smoking: '20 pack-years, currently smoking',
        alcohol: 'Social',
        occupation: 'Business executive - high stress'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Chest pain', findings: 'ST elevation V1-V4', interpretation: 'Acute anterior STEMI', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '90/60', pulse: 110, respiration: 24, spo2: 94, gcs: 15 },
      afterIntervention: { bp: '100/70', pulse: 105, respiration: 22, spo2: 98, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Crushing chest pain', 'Diaphoresis', 'Radiation to arm/jaw', 'Hypotension'],
      redFlags: ['STEMI presentation', 'Cardiogenic shock risk'],
      differentialDiagnoses: ['Acute MI', 'Unstable angina', 'Aortic dissection', 'Pulmonary embolism'],
      mostLikelyDiagnosis: 'Acute Anterior STEMI',
      supportingEvidence: ['ST elevation V1-V4', 'Typical chest pain', 'Diaphoresis']
    },
    managementPathway: {
      immediate: ['Aspirin 300mg', 'GTN spray', 'IV access', '12-lead ECG'],
      definitive: ['Primary PCI', 'Thrombolysis if PCI not available within 120 min'],
      monitoring: ['Continuous ECG', 'BP monitoring', 'SpO2'],
      transportConsiderations: ['Pre-alert cardiac center', 'Priority 1 transport', 'Consider HEMS']
    },
    studentChecklist: [
      { id: 'c1-1', category: 'abcde', description: 'Assess airway patency', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], rationale: 'Airway is first priority in ABCDE approach' },
      { id: 'c1-2', category: 'abcde', description: 'Administer high-flow oxygen', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], rationale: 'Maintain oxygenation in ACS' },
      { id: 'c1-3', category: 'abcde', description: 'Establish IV access', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'c1-4', category: 'intervention', description: 'Give Aspirin 300mg', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true, timeframe: 'Within 5 minutes', rationale: 'Antiplatelet therapy reduces mortality in STEMI' },
      { id: 'c1-5', category: 'intervention', description: 'Administer GTN (if BP allows)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], rationale: 'GTN contraindicated if SBP < 90 mmHg' },
      { id: 'c1-6', category: 'communication', description: 'Pre-alert cardiac center', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c1-7', category: 'documentation', description: 'Obtain 12-lead ECG within 10 minutes', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true, timeframe: 'Within 10 minutes of arrival', rationale: 'Time is muscle - rapid ECG essential' }
    ],
    teachingPoints: [
      'Time is muscle - rapid recognition and transport is crucial',
      'Obtain 12-lead ECG within 10 minutes of arrival',
      'Aspirin should be given early unless contraindicated',
      'GTN contraindicated if SBP < 90 mmHg',
      'Door-to-balloon time target is 90 minutes'
    ],
    commonPitfalls: [
      'Delaying ECG to obtain full history',
      'Giving GTN when hypotensive',
      'Not pre-alerting receiving hospital'
    ]
  }),

  createCase({
    id: 'cardiac-002',
    title: 'Out-of-Hospital Cardiac Arrest',
    category: 'cardiac',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 35,
    dispatchInfo: {
      callReason: 'Husband not breathing, wife found him unconscious in bed',
      timeOfDay: 'early-morning',
      location: 'Apartment in Deira, Dubai',
      callerInfo: 'Wife (distressed)',
      dispatchCode: 'Delta-1',
      additionalInfo: ['Patient last seen 4 hours ago', 'Wife unable to move patient']
    },
    patientInfo: {
      age: 62,
      gender: 'male',
      weight: 78,
      occupation: 'Retired engineer',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Small apartment, patient in bedroom',
      hazards: ['Cluttered floor'],
      bystanders: 'Wife and adult son present',
      environment: 'Dim lighting, warm',
      accessIssues: ['Narrow hallway', 'Patient on bed']
    },
    initialPresentation: {
      generalImpression: 'Elderly male, supine in bed, unresponsive',
      position: 'Supine',
      appearance: 'Cyanotic around lips, no visible breathing',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Airway obstructed by tongue', 'No gag reflex'],
        interventions: ['Head tilt chin lift', 'Insert oropharyngeal airway'],
        adjunctsNeeded: ['OPA size 90mm', 'Suction']
      },
      breathing: {
        rate: 0,
        rhythm: 'None',
        depth: 'None',
        spo2: 0,
        findings: ['Apneic', 'No chest movement'],
        interventions: ['BVM ventilation', 'Consider advanced airway']
      },
      circulation: {
        pulseRate: 0,
        pulseQuality: 'None',
        bp: { systolic: 0, diastolic: 0 },
        capillaryRefill: 0,
        skin: 'Pale, mottled',
        findings: ['No carotid pulse', 'Asystole on monitor'],
        interventions: ['Immediate CPR', 'Defibrillation if indicated']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 1, total: 3 },
        pupils: 'Dilated, fixed',
        findings: ['Unresponsive', 'No brainstem reflexes'],
        interventions: []
      },
      exposure: {
        findings: ['No obvious trauma', 'Medical alert bracelet - Diabetes'],
        interventions: ['Full exposure for assessment']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No JVD'],
      chest: ['No scars'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['No edema'],
      posterior: ['No pressure sores'],
      neurological: ['Unresponsive']
    },
    history: {
      medications: [
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', indication: 'Diabetes' },
        { name: 'Insulin', dose: 'Variable', frequency: 'As directed', indication: 'Diabetes' },
        { name: 'Aspirin', dose: '75mg', frequency: 'Once daily', indication: 'Heart protection' }
      ],
      allergies: ['Penicillin'],
      medicalConditions: ['Type 2 Diabetes', 'Hypertension', 'Previous MI (2019)'],
      surgicalHistory: ['CABG 2019'],
      lastMeal: 'Dinner 8 hours ago',
      eventsLeading: 'Wife woke up to find husband unresponsive, last seen normal 4 hours ago'
    },
    vitalSignsProgression: {
      initial: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3 }
    },
    expectedFindings: {
      keyObservations: ['Unresponsive', 'Apneic', 'Pulseless', 'Asystole/PEA/VF'],
      redFlags: ['Cardiac arrest', 'Downtime unknown'],
      differentialDiagnoses: ['Cardiac arrest - MI', 'Cardiac arrest - arrhythmia', 'Hypoglycemia'],
      mostLikelyDiagnosis: 'Cardiac arrest - suspected MI'
    },
    studentChecklist: [
      { id: 'c2-1', category: 'abcde', description: 'Confirm cardiac arrest (check pulse)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c2-2', category: 'abcde', description: 'Initiate immediate CPR', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c2-3', category: 'intervention', description: 'Apply AED/defibrillator', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'c2-4', category: 'intervention', description: 'Establish IV/IO access', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c2-5', category: 'intervention', description: 'Administer adrenaline 1mg every 3-5 min', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c2-6', category: 'abcde', description: 'Airway management - OPA/LMA/ETT', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c2-7', category: 'communication', description: 'Coordinate team roles', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'High-quality CPR is essential - depth 5-6cm, rate 100-120/min',
      'Minimize interruptions to compressions',
      'Consider reversible causes (Hs and Ts)',
      'Early defibrillation for shockable rhythms'
    ]
  }),

  createCase({
    id: 'cardiac-003',
    title: 'Atrial Fibrillation with Rapid Ventricular Response',
    category: 'cardiac',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['3rd-year'],
    dispatchInfo: {
      callReason: 'Palpitations and dizziness',
      timeOfDay: 'afternoon',
      location: 'Office in Downtown Dubai',
      callerInfo: 'Colleague',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 58,
      gender: 'female',
      weight: 70,
      occupation: 'Accountant',
      language: 'English'
    },
    sceneInfo: {
      description: 'Office environment, patient at desk',
      hazards: [],
      bystanders: 'Several colleagues',
      environment: 'Air-conditioned office'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged female, anxious, uncomfortable',
      position: 'Sitting',
      appearance: 'Pale, anxious',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Mild tachypnea'],
        interventions: ['Oxygen if symptomatic']
      },
      circulation: {
        pulseRate: 150,
        pulseQuality: 'Irregularly irregular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Warm, dry',
        findings: ['Tachycardic', 'Irregular pulse'],
        interventions: ['IV access', 'ECG monitoring'],
        ecgFindings: ['Irregularly irregular rhythm', 'No P waves', 'Narrow QRS']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Anxious'],
        interventions: []
      },
      exposure: {
        findings: ['No abnormalities'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Warfarin', dose: '5mg', frequency: 'Daily', indication: 'AF anticoagulation' }
      ],
      allergies: ['None'],
      medicalConditions: ['Atrial fibrillation', 'Hypertension'],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Sudden onset of palpitations while working at desk'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 150, respiration: 22, spo2: 96, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Irregularly irregular pulse', 'Rate 150 bpm', 'On warfarin'],
      redFlags: ['Unstable AF - hypotension', 'Chest pain'],
      differentialDiagnoses: ['AF with RVR', 'SVT', 'Thyrotoxicosis', 'PE'],
      mostLikelyDiagnosis: 'Atrial Fibrillation with Rapid Ventricular Response'
    },
    studentChecklist: [
      { id: 'c3-1', category: 'abcde', description: 'Assess for stability', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c3-2', category: 'intervention', description: 'Obtain 12-lead ECG', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c3-3', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'c3-4', category: 'intervention', description: 'Check INR if on warfarin', points: 5, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'Assess hemodynamic stability first',
      'Unstable AF requires synchronized cardioversion',
      'Stable AF can be rate controlled',
      'Anticoagulation status important for stroke risk'
    ]
  }),

  createCase({
    id: 'cardiac-004',
    title: 'Hypertensive Emergency',
    category: 'cardiac',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    dispatchInfo: {
      callReason: 'Severe headache, vision changes',
      timeOfDay: 'evening',
      location: 'Villa in Jumeirah, Dubai',
      callerInfo: 'Housekeeper',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 52,
      gender: 'male',
      weight: 95,
      occupation: 'CEO',
      language: 'English'
    },
    sceneInfo: {
      description: 'Luxury villa, patient in study',
      hazards: [],
      bystanders: 'Housekeeper',
      environment: 'Well-lit, comfortable'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, distressed, holding head',
      position: 'Sitting',
      appearance: 'Flushed, diaphoretic',
      consciousness: 'Alert but confused'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Bounding',
        bp: { systolic: 240, diastolic: 130 },
        capillaryRefill: 2,
        skin: 'Warm, flushed',
        findings: ['Severely hypertensive', 'Bounding pulse'],
        interventions: ['IV access', 'BP monitoring'],
        ecgFindings: ['LVH pattern', 'ST-T wave changes']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal, sluggish',
        findings: ['Confused', 'Papilledema on fundoscopy'],
        interventions: []
      },
      exposure: {
        findings: ['No edema'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Severe headache', 'Papilledema'],
      neck: ['No JVD'],
      chest: ['Heart sounds normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Confused', 'Cranial nerves intact']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '10mg', frequency: 'Daily', indication: 'Hypertension' }
      ],
      allergies: ['None'],
      medicalConditions: ['Hypertension', 'CKD Stage 3'],
      surgicalHistory: [],
      lastMeal: 'Dinner 3 hours ago',
      eventsLeading: 'Severe headache developed over 2 hours, ran out of BP medication 3 days ago'
    },
    vitalSignsProgression: {
      initial: { bp: '240/130', pulse: 95, respiration: 20, spo2: 98, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['BP 240/130', 'Headache', 'Confusion', 'Vision changes'],
      redFlags: ['Hypertensive encephalopathy', 'Risk of stroke'],
      differentialDiagnoses: ['Hypertensive emergency', 'Stroke', 'Pheochromocytoma'],
      mostLikelyDiagnosis: 'Hypertensive Emergency'
    },
    studentChecklist: [
      { id: 'c4-1', category: 'abcde', description: 'Confirm BP in both arms', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'c4-2', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'c4-3', category: 'intervention', description: 'Check for end-organ damage', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'Hypertensive emergency = elevated BP + end-organ damage',
      'Do NOT lower BP too rapidly - risk of stroke',
      'Target 10-20% reduction in first hour',
      'Look for causes: medication non-compliance, renal disease'
    ]
  }),

  // ==================== RESPIRATORY CASES (7 cases) ====================
  createCase({
    id: 'resp-001',
    title: 'Life-Threatening Asthma Attack',
    category: 'respiratory',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    dispatchInfo: {
      callReason: 'Son cannot breathe, using inhaler repeatedly',
      timeOfDay: 'evening',
      location: 'Villa in Al Ain',
      callerInfo: 'Mother',
      dispatchCode: 'Echo-2'
    },
    patientInfo: {
      age: 19,
      gender: 'male',
      weight: 65,
      occupation: 'University student',
      language: 'Arabic, English'
    },
    sceneInfo: {
      description: 'Bedroom, patient sitting on edge of bed',
      hazards: [],
      bystanders: 'Parents present',
      environment: 'Dust visible, carpeted room'
    },
    initialPresentation: {
      generalImpression: 'Young male, tripod position, severe respiratory distress',
      position: 'Sitting upright, leaning forward (tripod)',
      appearance: 'Diaphoretic, anxious, unable to speak in sentences',
      consciousness: 'Alert but distressed'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent but compromised', 'Inspiratory and expiratory wheeze audible'],
        interventions: ['High-flow oxygen']
      },
      breathing: {
        rate: 32,
        rhythm: 'Labored',
        depth: 'Shallow',
        spo2: 88,
        findings: ['Severe tachypnea', 'Accessory muscle use', 'Intercostal recession', 'Prolonged expiratory phase', 'Widespread wheeze'],
        interventions: ['Salbutamol nebulizer', 'Ipratropium bromide', 'Consider magnesium'],
        auscultation: ['Widespread polyphonic wheeze', 'Reduced air entry', 'Prolonged expiratory phase']
      },
      circulation: {
        pulseRate: 120,
        pulseQuality: 'Bounding',
        bp: { systolic: 130, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Warm, diaphoretic',
        findings: ['Tachycardia', 'Pulsus paradoxus'],
        interventions: ['IV access', 'Fluids if dehydrated']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        findings: ['Anxious', 'Unable to complete sentences'],
        interventions: ['Reassurance']
      },
      exposure: {
        findings: ['Multiple inhalers visible', 'Peak flow meter on table'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Trachea central', 'No lymphadenopathy'],
      chest: ['Hyperexpanded', 'Widespread wheeze', 'Reduced air entry bilaterally'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Anxious but oriented']
    },
    history: {
      medications: [
        { name: 'Salbutamol inhaler', dose: '100mcg', frequency: 'PRN', indication: 'Asthma' },
        { name: 'Beclomethasone inhaler', dose: '200mcg', frequency: 'Twice daily', indication: 'Asthma preventer' },
        { name: 'Montelukast', dose: '10mg', frequency: 'Daily', indication: 'Asthma' }
      ],
      allergies: ['Dust', 'Pollen', 'Cat dander'],
      medicalConditions: ['Severe asthma since childhood', 'Multiple hospital admissions', 'Previous ICU admission 2 years ago'],
      surgicalHistory: [],
      lastMeal: 'Dinner 2 hours ago',
      eventsLeading: 'Started feeling tight chest after cleaning dusty room, used inhaler 10 times with no relief'
    },
    vitalSignsProgression: {
      initial: { bp: '130/80', pulse: 120, respiration: 32, spo2: 88, gcs: 14 },
      afterIntervention: { bp: '125/78', pulse: 110, respiration: 26, spo2: 92, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Severe respiratory distress', 'Peak flow <50% predicted', 'Silent chest warning sign'],
      redFlags: ['Life-threatening asthma', 'Exhaustion risk', 'Respiratory arrest imminent'],
      differentialDiagnoses: ['Severe acute asthma', 'Anaphylaxis', 'Pulmonary embolism'],
      mostLikelyDiagnosis: 'Life-threatening Asthma Exacerbation'
    },
    studentChecklist: [
      { id: 'r1-1', category: 'abcde', description: 'Recognize life-threatening asthma', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r1-2', category: 'intervention', description: 'High-flow oxygen immediately', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r1-3', category: 'intervention', description: 'Salbutamol nebulizer continuously', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r1-4', category: 'intervention', description: 'Ipratropium bromide nebulizer', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r1-5', category: 'intervention', description: 'IV hydrocortisone early', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r1-6', category: 'intervention', description: 'Consider magnesium sulfate', points: 5, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'r1-7', category: 'communication', description: 'Pre-alert hospital for possible intubation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Silent chest in asthma is a pre-arrest sign',
      'Continuous nebulized beta-agonists in severe cases',
      'Early steroids improve outcomes',
      'Have intubation equipment ready'
    ]
  }),

  createCase({
    id: 'resp-002',
    title: 'Pneumothorax - Tension',
    category: 'respiratory',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    dispatchInfo: {
      callReason: 'Sudden chest pain, difficulty breathing after fall',
      timeOfDay: 'afternoon',
      location: 'Construction site, Dubai',
      callerInfo: 'Supervisor',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 34,
      gender: 'male',
      weight: 80,
      occupation: 'Construction worker',
      language: 'Hindi, Basic English'
    },
    sceneInfo: {
      description: 'Outdoor construction site',
      hazards: ['Heavy machinery', 'Uneven ground'],
      bystanders: 'Coworkers',
      environment: 'Hot, dusty'
    },
    initialPresentation: {
      generalImpression: 'Young male, severe distress, cyanotic',
      position: 'Sitting upright',
      appearance: 'Cyanotic, distressed, diaphoretic',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 36,
        rhythm: 'Labored',
        depth: 'Shallow',
        spo2: 82,
        findings: ['Severe respiratory distress', 'Tracheal deviation to left', 'Absent breath sounds right', 'Hyperresonant percussion right'],
        interventions: ['High-flow oxygen', 'Immediate needle decompression'],
        auscultation: ['Absent breath sounds right hemithorax', 'Normal left side']
      },
      circulation: {
        pulseRate: 135,
        pulseQuality: 'Weak, thready',
        bp: { systolic: 80, diastolic: 50 },
        capillaryRefill: 4,
        skin: 'Pale, clammy, cyanosed',
        findings: ['Hypotensive', 'Tachycardic', 'JVD present'],
        interventions: ['IV access', 'Fluid resuscitation']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        findings: ['Anxious', 'Agitated'],
        interventions: []
      },
      exposure: {
        findings: ['Bruising over right chest wall', 'No open wounds'],
        interventions: ['Expose chest']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Tracheal deviation to left', 'JVD present', 'No subcutaneous emphysema'],
      chest: ['Right side hyperexpanded', 'Absent breath sounds', 'Tenderness over ribs 4-6'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Right-sided bruising'],
      neurological: ['Oriented']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Fell from scaffolding approximately 3 meters, landed on right side, sudden onset chest pain and breathlessness'
    },
    vitalSignsProgression: {
      initial: { bp: '80/50', pulse: 135, respiration: 36, spo2: 82, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['Tracheal deviation', 'Absent breath sounds', 'Hypotension', 'JVD'],
      redFlags: ['Tension pneumothorax - immediate decompression required'],
      differentialDiagnoses: ['Tension pneumothorax', 'Massive hemothorax', 'Cardiac tamponade'],
      mostLikelyDiagnosis: 'Tension Pneumothorax'
    },
    studentChecklist: [
      { id: 'r2-1', category: 'abcde', description: 'Recognize tension pneumothorax', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'r2-2', category: 'intervention', description: 'Immediate needle decompression', points: 25, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true, timeframe: 'Within 2 minutes' },
      { id: 'r2-3', category: 'intervention', description: 'High-flow oxygen', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r2-4', category: 'intervention', description: 'IV access and fluids', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Tension pneumothorax is a clinical diagnosis - do NOT wait for X-ray',
      'Immediate needle decompression 2nd intercostal space mid-clavicular line',
      'Signs: hypotension, tracheal deviation, JVD, absent breath sounds',
      'Follow with chest drain insertion'
    ]
  }),

  createCase({
    id: 'resp-003',
    title: 'COPD Exacerbation',
    category: 'respiratory',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['3rd-year'],
    dispatchInfo: {
      callReason: 'Increased breathlessness, using oxygen at home',
      timeOfDay: 'morning',
      location: 'Apartment in Sharjah',
      callerInfo: 'Wife',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 68,
      gender: 'male',
      weight: 70,
      occupation: 'Retired taxi driver',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Small apartment, patient in armchair',
      hazards: ['Oxygen cylinder present'],
      bystanders: 'Wife',
      environment: 'Warm, stuffy'
    },
    initialPresentation: {
      generalImpression: 'Elderly male, barrel chest, using accessory muscles',
      position: 'Sitting forward, tripod',
      appearance: 'Cyanotic, breathless, anxious',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 85,
        findings: ['Barrel chest', 'Prolonged expiratory phase', 'Diffuse wheeze', 'Reduced air entry'],
        interventions: ['Controlled oxygen 24-28%', 'Nebulized bronchodilators'],
        auscultation: ['Reduced air entry bilaterally', 'Diffuse wheeze', 'Prolonged expiration']
      },
      circulation: {
        pulseRate: 105,
        pulseQuality: 'Regular',
        bp: { systolic: 150, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Warm, cyanosed',
        findings: ['Tachycardic', 'Hypertensive'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Alert'],
        interventions: []
      },
      exposure: {
        findings: ['Home oxygen concentrator present', 'Inhalers on table'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Barrel chest', 'Hyperresonant'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Peripheral edema', 'Tar staining fingers'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Salbutamol inhaler', dose: '100mcg', frequency: 'PRN', indication: 'COPD' },
        { name: 'Tiotropium', dose: '18mcg', frequency: 'Daily', indication: 'COPD' },
        { name: 'Prednisolone', dose: '5mg', frequency: 'Daily', indication: 'COPD maintenance' }
      ],
      allergies: ['None'],
      medicalConditions: ['COPD (GOLD Stage 3)', 'Type 2 respiratory failure', 'Pulmonary hypertension'],
      surgicalHistory: [],
      lastMeal: 'Breakfast 1 hour ago',
      eventsLeading: 'Increased breathlessness over 3 days, cough with green sputum, using home oxygen more frequently',
      socialHistory: {
        smoking: '40 pack-years, quit 5 years ago'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '150/85', pulse: 105, respiration: 28, spo2: 85, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Barrel chest', 'Type 2 RF history', 'Infective exacerbation'],
      redFlags: ['CO2 retention risk', 'Respiratory failure'],
      differentialDiagnoses: ['COPD exacerbation', 'Pneumonia', 'Pulmonary embolism', 'Heart failure'],
      mostLikelyDiagnosis: 'COPD Exacerbation (infective)'
    },
    studentChecklist: [
      { id: 'r3-1', category: 'abcde', description: 'Controlled oxygen 24-28%', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'r3-2', category: 'intervention', description: 'Nebulized bronchodilators', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r3-3', category: 'intervention', description: 'IV hydrocortisone', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'r3-4', category: 'abcde', description: 'Check for CO2 retention signs', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'Controlled oxygen in COPD - target SpO2 88-92%',
      'High-flow oxygen can cause CO2 retention',
      'Nebulized beta-agonists and anticholinergics',
      'Consider NIV if acidotic'
    ]
  }),

  createCase({
    id: 'resp-004',
    title: 'Pulmonary Embolism',
    category: 'respiratory',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    dispatchInfo: {
      callReason: 'Sudden shortness of breath, chest pain',
      timeOfDay: 'morning',
      location: 'Hotel room, Dubai Marina',
      callerInfo: 'Colleague',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 42,
      gender: 'female',
      weight: 75,
      occupation: 'Business traveler',
      language: 'English'
    },
    sceneInfo: {
      description: 'Hotel room, patient on bed',
      hazards: [],
      bystanders: 'Colleague',
      environment: 'Air-conditioned'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged female, anxious, dyspneic',
      position: 'Sitting upright',
      appearance: 'Pale, tachypneic, distressed',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 89,
        findings: ['Tachypneic', 'Pleuritic chest pain', 'Clear chest'],
        interventions: ['High-flow oxygen'],
        auscultation: ['Clear air entry', 'No added sounds']
      },
      circulation: {
        pulseRate: 115,
        pulseQuality: 'Regular',
        bp: { systolic: 100, diastolic: 65 },
        capillaryRefill: 2,
        skin: 'Warm, pale',
        findings: ['Tachycardic', 'Hypotensive'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Anxious'],
        interventions: []
      },
      exposure: {
        findings: ['Right calf swollen and tender'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Tender right lower chest', 'Clear auscultation'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Right calf swollen, tender, warm - DVT'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Combined oral contraceptive', dose: 'Standard', frequency: 'Daily', indication: 'Contraception' }
      ],
      allergies: ['None'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Breakfast 1 hour ago',
      eventsLeading: 'Long-haul flight from London 2 days ago, sudden onset pleuritic chest pain and breathlessness this morning',
      socialHistory: {
        smoking: 'Non-smoker'
      }
    },
    vitalSignsProgression: {
      initial: { bp: '100/65', pulse: 115, respiration: 28, spo2: 89, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Recent long-haul flight', 'Pleuritic chest pain', 'Tachypnea', 'DVT signs'],
      redFlags: ['Massive PE', 'Hemodynamic compromise'],
      differentialDiagnoses: ['Pulmonary embolism', 'Pneumothorax', 'MI', 'Pneumonia'],
      mostLikelyDiagnosis: 'Pulmonary Embolism'
    },
    studentChecklist: [
      { id: 'r4-1', category: 'abcde', description: 'High-flow oxygen', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r4-2', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'r4-3', category: 'history', description: 'Assess PE risk factors', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'r4-4', category: 'intervention', description: 'Check for DVT', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'Classic triad: dyspnea, chest pain, tachypnea',
      'Risk factors: immobility, surgery, OCP, cancer',
      'Well\'s score for pre-test probability',
      'Massive PE requires thrombolysis'
    ]
  }),

  // ==================== TRAUMA CASES (6 cases) ====================
  createCase({
    id: 'trauma-001',
    title: 'Multi-Trauma from RTC - Motorcycle vs Car',
    category: 'trauma',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    dispatchInfo: {
      callReason: 'Motorcycle accident, rider on ground not moving',
      timeOfDay: 'afternoon',
      location: 'Sheikh Zayed Road, Dubai',
      callerInfo: 'Bystander',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 28,
      gender: 'male',
      weight: 75,
      occupation: 'Delivery driver',
      language: 'Urdu, Basic English'
    },
    sceneInfo: {
      description: 'Busy highway, motorcycle lying on side, car with front damage',
      hazards: ['Traffic', 'Fuel leak', 'Broken glass', 'Unstable motorcycle'],
      bystanders: 'Several people gathered, police arriving',
      environment: 'Hot weather, asphalt surface'
    },
    initialPresentation: {
      generalImpression: 'Young male, supine on road, helmet removed by bystanders',
      position: 'Supine, head turned to side',
      appearance: 'Blood on face, right leg deformed, unconscious',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Gurgling sounds', 'Blood in oropharynx', 'Facial fractures suspected'],
        interventions: ['Suction', 'Jaw thrust', 'Consider OPA']
      },
      breathing: {
        rate: 8,
        rhythm: 'Irregular',
        depth: 'Shallow',
        spo2: 85,
        findings: ['Bradypneic', 'Reduced air entry right side', 'Chest wall tenderness', 'Possible flail segment'],
        interventions: ['High-flow oxygen', 'BVM assistance', 'Seal open chest wound if present']
      },
      circulation: {
        pulseRate: 125,
        pulseQuality: 'Weak, thready',
        bp: { systolic: 80, diastolic: 50 },
        capillaryRefill: 4,
        skin: 'Pale, clammy',
        findings: ['Hypotensive', 'Tachycardic', 'Signs of shock', 'Right femur fracture with bleeding'],
        interventions: ['Control external bleeding', 'IV access x2', 'TXA 1g', 'Fluid bolus']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 4, total: 6 },
        pupils: 'Right dilated, left reactive',
        findings: ['Unequal pupils suggest head injury', 'Decorticate posturing'],
        interventions: ['Spinal immobilization', 'Monitor GCS']
      },
      exposure: {
        findings: ['Open right femur fracture', 'Chest contusions', 'Facial lacerations', 'Road rash'],
        interventions: ['Expose to assess', 'Prevent hypothermia']
      }
    },
    secondarySurvey: {
      head: ['Facial lacerations', 'Periorbital bruising', 'Battle sign suspected'],
      neck: ['C-spine tenderness', 'Trachea central'],
      chest: ['Right chest tenderness', 'Decreased breath sounds right', 'Possible rib fractures'],
      abdomen: ['Soft, non-distended', 'Tender RUQ'],
      pelvis: ['Stable on compression'],
      extremities: ['Open femur fracture right', 'Distal pulses present', 'Deformity'],
      posterior: ['Road rash', 'No step-off'],
      neurological: ['GCS 6', 'Unequal pupils']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Unknown',
      eventsLeading: 'Motorcycle collided with car at intersection, thrown 5 meters'
    },
    vitalSignsProgression: {
      initial: { bp: '80/50', pulse: 125, respiration: 8, spo2: 85, gcs: 6 },
      afterIntervention: { bp: '90/60', pulse: 115, respiration: 14, spo2: 92, gcs: 6 }
    },
    expectedFindings: {
      keyObservations: ['Multiple trauma', 'Head injury with unequal pupils', 'Hypovolemic shock', 'Chest injury'],
      redFlags: ['Tension pneumothorax risk', 'Intracranial hemorrhage', 'Exsanguination'],
      differentialDiagnoses: ['Multi-trauma', 'TBI', 'Hemothorax/Pneumothorax', 'Pelvic fracture'],
      mostLikelyDiagnosis: 'Multi-trauma with TBI'
    },
    studentChecklist: [
      { id: 't1-1', category: 'abcde', description: 'Scene safety and PPE', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 't1-2', category: 'abcde', description: 'Manual C-spine stabilization', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 't1-3', category: 'abcde', description: 'Airway management with trauma precautions', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 't1-4', category: 'abcde', description: 'Assess and treat breathing issues', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 't1-5', category: 'intervention', description: 'Control catastrophic hemorrhage', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't1-6', category: 'intervention', description: 'IV access and fluid resuscitation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 't1-7', category: 'intervention', description: 'Administer TXA if indicated', points: 5, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 't1-8', category: 'intervention', description: 'Splint femur fracture with traction', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 't1-9', category: 'communication', description: 'Request HEMS/trauma center', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'C-spine immobilization in all trauma patients',
      'Address catastrophic hemorrhage before airway in exsanguination',
      'TXA within 3 hours of injury',
      'Rapid transport to trauma center - load and go'
    ],
    visualResources: getTraumaResourcesByCondition('multi-trauma polytrauma chest hemothorax pneumothorax')
  }),

  createCase({
    id: 'trauma-002',
    title: 'Head Injury with Skull Fracture',
    category: 'trauma',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    dispatchInfo: {
      callReason: 'Fall from height, head injury, unconscious',
      timeOfDay: 'afternoon',
      location: 'Construction site, Dubai',
      callerInfo: 'Site supervisor',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 80,
      occupation: 'Construction worker',
      language: 'Hindi'
    },
    sceneInfo: {
      description: 'Construction site, patient on ground',
      hazards: ['Heavy machinery', 'Uneven ground', 'Construction materials'],
      bystanders: 'Coworkers',
      environment: 'Outdoor, hot'
    },
    initialPresentation: {
      generalImpression: 'Young male, supine, blood around head',
      position: 'Supine',
      appearance: 'Blood on face, unconscious',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Blood in mouth'],
        interventions: ['Suction', 'Recovery position if C-spine cleared']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Normal'],
        interventions: ['Oxygen']
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Regular',
        bp: { systolic: 140, diastolic: 90 },
        capillaryRefill: 2,
        skin: 'Normal',
        findings: ['Hypertensive - Cushing response?'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 3, total: 5 },
        pupils: 'Right dilated, non-reactive',
        findings: ['GCS 5', 'Unilateral dilated pupil', 'Decerebrate posturing'],
        interventions: ['Spinal precautions', 'Hyperventilation if signs of herniation']
      },
      exposure: {
        findings: ['Scalp laceration right parietal', 'Battle sign', 'Raccoon eyes'],
        interventions: ['Dressing to wound']
      }
    },
    secondarySurvey: {
      head: ['Scalp laceration', 'Battle sign', 'Raccoon eyes', 'Periorbital bruising'],
      neck: ['C-spine precautions maintained'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['GCS 5', 'Right blown pupil', 'Decerebrate posturing']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: [],
      lastMeal: 'Unknown',
      eventsLeading: 'Fell from scaffolding approximately 4 meters, struck head on concrete'
    },
    vitalSignsProgression: {
      initial: { bp: '140/90', pulse: 95, respiration: 18, spo2: 96, gcs: 5 }
    },
    expectedFindings: {
      keyObservations: ['GCS 5', 'Blown pupil', 'Basal skull fracture signs'],
      redFlags: ['Signs of herniation', 'Expanding extradural hematoma'],
      differentialDiagnoses: ['Severe TBI', 'Extradural hematoma', 'Subdural hematoma'],
      mostLikelyDiagnosis: 'Severe TBI with signs of herniation'
    },
    studentChecklist: [
      { id: 't2-1', category: 'abcde', description: 'C-spine immobilization', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 't2-2', category: 'abcde', description: 'Assess GCS and pupils', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 't2-3', category: 'intervention', description: 'Recognize signs of herniation', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't2-4', category: 'communication', description: 'Priority transport to neurosurgical center', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'Basal skull fracture signs: Battle sign, raccoon eyes, CSF leak',
      'Blown pupil indicates uncal herniation',
      'Cushing triad: hypertension, bradycardia, irregular breathing',
      'Rapid transport to neurosurgical center'
    ],
    visualResources: getTraumaResourcesByCondition('head injury TBI brain skull fracture')
  }),

  createCase({
    id: 'trauma-003',
    title: 'Penetrating Chest Wound',
    category: 'trauma',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    dispatchInfo: {
      callReason: 'Stab wound to chest, bleeding heavily',
      timeOfDay: 'evening',
      location: 'Street in Deira, Dubai',
      callerInfo: 'Bystander',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 30,
      gender: 'male',
      weight: 75,
      occupation: 'Unknown',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Street corner, police present',
      hazards: ['Police incident'],
      bystanders: 'Police officers',
      environment: 'Outdoor'
    },
    initialPresentation: {
      generalImpression: 'Young male, sitting, holding chest',
      position: 'Sitting, leaning forward',
      appearance: 'Pale, distressed, blood on chest',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 26,
        rhythm: 'Labored',
        depth: 'Shallow',
        spo2: 90,
        findings: ['Sucking chest wound left side', 'Tachypnea', 'Reduced air entry left'],
        interventions: ['Seal wound with occlusive dressing (3 sides)', 'High-flow oxygen']
      },
      circulation: {
        pulseRate: 115,
        pulseQuality: 'Weak',
        bp: { systolic: 95, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, clammy',
        findings: ['Tachycardic', 'Hypotensive', 'Signs of shock'],
        interventions: ['IV access x2', 'Fluid resuscitation']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Alert', 'Anxious'],
        interventions: []
      },
      exposure: {
        findings: ['2cm stab wound 5th intercostal space left anterior chest', 'Moderate bleeding'],
        interventions: ['Expose', 'Control bleeding']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Stab wound left anterior', 'Tenderness', 'Crepitus'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Unknown',
      eventsLeading: 'Involved in altercation, stabbed in chest'
    },
    vitalSignsProgression: {
      initial: { bp: '95/60', pulse: 115, respiration: 26, spo2: 90, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Sucking chest wound', 'Hemodynamic compromise', 'Open pneumothorax'],
      redFlags: ['Tension pneumothorax risk', 'Cardiac tamponade risk'],
      differentialDiagnoses: ['Open pneumothorax', 'Hemothorax', 'Cardiac tamponade'],
      mostLikelyDiagnosis: 'Open Pneumothorax (Sucking Chest Wound)'
    },
    studentChecklist: [
      { id: 't3-1', category: 'intervention', description: 'Seal wound with occlusive dressing (3 sides)', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't3-2', category: 'intervention', description: 'High-flow oxygen', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 't3-3', category: 'intervention', description: 'IV access and fluids', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 't3-4', category: 'abcde', description: 'Monitor for tension pneumothorax', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'Occlusive dressing sealed on 3 sides allows air escape',
      'If tension develops, remove dressing temporarily',
      'Position injured side down if possible',
      'Rapid transport to trauma center'
    ],
    visualResources: getTraumaResourcesByCondition('penetrating chest trauma pneumothorax hemothorax tamponade')
  }),

  // ==================== NEUROLOGICAL CASES (6 cases) ====================
  createCase({
    id: 'neuro-001',
    title: 'Acute Ischemic Stroke - FAST Positive',
    category: 'neurological',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    dispatchInfo: {
      callReason: 'Husband suddenly cannot speak or move right side',
      timeOfDay: 'morning',
      location: 'Apartment in Downtown Dubai',
      callerInfo: 'Wife',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 67,
      gender: 'male',
      weight: 80,
      occupation: 'Retired banker',
      language: 'English'
    },
    sceneInfo: {
      description: 'Living room, patient in armchair',
      hazards: [],
      bystanders: 'Wife',
      environment: 'Clean, well-lit apartment'
    },
    initialPresentation: {
      generalImpression: 'Elderly male, slumped in chair, facial droop obvious',
      position: 'Sitting, leaning to right',
      appearance: 'Alert but unable to communicate',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Drooling from right side'],
        interventions: ['Position to protect airway']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Normal breath sounds'],
        interventions: ['Oxygen if hypoxic']
      },
      circulation: {
        pulseRate: 88,
        pulseQuality: 'Regular',
        bp: { systolic: 180, diastolic: 100 },
        capillaryRefill: 2,
        skin: 'Warm, dry',
        findings: ['Hypertensive'],
        interventions: ['Monitor BP', 'IV access']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 2, motor: 4, total: 10 },
        pupils: 'Equal and reactive',
        findings: ['Facial droop right', 'Arm drift right', 'Slurred speech', 'Last known well 45 minutes ago'],
        interventions: ['Document exact time of onset', 'Blood glucose']
      },
      exposure: {
        findings: ['No injuries'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Facial asymmetry', 'Right nasolabial fold flattened'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Right arm weakness', 'Right leg weakness', 'Normal left side'],
      posterior: ['Normal'],
      neurological: ['FAST positive', 'Expressive aphasia', 'Right hemiparesis']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Hypertension' },
        { name: 'Atorvastatin', dose: '20mg', frequency: 'Daily', indication: 'Cholesterol' },
        { name: 'Aspirin', dose: '75mg', frequency: 'Daily', indication: 'Stroke prevention' }
      ],
      allergies: ['None'],
      medicalConditions: ['Hypertension', 'Atrial fibrillation', 'Previous TIA 2022'],
      surgicalHistory: [],
      lastMeal: 'Breakfast 30 minutes ago',
      eventsLeading: 'Wife noticed husband slumped while reading newspaper, unable to speak clearly'
    },
    vitalSignsProgression: {
      initial: { bp: '180/100', pulse: 88, respiration: 18, spo2: 96, gcs: 10 }
    },
    expectedFindings: {
      keyObservations: ['FAST positive', 'Clear time of onset', 'On anticoagulation'],
      redFlags: ['Acute stroke', 'Potential contraindication to thrombolysis'],
      differentialDiagnoses: ['Acute ischemic stroke', 'Hemorrhagic stroke', 'Todd paralysis', 'Hypoglycemia'],
      mostLikelyDiagnosis: 'Acute Ischemic Stroke'
    },
    studentChecklist: [
      { id: 'n1-1', category: 'abcde', description: 'Perform FAST assessment', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n1-2', category: 'history', description: 'Establish exact time last known well', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'n1-3', category: 'intervention', description: 'Check blood glucose', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n1-4', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'n1-5', category: 'intervention', description: 'Do NOT give food or drink', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n1-6', category: 'communication', description: 'Pre-alert stroke center', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'n1-7', category: 'documentation', description: 'Document GCS and neuro findings', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Time is brain - every minute counts',
      'Establish last known well time precisely',
      'Check for contraindications to thrombolysis',
      'Do not give aspirin until hemorrhage excluded'
    ]
  }),

  createCase({
    id: 'neuro-002',
    title: 'Generalized Tonic-Clonic Seizure',
    category: 'neurological',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['3rd-year'],
    dispatchInfo: {
      callReason: 'Daughter having a seizure, just stopped',
      timeOfDay: 'evening',
      location: 'Villa in Al Ain',
      callerInfo: 'Mother',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 22,
      gender: 'female',
      weight: 60,
      occupation: 'Student',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Bedroom, patient on bed',
      hazards: [],
      bystanders: 'Parents',
      environment: 'Normal bedroom'
    },
    initialPresentation: {
      generalImpression: 'Young female, post-ictal, confused',
      position: 'Lying on side',
      appearance: 'Tachypneic, confused, bitten tongue',
      consciousness: 'Post-ictal confusion'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Blood in mouth from tongue bite'],
        interventions: ['Suction if needed', 'Recovery position']
      },
      breathing: {
        rate: 24,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Post-ictal tachypnea'],
        interventions: ['Oxygen']
      },
      circulation: {
        pulseRate: 105,
        pulseQuality: 'Regular',
        bp: { systolic: 130, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Warm, diaphoretic',
        findings: ['Tachycardic'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 3, motor: 5, total: 11 },
        pupils: 'Equal, sluggish',
        findings: ['Post-ictal confusion', 'Gradually improving'],
        interventions: ['Monitor', 'Protect from injury']
      },
      exposure: {
        findings: ['Tongue laceration', 'No other injuries'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Tongue bite'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Post-ictal', 'Gradually improving']
    },
    history: {
      medications: [
        { name: 'Levetiracetam', dose: '500mg', frequency: 'Twice daily', indication: 'Epilepsy' }
      ],
      allergies: ['None'],
      medicalConditions: ['Epilepsy diagnosed 5 years ago'],
      surgicalHistory: [],
      lastMeal: 'Dinner 4 hours ago',
      eventsLeading: 'Mother heard noise, found daughter having generalized seizure lasting approximately 2 minutes'
    },
    vitalSignsProgression: {
      initial: { bp: '130/80', pulse: 105, respiration: 24, spo2: 94, gcs: 11 }
    },
    expectedFindings: {
      keyObservations: ['Post-ictal state', 'Known epilepsy', 'Tongue bite confirms seizure'],
      redFlags: ['Status epilepticus if >5 min', 'First seizure needs workup'],
      differentialDiagnoses: ['Epileptic seizure', 'Syncope', 'Psychogenic non-epileptic seizure', 'Hypoglycemia'],
      mostLikelyDiagnosis: 'Generalized Tonic-Clonic Seizure (Post-ictal)'
    },
    studentChecklist: [
      { id: 'n2-1', category: 'abcde', description: 'Airway protection in recovery position', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n2-2', category: 'abcde', description: 'Check blood glucose', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n2-3', category: 'intervention', description: 'Oxygen if hypoxic', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'n2-4', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'n2-5', category: 'intervention', description: 'Midazolam if seizure recurs', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'n2-6', category: 'history', description: 'Establish seizure duration and type', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Protect airway in post-ictal phase',
      'Check glucose - hypoglycemia can cause seizure',
      'Status epilepticus = >5 min or recurrent without recovery',
      'Midazolam first-line for prolonged seizures'
    ]
  }),

  createCase({
    id: 'neuro-003',
    title: 'Meningitis',
    category: 'neurological',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    dispatchInfo: {
      callReason: 'Fever, severe headache, neck stiffness',
      timeOfDay: 'morning',
      location: 'Apartment in Dubai Marina',
      callerInfo: 'Roommate',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 25,
      gender: 'male',
      weight: 72,
      occupation: 'Marketing executive',
      language: 'English'
    },
    sceneInfo: {
      description: 'Bedroom, patient in bed',
      hazards: [],
      bystanders: 'Roommate',
      environment: 'Dim lighting'
    },
    initialPresentation: {
      generalImpression: 'Young male, photophobia, uncomfortable',
      position: 'Lying still',
      appearance: 'Febrile, distressed, photophobic',
      consciousness: 'Alert but irritable'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Regular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Warm, flushed',
        findings: ['Tachycardic', 'Fever'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Neck stiffness', 'Photophobia', 'Kernig sign positive'],
        interventions: []
      },
      exposure: {
        temperature: 39.2,
        findings: ['Fever', 'Non-blanching rash on legs - petechiae'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Photophobia', 'Severe headache'],
      neck: ['Stiff neck', 'Positive Kernig sign'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Petechial rash on lower limbs'],
      posterior: ['Normal'],
      neurological: ['Meningeal signs positive']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Breakfast - poor appetite',
      eventsLeading: 'Fever and headache for 2 days, rapidly worsening, rash appeared this morning'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 110, respiration: 20, spo2: 97, temperature: 39.2, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Fever', 'Headache', 'Neck stiffness', 'Rash'],
      redFlags: ['Meningococcal septicemia', 'Septic shock risk'],
      differentialDiagnoses: ['Bacterial meningitis', 'Viral meningitis', 'Subarachnoid hemorrhage', 'Malaria'],
      mostLikelyDiagnosis: 'Bacterial Meningitis (Meningococcal)'
    },
    studentChecklist: [
      { id: 'n3-1', category: 'abcde', description: 'Recognize meningitis triad', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'n3-2', category: 'abcde', description: 'Check for non-blanching rash', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'n3-3', category: 'intervention', description: 'IV access and fluids', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'n3-4', category: 'intervention', description: 'Antibiotics within 1 hour', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'n3-5', category: 'communication', description: 'Isolation precautions', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'Classic triad: fever, headache, neck stiffness',
      'Non-blanching rash suggests meningococcal',
      'Antibiotics within 1 hour of recognition',
      'Isolation precautions for meningococcal'
    ]
  }),

  // ==================== METABOLIC CASES (5 cases) ====================
  createCase({
    id: 'metab-001',
    title: 'Severe Hypoglycemia',
    category: 'metabolic',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['3rd-year'],
    dispatchInfo: {
      callReason: 'Father confused and sweating, not responding properly',
      timeOfDay: 'early-morning',
      location: 'Villa in Abu Dhabi',
      callerInfo: 'Son',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 58,
      gender: 'male',
      weight: 75,
      occupation: 'Accountant',
      language: 'Arabic, English'
    },
    sceneInfo: {
      description: 'Bedroom, patient on floor beside bed',
      hazards: [],
      bystanders: 'Wife and son',
      environment: 'Normal bedroom'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, diaphoretic, confused',
      position: 'Sitting on floor, leaning against bed',
      appearance: 'Pale, profuse sweating, trembling',
      consciousness: 'Confused, drowsy'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Gag reflex present'],
        interventions: []
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Regular',
        bp: { systolic: 130, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Pale, diaphoretic',
        findings: ['Tachycardic'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 3, verbal: 4, motor: 6, total: 13 },
        pupils: 'Equal and reactive',
        bloodGlucose: 1.8,
        findings: ['Confused', 'Agitated when stimulated', 'Tremors'],
        interventions: ['Oral glucose if able', 'IV dextrose if not']
      },
      exposure: {
        findings: ['Insulin pen on bedside table', 'Medic alert bracelet - Diabetes'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Tremor in hands'],
      posterior: ['Normal'],
      neurological: ['Confused', 'Oriented to person only']
    },
    history: {
      medications: [
        { name: 'Insulin glargine', dose: '24 units', frequency: 'Daily', indication: 'Diabetes' },
        { name: 'Insulin aspart', dose: 'Variable', frequency: 'With meals', indication: 'Diabetes' },
        { name: 'Metformin', dose: '1g', frequency: 'Twice daily', indication: 'Diabetes' }
      ],
      allergies: ['None'],
      medicalConditions: ['Type 1 Diabetes (30 years)', 'Diabetic retinopathy', 'Peripheral neuropathy'],
      surgicalHistory: [],
      lastMeal: 'Dinner 10 hours ago, skipped breakfast',
      eventsLeading: 'Son heard noise, found father confused on floor, patient took usual insulin but did not eat breakfast'
    },
    vitalSignsProgression: {
      initial: { bp: '130/80', pulse: 95, respiration: 18, spo2: 98, bloodGlucose: 1.8, gcs: 13 },
      afterIntervention: { bp: '135/82', pulse: 85, respiration: 16, spo2: 98, bloodGlucose: 4.5, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Blood glucose 1.8 mmol/L', 'Altered consciousness', 'Skipped meal after insulin'],
      redFlags: ['Severe hypoglycemia', 'Risk of seizure/coma'],
      differentialDiagnoses: ['Hypoglycemia', 'Stroke', 'Seizure post-ictal', 'Intoxication'],
      mostLikelyDiagnosis: 'Severe Hypoglycemia'
    },
    studentChecklist: [
      { id: 'm1-1', category: 'abcde', description: 'Check blood glucose immediately', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'm1-2', category: 'intervention', description: 'Administer oral glucose if conscious', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'm1-3', category: 'intervention', description: 'IV dextrose 10% if impaired consciousness', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'm1-4', category: 'intervention', description: 'Glucagon IM if no IV access', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'm1-5', category: 'abcde', description: 'Reassess glucose after treatment', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'm1-6', category: 'history', description: 'Identify precipitating cause', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Never delay glucose check in altered consciousness',
      'IV dextrose for impaired consciousness',
      'Glucagon alternative if no IV access',
      'Always look for precipitating cause'
    ]
  }),

  createCase({
    id: 'metab-002',
    title: 'Diabetic Ketoacidosis (DKA)',
    category: 'metabolic',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    dispatchInfo: {
      callReason: 'Vomiting, abdominal pain, breathing fast',
      timeOfDay: 'afternoon',
      location: 'Apartment in Dubai',
      callerInfo: 'Friend',
      dispatchCode: 'Echo-1'
    },
    patientInfo: {
      age: 24,
      gender: 'female',
      weight: 60,
      occupation: 'Student',
      language: 'English'
    },
    sceneInfo: {
      description: 'Living room, patient on sofa',
      hazards: [],
      bystanders: 'Friend',
      environment: 'Normal apartment'
    },
    initialPresentation: {
      generalImpression: 'Young female, Kussmaul breathing, drowsy',
      position: 'Sitting, leaning forward',
      appearance: 'Flushed, dry skin, acetone breath odor',
      consciousness: 'Drowsy but rousable',
      odor: ['Acetone/fruity breath']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 30,
        rhythm: 'Regular',
        depth: 'Deep',
        spo2: 96,
        findings: ['Kussmaul respiration', 'Deep rapid breathing'],
        interventions: ['Monitor']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Weak',
        bp: { systolic: 95, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Warm, dry',
        findings: ['Tachycardic', 'Hypotensive', 'Dehydrated'],
        interventions: ['IV access', 'Fluid resuscitation']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        findings: ['Drowsy', 'Confused'],
        interventions: []
      },
      exposure: {
        temperature: 37.5,
        findings: ['Dry mucous membranes', 'Poor skin turgor'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Diffuse tenderness', 'Non-specific'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Drowsy', 'Oriented to person only']
    },
    history: {
      medications: [
        { name: 'Insulin glargine', dose: '20 units', frequency: 'Daily', indication: 'Type 1 DM' },
        { name: 'Insulin aspart', dose: 'Variable', frequency: 'With meals', indication: 'Type 1 DM' }
      ],
      allergies: ['None'],
      medicalConditions: ['Type 1 Diabetes (12 years)'],
      surgicalHistory: [],
      lastMeal: 'Skipped meals for 2 days due to vomiting',
      eventsLeading: 'Vomiting for 2 days, stopped insulin, progressive drowsiness'
    },
    vitalSignsProgression: {
      initial: { bp: '95/60', pulse: 110, respiration: 30, spo2: 96, temperature: 37.5, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['Kussmaul breathing', 'Hyperglycemia', 'Ketones', 'Dehydration'],
      redFlags: ['Severe DKA', 'Risk of cerebral edema'],
      differentialDiagnoses: ['Diabetic ketoacidosis', 'HHS', 'Sepsis', 'AKI'],
      mostLikelyDiagnosis: 'Diabetic Ketoacidosis'
    },
    studentChecklist: [
      { id: 'm2-1', category: 'abcde', description: 'Check blood glucose and ketones', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'm2-2', category: 'intervention', description: 'IV access and fluid resuscitation', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'm2-3', category: 'intervention', description: 'Insulin therapy', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'm2-4', category: 'abcde', description: 'Monitor for cerebral edema', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'DKA: Hyperglycemia + Ketosis + Metabolic acidosis',
      'Fluid resuscitation is priority',
      'Insulin after fluids started',
      'Monitor for cerebral edema in children/young adults'
    ]
  }),

  // ==================== PSYCHIATRIC/ANXIETY CASES (3 cases) ====================
  createCase({
    id: 'psych-001',
    title: 'Panic Attack with Hyperventilation',
    category: 'anxiety-related',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['diploma', '2nd-year'],
    dispatchInfo: {
      callReason: 'Wife having panic attack, cannot breathe, chest pain',
      timeOfDay: 'evening',
      location: 'Apartment in Jumeirah, Dubai',
      callerInfo: 'Husband',
      dispatchCode: 'Alpha-2'
    },
    patientInfo: {
      age: 34,
      gender: 'female',
      weight: 60,
      occupation: 'Marketing manager',
      language: 'English'
    },
    sceneInfo: {
      description: 'Living room, patient pacing',
      hazards: [],
      bystanders: 'Husband and two children',
      environment: 'Normal apartment, slightly cluttered'
    },
    initialPresentation: {
      generalImpression: 'Young female, hyperventilating, distressed',
      position: 'Pacing, unable to sit still',
      appearance: 'Flushed, trembling, tearful',
      consciousness: 'Alert, anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Talking in short phrases'],
        interventions: ['Reassurance']
      },
      breathing: {
        rate: 30,
        rhythm: 'Irregular',
        depth: 'Deep',
        spo2: 99,
        findings: ['Tachypneic', 'Deep sighing respirations', 'No wheeze'],
        interventions: ['Coach breathing', 'Paper bag NOT recommended']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Bounding',
        bp: { systolic: 130, diastolic: 85 },
        capillaryRefill: 1,
        skin: 'Warm, flushed',
        findings: ['Tachycardic'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Tingling in fingers', 'Carpal spasm'],
        interventions: []
      },
      exposure: {
        findings: ['No injuries', 'No medical alert'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Carpal spasm bilaterally'],
      posterior: ['Normal'],
      neurological: ['Anxious but oriented']
    },
    history: {
      medications: [
        { name: 'Sertraline', dose: '50mg', frequency: 'Daily', indication: 'Anxiety' },
        { name: 'Alprazolam', dose: '0.25mg', frequency: 'PRN', indication: 'Panic attacks' }
      ],
      allergies: ['None'],
      medicalConditions: ['Panic disorder', 'Generalized anxiety disorder'],
      surgicalHistory: [],
      lastMeal: 'Dinner 2 hours ago',
      eventsLeading: 'Argument with husband, sudden onset of chest tightness, fear of dying'
    },
    vitalSignsProgression: {
      initial: { bp: '130/85', pulse: 110, respiration: 30, spo2: 99, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Classic panic attack presentation', 'Carpal spasm from hypocapnia', 'Must rule out medical causes'],
      redFlags: ['First presentation needs medical exclusion', 'Atypical features need workup'],
      differentialDiagnoses: ['Panic attack', 'MI', 'Pulmonary embolism', 'Hyperthyroidism', 'Hypoglycemia'],
      mostLikelyDiagnosis: 'Panic Attack'
    },
    studentChecklist: [
      { id: 'p1-1', category: 'abcde', description: 'Rule out life-threatening causes first', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'p1-2', category: 'abcde', description: 'Obtain 12-lead ECG', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'p1-3', category: 'intervention', description: 'Check vital signs including SpO2', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'p1-4', category: 'intervention', description: 'Calm, reassuring approach', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'p1-5', category: 'intervention', description: 'Coach controlled breathing', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'p1-6', category: 'history', description: 'Assess for suicidal ideation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Always rule out medical causes first',
      'ECG for first presentation or atypical features',
      'Rebreathing techniques can help',
      'Avoid paper bag (risk of hypoxia)'
    ]
  }),

  // ==================== ELDERLY FALL CASES (3 cases) ====================
  createCase({
    id: 'fall-001',
    title: 'Elderly Fall with Hip Fracture',
    category: 'elderly-fall',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['3rd-year'],
    dispatchInfo: {
      callReason: 'Mother fell in bathroom, cannot get up, leg looks wrong',
      timeOfDay: 'morning',
      location: 'Apartment in Sharjah',
      callerInfo: 'Daughter',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 78,
      gender: 'female',
      weight: 55,
      occupation: 'Retired',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Bathroom floor, wet surface',
      hazards: ['Wet floor', 'Narrow space'],
      bystanders: 'Daughter',
      environment: 'Small bathroom, rug bunched up'
    },
    initialPresentation: {
      generalImpression: 'Elderly female, supine on bathroom floor, distressed',
      position: 'Supine, left leg externally rotated and shortened',
      appearance: 'Pale, in pain',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 95,
        findings: ['Mild tachypnea from pain'],
        interventions: ['Oxygen if needed']
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Regular',
        bp: { systolic: 140, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Pale, cool',
        findings: ['Hemodynamically stable'],
        interventions: ['IV access', 'Analgesia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['No neuro deficits'],
        interventions: []
      },
      exposure: {
        findings: ['Left hip deformity', 'No skin breaks'],
        interventions: ['Keep warm', 'Cover with blanket']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Left hip tender', 'External rotation', 'Shortened leg'],
      extremities: ['Left leg shortened and externally rotated', 'Distal pulses present', 'No neuro deficit'],
      posterior: ['No bruising'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Hypertension' },
        { name: 'Alendronate', dose: '70mg', frequency: 'Weekly', indication: 'Osteoporosis' },
        { name: 'Paracetamol', dose: '1g', frequency: 'PRN', indication: 'Pain' }
      ],
      allergies: ['None'],
      medicalConditions: ['Osteoporosis', 'Hypertension', 'Previous fall 6 months ago'],
      surgicalHistory: ['Cataract surgery 2021'],
      lastMeal: 'Breakfast 1 hour ago',
      eventsLeading: 'Slipped on wet bathroom floor while getting out of shower'
    },
    vitalSignsProgression: {
      initial: { bp: '140/85', pulse: 95, respiration: 20, spo2: 95, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Classic hip fracture deformity', 'Osteoporosis risk', 'Fall risk factors present'],
      redFlags: ['#NOF fracture', 'Risk of pressure sores', 'DVT risk'],
      differentialDiagnoses: ['Neck of femur fracture', 'Intertrochanteric fracture', 'Hip dislocation'],
      mostLikelyDiagnosis: 'Neck of Femur Fracture'
    },
    studentChecklist: [
      { id: 'f1-1', category: 'abcde', description: 'Assess for head injury', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'f1-2', category: 'intervention', description: 'Analgesia (consider fascia iliaca block)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'f1-3', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'f1-4', category: 'intervention', description: 'Splint/immobilize leg', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'f1-5', category: 'intervention', description: 'Gentle handling to prevent fat embolism', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'f1-6', category: 'history', description: 'Assess fall risk factors', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Hip fractures common in elderly falls',
      'Fascia iliaca block excellent analgesia',
      'Gentle handling prevents complications',
      'Assess for osteoporosis and fall prevention'
    ]
  }),

  // ==================== POST-DISCHARGE CASES (2 cases) ====================
  createCase({
    id: 'postd-001',
    title: 'Post-Op Wound Infection',
    category: 'post-discharge',
    priority: 'moderate',
    complexity: 'intermediate',
    yearLevels: ['3rd-year'],
    dispatchInfo: {
      callReason: 'Surgical wound red and draining pus, fever',
      timeOfDay: 'afternoon',
      location: 'House in Ajman',
      callerInfo: 'Patient',
      dispatchCode: 'Alpha-2'
    },
    patientInfo: {
      age: 52,
      gender: 'male',
      weight: 82,
      occupation: 'Driver',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Living room, patient on sofa',
      hazards: [],
      bystanders: 'Wife',
      environment: 'Normal home'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, uncomfortable, feverish',
      position: 'Semi-recumbent',
      appearance: 'Flushed, diaphoretic',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 105,
        pulseQuality: 'Bounding',
        bp: { systolic: 130, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Warm, flushed',
        findings: ['Tachycardic', 'Feverish'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: [],
        interventions: []
      },
      exposure: {
        temperature: 38.5,
        findings: ['Abdominal surgical wound', 'Erythema around wound', 'Purulent drainage', 'Swelling'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Midline incision', 'Cellulitis 5cm around wound', 'Seropurulent drainage'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Amoxicillin-clavulanate', dose: '625mg', frequency: 'Three times daily', indication: 'Post-op prophylaxis' },
        { name: 'Paracetamol', dose: '1g', frequency: 'PRN', indication: 'Pain' },
        { name: 'Ibuprofen', dose: '400mg', frequency: 'PRN', indication: 'Pain' }
      ],
      allergies: ['None'],
      medicalConditions: ['Type 2 Diabetes', 'Obesity'],
      surgicalHistory: ['Laparoscopic cholecystectomy 5 days ago'],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Wound increasingly painful over 2 days, noticed drainage and fever today'
    },
    vitalSignsProgression: {
      initial: { bp: '130/80', pulse: 105, respiration: 20, spo2: 97, temperature: 38.5, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Surgical site infection', 'Post-discharge complication', 'Diabetes risk factor'],
      redFlags: ['Sepsis risk', 'Necrotizing fasciitis must be excluded'],
      differentialDiagnoses: ['Surgical site infection', 'Cellulitis', 'Abscess formation', 'Necrotizing fasciitis'],
      mostLikelyDiagnosis: 'Surgical Site Infection'
    },
    studentChecklist: [
      { id: 'pd1-1', category: 'abcde', description: 'Assess for sepsis', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'pd1-2', category: 'intervention', description: 'IV access', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'pd1-3', category: 'intervention', description: 'Take wound swab if draining', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'pd1-4', category: 'intervention', description: 'Cover with sterile dressing', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'pd1-5', category: 'history', description: 'Check antibiotic compliance', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Post-discharge complications common',
      'Diabetes increases infection risk',
      'Check for sepsis signs',
      'Document wound appearance carefully'
    ]
  }),

  // ==================== RULE-OUT CASES (2 cases) ====================
  createCase({
    id: 'ruleout-001',
    title: 'Chest Pain - Rule Out ACS',
    category: 'rule-out',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['3rd-year'],
    dispatchInfo: {
      callReason: 'Chest pain, worried it might be heart attack',
      timeOfDay: 'evening',
      location: 'Apartment in Dubai Marina',
      callerInfo: 'Patient',
      dispatchCode: 'Charlie-1'
    },
    patientInfo: {
      age: 38,
      gender: 'male',
      weight: 75,
      occupation: 'IT consultant',
      language: 'English'
    },
    sceneInfo: {
      description: 'Modern apartment, patient at desk',
      hazards: [],
      bystanders: 'None',
      environment: 'Well-lit, air-conditioned'
    },
    initialPresentation: {
      generalImpression: 'Young male, anxious, no acute distress',
      position: 'Sitting at desk',
      appearance: 'Well, no diaphoresis',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 16,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 99,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 85,
        pulseQuality: 'Regular',
        bp: { systolic: 125, diastolic: 75 },
        capillaryRefill: 2,
        skin: 'Warm, dry',
        findings: ['Normal'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: [],
        interventions: []
      },
      exposure: {
        findings: ['No abnormalities'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Tender chest wall', 'No reproducible pain on palpation'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Dinner 3 hours ago',
      eventsLeading: 'Sharp chest pain after working long hours at computer, worse with movement, patient anxious about family history of heart disease'
    },
    vitalSignsProgression: {
      initial: { bp: '125/75', pulse: 85, respiration: 16, spo2: 99, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Atypical chest pain', 'Low cardiovascular risk', 'Musculoskeletal features'],
      redFlags: ['Must still rule out ACS', 'Atypical MI can present this way'],
      differentialDiagnoses: ['Musculoskeletal chest pain', 'Anxiety', 'GERD', 'Atypical ACS', 'Pericarditis'],
      mostLikelyDiagnosis: 'Musculoskeletal Chest Pain'
    },
    studentChecklist: [
      { id: 'ro1-1', category: 'abcde', description: 'Complete vital signs', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'ro1-2', category: 'abcde', description: '12-lead ECG', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'ro1-3', category: 'history', description: 'Detailed pain history (OPQRST)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'ro1-4', category: 'history', description: 'Cardiovascular risk assessment', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'ro1-5', category: 'intervention', description: 'Aspirin if not contraindicated', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'ro1-6', category: 'communication', description: 'Transport for troponins', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Never dismiss chest pain without ECG',
      'Atypical presentations common in women, diabetics, elderly',
      'Troponins needed to exclude MI',
      'Document thorough assessment'
    ]
  }),

  // ==================== GENERAL CASES (3 cases) ====================
  createCase({
    id: 'general-001',
    title: 'Syncope - First Episode',
    category: 'general',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['diploma', '2nd-year'],
    dispatchInfo: {
      callReason: 'Employee fainted at work, now awake but confused',
      timeOfDay: 'morning',
      location: 'Office building in Business Bay, Dubai',
      callerInfo: 'Colleague',
      dispatchCode: 'Alpha-2'
    },
    patientInfo: {
      age: 29,
      gender: 'female',
      weight: 58,
      occupation: 'Architect',
      language: 'English'
    },
    sceneInfo: {
      description: 'Office floor, patient on chair',
      hazards: [],
      bystanders: 'Several colleagues',
      environment: 'Air-conditioned office'
    },
    initialPresentation: {
      generalImpression: 'Young female, pale, recovering from syncope',
      position: 'Sitting with legs elevated',
      appearance: 'Pale, slightly diaphoretic',
      consciousness: 'Alert, oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 16,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 75,
        pulseQuality: 'Regular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Pale, warm',
        findings: ['Recovered'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: [],
        interventions: []
      },
      exposure: {
        findings: ['No injuries'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Oral contraceptive', dose: 'Combined', frequency: 'Daily', indication: 'Contraception' }
      ],
      allergies: ['None'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Skipped breakfast',
      eventsLeading: 'Standing in meeting for 30 minutes, felt lightheaded, then collapsed'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 75, respiration: 16, spo2: 98, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Vasovagal syncope likely', 'Orthostatic precipitant', 'No red flags'],
      redFlags: ['Exclude cardiac cause', 'PE must be considered'],
      differentialDiagnoses: ['Vasovagal syncope', 'Orthostatic hypotension', 'Arrhythmia', 'PE', 'Hypoglycemia'],
      mostLikelyDiagnosis: 'Vasovagal Syncope'
    },
    studentChecklist: [
      { id: 'g1-1', category: 'abcde', description: 'Assess for injury from fall', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'g1-2', category: 'history', description: 'Detailed history of prodrome', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'g1-3', category: 'intervention', description: 'Check orthostatic BP if appropriate', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'g1-4', category: 'intervention', description: 'Blood glucose check', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Vasovagal most common cause in young',
      'First syncope needs medical evaluation',
      'Exclude red flag causes',
      'Document circumstances carefully'
    ]
  }),

  // ==================== ENVIRONMENTAL CASES (2 cases) ====================
  createCase({
    id: 'env-001',
    title: 'Heat Exhaustion',
    category: 'environmental',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['diploma', '2nd-year'],
    dispatchInfo: {
      callReason: 'Worker dizzy and nauseated at construction site',
      timeOfDay: 'afternoon',
      location: 'Construction site in Dubai',
      callerInfo: 'Supervisor',
      dispatchCode: 'Alpha-2'
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 70,
      occupation: 'Construction worker',
      language: 'Hindi, Basic English'
    },
    sceneInfo: {
      description: 'Outdoor construction site, direct sun',
      hazards: ['Construction equipment', 'Heat'],
      bystanders: 'Coworkers',
      environment: 'Outdoor, 42°C, high humidity'
    },
    initialPresentation: {
      generalImpression: 'Young male, profuse sweating, weak',
      position: 'Sitting in shade',
      appearance: 'Pale, profuse sweating, fatigued',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Mild tachypnea'],
        interventions: ['Move to cool environment']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Weak',
        bp: { systolic: 100, diastolic: 65 },
        capillaryRefill: 2,
        skin: 'Pale, profuse sweating',
        findings: ['Tachycardic', 'Mild hypotension'],
        interventions: ['IV access', 'Cool fluids']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Mild confusion'],
        interventions: []
      },
      exposure: {
        temperature: 38.2,
        findings: ['Hot skin but sweating', 'No CNS dysfunction'],
        interventions: ['Active cooling']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Mild confusion']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Breakfast 6 hours ago, limited water intake',
      eventsLeading: 'Working outdoors since 6 AM, limited breaks, started feeling unwell after lunch'
    },
    vitalSignsProgression: {
      initial: { bp: '100/65', pulse: 110, respiration: 22, spo2: 97, temperature: 38.2, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Heat exhaustion', 'Volume depletion', 'Normal mental status'],
      redFlags: ['Can progress to heat stroke', 'Rhabdomyolysis risk'],
      differentialDiagnoses: ['Heat exhaustion', 'Heat stroke', 'Hypoglycemia', 'Viral illness'],
      mostLikelyDiagnosis: 'Heat Exhaustion'
    },
    studentChecklist: [
      { id: 'e1-1', category: 'abcde', description: 'Move to cool/shaded area', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'e1-2', category: 'intervention', description: 'Remove excess clothing', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'e1-3', category: 'intervention', description: 'Active cooling measures', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'e1-4', category: 'intervention', description: 'Oral/IV fluids', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'e1-5', category: 'abcde', description: 'Distinguish from heat stroke', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Heat exhaustion: sweating present, normal CNS',
      'Heat stroke: hot dry skin, altered mental status - EMERGENCY',
      'Early cooling prevents progression',
      'Hydration crucial in UAE climate'
    ]
  }),

  // ==================== OBSTETRIC CASES (5 cases) ====================
  createCase({
    id: 'obs-001',
    title: 'Pregnancy - Third Trimester Bleeding (Placenta Previa)',
    category: 'obstetric',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Pregnant woman, heavy vaginal bleeding, 34 weeks pregnant',
      timeOfDay: 'morning',
      location: 'Apartment in Al Nahda, Dubai',
      callerInfo: 'Husband (concerned)',
      dispatchCode: 'Echo-3',
      additionalInfo: ['Patient lying on bed', 'Blood soaking through mattress']
    },
    patientInfo: {
      age: 28,
      gender: 'female',
      weight: 72,
      occupation: 'Teacher',
      language: 'Arabic, English',
      culturalConsiderations: ['Female-only provider preferred', 'Husband as translator acceptable', 'Prayer considerations']
    },
    sceneInfo: {
      description: 'Master bedroom, patient lying on left side on bed',
      hazards: [],
      bystanders: 'Husband present, mother-in-law in other room',
      environment: 'Air-conditioned apartment',
      accessIssues: ['Elevator access only'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Pregnant female, pale, anxious, gripping abdomen',
      position: 'Lying on left lateral side',
      appearance: 'Pale, diaphoretic, visible blood on bedding',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Speaking in full sentences'],
        interventions: []
      },
      breathing: {
        rate: 24,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Mild tachypnea due to anxiety/pain', 'Clear bilateral air entry'],
        interventions: ['High-flow oxygen 12L/min']
      },
      circulation: {
        pulseRate: 118,
        pulseQuality: 'Weak but palpable',
        bp: { systolic: 95, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, cool peripheries',
        findings: ['Tachycardic', 'Mild hypotension', 'Signs of hypovolemia'],
        interventions: ['IV access x2 large bore', 'Normal saline bolus 500mL']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Anxious but appropriate'],
        interventions: ['Reassure patient', 'Fetal heart rate assessment if equipment available']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Active vaginal bleeding - moderate', 'Abdomen tender to palpation'],
        interventions: ['DO NOT perform vaginal examination', 'Place in left lateral position', 'Absorbent pads']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Uterus tender, fundal height consistent with 34 weeks', 'No contractions felt'],
      pelvis: ['Avoid examination'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Prenatal vitamins', dose: 'Daily', frequency: 'Once daily', indication: 'Pregnancy support' },
        { name: 'Iron supplements', dose: 'Varies', frequency: 'Once daily', indication: 'Pregnancy anemia prevention' }
      ],
      allergies: ['Penicillin'],
      medicalConditions: ['Gestational diabetes (diet controlled)', 'Previous cesarean x2'],
      surgicalHistory: ['Cesarean sections x2', 'Appendectomy'],
      lastMeal: 'Light breakfast 3 hours ago',
      eventsLeading: 'Woke up to use bathroom, noticed blood soaking through pad. Called husband immediately. No pain contractions reported.'
    },
    vitalSignsProgression: {
      initial: { bp: '95/60', pulse: 118, respiration: 24, spo2: 96, temperature: 36.8, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Painless vaginal bleeding in 3rd trimester', 'Placenta previa likely', 'No contractions', 'Stable vital signs with mild tachycardia'],
      redFlags: ['Potential placental abruption if bleeding increases', 'Hemodynamic instability', 'Fetal distress risk'],
      differentialDiagnoses: ['Placenta previa', 'Placental abruption', 'Uterine rupture', 'Bloody show (labor)', 'Vasa previa'],
      mostLikelyDiagnosis: 'Placenta Previa'
    },
    studentChecklist: [
      { id: 'obs1-1', category: 'abcde', description: 'Place patient in left lateral position', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, rationale: 'Reduces pressure on vena cava, prevents supine hypotension' },
      { id: 'obs1-2', category: 'intervention', description: 'Assess vaginal bleeding - observe only, DO NOT examine', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, rationale: 'Vaginal examination can worsen placenta previa or trigger hemorrhage' },
      { id: 'obs1-3', category: 'communication', description: 'Ask about pain, contractions, fetal movements', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'obs1-4', category: 'intervention', description: 'IV access with large-bore catheters (14-16G)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'obs1-5', category: 'intervention', description: 'Fluid resuscitation with Normal Saline or Plasma-Lyte', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'obs1-6', category: 'communication', description: 'Transport to obstetric hospital with NICU', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, rationale: 'Placenta previa requires hospital with obstetric and neonatal intensive care' },
      { id: 'obs1-7', category: 'documentation', description: 'Document EDC (expected date of delivery)', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Painless vaginal bleeding in 3rd trimester = placenta previa until proven otherwise',
      'DO NOT perform vaginal examination - can cause massive hemorrhage',
      'Left lateral position prevents caval compression and improves placental perfusion',
      'Prepare for potential emergency delivery if en route',
      'UAE hospitals: Latifa, Al Wasl, Mediclinic City have NICU facilities'
    ],
    commonPitfalls: [
      'Performing vaginal examination - can trigger life-threatening hemorrhage',
      'Placing patient supine - can cause supine hypotensive syndrome',
      'Delaying transport to appropriate facility',
      'Not asking about fetal movements'
    ]
  }),

  createCase({
    id: 'ped-001',
    title: 'Pediatric - 3-Year-Old with Fever and Seizure',
    category: 'pediatric',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['3rd-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Child having seizure, very hot, mother screaming',
      timeOfDay: 'afternoon',
      location: 'Villa in Meadows, Dubai',
      callerInfo: 'Mother (distressed)',
      dispatchCode: 'Delta-3',
      additionalInfo: ['Child has been sick for 2 days', 'Very hot weather']
    },
    patientInfo: {
      age: 3,
      gender: 'female',
      weight: 14,
      occupation: 'None',
      language: 'Arabic, English',
      culturalConsiderations: ['Mother very anxious', 'Family nearby during Ramadan']
    },
    sceneInfo: {
      description: 'Living room, child on carpet, grandmother trying to help',
      hazards: [],
      bystanders: 'Mother, grandmother, 2 siblings watching',
      environment: 'Air-conditioned but warm (AC set to 24°C)',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Small child, post-ictal, hot to touch',
      position: 'Lying on left side (recovery position)',
      appearance: 'Flushed, hot skin, eyes closed, twitching',
      consciousness: 'Responding to pain, post-ictal'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but noisy breathing', 'Secretions present'],
        interventions: ['Suction secretions if needed', 'Recovery position']
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Tachypneic', 'Good air entry bilaterally'],
        interventions: ['High-flow oxygen 12L/min via non-rebreather with pediatric mask']
      },
      circulation: {
        pulseRate: 150,
        pulseQuality: 'Strong, bounding',
        bp: { systolic: 85, diastolic: 50 },
        capillaryRefill: 1,
        skin: 'Hot, flushed, dry',
        findings: ['Tachycardic with good perfusion', 'Delayed capillary refill initially but improving', 'Signs of dehydration'],
        interventions: ['IV access if possible (challenge)', 'Fluid bolus if signs of shock']
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 2, verbal: 3, motor: 5, total: 10 },
        pupils: 'Equal but sluggish',
        findings: ['Post-ictal state', 'Lethargic'],
        interventions: ['Monitor GCS', 'Protect from injury during seizure activity']
      },
      exposure: {
        temperature: 40.2,
        findings: ['Very hot skin', 'No rash noted', 'No signs of trauma'],
        interventions: ['Start cooling measures immediately', 'Remove excess clothing', 'Tepid sponging']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'Fontanelle closed (normal for age)'],
      neck: ['Normal'],
      chest: ['Clear bilateral', 'No retractions'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['Normal', 'No edema'],
      posterior: ['Normal'],
      neurological: ['Post-ictal, improving']
    },
    history: {
      medications: [
        { name: 'Paracetamol', dose: 'Syrup 4 hours ago', frequency: 'PRN', indication: 'Fever' }
      ],
      allergies: ['None known'],
      medicalConditions: ['No significant past history', 'Up to date on vaccinations'],
      surgicalHistory: ['None'],
      lastMeal: 'Lunch 2 hours ago (rice and chicken)',
      eventsLeading: 'Fever started 2 days ago, mother gave paracetamol. Today became very lethargic then had seizure lasting ~3 minutes. Outside playing in heat.'
    },
    vitalSignsProgression: {
      initial: { bp: '85/50', pulse: 150, respiration: 28, spo2: 94, temperature: 40.2, gcs: 10 },
      afterIntervention: { bp: '90/55', pulse: 140, respiration: 26, spo2: 98, temperature: 39.1, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['High fever (40.2°C)', 'Seizure (likely febrile)', 'Signs of dehydration', 'Hot environment', 'Recent febrile illness'],
      redFlags: ['Meningitis must be ruled out', 'Heat stroke vs heat exhaustion', 'Status epilepticus if seizure recurs'],
      differentialDiagnoses: ['Febrile seizure', 'Meningitis/encephalitis', 'Heat stroke', 'Urinary tract infection', 'Pneumonia'],
      mostLikelyDiagnosis: 'Febrile Seizure secondary to viral illness'
    },
    studentChecklist: [
      { id: 'ped1-1', category: 'abcde', description: 'Check temperature immediately', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'ped1-2', category: 'abcde', description: 'Maintain airway during seizure (recovery position)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'ped1-3', category: 'intervention', description: 'Administer oxygen if SpO2 < 94%', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'ped1-4', category: 'intervention', description: 'Start active cooling measures', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'ped1-5', category: 'intervention', description: 'Calculate fluid deficit and consider IV fluids', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'ped1-6', category: 'communication', description: 'Ask about vaccination history', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'ped1-7', category: 'communication', description: 'Assess for signs of meningitis (bulging fontanelle, neck stiffness, photophobia)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true, rationale: 'Missed meningitis is life-threatening' }
    ],
    teachingPoints: [
      'Febrile seizures are common in children 6 months to 5 years',
      'Most febrile seizures are brief (<5 minutes) and self-limiting',
      'Red flags: prolonged seizure (>15 min), focal features, multiple seizures, signs of increased intracranial pressure',
      'Cooling: remove clothing, tepid sponge (NOT ice water), fan',
      'Pediatric dose: Midazolam 0.2mg/kg IN or 0.1mg/kg IM for seizures'
    ],
    commonPitfalls: [
      'Over-aggressive cooling can cause shivering which increases temperature',
      'Not checking blood glucose (hypoglycemia can mimic febrile illness)',
      'Missing signs of meningitis',
      'Forgetting to ask about vaccination history (Hib, pneumococcal)'
    ]
  }),

  createCase({
    id: 'psych-001',
    title: 'Psychiatric - Acute Psychosis with Aggression',
    category: 'psychiatric',
    priority: 'moderate',
    complexity: 'intermediate',
    yearLevels: ['3rd-year'],
    estimatedDuration: 35,
    dispatchInfo: {
      callReason: 'Son behaving erratically, breaking things, threatening family',
      timeOfDay: 'evening',
      location: 'Apartment in Deira, Dubai',
      callerInfo: 'Father (stressed)',
      dispatchCode: 'Charlie-2',
      additionalInfo: ['Patient is 24 years old', 'History of stopping medication', 'Family unable to approach him']
    },
    patientInfo: {
      age: 24,
      gender: 'male',
      weight: 78,
      occupation: 'Unemployed',
      language: 'Arabic, English',
      culturalConsiderations: ['Family concerned about stigma', 'Religious beliefs about mental health', 'Extended family living nearby']
    },
    sceneInfo: {
      description: 'Apartment living room with broken furniture, male patient pacing and shouting',
      hazards: ['Broken glass', 'Potential weapons in room'],
      bystanders: 'Father, mother, younger sister (frightened)',
      environment: 'Crowded apartment',
      accessIssues: ['Family needs to exit room safely'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Young adult male, agitated, shouting incoherently',
      position: 'Pacing room, clenched fists',
      appearance: 'Disheveled, sweaty, eyes wide',
      consciousness: 'Alert but confused, paranoid'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but shouting', 'Talking rapidly'],
        interventions: ['Maintain safe distance', 'Verbal de-escalation']
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Deep and rapid',
        spo2: 98,
        findings: ['Anxiety-related tachypnea'],
        interventions: ['Calm reassurance', 'No intervention needed']
      },
      circulation: {
        pulseRate: 125,
        pulseQuality: 'Strong',
        bp: { systolic: 145, diastolic: 95 },
        capillaryRefill: 2,
        skin: 'Flushed, sweaty',
        findings: ['Tachycardic due to agitation', 'Hypertensive'],
        interventions: ['Monitor for deterioration']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Dilated but reactive',
        findings: ['Disorganized thoughts', 'Paranoid ideation', 'Poor insight'],
        interventions: ['Do not argue with delusions', 'Ensure scene safety']
      },
      exposure: {
        findings: ['No obvious trauma', 'No signs of drug use (fresh needle marks)'],
        interventions: ['Check for medical alert bracelet', 'Look for medication bottles']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No trauma'],
      chest: ['No trauma'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['No trauma', 'No needle marks'],
      posterior: ['Normal'],
      neurological: ['Agitated', 'Paranoid']
    },
    history: {
      medications: [
        { name: 'Antipsychotic medication', dose: 'Unknown', frequency: 'Stopped 2 weeks ago', indication: 'Bipolar disorder' }
      ],
      allergies: ['No known allergies'],
      medicalConditions: ['Diagnosed with bipolar disorder 2 years ago', 'Previous hospitalization 1 year ago'],
      surgicalHistory: ['None'],
      lastMeal: 'Unknown',
      eventsLeading: 'Parents report patient stopped taking his medication about 2 weeks ago. Started becoming more withdrawn, then yesterday began talking about "people watching him" and became aggressive this evening.'
    },
    vitalSignsProgression: {
      initial: { bp: '145/95', pulse: 125, respiration: 22, spo2: 98, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['Acute psychotic episode', 'Paranoid delusions', 'Medication non-adherence', 'Agitated but not violent at present', 'No medical cause apparent'],
      redFlags: ['Risk of violence escalation', 'Potential for self-harm', 'Could be drug-induced psychosis', 'Could be medical emergency (head trauma, infection)'],
      differentialDiagnoses: ['Acute psychosis (bipolar/schizophrenia)', 'Drug-induced psychosis', 'Delirium from medical cause', 'Alcohol withdrawal'],
      mostLikelyDiagnosis: 'Acute Psychotic Episode - Bipolar Disorder'
    },
    studentChecklist: [
      { id: 'psych1-1', category: 'safety', description: 'Scene safety assessment before approaching', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'psych1-2', category: 'communication', description: 'Use verbal de-escalation techniques', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'psych1-3', category: 'communication', description: 'Show empathy without agreeing with delusions', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'psych1-4', category: 'abcde', description: 'Rule out medical causes (head trauma, hypoglycemia, infection)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'psych1-5', category: 'communication', description: 'Gather collateral history from family', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'psych1-6', category: 'communication', description: 'Transport to psychiatric emergency facility', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Scene safety is paramount - never enter an unsafe scene',
      'Verbal de-escalation: calm voice, respectful, stand at angle, don\'t crowd',
      'Medical causes must be ruled out (head injury, hypoglycemia, drugs, infection)',
      'UAE psychiatric emergency facilities: Al Amal Hospital, Rashid Hospital (Dubai)',
      'If patient becomes violent: retreat, call police, maintain observation'
    ],
    commonPitfalls: [
      'Entering scene without safety assessment',
      'Agreeing with delusions or arguing with them',
      'Missing medical causes (especially hypoglycemia, head trauma)',
      'Using physical restraint unnecessarily (can escalate)',
      'Not gathering collateral history from family'
    ]
  }),

  createCase({
    id: 'tox-001',
    title: 'Toxicology - Organophosphate Poisoning',
    category: 'toxicology',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 40,
    dispatchInfo: {
      callReason: 'Worker collapsed after spraying pesticides, difficult breathing, vomiting',
      timeOfDay: 'morning',
      location: 'Farm in Al Awir, Dubai',
      callerInfo: 'Farm supervisor',
      dispatchCode: 'Echo-3',
      additionalInfo: ['Multiple workers affected', 'Unknown chemical spilled', 'No PPE worn']
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 70,
      occupation: 'Farm worker',
      language: 'Urdu, Arabic, English',
      culturalConsiderations: ['Worker visa status concerns', 'Family overseas']
    },
    sceneInfo: {
      description: 'Agricultural farm, patient found near pesticide spraying equipment',
      hazards: ['CHEMICAL CONTAMINATION - PPE required', 'Other workers potentially affected'],
      bystanders: '3 other workers with symptoms, farm supervisor',
      environment: 'Outdoor farm, hot sun, chemical smell in air',
      accessIssues: ['Remote location', 'Decontamination needed'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Critically ill male, vomiting, profuse sweating, difficulty breathing',
      position: 'Semi-conscious, slumped on ground',
      appearance: 'Diaphoretic, cyanotic, chemical odor on clothes',
      consciousness: 'Responding to voice, confused'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Noisy respirations', 'Vomiting', 'Secretions', 'Possible bronchorrhea'],
        interventions: ['Suction airway', 'Position to lateral if vomiting', 'Consider airway adjuncts']
      },
      breathing: {
        rate: 32,
        rhythm: 'Irregular',
        depth: 'Shallow, labored',
        spo2: 88,
        findings: ['Severe respiratory distress', 'Wheezing throughout', 'Increased secretions'],
        interventions: ['High-flow oxygen 15L/min', 'Assist ventilation with BVM if needed']
      },
      circulation: {
        pulseRate: 45,
        pulseQuality: 'Weak',
        bp: { systolic: 75, diastolic: 45 },
        capillaryRefill: 4,
        skin: 'Diaphoretic, cyanotic, clammy',
        findings: ['Bradycardic', 'Hypotensive', 'Poor perfusion', 'Signs of cholinergic crisis'],
        interventions: ['IV access', 'Atropine 0.5mg IV', 'Remove contaminated clothing']
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 2, verbal: 2, motor: 4, total: 8 },
        pupils: 'Pinpoint (miosis) - characteristic sign',
        findings: ['Confused', 'Pinpoint pupils', 'Muscle fasciculations'],
        interventions: ['Monitor GCS', 'Prepare for intubation']
      },
      exposure: {
        findings: ['Profuse sweating (diaphoresis)', 'Salivation', 'Urine incontinence', 'Chemical smell on clothes/skin'],
        interventions: ['REMOVE ALL CONTAMINATED CLOTHING', 'DECONTAMINATE SKIN', 'Provider PPE critical']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No trauma'],
      chest: ['Increased secretions', 'Wheezing'],
      abdomen: ['Hyperactive bowel sounds', 'Vomitus'],
      pelvis: ['Urine incontinence'],
      extremities: ['Muscle fasciculations', 'Weakness'],
      posterior: ['Normal'],
      neurological: ['Agitated then lethargic', 'Pinpoint pupils']
    },
    history: {
      medications: [
        { name: 'Unknown medications', dose: 'Unknown', frequency: 'Unknown', indication: 'Unknown' }
      ],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown history'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Unknown',
      eventsLeading: 'Worker was spraying pesticide crops without proper PPE. Wind blew spray back onto him. About 30 minutes later he started feeling sick, collapsed, vomited multiple times.'
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Assess for arrhythmias', findings: 'Sinus bradycardia with PVCs', urgency: 'urgent' }
    ],
    vitalSignsProgression: {
      initial: { bp: '75/45', pulse: 45, respiration: 32, spo2: 88, temperature: 37.8, gcs: 8 },
      afterIntervention: { bp: '95/60', pulse: 80, respiration: 28, spo2: 94, gcs: 10 }
    },
    expectedFindings: {
      keyObservations: ['Pinpoint pupils (miosis) - hallmark sign', 'Profuse sweating and salivation', 'Bradycardia', 'Vomiting and diarrhea', 'Muscle fasciculations', 'Respiratory distress with wheezing'],
      redFlags: ['Life-threatening cholinergic crisis', 'Respiratory failure imminent', 'Cardiovascular collapse', 'Multiple casualties - potential MCI'],
      differentialDiagnoses: ['Organophosphate poisoning', 'Carbamate poisoning', 'Other pesticide poisoning', 'Heat stroke', 'Acute pulmonary edema'],
      mostLikelyDiagnosis: 'Organophosphate Poisoning (Cholinergic Crisis)'
    },
    studentChecklist: [
      { id: 'tox1-1', category: 'safety', description: 'SCENE SAFETY - Don PPE before approaching', points: 20, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, timeframe: 'Before patient contact' },
      { id: 'tox1-2', category: 'intervention', description: 'Remove contaminated clothing immediately', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, rationale: 'Continues absorption until clothing removed' },
      { id: 'tox1-3', category: 'intervention', description: 'Administer Atropine 0.5mg IV/IM', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true, timeframe: 'As soon as IV established' },
      { id: 'tox1-4', category: 'intervention', description: 'Prepare for advanced airway (RSI equipment)', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'tox1-5', category: 'abcde', description: 'Recognize SLUDGE-BBB mnemonic signs', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'tox1-6', category: 'communication', description: 'Request HazMat support and additional ambulances', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'tox1-7', category: 'communication', description: 'Alert receiving hospital of organophosphate poisoning', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'SLUDGE-BBB mnemonic: Salivation, Lacrimation, Urination, Defecation, GI upset, Emesis, Bronchorrhea, Bronchospasm, Bradycardia, Bradypnea',
      'Atropine reverses muscarinic effects (secretions, bronchoconstriction, bradycardia) but NOT nicotinic effects (muscle weakness)',
      'Pralidoxime (2-PAM) regenerates acetylcholinesterase - ACP level',
      'Decontamination: remove clothing, wash skin with soap and water, protect self',
      'Antidote: Atropine (0.5-2mg IV q3-5min) + Pralidoxime (1-2g IV over 30 min, then infusion)',
      'Contact Poison Control Center: 800-4111 (UAE)'
    ],
    commonPitfalls: [
      'Entering scene without PPE - provider becomes second victim',
      'Not requesting additional resources early',
      'Failing to recognize cholinergic crisis signs',
      'Inadequate decontamination',
      'Atropine underdosing - may need repeated doses',
      'Not preparing for impending respiratory failure'
    ]
  }),

  createCase({
    id: 'burn-001',
    title: 'Burns - Industrial Fire with Inhalation Injury',
    category: 'burns',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    estimatedDuration: 35,
    dispatchInfo: {
      callReason: 'Factory fire, multiple people trapped, one with severe burns',
      timeOfDay: 'afternoon',
      location: 'Industrial area in Jebel Ali, Dubai',
      callerInfo: 'Security guard (panic)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Chemical factory', 'Explosion reported', 'Multiple casualties expected']
    },
    patientInfo: {
      age: 42,
      gender: 'male',
      weight: 82,
      occupation: 'Factory worker',
      language: 'Hindi, Arabic, English',
      culturalConsiderations: ['Concerned about family finances', 'Visa worker']
    },
    sceneInfo: {
      description: 'Industrial factory with active fire, smoke throughout building, patient found near exit',
      hazards: ['ACTIVE FIRE', 'Smoke-filled environment', 'Structural collapse risk', 'Chemical exposure risk'],
      bystanders: 'Other workers being evacuated',
      environment: 'Smoke-filled, hot, chaotic',
      accessIssues: ['Fire department needed for access'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Adult male with extensive burns, conscious but in pain, coughing',
      position: 'Sitting on ground outside building',
      appearance: 'Burns to face/neck/chest/arms, soot marks around nose/mouth',
      consciousness: 'Alert and oriented but anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Hoarse voice', 'Soot in sputum', 'Stridor possible'],
        interventions: ['Prepare for advanced airway', '100% humidified oxygen'],
        difficulty: 'Airway may deteriorate rapidly - intubation may be needed'
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Labored',
        spo2: 91,
        findings: ['Tachypneic', 'Possible inhalation injury', 'Coughing with carbonaceous sputum'],
        interventions: ['High-flow oxygen 15L/min via non-rebreather', 'Consider CPAP']
      },
      circulation: {
        pulseRate: 135,
        pulseQuality: 'Rapid, weak',
        bp: { systolic: 85, diastolic: 55 },
        capillaryRefill: 4,
        skin: 'Burned areas, pale elsewhere',
        findings: ['Tachycardic', 'Hypotensive', 'Signs of hypovolemic shock'],
        interventions: ['IV access x2 large bore', 'Normal saline or Plasma-Lyte 250mL bolus', 'Burn fluid resuscitation']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        findings: ['Anxious but appropriate', 'Pain management needed'],
        interventions: ['Morphine 5-10mg IV for pain', 'Monitor mental status']
      },
      exposure: {
        temperature: 37.2,
        findings: ['Full-thickness burns to face, neck, chest, both arms', 'Partial-thickness burns to hands', 'Soot around nose and mouth', 'Singed facial hair'],
        interventions: ['Cover burns with sterile, non-adhesive dressing', 'Keep patient warm', 'DO NOT break blisters or apply ice', 'Remove jewelry and constricting items']
      }
    },
    secondarySurvey: {
      head: ['Singed facial hair', 'No direct trauma'],
      neck: ['Burned circumferentially - may need escharotomy'],
      chest: ['Full-thickness burns', 'No breath sounds on right (possible lung injury)'],
      abdomen: ['Partial-thickness burns', 'Soft, non-tender'],
      pelvis: ['No burns'],
      extremities: ['Full-thickness burns to both arms', 'Partial-thickness to hands', 'Edema developing'],
      posterior: ['Partial-thickness burns to back'],
      neurological: ['Anxious but appropriate']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: ['Hypertension', 'Type 2 diabetes'],
      surgicalHistory: ['Appendectomy'],
      lastMeal: 'Lunch 1 hour ago',
      eventsLeading: 'Chemical reaction and explosion in factory where he works. He was near the source when it happened. Clothes caught fire, he ran out, others helped put out flames with fire extinguisher but he\'s badly burned.'
    },
    vitalSignsProgression: {
      initial: { bp: '85/55', pulse: 135, respiration: 28, spo2: 91, temperature: 37.2, gcs: 14 },
      afterIntervention: { bp: '95/60', pulse: 120, respiration: 26, spo2: 96, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['Extensive burns (>30% TBSA)', 'Face/neck/chest burns - high risk for airway', 'Soot around airway - inhalation likely', 'Signs of hypovolemic shock', 'Possible circumferential burns to extremities'],
      redFlags: ['Inhalation injury - may need intubation', 'Circumferential burns may require escharotomy', 'TBSA >40% - major burn', 'Facial burns - airway at risk', 'Potential carbon monoxide/cyanide exposure'],
      differentialDiagnoses: ['Thermal burns with inhalation injury', 'Carbon monoxide poisoning', 'Chemical burns', 'Trauma from explosion'],
      mostLikelyDiagnosis: 'Major Thermal Burns with Inhalation Injury'
    },
    studentChecklist: [
      { id: 'burn1-1', category: 'abcde', description: 'Assess airway - look for soot, stridor, hoarseness', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'burn1-2', category: 'intervention', description: 'Calculate TBSA (Total Body Surface Area) burned', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true, rationale: 'Rule of 9s: head 9%, each arm 9%, each leg 18%, anterior torso 18%, posterior torso 18%, genitalia 1%' },
      { id: 'burn1-3', category: 'intervention', description: 'Remove jewelry and constricting items immediately', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'burn1-4', category: 'intervention', description: 'IV access through burned skin if necessary', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'burn1-5', category: 'intervention', description: 'Fluid resuscitation: 2-4 mL/kg x TBSA%', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true, rationale: 'Parkland formula for burn fluid resuscitation' },
      { id: 'burn1-6', category: 'intervention', description: 'Pain management (Morphine)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'burn1-7', category: 'intervention', description: 'Cover burns with sterile non-adhesive dressing', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'] },
      { id: 'burn1-8', category: 'communication', description: 'Transport to burn center', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'burn1-9', category: 'documentation', description: 'Document TBSA, burn depth, circumferential burns', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'Rule of 9s for TBSA estimation: Head 9%, Arms 9% each, Legs 18% each, Anterior trunk 18%, Posterior trunk 18%, Genitalia 1%',
      'Parkland formula: 2-4 mL/kg x %TBSA in first 24 hours, half in first 8 hours',
      'Burn depth: Superficial (like sunburn), Partial-thickness (blisters, painful), Full-thickness (white/charred, painless)',
      'Inhalation injury signs: facial burns, soot in sputum, hoarseness, stridor, cough',
      'Circumferential burns (around limb/body) require escharotomy to restore circulation',
      'UAE burn centers: Rashid Hospital (Dubai), Saif Bin Ghobash Hospital',
      'DO NOT break blisters, apply ice, or apply ointments/preparations'
    ],
    commonPitfalls: [
      'Underestimating TBSA or depth',
      'Removing clothing that is stuck to burns - leave it, cut around it',
      'Applying ice directly to burns (causes more tissue damage)',
      'Not recognizing inhalation injury early',
      'Inadequate fluid resuscitation',
      'Not removing jewelry/constricting items before edema develops',
      'Transporting to non-burn center facility'
    ]
  }),

  createCase({
    id: 'multi-001',
    title: 'Multiple Patients - Bus Collision on Sheikh Zayed Road',
    category: 'multiple-patients',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 45,
    dispatchInfo: {
      callReason: 'Bus vs car collision, multiple injuries, road blocked',
      timeOfDay: 'morning',
      location: 'Sheikh Zayed Road, near Mall of Emirates, Dubai',
      callerInfo: 'Police dispatcher',
      dispatchCode: 'MCI-1 (Mass Casualty Incident)',
      additionalInfo: ['Bus carrying 25 passengers', 'Car with 3 occupants', 'Multiple people injured', 'Traffic blocked in both directions']
    },
    patientInfo: {
      age: 32,
      gender: 'female',
      weight: 65,
      occupation: 'Tourist',
      language: 'English',
      culturalConsiderations: ['Confused, in unfamiliar country']
    },
    sceneInfo: {
      description: 'Major collision scene: bus on its side, car with severe front-end damage, debris scattered across highway, multiple victims',
      hazards: ['Traffic hazard', 'Fuel leak from bus', 'Glass and debris everywhere', 'Downed power lines', 'Multiple extrications needed'],
      bystanders: '50+ people: uninjured passengers, bystanders, police',
      environment: 'Chaotic highway, hot sun, noise',
      accessIssues: ['Limited ambulance access', 'Need additional resources'],
      extricationNeeded: true
    },
    initialPresentation: {
      generalImpression: 'Mass casualty scene with 15+ patients needing assessment',
      position: 'Various',
      appearance: 'Various injury patterns',
      consciousness: 'Various levels from alert to unconscious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Multiple patients with airway concerns', 'One unconscious patient requires airway management'],
        interventions: ['Triage prioritization', 'Airway management for critical patients']
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Multiple patients with respiratory distress', 'One patient with chest injury needs ventilation support'],
        interventions: ['Oxygen for hypoxic patients', 'BVM ventilation for critical patient']
      },
      circulation: {
        pulseRate: 95,
        pulseQuality: 'Normal',
        bp: { systolic: 120, diastolic: 75 },
        capillaryRefill: 2,
        skin: 'Normal',
        findings: ['Several patients bleeding', 'Signs of shock in some patients', 'Major trauma requires rapid transport'],
        interventions: ['Triage-based treatment', 'Control major hemorrhage', 'IV access for priority patients']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Range of GCS from 3 to 15', 'One patient with suspected head injury'],
        interventions: ['Rapid neurological assessment', 'Spinal immobilization as indicated']
      },
      exposure: {
        findings: ['Various injury patterns', 'Heat exhaustion risk in sun'],
        interventions: ['Protect from sun', 'Maintain body temperature']
      }
    },
    secondarySurvey: {
      head: ['Multiple patients with head injuries'],
      neck: ['C-spine precautions for multiple patients'],
      chest: ['Multiple chest injuries', 'One patient with flail chest'],
      abdomen: ['Multiple abdominal injuries'],
      pelvis: ['Possible pelvic fracture'],
      extremities: ['Multiple fractures, lacerations, amputations'],
      posterior: ['Back injuries from ejection'],
      neurological: ['Spinal cord injury possible in one patient']
    },
    history: {
      medications: [
        { name: 'Unknown medications', dose: 'Unknown', frequency: 'Unknown', indication: 'Unknown' }
      ],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Unknown for most patients',
      eventsLeading: 'Bus travelling on SZR when car collided with it. Bus overturned. Car driver trapped. Multiple passengers ejected. Incident occurred 15 minutes ago.'
    },
    vitalSignsProgression: {
      initial: { bp: '120/75', pulse: 95, respiration: 20, spo2: 97, gcs: 15 },
      afterIntervention: { bp: '120/75', pulse: 95, respiration: 20, spo2: 97, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Mass casualty incident with 15+ patients needing medical care', 'Scene requires triage system', 'Multiple priorities: red, yellow, green tags', 'Limited resources require tough decisions', 'Long transport times for multiple patients'],
      redFlags: ['More critical patients than resources', 'Scene safety concerns', 'Fuel leak risk', 'Downed power lines', 'One patient with life-threatening airway compromised'],
      differentialDiagnoses: ['Various traumatic injuries based on mechanisms'],
      mostLikelyDiagnosis: 'Mass Casualty Incident - Bus vs Car Collision'
    },
    studentChecklist: [
      { id: 'multi1-1', category: 'safety', description: 'Scene safety assessment before entry', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'multi1-2', category: 'abcde', description: 'Use START triage system for mass casualties', points: 20, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'multi1-3', category: 'communication', description: 'Request additional ambulances immediately', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'multi1-4', category: 'communication', description: 'Establish incident command and triage officer', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'multi1-5', category: 'intervention', description: 'Tag and document patients by priority', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate', 'advanced', 'expert'], critical: true },
      { id: 'multi1-6', category: 'communication', description: 'Coordinate with hospital for multiple patients', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] },
      { id: 'multi1-7', category: 'documentation', description: 'Document triage decisions and patient destinations', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'] }
    ],
    teachingPoints: [
      'START triage: Simple Triage and Rapid Treatment - Sort patients into Immediate (Red), Delayed (Yellow), Minimal (Green), Expectant (Black/Deceased)',
      'MCI management: Scene safety, triage, treatment, transport, documentation',
      'In MCI, do the most good for the most people - may need to make tough decisions',
      'Red tags: Perfusion compromise, respiratory distress, severe hemorrhage, altered mental status',
      'Yellow tags: Injuries that can wait 30-60 minutes',
      'Green tags: Walking wounded, minor injuries',
      'Consider injury severity, transport time, and hospital capabilities when assigning destinations'
    ],
    commonPitfalls: [
      'Entering unsafe scene without assessment',
      'Starting treatment before triage in MCI',
      'Getting emotionally attached to one patient and missing others',
      'Not requesting additional resources early',
      'Poor documentation in chaotic scenes',
      'Overwhelming local hospital without dispersing patients',
      'Failure to establish command structure'
    ]
  }),

  // ==================== ADDITIONAL CARDIAC CASES FOR ALL YEAR LEVELS ====================

  // CARDIAC CASE 005 - Stable Angina (Basic/Diploma)
  createCase({
    id: 'cardiac-005',
    title: 'Stable Angina - Chest Pain at Rest',
    category: 'cardiac',
    priority: 'routine',
    complexity: 'basic',
    yearLevels: ['2nd-year', 'diploma'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: 'Chest pain, not severe',
      timeOfDay: 'afternoon',
      location: 'Shopping mall in Dubai',
      callerInfo: 'Patient (65-year-old male)',
      dispatchCode: 'Delta-1',
      additionalInfo: ['Patient resting in chair', 'Pain described as pressure']
    },
    patientInfo: {
      age: 65,
      gender: 'male',
      weight: 80,
      occupation: 'Retired teacher',
      language: 'English, Arabic',
      culturalConsiderations: ['Prefers to sit upright']
    },
    sceneInfo: {
      description: 'Shopping mall food court, air-conditioned',
      hazards: [],
      bystanders: 'Security guard present',
      environment: 'Safe, public area',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly male, appears comfortable',
      position: 'Sitting upright',
      appearance: 'No distress, calm',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: [],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 97,
        findings: ['Clear bilateral air entry', 'No respiratory distress'],
        interventions: [],
        auscultation: ['Clear air entry bilaterally']
      },
      circulation: {
        pulseRate: 82,
        pulseQuality: 'Strong',
        bp: { systolic: 145, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Warm, dry, pink',
        findings: ['No signs of shock', 'Regular rhythm'],
        interventions: [],
        ecgFindings: ['Normal sinus rhythm', 'No ST changes']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['No neurological deficits'],
        interventions: []
      },
      exposure: {
        findings: ['No obvious signs of distress'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'],
      chest: ['Equal expansion', 'Heart sounds normal'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['No edema'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Aspirin', dose: '81mg', frequency: 'Daily', indication: 'Cardiac' },
        { name: 'Atenolol', dose: '50mg', frequency: 'Daily', indication: 'Blood pressure' }
      ],
      allergies: ['Penicillin'],
      medicalConditions: ['Hypertension', 'Hyperlipidemia', 'History of angina'],
      surgicalHistory: ['Coronary stent placement - 3 years ago'],
      lastMeal: 'Light lunch 1 hour ago',
      eventsLeading: 'Developed chest pressure while walking in mall, sat down to rest, pain improved'
    },
    vitalSignsProgression: {
      initial: { bp: '145/85', pulse: 82, respiration: 18, spo2: 97, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Chest pain improved with rest', 'No acute distress', 'Vital signs stable'],
      redFlags: ['History of cardiac disease', 'Chest pain always needs assessment'],
      differentialDiagnoses: ['Stable angina', 'Unstable angina', 'GERD', 'Musculoskeletal pain'],
      mostLikelyDiagnosis: 'Stable Angina'
    },
    studentChecklist: [
      { id: 'c5-1', category: 'history', description: 'Characterize chest pain (SOCRATES)', points: 15, yearLevel: ['2nd-year', 'diploma'], complexity: ['basic', 'intermediate'], critical: true },
      { id: 'c5-2', category: 'abcde', description: 'Assess vital signs including blood pressure', points: 10, yearLevel: ['2nd-year', 'diploma'], complexity: ['basic', 'intermediate'], critical: true },
      { id: 'c5-3', category: 'intervention', description: 'Obtain 12-lead ECG if available', points: 15, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic', 'intermediate'] },
      { id: 'c5-4', category: 'history', description: 'Ask about cardiac history and medications', points: 10, yearLevel: ['2nd-year', 'diploma'], complexity: ['basic', 'intermediate'], critical: true },
      { id: 'c5-5', category: 'communication', description: 'Reassure patient while assessing', points: 5, yearLevel: ['2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'c5-6', category: 'intervention', description: 'Administer aspirin if not contraindicated', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'c5-7', category: 'communication', description: 'Transport to hospital for evaluation', points: 10, yearLevel: ['2nd-year', 'diploma'], complexity: ['basic', 'intermediate'] }
    ],
    teachingPoints: [
      'Stable angina: Chest pain precipitated by exertion, relieved by rest or nitroglycerin',
      'Characteristics: Pressure/squeezing, substernal, may radiate to arms/jaw',
      'All chest pain patients require 12-lead ECG and hospital evaluation',
      'Risk factors: Age, male, hypertension, hyperlipidemia, smoking, diabetes, family history',
      'Aspirin 300mg chewed is standard for suspected cardiac chest pain unless contraindicated',
      'Nitroglycerin can be given if BP is adequate (SBP > 90 mmHg)'
    ],
    commonPitfalls: [
      'Dismissing chest pain as "just angina" without full assessment',
      'Not obtaining ECG - all chest pain needs ECG',
      'Forgetting to ask about medications that may affect presentation',
      'Not checking for contraindications to nitroglycerin (ED medications, low BP)'
    ]
  }),

  // CARDIAC CASE 006 - Supraventricular Tachycardia (SVT)
  createCase({
    id: 'cardiac-006',
    title: 'Supraventricular Tachycardia (SVT) - Young Adult',
    category: 'cardiac',
    priority: 'urgent',
    complexity: 'intermediate',
    yearLevels: ['3rd-year', '4th-year', 'diploma'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Heart racing, feels like going to pass out',
      timeOfDay: 'evening',
      location: 'Apartment in Dubai Marina',
      callerInfo: 'Patient (28-year-old female)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Episodes before', 'Drinking coffee when started']
    },
    patientInfo: {
      age: 28,
      gender: 'female',
      weight: 55,
      occupation: 'Marketing executive',
      language: 'English, Hindi',
      culturalConsiderations: ['Prefers female provider if possible']
    },
    sceneInfo: {
      description: 'Modern apartment, patient sitting on sofa',
      hazards: [],
      bystanders: 'Roommate present, anxious',
      environment: 'Air-conditioned',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Young female, anxious but stable',
      position: 'Sitting up, leaning forward',
      appearance: 'Mildly diaphoretic',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: [],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Tachypneic but not distressed', 'Clear lungs'],
        interventions: [],
        auscultation: ['Clear air entry bilaterally']
      },
      circulation: {
        pulseRate: 185,
        pulseQuality: 'Strong, regular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Warm, slightly pale',
        findings: ['Tachycardic, regular rhythm', 'No signs of shock'],
        interventions: ['IV access', 'Cardiac monitor'],
        ecgFindings: ['Narrow complex tachycardia', 'Rate ~185', 'Regular rhythm', 'No P waves visible']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Mild lightheadedness reported'],
        interventions: []
      },
      exposure: {
        findings: ['No rash'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'],
      chest: ['Clear lungs bilaterally'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['No edema'],
      posterior: ['Normal'],
      neurological: ['Normal except mild dizziness']
    },
    history: {
      medications: [
        { name: 'Birth control pills', dose: 'Daily', frequency: 'Daily', indication: 'Contraception' }
      ],
      allergies: ['None'],
      medicalConditions: ['History of SVT - 2 previous episodes'],
      surgicalHistory: ['None'],
      lastMeal: 'Coffee and pastry 2 hours ago',
      eventsLeading: 'Was drinking coffee at work when heart started racing, felt lightheaded, came home and called ambulance'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 185, respiration: 22, spo2: 98, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Narrow complex tachycardia ~185 bpm', 'Regular rhythm', 'Hemodynamically stable', 'History of SVT'],
      redFlags: ['Pulse >180, needs vagal maneuvers or treatment', 'Young adult with SVT - common presentation'],
      differentialDiagnoses: ['SVT (AVNRT most likely)', 'Atrial flutter with 2:1 block', 'Atrial tachycardia', 'Sinus tachycardia'],
      mostLikelyDiagnosis: 'Supraventricular Tachycardia (SVT)'
    },
    studentChecklist: [
      { id: 'c6-1', category: 'abcde', description: 'Assess hemodynamic stability (BP, level of consciousness)', points: 20, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c6-2', category: 'intervention', description: 'Obtain 12-lead ECG', points: 15, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'c6-3', category: 'history', description: 'Ask about previous SVT episodes and triggers', points: 10, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['basic', 'intermediate'] },
      { id: 'c6-4', category: 'intervention', description: 'Attempt vagal maneuvers (modified Valsalva)', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c6-5', category: 'intervention', description: 'Consider adenosine if vagal maneuvers fail (6mg, 12mg)', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c6-6', category: 'communication', description: 'Reassure patient - SVT is rarely life-threatening if stable', points: 5, yearLevel: ['3rd-year', 'diploma'], complexity: ['basic', 'intermediate'] }
    ],
    teachingPoints: [
      'SVT typically presents with narrow complex tachycardia (>140 bpm), regular rhythm',
      'AVNRT is most common mechanism in young healthy adults',
      'Vagal maneuvers: Modified Valsalva (forceful blowing against resistance for 15 sec then supine with legs elevated) has 40% success rate',
      'Adenosine: 6mg rapid IV push followed by 20ml saline flush, if no response 12mg, then another 12mg',
      'Contraindications to adenosine: Asthma, heart transplant, 2nd/3rd degree heart block, sick sinus',
      'Unstable SVT (hypotension, chest pain, altered mental status) requires immediate synchronized cardioversion'
    ],
    commonPitfalls: [
      'Not recognizing narrow vs wide complex tachycardia',
      'Attempting vagal maneuvers without explaining to patient',
      'Giving adenosine slowly (must be rapid IV push with flush)',
      'Forgetting to warn patient about transient feeling of doom with adenosine',
      'Not having IV access ready before administering adenosine'
    ]
  }),

  // CARDIAC CASE 007 - Inferior STEMI (Advanced)
  createCase({
    id: 'cardiac-007',
    title: 'Acute Inferior STEMI with Right Ventricular Involvement',
    category: 'cardiac',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Severe chest pain, sweating, vomiting',
      timeOfDay: 'early morning',
      location: 'Hotel room in Downtown Dubai',
      callerInfo: 'Hotel reception (guest called front desk)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Guest from overseas', 'Language barrier possible']
    },
    patientInfo: {
      age: 58,
      gender: 'male',
      weight: 90,
      occupation: 'Business traveler',
      language: 'Russian, limited English',
      culturalConsiderations: ['May be stoic about pain', 'Interpreter may be needed']
    },
    sceneInfo: {
      description: 'Hotel room, patient lying in bed',
      hazards: [],
      bystanders: 'Hotel receptionist',
      environment: 'Air-conditioned hotel room',
      accessIssues: ['Need key card access'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, visibly distressed, diaphoretic',
      position: 'Lying in bed, clutching chest',
      appearance: 'Pale, diaphoretic, nauseated',
      consciousness: 'Alert but uncomfortable'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Gagging/vomiting sounds'],
        interventions: ['Position on side', 'Emesis basin ready'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 26,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Tachypneic', 'Clear bilateral air entry'],
        interventions: ['High-flow oxygen if SpO2 <94%'],
        auscultation: ['Clear air entry bilaterally']
      },
      circulation: {
        pulseRate: 58,
        pulseQuality: 'Weak',
        bp: { systolic: 85, diastolic: 55 },
        capillaryRefill: 4,
        skin: 'Pale, cool, diaphoretic',
        findings: ['Bradycardic', 'Hypotensive', 'Signs of shock', 'JVD present'],
        interventions: ['IV access x2', 'Aspirin 300mg chewed', 'ECG - Right-sided leads (V4R)'],
        ecgFindings: ['ST elevation II, III, aVF', 'ST depression V1-V3 (reciprocal)', 'ST elevation greater in III than II = RCA', 'Right-sided ECG shows V4R elevation = RV infarction']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        findings: ['Anxious, nauseated'],
        interventions: []
      },
      exposure: {
        findings: ['Diaphoresis', 'Pale'],
        interventions: ['Keep warm']
      }
    },
    secondarySurvey: {
      head: ['Diaphoretic', 'No trauma'],
      neck: ['JVD present', 'Trachea central'],
      chest: ['Clear lungs', 'Heart sounds muffled'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Cool extremities'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Unknown', dose: 'Unknown', frequency: 'Unknown', indication: 'Unknown' }
      ],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown - no medical history available'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Dinner 6 hours ago, vomited once',
      eventsLeading: 'Woke up with severe chest pain, nausea, sweating. Called hotel desk who called ambulance'
    },
    vitalSignsProgression: {
      initial: { bp: '85/55', pulse: 58, respiration: 26, spo2: 94, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['Inferior STEMI (II, III, aVF ST elevation)', 'Hypotension, bradycardia', 'Right ventricular infarction suspected', 'CRITICAL: Preload dependent - avoid nitrates!'],
      redFlags: ['Vomiting with inferior MI = large infarct', 'Hypotension with bradycardia = RV infarction', 'NO NITRATES in RV infarction!'],
      differentialDiagnoses: ['Inferior STEMI with RV infarction', 'Inferior STEMI without RV involvement', 'Pericarditis', 'Peptic ulcer disease'],
      mostLikelyDiagnosis: 'Acute Inferior STEMI with Right Ventricular Infarction'
    },
    studentChecklist: [
      { id: 'c7-1', category: 'abcde', description: 'Recognize inferior STEMI pattern (II, III, aVF)', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c7-2', category: 'abcde', description: 'Check ST elevation greater in III than II = RCA occlusion', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c7-3', category: 'intervention', description: 'Obtain right-sided ECG (V4R) for RV involvement', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c7-4', category: 'intervention', description: 'DO NOT give nitrates in RV infarction (preload dependent)', points: 25, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c7-5', category: 'intervention', description: 'Aspirin 300mg chewed immediately', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c7-6', category: 'intervention', description: 'Cautious fluid bolus for hypotension (RV infarction)', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c7-7', category: 'communication', description: 'Pre-alert receiving hospital of STEMI', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true }
    ],
    teachingPoints: [
      'Inferior STEMI: ST elevation in leads II, III, aVF',
      'If ST elevation greater in III than II = RCA occlusion (if greater in II = circumflex)',
      'RCA occlusion often involves right ventricle - obtain right-sided ECG (V4R)',
      'RV infarction is preload dependent - AVOID nitrates and diuretics!',
      'Hypotension in RV infarction: Cautious fluid bolus 250-500ml, may need repeat',
      'Right-sided ECG: Place V4 lead on right side of chest at same position as V4',
      'Inferior MI with RV involvement: Bradycardia (AV block) common, may need atropine or pacing'
    ],
    commonPitfalls: [
      'Giving nitrates to inferior MI patient without checking for RV involvement',
      'Not obtaining right-sided ECG in inferior STEMI',
      'Missing the significance of ST elevation greater in III than II',
      'Aggressively treating hypotension without recognizing RV infarction',
      'Not pre-alerting hospital for STEMI patient'
    ]
  }),

  // CARDIAC CASE 008 - Left Bundle Branch Block with Chest Pain
  createCase({
    id: 'cardiac-008',
    title: 'Chest Pain with Known LBBB - Possible Occlusion MI',
    category: 'cardiac',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Chest pain, shortness of breath',
      timeOfDay: 'night',
      location: 'Apartment in Sharjah',
      callerInfo: 'Wife of patient',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient has heart condition', 'Uses oxygen at home']
    },
    patientInfo: {
      age: 72,
      gender: 'male',
      weight: 75,
      occupation: 'Retired engineer',
      language: 'Arabic, limited English',
      culturalConsiderations: ['Family very involved in care']
    },
    sceneInfo: {
      description: 'Apartment, patient in armchair with oxygen',
      hazards: ['Oxygen cylinder nearby'],
      bystanders: 'Wife and daughter present',
      environment: 'Well-maintained home',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly male, respiratory distress, clutching chest',
      position: 'Sitting forward in armchair',
      appearance: 'Anxious, diaphoretic, using accessory muscles',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: ['Keep in upright position'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 91,
        findings: ['Tachypneic', 'Bilateral crackles at bases'],
        interventions: ['High-flow oxygen 15L/min', 'Assisted ventilation if needed'],
        auscultation: ['Crackles at both bases', 'Decreased air entry at bases']
      },
      circulation: {
        pulseRate: 105,
        pulseQuality: 'Thready',
        bp: { systolic: 95, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, cool, diaphoretic',
        findings: ['Tachycardic', 'Hypotensive', 'Signs of heart failure'],
        interventions: ['IV access x2', 'Aspirin 300mg', 'Nitrates if BP permits'],
        ecgFindings: ['LBBB pattern', 'Wide QRS >120ms', 'Concordant ST elevation in V5-V6', 'Concordant ST depression in V1-V3', 'Sgarbossa criteria positive']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Anxious but oriented'],
        interventions: []
      },
      exposure: {
        findings: ['Ankle edema', 'JVD present'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Diaphoretic'],
      neck: ['JVD present'],
      chest: ['Bibasilar crackles'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Bilateral ankle edema', 'Cool extremities'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Furosemide', dose: '40mg', frequency: 'Daily', indication: 'Heart failure' },
        { name: 'Aspirin', dose: '81mg', frequency: 'Daily', indication: 'Cardiac' },
        { name: 'ACE inhibitor', dose: 'Unknown', frequency: 'Daily', indication: 'Heart failure' }
      ],
      allergies: ['None known'],
      medicalConditions: ['Ischemic cardiomyopathy', 'Heart failure (EF 35%)', 'Known LBBB', 'Diabetes type 2'],
      surgicalHistory: ['Coronary artery bypass graft - 5 years ago'],
      lastMeal: 'Light dinner 4 hours ago',
      eventsLeading: 'Chest pain started 1 hour ago, similar to previous heart attack, took nitro without relief'
    },
    vitalSignsProgression: {
      initial: { bp: '95/60', pulse: 105, respiration: 28, spo2: 91, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['LBBB with chest pain', 'Sgarbossa criteria positive', 'Acute heart failure', 'Possible MI'],
      redFlags: ['New or presumed new LBBB with chest pain = STEMI equivalent', 'Sgarbossa criteria = MI until proven otherwise', 'Patient has cardiac history'],
      differentialDiagnoses: ['MI with LBBB (Sgarbossa positive)', 'Acute heart failure', 'Pulmonary embolism', 'Unstable angina'],
      mostLikelyDiagnosis: 'Myocardial Infarction with LBBB (Sgarbossa Criteria Positive)'
    },
    studentChecklist: [
      { id: 'c8-1', category: 'abcde', description: 'Recognize LBBB pattern on ECG', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c8-2', category: 'abcde', description: 'Apply Sgarbossa criteria to LBBB', points: 25, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c8-3', category: 'intervention', description: 'Treat as STEMI if Sgarbossa criteria positive', points: 25, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c8-4', category: 'intervention', description: 'Manage acute heart failure (oxygen, nitrates if BP permits)', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c8-5', category: 'communication', description: 'Pre-alert hospital for possible STEMI', points: 10, yearLevel: ['4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'c8-6', category: 'history', description: 'Compare with prior ECG if available', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'LBBB makes STEMI diagnosis difficult - use Sgarbossa criteria',
      'Sgarbossa criteria: (1) Concordant ST elevation ≥1mm, (2) Concordant ST depression ≥1mm in V1-V3, (3) Excessively discordant ST elevation ≥5mm',
      'Modified Sgarbossa: ST elevation/S wave ratio ≥0.25 in any lead',
      'New or presumed new LBBB with chest pain = STEMI equivalent',
      'LBBB: Wide QRS >120ms, dominant S in V1, broad/notched R in V5-V6, absent Q in lateral leads',
      'If patient has known LBBB, compare with prior ECG - any changes concerning'
    ],
    commonPitfalls: [
      'Not recognizing Sgarbossa criteria in LBBB',
      'Dismissing chest pain in patient with known LBBB as "just their baseline"',
      'Not obtaining prior ECGs for comparison',
      'Missing concordant ST changes (same direction as QRS)'
    ]
  }),

  // CARDIAC CASE 009 - Atrial Flutter with 2:1 Block
  createCase({
    id: 'cardiac-009',
    title: 'Atrial Flutter with 2:1 Block - Elderly Patient',
    category: 'cardiac',
    priority: 'urgent',
    complexity: 'intermediate',
    yearLevels: ['3rd-year', '4th-year', 'diploma'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Heart racing, feeling weak',
      timeOfDay: 'morning',
      location: 'Retirement home in Dubai',
      callerInfo: 'Nurse at facility',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient has history of atrial flutter', 'BP is stable']
    },
    patientInfo: {
      age: 76,
      gender: 'female',
      weight: 60,
      occupation: 'Retired nurse',
      language: 'English',
      culturalConsiderations: ['Very knowledgeable about medical care']
    },
    sceneInfo: {
      description: 'Nursing home room, patient in bed',
      hazards: [],
      bystanders: 'Nurse present',
      environment: 'Well-equipped medical room',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly female, slightly anxious but stable',
      position: 'Semi-reclined in bed',
      appearance: 'Comfortable, not in acute distress',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: [],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['No respiratory distress'],
        interventions: [],
        auscultation: ['Clear air entry bilaterally']
      },
      circulation: {
        pulseRate: 148,
        pulseQuality: 'Good',
        bp: { systolic: 135, diastolic: 80 },
        capillaryRefill: 2,
        skin: 'Warm, dry, pink',
        findings: ['Tachycardic, regular', 'No signs of shock', 'Palpitations noted'],
        interventions: ['IV access', 'Cardiac monitor'],
        ecgFindings: ['Sawtooth flutter waves', 'Atrial rate ~300', 'Ventricular rate ~150 (2:1 block)', 'Narrow complex tachycardia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['No neurological deficits'],
        interventions: []
      },
      exposure: {
        findings: ['No abnormal findings'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'],
      chest: ['Clear'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['No edema'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Warfarin', dose: '5mg', frequency: 'Daily', indication: 'Anticoagulation' },
        { name: 'Diltiazem', dose: '120mg', frequency: 'Daily', indication: 'Rate control' },
        { name: 'Digoxin', dose: '0.125mg', frequency: 'Daily', indication: 'Rate control' }
      ],
      allergies: ['Sulfa'],
      medicalConditions: ['Atrial flutter', 'Hypertension', 'Previous stroke'],
      surgicalHistory: ['None'],
      lastMeal: 'Breakfast 2 hours ago',
      eventsLeading: 'Missed dose of diltiazem yesterday, heart started racing this morning'
    },
    vitalSignsProgression: {
      initial: { bp: '135/80', pulse: 148, respiration: 20, spo2: 96, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Atrial flutter with 2:1 block', 'Rate ~150', 'Hemodynamically stable', 'History of atrial flutter'],
      redFlags: ['Atrial flutter can degenerate into atrial fibrillation', 'Risk of stroke (already on warfarin)'],
      differentialDiagnoses: ['Atrial flutter with variable block', 'Atrial fibrillation with rapid response', 'SVT', 'Sinus tachycardia'],
      mostLikelyDiagnosis: 'Atrial Flutter with 2:1 Block'
    },
    studentChecklist: [
      { id: 'c9-1', category: 'abcde', description: 'Identify sawtooth flutter waves on ECG', points: 20, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced'] },
      { id: 'c9-2', category: 'abcde', description: 'Assess hemodynamic stability', points: 15, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate'], critical: true },
      { id: 'c9-3', category: 'history', description: 'Ask about medication compliance', points: 10, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic', 'intermediate'] },
      { id: 'c9-4', category: 'intervention', description: 'Consider rate control if unstable', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c9-5', category: 'communication', description: 'Reassure patient - stable atrial flutter is not immediately life-threatening', points: 5, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic'] }
    ],
    teachingPoints: [
      'Atrial flutter: Macro-reentrant circuit in right atrium, typical rate ~300 bpm',
      '2:1 block most common = ventricular rate ~150 bpm',
      'Sawtooth flutter waves best seen in leads II, III, aVF',
      'Treatment: Rate control (beta blockers, calcium channel blockers) or rhythm control (cardioversion)',
      'Atrial flutter carries similar stroke risk to atrial fibrillation - anticoagulation important',
      'Can be cured with catheter ablation (high success rate)'
    ],
    commonPitfalls: [
      'Mistaking atrial flutter for sinus tachycardia or SVT',
      'Not recognizing sawtooth flutter waves',
      'Missing the variable block (can be 2:1, 3:1, 4:1, or variable)',
      'Not assessing for signs of instability before treating'
    ]
  }),

  // CARDIAC CASE 010 - Cardiac Syncope (Vasovagal vs Cardiac)
  createCase({
    id: 'cardiac-010',
    title: 'Syncope - Rule Out Cardiac Cause',
    category: 'cardiac',
    priority: 'urgent',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', 'diploma'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Passed out, woke up confused',
      timeOfDay: 'afternoon',
      location: 'Supermarket in Dubai',
      callerInfo: 'Store manager',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient standing in checkout line', 'Brief loss of consciousness']
    },
    patientInfo: {
      age: 42,
      gender: 'female',
      weight: 65,
      occupation: 'Accountant',
      language: 'English',
      culturalConsiderations: []
    },
    sceneInfo: {
      description: 'Supermarket, patient seated on chair provided by staff',
      hazards: [],
      bystanders: 'Store manager and several customers',
      environment: 'Public area, safe',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Adult female, alert, slightly pale',
      position: 'Seated',
      appearance: 'Recovered, alert',
      consciousness: 'Alert and oriented x3'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: [],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Normal breathing'],
        interventions: [],
        auscultation: ['Clear air entry']
      },
      circulation: {
        pulseRate: 88,
        pulseQuality: 'Good',
        bp: { systolic: 125, diastolic: 75 },
        capillaryRefill: 2,
        skin: 'Slightly pale, now warm',
        findings: ['Normal vital signs', 'No signs of shock'],
        interventions: ['IV access', 'Cardiac monitor', '12-lead ECG'],
        ecgFindings: ['Normal sinus rhythm', 'No acute changes', 'Normal intervals']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Brief post-ictal confusion resolved', 'Normal neurological exam'],
        interventions: []
      },
      exposure: {
        findings: ['No signs of trauma', 'No evidence of incontinence'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['No signs of head trauma'],
      neck: ['No JVD', 'Supple'],
      chest: ['Clear'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['No edema'],
      posterior: ['Normal'],
      neurological: ['Normal exam', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Oral contraceptive', dose: 'Daily', frequency: 'Daily', indication: 'Contraception' }
      ],
      allergies: ['None'],
      medicalConditions: ['None'],
      surgicalHistory: ['None'],
      lastMeal: 'Lunch 1 hour ago',
      eventsLeading: 'Standing in long checkout line, felt lightheaded and nauseous, then passed out briefly. Woke up on floor within 30 seconds.'
    },
    vitalSignsProgression: {
      initial: { bp: '125/75', pulse: 88, respiration: 18, spo2: 98, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Brief syncope (<1 min)', 'Standing for long time', 'Prodromal symptoms (nausea, lightheaded)', 'Normal ECG', 'No signs of trauma'],
      redFlags: ['All syncope needs cardiac workup to rule out dangerous causes', 'Need to check for orthostatic changes', 'Pregnancy test indicated (on oral contraceptives)'],
      differentialDiagnoses: ['Vasovagal syncope (most likely)', 'Orthostatic syncope', 'Cardiac syncope (arrhythmia)', 'Neurological (seizure)'],
      mostLikelyDiagnosis: 'Vasovagal Syncope (but must rule out cardiac causes)'
    },
    studentChecklist: [
      { id: 'c10-1', category: 'history', description: 'Detailed history of syncopal event (witnesses, duration, preceding symptoms)', points: 20, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic', 'intermediate'], critical: true },
      { id: 'c10-2', category: 'intervention', description: 'Obtain 12-lead ECG to rule out cardiac cause', points: 20, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['intermediate'], critical: true },
      { id: 'c10-3', category: 'abcde', description: 'Check orthostatic vital signs (lying, sitting, standing)', points: 15, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic', 'intermediate'] },
      { id: 'c10-4', category: 'history', description: 'Ask about family history of sudden death, cardiac disease', points: 15, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic', 'intermediate'] },
      { id: 'c10-5', category: 'intervention', description: 'Check blood glucose (hypoglycemia can cause syncope)', points: 10, yearLevel: ['2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'c10-6', category: 'communication', description: 'Transport to hospital for evaluation (all syncope needs ED workup)', points: 10, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic', 'intermediate'] }
    ],
    teachingPoints: [
      'Syncope: Transient loss of consciousness due to cerebral hypoperfusion',
      'Red flags in syncope: Chest pain, palpitations, family history of sudden death, abnormal ECG, exertional syncope',
      'Vasovagal syncope: Most common type, often has prodrome, triggered by standing, pain, emotion',
      'Cardiac syncope: Arrhythmia, structural heart disease - more dangerous, often no prodrome, occurs during exertion',
      'All syncope patients need cardiac workup (ECG at minimum)',
      'Orthostatic vital signs: Check BP and pulse lying, sitting, standing - wait 1-2 minutes between positions'
    ],
    commonPitfalls: [
      'Assuming "just fainted" without proper assessment',
      'Not obtaining ECG in syncope patients',
      'Missing red flags in history',
      'Not checking orthostatic vital signs',
      'Dismissing syncope in younger patients - cardiac causes can occur at any age'
    ]
  }),

  // CARDIAC CASE 011 - Acute Decompensated Heart Failure
  createCase({
    id: 'cardiac-011',
    title: 'Acute Decompensated Heart Failure - "Crashing Asthma"',
    category: 'cardiac',
    priority: 'urgent',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year', 'diploma'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Cannot breathe, asthma attack',
      timeOfDay: 'night',
      location: 'Apartment in Al Ain',
      callerInfo: 'Patient\'s son',
      dispatchCode: 'Echo-1',
      additionalInfo: ['History of asthma', 'Using inhaler without relief']
    },
    patientInfo: {
      age: 68,
      gender: 'male',
      weight: 85,
      occupation: 'Retired',
      language: 'Arabic',
      culturalConsiderations: ['Family very involved']
    },
    sceneInfo: {
      description: 'Apartment, patient sitting on edge of bed leaning forward',
      hazards: [],
      bystanders: 'Son and daughter-in-law',
      environment: 'Crowded room',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly male, severe respiratory distress',
      position: 'Tripod position, sitting forward',
      appearance: 'Diaphoretic, cyanotic lips, using accessory muscles',
      consciousness: 'Alert but anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but working hard'],
        interventions: ['Keep upright'],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 34,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 87,
        findings: ['Severe dyspnea', 'Bibasilar crackles to mid-thorax', 'Wheezing (actually cardiac wheeze)'],
        interventions: ['High-flow oxygen 15L/min non-rebreather', 'CPAP if available', 'Nitrates'],
        auscultation: ['Bibasilar crackles', 'Wheezing throughout', 'Decreased air entry at bases']
      },
      circulation: {
        pulseRate: 125,
        pulseQuality: 'Thready',
        bp: { systolic: 165, diastolic: 100 },
        capillaryRefill: 4,
        skin: 'Cold, clammy, diaphoretic, cyanotic',
        findings: ['Hypertensive', 'Tachycardic', 'Poor perfusion', 'JVD present', 'Ankle edema'],
        interventions: ['IV access', 'Nitroglycerin', 'Furosemide if protocols allow'],
        ecgFindings: ['Sinus tachycardia', 'LVH pattern', 'Possible ischemic changes']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        findings: ['Anxious, air hunger'],
        interventions: []
      },
      exposure: {
        findings: ['Ankle edema 2+', 'JVD present'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Diaphoretic'],
      neck: ['JVD to angle of jaw'],
      chest: ['Crackles throughout', 'Possible S3 gallop'],
      abdomen: ['Possible hepatomegaly'],
      pelvis: ['Stable'],
      extremities: ['Bilateral pitting edema to knees', 'Cool extremities'],
      posterior: ['Normal'],
      neurological: ['Normal except anxiety']
    },
    history: {
      medications: [
        { name: 'Furosemide', dose: '40mg', frequency: 'Daily', indication: 'Heart failure' },
        { name: 'Lisinopril', dose: '20mg', frequency: 'Daily', indication: 'Blood pressure' },
        { name: 'Albuterol inhaler', dose: '2 puffs', frequency: 'PRN', indication: 'Asthma (misdiagnosed)' }
      ],
      allergies: ['None'],
      medicalConditions: ['Heart failure', 'Hypertension', 'COPD (actually heart failure)'],
      surgicalHistory: ['Coronary stent x3 - 3 years ago'],
      lastMeal: 'Dinner 4 hours ago',
      eventsLeading: 'Progressive shortness of breath over 3 days, worse tonight, been sleeping in recliner for a week'
    },
    vitalSignsProgression: {
      initial: { bp: '165/100', pulse: 125, respiration: 34, spo2: 87, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['Acute pulmonary edema', "Cardiac asthma (wheezing from heart failure not asthma)", 'Hypertensive', 'Signs of fluid overload', 'History of heart failure'],
      redFlags: ["'Crashing asthma' in elderly = think heart failure until proven otherwise", 'Requires aggressive diuresis and BP control', 'CPAP very helpful'],
      differentialDiagnoses: ['Acute decompensated heart failure', 'Acute pulmonary edema', 'COPD exacerbation', 'Pneumonia'],
      mostLikelyDiagnosis: 'Acute Decompensated Heart Failure with Pulmonary Edema'
    },
    studentChecklist: [
      { id: 'c11-1', category: 'abcde', description: 'Recognize pulmonary edema (crackles, wheezing, JVD, edema)', points: 20, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'c11-2', category: 'intervention', description: 'High-flow oxygen, consider CPAP', points: 20, yearLevel: ['3rd-year', '4th-year', 'diploma'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'c11-3', category: 'intervention', description: 'Nitroglycerin for preload/afterload reduction', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c11-4', category: 'history', description: 'Ask about history of heart failure, recent medication changes', points: 15, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic', 'intermediate'] },
      { id: 'c11-5', category: 'intervention', description: 'Position upright (improves breathing)', points: 10, yearLevel: ['2nd-year', 'diploma'], complexity: ['basic'] },
      { id: 'c11-6', category: 'communication', description: 'Rapid transport to hospital', points: 10, yearLevel: ['2nd-year', '3rd-year', 'diploma'], complexity: ['basic', 'intermediate'], critical: true }
    ],
    teachingPoints: [
      "Cardiac asthma: Wheezing from pulmonary edema, easily confused with asthma/ COPD",
      "Key differentiators: History of heart failure, JVD, edema, orthopnea, PND (paroxysmal nocturnal dyspnea)",
      "Treatment: Oxygen (high flow), CPAP (very effective), Nitrates (preload/afterload), Diuretics (if protocols allow)",
      "Position patient upright - significantly improves breathing",
      "Avoid high positive pressure ventilation without caution in pulmonary edema (CPAP preferred)",
      "Always consider heart failure in elderly patient with 'asthma' - may be cardiac asthma"
    ],
    commonPitfalls: [
      "Treating as asthma without considering heart failure",
      "Not recognizing crackles as sign of pulmonary edema",
      "Missing JVD and peripheral edema",
      "Not asking about orthopnea and PND (specific for heart failure)",
      "Aggressively fluid resuscitating pulmonary edema patient"
    ]
  }),

  // CARDIAC CASE 012 - Pacemaker Malfunction
  createCase({
    id: 'cardiac-012',
    title: 'Possible Pacemaker Malfunction - Dizziness and Fatigue',
    category: 'cardiac',
    priority: 'urgent',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Very dizzy, weak, tired for 2 days',
      timeOfDay: 'afternoon',
      location: 'Rehabilitation center in Dubai',
      callerInfo: 'Nurse at facility',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient has pacemaker', 'BP is low']
    },
    patientInfo: {
      age: 79,
      gender: 'male',
      weight: 70,
      occupation: 'Retired',
      language: 'English',
      culturalConsiderations: []
    },
    sceneInfo: {
      description: 'Rehabilitation center room, patient in bed',
      hazards: [],
      bystanders: 'Nurse present',
      environment: 'Medical facility',
      accessIssues: [],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Elderly male, appears fatigued but stable',
      position: 'Lying in bed',
      appearance: 'Pale but not in acute distress',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent'],
        interventions: [],
        adjunctsNeeded: []
      },
      breathing: {
        rate: 16,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['No respiratory distress'],
        interventions: [],
        auscultation: ['Clear']
      },
      circulation: {
        pulseRate: 42,
        pulseQuality: 'Weak but regular',
        bp: { systolic: 88, diastolic: 55 },
        capillaryRefill: 3,
        skin: 'Cool, pale',
        findings: ['Bradycardic', 'Mildly hypotensive', 'Pacemaker visible in left chest'],
        interventions: ['IV access', 'Cardiac monitor', 'Atropine if symptomatic', 'Consider pacemaker magnet'],
        ecgFindings: ['Bradycardia ~42 bpm', 'Pacemaker spikes not capturing', 'Native rhythm appears to be junctional', 'Possible pacemaker malfunction']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Mild fatigue reported', 'No focal deficits'],
        interventions: []
      },
      exposure: {
        findings: ['Pacemaker generator visible in left pectoral region'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'],
      chest: ['Pacemaker visible in left chest', 'Clear lungs'],
      abdomen: ['Soft'],
      pelvis: ['Stable'],
      extremities: ['No edema'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Unknown cardiac medications', dose: 'Unknown', frequency: 'Unknown', indication: 'Unknown' }
      ],
      allergies: ['None'],
      medicalConditions: ['Complete heart block', 'Pacemaker placed 3 years ago', 'Dementia (mild)'],
      surgicalHistory: ['Pacemaker implantation', 'Cataract surgery'],
      lastMeal: 'Breakfast 4 hours ago',
      eventsLeading: 'Progressively more tired and weak over 2 days, fell yesterday due to dizziness'
    },
    vitalSignsProgression: {
      initial: { bp: '88/55', pulse: 42, respiration: 16, spo2: 96, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Bradycardia 42 bpm', 'Hypotension', 'Pacemaker visible but not capturing', 'Possible pacemaker malfunction'],
      redFlags: ['Pacemaker not capturing is a medical emergency', 'May need to place magnet over pacemaker', 'Need to identify type of pacemaker'],
      differentialDiagnoses: ['Pacemaker failure (lead dislodgement/battery depletion)', 'Oversensing (pacemaker inhibiting inappropriately)', 'Electrolyte abnormality (hyperkalemia)', 'Native junctional rhythm'],
      mostLikelyDiagnosis: 'Pacemaker Malfunction - Failure to Capture'
    },
    studentChecklist: [
      { id: 'c12-1', category: 'intervention', description: 'Identify pacemaker and check for pocket infection/erosion', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c12-2', category: 'intervention', description: 'Obtain 12-lead ECG to assess pacemaker function', points: 20, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'c12-3', category: 'intervention', description: 'Check pacemaker identification card', points: 15, yearLevel: ['4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'c12-4', category: 'intervention', description: 'Consider transcutaneous pacing if patient deteriorates', points: 20, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'c12-5', category: 'intervention', description: 'Atropine for symptomatic bradycardia', points: 15, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'c12-6', category: 'communication', description: 'Contact pacemaker clinic if possible', points: 10, yearLevel: ['4th-year'], complexity: ['intermediate'] }
    ],
    teachingPoints: [
      'Pacemaker malfunction types: Failure to pace, failure to capture, oversensing, inappropriate rate',
      'Pacemaker magnet: Can convert some pacemakers to fixed-rate (asynchronous) mode',
      'Pacemaker spikes should be followed by QRS complex (capture)',
      'If no capture: May be lead problem, battery depletion, or electrolyte abnormality',
      'Transcutaneous pacing may be needed while awaiting permanent pacemaker evaluation',
      'Always look for pacemaker identification card or device information'
    ],
    commonPitfalls: [
      'Not recognizing pacemaker spikes on ECG',
      'Assuming bradycardia is normal without checking pacemaker function',
      'Not considering transcutaneous pacing in symptomatic patients',
      'Forgetting to check pacemaker pocket for infection/erosion',
      'Not asking about pacemaker type and programming'
    ]
  }),
];

// ============================================================================
// MERGE WITH ENHANCED CASE DATABASE
// ============================================================================

// Combine original cases with enhanced cases
// This allows for backward compatibility while adding new detailed cases
export const allCases: CaseScenario[] = [...caseDatabase, ...enhancedCaseDatabase];

// Export function to get cases by filter
export const getCasesByFilter = (filter: { yearLevel?: string; category?: string; priority?: string; complexity?: string; subcategory?: string }) => {
  return allCases.filter(c => {
    if (filter.yearLevel && !c.yearLevels.includes(filter.yearLevel as any)) return false;
    if (filter.category && c.category !== filter.category) return false;
    if (filter.priority && c.priority !== filter.priority) return false;
    if (filter.complexity && c.complexity !== filter.complexity) return false;
    if (filter.subcategory && !c.title.toLowerCase().includes(filter.subcategory.toLowerCase()) && !c.id.includes(filter.subcategory)) return false;
    return true;
  });
};

// Export function to get random case with better fallback logic
export const getRandomCase = (filters?: { yearLevel?: string; category?: string; complexity?: string; subcategory?: string }) => {
  let cases = allCases;

  // Filter by year level first
  if (filters?.yearLevel) {
    const yearFilter = filters.yearLevel as any;
    cases = cases.filter(c => c.yearLevels.includes(yearFilter));
  }

  // Filter by category
  if (filters?.category) {
    const categoryFilter = filters.category;
    const categoryMatches = cases.filter(c => c.category === categoryFilter);

    // If category filter results in no cases, try to find any case with this category (ignore year level)
    if (categoryMatches.length === 0) {
      const anyYearForCategory = caseDatabase.filter(c => c.category === categoryFilter);
      if (anyYearForCategory.length === 0) {
        // Category doesn't exist at all - log warning and return a random case
        console.warn(`No cases found for category: "${categoryFilter}". Available categories:`, [...new Set(caseDatabase.map(c => c.category))]);
        return caseDatabase[Math.floor(Math.random() * caseDatabase.length)];
      }
      // Use any case from this category (regardless of year level)
      console.warn(`No "${categoryFilter}" cases available for ${filters?.yearLevel}. Using case from any year level.`);
      return anyYearForCategory[Math.floor(Math.random() * anyYearForCategory.length)];
    }
    cases = categoryMatches;
  }

  // Filter by complexity (optional - don't fail if no match)
  if (filters?.complexity) {
    const complexityFilter = filters.complexity;
    const complexityMatches = cases.filter(c => c.complexity === complexityFilter);
    if (complexityMatches.length > 0) {
      cases = complexityMatches;
    }
  }

  // Filter by subcategory if specified
  if (filters?.subcategory) {
    const subcategoryFilter = filters.subcategory;
    const subcategoryMatches = cases.filter(c =>
      c.title.toLowerCase().includes(subcategoryFilter.toLowerCase()) ||
      c.id.includes(subcategoryFilter) ||
      c.category === subcategoryFilter
    );
    if (subcategoryMatches.length > 0) {
      cases = subcategoryMatches;
    }
  }

  // Final fallback - should rarely reach here
  if (cases.length === 0) {
    console.warn('No cases match filters, returning random case');
    return allCases[Math.floor(Math.random() * allCases.length)];
  }

  return cases[Math.floor(Math.random() * cases.length)];
};

// Get categories that actually exist in the database
const existingCategories = [...new Set(allCases.map(c => c.category))];

// Category display mapping - Enhanced with new categories
const CATEGORY_INFO: Record<string, { label: string; color: string; icon?: string }> = {
  'cardiac': { label: 'Cardiac', color: 'bg-red-500', icon: 'heart' },
  'cardiac-ecg': { label: 'Cardiac ECG', color: 'bg-red-600', icon: 'activity' },
  'respiratory': { label: 'Respiratory', color: 'bg-blue-500', icon: 'wind' },
  'trauma': { label: 'Trauma', color: 'bg-orange-500', icon: 'alert-triangle' },
  'thoracic': { label: 'Thoracic/Critical Care', color: 'bg-rose-600', icon: 'lungs' },
  'critical-care': { label: 'Critical Care', color: 'bg-red-700', icon: 'monitor' },
  'neurological': { label: 'Neurological', color: 'bg-purple-500', icon: 'brain' },
  'metabolic': { label: 'Metabolic', color: 'bg-green-500', icon: 'droplet' },
  'environmental': { label: 'Environmental', color: 'bg-amber-500', icon: 'sun' },
  'psychiatric': { label: 'Psychiatric', color: 'bg-pink-500', icon: 'smile' },
  'anxiety-related': { label: 'Anxiety Related', color: 'bg-teal-500', icon: 'frown' },
  'elderly-fall': { label: 'Elderly Fall', color: 'bg-indigo-500', icon: 'user' },
  'post-discharge': { label: 'Post-Discharge', color: 'bg-cyan-500', icon: 'home' },
  'rule-out': { label: 'Rule-Out', color: 'bg-lime-500', icon: 'search' },
  'general': { label: 'General', color: 'bg-gray-500', icon: 'stethoscope' },
  'toxicology': { label: 'Toxicology', color: 'bg-violet-500', icon: 'flask' },
  'toxicological': { label: 'Toxicological', color: 'bg-violet-500', icon: 'flask' },
  'multiple-patients': { label: 'Multiple Patients', color: 'bg-slate-500', icon: 'users' },
  'disaster': { label: 'Disaster/MCI', color: 'bg-stone-700', icon: 'alert-octagon' },
  'clinical-procedures': { label: 'Clinical Procedures', color: 'bg-sky-500', icon: 'wrench' },
  'procedural': { label: 'Procedural', color: 'bg-sky-500', icon: 'wrench' },
  'obstetrics-gynecology': { label: 'Obstetrics/Gynecology', color: 'bg-pink-600', icon: 'baby' },
  'obstetric': { label: 'Obstetric', color: 'bg-pink-600', icon: 'baby' },
  'pediatric': { label: 'Pediatric', color: 'bg-yellow-500', icon: 'child' },
  'burns': { label: 'Burns', color: 'bg-orange-600', icon: 'flame' }
};

// Export only the categories that actually have cases
export const caseCategories = existingCategories.map(cat => ({
  value: cat,
  label: CATEGORY_INFO[cat]?.label || cat.charAt(0).toUpperCase() + cat.slice(1),
  color: CATEGORY_INFO[cat]?.color || 'bg-gray-500'
})).sort((a, b) => a.label.localeCompare(b.label));

// Get year levels
export const yearLevels = [
  { value: '2nd-year', label: '2nd Year' },
  { value: '3rd-year', label: '3rd Year' },
  { value: '4th-year', label: '4th Year (Final)' },
  { value: 'diploma', label: 'Diploma' },
];

// Get complexity levels
export const complexityLevels = [
  { value: 'basic', label: 'Basic', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  { value: 'advanced', label: 'Advanced', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  { value: 'expert', label: 'Expert', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
];

// Priority labels
export const priorities = [
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
];

// Get case statistics
export const getCaseStatistics = () => {
  return {
    totalCases: allCases.length,
    byCategory: caseCategories.map(cat => ({
      ...cat,
      count: allCases.filter(c => c.category === cat.value).length
    })),
    byPriority: priorities.map(pri => ({
      ...pri,
      count: allCases.filter(c => c.priority === pri.value).length
    })),
    byComplexity: complexityLevels.map(comp => ({
      ...comp,
      count: allCases.filter(c => c.complexity === comp.value).length
    }))
  };
};
