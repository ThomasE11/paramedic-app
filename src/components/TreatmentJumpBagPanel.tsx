import { useMemo, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import type { AppliedTreatment, VitalSigns } from '@/types';
import {
  type Treatment,
  type TreatmentCategory,
  TREATMENTS,
  getOnsetDescription,
} from '@/data/enhancedTreatmentEffects';
import type { PatientState } from '@/data/dynamicTreatmentEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Ambulance,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Droplets,
  Gauge,
  HeartPulse,
  Loader2,
  Lightbulb,
  Pill,
  RotateCcw,
  Search,
  Syringe,
  Thermometer,
  Wind,
  XCircle,
} from 'lucide-react';

export type ManagementTab = 'airway' | 'breathing' | 'circulation' | 'disability' | 'exposure' | 'medications' | 'transport';

interface TreatmentJumpBag {
  key: ManagementTab;
  label: string;
  shortLabel: string;
  description: string;
  categories: TreatmentCategory[];
  treatmentIds?: string[];
  Icon: ComponentType<{ className?: string }>;
  railClass: string;
  selectedClass: string;
  bagColor: string;
  accentColor: string;
  shadowColor: string;
  contentsLabel: string;
  imagePath: string;
}

type EquipmentArtKind =
  | 'oxygen-cylinder'
  | 'suction'
  | 'aed'
  | 'tourniquet'
  | 'collar'
  | 'splint'
  | 'bandage'
  | 'blanket'
  | 'vial'
  | 'syringe'
  | 'tablet'
  | 'glucose'
  | 'cooling'
  | 'position'
  | 'case';

interface EquipmentInventoryItem {
  id: string;
  label: string;
  caption: string;
  treatmentId?: string;
  assetPath?: string;
  art?: EquipmentArtKind;
  tone?: string;
  wide?: boolean;
}

const DISABILITY_TREATMENT_IDS = [
  'glucose_10g',
  'dextrose_10',
  'dextrose_10_250ml',
  'midazolam_5mg',
  'midazolam_buccal',
  'diazepam_rectal',
  'mannitol_20',
  'naloxone_04mg',
  'ketamine_iv',
  'ondansetron_4mg',
  'metoclopramide_10mg',
  'hypertonic_saline',
  'lorazepam_4mg',
  'flumazenil_02mg',
];

const TRANSPORT_TREATMENT_IDS = [
  'cervical_collar',
  'head_blocks',
  'spinal_board',
  'scoop_stretcher',
  'vacuum_mattress',
  'ked',
  'traction_splint',
] as const;

const BAG_ASSET_PATHS = {
  airway: '/bag-assets/airway-bag.webp',
  breathing: '/bag-assets/breathing-bag.webp',
  circulation: '/bag-assets/circulation-kit.webp',
  medications: '/bag-assets/medication-pouch.webp',
  disability: '/bag-assets/neuro-kit.webp',
  exposure: '/bag-assets/exposure-pack.webp',
  transport: '/bag-assets/transport-kit.webp',
} as const;

const TREATMENT_JUMP_BAGS: TreatmentJumpBag[] = [
  {
    key: 'airway',
    label: 'Airway Bag',
    shortLabel: 'Airway',
    description: 'Open, clear, position, secure',
    categories: ['airway'],
    treatmentIds: ['oxygen_nasal', 'oxygen_mask', 'oxygen_nonrebreather', 'nebulizer_salbutamol'],
    Icon: Wind,
    railClass: 'bg-amber-400',
    selectedClass: 'border-amber-400/55 bg-amber-50/80 text-amber-950 dark:bg-amber-950/20 dark:text-amber-100',
    bagColor: '#f59e0b',
    accentColor: '#fff7ed',
    shadowColor: 'rgba(245, 158, 11, 0.28)',
    contentsLabel: 'OPA',
    imagePath: BAG_ASSET_PATHS.airway,
  },
  {
    key: 'breathing',
    label: 'Breathing Bag',
    shortLabel: 'Breathing',
    description: 'Oxygen, nebulisers, ventilation',
    categories: ['breathing'],
    Icon: Droplets,
    railClass: 'bg-sky-400',
    selectedClass: 'border-sky-400/55 bg-sky-50/80 text-sky-950 dark:bg-sky-950/20 dark:text-sky-100',
    bagColor: '#0ea5e9',
    accentColor: '#ecfeff',
    shadowColor: 'rgba(14, 165, 233, 0.28)',
    contentsLabel: 'O2',
    imagePath: BAG_ASSET_PATHS.breathing,
  },
  {
    key: 'circulation',
    label: 'Circulation Kit',
    shortLabel: 'Circulation',
    description: 'Access, fluids, CPR, shocks',
    categories: ['circulation'],
    Icon: HeartPulse,
    railClass: 'bg-rose-400',
    selectedClass: 'border-rose-400/55 bg-rose-50/80 text-rose-950 dark:bg-rose-950/20 dark:text-rose-100',
    bagColor: '#f43f5e',
    accentColor: '#fff1f2',
    shadowColor: 'rgba(244, 63, 94, 0.28)',
    contentsLabel: 'IV',
    imagePath: BAG_ASSET_PATHS.circulation,
  },
  {
    key: 'medications',
    label: 'Medication Pouch',
    shortLabel: 'Meds',
    description: 'Drugs, doses, safety prompts',
    categories: ['medication'],
    Icon: Pill,
    railClass: 'bg-blue-400',
    selectedClass: 'border-blue-400/55 bg-blue-50/80 text-blue-950 dark:bg-blue-950/20 dark:text-blue-100',
    bagColor: '#2563eb',
    accentColor: '#eff6ff',
    shadowColor: 'rgba(37, 99, 235, 0.28)',
    contentsLabel: 'Rx',
    imagePath: BAG_ASSET_PATHS.medications,
  },
  {
    key: 'disability',
    label: 'Neuro Kit',
    shortLabel: 'Neuro',
    description: 'Seizure, glucose, consciousness',
    categories: ['psychological'],
    treatmentIds: DISABILITY_TREATMENT_IDS,
    Icon: Brain,
    railClass: 'bg-blue-400',
    selectedClass: 'border-blue-400/55 bg-blue-50/80 text-blue-950 dark:bg-blue-950/20 dark:text-blue-100',
    bagColor: '#2563eb',
    accentColor: '#eff6ff',
    shadowColor: 'rgba(37, 99, 235, 0.28)',
    contentsLabel: 'GCS',
    imagePath: BAG_ASSET_PATHS.disability,
  },
  {
    key: 'exposure',
    label: 'Exposure Pack',
    shortLabel: 'Exposure',
    description: 'Positioning, pain, temperature',
    categories: ['comfort', 'positioning'],
    Icon: Thermometer,
    railClass: 'bg-emerald-400',
    selectedClass: 'border-emerald-400/55 bg-emerald-50/80 text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-100',
    bagColor: '#10b981',
    accentColor: '#ecfdf5',
    shadowColor: 'rgba(16, 185, 129, 0.28)',
    contentsLabel: 'TMP',
    imagePath: BAG_ASSET_PATHS.exposure,
  },
  {
    key: 'transport',
    label: 'Transport Kit',
    shortLabel: 'Transport',
    description: 'Carry, immobilise, extricate',
    categories: [],
    treatmentIds: [...TRANSPORT_TREATMENT_IDS],
    Icon: Ambulance,
    railClass: 'bg-red-400',
    selectedClass: 'border-red-400/55 bg-red-50/80 text-red-950 dark:bg-red-950/20 dark:text-red-100',
    bagColor: '#dc2626',
    accentColor: '#fef2f2',
    shadowColor: 'rgba(220, 38, 38, 0.28)',
    contentsLabel: 'MOV',
    imagePath: BAG_ASSET_PATHS.transport,
  },
];

function getSystolicFromBp(bp?: string): number {
  const systolic = Number(String(bp || '').split('/')[0]);
  return Number.isFinite(systolic) ? systolic : 120;
}

function getTreatmentEffectSummary(treatment: Treatment): string {
  if (treatment.effects.length === 0) return 'Response depends on scenario';

  return treatment.effects.slice(0, 3).map(effect => {
    const sign = effect.changeType === 'increase' ? '+' : effect.changeType === 'decrease' ? '-' : '';
    const vital = effect.vitalSign === 'bp' ? 'BP'
      : effect.vitalSign === 'pulse' ? 'HR'
        : effect.vitalSign === 'respiration' ? 'RR'
          : effect.vitalSign === 'spo2' ? 'SpO2'
            : effect.vitalSign === 'gcs' ? 'GCS'
              : effect.vitalSign === 'bloodGlucose' ? 'BGL'
                : effect.vitalSign === 'temperature' ? 'Temp'
                  : effect.vitalSign;
    return `${vital}${sign}${effect.value}`;
  }).join(' · ');
}

type ProductMiniatureKind = 'mask' | 'iv' | 'fluid' | 'pads' | 'vial' | 'tube' | 'device';

const PRODUCT_ASSET_PATHS = {
  nasal: '/equipment-assets/nasal-cannula.webp',
  simpleMask: '/equipment-assets/oxygen-mask.webp',
  nonrebreather: '/equipment-assets/nonrebreather-mask.webp',
  nebulizer: '/equipment-assets/nebulizer-mask.webp',
  bvm: '/equipment-assets/bvm.webp',
  cpap: '/equipment-assets/cpap-circuit.webp',
  ventilator: '/equipment-assets/portable-transport-ventilator.webp',
  compactVentilator: '/equipment-assets/compact-mechanical-ventilator.webp',
  ventilatorCircuit: '/equipment-assets/ventilator-circuit.webp',
  ivCannula: '/equipment-assets/iv-cannula.webp',
  fluidBag: '/equipment-assets/fluid-bag.webp',
  defibPads: '/equipment-assets/defib-pads.webp',
  lucas: '/equipment-assets/lucas-device.webp',
  etTube: '/equipment-assets/et-tube.webp',
  opa: '/equipment-assets/opa-set.webp',
} as const;

const EQUIPMENT_ASSET_PATHS = {
  oxygenCylinder: '/equipment-assets/oxygen-cylinder.webp',
  portableSuction: '/equipment-assets/portable-suction.webp',
  aedDefib: '/equipment-assets/aed-defib.webp',
  tourniquet: '/equipment-assets/tourniquet.webp',
  collar: '/equipment-assets/cervical-collar.webp',
  splints: '/equipment-assets/splints.webp',
  samSplint: '/equipment-assets/sam-splint.webp',
  boxSplint: '/equipment-assets/box-splint.webp',
  vacuumLimbSplint: '/equipment-assets/vacuum-limb-splint.webp',
  airSplint: '/equipment-assets/air-splint.webp',
  bandages: '/equipment-assets/bandages.webp',
  blanket: '/equipment-assets/warming-blanket.webp',
  adrenaline: '/equipment-assets/adrenaline-vials.webp',
  aspirin: '/equipment-assets/aspirin-tablets.webp',
  gtn: '/equipment-assets/gtn-spray.webp',
  analgesia: '/equipment-assets/analgesia-syringe.webp',
  txa: '/equipment-assets/txa-vials.webp',
  hydrocortisone: '/equipment-assets/hydrocortisone-vial.webp',
  glucose: '/equipment-assets/glucose-gel.webp',
  dextrose: '/equipment-assets/dextrose-bag.webp',
  midazolam: '/equipment-assets/midazolam-syringe.webp',
  naloxone: '/equipment-assets/naloxone-vial.webp',
  mannitol: '/equipment-assets/mannitol-bag.webp',
  ondansetron: '/equipment-assets/ondansetron-vial.webp',
  cooling: '/equipment-assets/cooling-pack.webp',
  positioning: '/equipment-assets/positioning.webp',
  needle: '/equipment-assets/needle-decompression.webp',
  ambulanceStretcher: '/equipment-assets/ambulance-stretcher.webp',
  spineBoard: '/equipment-assets/spine-board.webp',
  scoopStretcher: '/equipment-assets/scoop-stretcher.webp',
  headBlocks: '/equipment-assets/head-blocks.webp',
  vacuumMattress: '/equipment-assets/vacuum-mattress.webp',
  ked: '/equipment-assets/ked-extrication-device.webp',
  tractionSplint: '/equipment-assets/traction-splint.webp',
} as const;

const BAG_EQUIPMENT: Record<ManagementTab, EquipmentInventoryItem[]> = {
  airway: [
    { id: 'airway-oxygen-cylinder', label: 'Oxygen Cylinder', caption: 'High pressure O2 supply', assetPath: EQUIPMENT_ASSET_PATHS.oxygenCylinder, tone: '#16a34a' },
    { id: 'airway-bvm', label: 'Bag-valve-mask', caption: 'Assisted ventilation', treatmentId: 'bvm_ventilation', assetPath: PRODUCT_ASSET_PATHS.bvm, tone: '#2563eb', wide: true },
    { id: 'airway-suction', label: 'Portable Suction', caption: 'Clear blood or vomit', treatmentId: 'suction', assetPath: EQUIPMENT_ASSET_PATHS.portableSuction, tone: '#64748b' },
    { id: 'airway-opa', label: 'OPA Set', caption: 'Unconscious, no gag', treatmentId: 'opa_insert', assetPath: PRODUCT_ASSET_PATHS.opa, tone: '#f59e0b' },
    { id: 'airway-mask', label: 'Oxygen Mask', caption: 'Simple mask oxygen', treatmentId: 'oxygen_mask', assetPath: PRODUCT_ASSET_PATHS.simpleMask, tone: '#0ea5e9' },
    { id: 'airway-nrb', label: 'Non-rebreather', caption: 'High-flow reservoir mask', treatmentId: 'oxygen_nonrebreather', assetPath: PRODUCT_ASSET_PATHS.nonrebreather, tone: '#0284c7' },
    { id: 'airway-et', label: 'ET Tube', caption: 'Advanced airway', treatmentId: 'intubation', assetPath: PRODUCT_ASSET_PATHS.etTube, tone: '#0f766e' },
    { id: 'airway-rsi', label: 'RSI Airway Setup', caption: 'Sedation, paralysis, tube', treatmentId: 'rsi_intubation', assetPath: PRODUCT_ASSET_PATHS.etTube, tone: '#7c3aed' },
  ],
  breathing: [
    { id: 'breathing-nasal', label: 'Nasal Cannula', caption: 'Low-flow oxygen', treatmentId: 'oxygen_nasal', assetPath: PRODUCT_ASSET_PATHS.nasal, tone: '#0ea5e9' },
    { id: 'breathing-nrb', label: 'Non-rebreather', caption: 'High-flow oxygen', treatmentId: 'oxygen_nonrebreather', assetPath: PRODUCT_ASSET_PATHS.nonrebreather, tone: '#0284c7', wide: true },
    { id: 'breathing-bvm', label: 'BVM', caption: 'Ventilate poor effort', treatmentId: 'bvm_ventilation', assetPath: PRODUCT_ASSET_PATHS.bvm, tone: '#2563eb' },
    { id: 'breathing-neb', label: 'Nebuliser Mask', caption: 'Bronchodilator delivery', treatmentId: 'nebulizer_salbutamol', assetPath: PRODUCT_ASSET_PATHS.nebulizer, tone: '#06b6d4' },
    { id: 'breathing-cpap', label: 'CPAP Circuit', caption: 'NIV support', treatmentId: 'cpap_niv', assetPath: PRODUCT_ASSET_PATHS.cpap, tone: '#0891b2' },
    { id: 'breathing-vent-portable', label: 'Transport Ventilator', caption: 'Full ventilator setup', treatmentId: 'mechanical_ventilation', assetPath: PRODUCT_ASSET_PATHS.ventilator, tone: '#2563eb', wide: true },
    { id: 'breathing-vent-compact', label: 'Compact Ventilator', caption: 'Portable mechanical option', treatmentId: 'mechanical_ventilation', assetPath: PRODUCT_ASSET_PATHS.compactVentilator, tone: '#475569' },
    { id: 'breathing-vent-circuit', label: 'Ventilator Circuit', caption: 'Tubing, filter, catheter mount', treatmentId: 'ventilator_setup', assetPath: PRODUCT_ASSET_PATHS.ventilatorCircuit, tone: '#38bdf8' },
    { id: 'breathing-needle', label: 'Needle Decompression', caption: 'Tension pneumothorax', treatmentId: 'needle_decompression', assetPath: EQUIPMENT_ASSET_PATHS.needle, tone: '#f97316' },
    { id: 'breathing-occlusive', label: 'Three-Sided Dressing', caption: 'Fallback open chest seal', treatmentId: 'occlusive_dressing_3sided', assetPath: EQUIPMENT_ASSET_PATHS.bandages, tone: '#ea580c' },
  ],
  circulation: [
    { id: 'circ-iv', label: 'IV Cannula', caption: 'Vascular access', treatmentId: 'iv_access', assetPath: PRODUCT_ASSET_PATHS.ivCannula, tone: '#10b981' },
    { id: 'circ-fluids', label: 'Fluid Bag', caption: 'Small bolus first', treatmentId: 'fluids_250ml', assetPath: PRODUCT_ASSET_PATHS.fluidBag, tone: '#059669', wide: true },
    { id: 'circ-io', label: 'IO Drill', caption: 'Intraosseous access', treatmentId: 'io_access', assetPath: PRODUCT_ASSET_PATHS.ivCannula, tone: '#14b8a6' },
    { id: 'circ-aed', label: 'AED / Defib', caption: 'Pads and shock lead', treatmentId: 'defibrillation', assetPath: EQUIPMENT_ASSET_PATHS.aedDefib, tone: '#eab308' },
    { id: 'circ-pads', label: 'Defib Pads', caption: 'Attach to chest', treatmentId: 'aed', assetPath: PRODUCT_ASSET_PATHS.defibPads, tone: '#e11d48' },
    { id: 'circ-tourniquet', label: 'Tourniquet', caption: 'Major limb bleed', treatmentId: 'tourniquet', assetPath: EQUIPMENT_ASSET_PATHS.tourniquet, tone: '#111827' },
    { id: 'circ-chest-seal', label: 'Vented Chest Seal', caption: 'Open chest wound', treatmentId: 'chest_seal_vented', assetPath: EQUIPMENT_ASSET_PATHS.bandages, tone: '#f97316' },
    { id: 'circ-lucas', label: 'Mechanical CPR', caption: 'LUCAS device', treatmentId: 'lucas_device', assetPath: PRODUCT_ASSET_PATHS.lucas, tone: '#64748b' },
  ],
  medications: [
    { id: 'med-adrenaline', label: 'Adrenaline', caption: 'Arrest / anaphylaxis', treatmentId: 'adrenaline_1mg', assetPath: EQUIPMENT_ASSET_PATHS.adrenaline, tone: '#ef4444' },
    { id: 'med-aspirin', label: 'Aspirin', caption: 'ACS loading dose', treatmentId: 'aspirin', assetPath: EQUIPMENT_ASSET_PATHS.aspirin, tone: '#f59e0b' },
    { id: 'med-gtn', label: 'GTN Spray', caption: 'Chest pain if BP safe', treatmentId: 'gtn_spray', assetPath: EQUIPMENT_ASSET_PATHS.gtn, tone: '#2563eb' },
    { id: 'med-analgesia', label: 'Analgesia', caption: 'Morphine / fentanyl', treatmentId: 'fentanyl_50mcg', assetPath: EQUIPMENT_ASSET_PATHS.analgesia, tone: '#0ea5e9' },
    { id: 'med-txa', label: 'TXA', caption: 'Major haemorrhage', treatmentId: 'txa_1g', assetPath: EQUIPMENT_ASSET_PATHS.txa, tone: '#dc2626' },
    { id: 'med-hydrocort', label: 'Hydrocortisone', caption: 'Asthma / anaphylaxis', treatmentId: 'hydrocortisone_200mg', assetPath: EQUIPMENT_ASSET_PATHS.hydrocortisone, tone: '#22c55e' },
    { id: 'med-naloxone', label: 'Naloxone', caption: 'Opioid reversal', treatmentId: 'naloxone_04mg', assetPath: EQUIPMENT_ASSET_PATHS.naloxone, tone: '#0f766e' },
    { id: 'med-antiemetic', label: 'Antiemetic', caption: 'Ondansetron', treatmentId: 'ondansetron_4mg', assetPath: EQUIPMENT_ASSET_PATHS.ondansetron, tone: '#64748b' },
  ],
  disability: [
    { id: 'neuro-glucose', label: 'Glucose Gel', caption: 'Awake hypoglycaemia', treatmentId: 'glucose_10g', assetPath: EQUIPMENT_ASSET_PATHS.glucose, tone: '#f59e0b' },
    { id: 'neuro-dextrose', label: 'Dextrose 10%', caption: 'IV hypoglycaemia', treatmentId: 'dextrose_10', assetPath: EQUIPMENT_ASSET_PATHS.dextrose, tone: '#f97316' },
    { id: 'neuro-midazolam', label: 'Midazolam', caption: 'Active seizure', treatmentId: 'midazolam_5mg', assetPath: EQUIPMENT_ASSET_PATHS.midazolam, tone: '#2563eb' },
    { id: 'neuro-naloxone', label: 'Naloxone', caption: 'Opioid respiratory depression', treatmentId: 'naloxone_04mg', assetPath: EQUIPMENT_ASSET_PATHS.naloxone, tone: '#0f766e' },
    { id: 'neuro-mannitol', label: 'Mannitol', caption: 'Raised ICP protocol', treatmentId: 'mannitol_20', assetPath: EQUIPMENT_ASSET_PATHS.mannitol, tone: '#38bdf8' },
    { id: 'neuro-antiemetic', label: 'Antiemetic', caption: 'Nausea control', treatmentId: 'ondansetron_4mg', assetPath: EQUIPMENT_ASSET_PATHS.ondansetron, tone: '#64748b' },
  ],
  exposure: [
    { id: 'exposure-collar', label: 'Cervical Collar', caption: 'C-spine support', assetPath: EQUIPMENT_ASSET_PATHS.collar, tone: '#0ea5e9' },
    { id: 'exposure-sam-splint', label: 'SAM Splint', caption: 'Malleable limb splint', treatmentId: 'sam_splint', assetPath: EQUIPMENT_ASSET_PATHS.samSplint, tone: '#f97316' },
    { id: 'exposure-box-splint', label: 'Box Splint', caption: 'Rigid cardboard channel', treatmentId: 'box_splint', assetPath: EQUIPMENT_ASSET_PATHS.boxSplint, tone: '#d6a15f' },
    { id: 'exposure-vacuum-splint', label: 'Vacuum Splint', caption: 'Moulds around limb', treatmentId: 'vacuum_limb_splint', assetPath: EQUIPMENT_ASSET_PATHS.vacuumLimbSplint, tone: '#2563eb', wide: true },
    { id: 'exposure-air-splint', label: 'Air Splint', caption: 'Inflatable limb support', treatmentId: 'air_splint', assetPath: EQUIPMENT_ASSET_PATHS.airSplint, tone: '#38bdf8' },
    { id: 'exposure-traction', label: 'Traction Splint', caption: 'Isolated femur fracture', treatmentId: 'traction_splint', assetPath: EQUIPMENT_ASSET_PATHS.tractionSplint, tone: '#2563eb', wide: true },
    { id: 'exposure-splint-roll', label: 'Splint Roll', caption: 'General limb support', treatmentId: 'splinting', assetPath: EQUIPMENT_ASSET_PATHS.splints, tone: '#64748b' },
    { id: 'exposure-bandage', label: 'Bandages', caption: 'Dressings and wraps', treatmentId: 'bleeding_control', assetPath: EQUIPMENT_ASSET_PATHS.bandages, tone: '#f8fafc' },
    { id: 'exposure-blanket', label: 'Warming Blanket', caption: 'Prevent hypothermia', treatmentId: 'warming_blanket', assetPath: EQUIPMENT_ASSET_PATHS.blanket, tone: '#f59e0b', wide: true },
    { id: 'exposure-cooling', label: 'Cooling Pack', caption: 'Heat illness burns', treatmentId: 'active_cooling', assetPath: EQUIPMENT_ASSET_PATHS.cooling, tone: '#06b6d4' },
    { id: 'exposure-position', label: 'Positioning', caption: 'Upright / recovery', treatmentId: 'recovery_position', assetPath: EQUIPMENT_ASSET_PATHS.positioning, tone: '#10b981' },
  ],
  transport: [
    { id: 'transport-stretcher', label: 'Main Stretcher', caption: 'Wheeled ambulance trolley', assetPath: EQUIPMENT_ASSET_PATHS.ambulanceStretcher, tone: '#facc15', wide: true },
    { id: 'transport-spine-board', label: 'Long Spine Board', caption: 'Extrication and transfer', treatmentId: 'spinal_board', assetPath: EQUIPMENT_ASSET_PATHS.spineBoard, tone: '#facc15' },
    { id: 'transport-scoop', label: 'Scoop Stretcher', caption: 'Split under patient', treatmentId: 'scoop_stretcher', assetPath: EQUIPMENT_ASSET_PATHS.scoopStretcher, tone: '#94a3b8', wide: true },
    { id: 'transport-head-blocks', label: 'Head Blocks', caption: 'Immobilise head after collar', treatmentId: 'head_blocks', assetPath: EQUIPMENT_ASSET_PATHS.headBlocks, tone: '#f97316' },
    { id: 'transport-vacuum', label: 'Vacuum Mattress', caption: 'Spinal transport support', treatmentId: 'vacuum_mattress', assetPath: EQUIPMENT_ASSET_PATHS.vacuumMattress, tone: '#1d4ed8' },
    { id: 'transport-ked', label: 'KED Vest', caption: 'Seated extrication', treatmentId: 'ked', assetPath: EQUIPMENT_ASSET_PATHS.ked, tone: '#eab308' },
    { id: 'transport-collar', label: 'Cervical Collar', caption: 'Sized rigid collar', treatmentId: 'cervical_collar', assetPath: EQUIPMENT_ASSET_PATHS.collar, tone: '#0ea5e9' },
    { id: 'transport-blankets', label: 'Transfer Blankets', caption: 'Warmth and dignity', treatmentId: 'warming_blanket', assetPath: EQUIPMENT_ASSET_PATHS.blanket, tone: '#f59e0b' },
  ],
};

function getProductMiniatureKind(treatment: Treatment): ProductMiniatureKind {
  const id = treatment.id.toLowerCase();
  const text = `${treatment.name} ${treatment.description}`.toLowerCase();
  if (/fluid|saline|hartmann|bolus/.test(id) || /fluid|saline|bolus/.test(text)) return 'fluid';
  if (/iv_access|cannul|access/.test(id) || /iv access|cannula/.test(text)) return 'iv';
  if (/defibrillation|aed|cardioversion|pad/.test(id) || /defib|aed|pad/.test(text)) return 'pads';
  if (/oxygen|nebul|bvm|cpap|ventilat|mask/.test(id) || /oxygen|nebul|bvm|cpap|ventilat|mask/.test(text)) return 'mask';
  if (/intubat|airway|igel|i-gel|lma|suction|opa|npa/.test(id) || /tube|airway|suction|intubat/.test(text)) return 'tube';
  if (treatment.category === 'medication') return 'vial';
  return 'device';
}

function getProductMiniatureAsset(treatment: Treatment, kind: ProductMiniatureKind): string {
  const id = treatment.id.toLowerCase();
  if (id === 'oxygen_nasal') return PRODUCT_ASSET_PATHS.nasal;
  if (id === 'oxygen_nonrebreather') return PRODUCT_ASSET_PATHS.nonrebreather;
  if (id === 'oxygen_mask') return PRODUCT_ASSET_PATHS.simpleMask;
  if (id.includes('nebulizer') || id.includes('nebuliser')) return PRODUCT_ASSET_PATHS.nebulizer;
  if (id === 'bvm_ventilation') return PRODUCT_ASSET_PATHS.bvm;
  if (id === 'cpap_niv') return PRODUCT_ASSET_PATHS.cpap;
  if (id === 'mechanical_ventilation' || id === 'ventilator_setup') return PRODUCT_ASSET_PATHS.ventilator;
  if (id === 'opa_insert') return PRODUCT_ASSET_PATHS.opa;
  if (id.includes('intubation') || id.includes('ett')) return PRODUCT_ASSET_PATHS.etTube;
  if (id === 'iv_access') return PRODUCT_ASSET_PATHS.ivCannula;
  if (id.startsWith('fluids_')) return PRODUCT_ASSET_PATHS.fluidBag;
  if (id === 'defibrillation' || id === 'aed') return PRODUCT_ASSET_PATHS.defibPads;
  if (id === 'lucas_device') return PRODUCT_ASSET_PATHS.lucas;
  if (id === 'sam_splint') return EQUIPMENT_ASSET_PATHS.samSplint;
  if (id === 'box_splint') return EQUIPMENT_ASSET_PATHS.boxSplint;
  if (id === 'vacuum_limb_splint') return EQUIPMENT_ASSET_PATHS.vacuumLimbSplint;
  if (id === 'air_splint') return EQUIPMENT_ASSET_PATHS.airSplint;
  if (id === 'traction_splint') return EQUIPMENT_ASSET_PATHS.tractionSplint;
  if (kind === 'fluid') return PRODUCT_ASSET_PATHS.fluidBag;
  if (kind === 'iv') return PRODUCT_ASSET_PATHS.ivCannula;
  if (kind === 'pads') return PRODUCT_ASSET_PATHS.defibPads;
  if (kind === 'tube') return PRODUCT_ASSET_PATHS.opa;
  if (kind === 'mask') return PRODUCT_ASSET_PATHS.simpleMask;
  return '';
}

function ProductMiniature({
  treatment,
  bag,
  isApplied,
  isBlocked,
}: {
  treatment: Treatment;
  bag: TreatmentJumpBag;
  isApplied: boolean;
  isBlocked: boolean;
}) {
  const kind = getProductMiniatureKind(treatment);
  const assetPath = getProductMiniatureAsset(treatment, kind);
  const label = {
    mask: 'O2',
    iv: 'IV',
    fluid: 'FLD',
    pads: 'AED',
    vial: 'Rx',
    tube: 'AIR',
    device: bag.contentsLabel,
  }[kind];
  const style: CSSProperties = {
    background: `linear-gradient(145deg, ${bag.accentColor}, #ffffff 64%)`,
    borderColor: isBlocked ? 'rgba(245, 158, 11, 0.46)' : `${bag.bagColor}66`,
    boxShadow: isApplied ? `0 0 0 1px ${bag.bagColor}66, 0 12px 22px -18px ${bag.shadowColor}` : undefined,
  };

  return (
    <div
      className={`relative h-14 w-16 shrink-0 overflow-hidden rounded-xl border ${
        isApplied ? 'ring-1 ring-emerald-400/55' : ''
      }`}
      style={style}
      aria-hidden="true"
    >
      <div className="absolute -right-3 -top-3 h-9 w-9 rounded-full opacity-20" style={{ backgroundColor: bag.bagColor }} />
      <div className="absolute inset-1">
        {assetPath ? (
          <img src={assetPath} alt="" className="h-full w-full object-contain" draggable={false} />
        ) : kind === 'vial' ? (
          <>
            <div className="absolute left-5 top-2 h-9 w-5 rotate-[-10deg] rounded-b-md rounded-t-sm border border-blue-500/50 bg-white/85" />
            <div className="absolute left-[22px] top-4 h-3 w-4 rotate-[-10deg] rounded-sm bg-blue-400/25" />
            <div className="absolute right-4 top-6 h-6 w-1.5 rotate-[32deg] rounded-full bg-blue-500/65" />
          </>
        ) : (
          <>
            <div className="absolute left-3 top-4 h-7 w-10 rounded-lg border border-slate-500/35 bg-white/85" />
            <div className="absolute left-5 top-6 h-1 w-6 rounded-full bg-slate-500/55" />
            <div className="absolute left-5 top-9 h-1 w-4 rounded-full bg-slate-500/35" />
          </>
        )}
      </div>
      <span className="absolute bottom-1 right-1 rounded bg-white/88 px-1 text-[7px] font-black leading-3 shadow-sm" style={{ color: bag.bagColor }}>
        {label}
      </span>
    </div>
  );
}

function treatmentBelongsToBag(treatment: Treatment, bag: TreatmentJumpBag): boolean {
  const isTransportTreatment = TRANSPORT_TREATMENT_IDS.includes(treatment.id as (typeof TRANSPORT_TREATMENT_IDS)[number]);
  if (bag.key !== 'transport' && isTransportTreatment) return false;
  if (bag.key === 'transport') return isTransportTreatment;

  return bag.categories.includes(treatment.category)
    || Boolean(bag.treatmentIds?.includes(treatment.id))
    || (bag.key === 'disability' && (
      treatment.description.toLowerCase().includes('seizure')
      || treatment.description.toLowerCase().includes('glucose')
      || treatment.description.toLowerCase().includes('conscious')
    ));
}

function bagStyleVars(bag: TreatmentJumpBag): CSSProperties {
  return {
    '--bag-color': bag.bagColor,
    '--bag-accent': bag.accentColor,
    '--bag-shadow': bag.shadowColor,
  } as CSSProperties;
}

function JumpBagIllustration({
  bag,
  isOpen,
  appliedCount,
}: {
  bag: TreatmentJumpBag;
  isOpen: boolean;
  appliedCount: number;
}) {
  const Icon = bag.Icon;

  return (
    <div
      className={`jump-bag-illustration ${isOpen ? 'jump-bag-open' : ''}`}
      style={bagStyleVars(bag)}
      aria-hidden="true"
    >
      <img src={bag.imagePath} alt="" className="jump-bag-image" draggable={false} />
      <div className="jump-bag-kit-badge">
        <Icon className="h-3.5 w-3.5" />
        <span>{bag.contentsLabel}</span>
      </div>
      {appliedCount > 0 && (
        <div className="jump-bag-count">{appliedCount}</div>
      )}
      <div className="jump-bag-shadow" />
    </div>
  );
}

function EquipmentReplica({
  item,
  bag,
  isApplied,
}: {
  item: EquipmentInventoryItem;
  bag: TreatmentJumpBag;
  isApplied: boolean;
}) {
  const tone = item.tone ?? bag.bagColor;
  const style = {
    '--equipment-color': tone,
    '--equipment-soft': `${tone}22`,
  } as CSSProperties;

  return (
    <div
      className={`equipment-replica ${item.wide ? 'equipment-replica-wide' : ''} ${isApplied ? 'equipment-replica-applied' : ''}`}
      style={style}
      aria-hidden="true"
    >
      {item.assetPath ? (
        <img src={item.assetPath} alt="" className="h-full w-full object-contain" draggable={false} />
      ) : (
        <CssEquipmentArt art={item.art ?? 'case'} />
      )}
    </div>
  );
}

function CssEquipmentArt({ art }: { art: EquipmentArtKind }) {
  switch (art) {
    case 'oxygen-cylinder':
      return (
        <div className="eq-cylinder">
          <span className="eq-cylinder-valve" />
          <span className="eq-cylinder-body" />
          <span className="eq-cylinder-label">O2</span>
        </div>
      );
    case 'suction':
      return (
        <div className="eq-suction">
          <span className="eq-suction-handle" />
          <span className="eq-suction-body" />
          <span className="eq-suction-canister" />
          <span className="eq-suction-tube" />
        </div>
      );
    case 'aed':
      return (
        <div className="eq-aed">
          <span className="eq-aed-screen" />
          <span className="eq-aed-bolt">AED</span>
        </div>
      );
    case 'tourniquet':
      return (
        <div className="eq-tourniquet">
          <span />
          <span />
        </div>
      );
    case 'collar':
      return (
        <div className="eq-collar">
          <span className="eq-collar-shell" />
          <span className="eq-collar-chin" />
        </div>
      );
    case 'splint':
      return (
        <div className="eq-splints">
          <span />
          <span />
          <span />
        </div>
      );
    case 'bandage':
      return (
        <div className="eq-bandage">
          <span />
          <span />
          <span />
        </div>
      );
    case 'blanket':
      return (
        <div className="eq-blanket">
          <span />
          <span />
          <span />
        </div>
      );
    case 'vial':
      return (
        <div className="eq-vials">
          <span />
          <span />
          <span />
        </div>
      );
    case 'syringe':
      return (
        <div className="eq-syringe">
          <span className="eq-syringe-barrel" />
          <span className="eq-syringe-plunger" />
          <span className="eq-syringe-needle" />
        </div>
      );
    case 'tablet':
      return (
        <div className="eq-tablets">
          <span />
          <span />
          <span />
        </div>
      );
    case 'glucose':
      return (
        <div className="eq-glucose">
          <span>GLU</span>
        </div>
      );
    case 'cooling':
      return (
        <div className="eq-cooling">
          <span />
          <span />
        </div>
      );
    case 'position':
      return (
        <div className="eq-position">
          <span />
          <span />
          <span />
        </div>
      );
    case 'case':
    default:
      return (
        <div className="eq-case">
          <span />
          <span />
        </div>
      );
  }
}

function EquipmentInventoryBoard({
  bag,
  items,
  appliedTreatmentIds,
  applyingTreatmentId,
  stagedItemId,
  currentVitals,
  onSelect,
}: {
  bag: TreatmentJumpBag;
  items: EquipmentInventoryItem[];
  appliedTreatmentIds: string[];
  applyingTreatmentId: string | null;
  stagedItemId: string | null;
  currentVitals: VitalSigns | null;
  onSelect: (item: EquipmentInventoryItem) => void;
}) {
  return (
    <div
      className="equipment-board overflow-hidden rounded-xl border p-2.5"
      style={bagStyleVars(bag)}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: bag.bagColor }}>
            {TREATMENT_JUMP_BAGS.findIndex(item => item.key === bag.key) + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-white/90">
              {bag.key === 'airway' ? 'Airway & Oxygen' : bag.label}
            </p>
            <p className="truncate text-[9px] text-cyan-100/70">Open kit inventory · tap equipment to apply</p>
          </div>
        </div>
        <Badge variant="outline" className="h-5 border-white/20 bg-white/10 text-[9px] text-white">
          {items.length} tools
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map(item => {
          const isApplied = Boolean(item.treatmentId && appliedTreatmentIds.includes(item.treatmentId));
          const isApplying = item.treatmentId === applyingTreatmentId;
          const isStaged = item.id === stagedItemId;
          const canApply = Boolean(currentVitals && item.treatmentId && !isApplied);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              disabled={isApplying}
              aria-label={`${isApplied ? 'Connected' : 'Select'} ${item.label}`}
              className={`equipment-tile group relative min-h-[106px] rounded-lg border p-1.5 text-left transition disabled:cursor-wait ${
                isApplied
                  ? 'border-emerald-300/70 bg-emerald-400/15'
                  : isStaged
                    ? 'border-cyan-300/80 bg-cyan-300/15'
                    : 'border-white/10 bg-white/[0.065] hover:border-white/25 hover:bg-white/[0.11]'
              }`}
            >
              <EquipmentReplica item={item} bag={bag} isApplied={isApplied} />
              <div className="mt-2 min-w-0">
                <p className="truncate text-[11px] font-bold text-white">{item.label}</p>
                <p className="line-clamp-2 text-[9px] leading-snug text-cyan-100/70">{item.caption}</p>
              </div>
              <span className={`mt-2 inline-flex h-5 items-center rounded px-1.5 text-[8px] font-bold uppercase tracking-[0.08em] ${
                isApplied
                  ? 'bg-emerald-400/20 text-emerald-100'
                  : isApplying
                    ? 'bg-amber-400/20 text-amber-100'
                    : canApply
                      ? 'bg-white/12 text-white'
                      : 'bg-white/7 text-white/45'
              }`}>
                {isApplied ? 'Connected' : isApplying ? 'Applying' : item.treatmentId ? currentVitals ? 'Apply' : 'Vitals first' : 'Inspect'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TreatmentJumpBagPanelProps {
  currentVitals: VitalSigns | null;
  appliedTreatments: AppliedTreatment[];
  appliedTreatmentIds: string[];
  applyingTreatmentId: string | null;
  patientState: PatientState | null;
  activeManagementTab: ManagementTab;
  setActiveManagementTab: (tab: ManagementTab) => void;
  medSearch: string;
  setMedSearch: (value: string) => void;
  applyTreatment: (treatment: Treatment) => void;
}

export function TreatmentJumpBagPanel({
  currentVitals,
  appliedTreatments,
  appliedTreatmentIds,
  applyingTreatmentId,
  patientState,
  activeManagementTab,
  setActiveManagementTab,
  medSearch,
  setMedSearch,
  applyTreatment,
}: TreatmentJumpBagPanelProps) {
  const [stagedEquipmentId, setStagedEquipmentId] = useState<string | null>(null);
  // Scroll the treatment list into view when a bag opens — students didn't
  // realise the medications live below the bag grid ("you have to scroll down").
  const treatmentPanelRef = useRef<HTMLDivElement>(null);
  const revealTreatments = () => {
    requestAnimationFrame(() => treatmentPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const activeBag = TREATMENT_JUMP_BAGS.find(bag => bag.key === activeManagementTab) ?? TREATMENT_JUMP_BAGS[0];
  const equipmentItems = BAG_EQUIPMENT[activeBag.key] ?? [];
  const stagedEquipment = equipmentItems.find(item => item.id === stagedEquipmentId) ?? null;
  const query = medSearch.trim().toLowerCase();
  const systolic = getSystolicFromBp(currentVitals?.bp);

  const suggestedTreatments = useMemo(() => {
    const ids: string[] = [];
    if (!currentVitals) return [];

    if (patientState?.isInArrest) {
      ids.push('cpr', 'defibrillation', 'iv_access');
    }

    if (currentVitals.spo2 < 90) ids.push('oxygen_nonrebreather');
    else if (currentVitals.spo2 < 94) ids.push('oxygen_mask');

    if (currentVitals.respiration <= 8) ids.push('bvm_ventilation');
    if (currentVitals.respiration >= 26 && currentVitals.spo2 < 94) ids.push('cpap_niv');
    if (systolic < 100 || currentVitals.pulse > 120 || (currentVitals.gcs ?? 15) < 15) ids.push('iv_access');
    if (systolic < 90) ids.push('fluids_250ml');
    if (currentVitals.bloodGlucose !== undefined && currentVitals.bloodGlucose < 4) ids.push('glucose_10g');

    return Array.from(new Set(ids))
      .map(id => TREATMENTS.find(treatment => treatment.id === id))
      .filter((treatment): treatment is Treatment => Boolean(treatment))
      .slice(0, 5);
  }, [currentVitals, patientState?.isInArrest, systolic]);

  const suggestedIds = useMemo(
    () => new Set(suggestedTreatments.map(treatment => treatment.id)),
    [suggestedTreatments],
  );

  // Search is scoped to the OPEN bag first (what the student asked for: "search
  // in the bag I opened"). Only if nothing in the open bag matches do we widen
  // to every bag, so a mistyped-bag search still finds the drug rather than
  // showing nothing. `global` drives the header so the student knows the scope.
  const searchResult = useMemo(() => {
    const matchesQuery = (treatment: Treatment) =>
      treatment.name.toLowerCase().includes(query)
      || treatment.description.toLowerCase().includes(query)
      || treatment.category.toLowerCase().includes(query)
      || treatment.effects.some(effect => String(effect.vitalSign).toLowerCase().includes(query));

    const sortFn = (a: Treatment, b: Treatment) => {
      const aSuggested = suggestedIds.has(a.id) ? 1 : 0;
      const bSuggested = suggestedIds.has(b.id) ? 1 : 0;
      if (aSuggested !== bSuggested) return bSuggested - aSuggested;

      const aApplied = appliedTreatmentIds.includes(a.id) ? 1 : 0;
      const bApplied = appliedTreatmentIds.includes(b.id) ? 1 : 0;
      if (aApplied !== bApplied) return bApplied - aApplied;

      if (query) {
        const aStarts = a.name.toLowerCase().startsWith(query) ? 1 : 0;
        const bStarts = b.name.toLowerCase().startsWith(query) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
      }
      return a.name.localeCompare(b.name);
    };

    if (!query) {
      return { items: TREATMENTS.filter(t => treatmentBelongsToBag(t, activeBag)).sort(sortFn), global: false };
    }
    const inBag = TREATMENTS.filter(t => treatmentBelongsToBag(t, activeBag) && matchesQuery(t));
    if (inBag.length > 0) return { items: inBag.sort(sortFn), global: false };
    return { items: TREATMENTS.filter(matchesQuery).sort(sortFn), global: true };
  }, [activeBag, appliedTreatmentIds, query, suggestedIds]);

  const filteredTreatments = searchResult.items;

  const lastTreatment = appliedTreatments[appliedTreatments.length - 1];
  const lastBag = lastTreatment ? TREATMENT_JUMP_BAGS.find(bag => {
    const treatment = TREATMENTS.find(item => item.id === lastTreatment.id);
    return treatment ? treatmentBelongsToBag(treatment, bag) : false;
  }) : null;

  const reassessmentFocus = lastBag?.key === 'airway' || lastBag?.key === 'breathing'
    ? 'SpO2, respiratory rate, work of breathing'
    : lastBag?.key === 'circulation'
      ? 'BP, pulse, rhythm, perfusion'
      : lastBag?.key === 'disability'
        ? 'GCS, pupils, BGL, seizure activity'
        : lastBag?.key === 'medications'
          ? 'Effect, allergy signs, contraindications'
          : lastBag?.key === 'transport'
            ? 'C-spine, comfort, distal pulses, sensation, transport readiness'
            : 'Temperature, pain, skin, comfort';

  const handleEquipmentSelect = (item: EquipmentInventoryItem) => {
    setStagedEquipmentId(item.id);
    setMedSearch('');

    if (!currentVitals || !item.treatmentId) return;
    if (appliedTreatmentIds.includes(item.treatmentId)) return;

    const treatment = TREATMENTS.find(candidate => candidate.id === item.treatmentId);
    if (treatment) applyTreatment(treatment);
  };

  return (
    <Card className="glass-panel relative overflow-hidden rounded-2xl border shadow-[0_12px_34px_-24px_rgba(15,23,42,0.45)]">
      <style>{`
        .jump-bag-illustration {
          position: relative;
          height: 5.8rem;
          width: min(100%, 8.6rem);
          min-width: 7rem;
          transform: translateY(0);
          transition: transform 220ms ease, filter 220ms ease;
          filter: drop-shadow(0 14px 18px var(--bag-shadow));
        }

        .jump-bag-image {
          position: absolute;
          inset: 0.1rem 0.12rem 0.24rem;
          z-index: 2;
          height: calc(100% - 0.34rem);
          width: calc(100% - 0.24rem);
          object-fit: contain;
          object-position: center;
          transform: scale(1);
          transition: transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .jump-bag-open .jump-bag-image {
          transform: translateY(-0.14rem) scale(1.04);
        }

        .jump-bag-kit-badge {
          position: absolute;
          left: 0.42rem;
          bottom: 0.62rem;
          z-index: 5;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.55);
          background: rgba(15,23,42,0.58);
          color: rgba(255,255,255,0.95);
          padding: 0.18rem 0.42rem;
          font-size: 0.48rem;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          box-shadow: 0 0.5rem 1rem rgba(15,23,42,0.22);
          backdrop-filter: blur(10px);
        }

        .jump-bag-button:hover .jump-bag-illustration,
        .jump-bag-button:focus-visible .jump-bag-illustration {
          transform: translateY(-3px);
        }

        .jump-bag-handle {
          position: absolute;
          left: 50%;
          top: 0.2rem;
          width: 2.65rem;
          height: 1.45rem;
          border: 0.38rem solid color-mix(in srgb, var(--bag-color) 72%, black);
          border-bottom: 0;
          border-radius: 1.1rem 1.1rem 0 0;
          transform: translateX(-50%);
          z-index: 1;
          background: transparent;
        }

        .jump-bag-lid {
          position: absolute;
          left: 0.82rem;
          right: 0.82rem;
          top: 1.18rem;
          height: 1.45rem;
          border-radius: 0.78rem 0.78rem 0.28rem 0.28rem;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0) 48%),
            linear-gradient(135deg, color-mix(in srgb, var(--bag-color) 86%, white), color-mix(in srgb, var(--bag-color) 84%, black));
          border: 1px solid rgba(15, 23, 42, 0.12);
          transform-origin: bottom center;
          transform: rotateX(0deg) translateY(0);
          transition: transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1), top 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
          z-index: 4;
        }

        .jump-bag-open .jump-bag-lid {
          top: 0.8rem;
          transform: rotateX(58deg) translateY(-0.32rem);
        }

        .jump-bag-zipper {
          position: absolute;
          left: 0.9rem;
          right: 0.9rem;
          bottom: 0.34rem;
          height: 0.16rem;
          border-radius: 999px;
          background: repeating-linear-gradient(
            90deg,
            rgba(15,23,42,0.42) 0,
            rgba(15,23,42,0.42) 0.18rem,
            rgba(255,255,255,0.34) 0.18rem,
            rgba(255,255,255,0.34) 0.34rem
          );
          opacity: 0.9;
        }

        .jump-bag-body {
          position: absolute;
          left: 0.44rem;
          right: 0.44rem;
          bottom: 0.56rem;
          height: 3.12rem;
          border-radius: 0.62rem 0.62rem 0.84rem 0.84rem;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 38%),
            linear-gradient(135deg, var(--bag-color), color-mix(in srgb, var(--bag-color) 76%, black));
          border: 1px solid rgba(15, 23, 42, 0.14);
          overflow: hidden;
          z-index: 3;
        }

        .jump-bag-body::before,
        .jump-bag-body::after {
          content: "";
          position: absolute;
          top: 0.55rem;
          bottom: 0.7rem;
          width: 0.28rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.28);
        }

        .jump-bag-body::before { left: 0.76rem; }
        .jump-bag-body::after { right: 0.76rem; }

        .jump-bag-pocket {
          position: absolute;
          left: 50%;
          bottom: 0.52rem;
          width: 3.9rem;
          height: 1.35rem;
          transform: translateX(-50%);
          border-radius: 0.42rem;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.34);
          display: grid;
          place-items: center;
          color: rgba(255,255,255,0.92);
          font-size: 0.47rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .jump-bag-cross {
          position: absolute;
          left: 50%;
          top: 0.48rem;
          width: 1.18rem;
          height: 1.18rem;
          transform: translateX(-50%);
          border-radius: 0.28rem;
          background: var(--bag-accent);
          box-shadow: inset 0 0 0 1px rgba(15,23,42,0.08);
        }

        .jump-bag-cross span {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 999px;
          background: var(--bag-color);
          transform: translate(-50%, -50%);
        }

        .jump-bag-cross span:first-child {
          width: 0.7rem;
          height: 0.2rem;
        }

        .jump-bag-cross span:last-child {
          width: 0.2rem;
          height: 0.7rem;
        }

        .jump-bag-tool {
          position: absolute;
          top: 1.85rem;
          width: 1.7rem;
          height: 1.55rem;
          border-radius: 0.48rem 0.48rem 0.3rem 0.3rem;
          background: var(--bag-accent);
          color: color-mix(in srgb, var(--bag-color) 76%, black);
          border: 1px solid color-mix(in srgb, var(--bag-color) 22%, white);
          display: grid;
          place-items: center;
          opacity: 0;
          transform: translateY(0.8rem) rotate(0deg);
          transition: opacity 260ms ease, transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
          z-index: 2;
          font-size: 0.54rem;
          font-weight: 900;
        }

        .jump-bag-tool-left {
          left: 1.16rem;
        }

        .jump-bag-tool-right {
          right: 1.16rem;
        }

        .jump-bag-open .jump-bag-tool-left {
          opacity: 1;
          transform: translateY(-0.52rem) rotate(-9deg);
        }

        .jump-bag-open .jump-bag-tool-right {
          opacity: 1;
          transform: translateY(-0.6rem) rotate(8deg);
        }

        .jump-bag-count {
          position: absolute;
          right: 0.52rem;
          top: 0.42rem;
          min-width: 1.1rem;
          height: 1.1rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.95);
          color: color-mix(in srgb, var(--bag-color) 72%, black);
          display: grid;
          place-items: center;
          font-size: 0.6rem;
          font-weight: 900;
          box-shadow: 0 0.35rem 0.7rem rgba(15,23,42,0.18);
        }

        .jump-bag-shadow {
          position: absolute;
          left: 1.2rem;
          right: 1.2rem;
          bottom: 0.1rem;
          height: 0.48rem;
          border-radius: 999px;
          background: rgba(15,23,42,0.14);
          filter: blur(6px);
          z-index: 0;
        }

        .jump-bag-open {
          animation: jump-bag-open-pop 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes jump-bag-open-pop {
          0% { transform: translateY(0) scale(1); }
          45% { transform: translateY(-4px) scale(1.03); }
          100% { transform: translateY(0) scale(1); }
        }

        .equipment-board {
          background:
            radial-gradient(circle at 15% 10%, color-mix(in srgb, var(--bag-color) 24%, transparent), transparent 18rem),
            linear-gradient(135deg, rgba(2, 6, 23, 0.94), rgba(15, 23, 42, 0.88));
          border-color: color-mix(in srgb, var(--bag-color) 52%, rgba(255,255,255,0.16));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 22px 54px -38px rgba(2,6,23,0.95);
        }

        .equipment-tile {
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .equipment-replica {
          position: relative;
          height: 3.15rem;
          width: 100%;
          display: grid;
          place-items: center;
          border-radius: 0.55rem;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035)),
            radial-gradient(circle at 50% 100%, var(--equipment-soft), transparent 70%);
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
          transition: border-color 160ms ease, background-color 160ms ease;
        }

        .equipment-replica-wide {
          grid-column: span 1;
        }

        .equipment-replica-applied {
          box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.45), inset 0 1px 0 rgba(255,255,255,0.12);
        }

        .equipment-replica img {
          width: auto;
          max-width: 96%;
          max-height: 3rem;
          object-fit: contain;
          filter: drop-shadow(0 6px 6px rgba(0,0,0,0.2));
        }

        .eq-cylinder,
        .eq-suction,
        .eq-aed,
        .eq-tourniquet,
        .eq-collar,
        .eq-splints,
        .eq-bandage,
        .eq-blanket,
        .eq-vials,
        .eq-syringe,
        .eq-tablets,
        .eq-glucose,
        .eq-cooling,
        .eq-position,
        .eq-case {
          position: relative;
          width: 4.5rem;
          height: 3.55rem;
        }

        .eq-cylinder-body {
          position: absolute;
          left: 1.65rem;
          top: 0.5rem;
          width: 1.22rem;
          height: 2.75rem;
          border-radius: 0.52rem;
          background: linear-gradient(180deg, #34d399, #047857);
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: inset 0 0.25rem 0.4rem rgba(255,255,255,0.2);
        }

        .eq-cylinder-valve {
          position: absolute;
          left: 1.88rem;
          top: 0.18rem;
          width: 0.78rem;
          height: 0.42rem;
          border-radius: 0.18rem;
          background: #d1d5db;
          box-shadow: 0 0 0 1px rgba(15,23,42,0.28);
        }

        .eq-cylinder-label {
          position: absolute;
          left: 1.82rem;
          top: 1.48rem;
          width: 0.9rem;
          border-radius: 999px;
          background: white;
          color: #047857;
          text-align: center;
          font-size: 0.48rem;
          font-weight: 900;
        }

        .eq-suction-handle {
          position: absolute;
          left: 1.3rem;
          top: 0.18rem;
          width: 1.85rem;
          height: 0.8rem;
          border: 0.2rem solid #e5e7eb;
          border-bottom: 0;
          border-radius: 0.75rem 0.75rem 0 0;
        }

        .eq-suction-body {
          position: absolute;
          left: 0.75rem;
          right: 0.72rem;
          top: 0.88rem;
          height: 2.05rem;
          border-radius: 0.48rem;
          background: linear-gradient(135deg, #f8fafc, #94a3b8);
          border: 1px solid rgba(255,255,255,0.5);
        }

        .eq-suction-canister {
          position: absolute;
          right: 0.58rem;
          top: 1.14rem;
          width: 0.86rem;
          height: 1.48rem;
          border-radius: 0.24rem;
          background: linear-gradient(180deg, rgba(14,165,233,0.22), rgba(14,165,233,0.08));
          border: 1px solid rgba(14,165,233,0.42);
        }

        .eq-suction-tube {
          position: absolute;
          left: 0.52rem;
          top: 1.18rem;
          width: 2.52rem;
          height: 1.38rem;
          border-top: 0.18rem solid #0f172a;
          border-radius: 50%;
          transform: rotate(-12deg);
        }

        .eq-aed {
          width: 4rem;
          height: 3rem;
          border-radius: 0.55rem;
          background: linear-gradient(135deg, #facc15, #eab308);
          border: 1px solid rgba(255,255,255,0.36);
          box-shadow: inset 0 0.2rem 0.4rem rgba(255,255,255,0.24);
        }

        .eq-aed-screen {
          position: absolute;
          left: 0.52rem;
          top: 0.52rem;
          width: 1.25rem;
          height: 0.72rem;
          border-radius: 0.18rem;
          background: #0f172a;
        }

        .eq-aed-bolt {
          position: absolute;
          right: 0.62rem;
          bottom: 0.58rem;
          color: white;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.02em;
        }

        .eq-tourniquet span:first-child {
          position: absolute;
          left: 0.35rem;
          right: 0.35rem;
          top: 1.45rem;
          height: 0.48rem;
          border-radius: 999px;
          background: #111827;
          transform: rotate(-9deg);
        }

        .eq-tourniquet span:last-child {
          position: absolute;
          left: 1.85rem;
          top: 1.05rem;
          width: 0.8rem;
          height: 1.1rem;
          border-radius: 0.18rem;
          background: #64748b;
          transform: rotate(-9deg);
        }

        .eq-collar-shell {
          position: absolute;
          left: 0.7rem;
          right: 0.7rem;
          top: 0.76rem;
          height: 1.85rem;
          border-radius: 0.5rem 0.5rem 1.4rem 1.4rem;
          background: linear-gradient(135deg, #e0f2fe, #38bdf8);
          border: 1px solid rgba(255,255,255,0.44);
        }

        .eq-collar-chin {
          position: absolute;
          left: 1.54rem;
          top: 0.5rem;
          width: 1.42rem;
          height: 0.72rem;
          border-radius: 0.3rem;
          background: white;
        }

        .eq-splints span {
          position: absolute;
          top: 0.5rem;
          width: 0.75rem;
          height: 2.7rem;
          border-radius: 0.3rem;
          background: linear-gradient(180deg, color-mix(in srgb, var(--equipment-color) 85%, white), color-mix(in srgb, var(--equipment-color) 78%, black));
          border: 1px solid rgba(255,255,255,0.3);
        }

        .eq-splints span:nth-child(1) { left: 1rem; transform: rotate(-13deg); }
        .eq-splints span:nth-child(2) { left: 1.95rem; transform: rotate(4deg); }
        .eq-splints span:nth-child(3) { left: 2.9rem; transform: rotate(13deg); }

        .eq-bandage span {
          position: absolute;
          top: 1.05rem;
          width: 1.12rem;
          height: 1.12rem;
          border-radius: 999px;
          background: radial-gradient(circle, #cbd5e1 0 26%, white 28% 100%);
          border: 1px solid rgba(15,23,42,0.16);
        }

        .eq-bandage span:nth-child(1) { left: 0.55rem; }
        .eq-bandage span:nth-child(2) { left: 1.72rem; top: 0.8rem; }
        .eq-bandage span:nth-child(3) { left: 2.92rem; }

        .eq-blanket span {
          position: absolute;
          left: 0.75rem;
          right: 0.75rem;
          height: 0.72rem;
          border-radius: 0.2rem;
          background: linear-gradient(90deg, #fde68a, #f59e0b);
          border: 1px solid rgba(255,255,255,0.22);
        }

        .eq-blanket span:nth-child(1) { top: 0.78rem; }
        .eq-blanket span:nth-child(2) { top: 1.48rem; opacity: 0.88; }
        .eq-blanket span:nth-child(3) { top: 2.18rem; opacity: 0.76; }

        .eq-vials span {
          position: absolute;
          bottom: 0.42rem;
          width: 0.72rem;
          height: 2.38rem;
          border-radius: 0.18rem 0.18rem 0.35rem 0.35rem;
          background: linear-gradient(180deg, #f8fafc 0 32%, var(--equipment-color) 34% 100%);
          border: 1px solid rgba(255,255,255,0.36);
        }

        .eq-vials span:nth-child(1) { left: 1rem; transform: rotate(-9deg); }
        .eq-vials span:nth-child(2) { left: 1.92rem; }
        .eq-vials span:nth-child(3) { left: 2.84rem; transform: rotate(9deg); }

        .eq-syringe-barrel {
          position: absolute;
          left: 1.15rem;
          top: 1.52rem;
          width: 2.3rem;
          height: 0.45rem;
          border-radius: 0.16rem;
          background: linear-gradient(90deg, white, #dbeafe);
          border: 1px solid rgba(15,23,42,0.18);
          transform: rotate(-18deg);
        }

        .eq-syringe-plunger {
          position: absolute;
          left: 0.74rem;
          top: 1.83rem;
          width: 0.85rem;
          height: 0.16rem;
          background: #94a3b8;
          transform: rotate(-18deg);
        }

        .eq-syringe-needle {
          position: absolute;
          right: 0.63rem;
          top: 1.18rem;
          width: 0.95rem;
          height: 0.08rem;
          background: #cbd5e1;
          transform: rotate(-18deg);
        }

        .eq-tablets span {
          position: absolute;
          width: 1.05rem;
          height: 0.65rem;
          border-radius: 999px;
          background: linear-gradient(135deg, white, var(--equipment-color));
          border: 1px solid rgba(255,255,255,0.4);
        }

        .eq-tablets span:nth-child(1) { left: 1rem; top: 1.2rem; transform: rotate(-20deg); }
        .eq-tablets span:nth-child(2) { left: 2.08rem; top: 0.92rem; transform: rotate(12deg); }
        .eq-tablets span:nth-child(3) { left: 2.52rem; top: 1.84rem; transform: rotate(-8deg); }

        .eq-glucose {
          width: 3.7rem;
          height: 1.5rem;
          border-radius: 0.32rem 0.8rem 0.8rem 0.32rem;
          background: linear-gradient(135deg, #fde68a, #f97316);
          border: 1px solid rgba(255,255,255,0.36);
          display: grid;
          place-items: center;
          color: white;
          font-size: 0.68rem;
          font-weight: 900;
        }

        .eq-cooling span:first-child {
          position: absolute;
          left: 0.8rem;
          right: 0.8rem;
          top: 0.85rem;
          height: 1.85rem;
          border-radius: 0.36rem;
          background: linear-gradient(135deg, #e0f2fe, #06b6d4);
          border: 1px solid rgba(255,255,255,0.38);
        }

        .eq-cooling span:last-child {
          position: absolute;
          left: 1.84rem;
          top: 1.1rem;
          width: 0.8rem;
          height: 1.3rem;
          background: linear-gradient(90deg, transparent 38%, white 39% 62%, transparent 63%), linear-gradient(0deg, transparent 38%, white 39% 62%, transparent 63%);
        }

        .eq-position span:first-child {
          position: absolute;
          left: 1rem;
          top: 0.82rem;
          width: 0.68rem;
          height: 0.68rem;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .eq-position span:nth-child(2) {
          position: absolute;
          left: 1.35rem;
          top: 1.5rem;
          width: 1.62rem;
          height: 0.58rem;
          border-radius: 999px;
          background: var(--equipment-color);
          transform: rotate(22deg);
        }

        .eq-position span:nth-child(3) {
          position: absolute;
          left: 0.7rem;
          right: 0.7rem;
          bottom: 0.8rem;
          height: 0.3rem;
          border-radius: 999px;
          background: #94a3b8;
        }

        .eq-case {
          width: 3.8rem;
          height: 2.6rem;
          border-radius: 0.48rem;
          background: linear-gradient(135deg, color-mix(in srgb, var(--equipment-color) 86%, white), color-mix(in srgb, var(--equipment-color) 84%, black));
          border: 1px solid rgba(255,255,255,0.3);
        }

        .eq-case span:first-child {
          position: absolute;
          left: 1.32rem;
          top: -0.34rem;
          width: 1.2rem;
          height: 0.7rem;
          border-radius: 0.48rem 0.48rem 0 0;
          border: 0.18rem solid color-mix(in srgb, var(--equipment-color) 74%, black);
          border-bottom: 0;
        }

        .eq-case span:last-child {
          position: absolute;
          left: 1.2rem;
          right: 1.2rem;
          top: 1.14rem;
          height: 0.3rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.75);
        }

        @media (prefers-reduced-motion: reduce) {
          .jump-bag-illustration,
          .jump-bag-lid,
          .jump-bag-tool,
          .jump-bag-open {
            animation: none;
            transition: none;
          }
        }
      `}</style>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-sky-400 via-rose-400 to-blue-400" />
      <CardHeader className="px-3 pb-3 pt-4 sm:px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
            <Ambulance className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/65">Treatment Jump Bag</p>
            <span className="block truncate font-semibold">Select, apply, reassess</span>
          </div>
          <Badge variant="secondary" className="ml-auto text-[9px] sm:text-[10px]">
            {appliedTreatments.length} applied
          </Badge>
        </CardTitle>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
          <div className="glass-control rounded-lg border px-2 py-1.5">
            <p className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground/60">Circulation</p>
            <p className="truncate font-mono font-semibold">{currentVitals ? `${currentVitals.bp} · HR ${currentVitals.pulse}` : 'Pending'}</p>
          </div>
          <div className="glass-control rounded-lg border px-2 py-1.5">
            <p className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground/60">Breathing</p>
            <p className="truncate font-mono font-semibold">{currentVitals ? `SpO2 ${currentVitals.spo2}% · RR ${currentVitals.respiration}` : 'Pending'}</p>
          </div>
          <div className="glass-control rounded-lg border px-2 py-1.5">
            <p className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground/60">Last action</p>
            <p className="truncate font-semibold">{lastTreatment?.name || 'None yet'}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-3 pb-3 sm:px-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={medSearch}
            onChange={event => { setMedSearch(event.target.value); if (event.target.value) revealTreatments(); }}
            placeholder={`Search ${activeBag.shortLabel} bag — e.g. oxygen, adrenaline, IV…`}
            className="glass-control h-10 w-full rounded-lg border border-border pl-8 pr-9 text-xs font-medium outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/15"
          />
          {medSearch && (
            <button
              type="button"
              onClick={() => setMedSearch('')}
              className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear treatment search"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {suggestedTreatments.length > 0 && (
          <div className="glass-panel rounded-xl border border-emerald-500/20 p-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-200">Suggested now</p>
              <span className="text-[9px] text-muted-foreground">based on current vitals</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTreatments.map(treatment => (
                <Button
                  key={treatment.id}
                  size="sm"
                  variant="outline"
                  className="h-7 rounded-md border-emerald-500/25 px-2 text-[10px] font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/25"
                  onClick={() => applyTreatment(treatment)}
                  disabled={applyingTreatmentId === treatment.id}
                >
                  {applyingTreatmentId === treatment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : treatment.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-50/70 px-2.5 py-1.5 text-[10px] font-medium text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
          <Lightbulb className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-300" />
          <span>Your treatments live in these bags — <strong>open a bag or search above</strong>, then the list drops in below to apply.</span>
        </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {TREATMENT_JUMP_BAGS.map(bag => {
            const isActive = activeBag.key === bag.key && !query;
            const treatmentCount = TREATMENTS.filter(treatment => treatmentBelongsToBag(treatment, bag)).length;
            const appliedCount = appliedTreatments.filter(applied => {
              const treatment = TREATMENTS.find(item => item.id === applied.id);
              return treatment ? treatmentBelongsToBag(treatment, bag) : false;
            }).length;

            return (
              <button
                key={bag.key}
                type="button"
                aria-pressed={isActive}
                aria-label={`Open ${bag.label}`}
                title={`Open ${bag.label}`}
                onClick={() => {
                  setActiveManagementTab(bag.key);
                  setMedSearch('');
                  setStagedEquipmentId(null);
                  revealTreatments();
                }}
                className={`jump-bag-button group relative min-h-[164px] overflow-hidden rounded-lg border p-2 text-left transition hover:border-slate-300 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:hover:bg-white/[0.08] ${
                  isActive ? bag.selectedClass : 'glass-control border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className={`absolute inset-x-3 top-2 h-1 rounded-full ${bag.railClass} ${isActive ? 'opacity-100' : 'opacity-35'}`} />
                <div className="flex h-full flex-col items-center justify-between gap-2 pt-2">
                  <JumpBagIllustration bag={bag} isOpen={isActive} appliedCount={appliedCount} />
                  <div className="glass-control w-full rounded-md px-2 py-1.5 ring-1 ring-slate-200/70 dark:ring-slate-800">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-[11px] font-bold">{bag.label}</p>
                      <Badge variant={isActive ? 'default' : 'outline'} className="h-4 rounded px-1 text-[8px]">
                        {isActive ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-muted-foreground">{bag.description}</p>
                    <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/65">
                      {treatmentCount} options
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div ref={treatmentPanelRef} className="glass-panel overflow-hidden rounded-xl border border-slate-200 scroll-mt-2 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {!query
                  ? `${activeBag.shortLabel} treatment panel`
                  : searchResult.global ? 'Search results' : `${activeBag.shortLabel} — search`}
              </p>
              <p className="text-[9px] text-muted-foreground/75">
                {!query
                  ? 'dose, apply, repeat, and monitor effects'
                  : searchResult.global ? `nothing in ${activeBag.shortLabel} — showing all bags` : `matches in this bag`}
              </p>
            </div>
            <Badge variant="outline" className="h-5 text-[9px]">
              {filteredTreatments.length} item{filteredTreatments.length === 1 ? '' : 's'}
            </Badge>
          </div>

          <div className="max-h-[25rem] overflow-y-auto p-2">
            {!currentVitals ? (
              <div className="px-3 py-8 text-center">
                <Gauge className="mx-auto mb-2 h-5 w-5 text-muted-foreground/40" />
                <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                  Assess or reveal vitals to make treatment selection active.
                </p>
              </div>
            ) : filteredTreatments.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <Search className="mx-auto mb-2 h-5 w-5 text-muted-foreground/40" />
                <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                  {query ? `No intervention matches "${medSearch}".` : `No treatments found in ${activeBag.label}.`}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTreatments.map(treatment => {
                  const isApplied = appliedTreatmentIds.includes(treatment.id);
                  const isCurrentlyApplying = applyingTreatmentId === treatment.id;
                  const coreTemp = currentVitals.temperature ?? 37;
                  const needsIV = treatment.requiresIVAccess && !appliedTreatmentIds.includes('iv_access');
                  const hypothermiaBlock = coreTemp < 30 && treatment.category === 'medication';
                  const gateReason = needsIV
                    ? 'Requires IV access first'
                    : hypothermiaBlock
                      ? `Withhold: core temp ${coreTemp}°C`
                      : null;
                  const rowBag = TREATMENT_JUMP_BAGS.find(bag => treatmentBelongsToBag(treatment, bag)) ?? activeBag;

                  return (
                    <div
                      key={treatment.id}
                      className={`grid grid-cols-[1fr_auto] gap-3 rounded-lg border p-3 text-xs transition ${
                        isApplied
                          ? 'border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/15'
                          : gateReason
                            ? 'border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/15'
                            : 'border-slate-200 glass-control hover:border-emerald-400/45 dark:border-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-start gap-2.5">
                          <ProductMiniature
                            treatment={treatment}
                            bag={rowBag}
                            isApplied={isApplied}
                            isBlocked={Boolean(gateReason)}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold leading-tight text-foreground">{treatment.name}</span>
                              <Badge variant="outline" className="h-4 rounded px-1.5 text-[8px]">
                                {rowBag.shortLabel}
                              </Badge>
                              {suggestedIds.has(treatment.id) && (
                                <Badge className="h-4 rounded bg-emerald-600 px-1.5 text-[8px]">Suggested</Badge>
                              )}
                              {isApplied && (
                                <Badge className="h-4 rounded bg-green-600 px-1.5 text-[8px]">Given</Badge>
                              )}
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[9px] text-muted-foreground">
                              <span className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-1.5 py-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {getOnsetDescription(treatment.onset)}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-1.5 py-0.5">
                                <Activity className="h-2.5 w-2.5" />
                                {getTreatmentEffectSummary(treatment)}
                              </span>
                              {treatment.requiresIVAccess && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-1.5 py-0.5 text-cyan-700 dark:text-cyan-300">
                                  <Syringe className="h-2.5 w-2.5" />
                                  IV first
                                </span>
                              )}
                            </div>
                            {gateReason && (
                              <div className="mt-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-[10px] leading-relaxed text-amber-800 dark:text-amber-200">
                                {gateReason}
                              </div>
                            )}
                            <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                              {treatment.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isApplied ? 'outline' : 'default'}
                        className={`h-9 self-center rounded-lg px-3 text-[10px] font-semibold ${
                          !isApplied && !gateReason ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                        }`}
                        onClick={() => applyTreatment(treatment)}
                        disabled={isCurrentlyApplying}
                      >
                        {isCurrentlyApplying ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isApplied ? (
                          <>
                            <RotateCcw className="mr-1 h-2.5 w-2.5" /> Repeat
                          </>
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Physical equipment inventory sits BELOW the treatment list so opening
            a bag surfaces the medications/actions first (no hunting past the
            equipment board). */}
        {!query && (
          <EquipmentInventoryBoard
            bag={activeBag}
            items={equipmentItems}
            appliedTreatmentIds={appliedTreatmentIds}
            applyingTreatmentId={applyingTreatmentId}
            stagedItemId={stagedEquipmentId}
            currentVitals={currentVitals}
            onSelect={handleEquipmentSelect}
          />
        )}

        {stagedEquipment && !query && (
          <div className="glass-control rounded-xl border border-cyan-500/20 px-3 py-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Selected equipment</p>
                <p className="truncate font-semibold">{stagedEquipment.label}</p>
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  {stagedEquipment.treatmentId && appliedTreatmentIds.includes(stagedEquipment.treatmentId)
                    ? 'Connected to the patient model and recorded on the resuscitation card.'
                    : stagedEquipment.treatmentId
                      ? 'Staged for treatment selection once the patient is ready.'
                      : 'Inspected from the bag; no linked patient action yet.'}
                </p>
              </div>
              <Badge variant="outline" className="h-5 shrink-0 text-[9px]">
                {stagedEquipment.treatmentId && appliedTreatmentIds.includes(stagedEquipment.treatmentId) ? 'Connected' : 'Staged'}
              </Badge>
            </div>
          </div>
        )}

        <div className="glass-panel grid gap-2 rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 sm:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Resuscitation card</p>
            </div>
            {appliedTreatments.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-[11px] text-muted-foreground dark:border-slate-700">
                No interventions applied yet. Select the bag that matches your immediate problem.
              </p>
            ) : (
              <div className="space-y-1.5">
                {appliedTreatments.slice(-4).reverse().map((treatment, index) => (
                  <div key={`${treatment.id}-${index}`} className="glass-control flex items-center gap-2 rounded-md px-2 py-1.5">
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                    <span className="min-w-0 flex-1 truncate font-semibold">{treatment.name}</span>
                    {patientState && patientState.treatmentCounts[treatment.id] > 1 && (
                      <Badge variant="outline" className="h-4 text-[9px]">x{patientState.treatmentCounts[treatment.id]}</Badge>
                    )}
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(treatment.appliedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="glass-control rounded-lg p-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Next reassess</p>
            <p className="mt-1 text-[11px] font-semibold leading-relaxed">{reassessmentFocus}</p>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              Recheck after each treatment before stacking more interventions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
