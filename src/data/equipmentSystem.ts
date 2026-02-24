/**
 * Equipment Management System
 * 
 * Realistic equipment requirements, availability, and failure scenarios
 */

import type { VitalSigns } from '@/types';

export type EquipmentStatus = 'available' | 'in-use' | 'unavailable' | 'malfunctioning' | 'contaminated';
export type EquipmentCategory = 'monitoring' | 'airway' | 'vascular' | 'medication' | 'immobilization' | 'diagnostic' | 'other';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  description: string;
  requiredForVitals?: (keyof VitalSigns)[];
  requiredForTreatments?: string[];
  batteryLife?: number; // minutes
  isReusable: boolean;
  requiresCalibration: boolean;
  malfunctionChance: number; // 0-1
}

// Complete equipment inventory
export const EQUIPMENT_INVENTORY: Equipment[] = [
  // MONITORING
  {
    id: 'pulse_oximeter',
    name: 'Pulse Oximeter',
    category: 'monitoring',
    description: 'Finger probe SpO2 and pulse rate monitor',
    requiredForVitals: ['spo2', 'pulse'],
    batteryLife: 480,
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.02,
  },
  {
    id: 'bp_cuff_manual',
    name: 'Manual BP Cuff',
    category: 'monitoring',
    description: 'Sphygmomanometer with stethoscope',
    requiredForVitals: ['bp'],
    isReusable: true,
    requiresCalibration: true,
    malfunctionChance: 0.01,
  },
  {
    id: 'bp_monitor_auto',
    name: 'Automatic BP Monitor',
    category: 'monitoring',
    description: 'Digital automatic blood pressure device',
    requiredForVitals: ['bp'],
    batteryLife: 240,
    isReusable: true,
    requiresCalibration: true,
    malfunctionChance: 0.03,
  },
  {
    id: 'thermometer_digital',
    name: 'Digital Thermometer',
    category: 'monitoring',
    description: 'Oral/axillary thermometer',
    requiredForVitals: ['temperature'],
    batteryLife: 720,
    isReusable: false, // Single use covers
    requiresCalibration: false,
    malfunctionChance: 0.01,
  },
  {
    id: 'thermometer_tympanic',
    name: 'Tympanic Thermometer',
    category: 'monitoring',
    description: 'Ear thermometer',
    requiredForVitals: ['temperature'],
    batteryLife: 480,
    isReusable: false, // Disposable probe covers
    requiresCalibration: false,
    malfunctionChance: 0.02,
  },
  {
    id: 'ecg_monitor',
    name: 'ECG/Defibrillator Monitor',
    category: 'monitoring',
    description: '3/4 lead ECG with defibrillation capability',
    requiredForVitals: ['pulse'],
    requiredForTreatments: ['defibrillation', 'cardioversion', 'pacing'],
    batteryLife: 120,
    isReusable: true,
    requiresCalibration: true,
    malfunctionChance: 0.05,
  },
  {
    id: 'glucometer',
    name: 'Glucometer',
    category: 'monitoring',
    description: 'Blood glucose meter with test strips',
    requiredForVitals: ['bloodGlucose'],
    batteryLife: 1440,
    isReusable: false, // Single use strips
    requiresCalibration: true,
    malfunctionChance: 0.03,
  },
  {
    id: 'capnography',
    name: 'Capnography',
    category: 'monitoring',
    description: 'End-tidal CO2 monitor',
    requiredForVitals: ['etco2'],
    batteryLife: 240,
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.04,
  },
  
  // AIRWAY
  {
    id: 'oxygen_cylinder',
    name: 'Oxygen Cylinder',
    category: 'airway',
    description: 'Portable oxygen with regulator',
    requiredForTreatments: ['oxygen_therapy', 'nebulizer'],
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.01,
  },
  {
    id: 'bag_valve_mask',
    name: 'Bag-Valve-Mask (BVM)',
    category: 'airway',
    description: 'Ambu bag with mask',
    requiredForTreatments: ['ventilation'],
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.02,
  },
  {
    id: 'suction_unit',
    name: 'Portable Suction Unit',
    category: 'airway',
    description: 'Yankauer and flexible suction catheters',
    requiredForTreatments: ['suction', 'airway_clearance'],
    batteryLife: 60,
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.05,
  },
  {
    id: 'opa_set',
    name: 'OPA Set (Sizes 0-5)',
    category: 'airway',
    description: 'Oropharyngeal airways',
    requiredForTreatments: ['opa_insertion'],
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.01,
  },
  {
    id: 'npa_set',
    name: 'NPA Set (Sizes 6-9)',
    category: 'airway',
    description: 'Nasopharyngeal airways',
    requiredForTreatments: ['npa_insertion'],
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.01,
  },
  {
    id: 'laryngoscope',
    name: 'Laryngoscope',
    category: 'airway',
    description: 'Direct laryngoscope with blades',
    requiredForTreatments: ['intubation'],
    batteryLife: 120,
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.05,
  },
  {
    id: 'ett_set',
    name: 'ETT Set (Sizes 6.0-8.5)',
    category: 'airway',
    description: 'Endotracheal tubes with stylets',
    requiredForTreatments: ['intubation'],
    isReusable: false,
    requiresCalibration: false,
    malfunctionChance: 0.0,
  },
  
  // VASCULAR
  {
    id: 'iv_start_kit',
    name: 'IV Start Kit',
    category: 'vascular',
    description: 'Cannulas, dressings, extension sets',
    requiredForTreatments: ['iv_access', 'iv_fluids'],
    isReusable: false,
    requiresCalibration: false,
    malfunctionChance: 0.0,
  },
  {
    id: 'io_drill',
    name: 'IO Drill (EZ-IO)',
    category: 'vascular',
    description: 'Intraosseous insertion device',
    requiredForTreatments: ['io_access'],
    batteryLife: 60,
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.03,
  },
  {
    id: 'io_needles',
    name: 'IO Needles (15mm, 25mm, 45mm)',
    category: 'vascular',
    description: 'Intraosseous needles',
    requiredForTreatments: ['io_access'],
    isReusable: false,
    requiresCalibration: false,
    malfunctionChance: 0.0,
  },
  {
    id: 'saline_bags',
    name: 'Normal Saline Bags',
    category: 'vascular',
    description: '1000ml and 500ml bags',
    requiredForTreatments: ['fluid_resuscitation'],
    isReusable: false,
    requiresCalibration: false,
    malfunctionChance: 0.0,
  },
  
  // MEDICATION
  {
    id: 'syringes_needles',
    name: 'Syringes & Needles',
    category: 'medication',
    description: 'Various sizes',
    requiredForTreatments: ['im_injection', 'iv_push'],
    isReusable: false,
    requiresCalibration: false,
    malfunctionChance: 0.0,
  },
  {
    id: 'nebulizer_kit',
    name: 'Nebulizer Kit',
    category: 'medication',
    description: 'Nebulizer chamber with tubing',
    requiredForTreatments: ['nebulizer'],
    isReusable: false,
    requiresCalibration: false,
    malfunctionChance: 0.02,
  },
  
  // IMMOBILIZATION
  {
    id: 'c_collar',
    name: 'Cervical Collars (S/M/L)',
    category: 'immobilization',
    description: 'Rigid C-spine immobilization',
    requiredForTreatments: ['spinal_immobilization'],
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.01,
  },
  {
    id: 'backboard',
    name: 'Spinal Board',
    category: 'immobilization',
    description: 'Rigid backboard with straps',
    requiredForTreatments: ['spinal_immobilization'],
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.02,
  },
  {
    id: 'tourniquet_cat',
    name: 'Combat Application Tourniquet',
    category: 'immobilization',
    description: 'Windlass tourniquet',
    requiredForTreatments: ['bleeding_control'],
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.01,
  },
  {
    id: 'pelvic_binder',
    name: 'Pelvic Binder',
    category: 'immobilization',
    description: 'Commercial pelvic binder',
    requiredForTreatments: ['pelvic_immobilization'],
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.01,
  },
  
  // DIAGNOSTIC
  {
    id: 'stethoscope',
    name: 'Stethoscope',
    category: 'diagnostic',
    description: 'Dual-head stethoscope',
    requiredForVitals: ['bp'],
    requiredForTreatments: ['auscultation'],
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.01,
  },
  {
    id: 'penlight',
    name: 'Penlight',
    category: 'diagnostic',
    description: 'Diagnostic light',
    requiredForTreatments: ['pupil_assessment'],
    batteryLife: 300,
    isReusable: true,
    requiresCalibration: false,
    malfunctionChance: 0.05,
  },
  {
    id: 'ecg_leads',
    name: 'ECG Electrodes',
    category: 'diagnostic',
    description: 'Disposable ECG electrodes',
    requiredForTreatments: ['ecg_12lead'],
    isReusable: false,
    requiresCalibration: false,
    malfunctionChance: 0.0,
  },
];

// Equipment Manager Class
export class EquipmentManager {
  private equipment: Map<string, EquipmentStatus> = new Map();
  private batteryLevels: Map<string, number> = new Map();
  private lastUsed: Map<string, number> = new Map();

  constructor() {
    // Initialize all equipment as available
    EQUIPMENT_INVENTORY.forEach(eq => {
      this.equipment.set(eq.id, 'available');
      this.batteryLevels.set(eq.id, eq.batteryLife || 1000);
      this.lastUsed.set(eq.id, 0);
    });
  }

  // Check if equipment is available
  isAvailable(equipmentId: string): boolean {
    const status = this.equipment.get(equipmentId);
    return status === 'available' || status === 'in-use';
  }

  // Use equipment
  useEquipment(equipmentId: string): { success: boolean; message?: string } {
    const equipment = EQUIPMENT_INVENTORY.find(eq => eq.id === equipmentId);
    if (!equipment) {
      return { success: false, message: 'Equipment not found' };
    }

    const status = this.equipment.get(equipmentId);
    
    if (status === 'unavailable') {
      return { success: false, message: `${equipment.name} is not available` };
    }

    if (status === 'malfunctioning') {
      return { success: false, message: `${equipment.name} is malfunctioning` };
    }

    if (status === 'contaminated') {
      return { success: false, message: `${equipment.name} needs cleaning` };
    }

    // Check battery
    const battery = this.batteryLevels.get(equipmentId) || 0;
    if (battery <= 0 && equipment.batteryLife) {
      return { success: false, message: `${equipment.name} battery is dead` };
    }

    // Check for malfunction
    if (Math.random() < equipment.malfunctionChance) {
      this.equipment.set(equipmentId, 'malfunctioning');
      return { success: false, message: `${equipment.name} has malfunctioned!` };
    }

    this.equipment.set(equipmentId, 'in-use');
    this.lastUsed.set(equipmentId, Date.now());
    
    return { success: true };
  }

  // Release equipment
  releaseEquipment(equipmentId: string): void {
    const status = this.equipment.get(equipmentId);
    if (status === 'in-use') {
      this.equipment.set(equipmentId, 'available');
    }
  }

  // Drain battery during use
  drainBattery(equipmentId: string, minutes: number): void {
    const equipment = EQUIPMENT_INVENTORY.find(eq => eq.id === equipmentId);
    if (!equipment || !equipment.batteryLife) return;

    const currentBattery = this.batteryLevels.get(equipmentId) || equipment.batteryLife;
    const drainRate = equipment.batteryLife / 60; // per minute
    const newBattery = Math.max(0, currentBattery - (drainRate * minutes));
    
    this.batteryLevels.set(equipmentId, newBattery);
    
    if (newBattery <= 0) {
      this.equipment.set(equipmentId, 'unavailable');
    }
  }

  // Get equipment status
  getStatus(equipmentId: string): EquipmentStatus {
    return this.equipment.get(equipmentId) || 'unavailable';
  }

  // Get battery level
  getBatteryLevel(equipmentId: string): number {
    return this.batteryLevels.get(equipmentId) || 0;
  }

  // Get equipment required for vital signs
  getEquipmentForVital(vitalKey: keyof VitalSigns): Equipment[] {
    return EQUIPMENT_INVENTORY.filter(eq => 
      eq.requiredForVitals?.includes(vitalKey)
    );
  }

  // Check if all equipment is available for a vital sign
  canAssessVital(vitalKey: keyof VitalSigns): { canAssess: boolean; missing: string[] } {
    const required = this.getEquipmentForVital(vitalKey);
    const missing: string[] = [];

    required.forEach(eq => {
      if (!this.isAvailable(eq.id)) {
        missing.push(eq.name);
      }
    });

    return {
      canAssess: missing.length === 0,
      missing,
    };
  }

  // Simulate equipment failure
  causeMalfunction(equipmentId: string): void {
    this.equipment.set(equipmentId, 'malfunctioning');
  }

  // Fix malfunctioning equipment
  repairEquipment(equipmentId: string): { success: boolean; timeRequired: number } {
    const status = this.equipment.get(equipmentId);
    if (status !== 'malfunctioning') {
      return { success: false, timeRequired: 0 };
    }

    // Repair takes 2-5 minutes
    const repairTime = Math.floor(Math.random() * 3) + 2;
    this.equipment.set(equipmentId, 'available');
    
    return { success: true, timeRequired: repairTime };
  }

  // Charge/replace battery
  chargeBattery(equipmentId: string): { success: boolean; timeRequired: number } {
    const equipment = EQUIPMENT_INVENTORY.find(eq => eq.id === equipmentId);
    if (!equipment || !equipment.batteryLife) {
      return { success: false, timeRequired: 0 };
    }

    // Charging takes 5-10 minutes
    const chargeTime = Math.floor(Math.random() * 5) + 5;
    this.batteryLevels.set(equipmentId, equipment.batteryLife);
    
    const status = this.equipment.get(equipmentId);
    if (status === 'unavailable') {
      this.equipment.set(equipmentId, 'available');
    }

    return { success: true, timeRequired: chargeTime };
  }

  // Get all equipment status for display
  getAllStatus(): Array<{ equipment: Equipment; status: EquipmentStatus; battery?: number }> {
    return EQUIPMENT_INVENTORY.map(eq => ({
      equipment: eq,
      status: this.equipment.get(eq.id) || 'unavailable',
      battery: eq.batteryLife ? this.batteryLevels.get(eq.id) : undefined,
    }));
  }
}

// Create singleton instance
export const equipmentManager = new EquipmentManager();

// Equipment failure scenarios
export const EQUIPMENT_FAILURES = [
  {
    id: 'pulse_ox_falls_off',
    name: 'Pulse Oximeter Falls Off',
    description: 'Patient movement caused probe to dislodge',
    equipment: 'pulse_oximeter',
    effect: 'SpO2 reading lost',
  },
  {
    id: 'bp_cuff_leak',
    name: 'BP Cuff Leak',
    description: 'Slow leak in BP cuff bladder',
    equipment: 'bp_cuff_manual',
    effect: 'Cannot obtain accurate BP',
  },
  {
    id: 'monitor_battery_low',
    name: 'Monitor Battery Low',
    description: 'ECG monitor battery critically low',
    equipment: 'ecg_monitor',
    effect: 'Connect to power or replace battery',
  },
  {
    id: 'suction_blocked',
    name: 'Suction Tubing Blocked',
    description: 'Secretions blocking suction tubing',
    equipment: 'suction_unit',
    effect: 'Suction ineffective - clear or replace tubing',
  },
  {
    id: 'oxygen_running_low',
    name: 'Oxygen Cylinder Low',
    description: 'O2 tank pressure below 500psi',
    equipment: 'oxygen_cylinder',
    effect: 'Switch to backup cylinder soon',
  },
  {
    id: 'glucometer_error',
    name: 'Glucometer Error',
    description: 'Error code on glucometer display',
    equipment: 'glucometer',
    effect: 'Repeat test with new strip',
  },
];

export type { Equipment, EquipmentStatus, EquipmentCategory };
