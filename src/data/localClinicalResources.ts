/**
 * Local Clinical Resource Storage System
 *
 * Condition-specific resources mapped to case categories and findings.
 * Each resource is relevant to its specific condition for the pre-hospital setting.
 */

export interface LocalImageResource {
  id: string;
  name: string;
  category: string;
  localPath: string;
  externalUrl?: string;
  description: string;
  attribution: string;
  clinicalSigns: string[];
  relatedConditions: string[];
  type: 'image' | 'video' | 'audio';
}

export interface LocalVideoResource {
  id: string;
  name: string;
  category: string;
  youtubeId: string;
  thumbnailPath?: string;
  description: string;
  duration: string;
  source: string;
  tags?: string[];
}

export interface LocalAudioResource {
  id: string;
  name: string;
  category: string;
  description: string;
  // Frequency/pattern params for Web Audio synthesis
  synthesisType: 'wheeze' | 'stridor' | 'crackles' | 'rhonchi' | 'pleural-rub' | 'normal-breath';
  duration: number; // seconds
}

// ============================================================================
// CLINICAL IMAGES - Organized by condition
// ============================================================================

export const localClinicalImages: LocalImageResource[] = [
  // CARDIAC
  {
    id: 'pulmonary-edema-cxr',
    name: 'Pulmonary Edema on Chest X-ray',
    category: 'cardiac',
    localPath: '/images/clinical/pulmonary-edema.jpg',
    externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Chest_X-ray_of_pulmonary_edema.jpg/640px-Chest_X-ray_of_pulmonary_edema.jpg',
    description: 'Bilateral perihilar infiltrates with butterfly pattern, cardiomegaly, and pleural effusions',
    attribution: 'Wikimedia Commons / James Heilman, MD',
    clinicalSigns: ['Crackles', 'Dyspnea', 'JVD', 'Pedal Edema'],
    relatedConditions: ['Heart Failure', 'Acute Pulmonary Edema', 'Cardiogenic Shock'],
    type: 'image'
  },
  {
    id: 'jvd-clinical',
    name: 'Jugular Venous Distension',
    category: 'cardiac',
    localPath: '/images/clinical/jugular-venous-distension.jpg',
    externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Jugular_venous_distension.jpg/640px-Jugular_venous_distension.jpg',
    description: 'Elevated jugular venous pressure visible above clavicle at 45 degrees',
    attribution: 'Wikimedia Commons',
    clinicalSigns: ['JVD', 'Elevated JVP', 'Right Heart Failure'],
    relatedConditions: ['Heart Failure', 'Cardiac Tamponade', 'Constrictive Pericarditis'],
    type: 'image'
  },
  {
    id: 'stemi-ecg',
    name: 'STEMI on 12-Lead ECG',
    category: 'cardiac',
    localPath: '/images/clinical/stemi-ecg.jpg',
    externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/12_lead_ECG_showing_ST_elevation.jpg/640px-12_lead_ECG_showing_ST_elevation.jpg',
    description: 'ST elevation in contiguous leads indicating acute myocardial infarction',
    attribution: 'Wikimedia Commons / Michael E. DeBakey VA Medical Center',
    clinicalSigns: ['Chest Pain', 'ST Elevation', 'T-wave Inversion'],
    relatedConditions: ['STEMI', 'Acute Coronary Syndrome', 'Myocardial Infarction'],
    type: 'image'
  },

  // RESPIRATORY
  {
    id: 'pneumothorax-cxr',
    name: 'Tension Pneumothorax on X-ray',
    category: 'respiratory',
    localPath: '/images/clinical/tension-pneumothorax.jpg',
    externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tension_Pneumothorax_-_Chest_X-ray.jpg/640px-Tension_Pneumothorax_-_Chest_X-ray.jpg',
    description: 'Collapsed lung with mediastinal shift and tracheal deviation',
    attribution: 'Wikimedia Commons / Hellerhoff',
    clinicalSigns: ['Absent Breath Sounds', 'Tracheal Deviation', 'Hypotension', 'Distended Neck Veins'],
    relatedConditions: ['Tension Pneumothorax', 'Chest Trauma', 'Respiratory Failure'],
    type: 'image'
  },
  {
    id: 'asthma-cxr',
    name: 'Hyperinflation in Acute Asthma',
    category: 'respiratory',
    localPath: '/images/clinical/asthma-hyperinflation.jpg',
    externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Emphysema_chest_x-ray.jpg/640px-Emphysema_chest_x-ray.jpg',
    description: 'Hyperinflated lung fields with flattened diaphragms in severe asthma',
    attribution: 'Wikimedia Commons',
    clinicalSigns: ['Wheeze', 'Dyspnea', 'Accessory Muscle Use', 'Hyperinflation'],
    relatedConditions: ['Acute Asthma', 'Status Asthmaticus', 'COPD Exacerbation'],
    type: 'image'
  },

  // TRAUMA
  {
    id: 'chest-drain',
    name: 'Chest Drain Insertion',
    category: 'trauma',
    localPath: '/images/clinical/chest-drain.jpg',
    externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Chest_tube_X-ray.jpg/640px-Chest_tube_X-ray.jpg',
    description: 'Proper placement of intercostal catheter for pneumothorax drainage',
    attribution: 'Wikimedia Commons / Lucien Monfils',
    clinicalSigns: ['Chest Tube', 'Pneumothorax', 'Hemothorax'],
    relatedConditions: ['Pneumothorax', 'Hemothorax', 'Chest Trauma'],
    type: 'image'
  },

  // NEUROLOGICAL
  {
    id: 'head-trauma-ct',
    name: 'Traumatic Brain Injury on CT',
    category: 'neurological',
    localPath: '/images/clinical/tbi-ct.jpg',
    externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Epidural_hematoma_CT.jpg/640px-Epidural_hematoma_CT.jpg',
    description: 'Epidural hematoma with lens-shaped appearance',
    attribution: 'Wikimedia Commons / Hellerhoff',
    clinicalSigns: ['Altered GCS', 'Headache', 'Vomiting', 'Focal Neurological Deficit'],
    relatedConditions: ['Traumatic Brain Injury', 'Epidural Hematoma', 'Subdural Hematoma'],
    type: 'image'
  },

  // INFECTION / SEPSIS
  {
    id: 'surgical-wound-infection',
    name: 'Surgical Site Infection',
    category: 'infection',
    localPath: '/images/clinical/wound-infection.jpg',
    externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Wound_infection.jpg/640px-Wound_infection.jpg',
    description: 'Post-operative wound with erythema, purulent drainage, and surrounding cellulitis',
    attribution: 'Wikimedia Commons',
    clinicalSigns: ['Erythema', 'Purulent Drainage', 'Warmth', 'Swelling', 'Fever'],
    relatedConditions: ['Surgical Site Infection', 'Wound Infection', 'Sepsis', 'Cellulitis'],
    type: 'image'
  },
  {
    id: 'cellulitis-clinical',
    name: 'Cellulitis - Clinical Presentation',
    category: 'infection',
    localPath: '/images/clinical/cellulitis.jpg',
    externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Cellulitis_Of_The_Leg.jpg/640px-Cellulitis_Of_The_Leg.jpg',
    description: 'Spreading erythema with warmth, swelling, and tenderness indicating soft tissue infection',
    attribution: 'Wikimedia Commons',
    clinicalSigns: ['Erythema', 'Warmth', 'Tenderness', 'Swelling'],
    relatedConditions: ['Cellulitis', 'Soft Tissue Infection', 'Sepsis'],
    type: 'image'
  },
  {
    id: 'sepsis-rash',
    name: 'Purpuric Rash in Sepsis',
    category: 'infection',
    localPath: '/images/clinical/sepsis-purpura.jpg',
    externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Meningococcal_rash.jpg/640px-Meningococcal_rash.jpg',
    description: 'Non-blanching purpuric rash indicating sepsis with coagulopathy',
    attribution: 'Wikimedia Commons',
    clinicalSigns: ['Non-blanching Rash', 'Purpura', 'Petechiae', 'Shock Signs'],
    relatedConditions: ['Meningococcal Sepsis', 'DIC', 'Septic Shock'],
    type: 'image'
  },

  // METABOLIC
  {
    id: 'diabetic-foot-ulcer',
    name: 'Diabetic Foot Ulcer',
    category: 'metabolic',
    localPath: '/images/clinical/diabetic-foot.jpg',
    externalUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Neuropathic_ulcer.jpg/640px-Neuropathic_ulcer.jpg',
    description: 'Neuropathic ulcer on the plantar surface of the foot in diabetic patient',
    attribution: 'Wikimedia Commons',
    clinicalSigns: ['Ulceration', 'Neuropathy', 'Poor Circulation'],
    relatedConditions: ['Diabetes', 'Diabetic Foot', 'Peripheral Neuropathy'],
    type: 'image'
  },
];

// ============================================================================
// VIDEO RESOURCES - Condition-specific, pre-hospital focused
// ============================================================================

export const videoResources: LocalVideoResource[] = [
  // CARDIAC
  {
    id: 'heart-failure-mgmt',
    name: 'Acute Decompensated Heart Failure - Diagnosis and Management',
    category: 'cardiac',
    youtubeId: 'q7aN10XUhvI',
    description: 'Comprehensive overview of heart failure management in emergency settings',
    duration: '18:45',
    source: 'JAMA Network',
    tags: ['heart-failure', 'CPAP', 'nitrates', 'diuretics']
  },
  {
    id: 'cpap-pulmonary-edema',
    name: 'CPAP in Acute Pulmonary Edema',
    category: 'cardiac',
    youtubeId: 'dxFOYVUlY2U',
    description: 'Demonstration of CPAP application for acute cardiogenic pulmonary edema',
    duration: '14:20',
    source: 'Strong Medicine',
    tags: ['CPAP', 'pulmonary-edema', 'ventilation']
  },

  // TRAUMA
  {
    id: 'chest-drain-procedure',
    name: 'Chest Drain Insertion Procedure',
    category: 'trauma',
    youtubeId: 'd-ALzW6NcW0',
    description: 'Step-by-step guide to chest drain insertion technique',
    duration: '12:30',
    source: 'The Center for Medical Education',
    tags: ['chest-drain', 'pneumothorax', 'hemothorax']
  },
  {
    id: 'needle-decompression',
    name: 'Needle Decompression for Tension Pneumothorax',
    category: 'trauma',
    youtubeId: '1AlFaLuuPVs',
    description: 'Emergency needle decompression technique demonstration',
    duration: '8:15',
    source: 'PrepMedic',
    tags: ['needle-decompression', 'tension-pneumothorax', 'emergency']
  },

  // RESPIRATORY
  {
    id: 'asthma-nebulizer-prehospital',
    name: 'Prehospital Asthma Management - Nebulizer Administration',
    category: 'respiratory',
    youtubeId: 'NdBKXnrJbNw',
    description: 'Proper nebulizer setup and salbutamol administration for acute asthma in the field',
    duration: '10:30',
    source: 'PrepMedic',
    tags: ['asthma', 'nebulizer', 'salbutamol', 'prehospital']
  },
  {
    id: 'lung-sounds-auscultation',
    name: 'Lung Sounds - Wheeze, Crackles, Stridor',
    category: 'respiratory',
    youtubeId: '6BdGLjGOJBE',
    description: 'Audio examples of adventitious lung sounds including wheeze, crackles, rhonchi, and stridor',
    duration: '15:42',
    source: 'MedCram',
    tags: ['lung-sounds', 'wheeze', 'crackles', 'stridor', 'auscultation']
  },
  {
    id: 'copd-exacerbation-mgmt',
    name: 'COPD Exacerbation - Prehospital Management',
    category: 'respiratory',
    youtubeId: 'tn0rU1XQ_wk',
    description: 'Managing acute COPD exacerbation in the prehospital setting',
    duration: '11:15',
    source: 'Medic Mindset',
    tags: ['COPD', 'exacerbation', 'bronchodilator', 'prehospital']
  },

  // INFECTION / SEPSIS
  {
    id: 'sepsis-prehospital-recognition',
    name: 'Sepsis Recognition and Prehospital Management',
    category: 'infection',
    youtubeId: 'gHBu4L7hSQk',
    description: 'How to recognise sepsis in the prehospital setting and initiate early management including IV access and fluid resuscitation',
    duration: '12:30',
    source: 'PrepMedic',
    tags: ['sepsis', 'recognition', 'prehospital', 'fluid-resuscitation']
  },
  {
    id: 'wound-assessment-infection',
    name: 'Wound Assessment and Infection Signs',
    category: 'infection',
    youtubeId: 'Xt1g4V_tKWQ',
    description: 'Systematic wound assessment identifying signs of infection including erythema, drainage, and systemic signs',
    duration: '9:45',
    source: 'Emergency Medical Education',
    tags: ['wound', 'infection', 'assessment', 'dressing']
  },
  {
    id: 'sterile-dressing-application',
    name: 'Sterile Wound Dressing Application',
    category: 'infection',
    youtubeId: 'BqFdJbOJ5YE',
    description: 'Proper sterile dressing technique for infected or draining wounds',
    duration: '7:20',
    source: 'Clinical Skills',
    tags: ['dressing', 'sterile', 'wound-care', 'infection-control']
  },

  // NEUROLOGICAL
  {
    id: 'stroke-recognition-prehospital',
    name: 'Stroke Recognition - FAST Assessment',
    category: 'neurological',
    youtubeId: 'aHLjQ0gPM-g',
    description: 'Prehospital stroke recognition using FAST assessment and transport decision making',
    duration: '11:00',
    source: 'PrepMedic',
    tags: ['stroke', 'FAST', 'prehospital', 'thrombolysis-window']
  },

  // METABOLIC
  {
    id: 'hypoglycemia-management',
    name: 'Hypoglycemia - Prehospital Management',
    category: 'metabolic',
    youtubeId: 'MhSY2kFpVN0',
    description: 'Managing hypoglycemia in the field: oral glucose, IV dextrose, and IM glucagon',
    duration: '10:15',
    source: 'PrepMedic',
    tags: ['hypoglycemia', 'dextrose', 'glucagon', 'diabetes']
  },
];

// ============================================================================
// REFERENCE ARTICLES - Condition-specific
// ============================================================================

export const referenceArticles = [
  // Cardiac
  { id: 'emcrit-heart-failure', title: 'Heart Failure - Clinical Overview', source: 'EMCrit IBCC', url: 'https://emcrit.org/ibcc/chf/', category: 'cardiac' },
  { id: 'esc-heart-failure', title: 'ESC Guidelines for Heart Failure', source: 'European Society of Cardiology', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-and-Chronic-Heart-Failure-Guidelines', category: 'cardiac' },
  { id: 'acs-management', title: 'Acute Coronary Syndrome - Prehospital Management', source: 'LITFL', url: 'https://litfl.com/acute-coronary-syndrome/', category: 'cardiac' },

  // Respiratory
  { id: 'litfl-pneumothorax', title: 'Pneumothorax - Medical Overview', source: 'LITFL', url: 'https://litfl.com/pneumothorax/', category: 'respiratory' },
  { id: 'litfl-asthma', title: 'Asthma - Pathophysiology and Management', source: 'LITFL', url: 'https://litfl.com/asthma/', category: 'respiratory' },
  { id: 'bts-asthma', title: 'BTS/SIGN Asthma Management Guideline', source: 'British Thoracic Society', url: 'https://www.brit-thoracic.org.uk/quality-improvement/guidelines/asthma/', category: 'respiratory' },
  { id: 'litfl-copd', title: 'COPD - Chronic Obstructive Pulmonary Disease', source: 'LITFL', url: 'https://litfl.com/chronic-obstructive-pulmonary-disease-copd/', category: 'respiratory' },

  // Neurological
  { id: 'litfl-tbi', title: 'Traumatic Brain Injury', source: 'LITFL', url: 'https://litfl.com/traumatic-brain-injury/', category: 'neurological' },
  { id: 'litfl-stroke', title: 'Stroke - Recognition and Management', source: 'LITFL', url: 'https://litfl.com/stroke/', category: 'neurological' },

  // Infection / Sepsis
  { id: 'wiki-sepsis', title: 'Sepsis - Definition, Recognition, and Management', source: 'WikiEM', url: 'https://wikem.org/wiki/Sepsis', category: 'infection' },
  { id: 'nice-sepsis', title: 'NICE: Sepsis Recognition and Early Management (NG51)', source: 'NICE', url: 'https://www.nice.org.uk/guidance/ng51', category: 'infection' },
  { id: 'emcrit-ssi', title: 'Surgical Site Infection - Overview', source: 'EMDocs', url: 'https://www.emdocs.net/surgical-wound-infections-ed-evaluation-and-management/', category: 'infection' },
  { id: 'nice-skin-infection', title: 'NICE: Skin and Soft Tissue Infections', source: 'NICE', url: 'https://www.nice.org.uk/guidance/ng141', category: 'infection' },
  { id: 'surviving-sepsis', title: 'Surviving Sepsis Campaign Guidelines', source: 'SSC', url: 'https://www.sccm.org/SurvivingSepsisCampaign/Guidelines', category: 'infection' },

  // Metabolic
  { id: 'litfl-dka', title: 'Diabetic Ketoacidosis - Overview', source: 'LITFL', url: 'https://litfl.com/diabetic-ketoacidosis-dka/', category: 'metabolic' },
  { id: 'litfl-hypoglycemia', title: 'Hypoglycemia - Recognition and Management', source: 'LITFL', url: 'https://litfl.com/hypoglycaemia/', category: 'metabolic' },

  // Trauma
  { id: 'litfl-primary-survey', title: 'Primary Survey - ABCDE Assessment', source: 'LITFL', url: 'https://litfl.com/primary-survey/', category: 'trauma' },
  { id: 'litfl-atls', title: 'Advanced Trauma Life Support - Overview', source: 'LITFL', url: 'https://litfl.com/advanced-trauma-life-support-atls/', category: 'trauma' },
];

// ============================================================================
// AUDIBLE CLINICAL SOUNDS - For synthesis via Web Audio
// ============================================================================

export const clinicalAudioResources: LocalAudioResource[] = [
  { id: 'sound-wheeze', name: 'Expiratory Wheeze', category: 'respiratory', description: 'High-pitched musical sound during expiration, characteristic of asthma and bronchospasm', synthesisType: 'wheeze', duration: 5 },
  { id: 'sound-stridor', name: 'Inspiratory Stridor', category: 'respiratory', description: 'High-pitched harsh sound during inspiration, indicating upper airway obstruction', synthesisType: 'stridor', duration: 5 },
  { id: 'sound-crackles', name: 'Fine Crackles (Rales)', category: 'respiratory', description: 'Fine crackling sounds during inspiration, heard in pneumonia and pulmonary edema', synthesisType: 'crackles', duration: 5 },
  { id: 'sound-rhonchi', name: 'Rhonchi', category: 'respiratory', description: 'Low-pitched rumbling sounds caused by secretions in large airways', synthesisType: 'rhonchi', duration: 5 },
  { id: 'sound-pleural-rub', name: 'Pleural Friction Rub', category: 'respiratory', description: 'Grating sound heard with both inspiration and expiration, indicating pleural inflammation', synthesisType: 'pleural-rub', duration: 5 },
  { id: 'sound-normal-breath', name: 'Normal Breath Sounds', category: 'respiratory', description: 'Normal vesicular breath sounds for comparison', synthesisType: 'normal-breath', duration: 5 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getImageResource(id: string): LocalImageResource | undefined {
  return localClinicalImages.find(img => img.id === id);
}

export function getImagesByCategory(category: string): LocalImageResource[] {
  return localClinicalImages.filter(img => img.category === category);
}

/**
 * Get images matching specific clinical findings/conditions.
 * Searches across name, description, clinicalSigns, and relatedConditions.
 */
export function getImagesByFindings(findings: string[]): LocalImageResource[] {
  if (!findings || findings.length === 0) return [];
  const lowerFindings = findings.filter(f => typeof f === 'string').map(f => f.toLowerCase());

  return localClinicalImages.filter(img => {
    const searchText = [
      img.name,
      img.description,
      ...img.clinicalSigns,
      ...img.relatedConditions
    ].join(' ').toLowerCase();

    return lowerFindings.some(f => searchText.includes(f));
  });
}

export function getVideoResource(id: string): LocalVideoResource | undefined {
  return videoResources.find(vid => vid.id === id);
}

export function getVideosByCategory(category: string): LocalVideoResource[] {
  return videoResources.filter(vid => vid.category === category);
}

/**
 * Get videos matching specific tags or condition keywords.
 */
export function getVideosByFindings(findings: string[]): LocalVideoResource[] {
  if (!findings || findings.length === 0) return [];
  const lowerFindings = findings.filter(f => typeof f === 'string').map(f => f.toLowerCase());

  return videoResources.filter(vid => {
    const searchText = [
      vid.name,
      vid.description,
      ...(vid.tags || [])
    ].join(' ').toLowerCase();

    return lowerFindings.some(f => searchText.includes(f));
  });
}

export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

export function getYouTubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

/**
 * Get audio resources for a specific condition/category.
 */
export function getAudiosByCategory(category: string): LocalAudioResource[] {
  return clinicalAudioResources.filter(a => a.category === category);
}

export default {
  localClinicalImages,
  videoResources,
  referenceArticles,
  clinicalAudioResources,
  getImageResource,
  getImagesByCategory,
  getImagesByFindings,
  getVideoResource,
  getVideosByCategory,
  getVideosByFindings,
  getYouTubeEmbedUrl,
  getYouTubeWatchUrl,
  getAudiosByCategory,
};
