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
  
  // PREDICTION OF DIFFICULT BAG VALVE MASK VENTILATIONS (BOOTS)
  'prediction-of-difficult-bag-valve-mask-ventilations': [
    {
      id: 'bvm_pred_1',
      stepNumber: 1,
      title: 'B – Beard and mask seal assessment',
      description: 'Examine patient for factors that may compromise mask seal effectiveness',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess for thick beard that may prevent proper mask seal',
        'Check for facial jewelry that could interfere with mask placement',
        'Evaluate facial trauma, burns, or anatomical deformities',
        'Identify vomit, blood, or secretions around mouth/nose',
        'Consider using beard-compatible masks or alternative airways'
      ],
      safetyNotes: [
        'Poor mask seal can lead to inadequate ventilation',
        'Have suction ready for secretions',
        'Consider advanced airway if seal cannot be achieved'
      ]
    },
    {
      id: 'bvm_pred_2',
      stepNumber: 2,
      title: 'O – Obesity assessment',
      description: 'Evaluate obesity-related factors that may complicate BVM ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess patient\'s body mass index and body habitus',
        'Evaluate chest wall compliance and expansion ability',
        'Check ability to extend neck and position head properly',
        'Identify redundant pharyngeal and neck soft tissue',
        'Consider need for two-person BVM technique'
      ],
      safetyNotes: [
        'Obese patients may require higher ventilation pressures',
        'Position patient with head elevated if possible',
        'Be prepared for difficult airway management'
      ]
    },
    {
      id: 'bvm_pred_3',
      stepNumber: 3,
      title: 'O – Older age assessment (>55 years)',
      description: 'Assess age-related factors affecting ventilation ease',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Evaluate neck range of motion and flexibility',
        'Assess temporomandibular joint mobility',
        'Check for decreased soft tissue elasticity',
        'Identify dental issues (loose teeth, dentures)',
        'Consider arthritis or cervical spine limitations'
      ]
    },
    {
      id: 'bvm_pred_4',
      stepNumber: 4,
      title: 'T – Toothless/dental issues',
      description: 'Assess dental status and its impact on mask ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Check for missing teeth, especially front teeth',
        'Assess denture status (loose, ill-fitting, absent)',
        'Evaluate facial structure changes from tooth loss',
        'Consider leaving well-fitting dentures in place',
        'Plan for potential mask seal difficulties'
      ]
    },
    {
      id: 'bvm_pred_5',
      stepNumber: 5,
      title: 'S – Sleep apnea and airway obstruction',
      description: 'Identify sleep apnea history and upper airway obstruction risk',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Ask about sleep apnea history and CPAP use',
        'Assess for signs of chronic upper airway obstruction',
        'Evaluate tongue size and pharyngeal space',
        'Check for enlarged tonsils or adenoids',
        'Consider high risk for difficult ventilation'
      ]
    }
  ],
  
  // ADULT CPR WITH MANUAL DEFIBRILLATOR - Updated 2024 Guidelines
  'adult-cpr-defibrillator': [
    {
      id: 'cpr-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Assessment',
      description: 'Ensure scene safety and assess patient responsiveness',
      isRequired: true,
      isCritical: true,
      timeEstimate: 10,
      keyPoints: [
        'Approach safely, look for hazards (electrical, traffic, violence)',
        'Wear appropriate PPE (gloves, mask, eye protection)',
        'Tap shoulders firmly and shout "Are you okay?"',
        'Check for normal breathing (look, listen, feel for 10 seconds maximum)',
        'Simultaneously check carotid pulse for healthcare providers',
        'Call for help immediately if unresponsive'
      ],
      safetyNotes: [
        'Never approach an unsafe scene',
        'Ensure adequate PPE before patient contact',
        'If in doubt about pulse, start CPR'
      ]
    },
    {
      id: 'cpr-step-2',
      stepNumber: 2,
      title: 'Position Patient and Prepare',
      description: 'Position patient supine on firm surface and prepare for CPR',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Place patient supine on firm, flat surface',
        'Tilt head back slightly, lift chin to open airway',
        'Remove any visible foreign objects from mouth',
        'Position yourself beside patient\'s chest',
        'Expose chest completely for proper hand placement',
        'Ensure defibrillator/AED is nearby and ready'
      ],
      equipmentNeeded: [
        'Defibrillator/AED',
        'Bag-valve-mask',
        'Oxygen',
        'Suction device',
        'Backboard if available'
      ]
    },
    {
      id: 'cpr-step-3',
      stepNumber: 3,
      title: 'Hand Placement and Chest Compressions',
      description: 'Perform high-quality chest compressions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Place heel of one hand on lower half of breastbone (between nipples)',
        'Place other hand on top, interlace fingers, keep fingers off ribs',
        'Keep arms straight, shoulders directly over hands',
        'Compress at least 2 inches (5cm) but not more than 2.4 inches (6cm)',
        'Allow complete chest recoil between compressions',
        'Minimize interruptions, compress at 100-120 per minute',
        'Count compressions aloud: "1, 2, 3..."'
      ],
      safetyNotes: [
        'Avoid leaning on chest between compressions',
        'Switch compressors every 2 minutes to prevent fatigue',
        'Monitor compression quality continuously'
      ]
    },
    {
      id: 'cpr-step-4',
      stepNumber: 4,
      title: 'Rescue Breathing',
      description: 'Provide rescue breaths with bag-valve-mask',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'After 30 compressions, tilt head and lift chin',
        'Create proper mask seal (C-E grip technique)',
        'Give 2 breaths, each over 1 second',
        'Watch for visible chest rise with each breath',
        'Allow complete exhalation between breaths',
        'Use supplemental oxygen if available',
        'Avoid excessive ventilation'
      ],
      contraindications: [
        'Do not hyperventilate the patient',
        'Avoid mouth-to-mouth without barrier device'
      ]
    },
    {
      id: 'cpr-step-5',
      stepNumber: 5,
      title: 'Defibrillation Assessment',
      description: 'Analyze rhythm and deliver shock if indicated',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Continue CPR while defibrillator charges',
        'Apply defibrillator pads correctly (upper right, lower left)',
        'Ensure pads do not overlap and have good contact',
        'Clear everyone from patient: "Everyone clear!"',
        'Analyze rhythm - look for VF/pulseless VT',
        'If shockable rhythm: charge to appropriate energy (biphasic 120-200J)',
        'Deliver shock immediately, resume CPR for 2 minutes'
      ],
      safetyNotes: [
        'Ensure no one is touching patient during analysis/shock',
        'Remove oxygen source during defibrillation',
        'Check for medication patches, remove if necessary'
      ]
    },
    {
      id: 'cpr-step-6',
      stepNumber: 6,
      title: 'Post-Shock CPR and Reassessment',
      description: 'Continue CPR cycles and reassess',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Immediately resume CPR after shock (30:2 ratio)',
        'Continue for exactly 2 minutes before next rhythm check',
        'Switch compressors to prevent fatigue',
        'Establish IV/IO access during CPR if possible',
        'Consider advanced airway (supraglottic or endotracheal)',
        'Administer medications per protocol (epinephrine, amiodarone)',
        'Reassess rhythm every 2 minutes'
      ],
      equipmentNeeded: [
        'IV/IO supplies',
        'Epinephrine',
        'Amiodarone',
        'Advanced airway devices'
      ]
    },
    {
      id: 'cpr-step-7',
      stepNumber: 7,
      title: 'ROSC Recognition and Post-Arrest Care',
      description: 'Recognize return of circulation and provide appropriate care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Check for signs of ROSC: pulse, blood pressure, improved color',
        'If ROSC achieved: assess breathing, mental status',
        'Maintain oxygen saturation 94-98%',
        'Monitor blood pressure, treat hypotension',
        'Consider 12-lead ECG and targeted temperature management',
        'Transport to appropriate facility',
        'If no ROSC: continue resuscitation or consider termination per protocol'
      ],
      safetyNotes: [
        'Continue monitoring - re-arrest is possible',
        'Be prepared to resume CPR if pulse lost'
      ]
    }
  ],

  // IV CANNULATION - Best Practice Technique
  'iv-cannulation': [
    {
      id: 'iv-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Consent',
      description: 'Assess patient and obtain informed consent',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Introduce yourself and explain procedure',
        'Check patient allergies (latex, iodine, adhesives)',
        'Assess patient\'s hydration status and medical history',
        'Identify indications for IV access',
        'Obtain verbal consent and address concerns',
        'Position patient comfortably with arm extended'
      ],
      contraindications: [
        'Infection at insertion site',
        'AV fistula or lymphedema on affected side',
        'Previous mastectomy on affected side',
        'Fracture or injury to extremity'
      ]
    },
    {
      id: 'iv-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation',
      description: 'Gather and prepare all necessary equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Perform hand hygiene thoroughly',
        'Gather IV catheter (appropriate gauge: 14-22G based on indication)',
        'Select appropriate IV fluid and administration set',
        'Prepare alcohol wipes, gauze, tape, and transparent dressing',
        'Have tourniquet, gloves, and sharps container ready',
        'Prime IV tubing and check for air bubbles'
      ],
      equipmentNeeded: [
        'IV catheter (14-22 gauge)',
        'IV fluid and tubing',
        'Alcohol wipes',
        'Tourniquet',
        'Gloves and PPE',
        'Gauze and tape',
        'Transparent dressing'
      ]
    },
    {
      id: 'iv-step-3',
      stepNumber: 3,
      title: 'Vein Selection and Site Preparation',
      description: 'Select appropriate vein and prepare insertion site',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Apply tourniquet 4-6 inches above intended insertion site',
        'Palpate for suitable vein (straight, firm, bouncy)',
        'Preferred sites: dorsal hand, forearm, antecubital fossa',
        'Avoid areas of flexion, sclerosed or tortuous veins',
        'Clean site with alcohol in circular motion, allow to dry',
        'Stabilize vein with non-dominant hand'
      ],
      safetyNotes: [
        'Do not repalpate site after cleaning',
        'Never attempt more than 2 tries per paramedic',
        'Choose larger gauge for trauma/resuscitation'
      ]
    },
    {
      id: 'iv-step-4',
      stepNumber: 4,
      title: 'Catheter Insertion',
      description: 'Insert IV catheter using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Insert catheter at 15-30 degree angle, bevel up',
        'Advance until flash of blood appears in catheter hub',
        'Lower angle to nearly parallel with skin',
        'Advance catheter 1-2mm more, then slide catheter off needle',
        'Hold catheter hub steady while advancing plastic cannula',
        'Remove needle completely when catheter fully inserted'
      ],
      safetyNotes: [
        'Never reinsert needle once withdrawn',
        'Maintain sterile technique throughout',
        'Watch for signs of infiltration or hematoma'
      ]
    },
    {
      id: 'iv-step-5',
      stepNumber: 5,
      title: 'Securing and Flushing',
      description: 'Secure catheter and confirm patency',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Release tourniquet immediately after catheter insertion',
        'Apply gentle pressure above catheter tip to prevent bleeding',
        'Connect IV tubing or saline lock to catheter hub',
        'Flush with 3-5ml normal saline to confirm patency',
        'Watch for signs of infiltration (swelling, coolness, pain)',
        'Secure with transparent dressing and tape loops'
      ],
      safetyNotes: [
        'Dispose of needle in sharps container immediately',
        'Label IV site with date, time, and gauge',
        'Document attempt and any complications'
      ]
    },
    {
      id: 'iv-step-6',
      stepNumber: 6,
      title: 'Post-Insertion Care',
      description: 'Provide ongoing IV site care and monitoring',
      isRequired: true,
      isCritical: false,
      timeEstimate: 30,
      keyPoints: [
        'Set appropriate flow rate based on patient needs',
        'Monitor IV site regularly for complications',
        'Check for signs of infiltration, phlebitis, or infection',
        'Secure tubing to prevent accidental dislodgement',
        'Document insertion site, gauge, and patient tolerance',
        'Educate patient about protecting IV site'
      ],
      safetyNotes: [
        'Replace IV if signs of complications develop',
        'Monitor elderly patients closely for fluid overload'
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

  // BLOOD GLUCOSE TESTING - Point of Care Diagnostics
  'blood-glucose-testing': [
    {
      id: 'glucose-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Equipment Check',
      description: 'Assess patient and prepare glucometer',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Assess patient for altered mental status or suspected hypoglycemia',
        'Check patient for diabetes history and current medications',
        'Select appropriate finger for puncture (avoid index finger and thumb)',
        'Verify glucometer is calibrated and functioning',
        'Check expiration date on test strips',
        'Ensure lancet device is loaded and ready'
      ],
      equipmentNeeded: [
        'Glucometer',
        'Test strips',
        'Lancet device',
        'Alcohol wipes',
        'Gauze',
        'Gloves'
      ]
    },
    {
      id: 'glucose-step-2',
      stepNumber: 2,
      title: 'Hand Hygiene and Site Preparation',
      description: 'Prepare puncture site using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Perform hand hygiene and don gloves',
        'Have patient wash hands with warm water if possible',
        'Select lateral aspect of fingertip (less painful)',
        'Clean site with alcohol wipe and allow to dry completely',
        'Avoid using center of fingertip or thumbs',
        'Warm hand if circulation is poor'
      ],
      safetyNotes: [
        'Never reuse lancets',
        'Ensure alcohol has completely dried before puncture',
        'Use alternate sites if frequent testing required'
      ]
    },
    {
      id: 'glucose-step-3',
      stepNumber: 3,
      title: 'Blood Sample Collection',
      description: 'Obtain adequate blood sample for testing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Insert test strip into glucometer first',
        'Position lancet device firmly against lateral fingertip',
        'Activate lancet with quick, firm pressure',
        'Gently squeeze finger to produce hanging drop of blood',
        'Touch test strip to blood drop (do not smear)',
        'Apply pressure with gauze to control bleeding'
      ],
      safetyNotes: [
        'Do not squeeze excessively - can alter results',
        'Ensure adequate blood sample for accurate reading',
        'Dispose of lancet in sharps container immediately'
      ]
    },
    {
      id: 'glucose-step-4',
      stepNumber: 4,
      title: 'Result Interpretation and Documentation',
      description: 'Read results and correlate with clinical assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Wait for glucometer to display result (typically 5-15 seconds)',
        'Record exact glucose value and time of test',
        'Correlate result with patient\'s clinical presentation',
        'Normal range: 80-120 mg/dL (4.4-6.7 mmol/L)',
        'Hypoglycemia: <70 mg/dL (3.9 mmol/L)',
        'Critical values: <40 or >400 mg/dL require immediate action'
      ],
      safetyNotes: [
        'Always correlate lab value with clinical assessment',
        'Repeat test if result doesn\'t match clinical picture',
        'Be aware of factors that can affect accuracy (poor circulation, medications)'
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
  }
};

export default enhancedCriticalSkillSteps;