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
import type { BreathSoundType, HeartSoundType } from './clinicalSounds';

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
    // Optional per-zone overrides (upper/lower lung fields). When omitted the
    // per-side value applies to both zones — see ClinicalSoundState.
    leftUpperLung?: BreathSoundType;
    leftLowerLung?: BreathSoundType;
    rightUpperLung?: BreathSoundType;
    rightLowerLung?: BreathSoundType;
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
        optimalTreatments: ['aspirin', 'oxygen_nonrebreather', 'iv_access', 'fowlers_position'],
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
        optimalTreatments: ['oxygen_nasal', 'recovery_position', 'reassurance'],
        beneficialTreatments: ['reassurance', 'glucose_10g', 'iv_access'],
        // POST-ICTAL / self-terminated seizure (incl. simple febrile seizures): a
        // benzodiazepine is now contraindicated — the seizure is over, so it adds no
        // benefit and causes over-sedation / respiratory depression, esp. in a child.
        // Benzos belong to the 'severe' (ongoing/status) band only.
        contraindicatedTreatments: ['midazolam_5mg', 'midazolam_buccal', 'diazepam_rectal'],
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
        optimalTreatments: ['midazolam_5mg', 'oxygen_nonrebreather', 'airway_open', 'suction', 'iv_access', 'dextrose_10', 'recovery_position'],
        beneficialTreatments: ['recovery_position', 'dextrose_10'],
        contraindicatedTreatments: ['glucose_10g'],
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
            treatments: ['midazolam_5mg', 'dextrose_10'],
            synergyMultiplier: 1.3,
            description: 'If seizure is hypoglycaemia-driven, airway-safe IV glucose correction prevents recurrence',
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
        // Positive-pressure ventilation BEFORE needle decompression forces more air
        // into the pleural space and worsens the tension (rising intrathoracic
        // pressure, falling venous return). Decompress FIRST, then ventilate. (The
        // needle_decompression+oxygen synergy above carries the correct-order reward.)
        contraindicatedTreatments: ['bvm_ventilation', 'cpap_niv'],
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
  // OPEN PNEUMOTHORAX (SUCKING CHEST WOUND)
  // ===========================================================================
  {
    condition: 'pneumothorax-open',
    conditionName: 'Open Pneumothorax (Sucking Chest Wound)',
    severityLevels: [
      {
        severity: 'severe',
        description: 'Open pneumothorax — sucking chest wound with audible air entry, reduced breath sounds on affected side',
        typicalVitals: {
          pulse: [110, 140],
          respiration: [26, 36],
          spo2: [80, 90],
          bpSystolic: [80, 100],
        },
        initialSounds: {
          leftLung: 'diminished',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Audible sucking sound from wound', 'Bubbling at wound site', 'Subcutaneous emphysema'],
          description: 'DIMINISHED breath sounds on the affected side. Audible sucking sound at wound site. Clear on opposite side.',
        },
        essentialTreatments: ['chest_seal_vented', 'oxygen_nonrebreather'],
        optimalTreatments: ['chest_seal_vented', 'oxygen_nonrebreather', 'iv_access', 'fluids_500ml'],
        beneficialTreatments: ['occlusive_dressing_3sided', 'iv_access', 'fluids_250ml', 'reassurance'],
        contraindicatedTreatments: [],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['chest_seal_vented', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.2,
            description: 'Sealing the wound restores chest wall integrity; high-flow O2 then improves oxygenation rapidly',
          },
          {
            treatments: ['chest_seal_vented', 'oxygen_nonrebreather', 'fluids_500ml'],
            synergyMultiplier: 2.5,
            description: 'Full open PTX protocol: seal wound + oxygenate + volume replace for associated hypovolaemia from trauma',
          },
          {
            treatments: ['occlusive_dressing_3sided', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.0,
            description: '3-sided dressing creates flutter valve; combined with O2 improves ventilation. Vented chest seal preferred if available',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 2,
            rrReduction: 2,
            hrChange: -5,
            description: 'Semi-upright position aids ventilation and reduces work of breathing',
          },
        ],
        responseCeilings: {
          partialCeiling: 20,
          fullCeiling: 85,
          timeToResponse: 90,
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
        severity: 'moderate',
        description:
          'Moderate hypoglycaemia — conscious but impaired (GCS ~10-13), confused/drowsy, swallow unreliable. BGL ~1.5-3.0 mmol/L. Oral route now carries aspiration risk — prefer IM glucagon / IV dextrose.',
        typicalVitals: {
          pulse: [95, 125],
          respiration: [14, 22],
          spo2: [95, 99],
          bpSystolic: [105, 145],
          gcs: [10, 13],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Confused / drowsy', 'Diaphoretic', 'Tremulous', 'Swallow unreliable'],
          description:
            'Clear lungs bilaterally. Tachycardic. Patient confused and drowsy — gag/swallow no longer reliable, so the oral route is unsafe.',
        },
        // IM glucagon works without IV and without a safe swallow; IV dextrose is the
        // definitive correction once cannulated. iv_access essential to enable dextrose.
        essentialTreatments: ['glucagon_1mg', 'iv_access', 'dextrose_10'],
        optimalTreatments: ['glucagon_1mg', 'iv_access', 'dextrose_10', 'recovery_position', 'oxygen_nasal'],
        beneficialTreatments: ['recovery_position', 'oxygen_nasal', 'dextrose_10_250ml'],
        // KEY DEEPENING: glucose_10g (oral) is CONTRAINDICATED at this band — a confused
        // GCS-10-13 patient with an unreliable swallow can aspirate. This is genuinely
        // dangerous and is a real catalog ID, so the engine now harms for it.
        contraindicatedTreatments: ['glucose_10g'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            // REQUIRES the IM bridge + IV definitive route together.
            treatments: ['glucagon_1mg', 'dextrose_10'],
            synergyMultiplier: 1.7,
            description:
              'IM glucagon buys time (no IV / no swallow needed) while IV dextrose delivers definitive correction.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 2,
            rrReduction: 1,
            hrChange: -2,
            description:
              'Lateral/recovery position protects the airway of a confused hypoglycaemic patient with an unreliable swallow.',
          },
        ],
        responseCeilings: {
          partialCeiling: 55,
          fullCeiling: 95,
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
  // CARDIAC ARREST (ASYSTOLE / NON-SHOCKABLE)
  // ===========================================================================
  {
    condition: 'asystole',
    conditionName: 'Cardiac Arrest (Asystole / Non-Shockable Rhythm)',
    severityLevels: [
      {
        severity: 'life-threatening',
        description: 'Confirmed asystole — no pulse, no output, non-shockable rhythm. Prioritise uninterrupted CPR, ventilation, adrenaline, and reversible causes.',
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
          additionalSounds: ['No pulse palpable', 'No purposeful response', 'Asystole confirmed in more than one lead'],
          description: 'No breath sounds or heart sounds. Monitor confirms asystole. This is a non-shockable arrest.',
        },
        essentialTreatments: ['cpr', 'adrenaline_1mg', 'airway_open', 'bvm_ventilation'],
        optimalTreatments: ['cpr', 'adrenaline_1mg', 'airway_open', 'bvm_ventilation', 'iv_access', 'io_access', 'oxygen_nonrebreather'],
        beneficialTreatments: ['iv_access', 'io_access', 'intubation'],
        contraindicatedTreatments: ['defibrillation', 'amiodarone_300mg'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['cpr', 'adrenaline_1mg'],
            synergyMultiplier: 1.8,
            description: 'High-quality uninterrupted CPR with timely adrenaline is the core non-shockable arrest pathway.',
          },
          {
            treatments: ['cpr', 'airway_open', 'bvm_ventilation', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.6,
            description: 'Airway opening and effective oxygenated ventilation support CPR while reversible causes are sought.',
          },
          {
            treatments: ['cpr', 'adrenaline_1mg', 'airway_open', 'bvm_ventilation', 'io_access'],
            synergyMultiplier: 2.1,
            description: 'Complete asystole bundle: CPR, oxygenated ventilation, rapid vascular access, and adrenaline without inappropriate shocks.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: 0,
            description: 'Patient must be supine on a hard surface for effective compressions.',
          },
        ],
        responseCeilings: {
          partialCeiling: 10,
          fullCeiling: 55,
          timeToResponse: 180,
        },
      },
    ],
  },

  // ===========================================================================
  // OPIOID OVERDOSE / RESPIRATORY DEPRESSION
  // ===========================================================================
  {
    condition: 'opioid-overdose',
    conditionName: 'Opioid Overdose with Respiratory Depression',
    severityLevels: [
      {
        severity: 'life-threatening',
        description: 'Opioid toxidrome with severe hypoventilation, hypoxia, reduced consciousness, and shock. Ventilate first and titrate naloxone to adequate breathing.',
        typicalVitals: {
          pulse: [35, 80],
          respiration: [0, 8],
          spo2: [50, 85],
          bpSystolic: [60, 100],
          gcs: [3, 10],
        },
        initialSounds: {
          leftLung: 'diminished',
          rightLung: 'diminished',
          heartSound: 'bradycardic',
          additionalSounds: ['Slow shallow respirations', 'Pinpoint pupils', 'Reduced consciousness', 'Possible aspiration'],
          description: 'Minimal respiratory effort with reduced bilateral air entry. Pinpoint pupils and depressed consciousness support an opioid toxidrome.',
        },
        essentialTreatments: ['airway_open', 'bvm_ventilation', 'oxygen_nonrebreather', 'naloxone_04mg'],
        optimalTreatments: ['airway_open', 'bvm_ventilation', 'oxygen_nonrebreather', 'naloxone_04mg', 'suction', 'iv_access', 'recovery_position'],
        beneficialTreatments: ['suction', 'iv_access', 'io_access', 'recovery_position', 'fluids_500ml'],
        contraindicatedTreatments: ['glucose_10g'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['airway_open', 'bvm_ventilation', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.8,
            description: 'Airway opening plus oxygenated BVM ventilation reverses the immediate life threat before the antidote takes effect.',
          },
          {
            treatments: ['bvm_ventilation', 'naloxone_04mg'],
            synergyMultiplier: 2.0,
            description: 'Ventilation supports the patient while titrated naloxone restores respiratory drive.',
          },
          {
            treatments: ['airway_open', 'bvm_ventilation', 'oxygen_nonrebreather', 'naloxone_04mg', 'suction'],
            synergyMultiplier: 2.3,
            description: 'Complete overdose pathway: ventilate, reverse respiratory depression, and protect against vomiting or aspiration.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 2,
            rrReduction: 0,
            hrChange: 0,
            description: 'Once spontaneous breathing returns, lateral positioning helps protect the airway during re-sedation or vomiting.',
          },
        ],
        responseCeilings: {
          partialCeiling: 35,
          fullCeiling: 95,
          timeToResponse: 180,
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
        // adrenaline_1mg is the IV 1:10,000 ARREST dose — giving it to a perfusing
        // anaphylaxis patient causes hypertensive crisis / arrhythmia. The correct
        // drug is adrenaline_im (essential, above). Antihistamine/steroid are adjuncts,
        // NOT harmful, so they are deliberately not listed here.
        contraindicatedTreatments: ['adrenaline_1mg'],
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
        // adrenaline_1mg is the IV arrest dose — wrong/dangerous in a perfusing
        // anaphylaxis patient; the correct route is adrenaline_im.
        contraindicatedTreatments: ['adrenaline_1mg'],
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
            rrReduction: 0,
            hrChange: 0,
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
            rrReduction: 0,
            hrChange: 0,
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
        // Pre-hospital priority is recognition, repeated BP/neuro assessment,
        // monitoring, IV access, gentle transport, and a clear pre-alert. Rapid
        // unsupervised BP reduction can cause cerebral or coronary hypoperfusion.
        essentialTreatments: ['iv_access', 'reassurance'],
        optimalTreatments: ['iv_access', 'reassurance', 'fowlers_position'],
        beneficialTreatments: ['fowlers_position', 'oxygen_nasal'],
        contraindicatedTreatments: ['gtn_spray'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['iv_access', 'reassurance', 'fowlers_position'],
            synergyMultiplier: 1.4,
            description: 'Calm, monitored, head-up transport with IV access limits avoidable sympathetic stress while preserving cerebral perfusion for controlled hospital treatment',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: 0,
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
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'normal',
          additionalSounds: ['Altered consciousness', 'Papilledema', 'Severe headache', 'Bounding pulse'],
          description: 'Clear lungs in hypertensive encephalopathy. Regular but bounding pulse. Reassess continuously for evolving end-organ damage.',
        },
        essentialTreatments: ['iv_access', 'reassurance', 'fowlers_position'],
        optimalTreatments: ['iv_access', 'reassurance', 'fowlers_position'],
        beneficialTreatments: ['oxygen_nasal', 'midazolam_5mg'],
        contraindicatedTreatments: ['gtn_spray'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['iv_access', 'reassurance', 'fowlers_position'],
            synergyMultiplier: 1.5,
            description: 'Head-up monitored transport, reassurance, and IV access preserve cerebral perfusion while expediting controlled hospital treatment',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 3,
            rrReduction: 0,
            hrChange: 0,
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

  // ===========================================================================
  // INFERIOR / RIGHT-VENTRICULAR STEMI
  // ---------------------------------------------------------------------------
  // Distinct from the anterior-STEMI protocol because the RV is PRELOAD-DEPENDENT.
  // The teaching point: preload-reducing drugs (GTN, opioids) cause catastrophic
  // hypotension when the RV is infarcted. Prehospital care is supportive +
  // rapid transport for PCI — you cannot reopen the RCA in the field, so the
  // ceilings stay deliberately low.
  // ===========================================================================
  {
    condition: 'stem-inferior',
    conditionName: 'Acute Inferior / Right-Ventricular STEMI',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Inferior STEMI — perfusing, chest/epigastric pain, diaphoretic, often bradycardic (vagal/RCA → SA-AV node). Borderline-to-low BP from early RV involvement.',
        typicalVitals: {
          pulse: [50, 90],          // RCA supplies SA/AV node → brady, not tachy
          respiration: [18, 26],
          spo2: [93, 97],
          bpSystolic: [90, 120],    // low-normal — RV preload sensitivity
          gcs: [14, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'normal',     // regular, often bradycardic — NOT tachy
          additionalSounds: ['Clear chest — NO pulmonary oedema despite low BP (key RV-infarct discriminator)', 'Diaphoresis', 'Nausea/vomiting (inferior territory)', 'Possible S4 / RV heave', 'JVD may be present (RV failure) with clear lungs'],
          description: 'Clear lungs bilaterally with a regular, often bradycardic rhythm. Clear chest + hypotension + raised JVP is the inferior/RV-infarct signature — fluid-responsive, NOT fluid-overloaded.',
        },
        // GTN, morphine and fentanyl are intentionally EXCLUDED from essentials —
        // see contraindicatedTreatments. O2 only if hypoxic (titrate). Cautious
        // 250 mL bolus supports the preload-dependent RV.
        essentialTreatments: ['aspirin', 'iv_access', 'fluids_250ml', 'oxygen_nasal'],
        optimalTreatments: ['aspirin', 'iv_access', 'fluids_250ml', 'oxygen_nasal', 'clopidogrel_300mg', 'enoxaparin_1mg', 'supine_position', 'ondansetron_4mg'],
        beneficialTreatments: ['clopidogrel_300mg', 'enoxaparin_1mg', 'supine_position', 'ondansetron_4mg', 'reassurance', 'ketamine_analgesic'],
        // REAL HARM: all three drop preload/afterload → catastrophic hypotension in
        // a preload-dependent RV. This contraindication list is the whole lesson.
        contraindicatedTreatments: ['gtn_spray', 'morphine_5mg', 'fentanyl_50mcg'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['aspirin', 'fluids_250ml'],
            synergyMultiplier: 1.3,
            description: 'Antiplatelet to limit clot burden + cautious preload support for the RV — the two prehospital pillars of inferior/RV STEMI.',
          },
          {
            treatments: ['aspirin', 'clopidogrel_300mg'],
            synergyMultiplier: 1.5,
            description: 'Dual antiplatelet therapy (DAPT) loads the patient for the PCI pathway.',
          },
          {
            treatments: ['aspirin', 'clopidogrel_300mg', 'enoxaparin_1mg'],
            synergyMultiplier: 1.7,
            description: 'DAPT + anticoagulation — full pharmacological prep for timely primary PCI. Definitive treatment remains reperfusion in the cath lab.',
          },
          {
            treatments: ['aspirin', 'clopidogrel_300mg', 'enoxaparin_1mg', 'fluids_250ml'],
            synergyMultiplier: 1.8,
            description: 'Complete supportive inferior/RV STEMI bundle: DAPT + anticoagulation + preload support, bridging to PCI.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: 0,
            description: 'Keep flat (or legs raised) — the RV depends on venous return. Sitting the patient up drops preload and BP.',
          },
          {
            positionId: 'leg_elevation',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: -3,
            description: 'Passive leg raise augments preload to the failing RV — a positional fluid challenge.',
          },
          {
            positionId: 'fowlers_position',
            spo2Bonus: -3,
            rrReduction: 0,
            hrChange: 5,
            description: 'DANGEROUS in RV infarct: sitting upright reduces venous return to a preload-dependent ventricle and worsens hypotension.',
          },
        ],
        responseCeilings: {
          // Prehospital is supportive only — the occlusion is fixed in the cath lab.
          partialCeiling: 45,
          fullCeiling: 75,
          timeToResponse: 300,
        },
      },
      {
        severity: 'life-threatening',
        description: 'RV-infarct shock — profound hypotension, bradycardia and/or high-grade AV block, poor perfusion. Preload-dependent cardiogenic shock; may need fluids, chronotropy and pacing en route to PCI.',
        typicalVitals: {
          pulse: [30, 60],          // brady / AV block predominates
          respiration: [22, 34],
          spo2: [85, 93],
          bpSystolic: [60, 90],
          gcs: [12, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'normal',     // bradycardic/regular or paced — still clear chest
          additionalSounds: ['Clear chest despite shock — RV, not LV, failure', 'Raised JVP / Kussmaul sign', 'Profound hypotension', 'High-grade AV block on monitor', 'Cold, mottled peripheries', 'Altered mentation as perfusion falls'],
          description: 'Clear lungs with profound hypotension and bradycardia/AV block — RV cardiogenic shock. The clear chest distinguishes this from LV pump failure and means fluids help rather than harm.',
        },
        // Aspirin + access + cautious preload support remain the spine. O2 titrated
        // (genuinely hypoxic here). Atropine for symptomatic brady, adrenaline +
        // pacing for refractory shock. NO preload reducers.
        essentialTreatments: ['aspirin', 'iv_access', 'fluids_250ml', 'oxygen_nonrebreather', 'atropine_05mg'],
        optimalTreatments: ['aspirin', 'iv_access', 'fluids_250ml', 'oxygen_nonrebreather', 'atropine_05mg', 'fluids_500ml', 'adrenaline_1mg', 'clopidogrel_300mg', 'supine_position'],
        beneficialTreatments: ['fluids_500ml', 'adrenaline_1mg', 'io_access', 'clopidogrel_300mg', 'enoxaparin_1mg', 'leg_elevation'],
        // Preload/afterload reducers are lethal here; large fluid loads risk RV
        // over-distension/ischaemia once the RV is full, so 1 L bolus is contraindicated.
        contraindicatedTreatments: ['gtn_spray', 'morphine_5mg', 'fentanyl_50mcg', 'fluids_1000ml'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['fluids_250ml', 'atropine_05mg'],
            synergyMultiplier: 1.4,
            description: 'Preload support + chronotropy: refill the RV and correct the nodal bradycardia that RCA occlusion produces.',
          },
          {
            treatments: ['aspirin', 'fluids_250ml', 'atropine_05mg'],
            synergyMultiplier: 1.5,
            description: 'Antiplatelet + preload + rate support — the supportive triad while arranging emergent PCI/pacing.',
          },
          {
            treatments: ['fluids_250ml', 'atropine_05mg', 'adrenaline_1mg'],
            synergyMultiplier: 1.6,
            description: 'When fluids + atropine fail, low-dose adrenaline supports the failing RV and rate as a bridge to pacing/PCI.',
          },
          {
            treatments: ['aspirin', 'clopidogrel_300mg', 'fluids_250ml', 'atropine_05mg', 'adrenaline_1mg'],
            synergyMultiplier: 1.8,
            description: 'Maximal prehospital RV-shock package — but ceiling stays low: definitive care is reperfusion, this only buys time.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: 0,
            description: 'Stay supine — upright posture is dangerous in RV shock. Maintains venous return to the failing RV.',
          },
          {
            positionId: 'leg_elevation',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: -3,
            description: 'Passive leg raise = immediate positional autotransfusion to augment RV preload.',
          },
          {
            positionId: 'fowlers_position',
            spo2Bonus: -5,
            rrReduction: 0,
            hrChange: 8,
            description: 'DANGEROUS: sitting an RV-infarct shock patient up can precipitate cardiovascular collapse by dropping preload.',
          },
        ],
        responseCeilings: {
          // Shocked RV that needs the cath lab — prehospital measures are a bridge only.
          partialCeiling: 25,
          fullCeiling: 60,
          timeToResponse: 240,
        },
      },
    ],
  },

  // ===========================================================================
  // ACUTE HEART FAILURE / CARDIOGENIC PULMONARY OEDEMA (APO)
  // ---------------------------------------------------------------------------
  // Cases: cardiac-011 (heart-failure), resp-008 (heart-failure).
  // NB cardiac-008 (lbbb-stemi) is a STEMI-equivalent with HF features — it
  // routes to the STEMI protocol by design and is NOT covered here.
  // JRCALC scope: GTN + high-flow O2 + CPAP + sit upright are the front-line
  // bundle. Furosemide is NOT in the catalog (proposed new drug — see notes);
  // even where carried it is a second-line adjunct, so its absence does not
  // break the essential pathway. Fluids are actively harmful (volume overload),
  // and lying the patient flat (supine) worsens the oedema.
  // ===========================================================================
  {
    condition: 'heart-failure',
    conditionName: 'Acute Heart Failure / Cardiogenic Pulmonary Oedema',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Acute cardiogenic pulmonary oedema — orthopnoea, bibasal crackles, "cardiac wheeze", hypertensive, SpO2 88-93%. Sympathetic-driven afterload spike (SCAPE physiology), NOT primarily fluid overload.',
        typicalVitals: {
          pulse: [110, 135],
          respiration: [28, 38],
          spo2: [86, 93],
          bpSystolic: [150, 200], // Hypertensive APO — afterload mismatch is the engine of decompensation
        },
        initialSounds: {
          leftLung: 'crackles-fine',
          rightLung: 'crackles-fine',
          leftLowerLung: 'crackles-coarse',
          rightLowerLung: 'crackles-coarse',
          heartSound: 'gallop',
          additionalSounds: ['Bibasal fine crackles rising to mid-zones', 'Expiratory "cardiac wheeze"', 'S3 gallop', 'Raised JVP', 'Diaphoresis', 'Pink frothy sputum if severe'],
          description: 'Bilateral fine crackles to the mid-zones with a superimposed expiratory wheeze (cardiac asthma). S3 gallop, raised JVP — fluid is backing up into the lungs, not the alveoli filling from below.',
        },
        // Furosemide deliberately omitted (not in catalog; second-line anyway).
        // GTN + high-flow O2 + CPAP + upright posture are what actually reverse APO pre-hospital.
        essentialTreatments: ['gtn_spray', 'oxygen_nonrebreather', 'cpap_niv', 'fowlers_position', 'iv_access'],
        optimalTreatments: ['gtn_spray', 'oxygen_nonrebreather', 'cpap_niv', 'fowlers_position', 'iv_access', 'morphine_5mg'],
        beneficialTreatments: ['morphine_5mg', 'reassurance', 'calm_environment'],
        // REAL HARM (engine): fluids tip an already-wet patient into worse oedema;
        // supine splints the diaphragm and floods the upper zones.
        contraindicatedTreatments: ['fluids_500ml', 'fluids_1000ml', 'supine_position'],
        deteriorationRate: 'fast',
        synergies: [
          {
            // ESSENTIAL PAIR — lower multiplier. Preload/afterload reduction is the
            // single most important lever; GTN alone already helps, GTN+upright more so.
            treatments: ['gtn_spray', 'fowlers_position'],
            synergyMultiplier: 1.4,
            description: 'GTN venodilates (preload↓) and at higher doses dilates arterioles (afterload↓); sitting upright pools blood in dependent veins — together they pull fluid back out of the lungs',
          },
          {
            // Add CPAP to the essential pair — recruits alveoli and reduces LV transmural pressure.
            treatments: ['gtn_spray', 'cpap_niv', 'fowlers_position'],
            synergyMultiplier: 1.8,
            description: 'GTN + CPAP + upright: positive intrathoracic pressure splints flooded alveoli open, drops preload AND afterload, and buys time — the core pre-hospital APO bundle',
          },
          {
            // FULL BUNDLE — highest multiplier. Adds oxygenation + access (route for IV GTN/morphine).
            treatments: ['gtn_spray', 'cpap_niv', 'fowlers_position', 'oxygen_nonrebreather', 'iv_access'],
            synergyMultiplier: 2.1,
            description: 'Complete APO protocol: vasodilatation + CPAP + upright + high-flow O2 + IV access for titratable nitrate — maximal reversal of cardiogenic pulmonary oedema',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 5,
            rrReduction: 4,
            hrChange: -8,
            description: 'Sitting fully upright (legs dependent) is therapeutic in APO — pools venous blood and unloads the congested lungs',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: -5,
            rrReduction: -4,
            hrChange: 6,
            description: 'DANGEROUS: lying flat in APO increases venous return to an already-failing heart and floods the upper lung zones — can precipitate respiratory arrest',
          },
        ],
        responseCeilings: {
          // partial = essential-only (GTN + O2 + CPAP + upright + access, no morphine): strong but not maximal
          partialCeiling: 70,
          fullCeiling: 95,
          timeToResponse: 240,
        },
      },
      {
        severity: 'life-threatening',
        description: 'Crashing APO / SCAPE tipping into cardiogenic shock or exhaustion — pink frothy sputum, exhaustion, falling GCS, SpO2 <85%. May be hypertensive (afterload crisis) or, once the LV fails, hypotensive with poor perfusion.',
        typicalVitals: {
          pulse: [120, 150],
          respiration: [30, 44],
          spo2: [70, 85],
          bpSystolic: [85, 180], // Wide: hypertensive SCAPE OR hypotensive cardiogenic shock
          gcs: [10, 14],
        },
        initialSounds: {
          leftLung: 'crackles-coarse',
          rightLung: 'crackles-coarse',
          heartSound: 'gallop',
          additionalSounds: ['Coarse crackles throughout all zones', 'Pink frothy sputum', 'Gurgling secretions', 'Exhaustion', 'Cyanosis', 'Tiring respiratory effort'],
          description: 'Coarse crackles throughout both lung fields with audible bubbling secretions and pink frothy sputum — the alveoli are flooding. Patient tiring; this is peri-arrest pulmonary oedema.',
        },
        essentialTreatments: ['oxygen_nonrebreather', 'cpap_niv', 'gtn_spray', 'fowlers_position', 'iv_access'],
        optimalTreatments: ['oxygen_nonrebreather', 'cpap_niv', 'gtn_spray', 'fowlers_position', 'iv_access'],
        beneficialTreatments: ['bvm_ventilation', 'intubation', 'morphine_5mg', 'suction'],
        // GTN only while SBP supports it — but in the hypertensive SCAPE phenotype it is essential.
        // Fluids and supine remain frankly harmful regardless of phenotype.
        contraindicatedTreatments: ['fluids_500ml', 'fluids_1000ml', 'supine_position'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            // ESSENTIAL PAIR — oxygenation + positive pressure keep the patient alive.
            treatments: ['oxygen_nonrebreather', 'cpap_niv'],
            synergyMultiplier: 1.6,
            description: 'High-flow O2 + CPAP: the only things that reliably hold saturations while the lungs are flooding — recruits alveoli and reduces work of breathing',
          },
          {
            treatments: ['oxygen_nonrebreather', 'cpap_niv', 'gtn_spray', 'fowlers_position'],
            synergyMultiplier: 2.2,
            description: 'Full crashing-APO bundle: O2 + CPAP + aggressive nitrate + upright — unloads the heart and reverses the flooding when SBP permits GTN',
          },
          {
            // Rescue ventilation pairing for the exhausted patient when CPAP is failing.
            treatments: ['oxygen_nonrebreather', 'bvm_ventilation'],
            synergyMultiplier: 1.7,
            description: 'Assisted BVM ventilation with high-flow O2 when the patient is exhausted and CPAP alone is not holding saturations — bridge to intubation',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 4,
            rrReduction: 3,
            hrChange: -5,
            description: 'Upright remains critical even peri-arrest — keep the head up unless actively managing the airway',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: -6,
            rrReduction: -4,
            hrChange: 8,
            description: 'DANGEROUS: flat positioning in crashing APO floods the airway with frothy secretions and accelerates arrest',
          },
        ],
        responseCeilings: {
          partialCeiling: 25,
          fullCeiling: 75,
          timeToResponse: 180,
        },
      },
    ],
  },

  // ===========================================================================
  // PULMONARY EMBOLISM (PE)
  // ---------------------------------------------------------------------------
  // Cases: resp-004 (submassive — RR28/SpO2 89/HR115/BP100/65, clear chest, DVT),
  //        litfl-007 (massive with RV strain — RR32/SpO2 83/HR128/BP88/52,
  //        clear chest, raised JVP, RV heave, S1Q3T3, supine-intolerant, PEA risk).
  // JRCALC scope: pre-hospital management is SUPPORTIVE — high-flow O2, IV access,
  // CAUTIOUS small-aliquot fluids (250 mL), and rapid transport for imaging +
  // thrombolysis/anticoagulation. The failing, pressure-overloaded RV is preload-
  // SENSITIVE in a narrow window: too little and it underfills, too much and it
  // over-distends and bows the septum into the LV (worsening shock). Anticoag and
  // thrombolytics are NOT in the catalog (see notes). GTN is dangerous — it drops
  // preload to an obstructed, preload-dependent RV and crashes the BP.
  // ===========================================================================
  {
    condition: 'pulmonary-embolism',
    conditionName: 'Pulmonary Embolism',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Submassive PE — tachypnoea, hypoxia out of proportion to a CLEAR chest, pleuritic chest pain, tachycardia, normotensive-to-borderline SBP with unilateral DVT signs. Right heart coping but strained.',
        typicalVitals: {
          pulse: [100, 125],
          respiration: [24, 32],
          spo2: [86, 93],
          bpSystolic: [95, 120], // Borderline — can drop catastrophically as clot burden shifts
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['CLEAR chest despite marked hypoxia (shunt physiology)', 'Pleuritic chest pain', 'Tachypnoea', 'Unilateral calf swelling/tenderness (DVT)', 'Anxiety'],
          description: 'Clear air entry bilaterally with no added sounds — the hypoxia is from dead-space/shunt, not lung pathology. A clear chest with this degree of hypoxia and a swollen calf is PE until proven otherwise.',
        },
        // CAUTIOUS small fluid aliquot only — fills a preload-dependent RV without over-distending it.
        essentialTreatments: ['oxygen_nonrebreather', 'iv_access', 'fluids_250ml'],
        optimalTreatments: ['oxygen_nonrebreather', 'iv_access', 'fluids_250ml', 'fowlers_position', 'reassurance'],
        beneficialTreatments: ['fowlers_position', 'reassurance', 'calm_environment'],
        // REAL HARM (engine): a large fluid load over-distends the strained RV (volume-overload branch);
        // GTN drops preload to a preload-dependent obstructed RV → BP collapse.
        contraindicatedTreatments: ['fluids_1000ml', 'gtn_spray'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            // ESSENTIAL PAIR — oxygenation + a route, the supportive backbone.
            treatments: ['oxygen_nonrebreather', 'iv_access'],
            synergyMultiplier: 1.3,
            description: 'High-flow O2 corrects the hypoxaemia of shunt physiology while IV access secures a route for cautious fluids and onward thrombolysis — the supportive backbone of pre-hospital PE care',
          },
          {
            // Add the cautious preload optimisation — careful 250 mL improves a struggling RV.
            treatments: ['oxygen_nonrebreather', 'iv_access', 'fluids_250ml'],
            synergyMultiplier: 1.6,
            description: 'O2 + access + a SMALL 250 mL aliquot: a careful preload bump can improve RV output in submassive PE — titrate to response, stop if it does not help (over-filling worsens RV distension)',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 2,
            rrReduction: 2,
            hrChange: -4,
            description: 'Semi-upright (position of comfort) eases the work of breathing in the conscious, normotensive PE patient',
          },
        ],
        responseCeilings: {
          // Pre-hospital care is supportive — definitive treatment (thrombolysis/anticoag) is in hospital,
          // so even a perfect bundle has a capped ceiling: you stabilise, you do not cure.
          partialCeiling: 45,
          fullCeiling: 70,
          timeToResponse: 300,
        },
      },
      {
        severity: 'life-threatening',
        description: 'Massive PE with RV strain — obstructive shock: severe hypoxia resistant to oxygen, hypotension, raised JVP, RV heave, S1Q3T3, supine-intolerant. Imminent PEA arrest.',
        typicalVitals: {
          pulse: [120, 150],
          respiration: [30, 44],
          spo2: [70, 85],
          bpSystolic: [60, 90], // Obstructive shock from RV outflow obstruction
          gcs: [11, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['CLEAR chest with profound, O2-resistant hypoxia', 'Accentuated P2', 'RV heave', 'Raised JVP', 'Central cyanosis', 'Cool peripheries', 'Unilateral DVT', 'Speaking 2-3 words only'],
          description: 'Clear lungs but central cyanosis and saturations that barely move on 15 L/min — fixed obstruction to pulmonary flow. Raised JVP, RV heave and S1Q3T3 mark acute right heart failure. This is obstructive shock.',
        },
        // CAUTIOUS 250 mL aliquots ONLY — the failing RV is exquisitely sensitive to over-filling.
        essentialTreatments: ['oxygen_nonrebreather', 'iv_access', 'fluids_250ml'],
        optimalTreatments: ['oxygen_nonrebreather', 'iv_access', 'fluids_250ml', 'bvm_ventilation', 'fowlers_position'],
        beneficialTreatments: ['bvm_ventilation', 'reassurance', 'cpr', 'defibrillation'],
        // Large fluids over-distend the failing RV (septal bowing → LV underfilling → worse shock);
        // GTN obliterates the preload an obstructed RV depends on → cardiac arrest.
        contraindicatedTreatments: ['fluids_1000ml', 'fluids_500ml', 'gtn_spray'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            // ESSENTIAL PAIR — oxygenate and gain a route; everything definitive needs that route.
            treatments: ['oxygen_nonrebreather', 'iv_access'],
            synergyMultiplier: 1.4,
            description: 'Maximal oxygenation against shunt physiology plus IV access — the prerequisite for cautious volume and for thrombolysis, the only definitive reversal of massive PE',
          },
          {
            treatments: ['oxygen_nonrebreather', 'iv_access', 'fluids_250ml'],
            synergyMultiplier: 1.8,
            description: 'O2 + access + a careful 250 mL aliquot: a small preload bump may briefly lift the obstructed RV — give in small volumes and reassess, because over-filling tips it into worse failure',
          },
          {
            // Rescue ventilation for the exhausted, hypoxic patient.
            treatments: ['oxygen_nonrebreather', 'bvm_ventilation'],
            synergyMultiplier: 1.6,
            description: 'Assisted BVM ventilation with high-flow O2 when saturations stay critical despite NRB — support oxygenation while preparing for likely PEA arrest',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 2,
            rrReduction: 2,
            hrChange: -3,
            description: 'Position of comfort, usually semi-upright — but this patient cannot tolerate lying flat without crashing their saturations',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: -3,
            rrReduction: 2,
            hrChange: 4,
            description: 'Massive-PE patients are typically supine-intolerant — forcing flat positioning worsens the hypoxia and distress',
          },
        ],
        responseCeilings: {
          // Pre-hospital is purely supportive against a fixed mechanical obstruction — the ceiling is
          // low until thrombolysis/embolectomy happens in hospital.
          partialCeiling: 20,
          fullCeiling: 55,
          timeToResponse: 240,
        },
      },
    ],
  },

  {
    condition: 'electrolyte',
    conditionName: 'Hyperkalaemia / Electrolyte Emergency',
    severityLevels: [
      {
        // Anchors metab-003 (HR 38, BP 90, SpO2 96, GCS 15, peaked T + wide QRS)
        // and litfl-003 (HR 36, BP 95, SpO2 89, drowsy, fluid-overloaded dialysis pt).
        severity: 'severe',
        description:
          'Severe hyperkalaemia with ECG changes — peaked T waves, widening QRS, profound bradycardia. Pre-arrest. Membrane stabilisation is time-critical.',
        typicalVitals: {
          pulse: [35, 60],
          respiration: [16, 30],
          spo2: [88, 97],
          bpSystolic: [85, 110],
          gcs: [13, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          // litfl-003 (fluid-overloaded dialysis patient) has bibasal crackles —
          // overridden per-zone so the lower fields read 'crackles'.
          leftLowerLung: 'crackles-fine',
          rightLowerLung: 'crackles-fine',
          heartSound: 'bradycardic',
          additionalSounds: [
            'Profound bradycardia',
            'Irregular pulse',
            'Muscle weakness / paresthesias',
            'Peaked tented T waves on monitor',
            'Broadening QRS (>120ms)',
          ],
          description:
            'Slow irregular pulse. Lungs clear (or bibasal crackles if fluid-overloaded dialysis patient). Monitor shows peaked T waves and a widening QRS — hyperkalaemic ECG.',
        },
        // calcium_chloride FIRST = membrane stabilisation (does NOT lower K+, buys time);
        // then the K+-shifting pair: nebulised/IV salbutamol + sodium bicarbonate.
        essentialTreatments: ['calcium_chloride', 'nebulizer_salbutamol', 'iv_access'],
        optimalTreatments: [
          'calcium_chloride',
          'calcium_gluconate',
          'nebulizer_salbutamol',
          'salbutamol_iv',
          'insulin_actrapid',
          'dextrose_10',
          'sodium_bicarbonate',
          'iv_access',
          'oxygen_mask',
        ],
        beneficialTreatments: ['oxygen_mask', 'oxygen_nasal', 'calcium_gluconate', 'salbutamol_iv', 'sodium_bicarbonate', 'dextrose_10'],
        // NOTE: nothing in the catalog is *categorically* contraindicated in severe
        // hyperkalaemia, so we keep this honest and short. Fluids are NOT listed here
        // because a fluid bolus is reasonable in a dehydrated hyperkalaemic patient and
        // would not be "genuinely dangerous" across the board — the harm case (fluid
        // overload in the anuric dialysis patient, litfl-003) is handled by the
        // life-threatening band below and by the synergy structure rewarding calcium.
        // atropine_05mg looks tempting for the bradycardia but does NOT work on
        // hyperkalaemic bradycardia (the block is metabolic, not vagal) — listed so the
        // engine penalises chasing the rate instead of treating the potassium.
        contraindicatedTreatments: ['atropine_05mg'],
        deteriorationRate: 'fast',
        synergies: [
          {
            // REQUIRES calcium_chloride: without membrane stabilisation first, the
            // shift agents alone leave the myocardium unprotected. Modest floor synergy
            // so giving calcium at all is rewarded.
            treatments: ['calcium_chloride', 'nebulizer_salbutamol'],
            synergyMultiplier: 1.5,
            description:
              'Calcium stabilises the myocardium while salbutamol drives K+ intracellularly — stabilise THEN shift.',
          },
          {
            // Tier up — full pre-hospital shift bundle on top of stabilisation.
            treatments: ['calcium_chloride', 'nebulizer_salbutamol', 'sodium_bicarbonate'],
            synergyMultiplier: 1.9,
            description:
              'Membrane stabilisation (Ca) + dual K+ shift (β2-agonist + bicarbonate) — the definitive pre-hospital combination short of insulin/dextrose.',
          },
          {
            // High-dose β2 route for the peri-arrest patient who already has IV access.
            treatments: ['calcium_chloride', 'salbutamol_iv', 'sodium_bicarbonate'],
            synergyMultiplier: 1.9,
            description:
              'IV salbutamol gives a stronger intracellular K+ shift than nebulised when the patient is peri-arrest and already cannulated.',
          },
        ],
        positioningEffects: [],
        responseCeilings: {
          // Pre-hospital therapy stabilises and shifts but cannot REMOVE potassium
          // (needs dialysis/definitive care), so even the full bundle is capped < full.
          partialCeiling: 45,
          fullCeiling: 80,
          timeToResponse: 60,
        },
      },
      {
        severity: 'life-threatening',
        description:
          'Life-threatening hyperkalaemia — sine-wave pattern degenerating to VF/asystole, or hyperkalaemic cardiac arrest. Calcium chloride STAT.',
        typicalVitals: {
          pulse: [0, 40],
          respiration: [0, 30],
          spo2: [55, 90],
          bpSystolic: [0, 90],
          gcs: [3, 12],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'absent',
          additionalSounds: [
            'Sine-wave QRS-T fusion on monitor',
            'No palpable pulse / agonal',
            'Hyperkalaemic peri-arrest',
          ],
          description:
            'Monitor shows a sine-wave pattern (QRS-T fusion) deteriorating toward VF/asystole. This is hyperkalaemic cardiac arrest — give calcium chloride immediately.',
        },
        // Calcium is the single most time-critical drug; in arrest the shift agents and
        // bicarbonate continue while resuscitation proceeds. CPR/defib for the arrest itself.
        essentialTreatments: ['calcium_chloride', 'sodium_bicarbonate', 'iv_access', 'cpr'],
        optimalTreatments: [
          'calcium_chloride',
          'calcium_gluconate',
          'sodium_bicarbonate',
          'salbutamol_iv',
          'insulin_actrapid',
          'dextrose_10',
          'iv_access',
          'io_access',
          'cpr',
          'defibrillation',
          'oxygen_nonrebreather',
        ],
        beneficialTreatments: ['io_access', 'calcium_gluconate', 'salbutamol_iv', 'dextrose_10', 'defibrillation', 'oxygen_nonrebreather'],
        // Fluids ARE harmful here: this band represents the anuric/fluid-overloaded
        // hyperkalaemic arrest (litfl-003 archetype) — a large bolus worsens pulmonary
        // oedema and does nothing for the potassium. atropine is again ineffective for a
        // metabolic block. Both are real catalog IDs and genuinely the wrong move.
        contraindicatedTreatments: ['fluids_1000ml', 'fluids_500ml', 'atropine_05mg'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            // REQUIRES calcium_chloride — in hyperkalaemic arrest, calcium is what makes
            // the rest survivable; rewarded strongly when paired with effective CPR.
            treatments: ['calcium_chloride', 'cpr'],
            synergyMultiplier: 1.8,
            description:
              'Calcium chloride is the specific antidote in hyperkalaemic arrest — without it CPR/defib alone rarely achieve ROSC.',
          },
          {
            treatments: ['calcium_chloride', 'sodium_bicarbonate', 'cpr'],
            synergyMultiplier: 2.1,
            description:
              'Membrane stabilisation + bicarbonate shift during high-quality CPR — full hyperkalaemic arrest bundle.',
          },
          {
            treatments: ['calcium_chloride', 'sodium_bicarbonate', 'salbutamol_iv', 'cpr'],
            synergyMultiplier: 2.3,
            description:
              'Maximal pre-hospital hyperkalaemia regimen during arrest: stabilise (Ca) + dual shift (bicarb + IV β2) + CPR.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: 0,
            description: 'Patient must be supine on a hard surface for effective CPR.',
          },
        ],
        responseCeilings: {
          // Hyperkalaemic arrest is recoverable if calcium is given, but pre-hospital
          // ceiling is limited without dialysis.
          partialCeiling: 20,
          fullCeiling: 70,
          timeToResponse: 30,
        },
      },
    ],
  },


// ===========================================================================

// ============================================================================
// PASTE-READY TreatmentProtocol LITERALS
// Insert each object into the TREATMENT_PROTOCOLS array in
//   src/data/treatmentProtocols.ts
// (anywhere before the closing `];` at line ~1591).
//
// All treatment IDs grep-verified against src/data/enhancedTreatmentEffects.ts
// and src/data/treatmentEffects.ts (each resolves to exactly one catalog entry).
// No new drugs/treatments required.
// ============================================================================


  // ===========================================================================
  // CARDIAC TAMPONADE (OBSTRUCTIVE SHOCK — BECK'S TRIAD)
  // ---------------------------------------------------------------------------
  // conditionKey: 'tamponade'   →   case trauma-004 (Penetrating Chest Trauma)
  //
  // ROUTING NOTE: trauma-004 currently has subcategory 'chest-trauma', so
  // findProtocol() will NOT reach this protocol. Set the case subcategory to
  // 'tamponade' (preferred — also activates the tamponade timeline and the
  // muffled-heart-sounds branch in clinicalSounds.ts), OR add a route. See
  // trauma.notes.md.
  //
  // Single severity level (life-threatening) — mirrors tension-PTX pattern.
  // Teaching core: this is OBSTRUCTIVE shock. The clot/effusion mechanically
  // throttles diastolic filling. The ONLY definitive fix is decompression
  // (pericardiocentesis). A preload bridge (small fluid bolus) + rapid transport
  // buys time. Two genuinely dangerous errors are modelled as contraindicated:
  //   1. needle_decompression — wrong diagnosis (that's for tension PTX); a
  //      needle in the chest here does nothing for the pericardium, wastes the
  //      one intervention window, and risks iatrogenic injury.
  //   2. gtn_spray / morphine_5mg — both drop preload (venodilation). In a
  //      filling-limited heart, dropping preload collapses an already-critical
  //      stroke volume → accelerates PEA.
  // ===========================================================================
  {
    condition: 'tamponade',
    conditionName: 'Cardiac Tamponade (Obstructive Shock)',
    severityLevels: [
      {
        severity: 'life-threatening',
        description: 'Cardiac tamponade — Beck\'s triad (muffled heart sounds, distended neck veins, hypotension), narrow pulse pressure, pulsus paradoxus. Penetrating precordial wound. Obstructive shock from impaired diastolic filling.',
        typicalVitals: {
          pulse: [120, 160],
          respiration: [28, 40],
          spo2: [82, 92],
          bpSystolic: [60, 90],
          gcs: [9, 14],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'muffled',
          additionalSounds: ['Muffled/distant heart sounds', 'Distended neck veins (raised JVP)', 'Narrow pulse pressure', 'Pulsus paradoxus', 'Beck\'s triad'],
          description: 'Clear breath sounds bilaterally — the lungs are NOT the problem. Heart sounds muffled and distant. JVP elevated despite hypotension. This is obstructive shock — the pericardium is tamponading the heart.',
        },
        // Essential = the package that keeps this patient alive to definitive care:
        // IV access, a preload-supporting bolus, and rapid transport. NRB for the
        // hypoxia of shock. Pericardiocentesis is the definitive decompression and
        // is also flagged essential (it is THE fix when in scope / trained).
        essentialTreatments: ['iv_access', 'fluids_250ml', 'oxygen_nonrebreather', 'pericardiocentesis'],
        optimalTreatments: ['iv_access', 'fluids_250ml', 'oxygen_nonrebreather', 'pericardiocentesis', 'fluids_500ml', 'supine_position'],
        beneficialTreatments: ['fluids_500ml', 'supine_position', 'leg_elevation', 'io_access', 'reassurance'],
        // REAL harm — engine applies genuine vital penalties:
        //  needle_decompression: misdiagnosis, wastes the intervention window
        //  gtn_spray / morphine_5mg: venodilation drops preload in a filling-limited heart
        contraindicatedTreatments: ['needle_decompression', 'gtn_spray', 'morphine_5mg'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['iv_access', 'fluids_250ml'],
            synergyMultiplier: 1.4,
            description: 'A cautious preload bolus transiently improves diastolic filling against the tamponade — a temporising bridge, not a fix. Order matters: get access, then fill.',
          },
          {
            treatments: ['fluids_250ml', 'pericardiocentesis'],
            synergyMultiplier: 2.6,
            description: 'Pericardiocentesis relieves the obstruction; the preload bolus then has somewhere to go. Decompression is the definitive step — fluids alone cannot overcome mechanical compression.',
          },
          {
            treatments: ['iv_access', 'fluids_250ml', 'oxygen_nonrebreather', 'pericardiocentesis'],
            synergyMultiplier: 2.9,
            description: 'Full tamponade package: access + preload bridge + oxygenation + pericardial decompression. Maximal achievable pre-surgical resuscitation of obstructive shock.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: -5,
            description: 'Supine maintains venous return to a preload-dependent heart. Avoid sitting fully upright — it further reduces filling.',
          },
          {
            positionId: 'leg_elevation',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: -8,
            description: 'Passive leg raise augments preload — a temporising measure in obstructive shock until decompression.',
          },
        ],
        responseCeilings: {
          // Almost nothing meaningfully reverses tamponade without decompression —
          // a preload bridge only buys minutes. Mirrors tension-PTX's low partial
          // ceiling / high full ceiling shape.
          partialCeiling: 25,
          fullCeiling: 88,
          timeToResponse: 90, // pericardiocentesis effect is rapid once performed
        },
      },
    ],
  },


  // ===========================================================================
  // ABDOMINAL TRAUMA (HAEMORRHAGIC SHOCK — NON-COMPRESSIBLE)
  // ---------------------------------------------------------------------------
  // conditionKey: 'abdominal-trauma'   →   case trauma-007 (Splenic Laceration)
  // Direct findProtocol match (case subcategory is already 'abdominal-trauma').
  //
  // Mirrors the multi-trauma haemorrhagic-shock model. Key difference vs limb
  // trauma: the bleeding is INTERNAL and NOT externally compressible — no
  // tourniquet target. Management is permissive hypotension + TxA + rapid
  // surgical transfer. 'bleeding_control' here represents the broader haemorrhage-
  // control bundle (pressure on any external wounds, packaging, minimal handling)
  // and is the prerequisite that unlocks fluid effectiveness in the pathology
  // modifiers already present for 'abdominal-trauma'.
  //
  // REAL harm:
  //   fluids_1000ml — aggressive crystalloid dilutes clotting factors and pops
  //                   the soft clot ("permissive hypotension" target is SBP 80-90)
  //   morphine_5mg  — at scale, venodilation/hypotension in a shocked patient AND
  //                   masks the evolving abdominal exam. Fentanyl is the trauma-
  //                   friendly alternative (shorter, less histamine/hypotension).
  // ===========================================================================
  {
    condition: 'abdominal-trauma',
    conditionName: 'Abdominal Trauma / Intra-abdominal Haemorrhage',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Class II haemorrhage from solid-organ (e.g. splenic) injury — compensating, tachycardic, abdominal guarding/tenderness, SBP maintained but pulse pressure narrowing.',
        typicalVitals: {
          pulse: [100, 125],
          respiration: [20, 28],
          spo2: [93, 98],
          bpSystolic: [95, 115],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Abdominal guarding/tenderness', 'Tachycardic — compensating', 'Cool peripheries', 'Splinting respirations'],
          description: 'Clear lungs bilaterally. Tachycardic. Abdominal tenderness with guarding — concealed intra-abdominal haemorrhage. Compensated shock.',
        },
        essentialTreatments: ['bleeding_control', 'iv_access', 'txa_1g', 'fluids_250ml', 'oxygen_nonrebreather'],
        optimalTreatments: ['bleeding_control', 'iv_access', 'txa_1g', 'fluids_250ml', 'oxygen_nonrebreather', 'fentanyl_50mcg', 'warming_blanket'],
        beneficialTreatments: ['fentanyl_50mcg', 'warming_blanket', 'supine_position', 'reassurance'],
        // fluids_1000ml harmful even at this stage — uncontrolled internal bleed,
        // permissive-hypotension target. morphine at scale masks the exam + hypotension.
        contraindicatedTreatments: ['fluids_1000ml', 'morphine_5mg'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['bleeding_control', 'fluids_250ml'],
            synergyMultiplier: 1.4,
            description: 'Haemorrhage-control bundle + judicious small-volume bolus: support perfusion without diluting clot. Permissive hypotension (SBP 80-90).',
          },
          {
            treatments: ['bleeding_control', 'fluids_250ml', 'txa_1g'],
            synergyMultiplier: 1.8,
            description: 'Damage-control trio: haemorrhage control + permissive fluid + early anti-fibrinolytic (TxA within 3h reduces trauma mortality, CRASH-2).',
          },
          {
            treatments: ['bleeding_control', 'fluids_250ml', 'txa_1g', 'warming_blanket'],
            synergyMultiplier: 2.0,
            description: 'Full pre-hospital damage-control resuscitation: control + permissive volume + TxA + warming defends against the lethal triad (hypothermia, coagulopathy, acidosis).',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -5,
            description: 'Supine for trauma assessment and to maintain central perfusion.',
          },
          {
            positionId: 'leg_elevation',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: -8,
            description: 'Passive leg raise transiently augments venous return in hypovolaemia.',
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
        description: 'Class III-IV haemorrhage — decompensated, hypotensive, rigid/peritonitic abdomen, altered mental status, rapid exsanguination risk. Surgery is the definitive treatment; pre-hospital goal is permissive-hypotension resuscitation + rapid transfer.',
        typicalVitals: {
          pulse: [125, 160],
          respiration: [28, 40],
          spo2: [85, 94],
          bpSystolic: [60, 90],
          gcs: [10, 14],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Rigid/peritonitic abdomen', 'Profound tachycardia', 'Cold, clammy, pale', 'Thready pulse', 'Agitation/confusion'],
          description: 'Clear lungs. Severely tachycardic. Rigid abdomen with rebound — decompensated intra-abdominal haemorrhage.',
        },
        essentialTreatments: ['bleeding_control', 'iv_access', 'txa_1g', 'fluids_250ml', 'oxygen_nonrebreather'],
        optimalTreatments: ['bleeding_control', 'iv_access', 'txa_1g', 'fluids_250ml', 'oxygen_nonrebreather', 'fluids_500ml', 'warming_blanket', 'leg_elevation'],
        beneficialTreatments: ['fluids_500ml', 'warming_blanket', 'leg_elevation', 'io_access', 'fentanyl_50mcg'],
        // fluids_1000ml stays contraindicated even decompensated — titrate small
        // boluses to a radial pulse / SBP ~80-90, never aggressive crystalloid.
        contraindicatedTreatments: ['fluids_1000ml', 'morphine_5mg'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['bleeding_control', 'fluids_250ml', 'txa_1g'],
            synergyMultiplier: 1.9,
            description: 'Permissive-hypotension damage control: small titrated boluses + TxA + haemorrhage-control bundle. Avoid clot disruption from over-resuscitation.',
          },
          {
            treatments: ['bleeding_control', 'fluids_250ml', 'txa_1g', 'warming_blanket'],
            synergyMultiplier: 2.2,
            description: 'Full damage-control resuscitation defending the lethal triad — the ceiling intervention pre-hospital. Definitive care is the operating theatre.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'leg_elevation',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: -12,
            description: 'Passive leg raise provides autotransfusion of ~300ml to central circulation — a bridge while expediting transfer.',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -5,
            description: 'Supine maintains central perfusion in decompensated shock.',
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
  // PELVIC FRACTURE (HAEMORRHAGIC SHOCK — RETROPERITONEAL)
  // ---------------------------------------------------------------------------
  // conditionKey: 'pelvic-fracture'   →   case trauma-008 (Pelvic Fracture w/ shock)
  // Direct findProtocol match (case subcategory is already 'pelvic-fracture').
  //
  // Mirrors multi-trauma haemorrhagic-shock model, with the pelvic binder as the
  // signature mechanical intervention: an unstable pelvic ring can lose 2-4 units
  // into the retroperitoneum, which is non-compressible externally. The binder
  // reduces ring volume and tamponades venous bleeding — it is the pelvic
  // equivalent of a tourniquet and belongs in essential. 'bleeding_control'
  // represents the wider haemorrhage-control bundle (it's also the prerequisite
  // that unlocks fluid effectiveness in the existing 'pelvic-fracture' modifiers).
  //
  // REAL harm:
  //   fluids_1000ml — aggressive crystalloid pops the retroperitoneal clot and
  //                   dilutes clotting factors (permissive hypotension target)
  //   morphine_5mg  — at scale, hypotension in shock. Fentanyl preferred for the
  //                   (often severe) pelvic pain — already favoured in the
  //                   'pelvic-fracture' pathology modifiers.
  // ===========================================================================
  {
    condition: 'pelvic-fracture',
    conditionName: 'Pelvic Fracture / Retroperitoneal Haemorrhage',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Pelvic ring injury, compensating — tachycardic, pelvic pain, perineal/suprapubic bruising, mechanical instability. Occult retroperitoneal haemorrhage; bind early before it decompensates.',
        typicalVitals: {
          pulse: [100, 125],
          respiration: [20, 28],
          spo2: [93, 98],
          bpSystolic: [95, 115],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Pelvic instability/pain', 'Perineal or suprapubic bruising', 'Tachycardic — compensating', 'Leg-length discrepancy / external rotation'],
          description: 'Clear lungs bilaterally. Tachycardic. Pelvic pain with instability — suspect occult retroperitoneal haemorrhage. Apply binder early.',
        },
        essentialTreatments: ['pelvic_binder', 'bleeding_control', 'iv_access', 'txa_1g', 'fluids_250ml', 'oxygen_nonrebreather'],
        optimalTreatments: ['pelvic_binder', 'bleeding_control', 'iv_access', 'txa_1g', 'fluids_250ml', 'oxygen_nonrebreather', 'fentanyl_50mcg', 'warming_blanket'],
        beneficialTreatments: ['fentanyl_50mcg', 'warming_blanket', 'supine_position', 'reassurance'],
        contraindicatedTreatments: ['fluids_1000ml', 'morphine_5mg'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['pelvic_binder', 'txa_1g'],
            synergyMultiplier: 1.6,
            description: 'Mechanical ring closure (reduces pelvic volume, tamponades venous bleeding) + early anti-fibrinolytic — the two highest-yield pelvic-haemorrhage moves.',
          },
          {
            treatments: ['pelvic_binder', 'bleeding_control', 'fluids_250ml', 'txa_1g'],
            synergyMultiplier: 1.9,
            description: 'Pelvic damage control: binder + haemorrhage-control bundle + permissive small-volume fluid + TxA. Permissive hypotension (SBP 80-90) until surgical/IR control.',
          },
          {
            treatments: ['pelvic_binder', 'bleeding_control', 'fluids_250ml', 'txa_1g', 'warming_blanket'],
            synergyMultiplier: 2.1,
            description: 'Full pre-hospital pelvic resuscitation defending the lethal triad: binder + control + permissive volume + TxA + warming.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -5,
            description: 'Supine with legs neutral — do NOT log-roll or frog-leg an unstable pelvis; movement disrupts clot.',
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
        description: 'Decompensated pelvic haemorrhage (Class III-IV) — hypotensive, cold/clammy, altered mental status, exsanguination risk into retroperitoneum. Binder + permissive-hypotension resuscitation + rapid transfer to surgery/IR.',
        typicalVitals: {
          pulse: [125, 160],
          respiration: [26, 38],
          spo2: [85, 94],
          bpSystolic: [60, 90],
          gcs: [10, 14],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Profound tachycardia', 'Cold, clammy, pale', 'Thready/absent distal pulses', 'Expanding flank/perineal haematoma', 'Confusion'],
          description: 'Clear lungs. Severely tachycardic, hypotensive. Decompensated retroperitoneal haemorrhage — binder NOW, titrated volume, expedite transfer.',
        },
        essentialTreatments: ['pelvic_binder', 'bleeding_control', 'iv_access', 'txa_1g', 'fluids_250ml', 'oxygen_nonrebreather'],
        optimalTreatments: ['pelvic_binder', 'bleeding_control', 'iv_access', 'txa_1g', 'fluids_250ml', 'oxygen_nonrebreather', 'fluids_500ml', 'warming_blanket', 'leg_elevation'],
        beneficialTreatments: ['fluids_500ml', 'warming_blanket', 'leg_elevation', 'io_access', 'fentanyl_50mcg'],
        contraindicatedTreatments: ['fluids_1000ml', 'morphine_5mg'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['pelvic_binder', 'fluids_250ml', 'txa_1g'],
            synergyMultiplier: 1.9,
            description: 'Ring closure + permissive small-volume fluid + TxA. The binder is the pelvic tourniquet equivalent — without it, fluid is filling a leaking pelvis.',
          },
          {
            treatments: ['pelvic_binder', 'bleeding_control', 'fluids_250ml', 'txa_1g', 'warming_blanket'],
            synergyMultiplier: 2.2,
            description: 'Full damage-control resuscitation of decompensated pelvic haemorrhage — ceiling pre-hospital intervention. Definitive care is surgery / angioembolisation.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'leg_elevation',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: -12,
            description: 'Passive leg raise for autotransfusion — keep the pelvis still and binder in place.',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -5,
            description: 'Supine, pelvis neutral and immobilised; avoid any movement that disrupts retroperitoneal clot.',
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
  // HEAT STROKE / HEAT ILLNESS
  // ===========================================================================
  {
    condition: 'heat-stroke',
    conditionName: 'Heat Stroke / Heat Illness',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Heat exhaustion — core temp 38-40°C, profuse sweating, weak/tachycardic, CNS INTACT (GCS 15)',
        typicalVitals: {
          pulse: [100, 120],
          respiration: [20, 26],
          spo2: [95, 99],
          bpSystolic: [95, 115],
          gcs: [14, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Profuse sweating', 'Mild tachypnoea', 'Weak thready pulse', 'No CNS dysfunction'],
          description: 'Clear lungs bilaterally. Tachycardic. Patient sweating profusely but alert — heat exhaustion, NOT heat stroke (no CNS involvement).',
        },
        // active_cooling is the definitive Rx even in exhaustion; fluids correct volume depletion.
        essentialTreatments: ['active_cooling', 'iv_access', 'fluids_500ml'],
        optimalTreatments: ['active_cooling', 'iv_access', 'fluids_500ml', 'oxygen_nasal', 'supine_position', 'reassurance'],
        beneficialTreatments: ['oxygen_nasal', 'supine_position', 'reassurance', 'fluids_1000ml'],
        // Antipyretics do NOT work in heat illness — hyperthermia here is NOT pyrogen/hypothalamic-set-point mediated.
        // Giving them wastes time and falsely reassures; engine must ZERO their antipyretic effect (see notes.md).
        contraindicatedTreatments: ['paracetamol_oral', 'paracetamol_iv', 'ibuprofen_oral'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['active_cooling', 'fluids_500ml'],
            synergyMultiplier: 1.5,
            description: 'Active cooling halts the heat load while volume replacement corrects sweat-driven dehydration — the two pillars of heat illness',
          },
          {
            treatments: ['active_cooling', 'fluids_500ml', 'iv_access'],
            synergyMultiplier: 1.6,
            description: 'Full heat-exhaustion protocol — IV route allows rapid cooled-fluid resuscitation',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 1,
            hrChange: -8,
            description: 'Supine with leg elevation aids venous return in the volume-deplete, vasodilated heat patient',
          },
        ],
        responseCeilings: {
          partialCeiling: 70,
          fullCeiling: 100,
          timeToResponse: 300,
        },
      },
      {
        severity: 'life-threatening',
        description: 'Heat stroke — core temp >40°C WITH CNS dysfunction (confusion/agitation/coma), anhidrosis, hypotension. A true emergency.',
        typicalVitals: {
          pulse: [130, 170],
          respiration: [26, 36],
          spo2: [92, 97],
          bpSystolic: [70, 95],
          gcs: [8, 13],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Hot DRY skin (anhidrosis)', 'Confusion / agitation', 'Bounding then thready pulse', 'Muscle rigidity', 'Tachypnoea from metabolic acidosis'],
          description: 'Clear lungs but tachypnoeic. Profoundly tachycardic, hypotensive. Hot dry skin with altered consciousness — CLASSIC HEAT STROKE. Cool aggressively NOW.',
        },
        // Definitive Rx = aggressive active_cooling. Airway/O2 for the obtunded patient; cooled fluids for distributive/volume-deplete shock.
        // midazolam_5mg only if heat-induced seizures occur.
        essentialTreatments: ['active_cooling', 'oxygen_nonrebreather', 'iv_access', 'fluids_1000ml', 'airway_open'],
        optimalTreatments: ['active_cooling', 'oxygen_nonrebreather', 'iv_access', 'fluids_1000ml', 'airway_open', 'suction', 'midazolam_5mg', 'intubation'],
        beneficialTreatments: ['midazolam_5mg', 'suction', 'intubation', 'supine_position', 'io_access'],
        // Antipyretics are INEFFECTIVE and HARMFUL here — no pyrogenic mechanism to block, hepatotoxicity risk in a patient already developing
        // heat-related hepatic injury/coagulopathy. They waste the cooling window. Engine must zero antipyretic effect (see notes.md).
        contraindicatedTreatments: ['paracetamol_oral', 'paracetamol_iv', 'ibuprofen_oral'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['active_cooling', 'fluids_1000ml'],
            synergyMultiplier: 1.8,
            description: 'Aggressive cooling (ice packs + cooled IV fluid) is the ONLY definitive therapy — every minute above 40°C accrues organ damage',
          },
          {
            treatments: ['active_cooling', 'fluids_1000ml', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.0,
            description: 'Cooling + volume + oxygenation addresses hyperthermia, distributive shock, and the high metabolic O2 demand together',
          },
          {
            treatments: ['active_cooling', 'oxygen_nonrebreather', 'airway_open', 'iv_access', 'fluids_1000ml'],
            synergyMultiplier: 2.3,
            description: 'Full heat-stroke resuscitation bundle — cool, protect the obtunded airway, oxygenate, and restore circulating volume',
          },
          {
            treatments: ['midazolam_5mg', 'active_cooling'],
            synergyMultiplier: 1.4,
            description: 'Benzodiazepine terminates heat-induced seizures AND reduces shivering/heat generation, augmenting cooling',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -5,
            description: 'Supine improves cerebral and central perfusion in the hypotensive, obtunded heat-stroke patient',
          },
        ],
        responseCeilings: {
          partialCeiling: 30,
          fullCeiling: 85,
          timeToResponse: 180,
        },
      },
    ],
  },

  // ===========================================================================
  // DROWNING (ASPHYXIAL ARREST)
  // ===========================================================================
  {
    condition: 'drowning',
    conditionName: 'Drowning (Asphyxial)',
    severityLevels: [
      {
        severity: 'severe',
        description: 'Drowning, pre-arrest — hypoxic, bradycardic, peri-arrest. This is an ASPHYXIAL problem: ventilation/oxygenation come FIRST.',
        typicalVitals: {
          pulse: [40, 70],
          respiration: [0, 8],
          spo2: [60, 82],
          bpSystolic: [70, 95],
          gcs: [3, 9],
        },
        initialSounds: {
          leftLung: 'crackles-coarse',
          rightLung: 'crackles-coarse',
          heartSound: 'bradycardic',
          additionalSounds: ['Water/vomit in airway', 'Coarse crackles (aspirated water)', 'Cyanosis', 'Apnoea or agonal gasps', 'Bradycardia from hypoxia'],
          description: 'Coarse crackles bilaterally from aspirated water. Apnoeic/agonal with profound hypoxia and hypoxic bradycardia. Clear the airway and VENTILATE — hypoxia is the killer.',
        },
        // ASPHYXIAL pattern — airway + oxygenation FIRST. Clear airway, 5 rescue breaths, high-flow O2, assisted ventilation, then definitive airway.
        essentialTreatments: ['airway_open', 'suction', 'oxygen_nonrebreather', 'bvm_ventilation'],
        optimalTreatments: ['airway_open', 'suction', 'oxygen_nonrebreather', 'bvm_ventilation', 'intubation', 'iv_access', 'recovery_position'],
        beneficialTreatments: ['intubation', 'iv_access', 'recovery_position', 'warming_blanket'],
        contraindicatedTreatments: [],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['airway_open', 'suction', 'bvm_ventilation'],
            synergyMultiplier: 2.0,
            description: 'Clear the airway of water/vomit, then ventilate — in drowning, reversing hypoxia is the single highest-yield action. Order matters: airway BEFORE ventilation',
          },
          {
            treatments: ['airway_open', 'suction', 'bvm_ventilation', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.4,
            description: 'Full asphyxial-rescue bundle: open + clear airway, ventilate with high-flow O2 — corrects the hypoxia driving the bradycardia',
          },
          {
            treatments: ['bvm_ventilation', 'intubation'],
            synergyMultiplier: 1.6,
            description: 'Early definitive airway protects against ongoing aspiration and enables reliable oxygenation in the drowned lung',
          },
        ],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 2,
            rrReduction: 0,
            hrChange: 0,
            description: 'Recovery position aids drainage of water/secretions if spontaneous breathing returns and the airway is otherwise unprotected',
          },
        ],
        responseCeilings: {
          partialCeiling: 35,
          fullCeiling: 85,
          timeToResponse: 120,
        },
      },
      {
        severity: 'life-threatening',
        description: 'Drowning in cardiac arrest (often hypothermic) — asphyxial arrest. 5 rescue breaths BEFORE compressions, THEN standard arrest. If core temp <30°C, drugs are withheld.',
        typicalVitals: {
          pulse: [0, 0],
          respiration: [0, 0],
          spo2: [0, 60],
          bpSystolic: [0, 0],
          gcs: [3, 3],
        },
        initialSounds: {
          leftLung: 'crackles-coarse',
          rightLung: 'crackles-coarse',
          heartSound: 'absent',
          additionalSounds: ['No pulse', 'Apnoeic', 'Water in airway', 'Cold/wet — likely hypothermic', 'Coarse crackles after first ventilations'],
          description: 'No pulse, no breathing. Asphyxial arrest from drowning. Give 5 rescue breaths FIRST, then begin compressions. Cold patient — anticipate hypothermic arrest physiology.',
        },
        // Asphyxial arrest: oxygenate/ventilate FIRST (5 rescue breaths), THEN standard arrest algorithm.
        essentialTreatments: ['airway_open', 'suction', 'bvm_ventilation', 'oxygen_nonrebreather', 'cpr', 'defibrillation'],
        optimalTreatments: ['airway_open', 'suction', 'bvm_ventilation', 'oxygen_nonrebreather', 'cpr', 'defibrillation', 'intubation', 'iv_access', 'adrenaline_1mg', 'warming_blanket'],
        beneficialTreatments: ['intubation', 'iv_access', 'io_access', 'warming_blanket'],
        // No classic pharmacological contraindication. In severe hypothermia (<30°C) the ENGINE already withholds/deprioritises drugs
        // (adrenaline_1mg etc. — see hypothermia PathologyModifier) — do NOT list drugs as contraindicated here.
        contraindicatedTreatments: [],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['airway_open', 'bvm_ventilation', 'cpr'],
            synergyMultiplier: 1.8,
            description: 'Asphyxial arrest demands ventilation alongside compressions — give 5 rescue breaths FIRST, then 30:2. Oxygenation is the priority over early drugs',
          },
          {
            treatments: ['cpr', 'defibrillation'],
            synergyMultiplier: 1.6,
            description: 'CPR maintains coronary perfusion between shocks if a shockable rhythm is present (less common in primary asphyxial arrest)',
          },
          {
            treatments: ['airway_open', 'suction', 'bvm_ventilation', 'oxygen_nonrebreather', 'cpr'],
            synergyMultiplier: 2.2,
            description: 'Full drowning-arrest bundle: clear airway, ventilate with high-flow O2, compress — reverse hypoxia while perfusing',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: 0,
            description: 'Patient must be supine on a firm surface for effective compressions',
          },
        ],
        responseCeilings: {
          partialCeiling: 15,
          fullCeiling: 75,
          timeToResponse: 120,
        },
      },
    ],
  },

  // ===========================================================================
  // ECLAMPSIA
  // ===========================================================================
  {
    condition: 'eclampsia',
    conditionName: 'Eclampsia',
    severityLevels: [
      {
        severity: 'life-threatening',
        description: 'Eclamptic seizure in pregnancy (>20/40) — generalized seizure on a background of pre-eclampsia. Magnesium is first-line (NOT a benzo); BP control + aortocaval decompression are core.',
        typicalVitals: {
          pulse: [90, 130],
          respiration: [8, 22],
          spo2: [88, 96],
          bpSystolic: [150, 210],
          gcs: [3, 13],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Generalized tonic-clonic seizure', 'Facial/peripheral oedema', 'Hypertension', 'Post-ictal drowsiness', 'Hyper-reflexia/clonus'],
          description: 'Clear lungs (aspiration risk during seizure). Hypertensive and tachycardic. Seizing pregnant patient with oedema — eclampsia until proven otherwise. Give magnesium, control BP, tilt left.',
        },
        // magnesium_2g = first-line for seizure control AND prophylaxis (NOT a benzodiazepine).
        // labetalol_20mg = BP control. left_lateral_tilt = relieve aortocaval compression (gravid uterus on IVC/aorta).
        // calcium_chloride is the ANTIDOTE to magnesium toxicity (model as the reversal — see notes.md), so it is ESSENTIAL to have available.
        essentialTreatments: ['magnesium_2g', 'labetalol_20mg', 'left_lateral_tilt', 'iv_access', 'airway_open', 'oxygen_nonrebreather'],
        optimalTreatments: ['magnesium_2g', 'labetalol_20mg', 'left_lateral_tilt', 'iv_access', 'airway_open', 'oxygen_nonrebreather', 'suction', 'calcium_chloride', 'recovery_position'],
        beneficialTreatments: ['suction', 'recovery_position', 'calcium_chloride', 'fluids_250ml'],
        // diltiazem_20mg (and other negative-inotrope CCBs) are CONTRAINDICATED: they potentiate magnesium-induced neuromuscular block / hypotension
        // and are not the agents of choice for eclamptic hypertension. NOTE: benzodiazepines (midazolam_5mg) are NOT listed here — they are
        // second-line (magnesium first), NOT harmful, so they are intentionally omitted from contraindications.
        contraindicatedTreatments: ['diltiazem_20mg'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['magnesium_2g', 'left_lateral_tilt'],
            synergyMultiplier: 1.7,
            description: 'Magnesium controls and prevents seizures while left lateral tilt relieves aortocaval compression — restoring venous return and uteroplacental flow',
          },
          {
            treatments: ['magnesium_2g', 'labetalol_20mg'],
            synergyMultiplier: 1.9,
            description: 'Magnesium (seizure control + prophylaxis) plus labetalol (controlled BP reduction) is the definitive eclampsia pairing',
          },
          {
            treatments: ['magnesium_2g', 'labetalol_20mg', 'left_lateral_tilt', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.2,
            description: 'Full eclampsia bundle: seizure control, BP control, aortocaval decompression, and oxygenation protect both mother and fetus',
          },
          {
            treatments: ['airway_open', 'suction', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.5,
            description: 'Airway protection and oxygenation cover the post-ictal/aspiration-risk period',
          },
        ],
        positioningEffects: [
          {
            positionId: 'left_lateral_tilt',
            spo2Bonus: 3,
            rrReduction: 1,
            hrChange: -8,
            description: 'Left lateral tilt (15-30°) displaces the gravid uterus off the IVC/aorta — relieves aortocaval compression, improving maternal cardiac output and fetal perfusion',
          },
          {
            positionId: 'recovery_position',
            spo2Bonus: 2,
            rrReduction: 1,
            hrChange: -3,
            description: 'Left-lateral recovery position protects the post-ictal airway AND provides aortocaval decompression in pregnancy',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: -4,
            rrReduction: -1,
            hrChange: 8,
            description: 'DANGEROUS in late pregnancy: supine allows the gravid uterus to compress the IVC, dropping venous return, maternal BP, and fetal perfusion (supine hypotension)',
          },
        ],
        responseCeilings: {
          partialCeiling: 35,
          fullCeiling: 85,
          timeToResponse: 240,
        },
      },
    ],
  },

  // ============================================================================
  // SUPRAVENTRICULAR TACHYCARDIA (SVT)
  // ============================================================================
  {
    condition: 'svt',
    conditionName: 'Supraventricular Tachycardia',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Stable narrow-complex SVT — regular rate ~150–220, palpitations/lightheadedness, no adverse features',
        typicalVitals: {
          pulse: [150, 220],
          respiration: [18, 26],
          spo2: [95, 99],
          bpSystolic: [95, 140],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Regular, very rapid pulse (~150–220)', 'Palpitations', 'Lightheadedness', 'Mild dyspnoea'],
          description: 'Clear lungs bilaterally. Fast but REGULAR tachycardia (distinguishes SVT from AF). Patient anxious but perfusing.',
        },
        // Vagal manoeuvres (Valsalva / modified Valsalva) are first-line but have
        // no catalog treatment id, so they live in the description, not the array.
        // Adenosine is the essential pharmacological step: 6 mg then 12 mg.
        essentialTreatments: ['iv_access', 'adenosine_6mg'],
        optimalTreatments: ['iv_access', 'adenosine_6mg', 'adenosine_12mg', 'oxygen_nasal', 'fowlers_position'],
        beneficialTreatments: ['oxygen_nasal', 'fowlers_position', 'reassurance'],
        // diltiazem_20mg / metoprolol_5mg: dangerous if the rhythm is actually
        // pre-excited (WPW) or wide-complex — AV-nodal block can accelerate the
        // accessory pathway and precipitate VF. gtn_spray: no role, drops BP.
        // (verapamil is the classic exam answer but has no catalog id; the two
        // AV-nodal blockers above carry the same teaching + real harm.)
        contraindicatedTreatments: ['diltiazem_20mg', 'metoprolol_5mg', 'gtn_spray'],
        deteriorationRate: 'slow',
        synergies: [
          {
            treatments: ['iv_access', 'adenosine_6mg'],
            synergyMultiplier: 1.6,
            description: 'IV access + adenosine 6 mg rapid push with saline flush: first-line chemical cardioversion for stable SVT after vagal manoeuvres fail',
          },
          {
            treatments: ['iv_access', 'adenosine_6mg', 'adenosine_12mg'],
            synergyMultiplier: 1.9,
            description: 'Step-up protocol: 6 mg then 12 mg if no conversion — the standard escalating adenosine regimen',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: 0,
            description: 'Semi-upright comfort position; does not itself convert the rhythm',
          },
        ],
        responseCeilings: {
          partialCeiling: 55,
          fullCeiling: 90,
          timeToResponse: 120, // adenosine conversion is rapid once given correctly
        },
      },
      {
        severity: 'severe',
        description: 'Unstable SVT — adverse features (hypotension, chest pain, reduced GCS, pulmonary oedema). Synchronised cardioversion territory',
        typicalVitals: {
          pulse: [180, 240],
          respiration: [22, 32],
          spo2: [88, 95],
          bpSystolic: [70, 95],
          gcs: [12, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Hypotension', 'Chest pain', 'Pre-syncope / reduced GCS', 'Regular very rapid pulse'],
          description: 'Regular extreme tachycardia with adverse features — hypotensive and poorly perfused. Synchronised DC cardioversion is definitive.',
        },
        // Definitive care is synchronised cardioversion (procedure, no drug id).
        // Adenosine may still be tried with continuous monitoring if it does not
        // delay cardioversion; IV access is essential.
        essentialTreatments: ['iv_access', 'oxygen_nonrebreather', 'adenosine_6mg'],
        optimalTreatments: ['iv_access', 'oxygen_nonrebreather', 'adenosine_6mg', 'adenosine_12mg', 'fowlers_position'],
        beneficialTreatments: ['adenosine_12mg', 'amiodarone_300mg'],
        // Rate-limiting AV-nodal blockers and GTN are dangerous in the unstable /
        // possibly pre-excited patient; fluids do not treat the re-entry circuit
        // and risk tipping a compromised LV into oedema.
        contraindicatedTreatments: ['diltiazem_20mg', 'metoprolol_5mg', 'gtn_spray', 'fluids_500ml'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['iv_access', 'adenosine_6mg', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.5,
            description: 'IV access + adenosine + O2 while preparing synchronised cardioversion for the unstable patient',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 2,
            rrReduction: 0,
            hrChange: 0,
            description: 'Upright if tolerated; lay flat for cardioversion/sedation',
          },
        ],
        responseCeilings: {
          partialCeiling: 35,
          fullCeiling: 70,
          timeToResponse: 120,
        },
      },
    ],
  },

  // ===========================================================================
  // DIABETIC KETOACIDOSIS (DKA)
  // ---------------------------------------------------------------------------
  // conditionKey: 'dka'  →  case metab-002 (Diabetic Ketoacidosis, subcategory 'dka')
  //
  // ROUTING: case metab-002 has subcategory 'dka' → findProtocol('dka','metabolic')
  // DIRECT-matches condition === 'dka'. No alias needed. The 'dka' deterioration
  // timeline (clinicalRealism.ts) resolves the same way (resolveSubcategory('dka')
  // has no alias → 'dka'). diversifiedResources already has a 'dka' boost entry.
  //
  // TEACHING CORE — FLUID FIRST. DKA death/morbidity in the field comes from
  // hypovolaemia and from getting the SEQUENCE wrong. The single most important
  // teaching point: restore intravascular volume (iv_access + 0.9% saline) BEFORE
  // any insulin. Insulin given before/without fluids precipitates circulatory
  // collapse (volume shifts intracellularly with glucose), profound hypokalaemia
  // (K+ driven into cells on top of an already-falling total-body K+), and — in a
  // young patient — cerebral oedema. So insulin is in optimalTreatments, but its
  // full reward is GATED behind a synergy that REQUIRES fluids_500ml first
  // (mirrors the tension-PTX "decompress before oxygenate" order pattern).
  //
  // CONTRAINDICATED (genuinely dangerous, real catalog IDs):
  //   - glucose_10g / dextrose_10 — the patient's BGL is ~28 mmol/L. Giving MORE
  //     glucose worsens the hyperosmolar state, drives osmotic diuresis and deepens
  //     the dehydration that is killing them. The engine resets each drug's primary
  //     benefit (bloodGlucose-raise) first so it cannot net-help, then applies
  //     drug-class harm — exactly right here: adding glucose to a hyperglycaemic
  //     ketoacidotic patient is the wrong move.
  //   (insulin is NOT contraindicated — it is needed, just AFTER fluids; the order
  //    is taught via the fluids-first synergy gate, not by flagging the drug.)
  //
  // Two severity bands: moderate (drowsy-but-rousable, compensating) and severe
  // (obtunded/shocked, pre-arrest). Anchored to metab-002 (HR 110, BP 95/60,
  // RR 30 Kussmaul, SpO2 96, GCS 14, BGL 28.5, acetone breath).
  // ===========================================================================
  {
    condition: 'dka',
    conditionName: 'Diabetic Ketoacidosis (DKA)',
    severityLevels: [
      {
        // Anchors metab-002 (HR 110, BP 95/60, RR 30 Kussmaul, SpO2 96, GCS 14,
        // BGL 28.5, dry, acetone breath — drowsy but rousable, still compensating).
        severity: 'moderate',
        description:
          'Moderate DKA — dehydrated, Kussmaul (deep, sighing) breathing, ketotic (acetone breath), tachycardic and mildly hypotensive but conscious (GCS 13-15). Compensating metabolic acidosis. Restore volume FIRST, then insulin.',
        typicalVitals: {
          pulse: [100, 125],
          respiration: [26, 36],   // Kussmaul — deep AND fast to blow off CO2
          spo2: [94, 99],          // lungs are clear; hypoxia is NOT the problem
          bpSystolic: [90, 110],
          gcs: [13, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: [
            'Kussmaul respiration — deep, sighing, laboured',
            'Acetone / fruity breath odour',
            'Dry mucous membranes, poor skin turgor',
            'Sunken eyes, prolonged capillary refill',
          ],
          description:
            'Clear lungs bilaterally — the deep, rapid Kussmaul breathing is respiratory compensation for metabolic acidosis, NOT a respiratory problem. Tachycardic. Acetone breath. Clinically dehydrated.',
        },
        // FLUID FIRST: secure access and restore circulating volume before anything else.
        essentialTreatments: ['iv_access', 'fluids_500ml'],
        optimalTreatments: [
          'iv_access',
          'fluids_500ml',
          'fluids_1000ml',
          'insulin_actrapid',   // fixed-rate infusion — but ONLY after fluids are running (see synergy)
          'oxygen_nasal',
          'ondansetron_4mg',    // vomiting is near-universal in DKA; protects against aspiration + further fluid loss
        ],
        beneficialTreatments: ['fluids_1000ml', 'oxygen_nasal', 'ondansetron_4mg', 'metoclopramide_10mg'],
        // Adding glucose to a patient at BGL ~28 mmol/L deepens the hyperosmolar
        // dehydration that is the immediate threat. Both are real catalog IDs whose
        // primary effect is to RAISE bloodGlucose — genuinely the wrong direction here.
        contraindicatedTreatments: ['glucose_10g', 'dextrose_10'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            // The cornerstone reward: volume restoration is the field priority in DKA.
            treatments: ['iv_access', 'fluids_500ml'],
            synergyMultiplier: 1.6,
            description:
              'IV access + 0.9% saline restores intravascular volume — the single most important pre-hospital intervention in DKA. Fluid resuscitation comes FIRST.',
          },
          {
            // ORDER GATE — insulin only earns its full reward once fluids are running.
            // Insulin BEFORE volume → intracellular fluid + K+ shift on top of an
            // empty tank and a falling K+ → shock / hypokalaemia / cerebral oedema.
            treatments: ['iv_access', 'fluids_500ml', 'insulin_actrapid'],
            synergyMultiplier: 1.9,
            description:
              'Fixed-rate insulin AFTER the first fluids are running closes the anion gap safely. Order is critical — fluids restore volume and protect K+ first; insulin given before fluids precipitates shock, hypokalaemia and cerebral oedema.',
          },
          {
            // Full field bundle: rehydrate, escalate volume, control vomiting, then insulin.
            treatments: ['iv_access', 'fluids_500ml', 'fluids_1000ml', 'insulin_actrapid'],
            synergyMultiplier: 2.1,
            description:
              'Staged volume resuscitation (500ml then ongoing litres) with anti-emesis and fixed-rate insulin once perfused — the complete DKA sequence done in the right order.',
          },
        ],
        positioningEffects: [],
        responseCeilings: {
          // Field therapy rehydrates and starts correcting, but DKA needs hospital
          // (controlled insulin infusion, K+ replacement, anion-gap closure) — capped.
          partialCeiling: 55,
          fullCeiling: 85,
          timeToResponse: 300,
        },
      },
      {
        // Obtunded / shocked DKA — decompensating. GCS falling, frankly hypotensive,
        // peri-arrest. Airway protection now matters alongside aggressive volume.
        severity: 'severe',
        description:
          'Severe DKA — obtunded (GCS <13) and shocked. Profound dehydration with hypotension, marked tachycardia, exhausting Kussmaul effort, vomiting with aspiration risk. Pre-arrest without aggressive volume resuscitation. Watch for hyperkalaemia → arrhythmia and, in the young, cerebral oedema.',
        typicalVitals: {
          pulse: [120, 150],
          respiration: [8, 34],   // deep Kussmaul early; FALLS pre-terminally as the patient tires
          spo2: [88, 97],
          bpSystolic: [60, 90],
          gcs: [6, 12],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: [
            'Tiring Kussmaul effort — air hunger',
            'Acetone breath, vomiting',
            'Profoundly dry — cold, mottled peripheries, thready pulse',
            'Obtunded — cannot reliably protect airway',
            'Monitor: watch for peaked T waves (hyperkalaemia of acidosis)',
          ],
          description:
            'Clear lungs — the breathing is failing respiratory compensation, not a primary lung problem. Severely tachycardic and hypotensive (decompensated). Obtunded with aspiration risk. Aggressive fluid resuscitation and airway protection are the priorities; insulin only once volume is restored.',
        },
        // Even when sicker: volume + airway protection first. Insulin still waits for fluids.
        essentialTreatments: ['iv_access', 'fluids_1000ml', 'oxygen_nonrebreather'],
        optimalTreatments: [
          'iv_access',
          'io_access',
          'fluids_1000ml',
          'fluids_500ml',
          'insulin_actrapid',   // fixed-rate — STILL only after fluids (synergy-gated)
          'oxygen_nonrebreather',
          'ondansetron_4mg',
          'recovery_position',  // obtunded + vomiting → protect the airway
        ],
        beneficialTreatments: ['io_access', 'fluids_500ml', 'ondansetron_4mg', 'recovery_position', 'suction'],
        // Same as above — pushing glucose into a hyperosmolar, ketoacidotic, shocked
        // patient worsens the osmotic diuresis and dehydration driving the collapse.
        contraindicatedTreatments: ['glucose_10g', 'dextrose_10'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['iv_access', 'fluids_1000ml'],
            synergyMultiplier: 1.6,
            description:
              'Large-bore access + aggressive 0.9% saline is the life-saving step in shocked DKA — fluids correct the hypovolaemia before insulin is even considered.',
          },
          {
            // ORDER GATE (severe) — insulin rewarded only once real volume is in.
            treatments: ['iv_access', 'fluids_1000ml', 'insulin_actrapid'],
            synergyMultiplier: 1.9,
            description:
              'Fixed-rate insulin AFTER resuscitative fluids closes the gap without collapsing the circulation. Insulin before volume in a shocked patient precipitates cardiovascular collapse, severe hypokalaemia and cerebral oedema.',
          },
          {
            // Volume + airway protection for the obtunded, vomiting patient.
            treatments: ['fluids_1000ml', 'oxygen_nonrebreather', 'recovery_position'],
            synergyMultiplier: 1.5,
            description:
              'Resuscitate volume, oxygenate, and protect the airway of the obtunded vomiting patient — prevents aspiration while perfusion is restored.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 2,
            rrReduction: 0,
            hrChange: -3,
            description:
              'Recovery position protects the airway of the obtunded, vomiting DKA patient and reduces aspiration risk.',
          },
        ],
        responseCeilings: {
          partialCeiling: 35,
          fullCeiling: 75,
          timeToResponse: 240,
        },
      },
    ],
  },

// ============================================================================
// INFECTION / SEPSIS-SOURCE PROTOCOLS  (paste into TREATMENT_PROTOCOLS[] in
// src/data/treatmentProtocols.ts)
//
// All treatment ids grep-verified against src/data/enhancedTreatmentEffects.ts.
// Engine contract honoured:
//   - contraindicatedTreatments[] = REAL ids that cause REAL vital harm only.
//   - essential/optimal/beneficial tiers drive responseMultiplier + ceilings.
//   - synergies tiered (essential pair < add-on < full bundle).
//   - responseCeilings filled (partial = essential-only, full = optimal).
//
// ROUTING: findProtocol() matches case.subcategory against p.condition.
//   sepsis      ← subcategory 'sepsis'        (cardiac-017)
//   sepsis      ← subcategory 'post-surgical' (postd-001)  *** NEEDS ALIAS ***
//   meningitis  ← subcategory 'meningitis'    (neuro-003, neuro-004)
//   pneumonia   ← subcategory 'pneumonia'     (resp-011)
// See infection.notes.md for the two alias-map edits required.
// ============================================================================

  // ===========================================================================
  // SEPSIS / SEPTIC SHOCK
  // ---------------------------------------------------------------------------
  // Cases: cardiac-017 (paeds — 8-month infant, decompensated septic shock with
  //          non-blanching petechiae: HR55 brady-from-hypoxia, RR8, SpO2 75,
  //          BP 50/30, GCS8, CRT>5s, BGL2.8, T38.8 → LIFE-THREATENING bin),
  //        postd-001 (52M post-op wound infection, compensated: RR~20, SpO2 97,
  //          BP 130/80, GCS15, T38.5 → MODERATE bin; subcategory 'post-surgical'
  //          reaches this protocol ONLY via the alias added in notes).
  //
  // Prehospital Sepsis-6 (the deliverable bundle): high-flow O2, IV/IO access,
  // titrated fluid boluses, and EARLY broad-spectrum IV antibiotics ("antibiotics
  // within 1 hour"). The error in sepsis is WITHHOLDING fluids from the
  // hypoperfused patient — that is modelled as fluids being ESSENTIAL (omitting
  // them caps the ceiling and lets the untreated timeline run), NOT by putting a
  // fake id in contraindicatedTreatments. The only genuinely-harmful REAL id here
  // is gtn_spray: a nitrate drops preload/SVR in a vasodilated, hypoperfused
  // septic patient and deepens distributive shock.
  // ===========================================================================
  {
    condition: 'sepsis',
    conditionName: 'Sepsis / Septic Shock',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Sepsis with compensated perfusion (e.g. post-operative source) — febrile, tachycardic, tachypnoeic, warm peripheries, BP maintained, GCS intact. Time-critical: organ hypoperfusion is developing under a normal blood pressure.',
        typicalVitals: {
          pulse: [95, 120],
          respiration: [20, 28],
          spo2: [92, 97],
          bpSystolic: [100, 140],
          gcs: [14, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Febrile, flushed, warm peripheries', 'Tachycardic', 'Tachypnoeic', 'Source signs (e.g. hot/erythematous surgical wound, purulent discharge)', 'Rigors'],
          description: 'Chest often clear in a non-pulmonary source. Warm, flushed, tachycardic — the hyperdynamic "warm" phase of sepsis. Hunt the source (wound, urine, abdomen).',
        },
        // EARLY antibiotics + fluid resuscitation are the core. Omitting fluids or
        // antibiotics is the clinical error → both are ESSENTIAL (drives ceiling/timeline).
        essentialTreatments: ['oxygen_nonrebreather', 'iv_access', 'fluids_500ml', 'antibiotics_iv'],
        optimalTreatments: ['oxygen_nonrebreather', 'iv_access', 'fluids_500ml', 'antibiotics_iv', 'paracetamol_iv', 'ondansetron_4mg'],
        beneficialTreatments: ['paracetamol_iv', 'ondansetron_4mg', 'reassurance'],
        // gtn_spray: nitrate in a vasodilated, hypoperfused septic patient drops
        // preload/SVR and worsens distributive hypotension — genuine vital harm.
        contraindicatedTreatments: ['gtn_spray'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            // ESSENTIAL PAIR — early antibiotics + a titrated fluid bolus are the
            // two interventions that change sepsis mortality. Lower multiplier.
            treatments: ['antibiotics_iv', 'fluids_500ml'],
            synergyMultiplier: 1.5,
            description: 'Early IV antibiotics + fluid resuscitation: source control begins and intravascular volume is restored — the two highest-yield Sepsis-6 levers',
          },
          {
            // Add access + oxygen — completes the resuscitation platform.
            treatments: ['antibiotics_iv', 'fluids_500ml', 'iv_access', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.9,
            description: 'IV access for titratable fluids/antibiotics, oxygen to meet raised metabolic demand — full prehospital Sepsis-6 resuscitation platform',
          },
          {
            // FULL BUNDLE — adds antipyresis/antiemetic supportive care.
            treatments: ['antibiotics_iv', 'fluids_500ml', 'iv_access', 'oxygen_nonrebreather', 'paracetamol_iv'],
            synergyMultiplier: 2.1,
            description: 'Complete moderate-sepsis bundle: oxygenation, access, titrated fluids, early antibiotics, and antipyresis to reduce metabolic load',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -3,
            description: 'Lying flat (or with legs raised) supports venous return and preload in the hypotensive-tending septic patient',
          },
          {
            positionId: 'leg_elevation',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -5,
            description: 'Passive leg raise transiently augments preload while fluids are being prepared',
          },
        ],
        responseCeilings: {
          // partial = essential-only (O2 + access + 500 mL + antibiotics, no supportive adjuncts)
          partialCeiling: 65,
          fullCeiling: 92,
          timeToResponse: 300,
        },
      },
      {
        severity: 'life-threatening',
        description: 'Septic shock / decompensated sepsis — refractory hypotension despite fluids, mottled skin, prolonged capillary refill, falling GCS, rising lactate. In children, bradycardia and a falling respiratory rate are PRE-ARREST signs (cardiac-017: HR55, RR8, SpO2 75, BP 50/30, GCS8, petechiae). Cold, under-perfused, peri-arrest.',
        typicalVitals: {
          pulse: [50, 170],
          respiration: [8, 40],
          spo2: [70, 90],
          bpSystolic: [50, 90],
          gcs: [3, 12],
        },
        initialSounds: {
          leftLung: 'crackles-fine',
          rightLung: 'crackles-fine',
          heartSound: 'tachycardic',
          additionalSounds: ['Mottled, cool peripheries', 'Capillary refill >4 s', 'Non-blanching petechial/purpuric rash (meningococcaemia)', 'Altered mental state / falling GCS', 'Weak thready pulses', 'Grunting / minimal respiratory effort in infants (pre-arrest)'],
          description: 'Cold, mottled, shut-down "cold shock" phase. Petechiae/purpura suggest meningococcal sepsis. In infants, bradycardia + bradypnoea here is secondary to hypoxia and signals imminent arrest — oxygenate/ventilate FIRST.',
        },
        // io_access added — in collapsed/paediatric patients IO is faster than IV.
        // bvm_ventilation essential where respiratory effort is failing (the infant).
        essentialTreatments: ['oxygen_nonrebreather', 'io_access', 'fluids_500ml', 'antibiotics_iv'],
        optimalTreatments: ['oxygen_nonrebreather', 'io_access', 'iv_access', 'fluids_1000ml', 'antibiotics_iv', 'bvm_ventilation', 'paracetamol_iv'],
        beneficialTreatments: ['iv_access', 'bvm_ventilation', 'intubation', 'paracetamol_iv'],
        // gtn_spray frankly lethal in established septic shock (preload/SVR collapse).
        contraindicatedTreatments: ['gtn_spray'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            // ESSENTIAL PAIR — vascular access + aggressive fluids restore perfusion.
            treatments: ['io_access', 'fluids_500ml'],
            synergyMultiplier: 1.6,
            description: 'Rapid IO access for immediate fluid boluses (20 mL/kg in children) — restoring intravascular volume is the first act of shock reversal',
          },
          {
            // Add early antibiotics — source control under resuscitation.
            treatments: ['io_access', 'fluids_500ml', 'antibiotics_iv', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.0,
            description: 'IO access + aggressive fluids + early antibiotics + high-flow O2: the time-critical septic-shock bundle, antibiotics within the first hour',
          },
          {
            // FULL BUNDLE — adds assisted ventilation for the exhausted/peri-arrest patient.
            treatments: ['io_access', 'fluids_1000ml', 'antibiotics_iv', 'oxygen_nonrebreather', 'bvm_ventilation'],
            synergyMultiplier: 2.5,
            description: 'Maximal septic-shock resuscitation: volume, source control, oxygenation, and assisted ventilation for the tiring or bradypnoeic (paediatric pre-arrest) patient',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -5,
            description: 'Supine with passive leg raise maximises venous return in profound distributive shock',
          },
          {
            positionId: 'leg_elevation',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -8,
            description: 'Passive leg raise as a temporising preload boost while access and fluids are established',
          },
        ],
        responseCeilings: {
          partialCeiling: 30,
          fullCeiling: 80,
          timeToResponse: 180,
        },
      },
    ],
  },

  // ===========================================================================
  // MENINGITIS / MENINGOCOCCAL SEPSIS
  // ---------------------------------------------------------------------------
  // Cases: neuro-003 (25M, alert: HR110, RR20, SpO2 97, BP 110/70, GCS15, T39.2,
  //          classic meningism → MODERATE bin),
  //        neuro-004 (20F bacterial meningitis, confused: SpO2 96, BP 90/60,
  //          GCS14, T40.0 → tipping toward LIFE-THREATENING; hypotension + falling
  //          GCS = meningococcal sepsis / rising ICP).
  //
  // Time-critical rule: in suspected meningococcal disease, EARLY IV/IO antibiotics
  // (benzylpenicillin) must NOT be delayed for investigations or transport —
  // antibiotics_iv is ESSENTIAL at every severity. Dexamethasone is an adjunct
  // (reduces neurological sequelae in bacterial meningitis) → beneficial, not
  // essential, never harmful. Two real harms: gtn_spray (drops BP in the septic/
  // shocked phenotype) and supine_position (raises ICP in the raised-ICP
  // phenotype — head-up 30° is standard).
  // ===========================================================================
  {
    condition: 'meningitis',
    conditionName: 'Meningitis / Meningococcal Sepsis',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Suspected bacterial meningitis, neurologically intact — fever, headache, neck stiffness, photophobia, GCS preserved, perfusion maintained. The window to give antibiotics before deterioration.',
        typicalVitals: {
          pulse: [95, 120],
          respiration: [16, 24],
          spo2: [94, 98],
          bpSystolic: [105, 140],
          gcs: [14, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Febrile', 'Neck stiffness / meningism', 'Photophobia', 'Severe headache', 'Irritability', 'No rash yet, OR early sparse petechiae'],
          description: 'Chest clear. Febrile and tachycardic with meningitic signs (neck stiffness, photophobia, Kernig/Brudzinski). Examine fully for any non-blanching rash.',
        },
        // Antibiotics MUST NOT wait — essential even with a normal BP.
        essentialTreatments: ['antibiotics_iv', 'iv_access', 'oxygen_nonrebreather', 'fluids_500ml'],
        optimalTreatments: ['antibiotics_iv', 'iv_access', 'oxygen_nonrebreather', 'fluids_500ml', 'dexamethasone', 'paracetamol_iv', 'ondansetron_4mg'],
        beneficialTreatments: ['dexamethasone', 'paracetamol_iv', 'ondansetron_4mg', 'calm_environment'],
        // gtn_spray would drop BP toward the septic phenotype; supine raises ICP
        // (head-up positioning is standard in meningitis with headache/photophobia).
        contraindicatedTreatments: ['gtn_spray', 'supine_position'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            // ESSENTIAL PAIR — access + immediate antibiotics. The single rule of
            // prehospital meningococcal care: do not delay penicillin.
            treatments: ['iv_access', 'antibiotics_iv'],
            synergyMultiplier: 1.6,
            description: 'IV access and immediate benzylpenicillin — in suspected meningococcal disease antibiotics are given before transport, not after',
          },
          {
            // Add oxygen + fluids — supports perfusion as sepsis physiology begins.
            treatments: ['iv_access', 'antibiotics_iv', 'oxygen_nonrebreather', 'fluids_500ml'],
            synergyMultiplier: 1.9,
            description: 'Antibiotics + oxygen + a titrated fluid bolus: treats the infection and pre-empts the distributive shock of meningococcaemia',
          },
          {
            // FULL BUNDLE — adds dexamethasone adjunct + antipyresis.
            treatments: ['iv_access', 'antibiotics_iv', 'oxygen_nonrebreather', 'fluids_500ml', 'dexamethasone'],
            synergyMultiplier: 2.1,
            description: 'Full bundle with dexamethasone adjunct (reduces neurological sequelae in bacterial meningitis) and supportive antipyresis',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 2,
            rrReduction: 1,
            hrChange: -3,
            description: 'Head-up ~30° eases headache/photophobia and is neutral-to-helpful for intracranial pressure while perfusion is maintained',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: 3,
            description: 'DANGEROUS if intracranial pressure is rising — flat positioning impedes cerebral venous drainage and worsens ICP',
          },
        ],
        responseCeilings: {
          partialCeiling: 65,
          fullCeiling: 92,
          timeToResponse: 300,
        },
      },
      {
        severity: 'life-threatening',
        description: 'Meningococcal sepsis and/or raised intracranial pressure — rapidly spreading non-blanching purpura, hypotension, falling GCS, possibly bradycardia + hypertension + irregular breathing (Cushing) if ICP is the driver. Peri-arrest; minutes matter.',
        typicalVitals: {
          pulse: [50, 160],
          respiration: [8, 38],
          spo2: [80, 94],
          bpSystolic: [60, 100],
          gcs: [3, 12],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'crackles-fine',
          heartSound: 'tachycardic',
          additionalSounds: ['Rapidly spreading non-blanching purpura', 'Mottled, cool peripheries', 'Capillary refill >4 s', 'Falling GCS / unresponsive', 'Possible seizures', 'Cushing response (brady + hypertension) if ICP-driven'],
          description: 'Fulminant meningococcal sepsis: purpuric rash spreading before your eyes, shut-down peripheries, collapsing GCS. If the picture is raised ICP instead, expect bradycardia, hypertension and irregular respiration (Cushing).',
        },
        // io_access for the collapsed patient; antibiotics still essential and urgent.
        essentialTreatments: ['antibiotics_iv', 'io_access', 'oxygen_nonrebreather', 'fluids_500ml'],
        optimalTreatments: ['antibiotics_iv', 'io_access', 'iv_access', 'oxygen_nonrebreather', 'fluids_1000ml', 'dexamethasone'],
        beneficialTreatments: ['iv_access', 'dexamethasone', 'bvm_ventilation', 'intubation'],
        // gtn_spray lethal in shock; supine worsens raised ICP. Both real, both harmful.
        contraindicatedTreatments: ['gtn_spray', 'supine_position'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            // ESSENTIAL PAIR — access + immediate antibiotics under resuscitation.
            treatments: ['io_access', 'antibiotics_iv'],
            synergyMultiplier: 1.6,
            description: 'Immediate IO access and benzylpenicillin in fulminant meningococcaemia — antibiotics are not delayed for the collapsing patient',
          },
          {
            // Add fluids + oxygen — distributive shock resuscitation.
            treatments: ['io_access', 'antibiotics_iv', 'fluids_500ml', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.0,
            description: 'Antibiotics + aggressive fluids + high-flow O2: simultaneously treat the infection and the meningococcal septic shock',
          },
          {
            // FULL BUNDLE — adds assisted ventilation for the obtunded/peri-arrest patient.
            treatments: ['io_access', 'antibiotics_iv', 'fluids_1000ml', 'oxygen_nonrebreather', 'bvm_ventilation'],
            synergyMultiplier: 2.4,
            description: 'Maximal therapy: source control, volume resuscitation, oxygenation, and airway support for the patient with a failing conscious level',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 2,
            rrReduction: 1,
            hrChange: -3,
            description: 'Head-up ~30° (with spinal precautions) promotes cerebral venous drainage when ICP is the dominant problem',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: 4,
            description: 'DANGEROUS with raised ICP — flat positioning further raises intracranial pressure and can precipitate herniation',
          },
        ],
        responseCeilings: {
          partialCeiling: 30,
          fullCeiling: 80,
          timeToResponse: 180,
        },
      },
    ],
  },

  // ===========================================================================
  // PNEUMONIA / COMMUNITY-ACQUIRED PNEUMONIA (CAP)
  // ---------------------------------------------------------------------------
  // Case: resp-011 (65M CAP: HR110, RR28, SpO2 88, BP 110/70, GCS15, T39.0,
  //          focal RIGHT lower-lobe crackles + bronchial breathing, pleuritic pain,
  //          rigors → MODERATE bin; tips to SEVERE when sepsis physiology and
  //          hypoxia worsen).
  //
  // Prehospital CAP: oxygen TITRATED to a target saturation (do not blindly
  // saturate — but profound hypoxia here needs high-flow), IV access, a fluid
  // bolus IF septic/hypotensive, and early IV antibiotics in severe CAP-sepsis.
  // Real harm: gtn_spray (drops BP once CAP-sepsis hypotension develops).
  // Note the FOCAL (unilateral) auscultation — unlike the bilateral APO/asthma
  // pattern — using the per-zone overrides.
  // ===========================================================================
  {
    condition: 'pneumonia',
    conditionName: 'Pneumonia / Community-Acquired Pneumonia',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Community-acquired pneumonia — fever, productive cough, pleuritic chest pain, focal consolidation, hypoxia responsive to oxygen, perfusion maintained. Sepsis physiology is present but compensated.',
        typicalVitals: {
          pulse: [95, 120],
          respiration: [22, 30],
          spo2: [86, 93],
          bpSystolic: [100, 140],
          gcs: [14, 15],
        },
        initialSounds: {
          // FOCAL consolidation — right base, left lung clear. ('bronchial breathing'
          // is captured in additionalSounds text; it is NOT a BreathSoundType literal —
          // valid set: clear|wheeze|crackles-fine|crackles-coarse|stridor|diminished|
          // absent|rhonchi|pleural-rub|snoring. Consolidation auscultates as crackles-coarse.)
          leftLung: 'clear',
          rightLung: 'crackles-coarse',
          rightLowerLung: 'crackles-coarse',
          heartSound: 'tachycardic',
          additionalSounds: ['Focal coarse crackles right base', 'Bronchial breathing over consolidation', 'Pleuritic chest pain', 'Productive cough', 'Rigors / febrile'],
          description: 'Focal (unilateral) coarse crackles with bronchial breathing over the consolidated right lower lobe; the opposite lung is clear — the hallmark of lobar pneumonia rather than a diffuse process.',
        },
        // Oxygen titrated to target; antibiotics early; fluids if septic.
        essentialTreatments: ['oxygen_nonrebreather', 'iv_access', 'antibiotics_iv'],
        optimalTreatments: ['oxygen_nonrebreather', 'iv_access', 'antibiotics_iv', 'fluids_500ml', 'paracetamol_iv'],
        beneficialTreatments: ['fluids_500ml', 'paracetamol_iv', 'fowlers_position', 'reassurance'],
        // gtn_spray drops BP if CAP-sepsis hypotension develops — genuine harm.
        contraindicatedTreatments: ['gtn_spray'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            // ESSENTIAL PAIR — oxygenation + early antibiotics.
            treatments: ['oxygen_nonrebreather', 'antibiotics_iv'],
            synergyMultiplier: 1.4,
            description: 'Oxygen corrects the V/Q-mismatch hypoxia of consolidation while early IV antibiotics treat the underlying infection',
          },
          {
            // Add access + fluids — supports the septic component.
            treatments: ['oxygen_nonrebreather', 'antibiotics_iv', 'iv_access', 'fluids_500ml'],
            synergyMultiplier: 1.8,
            description: 'Oxygen + antibiotics + IV access + a titrated fluid bolus: treats hypoxia and the early sepsis physiology of CAP together',
          },
          {
            // FULL BUNDLE — adds antipyresis to reduce metabolic demand.
            treatments: ['oxygen_nonrebreather', 'antibiotics_iv', 'iv_access', 'fluids_500ml', 'paracetamol_iv'],
            synergyMultiplier: 2.0,
            description: 'Full moderate-CAP bundle: oxygenation, source control, fluid support, and antipyresis to lower the work of a febrile, tachypnoeic patient',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 3,
            rrReduction: 2,
            hrChange: -4,
            description: 'Sitting upright optimises ventilation of the unaffected lung and eases the work of breathing',
          },
        ],
        responseCeilings: {
          partialCeiling: 60,
          fullCeiling: 90,
          timeToResponse: 300,
        },
      },
      {
        severity: 'severe',
        description: 'Severe CAP with sepsis — marked hypoxia poorly responsive to oxygen, high respiratory rate, hypotension/septic physiology, possible early confusion (CURB-65 features). Heading toward type-1 respiratory failure and septic shock.',
        typicalVitals: {
          pulse: [110, 140],
          respiration: [28, 42],
          spo2: [75, 88],
          bpSystolic: [80, 105],
          gcs: [12, 15],
        },
        initialSounds: {
          leftLung: 'crackles-coarse',
          rightLung: 'crackles-coarse',
          rightLowerLung: 'crackles-coarse',
          heartSound: 'tachycardic',
          additionalSounds: ['Coarse crackles, now often multi-lobar/bilateral', 'Bronchial breathing over consolidation', 'Cyanosis', 'Marked tachypnoea and accessory muscle use', 'Hypotension / sepsis', 'New confusion (CURB-65)'],
          description: 'Consolidation has spread; coarse crackles in more than one zone with cyanosis and exhaustion. Hypoxia is now refractory to simple oxygen and the patient is becoming septic — type-1 respiratory failure with septic shock is imminent.',
        },
        // High-flow O2 + IV access + early antibiotics + fluids essential; ventilatory
        // support optimal for the tiring/failing patient.
        essentialTreatments: ['oxygen_nonrebreather', 'iv_access', 'antibiotics_iv', 'fluids_500ml'],
        optimalTreatments: ['oxygen_nonrebreather', 'iv_access', 'antibiotics_iv', 'fluids_1000ml', 'bvm_ventilation', 'paracetamol_iv'],
        beneficialTreatments: ['bvm_ventilation', 'intubation', 'io_access', 'paracetamol_iv'],
        // gtn_spray lethal once septic hypotension is established.
        contraindicatedTreatments: ['gtn_spray'],
        deteriorationRate: 'fast',
        synergies: [
          {
            // ESSENTIAL PAIR — oxygenation + antibiotics keep the patient alive and
            // begin source control.
            treatments: ['oxygen_nonrebreather', 'antibiotics_iv'],
            synergyMultiplier: 1.5,
            description: 'High-flow O2 holds saturations against worsening V/Q mismatch while early antibiotics attack the driving infection',
          },
          {
            // Add access + fluids — septic shock resuscitation.
            treatments: ['oxygen_nonrebreather', 'antibiotics_iv', 'iv_access', 'fluids_500ml'],
            synergyMultiplier: 1.9,
            description: 'Oxygen + antibiotics + IV access + fluids: simultaneously treat refractory hypoxia and the CAP-driven septic shock',
          },
          {
            // FULL BUNDLE — adds assisted ventilation for impending respiratory failure.
            treatments: ['oxygen_nonrebreather', 'antibiotics_iv', 'iv_access', 'fluids_1000ml', 'bvm_ventilation'],
            synergyMultiplier: 2.3,
            description: 'Maximal severe-CAP therapy: oxygenation, source control, volume resuscitation, and assisted ventilation as the patient tires toward type-1 respiratory failure',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 4,
            rrReduction: 3,
            hrChange: -5,
            description: 'Upright positioning maximises recruitment of the less-affected lung — important when hypoxia is refractory',
          },
        ],
        responseCeilings: {
          partialCeiling: 35,
          fullCeiling: 80,
          timeToResponse: 240,
        },
      },
    ],
  },

// ============================================================================
// TWO NEW TreatmentProtocol LITERALS — paste into TREATMENT_PROTOCOLS[]
// in src/data/treatmentProtocols.ts (append before the closing `];` ~line 3411).
//
// IDs verified present in src/data/enhancedTreatmentEffects.ts:
//   acetylcysteine, pralidoxime, atropine_05mg, iv_access, io_access,
//   activated_charcoal, oxygen_nonrebreather, suction, bvm_ventilation,
//   intubation, ondansetron_4mg, suxamethonium, fluids_500ml
// Positioning IDs reused from existing protocols: recovery_position,
//   fowlers_position, supine_position (all already referenced in this file).
// ============================================================================

  // ===========================================================================
  // PARACETAMOL (ACETAMINOPHEN) OVERDOSE
  // ---------------------------------------------------------------------------
  // Teaching spine: the patient often looks WELL early — normal vitals do NOT
  // exclude a lethal ingestion. Hepatic injury is DELAYED (declares ~24–72h).
  // N-acetylcysteine (NAC) is the antidote and is most effective <8h of
  // ingestion; it is hepatoprotective, NOT an acute vital-changer, so the model
  // rewards giving it (protocol completeness / ceiling) rather than swinging
  // vitals. Activated charcoal only helps within ~1h of ingestion AND only with
  // a protected airway — once the patient is obtunded/vomiting it is CONTRA-
  // INDICATED (aspiration). Ondansetron is fine (and useful) throughout.
  // conditionKey 'paracetamol-overdose' matches case y2-007 subcategory.
  // ===========================================================================
  {
    condition: 'paracetamol-overdose',
    conditionName: 'Paracetamol (Acetaminophen) Overdose',
    severityLevels: [
      {
        severity: 'moderate',
        description:
          'Early presentation — alert, haemodynamically normal, often WELL-looking. Within hours of a significant ingestion (this is the deceptive window). Nausea ± vomiting may be the only symptom. The danger is delayed hepatotoxicity, so a timed paracetamol level and timely N-acetylcysteine matter far more than the current obs.',
        typicalVitals: {
          pulse: [70, 95],
          respiration: [14, 18],
          spo2: [97, 100],
          bpSystolic: [108, 128],
          gcs: [15, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'normal',
          additionalSounds: ['Patient appears well', 'May be emotionally flat / withdrawn', 'Nausea ± vomiting'],
          description:
            'Clear lungs bilaterally, normal heart sounds, normal work of breathing. Patient looks deceptively well — auscultation is unremarkable. Do NOT be reassured: paracetamol injury is biochemical and delayed.',
        },
        // NAC if indicated by timing/levels (most effective <8h); IV access to
        // enable it; activated charcoal ONLY if <1h since ingestion AND airway
        // protected. Ondansetron controls vomiting so the patient can tolerate
        // oral NAC / so charcoal is safer.
        essentialTreatments: ['iv_access', 'acetylcysteine'],
        optimalTreatments: ['iv_access', 'acetylcysteine', 'activated_charcoal', 'ondansetron_4mg', 'fluids_500ml'],
        beneficialTreatments: ['ondansetron_4mg', 'activated_charcoal', 'fluids_500ml', 'recovery_position'],
        // Nothing class-harmful at this alert stage. Charcoal is still
        // appropriate here IF <1h and airway intact, so it is NOT contraindicated
        // in this band (it becomes contraindicated once obtunded — see 'severe').
        contraindicatedTreatments: [],
        deteriorationRate: 'slow',
        synergies: [
          {
            treatments: ['acetylcysteine', 'iv_access'],
            synergyMultiplier: 1.8,
            description:
              'IV access enables the definitive antidote — IV N-acetylcysteine started early (<8h) is near-completely hepatoprotective.',
          },
          {
            treatments: ['activated_charcoal', 'ondansetron_4mg'],
            synergyMultiplier: 1.2,
            description:
              'Antiemetic cover lets the patient tolerate activated charcoal (within 1h) and, later, oral NAC without vomiting it back.',
          },
        ],
        positioningEffects: [],
        responseCeilings: {
          // Without the antidote the "response" is capped — you cannot fix a
          // delayed hepatic clock with supportive care alone. Full protocol
          // (timely NAC) approaches a complete outcome.
          partialCeiling: 55,
          fullCeiling: 100,
          timeToResponse: 300,
        },
      },
      {
        severity: 'severe',
        description:
          'Late / untreated presentation — fulminant hepatic failure declaring: hepatic encephalopathy (falling GCS), RUQ pain, jaundice, coagulopathy, hypoglycaemia, lactic acidosis with compensatory tachypnoea, and progressive hypotension. The therapeutic window for charcoal is gone and the airway is now at risk.',
        typicalVitals: {
          pulse: [105, 135],
          respiration: [22, 30],
          spo2: [92, 97],
          bpSystolic: [85, 105],
          gcs: [8, 13],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Encephalopathic / drowsy', 'Jaundice', 'RUQ tenderness', 'Kussmaul (acidotic) breathing', 'Vomiting — swallow now unreliable'],
          description:
            'Chest usually clear (tachypnoea is metabolic/acidotic, not pulmonary), tachycardic. Patient encephalopathic with an unreliable swallow — this is fulminant hepatic failure. Protect the airway; correct glucose; this is now a transplant-pathway patient.',
        },
        // Still antidote + supportive: NAC continues to help even late (improves
        // transplant-free survival), IV access mandatory, glucose support, airway
        // protection. Suction + intubation are airway-protective here.
        essentialTreatments: ['iv_access', 'acetylcysteine', 'suction'],
        optimalTreatments: ['iv_access', 'acetylcysteine', 'suction', 'ondansetron_4mg', 'fluids_500ml', 'intubation'],
        beneficialTreatments: ['ondansetron_4mg', 'fluids_500ml', 'intubation', 'recovery_position'],
        // HARM: activated charcoal once the airway is at risk / late presentation
        // → aspiration (a confused, vomiting, encephalopathic patient cannot
        // protect their airway). suxamethonium is listed because a depolarising
        // agent for any RSI here behaves abnormally with hepatic dysfunction
        // (reduced plasma cholinesterase → prolonged block); prefer a controlled
        // airway plan. Both are REAL catalog IDs, so the engine produces real
        // harm + a warning, not just a scoring penalty.
        contraindicatedTreatments: ['activated_charcoal', 'suxamethonium'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['acetylcysteine', 'iv_access'],
            synergyMultiplier: 1.6,
            description:
              'NAC still improves outcome in established hepatotoxicity — never withhold it because the patient presented late.',
          },
          {
            treatments: ['suction', 'intubation'],
            synergyMultiplier: 1.4,
            description:
              'Airway protection in the encephalopathic, vomiting patient — suction clears soiling; a definitive airway prevents aspiration.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 2,
            rrReduction: 0,
            hrChange: -2,
            description:
              'Lateral/recovery position protects the airway of the encephalopathic, vomiting patient until a definitive airway is secured.',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: -3,
            rrReduction: 2,
            hrChange: 4,
            description:
              'Lying a vomiting, obtunded hepatic-failure patient flat invites aspiration — keep them lateral / head-up.',
          },
        ],
        responseCeilings: {
          // Established fulminant failure is a low ceiling even with full
          // pre-hospital care — the win is supportive + rapid transfer to a
          // liver unit, not reversal in the field.
          partialCeiling: 25,
          fullCeiling: 60,
          timeToResponse: 600,
        },
      },
    ],
  },

  // ===========================================================================
  // ORGANOPHOSPHATE POISONING (CHOLINERGIC CRISIS)
  // ---------------------------------------------------------------------------
  // SLUDGE / DUMBELS toxidrome: Salivation, Lacrimation, Urination, Defecation,
  // GI distress, Emesis + Bronchorrhoea, Bradycardia, Miosis, Fasciculations.
  // Death is from BRONCHORRHOEA ("the patient drowns in their own secretions")
  // plus nicotinic weakness → respiratory failure.
  // Management spine:
  //   1. RESPONDER SAFETY FIRST — PPE + decontamination (remove clothing, wash
  //      skin). Off-gassing/secretions can poison the crew. (Note only — no
  //      'ppe'/'decontamination' catalog ID exists, so it is kept OUT of the
  //      scored arrays and captured in clinicalNotes + the case ABCDE instead.)
  //   2. ATROPINE — titrated to DRYING of tracheobronchial secretions (NOT to
  //      heart rate, NOT to pupils). Large, escalating/doubling doses; total may
  //      reach grams. Catalog ID is atropine_05mg (the only atropine in catalog)
  //      — dose framing handled in description.
  //   3. PRALIDOXIME — reactivates acetylcholinesterase (reverses nicotinic
  //      weakness / respiratory muscle failure). Give WITH atropine, never instead.
  //   4. Suction + oxygen + ventilatory support for the bronchorrhoea.
  // conditionKey 'organophosphate' matches case tox-001 subcategory.
  // ===========================================================================
  {
    condition: 'organophosphate',
    conditionName: 'Organophosphate Poisoning (Cholinergic Crisis)',
    severityLevels: [
      {
        severity: 'severe',
        description:
          'Established cholinergic crisis — bronchorrhoea, bradycardia, miosis (pinpoint pupils), fasciculations, profuse secretions (SLUDGE/DUMBELS). Still maintaining some respiratory effort. Decontaminate, then atropine titrated to drying of secretions PLUS pralidoxime. Provider PPE is mandatory.',
        typicalVitals: {
          pulse: [40, 55],
          respiration: [26, 34],
          spo2: [85, 91],
          bpSystolic: [80, 100],
          gcs: [10, 13],
        },
        initialSounds: {
          // Bronchorrhoea = widespread coarse crackles/secretions, often with
          // wheeze from bronchoconstriction. 'crackles-coarse' is the catalog
          // BreathSoundType for wet secretions (clinicalSounds.ts ~22).
          leftLung: 'crackles-coarse',
          rightLung: 'crackles-coarse',
          heartSound: 'bradycardic',
          additionalSounds: ['Bronchorrhoea — coarse wet crackles throughout', 'Wheeze (bronchospasm)', 'Profuse salivation', 'Muscle fasciculations', 'Pinpoint pupils (miosis)'],
          description:
            'Loud wet crackles bilaterally from bronchorrhoea, with wheeze. Bradycardic. The patient is wet everywhere (salivation, lacrimation, sweat) with pinpoint pupils and twitching muscles — the cholinergic toxidrome.',
        },
        // Decontamination/PPE is the genuine first step (note item). Then the
        // antidotes + airway support. atropine_05mg = the catalog atropine
        // (dose framing in description: crisis dosing is 1–3mg then DOUBLING,
        // titrated to drying — not the 0.5mg bradycardia dose).
        // NOTE: responder PPE + decontamination (remove clothing, wash skin) is
        // the genuine FIRST action but has no catalog treatment ID, so it is NOT
        // placed in any scored array (those stay 100% real catalog IDs). It is
        // captured in clinicalNotes / the case ABCDE instead. Drives the
        // teaching, not the engine maths.
        essentialTreatments: ['suction', 'oxygen_nonrebreather', 'atropine_05mg', 'pralidoxime', 'iv_access'],
        optimalTreatments: ['suction', 'oxygen_nonrebreather', 'atropine_05mg', 'pralidoxime', 'iv_access', 'bvm_ventilation'],
        beneficialTreatments: ['bvm_ventilation', 'io_access', 'recovery_position'],
        // HARM: suxamethonium (depolarising NMBA) is metabolised by plasma
        // cholinesterase, which organophosphates inhibit → grossly PROLONGED
        // paralysis ("can't intubate, can't ventilate, won't wake"). Real
        // catalog ID, so the engine harms for it. (Other genuinely-harmful
        // moves are physiological, not single catalog IDs, so the list is kept
        // to this one real, defensible entry.)
        contraindicatedTreatments: ['suxamethonium'],
        deteriorationRate: 'fast',
        synergies: [
          {
            // The defining synergy: atropine (muscarinic) + pralidoxime
            // (nicotinic/AChE reactivation) cover BOTH arms of the toxidrome.
            treatments: ['atropine_05mg', 'pralidoxime'],
            synergyMultiplier: 2.0,
            description:
              'Atropine dries muscarinic secretions while pralidoxime reactivates acetylcholinesterase and reverses nicotinic weakness — they treat different arms of the crisis and MUST be given together.',
          },
          {
            treatments: ['atropine_05mg', 'suction', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.5,
            description:
              'Atropine reduces secretion production while suction clears what is there and high-flow O2 corrects the hypoxia of bronchorrhoea — the airway is winnable.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 2,
            rrReduction: 1,
            hrChange: 0,
            description:
              'Lateral position lets copious oral/airway secretions drain and protects against aspiration while you work.',
          },
        ],
        responseCeilings: {
          partialCeiling: 45,
          fullCeiling: 90,
          timeToResponse: 240,
        },
      },
      {
        severity: 'life-threatening',
        description:
          'Decompensating cholinergic crisis — respiratory failure from torrential bronchorrhoea PLUS nicotinic muscle weakness/paralysis of the respiratory muscles. Falling GCS, rising secretions, hypoxia despite oxygen. Needs aggressive escalating atropine (titrate to dry chest), pralidoxime, suction and assisted ventilation NOW or the patient arrests.',
        typicalVitals: {
          pulse: [35, 50],
          respiration: [6, 12], // failing — weakness + exhaustion
          spo2: [70, 84],
          bpSystolic: [70, 90],
          gcs: [3, 8],
        },
        initialSounds: {
          leftLung: 'crackles-coarse',
          rightLung: 'crackles-coarse',
          heartSound: 'bradycardic',
          additionalSounds: ['Torrential bronchorrhoea — airway flooding', 'Respiratory muscle weakness/paralysis', 'Cyanosis', 'Pinpoint pupils', 'Generalised fasciculations then flaccidity'],
          description:
            'Airway flooding with secretions — coarse crackles everywhere, gurgling. Respiratory effort failing from nicotinic weakness. Bradycardic, cyanosed, pinpoint pupils. Pre-arrest: dry the chest with escalating atropine, reactivate AChE with pralidoxime, suction continuously and ventilate.',
        },
        essentialTreatments: ['suction', 'oxygen_nonrebreather', 'atropine_05mg', 'pralidoxime', 'iv_access', 'bvm_ventilation'],
        optimalTreatments: ['suction', 'oxygen_nonrebreather', 'atropine_05mg', 'pralidoxime', 'iv_access', 'bvm_ventilation', 'intubation'],
        beneficialTreatments: ['intubation', 'io_access', 'fluids_500ml'],
        // HARM: suxamethonium — even more dangerous here (prolonged paralysis in
        // a patient already failing; depolarisation worsens the picture). If a
        // definitive airway is needed, a non-depolarising agent / careful plan is
        // used. Real catalog ID → real engine harm.
        contraindicatedTreatments: ['suxamethonium'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['atropine_05mg', 'pralidoxime'],
            synergyMultiplier: 2.2,
            description:
              'Both antidote arms together are the only thing that reverses respiratory failure here — atropine for the wet chest, pralidoxime for the paralysed respiratory muscles.',
          },
          {
            treatments: ['suction', 'bvm_ventilation', 'oxygen_nonrebreather'],
            synergyMultiplier: 1.6,
            description:
              'Continuous suction to keep the airway clear + assisted ventilation with high-flow O2 buys time while the antidotes take effect.',
          },
          {
            treatments: ['atropine_05mg', 'pralidoxime', 'suction', 'bvm_ventilation'],
            synergyMultiplier: 2.5,
            description:
              'Full crisis bundle — escalating atropine to dry the chest, pralidoxime to reactivate AChE, continuous suction and ventilatory support together pull the patient back from arrest.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 2,
            rrReduction: 0,
            hrChange: 0,
            description:
              'Lateral positioning aids secretion drainage in the flooding airway until the airway is definitively secured.',
          },
        ],
        responseCeilings: {
          partialCeiling: 30,
          fullCeiling: 75,
          timeToResponse: 240,
        },
      },
    ],
  },

  // ===========================================================================
  // SYMPTOMATIC BRADYCARDIA
  // ---------------------------------------------------------------------------
  // conditionKey 'bradycardia'. Covers two case flavours that both resolve here:
  //   • cardiac-015 (subcategory 'bradycardia') — MEDICATION-INDUCED (beta-blocker
  //     + CCB overdose: atenolol + diltiazem). Atropine is first-line but often
  //     blunted by the receptor blockade, so the ANTIDOTES carry the lesson:
  //     glucagon (bypasses the beta-receptor via cAMP) + calcium (CCB antagonist).
  //   • cardiac-012 (subcategory 'junctional', aliased → 'bradycardia') —
  //     pacemaker not capturing, native junctional escape. Atropine + pacing.
  // KEY HARM: any AV-nodal blocker (adenosine / metoprolol / diltiazem) abolishes
  // the escape rhythm → asystole. These hit the engine's negative-chronotrope
  // branch (HR−28 / SBP−18) — a genuinely lethal "wrong-drug" move here.
  // ===========================================================================
  {
    condition: 'bradycardia',
    conditionName: 'Symptomatic Bradycardia',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Symptomatic bradycardia — perfusing but compromised: HR <50 with dizziness/fatigue, borderline-low BP, mildly cool peripheries. Covers the pacemaker-not-capturing / junctional-escape patient (cardiac-012) and early medication effect.',
        typicalVitals: {
          pulse: [38, 50],
          respiration: [14, 20],
          spo2: [94, 98],
          bpSystolic: [85, 100],
          gcs: [14, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'bradycardic',
          additionalSounds: ['Slow, regular pulse (<50)', 'Cool peripheries', 'Fatigue / light-headedness', 'Pacemaker spikes may be non-capturing on the monitor'],
          description: 'Clear lungs bilaterally. Slow, regular heart sounds. Perfusing but bradycardic and borderline hypotensive.',
        },
        // Atropine 500 mcg IV is genuinely first-line (repeat q3–5 min, max 3 mg).
        // IV access + O2 round out the immediate bundle.
        essentialTreatments: ['atropine_05mg', 'iv_access', 'oxygen_nonrebreather'],
        optimalTreatments: ['atropine_05mg', 'iv_access', 'oxygen_nonrebreather', 'pacing_transcutaneous', 'fluids_500ml', 'supine_position'],
        beneficialTreatments: ['fluids_500ml', 'supine_position', 'leg_elevation', 'reassurance', 'io_access'],
        // AV-nodal blockers strip away the only thing keeping this heart going —
        // the escape rhythm. Each hits the engine's negative-chronotrope harm
        // branch (HR−28 / SBP−18) and can tip a compensating patient into arrest.
        contraindicatedTreatments: ['adenosine_6mg', 'metoprolol_5mg', 'diltiazem_20mg'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['atropine_05mg', 'iv_access'],
            synergyMultiplier: 1.4,
            description: 'IV access + atropine 500 mcg: first-line vagolytic for symptomatic bradycardia, ready to repeat to a 3 mg maximum',
          },
          {
            treatments: ['atropine_05mg', 'pacing_transcutaneous'],
            synergyMultiplier: 1.8,
            description: 'When atropine fails to lift the rate, transcutaneous pacing provides definitive electrical capture — the ALS escalation step',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: 0,
            description: 'Lay flat (legs raised) to maximise venous return and cerebral perfusion while the rate is low',
          },
          {
            positionId: 'leg_elevation',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: 0,
            description: 'Passive leg raise augments preload and supports BP at a slow rate',
          },
        ],
        responseCeilings: {
          partialCeiling: 55,
          fullCeiling: 90,
          timeToResponse: 180,
        },
      },
      {
        severity: 'life-threatening',
        description: 'Haemodynamically unstable bradycardia — HR <40 with hypotension, reduced GCS, poor perfusion. This is the medication-induced overdose picture (cardiac-015: beta-blocker + CCB) and any peri-arrest bradycardia. Atropine frequently fails against receptor blockade — reach for antidotes and pacing.',
        typicalVitals: {
          pulse: [25, 40],
          respiration: [12, 20],
          spo2: [90, 95],
          bpSystolic: [60, 85],
          gcs: [11, 14],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'bradycardic',
          additionalSounds: ['Profound bradycardia (<40)', 'Hypotension with poor perfusion', 'Confusion / reduced GCS', 'Cap refill prolonged', 'Cold, pale, clammy'],
          description: 'Clear chest. Profoundly slow, weak pulse with hypotension and altered mentation — decompensating bradycardia / shock.',
        },
        // Atropine is still given but expect it to under-perform in beta-blocker /
        // CCB toxicity. The lesson is the ANTIDOTES: glucagon (beta-blocker — raises
        // cAMP independent of the blocked receptor) and calcium (CCB antagonist).
        // Pacing is the electrical bridge. IV/IO access is mandatory for all of it.
        essentialTreatments: ['atropine_05mg', 'iv_access', 'oxygen_nonrebreather', 'pacing_transcutaneous'],
        optimalTreatments: ['atropine_05mg', 'iv_access', 'oxygen_nonrebreather', 'pacing_transcutaneous', 'glucagon_1mg', 'calcium_chloride', 'calcium_gluconate', 'fluids_500ml', 'adrenaline_1mg'],
        beneficialTreatments: ['glucagon_1mg', 'calcium_chloride', 'calcium_gluconate', 'fluids_500ml', 'adrenaline_1mg', 'io_access', 'supine_position'],
        // Same AV-nodal-blocker death-trap, now with even less reserve: giving one
        // to a patient already on a beta-blocker + CCB removes the escape rhythm and
        // precipitates asystole (HR−28 / SBP−18 harm branch).
        contraindicatedTreatments: ['adenosine_6mg', 'metoprolol_5mg', 'diltiazem_20mg'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['glucagon_1mg', 'calcium_chloride'],
            synergyMultiplier: 1.9,
            description: 'Beta-blocker + CCB toxicity antidote pair: glucagon bypasses the beta-receptor (raises cAMP) while calcium overcomes the channel blockade — the cornerstone of toxin-induced bradycardia',
          },
          {
            treatments: ['glucagon_1mg', 'calcium_gluconate'],
            synergyMultiplier: 1.9,
            description: 'Antidote pair with the peripheral-line-safe calcium salt: glucagon for the beta-blockade, calcium gluconate for the calcium-channel blockade',
          },
          {
            treatments: ['atropine_05mg', 'pacing_transcutaneous', 'adrenaline_1mg'],
            synergyMultiplier: 2.1,
            description: 'Full unstable-bradycardia escalation: atropine → transcutaneous pacing → adrenaline infusion as a chronotropic bridge to definitive care',
          },
          {
            treatments: ['atropine_05mg', 'iv_access', 'oxygen_nonrebreather', 'pacing_transcutaneous'],
            synergyMultiplier: 1.8,
            description: 'Core peri-arrest bradycardia bundle: oxygenate, secure access, drug then electrical capture',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: 0,
            description: 'Keep flat with legs elevated — every bit of preload helps maintain cerebral and coronary perfusion at a critically low rate',
          },
        ],
        responseCeilings: {
          partialCeiling: 30,
          fullCeiling: 75,
          timeToResponse: 120,
        },
      },
    ],
  },

  // ===========================================================================
  // COMPLETE (THIRD-DEGREE) HEART BLOCK
  // ---------------------------------------------------------------------------
  // conditionKey 'heart-block' (case cardiac-016). KEY TEACHING: in complete /
  // infranodal block the lesion sits BELOW the AV node, so atropine — which works
  // at the node — is OFTEN INEFFECTIVE on a ventricular escape rhythm. Therefore
  // TRANSCUTANEOUS PACING is essential / first-line, not atropine. Atropine may be
  // tried (it is harmless and occasionally helps a high-nodal block) but the
  // atropine-ONLY response is deliberately capped low. Adrenaline infusion bridges
  // to pacing/PPM. AV-nodal blockers → standstill (the usual HR−28/SBP−18 harm).
  // ===========================================================================
  {
    condition: 'heart-block',
    conditionName: 'Complete (Third-Degree) Heart Block',
    severityLevels: [
      {
        severity: 'moderate',
        description: 'Complete heart block, currently perfusing — AV dissociation with a ventricular escape rhythm, bradycardic and borderline-hypotensive but conscious. Pre-syncopal; one missed escape beat from collapse. Pacing pads should already be on.',
        typicalVitals: {
          pulse: [30, 45],
          respiration: [16, 22],
          spo2: [92, 97],
          bpSystolic: [80, 100],
          gcs: [14, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'bradycardic',
          additionalSounds: ['Slow, regular ventricular escape (~30–45)', 'Cannon A waves in the JVP (AV dissociation)', 'Variable-intensity S1', 'Pale, pre-syncopal'],
          description: 'Clear lungs bilaterally. Slow, regular pulse with cannon A waves and variable S1 — the bedside signature of complete AV dissociation.',
        },
        // Pacing is first-line because the block is below the node. Atropine is
        // listed (worth a try, harmless) but the partialCeiling is set LOW so an
        // atropine-only attempt visibly under-performs — the intended lesson.
        essentialTreatments: ['pacing_transcutaneous', 'iv_access', 'oxygen_nonrebreather'],
        optimalTreatments: ['pacing_transcutaneous', 'iv_access', 'oxygen_nonrebreather', 'atropine_05mg', 'adrenaline_1mg', 'supine_position'],
        beneficialTreatments: ['atropine_05mg', 'adrenaline_1mg', 'fluids_500ml', 'supine_position', 'reassurance', 'io_access'],
        // AV-nodal blockers in CHB remove the escape rhythm → ventricular standstill.
        // Engine negative-chronotrope branch (HR−28 / SBP−18).
        contraindicatedTreatments: ['adenosine_6mg', 'metoprolol_5mg', 'diltiazem_20mg'],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['pacing_transcutaneous', 'iv_access'],
            synergyMultiplier: 1.9,
            description: 'IV access + transcutaneous pacing: definitive electrical capture is the priority in infranodal block — set rate ~60 and increase mA until mechanical capture',
          },
          {
            treatments: ['pacing_transcutaneous', 'adrenaline_1mg'],
            synergyMultiplier: 2.0,
            description: 'Adrenaline infusion supports the escape rate and BP as a pharmacological bridge alongside pacing when capture is intermittent',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: 0,
            description: 'Keep supine — sitting a complete-block patient up can drop cerebral perfusion enough to cause syncope',
          },
        ],
        responseCeilings: {
          // Deliberately LOW so an atropine-only attempt cannot rescue the patient —
          // pacing (in optimal) is what unlocks the full ceiling.
          partialCeiling: 30,
          fullCeiling: 85,
          timeToResponse: 60,
        },
      },
      {
        severity: 'life-threatening',
        description: 'Complete heart block with haemodynamic collapse — very slow, broad ventricular escape (<35) failing to perfuse: profound hypotension, falling GCS, recurrent syncope. Atropine will not fix an infranodal block; immediate transcutaneous pacing is the only thing that captures.',
        typicalVitals: {
          pulse: [20, 35],
          respiration: [14, 24],
          spo2: [88, 94],
          bpSystolic: [55, 80],
          gcs: [9, 13],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'bradycardic',
          additionalSounds: ['Profound bradycardia (<35) with broad escape complexes', 'Hypotension, poor perfusion', 'Recurrent syncope / reduced GCS', 'Cannon A waves', 'Cold and clammy'],
          description: 'Clear chest. Profoundly slow, broad-complex escape rhythm with hypotension and clouding consciousness — a pacing emergency.',
        },
        // PACING is the immediate life-saving intervention. Atropine stays in the
        // optimal list as a try-while-you-set-up step, but pacing is essential.
        // Adrenaline bridges. IV/IO access mandatory.
        essentialTreatments: ['pacing_transcutaneous', 'iv_access', 'oxygen_nonrebreather', 'adrenaline_1mg'],
        optimalTreatments: ['pacing_transcutaneous', 'iv_access', 'oxygen_nonrebreather', 'adrenaline_1mg', 'atropine_05mg', 'fluids_500ml', 'supine_position'],
        beneficialTreatments: ['atropine_05mg', 'fluids_500ml', 'supine_position', 'io_access'],
        contraindicatedTreatments: ['adenosine_6mg', 'metoprolol_5mg', 'diltiazem_20mg'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['pacing_transcutaneous', 'iv_access', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.0,
            description: 'Immediate capture bundle: oxygenate, secure access, and pace — the definitive response to collapsing complete heart block',
          },
          {
            treatments: ['pacing_transcutaneous', 'adrenaline_1mg'],
            synergyMultiplier: 2.2,
            description: 'Transcutaneous pacing plus an adrenaline infusion: electrical capture supported by a chronotropic/inotropic bridge to transvenous pacing or PPM',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 1,
            rrReduction: 0,
            hrChange: 0,
            description: 'Flat with legs raised to defend cerebral perfusion while you achieve capture',
          },
        ],
        responseCeilings: {
          partialCeiling: 20,
          fullCeiling: 80,
          timeToResponse: 45,
        },
      },
    ],
  },

// ============================================================================
// PASTE-READY TreatmentProtocol LITERALS
// Insert into TREATMENT_PROTOCOLS[] in src/data/treatmentProtocols.ts
// (e.g. after the ANAPHYLAXIS block, before ATRIAL FIBRILLATION)
//
// Engine notes:
// - findProtocol() direct-matches p.condition === subcategory, then partial
//   (sub.includes(condition) || condition.includes(sub) when length >= 4).
//   * Croup cases use subcategory 'croup' -> DIRECT match on condition 'croup'. OK.
//   * Burns case 'thermal-burns' partial-matches condition 'burns'
//     ('thermal-burns'.includes('burns') === true). OK, no alias needed.
//   * Burns cases 'flash-burn' and 'scald' do NOT overlap 'burns' -> REQUIRE
//     PROTOCOL_SUBCATEGORY_ALIAS entries (see notes file). Without them they
//     fall through to null and lose this protocol.
// - determineSeverityFromVitals() picks the tier whose typicalVitals best
//   bracket the case's actual vitals (SpO2 & GCS weighted 3, pulse/RR/BP 2).
//   Ranges below are tuned so each target case lands on the intended tier.
// - contraindicatedTreatments[] inflict REAL drug-class vital harm; only honest,
//   genuinely dangerous real ids are listed. Agitation/over-cooling harm is
//   carried in positioning/notes, not faked as a drug.
// ============================================================================

  // ===========================================================================
  // CROUP (viral laryngotracheobronchitis)
  // ===========================================================================
  {
    condition: 'croup',
    conditionName: 'Croup (Viral Laryngotracheobronchitis)',
    severityLevels: [
      {
        severity: 'moderate',
        description:
          'Moderate croup — barking cough, inspiratory stridor at rest, mild-moderate recession, SpO2 >92%. Child distressed but alert and consolable on a parent\'s lap. Stridor worsens markedly with agitation/crying.',
        // Brackets resp-007 (SpO2 94, RR 40, HR 130, BP 90) and y1-007 (SpO2 95, RR 32, HR 120, BP 90).
        typicalVitals: {
          pulse: [110, 145],
          respiration: [28, 42],
          spo2: [92, 96],
          bpSystolic: [80, 110],
          gcs: [15, 15],
        },
        initialSounds: {
          // Stridor is an UPPER-airway sound transmitted over the chest; lung
          // fields themselves are clear with good bilateral air entry.
          leftLung: 'stridor',
          rightLung: 'stridor',
          heartSound: 'tachycardic',
          additionalSounds: [
            'Harsh inspiratory stridor at rest (transmitted over upper chest)',
            'Barking / seal-like cough',
            'Hoarse voice',
            'Stridor worsens when child cries or is examined',
            'Mild-moderate intercostal / subcostal recession',
            'Good air entry bilaterally — NO wheeze',
          ],
          description:
            'Inspiratory stridor transmitted over the upper chest from subglottic narrowing. Good bilateral air entry, no wheeze — this is an upper-airway sound. Barking cough and hoarse voice. Tachycardic (age-appropriate + distress).',
        },
        // KEY TEACHING: keep the child CALM. Dexamethasone is the single most
        // important drug (reduces subglottic oedema over hours). Blow-by O2 only
        // if hypoxic AND non-distressing. Calm environment / parental presence is
        // therapeutic, not just comfort — agitation worsens obstruction.
        essentialTreatments: ['dexamethasone', 'calm_environment'],
        optimalTreatments: ['dexamethasone', 'calm_environment', 'reassurance', 'family_presence', 'oxygen_nasal', 'fowlers_position'],
        beneficialTreatments: ['reassurance', 'family_presence', 'oxygen_nasal', 'fowlers_position'],
        // No pharmacological agent is genuinely drug-class-dangerous in moderate
        // croup, so the contraindicated list is honestly EMPTY. The real harm —
        // distressing the child (throat exam, forced supine, cannulation for no
        // reason) — is modelled via the supine_position penalty below and the
        // clinical notes, NOT by inventing a fake harmful drug id.
        contraindicatedTreatments: [],
        deteriorationRate: 'slow',
        synergies: [
          {
            treatments: ['dexamethasone', 'calm_environment'],
            synergyMultiplier: 1.5,
            description:
              'Keeping the child calm minimises dynamic airway collapse while dexamethasone reduces subglottic oedema — the two cornerstones of moderate croup management.',
          },
          {
            treatments: ['dexamethasone', 'calm_environment', 'family_presence'],
            synergyMultiplier: 1.7,
            description:
              'Child settled on the parent\'s lap with minimal handling + steroid on board = optimal moderate-croup care. Distress is the enemy.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 2,
            rrReduction: 2,
            hrChange: -5,
            description:
              'Letting the child sit upright on a parent\'s lap (position of comfort) keeps them calm and maximises airway calibre.',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: -3,
            rrReduction: 3,
            hrChange: 10,
            description:
              'HARMFUL: forcing a croup child to lie flat distresses them and worsens dynamic upper-airway obstruction — stridor and work of breathing increase. Keep them upright on the parent.',
          },
        ],
        responseCeilings: {
          partialCeiling: 70,
          // Steroid effect is real but takes time; prehospital ceiling is high
          // once the child is settled + dexamethasone given.
          fullCeiling: 95,
          timeToResponse: 600,
        },
      },
      {
        severity: 'severe',
        description:
          'Severe croup — stridor at rest with marked sternal/intercostal recession, agitation or lethargy, SpO2 falling. Air entry becoming reduced. This is a pre-arrest trajectory: rising work of breathing then exhaustion. Nebulised adrenaline is now indicated for stridor at rest.',
        typicalVitals: {
          pulse: [130, 170],
          respiration: [36, 55],
          spo2: [82, 92],
          bpSystolic: [80, 105],
          gcs: [12, 15],
        },
        initialSounds: {
          // Worsening obstruction -> air entry now diminishing despite loud
          // transmitted stridor (the ominous "quiet chest" of severe croup).
          leftLung: 'diminished',
          rightLung: 'diminished',
          heartSound: 'tachycardic',
          additionalSounds: [
            'Loud biphasic stridor audible without stethoscope',
            'Marked sternal recession and tracheal tug',
            'Reducing air entry — OMINOUS (tiring)',
            'Agitation or increasing lethargy',
            'Pallor / early cyanosis',
          ],
          description:
            'Severe subglottic obstruction — loud inspiratory (± expiratory) stridor with markedly reduced air entry and severe recession. Falling air entry with exhaustion is a pre-arrest sign. Needs nebulised adrenaline + steroid now.',
        },
        // Nebulised adrenaline buys time (vasoconstricts mucosa, shrinks oedema
        // within minutes); dexamethasone is still given for the sustained effect.
        // Oxygen now genuinely required for hypoxia — deliver least-distressing way.
        essentialTreatments: ['nebulised_adrenaline', 'dexamethasone', 'oxygen_nonrebreather', 'calm_environment'],
        optimalTreatments: ['nebulised_adrenaline', 'dexamethasone', 'oxygen_nonrebreather', 'calm_environment', 'reassurance', 'family_presence', 'fowlers_position'],
        beneficialTreatments: ['reassurance', 'family_presence', 'fowlers_position', 'oxygen_mask'],
        // Honest, genuinely dangerous entries only:
        // - supine_position: forcing a severely-obstructed, tiring child flat can
        //   precipitate complete obstruction/arrest.
        contraindicatedTreatments: ['supine_position'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['nebulised_adrenaline', 'dexamethasone'],
            synergyMultiplier: 1.8,
            description:
              'Nebulised adrenaline gives rapid (minutes) mucosal vasoconstriction to shrink the swollen subglottis while dexamethasone provides the durable anti-inflammatory effect — the standard severe-croup combination.',
          },
          {
            treatments: ['nebulised_adrenaline', 'dexamethasone', 'oxygen_nonrebreather', 'calm_environment'],
            synergyMultiplier: 2.1,
            description:
              'Full severe-croup bundle: adrenaline neb + steroid + oxygen for hypoxia, all delivered while keeping the child as calm as possible. Minimal handling preserves the airway.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 3,
            rrReduction: 3,
            hrChange: -5,
            description:
              'Upright on the parent maximises airway calibre and keeps the child calm — critical when obstruction is severe.',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: -5,
            rrReduction: 4,
            hrChange: 12,
            description:
              'DANGEROUS: laying a severely-obstructed, tiring croup child flat (or restraining them) can precipitate complete airway obstruction and arrest.',
          },
        ],
        responseCeilings: {
          // Adrenaline effect is dramatic but transient (rebound at ~2h) —
          // prehospital this is a holding measure to a definitive airway/ED.
          partialCeiling: 45,
          fullCeiling: 85,
          timeToResponse: 240,
        },
      },
    ],
  },

  // ===========================================================================
  // BURNS (thermal — including inhalation injury)
  // ===========================================================================
  {
    condition: 'burns',
    conditionName: 'Burns (Thermal / Inhalation)',
    severityLevels: [
      {
        severity: 'moderate',
        description:
          'Moderate burn — partial-thickness burn (roughly 5–20% TBSA) without airway compromise or shock. Patient alert, haemodynamically maintained, pain is the dominant problem. Cool the burn for ~20 min, analgesia, dressings; IV fluids if larger TBSA. NO inhalation injury at this tier.',
        // Brackets y2-004 (SpO2 96, RR 22, HR 110, BP 130) and y1-004 (SpO2 99, RR 22, HR 100, BP 132).
        typicalVitals: {
          pulse: [95, 125],
          respiration: [18, 26],
          spo2: [94, 100],
          bpSystolic: [110, 145],
          gcs: [15, 15],
        },
        initialSounds: {
          // Isolated cutaneous burn — chest is clear, tachycardia is pain/stress.
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: [
            'Clear air entry bilaterally — no inhalation features',
            'Tachypnoea from pain / anxiety',
            'Partial-thickness burn with blistering',
            'Severe pain at burn site',
          ],
          description:
            'Clear lungs bilaterally with good air entry — no soot, hoarseness, or stridor. Tachycardic and mildly tachypnoeic from pain and the early fluid-shift stress response. Burn is cutaneous only.',
        },
        // Cool the BURN (not the patient) for ~20 min; high-flow O2 standard in
        // burns; analgesia is essential (opioid or ketamine). IV access + a
        // titrated bolus if TBSA warrants Parkland; cover the burn.
        essentialTreatments: ['active_cooling', 'oxygen_nonrebreather', 'morphine_5mg'],
        optimalTreatments: ['active_cooling', 'oxygen_nonrebreather', 'morphine_5mg', 'iv_access', 'fluids_500ml', 'fentanyl_50mcg', 'reassurance', 'warming_blanket'],
        beneficialTreatments: ['iv_access', 'fluids_500ml', 'fentanyl_50mcg', 'ketamine_analgesic', 'paracetamol_iv', 'reassurance', 'warming_blanket'],
        // furosemide is genuinely DANGEROUS in burns at any severity: burns cause
        // massive plasma-volume loss into the interstitium — the patient needs
        // fluid RESUSCITATION (Parkland), and a diuretic drives them into
        // hypovolaemic shock and acute kidney injury. Real, honest contraindication.
        contraindicatedTreatments: ['furosemide_40mg'],
        deteriorationRate: 'slow',
        synergies: [
          {
            treatments: ['active_cooling', 'morphine_5mg'],
            synergyMultiplier: 1.4,
            description:
              'Cooling the burn for ~20 min limits the depth of injury and is itself analgesic; combined with an opioid it controls the severe pain that drives the tachycardia.',
          },
          {
            treatments: ['active_cooling', 'iv_access', 'fluids_500ml'],
            synergyMultiplier: 1.6,
            description:
              'Cool the burn + establish IV access + begin Parkland-guided crystalloid: addresses the burn itself and the early fluid shift in a larger-TBSA partial-thickness burn.',
          },
          {
            treatments: ['active_cooling', 'morphine_5mg', 'iv_access', 'fluids_500ml', 'warming_blanket'],
            synergyMultiplier: 1.8,
            description:
              'Full moderate-burn bundle: cool the burn, analgesia, fluids — then keep the PATIENT warm (warming blanket). Cool the burn but never let core temperature drop.',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: -5,
            description: 'Supine is appropriate for burn assessment and analgesia delivery.',
          },
        ],
        responseCeilings: {
          partialCeiling: 65,
          fullCeiling: 95,
          timeToResponse: 300,
        },
      },
      {
        severity: 'life-threatening',
        description:
          'Major burn with INHALATION INJURY / airway threat — large TBSA, soot around mouth/nose, hoarse voice, ± developing stridor, and emerging burn shock (tachycardia, hypotension). Airway can occlude rapidly: EARLY intubation before oedema closes it. High-flow O2 (CO), aggressive Parkland fluid resuscitation, analgesia.',
        // Brackets burn-001 (SpO2 91, RR 28, HR 135, BP 85, GCS 14).
        typicalVitals: {
          pulse: [120, 160],
          respiration: [26, 40],
          spo2: [84, 93],
          bpSystolic: [70, 100],
          gcs: [12, 14],
        },
        initialSounds: {
          // Inhalation injury: upper-airway stridor from laryngeal oedema +
          // lower-airway irritation; air entry reducing as it progresses.
          leftLung: 'stridor',
          rightLung: 'stridor',
          heartSound: 'tachycardic',
          additionalSounds: [
            'Hoarse voice, brassy cough',
            'Carbonaceous (soot) sputum',
            'Soot around nose and mouth, singed facial / nasal hair',
            'Inspiratory stridor — laryngeal oedema developing',
            'SpO2 may read falsely high with CO exposure',
            'Tachycardic and hypotensive — burn shock evolving',
          ],
          description:
            'Inhalation injury — hoarse voice, carbonaceous sputum, soot around the mouth with singed facial hair, and inspiratory stridor signalling laryngeal oedema. The airway is at imminent risk of occlusion. Tachycardia and hypotension mark evolving burn shock. SpO2 may be falsely reassuring (carboxyhaemoglobin).',
        },
        // Early definitive airway BEFORE oedema occludes it; high-flow O2 to
        // displace CO; large-bore IV access + Parkland-guided fluids for burn
        // shock; potent analgesia. BVM available to support if needed.
        essentialTreatments: ['intubation', 'oxygen_nonrebreather', 'iv_access', 'fluids_1000ml'],
        optimalTreatments: ['intubation', 'oxygen_nonrebreather', 'iv_access', 'fluids_1000ml', 'io_access', 'fentanyl_50mcg', 'ketamine_analgesic', 'active_cooling'],
        beneficialTreatments: ['io_access', 'fentanyl_50mcg', 'ketamine_analgesic', 'morphine_5mg', 'active_cooling', 'bvm_ventilation', 'warming_blanket'],
        // Honest, genuinely dangerous entries:
        // - furosemide_40mg: diuresis in a burn-shock patient who needs aggressive
        //   volume = catastrophic hypovolaemia / AKI.
        contraindicatedTreatments: ['furosemide_40mg'],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['intubation', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.2,
            description:
              'Securing the airway EARLY (before laryngeal oedema occludes it) and delivering high-flow O2 to displace carbon monoxide is the single highest-yield action in inhalation injury. Order matters — intubate before the window closes.',
          },
          {
            treatments: ['iv_access', 'fluids_1000ml'],
            synergyMultiplier: 1.7,
            description:
              'Large-bore IV access + aggressive Parkland-guided crystalloid replaces the massive plasma-volume loss of a major burn and treats burn shock. Use Hartmann\'s/Ringer\'s lactate, titrated to TBSA and time-from-burn.',
          },
          {
            treatments: ['intubation', 'oxygen_nonrebreather', 'iv_access', 'fluids_1000ml', 'fentanyl_50mcg'],
            synergyMultiplier: 2.6,
            description:
              'Full major-burn-with-inhalation bundle: early airway + high-flow O2 + Parkland fluids + analgesia. Every element addresses a distinct lethal threat (airway, CO/hypoxia, burn shock, pain).',
          },
        ],
        positioningEffects: [
          {
            positionId: 'fowlers_position',
            spo2Bonus: 2,
            rrReduction: 2,
            hrChange: -3,
            description:
              'Sitting up (if no contraindication) reduces facial/airway oedema and eases work of breathing pre-intubation.',
          },
        ],
        responseCeilings: {
          partialCeiling: 25,
          // Without airway control + fluids almost nothing improves; full bundle
          // can stabilise to ED but mortality risk stays high.
          fullCeiling: 75,
          timeToResponse: 120,
        },
      },
    ],
  },

// ============================================================================
// PASTE-READY TreatmentProtocol LITERALS
// Insert each object into the TREATMENT_PROTOCOLS array in
// src/data/treatmentProtocols.ts (between existing protocol objects).
//
// Engine notes that governed authoring (verified against treatmentProtocols.ts
// + clinicalRealism.ts + enhancedTreatmentEffects.ts):
//   * findProtocol() matches p.condition === resolvedSubcategory (after the local
//     PROTOCOL_SUBCATEGORY_ALIAS), then a guarded substring pass. So condition keys
//     here are 'psychosis' / 'panic' / 'choking'. (Alias entries needed for
//     'acute-psychosis', 'panic-attack', 'hyperventilation-syndrome' — see notes.md.)
//   * contraindicatedTreatments[] = REAL drug-class vital harm. Sedatives/benzos
//     trip RR-4 / SpO2-4 / GCS-2 in the engine, so they are only listed where they
//     are genuinely dangerous (calm/redirectable patient, or a conscious choker).
//   * Where there is NO real id for the hazard (prone/physical-restraint asphyxia,
//     blind finger sweep, thrusts-in-pregnancy/infant), it is carried as a
//     positioning note / description string + clinicalNote, NOT a fake id.
//   * All ids grep-verified to exist exactly once in enhancedTreatmentEffects.ts.
// ============================================================================


  // ===========================================================================
  // ACUTE BEHAVIOURAL DISTURBANCE / PSYCHOSIS
  // conditionKey 'psychosis' → cases psych-002, psych-003 (subcategory 'psychosis');
  // y2-008 (subcategory 'acute-psychosis' → alias 'acute-psychosis'→'psychosis').
  // De-escalation FIRST. Chemical restraint only for severe agitation / danger.
  // Behavioural emergency: vitals stay MODEST (agitation tachycardia/hypertension),
  // NOT a vital-collapse picture. Harm modelled = OVER-sedation (stacking
  // midazolam_5mg + ketamine_sedation → respiratory depression) and prone /
  // physical-restraint positional asphyxia (positioning note — no drug id).
  // ===========================================================================
  {
    condition: 'psychosis',
    conditionName: 'Acute Behavioural Disturbance / Psychosis',
    severityLevels: [
      {
        severity: 'moderate',
        description:
          'Agitated but redirectable — disorganised/paranoid, pacing, responding to internal stimuli, NOT actively violent. Engages with verbal de-escalation. Vitals reflect agitation only (mild tachycardia / hypertension).',
        typicalVitals: {
          pulse: [95, 125],
          respiration: [18, 24],
          spo2: [96, 100],
          bpSystolic: [130, 160],
          gcs: [14, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Agitated, pressured speech', 'Responding to internal stimuli', 'Diaphoretic from psychomotor agitation'],
          description: 'Clear lungs bilaterally — tachypnoea is agitation-driven, not respiratory. Tachycardic from psychomotor agitation. No primary cardiorespiratory pathology.',
        },
        // De-escalation FIRST. Verbal de-escalation is the single essential intervention
        // for a redirectable patient.
        essentialTreatments: ['verbal_deescalation'],
        optimalTreatments: ['verbal_deescalation', 'therapeutic_rapport', 'calm_environment', 'suicide_risk_assessment'],
        beneficialTreatments: ['therapeutic_rapport', 'calm_environment', 'reassurance', 'suicide_risk_assessment', 'mental_health_act'],
        // HARM: chemically restraining a calm/redirectable patient. Benzo + dissociative
        // sedation here is an over-sedation hazard (RR/SpO2/GCS drop) with NO behavioural
        // justification — de-escalation is working. Both sedatives flagged so stacking
        // is doubly penalised. droperidol_5mg is NOT listed (single-agent antipsychotic
        // is the least-harmful chemical option and is appropriate at the severe band).
        contraindicatedTreatments: ['midazolam_5mg', 'ketamine_sedation'],
        deteriorationRate: 'slow',
        synergies: [
          {
            treatments: ['verbal_deescalation', 'calm_environment'],
            synergyMultiplier: 1.4,
            description: 'Reducing environmental stimuli (dim lights, remove audience, one communicator) makes verbal de-escalation far more effective',
          },
          {
            treatments: ['verbal_deescalation', 'therapeutic_rapport'],
            synergyMultiplier: 1.5,
            description: 'Calm, non-confrontational rapport + active de-escalation is the gold-standard non-coercive approach — settles most redirectable patients',
          },
          {
            treatments: ['verbal_deescalation', 'therapeutic_rapport', 'calm_environment'],
            synergyMultiplier: 1.7,
            description: 'Full non-coercive bundle: de-escalation + rapport + controlled environment — avoids any need for restraint',
          },
        ],
        positioningEffects: [],
        responseCeilings: {
          partialCeiling: 75,
          fullCeiling: 100,
          timeToResponse: 300,
        },
      },
      {
        severity: 'severe',
        description:
          'Violent / imminent danger to self or others — not redirectable, actively aggressive, will not engage. After a genuine de-escalation attempt, chemical restraint (single agent) is justified to make the scene safe. Watch for stimulant toxidrome (hyperthermia, extreme tachycardia).',
        typicalVitals: {
          pulse: [120, 160],
          respiration: [20, 30],
          spo2: [94, 99],
          bpSystolic: [140, 180],
          gcs: [14, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Combative, will not engage', 'Profuse diaphoresis', 'Possible hyperthermia if stimulant-driven', 'Exhaustion risk from sustained struggling'],
          description: 'Clear lungs — no primary respiratory pathology. Marked tachycardia from extreme agitation/catecholamine surge. If skin is hot and the patient is hyperthermic, suspect stimulant toxidrome (excited delirium) — a medical emergency.',
        },
        // De-escalation is STILL attempted first (essential). If it fails and the patient
        // is dangerous, ONE chemical-restraint agent is appropriate — droperidol_5mg
        // (butyrophenone, the least-respiratory-depressant option) OR a single dose of
        // midazolam_5mg OR ketamine_sedation. They are listed in optimal (situational),
        // not essential, because the FIRST-line is always de-escalation.
        essentialTreatments: ['verbal_deescalation'],
        optimalTreatments: ['verbal_deescalation', 'therapeutic_rapport', 'droperidol_5mg', 'iv_access', 'oxygen_nasal', 'suicide_risk_assessment', 'mental_health_act'],
        beneficialTreatments: ['droperidol_5mg', 'midazolam_5mg', 'ketamine_sedation', 'iv_access', 'oxygen_nasal', 'calm_environment', 'mental_health_act'],
        // HARM at the severe band is NOT "sedation" (that is now indicated) — it is
        // OVER-sedation by STACKING. The engine has no combination-contraindication, so
        // we do NOT blanket-ban the sedatives here (that would punish correct single-agent
        // restraint). Stacking is discouraged instead by (a) keeping only droperidol_5mg
        // in optimal, (b) the post-sedation monitoring synergy below, and (c) the
        // over-sedation clinicalNote. Positional asphyxia (prone restraint) is captured as
        // a NEGATIVE positioning effect on supine_position note — there is no prone id.
        contraindicatedTreatments: [],
        deteriorationRate: 'moderate',
        synergies: [
          {
            treatments: ['verbal_deescalation', 'droperidol_5mg'],
            synergyMultiplier: 1.5,
            description: 'Verbal de-escalation continued THROUGH chemical restraint keeps the dose low and the patient calmer — sedation supplements, never replaces, de-escalation',
          },
          {
            treatments: ['droperidol_5mg', 'iv_access', 'oxygen_nasal'],
            synergyMultiplier: 1.4,
            description: 'Single-agent sedation WITH IV access + O2 + monitoring is safe restraint: one drug, then watch the airway. Avoid adding a second sedative on top',
          },
          {
            treatments: ['verbal_deescalation', 'therapeutic_rapport', 'droperidol_5mg', 'iv_access'],
            synergyMultiplier: 1.7,
            description: 'Full safe-restraint pathway: de-escalate, build rapport, single sedating agent, IV access for monitoring and fluids (rhabdo/hyperthermia cover)',
          },
        ],
        positioningEffects: [
          {
            positionId: 'recovery_position',
            spo2Bonus: 3,
            rrReduction: 1,
            hrChange: -3,
            description: 'After sedation, lateral/recovery position protects the airway. NEVER restrain prone or hold face-down — positional/restraint asphyxia is a leading cause of restraint death. Sit the patient up or place lateral.',
          },
          {
            positionId: 'supine_position',
            spo2Bonus: -2,
            rrReduction: -1,
            hrChange: 2,
            description: 'DANGER: prone or weighted face-down restraint causes positional asphyxia (compressed chest + exhaustion + catecholamine acidosis). If the patient was restrained prone, get them off their front immediately.',
          },
        ],
        responseCeilings: {
          partialCeiling: 55,
          fullCeiling: 90,
          timeToResponse: 300,
        },
      },
    ],
  },


  // ===========================================================================
  // PANIC ATTACK / HYPERVENTILATION SYNDROME
  // conditionKey 'panic' → psych-001 (category 'anxiety-related', NO subcategory —
  // see notes.md gotcha), y1-008 (subcategory 'panic-attack' → partial-matches
  // 'panic', alias added for safety), y1-012 ('hyperventilation-syndrome' → alias
  // 'hyperventilation-syndrome'→'panic' REQUIRED, no substring match).
  // LOW acuity, benign course. Treatment = reassurance + coached breathing + calm
  // environment. HARM = high-flow O2 / over-investigation escalating anxiety.
  // ===========================================================================
  {
    condition: 'panic',
    conditionName: 'Panic Attack / Hyperventilation Syndrome',
    severityLevels: [
      {
        severity: 'mild',
        description:
          'Acute anxiety / panic with hyperventilation — tachypnoeic, tingling (perioral/peripheral paraesthesia), carpopedal spasm possible, chest tightness, sense of impending doom. SpO2 is HIGH-normal. A diagnosis of exclusion: rule out organic causes, then treat the anxiety, not the numbers.',
        typicalVitals: {
          pulse: [90, 120],
          respiration: [24, 40],
          spo2: [98, 100],
          bpSystolic: [110, 145],
          gcs: [15, 15],
        },
        initialSounds: {
          leftLung: 'clear',
          rightLung: 'clear',
          heartSound: 'tachycardic',
          additionalSounds: ['Deep, sighing, rapid respirations', 'NO wheeze', 'Perioral/peripheral tingling', 'Carpopedal spasm possible'],
          description: 'Clear lungs bilaterally with good air entry — fast deep breathing, NO wheeze or crackles. Tachycardic from anxiety. SpO2 high-normal (often 99-100%). The chest is clinically normal; this is a behavioural/anxiety presentation.',
        },
        // Coached breathing is delivered via reassurance (no breathing_coaching id exists).
        essentialTreatments: ['reassurance'],
        optimalTreatments: ['reassurance', 'calm_environment', 'therapeutic_rapport'],
        beneficialTreatments: ['calm_environment', 'therapeutic_rapport', 'verbal_deescalation'],
        // HARM: applying high-flow O2 to a patient already at 99-100% is unnecessary,
        // reinforces illness behaviour and escalates anxiety; over-investigation (and
        // historically a paper bag) likewise worsen panic and risk hypoxia. oxygen_nasal
        // is included too — even low-flow O2 is the wrong message in a normoxic panic
        // patient and feeds the "I can't breathe" cycle. Honest, mild harm — kept here
        // because the teaching point (treat the person, not the SpO2) is the crux.
        contraindicatedTreatments: ['oxygen_nonrebreather', 'oxygen_nasal'],
        deteriorationRate: 'slow',
        synergies: [
          {
            treatments: ['reassurance', 'calm_environment'],
            synergyMultiplier: 1.5,
            description: 'Calm, low-stimulus environment + steady reassurance and paced/coached breathing breaks the hyperventilation cycle — the definitive prehospital treatment',
          },
          {
            treatments: ['reassurance', 'therapeutic_rapport', 'calm_environment'],
            synergyMultiplier: 1.7,
            description: 'Rapport + reassurance + controlled environment: full non-pharmacological panic management, normalises respiratory rate without any drug or oxygen',
          },
        ],
        positioningEffects: [],
        responseCeilings: {
          partialCeiling: 90,
          fullCeiling: 100,
          timeToResponse: 240,
        },
      },
    ],
  },


  // ===========================================================================
  // CHOKING / FOREIGN BODY AIRWAY OBSTRUCTION (FBAO)
  // conditionKey 'choking' → case resp-009 (subcategory 'choking', complete
  // obstruction, conscious-but-cyanotic → unconscious). Teaching = ORDER:
  //   conscious + effective cough → ENCOURAGE (do not interfere)
  //   conscious + ineffective    → back_blows ↔ abdominal_thrusts, alternate ×5
  //   unconscious                → CPR + look in mouth, magill_forceps /
  //                                laryngoscopy to remove visible FB, surgical_cric
  //                                as the last resort.
  // HARM: blind finger sweep (note — no id); abdominal_thrusts in pregnancy/infant
  // (note). Instrumenting a CONSCIOUS partial obstruction is harmful (laryngospasm,
  // pushing FB distally) → magill/intubation/cric flagged contraindicated there.
  // ===========================================================================
  {
    condition: 'choking',
    conditionName: 'Choking / Foreign Body Airway Obstruction (FBAO)',
    severityLevels: [
      {
        severity: 'severe',
        description:
          'PARTIAL obstruction, patient CONSCIOUS. If the cough is EFFECTIVE — encourage it and do nothing invasive. If the cough is becoming INEFFECTIVE (weak/silent cough, stridor, distress, going quiet) — give up to 5 back blows then up to 5 abdominal thrusts, alternating, reassessing after each.',
        typicalVitals: {
          pulse: [100, 130],
          respiration: [22, 36],
          spo2: [88, 95],
          bpSystolic: [120, 160],
          gcs: [14, 15],
        },
        initialSounds: {
          leftLung: 'stridor',
          rightLung: 'stridor',
          heartSound: 'tachycardic',
          additionalSounds: ['Universal choking sign (clutching throat)', 'Stridor / crowing on inspiration', 'Ineffective or silent cough', 'Unable to speak more than a word', 'Distressed, frightened'],
          description: 'Inspiratory stridor with reduced air entry bilaterally — upper-airway foreign body. Patient conscious, distressed, tachycardic from hypoxic stress. Effective cough = encourage; ineffective cough = back blows then thrusts.',
        },
        // Order is taught via essential + synergies: back_blows FIRST, then abdominal_thrusts.
        essentialTreatments: ['back_blows', 'abdominal_thrusts'],
        optimalTreatments: ['back_blows', 'abdominal_thrusts', 'oxygen_nonrebreather'],
        beneficialTreatments: ['oxygen_nonrebreather', 'reassurance', 'suction'],
        // HARM: do NOT instrument the airway of a CONSCIOUS patient with a partial
        // obstruction. Magill forceps / laryngoscopy / intubation / surgical_cric on a
        // conscious, coughing patient provoke laryngospasm, gagging, vomiting and can
        // drive the FB distal — they belong to the UNCONSCIOUS band only. (Blind finger
        // sweep has no id — see clinicalNote; abdominal_thrusts pregnancy/infant caveat
        // also in clinicalNote, since thrusts ARE correct for the general adult here.)
        contraindicatedTreatments: ['magill_forceps', 'intubation', 'surgical_cric'],
        deteriorationRate: 'fast',
        synergies: [
          {
            treatments: ['back_blows', 'abdominal_thrusts'],
            synergyMultiplier: 1.8,
            description: 'Alternating up to 5 back blows then up to 5 abdominal thrusts (reassess after each) is the correct conscious-adult FBAO sequence — back blows FIRST',
          },
          {
            treatments: ['back_blows', 'abdominal_thrusts', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.0,
            description: 'Clear the obstruction with the back-blow/thrust sequence, then high-flow O2 to correct the hypoxic debt once air can move',
          },
        ],
        positioningEffects: [],
        responseCeilings: {
          partialCeiling: 60,
          fullCeiling: 95,
          timeToResponse: 30,
        },
      },
      {
        severity: 'life-threatening',
        description:
          'COMPLETE obstruction or the patient has become UNCONSCIOUS — no effective air movement, cyanosis, then collapse. Lower to the ground, start CPR (chest compressions generate airway pressure), look in the mouth on each airway check and remove a VISIBLE foreign body with Magill forceps under laryngoscopy. Surgical cricothyroidotomy is the last resort if the airway cannot be cleared.',
        typicalVitals: {
          pulse: [40, 140],
          respiration: [0, 6],
          spo2: [60, 80],
          bpSystolic: [70, 110],
          gcs: [3, 11],
        },
        initialSounds: {
          leftLung: 'absent',
          rightLung: 'absent',
          heartSound: 'tachycardic',
          additionalSounds: ['No air movement', 'Cyanosis / central cyanosis', 'Unconscious or rapidly deteriorating', 'Pre-arrest from hypoxia'],
          description: 'ABSENT breath sounds bilaterally — complete airway obstruction, no air entry despite effort (or no effort if unconscious). Profound hypoxia driving cyanosis and pre-arrest. Definitive: CPR + visualise + remove FB; surgical airway if all else fails.',
        },
        // Unconscious complete FBAO: CPR + direct visualisation + Magill removal of a
        // VISIBLE FB; surgical_cric is the genuine last resort. Magill forceps and
        // surgical airway are now CORRECT (they were contraindicated only while conscious).
        essentialTreatments: ['suction', 'magill_forceps', 'bvm_ventilation'],
        optimalTreatments: ['suction', 'magill_forceps', 'bvm_ventilation', 'oxygen_nonrebreather', 'surgical_cric', 'intubation'],
        beneficialTreatments: ['surgical_cric', 'intubation', 'oxygen_nonrebreather'],
        // Once the FB is OUT, ventilation works; until then, nothing oxygenates. No drug
        // class is harmful here — the danger is delay. Blind finger sweep still wrong
        // (clinicalNote). bvm_ventilation BEFORE the FB is removed will not ventilate a
        // fully obstructed airway but is not itself harmful (and is needed the instant the
        // airway clears), so it is essential rather than contraindicated.
        contraindicatedTreatments: [],
        deteriorationRate: 'rapid',
        synergies: [
          {
            treatments: ['magill_forceps', 'suction'],
            synergyMultiplier: 2.2,
            description: 'Direct laryngoscopy: suction to clear secretions/vomit so the cords are visible, then Magill forceps to grasp and remove the visible foreign body. Order matters — see, clear, remove',
          },
          {
            treatments: ['magill_forceps', 'suction', 'bvm_ventilation'],
            synergyMultiplier: 2.5,
            description: 'Remove the FB (suction + Magill), then immediately ventilate (BVM/O2) the now-patent airway — this is the moment hypoxia starts to reverse',
          },
          {
            treatments: ['surgical_cric', 'oxygen_nonrebreather'],
            synergyMultiplier: 2.4,
            description: 'Last resort: when the obstruction is unrelievable from above, a surgical cricothyroidotomy bypasses it and high-flow O2 oxygenates below the blockage',
          },
        ],
        positioningEffects: [
          {
            positionId: 'supine_position',
            spo2Bonus: 0,
            rrReduction: 0,
            hrChange: 0,
            description: 'Supine on a firm surface to deliver CPR and perform laryngoscopy/Magill removal of the foreign body',
          },
        ],
        responseCeilings: {
          partialCeiling: 25,
          fullCeiling: 90,
          timeToResponse: 30,
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
/**
 * Canonical subcategory aliases so synonyms / spelling variants resolve to the
 * right protocol key. Mirrors clinicalRealism's SUBCATEGORY_ALIAS (kept local to
 * avoid a circular import) plus ACS-spectrum routing. Only clinically-sound
 * mappings to an existing protocol that genuinely fits the pathology.
 */
const PROTOCOL_SUBCATEGORY_ALIAS: Record<string, string> = {
  'acute-coronary-syndrome': 'stem-anterior',
  'acs': 'stem-anterior',
  'aflutter': 'afib', // atrial flutter — same rate-control management as AF
  'electrolyte-emergency': 'electrolyte',
  'extremity-trauma': 'multi-trauma',
  'heat-exhaustion': 'heat-stroke',
  'post-surgical': 'sepsis',
  'junctional': 'bradycardia',
  'flash-burn': 'burns',
  'scald': 'burns',
  'acute-psychosis': 'psychosis',
  'panic-attack': 'panic',
  'hyperventilation-syndrome': 'panic',
  'febrile-seizure': 'seizure',
};

export function findProtocol(subcategory: string, category?: string): TreatmentProtocol | null {
  const rawSub = (subcategory || '').toLowerCase();
  const cat = (category || '').toLowerCase();
  // Resolve known aliases first so e.g. 'acute-coronary-syndrome' attaches to the
  // deep STEMI protocol instead of falling through to null.
  const sub = PROTOCOL_SUBCATEGORY_ALIAS[rawSub] || rawSub;

  // No subcategory → do NOT guess. Previously the substring pass below matched the
  // FIRST protocol via `p.condition.includes('')` (always true), silently giving
  // every subcategory-less case the asthma protocol — e.g. panic, falls, syncope
  // inherited asthma's beta-blocker contraindication penalty. Bail out instead.
  if (!sub) return null;

  // Direct match on condition
  let protocol = TREATMENT_PROTOCOLS.find(p => p.condition === sub);
  if (protocol) return protocol;

  // Partial match — guarded so a trivially-short string can't match everything
  // and a long subcategory can't match a tiny condition key.
  if (sub.length >= 4) {
    protocol = TREATMENT_PROTOCOLS.find(p =>
      sub.includes(p.condition) || (p.condition.length >= 4 && p.condition.includes(sub)));
    if (protocol) return protocol;
  }

  // Match on category
  if (cat.includes('cardiac') && sub.includes('arrest')) {
    return TREATMENT_PROTOCOLS.find(p => p.condition === 'cardiac-arrest') || null;
  }
  if (cat.includes('cardiac') && (sub.includes('stem') || sub.includes('nstemi') || sub.includes('acs') || sub.includes('coronary'))) {
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
  const severityRank: Record<ConditionSeverity, number> = {
    mild: 0,
    moderate: 1,
    severe: 2,
    'life-threatening': 3,
  };

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

    // When two tiers fit equally well, bias toward the higher-acuity pathway.
    // This prevents a hypotensive patient from inheriting a stable protocol
    // merely because the stable tier appeared first in the data array.
    if (score > bestScore || (score === bestScore && severityRank[level.severity] > severityRank[bestMatch.severity])) {
      bestScore = score;
      bestMatch = level;
    }
  }

  // Do not route a hypotensive patient through a lower-acuity tier whose own
  // BP range excludes them when a higher-acuity tier explicitly includes that
  // pressure. This is particularly important for therapies such as GTN, where
  // the stable and shock pathways intentionally diverge.
  const bpSys = parseInt(String(vitals.bp).split('/')[0]) || 120;
  if (bpSys < 100 && !(bpSys >= bestMatch.typicalVitals.bpSystolic[0] && bpSys <= bestMatch.typicalVitals.bpSystolic[1])) {
    const hypotensiveHigherAcuity = protocol.severityLevels
      .filter(level =>
        severityRank[level.severity] > severityRank[bestMatch.severity]
        && bpSys >= level.typicalVitals.bpSystolic[0]
        && bpSys <= level.typicalVitals.bpSystolic[1])
      .sort((a, b) => severityRank[b.severity] - severityRank[a.severity])[0];

    if (hypotensiveHigherAcuity) bestMatch = hypotensiveHigherAcuity;
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
