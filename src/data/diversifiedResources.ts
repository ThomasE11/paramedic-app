/**
 * Diversified Clinical Resources Registry
 *
 * Resources from 12+ reputable medical education providers.
 * LITFL is ONE of many sources, not the primary.
 *
 * Sources include:
 * - Radiopaedia (imaging/radiology)
 * - EMDocs (emergency medicine)
 * - REBEL EM (evidence-based EM)
 * - ALiEM (academic life in EM)
 * - EM Cases (case-based learning)
 * - EMCrit (critical care)
 * - LITFL (FOAMed)
 * - NICE (UK guidelines)
 * - Resuscitation Council UK
 * - JRCALC (UK ambulance guidelines)
 * - WHO (international guidelines)
 * - Medscape/eMedicine (comprehensive reference)
 * - DermNet NZ (dermatology)
 */

import type { DebriefingResource, ResourceSource, CaseCategory, CaseScenario, SimulationObjective } from '@/types';

// ============================================================================
// SOURCE REGISTRY
// ============================================================================

export const resourceSources: ResourceSource[] = [
  { id: 'radiopaedia', name: 'Radiopaedia', baseUrl: 'https://radiopaedia.org', type: 'imaging', categories: ['cardiac', 'respiratory', 'trauma', 'neurological'] },
  { id: 'emdocs', name: 'EMDocs', baseUrl: 'https://www.emdocs.net', type: 'foamed', categories: ['cardiac', 'respiratory', 'neurological', 'metabolic'] },
  { id: 'rebelem', name: 'REBEL EM', baseUrl: 'https://rebelem.com', type: 'foamed', categories: ['cardiac', 'respiratory', 'trauma'] },
  { id: 'aliem', name: 'ALiEM', baseUrl: 'https://www.aliem.com', type: 'education', categories: ['cardiac', 'respiratory', 'neurological', 'trauma'] },
  { id: 'emcases', name: 'EM Cases', baseUrl: 'https://emergencymedicinecases.com', type: 'foamed', categories: ['cardiac', 'respiratory', 'neurological', 'trauma'] },
  { id: 'emcrit', name: 'EMCrit', baseUrl: 'https://emcrit.org', type: 'foamed', categories: ['cardiac', 'respiratory'] },
  { id: 'litfl', name: 'LITFL', baseUrl: 'https://litfl.com', type: 'foamed', categories: ['cardiac', 'neurological', 'respiratory', 'trauma'] },
  { id: 'nice', name: 'NICE', baseUrl: 'https://www.nice.org.uk', type: 'guideline', categories: ['cardiac', 'respiratory', 'neurological', 'metabolic'] },
  { id: 'rcuk', name: 'Resuscitation Council UK', baseUrl: 'https://www.resus.org.uk', type: 'guideline', categories: ['cardiac', 'respiratory', 'pediatric'] },
  { id: 'jrcalc', name: 'JRCALC', baseUrl: 'https://jrcalcplus.co.uk', type: 'guideline', categories: ['cardiac', 'trauma', 'respiratory', 'metabolic'] },
  { id: 'who', name: 'WHO', baseUrl: 'https://www.who.int', type: 'government', categories: ['pediatric', 'obstetric'] },
  { id: 'medscape', name: 'Medscape', baseUrl: 'https://emedicine.medscape.com', type: 'education', categories: ['cardiac', 'respiratory', 'neurological', 'metabolic', 'trauma'] },
  { id: 'dermnetnz', name: 'DermNet NZ', baseUrl: 'https://dermnetnz.org', type: 'education', categories: ['dermatological'] },
];

// ============================================================================
// CARDIAC RESOURCES
// ============================================================================

const cardiacResources: DebriefingResource[] = [
  // Articles & FOAMed
  { id: 'cardiac-emdocs-acs', title: 'Acute Coronary Syndromes - ED Pearls', url: 'https://www.emdocs.net/acute-coronary-syndrome-an-emergency-medicine-approach/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'cardiac' },
  { id: 'cardiac-rebelem-stemi', title: 'STEMI Equivalents You Need to Know', url: 'https://rebelem.com/stemi-equivalents/', type: 'article', source: 'REBEL EM', relevance: 'essential', category: 'cardiac' },
  { id: 'cardiac-emcrit-push-dose', title: 'Push Dose Pressors in Cardiogenic Shock', url: 'https://emcrit.org/emcrit/push-dose-pressors/', type: 'article', source: 'EMCrit', relevance: 'important', category: 'cardiac' },
  { id: 'cardiac-litfl-ecg', title: 'ECG Library - Comprehensive Interpretation', url: 'https://litfl.com/ecg-library/', type: 'article', source: 'LITFL', relevance: 'essential', category: 'cardiac' },
  { id: 'cardiac-emcases-chestpain', title: 'Chest Pain - Emergency Approach', url: 'https://emergencymedicinecases.com/chest-pain/', type: 'podcast', source: 'EM Cases', relevance: 'important', category: 'cardiac' },

  // Imaging
  { id: 'cardiac-radiopaedia-stemi', title: 'ST Elevation Myocardial Infarction (Imaging)', url: 'https://radiopaedia.org/articles/st-elevation-myocardial-infarction', type: 'article', source: 'Radiopaedia', relevance: 'essential', category: 'cardiac' },
  { id: 'cardiac-radiopaedia-tamponade', title: 'Cardiac Tamponade (Imaging)', url: 'https://radiopaedia.org/articles/cardiac-tamponade', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'cardiac' },
  { id: 'cardiac-radiopaedia-aortic-dissection', title: 'Aortic Dissection (Imaging)', url: 'https://radiopaedia.org/articles/aortic-dissection', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'cardiac' },

  // Guidelines
  { id: 'cardiac-rcuk-als', title: 'Adult Advanced Life Support Algorithm', url: 'https://www.resus.org.uk/library/2021-resuscitation-guidelines/adult-advanced-life-support-guidelines', type: 'guideline', source: 'Resuscitation Council UK', relevance: 'essential', category: 'cardiac' },
  { id: 'cardiac-nice-acs', title: 'NICE: Acute Coronary Syndromes', url: 'https://www.nice.org.uk/guidance/ng185', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'cardiac' },
  { id: 'cardiac-nice-af', title: 'NICE: Atrial Fibrillation Management', url: 'https://www.nice.org.uk/guidance/ng196', type: 'guideline', source: 'NICE', relevance: 'important', category: 'cardiac' },
  { id: 'cardiac-rcuk-peri-arrest', title: 'Peri-arrest Arrhythmias', url: 'https://www.resus.org.uk/library/2021-resuscitation-guidelines/peri-arrest-arrhythmias', type: 'guideline', source: 'Resuscitation Council UK', relevance: 'essential', category: 'cardiac' },

  // Education
  { id: 'cardiac-aliem-ecg-cases', title: 'ECG Cases - Interactive Learning', url: 'https://www.aliem.com/category/ecg/', type: 'article', source: 'ALiEM', relevance: 'supplementary', category: 'cardiac' },
  { id: 'cardiac-medscape-mi', title: 'Myocardial Infarction - Clinical Overview', url: 'https://emedicine.medscape.com/article/155919-overview', type: 'article', source: 'Medscape', relevance: 'supplementary', category: 'cardiac' },
];

// ============================================================================
// RESPIRATORY RESOURCES
// ============================================================================

const respiratoryResources: DebriefingResource[] = [
  // Articles & FOAMed
  { id: 'resp-emdocs-asthma', title: 'Acute Asthma in the ED', url: 'https://www.emdocs.net/asthma-in-the-emergency-department/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'respiratory' },
  { id: 'resp-rebelem-niv', title: 'Non-Invasive Ventilation - Key Concepts', url: 'https://rebelem.com/non-invasive-ventilation/', type: 'article', source: 'REBEL EM', relevance: 'essential', category: 'respiratory' },
  { id: 'resp-emcrit-airway', title: 'Definitive Airway Management', url: 'https://emcrit.org/emcrit/airway-management/', type: 'article', source: 'EMCrit', relevance: 'essential', category: 'respiratory' },
  { id: 'resp-emcrit-preoxygenation', title: 'Preoxygenation Techniques', url: 'https://emcrit.org/emcrit/preoxygenation/', type: 'article', source: 'EMCrit', relevance: 'important', category: 'respiratory' },
  { id: 'resp-litfl-asthma', title: 'Life-Threatening Asthma', url: 'https://litfl.com/acute-severe-asthma/', type: 'article', source: 'LITFL', relevance: 'important', category: 'respiratory' },
  { id: 'resp-emcases-dyspnoea', title: 'Approach to Dyspnoea', url: 'https://emergencymedicinecases.com/approach-to-dyspnea/', type: 'podcast', source: 'EM Cases', relevance: 'important', category: 'respiratory' },

  // Imaging
  { id: 'resp-radiopaedia-pneumothorax', title: 'Pneumothorax (Imaging Guide)', url: 'https://radiopaedia.org/articles/pneumothorax', type: 'image', source: 'Radiopaedia', relevance: 'essential', category: 'respiratory' },
  { id: 'resp-radiopaedia-pleural-effusion', title: 'Pleural Effusion (Imaging)', url: 'https://radiopaedia.org/articles/pleural-effusion', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'respiratory' },
  { id: 'resp-radiopaedia-pneumonia', title: 'Pneumonia (Imaging Patterns)', url: 'https://radiopaedia.org/articles/pneumonia', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'respiratory' },
  { id: 'resp-radiopaedia-copd', title: 'COPD (Imaging Features)', url: 'https://radiopaedia.org/articles/chronic-obstructive-pulmonary-disease', type: 'image', source: 'Radiopaedia', relevance: 'supplementary', category: 'respiratory' },

  // Guidelines
  { id: 'resp-nice-asthma', title: 'NICE: Asthma Management', url: 'https://www.nice.org.uk/guidance/ng80', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'respiratory' },
  { id: 'resp-nice-copd', title: 'NICE: COPD Management', url: 'https://www.nice.org.uk/guidance/ng115', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'respiratory' },
  { id: 'resp-nice-pneumonia', title: 'NICE: Community-acquired Pneumonia', url: 'https://www.nice.org.uk/guidance/ng138', type: 'guideline', source: 'NICE', relevance: 'important', category: 'respiratory' },

  // Education
  { id: 'resp-aliem-airway', title: 'Airway Management Techniques', url: 'https://www.aliem.com/category/airway/', type: 'article', source: 'ALiEM', relevance: 'supplementary', category: 'respiratory' },
  { id: 'resp-medscape-pe', title: 'Pulmonary Embolism - Clinical Overview', url: 'https://emedicine.medscape.com/article/300901-overview', type: 'article', source: 'Medscape', relevance: 'important', category: 'respiratory' },
];

// ============================================================================
// TRAUMA RESOURCES
// ============================================================================

const traumaResources: DebriefingResource[] = [
  // Articles & FOAMed
  { id: 'trauma-emdocs-primary', title: 'Primary Survey - Getting It Right', url: 'https://www.emdocs.net/trauma-primary-survey/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'trauma' },
  { id: 'trauma-rebelem-tbi', title: 'Traumatic Brain Injury - Evidence Review', url: 'https://rebelem.com/traumatic-brain-injury/', type: 'article', source: 'REBEL EM', relevance: 'essential', category: 'trauma' },
  { id: 'trauma-rebelem-txa', title: 'Tranexamic Acid in Trauma - Evidence', url: 'https://rebelem.com/tranexamic-acid-in-trauma/', type: 'article', source: 'REBEL EM', relevance: 'important', category: 'trauma' },
  { id: 'trauma-emcrit-resus', title: 'Trauma Resuscitation Essentials', url: 'https://emcrit.org/emcrit/trauma-resuscitation/', type: 'article', source: 'EMCrit', relevance: 'essential', category: 'trauma' },
  { id: 'trauma-litfl-chest', title: 'Chest Trauma Management', url: 'https://litfl.com/chest-trauma/', type: 'article', source: 'LITFL', relevance: 'important', category: 'trauma' },
  { id: 'trauma-emcases-polytrauma', title: 'Polytrauma - Case-Based Approach', url: 'https://emergencymedicinecases.com/trauma/', type: 'podcast', source: 'EM Cases', relevance: 'important', category: 'trauma' },
  { id: 'trauma-litfl-tourniquet', title: 'Tourniquet Application in Trauma', url: 'https://litfl.com/tourniquet-application/', type: 'article', source: 'LITFL', relevance: 'essential', category: 'trauma' },

  // Imaging
  { id: 'trauma-radiopaedia-tbi', title: 'Traumatic Brain Injury (Imaging)', url: 'https://radiopaedia.org/articles/traumatic-brain-injury', type: 'image', source: 'Radiopaedia', relevance: 'essential', category: 'trauma' },
  { id: 'trauma-radiopaedia-pneumothorax', title: 'Tension Pneumothorax (Imaging)', url: 'https://radiopaedia.org/articles/tension-pneumothorax', type: 'image', source: 'Radiopaedia', relevance: 'essential', category: 'trauma' },
  { id: 'trauma-radiopaedia-cervical', title: 'Cervical Spine Injury (Imaging)', url: 'https://radiopaedia.org/articles/cervical-spine-injury', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'trauma' },
  { id: 'trauma-radiopaedia-pelvic', title: 'Pelvic Fracture (Imaging)', url: 'https://radiopaedia.org/articles/pelvic-fractures', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'trauma' },

  // Guidelines
  { id: 'trauma-nice-major-trauma', title: 'NICE: Major Trauma Assessment', url: 'https://www.nice.org.uk/guidance/ng39', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'trauma' },
  { id: 'trauma-nice-head-injury', title: 'NICE: Head Injury Assessment and Management', url: 'https://www.nice.org.uk/guidance/ng232', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'trauma' },
  { id: 'trauma-nice-spinal-injury', title: 'NICE: Spinal Injury Assessment', url: 'https://www.nice.org.uk/guidance/ng41', type: 'guideline', source: 'NICE', relevance: 'important', category: 'trauma' },

  // Education
  { id: 'trauma-aliem-fast', title: 'eFAST Exam - Technique and Interpretation', url: 'https://www.aliem.com/pocus-101-efast/', type: 'article', source: 'ALiEM', relevance: 'important', category: 'trauma' },
  { id: 'trauma-medscape-burns', title: 'Burns - Clinical Management Overview', url: 'https://emedicine.medscape.com/article/1278244-overview', type: 'article', source: 'Medscape', relevance: 'supplementary', category: 'trauma' },
];

// ============================================================================
// NEUROLOGICAL RESOURCES
// ============================================================================

const neurologicalResources: DebriefingResource[] = [
  // Articles & FOAMed
  { id: 'neuro-emdocs-stroke', title: 'Stroke Recognition in the ED', url: 'https://www.emdocs.net/stroke-recognition-in-the-emergency-department/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'neurological' },
  { id: 'neuro-rebelem-seizure', title: 'Status Epilepticus - Evidence-Based Management', url: 'https://rebelem.com/status-epilepticus/', type: 'article', source: 'REBEL EM', relevance: 'essential', category: 'neurological' },
  { id: 'neuro-litfl-gcs', title: 'Glasgow Coma Scale - Comprehensive Guide', url: 'https://litfl.com/glasgow-coma-scale-gcs/', type: 'article', source: 'LITFL', relevance: 'essential', category: 'neurological' },
  { id: 'neuro-litfl-cushing', title: 'Cushing Reflex - Raised ICP', url: 'https://litfl.com/cushings-reflex/', type: 'article', source: 'LITFL', relevance: 'important', category: 'neurological' },
  { id: 'neuro-emcases-headache', title: 'Headache Emergencies', url: 'https://emergencymedicinecases.com/headache/', type: 'podcast', source: 'EM Cases', relevance: 'important', category: 'neurological' },
  { id: 'neuro-emcrit-neuro-resus', title: 'Neurological Resuscitation', url: 'https://emcrit.org/emcrit/neurological-emergencies/', type: 'article', source: 'EMCrit', relevance: 'important', category: 'neurological' },

  // Imaging
  { id: 'neuro-radiopaedia-stroke', title: 'Ischaemic Stroke (Imaging Guide)', url: 'https://radiopaedia.org/articles/ischaemic-stroke', type: 'image', source: 'Radiopaedia', relevance: 'essential', category: 'neurological' },
  { id: 'neuro-radiopaedia-sah', title: 'Subarachnoid Haemorrhage (Imaging)', url: 'https://radiopaedia.org/articles/subarachnoid-haemorrhage', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'neurological' },
  { id: 'neuro-radiopaedia-epidural', title: 'Epidural Haematoma (Imaging)', url: 'https://radiopaedia.org/articles/epidural-haematoma', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'neurological' },

  // Guidelines
  { id: 'neuro-nice-stroke', title: 'NICE: Stroke and TIA Management', url: 'https://www.nice.org.uk/guidance/ng128', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'neurological' },
  { id: 'neuro-nice-epilepsy', title: 'NICE: Epilepsy Management', url: 'https://www.nice.org.uk/guidance/ng217', type: 'guideline', source: 'NICE', relevance: 'important', category: 'neurological' },
  { id: 'neuro-nice-meningitis', title: 'NICE: Meningitis Recognition', url: 'https://www.nice.org.uk/guidance/cg102', type: 'guideline', source: 'NICE', relevance: 'important', category: 'neurological' },

  // Education
  { id: 'neuro-aliem-neuro-exam', title: 'Neurological Examination - Key Techniques', url: 'https://www.aliem.com/category/neurology/', type: 'article', source: 'ALiEM', relevance: 'supplementary', category: 'neurological' },
  { id: 'neuro-medscape-stroke', title: 'Ischaemic Stroke - Clinical Overview', url: 'https://emedicine.medscape.com/article/1916852-overview', type: 'article', source: 'Medscape', relevance: 'supplementary', category: 'neurological' },
];

// ============================================================================
// METABOLIC RESOURCES
// ============================================================================

const metabolicResources: DebriefingResource[] = [
  { id: 'meta-emdocs-dka', title: 'DKA Management - Emergency Approach', url: 'https://www.emdocs.net/diabetic-ketoacidosis/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'metabolic' },
  { id: 'meta-emdocs-hypo', title: 'Hypoglycaemia in the ED', url: 'https://www.emdocs.net/hypoglycemia-in-the-ed/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'metabolic' },
  { id: 'meta-rebelem-anaphylaxis', title: 'Anaphylaxis - Evidence Review', url: 'https://rebelem.com/anaphylaxis/', type: 'article', source: 'REBEL EM', relevance: 'essential', category: 'metabolic' },
  { id: 'meta-emcrit-sepsis', title: 'Sepsis Management Essentials', url: 'https://emcrit.org/emcrit/sepsis/', type: 'article', source: 'EMCrit', relevance: 'essential', category: 'metabolic' },
  { id: 'meta-litfl-electrolytes', title: 'Electrolyte Emergencies', url: 'https://litfl.com/hyperkalaemia/', type: 'article', source: 'LITFL', relevance: 'important', category: 'metabolic' },
  { id: 'meta-emcases-anaphylaxis', title: 'Anaphylaxis Management - Case Review', url: 'https://emergencymedicinecases.com/anaphylaxis/', type: 'podcast', source: 'EM Cases', relevance: 'important', category: 'metabolic' },

  // Guidelines
  { id: 'meta-nice-diabetes', title: 'NICE: Type 1 Diabetes - DKA Management', url: 'https://www.nice.org.uk/guidance/ng17', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'metabolic' },
  { id: 'meta-rcuk-anaphylaxis', title: 'Resuscitation Council UK: Anaphylaxis Algorithm', url: 'https://www.resus.org.uk/library/additional-guidance/guidance-anaphylaxis', type: 'guideline', source: 'Resuscitation Council UK', relevance: 'essential', category: 'metabolic' },
  { id: 'meta-nice-sepsis', title: 'NICE: Sepsis Recognition and Management', url: 'https://www.nice.org.uk/guidance/ng51', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'metabolic' },

  // Education
  { id: 'meta-medscape-dka', title: 'Diabetic Ketoacidosis - Clinical Overview', url: 'https://emedicine.medscape.com/article/118361-overview', type: 'article', source: 'Medscape', relevance: 'supplementary', category: 'metabolic' },
  { id: 'meta-aliem-sepsis', title: 'Sepsis Pearls and Pitfalls', url: 'https://www.aliem.com/category/sepsis/', type: 'article', source: 'ALiEM', relevance: 'supplementary', category: 'metabolic' },
];

// ============================================================================
// PEDIATRIC RESOURCES
// ============================================================================

const pediatricResources: DebriefingResource[] = [
  { id: 'paed-emdocs-assessment', title: 'Paediatric Assessment Triangle', url: 'https://www.emdocs.net/pediatric-assessment-triangle/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'pediatric' },
  { id: 'paed-aliem-paed-em', title: 'Paediatric Emergency Medicine Resources', url: 'https://www.aliem.com/category/pediatrics/', type: 'article', source: 'ALiEM', relevance: 'essential', category: 'pediatric' },
  { id: 'paed-emcases-croup', title: 'Croup and Paediatric Airway', url: 'https://emergencymedicinecases.com/croup/', type: 'podcast', source: 'EM Cases', relevance: 'important', category: 'pediatric' },
  { id: 'paed-litfl-paed', title: 'Paediatric Emergencies Overview', url: 'https://litfl.com/paediatric-emergencies/', type: 'article', source: 'LITFL', relevance: 'important', category: 'pediatric' },
  { id: 'paed-rcuk-newborn', title: 'Newborn Life Support Algorithm', url: 'https://www.resus.org.uk/library/2021-resuscitation-guidelines/newborn-resuscitation-and-support-transition-infants-birth', type: 'guideline', source: 'Resuscitation Council UK', relevance: 'essential', category: 'pediatric' },
  { id: 'paed-rcuk-paed-als', title: 'Paediatric Advanced Life Support', url: 'https://www.resus.org.uk/library/2021-resuscitation-guidelines/paediatric-advanced-life-support-guidelines', type: 'guideline', source: 'Resuscitation Council UK', relevance: 'essential', category: 'pediatric' },
  { id: 'paed-nice-fever', title: 'NICE: Fever in Under 5s', url: 'https://www.nice.org.uk/guidance/ng143', type: 'guideline', source: 'NICE', relevance: 'important', category: 'pediatric' },
  { id: 'paed-who-imci', title: 'WHO: Integrated Management of Childhood Illness', url: 'https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/child-health/integrated-management-of-childhood-illness', type: 'guideline', source: 'WHO', relevance: 'supplementary', category: 'pediatric' },
  { id: 'paed-medscape-febrile', title: 'Febrile Seizures - Clinical Overview', url: 'https://emedicine.medscape.com/article/1176205-overview', type: 'article', source: 'Medscape', relevance: 'supplementary', category: 'pediatric' },
];

// ============================================================================
// DERMATOLOGICAL RESOURCES (previously empty)
// ============================================================================

const dermatologicalResources: DebriefingResource[] = [
  { id: 'derm-dermnetnz-rashes', title: 'Acute Rashes - Diagnostic Approach', url: 'https://dermnetnz.org/topics/acute-skin-rash', type: 'article', source: 'DermNet NZ', relevance: 'essential', category: 'dermatological' },
  { id: 'derm-dermnetnz-urticaria', title: 'Urticaria (Hives) - Assessment', url: 'https://dermnetnz.org/topics/acute-urticaria', type: 'article', source: 'DermNet NZ', relevance: 'essential', category: 'dermatological' },
  { id: 'derm-dermnetnz-purpura', title: 'Purpura - Recognition and Causes', url: 'https://dermnetnz.org/topics/purpura', type: 'article', source: 'DermNet NZ', relevance: 'essential', category: 'dermatological' },
  { id: 'derm-dermnetnz-cellulitis', title: 'Cellulitis - Diagnosis and Management', url: 'https://dermnetnz.org/topics/cellulitis', type: 'article', source: 'DermNet NZ', relevance: 'important', category: 'dermatological' },
  { id: 'derm-emdocs-rash', title: 'Life-Threatening Rashes in the ED', url: 'https://www.emdocs.net/life-threatening-rashes/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'dermatological' },
  { id: 'derm-dermnetnz-burns', title: 'Burns Assessment and Classification', url: 'https://dermnetnz.org/topics/burn', type: 'article', source: 'DermNet NZ', relevance: 'important', category: 'dermatological' },
  { id: 'derm-nice-skin-infections', title: 'NICE: Skin and Soft Tissue Infections', url: 'https://www.nice.org.uk/guidance/ng141', type: 'guideline', source: 'NICE', relevance: 'important', category: 'dermatological' },
  { id: 'derm-medscape-cellulitis', title: 'Cellulitis - Clinical Overview', url: 'https://emedicine.medscape.com/article/214222-overview', type: 'article', source: 'Medscape', relevance: 'supplementary', category: 'dermatological' },
];

// ============================================================================
// ABDOMINAL RESOURCES (previously empty)
// ============================================================================

const abdominalResources: DebriefingResource[] = [
  { id: 'abdo-emdocs-acute', title: 'Acute Abdomen - Emergency Approach', url: 'https://www.emdocs.net/acute-abdomen/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'abdominal' },
  { id: 'abdo-emdocs-gi-bleed', title: 'GI Bleeding - Emergency Management', url: 'https://www.emdocs.net/gi-bleeding-in-the-emergency-department/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'abdominal' },
  { id: 'abdo-radiopaedia-appendicitis', title: 'Appendicitis (Imaging Guide)', url: 'https://radiopaedia.org/articles/appendicitis', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'abdominal' },
  { id: 'abdo-radiopaedia-aaa', title: 'Abdominal Aortic Aneurysm (Imaging)', url: 'https://radiopaedia.org/articles/abdominal-aortic-aneurysm-2', type: 'image', source: 'Radiopaedia', relevance: 'essential', category: 'abdominal' },
  { id: 'abdo-radiopaedia-obstruction', title: 'Bowel Obstruction (Imaging)', url: 'https://radiopaedia.org/articles/small-bowel-obstruction', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'abdominal' },
  { id: 'abdo-emcases-abdopain', title: 'Abdominal Pain - Case Approach', url: 'https://emergencymedicinecases.com/abdominal-pain/', type: 'podcast', source: 'EM Cases', relevance: 'important', category: 'abdominal' },
  { id: 'abdo-nice-gi-bleed', title: 'NICE: GI Bleeding Management', url: 'https://www.nice.org.uk/guidance/ng141', type: 'guideline', source: 'NICE', relevance: 'important', category: 'abdominal' },
  { id: 'abdo-medscape-aaa', title: 'AAA - Clinical Overview', url: 'https://emedicine.medscape.com/article/1979501-overview', type: 'article', source: 'Medscape', relevance: 'supplementary', category: 'abdominal' },
];

// ============================================================================
// OPHTHALMIC RESOURCES (previously empty)
// ============================================================================

const ophthalmicResources: DebriefingResource[] = [
  { id: 'oph-emdocs-red-eye', title: 'Red Eye - Emergency Approach', url: 'https://www.emdocs.net/red-eye-in-the-emergency-department/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'ophthalmic' },
  { id: 'oph-emdocs-vision-loss', title: 'Acute Vision Loss in the ED', url: 'https://www.emdocs.net/acute-vision-loss/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'ophthalmic' },
  { id: 'oph-litfl-pupil', title: 'Pupil Assessment - Clinical Guide', url: 'https://litfl.com/pupil-examination/', type: 'article', source: 'LITFL', relevance: 'important', category: 'ophthalmic' },
  { id: 'oph-radiopaedia-orbital', title: 'Orbital Trauma (Imaging)', url: 'https://radiopaedia.org/articles/orbital-fracture', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'ophthalmic' },
  { id: 'oph-aliem-eye-exam', title: 'Emergency Eye Examination', url: 'https://www.aliem.com/category/ophthalmology/', type: 'article', source: 'ALiEM', relevance: 'supplementary', category: 'ophthalmic' },
  { id: 'oph-medscape-chemical-burn', title: 'Chemical Eye Burns - Emergency Management', url: 'https://emedicine.medscape.com/article/798696-overview', type: 'article', source: 'Medscape', relevance: 'important', category: 'ophthalmic' },
];

// ============================================================================
// ENT RESOURCES (previously empty)
// ============================================================================

const entResources: DebriefingResource[] = [
  { id: 'ent-emdocs-epistaxis', title: 'Epistaxis - Emergency Management', url: 'https://www.emdocs.net/epistaxis-management/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'ent' },
  { id: 'ent-emdocs-peritonsillar', title: 'Peritonsillar Abscess - Assessment', url: 'https://www.emdocs.net/peritonsillar-abscess/', type: 'article', source: 'EMDocs', relevance: 'important', category: 'ent' },
  { id: 'ent-litfl-stridor', title: 'Stridor - Assessment and Causes', url: 'https://litfl.com/stridor/', type: 'article', source: 'LITFL', relevance: 'essential', category: 'ent' },
  { id: 'ent-radiopaedia-epiglottitis', title: 'Epiglottitis (Imaging)', url: 'https://radiopaedia.org/articles/epiglottitis', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'ent' },
  { id: 'ent-radiopaedia-foreign-body', title: 'Airway Foreign Body (Imaging)', url: 'https://radiopaedia.org/articles/tracheobronchial-foreign-body', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'ent' },
  { id: 'ent-medscape-epistaxis', title: 'Epistaxis - Clinical Overview', url: 'https://emedicine.medscape.com/article/863220-overview', type: 'article', source: 'Medscape', relevance: 'supplementary', category: 'ent' },
];

// ============================================================================
// OBSTETRIC RESOURCES
// ============================================================================

const obstetricResources: DebriefingResource[] = [
  { id: 'obs-emdocs-eclampsia', title: 'Pre-eclampsia and Eclampsia - Emergency Management', url: 'https://www.emdocs.net/eclampsia/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'obstetric' },
  { id: 'obs-emcases-obstetric', title: 'Obstetric Emergencies', url: 'https://emergencymedicinecases.com/obstetric-emergencies/', type: 'podcast', source: 'EM Cases', relevance: 'essential', category: 'obstetric' },
  { id: 'obs-rcuk-maternal', title: 'Maternal Cardiac Arrest Guidelines', url: 'https://www.resus.org.uk/library/2021-resuscitation-guidelines/special-circumstances-guidelines', type: 'guideline', source: 'Resuscitation Council UK', relevance: 'essential', category: 'obstetric' },
  { id: 'obs-nice-preeclampsia', title: 'NICE: Hypertension in Pregnancy', url: 'https://www.nice.org.uk/guidance/ng133', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'obstetric' },
  { id: 'obs-who-maternal', title: 'WHO: Managing Complications in Pregnancy', url: 'https://www.who.int/publications/i/item/9789241545587', type: 'guideline', source: 'WHO', relevance: 'important', category: 'obstetric' },
  { id: 'obs-litfl-pph', title: 'Postpartum Haemorrhage Management', url: 'https://litfl.com/postpartum-haemorrhage/', type: 'article', source: 'LITFL', relevance: 'important', category: 'obstetric' },
  { id: 'obs-medscape-eclampsia', title: 'Eclampsia - Clinical Overview', url: 'https://emedicine.medscape.com/article/253960-overview', type: 'article', source: 'Medscape', relevance: 'supplementary', category: 'obstetric' },
];

// ============================================================================
// TOXICOLOGY RESOURCES
// ============================================================================

const toxicologyResources: DebriefingResource[] = [
  { id: 'tox-emdocs-toxidromes', title: 'Toxidromes - Pattern Recognition', url: 'https://www.emdocs.net/toxidromes/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'toxicology' },
  { id: 'tox-litfl-toxicology', title: 'Clinical Toxicology Library', url: 'https://litfl.com/toxicology-library/', type: 'article', source: 'LITFL', relevance: 'essential', category: 'toxicology' },
  { id: 'tox-emcrit-intox', title: 'Toxicological Emergencies', url: 'https://emcrit.org/emcrit/toxicology/', type: 'article', source: 'EMCrit', relevance: 'important', category: 'toxicology' },
  { id: 'tox-rebelem-paracetamol', title: 'Paracetamol Overdose - Evidence', url: 'https://rebelem.com/acetaminophen-toxicity/', type: 'article', source: 'REBEL EM', relevance: 'essential', category: 'toxicology' },
  { id: 'tox-emcases-poisoning', title: 'Poisoning and Overdose - Cases', url: 'https://emergencymedicinecases.com/toxicology/', type: 'podcast', source: 'EM Cases', relevance: 'important', category: 'toxicology' },
  { id: 'tox-medscape-overdose', title: 'Drug Overdose - Clinical Overview', url: 'https://emedicine.medscape.com/article/818583-overview', type: 'article', source: 'Medscape', relevance: 'supplementary', category: 'toxicology' },
];

// ============================================================================
// ALL RESOURCES BY CATEGORY
// ============================================================================

// ============================================================================
// GENERAL / MULTI-SYSTEM RESOURCES (syncope, sepsis, general assessment)
// ============================================================================

const generalResources: DebriefingResource[] = [
  { id: 'gen-emdocs-syncope', title: 'Syncope - ED Approach and Differential', url: 'https://www.emdocs.net/syncope-an-evidence-based-approach/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'general' },
  { id: 'gen-litfl-syncope', title: 'Syncope - Evaluation and Risk Stratification', url: 'https://litfl.com/syncope/', type: 'article', source: 'LITFL', relevance: 'essential', category: 'general' },
  { id: 'gen-emcases-syncope', title: 'Approach to Syncope', url: 'https://emergencymedicinecases.com/syncope/', type: 'podcast', source: 'EM Cases', relevance: 'essential', category: 'general' },
  { id: 'gen-nice-syncope', title: 'NICE: Transient Loss of Consciousness (Syncope)', url: 'https://www.nice.org.uk/guidance/cg109', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'general' },
  { id: 'gen-medscape-syncope', title: 'Syncope - Clinical Overview', url: 'https://emedicine.medscape.com/article/811669-overview', type: 'article', source: 'Medscape', relevance: 'important', category: 'general' },
  { id: 'gen-rebelem-syncope', title: 'Syncope Red Flags and Disposition', url: 'https://rebelem.com/syncope/', type: 'article', source: 'REBEL EM', relevance: 'important', category: 'general' },
  { id: 'gen-emdocs-assessment', title: 'Systematic Clinical Assessment - ABCDE', url: 'https://www.emdocs.net/abcde-approach/', type: 'article', source: 'EMDocs', relevance: 'important', category: 'general' },
  { id: 'gen-nice-sepsis', title: 'NICE: Sepsis Recognition and Management', url: 'https://www.nice.org.uk/guidance/ng51', type: 'guideline', source: 'NICE', relevance: 'important', category: 'general' },
  { id: 'gen-rcuk-medical-emergencies', title: 'Medical Emergencies and Resuscitation', url: 'https://www.resus.org.uk/library/2021-resuscitation-guidelines/adult-basic-life-support-guidelines', type: 'guideline', source: 'Resuscitation Council UK', relevance: 'supplementary', category: 'general' },
];

// Burns-specific resources — drawn from trauma + dedicated burns sources
const burnsResources: DebriefingResource[] = [
  { id: 'burns-nice-burns', title: 'NICE: Burns and Scalds', url: 'https://cks.nice.org.uk/topics/burns-scalds/', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'burns' },
  { id: 'burns-rcuk-burns', title: 'Emergency Treatment of Burns', url: 'https://www.resus.org.uk/library/additional-guidance/guidance-post-resuscitation-care', type: 'guideline', source: 'Resuscitation Council UK', relevance: 'essential', category: 'burns' },
  { id: 'burns-emdocs-burns', title: 'Burns in the ED - Pearls and Pitfalls', url: 'https://www.emdocs.net/burns-in-the-ed/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'burns' },
  { id: 'burns-litfl-burns', title: 'Burns - Assessment and Management', url: 'https://litfl.com/burns/', type: 'article', source: 'LITFL', relevance: 'essential', category: 'burns' },
  { id: 'burns-rebel-inhalation', title: 'Inhalation Injury - Evidence Review', url: 'https://rebelem.com/inhalation-injury/', type: 'article', source: 'REBEL EM', relevance: 'essential', category: 'burns' },
  { id: 'burns-radiopedia-burns', title: 'Burns (Imaging)', url: 'https://radiopaedia.org/articles/burns', type: 'image', source: 'Radiopaedia', relevance: 'important', category: 'burns' },
  { id: 'burns-emcrit-fluid', title: 'Burns Fluid Resuscitation - Parkland Formula', url: 'https://emcrit.org/ibcc/burns/', type: 'article', source: 'EMCrit', relevance: 'essential', category: 'burns' },
  { id: 'burns-medscape-overview', title: 'Burns - Clinical Management Overview', url: 'https://emedicine.medscape.com/article/1278244-overview', type: 'article', source: 'Medscape', relevance: 'supplementary', category: 'burns' },
  { id: 'burns-dermnetnz', title: 'Burns Assessment and Classification', url: 'https://dermnetnz.org/topics/burn', type: 'article', source: 'DermNet NZ', relevance: 'important', category: 'burns' },
  { id: 'burns-emcases-burns', title: 'Approach to Burns', url: 'https://emergencymedicinecases.com/approach-to-burns/', type: 'podcast', source: 'EM Cases', relevance: 'important', category: 'burns' },
];

// Environmental-specific resources
const environmentalResources: DebriefingResource[] = [
  { id: 'env-nice-hypothermia', title: 'NICE: Hypothermia - Prevention and Management', url: 'https://www.nice.org.uk/guidance/cg161', type: 'guideline', source: 'NICE', relevance: 'essential', category: 'environmental' },
  { id: 'env-litfl-hyperthermia', title: 'Heat Stroke and Heat Exhaustion', url: 'https://litfl.com/heat-stroke/', type: 'article', source: 'LITFL', relevance: 'essential', category: 'environmental' },
  { id: 'env-emdocs-drowning', title: 'Drowning - ED Management Pearls', url: 'https://www.emdocs.net/drowning/', type: 'article', source: 'EMDocs', relevance: 'essential', category: 'environmental' },
  { id: 'env-rebel-hypothermia', title: 'Accidental Hypothermia - Evidence Review', url: 'https://rebelem.com/accidental-hypothermia/', type: 'article', source: 'REBEL EM', relevance: 'essential', category: 'environmental' },
  { id: 'env-emcrit-temp', title: 'Temperature Management in the ED', url: 'https://emcrit.org/ibcc/temperature-management/', type: 'article', source: 'EMCrit', relevance: 'important', category: 'environmental' },
];

export const categoryResources: Partial<Record<string, DebriefingResource[]>> = {
  cardiac: cardiacResources,
  respiratory: respiratoryResources,
  trauma: traumaResources,
  neurological: neurologicalResources,
  metabolic: metabolicResources,
  pediatric: pediatricResources,
  dermatological: dermatologicalResources,
  abdominal: abdominalResources,
  ophthalmic: ophthalmicResources,
  ent: entResources,
  obstetric: obstetricResources,
  toxicology: toxicologyResources,
  general: generalResources,
  burns: burnsResources,
  environmental: environmentalResources,
};

// ============================================================================
// SUBCATEGORY → KEYWORD MAPPING (for condition-specific resource matching)
// ============================================================================

/**
 * Maps case subcategories/diagnoses to keywords used to score resource relevance.
 * Resources whose title contains these keywords get boosted.
 * Resources whose title contains NEGATIVE keywords get demoted.
 */
const subcategoryKeywords: Record<string, { boost: string[]; demote: string[] }> = {
  // Cardiac
  'stem-anterior': { boost: ['stemi', 'acs', 'coronary', 'myocardial', 'ecg', 'reperfusion', 'aspirin', 'pci'], demote: ['syncope', 'af ', 'atrial fib', 'flutter'] },
  'stem-inferior': { boost: ['stemi', 'acs', 'coronary', 'myocardial', 'ecg', 'inferior', 'right ventricle'], demote: ['syncope', 'af ', 'flutter'] },
  'nstemi': { boost: ['nstemi', 'acs', 'coronary', 'troponin', 'chest pain', 'antiplatelet'], demote: ['syncope', 'af ', 'flutter'] },
  'afib': { boost: ['atrial fib', 'af ', 'arrhythmia', 'rate control', 'anticoagul'], demote: ['stemi', 'reperfusion', 'thrombol'] },
  'aflutter': { boost: ['atrial flutter', 'arrhythmia', 'rate control', 'cardioversion'], demote: ['stemi', 'reperfusion'] },
  'svt': { boost: ['svt', 'supraventricular', 'adenosine', 'vagal', 'arrhythmia'], demote: ['stemi', 'reperfusion'] },
  'asystole': { boost: ['cardiac arrest', 'als', 'cpr', 'resuscitation', 'adrenaline', 'epinephrine'], demote: ['stemi', 'af ', 'syncope'] },
  'vfib': { boost: ['cardiac arrest', 'defibrillation', 'vf', 'als', 'cpr', 'resuscitation', 'shockable'], demote: ['syncope', 'af '] },
  'hypertensive-emergency': { boost: ['hypertensive', 'blood pressure', 'end-organ', 'labetalol', 'aortic dissection'], demote: ['stemi', 'af ', 'syncope'] },
  'syncope': { boost: ['syncope', 'loss of consciousness', 'vasovagal', 'orthostatic', 'differential'], demote: ['stemi', 'reperfusion', 'thrombol', 'pci', 'door-to-balloon'] },

  // Respiratory
  'asthma': { boost: ['asthma', 'bronchospasm', 'salbutamol', 'wheeze', 'peak flow', 'steroid'], demote: ['copd', 'pneumothorax', 'embolism'] },
  'copd': { boost: ['copd', 'chronic obstructive', 'exacerbation', 'niv', 'bipap', 'hypercapn'], demote: ['asthma', 'pneumothorax', 'embolism'] },
  'pneumothorax-tension': { boost: ['pneumothorax', 'tension', 'decompression', 'needle', 'chest drain'], demote: ['asthma', 'copd', 'embolism'] },
  'pulmonary-embolism': { boost: ['pulmonary embolism', 'pe', 'dvt', 'anticoagul', 'wells', 'thrombol'], demote: ['asthma', 'copd', 'pneumothorax'] },
  'pneumonia': { boost: ['pneumonia', 'sepsis', 'antibiotic', 'consolidation', 'curb-65'], demote: ['asthma', 'pneumothorax'] },
  'choking': { boost: ['choking', 'foreign body', 'airway obstruction', 'heimlich', 'back blows', 'abdominal thrust', 'fbao', 'magill'], demote: ['asthma', 'copd', 'pneumonia', 'pneumothorax', 'ventilation', 'niv'] },

  // Trauma
  'multi-trauma': { boost: ['polytrauma', 'primary survey', 'haemorrhage', 'massive transfusion', 'tourniquet'], demote: [] },
  'head-injury': { boost: ['head injury', 'tbi', 'traumatic brain', 'gcs', 'intracranial', 'cushing'], demote: ['tourniquet', 'pelvic'] },
  'chest-trauma': { boost: ['chest trauma', 'thoracic', 'pneumothorax', 'haemothorax', 'flail', 'tamponade'], demote: ['head injury', 'pelvic'] },
  'abdominal-trauma': { boost: ['abdominal', 'splenic', 'liver', 'peritonitis', 'blunt trauma'], demote: ['head injury', 'chest trauma'] },
  'pelvic-fracture': { boost: ['pelvic', 'pelvis', 'binder', 'haemorrhage', 'retroperitoneal'], demote: ['head injury', 'chest trauma'] },
  'spinal-injury': { boost: ['spinal', 'spine', 'cord', 'immobilis', 'neurogenic shock', 'log roll'], demote: [] },

  // Neurological
  'stroke': { boost: ['stroke', 'cerebrovascular', 'thrombolysis', 'fast', 'ct head', 'nihss'], demote: ['seizure', 'meningitis'] },
  'seizure': { boost: ['seizure', 'epilep', 'status epilepticus', 'benzodiazepine', 'midazolam'], demote: ['stroke', 'meningitis'] },
  'meningitis': { boost: ['meningitis', 'meningococcal', 'lumbar puncture', 'sepsis', 'rash'], demote: ['stroke', 'seizure'] },

  // Burns
  'thermal-burns': { boost: ['burns', 'tbsa', 'parkland', 'inhalation', 'eschar', 'fluid resuscitation', 'rule of 9'], demote: ['fracture', 'head injury'] },
  'chemical-burns': { boost: ['chemical burn', 'decontamination', 'irrigation', 'alkali', 'acid burn'], demote: ['thermal', 'fire'] },
  'electrical-burns': { boost: ['electrical burn', 'electrocution', 'cardiac monitoring', 'entry exit wound'], demote: ['thermal', 'chemical'] },

  // Environmental
  'heat-stroke': { boost: ['heat stroke', 'hyperthermia', 'cooling', 'core temperature', 'exertional'], demote: ['hypothermia', 'drowning'] },
  'hypothermia': { boost: ['hypothermia', 'rewarming', 'core temperature', 'cold exposure'], demote: ['heat stroke', 'hyperthermia'] },
  'drowning': { boost: ['drowning', 'submersion', 'near-drowning', 'pulmonary oedema'], demote: ['heat stroke', 'hypothermia'] },

  // Pediatric
  'febrile-seizure': { boost: ['febrile seizure', 'fever', 'pediatric', 'paediatric', 'child', 'midazolam', 'antipyretic'], demote: ['adult', 'stroke', 'acs'] },
  'croup': { boost: ['croup', 'stridor', 'barking cough', 'dexamethasone', 'nebulised adrenaline'], demote: ['asthma', 'copd', 'adult'] },
  'bronchiolitis': { boost: ['bronchiolitis', 'rsv', 'infant', 'wheeze', 'supportive care'], demote: ['asthma', 'copd', 'adult'] },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get resources for a specific case category.
 */
export function getResourcesForCategory(category: string): DebriefingResource[] {
  return categoryResources[category] || [];
}

/**
 * Score a resource's relevance to a specific case based on keyword matching.
 * Higher score = more relevant to this particular case.
 */
function scoreResourceRelevance(resource: DebriefingResource, caseData: CaseScenario): number {
  let score = 0;
  const titleLower = resource.title.toLowerCase();
  const subcategory = caseData.subcategory || '';
  const keywords = subcategoryKeywords[subcategory];

  if (keywords) {
    // Boost resources that match the subcategory keywords
    for (const kw of keywords.boost) {
      if (titleLower.includes(kw.toLowerCase())) {
        score += 10;
      }
    }
    // Demote resources for other conditions
    for (const kw of keywords.demote) {
      if (titleLower.includes(kw.toLowerCase())) {
        score -= 15;
      }
    }
  }

  // Also check against case title and diagnosis
  const caseTitleLower = caseData.title.toLowerCase();
  const diagnosisLower = caseData.expectedFindings?.mostLikelyDiagnosis?.toLowerCase() || '';
  const caseKeywords = [caseTitleLower, diagnosisLower, subcategory.toLowerCase()];

  for (const caseKw of caseKeywords) {
    if (caseKw && titleLower.includes(caseKw)) {
      score += 5;
    }
  }

  // Relevance baseline
  const relevanceBase = { essential: 3, important: 2, supplementary: 1 };
  score += relevanceBase[resource.relevance] || 0;

  return score;
}

/**
 * Get resources matched to a case for debriefing.
 * Uses subcategory keyword scoring to return condition-specific resources,
 * not just everything in the category.
 */
export function getResourcesForDebriefing(
  caseData: CaseScenario,
  objective?: SimulationObjective
): DebriefingResource[] {
  const allResources: DebriefingResource[] = [];

  // Get category resources
  const categoryRes = getResourcesForCategory(caseData.category);
  allResources.push(...categoryRes);

  // Cross-category inclusion: some conditions span categories (e.g., PE is cardiac + respiratory)
  // Pull essential/important resources from related categories when subcategory suggests overlap
  const crossCategoryMap: Record<string, string[]> = {
    'pulmonary-embolism': ['respiratory'],   // PE cases need respiratory resources too
    'cardiac-tamponade': ['trauma'],          // Tamponade may be traumatic
    'anaphylaxis': ['respiratory', 'cardiac'], // Anaphylaxis spans airway + cardiac
    'choking': ['airway'],                     // FBAO is an airway emergency
    'drowning': ['respiratory'],               // Drowning → respiratory failure
  };
  const relatedCategories = crossCategoryMap[caseData.subcategory || ''] || [];
  for (const relCat of relatedCategories) {
    if (relCat !== caseData.category) {
      const crossRes = getResourcesForCategory(relCat);
      allResources.push(...crossRes.filter(r => r.relevance === 'essential' || r.relevance === 'important'));
    }
  }

  // If objective spans multiple categories, include essential resources from those
  if (objective) {
    for (const cat of objective.relatedCategories) {
      if (cat !== caseData.category) {
        const additionalRes = getResourcesForCategory(cat);
        allResources.push(...additionalRes.filter(r => r.relevance === 'essential'));
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = allResources.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  // Score each resource by relevance to this specific case
  const scored = unique.map(r => ({
    resource: r,
    score: scoreResourceRelevance(r, caseData),
  }));

  // Filter out negatively-scored resources (wrong condition)
  const relevant = scored.filter(s => s.score >= 0);

  // Sort by score descending, then by relevance tier
  relevant.sort((a, b) => b.score - a.score);

  // Return top resources — enough variety but not overwhelming
  return relevant.slice(0, 12).map(s => s.resource);
}

/**
 * Get resources suitable for pre-briefing (orientation material).
 * Returns essential articles and guidelines only, limited to 6.
 */
export function getResourcesForPreBriefing(
  caseData: CaseScenario,
  objective?: SimulationObjective
): DebriefingResource[] {
  const all = getResourcesForDebriefing(caseData, objective);

  // For pre-briefing, prioritise guidelines and essential articles
  const preBriefingResources = all.filter(r =>
    r.relevance === 'essential' || r.type === 'guideline'
  );

  return preBriefingResources.slice(0, 6);
}

/**
 * Get all resources across all categories.
 */
export function getAllResources(): DebriefingResource[] {
  return Object.values(categoryResources).flat() as DebriefingResource[];
}

/**
 * Search resources by text query.
 */
export function searchResources(query: string): DebriefingResource[] {
  const lower = query.toLowerCase();
  return getAllResources().filter(r =>
    r.title.toLowerCase().includes(lower) ||
    r.source.toLowerCase().includes(lower) ||
    r.category.toLowerCase().includes(lower)
  );
}

export default {
  resourceSources,
  categoryResources,
  getResourcesForCategory,
  getResourcesForDebriefing,
  getResourcesForPreBriefing,
  getAllResources,
  searchResources,
};
