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
 */

import type { VisualResource, VisualResources } from '@/types';

// ============================================================================
// X-RAY AND IMAGING RESOURCES
// ============================================================================

export const chestImagingResources: VisualResource[] = [
  {
    id: 'xr-tension-px-001',
    type: 'image',
    title: 'Tension Pneumothorax - Large Left Pneumothorax',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Tension-Pneumothorax-CXR.jpg',
    source: 'LITFL',
    caption: 'Supine CXR showing deep sulcus sign and mediastinal shift',
    relevance: 'essential',
    tags: ['pneumothorax', 'tension', 'chest', 'CXR', 'trauma']
  },
  {
    id: 'xr-tension-px-002',
    type: 'image',
    title: 'Tension Pneumothorax - CT Scan',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Tension-Pneumothorax-CT.jpg',
    source: 'LITFL',
    caption: 'CT showing collapsed lung with mediastinal compression',
    relevance: 'essential',
    tags: ['pneumothorax', 'tension', 'CT', 'trauma']
  },
  {
    id: 'xr-hemothorax-001',
    type: 'image',
    title: 'Massive Hemothorax',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Hemothorax-CXR.jpg',
    source: 'LITFL',
    caption: 'Complete opacification of right hemithorax',
    relevance: 'essential',
    tags: ['hemothorax', 'chest', 'CXR', 'trauma']
  },
  {
    id: 'xr-flail-001',
    type: 'image',
    title: 'Flail Chest - Multiple Rib Fractures',
    url: 'https://radiopaedia.org/cases/flail-chest-1?lang=us',
    source: 'Radiopaedia',
    caption: 'Multiple rib fractures with paradoxical movement',
    relevance: 'essential',
    tags: ['flail', 'rib-fracture', 'chest', 'trauma']
  },
  {
    id: 'xr-cardiac-tamponade-001',
    type: 'image',
    title: 'Cardiac Tamponade - Enlarged Cardiac Silhouette',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Cardiac-Tamponade-CXR.jpg',
    source: 'LITFL',
    caption: 'Globular enlarged cardiac shadow',
    relevance: 'essential',
    tags: ['tamponade', 'pericardial', 'effusion', 'CXR', 'trauma']
  },
  {
    id: 'xr-pelvic-fracture-001',
    type: 'image',
    title: 'Pelvic Fracture - Unstable',
    url: 'https://radiopaedia.org/cases/unstable-pelvic-fracture-3?lang=us',
    source: 'Radiopaedia',
    caption: 'Disrupted pelvic ring with significant displacement',
    relevance: 'essential',
    tags: ['pelvis', 'fracture', 'unstable', 'trauma']
  },
  {
    id: 'xr-femur-fracture-001',
    type: 'image',
    title: 'Femur Fracture - Comminuted Mid-Shaft',
    url: 'https://radiopaedia.org/cases/comminuted-mid-shaft-femur-fracture-1?lang=us',
    source: 'Radiopaedia',
    caption: 'Comminuted fracture of femoral shaft',
    relevance: 'essential',
    tags: ['femur', 'fracture', 'long-bone', 'trauma']
  },
  {
    id: 'xr-cervical-spine-001',
    type: 'image',
    title: 'C-Spine Fracture - Hangman Fracture',
    url: 'https://radiopaedia.org/cases/traumatic-spondylolisthesis-of-c2-hangmans-fracture-2?lang=us',
    source: 'Radiopaedia',
    caption: 'Bilateral pars interarticularis fracture of C2',
    relevance: 'essential',
    tags: ['c-spine', 'fracture', 'spinal', 'trauma']
  },
  {
    id: 'xr-aortic-injury-001',
    type: 'image',
    title: 'Traumatic Aortic Injury - Widened Mediastinum',
    url: 'https://radiopaedia.org/cases/traumatic-aortic-injury-2?lang=us',
    source: 'Radiopaedia',
    caption: 'Widened mediastinum with apical cap sign',
    relevance: 'essential',
    tags: ['aortic', 'trauma', 'chest', 'mediastinum']
  }
];

// ============================================================================
// ULTRASOUND (POCUS) RESOURCES
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
    id: 'us-fast-cardiac-001',
    type: 'image',
    title: 'Cardiac Tamponade on Ultrasound',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Cardiac-Tamponade-USS.jpg',
    source: 'LITFL',
    caption: 'Subxiphoid view showing pericardial effusion with right atrial diastolic collapse',
    relevance: 'essential',
    tags: ['tamponade', 'ultrasound', 'FAST', 'cardiac', 'trauma']
  },
  {
    id: 'us-fast-lung-001',
    type: 'image',
    title: 'Lung Ultrasound - Pneumothorax',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Lung-Sliding-Absent-Pneumothorax.jpg',
    source: 'LITFL',
    caption: 'Absent lung sliding and lung point indicating pneumothorax',
    relevance: 'essential',
    tags: ['pneumothorax', 'ultrasound', 'lung', 'POCUS']
  },
  {
    id: 'us-rapid-aortic-001',
    type: 'image',
    title: 'Rapid Ultrasound for Shock and Hypotension (RUSH)',
    url: 'https://litfl.com/wp-content/uploads/2018/11/RUSH-Protocol.jpg',
    source: 'LITFL',
    caption: 'RUSH protocol algorithm for shock evaluation',
    relevance: 'important',
    tags: ['RUSH', 'ultrasound', 'shock', 'POCUS']
  }
];

// ============================================================================
// PROCEDURE VIDEOS
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
    url: 'https://www.youtube.com/watch?v=W1Y4p3Q6pHk',
    source: 'TacticalMedic',
    caption: 'Proper tourniquet placement and technique',
    duration: '7:15',
    relevance: 'essential',
    tags: ['tourniquet', 'hemorrhage', 'bleeding', 'procedure']
  }
];

// ============================================================================
// CLINICAL PHOTOGRAPHS AND DIAGRAMS
// ============================================================================

export const clinicalImages: VisualResource[] = [
  {
    id: 'clin-trachea-001',
    type: 'image',
    title: 'Tracheal Deviation',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Tracheal-Deviation.jpg',
    source: 'LITFL',
    caption: 'Clinical photograph showing tracheal deviation in tension pneumothorax',
    relevance: 'important',
    tags: ['trachea', 'deviation', 'pneumothorax', 'clinical']
  },
  {
    id: 'clin-contusions-001',
    type: 'image',
    title: 'Chest Wall Contusions',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Chest-Contusions.jpg',
    source: 'LITFL',
    caption: 'Significant chest wall bruising from blunt trauma',
    relevance: 'important',
    tags: ['contusion', 'chest', 'blunt', 'trauma']
  },
  {
    id: 'diagram-abcde-001',
    type: 'infographic',
    title: 'ABCDE Approach - Trauma',
    url: 'https://litfl.com/wp-content/uploads/2018/11/ABCDE-Trauma-Approach.jpg',
    source: 'LITFL',
    caption: 'ABCDE systematic approach to trauma assessment',
    relevance: 'essential',
    tags: ['ABCDE', 'approach', 'assessment', 'trauma']
  },
  {
    id: 'diagram-atls-001',
    type: 'infographic',
    title: 'ATLS Primary Survey Algorithm',
    url: 'https://litfl.com/wp-content/uploads/2018/11/ATLS-Primary-Survey.jpg',
    source: 'LITFL',
    caption: 'ATLS primary survey flow diagram',
    relevance: 'essential',
    tags: ['ATLS', 'algorithm', 'primary-survey', 'trauma']
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
    url: 'https://rebelem.com/category/trauma/',
    source: 'REBEL EM',
    caption: 'Evidence-based trauma literature reviews',
    relevance: 'supplementary',
    tags: ['trauma', 'literature', 'evidence', 'REBEL-EM']
  }
];

// ============================================================================
// ARTICLES AND BLOG POSTS
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
    tags: ['ATLS', 'primary-survey', 'secondary-survey', 'assessment']
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
    title: 'Case: Penetrating Chest Trauma',
    url: 'https://litfl.com/penetrating-chest-trauma/',
    source: 'LITFL',
    caption: 'Comprehensive penetrating chest trauma case review',
    relevance: 'essential',
    tags: ['penetrating', 'chest', 'trauma', 'case']
  },
  {
    id: 'case-px-002',
    type: 'case-study',
    title: 'Case: Blunt Thoracic Trauma',
    url: 'https://emdocs.net/blunt-thoracic-trauma-ed-management/',
    source: 'EMDocs',
    caption: 'ED management of blunt thoracic trauma',
    relevance: 'essential',
    tags: ['blunt', 'thoracic', 'chest', 'trauma']
  },
  {
    id: 'case-multi-001',
    type: 'case-study',
    title: 'Case: Multi-Trauma from RTC',
    url: 'https://emcases.ca/multi-trauma/',
    source: 'EM Cases',
    caption: 'Multi-trauma case discussion with experts',
    relevance: 'essential',
    tags: ['multi-trauma', 'RTC', 'polytrauma', 'case']
  },
  {
    id: 'case-head-001',
    type: 'case-study',
    title: 'Case: Traumatic Brain Injury',
    url: 'https://litfl.com/traumatic-brain-injury/',
    source: 'LITFL',
    caption: 'Severe TBI management approach',
    relevance: 'essential',
    tags: ['TBI', 'head', 'brain', 'trauma']
  },
  {
    id: 'case-spinal-001',
    type: 'case-study',
    title: 'Case: Spinal Cord Injury',
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
    url: 'https://litfl.com/wp-content/uploads/2018/11/JVD-Assessment.jpg',
    source: 'LITFL',
    caption: 'Jugular venous distension examination technique',
    relevance: 'important',
    tags: ['JVD', 'jugular', 'assessment', 'examination']
  },
  {
    id: 'assess-trachea-002',
    type: 'image',
    title: 'Tracheal Palpation',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Tracheal-Palpation.jpg',
    source: 'LITFL',
    caption: 'Technique for assessing tracheal position',
    relevance: 'important',
    tags: ['trachea', 'assessment', 'examination', 'deviation']
  },
  {
    id: 'assess-chest-001',
    type: 'image',
    title: 'Chest Auscultation Points',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Chest-Auscultation.jpg',
    source: 'LITFL',
    caption: 'Systematic chest auscultation landmarks',
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
    type: 'infographic',
    title: 'Trauma Shock Management Algorithm',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Shock-Management-Algorithm.jpg',
    source: 'LITFL',
    caption: 'Systematic approach to trauma shock',
    relevance: 'essential',
    tags: ['shock', 'algorithm', 'management', 'trauma']
  },
  {
    id: 'mgmt-airway-001',
    type: 'infographic',
    title: 'Difficult Airway in Trauma',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Difficult-Airway-Trauma.jpg',
    source: 'LITFL',
    caption: 'Approach to difficult trauma airway',
    relevance: 'essential',
    tags: ['airway', 'difficult', 'trauma', 'RSI']
  },
  {
    id: 'mgmt-damage-001',
    type: 'infographic',
    title: 'Damage Control Resuscitation',
    url: 'https://litfl.com/wp-content/uploads/2018/11/Damage-Control-Resuscitation.jpg',
    source: 'LITFL',
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

  // Tension Pneumothorax
  if (lowerCondition.includes('pneumo') || lowerCondition.includes('tension')) {
    resources.images = [
      ...resources.images,
      ...chestImagingResources.filter(r => r.tags.includes('pneumothorax'))
    ];
    resources.videos = [
      ...procedureVideos.filter(p => p.tags.includes('decompression'))
    ];
    resources.articles = [
      ...articleResources.filter(a => a.tags.includes('pneumothorax'))
    ];
    resources.assessment = [
      ...ultrasoundResources.filter(u => u.tags.includes('pneumothorax'))
    ];
  }

  // Cardiac Tamponade
  if (lowerCondition.includes('tamponade') || lowerCondition.includes('pericardial')) {
    resources.images = [
      ...resources.images,
      ...chestImagingResources.filter(r => r.tags.includes('tamponade'))
    ];
    resources.articles = [
      ...articleResources.filter(a => a.tags.includes('tamponade'))
    ];
    resources.assessment = [
      ...ultrasoundResources.filter(u => u.tags.includes('tamponade'))
    ];
    resources.procedures = [
      ...procedureVideos.filter(p => p.tags.includes('chest-tube'))
    ];
  }

  // Massive Hemothorax
  if (lowerCondition.includes('hemothorax')) {
    resources.images = [
      ...resources.images,
      ...chestImagingResources.filter(r => r.tags.includes('hemothorax'))
    ];
    resources.articles = [
      ...articleResources.filter(a => a.tags.includes('hemothorax'))
    ];
    resources.procedures = [
      ...procedureVideos.filter(p => p.tags.includes('chest-tube'))
    ];
  }

  // Flail Chest
  if (lowerCondition.includes('flail')) {
    resources.images = [
      ...resources.images,
      ...chestImagingResources.filter(r => r.tags.includes('flail'))
    ];
    resources.articles = [
      ...articleResources.filter(a => a.tags.includes('flail'))
    ];
  }

  // Pelvic Fracture
  if (lowerCondition.includes('pelvis') || lowerCondition.includes('pelvic')) {
    resources.images = [
      ...resources.images,
      ...chestImagingResources.filter(r => r.tags.includes('pelvis'))
    ];
    resources.videos = [
      ...procedureVideos.filter(p => p.tags.includes('pelvic'))
    ];
  }

  // Head Injury / TBI
  if (lowerCondition.includes('head') || lowerCondition.includes('tbi') || lowerCondition.includes('brain')) {
    resources.articles = [
      ...articleResources.filter(a => a.tags.includes('TBI') || a.tags.includes('head'))
    ];
    resources.caseStudies = [
      ...caseStudyResources.filter(c => c.tags.includes('TBI') || c.tags.includes('head'))
    ];
  }

  // Spinal Injury
  if (lowerCondition.includes('spinal') || lowerCondition.includes('spine') || lowerCondition.includes('c-spine')) {
    resources.images = [
      ...resources.images,
      ...chestImagingResources.filter(r => r.tags.includes('c-spine') || r.tags.includes('spinal'))
    ];
    resources.articles = [
      ...articleResources.filter(a => a.tags.includes('spinal'))
    ];
  }

  // Fractures (General)
  if (lowerCondition.includes('fracture') || lowerCondition.includes('femur') || lowerCondition.includes('long-bone')) {
    resources.images = [
      ...resources.images,
      ...chestImagingResources.filter(r => r.tags.includes('fracture'))
    ];
  }

  // Add general resources for all trauma cases
  if (!resources.images?.length) {
    resources.images = [...clinicalImages];
  }
  if (!resources.articles?.length) {
    resources.articles = articleResources.filter(a =>
      a.tags.includes('trauma') || a.tags.includes('assessment')
    );
  }

  // Always add assessment and management resources
  resources.assessment = [
    ...(resources.assessment || []),
    ...assessmentResources
  ];
  resources.management = [
    ...(resources.management || []),
    ...managementResources
  ];

  // Add relevant procedure videos for all trauma
  resources.procedures = [
    ...(resources.procedures || []),
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
