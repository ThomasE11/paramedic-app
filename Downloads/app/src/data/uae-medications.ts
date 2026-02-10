/**
 * UAE Ambulance Medications Database
 * Based on Dubai Corporation for Ambulance Services (DCAS) and Abu Dhabi protocols
 */

export interface UAEMedication {
  name: string;
  uaeBrandName?: string;
  emtLevel: 'EMT-B' | 'EMT-I' | 'ACP';
  dose: string;
  route: string[];
  indication: string;
  contraindications: string[];
  sideEffects: string[];
  notes?: string;
}

export const uaeMedications: Record<string, UAEMedication> = {
  // ===== OXYGEN & AIRWAY =====
  oxygen: {
    name: 'Oxygen',
    uaeBrandName: 'Medical Oxygen',
    emtLevel: 'EMT-B',
    dose: '12-15 L/min via non-rebreather',
    route: ['INHAL'],
    indication: 'Hypoxia, chest pain, dyspnea, shock',
    contraindications: ['None in emergency settings', 'COPD with CO2 retention (use cautious)'],
    sideEffects: [],
    notes: 'Target SpO2 94-98% for most patients, 88-92% for COPD'
  },

  // ===== CARDIAC =====
  aspirin: {
    name: 'Aspirin',
    uaeBrandName: 'Aspirin, Aspav',
    emtLevel: 'EMT-B',
    dose: '300mg chewed',
    route: ['PO'],
    indication: 'Suspected Acute Coronary Syndrome',
    contraindications: ['Active bleeding', 'Aspirin allergy', 'Recent GI bleed'],
    sideEffects: ['GI irritation', 'Bleeding'],
    notes: 'Must be chewed for faster absorption'
  },
  gtn_spray: {
    name: 'Glyceryl Trinitrate',
    uaeBrandName: 'Nitrolingual spray',
    emtLevel: 'EMT-B',
    dose: '0.4mg spray',
    route: ['SL'],
    indication: 'Chest pain, suspected ACS',
    contraindications: ['SBP < 90 mmHg', 'Right ventricular infarct', 'Phosphodiesterase inhibitors (Viagra)', 'Severe aortic stenosis'],
    sideEffects: ['Hypotension', 'Headache', 'Tachycardia'],
    notes: 'Can repeat every 5 minutes up to 3 doses'
  },
  amiodarone: {
    name: 'Amiodarone',
    uaeBrandName: 'Cordarone',
    emtLevel: 'EMT-I',
    dose: '150mg IV over 10 min, then 1mg/min for 6 hours',
    route: ['IV'],
    indication: 'Shock-resistant VF/VT, stable VT',
    contraindications: ['Bradycardia', 'Heart block', 'Thyroid disorders'],
    sideEffects: ['Hypotension', 'Bradycardia', 'Thyroid dysfunction'],
    notes: 'EMT-I with online medical direction'
  },
  adrenaline_cardiac: {
    name: 'Adrenaline (Epinephrine)',
    uaeBrandName: 'Adrenaline',
    emtLevel: 'EMT-I',
    dose: '1mg IV every 3-5 minutes',
    route: ['IV'],
    indication: 'Cardiac arrest',
    contraindications: ['None in arrest'],
    sideEffects: ['Tachycardia', 'Hypertension', 'Ischemia'],
    notes: '1:10,000 concentration for cardiac arrest'
  },

  // ===== RESPIRATORY =====
  salbutamol: {
    name: 'Salbutamol',
    uaeBrandName: 'Ventolin',
    emtLevel: 'EMT-I',
    dose: '2.5-5mg via nebulizer',
    route: ['INHAL'],
    indication: 'Asthma, COPD, bronchospasm',
    contraindications: ['None in acute setting'],
    sideEffects: ['Tachycardia', 'Tremor', 'Hypokalemia'],
    notes: 'Can repeat every 20 minutes'
  },
  ipratropium: {
    name: 'Ipratropium Bromide',
    uaeBrandName: 'Atrovent',
    emtLevel: 'EMT-I',
    dose: '0.5mg via nebulizer',
    route: ['INHAL'],
    indication: 'Asthma, COPD (use with salbutamol)',
    contraindications: ['Glaucoma (avoid nebulization)', 'Prostatic hypertrophy'],
    sideEffects: ['Dry mouth', 'Urinary retention'],
    notes: 'Often combined with salbutamol'
  },

  // ===== ANALGESIA =====
  morphine: {
    name: 'Morphine Sulfate',
    uaeBrandName: 'Morphine',
    emtLevel: 'EMT-I',
    dose: '5mg IV/IM, repeat 2-5mg every 10 min as needed',
    route: ['IV', 'IM'],
    indication: 'Severe pain (chest pain, trauma, burns)',
    contraindications: ['SBP < 90', 'Respiratory depression', 'Head injury', 'Shock'],
    sideEffects: ['Respiratory depression', 'Hypotension', 'Nausea', 'Vomiting'],
    notes: 'Monitor for respiratory depression'
  },
  fentanyl: {
    name: 'Fentanyl',
    uaeBrandName: 'Fentanyl',
    emtLevel: 'EMT-I',
    dose: '50mcg IN/IV, repeat 25-50mcg every 10 min',
    route: ['IN', 'IV'],
    indication: 'Moderate to severe pain',
    contraindications: ['Respiratory depression', 'Shock'],
    sideEffects: ['Respiratory depression', 'Chest wall rigidity (IV rapid push)'],
    notes: 'IN route preferred for prehospital'
  },
  paracetamol: {
    name: 'Paracetamol',
    uaeBrandName: 'Panadol, Adol',
    emtLevel: 'EMT-B',
    dose: '500mg-1g PO/PR',
    route: ['PO', 'PR'],
    indication: 'Mild to moderate pain, fever',
    contraindications: ['Severe liver disease', 'Allergy'],
    sideEffects: ['Rare at therapeutic doses'],
    notes: 'Max 4g/day in adults'
  },

  // ===== ANAPHYLAXIS & ALLERGIES =====
  adrenaline_im: {
    name: 'Adrenaline (Epinephrine)',
    uaeBrandName: 'EpiPen, Anapen',
    emtLevel: 'EMT-B',
    dose: '0.3mg (0.3mL) IM for adults, 0.15mg (0.15mL) IM for children',
    route: ['IM'],
    indication: 'Anaphylaxis',
    contraindications: ['None in anaphylaxis'],
    sideEffects: ['Tachycardia', 'Anxiety', 'Tremor'],
    notes: '1:1,000 concentration, IM into anterolateral thigh'
  },
  cetirizine: {
    name: 'Cetirizine',
    uaeBrandName: 'Zyrtec',
    emtLevel: 'EMT-B',
    dose: '10mg PO',
    route: ['PO'],
    indication: 'Allergic reaction (adjunct to adrenaline)',
    contraindications: ['Severe renal impairment'],
    sideEffects: ['Drowsiness', 'Dry mouth'],
    notes: 'Can cause drowsiness'
  },
  chlorphenamine: {
    name: 'Chlorphenamine Maleate',
    uaeBrandName: 'Piriton',
    emtLevel: 'EMT-I',
    dose: '10mg IV/IM',
    route: ['IV', 'IM'],
    indication: 'Allergic reaction',
    contraindications: ['Acute asthma attack'],
    sideEffects: ['Drowsiness', 'Anticholinergic effects'],
    notes: 'Caution in glaucoma, prostatic hypertrophy'
  },

  // ===== SEIZURE & NEUROLOGICAL =====
  midazolam: {
    name: 'Midazolam',
    uaeBrandName: 'Dormicum',
    emtLevel: 'EMT-I',
    dose: '5-10mg IM/IN/IV (adults), 0.2mg/kg IN (children)',
    route: ['IM', 'IN', 'IV', 'BUCCAL'],
    indication: 'Seizures, agitation, procedural sedation',
    contraindications: ['Shock'],
    sideEffects: ['Respiratory depression', 'Hypotension', 'Amnesia'],
    notes: 'Buccal/IN preferred for seizures in community'
  },
  diazepam: {
    name: 'Diazepam',
    uaeBrandName: 'Valium',
    emtLevel: 'EMT-I',
    dose: '5-10mg IV/PR',
    route: ['IV', 'PR'],
    indication: 'Seizures, muscle spasm, anxiety',
    contraindications: ['Shock', 'Respiratory depression'],
    sideEffects: ['Respiratory depression', 'Hypotension', 'Sedation'],
    notes: 'Slower onset than midazolam'
  },

  // ===== DIABETES & METABOLIC =====
  oral_glucose: {
    name: 'Oral Glucose Gel',
    uaeBrandName: 'Hypostop',
    emtLevel: 'EMT-B',
    dose: '15-20g gel',
    route: ['PO'],
    indication: 'Hypoglycemia (conscious patient able to swallow)',
    contraindications: ['Unconscious patient', 'Unable to swallow'],
    sideEffects: [],
    notes: 'Check blood glucose first'
  },
  glucose_10: {
    name: 'Glucose 10%',
    uaeBrandName: 'Dextrose 10%',
    emtLevel: 'EMT-I',
    dose: '250-500mL IV',
    route: ['IV'],
    indication: 'Hypoglycemia (unconscious or unable to swallow)',
    contraindications: ['Pulmonary edema', 'Severe dehydration'],
    sideEffects: ['Phlebitis', 'Fluid overload'],
    notes: 'Monitor blood glucose during administration'
  },
  glucagon: {
    name: 'Glucagon',
    uaeBrandName: 'GlucaGen',
    emtLevel: 'EMT-I',
    dose: '1mg IM/SC',
    route: ['IM', 'SC'],
    indication: 'Severe hypoglycemia when IV access unavailable',
    contraindications: ['Pheochromocytoma', 'Insulinoma'],
    sideEffects: ['Nausea', 'Vomiting', 'Hypoglycemia in diabetics'],
    notes: 'Takes 10-15 minutes to work'
  },

  // ===== GASTROINTESTINAL =====
  ondansetron: {
    name: 'Ondansetron',
    uaeBrandName: 'Zofran, Zofran MD',
    emtLevel: 'EMT-I',
    dose: '4mg IV/IM',
    route: ['IV', 'IM'],
    indication: 'Nausea, vomiting',
    contraindications: ['Prolonged QT interval'],
    sideEffects: ['Headache', 'Constipation'],
    notes: 'Can repeat once after 30 minutes'
  },
  metoclopramide: {
    name: 'Metoclopramide',
    uaeBrandName: 'Primperan',
    emtLevel: 'EMT-I',
    dose: '10mg IV/IM',
    route: ['IV', 'IM'],
    indication: 'Nausea, vomiting',
    contraindications: ['GI obstruction', 'Perforation', 'Parkinsonism'],
    sideEffects: ['Dystonia', 'Drowsiness', 'Diarrhea'],
    notes: 'Caution in young adults (dystonia risk)'
  },

  // ===== TRAUMA & SURGICAL =====
  txa: {
    name: 'Tranexamic Acid',
    uaeBrandName: 'Cyklokapron',
    emtLevel: 'EMT-I',
    dose: '1g IV over 10 min',
    route: ['IV'],
    indication: 'Major trauma within 3 hours of injury',
    contraindications: ['Active clotting disorder', 'History of VTE', 'Renal failure'],
    sideEffects: ['Nausea', 'Diarrhea', 'DVT'],
    notes: 'Administer within 3 hours of injury'
  },
  hydrocortisone: {
    name: 'Hydrocortisone',
    uaeBrandName: 'Solu-Cortef, Efcortelan',
    emtLevel: 'EMT-I',
    dose: '100-200mg IV',
    route: ['IV'],
    indication: 'Asthma exacerbation, anaphylaxis, adrenal crisis',
    contraindications: ['Fungal infection', 'Live vaccine (recent)'],
    sideEffects: ['Hyperglycemia', 'Fluid retention'],
    notes: 'Adjunct therapy for asthma'
  },

  // ===== ACP ONLY MEDICATIONS =====
  ketamine: {
    name: 'Ketamine',
    uaeBrandName: 'Ketalar',
    emtLevel: 'ACP',
    dose: '1-2mg/kg IV/IM for sedation',
    route: ['IV', 'IM'],
    indication: 'Procedural sedation, rapid sequence intubation',
    contraindications: ['Schizophrenia', 'Severe hypertension', 'Pregnancy (trimester 1)'],
    sideEffects: ['Emergence reactions', 'Hypertension', 'Apnea'],
    notes: 'Maintains airway reflexes and respiratory drive'
  },
  etomidate: {
    name: 'Etomidate',
    uaeBrandName: 'Amidate',
    emtLevel: 'ACP',
    dose: '0.3mg/kg IV',
    route: ['IV'],
    indication: 'Rapid sequence intubation induction',
    contraindications: ['None in RSI context'],
    sideEffects: ['Myoclonus', 'Nausea', 'Adrenal suppression'],
    notes: 'Hemodynamically stable induction'
  },
  rocuronium: {
    name: 'Rocuronium',
    uaeBrandName: 'Esmeron',
    emtLevel: 'ACP',
    dose: '1mg/kg IV',
    route: ['IV'],
    indication: 'Rapid sequence intubation paralysis',
    contraindications: ['None in RSI context with sedation'],
    sideEffects: ['Prolonged paralysis in renal failure'],
    notes: 'Must be used with sedation'
  },
  magnesium_sulfate: {
    name: 'Magnesium Sulfate',
    uaeBrandName: 'Magnesium Sulfate',
    emtLevel: 'ACP',
    dose: '2g IV over 15 minutes',
    route: ['IV'],
    indication: 'Severe asthma, torsades de pointes, eclampsia',
    contraindications: ['Renal failure', 'Heart block'],
    sideEffects: ['Flushing', 'Hypotension', 'Respiratory depression'],
    notes: 'Monitor for respiratory depression'
  },

  // ===== EMERGENCY DRUGS =====
  atropine: {
    name: 'Atropine',
    uaeBrandName: 'Atropine',
    emtLevel: 'EMT-B',
    dose: '0.5mg IV/IO (bradycardia), 3mg IV/IO/ET (asystole)',
    route: ['IV', 'IO', 'ET'],
    indication: 'Symptomatic bradycardia, organophosphate poisoning',
    contraindications: ['Glaucoma', 'Tachycardia', 'AV block (second/third degree)'],
    sideEffects: ['Tachycardia', 'Dry mouth', 'Mydriasis', 'Delirium'],
    notes: '0.5mg for bradycardia, 3mg for asystole/PEA'
  },
  charcoal: {
    name: 'Activated Charcoal',
    uaeBrandName: 'Actidose Aqua',
    emtLevel: 'EMT-B',
    dose: '50g PO',
    route: ['PO'],
    indication: 'Toxin ingestion within 1 hour',
    contraindications: ['Unconscious', 'Corrosive ingestion', 'Hydrocarbon ingestion'],
    sideEffects: ['Black stool', 'Vomiting', 'Aspiration risk'],
    notes: 'Only if within 1 hour of ingestion'
  },

  // ===== FLUIDS =====
  normal_saline: {
    name: 'Normal Saline (0.9% Sodium Chloride)',
    uaeBrandName: 'NS',
    emtLevel: 'EMT-B',
    dose: '500-1000mL IV bolus, titrate',
    route: ['IV'],
    indication: 'Hypovolemia, dehydration, shock',
    contraindications: ['Fluid overload', 'Heart failure (caution)'],
    sideEffects: ['Fluid overload', 'Edema'],
    notes: 'Crystalloid of choice for most resuscitation'
  },
  ringer_lactate: {
    name: 'Ringer\'s Lactate',
    uaeBrandName: 'Hartmann\'s',
    emtLevel: 'EMT-B',
    dose: '500-1000mL IV bolus',
    route: ['IV'],
    indication: 'Hypovolemia, burns, trauma',
    contraindications: ['Liver failure', 'Hyperkalemia'],
    sideEffects: ['Fluid overload'],
    notes: 'Avoid in liver failure'
  },
  plasma_lyte: {
    name: 'Plasma-Lyte 148',
    uaeBrandName: 'Plasma-Lyte',
    emtLevel: 'EMT-I',
    dose: '500-1000mL IV',
    route: ['IV'],
    indication: 'Hypovolemia, trauma resuscitation',
    contraindications: ['Hyperkalemia'],
    sideEffects: ['Fluid overload'],
    notes: 'Balanced crystalloid'
  },
};

// Get medications by EMT level
export const getMedicationsByLevel = (level: 'EMT-B' | 'EMT-I' | 'ACP'): UAEMedication[] => {
  if (level === 'ACP') return Object.values(uaeMedications);
  if (level === 'EMT-I') {
    return Object.values(uaeMedications).filter(
      med => med.emtLevel === 'EMT-B' || med.emtLevel === 'EMT-I'
    );
  }
  return Object.values(uaeMedications).filter(med => med.emtLevel === 'EMT-B');
};

// Get medication by name
export const getMedication = (name: string): UAEMedication | undefined => {
  return uaeMedications[name];
};

// UAE-specific vital sign reference ranges
export const uaeVitalSignRanges = {
  adult: {
    pulse: { normal: [60, 100], tachycardic: [100, 200], bradycardic: [0, 60] },
    bp: { normal: [90, 140], hypotensive: [0, 90], hypertensive: [140, 250] },
    resp: { normal: [12, 20], tachypneic: [20, 60], bradypneic: [0, 10] },
    spo2: { normal: [96, 100], hypoxic: [0, 94] },
    temp: { normal: [36.1, 37.2], febrile: [37.3, 42], hypothermic: [32, 36] },
    gcs: { normal: 15 },
  },
  pediatric: {
    pulse: { normal: [80, 140], tachycardic: [140, 250], bradycardic: [0, 80] },
    bp: { normal: [80, 110], hypotensive: [0, 80], hypertensive: [110, 140] },
    resp: { normal: [20, 30], tachypneic: [30, 70], bradypneic: [0, 15] },
    spo2: { normal: [96, 100], hypoxic: [0, 94] },
    temp: { normal: [36.5, 37.5], febrile: [37.6, 42], hypothermic: [32, 36.4] },
  },
  elderly: {
    pulse: { normal: [60, 90], tachycardic: [90, 150], bradycardic: [0, 60] },
    bp: { normal: [100, 160], hypotensive: [0, 100], hypertensive: [160, 250] },
    resp: { normal: [12, 22], tachypneic: [22, 45], bradypneic: [0, 10] },
    spo2: { normal: [94, 98], hypoxic: [0, 94] },
    temp: { normal: [35.5, 36.8], febrile: [36.9, 42], hypothermic: [32, 35.4] },
  },
};
