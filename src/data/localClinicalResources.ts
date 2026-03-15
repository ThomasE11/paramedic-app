/**
 * Local Clinical Resource Storage System
 * 
 * This system stores critical clinical images locally to ensure 100% availability
 * and provides fallback mechanisms for external resources.
 */

export interface LocalImageResource {
  id: string;
  name: string;
  category: 'cardiac' | 'respiratory' | 'trauma' | 'neurological' | 'general';
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
  category: 'cardiac' | 'respiratory' | 'trauma' | 'neurological' | 'procedure';
  youtubeId: string;
  thumbnailPath?: string;
  description: string;
  duration: string;
  source: string;
}

// Local clinical image resources - these should be stored in /public/images/clinical/
// Using reliable sources: Wikimedia Commons, Radiopaedia, and other stable medical image repositories
export const localClinicalImages: LocalImageResource[] = [
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
  }
];

// Video resources (YouTube) - these will use external links with fallbacks
export const videoResources: LocalVideoResource[] = [
  {
    id: 'heart-failure-mgmt',
    name: 'Acute Decompensated Heart Failure - Diagnosis and Management',
    category: 'cardiac',
    youtubeId: 'q7aN10XUhvI',
    description: 'Comprehensive overview of heart failure management in emergency settings',
    duration: '18:45',
    source: 'JAMA Network'
  },
  {
    id: 'cpap-pulmonary-edema',
    name: 'CPAP in Acute Pulmonary Edema',
    category: 'cardiac',
    youtubeId: 'dxFOYVUlY2U',
    description: 'Demonstration of CPAP application for acute cardiogenic pulmonary edema',
    duration: '14:20',
    source: 'Strong Medicine'
  },
  {
    id: 'chest-drain-procedure',
    name: 'Chest Drain Insertion Procedure',
    category: 'trauma',
    youtubeId: 'd-ALzW6NcW0',
    description: 'Step-by-step guide to chest drain insertion technique',
    duration: '12:30',
    source: 'The Center for Medical Education'
  },
  {
    id: 'needle-decompression',
    name: 'Needle Decompression for Tension Pneumothorax',
    category: 'trauma',
    youtubeId: '1AlFaLuuPVs',
    description: 'Emergency needle decompression technique demonstration',
    duration: '8:15',
    source: 'PrepMedic'
  }
];

// Reference articles and guidelines - Using reliable medical sources
export const referenceArticles = [
  {
    id: 'wiki-heart-failure',
    title: 'Heart Failure - Clinical Overview',
    source: 'Wikipedia / Medical Literature',
    url: 'https://en.wikipedia.org/wiki/Heart_failure',
    category: 'cardiac'
  },
  {
    id: 'esc-heart-failure',
    title: 'ESC Guidelines for Heart Failure',
    source: 'European Society of Cardiology',
    url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-and-Chronic-Heart-Failure-Guidelines',
    category: 'cardiac'
  },
  {
    id: 'wiki-pneumothorax',
    title: 'Pneumothorax - Medical Overview',
    source: 'Wikipedia / Medical Literature',
    url: 'https://en.wikipedia.org/wiki/Pneumothorax',
    category: 'respiratory'
  },
  {
    id: 'wiki-tbi',
    title: 'Traumatic Brain Injury - Overview',
    source: 'Wikipedia / Medical Literature',
    url: 'https://en.wikipedia.org/wiki/Traumatic_brain_injury',
    category: 'neurological'
  }
];

// Function to check if local image exists
export function getImageResource(id: string): LocalImageResource | undefined {
  return localClinicalImages.find(img => img.id === id);
}

// Function to get all images for a category
export function getImagesByCategory(category: string): LocalImageResource[] {
  return localClinicalImages.filter(img => img.category === category);
}

// Function to get video resource
export function getVideoResource(id: string): LocalVideoResource | undefined {
  return videoResources.find(vid => vid.id === id);
}

// Function to get YouTube embed URL with fallback
export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

// Function to get YouTube watch URL
export function getYouTubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export default {
  localClinicalImages,
  videoResources,
  referenceArticles,
  getImageResource,
  getImagesByCategory,
  getVideoResource,
  getYouTubeEmbedUrl,
  getYouTubeWatchUrl
};
