/**
 * Clinical Sounds System
 *
 * Generates and manages clinical audio (respiratory sounds, heart sounds)
 * using the Web Audio API. Sounds change dynamically based on patient condition
 * and treatment responses.
 *
 * Sound Categories:
 * - Respiratory: wheeze, crackles, stridor, diminished, clear
 * - Cardiac: normal S1S2, murmur, irregular, gallop
 * - Patient: groaning, distressed breathing, snoring airway
 */

// ============================================================================
// TYPES
// ============================================================================

export type BreathSoundType =
  | 'clear'           // Normal vesicular breath sounds
  | 'wheeze'          // High-pitched musical sound (asthma/COPD)
  | 'crackles-fine'   // Fine inspiratory crackles (pulmonary edema, pneumonia)
  | 'crackles-coarse' // Coarse crackles (secretions, bronchitis)
  | 'stridor'         // Harsh inspiratory sound (upper airway obstruction)
  | 'diminished'      // Reduced air entry (pneumothorax, effusion)
  | 'absent'          // No breath sounds (tension pneumothorax, arrest)
  | 'rhonchi'         // Low-pitched rumbling (mucus in large airways)
  | 'pleural-rub'     // Creaking sound (pleurisy)
  | 'snoring'         // Sonorous - partial upper airway obstruction
  ;

export type HeartSoundType =
  | 'normal'          // Regular S1S2
  | 'tachycardic'     // Fast regular
  | 'bradycardic'     // Slow regular
  | 'irregular'       // AF, ectopics
  | 'muffled'         // Cardiac tamponade
  | 'gallop'          // S3/S4 heart failure
  | 'murmur-systolic' // Systolic murmur
  | 'absent'          // Cardiac arrest
  ;

export interface ClinicalSoundState {
  leftLung: BreathSoundType;
  rightLung: BreathSoundType;
  heartSound: HeartSoundType;
  additionalSounds: string[];  // e.g., "audible wheeze", "gurgling", "stridor heard without stethoscope"
  description: string;         // Human-readable description for display
}

export interface AuscultationFinding {
  location: 'left-upper' | 'left-lower' | 'right-upper' | 'right-lower' | 'anterior' | 'posterior';
  sound: BreathSoundType;
  description: string;
}

// ============================================================================
// SOUND DESCRIPTIONS - What the student "hears" (text-based for now)
// ============================================================================

export const BREATH_SOUND_DESCRIPTIONS: Record<BreathSoundType, {
  name: string;
  description: string;
  clinicalSignificance: string;
  audioDescription: string;
}> = {
  'clear': {
    name: 'Clear Breath Sounds',
    description: 'Normal vesicular breath sounds bilaterally. Good air entry throughout all lung fields.',
    clinicalSignificance: 'Normal finding — adequate ventilation',
    audioDescription: 'Soft rustling sound, louder on inspiration'
  },
  'wheeze': {
    name: 'Bilateral Wheeze',
    description: 'High-pitched musical expiratory wheeze heard bilaterally. Polyphonic wheeze throughout all lung fields.',
    clinicalSignificance: 'Bronchospasm — consider asthma, COPD exacerbation, anaphylaxis',
    audioDescription: 'Musical whistling on expiration, may be heard without stethoscope in severe cases'
  },
  'crackles-fine': {
    name: 'Fine Inspiratory Crackles',
    description: 'Fine, late-inspiratory crackles heard at both lung bases. Velcro-like quality.',
    clinicalSignificance: 'Fluid in alveoli — pulmonary edema, pneumonia, fibrosis',
    audioDescription: 'Like rubbing hair near your ear, or separating Velcro slowly'
  },
  'crackles-coarse': {
    name: 'Coarse Crackles',
    description: 'Coarse, bubbly crackles heard throughout inspiration and expiration. Suggests fluid/secretions in larger airways.',
    clinicalSignificance: 'Secretions in large airways — bronchitis, aspiration, pulmonary edema',
    audioDescription: 'Bubbling or gurgling sound, like blowing through a straw in water'
  },
  'stridor': {
    name: 'Stridor',
    description: 'Harsh, high-pitched inspiratory stridor. Suggests significant upper airway narrowing.',
    clinicalSignificance: 'EMERGENCY — upper airway obstruction. Consider foreign body, epiglottitis, anaphylaxis, croup',
    audioDescription: 'Harsh crowing sound on inspiration, often audible without stethoscope'
  },
  'diminished': {
    name: 'Diminished Breath Sounds',
    description: 'Markedly reduced air entry. Breath sounds barely audible.',
    clinicalSignificance: 'Reduced ventilation — pneumothorax, large effusion, severe bronchospasm, splinting from pain',
    audioDescription: 'Very faint or distant breath sounds, significantly quieter than expected'
  },
  'absent': {
    name: 'Absent Breath Sounds',
    description: 'No breath sounds detected on auscultation. Silent chest.',
    clinicalSignificance: 'CRITICAL — tension pneumothorax, massive effusion, near-fatal asthma, cardiac arrest',
    audioDescription: 'Complete silence on the affected side'
  },
  'rhonchi': {
    name: 'Rhonchi',
    description: 'Low-pitched, continuous rumbling sounds. Heard on expiration, may clear with coughing.',
    clinicalSignificance: 'Mucus/secretions in large airways — bronchitis, COPD, aspiration',
    audioDescription: 'Low-pitched snoring or rumbling sound, like a low moan'
  },
  'pleural-rub': {
    name: 'Pleural Friction Rub',
    description: 'Creaking, grating sound heard during both inspiration and expiration.',
    clinicalSignificance: 'Inflamed pleural surfaces rubbing — pleurisy, PE, pneumonia',
    audioDescription: 'Like leather creaking or walking on fresh snow'
  },
  'snoring': {
    name: 'Sonorous/Snoring Respiration',
    description: 'Loud snoring-type breathing indicating partial upper airway obstruction by the tongue.',
    clinicalSignificance: 'Partial airway obstruction — reduced consciousness, needs airway management',
    audioDescription: 'Loud snoring sound synchronous with breathing'
  },
};

// ============================================================================
// CONDITION-TO-SOUND MAPPING
// ============================================================================

/**
 * Determine initial clinical sounds based on case category, presentation,
 * and — when available — the severity-aware treatment protocol system.
 */
export function getInitialSounds(
  caseCategory: string,
  subcategory?: string,
  findings?: string[],
  initialVitals?: { spo2?: number; pulse?: number; respiration?: number; gcs?: number },
): ClinicalSoundState {
  const cat = caseCategory.toLowerCase();
  const sub = (subcategory || '').toLowerCase();
  const findingsStr = (findings || []).join(' ').toLowerCase();

  // ----- TRY SEVERITY-AWARE PROTOCOL SOUNDS FIRST -----
  // Lazily import to avoid circular deps
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { findProtocol, determineSeverityFromVitals } = require('./treatmentProtocols');
    const protocol = findProtocol(subcategory || '', caseCategory);
    if (protocol && initialVitals) {
      const vitals = {
        pulse: initialVitals.pulse ?? 80,
        spo2: initialVitals.spo2 ?? 98,
        respiration: initialVitals.respiration ?? 16,
        bp: '120/80',
        gcs: initialVitals.gcs ?? 15,
      };
      const severityLevel = determineSeverityFromVitals(protocol, vitals);
      if (severityLevel?.initialSounds) {
        return {
          leftLung: severityLevel.initialSounds.leftLung,
          rightLung: severityLevel.initialSounds.rightLung,
          heartSound: severityLevel.initialSounds.heartSound,
          additionalSounds: severityLevel.initialSounds.additionalSounds,
          description: severityLevel.initialSounds.description,
        };
      }
    }
  } catch {
    // Protocol system not available — fall through to legacy mapping
  }

  // ----- LEGACY CATEGORY-BASED MAPPING (fallback) -----

  // Respiratory cases
  if (cat === 'respiratory') {
    if (sub.includes('asthma') || findingsStr.includes('wheez') || findingsStr.includes('bronchospasm')) {
      // Severity-based asthma sounds (fallback when protocol not matched)
      const spo2 = initialVitals?.spo2 ?? 94;
      const rr = initialVitals?.respiration ?? 24;

      if (spo2 < 85 || rr < 12) {
        // Life-threatening — silent chest
        return {
          leftLung: 'absent',
          rightLung: 'absent',
          heartSound: 'tachycardic',
          additionalSounds: ['SILENT CHEST — no air movement', 'Exhaustion', 'Cyanosis'],
          description: 'SILENT CHEST — no breath sounds despite respiratory effort. CRITICAL — near-complete airway obstruction.',
        };
      }
      if (spo2 < 90) {
        // Severe — diminished
        return {
          leftLung: 'diminished',
          rightLung: 'diminished',
          heartSound: 'tachycardic',
          additionalSounds: ['Severely diminished air entry', 'Severe accessory muscle use', 'Unable to complete sentences'],
          description: 'Severely diminished air entry bilaterally — poor air movement due to critical bronchospasm.',
        };
      }
      return {
        leftLung: 'wheeze',
        rightLung: 'wheeze',
        heartSound: 'tachycardic',
        additionalSounds: ['Audible wheeze on expiration', 'Use of accessory muscles'],
        description: 'Bilateral expiratory wheeze with prolonged expiratory phase. Tachycardic heart sounds.'
      };
    }
    if (sub.includes('copd') || findingsStr.includes('copd')) {
      return {
        leftLung: 'wheeze',
        rightLung: 'rhonchi',
        heartSound: 'tachycardic',
        additionalSounds: ['Pursed-lip breathing', 'Barrel chest'],
        description: 'Mixed wheeze and rhonchi bilaterally. Prolonged expiration. Poor air entry at bases.'
      };
    }
    if (sub.includes('pneumothorax') || findingsStr.includes('pneumothorax')) {
      const isTension = sub.includes('tension') || findingsStr.includes('tension');
      return {
        leftLung: isTension ? 'absent' : 'diminished',
        rightLung: 'clear',
        heartSound: isTension ? 'tachycardic' : 'normal',
        additionalSounds: isTension
          ? ['Tracheal deviation to right', 'Distended neck veins', 'Hyper-resonant left chest']
          : ['Reduced chest expansion on left'],
        description: isTension
          ? 'ABSENT breath sounds on the left. Clear on the right. Tracheal deviation noted.'
          : 'Diminished breath sounds on the left. Clear air entry on the right.'
      };
    }
    if (sub.includes('pneumonia') || findingsStr.includes('pneumonia') || findingsStr.includes('consolidation')) {
      return {
        leftLung: 'crackles-fine',
        rightLung: 'clear',
        heartSound: 'tachycardic',
        additionalSounds: ['Productive cough', 'Fever'],
        description: 'Fine inspiratory crackles at left base with bronchial breathing. Clear right lung.'
      };
    }
    if (sub.includes('pulmonary-embolism') || findingsStr.includes('embolism')) {
      return {
        leftLung: 'clear',
        rightLung: 'clear',
        heartSound: 'tachycardic',
        additionalSounds: ['Clear lungs despite significant hypoxia', 'Pleuritic chest pain'],
        description: 'Lungs surprisingly clear despite hypoxia. Tachycardic. Consider PE if hypoxic with clear lungs.'
      };
    }
    // Default respiratory
    return {
      leftLung: 'wheeze',
      rightLung: 'wheeze',
      heartSound: 'tachycardic',
      additionalSounds: ['Increased work of breathing'],
      description: 'Bilateral wheeze with increased work of breathing.'
    };
  }

  // Cardiac cases
  if (cat === 'cardiac' || cat === 'cardiac-ecg') {
    if (sub.includes('arrest') || findingsStr.includes('arrest') || findingsStr.includes('pulseless')) {
      return {
        leftLung: 'absent',
        rightLung: 'absent',
        heartSound: 'absent',
        additionalSounds: ['No pulse palpable', 'Agonal gasps may be present'],
        description: 'No breath sounds. No heart sounds. Cardiac arrest.'
      };
    }
    if (sub.includes('heart-failure') || findingsStr.includes('heart failure') || findingsStr.includes('pulmonary edema') || findingsStr.includes('pulmonary oedema')) {
      return {
        leftLung: 'crackles-fine',
        rightLung: 'crackles-fine',
        heartSound: 'gallop',
        additionalSounds: ['Peripheral edema', 'JVP elevated', 'Pink frothy sputum'],
        description: 'Bilateral fine crackles to mid-zones. S3 gallop rhythm. Signs of fluid overload.'
      };
    }
    if (findingsStr.includes('tamponade')) {
      return {
        leftLung: 'clear',
        rightLung: 'clear',
        heartSound: 'muffled',
        additionalSounds: ['Muffled heart sounds', 'Distended neck veins', 'Hypotension (Beck\'s triad)'],
        description: 'Clear lungs. Muffled heart sounds. Consider cardiac tamponade.'
      };
    }
    // Default cardiac (MI, ACS)
    return {
      leftLung: 'clear',
      rightLung: 'clear',
      heartSound: 'tachycardic',
      additionalSounds: ['Diaphoresis', 'Chest pain'],
      description: 'Clear lungs bilaterally. Tachycardic heart sounds. Regular rhythm.'
    };
  }

  // Trauma cases
  if (cat === 'trauma') {
    if (findingsStr.includes('chest') || findingsStr.includes('thorax') || findingsStr.includes('rib')) {
      return {
        leftLung: 'diminished',
        rightLung: 'clear',
        heartSound: 'tachycardic',
        additionalSounds: ['Chest wall tenderness', 'Guarding on affected side'],
        description: 'Diminished breath sounds on the injured side. Clear contralateral lung.'
      };
    }
    // Default trauma
    return {
      leftLung: 'clear',
      rightLung: 'clear',
      heartSound: 'tachycardic',
      additionalSounds: ['Tachycardic — likely compensating for blood loss'],
      description: 'Clear lungs bilaterally. Tachycardic.'
    };
  }

  // Neurological — may have airway compromise
  if (cat === 'neurological') {
    if (findingsStr.includes('unconscious') || findingsStr.includes('unresponsive') || findingsStr.includes('gcs')) {
      return {
        leftLung: 'snoring',
        rightLung: 'snoring',
        heartSound: 'normal',
        additionalSounds: ['Sonorous breathing', 'Partial airway obstruction by tongue'],
        description: 'Snoring respirations indicating partial airway obstruction. Needs airway management.'
      };
    }
    return {
      leftLung: 'clear',
      rightLung: 'clear',
      heartSound: 'normal',
      additionalSounds: [],
      description: 'Clear lungs bilaterally. Normal heart sounds.'
    };
  }

  // Default for all other cases
  return {
    leftLung: 'clear',
    rightLung: 'clear',
    heartSound: 'normal',
    additionalSounds: [],
    description: 'Clear lungs bilaterally. Normal heart sounds.'
  };
}

/**
 * Update clinical sounds after treatment.
 * Returns new sound state based on what treatment was applied, how many times,
 * and what other treatments are also active (for combination synergy effects).
 */
export function updateSoundsAfterTreatment(
  currentSounds: ClinicalSoundState,
  treatmentId: string,
  applicationCount: number, // How many times this treatment has been applied
  caseCategory: string,
  allAppliedTreatments?: string[], // All treatments that have been given so far
  caseSubcategory?: string,
): ClinicalSoundState {
  const sounds = { ...currentSounds };
  const cat = caseCategory.toLowerCase();
  const sub = (caseSubcategory || '').toLowerCase();
  const applied = new Set(allAppliedTreatments || []);

  // Helper: check if ipratropium has also been given (for combination bronchodilator therapy)
  const hasIpratropium = applied.has('nebulizer_ipratropium');
  const hasSteroid = applied.has('hydrocortisone_200mg');
  const hasAdrenaline = applied.has('adrenaline_im') || applied.has('adrenaline_1mg');
  const hasMagnesium = applied.has('magnesium_2g');
  const isAsthmaOrCopd = sub.includes('asthma') || sub.includes('copd') || cat === 'respiratory';

  switch (treatmentId) {
    case 'nebulizer_salbutamol': {
      // Salbutamol: Progressive improvement in bronchospasm
      // Response depends on severity (sound state) AND what other treatments are active
      const hasRespiratoryFindings = sounds.leftLung === 'wheeze' || sounds.rightLung === 'wheeze' ||
        sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished' ||
        sounds.leftLung === 'rhonchi' || sounds.rightLung === 'rhonchi' ||
        sounds.leftLung === 'absent' || sounds.rightLung === 'absent';

      if (hasRespiratoryFindings && isAsthmaOrCopd) {
        // Life-threatening / silent chest — salbutamol alone has minimal effect
        if (sounds.leftLung === 'absent' || sounds.rightLung === 'absent') {
          if (hasAdrenaline && hasIpratropium) {
            // With adrenaline + ipratropium, may start hearing some wheeze (improvement from silent!)
            sounds.leftLung = sounds.leftLung === 'absent' ? 'diminished' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'absent' ? 'diminished' : sounds.rightLung;
            sounds.description = 'Some air movement returning after combined bronchodilator therapy. Still critically limited.';
            sounds.additionalSounds = ['Faint wheeze now audible — air starting to move', 'Still in significant distress'];
          } else if (hasIpratropium) {
            // With ipratropium, very slight improvement
            sounds.description = 'Minimal response to salbutamol in near-fatal bronchospasm. Consider IM adrenaline and IV magnesium.';
            sounds.additionalSounds = ['Minimal air movement', 'Near-silent chest persists', 'Escalate treatment urgently'];
          } else {
            // Salbutamol alone in silent chest — very limited effect
            sounds.description = 'Salbutamol nebulized but minimal drug delivery to obstructed airways. Silent chest persists. Escalate immediately — add ipratropium, IM adrenaline, steroids.';
            sounds.additionalSounds = ['No significant improvement', 'Silent chest persists', 'Needs combination therapy urgently'];
          }
          break;
        }

        // Severe (diminished) — response depends on combination therapy
        if (sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished') {
          if (hasIpratropium && (hasSteroid || hasAdrenaline)) {
            // Good combination → meaningful improvement
            sounds.leftLung = sounds.leftLung === 'diminished' ? 'wheeze' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'diminished' ? 'wheeze' : sounds.rightLung;
            sounds.description = 'Air entry improving with combination therapy. Wheeze now audible (positive sign — air is moving). Continue treatment.';
            sounds.additionalSounds = ['Wheeze returning — indicates improving air movement', 'Work of breathing reducing'];
          } else if (hasIpratropium) {
            sounds.description = 'Slight improvement with dual bronchodilation. Air entry still significantly reduced. Consider steroids and adrenaline.';
            sounds.additionalSounds = ['Marginal improvement', 'Still significant bronchospasm'];
          } else {
            // Salbutamol alone — partial at best
            if (applicationCount >= 2) {
              sounds.description = 'Second salbutamol given. Limited improvement with salbutamol alone in severe bronchospasm. Add ipratropium and systemic treatments.';
            } else {
              sounds.description = 'First salbutamol given. Limited response expected in severe bronchospasm with single agent. Prepare ipratropium, steroids.';
            }
            sounds.additionalSounds = ['Limited response to salbutamol alone', 'Combination therapy needed'];
          }
          break;
        }

        // Moderate (wheeze) — standard dose-dependent response, enhanced by combinations
        if (sounds.leftLung === 'wheeze' || sounds.rightLung === 'wheeze') {
          const combinationBonus = (hasIpratropium ? 1 : 0) + (hasSteroid ? 1 : 0) + (hasAdrenaline ? 1 : 0) + (hasMagnesium ? 1 : 0);
          const effectiveDose = applicationCount + combinationBonus;

          if (effectiveDose >= 4) {
            // Full protocol or multiple doses — near-complete resolution
            sounds.leftLung = 'clear';
            sounds.rightLung = 'clear';
            sounds.description = 'Lungs now clear with comprehensive bronchodilator therapy. Good bilateral air entry. Excellent response to combination treatment.';
            sounds.additionalSounds = ['Air entry now equal bilaterally', 'No residual wheeze', 'Work of breathing normalised'];
          } else if (effectiveDose >= 2) {
            // Significant improvement — wheeze resolving toward clear
            sounds.leftLung = sounds.leftLung === 'wheeze' ? 'clear' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'wheeze' ? 'clear' : sounds.rightLung;
            sounds.description = hasIpratropium
              ? 'Significant improvement with combined salbutamol and ipratropium. Wheeze resolved. Good bilateral air entry.'
              : 'Wheeze resolved after repeat salbutamol. Consider adding ipratropium if symptoms recur.';
            sounds.additionalSounds = hasIpratropium
              ? ['Lungs clear with dual bronchodilation', 'Good air entry bilaterally']
              : ['Wheeze resolved', 'Good air entry returning', 'Monitor for recurrence'];
          } else {
            // First dose, no combination
            sounds.description = 'Wheeze slightly improved after first salbutamol nebulizer. Still significant bronchospasm. Consider repeat dose and add ipratropium.';
            sounds.additionalSounds = ['Wheeze improving but still present', 'Work of breathing slightly reduced'];
          }
          break;
        }

        // Rhonchi (COPD pattern)
        if (sounds.leftLung === 'rhonchi' || sounds.rightLung === 'rhonchi') {
          if (applicationCount >= 2 || hasIpratropium) {
            sounds.leftLung = sounds.leftLung === 'rhonchi' ? 'diminished' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'rhonchi' ? 'diminished' : sounds.rightLung;
            sounds.description = 'Rhonchi clearing with bronchodilator therapy. Air entry improving.';
            sounds.additionalSounds = ['Secretions clearing', 'Improving air entry'];
          } else {
            sounds.description = 'Partial response after salbutamol. Rhonchi still present. Consider ipratropium.';
            sounds.additionalSounds = ['Slight improvement in air movement', 'Rhonchi persisting'];
          }
          break;
        }
      } else if (hasRespiratoryFindings) {
        // Non-respiratory case — original basic logic
        if (applicationCount === 1) {
          sounds.description = 'Wheeze slightly improved after salbutamol. Still present.';
          sounds.additionalSounds = ['Wheeze improving but still present'];
        } else if (applicationCount >= 2) {
          sounds.leftLung = sounds.leftLung === 'wheeze' ? 'clear' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'wheeze' ? 'clear' : sounds.rightLung;
          sounds.description = 'Wheeze resolved after repeat salbutamol.';
          sounds.additionalSounds = ['Air entry now clear bilaterally'];
        }
      }
      break;
    }

    case 'nebulizer_ipratropium': {
      // Ipratropium: Complementary bronchodilation — works via different mechanism to salbutamol
      const hasSalbutamol = applied.has('nebulizer_salbutamol');
      const hasRespiratoryIssues = sounds.leftLung === 'wheeze' || sounds.rightLung === 'wheeze' ||
        sounds.leftLung === 'rhonchi' || sounds.rightLung === 'rhonchi' ||
        sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished' ||
        sounds.leftLung === 'absent' || sounds.rightLung === 'absent';

      if (hasRespiratoryIssues) {
        if (sounds.leftLung === 'absent' || sounds.rightLung === 'absent') {
          // Silent chest — ipratropium alone not enough, but note it's been given
          sounds.description = hasSalbutamol
            ? 'Dual bronchodilation in progress for severe bronchospasm. Minimal change yet — consider IM adrenaline.'
            : 'Ipratropium given. Very limited drug delivery to obstructed airways. Give salbutamol concurrently.';
          sounds.additionalSounds = hasSalbutamol
            ? ['Dual bronchodilation initiated', 'Awaiting response', 'Consider systemic adrenaline']
            : ['Ipratropium alone insufficient', 'Add salbutamol urgently'];
        } else if (hasSalbutamol) {
          // Combined with salbutamol — enhanced effect
          if (sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished') {
            sounds.leftLung = sounds.leftLung === 'diminished' ? 'wheeze' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'diminished' ? 'wheeze' : sounds.rightLung;
            sounds.description = 'Dual bronchodilation showing effect — air movement improving. Wheeze now audible (positive sign). Continue treatment.';
            sounds.additionalSounds = ['Air entry improving with combination therapy', 'Wheeze returning as airways open'];
          } else {
            sounds.leftLung = sounds.leftLung === 'wheeze' ? 'clear' : sounds.leftLung === 'rhonchi' ? 'clear' : sounds.leftLung;
            sounds.rightLung = sounds.rightLung === 'wheeze' ? 'clear' : sounds.rightLung === 'rhonchi' ? 'clear' : sounds.rightLung;
            sounds.description = 'Good response to combined salbutamol and ipratropium. Bronchospasm resolved.';
            sounds.additionalSounds = ['Dual bronchodilation effective', 'Lungs clearing', 'Air entry normalising'];
          }
        } else {
          // Ipratropium alone — slower, partial effect
          sounds.leftLung = sounds.leftLung === 'rhonchi' ? 'diminished' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'rhonchi' ? 'diminished' : sounds.rightLung;
          sounds.description = 'Some improvement with ipratropium. For optimal effect, combine with salbutamol.';
          sounds.additionalSounds = ['Partial bronchodilation', 'Consider adding salbutamol'];
        }
      }
      break;
    }

    case 'oxygen_nonrebreather':
    case 'oxygen_mask':
    case 'oxygen_nasal': {
      // Oxygen doesn't change lung sounds directly, but update description
      sounds.description = `${sounds.description} Supplemental oxygen applied.`;
      sounds.additionalSounds = [...sounds.additionalSounds.filter(s => !s.includes('oxygen')), 'Oxygen therapy in progress'];
      break;
    }

    case 'suction': {
      // Suctioning clears secretions
      if (sounds.leftLung === 'crackles-coarse' || sounds.rightLung === 'crackles-coarse') {
        sounds.leftLung = sounds.leftLung === 'crackles-coarse' ? 'clear' : sounds.leftLung;
        sounds.rightLung = sounds.rightLung === 'crackles-coarse' ? 'clear' : sounds.rightLung;
        sounds.description = 'Secretions cleared by suction. Improved air entry.';
        sounds.additionalSounds = ['Secretions suctioned', 'Improved air entry'];
      }
      if (sounds.leftLung === 'snoring' || sounds.rightLung === 'snoring') {
        sounds.leftLung = sounds.leftLung === 'snoring' ? 'clear' : sounds.leftLung;
        sounds.rightLung = sounds.rightLung === 'snoring' ? 'clear' : sounds.rightLung;
        sounds.description = 'Airway cleared by suction. Snoring respirations resolved.';
      }
      break;
    }

    case 'airway_open':
    case 'opa_insert': {
      // Airway management resolves snoring/obstruction
      if (sounds.leftLung === 'snoring' || sounds.rightLung === 'snoring') {
        sounds.leftLung = 'clear';
        sounds.rightLung = 'clear';
        sounds.description = 'Airway opened — snoring respirations resolved. Clear air entry bilaterally.';
        sounds.additionalSounds = ['Airway patent', 'Good tidal volume'];
      }
      break;
    }

    case 'intubation': {
      // Definitive airway — clears any obstruction sounds
      sounds.leftLung = 'clear';
      sounds.rightLung = 'clear';
      sounds.description = 'Endotracheal tube in place. Bilateral clear air entry confirmed. Good chest rise.';
      sounds.additionalSounds = ['ETT secured', 'ETCO2 confirmed', 'Bilateral air entry confirmed'];
      break;
    }

    case 'needle_decompression': {
      // Tension pneumothorax decompressed
      if (sounds.leftLung === 'absent') {
        sounds.leftLung = 'diminished';
        sounds.description = 'Rush of air on needle insertion. Breath sounds partially returning on left. Chest expansion improving.';
        sounds.additionalSounds = ['Rush of air on decompression', 'Partial breath sounds returning', 'JVP reducing'];
      } else if (sounds.rightLung === 'absent') {
        sounds.rightLung = 'diminished';
        sounds.description = 'Rush of air on needle insertion. Breath sounds partially returning on right.';
        sounds.additionalSounds = ['Rush of air on decompression', 'Partial breath sounds returning'];
      }
      break;
    }

    case 'cpr': {
      // CPR generates some sound changes
      sounds.description = 'CPR in progress. Auscultation limited during compressions.';
      sounds.additionalSounds = ['Compressions in progress', 'Check rhythm at 2-minute intervals'];
      break;
    }

    case 'defibrillation': {
      // After successful defib
      if (sounds.heartSound === 'absent') {
        sounds.heartSound = 'tachycardic';
        sounds.description = 'Post-defibrillation: Heart sounds returning. Monitor rhythm closely.';
        sounds.additionalSounds = ['ROSC achieved', 'Monitor for re-arrest'];
      }
      break;
    }

    case 'fowlers_position': {
      // Upright positioning helps respiratory patients — significantly in asthma/COPD
      if (cat === 'respiratory' || cat === 'cardiac') {
        if (isAsthmaOrCopd) {
          sounds.description = `${sounds.description} Positioned upright — optimises diaphragm excursion and improves ventilation.`;
          sounds.additionalSounds = [
            ...sounds.additionalSounds.filter(s => !s.includes('position')),
            'Upright position — improved ventilation',
            'Reduced work of breathing',
          ];
        } else {
          sounds.description = `${sounds.description} Positioned upright — may improve ventilation.`;
          sounds.additionalSounds = [...sounds.additionalSounds.filter(s => !s.includes('position')), 'Positioned semi-upright'];
        }
      }
      break;
    }

    case 'supine_position': {
      // Lying flat is harmful for respiratory distress patients
      if (isAsthmaOrCopd && (sounds.leftLung === 'wheeze' || sounds.leftLung === 'diminished' || sounds.leftLung === 'absent')) {
        sounds.description = `${sounds.description} WARNING: Supine position worsens respiratory distress — diaphragm splinted by abdominal contents.`;
        sounds.additionalSounds = [
          ...sounds.additionalSounds.filter(s => !s.includes('position')),
          'CAUTION: Supine position worsening dyspnoea',
          'Patient struggling more — sit upright',
        ];
      }
      break;
    }

    case 'adrenaline_im':
    case 'adrenaline_1mg': {
      // Adrenaline: potent systemic bronchodilator + vasopressor
      if (isAsthmaOrCopd) {
        // Severe/life-threatening asthma — adrenaline can be transformative
        if (sounds.leftLung === 'absent' || sounds.rightLung === 'absent') {
          sounds.leftLung = sounds.leftLung === 'absent' ? 'diminished' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'absent' ? 'diminished' : sounds.rightLung;
          sounds.description = 'IM adrenaline providing systemic bronchodilation. Faint air movement returning. Continue aggressive treatment.';
          sounds.additionalSounds = ['Some air entry detected', 'Adrenaline providing systemic bronchodilation', 'Continue nebulised treatment'];
        } else if (sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished') {
          sounds.leftLung = sounds.leftLung === 'diminished' ? 'wheeze' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'diminished' ? 'wheeze' : sounds.rightLung;
          sounds.description = 'Improved air entry after adrenaline. Wheeze now audible — airways opening. Good systemic effect.';
          sounds.additionalSounds = ['Airways opening with systemic bronchodilation', 'Wheeze audible — positive sign'];
        }
      }
      // Anaphylaxis — resolves stridor and wheeze
      if (sub.includes('anaphylaxis')) {
        if (sounds.leftLung === 'stridor' || sounds.rightLung === 'stridor') {
          sounds.leftLung = sounds.leftLung === 'stridor' ? 'wheeze' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'stridor' ? 'wheeze' : sounds.rightLung;
          sounds.description = 'Stridor reducing after adrenaline. Airway oedema improving. Monitor for recurrence.';
          sounds.additionalSounds = ['Upper airway obstruction reducing', 'Mild residual wheeze', 'Monitor for biphasic reaction'];
        }
      }
      break;
    }

    case 'hydrocortisone_200mg': {
      // Steroids: delayed effect but prevents recurrence
      if (isAsthmaOrCopd) {
        sounds.description = `${sounds.description} Steroid given — will reduce airway inflammation over 4-6 hours.`;
        sounds.additionalSounds = [
          ...sounds.additionalSounds.filter(s => !s.includes('steroid')),
          'Corticosteroid administered — addresses airway inflammation',
        ];
      }
      break;
    }

    case 'magnesium_2g': {
      // IV Magnesium: smooth muscle relaxation in severe asthma
      if (isAsthmaOrCopd) {
        if (sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished') {
          sounds.description = `${sounds.description} IV magnesium providing additional bronchodilation.`;
          sounds.additionalSounds = [
            ...sounds.additionalSounds.filter(s => !s.includes('magnesium')),
            'IV magnesium — smooth muscle relaxation',
            'Complementing bronchodilator therapy',
          ];
        }
      }
      break;
    }

    case 'recovery_position': {
      // Recovery position — helps post-ictal, stroke, unconscious patients
      if (sounds.leftLung === 'snoring' || sounds.rightLung === 'snoring') {
        sounds.leftLung = sounds.leftLung === 'snoring' ? 'clear' : sounds.leftLung;
        sounds.rightLung = sounds.rightLung === 'snoring' ? 'clear' : sounds.rightLung;
        sounds.description = 'Recovery position applied — airway opening. Snoring respirations resolved. Drainage of secretions facilitated.';
        sounds.additionalSounds = ['Airway patent in recovery position', 'Secretions draining', 'Good tidal volume'];
      }
      break;
    }
  }

  return sounds;
}

// ============================================================================
// WEB AUDIO API - Sound Generation
// ============================================================================

let audioContext: AudioContext | null = null;
let currentOscillators: OscillatorNode[] = [];
let currentGainNode: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Stop all currently playing sounds
 */
export function stopAllSounds(): void {
  currentOscillators.forEach(osc => {
    try { osc.stop(); } catch { /* already stopped */ }
  });
  currentOscillators = [];
  if (currentGainNode) {
    currentGainNode.disconnect();
    currentGainNode = null;
  }
}

/**
 * Helper: create a shaped noise buffer (pink-ish noise for more natural breath sounds)
 * Pink noise has more energy at low frequencies — closer to real biological sounds.
 */
function createPinkNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const bufferSize = Math.floor(ctx.sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Voss-McCartney approximation of pink noise using multiple white noise sources at octave rates
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

/**
 * Helper: apply a cyclic breathing envelope to a buffer
 * breathRate: breaths per second (e.g., 0.25 = 15/min, 0.33 = 20/min)
 * ieRatio: inspiration:expiration ratio (< 1 means longer expiration, normal ~0.5)
 * inspirationEmphasis: how much louder inspiration is vs expiration (1.0 = equal)
 */
function applyBreathingEnvelope(
  data: Float32Array,
  sampleRate: number,
  breathRate: number = 0.3,
  ieRatio: number = 0.45,
  inspirationEmphasis: number = 1.0,
  baseVolume: number = 0.05,
): void {
  const cycleSamples = Math.floor(sampleRate / breathRate);
  const inspirationLen = Math.floor(cycleSamples * ieRatio);

  for (let i = 0; i < data.length; i++) {
    const posInCycle = i % cycleSamples;
    let envelope: number;

    if (posInCycle < inspirationLen) {
      // Inspiration phase: gradual rise then fall
      const t = posInCycle / inspirationLen;
      // Smooth bell curve for inspiration
      envelope = Math.sin(Math.PI * t) * inspirationEmphasis;
    } else {
      // Expiration phase: gradual rise then fall
      const t = (posInCycle - inspirationLen) / (cycleSamples - inspirationLen);
      envelope = Math.sin(Math.PI * t);
    }

    // Add a brief quiet gap between breaths (at transitions)
    const transitionWidth = 0.05 * cycleSamples;
    if (posInCycle < transitionWidth) {
      envelope *= posInCycle / transitionWidth;
    }
    if (posInCycle > cycleSamples - transitionWidth) {
      envelope *= (cycleSamples - posInCycle) / transitionWidth;
    }

    data[i] *= (envelope * (1 - baseVolume) + baseVolume);
  }
}

/**
 * Play a breath sound for the specified duration.
 * Uses Web Audio API with clinically accurate sound synthesis:
 * - Pink noise base for natural biological sound character
 * - Proper breathing envelopes with inspiration/expiration phases
 * - Characteristic spectral shaping per pathology
 * - Layered sound design for complex sounds (wheeze, crackles)
 */
export function playBreathSound(soundType: BreathSoundType, durationMs: number = 4000): void {
  stopAllSounds();

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.25, ctx.currentTime);
  masterGain.connect(ctx.destination);
  currentGainNode = masterGain;

  const duration = durationMs / 1000;

  switch (soundType) {
    case 'clear': {
      // VESICULAR BREATH SOUNDS
      // Soft, low-pitched rustling heard throughout inspiration and early expiration.
      // Inspiration is longer and louder than expiration (~3:1).
      // Frequency range: 100-1000 Hz, peak around 200-400 Hz.
      const noiseBuffer = createPinkNoiseBuffer(ctx, duration);
      const data = noiseBuffer.getChannelData(0);

      // Apply vesicular breathing envelope: inspiration louder, expiration softer
      applyBreathingEnvelope(data, ctx.sampleRate, 0.28, 0.55, 1.4, 0.08);

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;

      // Bandpass filter: vesicular sounds live in 100-800 Hz
      const bpFilter = ctx.createBiquadFilter();
      bpFilter.type = 'bandpass';
      bpFilter.frequency.value = 350;
      bpFilter.Q.value = 0.5; // wide band

      // Gentle low-pass rolloff for body-transmitted character
      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.value = 900;
      lpFilter.Q.value = 0.7;

      source.connect(bpFilter);
      bpFilter.connect(lpFilter);
      lpFilter.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'wheeze': {
      // POLYPHONIC EXPIRATORY WHEEZE
      // Multiple musical tones (200-1500 Hz) heard primarily during expiration.
      // Caused by airway narrowing in asthma/COPD.
      // Key features: multiple harmonics, expiratory dominance, slight pitch wandering.
      const breathRate = 0.3; // ~18/min
      const cycleSamples = Math.floor(ctx.sampleRate / breathRate);
      const inspirationLen = Math.floor(cycleSamples * 0.35); // Short inspiration, prolonged expiration

      // Layer 1: Background vesicular breath sounds (quieter)
      const noiseBuffer = createPinkNoiseBuffer(ctx, duration);
      const noiseData = noiseBuffer.getChannelData(0);
      applyBreathingEnvelope(noiseData, ctx.sampleRate, breathRate, 0.35, 1.0, 0.03);
      // Reduce noise volume
      for (let i = 0; i < noiseData.length; i++) noiseData[i] *= 0.3;

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseLp = ctx.createBiquadFilter();
      noiseLp.type = 'lowpass';
      noiseLp.frequency.value = 600;
      noiseSource.connect(noiseLp);
      noiseLp.connect(masterGain);
      noiseSource.start();
      noiseSource.stop(ctx.currentTime + duration);

      // Layer 2: Polyphonic wheeze tones (3 oscillators at different frequencies)
      const wheezeFreqs = [320, 480, 640]; // Multiple harmonics for polyphonic wheeze
      wheezeFreqs.forEach((baseFreq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

        // Pitch wandering — slight natural variation
        for (let t = 0; t < duration; t += 0.15) {
          const drift = baseFreq * (1 + (Math.random() - 0.5) * 0.06);
          osc.frequency.exponentialRampToValueAtTime(drift, ctx.currentTime + t + 0.15);
        }

        const wheezeGain = ctx.createGain();
        // Expiratory-dominant envelope: quiet during inspiration, loud during expiration
        for (let t = 0; t < duration; t += 1 / breathRate) {
          const inspEnd = t + inspirationLen / ctx.sampleRate;
          const cycleEnd = t + cycleSamples / ctx.sampleRate;
          const vol = 0.06 - idx * 0.015; // Higher harmonics slightly quieter
          // Inspiration: very quiet
          wheezeGain.gain.setValueAtTime(0.005, ctx.currentTime + t);
          wheezeGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + inspEnd);
          // Expiration: ramp up, sustain, ramp down
          wheezeGain.gain.linearRampToValueAtTime(vol * 0.8, ctx.currentTime + inspEnd + 0.15);
          wheezeGain.gain.setValueAtTime(vol, ctx.currentTime + inspEnd + 0.4);
          wheezeGain.gain.linearRampToValueAtTime(vol * 0.3, ctx.currentTime + cycleEnd - 0.15);
          wheezeGain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + cycleEnd);
        }

        // Narrow bandpass to make each tone distinct
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = baseFreq;
        bp.Q.value = 8;

        osc.connect(wheezeGain);
        wheezeGain.connect(bp);
        bp.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + duration);
        currentOscillators.push(osc);
      });
      break;
    }

    case 'crackles-fine': {
      // FINE INSPIRATORY CRACKLES (Rales)
      // Brief, high-pitched popping sounds heard during late inspiration.
      // Caused by sudden opening of collapsed alveoli (pulmonary fibrosis, CHF, pneumonia).
      // Characteristics: each crackle ~5ms, frequency 650-2000 Hz,
      // clusters of 3-8 crackles, predominantly late-inspiratory.
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const breathCycleSamples = Math.floor(ctx.sampleRate / 0.28);
      const inspirationLen = Math.floor(breathCycleSamples * 0.5);

      // Background vesicular sounds
      const pinkBuf = createPinkNoiseBuffer(ctx, duration);
      const pinkData = pinkBuf.getChannelData(0);
      applyBreathingEnvelope(pinkData, ctx.sampleRate, 0.28, 0.5, 1.2, 0.05);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = pinkData[i] * 0.25; // Quiet background breathing
      }

      // Add fine crackle clusters during late inspiration
      for (let i = 0; i < bufferSize; i++) {
        const posInCycle = i % breathCycleSamples;
        const inspProgress = posInCycle / inspirationLen;

        // Fine crackles: late-inspiratory (last 40% of inspiration)
        if (posInCycle < inspirationLen && inspProgress > 0.6 && inspProgress < 0.95) {
          // Higher probability of crackles in this window
          if (Math.random() < 0.015) {
            // Each crackle: 3-7ms burst of damped high-frequency content
            const crackleLen = Math.floor(ctx.sampleRate * (0.003 + Math.random() * 0.004));
            const crackleFreq = 800 + Math.random() * 1200; // 800-2000 Hz
            for (let j = 0; j < crackleLen && (i + j) < bufferSize; j++) {
              const decay = Math.exp(-j / (crackleLen * 0.25));
              const tone = Math.sin(2 * Math.PI * crackleFreq * j / ctx.sampleRate);
              const noise = (Math.random() * 2 - 1) * 0.3;
              data[i + j] += (tone * 0.6 + noise) * decay * 0.5;
            }
          }
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      // Bandpass to keep crackles in realistic range
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 800;
      bp.Q.value = 0.3;
      source.connect(bp);
      bp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'crackles-coarse': {
      // COARSE CRACKLES
      // Louder, lower-pitched, longer-duration pops heard throughout the breath cycle.
      // Caused by air bubbling through fluid in larger airways (bronchitis, CHF).
      // Characteristics: each crackle ~10-25ms, frequency 150-600 Hz,
      // heard on both inspiration and expiration, may clear with coughing.
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const breathCycleSamples = Math.floor(ctx.sampleRate / 0.3);

      // Background breathing
      const pinkBuf = createPinkNoiseBuffer(ctx, duration);
      const pinkData = pinkBuf.getChannelData(0);
      applyBreathingEnvelope(pinkData, ctx.sampleRate, 0.3, 0.45, 1.0, 0.06);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = pinkData[i] * 0.2;
      }

      // Coarse crackles throughout the breath cycle
      for (let i = 0; i < bufferSize; i++) {
        const posInCycle = i % breathCycleSamples;
        const cycleProgress = posInCycle / breathCycleSamples;
        // Active during breathing phases (not the quiet gaps)
        const isActive = Math.sin(Math.PI * cycleProgress) > 0.15;

        if (isActive && Math.random() < 0.01) {
          // Each coarse crackle: 10-25ms, lower frequency, bubbling character
          const crackleLen = Math.floor(ctx.sampleRate * (0.010 + Math.random() * 0.015));
          const crackleFreq = 150 + Math.random() * 400; // 150-550 Hz
          const subFreq = crackleFreq * 0.5; // Sub-harmonic for bubbling
          for (let j = 0; j < crackleLen && (i + j) < bufferSize; j++) {
            const decay = Math.exp(-j / (crackleLen * 0.4));
            const t1 = Math.sin(2 * Math.PI * crackleFreq * j / ctx.sampleRate);
            const t2 = Math.sin(2 * Math.PI * subFreq * j / ctx.sampleRate);
            const noise = (Math.random() * 2 - 1) * 0.2;
            data[i + j] += (t1 * 0.4 + t2 * 0.3 + noise) * decay * 0.6;
          }
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1000;
      source.connect(lp);
      lp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'stridor': {
      // STRIDOR
      // Harsh, high-pitched, predominantly inspiratory sound caused by turbulent
      // airflow through a narrowed upper airway (larynx/trachea).
      // Often audible without stethoscope in severe cases.
      // Characteristics: 500-1500 Hz, harsh/raspy quality, inspiratory dominance,
      // may have overtones. Think of air forced through a narrow pipe.
      const breathRate = 0.35; // Slightly faster due to distress
      const cycleSamples = Math.floor(ctx.sampleRate / breathRate);
      const inspirationLen = Math.floor(cycleSamples * 0.5);

      // Layer 1: Turbulent noise base
      const noiseBuffer = createPinkNoiseBuffer(ctx, duration);
      const noiseData = noiseBuffer.getChannelData(0);
      // Strong inspiratory emphasis
      applyBreathingEnvelope(noiseData, ctx.sampleRate, breathRate, 0.5, 2.0, 0.02);

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Narrow bandpass for harsh character
      const bp1 = ctx.createBiquadFilter();
      bp1.type = 'bandpass';
      bp1.frequency.value = 700;
      bp1.Q.value = 2;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, ctx.currentTime);

      noiseSource.connect(bp1);
      bp1.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start();
      noiseSource.stop(ctx.currentTime + duration);

      // Layer 2: Harmonic tonal component (vibrating narrowed airway walls)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(280, ctx.currentTime);
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(560, ctx.currentTime); // Octave harmonic

      // Pitch variation for organic feel
      for (let t = 0; t < duration; t += 0.1) {
        osc1.frequency.setValueAtTime(270 + Math.random() * 30, ctx.currentTime + t);
        osc2.frequency.setValueAtTime(545 + Math.random() * 40, ctx.currentTime + t);
      }

      const stridorGain = ctx.createGain();
      // Inspiratory-dominant envelope
      for (let t = 0; t < duration; t += 1 / breathRate) {
        const inspEnd = t + inspirationLen / ctx.sampleRate;
        const cycleEnd = t + cycleSamples / ctx.sampleRate;
        // Quiet start
        stridorGain.gain.setValueAtTime(0.005, ctx.currentTime + t);
        // Inspiration: ramp up harshly
        stridorGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + t + 0.15);
        stridorGain.gain.setValueAtTime(0.14, ctx.currentTime + inspEnd - 0.1);
        // Expiration: much quieter
        stridorGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + inspEnd + 0.1);
        stridorGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + cycleEnd - 0.1);
        stridorGain.gain.setValueAtTime(0.005, ctx.currentTime + cycleEnd);
      }

      // Harsh bandpass
      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass';
      bp2.frequency.value = 400;
      bp2.Q.value = 1.5;

      osc1.connect(stridorGain);
      osc2.connect(stridorGain);
      stridorGain.connect(bp2);
      bp2.connect(masterGain);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
      currentOscillators.push(osc1, osc2);
      break;
    }

    case 'rhonchi': {
      // RHONCHI
      // Low-pitched, continuous rumbling/rattling caused by airway secretions
      // or mucus in larger airways. 80-300 Hz. May clear with coughing.
      // Heard throughout the breath cycle with expiratory emphasis.
      // Think of air bubbling through thick mucus in a pipe.
      const breathRate = 0.27;

      // Layer 1: Underlying breath sounds
      const noiseBuffer = createPinkNoiseBuffer(ctx, duration);
      const noiseData = noiseBuffer.getChannelData(0);
      applyBreathingEnvelope(noiseData, ctx.sampleRate, breathRate, 0.4, 0.8, 0.04);
      for (let i = 0; i < noiseData.length; i++) noiseData[i] *= 0.2;

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseLp = ctx.createBiquadFilter();
      noiseLp.type = 'lowpass';
      noiseLp.frequency.value = 500;
      noiseSource.connect(noiseLp);
      noiseLp.connect(masterGain);
      noiseSource.start();
      noiseSource.stop(ctx.currentTime + duration);

      // Layer 2: Low-frequency rumbling oscillators (3 tones for richness)
      const rumbleFreqs = [85, 130, 175];
      rumbleFreqs.forEach((baseFreq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

        // Organic wobble
        for (let t = 0; t < duration; t += 0.2) {
          osc.frequency.setValueAtTime(
            baseFreq * (0.92 + Math.random() * 0.16),
            ctx.currentTime + t,
          );
        }

        const rumbleGain = ctx.createGain();
        // Expiratory emphasis
        const cycleSamples = Math.floor(ctx.sampleRate / breathRate);
        const inspLen = Math.floor(cycleSamples * 0.4);
        for (let t = 0; t < duration; t += 1 / breathRate) {
          const inspEnd = t + inspLen / ctx.sampleRate;
          const cycleEnd = t + cycleSamples / ctx.sampleRate;
          const vol = 0.06;
          rumbleGain.gain.setValueAtTime(0.01, ctx.currentTime + t);
          rumbleGain.gain.linearRampToValueAtTime(vol * 0.5, ctx.currentTime + t + 0.2);
          rumbleGain.gain.setValueAtTime(vol * 0.4, ctx.currentTime + inspEnd);
          rumbleGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + inspEnd + 0.2);
          rumbleGain.gain.setValueAtTime(vol * 0.9, ctx.currentTime + cycleEnd - 0.2);
          rumbleGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + cycleEnd);
        }

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 300;
        lp.Q.value = 1.5;

        osc.connect(rumbleGain);
        rumbleGain.connect(lp);
        lp.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + duration);
        currentOscillators.push(osc);
      });
      break;
    }

    case 'pleural-rub': {
      // PLEURAL FRICTION RUB
      // Creaking, grating, leather-on-leather sound caused by inflamed
      // pleural surfaces rubbing. Heard on BOTH inspiration and expiration.
      // Stops with breath-holding (unlike pericardial rub).
      // Frequency: 300-600 Hz, intermittent, coarse, may be localized.
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const breathCycleSamples = Math.floor(ctx.sampleRate / 0.28);

      // Background breathing
      const pinkBuf = createPinkNoiseBuffer(ctx, duration);
      const pinkData = pinkBuf.getChannelData(0);
      applyBreathingEnvelope(pinkData, ctx.sampleRate, 0.28, 0.5, 1.0, 0.04);
      for (let i = 0; i < bufferSize; i++) data[i] = pinkData[i] * 0.15;

      // Creaking/grating during active breathing
      for (let i = 0; i < bufferSize; i++) {
        const posInCycle = i % breathCycleSamples;
        const cycleProgress = posInCycle / breathCycleSamples;
        const breathActive = Math.sin(Math.PI * cycleProgress);

        if (breathActive > 0.25) {
          // Irregular creaking bursts
          const creakBase = 350 + Math.sin(i * 0.002) * 100; // Slowly varying creak freq
          const creak = Math.sin(2 * Math.PI * creakBase * i / ctx.sampleRate);
          // Add gritty harmonics
          const creak2 = Math.sin(2 * Math.PI * creakBase * 1.5 * i / ctx.sampleRate);
          const grit = (Math.random() * 2 - 1);

          // Intermittent: the rub comes and goes within each breath
          const burstPattern = Math.sin(i * 0.01 + Math.sin(i * 0.003) * 2);
          const isBurst = burstPattern > 0.3;

          if (isBurst) {
            data[i] += (creak * 0.3 + creak2 * 0.15 + grit * 0.08) * breathActive * 0.5;
          }
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 400;
      bp.Q.value = 0.8;
      source.connect(bp);
      bp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'snoring': {
      // SONOROUS / SNORING RESPIRATION
      // Low-frequency vibration from partial upper airway obstruction
      // (tongue falling back, soft palate). 40-120 Hz fundamental with harmonics.
      // Predominantly inspiratory with characteristic intermittent pattern.
      const breathRate = 0.22; // Slower due to obstruction (~13/min)
      const cycleSamples = Math.floor(ctx.sampleRate / breathRate);
      const inspirationLen = Math.floor(cycleSamples * 0.45);

      // Layer 1: Throat vibration (fundamental + harmonics)
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const posInCycle = i % cycleSamples;
        let envelope: number;

        if (posInCycle < inspirationLen) {
          // Inspiration: loud snoring with characteristic flutter
          const t = posInCycle / inspirationLen;
          envelope = Math.sin(Math.PI * t);
          // Add irregular flutter (soft palate vibrating)
          envelope *= 0.7 + 0.3 * Math.sin(2 * Math.PI * 25 * i / ctx.sampleRate);
        } else if (posInCycle < inspirationLen * 1.6) {
          // Expiration: quieter, may have mild snoring
          const t = (posInCycle - inspirationLen) / (inspirationLen * 0.6);
          envelope = Math.sin(Math.PI * t) * 0.25;
        } else {
          // Brief pause
          envelope = 0.01;
        }

        // Fundamental vibration (~65 Hz) + harmonics
        const f0 = 65 + Math.sin(i * 0.0003) * 8; // Slight pitch drift
        const vibration =
          Math.sin(2 * Math.PI * f0 * i / ctx.sampleRate) * 0.5 +
          Math.sin(2 * Math.PI * f0 * 2 * i / ctx.sampleRate) * 0.25 +
          Math.sin(2 * Math.PI * f0 * 3 * i / ctx.sampleRate) * 0.1 +
          (Math.random() * 2 - 1) * 0.15; // Turbulence noise

        data[i] = vibration * envelope * 0.6;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 350;
      lp.Q.value = 1.5;
      source.connect(lp);
      lp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'diminished': {
      // DIMINISHED BREATH SOUNDS
      // Same character as vesicular breathing but markedly reduced in volume.
      // Still has the characteristic inspiration > expiration pattern.
      // Causes: pneumothorax, effusion, obesity, splinting, hyperinflation.
      const noiseBuffer = createPinkNoiseBuffer(ctx, duration);
      const data = noiseBuffer.getChannelData(0);
      applyBreathingEnvelope(data, ctx.sampleRate, 0.25, 0.5, 1.2, 0.02);

      // Very low volume — barely audible
      for (let i = 0; i < data.length; i++) data[i] *= 0.12;

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 300;
      bp.Q.value = 0.5;
      source.connect(bp);
      bp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'absent': {
      // ABSENT BREATH SOUNDS
      // Complete silence on the affected side.
      // Causes: tension pneumothorax, massive effusion, cardiac arrest, near-fatal asthma.
      // Play very faint ambient noise (stethoscope-on-skin sound) to show it's working.
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.008; // Barely perceptible contact noise
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 200;
      source.connect(lp);
      lp.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }
  }
}

/**
 * Helper: generate a single heart sound thump (S1 or S2) into a buffer
 * Heart sounds are brief (~40-100ms) low-frequency thuds composed of
 * valve closure vibrations transmitted through the chest wall.
 * S1 (mitral/tricuspid closure): ~25-45 Hz, ~100ms, louder
 * S2 (aortic/pulmonic closure): ~50-70 Hz, ~80ms, slightly higher and shorter
 */
function writeHeartThump(
  data: Float32Array,
  startSample: number,
  sampleRate: number,
  freq: number,
  durationMs: number,
  volume: number,
  harmonics: number = 3,
): void {
  const len = Math.floor(sampleRate * durationMs / 1000);
  for (let j = 0; j < len && (startSample + j) < data.length; j++) {
    const t = j / sampleRate;
    // Rapid exponential decay
    const env = Math.exp(-t / (durationMs / 1000 * 0.28));
    // Initial sharp attack
    const attack = j < sampleRate * 0.003 ? j / (sampleRate * 0.003) : 1.0;
    let sample = 0;
    // Fundamental + harmonics (each progressively quieter)
    for (let h = 1; h <= harmonics; h++) {
      sample += Math.sin(2 * Math.PI * freq * h * t) / (h * h);
    }
    // Add a thump transient (body resonance)
    sample += Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.3 * Math.exp(-t / 0.015);
    data[startSample + j] += sample * env * attack * volume;
  }
}

/**
 * Play a heart sound for the specified duration.
 * Realistic S1-S2 pattern with appropriate rate, character, and pathology.
 */
export function playHeartSound(soundType: HeartSoundType, durationMs: number = 5000): void {
  stopAllSounds();

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
  masterGain.connect(ctx.destination);
  currentGainNode = masterGain;

  const duration = durationMs / 1000;

  // Heart rate in BPM
  const bpmMap: Record<HeartSoundType, number> = {
    'normal': 72,
    'tachycardic': 125,
    'bradycardic': 42,
    'irregular': 88,
    'muffled': 68,
    'gallop': 90,
    'murmur-systolic': 78,
    'absent': 0,
  };

  const bpm = bpmMap[soundType];
  if (bpm === 0) {
    // Absent — flat silence with faint contact noise
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.005;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(masterGain);
    source.start();
    source.stop(ctx.currentTime + duration);
    return;
  }

  const beatInterval = 60 / bpm;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Add very faint background noise (body sounds / stethoscope contact)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.005;
  }

  const isMuffled = soundType === 'muffled';
  const s1Freq = isMuffled ? 22 : 35;      // S1: lower frequency
  const s2Freq = isMuffled ? 30 : 55;      // S2: slightly higher
  const s1Duration = isMuffled ? 120 : 100; // ms
  const s2Duration = isMuffled ? 90 : 70;   // ms
  const s1Vol = isMuffled ? 0.25 : 0.7;
  const s2Vol = isMuffled ? 0.15 : 0.5;
  const harmonicCount = isMuffled ? 1 : 3;

  let t = 0;
  while (t < duration) {
    const actualInterval = soundType === 'irregular'
      ? beatInterval * (0.65 + Math.random() * 0.7) // AF: irregularly irregular
      : beatInterval + (Math.random() - 0.5) * 0.02; // Tiny natural variation

    const beatSample = Math.floor(t * ctx.sampleRate);

    // S1 — mitral/tricuspid valve closure (start of systole)
    writeHeartThump(data, beatSample, ctx.sampleRate, s1Freq, s1Duration, s1Vol, harmonicCount);

    // S2 — aortic/pulmonic valve closure (end of systole)
    // Systolic interval is ~0.3-0.35 of the cardiac cycle
    const systolicInterval = actualInterval * 0.33;
    const s2Sample = beatSample + Math.floor(systolicInterval * ctx.sampleRate);
    writeHeartThump(data, s2Sample, ctx.sampleRate, s2Freq, s2Duration, s2Vol, harmonicCount);

    // S3 gallop — pathological ventricular filling sound after S2
    if (soundType === 'gallop') {
      const s3Delay = systolicInterval + 0.12; // ~120ms after S2
      const s3Sample = beatSample + Math.floor(s3Delay * ctx.sampleRate);
      writeHeartThump(data, s3Sample, ctx.sampleRate, 28, 60, 0.25, 2);
    }

    // Systolic murmur — turbulent flow between S1 and S2
    if (soundType === 'murmur-systolic') {
      const murmurStart = beatSample + Math.floor(ctx.sampleRate * 0.06);
      const murmurEnd = s2Sample - Math.floor(ctx.sampleRate * 0.02);
      const murmurLen = murmurEnd - murmurStart;
      if (murmurLen > 0) {
        for (let j = 0; j < murmurLen && (murmurStart + j) < bufferSize; j++) {
          const pos = j / murmurLen;
          // Diamond-shaped: crescendo-decrescendo
          const env = Math.sin(Math.PI * pos) * 0.2;
          // Filtered noise with slight tonal quality
          const noise = (Math.random() * 2 - 1);
          const tone = Math.sin(2 * Math.PI * 180 * j / ctx.sampleRate) * 0.3;
          data[murmurStart + j] += (noise * 0.7 + tone) * env;
        }
      }
    }

    t += actualInterval;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Low-pass filter: body-transmitted sound character
  // Heart sounds as heard through chest wall are predominantly < 150 Hz
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = isMuffled ? 80 : 150;
  filter.Q.value = 0.7;

  source.connect(filter);
  filter.connect(masterGain);
  source.start();
  source.stop(ctx.currentTime + duration);
}

/**
 * Check if Web Audio API is available
 */
export function isAudioAvailable(): boolean {
  return typeof window !== 'undefined' &&
    (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined');
}
