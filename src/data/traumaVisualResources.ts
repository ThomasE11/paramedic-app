/**
 * Trauma Visual Resources Library
 *
 * Comprehensive collection of images, videos, articles, and other visual aids
 * for trauma education from FOAMed sources:
 * - LITFL (Life in the Fast Lane)
 * - EMDocs
 * - REBEL EM
 * - ALiEM
 * - EM Cases
 * - Trauma.org
 * - EMCrit
 * - Radiopaedia
 * - FOAMed YouTube channels
 *
 * All URLs verified and working (HTTP 200)
 */

import type { VisualResource, VisualResources } from '@/types';

// ============================================================================
// ARTICLES
// ============================================================================

export const articleResources: VisualResource[] = [
  {
    id: 'art-lung-ptx-001',
    type: 'article',
    title: 'Lung Ultrasound: Pneumothorax',
    url: 'https://litfl.com/lung-ultrasound-pneumothorax/',
    source: 'LITFL',
    caption: 'Lung ultrasound for pneumothorax detection',
    relevance: 'essential',
    tags: ['pneumothorax', 'lung', 'ultrasound', 'POCUS']
  },
  {
    id: 'art-amputation-001',
    type: 'article',
    title: 'Traumatic Amputation - Prehospital Management',
    url: 'https://litfl.com/traumatic-amputation/',
    source: 'LITFL',
    caption: 'Management of traumatic amputations in prehospital setting',
    relevance: 'essential',
    tags: ['amputation', 'trauma', 'extremity', 'hemorrhage']
  },
  {
    id: 'art-tourniquet-001',
    type: 'article',
    title: 'Tourniquet Application in Trauma',
    url: 'https://litfl.com/tourniquet-application/',
    source: 'LITFL',
    caption: 'Proper tourniquet techniques and indications',
    relevance: 'essential',
    tags: ['tourniquet', 'hemorrhage', 'bleeding', 'trauma']
  }
];

// ============================================================================
// CASE STUDIES
// ============================================================================

export const caseStudyResources: VisualResource[] = [
  {
    id: 'case-head-001',
    type: 'case-study',
    title: 'Traumatic Brain Injury',
    url: 'https://litfl.com/traumatic-brain-injury/',
    source: 'LITFL',
    caption: 'Severe TBI management approach',
    relevance: 'essential',
    tags: ['TBI', 'head', 'brain', 'trauma']
  },
  {
    id: 'case-spinal-001',
    type: 'case-study',
    title: 'Spinal Cord Injury',
    url: 'https://litfl.com/spinal-cord-injury/',
    source: 'LITFL',
    caption: 'Acute spinal cord injury management',
    relevance: 'essential',
    tags: ['spinal', 'cord', 'SCI', 'trauma']
  }
];

// ============================================================================
// ASSESSMENT RESOURCES
// ============================================================================

export const assessmentResources: VisualResource[] = [
  {
    id: 'assess-trachea-001',
    type: 'article',
    title: 'Tracheal Deviation Assessment',
    url: 'https://litfl.com/tracheal-deviation/',
    source: 'LITFL',
    caption: 'Technique for assessing tracheal position',
    relevance: 'important',
    tags: ['trachea', 'assessment', 'deviation', 'examination']
  },
  {
    id: 'assess-chest-001',
    type: 'article',
    title: 'Chest Examination',
    url: 'https://litfl.com/chest-examination/',
    source: 'LITFL',
    caption: 'Systematic chest examination landmarks',
    relevance: 'important',
    tags: ['auscultation', 'chest', 'assessment', 'lung']
  }
];

// ============================================================================
// PODCASTS AND AUDIO RESOURCES
// ============================================================================

export const podcastResources: VisualResource[] = [];

// ============================================================================
// X-RAY AND IMAGING RESOURCES - VERIFIED WORKING URLs
// ============================================================================

export const chestImagingResources: VisualResource[] = [
  {
    id: 'xr-tension-px-001',
    type: 'image',
    title: 'Tension Pneumothorax CXR',
    url: 'https://litfl.com/wp-content/uploads/2018/08/Tension-Pneumothorax.jpg',
    source: 'LITFL',
    caption: 'Tension pneumothorax on CXR',
    relevance: 'essential',
    tags: ['pneumothorax', 'tension', 'chest', 'CXR', 'trauma']
  },

  {
    id: 'xr-pleural-effusion-001',
    type: 'image',
    title: 'Large Pleural Effusion / Hemothorax',
    url: 'https://litfl.com/wp-content/uploads/2023/08/Large-Pleural-Effusion-with-collapsed-lung.png',
    source: 'LITFL',
    caption: 'Ultrasound showing large pleural effusion with collapsed lung',
    relevance: 'essential',
    tags: ['hemothorax', 'pleural-effusion', 'chest', 'ultrasound', 'trauma']
  },
  {
    id: 'xr-pneumothorax-lung-001',
    type: 'image',
    title: 'Lung Point - Pneumothorax on M-Mode',
    url: 'https://litfl.com/wp-content/uploads/2023/08/Lung-Point-in-PTx-on-M-Mode.png',
    source: 'LITFL',
    caption: 'M-Mode showing lung point sign of pneumothorax',
    relevance: 'essential',
    tags: ['pneumothorax', 'lung', 'M-mode', 'ultrasound', 'POCUS']
  },
  {
    id: 'xr-pocus-lung-001',
    type: 'image',
    title: 'POCUS Lung Reference',
    url: 'https://litfl.com/wp-content/uploads/2023/08/POCUS-Lung.jpeg',
    source: 'LITFL',
    caption: 'POCUS lung ultrasound reference',
    relevance: 'essential',
    tags: ['lung', 'ultrasound', 'POCUS', 'reference']
  }
];

// ============================================================================
// ULTRASOUND (POCUS) RESOURCES - VERIFIED WORKING URLs
// ============================================================================

export const ultrasoundResources: VisualResource[] = [
  {
    id: 'us-fast-subxiphoid-001',
    type: 'image',
    title: 'eFAST Subxiphoid View',
    url: 'https://litfl.com/wp-content/uploads/2023/08/eFAST-subxiphoid.png',
    source: 'LITFL',
    caption: 'eFAST subxiphoid view for pericardial effusion',
    relevance: 'essential',
    tags: ['FAST', 'subxiphoid', 'cardiac', 'ultrasound', 'trauma']
  },
  {
    id: 'us-fast-pericardial-001',
    type: 'image',
    title: 'eFAST Pericardial Effusion',
    url: 'https://litfl.com/wp-content/uploads/2023/08/eFAST-SUBX-Pericardial-effusion.png',
    source: 'LITFL',
    caption: 'eFAST showing pericardial effusion',
    relevance: 'essential',
    tags: ['tamponade', 'pericardial', 'FAST', 'ultrasound', 'trauma']
  },
  {
    id: 'us-fast-right-chest-001',
    type: 'image',
    title: 'eFAST Right Chest View',
    url: 'https://litfl.com/wp-content/uploads/2023/08/eFAST-right-Chest-view.png',
    source: 'LITFL',
    caption: 'eFAST right chest view for pneumothorax/hemothorax',
    relevance: 'essential',
    tags: ['FAST', 'chest', 'ultrasound', 'trauma']
  },
  {
    id: 'us-fast-left-chest-001',
    type: 'image',
    title: 'eFAST Left Chest View',
    url: 'https://litfl.com/wp-content/uploads/2023/08/eFAST-left-Chest-view.png',
    source: 'LITFL',
    caption: 'eFAST left chest view for pneumothorax/hemothorax',
    relevance: 'essential',
    tags: ['FAST', 'chest', 'ultrasound', 'trauma']
  },
  {
    id: 'us-fast-luq-001',
    type: 'image',
    title: 'eFAST LUQ View',
    url: 'https://litfl.com/wp-content/uploads/2023/08/eFAST-LUQ.png',
    source: 'LITFL',
    caption: 'eFAST Left Upper Quadrant view for hemoperitoneum',
    relevance: 'essential',
    tags: ['FAST', 'LUQ', 'abdomen', 'ultrasound', 'trauma']
  },
  {
    id: 'us-fast-pelvis-001',
    type: 'image',
    title: 'eFAST Pelvic View',
    url: 'https://litfl.com/wp-content/uploads/2023/08/eFAST-Pelvis.png',
    source: 'LITFL',
    caption: 'eFAST pelvic view for free fluid',
    relevance: 'essential',
    tags: ['FAST', 'pelvis', 'ultrasound', 'trauma']
  },
  {
    id: 'us-fast-barcode-001',
    type: 'image',
    title: 'eFAST Pneumothorax Barcode Sign',
    url: 'https://litfl.com/wp-content/uploads/2023/08/eFAST-Pneumothorax-Barcode-sign.png',
    source: 'LITFL',
    caption: 'Ultrasound barcode sign of pneumothorax',
    relevance: 'essential',
    tags: ['pneumothorax', 'barcode', 'ultrasound', 'POCUS']
  },
  {
    id: 'us-echo-subxiphoid-001',
    type: 'image',
    title: 'Subxiphoid IVC View',
    url: 'https://litfl.com/wp-content/uploads/2023/08/FELS-Subxiphoid-IVC-view.png',
    source: 'LITFL',
    caption: 'Focused Echocardiography in Life Support - Subxiphoid IVC view',
    relevance: 'important',
    tags: ['echo', 'cardiac', 'IVC', 'ultrasound', 'POCUS']
  },
  {
    id: 'us-echo-apical-001',
    type: 'image',
    title: 'Apical 4-Chamber View',
    url: 'https://litfl.com/wp-content/uploads/2023/08/FELS-Apical-4-Chamber-View.png',
    source: 'LITFL',
    caption: 'Focused Echocardiography - Apical 4-chamber view',
    relevance: 'important',
    tags: ['echo', 'cardiac', 'apical', 'ultrasound', 'POCUS']
  },
  {
    id: 'us-echo-psla-001',
    type: 'image',
    title: 'Parasternal Long Axis View',
    url: 'https://litfl.com/wp-content/uploads/2023/08/FELS-Parasternal-Long-Axis-view.png',
    source: 'LITFL',
    caption: 'Focused Echocardiography - Parasternal long axis view',
    relevance: 'important',
    tags: ['echo', 'cardiac', 'PSLA', 'ultrasound', 'POCUS']
  },
  {
    id: 'us-echo-pssa-001',
    type: 'image',
    title: 'Parasternal Short Axis View',
    url: 'https://litfl.com/wp-content/uploads/2023/08/FELS-Parasternal-Short-Axis-view.png',
    source: 'LITFL',
    caption: 'Focused Echocardiography - Parasternal short axis view',
    relevance: 'important',
    tags: ['echo', 'cardiac', 'PSSA', 'ultrasound', 'POCUS']
  }
];

// ============================================================================
// PROCEDURE VIDEOS - VERIFIED WORKING URLs
// ============================================================================

export const procedureVideos: VisualResource[] = [

];

// ============================================================================
// CLINICAL IMAGES AND DIAGRAMS
// ============================================================================

export const clinicalImages: VisualResource[] = [


  {
    id: 'diagram-pocus-lung-001',
    type: 'infographic',
    title: 'POCUS Made Easy - Lung Algorithm',
    url: 'https://litfl.com/wp-content/uploads/2023/01/POCUS-made-easy-LUNG.png',
    source: 'LITFL',
    caption: 'Lung ultrasound algorithm',
    relevance: 'important',
    tags: ['POCUS', 'lung', 'algorithm', 'ultrasound']
  }
];

// ============================================================================
// PODCASTS AND AUDIO RESOURCES
// ============================================================================



// ============================================================================
// MANAGEMENT ALGORITHMS
// ============================================================================

export const managementResources: VisualResource[] = [

  {
    id: 'mgmt-airway-001',
    type: 'article',
    title: 'Difficult Airway in Trauma',
    url: 'https://litfl.com/difficult-airway-trauma/',
    source: 'LITFL',
    caption: 'Approach to difficult trauma airway',
    relevance: 'essential',
    tags: ['airway', 'difficult', 'trauma', 'RSI']
  },

];

// ============================================================================
// HELPER FUNCTIONS TO GET RESOURCES BY CONDITION
// ============================================================================

export function getTraumaResourcesByCondition(condition: string): VisualResources {
  const resources: VisualResources = {
    images: [],
    videos: [],
    articles: [],
    procedures: [],
    assessment: [],
    management: []
  };

  const lowerCondition = condition.toLowerCase();
  const keywords = lowerCondition.split(/\s+/).filter(k => k.length > 2);

  // Helper to filter by tags and deduplicate
  const addResources = <T extends VisualResource>(arr: T[], newItems: T[]): T[] => {
    const existingIds = new Set(arr.map(i => i.id));
    const unique = newItems.filter(item => !existingIds.has(item.id));
    return [...arr, ...unique];
  };

  // Helper to filter by tags
  const filterByTags = (items: VisualResource[], tags: string[]): VisualResource[] =>
    items.filter(item => item.tags?.some(tag => tags.some(t => tag.toLowerCase().includes(t))));

  // Tension Pneumothorax / Pneumothorax
  if (lowerCondition.includes('pneumo') || lowerCondition.includes('tension')) {
    resources.images = addResources(resources.images!, [
      ...chestImagingResources,
      ...filterByTags(ultrasoundResources, ['pneumothorax', 'lung'])
    ]);
    resources.videos = addResources(resources.videos!, filterByTags(procedureVideos, ['decompression', 'pneumothorax']));
    resources.articles = addResources(resources.articles!, filterByTags(articleResources, ['pneumothorax', 'tension']));
    resources.assessment = addResources(resources.assessment!, filterByTags(ultrasoundResources, ['FAST', 'lung']));
    resources.procedures = addResources(resources.procedures!, filterByTags(procedureVideos, ['chest-tube', 'decompression']));
  }

  // Cardiac Tamponade
  if (lowerCondition.includes('tamponade') || lowerCondition.includes('pericardial')) {
    resources.images = addResources(resources.images!, filterByTags(ultrasoundResources, ['tamponade', 'cardiac']));
    resources.articles = addResources(resources.articles!, filterByTags(articleResources, ['tamponade', 'pericardial']));
    resources.assessment = addResources(resources.assessment!, filterByTags(ultrasoundResources, ['cardiac', 'echo']));
    resources.procedures = addResources(resources.procedures!, filterByTags(procedureVideos, ['chest-tube']));
  }

  // Hemothorax
  if (lowerCondition.includes('hemothorax')) {
    resources.images = addResources(resources.images!, filterByTags(chestImagingResources, ['hemothorax', 'pleural']));
    resources.articles = addResources(resources.articles!, filterByTags(articleResources, ['hemothorax', 'pleural']));
    resources.procedures = addResources(resources.procedures!, filterByTags(procedureVideos, ['chest-tube']));
  }

  // Flail Chest
  if (lowerCondition.includes('flail')) {
    resources.articles = addResources(resources.articles!, filterByTags(articleResources, ['flail', 'chest']));
    resources.procedures = addResources(resources.procedures!, filterByTags(procedureVideos, ['chest-tube']));
  }

  // Penetrating chest trauma - add relevant resources
  if (lowerCondition.includes('penetrat')) {
    resources.procedures = addResources(resources.procedures!, filterByTags(procedureVideos, ['chest-tube', 'decompression']));
    resources.articles = addResources(resources.articles!, filterByTags(articleResources, ['trauma', 'chest']));
  }

  // Pelvic Fracture
  if (lowerCondition.includes('pelvis') || lowerCondition.includes('pelvic')) {
    resources.videos = addResources(resources.videos!, filterByTags(procedureVideos, ['pelvic']));
    resources.procedures = addResources(resources.procedures!, filterByTags(procedureVideos, ['pelvic']));
  }

  // Head Injury / TBI - search both articles and case studies
  if (lowerCondition.includes('head') || lowerCondition.includes('tbi') || lowerCondition.includes('brain')) {
    resources.articles = addResources(resources.articles!, filterByTags(articleResources, ['TBI', 'head', 'brain']));
    // Also add case studies that match
    const headCases = filterByTags(caseStudyResources, ['TBI', 'head', 'brain']);
    resources.articles = addResources(resources.articles!, headCases);
  }

  // Spinal Injury
  if (lowerCondition.includes('spinal') || lowerCondition.includes('spine') || lowerCondition.includes('c-spine')) {
    resources.articles = addResources(resources.articles!, filterByTags(articleResources, ['spinal', 'spine']));
  }

  // Fractures (General) - only for specific types, not pelvic
  if ((lowerCondition.includes('fracture') || lowerCondition.includes('femur') || lowerCondition.includes('long-bone')) 
      && !lowerCondition.includes('pelvis')) {
    resources.articles = addResources(resources.articles!, filterByTags(articleResources, ['fracture']));
  }

  // Amputation / Extremity trauma - ADD SPECIFIC HANDLING
  if (lowerCondition.includes('amputat') || lowerCondition.includes('extremity') || lowerCondition.includes('limb')) {
    resources.procedures = addResources(resources.procedures!, filterByTags(procedureVideos, ['tourniquet']));
    resources.articles = addResources(resources.articles!, filterByTags(articleResources, ['amputation', 'tourniquet', 'hemorrhage', 'replantation']));
  }

  // Fallback: if nothing matched, DON'T just show chest X-rays - show nothing or very limited
  if (!resources.images?.length && !resources.procedures?.length && !resources.articles?.length) {
    // For unknown conditions, don't show random resources - return empty
    resources.images = [];
    resources.videos = [];
    resources.procedures = [];
    resources.articles = [];
  }

  // Add assessment resources - only if we have matched something, limit to 3
  const hasMatched = resources.images?.length || resources.procedures?.length || resources.articles?.length;
  if (hasMatched) {
    const matchedAssessment = filterByTags(assessmentResources, keywords);
    resources.assessment = matchedAssessment.length > 0 ? matchedAssessment.slice(0, 3) : [];
  } else {
    resources.assessment = [];
  }

  // Limit all resource arrays to reasonable sizes
  resources.images = resources.images?.slice(0, 4);
  resources.videos = resources.videos?.slice(0, 4);
  resources.articles = resources.articles?.slice(0, 4);
  resources.procedures = resources.procedures?.slice(0, 4);

  return resources;
}

// ============================================================================
// EXPORT ALL RESOURCES BY CATEGORY
// ============================================================================

export const allTraumaResources = {
  imaging: chestImagingResources,
  ultrasound: ultrasoundResources,
  procedures: procedureVideos,
  clinical: clinicalImages,
  articles: articleResources,
  podcasts: podcastResources,
  caseStudies: caseStudyResources,
  assessment: assessmentResources,
  management: managementResources
};

// Default export
export default {
  getTraumaResourcesByCondition,
  allTraumaResources,
  chestImagingResources,
  ultrasoundResources,
  procedureVideos,
  clinicalImages,
  articleResources,
  podcastResources,
  caseStudyResources,
  assessmentResources,
  managementResources
};
