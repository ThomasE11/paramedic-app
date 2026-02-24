/**
 * Environmental Factors System
 * 
 * Temperature, altitude, weather, and other environmental effects on patients
 */

import type { VitalSigns } from '@/types';

export type WeatherCondition = 'sunny' | 'hot' | 'cold' | 'rain' | 'wind' | 'sandstorm';
export type EnvironmentType = 'indoor' | 'outdoor' | 'vehicle' | 'water' | 'confined';
export type AltitudeZone = 'sea' | 'low' | 'moderate' | 'high' | 'extreme';

export interface EnvironmentalConditions {
  temperature: number; // Celsius
  humidity: number; // 0-100%
  weather: WeatherCondition;
  altitude: number; // meters
  environmentType: EnvironmentType;
  timeOfDay: 'day' | 'night';
  hazards: string[];
}

// UAE-specific environmental scenarios
export const UAE_ENVIRONMENTS: EnvironmentalConditions[] = [
  {
    temperature: 45,
    humidity: 80,
    weather: 'hot',
    altitude: 5,
    environmentType: 'outdoor',
    timeOfDay: 'day',
    hazards: ['Heat exhaustion risk', 'Dehydration', 'Sun exposure'],
  },
  {
    temperature: 20,
    humidity: 40,
    weather: 'sunny',
    altitude: 1200,
    environmentType: 'outdoor',
    timeOfDay: 'day',
    hazards: ['Altitude effects', 'UV exposure'],
  },
  {
    temperature: 18,
    humidity: 60,
    weather: 'rain',
    altitude: 10,
    environmentType: 'outdoor',
    timeOfDay: 'night',
    hazards: ['Slippery surfaces', 'Hypothermia risk', 'Reduced visibility'],
  },
  {
    temperature: 50,
    humidity: 20,
    weather: 'sandstorm',
    altitude: 200,
    environmentType: 'outdoor',
    timeOfDay: 'day',
    hazards: ['Respiratory distress', 'Eye injuries', 'Zero visibility'],
  },
  {
    temperature: -5,
    humidity: 30,
    weather: 'cold',
    altitude: 1500,
    environmentType: 'outdoor',
    timeOfDay: 'night',
    hazards: ['Severe hypothermia', 'Frostbite', 'Ice hazards'],
  },
];

// Environmental effects on vitals
export function applyEnvironmentalEffects(
  vitals: VitalSigns,
  environment: EnvironmentalConditions,
  exposureMinutes: number
): { newVitals: VitalSigns; effects: string[]; warnings: string[] } {
  const newVitals = { ...vitals };
  const effects: string[] = [];
  const warnings: string[] = [];

  // Temperature effects
  if (environment.temperature > 40) {
    // Heat stress
    const tempIncrease = Math.min(2, exposureMinutes * 0.05);
    newVitals.temperature = (newVitals.temperature || 36.5) + tempIncrease;
    newVitals.pulse = (newVitals.pulse || 80) + Math.min(20, exposureMinutes * 0.3);
    
    if (exposureMinutes > 15) {
      effects.push('Patient showing signs of heat stress');
      warnings.push('Risk of heat exhaustion');
    }
    if (exposureMinutes > 30) {
      effects.push('Core temperature rising');
      warnings.push('Heat stroke risk - active cooling required');
    }
  }

  if (environment.temperature < 10) {
    // Cold stress
    const tempDecrease = Math.min(2, exposureMinutes * 0.03);
    newVitals.temperature = (newVitals.temperature || 36.5) - tempDecrease;
    newVitals.pulse = (newVitals.pulse || 80) - Math.min(10, exposureMinutes * 0.1);
    
    if (exposureMinutes > 20) {
      effects.push('Patient showing signs of cold stress');
      warnings.push('Risk of hypothermia');
    }
    if (exposureMinutes > 45) {
      effects.push('Core temperature dropping');
      warnings.push('Hypothermia - warming required');
    }
  }

  // Altitude effects
  if (environment.altitude > 1000) {
    const spO2Drop = Math.min(10, (environment.altitude - 1000) / 200);
    newVitals.spo2 = Math.max(85, (newVitals.spo2 || 98) - spO2Drop);
    newVitals.respiration = (newVitals.respiration || 16) + Math.min(10, (environment.altitude - 1000) / 300);
    
    if (environment.altitude > 2000) {
      effects.push('Altitude hypoxia');
      warnings.push('Supplemental oxygen recommended');
    }
  }

  // Humidity effects (combined with temperature)
  if (environment.humidity > 70 && environment.temperature > 35) {
    // Heat index effect
    newVitals.pulse = (newVitals.pulse || 80) + 5;
    effects.push('High humidity increasing heat stress');
  }

  // Confined space effects
  if (environment.environmentType === 'confined') {
    newVitals.spo2 = Math.max(90, (newVitals.spo2 || 98) - 2);
    newVitals.pulse = (newVitals.pulse || 80) + 5;
    effects.push('Confined space - potential CO2 buildup');
  }

  // Sandstorm effects
  if (environment.weather === 'sandstorm') {
    newVitals.respiration = (newVitals.respiration || 16) + 4;
    newVitals.spo2 = Math.max(88, (newVitals.spo2 || 98) - 4);
    effects.push('Respiratory irritation from sand');
    warnings.push('Eye and airway protection needed');
  }

  return { newVitals, effects, warnings };
}

// Weather-specific treatment modifications
export function getWeatherTreatmentModifications(
  weather: WeatherCondition
): { modifiedTreatments: string[]; contraindications: string[]; specialConsiderations: string[] } {
  const modifications: Record<WeatherCondition, {
    modifiedTreatments: string[];
    contraindications: string[];
    specialConsiderations: string[];
  }> = {
    sunny: {
      modifiedTreatments: ['Provide shade', 'Cool environment'],
      contraindications: [],
      specialConsiderations: ['Sun exposure can worsen heat illness'],
    },
    hot: {
      modifiedTreatments: ['Aggressive cooling', 'IV fluid replacement'],
      contraindications: ['Avoid direct sunlight exposure'],
      specialConsiderations: ['Heat stroke is medical emergency'],
    },
    cold: {
      modifiedTreatments: ['Passive rewarming', 'Active external rewarming'],
      contraindications: ['Avoid rapid rewarming of frostbite'],
      specialConsiderations: ['Handle patient gently - risk of arrhythmias'],
    },
    rain: {
      modifiedTreatments: ['Keep patient dry', 'Waterproof dressings'],
      contraindications: [],
      specialConsiderations: ['Hypothermia risk even in moderate temperatures'],
    },
    wind: {
      modifiedTreatments: ['Wind protection', 'Secure dressings'],
      contraindications: [],
      specialConsiderations: ['Wind chill factor', 'Dust protection'],
    },
    sandstorm: {
      modifiedTreatments: ['Eye irrigation', 'Airway protection'],
      contraindications: ['Do not remove embedded sand particles'],
      specialConsiderations: ['Respiratory compromise likely'],
    },
  };

  return modifications[weather];
}

/**
 * Communication Delays System
 * 
 * Realistic delays in hospital communication and response
 */

export type CommunicationType = 'radio' | 'phone' | 'cell' | 'satellite';
export type HospitalResponse = 'immediate' | 'standard' | 'delayed' | 'overwhelmed';

export interface CommunicationConditions {
  type: CommunicationType;
  signalStrength: number; // 0-100
  interference: boolean;
  hospitalCapacity: 'normal' | 'busy' | 'critical' | 'divert';
  distance: number; // km
}

// Communication delay calculation
export function calculateCommunicationDelay(
  conditions: CommunicationConditions
): { delaySeconds: number; quality: 'clear' | 'broken' | 'unreadable'; attempts: number } {
  let baseDelay = 10; // 10 seconds minimum
  let quality: 'clear' | 'broken' | 'unreadable' = 'clear';
  let attempts = 1;

  // Signal strength effect
  if (conditions.signalStrength < 50) {
    baseDelay += 20;
    quality = 'broken';
    attempts = Math.floor(Math.random() * 2) + 2;
  }
  if (conditions.signalStrength < 20) {
    baseDelay += 45;
    quality = 'unreadable';
    attempts = Math.floor(Math.random() * 3) + 3;
  }

  // Interference effect
  if (conditions.interference) {
    baseDelay += 15;
    quality = quality === 'clear' ? 'broken' : quality;
  }

  // Communication type
  const typeDelays: Record<CommunicationType, number> = {
    radio: 0,
    phone: 5,
    cell: 10,
    satellite: 20,
  };
  baseDelay += typeDelays[conditions.type];

  return { delaySeconds: baseDelay, quality, attempts };
}

// Hospital response time
export function calculateHospitalResponse(
  hospitalCapacity: CommunicationConditions['hospitalCapacity'],
  caseSeverity: 'minor' | 'moderate' | 'severe' | 'critical'
): { responseTime: number; acceptance: boolean; etaMessage: string } {
  const baseTimes: Record<CommunicationConditions['hospitalCapacity'], number> = {
    normal: 60,
    busy: 120,
    critical: 240,
    divert: 300,
  };

  let responseTime = baseTimes[hospitalCapacity];
  let acceptance = true;

  // Severity priority
  if (caseSeverity === 'critical') {
    responseTime = Math.max(30, responseTime * 0.5);
  } else if (caseSeverity === 'minor' && hospitalCapacity === 'divert') {
    acceptance = false;
  }

  const etaMessage = acceptance 
    ? `Hospital accepting. Team ready in ${Math.round(responseTime / 60)} minutes.`
    : 'Hospital on diversion. Contact alternative facility.';

  return { responseTime, acceptance, etaMessage };
}

// Language barrier scenarios
export const LANGUAGE_BARRIERS = [
  { language: 'Arabic', proficiency: 'none', scenario: 'Patient only speaks Arabic', delayMinutes: 5 },
  { language: 'Urdu', proficiency: 'none', scenario: 'South Asian patient, no English', delayMinutes: 5 },
  { language: 'Tagalog', proficiency: 'none', scenario: 'Filipino patient, limited English', delayMinutes: 3 },
  { language: 'Arabic', proficiency: 'basic', scenario: 'Patient understands basic English', delayMinutes: 2 },
  { language: 'Sign Language', proficiency: 'none', scenario: 'Deaf patient', delayMinutes: 10 },
];

// Communication scenarios
export const COMMUNICATION_SCENARIOS = [
  {
    id: 'radio_static',
    name: 'Radio Interference',
    description: 'Static on radio channel, need to repeat transmission',
    delay: 15,
    impact: 'low',
  },
  {
    id: 'poor_cell',
    name: 'Poor Cell Reception',
    description: 'Low signal in remote area, dropped call',
    delay: 30,
    impact: 'medium',
  },
  {
    id: 'language_barrier',
    name: 'Language Barrier',
    description: 'Patient does not speak English',
    delay: 300,
    impact: 'high',
  },
  {
    id: 'hospital_busy',
    name: 'Hospital Overwhelmed',
    description: 'Multiple casualties, delayed response',
    delay: 600,
    impact: 'high',
  },
  {
    id: 'satellite_delay',
    name: 'Satellite Communication',
    description: 'Remote location requiring satellite phone',
    delay: 45,
    impact: 'medium',
  },
];

export type { EnvironmentalConditions, CommunicationConditions, WeatherCondition, EnvironmentType };
