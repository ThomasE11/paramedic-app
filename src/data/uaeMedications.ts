/**
 * UAE Paramedic Medications Database
 *
 * Comprehensive list of medications available to UAE paramedics
 * Includes: indications, dosages, contraindications, side effects, and teaching points
 *
 * Reference: UAE Ministry of Health - Prehospital Emergency Care Protocols
 */

export interface UAEMedication {
  id: string;
  genericName: string;
  tradeNames: string[];
  class: string;
  indications: string[];
  contraindications: string[];
  precautions: string[];
  adultDose: {
    route: string;
    dose: string;
    maxDose?: string;
    frequency?: string;
  }[];
  pediatricDose?: {
    route: string;
    dose: string;
  }[];
  onset: string;
  duration: string;
  sideEffects: string[];
  interactions: string[];
  pregnancyCategory: string;
  uaeSpecific: {
    available: boolean;
    scopeLevel: 'basic' | 'intermediate' | 'advanced' | 'critical-care';
    protocolNotes?: string[];
  };
  teachingPoints: string[];
  commonErrors: string[];
}

export const uaeMedications: UAEMedication[] = [
  // ============================================================================
  // RESPIRATORY MEDICATIONS
  // ============================================================================

  {
    id: 'med-salbutamol',
    genericName: 'Salbutamol (Albuterol)',
    tradeNames: ['Ventolin', 'ProAir', 'Proventil'],
    class: 'Bronchodilator (Short-acting Beta2-Agonist)',
    indications: [
      'Acute bronchospasm (asthma, COPD)',
      'Wheezing in respiratory distress',
      'Severe allergic reactions with bronchospasm'
    ],
    contraindications: [
      'Hypersensitivity to salbutamol or sympathomimetic amines'
    ],
    precautions: [
      'Cardiovascular disease (tachycardia, arrhythmias)',
      'Hypertension',
      'Diabetes (may cause hyperglycemia)',
      'Hypokalemia'
    ],
    adultDose: [
      {
        route: 'Nebulized',
        dose: '2.5-5mg (2.5mg in 2.5mL NS)',
        maxDose: '5mg per dose',
        frequency: 'Repeat every 15-20 minutes if needed'
      },
      {
        route: 'MDI with spacer',
        dose: '4-8 puffs (100mcg each)',
        frequency: 'Every 20 minutes as needed'
      }
    ],
    onset: '5 minutes (nebulized), 1-2 minutes (MDI)',
    duration: '4-6 hours',
    sideEffects: [
      'Tachycardia',
      'Tremor',
      'Palpitations',
      'Headache',
      'Hypokalemia',
      'Nervousness'
    ],
    interactions: [
      'Beta-blockers (decrease effectiveness)',
      'Other sympathomimetics (additive effects)',
      'Digoxin (hypokalemia increases digoxin toxicity)',
      'Diuretics (hypokalemia risk)'
    ],
    pregnancyCategory: 'C',
    uaeSpecific: {
      available: true,
      scopeLevel: 'basic',
      protocolNotes: [
        'First-line for acute bronchospasm',
        'Can combine with ipratropium for severe cases',
        'Monitor for tachycardia and tremors'
      ]
    },
    teachingPoints: [
      'Always combine with ipratropium for severe asthma exacerbations',
      'Tremor and tachycardia are expected side effects',
      'Reassess breath sounds after administration',
      'Consider cardiac cause if wheezing resolves but patient still unstable',
      'MDI with spacer is equivalent to nebulization in mild-moderate cases'
    ],
    commonErrors: [
      'Not reassessing lung sounds after administration',
      'Missing hypokalemia in diabetic patients',
      'Overlooking cardiac causes of wheezing',
      'Not using spacer with MDI (reduces effectiveness by 80%)'
    ]
  },

  {
    id: 'med-ipratropium',
    genericName: 'Ipratropium Bromide',
    tradeNames: ['Atrovent'],
    class: 'Anticholinergic Bronchodilator',
    indications: [
      'Acute bronchospasm (asthma, COPD)',
      'Used in combination with salbutamol',
      'COPD exacerbations'
    ],
    contraindications: [
      'Hypersensitivity to ipratropium or atropine derivatives',
      'Acute angle-closure glaucoma (nebulized may worsen)'
    ],
    precautions: [
      'Prostatic hypertrophy (may cause urinary retention)',
      'Narrow-angle glaucoma',
      'Bladder outlet obstruction'
    ],
    adultDose: [
      {
        route: 'Nebulized',
        dose: '0.5mg (500mcg in 2.5mL NS)',
        frequency: 'Every 4-6 hours as needed'
      },
      {
        route: 'MDI',
        dose: '2-4 puffs (17mcg per puff)',
        frequency: 'Every 6 hours as needed'
      }
    ],
    onset: '15-30 minutes (slower than salbutamol)',
    duration: '4-6 hours',
    sideEffects: [
      'Dry mouth',
      'Urinary retention',
      'Blurred vision (if eye exposure)',
      'Tachycardia (paradoxical)',
      'Cough (nebulized)'
    ],
    interactions: [
      'Other anticholinergics (additive effects)',
      'Beta-agonists (complementary effects)'
    ],
    pregnancyCategory: 'B',
    uaeSpecific: {
      available: true,
      scopeLevel: 'basic',
      protocolNotes: [
        'Often combined with salbutamol (Combivent/Duoneb)',
        'Especially useful in COPD exacerbations'
      ]
    },
    teachingPoints: [
      'Slower onset than salbutamol but longer-lasting bronchodilation',
      'Especially effective in COPD',
      'May cause paradoxical bronchospasm in some patients',
      'Protect patient\'s eyes from nebulized mist',
      'Assess for urinary retention in elderly males'
    ],
    commonErrors: [
      'Not combining with salbutamol for acute exacerbations',
      'Not protecting eyes from nebulizer mist',
      'Expecting rapid onset like salbutamol',
      'Missing urinary retention in elderly males'
    ]
  },

  // ============================================================================
  // CARDIOVASCULAR MEDICATIONS
  // ============================================================================

  {
    id: 'med-aspirin',
    genericName: 'Aspirin (Acetylsalicylic Acid)',
    tradeNames: ['Aspirin', 'Ecotrin'],
    class: 'Antiplatelet',
    indications: [
      'Acute coronary syndrome (chest pain suggestive of MI)',
      'Suspected STEMI or NSTEMI',
      'Unstable angina'
    ],
    contraindications: [
      'Active gastrointestinal bleeding',
      'Known aspirin allergy or salicylate sensitivity',
      'Severe thrombocytopenia',
      'Active peptic ulcer disease'
    ],
    precautions: [
      'Asthma with aspirin sensitivity (ASA-induced asthma)',
      'Bleeding disorders',
      'Pregnancy (third trimester)',
      'Severe renal or hepatic impairment'
    ],
    adultDose: [
      {
        route: 'Oral (chewed)',
        dose: '300mg (or 325mg)',
        frequency: 'Single dose for ACS'
      }
    ],
    onset: '5-30 minutes (chewed)',
    duration: 'Irreversible platelet inhibition (7-10 days)',
    sideEffects: [
      'Gastrointestinal irritation',
      'Bleeding',
      'Bronchospasm (in sensitive patients)',
      'Tinnitus (toxicity)',
      'Rash'
    ],
    interactions: [
      'NSAIDs (increased bleeding risk)',
      'Anticoagulants (increased bleeding)',
      'Corticosteroids (increased GI bleeding)',
      'Alcohol (increased GI irritation)'
    ],
    pregnancyCategory: 'D (third trimester), C (first and second)',
    uaeSpecific: {
      available: true,
      scopeLevel: 'basic',
      protocolNotes: [
        'MUST be chewed for rapid absorption in ACS',
        'Give immediately if chest pain suspicious for cardiac origin',
        'Document time of administration'
      ]
    },
    teachingPoints: [
      'MUST be chewed - not swallowed whole',
      'Never delay giving for suspected cardiac chest pain',
      'Ask about aspirin allergy (different from NSAID allergy)',
      'Document time given - important for hospital',
      'ASA-induced asthma occurs in ~10% of adult asthmatics'
    ],
    commonErrors: [
      'Having patient swallow instead of chew',
      'Not giving immediately for suspected ACS',
      'Confusing NSAID allergy with aspirin allergy',
      'Not documenting time of administration'
    ]
  },

  {
    id: 'med-nitroglycerin',
    genericName: 'Nitroglycerin (Glyceryl Trinitrate)',
    tradeNames: ['Nitrostat', 'Nitrolingual'],
    class: 'Vasodilator (Nitrates)',
    indications: [
      'Acute cardiac chest pain',
      'Suspected ACS/AMI',
      'Acute pulmonary edema (cardiogenic)'
    ],
    contraindications: [
      'Systolic BP <90 mmHg',
      'Right ventricular infarction',
      'Use of phosphodiesterase inhibitors (Viagra, Cialis) within 24-48 hours',
      'Severe anemia',
      'Closed-angle glaucoma',
      'Hypertrophic cardiomyopathy'
    ],
    precautions: [
      'Hypotension',
      'Recent use of PDE5 inhibitors',
      'Inferior MI (possible RV involvement)',
      'Cerebrovascular disease'
    ],
    adultDose: [
      {
        route: 'Sublingual tablet/spray',
        dose: '0.4mg (1 tablet or 1 spray)',
        maxDose: '3 doses at 5-minute intervals',
        frequency: 'Every 5 minutes as needed for pain'
      }
    ],
    onset: '1-3 minutes (sublingual)',
    duration: '30 minutes',
    sideEffects: [
      'Headache (very common)',
      'Hypotension',
      'Tachycardia (reflex)',
      'Dizziness',
      'Flushing'
    ],
    interactions: [
      'PDE5 inhibitors (severe hypotension)',
      'Other antihypertensives (additive)',
      'Alcohol (increased hypotension)',
      'Sildenafil (within 24h), Tadalafil (within 48h)'
    ],
    pregnancyCategory: 'C',
    uaeSpecific: {
      available: true,
      scopeLevel: 'basic',
      protocolNotes: [
        'Check BP before each dose - SBP must be ≥90',
        'NOT for inferior MI until RV infarct ruled out',
        'May repeat up to 3 times if pain persists and BP adequate'
      ]
    },
    teachingPoints: [
      'ALWAYS check BP before administration',
      'SBP must be ≥90 mmHg to give',
      'Do NOT give in inferior MI (may cause severe hypotension)',
      'Ask about erectile dysfunction medications (Viagra/Cialis)',
      'Headache is expected side effect',
      'Have patient sit down before giving'
    ],
    commonErrors: [
      'Not checking BP before giving',
      'Giving for inferior MI without ruling out RV infarction',
      'Not asking about PDE5 inhibitors',
      'Not reassessing pain and BP between doses',
      'Allowing patient to stand while taking (fall risk)'
    ]
  },

  {
    id: 'med-adrenaline',
    genericName: 'Adrenaline (Epinephrine)',
    tradeNames: ['EpiPen', 'Adrenalin'],
    class: 'Sympathomimetic (Catecholamine)',
    indications: [
      'Anaphylaxis',
      'Cardiac arrest (VF/pVT, asystole, PEA)',
      'Severe asthma (nebulized)',
      'Croup (nebulized)'
    ],
    contraindications: [
      'NONE in cardiac arrest',
      'Relative: Severe hypertension, tachyarrhythmias (in non-arrest situations)'
    ],
    precautions: [
      'Cardiovascular disease',
      'Hypertension',
      'Diabetes',
      'Narrow-angle glaucoma',
      'Pregnancy (use if life-threatening)'
    ],
    adultDose: [
      {
        route: 'IM (anaphylaxis)',
        dose: '0.3-0.5mg (0.3-0.5mL of 1:1000)',
        maxDose: '0.5mg per dose',
        frequency: 'Repeat every 5-15 minutes if needed'
      },
      {
        route: 'IV (cardiac arrest)',
        dose: '1mg (10mL of 1:10,000)',
        frequency: 'Every 3-5 minutes in cardiac arrest'
      },
      {
        route: 'Nebulized (asthma/croup)',
        dose: '0.5mg/kg (max 5mg) in 3-4mL NS',
        frequency: 'Single dose'
      }
    ],
    onset: 'IM: 5-10 minutes, IV: immediate, Nebulized: 5-15 minutes',
    duration: 'IM: 20-60 minutes, IV: 5-10 minutes',
    sideEffects: [
      'Tachycardia',
      'Hypertension',
      'Anxiety',
      'Tremor',
      'Headache',
      'Hyperglycemia',
      'Hypokalemia'
    ],
    interactions: [
      'Beta-blockers (may inhibit effects, cause severe hypertension)',
      'Digoxin (increased arrhythmia risk)',
      'MAOIs (increased pressor effects)',
      'Tricyclic antidepressants (increased pressor effects)'
    ],
    pregnancyCategory: 'C',
    uaeSpecific: {
      available: true,
      scopeLevel: 'basic',
      protocolNotes: [
        'IM for anaphylaxis: 1:1000 concentration',
        'IV for cardiac arrest: 1:10,000 concentration',
        'Auto-injectors (EpiPen) contain 0.3mg'
      ]
    },
    teachingPoints: [
      'CRITICAL: Different concentrations (1:1000 vs 1:10,000)',
      'IM dose uses 1:1000, IV dose uses 1:10,000',
      'IV adrenaline in cardiac arrest: 1mg = 10mL of 1:10,000',
      'IM for anaphylaxis: 0.3-0.5mg = 0.3-0.5mL of 1:1000',
      'Auto-injectors contain 1:1000 concentration',
      'For asthma, combine with salbutamol and ipratropium'
    ],
    commonErrors: [
      'Confusing 1:1000 and 1:10,000 concentrations',
      'Giving wrong dose (IV vs IM)',
      'Not giving early in anaphylaxis',
      'Forgetting auto-injectors contain 1:1000',
      'Withholding adrenaline in severe asthma exacerbations'
    ]
  },

  // ============================================================================
  // METABOLIC/ENDOCRINE MEDICATIONS
  // ============================================================================

  {
    id: 'med-glucagon',
    genericName: 'Glucagon',
    tradeNames: ['GlucaGen', 'Glucagon Emergency Kit'],
    class: 'Hyperglycemic Agent',
    indications: [
      'Severe hypoglycemia (unresponsive, unable to swallow)',
      'Hypoglycemia where IV access not available',
      'Beta-blocker overdose (off-label, may help)'
    ],
    contraindications: [
      'Pheochromocytoma',
      'Insulinoma',
      'Known hypersensitivity to glucagon'
    ],
    precautions: [
      'May be less effective in patients with depleted glycogen stores',
      'Alcohol-induced hypoglycemia (glycogen depleted)',
      'Pregnancy',
      'Breastfeeding'
    ],
    adultDose: [
      {
        route: 'IM, SC, or IV',
        dose: '1mg (1 unit)',
        frequency: 'May repeat once in 15 minutes if no response'
      }
    ],
    onset: '5-15 minutes (IM/SC), 1-2 minutes (IV)',
    duration: '60-90 minutes',
    sideEffects: [
      'Nausea',
      'Vomiting',
      'Hypoglycemia rebound',
      'Allergic reactions'
    ],
    interactions: [
      'Beta-blockers (may attenuate hyperglycemic effect)',
      'Warfarin (increased anticoagulation)',
      'Insulin (antagonistic effects)'
    ],
    pregnancyCategory: 'B',
    uaeSpecific: {
      available: true,
      scopeLevel: 'basic',
      protocolNotes: [
        'Use when IV access not available for severe hypoglycemia',
        'May cause vomiting - protect airway',
        'Follow with oral carbohydrate once patient awakens'
      ]
    },
    teachingPoints: [
      'Second-line for hypoglycemia (after IV dextrose)',
      'Used when IV access cannot be obtained',
      'May not work if patient has depleted glycogen stores (alcoholics, starvation)',
      'Be prepared for vomiting - have suction ready',
      'Patient must be able to swallow after awakening to prevent re-hypoglycemia'
    ],
    commonErrors: [
      'Using as first-line for hypoglycemia (IV dextrose preferred)',
      'Not having oral carbohydrate ready after patient awakens',
      'Not recognizing when it won\'t work (glycogen depletion)',
      'Not protecting airway from vomiting'
    ]
  },

  {
    id: 'med-dextrose',
    genericName: 'Dextrose (Glucose)',
    tradeNames: ['D50', 'D10', 'D25'],
    class: 'Carbohydrate (Sugar)',
    indications: [
      'Hypoglycemia',
      'Altered mental status with blood glucose <3.5 mmol/L',
      'Unconsciousness with unknown cause (after glucose check)'
    ],
    contraindications: [
      'Hyperglycemia',
      'Known diabetes with high blood glucose (unless confirmed hypoglycemia)'
    ],
    precautions: [
      'Extravasation can cause tissue damage',
      'Monitor blood glucose after administration',
      'Use with caution in renal impairment',
      'Avoid in patients with hyperosmolar states'
    ],
    adultDose: [
      {
        route: 'IV push',
        dose: '10-25g (20-50mL of D50W)',
        frequency: 'Repeat based on blood glucose and mental status'
      },
      {
        route: 'IV infusion',
        dose: 'D5W or D10W for maintenance'
      }
    ],
    onset: 'Immediate',
    duration: 'Variable (depends on patient metabolism)',
    sideEffects: [
      'Hyperglycemia',
      'Phlebitis (IV)',
      'Tissue necrosis if extravasation',
      'Fluid overload'
    ],
    interactions: [
      'None significant'
    ],
    pregnancyCategory: 'B',
    uaeSpecific: {
      available: true,
      scopeLevel: 'basic',
      protocolNotes: [
        'D50W commonly used: 50g in 100mL',
        'Always confirm hypoglycemia before administration',
        'Recheck blood glucose after administration'
      ]
    },
    teachingPoints: [
      'ALWAYS confirm hypoglycemia before giving (unless patient unconscious and glucometer unavailable)',
      'Recheck blood glucose 15 minutes after administration',
      'D50W is 50g glucose in 100mL water (50% solution)',
      'Extravasation causes tissue damage - use secure IV',
      'Consider food intake after patient is alert enough to swallow safely'
    ],
    commonErrors: [
      'Not confirming hypoglycemia before giving',
      'Not rechecking blood glucose after administration',
      'Missing that hyperglycemia can also cause AMS',
      'Using without securing IV properly',
      'Forgetting to feed patient after they wake up'
    ]
  },

  // ============================================================================
  // ANALGESICS
  // ============================================================================

  {
    id: 'med-morphine',
    genericName: 'Morphine Sulfate',
    tradeNames: ['MS Contin', 'Duramorph', 'Astramorph'],
    class: 'Opioid Analgesic',
    indications: [
      'Severe pain (ACS, trauma, burns)',
      'Acute pulmonary edema (vasodilation reduces preload)',
      'MI-related pain'
    ],
    contraindications: [
      'Hypersensitivity to morphine',
      'Respiratory depression',
      'Status asthmaticus',
      'Acute alcoholism',
      'Head injury (increases ICP, masks mental status)',
      'Hypotension (SBP <90)'
    ],
    precautions: [
      'Hypovolemia',
      'Renal or hepatic impairment',
      'Elderly',
      'Pregnancy',
      'Breastfeeding',
      'Bowel obstruction',
      'Bradycardia',
      'Right ventricular infarct'
    ],
    adultDose: [
      {
        route: 'IV slow push',
        dose: '2-4mg',
        maxDose: '10-20mg total',
        frequency: 'Repeat every 5-10 minutes as needed'
      },
      {
        route: 'IM',
        dose: '5-10mg',
        frequency: 'Every 2-4 hours as needed'
      }
    ],
    onset: 'IV: 5 minutes, IM: 15-30 minutes',
    duration: 'IV: 4-5 hours, IM: 3-4 hours',
    sideEffects: [
      'Respiratory depression',
      'Hypotension',
      'Bradycardia',
      'Nausea/vomiting',
      'Constipation',
      'Sedation',
      'Urinary retention',
      'Histamine release (itching, flushing)'
    ],
    interactions: [
      'CNS depressants (additive sedation/respiratory depression)',
      'MAOIs (possible hyperpyretic crisis)',
      'Alcohol (enhanced CNS depression)',
      'Anticholinergics (additive urinary retention/constipation)'
    ],
    pregnancyCategory: 'C',
    uaeSpecific: {
      available: true,
      scopeLevel: 'intermediate',
      protocolNotes: [
        'Use small doses (2-4mg) and titrate',
        'Monitor BP closely (may cause hypotension)',
        'NOT for head injury patients',
        'Use with caution in inferior MI (possible RV involvement)'
      ]
    },
    teachingPoints: [
      'Titrate to effect - start low, go slow',
      'Watch for respiratory depression',
      'Monitor BP before and after administration',
      'Naloxone available for respiratory depression',
      'Consider RV infarct in inferior MI - may be preload dependent',
      'Histamine release causes itching and flushing (not true allergy)'
    ],
    commonErrors: [
      'Giving too much too fast',
      'Not monitoring respiratory status',
      'Not watching BP carefully',
      'Using in head injury',
      'Not having naloxone available',
      'Missing RV infarct in inferior MI'
    ]
  },

  {
    id: 'med-fentanyl',
    genericName: 'Fentanyl Citrate',
    tradeNames: ['Sublimaze', 'Actiq', 'Duragesic'],
    class: 'Opioid Analgesic (Synthetic)',
    indications: [
      'Severe pain',
      'Procedural pain (splinting, packaging)',
      'Patients where morphine contraindicated (asthma, hypotension)',
      'Cardiac chest pain'
    ],
    contraindications: [
      'Hypersensitivity to fentanyl',
      'Severe respiratory depression',
      'Concurrent use of MAOIs',
      'Severe COPD without mechanical support'
    ],
    precautions: [
      'Head injury',
      'Bradycardia',
      'Renal/hepatic impairment',
      'Elderly or debilitated',
      'Pregnancy',
      'Breastfeeding'
    ],
    adultDose: [
      {
        route: 'IV slow push',
        dose: '25-50mcg (0.025-0.05mg)',
        maxDose: '100mcg per dose',
        frequency: 'Repeat every 5-10 minutes as needed'
      },
      {
        route: 'IN (intranasal)',
        dose: '50-100mcg per nostril',
        frequency: 'Every 10-15 minutes'
      },
      {
        route: 'Transmucosal (lozenge)',
        dose: '200-400mcg',
        frequency: 'Every 15-20 minutes'
      }
    ],
    onset: 'IV: immediate, IN: 5-10 minutes, Transmucosal: 5-15 minutes',
    duration: 'IV: 30-60 minutes, IN/Transmucosal: 1-2 hours',
    sideEffects: [
      'Respiratory depression',
      'Bradycardia',
      'Chest wall rigidity (with rapid IV push)',
      'Hypotension',
      'Nausea/vomiting',
      'Sedation'
    ],
    interactions: [
      'CNS depressants (additive effects)',
      'MAOIs (possible hyperpyretic crisis)',
      'CYP3A4 inhibitors (increased effects)',
      'Alcohol (enhanced CNS depression)'
    ],
    pregnancyCategory: 'C',
    uaeSpecific: {
      available: true,
      scopeLevel: 'intermediate',
      protocolNotes: [
        '80-100x more potent than morphine',
        'Less histamine release than morphine',
        'Does NOT cause histamine-related hypotension',
        'Preferred in asthmatic and hemodynamically unstable patients'
      ]
    },
    teachingPoints: [
      'Extremely potent - 100x morphine',
      'Less hypotension than morphine (no histamine release)',
      'Good choice for patients with asthma or hemodynamic instability',
      'Chest wall rigidity can occur with rapid IV push',
      'Naloxone dose: 0.04-0.4mg (smaller doses needed)',
      'Transmucosal and IN routes useful when IV access unavailable'
    ],
    commonErrors: [
      'Treating like morphine (doses are much smaller)',
      'Giving full naloxone dose for reversal (use micro-doses)',
      'Not recognizing chest wall rigidity with rapid push',
      'Using full morphine-equivalent doses',
      'Not available in all UAE services'
    ]
  },

  {
    id: 'med-paracetamol',
    genericName: 'Paracetamol (Acetaminophen)',
    tradeNames: ['Panadol', 'Tylenol', 'Perfalgan'],
    class: 'Analgesic/Antipyretic',
    indications: [
      'Mild to moderate pain',
      'Fever',
      'Adjunct to opioid analgesia (opioid-sparing effect)'
    ],
    contraindications: [
      'Severe liver disease',
      'Hypersensitivity to paracetamol'
    ],
    precautions: [
      'Hepatic impairment',
      'Alcoholism',
      'Chronic malnutrition',
      'Renal impairment',
      'Pregnancy (use lowest effective dose)'
    ],
    adultDose: [
      {
        route: 'PO',
        dose: '500-1000mg',
        maxDose: '4g per day',
        frequency: 'Every 4-6 hours'
      },
      {
        route: 'IV',
        dose: '1g (1000mg)',
        maxDose: '4g per day',
        frequency: 'Every 4-6 hours'
      }
    ],
    onset: 'PO: 30-60 minutes, IV: 5-10 minutes',
    duration: '4-6 hours',
    sideEffects: [
      'Rare: rash, blood dyscrasias at therapeutic doses',
      'Hepatotoxicity (overdose)',
      'Nausea, vomiting'
    ],
    interactions: [
      'Alcohol (increased hepatotoxicity)',
      'Warfarin (increased INR with chronic use)',
      'Carbamazepine (increased hepatotoxicity)',
      'Isoniazid (increased hepatotoxicity)'
    ],
    pregnancyCategory: 'B',
    uaeSpecific: {
      available: true,
      scopeLevel: 'basic',
      protocolNotes: [
        'Safe alternative to NSAIDs for most patients',
        'IV paracetamol available in hospital settings',
        'Max 4g per day - do not exceed',
        'Often combined with opioids for opioid-sparing effect'
      ]
    },
    teachingPoints: [
      'Safest analgesic for most patients including pregnant women',
      '4g daily maximum includes all sources (combination medications)',
      'IV form works faster than oral',
      'Opioid-sparing effect (reduces opioid needed)',
      'Overdose causes liver failure (antidote: N-acetylcysteine)',
      'Check all medications for hidden paracetamol to avoid overdose'
    ],
    commonErrors: [
      'Exceeding 4g daily limit',
      'Not checking combination medications for paracetamol content',
      'Not recognizing overdose symptoms',
      'Not using as first-line for mild pain',
      'Not using opioid-sparing benefits'
    ]
  },

  // ============================================================================
  // ANTIEMETICS
  // ============================================================================

  {
    id: 'metoclopramide',
    genericName: 'Metoclopramide',
    tradeNames: ['Reglan', 'Primperan'],
    class: 'Antiemitic (Prokinetic)',
    indications: [
      'Nausea and vomiting',
      'Migraine-associated nausea',
      'Gastric stasis',
      'Facilitates gastric tube placement'
    ],
    contraindications: [
      'GI obstruction',
      'Perforation',
      'Hemorrhage',
      'Pheochromocytoma',
      'History of seizures',
      'Parkinsonism',
      'Concurrent use with drugs that cause EPS (e.g., antipsychotics)'
    ],
    precautions: [
      'Elderly (increased EPS risk)',
      'Depression',
      'Hypertension',
      'Renal impairment',
      'Pregnancy',
      'Breastfeeding'
    ],
    adultDose: [
      {
        route: 'IV or IM',
        dose: '10mg',
        frequency: 'Every 6-8 hours as needed',
        maxDose: '40mg per day'
      }
    ],
    onset: 'IV: 1-3 minutes, IM: 10-15 minutes',
    duration: '4-6 hours',
    sideEffects: [
      'Extrapyramidal symptoms (EPS)',
      'Dystonia',
      'Akathisia',
      'Tardive dyskinesia (long-term)',
      'Drowsiness',
      'Diarrhea',
      'Hypotension or hypertension'
    ],
    interactions: [
      'Antipsychotics (additive EPS risk)',
      'MAOIs (hypertensive crisis)',
      'Digoxin (decreased absorption)',
      'Cyclosporine (increased levels)'
    ],
    pregnancyCategory: 'B',
    uaeSpecific: {
      available: true,
      scopeLevel: 'intermediate',
      protocolNotes: [
        'May cause EPS (dystonia) - have diphenhydramine available',
        'Contraindicated in bowel obstruction',
        'Prokinetic - increases gastric motility'
      ]
    },
    teachingPoints: [
      'May cause dystonia (EPS) - have Benadryl available',
      'Increases gastric motility - ensure bowel not obstructed',
      'Onset faster IV than IM',
      'Less sedating than ondansetron',
      'May cause restlessness (akathisia) which can be mistaken for anxiety',
      'Dose reduction needed in renal impairment'
    ],
    commonErrors: [
      'Not recognizing EPS/dystonia',
      'Using in bowel obstruction',
      'Not having diphenhydramine available for EPS',
      'Confusing akathisia with anxiety',
      'Not checking renal function for dosing'
    ]
  },

  {
    id: 'med-ondansetron',
    genericName: 'Ondansetron',
    tradeNames: ['Zofran', 'Zofran ODT'],
    class: 'Antiemetic (5-HT3 antagonist)',
    indications: [
      'Nausea and vomiting',
      'Chemotherapy-induced nausea',
      'Post-operative nausea',
      'Opioid-induced nausea',
      'Migraine-associated nausea'
    ],
    contraindications: [
      'Hypersensitivity to ondansetron or other 5-HT3 antagonists',
      'Concurrent use with apomorphine'
    ],
    precautions: [
      'QT prolongation',
      'Electrolyte abnormalities (hypokalemia, hypomagnesemia',
      'Heart failure',
      'Bradyarrhythmias',
      'Pregnancy (animal studies show risk)',
      'Liver impairment (dose reduction needed)',
      'Serotonin syndrome risk with other serotonergic drugs'
    ],
    adultDose: [
      {
        route: 'IV',
        dose: '4mg',
        maxDose: '16-24mg per day',
        frequency: 'Every 4-8 hours as needed'
      },
      {
        route: 'PO',
        dose: '8mg',
        maxDose: '24mg per day',
        frequency: 'Every 8-12 hours as needed'
      },
      {
        route: 'ODT (oral disintegrating tablet)',
        dose: '4-8mg',
        frequency: 'Every 8 hours as needed'
      }
    ],
    onset: 'IV: 2-5 minutes, PO/ODT: 30 minutes',
    duration: '4-8 hours',
    sideEffects: [
      'Headache',
      'Constipation or diarrhea',
      'Dizziness',
      'Fatigue',
      'QT prolongation',
      'Serotonin syndrome (rare)'
    ],
    interactions: [
      'QT-prolonging drugs (additive effect)',
      'Serotonergic drugs (serotonin syndrome)',
      'Apomorphine (contraindicated)',
      'Tramadol (increased serotonin, decreased seizure threshold)',
      'Carbamazepine (decreased ondansetron levels)',
      'Rifampin (decreased ondansetron levels)'
    ],
    pregnancyCategory: 'B',
    uaeSpecific: {
      available: true,
      scopeLevel: 'intermediate',
      protocolNotes: [
        'Effective for opioid-induced nausea',
        'Watch for QT prolongation with IV push',
        'Less sedating than other antiemetics'
      ]
    },
    teachingPoints: [
      'Highly effective for opioid and chemotherapy-induced nausea',
      'Minimal sedation compared to other antiemetics',
      'QT prolongation risk - push IV slowly',
      'Oral disintegrating tablets useful for vomiting patients',
      'Serotonin syndrome rare but possible with other serotonergic drugs',
      'Reduces dose in liver impairment to 4mg/day max'
    ],
    commonErrors: [
      'Pushing IV too fast (QT prolongation)',
      'Not recognizing serotonin syndrome risk',
      'Not reducing dose in liver impairment',
      'Using when metoclopramide would be more appropriate',
      'Missing drug interactions with serotonergic medications'
    ]
  },

  // ============================================================================
  // SEDATION/ANXIOLYTICS
  // ============================================================================

  {
    id: 'midazolam',
    genericName: 'Midazolam',
    tradeNames: ['Versed', 'Dormicum', 'Hypnovel'],
    class: 'Benzodiazepine',
    indications: [
      'Seizure management (status epilepticus)',
      'Procedural sedation',
      'Agitation/anxiety',
      'Alcohol withdrawal',
      'Pre-hospital RSI adjunct',
      'Behavioral emergencies'
    ],
    contraindications: [
      'Hypersensitivity to benzodiazepines',
      'Narrow-angle glaucoma',
      'Severe respiratory insufficiency',
      'Sleep apnea (severe)'
    ],
    precautions: [
      'Respiratory depression (risk increased with other CNS depressants)',
      'Hypotension',
      'Elderly (reduce dose)',
      'Renal or hepatic impairment',
      'Pregnancy (D)',
      'Breastfeeding',
      'Depression or suicidal ideation',
      'History of substance abuse'
    ],
    adultDose: [
      {
        route: 'IV',
        dose: '1-2.5mg',
        frequency: 'Titrate to effect, may repeat',
        maxDose: '5-10mg total (varies by indication)'
      },
      {
        route: 'IM',
        dose: '5-10mg',
        frequency: 'Every 30-60 minutes as needed'
      },
      {
        route: 'IN',
        dose: '5-10mg',
        frequency: 'Every 30-60 minutes'
      },
      {
        route: 'Buccal',
        dose: '5-10mg',
        frequency: 'For seizures, may repeat in 10 minutes'
      }
    ],
    onset: 'IV: 1-5 minutes, IM: 15-30 minutes, IN: 5-15 minutes, Buccal: 5-10 minutes',
    duration: 'IV: 1-2 hours, IM/IN/Buccal: 2-4 hours',
    sideEffects: [
      'Respiratory depression',
      'Hypotension',
      'Sedation',
      'Amnesia',
      'Confusion',
      'Paradoxical reaction (agitation, aggression)',
      'Ataxia'
    ],
    interactions: [
      'Other CNS depressants (additive sedation/respiratory depression)',
      'Cimetidine (increased midazolam levels)',
      'Erythromycin (increased midazolam levels)',
      'Opioids (increased sedation/respiratory depression)',
      'Probenecid (increased midazolam levels)'
    ],
    pregnancyCategory: 'D',
    uaeSpecific: {
      available: true,
      scopeLevel: 'intermediate',
      protocolNotes: [
        'Shorter duration than diazepam',
        'Water-soluble (can be given IM)',
        'Buccal/IN routes useful when IV access unavailable',
        'First-line for pre-hospital seizures'
      ]
    },
    teachingPoints: [
      'Titrate to effect - start low, go slow',
      'Have flumazenil available for reversal',
      'Paradoxical reactions possible (agitation instead of sedation)',
      'IN/Buccal routes useful for seizures when no IV',
      'Water soluble - can be given IM (unlike diazepam)',
      'Respiratory depression risk increases with opioids and alcohol'
    ],
    commonErrors: [
      'Not titrating slowly (oversedation)',
      'Not having flumazenil available',
      'Not recognizing paradoxical reactions',
      'Using in severe COPD without caution',
      'Forgetting IM/IN routes for seizures',
      'Combining with opioids without airway protection'
    ]
  },

  // ============================================================================
  // EMERGENCY CARDIAC MEDICATIONS
  // ============================================================================

  {
    id: 'med-amiodarone',
    genericName: 'Amiodarone',
    tradeNames: ['Cordarone', 'Pacerone'],
    class: 'Antiarrhythmic (Class III)',
    indications: [
      'VF/pVT cardiac arrest (refractory to shocks)',
      'Stable VT (with pulses)',
      'Atrial fibrillation with rapid ventricular response',
      'Other tachyarrhythmias'
    ],
    contraindications: [
      'Severe sinus node dysfunction',
      'Second- or third-degree AV block (without pacemaker)',
      'Bradycardia causing syncope',
      'Hypersensitivity to amiodarone or iodine'
    ],
    precautions: [
      'Hypotension',
      'Liver dysfunction',
      'Thyroid dysfunction',
      'Pregnancy',
      'Breastfeeding',
      'Electrolyte abnormalities',
      'Concurrent use of other QT-prolonging drugs'
    ],
    adultDose: [
      {
        route: 'IV/IO (cardiac arrest)',
        dose: '300mg diluted in 20mL D5W',
        frequency: 'May repeat with 150mg once in 3-5 minutes',
        maxDose: '2.2g in 24 hours'
      },
      {
        route: 'IV infusion (stable VT)',
        dose: '150mg over 10 minutes, then 1mg/min for 6 hours, then 0.5mg/min'
      }
    ],
    onset: 'IV: Minutes for antiarrhythmic effect',
    duration: 'Hours to days (long half-life)',
    sideEffects: [
      'Hypotension (with rapid IV push)',
      'Bradycardia',
      'QT prolongation',
      'Thyroid dysfunction (long-term)',
      'Pulmonary toxicity (long-term)',
      'Liver toxicity',
      'Photosensitivity',
      'Corneal deposits'
    ],
    interactions: [
      'QT-prolonging drugs (additive effects)',
      'Beta-blockers (additive bradycardia)',
      'Calcium channel blockers (additive bradycardia)',
      'Digoxin (increased digoxin levels)',
      'Warfarin (increased INR)',
      'Cyclosporine (increased levels)'
    ],
    pregnancyCategory: 'D',
    uaeSpecific: {
      available: true,
      scopeLevel: 'advanced',
      protocolNotes: [
        'Second-line in cardiac arrest after epinephrine and 3 shocks',
        'Dilute before IV push (causes hypotension if undiluted)',
        'Monitor for hypotension and bradycardia',
        'Do NOT use in polymorphic VT (torsades)'
      ]
    },
    teachingPoints: [
      'Dilute in D5W before IV push (causes severe hypotension if undiluted)',
      'Second-line after 3 shocks + epinephrine in cardiac arrest',
      'Do NOT use in torsades or polymorphic VT (may worsen)',
      'Long half-life - effects last days',
      'May cause bradycardia - have atropine available',
      'Do NOT use in amiodarone-induced torsades'
    ],
    commonErrors: [
      'Not diluting before IV push',
      'Using for polymorphic VT/torsades',
      'Using as first-line (should be after 3 shocks)',
      'Not recognizing hypotension from rapid push',
      'Not having atropine available for bradycardia'
    ]
  },

  {
    id: 'med-atropine',
    genericName: 'Atropine Sulfate',
    tradeNames: ['Atropine'],
    class: 'Anticholinergic',
    indications: [
      'Bradycardia with signs of hypoperfusion',
      'Bradycardia with SBP <90',
      'Symptomatic AV block (1st, 2nd, or 3rd degree with hemodynamic compromise)',
      'Organophosphate poisoning',
      'Cholinergic crisis',
      'Before suctioning (to prevent bradycardia)',
      'As adjunct to nebulized bronchodilators (reduces secretions)'
    ],
    contraindications: [
      'Narrow-angle glaucoma',
      'Hypersensitivity to atropine or belladonna alkaloids',
      'Tachyarrhythmias',
      'Heart failure in ischemic heart disease'
    ],
    precautions: [
      'Down syndrome (increased sensitivity)',
      'Fever (may inhibit sweating)',
      'Hiatal hernia (may worsen reflux)',
      'Prostatic hypertrophy (urinary retention)',
      'Pregnancy (C)',
      'Breastfeeding',
      'Autonomic neuropathy'
    ],
    adultDose: [
      {
        route: 'IV slow push',
        dose: '0.5mg',
        maxDose: '3mg total (for bradycardia)',
        frequency: 'Repeat every 3-5 minutes as needed'
      },
      {
        route: 'ET (endotracheal)',
        dose: '1-2mg diluted in 10mL NS',
        frequency: 'May repeat once'
      }
    ],
    onset: 'IV: immediate, ET: variable',
    duration: 'IV: 2-4 hours, ET: unknown',
    sideEffects: [
      'Tachycardia',
      'Dry mouth',
      'Urinary retention',
      'Blurred vision',
      'Photophobia',
      'Flushing',
      'Hyperthermia (inhibits sweating)',
      'Delirium (especially in elderly)',
      'Mydriasis (dilated pupils)'
    ],
    interactions: [
      'Other anticholinergics (additive effects)',
      'Ketorolac (increased anticholinergic toxicity)',
      'Digoxin (may potentiate bradycardia then AV block)',
      'Potassium-depleting diuretics (increased digoxin sensitivity)'
    ],
    pregnancyCategory: 'C',
    uaeSpecific: {
      available: true,
      scopeLevel: 'basic',
      protocolNotes: [
        '0.5mg initial dose for bradycardia',
        'Maximum 3mg for asystole or slow bradycardia',
        'Use with caution in ischemic heart disease',
        'Consider ischemia as cause of bradycardia'
      ]
    },
    teachingPoints: [
      '0.5mg is the starting dose (not 1mg)',
      'Start low, titrate to effect',
      'May worsen ischemia in cardiac ischemia (increases myocardial O2 demand)',
      'Don\'t give immediately for MI-related bradycardia',
      'Watch for urinary retention in elderly males',
      'Can cause "atropine psychosis" in elderly (delirium)',
      'ET dose: 2-3x IV dose'
    ],
    commonErrors: [
      'Starting with 1mg (too much initially)',
      'Giving for all bradycardia (may worsen ischemia)',
      'Not recognizing urinary retention',
      'Not adjusting dose for ET administration',
      'Causing delirium in elderly',
      'Not reassessing after initial dose'
    ]
  }
];

// ============================================================================
// MEDICATION CALCULATION AIDS
// ============================================================================

export const medicationCalculations = {
  weightBasedDosing: (weightKg: number, doseMgKg: number) => {
    const dose = weightKg * doseMgKg;
    return {
      totalDose: `${dose.toFixed(1)}mg`,
      formula: `${weightKg}kg × ${doseMgKg}mg/kg = ${dose.toFixed(1)}mg`
    };
  },

  ibw: (heightInches: number, gender: 'male' | 'female') => {
    // Ideal Body Weight using Devine formula
    const baseWeight = gender === 'male' ? 50 : 45.5;
    const heightOver5Feet = heightInches - 60;
    const ibw = baseWeight + 2.3 * heightOver5Feet;
    return {
      ibwKg: Math.round(ibw),
      ibwLb: Math.round(ibw * 2.2)
    };
  },

  bsa: (weightKg: number, heightCm: number) => {
    // Body Surface Area using Mosteller formula
    const bsa = Math.sqrt((heightCm * weightKg) / 3600);
    return {
      bsa: bsa.toFixed(2),
      formula: `√(${heightCm} × ${weightKg}) / 3600`
    };
  },

  dripRate: (doseMcgKgMin: number, weightKg: number, concentrationMcgMl: number) => {
    const totalMcgMin = doseMcgKgMin * weightKg;
    const mlMin = totalMcgMin / concentrationMcgMl;
    const mlHr = mlMin * 60;
    const dropsMin = mlMin * 60; // Assuming 60 drops/mL (microdrip)
    return {
      mlPerHour: mlHr.toFixed(1),
      mlPerMin: mlMin.toFixed(2),
      dropsPerMin: dropsMin.toFixed(0),
      formula: `${doseMcgKgMin}mcg/kg/min × ${weightKg}kg ÷ ${concentrationMcgMl}mcg/mL`
    };
  }
};

// ============================================================================
// EDUCATIONAL CONTENT BY MEDICATION CLASS
// ============================================================================

export const medicationEducation = {
  respiratory: {
    overview: 'Respiratory medications focus on bronchodilation and reducing inflammation in the airways.',
    keyPoints: [
      'Beta-agonists (salbutamol) relax bronchial smooth muscle',
      'Anticholinergics (ipratropium) dry secretions and add bronchodilation',
      'Combination therapy is more effective than single agents',
      'Assess for side effects: tremor, tachycardia, hypokalemia'
    ],
    commonErrors: [
      'Not reassessing after bronchodilator administration',
      'Missing cardiac causes of wheezing',
      'Not using spacer with MDI (reduces effectiveness)',
      'Forgetting to auscultate lung sounds before and after'
    ]
  },
  cardiac: {
    overview: 'Cardiac medications manage ischemia, arrhythmias, and hemodynamics.',
    keyPoints: [
      'Aspirin and nitroglycerin are first-line for cardiac chest pain',
      'CHECK BP before giving nitroglycerin',
      'Morphine can reduce preload but may mask ischemia',
      'Amiodarone for refractory VF/pVT (after 3 shocks)'
    ],
    commonErrors: [
      'Not checking BP before nitroglycerin',
      'Swallowing instead of chewing aspirin',
      'Using nitroglycerin in inferior MI (RV infarct)',
      'Confusing adrenaline concentrations (1:1000 vs 1:10,000)'
    ]
  },
  metabolic: {
    overview: 'Metabolic medications address hypoglycemia and other endocrine emergencies.',
    keyPoints: [
      'ALWAYS confirm hypoglycemia before treating',
      'Dextrose is first-line, glucagon is backup',
      'Recheck blood glucose after treatment',
      'Hypoglycemia can mimic many other conditions'
    ],
    commonErrors: [
      'Not confirming hypoglycemia',
      'Not rechecking blood glucose after treatment',
      'Using glucagon as first-line',
      'Forgetting to feed patient after they wake up'
    ]
  },
  analgesia: {
    overview: 'Pain management balances relief with safety.',
    keyPoints: [
      'Titrate opioids to effect - start low, go slow',
      'Fentanyl causes less hypotension than morphine',
      'Paracetamol is safest for most patients',
      'Consider non-pharmacological pain relief',
      'Always have naloxone available'
    ],
    commonErrors: [
      'Overdosing opioids (not titrating)',
      'Not monitoring respiratory status',
      'Not having naloxone available',
      'Using morphine when fentanyl is safer',
      'Forgetting to reposition or other comfort measures'
    ]
  }
};

// ============================================================================
// SEARCH AND FILTER FUNCTIONS
// ============================================================================

export function getMedicationsByClass(medClass: string): UAEMedication[] {
  return uaeMedications.filter(med =>
    med.class.toLowerCase().includes(medClass.toLowerCase())
  );
}

export function getMedicationsByIndication(indication: string): UAEMedication[] {
  return uaeMedications.filter(med =>
    med.indications.some(ind =>
      ind.toLowerCase().includes(indication.toLowerCase())
    )
  );
}

export function getMedicationsByScopeLevel(level: 'basic' | 'intermediate' | 'advanced' | 'critical-care'): UAEMedication[] {
  return uaeMedications.filter(med =>
    med.uaeSpecific.available && med.uaeSpecific.scopeLevel === level
  );
}

export function searchMedications(query: string): UAEMedication[] {
  const lowerQuery = query.toLowerCase();
  return uaeMedications.filter(med =>
    med.genericName.toLowerCase().includes(lowerQuery) ||
    med.tradeNames.some(name => name.toLowerCase().includes(lowerQuery)) ||
    med.class.toLowerCase().includes(lowerQuery) ||
    med.indications.some(ind => ind.toLowerCase().includes(lowerQuery))
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default uaeMedications;
