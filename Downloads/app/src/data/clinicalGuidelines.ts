/**
 * Clinical Guidelines Reference System
 *
 * This module provides comprehensive clinical guidelines references for
 * pre-hospital and emergency care. All guidelines are sourced from:
 * - ATLS (Advanced Trauma Life Support)
 * - ACLS (Advanced Cardiovascular Life Support)
 * - ERC (European Resuscitation Council)
 * - ILCOR (International Liaison Committee on Resuscitation)
 * - Resuscitation Council UK
 * - AHA (American Heart Association)
 */

export interface GuidelineReference {
  id: string;
  source: 'ATLS' | 'ACLS' | 'ERC' | 'ILCOR' | 'RCUK' | 'AHA' | 'JRCALC' | 'ALS';
  title: string;
  year: number;
  url?: string;
  keyPoints: string[];
}

export interface GuidelineChecklistItem {
  guidelineId: string;
  requirement: string;
  timeframe?: string;
  criticalAction: boolean;
  rationale: string;
  commonErrors: string[];
  evidenceLevel: 'A' | 'B' | 'C' | 'Expert Opinion';
}

export interface AssessmentGuideline {
  category: 'ABCDE' | 'Cardiac' | 'Respiratory' | 'Trauma' | 'Neurological' | 'Pediatric' | 'Metabolic';
  title: string;
  description: string;
  keyAssessments: string[];
  redFlags: string[];
  mandatoryActions: string[];
  guidelines: GuidelineReference[];
  checklistItems: GuidelineChecklistItem[];
}

// ============================================================================
// ABCDE ASSESSMENT GUIDELINES (ATLS 10th Edition)
// ============================================================================

export const abcdeGuideline: AssessmentGuideline = {
  category: 'ABCDE',
  title: 'ABCDE Systematic Approach',
  description: 'The ABCDE approach is a systematic method for assessing and treating critically ill or injured patients.',
  keyAssessments: [
    'Airway with cervical spine protection',
    'Breathing and ventilation',
    'Circulation with hemorrhage control',
    'Disability (neurological status)',
    'Exposure/Environmental control'
  ],
  redFlags: [
    'Complete airway obstruction',
    'Tension pneumothorax',
    'Cardiac tamponade',
    'Massive hemorrhage',
    'GCS < 9',
    'SpO2 < 90% on oxygen'
  ],
  mandatoryActions: [
    'Treat life-threatening conditions before moving to next step',
    'Reassess after each intervention',
    'Document all findings and interventions'
  ],
  guidelines: [
    {
      id: 'atls-abcd',
      source: 'ATLS',
      title: 'Primary Survey (ABCDE)',
      year: 2024,
      keyPoints: [
        'Primary survey should take < 5 minutes',
        'Treat threats to life as discovered',
        'Airway is ALWAYS first priority',
        'Cervical spine protection in trauma patients',
        'Reassess after each intervention'
      ]
    }
  ],
  checklistItems: [
    {
      guidelineId: 'atls-abcd',
      requirement: 'Assess airway patency - look, listen, feel',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Hypoxia kills within minutes. Airway obstruction is rapidly fatal.',
      commonErrors: ['Moving to breathing before securing airway', 'Missing partial obstruction'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-abcd',
      requirement: 'Stabilize cervical spine in trauma patients',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Spinal cord injury can be caused or worsened by improper handling',
      commonErrors: ['Forgetting C-spine immobilization', 'Improper collar size'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-abcd',
      requirement: 'Assess breathing - rate, depth, symmetry, sounds',
      timeframe: 'After airway secured',
      criticalAction: true,
      rationale: 'Breathing assessment identifies immediate threats like pneumothorax',
      commonErrors: ['Missing decreased air entry on one side', 'Not assessing for tracheal deviation'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-abcd',
      requirement: 'Check circulation - pulse, BP, capillary refill, skin signs',
      timeframe: 'After breathing',
      criticalAction: true,
      rationale: 'Shock recognition is critical. Hypotension is late sign in trauma.',
      commonErrors: ['Relying on BP alone to assess perfusion', 'Missing tachycardia as early sign'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-abcd',
      requirement: 'Assess disability - AVPU/GCS, pupils, blood glucose',
      timeframe: 'After circulation',
      criticalAction: false,
      rationale: 'Neurological assessment establishes baseline and identifies head injury',
      commonErrors: ['Not checking blood glucose', 'Incorrect GCS calculation'],
      evidenceLevel: 'B'
    },
    {
      guidelineId: 'atls-abcd',
      requirement: 'Full exposure while maintaining temperature',
      timeframe: 'After disability',
      criticalAction: true,
      rationale: 'Hidden injuries can be missed without full exposure',
      commonErrors: ['Not maintaining patient temperature', 'Inadequate log roll'],
      evidenceLevel: 'B'
    }
  ]
};

// ============================================================================
// CARDIAC GUIDELINES (ACLS 2020)
// ============================================================================

export const acuteCoronarySyndromeGuideline: AssessmentGuideline = {
  category: 'Cardiac',
  title: 'Acute Coronary Syndromes (ACS)',
  description: 'Management of suspected acute myocardial infarction and unstable angina',
  keyAssessments: [
    'Chest pain characterization - OPQRST',
    '12-lead ECG within 10 minutes',
    'Hemodynamic assessment',
    'Risk stratification'
  ],
  redFlags: [
    'ST elevation ≥1mm in 2 contiguous leads',
    'New LBBB',
    'Chest pain with hemodynamic instability',
    'Ventricular arrhythmias',
    'Cardiogenic shock'
  ],
  mandatoryActions: [
    'Aspirin 300mg chewed immediately',
    'Nitroglycerin if BP permits',
    '12-lead ECG within 10 min',
    'Activate cath lab if STEMI confirmed',
    'Pre-alert receiving hospital'
  ],
  guidelines: [
    {
      id: 'aha-acs-2023',
      source: 'AHA',
      title: '2023 Guideline for the Management of STEMI',
      year: 2023,
      url: 'https://www.heart.org/en/professional/guidelines',
      keyPoints: [
        'Door-to-balloon time ≤90 minutes',
        'Door-to-needle time ≤30 minutes if fibrinolysis',
        'Aspirin 162-325 mg chewed immediately',
        'High-intensity statin therapy early',
        'Dual antiplatelet therapy (DAPT) for PCI'
      ]
    },
    {
      id: 'rcuk-acs-2022',
      source: 'RCUK',
      title: 'Acute Coronary Syndromes Guidelines',
      year: 2022,
      keyPoints: [
        'MONA - Morphine, Oxygen, Nitrates, Aspirin',
        'ECG within 10 minutes of first contact',
        'Pre-hospital thrombolysis if PCI delay >120 minutes'
      ]
    }
  ],
  checklistItems: [
    {
      guidelineId: 'aha-acs-2023',
      requirement: 'Obtain 12-lead ECG within 10 minutes of patient contact',
      timeframe: 'Within 10 minutes',
      criticalAction: true,
      rationale: 'Time is muscle. Early ECG is critical for reperfusion decision.',
      commonErrors: ['Delaying ECG for history', 'Not comparing to previous ECG'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'aha-acs-2023',
      requirement: 'Administer aspirin 162-325 mg (chewed, not swallowed)',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Aspirin reduces mortality by 20-25% in ACS',
      commonErrors: ['Giving enteric-coated aspirin', 'Not chewing', 'Withholding for minor allergies'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'aha-acs-2023',
      requirement: 'Nitroglycerin 0.4mg SL q5min x3 if SBP ≥90',
      timeframe: 'After aspirin',
      criticalAction: false,
      rationale: 'Nitrates reduce preload and myocardial oxygen demand. Contraindicated in RV infarct.',
      commonErrors: ['Giving nitrates when SBP <90', 'Giving in right ventricular infarct', 'Overuse in inferior MI'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'rcuk-acs-2022',
      requirement: 'Pre-alert cardiac cath lab for confirmed STEMI',
      timeframe: 'Immediately after STEMI confirmed',
      criticalAction: true,
      rationale: 'Pre-notification reduces door-to-balloon time',
      commonErrors: ['Waiting until arrival to alert', 'Not activating for STEMI equivalents'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'aha-acs-2023',
      requirement: 'Assess for contraindications to nitrates',
      timeframe: 'Before administering nitrates',
      criticalAction: true,
      rationale: 'Nitrates can cause severe hypotension in RV infarct or aortic stenosis',
      commonErrors: ['Not checking for RV infarct (inferior leads)', 'Not asking about phosphodiesterase inhibitors'],
      evidenceLevel: 'B'
    },
    {
      guidelineId: 'aha-acs-2023',
      requirement: 'Perform detailed pain assessment using OPQRST',
      timeframe: 'During initial assessment',
      criticalAction: false,
      rationale: 'Detailed pain characterization helps differentiate ACS from other causes',
      commonErrors: ['Not documenting quality', 'Missing radiation patterns', 'Not asking about associated symptoms'],
      evidenceLevel: 'B'
    },
    {
      guidelineId: 'rcuk-acs-2022',
      requirement: 'Oxygen only if SpO2 <90% or respiratory distress',
      timeframe: 'Initial assessment',
      criticalAction: false,
      rationale: 'Oxygen may cause vasoconstriction and worse outcomes in normoxic patients',
      commonErrors: ['Routine oxygen for all chest pain', 'Over-oxygenation'],
      evidenceLevel: 'A'
    }
  ]
};

export const cardiacArrestGuideline: AssessmentGuideline = {
  category: 'Cardiac',
  title: 'Cardiac Arrest (ACLS)',
  description: 'Management of cardiac arrest with standardized algorithms',
  keyAssessments: [
    'Unresponsiveness assessment',
    'Pulse check (max 10 seconds)',
    'Rhythm identification',
    'Shockable vs non-shockable determination'
  ],
  redFlags: [
    'No pulse or breathing',
    'Shockable rhythm (VF/VT)',
    'PEA with specific QRS complexes',
    'Asystole'
  ],
  mandatoryActions: [
    'Immediate high-quality CPR',
    'Defibrillation for shockable rhythms',
    'Airway management',
    'IV/IO access',
    'Epinephrine 1mg q3-5min'
  ],
  guidelines: [
    {
      id: 'aha-als-2020',
      source: 'AHA',
      title: '2020 ACLS Guidelines',
      year: 2020,
      keyPoints: [
        'Chest compressions at 100-120/min',
        'Depth 2-2.4 inches (5-6cm)',
        'Allow full chest recoil',
        'Minimize interruptions (<10 sec)',
        'Defibrillate within 2 minutes of rhythm recognition'
      ]
    },
    {
      id: 'erc-als-2021',
      source: 'ERC',
      title: 'European Resuscitation Guidelines 2021',
      year: 2021,
      keyPoints: [
        'Chest compression fraction ≥60%',
        'Waveform capnography for intubated patients',
        'Amiodarone 300mg for refractory VF/VT',
        'Consider reversible causes (4Hs and 4Ts)'
      ]
    }
  ],
  checklistItems: [
    {
      guidelineId: 'aha-als-2020',
      requirement: 'Start chest compressions within 10 seconds of arrest recognition',
      timeframe: 'Within 10 seconds',
      criticalAction: true,
      rationale: 'Each minute of delay reduces survival by 7-10%',
      commonErrors: ['Checking breathing too long', 'Checking pulse too long', 'Delaying for equipment'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'aha-als-2020',
      requirement: 'Perform high-quality CPR: 100-120/min, 2-2.4in depth',
      timeframe: 'Continuous',
      criticalAction: true,
      rationale: 'High-quality CPR is the strongest predictor of survival',
      commonErrors: ['Too slow or too fast', 'Too shallow', 'Leaning', 'Incomplete recoil'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'aha-als-2020',
      requirement: 'Minimize chest compression interruptions (<10 seconds)',
      timeframe: 'Throughout CPR',
      criticalAction: true,
      rationale: 'Coronary perfusion drops dramatically during pauses',
      commonErrors: ['Long rhythm checks', 'Long pulse checks', 'Prolonged defibrillator charging'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'aha-als-2020',
      requirement: 'Defibrillate shockable rhythms immediately',
      timeframe: 'As soon as defibrillator available',
      criticalAction: true,
      rationale: 'Defibrillation is the only effective treatment for VF/VT',
      commonErrors: ['Stopping compressions too early before shock', 'Delaying for intubation'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'erc-als-2021',
      requirement: 'Consider reversible causes (Hs and Ts)',
      timeframe: 'During CPR',
      criticalAction: true,
      rationale: 'Treating underlying cause is essential for ROSC',
      commonErrors: ['Not considering hypoxia', 'Missing hypovolemia', 'Forgetting toxins (hyperkalemia)'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'aha-als-2020',
      requirement: 'Administer epinephrine 1mg IV/IO q3-5min',
      timeframe: 'After first shock/2 minutes CPR',
      criticalAction: true,
      rationale: 'Epinephrine increases coronary and cerebral perfusion pressure',
      commonErrors: ['Wrong dose', 'Wrong timing', 'Not pushing flush after'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'aha-als-2020',
      requirement: 'Use capnography for airway confirmation and CPR quality',
      timeframe: 'After advanced airway placed',
      criticalAction: false,
      rationale: 'ETCO2 ≥10 mmHg indicates adequate CPR. Sudden rise indicates ROSC.',
      commonErrors: ['Not monitoring waveform', 'Ignoring low ETCO2', 'Missing ROSC indicator'],
      evidenceLevel: 'A'
    }
  ]
};

export const cardiacTamponadeGuideline: AssessmentGuideline = {
  category: 'Cardiac',
  title: 'Cardiac Tamponade',
  description: 'Life-threatening accumulation of fluid in pericardial space',
  keyAssessments: [
    'Beck\'s triad assessment',
    'Pulsus paradoxus assessment',
    'JVD assessment',
    'Heart sounds assessment',
    'ECG findings (electrical alternans)'
  ],
  redFlags: [
    'Beck\'s triad: hypotension, JVD, muffled heart sounds',
    'Pulsus paradoxus >10mmHg',
    'Electrical alternans on ECG',
    'Cardiac arrest with PEA',
    'Associated with penetrating chest trauma'
  ],
  mandatoryActions: [
    'Rapid fluid bolus',
    'Consider pericardiocentesis',
    'Prepare for emergency thoracotomy',
    'Immediate transport'
  ],
  guidelines: [
    {
      id: 'atls-tamponade',
      source: 'ATLS',
      title: 'Cardiac Tamponade Management',
      year: 2024,
      keyPoints: [
        'Clinical diagnosis - do NOT delay for imaging',
        'Beck\'s triad: hypotension, JVD, muffled heart sounds',
        'Pulsus paradoxus: BP drop >10mmHg on inspiration',
        'Fluid resuscitation while preparing for drainage',
        'Emergency department thoracotomy if arrest imminent'
      ]
    }
  ],
  checklistItems: [
    {
      guidelineId: 'atls-tamponade',
      requirement: 'Assess for Beck\'s triad (hypotension, JVD, muffled heart sounds)',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Classic triad confirms diagnosis. Remember: all three may not be present.',
      commonErrors: ['Not listening for heart sounds', 'Missing JVD', 'Relying on only one sign'],
      evidenceLevel: 'B'
    },
    {
      guidelineId: 'atls-tamponade',
      requirement: 'Assess for pulsus paradoxus (>10mmHg drop on inspiration)',
      timeframe: 'During circulation assessment',
      criticalAction: true,
      rationale: 'Pulsus paradoxus is highly specific for cardiac tamponade',
      commonErrors: ['Not checking blood pressure variation', 'Not measuring both phases'],
      evidenceLevel: 'B'
    },
    {
      guidelineId: 'atls-tamponade',
      requirement: 'Rapid IV/IO access and aggressive fluid resuscitation',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Fluids increase preload to compensate for reduced cardiac output',
      commonErrors: ['Under-resuscitating', 'Using crystalloids only (consider blood)'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-tamponade',
      requirement: 'Consider needle pericardiocentesis if patient deteriorating',
      timeframe: 'If signs of cardiac tamponade and deteriorating',
      criticalAction: true,
      rationale: 'Life-saving procedure when transport is delayed or patient crashing',
      commonErrors: ['Incorrect needle placement', 'Not using ECG/needle guidance', 'Delaying too long'],
      evidenceLevel: 'Expert Opinion'
    },
    {
      guidelineId: 'atls-tamponade',
      requirement: 'Look for electrical alternans on ECG',
      timeframe: 'During ECG interpretation',
      criticalAction: false,
      rationale: 'Electrical alternans is highly suggestive but not always present',
      commonErrors: ['Not recognizing the pattern', 'Confusing with artifact'],
      evidenceLevel: 'B'
    },
    {
      guidelineId: 'atls-tamponade',
      requirement: 'Assess for associated injuries ( penetrating trauma)',
      timeframe: 'During secondary survey',
      criticalAction: false,
      rationale: 'Penetrating trauma near heart has high risk of cardiac injury',
      commonErrors: ['Missing entry wounds', 'Not considering pericardial tamponade in stab wounds'],
      evidenceLevel: 'A'
    }
  ]
};

// ============================================================================
// RESPIRATORY GUIDELINES
// ============================================================================

export const tensionPneumothoraxGuideline: AssessmentGuideline = {
  category: 'Respiratory',
  title: 'Tension Pneumothorax',
  description: 'Life-threatening condition requiring immediate decompression',
  keyAssessments: [
    'Unilateral decreased breath sounds',
    'Tracheal deviation',
    'Hyperresonance to percussion',
    'JVD assessment',
    'Hemodynamic compromise'
  ],
  redFlags: [
    'Absent breath sounds on one side',
    'Tracheal deviation AWAY from affected side',
    'Cardiac arrest with PEA',
    'Severe respiratory distress with hypotension',
    'Distended neck veins'
  ],
  mandatoryActions: [
    'Immediate needle decompression (2nd ICS, midclavicular)',
    'Follow with chest tube',
    'High-flow oxygen',
    'Consider bilateral if trauma'
  ],
  guidelines: [
    {
      id: 'atls-pneumo',
      source: 'ATLS',
      title: 'Tension Pneumothorax Management',
      year: 2024,
      keyPoints: [
        'Clinical diagnosis - treat immediately, DO NOT wait for X-ray',
        'Decompress at 2nd intercostal space, midclavicular line',
        'Use 14-16 gauge needle, 5cm catheter minimum',
        'Listen for rush of air',
        'Chest tube required after needle decompression'
      ]
    },
    {
      id: 'jrcalc-pneumo',
      source: 'JRCALC',
      title: 'Pre-hospital Pneumothorax Management',
      year: 2019,
      keyPoints: [
        'Needle decompression for suspected tension pneumothorax',
        'Use 3rd-5th intercostal space, anterior axillary line as alternative',
        'Consider finger thoracostomy if trained'
      ]
    }
  ],
  checklistItems: [
    {
      guidelineId: 'atls-pneumo',
      requirement: 'Recognize tension pneumothorax - clinical diagnosis',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Tension pneumothorax kills within minutes. DO NOT wait for X-ray.',
      commonErrors: ['Delaying for confirmation', 'Missing diagnosis in noisy environment', 'Confusing with simple pneumothorax'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-pneumo',
      requirement: 'Assess for tracheal deviation (late sign)',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Tracheal deviation indicates severe tension. Remember: deviation AWAY from affected side.',
      commonErrors: ['Not checking midline', 'Confusing direction of deviation'],
      evidenceLevel: 'B'
    },
    {
      guidelineId: 'atls-pneumo',
      requirement: 'Perform needle decompression (2nd ICS, midclavicular)',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Life-saving procedure. Use large bore needle (14-16G) at least 5cm long.',
      commonErrors: ['Wrong location (too medial)', 'Needle too short', 'Not advancing far enough'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-pneumo',
      requirement: 'Listen for rush of air after decompression',
      timeframe: 'During procedure',
      criticalAction: true,
      rationale: 'Audible rush confirms successful decompression',
      commonErrors: ['Not listening', 'Confusing with breath sounds', 'Missing successful decompression'],
      evidenceLevel: 'B'
    },
    {
      guidelineId: 'atls-pneumo',
      requirement: 'Consider bilateral needle decompression in trauma',
      timeframe: 'If patient unstable with chest trauma',
      criticalAction: true,
      rationale: 'Bilateral tension pneumothorax can occur, especially with positive pressure ventilation',
      commonErrors: ['Only decompressing one side', 'Not considering in ventilated patients'],
      evidenceLevel: 'Expert Opinion'
    },
    {
      guidelineId: 'jrcalc-pneumo',
      requirement: 'Alternative site: 4th-5th ICS, anterior axillary line',
      timeframe: 'If anterior site unsuccessful',
      criticalAction: false,
      rationale: 'Alternative site may be successful if anterior site fails',
      commonErrors: ['Not knowing alternative site', 'Too lateral placement'],
      evidenceLevel: 'B'
    }
  ]
};

export const hemothoraxGuideline: AssessmentGuideline = {
  category: 'Respiratory',
  title: 'Massive Hemothorax',
  description: 'Accumulation of blood in pleural space, >1500mL or 1/3 blood volume',
  keyAssessments: [
    'Unilateral decreased breath sounds',
    'Dullness to percussion',
    'Hemodynamic assessment',
    'Signs of shock',
    'Chest wall assessment for wounds'
  ],
  redFlags: [
    '>1500mL blood on chest tube placement',
    '>200mL/hour for 2-4 hours',
    'Hypotension with absent breath sounds',
    'Dullness to percussion on affected side',
    'Penetrating trauma to thorax'
  ],
  mandatoryActions: [
    'Large bore chest tube (36-40F)',
    'Aggressive fluid resuscitation',
    'Blood product administration',
    'Prepare for thoracotomy if >1500mL initial output'
  ],
  guidelines: [
    {
      id: 'atls-hemothorax',
      source: 'ATLS',
      title: 'Hemothorax Management',
      year: 2024,
      keyPoints: [
        'Massive hemothorax: >1500mL or 1/3 patient blood volume',
        'Initial output >1500mL requires thoracotomy',
        'Continued bleeding >200mL/hour for 2-4 hours requires thoracotomy',
        'Autotransfusion should be considered',
        'Place chest tube at 4th-5th ICS, midaxillary line'
      ]
    }
  ],
  checklistItems: [
    {
      guidelineId: 'atls-hemothorax',
      requirement: 'Assess for dullness to percussion (unilateral)',
      timeframe: 'Initial assessment',
      criticalAction: true,
      rationale: 'Dullness indicates fluid in pleural space',
      commonErrors: ['Not percussing chest', 'Missing unilateral finding'],
      evidenceLevel: 'B'
    },
    {
      guidelineId: 'atls-hemothorax',
      requirement: 'Place large bore chest tube (36-40F)',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Small tubes clot and fail to evacuate blood',
      commonErrors: ['Using small tube', 'Incorrect placement', 'Not securing properly'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-hemothorax',
      requirement: 'Measure initial output and ongoing drainage',
      timeframe: 'After chest tube placement',
      criticalAction: true,
      rationale: 'Initial output >1500mL or ongoing >200mL/hour indicates need for thoracotomy',
      commonErrors: ['Not measuring output', 'Delayed recognition of ongoing bleed'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-hemothorax',
      requirement: 'Aggressive fluid and blood resuscitation',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Hemothorax represents significant blood loss',
      commonErrors: ['Under-resuscitating', 'Using crystalloids only', 'Not activating massive transfusion'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-hemothorax',
      requirement: 'Consider autotransfusion if available',
      timeframe: 'After chest tube placement',
      criticalAction: false,
      rationale: 'Autotransfusion reduces need for allogeneic blood',
      commonErrors: ['Not considering autotransfusion', 'Improper setup'],
      evidenceLevel: 'B'
    }
  ]
};

export const severeAsthmaGuideline: AssessmentGuideline = {
  category: 'Respiratory',
  title: 'Life-Threatening Asthma',
  description: 'Management of severe asthma exacerbations',
  keyAssessments: [
    'Respiratory rate and effort',
    'Accessory muscle use',
    'Auscultation for wheeze (or silent chest)',
    'Peak expiratory flow rate',
    'Oxygen saturation',
    'Pulsus paradoxus assessment'
  ],
  redFlags: [
    'Silent chest (no air movement)',
    'SpO2 <92%',
    'PEF <33% best/predicted',
    'Exhaustion, confusion',
    'Cyanosis',
    'Life-threatening features present'
  ],
  mandatoryActions: [
    'High-flow oxygen (15L/min)',
    'Salbutamol 5mg via oxygen-driven nebulizer',
    'Ipratropium bromide 0.5mg via nebulizer',
    'IV magnesium sulfate 2g',
    'Consider IV salbutamol'
  ],
  guidelines: [
    {
      id: 'british-thoracic-asthma',
      source: 'RCUK',
      title: 'British Thoracic Society Asthma Guidelines',
      year: 2022,
      keyPoints: [
        'Near-fatal asthma: PaCO2 normal or high',
        'Silent chest is ominous sign',
        'Magnesium sulfate for severe attacks',
        'Early intubation before exhaustion',
        'Consider invasive ventilation'
      ]
    }
  ],
  checklistItems: [
    {
      guidelineId: 'british-thoracic-asthma',
      requirement: 'Assess for "silent chest" - life-threatening sign',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Silent chest indicates severe airflow limitation - patient may arrest soon',
      commonErrors: ['Missing silent chest', 'Thinking no wheeze means improving'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'british-thoracic-asthma',
      requirement: 'Administer oxygen to maintain SpO2 94-98%',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Hypoxia kills. Use high-flow oxygen in severe asthma.',
      commonErrors: ['Under-oxygenation (fear of CO2 retention)', 'Not using reservoir mask'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'british-thoracic-asthma',
      requirement: 'Salbutamol 5mg + Ipratropium 0.5mg nebulized',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Combination therapy superior to salbutamol alone',
      commonErrors: ['Using salbutamol alone', 'Not using oxygen-driven nebulizer'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'british-thoracic-asthma',
      requirement: 'IV Magnesium sulfate 2g over 20 minutes',
      timeframe: 'For life-threatening asthma',
      criticalAction: true,
      rationale: 'Magnesium is bronchodilator, reduces admissions',
      commonErrors: ['Not giving magnesium', 'Wrong dose', 'Too slow administration'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'british-thoracic-asthma',
      requirement: 'Check ABG if SpO2 <92% or life-threatening features',
      timeframe: 'Initial assessment',
      criticalAction: true,
      rationale: 'Normal or high PaCO2 in asthma indicates respiratory muscle fatigue',
      commonErrors: ['Not checking ABG', 'Misinterpreting normal PaCO2 as reassuring'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'british-thoracic-asthma',
      requirement: 'Assess for pulsus paradoxus (>10mmHg)',
      timeframe: 'During circulation assessment',
      criticalAction: false,
      rationale: 'Pulsus paradoxus indicates severe air trapping',
      commonErrors: ['Not measuring', 'Incorrect technique'],
      evidenceLevel: 'B'
    }
  ]
};

// ============================================================================
// TRAUMA GUIDELINES (ATLS)
// ============================================================================

export const massiveHemorrhageGuideline: AssessmentGuideline = {
  category: 'Trauma',
  title: 'Massive Hemorrhage Control',
  description: 'Catastrophic hemorrhage management - C-ABC approach',
  keyAssessments: [
    'Rapid scan for external bleeding',
    'Assess for signs of shock',
    'Identify source of bleeding',
    'Assess for internal bleeding (chest, abdomen, pelvis, long bones)'
  ],
  redFlags: [
    'Exsanguinating external hemorrhage',
    'Unstable pelvic fracture',
    'Distended abdomen in trauma',
    'Chest tube output >1500mL',
    'Hemodynamic instability'
  ],
  mandatoryActions: [
    'Direct pressure or tourniquet for limb bleeding',
    'Pelvic binder for unstable pelvis',
    'Aggressive fluid resuscitation',
    'Blood product administration (1:1:1)',
    'Consider tranexamic acid'
  ],
  guidelines: [
    {
      id: 'atls-hemorrhage',
      source: 'ATLS',
      title: 'Massive Hemorrhage Control',
      year: 2024,
      keyPoints: [
        'C-ABC approach: Catastrophic hemorrhage first',
        'Tourniquet time <2 hours if possible',
        'Windlass tourniquets preferred',
        'Pelvic binder for suspected pelvic fracture',
        'TXA within 3 hours of injury'
      ]
    },
    {
      id: 'crash-2',
      source: 'RCUK',
      title: 'CRASH-2 Trial Recommendations',
      year: 2019,
      keyPoints: [
        'Tranexamic acid 1g over 10min, then 1g over 8hr',
        'Give within 3 hours of injury',
        'Reduces mortality with no increase in thrombotic events'
      ]
    }
  ],
  checklistItems: [
    {
      guidelineId: 'atls-hemorrhage',
      requirement: 'Apply tourniquet for life-threatening limb hemorrhage',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Tourniquet is life-saving for extremity bleeding. Apply high and tight.',
      commonErrors: ['Not tight enough', 'Wrong location', 'Removing prematurely'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-hemorrhage',
      requirement: 'Apply pelvic binder for suspected pelvic fracture',
      timeframe: 'Before log roll',
      criticalAction: true,
      rationale: 'Pelvic binder reduces pelvic volume and controls bleeding',
      commonErrors: ['Not applying before moving patient', 'Improper placement'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-hemorrhage',
      requirement: 'Consider hemostatic agents and direct pressure',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Hemostatic agents + direct pressure can control non-tourniquet-able bleeding',
      commonErrors: ['Relying solely on pressure', 'Not packing wounds adequately'],
      evidenceLevel: 'B'
    },
    {
      guidelineId: 'crash-2',
      requirement: 'Administer tranexamic acid within 3 hours',
      timeframe: 'Within 3 hours of injury',
      criticalAction: false,
      rationale: 'TXA reduces mortality in trauma patients if given within 3 hours',
      commonErrors: ['Giving after 3 hours (may cause harm)', 'Wrong dose'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-hemorrhage',
      requirement: 'Assess for concealed hemorrhage (chest, abdomen, pelvis, long bones)',
      timeframe: 'During primary and secondary survey',
      criticalAction: true,
      rationale: 'Concealed hemorrhage can be more deadly than visible bleeding',
      commonErrors: ['Missing abdominal bleeding', 'Not considering femur fracture blood loss'],
      evidenceLevel: 'A'
    }
  ]
};

export const flailChestGuideline: AssessmentGuideline = {
  category: 'Trauma',
  title: 'Flail Chest',
  description: 'Segment of chest wall that moves paradoxically',
  keyAssessments: [
    'Assess for paradoxical chest wall movement',
    'Count fractured ribs (≥3 ribs in ≥2 places)',
    'Assess underlying pulmonary contusion',
    'Evaluate for pneumothorax'
  ],
  redFlags: [
    'Paradoxical chest movement',
    'Severe respiratory distress',
    'Hypoxia not responding to oxygen',
    'Associated pulmonary contusion',
    'Underlying pneumothorax'
  ],
  mandatoryActions: [
    'Pain control (consider nerve blocks)',
    'High-flow oxygen',
    'Positive pressure ventilation if respiratory failure',
    'Treat underlying injuries (pneumothorax, hemothorax)',
    'Consider surgical fixation'
  ],
  guidelines: [
    {
      id: 'atls-flail',
      source: 'ATLS',
      title: 'Flail Chest Management',
      year: 2024,
      keyPoints: [
        'Flail segment: ≥3 ribs fractured in ≥2 places',
        'Pulmonary contusion is main cause of mortality',
        'Pain control is essential',
        'Mechanical ventilation for respiratory failure',
        'Surgical fixation for severe deformity or failure to wean'
      ]
    }
  ],
  checklistItems: [
    {
      guidelineId: 'atls-flail',
      requirement: 'Identify flail segment (paradoxical movement)',
      timeframe: 'Initial assessment',
      criticalAction: true,
      rationale: 'Flail chest indicates severe trauma and underlying lung injury',
      commonErrors: ['Missing the diagnosis', 'Confusing with simple rib fractures'],
      evidenceLevel: 'B'
    },
    {
      guidelineId: 'atls-flail',
      requirement: 'Assess for underlying pneumothorax/hemothorax',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Flail chest frequently associated with intrathoracic injury',
      commonErrors: ['Focusing only on flail segment', 'Missing tension pneumothorax'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-flail',
      requirement: 'Provide aggressive pain management',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Pain prevents adequate ventilation, leading to atelectasis and hypoxia',
      commonErrors: ['Under-treating pain', 'Fear of respiratory depression'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'atls-flail',
      requirement: 'Consider need for mechanical ventilation',
      timeframe: 'Ongoing assessment',
      criticalAction: true,
      rationale: 'Respiratory failure may develop from underlying pulmonary contusion',
      commonErrors: ['Intubating too early', 'Delaying intubation too long'],
      evidenceLevel: 'B'
    }
  ]
};

// ============================================================================
// NEUROLOGICAL GUIDELINES
// ============================================================================

export const strokeGuideline: AssessmentGuideline = {
  category: 'Neurological',
  title: 'Acute Stroke',
  description: 'Rapid assessment and management of suspected stroke',
  keyAssessments: [
    'FAST assessment (Face, Arms, Speech, Time)',
    'Blood glucose check',
    'Onset time determination (last known normal)',
    'NIHSS or similar scoring',
    'Assess for stroke mimics'
  ],
  redFlags: [
    'Sudden onset neurological deficit',
    'Time from onset <4.5 hours (thrombolysis window)',
    'Decreased level of consciousness',
    'Seizure at onset',
    'Head trauma (rule out intracranial bleed)'
  ],
  mandatoryActions: [
    'Check blood glucose immediately',
    'Determine time of onset',
    'Pre-alert stroke team if within window',
    'Transport to stroke center',
    'Avoid hypotension and hypertension extremes'
  ],
  guidelines: [
    {
      id: 'aha-stroke-2023',
      source: 'AHA',
      title: '2023 Guidelines for Early Management of Acute Ischemic Stroke',
      year: 2023,
      keyPoints: [
        'Door-to-needle time ≤60 minutes',
        'Thrombolysis window 4.5 hours',
        'Endovascular therapy window up to 24 hours for selected patients',
        'BP <185/110 before thrombolysis',
        'Check glucose - hypoglycemia mimics stroke'
      ]
    }
  ],
  checklistItems: [
    {
      guidelineId: 'aha-stroke-2023',
      requirement: 'Perform FAST assessment',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'FAST identifies major stroke signs quickly',
      commonErrors: ['Not doing full assessment', 'Missing subtle findings'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'aha-stroke-2023',
      requirement: 'Check blood glucose immediately',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Hypoglycemia is the most common stroke mimic',
      commonErrors: ['Skipping glucose check', 'Not treating low glucose'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'aha-stroke-2023',
      requirement: 'Determine exact time of onset (last known normal)',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Treatment decisions depend on time from onset',
      commonErrors: ['Not documenting time', 'Confounding wake-up stroke time'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'aha-stroke-2023',
      requirement: 'Pre-alert stroke team for eligible patients',
      timeframe: 'During transport',
      criticalAction: true,
      rationale: 'Pre-notification reduces door-to-needle time',
      commonErrors: ['Not activating team early', 'Incomplete information'],
      evidenceLevel: 'A'
    }
  ]
};

// ============================================================================
// METABOLIC GUIDELINES
// ============================================================================

export const dkaGuideline: AssessmentGuideline = {
  category: 'Metabolic',
  title: 'Diabetic Ketoacidosis (DKA)',
  description: 'Management of DKA in adults',
  keyAssessments: [
    'Blood glucose check',
    'Ketone assessment (blood or urine)',
    'ABG for pH and bicarbonate',
    'Electrolytes (especially potassium)',
    'Assess for precipitating causes'
  ],
  redFlags: [
    'pH <7.0',
    'Bicarbonate <5',
    'GCS decreased',
    'K+ <3.3 or >5.5 (affects insulin administration)',
    'Severe dehydration'
  ],
  mandatoryActions: [
    'IV fluids (NS initially)',
    'Fixed-rate insulin infusion',
    'Correct potassium BEFORE insulin',
    'Identify and treat precipitating cause',
    'Monitor glucose hourly'
  ],
  guidelines: [
    {
      id: 'british-dka',
      source: 'RCUK',
      title: 'British Society for Paediatric Endocrinology DKA Guidelines',
      year: 2022,
      keyPoints: [
        'Fluid resuscitation: 10mL/kg NS over 1 hour',
        'Fixed rate insulin infusion: 0.1 units/kg/hour',
        'Check K+ before starting insulin',
        'Target glucose drop 3-5 mmol/L/hour',
        'Add dextrose when glucose <15 mmol/L'
      ]
    }
  ],
  checklistItems: [
    {
      guidelineId: 'british-dka',
      requirement: 'Check potassium before starting insulin',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Insulin causes hypokalemia. Can cause arrhythmias if K+ low.',
      commonErrors: ['Starting insulin before checking K+', 'Not monitoring K+ closely'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'british-dka',
      requirement: 'Aggressive fluid resuscitation',
      timeframe: 'Immediately',
      criticalAction: true,
      rationale: 'Patients are 4-6L volume depleted',
      commonErrors: ['Under-resuscitating', 'Using wrong fluid initially'],
      evidenceLevel: 'A'
    },
    {
      guidelineId: 'british-dka',
      requirement: 'Identify precipitating cause',
      timeframe: 'During history and assessment',
      criticalAction: true,
      rationale: 'DKA doesn\'t happen without cause. Infection, MI, missed insulin are common.',
      commonErrors: ['Not looking for cause', 'Missing MI as precipitant'],
      evidenceLevel: 'B'
    }
  ]
};

// ============================================================================
// EXPORT ALL GUIDELINES
// ============================================================================

export const clinicalGuidelines: Record<string, AssessmentGuideline> = {
  abcde: abcdeGuideline,
  acuteCoronarySyndrome: acuteCoronarySyndromeGuideline,
  cardiacArrest: cardiacArrestGuideline,
  cardiacTamponade: cardiacTamponadeGuideline,
  tensionPneumothorax: tensionPneumothoraxGuideline,
  hemothorax: hemothoraxGuideline,
  severeAsthma: severeAsthmaGuideline,
  massiveHemorrhage: massiveHemorrhageGuideline,
  flailChest: flailChestGuideline,
  stroke: strokeGuideline,
  dka: dkaGuideline
};

export const getGuidelineById = (id: string): AssessmentGuideline | undefined => {
  return clinicalGuidelines[id];
};

export const getGuidelinesByCategory = (category: string): AssessmentGuideline[] => {
  return Object.values(clinicalGuidelines).filter(g =>
    g.category.toLowerCase().includes(category.toLowerCase())
  );
};

export const getAllGuidelineSources = (): string[] => {
  const sources = new Set<string>();
  Object.values(clinicalGuidelines).forEach(g => {
    g.guidelines.forEach(gl => sources.add(gl.source));
  });
  return Array.from(sources).sort();
};

// H's and T's - Reversible causes of cardiac arrest
export const hsAndTs = {
  hypovolemia: {
    description: 'Hypovolemia - Blood or fluid loss',
    causes: ['Hemorrhage', 'Severe dehydration', 'Burns', 'Trauma'],
    assessment: ['Jugular venous pressure flat', 'Cool extremities', 'Weak pulse'],
    treatment: ['Rapid fluid bolus', 'Blood products', 'Control bleeding']
  },
  hypoxia: {
    description: 'Hypoxia - Inadequate oxygenation',
    causes: ['Airway obstruction', 'Pulmonary edema', 'Pneumothorax', 'COPD', 'Pulmonary embolism'],
    assessment: ['Low SpO2', 'Cyanosis', 'Respiratory distress'],
    treatment: ['Airway management', 'Oxygen', 'Treat underlying cause']
  },
  hydrogen_ions: {
    description: 'Hydrogen ion (acidosis)',
    causes: ['DKA', 'Renal failure', 'Shock', 'Aspirin overdose'],
    assessment: ['Low pH on ABG', 'Kussmaul breathing'],
    treatment: ['Treat underlying cause', 'Sodium bicarbonate (consider)']
  },
  hyperkalemia: {
    description: 'Hyperkalemia - High potassium',
    causes: ['Renal failure', 'DKA', 'Medications', 'Tissue breakdown'],
    assessment: ['ECG changes (peaked T waves, widened QRS)', 'History'],
    treatment: ['Calcium gluconate/chloride', 'Insulin + dextrose', 'Salbutamol']
  },
  hypothermia: {
    description: 'Hypothermia - Low body temperature',
    causes: ['Cold exposure', 'Drowning', 'Sepsis'],
    assessment: ['Core temp <35°C', 'Cold skin', 'JVD may be present'],
    treatment: ['Active rewarming', 'Warm IV fluids', 'Consider longer resuscitation']
  },
  toxins: {
    description: 'Toxins/Poisoning/Overdose',
    causes: ['Opioids', 'Tricyclics', 'Beta blockers', 'Calcium channel blockers', 'Carbon monoxide'],
    assessment: ['Pupils', 'Respiratory pattern', 'Smell', 'History'],
    treatment: ['Antidotes if available', 'Supportive care', 'Specific treatments']
  },
  tamponade: {
    description: 'Cardiac Tamponade',
    causes: ['Trauma', 'MI', 'Pericarditis', 'Procedure complication'],
    assessment: ['Beck\'s triad', 'Pulsus paradoxus', 'Narrow pulse pressure'],
    treatment: ['Fluid bolus', 'Pericardiocentesis', 'Thoracotomy']
  },
  tension_pneumothorax: {
    description: 'Tension Pneumothorax',
    causes: ['Trauma', 'Barotrauma', 'Spontaneous'],
    assessment: ['Unilateral decreased breath sounds', 'Tracheal deviation', 'JVD'],
    treatment: ['Needle decompression', 'Chest tube']
  },
  thrombosis: {
    description: 'Thrombosis - PE, MI, Stroke',
    causes: ['DVT', 'Atherosclerosis', 'Atrial fibrillation'],
    assessment: ['Clinical signs', 'ECG', 'CXR', 'History'],
    treatment: ['Thrombolysis', 'PCI', 'Anticoagulation (depends on type)']
  },
  trauma: {
    description: 'Trauma',
    causes: ['MVAs', 'Falls', 'Penetrating injuries'],
    assessment: ['Mechanism of injury', 'Visible injuries', 'Hidden injuries'],
    treatment: ['Control hemorrhage', 'Treat tension pneumothorax', 'Fluid resuscitation']
  }
};
