/**
 * Enhanced Medical Case Database
 *
 * Comprehensive cases focusing on:
 * - Thoracic trauma (cardiac tamponade, tension pneumothorax, hemothorax)
 * - Critical care scenarios
 * - Detailed clinical guideline-based assessments
 * - ECG integration
 * - Advanced checklist items with clinical reasoning
 */

import type { CaseScenario } from '@/types';

// Helper function to create a case
const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

// ============================================================================
// THORACIC TRAUMA CASES
// ============================================================================

export const moreTraumaCases: CaseScenario[] = [
  // Cardiac Tamponade (Beck's Triad)
  createCase({
    id: 'trauma-004',
    title: 'Penetrating Chest Trauma - Cardiac Tamponade',
    category: 'trauma',
    subcategory: 'chest-trauma',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Stabbing to chest, patient unresponsive',
      timeOfDay: 'evening',
      location: 'Public park in Downtown Dubai',
      callerInfo: 'Bystander (distressed)',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient collapsed', 'Assailant fled the scene', 'Police en route']
    },
    patientInfo: {
      age: 32,
      gender: 'male',
      weight: 75,
      occupation: 'Unknown',
      language: 'Unknown',
      culturalConsiderations: ['Possible language barrier']
    },
    sceneInfo: {
      description: 'Patient supine on ground, blood visible on chest',
      hazards: ['Assailant may still be nearby', 'Broken glass'],
      bystanders: 'Multiple bystanders, one applying pressure',
      environment: 'Outdoor, nighttime, poor lighting',
      accessIssues: ['Crowd control needed'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Young male, pale, diaphoretic, unresponsive',
      position: 'Supine',
      appearance: 'Pale, cyanotic lips, mottled skin',
      consciousness: 'Unresponsive to verbal, responds only to painful stimulus',
      sounds: ['Weak heart sounds', 'Diminished breath sounds']
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Airway compromised by decreased consciousness', 'Requires airway adjunct'],
        interventions: ['Jaw thrust', 'Insert OPA', 'Prepare for advanced airway'],
        adjunctsNeeded: ['OPA size 90mm', 'Suction'],
        difficulty: 'Moderate'
      },
      breathing: {
        rate: 32,
        rhythm: 'Labored and shallow',
        depth: 'Shallow',
        spo2: 88,
        findings: ['Tachypneic', 'Labored breathing', 'Equal but diminished breath sounds bilaterally'],
        interventions: ['High-flow oxygen 15L/min', 'Assist ventilation if needed'],
        auscultation: ['Diminished but equal air entry', 'No wheeze', 'No crackles']
      },
      circulation: {
        pulseRate: 140,
        pulseQuality: 'Weak and thready',
        bp: { systolic: 70, diastolic: 50 },
        capillaryRefill: 5,
        skin: 'Pale, cold, clammy, mottled',
        findings: ['Severe tachycardia', 'Severe hypotension', 'Poor perfusion', 'JVD present'],
        interventions: ['IV access x2 large bore', 'Aggressive fluid resuscitation', 'Rapid bolus NS 1L'],
        ecgFindings: ['Sinus tachycardia', 'Possible electrical alternans', 'Low voltage QRS'],
        ivAccess: ['14G left AC fossa', '14G right AC fossa']
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 2, verbal: 2, motor: 4, total: 8 },
        pupils: 'Equal but sluggish 4mm',
        findings: ['Hypoxic brain injury', 'Poor perfusion'],
        interventions: ['Monitor GCS', 'Treat hypoxia', 'Improve perfusion']
      },
      exposure: {
        findings: ['Small stab wound left parasternal, 3rd intercostal space', 'Minimal external bleeding', 'No exit wound', 'Muffled heart sounds'],
        interventions: ['Cover wound with occlusive dressing (3-sided)', 'Full exposure while maintaining temperature', 'Log roll for spine assessment']
      }
    },
    secondarySurvey: {
      head: ['No trauma', 'Pale conjunctiva'],
      neck: ['JVD present bilaterally', 'Trachea midline', 'No subcutaneous emphysema'],
      chest: ['Muffled heart sounds', 'Equal but diminished breath sounds', 'Small entry wound 3rd ICS left parasternal'],
      abdomen: ['Soft, non-tender', 'No distension'],
      pelvis: ['Stable'],
      extremities: ['Delayed capillary refill', 'Cool to touch', 'Equal pulses but weak'],
      posterior: ['No posterior chest wounds', 'Spine non-tender'],
      neurological: ['GCS 8 (E2, V2, M4)', 'No focal deficits prior to hypoxic injury']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Unknown',
      eventsLeading: 'Police report indicates patient was stabbed during altercation. Weapon believed to be small knife.',
      socialHistory: {
        smoking: 'Unknown',
        alcohol: 'Unknown',
        occupation: 'Unknown'
      }
    },
    investigations: [
      { name: '12-lead ECG', indication: 'Cardiac tamponade suspicion', findings: 'Sinus tachycardia, low voltage QRS, possible electrical alternans', interpretation: 'Cardiac tamponade until proven otherwise', urgency: 'immediate' },
      { name: 'Portable CXR', indication: 'Rule out pneumothorax/hemothorax', findings: 'Possible enlarged cardiac silhouette, clear lung fields (if obtainable)', interpretation: 'Supports tamponade diagnosis', urgency: 'urgent' },
      { name: 'FAST scan', indication: 'Assess for pericardial fluid', findings: 'Pericardial effusion present with right ventricular collapse during diastole', interpretation: 'Cardiac tamponade confirmed', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '70/50', pulse: 140, respiration: 32, spo2: 88, gcs: 8 },
      afterIntervention: { bp: '85/60', pulse: 130, respiration: 28, spo2: 92, gcs: 10 },
      deterioration: { bp: '50/30', pulse: 160, respiration: 8, spo2: 75, gcs: 3 }
    },
    expectedFindings: {
      keyObservations: [
        'Beck\'s Triad: Hypotension, JVD, Muffled heart sounds',
        'Penetrating wound near heart (precordial region)',
        'Signs of shock: tachycardia, poor perfusion, altered mental status',
        'Pulsus paradoxus: >10mmHg drop in BP during inspiration'
      ],
      redFlags: [
        'Cardiac tamponade - clinical diagnosis, DO NOT wait for confirmation',
        'Patient rapidly deteriorating toward cardiac arrest',
        'Possible cardiac injury based on wound location',
        'Pulsus paradoxus present'
      ],
      differentialDiagnoses: [
        'Cardiac tamponade',
        'Tension pneumothorax',
        'Massive hemothorax',
        'Combined cardiac and pulmonary injury',
        'Vasovagal response with minor injury'
      ],
      mostLikelyDiagnosis: 'Cardiac Tamponade secondary to penetrating chest trauma',
      supportingEvidence: [
        'Precordial stab wound',
        'Classic Beck\'s triad (hypotension, JVD, muffled heart sounds)',
        'Severe hemodynamic compromise',
        'Poor response to initial fluid resuscitation'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC approach with cervical spine protection',
        'High-flow oxygen',
        '2x large-bore IV access',
        'Aggressive fluid resuscitation (NS or blood products)',
        'Consider pericardiocentesis if patient deteriorating',
        'Prepare for emergency thoracotomy',
        'Rapid transport to trauma center'
      ],
      definitive: [
        'Emergency department thoracotomy',
        'Pericardial window',
        'Repair of cardiac injury',
        'Blood product resuscitation',
        'Exploratory surgery for associated injuries'
      ],
      monitoring: [
        'Continuous ECG monitoring',
        'Frequent vital signs (every 2-3 minutes)',
        'GCS monitoring',
        'Urine output if catheterized'
      ],
      transportConsiderations: [
        'Pre-alert trauma center',
        'Consider HEMS if prolonged transport',
        'Have blood products available',
        'Prepare for en route deterioration'
      ]
    },
    studentChecklist: [
      // ABCDE Assessment
      {
        id: 't1-1',
        category: 'abcde',
        description: 'Recognize Beck\'s triad (hypotension, JVD, muffled heart sounds)',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        timeframe: 'Within 2 minutes',
        rationale: 'Beck\'s triad is the classic presentation of cardiac tamponade. Recognition is lifesaving.',
        commonErrors: ['Not listening for heart sounds', 'Missing JVD in hypotensive patient', 'Forgetting that all three signs may not be present'],
        hints: ['Muffled heart sounds are difficult to hear in noisy environments - listen carefully', 'JVD may be absent with hypovolemia'],
      },
      {
        id: 't1-2',
        category: 'abcde',
        description: 'Assess for pulsus paradoxus (>10mmHg drop on inspiration)',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        timeframe: 'During circulation assessment',
        rationale: 'Pulsus paradoxus is highly specific for cardiac tamponade and helps confirm diagnosis.',
        commonErrors: ['Not checking for pulsus paradoxus', 'Incorrect measurement technique', 'Not using manual BP if automated not available'],
        details: ['Take BP manually', 'Note pressure on expiration', 'Note pressure on inspiration', 'Difference >10mmHg is significant'],
      },
      {
        id: 't1-3',
        category: 'abcde',
        description: 'Establish cervical spine protection in penetrating trauma',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Penetrating trauma can cause spinal injury. C-spine protection is mandatory.',
        commonErrors: ['Forgetting C-spine in penetrating trauma', 'Improper collar placement'],
      },
      {
        id: 't1-4',
        category: 'intervention',
        description: 'Aggressive fluid resuscitation - 1L NS bolus immediately',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        timeframe: 'Immediately',
        rationale: 'Tamponade causes decreased cardiac output. Fluids increase preload and can temporarily improve output while arranging definitive care.',
        commonErrors: ['Under-resuscitating', 'Using small-bore IVs', 'Not giving rapid bolus'],
        details: ['Use 14G or 16G catheters', 'Push bolus rapidly', 'Reassess after each liter', 'Consider blood products if available'],
      },
      {
        id: 't1-5',
        category: 'intervention',
        description: 'Consider needle pericardiocentesis if patient deteriorating',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        timeframe: 'If signs of cardiac tamponade with deterioration',
        rationale: 'Pericardiocentesis can be lifesaving when transport is delayed or patient is rapidly deteriorating.',
        commonErrors: ['Incorrect needle placement (too medial)', 'Using needle too short', 'Not using ECG guidance if available', 'Delaying too long'],
        details: ['Insert at left xiphocostal angle', 'Aim toward left shoulder', 'Use 18G 7cm spinal needle minimum', 'Aspirate while advancing', 'Listen for rush of air'],
      },
      {
        id: 't1-6',
        category: 'procedural',
        description: 'Apply 3-sided occlusive dressing for open chest wound',
        points: 10,
        yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Open chest wounds can cause pneumothorax or allow air entry. 3-sided dressing allows escape of air while preventing entry.',
        commonErrors: ['Applying fully occlusive dressing (causes tension pneumo)', 'Not taping appropriately', 'Placing dressing incorrectly'],
        details: ['Use petroleum gauze or plastic', 'Tape three sides only', 'Leave one side untaped as flutter valve'],
      },
      {
        id: 't1-7',
        category: 'communication',
        description: 'Pre-alert trauma center for possible emergency thoracotomy',
        points: 15,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Early notification allows trauma team to prepare for emergency department thoracotomy, saving critical time.',
        commonErrors: ['Not pre-alerting', 'Not providing sufficient detail', 'Underestimating severity'],
        details: ['Communicate suspected cardiac tamponade', 'Mention penetrating mechanism', 'Give current vitals', 'Provide ETA'],
      },
      {
        id: 't1-8',
        category: 'documentation',
        description: 'Document mechanism of injury and wound characteristics',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'],
        complexity: ['basic', 'intermediate', 'advanced', 'expert'],
        rationale: 'Accurate documentation helps trauma team understand injury and plan interventions.',
        commonErrors: ['Not documenting wound location', 'Not describing weapon if known', 'Not estimating time of injury']
      }
    ],
    teachingPoints: [
      'Cardiac tamponade is a clinical diagnosis - DO NOT wait for imaging confirmation',
      'Beck\'s Triad: Hypotension, JVD, Muffled heart sounds - remember that all three may not be present!',
      'Pulsus paradoxus >10mmHg is highly specific for cardiac tamponade',
      'Electrical alternans on ECG is pathognomonic but not always present',
      'Fluid resuscitation increases preload to compensate for reduced cardiac output',
      'Needle pericardiocentesis is temporizing - definitive treatment is surgical drainage',
      'Consider ALL stabs in the "cardiac box" (sternal borders to nipples, below clavicles) as potential cardiac injuries',
      'Cardiac box: superior border = clavicles, inferior = costal margins, lateral = nipples',
      'Patients with tamponade may deteriorate rapidly - be prepared for cardiac arrest',
      'Emergency department thoracotomy may be indicated for penetrating trauma with loss of vital signs'
    ],
    commonPitfalls: [
      'Delaying treatment while waiting for imaging confirmation',
      'Missing the diagnosis because Beck\'s triad is incomplete',
      'Not recognizing that muffled heart sounds are difficult to hear in noisy environments',
      'Forgetting that JVD may be absent if patient is also hypovolemic',
      'Using under-resuscitation (small volumes slowly)',
      'Placing occlusive dressing on all sides (can cause tension pneumothorax)',
      'Not considering emergency department thoracotomy in deteriorating patients',
      'Missing that "normal" FAST does NOT rule out cardiac injury (may be clotted hematoma)',
      'Not pre-alerting receiving hospital appropriately',
      'Focusing on the wound and missing the hemodynamic assessment'
    ],
    references: [
      'ATLS 10th Edition - Chest Trauma',
      'ACS Trauma Guidelines',
      'Eastern Association for the Surgery of Trauma (EAST) Guidelines',
      'Life in the Fast Lane - Cardiac Tamponade'
    ]
  }),

  // Tension Pneumothorax with Flail Chest
  createCase({
    id: 'trauma-005',
    title: 'Blunt Chest Trauma - Tension Pneumothorax with Flail Chest',
    category: 'trauma',
    subcategory: 'chest-trauma',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 35,
    dispatchInfo: {
      callReason: 'MVC - driver trapped, chest injury, difficulty breathing',
      timeOfDay: 'afternoon',
      location: 'Sheikh Zayed Road, Dubai',
      callerInfo: 'Police on scene',
      dispatchCode: 'Echo-1',
      additionalInfo: ['High-speed collision', 'Car vs barrier at ~100km/h', 'Driver trapped', 'Fire department en route for extrication']
    },
    patientInfo: {
      age: 28,
      gender: 'male',
      weight: 80,
      occupation: 'Delivery driver',
      language: 'English, Hindi'
    },
    sceneInfo: {
      description: 'Vehicle with significant front-end damage, driver pinned by steering wheel',
      hazards: ['Fuel leak', 'Risk of vehicle fire', 'Unstable vehicle', 'Glass and debris'],
      bystanders: 'Police and fire personnel on scene',
      environment: 'Hot day, asphalt road',
      accessIssues: ['Patient trapped', 'Extrication required'],
      extricationNeeded: true
    },
    initialPresentation: {
      generalImpression: 'Young male, in respiratory distress, chest wall deformity visible',
      position: 'Sitting (leaning forward)',
      appearance: 'Diaphoretic, cyanotic, anxious, using accessory muscles',
      consciousness: 'Alert but distressed',
      sounds: ['Diminished breath sounds on right', 'Stridor audible']
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent but compromised by respiratory distress', 'Patient able to speak in 1-2 word sentences'],
        interventions: ['Keep patient in sitting position', 'Prepare for possible intubation'],
        adjunctsNeeded: ['Have suction ready', 'Prepare advanced airway']
      },
      breathing: {
        rate: 36,
        rhythm: 'Labored',
        depth: 'Shallow',
        spo2: 85,
        findings: [
          'Severe tachypnea',
          'Absent breath sounds on right side',
          'Tracheal deviation to left',
          'Hyperresonance to percussion on right',
          'Flail segment visible on right anterior chest (ribs 3-5)',
          'Paradoxical chest wall movement'
        ],
        interventions: [
          'IMMEDIATE needle decompression right side 2nd ICS midclavicular',
          'High-flow oxygen 15L/min non-rebreather',
          'Consider finger thoracostomy if trained',
          'Prepare chest tube after decompression'
        ],
        auscultation: ['Absent breath sounds right lung', 'Diminished but present left lung'],
        percussion: ['Hyperresonant right side', 'Resonant left side']
      },
      circulation: {
        pulseRate: 145,
        pulseQuality: 'Thready but palpable radially',
        bp: { systolic: 85, diastolic: 60 },
        capillaryRefill: 4,
        skin: 'Pale, cool, diaphoretic',
        findings: [
          'Severe tachycardia',
          'Hypotensive',
          'JVD present on left',
          'Delayed capillary refill'
        ],
        interventions: [
          'IV access x2 large bore',
          'Fluid bolus NS 500mL',
          'Prepare blood products',
          'Continue fluids judiciously (avoid overload)'
        ],
        ecgFindings: ['Sinus tachycardia', 'Possible ST depression from hypoxia'],
        ivAccess: ['16G left AC fossa', '16G right AC fossa']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal 4mm, reactive',
        findings: ['Anxious', 'Verbal responses limited due to dyspnea'],
        interventions: ['Monitor GCS for deterioration', 'Consider head injury']
      },
      exposure: {
        findings: [
          'Flail segment right anterior chest ribs 3-5 (fractured in ≥2 places)',
          'Paradoxical movement of flail segment',
          'Chest wall abrasion from seatbelt',
          'No obvious external bleeding',
          'Possible steering wheel imprint on chest'
        ],
        interventions: [
          'Stabilize flail segment with padding or hand',
          'Full spinal precautions',
          'Maintain body temperature',
          'Log roll when possible for full assessment'
        ],
        deformities: ['Flail segment right chest 3-5th ribs', 'Possible sternum fracture']
      }
    },
    secondarySurvey: {
      head: ['No obvious trauma', 'Helmet not worn (not applicable)'],
      neck: ['No JVD on right (due to tension pneumo)', 'Trachea deviated to LEFT', 'C-spine tenderness - cannot fully assess until extricated'],
      chest: [
        'Flail segment right anterior ribs 3-5',
        'Paradoxical movement',
        'Chest wall crepitus',
        'Seatbelt sign across chest',
        'Absent breath sounds right',
        'Possible sternum fracture'
      ],
      abdomen: ['Difficult to assess due to position', 'No obvious distension', 'Seatbelt across abdomen - high risk for injury'],
      pelvis: ['Stable', 'No tenderness'],
      extremities: ['Possible fractured right femur (pain on movement)', 'Left ankle swollen'],
      posterior: ['Unable to fully assess until extricated'],
      neurological: ['GCS 14 (E4, V4, M6)', 'No obvious focal deficits', 'Moving all extremities (painful right femur)']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Lunch approximately 2 hours ago',
      eventsLeading: 'High-speed MVC. Patient was restrained driver. Vehicle collided with concrete barrier at approximately 100km/h. Airbag deployed. Patient remained conscious throughout.',
      socialHistory: {
        smoking: 'Unknown',
        alcohol: 'Unknown',
        occupation: 'Delivery driver'
      }
    },
    investigations: [
      { name: 'Chest X-ray', indication: 'After stabilization', findings: 'Large right pneumothorax with mediastinal shift to left, multiple rib fractures right 3-5', interpretation: 'Tension pneumothorax', urgency: 'routine' },
      { name: 'FAST scan', indication: 'During primary survey', findings: 'Cannot assess adequately due to subcutaneous air and pneumothorax', interpretation: 'Limited study - proceed with clinical diagnosis', urgency: 'urgent' },
      { name: 'Pelvis X-ray', indication: 'Rule out pelvic fracture', findings: 'To be obtained', interpretation: 'Pending', urgency: 'routine' }
    ],
    vitalSignsProgression: {
      initial: { bp: '85/60', pulse: 145, respiration: 36, spo2: 85, gcs: 14 },
      afterIntervention: { bp: '100/70', pulse: 125, respiration: 28, spo2: 94, gcs: 15 },
      deterioration: { bp: '60/40', pulse: 160, respiration: 8, spo2: 70, gcs: 8 }
    },
    expectedFindings: {
      keyObservations: [
        'Absent breath sounds on right side',
        'Tracheal deviation to LEFT (away from affected side)',
        'Hyperresonance on right percussion',
        'JVD present on left (absent on right due to pneumothorax)',
        'Flail segment right anterior chest ribs 3-5',
        'Paradoxical chest wall movement',
        'Severe respiratory distress',
        'Hemodynamic compromise'
      ],
      redFlags: [
        'Tension pneumothorax - clinical diagnosis, decompress immediately!',
        'Tracheal deviation is LATE sign - do not wait for it!',
        'Flail chest indicates severe chest wall trauma',
        'Possible underlying pulmonary contusion',
        'High risk of deterioration during extrication'
      ],
      differentialDiagnoses: [
        'Tension pneumothorax',
        'Massive hemothorax',
        'Cardiac tamponade (also possible with blunt trauma)',
        'Flail chest without tension pneumothorax',
        'Combined injuries'
      ],
      mostLikelyDiagnosis: 'Right-sided Tension Pneumothorax with Flail Chest',
      supportingEvidence: [
        'Absent breath sounds right side',
        'Tracheal deviation to left',
        'Hyperresonance right side',
        'Hemodynamic compromise',
        'Flail segment visible on right chest',
        'Mechanism consistent with severe blunt trauma'
      ]
    },
    managementPathway: {
      immediate: [
        'IMMEDIATE needle decompression right 2nd ICS midclavicular',
        'High-flow oxygen 15L/min',
        'IV access x2',
        'Fluid resuscitation',
        'Consider finger thoracostomy if needle fails',
        'Coordinate with fire department for safe extrication'
      ],
      definitive: [
        'Chest tube insertion (36-40F) after decompression',
        'Analgesia for flail chest (consider regional blocks)',
        'Possible surgical rib fixation for severe flail',
        'Mechanical ventilation if respiratory failure develops',
        'Treat associated injuries (possible femur fracture)'
      ],
      monitoring: [
        'Continuous SpO2 monitoring',
        'Frequent vital signs',
        'Breath sounds bilaterally after interventions',
        'GCS monitoring',
        'Watch for re-tension pneumothorax'
      ],
      transportConsiderations: [
        'Pre-alert trauma center',
        'Consider HEMS given severity and distance',
        'Have chest tube equipment available',
        'Be prepared for deterioration during transport'
      ]
    },
    studentChecklist: [
      {
        id: 't2-1',
        category: 'abcde',
        description: 'Recognize tension pneumothorax - CLINICAL DIAGNOSIS',
        points: 30,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        timeframe: 'Within 1 minute of assessment',
        rationale: 'Tension pneumothorax kills within minutes. DO NOT wait for imaging. Clinical diagnosis is sufficient.',
        commonErrors: ['Waiting for X-ray confirmation', 'Missing the diagnosis in noisy environments', 'Confusing with simple pneumothorax'],
        details: [
          'Absent or decreased breath sounds on affected side',
          'Hyperresonance to percussion',
          'Tracheal deviation AWAY from affected side (LATE sign)',
          'JVD may be present',
          'Hemodynamic compromise'
        ],
      },
      {
        id: 't2-2',
        category: 'intervention',
        description: 'Perform immediate needle decompression (2nd ICS, midclavicular)',
        points: 30,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        timeframe: 'IMMEDIATELY upon recognition',
        rationale: 'Needle decompression is lifesaving. Delay can result in cardiac arrest and death.',
        commonErrors: [
          'Wrong location (too medial - can hit great vessels!',
          'Needle too short (must reach pleural space)',
          'Not advancing needle far enough',
          'Not listening for rush of air'
        ],
        details: [
          'Location: 2nd intercostal space, midclavicular line on affected side',
          'Use 14-16 gauge catheter, minimum 5cm length',
          'Insert perpendicular to chest wall',
          'Aim toward lateral aspect of rib (avoid neurovascular bundle)',
          'Listen for rush of air',
          'Leave catheter in place'
        ],
      },
      {
        id: 't2-3',
        category: 'intervention',
        description: 'Consider finger thoracostomy if needle decompression unsuccessful',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Finger thoracostomy is more reliable than needle decompression and should be considered if trained and needle fails.',
        commonErrors: ['Not knowing this technique', 'Insertion in wrong location', 'Inadequate incision'],
        details: [
          'Alternative location: 4th-5th ICS, anterior axillary line',
          'Make 2-3cm incision',
          'Blunt dissect to pleura',
          'Insert finger to confirm position',
          'More reliable than needle'
        ],
      },
      {
        id: 't2-4',
        category: 'abcde',
        description: 'Assess for flail chest and paradoxical movement',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Flail chest indicates severe trauma and is associated with underlying pulmonary contusion.',
        commonErrors: ['Missing the diagnosis', 'Confusing with simple rib fractures'],
        details: [
          'Flail = 3+ ribs fractured in 2+ places',
          'Look for paradoxical movement (moves in during inspiration)',
          'Stabilize segment with manual pressure or pillow',
          'Assess for underlying lung injury'
        ],
      },
      {
        id: 't2-5',
        category: 'intervention',
        description: 'Provide appropriate analgesia for flail chest',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        rationale: 'Pain control is essential for adequate ventilation and prevents atelectasis.',
        commonErrors: ['Under-treating pain', 'Fear of respiratory depression', 'Not considering regional techniques'],
        details: [
          'Multimodal analgesia preferred',
          'Consider nerve blocks if available',
          'Avoid excessive sedation that compromises respiratory drive',
          'Goal: adequate ventilation with pain control'
        ],
      },
      {
        id: 't2-6',
        category: 'abcde',
        description: 'Assess for associated injuries (abdominal, pelvic, long bones)',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'High-energy trauma often causes multiple injuries. Don\'t get distracted by the obvious chest injury.',
        commonErrors: ['Focusing only on chest injury', 'Missing abdominal injuries from seatbelt', 'Not checking for long bone fractures'],
        details: [
          'Seatbelt sign = high risk for abdominal injury',
          'Check for pelvic instability',
          'Assess all long bones for fractures',
          'Log roll when possible for full assessment'
        ],
      },
      {
        id: 't2-7',
        category: 'communication',
        description: 'Coordinate with fire department for safe extrication',
        points: 10,
        yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Unsafe extrication can worsen injuries, especially spinal. Coordination is essential.',
        commonErrors: ['Rushing extrication', 'Not maintaining spinal precautions', 'Not communicating medical needs to extraction team']
      },
      {
        id: 't2-8',
        category: 'documentation',
        description: 'Document mechanism of injury and time to decompression',
        points: 5,
        yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'],
        complexity: ['basic', 'intermediate', 'advanced', 'expert'],
        rationale: 'Documentation helps trauma team understand timing and severity.',
        commonErrors: ['Not documenting exact time of decompression', 'Vague mechanism description']
      }
    ],
    teachingPoints: [
      'Tension pneumothorax is a clinical diagnosis - DO NOT wait for imaging!',
      'Classic signs: absent breath sounds, hyperresonance, tracheal deviation AWAY from affected side',
      'Tracheal deviation is a LATE sign - do not wait for it to appear!',
      'Needle decompression location: 2nd ICS, midclavicular line on affected side',
      'Use large bore needle (14-16G) at least 5cm long - standard angiocatheters may be too short!',
      'Alternative site: 4th-5th ICS anterior axillary line (may be easier in some patients)',
      'Listen for rush of air after decompression - confirms successful decompression',
      'Flail chest: 3+ ribs fractured in 2+ places creates free-floating segment',
      'Paradoxical movement: flail segment moves IN during inspiration (opposite normal)',
      'Pain control for flail chest is essential - prevents atelectasis and improves ventilation',
      'Pulmonary contusion is the main cause of mortality in flail chest, not the rib fractures themselves',
      'Consider bilateral tension pneumothorax in blunt trauma, especially if patient was intubated/ventilated',
      'Watch for re-tension pneumothorax after needle decompression - chest tube is definitive treatment',
      'Seatbelt sign = high risk for serious intra-abdominal injury (hollow organ rupture, bowel/mesenteric injury)'
    ],
    commonPitfalls: [
      'Waiting for X-ray confirmation before decompressing',
      'Using needle that is too short (doesn\'t reach pleural space)',
      'Placing needle too medially (risk of great vessel injury)',
      'Not listening for rush of air (how do you know it worked?)',
      'Missing associated injuries while focusing on chest',
      'Forgetting that tracheal deviation is LATE',
      'Not recognizing flail chest as an indicator of severe trauma',
      'Under-treating pain in flail chest',
      'Failing to reassess after interventions',
      'Not considering bilateral tension pneumothorax',
      'Missing that seatbelt sign equals abdominal injury until proven otherwise'
    ],
    references: [
      'ATLS 10th Edition - Chest Trauma',
      'Eastern Association for the Surgery of Trauma (EAST) Guidelines',
      'Life in the Fast Lane - Tension Pneumothorax',
      'JRCALC Clinical Guidelines 2019'
    ]
  }),

  // Massive Hemothorax
  createCase({
    id: 'trauma-006',
    title: 'Massive Hemothorax - Penetrating Trauma',
    category: 'trauma',
    subcategory: 'chest-trauma',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Multiple GSW victims, one with chest wounds',
      timeOfDay: 'evening',
      location: 'Nightclub in Dubai Marina',
      callerInfo: 'Security staff',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Multiple patients', 'Scene not secure', 'Police en route', 'At least 3 victims']
    },
    patientInfo: {
      age: 26,
      gender: 'male',
      weight: 72,
      occupation: 'Unknown',
      language: 'Unknown'
    },
    sceneInfo: {
      description: 'Chaotic scene, multiple casualties',
      hazards: ['ACTIVE SHOOTER SCENE - unsafe!', 'Multiple weapons', 'Panic'],
      bystanders: 'Multiple casualties and bystanders',
      environment: 'Indoor nightclub, loud music, flashing lights',
      accessIssues: ['Scene safety - must wait for police'],
      extricationNeeded: false
    },
    initialPresentation: {
      generalImpression: 'Young male lying supine, rapid shallow breathing, pale',
      position: 'Supine',
      appearance: 'Pale, diaphoretic, in obvious distress',
      consciousness: 'Alert but anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Airway patent', 'Able to speak in full sentences initially'],
        interventions: ['Maintain airway']
      },
      breathing: {
        rate: 28,
        rhythm: 'Rapid, shallow',
        depth: 'Shallow',
        spo2: 91,
        findings: [
          'Tachypneic',
          'Diminished breath sounds on right',
          'Dullness to percussion on right',
          'Visible chest wound right lateral chest'
        ],
        interventions: [
          'Occlusive dressing for chest wound',
          'High-flow oxygen',
          'Prepare for chest tube',
          'IV access, fluid resuscitation'
        ],
        auscultation: ['Diminished right lung', 'Present left lung']
      },
      circulation: {
        pulseRate: 130,
        pulseQuality: 'Weak',
        bp: { systolic: 90, diastolic: 65 },
        capillaryRefill: 4,
        skin: 'Pale, cool, clammy',
        findings: [
          'Tachycardic',
          'Hypotensive',
          'Signs of shock',
          'Visible blood on chest'
        ],
        interventions: [
          '2x large bore IV',
          'Aggressive fluid resuscitation',
          'Blood products if available',
          'Prepare for massive transfusion protocol'
        ],
        ecgFindings: ['Sinus tachycardia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm, reactive',
        findings: ['Anxious but fully oriented'],
        interventions: []
      },
      exposure: {
        findings: [
          'GSW entrance wound right lateral chest, 5th intercostal space, midaxillary line',
          'No exit wound visible',
          'Moderate external bleeding',
          'No other visible wounds'
        ],
        interventions: [
          'Cover wound with occlusive dressing',
          'Full spinal precautions',
          'Log roll when safe'
        ]
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No JVD (hypovolemic)', 'Trachea midline'],
      chest: [
        'GSW right lateral chest 5th ICS midaxillary',
        'Dullness to percussion right base',
        'Diminished breath sounds right base',
        'No chest wall crepitus'
      ],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['No obvious fractures'],
      posterior: ['No exit wound posteriorly'],
      neurological: ['Normal', 'GCS 15']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Unknown',
      eventsLeading: 'Patient was in nightclub when shooting occurred. Multiple shots fired. Patient felt impact to right chest.'
    },
    investigations: [
      { name: 'Chest tube output', indication: 'Place chest tube', findings: 'Initial output 1800mL blood', interpretation: 'MASSIVE hemothorax - requires thoracotomy', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '90/65', pulse: 130, respiration: 28, spo2: 91, gcs: 15 },
      afterIntervention: { bp: '95/70', pulse: 125, respiration: 26, spo2: 94, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Penetrating trauma to right hemithorax',
        'Signs of hypovolemic shock',
        'Diminished breath sounds right base',
        'Dullness to percussion (blood in pleural space)',
        'Chest tube output >1500mL indicates massive hemothorax'
      ],
      redFlags: [
        'Massive hemothorax (>1500mL or 1/3 blood volume)',
        'Initial output >1500mL requires immediate thoracotomy',
        'Ongoing bleeding >200mL/hour requires thoracotomy',
        'Hypovolemic shock'
      ],
      differentialDiagnoses: [
        'Massive hemothorax',
        'Tension pneumothorax (concurrent or evolving)',
        'Combined hemothorax/pneumothorax (hemopneumothorax)',
        'Pulmonary contusion with less blood loss'
      ],
      mostLikelyDiagnosis: 'Right Massive Hemothorax from GSW'
    },
    managementPathway: {
      immediate: [
        'Occlusive dressing for chest wound',
        'High-flow oxygen',
        '2x large bore IV',
        'Aggressive fluid resuscitation',
        'Place large bore chest tube (36-40F)',
        'Measure output carefully'
      ],
      definitive: [
        'Emergency thoracotomy if >1500mL initial output',
        'Surgical control of bleeding',
        'Blood product resuscitation',
        'ICU admission'
      ],
      monitoring: [
        'Continuous cardiac monitoring',
        'Frequent vital signs',
        'Chest tube output monitoring'
      ]
    },
    studentChecklist: [
      {
        id: 't3-1',
        category: 'intervention',
        description: 'Place LARGE BORE chest tube (36-40F)',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Small tubes will clot and fail to evacuate blood. Large bore essential.',
        commonErrors: ['Using small tube (clots)', 'Incorrect placement']
      },
      {
        id: 't3-2',
        category: 'intervention',
        description: 'Measure initial chest tube output carefully',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: '>1500mL initial OR >200mL/hour ongoing = requires thoracotomy.',
        commonErrors: ['Not measuring output', 'Delayed recognition of ongoing bleed']
      },
      {
        id: 't3-3',
        category: 'intervention',
        description: 'Aggressive fluid/blood resuscitation',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Hemothorax = significant blood loss. Replace with blood products when available.',
        commonErrors: ['Under-resuscitating', 'Using crystalloids exclusively']
      },
      {
        id: 't3-4',
        category: 'abcde',
        description: 'Assess for dullness to percussion (blood in pleural space)',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Dullness indicates fluid. Differentiates from pneumothorax (hyperresonant).',
        commonErrors: ['Not percussing chest', 'Missing unilateral finding']
      }
    ],
    teachingPoints: [
      'Massive hemothorax: >1500mL or 1/3 patient blood volume',
      'Initial output >1500mL = immediate thoracotomy',
      'Ongoing output >200mL/hour for 2-4 hours = thoracotomy',
      'Use 36-40F chest tube - smaller tubes clot!',
      'Consider autotransfusion if available',
      'Look for bleeding source: intercostal vessels, internal mammary, lung parenchyma, great vessels',
      'Hypovolemic shock may be from chest alone - don\'t miss abdominal bleeding'
    ],
    commonPitfalls: [
      'Using small chest tube that clots',
      'Not measuring initial output',
      'Delayed recognition of ongoing bleeding',
      'Under-resuscitating',
      'Not considering thoracotomy when indicated'
    ],
    references: [
      'ATLS 10th Edition',
      'EAST Guidelines',
      'Life in the Fast Lane - Hemothorax'
    ]
  }),

  // Abdominal Trauma with Solid Organ Injury
  createCase({
    id: 'trauma-007',
    title: 'Blunt Abdominal Trauma - Splenic Laceration',
    category: 'trauma',
    subcategory: 'abdominal-trauma',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'MVC - driver complaining of abdominal pain',
      timeOfDay: 'afternoon',
      location: 'Al Khail Road, Dubai',
      callerInfo: 'Police',
      dispatchCode: 'Delta-1',
      additionalInfo: ['Frontal impact', 'Driver restrained', 'Airbag deployed']
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 78,
      occupation: 'Sales executive',
      language: 'English'
    },
    sceneInfo: {
      description: 'Vehicle with front-end damage, driver out of vehicle',
      hazards: ['Fluid spill', 'Debris'],
      bystanders: 'Police on scene',
      environment: 'Hot day'
    },
    initialPresentation: {
      generalImpression: 'Male, pale, clutching abdomen',
      position: 'Sitting, leaning forward',
      appearance: 'Pale, diaphoretic, in pain',
      consciousness: 'Alert but distracted by pain'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent'], interventions: [] },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 96,
        findings: ['Mild tachypnea', 'Splinting respirations due to pain'],
        interventions: ['Oxygen if SpO2 <94%'],
        auscultation: ['Clear bilateral']
      },
      circulation: {
        pulseRate: 115,
        pulseQuality: 'Weak',
        bp: { systolic: 100, diastolic: 70 },
        capillaryRefill: 3,
        skin: 'Pale, cool',
        findings: ['Tachycardic', 'Mild hypotension developing', 'Signs of early shock'],
        interventions: ['IV access x2', 'Fluid bolus 500mL', 'Monitor for deterioration'],
        ecgFindings: ['Sinus tachycardia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm reactive',
        findings: ['Alert but anxious'],
        interventions: []
      },
      exposure: {
        findings: ['Seatbelt sign across abdomen', 'Tenderness LUQ', 'Guarding', 'No obvious external bleeding'],
        interventions: ['Full exposure', 'Maintain temperature']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No JVD', 'Trachea midline'],
      chest: ['Clear lungs', 'Normal heart sounds'],
      abdomen: ['Tender LUQ', 'Guarding', 'Rebound tenderness positive', 'Bowel sounds decreased', 'Seatbelt sign'],
      pelvis: ['Stable'],
      extremities: ['No obvious fractures'],
      posterior: ['No spine tenderness'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: ['None'],
      surgicalHistory: ['Appendectomy'],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Driver of vehicle that rear-ended a truck at ~60km/h. Was wearing seatbelt. Airbag deployed.'
    },
    investigations: [
      { name: 'FAST scan', indication: 'Abdominal trauma', findings: 'Fluid in LUQ (splenorenal recess)', interpretation: 'Splenic injury likely', urgency: 'immediate' },
      { name: 'Pelvic X-ray', indication: 'Rule out pelvic fracture', findings: 'Normal', interpretation: 'No pelvic fracture', urgency: 'routine' }
    ],
    vitalSignsProgression: {
      initial: { bp: '100/70', pulse: 115, respiration: 22, spo2: 96, gcs: 15 },
      afterIntervention: { bp: '95/65', pulse: 125, respiration: 24, spo2: 95, gcs: 15 },
      deterioration: { bp: '75/45', pulse: 140, respiration: 28, spo2: 92, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Abdominal tenderness LUQ',
        'Seatbelt sign',
        'Signs of early shock',
        'FAST positive for LUQ fluid',
        'Rebound tenderness'
      ],
      redFlags: [
        'Solid organ injury - spleen most commonly injured',
        'Seatbelt sign = high risk for hollow viscus injury',
        'Hypotension with abdominal pain = concerning',
        'FAST positive requires urgent surgical consultation'
      ],
      differentialDiagnoses: [
        'Splenic laceration/rupture',
        'Hollow viscus injury',
        'Mesenteric tear',
        'Renal injury',
        'Pelvic fracture with retroperitoneal bleed'
      ],
      mostLikelyDiagnosis: 'Blunt splenic injury with internal hemorrhage',
      supportingEvidence: [
        'LUQ tenderness',
        'Seatbelt sign',
        'FAST showing LUQ fluid',
        'Tachycardia out of proportion to apparent injury',
        'Progressive hypotension'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC approach',
        'IV access x2',
        'Fluid resuscitation',
        'FAST exam',
        'Abdominal examination',
        'Pre-alert trauma center'
      ],
      definitive: [
        'Urgent CT abdomen if stable',
        'Surgical consultation',
        'Possible splenorrhaphy or splenectomy',
        'Blood products as needed'
      ],
      monitoring: [
        'Frequent vital signs',
        'Repeat FAST if condition changes',
        'Abdominal girth'
      ]
    },
    studentChecklist: [
      {
        id: 't7-1',
        category: 'abcde',
        description: 'Recognize seatbelt sign as high-risk indicator',
        points: 20,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Seatbelt sign indicates high-energy transmission and high risk of serious intra-abdominal injury.',
        commonErrors: ['Not examining abdomen under seatbelt', 'Dismissing as minor bruising'],
        details: ['Check for abrasion/bruising', 'High correlation with bowel/mesenteric injury']
      },
      {
        id: 't7-2',
        category: 'intervention',
        description: 'Perform FAST exam for abdominal trauma',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'FAST detects free fluid from solid organ injury. LUQ = spleen.',
        commonErrors: ['Not performing FAST', 'Missing fluid pockets', 'Not checking all quadrants']
      },
      {
        id: 't7-3',
        category: 'abcde',
        description: 'Assess for rebound tenderness (peritoneal irritation)',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Rebound suggests peritoneal irritation from blood or bowel contents.',
        commonErrors: ['Not checking for rebound', 'Hurting patient unnecessarily (gentle technique needed)'],
        details: ['Press deeply', 'Release suddenly', 'Pain on release = peritoneal irritation']
      }
    ],
    teachingPoints: [
      'Spleen is most commonly injured solid organ in blunt trauma',
      'LUQ tenderness + FAST positive = splenic injury until proven otherwise',
      'Seatbelt sign = high risk for hollow viscus injury (bowel/mesentery)',
      'Hypotension with abdominal pain = solid organ injury until proven otherwise',
      'FAST is rapid but operator-dependent',
      'Children have larger spleens - more vulnerable to injury',
      'Splenic injury can cause rapid blood loss - capsule ruptures under pressure',
      'Consider autotransfusion if blood products scarce'
    ],
    commonPitfalls: [
      'Missing the seatbelt sign',
      'Focusing on visible injuries and missing abdomen',
      'Not performing FAST exam',
      'Dismissing LUQ pain as rib fractures',
      'Under-resuscitating while waiting for imaging',
      'Not considering hollow viscus injury with seatbelt sign'
    ],
    references: [
      'ATLS 10th Edition - Abdominal Trauma',
      'EAST Guidelines'
    ]
  }),

  // Pelvic Fracture with Hemorrhagic Shock
  createCase({
    id: 'trauma-008',
    title: 'Pelvic Fracture with Hemorrhagic Shock',
    category: 'trauma',
    subcategory: 'pelvic-fracture',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Pedestrian struck by car, pelvic pain',
      timeOfDay: 'evening',
      location: 'Mamzar Beach Road, Dubai',
      callerInfo: 'Security guard',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient struck at ~40km/h', 'Significant deformity', 'Police en route']
    },
    patientInfo: {
      age: 45,
      gender: 'female',
      weight: 65,
      occupation: 'Tourist',
      language: 'English'
    },
    sceneInfo: {
      description: 'Patient supine on roadside, leg shortened and externally rotated',
      hazards: ['Traffic', 'Poor lighting'],
      bystanders: 'Security, bystanders',
      environment: 'Nighttime, street lighting'
    },
    initialPresentation: {
      generalImpression: 'Female, pale, in severe pain, leg deformity',
      position: 'Supine',
      appearance: 'Pale, diaphoretic, distressed',
      consciousness: 'Alert but in pain'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent'], interventions: [] },
      breathing: {
        rate: 26,
        rhythm: 'Rapid',
        depth: 'Shallow',
        spo2: 93,
        findings: ['Tachypnea', 'Pain-limited respirations'],
        interventions: ['High-flow oxygen 15L/min'],
        auscultation: ['Clear but reduced due to pain']
      },
      circulation: {
        pulseRate: 135,
        pulseQuality: 'Thready',
        bp: { systolic: 75, diastolic: 50 },
        capillaryRefill: 5,
        skin: 'Pale, cold, clammy',
        findings: ['Severe tachycardia', 'Severe hypotension', 'Signs of hemorrhagic shock', 'Decreased distal pulses'],
        interventions: ['IV access x2', 'Aggressive fluid resuscitation', 'Consider pelvic binder', 'Blood products'],
        ecgFindings: ['Sinus tachycardia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 3mm reactive',
        findings: ['Anxious', 'Moaning in pain'],
        interventions: ['Pain management']
      },
      exposure: {
        findings: ['Left leg shortened and externally rotated', 'Pelvic instability', 'Bruising over pubic symphysis', 'Blood at meatus'],
        interventions: ['Do NOT log roll', 'Apply pelvic binder', 'Maintain spinal precautions'],
        deformities: ['Pelvic deformity', 'Left leg external rotation']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['No JVD', 'Trachea midline'],
      chest: ['Clear lungs', 'Normal heart sounds'],
      abdomen: ['Distended', 'Tender diffusely', 'Guarding'],
      pelvis: ['UNSTABLE on compression', 'Crepitus', 'Shortened left leg', 'Externally rotated'],
      extremities: ['Left leg shortened/external rotation', 'Distal pulses weak', 'No other obvious fractures'],
      posterior: ['Unable to fully assess'],
      neurological: ['Normal, distracted by pain']
    },
    history: {
      medications: [{ name: 'Oral contraceptive', dose: 'Daily', frequency: 'Daily' }],
      allergies: ['Penicillin'],
      medicalConditions: ['None'],
      surgicalHistory: [],
      lastMeal: 'Dinner 3 hours ago',
      eventsLeading: 'Walking on sidewalk when car struck her from behind. Thrown approximately 5 meters. Landed on left side.'
    },
    investigations: [
      { name: 'Pelvic X-ray', indication: 'Pelvic deformity', findings: 'Fracture of left superior and inferior pubic rami, possible sacroiliac disruption', interpretation: 'Unstable pelvic fracture', urgency: 'urgent' },
      { name: 'FAST scan', indication: 'Hemorrhagic shock', findings: 'Free fluid in pelvis', interpretation: 'Active bleeding', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '75/50', pulse: 135, respiration: 26, spo2: 93, gcs: 15 },
      afterIntervention: { bp: '90/60', pulse: 120, respiration: 22, spo2: 96, gcs: 15 },
      deterioration: { bp: '60/40', pulse: 155, respiration: 30, spo2: 88, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Unstable pelvic fracture',
        'Signs of hemorrhagic shock',
        'Shortened externally rotated leg',
        'Blood at urethral meatus = urethral injury',
        'Pelvic instability on compression'
      ],
      redFlags: [
        'Pelvic fracture can lose 2-3L of blood!',
        'Blood at meatus = urethral injury - DO NOT insert Foley!',
        'Pelvic binder reduces bleeding by tamponade effect',
        'High mortality with unstable pelvic fractures'
      ],
      differentialDiagnoses: [
        'Unstable pelvic fracture',
        'Femoral fracture',
        'Sacral fracture',
        'Acetabular fracture'
      ],
      mostLikelyDiagnosis: 'Unstable pelvic fracture with hemorrhagic shock',
      supportingEvidence: [
        'Pelvic instability on exam',
        'Leg shortening and external rotation',
        'Hemodynamic instability out of proportion to visible injuries',
        'FAST positive for pelvic fluid',
        'Mechanism (pedestrian struck) high energy'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC approach with spinal precautions',
        'Apply pelvic binder ASAP',
        'IV access x2',
        'Aggressive fluid resuscitation',
        'Blood products',
        'DO NOT insert Foley catheter if blood at meatus',
        'Pre-alert trauma center',
        'Rapid transport'
      ],
      definitive: [
        'Pelvic external fixation',
        'Angioembolization of bleeding vessels',
        'Surgical stabilization',
        'Blood product resuscitation',
        'Suprapubic catheter if urethral injury'
      ],
      monitoring: [
        'Frequent vital signs',
        'Distal pulses',
        'Sensation in lower extremities',
        'Repeat FAST'
      ]
    },
    studentChecklist: [
      {
        id: 't8-1',
        category: 'abcde',
        description: 'Apply pelvic binder for unstable fracture',
        points: 25,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        timeframe: 'Immediately',
        rationale: 'Pelvic binder reduces pelvic volume, provides tamponade effect, decreases bleeding.',
        commonErrors: ['Not applying binder', 'Applying over femurs', 'Not tightening sufficiently'],
        details: ['Apply at greater trochanters', 'Tighten appropriately', 'Reduces pelvic volume']
      },
      {
        id: 't8-2',
        category: 'intervention',
        description: 'DO NOT insert Foley catheter if blood at meatus',
        points: 25,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Blood at meatus indicates urethral injury. Catheter can worsen injury.',
        commonErrors: ['Inserting Foley without checking', 'Missing blood at meatus', 'Creating false passage'],
        details: ['Look for blood', 'If present, get retrograde urethrogram', 'Suprapubic catheter instead']
      },
      {
        id: 't8-3',
        category: 'intervention',
        description: 'Recognize severity of pelvic hemorrhage',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Pelvic fractures can lose 2-3L blood. Rapid exsanguination possible.',
        commonErrors: ['Underestimating blood loss', 'Starting with fluids instead of blood'],
        details: ['Preload with blood products', 'Massive transfusion protocol early', 'Pelvic binder saves lives']
      },
      {
        id: 't8-4',
        category: 'abcde',
        description: 'Assess pelvic instability carefully',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Careful assessment confirms unstable fracture. Do NOT rock pelvis aggressively.',
        commonErrors: ['Rocking pelvis too hard', 'Causing more bleeding', 'Missing subtle instability'],
        details: ['Gentle compression', 'Downward pressure on iliac crests', 'Observe for pain/movement']
      }
    ],
    teachingPoints: [
      'Pelvic fractures can lose 2-3 liters of blood!',
      'Apply pelvic binder EARLY - provides tamponade effect',
      'Blood at urethral meatus = urethral injury - NO Foley!',
      'Leg shortening with external rotation = classic pelvic fracture sign',
      'Unstable fractures (open book, vertical shear) have higher mortality',
      'Mechanism matters: lateral compression vs AP compression vs vertical shear',
      'Always check for rectal and vaginal injuries (blood indicates fracture)',
      'Consider angioembolization for ongoing bleeding',
      'Massive transfusion protocol may be needed'
    ],
    commonPitfalls: [
      'Not applying pelvic binder',
      'Inserting Foley despite blood at meatus',
      'Aggressively rocking pelvis (causes more bleeding)',
      'Underestimating blood loss potential',
      'Not checking for associated injuries (rectum, vagina, urethra)',
      'Missing that legs can be different lengths',
      'Focusing on obvious injury and missing other sources of bleeding'
    ],
    references: [
      'ATLS 10th Edition - Pelvic Trauma',
      'EAST Guidelines - Pelvic Fracture Management'
    ]
  }),

  // Severe Head Injury with Intracranial Hemorrhage
  createCase({
    id: 'trauma-009',
    title: 'Severe Head Injury - Epidural Hematoma',
    category: 'trauma',
    subcategory: 'head-injury',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Fall from height, unconscious',
      timeOfDay: 'morning',
      location: 'Construction site in Dubai Hills',
      callerInfo: 'Site foreman',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient fell ~4 meters', 'Hit head on concrete', 'Worker not wearing helmet']
    },
    patientInfo: {
      age: 29,
      gender: 'male',
      weight: 75,
      occupation: 'Construction worker',
      language: 'Hindi, Basic English'
    },
    sceneInfo: {
      description: 'Construction site, patient supine near scaffolding',
      hazards: ['Construction equipment', 'Uneven ground', 'Debris'],
      bystanders: 'Multiple workers, foreman',
      environment: 'Dusty, outdoor'
    },
    initialPresentation: {
      generalImpression: 'Young male, unresponsive, bleeding from head',
      position: 'Supine',
      appearance: 'Blood on face, pale',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Airway compromised by decreased consciousness', 'Blood in airway'],
        interventions: ['Jaw thrust', 'Suction', 'Consider intubation'],
        adjunctsNeeded: ['Suction', 'OPA']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular but shallow',
        depth: 'Shallow',
        spo2: 90,
        findings: ['Adequate rate but shallow', 'No obvious chest trauma'],
        interventions: ['High-flow oxygen', 'Assist ventilation if needed'],
        auscultation: ['Equal bilateral']
      },
      circulation: {
        pulseRate: 58,
        pulseQuality: 'Strong',
        bp: { systolic: 165, diastolic: 100 },
        capillaryRefill: 2,
        skin: 'Warm',
        findings: ['Bradycardia', 'Severe hypertension', 'Cushing\'s triad'],
        interventions: ['IV access', 'Monitor for herniation', 'Hyperventilation if signs of herniation'],
        ecgFindings: ['Sinus bradycardia']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 4, total: 6 },
        pupils: ['Right dilated 6mm non-reactive', 'Left 4mm sluggish'],
        findings: ['Uncal herniation signs', 'Dilated fixed pupil = blowout'],
        interventions: ['Protect spine', 'Hyperventilate if herniating', 'Elevate head 30°'],
          focalNeurology: ['Left-sided weakness', 'Extensor posturing']
      },
      exposure: {
        findings: ['Large scalp laceration parietal region', 'Battle\'s sign present', 'Raccoon eyes developing', 'CSF otorrhea right ear'],
        interventions: ['Control bleeding', 'Maintain C-spine immobilization', 'Do NOT packing scalp wounds deeply']
      }
    },
    secondarySurvey: {
      head: ['Large scalp laceration right parietal', 'Battle\'s sign', 'Raccoon eyes', 'CSF otorrhea'],
      neck: ['C-spine precautions maintained'],
      chest: ['Clear'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Stable'],
      extremities: ['Moving all four equally', 'No obvious fractures'],
      posterior: ['No step-off'],
      neurological: ['GCS 6 (E1, V1, M4)', 'Right blown pupil', 'Left hemiparesis']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: ['Unknown'],
      lastMeal: 'Breakfast 3 hours ago',
      eventsLeading: 'Worker fell from scaffolding approximately 4 meters onto concrete. Was reported to be initially conscious then became unresponsive after ~5 minutes.'
    },
    investigations: [
      { name: 'CT Head', indication: 'Severe head injury', findings: 'Right-sided epidural hematoma with midline shift, skull fracture', interpretation: 'Surgical emergency - requires evacuation', urgency: 'immediate' }
    ],
    vitalSignsProgression: {
      initial: { bp: '165/100', pulse: 58, respiration: 18, spo2: 90, gcs: 6 },
      afterIntervention: { bp: '160/95', pulse: 62, respiration: 16, spo2: 94, gcs: 6 },
      deterioration: { bp: '220/120', pulse: 45, respiration: 8, spo2: 88, gcs: 3 }
    },
    expectedFindings: {
      keyObservations: [
        'Lucid interval followed by deterioration (classic for EDH)',
        'Cushing\'s triad: bradycardia, hypertension, irregular respirations',
        'Dilated fixed pupil on side of hematoma',
        'Contralateral hemiparesis',
        'Scalp laceration overlying skull fracture'
      ],
      redFlags: [
        'Epidural hematoma - surgical emergency!',
        'Lucid interval is classic for EDH but absent in 30%',
        'Rapid deterioration to herniation',
        'Blown pupil = uncal herniation',
        'Time is brain - evacuate NOW!'
      ],
      differentialDiagnoses: [
        'Epidural hematoma',
        'Subdural hematoma',
        'Intracerebral hemorrhage',
        'Diffuse axonal injury',
        'Brain contusion'
      ],
      mostLikelyDiagnosis: 'Acute Epidural Hematoma with Uncal Herniation',
      supportingEvidence: [
        'Lucid interval history',
        'Cushing\'s triad present',
        'Dilated fixed right pupil (ipsilateral to injury)',
        'Contralateral weakness',
        'Rapid neurological deterioration',
        'Skull fracture on CT'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC with spinal precautions',
        'Secure airway (GCS ≤8)',
        'Hyperventilate if herniating (target EtCO2 30-35)',
        'Elevate head 30°',
        'IV access',
        'Mannitol 0.5-1g/kg if herniation signs',
        'Rapid transport to neurosurgical center',
        'Pre-alert neurosurgeon'
      ],
      definitive: [
        'Emergency craniotomy',
        'Epidural hematoma evacuation',
        'Hemostasis',
        'ICU monitoring',
        'ICP monitoring'
      ],
      monitoring: [
        'Continuous GCS monitoring',
        'Pupil size and reactivity',
        'Vital signs',
        'Watch for herniation signs'
      ]
    },
    studentChecklist: [
      {
        id: 't9-1',
        category: 'abcde',
        description: 'Recognize Cushing\'s triad (bradycardia, hypertension, irregular respirations)',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Cushing\'s triad indicates rising ICP and impending herniation. Life-threatening emergency.',
        commonErrors: ['Not recognizing triad', 'Treating hypertension in isolation', 'Missing herniation signs'],
        details: ['Bradycardia <60', 'Systolic BP >160', 'Irregular respirations (Cheyne-Stokes)']
      },
      {
        id: 't9-2',
        category: 'abcde',
        description: 'Recognize blown pupil = uncal herniation',
        points: 25,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Dilated fixed pupil indicates uncal herniation. Neurosurgical emergency.',
        commonErrors: ['Not checking pupils frequently', 'Attributing to drugs', 'Delaying treatment'],
        details: ['Ipsilateral to injury', 'Non-reactive to light', '≥6mm size', 'Sign of brainstem compression']
      },
      {
        id: 't9-3',
        category: 'intervention',
        description: 'Hyperventilate if signs of herniation',
        points: 20,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Temporary measure to lower ICP by causing vasoconstriction. Buy time for surgery.',
        commonErrors: ['Hyperventilating prophylactically', 'Targeting wrong EtCO2', 'Over-hyperventilating'],
        details: ['Target EtCO2 30-35 mmHg', 'Temporary measure only', 'Can cause cerebral ischemia if prolonged']
      },
      {
        id: 't9-4',
        category: 'intervention',
        description: 'Secure airway for GCS ≤8',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Low GCS = unable to protect airway. Intubation protects from aspiration and hypoxia.',
        commonErrors: ['Delaying intubation', 'Not using RSI', 'Forgetting cervical spine precautions'],
        details: ['GCS ≤8 = intubate', 'RSI with cervical spine protection', 'Succinylcholine contraindicated if >24h post-injury']
      }
    ],
    teachingPoints: [
      'Epidural hematoma = arterial bleed (usually middle meningeal artery)',
      'Lucid interval is classic but only present in ~70%',
      'Cushing\'s triad = bradycardia + hypertension + irregular respirations',
      'Dilated fixed pupil = uncal herniation - surgical emergency!',
      'Time is brain - evacuate hematoma within 1 hour for best outcome',
      'Blown pupil is ipsilateral to hematoma (same side)',
      'Weakness is contralateral to hematoma (opposite side)',
      'Battle\'s sign = mastoid bruise (basal skull fracture)',
      'Raccoon eyes = periorbital bruising (basal skull fracture)',
      'CSF otorrhea/rhinorrhea = basal skull fracture - DO NOT pack!',
      'Hyperventilation is TEMPORARY - surgery is definitive treatment'
    ],
    commonPitfalls: [
      'Not recognizing Cushing\'s triad',
      'Treating head injury hypertension (it\'s compensatory!)',
      'Missing blown pupil significance',
      'Not intubating low GCS',
      'Probing scalp wounds deeply (can penetrate skull!)',
      'Not pre-alerting neurosurgery early enough',
      'Focusing on lucid interval and missing rapid deterioration',
      'Not monitoring GCS frequently',
      'Forgetting that epidural can be VERY rapid (minutes to hours)'
    ],
    references: [
      'ATLS 10th Edition - Head Trauma',
      'Brain Trauma Foundation Guidelines',
      'Life in the Fast Lane - Epidural Hematoma'
    ]
  }),

  // Spinal Cord Injury
  createCase({
    id: 'trauma-010',
    title: 'Cervical Spinal Cord Injury - Diving Accident',
    category: 'trauma',
    subcategory: 'spinal-injury',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Diving accident, cannot move arms or legs',
      timeOfDay: 'afternoon',
      location: 'Jumeirah Beach, Dubai',
      callerInfo: 'Lifeguard',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Dove into shallow water', 'Face struck bottom', 'Possible neck injury']
    },
    patientInfo: {
      age: 22,
      gender: 'male',
      weight: 70,
      occupation: 'University student',
      language: 'English'
    },
    sceneInfo: {
      description: 'Beach, patient supine in shallow water',
      hazards: ['Water rescue', 'Crowd on beach'],
      bystanders: 'Lifeguards, multiple bystanders',
      environment: 'Hot sunny day, sand, water'
    },
    initialPresentation: {
      generalImpression: 'Young male, alert but unable to move extremities',
      position: 'Supine in shallow water',
      appearance: 'Alert, anxious, appears unable to move below shoulders',
      consciousness: 'Alert and oriented'
    },
    abcde: {
      airway: { patent: true, findings: ['Patent, talking normally'], interventions: [] },
      breathing: {
        rate: 24,
        rhythm: 'Shallow',
        depth: 'Shallow',
        spo2: 94,
        findings: ['Tachypneic', 'Using accessory muscles', 'Diaphragmatic breathing'],
        interventions: ['High-flow oxygen', 'Assist ventilation if needed'],
        auscultation: ['Reduced at bases']
      },
      circulation: {
        pulseRate: 65,
        pulseQuality: 'Normal',
        bp: { systolic: 95, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Warm',
        findings: ['Mild hypotension', 'Bradycardic relative to anxiety'],
        interventions: ['IV access', 'Fluid bolus if hypotensive', 'Monitor for neurogenic shock'],
        ecgFindings: ['Sinus bradycardia']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal 4mm reactive',
        findings: [
          'Alert and oriented',
          'NO motor function below C5',
          'Sensation absent below clavicle',
          'Diaphragmatic breathing only',
          'Priapism present'
        ],
        interventions: [
          'Maintain strict spinal immobilization',
          'Log roll only',
          'DO NOT move patient excessively',
          'Monitor for neurogenic shock'
        ],
        focalNeurology: ['Complete cord injury at C5 level', 'Absent rectal tone', 'Bulbocavernosus reflex absent']
      },
      exposure: {
        findings: ['No obvious deformity', 'Tenderness C4-C5', 'No sensation below clavicle', 'Priapism'],
        interventions: ['Maintain C-spine precautions', 'Keep warm', 'Log roll team of 4+']
      }
    },
    secondarySurvey: {
      head: ['No facial trauma'],
      neck: ['Tenderness C4-C5', 'STEP-OFF present', 'Midline'],
      chest: ['Diaphragmatic breathing', 'Reduced chest expansion'],
      abdomen: ['Soft, absent bowel sounds'],
      pelvis: ['Stable'],
      extremities: ['Flaccid paralysis all four limbs', 'No reflexes', 'Priapism'],
      posterior: ['Step-off at C5'],
      neurological: [
        'C5 complete cord injury',
        'Sensory level at clavicle',
        'Motor: biceps present, wrists/hands absent',
        'Absent rectal tone'
      ]
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: ['None'],
      surgicalHistory: ['None'],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Patient dove into shallow water (~1m depth) at beach. Struck head on sandy bottom. Could not move arms or legs afterward. Lifeguard rescued him.'
    },
    investigations: [
      { name: 'CT Cervical Spine', indication: 'Neurologic deficit', findings: 'Fracture-dislocation C4-C5 with complete cord compression', interpretation: 'Surgical emergency - spinal cord injury', urgency: 'immediate' },
      { name: 'MRI Spine', indication: 'Assess cord injury', findings: 'Complete cord transection at C5 level', interpretation: 'Complete spinal cord injury', urgency: 'urgent' }
    ],
    vitalSignsProgression: {
      initial: { bp: '95/60', pulse: 65, respiration: 24, spo2: 94, gcs: 15 },
      afterIntervention: { bp: '100/65', pulse: 68, respiration: 20, spo2: 96, gcs: 15 },
      deterioration: { bp: '70/45', pulse: 50, respiration: 8, spo2: 88, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: [
        'Complete spinal cord injury at C5 level',
        'Diaphragmatic breathing (phrenic nerve C3-C5 intact)',
        'Paralysis of all extremities (quadriplegia)',
        'Loss of sensation below clavicle',
        'Priapism (pathologic sign of cord injury)',
        'Neurogenic shock (bradycardia, hypotension)'
      ],
      redFlags: [
        'High cervical injury (C3-C5) = respiratory compromise!',
        'Neurogenic shock can develop rapidly',
        'C5 level = biceps present, wrist/hand function absent',
        'Complete cord injury has poor prognosis for recovery',
        'Risk of respiratory failure if injury ascends'
      ],
      differentialDiagnoses: [
        'Complete cervical spinal cord injury',
        'Incomplete cord injury (central cord syndrome)',
        'Spinal shock vs neurogenic shock',
        'Cervical vertebral fracture without cord injury'
      ],
      mostLikelyDiagnosis: 'Complete C5 Spinal Cord Injury with Neurogenic Shock',
      supportingEvidence: [
        'Mechanism (diving into shallow water)',
        'Complete paralysis below C5 level',
        'Diaphragmatic breathing preserved',
        'Sensory level at clavicle',
        'CT shows fracture-dislocation C4-C5',
        'Absent bulbocavernosus reflex = spinal shock ongoing'
      ]
    },
    managementPathway: {
      immediate: [
        'ABC with strict spinal immobilization',
        'High-flow oxygen (respiratory compromise risk)',
        'IV access',
        'Supportive fluids for neurogenic shock',
        'Monitor respirations closely',
        'Rigid cervical collar',
        'Backboard with full spinal precautions',
        'Transport to spinal injury center'
      ],
      definitive: [
        'Cervical spine stabilization/fusion',
        'Decompression of cord',
        'ICU monitoring',
        'Possible ventilator support if respiratory failure',
        'Rehabilitation planning'
      ],
      monitoring: [
        'Continuous respiratory monitoring',
        'Vital signs',
        'Neurological level checks',
        'Monitor for neurogenic shock',
        'ICP monitoring if head injury also present'
      ]
    },
    studentChecklist: [
      {
        id: 't10-1',
        category: 'abcde',
        description: 'Identify neurological level of spinal cord injury',
        points: 25,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Determining level helps predict complications (respiratory, motor, sensory deficits).',
        commonErrors: ['Not checking motor levels', 'Not checking sensory levels', 'Missing key muscle functions'],
        details: ['C3-5 = diaphragmatic breathing', 'C5 = biceps present', 'C6 = wrist extension', 'C7 = triceps present']
      },
      {
        id: 't10-2',
        category: 'intervention',
        description: 'Recognize and treat neurogenic shock',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Neurogenic shock from loss of sympathetic tone causes hypotension and bradycardia. Treat differently from hypovolemic shock.',
        commonErrors: ['Over-resuscitating with fluids', 'Using vasopressors too early', 'Missing diagnosis'],
        details: ['Hypotension + bradycardia = neurogenic', 'Warm peripheries (distinguishes from hypovolemia)', 'Careful fluid bolus', 'Consider vasopressors']
      },
      {
        id: 't10-3',
        category: 'abcde',
        description: 'Assess respiratory risk in high cervical injuries',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'C3-C5 injuries affect diaphragm. Respiratory failure is main cause of death.',
        commonErrors: ['Not monitoring respirations', 'Missing diaphragmatic breathing pattern', 'Not prepared to intubate'],
        details: ['C3-5 = phrenic nerve intact', 'Diaphragmatic breathing = abdominal movement only', 'Have suction ready', 'Early intubation if fatigue develops']
      },
      {
        id: 't10-4',
        category: 'intervention',
        description: 'Maintain strict spinal immobilization',
        points: 15,
        yearLevel: ['2nd-year', '3rd-year', '4th-year', 'diploma'],
        complexity: ['basic', 'intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Any movement can worsen cord injury. Immobilization prevents secondary injury.',
        commonErrors: ['Removing collar for airway', 'Incomplete immobilization', 'Excessive movement'],
        details: ['Rigid collar', 'Head blocks', 'Tape body to board', 'Log roll only']
      }
    ],
    teachingPoints: [
      'Spinal shock = temporary loss of all function below injury (areflexia)',
      'Neurogenic shock = loss of sympathetic tone (hypotension + bradycardia)',
      'Neurogenic shock: WARM peripheries, hypotension, bradycardia',
      'Hypovolemic shock: COLD peripheries, hypotension, tachycardia',
      'Diaphragmatic breathing = C3-C5 intact (phrenic nerve)',
      'C5 level = biceps present, wrists absent (elbow flexors work)',
      'Priapism = pathologic sign of cord injury',
      'Absent bulbocavernosus reflex = spinal shock ongoing (may return)',
      'High cervical injuries (C1-C3) usually require ventilation',
      'Complete injuries have poor prognosis for motor recovery',
      'Time in spinal shock is window for potential recovery'
    ],
    commonPitfalls: [
      'Missing neurogenic shock (fluids won\'t fix bradycardia)',
      'Over-resuscitating neurogenic shock (warm peripheries!)',
      'Not monitoring respirations in high cervical injuries',
      'Removing collar unnecessarily',
      'Not determining neurological level accurately',
      'Confusing spinal shock with neurogenic shock',
      'Missing that priapism is PATHOLOGIC in trauma',
      'Forgetting respiratory compromise can develop gradually (fatigue)'
    ],
    references: [
      'ATLS 10th Edition - Spine Trauma',
      'American Spinal Injury Association Guidelines',
      'Life in the Fast Lane - Spinal Cord Injury'
    ]
  })
];

// ============================================================================
// CARDIAC ECG CASES
// ============================================================================

export const cardiacECGCases: CaseScenario[] = [
  // Inferior STEMI with Right Ventricular Involvement
  createCase({
    id: 'cardiac-ecg-001',
    title: 'Acute Inferior STEMI with Right Ventricular Infarction',
    category: 'cardiac-ecg',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Severe epigastric pain, vomiting, diaphoresis',
      timeOfDay: 'early-morning',
      location: 'Apartment in Bur Dubai',
      callerInfo: 'Wife',
      dispatchCode: 'Echo-1',
      additionalInfo: ['Patient feels like going to pass out', 'History of hypertension']
    },
    patientInfo: {
      age: 62,
      gender: 'male',
      weight: 88,
      occupation: 'Retired teacher',
      language: 'Arabic, English'
    },
    sceneInfo: {
      description: 'Apartment, patient sitting on sofa leaning forward',
      hazards: [],
      bystanders: 'Wife present, anxious',
      environment: 'Comfortable'
    },
    initialPresentation: {
      generalImpression: 'Elderly male, pale, diaphoretic, nauseated',
      position: 'Sitting, leaning forward',
      appearance: 'Pale, diaphoretic, looks unwell',
      consciousness: 'Alert but miserable'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent airway'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Mild tachypnea'],
        interventions: ['Oxygen if SpO2 <94%'],
        auscultation: ['Clear bilateral']
      },
      circulation: {
        pulseRate: 55,
        pulseQuality: 'Weak radially',
        bp: { systolic: 85, diastolic: 55 },
        capillaryRefill: 3,
        skin: 'Pale, cool, clammy',
        findings: [
          'Bradycardic',
          'Hypotensive',
          'Cool peripheries'
        ],
        interventions: [
          'IV access',
          'Avoid fluids initially unless hypotension worsens',
          '12-lead ECG immediately'
        ],
        ecgFindings: [
          'Sinus bradycardia 55 bpm',
          'ST elevation 2mm in II, III, aVF',
          'ST elevation GREATER in III than II',
          'Reciprocal ST depression in I and aVL',
          'ST depression in V1-V2 (posterior extension)',
          'RIGHT-SIDED ECG: ST elevation 1mm in V4R'
        ],
        ivAccess: ['18G left AC fossa']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Anxious', 'Nausea', 'Feeling of doom'],
        interventions: []
      },
      exposure: {
        findings: ['No rash', 'No edema'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['No JVD'], // May be absent because RV infarct causes preload dependence
      chest: ['Normal heart sounds', 'Clear lungs'],
      abdomen: ['Epigastric tenderness', 'Soft'],
      pelvis: ['Normal'],
      extremities: ['Cool peripheries', 'Delayed capillary refill'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Aspirin', dose: '75mg', frequency: 'Daily', indication: 'Cardioprotection' },
        { name: 'Amlodipine', dose: '10mg', frequency: 'Daily', indication: 'Hypertension' }
      ],
      allergies: ['None'],
      medicalConditions: ['Hypertension', 'Hyperlipidemia', 'Smoker (40 pack-years)'],
      surgicalHistory: [],
      lastMeal: 'Light dinner 4 hours ago',
      eventsLeading: 'Woke with severe epigastric pain radiating to back. Associated with nausea and vomiting. Took antacid with no relief.'
    },
    investigations: [
      {
        name: '12-lead ECG',
        indication: 'Chest/epigastric pain',
        findings: 'ST elevation 2mm in II, III, aVF (greater in III), reciprocal ST depression in I, aVL, ST depression V1-V2, ST elevation V4R 1mm',
        interpretation: 'Acute Inferior STEMI with Right Ventricular Infarction',
        urgency: 'immediate'
      }
    ],
    vitalSignsProgression: {
      initial: { bp: '85/55', pulse: 55, respiration: 20, spo2: 96, gcs: 15 },
      afterIntervention: { bp: '95/60', pulse: 65, respiration: 18, spo2: 98, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Epigastric pain radiating to back (atypical for MI)',
        'Bradycardia',
        'Hypotension',
        'Inferior STEMI on ECG (II, III, aVF ST elevation)',
        'ST elevation GREATER in III than II = RCA occlusion',
        'V4R ST elevation = Right Ventricular Infarction'
      ],
      redFlags: [
        'Right ventricular infarction - preload dependent!',
        'ST elevation greater in lead III than II indicates RCA occlusion',
        'Bradycardia and hypotension common with inferior MI',
        'DO NOT give nitrates or diuretics in RV infarction!',
        'V4R ST elevation confirms RV involvement'
      ],
      differentialDiagnoses: [
        'Inferior STEMI (RCA vs LCx)',
        'Acute pancreatitis',
        'Peptic ulcer disease',
        'Acute cholecystitis',
        'Aortic dissection'
      ],
      mostLikelyDiagnosis: 'Acute Inferior STEMI with Right Ventricular Infarction',
      supportingEvidence: [
        'Typical risk factors (age, smoker, hypertension)',
        'Inferior ST elevation',
        'ST elevation greater in III than II',
        'Bradycardia and AV block common with RCA occlusion',
        'V4R ST elevation confirms RV involvement',
        'Hypotension out of proportion to infarct size suggests RV infarction'
      ]
    },
    managementPathway: {
      immediate: [
        'Aspirin 300mg chewed',
        '12-lead ECG within 10 minutes',
        'IV access',
        'RIGHT-SIDED ECG (V4R) if inferior STEMI',
        'DO NOT give nitrates if RV infarction suspected!',
        'DO NOT give diuretics!',
        'Pre-alert cardiac center',
        'Consider cautious fluid bolus if hypotensive'
      ],
      definitive: [
        'Primary PCI preferred',
        'Thrombolysis if PCI not available within 120 minutes',
        'Avoid nitrates and diuretics',
        'Cautious fluid resuscitation may be needed',
        'Treat bradycardia/AV block if present'
      ],
      monitoring: [
        'Continuous ECG monitoring',
        'Frequent BP monitoring',
        'Monitor for heart block',
        'Monitor urine output'
      ],
      transportConsiderations: [
        'Pre-alert receiving hospital',
        'Notify cath lab team',
        'Consider escalating to STEMI alert'
      ]
    },
    studentChecklist: [
      {
        id: 'ce1-1',
        category: 'abcde',
        description: 'Obtain 12-lead ECG within 10 minutes of first contact',
        points: 20,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        timeframe: 'Within 10 minutes',
        rationale: 'Time is muscle. Early ECG is critical for reperfusion decision.',
        commonErrors: ['Delaying ECG for history', 'Not obtaining ECG early enough'],
      },
      {
        id: 'ce1-2',
        category: 'intervention',
        description: 'Give Aspirin 300mg chewed (not swallowed)',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        timeframe: 'Immediately',
        rationale: 'Aspirin reduces mortality in STEMI. Must be chewed for rapid absorption.',
        commonErrors: ['Using enteric-coated aspirin', 'Not chewing', 'Withholding for minor reasons'],
      },
      {
        id: 'ce1-3',
        category: 'intervention',
        description: 'Obtain right-sided ECG (V4R) for inferior STEMI',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: true,
        rationale: 'Right-sided ECG detects RV infarction which changes management completely (no nitrates!).',
        commonErrors: ['Not obtaining V4R', 'Not knowing how to obtain right-sided ECG'],
        details: [
          'Place V4 lead on right side of chest at same position as V4',
          'ST elevation >1mm in V4R confirms RV infarction',
          'Changes may be transient - obtain early!',
          'RV infarction = preload dependent, NO nitrates!'
        ],
      },
      {
        id: 'ce1-4',
        category: 'intervention',
        description: 'Recognize ST elevation greater in III than II (RCA occlusion)',
        points: 15,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        critical: false,
        rationale: 'ST elevation greater in III than II indicates RCA occlusion (vs LCx), associated with RV infarction and conduction abnormalities.',
        commonErrors: ['Not comparing III vs II', 'Not recognizing significance'],
        details: [
          'ST elevation greater in lead III than II = RCA',
          'RCA occlusion associated with RV infarction',
          'RCA associated with bradycardia and heart block',
          'LCx occlusion: ST elevation equal in II and III'
        ],
      },
      {
        id: 'ce1-5',
        category: 'intervention',
        description: 'AVOID nitrates in RV infarction',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Nitrates cause venodilation which can cause severe hypotension in preload-dependent RV infarction.',
        commonErrors: ['Giving nitrates routinely', 'Not recognizing RV infarction'],
        details: [
          'RV infarction = preload dependent',
          'Nitrates reduce preload -> severe hypotension',
          'Same for diuretics - AVOID!',
          'Cautious fluid bolus may be needed instead'
        ],
      },
      {
        id: 'ce1-6',
        category: 'intervention',
        description: 'Treat bradycardia/heart block in inferior STEMI',
        points: 10,
        yearLevel: ['4th-year'],
        complexity: ['advanced', 'expert'],
        rationale: 'Inferior STEMI (RCA) often associated with bradycardia and AV block. May need treatment.',
        commonErrors: ['Over-treating (mild bradycardia may be physiologic)', 'Not monitoring for progression'],
        details: [
          'Atropine for symptomatic bradycardia',
          'Be prepared for transcutaneous pacing',
          'AV block may progress',
          'Usually resolves with reperfusion'
        ],
      },
      {
        id: 'ce1-7',
        category: 'clinical-reasoning',
        description: 'Recognize epigastric pain as atypical MI presentation',
        points: 10,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        rationale: 'Inferior MI often presents with epigastric pain. Can be confused with GI conditions.',
        commonErrors: ['Dismissing as GI issue', 'Not considering MI with epigastric pain'],
        details: [
          'Inferior MI = epigastric pain common',
          'Radiation to back suggests inferior MI',
          'Vomiting common with inferior MI',
          'Always get ECG for atypical pain in risk factors'
        ]
      },
      {
        id: 'ce1-8',
        category: 'communication',
        description: 'Pre-alert cardiac cath lab for inferior STEMI with RV involvement',
        points: 15,
        yearLevel: ['3rd-year', '4th-year'],
        complexity: ['intermediate', 'advanced', 'expert'],
        critical: true,
        rationale: 'Pre-notification reduces door-to-balloon time. RV infarction requires special considerations.',
        commonErrors: ['Not pre-alerting', 'Not mentioning RV involvement'],
        details: [
          'Mention inferior STEMI',
          'Mention right ventricular involvement',
          'Note hemodynamic status',
          'Note contraindications (nitrates!)'
        ],
      }
    ],
    teachingPoints: [
      'Inferior MI often presents with epigastric pain - don\'t be fooled!',
      'ST elevation greater in lead III than II = RCA occlusion',
      'RCA occlusion = RV infarction risk + bradycardia/heart block',
      'ALWAYS obtain right-sided ECG (V4R) for inferior STEMI',
      'ST elevation in V4R confirms RV infarction',
      'RV infarction = PRELOAD DEPENDENT - NO nitrates, NO diuretics!',
      'Hypotension out of proportion to infarct size suggests RV infarction',
      'Treatment for RV infarction: cautious fluid bolus, avoid preload reducers',
      'Be prepared to treat bradycardia and AV block in inferior MI',
      'Inferior MI may be associated with posterior MI (look for ST depression V1-V3)',
      'ST depression in V1-V3 with inferior STEMI = posterior involvement',
      'Posterior MI requires posterior leads (V7-V9) for confirmation'
    ],
    commonPitfalls: [
      'Diagnosing gastritis/ulcer without getting ECG',
      'Giving nitrates to RV infarction (causes severe hypotension!)',
      'Not obtaining right-sided ECG for inferior STEMI',
      'Missing that ST elevation greater in III = RCA',
      'Under-treating bradycardia that becomes symptomatic',
      'Giving diuretics (furosemide) in RV infarction',
      'Not recognizing posterior MI (ST depression V1-V3)',
      'Dismissing epigastric pain as GI issue',
      'Not pre-alerting receiving hospital appropriately',
      'Forgetting that inferior MI can present with vomiting (not just nausea)'
    ],
    references: [
      'AHA/ACC STEMI Guidelines 2023',
      'ESC STEMI Guidelines 2023',
      'Life in the Fast Lane - Inferior STEMI',
      'Life in the Fast Lane - Right Ventricular Infarction'
    ]
  }),

  // Wellens Syndrome
  createCase({
    id: 'cardiac-ecg-002',
    title: 'Wellens Syndrome - Critical LAD Stenosis',
    category: 'cardiac-ecg',
    priority: 'high',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Chest pain, now pain-free but feeling unwell',
      timeOfDay: 'morning',
      location: 'Office in Business Bay, Dubai',
      callerInfo: 'Colleague',
      dispatchCode: 'Delta-1',
      additionalInfo: ['Pain lasted 20 minutes then resolved', 'Called for advice, evaluation needed']
    },
    patientInfo: {
      age: 48,
      gender: 'male',
      weight: 82,
      occupation: 'Accountant',
      language: 'English'
    },
    sceneInfo: {
      description: 'Office environment',
      hazards: [],
      bystanders: 'Several colleagues',
      environment: 'Comfortable'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, appears comfortable but anxious',
      position: 'Sitting',
      appearance: 'Well, no distress',
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
        spo2: 98,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 78,
        pulseQuality: 'Normal',
        bp: { systolic: 130, diastolic: 85 },
        capillaryRefill: 2,
        skin: 'Warm, dry',
        findings: ['Normal cardiovascular exam'],
        interventions: ['IV access', '12-lead ECG'],
        ecgFindings: [
          'Sinus rhythm 78 bpm',
          'Biphasic T waves in V2 and V3',
          'Preserved R wave progression',
          'Normal or minimally elevated ST segments',
          'No Q waves in anterior leads'
        ],
        ivAccess: ['18G left AC']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        findings: ['Anxious about the episode'],
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
      chest: ['Normal heart sounds', 'Clear lungs'],
      abdomen: ['Soft, non-tender'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: ['Hyperlipidemia', 'Smoker (20 pack-years)'],
      surgicalHistory: [],
      lastMeal: 'Breakfast 2 hours ago',
      eventsLeading: 'Had chest discomfort this morning, lasted about 20 minutes, resolved spontaneously. Pain was central, pressure-like, mild to moderate. Has had similar episodes over past week.'
    },
    investigations: [
      {
        name: '12-lead ECG',
        indication: 'History of chest pain',
        findings: 'Biphasic T waves in V2-V3, patient currently pain-free',
        interpretation: 'Wellens Syndrome - critical LAD stenosis, STEMI equivalent',
        urgency: 'urgent'
      }
    ],
    vitalSignsProgression: {
      initial: { bp: '130/85', pulse: 78, respiration: 16, spo2: 98, gcs: 15 },
      afterIntervention: { bp: '128/82', pulse: 75, respiration: 16, spo2: 98, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: [
        'Pain-free at time of assessment',
        'History of recurrent chest discomfort',
        'Biphasic T waves in V2-V3 (Wellens Type 1)',
        'Normal or minimally elevated ST segments',
        'Preserved R wave progression',
        'No Q waves in anterior leads'
      ],
      redFlags: [
        'Wellens Syndrome = STEMI EQUIVALENT!',
        'Critical LAD stenosis (>50% usually)',
        'High risk of extensive anterior MI',
        'DO NOT stress test these patients!',
        'May progress to massive anterior STEMI'
      ],
      differentialDiagnoses: [
        'Wellens Syndrome (critical LAD stenosis)',
        'Nonspecific T wave changes',
        'Myocarditis',
        'Normal variant (early repolarization)',
        'Previous anterior MI (but Q waves would be present)'
      ],
      mostLikelyDiagnosis: 'Wellens Syndrome - Critical LAD Stenosis',
      supportingEvidence: [
        'Biphasic T waves in V2-V3 (Type 1 pattern)',
        'Pain-free at time of ECG',
        'History of recurrent angina',
        'No Q waves (rules out old MI)',
        'Typical demographic (middle-aged, risk factors)'
      ]
    },
    managementPathway: {
      immediate: [
        'Recognize Wellens Syndrome',
        'DO NOT perform stress test!',
        'Urgent cardiology consultation',
        'Admit to hospital',
        'Aspirin and other cardiac medications',
        'Arrange urgent angiography'
      ],
      definitive: [
        'Urgent coronary angiography',
        'Revascularization (PCI or CABG)',
        'Long-term cardiac medical therapy'
      ],
      monitoring: [
        'Continuous cardiac monitoring',
        'Repeat ECG if pain recurs',
        'Serial troponin',
        'Monitor for deterioration'
      ],
      transportConsiderations: [
        'Transport to facility with cath lab',
        'Do NOT discharge',
        'Pre-alert cardiology'
      ]
    },
    studentChecklist: [
      {
        id: 'ce2-1',
        category: 'clinical-reasoning',
        description: 'Recognize biphasic T waves in V2-V3 (Wellens Type 1)',
        points: 30,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Wellens Type 1: deeply inverted or biphasic T waves in V2-V3. Indicates critical LAD stenosis.',
        commonErrors: ['Missing the pattern', 'Dismissing as nonspecific changes', 'Not knowing Wellens syndrome'],
        details: [
          'Type 1: Biphasic T waves in V2-V3',
          'Type 2: Deeply inverted T waves in V2-V3',
          'Usually occurs in pain-free state',
          'Patient typically had recent chest pain'
        ],
      },
      {
        id: 'ce2-2',
        category: 'intervention',
        description: 'DO NOT order stress test for Wellens pattern',
        points: 30,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Stress testing can precipitate massive anterior MI and death in Wellens patients.',
        commonErrors: ['Ordering stress test', 'Discharging patient', 'Not recognizing urgency'],
        details: [
          'Wellens = critical LAD stenosis',
          'Stress test = potentially fatal!',
          'Urgent angiography required',
          'This is a STEMI equivalent'
        ],
      },
      {
        id: 'ce2-3',
        category: 'clinical-reasoning',
        description: 'Recognize Wellens as STEMI equivalent',
        points: 25,
        yearLevel: ['4th-year'],
        complexity: ['expert'],
        critical: true,
        rationale: 'Wellens patients have high risk of anterior MI. Require same urgency as STEMI.',
        commonErrors: ['Treating as low risk', 'Delayed workup', 'Outpatient management'],
        details: [
          'Critical LAD stenosis >50%',
          'High risk of extensive anterior MI',
          'Requires urgent angiography',
          'Same urgency as STEMI'
        ]
      }
    ],
    teachingPoints: [
      'Wellens Syndrome = critical LAD stenosis',
      'Wellens Type 1: Biphasic T waves in V2-V3',
      'Wellens Type 2: Deeply inverted T waves in V2-V3',
      'ECG typically abnormal when PATIENT IS PAIN FREE',
      'This is a STEMI EQUIVALENT!',
      'DO NOT stress test - can be fatal!',
      'Requires urgent angiography',
      'Named after Dr. Hein Wellens who described pattern in 1982',
      '75% of untreated Wellens patients develop extensive anterior MI within weeks',
      'Pattern represents reversible ischemia, not infarction (hence no Q waves)',
      'Always ask about recent episodes of chest pain',
      'Biphasic = going up then down (or vice versa)',
      'Deeply inverted = inverted >2mm'
    ],
    commonPitfalls: [
      'Dismissing as nonspecific T wave changes',
      'Ordering exercise stress test (can be fatal!)',
      'Discharging patient home',
      'Not recognizing the pattern',
      'Treating as low-risk chest pain',
      'Not asking about recent chest pain episodes',
      'Missing Wellens Type 2 (deeply inverted, not biphasic)',
      'Not knowing this is a STEMI equivalent',
      'Delaying urgent cardiology consultation'
    ],
    references: [
      'Life in the Fast Lane - Wellens Syndrome',
      'AHA Chest Pain Guidelines',
      'Wellens JE, et al. Chest 1982'
    ]
  })
];

// Export all enhanced cases
export const enhancedCaseDatabase: CaseScenario[] = [
  ...moreTraumaCases,
  ...cardiacECGCases
];

// Get cases by subcategory
export const getCasesBySubcategory = (subcategory: string): CaseScenario[] => {
  return enhancedCaseDatabase.filter(c =>
    c.title.toLowerCase().includes(subcategory.toLowerCase()) ||
    c.id.includes(subcategory)
  );
};

// Get critical care cases
export const getCriticalCareCases = (): CaseScenario[] => {
  return enhancedCaseDatabase.filter(c =>
    c.priority === 'critical' ||
    c.category === 'thoracic' ||
    c.category === 'critical-care'
  );
};

// Get ECG cases
export const getECGCases = (): CaseScenario[] => {
  return enhancedCaseDatabase.filter(c => c.category === 'cardiac-ecg');
};

// Get guideline-referenced cases
export const getGuidelineCases = (guideline: string): CaseScenario[] => {
  return enhancedCaseDatabase.filter(c =>
    c.references?.some(r => r.includes(guideline))
  );
};
