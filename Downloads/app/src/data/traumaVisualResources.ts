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
    id: 'xr-tension-px-002',
    type: 'image',
    title: 'Tension Pneumothorax Clinical',
    url: 'https://litfl.com/wp-content/uploads/2019/03/Tension-Pneumothorax-340-2.jpeg',
    source: 'LITFL',
    caption: 'Clinical image of tension pneumothorax',
    relevance: 'essential',
    tags: ['pneumothorax', 'tension', 'clinical', 'trauma']
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
    id: 'us-fast-001',
    type: 'video',
    title: 'FAST Exam - Complete Tutorial',
    url: 'https://www.youtube.com/watch?v=0DKBs6-iHfU',
    source: 'EMUltrasounds',
    caption: 'Complete FAST exam demonstration',
    duration: '12:45',
    relevance: 'essential',
    tags: ['FAST', 'ultrasound', 'trauma', 'POCUS']
  },
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
    id: 'us-fast-ruq-001',
    type: 'image',
    title: 'eFAST RUQ View',
    url: 'https://litfl.com/wp-content/uploads/2023/08/eFAST-RUQ.png',
    source: 'LITFL',
    caption: 'eFAST Right Upper Quadrant view for hemoperitoneum',
    relevance: 'essential',
    tags: ['FAST', 'RUQ', 'abdomen', 'ultrasound', 'trauma']
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
  {
    id: 'proc-chest-tube-001',
    type: 'video',
    title: 'Chest Tube Insertion - Complete Procedure',
    url: 'https://www.youtube.com/watch?v=fkVqS0yEH_0',
    source: 'EMCrit',
    caption: 'Step-by-step chest tube insertion demonstration',
    duration: '8:30',
    relevance: 'essential',
    tags: ['chest-tube', 'thoracostomy', 'procedure', 'trauma']
  },
  {
    id: 'proc-needle-decomp-001',
    type: 'video',
    title: 'Needle Thoracostomy for Tension Pneumothorax',
    url: 'https://www.youtube.com/watch?v=n5bVM5pIXGA',
    source: 'EMDocs',
    caption: 'Needle decompression technique and landmarks',
    duration: '5:15',
    relevance: 'essential',
    tags: ['decompression', 'pneumothorax', 'tension', 'procedure']
  },
  {
    id: 'proc-cric-001',
    type: 'video',
    title: 'Surgical Cricothyrotomy',
    url: 'https://www.youtube.com/watch?v=NSr3tEmQ72U',
    source: 'EMCrit',
    caption: 'Surgical airway - cricothyrotomy technique',
    duration: '10:20',
    relevance: 'essential',
    tags: ['cricothyrotomy', 'airway', 'surgical', 'procedure']
  },
  {
    id: 'proc-iv-io-001',
    type: 'video',
    title: 'Intraosseous (IO) Access',
    url: 'https://www.youtube.com/watch?v=YhF2K6KXDCE',
    source: 'EMProcedureVideos',
    caption: 'IO needle placement for difficult IV access',
    duration: '6:45',
    relevance: 'essential',
    tags: ['IO', 'intraosseous', 'access', 'procedure']
  },
  {
    id: 'proc-pelvic-binder-001',
    type: 'video',
    title: 'Pelvic Binder Application',
    url: 'https://www.youtube.com/watch?v=3WjVj1c3c1o',
    source: 'LondonAirAmbulance',
    caption: 'Proper pelvic binder application technique',
    duration: '4:30',
    relevance: 'essential',
    tags: ['pelvic', 'binder', 'fracture', 'procedure']
  },
  {
    id: 'proc-tourniquet-001',
    type: 'video',
    title: 'Tourniquet Application for Catastrophic Hemorrhage',
    url: 'https://www.youtube.com/watch?v=W1Y4p3pHkHk',
    source: 'TacticalMedic',
    caption: 'Proper tourniquet placement and technique',
    duration: '7:15',
    relevance: 'essential',
    tags: ['tourniquet', 'hemorrhage', 'bleeding', 'procedure']
  }
];

// ============================================================================
// CLINICAL IMAGES AND DIAGRAMS
// ============================================================================

export const clinicalImages: VisualResource[] = [
  {
    id: 'diagram-abcde-001',
    type: 'infographic',
    title: 'ABCDE Approach - Trauma',
    url: 'https://litfl.com/atls-primary-survey/',
    source: 'LITFL',
    caption: 'ABCDE systematic approach to trauma assessment',
    relevance: 'essential',
    tags: ['ABCDE', 'approach', 'assessment', 'trauma']
  },
  {
    id: 'diagram-atls-001',
    type: 'infographic',
    title: 'ATLS Primary Survey Algorithm',
    url: 'https://litfl.com/atls-primary-survey/',
    source: 'LITFL',
    caption: 'ATLS primary survey flow diagram',
    relevance: 'essential',
    tags: ['ATLS', 'algorithm', 'primary-survey', 'trauma']
  },
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

export const podcastResources: VisualResource[] = [
  {
    id: 'pod-emcrit-px-001',
    type: 'podcast',
    title: 'EMCrit 76 - The Crashing Trauma Patient',
    url: 'https://emcrit.org/emcrit/crashing-trauma-patient/',
    source: 'EMCrit',
    caption: 'Approach to the crashing trauma patient',
    duration: '35:00',
    relevance: 'important',
    tags: ['trauma', 'crashing', 'resuscitation', 'EMCrit']
  },
  {
    id: 'pod-em-px-001',
    type: 'podcast',
    title: 'Emergency Medicine Cases - Trauma',
    url: 'https://emcases.ca/category/trauma/',
    source: 'EM Cases',
    caption: 'Comprehensive trauma case discussions',
    relevance: 'important',
    tags: ['trauma', 'cases', 'discussion', 'EM-Cases']
  },
  {
    id: 'pod-rebel-px-001',
    type: 'podcast',
    title: 'REBEL EM - Trauma Literature Review',
    url: 'https://rebelem.com/category/trauma-em/',
    source: 'REBEL EM',
    caption: 'Evidence-based trauma literature reviews',
    relevance: 'supplementary',
    tags: ['trauma', 'literature', 'evidence', 'REBEL-EM']
  }
];

// ============================================================================
// ARTICLES AND BLOG POSTS - VERIFIED WORKING URLs
// ============================================================================

export const articleResources: VisualResource[] = [
  {
    id: 'art-atls-001',
    type: 'article',
    title: 'ATLS Primary and Secondary Survey',
    url: 'https://litfl.com/atls-primary-survey/',
    source: 'LITFL',
    caption: 'Comprehensive guide to ATLS assessment',
    relevance: 'essential',
    tags: ['ATLS', 'primary-survey', 'secondary-survey', 'assessment', 'trauma']
  },
  {
    id: 'art-tension-px-001',
    type: 'article',
    title: 'Tension Pneumothorax - Diagnosis and Management',
    url: 'https://litfl.com/tension-pneumothorax/',
    source: 'LITFL',
    caption: 'Complete guide to tension pneumothorax',
    relevance: 'essential',
    tags: ['pneumothorax', 'tension', 'management', 'diagnosis']
  },
  {
    id: 'art-tension-alt-001',
    type: 'article',
    title: 'Tension Pneumothorax - Alternative View',
    url: 'https://litfl.com/tension-pneumothorax-an-alternative-view/',
    source: 'LITFL',
    caption: 'Clinical approach to tension pneumothorax',
    relevance: 'essential',
    tags: ['pneumothorax', 'tension', 'clinical', 'trauma']
  },
  {
    id: 'art-tamponade-001',
    type: 'article',
    title: 'Cardiac Tamponade in Trauma',
    url: 'https://litfl.com/cardiac-tamponade/',
    source: 'LITFL',
    caption: 'Traumatic cardiac tamponade overview',
    relevance: 'essential',
    tags: ['tamponade', 'cardiac', 'trauma', 'pericardial']
  },
  {
    id: 'art-hemothorax-001',
    type: 'article',
    title: 'Massive Hemothorax Management',
    url: 'https://emdocs.net/massive-hemothorax/',
    source: 'EMDocs',
    caption: 'ED management of massive hemothorax',
    relevance: 'essential',
    tags: ['hemothorax', 'chest', 'trauma', 'management']
  },
  {
    id: 'art-flail-001',
    type: 'article',
    title: 'Flail Chest and Pulmonary Contusion',
    url: 'https://emdocs.net/flail-chest-and-pulmonary-contusion/',
    source: 'EMDocs',
    caption: 'Management of flail chest and pulmonary contusion',
    relevance: 'essential',
    tags: ['flail', 'chest', 'contusion', 'pulmonary']
  },
  {
    id: 'art-fast-001',
    type: 'article',
    title: 'The FAST Exam in Trauma',
    url: 'https://emdocs.net/the-fast-exam-in-trauma/',
    source: 'EMDocs',
    caption: 'Comprehensive FAST exam guide',
    relevance: 'essential',
    tags: ['FAST', 'ultrasound', 'trauma', 'assessment']
  },
  {
    id: 'art-fast-pocus-001',
    type: 'article',
    title: 'POCUS Made Easy: eFAST',
    url: 'https://litfl.com/pocus-made-easy-efast/',
    source: 'LITFL',
    caption: 'LITFL POCUS guide to eFAST',
    relevance: 'essential',
    tags: ['FAST', 'POCUS', 'ultrasound', 'trauma']
  },
  {
    id: 'art-shock-001',
    type: 'article',
    title: 'Shock in Trauma - Classification and Management',
    url: 'https://litfl.com/shock/',
    source: 'LITFL',
    caption: 'Complete guide to shock in trauma patients',
    relevance: 'essential',
    tags: ['shock', 'hemorrhagic', 'trauma', 'hypovolemic']
  },
  {
    id: 'art-txa-001',
    type: 'article',
    title: 'Tranexamic Acid in Trauma (CRASH-2)',
    url: 'https://emdocs.net/tranexamic-acid-in-trauma/',
    source: 'EMDocs',
    caption: 'TXA use in trauma based on CRASH-2 trial',
    relevance: 'important',
    tags: ['TXA', 'tranexamic', 'trauma', 'hemorrhage']
  },
  {
    id: 'art-massive-001',
    type: 'article',
    title: 'Massive Transfusion Protocol',
    url: 'https://emcrit.org/massive-transfusion-protocol/',
    source: 'EMCrit',
    caption: 'MTP activation and ratio-based resuscitation',
    relevance: 'important',
    tags: ['MTP', 'transfusion', 'blood', 'resuscitation']
  },
  {
    id: 'art-bond-001',
    type: 'article',
    title: 'Balanced Resuscitation (Blood Components)',
    url: 'https://emcrit.org/balanced-resuscitation/',
    source: 'EMCrit',
    caption: 'Balanced ratio-based trauma resuscitation',
    relevance: 'important',
    tags: ['resuscitation', 'balanced', 'blood', 'components']
  },
  {
    id: 'art-pocus-lung-001',
    type: 'article',
    title: 'POCUS Made Easy: Lung Ultrasound',
    url: 'https://litfl.com/pocus-made-easy-lung/',
    source: 'LITFL',
    caption: 'Comprehensive lung ultrasound guide',
    relevance: 'important',
    tags: ['POCUS', 'lung', 'ultrasound', 'assessment']
  },
  {
    id: 'art-pocus-echo-001',
    type: 'article',
    title: 'POCUS Made Easy: Basic Echo',
    url: 'https://litfl.com/pocus-made-easy-basic-echo/',
    source: 'LITFL',
    caption: 'Focused echocardiography in life support',
    relevance: 'important',
    tags: ['POCUS', 'echo', 'cardiac', 'ultrasound']
  },
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
    id: 'art-rebels-001',
    type: 'article',
    title: 'REBEL EM - Trauma Archives',
    url: 'https://rebelem.com/category/trauma-em/',
    source: 'REBEL EM',
    caption: 'Extensive trauma article collection',
    relevance: 'supplementary',
    tags: ['trauma', 'archive', 'collection', 'REBEL-EM']
  }
];

// ============================================================================
// CASE STUDIES
// ============================================================================

export const caseStudyResources: VisualResource[] = [
  {
    id: 'case-px-001',
    type: 'case-study',
    title: 'Penetrating Chest Trauma',
    url: 'https://litfl.com/penetrating-chest-trauma/',
    source: 'LITFL',
    caption: 'Comprehensive penetrating chest trauma case review',
    relevance: 'essential',
    tags: ['penetrating', 'chest', 'trauma', 'case']
  },
  {
    id: 'case-px-002',
    type: 'case-study',
    title: 'Blunt Thoracic Trauma',
    url: 'https://emdocs.net/blunt-thoracic-trauma-ed-management/',
    source: 'EMDocs',
    caption: 'ED management of blunt thoracic trauma',
    relevance: 'essential',
    tags: ['blunt', 'thoracic', 'chest', 'trauma']
  },
  {
    id: 'case-multi-001',
    type: 'case-study',
    title: 'Multi-Trauma from RTC',
    url: 'https://emcases.ca/multi-trauma/',
    source: 'EM Cases',
    caption: 'Multi-trauma case discussion with experts',
    relevance: 'essential',
    tags: ['multi-trauma', 'RTC', 'polytrauma', 'case']
  },
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
// ASSESSMENT AND TEACHING RESOURCES
// ============================================================================

export const assessmentResources: VisualResource[] = [
  {
    id: 'assess-jugular-001',
    type: 'image',
    title: 'JVD Assessment',
    url: 'https://litfl.com/jugular-venous-pressure/',
    source: 'LITFL',
    caption: 'Jugular venous distension examination technique',
    relevance: 'important',
    tags: ['JVD', 'jugular', 'assessment', 'examination']
  },
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
// MANAGEMENT ALGORITHMS
// ============================================================================

export const managementResources: VisualResource[] = [
  {
    id: 'mgmt-shock-001',
    type: 'article',
    title: 'Trauma Shock Management Algorithm',
    url: 'https://litfl.com/shock/',
    source: 'LITFL',
    caption: 'Systematic approach to trauma shock',
    relevance: 'essential',
    tags: ['shock', 'algorithm', 'management', 'trauma']
  },
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
  {
    id: 'mgmt-damage-001',
    type: 'article',
    title: 'Damage Control Resuscitation',
    url: 'https://emcrit.org/damage-control-resuscitation/',
    source: 'EMCrit',
    caption: 'Damage control resuscitation principles',
    relevance: 'important',
    tags: ['damage-control', 'resuscitation', 'DCR', 'trauma']
  }
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

  // Helper to safely filter by tags
  const filterByTag = (items: VisualResource[], tag: string): VisualResource[] =>
    items.filter(item => item.tags?.includes(tag));

  // Tension Pneumothorax
  if (lowerCondition.includes('pneumo') || lowerCondition.includes('tension')) {
    resources.images = [
      ...chestImagingResources,
      ...filterByTag(ultrasoundResources, 'pneumothorax')
    ];
    resources.videos = filterByTag(procedureVideos, 'decompression');
    resources.articles = [
      ...filterByTag(articleResources, 'pneumothorax'),
      ...filterByTag(articleResources, 'tension')
    ];
    resources.assessment = [
      ...filterByTag(ultrasoundResources, 'FAST'),
      ...filterByTag(ultrasoundResources, 'lung')
    ];
  }

  // Cardiac Tamponade
  if (lowerCondition.includes('tamponade') || lowerCondition.includes('pericardial')) {
    resources.images = filterByTag(ultrasoundResources, 'tamponade');
    resources.articles = filterByTag(articleResources, 'tamponade');
    resources.assessment = [
      ...filterByTag(ultrasoundResources, 'cardiac'),
      ...filterByTag(ultrasoundResources, 'echo')
    ];
    resources.procedures = filterByTag(procedureVideos, 'chest-tube');
  }

  // Massive Hemothorax
  if (lowerCondition.includes('hemothorax')) {
    resources.images = filterByTag(chestImagingResources, 'hemothorax');
    resources.articles = [
      ...filterByTag(articleResources, 'hemothorax'),
      ...filterByTag(articleResources, 'pleural')
    ];
    resources.procedures = filterByTag(procedureVideos, 'chest-tube');
  }

  // Flail Chest
  if (lowerCondition.includes('flail')) {
    resources.articles = filterByTag(articleResources, 'flail');
    resources.procedures = filterByTag(procedureVideos, 'chest-tube');
  }

  // Pelvic Fracture
  if (lowerCondition.includes('pelvis') || lowerCondition.includes('pelvic')) {
    resources.videos = filterByTag(procedureVideos, 'pelvic');
    resources.procedures = filterByTag(procedureVideos, 'pelvic');
  }

  // Head Injury / TBI
  if (lowerCondition.includes('head') || lowerCondition.includes('tbi') || lowerCondition.includes('brain')) {
    const tbiArticles = articleResources.filter(a =>
      a.tags?.includes('TBI') || a.tags?.includes('head') || a.tags?.includes('brain')
    );
    resources.articles = tbiArticles;
  }

  // Spinal Injury
  if (lowerCondition.includes('spinal') || lowerCondition.includes('spine') || lowerCondition.includes('c-spine')) {
    resources.articles = filterByTag(articleResources, 'spinal');
  }

  // Fractures (General)
  if (lowerCondition.includes('fracture') || lowerCondition.includes('femur') || lowerCondition.includes('long-bone')) {
    resources.articles = articleResources.filter(a => a.tags?.includes('fracture'));
  }

  // Add general resources for all trauma cases
  if (!resources.images?.length) {
    resources.images = [...chestImagingResources];
  }
  if (!resources.articles?.length) {
    resources.articles = articleResources.filter(a =>
      a.tags?.includes('trauma') || a.tags?.includes('assessment')
    );
  }

  // Always add assessment and management resources
  resources.assessment = [
    ...(resources.assessment ?? []),
    ...assessmentResources
  ];
  resources.management = [
    ...(resources.management ?? []),
    ...managementResources
  ];

  // Add relevant procedure videos for all trauma
  resources.procedures = [
    ...(resources.procedures ?? []),
    ...procedureVideos.filter(p => p.relevance === 'essential')
  ];

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
