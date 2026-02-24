/**
 * Multi-Patient / Mass Casualty System
 * 
 * Manage multiple patients with triage and resource allocation
 */

import type { VitalSigns } from '@/types';

export type TriageCategory = 'immediate' | 'delayed' | 'minor' | 'expectant' | 'dead';
export type PatientStatus = 'waiting' | 'assessing' | 'treating' | 'transporting' | 'completed';

export interface MassCasualtyPatient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  vitalSigns: VitalSigns;
  chiefComplaint: string;
  triageCategory: TriageCategory;
  status: PatientStatus;
  timeWaiting: number; // minutes
  assignedProvider?: string;
  interventions: string[];
  deteriorationRate: number; // 0-1, how fast they worsen
  location: string; // where they are in the scene
  specialNeeds?: string[]; // e.g., ['interpreter', 'pediatric', 'bariatric']
}

export interface MCIIncident {
  id: string;
  type: string;
  location: string;
  totalPatients: number;
  immediateCount: number;
  delayedCount: number;
  minorCount: number;
  expectantCount: number;
  hazards: string[];
  resourcesAvailable: number; // number of providers
  timeLimit: number; // minutes until critical deterioration
}

// Triage sorting guidelines
export const TRIAGE_GUIDELINES: Record<TriageCategory, {
  name: string;
  color: string;
  description: string;
  criteria: string[];
  maxWaitTime: number; // minutes
  priority: number;
}> = {
  immediate: {
    name: 'Immediate (Red)',
    color: 'red',
    description: 'Life-threatening, requires immediate intervention',
    criteria: [
      'Respiratory distress / failure',
      'Uncontrolled bleeding',
      'Shock (SBP < 90)',
      'GCS < 12',
      'Airway compromise',
      'Tension pneumothorax',
    ],
    maxWaitTime: 0, // Immediate
    priority: 1,
  },
  delayed: {
    name: 'Delayed (Yellow)',
    color: 'yellow',
    description: 'Serious but stable, can wait for treatment',
    criteria: [
      'Fractures',
      'Controlled bleeding',
      'Stable abdominal injuries',
      'Burns 15-40%',
      'GCS 12-14',
    ],
    maxWaitTime: 60, // 1 hour
    priority: 2,
  },
  minor: {
    name: 'Minor (Green)',
    color: 'green',
    description: 'Walking wounded, can wait',
    criteria: [
      'Minor lacerations',
      'Sprains',
      'Walking wounded',
      'Minor burns < 15%',
      'Stable vital signs',
    ],
    maxWaitTime: 120, // 2 hours
    priority: 3,
  },
  expectant: {
    name: 'Expectant (Blue/Black)',
    color: 'gray',
    description: 'Unlikely to survive with available resources',
    criteria: [
      'Cardiac arrest',
      'Severe head injury with unequal pupils',
      'Burns > 60%',
      'Penetrating torso trauma with CPR > 5 min',
    ],
    maxWaitTime: Infinity, // Comfort care only
    priority: 4,
  },
  dead: {
    name: 'Deceased (Black)',
    color: 'black',
    description: 'Obvious death or asystole with no CPR',
    criteria: [
      'Obvious death',
      'Rigor mortis',
      'Decapitation',
      'Asystole with no CPR initiated',
    ],
    maxWaitTime: Infinity,
    priority: 5,
  },
};

// Sample mass casualty scenarios
export const MCI_SCENARIOS: MCIIncident[] = [
  {
    id: 'mci_001',
    type: 'Multi-Vehicle RTC',
    location: 'Sheikh Zayed Road, Dubai',
    totalPatients: 12,
    immediateCount: 3,
    delayedCount: 5,
    minorCount: 4,
    expectantCount: 0,
    hazards: ['Traffic', 'Fuel spill', 'Glass debris'],
    resourcesAvailable: 4,
    timeLimit: 30,
  },
  {
    id: 'mci_002',
    type: 'Building Collapse',
    location: 'Deira, Dubai',
    totalPatients: 25,
    immediateCount: 8,
    delayedCount: 10,
    minorCount: 5,
    expectantCount: 2,
    hazards: ['Unstable structure', 'Dust', 'Entrapment'],
    resourcesAvailable: 6,
    timeLimit: 45,
  },
  {
    id: 'mci_003',
    type: 'Shopping Mall Fire',
    location: 'Mall of the Emirates',
    totalPatients: 18,
    immediateCount: 4,
    delayedCount: 6,
    minorCount: 7,
    expectantCount: 1,
    hazards: ['Fire', 'Smoke inhalation', 'Crowds'],
    resourcesAvailable: 5,
    timeLimit: 20,
  },
  {
    id: 'mci_004',
    type: 'Worksite Accident',
    location: 'Construction Site, Abu Dhabi',
    totalPatients: 6,
    immediateCount: 2,
    delayedCount: 2,
    minorCount: 2,
    expectantCount: 0,
    hazards: ['Heavy machinery', 'Chemicals', 'Fall risk'],
    resourcesAvailable: 3,
    timeLimit: 15,
  },
];

// Generate random MCI patients
export function generateMCIPatients(incident: MCIIncident): MassCasualtyPatient[] {
  const patients: MassCasualtyPatient[] = [];
  const firstNames = ['Ahmed', 'Mohammed', 'Fatima', 'Aisha', 'Ali', 'Sara', 'Omar', 'Hassan', 'Layla', 'Yusuf'];
  const lastNames = ['Al-Rashid', 'Al-Mansouri', 'Khan', 'Hassan', 'Al-Farsi', 'Al-Zaheri'];
  const complaints = [
    'Head injury',
    'Chest pain',
    'Difficulty breathing',
    'Fractured leg',
    'Burns',
    'Abdominal pain',
    'Back pain',
    'Lacerations',
  ];

  let patientId = 1;

  // Generate immediate patients
  for (let i = 0; i < incident.immediateCount; i++) {
    patients.push(createPatient(
      `MCI-${patientId++}`,
      'immediate',
      firstNames[Math.floor(Math.random() * firstNames.length)],
      lastNames[Math.floor(Math.random() * lastNames.length)],
      complaints[Math.floor(Math.random() * 3)], // More serious complaints
      0.8 // Fast deterioration
    ));
  }

  // Generate delayed patients
  for (let i = 0; i < incident.delayedCount; i++) {
    patients.push(createPatient(
      `MCI-${patientId++}`,
      'delayed',
      firstNames[Math.floor(Math.random() * firstNames.length)],
      lastNames[Math.floor(Math.random() * lastNames.length)],
      complaints[Math.floor(Math.random() * complaints.length)],
      0.4 // Moderate deterioration
    ));
  }

  // Generate minor patients
  for (let i = 0; i < incident.minorCount; i++) {
    patients.push(createPatient(
      `MCI-${patientId++}`,
      'minor',
      firstNames[Math.floor(Math.random() * firstNames.length)],
      lastNames[Math.floor(Math.random() * lastNames.length)],
      complaints[Math.floor(Math.random() * complaints.length)],
      0.1 // Slow deterioration
    ));
  }

  // Generate expectant patients
  for (let i = 0; i < incident.expectantCount; i++) {
    patients.push(createPatient(
      `MCI-${patientId++}`,
      'expectant',
      firstNames[Math.floor(Math.random() * firstNames.length)],
      lastNames[Math.floor(Math.random() * lastNames.length)],
      'Critical traumatic injuries',
      1.0 // Very rapid deterioration
    ));
  }

  return patients.sort(() => Math.random() - 0.5); // Shuffle
}

function createPatient(
  id: string,
  category: TriageCategory,
  firstName: string,
  lastName: string,
  complaint: string,
  deteriorationRate: number
): MassCasualtyPatient {
  const age = Math.floor(Math.random() * 70) + 18;
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  
  // Generate appropriate vitals based on triage category
  let vitals: VitalSigns;
  
  switch (category) {
    case 'immediate':
      vitals = {
        bp: `${Math.floor(Math.random() * 40) + 60}/40`,
        pulse: Math.floor(Math.random() * 60) + 120,
        respiration: Math.floor(Math.random() * 20) + 30,
        spo2: Math.floor(Math.random() * 15) + 75,
        gcs: Math.floor(Math.random() * 5) + 8,
        temperature: 36.5,
        bloodGlucose: 5.5,
        time: new Date().toISOString(),
      };
      break;
    case 'delayed':
      vitals = {
        bp: `${Math.floor(Math.random() * 30) + 90}/60`,
        pulse: Math.floor(Math.random() * 40) + 90,
        respiration: Math.floor(Math.random() * 10) + 20,
        spo2: Math.floor(Math.random() * 10) + 88,
        gcs: Math.floor(Math.random() * 3) + 13,
        temperature: 36.5,
        bloodGlucose: 5.5,
        time: new Date().toISOString(),
      };
      break;
    case 'minor':
      vitals = {
        bp: `${Math.floor(Math.random() * 20) + 110}/70`,
        pulse: Math.floor(Math.random() * 20) + 70,
        respiration: Math.floor(Math.random() * 6) + 14,
        spo2: Math.floor(Math.random() * 5) + 94,
        gcs: 15,
        temperature: 36.5,
        bloodGlucose: 5.5,
        time: new Date().toISOString(),
      };
      break;
    case 'expectant':
      vitals = {
        bp: `${Math.floor(Math.random() * 20) + 40}/20`,
        pulse: Math.floor(Math.random() * 80) + 140,
        respiration: Math.floor(Math.random() * 10) + 4,
        spo2: Math.floor(Math.random() * 10) + 60,
        gcs: Math.floor(Math.random() * 4) + 3,
        temperature: 35.5,
        bloodGlucose: 5.5,
        time: new Date().toISOString(),
      };
      break;
    default:
      vitals = {
        bp: '120/80',
        pulse: 80,
        respiration: 16,
        spo2: 98,
        gcs: 15,
        temperature: 36.5,
        bloodGlucose: 5.5,
        time: new Date().toISOString(),
      };
  }

  return {
    id,
    name: `${firstName} ${lastName}`,
    age,
    gender,
    vitalSigns: vitals,
    chiefComplaint: complaint,
    triageCategory: category,
    status: 'waiting',
    timeWaiting: 0,
    interventions: [],
    deteriorationRate,
    location: `Area ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`,
  };
}

// Triage assessment tool
export function triagePatient(vitals: VitalSigns): TriageCategory {
  const pulse = vitals.pulse || 80;
  const spo2 = vitals.spo2 || 98;
  const respiration = vitals.respiration || 16;
  const gcs = vitals.gcs || 15;
  const systolic = parseInt(String(vitals.bp || '120/80').split('/')[0]);

  // Check for immediate
  if (
    pulse > 120 ||
    pulse < 50 ||
    spo2 < 90 ||
    respiration > 30 ||
    respiration < 10 ||
    gcs < 12 ||
    systolic < 90
  ) {
    return 'immediate';
  }

  // Check for delayed
  if (
    pulse > 100 ||
    spo2 < 95 ||
    respiration > 24 ||
    gcs < 15 ||
    systolic < 100
  ) {
    return 'delayed';
  }

  // Otherwise minor
  return 'minor';
}

// Calculate START triage jumpstart for pediatric
export function pediatricTriage(respiratoryRate: number, pulse: number, alertness: boolean): TriageCategory {
  // RPM: Respirations, Perfusion, Mental Status
  const respOk = respiratoryRate > 15 && respiratoryRate < 45;
  const perfusionOk = pulse < 140;
  
  if (!respOk) return 'immediate';
  if (!perfusionOk) return 'immediate';
  if (!alertness) return 'immediate';
  
  return 'delayed';
}

// Resource allocation helper
export function allocateResources(
  patients: MassCasualtyPatient[],
  availableProviders: number
): Map<string, string[]> {
  const allocation = new Map<string, string[]>();
  
  // Group patients by triage category
  const byCategory = {
    immediate: patients.filter(p => p.triageCategory === 'immediate'),
    delayed: patients.filter(p => p.triageCategory === 'delayed'),
    minor: patients.filter(p => p.triageCategory === 'minor'),
    expectant: patients.filter(p => p.triageCategory === 'expectant'),
  };

  // Allocate providers proportionally
  // Immediate: 60% of resources
  // Delayed: 30% of resources
  // Minor: 10% of resources
  const immediateProviders = Math.max(1, Math.floor(availableProviders * 0.6));
  const delayedProviders = Math.max(1, Math.floor(availableProviders * 0.3));
  const minorProviders = Math.max(0, availableProviders - immediateProviders - delayedProviders);

  allocation.set('immediate', [`${immediateProviders} provider${immediateProviders > 1 ? 's' : ''}`]);
  allocation.set('delayed', [`${delayedProviders} provider${delayedProviders > 1 ? 's' : ''}`]);
  allocation.set('minor', [`${minorProviders} provider${minorProviders > 1 ? 's' : ''}`]);

  return allocation;
}

// Calculate triage accuracy
export function calculateTriageAccuracy(
  userTriage: Map<string, TriageCategory>,
  actualTriage: Map<string, TriageCategory>
): { accuracy: number; overTriage: number; underTriage: number } {
  let correct = 0;
  let over = 0; // User marked as more severe
  let under = 0; // User marked as less severe

  userTriage.forEach((userCat, patientId) => {
    const actualCat = actualTriage.get(patientId);
    if (!actualCat) return;

    if (userCat === actualCat) {
      correct++;
    } else {
      const priorityOrder = ['immediate', 'delayed', 'minor', 'expectant', 'dead'];
      const userPriority = priorityOrder.indexOf(userCat);
      const actualPriority = priorityOrder.indexOf(actualCat);
      
      if (userPriority < actualPriority) {
        over++;
      } else {
        under++;
      }
    }
  });

  const total = userTriage.size;
  return {
    accuracy: total > 0 ? (correct / total) * 100 : 0,
    overTriage: total > 0 ? (over / total) * 100 : 0,
    underTriage: total > 0 ? (under / total) * 100 : 0,
  };
}

// Export types
export type { TriageCategory, PatientStatus, MassCasualtyPatient, MCIIncident };
