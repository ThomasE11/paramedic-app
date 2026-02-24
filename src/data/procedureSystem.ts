/**
 * Procedure Time Tracking System
 * 
 * Realistic procedure durations with step-by-step progression
 * Equipment requirements and skill checks
 */

import type { VitalSigns } from '@/types';

export type ProcedureStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
export type ProcedureDifficulty = 'basic' | 'intermediate' | 'advanced' | 'expert';

export interface ProcedureStep {
  name: string;
  description: string;
  duration: number; // seconds
  critical: boolean; // If failed, whole procedure fails
  equipment?: string[];
}

export interface Procedure {
  id: string;
  name: string;
  category: 'airway' | 'vascular' | 'assessment' | 'medication' | 'trauma' | 'other';
  difficulty: ProcedureDifficulty;
  totalDuration: number; // seconds
  steps: ProcedureStep[];
  successRate: number; // 0-1, base success rate
  prerequisites?: string[]; // Required procedures first
  contraindications?: string[];
  complications?: string[];
}

// Comprehensive procedure database
export const PROCEDURES: Procedure[] = [
  // AIRWAY PROCEDURES
  {
    id: 'oxygen_nasal_cannula',
    name: 'Apply Nasal Cannula',
    category: 'airway',
    difficulty: 'basic',
    totalDuration: 15,
    successRate: 0.99,
    steps: [
      { name: 'Explain procedure', description: 'Inform patient and gain consent', duration: 5, critical: false },
      { name: 'Select cannula', description: 'Choose appropriate size (adult/pediatric)', duration: 3, critical: false },
      { name: 'Apply nasal prongs', description: 'Insert into nostrils', duration: 5, critical: false },
      { name: 'Set flow rate', description: 'Adjust oxygen flow 2-6 L/min', duration: 2, critical: false },
    ],
  },
  {
    id: 'oxygen_nonrebreather',
    name: 'Apply Non-Rebreather Mask',
    category: 'airway',
    difficulty: 'basic',
    totalDuration: 20,
    successRate: 0.98,
    steps: [
      { name: 'Explain procedure', description: 'Inform patient and gain consent', duration: 5, critical: false },
      { name: 'Check reservoir bag', description: 'Ensure bag inflates properly', duration: 5, critical: true },
      { name: 'Apply mask', description: 'Secure over nose and mouth', duration: 5, critical: false },
      { name: 'Set flow rate', description: 'Adjust to 10-15 L/min', duration: 3, critical: false },
      { name: 'Verify seal', description: 'Check for leaks', duration: 2, critical: false },
    ],
  },
  {
    id: 'suction_oropharyngeal',
    name: 'Oropharyngeal Suction',
    category: 'airway',
    difficulty: 'intermediate',
    totalDuration: 45,
    successRate: 0.95,
    steps: [
      { name: 'Don PPE', description: 'Gloves, mask, eye protection', duration: 10, critical: false },
      { name: 'Check suction', description: 'Verify suction working 80-120mmHg', duration: 8, critical: true },
      { name: 'Measure catheter', description: 'Measure from ear to corner of mouth', duration: 5, critical: false },
      { name: 'Insert catheter', description: 'Insert without suction', duration: 8, critical: true },
      { name: 'Apply suction', description: 'Suction on withdrawal only', duration: 10, critical: false },
      { name: 'Monitor patient', description: 'Watch for gag reflex, hypoxia', duration: 4, critical: false },
    ],
    complications: ['Bradycardia from vagal stimulation', 'Hypoxia', 'Trauma to airway'],
  },
  {
    id: 'opa_insertion',
    name: 'Insert OPA (Oropharyngeal Airway)',
    category: 'airway',
    difficulty: 'intermediate',
    totalDuration: 30,
    successRate: 0.92,
    steps: [
      { name: 'Size selection', description: 'Measure from angle of jaw to corner of mouth', duration: 5, critical: true },
      { name: 'Open airway', description: 'Head tilt-chin lift', duration: 5, critical: false },
      { name: 'Insert upside down', description: 'Insert with tip towards roof of mouth', duration: 8, critical: true },
      { name: 'Rotate 180°', description: 'Rotate as passing tongue', duration: 7, critical: true },
      { name: 'Verify placement', description: 'Check airway patency', duration: 5, critical: true },
    ],
    contraindications: ['Gag reflex present', 'Oral trauma', 'Loose teeth'],
    complications: ['Gagging/vomiting', 'Airway trauma', 'Incorrect sizing'],
  },
  {
    id: 'intubation_ett',
    name: 'Endotracheal Intubation',
    category: 'airway',
    difficulty: 'expert',
    totalDuration: 120,
    successRate: 0.85,
    steps: [
      { name: 'Pre-oxygenation', description: '100% O2 for 3 minutes', duration: 30, critical: true },
      { name: 'Equipment check', description: 'Tube size, stylet, suction ready', duration: 15, critical: true },
      { name: 'Position patient', description: 'Sniffing position', duration: 10, critical: false },
      { name: 'Pre-treatment', description: 'Atropine/lidocaine if indicated', duration: 10, critical: false },
      { name: 'Induction', description: 'Administer sedative/paralytic', duration: 15, critical: true },
      { name: 'Visualization', description: 'Direct laryngoscopy', duration: 20, critical: true },
      { name: 'Tube insertion', description: 'Insert ETT through cords', duration: 10, critical: true },
      { name: 'Confirm placement', description: 'Capnography, auscultation', duration: 10, critical: true },
    ],
    prerequisites: ['oxygen_nonrebreather', 'suction_oropharyngeal'],
    contraindications: ['Severe facial trauma', 'C-spine injury without inline stabilization'],
    complications: ['Esophageal intubation', 'Hypoxia', 'Bradycardia', 'Dental trauma'],
  },
  
  // VASCULAR PROCEDURES
  {
    id: 'iv_cannulation',
    name: 'IV Cannulation',
    category: 'vascular',
    difficulty: 'intermediate',
    totalDuration: 90,
    successRate: 0.88,
    steps: [
      { name: 'Explain procedure', description: 'Inform patient', duration: 10, critical: false },
      { name: 'Apply tourniquet', description: '5-10cm above insertion site', duration: 5, critical: false },
      { name: 'Site selection', description: 'Identify suitable vein', duration: 15, critical: true },
      { name: 'Skin prep', description: 'Alcohol or chlorhexidine swab', duration: 10, critical: false },
      { name: 'Insert cannula', description: 'Bevel up, 10-30° angle', duration: 20, critical: true },
      { name: 'Advance catheter', description: 'Advance while withdrawing needle', duration: 10, critical: true },
      { name: 'Secure and flush', description: 'Apply dressing, flush line', duration: 20, critical: false },
    ],
    complications: ['Infiltration', 'Hematoma', 'Nerve injury', 'Infection'],
  },
  {
    id: 'io_insertion',
    name: 'IO Needle Insertion',
    category: 'vascular',
    difficulty: 'advanced',
    totalDuration: 60,
    successRate: 0.90,
    steps: [
      { name: 'Site selection', description: 'Proximal tibia or humeral head', duration: 10, critical: true },
      { name: 'Skin prep', description: 'Clean site with antiseptic', duration: 10, critical: false },
      { name: 'Position needle', description: '90° to skin surface', duration: 5, critical: false },
      { name: 'Insert with pressure', description: 'Twist/drill until pop felt', duration: 15, critical: true },
      { name: 'Remove stylet', description: 'Leave catheter in place', duration: 5, critical: false },
      { name: 'Confirm placement', description: 'Aspirate marrow, flush', duration: 10, critical: true },
      { name: 'Secure line', description: 'Apply dressing', duration: 5, critical: false },
    ],
    contraindications: ['Fracture at site', 'Previous IO attempt at site', 'Infection at site'],
    complications: ['Extravasation', 'Compartment syndrome', 'Infection', 'Fracture'],
  },
  
  // MEDICATION PROCEDURES
  {
    id: 'im_injection',
    name: 'IM Injection',
    category: 'medication',
    difficulty: 'intermediate',
    totalDuration: 40,
    successRate: 0.96,
    steps: [
      { name: 'Verify medication', description: 'Check 6 rights', duration: 10, critical: true },
      { name: 'Site selection', description: 'Deltoid, vastus lateralis, or ventrogluteal', duration: 5, critical: false },
      { name: 'Skin prep', description: 'Alcohol swab', duration: 5, critical: false },
      { name: 'Insert needle', description: '90° angle, quick dart', duration: 5, critical: false },
      { name: 'Aspirate', description: 'Check for blood return', duration: 5, critical: true },
      { name: 'Inject medication', description: 'Slow steady pressure', duration: 8, critical: false },
      { name: 'Withdraw needle', description: 'Apply pressure with gauze', duration: 2, critical: false },
    ],
  },
  {
    id: 'iv_push',
    name: 'IV Push Medication',
    category: 'medication',
    difficulty: 'intermediate',
    totalDuration: 60,
    successRate: 0.94,
    steps: [
      { name: 'Verify medication', description: 'Check 6 rights, compatibility', duration: 15, critical: true },
      { name: 'Flush line', description: 'Confirm patency with NS', duration: 10, critical: false },
      { name: 'Administer drug', description: 'Push at correct rate', duration: 20, critical: true },
      { name: 'Monitor patient', description: 'Watch for reactions', duration: 10, critical: true },
      { name: 'Document', description: 'Record time, dose, site', duration: 5, critical: false },
    ],
    complications: ['Infiltration', 'Speed shock', 'Allergic reaction'],
  },
  
  // TRAUMA PROCEDURES
  {
    id: 'tourniquet_application',
    name: 'Tourniquet Application',
    category: 'trauma',
    difficulty: 'basic',
    totalDuration: 30,
    successRate: 0.98,
    steps: [
      { name: 'Expose wound', description: 'Remove clothing around injury', duration: 5, critical: false },
      { name: 'Position tourniquet', description: '2-3 inches above wound', duration: 5, critical: true },
      { name: 'Pull strap tight', description: 'Remove all slack', duration: 5, critical: false },
      { name: 'Turn windlass', description: 'Twist rod until bleeding stops', duration: 10, critical: true },
      { name: 'Secure windlass', description: 'Lock in place', duration: 3, critical: false },
      { name: 'Note time', description: 'Document application time', duration: 2, critical: true },
    ],
    complications: ['Nerve damage', 'Compartment syndrome', 'Reperfusion injury'],
  },
  {
    id: 'pelvic_binder',
    name: 'Pelvic Binder Application',
    category: 'trauma',
    difficulty: 'intermediate',
    totalDuration: 60,
    successRate: 0.95,
    steps: [
      { name: 'Assess pelvis', description: 'Check for instability', duration: 10, critical: true },
      { name: 'Position binder', description: 'At level of greater trochanters', duration: 15, critical: true },
      { name: 'Apply binder', description: 'Wrap around pelvis', duration: 20, critical: false },
      { name: 'Tighten', description: 'Apply traction and secure', duration: 10, critical: false },
      { name: 'Reassess', description: 'Check distal pulses', duration: 5, critical: true },
    ],
    contraindications: ['Open pelvic fracture with protruding organs'],
  },
  {
    id: 'needle_decompression',
    name: 'Needle Decompression',
    category: 'trauma',
    difficulty: 'advanced',
    totalDuration: 90,
    successRate: 0.82,
    steps: [
      { name: 'Identify site', description: '2nd ICS midclavicular or 4th/5th ICS midaxillary', duration: 10, critical: true },
      { name: 'Prep site', description: 'Clean with antiseptic', duration: 10, critical: false },
      { name: 'Insert needle', description: 'Over superior rib margin', duration: 30, critical: true },
      { name: 'Confirm hissing', description: 'Listen for air escape', duration: 10, critical: true },
      { name: 'Secure catheter', description: 'Tape in place', duration: 10, critical: false },
      { name: 'Reassess', description: 'Check for improvement', duration: 10, critical: true },
      { name: 'Monitor', description: 'Watch for re-tensioning', duration: 10, critical: false },
    ],
    contraindications: ['Simple pneumothorax', 'Previous thoracotomy'],
    complications: ['Vascular injury', 'Lung laceration', 'Infection', 'Re-tensioning'],
  },
  
  // ASSESSMENT PROCEDURES
  {
    id: 'ecg_12lead',
    name: '12-Lead ECG',
    category: 'assessment',
    difficulty: 'intermediate',
    totalDuration: 180,
    successRate: 0.93,
    steps: [
      { name: 'Explain procedure', description: 'Inform patient', duration: 15, critical: false },
      { name: 'Patient position', description: 'Supine, relaxed', duration: 10, critical: false },
      { name: 'Skin prep', description: 'Clean sites, shave if needed', duration: 30, critical: false },
      { name: 'Apply limb leads', description: 'RA, LA, RL, LL', duration: 30, critical: true },
      { name: 'Apply precordial leads', description: 'V1-V6 correct placement', duration: 60, critical: true },
      { name: 'Record tracing', description: 'Ensure good quality', duration: 20, critical: true },
      { name: 'Remove electrodes', description: 'Clean skin', duration: 15, critical: false },
    ],
  },
  {
    id: 'glucometer',
    name: 'Blood Glucose Check',
    category: 'assessment',
    difficulty: 'basic',
    totalDuration: 45,
    successRate: 0.97,
    steps: [
      { name: 'Wash hands', description: 'Don gloves', duration: 10, critical: false },
      { name: 'Prepare meter', description: 'Insert test strip', duration: 5, critical: false },
      { name: 'Select site', description: 'Finger side, warm if needed', duration: 5, critical: false },
      { name: 'Clean site', description: 'Alcohol swab, let dry', duration: 10, critical: false },
      { name: 'Lance finger', description: 'Quick jab', duration: 3, critical: false },
      { name: 'Apply blood', description: 'Touch strip to drop', duration: 5, critical: true },
      { name: 'Read result', description: 'Wait for meter', duration: 5, critical: true },
      { name: 'Treat wound', description: 'Apply pressure, bandage', duration: 2, critical: false },
    ],
  },
];

// Get procedure by ID
export function getProcedure(id: string): Procedure | undefined {
  return PROCEDURES.find(p => p.id === id);
}

// Get procedures by category
export function getProceduresByCategory(category: Procedure['category']): Procedure[] {
  return PROCEDURES.filter(p => p.category === category);
}

// Get procedures by difficulty
export function getProceduresByDifficulty(difficulty: ProcedureDifficulty): Procedure[] {
  return PROCEDURES.filter(p => p.difficulty === difficulty);
}

// Calculate total procedure time including setup
export function calculateProcedureTime(
  procedure: Procedure,
  skillLevel: 'novice' | 'intermediate' | 'expert' = 'intermediate'
): number {
  const skillMultiplier = {
    novice: 1.5,
    intermediate: 1.0,
    expert: 0.8,
  };
  
  return Math.round(procedure.totalDuration * skillMultiplier[skillLevel]);
}

// Format duration for display
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) return `${minutes}min`;
  return `${minutes}min ${remainingSeconds}s`;
}

export type { ProcedureStatus, ProcedureDifficulty };
