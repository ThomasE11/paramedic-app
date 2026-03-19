/**
 * Severity-Aware Treatment Protocol Engine
 *
 * Provides condition-specific treatment protocols that account for:
 * 1. Severity levels (mild / moderate / severe / life-threatening)
 * 2. Treatment combination synergy (salbutamol + ipratropium > salbutamol alone)
 * 3. Protocol completeness scoring
 * 4. Positioning effects on clinical outcomes
 * 5. Treatment order awareness (e.g., decompress BEFORE oxygenate)
 *
 * This module works alongside clinicalRealism.ts and dynamicTreatmentEngine.ts
 * to produce realistic, clinically accurate patient responses.
 */

import type { VitalSigns } from '@/types';
import type { ClinicalSoundState, BreathSoundType, HeartSoundType } from './clinicalSounds';

// ============================================================================
// TYPES
// ============================================================================

export type ConditionSeverity = 'mild' | 'moderate' | 'severe' | 'life-threatening';

export interface TreatmentProtocol {
  /** Condition identifier (matches subcategory or category) */
  condition: string;
  /** Human-readable condition name */
  conditionName: string;
  /** Severity-specific protocol definitions */
  severityLevels: SeverityProtocol[];
}

export interface SeverityProtocol {
  severity: ConditionSeverity;
  /** Brief clinical description of this severity level */
  description: string;

  /** Vital sign ranges typical for this severity */
  typicalVitals: {
    pulse: [number, number];         // [min, max]
    respiration: [number, number];
    spo2: [number, number];
    bpSystolic: [number, number];
    gcs?: [number, number];
  };

  /** Initial auscultation findings for this severity */
  initialSounds: {
    leftLung: BreathSoundType;
    rightLung: BreathSoundType;
    heartSound: HeartSoundType;
    additionalSounds: string[];
    description: string;
  };

  /** Essential treatments — without these, patient WILL deteriorate */
  essentialTreatments: string[];

  /** Optimal treatments — best-practice full protocol */
  optimalTreatments: string[];

  /** Beneficial but not essential (e.g., reassurance, positioning) */
  beneficialTreatments: string[];

  /** Contraindicated or harmful treatments */
  contraindicatedTreatments: string[];

  /** How fast patient deteriorates without treatment */
  deteriorationRate: 'slow' | 'moderate' | 'fast' | 'rapid';

  /** Treatment combination synergies */
  synergies: TreatmentSynergy[];

  /** Positioning effects */
  positioningEffects: PositioningEffect[];

  /**
   * Maximum improvement achievable (0-100) based on treatment completeness:
   * - Only essential treatments: partialCeiling
   * - Essential + optimal: fullCeiling
   */
  responseCeilings: {
    /** Max improvement % with only basic/essential treatments */
    partialCeiling: number;
    /** Max improvement % with full optimal protocol */
    fullCeiling: number;
    /** Time in seconds to see meaningful response */
    timeToResponse: number;
  };
}

export interface TreatmentSynergy {
  /** Treatment IDs that must ALL be present for synergy */
  treatments: string[];
  /** Multiplier applied when all synergy treatments are present (>1.0 = better) */
  synergyMultiplier: number;
  /** Clinical explanation */
  description: string;
}

export interface PositioningEffect {
  /** Positioning treatment ID */
  positionId: string;
  /** SpO2 improvement from correct positioning */
  spo2Bonus: number;
  /** Respiratory rate improvement */
  rrReduction: number;
  /** Heart rate change */
  hrChange: number;
  /** Additional description shown to student */
  description: string;
}

export interface ProtocolAssessment {
  /** Overall protocol completion (0-100) */
  completionPercent: number;
  /** List of essential treatments given */
  essentialGiven: string[];
  /** List of essential treatments missing */
  essentialMissing: string[];
  /** List of optimal treatments given */
  optimalGiven: string[];
  /** List of optimal treatments missing */
  optimalMissing: string[];
  /** Active synergies */
  activeSynergies: TreatmentSynergy[];
  /** Feedback message */
  feedbackMessage: string;
  /** Treatment response multiplier based on protocol completeness */
  responseMultiplier: number;
  /** Whether positioning is correct */
  correctPositioning: boolean;
}

// ============================================================================
// TREATMENT PROTOCOLS DATABASE
// ============================================================================

export const TREATMENT_PROTOCOLS: TreatmentProtocol[] = [

  // ===========================================================================
  // ASTHMA
  // ===========================================================================
  {
    condition: 'asthma',
    conditionName: 'Acute Asthma',
    severityLevels: [
      {
        severity: 'mild',
        description: 'Mild asthma exacerbation — able to speak in full sentences, mild wheeze, SpO2 >94%',
        typicalVitals: {
          pulse: [80, 100],
          respiration: [18, 22],
          spo2: [94, 97],
          bpSystolic: [110, 140],
        },
        initialSounds: {
          leftLung: 'wheeze',
          rightLung: 'wheeze',
          heartSound: 'normal',
          additionalSounds: ['Mild expiratory wheeze bilaterally'],
          description: 'Bilateral mild expiratory wheeze. Good air entry throughout. Heart sounds normal.',
        },
        essentialTreatments: ['nebulizer_salbutamol', 'oxygen_nasal'],
        optimalTreatments: ['nebulizer_salbutamol', 'oxygen_nasal', 'reassurance', 'fowlers_position'],
        beneficialTreatments: ['reassurance', 'fowlers_position', 'calm_environment'],
        contraindicatedTreatments: [],
        deteriorationRate: 'slow',
        synergies: [
          {
            treatments: ['nebulizer_salbutamol', 'fowlers_position'],
            synergyMultiplier: 1.3,
            description: 'Upright positioning optimizes diaphragm excursion and nebulizer delivery',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 3,
            rrReduction: 2,
            hrChange: -5,
            description: 'Sitting upright improves ventilation and reduces work of breathing',
          },
        ],
        responseCeilings: {
          partialCeiling: 85,
          fullCeiling: 100,
          timeToResponse: 300,
        },
      },
      {
        severity: 'moderate',
        description: 'Moderate asthma — speaking in phrases, using accessory muscles, SpO2 90-94%',
        typicalVitals: {
          pulse: [100, 120],
          respiration: [22, 28],
          spo2: [90, 94],
          bpSystolic: [110, 150],
        },
        initialSounds: {
          leftLung: 'wheeze',
          rightLung: 'wheeze',
          heartSound: 'tachycardic',
          additionalSounds: ['Polyphonic wheeze bilaterally', 'Use of accessory muscles', 'Prolonged expiratory phase'],
          description: 'Significant bilateral wheeze with prolonged expiration. Accessory muscle use. Tachycardic.',
        },
        essentialTreatments: ['nebulizer_salbutamol', 'oxygen_nonrebreather', 'nebulizer_ipratropium'],
        optimalTreatments: ['nebulizer_salbutamol', 'oxygen_nonrebreather', 'nebulizer_ipratropium', 'hydrocortisone_200mg', 'fowlers_position', 'iv_access'],
        beneficialTreatments: ['reassurance', 'fowlers_position', 'iv_access'],
        contraindicatedTreatments: [],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium'],
            synergyMultiplier: 1.5,
            description: 'Combined beta-agonist and anticholinergic provides dual bronchodilation via different mechanisms',
          },
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'hydrocortisone_200mg'],
            synergyMultiplier: 1.8,
            description: 'Triple therapy: bronchodilators + steroid addresses both acute bronchospasm and airway inflammation',
          },
          {
            treatments: ['nebulizer_salbutamol', 'fowlers_position'],
            synergyMultiplier: 1.3,
            description: 'Upright positioning optimizes diaphragm excursion and nebulizer delivery',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 4,
            rrReduction: 3,
            hrChange: -8,
            description: 'Upright position significantly reduces work of breathing in moderate exacerbation',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: -3,
            rrReduction: -2,
            hrChange: 5,
            description: 'Lying flat worsens respiratory distress — diaphragm splinted by abdominal contents',
          },
        ],
        responseCeilings: {
          partialCeiling: 60,
          fullCeiling: 95,
          timeToResponse: 600,
        },
      },
      {
        severity: 'severe',
        description: 'Severe asthma — speaking in single words, exhaustion, SpO2 <90%, tachycardic >120',
        typicalVitals: {
          pulse: [120, 150],
          respiration: [28, 40],
          spo2: [82, 90],
          bpSystolic: [100, 140],
        },
        initialSounds: {
          leftLung: 'diminished',
          rightLung: 'diminished',
          heartSound: 'tachycardic',
          additionalSounds: ['Minimal air entry bilaterally', 'Severe accessory muscle use', 'Unable to complete sentences', 'Tripod positioning'],
          description: 'Severely diminished air entry bilaterally — poor air movement due to critical bronchospasm. Silent zones in lower lobes.',
        },
        essentialTreatments: ['nebulizer_salbutamol', 'oxygen_nonrebreather', 'nebulizer_ipratropium', 'iv_access', 'hydrocortisone_200mg'],
        optimalTreatments: ['nebulizer_salbutamol', 'oxygen_nonrebreather', 'nebulizer_ipratropium', 'iv_access', 'hydrocortisone_200mg', 'adrenaline_im', 'magnesium_2g', 'fowlers_position'],
        beneficialTreatments: ['fowlers_position', 'reassurance', 'bvm_ventilation', 'cpap_niv'],
        contraindicatedTreatments: ['morphine_5mg', 'fentanyl_50mcg', 'supine_position'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium'],
            synergyMultiplier: 1.4,
            description: 'Dual bronchodilation essential in severe bronchospasm',
          },
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'hydrocortisone_200mg'],
            synergyMultiplier: 1.7,
            description: 'Triple therapy with steroid to reduce airway inflammation',
          },
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'hydrocortisone_200mg', 'magnesium_2g'],
            synergyMultiplier: 2.0,
            description: 'Full severe asthma protocol — Mg provides additional smooth muscle relaxation',
          },
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'adrenaline_im'],
            synergyMultiplier: 1.9,
            description: 'Adrenaline provides systemic bronchodilation when inhaled route failing',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 5,
            rrReduction: 4,
            hrChange: -10,
            description: 'Upright position critical — maximizes functional residual capacity',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: -5,
            rrReduction: -4,
            hrChange: 10,
            description: 'DANGEROUS: Lying flat in severe asthma dramatically increases work of breathing and may precipitate arrest',
          },
        ],
        responseCeilings: {
          partialCeiling: 35,
          fullCeiling: 85,
          timeToResponse: 900,
        },
      },
      {
        severity: 'life-threatening',
        description: 'Life-threatening/near-fatal asthma — silent chest, exhaustion, altered consciousness, SpO2 <85%',
        typicalVitals: {
          pulse: [130, 170],
          respiration: [8, 15],  // Paradoxically LOW — exhaustion
          spo2: [70, 85],
          bpSystolic: [80, 110],
          gcs: [9, 13],
        },
        initialSounds: {
          leftLung: 'absent',
          rightLung: 'absent',
          heartSound: 'tachycardic',
          additionalSounds: ['SILENT CHEST — no air movement', 'Exhaustion', 'Altered consciousness', 'Cyanosis', 'Bradycardia may be pre-terminal'],
          description: 'SILENT CHEST — no breath sounds bilaterally despite respiratory effort. This is CRITICAL — represents near-complete airway obstruction.',
        },
        essentialTreatments: ['nebulizer_salbutamol', 'oxygen_nonrebreather', 'nebulizer_ipratropium', 'adrenaline_im', 'iv_access', 'hydrocortisone_200mg', 'magnesium_2g'],
        optimalTreatments: ['nebulizer_salbutamol', 'oxygen_nonrebreather', 'nebulizer_ipratropium', 'adrenaline_im', 'iv_access', 'hydrocortisone_200mg', 'magnesium_2g', 'bvm_ventilation', 'cpap_niv', 'fowlers_position'],
        beneficialTreatments: ['bvm_ventilation', 'cpap_niv', 'intubation', 'fowlers_position'],
        contraindicatedTreatments: ['morphine_5mg', 'fentanyl_50mcg', 'midazolam_5mg', 'supine_position'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'adrenaline_im'],
            synergyMultiplier: 1.8,
            description: 'Maximal bronchodilation from all available routes',
          },
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'adrenaline_im', 'hydrocortisone_200mg', 'magnesium_2g'],
            synergyMultiplier: 2.5,
            description: 'Full life-threatening asthma protocol — every agent contributes to reversal',
          },
          {
            treatments: ['oxygen_nonrebreather', 'bvm_ventilation'],
            synergyMultiplier: 1.6,
            description: 'Assisted ventilation with high-flow O2 when patient tiring',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 3,
            rrReduction: 2,
            hrChange: -5,
            description: 'Upright if conscious — but prepare for intubation',
          },
        ],
        responseCeilings: {
          partialCeiling: 20,
          fullCeiling: 70,
          timeToResponse: 1200,
        },
      },
    ],
  },

  // ===========================================================================
  // COPD EXACERBATION
  // ===========================================================================
  {
    condition: 'copd',
    conditionName: 'COPD Exacerbation',
    severityLevels: [
      {
        severity: 'mild',
        description: 'Mild exacerbation — increased SOB over baseline, productive cough, SpO2 88-92% (their baseline)',
        typicalVitals: {
          pulse: [85, 105],
          respiration: [20, 26],
          spo2: [88, 92],
          bpSystolic: [120, 150],
        },
        initialSounds: {
          leftLung: 'rhonchi',
          rightLung: 'rhonchi',
          heartSound: 'normal',
          additionalSounds: ['Productive cough', 'Barrel chest', 'Pursed lip breathing'],
          description: 'Bilateral rhonchi with poor air entry at bases. Barrel chest noted. Pursed lip breathing.',
        },
        essentialTreatments: ['nebulizer_salbutamol', 'oxygen_nasal'],
        optimalTreatments: ['nebulizer_salbutamol', 'oxygen_nasal', 'nebulizer_ipratropium', 'fowlers_position'],
        beneficialTreatments: ['reassurance', 'fowlers_position'],
        contraindicatedTreatments: [],
        deteriorationRate: 'slow',
        synergies: [
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium'],
            synergyMultiplier: 1.4,
            description: 'Dual bronchodilation — standard COPD exacerbation treatment',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 2,
            rrReduction: 2,
            hrChange: -5,
            description: 'Upright positioning assists ventilation in COPD',
          },
        ],
        responseCeilings: {
          partialCeiling: 70,
          fullCeiling: 92, // COPD patients have lower baseline SpO2
          timeToResponse: 600,
        },
      },
      {
        severity: 'moderate',
        description: 'Moderate exacerbation — increasing dyspnoea, wheezy, using accessory muscles, SpO2 85-88%',
        typicalVitals: {
          pulse: [100, 120],
          respiration: [24, 32],
          spo2: [85, 88],
          bpSystolic: [130, 160],
        },
        initialSounds: {
          leftLung: 'wheeze',
          rightLung: 'rhonchi',
          heartSound: 'tachycardic',
          additionalSounds: ['Mixed wheeze and rhonchi', 'Accessory muscle use', 'Prolonged expiration', 'Pursed lip breathing'],
          description: 'Mixed wheeze and rhonchi bilaterally. Prolonged expiration with accessory muscle use. Poor air entry at bases.',
        },
        essentialTreatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'oxygen_nasal'],
        optimalTreatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'oxygen_nasal', 'hydrocortisone_200mg', 'fowlers_position', 'iv_access'],
        beneficialTreatments: ['reassurance', 'fowlers_position', 'iv_access'],
        contraindicatedTreatments: ['oxygen_nonrebreather'], // Caution: high-flow O2 may suppress hypoxic drive in COPD
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium'],
            synergyMultiplier: 1.5,
            description: 'Dual bronchodilation is standard of care in COPD exacerbation',
          },
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'hydrocortisone_200mg'],
            synergyMultiplier: 1.7,
            description: 'Triple therapy reduces airway inflammation alongside bronchodilation',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 3,
            rrReduction: 3,
            hrChange: -8,
            description: 'Upright positioning significantly improves ventilation in COPD',
          },
        ],
        responseCeilings: {
          partialCeiling: 50,
          fullCeiling: 88, // COPD target SpO2 88-92%
          timeToResponse: 900,
        },
      },
      {
        severity: 'severe',
        description: 'Severe COPD exacerbation — unable to speak, exhaustion, SpO2 <85%, CO2 retention',
        typicalVitals: {
          pulse: [110, 140],
          respiration: [30, 45],
          spo2: [75, 85],
          bpSystolic: [140, 180],
          gcs: [12, 14],
        },
        initialSounds: {
          leftLung: 'diminished',
          rightLung: 'diminished',
          heartSound: 'tachycardic',
          additionalSounds: ['Severely diminished air entry', 'Exhaustion', 'Cyanosis', 'CO2 narcosis risk'],
          description: 'Severely diminished air entry bilaterally with scattered wheeze. Patient tiring. Signs of CO2 retention.',
        },
        essentialTreatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'oxygen_nasal', 'iv_access', 'hydrocortisone_200mg'],
        optimalTreatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'oxygen_nasal', 'iv_access', 'hydrocortisone_200mg', 'cpap_niv', 'fowlers_position'],
        beneficialTreatments: ['cpap_niv', 'fowlers_position', 'reassurance'],
        contraindicatedTreatments: ['oxygen_nonrebreather', 'morphine_5mg', 'fentanyl_50mcg', 'midazolam_5mg'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'hydrocortisone_200mg'],
            synergyMultiplier: 1.6,
            description: 'Full COPD protocol with systemic steroid',
          },
          {
            treatments: ['nebulizer_salbutamol', 'nebulizer_ipratropium', 'cpap_niv'],
            synergyMultiplier: 1.8,
            description: 'NIV provides respiratory support while bronchodilators work',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 4,
            rrReduction: 4,
            hrChange: -10,
            description: 'Upright positioning critical — assists failing respiratory muscles',
          },
        ],
        responseCeilings: {
          partialCeiling: 30,
          fullCeiling: 80,
          timeToResponse: 1200,
        },
      },
      {
        severity: 'life-threatening',
        description: 'Life-threatening COPD — obtunded, respiratory failure, pH <7.25, imminent arrest',
        typicalVitals: {
          pulse: [50, 140], // Can be brady or tachy
          respiration: [6, 12], // Tiring out
          spo2: [60, 75],
          bpSystolic: [80, 130],
          gcs: [6, 11],
        },
        initialSounds: {
          leftLung: 'absent',
          rightLung: 'absent',
          heartSound: 'tachycardic',
          additionalSounds: ['No air movement', 'Obtunded', 'Cyanotic', 'Agonal breathing'],
          description: 'Absent breath sounds — complete respiratory failure. Patient obtunded. Prepare for intubation.',
        },
        // NRB is contraindicated at moderate COPD (hypoxic drive risk) but in life-threatening respiratory failure,
        // aggressive oxygenation takes priority — accept CO2 retention risk to prevent death from hypoxia
        essentialTreatments: ['bvm_ventilation', 'oxygen_nonrebreather', 'iv_access', 'nebulizer_salbutamol', 'nebulizer_ipratropium', 'hydrocortisone_200mg'],
        optimalTreatments: ['bvm_ventilation', 'oxygen_nonrebreather', 'iv_access', 'nebulizer_salbutamol', 'nebulizer_ipratropium', 'hydrocortisone_200mg', 'intubation', 'adrenaline_im'],
        beneficialTreatments: ['intubation', 'cpap_niv', 'adrenaline_im'],
        contraindicatedTreatments: ['morphine_5mg', 'fentanyl_50mcg', 'midazolam_5mg'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['bvm_ventilation', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.5,
            description: 'Assisted ventilation with high-flow O2 to maintain oxygenation',
          },
        ],
        positioningEffects: [],
        responseCeilings: {
          partialCeiling: 15,
          fullCeiling: 60,
          timeToResponse: 1800,
        },
      },
    ],
  },

  // ===========================================================================
  // STEMI / ACS
  // ===========================================================================
  {
    condition: 'stem-anterior',
    conditionName: 'Acute STEMI',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'STEMI — chest pain, diaphoretic, haemodynamically stable',
        typicalVitals: {
          pulse: [90, 120],
          respiration: [18, 24],
          spo2: [93, 97],
          bpSystolic: [100, 150],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Diaphoresis', 'Crushing chest pain', 'Radiating to left arm/jaw'],
          description: 'Clear lungs bilaterally. Tachycardic heart sounds, regular rhythm.',
        },
        essentialTreatments: ['aspirin', 'gtn_spray', 'oxygen_nasal', 'iv_access'],
        optimalTreatments: ['aspirin', 'gtn_spray', 'oxygen_nasal', 'iv_access', 'morphine_5mg', 'reassurance', 'fowlers_position'],
        beneficialTreatments: ['morphine_5mg', 'reassurance', 'fowlers_position', 'ondansetron_4mg'],
        contraindicatedTreatments: [],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['aspirin', 'gtn_spray'],
            synergyMultiplier: 1.4,
            description: 'Aspirin + GTN: antiplatelet reduces clot burden while GTN provides coronary vasodilation and preload reduction',
          },
          {
            treatments: ['aspirin', 'gtn_spray', 'morphine_5mg'],
            synergyMultiplier: 1.6,
            description: 'Aspirin + GTN + morphine: pain relief reduces sympathetic drive and myocardial oxygen demand (morphine only for refractory pain)',
          },
          {
            treatments: ['aspirin', 'gtn_spray', 'morphine_5mg', 'oxygen_nasal'],
            synergyMultiplier: 1.8,
            description: 'Complete ACS protocol: Aspirin, GTN (if SBP > 90), O2 (if SpO2 < 94%), morphine for refractory pain only',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 2,
            rrReduction: 2,
            hrChange: -5,
            description: 'Semi-upright position reduces cardiac workload and improves comfort',
          },
        ],
        responseCeilings: {
          partialCeiling: 50,
          fullCeiling: 85,
          timeToResponse: 300,
        },
      },
      {
        severity: 'severe',
        description: 'STEMI with cardiogenic shock — hypotensive, tachycardic, pulmonary oedema',
        typicalVitals: {
          pulse: [110, 140],
          respiration: [24, 35],
          spo2: [85, 93],
          bpSystolic: [70, 95],
        },
        initialSounds: {
          leftLung: 'crackles-fine',
          rightLung: 'crackles-fine',
          heartSound: 'gallop',
          additionalSounds: ['Bilateral basal crackles', 'S3 gallop', 'JVP elevated', 'Cold peripheries'],
          description: 'Bilateral fine crackles at lung bases — pulmonary oedema. S3 gallop rhythm. Signs of cardiogenic shock.',
        },
        essentialTreatments: ['aspirin', 'oxygen_nonrebreather', 'iv_access'],
        optimalTreatments: ['aspirin', 'oxygen_nonrebreather', 'iv_access', 'morphine_5mg', 'cpap_niv', 'fowlers_position'],
        beneficialTreatments: ['cpap_niv', 'fowlers_position', 'reassurance'],
        contraindicatedTreatments: ['gtn_spray', 'fluids_500ml', 'fluids_1000ml'], // GTN contraindicated in hypotension, fluids worsen pulmonary oedema
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['aspirin', 'oxygen_nonrebreather', 'cpap_niv'],
            synergyMultiplier: 1.5,
            description: 'Aspirin + O2 + CPAP: supports oxygenation while reducing preload',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 4,
            rrReduction: 3,
            hrChange: -5,
            description: 'Upright position reduces venous return and pulmonary congestion',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: -5,
            rrReduction: -4,
            hrChange: 5,
            description: 'DANGEROUS: Lying flat increases pulmonary congestion in cardiogenic shock',
          },
        ],
        responseCeilings: {
          partialCeiling: 30,
          fullCeiling: 65,
          timeToResponse: 600,
        },
      },
    ],
  },

  // ===========================================================================
  // MULTI-TRAUMA / HEMORRHAGIC SHOCK
  // ===========================================================================
  {
    condition: 'multi-trauma',
    conditionName: 'Major Trauma / Hemorrhagic Shock',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Class II hemorrhage — 15-30% blood loss, tachycardic, anxious',
        typicalVitals: {
          pulse: [100, 120],
          respiration: [20, 28],
          spo2: [92, 97],
          bpSystolic: [90, 110],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Tachycardic — compensating', 'Cool peripheries', 'Delayed cap refill'],
          description: 'Clear lungs bilaterally. Tachycardic. Compensated hemorrhagic shock.',
        },
        essentialTreatments: ['bleeding_control', 'oxygen_nonrebreather', 'iv_access', 'fluids_500ml'],
        optimalTreatments: ['bleeding_control', 'oxygen_nonrebreather', 'iv_access', 'fluids_500ml', 'txa_1g', 'splinting', 'warming_blanket'],
        beneficialTreatments: ['txa_1g', 'splinting', 'warming_blanket', 'fentanyl_50mcg'],
        contraindicatedTreatments: [],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['bleeding_control', 'fluids_500ml'],
            synergyMultiplier: 1.5,
            description: 'Haemorrhage control + volume replacement: stops loss while replacing volume',
          },
          {
            treatments: ['bleeding_control', 'fluids_500ml', 'txa_1g'],
            synergyMultiplier: 1.8,
            description: 'Complete hemorrhage protocol: control + replace + anti-fibrinolytic',
          },
          {
            treatments: ['bleeding_control', 'fluids_500ml', 'txa_1g', 'warming_blanket'],
            synergyMultiplier: 2.0,
            description: 'Full trauma resuscitation: hemorrhage control + fluids + TXA + warming prevents lethal triad',
          },
        ],
        positioningEffects: [
          {
            positionId: 'leg_elevation',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: -10,
            description: 'Passive leg raise improves venous return and cardiac output in hypovolaemia',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -5,
            description: 'Supine position appropriate for trauma assessment',
          },
        ],
        responseCeilings: {
          partialCeiling: 45,
          fullCeiling: 85,
          timeToResponse: 300,
        },
      },
      {
        severity: 'severe',
        description: 'Class III-IV hemorrhage — >30% blood loss, hypotensive, confused, rapid deterioration',
        typicalVitals: {
          pulse: [120, 160],
          respiration: [28, 40],
          spo2: [85, 93],
          bpSystolic: [60, 90],
          gcs: [10, 14],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Profound tachycardia', 'Cold, clammy, pale', 'Confused/agitated', 'Thready pulse'],
          description: 'Clear lungs. Severely tachycardic. Decompensated hemorrhagic shock.',
        },
        essentialTreatments: ['bleeding_control', 'tourniquet', 'oxygen_nonrebreather', 'iv_access', 'fluids_1000ml', 'txa_1g'],
        optimalTreatments: ['bleeding_control', 'tourniquet', 'oxygen_nonrebreather', 'iv_access', 'fluids_1000ml', 'txa_1g', 'warming_blanket', 'leg_elevation'],
        beneficialTreatments: ['warming_blanket', 'leg_elevation', 'splinting'],
        contraindicatedTreatments: ['morphine_5mg'], // Avoid in decompensated shock
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['bleeding_control', 'tourniquet', 'fluids_1000ml'],
            synergyMultiplier: 1.6,
            description: 'Aggressive hemorrhage control + large volume resuscitation',
          },
          {
            treatments: ['bleeding_control', 'tourniquet', 'fluids_1000ml', 'txa_1g', 'warming_blanket'],
            synergyMultiplier: 2.2,
            description: 'Full damage control resuscitation: hemorrhage control + volume + TXA + warming prevents lethal triad (hypothermia, coagulopathy, acidosis)',
          },
        ],
        positioningEffects: [
          {
            positionId: 'leg_elevation',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: -15,
            description: 'Passive leg raise provides autotransfusion of ~300ml to central circulation',
          },
        ],
        responseCeilings: {
          partialCeiling: 25,
          fullCeiling: 70,
          timeToResponse: 300,
        },
      },
    ],
  },

  // ===========================================================================
  // SEIZURE / STATUS EPILEPTICUS
  // ===========================================================================
  {
    condition: 'seizure',
    conditionName: 'Seizure / Status Epilepticus',
    severityLevels: [
      {
        severity: 'mild',
        description: 'Single seizure, self-terminating (<5 min), post-ictal recovery',
        typicalVitals: {
          pulse: [90, 120],
          respiration: [16, 24],
          spo2: [90, 96],
          bpSystolic: [120, 160],
          gcs: [10, 14],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Post-ictal confusion', 'Tongue laceration possible'],
          description: 'Clear lungs bilaterally. Tachycardic. Patient post-ictal.',
        },
        essentialTreatments: ['oxygen_nasal', 'recovery_position'],
        optimalTreatments: ['oxygen_nasal', 'recovery_position', 'glucose_10g', 'reassurance'],
        beneficialTreatments: ['reassurance', 'glucose_10g', 'iv_access'],
        contraindicatedTreatments: [],
        deteriorationRate: 'slow',
        synergies: [],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 3,
            rrReduction: 2,
            hrChange: -5,
            description: 'Recovery position protects airway and prevents aspiration in post-ictal state',
          },
        ],
        responseCeilings: {
          partialCeiling: 80,
          fullCeiling: 100,
          timeToResponse: 300,
        },
      },
      {
        severity: 'severe',
        description: 'Status epilepticus — continuous seizure >5 min or multiple seizures without recovery',
        typicalVitals: {
          pulse: [120, 160],
          respiration: [8, 20],
          spo2: [75, 90],
          bpSystolic: [140, 200],
          gcs: [3, 8],
        },
        initialSounds: {
          leftLung: 'snoring',
          rightLung: 'snoring',
          heartSound: 'tachycardic',
          additionalSounds: ['Active tonic-clonic seizure', 'Cyanosis', 'Excessive salivation', 'Incontinence'],
          description: 'Sonorous/snoring respirations during seizure. Tachycardic. Active convulsions.',
        },
        essentialTreatments: ['midazolam_5mg', 'oxygen_nonrebreather', 'airway_open', 'suction', 'iv_access'],
        optimalTreatments: ['midazolam_5mg', 'oxygen_nonrebreather', 'airway_open', 'suction', 'iv_access', 'glucose_10g', 'recovery_position'],
        beneficialTreatments: ['glucose_10g', 'recovery_position', 'dextrose_10'],
        contraindicatedTreatments: [],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['midazolam_5mg', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.4,
            description: 'Benzodiazepine terminates seizure; O2 corrects hypoxia from apnoea during seizure',
          },
          {
            treatments: ['midazolam_5mg', 'oxygen_nonrebreather', 'airway_open', 'suction'],
            synergyMultiplier: 1.7,
            description: 'Full seizure protocol: terminate seizure + maintain airway + clear secretions + oxygenate',
          },
          {
            treatments: ['midazolam_5mg', 'glucose_10g'],
            synergyMultiplier: 1.3,
            description: 'If seizure is hypoglycaemia-driven, glucose correction prevents recurrence',
          },
        ],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 4,
            rrReduction: 2,
            hrChange: -5,
            description: 'Recovery position post-seizure protects airway and allows drainage of secretions',
          },
        ],
        responseCeilings: {
          partialCeiling: 35,
          fullCeiling: 80,
          timeToResponse: 300,
        },
      },
    ],
  },

  // ===========================================================================
  // TENSION PNEUMOTHORAX
  // ===========================================================================
  {
    condition: 'pneumothorax-tension',
    conditionName: 'Tension Pneumothorax',
    severityLevels: [
      {
        severity: 'severe',
        description: 'Tension pneumothorax — absent breath sounds, tracheal deviation, obstructive shock',
        typicalVitals: {
          pulse: [120, 160],
          respiration: [28, 40],
          spo2: [75, 88],
          bpSystolic: [60, 90],
        },
        initialSounds: {
          leftLung: 'absent',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Tracheal deviation to right', 'Distended neck veins', 'Hyper-resonant left chest', 'Subcutaneous emphysema'],
          description: 'ABSENT breath sounds on the left. Clear on the right. Tracheal deviation. JVP elevated.',
        },
        essentialTreatments: ['needle_decompression', 'oxygen_nonrebreather'],
        optimalTreatments: ['needle_decompression', 'oxygen_nonrebreather', 'iv_access', 'fluids_500ml'],
        beneficialTreatments: ['iv_access', 'fluids_500ml', 'reassurance'],
        contraindicatedTreatments: [],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['needle_decompression', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.5,
            description: 'Decompression allows lung re-expansion; O2 then reaches functioning alveoli. Order is critical — decompress FIRST',
          },
          {
            treatments: ['needle_decompression', 'oxygen_nonrebreather', 'fluids_500ml'],
            synergyMultiplier: 2.8,
            description: 'Full tension PTX protocol: decompress + oxygenate + volume replace (obstructive shock often coexists with hypovolaemia in trauma)',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 2,
            rrReduction: 2,
            hrChange: -5,
            description: 'Semi-upright may improve ventilation pre-decompression',
          },
        ],
        responseCeilings: {
          partialCeiling: 15, // Almost nothing works without decompression
          fullCeiling: 90,
          timeToResponse: 60, // Needle decompression is dramatic and immediate
        },
      },
    ],
  },

  // ===========================================================================
  // STROKE (CVA)
  // ===========================================================================
  {
    condition: 'stroke',
    conditionName: 'Acute Stroke',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Acute stroke — unilateral weakness, speech disturbance, FAST positive',
        typicalVitals: {
          pulse: [80, 110],
          respiration: [14, 22],
          spo2: [94, 98],
          bpSystolic: [150, 200],
          gcs: [12, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'normal',
          additionalSounds: ['Slurred speech', 'Facial droop', 'Arm drift'],
          description: 'Clear lungs bilaterally. Normal heart sounds. Neurological deficits present.',
        },
        essentialTreatments: ['oxygen_nasal', 'iv_access'],
        optimalTreatments: ['oxygen_nasal', 'iv_access', 'reassurance', 'supine_position'],
        beneficialTreatments: ['reassurance', 'glucose_10g'], // Check for hypoglycaemic mimic
        contraindicatedTreatments: ['gtn_spray', 'aspirin'], // Do NOT give aspirin pre-CT
        deteriorationRate: 'moderate',
        synergies: [],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: 0,
            description: 'Supine with head at 30 degrees — optimizes cerebral perfusion pressure',
          },
          {
            positionId: 'fowlers_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: 0,
            description: 'Head elevation to 30 degrees acceptable if maintaining perfusion',
          },
        ],
        responseCeilings: {
          partialCeiling: 50,
          fullCeiling: 70, // Stroke management is time-critical — hospital is the treatment
          timeToResponse: 600,
        },
      },
      {
        severity: 'severe',
        description: 'Severe stroke — altered consciousness, GCS <12, airway compromise risk',
        typicalVitals: {
          pulse: [60, 100],
          respiration: [10, 22],
          spo2: [88, 95],
          bpSystolic: [160, 220],
          gcs: [6, 11],
        },
        initialSounds: {
          leftLung: 'snoring',
          rightLung: 'snoring',
          heartSound: 'normal',
          additionalSounds: ['Sonorous breathing', 'Reduced consciousness', 'Possible aspiration risk'],
          description: 'Snoring respirations — partial airway obstruction from reduced consciousness. Maintain airway.',
        },
        essentialTreatments: ['airway_open', 'oxygen_nonrebreather', 'suction', 'iv_access'],
        optimalTreatments: ['airway_open', 'oxygen_nonrebreather', 'suction', 'iv_access', 'opa_insert', 'recovery_position'],
        beneficialTreatments: ['opa_insert', 'recovery_position', 'glucose_10g'],
        contraindicatedTreatments: ['gtn_spray', 'aspirin', 'morphine_5mg'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['airway_open', 'suction', 'opa_insert'],
            synergyMultiplier: 1.6,
            description: 'Comprehensive airway management prevents aspiration and maintains oxygenation',
          },
        ],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 4,
            rrReduction: 2,
            hrChange: -3,
            description: 'Recovery position protects airway in obtunded stroke patient',
          },
        ],
        responseCeilings: {
          partialCeiling: 40,
          fullCeiling: 60,
          timeToResponse: 300,
        },
      },
    ],
  },

  // ===========================================================================
  // HYPOGLYCAEMIA
  // ===========================================================================
  {
    condition: 'hypoglycemia',
    conditionName: 'Hypoglycaemia',
    severityLevels: [
      {
        severity: 'mild',
        description: 'Mild hypoglycaemia — conscious, tremor, sweaty, BGL 2.5-3.5 mmol/L',
        typicalVitals: {
          pulse: [90, 110],
          respiration: [14, 20],
          spo2: [96, 99],
          bpSystolic: [110, 140],
          gcs: [14, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Tremulous', 'Diaphoretic', 'Anxious'],
          description: 'Clear lungs bilaterally. Mildly tachycardic. Patient tremulous and sweaty.',
        },
        essentialTreatments: ['glucose_10g'],
        optimalTreatments: ['glucose_10g', 'reassurance'],
        beneficialTreatments: ['reassurance', 'iv_access'],
        contraindicatedTreatments: [],
        deteriorationRate: 'slow',
        synergies: [],
        positioningEffects: [],
        responseCeilings: {
          partialCeiling: 90,
          fullCeiling: 100,
          timeToResponse: 300,
        },
      },
      {
        severity: 'severe',
        description: 'Severe hypoglycaemia — unconscious, seizure risk, BGL <2.0 mmol/L',
        typicalVitals: {
          pulse: [100, 130],
          respiration: [12, 22],
          spo2: [92, 97],
          bpSystolic: [100, 140],
          gcs: [3, 9],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Unconscious', 'Seizure risk', 'Profuse diaphoresis'],
          description: 'Clear lungs. Tachycardic. Patient unconscious — check blood glucose immediately.',
        },
        essentialTreatments: ['glucagon_1mg', 'iv_access', 'dextrose_10', 'airway_open'],
        optimalTreatments: ['glucagon_1mg', 'iv_access', 'dextrose_10', 'airway_open', 'oxygen_nasal', 'recovery_position'],
        beneficialTreatments: ['oxygen_nasal', 'recovery_position'],
        contraindicatedTreatments: ['glucose_10g'], // Oral glucose in unconscious = aspiration risk
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['glucagon_1mg', 'dextrose_10'],
            synergyMultiplier: 1.8,
            description: 'IM glucagon for rapid response + IV dextrose for sustained correction',
          },
        ],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 2,
            rrReduction: 1,
            hrChange: -3,
            description: 'Recovery position protects airway in unconscious hypoglycaemic patient',
          },
        ],
        responseCeilings: {
          partialCeiling: 40,
          fullCeiling: 95,
          timeToResponse: 300,
        },
      },
    ],
  },

  // ===========================================================================
  // CARDIAC ARREST (VF/pVT)
  // ===========================================================================
  {
    condition: 'cardiac-arrest',
    conditionName: 'Cardiac Arrest (Shockable Rhythm)',
    severityLevels: [
      {
        severity: 'life-threatening',
        description: 'Cardiac arrest — VF/pVT, no pulse, no output',
        typicalVitals: {
          pulse: [0, 0],
          respiration: [0, 4],
          spo2: [0, 60],
          bpSystolic: [0, 0],
          gcs: [3, 3],
        },
        initialSounds: {
          leftLung: 'absent',
          rightLung: 'absent',
          heartSound: 'absent',
          additionalSounds: ['No pulse palpable', 'Agonal gasps may be present', 'Cyanosis'],
          description: 'No breath sounds. No heart sounds. Cardiac arrest.',
        },
        essentialTreatments: ['cpr', 'defibrillation', 'adrenaline_1mg', 'airway_open', 'bvm_ventilation'],
        optimalTreatments: ['cpr', 'defibrillation', 'adrenaline_1mg', 'airway_open', 'bvm_ventilation', 'iv_access', 'amiodarone_300mg', 'oxygen_nonrebreather'],
        beneficialTreatments: ['iv_access', 'amiodarone_300mg', 'intubation'],
        contraindicatedTreatments: [],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['cpr', 'defibrillation'],
            synergyMultiplier: 1.8,
            description: 'CPR maintains coronary perfusion between shocks — crucial for defibrillation success',
          },
          {
            treatments: ['cpr', 'defibrillation', 'adrenaline_1mg'],
            synergyMultiplier: 2.0,
            description: 'ALS protocol: CPR + defib + adrenaline maximizes ROSC probability',
          },
          {
            treatments: ['cpr', 'defibrillation', 'adrenaline_1mg', 'amiodarone_300mg'],
            synergyMultiplier: 2.3,
            description: 'Full ALS shockable protocol with amiodarone for refractory VF',
          },
          {
            treatments: ['cpr', 'bvm_ventilation', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.5,
            description: 'Effective ventilation during CPR with high-flow O2',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: 0,
            description: 'Patient must be supine on hard surface for effective CPR',
          },
        ],
        responseCeilings: {
          partialCeiling: 15,
          fullCeiling: 75, // Cardiac arrest has inherently limited success
          timeToResponse: 120,
        },
      },
    ],
  },

  // ===========================================================================
  // ANAPHYLAXIS (bonus — commonly tested)
  // ===========================================================================
  {
    condition: 'anaphylaxis',
    conditionName: 'Anaphylaxis',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Anaphylaxis — urticaria, facial swelling, wheeze, stable haemodynamics',
        typicalVitals: {
          pulse: [100, 120],
          respiration: [20, 28],
          spo2: [90, 96],
          bpSystolic: [90, 120],
        },
        initialSounds: {
          leftLung: 'wheeze',
          rightLung: 'wheeze',
          heartSound: 'tachycardic',
          additionalSounds: ['Urticaria', 'Facial/lip swelling', 'Wheezy', 'Feeling of throat closing'],
          description: 'Bilateral wheeze with upper airway oedema. Tachycardic. Urticarial rash visible.',
        },
        essentialTreatments: ['adrenaline_im', 'oxygen_nonrebreather'],
        optimalTreatments: ['adrenaline_im', 'oxygen_nonrebreather', 'iv_access', 'fluids_500ml', 'hydrocortisone_200mg', 'nebulizer_salbutamol'],
        beneficialTreatments: ['nebulizer_salbutamol', 'hydrocortisone_200mg', 'ondansetron_4mg'],
        contraindicatedTreatments: [],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['adrenaline_im', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.5,
            description: 'Adrenaline reverses bronchospasm and oedema while O2 maintains saturation',
          },
          {
            treatments: ['adrenaline_im', 'oxygen_nonrebreather', 'fluids_500ml'],
            synergyMultiplier: 1.8,
            description: 'Adrenaline + O2 + fluids: addresses bronchospasm, oedema, and distributive shock',
          },
          {
            treatments: ['adrenaline_im', 'oxygen_nonrebreather', 'fluids_500ml', 'hydrocortisone_200mg'],
            synergyMultiplier: 2.2,
            description: 'Full anaphylaxis protocol: adrenaline + O2 + fluids + steroid',
          },
          {
            treatments: ['adrenaline_im', 'nebulizer_salbutamol'],
            synergyMultiplier: 1.4,
            description: 'Dual bronchodilation in anaphylaxis with significant wheeze',
          },
        ],
        positioningEffects: [
          {
            positionId: 'leg_elevation',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -10,
            description: 'Leg elevation helps maintain venous return in distributive shock',
          },
          {
            positionId: 'fowlers_position',
            spo2Bonus: 3,
            rrReduction: 2,
            hrChange: 0,
            description: 'Upright if significant airway compromise — aids breathing',
          },
        ],
        responseCeilings: {
          partialCeiling: 40,
          fullCeiling: 90,
          timeToResponse: 180,
        },
      },
      {
        severity: 'life-threatening',
        description: 'Severe anaphylaxis — stridor, cardiovascular collapse, impending arrest',
        typicalVitals: {
          pulse: [130, 170],
          respiration: [30, 45],
          spo2: [70, 88],
          bpSystolic: [50, 80],
          gcs: [10, 14],
        },
        initialSounds: {
          leftLung: 'stridor',
          rightLung: 'stridor',
          heartSound: 'tachycardic',
          additionalSounds: ['Severe stridor', 'Massive angioedema', 'Near-complete airway obstruction', 'Cardiovascular collapse'],
          description: 'Inspiratory stridor — severe upper airway obstruction from angioedema. Cardiovascular collapse.',
        },
        essentialTreatments: ['adrenaline_im', 'oxygen_nonrebreather', 'iv_access', 'fluids_1000ml'],
        optimalTreatments: ['adrenaline_im', 'oxygen_nonrebreather', 'iv_access', 'fluids_1000ml', 'hydrocortisone_200mg', 'nebulizer_salbutamol', 'airway_open'],
        beneficialTreatments: ['hydrocortisone_200mg', 'nebulizer_salbutamol', 'airway_open', 'bvm_ventilation', 'intubation'],
        contraindicatedTreatments: [],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['adrenaline_im', 'fluids_1000ml'],
            synergyMultiplier: 1.8,
            description: 'Adrenaline + aggressive fluids: addresses vasodilation and capillary leak',
          },
          {
            treatments: ['adrenaline_im', 'fluids_1000ml', 'oxygen_nonrebreather', 'hydrocortisone_200mg'],
            synergyMultiplier: 2.5,
            description: 'Full severe anaphylaxis protocol — every second counts',
          },
        ],
        positioningEffects: [
          {
            positionId: 'leg_elevation',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -15,
            description: 'Passive leg raise for cardiovascular support — critical in anaphylactic shock',
          },
        ],
        responseCeilings: {
          partialCeiling: 20,
          fullCeiling: 75,
          timeToResponse: 120,
        },
      },
    ],
  },

  // ============================================================================
  // ATRIAL FIBRILLATION
  // ============================================================================
  {
    condition: 'afib',
    conditionName: 'Atrial Fibrillation with Rapid Ventricular Response',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'AF with RVR — hemodynamically stable, rate >120, symptomatic (palpitations, dyspnoea)',
        typicalVitals: {
          pulse: [120, 170],
          respiration: [16, 24],
          spo2: [94, 98],
          bpSystolic: [100, 150],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'irregular',
          additionalSounds: ['Irregularly irregular pulse', 'Palpitations', 'Mild dyspnoea'],
          description: 'Clear lungs bilaterally. Irregularly irregular heart sounds at rapid rate.',
        },
        essentialTreatments: ['iv_access', 'oxygen_nasal', 'reassurance'],
        optimalTreatments: ['iv_access', 'oxygen_nasal', 'reassurance', 'fowlers_position'],
        beneficialTreatments: ['fowlers_position', 'reassurance'],
        contraindicatedTreatments: ['adenosine_6mg'], // Adenosine is for SVT not AF
        deteriorationRate: 'slow',
        synergies: [
          {
            treatments: ['iv_access', 'oxygen_nasal'],
            synergyMultiplier: 1.3,
            description: 'IV access + supplemental O2: Prepared for rate control, maintaining oxygenation during rapid rate',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 1,
            description: 'Semi-upright position reduces venous return and cardiac workload',
          },
        ],
        responseCeilings: {
          partialCeiling: 50,
          fullCeiling: 75,
          timeToResponse: 600,
        },
      },
      {
        severity: 'severe',
        description: 'AF with RVR — hemodynamically unstable, hypotensive, signs of heart failure, rate >150',
        typicalVitals: {
          pulse: [150, 200],
          respiration: [22, 32],
          spo2: [88, 94],
          bpSystolic: [80, 100],
        },
        initialSounds: {
          leftLung: 'crackles-fine',
          rightLung: 'crackles-fine',
          heartSound: 'irregular',
          additionalSounds: ['Hypotension', 'Acute pulmonary oedema', 'Altered consciousness', 'Chest pain'],
          description: 'Bilateral basal crackles. Irregularly irregular, very rapid. Signs of cardiac failure.',
        },
        essentialTreatments: ['iv_access', 'oxygen_nonrebreather', 'fowlers_position'],
        optimalTreatments: ['iv_access', 'oxygen_nonrebreather', 'amiodarone_300mg', 'fowlers_position'],
        beneficialTreatments: ['amiodarone_300mg', 'cpap_niv'],
        contraindicatedTreatments: ['adenosine_6mg', 'gtn_spray'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['iv_access', 'amiodarone_300mg'],
            synergyMultiplier: 1.5,
            description: 'IV amiodarone for pharmacological rate/rhythm control in unstable AF',
          },
          {
            treatments: ['iv_access', 'amiodarone_300mg', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.7,
            description: 'Full unstable AF protocol: IV access, amiodarone, high-flow O2',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 3,
            description: 'Upright positioning reduces pulmonary congestion and improves oxygenation',
          },
        ],
        responseCeilings: {
          partialCeiling: 30,
          fullCeiling: 65,
          timeToResponse: 900,
        },
      },
    ],
  },

  // ============================================================================
  // HYPERTENSIVE EMERGENCY
  // ============================================================================
  {
    condition: 'hypertensive-emergency',
    conditionName: 'Hypertensive Emergency',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Hypertensive emergency — SBP >180 with end-organ symptoms (headache, visual changes, chest pain)',
        typicalVitals: {
          pulse: [80, 110],
          respiration: [16, 22],
          spo2: [95, 99],
          bpSystolic: [180, 220],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'normal',
          additionalSounds: ['Severe headache', 'Visual disturbance', 'Nausea', 'Bounding pulse'],
          description: 'Clear lungs bilaterally. Normal heart sounds. Bounding, regular pulse.',
        },
        essentialTreatments: ['iv_access', 'reassurance'],
        optimalTreatments: ['iv_access', 'reassurance', 'fowlers_position'],
        beneficialTreatments: ['fowlers_position', 'oxygen_nasal'],
        contraindicatedTreatments: ['gtn_spray', 'aspirin'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['iv_access', 'reassurance'],
            synergyMultiplier: 1.3,
            description: 'IV access for antihypertensive therapy + reassurance to reduce sympathetic drive',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 1,
            description: 'Semi-upright to reduce intracranial pressure and improve cerebral perfusion',
          },
        ],
        responseCeilings: {
          partialCeiling: 40,
          fullCeiling: 70,
          timeToResponse: 900,
        },
      },
      {
        severity: 'severe',
        description: 'Hypertensive emergency — SBP >220, encephalopathy, seizures, papilledema, aortic dissection risk',
        typicalVitals: {
          pulse: [90, 120],
          respiration: [20, 28],
          spo2: [92, 97],
          bpSystolic: [220, 280],
        },
        initialSounds: {
          leftLung: 'crackles-fine',
          rightLung: 'crackles-fine',
          heartSound: 'normal',
          additionalSounds: ['Altered consciousness', 'Seizures', 'Papilledema', 'Pulmonary oedema'],
          description: 'Bilateral fine crackles (pulmonary oedema). Regular but bounding pulse.',
        },
        essentialTreatments: ['iv_access', 'oxygen_nonrebreather', 'fowlers_position'],
        optimalTreatments: ['iv_access', 'oxygen_nonrebreather', 'fowlers_position', 'midazolam_5mg'],
        beneficialTreatments: ['midazolam_5mg', 'cpap_niv'],
        contraindicatedTreatments: ['gtn_spray', 'aspirin', 'morphine_5mg'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['iv_access', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.4,
            description: 'IV access + high-flow O2: Stabilize while preparing for antihypertensive infusion in ED',
          },
          {
            treatments: ['iv_access', 'midazolam_5mg'],
            synergyMultiplier: 1.5,
            description: 'IV midazolam for seizure control in hypertensive encephalopathy',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 3,
            description: 'Upright positioning reduces intracranial pressure and pulmonary congestion',
          },
        ],
        responseCeilings: {
          partialCeiling: 25,
          fullCeiling: 60,
          timeToResponse: 600,
        },
      },
    ],
  },
];

// ============================================================================
// PROTOCOL LOOKUP & ASSESSMENT FUNCTIONS
// ============================================================================

/**
 * Find the treatment protocol for a given condition (matches subcategory or category)
 */
export function findProtocol(subcategory: string, category?: string): TreatmentProtocol | null {
  const sub = (subcategory || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Direct match on condition
  let protocol = TREATMENT_PROTOCOLS.find(p => p.condition === sub);
  if (protocol) return protocol;

  // Partial match on subcategory
  protocol = TREATMENT_PROTOCOLS.find(p => sub.includes(p.condition) || p.condition.includes(sub));
  if (protocol) return protocol;

  // Match on category
  if (cat.includes('cardiac') && sub.includes('arrest')) {
    return TREATMENT_PROTOCOLS.find(p => p.condition === 'cardiac-arrest') || null;
  }
  if (cat.includes('cardiac') && (sub.includes('stem') || sub.includes('nstemi') || sub.includes('acs'))) {
    return TREATMENT_PROTOCOLS.find(p => p.condition === 'stem-anterior') || null;
  }

  return null;
}

/**
 * Determine the severity level for a case based on its initial vitals
 */
export function determineSeverityFromVitals(
  protocol: TreatmentProtocol,
  vitals: VitalSigns
): SeverityProtocol {
  // Score each severity level by how well vitals match
  let bestMatch: SeverityProtocol = protocol.severityLevels[0];
  let bestScore = -Infinity;

  for (const level of protocol.severityLevels) {
    let score = 0;
    const tv = level.typicalVitals;

    // Score pulse
    if (vitals.pulse >= tv.pulse[0] && vitals.pulse <= tv.pulse[1]) score += 2;
    else if (Math.abs(vitals.pulse - (tv.pulse[0] + tv.pulse[1]) / 2) < 20) score += 1;

    // Score SpO2
    if (vitals.spo2 >= tv.spo2[0] && vitals.spo2 <= tv.spo2[1]) score += 3; // SpO2 is a strong discriminator
    else if (Math.abs(vitals.spo2 - (tv.spo2[0] + tv.spo2[1]) / 2) < 5) score += 1;

    // Score RR
    if (vitals.respiration >= tv.respiration[0] && vitals.respiration <= tv.respiration[1]) score += 2;
    else if (Math.abs(vitals.respiration - (tv.respiration[0] + tv.respiration[1]) / 2) < 5) score += 1;

    // Score BP
    const bpSys = parseInt(String(vitals.bp).split('/')[0]) || 120;
    if (bpSys >= tv.bpSystolic[0] && bpSys <= tv.bpSystolic[1]) score += 2;
    else if (Math.abs(bpSys - (tv.bpSystolic[0] + tv.bpSystolic[1]) / 2) < 20) score += 1;

    // Score GCS if available
    if (tv.gcs && vitals.gcs !== undefined) {
      if (vitals.gcs >= tv.gcs[0] && vitals.gcs <= tv.gcs[1]) score += 3;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = level;
    }
  }

  return bestMatch;
}

/**
 * Assess how well the student is following the treatment protocol
 */
export function assessProtocolCompliance(
  protocol: SeverityProtocol,
  appliedTreatmentIds: string[],
): ProtocolAssessment {
  const appliedSet = new Set(appliedTreatmentIds);

  const essentialGiven = protocol.essentialTreatments.filter(t => appliedSet.has(t));
  const essentialMissing = protocol.essentialTreatments.filter(t => !appliedSet.has(t));
  const optimalGiven = protocol.optimalTreatments.filter(t => appliedSet.has(t));
  const optimalMissing = protocol.optimalTreatments.filter(t => !appliedSet.has(t));

  // Check for contraindicated treatments
  const contraindicatedGiven = protocol.contraindicatedTreatments.filter(t => appliedSet.has(t));

  // Calculate completion percentage
  const essentialWeight = 0.7;
  const optimalWeight = 0.3;
  const essentialPercent = protocol.essentialTreatments.length > 0
    ? essentialGiven.length / protocol.essentialTreatments.length
    : 1;
  const optimalPercent = protocol.optimalTreatments.length > 0
    ? optimalGiven.length / protocol.optimalTreatments.length
    : 1;
  let completionPercent = Math.round((essentialPercent * essentialWeight + optimalPercent * optimalWeight) * 100);

  // Penalty for contraindicated treatments
  if (contraindicatedGiven.length > 0) {
    completionPercent = Math.max(0, completionPercent - contraindicatedGiven.length * 15);
  }

  // Find active synergies
  const activeSynergies = protocol.synergies.filter(synergy =>
    synergy.treatments.every(t => appliedSet.has(t))
  );

  // Calculate response multiplier
  let responseMultiplier = essentialPercent;
  // Apply synergy bonuses
  if (activeSynergies.length > 0) {
    const bestSynergy = activeSynergies.reduce((best, s) =>
      s.synergyMultiplier > best.synergyMultiplier ? s : best, activeSynergies[0]);
    responseMultiplier *= bestSynergy.synergyMultiplier;
  }
  // Cap at reasonable range
  responseMultiplier = Math.min(2.5, Math.max(0.1, responseMultiplier));

  // Check positioning
  const correctPositioning = protocol.positioningEffects.some(p =>
    p.spo2Bonus > 0 && appliedSet.has(p.positionId)
  );

  // Generate feedback
  let feedbackMessage: string;
  if (contraindicatedGiven.length > 0) {
    feedbackMessage = `WARNING: Contraindicated treatment(s) given. ${contraindicatedGiven.join(', ')} should NOT be used in this condition.`;
  } else if (essentialMissing.length === 0 && activeSynergies.length > 0) {
    feedbackMessage = `Excellent protocol compliance. All essential treatments given. ${activeSynergies.length} treatment synergies active.`;
  } else if (essentialMissing.length === 0) {
    feedbackMessage = 'Good — all essential treatments given. Consider additional optimal treatments for best outcome.';
  } else if (essentialGiven.length > 0) {
    feedbackMessage = `Partial treatment. Missing essential: ${essentialMissing.length} treatment(s). Patient response limited.`;
  } else {
    feedbackMessage = 'No essential treatments given yet. Patient will continue to deteriorate.';
  }

  return {
    completionPercent,
    essentialGiven,
    essentialMissing,
    optimalGiven,
    optimalMissing,
    activeSynergies,
    feedbackMessage,
    responseMultiplier,
    correctPositioning,
  };
}

/**
 * Get the combined synergy multiplier for the currently applied treatments
 */
export function getSynergyMultiplier(
  protocol: SeverityProtocol,
  appliedTreatmentIds: string[],
): { multiplier: number; activeSynergies: TreatmentSynergy[] } {
  const appliedSet = new Set(appliedTreatmentIds);

  const activeSynergies = protocol.synergies.filter(synergy =>
    synergy.treatments.every(t => appliedSet.has(t))
  );

  if (activeSynergies.length === 0) {
    return { multiplier: 1.0, activeSynergies: [] };
  }

  // Use the strongest active synergy
  const best = activeSynergies.reduce((max, s) =>
    s.synergyMultiplier > max.synergyMultiplier ? s : max, activeSynergies[0]);

  return { multiplier: best.synergyMultiplier, activeSynergies };
}

/**
 * Get positioning effects for the applied position on a given protocol
 */
export function getPositioningEffects(
  protocol: SeverityProtocol,
  appliedTreatmentIds: string[],
): PositioningEffect | null {
  for (const posEffect of protocol.positioningEffects) {
    if (appliedTreatmentIds.includes(posEffect.positionId)) {
      return posEffect;
    }
  }
  return null;
}

/**
 * Calculate the effective response ceiling based on protocol completeness
 */
export function getEffectiveResponseCeiling(
  protocol: SeverityProtocol,
  appliedTreatmentIds: string[],
): number {
  const compliance = assessProtocolCompliance(protocol, appliedTreatmentIds);
  const { partialCeiling, fullCeiling } = protocol.responseCeilings;

  // Interpolate between partial and full ceiling based on compliance
  const range = fullCeiling - partialCeiling;
  return partialCeiling + (range * compliance.completionPercent / 100);
}
