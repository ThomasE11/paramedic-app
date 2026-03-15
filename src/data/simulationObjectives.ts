/**
 * Simulation Objectives Library
 *
 * INACSL Standards of Best Practice aligned simulation objectives.
 * Used for guided scenario setup where instructors define learning goals
 * before case generation.
 *
 * Reference: INACSL Standards of Best Practice: SimulationSM
 * - Simulation Design
 * - Prebriefing
 * - Debriefing
 * - Outcomes and Objectives
 */

import type { SimulationObjective, CaseScenario, CaseCategory } from '@/types';

// ============================================================================
// PREDEFINED SIMULATION OBJECTIVES
// ============================================================================

export const predefinedObjectives: SimulationObjective[] = [
  // ---- CARDIAC ----
  {
    id: 'obj-acs-assessment',
    primaryObjective: 'Acute coronary syndrome recognition and initial management',
    skillsFocus: ['12-lead ECG interpretation', 'MONA protocol', 'Aspirin administration', 'GTN administration', 'Pain assessment', 'Risk stratification'],
    learningDomain: 'cognitive',
    relatedCategories: ['cardiac'],
    relatedKeywords: ['chest pain', 'ACS', 'STEMI', 'NSTEMI', 'myocardial infarction', 'angina', 'troponin'],
  },
  {
    id: 'obj-cardiac-arrest',
    primaryObjective: 'Cardiac arrest management and ALS algorithm',
    skillsFocus: ['CPR quality', 'Defibrillation', 'Adrenaline timing', 'Reversible causes (4Hs/4Ts)', 'Team leadership', 'Rhythm recognition'],
    learningDomain: 'psychomotor',
    relatedCategories: ['cardiac'],
    relatedKeywords: ['cardiac arrest', 'CPR', 'ALS', 'defibrillation', 'VF', 'VT', 'PEA', 'asystole'],
  },
  {
    id: 'obj-heart-failure',
    primaryObjective: 'Acute heart failure assessment and management',
    skillsFocus: ['Pulmonary oedema recognition', 'CPAP application', 'GTN infusion', 'Fluid assessment', 'Positioning', 'Respiratory assessment'],
    learningDomain: 'cognitive',
    relatedCategories: ['cardiac'],
    relatedKeywords: ['heart failure', 'pulmonary oedema', 'dyspnoea', 'JVD', 'peripheral oedema', 'cardiogenic shock'],
  },
  {
    id: 'obj-arrhythmia',
    primaryObjective: 'Cardiac arrhythmia recognition and management',
    skillsFocus: ['ECG rhythm interpretation', 'Cardioversion', 'Amiodarone administration', 'Vagal manoeuvres', 'Haemodynamic assessment'],
    learningDomain: 'cognitive',
    relatedCategories: ['cardiac'],
    relatedKeywords: ['arrhythmia', 'tachycardia', 'bradycardia', 'atrial fibrillation', 'SVT', 'heart block'],
  },

  // ---- RESPIRATORY ----
  {
    id: 'obj-asthma-acute',
    primaryObjective: 'Acute asthma assessment and escalating management',
    skillsFocus: ['Severity assessment', 'Salbutamol nebulisation', 'Ipratropium bromide', 'IV magnesium', 'Adrenaline IM (life-threatening)', 'Peak flow measurement'],
    learningDomain: 'psychomotor',
    relatedCategories: ['respiratory'],
    relatedKeywords: ['asthma', 'wheeze', 'bronchospasm', 'peak flow', 'salbutamol', 'nebuliser'],
  },
  {
    id: 'obj-copd-exacerbation',
    primaryObjective: 'COPD exacerbation assessment and oxygen titration',
    skillsFocus: ['Controlled oxygen therapy', 'Venturi mask use', 'Nebuliser therapy', 'ABG interpretation', 'NIV consideration', 'CO2 retention awareness'],
    learningDomain: 'cognitive',
    relatedCategories: ['respiratory'],
    relatedKeywords: ['COPD', 'exacerbation', 'oxygen', 'hypercapnia', 'cor pulmonale', 'emphysema', 'bronchitis'],
  },
  {
    id: 'obj-airway-management',
    primaryObjective: 'Advanced airway assessment and management',
    skillsFocus: ['Airway assessment', 'Bag-valve-mask ventilation', 'Supraglottic airway insertion', 'Suction technique', 'Positioning', 'Failed airway algorithm'],
    learningDomain: 'psychomotor',
    relatedCategories: ['respiratory', 'trauma'],
    relatedKeywords: ['airway', 'obstruction', 'intubation', 'LMA', 'iGel', 'RSI', 'difficult airway'],
  },

  // ---- TRAUMA ----
  {
    id: 'obj-major-trauma',
    primaryObjective: 'Major trauma primary survey and life-threatening intervention',
    skillsFocus: ['C-ABCDE approach', 'Catastrophic haemorrhage control', 'Tourniquet application', 'Pelvic binder', 'Spinal immobilisation', 'Triage'],
    learningDomain: 'psychomotor',
    relatedCategories: ['trauma'],
    relatedKeywords: ['major trauma', 'polytrauma', 'haemorrhage', 'mechanism of injury', 'primary survey', 'golden hour'],
  },
  {
    id: 'obj-tbi-management',
    primaryObjective: 'Traumatic brain injury assessment and neuroprotection',
    skillsFocus: ['GCS assessment', 'Pupil examination', 'Cushing triad recognition', 'Head-up positioning', 'Hyperventilation avoidance', 'Secondary brain injury prevention'],
    learningDomain: 'cognitive',
    relatedCategories: ['trauma', 'neurological'],
    relatedKeywords: ['TBI', 'head injury', 'brain injury', 'GCS', 'intracranial pressure', 'Cushing', 'pupil'],
  },
  {
    id: 'obj-chest-trauma',
    primaryObjective: 'Chest trauma assessment and emergency interventions',
    skillsFocus: ['Tension pneumothorax recognition', 'Needle decompression', 'Chest seal application', 'Flail chest identification', 'Cardiac tamponade recognition', 'eFAST assessment'],
    learningDomain: 'psychomotor',
    relatedCategories: ['trauma'],
    relatedKeywords: ['chest trauma', 'pneumothorax', 'haemothorax', 'flail chest', 'tamponade', 'rib fracture'],
  },
  {
    id: 'obj-spinal-injury',
    primaryObjective: 'Spinal injury assessment and immobilisation',
    skillsFocus: ['Spinal assessment', 'Manual in-line stabilisation', 'Collar sizing and application', 'Log roll technique', 'Neurogenic shock recognition', 'NEXUS/Canadian C-spine rules'],
    learningDomain: 'psychomotor',
    relatedCategories: ['trauma'],
    relatedKeywords: ['spinal', 'c-spine', 'cervical', 'immobilisation', 'neurogenic shock', 'cord injury'],
  },
  {
    id: 'obj-haemorrhage-control',
    primaryObjective: 'Major haemorrhage recognition and control',
    skillsFocus: ['Tourniquet application', 'Wound packing', 'Haemostatic agents', 'Pelvic binder', 'IV fluid resuscitation', 'Tranexamic acid'],
    learningDomain: 'psychomotor',
    relatedCategories: ['trauma'],
    relatedKeywords: ['haemorrhage', 'bleeding', 'tourniquet', 'TXA', 'shock', 'hypovolaemic'],
  },
  {
    id: 'obj-burns-management',
    primaryObjective: 'Burns assessment and initial management',
    skillsFocus: ['Burns depth assessment', 'TBSA estimation (Wallace rule of 9s)', 'Fluid resuscitation (Parkland)', 'Airway burns recognition', 'Cooling techniques', 'Pain management'],
    learningDomain: 'cognitive',
    relatedCategories: ['trauma'],
    relatedKeywords: ['burns', 'thermal', 'inhalation', 'scald', 'chemical burn', 'TBSA'],
  },

  // ---- NEUROLOGICAL ----
  {
    id: 'obj-stroke-assessment',
    primaryObjective: 'Acute stroke recognition and time-critical management',
    skillsFocus: ['FAST assessment', 'Stroke mimics recognition', 'BGL check', 'Time of onset documentation', 'Pre-notification', 'Blood pressure management'],
    learningDomain: 'cognitive',
    relatedCategories: ['neurological'],
    relatedKeywords: ['stroke', 'CVA', 'TIA', 'FAST', 'thrombolysis', 'facial droop', 'hemiparesis'],
  },
  {
    id: 'obj-seizure-management',
    primaryObjective: 'Seizure management and status epilepticus',
    skillsFocus: ['Seizure type recognition', 'Benzodiazepine administration', 'Airway protection', 'Status epilepticus escalation', 'Post-ictal management', 'Safety positioning'],
    learningDomain: 'psychomotor',
    relatedCategories: ['neurological'],
    relatedKeywords: ['seizure', 'epilepsy', 'convulsion', 'status epilepticus', 'midazolam', 'post-ictal'],
  },
  {
    id: 'obj-altered-consciousness',
    primaryObjective: 'Systematic assessment of altered consciousness',
    skillsFocus: ['GCS assessment', 'AVPU scale', 'Pupil examination', 'BGL measurement', 'Toxicology assessment', 'Differential diagnosis'],
    learningDomain: 'cognitive',
    relatedCategories: ['neurological', 'metabolic'],
    relatedKeywords: ['unconscious', 'altered consciousness', 'GCS', 'coma', 'confusion', 'syncope'],
  },

  // ---- METABOLIC / MEDICAL ----
  {
    id: 'obj-hypoglycaemia',
    primaryObjective: 'Hypoglycaemia recognition and management',
    skillsFocus: ['BGL assessment', 'Oral glucose administration', 'IV dextrose 10%', 'Glucagon IM', 'GCS monitoring', 'Diabetic history taking'],
    learningDomain: 'psychomotor',
    relatedCategories: ['metabolic'],
    relatedKeywords: ['hypoglycaemia', 'blood glucose', 'diabetes', 'insulin', 'glucagon', 'dextrose'],
  },
  {
    id: 'obj-dka-management',
    primaryObjective: 'Diabetic ketoacidosis assessment and initial management',
    skillsFocus: ['BGL measurement', 'Ketone assessment', 'Fluid resuscitation', 'Kussmaul breathing recognition', 'Electrolyte considerations', 'Insulin awareness'],
    learningDomain: 'cognitive',
    relatedCategories: ['metabolic'],
    relatedKeywords: ['DKA', 'ketoacidosis', 'diabetes', 'ketones', 'Kussmaul', 'acidosis', 'hyperglycaemia'],
  },
  {
    id: 'obj-anaphylaxis',
    primaryObjective: 'Anaphylaxis recognition and emergency management',
    skillsFocus: ['Anaphylaxis recognition', 'Adrenaline IM administration', 'Airway management', 'IV fluid resuscitation', 'Antihistamine', 'Corticosteroid timing'],
    learningDomain: 'psychomotor',
    relatedCategories: ['metabolic', 'respiratory'],
    relatedKeywords: ['anaphylaxis', 'allergy', 'adrenaline', 'epinephrine', 'angioedema', 'urticaria', 'stridor'],
  },
  {
    id: 'obj-sepsis',
    primaryObjective: 'Sepsis recognition and Sepsis 6 bundle',
    skillsFocus: ['NEWS2 scoring', 'Lactate awareness', 'IV fluid challenge', 'Antibiotic awareness', 'Blood culture timing', 'Source identification'],
    learningDomain: 'cognitive',
    relatedCategories: ['metabolic'],
    relatedKeywords: ['sepsis', 'infection', 'NEWS', 'SIRS', 'septic shock', 'fever', 'tachycardia'],
  },

  // ---- PEDIATRIC ----
  {
    id: 'obj-paediatric-assessment',
    primaryObjective: 'Paediatric assessment triangle and systematic approach',
    skillsFocus: ['Paediatric assessment triangle', 'Age-appropriate vital signs', 'Weight estimation (Broselow)', 'Paediatric drug dosing', 'Family communication', 'Safeguarding awareness'],
    learningDomain: 'cognitive',
    relatedCategories: ['pediatric'],
    relatedKeywords: ['paediatric', 'child', 'infant', 'neonate', 'Broselow', 'safeguarding'],
  },
  {
    id: 'obj-paediatric-respiratory',
    primaryObjective: 'Paediatric respiratory emergencies (croup, bronchiolitis, epiglottitis)',
    skillsFocus: ['Stridor vs wheeze differentiation', 'Croup management', 'Nebulised adrenaline', 'Dexamethasone', 'Do-not-disturb approach', 'Oxygen delivery methods'],
    learningDomain: 'cognitive',
    relatedCategories: ['pediatric', 'respiratory'],
    relatedKeywords: ['croup', 'bronchiolitis', 'epiglottitis', 'stridor', 'paediatric airway', 'RSV'],
  },
  {
    id: 'obj-febrile-convulsion',
    primaryObjective: 'Febrile convulsion management in children',
    skillsFocus: ['Temperature management', 'Seizure management', 'Simple vs complex differentiation', 'Parent reassurance', 'Safety netting', 'Meningitis exclusion'],
    learningDomain: 'cognitive',
    relatedCategories: ['pediatric', 'neurological'],
    relatedKeywords: ['febrile', 'convulsion', 'seizure', 'fever', 'child', 'meningitis'],
  },

  // ---- OBSTETRIC ----
  {
    id: 'obj-obstetric-emergency',
    primaryObjective: 'Obstetric emergency recognition and management',
    skillsFocus: ['Pre-eclampsia recognition', 'Magnesium sulphate', 'Postpartum haemorrhage management', 'Emergency delivery', 'Neonatal resuscitation', 'Left lateral positioning'],
    learningDomain: 'psychomotor',
    relatedCategories: ['obstetric'],
    relatedKeywords: ['pregnancy', 'obstetric', 'pre-eclampsia', 'eclampsia', 'PPH', 'delivery', 'labour'],
  },

  // ---- TOXICOLOGY ----
  {
    id: 'obj-overdose-management',
    primaryObjective: 'Poisoning and overdose assessment and management',
    skillsFocus: ['Toxidrome recognition', 'Naloxone administration', 'Activated charcoal consideration', 'Specific antidotes', 'Decontamination', 'Toxicology history'],
    learningDomain: 'cognitive',
    relatedCategories: ['toxicology', 'metabolic'],
    relatedKeywords: ['overdose', 'poisoning', 'toxicology', 'naloxone', 'opioid', 'paracetamol', 'toxidrome'],
  },

  // ---- MENTAL HEALTH ----
  {
    id: 'obj-mental-health-crisis',
    primaryObjective: 'Mental health crisis assessment and de-escalation',
    skillsFocus: ['Risk assessment', 'De-escalation techniques', 'Capacity assessment', 'Mental Health Act awareness', 'Communication skills', 'Safety planning'],
    learningDomain: 'affective',
    relatedCategories: ['mental-health'],
    relatedKeywords: ['mental health', 'suicide', 'self-harm', 'psychosis', 'agitation', 'capacity', 'sectioning'],
  },

  // ---- COMMUNICATION / HANDOVER ----
  {
    id: 'obj-clinical-handover',
    primaryObjective: 'Structured clinical handover using ATMIST/SBAR',
    skillsFocus: ['ATMIST handover', 'SBAR communication', 'Concise clinical summary', 'Priority information', 'Team communication', 'Documentation'],
    learningDomain: 'affective',
    relatedCategories: ['cardiac', 'respiratory', 'trauma', 'neurological', 'metabolic'],
    relatedKeywords: ['handover', 'ATMIST', 'SBAR', 'communication', 'documentation', 'pre-alert'],
  },

  // ---- SCENE MANAGEMENT ----
  {
    id: 'obj-scene-safety',
    primaryObjective: 'Scene safety assessment and hazard management',
    skillsFocus: ['Dynamic risk assessment', 'PPE selection', 'Scene approach', 'Hazard identification', 'Resource requesting', 'Bystander management'],
    learningDomain: 'cognitive',
    relatedCategories: ['trauma'],
    relatedKeywords: ['scene safety', 'hazards', 'PPE', 'risk assessment', 'RTC', 'CBRN'],
  },
];

// ============================================================================
// OBJECTIVE MATCHING
// ============================================================================

/**
 * Score a case against a simulation objective.
 * Higher score = better match.
 */
export function scoreCaseForObjective(caseData: CaseScenario, objective: SimulationObjective): number {
  let score = 0;

  // Category match (strongest signal)
  if (objective.relatedCategories?.includes(caseData.category as CaseCategory)) {
    score += 50;
  }

  // Keyword matching against case title, teaching points, expected findings
  const caseText = [
    caseData.title,
    caseData.expectedFindings?.mostLikelyDiagnosis || '',
    ...(caseData.teachingPoints || []),
    ...(caseData.expectedFindings?.keyObservations || []),
    ...(caseData.expectedFindings?.differentialDiagnoses || []),
    ...(caseData.criticalActions?.map(a => a.description) || []),
    ...(caseData.studentChecklist?.map(c => c.description) || []),
  ].join(' ').toLowerCase();

  for (const keyword of objective.relatedKeywords) {
    if (caseText.includes(keyword.toLowerCase())) {
      score += 10;
    }
  }

  // Skills focus matching against checklist items
  const checklistText = (caseData.studentChecklist || []).map(c => c.description).join(' ').toLowerCase();
  for (const skill of objective.skillsFocus) {
    const skillWords = skill.toLowerCase().split(/\s+/);
    if (skillWords.some(word => checklistText.includes(word))) {
      score += 5;
    }
  }

  return score;
}

/**
 * Find the best matching cases for a simulation objective.
 * Returns cases sorted by relevance score (highest first).
 */
export function matchObjectiveToCase(
  objective: SimulationObjective,
  cases: CaseScenario[]
): CaseScenario[] {
  const scored = cases.map(c => ({
    case: c,
    score: scoreCaseForObjective(c, objective),
  }));

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.case);
}

/**
 * Get suggested objectives for a given case category.
 */
export function getObjectivesForCategory(category: CaseCategory): SimulationObjective[] {
  return predefinedObjectives.filter(obj =>
    obj.relatedCategories?.includes(category)
  );
}

/**
 * Search objectives by text query.
 */
export function searchObjectives(query: string): SimulationObjective[] {
  const lower = query.toLowerCase();
  return predefinedObjectives.filter(obj =>
    obj.primaryObjective.toLowerCase().includes(lower) ||
    obj.skillsFocus.some(s => s.toLowerCase().includes(lower)) ||
    obj.relatedKeywords.some(k => k.toLowerCase().includes(lower))
  );
}

export default predefinedObjectives;
