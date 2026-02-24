/**
 * LITFL ECG Library - Enhanced with Image Display Integration
 *
 * This module provides comprehensive ECG data with display capabilities
 * for cardiac emergency simulations. Includes direct links to LITFL ECG library images.
 *
 * Reference: https://litfl.com/ecg-library/
 * Life in the Fast Lane (LITFL) - Emergency Medicine Education
 */

export interface ECGDisplay {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  urgency: 'critical' | 'urgent' | 'routine';
  litflUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  description: string;
  interpretation: ECGInterpretation;
  clinicalContext: string;
  management: string[];
  teachingPoints: string[];
}

export interface ECGInterpretation {
  rhythm: string;
  rate: number;
  pWave: string;
  prInterval: string;
  qrsDuration: string;
  qtInterval: string;
  stSegment: string;
  tWave: string;
  other?: string[];
  keyFeatures: string[];
  differentialDiagnosis?: string[];
}

// ============================================================================
// CRITICAL CARDIAC EMERGENCY ECGS (Display Priority)
// ============================================================================

export const criticalCardiacECGs: ECGDisplay[] = [
  // ANTERIOR STEMI
  {
    id: 'ecg-stemi-anterior',
    title: 'Acute Anterior STEMI',
    category: 'STEMI',
    subcategory: 'Anterior',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/anterior-stemi-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Extensive-Anterior-STEMI-acute.jpg',
    description: 'ST elevation V1-V4 with reciprocal ST depression in inferior leads',
    interpretation: {
      rhythm: 'Sinus rhythm',
      rate: 85,
      pWave: 'Normal',
      prInterval: '160ms (normal)',
      qrsDuration: '80ms (normal initially)',
      qtInterval: '420ms (normal)',
      stSegment: 'Convex ST elevation 2-4mm in V1-V4, reciprocal depression II, III, aVF',
      tWave: 'Hyperacute T waves in V1-V4 (broad, peaked)',
      keyFeatures: [
        '"Tombstone" ST segments (convex upward)',
        'ST elevation maximal in V2-V3',
        'Reciprocal ST depression in inferior leads',
        'Q waves may appear in V2-V3',
        'LAD occlusion'
      ],
      differentialDiagnosis: ['Early repolarization', 'Pericarditis', 'LV aneurysm', 'Benign T wave changes']
    },
    clinicalContext: '45-year-old male with crushing central chest pain radiating to left arm and jaw. Diaphoretic. BP 90/60, HR 110.',
    management: [
      'Aspirin 300mg chewed immediately',
      'High-flow oxygen if SpO2 <90%',
      'Nitrates if SBP ≥90 (NOT in RV infarct)',
      '12-lead ECG within 10 minutes',
      'Activate cath lab for primary PCI',
      'Pre-alert receiving hospital'
    ],
    teachingPoints: [
      'Time is muscle - every minute counts',
      'Tombstone ST segments indicate severe transmural ischemia',
      'Door-to-balloon time target: ≤90 minutes',
      'Look for ST elevation in V1 to confirm anterior involvement',
      'Reciprocal changes confirm ischemia (not pericarditis)',
      'Consider Wellens syndrome in V2-V3 if pain-free with abnormal T waves'
    ]
  },

  // INFERIOR STEMI WITH RV INFARCTION
  {
    id: 'ecg-stemi-inferior-rv',
    title: 'Acute Inferior STEMI with Right Ventricular Infarction',
    category: 'STEMI',
    subcategory: 'Inferior',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/inferior-stemi-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Inferior-AMI-STEMI.jpg',
    description: 'ST elevation II, III, aVF with ST elevation GREATER in III than II, plus right-sided ECG changes',
    interpretation: {
      rhythm: 'Sinus rhythm with bradycardia',
      rate: 55,
      pWave: 'Normal',
      prInterval: '180ms',
      qrsDuration: '90ms',
      qtInterval: '400ms',
      stSegment: 'ST elevation 2mm in II, III, aVF (greater in III), reciprocal in I, aVL, ST depression V1-V2 (posterior extension)',
      tWave: 'Inverted in II, III, aVF',
      keyFeatures: [
        'ST elevation greater in lead III than lead II = RCA occlusion',
        'ST depression V1-V2 suggests posterior extension',
        'Bradycardia common with RCA occlusion',
        'May develop AV block',
        'Right-sided ECG (V4R) shows ST elevation'
      ],
      differentialDiagnosis: ['Pericarditis', 'Early repolarization', 'LAD occlusion with inferior extension']
    },
    clinicalContext: '62-year-old male with severe epigastric pain, nausea, vomiting. BP 85/55, HR 55. On warfarin for AF.',
    management: [
      'Aspirin 300mg chewed',
      '12-lead ECG within 10 minutes',
      'RIGHT-SIDED ECG (V4R) for all inferior STEMI',
      'CRITICAL: NO nitrates if RV infarction present!',
      'CRITICAL: NO diuretics!',
      'Cautious fluid bolus if hypotensive',
      'Treat bradycardia/AV block if present',
      'Pre-alert cath lab'
    ],
    teachingPoints: [
      'ST elevation greater in III than II indicates RCA occlusion',
      'LCx occlusion shows ST elevation equal in II and III',
      'V4R ST elevation ≥1mm confirms RV infarction',
      'RV infarction = preload dependent - avoid reducing preload!',
      'Nitrates can cause severe hypotension in RV infarct',
      'Inferior MI often presents with epigastric pain',
      'Associated with bradycardia and AV block (RCA supplies AV node)'
    ]
  },

  // WELLENS SYNDROME
  {
    id: 'ecg-wellens-syndrome',
    title: 'Wellens Syndrome - Critical LAD Stenosis',
    category: 'STEMI-Equivalent',
    subcategory: 'LAD Stenosis',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/wellens-syndrome-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/Wellens-Pattern-A-Type-1-T-wave-2.jpg',
    description: 'Biphasic or deeply inverted T waves in V2-V3 in pain-free patient - STEMI equivalent!',
    interpretation: {
      rhythm: 'Sinus rhythm',
      rate: 78,
      pWave: 'Normal',
      prInterval: '160ms',
      qrsDuration: '80ms',
      qtInterval: '380ms',
      stSegment: 'Normal or minimally elevated (≤1mm)',
      tWave: 'Type 1: Biphasic in V2-V3, Type 2: Deeply inverted in V2-V3',
      keyFeatures: [
        'Patient typically PAIN-FREE when ECG obtained',
        'Preserved R wave progression (no Q waves)',
        'Biphasic T waves (up then down) in V2-V3',
        'No significant ST elevation',
        'History of recent chest pain episodes'
      ],
      differentialDiagnosis: ['Nonspecific T wave changes', 'Myocarditis', 'Normal variant', 'Persistent juvenile T waves']
    },
    clinicalContext: '48-year-old male with episodes of chest discomfort over past week. Now pain-free. ECG shows abnormal T waves in V2-V3.',
    management: [
      'RECOGNIZE as STEMI equivalent!',
      'DO NOT perform stress test - can be fatal!',
      'Urgent cardiology consultation',
      'Admit to hospital for observation',
      'Aspirin and cardiac medications',
      'Urgent coronary angiography',
      'Same urgency as STEMI for PCI'
    ],
    teachingPoints: [
      'Wellens Type 1: Biphasic T waves (up-down or down-up)',
      'Wellens Type 2: Deeply inverted T waves',
      'Signifies critical proximal LAD stenosis (>50%)',
      '75% develop extensive anterior MI if not revascularized',
      'Named after Dr. Hein Wellens (1982)',
      'ECG changes typically appear when patient is PAIN FREE',
      'This is why you always get ECG even if pain has resolved!'
    ]
  },

  // CARDIAC ARREST RHYTHMS
  {
    id: 'ecg-vt-ventricular-tachycardia',
    title: 'Monomorphic Ventricular Tachycardia',
    category: 'Arrhythmia',
    subcategory: 'VT',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/ventricular-tachycardia-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Ventricualr-tachycardia-Monomorphic-VT.jpg',
    description: 'Wide complex tachycardia at 180 bpm with AV dissociation',
    interpretation: {
      rhythm: 'Monomorphic VT',
      rate: 180,
      pWave: 'Not visible / dissociated',
      prInterval: 'Not applicable (AV dissociation)',
      qrsDuration: '160ms (wide >120ms)',
      qtInterval: 'Not measurable',
      stSegment: 'Cannot assess (in QRS)',
      tWave: 'Opposite direction to QRS (discordant)',
      keyFeatures: [
        'Wide QRS >140ms',
        'AV dissociation (P waves marching through QRS)',
        'Capture beat (normal QRS in VT)',
        'Fusion beat (combined sinus and ventricular activation)',
        'Extreme axis deviation',
        'Positive QRS concordance in V1'
      ],
      differentialDiagnosis: ['SVT with aberrancy', 'Antidromic AVRT (WPW)', 'Electrolyte abnormality']
    },
    clinicalContext: '65-year-old male with ICD, history of MI and LV dysfunction. Light-headedness, near-syncope. Multiple similar episodes.',
    management: [
      'Assume VT until proven otherwise (safest approach)',
      'Check for hemodynamic stability',
      'If unstable: immediate synchronized cardioversion',
      'If stable: Amiodarone 150mg IV over 10min',
      'Consider expert consultation',
      'Treat reversible causes (4Hs and 4Ts)'
    ],
    teachingPoints: [
      'Treat as VT until proven otherwise',
      'AV dissociation is pathognomonic for VT',
      'Capture beats confirm VT',
      'Concordance in V1 (positive) suggests VT',
      'Brugada and Vereckei algorithms can help differentiate',
      'Structural heart disease increases likelihood of VT'
    ]
  },

  {
    id: 'ecg-torsades',
    title: 'Torsades de Pointes',
    category: 'Arrhythmia',
    subcategory: 'Polymorphic VT',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/torsades-de-pointes-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-strip-Torsades-de-pointes-TDP.jpg',
    description: 'Polymorphic VT with twisting QRS axis associated with prolonged QT',
    interpretation: {
      rhythm: 'Polymorphic VT',
      rate: 250,
      pWave: 'Not visible',
      prInterval: 'Not applicable',
      qrsDuration: 'Variable, wide',
      qtInterval: 'Prolonged in sinus rhythm (>500ms)',
      stSegment: 'Cannot assess',
      tWave: 'Cannot assess',
      keyFeatures: [
        'Twisting QRS amplitude around baseline',
        'Initiated by short-long-short sequence',
        'Pause-dependent initiation',
        'Long QT interval in sinus beats',
        'Associated with QT prolongation'
      ],
      differentialDiagnosis: ['Polymorphic VT without long QT', 'VF', 'Artifact']
    },
    clinicalContext: '72-year-old female on multiple QT-prolonging medications. Found unresponsive. Family reports weakness and dizziness recently. K+ 6.8 mEq/L.',
    management: [
      'Immediate magnesium sulfate 2g IV over 10-15 minutes',
      'Correct potassium and magnesium',
      'Discontinue QT-prolonging drugs',
      'Consider overdrive pacing or isoproterenol',
      'Avoid QT-prolonging antiarrhythmics (amiodarone, sotalol)',
      'Treat underlying cause'
    ],
    teachingPoints: [
      'Torsades = "twisting of the points"',
      'Always check and correct electrolytes first',
      'Magnesium sulfate is first-line treatment',
      'Avoid amiodarol (can prolong QT further!)',
      'Initiated by early PVC (R-on-T phenomenon)',
      'Pause-dependent - more likely with bradycardia',
      'Consider congenital vs acquired long QT'
    ]
  },

  // COMPLETE HEART BLOCK
  {
    id: 'ecg-3rd-degree-block',
    title: 'Third Degree (Complete) Heart Block',
    category: 'Conduction',
    subcategory: 'AV Block',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/heart-block-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Complete-heart-block-CHB.jpg',
    description: 'Complete AV dissociation with narrow escape rhythm 40 bpm',
    interpretation: {
      rhythm: 'Complete AV dissociation',
      rate: 40,
      pWave: 'Present, not associated with QRS',
      prInterval: 'Variable (no relationship)',
      qrsDuration: '80ms (narrow) = junctional escape',
      qtInterval: '440ms',
      stSegment: 'Normal',
      tWave: 'Normal',
      keyFeatures: [
        'More P waves than QRS complexes',
        'PP intervals regular',
        'RR intervals regular',
        'No relationship between P waves and QRS',
        'Narrow QRS = junctional escape (higher escape)',
        'Wide QRS = ventricular escape (lower, unstable)'
      ],
      differentialDiagnosis: ['Second degree AV block (Mobitz I or II)', 'Ventricular rhythm', 'AV dissociation from other causes']
    },
    clinicalContext: '78-year-old male with syncope. Dizzy for several days. History of hypertension. No chest pain.',
    management: [
      'Assess hemodynamic stability',
      'Check for reversible causes (especially medications)',
      'Atropine may work for junctional escape (not for ventricular)',
      'Transcutaneous pacing if unstable',
      'Isoproterenol infusion for junctional escape',
      'Prepare for permanent pacemaker',
      'Consider inferior MI as cause'
    ],
    teachingPoints: [
      'Complete heart block = no conduction from atria to ventricles',
      'Narrow QRS = junctional escape (higher, more reliable)',
      'Wide QRS = ventricular escape (lower, unstable)',
      'May need temporary or permanent pacemaker',
      'Common causes: ischemia (RCA), degenerative, drugs',
      'Pacing usually indicated for symptomatic patients'
    ]
  },

  // HYPERKALEMIA
  {
    id: 'ecg-hyperkalemia',
    title: 'Severe Hyperkalemia',
    category: 'Metabolic',
    subcategory: 'Electrolyte',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/hyperkalemia-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Hyperkalaemia-peaked-T-waves-serum-potassium-7.0.jpg',
    description: 'Peaked T waves, widened QRS, sine wave pattern - medical emergency!',
    interpretation: {
      rhythm: 'Sinus rhythm',
      rate: 95,
      pWave: 'Amplitude may be decreased',
      prInterval: 'Prolonged (>200ms)',
      qrsDuration: '160ms (widened)',
      qtInterval: 'Prolonged but difficult to measure',
      stSegment: 'Cannot assess (widened QRS)',
      tWave: 'Peaked, tall, symmetric in multiple leads',
      keyFeatures: [
        'Progressive changes as K+ increases:',
        'Mild: Peaked T waves only',
        'Moderate: Prolonged PR, widened QRS, decreased P wave amplitude',
        'Severe: Sine wave pattern (pre-terminal)',
        'Loss of P waves',
        'Wide QRS complex'
      ],
      differentialDiagnosis: ['Acute MI (peaked T waves can mimic)', 'Left bundle branch block', 'Hypercalcemia (short QT)']
    },
    clinicalContext: '65-year-old male with renal failure. Missed dialysis for 3 days. Feeling weak and nauseated. K+ returns 7.8 mEq/L.',
    management: [
      ' calcium gluconate or chloride 1-3g IV (stabilize cardiac membrane)',
      'Insulin 10 units + dextrose 25g IV (shift K+ into cells)',
      'Salbutamol 5mg nebulized (enhance K+ uptake)',
      'Sodium bicarbonate 150mEq if acidosis present',
      'Emergency dialysis for refractory cases',
      'Discontinue potassium-raising medications'
    ],
    teachingPoints: [
      'ECG changes correlate with K+ level (but not perfectly)',
      'Sine wave = pre-terminal - treat immediately!',
      'Treat based on ECG findings, don\'t wait for lab',
      'Calcium gluconate does NOT lower K+, only stabilizes membrane',
      'Remember underlying renal failure',
      'Watch for recurrence after temporary measures'
    ]
  },

  // BRUGADA SYNDROME
  {
    id: 'ecg-brugada-type1',
    title: 'Brugada Syndrome Type 1',
    category: 'Inherited Channelopathy',
    subcategory: 'Sudden Death Risk',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/brugada-syndrome-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Brugada-Syndrome-Type-1-2.jpg',
    description: 'Coved ST elevation ≥2mm in V1-V3 followed by negative T waves - sudden death risk!',
    interpretation: {
      rhythm: 'Sinus rhythm',
      rate: 68,
      pWave: 'Normal',
      prInterval: '180ms',
      qrsDuration: '110ms (borderline prolonged)',
      qtInterval: '380ms',
      stSegment: 'Coved ST elevation ≥2mm in V1-V3',
      tWave: 'Inverted in V1-V3 following ST elevation',
      keyFeatures: [
        'Type 1: Coved ST elevation (diagnostic)',
        'Type 2: Saddleback ST elevation (not diagnostic)',
        'Type 3: Brugada-like pattern (not diagnostic)',
        'Pseudo RBBB pattern in V1-V2',
        'ST elevation in right precordial leads',
        'Can be concealed or intermittently present'
      ],
      differentialDiagnosis: ['Anterior STEMI', 'Pericarditis', 'Early repolarization', 'RBBB']
    },
    clinicalContext: '38-year-old male with family history of sudden cardiac death. Brother died at 40 during sleep. Had syncopal episode recently.',
    management: [
      'Recognize the pattern',
      'Immediate cardiology consultation',
      'ICD implantation for high-risk patients',
      'Avoid QT-prolonging drugs',
      'Treat fever aggressively (fever triggers arrhythmias)',
      'Avoid drugs that sodium channel block',
      'Family screening of relatives',
      'Patient education on recognizing symptoms'
    ],
    teachingPoints: [
      'Brugada syndrome = channelopathy causing sudden death',
      'Type 1 pattern is diagnostic (coved ST elevation)',
      'High risk of VF and sudden death, especially during sleep',
      'Fever can precipitate arrhythmias - treat aggressively',
      'Only treatment: ICD for high-risk patients',
      'Consider diagnosis in young patients with unexplained syncope',
      'V1-V3 positioned high makes pattern more apparent',
      'Most common in Southeast Asia and young males'
    ]
  }
];

// ============================================================================
// ESSENTIAL CARDIAC ECGS (High Yield)
// ============================================================================

export const essentialCardiacECGs: ECGDisplay[] = [
  // ATRIAL FIBRILLATION
  {
    id: 'ecg-af-rvr',
    title: 'Atrial Fibrillation with Rapid Ventricular Response',
    category: 'Arrhythmia',
    subcategory: 'AF',
    urgency: 'urgent',
    litflUrl: 'https://litfl.com/atrial-fibrillation-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Atrial-Fibrillation-3.jpg',
    description: 'Irregularly irregular rhythm with no P waves and rate 150',
    interpretation: {
      rhythm: 'Irregularly irregular (no P waves)',
      rate: 150,
      pWave: 'Absent (fibrillation waves)',
      prInterval: 'Cannot determine',
      qrsDuration: '80ms (narrow)',
      qtInterval: '360ms',
      stSegment: 'Non-specific changes',
      tWave: 'Normal',
      keyFeatures: [
        '"Irregularly irregular" - classic description',
        'No P waves (may see fibrillation waves)',
        'Narrow QRS complexes',
        'RVR defined as >100 bpm',
        'May see tachycardia-related ST depression'
      ]
    },
    clinicalContext: '68-year-old female with palpitations, shortness of breath. History of hypertension, diabetes. On warfarin.',
    management: [
      'Assess hemodynamic stability first',
      'Rate control if stable (beta blockers, diltiazem)',
      'Rhythm control if unstable or <48 hours duration',
      'Anticoagulation assessment (CHA2DS2-VASc score)',
      'Consider underlying causes (thyrotoxicosis, electrolytes)',
      'Controlled rate <110 bpm',
      'Treat precipitating factors'
    ],
    teachingPoints: [
      '"Irregularly irregular" is classic AF description',
      'No P waves - atria not contracting effectively',
      'RVR = rapid ventricular response (>100 bpm)',
      'Stroke risk is major concern - assess CHA2DS2-VASc',
      'Rate vs rhythm control depends on duration and symptoms',
      'Always assess for thrombus before cardioverting if >48h'
    ]
  },

  // ATRIAL FLUTTER
  {
    id: 'ecg-atrial-flutter',
    title: 'Typical Atrial Flutter with 2:1 Block',
    category: 'Arrhythmia',
    subcategory: 'Flutter',
    urgency: 'urgent',
    litflUrl: 'https://litfl.com/atrial-flutter-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Atrial-Flutter-with-2-1-Block-1-.jpg',
    description: 'Sawtooth flutter waves at 300 bpm with ventricular rate 150 bpm',
    interpretation: {
      rhythm: 'Atrial flutter with variable block',
      rate: 150,
      pWave: 'Sawtooth flutter waves',
      prInterval: 'Cannot determine',
      qrsDuration: '80ms (narrow)',
      qtInterval: '400ms',
      stSegment: 'Normal',
      tWave: 'Normal',
      keyFeatures: [
        'Sawtooth flutter waves best seen in II, III, aVF',
        'Atrial rate typically 300 bpm',
        'Ventricular rate depends on AV block (2:1, 3:1, 4:1, variable)',
        'Can be mistaken for SVT or sinus tachycardia',
        'Regular ventricular rhythm with variable block'
      ]
    },
    clinicalContext: '55-year-old male with palpitations. No chest pain. Mild shortness of breath.',
    management: [
      'Assess hemodynamic stability',
      'Rate control (beta blockers, calcium channel blockers)',
      'Rhythm control (cardioversion, consider anticoagulation first)',
      'High thromboembolism risk - treat as AF for anticoagulation',
      'Cavotricuspid isthmus ablation is curative',
      'Look for underlying causes'
    ],
    teachingPoints: [
      'Classic "sawtooth" flutter waves in II, III, aVF',
      'Atrial rate typically 300 bpm',
      'Ventricular rate = atrial rate divided by block (2:1 = 150 bpm)',
      'Look for flutter waves hidden in QRS or ST segment',
      'Similar stroke risk to AF - anticoagulate accordingly',
      'Ablation is curative in >90% of typical flutter cases'
    ]
  },

  // SVT (AVNRT)
  {
    id: 'ecg-avnrt',
    title: 'AV Nodal Reentrant Tachycardia (SVT)',
    category: 'Arrhythmia',
    subcategory: 'SVT',
    urgency: 'urgent',
    litflUrl: 'https://litfl.com/svt-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/Fast-Slow-AVNRT.jpg',
    description: 'Narrow complex tachycardia at 185 bpm with pseudo R\' in V1',
    interpretation: {
      rhythm: 'Narrow complex tachycardia',
      rate: 185,
      pWave: 'Retrograde P waves hidden in QRS',
      prInterval: 'Not visible',
      qrsDuration: '80ms (narrow)',
      qtInterval: '320ms',
      stSegment: 'Non-specific ST depression from rate',
      tWave: 'Difficult to assess',
      keyFeatures: [
        'Narrow QRS <120ms at rate >120 bpm',
        'Retrograde P waves often hidden in QRS',
        'Pseudo R\' wave in V1 (positive deflection in QRS)',
        'Pseudo S wave in inferior leads',
        'Regular tachycardia with sudden onset/offset',
        'Common in young adults without structural heart disease'
      ]
    },
    clinicalContext: '28-year-old female with sudden onset palpitations. Lightheaded but no syncope. Multiple similar episodes. No structural heart disease.',
    management: [
      'Assess stability first',
      'Vagal maneuvers (modified Valsalva, carotid massage)',
      'Adenosine 6mg rapid bolus (if stable)',
      'Adenosine 12mg if first dose ineffective',
      'AV node blocking agents (verapamil, diltiazem) if stable',
      'Cardioversion if unstable',
      'Avoid verapamil if WPW suspected',
      'Consider electrophysiology referral'
    ],
    teachingPoints: [
      'AVNRT = re-entry circuit within AV node',
      'Most common SVT in adults without structural disease',
      'Sudden onset/offset is characteristic',
      'P waves often hidden in QRS (pseudo R\' in V1)',
      'Adenosine is diagnostic (terminates SVT) and therapeutic',
      'Modified Valsalva most effective vagal maneuver'
    ]
  },

  // LBBB with STEMI (Sgarbossa Criteria)
  {
    id: 'ecg-lbbb-stemi',
    title: 'LBBB with Acute MI (Sgarbossa Criteria)',
    category: 'Conduction + Ischemia',
    subcategory: 'LBBB',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/lbbb-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/Left-bundle-branch-block-LBBB-4.jpg',
    description: 'LBBB pattern with concordant ST elevation - MI equivalent!',
    interpretation: {
      rhythm: 'Sinus rhythm',
      rate: 90,
      pWave: 'Normal',
      prInterval: '180ms',
      qrsDuration: '150ms (prolonged >120ms)',
      qtInterval: '480ms',
      stSegment: 'Concordant ST elevation in leads with QRS positivity',
      tWave: 'Discordant to QRS',
      keyFeatures: [
        'LBBB pattern: broad notched R in V5-V6, QS in V1-V2',
        'Sgarbossa criteria: Concordant ST elevation ≥1mm',
        'Or ST/S ratio >0.25 in V1-V3',
        'New LBBB with chest pain = STEMI equivalent!',
        'Compare to old ECG if available'
      ]
    },
    clinicalContext: '72-year-old female with known LBBB presenting with chest pain. Diaphoretic. Hypotensive.',
    management: [
      'New LBBB + chest pain = STEMI equivalent!',
      'Treat as STEMI with immediate reperfusion',
      'Primary PCI if available',
      'Thrombolysis if PCI delay >120 minutes',
      'Compare with prior ECG if available',
      'Sgarbossa criteria helps confirm MI',
      'Full activation of cath lab'
    ],
    teachingPoints: [
      'New LBBB with chest pain is a STEMI equivalent',
      'LBBB makes STEMI diagnosis difficult',
      'Sgarbossa criteria: concordant ST elevation ≥1mm',
      'Modified Sgarbossa: ST/S ratio >0.25 in V1-V3',
      'Compare to old ECG - is LBBB new or old?',
      'When in doubt, activate cath lab for new LBBB + symptoms'
    ]
  },

  // DE WINTER'S T WAVES
  {
    id: 'ecg-de-winter',
    title: 'de Winter\'s T Waves - LAD Occlusion',
    category: 'STEMI-Equivalent',
    subcategory: 'Anterior Ischemia',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/de-winter-t-waves-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-De-Winter-T-Waves-1.jpg',
    description: 'Hyperacute T waves with ST depression in V2-V3 - anterior STEMI equivalent!',
    interpretation: {
      rhythm: 'Sinus rhythm',
      rate: 75,
      pWave: 'Normal',
      prInterval: '160ms',
      qrsDuration: '80ms',
      qtInterval: '400ms',
      stSegment: 'ST depression 1-2mm in V1-V3',
      tWave: 'Hyperacute, symmetrical, prominent in V1-V3',
      keyFeatures: [
        'ST depression in V1-V3',
        'Hyperacute T waves in same leads',
        'Upward sloping ST depression (not horizontal)',
        'Preserved R waves in V2-V3 (not yet Q waves)',
        'Indicates LAD occlusion before full STEMI develops',
        'This is a STEMI equivalent!'
      ]
    },
    clinicalContext: '52-year-old male with ongoing chest pain for 1 hour. Diaphoretic. Initial ECG shows de Winter pattern.',
    management: [
      'Recognize as STEMI equivalent!',
      'Activate cath lab immediately',
      'Primary PCI',
      'Standard MI treatment (aspirin, etc.)',
      'Do NOT dismiss as "non-STEMI"',
      'May progress to full anterior STEMI',
      'Same urgency as STEMI'
    ],
    teachingPoints: [
      'de Winter T waves = LAD occlusion',
      'STEMI equivalent despite no ST elevation',
      'Hyperacute, symmetrical T waves in V1-V3',
      'Upward-sloping ST depression (not horizontal)',
      'Progresses to anterior STEMI if not treated',
      'Named after Robbert de Winter who described pattern'
    ]
  },

  // PERICARDITIS
  {
    id: 'ecg-pericarditis',
    title: 'Acute Pericarditis',
    category: 'Pericardial',
    subcategory: 'Inflammation',
    urgency: 'urgent',
    litflUrl: 'https://litfl.com/pericarditis-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Pericarditis.jpg',
    description: 'Diffuse ST elevation with PR depression - chest pain pleuritic',
    interpretation: {
      rhythm: 'Sinus tachycardia',
      rate: 105,
      pWave: 'Normal',
      prInterval: '200ms',
      qrsDuration: '90ms',
      qtInterval: '400ms',
      stSegment: 'Diffuse ST elevation (concave upward)',
      tWave: 'Normal',
      keyFeatures: [
        'Diffuse ST elevation (multiple leads)',
        'PR depression (except aVR)',
        'ST elevation in aVR (reciprocal)',
        'Concave (smiley face) ST morphology',
        'Spodot\'s sign (notched J point)',
        'Chest pain is pleuritic (worse with inspiration, lying flat)'
      ]
    },
    clinicalContext: '32-year-old male with sharp chest pain that worsens with inspiration and lying flat. Started after viral illness 1 week ago.',
    management: [
      'Distinguish from STEMI (reciprocal changes in STEMI, not pericarditis)',
      'NSAIDs for pain and inflammation',
      'Colchicine for recurrent pericarditis',
      'Treatment of underlying cause',
      'Monitor for pericardial effusion/tamponade',
      'Avoid strenuous activity until resolved'
    ],
    teachingPoints: [
      'Diffuse ST elevation (not localized like STEMI)',
      'PR depression is characteristic (except aVR)',
      'Concave (smiley face) ST morphology',
      'Chest pain is pleuritic and positional',
      'Often follows viral illness',
      'Tamponade is rare but serious complication'
    ]
  },

  // PULMONARY EMBOLISM
  {
    id: 'ecg-pe-s1q3t3',
    title: 'Acute Pulmonary Embolism - S1Q3T3 Pattern',
    category: 'Pulmonary',
    subcategory: 'PE',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/pulmonary-embolism-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Massive-bilateral-pulmonary-embolus.jpeg',
    description: 'S1Q3T3 pattern with RBBB - large PE',
    interpretation: {
      rhythm: 'Sinus tachycardia',
      rate: 115,
      pWave: 'Normal',
      prInterval: '160ms',
      qrsDuration: '110ms (RBBB pattern)',
      qtInterval: '380ms',
      stSegment: 'T wave inversion in V1-V3, aVR',
      tWave: 'Inverted in III, aVF',
      keyFeatures: [
        'Large S wave in lead I',
        'Q wave in lead III',
        'Inverted T waves in III, aVF',
        'RBBB pattern (rsR\' in V1-V3)',
        'Sinus tachycardia',
        'Right heart strain signs',
        'McConnell\'s sign (RV free wall akinesis on echo)'
      ]
    },
    clinicalContext: '28-year-old female post-operative day 3. Sudden onset shortness of breath, pleuritic chest pain. SpO2 88% on room air.',
    management: [
      'Assess severity (hemodynamic status)',
      'CT pulmonary angiography if available',
      'V/Q scan if CT not available',
      'Thrombolysis if massive PE with hemodynamic compromise',
      'Anticoagulation (heparin, then DOAC)',
      'Consider thrombolysis for intermediate/high risk',
      'Look for DVT (DVT study)',
      'Long-term anticoagulation'
    ],
    teachingPoints: [
      'S1Q3T3 is classic but not always present',
      'Right heart strain signs on ECG',
      'RBBB pattern common in large PE',
      'ECG changes can be minimal or absent',
      'Normal ECG does NOT rule out PE',
      'Tachycardia is most common finding'
    ]
  },

  // AORTIC DISSECTION (Normal ECG!)
  {
    id: 'ecg-aortic-dissection-normal',
    title: 'Aortic Dissection with Normal ECG',
    category: 'Vascular',
    subcategory: 'Aortic',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/aortic-dissection-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Normal-sinus-rhythm-strip.jpg',
    description: 'Normal ECG does NOT rule out dissection - high risk diagnosis!',
    interpretation: {
      rhythm: 'Sinus tachycardia',
      rate: 105,
      pWave: 'Normal',
      prInterval: '160ms',
      qrsDuration: '90ms',
      qtInterval: '350ms',
      stSegment: 'Normal',
      tWave: 'Normal',
      keyFeatures: [
        'Normal ECG or sinus tachycardia only',
        'No ischemic changes',
        'No ST elevation or depression',
        'Normal QRS axis and width',
        'IMPORTANT: Normal ECG does NOT rule out dissection!'
      ]
    },
    clinicalContext: '62-year-old male with severe tearing chest pain radiating to back. Pain maximal at onset. BP 170/100 right arm, 140/90 left arm.',
    management: [
      'Suspect dissection even with normal ECG!',
      'Chest X-ray: widened mediastinum',
      'CT angiogram is diagnostic',
      'DO NOT give thrombolytics (fatal in dissection!)',
      'BP control with beta blockers if needed',
      'Emergent surgical consultation',
      'TEE for diagnosis if CT not available',
      'IV access in uninvolved arm if possible'
    ],
    teachingPoints: [
      'Normal ECG does NOT rule out dissection!',
      'Tearing chest pain radiating to back is classic',
      'Pain maximal at onset (unlike MI which builds up)',
      'Blood pressure discrepancy between arms >20mmHg',
      'Widened mediastinum on CXR is suspicious',
      'Thrombolytics are FATAL if given for dissection!'
    ]
  },

  // POSTERIOR MI
  {
    id: 'ecg-posterior-mi',
    title: 'Posterior Myocardial Infarction',
    category: 'STEMI',
    subcategory: 'Posterior',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/posterior-mi-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Posterior-AMI-1.jpg',
    description: 'ST depression V1-V3 with tall R waves and upright T waves - posterior STEMI!',
    interpretation: {
      rhythm: 'Sinus rhythm',
      rate: 82,
      pWave: 'Normal',
      prInterval: '170ms',
      qrsDuration: '85ms',
      qtInterval: '410ms',
      stSegment: 'Horizontal ST depression 1-2mm in V1-V3',
      tWave: 'Upright and tall in V1-V3 (opposite of ischemia)',
      keyFeatures: [
        'ST depression in V1-V3 (mirror image of posterior ST elevation)',
        'Tall R waves in V1-V2 (posterior MI equivalent of Q waves)',
        'Upright T waves in V1-V3',
        'Posterior leads (V7-V9) show ST elevation ≥0.5mm',
        'Often associated with inferior or lateral STEMI',
        'Consider posterior extension in any inferior STEMI'
      ],
      differentialDiagnosis: ['Anterior ischemia', 'Early repolarization', 'LVH strain pattern']
    },
    clinicalContext: '58-year-old male with chest pain. Inferior STEMI on initial ECG. Additional changes in V1-V2 suggest posterior extension.',
    management: [
      'Recognize posterior extension of STEMI',
      'Obtain posterior leads (V7-V9) if suspected',
      'ST elevation ≥0.5mm in V7-V9 confirms posterior MI',
      'Treat as STEMI with immediate reperfusion',
      'Large territory at risk - worse prognosis',
      'Primary PCI preferred',
      'Monitor for complications (LV dysfunction, murmur)'
    ],
    teachingPoints: [
      'Posterior MI is a "mirror image" on anterior leads',
      'ST depression in V1-V3 = posterior ST elevation',
      'Tall R waves = posterior Q waves',
      'Upright T waves in V1-V3 are abnormal (usually inverted)',
      'Always get posterior leads for suspected posterior MI',
      'V7-V9 placement: same horizontal plane as V6',
      'Posterior MI often accompanies inferior or lateral STEMI',
      'Large myocardial territory at risk'
    ]
  },

  // CARDIAC TAMPONADE (Electrical Alternans)
  {
    id: 'ecg-cardiac-tamponade',
    title: 'Cardiac Tamponade with Electrical Alternans',
    category: 'Pericardial',
    subcategory: 'Tamponade',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/tamponade-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG_massive_pericardial_effusion.jpg',
    description: 'Electrical alternans with sinus tachycardia - cardiac tamponade!',
    interpretation: {
      rhythm: 'Sinus tachycardia',
      rate: 135,
      pWave: 'Normal',
      prInterval: '160ms',
      qrsDuration: '90ms',
      qtInterval: '360ms',
      stSegment: 'Normal',
      tWave: 'Normal',
      keyFeatures: [
        'Electrical alternans: alternating QRS amplitude',
        'Sinus tachycardia (often >120 bpm)',
        'Low voltage QRS complexes (possible)',
        'General ECG may appear normal otherwise',
        'Pulsus paradoxus on clinical exam',
        'Beck\'s triad: hypotension, JVD, muffled heart sounds'
      ],
      differentialDiagnosis: ['Large pericardial effusion without tamponade', 'Severe tachycardia artifact', 'Other causes of pulsus paradoxus']
    },
    clinicalContext: '55-year-old male with cancer, presenting with dyspnea and hypotension. BP 85/60, HR 135, JVD present. Muffled heart sounds.',
    management: [
      'Recognize as surgical emergency!',
      'Bedside ultrasound to confirm pericardial effusion',
      'Prepare for emergent pericardiocentesis',
      'IV fluid bolus for temporary stabilization',
      'Avoid positive pressure ventilation (decreases venous return)',
      'Treat underlying cause',
      'Surgical pericardial window may be needed'
    ],
    teachingPoints: [
      'Electrical alternans = heart swinging in fluid',
      'Not all effusions cause tamponade',
      'Tamponade = echocardiographic signs + clinical compromise',
      'Beck\'s triad: hypotension, JVD, muffled heart sounds',
      'Pulsus paradoxus >10mmHg',
      'Electrical alternans is specific but not sensitive',
      'ECG may be normal in early tamponade'
    ]
  },

  // HYPOKALEMIA
  {
    id: 'ecg-hypokalemia',
    title: 'Moderate to Severe Hypokalemia',
    category: 'Metabolic',
    subcategory: 'Electrolyte',
    urgency: 'urgent',
    litflUrl: 'https://litfl.com/hypokalemia-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-severe-hypokalemia-serum-potassium-1.7.jpg',
    description: 'Flat T waves, prominent U waves, ST depression - hypokalemia!',
    interpretation: {
      rhythm: 'Sinus rhythm',
      rate: 88,
      pWave: 'Normal',
      prInterval: '180ms (may be prolonged)',
      qrsDuration: '90ms (may be prolonged)',
      qtInterval: 'Prolonged (QU interval)',
      stSegment: 'ST depression possible',
      tWave: 'Flattened or inverted',
      keyFeatures: [
        'Progressive changes as K+ decreases:',
        'Mild: Small T waves, prominent U waves',
        'Moderate: ST depression, flattened T waves, prominent U waves',
        'Severe: Marked ST depression, prominent U waves, prolonged QU',
        'U wave often taller than T wave',
        'May cause arrhythmias (PVCs, VT)'
      ],
      differentialDiagnosis: ['Ischemia', 'Drug effects (digoxin, beta blockers)', 'Normal variant']
    },
    clinicalContext: '45-year-old female on diuretics for hypertension. Presents with weakness, muscle cramps, and palpitations. K+ 2.4 mEq/L.',
    management: [
      'Assess severity and symptoms',
      'Oral potassium replacement for mild cases',
      'IV potassium replacement for severe cases (caution!',
      'Correct magnesium level first (required for K+ repletion)',
      'Identify and treat underlying cause',
      'Monitor cardiac rhythm',
      'Recheck K+ levels after replacement'
    ],
    teachingPoints: [
      'U waves are the hallmark of hypokalemia',
      'U wave > T wave is significant',
      'Hypokalemia prolongs QU (not QT) interval',
      'Always check magnesium with low potassium',
      'Can precipitate dangerous arrhythmias',
      'Correct slowly with oral preferred when stable',
      'IV potassium requires cardiac monitoring'
    ]
  },

  // DIGOXIN TOXICITY
  {
    id: 'ecg-digoxin-toxicity',
    title: 'Digoxin Toxicity - Atrial Tachycardia with Block',
    category: 'Toxic',
    subcategory: 'Drug',
    urgency: 'urgent',
    litflUrl: 'https://litfl.com/digoxin-toxicity-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/Digoxin-Toxicity-atrial-tachycardia-with-block-and-frequent-PVC.jpg',
    description: 'Atrial tachycardia with 2:1 block, scooped ST depression - digoxin toxicity!',
    interpretation: {
      rhythm: 'Atrial tachycardia with variable block',
      rate: 150,
      pWave: 'Flutter-like, not sinus',
      prInterval: 'Variable',
      qrsDuration: '90ms (may be prolonged)',
      qtInterval: 'Shortened',
      stSegment: '"Scooped" or reverse tick depression',
      tWave: 'Inverted or flattened',
      keyFeatures: [
        'Atrial tachycardia with AV block (classic)',
        '"Reverse tick" or scooped ST depression',
        'Junctional escape beats',
        'Bidirectional VT (severe toxicity)',
        'PVCs, atrial and ventricular arrhythmias',
        'First-degree AV block common'
      ],
      differentialDiagnosis: ['Atrial flutter with variable block', 'SVT with aberrancy', 'Other causes of tachyarrhythmia']
    },
    clinicalContext: '78-year-old female on digoxin for atrial fibrillation. Presents with nausea, vomiting, and visual changes (yellow halos). Skipped beats reported.',
    management: [
      'Discontinue digoxin immediately',
      'Check digoxin level (draw before antidote!',
      'Correct electrolytes (especially K+ and Mg2+)',
      'Atropine for severe bradycardia',
      'Digoxin-specific antibody fragments (Fab) for severe toxicity',
      'Temporary pacing if refractory bradycardia',
      'Avoid cardioversion (can cause intractable VF)'
    ],
    teachingPoints: [
      'Atrial tachycardia with block is classic for digoxin toxicity',
      '"Scooped" ST depression is chronic digoxin effect',
      'Toxicity can cause almost any arrhythmia',
      'Bidirectional VT is pathognomonic for digoxin toxicity',
      'Treat hyperkalemia conservatively (often pseudohyperkalemia)',
      'Digoxin Fab antibodies rapidly reverse toxicity',
      'Watch for interaction with other drugs (amiodarone, verapamil)'
    ]
  },

  // TRICYCLIC ANTIDEPRESSANT OVERDOSE
  {
    id: 'ecg-tca-overdose',
    title: 'Tricyclic Antidepressant Overdose',
    category: 'Toxic',
    subcategory: 'Drug',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/tca-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-TCA-overdose-Sodium-Channel-Blocking-Agent-Toxicity.jpg',
    description: 'Wide QRS, right axis deviation, terminal R wave in aVR - TCA overdose!',
    interpretation: {
      rhythm: 'Sinus tachycardia',
      rate: 125,
      pWave: 'Normal',
      prInterval: 'Prolonged (>200ms)',
      qrsDuration: '160ms (prolonged >100ms = risk)',
      qtInterval: 'Prolonged',
      stSegment: 'Difficult to assess',
      tWave: 'Difficult to assess',
      keyFeatures: [
        'Wide QRS complex (>100ms = high risk)',
        'Right axis deviation of QRS',
        'Terminal R wave in aVR (>3mm = severe toxicity)',
        'Sinus tachycardia (anticholinergic effect)',
        'Prolonged PR interval',
        'Brugada-like pattern in right precordial leads'
      ],
      differentialDiagnosis: ['Brugada syndrome', 'Hyperkalemia', 'Sodium channel blocker toxicity', 'MI']
    },
    clinicalContext: '26-year-old female found unresponsive after reported ingestion of amitriptyline. QRS 160ms on ECG. Seizures en route.',
    management: [
      'ABCs - secure airway early',
      'Sodium bicarbonate 1-2 mEq/kg IV bolus',
      'Repeat sodium bicarbonate boluses until QRS narrows',
      'Consider sodium bicarbonate infusion',
      'Avoid antiarrhythmics (can worsen sodium channel blockade)',
      'Benzodiazepines for seizures',
      'Cardiac monitoring for ≥24 hours',
      'Consider intubation and hyperventilation'
    ],
    teachingPoints: [
      'TCA overdose = sodium channel blockade',
      'QRS >100ms = high seizure risk',
      'QRS >160ms = high ventricular arrhythmia risk',
      'Terminal R wave in aVR is classic',
      'Sodium bicarbonate is antidote (not naloxone)',
      'Wide QRS + right axis = think TCA',
      'Intubation cautiously (can worsen hypotension)'
    ]
  },

  // LATERAL STEMI
  {
    id: 'ecg-stemi-lateral',
    title: 'Acute Lateral STEMI',
    category: 'STEMI',
    subcategory: 'Lateral',
    urgency: 'critical',
    litflUrl: 'https://litfl.com/lateral-stemi-ecg-library/',
    imageUrl: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Lateral-STEMI-1st-diagonal.jpg',
    description: 'ST elevation I, aVL, V5-V6 with reciprocal changes in inferior leads',
    interpretation: {
      rhythm: 'Sinus rhythm',
      rate: 78,
      pWave: 'Normal',
      prInterval: '165ms',
      qrsDuration: '85ms',
      qtInterval: '415ms',
      stSegment: 'ST elevation 1-2mm in I, aVL, V5-V6',
      tWave: 'Hyperacute in lateral leads',
      keyFeatures: [
        'ST elevation in high lateral leads (I, aVL)',
        'ST elevation in V5-V6',
        'Reciprocal ST depression in inferior leads',
        'Often associated with anterior or inferior STEMI',
        'Circumflex or diagonal branch occlusion',
        'High lateral may be isolated LCx occlusion'
      ],
      differentialDiagnosis: ['Pericarditis', 'Early repolarization', 'LV aneurysm']
    },
    clinicalContext: '51-year-old male with chest pain. Diaphoretic. Pain radiates to left arm.',
    management: [
      'Aspirin 300mg chewed',
      'High-flow oxygen if SpO2 <90%',
      'Nitrates if SBP ≥90',
      'Activate cath lab for primary PCI',
      'Consider LCx or diagonal occlusion',
      'Pre-alert receiving hospital',
      'Standard MI management'
    ],
    teachingPoints: [
      'Lateral MI = LCx or diagonal branch occlusion',
      'ST elevation in I, aVL, V5-V6',
      'Reciprocal changes confirm ischemia',
      'Isolated high lateral MI can be missed',
      'Often extends anterior or inferior',
      'Monitor for complications (mitral regurgitation, LV dysfunction)'
    ]
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getCriticalECGs = (): ECGDisplay[] => {
  return criticalCardiacECGs.filter(ecg => ecg.urgency === 'critical');
};

export const getUrgentECGs = (): ECGDisplay[] => {
  return criticalCardiacECGs.filter(ecg => ecg.urgency === 'urgent');
};

export const getECGById = (id: string): ECGDisplay | undefined => {
  return [...criticalCardiacECGs, ...essentialCardiacECGs].find(ecg => ecg.id === id);
};

export const getECGsByCategory = (category: string): ECGDisplay[] => {
  return [...criticalCardiacECGs, ...essentialCardiacECGs].filter(ecg =>
    ecg.category.includes(category) || ecg.subcategory.includes(category)
  );
};

export const searchECGs = (query: string): ECGDisplay[] => {
  const lowerQuery = query.toLowerCase();
  return [...criticalCardiacECGs, ...essentialCardiacECGs].filter(ecg =>
    ecg.title.toLowerCase().includes(lowerQuery) ||
    ecg.category.toLowerCase().includes(lowerQuery) ||
    ecg.subcategory.toLowerCase().includes(lowerQuery) ||
    ecg.teachingPoints.some(point => point.toLowerCase().includes(lowerQuery))
  );
};

export const getECGForCase = (caseCategory: string, caseTitle: string): ECGDisplay | undefined => {
  // Match ECG to case based on keywords in case title
  const allECGs = [...criticalCardiacECGs, ...essentialCardiacECGs];
  const titleLower = caseTitle.toLowerCase();
  const categoryLower = caseCategory.toLowerCase();

  // Direct category match for cardiac cases
  if (categoryLower.includes('cardiac')) {
    // Anterior STEMI
    if (titleLower.includes('anterior') || titleLower.includes('v1') || titleLower.includes('v2') || titleLower.includes('v3') || titleLower.includes('v4')) {
      return allECGs.find(ecg => ecg.title.includes('Anterior STEMI'));
    }
    // Inferior STEMI
    if (titleLower.includes('inferior') || titleLower.includes('ii') || titleLower.includes('iii') || titleLower.includes('avf')) {
      return allECGs.find(ecg => ecg.title.includes('Inferior STEMI'));
    }
    // Lateral STEMI
    if (titleLower.includes('lateral') || titleLower.includes('i') || titleLower.includes('avl') || titleLower.includes('v5') || titleLower.includes('v6')) {
      return allECGs.find(ecg => ecg.title.includes('Lateral STEMI'));
    }
    // Posterior STEMI
    if (titleLower.includes('posterior')) {
      return allECGs.find(ecg => ecg.title.includes('Posterior'));
    }
    // Wellens Syndrome
    if (titleLower.includes('wellens')) {
      return allECGs.find(ecg => ecg.title.includes('Wellens'));
    }
    // de Winter Syndrome
    if (titleLower.includes('de winter') || titleLower.includes('dewinter')) {
      return allECGs.find(ecg => ecg.title.includes('de Winter'));
    }
    // Atrial Fibrillation
    if (titleLower.includes('atrial fibrillation') || titleLower.includes('af') || titleLower.includes('a.fib') || titleLower.includes('a fib')) {
      return allECGs.find(ecg => ecg.title.includes('Atrial Fibrillation'));
    }
    // Atrial Flutter
    if (titleLower.includes('atrial flutter')) {
      return allECGs.find(ecg => ecg.title.includes('Atrial Flutter'));
    }
    // SVT
    if (titleLower.includes('svt') || titleLower.includes('supraventricular')) {
      return allECGs.find(ecg => ecg.title.includes('SVT'));
    }
    // Ventricular Tachycardia
    if (titleLower.includes('ventricular tachycardia') || titleLower.includes('vt') || titleLower.includes('v-tach')) {
      return allECGs.find(ecg => ecg.title.includes('VT'));
    }
    // Cardiac Arrest
    if (titleLower.includes('cardiac arrest') || titleLower.includes('arrest') || titleLower.includes('rosa')) {
      return allECGs.find(ecg => ecg.title.includes('VF') || ecg.title.includes('VT'));
    }
    // Cardiac Tamponade
    if (titleLower.includes('tamponade') || titleLower.includes('beck') || titleLower.includes('pulsus')) {
      return allECGs.find(ecg => ecg.title.includes('Tamponade'));
    }
    // Pulmonary Embolism
    if (titleLower.includes('pulmonary embolism') || titleLower.includes('pe')) {
      return allECGs.find(ecg => ecg.title.includes('PE'));
    }
    // Pericarditis
    if (titleLower.includes('pericarditis')) {
      return allECGs.find(ecg => ecg.title.includes('Pericarditis'));
    }
    // Hyperkalemia
    if (titleLower.includes('hyperkalemia') || titleLower.includes('hyper k')) {
      return allECGs.find(ecg => ecg.title.includes('Hyperkalemia'));
    }
    // Hypokalemia
    if (titleLower.includes('hypokalemia') || titleLower.includes('hypo k')) {
      return allECGs.find(ecg => ecg.title.includes('Hypokalemia'));
    }
    // Digoxin Toxicity
    if (titleLower.includes('digoxin') || titleLower.includes('digitalis')) {
      return allECGs.find(ecg => ecg.title.includes('Digoxin'));
    }
    // TCA Overdose
    if (titleLower.includes('tca') || titleLower.includes('tricyclic')) {
      return allECGs.find(ecg => ecg.title.includes('TCA'));
    }
    // Brugada
    if (titleLower.includes('brugada')) {
      return allECGs.find(ecg => ecg.title.includes('Brugada'));
    }
    // Aortic Dissection
    if (titleLower.includes('aortic dissection') || titleLower.includes('dissection')) {
      return allECGs.find(ecg => ecg.title.includes('Aortic Dissection'));
    }
    // Generic STEMI (return anterior as default)
    if (titleLower.includes('stemi') || titleLower.includes('st-elevation')) {
      return allECGs.find(ecg => ecg.category === 'STEMI');
    }
  }

  // Thoracic/Critical cases
  if (categoryLower.includes('thoracic') || categoryLower.includes('critical')) {
    if (titleLower.includes('tamponade')) {
      return allECGs.find(ecg => ecg.title.includes('Tamponade'));
    }
    if (titleLower.includes('pneumothorax')) {
      return allECGs.find(ecg => ecg.title.includes('Tension Pneumothorax'));
    }
    if (titleLower.includes('hemothorax')) {
      return allECGs.find(ecg => ecg.title.includes('Hemothorax'));
    }
  }

  // Respiratory cases
  if (categoryLower.includes('respiratory')) {
    if (titleLower.includes('pe') || titleLower.includes('embolism')) {
      return allECGs.find(ecg => ecg.title.includes('PE'));
    }
  }

  // For any cardiac category, return a relevant ECG
  if (categoryLower.includes('cardiac')) {
    // Default to Anterior STEMI for generic cardiac cases
    return allECGs.find(ecg => ecg.title.includes('Anterior STEMI'));
  }

  return undefined;
};

// Export all ECGs
export const allLitflECGs: ECGDisplay[] = [
  ...criticalCardiacECGs,
  ...essentialCardiacECGs
];

export default allLitflECGs;
