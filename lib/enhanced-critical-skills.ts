// Enhanced Critical Paramedic Skills with Best Practice Guidelines
// Updated based on latest clinical guidelines and protocols

export interface EnhancedSkillStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  isRequired: boolean;
  keyPoints: string[];
  timeEstimate: number;
  isCritical: boolean;
  contraindications?: string[];
  safetyNotes?: string[];
  equipmentNeeded?: string[];
}

// Enhanced skill steps for critical paramedic procedures
export const enhancedCriticalSkillSteps: { [skillId: string]: EnhancedSkillStep[] } = {
  
  // BASIC AIRWAY MANAGEMENT
  'basic-airway-management': [
    {
      id: 'bam_1',
      stepNumber: 1,
      title: 'Initial airway assessment',
      description: 'Perform comprehensive visual and auditory assessment of patient airway status and breathing effort',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Observe patient position - typically sitting upright indicates respiratory distress',
        'Check for use of accessory muscles (intercostal, supraclavicular retractions)',
        'Look for signs of cyanosis around lips, fingernails, or central areas',
        'Note agitation or altered mental status indicating hypoxia',
        'Assess work of breathing - nasal flaring, tripod positioning'
      ],
      safetyNotes: [
        'Maintain universal precautions and appropriate PPE',
        'Be prepared for rapid deterioration',
        'Have suction equipment immediately available'
      ],
      equipmentNeeded: ['Stethoscope', 'Pulse oximeter', 'PPE']
    },
    {
      id: 'bam_2',
      stepNumber: 2,
      title: 'Auscultation and respiratory evaluation',
      description: 'Perform systematic auscultation to identify specific airway pathology and breathing patterns',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Have patient sit upright if possible for optimal lung expansion',
        'Place stethoscope directly on skin for accurate assessment',
        'Listen for abnormal sounds: rhonchi (gurgling), wheezes (musical), crackles (popping)',
        'Identify stridor (musical sound on inspiration) indicating upper airway obstruction',
        'Assess respiratory rate, depth, and symmetry',
        'Check oxygen saturation with pulse oximetry'
      ],
      safetyNotes: [
        'Do not delay intervention for prolonged assessment if patient is in extremis',
        'Monitor continuously as respiratory status can change rapidly'
      ],
      equipmentNeeded: ['Stethoscope', 'Pulse oximeter']
    },
    {
      id: 'bam_3',
      stepNumber: 3,
      title: 'Determine appropriate positioning technique',
      description: 'Select and apply correct manual airway positioning based on trauma vs non-trauma patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'NON-TRAUMA PATIENT: Use head tilt-chin lift technique',
        'TRAUMA PATIENT: Use jaw thrust technique to maintain C-spine immobilization',
        'For head tilt-chin lift: Place palm on forehead, fingers under bony jaw, tilt head back',
        'For jaw thrust: Hook fingers behind mandible angles, lift mandible forward',
        'Ensure technique lifts tongue off posterior pharynx effectively'
      ],
      contraindications: [
        'Do NOT use head tilt-chin lift in suspected cervical spine injury',
        'Avoid excessive force that could cause additional injury'
      ],
      safetyNotes: [
        'Maintain cervical spine immobilization in trauma patients',
        'Jaw thrust is more effective than head tilt-chin lift for opening airway'
      ],
      equipmentNeeded: ['C-collar (if trauma)', 'Head blocks (if spinal immobilization)']
    },
    {
      id: 'bam_4',
      stepNumber: 4,
      title: 'Clear airway obstruction',
      description: 'Remove visible obstructions and secretions to ensure patent airway',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Inspect mouth and oropharynx for visible obstructions',
        'Use portable suction to remove secretions, blood, or vomit',
        'Remove loose foreign objects with finger sweep only if visible',
        'Position patient to facilitate drainage (recovery position if appropriate)',
        'Suction technique: Insert catheter without suction, apply suction while withdrawing'
      ],
      contraindications: [
        'Do NOT perform blind finger sweeps - can push objects deeper',
        'Avoid excessive suction time (>15 seconds) to prevent hypoxia'
      ],
      safetyNotes: [
        'Always have suction equipment ready during airway procedures',
        'Be prepared for patient to vomit during manipulation'
      ],
      equipmentNeeded: ['Portable suction unit', 'Yankauer suction catheter', 'Suction catheters']
    },
    {
      id: 'bam_5',
      stepNumber: 5,
      title: 'Insert appropriate airway adjunct',
      description: 'Select, size, and insert oropharyngeal or nasopharyngeal airway based on patient consciousness level',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'OROPHARYNGEAL AIRWAY (OPA): Only for unconscious patients without gag reflex',
        'OPA sizing: Measure from central incisor to angle of jaw, or use middle finger length',
        'NASOPHARYNGEAL AIRWAY (NPA): Safe for conscious patients with intact gag reflex',
        'NPA sizing: Align with nose, similar length to OPA measurement',
        'Insert NPA with bevel toward nasal septum, aim posteriorly not cephalad',
        'Can use multiple NPAs (both nostrils) plus OPA simultaneously if needed'
      ],
      contraindications: [
        'Do NOT use OPA in conscious patients or those with gag reflex',
        'Avoid excessive force with NPA insertion',
        'Do NOT use NPA in suspected basilar skull fracture'
      ],
      safetyNotes: [
        'Test for gag reflex before OPA insertion',
        'Lubricate NPA with water-soluble lubricant',
        'If resistance encountered with NPA, try other nostril'
      ],
      equipmentNeeded: ['Oropharyngeal airways (various sizes)', 'Nasopharyngeal airways (various sizes)', 'Water-soluble lubricant']
    },
    {
      id: 'bam_6',
      stepNumber: 6,
      title: 'Provide supplemental oxygen and monitor',
      description: 'Administer appropriate oxygen therapy and establish continuous monitoring protocols',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Apply oxygen via nasal cannula (2-6 L/min) or non-rebreather mask (10-15 L/min)',
        'Choose delivery method based on patient tolerance and oxygen requirements',
        'Monitor oxygen saturation continuously with pulse oximetry',
        'Reassess airway patency and breathing effort frequently',
        'Prepare for bag-mask ventilation if spontaneous breathing inadequate',
        'Document baseline vital signs and response to interventions'
      ],
      safetyNotes: [
        'Every second counts - do not delay oxygen administration',
        'Be prepared to escalate to positive pressure ventilation',
        'Continuous monitoring is essential as status can deteriorate rapidly'
      ],
      equipmentNeeded: ['Oxygen source', 'Nasal cannula', 'Non-rebreather mask', 'Pulse oximeter', 'Bag-mask device']
    }
  ],

  // ADVANCED AIRWAY MANAGEMENT - BAG-MASK VENTILATION
  'advanced-airway-management': [
    {
      id: 'aam_1',
      stepNumber: 1,
      title: 'Pre-oxygenation and equipment preparation',
      description: 'Optimize patient oxygenation and prepare all necessary airway equipment before intervention',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Pre-oxygenate with 100% oxygen for 3-5 minutes using high-flow oxygen',
        'Prepare bag-mask device with oxygen reservoir and 15 L/min flow rate',
        'Ensure clear mask available for visual assessment of lip color and condensation',
        'Set up EtCO2 monitoring with adaptor and bacterial filter',
        'Have suction equipment immediately available and functioning',
        'Position patient appropriately - "sniffing position" for non-trauma patients'
      ],
      safetyNotes: [
        'Never attempt advanced airway without confirming ability to ventilate',
        'Pre-oxygenation is critical to prevent hypoxia during procedure',
        'Always have backup plan and alternative airway devices ready'
      ],
      equipmentNeeded: ['Bag-mask device', 'Oxygen source', 'EtCO2 monitoring', 'Suction unit', 'Clear mask', 'Bacterial filter']
    },
    {
      id: 'aam_2',
      stepNumber: 2,
      title: 'Airway assessment using LEMON criteria',
      description: 'Systematically assess for difficult airway using established clinical prediction tools',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'LOOK externally: facial trauma, blood, vomitus, large incisors, beard',
        'EVALUATE (3-3-2): 3 finger mouth opening, 3 finger thyromental distance, 2 finger hyoid-thyroid',
        'MALLAMPATI: assess tongue size relative to oral cavity',
        'OBSTRUCTION: blood, vomitus, foreign body, infection, hematoma',
        'NECK MOBILITY: ability to flex neck and extend head',
        'Consider BMI >35 as additional difficulty factor'
      ],
      safetyNotes: [
        'If difficult airway predicted, consider alternative techniques first',
        'Document assessment findings for communication with receiving facility'
      ],
      equipmentNeeded: ['Penlight', 'Assessment tools']
    },
    {
      id: 'aam_3',
      stepNumber: 3,
      title: 'One-person bag-mask ventilation (if adequate)',
      description: 'Attempt single-operator bag-mask ventilation with proper technique and seal assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Place mask apex over bridge of nose, base over chin',
        'Use non-dominant hand for mask seal: thumb and index finger form "C" over mask',
        'Remaining fingers form "E" along mandible to lift jaw and open airway',
        'Apply gentle chin lift and jaw thrust simultaneously',
        'Dominant hand compresses bag with gentle, even pressure',
        'Target ventilation pressure 15-20 cmH2O (green zone on manometer)',
        'Watch for gentle chest rise and fall - avoid excessive volumes'
      ],
      safetyNotes: [
        'Excessive ventilation pressure causes gastric insufflation',
        'Monitor EtCO2 waveform to confirm effective ventilation',
        'If inadequate ventilation, immediately progress to two-person technique'
      ],
      equipmentNeeded: ['Bag-mask device with manometer', 'EtCO2 monitoring']
    },
    {
      id: 'aam_4',
      stepNumber: 4,
      title: 'Two-person bag-mask ventilation (gold standard)',
      description: 'Implement two-operator technique for optimal mask seal and ventilation delivery',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'OPERATOR 1 (Mask holder): Use both hands to maintain mask seal',
        'Two-handed mask seal: thumbs on mask, index fingers complete seal',
        'Remaining fingers lift mandible with jaw thrust technique',
        'Maintain airway alignment and optimal mask seal throughout',
        'OPERATOR 2 (Bag compressor): Focus solely on gentle bag compression',
        'Compress bag smoothly at 10-12 breaths per minute for adults',
        'Monitor chest rise, EtCO2, and oxygen saturation continuously'
      ],
      safetyNotes: [
        'Two-person technique significantly improves tidal volumes',
        'Maintain constant communication between operators',
        'Adjust technique if gastric insufflation occurs'
      ],
      equipmentNeeded: ['Two trained operators', 'Bag-mask device', 'EtCO2 monitoring']
    },
    {
      id: 'aam_5',
      stepNumber: 5,
      title: 'Assess need for advanced airway intervention',
      description: 'Evaluate effectiveness of bag-mask ventilation and determine need for advanced airway',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Assess adequacy of ventilation: chest rise, EtCO2 values, oxygen saturation',
        'Indications for advanced airway: inadequate ventilation, prolonged resuscitation',
        'Consider supraglottic airway (i-gel, LMA) as first-line advanced option',
        'Endotracheal intubation reserved for specific indications or SGA failure',
        'Document decision rationale and ventilation effectiveness',
        'Continue effective bag-mask ventilation if adequate - no need to intubate'
      ],
      contraindications: [
        'Do not attempt intubation if bag-mask ventilation is adequate',
        'Avoid intubation attempts without experienced operator available'
      ],
      safetyNotes: [
        'Bag-mask ventilation may be superior to intubation in cardiac arrest',
        'Limit intubation attempts to maximum 2 tries by experienced operator'
      ],
      equipmentNeeded: ['Assessment criteria', 'Alternative airway devices if indicated']
    },
    {
      id: 'aam_6',
      stepNumber: 6,
      title: 'Continuous monitoring and reassessment',
      description: 'Maintain ongoing assessment of ventilation effectiveness and patient status',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor EtCO2 waveform continuously - normal 35-45 mmHg',
        'Assess oxygen saturation - maintain >94% when possible',
        'Watch for gastric insufflation and decompress if necessary',
        'Reassess mask seal and airway positioning frequently',
        'Monitor for changes in compliance or resistance',
        'Document ventilation parameters and patient response',
        'Prepare for transport with continued ventilatory support'
      ],
      safetyNotes: [
        'Ventilation needs may change during transport',
        'Be prepared to adjust technique or upgrade airway as needed',
        'Communicate ventilation status to receiving facility'
      ],
      equipmentNeeded: ['Continuous monitoring equipment', 'Transport ventilation setup', 'Documentation materials']
    }
  ],

  // TRAUMA ASSESSMENT - PRIMARY AND SECONDARY SURVEY
  'trauma-assessment': [
    {
      id: 'ta_1',
      stepNumber: 1,
      title: 'Scene safety and initial impression',
      description: 'Ensure scene safety, establish mechanism of injury, and form initial patient impression',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Ensure scene is safe - look for ongoing hazards (traffic, fire, violence)',
        'Use appropriate PPE including gloves, eye protection',
        'Identify mechanism of injury (MOI) - blunt vs penetrating',
        'Form general impression: age, sex, position, obvious distress',
        'Assume spinal injury until proven otherwise',
        'Call for additional resources early if major trauma suspected'
      ],
      safetyNotes: [
        'Do not enter unsafe scene - wait for scene control',
        'Maintain situational awareness throughout assessment',
        'Consider need for law enforcement or fire department'
      ],
      equipmentNeeded: ['PPE', 'Trauma kit', 'Spine immobilization equipment']
    },
    {
      id: 'ta_2',
      stepNumber: 2,
      title: 'Primary survey - ABCDE assessment',
      description: 'Perform systematic life-threatening injury assessment using ABCDE protocol',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'AIRWAY with C-spine protection: Can patient speak? Clear airway if obstructed',
        'BREATHING: Look for chest rise, tracheal deviation, open wounds, flail chest',
        'CIRCULATION: Control obvious bleeding, assess pulse quality, skin color',
        'DISABILITY: Check neurological status using AVPU scale, pupil response',
        'EXPOSURE: Remove clothing to find hidden injuries, prevent hypothermia',
        'Address life-threats immediately as found before continuing'
      ],
      safetyNotes: [
        'Maintain cervical spine immobilization throughout assessment',
        'Stop and treat life-threatening conditions immediately',
        'If patient deteriorates, restart ABCDE assessment'
      ],
      equipmentNeeded: ['Cervical collar', 'Oxygen', 'Bandages', 'Tourniquet', 'Blankets']
    },
    {
      id: 'ta_3',
      stepNumber: 3,
      title: 'Airway assessment with spinal protection',
      description: 'Detailed airway evaluation while maintaining cervical spine immobilization',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Ask patient to speak - if able to talk clearly, airway is patent',
        'Look for visible obstructions: blood, vomit, broken teeth, foreign objects',
        'Listen for abnormal sounds: stridor, gurgling, snoring',
        'Use jaw thrust (not head-tilt) if spinal injury suspected',
        'Suction if secretions present - insert without suction, suction on withdrawal',
        'Consider advanced airway if GCS <8 or airway compromise'
      ],
      contraindications: [
        'Do NOT use head-tilt chin-lift if spinal injury suspected',
        'Avoid blind finger sweeps - can push objects deeper'
      ],
      safetyNotes: [
        'Maintain manual cervical spine stabilization during assessment',
        'Be prepared for vomiting during airway manipulation'
      ],
      equipmentNeeded: ['Suction device', 'Oropharyngeal/nasopharyngeal airways', 'Advanced airway equipment']
    },
    {
      id: 'ta_4',
      stepNumber: 4,
      title: 'Breathing and ventilation assessment',
      description: 'Evaluate breathing effectiveness and identify chest injuries requiring immediate intervention',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'LOOK: Chest symmetry, use of accessory muscles, cyanosis, open wounds',
        'FEEL: Chest wall stability, subcutaneous emphysema, tracheal position',
        'LISTEN: Breath sounds bilaterally, quality, and presence',
        'Identify life-threats: tension pneumothorax, open chest wound, flail chest',
        'Apply occlusive dressing to open chest wounds (3 sides only)',
        'Provide high-flow oxygen to all trauma patients initially'
      ],
      safetyNotes: [
        'Needle decompression for tension pneumothorax is time-critical',
        'Do not seal open chest wound on all 4 sides - can create tension pneumothorax',
        'Monitor for respiratory deterioration continuously'
      ],
      equipmentNeeded: ['Stethoscope', 'Occlusive dressings', 'Needle decompression kit', 'Oxygen delivery devices']
    },
    {
      id: 'ta_5',
      stepNumber: 5,
      title: 'Circulation assessment and hemorrhage control',
      description: 'Assess circulatory status and immediately control life-threatening bleeding',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Control obvious external bleeding immediately: direct pressure, tourniquets',
        'Assess pulse quality, rate, and regularity (radial, carotid)',
        'Check skin color, temperature, moisture, and capillary refill',
        'Look for signs of internal bleeding: distended abdomen, pelvic instability',
        'Initiate IV access for fluid resuscitation if indicated',
        'Consider blood pressure measurement but do not delay transport'
      ],
      safetyNotes: [
        'Tourniquets save lives - apply high and tight for arterial bleeding',
        'Time is critical for hemorrhage control - "golden hour" concept',
        'Avoid fluid overload - permissive hypotension in penetrating trauma'
      ],
      equipmentNeeded: ['Tourniquets', 'Pressure bandages', 'IV supplies', 'Blood pressure cuff', 'Isotonic fluids']
    },
    {
      id: 'ta_6',
      stepNumber: 6,
      title: 'Disability and neurological assessment',
      description: 'Evaluate neurological status and spinal cord function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess level of consciousness using AVPU scale (Alert, Verbal, Pain, Unresponsive)',
        'Calculate Glasgow Coma Scale (GCS) - eye opening, verbal, motor response',
        'Check pupil size, equality, and reaction to light (PEARL)',
        'Look for lateralizing signs: unequal pupils, focal motor deficits',
        'Test sensation and motor function in all extremities if possible',
        'Consider need for definitive airway if GCS <8'
      ],
      safetyNotes: [
        'Rapid neurological decline requires immediate intervention',
        'Document initial GCS for trending and communication',
        'Consider traumatic brain injury in all head trauma patients'
      ],
      equipmentNeeded: ['Penlight', 'GCS assessment chart', 'Advanced airway equipment if indicated']
    },
    {
      id: 'ta_7',
      stepNumber: 7,
      title: 'Exposure and environmental control',
      description: 'Complete patient examination while preventing hypothermia and maintaining dignity',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Remove all clothing to identify hidden injuries - cut if necessary',
        'Examine entire body using DCAP-BTLS assessment (see next step)',
        'Log roll patient to examine posterior surfaces if spinal injury suspected',
        'Look for entrance and exit wounds in penetrating trauma',
        'Cover patient with warm blankets immediately after examination',
        'Maintain patient dignity and privacy when possible'
      ],
      safetyNotes: [
        'Hypothermia worsens bleeding and shock - prevent heat loss',
        'Use proper spinal immobilization during log roll',
        'Do not remove impaled objects'
      ],
      equipmentNeeded: ['Trauma shears', 'Warm blankets', 'Log roll equipment', 'Privacy sheets']
    },
    {
      id: 'ta_8',
      stepNumber: 8,
      title: 'Secondary survey - DCAP-BTLS head-to-toe assessment',
      description: 'Perform systematic detailed physical examination to identify all injuries',
      isRequired: true,
      isCritical: false,
      timeEstimate: 300,
      keyPoints: [
        'HEAD: DCAP-BTLS assessment, check ears/nose for CSF, examine eyes',
        'NECK: Palpate for deformity, apply cervical collar if not done',
        'CHEST: Inspect, palpate, auscultate - look for rib fractures, crepitus',
        'ABDOMEN: Four quadrants, look for distension, guarding, rigidity',
        'PELVIS: Gentle compression test, check for stability and pain',
        'EXTREMITIES: DCAP-BTLS, check CMS (Circulation, Motor, Sensation)',
        'POSTERIOR: Log roll and examine back and buttocks'
      ],
      safetyNotes: [
        'Only perform secondary survey if primary survey stable',
        'Stop secondary survey if patient deteriorates',
        'Document all findings for hospital communication'
      ],
      equipmentNeeded: ['Assessment forms', 'Penlight', 'Pulse oximeter']
    },
    {
      id: 'ta_9',
      stepNumber: 9,
      title: 'SAMPLE history and vital signs',
      description: 'Gather pertinent medical history and establish baseline vital signs',
      isRequired: true,
      isCritical: false,
      timeEstimate: 180,
      keyPoints: [
        'SAMPLE History: Signs/Symptoms, Allergies, Medications, Past history, Last meal, Events',
        'Focus on mechanism of injury details: speed, height, weapons used',
        'Obtain vital signs: BP, pulse, respirations, temperature, oxygen saturation',
        'Use OPQRST for pain assessment if patient conscious',
        'Document time of injury and treatment interventions',
        'Communicate findings to receiving hospital early'
      ],
      safetyNotes: [
        'Gather history from patient, family, or bystanders',
        'Do not delay transport for complete history if unstable',
        'Trending vital signs more important than single measurements'
      ],
      equipmentNeeded: ['Vital signs equipment', 'Documentation materials', 'Communication equipment']
    },
    {
      id: 'ta_10',
      stepNumber: 10,
      title: 'Ongoing assessment and transport preparation',
      description: 'Continuously monitor patient status and prepare for rapid transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Reassess ABCs frequently - every 5 minutes for unstable patients',
        'Re-evaluate all interventions for effectiveness',
        'Prepare for immediate transport to appropriate trauma center',
        'Consider need for ALS intercept or helicopter transport',
        'Package patient properly with spinal immobilization if indicated',
        'Provide radio report to receiving facility with ETA'
      ],
      safetyNotes: [
        'Return to primary survey immediately if patient deteriorates',
        'Do not delay transport for non-critical interventions',
        'Maintain warm IV fluids and prevent hypothermia during transport'
      ],
      equipmentNeeded: ['Transport equipment', 'Monitoring devices', 'Communication equipment', 'Spinal immobilization devices']
    }
  ],

  // CARDIAC MONITORING AND 12-LEAD ECG
  'cardiac-monitoring-12-lead-ecg': [
    {
      id: 'cm_1',
      stepNumber: 1,
      title: 'Patient preparation and positioning',
      description: 'Prepare patient for ECG acquisition with optimal positioning and skin preparation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient supine or semi-Fowler\'s (30-45 degrees) if possible',
        'Expose chest and arms - maintain patient dignity and warmth',
        'Remove jewelry, clothing, bras that interfere with electrode placement',
        'Explain procedure to conscious patients to reduce anxiety and movement',
        'Ensure patient is still and relaxed to minimize artifact',
        'Have patient remove cell phone from chest area if present'
      ],
      safetyNotes: [
        'Maintain patient privacy and dignity during chest exposure',
        'Be prepared to perform ECG in suboptimal positions if clinically necessary',
        'Consider cultural sensitivities regarding chest exposure'
      ],
      equipmentNeeded: ['ECG machine', 'Electrodes', 'Razors for hair removal', 'Alcohol prep pads', 'Patient drape/blanket']
    },
    {
      id: 'cm_2',
      stepNumber: 2,
      title: 'Skin preparation and electrode attachment',
      description: 'Prepare skin surface and attach electrodes for optimal signal quality',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Clean skin with alcohol prep pad if visibly dirty or oily',
        'Shave hair at electrode sites - improves signal quality significantly',
        'Use dry razor or electric clippers for hair removal',
        'Ensure electrode gel is moist and conductive',
        'Apply electrodes firmly with good skin contact',
        'Connect lead wires to electrodes BEFORE placing on patient',
        'Avoid placing electrodes over bony prominences or muscle masses'
      ],
      safetyNotes: [
        'Use gentle pressure when shaving to avoid skin irritation',
        'Check electrodes for proper adhesion to prevent lead disconnection',
        'Be aware of skin allergies to adhesive materials'
      ],
      equipmentNeeded: ['Disposable razors', 'Alcohol prep pads', 'ECG electrodes with conductive gel', 'Lead wires']
    },
    {
      id: 'cm_3',
      stepNumber: 3,
      title: 'Limb lead placement (RA, LA, RL, LL)',
      description: 'Apply the four limb electrodes using proper anatomical landmarks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'RA (Right Arm): Right wrist or right upper arm below shoulder',
        'LA (Left Arm): Left wrist or left upper arm below shoulder',
        'RL (Right Leg): Right ankle or right lower leg - serves as ground',
        'LL (Left Leg): Left ankle or left lower leg',
        'Place limb leads on flat, fleshy areas - avoid joints and bone',
        'Ensure symmetrical placement between right and left sides',
        'Can use chest/torso placement if extremity injury present'
      ],
      safetyNotes: [
        'Avoid placing limb leads over wounds or IV sites',
        'Modified limb placement (torso) acceptable if extremity access limited',
        'Ensure good skin contact for all limb leads'
      ],
      equipmentNeeded: ['Limb lead electrodes', 'Lead identification labels']
    },
    {
      id: 'cm_4',
      stepNumber: 4,
      title: 'Precordial chest lead placement (V1-V6)',
      description: 'Accurately position the six chest leads using anatomical landmarks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Find sternal angle (angle of Louis) - landmark for 2nd intercostal space',
        'V1: 4th intercostal space, right sternal border',
        'V2: 4th intercostal space, left sternal border',
        'V3: Halfway between V2 and V4',
        'V4: 5th intercostal space, midclavicular line',
        'V5: Anterior axillary line, same horizontal level as V4',
        'V6: Midaxillary line, same horizontal level as V4 and V5',
        'For female patients: place V3-V6 UNDER the left breast, not on it'
      ],
      contraindications: [
        'Avoid placing V1-V2 too high (common error causing false MI pattern)',
        'Do not place lateral leads (V5-V6) too low or posterior'
      ],
      safetyNotes: [
        'Accurate chest lead placement critical for STEMI identification',
        'Up to 50% of cases have V1-V2 placed too high causing false readings',
        'Double-check intercostal spaces by counting from sternal angle'
      ],
      equipmentNeeded: ['Chest electrodes', 'Anatomical reference guide']
    },
    {
      id: 'cm_5',
      stepNumber: 5,
      title: 'ECG acquisition and quality assessment',
      description: 'Acquire 12-lead ECG with optimal technical quality and minimal artifact',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Ensure all leads are connected and displaying properly',
        'Check for loose connections or disconnected leads',
        'Minimize patient movement and talking during acquisition',
        'Set appropriate calibration: 25 mm/sec paper speed, 10 mm/mV amplitude',
        'Acquire minimum 10 seconds of rhythm data',
        'Check for adequate R-wave amplitude in all leads',
        'Look for baseline wandering, muscle artifact, or 60-Hz interference'
      ],
      safetyNotes: [
        'Poor quality ECG can lead to misdiagnosis',
        'Repeat ECG acquisition if significant artifact present',
        'Ensure patient safety during multiple attempts'
      ],
      equipmentNeeded: ['Calibrated ECG machine', 'ECG paper or digital storage']
    },
    {
      id: 'cm_6',
      stepNumber: 6,
      title: 'Basic rhythm and STEMI interpretation',
      description: 'Perform systematic ECG interpretation focusing on life-threatening findings',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'RATE: Count ventricular rate - normal 60-100 bpm',
        'RHYTHM: Identify underlying rhythm - sinus vs non-sinus',
        'AXIS: Assess QRS axis - normal, left, or right deviation',
        'INTERVALS: PR interval (normal 120-200 ms), QRS width (normal <120 ms)',
        'ST SEGMENTS: Look for elevation ≥1mm in limb leads, ≥2mm in chest leads',
        'STEMI criteria: ST elevation in 2+ contiguous leads',
        'Identify reciprocal changes in opposite leads'
      ],
      safetyNotes: [
        'Focus on identifying immediately life-threatening rhythms first',
        'STEMI identification requires immediate action - do not delay transport',
        'When in doubt, transmit ECG to receiving facility for expert interpretation'
      ],
      equipmentNeeded: ['ECG interpretation reference', 'Calipers or measurement tools']
    },
    {
      id: 'cm_7',
      stepNumber: 7,
      title: 'Clinical correlation and treatment decisions',
      description: 'Correlate ECG findings with clinical presentation and initiate appropriate treatment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Correlate ECG findings with patient symptoms and clinical presentation',
        'STEMI identified: activate cardiac alert, notify receiving hospital',
        'Consider aspirin, nitroglycerin per protocols if STEMI suspected',
        'Serial ECGs every 15-30 minutes for chest pain patients',
        'Document time of ECG acquisition and interpretation',
        'Consider 15-lead or 18-lead ECG for posterior wall assessment if indicated'
      ],
      safetyNotes: [
        'Clinical presentation may not match ECG findings',
        'Some STEMIs may have subtle or atypical presentations',
        'Time is muscle - minimize delay in PCI-capable facility transport'
      ],
      equipmentNeeded: ['Treatment protocols', 'Communication equipment', 'Medications per protocol']
    },
    {
      id: 'cm_8',
      stepNumber: 8,
      title: 'Documentation and transmission',
      description: 'Document findings and transmit ECG to receiving facility for expert review',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Print hard copy of ECG or ensure digital storage',
        'Document ECG interpretation findings in patient care record',
        'Transmit ECG to receiving hospital if transmission capability available',
        'Provide radio report including ECG findings to receiving facility',
        'Note any technical issues or limitations with ECG quality',
        'Include time stamps for all ECG acquisitions',
        'Follow up with receiving facility to confirm ECG transmission received'
      ],
      safetyNotes: [
        'Backup documentation critical if digital systems fail',
        'Ensure patient privacy during ECG transmission',
        'Verify receiving facility has capability to receive transmitted ECGs'
      ],
      equipmentNeeded: ['ECG printer or digital storage', 'Transmission equipment', 'Documentation forms', 'Communication equipment']
    },
    {
      id: 'cm_9',
      stepNumber: 9,
      title: 'Continuous monitoring and reassessment',
      description: 'Establish continuous cardiac monitoring and reassess for changes during transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Place patient on continuous 3-lead or 5-lead monitoring during transport',
        'Choose monitoring lead with best R-wave amplitude and minimal artifact',
        'Set appropriate alarm parameters for rate and rhythm',
        'Reassess ECG if patient condition changes or symptoms worsen',
        'Obtain serial 12-leads for ongoing chest pain or STEMI patients',
        'Monitor for arrhythmias, especially with acute MI patients',
        'Document any rhythm changes or new ECG abnormalities'
      ],
      safetyNotes: [
        'Continuous monitoring essential for detecting life-threatening arrhythmias',
        'Be prepared to treat sudden cardiac arrest in STEMI patients',
        'Ensure monitoring electrodes remain secure during transport'
      ],
      equipmentNeeded: ['Continuous monitoring equipment', 'Transport-compatible ECG machine', 'Additional electrodes']
    }
  ],

  // IV/IO ACCESS AND MEDICATION ADMINISTRATION
  'iv-io-access-medication-administration': [
    {
      id: 'ivio_1',
      stepNumber: 1,
      title: 'Patient assessment and access site selection',
      description: 'Evaluate patient condition, determine vascular access needs, and select optimal IV or IO access site',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess clinical urgency: stable vs unstable patient requiring immediate access',
        'Examine potential IV sites: forearm, dorsal hand, antecubital fossa',
        'Look for straight, visible, palpable veins - avoid sclerosed or bruised areas',
        'Consider IO access if: cardiac arrest, shock, difficult IV access, time-critical',
        'Select appropriate catheter size: 18-20G adults, 22-24G pediatric/elderly',
        'For IO: prefer proximal tibia (adults), humeral head, or sternum',
        'Avoid lower extremity IV access when possible - higher infection risk'
      ],
      safetyNotes: [
        'Upper extremity access preferred over lower extremity',
        'Consider patient mobility and comfort in site selection',
        'IO access indicated when IV attempts would delay critical care'
      ],
      equipmentNeeded: ['Tourniquet', 'IV catheters various sizes', 'IO insertion device', 'Antiseptic prep']
    },
    {
      id: 'ivio_2',
      stepNumber: 2,
      title: 'Equipment preparation and infection control',
      description: 'Prepare all necessary equipment and establish sterile technique for vascular access procedure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Perform hand hygiene and don appropriate gloves',
        'Gather equipment: IV catheter, tubing, saline flushes, tape, dressing',
        'For IO: prepare insertion device (EZ-IO, FAST-1), anesthetic, pressure bag',
        'Prime IV tubing with normal saline to remove air bubbles',
        'Prepare saline flush syringes (10mL for adults, 2-5mL pediatric)',
        'Have local anesthetic ready (lidocaine 1%) for IO insertion pain control',
        'Organize medications according to protocol and patient needs'
      ],
      safetyNotes: [
        'Maintain aseptic technique throughout procedure',
        'Check all equipment functionality before patient contact',
        'Have backup equipment readily available'
      ],
      equipmentNeeded: ['Sterile gloves', 'IV tubing and bags', 'Saline flushes', 'Tape and dressings', 'Local anesthetic']
    },
    {
      id: 'ivio_3',
      stepNumber: 3,
      title: 'IV cannulation technique',
      description: 'Perform peripheral IV cannulation using proper technique and vein stabilization',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Apply tourniquet 6-8 inches proximal to insertion site',
        'Palpate and visualize target vein - choose straight segment if possible',
        'Clean insertion site with antiseptic in circular motion (center outward)',
        'Stabilize vein by applying gentle traction with non-dominant hand',
        'Insert catheter at 30-45 degree angle, bevel up, towards the vein',
        'Watch for blood flashback in catheter hub indicating vein entry',
        'Lower angle to 15-20 degrees and advance catheter off needle',
        'Remove tourniquet and apply pressure above insertion site'
      ],
      contraindications: [
        'Avoid sites with infection, phlebitis, or previous IV complications',
        'Do not attempt in area of fracture or compartment syndrome',
        'Limit to 2 attempts per practitioner before considering IO access'
      ],
      safetyNotes: [
        'Use gentle pressure to avoid "blowing" the vein',
        'Advance catheter slowly to prevent through-and-through puncture',
        'If unsuccessful after 2 attempts, consider alternative site or IO access'
      ],
      equipmentNeeded: ['IV catheter', 'Tourniquet', 'Antiseptic prep', 'Sterile gauze']
    },
    {
      id: 'ivio_4',
      stepNumber: 4,
      title: 'Intraosseous (IO) insertion technique',
      description: 'Insert IO access device using appropriate anatomical landmarks and sterile technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Select insertion site: proximal tibia (preferred), humeral head, or sternum',
        'Palpate anatomical landmarks: tibial tuberosity, medial malleolus',
        'Clean insertion site with antiseptic prep in widening circles',
        'Consider local anesthetic injection for conscious patients',
        'Insert needle perpendicular to bone surface with firm, steady pressure',
        'For EZ-IO: use battery-powered driver until "pop" or loss of resistance felt',
        'Ensure at least 5mm of needle shaft visible above skin surface',
        'Remove stylet and attach extension tubing or syringe'
      ],
      safetyNotes: [
        'Avoid insertion near fractures, infections, or previous IO sites',
        'Use appropriate needle length based on patient size and anatomy',
        'Stop insertion if excessive resistance encountered - may indicate cortical drilling'
      ],
      equipmentNeeded: ['IO insertion device', 'Appropriate needles', 'Antiseptic prep', 'Local anesthetic', 'Extension tubing']
    },
    {
      id: 'ivio_5',
      stepNumber: 5,
      title: 'Access verification and securing',
      description: 'Verify proper catheter or IO placement and secure access for medication administration',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'IV verification: observe blood return, flush with saline without resistance',
        'IO verification: attempt bone marrow aspiration, check needle stability',
        'Flush access with saline - watch for infiltration or swelling',
        'For IV: connect primed IV tubing and establish appropriate flow rate',
        'For IO: inject lidocaine 1% (1-2mL) to reduce infusion pain if conscious',
        'Secure catheter with appropriate dressing and tape',
        'Document insertion site, catheter size, and any complications'
      ],
      contraindications: [
        'Do not force flush if resistance encountered - may indicate infiltration',
        'Stop procedure if signs of extravasation or compartment syndrome'
      ],
      safetyNotes: [
        'Gentle flush technique prevents vessel damage or tissue infiltration',
        'Continuous monitoring for signs of access failure or complications',
        'IO access should be secured but remain easily accessible for removal'
      ],
      equipmentNeeded: ['IV tubing', 'Saline flush', 'Securing tape', 'Transparent dressing', 'Documentation materials']
    },
    {
      id: 'ivio_6',
      stepNumber: 6,
      title: 'Medication calculation and preparation',
      description: 'Calculate medication dosages and prepare medications for safe administration',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Verify patient identity, allergies, and current medications',
        'Calculate accurate dosages based on patient weight and clinical condition',
        'Use appropriate concentration and volume for medication delivery',
        'Check medication expiration dates and visual appearance',
        'Follow "5 rights": Right patient, drug, dose, route, time',
        'For weight-based dosing: confirm patient weight or estimate accurately',
        'Double-check high-risk medications (narcotics, vasopressors, antiarrhythmics)'
      ],
      safetyNotes: [
        'Independent double-check for high-risk medications when possible',
        'Use standardized drug calculation formulas to prevent errors',
        'Question any dosage that seems unusually high or low'
      ],
      equipmentNeeded: ['Medication reference guide', 'Calculator', 'Syringes various sizes', 'Medication vials/ampoules']
    },
    {
      id: 'ivio_7',
      stepNumber: 7,
      title: 'Medication administration and monitoring',
      description: 'Safely administer medications and monitor patient response to treatment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Verify access patency with saline flush before medication administration',
        'Administer medication at appropriate rate: IV push vs infusion',
        'For IV push: inject slowly over 2-5 minutes unless otherwise specified',
        'For IO: may require pressure bag for rapid fluid infusion (up to 125mL/min)',
        'Monitor patient vital signs and clinical response during administration',
        'Watch for adverse reactions: allergic responses, infiltration, phlebitis',
        'Document medication name, dose, route, time, and patient response'
      ],
      safetyNotes: [
        'Never administer medication through access showing signs of infiltration',
        'Be prepared to treat adverse drug reactions immediately',
        'Continuous patient monitoring essential during medication administration'
      ],
      equipmentNeeded: ['Pressure bag for IO', 'Vital signs monitoring equipment', 'Emergency medications for adverse reactions']
    },
    {
      id: 'ivio_8',
      stepNumber: 8,
      title: 'Ongoing access maintenance and reassessment',
      description: 'Maintain vascular access integrity and reassess patient response to therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Reassess access site frequently for signs of complications',
        'Look for infiltration: swelling, coolness, pain at insertion site',
        'Monitor for phlebitis: redness, warmth, streak tracking up vein',
        'Ensure IV tubing and connections remain secure during transport',
        'Flush access with saline every 30 minutes if not in continuous use',
        'For IO access: limit duration to 24 hours maximum',
        'Reassess patient clinical response and need for additional medications'
      ],
      safetyNotes: [
        'Remove access immediately if complications develop',
        'IO access is temporary bridge - establish IV access when feasible',
        'Document any access site complications or medication reactions'
      ],
      equipmentNeeded: ['Saline flushes', 'Additional dressings', 'Equipment for access site replacement if needed']
    }
  ],

  // OXYGEN THERAPY AND PULSE OXIMETRY
  'oxygen-therapy-pulse-oximetry': [
    {
      id: 'ot_1',
      stepNumber: 1,
      title: 'Initial respiratory assessment and baseline measurement',
      description: 'Perform comprehensive respiratory assessment and obtain baseline pulse oximetry reading',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess airway patency and breathing effectiveness',
        'Obtain baseline pulse oximetry reading on room air if time permits',
        'Evaluate respiratory rate, depth, and effort (normal 12-20/min adults)',
        'Listen for adventitious breath sounds: wheezes, crackles, stridor',
        'Observe for use of accessory muscles and cyanosis',
        'Note patient position and ability to speak in full sentences',
        'Check mental status - hypoxia causes confusion and agitation'
      ],
      safetyNotes: [
        'Do not delay oxygen therapy to obtain room air saturation in severe respiratory distress',
        'Pulse oximetry may be inaccurate with poor circulation, movement, or nail polish',
        'Clinical assessment takes priority over single pulse oximetry reading'
      ],
      equipmentNeeded: ['Pulse oximeter', 'Stethoscope', 'Assessment forms']
    },
    {
      id: 'ot_2',
      stepNumber: 2,
      title: 'Pulse oximetry setup and troubleshooting',
      description: 'Properly apply pulse oximetry probe and ensure accurate readings',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Select appropriate probe size and type for patient (finger, ear, forehead)',
        'Clean probe site and remove nail polish if necessary',
        'Apply probe securely but not too tightly to avoid circulation restriction',
        'Ensure good waveform and adequate signal strength',
        'Allow 30-60 seconds for stabilization before recording values',
        'Correlate pulse oximetry heart rate with actual pulse rate',
        'Position probe to minimize motion artifact during transport'
      ],
      contraindications: [
        'Avoid probe placement on injured or infected fingers/ears',
        'Do not rely on pulse oximetry alone in carbon monoxide poisoning',
        'May be inaccurate in severe anemia or methemoglobinemia'
      ],
      safetyNotes: [
        'Probe should not be left in same location for extended periods',
        'Check circulation distal to probe placement',
        'Be aware of pulse oximetry limitations and false readings'
      ],
      equipmentNeeded: ['Pulse oximeter with various probe sizes', 'Nail polish remover', 'Cleaning wipes']
    },
    {
      id: 'ot_3',
      stepNumber: 3,
      title: 'Oxygen delivery system selection',
      description: 'Select appropriate oxygen delivery device based on patient condition and oxygen requirements',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'NASAL CANNULA (1-6 L/min): Mild hypoxia, conscious cooperative patients',
        'SIMPLE FACE MASK (6-10 L/min): Moderate hypoxia, delivers 35-50% oxygen',
        'NON-REBREATHER MASK (10-15 L/min): Severe hypoxia, delivers 60-80% oxygen',
        'BAG-MASK (15 L/min): Respiratory failure, delivers near 100% oxygen',
        'Consider patient comfort, cooperation, and clinical condition',
        'Titrate oxygen to achieve target saturation: 94-98% (88-92% for COPD)',
        'Start with higher flow rates in emergency situations, then titrate down'
      ],
      safetyNotes: [
        'Oxygen supports combustion - no smoking or open flames',
        'Use minimum effective oxygen concentration to avoid oxygen toxicity',
        'Monitor for signs of CO2 retention in COPD patients'
      ],
      equipmentNeeded: ['Nasal cannula', 'Simple face masks', 'Non-rebreather masks', 'Oxygen source and tubing']
    },
    {
      id: 'ot_4',
      stepNumber: 4,
      title: 'Nasal cannula application and monitoring',
      description: 'Apply nasal cannula properly and monitor for effectiveness and patient comfort',
      isRequired: true,
      isCritical: false,
      timeEstimate: 90,
      keyPoints: [
        'Insert nasal prongs gently into nostrils - curve should follow natural nostril shape',
        'Adjust tubing over ears and secure under chin with slide adjustment',
        'Start with 2-4 L/min for mild respiratory distress',
        'Maximum effective flow rate is 6 L/min via nasal cannula',
        'Higher flow rates cause nasal drying and patient discomfort',
        'Monitor for nasal irritation, dryness, or pressure sores',
        'Ensure patient can breathe through nose - mouth breathing reduces effectiveness'
      ],
      safetyNotes: [
        'Nasal cannula ineffective if patient is mouth breathing exclusively',
        'Check for nasal obstruction before application',
        'Consider alternative delivery method if patient has nasal trauma'
      ],
      equipmentNeeded: ['Nasal cannula', 'Oxygen tubing', 'Humidification if available']
    },
    {
      id: 'ot_5',
      stepNumber: 5,
      title: 'Non-rebreather mask application and management',
      description: 'Apply non-rebreather mask for high-concentration oxygen delivery',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Pre-fill reservoir bag with oxygen before applying to patient',
        'Ensure reservoir bag remains at least 1/3 full during inspiration',
        'Minimum flow rate 10 L/min - typically use 12-15 L/min',
        'Check that one-way valves are present and functioning',
        'Ensure tight seal around nose and mouth without over-tightening',
        'Monitor for claustrophobia or anxiety with mask application',
        'Reservoir bag should not completely collapse during inspiration'
      ],
      contraindications: [
        'Vomiting patients - high aspiration risk with tight-fitting mask',
        'Unconscious patients without airway protection',
        'Severe facial trauma preventing proper mask seal'
      ],
      safetyNotes: [
        'Be prepared to quickly remove mask if patient vomits',
        'Monitor continuously for changes in respiratory status',
        'Have suction readily available when using face masks'
      ],
      equipmentNeeded: ['Non-rebreather mask with reservoir bag', 'High-flow oxygen source', 'Suction equipment']
    },
    {
      id: 'ot_6',
      stepNumber: 6,
      title: 'Oxygen saturation targeting and titration',
      description: 'Titrate oxygen delivery to achieve appropriate saturation targets based on patient condition',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Normal adults: target SpO2 94-98%',
        'COPD patients: target SpO2 88-92% to avoid CO2 retention',
        'Pregnant patients: target SpO2 >95% to ensure fetal oxygenation',
        'Increase oxygen delivery if SpO2 <90% or patient shows signs of hypoxia',
        'Titrate down gradually once target saturation achieved',
        'Reassess every 5-10 minutes and adjust as needed',
        'Document initial and ongoing saturation readings with interventions'
      ],
      safetyNotes: [
        'Avoid hyperoxemia (>98%) except in specific conditions like CO poisoning',
        'Monitor for signs of oxygen toxicity with prolonged high-flow oxygen',
        'Be cautious with oxygen in premature infants - risk of retinopathy'
      ],
      equipmentNeeded: ['Continuous pulse oximetry monitoring', 'Flow rate adjustment capabilities']
    },
    {
      id: 'ot_7',
      stepNumber: 7,
      title: 'Patient response monitoring and assessment',
      description: 'Monitor patient clinical response to oxygen therapy and adjust treatment accordingly',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor respiratory rate and effort - should improve with adequate oxygenation',
        'Assess changes in mental status - confusion may improve with oxygen',
        'Watch for changes in skin color - cyanosis should resolve',
        'Monitor vital signs: heart rate often decreases with improved oxygenation',
        'Reassess breath sounds for improvement or deterioration',
        'Look for signs of respiratory fatigue despite oxygen therapy',
        'Document patient response and any changes in treatment plan'
      ],
      safetyNotes: [
        'Worsening respiratory status despite oxygen may indicate need for advanced airway',
        'Be alert for pneumothorax in patients with COPD on high-flow oxygen',
        'Monitor for CO2 retention in COPD patients (drowsiness, confusion)'
      ],
      equipmentNeeded: ['Vital signs monitoring equipment', 'Stethoscope', 'Documentation materials']
    },
    {
      id: 'ot_8',
      stepNumber: 8,
      title: 'Equipment maintenance and safety monitoring',
      description: 'Ensure oxygen equipment safety and proper function throughout transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Check oxygen tank pressure regularly - ensure adequate supply',
        'Monitor for kinks or disconnections in oxygen tubing',
        'Ensure all connections are secure and leak-free',
        'Keep oxygen equipment away from heat sources and electrical equipment',
        'Have backup oxygen supply available for transport',
        'Monitor humidification system if in use',
        'Document oxygen flow rates and equipment used'
      ],
      safetyNotes: [
        'Oxygen supports combustion - maintain fire safety precautions',
        'Secure oxygen tanks properly to prevent injury if they fall',
        'Never use oil or grease on oxygen equipment - fire/explosion risk'
      ],
      equipmentNeeded: ['Backup oxygen supply', 'Oxygen wrench for connections', 'Equipment securing devices']
    }
  ],

  // BLOOD GLUCOSE ASSESSMENT AND MANAGEMENT
  'blood-glucose-assessment': [
    {
      id: 'bg_1',
      stepNumber: 1,
      title: 'Patient assessment and clinical indication determination',
      description: 'Evaluate patient presentation for indications requiring blood glucose assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Assess for altered mental status, confusion, or behavioral changes',
        'Look for signs of hypoglycemia: diaphoresis, tremors, tachycardia, weakness',
        'Check for hyperglycemia signs: polyuria, polydipsia, fruity breath odor',
        'Obtain diabetes history: medications, last meal, recent illness',
        'Evaluate for stroke-like symptoms that may be glucose-related',
        'Consider glucose assessment in seizure, syncope, or intoxication presentations',
        'Priority assessment in pediatric patients with altered mental status'
      ],
      safetyNotes: [
        'Do not delay glucose assessment in altered mental status patients',
        'Hypoglycemia requires more urgent treatment than hyperglycemia',
        'Consider other causes of altered mental status simultaneously'
      ],
      equipmentNeeded: ['Glucometer', 'Test strips', 'Lancets', 'Alcohol swabs', 'Gauze pads']
    },
    {
      id: 'bg_2',
      stepNumber: 2,
      title: 'Glucometer preparation and calibration verification',
      description: 'Prepare glucometer equipment and ensure accurate measurement capability',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Use test strips specifically recommended by glucometer manufacturer',
        'Check test strip expiration date - discard if expired',
        'Verify glucometer calibration matches current test strip lot number',
        'Ensure glucometer temperature is within recommended range',
        'Check battery level and functionality of device',
        'Have backup glucometer available if primary device fails',
        'Avoid opening test strip container unnecessarily to prevent contamination'
      ],
      contraindications: [
        'Do not use alternative brand test strips with glucometer',
        'Avoid using test strips exposed to extreme temperatures',
        'Do not use glucometer outside manufacturer temperature specifications'
      ],
      safetyNotes: [
        'Contaminated test strips can cause falsely elevated readings',
        'Poor calibration leads to inaccurate clinical decisions',
        'Document any equipment issues affecting accuracy'
      ],
      equipmentNeeded: ['Calibrated glucometer', 'Appropriate test strips', 'Control solution if available']
    },
    {
      id: 'bg_3',
      stepNumber: 3,
      title: 'Sample site preparation and collection technique',
      description: 'Prepare sampling site and obtain blood sample using proper sterile technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Select finger tip site - lateral aspects of fingertips preferred',
        'Clean site with alcohol swab and allow to air dry completely',
        'Wipe area dry with sterile gauze to remove residual alcohol',
        'Use lancet to puncture skin with quick, firm motion',
        'Wipe away first drop of blood with gauze pad',
        'Gently squeeze to obtain second drop for most accurate reading',
        'Apply adequate blood sample size as specified by glucometer'
      ],
      safetyNotes: [
        'First blood drop may be contaminated - always discard it',
        'Residual alcohol can dilute sample and cause false low readings',
        'Insufficient sample size leads to error messages and delays'
      ],
      equipmentNeeded: ['Lancets', 'Alcohol swabs', 'Sterile gauze pads', 'Gloves']
    },
    {
      id: 'bg_4',
      stepNumber: 4,
      title: 'Blood glucose measurement and result interpretation',
      description: 'Perform glucose measurement and interpret results in clinical context',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Apply blood sample to test strip as directed by manufacturer',
        'Wait for glucometer to display result - do not move during analysis',
        'NORMAL RANGE: 70-140 mg/dL (3.9-7.8 mmol/L)',
        'HYPOGLYCEMIA: <60-70 mg/dL (<3.3-3.9 mmol/L) - immediate treatment needed',
        'HYPERGLYCEMIA: >180 mg/dL (>10 mmol/L) - requires assessment and treatment',
        'CRITICAL LOW: <40 mg/dL (<2.2 mmol/L) - life-threatening emergency',
        'Document time of measurement and result accurately'
      ],
      safetyNotes: [
        'Correlate glucose reading with clinical presentation',
        'Be aware of conditions that may cause false readings',
        'Consider repeat measurement if result inconsistent with symptoms'
      ],
      equipmentNeeded: ['Functioning glucometer', 'Documentation materials']
    },
    {
      id: 'bg_5',
      stepNumber: 5,
      title: 'Hypoglycemia treatment - conscious patients',
      description: 'Administer appropriate treatment for conscious hypoglycemic patients',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'ORAL GLUCOSE preferred for conscious patients with intact gag reflex',
        'Adult dose: 15-20 grams oral glucose (1-2 tubes of glucose gel)',
        'Pediatric dose: 0.5-1 g/kg (maximum 20 grams)',
        'Ensure patient can swallow safely before oral administration',
        'Monitor airway continuously during oral glucose administration',
        'Reassess blood glucose in 10-15 minutes after treatment',
        'Repeat oral glucose if glucose remains <70 mg/dL and patient conscious'
      ],
      contraindications: [
        'Do not give oral glucose to unconscious or vomiting patients',
        'Avoid in patients with impaired swallowing or gag reflex',
        'Do not delay IV treatment in severely hypoglycemic conscious patients'
      ],
      safetyNotes: [
        'Monitor for aspiration risk during oral glucose administration',
        'Be prepared to provide airway management if consciousness decreases',
        'Have IV dextrose ready as backup treatment option'
      ],
      equipmentNeeded: ['Oral glucose gel or tablets', 'Water if using tablets', 'Airway management equipment']
    },
    {
      id: 'bg_6',
      stepNumber: 6,
      title: 'Hypoglycemia treatment - unconscious patients',
      description: 'Provide IV dextrose or glucagon for unconscious hypoglycemic patients',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'IV DEXTROSE preferred route for unconscious patients with IV access',
        'Adult dose: 25 grams D50 (50 mL of 50% dextrose) IV push',
        'Pediatric dose: 0.5-1 g/kg of D10 or D25 (avoid D50 in children)',
        'Administer slowly over 2-3 minutes to prevent tissue necrosis if IV infiltrates',
        'GLUCAGON alternative if no IV access: 1 mg IM/intranasal (adults)',
        'Pediatric glucagon: 0.5 mg if <20 kg, 1 mg if >20 kg',
        'Reassess blood glucose in 10-15 minutes post-treatment'
      ],
      safetyNotes: [
        'Ensure IV patency before dextrose administration - can cause tissue necrosis',
        'Glucagon may cause nausea and vomiting - protect airway',
        'Be prepared for delayed response with glucagon (10-20 minutes)'
      ],
      equipmentNeeded: ['IV access supplies', 'D50/D25/D10 dextrose', 'Glucagon emergency kit', 'Airway management equipment']
    },
    {
      id: 'bg_7',
      stepNumber: 7,
      title: 'Hyperglycemia assessment and management',
      description: 'Evaluate and manage patients with elevated blood glucose levels',
      isRequired: true,
      isCritical: false,
      timeEstimate: 300,
      keyPoints: [
        'Assess for diabetic ketoacidosis (DKA): fruity breath, Kussmaul respirations',
        'Look for hyperosmolar syndrome signs: severe dehydration, altered mental status',
        'Evaluate fluid status and signs of dehydration',
        'Initiate IV normal saline for dehydration if protocols allow',
        'Monitor for cardiac arrhythmias due to electrolyte imbalances',
        'Assess for precipitating factors: infection, medication non-compliance',
        'Document blood glucose trends and clinical response to treatment'
      ],
      safetyNotes: [
        'Hyperglycemia management is primarily supportive in prehospital setting',
        'Rapid glucose correction can cause cerebral edema',
        'Focus on airway management and fluid resuscitation per protocols'
      ],
      equipmentNeeded: ['IV supplies', 'Normal saline', 'Cardiac monitoring equipment']
    },
    {
      id: 'bg_8',
      stepNumber: 8,
      title: 'Post-treatment monitoring and transport decisions',
      description: 'Monitor patient response to treatment and determine appropriate transport decisions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 600,
      keyPoints: [
        'Reassess blood glucose 10-15 minutes after any treatment intervention',
        'Monitor for return of normal mental status and neurological function',
        'TRANSPORT REQUIRED if: seizure occurred, glucose remains <80 mg/dL, altered mental status persists',
        'Consider treat-and-release if: glucose >80 mg/dL, normal mental status, reliable patient',
        'Ensure patient has plan for immediate food intake if released',
        'Document complete assessment, treatment, and patient response',
        'Provide patient education about glucose monitoring and medication compliance'
      ],
      contraindications: [
        'Do not release patients who had seizures during hypoglycemic episode',
        'Avoid treat-and-release in patients with persistent altered mental status',
        'Do not release if no reliable support person available'
      ],
      safetyNotes: [
        'Hypoglycemia can recur after initial treatment response',
        'Continuous glucose monitoring devices may provide additional data',
        'Follow local protocols for treat-and-release criteria'
      ],
      equipmentNeeded: ['Continuous monitoring equipment', 'Documentation forms', 'Patient education materials']
    }
  ],
  
  // 1. DIFFICULT BAG-VALVE-MASK VENTILATION PREDICTION - Evidence-based airway assessment
  'prediction-of-difficult-bag-valve-mask-ventilations': [
    {
      id: 'bvm-pred-step-1',
      stepNumber: 1,
      title: 'Initial Patient Assessment and Positioning',
      description: 'Perform comprehensive initial assessment and optimal patient positioning for BVM evaluation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Ensure scene safety and approach patient with appropriate PPE',
        'Assess level of consciousness and cooperation ability',
        'Position patient supine with head in neutral or sniffing position',
        'Evaluate overall clinical status and stability',
        'Check for any obvious airway obstruction or distress',
        'Prepare BVM equipment and oxygen source',
        'Have suction equipment immediately available and functioning',
        'Position yourself at patient\'s head for optimal visualization and access'
      ],
      contraindications: [
        'Do not position unconscious patients upright',
        'Avoid cervical manipulation if spinal injury suspected',
        'Do not proceed if patient is combative without proper restraint'
      ],
      safetyNotes: [
        'Maintain universal precautions throughout assessment',
        'Be prepared for rapid airway deterioration',
        'Have backup airway equipment readily available'
      ]
    },
    {
      id: 'bvm-pred-step-2',
      stepNumber: 2,
      title: 'B - Beard and Facial Seal Assessment',
      description: 'Evaluate facial characteristics that may compromise mask seal using BOOTS criteria',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess for thick beard that prevents effective mask seal',
        'Check for facial hair patterns and density around mouth and nose',
        'Evaluate facial trauma, burns, or anatomical deformities',
        'Look for facial jewelry that could interfere with mask placement',
        'Check for vomit, blood, or secretions around mouth and nose',
        'Consider beard trimming if time and situation permits',
        'Plan for alternative airway techniques if seal compromise expected',
        'Document findings for communication with receiving team'
      ],
      safetyNotes: [
        'Poor mask seal is a major predictor of BVM difficulty',
        'Have advanced airway equipment ready if seal problems identified',
        'Consider two-person BVM technique early if seal issues present'
      ]
    },
    {
      id: 'bvm-pred-step-3',
      stepNumber: 3,
      title: 'O - Obesity and Body Habitus Assessment',
      description: 'Evaluate patient obesity and body habitus factors affecting ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess body mass index estimation and overall body habitus',
        'Evaluate chest wall compliance and ability for expansion',
        'Check neck circumference and redundant soft tissue',
        'Assess ability to extend neck and achieve proper head positioning',
        'Identify pharyngeal and tongue size relative to oral cavity',
        'Consider elevated head positioning (reverse Trendelenburg) if possible',
        'Plan for higher ventilation pressures that may be required',
        'Prepare for potential two-person BVM technique need'
      ],
      safetyNotes: [
        'Obese patients have reduced functional residual capacity',
        'Higher PEEP may be needed to maintain oxygenation',
        'Prepare for rapid desaturation during apneic periods'
      ]
    },
    {
      id: 'bvm-pred-step-4',
      stepNumber: 4,
      title: 'O - Older Age Assessment (>55 years)',
      description: 'Assess age-related anatomical and physiological factors',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Evaluate patient age and age-related changes (>55 years higher risk)',
        'Assess neck range of motion and cervical spine flexibility',
        'Check temporomandibular joint mobility and mouth opening',
        'Evaluate soft tissue elasticity and muscle tone',
        'Look for age-related dental changes and tooth loss',
        'Assess for arthritis or other conditions limiting positioning',
        'Consider decreased lung compliance and respiratory reserve',
        'Document age-related risk factors for airway difficulty'
      ],
      safetyNotes: [
        'Elderly patients may have reduced physiological reserve',
        'Age-related changes increase airway management complexity',
        'Consider earlier advanced airway intervention in elderly patients'
      ]
    },
    {
      id: 'bvm-pred-step-5',
      stepNumber: 5,
      title: 'T - Toothless and Dental Assessment',
      description: 'Evaluate dental status and facial architecture impact on mask seal',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess for missing teeth, particularly anterior teeth',
        'Evaluate denture presence, fit, and stability',
        'Check for loose teeth that could become dislodged',
        'Assess facial architecture changes due to tooth loss',
        'Consider whether to leave well-fitting dentures in place',
        'Plan for modified mask hold techniques if needed',
        'Evaluate potential for tissue collapse around mouth',
        'Prepare gauze to improve mask seal if necessary'
      ],
      contraindications: [
        'Do not leave loose or ill-fitting dentures in place',
        'Remove partial dentures that could dislodge',
        'Avoid applying excessive pressure on loose teeth'
      ],
      safetyNotes: [
        'Tooth loss can significantly affect mask seal',
        'Well-fitting dentures may improve ventilation effectiveness',
        'Be prepared to manage loose teeth or dental trauma'
      ]
    },
    {
      id: 'bvm-pred-step-6',
      stepNumber: 6,
      title: 'S - Sleep Apnea and Obstruction History',
      description: 'Assess for sleep apnea history and upper airway obstruction risk',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Ask patient or family about sleep apnea diagnosis and CPAP use',
        'Assess for snoring history and witnessed apneas',
        'Evaluate for signs of chronic upper airway obstruction',
        'Check tongue size and pharyngeal space (Mallampati assessment)',
        'Look for enlarged tonsils, adenoids, or other obstructive lesions',
        'Assess neck circumference as sleep apnea risk factor',
        'Consider high risk for difficult BVM ventilation',
        'Plan for early advanced airway consideration'
      ],
      safetyNotes: [
        'Sleep apnea patients have higher difficult airway risk',
        'Upper airway obstruction may worsen with unconsciousness',
        'Consider alternative airway techniques early'
      ]
    },
    {
      id: 'bvm-pred-step-7',
      stepNumber: 7,
      title: 'Risk Stratification and Alternative Planning',
      description: 'Synthesize assessment findings and develop airway management strategy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Score BOOTS criteria: 0-1 factors = low risk, 2-3 = moderate, 4+ = high risk',
        'Consider additional factors: trauma, airway pathology, positioning limitations',
        'Develop primary airway management plan based on risk assessment',
        'Prepare alternative airway techniques and equipment',
        'Consider two-person BVM technique for moderate-high risk patients',
        'Plan for supraglottic airway or endotracheal intubation if BVM ineffective',
        'Communicate findings and plan with team members',
        'Document assessment and rationale for airway approach'
      ],
      safetyNotes: [
        'Never attempt BVM without backup airway plan',
        'High-risk patients may require immediate advanced airway',
        'Early recognition of difficult BVM prevents patient deterioration'
      ]
    },
    {
      id: 'bvm-pred-step-8',
      stepNumber: 8,
      title: 'Implementation and Continuous Assessment',
      description: 'Execute airway plan with continuous reassessment and adjustment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Implement chosen BVM technique with appropriate modifications',
        'Monitor chest rise, oxygen saturation, and ETCO2 if available',
        'Assess effectiveness of ventilation continuously',
        'Be prepared to rapidly transition to alternative techniques',
        'Use two-person technique if one-person BVM ineffective',
        'Consider oral/nasal airways to improve ventilation',
        'Escalate to advanced airway if BVM remains inadequate',
        'Document ventilation effectiveness and any technique changes'
      ],
      safetyNotes: [
        'Inadequate BVM ventilation can be rapidly fatal',
        'Do not persist with ineffective techniques',
        'Early escalation to advanced airway may be life-saving'
      ]
    }
  ],
  
  // 2. ADULT CPR WITH MANUAL DEFIBRILLATOR - Updated 2024 AHA Guidelines
  'adult-cpr-defibrillator': [
    {
      id: 'cpr-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Initial Assessment',
      description: 'Ensure scene safety and rapidly assess patient responsiveness and breathing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Approach safely - look for hazards (electrical, traffic, violence, hazardous materials)',
        'Don appropriate PPE (gloves, mask, eye protection) before patient contact',
        'Tap patient\'s shoulders firmly while shouting "Are you okay?" or "Can you hear me?"',
        'Simultaneously assess for normal breathing (look for chest rise and fall)',
        'Check carotid pulse for maximum 10 seconds (healthcare providers only)',
        'Look for signs of life: movement, coughing, or normal breathing',
        'Call for help immediately if patient unresponsive and not breathing normally',
        'Request defibrillator/AED and advanced life support equipment'
      ],
      contraindications: [
        'Do not enter unsafe scene with active hazards',
        'Do not attempt resuscitation in obviously deceased patients (rigor mortis, decomposition)',
        'Do not start CPR if valid DNR order is present and verified'
      ],
      safetyNotes: [
        'Scene safety is paramount - never compromise provider safety',
        'If in doubt about pulse presence, start CPR immediately',
        'Early activation of emergency response improves survival outcomes'
      ]
    },
    {
      id: 'cpr-step-2',
      stepNumber: 2,
      title: 'Patient Positioning and Airway Opening',
      description: 'Position patient optimally and establish patent airway for resuscitation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Place patient supine on firm, flat surface (floor or backboard)',
        'Position patient\'s arms at sides to allow full chest access',
        'Open airway using head-tilt chin-lift (or jaw thrust if trauma suspected)',
        'Look in mouth and remove visible foreign objects with finger sweep',
        'Expose chest completely for proper CPR hand placement and defibrillation',
        'Position yourself at patient\'s side for optimal compression angle',
        'Ensure adequate space around patient for team resuscitation efforts',
        'Have suction equipment immediately available for airway management'
      ],
      equipmentNeeded: [
        'Rigid backboard or firm surface',
        'Defibrillator/AED with pads',
        'Bag-valve-mask with reservoir',
        'High-flow oxygen source',
        'Suction device with Yankauer catheter'
      ],
      safetyNotes: [
        'Firm surface is essential for effective chest compressions',
        'Avoid moving patient unnecessarily once positioned',
        'Clear airway only of visible obstructions - avoid blind finger sweeps'
      ]
    },
    {
      id: 'cpr-step-3',
      stepNumber: 3,
      title: 'High-Quality Chest Compressions',
      description: 'Deliver effective chest compressions following current AHA guidelines',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Place heel of one hand on lower half of breastbone, between nipples',
        'Place other hand on top, interlacing fingers and keeping fingers off ribs',
        'Position shoulders directly over hands with arms straight and locked',
        'Compress hard and fast: at least 2 inches (5cm) deep but not exceeding 2.4 inches (6cm)',
        'Allow complete chest recoil between compressions without lifting hands',
        'Compress at rate of 100-120 per minute with minimal interruptions',
        'Count compressions aloud to maintain rhythm and communicate with team',
        'Minimize compression interruptions to less than 10 seconds'
      ],
      safetyNotes: [
        'Avoid leaning on chest between compressions - impedes venous return',
        'Switch compressors every 2 minutes to prevent fatigue and maintain quality',
        'Monitor compression depth and rate continuously using feedback devices if available'
      ]
    },
    {
      id: 'cpr-step-4',
      stepNumber: 4,
      title: 'Rescue Ventilation and Oxygenation',
      description: 'Provide effective ventilation while maintaining circulation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 20,
      keyPoints: [
        'After 30 compressions, open airway with head-tilt chin-lift technique',
        'Create effective mask seal using C-E grip (thumb and index form C, other fingers E)',
        'Deliver 2 breaths, each lasting 1 second with visible chest rise',
        'Use bag-valve-mask with high-flow oxygen (15L/min) and reservoir bag',
        'Allow complete passive exhalation between breaths',
        'Avoid excessive ventilation rate and volume (causes harmful effects)',
        'Resume chest compressions immediately after 2 breaths',
        'Consider advanced airway if multiple providers available and trained'
      ],
      contraindications: [
        'Do not hyperventilate - causes decreased venous return and cardiac output',
        'Avoid mouth-to-mouth ventilation without barrier protection',
        'Do not delay compressions for prolonged ventilation attempts'
      ],
      safetyNotes: [
        'Gastric insufflation increases aspiration risk',
        'Advanced airway allows continuous compressions with asynchronous ventilation',
        'Excessive ventilation is harmful and decreases survival rates'
      ]
    },
    {
      id: 'cpr-step-5',
      stepNumber: 5,
      title: 'Defibrillation and Rhythm Analysis',
      description: 'Rapidly analyze cardiac rhythm and deliver defibrillation when indicated',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Apply defibrillator pads quickly during ongoing CPR: right upper chest, left lower chest',
        'Ensure pads do not touch each other and have good skin contact',
        'Continue chest compressions while defibrillator analyzes rhythm',
        'Clear all personnel from patient contact: "Everyone clear - analyzing rhythm"',
        'Identify shockable rhythms: ventricular fibrillation (VF) or pulseless ventricular tachycardia (VT)',
        'Charge defibrillator to appropriate energy: biphasic 120-200J initial, 150-360J subsequent',
        'Ensure complete clearing before shock: "Everyone clear - shocking"',
        'Deliver shock immediately when charged, resume CPR for 2 minutes'
      ],
      safetyNotes: [
        'Remove oxygen delivery devices during defibrillation to prevent fire hazard',
        'Check for medication patches or implanted devices - remove patches if present',
        'Ensure no team member is in contact with patient or stretcher during shock delivery'
      ]
    },
    {
      id: 'cpr-step-6',
      stepNumber: 6,
      title: 'Advanced Cardiac Life Support and Medications',
      description: 'Implement advanced interventions including medications and airway management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Establish IV or IO access during ongoing CPR for medication administration',
        'Administer epinephrine 1mg IV/IO every 3-5 minutes for all cardiac arrest rhythms',
        'For persistent VF/VT: give amiodarone 300mg IV/IO after first unsuccessful shock',
        'Consider advanced airway: supraglottic device or endotracheal intubation',
        'With advanced airway: provide continuous compressions and 10 ventilations per minute',
        'Treat reversible causes (H\'s and T\'s): hypovolemia, hypoxia, hydrogen ions, hyper/hypokalemia, hypothermia, tension pneumothorax, tamponade, toxins, thrombosis',
        'Consider extracorporeal CPR (ECPR) consultation for refractory arrest in appropriate patients',
        'Maintain team communication and role assignments throughout resuscitation'
      ],
      equipmentNeeded: [
        'IV catheters and IO devices',
        'Normal saline or lactated Ringer\'s',
        'Epinephrine 1:10,000 concentration',
        'Amiodarone 150mg/3mL vials',
        'Advanced airway devices (King LT, LMA, ETT)',
        'End-tidal CO2 monitoring'
      ],
      safetyNotes: [
        'Confirm medication concentrations before administration',
        'Use end-tidal CO2 monitoring to confirm airway placement and assess CPR quality',
        'Consider point-of-care ultrasound to assess cardiac activity if available'
      ]
    },
    {
      id: 'cpr-step-7',
      stepNumber: 7,
      title: 'Return of Spontaneous Circulation Assessment',
      description: 'Recognize ROSC and provide immediate post-cardiac arrest care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Check for signs of ROSC during scheduled rhythm checks: palpable pulse, blood pressure >80mmHg systolic',
        'Look for other ROSC indicators: abrupt increase in ETCO2 >40mmHg, arterial pressure waveform',
        'If ROSC achieved: assess mental status, breathing adequacy, and hemodynamic stability',
        'Obtain 12-lead ECG immediately to identify ST-elevation myocardial infarction',
        'Maintain oxygen saturation 94-98% and avoid hyperoxia',
        'Target systolic blood pressure ≥90mmHg with fluids or vasopressors',
        'Consider targeted temperature management (32-36°C) per protocol',
        'Prepare for transport to cardiac arrest center or PCI-capable facility'
      ],
      safetyNotes: [
        'ROSC patients are at high risk for re-arrest - maintain continuous monitoring',
        'Avoid hyperoxia and hypocapnia which can worsen neurological outcomes',
        'Early cardiac catheterization improves outcomes in STEMI patients'
      ]
    },
    {
      id: 'cpr-step-8',
      stepNumber: 8,
      title: 'Termination Decision and Family Support',
      description: 'Make appropriate decisions regarding resuscitation termination and provide family care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Consider termination of resuscitation per local protocols after adequate trial',
        'Factors supporting termination: unwitnessed arrest, prolonged downtime, no ROSC after 30 minutes',
        'Factors supporting continuation: witnessed arrest, early CPR, shockable rhythm, hypothermia',
        'Consult with medical control physician for termination decision',
        'If terminating: ensure family notification and support services',
        'Document total resuscitation time, interventions performed, and decision rationale',
        'Provide team debriefing for learning and emotional support',
        'Complete required death certification and reporting procedures'
      ],
      contraindications: [
        'Do not terminate resuscitation prematurely in hypothermic patients',
        'Consider extracorporeal support consultation before termination in young patients',
        'Do not terminate in cases of drug overdose without adequate antidote trial'
      ],
      safetyNotes: [
        'Termination decisions should involve medical control when possible',
        'Team emotional support is important after unsuccessful resuscitation',
        'Proper documentation protects providers and facilitates quality improvement'
      ]
    }
  ],

  // 3. INTRAVENOUS CANNULATION - Evidence-based vascular access techniques
  'iv-cannulation': [
    {
      id: 'iv-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Clinical Indication',
      description: 'Assess patient condition and determine clinical need for IV access',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess patient\'s clinical condition and urgency of IV access need',
        'Review indications: medication administration, fluid resuscitation, blood sampling',
        'Check patient allergies: latex, iodine, chlorhexidine, adhesives, medications',
        'Evaluate hydration status and hemodynamic stability',
        'Consider patient age, medical history, and current medications',
        'Identify any bleeding disorders or anticoagulant therapy',
        'Assess patient anxiety level and provide reassurance',
        'Determine appropriate catheter gauge based on intended use'
      ],
      contraindications: [
        'Active cellulitis or infection at proposed insertion site',
        'Arteriovenous fistula or graft in affected extremity',
        'Previous mastectomy with lymph node dissection on affected side',
        'Fracture, injury, or compromised circulation in target extremity'
      ],
      safetyNotes: [
        'Larger gauge (14-16G) needed for trauma resuscitation and blood products',
        'Smaller gauge (20-22G) appropriate for medication administration',
        'Consider patient comfort and cooperation in gauge selection'
      ]
    },
    {
      id: 'iv-step-2',
      stepNumber: 2,
      title: 'Hand Hygiene and Equipment Preparation',
      description: 'Perform thorough hand hygiene and prepare all necessary equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Perform thorough hand hygiene with alcohol-based sanitizer or soap and water',
        'Don clean, non-sterile gloves appropriate for procedure',
        'Gather IV catheter of appropriate gauge (14-22G based on clinical need)',
        'Select appropriate IV fluid: normal saline, lactated Ringer\'s, or prescribed solution',
        'Prepare administration set and prime tubing completely removing all air bubbles',
        'Gather antiseptic (2% chlorhexidine preferred, or 70% alcohol)',
        'Prepare securement materials: transparent dressing, tape, gauze pads',
        'Have tourniquet, sharps container, and flush syringes readily available'
      ],
      equipmentNeeded: [
        'IV catheters (14-22 gauge selection)',
        'IV fluid and administration sets',
        '2% chlorhexidine or 70% alcohol antiseptic',
        'Tourniquet',
        'Clean gloves and PPE',
        'Transparent dressing and medical tape',
        'Normal saline flush syringes'
      ],
      safetyNotes: [
        'Check expiration dates on all equipment before use',
        'Ensure adequate lighting and comfortable positioning',
        'Have backup equipment available in case of failure'
      ]
    },
    {
      id: 'iv-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Vein Assessment',
      description: 'Position patient optimally and perform systematic vein assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position patient comfortably with target extremity well-supported and extended',
        'Ensure adequate lighting and access to insertion site',
        'Apply tourniquet 4-6 inches proximal to intended insertion site',
        'Palpate potential sites: start distally and move proximally',
        'Assess vein characteristics: straight, firm, bouncy, non-rolling',
        'Preferred site order: dorsal hand, forearm, antecubital fossa (avoid if possible)',
        'Avoid areas over joints, areas of flexion, or sites with valve bumps',
        'Consider ultrasound guidance for difficult access patients'
      ],
      contraindications: [
        'Avoid sclerosed, hardened, or infiltrated veins',
        'Do not use veins in areas of skin breakdown or rash',
        'Avoid sites distal to previous infiltration or phlebitis',
        'Do not cannulate through areas of infection or cellulitis'
      ],
      safetyNotes: [
        'Tourniquet should not remain in place longer than 2 minutes',
        'Palpation is more reliable than visual inspection for vein assessment',
        'Consider warming extremity or dependent positioning to enhance venous filling'
      ]
    },
    {
      id: 'iv-step-4',
      stepNumber: 4,
      title: 'Site Preparation and Antisepsis',
      description: 'Prepare insertion site using evidence-based antiseptic technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Clean insertion site with antiseptic using circular motion from center outward',
        'Use 2% chlorhexidine in 70% alcohol (preferred) or 70% alcohol alone',
        'Allow antiseptic to air dry completely (minimum 30 seconds)',
        'Maintain aseptic technique - do not touch cleaned site',
        'If site must be repalpated, reclean with antiseptic',
        'Ensure adequate antiseptic contact time for microbial kill',
        'Position non-dominant hand to stabilize vein without contaminating site',
        'Have catheter ready and inspect for defects before insertion'
      ],
      safetyNotes: [
        'Never skip antiseptic preparation - infection risk is significant',
        'Allow adequate drying time for antiseptic effectiveness',
        'Avoid chlorhexidine in patients with known allergies'
      ]
    },
    {
      id: 'iv-step-5',
      stepNumber: 5,
      title: 'Catheter Insertion Technique',
      description: 'Insert IV catheter using proper evidence-based technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Stabilize vein by applying traction with non-dominant hand',
        'Insert catheter at 15-30 degree angle with bevel facing upward',
        'Advance catheter until flashback of blood appears in catheter hub',
        'Lower catheter angle to 10-15 degrees and advance 1-2mm further',
        'Occlude vein proximally and advance catheter over needle into vein',
        'Remove needle while holding catheter hub stable',
        'Apply pressure proximal to catheter tip to minimize blood loss',
        'Attach IV tubing or saline lock immediately'
      ],
      contraindications: [
        'Never reinsert or advance needle once withdrawn from catheter',
        'Do not force catheter advancement if resistance is encountered',
        'Avoid multiple punctures through same vein'
      ],
      safetyNotes: [
        'Maintain control of needle at all times during procedure',
        'Watch for signs of arterial puncture (bright red, pulsatile blood)',
        'Be prepared to apply pressure for hemostasis if insertion unsuccessful'
      ]
    },
    {
      id: 'iv-step-6',
      stepNumber: 6,
      title: 'Catheter Securement and Patency Confirmation',
      description: 'Secure catheter and confirm proper function and placement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Release tourniquet immediately after successful cannulation',
        'Flush catheter with 3-5ml normal saline to confirm patency',
        'Observe for signs of infiltration: swelling, blanching, coolness, pain',
        'Confirm IV flows freely without resistance or patient discomfort',
        'Apply transparent, semi-permeable dressing over insertion site',
        'Secure IV tubing with tape loops to prevent tension on catheter',
        'Label site with date, time, catheter gauge, and your initials',
        'Dispose of needle in sharps container immediately after use'
      ],
      safetyNotes: [
        'Never force flush if resistance is encountered',
        'Infiltration signs require immediate catheter removal',
        'Proper securement prevents accidental dislodgement and phlebitis'
      ]
    },
    {
      id: 'iv-step-7',
      stepNumber: 7,
      title: 'Flow Rate Setting and Initial Monitoring',
      description: 'Establish appropriate flow rate and perform initial assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Set appropriate flow rate based on clinical indication and patient needs',
        'For maintenance: 20-30 ml/hr keep-vein-open rate if not otherwise specified',
        'For resuscitation: wide open or pressure bag as clinically indicated',
        'Monitor initial patient response to IV therapy',
        'Assess IV site for early signs of complications',
        'Check that IV is functioning properly with good flow',
        'Document procedure: site, gauge, number of attempts, complications',
        'Educate patient about protecting IV site and reporting problems'
      ],
      safetyNotes: [
        'Monitor elderly patients closely for signs of fluid overload',
        'Rapid fluid administration requires careful hemodynamic monitoring',
        'Document any difficulties or complications for quality improvement'
      ]
    },
    {
      id: 'iv-step-8',
      stepNumber: 8,
      title: 'Ongoing Monitoring and Complication Management',
      description: 'Provide continuous monitoring and manage potential complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Monitor IV site regularly for signs of infiltration, phlebitis, or infection',
        'Assess for complications: redness, swelling, warmth, pain, streak formation',
        'Check IV patency before each medication administration',
        'Monitor for systemic complications: fluid overload, electrolyte imbalance',
        'Replace IV if signs of phlebitis or infiltration develop',
        'Educate patient on signs/symptoms to report immediately',
        'Document ongoing assessment findings and interventions',
        'Plan for IV replacement or discontinuation per protocol'
      ],
      contraindications: [
        'Do not ignore signs of phlebitis or infiltration',
        'Never administer medications through a questionably patent IV',
        'Do not continue IV therapy if complications develop'
      ],
      safetyNotes: [
        'Early recognition and management of complications prevents serious injury',
        'Infiltration of vesicant medications can cause tissue necrosis',
        'Regular assessment is essential for patient safety'
      ]
    }
  ],

  // ENDOTRACHEAL INTUBATION - Advanced Airway Management
  'endotracheal-intubation': [
    {
      id: 'ett-step-1',
      stepNumber: 1,
      title: 'Pre-Intubation Assessment',
      description: 'Assess airway and prepare for intubation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess airway anatomy: Mallampati score, neck mobility, mouth opening',
        'Identify difficult airway predictors: LEMON mnemonic',
        'Ensure adequate oxygenation with BVM before attempting',
        'Consider alternative airways if difficult intubation anticipated',
        'Position patient in "sniffing" position (ear to sternal notch)',
        'Have backup plan ready (supraglottic airway, surgical airway)'
      ],
      contraindications: [
        'Suspected cervical spine injury without C-spine immobilization',
        'Severe facial trauma with airway distortion',
        'Complete upper airway obstruction'
      ]
    },
    {
      id: 'ett-step-2',
      stepNumber: 2,
      title: 'Equipment Check and Preparation',
      description: 'Prepare and test all intubation equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Check laryngoscope blade and light (bright white light)',
        'Select appropriate ETT size (7.5-8.0mm for average adult)',
        'Test ETT cuff for leaks, lubricate tip with water-based lubricant',
        'Prepare stylet (if using) - tip should not extend beyond ETT',
        'Have suction ready and functioning',
        'Prepare waveform capnography and colorimetric CO2 detector',
        'Ensure bag-valve-mask ventilation is available'
      ],
      equipmentNeeded: [
        'Laryngoscope handle and blades (Mac 3-4, Miller 2-3)',
        'Endotracheal tubes (6.0-8.5mm)',
        'Stylet and lubricant',
        'Suction device',
        'BVM and oxygen',
        'Capnography equipment',
        'Backup airway devices'
      ]
    },
    {
      id: 'ett-step-3',
      stepNumber: 3,
      title: 'Pre-oxygenation',
      description: 'Maximize oxygen reserves before intubation attempt',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Provide 100% oxygen via BVM for 3-5 minutes minimum',
        'Achieve oxygen saturation >95% if possible',
        'Use positive end-expiratory pressure (PEEP) if available',
        'Continue ventilation until ready to visualize larynx',
        'Consider apneic oxygenation during intubation attempt',
        'Monitor patient\'s color and oxygen saturation continuously'
      ],
      safetyNotes: [
        'Never attempt intubation on an inadequately oxygenated patient',
        'Limit intubation attempts to 30 seconds maximum',
        'Return to BVM ventilation if saturation drops'
      ]
    },
    {
      id: 'ett-step-4',
      stepNumber: 4,
      title: 'Laryngoscopy and Visualization',
      description: 'Visualize vocal cords using direct laryngoscopy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Insert laryngoscope blade on right side of mouth',
        'Sweep tongue to left while advancing blade',
        'Lift laryngoscope handle up and away (don\'t rock on teeth)',
        'Identify epiglottis and advance blade to appropriate position',
        'Apply external laryngeal manipulation (BURP) if needed',
        'Visualize vocal cords - should see white triangular opening',
        'Use suction to clear secretions if view obscured'
      ],
      safetyNotes: [
        'Do not use teeth as fulcrum point',
        'Limit visualization attempt to 30 seconds',
        'If poor view, reposition patient or try different blade'
      ]
    },
    {
      id: 'ett-step-5',
      stepNumber: 5,
      title: 'ETT Insertion and Cuff Inflation',
      description: 'Insert endotracheal tube and secure airway',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Pass ETT through vocal cords until cuff disappears (2-3cm)',
        'Watch ETT pass through cords - do not lose visualization',
        'Remove stylet carefully while holding ETT steady',
        'Inflate cuff with 5-10ml air until seal achieved',
        'Note depth marking at teeth/lips (typically 21-23cm)',
        'Remove laryngoscope blade carefully'
      ],
      safetyNotes: [
        'Stop advancing if resistance met',
        'Do not overinflate cuff - use minimal occluding volume',
        'Maintain ETT position throughout procedure'
      ]
    },
    {
      id: 'ett-step-6',
      stepNumber: 6,
      title: 'Confirmation of Placement',
      description: 'Confirm proper endotracheal tube placement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Attach BVM and ventilate - observe bilateral chest rise',
        'Auscultate 5 points: epigastrium first (should be silent)',
        'Listen to bilateral lung fields - equal breath sounds',
        'Attach colorimetric CO2 detector - should turn yellow',
        'Connect waveform capnography - continuous square waves',
        'Confirm ETT depth marking and secure with commercial device',
        'Recheck placement after any patient movement'
      ],
      safetyNotes: [
        'If any doubt about placement - remove ETT immediately',
        'Multiple confirmation methods required',
        'Esophageal intubation can be rapidly fatal'
      ]
    },
    {
      id: 'ett-step-7',
      stepNumber: 7,
      title: 'Post-Intubation Care',
      description: 'Provide ongoing airway management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Set appropriate ventilator settings or manual ventilation rate',
        'Target normal oxygen saturation for patient population',
        'Monitor continuous waveform capnography (ETCO2 35-45mmHg)',
        'Regularly reassess tube placement and depth',
        'Protect against aspiration with proper positioning',
        'Consider sedation/paralysis for transport if indicated',
        'Document intubation details and ongoing assessment'
      ],
      safetyNotes: [
        'Avoid hyperventilation - can be harmful',
        'Monitor for dislodgement during transport',
        'Have backup airway plan ready at all times'
      ]
    }
  ],

  // 12-LEAD ECG ACQUISITION - Diagnostic Excellence
  '12-lead-ecg': [
    {
      id: 'ecg-step-1',
      stepNumber: 1,
      title: 'Patient Preparation and Consent',
      description: 'Prepare patient for 12-lead ECG acquisition',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Explain procedure to patient and obtain consent',
        'Ensure patient privacy and proper draping',
        'Position patient supine with arms relaxed at sides',
        'Expose chest completely - remove clothing/jewelry as needed',
        'Ask patient to remain still and avoid talking during acquisition',
        'Check for pacemaker or implanted devices'
      ],
      safetyNotes: [
        'Respect patient modesty and dignity',
        'Be aware of pacemaker/ICD presence for interpretation',
        'Ensure patient is warm to prevent shivering artifact'
      ]
    },
    {
      id: 'ecg-step-2',
      stepNumber: 2,
      title: 'Skin Preparation',
      description: 'Prepare skin for optimal electrode contact',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Clean electrode sites with alcohol if visibly dirty',
        'Dry skin thoroughly if moist from perspiration',
        'Clip excessive hair at electrode sites (do not shave)',
        'Gently abrade skin with gauze or electrode preparation pad',
        'Remove any lotions, oils, or residue from skin',
        'Allow alcohol to dry completely before electrode placement'
      ],
      safetyNotes: [
        'Never shave hair - risk of nicks and poor electrode contact',
        'Be gentle with skin preparation to avoid irritation',
        'Ensure electrodes will adhere well to prepared skin'
      ]
    },
    {
      id: 'ecg-step-3',
      stepNumber: 3,
      title: 'Limb Lead Placement',
      description: 'Place limb electrodes in correct anatomical positions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Right arm (RA/white): right wrist or lateral right shoulder',
        'Left arm (LA/black): left wrist or lateral left shoulder',
        'Right leg (RL/green): right ankle or lower right abdomen',
        'Left leg (LL/red): left ankle or lower left abdomen',
        'Place electrodes on flat, fleshy areas avoiding bone',
        'Ensure equal limb positioning for accurate amplitude'
      ],
      equipmentNeeded: [
        '12-lead ECG machine',
        'Electrodes (10 total)',
        'Alcohol wipes',
        'Gauze pads',
        'Clipper (if needed)'
      ]
    },
    {
      id: 'ecg-step-4',
      stepNumber: 4,
      title: 'Precordial Lead Placement',
      description: 'Place chest electrodes in precise anatomical positions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'V1 (red): 4th intercostal space, right sternal border',
        'V2 (yellow): 4th intercostal space, left sternal border',
        'V3 (green): midway between V2 and V4',
        'V4 (brown): 5th intercostal space, left midclavicular line',
        'V5 (black): same horizontal level as V4, left anterior axillary line',
        'V6 (purple): same horizontal level as V4 and V5, left midaxillary line',
        'Palpate landmarks carefully for accurate placement'
      ],
      safetyNotes: [
        'Accurate lead placement is critical for diagnostic quality',
        'In women, place V3-V6 under breast tissue, not on breast',
        'Double-check placement before acquisition'
      ]
    },
    {
      id: 'ecg-step-5',
      stepNumber: 5,
      title: 'ECG Acquisition',
      description: 'Acquire high-quality 12-lead ECG tracing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Verify all leads are connected and display good signals',
        'Check for 60Hz interference, muscle artifact, or baseline wander',
        'Ensure calibration is set to standard (10mm/mV, 25mm/s)',
        'Instruct patient to lie still and breathe normally',
        'Acquire ECG when patient is relaxed and quiet',
        'Print or save tracing with patient information'
      ],
      safetyNotes: [
        'Repeat acquisition if significant artifact present',
        'Ensure proper calibration for accurate interpretation',
        'Document any artifacts or patient factors affecting quality'
      ]
    },
    {
      id: 'ecg-step-6',
      stepNumber: 6,
      title: 'Quality Assessment and Documentation',
      description: 'Evaluate ECG quality and document findings',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Check all 12 leads for adequate amplitude and clarity',
        'Verify proper calibration and timing marks',
        'Ensure patient identification is correct on tracing',
        'Note acquisition time and clinical indication',
        'Perform systematic interpretation if trained',
        'Compare with previous ECGs if available',
        'Clean equipment and dispose of electrodes properly'
      ],
      safetyNotes: [
        'Document any technical issues or repeat attempts',
        'Ensure timely transmission to receiving facility if indicated',
        'Never delay treatment while obtaining ECG unless stable'
      ]
    }
  ],

  // 4. BLOOD GLUCOSE TESTING - Evidence-based point-of-care diagnostics
  'blood-glucose-testing': [
    {
      id: 'glucose-step-1',
      stepNumber: 1,
      title: 'Clinical Assessment and Indication Review',
      description: 'Assess patient for glucose testing indications and clinical presentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess patient for altered mental status, confusion, or decreased consciousness',
        'Look for signs of hypoglycemia: diaphoresis, tachycardia, tremor, irritability',
        'Identify hyperglycemia signs: polyuria, polydipsia, fruity breath odor, dehydration',
        'Review patient history: diabetes diagnosis, medications, recent food intake',
        'Check for diabetes medications: insulin, metformin, sulfonylureas',
        'Assess timing of last meal and recent activity level',
        'Consider other causes of altered mental status requiring glucose rule-out',
        'Document clinical indication for glucose testing'
      ],
      contraindications: [
        'No absolute contraindications for glucose testing',
        'Relative caution in patients with bleeding disorders',
        'Consider alternate sites in patients with poor peripheral circulation'
      ],
      safetyNotes: [
        'Glucose testing is essential in any patient with altered mental status',
        'Clinical presentation may not always correlate with glucose levels',
        'Both hypoglycemia and hyperglycemia can present with similar symptoms'
      ]
    },
    {
      id: 'glucose-step-2',
      stepNumber: 2,
      title: 'Equipment Selection and Quality Control',
      description: 'Select appropriate equipment and perform quality control checks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Select calibrated glucometer appropriate for clinical setting',
        'Verify glucometer displays correct date, time, and units (mg/dL or mmol/L)',
        'Check test strip expiration date and storage conditions',
        'Ensure test strips have been stored in original container with desiccant',
        'Verify lancet device is functioning and loaded with sterile lancet',
        'Check control solution expiration and perform quality control if required',
        'Ensure all equipment is at room temperature before use',
        'Have backup equipment available in case of failure'
      ],
      equipmentNeeded: [
        'Calibrated blood glucose meter',
        'Compatible test strips (not expired)',
        'Lancet device with sterile lancets',
        '70% isopropyl alcohol wipes',
        'Gauze pads or cotton balls',
        'Non-latex gloves',
        'Sharps disposal container'
      ],
      safetyNotes: [
        'Using expired or improperly stored strips can lead to inaccurate results',
        'Cold equipment may give false readings',
        'Quality control testing ensures measurement accuracy'
      ]
    },
    {
      id: 'glucose-step-3',
      stepNumber: 3,
      title: 'Patient Preparation and Site Selection',
      description: 'Prepare patient and select optimal puncture site',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Explain procedure to patient and obtain consent',
        'Position patient comfortably with hand accessible',
        'Select lateral aspects of fingertips (ring or middle finger preferred)',
        'Avoid thumb and index finger (more sensitive and frequently used)',
        'Assess circulation and warmth in selected finger',
        'Avoid areas with calluses, cuts, or previous puncture sites',
        'Consider alternate sites if poor circulation: earlobe, forearm (with appropriate strips)',
        'Warm hands if cold to improve circulation and blood flow'
      ],
      contraindications: [
        'Avoid infected or injured areas',
        'Do not use swollen or edematous sites',
        'Avoid areas with poor circulation or cyanosis'
      ],
      safetyNotes: [
        'Proper site selection reduces pain and improves sample quality',
        'Lateral finger puncture is less painful than fingertip center',
        'Warming improves blood flow and sample volume'
      ]
    },
    {
      id: 'glucose-step-4',
      stepNumber: 4,
      title: 'Hand Hygiene and Site Antisepsis',
      description: 'Perform proper hand hygiene and site preparation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Perform thorough hand hygiene with alcohol-based sanitizer or soap and water',
        'Don clean, non-sterile gloves for universal precautions',
        'Have patient wash hands with warm soapy water if possible',
        'Clean selected puncture site with 70% isopropyl alcohol wipe',
        'Wipe in circular motion from center outward',
        'Allow alcohol to air dry completely (minimum 30 seconds)',
        'Do not blow on or fan the site to speed drying',
        'Avoid touching cleaned area after preparation'
      ],
      safetyNotes: [
        'Wet alcohol can dilute blood sample and affect accuracy',
        'Proper hand hygiene prevents contamination and infection',
        'Universal precautions protect against bloodborne pathogens'
      ]
    },
    {
      id: 'glucose-step-5',
      stepNumber: 5,
      title: 'Blood Sample Collection Technique',
      description: 'Obtain adequate blood sample using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Insert test strip into glucometer and wait for prompt',
        'Hold lancet device firmly against lateral aspect of selected finger',
        'Activate lancet device with quick, confident motion',
        'Gently squeeze finger from base toward tip to encourage blood flow',
        'Allow blood to form a hanging drop without excessive pressure',
        'Touch test strip to blood drop - do not smear or spread blood',
        'Ensure strip sample area is completely filled with blood',
        'Apply pressure to puncture site with clean gauze immediately'
      ],
      contraindications: [
        'Do not squeeze excessively - can cause hemolysis and false readings',
        'Never reuse lancets due to infection risk',
        'Do not milk the finger aggressively'
      ],
      safetyNotes: [
        'Adequate blood sample is essential for accurate results',
        'Excessive squeezing can dilute sample with tissue fluid',
        'Dispose of used lancet in sharps container immediately'
      ]
    },
    {
      id: 'glucose-step-6',
      stepNumber: 6,
      title: 'Result Reading and Quality Assessment',
      description: 'Obtain and assess glucose measurement for accuracy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Wait for glucometer to process sample (typically 5-15 seconds)',
        'Read result when displayed and ensure no error messages appear',
        'Record exact glucose value, time of test, and units used',
        'Note if result is flagged as high (HI) or low (LO) by device',
        'Assess result plausibility based on patient clinical presentation',
        'Consider repeat testing if result doesn\'t match clinical picture',
        'Document any factors that might affect accuracy',
        'Apply pressure to puncture site until bleeding stops'
      ],
      safetyNotes: [
        'Error messages may indicate insufficient sample, expired strips, or device malfunction',
        'Extremely high or low values should prompt repeat testing',
        'Clinical correlation is essential for proper interpretation'
      ]
    },
    {
      id: 'glucose-step-7',
      stepNumber: 7,
      title: 'Clinical Interpretation and Treatment Planning',
      description: 'Interpret results in clinical context and plan appropriate interventions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Interpret results using established reference ranges: Normal 80-120 mg/dL (4.4-6.7 mmol/L)',
        'Identify hypoglycemia: <70 mg/dL (3.9 mmol/L) or <50 mg/dL (2.8 mmol/L) severe',
        'Recognize hyperglycemia: >200 mg/dL (11.1 mmol/L) or >400 mg/dL (22.2 mmol/L) critical',
        'Consider patient-specific factors: age, comorbidities, medications',
        'Plan immediate interventions for severe hypoglycemia or hyperglycemia',
        'Consider additional testing if diabetic ketoacidosis suspected',
        'Correlate with neurological status and overall clinical condition',
        'Document clinical interpretation and planned interventions'
      ],
      contraindications: [
        'Do not delay treatment of severe hypoglycemia for repeat testing',
        'Do not ignore hyperglycemia even in asymptomatic patients',
        'Do not rely solely on glucose reading without clinical correlation'
      ],
      safetyNotes: [
        'Severe hypoglycemia (<40 mg/dL) is a medical emergency',
        'Hyperglycemia >400 mg/dL requires immediate medical attention',
        'Treatment should not be delayed for confirmatory testing'
      ]
    },
    {
      id: 'glucose-step-8',
      stepNumber: 8,
      title: 'Documentation and Follow-up Care',
      description: 'Document findings and ensure appropriate follow-up',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Record exact glucose value, time, date, and testing conditions',
        'Document patient\'s clinical presentation and symptoms',
        'Note any treatments administered based on results',
        'Document patient response to interventions',
        'Ensure proper disposal of all contaminated materials',
        'Clean and store glucometer according to manufacturer guidelines',
        'Communicate significant results to receiving healthcare providers',
        'Plan for repeat testing or continuous monitoring as indicated'
      ],
      safetyNotes: [
        'Proper documentation ensures continuity of care',
        'Significant glucose abnormalities require immediate communication',
        'Follow institutional protocols for critical value reporting'
      ]
    }
  ],

  // 8. SPINAL IMMOBILIZATION - Evidence-based cervical spine management
  'spinal-immobilization': [
    {
      id: 'spinal-immobilization-step-1',
      stepNumber: 1,
      title: 'Scene Assessment and C-Spine Considerations',
      description: 'Evaluate mechanism of injury and initiate cervical spine protection',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess mechanism of injury for spinal trauma risk (MVA, fall >3 feet, diving injury)',
        'Evaluate patient consciousness level and neurological status',
        'Initiate manual cervical spine stabilization immediately',
        'Apply cervical collar if indicated (awake, cooperative, no distracting injuries)',
        'Consider Canadian C-Spine Rule or NEXUS criteria for clearance',
        'Document neurological baseline before immobilization',
        'Assess for penetrating trauma to neck (relative contraindication to collar)'
      ],
      contraindications: [
        'Penetrating neck trauma with active bleeding (collar may worsen)',
        'Severe agitation preventing safe immobilization',
        'Airway compromise requiring immediate intervention'
      ],
      safetyNotes: [
        'Maintain in-line stabilization throughout assessment and treatment',
        'Never compromise airway management for spinal immobilization'
      ],
      equipmentNeeded: [
        'Cervical collar (multiple sizes)',
        'Long spine board or vacuum mattress',
        'Head blocks or towel rolls',
        'Straps and securing devices'
      ]
    },
    {
      id: 'spinal-immobilization-step-2',
      stepNumber: 2,
      title: 'Neurological Assessment and Documentation',
      description: 'Perform comprehensive neurological examination before immobilization',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Test motor function: "Can you move your fingers/toes? Squeeze my hands"',
        'Assess sensory function: light touch from face to feet bilaterally',
        'Check deep tendon reflexes if trained and time permits',
        'Evaluate for spinal shock: warm, flushed skin with hypotension',
        'Document any numbness, tingling, weakness, or paralysis',
        'Check rectal tone if indicated and trained (neurogenic shock assessment)',
        'Note any priapism in male patients (sign of spinal cord injury)'
      ],
      safetyNotes: [
        'Perform assessment without moving the patient',
        'Document findings clearly for receiving facility'
      ]
    },
    {
      id: 'spinal-immobilization-step-3',
      stepNumber: 3,
      title: 'Cervical Collar Application',
      description: 'Apply appropriate cervical collar while maintaining manual stabilization',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Maintain manual cervical stabilization throughout collar application',
        'Measure collar size: chin rest to trapezius muscle should fit properly',
        'Apply collar from anterior approach while assistant holds head',
        'Ensure proper fit: 2-finger space between chin and collar',
        'Check that collar does not obstruct airway or compress jugular veins',
        'Verify neck is in neutral position, not flexed or extended',
        'Continue manual stabilization even after collar application'
      ],
      contraindications: [
        'Penetrating neck injury with active bleeding',
        'Severe facial trauma preventing proper fit',
        'Airway compromise that collar would worsen'
      ]
    },
    {
      id: 'spinal-immobilization-step-4',
      stepNumber: 4,
      title: 'Log Roll and Spine Board Positioning',
      description: 'Safely position patient on long spine board using coordinated log roll',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Require minimum 4 people: head/neck, torso, pelvis/legs, board placement',
        'Head person controls all movement and gives commands',
        'Roll patient as single unit maintaining spinal alignment',
        'Slide board under patient during roll, center patient on board',
        'Return patient to supine position maintaining alignment',
        'Check that patient is centered on board before securing',
        'Pad void spaces (lower back, behind knees) to maintain neutral alignment'
      ],
      safetyNotes: [
        'Head person has absolute authority over movement',
        'Stop immediately if patient reports increased pain or numbness'
      ]
    },
    {
      id: 'spinal-immobilization-step-5',
      stepNumber: 5,
      title: 'Secure Patient to Spine Board',
      description: 'Apply straps and secure patient while maintaining spinal alignment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Apply chest strap across upper torso, avoiding breast tissue in females',
        'Secure pelvis with strap across iliac crests and upper thighs',
        'Apply leg straps above and below knees, secure ankles together',
        'Use minimum 3 points of contact, maximum 5 straps total',
        'Ensure straps are snug but do not impede breathing or circulation',
        'Check distal pulses after each strap application',
        'Maintain head stabilization throughout strapping process'
      ]
    },
    {
      id: 'spinal-immobilization-step-6',
      stepNumber: 6,
      title: 'Head and Neck Immobilization',
      description: 'Secure head and neck using head blocks and tape/straps',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Place head blocks or rolled towels on either side of head',
        'Apply tape across forehead and to board, avoiding eyes',
        'Apply second tape across cervical collar and to board',
        'Ensure head is in neutral position, not rotated or tilted',
        'Check that taping does not obstruct airway or vision',
        'Verify patient can open mouth and swallow if conscious',
        'Remove manual stabilization only after complete immobilization'
      ]
    },
    {
      id: 'spinal-immobilization-step-7',
      stepNumber: 7,
      title: 'Final Assessment and Transport Preparation',
      description: 'Complete immobilization check and prepare for safe transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Perform final neurological check and compare to baseline',
        'Ensure all straps are secure and patient cannot move',
        'Check distal circulation, sensation, and motor function',
        'Position for transport: slight Trendelenburg if hypotensive',
        'Have suction readily available in case of vomiting',
        'Brief patient on transport procedure and positioning',
        'Document time of immobilization and neurological status'
      ],
      safetyNotes: [
        'Be prepared to rapidly remove immobilization if airway compromise occurs',
        'Monitor patient continuously during transport for changes'
      ]
    },
    {
      id: 'spinal-immobilization-step-8',
      stepNumber: 8,
      title: 'Ongoing Monitoring and Care',
      description: 'Provide continuous assessment and supportive care during transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor vital signs every 5 minutes, watch for neurogenic shock',
        'Assess neurological function regularly and document changes',
        'Maintain mean arterial pressure >85 mmHg if spinal cord injury suspected',
        'Keep patient warm (spinal cord injury affects temperature regulation)',
        'Provide emotional support and reassurance throughout transport',
        'Have rapid extrication plan if patient decompensates',
        'Communicate findings to receiving trauma team via radio'
      ]
    }
  ],

  // 9. HEMORRHAGE CONTROL AND SHOCK MANAGEMENT - Advanced trauma care protocols
  'hemorrhage-control-shock': [
    {
      id: 'hemorrhage-control-step-1',
      stepNumber: 1,
      title: 'Rapid Primary Assessment and Scene Safety',
      description: 'Initial evaluation for life-threatening hemorrhage and shock',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Ensure scene safety and use appropriate PPE (gloves, eye protection)',
        'Perform rapid primary assessment using XABCDE approach',
        'Identify obvious external bleeding and estimate blood loss',
        'Check for signs of internal bleeding (distended abdomen, pelvic instability)',
        'Assess for shock: altered mental status, weak/rapid pulse, pale skin',
        'Expose patient appropriately to identify all bleeding sources',
        'Prioritize life-threatening hemorrhage control over other interventions'
      ],
      safetyNotes: [
        'Universal precautions mandatory - blood-borne pathogen exposure risk',
        'Control obvious bleeding before detailed assessment'
      ],
      equipmentNeeded: [
        'Personal protective equipment',
        'Trauma dressings and gauze',
        'Pressure bandages',
        'Tourniquets',
        'Hemostatic agents'
      ]
    },
    {
      id: 'hemorrhage-control-step-2',
      stepNumber: 2,
      title: 'Direct Pressure and Bleeding Control',
      description: 'Apply immediate direct pressure to control external hemorrhage',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Apply direct pressure with clean cloth or trauma dressing',
        'Use palm of hand to apply firm, sustained pressure over bleeding source',
        'Do not lift dressing to check bleeding - add additional layers if needed',
        'Maintain pressure for minimum 3-5 minutes before assessing',
        'Elevate bleeding extremity above heart level if no fracture suspected',
        'Consider pressure points if direct pressure insufficient',
        'Apply pressure bandage once bleeding controlled'
      ],
      contraindications: [
        'Suspected fracture in elevated limb',
        'Penetrating object in wound (stabilize, don\'t remove)',
        'Suspected compartment syndrome'
      ]
    },
    {
      id: 'hemorrhage-control-step-3',
      stepNumber: 3,
      title: 'Tourniquet Application (if indicated)',
      description: 'Apply tourniquet for severe extremity bleeding uncontrolled by direct pressure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Apply tourniquet 2-3 inches above bleeding site (proximal to wound)',
        'Tighten until bleeding stops completely - expect significant pain',
        'Note exact time of tourniquet application and document',
        'Do not loosen or remove tourniquet once applied',
        'Write "TK" and time on patient\'s forehead or attach tag',
        'Apply second tourniquet above first if bleeding continues',
        'Consider hemostatic agents for junctional bleeding (groin, axilla)'
      ],
      indications: [
        'Severe extremity bleeding not controlled by direct pressure',
        'Amputation or mangled extremity',
        'Combat or tactical environment',
        'Multiple casualties requiring rapid bleeding control'
      ],
      contraindications: [
        'Bleeding not from extremity',
        'Minor bleeding controlled by direct pressure',
        'Application over joint or fracture site'
      ]
    },
    {
      id: 'hemorrhage-control-step-4',
      stepNumber: 4,
      title: 'Shock Recognition and Assessment',
      description: 'Identify and classify type and severity of shock',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess vital signs: BP, pulse rate/quality, respiratory rate, temperature',
        'Check skin color, temperature, and capillary refill (<2 seconds normal)',
        'Evaluate mental status: anxiety, confusion, decreased responsiveness',
        'Measure urine output if Foley catheter present (>0.5 mL/kg/hr normal)',
        'Look for signs of different shock types: hypovolemic, cardiogenic, distributive',
        'Estimate blood loss: Class I (<15%), II (15-30%), III (30-40%), IV (>40%)',
        'Document baseline vital signs and neurological status'
      ],
      safetyNotes: [
        'Shock can develop rapidly - frequent reassessment essential',
        'Early shock may present with normal blood pressure (compensated shock)'
      ]
    },
    {
      id: 'hemorrhage-control-step-5',
      stepNumber: 5,
      title: 'IV Access and Fluid Resuscitation',
      description: 'Establish vascular access and initiate appropriate fluid therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Establish two large-bore IV lines (14-16G) or IO access if IV difficult',
        'Draw blood for crossmatch, CBC, PT/PTT, type and screen if possible',
        'Initiate fluid resuscitation with warmed crystalloid (normal saline or LR)',
        'Target permissive hypotension: SBP 80-90 mmHg unless head injury',
        'Give fluid boluses 250-500mL and reassess - avoid over-resuscitation',
        'Consider blood products if available: O-negative or type-specific',
        'Monitor for fluid overload: lung sounds, jugular venous distension'
      ],
      contraindications: [
        'Pulmonary edema or CHF (relative contraindication to large volumes)',
        'Suspected tension pneumothorax',
        'Penetrating torso injury with controlled bleeding (avoid aggressive fluids)'
      ]
    },
    {
      id: 'hemorrhage-control-step-6',
      stepNumber: 6,
      title: 'Advanced Hemorrhage Control Measures',
      description: 'Apply advanced techniques for persistent or internal bleeding',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Consider hemostatic agents (QuikClot, Celox) for external bleeding',
        'Apply pelvic binder for suspected pelvic fracture and instability',
        'Use pneumatic antishock garment (PASG) if available and indicated',
        'Consider emergency thoracotomy indications in cardiac arrest',
        'Prepare for rapid transport to trauma center or surgical intervention',
        'Control hypothermia with warm blankets and heated IV fluids',
        'Consider TXA (tranexamic acid) administration if protocol allows'
      ],
      safetyNotes: [
        'Hemostatic agents generate heat - monitor for thermal injury',
        'PASG contraindicated in chest injuries or pregnancy'
      ]
    },
    {
      id: 'hemorrhage-control-step-7',
      stepNumber: 7,
      title: 'Monitoring and Ongoing Care',
      description: 'Provide continuous monitoring and supportive care during transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor vital signs every 5 minutes and document trends',
        'Reassess bleeding control and dressing integrity frequently',
        'Watch for signs of rebleeding or continued internal bleeding',
        'Maintain normothermia: cover patient, warm IV fluids, heated blankets',
        'Monitor level of consciousness and neurological status',
        'Check tourniquet time and neurovascular status distal to tourniquets',
        'Prepare for potential deterioration and need for aggressive interventions'
      ]
    },
    {
      id: 'hemorrhage-control-step-8',
      stepNumber: 8,
      title: 'Documentation and Handover',
      description: 'Document all interventions and provide comprehensive handover',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Document mechanism of injury and initial presentation',
        'Record all bleeding control measures and times of intervention',
        'Note tourniquet application times and neurovascular checks',
        'Document fluid resuscitation amounts and patient response',
        'Record vital sign trends and level of consciousness changes',
        'Provide SBAR handover to receiving trauma team',
        'Include estimated blood loss and current bleeding status'
      ]
    }
  ],

  // 10. PEDIATRIC ASSESSMENT AND EMERGENCY CARE - Specialized pediatric protocols
  'pediatric-assessment-care': [
    {
      id: 'pediatric-care-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Age-Appropriate Approach',
      description: 'Establish safe environment and age-appropriate patient interaction',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Ensure scene safety and identify any environmental hazards to child',
        'Determine approximate age: infant (<1 year), child (1-8 years), adolescent (>8 years)',
        'Approach calmly and at child\'s eye level when possible',
        'Allow parent/caregiver to remain with child if they are helpful and calm',
        'Use age-appropriate language and explain procedures simply',
        'Observe child\'s interaction with environment and caregivers',
        'Note any signs of abuse, neglect, or unsafe living conditions'
      ],
      safetyNotes: [
        'Children may hide injuries or illness due to fear',
        'Maintain high index of suspicion for non-accidental trauma'
      ],
      equipmentNeeded: [
        'Pediatric assessment tools',
        'Age-appropriate equipment sizes',
        'Comfort items (stickers, small toys)',
        'Pediatric vital sign references'
      ]
    },
    {
      id: 'pediatric-care-step-2',
      stepNumber: 2,
      title: 'Pediatric Assessment Triangle (PAT)',
      description: 'Perform rapid visual assessment using Pediatric Assessment Triangle',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess Appearance: tone, interactivity, consolability, look/gaze, speech/cry',
        'Evaluate Work of Breathing: abnormal sounds, positioning, retractions, flaring',
        'Check Circulation to Skin: pallor, mottling, cyanosis',
        'Determine illness severity: well, sick, or critically ill',
        'Document initial PAT findings before detailed examination',
        'Use PAT to guide urgency of interventions and transport decisions'
      ],
      safetyNotes: [
        'PAT can be performed without touching the child',
        'Critically ill children may appear deceptively stable initially'
      ]
    },
    {
      id: 'pediatric-care-step-3',
      stepNumber: 3,
      title: 'Age-Appropriate Vital Signs Assessment',
      description: 'Obtain and interpret pediatric vital signs using age-specific norms',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Use appropriate-sized equipment: BP cuff 2/3 width of upper arm',
        'Normal heart rates: Infant 100-160, Child 70-120, Adolescent 60-100',
        'Normal respiratory rates: Infant 30-60, Child 20-30, Adolescent 12-20',
        'Normal BP: Infant 70-100 systolic, Child 80-110, Adolescent 90-120',
        'Assess temperature: normal 36.5-37.5°C (97.7-99.5°F)',
        'Calculate weight if unknown: (Age in years × 2) + 8 = kg for ages 1-10',
        'Note any vital signs outside normal parameters for age'
      ],
      contraindications: [
        'Do not force vital sign assessment if child becomes severely distressed',
        'Prioritize critical interventions over complete vital signs in unstable child'
      ]
    },
    {
      id: 'pediatric-care-step-4',
      stepNumber: 4,
      title: 'Primary Assessment - ABCDE',
      description: 'Perform systematic primary assessment adapted for pediatrics',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Airway: Check for obstruction, stridor, drooling, positioning',
        'Breathing: Rate, effort, chest rise, breath sounds, oxygen saturation',
        'Circulation: Pulse quality, skin color/temperature, capillary refill (<2 sec)',
        'Disability: AVPU scale, pupil response, motor function',
        'Exposure: Remove clothing as needed while maintaining warmth and modesty',
        'Address life-threatening problems immediately as identified',
        'Consider fever management in febrile children'
      ],
      safetyNotes: [
        'Children compensate well until they decompensate rapidly',
        'Hypothermia prevention is critical in pediatric patients'
      ]
    },
    {
      id: 'pediatric-care-step-5',
      stepNumber: 5,
      title: 'Secondary Assessment and History',
      description: 'Conduct detailed examination and obtain pediatric-specific history',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Perform head-to-toe examination appropriate for child\'s age and cooperation',
        'Use SAMPLE history adapted for pediatrics (Signs/Symptoms, Allergies, Medications)',
        'Include birth history for infants: gestational age, birth weight, complications',
        'Ask about immunization status and recent illnesses',
        'Assess developmental milestones appropriate for age',
        'Evaluate parent/caregiver concerns and observations',
        'Document any concerning social factors or living conditions'
      ]
    },
    {
      id: 'pediatric-care-step-6',
      stepNumber: 6,
      title: 'Pediatric Emergency Interventions',
      description: 'Provide age-appropriate emergency care and interventions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Airway management: Use age-appropriate positioning and equipment sizes',
        'Oxygen therapy: Target SpO2 94-98%, avoid hyperoxia in neonates',
        'Vascular access: Consider IO if IV difficult, use appropriate needle sizes',
        'Fluid resuscitation: 20 mL/kg boluses, reassess after each bolus',
        'Medication dosing: Use weight-based calculations, double-check all doses',
        'Temperature management: Prevent hypothermia, treat hyperthermia',
        'Pain management: Use age-appropriate assessment tools and medications'
      ],
      contraindications: [
        'Avoid neck extension in children <2 years (large occiput)',
        'Do not give adult medication concentrations to pediatric patients'
      ]
    },
    {
      id: 'pediatric-care-step-7',
      stepNumber: 7,
      title: 'Family-Centered Care and Communication',
      description: 'Provide psychosocial support and involve family in care decisions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Keep families informed about child\'s condition and treatments',
        'Allow parent/caregiver to provide comfort and support when appropriate',
        'Use age-appropriate explanations for procedures',
        'Address family\'s emotional needs and concerns',
        'Prepare child and family for transport and hospital procedures',
        'Provide comfort measures: favorite toy, blanket, pacifier',
        'Document family dynamics and any concerning behaviors'
      ]
    },
    {
      id: 'pediatric-care-step-8',
      stepNumber: 8,
      title: 'Transport and Ongoing Monitoring',
      description: 'Provide safe transport with continuous pediatric-focused monitoring',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Use appropriate restraint systems for child\'s age and size',
        'Monitor vital signs every 5 minutes, watching for deterioration',
        'Reassess PAT components throughout transport',
        'Maintain normal body temperature with warming devices',
        'Continue family-centered care during transport when possible',
        'Be prepared for rapid decompensation and escalation of care',
        'Communicate with receiving pediatric team about patient status'
      ]
    }
  ],

  // 11. MEDICATION ADMINISTRATION AND DOSAGE CALCULATION - Safe medication practices
  'medication-administration-dosage': [
    {
      id: 'medication-dosage-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Indication Verification',
      description: 'Assess patient and verify appropriate indications for medication',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Verify patient identity using two identifiers (name, DOB, medical record)',
        'Assess clinical indication for medication (symptoms, vital signs, ECG)',
        'Check for contraindications and drug allergies before administration',
        'Evaluate patient\'s current medications for potential interactions',
        'Assess renal and hepatic function if relevant to drug metabolism',
        'Document baseline vital signs and patient condition',
        'Consider alternative treatments if medication contraindicated'
      ],
      contraindications: [
        'Known allergy to medication or components',
        'Contraindications specific to individual medications',
        'Pregnancy category restrictions when applicable',
        'Age-related contraindications for certain drugs'
      ],
      safetyNotes: [
        'Always verify patient identity before any medication administration',
        'Never administer medication without clear indication and physician order'
      ]
    },
    {
      id: 'medication-dosage-step-2',
      stepNumber: 2,
      title: 'Medication Verification - Six Rights',
      description: 'Verify medication using the six rights of medication administration',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'RIGHT PATIENT: Verify identity with two identifiers',
        'RIGHT DRUG: Check medication name, generic vs brand names',
        'RIGHT DOSE: Verify ordered dose matches calculated dose',
        'RIGHT ROUTE: Confirm appropriate administration route (IV, IM, SL, PO)',
        'RIGHT TIME: Ensure medication given at appropriate intervals',
        'RIGHT DOCUMENTATION: Prepare to document administration accurately',
        'Check medication expiration date and inspect for contamination'
      ],
      safetyNotes: [
        'Double-check high-risk medications with second provider when possible',
        'Never administer medication that appears cloudy, discolored, or contaminated'
      ]
    },
    {
      id: 'medication-dosage-step-3',
      stepNumber: 3,
      title: 'Dosage Calculation and Verification',
      description: 'Calculate appropriate dosage using established formulas',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Use formula: Dose = (Ordered dose × Volume) ÷ Concentration on hand',
        'For weight-based dosing: Dose = Weight (kg) × mg/kg ordered',
        'IV drip rate: Rate = (Volume × gtt factor) ÷ Time (minutes)',
        'Concentration calculations: mg/mL = mg ÷ mL',
        'Double-check all mathematical calculations independently',
        'Use dimensional analysis to verify unit conversions',
        'Consider body surface area for specialized medications when indicated'
      ],
      equipmentNeeded: [
        'Calculator',
        'Dosage reference guides',
        'Weight scale if needed',
        'Unit conversion charts'
      ]
    },
    {
      id: 'medication-dosage-step-4',
      stepNumber: 4,
      title: 'Medication Preparation',
      description: 'Prepare medication using aseptic technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Perform hand hygiene and use aseptic technique throughout',
        'Draw up medication in clean, well-lit environment',
        'Use appropriate syringe size for accurate measurement',
        'Remove air bubbles from syringe before administration',
        'Label prepared medication if not immediately administered',
        'Prepare only one medication at a time to prevent errors',
        'Use filter needles for glass ampules to remove particles'
      ],
      safetyNotes: [
        'Never prepare medications in advance unless specifically indicated',
        'Discard any medication that has been contaminated or dropped'
      ]
    },
    {
      id: 'medication-dosage-step-5',
      stepNumber: 5,
      title: 'Route-Specific Administration Technique',
      description: 'Administer medication using appropriate technique for chosen route',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'INTRAVENOUS: Verify IV patency, flush with saline, administer at appropriate rate',
        'INTRAMUSCULAR: Choose appropriate muscle, use proper needle angle (90°)',
        'SUBLINGUAL: Place tablet under tongue, instruct patient not to swallow',
        'INTRAOSSEOUS: Verify IO placement, flush with saline, expect patient discomfort',
        'ENDOTRACHEAL: Use 2-3x IV dose diluted in 10mL saline, follow with ventilations',
        'Monitor injection site for signs of infiltration or adverse reactions',
        'Follow medication-specific administration guidelines'
      ]
    },
    {
      id: 'medication-dosage-step-6',
      stepNumber: 6,
      title: 'Patient Monitoring and Assessment',
      description: 'Monitor patient response and assess for therapeutic effects',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor vital signs continuously for first 15 minutes post-administration',
        'Assess for intended therapeutic effects specific to medication',
        'Watch for signs of allergic reactions: rash, swelling, bronchospasm',
        'Monitor for medication-specific adverse effects',
        'Be prepared to treat anaphylaxis with epinephrine and supportive care',
        'Document patient response and any changes in condition',
        'Reassess need for additional doses based on patient response'
      ],
      contraindications: [
        'Signs of severe allergic reaction require immediate intervention',
        'Unexpected adverse effects may require medication discontinuation'
      ]
    },
    {
      id: 'medication-dosage-step-7',
      stepNumber: 7,
      title: 'Documentation and Communication',
      description: 'Document medication administration accurately and communicate with team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Document medication name, dose, route, time of administration',
        'Record indication for medication and patient response',
        'Note any adverse reactions or complications',
        'Include vital signs before and after administration',
        'Communicate with receiving facility about medications given',
        'Report any medication errors immediately according to protocol',
        'Document patient education provided about medication effects'
      ]
    },
    {
      id: 'medication-dosage-step-8',
      stepNumber: 8,
      title: 'Medication Storage and Waste Disposal',
      description: 'Properly store remaining medications and dispose of waste',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Store controlled substances according to DEA regulations',
        'Dispose of needles and sharps in appropriate containers immediately',
        'Discard unused portions of single-use medications appropriately',
        'Return unused controlled substances to secure storage',
        'Document controlled substance usage and disposal',
        'Clean and disinfect preparation area after use',
        'Report any medication discrepancies or losses per protocol'
      ],
      safetyNotes: [
        'Never recap needles - dispose directly into sharps container',
        'Follow facility protocols for controlled substance documentation'
      ]
    }
  ],

  // 12. OBSTETRIC EMERGENCY AND CHILDBIRTH - Emergency delivery and complications
  'obstetric-emergency-childbirth': [
    {
      id: 'obstetric-step-1',
      stepNumber: 1,
      title: 'Maternal Assessment and History',
      description: 'Assess pregnant patient and obtain relevant obstetric history',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Determine gestational age: LMP, EDC, fundal height assessment',
        'Ask about prenatal care, complications, previous pregnancies (gravida/para)',
        'Assess for labor signs: contractions, cervical changes, bloody show',
        'Check for membrane rupture: clear vs meconium-stained amniotic fluid',
        'Obtain vital signs and assess maternal distress or complications',
        'Determine if delivery is imminent: urge to push, crowning visible',
        'Ask about allergies, medications, medical history'
      ],
      equipmentNeeded: [
        'Fetal doppler or stethoscope',
        'Blood pressure cuff',
        'Thermometer',
        'Watch for timing contractions',
        'Gloves and protective equipment'
      ],
      safetyNotes: [
        'Transport immediately if delivery not imminent and complications present',
        'Prepare for emergency delivery if crowning or strong urge to push'
      ]
    },
    {
      id: 'obstetric-step-2',
      stepNumber: 2,
      title: 'Fetal Assessment',
      description: 'Evaluate fetal well-being and position',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Listen to fetal heart tones: normal 120-160 bpm between contractions',
        'Assess fetal movement if mother reports decreased activity',
        'Check for cord prolapse if membranes ruptured',
        'Evaluate for breech presentation: buttocks or feet presenting first',
        'Note meconium staining of amniotic fluid (fetal distress sign)',
        'Assess for multiple gestation if uterus appears large for dates',
        'Document fetal heart rate and any irregularities'
      ],
      contraindications: [
        'Prolapsed cord requires immediate positioning and rapid transport',
        'Breech presentation may require cesarean delivery'
      ]
    },
    {
      id: 'obstetric-step-3',
      stepNumber: 3,
      title: 'Preparation for Delivery',
      description: 'Prepare equipment and environment for emergency delivery',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Set up sterile delivery kit: towels, clamps, scissors, bulb syringe',
        'Position mother: semi-sitting or left lateral to avoid supine hypotension',
        'Ensure privacy and maintain patient dignity during examination',
        'Have oxygen available for mother and newborn',
        'Prepare warming blankets for newborn temperature control',
        'Have suction equipment ready for newborn airway clearance',
        'Ensure adequate lighting and clean workspace'
      ],
      equipmentNeeded: [
        'Sterile delivery kit',
        'Clean towels and blankets',
        'Cord clamps and scissors',
        'Bulb syringe',
        'Oxygen and bag-mask for newborn',
        'Sterile gloves'
      ]
    },
    {
      id: 'obstetric-step-4',
      stepNumber: 4,
      title: 'Delivery of the Head',
      description: 'Assist with delivery of fetal head using controlled technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Allow head to emerge slowly - do not pull on baby',
        'Support perineum with towel to prevent excessive tearing',
        'Check for nuchal cord (cord around neck) as head delivers',
        'If nuchal cord present: try to slip over head or clamp and cut if tight',
        'Suction mouth first, then nose with bulb syringe',
        'Support head and neck as it rotates (restitution)',
        'Never pull on head - let natural expulsive forces work'
      ],
      safetyNotes: [
        'Excessive traction can cause brachial plexus injury',
        'Tight nuchal cord can cause fetal hypoxia - act quickly'
      ]
    },
    {
      id: 'obstetric-step-5',
      stepNumber: 5,
      title: 'Delivery of Shoulders and Body',
      description: 'Complete delivery of infant using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Support head and apply gentle downward traction for anterior shoulder',
        'Then lift head upward to deliver posterior shoulder',
        'Support body as it delivers - babies are slippery when wet',
        'Keep baby at level of perineum initially to prevent blood volume shifts',
        'Note exact time of delivery for documentation',
        'Assess baby immediately: breathing, crying, color, tone',
        'Place baby skin-to-skin with mother if stable'
      ]
    },
    {
      id: 'obstetric-step-6',
      stepNumber: 6,
      title: 'Immediate Newborn Care',
      description: 'Provide immediate assessment and care of newborn',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Dry and warm baby immediately with clean towels',
        'Stimulate breathing by drying back and soles of feet',
        'Position airway: slight neck extension, clear secretions if needed',
        'Assess breathing: should begin within 30 seconds of delivery',
        'Check heart rate: should be >100 bpm',
        'Evaluate color: central cyanosis abnormal after first few minutes',
        'If not breathing: provide positive pressure ventilation with bag-mask'
      ],
      contraindications: [
        'Do not delay resuscitation if baby appears compromised',
        'Avoid excessive stimulation if baby is responding appropriately'
      ]
    },
    {
      id: 'obstetric-step-7',
      stepNumber: 7,
      title: 'Cord Care and Placental Delivery',
      description: 'Manage umbilical cord and assist with placental delivery',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Clamp cord in two places about 6 inches from baby, cut between clamps',
        'Wait for signs of placental separation: gush of blood, cord lengthening',
        'Do not pull on cord - allow placenta to deliver spontaneously',
        'Examine placenta for completeness when delivered',
        'Massage uterine fundus to promote contraction and control bleeding',
        'Monitor mother for excessive bleeding (>500mL postpartum hemorrhage)',
        'Save placenta for examination at hospital'
      ],
      safetyNotes: [
        'Never pull on cord before placenta separates - risk of uterine inversion',
        'Postpartum hemorrhage can be life-threatening - monitor closely'
      ]
    },
    {
      id: 'obstetric-step-8',
      stepNumber: 8,
      title: 'Post-Delivery Monitoring and Transport',
      description: 'Monitor mother and baby during transport to hospital',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Continue monitoring maternal vital signs every 5 minutes',
        'Watch for postpartum hemorrhage and uterine atony',
        'Keep newborn warm and monitor respiratory effort',
        'Allow breastfeeding if mother and baby are stable',
        'Document Apgar scores at 1 and 5 minutes if trained',
        'Prepare for neonatal resuscitation if baby becomes compromised',
        'Transport both patients to appropriate facility with obstetric services'
      ]
    }
  ],

  // 13. RESPIRATORY DISTRESS MANAGEMENT - Comprehensive respiratory emergency care
  'respiratory-distress-management': [
    {
      id: 'respiratory-distress-step-1',
      stepNumber: 1,
      title: 'Primary Assessment and Immediate Interventions',
      description: 'Rapidly assess respiratory status and provide immediate life-saving interventions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess airway patency and breathing adequacy immediately',
        'Look for signs of severe respiratory distress: tripod positioning, use of accessory muscles',
        'Check oxygen saturation and apply supplemental oxygen if SpO2 <94%',
        'Evaluate for immediate life threats: upper airway obstruction, tension pneumothorax',
        'Position patient for optimal breathing: sitting upright or high Fowler\'s position',
        'Prepare for advanced airway intervention if patient unable to maintain airway',
        'Consider assisted ventilation if respiratory rate <8 or >30 with poor effort'
      ],
      contraindications: [
        'Do not lay flat any patient in respiratory distress unless airway compromise',
        'Avoid high-flow oxygen in COPD patients unless severely hypoxic'
      ],
      equipmentNeeded: [
        'Pulse oximeter',
        'Oxygen delivery devices',
        'Bag-valve-mask device',
        'Advanced airway equipment'
      ]
    },
    {
      id: 'respiratory-distress-step-2',
      stepNumber: 2,
      title: 'Detailed Respiratory Assessment',
      description: 'Conduct comprehensive respiratory system evaluation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Inspect chest for symmetry, retractions, accessory muscle use, barrel chest',
        'Auscultate all lung fields: note decreased sounds, wheezes, rales, rhonchi',
        'Assess respiratory rate, depth, and pattern (normal 12-20/min in adults)',
        'Check for cyanosis: central (lips, tongue) vs peripheral (fingers, toes)',
        'Evaluate jugular venous distension and peripheral edema',
        'Palpate chest for tenderness, crepitus, or asymmetrical expansion',
        'Percuss chest if trained: dullness (fluid) vs hyperresonance (air trapping)'
      ],
      safetyNotes: [
        'Complete assessment quickly - do not delay treatment for detailed exam',
        'Monitor for deterioration during assessment'
      ]
    },
    {
      id: 'respiratory-distress-step-3',
      stepNumber: 3,
      title: 'History and Differential Diagnosis',
      description: 'Obtain relevant history to guide treatment decisions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Ask about onset: sudden (PE, pneumothorax) vs gradual (CHF, infection)',
        'Inquire about associated symptoms: chest pain, fever, cough, sputum production',
        'Obtain medication history: inhalers, cardiac medications, recent changes',
        'Ask about triggers: allergens, exercise, cold air, emotional stress',
        'Assess for orthopnea, paroxysmal nocturnal dyspnea (suggests CHF)',
        'Document smoking history and occupational exposures',
        'Consider recent travel, surgery, or immobilization (PE risk factors)'
      ]
    },
    {
      id: 'respiratory-distress-step-4',
      stepNumber: 4,
      title: 'Oxygen Therapy and Ventilatory Support',
      description: 'Provide appropriate oxygen therapy and ventilatory assistance',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Titrate oxygen to maintain SpO2 94-98% (88-92% for COPD patients)',
        'Choose appropriate delivery device: nasal cannula, simple mask, non-rebreather',
        'Consider CPAP for pulmonary edema or severe respiratory distress',
        'Provide assisted ventilation with bag-mask if inadequate respiratory effort',
        'Monitor for improvement in oxygen saturation and respiratory effort',
        'Prepare for intubation if patient cannot maintain adequate ventilation',
        'Use end-tidal CO2 monitoring if available to assess ventilation adequacy'
      ]
    },
    {
      id: 'respiratory-distress-step-5',
      stepNumber: 5,
      title: 'Medication Administration',
      description: 'Administer appropriate medications based on suspected etiology',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'BRONCHOSPASM: Albuterol 2.5mg via nebulizer, may repeat every 20 minutes',
        'SEVERE ASTHMA: Consider ipratropium bromide 0.5mg with albuterol',
        'PULMONARY EDEMA: Nitroglycerin SL 0.4mg, furosemide 40-80mg IV if protocols allow',
        'ANAPHYLAXIS: Epinephrine 0.3mg IM, diphenhydramine, corticosteroids',
        'COPD EXACERBATION: Bronchodilators, consider corticosteroids',
        'Monitor patient response to medications and document effects',
        'Be prepared for side effects: tachycardia with bronchodilators, hypotension with nitrates'
      ],
      contraindications: [
        'Avoid beta-blockers in bronchospastic disease',
        'Use caution with nitroglycerin in hypotensive patients'
      ]
    },
    {
      id: 'respiratory-distress-step-6',
      stepNumber: 6,
      title: 'Advanced Interventions',
      description: 'Provide advanced respiratory support as indicated',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Consider needle thoracentesis for tension pneumothorax',
        'Prepare for rapid sequence intubation if respiratory failure imminent',
        'Apply CPAP for cardiogenic pulmonary edema if available',
        'Use mechanical ventilation support if patient cannot maintain adequate gas exchange',
        'Monitor arterial blood gases if available to guide therapy',
        'Consider advanced medications: magnesium sulfate for severe asthma',
        'Prepare for emergency surgical airway if complete upper airway obstruction'
      ],
      safetyNotes: [
        'Advanced procedures carry risks - ensure proper training and indication',
        'Have backup plans if primary interventions fail'
      ]
    },
    {
      id: 'respiratory-distress-step-7',
      stepNumber: 7,
      title: 'Monitoring and Reassessment',
      description: 'Continuously monitor patient response and adjust treatment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor vital signs every 5 minutes and document trends',
        'Reassess oxygen saturation, respiratory rate, and effort continuously',
        'Evaluate response to medications: improved breath sounds, decreased distress',
        'Watch for complications: pneumothorax from positive pressure, medication side effects',
        'Assess level of consciousness and ability to protect airway',
        'Monitor for signs of respiratory fatigue and impending failure',
        'Prepare for escalation of care if patient not responding to treatment'
      ]
    },
    {
      id: 'respiratory-distress-step-8',
      stepNumber: 8,
      title: 'Transport and Communication',
      description: 'Coordinate appropriate transport and communicate with receiving facility',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Choose appropriate destination: emergency department vs specialty unit',
        'Provide detailed report to receiving facility about interventions and response',
        'Continue monitoring and treatment during transport',
        'Have emergency equipment ready: intubation kit, defibrillator, medications',
        'Document all interventions, times, and patient responses accurately',
        'Consider air medical transport for critical patients requiring specialized care',
        'Prepare family for patient condition and transport plans'
      ]
    }
  ],

  // 14. CARDIAC ARREST AND RESUSCITATION - Advanced cardiac life support protocols
  'cardiac-arrest-resuscitation': [
    {
      id: 'cardiac-arrest-step-1',
      stepNumber: 1,
      title: 'Recognition and Immediate Response',
      description: 'Rapidly identify cardiac arrest and initiate immediate response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Check for responsiveness: tap shoulders firmly and shout "Are you okay?"',
        'Assess for normal breathing: look for chest rise, no gasping or agonal breathing',
        'Check carotid pulse for maximum 10 seconds - if absent or uncertain, start CPR',
        'Call for help immediately and request defibrillator/AED',
        'Ensure scene safety and use appropriate PPE',
        'Note time of arrest recognition for documentation',
        'Position patient on firm, flat surface for effective compressions'
      ],
      contraindications: [
        'Signs of obvious death (rigor mortis, decomposition, dependent lividity)',
        'Valid DNR orders or advance directives',
        'Unsafe scene preventing immediate intervention'
      ],
      safetyNotes: [
        'Do not delay CPR to obtain additional history if patient is clearly in arrest',
        'Quality CPR is more important than immediate defibrillation in most cases'
      ]
    },
    {
      id: 'cardiac-arrest-step-2',
      stepNumber: 2,
      title: 'High-Quality CPR Initiation',
      description: 'Begin immediate high-quality chest compressions and ventilations',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Position hands: heel of hand on center of chest between nipples',
        'Compress hard and fast: at least 5cm (2 inches) deep, rate 100-120/min',
        'Allow complete chest recoil between compressions',
        'Minimize interruptions: <10 seconds between compression cycles',
        'Provide 30 compressions followed by 2 rescue breaths',
        'Switch compressor every 2 minutes to prevent fatigue',
        'Use feedback devices or metronome if available to maintain quality'
      ],
      equipmentNeeded: [
        'CPR feedback device (if available)',
        'Bag-valve-mask device',
        'Backboard or firm surface',
        'Gloves and face protection'
      ]
    },
    {
      id: 'cardiac-arrest-step-3',
      stepNumber: 3,
      title: 'Defibrillation and Rhythm Analysis',
      description: 'Apply defibrillator and analyze cardiac rhythm for shockable rhythms',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Apply defibrillator pads: right sternal border and left lateral chest',
        'Ensure good pad contact on dry, hairless chest (shave if necessary)',
        'Stop CPR and ensure all personnel clear during rhythm analysis',
        'Identify rhythm: VF/VT (shockable) vs PEA/Asystole (non-shockable)',
        'If shockable: deliver shock immediately and resume CPR for 2 minutes',
        'If non-shockable: resume CPR immediately and consider reversible causes',
        'Charge defibrillator during CPR to minimize interruptions'
      ],
      safetyNotes: [
        'Ensure all personnel are clear before delivering shock',
        'Remove oxygen source during defibrillation to prevent fire hazard'
      ]
    },
    {
      id: 'cardiac-arrest-step-4',
      stepNumber: 4,
      title: 'Advanced Airway Management',
      description: 'Establish advanced airway and ensure effective ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Consider advanced airway after initial resuscitation efforts',
        'Options: endotracheal tube, supraglottic airway (LMA, i-gel)',
        'Confirm placement with multiple methods: capnography, auscultation, chest rise',
        'Once advanced airway placed: continuous compressions at 100-120/min',
        'Ventilate at 10 breaths/minute (1 breath every 6 seconds)',
        'Monitor end-tidal CO2: target 35-45 mmHg for adequate perfusion',
        'Avoid hyperventilation which decreases venous return'
      ]
    },
    {
      id: 'cardiac-arrest-step-5',
      stepNumber: 5,
      title: 'Vascular Access and Medication Administration',
      description: 'Establish IV/IO access and administer appropriate ACLS medications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Establish large bore IV or intraosseous access without interrupting CPR',
        'EPINEPHRINE: 1mg IV/IO every 3-5 minutes for all arrest rhythms',
        'AMIODARONE: 300mg IV/IO for persistent VF/VT, then 150mg if needed',
        'VASOPRESSIN: 40 units IV/IO (alternative to epinephrine)',
        'Flush all medications with 20mL saline and brief arm elevation',
        'Consider calcium, magnesium, or sodium bicarbonate for specific indications',
        'Time medications appropriately with CPR cycles'
      ],
      contraindications: [
        'Do not delay CPR for difficult IV access - use IO route',
        'Avoid routine sodium bicarbonate unless specific indication'
      ]
    },
    {
      id: 'cardiac-arrest-step-6',
      stepNumber: 6,
      title: 'Reversible Causes Assessment',
      description: 'Identify and treat potentially reversible causes of cardiac arrest',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'H\'s: Hypovolemia, Hypoxia, Hydrogen ions (acidosis), Hypothermia, Hypo/hyperkalemia',
        'T\'s: Tension pneumothorax, Tamponade, Toxins, Thrombosis (MI/PE)',
        'Treat hypovolemia with fluid boluses if suspected',
        'Ensure adequate oxygenation and ventilation for hypoxia',
        'Consider needle decompression for tension pneumothorax',
        'Administer specific antidotes for known toxin exposure',
        'Treat electrolyte abnormalities based on history and ECG findings'
      ]
    },
    {
      id: 'cardiac-arrest-step-7',
      stepNumber: 7,
      title: 'Team Leadership and Coordination',
      description: 'Coordinate resuscitation team and maintain organized approach',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Designate clear roles: compressor, airway, defibrillator, medications',
        'Communicate clearly and confirm all orders ("Give 1mg epi IV")',
        'Monitor CPR quality: depth, rate, recoil, minimize interruptions',
        'Rotate compressors every 2 minutes without delay',
        'Keep accurate timing of interventions and rhythm checks',
        'Maintain situational awareness and adapt to changing conditions',
        'Consider termination criteria if prolonged unsuccessful resuscitation'
      ]
    },
    {
      id: 'cardiac-arrest-step-8',
      stepNumber: 8,
      title: 'Post-Resuscitation Care and Transport',
      description: 'Provide immediate post-cardiac arrest care and coordinate transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Assess return of spontaneous circulation (ROSC): pulse, blood pressure, EtCO2 >40',
        'Support blood pressure: target SBP >90 mmHg with fluids/vasopressors',
        'Maintain oxygen saturation 94-98%, avoid hyperoxia',
        'Consider targeted temperature management (32-36°C)',
        'Obtain 12-lead ECG and treat STEMI with urgent catheterization',
        'Avoid excessive ventilation post-ROSC',
        'Transport to appropriate facility with cardiac catheterization capabilities'
      ]
    }
  ],

  // 15. SEIZURE MANAGEMENT AND NEUROLOGICAL EMERGENCIES - Comprehensive neurological care
  'seizure-neurological-emergencies': [
    {
      id: 'seizure-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Seizure Protection',
      description: 'Ensure safety and protect patient during active seizure activity',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Ensure scene safety and move hazardous objects away from patient',
        'Do NOT restrain patient or force objects into mouth during seizure',
        'Position patient on left side if possible to maintain airway',
        'Protect head from injury with soft object (pillow, jacket)',
        'Note time of seizure onset and duration for documentation',
        'Clear airway only after seizure activity stops',
        'Observe and document seizure characteristics: focal vs generalized, tonic/clonic'
      ],
      contraindications: [
        'Never put objects in mouth during active seizure',
        'Do not restrain patient movements during seizure',
        'Avoid medications during active seizure unless status epilepticus'
      ],
      safetyNotes: [
        'Patient safety is priority during seizure - protect from injury',
        'Most seizures are self-limiting and stop within 2-5 minutes'
      ],
      equipmentNeeded: [
        'Soft materials for head protection',
        'Suction equipment',
        'Oxygen delivery devices',
        'Timing device'
      ]
    },
    {
      id: 'seizure-step-2',
      stepNumber: 2,
      title: 'Post-ictal Assessment and Airway Management',
      description: 'Assess patient condition after seizure and ensure airway patency',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Check responsiveness and neurological status post-seizure',
        'Assess airway patency and clear secretions if present',
        'Position patient in recovery position (left lateral) if unconscious',
        'Check for tongue bite, oral trauma, or aspiration',
        'Evaluate breathing rate, depth, and oxygen saturation',
        'Apply supplemental oxygen if SpO2 <94%',
        'Assess for postictal confusion, weakness, or speech difficulties'
      ],
      safetyNotes: [
        'Postictal period may last minutes to hours with altered mental status',
        'Patient may be combative or confused during postictal phase'
      ]
    },
    {
      id: 'seizure-step-3',
      stepNumber: 3,
      title: 'Neurological Assessment and Glasgow Coma Scale',
      description: 'Perform comprehensive neurological evaluation and document findings',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess level of consciousness using AVPU or Glasgow Coma Scale',
        'Check pupil size, equality, and reaction to light (PEARRL)',
        'Test motor function: grip strength, arm drift, leg strength',
        'Evaluate speech: clarity, content, comprehension',
        'Look for focal neurological deficits suggesting stroke',
        'Check blood glucose level - hypoglycemia can cause seizures',
        'Document baseline neurological status for hospital communication'
      ],
      equipmentNeeded: [
        'Penlight for pupil examination',
        'Blood glucose meter',
        'Neurological assessment tools',
        'Glasgow Coma Scale reference'
      ]
    },
    {
      id: 'seizure-step-4',
      stepNumber: 4,
      title: 'History Taking and Precipitating Factors',
      description: 'Obtain detailed seizure and medical history to guide treatment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Ask about seizure history: known epilepsy, previous seizures, medications',
        'Inquire about recent medication changes or non-compliance',
        'Assess for triggers: alcohol withdrawal, drug use, sleep deprivation',
        'Check for signs of infection: fever, neck stiffness, altered mental status',
        'Ask about recent head trauma, headaches, or neurological symptoms',
        'Obtain medication list: anticonvulsants, compliance, recent changes',
        'Document witness account of seizure onset and characteristics'
      ]
    },
    {
      id: 'seizure-step-5',
      stepNumber: 5,
      title: 'Status Epilepticus Recognition and Treatment',
      description: 'Identify and treat prolonged seizures requiring immediate intervention',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Status epilepticus: continuous seizure >5 minutes OR recurrent seizures without recovery',
        'Establish IV access immediately for medication administration',
        'FIRST-LINE: Lorazepam 0.1 mg/kg IV (max 4mg) OR Midazolam 10mg IM',
        'SECOND-LINE: Fosphenytoin 20 mg PE/kg IV if seizures continue',
        'Consider thiamine 100mg IV if alcohol use suspected',
        'Dextrose 25g IV (D50W) if hypoglycemic <60 mg/dL',
        'Prepare for intubation if prolonged seizures or respiratory compromise'
      ],
      contraindications: [
        'Avoid phenytoin in elderly or cardiac patients (use fosphenytoin)',
        'Do not give dextrose without thiamine in suspected alcoholics'
      ],
      safetyNotes: [
        'Status epilepticus is a medical emergency requiring immediate treatment',
        'Prolonged seizures can cause permanent neurological damage'
      ]
    },
    {
      id: 'seizure-step-6',
      stepNumber: 6,
      title: 'Vital Signs Monitoring and Support',
      description: 'Monitor physiological parameters and provide supportive care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Monitor vital signs every 5 minutes: BP, pulse, respirations, temperature',
        'Assess oxygen saturation continuously and titrate oxygen therapy',
        'Check blood pressure for hypertension (common post-seizure)',
        'Monitor for hyperthermia - cooling measures if temperature >38.5°C',
        'Establish IV access for fluid support and medication administration',
        'Consider cardiac monitoring for rhythm abnormalities',
        'Document neurological improvement or deterioration'
      ]
    },
    {
      id: 'seizure-step-7',
      stepNumber: 7,
      title: 'Differential Diagnosis Consideration',
      description: 'Consider alternative diagnoses and underlying causes',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Metabolic causes: hypoglycemia, hyponatremia, hypocalcemia, uremia',
        'Toxic causes: alcohol withdrawal, drug overdose, carbon monoxide',
        'Infectious causes: meningitis, encephalitis, brain abscess',
        'Vascular causes: stroke, intracerebral hemorrhage, hypertensive emergency',
        'Structural causes: brain tumor, head trauma, increased intracranial pressure',
        'Consider pseudoseizures (non-epileptic events) in appropriate patients',
        'Evaluate for precipitating factors: medication non-compliance, illness'
      ]
    },
    {
      id: 'seizure-step-8',
      stepNumber: 8,
      title: 'Transport and Communication',
      description: 'Prepare for transport and communicate with receiving facility',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Transport to appropriate facility - consider neurology capabilities',
        'Provide detailed report: seizure type, duration, medications given',
        'Continue neurological monitoring during transport',
        'Be prepared for recurrent seizures during transport',
        'Document medication administration times and patient response',
        'Consider air medical transport for status epilepticus or unstable patient',
        'Prepare family/caregivers for patient condition and hospital course'
      ]
    }
  ],

  // 16. DIABETIC EMERGENCY MANAGEMENT - Comprehensive glucose disorder management
  'diabetic-emergency-management': [
    {
      id: 'diabetic-step-1',
      stepNumber: 1,
      title: 'Initial Assessment and Blood Glucose Testing',
      description: 'Rapidly assess patient and obtain blood glucose measurement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess level of consciousness using AVPU scale or Glasgow Coma Scale',
        'Check for diabetic medical alert bracelet or medical history',
        'Obtain blood glucose level immediately using glucometer',
        'Normal range: 80-120 mg/dL (4.4-6.7 mmol/L)',
        'Hypoglycemia: <70 mg/dL (3.9 mmol/L), severe <40 mg/dL (2.2 mmol/L)',
        'Hyperglycemia: >180 mg/dL (10.0 mmol/L), severe >400 mg/dL (22.2 mmol/L)',
        'Document exact glucose reading and time of measurement'
      ],
      equipmentNeeded: [
        'Blood glucose meter',
        'Test strips (not expired)',
        'Lancets',
        'Alcohol swabs',
        'Gloves'
      ],
      safetyNotes: [
        'Use universal precautions when handling blood samples',
        'Ensure glucometer is calibrated and functioning properly'
      ]
    },
    {
      id: 'diabetic-step-2',
      stepNumber: 2,
      title: 'Hypoglycemia Recognition and Assessment',
      description: 'Identify signs and symptoms of hypoglycemic emergency',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Classic symptoms: confusion, diaphoresis, tremors, weakness, hunger',
        'Neurological signs: altered mental status, combativeness, seizures',
        'Autonomic symptoms: tachycardia, pallor, anxiety, trembling',
        'Severe hypoglycemia: unconsciousness, coma, focal neurological deficits',
        'Ask about recent insulin use, missed meals, increased activity',
        'Check for signs of recent seizure activity or trauma',
        'Assess airway protection in unconscious patients'
      ],
      safetyNotes: [
        'Hypoglycemic patients may be combative or unpredictable',
        'Severe hypoglycemia can mimic stroke symptoms'
      ]
    },
    {
      id: 'diabetic-step-3',
      stepNumber: 3,
      title: 'Hypoglycemia Treatment Protocol',
      description: 'Provide appropriate glucose replacement therapy based on consciousness level',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'CONSCIOUS PATIENT: Oral glucose 15g (glucose gel, tablets, or juice)',
        'UNCONSCIOUS PATIENT: Dextrose 25g IV (D50W 50ml) or D25W 100ml',
        'ALTERNATIVE: Glucagon 1mg IM if IV access unavailable',
        'Pediatric dosing: D25W 2-4 mL/kg IV or glucagon 0.5mg IM if <20kg',
        'Recheck blood glucose in 15 minutes after treatment',
        'Repeat treatment if glucose remains <70 mg/dL',
        'Consider thiamine 100mg IV before glucose in suspected alcoholics'
      ],
      contraindications: [
        'Do not give oral glucose to unconscious patients (aspiration risk)',
        'Avoid concentrated dextrose in severe dehydration without fluid replacement'
      ],
      equipmentNeeded: [
        'Oral glucose gel or tablets',
        'Dextrose 50% or 25% in water',
        'IV access supplies',
        'Glucagon injection',
        'Thiamine injection'
      ]
    },
    {
      id: 'diabetic-step-4',
      stepNumber: 4,
      title: 'Hyperglycemia and DKA Assessment',
      description: 'Evaluate for hyperglycemic emergencies and diabetic ketoacidosis',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Signs of DKA: fruity breath odor, deep rapid breathing (Kussmaul respirations)',
        'Symptoms: polyuria, polydipsia, nausea, vomiting, abdominal pain',
        'Dehydration signs: poor skin turgor, dry mucous membranes, tachycardia',
        'Mental status: confusion, lethargy, or coma in severe cases',
        'Ask about medication compliance, recent illness, or stress',
        'Check for precipitating factors: infection, MI, medication non-compliance',
        'Consider hyperglycemic hyperosmolar state (HHS) in elderly patients'
      ]
    },
    {
      id: 'diabetic-step-5',
      stepNumber: 5,
      title: 'Hyperglycemic Emergency Treatment',
      description: 'Provide supportive care and fluid resuscitation for hyperglycemic patients',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Establish large bore IV access (14-16 gauge) for fluid resuscitation',
        'Begin normal saline infusion: 500-1000mL bolus, then 250-500mL/hr',
        'Do NOT give insulin in prehospital setting - can cause rapid fluid shifts',
        'Monitor vital signs closely during fluid resuscitation',
        'Support airway and breathing - may require intubation if comatose',
        'Treat underlying precipitating causes if identified',
        'Prepare for transport to facility with endocrinology capabilities'
      ],
      safetyNotes: [
        'Rapid correction of hyperglycemia can cause cerebral edema',
        'Monitor for fluid overload in elderly or cardiac patients'
      ]
    },
    {
      id: 'diabetic-step-6',
      stepNumber: 6,
      title: 'Monitoring and Reassessment',
      description: 'Continuously monitor patient response and glucose levels',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Recheck blood glucose every 15 minutes after hypoglycemia treatment',
        'Monitor neurological status for improvement or deterioration',
        'Assess vital signs every 5 minutes during active treatment',
        'Watch for signs of cerebral edema: headache, altered mental status',
        'Document patient response to treatment interventions',
        'Be prepared for recurrent hypoglycemia after initial treatment',
        'Monitor for complications: seizures, cardiac arrhythmias, aspiration'
      ]
    },
    {
      id: 'diabetic-step-7',
      stepNumber: 7,
      title: 'Patient Education and Discharge Considerations',
      description: 'Provide appropriate education and assess need for transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'For resolved hypoglycemia: ensure patient has eaten substantial meal',
        'Educate about hypoglycemia prevention and recognition of symptoms',
        'Discuss medication timing, meal schedules, and activity modifications',
        'Assess home support system and ability to self-care',
        'Consider transport if: recurrent hypoglycemia, underlying illness, elderly',
        'Document patient education provided and discharge instructions',
        'Ensure follow-up with primary care physician or endocrinologist'
      ],
      contraindications: [
        'Transport required if altered mental status persists',
        'Do not discharge if patient lives alone and at risk for recurrence'
      ]
    },
    {
      id: 'diabetic-step-8',
      stepNumber: 8,
      title: 'Transport Decision and Communication',
      description: 'Determine appropriate destination and communicate with receiving facility',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Transport all hyperglycemic emergencies and severe hypoglycemia',
        'Consider emergency department vs endocrinology unit based on severity',
        'Provide detailed report: glucose levels, treatments given, patient response',
        'Continue monitoring during transport with frequent glucose checks',
        'Document medication administration times and patient response',
        'Communicate any complications or changes in patient condition',
        'Prepare family for possible hospital admission and treatment course'
      ]
    }
  ],

  // 17. ANAPHYLAXIS AND ALLERGIC REACTION MANAGEMENT - Life-threatening allergy treatment
  'anaphylaxis-allergic-reaction': [
    {
      id: 'anaphylaxis-step-1',
      stepNumber: 1,
      title: 'Rapid Assessment and Recognition',
      description: 'Quickly identify signs of anaphylaxis and assess severity',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess airway: look for lip/tongue swelling, hoarseness, stridor',
        'Check breathing: wheeze, dyspnea, cyanosis, respiratory distress',
        'Evaluate circulation: weak pulse, hypotension, skin color changes',
        'Examine skin: urticaria (hives), flushing, angioedema, pruritus',
        'Note onset time: anaphylaxis typically occurs within minutes of exposure',
        'Ask about known allergies and recent exposures to allergens',
        'Identify life-threatening signs requiring immediate epinephrine'
      ],
      safetyNotes: [
        'Anaphylaxis can progress rapidly - immediate treatment is critical',
        'Biphasic reactions can occur 4-12 hours after initial symptoms'
      ],
      equipmentNeeded: [
        'Stethoscope for lung assessment',
        'Blood pressure cuff',
        'Pulse oximeter',
        'Visual inspection tools'
      ]
    },
    {
      id: 'anaphylaxis-step-2',
      stepNumber: 2,
      title: 'Immediate Epinephrine Administration',
      description: 'Administer epinephrine as first-line treatment for anaphylaxis',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Epinephrine 0.3-0.5mg (1:1000) IM into lateral thigh (vastus lateralis)',
        'Pediatric dosing: 0.01 mg/kg IM (maximum 0.3mg for children)',
        'Use EpiPen or draw up from vial - IM injection preferred over IV',
        'Inject through clothing if necessary - do not delay for skin prep',
        'Massage injection site to improve absorption',
        'Note exact time of epinephrine administration',
        'Prepare second dose - may repeat in 5-15 minutes if no improvement'
      ],
      contraindications: [
        'No absolute contraindications in anaphylaxis - epinephrine is life-saving',
        'Relative caution in elderly with coronary artery disease'
      ],
      safetyNotes: [
        'IM route preferred over IV - faster onset, safer administration',
        'Do not delay epinephrine for IV access or other interventions'
      ],
      equipmentNeeded: [
        'Epinephrine 1:1000 (1mg/mL)',
        'EpiPen auto-injectors',
        'IM syringes and needles',
        'Alcohol swabs'
      ]
    },
    {
      id: 'anaphylaxis-step-3',
      stepNumber: 3,
      title: 'Airway Management and Oxygen Therapy',
      description: 'Secure airway and provide high-flow oxygen support',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Position patient: sitting up if conscious, supine if hypotensive',
        'Administer high-flow oxygen via non-rebreather mask at 15 L/min',
        'Monitor for upper airway obstruction from angioedema',
        'Prepare for advanced airway if severe laryngeal edema present',
        'Consider bag-mask ventilation if respiratory failure develops',
        'Have cricothyrotomy kit available for complete airway obstruction',
        'Continuously monitor oxygen saturation and respiratory effort'
      ],
      contraindications: [
        'Avoid laying flat if patient has respiratory distress',
        'Do not delay airway intervention if obstruction developing'
      ]
    },
    {
      id: 'anaphylaxis-step-4',
      stepNumber: 4,
      title: 'IV Access and Fluid Resuscitation',
      description: 'Establish vascular access and treat hypotension',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Establish large bore IV access (14-16 gauge) - two lines if possible',
        'Begin normal saline or lactated Ringer\'s fluid resuscitation',
        'Adults: 500-1000mL bolus initially, then titrate to blood pressure',
        'Pediatric: 20 mL/kg bolus, may repeat based on response',
        'Target systolic BP >90 mmHg in adults, age-appropriate in children',
        'Monitor for fluid overload in elderly or cardiac patients',
        'Consider vasopressor support if fluid-refractory hypotension'
      ]
    },
    {
      id: 'anaphylaxis-step-5',
      stepNumber: 5,
      title: 'Secondary Medication Administration',
      description: 'Administer adjunctive medications to support epinephrine therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'DIPHENHYDRAMINE: 25-50mg IV/IM (1mg/kg pediatric, max 50mg)',
        'METHYLPREDNISOLONE: 125mg IV (1-2mg/kg pediatric) for severe reactions',
        'H2 BLOCKER: Famotidine 20mg IV or ranitidine 50mg IV if available',
        'ALBUTEROL: 2.5mg nebulized for bronchospasm/wheezing',
        'GLUCAGON: 1-2mg IV if patient on beta-blockers and epinephrine ineffective',
        'Monitor patient response to each medication',
        'Document medication administration times and dosages'
      ],
      safetyNotes: [
        'Antihistamines and steroids are adjuncts - never replace epinephrine',
        'Glucagon may be needed if patient takes beta-blockers'
      ]
    },
    {
      id: 'anaphylaxis-step-6',
      stepNumber: 6,
      title: 'Continuous Monitoring and Reassessment',
      description: 'Monitor patient response and watch for biphasic reactions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor vital signs every 5 minutes: BP, pulse, respirations, O2 sat',
        'Reassess airway patency and breathing adequacy continuously',
        'Watch for improvement in skin findings: hives, flushing, swelling',
        'Be prepared to repeat epinephrine if symptoms recur or worsen',
        'Monitor for biphasic reaction: symptom return 4-12 hours later',
        'Assess need for additional fluid boluses based on blood pressure',
        'Document patient response to treatments and trending vital signs'
      ]
    },
    {
      id: 'anaphylaxis-step-7',
      stepNumber: 7,
      title: 'Allergen Identification and Avoidance',
      description: 'Identify triggering allergen and prevent continued exposure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Question patient about recent food intake: nuts, shellfish, medications',
        'Ask about insect stings, latex exposure, or environmental allergens',
        'Check for recent medication administration or new prescriptions',
        'Remove or discontinue suspected allergen if still present',
        'Document suspected trigger for future avoidance',
        'Educate patient about allergen avoidance strategies',
        'Consider need for allergy/immunology referral'
      ]
    },
    {
      id: 'anaphylaxis-step-8',
      stepNumber: 8,
      title: 'Transport and Disposition',
      description: 'Coordinate transport and provide comprehensive care plan',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Transport ALL anaphylaxis patients to emergency department',
        'Continue monitoring during transport - reactions can recur',
        'Bring any remaining allergen or medication containers',
        'Provide detailed report including trigger, treatments, and response',
        'Ensure patient has EpiPen prescription before discharge (if appropriate)',
        'Educate about biphasic reactions and when to seek immediate care',
        'Consider observation period of 6-8 hours minimum in hospital'
      ],
      contraindications: [
        'Never discharge anaphylaxis patients from scene',
        'All patients require hospital evaluation regardless of improvement'
      ]
    }
  ],

  // 18. STROKE ASSESSMENT AND MANAGEMENT - Time-critical neurological emergency care
  'stroke-assessment-management': [
    {
      id: 'stroke-step-1',
      stepNumber: 1,
      title: 'Rapid Stroke Recognition and FAST Assessment',
      description: 'Quickly identify stroke symptoms using standardized assessment tools',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Use FAST assessment: Face drooping, Arm weakness, Speech difficulty, Time to call 911',
        'FACE: Ask patient to smile - look for facial droop or asymmetry',
        'ARMS: Ask patient to raise both arms - check for drift or weakness',
        'SPEECH: Ask patient to repeat simple phrase - assess for slurred speech or aphasia',
        'TIME: Note exact time of symptom onset or last known normal time',
        'Additional signs: sudden severe headache, vision loss, confusion, balance problems',
        'Consider BE-FAST: Balance, Eyes, Face, Arms, Speech, Time for posterior circulation'
      ],
      safetyNotes: [
        'Time of onset critical for treatment decisions - document precisely',
        'Stroke symptoms can be subtle - maintain high index of suspicion'
      ],
      equipmentNeeded: [
        'Penlight for pupil assessment',
        'Watch for timing symptoms',
        'Stroke assessment scale reference',
        'Blood pressure monitoring equipment'
      ]
    },
    {
      id: 'stroke-step-2',
      stepNumber: 2,
      title: 'Detailed Neurological Examination',
      description: 'Perform comprehensive neurological assessment to characterize deficits',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Level of consciousness: use AVPU or Glasgow Coma Scale',
        'Pupil assessment: size, equality, reaction to light (PEARRL)',
        'Motor function: test grip strength, arm drift, leg strength bilaterally',
        'Sensory function: test light touch and pain sensation',
        'Speech evaluation: fluency, comprehension, repetition, naming',
        'Visual fields: test peripheral vision by confrontation',
        'Cranial nerves: facial symmetry, swallow, gag reflex'
      ],
      equipmentNeeded: [
        'Penlight',
        'Safety pin for pain testing',
        'Tongue depressor',
        'Neurological assessment tools'
      ]
    },
    {
      id: 'stroke-step-3',
      stepNumber: 3,
      title: 'Cincinnati Prehospital Stroke Scale (CPSS)',
      description: 'Apply validated prehospital stroke assessment scale',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'FACIAL DROOP: "Show me your teeth" or "Smile for me"',
        '- Normal: both sides of face move equally',
        '- Abnormal: one side does not move as well as the other',
        'ARM DRIFT: "Close your eyes and hold both arms out for 10 seconds"',
        '- Normal: both arms move same or both arms do not move',
        '- Abnormal: one arm drifts down compared to the other',
        'SPEECH: "The sky is blue in Cincinnati" or "It is a sunny day"',
        '- Normal: uses correct words with no slurring',
        '- Abnormal: slurred or inappropriate words or mute'
      ],
      safetyNotes: [
        'If any one of the three signs is abnormal, probability of stroke is 72%',
        'All three abnormal increases stroke probability to 85%'
      ]
    },
    {
      id: 'stroke-step-4',
      stepNumber: 4,
      title: 'Vital Signs and Blood Glucose Assessment',
      description: 'Obtain baseline vital signs and rule out hypoglycemia',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Blood pressure: often elevated in acute stroke - avoid aggressive reduction',
        'Heart rate and rhythm: assess for atrial fibrillation (stroke risk factor)',
        'Oxygen saturation: apply supplemental oxygen if SpO2 <94%',
        'Blood glucose: rule out hypoglycemia as stroke mimic (<70 mg/dL)',
        'Temperature: hyperthermia worsens stroke outcomes',
        'Respiratory rate and pattern: assess for signs of increased ICP',
        'Document all vital signs for hospital communication'
      ],
      contraindications: [
        'Do not aggressively lower blood pressure in acute stroke',
        'Avoid excessive oxygen unless hypoxic (may worsen outcomes)'
      ]
    },
    {
      id: 'stroke-step-5',
      stepNumber: 5,
      title: 'History and Stroke Mimics Assessment',
      description: 'Obtain relevant history and consider alternative diagnoses',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Time of onset: exact time symptoms started or last known normal',
        'Current medications: especially anticoagulants, antiplatelets',
        'Medical history: previous stroke, atrial fibrillation, diabetes, hypertension',
        'Recent procedures: surgery, catheterization, anticoagulation',
        'Stroke mimics to consider: hypoglycemia, seizure, migraine, infection',
        'Functional baseline: what was patient\'s normal neurological status?',
        'Witness account: progression and character of symptoms'
      ]
    },
    {
      id: 'stroke-step-6',
      stepNumber: 6,
      title: 'Airway Protection and Supportive Care',
      description: 'Ensure airway safety and provide appropriate supportive measures',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess swallow function - place patient NPO (nothing by mouth)',
        'Position patient: head of bed elevated 30 degrees if no spinal injury',
        'Monitor for aspiration risk - have suction immediately available',
        'Consider advanced airway if GCS <8 or inability to protect airway',
        'IV access: normal saline at keep-open rate (avoid fluid overload)',
        'Avoid hyperventilation unless signs of herniation',
        'Monitor neurological status continuously for changes'
      ],
      safetyNotes: [
        'Stroke patients at high risk for aspiration - maintain NPO status',
        'Avoid aggressive fluid resuscitation unless hypotensive'
      ]
    },
    {
      id: 'stroke-step-7',
      stepNumber: 7,
      title: 'Hospital Notification and Transport Decision',
      description: 'Coordinate with stroke center and determine appropriate destination',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Notify stroke center immediately - provide stroke alert notification',
        'Report: age, time of onset, FAST/CPSS findings, vital signs, glucose',
        'Transport to Primary Stroke Center if within 4.5 hours of onset',
        'Consider Comprehensive Stroke Center for large vessel occlusion',
        'Endovascular-capable center if severe deficits and <24 hours',
        'Include family member familiar with patient\'s baseline',
        'Continue monitoring during transport - neurological changes can occur'
      ],
      safetyNotes: [
        'Time is brain - minimize on-scene time for stroke patients',
        'Pre-hospital notification allows hospital stroke team activation'
      ]
    },
    {
      id: 'stroke-step-8',
      stepNumber: 8,
      title: 'Ongoing Monitoring and Documentation',
      description: 'Provide continuous assessment and comprehensive documentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Serial neurological assessments every 10-15 minutes during transport',
        'Monitor for signs of increasing intracranial pressure',
        'Watch for seizure activity - common complication of stroke',
        'Document exact timing: symptom onset, assessment findings, transport',
        'Note any improvement or worsening of neurological deficits',
        'Communicate any changes in status to receiving stroke team',
        'Prepare family for potential procedures: CT, tPA, thrombectomy'
      ]
    }
  ],

  // 19. PSYCHIATRIC EMERGENCY MANAGEMENT - Mental health crisis intervention
  'psychiatric-emergency-management': [
    {
      id: 'psychiatric-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Risk Assessment',
      description: 'Ensure safety and assess potential dangers in psychiatric emergency',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess scene for weapons, drugs, or potential violence before approach',
        'Position yourself near exit routes and maintain safe distance initially',
        'Request law enforcement backup if violence threatened or suspected',
        'Remove potential weapons or harmful objects from patient area',
        'Assess patient\'s level of agitation, cooperation, and reality orientation',
        'Consider need for physical or chemical restraints if immediate danger',
        'Ensure adequate personnel available for patient control if needed'
      ],
      contraindications: [
        'Do not approach agitated or violent patient without adequate backup',
        'Never turn your back on potentially dangerous psychiatric patient',
        'Avoid isolated areas when dealing with unpredictable patients'
      ],
      safetyNotes: [
        'Safety of crew and bystanders is paramount in psychiatric emergencies',
        'Maintain situational awareness throughout entire encounter'
      ],
      equipmentNeeded: [
        'Communication device for law enforcement',
        'Soft restraints if indicated',
        'Medications for chemical sedation'
      ]
    },
    {
      id: 'psychiatric-step-2',
      stepNumber: 2,
      title: 'Mental Status Examination',
      description: 'Perform systematic mental status assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Appearance: hygiene, dress, grooming, psychomotor activity',
        'Behavior: cooperation, eye contact, unusual movements or gestures',
        'Speech: rate, volume, tone, coherence, spontaneous vs. responsive',
        'Mood and Affect: patient\'s stated mood vs. observed emotional state',
        'Thought Process: logical, goal-directed vs. circumstantial, tangential',
        'Thought Content: delusions, obsessions, suicidal/homicidal ideation',
        'Perception: hallucinations (auditory, visual, tactile, olfactory)',
        'Cognition: orientation to person, place, time, memory, concentration'
      ],
      safetyNotes: [
        'Document exact quotes when assessing thought content',
        'Be direct but non-confrontational when asking about suicidal thoughts'
      ]
    },
    {
      id: 'psychiatric-step-3',
      stepNumber: 3,
      title: 'Suicide Risk Assessment',
      description: 'Evaluate immediate suicide risk using standardized approach',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Ask directly: "Are you thinking about hurting or killing yourself?"',
        'Assess plan specificity: method, location, timing, means availability',
        'Evaluate intent: "How likely are you to act on these thoughts?"',
        'Review risk factors: previous attempts, family history, recent losses',
        'Assess protective factors: family support, religious beliefs, future plans',
        'Consider access to lethal means: firearms, medications, heights',
        'Document exact words used when discussing suicidal ideation'
      ],
      contraindications: [
        'Never dismiss or minimize suicidal statements',
        'Do not promise confidentiality when safety is at risk',
        'Avoid asking "why" questions that may seem judgmental'
      ]
    },
    {
      id: 'psychiatric-step-4',
      stepNumber: 4,
      title: 'Medical Clearance Assessment',
      description: 'Rule out medical causes of psychiatric symptoms',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Vital signs: fever may indicate infection affecting mental status',
        'Blood glucose: hypoglycemia can mimic psychiatric symptoms',
        'Neurological exam: focal deficits may suggest organic cause',
        'History of head trauma, seizures, or medical conditions',
        'Current medications: psychiatric, cardiac, pain medications',
        'Substance use: alcohol, drugs, prescription medication abuse',
        'Review systems: headache, vision changes, weakness, confusion'
      ],
      equipmentNeeded: [
        'Blood glucose meter',
        'Blood pressure cuff',
        'Thermometer',
        'Neurological assessment tools'
      ]
    },
    {
      id: 'psychiatric-step-5',
      stepNumber: 5,
      title: 'De-escalation and Therapeutic Communication',
      description: 'Use verbal techniques to calm and reassure patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Introduce yourself and explain your role calmly',
        'Use open-ended questions: "Can you tell me what\'s happening?"',
        'Active listening: reflect and validate patient\'s feelings',
        'Avoid arguing with delusions - neither agree nor disagree',
        'Set clear, reasonable limits: "I need you to sit down so I can help"',
        'Offer choices when possible: "Would you like to sit here or there?"',
        'Use calm, non-threatening tone and body language',
        'Acknowledge patient\'s distress: "I can see this is very difficult"'
      ],
      safetyNotes: [
        'Remain calm and non-confrontational throughout interaction',
        'If de-escalation fails, be prepared to use restraints or medication'
      ]
    },
    {
      id: 'psychiatric-step-6',
      stepNumber: 6,
      title: 'Chemical Sedation (if indicated)',
      description: 'Administer appropriate medications for severe agitation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Indications: imminent danger to self/others, severe agitation preventing care',
        'HALOPERIDOL: 5-10mg IM (typical antipsychotic)',
        'LORAZEPAM: 2-4mg IM (benzodiazepine for anxiety/agitation)',
        'OLANZAPINE: 10mg IM (atypical antipsychotic, less EPS)',
        'Combination therapy: haloperidol 5mg + lorazepam 2mg IM',
        'Monitor for respiratory depression, especially with benzodiazepines',
        'Be prepared for paradoxical reactions or extrapyramidal side effects'
      ],
      contraindications: [
        'Avoid benzodiazepines in suspected alcohol or drug intoxication',
        'Use caution with antipsychotics in elderly patients',
        'Monitor airway and breathing closely after sedation'
      ]
    },
    {
      id: 'psychiatric-step-7',
      stepNumber: 7,
      title: 'Physical Restraints (last resort)',
      description: 'Apply restraints safely when patient poses immediate danger',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Use only when immediate danger exists and other methods failed',
        'Minimum 4 people: one for each extremity, one for head control',
        'Apply soft restraints to all four extremities simultaneously',
        'Secure patient supine or side-lying - never prone position',
        'Check circulation, sensation, movement every 15 minutes',
        'Monitor airway and breathing continuously',
        'Document medical necessity and alternatives attempted',
        'Remove restraints as soon as safely possible'
      ],
      contraindications: [
        'Never use restraints as punishment or for convenience',
        'Avoid prone restraint - risk of positional asphyxia',
        'Do not restrain patients with respiratory compromise'
      ]
    },
    {
      id: 'psychiatric-step-8',
      stepNumber: 8,
      title: 'Transport and Disposition',
      description: 'Coordinate appropriate transport and receiving facility',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Transport all patients with suicidal ideation or severe mental illness',
        'Emergency department for medical clearance before psychiatric evaluation',
        'Consider specialized psychiatric emergency services if available',
        'Maintain continuous observation during transport',
        'Remove potential self-harm objects from patient compartment',
        'Document detailed mental status and risk assessment findings',
        'Provide thorough report to receiving psychiatric team',
        'Consider law enforcement escort if patient remains dangerous'
      ]
    }
  ]
};

// Skill metadata with enhanced information
export const criticalSkillsMetadata = {
  'basic-airway-management': {
    name: 'Basic Airway Management',
    category: 'airway',
    difficultyLevel: 'BEGINNER',
    timeEstimateMinutes: 5,
    isCritical: true,
    objectives: [
      'Perform systematic airway assessment using visual and auditory techniques',
      'Apply appropriate manual airway positioning techniques',
      'Select and insert correct airway adjuncts based on patient consciousness',
      'Provide appropriate oxygen therapy and continuous monitoring',
      'Recognize indications for advanced airway intervention'
    ],
    indications: [
      'Respiratory distress or failure',
      'Altered level of consciousness affecting airway protection',
      'Visible airway obstruction',
      'Inadequate oxygenation or ventilation',
      'Unconscious patient requiring airway support'
    ],
    contraindications: [
      'Alert patient with patent airway requiring no intervention',
      'Suspected cervical spine injury (modify technique to jaw thrust)',
      'Basilar skull fracture (contraindication for nasopharyngeal airway)'
    ],
    equipment: [
      'Pulse oximeter',
      'Stethoscope',
      'Portable suction unit with catheters',
      'Oropharyngeal airways (various sizes)',
      'Nasopharyngeal airways (various sizes)',
      'Water-soluble lubricant',
      'Oxygen source and delivery devices',
      'Bag-mask device'
    ]
  },
  'advanced-airway-management': {
    name: 'Advanced Airway Management',
    category: 'airway',
    difficultyLevel: 'ADVANCED',
    timeEstimateMinutes: 12,
    isCritical: true,
    objectives: [
      'Perform systematic airway assessment using LEMON criteria',
      'Execute effective one-person and two-person bag-mask ventilation techniques',
      'Make evidence-based decisions regarding advanced airway interventions',
      'Monitor ventilation effectiveness using clinical and technological parameters',
      'Recognize indications and contraindications for endotracheal intubation'
    ],
    indications: [
      'Respiratory failure or arrest',
      'Inadequate spontaneous ventilation',
      'Need for positive pressure ventilation',
      'Unconscious patient unable to protect airway',
      'Cardiac arrest requiring ventilatory support'
    ],
    contraindications: [
      'Patient with adequate spontaneous respirations',
      'Suspected complete upper airway obstruction (consider surgical airway)',
      'Severe facial trauma preventing mask seal (consider alternative airway)'
    ],
    equipment: [
      'Bag-mask device with oxygen reservoir',
      'Oxygen source (15 L/min capability)',
      'EtCO2 monitoring with adaptor',
      'Clear face masks (multiple sizes)',
      'Pressure manometer',
      'Suction equipment',
      'Bacterial filters',
      'Alternative airway devices (supraglottic airways)',
      'Intubation equipment (if indicated)',
      'Pulse oximeter'
    ]
  },
  'trauma-assessment': {
    name: 'Trauma Assessment',
    category: 'trauma',
    difficultyLevel: 'INTERMEDIATE',
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Perform systematic primary survey using ABCDE protocol to identify life-threatening injuries',
      'Execute appropriate interventions for life-threatening conditions as they are identified',
      'Conduct comprehensive secondary survey using DCAP-BTLS assessment methodology',
      'Gather pertinent medical history using SAMPLE format and document mechanism of injury',
      'Demonstrate proper spinal immobilization techniques and ongoing patient monitoring',
      'Make appropriate transport decisions based on assessment findings and patient stability'
    ],
    indications: [
      'Any patient with suspected traumatic injury',
      'Motor vehicle crashes, falls, penetrating injuries',
      'Unconscious patient with unknown mechanism of injury',
      'Any patient requiring rapid trauma assessment',
      'Multi-system trauma or mechanism suggesting significant force'
    ],
    contraindications: [
      'Unsafe scene conditions preventing safe patient access',
      'Active violence or hazardous materials requiring specialized response',
      'Patient in immediate need of extrication before assessment can begin'
    ],
    equipment: [
      'Personal protective equipment (PPE)',
      'Cervical collar and spinal immobilization devices',
      'Oxygen delivery devices and suction equipment',
      'Hemorrhage control supplies (tourniquets, pressure bandages)',
      'Vital signs equipment and pulse oximeter',
      'Trauma shears and assessment tools',
      'IV supplies and isotonic fluids',
      'Occlusive dressings and chest decompression kit',
      'Communication equipment for hospital contact',
      'Warm blankets and hypothermia prevention supplies'
    ]
  },
  'cardiac-monitoring-12-lead-ecg': {
    name: 'Cardiac Monitoring and 12-Lead ECG',
    category: 'cardiac',
    difficultyLevel: 'INTERMEDIATE',
    timeEstimateMinutes: 15,
    isCritical: true,
    objectives: [
      'Demonstrate proper 12-lead ECG electrode placement using anatomical landmarks',
      'Acquire high-quality ECG tracings with minimal artifact and technical errors',
      'Perform basic ECG interpretation focusing on rate, rhythm, and ST-segment changes',
      'Identify STEMI criteria and activate appropriate cardiac alert protocols',
      'Correlate ECG findings with clinical presentation for treatment decisions',
      'Establish continuous cardiac monitoring and perform serial ECG assessments'
    ],
    indications: [
      'Chest pain or cardiac symptoms',
      'Suspected acute coronary syndrome',
      'Syncope or near-syncope episodes',
      'Shortness of breath of cardiac origin',
      'Palpitations or arrhythmia symptoms',
      'Drug overdose affecting cardiac function',
      'Electrolyte imbalances',
      'Pre-hospital cardiac arrest workup'
    ],
    contraindications: [
      'Patient safety concerns preventing safe electrode placement',
      'Severe combativeness preventing patient cooperation',
      'Immediate life-threatening conditions requiring priority intervention'
    ],
    equipment: [
      'Calibrated 12-lead ECG machine',
      'Disposable ECG electrodes with conductive gel',
      'Lead wires and cable sets',
      'Disposable razors for hair removal',
      'Alcohol prep pads for skin cleaning',
      'ECG paper or digital storage capability',
      'Transmission equipment for hospital communication',
      'Continuous monitoring electrodes',
      'ECG interpretation reference guides',
      'Documentation materials'
    ]
  },
  'iv-io-access-medication-administration': {
    name: 'IV/IO Access and Medication Administration',
    category: 'vascular-access',
    difficultyLevel: 'INTERMEDIATE',
    timeEstimateMinutes: 18,
    isCritical: true,
    objectives: [
      'Demonstrate proper peripheral IV cannulation technique with appropriate site selection',
      'Perform intraosseous (IO) access insertion using anatomical landmarks and sterile technique',
      'Calculate medication dosages accurately using standardized formulas and safety checks',
      'Administer medications safely through IV/IO routes with appropriate monitoring',
      'Recognize and manage complications related to vascular access and medication administration',
      'Maintain access integrity and perform ongoing assessment of treatment response'
    ],
    indications: [
      'Need for medication administration (emergency drugs, analgesics, fluids)',
      'Cardiac arrest requiring rapid vascular access',
      'Severe dehydration or shock requiring fluid resuscitation',
      'Difficult IV access in emergency situations',
      'Pediatric patients where IV access is challenging',
      'Need for blood sampling in critical patients'
    ],
    contraindications: [
      'Infection or cellulitis at proposed insertion site',
      'Fracture or compartment syndrome at insertion site',
      'Known medication allergies without appropriate alternatives',
      'Coagulopathy with high bleeding risk (relative contraindication)',
      'Previous IO site or hardware at proposed IO location'
    ],
    equipment: [
      'IV catheters (14G, 16G, 18G, 20G, 22G, 24G)',
      'IO insertion devices (EZ-IO, FAST-1, or manual devices)',
      'Tourniquet and antiseptic preparation supplies',
      'IV tubing, saline flushes, and IV bags',
      'Syringes, needles, and medication calculation aids',
      'Local anesthetic (lidocaine 1%)',
      'Pressure bags for rapid infusion',
      'Securing tape, transparent dressings',
      'Emergency medications for adverse reactions',
      'Continuous monitoring equipment'
    ]
  },
  'oxygen-therapy-pulse-oximetry': {
    name: 'Oxygen Therapy and Pulse Oximetry',
    category: 'respiratory',
    difficultyLevel: 'BEGINNER',
    timeEstimateMinutes: 12,
    isCritical: true,
    objectives: [
      'Perform accurate respiratory assessment and pulse oximetry monitoring',
      'Select appropriate oxygen delivery device based on patient condition and oxygen requirements',
      'Apply nasal cannula and non-rebreather masks with proper technique',
      'Titrate oxygen therapy to achieve appropriate saturation targets',
      'Monitor patient response to oxygen therapy and adjust treatment accordingly',
      'Maintain oxygen equipment safety and ensure proper function during transport'
    ],
    indications: [
      'Hypoxemia (SpO2 <90% or clinical signs of hypoxia)',
      'Respiratory distress or dyspnea',
      'Chest pain or suspected myocardial infarction',
      'Altered mental status due to hypoxia',
      'Shock or circulatory compromise',
      'Trauma patients with potential respiratory compromise',
      'Carbon monoxide poisoning',
      'Any patient requiring supplemental oxygenation'
    ],
    contraindications: [
      'No absolute contraindications for oxygen therapy in emergency situations',
      'Relative caution in COPD patients - monitor for CO2 retention',
      'Avoid excessive oxygen in premature infants (retinopathy risk)',
      'Face mask contraindicated in vomiting patients without airway protection'
    ],
    equipment: [
      'Pulse oximeter with various probe sizes',
      'Nasal cannula (various adult/pediatric sizes)',
      'Simple face masks',
      'Non-rebreather masks with reservoir bags',
      'Oxygen source with flow meters',
      'Oxygen tubing and connectors',
      'Humidification systems if available',
      'Backup oxygen supplies for transport',
      'Equipment for securing oxygen tanks',
      'Cleaning supplies for equipment maintenance'
    ]
  },
  'blood-glucose-assessment': {
    name: 'Blood Glucose Assessment and Management',
    category: 'medical-emergencies',
    difficultyLevel: 'BEGINNER',
    timeEstimateMinutes: 10,
    isCritical: true,
    objectives: [
      'Perform accurate blood glucose measurement using proper glucometer technique',
      'Interpret glucose results and determine appropriate treatment based on clinical findings',
      'Administer oral glucose to conscious patients with hypoglycemia safely',
      'Provide IV dextrose or glucagon to unconscious hypoglycemic patients',
      'Assess and manage hyperglycemic patients with supportive care',
      'Make appropriate transport decisions based on treatment response and clinical criteria'
    ],
    indications: [
      'Altered mental status or confusion of unknown origin',
      'Known diabetic patient with symptoms consistent with glucose abnormality',
      'Seizure activity or syncope',
      'Suspected intoxication or behavioral changes',
      'Stroke-like symptoms that may be glucose-related',
      'Unconscious patient requiring differential diagnosis',
      'Pediatric patients with altered mental status'
    ],
    contraindications: [
      'No absolute contraindications for glucose assessment',
      'Oral glucose contraindicated in unconscious or vomiting patients',
      'IV dextrose requires patent IV access to prevent tissue necrosis',
      'Treat-and-release contraindicated if seizure occurred during episode'
    ],
    equipment: [
      'Calibrated glucometer with appropriate test strips',
      'Lancets and alcohol swabs',
      'Sterile gauze pads and gloves',
      'Oral glucose gel or tablets',
      'IV dextrose solutions (D50, D25, D10)',
      'Glucagon emergency kit (IM/intranasal)',
      'IV access supplies and normal saline',
      'Airway management equipment',
      'Cardiac monitoring equipment',
      'Documentation materials'
    ]
  },
  'prediction-of-difficult-bag-valve-mask-ventilations': {
    name: 'Prediction of Difficult Bag Valve Mask Ventilations',
    category: 'airway',
    difficultyLevel: 'ADVANCED',
    timeEstimateMinutes: 8,
    isCritical: true,
    objectives: [
      'Systematically assess patient using BOOTS criteria',
      'Identify factors that predict difficult bag-valve-mask ventilation',
      'Plan appropriate airway management strategy',
      'Prepare backup airway devices as indicated'
    ],
    indications: [
      'Unconscious patient requiring ventilatory support',
      'Pre-intubation assessment',
      'Emergency airway management planning'
    ],
    contraindications: [
      'Patient able to maintain airway independently',
      'Cervical spine injury requiring specialized positioning'
    ],
    equipment: [
      'Bag-valve-mask device',
      'Oxygen source',
      'Suction device',
      'Backup airway devices'
    ]
  },
  'adult-cpr-defibrillator': {
    name: 'Adult CPR with Manual Defibrillator',
    category: 'bls',
    difficultyLevel: 'INTERMEDIATE',
    timeEstimateMinutes: 15,
    isCritical: true,
    objectives: [
      'Perform high-quality chest compressions at correct rate and depth',
      'Provide effective rescue breathing with minimal interruptions',
      'Operate manual defibrillator safely and effectively',
      'Recognize and treat shockable and non-shockable rhythms',
      'Demonstrate proper post-resuscitation care'
    ],
    indications: [
      'Cardiac arrest with no pulse',
      'Ventricular fibrillation',
      'Pulseless ventricular tachycardia',
      'Asystole or PEA (pulseless electrical activity)'
    ],
    contraindications: [
      'Signs of obvious death (rigor mortis, decomposition)',
      'Valid DNR order',
      'Unsafe scene conditions'
    ],
    equipment: [
      'Manual defibrillator/monitor',
      'Defibrillation pads',
      'Bag-valve-mask with oxygen',
      'Suction device',
      'IV/IO supplies',
      'Emergency medications'
    ]
  },

  'iv-cannulation': {
    name: 'Intravenous Cannulation',
    category: 'medical',
    difficultyLevel: 'INTERMEDIATE',
    timeEstimateMinutes: 8,
    isCritical: true,
    objectives: [
      'Select appropriate vein and catheter size',
      'Demonstrate sterile technique throughout procedure',
      'Successfully establish patent IV access',
      'Secure catheter properly to prevent dislodgement',
      'Monitor for complications and provide appropriate care'
    ],
    indications: [
      'Medication administration',
      'Fluid resuscitation',
      'Blood sampling',
      'Contrast medium administration'
    ],
    contraindications: [
      'Infection at insertion site',
      'AV fistula or lymphedema',
      'Previous mastectomy (affected side)',
      'Severe coagulopathy'
    ],
    equipment: [
      'IV catheters (various sizes)',
      'IV fluids and tubing',
      'Tourniquet',
      'Alcohol wipes',
      'Gloves and PPE',
      'Dressing materials'
    ]
  },

  'endotracheal-intubation': {
    name: 'Endotracheal Intubation',
    category: 'airway',
    difficultyLevel: 'ADVANCED',
    timeEstimateMinutes: 12,
    isCritical: true,
    objectives: [
      'Assess airway anatomy and identify potential difficulties',
      'Perform proper pre-oxygenation and positioning',
      'Successfully visualize vocal cords using direct laryngoscopy',
      'Insert endotracheal tube with proper depth and secure airway',
      'Confirm tube placement using multiple methods'
    ],
    indications: [
      'Respiratory failure requiring mechanical ventilation',
      'Airway protection in unconscious patients',
      'Anticipated difficult bag-mask ventilation',
      'Cardiac arrest requiring prolonged resuscitation'
    ],
    contraindications: [
      'Suspected cervical spine injury (relative)',
      'Severe maxillofacial trauma',
      'Complete upper airway obstruction',
      'Inexperienced provider without backup'
    ],
    equipment: [
      'Laryngoscope with blades',
      'Endotracheal tubes (multiple sizes)',
      'Stylet and lubricant',
      'Suction device',
      'Capnography equipment',
      'Backup airway devices'
    ]
  },

  '12-lead-ecg': {
    name: '12-Lead ECG Acquisition',
    category: 'assessment',
    difficultyLevel: 'BEGINNER',
    timeEstimateMinutes: 6,
    isCritical: true,
    objectives: [
      'Properly prepare patient and skin for electrode placement',
      'Place all electrodes in correct anatomical positions',
      'Acquire artifact-free 12-lead ECG tracing',
      'Recognize common artifacts and troubleshoot problems',
      'Document and interpret basic ECG findings'
    ],
    indications: [
      'Chest pain or suspected cardiac event',
      'Shortness of breath',
      'Syncope or pre-syncope',
      'Routine monitoring in high-risk patients'
    ],
    contraindications: [
      'None (relative contraindication: severe unstable patient requiring immediate intervention)'
    ],
    equipment: [
      '12-lead ECG machine',
      'Electrodes (disposable)',
      'Alcohol wipes',
      'Gauze pads',
      'Hair clipper if needed'
    ]
  },

  'blood-glucose-testing': {
    name: 'Blood Glucose Testing',
    category: 'assessment',
    difficultyLevel: 'BEGINNER',
    timeEstimateMinutes: 4,
    isCritical: true,
    objectives: [
      'Select appropriate puncture site and prepare properly',
      'Obtain adequate blood sample using sterile technique',
      'Operate glucometer correctly and obtain accurate reading',
      'Interpret results in clinical context',
      'Document findings and initiate appropriate treatment'
    ],
    indications: [
      'Altered mental status',
      'Suspected hypoglycemia or hyperglycemia',
      'Diabetic patients with symptoms',
      'Routine monitoring in high-risk patients'
    ],
    contraindications: [
      'Severe peripheral vascular disease (relative)',
      'Infection at puncture site',
      'Severe coagulopathy'
    ],
    equipment: [
      'Glucometer',
      'Test strips (not expired)',
      'Lancet device',
      'Alcohol wipes',
      'Gauze pads',
      'Gloves'
    ]
  },

  'spinal-immobilization': {
    name: 'Spinal Immobilization and C-Spine Management',
    category: 'trauma',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 15,
    isCritical: true,
    objectives: [
      'Recognize indications for spinal immobilization based on mechanism and clinical findings',
      'Perform systematic neurological assessment and document baseline function',
      'Apply proper cervical collar sizing and placement technique',
      'Execute coordinated log roll and spine board immobilization',
      'Maintain spinal alignment throughout patient care and transport',
      'Monitor for neurogenic shock and airway complications',
      'Provide appropriate ongoing care during transport'
    ],
    indications: [
      'Motor vehicle collision with significant mechanism',
      'Fall from height >3 feet (1 meter)',
      'Diving or shallow water injury',
      'High-impact sports injury',
      'Altered mental status with potential trauma',
      'Neurological signs or symptoms (weakness, numbness)',
      'Spinal pain or tenderness on examination'
    ],
    contraindications: [
      'Penetrating neck trauma with active bleeding (relative)',
      'Severe agitation preventing safe immobilization',
      'Airway compromise that immobilization would worsen',
      'Patient meets all low-risk criteria (Canadian C-Spine/NEXUS clear)'
    ],
    equipment: [
      'Cervical collar (multiple sizes)',
      'Long spine board',
      'Head blocks or towel rolls',
      'Securing straps (minimum 5)',
      'Medical tape',
      'Padding materials',
      'Suction device',
      'Scissors for strap cutting if needed'
    ]
  },

  'hemorrhage-control-shock': {
    name: 'Hemorrhage Control and Shock Management',
    category: 'trauma',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Rapidly identify and control life-threatening external hemorrhage',
      'Apply appropriate bleeding control techniques including tourniquets',
      'Recognize and classify different types and stages of shock',
      'Establish vascular access and provide appropriate fluid resuscitation',
      'Apply advanced hemorrhage control measures and hemostatic agents',
      'Monitor patient response and prevent complications of shock',
      'Provide comprehensive documentation and handover to trauma team'
    ],
    indications: [
      'External hemorrhage from trauma',
      'Signs and symptoms of hypovolemic shock',
      'Penetrating or blunt trauma with bleeding',
      'Amputations or mangled extremities',
      'Multiple trauma with hemodynamic instability',
      'Internal bleeding suspected (abdominal, pelvic, chest)',
      'Any patient with altered mental status and trauma mechanism'
    ],
    contraindications: [
      'DNR orders in terminal patients (relative)',
      'Obvious signs of death (rigor mortis, dependent lividity)',
      'Unsafe scene preventing intervention'
    ],
    equipment: [
      'Personal protective equipment (gloves, eye protection)',
      'Trauma dressings and gauze pads',
      'Pressure bandages and elastic wraps',
      'Tourniquets (CAT, SOF-T)',
      'Hemostatic agents (QuikClot, Celox)',
      'Large-bore IV catheters (14-16G)',
      'IV fluids (normal saline, lactated Ringer\'s)',
      'Pelvic binder or sheet',
      'Warm blankets and fluid warmer'
    ]
  },

  'pediatric-assessment-care': {
    name: 'Pediatric Assessment and Emergency Care',
    category: 'pediatric',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 25,
    isCritical: true,
    objectives: [
      'Perform age-appropriate approach and assessment techniques',
      'Utilize Pediatric Assessment Triangle for rapid evaluation',
      'Obtain and interpret age-specific vital signs and growth parameters',
      'Conduct systematic primary and secondary assessments adapted for children',
      'Provide appropriate emergency interventions with weight-based dosing',
      'Implement family-centered care principles throughout patient encounter',
      'Recognize signs of child abuse and mandatory reporting requirements'
    ],
    indications: [
      'Any pediatric patient requiring emergency medical assessment',
      'Pediatric trauma or medical emergency',
      'Fever, respiratory distress, or altered mental status in children',
      'Pediatric cardiac arrest or near-drowning incidents',
      'Suspected child abuse or neglect situations',
      'Neonatal emergencies and delivery complications',
      'Poisoning or overdose in pediatric patients'
    ],
    contraindications: [
      'Scene unsafe for child or providers',
      'Parent/caregiver interference preventing necessary care',
      'Child requires immediate life-saving interventions (prioritize over assessment)'
    ],
    equipment: [
      'Pediatric blood pressure cuffs (multiple sizes)',
      'Age-appropriate stethoscopes and thermometers',
      'Pediatric scales and growth charts',
      'Comfort items and distraction tools',
      'Pediatric emergency medications and dosing references',
      'Age-specific airway and vascular access equipment',
      'Child restraint systems for transport',
      'Warming blankets and heat sources'
    ]
  },

  'medication-administration-dosage': {
    name: 'Medication Administration and Dosage Calculation',
    category: 'pharmacology',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Verify patient identity and medication indications using systematic approach',
      'Apply the six rights of medication administration consistently',
      'Perform accurate dosage calculations using standard formulas',
      'Demonstrate safe medication preparation and aseptic technique',
      'Administer medications via multiple routes with proper technique',
      'Monitor patient response and manage adverse reactions appropriately',
      'Document medication administration accurately and communicate effectively'
    ],
    indications: [
      'Any patient requiring emergency medication administration',
      'Pain management and analgesia requirements',
      'Cardiac emergencies requiring antiarrhythmics or vasopressors',
      'Respiratory emergencies requiring bronchodilators or steroids',
      'Allergic reactions requiring antihistamines or epinephrine',
      'Seizure control with anticonvulsants',
      'Sedation for procedures or combative patients'
    ],
    contraindications: [
      'Known allergy to specific medication or class',
      'Medication-specific contraindications (age, pregnancy, renal/hepatic disease)',
      'Drug interactions with current medications',
      'Inability to verify patient identity',
      'Lack of clear indication or physician order',
      'Expired or contaminated medications'
    ],
    equipment: [
      'Appropriate syringes and needles (various sizes)',
      'Medication vials and ampules',
      'IV access supplies and flush solutions',
      'Calculator and dosage reference guides',
      'Alcohol swabs and sterile gauze',
      'Sharps disposal containers',
      'Emergency reversal agents (naloxone, flumazenil)',
      'Epinephrine for anaphylaxis treatment'
    ]
  },

  'obstetric-emergency-childbirth': {
    name: 'Obstetric Emergency and Childbirth',
    category: 'obstetric',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 30,
    isCritical: true,
    objectives: [
      'Assess pregnant patient and determine gestational age and labor status',
      'Evaluate fetal well-being and identify potential complications',
      'Prepare appropriate equipment and environment for emergency delivery',
      'Assist with controlled delivery of fetal head and management of nuchal cord',
      'Complete delivery of shoulders and body using safe technique',
      'Provide immediate newborn assessment and resuscitation if needed',
      'Manage umbilical cord care and assist with placental delivery safely'
    ],
    indications: [
      'Imminent delivery with crowning or strong urge to push',
      'Labor progressing rapidly with no time for hospital transport',
      'Precipitous labor in multiparous patients',
      'Delivery complications requiring immediate intervention',
      'Postpartum hemorrhage or retained placenta',
      'Neonatal resuscitation requirements',
      'Obstetric emergencies (cord prolapse, shoulder dystocia)'
    ],
    contraindications: [
      'Placenta previa with active bleeding (requires cesarean)',
      'Severe pregnancy-induced hypertension with seizures',
      'Breech presentation in primigravida patient',
      'Multiple gestation with complications',
      'Maternal cardiac arrest (modify approach)',
      'Active genital herpes lesions (relative contraindication)'
    ],
    equipment: [
      'Sterile obstetric delivery kit',
      'Clean towels and warming blankets',
      'Umbilical cord clamps and scissors',
      'Bulb syringe for newborn suctioning',
      'Bag-mask ventilation device (newborn size)',
      'Oxygen source and delivery devices',
      'Sterile gloves and protective equipment',
      'Emergency medications (oxytocin if available)',
      'Plastic bags for placenta transport'
    ]
  },

  'respiratory-distress-management': {
    name: 'Respiratory Distress Management',
    category: 'medical',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 25,
    isCritical: true,
    objectives: [
      'Rapidly assess and identify life-threatening respiratory emergencies',
      'Conduct systematic respiratory assessment and obtain relevant history',
      'Provide appropriate oxygen therapy and ventilatory support',
      'Administer condition-specific medications safely and effectively',
      'Perform advanced respiratory interventions when indicated',
      'Monitor patient response and adjust treatment based on clinical changes',
      'Coordinate appropriate transport and communicate effectively with receiving facility'
    ],
    indications: [
      'Acute respiratory distress or difficulty breathing',
      'Asthma exacerbation or status asthmaticus',
      'COPD exacerbation with respiratory compromise',
      'Pulmonary edema and congestive heart failure',
      'Pneumothorax or tension pneumothorax',
      'Anaphylaxis with respiratory involvement',
      'Upper airway obstruction or foreign body aspiration',
      'Pneumonia with respiratory compromise'
    ],
    contraindications: [
      'Complete upper airway obstruction (requires immediate surgical airway)',
      'Massive hemothorax requiring surgical intervention',
      'Severe unstable chest wall injuries',
      'Patient refusal in conscious, competent adults'
    ],
    equipment: [
      'Pulse oximeter and capnography equipment',
      'Oxygen delivery devices (cannula, masks, non-rebreather)',
      'Bag-valve-mask and advanced airway equipment',
      'Nebulizer and bronchodilator medications',
      'CPAP device if available',
      'Needle thoracentesis supplies',
      'Emergency medications (epinephrine, corticosteroids)',
      'Suction equipment and airway adjuncts'
    ]
  },

  'cardiac-arrest-resuscitation': {
    name: 'Cardiac Arrest and Resuscitation (ACLS)',
    category: 'cardiac',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 30,
    isCritical: true,
    objectives: [
      'Rapidly recognize cardiac arrest and initiate immediate high-quality CPR',
      'Apply defibrillator safely and analyze cardiac rhythms accurately',
      'Establish advanced airway management and ensure effective ventilation',
      'Administer ACLS medications according to current algorithms',
      'Identify and treat reversible causes of cardiac arrest systematically',
      'Lead resuscitation team with clear communication and role delegation',
      'Provide appropriate post-resuscitation care and coordinate transport'
    ],
    indications: [
      'Cardiac arrest with absence of pulse and normal breathing',
      'Witnessed or unwitnessed sudden collapse',
      'Ventricular fibrillation or ventricular tachycardia',
      'Pulseless electrical activity (PEA)',
      'Asystole (flatline rhythm)',
      'Post-cardiac surgery or procedure complications',
      'Drug overdose with cardiac arrest',
      'Drowning or electrocution with cardiac arrest'
    ],
    contraindications: [
      'Signs of irreversible death (rigor mortis, decomposition)',
      'Valid DNR orders or advance directives',
      'Futile resuscitation in terminal disease',
      'Unsafe scene preventing safe intervention',
      'Severe hypothermia <28°C (modify approach)',
      'Lightning strike (ensure scene safety first)'
    ],
    equipment: [
      'Manual defibrillator with monitoring capability',
      'Advanced airway equipment (ET tubes, supraglottic airways)',
      'Bag-valve-mask devices and oxygen supply',
      'IV/IO access supplies and emergency medications',
      'CPR feedback devices and backboard',
      'Capnography and pulse oximetry equipment',
      'Emergency drugs (epinephrine, amiodarone, atropine)',
      'Suction equipment and airway adjuncts'
    ]
  },

  'seizure-neurological-emergencies': {
    name: 'Seizure Management and Neurological Emergencies',
    category: 'medical',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Ensure scene safety and protect patient during active seizure activity',
      'Perform post-ictal assessment and maintain airway patency',
      'Conduct comprehensive neurological evaluation using standardized tools',
      'Obtain relevant history and identify precipitating factors',
      'Recognize and treat status epilepticus with appropriate medications',
      'Monitor physiological parameters and provide supportive care',
      'Consider differential diagnoses and coordinate appropriate transport'
    ],
    indications: [
      'Active generalized tonic-clonic seizures',
      'Status epilepticus (seizure >5 minutes)',
      'Post-ictal state with altered mental status',
      'First-time seizure requiring evaluation',
      'Breakthrough seizures in known epileptic patients',
      'Seizure secondary to metabolic or toxic causes',
      'Febrile seizures in pediatric patients',
      'Pseudoseizures requiring differentiation'
    ],
    contraindications: [
      'Do not restrain patient during active seizure',
      'Avoid placing objects in mouth during seizure',
      'Do not administer oral medications during active seizure',
      'Avoid phenytoin in patients with cardiac conduction abnormalities'
    ],
    equipment: [
      'Soft materials for head protection during seizure',
      'Suction equipment and airway management tools',
      'Oxygen delivery devices and pulse oximetry',
      'IV/IO access supplies for medication administration',
      'Anticonvulsant medications (lorazepam, midazolam, fosphenytoin)',
      'Blood glucose testing equipment',
      'Neurological assessment tools and GCS reference',
      'Cardiac monitoring equipment'
    ]
  },

  'diabetic-emergency-management': {
    name: 'Diabetic Emergency Management',
    category: 'medical',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 18,
    isCritical: true,
    objectives: [
      'Rapidly assess consciousness level and obtain blood glucose measurement',
      'Recognize signs and symptoms of hypoglycemic and hyperglycemic emergencies',
      'Provide appropriate glucose replacement therapy based on patient condition',
      'Identify and assess diabetic ketoacidosis and hyperglycemic emergencies',
      'Administer fluid resuscitation and supportive care for hyperglycemic patients',
      'Monitor patient response and reassess glucose levels continuously',
      'Make appropriate transport decisions and provide patient education'
    ],
    indications: [
      'Altered mental status in known diabetic patients',
      'Blood glucose <70 mg/dL (hypoglycemia) or >400 mg/dL (severe hyperglycemia)',
      'Signs of diabetic ketoacidosis (fruity breath, Kussmaul respirations)',
      'Hyperglycemic hyperosmolar state in elderly patients',
      'Seizures or coma of unknown origin (check glucose)',
      'Diabetic patient with nausea, vomiting, or dehydration',
      'Medication non-compliance or recent illness in diabetics'
    ],
    contraindications: [
      'Do not give oral glucose to unconscious patients',
      'Avoid insulin administration in prehospital setting',
      'Do not discharge altered mental status patients',
      'Avoid rapid glucose correction in severe hyperglycemia'
    ],
    equipment: [
      'Blood glucose meter and test strips',
      'Lancets and alcohol swabs for glucose testing',
      'Oral glucose gel and tablets',
      'Dextrose solutions (D25W, D50W) for IV administration',
      'Glucagon injection for severe hypoglycemia',
      'IV access supplies and normal saline for fluid resuscitation',
      'Thiamine injection for suspected alcoholics',
      'Airway management equipment if altered consciousness'
    ]
  },

  'anaphylaxis-allergic-reaction': {
    name: 'Anaphylaxis and Allergic Reaction Management',
    category: 'medical',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 22,
    isCritical: true,
    objectives: [
      'Rapidly recognize signs and symptoms of anaphylactic reactions',
      'Administer epinephrine as first-line treatment without delay',
      'Provide comprehensive airway management and oxygen support',
      'Establish IV access and provide fluid resuscitation for hypotension',
      'Administer appropriate adjunctive medications (antihistamines, steroids)',
      'Monitor continuously for biphasic reactions and treatment response',
      'Identify triggering allergens and coordinate safe transport to hospital'
    ],
    indications: [
      'Acute onset allergic reaction with systemic symptoms',
      'Respiratory distress with known allergen exposure',
      'Hypotension following allergen exposure (food, medication, insect sting)',
      'Urticaria with angioedema affecting airway or breathing',
      'Gastrointestinal symptoms with skin/respiratory involvement',
      'Previous anaphylaxis with similar exposure or symptoms',
      'Severe local allergic reaction progressing to systemic involvement'
    ],
    contraindications: [
      'No absolute contraindications for epinephrine in anaphylaxis',
      'Do not delay epinephrine for IV access or other interventions',
      'Avoid antihistamines as sole treatment for anaphylaxis',
      'Never discharge anaphylaxis patients without hospital evaluation'
    ],
    equipment: [
      'Epinephrine 1:1000 and EpiPen auto-injectors',
      'Airway management equipment and high-flow oxygen',
      'IV access supplies and crystalloid fluids for resuscitation',
      'Antihistamines (diphenhydramine) and corticosteroids',
      'Nebulizer and albuterol for bronchospasm treatment',
      'Advanced airway equipment including cricothyrotomy kit',
      'Blood pressure monitoring and pulse oximetry equipment',
      'Glucagon injection for patients on beta-blocker medications'
    ]
  },

  'fracture-orthopedic-management': {
    name: 'Fracture and Orthopedic Injury Management',
    category: 'trauma',
    difficultyLevel: 'INTERMEDIATE',
    timeEstimateMinutes: 14,
    isCritical: true,
    objectives: [
      'Perform systematic assessment of musculoskeletal trauma injuries',
      'Implement appropriate fracture stabilization and splinting techniques',
      'Recognize and manage orthopedic complications including compartment syndrome',
      'Provide appropriate pain management for orthopedic trauma patients',
      'Manage open fractures with proper wound care and infection prevention',
      'Determine appropriate transport decisions and hospital selection'
    ],
    indications: [
      'Suspected or obvious fractures of extremities or pelvis',
      'Crush injuries with potential musculoskeletal involvement',
      'High-energy trauma with orthopedic injury potential',
      'Open wounds with suspected underlying fractures',
      'Severe extremity pain with deformity or loss of function',
      'Neurovascular compromise associated with extremity injury',
      'Joint dislocations requiring reduction or stabilization',
      'Multiple trauma with orthopedic component requiring prioritization'
    ],
    contraindications: [
      'Life-threatening injuries taking priority over fracture care',
      'Unsafe scene preventing adequate assessment or treatment',
      'Complete neurovascular compromise requiring immediate surgery',
      'Suspected compartment syndrome requiring emergency fasciotomy'
    ],
    equipment: [
      'Various splinting materials including vacuum, rigid, and SAM splints',
      'Traction splint for femur fractures (Hare, Sager, or similar)',
      'Padding materials, blankets, and cushioning devices',
      'Bandages, tape, and securing straps for splint application',
      'Analgesic medications per protocol (morphine, fentanyl, ketamine)',
      'Sterile dressings and hemostatic agents for open fractures',
      'Ice packs or cold therapy devices for swelling reduction',
      'Blood pressure monitoring and pulse oximetry equipment'
    ]
  },

  'poisoning-overdose-management': {
    name: 'Poisoning and Overdose Management',
    category: 'medical',
    difficultyLevel: 'ADVANCED',
    timeEstimateMinutes: 18,
    isCritical: true,
    objectives: [
      'Assess scene safety and identify potential toxic hazards',
      'Perform systematic toxicological assessment and history taking',
      'Implement appropriate decontamination procedures based on exposure route',
      'Administer specific antidotes and supportive care per protocol',
      'Monitor for and manage toxicological complications',
      'Provide crisis intervention for intentional poisoning cases',
      'Coordinate with poison control center for expert consultation'
    ],
    indications: [
      'Known or suspected ingestion of toxic substances',
      'Inhalation exposure to hazardous chemicals or gases',
      'Dermal or eye exposure to caustic or toxic materials',
      'Drug overdose with altered mental status or vital signs',
      'Multiple patients with similar symptoms suggesting environmental exposure',
      'Intentional self-poisoning or suicide attempt with toxic substances',
      'Accidental pediatric ingestion of household chemicals or medications',
      'Occupational exposure to industrial chemicals or pesticides'
    ],
    contraindications: [
      'Unsafe scene conditions preventing provider safety',
      'Life-threatening trauma taking priority over toxicological care',
      'Contraindications to specific antidotes (flumazenil in seizure patients)',
      'Gastric decontamination contraindicated for caustics or petroleum products'
    ],
    equipment: [
      'Personal protective equipment including chemical-resistant suits and respirators',
      'Decontamination supplies including water, saline, and containment materials',
      'Specific antidotes per protocol: naloxone, flumazenil, atropine, calcium',
      'Activated charcoal for appropriate ingestion cases',
      'Cardiac monitor and defibrillation capability',
      'Airway management equipment including intubation supplies',
      'IV access supplies and various crystalloid and medication options',
      'Poison control center contact information and communication equipment'
    ]
  },

  'burns-thermal-injury-management': {
    name: 'Burns and Thermal Injury Management',
    category: 'trauma',
    difficultyLevel: 'ADVANCED',
    timeEstimateMinutes: 19,
    isCritical: true,
    objectives: [
      'Ensure scene safety and eliminate ongoing thermal hazards',
      'Perform systematic burn assessment including depth and total body surface area',
      'Implement appropriate cooling therapy and initial burn treatment',
      'Establish vascular access and provide fluid resuscitation per burn protocols',
      'Manage burn-related complications including airway burns and compartment syndrome',
      'Provide appropriate pain management for severe burn injuries',
      'Determine appropriate receiving facility and coordinate burn center transport'
    ],
    indications: [
      'Thermal burns from fire, hot liquids, or contact with hot objects',
      'Chemical burns from acids, alkalis, or other caustic substances',
      'Electrical burns from high or low voltage electrical contact',
      'Burns involving face, hands, feet, genitalia, or major joints',
      'Circumferential burns of extremities or torso',
      'Burns in patients with significant comorbidities or extremes of age',
      'Burns associated with inhalation injury or airway compromise',
      'Burns covering >10% total body surface area in adults or >5% in children'
    ],
    contraindications: [
      'Unsafe scene conditions with active fire or electrical hazards',
      'Life-threatening trauma taking priority over burn care',
      'Structural instability preventing safe patient access',
      'Hazardous materials requiring specialized decontamination teams'
    ],
    equipment: [
      'Personal protective equipment appropriate for fire and hazmat scenes',
      'Cool water or saline for burn cooling and chemical irrigation',
      'Clean, dry dressings and burn sheets for covering wounds',
      'Large-bore IV catheters and lactated Ringer\'s solution for fluid resuscitation',
      'Analgesic medications including morphine, fentanyl, and ketamine',
      'Airway management equipment including intubation supplies',
      'Cardiac monitoring and pulse oximetry for continuous assessment',
      'Burn assessment tools including Rule of Nines charts and calculators'
    ]
  },

  'chest-pain-acs-management': {
    name: 'Chest Pain and Acute Coronary Syndrome Management',
    category: 'cardiac',
    difficultyLevel: 'ADVANCED',
    timeEstimateMinutes: 22,
    isCritical: true,
    objectives: [
      'Perform rapid assessment and early recognition of acute coronary syndrome',
      'Obtain and interpret 12-lead ECG within 10 minutes of patient contact',
      'Administer appropriate cardiac medications including aspirin and nitroglycerin',
      'Implement advanced cardiac life support for complications and arrhythmias',
      'Perform risk stratification and assess for high-risk cardiac features',
      'Coordinate with cardiac catheterization lab for STEMI patients',
      'Provide continuous monitoring and reassessment throughout care'
    ],
    indications: [
      'Chest pain or discomfort suggestive of cardiac origin',
      'Typical anginal symptoms with cardiac risk factors',
      'Atypical presentations in high-risk patients (women, elderly, diabetics)',
      'Known coronary artery disease with worsening symptoms',
      'Chest pain associated with diaphoresis, nausea, or dyspnea',
      'ECG changes consistent with ischemia or infarction',
      'Elevated cardiac biomarkers if available in field',
      'Suspected complications of acute MI including arrhythmias or heart failure'
    ],
    contraindications: [
      'Aspirin allergy or active gastrointestinal bleeding',
      'Nitroglycerin contraindicated with hypotension or recent PDE5 inhibitor use',
      'Thrombolytic therapy contraindicated with recent surgery or bleeding',
      'Beta-blockers contraindicated with bradycardia, heart block, or asthma'
    ],
    equipment: [
      '12-lead ECG machine with transmission capability',
      'Cardiac medications including aspirin, nitroglycerin, morphine',
      'Advanced cardiac life support medications and defibrillator',
      'IV access supplies and crystalloid solutions',
      'Continuous cardiac monitoring and pulse oximetry',
      'Blood pressure monitoring equipment',
      'Oxygen delivery devices for hypoxic patients',
      'Communication equipment for cardiac catheterization lab activation'
    ]
  },

  '12-lead-ecg-placement': {
    name: '12-Lead ECG Lead Placement and Acquisition',
    category: 'cardiac',
    difficultyLevel: 'INTERMEDIATE',
    timeEstimateMinutes: 15,
    isCritical: true,
    objectives: [
      'Perform accurate anatomical landmark identification for electrode placement',
      'Apply electrodes in correct positions following standardized protocols',
      'Acquire high-quality 12-lead ECG tracings free from artifact',
      'Demonstrate proper skin preparation and equipment calibration techniques',
      'Recognize and troubleshoot common ECG acquisition problems',
      'Document findings and maintain equipment according to standards'
    ],
    indications: [
      'Chest pain or cardiac symptoms requiring cardiac assessment',
      'Suspected myocardial infarction or acute coronary syndrome',
      'Cardiac arrhythmias or palpitations',
      'Syncope or pre-syncope episodes',
      'Routine cardiac screening or pre-operative assessment',
      'Monitoring response to cardiac medications or interventions',
      'Follow-up assessment of known cardiac conditions',
      'Any patient with cardiovascular risk factors and symptoms'
    ],
    contraindications: [
      'No absolute contraindications for diagnostic ECG',
      'Relative caution with severe skin breakdown at electrode sites',
      'Patient refusal or inability to cooperate with positioning'
    ],
    equipment: [
      '12-lead ECG machine with calibration capability',
      '10 ECG electrodes (limb and precordial)',
      'Complete set of lead cables with proper color coding',
      'Alcohol wipes for skin preparation',
      'Razor or clippers for hair removal if needed',
      'ECG paper or digital storage device',
      'Patient draping materials for privacy',
      'Electrode placement reference guide or anatomical chart'
    ]
  },

  'cpap-ventilation': {
    name: 'Continuous Positive Airway Pressure (CPAP)',
    category: 'airway',
    difficultyLevel: 'ADVANCED',
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Assess patient appropriately for CPAP candidacy and contraindications',
      'Set up and test CPAP equipment ensuring proper function and safety',
      'Apply CPAP mask with proper technique and pressure titration',
      'Monitor patient response and adjust therapy based on clinical improvement',
      'Recognize and manage complications of CPAP therapy',
      'Provide safe transport while maintaining CPAP support'
    ],
    indications: [
      'Acute cardiogenic pulmonary edema with adequate mental status',
      'COPD exacerbation with respiratory distress and CO2 retention',
      'Pneumonia with respiratory failure and adequate consciousness',
      'Acute respiratory distress in conscious, cooperative patients',
      'Bridge therapy while preparing for intubation',
      'Sleep apnea exacerbation in hospital or transport setting'
    ],
    contraindications: [
      'Altered mental status or inability to protect airway (GCS <13)',
      'Active vomiting or high aspiration risk',
      'Facial trauma preventing adequate mask seal',
      'Untreated pneumothorax',
      'Severe hypotension (systolic <90mmHg)',
      'Cardiac or respiratory arrest'
    ],
    equipment: [
      'CPAP generator unit with pressure capability',
      'Breathing circuit with reservoir bag and PEEP valve',
      'Face masks in multiple sizes (small, medium, large)',
      'Head straps and securing devices',
      'Oxygen source with flow meter (10-15 L/min capability)',
      'Manometer for pressure monitoring',
      'Suction equipment for airway management',
      'Backup bag-valve-mask equipment'
    ]
  },

  'needle-thoracentesis': {
    name: 'Needle Thoracentesis (Decompression)',
    category: 'trauma',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 8,
    isCritical: true,
    objectives: [
      'Rapidly identify clinical signs of tension pneumothorax requiring immediate intervention',
      'Perform emergency needle decompression using proper anatomical landmarks and technique',
      'Establish and maintain functional one-way valve system for ongoing decompression',
      'Monitor patient response and manage complications during and after the procedure',
      'Document procedure thoroughly and provide comprehensive handoff to receiving facility'
    ],
    indications: [
      'Tension pneumothorax with hemodynamic compromise and respiratory distress',
      'Absent or severely diminished breath sounds with tracheal deviation',
      'Cardiac arrest with suspected tension pneumothorax',
      'Progressive respiratory failure with signs of mediastinal shift'
    ],
    contraindications: [
      'Simple pneumothorax without tension physiology (relative)',
      'Severe coagulopathy with high bleeding risk (relative)',
      'Local infection at proposed insertion site',
      'Anatomical abnormalities preventing safe needle access'
    ],
    equipment: [
      '14-gauge angiocatheter (minimum 2-inch length)',
      'Antiseptic solution (alcohol or betadine)',
      'Sterile gauze pads and medical tape',
      'Flutter valve or 3-way stopcock with finger cot',
      'Personal protective equipment (gloves, mask, eye protection)',
      'Suction equipment and airway management supplies',
      'Continuous monitoring equipment (pulse oximetry, blood pressure)',
      'Documentation materials and communication devices'
    ]
  },

  'intravenous-fluid-therapy': {
    name: 'Intravenous Fluid Therapy',
    category: 'vascular-access',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 25,
    isCritical: true,
    objectives: [
      'Assess patient hemodynamic status and determine appropriate fluid therapy indication',
      'Select correct IV fluid type and calculate appropriate dosing for patient condition',
      'Establish secure peripheral IV access using sterile technique and safety protocols',
      'Administer fluid bolus therapy with continuous monitoring of patient response',
      'Titrate fluid rates based on clinical response and avoid fluid overload complications',
      'Monitor for adverse reactions and manage complications of IV fluid therapy',
      'Document fluid administration and provide comprehensive handoff to receiving team'
    ],
    indications: [
      'Hypovolemic shock from bleeding, dehydration, or fluid losses',
      'Hypotension requiring volume support and resuscitation',
      'Severe dehydration from vomiting, diarrhea, or inadequate intake',
      'Burns requiring fluid resuscitation to prevent shock',
      'Sepsis with hypotension requiring fluid therapy',
      'Medication administration requiring IV access'
    ],
    contraindications: [
      'Pulmonary edema or acute congestive heart failure (relative)',
      'Known renal failure with fluid overload',
      'Hypervolemia or evidence of fluid overload',
      'Severe electrolyte imbalances requiring specific management'
    ],
    equipment: [
      'Isotonic crystalloid solutions (Normal Saline, Lactated Ringers)',
      'IV catheters (14G, 16G, 18G, 20G, 22G)',
      'IV administration sets with macro and micro drip chambers',
      'IV poles, pressure bags for rapid infusion',
      'Infusion pumps for precise rate control',
      'IV start kits with antiseptic and securing materials',
      'Fluid warmers for large volume resuscitation',
      'Monitoring equipment for vital signs and response assessment'
    ]
  },

  'supraglottic-airway-management': {
    name: 'Supraglottic Airway Management',
    category: 'airway',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 12,
    isCritical: true,
    objectives: [
      'Assess patient appropriateness for supraglottic airway insertion and rule out contraindications',
      'Select correct device type and size based on patient characteristics and clinical needs',
      'Demonstrate proper insertion technique for LMA, King LT, or similar supraglottic devices',
      'Confirm correct placement using multiple verification methods including capnography',
      'Secure device adequately and optimize ventilation parameters to prevent complications',
      'Monitor continuously for device displacement and manage potential complications',
      'Provide appropriate handoff and documentation for receiving medical team'
    ],
    indications: [
      'Failed bag-mask ventilation requiring immediate airway rescue',
      'Unconscious patient requiring positive pressure ventilation support',
      'Cannot intubate, cannot oxygenate emergency situation',
      'Bridge airway during failed intubation attempts',
      'Cardiac arrest requiring definitive airway management',
      'Alternative to intubation when endotracheal intubation is not feasible'
    ],
    contraindications: [
      'Conscious patient with intact gag reflex or protective airway reflexes',
      'Suspected complete upper airway obstruction above vocal cords',
      'Caustic ingestion with potential laryngeal or pharyngeal burns',
      'Significant oral, pharyngeal, or laryngeal trauma',
      'Limited mouth opening preventing adequate device insertion (<2.5 cm)',
      'Active vomiting or high risk of aspiration (relative contraindication)'
    ],
    equipment: [
      'Supraglottic airway devices (LMA, King LT, I-gel) in multiple sizes',
      'Syringes (10-30 mL) for cuff inflation',
      'Water-soluble lubricant for device preparation',
      'Bag-valve-mask device with oxygen reservoir',
      'End-tidal CO2 monitoring with waveform capability',
      'Suction equipment with rigid and flexible catheters',
      'Securing tape, ties, or commercial airway holders',
      'Stethoscope for auscultation and backup airway equipment'
    ]
  },

  'stroke-assessment-management': {
    name: 'Stroke Assessment and Management',
    category: 'medical',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Rapidly recognize stroke symptoms using FAST and BE-FAST assessments',
      'Perform comprehensive neurological examination to characterize deficits',
      'Apply Cincinnati Prehospital Stroke Scale for validated assessment',
      'Obtain vital signs and rule out stroke mimics (especially hypoglycemia)',
      'Gather relevant history including time of onset and medications',
      'Provide appropriate supportive care while protecting airway',
      'Coordinate with stroke center and ensure rapid transport',
      'Monitor continuously and document neurological changes during transport'
    ],
    indications: [
      'Sudden onset focal neurological deficits',
      'Facial drooping, arm weakness, or speech difficulties',
      'Sudden severe headache (worst headache of life)',
      'Sudden vision loss or visual field defects',
      'Sudden loss of balance, coordination, or walking ability',
      'Sudden confusion or difficulty understanding speech',
      'Any combination of neurological symptoms with acute onset'
    ],
    contraindications: [
      'Do not aggressively lower blood pressure in acute stroke',
      'Avoid excessive oxygen administration unless hypoxic',
      'Do not give oral medications or fluids (NPO status)',
      'Avoid aggressive fluid resuscitation unless hypotensive'
    ],
    equipment: [
      'Stroke assessment scales and neurological examination tools',
      'Blood glucose meter for ruling out hypoglycemia',
      'Blood pressure monitoring and pulse oximetry equipment',
      'Airway management tools and suction equipment',
      'IV access supplies and normal saline for keep-open rate',
      'Penlight for pupil assessment and neurological testing',
      'Communication equipment for stroke center notification',
      'Transport equipment with head elevation capability'
    ]
  },

  // 20. FRACTURE AND ORTHOPEDIC INJURY MANAGEMENT - Musculoskeletal trauma care
  'fracture-orthopedic-management': [
    {
      id: 'fracture-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Mechanism Assessment',
      description: 'Assess scene safety and understand mechanism of injury for orthopedic trauma',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Ensure scene safety - look for ongoing hazards that may affect patient or provider',
        'Assess mechanism of injury: fall height, impact force, direction of applied forces',
        'Consider high-energy vs low-energy trauma patterns',
        'Look for environmental clues: twisted wreckage, broken glass, blood patterns',
        'Determine if multisystem trauma is likely based on mechanism',
        'Consider cervical spine precautions if indicated by mechanism',
        'Identify need for rapid extraction vs on-scene stabilization'
      ],
      contraindications: [
        'Unsafe scene requiring immediate evacuation',
        'Life-threatening bleeding requiring immediate hemorrhage control',
        'Airway compromise taking priority over fracture care'
      ],
      safetyNotes: [
        'High-energy mechanisms often involve multiple system injuries',
        'Never compromise scene safety to provide orthopedic care'
      ]
    },
    {
      id: 'fracture-step-2',
      stepNumber: 2,
      title: 'Primary Assessment and Life Threats',
      description: 'Complete primary assessment identifying life-threatening conditions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess airway, breathing, circulation following ABCDE approach',
        'Identify immediate life threats: massive hemorrhage, pneumothorax, shock',
        'Check for signs of hemorrhagic shock from long bone fractures',
        'Assess neurological status and spine immobilization needs',
        'Look for open fractures with active bleeding',
        'Evaluate for compartment syndrome signs early',
        'Consider crush injuries and associated complications'
      ],
      safetyNotes: [
        'Femur fractures can cause 1-2 liters of blood loss',
        'Open fractures have high infection and hemorrhage risk',
        'Compartment syndrome is a surgical emergency'
      ]
    },
    {
      id: 'fracture-step-3',
      stepNumber: 3,
      title: 'Focused Orthopedic Assessment',
      description: 'Perform systematic musculoskeletal examination',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Expose and inspect affected extremities - look for deformity, swelling, bruising',
        'Assess neurovascular status: pulses, sensation, motor function',
        'Palpate for point tenderness, crepitus, and instability',
        'Check range of motion only if no obvious fracture present',
        'Document baseline neurological and vascular findings',
        'Assess for associated injuries: dislocations, ligament tears',
        'Use anatomical landmarks to identify specific fracture locations'
      ],
      contraindications: [
        'Do not move obviously fractured extremities unnecessarily',
        'Avoid range of motion testing with suspected fractures',
        'Do not palpate if gross deformity is present'
      ],
      safetyNotes: [
        'Document neurovascular status before and after any intervention',
        'Loss of pulse or sensation requires immediate action'
      ]
    },
    {
      id: 'fracture-step-4',
      stepNumber: 4,
      title: 'Pain Management and Patient Comfort',
      description: 'Provide appropriate analgesia and positioning for patient comfort',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess pain level using appropriate scale (0-10 numeric or faces scale)',
        'Administer analgesics per protocol: morphine, fentanyl, or ketamine',
        'Consider regional anesthesia techniques if trained and equipped',
        'Position patient for comfort while maintaining spine precautions',
        'Use pillows or blankets to support injured extremities',
        'Apply ice packs to reduce swelling and pain if available',
        'Provide emotional support and reassurance to anxious patient'
      ],
      safetyNotes: [
        'Monitor respiratory status closely with opioid administration',
        'Pain relief improves patient cooperation with treatment',
        'Avoid delaying analgesia for "diagnostic clarity"'
      ]
    },
    {
      id: 'fracture-step-5',
      stepNumber: 5,
      title: 'Fracture Stabilization and Splinting',
      description: 'Immobilize fractures using appropriate splinting techniques',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Immobilize joint above and below suspected fracture site',
        'Apply gentle longitudinal traction if significant angulation present',
        'Use appropriate splinting material: vacuum, rigid, or traction splints',
        'Pad pressure points and bony prominences adequately',
        'Secure splint with straps or bandages - snug but not constricting',
        'For femur fractures, consider traction splinting per protocol',
        'Document pre- and post-splinting neurovascular assessments'
      ],
      equipmentNeeded: [
        'Various splinting materials (vacuum, rigid, SAM splints)',
        'Traction splint for femur fractures',
        'Padding materials and bandages',
        'Straps and securing devices'
      ],
      safetyNotes: [
        'Check neurovascular status before and after splinting',
        'Traction splints contraindicated for certain fracture patterns',
        'Splints should immobilize, not compress'
      ]
    },
    {
      id: 'fracture-step-6',
      stepNumber: 6,
      title: 'Open Fracture Management',
      description: 'Provide specialized care for open fractures with wound management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Assess wound classification: Grade I (<1cm), II (1-10cm), III (>10cm)',
        'Control hemorrhage with direct pressure and hemostatic agents',
        'Remove gross contamination but avoid aggressive debridement',
        'Irrigate wounds with sterile saline if available',
        'Apply sterile dressings to wound - do not remove protruding bone',
        'Administer antibiotics per protocol if available',
        'Document wound size, contamination level, and associated injuries'
      ],
      contraindications: [
        'Do not push protruding bone back into wound',
        'Avoid removing impaled objects near fracture sites',
        'Do not delay transport for extensive wound care'
      ],
      safetyNotes: [
        'Open fractures require urgent surgical intervention',
        'High risk of infection and osteomyelitis',
        'Time to antibiotic administration affects outcomes'
      ]
    },
    {
      id: 'fracture-step-7',
      stepNumber: 7,
      title: 'Complications Recognition and Management',
      description: 'Monitor for and manage orthopedic complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Monitor for compartment syndrome: 5 P\'s (Pain, Pallor, Paresthesia, Pulselessness, Paralysis)',
        'Assess for fat embolism syndrome in long bone fractures',
        'Watch for signs of hemorrhagic shock from blood loss',
        'Monitor for rhabdomyolysis in crush injuries',
        'Check for associated vascular injuries and nerve damage',
        'Assess for infection signs in open fractures',
        'Monitor splint tightness and circulation regularly'
      ],
      safetyNotes: [
        'Compartment syndrome can develop rapidly and cause permanent damage',
        'Fat embolism can affect pulmonary and neurological function',
        'Early recognition of complications is critical for outcomes'
      ]
    },
    {
      id: 'fracture-step-8',
      stepNumber: 8,
      title: 'Transport Decisions and Hospital Communication',
      description: 'Determine transport priority and communicate with receiving facility',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Determine transport priority: emergent vs non-emergent based on complications',
        'Choose appropriate receiving facility based on injury severity',
        'Consider trauma center criteria for multiple or complex fractures',
        'Provide pre-hospital report including mechanism, injuries, treatments',
        'Communicate any complications or deterioration in condition',
        'Prepare for potential surgical emergency at receiving facility',
        'Continue monitoring and reassessing throughout transport'
      ],
      safetyNotes: [
        'Some orthopedic injuries require immediate surgical intervention',
        'Open fractures and compartment syndrome are true emergencies',
        'Clear communication improves receiving hospital preparation'
      ]
    }
  ],

  // 21. POISONING AND OVERDOSE MANAGEMENT - Toxicological emergency care
  'poisoning-overdose-management': [
    {
      id: 'poison-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Contamination Assessment',
      description: 'Assess scene for hazardous substances and prevent provider exposure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Approach scene cautiously - look for chemical odors, spilled substances, or vapors',
        'Don appropriate personal protective equipment before patient contact',
        'Identify the poisonous substance if possible - check containers, labels, witnesses',
        'Assess for airborne hazards requiring respiratory protection',
        'Look for multiple victims suggesting environmental exposure',
        'Consider need for decontamination before patient transport',
        'Contact poison control center early for expert guidance (1-800-222-1222)',
        'Consider law enforcement involvement if intentional poisoning suspected'
      ],
      contraindications: [
        'Do not enter contaminated areas without proper protective equipment',
        'Avoid mouth-to-mouth resuscitation in suspected ingestion cases',
        'Do not induce vomiting unless specifically directed by poison control'
      ],
      safetyNotes: [
        'Provider safety is paramount - never compromise your safety',
        'Unknown substances should be treated as highly hazardous',
        'Secondary contamination can affect healthcare providers'
      ]
    },
    {
      id: 'poison-step-2',
      stepNumber: 2,
      title: 'Primary Assessment and Stabilization',
      description: 'Complete ABCDE assessment and address immediate life threats',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess airway patency - poisoning may cause altered mental status',
        'Evaluate breathing adequacy - some toxins affect respiratory drive',
        'Check circulation and blood pressure - watch for cardiovascular collapse',
        'Assess neurological status using Glasgow Coma Scale',
        'Check blood glucose level - hypoglycemia can mimic intoxication',
        'Monitor cardiac rhythm - many toxins cause arrhythmias',
        'Measure core temperature - hypo/hyperthermia common in poisoning',
        'Establish IV access for medication and fluid administration'
      ],
      safetyNotes: [
        'Altered mental status may require airway protection',
        'Some toxins can cause rapid deterioration',
        'Maintain continuous cardiac monitoring'
      ]
    },
    {
      id: 'poison-step-3',
      stepNumber: 3,
      title: 'Toxin Identification and History',
      description: 'Gather detailed information about the toxic exposure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Determine what substance was involved - name, concentration, formulation',
        'Establish amount ingested/absorbed - estimate quantity and concentration',
        'Determine time of exposure - critical for treatment decisions',
        'Assess route of exposure: ingestion, inhalation, dermal, injection',
        'Gather medication history - prescription and over-the-counter drugs',
        'Ask about suicide attempt vs accidental exposure',
        'Check for co-ingestants including alcohol or other drugs',
        'Document symptoms and progression since exposure occurred'
      ],
      safetyNotes: [
        'Patients may be unreliable historians due to altered mental status',
        'Family members and witnesses provide crucial information',
        'Bring substance containers to hospital if safe to do so'
      ]
    },
    {
      id: 'poison-step-4',
      stepNumber: 4,
      title: 'Decontamination Procedures',
      description: 'Implement appropriate decontamination based on exposure route',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Dermal exposure: Remove contaminated clothing and jewelry safely',
        'Irrigate affected skin with copious amounts of water (15-20 minutes)',
        'Eye exposure: Continuous irrigation with normal saline or water',
        'Inhalation: Move patient to fresh air and provide supplemental oxygen',
        'Ingestion: Consider activated charcoal per protocol and poison control',
        'Do not induce vomiting except on specific poison control recommendation',
        'For caustic ingestions: do not neutralize - dilute with water or milk only',
        'Document decontamination procedures and patient response'
      ],
      contraindications: [
        'Do not induce vomiting for caustic substances or petroleum products',
        'Activated charcoal contraindicated for caustics, alcohols, or decreased LOC',
        'Avoid gastric lavage except in very specific circumstances'
      ],
      safetyNotes: [
        'Decontamination water runoff may be hazardous',
        'Some substances may be absorbed through intact skin',
        'Eye irrigation should continue en route to hospital if needed'
      ]
    },
    {
      id: 'poison-step-5',
      stepNumber: 5,
      title: 'Antidote Administration and Supportive Care',
      description: 'Administer specific antidotes and provide supportive treatment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Administer specific antidotes per protocol: naloxone for opioids',
        'Give flumazenil for benzodiazepines ONLY if no seizure risk',
        'Consider thiamine and dextrose for altered mental status',
        'Provide oxygen for carbon monoxide or cyanide poisoning',
        'Use atropine for organophosphate/cholinergic poisoning per protocol',
        'Calcium gluconate for calcium channel blocker or hydrofluoric acid',
        'Supportive care: IV fluids, vasopressors, antiarrhythmics as needed',
        'Contact poison control for specific antidote recommendations'
      ],
      safetyNotes: [
        'Some antidotes can be dangerous if used inappropriately',
        'Flumazenil can precipitate seizures in chronic benzodiazepine users',
        'Multiple doses of naloxone may be needed for long-acting opioids'
      ]
    },
    {
      id: 'poison-step-6',
      stepNumber: 6,
      title: 'Monitoring and Complication Management',
      description: 'Continuously monitor for and manage toxicological complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Monitor vital signs continuously - watch for sudden deterioration',
        'Assess for seizures and have anticonvulsants readily available',
        'Watch for cardiac arrhythmias and conduction abnormalities',
        'Monitor respiratory status - be prepared for intubation',
        'Check blood glucose frequently - maintain normal levels',
        'Assess for hyperthermia or hypothermia requiring temperature management',
        'Monitor urine output and renal function in nephrotoxic exposures',
        'Document all treatments and patient responses throughout care'
      ],
      safetyNotes: [
        'Toxicological emergencies can deteriorate rapidly',
        'Some complications may be delayed hours after exposure',
        'Continuous monitoring is essential throughout transport'
      ]
    },
    {
      id: 'poison-step-7',
      stepNumber: 7,
      title: 'Psychological Assessment and Crisis Intervention',
      description: 'Assess for intentional self-harm and provide crisis support',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess for suicidal ideation or intentional self-harm behavior',
        'Use non-judgmental approach when discussing intentional poisoning',
        'Provide emotional support and crisis counseling as appropriate',
        'Ensure patient safety during transport - prevent further self-harm',
        'Involve mental health professionals if available and indicated',
        'Document mental health assessment and risk factors',
        'Consider need for law enforcement or security involvement',
        'Prepare receiving hospital for potential psychiatric consultation'
      ],
      contraindications: [
        'Do not leave suicidal patients alone or unrestrained',
        'Avoid judgmental comments that may worsen psychological state',
        'Do not promise confidentiality in cases of self-harm risk'
      ],
      safetyNotes: [
        'Suicidal patients may attempt additional self-harm during transport',
        'Some toxins can cause psychiatric symptoms mimicking mental illness',
        'Safety of patient and providers requires careful monitoring'
      ]
    },
    {
      id: 'poison-step-8',
      stepNumber: 8,
      title: 'Hospital Communication and Evidence Preservation',
      description: 'Communicate with receiving facility and preserve forensic evidence',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Provide detailed report to receiving hospital including substance, amount, time',
        'Communicate all treatments given and patient responses',
        'Transfer all product containers and remaining substances safely',
        'Document chain of custody for potential forensic evidence',
        'Notify hospital of decontamination procedures performed',
        'Communicate poison control center consultations and recommendations',
        'Alert hospital to potential need for specific antidotes or treatments',
        'Prepare for potential law enforcement involvement in intentional cases'
      ],
      safetyNotes: [
        'Substance containers may be needed for laboratory analysis',
        'Proper documentation is essential for legal proceedings',
        'Early hospital notification improves preparation for complex cases'
      ]
    }
  ],

  // 22. BURNS AND THERMAL INJURY MANAGEMENT - Specialized burn care
  'burns-thermal-injury-management': [
    {
      id: 'burns-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Fire Suppression',
      description: 'Ensure scene safety and eliminate ongoing thermal hazards',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess scene for active fire, hot surfaces, or continuing thermal hazards',
        'Ensure fire is completely extinguished before patient approach',
        'Look for electrical hazards including downed power lines',
        'Check for chemical burns from industrial or household substances',
        'Assess building structural integrity in fire-related incidents',
        'Consider need for specialized rescue teams for confined spaces',
        'Don appropriate protective equipment to prevent provider injury',
        'Establish safe perimeter and control access to scene'
      ],
      contraindications: [
        'Do not enter unsafe areas with active fire or electrical hazards',
        'Avoid approaching patients in unstable structures',
        'Do not attempt rescue without proper training and equipment'
      ],
      safetyNotes: [
        'Provider safety takes priority over patient care in hazardous environments',
        'Burns can be associated with smoke inhalation and toxic gas exposure',
        'Electrical burns may have internal injury not visible externally'
      ]
    },
    {
      id: 'burns-step-2',
      stepNumber: 2,
      title: 'Primary Assessment and Airway Management',
      description: 'Complete primary assessment with focus on airway burns and inhalation injury',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess airway for burns, swelling, or signs of inhalation injury',
        'Look for singed nasal hairs, facial burns, or carbonaceous sputum',
        'Evaluate voice changes, stridor, or respiratory distress',
        'Check for circumferential neck burns affecting airway',
        'Consider early intubation if signs of airway compromise present',
        'Provide high-flow oxygen for all burn patients',
        'Monitor for carbon monoxide poisoning symptoms',
        'Assess breathing adequacy and chest wall movement'
      ],
      safetyNotes: [
        'Airway edema can develop rapidly and unpredictably in burn patients',
        'Early intubation may be needed before transport',
        'Carbon monoxide poisoning is common in enclosed space fires'
      ]
    },
    {
      id: 'burns-step-3',
      stepNumber: 3,
      title: 'Burn Assessment and Classification',
      description: 'Systematically assess burn depth, extent, and severity',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Classify burn depth: superficial, partial-thickness, full-thickness',
        'Use Rule of Nines to estimate total body surface area (TBSA) burned',
        'Document burn location and identify high-risk areas (face, hands, perineum)',
        'Assess for circumferential burns that may compromise circulation',
        'Look for electrical entry and exit wounds if electrical injury',
        'Check for associated trauma from explosion or fall',
        'Document burn mechanism: flame, scald, contact, chemical, electrical',
        'Take photographs if possible for burn center consultation'
      ],
      safetyNotes: [
        'Burns >15% TBSA in adults or >10% in children require burn center care',
        'Circumferential burns may require escharotomy to prevent compartment syndrome',
        'Electrical burns may have significant internal injury'
      ]
    },
    {
      id: 'burns-step-4',
      stepNumber: 4,
      title: 'Burn Cooling and Initial Treatment',
      description: 'Provide immediate cooling therapy and stop the burning process',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Remove patient from heat source and remove burning clothing',
        'Apply cool (not ice-cold) water to burns for 10-20 minutes',
        'Remove jewelry and tight clothing before swelling occurs',
        'Stop cooling when hypothermia risk outweighs benefit',
        'Cover burns with clean, dry dressings - avoid wet dressings',
        'Do not apply ice, butter, or home remedies to burns',
        'For chemical burns: continuous irrigation with copious water',
        'Remove all contaminated clothing in chemical exposure'
      ],
      contraindications: [
        'Do not use ice or ice water on burns - causes vasoconstriction',
        'Avoid prolonged cooling in patients with large burns (hypothermia risk)',
        'Do not remove clothing that is adherent to burned skin'
      ],
      safetyNotes: [
        'Cooling reduces pain and may minimize burn progression',
        'Hypothermia is a significant risk in patients with large burns',
        'Chemical burns require immediate and prolonged irrigation'
      ]
    },
    {
      id: 'burns-step-5',
      stepNumber: 5,
      title: 'Fluid Resuscitation and Vascular Access',
      description: 'Establish IV access and begin fluid resuscitation per burn protocols',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Establish large-bore IV access in unburned areas if possible',
        'Calculate fluid needs using Parkland formula (4ml/kg/%TBSA)',
        'Give half of calculated fluid in first 8 hours from time of burn',
        'Use lactated Ringer\'s solution for initial resuscitation',
        'Consider intraosseous access if IV access difficult',
        'Monitor urine output as guide to adequate resuscitation',
        'Adjust fluid rate based on patient response and vital signs',
        'Document exact time of burn injury for accurate fluid calculations'
      ],
      safetyNotes: [
        'Burn shock can develop rapidly in patients with >15% TBSA burns',
        'Over-resuscitation can lead to pulmonary edema and compartment syndrome',
        'IV access through burned skin is acceptable if no other option available'
      ]
    },
    {
      id: 'burns-step-6',
      stepNumber: 6,
      title: 'Pain Management and Patient Comfort',
      description: 'Provide appropriate analgesia and comfort measures for burn patients',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess pain level using appropriate scale (burns are extremely painful)',
        'Administer IV opioids (morphine or fentanyl) per protocol',
        'Titrate analgesics to patient comfort while monitoring respiratory status',
        'Consider ketamine for severe pain in hemodynamically stable patients',
        'Position patient to minimize pain and prevent contractures',
        'Maintain normal body temperature to prevent hypothermia',
        'Provide emotional support and reassurance to anxious patient',
        'Cover patient with clean blankets to preserve dignity and warmth'
      ],
      safetyNotes: [
        'Burn pain is severe and requires adequate analgesia',
        'Monitor respiratory status closely with opioid administration',
        'Hypothermia is common in burn patients and worsens outcomes'
      ]
    },
    {
      id: 'burns-step-7',
      stepNumber: 7,
      title: 'Monitoring and Complication Management',
      description: 'Monitor for and manage burn-related complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Monitor vital signs continuously - watch for shock development',
        'Assess for compartment syndrome in circumferential burns',
        'Check distal pulses and capillary refill in burned extremities',
        'Monitor for signs of carbon monoxide poisoning',
        'Watch for respiratory distress from inhalation injury',
        'Assess for rhabdomyolysis in electrical burns',
        'Monitor urine output and color (dark urine suggests myoglobinuria)',
        'Check for associated injuries that may have been masked by burn pain'
      ],
      safetyNotes: [
        'Compartment syndrome can develop rapidly in circumferential burns',
        'Carbon monoxide poisoning may not be immediately apparent',
        'Electrical burns can cause cardiac arrhythmias and internal organ damage'
      ]
    },
    {
      id: 'burns-step-8',
      stepNumber: 8,
      title: 'Transport and Hospital Coordination',
      description: 'Determine appropriate receiving facility and coordinate transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Determine if patient meets burn center criteria per ABA guidelines',
        'Consider helicopter transport for patients requiring burn center care',
        'Contact burn center for consultation and acceptance',
        'Prepare detailed report including burn size, depth, and mechanism',
        'Continue fluid resuscitation and monitoring during transport',
        'Communicate all treatments given and patient responses',
        'Ensure burn center is prepared for immediate evaluation',
        'Consider need for intubation during transport if airway concerns'
      ],
      safetyNotes: [
        'Burn center criteria include burns >15% TBSA, airway burns, electrical burns',
        'Early burn center consultation improves outcomes',
        'Transport should not delay essential treatments like airway management'
      ]
    }
  ],

  // 23. CHEST PAIN AND ACUTE CORONARY SYNDROME - Cardiac emergency management
  'chest-pain-acs-management': [
    {
      id: 'chest-pain-step-1',
      stepNumber: 1,
      title: 'Initial Assessment and Scene Safety',
      description: 'Perform rapid initial assessment focusing on cardiac emergency',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess scene safety and approach patient calmly to reduce anxiety',
        'Observe patient position and apparent distress level',
        'Check airway, breathing, and circulation immediately',
        'Assess level of consciousness and ability to communicate',
        'Note skin color, diaphoresis, and general appearance',
        'Position patient in position of comfort (usually sitting upright)',
        'Apply pulse oximetry and obtain baseline vital signs',
        'Begin continuous cardiac monitoring immediately'
      ],
      safetyNotes: [
        'Cardiac patients may be anxious and require calm, reassuring approach',
        'Position of comfort often helps reduce cardiac workload',
        'Continuous monitoring is essential as condition can deteriorate rapidly'
      ]
    },
    {
      id: 'chest-pain-step-2',
      stepNumber: 2,
      title: 'Focused Cardiac History',
      description: 'Obtain detailed history using systematic approach',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Use OPQRST method: Onset, Provocation, Quality, Region, Severity, Time',
        'Assess pain characteristics: crushing, burning, pressure, sharp, radiating',
        'Determine radiation pattern: jaw, neck, arms, back, epigastrium',
        'Identify associated symptoms: nausea, vomiting, diaphoresis, dyspnea',
        'Gather cardiac risk factors: diabetes, hypertension, smoking, family history',
        'Review medications: cardiac drugs, erectile dysfunction medications',
        'Ask about previous cardiac events, procedures, or hospitalizations',
        'Assess activity level and functional capacity before symptoms'
      ],
      safetyNotes: [
        'Atypical presentations are common in women, elderly, and diabetic patients',
        'Erectile dysfunction medications contraindicate nitrate administration',
        'Previous cardiac history significantly increases risk of ACS'
      ]
    },
    {
      id: 'chest-pain-step-3',
      stepNumber: 3,
      title: '12-Lead ECG Acquisition',
      description: 'Obtain and interpret 12-lead ECG within 10 minutes',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Acquire 12-lead ECG within 10 minutes of patient contact',
        'Ensure proper electrode placement and minimize artifact',
        'Look for ST-elevation myocardial infarction (STEMI) criteria',
        'Identify ST-depression, T-wave changes, or new Q-waves',
        'Compare with old ECG if available',
        'Consider posterior ECG (V7-V9) if inferior changes present',
        'Obtain right-sided ECG if right heart involvement suspected',
        'Document ECG findings and time of acquisition'
      ],
      safetyNotes: [
        'STEMI requires immediate cardiac catheterization lab activation',
        'ECG interpretation can be challenging and requires expert review',
        'Serial ECGs may be needed to identify evolving changes'
      ]
    },
    {
      id: 'chest-pain-step-4',
      stepNumber: 4,
      title: 'Oxygen and Medication Administration',
      description: 'Provide oxygen and appropriate cardiac medications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Give oxygen only if SpO2 <90% or signs of respiratory distress',
        'Administer aspirin 160-325mg chewed (unless contraindicated)',
        'Give sublingual nitroglycerin 0.4mg if chest pain and SBP >100mmHg',
        'Repeat nitroglycerin every 5 minutes up to 3 doses if pain persists',
        'Consider morphine 2-4mg IV for severe pain not relieved by nitrates',
        'Establish IV access with normal saline at keep-open rate',
        'Monitor blood pressure closely with nitroglycerin administration',
        'Document all medications given with times and patient responses'
      ],
      contraindications: [
        'Aspirin allergy or active gastrointestinal bleeding',
        'Nitroglycerin if SBP <100mmHg or recent sildenafil/tadalafil use',
        'Avoid oxygen in normoxic patients without respiratory distress'
      ],
      safetyNotes: [
        'Nitroglycerin can cause significant hypotension',
        'Aspirin is crucial for platelet aggregation inhibition',
        'Monitor for allergic reactions to medications'
      ]
    },
    {
      id: 'chest-pain-step-5',
      stepNumber: 5,
      title: 'Risk Stratification and Assessment',
      description: 'Assess patient risk and determine urgency of care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Use validated risk scores (TIMI, HEART, or GRACE if available)',
        'Assess for high-risk features: ongoing chest pain, dynamic ECG changes',
        'Look for signs of heart failure: rales, JVD, peripheral edema',
        'Check for cardiogenic shock: hypotension, altered mental status, cool skin',
        'Assess for mechanical complications: new murmurs, pericardial friction rub',
        'Monitor for arrhythmias including heart blocks and ventricular ectopy',
        'Consider differential diagnosis: aortic dissection, PE, pericarditis',
        'Document risk assessment and clinical decision-making rationale'
      ],
      safetyNotes: [
        'High-risk patients require immediate advanced cardiac care',
        'Cardiogenic shock has high mortality and requires urgent intervention',
        'Aortic dissection can mimic MI but requires different treatment approach'
      ]
    },
    {
      id: 'chest-pain-step-6',
      stepNumber: 6,
      title: 'Advanced Cardiac Life Support',
      description: 'Manage cardiac complications and life-threatening arrhythmias',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Monitor for ventricular fibrillation/tachycardia and prepare for defibrillation',
        'Manage bradycardia with atropine or transcutaneous pacing per protocol',
        'Treat hemodynamically significant tachycardias with cardioversion',
        'Prepare for cardiac arrest with immediate CPR and ACLS protocols',
        'Consider thrombolytic therapy for STEMI if PCI not available within timeframe',
        'Manage cardiogenic shock with vasopressors and mechanical support consultation',
        'Use caution with fluids in heart failure patients',
        'Document all interventions and patient responses'
      ],
      safetyNotes: [
        'Cardiac arrest in ACS patients often presents as ventricular arrhythmias',
        'Thrombolytics have bleeding risks and specific contraindications',
        'Early defibrillation is crucial for survival in VF/VT arrest'
      ]
    },
    {
      id: 'chest-pain-step-7',
      stepNumber: 7,
      title: 'Continuous Monitoring and Reassessment',
      description: 'Provide ongoing monitoring and reassess patient status',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Monitor vital signs and cardiac rhythm continuously',
        'Reassess chest pain level and character frequently',
        'Watch for changes in ECG indicative of evolving MI',
        'Monitor for signs of reperfusion: resolution of chest pain, ST-segment normalization',
        'Assess for bleeding complications if thrombolytics administered',
        'Monitor neurological status for signs of stroke (thrombolytic complication)',
        'Continue oxygen saturation monitoring and respiratory assessment',
        'Document ongoing assessment findings and trends'
      ],
      safetyNotes: [
        'Patient condition can change rapidly requiring immediate intervention',
        'Reperfusion can be associated with reperfusion arrhythmias',
        'Bleeding complications require immediate recognition and management'
      ]
    },
    {
      id: 'chest-pain-step-8',
      stepNumber: 8,
      title: 'Hospital Communication and Transport',
      description: 'Coordinate with receiving hospital for optimal patient care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Activate cardiac catheterization lab for STEMI patients',
        'Provide early notification to emergency department with ECG transmission',
        'Communicate patient history, symptoms, ECG findings, and treatments given',
        'Determine appropriate receiving facility based on patient needs and capabilities',
        'Consider helicopter transport for time-critical STEMI in rural areas',
        'Continue treatments and monitoring during transport',
        'Prepare for potential deterioration during transport',
        'Ensure smooth transition of care with complete report to receiving team'
      ],
      safetyNotes: [
        'Door-to-balloon time goals require efficient communication and transport',
        'STEMI patients benefit from direct transport to PCI-capable facilities',
        'Transport should not delay essential treatments like defibrillation'
      ]
    }
  ],

  // 24. 12-LEAD ECG LEAD PLACEMENT AND ACQUISITION - Diagnostic cardiology
  '12-lead-ecg-placement': [
    {
      id: 'ecg-placement-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Preparation',
      description: 'Assess patient condition and prepare for 12-lead ECG acquisition',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess patient\'s clinical condition and chief complaint',
        'Explain procedure to patient to reduce anxiety and improve cooperation',
        'Ensure patient privacy and proper draping for chest exposure',
        'Position patient supine with arms relaxed at sides',
        'Ask patient to remain still and avoid talking during acquisition',
        'Check for pacemaker or implanted cardiac devices',
        'Note any chest hair that may need trimming for electrode adhesion',
        'Ensure room temperature is comfortable to prevent shivering artifact'
      ],
      contraindications: [
        'No absolute contraindications for ECG acquisition',
        'Relative caution with skin breakdown or burns at electrode sites',
        'Consider patient modesty and provide appropriate draping'
      ],
      safetyNotes: [
        'Respect patient dignity and maintain privacy throughout procedure',
        'Be aware of pacemaker presence for interpretation purposes',
        'Ensure patient comfort to minimize movement artifact'
      ]
    },
    {
      id: 'ecg-placement-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Calibration',
      description: 'Prepare ECG machine and verify proper calibration',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Check ECG machine power supply and battery level',
        'Verify machine is calibrated (10mm/mV amplitude, 25mm/sec speed)',
        'Ensure adequate paper supply for tracing',
        'Check all lead cables for damage or loose connections',
        'Prepare 10 ECG electrodes, ensuring they are not expired',
        'Verify electrode gel/adhesive is moist and functional',
        'Set machine to 12-lead acquisition mode',
        'Test machine with calibration signal if available'
      ],
      equipmentNeeded: [
        '12-lead ECG machine',
        '10 ECG electrodes (not expired)',
        'Lead cables (complete set)',
        'Razor for hair removal if needed',
        'Alcohol wipes for skin preparation',
        'ECG paper or digital storage device'
      ],
      safetyNotes: [
        'Ensure all electrical equipment is properly grounded',
        'Check electrode expiration dates to ensure adhesion',
        'Have backup electrodes available if adhesion fails'
      ]
    },
    {
      id: 'ecg-placement-step-3',
      stepNumber: 3,
      title: 'Skin Preparation and Hair Removal',
      description: 'Prepare skin surface for optimal electrode contact',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Expose chest completely while maintaining patient dignity',
        'Identify electrode placement sites using anatomical landmarks',
        'Trim excess chest hair at electrode sites if present (do not shave)',
        'Clean electrode sites with alcohol wipes if visibly dirty',
        'Allow skin to dry completely before electrode application',
        'Gently abrade skin with gauze to improve conductivity (optional)',
        'Remove oils, lotions, or debris that may interfere with adhesion',
        'Ensure skin is dry and at room temperature'
      ],
      safetyNotes: [
        'Trimming hair is preferred over shaving to prevent skin irritation',
        'Avoid excessive skin abrasion which can cause discomfort',
        'Allow alcohol to dry completely to prevent skin irritation'
      ]
    },
    {
      id: 'ecg-placement-step-4',
      stepNumber: 4,
      title: 'Limb Lead Electrode Placement',
      description: 'Apply limb electrodes in correct anatomical positions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Right arm (RA/WHITE): Right shoulder area or wrist, avoiding bony prominences',
        'Left arm (LA/BLACK): Left shoulder area or wrist, mirror image of right arm',
        'Right leg (RL/GREEN): Right lower abdomen or ankle - serves as ground electrode',
        'Left leg (LL/RED): Left lower abdomen or ankle, avoiding bony areas',
        'Place electrodes on flat, muscular areas rather than over ribs or bones',
        'Ensure electrodes are at least 10cm from the heart',
        'Press electrodes firmly for 2-3 seconds to ensure good contact',
        'Verify electrode colors match lead cable colors before connecting'
      ],
      equipmentNeeded: [
        'Limb electrodes (4 total): RA-white, LA-black, RL-green, LL-red'
      ],
      safetyNotes: [
        'Consistent placement is crucial for accurate interpretation',
        'Avoid placing electrodes over clothing or jewelry',
        'Ensure patient is comfortable with limb positioning'
      ]
    },
    {
      id: 'ecg-placement-step-5',
      stepNumber: 5,
      title: 'Precordial Lead Electrode Placement',
      description: 'Apply chest electrodes in precise anatomical locations',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'V1 (RED): 4th intercostal space at right sternal border',
        'V2 (YELLOW): 4th intercostal space at left sternal border',
        'V4 (BLUE): 5th intercostal space at left midclavicular line (place before V3)',
        'V3 (GREEN): Midway between V2 and V4 positions',
        'V5 (ORANGE): Same horizontal level as V4, at left anterior axillary line',
        'V6 (PURPLE): Same horizontal level as V4 and V5, at left midaxillary line',
        'Use anatomical landmarks: locate 2nd intercostal space at sternal angle (Angle of Louis)',
        'Count down intercostal spaces carefully - palpate, don\'t just visualize'
      ],
      equipmentNeeded: [
        'Precordial electrodes (6 total): V1-red, V2-yellow, V3-green, V4-blue, V5-orange, V6-purple'
      ],
      safetyNotes: [
        'Precise placement is critical for accurate diagnosis',
        'Misplacement can lead to false positive or negative findings',
        'In women, place V3-V6 under the breast, not on breast tissue'
      ]
    },
    {
      id: 'ecg-placement-step-6',
      stepNumber: 6,
      title: 'Lead Cable Connection and System Check',
      description: 'Connect lead cables and verify proper system function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Connect lead cables to corresponding electrodes using color coding',
        'Ensure all connections are secure and properly seated',
        'Check for loose electrodes by gently tugging cables',
        'Verify no "leads off" or artifact warnings on ECG display',
        'Observe for 60Hz electrical interference or muscle artifact',
        'Check that all 12 leads are displaying properly on monitor',
        'Ensure patient is comfortable and cables are not pulling',
        'Position cables to avoid patient movement restrictions'
      ],
      safetyNotes: [
        'Poor connections will result in artifact or "leads off" alarms',
        'Ensure patient comfort to minimize movement artifact',
        'Check for electrical interference from other equipment'
      ]
    },
    {
      id: 'ecg-placement-step-7',
      stepNumber: 7,
      title: 'ECG Acquisition and Quality Assessment',
      description: 'Acquire 12-lead ECG and assess tracing quality',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Instruct patient to remain still and breathe normally during acquisition',
        'Acquire ECG tracing ensuring at least 6-10 seconds of data',
        'Assess tracing quality: clear P waves, QRS complexes, and T waves',
        'Check for baseline wander, muscle artifact, or electrical interference',
        'Verify calibration markers (10mm high calibration pulse)',
        'Ensure all 12 leads have adequate signal quality',
        'Repeat acquisition if quality is poor or artifact is present',
        'Print or save ECG with patient identifiers and timestamp'
      ],
      safetyNotes: [
        'Poor quality tracings can lead to misdiagnosis',
        'Patient movement or talking will create artifact',
        'Ensure proper calibration for accurate voltage measurements'
      ]
    },
    {
      id: 'ecg-placement-step-8',
      stepNumber: 8,
      title: 'Documentation and Electrode Removal',
      description: 'Complete documentation and safely remove electrodes',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Label ECG with patient name, date, time, and clinical indication',
        'Document any factors that may affect interpretation (medications, symptoms)',
        'Note electrode placement variations if non-standard positioning used',
        'Remove electrodes gently to avoid skin trauma',
        'Clean any residual electrode gel from patient\'s skin',
        'Assist patient with re-dressing and positioning',
        'Clean and store ECG equipment properly',
        'Ensure ECG is properly filed or transmitted for interpretation'
      ],
      safetyNotes: [
        'Remove electrodes slowly to prevent skin tears',
        'Proper documentation ensures quality continuity of care',
        'Clean equipment prevents cross-contamination'
      ]
    }
  ],

  // 25. CONTINUOUS POSITIVE AIRWAY PRESSURE (CPAP) - Advanced respiratory support
  'cpap-ventilation': [
    {
      id: 'cpap-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and CPAP Indication',
      description: 'Assess patient for CPAP candidacy and determine clinical indications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess patient for acute respiratory distress with signs of pulmonary edema',
        'Look for classic signs: orthopnea, bilateral rales, frothy sputum, anxiety',
        'Evaluate level of consciousness (GCS ≥13 required for CPAP)',
        'Check vital signs: typically hypertensive, tachycardic, tachypneic',
        'Assess work of breathing: accessory muscle use, tripod positioning',
        'Review history: heart failure, COPD exacerbation, pneumonia',
        'Consider CPAP for: acute pulmonary edema, COPD exacerbation, pneumonia',
        'Rule out contraindications before proceeding with CPAP therapy'
      ],
      contraindications: [
        'Altered mental status (GCS <13) or inability to protect airway',
        'Active vomiting or high risk of aspiration',
        'Facial trauma preventing adequate mask seal',
        'Untreated pneumothorax or risk of barotrauma',
        'Severe hypotension (SBP <90mmHg)',
        'Cardiac arrest or impending respiratory arrest'
      ],
      safetyNotes: [
        'Patient must be conscious and able to remove mask if needed',
        'Continuous monitoring essential due to potential for rapid deterioration',
        'Have intubation equipment immediately available'
      ]
    },
    {
      id: 'cpap-step-2',
      stepNumber: 2,
      title: 'Equipment Setup and System Check',
      description: 'Prepare CPAP equipment and perform comprehensive system checks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assemble CPAP unit: generator, breathing circuit, PEEP valve, mask',
        'Connect oxygen source and set flow rate to 10-15 L/min minimum',
        'Check PEEP valve setting (typically 5-10 cmH2O for initial therapy)',
        'Test system for leaks by occluding mask and checking pressure maintenance',
        'Verify reservoir bag inflates properly and maintains volume',
        'Select appropriate mask size (small, medium, large) for patient',
        'Check mask cushion for damage and ensure proper seal capability',
        'Have backup equipment available including bag-valve-mask'
      ],
      equipmentNeeded: [
        'CPAP generator unit',
        'Breathing circuit with reservoir bag',
        'PEEP valve (adjustable 5-20 cmH2O)',
        'Face masks (multiple sizes)',
        'Head straps and securing devices',
        'Oxygen source with flow meter',
        'Manometer for pressure monitoring'
      ],
      safetyNotes: [
        'All connections must be secure to prevent pressure loss',
        'Have manual ventilation ready as backup',
        'Check equipment function before patient application'
      ]
    },
    {
      id: 'cpap-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Preparation',
      description: 'Position patient optimally for CPAP therapy and explain procedure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position patient in high Fowler\'s position (45-90 degrees upright)',
        'Ensure patient is comfortable and can easily communicate',
        'Explain procedure: "This mask will help make breathing easier"',
        'Warn about initial sensation of pressure and tight-fitting mask',
        'Establish communication signals for patient distress',
        'Position suction equipment within immediate reach',
        'Have bag-valve-mask visible and accessible for patient reassurance',
        'Ensure adequate lighting and space for monitoring'
      ],
      safetyNotes: [
        'Upright positioning reduces aspiration risk and improves ventilation',
        'Patient cooperation essential for CPAP success',
        'Be prepared to remove mask immediately if patient becomes distressed'
      ]
    },
    {
      id: 'cpap-step-4',
      stepNumber: 4,
      title: 'Mask Application and Initial CPAP Delivery',
      description: 'Apply mask properly and initiate CPAP therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Hold mask gently against patient\'s face initially without straps',
        'Allow patient to acclimate to pressure sensation gradually',
        'Check for proper mask seal around nose and mouth',
        'Apply head straps with minimal tension - just enough for seal',
        'Monitor initial patient response: anxiety, claustrophobia, cooperation',
        'Adjust mask position to optimize comfort and seal',
        'Observe for chest rise improvement and decreased work of breathing',
        'Monitor oxygen saturation and respiratory rate response'
      ],
      safetyNotes: [
        'Gradual introduction reduces patient anxiety and improves tolerance',
        'Excessive strap tension can cause pressure sores and discomfort',
        'Monitor for signs of gastric insufflation'
      ]
    },
    {
      id: 'cpap-step-5',
      stepNumber: 5,
      title: 'Pressure Titration and Optimization',
      description: 'Adjust CPAP pressure settings based on patient response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Start with low pressure (5 cmH2O) and titrate upward as tolerated',
        'Increase pressure gradually (2-3 cmH2O increments) every 2-3 minutes',
        'Monitor clinical response: decreased work of breathing, improved oxygenation',
        'Optimal pressure typically 8-12 cmH2O for pulmonary edema',
        'For COPD exacerbation: lower pressures (5-8 cmH2O) often preferred',
        'Assess patient comfort and tolerance with each pressure adjustment',
        'Watch for signs of barotrauma or cardiovascular compromise',
        'Document pressure settings and patient response to adjustments'
      ],
      safetyNotes: [
        'Higher pressures increase risk of barotrauma and hypotension',
        'Patient comfort and clinical improvement guide pressure selection',
        'Monitor blood pressure closely as CPAP can reduce venous return'
      ]
    },
    {
      id: 'cpap-step-6',
      stepNumber: 6,
      title: 'Continuous Monitoring and Assessment',
      description: 'Provide ongoing patient monitoring and assessment during CPAP therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor vital signs every 5 minutes initially, then every 15 minutes',
        'Continuously assess work of breathing and respiratory pattern',
        'Watch oxygen saturation trends and response to therapy',
        'Observe for signs of improvement: decreased anxiety, better color, easier breathing',
        'Monitor for complications: pneumothorax, hypotension, gastric distension',
        'Assess mask fit regularly and adjust as needed',
        'Document patient response and any changes in clinical condition',
        'Be prepared to discontinue CPAP if patient deteriorates'
      ],
      safetyNotes: [
        'Continuous monitoring essential - patient condition can change rapidly',
        'Signs of improvement may take 10-20 minutes to appear',
        'Early recognition of complications prevents serious adverse outcomes'
      ]
    },
    {
      id: 'cpap-step-7',
      stepNumber: 7,
      title: 'Complication Recognition and Management',
      description: 'Identify and manage potential complications of CPAP therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Monitor for pneumothorax: sudden chest pain, decreased breath sounds, hypotension',
        'Watch for cardiovascular effects: hypotension from decreased venous return',
        'Assess for gastric insufflation: abdominal distension, nausea, vomiting',
        'Check for mask-related complications: pressure sores, eye irritation',
        'Monitor for patient intolerance: anxiety, claustrophobia, agitation',
        'Recognize failure of CPAP therapy: worsening respiratory distress',
        'Be prepared for immediate transition to bag-valve-mask or intubation',
        'Document any complications and interventions performed'
      ],
      contraindications: [
        'Do not continue CPAP if patient becomes unconscious or unable to cooperate',
        'Stop CPAP immediately if pneumothorax suspected',
        'Discontinue if patient develops severe hypotension or cardiovascular instability'
      ],
      safetyNotes: [
        'Have suction and airway management equipment immediately available',
        'Rapid transition to alternative ventilation may be life-saving',
        'Patient safety takes precedence over continuing CPAP therapy'
      ]
    },
    {
      id: 'cpap-step-8',
      stepNumber: 8,
      title: 'Transport Considerations and Handoff',
      description: 'Manage CPAP during transport and provide comprehensive handoff',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Ensure adequate oxygen supply for duration of transport',
        'Secure CPAP equipment to prevent disconnection during transport',
        'Continue monitoring patient response throughout transport',
        'Communicate with receiving facility about CPAP therapy and patient response',
        'Provide report including: indication, pressure settings, duration, complications',
        'Document total time on CPAP and overall patient response',
        'Be prepared to manage equipment failure or patient deterioration en route',
        'Ensure smooth transition of care to hospital staff'
      ],
      safetyNotes: [
        'Equipment failure during transport requires immediate backup ventilation',
        'Clear communication ensures continuity of respiratory support',
        'Transport should not delay definitive care if patient failing CPAP'
      ]
    }
  ],

  // 26. NEEDLE THORACENTESIS (DECOMPRESSION) - Emergency thoracic procedure for tension pneumothorax
  'needle-thoracentesis': [
    {
      id: 'needle-thoracentesis-step-1',
      stepNumber: 1,
      title: 'Recognition and Assessment of Tension Pneumothorax',
      description: 'Identify clinical signs of tension pneumothorax requiring immediate decompression',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess for classic triad: respiratory distress, hemodynamic instability, absent breath sounds',
        'Look for tracheal deviation away from affected side (late sign)',
        'Check for jugular venous distension (JVD) and hypotension',
        'Observe hyperresonance to percussion on affected side',
        'Assess for subcutaneous emphysema around chest and neck',
        'Consider mechanism: penetrating trauma, blunt chest trauma, barotrauma',
        'Monitor for rapid deterioration: this is a time-critical emergency',
        'Rule out other causes of shock and respiratory distress'
      ],
      indications: [
        'Clinical signs of tension pneumothorax with hemodynamic compromise',
        'Absent or diminished breath sounds with respiratory distress',
        'Tracheal deviation with hypotension',
        'Cardiac arrest with suspected tension pneumothorax'
      ],
      contraindications: [
        'Simple pneumothorax without tension (relative contraindication)',
        'Severe coagulopathy (relative contraindication)',
        'Infection at insertion site',
        'Anatomical abnormalities preventing safe access'
      ],
      safetyNotes: [
        'This is a life-saving procedure - act quickly when indicated',
        'Wrong-side decompression can cause pneumothorax in healthy lung',
        'Consider bilateral decompression in cardiac arrest'
      ]
    },
    {
      id: 'needle-thoracentesis-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Site Selection',
      description: 'Prepare necessary equipment and identify optimal insertion site',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Gather 14-gauge, 2-inch angiocatheter (minimum length for adults)',
        'Prepare antiseptic solution (alcohol or betadine) and gauze',
        'Have flutter valve or three-way stopcock available if possible',
        'Consider second needle ready for bilateral decompression if needed',
        'Locate 2nd intercostal space, midclavicular line (traditional site)',
        'Alternative: 4th-5th intercostal space, anterior axillary line (lateral approach)',
        'Palpate landmarks: 2nd ICS is just below clavicle, above 3rd rib',
        'Ensure adequate lighting and patient positioning'
      ],
      equipmentNeeded: [
        '14-gauge angiocatheter (2-inch minimum)',
        'Antiseptic solution',
        'Sterile gauze pads',
        'Medical tape',
        'Flutter valve or 3-way stopcock',
        'Gloves and protective equipment',
        'Suction equipment nearby'
      ],
      safetyNotes: [
        'Needle must be long enough to reach pleural space through chest wall',
        'Identify correct intercostal space to avoid injury to vessels/nerves',
        'Have resuscitation equipment immediately available'
      ]
    },
    {
      id: 'needle-thoracentesis-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Site Preparation',
      description: 'Position patient optimally and prepare insertion site',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient supine or semi-upright (30-45 degrees) if possible',
        'Expose chest completely for adequate visualization',
        'Locate insertion site: 2nd ICS, midclavicular line on affected side',
        'Clean insertion site with antiseptic in circular motion',
        'Allow antiseptic to dry (at least 30 seconds if time permits)',
        'Put on sterile gloves and maintain sterile technique',
        'Have assistant help with patient positioning if available',
        'Ensure patient airway is secured and monitored'
      ],
      safetyNotes: [
        'Speed is critical - do not delay for extensive sterile prep in emergency',
        'Maintain C-spine immobilization if trauma patient',
        'Monitor patient continuously during procedure'
      ]
    },
    {
      id: 'needle-thoracentesis-step-4',
      stepNumber: 4,
      title: 'Needle Insertion Technique',
      description: 'Perform needle insertion using proper technique and anatomical landmarks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Insert needle perpendicular to chest wall at 90-degree angle',
        'Aim slightly cephalad (toward head) to avoid neurovascular bundle below rib',
        'Advance needle steadily with continuous gentle aspiration',
        'Feel for "pop" sensation as needle enters pleural space',
        'Listen for audible release of air (rush of gas) indicating success',
        'Advance catheter over needle once pleural space entered',
        'Remove needle stylet, leaving plastic catheter in place',
        'Secure catheter with tape and apply occlusive dressing'
      ],
      safetyNotes: [
        'Never insert needle below rib to avoid intercostal artery injury',
        'Stop advancing if resistance met or patient deteriorates',
        'Maintain needle control to prevent deep organ injury'
      ]
    },
    {
      id: 'needle-thoracentesis-step-5',
      stepNumber: 5,
      title: 'Immediate Assessment of Decompression Success',
      description: 'Evaluate immediate response to thoracic decompression',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Listen for audible air escape through catheter (confirms placement)',
        'Assess immediate improvement in vital signs: BP, HR, oxygen saturation',
        'Check for improved breath sounds on affected side',
        'Observe improved chest wall movement and respiratory effort',
        'Monitor for resolution of JVD and improved perfusion',
        'Assess for immediate complications: bleeding, pneumothorax on opposite side',
        'Document time of procedure and patient response',
        'Prepare for possible need of second decompression or tube thoracostomy'
      ],
      safetyNotes: [
        'Improvement should be immediate - if not, reassess diagnosis',
        'Lack of air escape may indicate improper placement or diagnosis',
        'Monitor for iatrogenic complications'
      ]
    },
    {
      id: 'needle-thoracentesis-step-6',
      stepNumber: 6,
      title: 'Catheter Securement and One-Way Valve Setup',
      description: 'Secure catheter and establish one-way valve system if available',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Secure catheter hub firmly with medical tape to prevent dislodgement',
        'Apply occlusive dressing around catheter insertion site',
        'Attach flutter valve or improvised one-way valve if available',
        'Create finger cot valve if commercial valve unavailable',
        'Ensure valve allows air out but prevents air entry',
        'Monitor catheter position and function continuously',
        'Check for continued air leak indicating ongoing pneumothorax',
        'Document catheter position and valve setup'
      ],
      safetyNotes: [
        'Catheter dislodgement can lead to reaccumulation of tension',
        'One-way valve prevents re-expansion of pneumothorax',
        'Monitor valve function throughout transport'
      ]
    },
    {
      id: 'needle-thoracentesis-step-7',
      stepNumber: 7,
      title: 'Ongoing Monitoring and Complication Management',
      description: 'Provide continuous monitoring and manage potential complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor vital signs every 5 minutes and document trends',
        'Continuously assess respiratory status and chest wall movement',
        'Watch for signs of re-tension: return of original symptoms',
        'Check catheter patency and position regularly',
        'Monitor for bleeding at insertion site or hemothorax development',
        'Assess for subcutaneous emphysema progression',
        'Be prepared for bilateral tension pneumothorax in trauma patients',
        'Prepare patient for definitive chest tube placement at hospital'
      ],
      safetyNotes: [
        'Needle decompression is temporary - definitive treatment required',
        'Patient condition can deteriorate rapidly if catheter fails',
        'Have equipment ready for repeat decompression if needed'
      ]
    },
    {
      id: 'needle-thoracentesis-step-8',
      stepNumber: 8,
      title: 'Documentation and Hospital Handoff',
      description: 'Document procedure and provide comprehensive handoff to receiving team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Document indication for procedure and clinical findings',
        'Record time of needle insertion and immediate patient response',
        'Note catheter size, insertion site, and complications if any',
        'Document vital signs before and after decompression',
        'Describe amount of air released and ongoing air leak',
        'Provide SBAR handoff emphasizing need for tube thoracostomy',
        'Communicate any complications or concerns to receiving physician',
        'Ensure catheter remains secure and functional during transfer'
      ],
      safetyNotes: [
        'Clear communication prevents delays in definitive treatment',
        'Hospital team needs to know about temporary nature of needle decompression',
        'Document complications for quality improvement and medicolegal purposes'
      ]
    }
  ],

  // 27. INTRAVENOUS FLUID THERAPY - Advanced fluid resuscitation and management
  'intravenous-fluid-therapy': [
    {
      id: 'iv-fluid-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Fluid Indication',
      description: 'Assess patient for fluid therapy needs and determine appropriate indication',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess hemodynamic status: blood pressure, heart rate, perfusion markers',
        'Evaluate volume status: skin turgor, mucous membranes, jugular veins',
        'Check for signs of dehydration: thirst, dry mouth, decreased urine output',
        'Look for shock signs: altered mental status, weak pulse, cool extremities',
        'Consider fluid loss sources: bleeding, vomiting, diarrhea, burns, sepsis',
        'Assess cardiac function: listen for S3 gallop, check for peripheral edema',
        'Review medical history: heart failure, kidney disease, hypertension',
        'Determine fluid type needed: crystalloid vs colloid vs blood products'
      ],
      indications: [
        'Hypovolemic shock from any cause',
        'Dehydration from fluid losses',
        'Hypotension requiring volume support',
        'Medication administration requiring IV access',
        'Severe burns requiring fluid resuscitation',
        'Sepsis requiring fluid therapy'
      ],
      contraindications: [
        'Pulmonary edema or congestive heart failure (relative)',
        'Renal failure with fluid overload',
        'Hypervolemia or fluid overload states'
      ],
      safetyNotes: [
        'Assess cardiac status before large volume infusion',
        'Monitor for signs of fluid overload throughout therapy',
        'Consider patient weight and underlying conditions'
      ]
    },
    {
      id: 'iv-fluid-step-2',
      stepNumber: 2,
      title: 'Fluid Selection and Equipment Preparation',
      description: 'Select appropriate IV fluid and prepare infusion equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Select crystalloid: Normal Saline for most situations, LR for trauma/burns',
        'Avoid dextrose solutions in suspected stroke or head injury',
        'Choose appropriate IV catheter: 18G for rapid infusion, 20-22G for standard',
        'Prepare IV tubing: macro-drip (10-20 drops/mL) for rapid infusion',
        'Check fluid expiration date and inspect for clarity/particles',
        'Gather additional supplies: tape, gauze, transparent dressing',
        'Have pressure bag available if rapid infusion anticipated',
        'Prepare pump if precise rate control needed'
      ],
      equipmentNeeded: [
        'Isotonic crystalloid solution (Normal Saline or Lactated Ringers)',
        'IV catheter (appropriate gauge)',
        'IV administration set with drip chamber',
        'IV pole or hanging mechanism',
        'Pressure bag for rapid infusion',
        'Infusion pump if available',
        'Securing materials (tape, dressing)',
        'IV start kit with antiseptic'
      ],
      safetyNotes: [
        'Never use hypotonic fluids in shock or head injury',
        'Verify five rights: right fluid, right dose, right rate, right route, right patient',
        'Check for fluid allergies or sensitivities'
      ]
    },
    {
      id: 'iv-fluid-step-3',
      stepNumber: 3,
      title: 'IV Access Establishment',
      description: 'Establish secure peripheral IV access using sterile technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Select optimal venous access site: antecubital fossa preferred for large volume',
        'Apply tourniquet 10-15 cm above insertion site',
        'Palpate vein for patency, direction, and depth',
        'Clean insertion site with antiseptic in circular motion',
        'Insert IV catheter at 15-30 degree angle with bevel up',
        'Advance catheter over needle once blood return seen',
        'Release tourniquet and withdraw needle safely',
        'Connect IV tubing and secure catheter with transparent dressing'
      ],
      safetyNotes: [
        'Use sterile technique to prevent infection',
        'Dispose of needle in sharps container immediately',
        'Assess for signs of infiltration or extravasation'
      ]
    },
    {
      id: 'iv-fluid-step-4',
      stepNumber: 4,
      title: 'Initial Fluid Bolus Administration',
      description: 'Administer appropriate fluid bolus based on patient condition',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Calculate initial bolus: 20 mL/kg for adults (usually 1-2 L), 20 mL/kg for pediatrics',
        'Infuse bolus rapidly if shock present: wide-open IV or pressure bag',
        'Monitor vital signs during bolus: BP, HR, oxygen saturation',
        'Assess clinical response: improved perfusion, mental status, urine output',
        'Watch for signs of fluid overload: increased work of breathing, rales',
        'Document time of bolus start and patient response',
        'Prepare second bolus if inadequate response to first',
        'Reassess need for continued fluid vs other interventions'
      ],
      safetyNotes: [
        'Stop infusion immediately if signs of fluid overload develop',
        'Monitor closely for development of pulmonary edema',
        'Consider smaller boluses in elderly or cardiac patients'
      ]
    },
    {
      id: 'iv-fluid-step-5',
      stepNumber: 5,
      title: 'Fluid Rate Calculation and Titration',
      description: 'Calculate appropriate maintenance rate and titrate based on response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Calculate maintenance rate: adults typically 125-250 mL/hr baseline',
        'Adjust rate based on ongoing losses: higher for burns, fever, bleeding',
        'Use infusion pump for precise rate control when available',
        'Titrate rate based on clinical response and vital signs',
        'Consider permissive hypotension in trauma: avoid over-resuscitation',
        'Monitor urine output if Foley catheter present (>0.5 mL/kg/hr goal)',
        'Reassess fluid balance regularly and adjust accordingly',
        'Document rate changes and rationale for adjustments'
      ],
      safetyNotes: [
        'Avoid excessive fluid in penetrating trauma patients',
        'Monitor for electrolyte imbalances with large volume resuscitation',
        'Adjust rates more cautiously in patients with cardiac or renal disease'
      ]
    },
    {
      id: 'iv-fluid-step-6',
      stepNumber: 6,
      title: 'Monitoring Patient Response and Complications',
      description: 'Continuously monitor patient response to fluid therapy and watch for complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor vital signs every 15 minutes and document trends',
        'Assess clinical markers of perfusion: skin color, temperature, capillary refill',
        'Check mental status improvement as indicator of adequate perfusion',
        'Listen to lung sounds for development of rales or fluid overload',
        'Monitor IV site for infiltration, phlebitis, or infection',
        'Watch for signs of electrolyte imbalance: muscle cramps, weakness',
        'Assess for complications: fluid overload, hypothermia, coagulopathy',
        'Document fluid intake and any outputs if measurable'
      ],
      safetyNotes: [
        'Early recognition of fluid overload prevents pulmonary edema',
        'Monitor for hypothermia with large volume cold fluid administration',
        'Be alert for signs of transfusion reactions if blood products given'
      ]
    },
    {
      id: 'iv-fluid-step-7',
      stepNumber: 7,
      title: 'Advanced Fluid Management and Adjunct Therapies',
      description: 'Implement advanced fluid strategies and consider adjunct treatments',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Consider vasopressor support if fluid resuscitation inadequate',
        'Evaluate need for blood products if hemorrhagic shock suspected',
        'Warm IV fluids to prevent hypothermia, especially in trauma',
        'Use balanced crystalloids (LR) rather than normal saline when possible',
        'Consider albumin or other colloids in specific circumstances',
        'Monitor for signs of compartment syndrome in trauma patients',
        'Assess need for emergency blood transfusion in severe hemorrhage',
        'Coordinate with medical control for complex fluid management decisions'
      ],
      safetyNotes: [
        'Blood products require crossmatching when time permits',
        'Monitor closely for transfusion reactions',
        'Maintain normothermia to prevent coagulopathy'
      ]
    },
    {
      id: 'iv-fluid-step-8',
      stepNumber: 8,
      title: 'Documentation and Handoff Communication',
      description: 'Document fluid therapy and communicate comprehensive status to receiving team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Document initial patient condition and vital signs',
        'Record type and volume of fluids administered',
        'Note patient response to fluid therapy: vital signs, clinical improvement',
        'Document any complications or adverse reactions',
        'Calculate total fluid balance if possible (intake minus output)',
        'Provide SBAR handoff including fluid needs and response',
        'Communicate ongoing fluid requirements to receiving team',
        'Ensure IV access remains patent and functional during transfer'
      ],
      safetyNotes: [
        'Accurate fluid documentation prevents over/under-resuscitation',
        'Clear communication ensures continuity of appropriate fluid therapy',
        'Secure IV access to prevent loss during transport'
      ]
    }
  ],

  // 28. SUPRAGLOTTIC AIRWAY MANAGEMENT - Advanced airway using LMA/King airway devices
  'supraglottic-airway-management': [
    {
      id: 'sga-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Airway Evaluation',
      description: 'Assess patient for supraglottic airway indication and evaluate for difficult airway',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess level of consciousness: patient must be unconscious or deeply sedated',
        'Evaluate airway patency and breathing adequacy',
        'Check for signs of difficult bag-mask ventilation: beard, obesity, edentulous',
        'Assess for difficult intubation indicators using LEMON criteria',
        'Consider supraglottic airway as bridge to intubation or definitive airway',
        'Rule out contraindications: intact gag reflex, caustic ingestion',
        'Evaluate mouth opening: minimum 2.5cm required for insertion',
        'Check for foreign body or vomitus requiring suction first'
      ],
      indications: [
        'Failed bag-mask ventilation requiring airway rescue',
        'Unconscious patient requiring positive pressure ventilation',
        'Bridge airway for failed intubation attempts',
        'Cannot intubate, cannot oxygenate emergency situation',
        'Cardiac arrest requiring definitive airway management',
        'Respiratory failure with inadequate spontaneous ventilation'
      ],
      contraindications: [
        'Conscious patient with intact gag reflex',
        'Suspected upper airway obstruction above vocal cords',
        'Caustic ingestion with potential laryngeal injury',
        'Significant oral or laryngeal trauma',
        'Limited mouth opening (<2.5 cm)',
        'Known esophageal pathology (relative contraindication)'
      ],
      safetyNotes: [
        'Have suction immediately available for airway clearing',
        'Maintain C-spine immobilization in trauma patients',
        'Prepare for surgical airway if supraglottic device fails'
      ]
    },
    {
      id: 'sga-step-2',
      stepNumber: 2,
      title: 'Device Selection and Preparation',
      description: 'Select appropriate supraglottic device and prepare equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Select device type: LMA Classic, King LT, or I-gel based on availability',
        'Choose correct size: Size 4 for small adult women, Size 5 for large adults',
        'Inspect device for damage: cracks, inflation problems, missing parts',
        'Test cuff inflation and deflation if inflatable device',
        'Lubricate device with water-soluble lubricant, avoid silicone-based',
        'Prepare bag-mask ventilation as backup',
        'Set up suction equipment and ensure function',
        'Have intubation equipment ready as backup plan'
      ],
      equipmentNeeded: [
        'Supraglottic airway device (appropriate size)',
        '20-30 mL syringe for cuff inflation',
        'Water-soluble lubricant',
        'Bag-valve device with oxygen',
        'End-tidal CO2 monitoring',
        'Suction equipment with large bore tip',
        'Stethoscope for auscultation',
        'Securing tape or ties'
      ],
      safetyNotes: [
        'Never force device insertion - remove and reassess',
        'Check cuff inflation pressures to prevent tissue damage',
        'Have multiple device sizes available'
      ]
    },
    {
      id: 'sga-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Airway Preparation',
      description: 'Position patient optimally and prepare airway for device insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient in sniffing position: head extended, neck flexed',
        'Open mouth with cross-finger technique or scissor grip',
        'Suction oropharynx clear of secretions, blood, or vomitus',
        'Remove dentures if present and interfering with insertion',
        'Ensure adequate lighting for visualization',
        'Have assistant provide C-spine stabilization in trauma patients',
        'Pre-oxygenate patient with bag-mask ventilation if possible',
        'Position yourself at patient\'s head for optimal insertion angle'
      ],
      safetyNotes: [
        'Clear airway of debris before device insertion',
        'Maintain spinal immobilization during positioning',
        'Avoid excessive head extension in elderly patients'
      ]
    },
    {
      id: 'sga-step-4',
      stepNumber: 4,
      title: 'Device Insertion Technique',
      description: 'Insert supraglottic airway device using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Hold device like a pencil with cuff deflated (LMA) or inflated (King)',
        'Insert device along hard palate with tip leading',
        'Advance device until resistance felt at hypopharynx',
        'For LMA: inflate cuff with appropriate volume (20-30 mL air)',
        'For King: ensure both cuffs are inflated and centered',
        'Watch for slight outward movement of device during inflation',
        'Attach bag-valve device and attempt ventilation',
        'Assess for bilateral breath sounds and chest rise'
      ],
      safetyNotes: [
        'Do not force insertion - may cause laryngeal trauma',
        'Stop insertion if excessive resistance encountered',
        'Inflate cuff gradually to avoid over-inflation'
      ]
    },
    {
      id: 'sga-step-5',
      stepNumber: 5,
      title: 'Confirmation of Proper Placement',
      description: 'Verify correct device placement using multiple confirmation methods',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Auscultate bilaterally for equal breath sounds over chest',
        'Confirm absence of gurgling sounds over stomach',
        'Observe symmetric chest rise with each ventilation',
        'Monitor end-tidal CO2 waveform and values (35-45 mmHg)',
        'Check oxygen saturation improvement with ventilation',
        'Assess ease of ventilation: should require minimal pressure',
        'Look for condensation in device tube with exhalation',
        'Confirm cuff seal by gentle pressure - should hold ventilation'
      ],
      safetyNotes: [
        'Multiple confirmation methods reduce risk of unrecognized esophageal placement',
        'Continuous waveform capnography is gold standard for placement confirmation',
        'If placement uncertain, remove device and reassess'
      ]
    },
    {
      id: 'sga-step-6',
      stepNumber: 6,
      title: 'Device Securement and Ventilation Optimization',
      description: 'Secure device properly and optimize ventilation parameters',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Secure device with tape or commercial holder to prevent displacement',
        'Mark insertion depth at teeth/lips for reference',
        'Set ventilation rate: 10-12 breaths/min adults, 12-20/min children',
        'Use appropriate tidal volumes: 6-7 mL/kg to prevent gastric insufflation',
        'Monitor peak inspiratory pressures: keep <20 cmH2O if possible',
        'Confirm continued placement after any patient movement',
        'Consider bite block if patient has teeth and risk of biting',
        'Document device type, size, and insertion depth'
      ],
      safetyNotes: [
        'Excessive ventilation pressures increase risk of gastric insufflation',
        'Secure device adequately to prevent accidental displacement',
        'Monitor for device migration during patient movement'
      ]
    },
    {
      id: 'sga-step-7',
      stepNumber: 7,
      title: 'Ongoing Monitoring and Complication Management',
      description: 'Provide continuous monitoring and manage potential complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Continuously monitor end-tidal CO2 waveform for device integrity',
        'Assess ventilation adequacy: chest rise, breath sounds, oxygen saturation',
        'Monitor for gastric insufflation: abdominal distension, regurgitation',
        'Watch for device displacement during patient movement or transport',
        'Be prepared to manage regurgitation: suction, Trendelenburg position',
        'Monitor airway pressures and adjust ventilation as needed',
        'Assess need for conversion to endotracheal intubation',
        'Document ventilation parameters and any complications'
      ],
      safetyNotes: [
        'Supraglottic airways do not protect against aspiration',
        'Have suction immediately available for regurgitation',
        'Be prepared for emergent device removal if complications arise'
      ]
    },
    {
      id: 'sga-step-8',
      stepNumber: 8,
      title: 'Transport Management and Handoff',
      description: 'Manage airway during transport and provide comprehensive handoff',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Continue monitoring device placement throughout transport',
        'Secure all connections to prevent accidental disconnection',
        'Monitor capnography continuously during transport',
        'Be prepared to manage complications during transport',
        'Communicate with receiving team about airway management',
        'Provide report including: device type, size, insertion time, complications',
        'Ensure receiving team is prepared for potential conversion to ETT',
        'Document total time device was in place and overall effectiveness'
      ],
      safetyNotes: [
        'Transport vibration can cause device displacement',
        'Have backup airway plan ready for emergent situations',
        'Clear communication prevents delays in hospital airway management'
      ]
    }
  ]
};

export default enhancedCriticalSkillSteps;