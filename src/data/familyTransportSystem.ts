/**
 * Family Dynamics System
 * 
 * Family interactions, cultural considerations, and communication challenges
 */

export type FamilyEmotionalState = 'calm' | 'anxious' | 'distressed' | 'hostile' | 'hysterical';
export type CulturalBackground = 'local_emirati' | 'south_asian' | 'filipino' | 'arab' | 'western' | 'african' | 'other';
export type ReligiousConsideration = 'islam' | 'christian' | 'hindu' | 'sikh' | 'buddhist' | 'none' | 'other';

export interface FamilyMember {
  id: string;
  relation: 'spouse' | 'parent' | 'child' | 'sibling' | 'friend' | 'other';
  name: string;
  age: number;
  gender: 'male' | 'female';
  emotionalState: FamilyEmotionalState;
  englishProficiency: 'none' | 'basic' | 'conversational' | 'fluent';
  culturalBackground: CulturalBackground;
  specialConsiderations: string[];
}

export interface CulturalProtocol {
  culture: CulturalBackground;
  religion: ReligiousConsideration;
  greeting: string;
  communicationStyle: 'direct' | 'indirect';
  eyeContact: 'expected' | 'avoided' | 'neutral';
  touch: 'acceptable' | 'avoided' | 'gender_specific';
  familyHierarchy: 'elder_male' | 'elder_female' | 'consensus';
  decisionMaker: string;
  modestyConsiderations: string[];
  dietaryRestrictions: string[];
  prayerTimes: string[];
}

// Cultural protocols database
export const CULTURAL_PROTOCOLS: CulturalProtocol[] = [
  {
    culture: 'local_emirati',
    religion: 'islam',
    greeting: 'As-salamu alaykum',
    communicationStyle: 'indirect',
    eyeContact: 'neutral',
    touch: 'gender_specific',
    familyHierarchy: 'elder_male',
    decisionMaker: 'Elder male family member',
    modestyConsiderations: ['Female modesty important', 'Request female provider for female patients'],
    dietaryRestrictions: ['Halal food only', 'No pork', 'No alcohol'],
    prayerTimes: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
  },
  {
    culture: 'south_asian',
    religion: 'islam',
    greeting: 'As-salamu alaykum',
    communicationStyle: 'indirect',
    eyeContact: 'avoided',
    touch: 'gender_specific',
    familyHierarchy: 'elder_male',
    decisionMaker: 'Head of household (typically male)',
    modestyConsiderations: ['Gender-concordant care preferred', 'Cover body during assessment'],
    dietaryRestrictions: ['Halal/Hindu dietary needs', 'Vegetarian options'],
    prayerTimes: ['Five daily prayers'],
  },
  {
    culture: 'filipino',
    religion: 'christian',
    greeting: 'Good day',
    communicationStyle: 'indirect',
    eyeContact: 'avoided',
    touch: 'acceptable',
    familyHierarchy: 'consensus',
    decisionMaker: 'Family consensus, often eldest',
    modestyConsiderations: ['Family presence important', 'Request permission for procedures'],
    dietaryRestrictions: ['Catholic fasting periods', 'No restrictions otherwise'],
    prayerTimes: ['Evening prayer common'],
  },
  {
    culture: 'arab',
    religion: 'islam',
    greeting: 'Marhaba',
    communicationStyle: 'indirect',
    eyeContact: 'neutral',
    touch: 'gender_specific',
    familyHierarchy: 'elder_male',
    decisionMaker: 'Family elder',
    modestyConsiderations: ['Same-gender care preferred', 'Family honor considerations'],
    dietaryRestrictions: ['Halal requirements'],
    prayerTimes: ['Five daily prayers'],
  },
  {
    culture: 'western',
    religion: 'christian',
    greeting: 'Hello',
    communicationStyle: 'direct',
    eyeContact: 'expected',
    touch: 'acceptable',
    familyHierarchy: 'consensus',
    decisionMaker: 'Patient autonomy emphasized',
    modestyConsiderations: ['Privacy respected', 'Patient consent paramount'],
    dietaryRestrictions: ['Variable', 'Vegetarian/vegan options'],
    prayerTimes: ['Variable'],
  },
];

// Family scenarios
export const FAMILY_SCENARIOS = [
  {
    id: 'large_family',
    name: 'Extended Family Present',
    description: '10+ family members arrive at scene',
    challenges: ['Crowd control', 'Multiple opinions', 'Heightened emotions'],
    managementStrategy: 'Identify spokesperson, move to quiet area',
  },
  {
    id: 'language_barrier',
    name: 'Language Barrier',
    description: 'Family speaks only Arabic/Urdu/Tagalog',
    challenges: ['Cannot obtain history', 'Consent issues', 'Explanation difficulties'],
    managementStrategy: 'Request interpreter, use translation app, non-verbal communication',
  },
  {
    id: 'aggressive_family',
    name: 'Aggressive Family Member',
    description: 'Family member confronts crew blaming them',
    challenges: ['Scene safety', 'Delayed treatment', 'Stress on crew'],
    managementStrategy: 'Remain calm, de-escalate, request police if needed',
  },
  {
    id: 'minor_patient',
    name: 'Minor Patient Alone',
    description: 'Pediatric patient, parents not present',
    challenges: ['Consent issues', 'History unavailable', 'Child anxiety'],
    managementStrategy: 'Implied consent for life threats, comfort child, contact guardians',
  },
  {
    id: 'unconscious_patient',
    name: 'Unconscious Patient No ID',
    description: 'Patient unconscious, cannot identify, no phone',
    challenges: ['No medical history', 'Allergies unknown', 'Next of kin unknown'],
    managementStrategy: 'Look for medical alert jewelry, check phone ICE contacts',
  },
  {
    id: 'religious_objections',
    name: 'Religious Objections',
    description: 'Family refuses blood products or opposite-gender care',
    challenges: ['Treatment refusal', 'Ethical dilemma', 'Cultural sensitivity'],
    managementStrategy: 'Respect beliefs if possible, explain medical necessity, document refusal',
  },
  {
    id: 'hysterical_witness',
    name: 'Hysterical Family Member',
    description: 'Family member screaming and crying uncontrollably',
    challenges: ['Distressing for patient', 'Impairs assessment', 'Scene chaos'],
    managementStrategy: 'Remove from scene if possible, assign someone to comfort them',
  },
];

// Communication phrases in different languages
export const EMERGENCY_PHRASES: Record<string, Record<string, string>> = {
  arabic: {
    help_coming: 'Al-musaaada qadima',
    calm_down: 'Ihda',
    family_wait: 'Al-usrat tantadhir hunaka',
    yes_no: 'Naam/La',
    pain: 'Alam',
    breathe: 'Tanaffas',
  },
  urdu: {
    help_coming: 'Madad aa rahi hai',
    calm_down: 'Pur-sukun rahein',
    family_wait: 'Ghar walay wahan intezar karain',
    yes_no: 'Han/Nahin',
    pain: 'Dard',
    breathe: 'Saans lain',
  },
  tagalog: {
    help_coming: 'Tulong ay darating',
    calm_down: 'Manatiling kalmado',
    family_wait: 'Maghintay ang pamilya doon',
    yes_no: 'Oo/Hindi',
    pain: 'Sakit',
    breathe: 'Huminga',
  },
};

/**
 * Transport Decision Making System
 * 
 * Realistic transport decisions including air vs ground, facility selection
 */

export type TransportMode = 'ground_ambulance' | 'helicopter' | 'fixed_wing' | 'self_transport';
export type FacilityLevel = 'clinic' | 'community' | 'general' | 'trauma_center' | 'specialized';

export interface TransportOption {
  mode: TransportMode;
  eta: number; // minutes
  availability: boolean;
  weatherDependent: boolean;
  capacity: number;
  equipment: string[];
  limitations: string[];
}

export interface ReceivingFacility {
  id: string;
  name: string;
  level: FacilityLevel;
  specialties: string[];
  distance: number; // km
  etaByGround: number;
  etaByAir?: number;
  capabilities: string[];
  capacity: 'available' | 'busy' | 'full' | 'divert';
  acceptingPatients: boolean;
}

// UAE hospital database
export const UAE_HOSPITALS: ReceivingFacility[] = [
  {
    id: 'rashid_hospital',
    name: 'Rashid Hospital (Dubai)',
    level: 'trauma_center',
    specialties: ['Trauma', 'Emergency Surgery', 'ICU'],
    distance: 8,
    etaByGround: 12,
    etaByAir: 8,
    capabilities: ['Level I Trauma', '24/7 Surgery', 'Interventional Radiology'],
    capacity: 'available',
    acceptingPatients: true,
  },
  {
    id: 'al_wasal',
    name: 'Al Wasl Hospital (Dubai)',
    level: 'general',
    specialties: ['General Medicine', 'Obstetrics'],
    distance: 5,
    etaByGround: 8,
    capabilities: ['General Emergency', 'Labor & Delivery'],
    capacity: 'available',
    acceptingPatients: true,
  },
  {
    id: 'cleveland_clinic',
    name: 'Cleveland Clinic Abu Dhabi',
    level: 'specialized',
    specialties: ['Cardiology', 'Neurology', 'Oncology'],
    distance: 120,
    etaByGround: 90,
    etaByAir: 35,
    capabilities: ['Cardiac Catheterization', 'Stroke Center', 'Neurosurgery'],
    capacity: 'available',
    acceptingPatients: true,
  },
  {
    id: 'sheikh_shakhbout',
    name: 'Sheikh Shakhbout Medical City',
    level: 'trauma_center',
    specialties: ['Trauma', 'Burns', 'Transplant'],
    distance: 30,
    etaByGround: 25,
    etaByAir: 12,
    capabilities: ['Level I Trauma', 'Burn Center', 'Organ Transplant'],
    capacity: 'busy',
    acceptingPatients: true,
  },
  {
    id: 'latifa_hospital',
    name: 'Latifa Hospital (Dubai)',
    level: 'specialized',
    specialties: ['Pediatrics', 'NICU', 'PICU'],
    distance: 10,
    etaByGround: 15,
    capabilities: ['Pediatric Emergency', 'Neonatal ICU', 'Pediatric Surgery'],
    capacity: 'available',
    acceptingPatients: true,
  },
  {
    id: 'neuro_spine',
    name: 'Neuro Spinal Hospital',
    level: 'specialized',
    specialties: ['Neurosurgery', 'Spinal Surgery'],
    distance: 15,
    etaByGround: 20,
    capabilities: ['Spinal Cord Injury', 'Brain Surgery', 'Rehabilitation'],
    capacity: 'available',
    acceptingPatients: true,
  },
];

// Transport decision factors
export interface TransportDecision {
  recommendedMode: TransportMode;
  destination: ReceivingFacility;
  eta: number;
  rationale: string[];
  alternatives: { mode: TransportMode; facility: string; eta: number }[];
  warnings?: string[];
}

// Calculate transport recommendation
export function calculateTransportDecision(
  caseType: string,
  vitalSigns: { gcs: number; systolic: number; spo2: number },
  weather: 'good' | 'marginal' | 'poor',
  traffic: 'light' | 'moderate' | 'heavy'
): TransportDecision {
  const rationale: string[] = [];
  const alternatives: { mode: TransportMode; facility: string; eta: number }[] = [];
  
  // Determine severity
  const isCritical = vitalSigns.gcs < 12 || vitalSigns.systolic < 90 || vitalSigns.spo2 < 90;
  const isPediatric = caseType.toLowerCase().includes('pediatric') || caseType.toLowerCase().includes('child');
  const isTrauma = caseType.toLowerCase().includes('trauma') || caseType.toLowerCase().includes('injury');
  
  // Select destination
  let destination: ReceivingFacility;
  
  if (isTrauma) {
    destination = UAE_HOSPITALS.find(h => h.level === 'trauma_center' && h.acceptingPatients) || UAE_HOSPITALS[0];
    rationale.push('Level I Trauma Center required for severe trauma');
  } else if (isPediatric) {
    destination = UAE_HOSPITALS.find(h => h.specialties.includes('Pediatrics')) || UAE_HOSPITALS[0];
    rationale.push('Pediatric specialty facility optimal');
  } else if (caseType.toLowerCase().includes('cardiac')) {
    destination = UAE_HOSPITALS.find(h => h.specialties.includes('Cardiology')) || UAE_HOSPITALS[0];
    rationale.push('Cardiac center for PCI capability');
  } else {
    destination = UAE_HOSPITALS[0]; // Default to trauma center
  }
  
  // Determine transport mode
  let recommendedMode: TransportMode = 'ground_ambulance';
  let eta = destination.etaByGround;
  
  if (isCritical && destination.etaByAir && weather !== 'poor' && destination.distance > 20) {
    recommendedMode = 'helicopter';
    eta = destination.etaByAir;
    rationale.push('Helicopter transport for critical patient saves time');
  } else if (isCritical && traffic === 'heavy' && destination.etaByAir) {
    recommendedMode = 'helicopter';
    eta = destination.etaByAir;
    rationale.push('Air transport bypasses heavy traffic');
  } else {
    rationale.push('Ground transport appropriate for this case');
    if (traffic === 'heavy') {
      rationale.push('Heavy traffic may delay arrival');
    }
  }
  
  // Weather considerations
  if (weather === 'poor' && recommendedMode === 'helicopter') {
    alternatives.push({
      mode: 'ground_ambulance',
      facility: destination.name,
      eta: destination.etaByGround,
    });
    rationale.push('Weather precludes air transport - ground only');
    recommendedMode = 'ground_ambulance';
    eta = destination.etaByGround;
  }
  
  // Generate warnings
  const warnings: string[] = [];
  if (destination.capacity === 'busy') {
    warnings.push('Destination hospital is busy - potential delays');
  }
  if (weather === 'marginal' && recommendedMode === 'helicopter') {
    warnings.push('Marginal weather - air transport may be aborted');
  }
  
  return {
    recommendedMode,
    destination,
    eta,
    rationale,
    alternatives,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// Weather impact on transport
export function getWeatherImpact(
  weather: 'good' | 'marginal' | 'poor'
): { helicopterAvailable: boolean; fixedWingAvailable: boolean; groundImpact: string } {
  switch (weather) {
    case 'good':
      return {
        helicopterAvailable: true,
        fixedWingAvailable: true,
        groundImpact: 'No impact',
      };
    case 'marginal':
      return {
        helicopterAvailable: true,
        fixedWingAvailable: true,
        groundImpact: 'Slightly reduced visibility',
      };
    case 'poor':
      return {
        helicopterAvailable: false,
        fixedWingAvailable: false,
        groundImpact: 'Reduced speed, increased risk',
      };
  }
}

// Stay-and-play vs load-and-go decision
export function getTreatmentApproach(
  caseType: string,
  transportTime: number
): { approach: 'stay_and_play' | 'load_and_go' | 'scoop_and_run'; rationale: string } {
  const isCardiac = caseType.toLowerCase().includes('cardiac') || caseType.toLowerCase().includes('arrest');
  const isTrauma = caseType.toLowerCase().includes('trauma');
  const isRespiratory = caseType.toLowerCase().includes('respiratory') || caseType.toLowerCase().includes('asthma');
  
  if (isCardiac && transportTime > 10) {
    return {
      approach: 'load_and_go',
      rationale: 'Cardiac patient needs cath lab - rapid transport to hospital',
    };
  }
  
  if (isTrauma && transportTime < 15) {
    return {
      approach: 'scoop_and_run',
      rationale: 'Trauma patient needs surgery - minimal scene time',
    };
  }
  
  if (isRespiratory) {
    return {
      approach: 'stay_and_play',
      rationale: 'Stabilize breathing before transport',
    };
  }
  
  if (transportTime > 30) {
    return {
      approach: 'load_and_go',
      rationale: 'Long transport time - hospital provides definitive care',
    };
  }
  
  return {
    approach: 'stay_and_play',
    rationale: 'Stabilize patient before transport',
  };
}

export type { FamilyMember, FamilyEmotionalState, CulturalBackground, TransportMode, FacilityLevel, ReceivingFacility };
