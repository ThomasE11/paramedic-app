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
 * Determine initial clinical sounds based on case category and presentation
 */
export function getInitialSounds(
  caseCategory: string,
  subcategory?: string,
  findings?: string[]
): ClinicalSoundState {
  const cat = caseCategory.toLowerCase();
  const sub = (subcategory || '').toLowerCase();
  const findingsStr = (findings || []).join(' ').toLowerCase();

  // Respiratory cases
  if (cat === 'respiratory') {
    if (sub.includes('asthma') || findingsStr.includes('wheez') || findingsStr.includes('bronchospasm')) {
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
 * Update clinical sounds after treatment
 * Returns new sound state based on what treatment was applied and how many times
 */
export function updateSoundsAfterTreatment(
  currentSounds: ClinicalSoundState,
  treatmentId: string,
  applicationCount: number, // How many times this treatment has been applied
  caseCategory: string
): ClinicalSoundState {
  const sounds = { ...currentSounds };
  const cat = caseCategory.toLowerCase();

  switch (treatmentId) {
    case 'nebulizer_salbutamol': {
      // Salbutamol: Progressive improvement in bronchospasm
      // Check for wheeze OR diminished (which is the state after dose 2)
      const hasRespiratoryFindings = sounds.leftLung === 'wheeze' || sounds.rightLung === 'wheeze' ||
        sounds.leftLung === 'diminished' || sounds.rightLung === 'diminished' ||
        sounds.leftLung === 'rhonchi' || sounds.rightLung === 'rhonchi';
      if (hasRespiratoryFindings) {
        if (applicationCount === 1) {
          // First dose: partial relief — wheeze still present but improved
          sounds.description = 'Wheeze slightly improved after first salbutamol nebulizer. Still significant bronchospasm present. Consider repeat dose.';
          sounds.additionalSounds = ['Wheeze improving but still present', 'Work of breathing slightly reduced'];
        } else if (applicationCount === 2) {
          // Second dose: significant improvement
          sounds.leftLung = sounds.leftLung === 'wheeze' ? 'diminished' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'wheeze' ? 'diminished' : sounds.rightLung;
          sounds.description = 'Wheeze significantly reduced after second salbutamol. Mild residual diminished air entry. Good response to treatment.';
          sounds.additionalSounds = ['Wheeze mostly cleared', 'Mild residual diminished air entry'];
        } else if (applicationCount >= 3) {
          // Third dose: near-complete resolution
          sounds.leftLung = 'clear';
          sounds.rightLung = 'clear';
          sounds.description = 'Lungs now clear after third salbutamol nebulizer. Good bilateral air entry. Bronchospasm resolved.';
          sounds.additionalSounds = ['Air entry now equal bilaterally', 'No residual wheeze'];
        }
      }
      break;
    }

    case 'nebulizer_ipratropium': {
      // Ipratropium: Complementary bronchodilation
      if (sounds.leftLung === 'wheeze' || sounds.rightLung === 'wheeze' ||
          sounds.leftLung === 'rhonchi' || sounds.rightLung === 'rhonchi') {
        if (applicationCount >= 1) {
          // Convert rhonchi → diminished, wheeze → diminished
          sounds.leftLung = sounds.leftLung === 'rhonchi' ? 'diminished' : sounds.leftLung === 'wheeze' ? 'diminished' : sounds.leftLung;
          sounds.rightLung = sounds.rightLung === 'rhonchi' ? 'diminished' : sounds.rightLung === 'wheeze' ? 'diminished' : sounds.rightLung;
          sounds.description = 'Improved air movement after ipratropium. Reduced bronchospasm. Secretions clearing.';
          sounds.additionalSounds = ['Reduced secretions', 'Improving air entry'];
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
      // Upright positioning helps respiratory patients
      if (cat === 'respiratory' || cat === 'cardiac') {
        sounds.description = `${sounds.description} Positioned upright — may improve ventilation.`;
        sounds.additionalSounds = [...sounds.additionalSounds.filter(s => !s.includes('position')), 'Positioned semi-upright'];
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
 * Play a breath sound for the specified duration
 * Uses Web Audio API to generate realistic-ish clinical sounds
 */
export function playBreathSound(soundType: BreathSoundType, durationMs: number = 3000): void {
  stopAllSounds();

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.15, ctx.currentTime); // Keep volume low
  masterGain.connect(ctx.destination);
  currentGainNode = masterGain;

  const duration = durationMs / 1000;

  switch (soundType) {
    case 'clear': {
      // White noise filtered to sound like breathing
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Breathing envelope — cycles of inspiration/expiration
        const breathCycle = Math.sin(2 * Math.PI * i / (ctx.sampleRate * 1.5)); // ~2.5s per breath
        const envelope = Math.max(0, breathCycle) * 0.7 + 0.1;
        data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      source.connect(filter);
      filter.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'wheeze': {
      // High-pitched oscillating tone on expiration
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      // Musical whistling with slight frequency variation
      for (let t = 0; t < duration; t += 0.5) {
        osc.frequency.setValueAtTime(380 + Math.random() * 60, ctx.currentTime + t);
      }
      const wheezeGain = ctx.createGain();
      // Expiratory emphasis envelope
      for (let t = 0; t < duration; t += 1.5) {
        wheezeGain.gain.setValueAtTime(0.02, ctx.currentTime + t);
        wheezeGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + t + 0.6); // inspiration quiet
        wheezeGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + t + 0.9); // expiration loud
        wheezeGain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + t + 1.4);
      }
      osc.connect(wheezeGain);
      wheezeGain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      currentOscillators.push(osc);
      break;
    }

    case 'crackles-fine': {
      // Series of rapid clicks/pops
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const breathCycle = Math.sin(2 * Math.PI * i / (ctx.sampleRate * 1.5));
        const isInspiration = breathCycle > 0.3; // Crackles on inspiration
        if (isInspiration && Math.random() < 0.005) {
          // Random crackle
          const crackleLen = Math.floor(ctx.sampleRate * 0.002);
          for (let j = 0; j < crackleLen && (i + j) < bufferSize; j++) {
            data[i + j] = (Math.random() * 2 - 1) * 0.6 * (1 - j / crackleLen);
          }
        }
        // Background breathing
        const envelope = Math.max(0, breathCycle) * 0.2 + 0.05;
        data[i] += (Math.random() * 2 - 1) * envelope * 0.1;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'stridor': {
      // Harsh high-pitched inspiratory sound
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      const stridorGain = ctx.createGain();
      // Inspiratory emphasis
      for (let t = 0; t < duration; t += 1.5) {
        stridorGain.gain.setValueAtTime(0.15, ctx.currentTime + t);
        stridorGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + t + 0.6); // inspiration = harsh
        stridorGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + t + 0.9); // expiration = quiet
        stridorGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + t + 1.4);
      }
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 300;
      filter.Q.value = 3;
      osc.connect(filter);
      filter.connect(stridorGain);
      stridorGain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      currentOscillators.push(osc);
      break;
    }

    case 'crackles-coarse': {
      // Coarse bubbly crackles — louder, lower-pitched pops throughout breath cycle
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const breathCycle = Math.sin(2 * Math.PI * i / (ctx.sampleRate * 1.5));
        const envelope = Math.abs(breathCycle) * 0.25 + 0.08;
        // Coarse crackles: bigger, slower pops throughout both phases
        if (Math.random() < 0.008) {
          const crackleLen = Math.floor(ctx.sampleRate * 0.006); // longer than fine
          for (let j = 0; j < crackleLen && (i + j) < bufferSize; j++) {
            const decay = 1 - j / crackleLen;
            data[i + j] = (Math.random() * 2 - 1) * 0.8 * decay * decay;
          }
        }
        // Underlying bubbling noise
        data[i] += (Math.random() * 2 - 1) * envelope * 0.12;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      source.connect(filter);
      filter.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'rhonchi': {
      // Low-pitched continuous rumbling — like snoring through mucus
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(90, ctx.currentTime);
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(120, ctx.currentTime);
      // Slow frequency wobble for organic feel
      for (let t = 0; t < duration; t += 0.3) {
        osc1.frequency.setValueAtTime(85 + Math.random() * 20, ctx.currentTime + t);
        osc2.frequency.setValueAtTime(115 + Math.random() * 25, ctx.currentTime + t);
      }
      const rhonchiGain = ctx.createGain();
      // Expiratory emphasis with rumbling throughout
      for (let t = 0; t < duration; t += 1.5) {
        rhonchiGain.gain.setValueAtTime(0.06, ctx.currentTime + t);
        rhonchiGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + t + 0.5);
        rhonchiGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + t + 0.9);
        rhonchiGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + t + 1.4);
      }
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 250;
      filter.Q.value = 2;
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(rhonchiGain);
      rhonchiGain.connect(masterGain);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
      currentOscillators.push(osc1, osc2);
      break;
    }

    case 'pleural-rub': {
      // Creaking/grating sound on both inspiration and expiration
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const breathCycle = Math.sin(2 * Math.PI * i / (ctx.sampleRate * 1.5));
        const isBreathPhase = Math.abs(breathCycle) > 0.2;
        if (isBreathPhase) {
          // Creaking: irregular bursts of grating noise
          const creakFreq = 180 + Math.sin(i / 80) * 60;
          const creak = Math.sin(2 * Math.PI * creakFreq * i / ctx.sampleRate);
          const grit = (Math.random() * 2 - 1) * 0.3;
          data[i] = (creak * 0.4 + grit * 0.2) * Math.abs(breathCycle);
        } else {
          // Brief silence between breath phases
          data[i] = (Math.random() * 2 - 1) * 0.01;
        }
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 350;
      filter.Q.value = 1.5;
      source.connect(filter);
      filter.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }

    case 'snoring': {
      // Sonorous low-frequency vibration — partial upper airway obstruction
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      // Irregular snoring rhythm
      for (let t = 0; t < duration; t += 0.2) {
        osc.frequency.setValueAtTime(55 + Math.random() * 20, ctx.currentTime + t);
      }
      const snoreGain = ctx.createGain();
      // Inspiratory-dominant pattern with pauses
      for (let t = 0; t < duration; t += 2.0) {
        snoreGain.gain.setValueAtTime(0.01, ctx.currentTime + t);
        snoreGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + t + 0.3);
        snoreGain.gain.setValueAtTime(0.25, ctx.currentTime + t + 0.8);
        snoreGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + t + 1.2);
        snoreGain.gain.setValueAtTime(0.01, ctx.currentTime + t + 1.9);
      }
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      filter.Q.value = 3;
      osc.connect(filter);
      filter.connect(snoreGain);
      snoreGain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      currentOscillators.push(osc);
      break;
    }

    case 'diminished':
    case 'absent': {
      // Very faint or no breathing sound
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const volume = soundType === 'absent' ? 0.01 : 0.05;
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * volume;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      source.connect(filter);
      filter.connect(masterGain);
      source.start();
      source.stop(ctx.currentTime + duration);
      break;
    }
  }
}

/**
 * Play a heart sound for the specified duration
 */
export function playHeartSound(soundType: HeartSoundType, durationMs: number = 4000): void {
  stopAllSounds();

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
  masterGain.connect(ctx.destination);
  currentGainNode = masterGain;

  const duration = durationMs / 1000;

  // Heart rate in BPM mapped to interval
  const bpmMap: Record<HeartSoundType, number> = {
    'normal': 75,
    'tachycardic': 120,
    'bradycardic': 45,
    'irregular': 90,
    'muffled': 70,
    'gallop': 85,
    'murmur-systolic': 80,
    'absent': 0,
  };

  const bpm = bpmMap[soundType];
  if (bpm === 0) {
    // Absent — flat silence
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
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

  let t = 0;
  while (t < duration) {
    const actualInterval = soundType === 'irregular'
      ? beatInterval * (0.7 + Math.random() * 0.6) // AF: irregularly irregular
      : beatInterval;

    const beatSample = Math.floor(t * ctx.sampleRate);

    // S1 — louder, lower pitch (mitral/tricuspid closure)
    const s1Len = Math.floor(ctx.sampleRate * 0.04);
    const s1Freq = soundType === 'muffled' ? 30 : 55;
    const s1Vol = soundType === 'muffled' ? 0.3 : 0.8;
    for (let j = 0; j < s1Len && (beatSample + j) < bufferSize; j++) {
      const env = Math.exp(-j / (s1Len * 0.3));
      data[beatSample + j] += Math.sin(2 * Math.PI * s1Freq * j / ctx.sampleRate) * env * s1Vol;
    }

    // S2 — slightly higher pitch, after systolic interval (~0.3 of beat)
    const s2Offset = Math.floor(actualInterval * 0.35 * ctx.sampleRate);
    const s2Len = Math.floor(ctx.sampleRate * 0.03);
    const s2Freq = soundType === 'muffled' ? 40 : 70;
    const s2Vol = soundType === 'muffled' ? 0.2 : 0.6;
    for (let j = 0; j < s2Len && (beatSample + s2Offset + j) < bufferSize; j++) {
      const env = Math.exp(-j / (s2Len * 0.25));
      data[beatSample + s2Offset + j] += Math.sin(2 * Math.PI * s2Freq * j / ctx.sampleRate) * env * s2Vol;
    }

    // S3 gallop — extra sound after S2 (ventricular filling)
    if (soundType === 'gallop') {
      const s3Offset = Math.floor(actualInterval * 0.52 * ctx.sampleRate);
      const s3Len = Math.floor(ctx.sampleRate * 0.025);
      for (let j = 0; j < s3Len && (beatSample + s3Offset + j) < bufferSize; j++) {
        const env = Math.exp(-j / (s3Len * 0.2));
        data[beatSample + s3Offset + j] += Math.sin(2 * Math.PI * 45 * j / ctx.sampleRate) * env * 0.35;
      }
    }

    // Systolic murmur — noise between S1 and S2
    if (soundType === 'murmur-systolic') {
      const murmurStart = Math.floor(ctx.sampleRate * 0.05);
      const murmurEnd = s2Offset - Math.floor(ctx.sampleRate * 0.01);
      for (let j = murmurStart; j < murmurEnd && (beatSample + j) < bufferSize; j++) {
        const pos = (j - murmurStart) / (murmurEnd - murmurStart);
        // Diamond-shaped crescendo-decrescendo
        const env = Math.sin(Math.PI * pos) * 0.25;
        data[beatSample + j] += (Math.random() * 2 - 1) * env;
      }
    }

    t += actualInterval;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Low-pass filter for body-transmitted sound feel
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = soundType === 'muffled' ? 100 : 200;
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
