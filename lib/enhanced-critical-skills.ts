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
    },
    {
      id: 'bam_7',
      stepNumber: 7,
      title: 'Reassess and optimize airway interventions',
      description: 'Continuously evaluate effectiveness of airway management and adjust interventions as needed',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Monitor oxygen saturation trends and response to interventions',
        'Reassess breath sounds bilaterally for improvement or deterioration',
        'Evaluate patient comfort and tolerance of airway adjuncts',
        'Check airway adjunct positioning - ensure proper placement and function',
        'Assess for signs of airway obstruction: increased work of breathing, stridor',
        'Consider repositioning or sizing changes if airway remains suboptimal',
        'Monitor level of consciousness and patient cooperation',
        'Prepare for advanced airway if basic measures insufficient'
      ],
      contraindications: [
        'Do not delay advanced intervention if basic airway management failing',
        'Do not continue ineffective interventions - escalate care appropriately'
      ],
      safetyNotes: [
        'Continuous monitoring essential - airway status can change rapidly',
        'Be prepared to remove airway adjuncts if patient develops gag reflex',
        'Early recognition of failing airway management prevents complications'
      ],
      equipmentNeeded: ['Continuous monitoring equipment', 'Alternative sized airway adjuncts', 'Advanced airway equipment']
    },
    {
      id: 'bam_8',
      stepNumber: 8,
      title: 'Documentation and transport preparation',
      description: 'Document airway management interventions and prepare for safe transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Document initial airway assessment findings and severity',
        'Record all interventions performed: positioning, suctioning, airway adjuncts',
        'Note patient response to each intervention and oxygen saturation improvements',
        'Document ongoing monitoring parameters and vital sign trends',
        'Communicate airway management to receiving facility during transport',
        'Ensure all equipment remains secured and functional during transport',
        'Plan for potential airway deterioration during transport',
        'Provide comprehensive handoff including airway challenges and interventions'
      ],
      safetyNotes: [
        'Complete documentation essential for continuity of care',
        'Transport team must understand airway management performed',
        'Be prepared for airway emergencies during transport'
      ],
      equipmentNeeded: ['Documentation materials', 'Communication equipment', 'Transport monitoring devices', 'Backup airway equipment']
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
      ],
      equipmentNeeded: ['PPE (gloves, mask, eye protection)', 'BVM with reservoir bag', 'Oxygen source (15L/min)', 'Suction equipment', 'Pulse oximeter', 'End-tidal CO2 monitor']
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
      ],
      equipmentNeeded: ['Multiple mask sizes (pediatric, adult, large adult)', 'Beard trimmer or scissors if available', 'Gauze pads for seal improvement', 'Advanced airway equipment (LMA, endotracheal tube)', 'Water-soluble lubricant']
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
      ],
      equipmentNeeded: ['PEEP valve for BVM', 'Ramping devices or pillows for positioning', 'Large adult face masks', 'Two-person BVM technique supplies', 'Mechanical lifting devices if available']
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
      ],
      equipmentNeeded: ['Joint mobility assessment tools', 'Cervical collar if indicated', 'Advanced airway equipment', 'Alternative positioning aids', 'Continuous monitoring equipment']
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
      ],
      equipmentNeeded: ['Gauze pads for seal improvement', 'Denture cup for storage', 'Magill forceps for foreign body removal', 'Oral airway adjuncts', 'Different sized face masks']
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
      ],
      equipmentNeeded: ['Measuring tape for neck circumference', 'Penlight for airway examination', 'Mallampati assessment guide', 'Supraglottic airway devices', 'CPAP equipment if available']
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
      ],
      equipmentNeeded: ['BOOTS criteria assessment card', 'Alternative airway equipment (LMA, ETT, cricothyrotomy kit)', 'Documentation materials', 'Communication equipment for team coordination']
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
      ],
      equipmentNeeded: ['BVM with PEEP valve', 'End-tidal CO2 monitoring', 'Pulse oximeter', 'Oral and nasal airways', 'Two-person BVM technique supplies', 'Advanced airway equipment', 'Documentation forms']
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
  ],

  // ETCO2 MONITORING
  'etco2-monitoring': [
    {
      id: 'etco2_1',
      stepNumber: 1,
      title: 'Equipment preparation and calibration',
      description: 'Prepare and calibrate ETCO2 monitoring equipment ensuring accuracy and proper function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Connect ETCO2 module to patient monitor and ensure proper cable connections',
        'Allow appropriate warm-up time per manufacturer specifications (typically 2-3 minutes)',
        'Verify calibration settings and perform zero-point calibration if required',
        'Check sampling line is clear and not kinked or blocked',
        'Ensure adequate battery life or secure power connection',
        'Select appropriate sampling method (mainstream vs sidestream)',
        'Set appropriate alarm limits based on patient condition',
        'Document equipment serial numbers and calibration status'
      ],
      safetyNotes: [
        'Never use damaged or expired sampling lines',
        'Ensure equipment is not exposed to excessive moisture',
        'Maintain infection control protocols with single-use components'
      ],
      equipmentNeeded: [
        'ETCO2 monitor/module',
        'Appropriate sampling line (nasal cannula or inline adapter)',
        'Power source or charged battery',
        'Patient monitor display',
        'Calibration materials if required'
      ]
    },
    {
      id: 'etco2_2',
      stepNumber: 2,
      title: 'Patient assessment and baseline establishment',
      description: 'Assess patient respiratory status and establish baseline measurements for trending',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Obtain complete set of vital signs including respiratory rate and depth',
        'Assess patient level of consciousness and respiratory effort',
        'Document current oxygen therapy and ventilatory support',
        'Note any respiratory medications administered',
        'Identify any factors affecting ventilation (pain, anxiety, positioning)',
        'Record initial arterial blood gas values if available for correlation',
        'Establish patient baseline mental status and responsiveness',
        'Document any pre-existing respiratory conditions'
      ],
      safetyNotes: [
        'Ensure patient airway is patent before applying monitoring',
        'Be prepared for potential respiratory decompensation',
        'Have airway management equipment immediately available'
      ],
      equipmentNeeded: [
        'Stethoscope',
        'Pulse oximeter',
        'Blood pressure cuff',
        'Thermometer',
        'Suction equipment'
      ]
    },
    {
      id: 'etco2_3',
      stepNumber: 3,
      title: 'Sensor placement and connection',
      description: 'Properly position and connect ETCO2 sampling device based on patient airway status',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'For spontaneously breathing patients: use nasal cannula with ETCO2 sampling',
        'For intubated patients: connect inline sensor between ET tube and ventilator circuit',
        'Ensure sampling line is positioned to capture expired air effectively',
        'Secure connections to prevent disconnection during patient movement',
        'Position sampling line to avoid condensation accumulation',
        'Verify no air leaks around connections that could affect readings',
        'Test sampling function with initial breath to confirm signal acquisition',
        'Adjust positioning if waveform quality is poor'
      ],
      safetyNotes: [
        'Avoid disrupting established airway devices during sensor placement',
        'Monitor for increased dead space in pediatric patients with inline sensors',
        'Ensure sampling lines do not create pressure on patient airways'
      ],
      equipmentNeeded: [
        'ETCO2 nasal cannula or inline adapter',
        'Tape or securing device',
        'Scissors for line adjustment'
      ]
    },
    {
      id: 'etco2_4',
      stepNumber: 4,
      title: 'Waveform analysis and interpretation',
      description: 'Analyze ETCO2 waveform morphology and identify normal versus abnormal patterns',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Identify normal capnographic waveform: sharp upstroke, plateau, sharp downstroke to baseline',
        'Normal ETCO2 values: 35-45 mmHg in healthy adults at sea level',
        'Assess waveform for shape abnormalities indicating airway problems',
        'Look for signs of rebreathing (failure to return to zero baseline)',
        'Identify bronchospasm patterns (shark fin or slanted plateau appearance)',
        'Recognize esophageal intubation (absent or rapidly diminishing waveform)',
        'Monitor for trends rather than single values',
        'Document baseline waveform appearance for comparison'
      ],
      safetyNotes: [
        'Never rely solely on ETCO2 for airway placement confirmation',
        'Consider patient clinical condition alongside monitoring data',
        'Be aware of factors that can cause false readings'
      ],
      equipmentNeeded: [
        'ETCO2 monitor with waveform display',
        'Documentation materials',
        'Reference guide for waveform interpretation'
      ]
    },
    {
      id: 'etco2_5',
      stepNumber: 5,
      title: 'Continuous monitoring and trending',
      description: 'Establish continuous monitoring protocol with appropriate alarm settings and trend analysis',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Set high and low ETCO2 alarms based on patient condition (typically ±10 mmHg from baseline)',
        'Monitor respiratory rate accuracy compared to clinical assessment',
        'Track ETCO2 trends over time for early detection of changes',
        'Correlate ETCO2 changes with clinical signs and other vital signs',
        'Document values at regular intervals per protocol (typically every 5-15 minutes)',
        'Note any interventions that may affect readings (medications, positioning)',
        'Monitor for technical problems (loose connections, condensation)',
        'Assess patient tolerance of monitoring device'
      ],
      safetyNotes: [
        'Respond immediately to significant changes in ETCO2 values or waveform',
        'Never ignore alarms without clinical assessment',
        'Be prepared to troubleshoot technical issues quickly'
      ],
      equipmentNeeded: [
        'Monitoring documentation sheet',
        'Timer or watch',
        'Backup monitoring equipment'
      ]
    },
    {
      id: 'etco2_6',
      stepNumber: 6,
      title: 'Clinical correlation and intervention guidance',
      description: 'Correlate ETCO2 findings with patient clinical status and guide therapeutic interventions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Low ETCO2 (<30 mmHg) may indicate hyperventilation, shock, or cardiac arrest',
        'High ETCO2 (>50 mmHg) may suggest hypoventilation, respiratory depression, or CO2 retention',
        'Sudden loss of waveform may indicate airway displacement or circuit disconnection',
        'Gradual decrease may suggest decreasing cardiac output or increasing dead space',
        'Use ETCO2 to guide ventilation rate and tidal volume adjustments',
        'Monitor response to bronchodilator therapy through waveform improvement',
        'Assess effectiveness of CPR through ETCO2 values during resuscitation',
        'Consider metabolic causes of ETCO2 changes (acidosis, fever, shivering)'
      ],
      safetyNotes: [
        'Always assess patient clinically, not just monitor values',
        'Consider multiple causes for ETCO2 changes',
        'Intervene promptly for significant changes indicating deterioration'
      ],
      equipmentNeeded: [
        'Ventilatory support equipment',
        'Medications (bronchodilators, sedation)',
        'Airway management supplies',
        'Blood gas analysis capability if available'
      ]
    },
    {
      id: 'etco2_7',
      stepNumber: 7,
      title: 'Troubleshooting and quality assurance',
      description: 'Identify and resolve technical issues while maintaining monitoring quality and reliability',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Check for sampling line obstruction if waveform is dampened or absent',
        'Replace sampling line if contaminated with secretions or condensation',
        'Verify sensor connections if intermittent signal loss occurs',
        'Recalibrate equipment if values seem inconsistent with clinical picture',
        'Consider sensor malfunction if waveform morphology is severely abnormal',
        'Ensure adequate sampling flow rate for sidestream systems',
        'Check for air leaks in sampling system that could affect accuracy',
        'Document any technical issues and corrective actions taken'
      ],
      safetyNotes: [
        'Never delay clinical care to troubleshoot monitoring equipment',
        'Have backup monitoring methods available',
        'Replace faulty equipment immediately, do not attempt temporary fixes'
      ],
      equipmentNeeded: [
        'Spare sampling lines and sensors',
        'Cleaning materials',
        'Backup ETCO2 monitoring device',
        'Technical support contact information'
      ]
    },
    {
      id: 'etco2_8',
      stepNumber: 8,
      title: 'Documentation and communication',
      description: 'Comprehensively document monitoring data and communicate findings to healthcare team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Document initial ETCO2 values and waveform characteristics',
        'Record all significant changes in values and corresponding clinical events',
        'Note any interventions performed based on ETCO2 monitoring',
        'Include equipment information and any technical issues encountered',
        'Communicate significant findings to receiving medical team',
        'Provide trend data showing patient response to interventions',
        'Document patient tolerance of monitoring and any complications',
        'Include ETCO2 data in overall clinical assessment and treatment plan'
      ],
      safetyNotes: [
        'Ensure accurate documentation for continuity of care',
        'Communicate critical findings immediately, do not delay for documentation',
        'Maintain patient confidentiality in all communications'
      ],
      equipmentNeeded: [
        'Medical record documentation system',
        'Communication device (phone, radio)',
        'Printed waveform strips if available',
        'Transfer documentation forms'
      ]
    }
  ],

  // INTRAMUSCULAR INJECTION
  'intramuscular-injection': [
    {
      id: 'im_1',
      stepNumber: 1,
      title: 'Patient assessment and preparation',
      description: 'Assess patient condition, verify medication orders, and prepare for intramuscular injection procedure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Verify patient identity using two independent identifiers (name, DOB, medical record number)',
        'Confirm medication order including drug name, dose, route, and frequency',
        'Assess patient for allergies to medications, preservatives, or latex',
        'Review medical history for contraindications to intramuscular injections',
        'Obtain informed consent and explain procedure to patient if conscious',
        'Check patient vital signs and current clinical status',
        'Assess injection sites for signs of infection, inflammation, or tissue damage',
        'Document baseline pain level and anxiety status before procedure'
      ],
      safetyNotes: [
        'Always verify medication allergies before administration',
        'Ensure patient is in stable position to prevent falls during procedure',
        'Have emergency medications readily available for allergic reactions'
      ],
      equipmentNeeded: [
        'Patient identification materials',
        'Medication administration record (MAR)',
        'Allergy assessment tools',
        'Vital signs monitoring equipment',
        'Emergency medications (epinephrine, diphenhydramine)'
      ]
    },
    {
      id: 'im_2',
      stepNumber: 2,
      title: 'Medication verification and preparation',
      description: 'Verify medication using five rights of medication administration and prepare injection',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Verify right patient, right drug, right dose, right route, right time',
        'Check medication expiration date and inspect for discoloration or particles',
        'Calculate dosage using appropriate weight-based or age-based formulas',
        'Select appropriate needle gauge and length for injection site and patient size',
        'Draw up medication using aseptic technique with filter needle if indicated',
        'Remove air bubbles from syringe and verify final volume',
        'Label syringe with medication name, dose, and preparation time',
        'Have second provider independently verify high-risk medications'
      ],
      safetyNotes: [
        'Never use medication that appears cloudy, discolored, or contains particles',
        'Always use new sterile syringe and needle for each injection',
        'Maintain sterile technique throughout medication preparation'
      ],
      equipmentNeeded: [
        'Prescribed medication vial or ampule',
        'Appropriate syringe (1-5mL based on volume)',
        'Drawing up needle (18-20 gauge)',
        'Injection needle (21-25 gauge, 1-1.5 inch length)',
        'Alcohol prep pads',
        'Filter needle if required',
        'Medication calculation resources'
      ]
    },
    {
      id: 'im_3',
      stepNumber: 3,
      title: 'Site selection and positioning',
      description: 'Select appropriate injection site based on patient anatomy and medication requirements',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Preferred sites: Ventrogluteal muscle (adults), vastus lateralis (pediatrics/adults)',
        'Alternative sites: Deltoid (small volumes <2mL), dorsogluteal (avoid if possible)',
        'Assess muscle mass and subcutaneous tissue thickness at injection site',
        'Avoid areas with scars, bruises, swelling, or previous injection sites',
        'Position patient comfortably to relax target muscle group',
        'Use anatomical landmarks to locate safe injection zone',
        'Consider patient mobility limitations when selecting optimal position',
        'Ensure adequate lighting and exposure of injection site'
      ],
      safetyNotes: [
        'Avoid dorsogluteal site due to risk of sciatic nerve injury',
        'Never inject into inflamed, infected, or damaged tissue',
        'Use ventrogluteal site for large volume injections (>2mL)'
      ],
      equipmentNeeded: [
        'Anatomical reference materials',
        'Good lighting source',
        'Patient positioning aids (pillows, supports)',
        'Measuring tools for anatomical landmarks'
      ]
    },
    {
      id: 'im_4',
      stepNumber: 4,
      title: 'Skin preparation and disinfection',
      description: 'Properly clean and prepare injection site to prevent infection and complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Expose injection site adequately while maintaining patient privacy',
        'Inspect skin for integrity, lesions, or signs of infection',
        'Clean area with alcohol prep pad using circular motion from center outward',
        'Allow alcohol to air dry completely (minimum 30 seconds)',
        'Avoid touching cleaned area with non-sterile surfaces',
        'Use additional antiseptic if patient has compromised immune system',
        'Consider hair clipping if excessive hair interferes with injection',
        'Maintain sterile field around injection site'
      ],
      safetyNotes: [
        'Never inject through clothing or inadequately cleaned skin',
        'Allow adequate drying time to prevent alcohol injection into tissue',
        'Use appropriate antiseptic based on patient allergies'
      ],
      equipmentNeeded: [
        'Alcohol prep pads (70% isopropyl alcohol)',
        'Additional antiseptic if indicated',
        'Sterile scissors for hair clipping if needed',
        'Sterile drapes if extended sterile field required'
      ]
    },
    {
      id: 'im_5',
      stepNumber: 5,
      title: 'Injection technique and administration',
      description: 'Perform intramuscular injection using proper technique to ensure medication delivery and patient safety',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Hold syringe like a dart with dominant hand at 90-degree angle to skin',
        'Use non-dominant hand to stretch skin taut and stabilize injection site',
        'Insert needle quickly and smoothly with single motion through skin',
        'Advance needle to appropriate depth (typically 1-1.5 inches for adults)',
        'Aspirate by pulling back plunger slightly to check for blood return',
        'If no blood return, inject medication slowly and steadily',
        'Maintain steady pressure and avoid sudden movements during injection',
        'Complete injection and pause briefly before needle withdrawal'
      ],
      safetyNotes: [
        'If blood is aspirated, withdraw needle and select new injection site',
        'Never inject if needle placement is questionable',
        'Inject slowly to minimize tissue trauma and patient discomfort'
      ],
      equipmentNeeded: [
        'Prepared medication syringe with injection needle',
        'Sterile gloves',
        'Gauze pads for potential bleeding',
        'Proper lighting for visualization'
      ]
    },
    {
      id: 'im_6',
      stepNumber: 6,
      title: 'Post-injection care and monitoring',
      description: 'Provide immediate post-injection care and monitor patient for adverse reactions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Withdraw needle quickly and apply gentle pressure with gauze pad',
        'Do not massage injection site unless specifically indicated',
        'Apply adhesive bandage if bleeding continues or patient requests',
        'Properly dispose of needle and syringe in sharps container immediately',
        'Monitor patient for immediate allergic or adverse reactions (5-15 minutes)',
        'Assess injection site for bleeding, swelling, or signs of complications',
        'Monitor vital signs if medication has systemic effects',
        'Provide patient comfort measures and position of comfort'
      ],
      safetyNotes: [
        'Never recap needles - dispose directly into sharps container',
        'Watch for signs of anaphylaxis: rash, difficulty breathing, hypotension',
        'Have emergency medications immediately available during monitoring period'
      ],
      equipmentNeeded: [
        'Gauze pads',
        'Adhesive bandages',
        'Sharps disposal container',
        'Emergency medications',
        'Vital signs monitoring equipment'
      ]
    },
    {
      id: 'im_7',
      stepNumber: 7,
      title: 'Patient education and discharge instructions',
      description: 'Educate patient about expected effects, potential side effects, and follow-up care requirements',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Explain expected onset of action and duration of medication effects',
        'Review common side effects and when to seek medical attention',
        'Provide instructions for injection site care and activity restrictions',
        'Inform patient about signs of infection (redness, swelling, warmth, pus)',
        'Discuss any dietary restrictions or medication interactions',
        'Provide written instructions and emergency contact information',
        'Schedule follow-up appointments or additional injections if required',
        'Answer patient questions and address concerns about treatment'
      ],
      safetyNotes: [
        'Ensure patient understands emergency signs requiring immediate medical attention',
        'Provide clear instructions in patient\'s preferred language',
        'Verify patient understanding through teach-back method'
      ],
      equipmentNeeded: [
        'Patient education materials',
        'Written discharge instructions',
        'Emergency contact information',
        'Appointment scheduling materials'
      ]
    },
    {
      id: 'im_8',
      stepNumber: 8,
      title: 'Documentation and follow-up',
      description: 'Complete comprehensive documentation and arrange appropriate follow-up care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Document medication name, dose, route, site, and time of administration',
        'Record patient response to injection and any adverse reactions observed',
        'Note injection site condition and any complications encountered',
        'Include patient education provided and patient understanding demonstrated',
        'Document vital signs before and after medication administration',
        'Record any deviations from standard procedure and rationale',
        'Communicate significant findings to receiving healthcare providers',
        'Schedule or recommend follow-up appointments as clinically indicated'
      ],
      safetyNotes: [
        'Ensure accurate documentation for legal and continuity of care purposes',
        'Report any adverse reactions to appropriate authorities if required',
        'Maintain patient confidentiality in all documentation'
      ],
      equipmentNeeded: [
        'Medical record documentation system',
        'Medication administration record (MAR)',
        'Incident reporting forms if complications occur',
        'Communication devices for provider updates'
      ]
    }
  ],

  // NASOPHARYNGEAL AIRWAY INSERTION
  'nasopharyngeal-airway-insertion': [
    {
      id: 'npa_1',
      stepNumber: 1,
      title: 'Patient assessment and indication evaluation',
      description: 'Assess patient airway status and determine need for nasopharyngeal airway insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Evaluate patient level of consciousness and responsiveness to stimuli',
        'Assess for signs of upper airway obstruction or compromise',
        'Check for gag reflex presence - NPA tolerated better than OPA with intact gag',
        'Examine nasal anatomy for deformities, polyps, or obvious obstruction',
        'Look for signs of nasal trauma, bleeding, or recent nasal surgery',
        'Consider patient position and ability to maintain their own airway',
        'Assess oxygen saturation and respiratory effort before intervention',
        'Determine if less invasive positioning or suctioning might be adequate'
      ],
      safetyNotes: [
        'NPAs are contraindicated in suspected basilar skull fractures',
        'Avoid use in patients with severe coagulopathy or active nasal bleeding',
        'Consider alternative airway management if nasal anatomy is severely distorted'
      ],
      equipmentNeeded: [
        'Pulse oximetry monitoring',
        'Suction equipment',
        'Flashlight or penlight for assessment',
        'Stethoscope for respiratory assessment'
      ]
    },
    {
      id: 'npa_2',
      stepNumber: 2,
      title: 'Equipment selection and preparation',
      description: 'Select appropriate nasopharyngeal airway size and prepare necessary equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Select NPA size using diameter of patient\'s little finger or nostril',
        'Length measurement: from tip of nose to earlobe (typically 6-9cm in adults)',
        'Common adult sizes: 28-32 French (6-7mm internal diameter)',
        'Pediatric sizing: 12-24 French based on age and nostril size',
        'Inspect NPA for cracks, holes, or manufacturing defects',
        'Ensure bevel opening faces toward nasal septum during insertion',
        'Prepare water-soluble lubricant - never use petroleum-based products',
        'Have safety pin ready to secure airway if needed'
      ],
      safetyNotes: [
        'Never force oversized airway - can cause significant trauma',
        'Use only water-soluble lubricant to prevent aspiration pneumonitis',
        'Have multiple sizes available in case first choice doesn\'t fit'
      ],
      equipmentNeeded: [
        'Nasopharyngeal airways in multiple sizes (28-36 French)',
        'Water-soluble lubricant',
        'Safety pin for securing',
        'Measuring tape or ruler',
        'Backup airways in different sizes'
      ]
    },
    {
      id: 'npa_3',
      stepNumber: 3,
      title: 'Patient positioning and preparation',
      description: 'Position patient optimally and prepare nasal cavity for airway insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient supine with head in neutral or slightly extended position',
        'Ensure cervical spine precautions if trauma suspected',
        'Inspect both nares and select the larger, more patent nostril',
        'Clear any visible secretions or debris from nasal cavity',
        'Apply topical vasoconstrictor if available and not contraindicated',
        'Explain procedure to conscious patients to reduce anxiety',
        'Have suction immediately available for secretion management',
        'Position yourself for optimal visualization and control'
      ],
      safetyNotes: [
        'Maintain spinal immobilization if cervical injury suspected',
        'Be gentle during nasal examination to avoid causing bleeding',
        'Monitor patient comfort and cooperation throughout positioning'
      ],
      equipmentNeeded: [
        'Suction catheter and suction device',
        'Topical nasal decongestant (if available)',
        'Cervical collar if spinal precautions needed',
        'Patient positioning aids'
      ]
    },
    {
      id: 'npa_4',
      stepNumber: 4,
      title: 'Airway lubrication and initial insertion',
      description: 'Properly lubricate nasopharyngeal airway and begin careful insertion process',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Apply generous amount of water-soluble lubricant to entire NPA surface',
        'Ensure bevel opening faces toward septum (medially) during insertion',
        'Insert NPA straight back along floor of nasal cavity, not upward',
        'Use gentle, steady pressure - never force insertion',
        'Advance slowly watching for patient tolerance and resistance',
        'If significant resistance met, try slight rotation or different angle',
        'Stop immediately if patient shows signs of distress or bleeding',
        'Insert until flange rests against nostril opening'
      ],
      safetyNotes: [
        'Never force insertion - can cause severe nasal trauma',
        'Watch for signs of vasovagal response during insertion',
        'Be prepared to remove immediately if complications arise'
      ],
      equipmentNeeded: [
        'Selected and lubricated nasopharyngeal airway',
        'Additional water-soluble lubricant',
        'Gauze pads for cleanup',
        'Tissues for patient comfort'
      ]
    },
    {
      id: 'npa_5',
      stepNumber: 5,
      title: 'Position verification and airway patency check',
      description: 'Confirm proper NPA placement and assess airway patency and function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Verify flange sits flush against nostril without being inserted too far',
        'Listen for air movement through NPA during spontaneous ventilation',
        'Check that patient can breathe comfortably through both nose and mouth',
        'Observe chest rise and fall to confirm adequate ventilation',
        'Assess oxygen saturation improvement if hypoxic before insertion',
        'Look for signs of bleeding, swelling, or nasal trauma',
        'Test patency by feeling air movement at proximal end during expiration',
        'Confirm patient tolerance without excessive gagging or distress'
      ],
      safetyNotes: [
        'Remove immediately if airway becomes obstructed or patient deteriorates',
        'Monitor for signs of esophageal insertion (no air movement)',
        'Be alert for complications like epistaxis or laryngospasm'
      ],
      equipmentNeeded: [
        'Pulse oximetry',
        'Stethoscope for breath sound assessment',
        'Flashlight for visual inspection',
        'Suction equipment if bleeding occurs'
      ]
    },
    {
      id: 'npa_6',
      stepNumber: 6,
      title: 'Securing and monitoring airway function',
      description: 'Secure nasopharyngeal airway and establish continuous monitoring protocol',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Secure NPA with safety pin through flange to prevent aspiration',
        'Attach safety pin to patient\'s clothing or tape to face/nose',
        'Ensure security doesn\'t occlude the airway opening',
        'Monitor respiratory rate, depth, and oxygen saturation continuously',
        'Assess patient comfort and tolerance of the airway device',
        'Check for signs of mucosal irritation, bleeding, or swelling',
        'Document time of insertion and initial patient response',
        'Establish routine monitoring schedule (every 15 minutes minimum)'
      ],
      safetyNotes: [
        'Never leave NPA unsecured - risk of aspiration if dislodged',
        'Ensure securing method doesn\'t compress nasal tissues',
        'Monitor for increasing nasal congestion or obstruction'
      ],
      equipmentNeeded: [
        'Safety pin',
        'Medical tape',
        'Scissors for tape cutting',
        'Continuous monitoring equipment',
        'Documentation materials'
      ]
    },
    {
      id: 'npa_7',
      stepNumber: 7,
      title: 'Ongoing assessment and maintenance',
      description: 'Perform regular assessment and maintenance of nasopharyngeal airway function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Regularly assess patency by checking air movement and breath sounds',
        'Monitor for complications: bleeding, infection, tissue necrosis',
        'Suction through NPA if secretions accumulate and obstruct airway',
        'Check security of airway - retape if becoming loose',
        'Assess patient neurological status and level of consciousness',
        'Monitor for improvement in condition that might allow NPA removal',
        'Watch for signs of sinusitis or other complications with prolonged use',
        'Document any changes in patient condition or airway function'
      ],
      safetyNotes: [
        'Replace or remove NPA if signs of infection or tissue damage appear',
        'Never suction too deeply through NPA to avoid trauma',
        'Consider alternating nostrils if prolonged use required'
      ],
      equipmentNeeded: [
        'Suction catheters appropriate for NPA size',
        'Replacement NPAs if needed',
        'Assessment tools (pulse oximeter, stethoscope)',
        'Documentation forms'
      ]
    },
    {
      id: 'npa_8',
      stepNumber: 8,
      title: 'Documentation and disposition planning',
      description: 'Complete thorough documentation and plan for ongoing airway management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Document indication for NPA insertion and patient condition',
        'Record NPA size used and ease/difficulty of insertion',
        'Note patient response to insertion and any complications',
        'Document ongoing monitoring findings and patient tolerance',
        'Include vital signs before and after NPA insertion',
        'Record any medications or interventions used during procedure',
        'Plan for transport considerations and airway management during transfer',
        'Communicate findings and ongoing needs to receiving healthcare team'
      ],
      safetyNotes: [
        'Ensure complete documentation for continuity of care',
        'Alert receiving team to presence of NPA and any complications',
        'Provide clear instructions for ongoing care and monitoring'
      ],
      equipmentNeeded: [
        'Medical record documentation system',
        'Communication devices for team updates',
        'Transport monitoring equipment',
        'Airway management supplies for transport'
      ]
    }
  ],

  // ADULT CHOKING WITHOUT EQUIPMENT
  'adult-choking-without-equipment': [
    {
      id: 'choking_1',
      stepNumber: 1,
      title: 'Recognition and initial assessment',
      description: 'Rapidly recognize signs of airway obstruction and assess severity of choking emergency',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Look for universal choking sign - hands clutching throat',
        'Assess ability to speak, cough, or breathe effectively',
        'Determine if obstruction is partial (can speak/cough) or complete (silent)',
        'Check for cyanosis around lips, face, or fingernails',
        'Observe chest movement and respiratory effort',
        'Ask "Are you choking?" if patient appears distressed',
        'Differentiate from other causes of respiratory distress',
        'Note time of onset and witness information'
      ],
      safetyNotes: [
        'Partial obstruction may become complete - be ready to intervene',
        'Do not interfere if patient can cough effectively',
        'Call for additional help immediately'
      ],
      equipmentNeeded: [
        'No equipment required for initial assessment',
        'Consider calling for backup/EMS immediately'
      ]
    },
    {
      id: 'choking_2',
      stepNumber: 2,
      title: 'Patient positioning and preparation',
      description: 'Position patient appropriately and prepare for manual airway clearance techniques',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Stand behind patient if they are upright and conscious',
        'Support patient if they appear weak or may collapse',
        'Remove any visible loose objects from mouth if safe to do so',
        'Avoid blind finger sweeps which may push objects deeper',
        'Encourage continued coughing if patient can do so effectively',
        'Position yourself for optimal leverage and stability',
        'Clear area around patient to prevent falls during procedure',
        'Assess patient size to determine appropriate technique modifications'
      ],
      safetyNotes: [
        'Never perform blind finger sweeps in conscious patients',
        'Be prepared to support patient weight if they become unconscious',
        'Ensure your own stability to deliver effective compressions'
      ],
      equipmentNeeded: [
        'Clear space around patient',
        'Stable footing for rescuer',
        'Good lighting if available'
      ]
    },
    {
      id: 'choking_3',
      stepNumber: 3,
      title: 'Back blows administration',
      description: 'Deliver firm back blows between shoulder blades to dislodge airway obstruction',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Position yourself slightly to side and behind patient',
        'Support patient\'s chest with one hand, lean them forward',
        'Use heel of other hand to deliver sharp blows between shoulder blades',
        'Deliver 5 firm, distinct back blows with sufficient force',
        'Aim between shoulder blades, not on spine or neck',
        'Check mouth for expelled object after each series of blows',
        'Allow patient to attempt coughing between back blow series',
        'Be prepared to catch any expelled objects or debris'
      ],
      safetyNotes: [
        'Use appropriate force - firm enough to be effective but not cause injury',
        'Avoid striking spine or neck directly',
        'Support patient to prevent falls during procedure'
      ],
      equipmentNeeded: [
        'No equipment needed',
        'Container to catch expelled objects if available'
      ]
    },
    {
      id: 'choking_4',
      stepNumber: 4,
      title: 'Abdominal thrusts (Heimlich maneuver)',
      description: 'Perform abdominal thrusts to create artificial cough and expel airway obstruction',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Stand behind patient, wrap arms around waist just above navel',
        'Place fist with thumb side against abdomen between navel and rib cage',
        'Grasp fist with other hand, avoid placing hands on ribs',
        'Give quick, upward and inward thrusts using your whole body',
        'Deliver 5 distinct abdominal thrusts with adequate force',
        'Each thrust should be separate and distinct motion',
        'Check for object expulsion after each series of thrusts',
        'Continue alternating with back blows if obstruction persists'
      ],
      safetyNotes: [
        'Avoid performing abdominal thrusts on pregnant patients',
        'Do not place hands directly over ribs or xiphoid process',
        'Be aware that abdominal thrusts can cause internal injuries'
      ],
      equipmentNeeded: [
        'No equipment required',
        'Space to position behind patient'
      ]
    },
    {
      id: 'choking_5',
      stepNumber: 5,
      title: 'Alternating technique cycles',
      description: 'Continue alternating cycles of back blows and abdominal thrusts until obstruction clears',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Continue alternating 5 back blows followed by 5 abdominal thrusts',
        'Check mouth and airway between each cycle for visible objects',
        'Monitor patient consciousness and responsiveness continuously',
        'Be prepared to modify technique if patient becomes unconscious',
        'Look for signs of obstruction relief: ability to speak, cough, or breathe',
        'Continue cycles until obstruction is relieved or patient becomes unconscious',
        'Call for advanced medical assistance if not already done',
        'Document number of cycles performed and patient response'
      ],
      safetyNotes: [
        'If patient becomes unconscious, immediately begin CPR protocols',
        'Do not stop to rest - maintain continuous effort until obstruction clears',
        'Be prepared for patient collapse and support their descent if needed'
      ],
      equipmentNeeded: [
        'Communication device to call for help',
        'Timer or watch to track duration'
      ]
    },
    {
      id: 'choking_6',
      stepNumber: 6,
      title: 'Unconscious patient management',
      description: 'Manage patient who becomes unconscious during choking emergency with modified CPR',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'If patient becomes unconscious, lower them to ground supporting head/neck',
        'Open airway using head-tilt, chin-lift maneuver',
        'Look for visible objects in mouth and remove only if clearly visible',
        'Attempt rescue breathing - if unsuccessful, begin chest compressions',
        'Perform 30 chest compressions followed by airway check',
        'Look in mouth after each set of compressions for expelled objects',
        'Attempt 2 rescue breaths, then continue compressions if no air entry',
        'Continue modified CPR until obstruction clears or advanced help arrives'
      ],
      safetyNotes: [
        'Use only finger sweeps for clearly visible objects',
        'Ensure proper hand placement for chest compressions',
        'Call for advanced life support immediately if not already done'
      ],
      equipmentNeeded: [
        'Barrier device for rescue breathing if available',
        'Hard surface for chest compressions',
        'Communication device for emergency services'
      ]
    },
    {
      id: 'choking_7',
      stepNumber: 7,
      title: 'Post-obstruction care and monitoring',
      description: 'Provide immediate post-emergency care after successful obstruction removal',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Once obstruction is cleared, monitor patient breathing and consciousness',
        'Position patient in recovery position if unconscious but breathing',
        'Assess for injuries from abdominal thrusts or chest compressions',
        'Monitor for signs of respiratory distress or partial obstruction',
        'Check oxygen saturation if pulse oximetry available',
        'Provide supplemental oxygen if available and indicated',
        'Prepare for transport to medical facility for evaluation',
        'Reassess airway patency and breathing effectiveness continuously'
      ],
      safetyNotes: [
        'All patients should be evaluated at medical facility after choking episode',
        'Watch for delayed respiratory complications or swelling',
        'Be prepared to repeat intervention if obstruction recurs'
      ],
      equipmentNeeded: [
        'Pulse oximetry if available',
        'Supplemental oxygen if available',
        'Monitoring equipment',
        'Transport arrangements'
      ]
    },
    {
      id: 'choking_8',
      stepNumber: 8,
      title: 'Documentation and follow-up care',
      description: 'Document incident thoroughly and arrange appropriate medical follow-up',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Document time of incident, interventions performed, and patient response',
        'Record number of back blows and abdominal thrusts delivered',
        'Note any complications or injuries sustained during procedure',
        'Document patient condition before and after obstruction removal',
        'Record vital signs and oxygen saturation if available',
        'Arrange immediate transport to emergency department for evaluation',
        'Provide report to receiving medical team about interventions performed',
        'Advise patient of potential delayed complications requiring medical attention'
      ],
      safetyNotes: [
        'All choking patients require medical evaluation regardless of apparent recovery',
        'Ensure complete documentation for legal and medical continuity',
        'Advise patient to seek immediate care for any delayed symptoms'
      ],
      equipmentNeeded: [
        'Documentation materials',
        'Communication devices for medical facility contact',
        'Transport arrangements',
        'Medical evaluation forms'
      ]
    }
  ],

  // OROPHARYNGEAL SUCTIONING
  'oropharyngeal-suctioning': [
    {
      id: 'oro_suction_1',
      stepNumber: 1,
      title: 'Patient assessment and indication evaluation',
      description: 'Assess patient condition and determine need for oropharyngeal suctioning intervention',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess patient level of consciousness and ability to protect airway',
        'Identify presence of visible secretions, blood, or debris in oral cavity',
        'Evaluate effectiveness of patient\'s natural cough reflex',
        'Look for signs of respiratory distress or airway obstruction',
        'Check oxygen saturation and respiratory rate before intervention',
        'Assess gag reflex presence and strength if patient conscious',
        'Determine urgency of suctioning need based on airway compromise',
        'Consider patient positioning and spinal precautions if trauma suspected'
      ],
      safetyNotes: [
        'Be prepared for patient to vomit during stimulation',
        'Have backup airway management equipment ready',
        'Monitor patient tolerance throughout assessment'
      ],
      equipmentNeeded: [
        'Pulse oximetry',
        'Stethoscope for breath sound assessment',
        'Flashlight or penlight for oral cavity inspection',
        'Suction equipment setup'
      ]
    },
    {
      id: 'oro_suction_2',
      stepNumber: 2,
      title: 'Equipment preparation and setup',
      description: 'Prepare and test all suctioning equipment to ensure proper function and readiness',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Check suction unit power source and ensure adequate battery/power',
        'Test suction pressure - typically 80-120 mmHg for adults',
        'Select appropriate suction catheter: rigid tip (Yankauer) for thick secretions',
        'Inspect suction catheter for cracks, holes, or defects',
        'Connect suction tubing and ensure all connections are secure',
        'Test suction by occluding catheter tip and checking pressure gauge',
        'Prepare collection canister and ensure proper installation',
        'Have backup catheters and equipment readily available'
      ],
      safetyNotes: [
        'Never use damaged or contaminated suction catheters',
        'Ensure suction pressure is appropriate for patient age and condition',
        'Test equipment before patient contact to prevent delays'
      ],
      equipmentNeeded: [
        'Portable or mounted suction unit',
        'Rigid suction catheter (Yankauer tip)',
        'Flexible suction catheters in multiple sizes',
        'Suction tubing and connectors',
        'Collection canister',
        'Personal protective equipment'
      ]
    },
    {
      id: 'oro_suction_3',
      stepNumber: 3,
      title: 'Patient positioning and preparation',
      description: 'Position patient optimally for safe and effective oropharyngeal suctioning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient in lateral recumbent (recovery) position if possible',
        'Turn patient\'s head to side to promote drainage and prevent aspiration',
        'Maintain cervical spine immobilization if trauma suspected',
        'Elevate head of bed or stretcher if patient condition allows',
        'Open patient\'s mouth using jaw-lift or tongue-jaw lift maneuver',
        'Ensure adequate lighting and visualization of oral cavity',
        'Have emesis basin or towels ready to catch suctioned material',
        'Position yourself for optimal access and visualization'
      ],
      safetyNotes: [
        'Always maintain spinal precautions in trauma patients',
        'Position to prevent aspiration of suctioned material',
        'Be gentle with mouth opening to avoid dental or jaw injury'
      ],
      equipmentNeeded: [
        'Patient positioning aids (pillows, supports)',
        'Emesis basin or collection container',
        'Towels or absorbent pads',
        'Adequate lighting source'
      ]
    },
    {
      id: 'oro_suction_4',
      stepNumber: 4,
      title: 'Initial suctioning technique',
      description: 'Perform initial oropharyngeal suctioning using proper technique and safety measures',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Insert suction catheter without applying suction initially',
        'Advance catheter to visible secretions or debris in oral cavity',
        'Apply intermittent suction while slowly withdrawing catheter',
        'Use sweeping motion to clear secretions from entire oral cavity',
        'Suction for maximum 15 seconds at a time in adults',
        'Allow patient to breathe between suction attempts',
        'Focus on removing most accessible secretions first',
        'Monitor patient oxygen saturation and vital signs during procedure'
      ],
      safetyNotes: [
        'Never exceed recommended suction duration to prevent hypoxia',
        'Do not advance catheter blindly into pharynx',
        'Stop immediately if patient becomes bradycardic or desaturates'
      ],
      equipmentNeeded: [
        'Functioning suction unit with appropriate catheter',
        'Pulse oximetry for continuous monitoring',
        'Timer or watch to monitor suction duration',
        'Supplemental oxygen if available'
      ]
    },
    {
      id: 'oro_suction_5',
      stepNumber: 5,
      title: 'Deep pharyngeal and ongoing suctioning',
      description: 'Continue suctioning deeper areas of oropharynx while monitoring patient response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Suction deeper into oropharynx if secretions remain and patient tolerates',
        'Use rigid catheter to remove thick secretions and particulate matter',
        'Switch to flexible catheter for deeper pharyngeal suctioning if needed',
        'Rotate catheter during withdrawal to maximize secretion removal',
        'Allow adequate recovery time between suction attempts (30-60 seconds)',
        'Provide supplemental oxygen between suction attempts if available',
        'Reassess oral cavity after each suction attempt for remaining debris',
        'Continue until airway is clear or patient cannot tolerate further suctioning'
      ],
      safetyNotes: [
        'Monitor for vasovagal response during deep pharyngeal stimulation',
        'Watch for signs of laryngospasm or airway reflexes',
        'Be prepared to provide ventilatory support if patient becomes apneic'
      ],
      equipmentNeeded: [
        'Both rigid and flexible suction catheters',
        'Supplemental oxygen and delivery device',
        'Bag-valve mask for ventilatory support if needed',
        'Cardiac monitoring if available'
      ]
    },
    {
      id: 'oro_suction_6',
      stepNumber: 6,
      title: 'Post-suctioning assessment and airway verification',
      description: 'Assess effectiveness of suctioning and verify improved airway patency',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Visually inspect oral cavity for remaining secretions or debris',
        'Listen for improved breath sounds and decreased respiratory noise',
        'Assess patient respiratory effort and oxygen saturation improvement',
        'Check for improved air movement and chest rise',
        'Monitor patient comfort and reduced signs of respiratory distress',
        'Evaluate effectiveness of patient\'s cough reflex if conscious',
        'Document amount and character of suctioned material',
        'Determine need for additional suctioning or airway interventions'
      ],
      safetyNotes: [
        'Do not assume suctioning is complete based on appearance alone',
        'Continue monitoring for airway compromise',
        'Be prepared to repeat suctioning if secretions reaccumulate'
      ],
      equipmentNeeded: [
        'Pulse oximetry for saturation monitoring',
        'Stethoscope for breath sound assessment',
        'Measuring container for volume documentation',
        'Assessment forms for documentation'
      ]
    },
    {
      id: 'oro_suction_7',
      stepNumber: 7,
      title: 'Equipment cleaning and maintenance',
      description: 'Properly clean and maintain suction equipment while ensuring continued readiness',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Rinse suction catheter and tubing with clean water or saline',
        'Clear any debris or secretions from catheter lumens',
        'Replace suction catheter if heavily contaminated or damaged',
        'Empty and clean collection canister according to protocols',
        'Check suction unit function and pressure after cleaning',
        'Ensure equipment is ready for potential additional use',
        'Store equipment in clean, accessible location',
        'Document equipment maintenance and any issues encountered'
      ],
      safetyNotes: [
        'Use appropriate PPE during equipment cleaning',
        'Dispose of contaminated materials according to biohazard protocols',
        'Ensure equipment functionality before declaring ready for use'
      ],
      equipmentNeeded: [
        'Clean water or normal saline for rinsing',
        'Replacement catheters and collection canisters',
        'Cleaning supplies and disinfectants',
        'Biohazard disposal containers',
        'Personal protective equipment'
      ]
    },
    {
      id: 'oro_suction_8',
      stepNumber: 8,
      title: 'Documentation and ongoing monitoring',
      description: 'Document procedure thoroughly and establish ongoing airway monitoring plan',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Document indication for suctioning and patient condition before procedure',
        'Record type and amount of secretions removed during suctioning',
        'Note patient tolerance of procedure and any complications',
        'Document vital signs and oxygen saturation before and after suctioning',
        'Record equipment used and any technical difficulties encountered',
        'Establish plan for ongoing airway monitoring and repeat suctioning if needed',
        'Communicate findings to receiving healthcare team or transport personnel',
        'Schedule reassessment intervals based on patient condition and secretion production'
      ],
      safetyNotes: [
        'Ensure accurate documentation for continuity of care',
        'Alert team members to ongoing suctioning needs',
        'Monitor for delayed complications or airway compromise'
      ],
      equipmentNeeded: [
        'Medical record documentation system',
        'Measuring devices for secretion volume',
        'Communication devices for team updates',
        'Ongoing monitoring equipment setup'
      ]
    }
  ],

  // ENDOTRACHEAL TUBE SUCTIONING
  'endotracheal-tube-suctioning': [
    {
      id: 'ett_suction_1',
      stepNumber: 1,
      title: 'Patient assessment and indication determination',
      description: 'Assess intubated patient condition and determine need for endotracheal suctioning intervention',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess patient oxygen saturation and respiratory status continuously',
        'Listen for coarse breath sounds or secretions in ETT during ventilation',
        'Monitor for increased airway pressures on mechanical ventilator',
        'Observe for visible secretions in ETT or ventilator circuit',
        'Check for decreased tidal volumes or poor chest expansion',
        'Assess patient agitation or fighting ventilator (if conscious)',
        'Monitor capnography waveform for dampening indicating obstruction',
        'Determine urgency based on degree of respiratory compromise'
      ],
      safetyNotes: [
        'Never suction routinely - only when clinically indicated',
        'Pre-oxygenate patient before any suctioning procedure',
        'Monitor cardiac rhythm during procedure for arrhythmias'
      ],
      equipmentNeeded: [
        'Pulse oximetry and capnography monitoring',
        'Ventilator with pressure monitoring',
        'Stethoscope for breath sound assessment',
        'ECG monitoring if available'
      ]
    },
    {
      id: 'ett_suction_2',
      stepNumber: 2,
      title: 'Equipment preparation and sterile setup',
      description: 'Prepare sterile suctioning equipment and ensure proper function before patient intervention',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Select appropriate suction catheter size: no more than half ETT internal diameter',
        'Common sizes: 14Fr for 8.0 ETT, 12Fr for 7.0-7.5 ETT, 10Fr for 6.0-6.5 ETT',
        'Check suction unit pressure: 100-150 mmHg for adults',
        'Prepare sterile suction catheter maintaining sterile technique',
        'Set up sterile normal saline for catheter irrigation',
        'Don sterile gloves using proper technique',
        'Test suction catheter patency and suction pressure',
        'Have backup catheters and equipment immediately available'
      ],
      safetyNotes: [
        'Maintain strict sterile technique to prevent ventilator-associated pneumonia',
        'Never reuse suction catheters between procedures',
        'Ensure adequate suction pressure to clear thick secretions'
      ],
      equipmentNeeded: [
        'Sterile suction catheters in appropriate sizes',
        'Sterile gloves and sterile normal saline',
        'Suction unit with pressure gauge',
        'Sterile collection container',
        'Personal protective equipment including eye protection'
      ]
    },
    {
      id: 'ett_suction_3',
      stepNumber: 3,
      title: 'Pre-oxygenation and patient preparation',
      description: 'Provide adequate pre-oxygenation and prepare patient for safe endotracheal suctioning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Increase FiO2 to 100% oxygen for 1-2 minutes before suctioning',
        'Provide manual ventilation with 100% oxygen if not on mechanical ventilator',
        'Ensure patient is adequately sedated if conscious and agitated',
        'Position patient with head elevated 30-45 degrees if possible',
        'Explain procedure to conscious patients to reduce anxiety',
        'Have assistant available to help with ventilator disconnection/reconnection',
        'Prepare for potential complications including hypoxia and bradycardia',
        'Document baseline vital signs and oxygen saturation'
      ],
      safetyNotes: [
        'Adequate pre-oxygenation is critical to prevent hypoxic episodes',
        'Monitor patient closely for signs of distress during preparation',
        'Have emergency medications readily available (atropine, epinephrine)'
      ],
      equipmentNeeded: [
        'Oxygen source capable of 100% FiO2',
        'Manual ventilation bag with reservoir',
        'Sedation medications if indicated',
        'Emergency resuscitation equipment'
      ]
    },
    {
      id: 'ett_suction_4',
      stepNumber: 4,
      title: 'Catheter insertion and advancement',
      description: 'Insert suction catheter into ETT using sterile technique and proper depth',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Disconnect ventilator or bag-valve device from ETT using sterile technique',
        'Insert catheter into ETT without applying suction initially',
        'Advance catheter until resistance met (carina) then withdraw 1-2 cm',
        'Typical depth: 24-26 cm for average adult (varies by ETT position)',
        'Use gentle advancement - never force catheter',
        'Maintain sterile technique throughout insertion',
        'Limit disconnection time to absolute minimum',
        'Have assistant ready to reconnect ventilation immediately'
      ],
      safetyNotes: [
        'Never apply suction during catheter insertion to prevent trauma',
        'Do not advance catheter beyond carina to avoid lung injury',
        'Minimize time off ventilator to prevent hypoxia'
      ],
      equipmentNeeded: [
        'Sterile suction catheter',
        'Sterile gloves',
        'Ventilator or manual ventilation device',
        'Assistant for ventilator management'
      ]
    },
    {
      id: 'ett_suction_5',
      stepNumber: 5,
      title: 'Suctioning technique and secretion removal',
      description: 'Apply suction while withdrawing catheter to effectively remove secretions from airways',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Apply intermittent suction while slowly withdrawing catheter',
        'Use rotating motion during withdrawal to clear all airway surfaces',
        'Limit each suction pass to maximum 10-15 seconds',
        'Apply suction only during catheter withdrawal, not insertion',
        'Monitor patient oxygen saturation continuously during procedure',
        'Watch for cardiac rhythm changes indicating hypoxia or vagal stimulation',
        'Remove catheter completely and reconnect ventilation immediately',
        'Assess volume and character of suctioned secretions'
      ],
      safetyNotes: [
        'Never exceed 15 seconds of suctioning to prevent severe hypoxia',
        'Stop immediately if patient develops bradycardia or severe desaturation',
        'Be prepared to provide emergency ventilation if complications arise'
      ],
      equipmentNeeded: [
        'Functioning suction unit with pressure control',
        'Continuous cardiac and oxygen saturation monitoring',
        'Collection container for secretion measurement',
        'Emergency ventilation equipment'
      ]
    },
    {
      id: 'ett_suction_6',
      stepNumber: 6,
      title: 'Post-suctioning ventilation and assessment',
      description: 'Restore mechanical ventilation and assess patient response to suctioning procedure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Reconnect patient to ventilator or resume manual ventilation immediately',
        'Return FiO2 to pre-procedure levels once oxygen saturation recovers',
        'Auscultate breath sounds to assess improvement in air movement',
        'Monitor oxygen saturation return to baseline or improvement',
        'Check ventilator pressures for improvement (decreased peak pressures)',
        'Assess capnography waveform for improved CO2 clearance',
        'Monitor patient comfort and synchrony with ventilator',
        'Document patient response and effectiveness of suctioning'
      ],
      safetyNotes: [
        'Ensure secure ventilator reconnection to prevent accidental disconnection',
        'Monitor for pneumothorax if high pressures were used',
        'Watch for delayed complications including hypoxia or arrhythmias'
      ],
      equipmentNeeded: [
        'Mechanical ventilator or manual ventilation device',
        'Pulse oximetry and capnography monitoring',
        'Stethoscope for breath sound assessment',
        'Documentation materials for vital signs'
      ]
    },
    {
      id: 'ett_suction_7',
      stepNumber: 7,
      title: 'Equipment disposal and infection control',
      description: 'Safely dispose of used equipment and maintain infection control protocols',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Dispose of used suction catheter in appropriate biohazard container',
        'Remove and dispose of sterile gloves using proper technique',
        'Clear suction tubing with sterile saline to remove debris',
        'Empty and clean suction collection container if full',
        'Perform hand hygiene immediately after glove removal',
        'Clean and disinfect reusable equipment according to protocols',
        'Replace any contaminated ventilator circuit components',
        'Document equipment used and any maintenance needs'
      ],
      safetyNotes: [
        'Never reuse single-use suction catheters to prevent infection',
        'Use appropriate PPE throughout disposal process',
        'Follow facility protocols for biohazardous waste disposal'
      ],
      equipmentNeeded: [
        'Biohazard disposal containers for catheters and gloves',
        'Hand hygiene supplies (soap, alcohol-based sanitizer)',
        'Cleaning supplies for equipment decontamination',
        'Replacement ventilator circuit components if needed'
      ]
    },
    {
      id: 'ett_suction_8',
      stepNumber: 8,
      title: 'Documentation and ongoing monitoring',
      description: 'Document procedure thoroughly and establish plan for ongoing airway management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Document indication for suctioning and pre-procedure patient status',
        'Record volume, color, and consistency of suctioned secretions',
        'Note patient tolerance of procedure and any complications',
        'Document vital signs before, during, and after suctioning',
        'Record ventilator settings and pressure changes',
        'Plan frequency of reassessment based on secretion production',
        'Communicate findings to healthcare team and receiving facilities',
        'Schedule next suctioning based on patient needs, not routine timing'
      ],
      safetyNotes: [
        'Ensure accurate documentation for continuity of care',
        'Alert team to any complications or changes in patient condition',
        'Avoid routine suctioning schedules - base on clinical need only'
      ],
      equipmentNeeded: [
        'Medical record documentation system',
        'Measuring container for secretion volume',
        'Communication devices for team coordination',
        'Ongoing monitoring equipment and ventilator'
      ]
    }
  ],

  // MODIFIED VALSALVA MANEUVER
  'modified-valsalva-maneuver': [
    {
      id: 'valsalva_1',
      stepNumber: 1,
      title: 'Patient assessment and rhythm analysis',
      description: 'Assess patient condition and confirm appropriate rhythm for modified Valsalva maneuver intervention',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Obtain 12-lead ECG and confirm narrow-complex supraventricular tachycardia (SVT)',
        'Verify heart rate typically >150 bpm with regular rhythm',
        'Rule out other arrhythmias: atrial fibrillation, atrial flutter, wide-complex tachycardia',
        'Assess patient hemodynamic stability and consciousness level',
        'Check blood pressure and ensure systolic >90 mmHg',
        'Evaluate for signs of heart failure, chest pain, or ischemia',
        'Review patient history for contraindications to vagal maneuvers',
        'Document baseline vital signs and ECG rhythm strip'
      ],
      safetyNotes: [
        'Do not attempt if patient is hemodynamically unstable',
        'Rule out ventricular tachycardia before attempting vagal maneuvers',
        'Have emergency equipment ready including defibrillator and medications'
      ],
      equipmentNeeded: [
        '12-lead ECG machine',
        'Continuous cardiac monitoring',
        'Blood pressure monitoring equipment',
        'Pulse oximetry',
        'Emergency resuscitation equipment'
      ]
    },
    {
      id: 'valsalva_2',
      stepNumber: 2,
      title: 'Patient preparation and positioning',
      description: 'Position patient appropriately and prepare for modified Valsalva maneuver technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position patient supine with head of bed elevated 45 degrees initially',
        'Ensure patient is comfortable and can follow instructions',
        'Explain procedure to patient and obtain informed consent',
        'Establish IV access for emergency medication administration if needed',
        'Remove any tight clothing around neck or chest',
        'Apply continuous cardiac monitoring with rhythm strip capability',
        'Have emergency medications prepared (adenosine, diltiazem, cardioversion)',
        'Position team members for rapid intervention if complications occur'
      ],
      safetyNotes: [
        'Ensure patient understands procedure and can cooperate',
        'Have emergency medications and defibrillator immediately available',
        'Monitor patient continuously for rhythm changes'
      ],
      equipmentNeeded: [
        'Hospital bed or stretcher with adjustable head',
        'IV equipment and emergency medications',
        'Continuous cardiac monitoring',
        'Emergency airway and resuscitation equipment'
      ]
    },
    {
      id: 'valsalva_3',
      stepNumber: 3,
      title: 'Initial standard Valsalva attempt',
      description: 'Perform initial standard Valsalva maneuver with patient in semi-upright position',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Have patient take deep breath and bear down as if having bowel movement',
        'Maintain straining effort for 15 seconds while monitoring rhythm',
        'Apply gentle pressure to abdomen to assist with Valsalva if needed',
        'Monitor ECG continuously during strain and recovery phases',
        'Watch for rhythm conversion during strain or immediate recovery',
        'Document any rhythm changes or patient symptoms during procedure',
        'Allow 30-60 seconds recovery time between attempts',
        'Assess patient tolerance and ability to cooperate with maneuver'
      ],
      safetyNotes: [
        'Monitor for excessive vagal response causing severe bradycardia',
        'Stop immediately if patient becomes symptomatic or rhythm changes dangerously',
        'Be prepared for post-Valsalva asystole or extreme bradycardia'
      ],
      equipmentNeeded: [
        'Continuous ECG monitoring with rhythm strips',
        'Timer or stopwatch for 15-second intervals',
        'Emergency medications for bradycardia (atropine)',
        'Backup pacing capability if available'
      ]
    },
    {
      id: 'valsalva_4',
      stepNumber: 4,
      title: 'Modified technique with position change',
      description: 'If initial attempt unsuccessful, perform modified Valsalva with passive leg raise technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'If standard Valsalva unsuccessful, prepare for modified technique',
        'Have patient perform Valsalva strain for 15 seconds in semi-upright position',
        'Immediately after strain release, rapidly lower head of bed to supine',
        'Simultaneously elevate both legs to 45 degrees for 15 seconds',
        'This enhances venous return and augments vagal stimulation',
        'Monitor closely for rhythm conversion during position change',
        'Return patient to comfortable position after 15 seconds of leg elevation',
        'Document any rhythm changes during modified maneuver'
      ],
      safetyNotes: [
        'Ensure smooth, rapid position changes to maximize effectiveness',
        'Monitor for orthostatic changes and patient discomfort',
        'Be prepared for immediate rhythm conversion requiring no further intervention'
      ],
      equipmentNeeded: [
        'Adjustable hospital bed or stretcher',
        'Assistants for rapid position changes',
        'Continuous cardiac monitoring',
        'Blood pressure monitoring during position changes'
      ]
    },
    {
      id: 'valsalva_5',
      stepNumber: 5,
      title: 'Post-maneuver monitoring and assessment',
      description: 'Monitor patient response and assess effectiveness of Valsalva maneuver intervention',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor cardiac rhythm continuously for at least 5 minutes post-procedure',
        'Check vital signs including blood pressure and oxygen saturation',
        'Assess patient symptoms and overall clinical improvement',
        'Document rhythm conversion if successful (target: normal sinus rhythm)',
        'Watch for rebound tachycardia or other rhythm disturbances',
        'Evaluate need for additional interventions if maneuver unsuccessful',
        'Monitor for delayed complications including bradycardia or asystole',
        'Reassess patient hemodynamic stability after procedure'
      ],
      safetyNotes: [
        'Continue monitoring as some rhythm changes may be delayed',
        'Be prepared to treat post-Valsalva bradycardia or other arrhythmias',
        'Watch for signs of hemodynamic compromise'
      ],
      equipmentNeeded: [
        'Continuous cardiac monitoring',
        'Blood pressure monitoring equipment',
        'Pulse oximetry',
        'ECG machine for post-procedure 12-lead',
        'Emergency medications if complications arise'
      ]
    },
    {
      id: 'valsalva_6',
      stepNumber: 6,
      title: 'Alternative intervention planning',
      description: 'Plan alternative treatments if modified Valsalva maneuver is unsuccessful',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'If Valsalva unsuccessful, consider adenosine 6mg rapid IV push',
        'Prepare for synchronized cardioversion if medications fail',
        'Consider calcium channel blockers (diltiazem) for rate control',
        'Assess patient for urgent cardiology consultation',
        'Plan transport to higher level of care if interventions unsuccessful',
        'Document failed Valsalva attempt and rationale for alternative treatments',
        'Consider beta-blockers for ongoing rate control if appropriate',
        'Evaluate for underlying causes requiring specific treatment'
      ],
      safetyNotes: [
        'Follow proper protocols for adenosine administration (rapid IV push)',
        'Be prepared for brief asystole following adenosine administration',
        'Have cardioversion equipment ready if pharmacologic conversion fails'
      ],
      equipmentNeeded: [
        'Adenosine and other emergency cardiac medications',
        'IV equipment for rapid medication administration',
        'Synchronized cardioversion capability',
        'Advanced cardiac monitoring',
        'Transport arrangements for higher level care'
      ]
    },
    {
      id: 'valsalva_7',
      stepNumber: 7,
      title: 'Patient education and discharge planning',
      description: 'Educate patient about procedure and plan for ongoing cardiac care if conversion successful',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Explain what happened during the procedure and why it was necessary',
        'Discuss signs and symptoms that should prompt immediate medical attention',
        'Teach patient self-Valsalva techniques for future episodes if appropriate',
        'Provide instructions for cardiac follow-up and specialist consultation',
        'Review medications and lifestyle modifications for SVT prevention',
        'Discuss activity restrictions and when to resume normal activities',
        'Provide written discharge instructions with emergency contact information',
        'Schedule follow-up ECG and cardiac evaluation as indicated'
      ],
      safetyNotes: [
        'Ensure patient understands when to seek emergency care for recurrence',
        'Provide clear instructions about medication compliance if prescribed',
        'Emphasize importance of cardiac follow-up evaluation'
      ],
      equipmentNeeded: [
        'Patient education materials about SVT',
        'Written discharge instructions',
        'Contact information for cardiology follow-up',
        'Prescription forms if medications prescribed'
      ]
    },
    {
      id: 'valsalva_8',
      stepNumber: 8,
      title: 'Documentation and communication',
      description: 'Document procedure thoroughly and communicate findings to healthcare team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Document initial rhythm, vital signs, and patient symptoms',
        'Record detailed description of Valsalva technique used (standard vs modified)',
        'Note patient response including any rhythm conversion or complications',
        'Document vital signs before, during, and after procedure',
        'Record any medications administered or additional interventions required',
        'Include rhythm strips showing pre- and post-procedure cardiac rhythms',
        'Communicate results to receiving physician or cardiologist',
        'Document patient education provided and discharge instructions given'
      ],
      safetyNotes: [
        'Ensure accurate documentation for legal and continuity of care purposes',
        'Include all rhythm strips and vital sign data in medical record',
        'Communicate any ongoing concerns to receiving healthcare team'
      ],
      equipmentNeeded: [
        'Medical record documentation system',
        'ECG rhythm strips for documentation',
        'Communication devices for physician contact',
        'Patient chart or electronic medical record access'
      ]
    }
  ],

  // OROPHARYNGEAL AIRWAY INSERTION
  'oropharyngeal-airway-insertion': [
    {
      id: 'opa_1',
      stepNumber: 1,
      title: 'Patient assessment and airway evaluation',
      description: 'Assess patient condition and determine appropriateness for oropharyngeal airway insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Evaluate patient level of consciousness - OPA only for unconscious patients',
        'Assess for absent or significantly diminished gag reflex',
        'Check for upper airway obstruction due to tongue or soft tissue collapse',
        'Examine oral cavity for visible foreign objects, blood, or secretions',
        'Assess patient positioning and cervical spine considerations',
        'Determine if patient can maintain own airway or requires intervention',
        'Check oxygen saturation and respiratory effort before intervention',
        'Rule out need for more advanced airway management (intubation)'
      ],
      safetyNotes: [
        'Never insert OPA in conscious patient with intact gag reflex',
        'OPA can stimulate vomiting in semiconscious patients',
        'Have suction immediately available before insertion'
      ],
      equipmentNeeded: [
        'Pulse oximetry monitoring',
        'Suction equipment with Yankauer catheter',
        'Flashlight or penlight for oral examination',
        'Various sizes of oropharyngeal airways'
      ]
    },
    {
      id: 'opa_2',
      stepNumber: 2,
      title: 'Airway sizing and equipment selection',
      description: 'Select appropriate oropharyngeal airway size based on patient anatomy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Measure OPA from corner of mouth to angle of mandible (earlobe)',
        'Alternative sizing: from center of lips to angle of jaw',
        'Common adult sizes: 80mm (#4), 90mm (#5), 100mm (#6)',
        'Pediatric sizing: 40-70mm based on age and anatomy',
        'Inspect selected OPA for cracks, sharp edges, or defects',
        'Ensure OPA flange will sit properly outside lips when inserted',
        'Have multiple sizes available in case first choice doesn\'t fit properly',
        'Select backup airway management equipment in case OPA fails'
      ],
      safetyNotes: [
        'Incorrect sizing can push tongue posteriorly and worsen obstruction',
        'Too small: ineffective airway maintenance, can be aspirated',
        'Too large: can cause laryngospasm or airway trauma'
      ],
      equipmentNeeded: [
        'Oropharyngeal airways in multiple sizes',
        'Measuring tape or ruler',
        'Good lighting for accurate measurement',
        'Backup airway devices (NPA, bag-valve mask)'
      ]
    },
    {
      id: 'opa_3',
      stepNumber: 3,
      title: 'Patient positioning and preparation',
      description: 'Position patient optimally and prepare oral cavity for airway insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position patient supine with head in neutral or sniffing position',
        'Maintain cervical spine immobilization if trauma suspected',
        'Open patient\'s mouth using cross-finger technique or jaw-lift',
        'Clear any visible secretions, blood, or debris from oral cavity',
        'Ensure adequate visualization of tongue and oral structures',
        'Have assistant available to help maintain head position if needed',
        'Position suction equipment for immediate use if needed',
        'Prepare for potential patient movement or reflexive responses'
      ],
      safetyNotes: [
        'Use universal precautions and appropriate PPE',
        'Be gentle to avoid dental trauma or soft tissue injury',
        'Maintain spinal precautions in trauma patients'
      ],
      equipmentNeeded: [
        'Personal protective equipment (gloves, face shield)',
        'Cervical collar or manual stabilization if needed',
        'Tongue depressors or laryngoscope for visualization',
        'Suction equipment ready for immediate use'
      ]
    },
    {
      id: 'opa_4',
      stepNumber: 4,
      title: 'Airway insertion technique',
      description: 'Insert oropharyngeal airway using proper technique to avoid complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Insert OPA upside down (curved end pointing toward palate) initially',
        'Advance OPA until tip reaches junction of hard and soft palate',
        'Rotate OPA 180 degrees so curve follows natural tongue contour',
        'Continue advancing until flange rests against lips',
        'Ensure tip of OPA sits behind tongue base, not pushing it back',
        'Check that OPA follows natural curvature of tongue and palate',
        'Alternative technique: insert right-side up using tongue depressor',
        'Avoid excessive force that could cause dental or soft tissue trauma'
      ],
      safetyNotes: [
        'Stop immediately if patient gags, coughs, or shows signs of awakening',
        'Never force insertion - may cause airway trauma or obstruction',
        'Be prepared to remove quickly if patient becomes responsive'
      ],
      equipmentNeeded: [
        'Selected oropharyngeal airway',
        'Tongue depressor (if using alternative insertion technique)',
        'Good lighting for visualization',
        'Gentle technique and patience'
      ]
    },
    {
      id: 'opa_5',
      stepNumber: 5,
      title: 'Position verification and airway patency check',
      description: 'Confirm proper OPA placement and assess airway patency',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Verify OPA flange sits flush against lips without being too deep',
        'Check that tip of OPA sits behind tongue base in vallecular space',
        'Observe for improved chest rise and fall with ventilation',
        'Listen for improved air movement and decreased respiratory noise',
        'Assess oxygen saturation improvement if patient was hypoxic',
        'Ensure OPA does not push tongue posteriorly causing obstruction',
        'Check that patient can be effectively ventilated with bag-valve mask',
        'Confirm no signs of airway compromise or increased obstruction'
      ],
      safetyNotes: [
        'Remove immediately if OPA causes worsening of airway obstruction',
        'Monitor for signs of patient awakening that would require removal',
        'Be prepared for immediate alternative airway management'
      ],
      equipmentNeeded: [
        'Pulse oximetry for saturation monitoring',
        'Bag-valve mask for ventilation assessment',
        'Stethoscope for breath sound evaluation',
        'Flashlight for visual inspection of placement'
      ]
    },
    {
      id: 'opa_6',
      stepNumber: 6,
      title: 'Securing and monitoring airway function',
      description: 'Secure oropharyngeal airway and establish continuous monitoring protocol',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Secure OPA with tape or bite block if patient has potential for seizures',
        'Monitor patient level of consciousness continuously',
        'Assess respiratory rate, depth, and oxygen saturation regularly',
        'Watch for signs of patient awakening or return of gag reflex',
        'Suction oral cavity as needed to maintain airway patency',
        'Position patient to optimize airway maintenance (recovery position if stable)',
        'Monitor for complications: aspiration, dental trauma, soft tissue injury',
        'Document time of insertion and patient response'
      ],
      safetyNotes: [
        'Be prepared to remove OPA immediately if gag reflex returns',
        'Never leave conscious patient with OPA in place',
        'Monitor for signs of aspiration or airway compromise'
      ],
      equipmentNeeded: [
        'Medical tape or bite block for securing',
        'Continuous pulse oximetry and monitoring',
        'Suction equipment for ongoing airway maintenance',
        'Documentation materials'
      ]
    },
    {
      id: 'opa_7',
      stepNumber: 7,
      title: 'Ongoing assessment and maintenance',
      description: 'Perform regular assessment and maintain optimal airway function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Reassess airway patency and OPA position every 5-15 minutes',
        'Monitor for changes in patient consciousness level',
        'Check for OPA displacement or obstruction from secretions',
        'Assess need for suctioning or airway repositioning',
        'Monitor vital signs including oxygen saturation trends',
        'Watch for return of protective airway reflexes',
        'Evaluate need for transition to more advanced airway management',
        'Document any changes in patient condition or airway status'
      ],
      safetyNotes: [
        'Remove OPA immediately if patient shows any signs of awakening',
        'Be prepared for emergent airway management if OPA becomes ineffective',
        'Never delay more advanced airway management if clinically indicated'
      ],
      equipmentNeeded: [
        'Ongoing monitoring equipment',
        'Suction equipment for secretion management',
        'Backup airway management supplies',
        'Advanced airway equipment if needed for progression'
      ]
    },
    {
      id: 'opa_8',
      stepNumber: 8,
      title: 'Documentation and transition planning',
      description: 'Document airway management and plan for ongoing care or airway transition',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Document indication for OPA insertion and patient condition',
        'Record OPA size used and ease of insertion',
        'Note patient response to airway insertion and ongoing tolerance',
        'Document vital signs before and after OPA placement',
        'Record any complications or difficulties encountered',
        'Plan for airway transition: removal when conscious, or intubation if needed',
        'Communicate airway status to receiving healthcare team',
        'Provide clear instructions for ongoing airway monitoring and management'
      ],
      safetyNotes: [
        'Ensure complete documentation for continuity of care',
        'Alert receiving team to presence of OPA and plan for removal/transition',
        'Emphasize need for continuous monitoring until airway transition'
      ],
      equipmentNeeded: [
        'Medical record documentation system',
        'Communication devices for team coordination',
        'Transport monitoring equipment',
        'Plans for airway transition or advanced management'
      ]
    }
  ],

  // TRACTION SPLINT APPLICATION
  'traction-splint': [
    {
      id: 'traction_1',
      stepNumber: 1,
      title: 'Patient assessment and fracture evaluation',
      description: 'Assess patient for femur fracture and determine appropriateness for traction splinting',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess mechanism of injury suggesting femoral shaft fracture',
        'Look for classic signs: thigh pain, swelling, deformity, shortening',
        'Check distal pulses, sensation, and motor function before splinting',
        'Rule out hip fracture or dislocation which contraindicate traction',
        'Assess for open fractures requiring modified treatment approach',
        'Evaluate patient hemodynamic stability - femur fractures can cause significant blood loss',
        'Check for associated injuries that may take priority over splinting',
        'Document baseline neurovascular status and pain level (1-10 scale)'
      ],
      safetyNotes: [
        'Do not apply traction to suspected hip fractures or dislocations',
        'Avoid traction splints in open fractures with bone protruding',
        'Never delay treatment of life-threatening injuries for splinting'
      ],
      equipmentNeeded: [
        'Pulse oximetry and vital sign monitoring',
        'Distal pulse assessment tools (Doppler if needed)',
        'Pain assessment scales',
        'Neurological assessment tools',
        'Photography equipment for documentation if available'
      ]
    },
    {
      id: 'traction_2',
      stepNumber: 2,
      title: 'Equipment selection and preparation',
      description: 'Select appropriate traction splint and prepare all necessary equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Select appropriate splint type: Hare traction splint or Sager splint',
        'Check splint for proper function, missing parts, or damage',
        'Ensure all straps, buckles, and adjustment mechanisms work properly',
        'Prepare ankle hitch or strap system for foot attachment',
        'Set up traction mechanism and test weight/force settings',
        'Gather padding materials for bony prominences and pressure points',
        'Prepare pain medication if available and within scope of practice',
        'Have assistant available to help with splint application'
      ],
      safetyNotes: [
        'Never use damaged or incomplete traction splint equipment',
        'Ensure proper size splint for patient (adult vs pediatric)',
        'Test all mechanical components before patient application'
      ],
      equipmentNeeded: [
        'Hare traction splint or Sager splint with all components',
        'Ankle hitch with appropriate padding',
        'Soft padding materials (gauze, towels, foam)',
        'Straps or cravats for securing splint',
        'Pain medication if available and authorized',
        'Scissors for cutting clothing if needed'
      ]
    },
    {
      id: 'traction_3',
      stepNumber: 3,
      title: 'Patient preparation and positioning',
      description: 'Prepare patient and position for safe traction splint application',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Explain procedure to patient and provide reassurance about pain relief',
        'Administer pain medication if available and appropriate',
        'Remove clothing from injured leg to allow full visualization',
        'Position patient supine on firm surface for optimal splint placement',
        'Have one rescuer maintain gentle manual traction on injured leg',
        'Apply manual inline stabilization above and below fracture site',
        'Prepare ankle and foot for hitch application with padding',
        'Ensure good lighting and adequate working space around patient'
      ],
      safetyNotes: [
        'Maintain continuous manual traction until mechanical traction applied',
        'Use gentle traction - excessive force can worsen injury',
        'Monitor patient for signs of shock or deterioration'
      ],
      equipmentNeeded: [
        'Pain medication and administration supplies',
        'Scissors or trauma shears for clothing removal',
        'Manual traction techniques',
        'Adequate lighting and workspace',
        'Additional rescuers for assistance'
      ]
    },
    {
      id: 'traction_4',
      stepNumber: 4,
      title: 'Ankle hitch application and foot preparation',
      description: 'Apply ankle hitch securely while maintaining distal circulation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Apply ankle hitch around ankle and foot, avoiding malleoli pressure',
        'Ensure adequate padding under hitch to prevent pressure sores',
        'Check that hitch is snug but not tight enough to compromise circulation',
        'Verify distal pulses remain palpable after hitch application',
        'Position foot in neutral anatomical position (not plantar or dorsiflexed)',
        'Secure hitch straps to prevent slippage during traction application',
        'Double-check that hitch will not slip off foot during transport',
        'Document distal pulse status after hitch application'
      ],
      safetyNotes: [
        'Never apply hitch so tightly that it compromises circulation',
        'Avoid pressure directly over bony prominences (malleoli)',
        'Recheck distal pulses frequently during and after application'
      ],
      equipmentNeeded: [
        'Ankle hitch with adequate padding',
        'Soft padding materials for malleoli protection',
        'Pulse assessment capability',
        'Doppler ultrasound if pulses difficult to palpate'
      ]
    },
    {
      id: 'traction_5',
      stepNumber: 5,
      title: 'Splint positioning and initial setup',
      description: 'Position traction splint properly and prepare for traction application',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Position splint alongside uninjured leg to measure proper length',
        'Adjust splint length so it extends 6-8 inches beyond foot',
        'Place splint under injured leg with ischial pad against pelvis',
        'Ensure ischial pad sits properly against ischial tuberosity',
        'Align splint parallel to injured leg without disturbing fracture',
        'Apply padding to all bony prominences that contact splint',
        'Secure proximal end of splint with pelvic strap or belt',
        'Connect ankle hitch to distal traction mechanism'
      ],
      safetyNotes: [
        'Do not lift or move fractured leg excessively during splint positioning',
        'Ensure ischial pad placement does not compress perineum',
        'Maintain manual traction until mechanical traction is applied'
      ],
      equipmentNeeded: [
        'Properly sized traction splint',
        'Padding materials for pressure points',
        'Pelvic strap or securing device',
        'Assistant to maintain manual traction'
      ]
    },
    {
      id: 'traction_6',
      stepNumber: 6,
      title: 'Traction application and adjustment',
      description: 'Apply appropriate mechanical traction and secure splint system',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Begin applying gentle traction using splint mechanism',
        'Apply traction gradually until leg length appears restored',
        'Monitor patient pain level - should decrease significantly with proper traction',
        'Check that fracture fragments are aligned and deformity reduced',
        'Secure all straps and supports without over-tightening',
        'Apply additional padding around thigh and calf areas',
        'Ensure splint remains parallel to leg throughout application',
        'Double-check all connections and mechanical components'
      ],
      safetyNotes: [
        'Apply traction gradually - never use sudden or excessive force',
        'Stop if patient reports severe increase in pain',
        'Monitor for signs of over-traction or neurovascular compromise'
      ],
      equipmentNeeded: [
        'Functioning traction mechanism',
        'Additional padding materials',
        'Securing straps and buckles',
        'Pain assessment tools'
      ]
    },
    {
      id: 'traction_7',
      stepNumber: 7,
      title: 'Neurovascular assessment and monitoring',
      description: 'Assess neurovascular status and establish ongoing monitoring protocol',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Check distal pulses in dorsalis pedis and posterior tibial arteries',
        'Assess capillary refill time (should be <3 seconds)',
        'Test sensation in foot using light touch and pinprick',
        'Check motor function by asking patient to wiggle toes',
        'Compare findings to uninjured extremity and baseline assessment',
        'Document neurovascular status using standardized assessment scale',
        'Monitor pain level - should be significantly improved with traction',
        'Establish schedule for repeated neurovascular checks (every 15 minutes)'
      ],
      safetyNotes: [
        'Any loss of pulse or sensation requires immediate splint readjustment',
        'Notify receiving hospital immediately of neurovascular compromise',
        'Be prepared to release traction if circulation compromised'
      ],
      equipmentNeeded: [
        'Doppler ultrasound for pulse assessment',
        'Sensation testing materials (cotton, pin)',
        'Documentation forms for neurovascular assessment',
        'Timer for regular assessment intervals'
      ]
    },
    {
      id: 'traction_8',
      stepNumber: 8,
      title: 'Documentation and transport preparation',
      description: 'Document procedure thoroughly and prepare for safe patient transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Document baseline and post-splinting neurovascular assessments',
        'Record pain levels before and after traction application',
        'Note type of splint used and amount of traction applied',
        'Document any complications or difficulties during application',
        'Photograph splint placement if protocols allow',
        'Secure splint to prevent movement during transport',
        'Brief transport team on neurovascular monitoring requirements',
        'Provide detailed report to receiving trauma team'
      ],
      safetyNotes: [
        'Ensure splint remains secure during patient movement and transport',
        'Continue neurovascular monitoring throughout transport',
        'Have plan for splint removal if emergency complications arise'
      ],
      equipmentNeeded: [
        'Medical documentation forms',
        'Camera for splint documentation if available',
        'Transport securing devices',
        'Communication equipment for hospital notification',
        'Continued monitoring equipment for transport'
      ]
    }
  ],

  // BAG VALVE MASK WITH IN-LINE NEBULIZATION
  'bag-valve-mask-nebulizer': [
    {
      id: 'bvm_neb_1',
      stepNumber: 1,
      title: 'Patient assessment and indication evaluation',
      description: 'Assess patient respiratory status and determine need for combined ventilation and nebulized medication',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess patient for signs of bronchospasm or respiratory distress',
        'Listen for wheezing, prolonged expiration, or decreased air movement',
        'Evaluate patient consciousness level and ability to cooperate with treatment',
        'Check oxygen saturation and respiratory rate before intervention',
        'Assess for contraindications to positive pressure ventilation',
        'Determine appropriate nebulized medication based on patient condition',
        'Review patient allergies and previous responses to bronchodilators',
        'Consider patient positioning and spinal precautions if indicated'
      ],
      safetyNotes: [
        'Assess for pneumothorax risk before applying positive pressure',
        'Monitor for signs of respiratory depression during treatment',
        'Be prepared for potential allergic reactions to medications'
      ],
      equipmentNeeded: [
        'Pulse oximetry and continuous monitoring',
        'Stethoscope for breath sound assessment',
        'Blood pressure monitoring equipment',
        'Peak flow meter if patient can cooperate'
      ]
    },
    {
      id: 'bvm_neb_2',
      stepNumber: 2,
      title: 'Equipment preparation and medication setup',
      description: 'Prepare bag-valve mask with in-line nebulizer and medication for delivery',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Select appropriate bag-valve mask with reservoir bag',
        'Connect in-line nebulizer between bag-valve mask and patient connection',
        'Prepare prescribed nebulized medication (typically albuterol 2.5-5mg)',
        'Dilute medication with normal saline to total volume of 3-5mL',
        'Fill nebulizer chamber with medication solution using sterile technique',
        'Connect oxygen tubing to nebulizer with flow rate 6-8 L/min',
        'Test system for proper nebulization before patient application',
        'Have backup medications and equipment readily available'
      ],
      safetyNotes: [
        'Verify correct medication and dosage before administration',
        'Use sterile technique when preparing medications',
        'Ensure oxygen flow rate adequate for nebulization (6-8 L/min minimum)'
      ],
      equipmentNeeded: [
        'Bag-valve mask with reservoir bag',
        'In-line nebulizer chamber',
        'Prescribed nebulized medication (albuterol, ipratropium)',
        'Normal saline for dilution',
        'Oxygen source with flow control',
        'Sterile syringes for medication preparation'
      ]
    },
    {
      id: 'bvm_neb_3',
      stepNumber: 3,
      title: 'Patient positioning and mask application',
      description: 'Position patient optimally and apply bag-valve mask with proper seal',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position patient sitting upright or high Fowler\'s position if possible',
        'Maintain cervical spine precautions if trauma suspected',
        'Select appropriate mask size for optimal facial seal',
        'Apply mask using E-C clamp technique for secure seal',
        'Position mask to cover nose and mouth without compressing eyes',
        'Ensure no air leaks around mask edges during ventilation',
        'Explain procedure to conscious patients to reduce anxiety',
        'Monitor patient comfort and tolerance of mask application'
      ],
      safetyNotes: [
        'Avoid excessive pressure that could cause facial nerve damage',
        'Monitor for gastric distention with positive pressure ventilation',
        'Be prepared to suction if patient vomits'
      ],
      equipmentNeeded: [
        'Properly sized face masks',
        'Suction equipment ready for immediate use',
        'Patient positioning aids if needed',
        'Towel roll for neck support if indicated'
      ]
    },
    {
      id: 'bvm_neb_4',
      stepNumber: 4,
      title: 'Initial ventilation and nebulization start',
      description: 'Begin assisted ventilation while initiating nebulized medication delivery',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Begin gentle bag-valve mask ventilation at 10-12 breaths per minute',
        'Squeeze bag gradually to allow adequate inspiratory time',
        'Observe for visible medication mist during inspiration',
        'Monitor chest rise and fall with each ventilation',
        'Listen for improved air movement and decreased wheezing',
        'Adjust ventilation rate based on patient response and comfort',
        'Ensure continuous nebulization throughout treatment period',
        'Monitor oxygen saturation response to treatment'
      ],
      safetyNotes: [
        'Avoid over-ventilation which can worsen bronchospasm',
        'Watch for signs of pneumothorax or gastric distention',
        'Monitor for medication side effects (tachycardia, tremor)'
      ],
      equipmentNeeded: [
        'Functioning bag-valve mask system',
        'Continuous oxygen saturation monitoring',
        'Timer to track treatment duration',
        'Cardiac monitoring if available'
      ]
    },
    {
      id: 'bvm_neb_5',
      stepNumber: 5,
      title: 'Ongoing treatment monitoring and adjustment',
      description: 'Monitor patient response and adjust ventilation technique throughout nebulization',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Continue treatment for typical duration of 10-15 minutes',
        'Monitor for clinical improvement: decreased wheezing, improved air entry',
        'Assess oxygen saturation trends and respiratory effort',
        'Adjust ventilation pressure and rate based on patient tolerance',
        'Watch for medication side effects: increased heart rate, agitation',
        'Encourage patient to breathe deeply if conscious and cooperative',
        'Monitor nebulizer for continued mist production',
        'Be prepared to discontinue if patient deteriorates'
      ],
      safetyNotes: [
        'Stop immediately if patient develops severe side effects',
        'Monitor for paradoxical bronchospasm (rare but serious)',
        'Be alert for signs of medication overdose'
      ],
      equipmentNeeded: [
        'Continuous monitoring equipment',
        'Emergency medications for side effects',
        'Timer for treatment duration tracking',
        'Blood pressure monitoring capability'
      ]
    },
    {
      id: 'bvm_neb_6',
      stepNumber: 6,
      title: 'Treatment completion and response assessment',
      description: 'Complete nebulization treatment and assess patient response to therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Complete full nebulization treatment (medication chamber empty)',
        'Assess post-treatment breath sounds and air movement',
        'Monitor oxygen saturation improvement and respiratory rate',
        'Evaluate patient subjective improvement in breathing',
        'Check vital signs including heart rate and blood pressure',
        'Document peak flow improvement if measurable',
        'Assess need for additional doses or alternative treatments',
        'Prepare for transition to spontaneous breathing if appropriate'
      ],
      safetyNotes: [
        'Continue monitoring for delayed side effects',
        'Be prepared for repeat treatments if clinically indicated',
        'Watch for rebound bronchospasm after treatment completion'
      ],
      equipmentNeeded: [
        'Post-treatment assessment tools',
        'Peak flow meter for objective measurement',
        'Vital signs monitoring equipment',
        'Documentation materials for response assessment'
      ]
    },
    {
      id: 'bvm_neb_7',
      stepNumber: 7,
      title: 'Equipment cleaning and preparation for transport',
      description: 'Clean equipment properly and prepare patient for ongoing care or transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Disconnect and clean nebulizer chamber according to protocols',
        'Remove any remaining medication from system',
        'Clean and disinfect bag-valve mask and reusable components',
        'Prepare backup equipment for potential additional treatments',
        'Secure oxygen source and ensure adequate supply for transport',
        'Position patient for comfort and optimal breathing',
        'Plan for ongoing respiratory monitoring during transport',
        'Brief transport team on treatment provided and patient response'
      ],
      safetyNotes: [
        'Dispose of single-use components in appropriate containers',
        'Maintain infection control protocols during equipment handling',
        'Ensure equipment readiness for potential additional treatments'
      ],
      equipmentNeeded: [
        'Cleaning supplies and disinfectants',
        'Replacement nebulizer chambers and masks',
        'Transport oxygen supply',
        'Ongoing monitoring equipment'
      ]
    },
    {
      id: 'bvm_neb_8',
      stepNumber: 8,
      title: 'Documentation and ongoing care planning',
      description: 'Document treatment thoroughly and establish plan for ongoing respiratory care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Document pre-treatment respiratory status and vital signs',
        'Record medication used, dosage, and method of delivery',
        'Note treatment duration and patient tolerance',
        'Document post-treatment improvement in symptoms and vital signs',
        'Record any side effects or complications encountered',
        'Plan for additional treatments or alternative therapies as needed',
        'Communicate treatment details to receiving healthcare team',
        'Provide patient education about ongoing respiratory care needs'
      ],
      safetyNotes: [
        'Ensure accurate medication documentation for continuity of care',
        'Alert receiving team to any ongoing respiratory needs',
        'Document any allergic reactions or unusual responses'
      ],
      equipmentNeeded: [
        'Medical record documentation system',
        'Medication administration records',
        'Communication devices for team coordination',
        'Patient education materials if appropriate'
      ]
    }
  ],

  // PHONETIC ALPHABET COMMUNICATION
  'phonetic-alphabet': [
    {
      id: 'phonetic_1',
      stepNumber: 1,
      title: 'Communication assessment and preparation',
      description: 'Assess communication needs and prepare for clear radio transmission using phonetic alphabet',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess radio conditions and background noise levels',
        'Determine need for phonetic alphabet based on transmission clarity',
        'Identify critical information requiring precise spelling (names, addresses, medications)',
        'Check radio equipment function and battery levels',
        'Position radio microphone appropriately for clear transmission',
        'Ensure proper radio channel selection for intended recipient',
        'Review message content and identify words requiring phonetic spelling',
        'Consider alternative communication methods if radio fails'
      ],
      safetyNotes: [
        'Always use phonetic alphabet for critical information like drug names',
        'Confirm receipt of transmitted information',
        'Have backup communication methods available'
      ],
      equipmentNeeded: [
        'Functioning radio communication device',
        'Phonetic alphabet reference card',
        'Backup communication devices (cell phone, alternative radio)',
        'Message notepad for complex information'
      ]
    },
    {
      id: 'phonetic_2',
      stepNumber: 2,
      title: 'Standard phonetic alphabet mastery',
      description: 'Demonstrate proficiency with NATO phonetic alphabet for accurate communication',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Master NATO phonetic alphabet: A-Alpha, B-Bravo, C-Charlie, D-Delta',
        'Continue with E-Echo, F-Foxtrot, G-Golf, H-Hotel, I-India, J-Juliet',
        'Know K-Kilo, L-Lima, M-Mike, N-November, O-Oscar, P-Papa',
        'Remember Q-Quebec, R-Romeo, S-Sierra, T-Tango, U-Uniform, V-Victor',
        'Complete with W-Whiskey, X-X-ray, Y-Yankee, Z-Zulu',
        'Practice numeric pronunciations: 0-Zero, 1-One, 2-Two, 3-Three, etc.',
        'Use clear enunciation and appropriate speaking pace',
        'Maintain consistent volume and tone throughout transmission'
      ],
      safetyNotes: [
        'Never use unofficial phonetic words that may cause confusion',
        'Practice regularly to maintain proficiency under stress',
        'Slow down pronunciation in high-stress situations'
      ],
      equipmentNeeded: [
        'NATO phonetic alphabet reference chart',
        'Practice materials and scenarios',
        'Audio recording capability for self-assessment',
        'Training partners for practice sessions'
      ]
    },
    {
      id: 'phonetic_3',
      stepNumber: 3,
      title: 'Medical terminology and drug name spelling',
      description: 'Apply phonetic alphabet specifically for medical terms and medication names',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Spell medication names using phonetic alphabet: "MORPHINE - Mike Oscar Romeo Papa Hotel India November Echo"',
        'Practice common emergency drugs: epinephrine, atropine, lidocaine, dopamine',
        'Use phonetics for patient names with unusual spelling',
        'Apply to street names and addresses with unclear pronunciation',
        'Spell medical conditions requiring precise communication',
        'Use for hospital names and receiving facility identification',
        'Apply to equipment serial numbers and identification codes',
        'Practice spelling medical abbreviations when verbal clarity needed'
      ],
      safetyNotes: [
        'Double-check spelling of critical medications to prevent errors',
        'Always confirm receipt and understanding of spelled information',
        'Use phonetic alphabet for any medication with potential for confusion'
      ],
      equipmentNeeded: [
        'Common emergency medication reference list',
        'Medical terminology phonetic practice sheets',
        'Drug reference guides',
        'Communication scenarios for practice'
      ]
    },
    {
      id: 'phonetic_4',
      stepNumber: 4,
      title: 'Radio transmission protocols and procedures',
      description: 'Execute proper radio transmission procedures incorporating phonetic alphabet',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Begin transmission with proper call signs and identification',
        'Use "spell" indicator before using phonetic alphabet',
        'Maintain clear 2-3 second pauses between phonetic letters',
        'Speak directly into microphone at consistent distance (2-3 inches)',
        'Use proper radio etiquette: "over", "out", "copy", "repeat"',
        'Wait for acknowledgment before continuing with next information',
        'Repeat critical information using phonetics if requested',
        'End transmission clearly with confirmation request'
      ],
      safetyNotes: [
        'Never transmit sensitive patient information on unsecured channels',
        'Always wait for clear frequency before transmitting',
        'Avoid simultaneous transmission with other users'
      ],
      equipmentNeeded: [
        'Radio communication device with clear audio',
        'Standard operating procedures for radio protocols',
        'Call sign reference materials',
        'Communication log for documentation'
      ]
    },
    {
      id: 'phonetic_5',
      stepNumber: 5,
      title: 'High-stress communication scenarios',
      description: 'Maintain clear phonetic communication during high-stress emergency situations',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Practice phonetic alphabet use during simulated emergency scenarios',
        'Maintain clear speech patterns despite adrenaline and stress',
        'Use slower speech rate during critical information transmission',
        'Implement systematic approach to spelling critical information',
        'Maintain professionalism and clarity during chaotic situations',
        'Use phonetic confirmation for received critical information',
        'Practice with background noise and distractions',
        'Develop automatic responses for common emergency communications'
      ],
      safetyNotes: [
        'Never rush critical communications even in emergency situations',
        'Take deep breath before transmitting complex information',
        'Ask for repetition if transmission unclear rather than guessing'
      ],
      equipmentNeeded: [
        'High-stress scenario training materials',
        'Background noise generators for practice',
        'Emergency communication templates',
        'Stress management techniques reference'
      ]
    },
    {
      id: 'phonetic_6',
      stepNumber: 6,
      title: 'Multi-agency communication coordination',
      description: 'Coordinate communications with multiple agencies using standardized phonetic protocols',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Coordinate with fire, police, hospitals, and dispatch using consistent phonetics',
        'Adapt communication style for different agency protocols while maintaining standards',
        'Use phonetic alphabet for inter-agency resource identification',
        'Spell unit numbers, apparatus identifiers, and personnel names clearly',
        'Maintain consistent phonetic standards across all communication partners',
        'Coordinate patient information transfer using phonetic spelling for clarity',
        'Practice joint agency communication exercises regularly',
        'Document inter-agency communications using phonetic spelling when appropriate'
      ],
      safetyNotes: [
        'Verify receiving agency understands phonetic spelling being used',
        'Use standard NATO phonetics rather than agency-specific alternatives',
        'Confirm critical information through read-back procedures'
      ],
      equipmentNeeded: [
        'Multi-agency communication protocols manual',
        'Inter-agency contact directory',
        'Joint training scenarios and materials',
        'Communication coordination templates'
      ]
    },
    {
      id: 'phonetic_7',
      stepNumber: 7,
      title: 'Quality assurance and continuous improvement',
      description: 'Implement quality assurance measures and continuous improvement for phonetic communication skills',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Regularly review recorded communications for phonetic accuracy',
        'Participate in communication skills training and refresher courses',
        'Practice phonetic alphabet daily to maintain proficiency',
        'Seek feedback from receiving parties about communication clarity',
        'Update phonetic spelling techniques based on best practices',
        'Mentor new personnel in proper phonetic communication techniques',
        'Document communication errors and implement corrective measures',
        'Stay current with communication protocol updates and changes'
      ],
      safetyNotes: [
        'Regular practice prevents skill degradation under stress',
        'Always prioritize accuracy over speed in critical communications',
        'Learn from communication errors to prevent future occurrences'
      ],
      equipmentNeeded: [
        'Communication recording and review equipment',
        'Training materials and continuing education resources',
        'Feedback collection forms and evaluation tools',
        'Professional development tracking systems'
      ]
    },
    {
      id: 'phonetic_8',
      stepNumber: 8,
      title: 'Documentation and communication records',
      description: 'Document communications appropriately and maintain accurate records of phonetic transmissions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Document critical communications using standard phonetic spelling in records',
        'Maintain communication logs with timestamps and phonetic confirmations',
        'Record medication names and doses using phonetic spelling for accuracy',
        'Document patient names with phonetic spelling when unusual or unclear',
        'Keep records of inter-agency communications for quality assurance',
        'Note any communication difficulties or equipment malfunctions',
        'Provide accurate phonetic information for legal documentation',
        'Maintain confidentiality while ensuring accurate record-keeping'
      ],
      safetyNotes: [
        'Ensure documentation accuracy for legal and medical continuity',
        'Protect patient confidentiality in all communication records',
        'Verify spelling accuracy before finalizing documentation'
      ],
      equipmentNeeded: [
        'Communication log books and documentation forms',
        'Electronic documentation systems',
        'Phonetic spelling verification references',
        'Secure storage for communication records'
      ]
    }
  ],

  // VENOUS BLOOD SAMPLING
  'venous-blood-sampling': [
    {
      id: 'vbs_1',
      stepNumber: 1,
      title: 'Patient assessment and indication evaluation',
      description: 'Assess patient condition and determine need for venous blood sampling',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Review physician orders for specific blood tests required',
        'Assess patient clinical condition and sampling urgency',
        'Verify patient identity using two independent identifiers',
        'Check for patient allergies to antiseptics or latex',
        'Assess patient anxiety level and provide reassurance',
        'Review patient medical history for bleeding disorders',
        'Determine appropriate sampling site based on patient anatomy',
        'Consider patient positioning and comfort during procedure'
      ],
      safetyNotes: [
        'Always verify patient identity before any blood sampling',
        'Assess for bleeding disorders or anticoagulation therapy',
        'Use appropriate infection control precautions'
      ],
      equipmentNeeded: [
        'Patient identification verification materials',
        'Laboratory requisition forms',
        'Medical history assessment tools',
        'Comfortable seating or positioning equipment'
      ]
    },
    {
      id: 'vbs_2',
      stepNumber: 2,
      title: 'Equipment preparation and selection',
      description: 'Prepare appropriate blood sampling equipment and verify laboratory requirements',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Select appropriate needle gauge (21-23G) based on vein size',
        'Choose proper collection tubes based on laboratory tests ordered',
        'Prepare antiseptic solution (alcohol or chlorhexidine)',
        'Gather tourniquet, gauze, and adhesive bandages',
        'Label collection tubes with patient information',
        'Verify tube types match laboratory requirements',
        'Check expiration dates on all supplies',
        'Organize equipment for efficient procedure flow'
      ],
      safetyNotes: [
        'Never use expired blood collection tubes',
        'Ensure proper tube labeling to prevent specimen mix-ups',
        'Use appropriate needle safety devices'
      ],
      equipmentNeeded: [
        'Blood collection needles (21-23 gauge)',
        'Various blood collection tubes (red top, purple top, etc.)',
        'Tourniquet and antiseptic wipes',
        'Gauze pads and adhesive bandages',
        'Specimen labels and laboratory forms',
        'Needle safety devices and sharps container'
      ]
    },
    {
      id: 'vbs_3',
      stepNumber: 3,
      title: 'Site selection and preparation',
      description: 'Select optimal venipuncture site and prepare area for blood sampling',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Examine both arms for suitable venipuncture sites',
        'Prefer antecubital fossa veins (median cubital, cephalic, basilic)',
        'Avoid areas with scars, bruises, or previous injection sites',
        'Apply tourniquet 3-4 inches above intended puncture site',
        'Palpate vein to assess size, depth, and direction',
        'Clean puncture site with antiseptic in circular motion',
        'Allow antiseptic to air dry completely (30 seconds minimum)',
        'Do not touch cleaned area with non-sterile surfaces'
      ],
      safetyNotes: [
        'Avoid puncturing arteries or areas with poor circulation',
        'Never apply tourniquet for more than 1 minute initially',
        'Ensure complete antiseptic drying to prevent hemolysis'
      ],
      equipmentNeeded: [
        'Tourniquet (latex-free if patient allergic)',
        'Antiseptic wipes or prep pads',
        'Good lighting for vein visualization',
        'Sterile gloves'
      ]
    },
    {
      id: 'vbs_4',
      stepNumber: 4,
      title: 'Venipuncture technique and blood collection',
      description: 'Perform venipuncture using proper technique and collect required blood samples',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Insert needle at 15-30 degree angle with bevel up',
        'Advance needle smoothly until blood return observed',
        'Attach collection tube ensuring proper fill volume',
        'Fill tubes in correct order to prevent cross-contamination',
        'Gently invert tubes containing additives (5-10 times)',
        'Remove tourniquet before removing needle to prevent hematoma',
        'Withdraw needle smoothly and apply immediate pressure',
        'Activate needle safety device immediately after withdrawal'
      ],
      safetyNotes: [
        'Never probe or redirect needle excessively',
        'Remove tourniquet before needle withdrawal to prevent bleeding',
        'Apply pressure immediately to prevent hematoma formation'
      ],
      equipmentNeeded: [
        'Blood collection system (needle and tubes)',
        'Needle holder or vacuum system',
        'Multiple collection tubes as ordered',
        'Immediate pressure application materials'
      ]
    },
    {
      id: 'vbs_5',
      stepNumber: 5,
      title: 'Post-collection care and hemostasis',
      description: 'Provide appropriate post-puncture care and ensure adequate hemostasis',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Apply firm pressure to puncture site for 2-5 minutes',
        'Elevate arm if bleeding continues beyond normal time',
        'Check for adequate hemostasis before bandage application',
        'Apply adhesive bandage over puncture site',
        'Instruct patient to keep bandage on for 15 minutes minimum',
        'Advise patient to avoid heavy lifting with punctured arm',
        'Monitor patient for signs of vasovagal response',
        'Dispose of sharps in appropriate container immediately'
      ],
      safetyNotes: [
        'Monitor for excessive bleeding or hematoma formation',
        'Watch for signs of fainting or vasovagal reaction',
        'Never recap needles - use safety devices'
      ],
      equipmentNeeded: [
        'Gauze pads for pressure application',
        'Adhesive bandages',
        'Sharps disposal container',
        'Patient monitoring equipment'
      ]
    },
    {
      id: 'vbs_6',
      stepNumber: 6,
      title: 'Specimen processing and labeling verification',
      description: 'Process blood specimens appropriately and verify accurate labeling',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Verify all tubes are properly labeled with patient information',
        'Check that collection time and date are documented',
        'Ensure specimens are stored at appropriate temperature',
        'Mix tubes with additives gently but thoroughly',
        'Complete laboratory requisition forms accurately',
        'Verify tube types match ordered laboratory tests',
        'Package specimens for transport according to laboratory requirements',
        'Document collection details in patient medical record'
      ],
      safetyNotes: [
        'Double-check specimen labeling to prevent patient mix-ups',
        'Maintain proper storage conditions to preserve specimen integrity',
        'Follow laboratory protocols for specimen handling'
      ],
      equipmentNeeded: [
        'Specimen storage containers',
        'Laboratory requisition forms',
        'Temperature monitoring devices',
        'Transport packaging materials'
      ]
    },
    {
      id: 'vbs_7',
      stepNumber: 7,
      title: 'Patient monitoring and complication management',
      description: 'Monitor patient for complications and provide appropriate follow-up care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Monitor puncture site for bleeding, swelling, or hematoma formation',
        'Assess patient for signs of infection at puncture site',
        'Watch for delayed vasovagal reactions or fainting',
        'Provide patient education about post-procedure care',
        'Instruct when to remove bandage and resume normal activities',
        'Advise when to seek medical attention for complications',
        'Schedule follow-up for laboratory results if indicated',
        'Document any complications or patient concerns'
      ],
      safetyNotes: [
        'Be prepared to treat vasovagal reactions with positioning and fluids',
        'Monitor high-risk patients more closely for complications',
        'Provide clear instructions for post-procedure care'
      ],
      equipmentNeeded: [
        'Patient monitoring equipment',
        'Emergency supplies for vasovagal reactions',
        'Patient education materials',
        'Follow-up scheduling resources'
      ]
    },
    {
      id: 'vbs_8',
      stepNumber: 8,
      title: 'Documentation and laboratory coordination',
      description: 'Complete comprehensive documentation and coordinate with laboratory services',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Document procedure details including site, technique, and complications',
        'Record patient response and any adverse reactions',
        'Note specimen types collected and laboratory tests ordered',
        'Include collection time, date, and personnel performing procedure',
        'Communicate special handling requirements to laboratory',
        'Coordinate urgent or stat laboratory processing if required',
        'Ensure proper chain of custody for legal specimens if applicable',
        'Follow up on critical laboratory results as per protocol'
      ],
      safetyNotes: [
        'Maintain accurate records for legal and medical continuity',
        'Ensure timely communication of critical results',
        'Follow proper protocols for stat or urgent specimens'
      ],
      equipmentNeeded: [
        'Medical record documentation system',
        'Laboratory communication devices',
        'Chain of custody forms if required',
        'Critical result notification protocols'
      ]
    }
  ],

  // PULSE OXIMETRY MONITORING
  'pulse-oximetry-monitoring': [
    {
      id: 'pulse_ox_1',
      stepNumber: 1,
      title: 'Patient assessment and indication evaluation',
      description: 'Assess patient respiratory status and determine need for pulse oximetry monitoring',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess patient respiratory rate, depth, and effort',
        'Observe for signs of hypoxemia: cyanosis, confusion, restlessness',
        'Evaluate patient level of consciousness and mental status',
        'Check for conditions requiring continuous oxygen monitoring',
        'Assess skin temperature and circulation at potential sensor sites',
        'Review patient history for respiratory or cardiac conditions',
        'Determine baseline oxygen saturation requirements for patient',
        'Consider environmental factors affecting monitoring accuracy'
      ],
      safetyNotes: [
        'Pulse oximetry measures saturation, not oxygen content or ventilation',
        'Clinical assessment remains essential alongside monitoring data',
        'Be aware of factors that can cause false readings'
      ],
      equipmentNeeded: [
        'Clinical assessment tools',
        'Patient monitoring capabilities',
        'Environmental assessment for optimal monitoring',
        'Medical history review materials'
      ]
    },
    {
      id: 'pulse_ox_2',
      stepNumber: 2,
      title: 'Equipment selection and preparation',
      description: 'Select appropriate pulse oximetry equipment and prepare for patient monitoring',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Select pulse oximeter with appropriate accuracy specifications',
        'Choose correct sensor type: fingertip, earlobe, or forehead',
        'Verify equipment calibration and battery status',
        'Check sensor for damage, cleanliness, and proper function',
        'Set appropriate alarm limits based on patient condition',
        'Test equipment function before patient application',
        'Prepare alternative sensor sites in case primary site inadequate',
        'Ensure adequate lighting for display visualization'
      ],
      safetyNotes: [
        'Never rely solely on pulse oximetry for patient assessment',
        'Ensure equipment is properly calibrated and functioning',
        'Have backup monitoring available for critical patients'
      ],
      equipmentNeeded: [
        'Pulse oximeter with functioning display',
        'Appropriate sensors (fingertip, ear, forehead)',
        'Spare sensors and batteries',
        'Equipment testing materials',
        'Backup monitoring devices'
      ]
    },
    {
      id: 'pulse_ox_3',
      stepNumber: 3,
      title: 'Sensor placement and application',
      description: 'Apply pulse oximetry sensor using optimal technique for accurate readings',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Select sensor site with good circulation and minimal movement',
        'Clean sensor site of dirt, nail polish, or artificial nails',
        'Ensure proper sensor alignment with light source and detector',
        'Apply sensor snugly but not tight enough to impair circulation',
        'Position sensor to minimize motion artifact and ambient light',
        'Verify good waveform signal and stable readings',
        'Check that sensor placement does not impair patient circulation',
        'Secure sensor to prevent displacement during patient movement'
      ],
      safetyNotes: [
        'Avoid overtightening sensors which can impair circulation',
        'Remove nail polish or artificial nails that may interfere',
        'Check sensor site regularly for pressure sores in long-term monitoring'
      ],
      equipmentNeeded: [
        'Selected pulse oximetry sensor',
        'Nail polish remover if needed',
        'Securing tape or device',
        'Alternative sensor sites prepared'
      ]
    },
    {
      id: 'pulse_ox_4',
      stepNumber: 4,
      title: 'Initial reading verification and baseline establishment',
      description: 'Verify initial readings and establish baseline oxygen saturation values',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Allow adequate time for sensor stabilization (30-60 seconds)',
        'Verify reading corresponds with patient clinical appearance',
        'Establish baseline oxygen saturation for patient condition',
        'Document initial readings with time and sensor location',
        'Compare readings with arterial blood gas if available',
        'Assess pulse rate accuracy compared to manual pulse check',
        'Note waveform quality and signal strength indicators',
        'Correlate readings with patient symptoms and clinical status'
      ],
      safetyNotes: [
        'Never rely on single reading - observe trends over time',
        'Consider patient clinical condition alongside numerical values',
        'Be aware of factors that may cause inaccurate readings'
      ],
      equipmentNeeded: [
        'Documentation materials',
        'Timer for stabilization period',
        'Manual pulse assessment capability',
        'Blood gas correlation if available'
      ]
    },
    {
      id: 'pulse_ox_5',
      stepNumber: 5,
      title: 'Continuous monitoring and trend analysis',
      description: 'Establish continuous monitoring protocol and analyze oxygen saturation trends',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Set appropriate high and low alarm limits for patient condition',
        'Monitor trends rather than individual readings for clinical decisions',
        'Document oxygen saturation at regular intervals per protocol',
        'Assess response to interventions (oxygen therapy, positioning, medications)',
        'Monitor for sudden changes that may indicate clinical deterioration',
        'Correlate changes with patient activities, position changes, or interventions',
        'Watch for patterns suggesting equipment malfunction versus clinical change',
        'Maintain continuous observation of patient clinical status'
      ],
      safetyNotes: [
        'Respond to clinical deterioration, not just monitor alarms',
        'Investigate sudden changes in readings for clinical or technical causes',
        'Never delay treatment while waiting for monitor stabilization'
      ],
      equipmentNeeded: [
        'Continuous monitoring capability',
        'Documentation logs',
        'Alarm management system',
        'Intervention tracking materials'
      ]
    },
    {
      id: 'pulse_ox_6',
      stepNumber: 6,
      title: 'Troubleshooting and accuracy optimization',
      description: 'Identify and resolve factors affecting pulse oximetry accuracy and reliability',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Recognize factors causing inaccurate readings: motion, ambient light, low perfusion',
        'Address circulation issues: cold extremities, vasoconstriction, hypotension',
        'Manage environmental factors: bright lights, electrical interference',
        'Consider alternative sensor sites if primary site problematic',
        'Account for patient factors: anemia, carbon monoxide poisoning, methemoglobinemia',
        'Troubleshoot equipment issues: loose connections, low battery, sensor malfunction',
        'Implement measures to reduce motion artifact during monitoring',
        'Document troubleshooting measures and their effectiveness'
      ],
      safetyNotes: [
        'Be aware of conditions causing falsely normal readings (carbon monoxide)',
        'Consider clinical correlation when readings seem inconsistent',
        'Replace faulty equipment immediately rather than attempting repairs'
      ],
      equipmentNeeded: [
        'Alternative sensors and sites',
        'Warming devices for poor circulation',
        'Equipment troubleshooting guides',
        'Replacement monitoring equipment'
      ]
    },
    {
      id: 'pulse_ox_7',
      stepNumber: 7,
      title: 'Patient care integration and clinical correlation',
      description: 'Integrate pulse oximetry data with overall patient assessment and care planning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Use oxygen saturation data to guide oxygen therapy decisions',
        'Correlate readings with patient work of breathing and comfort',
        'Integrate monitoring data with other vital signs and assessment findings',
        'Adjust patient positioning or interventions based on saturation response',
        'Monitor effectiveness of respiratory treatments and interventions',
        'Consider pulse oximetry limitations in overall patient assessment',
        'Communicate significant changes to healthcare team promptly',
        'Use trends to anticipate patient needs and plan care'
      ],
      safetyNotes: [
        'Always assess patient clinically, not just monitor values',
        'Remember pulse oximetry does not measure ventilation or CO2 levels',
        'Consider patient comfort and quality of life alongside numerical targets'
      ],
      equipmentNeeded: [
        'Oxygen therapy equipment',
        'Patient positioning aids',
        'Communication devices for team coordination',
        'Comprehensive monitoring capabilities'
      ]
    },
    {
      id: 'pulse_ox_8',
      stepNumber: 8,
      title: 'Documentation and monitoring continuity',
      description: 'Document monitoring data comprehensively and ensure continuity of care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Document initial oxygen saturation and baseline values established',
        'Record monitoring trends and patient response to interventions',
        'Note any technical difficulties or equipment changes during monitoring',
        'Document correlation between oxygen saturation and clinical status',
        'Record alarm events and clinical responses to significant changes',
        'Communicate monitoring needs to receiving healthcare providers',
        'Ensure continuous monitoring during patient transfers if indicated',
        'Provide comprehensive report on monitoring trends and patient response'
      ],
      safetyNotes: [
        'Ensure accurate documentation for continuity of care',
        'Maintain monitoring during critical patient transfers',
        'Alert receiving team to any ongoing monitoring requirements'
      ],
      equipmentNeeded: [
        'Medical record documentation system',
        'Monitoring data recording capabilities',
        'Communication devices for handoff reports',
        'Portable monitoring for transfers if needed'
      ]
    }
  ],

  // OROGASTRIC AND NASOGASTRIC TUBE INSERTION
  'orogastric-nasogastric-insertion': [
    {
      id: 'ogng_1',
      stepNumber: 1,
      title: 'Patient assessment and route selection',
      description: 'Assess patient condition, review contraindications, and select appropriate insertion route (orogastric vs nasogastric)',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Check for contraindications to nasogastric route (skull fracture, severe facial trauma)',
        'Assess level of consciousness - consider orogastric route for unconscious patients',
        'Review patient history for nasal obstruction, bleeding disorders, or recent surgery',
        'Evaluate gag reflex and swallowing ability in conscious patients',
        'Consider patient cooperation level and ability to follow instructions',
        'Assess cervical spine stability if trauma is suspected',
        'Review indications for tube insertion and expected duration of placement',
        'Document baseline vital signs and neurological status'
      ],
      safetyNotes: [
        'Never attempt nasogastric insertion if base of skull fracture is suspected',
        'Use orogastric route in unconscious patients to avoid intracranial insertion',
        'Consider cervical spine precautions if trauma mechanism present'
      ],
      equipmentNeeded: [
        'Nasogastric or orogastric tube (appropriate size)',
        'Water-soluble lubricant',
        'Gloves and eye protection',
        'Suction equipment',
        'Stethoscope'
      ]
    },
    {
      id: 'ogng_2',
      stepNumber: 2,
      title: 'Equipment preparation and patient positioning',
      description: 'Gather and prepare all necessary equipment, position patient optimally, and ensure safety measures are in place',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Select appropriate tube size (adults: 14-18 French, children: 8-12 French)',
        'Test tube cuff inflation if using cuffed tube for gastric decompression',
        'Prepare water-soluble lubricant and apply to tube tip generously',
        'Position patient sitting upright or in semi-Fowler position if possible',
        'Hyperextend neck slightly for nasogastric approach or maintain neutral for oral',
        'Have suction equipment assembled and tested at bedside',
        'Prepare securing tape or commercial tube holder device',
        'Ensure adequate lighting and have assistant available if needed'
      ],
      safetyNotes: [
        'Never use petroleum-based lubricants due to aspiration risk',
        'Test suction equipment before procedure initiation',
        'Have backup airway management equipment immediately available'
      ],
      equipmentNeeded: [
        'Appropriate sized NG/OG tube',
        'Water-soluble lubricant',
        'Suction catheter and equipment',
        'Securing tape or holder',
        'Good lighting source'
      ]
    },
    {
      id: 'ogng_3',
      stepNumber: 3,
      title: 'Measurement and depth calculation',
      description: 'Accurately measure insertion depth using standardized anatomical landmarks and mark the tube appropriately',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Use NEX method: measure from Nose to Earlobe to Xiphoid process',
        'For orogastric route: measure from corner of mouth to earlobe to xiphoid',
        'Add 15-20cm to NEX measurement for post-pyloric placement if required',
        'Mark measured distance clearly on tube with indelible marker',
        'Document measured distance in patient record for reference',
        'Consider patient size and body habitus in measurement calculations',
        'Verify measurement accuracy with second provider if available',
        'Note any anatomical variations that might affect standard measurements'
      ],
      safetyNotes: [
        'Accurate measurement is critical to prevent gastric perforation',
        'Double-check measurements in pediatric patients due to size variations',
        'Consider shorter insertion depth in patients with hiatal hernia'
      ],
      equipmentNeeded: [
        'Measuring tape or ruler',
        'Indelible marker',
        'Patient measurement reference chart',
        'Documentation materials'
      ]
    },
    {
      id: 'ogng_4',
      stepNumber: 4,
      title: 'Initial tube insertion',
      description: 'Begin tube insertion using proper technique, maintaining patient comfort and monitoring for complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Insert tube gently through selected nostril or mouth with patient cooperation',
        'Angle tube posteriorly and downward following natural anatomy',
        'Advance tube slowly and steadily, pausing for patient comfort',
        'Encourage swallowing or sipping water in conscious cooperative patients',
        'Monitor for signs of respiratory distress or tube misplacement',
        'Feel for resistance indicating esophageal sphincter passage',
        'Watch for coiling in mouth or gagging indicating incorrect placement',
        'Advance to pre-measured depth marking while monitoring patient response'
      ],
      safetyNotes: [
        'Stop immediately if significant resistance is encountered',
        'Monitor continuously for signs of respiratory compromise',
        'Never force tube advancement against significant resistance',
        'Be prepared to remove tube immediately if respiratory distress occurs'
      ],
      equipmentNeeded: [
        'Lubricated tube',
        'Suction equipment',
        'Water for swallowing assistance',
        'Pulse oximetry for monitoring'
      ]
    },
    {
      id: 'ogng_5',
      stepNumber: 5,
      title: 'Placement verification using multiple methods',
      description: 'Confirm correct gastric placement using multiple verification techniques before securing tube',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Aspirate gastric contents and test pH (should be acidic, pH <5.5)',
        'Auscultate over epigastrium while injecting 20-30ml of air',
        'Look for characteristic gastric aspirate (greenish, cloudy appearance)',
        'Check for CO2 detection if using colorimetric device (should be negative)',
        'Observe tube markings to ensure appropriate insertion depth maintained',
        'Assess patient comfort and absence of respiratory symptoms',
        'Consider X-ray confirmation if any doubt about placement exists',
        'Document all verification methods used and results obtained'
      ],
      safetyNotes: [
        'Never rely on a single verification method alone',
        'Absence of respiratory distress does not guarantee correct placement',
        'X-ray confirmation is gold standard when placement is questionable',
        'Remove tube immediately if pulmonary placement is suspected'
      ],
      equipmentNeeded: [
        'pH testing strips or meter',
        'Syringe for aspiration and air injection',
        'Stethoscope for auscultation',
        'CO2 detector if available'
      ]
    },
    {
      id: 'ogng_6',
      stepNumber: 6,
      title: 'Tube securing and connection',
      description: 'Properly secure the tube to prevent dislodgement and connect to appropriate drainage or feeding system',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Secure tube to nose or mouth using appropriate tape or commercial device',
        'Avoid excessive tension that could cause pressure ulcers or dislodgement',
        'Loop tube to prevent kinking and maintain patency',
        'Connect to low intermittent suction (80-120 mmHg) if for decompression',
        'Connect to gravity drainage bag if continuous drainage needed',
        'Ensure all connections are secure and leak-free',
        'Mark tube at nostril/mouth level for monitoring displacement',
        'Position drainage system below patient level for proper function'
      ],
      safetyNotes: [
        'Avoid high continuous suction which can damage gastric mucosa',
        'Check that securing method does not compromise breathing or circulation',
        'Ensure drainage system maintains closed sterile circuit'
      ],
      equipmentNeeded: [
        'Medical tape or commercial securing device',
        'Suction equipment with pressure gauge',
        'Drainage collection system',
        'Irrigation supplies if needed'
      ]
    },
    {
      id: 'ogng_7',
      stepNumber: 7,
      title: 'Function testing and troubleshooting',
      description: 'Test tube patency and function, troubleshoot any issues, and ensure proper drainage or feeding capability',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Test tube patency by gentle irrigation with small amount of normal saline',
        'Verify suction function and appropriate drainage volume',
        'Check for proper tube positioning by re-measuring external markings',
        'Assess patient comfort and tolerance of tube placement',
        'Troubleshoot poor drainage by checking tube position and patency',
        'Verify connection integrity and absence of air leaks in system',
        'Document initial output volume and characteristics',
        'Establish baseline parameters for ongoing monitoring'
      ],
      safetyNotes: [
        'Use only small volumes of saline for irrigation to prevent overload',
        'Never use excessive force when irrigating to clear blockages',
        'Monitor for signs of tube migration or dislodgement'
      ],
      equipmentNeeded: [
        'Normal saline for irrigation',
        'Irrigation syringe',
        'Measuring container for output',
        'Pressure gauge for suction verification'
      ]
    },
    {
      id: 'ogng_8',
      stepNumber: 8,
      title: 'Patient monitoring and comprehensive documentation',
      description: 'Establish ongoing monitoring plan, provide patient education, and complete comprehensive documentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Monitor patient for signs of tube displacement or complications',
        'Assess gastric output volume and characteristics regularly',
        'Educate patient on tube care and signs of problems to report',
        'Document procedure details including tube size and insertion depth',
        'Record verification methods used and results obtained',
        'Note patient tolerance and any complications encountered',
        'Establish monitoring frequency for tube position and function',
        'Plan for tube removal when indication resolves or goals met'
      ],
      safetyNotes: [
        'Monitor for signs of aspiration, especially in unconscious patients',
        'Check tube position regularly to prevent silent migration',
        'Ensure patient and family understand care requirements and red flags'
      ],
      equipmentNeeded: [
        'Documentation materials',
        'Patient education resources',
        'Monitoring flow sheets',
        'Emergency contact information'
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
        'Identify need for rapid extraction vs on-scene stabilization',
        'Call for additional resources if complex extraction or multiple patients'
      ],
      contraindications: [
        'Unsafe scene requiring immediate evacuation',
        'Life-threatening bleeding requiring immediate hemorrhage control',
        'Airway compromise taking priority over fracture care'
      ],
      safetyNotes: [
        'High-energy mechanisms often involve multiple system injuries',
        'Never compromise scene safety to provide orthopedic care',
        'Maintain spine precautions until cleared'
      ],
      equipmentNeeded: [
        'Personal protective equipment',
        'Scene assessment tools',
        'Communication equipment for additional resources'
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
        'Consider crush injuries and associated complications',
        'Prioritize interventions - address life threats before fracture care'
      ],
      safetyNotes: [
        'Femur fractures can cause 1-2 liters of blood loss',
        'Pelvic fractures may cause massive internal bleeding',
        'Open fractures have high infection risk - early antibiotic consideration'
      ],
      equipmentNeeded: [
        'Vital signs monitoring equipment',
        'Bleeding control supplies',
        'Spinal immobilization equipment',
        'Oxygen delivery systems'
      ]
    },
    {
      id: 'fracture-step-3',
      stepNumber: 3,
      title: 'Detailed Musculoskeletal Assessment',
      description: 'Perform systematic evaluation of musculoskeletal injuries',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Expose and visually inspect all extremities for deformity, swelling, wounds',
        'Palpate bones systematically from proximal to distal',
        'Assess joint stability and range of motion where appropriate',
        'Check neurovascular status: pulses, capillary refill, sensation, motor function',
        'Look for signs of compartment syndrome: pain, pallor, paresthesias, pressure',
        'Document pre-treatment neurovascular status thoroughly',
        'Identify multiple fractures and prioritize treatment',
        'Consider associated injuries: dislocations, ligament tears, muscle injuries'
      ],
      safetyNotes: [
        'Never test range of motion with obvious fractures',
        'Document neurovascular status before and after splinting',
        'Compartment syndrome is a surgical emergency'
      ],
      equipmentNeeded: [
        'Penlight for neurological testing',
        'Documentation materials',
        'Doppler ultrasound if available for pulse assessment'
      ]
    },
    {
      id: 'fracture-step-4',
      stepNumber: 4,
      title: 'Pain Management and Patient Comfort',
      description: 'Provide appropriate analgesia and comfort measures',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess pain level using appropriate pain scale (0-10 or faces scale)',
        'Consider medication allergies and contraindications to analgesics',
        'Administer analgesics per protocol: morphine, fentanyl, or ketamine',
        'Use multimodal approach: medications, splinting, positioning, ice',
        'Monitor for side effects: respiratory depression, hypotension, nausea',
        'Consider regional blocks if trained and appropriate',
        'Reassess pain level after interventions and document effectiveness',
        'Provide emotional support and reassurance to reduce anxiety'
      ],
      contraindications: [
        'Hemodynamic instability contraindicating opioids',
        'Head injury with altered mental status',
        'Respiratory compromise or inadequate ventilation'
      ],
      safetyNotes: [
        'Monitor respiratory status closely with opioid administration',
        'Have naloxone readily available for reversal if needed',
        'Consider reduced doses in elderly or compromised patients'
      ],
      equipmentNeeded: [
        'Analgesic medications per protocol',
        'Naloxone for reversal if needed',
        'Continuous monitoring equipment',
        'Ice packs for non-pharmacological pain relief'
      ]
    },
    {
      id: 'fracture-step-5',
      stepNumber: 5,
      title: 'Wound Care and Open Fracture Management',
      description: 'Provide appropriate care for open fractures and associated wounds',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Identify open fractures by bone visibility or communication with wound',
        'Control hemorrhage using direct pressure and hemostatic agents',
        'Cover wounds with sterile saline-moistened dressings',
        'Do not attempt to reduce protruding bone fragments',
        'Photograph wound if possible for hospital documentation',
        'Consider antibiotic administration per protocol for open fractures',
        'Assess tetanus immunization status and document',
        'Prepare for rapid transport due to infection risk'
      ],
      safetyNotes: [
        'Never push protruding bones back into wounds',
        'Maintain sterile technique to prevent contamination',
        'Open fractures require surgery within 6 hours ideally'
      ],
      equipmentNeeded: [
        'Sterile dressings and saline',
        'Hemostatic agents',
        'Antibiotics if protocols allow',
        'Camera for documentation if available'
      ]
    },
    {
      id: 'fracture-step-6',
      stepNumber: 6,
      title: 'Fracture Reduction and Alignment',
      description: 'Perform appropriate reduction and alignment of fractures',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Consider need for reduction: severe deformity, compromised circulation',
        'Apply gentle longitudinal traction to restore length and alignment',
        'Use appropriate technique: manual traction, mechanical devices',
        'Monitor neurovascular status during reduction attempts',
        'Stop reduction if resistance encountered or patient deteriorates',
        'Accept reasonable alignment - perfect reduction not required',
        'Document pre- and post-reduction neurovascular status',
        'Consider femur traction splint for mid-shaft femur fractures'
      ],
      contraindications: [
        'Joint injuries near fracture site',
        'Vascular compromise that worsens with manipulation',
        'Patient instability requiring immediate transport'
      ],
      safetyNotes: [
        'Gentle traction only - never force reduction',
        'Stop immediately if neurovascular status worsens',
        'Some fractures should not be reduced in the field'
      ],
      equipmentNeeded: [
        'Traction splint for femur fractures',
        'Manual traction equipment',
        'Monitoring equipment for vital signs'
      ]
    },
    {
      id: 'fracture-step-7',
      stepNumber: 7,
      title: 'Splinting and Immobilization',
      description: 'Apply appropriate splints to immobilize fractures',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Select appropriate splint type: vacuum, SAM, rigid, or traction',
        'Splint joint above and joint below the fracture',
        'Pad bony prominences to prevent pressure sores',
        'Apply splint snugly but not so tight as to compromise circulation',
        'Secure splint with bandages, tape, or straps',
        'Recheck neurovascular status after splint application',
        'Ensure splint allows access for ongoing assessment',
        'Consider elevation to reduce swelling where appropriate'
      ],
      safetyNotes: [
        'Check neurovascular status before and after splinting',
        'Loosen splint if circulation compromised',
        'Pad all bony prominences to prevent skin breakdown'
      ],
      equipmentNeeded: [
        'Various splinting materials (vacuum, SAM, rigid)',
        'Padding materials and blankets',
        'Bandages and securing straps',
        'Elevation devices'
      ]
    },
    {
      id: 'fracture-step-8',
      stepNumber: 8,
      title: 'Transport Decision and Monitoring',
      description: 'Make appropriate transport decisions and provide ongoing monitoring',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Choose appropriate receiving facility based on injury severity',
        'Consider trauma center for multiple fractures or complications',
        'Determine transport mode: ground vs air based on distance and acuity',
        'Monitor neurovascular status every 15 minutes during transport',
        'Reassess pain levels and provide additional analgesia as needed',
        'Watch for complications: compartment syndrome, fat embolism',
        'Provide detailed report to receiving facility',
        'Document all interventions and patient responses'
      ],
      safetyNotes: [
        'Frequent neurovascular checks essential during transport',
        'Be prepared to loosen splints if circulation compromised',
        'Monitor for systemic complications of fractures'
      ],
      equipmentNeeded: [
        'Transport monitoring equipment',
        'Communication devices for hospital contact',
        'Additional analgesic medications',
        'Documentation materials'
      ]
    }
  ],

  'poisoning-overdose-management': [
    {
      id: 'poison-step-1',
      stepNumber: 1,
      title: 'Scene Safety Assessment and Hazard Identification',
      description: 'Ensure scene safety and identify potential toxic hazards before patient contact',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Approach scene cautiously and assess for ongoing toxic hazards',
        'Identify the toxic agent if possible: containers, labels, odors, witnesses',
        'Determine exposure route: ingestion, inhalation, dermal, or injection',
        'Check for multiple patients suggesting environmental contamination',
        'Assess need for personal protective equipment and decontamination',
        'Consider calling hazmat team for unknown or dangerous chemicals',
        'Establish safe perimeter and prevent bystander exposure',
        'Gather substance information: name, amount, time of exposure, intent'
      ],
      contraindications: [
        'Unsafe atmosphere requiring specialized equipment',
        'Unknown chemical hazards without proper protection',
        'Structural instability from chemical damage'
      ],
      safetyNotes: [
        'Never enter contaminated area without proper PPE',
        'Unknown chemicals require maximum precautions',
        'Provider safety takes absolute priority over patient care'
      ],
      equipmentNeeded: [
        'Personal protective equipment (suits, respirators)',
        'Gas detection equipment if available',
        'Communication equipment for hazmat consultation',
        'Binoculars for safe distant assessment'
      ]
    },
    {
      id: 'poison-step-2',
      stepNumber: 2,
      title: 'Primary Assessment and Stabilization',
      description: 'Perform primary assessment and address immediate life threats',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess airway patency and protect from aspiration if altered mental status',
        'Evaluate breathing adequacy - many toxins cause respiratory depression',
        'Check circulation and perfusion - monitor for shock and arrhythmias',
        'Assess disability/neurological status using AVPU or GCS',
        'Expose patient for full assessment while maintaining dignity',
        'Monitor vital signs continuously - many toxins affect cardiac function',
        'Establish IV access for medication and fluid administration',
        'Apply cardiac monitor and pulse oximetry for continuous monitoring'
      ],
      safetyNotes: [
        'Be prepared for sudden deterioration with toxic exposures',
        'Many antidotes require IV access for administration',
        'Continuous monitoring essential due to delayed effects'
      ],
      equipmentNeeded: [
        'Airway management equipment',
        'Cardiac monitor and defibrillator',
        'IV access supplies and fluids',
        'Pulse oximetry and capnography',
        'Bag-mask ventilation equipment'
      ]
    },
    {
      id: 'poison-step-3',
      stepNumber: 3,
      title: 'Detailed Toxicological History and Assessment',
      description: 'Obtain comprehensive history and perform focused toxicological assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Identify specific substance: exact name, concentration, formulation',
        'Determine amount consumed/exposed and time of exposure',
        'Assess route of exposure: oral, inhalation, dermal, IV, or multiple',
        'Evaluate intent: accidental, intentional overdose, or suicide attempt',
        'Obtain medical history: medications, allergies, previous overdoses',
        'Assess for co-ingestions or multiple substance exposure',
        'Look for physical evidence: pill bottles, containers, residue',
        'Interview family, friends, or witnesses for additional information'
      ],
      safetyNotes: [
        'Patients may not be reliable historians due to altered mental status',
        'Consider intentional misrepresentation in suicide attempts',
        'Co-ingestions are common and complicate management'
      ],
      equipmentNeeded: [
        'Documentation materials',
        'Evidence collection supplies if indicated',
        'Communication device for poison control consultation'
      ]
    },
    {
      id: 'poison-step-4',
      stepNumber: 4,
      title: 'Poison Control Center Consultation',
      description: 'Contact poison control center for expert guidance and treatment recommendations',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Call Poison Control Center (1-800-222-1222) for expert consultation',
        'Provide complete information: substance, amount, time, patient status',
        'Obtain specific treatment recommendations and antidote guidance',
        'Get advice on decontamination procedures and contraindications',
        'Clarify monitoring requirements and expected clinical course',
        'Ask about delayed effects and complications to watch for',
        'Obtain follow-up instructions and case identification number',
        'Document all recommendations and follow guidance precisely'
      ],
      safetyNotes: [
        'Poison Control provides 24/7 expert consultation',
        'Treatment recommendations are evidence-based and updated',
        'Follow poison control guidance precisely for best outcomes'
      ],
      equipmentNeeded: [
        'Communication device with clear signal',
        'Documentation materials for recording recommendations',
        'Patient information and substance details ready'
      ]
    },
    {
      id: 'poison-step-5',
      stepNumber: 5,
      title: 'Decontamination Procedures',
      description: 'Perform appropriate decontamination based on exposure route and substance',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Remove contaminated clothing and jewelry to prevent continued absorption',
        'Perform dermal decontamination with copious water irrigation',
        'Flush eyes with saline or water for 15-20 minutes if eye exposure',
        'Consider activated charcoal for appropriate oral ingestions within 1 hour',
        'Do not induce vomiting - contraindicated for most substances',
        'Avoid gastric lavage except in specific circumstances per poison control',
        'Use whole bowel irrigation only for specific substances and under guidance',
        'Contain and dispose of contaminated materials properly'
      ],
      contraindications: [
        'Activated charcoal contraindicated for caustics, alcohols, petroleum products',
        'Eye irrigation contraindicated for metallic sodium or similar reactive metals',
        'Gastric emptying contraindicated for caustic or petroleum substances'
      ],
      safetyNotes: [
        'Decontamination effectiveness decreases rapidly over time',
        'Never induce vomiting due to aspiration and re-exposure risk',
        'Proper waste disposal prevents environmental contamination'
      ],
      equipmentNeeded: [
        'Activated charcoal and water',
        'Large volumes of saline or water for irrigation',
        'Containment materials for contaminated waste',
        'Eye irrigation equipment'
      ]
    },
    {
      id: 'poison-step-6',
      stepNumber: 6,
      title: 'Antidote Administration and Specific Treatment',
      description: 'Administer appropriate antidotes and specific treatments per protocol',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Administer naloxone for suspected opioid overdose with respiratory depression',
        'Give flumazenil for benzodiazepine overdose if no seizure history',
        'Use atropine for organophosphate or carbamate poisoning',
        'Administer calcium for calcium channel blocker or fluoride exposure',
        'Provide oxygen therapy for carbon monoxide poisoning (100% high-flow)',
        'Give specific antidotes per poison control recommendations',
        'Monitor response to antidote administration carefully',
        'Be prepared for repeated doses or continuous infusions as needed'
      ],
      contraindications: [
        'Flumazenil contraindicated in chronic benzodiazepine users or seizure patients',
        'Naloxone may precipitate withdrawal in dependent users',
        'Some antidotes have specific contraindications - verify before giving'
      ],
      safetyNotes: [
        'Monitor for allergic reactions to antidotes',
        'Some antidotes may cause paradoxical worsening initially',
        'Have resuscitation equipment ready during antidote administration'
      ],
      equipmentNeeded: [
        'Naloxone (multiple vials)',
        'Flumazenil',
        'Atropine',
        'Calcium gluconate or chloride',
        'High-flow oxygen delivery system'
      ]
    },
    {
      id: 'poison-step-7',
      stepNumber: 7,
      title: 'Supportive Care and Complication Management',
      description: 'Provide comprehensive supportive care and monitor for complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Maintain airway patency and assist ventilation if needed',
        'Support circulation with IV fluids and vasopressors per protocol',
        'Monitor and treat seizures with benzodiazepines if they occur',
        'Manage hyperthermia or hypothermia based on specific toxin',
        'Treat cardiac arrhythmias per ACLS protocols with toxin considerations',
        'Provide glucose if hypoglycemic from toxin effects',
        'Manage agitation or psychiatric symptoms safely and appropriately',
        'Monitor urine output and renal function for nephrotoxic substances'
      ],
      safetyNotes: [
        'Supportive care often more important than specific antidotes',
        'Many toxic effects are delayed and require prolonged monitoring',
        'Psychiatric evaluation needed for intentional overdoses'
      ],
      equipmentNeeded: [
        'Advanced airway management supplies',
        'Cardiac monitoring and defibrillation',
        'Seizure management medications',
        'Temperature monitoring and management devices'
      ]
    },
    {
      id: 'poison-step-8',
      stepNumber: 8,
      title: 'Transport Decision and Crisis Intervention',
      description: 'Make appropriate transport decisions and provide crisis intervention support',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Choose appropriate receiving facility based on toxin and severity',
        'Consider poison center or specialty hospital for complex cases',
        'Provide crisis intervention for intentional overdose patients',
        'Assess suicide risk and implement appropriate safety measures',
        'Notify receiving facility of toxin, treatment given, and current status',
        'Continue monitoring and supportive care during transport',
        'Document all findings, treatments, and patient responses thoroughly',
        'Provide emotional support to family members and loved ones'
      ],
      safetyNotes: [
        'Patients with intentional overdoses are flight risks',
        'Some toxic effects may worsen during transport',
        'Maintain continuous monitoring during transport'
      ],
      equipmentNeeded: [
        'Transport monitoring equipment',
        'Restraint devices if suicide risk',
        'Communication equipment for receiving facility',
        'Crisis intervention resources and contacts'
      ]
    }
  ],

  'burns-thermal-injury-management': [
    {
      id: 'burns-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Hazard Elimination',
      description: 'Ensure scene safety and eliminate ongoing thermal hazards',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess scene for ongoing fire hazards, electrical risks, chemical exposures',
        'Ensure all ignition sources are eliminated before patient contact',
        'Check for structural integrity of buildings involved in fire',
        'Identify type of burn: thermal, chemical, electrical, or radiation',
        'Assess for hazardous materials requiring specialized decontamination',
        'Establish safe perimeter and coordinate with fire department',
        'Don appropriate PPE for specific hazard type identified',
        'Call for additional resources: burn team, hazmat, utility companies'
      ],
      contraindications: [
        'Active fire preventing safe patient access',
        'Electrical hazards with power still connected',
        'Structural collapse risk from fire damage'
      ],
      safetyNotes: [
        'Never enter unsafe environment to retrieve burn victims',
        'Electrical burns may have hidden internal injuries',
        'Chemical burns require specific decontamination procedures'
      ],
      equipmentNeeded: [
        'Personal protective equipment for specific hazards',
        'Fire suppression equipment if available',
        'Communication equipment for coordination',
        'Utility shut-off tools if trained'
      ]
    },
    {
      id: 'burns-step-2',
      stepNumber: 2,
      title: 'Stop the Burning Process',
      description: 'Immediately stop the burning process and remove patient from heat source',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Stop, drop, and roll if clothing is on fire - do not allow patient to run',
        'Smother flames with blankets or water - avoid synthetic materials',
        'Remove hot clothing and jewelry before swelling occurs',
        'Flush chemical burns with copious water for 20+ minutes',
        'For electrical burns, ensure power is disconnected before contact',
        'Cool thermal burns with room temperature water - avoid ice',
        'Remove patient from heat source to prevent continued injury',
        'Remove contact lenses if facial burns present to prevent corneal damage'
      ],
      safetyNotes: [
        'Do not use ice on burns - can cause further tissue damage',
        'Remove jewelry early before swelling makes removal impossible',
        'Synthetic clothing may melt and adhere to skin - cut around, do not pull'
      ],
      equipmentNeeded: [
        'Large volumes of room temperature water',
        'Blankets for smothering flames (wool or specially treated)',
        'Scissors for cutting away clothing',
        'Saline for eye irrigation if needed'
      ]
    },
    {
      id: 'burns-step-3',
      stepNumber: 3,
      title: 'Primary Assessment and Airway Management',
      description: 'Perform primary assessment with emphasis on airway complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Assess airway for signs of inhalation injury: singed nasal hairs, soot in sputum',
        'Look for facial burns, hoarse voice, or stridor indicating airway swelling',
        'Evaluate breathing adequacy and check for circumferential chest burns',
        'Assess circulation including pulse quality and capillary refill',
        'Check neurological status and spine precautions if mechanism suggests trauma',
        'Monitor for carbon monoxide poisoning: altered mental status, cherry-red skin',
        'Prepare for early intubation if airway burns or smoke inhalation suspected',
        'Apply high-flow oxygen and consider hyperbaric oxygen for CO poisoning'
      ],
      safetyNotes: [
        'Airway burns can cause rapid swelling and complete obstruction',
        'Early intubation is safer than emergency surgical airway later',
        'Carbon monoxide poisoning may not be obvious initially'
      ],
      equipmentNeeded: [
        'Advanced airway management equipment',
        'High-flow oxygen delivery systems',
        'Pulse oximetry and capnography',
        'Suction equipment for secretions'
      ]
    },
    {
      id: 'burns-step-4',
      stepNumber: 4,
      title: 'Burn Assessment and Classification',
      description: 'Systematically assess burn depth, extent, and severity',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Assess burn depth: superficial, partial thickness, or full thickness',
        'Calculate total body surface area using Rule of Nines or palm method',
        'Identify special areas: face, hands, feet, genitalia, joints, circumferential',
        'Document associated injuries: trauma, fractures, other medical conditions',
        'Assess for compartment syndrome in circumferential extremity burns',
        'Evaluate perfusion distal to circumferential burns',
        'Classify burn severity using American Burn Association criteria',
        'Identify need for burn center transfer based on classification'
      ],
      safetyNotes: [
        'Circumferential burns can cause compartment syndrome',
        'Burns involving >20% TBSA require aggressive fluid resuscitation',
        'Special area burns often require burn center care'
      ],
      equipmentNeeded: [
        'Rule of Nines assessment charts',
        'Documentation materials',
        'Measuring devices for burn area calculation',
        'Assessment tools for compartment syndrome'
      ]
    },
    {
      id: 'burns-step-5',
      stepNumber: 5,
      title: 'Cooling and Initial Wound Care',
      description: 'Provide appropriate cooling therapy and initial burn wound management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Cool burns with room temperature water for 10-20 minutes if <10% TBSA',
        'Avoid prolonged cooling for large burns to prevent hypothermia',
        'Gently clean burns with saline and remove loose, non-adherent debris',
        'Do not break intact blisters - they provide natural barrier',
        'Cover burns with clean, dry dressings or specialized burn sheets',
        'Use nonadherent dressings to prevent further tissue damage',
        'Wrap fingers and toes individually to prevent webbing',
        'Elevate burned extremities to reduce swelling when possible'
      ],
      contraindications: [
        'Ice application on burns',
        'Prolonged cooling for burns >10% TBSA',
        'Breaking intact blisters'
      ],
      safetyNotes: [
        'Monitor for hypothermia during cooling of large burns',
        'Sterile technique important to prevent infection',
        'Do not apply topical medications in prehospital setting'
      ],
      equipmentNeeded: [
        'Room temperature sterile water or saline',
        'Clean, dry burn dressings',
        'Nonadherent gauze and wrapping materials',
        'Burn sheets for large surface area coverage'
      ]
    },
    {
      id: 'burns-step-6',
      stepNumber: 6,
      title: 'Fluid Resuscitation and Vascular Access',
      description: 'Establish vascular access and initiate appropriate fluid resuscitation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Establish large-bore IV access (16-18 gauge) through unburned skin if possible',
        'Use intraosseous access if IV access through unburned skin unavailable',
        'Initiate fluid resuscitation using lactated Ringer\'s solution',
        'Calculate fluid requirements using Parkland formula for burns >20% TBSA',
        'Give half of calculated fluid in first 8 hours, half in next 16 hours',
        'Monitor urine output as guide to fluid resuscitation adequacy',
        'Avoid excessive fluid administration in burns <20% TBSA',
        'Consider central line placement by receiving facility for major burns'
      ],
      safetyNotes: [
        'IV through burned skin is acceptable if no other options available',
        'Over-resuscitation can cause pulmonary edema and complications',
        'Under-resuscitation leads to acute kidney injury and shock'
      ],
      equipmentNeeded: [
        'Large-bore IV catheters (16-18 gauge)',
        'Lactated Ringer\'s solution (multiple bags)',
        'IO access equipment if needed',
        'Fluid calculation charts or apps'
      ]
    },
    {
      id: 'burns-step-7',
      stepNumber: 7,
      title: 'Pain Management and Comfort Measures',
      description: 'Provide aggressive pain management and comfort measures for burn patients',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess pain level using appropriate pain scale - burns are extremely painful',
        'Administer analgesics early and aggressively per protocol',
        'Use morphine, fentanyl, or ketamine based on patient condition',
        'Consider continuous analgesic infusions for extensive burns',
        'Provide anxiolysis with benzodiazepines if appropriate',
        'Use positioning and immobilization for comfort',
        'Maintain normothermia - burn patients lose heat rapidly',
        'Provide emotional support - burns are psychologically traumatic'
      ],
      safetyNotes: [
        'Burn pain is severe and undertreated pain causes additional trauma',
        'Monitor respiratory status with opioid administration',
        'Hypothermia worsens burn shock and outcomes'
      ],
      equipmentNeeded: [
        'Analgesic medications (morphine, fentanyl, ketamine)',
        'Anxiolytic medications if appropriate',
        'Temperature monitoring equipment',
        'Warming blankets and devices'
      ]
    },
    {
      id: 'burns-step-8',
      stepNumber: 8,
      title: 'Transport Decision and Burn Center Coordination',
      description: 'Determine appropriate receiving facility and coordinate burn center transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Apply American Burn Association criteria to determine burn center need',
        'Contact burn center for consultation and transfer coordination',
        'Choose transport mode based on burn severity and distance',
        'Provide comprehensive report including mechanism, TBSA, depth, treatments',
        'Continue aggressive monitoring and supportive care during transport',
        'Monitor for complications: compartment syndrome, airway obstruction',
        'Reassess fluid resuscitation needs and pain management',
        'Document all assessments, treatments, and patient responses thoroughly'
      ],
      safetyNotes: [
        'Burns requiring burn center care should not go to general hospitals',
        'Transport complications can be life-threatening',
        'Continuous monitoring essential during transport'
      ],
      equipmentNeeded: [
        'Transport monitoring equipment',
        'Communication equipment for burn center contact',
        'Additional IV fluids and medications',
        'Burn center transfer criteria reference'
      ]
    }
  ],

  'chest-pain-acs-management': [
    {
      id: 'acs-step-1',
      stepNumber: 1,
      title: 'Rapid Primary Assessment and Symptom Evaluation',
      description: 'Perform immediate assessment of chest pain and potential cardiac emergency',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess airway, breathing, circulation immediately for life-threatening conditions',
        'Evaluate chest pain characteristics: location, quality, radiation, severity',
        'Identify associated symptoms: diaphoresis, nausea, dyspnea, syncope',
        'Check vital signs including blood pressure in both arms',
        'Assess for signs of cardiogenic shock or acute heart failure',
        'Obtain focused cardiac history and risk factors rapidly',
        'Consider atypical presentations especially in women, elderly, diabetics',
        'Rule out immediate life threats: tension pneumothorax, aortic dissection'
      ],
      safetyNotes: [
        'Atypical presentations are common in high-risk populations',
        'Chest pain may not be present in 30% of acute coronary syndromes',
        'Consider aortic dissection with tearing pain radiating to back'
      ],
      equipmentNeeded: [
        'Vital signs monitoring equipment',
        'Pulse oximetry and blood pressure monitors',
        'Stethoscope for cardiac and lung assessment',
        'Basic airway and breathing support equipment'
      ]
    },
    {
      id: 'acs-step-2',
      stepNumber: 2,
      title: '12-Lead ECG Acquisition and Interpretation',
      description: 'Obtain and interpret 12-lead ECG within 10 minutes of patient contact',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Obtain 12-lead ECG within 10 minutes of first medical contact',
        'Ensure proper electrode placement for accurate interpretation',
        'Look for ST-elevation myocardial infarction (STEMI) patterns',
        'Identify non-STEMI patterns: ST depression, T-wave inversions',
        'Check for new left bundle branch block equivalent to STEMI',
        'Compare with previous ECGs if available to identify acute changes',
        'Consider posterior leads (V7-V9) if posterior wall MI suspected',
        'Transmit ECG to receiving hospital immediately if STEMI identified'
      ],
      safetyNotes: [
        'Time is muscle - delays in ECG increase mortality',
        'New LBBB is considered STEMI equivalent',
        'Posterior MI may only show reciprocal changes in standard leads'
      ],
      equipmentNeeded: [
        '12-lead ECG machine with transmission capability',
        'ECG electrodes and prep materials',
        'Communication equipment for ECG transmission',
        'Previous ECGs for comparison if available'
      ]
    },
    {
      id: 'acs-step-3',
      stepNumber: 3,
      title: 'Cardiac Medication Administration',
      description: 'Administer appropriate cardiac medications per ACS protocols',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Administer aspirin 325mg chewed unless contraindicated',
        'Give nitroglycerin 0.4mg sublingual for chest pain if BP >90 systolic',
        'Repeat nitroglycerin every 5 minutes up to 3 doses if pain persists',
        'Consider morphine 2-4mg IV for severe pain unrelieved by nitroglycerin',
        'Administer oxygen only if SpO2 <90% or signs of respiratory distress',
        'Give clopidogrel or ticagrelor if available and indicated per protocol',
        'Consider metoprolol if indicated and no contraindications present',
        'Hold medications if hypotensive or signs of cardiogenic shock'
      ],
      contraindications: [
        'Aspirin: active GI bleeding, known allergy',
        'Nitroglycerin: hypotension, recent PDE5 inhibitor use',
        'Beta-blockers: bradycardia, heart block, active asthma'
      ],
      safetyNotes: [
        'Check blood pressure before each nitroglycerin dose',
        'Ask specifically about recent sildenafil/tadalafil use',
        'Monitor for hypotension with all cardiac medications'
      ],
      equipmentNeeded: [
        'Aspirin 325mg tablets',
        'Nitroglycerin 0.4mg sublingual tablets/spray',
        'Morphine for IV administration',
        'IV access supplies for medication administration'
      ]
    },
    {
      id: 'acs-step-4',
      stepNumber: 4,
      title: 'Advanced Cardiac Monitoring and Risk Stratification',
      description: 'Implement continuous monitoring and assess cardiac risk factors',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Apply continuous cardiac monitoring and watch for arrhythmias',
        'Monitor for complications: heart failure, cardiogenic shock, mechanical',
        'Assess cardiac risk using HEART score or similar validated tool',
        'Identify high-risk features: recurrent pain, hemodynamic instability',
        'Check for signs of acute heart failure: rales, JVD, peripheral edema',
        'Monitor for reperfusion arrhythmias if thrombolytics considered',
        'Assess for mechanical complications: papillary muscle rupture, VSD',
        'Document serial vital signs and symptom changes'
      ],
      safetyNotes: [
        'Ventricular arrhythmias common in first hours after MI',
        'Mechanical complications can cause sudden deterioration',
        'Heart failure may develop rapidly with large MI'
      ],
      equipmentNeeded: [
        'Continuous cardiac monitor/defibrillator',
        'Blood pressure monitoring equipment',
        'Pulse oximetry for continuous monitoring',
        'Emergency resuscitation equipment'
      ]
    },
    {
      id: 'acs-step-5',
      stepNumber: 5,
      title: 'STEMI Recognition and Cardiac Catheterization Lab Activation',
      description: 'Recognize STEMI and activate appropriate cardiac intervention pathways',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Identify STEMI criteria: ST elevation ≥1mm in 2+ contiguous leads',
        'Recognize STEMI equivalents: new LBBB, posterior MI, de Winters T-waves',
        'Activate cardiac catheterization lab immediately for STEMI patients',
        'Provide pre-hospital notification with ECG transmission',
        'Calculate time from symptom onset for reperfusion decisions',
        'Consider prehospital thrombolytics if PCI not available within 120 minutes',
        'Bypass non-PCI hospitals and transport directly to PCI center',
        'Document precise timing of symptom onset and ECG changes'
      ],
      safetyNotes: [
        'Time to reperfusion directly correlates with survival',
        'Prehospital STEMI identification reduces door-to-balloon time',
        'Every minute delay increases mortality risk'
      ],
      equipmentNeeded: [
        'ECG transmission capability',
        'Communication equipment for cath lab activation',
        'Time documentation materials',
        'Transport decision-making protocols'
      ]
    },
    {
      id: 'acs-step-6',
      stepNumber: 6,
      title: 'Arrhythmia Recognition and Management',
      description: 'Identify and treat life-threatening arrhythmias associated with ACS',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor for ventricular tachycardia and ventricular fibrillation',
        'Recognize and treat complete heart block with transcutaneous pacing',
        'Identify atrial fibrillation with rapid ventricular response',
        'Manage bradycardia with atropine or pacing as indicated',
        'Treat unstable tachycardia with synchronized cardioversion',
        'Administer antiarrhythmic medications per ACLS protocols',
        'Consider magnesium for polymorphic VT (torsades de pointes)',
        'Prepare for emergency pacing or defibrillation as needed'
      ],
      safetyNotes: [
        'VF/VT most common cause of sudden death in first hour after MI',
        'Heart block may require immediate pacing in inferior MI',
        'Avoid Class IC antiarrhythmics in setting of acute MI'
      ],
      equipmentNeeded: [
        'Monitor/defibrillator with pacing capability',
        'ACLS medications including lidocaine, amiodarone',
        'Transcutaneous pacing pads and equipment',
        'Synchronized cardioversion capability'
      ]
    },
    {
      id: 'acs-step-7',
      stepNumber: 7,
      title: 'Hemodynamic Support and Heart Failure Management',
      description: 'Provide hemodynamic support and manage acute heart failure complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Assess for cardiogenic shock: hypotension, altered mental status, oliguria',
        'Manage acute pulmonary edema with positioning, CPAP, diuretics',
        'Provide inotropic support with dopamine or norepinephrine if shocked',
        'Consider IABP (intra-aortic balloon pump) for refractory shock',
        'Balance preload reduction with maintenance of coronary perfusion pressure',
        'Monitor urine output as marker of end-organ perfusion',
        'Avoid aggressive fluid resuscitation in cardiogenic shock',
        'Prepare for emergent mechanical circulatory support if available'
      ],
      safetyNotes: [
        'Cardiogenic shock has high mortality requiring aggressive intervention',
        'Fluid administration can worsen pulmonary edema',
        'Maintain MAP >65 to ensure coronary perfusion'
      ],
      equipmentNeeded: [
        'Inotropic medications (dopamine, norepinephrine)',
        'CPAP equipment for pulmonary edema',
        'Large-bore IV access for medication administration',
        'Hemodynamic monitoring equipment'
      ]
    },
    {
      id: 'acs-step-8',
      stepNumber: 8,
      title: 'Transport Decision and Continuous Reassessment',
      description: 'Make appropriate transport decisions and provide continuous cardiac monitoring',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Choose appropriate receiving facility based on clinical findings and ECG',
        'Transport STEMI patients directly to PCI-capable centers',
        'Provide comprehensive report including ECG findings and medications given',
        'Continue serial 12-lead ECGs every 15-30 minutes for symptom changes',
        'Reassess pain level and hemodynamic status frequently',
        'Monitor for sudden deterioration or new complications',
        'Document response to treatments and any changes in condition',
        'Prepare receiving facility for immediate cardiac intervention if needed'
      ],
      safetyNotes: [
        'Clinical status can change rapidly during transport',
        'Serial ECGs may show evolution of MI or new ischemia',
        'Communication with receiving facility essential for optimal care'
      ],
      equipmentNeeded: [
        'Transport monitoring equipment',
        'Additional ECG capability for serial monitoring',
        'Communication equipment for receiving facility',
        'Complete documentation materials and cardiac medications'
      ]
    }
  ],

  '12-lead-ecg-placement': [
    {
      id: 'ecg-step-1',
      stepNumber: 1,
      title: 'Patient Preparation and Positioning',
      description: 'Prepare patient and environment for optimal ECG acquisition',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Explain procedure to patient and obtain verbal consent',
        'Position patient supine with head slightly elevated for comfort',
        'Ensure adequate lighting and privacy for electrode placement',
        'Remove jewelry, metal objects, and clothing from chest and limbs',
        'Expose chest while maintaining patient dignity with appropriate draping',
        'Ensure patient is comfortable and relaxed to minimize artifact',
        'Check for any skin conditions, burns, or wounds at electrode sites',
        'Turn off electronic devices that may cause electrical interference'
      ],
      safetyNotes: [
        'Patient comfort reduces muscle artifact and movement',
        'Maintain privacy and dignity throughout procedure',
        'Metal objects can cause electrical interference'
      ],
      equipmentNeeded: [
        'Patient gown or draping materials',
        'Pillow or support for patient comfort',
        'Privacy screens if needed'
      ]
    },
    {
      id: 'ecg-step-2',
      stepNumber: 2,
      title: 'Equipment Setup and Calibration',
      description: 'Set up and calibrate ECG machine for accurate recording',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Turn on ECG machine and allow appropriate warm-up time',
        'Check that all lead cables are properly connected to machine',
        'Verify standard calibration settings: 25mm/sec speed, 10mm/mV gain',
        'Run calibration signal to ensure proper machine function',
        'Check that ECG paper is loaded correctly or digital storage ready',
        'Ensure all lead cables are untangled and properly identified',
        'Verify machine date and time settings for accurate documentation',
        'Test lead integrity by checking for proper cable function'
      ],
      safetyNotes: [
        'Proper calibration essential for accurate interpretation',
        'Faulty cables can produce misleading results',
        'Standard settings ensure consistency across providers'
      ],
      equipmentNeeded: [
        '12-lead ECG machine',
        'ECG paper or digital storage',
        'Complete set of lead cables with color coding',
        'Calibration reference materials'
      ]
    },
    {
      id: 'ecg-step-3',
      stepNumber: 3,
      title: 'Skin Preparation for Electrode Placement',
      description: 'Prepare skin surfaces for optimal electrode contact and signal quality',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Clean electrode sites with alcohol wipes to remove oils and debris',
        'Allow alcohol to dry completely before electrode application',
        'Clip or shave excessive hair at electrode sites if necessary',
        'Gently abrade skin with gauze to remove dead skin cells',
        'Avoid using excessive pressure that could irritate or damage skin',
        'Pay special attention to areas with heavy hair or oily skin',
        'Ensure all 10 electrode sites are properly prepared',
        'Check for skin conditions that might affect electrode adherence'
      ],
      safetyNotes: [
        'Proper skin preparation reduces artifact and improves signal quality',
        'Never use harsh abrasives that could damage skin',
        'Hair removal improves electrode contact and reduces discomfort'
      ],
      equipmentNeeded: [
        'Alcohol wipes or prep pads',
        'Gauze pads for gentle abrasion',
        'Hair clippers or safety razor if needed',
        'Disposable towels for cleanup'
      ]
    },
    {
      id: 'ecg-step-4',
      stepNumber: 4,
      title: 'Limb Lead Electrode Placement',
      description: 'Apply limb electrodes in standardized anatomical positions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Place RA (white) electrode on right arm between shoulder and elbow',
        'Place LA (black) electrode on left arm between shoulder and elbow',
        'Place RL (green) electrode on right leg between hip and ankle',
        'Place LL (red) electrode on left leg between hip and ankle',
        'Avoid placing electrodes over bony prominences or major muscles',
        'Ensure electrodes are placed on fleshy areas for good contact',
        'Check that all limb electrodes are firmly adhered to skin',
        'Verify proper color coding matches standard limb lead placement'
      ],
      safetyNotes: [
        'Limb leads can be placed on torso if limb unavailable',
        'Consistent placement ensures reproducible results',
        'Avoid joints and bony areas to reduce artifact'
      ],
      equipmentNeeded: [
        '4 limb electrodes (RA-white, LA-black, RL-green, LL-red)',
        'Corresponding limb lead cables',
        'Anatomical reference guide for placement'
      ]
    },
    {
      id: 'ecg-step-5',
      stepNumber: 5,
      title: 'Precordial Lead Electrode Placement',
      description: 'Apply chest electrodes in precise anatomical positions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'V1 (red): 4th intercostal space, right sternal border',
        'V2 (yellow): 4th intercostal space, left sternal border',
        'V3 (green): midway between V2 and V4 positions',
        'V4 (brown): 5th intercostal space, left midclavicular line',
        'V5 (black): same horizontal level as V4, anterior axillary line',
        'V6 (purple): same horizontal level as V4 and V5, midaxillary line',
        'Palpate intercostal spaces carefully using proper technique',
        'Ensure all chest electrodes are at same horizontal level for V4-V6'
      ],
      safetyNotes: [
        'Accurate chest lead placement critical for MI diagnosis',
        'V1-V2 misplacement can mask anterior wall changes',
        'Female patients may require breast displacement for accurate V4-V6'
      ],
      equipmentNeeded: [
        '6 precordial electrodes (V1-V6 with color coding)',
        'Corresponding chest lead cables',
        'Anatomical landmark reference guide'
      ]
    },
    {
      id: 'ecg-step-6',
      stepNumber: 6,
      title: 'Lead Cable Connection and System Check',
      description: 'Connect all lead cables and verify proper system function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Connect each lead cable to corresponding electrode carefully',
        'Verify color coding matches between cables and electrodes',
        'Check that all connections are secure and making good contact',
        'Ensure lead cables are not tangled or under tension',
        'Position cables to prevent patient discomfort or movement artifact',
        'Check machine display for proper lead identification',
        'Verify no "lead off" or connection error messages displayed',
        'Test signal quality by observing initial rhythm strips'
      ],
      safetyNotes: [
        'Loose connections can cause artifact or missing leads',
        'Cable tension can pull electrodes off or cause discomfort',
        'Proper cable management prevents troubleshooting delays'
      ],
      equipmentNeeded: [
        'All 10 lead cables with proper connections',
        'Cable management supplies if needed'
      ]
    },
    {
      id: 'ecg-step-7',
      stepNumber: 7,
      title: 'ECG Acquisition and Quality Assessment',
      description: 'Acquire 12-lead ECG and assess tracing quality',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Instruct patient to remain still and breathe normally during recording',
        'Initiate 12-lead ECG acquisition using standard protocol',
        'Monitor for artifact: muscle tremor, electrical interference, movement',
        'Assess baseline stability and QRS clarity across all leads',
        'Check for proper calibration signal and standard intervals',
        'Verify all 12 leads are recording with adequate amplitude',
        'Repeat acquisition if significant artifact or technical problems',
        'Save or print ECG with proper patient identification and time stamps'
      ],
      safetyNotes: [
        'Patient movement during acquisition can render ECG uninterpretable',
        'Poor quality tracings can lead to misdiagnosis',
        'Multiple acquisitions may be needed for optimal quality'
      ],
      equipmentNeeded: [
        'ECG paper for printing or digital storage',
        'Patient identification labels or input capability'
      ]
    },
    {
      id: 'ecg-step-8',
      stepNumber: 8,
      title: 'Documentation and Equipment Cleanup',
      description: 'Complete documentation and properly clean equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Label ECG with patient name, date, time, and clinical indication',
        'Document any technical difficulties or patient factors affecting quality',
        'Remove electrodes gently to minimize skin irritation',
        'Clean electrode sites with alcohol if adhesive residue remains',
        'Dispose of used electrodes in appropriate waste containers',
        'Clean and store ECG machine and cables according to protocol',
        'Document procedure completion in patient medical record',
        'Provide appropriate follow-up instructions or referrals as needed'
      ],
      safetyNotes: [
        'Proper documentation essential for continuity of care',
        'Electrode removal technique prevents skin trauma',
        'Equipment cleanliness prevents cross-contamination'
      ],
      equipmentNeeded: [
        'Documentation materials and labels',
        'Alcohol wipes for cleanup',
        'Appropriate disposal containers',
        'Equipment storage and cleaning supplies'
      ]
    }
  ],

  'cpap-ventilation': [
    {
      id: 'cpap-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and CPAP Candidacy Evaluation',
      description: 'Assess patient for CPAP indications and rule out contraindications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Evaluate mental status - patient must be alert and cooperative (GCS ≥13)',
        'Assess respiratory distress: work of breathing, accessory muscle use',
        'Check vital signs: respiratory rate, oxygen saturation, blood pressure',
        'Identify underlying cause: CHF, COPD, pneumonia, asthma exacerbation',
        'Confirm patient can protect their airway and follow commands',
        'Rule out active vomiting or high aspiration risk',
        'Check for facial trauma or deformities preventing mask seal',
        'Ensure no untreated pneumothorax before CPAP application'
      ],
      contraindications: [
        'Altered mental status (GCS <13)',
        'Active vomiting or high aspiration risk',
        'Untreated pneumothorax',
        'Severe hypotension (SBP <90mmHg)',
        'Facial trauma preventing mask seal'
      ],
      safetyNotes: [
        'CPAP in obtunded patients can cause aspiration',
        'Pneumothorax can be converted to tension pneumothorax',
        'Monitor blood pressure closely - CPAP can reduce preload'
      ],
      equipmentNeeded: [
        'Vital signs monitoring equipment',
        'Pulse oximetry and capnography',
        'Stethoscope for lung assessment',
        'Glasgow Coma Scale reference'
      ]
    },
    {
      id: 'cpap-step-2',
      stepNumber: 2,
      title: 'Equipment Setup and Testing',
      description: 'Assemble and test CPAP equipment for proper function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Connect CPAP generator to oxygen source at 10-15 L/min flow rate',
        'Attach breathing circuit with reservoir bag and PEEP valve',
        'Test system for proper pressure generation and flow',
        'Select appropriate mask size based on patient facial anatomy',
        'Check mask for cracks, proper seal, and functioning one-way valve',
        'Adjust head strap to proper length before application',
        'Set initial CPAP pressure to 5-7.5 cmH2O for most patients',
        'Verify backup bag-valve-mask equipment is immediately available'
      ],
      safetyNotes: [
        'Improper equipment setup can cause inadequate ventilation',
        'Always have backup ventilation ready in case CPAP fails',
        'Test equipment before patient application to avoid delays'
      ],
      equipmentNeeded: [
        'CPAP generator unit with pressure capability',
        'Breathing circuit with reservoir bag and PEEP valve',
        'Face masks in multiple sizes',
        'Oxygen source with high-flow capability',
        'Manometer for pressure monitoring'
      ]
    },
    {
      id: 'cpap-step-3',
      stepNumber: 3,
      title: 'Mask Application and Initial Pressure Setting',
      description: 'Apply CPAP mask with proper technique and initial pressure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Explain procedure to patient and obtain cooperation',
        'Position patient in high Fowler\'s or semi-Fowler\'s position',
        'Hold mask gently against face initially to allow patient adaptation',
        'Gradually tighten head straps to achieve adequate seal without excessive pressure',
        'Start with lower pressure (5 cmH2O) and titrate up gradually',
        'Monitor for immediate patient comfort and tolerance',
        'Check for air leaks around mask and adjust as needed',
        'Ensure patient can still communicate and swallow if needed'
      ],
      safetyNotes: [
        'Excessive strap tightness can cause skin breakdown',
        'Rapid pressure changes can cause patient intolerance',
        'Monitor for gastric distension from swallowed air'
      ],
      equipmentNeeded: [
        'Properly sized CPAP mask',
        'Adjustable head straps',
        'Pressure monitoring equipment',
        'Patient positioning supplies'
      ]
    },
    {
      id: 'cpap-step-4',
      stepNumber: 4,
      title: 'Pressure Titration and Optimization',
      description: 'Adjust CPAP pressure based on patient response and clinical improvement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Titrate pressure gradually in 2.5 cmH2O increments up to 10-12.5 cmH2O',
        'Monitor oxygen saturation and adjust FiO2 to maintain SpO2 >90%',
        'Assess work of breathing and accessory muscle use improvement',
        'Monitor vital signs: heart rate, blood pressure, respiratory rate',
        'Listen for improved air entry and decreased adventitious sounds',
        'Check arterial blood gas if available to assess CO2 retention',
        'Adjust pressure based on patient comfort and clinical response',
        'Document optimal pressure settings and patient response'
      ],
      safetyNotes: [
        'Higher pressures increase risk of pneumothorax',
        'Monitor blood pressure - CPAP can cause hypotension',
        'Watch for signs of gastric distension and vomiting'
      ],
      equipmentNeeded: [
        'Manometer for accurate pressure measurement',
        'Pulse oximetry for continuous monitoring',
        'Blood pressure monitoring equipment',
        'Documentation materials'
      ]
    },
    {
      id: 'cpap-step-5',
      stepNumber: 5,
      title: 'Patient Monitoring and Response Assessment',
      description: 'Continuously monitor patient response and adjust therapy as needed',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor respiratory rate and work of breathing every 5-10 minutes',
        'Assess oxygen saturation continuously and document trends',
        'Check mental status and ability to follow commands regularly',
        'Monitor for signs of improvement: decreased dyspnea, better color',
        'Watch for complications: pneumothorax, hypotension, vomiting',
        'Assess mask fit and skin integrity around mask contact points',
        'Monitor for gastric distension and consider decompression if severe',
        'Evaluate need for intubation if no improvement or deterioration'
      ],
      safetyNotes: [
        'Clinical deterioration may require immediate intubation',
        'Mask pressure points can cause skin necrosis if prolonged',
        'Be prepared to remove CPAP immediately if patient vomits'
      ],
      equipmentNeeded: [
        'Continuous monitoring equipment',
        'Suction equipment for airway management',
        'Intubation equipment readily available',
        'Skin protection materials if needed'
      ]
    },
    {
      id: 'cpap-step-6',
      stepNumber: 6,
      title: 'Complication Recognition and Management',
      description: 'Identify and manage complications associated with CPAP therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Monitor for pneumothorax: sudden deterioration, chest pain, decreased breath sounds',
        'Watch for hemodynamic compromise: hypotension, decreased perfusion',
        'Assess for gastric distension and risk of aspiration',
        'Check for mask-related complications: pressure sores, eye irritation',
        'Monitor for patient intolerance: anxiety, claustrophobia, agitation',
        'Be prepared for emergency CPAP discontinuation and alternative ventilation',
        'Recognize signs of respiratory fatigue requiring intubation',
        'Monitor for cardiac complications in CHF patients'
      ],
      safetyNotes: [
        'Remove CPAP immediately if patient vomits or becomes obtunded',
        'Have emergency airway equipment immediately available',
        'Monitor closely for tension pneumothorax development'
      ],
      equipmentNeeded: [
        'Emergency airway management equipment',
        'Bag-valve-mask for backup ventilation',
        'Suction equipment',
        'Needle thoracentesis equipment if pneumothorax suspected'
      ]
    },
    {
      id: 'cpap-step-7',
      stepNumber: 7,
      title: 'Transport Preparation and Continued Support',
      description: 'Prepare patient for transport while maintaining CPAP support',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Ensure CPAP equipment is properly secured for transport',
        'Verify adequate oxygen supply for transport duration plus reserves',
        'Check that all connections are secure and leak-free',
        'Position patient safely for transport while maintaining mask seal',
        'Have backup ventilation immediately available during transport',
        'Continue pressure and oxygen titration based on patient response',
        'Maintain communication with patient throughout transport',
        'Prepare receiving facility for CPAP continuation or discontinuation'
      ],
      safetyNotes: [
        'Transport vibration can cause mask displacement',
        'Ensure adequate oxygen supply - calculate consumption carefully',
        'Be prepared for emergency CPAP discontinuation during transport'
      ],
      equipmentNeeded: [
        'Portable oxygen supply with adequate reserves',
        'Transport-compatible CPAP equipment',
        'Backup bag-valve-mask equipment',
        'Equipment securing devices for transport'
      ]
    },
    {
      id: 'cpap-step-8',
      stepNumber: 8,
      title: 'Documentation and Handoff',
      description: 'Complete thorough documentation and provide detailed handoff',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Document initial assessment findings and CPAP indications',
        'Record initial and optimal CPAP pressures and FiO2 settings',
        'Document patient response to therapy and vital sign trends',
        'Record any complications or adverse events during treatment',
        'Note duration of CPAP therapy and transport considerations',
        'Provide detailed report to receiving medical team',
        'Include recommendations for continued therapy or weaning',
        'Document equipment used and patient tolerance throughout care'
      ],
      safetyNotes: [
        'Thorough documentation essential for continuity of care',
        'Include specific pressure settings for receiving facility',
        'Document any complications for ongoing monitoring'
      ],
      equipmentNeeded: [
        'Documentation materials and flowsheets',
        'CPAP therapy record forms',
        'Communication equipment for receiving facility'
      ]
    }
  ],

  'needle-thoracentesis': [
    {
      id: 'thoracentesis-step-1',
      stepNumber: 1,
      title: 'Rapid Assessment and Tension Pneumothorax Recognition',
      description: 'Rapidly identify clinical signs of tension pneumothorax requiring immediate intervention',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess for classic triad: absent breath sounds, tracheal deviation, JVD',
        'Check for respiratory distress with asymmetric chest expansion',
        'Evaluate hemodynamic status: hypotension, tachycardia, weak pulses',
        'Look for cyanosis and signs of impending cardiovascular collapse',
        'Identify mechanism of injury suggesting pneumothorax risk',
        'Assess for hyperresonance to percussion on affected side',
        'Monitor for progressively worsening respiratory status',
        'Consider tension pneumothorax in cardiac arrest with difficult ventilation'
      ],
      safetyNotes: [
        'Tension pneumothorax is immediately life-threatening',
        'Do not delay for x-ray confirmation if clinical signs present',
        'Consider bilateral tension pneumothorax in blast injuries'
      ],
      equipmentNeeded: [
        'Stethoscope for breath sound assessment',
        'Pulse oximetry for oxygen saturation',
        'Blood pressure monitoring equipment'
      ]
    },
    {
      id: 'thoracentesis-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Site Selection',
      description: 'Prepare equipment and identify anatomical landmarks for needle insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Prepare 14-gauge angiocatheter with minimum 2-inch length',
        'Open antiseptic solution and prepare sterile gauze',
        'Identify 2nd intercostal space at midclavicular line on affected side',
        'Alternative: 4th-5th intercostal space at anterior axillary line',
        'Palpate for intercostal space above rib to avoid neurovascular bundle',
        'Prepare flutter valve or improvised one-way valve system',
        'Don appropriate personal protective equipment',
        'Position patient supine or semi-upright as condition allows'
      ],
      safetyNotes: [
        'Never insert needle below the rib - approach from above',
        'Midclavicular line safer than midaxillary for most patients',
        'Ensure adequate needle length for patient body habitus'
      ],
      equipmentNeeded: [
        '14-gauge angiocatheter (2+ inch length)',
        'Antiseptic solution (alcohol or betadine)',
        'Flutter valve or 3-way stopcock with finger cot',
        'Sterile gauze and tape',
        'Personal protective equipment'
      ]
    },
    {
      id: 'thoracentesis-step-3',
      stepNumber: 3,
      title: 'Site Preparation and Needle Insertion',
      description: 'Prepare insertion site and perform needle decompression',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Quickly clean insertion site with antiseptic solution',
        'Insert needle perpendicular to chest wall at 90-degree angle',
        'Advance needle slowly while aspirating to detect pleural entry',
        'Listen/feel for rush of air indicating successful decompression',
        'Advance catheter over needle into pleural space',
        'Remove needle stylet while maintaining catheter position',
        'Secure catheter with tape to prevent displacement',
        'Attach flutter valve or one-way valve system immediately'
      ],
      safetyNotes: [
        'Insert perpendicular to chest wall to avoid lung laceration',
        'Do not redirect needle once inserted - risk of lung injury',
        'Immediate rush of air confirms correct placement'
      ],
      equipmentNeeded: [
        'Prepared angiocatheter',
        'Antiseptic solution',
        'Sterile technique supplies',
        'Securing tape'
      ]
    },
    {
      id: 'thoracentesis-step-4',
      stepNumber: 4,
      title: 'Valve System Establishment',
      description: 'Establish functional one-way valve system for ongoing decompression',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Attach flutter valve to catheter hub for continuous decompression',
        'If no flutter valve, use 3-way stopcock with finger cot',
        'Test valve function by observing air egress with patient respiration',
        'Ensure valve allows air out but prevents air entry',
        'Secure valve system to prevent disconnection',
        'Monitor for continued air evacuation from pleural space',
        'Position valve below level of insertion to prevent fluid backflow',
        'Check system integrity and function continuously'
      ],
      safetyNotes: [
        'One-way valve prevents reaccumulation of tension',
        'Improper valve function can worsen pneumothorax',
        'Secure all connections to prevent system failure'
      ],
      equipmentNeeded: [
        'Flutter valve or 3-way stopcock system',
        'Finger cot or glove finger for improvised valve',
        'Securing tape and adhesive materials'
      ]
    },
    {
      id: 'thoracentesis-step-5',
      stepNumber: 5,
      title: 'Immediate Patient Response Assessment',
      description: 'Assess immediate patient response to decompression procedure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Monitor for immediate improvement in respiratory distress',
        'Assess for restoration of breath sounds on affected side',
        'Check for improvement in hemodynamic status: BP, pulse, perfusion',
        'Evaluate oxygen saturation improvement with pulse oximetry',
        'Monitor for resolution of tracheal deviation and JVD',
        'Assess chest rise and fall symmetry improvement',
        'Watch for patient color improvement and decreased cyanosis',
        'Document immediate response to intervention'
      ],
      safetyNotes: [
        'Improvement should be immediate if tension pneumothorax present',
        'Lack of improvement may indicate incorrect diagnosis or placement',
        'Consider additional decompression sites if bilateral involvement'
      ],
      equipmentNeeded: [
        'Continuous monitoring equipment',
        'Pulse oximetry',
        'Blood pressure monitoring',
        'Stethoscope for reassessment'
      ]
    },
    {
      id: 'thoracentesis-step-6',
      stepNumber: 6,
      title: 'Catheter Securing and Position Maintenance',
      description: 'Secure catheter and maintain proper position during transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Apply occlusive dressing around catheter insertion site',
        'Secure catheter to chest wall with medical tape',
        'Position patient to optimize catheter function and comfort',
        'Ensure catheter length allows for patient movement',
        'Check catheter patency by observing continued air evacuation',
        'Monitor insertion site for bleeding or air leak',
        'Protect catheter from accidental displacement during transport',
        'Mark catheter position on chest for reference'
      ],
      safetyNotes: [
        'Catheter displacement can cause reaccumulation of tension',
        'Over-securing can kink catheter and impair function',
        'Monitor continuously for system integrity'
      ],
      equipmentNeeded: [
        'Medical tape for securing',
        'Occlusive dressing materials',
        'Gauze pads for site protection',
        'Marking pen for position reference'
      ]
    },
    {
      id: 'thoracentesis-step-7',
      stepNumber: 7,
      title: 'Complication Monitoring and Management',
      description: 'Monitor for complications and manage adverse events',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Monitor for bleeding at insertion site and hemorrhage',
        'Watch for signs of lung re-expansion pulmonary edema',
        'Check for catheter malposition or migration',
        'Assess for development of subcutaneous emphysema',
        'Monitor for infection risk at insertion site',
        'Watch for reaccumulation of tension if valve fails',
        'Check for cardiac complications from mediastinal shift correction',
        'Be prepared for chest tube insertion at receiving facility'
      ],
      safetyNotes: [
        'Re-expansion pulmonary edema can be life-threatening',
        'Subcutaneous emphysema may indicate improper placement',
        'Have backup decompression equipment ready'
      ],
      equipmentNeeded: [
        'Continuous monitoring equipment',
        'Additional angiocatheters for backup',
        'Suction equipment if needed',
        'Emergency airway equipment'
      ]
    },
    {
      id: 'thoracentesis-step-8',
      stepNumber: 8,
      title: 'Documentation and Receiving Facility Preparation',
      description: 'Document procedure and prepare receiving facility for continued care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Document clinical presentation and indication for procedure',
        'Record insertion site, time, technique, and immediate response',
        'Note complications encountered and management provided',
        'Document vital signs before, during, and after procedure',
        'Communicate with receiving facility about chest tube needs',
        'Provide detailed procedure report to surgical team',
        'Continue monitoring and documentation during transport',
        'Prepare for potential chest tube conversion upon arrival'
      ],
      safetyNotes: [
        'Thorough documentation essential for surgical team',
        'Receiving facility needs immediate notification',
        'Definitive chest tube placement usually required'
      ],
      equipmentNeeded: [
        'Documentation materials',
        'Communication equipment for receiving facility',
        'Procedure report forms',
        'Continuous monitoring during transport'
      ]
    }
  ],

  'intravenous-fluid-therapy': [
    {
      id: 'fluid-step-1',
      stepNumber: 1,
      title: 'Hemodynamic Assessment and Fluid Indication Determination',
      description: 'Assess patient hemodynamic status and determine appropriate fluid therapy indication',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess vital signs: blood pressure, heart rate, respiratory rate, temperature',
        'Evaluate signs of hypovolemia: tachycardia, hypotension, poor capillary refill',
        'Check skin turgor, mucous membrane moisture, and jugular vein distension',
        'Assess mental status changes suggesting poor perfusion',
        'Identify underlying cause: bleeding, dehydration, sepsis, burns',
        'Evaluate urine output if available as marker of perfusion',
        'Check for orthostatic vital sign changes if safe to assess',
        'Rule out cardiogenic causes of hypotension before fluid administration'
      ],
      contraindications: [
        'Pulmonary edema with rales and JVD',
        'Known heart failure with fluid overload',
        'Hypervolemia with peripheral edema'
      ],
      safetyNotes: [
        'Fluid overload can worsen heart failure',
        'Assess carefully for cardiogenic vs hypovolemic shock',
        'Serial assessments more reliable than single measurements'
      ],
      equipmentNeeded: [
        'Vital signs monitoring equipment',
        'Stethoscope for cardiac and lung assessment',
        'Capnography for perfusion assessment',
        'Documentation materials'
      ]
    },
    {
      id: 'fluid-step-2',
      stepNumber: 2,
      title: 'Fluid Selection and Dosage Calculation',
      description: 'Select correct IV fluid type and calculate appropriate dosing for patient condition',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Choose isotonic crystalloid: Normal Saline (0.9% NaCl) or Lactated Ringers',
        'Calculate initial bolus: 20ml/kg for pediatrics, 500-1000ml for adults',
        'Consider patient weight, age, and comorbidities in dosing',
        'Select NS for hyperkalemia, head injury, or alkalosis',
        'Choose LR for trauma, burns, or when balanced solution preferred',
        'Avoid hypotonic solutions in acute resuscitation',
        'Calculate maintenance rates if ongoing therapy needed',
        'Consider need for blood products if hemorrhage suspected'
      ],
      safetyNotes: [
        'Hypotonic fluids can cause cerebral edema',
        'Large volumes of NS can cause hyperchloremic acidosis',
        'Pediatric dosing different from adult calculations'
      ],
      equipmentNeeded: [
        'Isotonic crystalloid solutions (NS, LR)',
        'Fluid calculation references or apps',
        'Patient weight estimation tools if needed'
      ]
    },
    {
      id: 'fluid-step-3',
      stepNumber: 3,
      title: 'IV Access Establishment',
      description: 'Establish secure peripheral IV access using sterile technique and safety protocols',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Select appropriate IV catheter size: 14-16G for resuscitation, 18-20G for maintenance',
        'Choose optimal vein: antecubital, forearm, or hand veins',
        'Apply tourniquet and prepare insertion site with antiseptic',
        'Use sterile technique throughout insertion procedure',
        'Insert catheter at 15-30 degree angle with bevel up',
        'Advance catheter over needle once flashback obtained',
        'Secure catheter with tape and transparent dressing',
        'Attach IV tubing and verify patency with saline flush'
      ],
      safetyNotes: [
        'Use universal precautions and sterile technique',
        'Larger gauge catheters allow faster fluid administration',
        'Secure IV well to prevent infiltration during transport'
      ],
      equipmentNeeded: [
        'IV catheters in appropriate sizes',
        'Antiseptic prep solutions',
        'IV start kits with tourniquet and tape',
        'Sterile gloves and supplies',
        'Normal saline flushes'
      ]
    },
    {
      id: 'fluid-step-4',
      stepNumber: 4,
      title: 'IV Administration Set Setup',
      description: 'Set up IV administration system for controlled fluid delivery',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Select macro-drip tubing (10-15 gtt/ml) for rapid fluid administration',
        'Prime IV tubing completely to remove all air bubbles',
        'Connect tubing to IV catheter using sterile technique',
        'Set up pressure bag or manual pressure for rapid infusion if needed',
        'Calculate drip rate for desired infusion speed',
        'Use infusion pump for precise rate control when available',
        'Label IV bags with patient information and start time',
        'Ensure IV pole height optimizes gravity flow'
      ],
      safetyNotes: [
        'Remove all air from tubing to prevent air embolism',
        'Check for leaks in system before starting infusion',
        'Pressure bags increase infusion rate significantly'
      ],
      equipmentNeeded: [
        'IV administration sets (macro-drip)',
        'IV poles for fluid bag elevation',
        'Pressure bags for rapid infusion',
        'Infusion pumps if available',
        'IV bag labels and marking pens'
      ]
    },
    {
      id: 'fluid-step-5',
      stepNumber: 5,
      title: 'Fluid Bolus Administration and Monitoring',
      description: 'Administer fluid bolus therapy with continuous monitoring of patient response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 600,
      keyPoints: [
        'Administer initial fluid bolus at calculated rate',
        'Monitor vital signs every 5-10 minutes during rapid infusion',
        'Assess for immediate hemodynamic improvement',
        'Watch for signs of fluid overload: increased work of breathing, rales',
        'Monitor IV site for infiltration, phlebitis, or extravasation',
        'Document fluid volumes administered and patient response',
        'Reassess perfusion markers: capillary refill, skin color, mental status',
        'Consider second bolus if inadequate response and no contraindications'
      ],
      safetyNotes: [
        'Rapid fluid administration can cause pulmonary edema',
        'Monitor continuously for signs of volume overload',
        'Stop infusion immediately if infiltration occurs'
      ],
      equipmentNeeded: [
        'Continuous monitoring equipment',
        'Stethoscope for lung assessment',
        'Documentation materials',
        'Pressure monitoring devices'
      ]
    },
    {
      id: 'fluid-step-6',
      stepNumber: 6,
      title: 'Response Assessment and Rate Titration',
      description: 'Titrate fluid rates based on clinical response and avoid fluid overload complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Reassess hemodynamic parameters after each bolus',
        'Adjust infusion rate based on patient response and blood pressure',
        'Switch to maintenance rate once hemodynamic stability achieved',
        'Monitor for adequate urine output as perfusion indicator',
        'Watch for improvement in mental status and peripheral perfusion',
        'Reduce rate if signs of volume overload develop',
        'Consider stopping fluids if patient becomes hypervolemic',
        'Transition to oral fluids when appropriate and patient can tolerate'
      ],
      safetyNotes: [
        'Overtitration can cause congestive heart failure',
        'Elderly patients more susceptible to fluid overload',
        'Monitor lung sounds frequently during infusion'
      ],
      equipmentNeeded: [
        'Infusion rate calculation tools',
        'Continuous monitoring equipment',
        'Urine measurement devices if available'
      ]
    },
    {
      id: 'fluid-step-7',
      stepNumber: 7,
      title: 'Complication Recognition and Management',
      description: 'Monitor for adverse reactions and manage complications of IV fluid therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Monitor for fluid overload: pulmonary edema, peripheral edema, JVD',
        'Watch for IV site complications: infiltration, phlebitis, infection',
        'Assess for electrolyte imbalances from large volume infusions',
        'Monitor for allergic reactions to IV solutions or additives',
        'Check for hypothermia from rapid infusion of room temperature fluids',
        'Watch for air embolism from improper IV setup',
        'Monitor for hyperchloremic acidosis with large NS volumes',
        'Assess for hemolysis if hypotonic solutions inadvertently used'
      ],
      safetyNotes: [
        'Stop infusion immediately if severe complications develop',
        'Have diuretics available for severe fluid overload',
        'Use fluid warmers for large volume resuscitation'
      ],
      equipmentNeeded: [
        'Emergency medications (diuretics, epinephrine)',
        'Fluid warming devices',
        'Equipment for IV site assessment',
        'Electrolyte monitoring if available'
      ]
    },
    {
      id: 'fluid-step-8',
      stepNumber: 8,
      title: 'Documentation and Handoff',
      description: 'Document fluid administration and provide comprehensive handoff to receiving team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Document total fluid volumes administered and types used',
        'Record patient response to therapy and vital sign trends',
        'Note any complications encountered and management provided',
        'Document ongoing infusion rates and access site condition',
        'Calculate total fluid balance including losses and intake',
        'Provide detailed report to receiving medical team',
        'Include recommendations for continued therapy or monitoring',
        'Document IV site assessment and patency status'
      ],
      safetyNotes: [
        'Accurate documentation essential for ongoing fluid management',
        'Include specific volumes and rates for receiving team',
        'Note any patient allergies or adverse reactions'
      ],
      equipmentNeeded: [
        'Documentation materials and flowsheets',
        'Fluid intake/output records',
        'Communication equipment for receiving facility'
      ]
    }
  ],

  'supraglottic-airway-management': [
    {
      id: 'sga-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Device Selection',
      description: 'Assess patient appropriateness for supraglottic airway insertion and select appropriate device',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess airway anatomy: mouth opening, neck mobility, dentition',
        'Confirm unconscious state with absent gag reflex',
        'Evaluate for contraindications: facial trauma, caustic ingestion, active vomiting',
        'Select appropriate device: LMA, King LT, I-gel based on patient and provider factors',
        'Choose correct size: use manufacturer weight-based sizing or clinical assessment',
        'Consider patient positioning and access for optimal insertion angle',
        'Assess adequacy of current oxygenation and ventilation',
        'Prepare backup plans: surgical airway, different device sizes'
      ],
      contraindications: [
        'Conscious patient with intact protective reflexes',
        'Complete upper airway obstruction',
        'Severe facial/oral trauma',
        'Caustic ingestion with potential burns'
      ],
      safetyNotes: [
        'Never force insertion against resistance',
        'Have multiple device sizes available',
        'Maintain oxygenation throughout procedure'
      ],
      equipmentNeeded: [
        'Multiple supraglottic airway devices and sizes',
        'Patient assessment tools',
        'Backup airway equipment'
      ]
    },
    {
      id: 'sga-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Pre-oxygenation',
      description: 'Prepare supraglottic airway device and optimize patient oxygenation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Test device cuff integrity by inflating to maximum volume and checking for leaks',
        'Deflate cuff completely and apply water-soluble lubricant to cuff and tip',
        'Pre-oxygenate patient with 100% oxygen for 3-5 minutes if time allows',
        'Position patient in neutral or slightly extended head position',
        'Ensure suction equipment is immediately available and functional',
        'Prepare bag-valve-mask for positive pressure ventilation',
        'Set up capnography monitoring for placement confirmation',
        'Have assistant available to provide cricoid pressure if needed'
      ],
      safetyNotes: [
        'Pre-oxygenation extends safe apnea time',
        'Properly deflated cuff essential for smooth insertion',
        'Never use petroleum-based lubricants'
      ],
      equipmentNeeded: [
        'Prepared supraglottic airway device',
        'Water-soluble lubricant',
        '100% oxygen source',
        'Bag-valve-mask with reservoir',
        'Suction equipment',
        'Capnography monitor'
      ]
    },
    {
      id: 'sga-step-3',
      stepNumber: 3,
      title: 'Device Insertion Technique',
      description: 'Insert supraglottic airway device using proper technique and anatomical guidance',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Open mouth with cross-finger technique or tongue blade',
        'Insert device with cuff deflated following natural curve of pharynx',
        'Use gentle, steady pressure without force - resistance indicates improper angle',
        'Advance device until resistance is met at hypopharyngeal tissues',
        'For LMA: insert tip against hard palate then rotate down into position',
        'For King LT: insert in midline with curve following posterior pharyngeal wall',
        'Avoid advancing too far - tip should rest above upper esophageal sphincter',
        'Remove any insertion guides or stylets per device instructions'
      ],
      safetyNotes: [
        'Never force device insertion - repositioning may be needed',
        'Stop insertion if significant resistance encountered',
        'Maintain gentle, steady pressure throughout insertion'
      ],
      equipmentNeeded: [
        'Lubricated supraglottic airway device',
        'Tongue blade or mouth opening device',
        'Good lighting for visualization'
      ]
    },
    {
      id: 'sga-step-4',
      stepNumber: 4,
      title: 'Cuff Inflation and Initial Positioning',
      description: 'Inflate device cuff to appropriate pressure and optimize initial positioning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Inflate cuff with recommended volume using syringe (device-specific)',
        'Monitor cuff pressure if manometer available (typically 40-60 cmH2O)',
        'Observe for slight outward movement of device indicating proper seating',
        'Check that device sits at appropriate depth markers if present',
        'Ensure cuff inflation creates adequate seal without overinflation',
        'Connect bag-valve-mask or ventilator circuit to device',
        'Check for immediate chest rise and fall with manual ventilation',
        'Assess ease of ventilation and resistance to bag compression'
      ],
      safetyNotes: [
        'Overinflation can cause tissue trauma and poor seal',
        'Underinflation results in inadequate seal and aspiration risk',
        'Monitor cuff pressure if equipment available'
      ],
      equipmentNeeded: [
        'Appropriate syringe for cuff inflation',
        'Cuff pressure manometer if available',
        'Bag-valve-mask for initial ventilation testing'
      ]
    },
    {
      id: 'sga-step-5',
      stepNumber: 5,
      title: 'Placement Confirmation and Verification',
      description: 'Confirm correct device placement using multiple verification methods',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Auscultate bilateral breath sounds over lung fields',
        'Confirm absence of gurgling sounds over epigastrium',
        'Verify capnography waveform and end-tidal CO2 readings',
        'Observe bilateral chest rise and fall with ventilation',
        'Check oxygen saturation improvement with pulse oximetry',
        'Assess ease of ventilation - should require normal pressure',
        'Verify no air leak around cuff during positive pressure ventilation',
        'Document multiple confirmation methods used and results'
      ],
      safetyNotes: [
        'Use multiple confirmation methods - no single method is foolproof',
        'Capnography is gold standard for airway device placement',
        'Gastric insufflation indicates malposition or inadequate seal'
      ],
      equipmentNeeded: [
        'Stethoscope for auscultation',
        'Capnography monitor with waveform',
        'Pulse oximetry',
        'Documentation materials'
      ]
    },
    {
      id: 'sga-step-6',
      stepNumber: 6,
      title: 'Device Securing and Optimization',
      description: 'Secure device adequately and optimize ventilation parameters',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Secure device with tape, ties, or commercial holder to prevent displacement',
        'Position securing method to allow mouth opening for suction if needed',
        'Insert bite block or oral airway to prevent device damage from biting',
        'Optimize ventilation parameters: rate, tidal volume, PEEP if available',
        'Set appropriate oxygen concentration based on patient condition',
        'Ensure device remains at proper depth throughout securing process',
        'Reconfirm placement after securing and positioning changes',
        'Document optimal ventilation settings for transport and handoff'
      ],
      safetyNotes: [
        'Avoid over-tightening securing devices causing pressure necrosis',
        'Bite blocks prevent device damage but may impede access',
        'Recheck placement after any manipulation or transport'
      ],
      equipmentNeeded: [
        'Medical tape or commercial airway holder',
        'Bite block or oral airway',
        'Ventilation equipment with parameter control',
        'Securing and positioning supplies'
      ]
    },
    {
      id: 'sga-step-7',
      stepNumber: 7,
      title: 'Continuous Monitoring and Complication Management',
      description: 'Monitor device function continuously and manage potential complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor capnography waveform continuously for changes indicating displacement',
        'Assess ventilation adequacy and chest rise regularly',
        'Watch for signs of aspiration: decreased oxygen saturation, gurgling',
        'Monitor for device displacement during patient movement or transport',
        'Check cuff pressure periodically and adjust as needed',
        'Suction airway if secretions or vomiting occurs',
        'Be prepared for device removal and alternative airway if complications',
        'Monitor for laryngospasm or bronchospasm related to device'
      ],
      safetyNotes: [
        'Device displacement can occur with patient movement',
        'Have plan for immediate device removal if vomiting occurs',
        'Continuous capnography essential for detecting problems early'
      ],
      equipmentNeeded: [
        'Continuous capnography monitoring',
        'Suction equipment ready for immediate use',
        'Backup airway management equipment',
        'Emergency medications for bronchospasm'
      ]
    },
    {
      id: 'sga-step-8',
      stepNumber: 8,
      title: 'Transport Management and Handoff',
      description: 'Manage airway during transport and provide comprehensive handoff',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Ensure device security before and during transport',
        'Maintain continuous monitoring throughout transport',
        'Have backup airway equipment immediately available during transport',
        'Document total time with supraglottic airway in place',
        'Note any complications or repositioning required during care',
        'Provide detailed report to receiving team: device type, size, settings',
        'Include assessment of need for definitive airway management',
        'Prepare for potential device removal or conversion at receiving facility'
      ],
      safetyNotes: [
        'Transport increases risk of device displacement',
        'Receiving facility may need to convert to endotracheal intubation',
        'Maintain vigilance for complications throughout transport'
      ],
      equipmentNeeded: [
        'Transport monitoring equipment',
        'Backup airway management supplies',
        'Documentation materials',
        'Communication equipment for receiving facility'
      ]
    }
  ],

  'femoral-vein-cannulation': [
    {
      id: 'femoral-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Contraindication Evaluation',
      description: 'Assess patient appropriately for femoral central venous access and rule out contraindications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Evaluate clinical indication: failed peripheral access, need for central access',
        'Assess coagulation status: bleeding disorders, anticoagulation, INR if available',
        'Examine proposed insertion site for infection, cellulitis, or wounds',
        'Check for anatomical abnormalities or previous surgery at site',
        'Assess patient cooperation and ability to remain still during procedure',
        'Review medical history for venous thrombosis or previous central lines',
        'Ensure appropriate personnel and equipment available for safe procedure',
        'Obtain informed consent if patient consciousness and time permit'
      ],
      contraindications: [
        'Active skin infection at insertion site',
        'Severe coagulopathy (INR >2.0)',
        'Combative or uncooperative patient',
        'Known venous obstruction at site'
      ],
      safetyNotes: [
        'Femoral site higher infection risk than subclavian/jugular',
        'Bleeding risk increased with coagulopathy',
        'Patient positioning critical for safe access'
      ],
      equipmentNeeded: [
        'Patient assessment tools',
        'Coagulation studies if available',
        'Informed consent materials',
        'Patient positioning supplies'
      ]
    },
    {
      id: 'femoral-step-2',
      stepNumber: 2,
      title: 'Maximum Barrier Precautions and Sterile Setup',
      description: 'Establish maximum barrier precautions and sterile field for central line insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Don sterile cap, mask, gown, and gloves using proper technique',
        'Prepare large sterile drape to cover entire patient from head to toe',
        'Set up sterile field with central line kit components organized',
        'Prepare ultrasound with sterile probe cover and gel',
        'Draw up local anesthetic in sterile syringe with appropriate needle',
        'Check all equipment function: catheter lumens, guidewire, dilator',
        'Have assistant available who can maintain sterile field',
        'Ensure emergency equipment immediately accessible but outside sterile field'
      ],
      safetyNotes: [
        'Maximum barrier precautions reduce infection risk significantly',
        'Break in sterile technique requires restarting procedure',
        'All personnel in room should wear caps and masks'
      ],
      equipmentNeeded: [
        'Sterile gowns, gloves, caps, masks for all personnel',
        'Large sterile drapes for maximum barrier',
        'Central venous catheter kit',
        'Ultrasound with sterile probe covers',
        'Sterile field setup supplies'
      ]
    },
    {
      id: 'femoral-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Anatomical Landmark Identification',
      description: 'Position patient optimally and identify anatomical landmarks for safe access',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Position patient supine with leg slightly externally rotated',
        'Place small roll under ipsilateral hip to optimize access angle',
        'Identify inguinal ligament from anterior superior iliac spine to pubic tubercle',
        'Palpate femoral pulse medial to anterior superior iliac spine',
        'Locate femoral vein medial to femoral artery (remember NAVEL: lateral to medial)',
        'Mark insertion point approximately 2-3cm below inguinal ligament',
        'Ensure adequate lighting and access to insertion site',
        'Position ultrasound screen for optimal visualization during procedure'
      ],
      safetyNotes: [
        'Femoral vein lies medial to femoral artery',
        'Insertion too high risks retroperitoneal hematoma',
        'Adequate exposure essential for safe technique'
      ],
      equipmentNeeded: [
        'Patient positioning aids (rolls, pillows)',
        'Adequate lighting',
        'Anatomical landmark identification tools',
        'Skin marking pen if needed'
      ]
    },
    {
      id: 'femoral-step-4',
      stepNumber: 4,
      title: 'Ultrasound Guidance and Vessel Identification',
      description: 'Use ultrasound guidance to identify femoral vein and optimize needle approach',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Apply sterile gel to ultrasound probe with sterile cover',
        'Place probe in transverse orientation over femoral vessels',
        'Identify femoral artery (pulsatile, thick-walled) and vein (compressible, thin-walled)',
        'Confirm vein compressibility and lack of intravascular thrombus',
        'Optimize image depth and gain for clear vessel visualization',
        'Practice needle visualization technique before skin puncture',
        'Identify optimal insertion angle and trajectory to vein',
        'Mark skin entry point based on ultrasound guidance'
      ],
      safetyNotes: [
        'Always confirm vessel identity before needle insertion',
        'Femoral vein should be easily compressible',
        'Use real-time ultrasound guidance throughout needle insertion'
      ],
      equipmentNeeded: [
        'Ultrasound machine with high-frequency probe',
        'Sterile ultrasound probe covers',
        'Sterile ultrasound gel',
        'Image optimization controls'
      ]
    },
    {
      id: 'femoral-step-5',
      stepNumber: 5,
      title: 'Local Anesthesia and Initial Needle Insertion',
      description: 'Administer local anesthesia and perform initial needle insertion under ultrasound guidance',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Infiltrate skin and subcutaneous tissue with 1-2% lidocaine',
        'Allow adequate time for anesthetic effect (2-3 minutes)',
        'Insert access needle at 45-degree angle toward ultrasound probe',
        'Advance needle under real-time ultrasound guidance',
        'Watch for needle tip visualization and vein wall indentation',
        'Aspirate continuously while advancing to detect vessel entry',
        'Stop advancement immediately upon obtaining dark venous blood',
        'Confirm venous blood by color, pressure, and blood gas if available'
      ],
      safetyNotes: [
        'Never advance needle without clear ultrasound visualization',
        'Arterial puncture requires immediate pressure and reassessment',
        'Multiple needle passes increase complication risk'
      ],
      equipmentNeeded: [
        'Local anesthetic (lidocaine 1-2%)',
        'Needles and syringes for anesthesia',
        'Central line access needle (18-gauge)',
        'Syringes for blood aspiration'
      ]
    },
    {
      id: 'femoral-step-6',
      stepNumber: 6,
      title: 'Seldinger Technique and Catheter Insertion',
      description: 'Perform Seldinger technique with guidewire and catheter insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Insert guidewire through needle with J-tip leading',
        'Advance guidewire smoothly - stop if resistance encountered',
        'Remove needle while maintaining guidewire position',
        'Make small skin incision with scalpel to facilitate catheter insertion',
        'Thread dilator over guidewire to enlarge tract',
        'Remove dilator and quickly insert catheter over guidewire',
        'Advance catheter to appropriate depth (typically 15-20cm)',
        'Remove guidewire while maintaining catheter position'
      ],
      safetyNotes: [
        'Never force guidewire advancement against resistance',
        'Maintain guidewire control at all times to prevent loss',
        'Work quickly once dilator removed to prevent air embolism'
      ],
      equipmentNeeded: [
        'J-tip guidewire',
        'Vessel dilator',
        'Central venous catheter',
        'Scalpel for skin incision',
        'Guidewire control and positioning tools'
      ]
    },
    {
      id: 'femoral-step-7',
      stepNumber: 7,
      title: 'Catheter Function Testing and Securing',
      description: 'Confirm catheter function and secure device to prevent complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Aspirate blood from all catheter lumens to confirm patency',
        'Flush all lumens with sterile saline to ensure free flow',
        'Check for blood return and easy flushing without resistance',
        'Secure catheter to skin with sutures using sterile technique',
        'Apply sterile occlusive dressing over insertion site',
        'Cap all unused lumens with sterile caps',
        'Label catheter with insertion date and time',
        'Document catheter position, lumens, and function in medical record'
      ],
      safetyNotes: [
        'All lumens must draw blood and flush easily',
        'Secure suturing prevents catheter migration',
        'Sterile dressing essential for infection prevention'
      ],
      equipmentNeeded: [
        'Sterile sutures and needle holders',
        'Sterile saline flushes',
        'Sterile catheter caps',
        'Sterile occlusive dressing',
        'Catheter labeling materials'
      ]
    },
    {
      id: 'femoral-step-8',
      stepNumber: 8,
      title: 'Complication Assessment and Documentation',
      description: 'Monitor for immediate complications and provide comprehensive documentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Monitor insertion site for immediate bleeding or hematoma formation',
        'Check distal pulse and perfusion to rule out arterial compromise',
        'Assess for signs of pneumothorax or air embolism',
        'Obtain chest X-ray to confirm catheter position if required by protocol',
        'Document procedure details: site, technique, complications, catheter type',
        'Record number of attempts, ultrasound use, and patient tolerance',
        'Provide detailed handoff to receiving team including catheter care',
        'Establish plan for ongoing monitoring and catheter maintenance'
      ],
      safetyNotes: [
        'Early recognition of complications essential',
        'Arterial injury can cause life-threatening bleeding',
        'Continuous monitoring required for central venous access'
      ],
      equipmentNeeded: [
        'Monitoring equipment for vital signs',
        'Documentation materials',
        'Chest X-ray if required',
        'Communication equipment for receiving team',
        'Complication management supplies'
      ]
    }
  ],

  'double-lumen-airway-insertion': {
    name: 'Double Lumen Airway Insertion',
    category: 'airway',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 15,
    isCritical: true,
    objectives: [
      'Assess patient appropriately for double lumen airway insertion and rule out contraindications',
      'Select correct device size based on patient characteristics and clinical requirements',
      'Demonstrate proper insertion technique for double lumen airway devices',
      'Perform systematic ventilation testing to confirm appropriate functional lumen',
      'Secure device adequately and optimize ventilation parameters for patient care',
      'Monitor continuously for device complications and displacement during care',
      'Communicate device management requirements to receiving medical team'
    ],
    indications: [
      'Failed bag-mask ventilation requiring immediate rescue airway intervention',
      'Cannot intubate, cannot oxygenate emergency situation requiring alternative airway',
      'Bridge airway after unsuccessful endotracheal intubation attempts',
      'Primary rescue airway when surgical airway not immediately available',
      'Alternative airway management in anticipated difficult intubation scenarios',
      'Emergency airway management when advanced airway expertise unavailable'
    ],
    contraindications: [
      'Conscious patient with intact gag reflex and protective airway mechanisms',
      'Complete upper airway obstruction above the level of device placement',
      'Suspected esophageal or pharyngeal pathology preventing safe device insertion',
      'Severe trismus or limited mouth opening (<23mm) preventing adequate insertion',
      'Known caustic ingestion with suspected upper airway chemical burns',
      'Massive maxillofacial trauma with distorted upper airway anatomy'
    ],
    equipment: [
      'Double lumen airway devices in appropriate sizes (Size 3, 4, 5)',
      'Syringes for cuff inflation (60mL pharyngeal, 20mL esophageal)',
      'Water-soluble lubricant for device preparation and insertion',
      'Bag-valve-mask device with high-flow oxygen reservoir attachment',
      'Suction equipment with rigid catheter for airway clearing',
      'End-tidal CO2 monitoring with waveform capnography capability',
      'Securing tape or commercial airway holder for device stabilization',
      'Backup airway equipment including surgical airway kit if available'
    ]
  },

  'adult-endotracheal-intubation': {
    name: 'Adult Endotracheal Intubation',
    category: 'airway',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 18,
    isCritical: true,
    objectives: [
      'Perform comprehensive pre-intubation assessment using LEMON criteria and systematic evaluation',
      'Demonstrate proper equipment preparation and testing for endotracheal intubation',
      'Execute optimal patient positioning and pre-oxygenation techniques for safe intubation',
      'Perform direct laryngoscopy with proper technique to visualize vocal cords effectively',
      'Insert endotracheal tube successfully and confirm placement using multiple verification methods',
      'Secure ETT properly and provide appropriate post-intubation monitoring and management',
      'Manage intubated patient during transport with continuous assessment and backup planning'
    ],
    indications: [
      'Respiratory failure with inadequate oxygenation or ventilation despite optimal support',
      'Airway protection needed in unconscious patient or high aspiration risk',
      'Cardiac arrest requiring definitive airway management and positive pressure ventilation',
      'Anticipated clinical deterioration requiring proactive advanced airway management',
      'Need for mechanical ventilation or precise control of ventilatory parameters',
      'Severe trauma with airway compromise, facial injuries, or anticipated airway swelling'
    ],
    contraindications: [
      'Complete upper airway obstruction preventing laryngoscope blade insertion or visualization',
      'Severe maxillofacial trauma with distorted anatomy (consider surgical airway)',
      'Known extremely difficult airway without appropriate backup plan or expertise',
      'Conscious cooperative patient maintaining adequate airway and ventilation independently',
      'Lack of proper equipment, training, or backup airway management capabilities'
    ],
    equipment: [
      'Endotracheal tubes multiple sizes (7.0-8.5mm) with tested integrity cuffs',
      'Laryngoscope handle with bright light and multiple blade sizes (Macintosh 3, 4)',
      'Malleable stylet with water-soluble lubricant for tube shaping',
      'Bag-valve-mask with PEEP valve and high-flow oxygen reservoir system',
      'Suction equipment with rigid Yankauer and flexible suction catheters',
      'End-tidal CO2 monitoring with continuous waveform capnography capability',
      'Cuff inflation syringe and ETT securing devices (tape or commercial holders)',
      'Backup airway equipment: supraglottic devices, surgical airway kit, smaller ETTs'
    ]
  },

  // 30. SURGICAL CRICOTHYROIDOTOMY - Evidence-based emergency airway technique
  'surgical-cricothyroidotomy': [
    {
      id: 'cricothyroidotomy-step-1',
      stepNumber: 1,
      title: 'Emergency Airway Assessment and Indication Confirmation',
      description: 'Rapidly confirm cannot intubate, cannot oxygenate scenario requiring emergency surgical airway',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Confirm failed endotracheal intubation attempts (maximum 3 attempts)',
        'Assess for failed supraglottic airway insertion or inadequate ventilation',
        'Verify oxygen saturation <90% despite BVM ventilation attempts',
        'Confirm upper airway obstruction preventing effective ventilation',
        'Check for complete loss of airway patency with imminent respiratory arrest',
        'Ensure no contraindications: pediatric patient <10 years, adequate ventilation possible',
        'Call for additional help and notify receiving facility of emergency surgical airway',
        'Continue rescue ventilation attempts while preparing for cricothyroidotomy'
      ],
      contraindications: [
        'Ability to achieve adequate ventilation with BVM or supraglottic airway',
        'Pediatric patients under 10 years of age (needle cricothyroidotomy preferred)',
        'Severe anterior neck pathology distorting normal anatomy'
      ],
      safetyNotes: [
        'This is a last-resort airway technique when all other methods have failed',
        'Time is critical - do not delay if true cannot intubate, cannot oxygenate scenario',
        'Have backup plan for failed surgical airway (needle cricothyroidotomy)'
      ],
      equipmentNeeded: [
        'Pulse oximetry for continuous oxygen saturation monitoring',
        'Assessment tools and emergency airway equipment',
        'Communication equipment for calling additional help'
      ]
    },
    {
      id: 'cricothyroidotomy-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Sterile Setup',
      description: 'Rapidly prepare surgical instruments and establish sterile field for emergency cricothyroidotomy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Open cricothyroidotomy kit or gather scalpel with #11 blade',
        'Prepare 6.0mm tracheostomy tube or small endotracheal tube (6.0-7.0mm)',
        'Set up tracheal hook or curved hemostat for airway manipulation',
        'Ready tracheal dilator or spreading forceps for membrane dilation',
        'Connect BVM to high-flow oxygen and prepare for immediate ventilation',
        'Set up suction with rigid Yankauer catheter for blood clearance',
        'Don sterile gloves and prepare antiseptic solution for skin prep',
        'Have cuff inflation syringe ready and tube securing materials available'
      ],
      safetyNotes: [
        'Speed is essential but maintain sterile technique when possible',
        'Have all equipment immediately accessible before starting procedure',
        'Ensure suction is working properly to manage bleeding'
      ],
      equipmentNeeded: [
        'Scalpel handle with #11 surgical blade',
        'Tracheostomy tube (6.0mm) or small ETT (6.0-7.0mm)',
        'Tracheal hook or curved hemostat',
        'Tracheal dilator or spreading forceps',
        'BVM with high-flow oxygen capability'
      ]
    },
    {
      id: 'cricothyroidotomy-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Anatomical Landmark Identification',
      description: 'Position patient optimally and identify critical anatomical landmarks for safe surgical access',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position patient supine with neck extended (towel roll under shoulders)',
        'Palpate thyroid cartilage (Adam\'s apple) as primary anatomical landmark',
        'Identify cricoid cartilage immediately below thyroid cartilage',
        'Locate cricothyroid membrane in depression between thyroid and cricoid cartilages',
        'Mark the cricothyroid membrane with finger or skin marker',
        'Ensure adequate lighting and clear visualization of anterior neck',
        'Stabilize larynx with non-dominant hand throughout procedure',
        'Apply antiseptic solution to anterior neck if time permits'
      ],
      contraindications: [
        'Inability to palpate normal anatomical landmarks due to swelling or pathology',
        'Previous neck surgery or radiation causing anatomical distortion'
      ],
      safetyNotes: [
        'Proper landmark identification is critical to avoid major vessel injury',
        'Maintain laryngeal stabilization throughout the procedure',
        'In emergency situations, anatomical identification takes precedence over extensive prep'
      ],
      equipmentNeeded: [
        'Towel roll or neck roll for positioning',
        'Adequate lighting source',
        'Antiseptic solution for skin preparation',
        'Skin marking pen if available'
      ]
    },
    {
      id: 'cricothyroidotomy-step-4',
      stepNumber: 4,
      title: 'Skin Incision and Tissue Dissection',
      description: 'Create controlled vertical skin incision and dissect through subcutaneous tissues',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Make 3-4cm vertical skin incision over cricothyroid membrane',
        'Incise through skin and subcutaneous tissue down to pretracheal fascia',
        'Use spreading technique with forceps to separate tissue layers',
        'Control bleeding with pressure and suction as needed',
        'Maintain midline orientation to avoid major vascular structures',
        'Ensure adequate exposure of cricothyroid membrane',
        'Use tracheal hook or hemostat to stabilize thyroid cartilage if needed',
        'Clear tissue and blood from operative field with suction'
      ],
      safetyNotes: [
        'Stay in midline to avoid carotid arteries and jugular veins',
        'Control bleeding quickly but do not delay airway establishment',
        'Maintain sterile technique as much as possible under emergency conditions'
      ],
      equipmentNeeded: [
        'Scalpel with #11 blade for precise incisions',
        'Forceps or hemostats for tissue manipulation',
        'Suction equipment with rigid catheter',
        'Gauze sponges for bleeding control'
      ]
    },
    {
      id: 'cricothyroidotomy-step-5',
      stepNumber: 5,
      title: 'Cricothyroid Membrane Incision',
      description: 'Execute precise horizontal incision through cricothyroid membrane to enter tracheal lumen',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Palpate and visualize cricothyroid membrane clearly',
        'Make horizontal incision through cricothyroid membrane (lower third)',
        'Extend incision through membrane into tracheal lumen',
        'Listen for air rush indicating successful tracheal entry',
        'Use tracheal hook to lift thyroid cartilage and open airway',
        'Insert dilator or spread incision with forceps',
        'Suction blood and secretions from airway opening',
        'Ensure adequate opening size for tube insertion'
      ],
      safetyNotes: [
        'Horizontal incision prevents damage to vocal cords above and tracheal rings below',
        'Air rush confirms successful tracheal entry',
        'Do not make incision too large to avoid difficulty with tube sealing'
      ],
      equipmentNeeded: [
        'Scalpel with #11 blade for membrane incision',
        'Tracheal hook for cartilage manipulation',
        'Tracheal dilator or spreading forceps',
        'Suction equipment for airway clearance'
      ]
    },
    {
      id: 'cricothyroidotomy-step-6',
      stepNumber: 6,
      title: 'Tracheostomy Tube Insertion and Placement',
      description: 'Insert tracheostomy tube through surgical opening and confirm proper tracheal placement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Insert 6.0mm tracheostomy tube or small ETT through membrane incision',
        'Direct tube caudally (downward) into tracheal lumen',
        'Advance tube 2-3cm beyond the cuff to ensure proper depth',
        'Inflate cuff with 5-10ml air to seal airway',
        'Remove obturator if using tracheostomy tube with inner cannula',
        'Connect BVM or ventilator to tube immediately',
        'Check for bilateral chest rise and breath sounds',
        'Confirm placement with end-tidal CO2 if available'
      ],
      safetyNotes: [
        'Ensure tube is directed into trachea, not subcutaneous tissues',
        'Do not advance tube too far to avoid right mainstem intubation',
        'Immediate ventilation assessment is critical to confirm success'
      ],
      equipmentNeeded: [
        'Tracheostomy tube (6.0mm) or small ETT',
        'Cuff inflation syringe',
        'BVM with high-flow oxygen',
        'End-tidal CO2 monitoring if available'
      ]
    },
    {
      id: 'cricothyroidotomy-step-7',
      stepNumber: 7,
      title: 'Ventilation Confirmation and Tube Securing',
      description: 'Confirm adequate ventilation and secure tube to prevent dislodgement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Auscultate bilateral breath sounds to confirm adequate ventilation',
        'Monitor oxygen saturation and end-tidal CO2 waveform',
        'Assess chest rise and fall with each ventilation',
        'Check for air leak around tube and adjust cuff pressure',
        'Secure tube with sutures, tape, or commercial tracheostomy holder',
        'Apply sterile dressing around tube insertion site',
        'Document tube depth at skin level for reference',
        'Establish appropriate ventilation rate and tidal volume'
      ],
      safetyNotes: [
        'Inadequate breath sounds may indicate tube malposition',
        'Secure tube well to prevent accidental dislodgement',
        'Monitor continuously for tube obstruction or displacement'
      ],
      equipmentNeeded: [
        'Stethoscope for breath sound assessment',
        'Sutures or tape for tube securing',
        'Sterile dressing materials',
        'Commercial tracheostomy holder if available'
      ]
    },
    {
      id: 'cricothyroidotomy-step-8',
      stepNumber: 8,
      title: 'Ongoing Monitoring and Transport Preparation',
      description: 'Monitor for complications and prepare for transport to appropriate facility',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Monitor vital signs and oxygen saturation continuously',
        'Assess for complications: bleeding, pneumothorax, tube obstruction',
        'Check tube position and patency every 5-10 minutes',
        'Suction airway as needed for blood or secretion clearance',
        'Monitor for subcutaneous emphysema around insertion site',
        'Document procedure details, complications, and patient response',
        'Prepare for immediate transport to trauma center or ENT surgery',
        'Brief receiving team on procedure and current patient status'
      ],
      contraindications: [
        'Do not delay transport for non-essential interventions',
        'Avoid manipulating tube unnecessarily during transport'
      ],
      safetyNotes: [
        'Surgical cricothyroidotomy is temporary emergency airway - definitive management needed',
        'Transport to facility capable of surgical airway management',
        'Have backup airway equipment available during transport'
      ],
      equipmentNeeded: [
        'Continuous monitoring equipment',
        'Portable suction with sterile catheters',
        'Documentation materials',
        'Transport ventilator or BVM with oxygen'
      ]
    }
  ],

  'surgical-cricothyroidotomy': {
    name: 'Surgical Cricothyroidotomy',
    category: 'airway',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 12,
    isCritical: true,
    objectives: [
      'Rapidly recognize cannot intubate, cannot oxygenate emergency requiring surgical airway',
      'Demonstrate proper equipment preparation and sterile technique for emergency cricothyroidotomy',
      'Identify anatomical landmarks and position patient optimally for surgical airway access',
      'Perform vertical skin incision and expose cricothyroid membrane safely',
      'Execute cricothyroid membrane incision and establish emergency tracheal airway access',
      'Insert tracheostomy tube properly and confirm adequate ventilation and placement',
      'Secure airway device and provide ongoing monitoring for complications and effectiveness'
    ],
    indications: [
      'Cannot intubate, cannot oxygenate emergency with complete airway management failure',
      'Complete upper airway obstruction unrelieved by conventional airway techniques',
      'Severe maxillofacial trauma preventing endotracheal intubation with ventilation failure',
      'Laryngeal trauma or swelling causing airway compromise not manageable otherwise',
      'Foreign body obstruction in upper airway not removable by standard techniques',
      'Severe anaphylaxis or angioedema causing complete airway obstruction'
    ],
    contraindications: [
      'Ability to achieve adequate oxygenation and ventilation by alternative airway methods',
      'Conscious patient with intact protective airway reflexes (unless imminent respiratory arrest)',
      'Pediatric patients under 10 years of age (needle cricothyroidotomy preferred)',
      'Severe anterior neck pathology, infection, or previous surgery distorting normal anatomy',
      'Lack of proper surgical equipment or trained personnel for safe procedure execution'
    ],
    equipment: [
      'Scalpel handle with #11 surgical blade for precise incisions',
      'Tracheal hook or curved hemostat for airway stabilization and exposure',
      'Tracheostomy tube (6.0mm) or small endotracheal tube (6.0-7.0mm)',
      'Tracheal dilator, forceps, or spreading instrument for membrane dilation',
      'Bag-valve-mask device with high-flow oxygen for immediate ventilation',
      'Suction equipment with rigid catheter for blood and secretion clearance',
      'Sterile gloves, antiseptic solution, and basic sterile preparation materials',
      'Cuff inflation syringe and securing materials for tube stabilization'
    ]
  },

  // 31. SYNCHRONIZED CARDIOVERSION - Evidence-based electrical cardioversion technique
  'synchronized-cardioversion': [
    {
      id: 'cardioversion-step-1',
      stepNumber: 1,
      title: 'Hemodynamic Assessment and Cardioversion Indication',
      description: 'Assess patient stability and confirm indication for synchronized cardioversion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Obtain 12-lead ECG to identify specific tachyarrhythmia type',
        'Assess hemodynamic stability: blood pressure, heart rate, mental status',
        'Look for instability signs: chest pain, dyspnea, hypotension, altered consciousness',
        'Confirm heart rate >150 bpm with hemodynamic compromise',
        'Rule out digitalis toxicity which contraindicates cardioversion',
        'Assess duration of arrhythmia for anticoagulation considerations',
        'Document patient symptoms and response to previous treatments',
        'Confirm failed response to appropriate medical therapy'
      ],
      contraindications: [
        'Hemodynamically stable patient with well-tolerated arrhythmia',
        'Suspected digitalis toxicity (risk of ventricular fibrillation)',
        'Multifocal atrial tachycardia (rarely responds to cardioversion)'
      ],
      safetyNotes: [
        'Unstable patients may require immediate cardioversion without delay',
        'Stable patients allow time for proper preparation and sedation',
        'Consider medical therapy first in stable wide-complex tachycardia'
      ],
      equipmentNeeded: [
        '12-lead ECG machine for rhythm identification',
        'Continuous cardiac monitoring equipment',
        'Blood pressure monitoring devices',
        'Pulse oximetry for oxygen saturation monitoring'
      ]
    },
    {
      id: 'cardioversion-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Safety Setup',
      description: 'Prepare biphasic defibrillator and establish synchronized mode with safety protocols',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Use biphasic defibrillator with reliable synchronization capability',
        'Turn on synchronization mode and verify R-wave detection markers',
        'Select appropriate electrode pad placement (anterolateral or anteroposterior)',
        'Apply electrode pads ensuring good skin contact and conductive gel',
        'Check synchronization markers appear on each QRS complex',
        'Set initial energy level based on arrhythmia type and guidelines',
        'Ensure "sync" mode is clearly indicated on defibrillator display',
        'Have emergency medications drawn up and immediately available'
      ],
      safetyNotes: [
        'Always verify sync mode is active - unsynchronized shock may cause VF',
        'Poor R-wave detection may prevent synchronized delivery',
        'Have full resuscitation equipment immediately available'
      ],
      equipmentNeeded: [
        'Biphasic defibrillator with synchronization mode',
        'Defibrillator electrode pads (anterolateral placement)',
        'Conductive gel or pre-gelled electrode pads',
        'Emergency cardiac medications (atropine, dopamine, epinephrine)'
      ]
    },
    {
      id: 'cardioversion-step-3',
      stepNumber: 3,
      title: 'Procedural Sedation and Patient Preparation',
      description: 'Provide appropriate sedation and prepare patient for electrical cardioversion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Ensure IV access with patent large-bore IV catheter',
        'Administer procedural sedation: midazolam 0.1-0.2mg/kg IV or etomidate 0.3mg/kg',
        'Monitor airway, breathing, and circulation during sedation',
        'Ensure adequate sedation depth but maintain respiratory drive',
        'Have airway management equipment immediately available',
        'Position patient supine with slight head elevation',
        'Remove any metallic objects or jewelry from chest area',
        'Ensure oxygen delivery via nasal cannula or face mask'
      ],
      contraindications: [
        'Allergy to sedation medications',
        'Significant airway compromise or respiratory failure',
        'Hemodynamic instability requiring immediate cardioversion without sedation'
      ],
      safetyNotes: [
        'Sedation increases airway management risk - have BVM ready',
        'Unstable patients may require cardioversion with minimal or no sedation',
        'Monitor oxygen saturation and respiratory status continuously'
      ],
      equipmentNeeded: [
        'Procedural sedation medications (midazolam, etomidate)',
        'IV access with large-bore catheter',
        'Bag-valve-mask and airway management equipment',
        'Oxygen delivery devices (nasal cannula, face mask)'
      ]
    },
    {
      id: 'cardioversion-step-4',
      stepNumber: 4,
      title: 'Energy Level Selection and Programming',
      description: 'Select appropriate energy levels based on specific arrhythmia type and clinical guidelines',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'SVT/Atrial flutter: Start with 50-100J, increase to 200J if unsuccessful',
        'Atrial fibrillation: Start with 120-200J, increase stepwise to maximum',
        'Monomorphic VT: Start with 100J, increase to 200J then maximum if needed',
        'Polymorphic VT: Treat as VF with unsynchronized high-energy shocks',
        'Use biphasic energy levels (typically lower than monophasic requirements)',
        'Program defibrillator to selected energy level',
        'Verify sync mode remains active after energy selection',
        'Charge defibrillator only when ready to deliver shock'
      ],
      safetyNotes: [
        'Higher energy increases myocardial damage risk',
        'Start with lowest effective energy for specific arrhythmia',
        'Polymorphic VT requires immediate unsynchronized defibrillation'
      ],
      equipmentNeeded: [
        'Biphasic defibrillator with variable energy settings',
        'Current ACLS guidelines for energy recommendations',
        'Cardiac rhythm recognition references'
      ]
    },
    {
      id: 'cardioversion-step-5',
      stepNumber: 5,
      title: 'Synchronized Shock Delivery',
      description: 'Execute synchronized cardioversion with proper team coordination and safety protocols',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Ensure all team members are clear of patient and bed',
        'Announce "charging" and verify sync mode is still active',
        'Press and hold shock buttons simultaneously until discharge',
        'Wait for synchronization - shock will be delayed until next R-wave',
        'Observe for successful rhythm conversion on monitor',
        'Check pulse and blood pressure immediately after shock',
        'Be prepared for potential rhythm changes including asystole or VF',
        'Document pre and post-cardioversion rhythms and patient response'
      ],
      safetyNotes: [
        'Synchronized shocks are delayed until R-wave detection',
        'Poor synchronization may prevent shock delivery',
        'Be prepared for immediate CPR if cardiac arrest results'
      ],
      equipmentNeeded: [
        'Charged defibrillator in synchronization mode',
        'Clear verbal communication with team',
        'Immediate access to cardiac monitoring',
        'CPR equipment ready for complications'
      ]
    },
    {
      id: 'cardioversion-step-6',
      stepNumber: 6,
      title: 'Post-Cardioversion Assessment and Monitoring',
      description: 'Monitor patient response and manage potential complications after cardioversion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Assess rhythm conversion and hemodynamic improvement',
        'Check blood pressure, pulse, and oxygen saturation',
        'Monitor for return of effective cardiac output and perfusion',
        'Obtain post-cardioversion 12-lead ECG for documentation',
        'Assess consciousness level and neurological function',
        'Monitor for complications: arrhythmias, hypotension, respiratory depression',
        'Check for skin burns at electrode sites',
        'Continue cardiac monitoring for rhythm stability'
      ],
      contraindications: [
        'Do not delay treatment of life-threatening complications',
        'Avoid repeated cardioversion attempts without addressing underlying causes'
      ],
      safetyNotes: [
        'Arrhythmias may recur requiring additional treatment',
        'Sedation effects may persist requiring airway monitoring',
        'Hypotension may occur requiring fluid or vasopressor support'
      ],
      equipmentNeeded: [
        '12-lead ECG machine for post-procedure documentation',
        'Continuous cardiac and hemodynamic monitoring',
        'Medications for complication management',
        'Airway management equipment during sedation recovery'
      ]
    },
    {
      id: 'cardioversion-step-7',
      stepNumber: 7,
      title: 'Complication Management and Additional Interventions',
      description: 'Recognize and manage complications, provide additional therapy as needed',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'If unsuccessful: increase energy level and repeat cardioversion attempt',
        'Manage bradycardia with atropine 0.5mg IV or transcutaneous pacing',
        'Treat hypotension with IV fluids, dopamine, or norepinephrine',
        'Address recurrent tachyarrhythmias with antiarrhythmic medications',
        'Provide respiratory support if sedation-related depression occurs',
        'Treat skin burns with appropriate wound care',
        'Consider underlying causes: electrolyte imbalances, drug toxicity',
        'Consult cardiology for persistent or recurrent arrhythmias'
      ],
      safetyNotes: [
        'Multiple cardioversion attempts increase myocardial injury risk',
        'Bradycardia post-cardioversion may be severe and symptomatic',
        'Have emergency medications and equipment immediately available'
      ],
      equipmentNeeded: [
        'Emergency cardiac medications (atropine, dopamine, amiodarone)',
        'Transcutaneous pacing capability',
        'Airway management and respiratory support equipment',
        'Wound care supplies for electrode burns'
      ]
    },
    {
      id: 'cardioversion-step-8',
      stepNumber: 8,
      title: 'Documentation and Post-Procedure Care',
      description: 'Complete documentation and arrange appropriate post-cardioversion monitoring and care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Document pre-cardioversion rhythm, energy levels used, and outcomes',
        'Record patient hemodynamic response and any complications',
        'Note sedation medications used and recovery status',
        'Obtain serial 12-lead ECGs to monitor rhythm stability',
        'Continue cardiac monitoring for minimum 4-6 hours post-procedure',
        'Arrange cardiology consultation for underlying arrhythmia management',
        'Educate patient about procedure and post-cardioversion expectations',
        'Plan anticoagulation therapy if atrial fibrillation was present >48 hours'
      ],
      safetyNotes: [
        'Arrhythmia recurrence common - extended monitoring essential',
        'Anticoagulation decisions require careful risk-benefit assessment',
        'Follow-up care important for long-term arrhythmia management'
      ],
      equipmentNeeded: [
        'Documentation materials and procedure forms',
        'Extended cardiac monitoring capability',
        'Communication equipment for cardiology consultation',
        'Patient education materials about cardioversion'
      ]
    }
  ],

  'synchronized-cardioversion': {
    name: 'Synchronized Cardioversion',
    category: 'cardiac',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 25,
    isCritical: true,
    objectives: [
      'Assess patient hemodynamic status and identify unstable tachyarrhythmias requiring cardioversion',
      'Demonstrate proper equipment preparation including defibrillator setup and synchronization verification',
      'Provide appropriate procedural sedation and patient preparation for electrical cardioversion',
      'Select correct energy levels based on specific arrhythmia type and clinical guidelines',
      'Execute synchronized shock delivery with proper team coordination and safety protocols',
      'Monitor post-cardioversion response and manage potential complications effectively',
      'Plan appropriate post-procedure care and transport for continued cardiac monitoring'
    ],
    indications: [
      'Unstable supraventricular tachycardia with hemodynamic compromise and failed medical therapy',
      'Unstable atrial fibrillation or atrial flutter with rapid ventricular response causing instability',
      'Stable monomorphic ventricular tachycardia unresponsive to antiarrhythmic medications',
      'Any tachyarrhythmia >150 bpm causing chest pain, dyspnea, hypotension, or altered mental status',
      'Hemodynamically significant tachyarrhythmia in patients intolerant of rate control medications'
    ],
    contraindications: [
      'Hemodynamically stable patient with well-tolerated tachyarrhythmia responsive to medications',
      'Digitalis toxicity suspected (risk of precipitating life-threatening ventricular arrhythmias)',
      'Multifocal atrial tachycardia (rarely responds to electrical cardioversion)',
      'Sinus tachycardia (treat underlying physiological cause, not the rhythm itself)',
      'Lack of appropriate sedation capability or airway management resources'
    ],
    equipment: [
      'Biphasic defibrillator with reliable synchronization mode and R-wave detection',
      'Defibrillator electrode pads for anteroposterior or anterolateral placement',
      'Procedural sedation medications (midazolam, etomidate, or propofol)',
      'Emergency cardiac medications (atropine, dopamine, epinephrine, amiodarone)',
      'Bag-valve-mask device with high-flow oxygen capability and reservoir',
      'Secure IV access materials and isotonic fluid resuscitation capabilities',
      'Transcutaneous pacing equipment for post-cardioversion bradycardia management',
      'Advanced airway management equipment and continuous cardiac monitoring'
    ]
  },

  // 32. TRANSCUTANEOUS PACING - Evidence-based external cardiac pacing technique
  'transcutaneous-pacing': [
    {
      id: 'pacing-step-1',
      stepNumber: 1,
      title: 'Bradycardia Assessment and Pacing Indication',
      description: 'Assess bradycardia severity and confirm indication for transcutaneous pacing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Identify heart rate <60 bpm with signs of hemodynamic compromise',
        'Assess symptoms: chest pain, dyspnea, hypotension, altered mental status',
        'Check blood pressure and perfusion indicators',
        'Obtain 12-lead ECG to identify specific bradycardia type',
        'Rule out reversible causes: hypothermia, drug toxicity, electrolyte imbalances',
        'Assess response to atropine 0.5mg IV (may repeat up to 3mg total)',
        'Identify high-risk bradyarrhythmias requiring immediate pacing',
        'Document baseline vital signs and neurological status'
      ],
      contraindications: [
        'Asymptomatic bradycardia with adequate perfusion',
        'Bradycardia responsive to atropine or reversible causes',
        'Hypothermic bradycardia (may be physiologically appropriate)'
      ],
      safetyNotes: [
        'Symptomatic bradycardia requires rapid intervention',
        'Atropine may be ineffective in complete heart block',
        'High-degree AV blocks often require pacing regardless of rate'
      ],
      equipmentNeeded: [
        '12-lead ECG machine for rhythm identification',
        'Continuous cardiac monitoring equipment',
        'Atropine for initial medical therapy',
        'Blood pressure monitoring devices'
      ]
    },
    {
      id: 'pacing-step-2',
      stepNumber: 2,
      title: 'Equipment Setup and Patient Preparation',
      description: 'Prepare transcutaneous pacing equipment and position patient appropriately',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Set up defibrillator/monitor with transcutaneous pacing capability',
        'Ensure large pacing electrode pads are available and functional',
        'Position patient supine with adequate access to chest and back',
        'Explain procedure to conscious patient and provide anxiolysis if needed',
        'Establish secure IV access for medications and sedation',
        'Have emergency medications ready: atropine, dopamine, midazolam',
        'Ensure continuous cardiac monitoring and pulse oximetry',
        'Prepare for potential need for transvenous pacing or cardioversion'
      ],
      safetyNotes: [
        'Pacing can be uncomfortable for conscious patients',
        'Have sedation and analgesia readily available',
        'Ensure backup power and equipment availability'
      ],
      equipmentNeeded: [
        'Defibrillator/monitor with transcutaneous pacing function',
        'Large transcutaneous pacing electrode pads',
        'IV access with emergency medications',
        'Sedation medications (midazolam, fentanyl)'
      ]
    },
    {
      id: 'pacing-step-3',
      stepNumber: 3,
      title: 'Electrode Pad Placement and Positioning',
      description: 'Apply pacing electrodes in optimal positions for effective cardiac capture',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Use anteroposterior placement for optimal pacing efficiency',
        'Place anterior pad over left precordium (V2-V6 area)',
        'Position posterior pad on back between left scapula and spine',
        'Ensure electrode pads have good skin contact with conductive gel',
        'Avoid placing pads over bony prominences or breast tissue',
        'Check that pads are within expiration date and properly adhesive',
        'Connect pacing cables to appropriate terminals (positive/negative)',
        'Verify electrode impedance is acceptable on pacing unit'
      ],
      safetyNotes: [
        'Poor electrode contact reduces pacing effectiveness',
        'Anteroposterior placement provides better capture than anterolateral',
        'Ensure pads do not overlap or touch each other'
      ],
      equipmentNeeded: [
        'Large transcutaneous pacing electrode pads (adult size)',
        'Conductive gel or pre-gelled electrode pads',
        'Razor for chest hair removal if necessary',
        'Alcohol prep pads for skin cleaning'
      ]
    },
    {
      id: 'pacing-step-4',
      stepNumber: 4,
      title: 'Pacing Parameter Settings and Initialization',
      description: 'Configure pacing rate and output settings for effective cardiac pacing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Set initial pacing rate 60-80 bpm depending on clinical needs',
        'Start with maximum output (usually 200mA) then decrease to find threshold',
        'Use demand mode (synchronous) to avoid competing with intrinsic rhythm',
        'Set pacing pulse width to maximum available (usually 40ms)',
        'Verify pacing mode is appropriate for rhythm disturbance',
        'Ensure sensitivity is set to detect patient\'s intrinsic QRS complexes',
        'Test pacing function before connecting to patient',
        'Document initial settings and verify equipment function'
      ],
      safetyNotes: [
        'Start with high output to ensure capture, then titrate down',
        'Demand mode prevents pacing during intrinsic beats',
        'Fixed mode may compete with patient rhythm causing R-on-T phenomenon'
      ],
      equipmentNeeded: [
        'Transcutaneous pacing unit with variable settings',
        'Rate and output adjustment controls',
        'Mode selection capability (demand vs fixed)',
        'Sensitivity adjustment controls'
      ]
    },
    {
      id: 'pacing-step-5',
      stepNumber: 5,
      title: 'Pacing Initiation and Capture Assessment',
      description: 'Initiate transcutaneous pacing and confirm electrical and mechanical capture',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Start pacing at maximum output and confirm electrical capture on monitor',
        'Look for wide QRS complex following each pacing spike',
        'Palpate pulse to confirm mechanical capture and adequate stroke volume',
        'Check blood pressure to ensure hemodynamic improvement',
        'Gradually decrease output until loss of capture, then increase by 10-20mA',
        'Set final output at 2x threshold or 10-20mA above threshold',
        'Monitor for consistent 1:1 capture ratio',
        'Assess patient comfort level and need for analgesia/sedation'
      ],
      safetyNotes: [
        'Electrical capture without mechanical capture provides no benefit',
        'Palpate pulse away from pacing electrodes to confirm mechanical capture',
        'Patient discomfort is common and may require sedation'
      ],
      equipmentNeeded: [
        'Pulse assessment capabilities (palpation or arterial monitoring)',
        'Blood pressure monitoring equipment',
        'Analgesic medications (fentanyl, morphine)',
        'Continuous cardiac rhythm monitoring'
      ]
    },
    {
      id: 'pacing-step-6',
      stepNumber: 6,
      title: 'Patient Comfort and Sedation Management',
      description: 'Provide appropriate analgesia and sedation for patient comfort during pacing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Assess patient pain and anxiety levels during pacing',
        'Administer analgesics: fentanyl 1-3mcg/kg IV or morphine 0.1mg/kg IV',
        'Provide anxiolysis with midazolam 0.05-0.1mg/kg IV titrated to effect',
        'Monitor respiratory status and airway patency during sedation',
        'Explain procedure and provide reassurance to conscious patients',
        'Position patient comfortably while maintaining electrode contact',
        'Monitor vital signs closely during sedation administration',
        'Have reversal agents available: naloxone and flumazenil'
      ],
      contraindications: [
        'Respiratory compromise or airway obstruction',
        'Hemodynamic instability precluding sedation',
        'Allergy to sedation medications'
      ],
      safetyNotes: [
        'Transcutaneous pacing is often painful requiring adequate analgesia',
        'Sedation may compromise respiratory drive - monitor closely',
        'Balance patient comfort with safety considerations'
      ],
      equipmentNeeded: [
        'Analgesic medications (fentanyl, morphine)',
        'Anxiolytic medications (midazolam)',
        'Reversal agents (naloxone, flumazenil)',
        'Continuous pulse oximetry and capnography'
      ]
    },
    {
      id: 'pacing-step-7',
      stepNumber: 7,
      title: 'Monitoring and Troubleshooting',
      description: 'Monitor pacing effectiveness and troubleshoot common pacing problems',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor for consistent electrical and mechanical capture',
        'Check electrode pad adhesion and skin contact regularly',
        'Watch for failure to pace: check connections, battery, electrode impedance',
        'Monitor for failure to capture: increase output, check electrode position',
        'Assess for undersensing: adjust sensitivity settings appropriately',
        'Watch for oversensing causing inappropriate pacing inhibition',
        'Monitor patient hemodynamic response and symptom improvement',
        'Check for complications: skin burns, muscle contractions, pneumothorax'
      ],
      safetyNotes: [
        'Loss of capture may occur with electrode displacement or battery failure',
        'High current output may cause uncomfortable muscle contractions',
        'Monitor electrode sites for skin irritation or burns'
      ],
      equipmentNeeded: [
        'Continuous cardiac and hemodynamic monitoring',
        'Backup pacing equipment and batteries',
        'Electrode replacement pads',
        'Emergency cardiac medications'
      ]
    },
    {
      id: 'pacing-step-8',
      stepNumber: 8,
      title: 'Transport Preparation and Definitive Care Planning',
      description: 'Prepare for transport and arrange definitive cardiac pacing or treatment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Ensure stable pacing parameters before transport',
        'Arrange transport to facility with cardiology and pacing capabilities',
        'Prepare for potential transvenous pacing placement',
        'Document pacing settings, thresholds, and patient response',
        'Brief receiving team on pacing parameters and patient status',
        'Ensure adequate battery life for transport duration',
        'Have backup pacing equipment available during transport',
        'Consider need for permanent pacemaker evaluation'
      ],
      safetyNotes: [
        'Transcutaneous pacing is temporary bridge to definitive therapy',
        'Equipment failure during transport can be life-threatening',
        'Maintain continuous monitoring throughout transport'
      ],
      equipmentNeeded: [
        'Portable pacing equipment with adequate battery life',
        'Backup pacing device and electrode pads',
        'Documentation materials for pacing parameters',
        'Communication equipment for receiving facility coordination'
      ]
    }
  ],

  'transcutaneous-pacing': {
    name: 'Transcutaneous Pacing',
    category: 'cardiac',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Assess patient hemodynamic status and identify symptomatic bradycardia requiring emergency pacing',
      'Demonstrate proper transcutaneous pacing equipment setup and electrode placement techniques',
      'Select appropriate initial pacing parameters and systematically achieve electrical and mechanical capture',
      'Manage patient comfort with appropriate sedation and analgesia during pacing procedure',
      'Monitor hemodynamic response to pacing and assess effectiveness of intervention',
      'Troubleshoot common pacing problems and manage complications effectively',
      'Coordinate transport and definitive care planning for continued cardiac pacing needs'
    ],
    indications: [
      'Symptomatic sinus bradycardia unresponsive to atropine with hemodynamic compromise',
      'Second-degree AV block type II (Mobitz II) causing hemodynamic instability',
      'Third-degree (complete) heart block with wide QRS escape rhythm and poor perfusion',
      'Bradycardia-dependent ventricular tachycardia or polymorphic ventricular tachycardia',
      'Severe bradycardia in cardiac arrest as bridge therapy to definitive management',
      'Post-cardioversion or post-defibrillation bradycardia causing hemodynamic compromise'
    ],
    contraindications: [
      'Asymptomatic bradycardia with stable hemodynamics and adequate perfusion',
      'Bradycardia secondary to hypothermia (treat underlying hypothermia first)',
      'Bradycardia caused by increased intracranial pressure (treat underlying cause)',
      'Terminal cardiac rhythm in end-stage disease with established poor prognosis',
      'Conscious patient unable to tolerate procedure without adequate sedation resources'
    ],
    equipment: [
      'Defibrillator/monitor with transcutaneous pacing capability and rate/current controls',
      'Large transcutaneous pacing electrodes (8-10cm) for anterior and posterior placement',
      'ECG monitoring leads and cables for rhythm assessment and capture verification',
      'Sedation and analgesia medications (midazolam, morphine, fentanyl)',
      'Emergency cardiac medications (atropine, epinephrine, dopamine, isoproterenol)',
      'IV access materials, isotonic fluids, and resuscitation equipment',
      'Backup transcutaneous pacing equipment and alternative pacing methods',
      'Continuous monitoring equipment for blood pressure, oxygen saturation, and cardiac rhythm'
    ]
  },

  'neonatal-resuscitation': {
    name: 'Neonatal Resuscitation',
    category: 'pediatric',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 15,
    isCritical: true,
    objectives: [
      'Perform rapid neonatal assessment using standardized evaluation criteria and initiate appropriate interventions',
      'Demonstrate proper neonatal resuscitation equipment preparation and team coordination',
      'Execute effective positive pressure ventilation using appropriate pressures and techniques for newborns',
      'Assess heart rate response and make appropriate decisions regarding escalation to chest compressions',
      'Perform coordinated neonatal CPR using correct compression-ventilation ratios and techniques',
      'Administer emergency medications with proper neonatal dosing and routes of administration',
      'Monitor neonatal response to interventions and provide ongoing specialized care',
      'Document resuscitation comprehensively and coordinate appropriate disposition and follow-up care'
    ],
    indications: [
      'Newborn not breathing or only gasping at birth despite initial stimulation and warming',
      'Heart rate less than 100 beats per minute at any point during newborn assessment',
      'Persistent central cyanosis despite adequate initial care and stimulation',
      'Poor muscle tone and lack of appropriate response to initial resuscitation efforts',
      'Preterm infant requiring immediate specialized resuscitation support and intervention',
      'Obvious signs of newborn distress including grunting, retractions, or severe cyanosis'
    ],
    contraindications: [
      'Vigorous newborn with good muscle tone, spontaneous crying, and heart rate >100 bpm',
      'Obvious signs of death including extreme prematurity with no detectable signs of life',
      'Severe congenital anomalies clearly incompatible with life and survival',
      'Confirmed intrauterine fetal death with no signs of life at delivery'
    ],
    equipment: [
      'Neonatal bag-mask ventilation device with pressure relief valve set at 40 cmH2O',
      'Face masks in multiple sizes (preemie, newborn, infant) for proper fit',
      'Suction equipment including bulb syringe and mechanical suction with appropriate catheters',
      'Pulse oximetry with neonatal sensor for continuous oxygen saturation monitoring',
      'Neonatal intubation equipment (ETT sizes 2.5-3.5mm, laryngoscope with size 0-1 blades)',
      'Emergency medications (epinephrine 1:10,000, normal saline for volume expansion)',
      'Radiant warmer and warming blankets for temperature management',
      'Vascular access equipment (umbilical catheter kit, intraosseous device)',
      'Timing device and stethoscope for accurate assessment and documentation'
    ]
  },

  'pediatric-cpr-defibrillator': {
    name: 'Pediatric CPR with Manual Defibrillator',
    category: 'pediatric',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 25,
    isCritical: true,
    objectives: [
      'Perform age-appropriate assessment and recognition of pediatric cardiac arrest',
      'Execute high-quality chest compressions using correct pediatric technique and depth',
      'Provide effective rescue breathing with appropriate ventilation volumes and rates',
      'Operate manual defibrillator safely with pediatric energy dosing protocols',
      'Recognize and treat pediatric shockable and non-shockable cardiac rhythms',
      'Apply pediatric advanced life support algorithms and medication dosing',
      'Provide comprehensive post-resuscitation care and family support',
      'Coordinate transport to pediatric-capable emergency facilities'
    ],
    indications: [
      'Pediatric patient (1-8 years) with cardiac arrest and no palpable pulse',
      'Ventricular fibrillation or pulseless ventricular tachycardia in children',
      'Asystole or pulseless electrical activity (PEA) in pediatric patients',
      'Respiratory arrest progressing to cardiac arrest in children',
      'Near-drowning incidents with cardiac arrest in pediatric patients',
      'Traumatic cardiac arrest in children requiring CPR and advanced support'
    ],
    contraindications: [
      'Obviously futile resuscitation (rigor mortis, dependent lividity)',
      'Valid do-not-resuscitate order with appropriate guardian consent',
      'Unsafe scene conditions preventing safe resuscitation efforts',
      'Severe trauma clearly incompatible with survival',
      'Terminal illness with family decision to withhold resuscitation'
    ],
    equipment: [
      'Manual defibrillator with pediatric energy capability and dose calculator',
      'Pediatric defibrillation pads (preferred) or appropriately sized adult pads',
      'Pediatric bag-valve-mask device with oxygen reservoir and flow meter',
      'Age-appropriate face masks and airway adjuncts (OPA, NPA)',
      'Pediatric IV/IO supplies with weight-based emergency medication dosing charts',
      'Continuous cardiac monitoring with pediatric electrode placement guides',
      'Pediatric emergency medications (epinephrine, amiodarone, atropine)',
      'Transport equipment suitable for pediatric patients and family accommodation'
    ]
  },

  'infant-cpr-defibrillator': {
    name: 'Infant CPR with Manual Defibrillator',
    category: 'pediatric',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 30,
    isCritical: true,
    objectives: [
      'Perform age-appropriate assessment and recognition of infant cardiac arrest',
      'Execute high-quality chest compressions using correct infant-specific technique',
      'Provide effective rescue breathing with appropriate ventilation volumes for infants',
      'Operate manual defibrillator safely with infant energy dosing protocols',
      'Recognize and treat infant cardiac rhythms (predominantly asystole/PEA)',
      'Apply infant advanced life support algorithms and weight-based medication dosing',
      'Provide comprehensive post-resuscitation care with family-centered approach',
      'Coordinate transport to pediatric emergency department with neonatal intensive care capability'
    ],
    indications: [
      'Infant patient (<1 year) with cardiac arrest and no palpable pulse',
      'Sudden infant death syndrome (SIDS) presentation requiring resuscitation',
      'Respiratory arrest progressing to cardiac arrest in infants',
      'Near-drowning incidents with cardiac arrest in infant patients',
      'Severe bradycardia (<60 bpm) unresponsive to ventilation and oxygenation',
      'Born-in-field neonates requiring advanced resuscitation support'
    ],
    contraindications: [
      'Obviously futile resuscitation (rigor mortis, dependent lividity, decomposition)',
      'Severe congenital anomalies clearly incompatible with life',
      'Valid do-not-resuscitate order with appropriate family/guardian consent',
      'Unsafe scene conditions preventing safe resuscitation efforts',
      'Terminal illness with family decision to provide comfort care only'
    ],
    equipment: [
      'Manual defibrillator with infant/pediatric energy capability and precise dosing controls',
      'Infant defibrillation pads (smallest available) with anterior-posterior placement capability',
      'Infant bag-valve-mask device with pressure relief valve and appropriate reservoir',
      'Infant face masks (size 00, 0) and airway adjuncts appropriate for age',
      'Infant IV/IO supplies with weight-based emergency medication reference guides',
      'Continuous cardiac monitoring with infant electrode sizes and placement guides',
      'Infant emergency medications (epinephrine, atropine) with precise dosing calculations',
      'Temperature control equipment and transport systems suitable for infant patients and family'
    ]
  },

  // 42. EXTERNAL JUGULAR VEIN CANNULATION - Evidence-based central venous access technique
  'external-jugular-cannulation': [
    {
      id: 'ejv-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Indication Confirmation',
      description: 'Assess patient condition and confirm indication for external jugular vein access',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess for failed peripheral IV attempts and urgent need for vascular access',
        'Evaluate patient hemodynamic status requiring immediate fluid resuscitation',
        'Check for need for emergency medication administration or blood sampling',
        'Assess neck anatomy and external jugular vein visibility',
        'Consider contraindications: neck trauma, infection, severe coagulopathy',
        'Evaluate patient positioning ability and cooperation level',
        'Document failed peripheral access attempts and clinical urgency',
        'Consider alternative access methods if EJV not suitable'
      ],
      contraindications: [
        'Suspected neck trauma or cervical spine injury',
        'Local infection or cellulitis over insertion site',
        'Severe coagulopathy or bleeding disorders'
      ],
      safetyNotes: [
        'EJV cannulation requires specific anatomical landmarks and patient positioning',
        'Consider risk-benefit ratio compared to peripheral or IO access',
        'Have backup access method available if EJV attempt fails'
      ],
      equipmentNeeded: [
        'IV catheter (14-16G for adults, appropriate size for pediatrics)',
        'Sterile gloves, antiseptic, and preparation materials',
        'Patient assessment tools and monitoring equipment',
        'Alternative vascular access equipment as backup'
      ]
    },
    {
      id: 'ejv-step-2',
      stepNumber: 2,
      title: 'Patient Positioning and Anatomical Landmark Identification',
      description: 'Position patient optimally and identify external jugular vein anatomical landmarks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Position patient in 15-30 degree Trendelenburg position',
        'Turn patient head away from insertion side to enhance vein visibility',
        'Identify external jugular vein running from angle of jaw to clavicle',
        'Use Valsalva maneuver or gentle neck compression to distend vein',
        'Palpate carotid artery to avoid inadvertent arterial puncture',
        'Mark optimal insertion point where vein is most prominent and accessible',
        'Ensure adequate lighting for clear visualization of vein',
        'Consider ultrasound guidance if available for vein identification'
      ],
      safetyNotes: [
        'Trendelenburg position helps distend neck veins for easier access',
        'Clear visualization of vein essential before attempting cannulation',
        'Avoid carotid artery which lies medial to external jugular vein'
      ],
      equipmentNeeded: [
        'Patient positioning equipment (bed with Trendelenburg capability)',
        'Adequate lighting or headlamp for visualization',
        'Ultrasound equipment if available for vein identification',
        'Skin marking pen for anatomical reference'
      ]
    },
    {
      id: 'ejv-step-3',
      stepNumber: 3,
      title: 'Sterile Preparation and Equipment Setup',
      description: 'Establish sterile field and prepare equipment for external jugular vein cannulation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Don sterile gloves and maintain sterile technique throughout procedure',
        'Clean insertion site with antiseptic solution in circular motions',
        'Allow antiseptic to dry completely for maximum antimicrobial effect',
        'Prepare IV catheter and ensure all components function properly',
        'Set up IV tubing and flush system with normal saline',
        'Have emergency medications readily available for complications',
        'Position all equipment for easy access during procedure',
        'Apply sterile drape around insertion site maintaining sterile field'
      ],
      safetyNotes: [
        'Sterile technique essential to prevent line-associated infections',
        'Complete antiseptic drying time important for bacterial reduction',
        'Have emergency equipment immediately available for complications'
      ],
      equipmentNeeded: [
        'Sterile gloves and antiseptic solution',
        'IV catheter with appropriate gauge and length',
        'IV tubing, normal saline flushes, and connection equipment',
        'Sterile drapes and emergency resuscitation equipment'
      ]
    },
    {
      id: 'ejv-step-4',
      stepNumber: 4,
      title: 'Vein Cannulation and Catheter Insertion',
      description: 'Insert IV catheter into external jugular vein using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Stabilize vein with non-dominant hand using gentle traction',
        'Insert catheter at 30-45 degree angle toward ipsilateral shoulder',
        'Advance catheter with bevel up watching for blood flashback',
        'Once flashback obtained, lower catheter angle and advance slightly',
        'Advance plastic catheter over needle into vein lumen',
        'Remove needle while maintaining catheter position in vein',
        'Immediately apply pressure to prevent air embolism',
        'Connect IV tubing quickly to prevent blood loss and air entry'
      ],
      safetyNotes: [
        'Risk of air embolism due to negative thoracic pressure in neck veins',
        'Maintain constant pressure over insertion site when system is open',
        'Gentle technique prevents vessel perforation or hematoma'
      ],
      equipmentNeeded: [
        'IV catheter with sharp needle for initial penetration',
        'IV tubing connected and primed for immediate connection',
        'Gauze and pressure materials for bleeding control',
        'Saline flush to confirm placement immediately'
      ]
    },
    {
      id: 'ejv-step-5',
      stepNumber: 5,
      title: 'Placement Confirmation and Patency Testing',
      description: 'Confirm proper catheter placement and test IV patency and function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Aspirate blood to confirm intravascular placement',
        'Flush catheter gently with normal saline to test patency',
        'Observe for easy flow without resistance or infiltration',
        'Check for swelling around insertion site indicating extravasation',
        'Confirm blood return with gentle aspiration after flushing',
        'Test IV flow rate by running saline at moderate rate',
        'Monitor patient for signs of discomfort or complications',
        'Document successful placement and catheter function'
      ],
      safetyNotes: [
        'Easy blood return and saline flow confirm proper intravascular placement',
        'Resistance to flushing may indicate catheter malposition',
        'Monitor for infiltration which can cause significant neck swelling'
      ],
      equipmentNeeded: [
        'Normal saline flushes in appropriate syringes',
        'IV fluid for flow rate testing',
        'Monitoring equipment for patient assessment',
        'Documentation materials for placement confirmation'
      ]
    },
    {
      id: 'ejv-step-6',
      stepNumber: 6,
      title: 'Catheter Securing and Dressing Application',
      description: 'Secure external jugular catheter and apply appropriate sterile dressing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Secure catheter with tape or commercial securing device',
        'Create strain relief loop to prevent accidental removal',
        'Apply sterile transparent dressing over insertion site',
        'Label IV site with date, time, and catheter size',
        'Secure IV tubing to prevent tension on catheter',
        'Position patient comfortably while maintaining catheter security',
        'Check that dressing does not restrict neck movement excessively',
        'Document catheter securement and dressing application'
      ],
      safetyNotes: [
        'Secure fixation essential due to high mobility of neck area',
        'Strain relief prevents catheter displacement with patient movement',
        'Transparent dressing allows visualization of insertion site'
      ],
      equipmentNeeded: [
        'Medical tape or commercial catheter securing devices',
        'Sterile transparent dressing materials',
        'IV tubing securement devices',
        'Labels for catheter identification and dating'
      ]
    },
    {
      id: 'ejv-step-7',
      stepNumber: 7,
      title: 'Complication Monitoring and Management',
      description: 'Monitor for complications and manage adverse events related to EJV cannulation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor for air embolism: sudden dyspnea, chest pain, cardiovascular collapse',
        'Watch for hematoma formation at insertion site',
        'Assess for arterial puncture: bright red blood, pulsatile flow',
        'Check for pneumothorax: decreased breath sounds, respiratory distress',
        'Monitor for catheter displacement or loss of patency',
        'Watch for signs of infection at insertion site',
        'Assess patient comfort and neck mobility',
        'Document any complications and interventions performed'
      ],
      safetyNotes: [
        'Air embolism can be fatal - position patient left lateral Trendelenburg if suspected',
        'Arterial puncture requires immediate pressure and monitoring',
        'Pneumothorax may require emergency needle decompression'
      ],
      equipmentNeeded: [
        'Continuous monitoring equipment for vital signs',
        'Emergency equipment for air embolism management',
        'Chest decompression equipment if available',
        'Materials for pressure application and bleeding control'
      ]
    },
    {
      id: 'ejv-step-8',
      stepNumber: 8,
      title: 'Transport Preparation and Handoff Communication',
      description: 'Prepare for transport and provide comprehensive handoff to receiving medical team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Ensure catheter security before patient movement or transport',
        'Document total procedure time and any complications encountered',
        'Verify IV patency and appropriate flow rate for transport',
        'Provide detailed report to receiving medical team about placement',
        'Include information about catheter size, insertion technique, and function',
        'Document any medications or fluids administered through catheter',
        'Plan for appropriate monitoring during transport',
        'Arrange for definitive vascular access evaluation at receiving facility'
      ],
      safetyNotes: [
        'EJV catheters may be less stable than other central access during transport',
        'Continuous monitoring essential due to complication risks',
        'Receiving team needs complete information for ongoing management'
      ],
      equipmentNeeded: [
        'Secure transport equipment compatible with IV access',
        'Documentation materials for comprehensive procedure record',
        'Communication equipment for detailed handoff report',
        'Monitoring equipment for continued patient assessment'
      ]
    }
  ],

  'external-jugular-cannulation': {
    name: 'External Jugular Vein Cannulation',
    category: 'als',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Assess patient suitability and identify anatomical landmarks for external jugular access',
      'Demonstrate sterile technique and proper equipment preparation for vascular access',
      'Position patient optimally to distend external jugular vein for visualization',
      'Perform safe venipuncture and catheter advancement using proper angle and technique',
      'Secure catheter appropriately and confirm correct placement with functional testing',
      'Monitor for complications and provide immediate management of adverse events',
      'Provide ongoing catheter care and prepare for safe transport',
      'Document procedure thoroughly and communicate effectively with receiving facility'
    ],
    indications: [
      'Difficult or impossible peripheral venous access in emergency situations',
      'Need for large-bore vascular access for fluid resuscitation or medication administration',
      'Shock states requiring rapid volume replacement when peripheral access fails',
      'Emergency medication administration when other routes unavailable',
      'Cardiac arrest situations requiring immediate vascular access',
      'Trauma patients requiring rapid fluid resuscitation with poor peripheral access'
    ],
    contraindications: [
      'Suspected or confirmed cervical spine injury requiring immobilization',
      'Penetrating neck trauma or expanding neck hematoma',
      'Previous neck surgery, radiation therapy, or anatomical abnormalities',
      'Severe coagulopathy or therapeutic anticoagulation',
      'Local infection or cellulitis overlying the insertion site',
      'Patient inability to cooperate with necessary positioning requirements'
    ],
    equipment: [
      'Large-bore IV catheter (14-16G preferred for adults)',
      'Sterile gloves, masks, and personal protective equipment',
      'Antiseptic solution (chlorhexidine 2% or povidone-iodine)',
      'Sterile drapes, gauze pads, and cotton swabs',
      'IV fluids, administration tubing, and flush syringes',
      'Local anesthetic (lidocaine 1%) with small gauge needles',
      'Suture material (3-0 or 4-0 nylon) for catheter securement',
      'Transparent dressing and medical tape for site protection'
    ]
  },

  // 33. TRANSPORT VENTILATOR - Evidence-based mechanical ventilation during transport
  'transport-ventilator': [
    {
      id: 'ventilator-step-1',
      stepNumber: 1,
      title: 'Ventilation Assessment and Transport Ventilator Indication',
      description: 'Assess patient ventilation needs and determine appropriate transport ventilator utilization',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess patient respiratory status and ventilation adequacy',
        'Evaluate for conditions requiring mechanical ventilation: respiratory failure, airway protection',
        'Check current manual ventilation effectiveness with BVM',
        'Assess transport duration and crew fatigue considerations',
        'Verify secure airway with endotracheal tube or supraglottic device',
        'Evaluate patient hemodynamic stability for ventilator transition',
        'Check for contraindications: pneumothorax, severe hemodynamic instability',
        'Determine appropriate ventilation strategy based on patient condition'
      ],
      contraindications: [
        'Untreated tension pneumothorax',
        'Severe hemodynamic instability requiring immediate manual ventilation control',
        'Equipment malfunction or inadequate transport ventilator capabilities'
      ],
      safetyNotes: [
        'Secure airway essential before transport ventilator use',
        'Manual ventilation may be preferred for short transports',
        'Have backup BVM immediately available at all times'
      ],
      equipmentNeeded: [
        'Functioning transport ventilator with appropriate settings',
        'Secure endotracheal tube or supraglottic airway device',
        'Pulse oximetry and capnography monitoring',
        'Backup BVM with oxygen supply'
      ]
    },
    {
      id: 'ventilator-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Safety Checks',
      description: 'Prepare transport ventilator and perform comprehensive safety and function checks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Perform ventilator self-test and calibration sequence',
        'Check oxygen supply connections and pressure levels',
        'Verify battery charge level and backup power capabilities',
        'Test all alarm systems: high pressure, low pressure, disconnect',
        'Ensure ventilator circuit is properly assembled and leak-free',
        'Check expiratory valve and PEEP valve function',
        'Verify humidification system function and water levels',
        'Test backup battery operation and charging system'
      ],
      safetyNotes: [
        'Complete equipment check essential before patient connection',
        'Have backup BVM ready in case of ventilator failure',
        'Ensure adequate oxygen supply for entire transport duration'
      ],
      equipmentNeeded: [
        'Transport ventilator with full battery charge',
        'Oxygen supply with adequate pressure and volume',
        'Ventilator circuit tubing and connections',
        'Humidification system and distilled water'
      ]
    },
    {
      id: 'ventilator-step-3',
      stepNumber: 3,
      title: 'Initial Ventilator Settings Configuration',
      description: 'Configure appropriate initial ventilator parameters based on patient condition and needs',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Set appropriate ventilation mode: Volume Control (VC) or Pressure Control (PC)',
        'Configure tidal volume: 6-8ml/kg ideal body weight for adults',
        'Set respiratory rate: 10-12 breaths/min adults, adjust for age in pediatrics',
        'Program PEEP: start with 5cmH2O, adjust based on oxygenation needs',
        'Set FiO2: start with current oxygen percentage, titrate to SpO2 >94%',
        'Configure inspiratory time: 1:2 to 1:3 I:E ratio typically',
        'Set pressure limits: 30-40cmH2O peak inspiratory pressure limit',
        'Program alarm parameters: appropriate high/low limits for patient'
      ],
      safetyNotes: [
        'Low tidal volume ventilation reduces ventilator-induced lung injury',
        'Excessive PEEP may compromise venous return and cardiac output',
        'High FiO2 may cause oxygen toxicity with prolonged use'
      ],
      equipmentNeeded: [
        'Transport ventilator with mode and parameter controls',
        'Patient weight/height for tidal volume calculations',
        'Current oxygen saturation and end-tidal CO2 readings',
        'Blood pressure monitoring for hemodynamic assessment'
      ]
    },
    {
      id: 'ventilator-step-4',
      stepNumber: 4,
      title: 'Patient Connection and Ventilator Transition',
      description: 'Safely transition patient from manual ventilation to transport ventilator',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Ensure patient is adequately pre-oxygenated with manual ventilation',
        'Connect ventilator circuit to patient airway during expiratory pause',
        'Initiate mechanical ventilation and immediately assess chest rise',
        'Monitor initial breath delivery and patient synchrony',
        'Check for adequate tidal volume delivery and minute ventilation',
        'Assess patient comfort and ventilator-patient synchrony',
        'Verify alarm settings are appropriate and functional',
        'Document baseline ventilator settings and patient response'
      ],
      safetyNotes: [
        'Minimize interruption in ventilation during connection',
        'Be prepared to return to manual ventilation if problems occur',
        'Monitor for immediate adverse effects: hypotension, desaturation'
      ],
      equipmentNeeded: [
        'Sterile ventilator circuit connections',
        'Continuous monitoring equipment',
        'BVM backup readily available',
        'Documentation materials for settings record'
      ]
    },
    {
      id: 'ventilator-step-5',
      stepNumber: 5,
      title: 'Ventilator Monitoring and Assessment',
      description: 'Continuously monitor ventilator function and patient response during transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 600,
      keyPoints: [
        'Monitor oxygen saturation continuously with pulse oximetry',
        'Assess end-tidal CO2 values and waveform capnography',
        'Check ventilator parameters: delivered volumes, pressures, rates',
        'Monitor patient vital signs: heart rate, blood pressure, temperature',
        'Assess breath sounds bilaterally for adequate ventilation',
        'Watch for signs of patient-ventilator dyssynchrony or fighting',
        'Monitor airway pressures for changes suggesting pneumothorax or obstruction',
        'Observe chest wall movement and respiratory effort'
      ],
      safetyNotes: [
        'Sudden changes in airway pressure may indicate pneumothorax',
        'Loss of ETCO2 waveform suggests airway displacement or obstruction',
        'Patient agitation may indicate inadequate ventilation or pain'
      ],
      equipmentNeeded: [
        'Continuous pulse oximetry and capnography',
        'Stethoscope for breath sound assessment',
        'Blood pressure monitoring equipment',
        'Ventilator monitoring displays and alarms'
      ]
    },
    {
      id: 'ventilator-step-6',
      stepNumber: 6,
      title: 'Parameter Adjustment and Optimization',
      description: 'Adjust ventilator settings based on patient response and transport conditions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Titrate FiO2 to maintain SpO2 92-96% (88-92% for COPD patients)',
        'Adjust PEEP for optimal oxygenation while maintaining hemodynamic stability',
        'Modify respiratory rate to achieve appropriate ETCO2 (35-45mmHg)',
        'Fine-tune tidal volume if pressure limits exceeded or inadequate ventilation',
        'Adjust sensitivity settings if patient triggering issues occur',
        'Modify inspiratory time if I:E ratio optimization needed',
        'Consider sedation if patient-ventilator dyssynchrony persists',
        'Document all parameter changes and patient responses'
      ],
      safetyNotes: [
        'Make incremental changes and assess response before further adjustments',
        'Avoid excessive PEEP that may compromise cardiac output',
        'Monitor for ventilator-induced lung injury with high pressures'
      ],
      equipmentNeeded: [
        'Ventilator with adjustable parameters',
        'Arterial blood gas capabilities if available',
        'Sedation medications if indicated',
        'Documentation materials for parameter tracking'
      ]
    },
    {
      id: 'ventilator-step-7',
      stepNumber: 7,
      title: 'Alarm Management and Troubleshooting',
      description: 'Respond appropriately to ventilator alarms and troubleshoot common problems',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Respond immediately to high-priority alarms: apnea, disconnect, power failure',
        'Troubleshoot high pressure alarms: check for airway obstruction, pneumothorax',
        'Address low pressure alarms: verify connections, check for circuit leaks',
        'Manage low tidal volume alarms: assess for leaks, adjust sensitivity',
        'Handle power alarms: switch to backup battery, check power connections',
        'Respond to oxygen supply alarms: check O2 connections and tank levels',
        'Always have manual BVM immediately available for backup ventilation',
        'Document all alarms, causes identified, and corrective actions taken'
      ],
      safetyNotes: [
        'Patient safety takes precedence - use manual ventilation if uncertain',
        'Never ignore ventilator alarms - investigate and address all alerts',
        'Have backup BVM connected and ready for immediate use'
      ],
      equipmentNeeded: [
        'BVM with oxygen supply for backup ventilation',
        'Basic troubleshooting tools and spare parts',
        'Alternative oxygen supply sources',
        'Emergency airway management equipment'
      ]
    },
    {
      id: 'ventilator-step-8',
      stepNumber: 8,
      title: 'Handoff and Ventilator Transfer',
      description: 'Safely transfer patient and ventilator care to receiving medical team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Provide comprehensive report of ventilator settings and patient response',
        'Document total time on mechanical ventilation and any complications',
        'Transfer ventilator parameter log and alarm history to receiving team',
        'Assist with patient transfer to facility ventilator if needed',
        'Report any equipment issues or concerns to receiving staff',
        'Ensure continuity of ventilator parameters during facility transition',
        'Provide recommendations for ongoing ventilator management',
        'Complete transport documentation including ventilator usage record'
      ],
      safetyNotes: [
        'Maintain ventilator support until receiving team assumes care',
        'Ensure smooth transition to avoid interruption in mechanical ventilation',
        'Verify receiving facility capability to continue ventilator support'
      ],
      equipmentNeeded: [
        'Complete ventilator documentation and parameter logs',
        'Communication equipment for detailed handoff report',
        'Patient transfer equipment compatible with ventilator',
        'Backup manual ventilation during transition period'
      ]
    }
  ],

  'transport-ventilator': {
    name: 'Use of Transport Ventilator',
    category: 'airway',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 30,
    isCritical: true,
    objectives: [
      'Assess patient suitability for mechanical ventilation and determine appropriate indications',
      'Perform comprehensive equipment setup and safety checks on transport ventilator',
      'Configure initial ventilator parameters using lung protective ventilation strategies',
      'Execute safe patient connection and transition from manual to mechanical ventilation',
      'Optimize ventilator settings based on patient response and physiological monitoring',
      'Provide continuous monitoring with appropriate alarm management and response',
      'Recognize and manage ventilator-related complications during transport',
      'Prepare for transport and provide comprehensive handover to receiving medical team'
    ],
    indications: [
      'Respiratory failure requiring mechanical ventilatory support during transport',
      'Patient with established advanced airway requiring long-distance transport',
      'Inadequate spontaneous ventilation with need for precise ventilatory control',
      'Post-cardiac arrest patients requiring controlled ventilation and oxygenation',
      'Severe respiratory compromise where manual ventilation is inadequate',
      'Need for consistent ventilatory support during extended transport times',
      'Patients requiring specific ventilatory parameters (PEEP, precise FiO2, tidal volumes)'
    ],
    contraindications: [
      'Unstable or inadequately secured airway without proper advanced airway device',
      'Untreated tension pneumothorax requiring immediate decompression',
      'Severe hemodynamic instability requiring immediate resuscitation',
      'Equipment malfunction or inadequate backup manual ventilation capability',
      'Transport team unfamiliar with specific ventilator operation and troubleshooting',
      'Inadequate oxygen supply or power source for anticipated transport duration'
    ],
    equipment: [
      'Transport ventilator with full range of ventilation modes and monitoring capabilities',
      'Patient ventilator circuit with appropriate size connections and humidification system',
      'Oxygen source with adequate supply for transport duration plus 50% reserve',
      'Backup manual bag-valve-mask device with oxygen reservoir and PEEP valve',
      'Continuous monitoring equipment including capnography and pulse oximetry',
      'Backup power sources including charged batteries and vehicle power adapters',
      'Suction equipment with multiple catheter sizes for airway management',
      'Emergency equipment including needle decompression kit and emergency medications'
    ]
  },

  // 34. UMBILICAL VEIN CANNULATION - Evidence-based neonatal vascular access technique
  'umbilical-vein-cannulation': [
    {
      id: 'uvc-step-1',
      stepNumber: 1,
      title: 'Neonatal Assessment and UVC Indication Determination',
      description: 'Assess newborn condition and confirm indication for umbilical venous catheter insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess newborn for critical conditions requiring immediate vascular access',
        'Evaluate for severe bradycardia <60 bpm unresponsive to ventilation and compressions',
        'Check for need for emergency medications: epinephrine, volume expanders',
        'Assess umbilical cord for suitability: fresh cord (<7 days old optimal)',
        'Verify failed attempts at peripheral IV access in unstable neonate',
        'Consider for prolonged resuscitation requiring reliable vascular access',
        'Assess for contraindications: omphalocele, gastroschisis, necrotizing enterocolitis',
        'Determine urgency level: emergent vs semi-elective insertion'
      ],
      contraindications: [
        'Omphalocele or gastroschisis with abdominal wall defects',
        'Signs of necrotizing enterocolitis or abdominal infection',
        'Umbilical cord older than 7-14 days (relative contraindication)'
      ],
      safetyNotes: [
        'UVC insertion is critical skill for neonatal resuscitation',
        'Fresh umbilical cord allows easier catheter insertion',
        'Alternative access (IO) should be considered if UVC not feasible'
      ],
      equipmentNeeded: [
        'Neonatal resuscitation equipment and monitoring',
        'Umbilical catheterization tray with sterile instruments',
        'Assessment tools for newborn evaluation',
        'Alternative vascular access equipment (IO needles)'
      ]
    },
    {
      id: 'uvc-step-2',
      stepNumber: 2,
      title: 'Sterile Preparation and Equipment Setup',
      description: 'Establish sterile field and prepare equipment for umbilical venous catheter insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Open sterile umbilical catheter tray maintaining sterile technique',
        'Select appropriate catheter size: 3.5Fr for premature, 5Fr for term infants',
        'Prepare 3-way stopcock and flush system with normal saline',
        'Set up sterile draping and create adequate sterile field around umbilicus',
        'Don sterile gloves and gown following strict sterile precautions',
        'Prepare umbilical tape or suture material for securing catheter',
        'Have emergency medications drawn up: epinephrine 1:10,000 concentration',
        'Ensure adequate lighting and positioning for optimal visualization'
      ],
      safetyNotes: [
        'Strict sterile technique essential to prevent line-associated infections',
        'Proper catheter size selection critical for successful insertion',
        'Have emergency resuscitation equipment immediately available'
      ],
      equipmentNeeded: [
        'Sterile umbilical catheter (3.5Fr or 5Fr)',
        '3-way stopcock and normal saline flushes',
        'Sterile drapes, gloves, and gown',
        'Umbilical tape or suture material for securing'
      ]
    },
    {
      id: 'uvc-step-3',
      stepNumber: 3,
      title: 'Umbilical Cord Preparation and Vessel Identification',
      description: 'Prepare umbilical stump and identify umbilical vein for catheter insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Clean umbilical area with antiseptic solution (chlorhexidine or povidone-iodine)',
        'Cut umbilical cord with sterile scissors leaving 1-2cm stump',
        'Identify umbilical vein: single large, thin-walled, oval opening',
        'Distinguish from umbilical arteries: two smaller, thick-walled, round openings',
        'Remove any clots or debris from umbilical vein opening',
        'Gently dilate vein opening with small forceps if needed',
        'Ensure vein opening is clearly visible and accessible',
        'Place umbilical tape around base of cord for hemostasis if needed'
      ],
      safetyNotes: [
        'Umbilical vein is larger and thin-walled compared to arteries',
        'Gentle technique prevents vessel damage and bleeding',
        'Adequate stump length essential for secure catheter placement'
      ],
      equipmentNeeded: [
        'Antiseptic solution for cord preparation',
        'Sterile scissors for cord cutting',
        'Small forceps for vessel manipulation',
        'Umbilical tape for hemostasis control'
      ]
    },
    {
      id: 'uvc-step-4',
      stepNumber: 4,
      title: 'Umbilical Venous Catheter Insertion',
      description: 'Insert umbilical venous catheter using sterile technique and appropriate depth',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Flush catheter with normal saline before insertion to remove air',
        'Insert catheter into umbilical vein opening using gentle pressure',
        'Advance catheter slowly until blood return is obtained',
        'For emergency use: insert 2-4cm until blood flows freely',
        'For optimal position: calculate insertion depth using shoulder-umbilicus length',
        'Target depth formula: (shoulder to umbilicus distance × 0.6) + 1cm',
        'Stop advancing if resistance encountered to avoid perforation',
        'Confirm blood return with gentle aspiration through stopcock'
      ],
      safetyNotes: [
        'Gentle insertion technique prevents vessel perforation',
        'Too deep insertion may cause cardiac arrhythmias or liver injury',
        'Blood return confirms intravascular placement'
      ],
      equipmentNeeded: [
        'Umbilical venous catheter with 3-way stopcock',
        'Normal saline flushes for catheter priming',
        'Measuring tape for insertion depth calculation',
        'Gentle insertion technique and patience'
      ]
    },
    {
      id: 'uvc-step-5',
      stepNumber: 5,
      title: 'Catheter Position Confirmation and Security',
      description: 'Confirm proper catheter placement and secure device to prevent dislodgement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Aspirate blood to confirm intravascular placement',
        'Check that blood flows freely without excessive pressure',
        'Flush catheter gently with small amount of normal saline',
        'Secure catheter at skin level with umbilical tape or suture',
        'Create strain relief loop to prevent accidental removal',
        'Apply sterile transparent dressing over insertion site',
        'Mark catheter depth at skin level for position reference',
        'Connect to appropriate IV fluids or medication infusion system'
      ],
      safetyNotes: [
        'Secure fixation essential to prevent accidental catheter removal',
        'Avoid excessive flushing which may cause fluid overload',
        'Monitor insertion site for bleeding or hematoma formation'
      ],
      equipmentNeeded: [
        'Umbilical tape or fine suture material',
        'Sterile transparent dressing materials',
        'Normal saline flushes for patency testing',
        'IV connection tubing and fluids'
      ]
    },
    {
      id: 'uvc-step-6',
      stepNumber: 6,
      title: 'Emergency Medication Administration',
      description: 'Safely administer emergency medications through umbilical venous catheter',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Verify catheter patency before medication administration',
        'Administer epinephrine: 0.1-0.3ml/kg of 1:10,000 concentration IV',
        'Follow medication with normal saline flush to ensure delivery',
        'Monitor heart rate response to epinephrine administration',
        'Repeat epinephrine every 3-5 minutes if bradycardia persists',
        'Consider volume expansion: 10ml/kg normal saline if hypovolemia suspected',
        'Monitor for medication extravasation or infiltration',
        'Document all medications administered with times and doses'
      ],
      contraindications: [
        'Never administer medications through catheter with uncertain position',
        'Avoid rapid fluid boluses in premature infants without clear indication'
      ],
      safetyNotes: [
        'Confirm catheter position before any medication administration',
        'Use appropriate neonatal dosing calculations',
        'Monitor for fluid overload in small premature infants'
      ],
      equipmentNeeded: [
        'Epinephrine 1:10,000 concentration in appropriate syringes',
        'Normal saline flushes for medication delivery',
        'Volume expansion fluids (normal saline)',
        'Accurate dosing calculations and measurement tools'
      ]
    },
    {
      id: 'uvc-step-7',
      stepNumber: 7,
      title: 'Continuous Monitoring and Complication Assessment',
      description: 'Monitor newborn response and assess for umbilical catheter complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor heart rate, blood pressure, and oxygen saturation continuously',
        'Assess perfusion indicators: capillary refill, skin color, tone',
        'Watch for catheter complications: bleeding, hematoma, infection',
        'Monitor for cardiac arrhythmias suggesting catheter malposition',
        'Check for signs of air embolism: sudden deterioration, cardiac arrest',
        'Assess for thrombotic complications: decreased perfusion, cyanosis',
        'Monitor insertion site for signs of infection or inflammation',
        'Document catheter function and any complications observed'
      ],
      safetyNotes: [
        'Cardiac arrhythmias may indicate catheter tip in heart',
        'Air embolism is potentially fatal complication requiring immediate treatment',
        'Thrombotic complications may cause serious perfusion problems'
      ],
      equipmentNeeded: [
        'Continuous cardiac and oxygen saturation monitoring',
        'Blood pressure monitoring appropriate for neonates',
        'Equipment for complication management',
        'Documentation materials for ongoing assessment'
      ]
    },
    {
      id: 'uvc-step-8',
      stepNumber: 8,
      title: 'Transport Preparation and Handoff',
      description: 'Prepare for transport and provide comprehensive handoff to receiving neonatal team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Ensure catheter is securely fixed before transport',
        'Document catheter insertion depth, position, and function',
        'Prepare comprehensive report including insertion details and complications',
        'Verify catheter patency and appropriate IV flow rates',
        'Brief receiving NICU team on catheter placement and medications given',
        'Provide recommendations for catheter position confirmation (chest x-ray)',
        'Document total resuscitation time and newborn response',
        'Arrange for definitive catheter position verification at receiving facility'
      ],
      safetyNotes: [
        'Umbilical catheters are temporary emergency access devices',
        'Definitive position confirmation with imaging recommended',
        'Receiving facility should plan for catheter management or replacement'
      ],
      equipmentNeeded: [
        'Secure catheter fixation and dressing materials',
        'Complete documentation of insertion procedure',
        'Communication equipment for comprehensive handoff',
        'Transport equipment compatible with umbilical catheter'
      ]
    }
  ],

  'umbilical-vein-cannulation': {
    name: 'Umbilical Vein Cannulation',
    category: 'pediatric',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 25,
    isCritical: true,
    objectives: [
      'Assess newborn condition and determine appropriate indications for umbilical vein cannulation',
      'Demonstrate sterile technique and proper equipment preparation for neonatal vascular access',
      'Identify anatomical landmarks and prepare umbilical cord stump for vessel cannulation',
      'Insert umbilical catheter safely and advance to appropriate depth using proper technique',
      'Confirm correct catheter position and secure appropriately to prevent complications',
      'Test catheter function and initiate emergency medications or fluid therapy',
      'Monitor for complications and provide immediate management of adverse events',
      'Prepare for transport and provide comprehensive handover to neonatal intensive care team'
    ],
    indications: [
      'Emergency vascular access in critically ill newborns requiring immediate intervention',
      'Administration of emergency medications including epinephrine and volume expanders',
      'Severe neonatal resuscitation when other vascular access routes unsuccessful',
      'Need for rapid fluid resuscitation in newborns with shock or severe dehydration',
      'Exchange transfusion or blood sampling in neonates with severe complications',
      'Central venous access in newborns when peripheral access impossible',
      'Born-in-field deliveries requiring advanced neonatal life support interventions'
    ],
    contraindications: [
      'Omphalitis or active umbilical cord infection with surrounding cellulitis',
      'Significant abdominal wall defects including omphalocele or gastroschisis',
      'Necrotizing enterocolitis with abdominal distention and bowel compromise',
      'Suspected congenital vascular anomalies or portal hypertension',
      'Peritonitis or intra-abdominal contamination requiring surgical intervention',
      'Umbilical cord stump too old (>48-72 hours) with vessel closure or sclerosis'
    ],
    equipment: [
      'Sterile umbilical catheter (3.5Fr for infants <1.5kg, 5Fr for infants >1.5kg)',
      'Sterile umbilical catheter tray including forceps, scissors, and scalpel (#11 blade)',
      'Sterile gloves, gown, drapes, and antiseptic solution (povidone-iodine)',
      'Umbilical tape or silk ties for hemostasis and catheter securement',
      'Heparinized saline flush solution (1 unit heparin per mL normal saline)',
      'Three-way stopcock, extension tubing, and appropriate IV connectors',
      'Radiant warmer or incubator for temperature control during procedure',
      'Emergency neonatal resuscitation equipment including medications and monitoring devices'
    ]
  },

  'ez-io-distal-tibia': {
    name: 'EZ-IO Distal Tibia Insertion',
    category: 'als',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 15,
    isCritical: true,
    objectives: [
      'Assess patient condition and determine appropriate indications for intraosseous access',
      'Demonstrate proper equipment preparation and safety checks for EZ-IO device operation',
      'Identify correct anatomical landmarks for distal tibia intraosseous insertion',
      'Perform skin preparation and local anesthesia administration for conscious patients',
      'Execute safe needle insertion using proper EZ-IO technique and angulation',
      'Confirm correct needle placement through aspiration and flush testing',
      'Administer emergency medications through IO route with appropriate monitoring',
      'Provide ongoing care and plan for transition to definitive vascular access'
    ],
    indications: [
      'Failed peripheral venous access in emergency situations requiring immediate vascular access',
      'Cardiac arrest or severe shock requiring rapid medication administration',
      'Severe dehydration or hypovolemia requiring immediate fluid resuscitation',
      'Difficult venous access in pediatric patients over 40kg or elderly patients',
      'Emergency medication administration when peripheral IV access impossible or delayed',
      'Severe trauma patients requiring rapid vascular access for resuscitation',
      'Status epilepticus requiring immediate anticonvulsant medication administration'
    ],
    contraindications: [
      'Fracture at or proximal to the proposed insertion site',
      'Infection, cellulitis, burn, or other skin compromise at insertion site',
      'Previous orthopedic hardware, prosthetic implant, or surgical site at insertion location',
      'Suspected compartment syndrome in the affected extremity',
      'Previous intraosseous insertion at the same site within 48 hours',
      'Severe peripheral vascular disease affecting circulation to insertion site'
    ],
    equipment: [
      'EZ-IO driver with fully charged battery and power indicator verification',
      'EZ-IO needle sets with appropriate length selection (15mm, 25mm, or 45mm)',
      'Antiseptic solution (alcohol-based preferred) for skin preparation',
      'Local anesthetic (lidocaine 2%) with small gauge needles for conscious patients',
      'Normal saline flush syringes (10mL) for patency testing and medication delivery',
      'IV extension tubing, pressure bag, and standard IV administration equipment',
      'Sterile gauze pads, medical tape, and transparent dressing for site securement',
      'Sharps disposal container and backup manual intraosseous device for equipment failure'
    ]
  },

  // 39. C-SPINE CLEARANCE - Evidence-based cervical spine assessment and clearance protocol
  'c-spine-clearance': [
    {
      id: 'cspine-step-1',
      stepNumber: 1,
      title: 'Initial Trauma Assessment and C-Spine Risk Evaluation',
      description: 'Assess trauma mechanism and determine need for cervical spine immobilization and clearance',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Evaluate mechanism of injury: high-energy trauma, fall >3 feet, motor vehicle crash',
        'Assess for distracting injuries that may mask cervical spine pain',
        'Check patient consciousness level and ability to provide reliable history',
        'Identify high-risk factors: age >65, dangerous mechanism, neurological symptoms',
        'Evaluate for intoxication or altered mental status affecting assessment reliability',
        'Apply cervical spine immobilization if any risk factors present',
        'Document mechanism and initial assessment findings thoroughly',
        'Consider need for imaging based on clinical decision rules'
      ],
      contraindications: [
        'Do not attempt clearance in unconscious or altered mental status patients',
        'Avoid clearance attempts with obvious spinal deformity or neurological deficits',
        'Do not clear spine in presence of significant distracting injuries'
      ],
      safetyNotes: [
        'When in doubt, maintain spinal immobilization until definitive evaluation',
        'High-risk mechanisms require careful evaluation even without symptoms',
        'Patient reliability essential for clinical clearance'
      ],
      equipmentNeeded: [
        'Cervical collar and spinal immobilization equipment',
        'Trauma assessment tools and documentation materials',
        'Communication equipment for medical consultation if needed'
      ]
    },
    {
      id: 'cspine-step-2',
      stepNumber: 2,
      title: 'Clinical Decision Rule Application',
      description: 'Apply validated clinical decision rules (NEXUS or Canadian C-Spine Rule) for clearance assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'NEXUS criteria: No midline tenderness, no focal neurological deficit',
        'NEXUS continued: Normal alertness, no intoxication, no distracting injury',
        'Canadian C-Spine Rule: Age, mechanism, and ability to rotate neck 45° each direction',
        'Assess for dangerous mechanism: fall >1 meter, axial loading, high-speed MVC',
        'Check for simple rear-end MVC, sitting position in ED, ambulatory at scene',
        'Evaluate for delayed onset of neck pain or neurological symptoms',
        'Apply rule systematically without skipping components',
        'Document which rule was used and results of assessment'
      ],
      safetyNotes: [
        'Clinical rules validated for alert, cooperative patients only',
        'Both rules have high sensitivity for detecting significant injury',
        'When criteria not met, maintain immobilization'
      ],
      equipmentNeeded: [
        'Clinical decision rule reference cards or protocols',
        'Assessment tools for neurological examination',
        'Documentation materials for systematic recording'
      ]
    },
    {
      id: 'cspine-step-3',
      stepNumber: 3,
      title: 'Neurological Examination and Assessment',
      description: 'Perform comprehensive neurological examination to assess spinal cord function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Assess motor function in all extremities: grip strength, dorsiflexion, plantar flexion',
        'Test sensation to light touch and pinprick in dermatome distribution',
        'Evaluate deep tendon reflexes: biceps, triceps, patellar, Achilles',
        'Check for pathological reflexes: Babinski sign, clonus',
        'Assess proprioception and position sense in fingers and toes',
        'Test cranial nerve function if head injury suspected',
        'Document any asymmetry or abnormal findings systematically',
        'Repeat examination if patient condition changes'
      ],
      safetyNotes: [
        'Subtle neurological deficits may indicate spinal cord injury',
        'Document baseline function for monitoring progression',
        'Any abnormal findings require continued immobilization'
      ],
      equipmentNeeded: [
        'Neurological assessment tools (reflex hammer, pin, cotton)',
        'Documentation forms for systematic recording',
        'Good lighting for detailed examination'
      ]
    },
    {
      id: 'cspine-step-4',
      stepNumber: 4,
      title: 'Cervical Spine Palpation and Range of Motion',
      description: 'Perform systematic palpation and assess active range of motion if appropriate',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Palpate posterior cervical spine systematically from occiput to C7',
        'Check for point tenderness, muscle spasm, or step-off deformity',
        'Assess for midline cervical spine tenderness with gentle pressure',
        'If no tenderness: ask patient to slowly rotate head 45° each direction',
        'Assess flexion, extension, and lateral bending if rotation normal',
        'Stop immediately if patient reports pain or resistance',
        'Observe for protective muscle guarding during movement',
        'Document range of motion limitations or pain with movement'
      ],
      contraindications: [
        'Do not perform active range of motion with any cervical tenderness',
        'Avoid forced or passive range of motion testing',
        'Stop testing immediately if patient reports pain or neurological symptoms'
      ],
      safetyNotes: [
        'Patient-controlled active movement only - never force movement',
        'Any limitation or pain requires continued immobilization',
        'Muscle spasm may indicate underlying injury'
      ],
      equipmentNeeded: [
        'Systematic palpation technique',
        'Comfortable environment for range of motion testing',
        'Assistant to help position patient if needed'
      ]
    },
    {
      id: 'cspine-step-5',
      stepNumber: 5,
      title: 'Risk Factor Assessment and Clinical Correlation',
      description: 'Assess additional risk factors and correlate findings with clinical presentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Consider patient age >65 years as increased risk factor',
        'Assess for pre-existing spinal conditions: arthritis, stenosis, previous surgery',
        'Evaluate medication use: anticoagulants, muscle relaxants, pain medications',
        'Check for signs of intoxication affecting assessment reliability',
        'Assess for distracting injuries: fractures, lacerations, severe pain elsewhere',
        'Consider mechanism energy and forces involved in trauma',
        'Correlate all findings with clinical decision rule criteria',
        'Reassess if patient condition or complaints change'
      ],
      safetyNotes: [
        'Multiple risk factors increase likelihood of injury',
        'Age-related changes increase fracture risk with minor trauma',
        'Distracting injuries may mask cervical spine symptoms'
      ],
      equipmentNeeded: [
        'Patient history taking materials',
        'Risk assessment documentation tools',
        'Communication equipment for additional history from family/witnesses'
      ]
    },
    {
      id: 'cspine-step-6',
      stepNumber: 6,
      title: 'Clearance Decision and Immobilization Removal',
      description: 'Make evidence-based clearance decision and safely remove spinal immobilization if appropriate',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Review all assessment components systematically before clearance decision',
        'Ensure patient meets ALL criteria for clinical clearance',
        'If cleared: remove cervical collar and spinal immobilization carefully',
        'Monitor patient closely for several minutes after collar removal',
        'Reassess neurological function after immobilization removal',
        'Ask patient about any new symptoms or discomfort',
        'Document clearance rationale and assessment findings thoroughly',
        'If unable to clear: maintain immobilization and arrange imaging'
      ],
      contraindications: [
        'Do not clear if any assessment component is abnormal',
        'Avoid clearance if patient reliability is questionable',
        'Do not remove immobilization if mechanism suggests high energy trauma'
      ],
      safetyNotes: [
        'When in doubt, do not clear - maintain immobilization',
        'Monitor patient after collar removal for delayed symptoms',
        'Have equipment ready to re-immobilize if symptoms develop'
      ],
      equipmentNeeded: [
        'Complete assessment documentation',
        'Equipment ready for re-immobilization if needed',
        'Continuous patient monitoring capability'
      ]
    },
    {
      id: 'cspine-step-7',
      stepNumber: 7,
      title: 'Post-Clearance Monitoring and Patient Education',
      description: 'Monitor patient after clearance and provide education about warning signs',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Monitor patient for 15-30 minutes after collar removal',
        'Reassess neurological function periodically during observation',
        'Ask patient about development of neck pain, stiffness, or neurological symptoms',
        'Educate patient about delayed-onset symptoms requiring medical attention',
        'Provide instructions for activity limitations and warning signs',
        'Explain when to seek immediate medical care for new symptoms',
        'Document patient understanding of post-clearance instructions',
        'Arrange appropriate follow-up if any concerns arise'
      ],
      safetyNotes: [
        'Delayed symptoms may develop hours after initial injury',
        'Patient education critical for recognizing delayed complications',
        'Clear instructions prevent inappropriate delay in seeking care'
      ],
      equipmentNeeded: [
        'Patient monitoring equipment',
        'Educational materials about spinal injury warning signs',
        'Documentation materials for patient instructions'
      ]
    },
    {
      id: 'cspine-step-8',
      stepNumber: 8,
      title: 'Documentation and Medical Consultation',
      description: 'Complete comprehensive documentation and arrange appropriate medical consultation if needed',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Document all assessment components systematically and completely',
        'Record which clinical decision rule was used and specific findings',
        'Note any abnormal findings that prevented clearance',
        'Document patient education provided and understanding demonstrated',
        'If cleared: include rationale and post-clearance monitoring results',
        'If not cleared: document plan for imaging and continued immobilization',
        'Communicate findings to receiving physician or consulting specialist',
        'Ensure continuity of care with appropriate follow-up arrangements'
      ],
      safetyNotes: [
        'Thorough documentation protects patient and provider',
        'Clear communication essential for appropriate ongoing care',
        'Medical consultation recommended for complex cases'
      ],
      equipmentNeeded: [
        'Comprehensive documentation forms',
        'Communication equipment for medical consultation',
        'Patient care continuity materials and referral information'
      ]
    }
  ],

  'c-spine-clearance': {
    name: 'C-Spine Clearance',
    category: 'trauma',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Evaluate mechanism of injury and assess potential for cervical spine involvement',
      'Perform comprehensive neurological assessment to detect subtle deficits',
      'Apply validated clinical decision rules (NEXUS or Canadian C-Spine Rule) appropriately',
      'Conduct systematic physical examination of cervical spine and related structures',
      'Identify and assess distracting injuries that may mask cervical spine symptoms',
      'Make evidence-based clinical decisions regarding cervical spine clearance',
      'Provide appropriate ongoing monitoring and transport planning based on clearance status',
      'Document decision-making process clearly and communicate findings effectively'
    ],
    indications: [
      'Trauma patients with potential cervical spine injury requiring assessment for immobilization',
      'Patients with mechanism suggesting possible C-spine injury but low clinical suspicion',
      'Alert, cooperative patients without obvious neurological deficits',
      'Situations where clinical clearance may prevent unnecessary immobilization and imaging',
      'Patients meeting inclusion criteria for validated clinical decision rules',
      'Cases where transport time allows for thorough clinical assessment'
    ],
    contraindications: [
      'Altered level of consciousness (GCS <15) or inability to communicate reliably',
      'Obvious neurological deficits including weakness, numbness, or paralysis',
      'Severe intoxication from alcohol or drugs affecting pain perception and cooperation',
      'Distracting injuries causing significant pain that could mask cervical spine symptoms',
      'High-risk mechanism with unclear history or inability to assess mechanism accurately',
      'Age-related factors in elderly patients (>65 years) with any concerning mechanism',
      'Language barriers or cognitive impairment preventing reliable assessment and cooperation'
    ],
    equipment: [
      'Cervical collar in appropriate sizes for immobilization if clearance unsuccessful',
      'Spinal immobilization board or vacuum mattress for transport positioning',
      'Head blocks and securing straps for complete spinal immobilization system',
      'Neurological assessment tools including reflex hammer and sensory testing materials',
      'Documentation materials for recording assessment findings and decision rationale',
      'Clinical decision rule reference cards (NEXUS or Canadian C-Spine Rule)',
      'Communication equipment for consulting with medical direction if needed'
    ]
  },

  'management-prolapsed-cord': {
    name: 'Management of Prolapsed Cord',
    category: 'obstetric',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 30,
    isCritical: true,
    objectives: [
      'Recognize cord prolapse rapidly and assess fetal viability through cord pulsation evaluation',
      'Implement immediate cord protection measures to prevent vasospasm and maintain circulation',
      'Position mother appropriately using gravity to relieve cord compression',
      'Perform manual elevation of presenting part to decompress prolapsed umbilical cord',
      'Provide maternal oxygenation and supportive care during emergency management',
      'Coordinate rapid transport to facility capable of emergency cesarean delivery',
      'Maintain continuous monitoring and assessment of maternal and fetal status',
      'Prepare for emergency delivery and provide comprehensive handover to receiving team'
    ],
    indications: [
      'Visible or palpable umbilical cord at or beyond the cervix during labor',
      'Sudden fetal heart rate abnormalities suggesting cord compression',
      'Cord presentation identified during routine vaginal examination',
      'Rupture of membranes with immediate appearance of umbilical cord',
      'Occult cord prolapse with cord palpable alongside presenting part',
      'Any situation where umbilical cord precedes fetal presenting part through cervix'
    ],
    contraindications: [
      'Confirmed fetal demise prior to recognition of cord prolapse',
      'Non-viable fetus less than 24 weeks gestation with no chance of survival',
      'Maternal cardiac arrest requiring immediate maternal resuscitation as priority',
      'Complete cervical dilation with imminent delivery where intervention may cause delay'
    ],
    equipment: [
      'Sterile obstetric gloves and personal protective equipment',
      'Sterile gauze pads and warm sterile normal saline for cord protection',
      'High-flow oxygen delivery system and non-rebreather mask',
      'IV access supplies including large-bore catheters and isotonic fluids',
      'Fetal heart rate monitoring equipment if available for transport',
      'Complete obstetric emergency delivery kit including neonatal resuscitation supplies',
      'Communication equipment for immediate hospital notification and coordination',
      'Documentation materials for detailed timeline and intervention recording'
    ]
  },

  'carotid-sinus-massage': {
    name: 'Carotid Sinus Massage',
    category: 'cardiac',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Assess patient condition and verify appropriate indications for carotid sinus massage',
      'Establish comprehensive monitoring and prepare emergency equipment for potential complications',
      'Locate carotid pulse and assess for contraindications including bruits and vascular disease',
      'Perform carotid sinus massage using proper technique and appropriate pressure application',
      'Monitor cardiac rhythm continuously and assess patient response to vagal stimulation',
      'Recognize and manage complications including asystole, bradycardia, and neurological events',
      'Provide ongoing post-procedure monitoring and assessment for delayed complications',
      'Document procedure thoroughly and plan appropriate follow-up care and monitoring'
    ],
    indications: [
      'Stable supraventricular tachycardia (SVT) with narrow QRS complexes',
      'Regular tachycardia with heart rate greater than 150 beats per minute',
      'Hemodynamically stable patients with suspected re-entrant SVT',
      'AV nodal re-entrant tachycardia (AVNRT) or AV re-entrant tachycardia (AVRT)',
      'Failed response to other vagal maneuvers (Valsalva, ice water immersion)',
      'Situations where adenosine is contraindicated or unavailable for SVT treatment'
    ],
    contraindications: [
      'Presence of carotid bruits indicating significant carotid artery disease',
      'Known carotid stenosis, carotid artery disease, or previous carotid surgery',
      'Recent stroke or transient ischemic attack within the past 6 months',
      'Hemodynamically unstable patients requiring immediate electrical cardioversion',
      'Wide-complex tachycardia, ventricular tachycardia, or irregular rhythms',
      'Suspected digitalis toxicity or patients on digoxin with toxicity signs',
      'Elderly patients over 65 years with multiple cardiovascular risk factors'
    ],
    equipment: [
      'Continuous cardiac monitor with clear rhythm display and recording capability',
      'Defibrillator with transcutaneous pacing capability for emergency interventions',
      'Emergency medications including atropine 0.5-1.0 mg for bradycardia management',
      'IV access supplies and emergency vascular access equipment',
      'Stethoscope for carotid bruit assessment and ongoing cardiac monitoring',
      'Blood pressure monitoring equipment for hemodynamic assessment',
      'Complete airway management kit including suction and ventilation equipment',
      'Documentation materials and rhythm recording strips for comprehensive record keeping'
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

  'normal-childbirth-delivery': {
    name: 'Normal Childbirth - Pre-delivery and Delivery',
    category: 'obstetric',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 25,
    isCritical: true,
    objectives: [
      'Assess maternal condition and stage of labor to determine delivery imminence',
      'Prepare sterile field and delivery equipment using proper infection control',
      'Provide maternal positioning and emotional support throughout labor',
      'Manage controlled delivery of fetal head with perineal protection',
      'Execute safe shoulder and body delivery with proper technique',
      'Perform immediate neonatal assessment and resuscitation if needed',
      'Manage third stage of labor with placental delivery and hemorrhage control',
      'Provide comprehensive post-delivery care for mother and infant'
    ],
    indications: [
      'Imminent delivery with crowning or strong urge to push',
      'Labor progressing rapidly with insufficient time for hospital transport',
      'Precipitous labor in multiparous patients',
      'Emergency field delivery situations',
      'Normal spontaneous vaginal delivery without complications'
    ],
    contraindications: [
      'Significant antepartum hemorrhage',
      'Prolapsed umbilical cord',
      'Breech or abnormal presentation',
      'Multiple gestation with complications',
      'Placenta previa with bleeding',
      'Severe pre-eclampsia with active seizures'
    ],
    equipment: [
      'Sterile obstetric delivery kit',
      'Sterile gloves, towels, and draping materials',
      'Umbilical cord clamps and sterile scissors',
      'Bulb syringe and suction equipment',
      'Warm blankets and towels for infant warming',
      'Neonatal resuscitation equipment (bag-mask, oxygen)',
      'Plastic bags for placenta collection and transport',
      'Perineal irrigation supplies and hemostatic agents'
    ]
  },

  'prediction-difficult-intubation': {
    name: 'Prediction of Difficult Direct Endotracheal Intubation',
    category: 'airway',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 15,
    isCritical: true,
    objectives: [
      'Apply LEMON criteria systematically to assess airway difficulty',
      'Perform comprehensive physical examination of airway anatomy',
      'Gather relevant clinical history and assess complicating factors',
      'Classify intubation difficulty risk and develop appropriate strategy',
      'Prepare equipment and backup plans based on risk assessment',
      'Optimize patient positioning and conditions for first attempt',
      'Execute systematic approach to difficult airway management',
      'Implement alternative techniques and emergency management when needed'
    ],
    indications: [
      'Any patient requiring endotracheal intubation',
      'Pre-intubation assessment in emergency situations',
      'Elective intubation planning and preparation',
      'Rapid sequence intubation planning',
      'Assessment before sedation or anesthesia',
      'Training and skill development in airway assessment'
    ],
    contraindications: [
      'Life-threatening emergencies requiring immediate intubation',
      'Cannot intubate, cannot ventilate situations (assessment already complete)',
      'Situations where assessment would delay critical care'
    ],
    equipment: [
      'Multiple laryngoscope blades (Macintosh and Miller)',
      'Video laryngoscope if available',
      'Endotracheal tubes (multiple sizes)',
      'Bougie or intubating stylet',
      'Supraglottic airway devices (LMA, King)',
      'Surgical cricothyrotomy kit',
      'High-flow suction with large-bore catheter',
      'Capnography and pulse oximetry monitoring equipment'
    ]
  },

  'recovery-position': {
    name: 'Recovery Position',
    category: 'bls',
    difficultyLevel: 'BEGINNER' as const,
    timeEstimateMinutes: 5,
    isCritical: true,
    objectives: [
      'Assess patient appropriateness and rule out contraindications',
      'Prepare safe environment and gather necessary equipment',
      'Position patient correctly for safe lateral positioning',
      'Execute proper arm and hand positioning techniques',
      'Position legs appropriately for stable lateral position',
      'Perform controlled lateral rolling maneuver safely',
      'Adjust final position for optimal airway and stability',
      'Provide continuous monitoring and ongoing care'
    ],
    indications: [
      'Unconscious patient with spontaneous breathing',
      'Risk of airway compromise from secretions or vomit',
      'Need to maintain airway patency without advanced interventions',
      'Unconscious patient awaiting advanced medical care',
      'Post-seizure patients with altered consciousness',
      'Overdose patients with decreased consciousness but adequate breathing'
    ],
    contraindications: [
      'Suspected spinal injury or cervical spine trauma',
      'Respiratory arrest or inadequate spontaneous breathing',
      'Hemodynamic instability or shock',
      'Pregnancy beyond 20 weeks gestation',
      'Active vomiting requiring immediate suction',
      'Need for immediate advanced airway management or CPR'
    ],
    equipment: [
      'Suction equipment and catheters',
      'Pulse oximetry monitor',
      'Blood pressure monitoring equipment',
      'Pillows or padding for support and comfort',
      'Blankets for warmth and dignity',
      'Personal protective equipment (gloves)',
      'Emergency airway equipment nearby'
    ]
  },

  // 35. UPPER AIRWAY OBSTRUCTION WITH EQUIPMENT - Evidence-based choking management with tools
  'upper-airway-obstruction-equipment': [
    {
      id: 'airway-obstruction-step-1',
      stepNumber: 1,
      title: 'Rapid Airway Obstruction Assessment',
      description: 'Quickly assess severity of airway obstruction and determine appropriate intervention',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess patient consciousness level and ability to cough or speak',
        'Look for universal choking sign: hands to throat',
        'Evaluate air movement: complete vs partial obstruction',
        'Check for cyanosis around lips and fingertips',
        'Assess respiratory effort and use of accessory muscles',
        'Determine patient age group for appropriate technique selection',
        'Identify need for immediate intervention vs supportive care',
        'Call for additional help and prepare emergency equipment'
      ],
      contraindications: [
        'Do not perform blind finger sweeps in unconscious patients',
        'Avoid back blows in infants under 1 year in adult position'
      ],
      safetyNotes: [
        'Complete obstruction requires immediate intervention',
        'Partial obstruction with good air exchange may not need intervention',
        'Unconscious patients require different approach than conscious'
      ],
      equipmentNeeded: [
        'Personal protective equipment (gloves, face shield)',
        'Laryngoscope with appropriate blade sizes',
        'Magill forceps for foreign body removal',
        'Suction equipment with rigid catheter'
      ]
    },
    {
      id: 'airway-obstruction-step-2',
      stepNumber: 2,
      title: 'Conscious Patient Choking Management',
      description: 'Manage conscious choking patient using back blows and abdominal thrusts',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'For adults/children >1 year: alternate 5 back blows and 5 abdominal thrusts',
        'Back blows: lean patient forward, strike between shoulder blades with heel of hand',
        'Abdominal thrusts: hands below xiphoid, quick upward thrusts',
        'For infants <1 year: 5 back blows alternating with 5 chest thrusts',
        'Position infant face-down on forearm for back blows',
        'Use two fingers for chest thrusts on lower sternum',
        'Continue cycles until object is expelled or patient becomes unconscious',
        'Encourage patient to cough if partial obstruction with good air exchange'
      ],
      safetyNotes: [
        'Never use abdominal thrusts in infants - use chest thrusts instead',
        'Support infant head and neck during positioning',
        'Be prepared for patient to lose consciousness'
      ],
      equipmentNeeded: [
        'Proper positioning and body mechanics',
        'Clear area for patient movement',
        'Suction equipment ready for use'
      ]
    },
    {
      id: 'airway-obstruction-step-3',
      stepNumber: 3,
      title: 'Direct Laryngoscopy and Visualization',
      description: 'Use laryngoscope to visualize obstruction and assess for equipment-assisted removal',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position patient supine with head in sniffing position',
        'Insert laryngoscope blade along right side of tongue',
        'Lift laryngoscope handle to visualize vocal cords and upper airway',
        'Look for visible foreign body in oropharynx or larynx',
        'Assess size, shape, and position of obstructing object',
        'Determine if object is within reach of forceps removal',
        'Suction blood or secretions that may obscure visualization',
        'Maintain gentle traction without pushing object deeper'
      ],
      contraindications: [
        'Do not attempt forceps removal if object not clearly visible',
        'Avoid pushing object deeper into airway during manipulation'
      ],
      safetyNotes: [
        'Good visualization essential for safe foreign body removal',
        'Have backup plan ready if direct removal unsuccessful',
        'Limit laryngoscopy time to prevent hypoxia'
      ],
      equipmentNeeded: [
        'Laryngoscope handle with fresh batteries',
        'Appropriate laryngoscope blades (curved and straight)',
        'Suction equipment with rigid Yankauer catheter',
        'Good lighting and patient positioning'
      ]
    },
    {
      id: 'airway-obstruction-step-4',
      stepNumber: 4,
      title: 'Magill Forceps Foreign Body Removal',
      description: 'Use Magill forceps to safely remove visible foreign body under direct visualization',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Maintain laryngoscopy view while inserting Magill forceps',
        'Grasp foreign body with forceps tips using gentle, controlled pressure',
        'Avoid crushing soft or fragmented objects that may break apart',
        'Remove object with steady traction following natural airway curve',
        'Keep object in sight throughout removal process',
        'Be prepared to suction if bleeding or secretions occur',
        'Remove laryngoscope only after confirming object is fully extracted',
        'Check mouth and pharynx for additional foreign material'
      ],
      safetyNotes: [
        'Never use forceps blindly without direct visualization',
        'Gentle technique prevents object fragmentation',
        'Have suction immediately available for bleeding control'
      ],
      equipmentNeeded: [
        'Magill forceps (adult and pediatric sizes)',
        'Laryngoscope for continued visualization',
        'Suction equipment for bleeding or secretions',
        'Good lighting and steady hand positioning'
      ]
    },
    {
      id: 'airway-obstruction-step-5',
      stepNumber: 5,
      title: 'Suction-Assisted Airway Clearance',
      description: 'Use suction equipment to clear airway of blood, secretions, and small particles',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Use rigid suction catheter (Yankauer) for oropharyngeal suctioning',
        'Apply suction while withdrawing catheter to avoid tissue damage',
        'Suction mouth and pharynx systematically from side to side',
        'Clear blood and secretions that may obstruct visualization',
        'Use flexible suction catheter for nasopharyngeal suctioning if needed',
        'Monitor suction pressure to avoid mucosal trauma',
        'Limit suction time to 10-15 seconds to prevent hypoxia',
        'Provide supplemental oxygen between suctioning attempts'
      ],
      safetyNotes: [
        'Excessive suction pressure can cause airway trauma',
        'Prolonged suctioning may worsen hypoxia',
        'Monitor patient color and vital signs during suctioning'
      ],
      equipmentNeeded: [
        'Portable suction unit with adequate vacuum',
        'Rigid suction catheter (Yankauer)',
        'Flexible suction catheters in various sizes',
        'Suction tubing and collection canisters'
      ]
    },
    {
      id: 'airway-obstruction-step-6',
      stepNumber: 6,
      title: 'Alternative Airway Techniques',
      description: 'Use alternative techniques if standard foreign body removal unsuccessful',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Consider pushing object into right mainstem bronchus if removal impossible',
        'Attempt bag-valve-mask ventilation to move air past partial obstruction',
        'Use positive pressure ventilation to dislodge loosely positioned objects',
        'Consider supraglottic airway placement if object allows partial ventilation',
        'Prepare for emergency surgical airway if complete obstruction persists',
        'Use pediatric-specific techniques for infant/child patients',
        'Position patient to optimize gravity assistance in object movement',
        'Continue CPR if patient becomes unresponsive with cardiac arrest'
      ],
      contraindications: [
        'Do not push object deeper unless specifically indicated',
        'Avoid high-pressure ventilation that may cause barotrauma'
      ],
      safetyNotes: [
        'Pushing object into bronchus allows ventilation of one lung',
        'Emergency surgical airway may be required for complete obstruction',
        'Have emergency airway equipment immediately available'
      ],
      equipmentNeeded: [
        'Bag-valve-mask with oxygen supply',
        'Supraglottic airway devices',
        'Emergency surgical airway kit',
        'Advanced airway management equipment'
      ]
    },
    {
      id: 'airway-obstruction-step-7',
      stepNumber: 7,
      title: 'Post-Removal Assessment and Monitoring',
      description: 'Assess airway patency and monitor patient after successful foreign body removal',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Assess breathing adequacy and oxygen saturation immediately',
        'Listen for bilateral breath sounds and air movement',
        'Check for residual airway obstruction or swelling',
        'Monitor for laryngeal injury or bleeding complications',
        'Provide supplemental oxygen and support ventilation if needed',
        'Assess for aspiration of blood or foreign material',
        'Monitor vital signs and neurological status',
        'Document foreign body characteristics and removal technique used'
      ],
      safetyNotes: [
        'Airway swelling may develop after traumatic foreign body removal',
        'Aspiration risk remains high after choking episodes',
        'Monitor for delayed respiratory complications'
      ],
      equipmentNeeded: [
        'Pulse oximetry for oxygen saturation monitoring',
        'Supplemental oxygen delivery devices',
        'Continuous monitoring equipment',
        'Documentation materials for procedure record'
      ]
    },
    {
      id: 'airway-obstruction-step-8',
      stepNumber: 8,
      title: 'Transport Preparation and Follow-up Care',
      description: 'Prepare for transport and arrange appropriate medical evaluation and care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'All patients with foreign body aspiration require medical evaluation',
        'Transport to emergency department even if object successfully removed',
        'Monitor for delayed complications: airway swelling, aspiration pneumonia',
        'Provide comprehensive report to receiving medical team',
        'Document removal technique, object characteristics, and complications',
        'Educate patient/family about signs of respiratory complications',
        'Consider need for chest X-ray to rule out retained fragments',
        'Arrange follow-up care for potential airway injury assessment'
      ],
      safetyNotes: [
        'Delayed airway swelling may occur hours after incident',
        'Aspiration pneumonia may develop 24-48 hours later',
        'All choking patients need medical evaluation regardless of outcome'
      ],
      equipmentNeeded: [
        'Transport equipment and continuous monitoring',
        'Documentation materials for comprehensive reporting',
        'Communication equipment for hospital notification',
        'Patient education materials about warning signs'
      ]
    }
  ],

  'upper-airway-obstruction-equipment': {
    name: 'Upper Airway Obstruction with Equipment',
    category: 'airway',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Rapidly recognize and assess severity of upper airway obstruction',
      'Prepare and organize appropriate equipment for advanced obstruction management',
      'Perform direct laryngoscopy to visualize and assess foreign body obstruction',
      'Execute suction-assisted removal techniques for liquid and particulate obstructions',
      'Use Magill forceps safely for solid foreign body extraction',
      'Implement alternative airway techniques when direct removal fails',
      'Provide post-removal assessment and ongoing airway management',
      'Perform emergency surgical airway as last resort when indicated'
    ],
    indications: [
      'Complete upper airway obstruction with inability to ventilate',
      'Partial obstruction with severe respiratory distress',
      'Foreign body visible on direct laryngoscopy',
      'Failed basic choking management requiring advanced techniques',
      'Unconscious patient with suspected foreign body aspiration',
      'Post-intubation foreign body obstruction'
    ],
    contraindications: [
      'Conscious patient with effective cough (encourage coughing instead)',
      'Complete laryngeal fracture or massive neck trauma',
      'Inability to visualize airway anatomy due to massive swelling',
      'Equipment not available or provider not trained in technique'
    ],
    equipment: [
      'High-flow suction with large-bore and rigid-tip catheters',
      'Laryngoscope with multiple blade sizes (Macintosh and Miller)',
      'Magill forceps in adult and pediatric sizes',
      'Bag-valve-mask device with high-flow oxygen',
      'Endotracheal tubes (multiple sizes for backup intubation)',
      'Surgical cricothyrotomy kit with scalpel and tubes',
      'Pulse oximetry and capnography monitoring equipment'
    ]
  },

  'immobilization-injury': {
    name: 'Immobilization of an Injury',
    category: 'trauma',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 15,
    isCritical: true,
    objectives: [
      'Perform systematic trauma assessment to identify all injuries requiring immobilization',
      'Select appropriate equipment and materials based on injury type and location',
      'Provide adequate pain management and patient preparation before immobilization',
      'Apply proper stabilization and alignment techniques with gentle traction if needed',
      'Apply splints with adequate padding to prevent pressure injuries',
      'Secure immobilization devices properly while maintaining circulation',
      'Perform comprehensive neurovascular assessment before and after immobilization',
      'Provide ongoing monitoring and transport preparation with continuous assessment'
    ],
    indications: [
      'Suspected fractures of extremities or joints',
      'Joint dislocations requiring stabilization',
      'Severe sprains or ligament injuries',
      'Open fractures requiring stabilization before transport',
      'Painful, swollen, or deformed extremities',
      'Neurovascular compromise requiring immediate stabilization',
      'Multiple trauma patients requiring extremity stabilization'
    ],
    contraindications: [
      'Life-threatening conditions requiring immediate intervention (prioritize ABCs)',
      'Suspected compartment syndrome with severe circulatory compromise',
      'Severe crush injuries with extensive tissue damage',
      'Patient refusal in conscious, competent adults (document refusal)'
    ],
    equipment: [
      'Rigid splints (cardboard, aluminum, or commercial splints)',
      'Soft splinting materials (pillows, blankets, towels)',
      'Padding materials (gauze, foam, towels)',
      'Securing materials (elastic bandages, medical tape, straps)',
      'Slings and swathes for upper extremity injuries',
      'Traction splint for femur fractures',
      'Ice packs and cold therapy supplies',
      'Pain medication and administration supplies'
    ]
  },

  // 40. DISINFECTION OF MINOR WOUNDS - Evidence-based wound cleaning and infection prevention
  'disinfection-minor-wounds': [
    {
      id: 'wound-disinfection-step-1',
      stepNumber: 1,
      title: 'Wound Assessment and Classification',
      description: 'Assess wound characteristics and classify for appropriate disinfection protocol',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess wound size, depth, and location for infection risk stratification',
        'Classify wound type: abrasion, laceration, puncture, or avulsion',
        'Evaluate contamination level: clean, clean-contaminated, or dirty',
        'Check time since injury occurred (infection risk increases >6-8 hours)',
        'Assess for foreign bodies, debris, or embedded materials',
        'Evaluate patient tetanus immunization status and update needs',
        'Check for signs of existing infection: erythema, warmth, purulent drainage',
        'Document wound characteristics before cleaning for comparison'
      ],
      contraindications: [
        'Deep wounds requiring surgical evaluation should not be extensively manipulated',
        'Suspected foreign bodies may require surgical removal rather than irrigation',
        'Heavily contaminated wounds may need surgical debridement'
      ],
      safetyNotes: [
        'Proper wound assessment guides appropriate disinfection strategy',
        'Time since injury affects infection risk and treatment urgency',
        'Document initial appearance for monitoring healing progress'
      ],
      equipmentNeeded: [
        'Good lighting for wound visualization',
        'Magnifying glass for detailed assessment if needed',
        'Measurement tools for wound documentation',
        'Personal protective equipment (gloves, eye protection)'
      ]
    },
    {
      id: 'wound-disinfection-step-2',
      stepNumber: 2,
      title: 'Hand Hygiene and Personal Protection',
      description: 'Establish proper infection control measures and personal protective equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Perform thorough hand hygiene with soap and water or alcohol-based sanitizer',
        'Don clean examination gloves before any wound contact',
        'Use additional PPE: eye protection, gown if splash risk anticipated',
        'Prepare clean work surface with sterile supplies',
        'Change gloves if contaminated during procedure',
        'Avoid touching non-sterile surfaces after gloving',
        'Have sharps disposal container readily available',
        'Ensure adequate lighting and comfortable working position'
      ],
      safetyNotes: [
        'Proper PPE prevents cross-contamination and bloodborne pathogen exposure',
        'Hand hygiene is the most important infection prevention measure',
        'Change gloves between dirty and clean phases of procedure'
      ],
      equipmentNeeded: [
        'Hand hygiene supplies (soap, alcohol sanitizer)',
        'Examination gloves and additional PPE as needed',
        'Clean work surface preparation materials',
        'Sharps disposal container'
      ]
    },
    {
      id: 'wound-disinfection-step-3',
      stepNumber: 3,
      title: 'Initial Wound Irrigation and Debris Removal',
      description: 'Remove gross contamination and debris using gentle irrigation technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Use sterile saline or clean tap water for initial irrigation',
        'Apply gentle pressure irrigation to remove loose debris and bacteria',
        'Direct irrigation flow from clean areas toward contaminated areas',
        'Remove visible foreign material with sterile forceps or gauze',
        'Use copious amounts of irrigant (minimum 50-100ml per cm of wound)',
        'Avoid harsh scrubbing which can damage healthy tissue',
        'Continue irrigation until runoff appears clear of debris',
        'Pat surrounding skin dry with sterile gauze after irrigation'
      ],
      safetyNotes: [
        'Gentle technique prevents additional tissue damage',
        'Adequate irrigation volume essential for bacterial removal',
        'Avoid pushing debris deeper into wound during cleaning'
      ],
      equipmentNeeded: [
        'Sterile saline or clean irrigation solution',
        'Irrigation syringe or squeeze bottle',
        'Sterile forceps for debris removal',
        'Sterile gauze pads for drying'
      ]
    },
    {
      id: 'wound-disinfection-step-4',
      stepNumber: 4,
      title: 'Antiseptic Solution Application',
      description: 'Apply appropriate antiseptic agent for wound disinfection and bacterial reduction',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Select appropriate antiseptic: povidone-iodine, chlorhexidine, or hydrogen peroxide',
        'Apply antiseptic from center of wound outward in circular motions',
        'Allow adequate contact time: 30-60 seconds for bacterial kill',
        'Avoid getting antiseptic in eyes or on mucous membranes',
        'Use separate application for each area to prevent cross-contamination',
        'Consider patient allergies to iodine or other antiseptic components',
        'For sensitive areas: use diluted antiseptic or alternative agents',
        'Remove excess antiseptic with sterile saline if tissue irritation occurs'
      ],
      contraindications: [
        'Avoid iodine-based antiseptics in patients with iodine allergies',
        'Hydrogen peroxide should not be used in deep wounds or body cavities',
        'Some antiseptics may delay healing if used excessively'
      ],
      safetyNotes: [
        'Check for antiseptic allergies before application',
        'Adequate contact time essential for antimicrobial effectiveness',
        'Balance antiseptic benefits with potential tissue toxicity'
      ],
      equipmentNeeded: [
        'Appropriate antiseptic solutions (povidone-iodine, chlorhexidine)',
        'Sterile applicators or gauze for antiseptic application',
        'Sterile saline for antiseptic removal if needed',
        'Timer for adequate contact time'
      ]
    },
    {
      id: 'wound-disinfection-step-5',
      stepNumber: 5,
      title: 'Surrounding Skin Preparation',
      description: 'Clean and prepare surrounding skin area to prevent secondary contamination',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Clean intact skin around wound with antiseptic solution',
        'Work outward from wound edges to prevent dragging bacteria inward',
        'Remove any dried blood, dirt, or adhesive residue from surrounding skin',
        'Use gentle circular motions avoiding excessive pressure',
        'Pay attention to hair-bearing areas which may harbor bacteria',
        'Consider hair removal if interfering with wound care or dressing',
        'Allow antiseptic to air dry completely before applying dressings',
        'Inspect surrounding skin for signs of infection or injury'
      ],
      safetyNotes: [
        'Clean to dirty technique prevents contamination of cleaned wound',
        'Hair removal should be done with clippers rather than razors when possible',
        'Complete drying prevents antiseptic dilution under dressings'
      ],
      equipmentNeeded: [
        'Antiseptic solution for skin preparation',
        'Clean gauze pads or cotton swabs',
        'Hair clippers if hair removal needed',
        'Additional sterile saline for final rinse if needed'
      ]
    },
    {
      id: 'wound-disinfection-step-6',
      stepNumber: 6,
      title: 'Topical Antimicrobial Application',
      description: 'Apply topical antibiotic ointment if indicated for infection prevention',
      isRequired: true,
      isCritical: false,
      timeEstimate: 90,
      keyPoints: [
        'Consider topical antibiotic for high-risk wounds: contaminated, puncture, bite wounds',
        'Apply thin layer of antibiotic ointment (bacitracin, mupirocin, or triple antibiotic)',
        'Check for patient allergies to antibiotic components before application',
        'Cover entire wound surface but avoid excessive amounts',
        'Consider petroleum-based products for wounds not requiring antibiotics',
        'Avoid antibiotic ointments on deep wounds or those requiring surgical closure',
        'Document antibiotic application and patient tolerance',
        'Educate patient about potential allergic reactions to watch for'
      ],
      contraindications: [
        'Known allergy to topical antibiotics or preservatives',
        'Large or deep wounds requiring systemic antibiotic therapy',
        'Wounds that will require surgical intervention'
      ],
      safetyNotes: [
        'Topical antibiotics may cause contact dermatitis in some patients',
        'Overuse of topical antibiotics can promote resistant organisms',
        'Monitor for signs of allergic reaction after application'
      ],
      equipmentNeeded: [
        'Topical antibiotic ointments (bacitracin, mupirocin)',
        'Sterile applicators for ointment application',
        'Patient allergy assessment materials'
      ]
    },
    {
      id: 'wound-disinfection-step-7',
      stepNumber: 7,
      title: 'Sterile Dressing Application',
      description: 'Apply appropriate sterile dressing to protect wound and promote healing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Select dressing size that extends 2-3cm beyond wound margins',
        'Apply sterile gauze pad or non-adherent dressing over wound',
        'Secure dressing with medical tape or elastic wrap',
        'Ensure dressing does not constrict circulation if on extremity',
        'Apply gentle pressure if continued bleeding present',
        'Label dressing with date and time of application',
        'Provide patient with dressing change instructions',
        'Schedule appropriate follow-up for wound evaluation'
      ],
      safetyNotes: [
        'Proper dressing prevents contamination and promotes healing environment',
        'Avoid circumferential taping which may constrict with swelling',
        'Monitor circulation distal to dressing if applied to extremity'
      ],
      equipmentNeeded: [
        'Sterile gauze pads in appropriate sizes',
        'Non-adherent dressing materials',
        'Medical tape or elastic wrap for securing',
        'Labels for dressing identification'
      ]
    },
    {
      id: 'wound-disinfection-step-8',
      stepNumber: 8,
      title: 'Patient Education and Follow-up Planning',
      description: 'Educate patient on wound care and arrange appropriate follow-up monitoring',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Explain signs of infection: increased redness, warmth, swelling, pus',
        'Provide instructions for keeping wound clean and dry',
        'Teach proper dressing change technique and frequency',
        'Discuss activity restrictions and wound protection measures',
        'Review tetanus prophylaxis recommendations and scheduling',
        'Provide written wound care instructions for home reference',
        'Schedule follow-up appointment for wound evaluation in 24-48 hours',
        'Give clear instructions on when to seek immediate medical attention'
      ],
      safetyNotes: [
        'Patient education critical for preventing complications',
        'Clear follow-up instructions ensure appropriate monitoring',
        'Early recognition of infection allows prompt treatment'
      ],
      equipmentNeeded: [
        'Patient education materials and written instructions',
        'Wound care supplies for home use',
        'Contact information for follow-up questions',
        'Scheduling system for follow-up appointments'
      ]
    }
  ],

  'disinfection-minor-wounds': {
    name: 'Disinfection of Minor Wounds',
    category: 'medical',
    difficultyLevel: 'BEGINNER' as const,
    timeEstimateMinutes: 12,
    isCritical: true,
    objectives: [
      'Perform systematic assessment and classification of wound characteristics',
      'Establish proper infection control measures and sterile technique',
      'Provide appropriate pain management and patient preparation',
      'Execute mechanical cleansing and debris removal with proper irrigation',
      'Apply appropriate antiseptic agents for effective wound disinfection',
      'Perform thorough wound inspection and assess for complications',
      'Apply appropriate dressing to protect wound and promote healing',
      'Provide comprehensive patient education and follow-up instructions'
    ],
    indications: [
      'Minor abrasions, lacerations, or puncture wounds',
      'Clean or clean-contaminated wounds requiring disinfection',
      'Superficial wounds without deep structure involvement',
      'Minor cuts and scrapes from daily activities',
      'Wounds requiring cleaning before closure',
      'Prevention of wound infection in minor injuries'
    ],
    contraindications: [
      'Deep wounds requiring surgical closure or exploration',
      'Wounds with major vascular, nerve, or tendon involvement',
      'Severely contaminated or infected wounds requiring surgical debridement',
      'Wounds requiring antibiotic therapy or advanced medical management',
      'Suspected foreign bodies requiring surgical removal'
    ],
    equipment: [
      'Personal protective equipment (sterile gloves, gown, eye protection)',
      'Sterile saline solution or clean water for irrigation',
      'Antiseptic solutions (povidone iodine, chlorhexidine)',
      'Irrigation syringes (35-60 mL) with 18-19 gauge needles',
      'Sterile forceps for debris removal',
      'Sterile gauze pads and non-adherent dressings',
      'Medical tape or bandages for securing dressings',
      'Topical anesthetics for pain management'
    ]
  },

  // 43. HAND WASHING - Evidence-based hand hygiene and infection prevention protocol
  'hand-washing': [
    {
      id: 'handwashing-step-1',
      stepNumber: 1,
      title: 'Hand Hygiene Assessment and Indication Recognition',
      description: 'Assess when hand hygiene is required and select appropriate method',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Recognize five moments for hand hygiene: before patient contact, before aseptic procedures',
        'After body fluid exposure risk, after patient contact, after contact with patient surroundings',
        'Assess level of contamination to determine soap and water vs alcohol-based sanitizer',
        'Use soap and water when hands are visibly soiled or contaminated',
        'Choose alcohol-based sanitizer for routine decontamination when hands not visibly soiled',
        'Recognize need for hand hygiene before donning and after removing gloves',
        'Consider duration since last hand hygiene and level of patient contact',
        'Identify high-risk situations requiring enhanced hand hygiene protocols'
      ],
      safetyNotes: [
        'Hand hygiene is the most effective infection prevention measure',
        'Alcohol sanitizer ineffective against C. difficile spores - use soap and water',
        'Proper technique more important than choice of agent'
      ],
      equipmentNeeded: [
        'Access to running water and soap',
        'Alcohol-based hand sanitizer (60-95% alcohol)',
        'Paper towels for drying',
        'Hand hygiene indication reference guide'
      ]
    },
    {
      id: 'handwashing-step-2',
      stepNumber: 2,
      title: 'Pre-Washing Hand and Jewelry Preparation',
      description: 'Prepare hands and remove jewelry before beginning hand hygiene procedure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Remove all hand jewelry including rings, watches, and bracelets',
        'Push sleeves up above wrists to prevent contamination',
        'Inspect hands for cuts, abrasions, or broken skin requiring special attention',
        'Ensure nails are short and free from artificial nails or nail polish',
        'Check for hangnails or cuticle damage that may harbor bacteria',
        'Remove any visible soil or debris before beginning formal hand washing',
        'Prepare to avoid touching sink surfaces during washing process',
        'Position body to allow comfortable access to sink and supplies'
      ],
      safetyNotes: [
        'Jewelry harbors microorganisms and prevents effective cleaning',
        'Long nails and artificial enhancements increase bacterial load',
        'Broken skin provides entry point for pathogens'
      ],
      equipmentNeeded: [
        'Safe storage area for personal jewelry and items',
        'Mirror for hand inspection if available',
        'Good lighting for hand examination'
      ]
    },
    {
      id: 'handwashing-step-3',
      stepNumber: 3,
      title: 'Water Temperature and Flow Adjustment',
      description: 'Adjust water temperature and flow rate for optimal hand washing effectiveness',
      isRequired: true,
      isCritical: false,
      timeEstimate: 30,
      keyPoints: [
        'Turn on water using elbow, wrist, or automatic sensor if available',
        'Adjust water temperature to comfortably warm (not hot or cold)',
        'Set moderate flow rate to prevent splashing while ensuring adequate rinsing',
        'Allow water to run briefly to clear any stagnant water from faucet',
        'Position hands under water stream without touching sink surfaces',
        'Wet hands completely from fingertips to wrists',
        'Keep hands lower than elbows to prevent contaminated water running up arms',
        'Maintain water flow throughout washing and rinsing process'
      ],
      safetyNotes: [
        'Hot water can damage skin and reduce compliance with hand hygiene',
        'Touching sink surfaces recontaminates hands during washing',
        'Proper hand positioning prevents recontamination from arms'
      ],
      equipmentNeeded: [
        'Functioning sink with adjustable water temperature',
        'Foot pedal, sensor, or elbow-operated controls preferred',
        'Adequate water pressure for effective rinsing'
      ]
    },
    {
      id: 'handwashing-step-4',
      stepNumber: 4,
      title: 'Soap Application and Lather Generation',
      description: 'Apply appropriate amount of soap and generate effective lather for cleaning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Apply 3-5ml of soap (one pump from dispenser) to wet hands',
        'Use antimicrobial or plain soap depending on facility protocol',
        'Distribute soap over all hand surfaces including between fingers',
        'Generate rich lather through initial rubbing motions',
        'Ensure soap reaches all areas: palms, backs, fingertips, thumbs',
        'Add more soap if insufficient lather generated',
        'Avoid excessive soap which may be difficult to rinse completely',
        'Begin systematic scrubbing technique immediately after soap application'
      ],
      safetyNotes: [
        'Adequate soap volume essential for effective bacterial removal',
        'Lather helps lift and suspend microorganisms for removal',
        'Even distribution prevents missed areas during scrubbing'
      ],
      equipmentNeeded: [
        'Liquid soap dispenser with antimicrobial or plain soap',
        'Hands-free soap dispensers preferred to prevent recontamination'
      ]
    },
    {
      id: 'handwashing-step-5',
      stepNumber: 5,
      title: 'Systematic Hand Scrubbing Technique',
      description: 'Perform systematic hand scrubbing covering all surfaces for minimum 20 seconds',
      isRequired: true,
      isCritical: true,
      timeEstimate: 20,
      keyPoints: [
        'Scrub palms together with interlaced fingers for thorough coverage',
        'Scrub back of each hand with opposite palm, fingers interlaced',
        'Scrub between fingers: palm to palm with fingers interlaced',
        'Scrub backs of fingers with opposing palm in interlocked position',
        'Scrub thumbs by grasping with opposite hand and rotating',
        'Scrub fingertips by rubbing in circular motions on opposite palm',
        'Clean under fingernails by scraping against opposite palm',
        'Continue systematic scrubbing for minimum 20 seconds total time'
      ],
      safetyNotes: [
        '20-second minimum scrubbing time required for effective bacterial kill',
        'Systematic technique ensures no areas are missed during cleaning',
        'Fingertips and thumbs commonly missed areas requiring special attention'
      ],
      equipmentNeeded: [
        'Timer or counting method for 20-second minimum',
        'Nail brush if available for heavily soiled hands',
        'Good technique and adequate time more important than tools'
      ]
    },
    {
      id: 'handwashing-step-6',
      stepNumber: 6,
      title: 'Thorough Rinsing and Soap Removal',
      description: 'Rinse hands thoroughly to remove all soap residue and suspended microorganisms',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Rinse hands under running water from wrists to fingertips',
        'Keep hands pointed downward to allow water to drain off fingertips',
        'Rinse thoroughly to remove all soap residue and suspended bacteria',
        'Use adequate water volume and pressure for effective rinsing',
        'Avoid touching sink surfaces during rinsing process',
        'Continue rinsing until water runs clear with no soap bubbles',
        'Pay special attention to areas between fingers and around nails',
        'Complete rinsing before proceeding to drying phase'
      ],
      safetyNotes: [
        'Incomplete rinsing leaves soap residue that can irritate skin',
        'Suspended microorganisms must be completely flushed away',
        'Touching sink during rinsing recontaminates clean hands'
      ],
      equipmentNeeded: [
        'Adequate water pressure and volume for thorough rinsing',
        'Proper sink design to minimize contact with contaminated surfaces'
      ]
    },
    {
      id: 'handwashing-step-7',
      stepNumber: 7,
      title: 'Hand Drying and Faucet Management',
      description: 'Dry hands thoroughly using proper technique and turn off water without recontamination',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Dry hands thoroughly with clean paper towel starting from fingertips',
        'Pat hands dry rather than rubbing to prevent skin irritation',
        'Dry each finger individually and between fingers completely',
        'Use separate clean paper towel to turn off faucet handles',
        'Dispose of paper towels in appropriate waste container',
        'Avoid touching any surfaces after hand drying until patient care',
        'Apply hand lotion if skin is dry or cracked (facility-approved products)',
        'Keep hands away from body and clothing until patient contact'
      ],
      safetyNotes: [
        'Wet hands transfer bacteria more readily than dry hands',
        'Touching faucet handles with clean hands causes recontamination',
        'Proper drying technique prevents skin breakdown and infection'
      ],
      equipmentNeeded: [
        'Clean paper towels (single-use preferred)',
        'Hands-free or foot-pedal operated towel dispensers',
        'Appropriate waste disposal containers',
        'Hand lotion approved for healthcare use'
      ]
    },
    {
      id: 'handwashing-step-8',
      stepNumber: 8,
      title: 'Hand Hygiene Quality Assessment and Documentation',
      description: 'Assess effectiveness of hand hygiene and document compliance as required',
      isRequired: true,
      isCritical: false,
      timeEstimate: 30,
      keyPoints: [
        'Visually inspect hands for cleanliness and complete soap removal',
        'Check that hands feel clean and free from sticky residue',
        'Assess skin condition for dryness, cracking, or irritation',
        'Document hand hygiene compliance if required by facility protocols',
        'Note any skin problems that may affect future hand hygiene practices',
        'Educate others on proper hand hygiene technique when appropriate',
        'Plan timing for next hand hygiene opportunity in patient care sequence',
        'Maintain awareness of hand contamination throughout patient care activities'
      ],
      safetyNotes: [
        'Hand hygiene quality more important than frequency alone',
        'Damaged skin may harbor more bacteria and require special attention',
        'Continuous awareness prevents inadvertent contamination between procedures'
      ],
      equipmentNeeded: [
        'Hand hygiene compliance documentation tools if required',
        'Mirror for visual inspection if available',
        'Hand care products for skin maintenance'
      ]
    }
  ],

  'hand-washing': {
    name: 'Hand Washing',
    category: 'bls',
    difficultyLevel: 'BEGINNER' as const,
    timeEstimateMinutes: 3,
    isCritical: true,
    objectives: [
      'Prepare hands appropriately and assess contamination level',
      'Use proper water temperature and technique for initial rinse',
      'Apply soap correctly and create effective lather',
      'Perform systematic mechanical scrubbing of all hand surfaces',
      'Rinse thoroughly to remove all soap and loosened contaminants',
      'Dry hands properly using technique that prevents recontamination',
      'Manage faucet and environment without recontamination',
      'Maintain skin integrity and plan for continued hand hygiene'
    ],
    indications: [
      'Before and after every patient contact',
      'After contact with body fluids, secretions, or contaminated surfaces',
      'Before donning sterile gloves or performing sterile procedures',
      'After removing gloves or other personal protective equipment',
      'Before eating, drinking, or touching clean surfaces',
      'After using the restroom or handling contaminated materials',
      'At beginning and end of work shift'
    ],
    contraindications: [
      'Life-threatening emergency requiring immediate intervention (use gloves)',
      'Severe hand dermatitis or allergic reaction to available soap',
      'Open wounds on hands without waterproof covering (use gloves instead)'
    ],
    equipment: [
      'Sink with running water (hands-free controls preferred)',
      'Antimicrobial or regular liquid soap',
      'Clean paper towels (hands-free dispenser preferred)',
      'Hand moisturizer or skin protectant',
      'Alcohol-based hand sanitizer for interim cleaning',
      'Waterproof dressing for covering hand wounds if needed'
    ]
  },

  'orogastric-nasogastric-insertion': [
    {
      id: 'oro-naso-step-1',
      stepNumber: 1,
      title: 'Patient assessment and route selection',
      description: 'Assess patient condition and determine optimal insertion route (oral vs nasal)',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess consciousness level and ability to cooperate with procedure',
        'Check for contraindications: base of skull fracture, severe facial trauma',
        'Evaluate nasal patency - select most patent nostril for nasal route',
        'Consider orogastric route for unconscious patients or nasal contraindications',
        'Assess for recent facial surgery, active upper GI bleeding, or coagulopathy',
        'Determine indication: decompression, lavage, feeding access, or medication',
        'Check baseline vital signs and neurological status',
        'Obtain informed consent when patient consciousness permits'
      ],
      contraindications: [
        'Suspected base of skull fracture (nasal route)',
        'Severe maxillofacial trauma',
        'Recent nasal/esophageal surgery',
        'Active esophageal varices bleeding'
      ],
      safetyNotes: [
        'Never use nasal route with suspected skull base fracture',
        'Cervical spine precautions if trauma suspected',
        'Monitor for signs of respiratory distress throughout'
      ],
      equipmentNeeded: [
        'Assessment tools and vital sign equipment',
        'Penlight for nasal examination',
        'Emergency airway equipment nearby'
      ]
    },
    {
      id: 'oro-naso-step-2',
      stepNumber: 2,
      title: 'Equipment preparation and patient positioning',
      description: 'Prepare all necessary equipment and position patient for safe insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Select appropriate tube size: 14-16Fr for adults, 12-14Fr for elderly',
        'Check tube integrity - no cracks, kinks, or missing components',
        'Prepare water-soluble lubricant (never petroleum-based products)',
        'Position patient in high Fowlers (sitting upright) if conscious and stable',
        'Use left lateral position for unconscious patients to prevent aspiration',
        'Ensure adequate lighting and access to patient head and neck',
        'Have suction equipment ready and functional at bedside',
        'Prepare pH strips, syringe, and tape for securing'
      ],
      safetyNotes: [
        'Never use petroleum-based lubricants - risk of lipoid pneumonia',
        'Keep backup tubes available in case of complications',
        'Ensure emergency airway equipment immediately accessible'
      ],
      equipmentNeeded: [
        'Nasogastric/orogastric tubes (multiple sizes)',
        'Water-soluble lubricant',
        '60ml catheter-tip syringe',
        'pH testing strips',
        'Suction equipment',
        'Medical tape for securing'
      ]
    },
    {
      id: 'oro-naso-step-3',
      stepNumber: 3,
      title: 'Measurement and depth calculation',
      description: 'Accurately measure tube insertion depth using anatomical landmarks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Use NEX method: Nose-Earlobe-Xiphoid distance for measurement',
        'Mark measured distance clearly on tube with permanent marker',
        'For orogastric route: mouth corner to earlobe to xiphoid process',
        'Add 5-10cm to measured distance for adequate gastric placement',
        'Double-check measurement - inaccurate depth risks esophageal placement',
        'Document measured insertion depth in patient record',
        'Consider patient body habitus - may require adjustment for very tall patients',
        'Have assistant verify measurement accuracy before insertion'
      ],
      safetyNotes: [
        'Accurate measurement critical for proper gastric placement',
        'Insufficient depth risks esophageal placement and aspiration',
        'Excessive depth may cause gastric perforation'
      ],
      equipmentNeeded: [
        'Measuring tape or pre-marked tube',
        'Permanent marker for depth marking',
        'Documentation materials'
      ]
    },
    {
      id: 'oro-naso-step-4',
      stepNumber: 4,
      title: 'Initial tube insertion',
      description: 'Begin tube insertion using proper technique and monitoring patient response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Lubricate distal 10cm of tube with water-soluble lubricant',
        'Insert tube gently along floor of nasal cavity (not upward)',
        'Advance slowly and steadily - allow natural swallowing to assist',
        'Monitor for resistance - never force insertion against resistance',
        'Watch for signs of respiratory distress, coughing, or gagging',
        'If conscious, encourage patient to swallow and take small sips of water',
        'Stop immediately if patient develops cyanosis or severe respiratory distress',
        'Rotate tube gently if slight resistance encountered'
      ],
      safetyNotes: [
        'Never force tube insertion - risk of perforation or trauma',
        'Monitor respiratory status continuously during insertion',
        'Be prepared for immediate tube removal if respiratory compromise'
      ],
      equipmentNeeded: [
        'Prepared nasogastric/orogastric tube',
        'Water-soluble lubricant',
        'Small cup of water for conscious patients',
        'Suction equipment ready',
        'Emergency airway equipment'
      ]
    },
    {
      id: 'oro-naso-step-5',
      stepNumber: 5,
      title: 'Placement verification using multiple methods',
      description: 'Confirm correct gastric placement using multiple verification techniques',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Aspirate gastric contents with 60ml syringe - should be acidic fluid',
        'Test aspirated fluid pH with pH strips (should be <5.5 for gastric)',
        'Auscultate over epigastrium while injecting 20ml of air (whoosh test)',
        'Check for visualization of tube tip on chest X-ray if available',
        'Assess for immediate signs of respiratory distress or pneumothorax',
        'Verify external tube markings align with pre-measured depth',
        'Never rely on single confirmation method - use multiple verification',
        'Document all verification methods used and results obtained'
      ],
      safetyNotes: [
        'Never assume correct placement without multiple verification methods',
        'pH testing most reliable bedside confirmation method',
        'Chest X-ray gold standard when available and clinically appropriate',
        'Immediately remove tube if respiratory placement suspected'
      ],
      equipmentNeeded: [
        '60ml catheter-tip syringe',
        'pH testing strips',
        'Stethoscope',
        'Small amount of air for auscultation test'
      ]
    },
    {
      id: 'oro-naso-step-6',
      stepNumber: 6,
      title: 'Tube securing and connection',
      description: 'Properly secure tube and connect to appropriate drainage system',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Clean nasal/oral area around insertion site with antiseptic wipe',
        'Apply skin protectant if prolonged placement anticipated',
        'Secure tube with medical tape - avoid excessive tension on nares',
        'Use chevron taping technique to prevent pressure necrosis',
        'Connect tube to low intermittent suction (40-60 mmHg) if ordered',
        'Attach drainage collection bag if continuous drainage required',
        'Ensure tube positioning prevents kinking or disconnection',
        'Mark tube at nares/mouth level to monitor for displacement'
      ],
      safetyNotes: [
        'Avoid excessive suction pressure - risk of mucosal damage',
        'Monitor for signs of pressure injury at insertion site',
        'Ensure connections are secure to prevent system failure'
      ],
      equipmentNeeded: [
        'Medical tape (hypoallergenic preferred)',
        'Antiseptic wipes',
        'Suction equipment with pressure regulation',
        'Drainage collection bags',
        'Skin protectant products'
      ]
    },
    {
      id: 'oro-naso-step-7',
      stepNumber: 7,
      title: 'Function testing and troubleshooting',
      description: 'Test tube function and address any functional problems',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Test tube patency by gently irrigating with 30ml normal saline',
        'Verify drainage is functioning - should see gastric contents or air',
        'Troubleshoot poor drainage: check for kinks, clots, or positioning',
        'Adjust suction pressure if drainage inadequate or excessive',
        'Flush tube gently if partial obstruction suspected',
        'Monitor drainage characteristics: color, consistency, volume',
        'Establish baseline gastric residual volume if appropriate',
        'Test tube mobility - should advance/retract slightly with swallowing'
      ],
      safetyNotes: [
        'Use only gentle irrigation pressure to avoid gastric trauma',
        'Never force irrigation against resistance',
        'Monitor for signs of gastric perforation: severe pain, hematemesis'
      ],
      equipmentNeeded: [
        'Normal saline for irrigation',
        '30-60ml catheter-tip syringe',
        'Graduated container for measuring output',
        'Documentation materials for baseline measurements'
      ]
    },
    {
      id: 'oro-naso-step-8',
      stepNumber: 8,
      title: 'Patient monitoring and comprehensive documentation',
      description: 'Establish ongoing monitoring plan and complete thorough documentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Monitor vital signs and respiratory status every 15 minutes initially',
        'Assess insertion site for signs of irritation, bleeding, or infection',
        'Document indication, route used, tube size, and depth of insertion',
        'Record verification methods used and results obtained',
        'Establish monitoring schedule for tube position and function',
        'Educate patient/family about tube care and signs of complications',
        'Provide comfort measures: mouth care, nasal hygiene, positioning',
        'Plan for regular reassessment of continued need for tube'
      ],
      safetyNotes: [
        'Continuous monitoring prevents delayed complications',
        'Patient education crucial for recognizing problems',
        'Regular tube position verification prevents displacement complications'
      ],
      equipmentNeeded: [
        'Vital sign monitoring equipment',
        'Documentation forms and flowsheets',
        'Patient education materials',
        'Mouth care and nasal hygiene supplies'
      ]
    }
  ],

  // 37. BAG VALVE MASK RESERVOIR VENTILATION - Evidence-based manual ventilation technique
  'bag-valve-mask-reservoir': [
    {
      id: 'bvm-reservoir-step-1',
      stepNumber: 1,
      title: 'Equipment Assembly and Oxygen System Setup',
      description: 'Assemble BVM system with reservoir bag and establish high-flow oxygen delivery',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Connect reservoir bag to BVM system for oxygen concentration optimization',
        'Attach high-flow oxygen at 15 L/min to maximize delivered FiO2',
        'Ensure all connections are secure and leak-free',
        'Test bag function by compressing and observing reservoir refill',
        'Select appropriate mask size for patient face coverage',
        'Check for cracks or damage in BVM components',
        'Verify PEEP valve function if equipped',
        'Have suction equipment immediately available for airway clearance'
      ],
      safetyNotes: [
        'Reservoir bag increases delivered oxygen concentration to 90-95%',
        'Without reservoir bag, delivered FiO2 is only 40-60%',
        'High-flow oxygen essential for critically ill patients'
      ],
      equipmentNeeded: [
        'Self-inflating bag-valve-mask with reservoir attachment',
        'High-flow oxygen source (15 L/min capability)',
        'Appropriate mask sizes (adult, pediatric, infant)',
        'Suction equipment with rigid catheter readily available'
      ]
    },
    {
      id: 'bvm-reservoir-step-2',
      stepNumber: 2,
      title: 'Patient Assessment and Ventilation Indication',
      description: 'Assess patient respiratory status and confirm need for assisted ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess respiratory rate, depth, and effort',
        'Evaluate oxygen saturation and skin color for hypoxia',
        'Check for adequate chest rise and air movement',
        'Assess consciousness level and ability to protect airway',
        'Identify signs of respiratory failure: cyanosis, accessory muscle use',
        'Evaluate for contraindications: facial trauma, vomiting risk',
        'Determine ventilation urgency and required assistance level',
        'Consider need for airway adjuncts or advanced airway management'
      ],
      contraindications: [
        'Active vomiting with high aspiration risk',
        'Severe facial trauma preventing effective mask seal',
        'Suspected pneumothorax without decompression capability'
      ],
      safetyNotes: [
        'Assess airway patency before initiating positive pressure ventilation',
        'Have suction immediately available for airway protection',
        'Monitor for gastric distension with prolonged BVM use'
      ],
      equipmentNeeded: [
        'Pulse oximetry for oxygen saturation monitoring',
        'End-tidal CO2 monitoring if available',
        'Airway assessment tools',
        'Backup advanced airway equipment'
      ]
    },
    {
      id: 'bvm-reservoir-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Airway Optimization',
      description: 'Position patient optimally and establish patent airway for effective ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position patient supine with head in sniffing position',
        'Use head-tilt, chin-lift maneuver to open airway',
        'Insert oropharyngeal or nasopharyngeal airway if needed',
        'Clear airway of secretions, blood, or debris with suction',
        'Ensure proper alignment of oral, pharyngeal, and laryngeal axes',
        'Consider jaw-thrust maneuver if cervical spine injury suspected',
        'Optimize head position with towel roll under shoulders if needed',
        'Verify airway patency before attempting positive pressure ventilation'
      ],
      safetyNotes: [
        'Proper positioning critical for effective ventilation',
        'Use jaw-thrust instead of head-tilt if spine injury suspected',
        'Suction airway before positive pressure ventilation to prevent aspiration'
      ],
      equipmentNeeded: [
        'Oral and nasal airways in appropriate sizes',
        'Suction equipment with rigid and flexible catheters',
        'Towel roll or positioning aids',
        'Cervical spine immobilization if indicated'
      ]
    },
    {
      id: 'bvm-reservoir-step-4',
      stepNumber: 4,
      title: 'Mask Seal Establishment and Hand Positioning',
      description: 'Establish effective mask seal using proper technique and hand positioning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Use EC-clamp technique: thumb and index finger form C around mask',
        'Use remaining 3 fingers to lift jaw (E-clamp) maintaining airway',
        'Position mask to cover nose and mouth without compressing eyes',
        'Create airtight seal by pressing mask edges against face',
        'Avoid excessive pressure that could obstruct venous return',
        'Monitor for air leaks around mask edges during ventilation',
        'Adjust mask position and pressure to optimize seal',
        'Consider two-person technique if unable to achieve adequate seal'
      ],
      safetyNotes: [
        'Poor mask seal reduces ventilation effectiveness significantly',
        'Excessive facial pressure can cause tissue damage',
        'Two-person BVM technique often more effective than one-person'
      ],
      equipmentNeeded: [
        'Properly sized face mask with good seal properties',
        'Assistant for two-person BVM technique if needed',
        'Alternative mask sizes if seal inadequate'
      ]
    },
    {
      id: 'bvm-reservoir-step-5',
      stepNumber: 5,
      title: 'Controlled Ventilation Delivery',
      description: 'Deliver appropriate tidal volumes and ventilation rates for patient condition',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Deliver tidal volume of 6-7 mL/kg (approximately 500-600 mL adults)',
        'Use ventilation rate appropriate for age: 10-12/min adults, 12-20/min children',
        'Compress bag smoothly over 1 second inspiratory time',
        'Allow complete passive exhalation between breaths',
        'Observe chest rise with each ventilation to confirm adequate volume',
        'Avoid over-ventilation which can cause gastric distension',
        'Monitor for bilateral chest expansion and breath sounds',
        'Adjust technique based on patient response and chest compliance'
      ],
      safetyNotes: [
        'Excessive tidal volumes can cause barotrauma',
        'Rapid ventilation rates may cause hypocapnia and decreased cardiac output',
        'Gastric distension increases aspiration risk'
      ],
      equipmentNeeded: [
        'BVM with reservoir bag and high-flow oxygen',
        'Monitoring equipment for ventilation assessment',
        'Stethoscope for breath sound evaluation'
      ]
    },
    {
      id: 'bvm-reservoir-step-6',
      stepNumber: 6,
      title: 'Ventilation Monitoring and Assessment',
      description: 'Continuously monitor ventilation effectiveness and patient physiological response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Monitor oxygen saturation continuously with pulse oximetry',
        'Assess end-tidal CO2 if capnography available',
        'Watch for bilateral chest rise and fall with each breath',
        'Listen for breath sounds bilaterally to confirm air entry',
        'Monitor heart rate and blood pressure response to ventilation',
        'Assess skin color and perfusion improvement',
        'Watch for signs of gastric distension or regurgitation',
        'Monitor for pneumothorax development with positive pressure'
      ],
      safetyNotes: [
        'Decreasing oxygen saturation may indicate inadequate ventilation',
        'Sudden loss of compliance may suggest pneumothorax',
        'Gastric distension increases aspiration risk significantly'
      ],
      equipmentNeeded: [
        'Pulse oximetry with continuous monitoring',
        'End-tidal CO2 monitoring if available',
        'Stethoscope for breath sound assessment',
        'Blood pressure monitoring equipment'
      ]
    },
    {
      id: 'bvm-reservoir-step-7',
      stepNumber: 7,
      title: 'Complication Recognition and Management',
      description: 'Recognize ventilation complications and implement appropriate corrective measures',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Manage inadequate chest rise: check mask seal, airway position, obstruction',
        'Address gastric distension: reduce ventilation pressure, consider NGT',
        'Recognize pneumothorax: sudden compliance loss, unilateral breath sounds',
        'Handle mask leak: reposition mask, adjust hand placement, try different size',
        'Manage patient agitation: assess ventilation adequacy, consider sedation',
        'Address equipment failure: have backup BVM immediately available',
        'Recognize need for advanced airway: prolonged ventilation, aspiration risk',
        'Monitor for cardiovascular compromise from positive pressure'
      ],
      safetyNotes: [
        'Pneumothorax can be life-threatening with continued positive pressure',
        'Gastric distension significantly increases aspiration risk',
        'Equipment failure requires immediate backup ventilation'
      ],
      equipmentNeeded: [
        'Backup BVM equipment ready for immediate use',
        'Advanced airway management equipment available',
        'Needle decompression kit for pneumothorax',
        'Nasogastric tubes for gastric decompression'
      ]
    },
    {
      id: 'bvm-reservoir-step-8',
      stepNumber: 8,
      title: 'Transition Planning and Documentation',
      description: 'Plan for ongoing ventilation needs and provide comprehensive documentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Assess need for advanced airway management vs continued BVM',
        'Plan for transport ventilation strategy and equipment needs',
        'Document ventilation parameters: rate, volumes, oxygen concentration',
        'Record patient response to ventilation and any complications',
        'Provide detailed report to receiving medical team',
        'Include recommendations for continued respiratory support',
        'Document total ventilation time and techniques used',
        'Ensure continuity of care during patient transfer'
      ],
      safetyNotes: [
        'Prolonged BVM ventilation increases fatigue and inconsistency',
        'Transport requires secure ventilation strategy',
        'Advanced airway may be needed for extended ventilation'
      ],
      equipmentNeeded: [
        'Documentation materials and ventilation flowsheets',
        'Transport-compatible ventilation equipment',
        'Communication equipment for medical consultation',
        'Advanced airway equipment for transition if needed'
      ]
    }
  ],

  'bag-valve-mask-reservoir': {
    name: 'Bag Valve Mask Reservoir Ventilation',
    category: 'airway',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 15,
    isCritical: true,
    objectives: [
      'Assemble BVM system with reservoir bag and establish proper oxygen supply',
      'Assess patient ventilation needs and select appropriate equipment',
      'Position patient optimally and establish patent airway',
      'Establish effective mask seal using proper hand positioning technique',
      'Deliver controlled ventilation with appropriate tidal volumes and timing',
      'Continuously monitor ventilation effectiveness and patient response',
      'Recognize and manage ventilation complications promptly',
      'Plan for ongoing ventilation needs and provide comprehensive documentation'
    ],
    indications: [
      'Respiratory failure or inadequate spontaneous ventilation',
      'Apnea or agonal breathing patterns',
      'Severe respiratory distress requiring ventilatory support',
      'Cardiac arrest requiring positive pressure ventilation',
      'Sedated or unconscious patients unable to maintain adequate ventilation',
      'Bridge to advanced airway management',
      'Emergency ventilation when mechanical ventilator unavailable'
    ],
    contraindications: [
      'Complete upper airway obstruction requiring surgical airway',
      'Massive facial trauma preventing effective mask seal',
      'Active uncontrolled vomiting without adequate suction',
      'Conscious patient with adequate spontaneous ventilation',
      'Suspected tension pneumothorax without decompression'
    ],
    equipment: [
      'Bag-valve-mask device with reservoir bag (appropriate size)',
      'High-flow oxygen source (10-15 L/min capability)',
      'Face masks in multiple sizes',
      'Oropharyngeal and nasopharyngeal airways',
      'Suction equipment with large-bore catheters',
      'Pulse oximetry and capnography monitoring',
      'Backup BVM device and advanced airway equipment'
    ]
  },

  'patient-handover': {
    name: 'Patient Handover',
    category: 'medical',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 10,
    isCritical: true,
    objectives: [
      'Organize patient information and prepare for effective communication',
      'Structure handover using SBAR (Situation, Background, Assessment, Recommendation) format',
      'Formally introduce patient and verify identity with receiving team',
      'Present comprehensive clinical information systematically',
      'Report all treatments provided and patient response to interventions',
      'Describe patient\'s current condition and ongoing concerns',
      'Address questions and transfer complete documentation',
      'Complete handover professionally while maintaining availability for clarification'
    ],
    indications: [
      'Transfer of patient care from prehospital to hospital setting',
      'Interfacility transport requiring care transition',
      'Shift change requiring patient care transfer',
      'Transfer between different levels of care or specialties',
      'Emergency department admission from ambulance service',
      'Transfer to intensive care or specialized treatment units'
    ],
    contraindications: [
      'Life-threatening emergency requiring immediate intervention (brief handover)',
      'Patient refusal of treatment transfer (document appropriately)',
      'Receiving team unavailable or not ready to accept report'
    ],
    equipment: [
      'Complete patient care records and documentation',
      'Medication administration records and empty vials',
      'Diagnostic results (ECG strips, glucose readings)',
      'Patient identification and insurance information',
      'Contact information for transport service or agency',
      'Any patient belongings or personal effects inventory'
    ]
  },

  // 41. DRUG ADMINISTRATION - Evidence-based medication administration safety protocol
  'drug-administration': [
    {
      id: 'drug-admin-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Medication Indication',
      description: 'Assess patient condition and confirm appropriate medication indication',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess patient vital signs and clinical condition requiring medication',
        'Confirm specific medical indication for prescribed medication',
        'Review patient medical history and current medications',
        'Check for drug allergies and previous adverse reactions',
        'Evaluate contraindications and precautions for specific medication',
        'Consider patient weight, age, and organ function for dosing',
        'Assess severity of condition and urgency of medication need',
        'Document baseline vital signs and clinical status before administration'
      ],
      contraindications: [
        'Known allergy or hypersensitivity to medication or components',
        'Contraindicated medical conditions for specific drug',
        'Drug interactions with current medications'
      ],
      safetyNotes: [
        'Thorough patient assessment prevents adverse drug events',
        'Always verify indication before any medication administration',
        'Document allergies prominently in patient record'
      ],
      equipmentNeeded: [
        'Vital sign monitoring equipment',
        'Patient medication history and allergy information',
        'Drug reference materials for indications and contraindications',
        'Documentation materials for baseline assessment'
      ]
    },
    {
      id: 'drug-admin-step-2',
      stepNumber: 2,
      title: 'Medication Verification and Five Rights Check',
      description: 'Verify medication using systematic five rights approach for patient safety',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Right Patient: Verify patient identity using two identifiers',
        'Right Drug: Confirm medication name matches order exactly',
        'Right Dose: Calculate and verify dose based on patient parameters',
        'Right Route: Confirm route of administration as ordered',
        'Right Time: Verify timing and frequency of administration',
        'Check medication expiration date and appearance',
        'Verify concentration and calculate dosage accurately',
        'Have second provider double-check high-risk medications'
      ],
      safetyNotes: [
        'Five rights checking prevents most medication errors',
        'Independent double-check required for high-risk drugs',
        'Never skip verification steps even in emergency situations'
      ],
      equipmentNeeded: [
        'Patient identification band or verification method',
        'Medication order or protocol reference',
        'Calculator for dosage calculations',
        'Drug reference materials for verification'
      ]
    },
    {
      id: 'drug-admin-step-3',
      stepNumber: 3,
      title: 'Medication Preparation and Dosage Calculation',
      description: 'Prepare medication safely with accurate dosage calculation and sterile technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Calculate dosage based on patient weight and clinical guidelines',
        'Use proper technique for drawing medication from vial or ampoule',
        'Maintain sterile technique throughout preparation process',
        'Label syringe immediately with drug name, dose, and time',
        'Check medication clarity and absence of precipitates',
        'Use appropriate diluent if dilution required',
        'Avoid contamination of medication during preparation',
        'Have reversal agents or antagonists readily available if applicable'
      ],
      safetyNotes: [
        'Accurate calculation prevents under- or overdosing',
        'Sterile technique prevents infection from contaminated medications',
        'Immediate labeling prevents medication mix-ups'
      ],
      equipmentNeeded: [
        'Sterile syringes and needles in appropriate sizes',
        'Alcohol prep pads for vial cleaning',
        'Medication labels for syringe identification',
        'Calculator and dosage reference materials'
      ]
    },
    {
      id: 'drug-admin-step-4',
      stepNumber: 4,
      title: 'Route Selection and Access Establishment',
      description: 'Select appropriate administration route and establish secure access',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Select route based on medication requirements and patient condition',
        'For IV: verify patent IV access with blood return and saline flush',
        'For IM: select appropriate injection site with proper muscle mass',
        'For SQ: choose site with adequate subcutaneous tissue',
        'For oral: ensure patient can swallow and protect airway',
        'Consider bioavailability and onset time for different routes',
        'Assess patient comfort and position appropriately',
        'Have emergency equipment available for adverse reactions'
      ],
      contraindications: [
        'Oral route contraindicated in patients with impaired swallowing',
        'IM route avoided in coagulopathy or severe thrombocytopenia',
        'IV route requires patent access - avoid infiltrated IVs'
      ],
      safetyNotes: [
        'Route selection affects drug absorption and effectiveness',
        'Ensure access patency before administering IV medications',
        'Have resuscitation equipment available for high-risk medications'
      ],
      equipmentNeeded: [
        'IV access materials and saline flushes',
        'Appropriate needles for IM/SQ administration',
        'Emergency resuscitation equipment',
        'Patient positioning aids as needed'
      ]
    },
    {
      id: 'drug-admin-step-5',
      stepNumber: 5,
      title: 'Medication Administration and Monitoring',
      description: 'Administer medication safely while monitoring for immediate effects and reactions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Administer medication at appropriate rate for specific drug',
        'Monitor vital signs during and immediately after administration',
        'Watch for immediate adverse reactions or allergic responses',
        'Observe injection site for signs of infiltration or extravasation',
        'Document time of administration and initial patient response',
        'Follow medication with saline flush for IV medications as appropriate',
        'Position patient safely and comfortably after administration',
        'Have reversal agents ready for medications with specific antidotes'
      ],
      safetyNotes: [
        'Rapid IV administration can cause hemodynamic instability',
        'Monitor continuously for allergic reactions during administration',
        'Extravasation of certain drugs can cause severe tissue damage'
      ],
      equipmentNeeded: [
        'Continuous vital sign monitoring equipment',
        'Saline flushes for IV medication administration',
        'Emergency medications for adverse reaction treatment',
        'Timing device for controlled administration rates'
      ]
    },
    {
      id: 'drug-admin-step-6',
      stepNumber: 6,
      title: 'Post-Administration Assessment and Response',
      description: 'Monitor patient response to medication and assess therapeutic effectiveness',
      isRequired: true,
      isCritical: true,
      timeEstimate: 600,
      keyPoints: [
        'Monitor for expected therapeutic effects based on medication',
        'Assess for adverse effects or unexpected reactions',
        'Check vital signs at regular intervals per protocol',
        'Evaluate pain relief, symptom improvement, or clinical response',
        'Monitor for delayed allergic reactions or side effects',
        'Assess need for additional doses or alternative medications',
        'Document patient response and effectiveness of treatment',
        'Communicate significant changes to medical control or receiving facility'
      ],
      safetyNotes: [
        'Some medications have delayed onset requiring extended monitoring',
        'Adverse effects may be delayed and require ongoing surveillance',
        'Therapeutic response guides need for additional interventions'
      ],
      equipmentNeeded: [
        'Continuous monitoring equipment for extended assessment',
        'Documentation materials for response tracking',
        'Communication equipment for medical consultation',
        'Additional medications if repeat dosing needed'
      ]
    },
    {
      id: 'drug-admin-step-7',
      stepNumber: 7,
      title: 'Adverse Reaction Management',
      description: 'Recognize and manage adverse drug reactions or medication complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Recognize signs of allergic reactions: rash, itching, swelling, bronchospasm',
        'Identify anaphylaxis: hypotension, airway swelling, cardiovascular collapse',
        'Manage mild reactions: discontinue medication, administer antihistamines',
        'Treat severe reactions: epinephrine, IV fluids, airway management',
        'Administer specific antidotes if available for drug overdose',
        'Support vital functions: airway, breathing, circulation',
        'Document all interventions and patient responses thoroughly',
        'Prepare for rapid transport to appropriate medical facility'
      ],
      contraindications: [
        'Do not delay treatment of severe allergic reactions',
        'Avoid additional doses of medication causing adverse reaction'
      ],
      safetyNotes: [
        'Anaphylaxis can be rapidly fatal without immediate treatment',
        'Have epinephrine and airway management equipment immediately available',
        'Some adverse reactions may be delayed requiring continued monitoring'
      ],
      equipmentNeeded: [
        'Emergency medications (epinephrine, antihistamines, corticosteroids)',
        'Airway management equipment',
        'IV fluids and vasopressor medications',
        'Specific antidotes for medication being administered'
      ]
    },
    {
      id: 'drug-admin-step-8',
      stepNumber: 8,
      title: 'Documentation and Communication',
      description: 'Complete comprehensive documentation and communicate with receiving medical team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Document medication name, dose, route, and time of administration',
        'Record patient response and any adverse effects observed',
        'Note vital signs before, during, and after medication administration',
        'Document indication for medication and effectiveness of treatment',
        'Include any complications or adverse reactions managed',
        'Record waste medication disposal per controlled substance protocols',
        'Communicate medication administration to receiving medical team',
        'Provide recommendations for continued monitoring or additional treatment'
      ],
      safetyNotes: [
        'Complete documentation essential for ongoing patient care',
        'Accurate records protect patients and healthcare providers',
        'Controlled substance documentation required by law'
      ],
      equipmentNeeded: [
        'Medication administration record forms',
        'Controlled substance waste documentation',
        'Communication equipment for receiving facility report',
        'Patient care documentation materials'
      ]
    }
  ],

  'drug-administration': {
    name: 'Drug Administration',
    category: 'pharmacology',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Assess patient and verify medication orders using systematic approach',
      'Apply the six rights of medication administration consistently',
      'Calculate correct dosages and prepare medications using sterile technique',
      'Administer medications using appropriate route-specific techniques',
      'Monitor patient response and vital signs during medication delivery',
      'Evaluate therapeutic response and monitor for delayed effects',
      'Recognize and manage medication adverse reactions promptly',
      'Provide comprehensive documentation and communication of medication administration'
    ],
    indications: [
      'Pain management requiring analgesic medications',
      'Cardiac emergencies requiring antiarrhythmics or vasopressors',
      'Respiratory emergencies requiring bronchodilators',
      'Allergic reactions requiring antihistamines or epinephrine',
      'Seizure control requiring anticonvulsant medications',
      'Infection requiring antibiotic therapy',
      'Any condition requiring specific pharmacological intervention'
    ],
    contraindications: [
      'Known allergy to specific medication or drug class',
      'Medication-specific contraindications (pregnancy, organ failure)',
      'Drug interactions with current medications',
      'Inability to verify patient identity or obtain proper authorization',
      'Lack of clear indication for medication use',
      'Expired medications or compromised drug integrity'
    ],
    equipment: [
      'Appropriate syringes and needles for route of administration',
      'Medication vials, ampules, or prefilled syringes',
      'Alcohol swabs and sterile preparation supplies',
      'Medication calculation aids and reference charts',
      'Syringe labels and identification materials',
      'Reversal agents (naloxone, flumazenil, epinephrine)',
      'IV fluids and diluents as needed',
      'Continuous monitoring equipment (cardiac, pulse oximetry)'
    ]
  },

  // 36. 3-LEAD ECG INTERPRETATION - Evidence-based rhythm analysis and interpretation
  '3-lead-ecg-interpretation': [
    {
      id: 'ecg-interpretation-step-1',
      stepNumber: 1,
      title: 'ECG Equipment Setup and Lead Placement',
      description: 'Set up 3-lead ECG monitoring with proper electrode placement for rhythm analysis',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Clean electrode sites with alcohol to remove oils and debris',
        'Place RA (right arm) electrode below right clavicle, midclavicular line',
        'Place LA (left arm) electrode below left clavicle, midclavicular line',
        'Place LL (left leg) electrode on left lower chest or abdomen',
        'Ensure good electrode contact with adequate adhesion',
        'Select appropriate lead for monitoring (usually Lead II)',
        'Adjust gain and filter settings for optimal waveform clarity',
        'Verify adequate signal quality and minimal artifact'
      ],
      safetyNotes: [
        'Poor electrode contact causes artifact and unreliable readings',
        'Lead II typically provides best P-wave visualization',
        'Avoid placing electrodes over bony prominences'
      ],
      equipmentNeeded: [
        '3-lead ECG monitor with display capability',
        'ECG electrodes with good adhesive properties',
        'Alcohol prep pads for skin preparation',
        'Razor for hair removal if necessary'
      ]
    },
    {
      id: 'ecg-interpretation-step-2',
      stepNumber: 2,
      title: 'Systematic Rhythm Analysis Approach',
      description: 'Use systematic approach to analyze cardiac rhythm and identify key components',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess heart rate: count QRS complexes in 6-second strip and multiply by 10',
        'Evaluate rhythm regularity: measure R-R intervals for consistency',
        'Identify P waves: look for consistent morphology and relationship to QRS',
        'Measure PR interval: normal 0.12-0.20 seconds (3-5 small boxes)',
        'Assess QRS width: normal <0.12 seconds (3 small boxes)',
        'Determine P-wave to QRS relationship: 1:1, 2:1, variable, or none',
        'Calculate heart rate using multiple methods for accuracy',
        'Document baseline rhythm for comparison with changes'
      ],
      safetyNotes: [
        'Systematic approach prevents missing critical rhythm abnormalities',
        'Rate calculation errors can lead to inappropriate treatment decisions',
        'Always correlate ECG findings with clinical presentation'
      ],
      equipmentNeeded: [
        'ECG calipers or measurement tools',
        'ECG paper with standard calibration',
        'Reference materials for normal values',
        'Documentation materials for findings'
      ]
    },
    {
      id: 'ecg-interpretation-step-3',
      stepNumber: 3,
      title: 'Normal Sinus Rhythm Recognition',
      description: 'Identify characteristics of normal sinus rhythm and assess for normal variants',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Rate: 60-100 beats per minute in adults',
        'Rhythm: regular R-R intervals with <10% variation',
        'P waves: upright in Lead II, consistent morphology',
        'PR interval: 0.12-0.20 seconds, consistent across beats',
        'QRS: narrow (<0.12 seconds) with consistent morphology',
        'P:QRS ratio: 1:1 relationship with each P wave followed by QRS',
        'Assess for sinus arrhythmia: rate varies with respiration (normal in young patients)',
        'Document normal sinus rhythm and any minor variations'
      ],
      safetyNotes: [
        'Sinus arrhythmia is normal variant in healthy young adults',
        'Rate may vary with age, fitness, and medications',
        'Normal rhythm provides baseline for detecting changes'
      ],
      equipmentNeeded: [
        'Clear ECG tracing with good signal quality',
        'Measurement tools for interval assessment',
        'Reference standards for normal values',
        'Patient assessment for clinical correlation'
      ]
    },
    {
      id: 'ecg-interpretation-step-4',
      stepNumber: 4,
      title: 'Tachyarrhythmia Identification',
      description: 'Recognize and classify tachyarrhythmias based on rate, regularity, and QRS width',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Sinus tachycardia: >100 bpm, regular, narrow QRS, visible P waves',
        'Supraventricular tachycardia (SVT): >150 bpm, regular, narrow QRS, hidden P waves',
        'Atrial fibrillation: irregularly irregular rhythm, no distinct P waves',
        'Atrial flutter: regular sawtooth pattern, ventricular rate often 150 bpm',
        'Ventricular tachycardia: >100 bpm, wide QRS (>0.12 sec), regular or irregular',
        'Assess hemodynamic stability: blood pressure, perfusion, mental status',
        'Identify need for immediate treatment vs observation',
        'Document specific tachyarrhythmia type and patient response'
      ],
      safetyNotes: [
        'Unstable tachycardia requires immediate intervention',
        'Wide-complex tachycardia should be treated as VT until proven otherwise',
        'Assess patient symptoms and hemodynamic status'
      ],
      equipmentNeeded: [
        'ECG monitoring with clear rhythm display',
        'Vital sign monitoring equipment',
        'Emergency treatment equipment ready',
        'Reference materials for arrhythmia classification'
      ]
    },
    {
      id: 'ecg-interpretation-step-5',
      stepNumber: 5,
      title: 'Bradyarrhythmia Recognition',
      description: 'Identify and classify bradyarrhythmias and assess for hemodynamic significance',
      isRequired: true,
      isCritical: true,
      timeEstimate: 210,
      keyPoints: [
        'Sinus bradycardia: <60 bpm, regular rhythm, normal P waves and PR interval',
        'First-degree AV block: PR interval >0.20 seconds, all beats conducted',
        'Second-degree AV block Type I (Wenckebach): progressive PR lengthening, dropped beats',
        'Second-degree AV block Type II: consistent PR interval with intermittent dropped beats',
        'Third-degree (complete) AV block: no relationship between P waves and QRS',
        'Assess for symptoms: chest pain, dyspnea, hypotension, altered mental status',
        'Evaluate escape rhythms: junctional (40-60 bpm) vs ventricular (20-40 bpm)',
        'Determine need for pacing based on hemodynamic status'
      ],
      safetyNotes: [
        'Symptomatic bradycardia requires immediate treatment',
        'High-degree AV blocks may progress to complete heart block',
        'Escape rhythms indicate significant conduction system disease'
      ],
      equipmentNeeded: [
        'ECG calipers for precise interval measurement',
        'Atropine ready for symptomatic bradycardia',
        'Transcutaneous pacing equipment available',
        'Continuous hemodynamic monitoring'
      ]
    },
    {
      id: 'ecg-interpretation-step-6',
      stepNumber: 6,
      title: 'Ectopic Beat and Arrhythmia Analysis',
      description: 'Identify premature beats and irregular rhythms with clinical significance assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Premature atrial contractions (PACs): early narrow beats with abnormal P waves',
        'Premature ventricular contractions (PVCs): early wide beats without P waves',
        'Assess PVC frequency and patterns: isolated, bigeminy, trigeminy, couplets',
        'Identify dangerous PVC patterns: R-on-T phenomenon, multifocal PVCs',
        'Evaluate for non-sustained ventricular tachycardia: ≥3 consecutive PVCs',
        'Assess for underlying causes: electrolyte imbalances, ischemia, medications',
        'Determine clinical significance based on frequency and patient symptoms',
        'Monitor for progression to sustained arrhythmias'
      ],
      safetyNotes: [
        'Frequent PVCs may indicate underlying cardiac disease',
        'R-on-T phenomenon can precipitate ventricular fibrillation',
        'Multifocal PVCs suggest increased arrhythmia risk'
      ],
      equipmentNeeded: [
        'Continuous ECG monitoring for pattern recognition',
        'Event recording capability for documentation',
        'Emergency antiarrhythmic medications',
        'Laboratory capability for electrolyte assessment'
      ]
    },
    {
      id: 'ecg-interpretation-step-7',
      stepNumber: 7,
      title: 'Clinical Correlation and Treatment Decisions',
      description: 'Correlate ECG findings with clinical presentation and determine appropriate treatment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Assess patient symptoms: chest pain, dyspnea, palpitations, syncope',
        'Correlate rhythm with hemodynamic status and perfusion',
        'Evaluate for underlying causes: medications, electrolytes, ischemia',
        'Determine treatment urgency based on symptoms and rhythm stability',
        'Consider medication effects: beta-blockers, digitalis, antiarrhythmics',
        'Assess for signs of hemodynamic compromise requiring immediate intervention',
        'Plan monitoring strategy and frequency of rhythm assessment',
        'Document clinical correlation and treatment rationale'
      ],
      safetyNotes: [
        'ECG findings must be interpreted in clinical context',
        'Asymptomatic arrhythmias may not require immediate treatment',
        'Patient symptoms take precedence over rhythm appearance'
      ],
      equipmentNeeded: [
        'Comprehensive patient assessment tools',
        'Vital sign monitoring equipment',
        'Emergency treatment medications',
        'Communication equipment for consultation'
      ]
    },
    {
      id: 'ecg-interpretation-step-8',
      stepNumber: 8,
      title: 'Documentation and Communication',
      description: 'Document ECG interpretation and communicate findings to appropriate medical personnel',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Document specific rhythm interpretation with rate and characteristics',
        'Record any rhythm changes during monitoring period',
        'Note clinical correlation between rhythm and patient symptoms',
        'Communicate critical findings to receiving medical team',
        'Provide ECG strips with interpretation for medical record',
        'Document any treatments given and patient response',
        'Include recommendations for ongoing cardiac monitoring',
        'Arrange appropriate level of care based on rhythm significance'
      ],
      safetyNotes: [
        'Accurate documentation essential for continuity of care',
        'Critical rhythms require immediate communication to physicians',
        'ECG strips provide objective evidence of rhythm disturbances'
      ],
      equipmentNeeded: [
        'ECG strips with clear rhythm documentation',
        'Documentation materials and forms',
        'Communication equipment for medical consultation',
        'Patient transport with continued monitoring capability'
      ]
    }
  ],

  '3-lead-ecg-interpretation': {
    name: '3 Lead ECG Interpretation',
    category: 'cardiac',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 18,
    isCritical: true,
    objectives: [
      'Demonstrate proper 3-lead ECG electrode placement and equipment setup techniques',
      'Perform systematic cardiac rhythm analysis using standardized interpretation methods',
      'Recognize and classify common cardiac arrhythmias and conduction abnormalities',
      'Identify and troubleshoot ECG artifact and equipment-related problems',
      'Correlate ECG findings with patient clinical presentation and hemodynamic status',
      'Make appropriate treatment decisions based on rhythm interpretation and patient stability',
      'Establish continuous cardiac monitoring and trend analysis protocols',
      'Document and communicate ECG findings effectively to receiving medical teams'
    ],
    indications: [
      'Chest pain or suspected cardiac symptoms requiring rhythm analysis',
      'Patients with known cardiac arrhythmias needing continuous monitoring',
      'Syncope or pre-syncope episodes requiring cardiac rhythm evaluation',
      'Medication administration requiring cardiac rhythm monitoring',
      'Any patient requiring ongoing cardiac status assessment during transport',
      'Post-cardiac arrest patients requiring continuous rhythm surveillance'
    ],
    contraindications: [
      'No absolute contraindications for diagnostic ECG monitoring',
      'Relative caution with severe skin breakdown preventing electrode adhesion',
      'Patient agitation preventing adequate electrode placement and monitoring'
    ],
    equipment: [
      '3-lead ECG monitoring device with rhythm analysis capability',
      'ECG electrodes and lead wires with appropriate color coding',
      'Alcohol preparation wipes and skin preparation materials',
      'Razor or clippers for hair removal if needed for electrode contact',
      'Rhythm strip recording capability for documentation',
      'Defibrillator with emergency cardiac medications for arrhythmia treatment'
    ]
  },

  // 38. BANDAGE/TRIANGULAR BANDAGE APPLICATION - Evidence-based wound dressing and support techniques
  'bandage-triangular-application': [
    {
      id: 'bandage-step-1',
      stepNumber: 1,
      title: 'Wound Assessment and Bandage Selection',
      description: 'Assess wound characteristics and select appropriate bandage type and application method',
      isRequired: true,
      isCritical: false,
      timeEstimate: 120,
      keyPoints: [
        'Assess wound size, depth, and location for appropriate bandage selection',
        'Evaluate for active bleeding requiring pressure dressing techniques',
        'Check for signs of infection: redness, swelling, purulent drainage',
        'Determine if triangular bandage or standard bandage more appropriate',
        'Consider patient mobility needs and bandage durability requirements',
        'Assess for allergies to adhesive materials or antiseptics',
        'Evaluate need for padding or support in addition to wound coverage',
        'Document wound characteristics before covering with bandage'
      ],
      safetyNotes: [
        'Clean wound assessment before bandage application',
        'Document wound appearance for monitoring healing progress',
        'Consider tetanus prophylaxis needs for contaminated wounds'
      ],
      equipmentNeeded: [
        'Various bandage sizes and types available',
        'Triangular bandages for support and immobilization',
        'Wound assessment materials and documentation tools',
        'Personal protective equipment (gloves)'
      ]
    },
    {
      id: 'bandage-step-2',
      stepNumber: 2,
      title: 'Wound Cleaning and Preparation',
      description: 'Clean wound area and prepare skin for bandage application using sterile technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Don clean gloves and use universal precautions',
        'Irrigate wound gently with sterile saline or clean water',
        'Remove visible debris and foreign material carefully',
        'Clean surrounding skin with antiseptic solution working outward from wound',
        'Pat skin dry with sterile gauze before bandage application',
        'Avoid getting antiseptic directly in open wound',
        'Apply topical antibiotic if indicated and not contraindicated',
        'Allow antiseptic to dry completely before applying adhesive bandages'
      ],
      contraindications: [
        'Do not use hydrogen peroxide on deep or chronic wounds',
        'Avoid antiseptics in patients with known allergies',
        'Do not irrigate wounds with visible foreign bodies requiring surgical removal'
      ],
      safetyNotes: [
        'Sterile technique prevents wound contamination and infection',
        'Gentle irrigation prevents further tissue damage',
        'Complete drying prevents bandage adhesion problems'
      ],
      equipmentNeeded: [
        'Sterile saline or clean irrigation solution',
        'Antiseptic solutions (povidone-iodine, chlorhexidine)',
        'Sterile gauze pads for cleaning and drying',
        'Topical antibiotics if indicated'
      ]
    },
    {
      id: 'bandage-step-3',
      stepNumber: 3,
      title: 'Standard Bandage Application Technique',
      description: 'Apply standard adhesive or gauze bandages using proper technique for wound protection',
      isRequired: true,
      isCritical: false,
      timeEstimate: 150,
      keyPoints: [
        'Select bandage size that extends 1-2cm beyond wound edges',
        'Remove backing from adhesive bandages without contaminating pad',
        'Center bandage pad over wound without touching sterile surface',
        'Apply gentle, even pressure to ensure adhesion around wound edges',
        'Smooth bandage to remove air bubbles and wrinkles',
        'For gauze bandages: secure with tape or wrap, avoiding circumferential taping',
        'Ensure bandage does not restrict circulation in extremities',
        'Check that bandage provides adequate coverage and protection'
      ],
      safetyNotes: [
        'Circumferential taping can cause constriction with swelling',
        'Avoid touching sterile pad to maintain wound cleanliness',
        'Ensure adequate but not excessive tension to prevent circulation compromise'
      ],
      equipmentNeeded: [
        'Adhesive bandages in appropriate sizes',
        'Sterile gauze pads and medical tape',
        'Non-adherent dressing pads for sensitive wounds',
        'Elastic wrap if additional support needed'
      ]
    },
    {
      id: 'bandage-step-4',
      stepNumber: 4,
      title: 'Triangular Bandage Folding and Preparation',
      description: 'Properly fold and prepare triangular bandage for specific application methods',
      isRequired: true,
      isCritical: false,
      timeEstimate: 90,
      keyPoints: [
        'For broad fold: fold triangular bandage in half twice to create wide band',
        'For narrow fold: fold broad fold in half again for narrow support band',
        'For sling application: use full triangle with point at elbow',
        'Ensure fabric is clean and free from tears or weak spots',
        'Check that folded edges are smooth and even',
        'Prepare adequate length for secure tying and adjustment',
        'Consider patient comfort and range of motion needs',
        'Have safety pins available for additional security if needed'
      ],
      safetyNotes: [
        'Proper folding ensures even pressure distribution',
        'Check fabric integrity to prevent failure during use',
        'Safety pins should be placed away from wound sites'
      ],
      equipmentNeeded: [
        'Clean triangular bandages in appropriate sizes',
        'Safety pins for additional security',
        'Scissors for adjusting bandage length if needed'
      ]
    },
    {
      id: 'bandage-step-5',
      stepNumber: 5,
      title: 'Arm Sling Application',
      description: 'Apply triangular bandage as arm sling for upper extremity support and immobilization',
      isRequired: true,
      isCritical: false,
      timeEstimate: 180,
      keyPoints: [
        'Position injured arm across chest with hand elevated above elbow',
        'Place triangular bandage with point at injured elbow',
        'Bring upper end around neck on uninjured side',
        'Bring lower end up and over injured arm to meet at neck',
        'Tie ends securely at side of neck, not at back',
        'Adjust sling to support wrist and hand properly',
        'Fold point at elbow and secure with safety pin or tape',
        'Check circulation in fingers after application'
      ],
      safetyNotes: [
        'Sling should support arm without restricting circulation',
        'Tying at back of neck can be uncomfortable and unstable',
        'Check finger circulation and sensation after application'
      ],
      equipmentNeeded: [
        'Large triangular bandage for sling application',
        'Safety pins or tape for securing fold at elbow',
        'Padding for comfort at neck if needed'
      ]
    },
    {
      id: 'bandage-step-6',
      stepNumber: 6,
      title: 'Head and Scalp Bandaging',
      description: 'Apply triangular bandage for head and scalp wound protection and pressure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 210,
      keyPoints: [
        'Place sterile pad over scalp wound before bandage application',
        'Position triangular bandage with base at forehead above eyebrows',
        'Bring sides of bandage down around ears and back of head',
        'Cross bandage ends at nape of neck and bring forward',
        'Tie ends securely at forehead or temple area',
        'Pull point of triangle down over back of head and tuck under',
        'Ensure bandage applies gentle pressure without restricting breathing',
        'Check that ears are comfortable and not compressed'
      ],
      contraindications: [
        'Avoid excessive pressure over suspected skull fractures',
        'Do not cover eyes unless specifically treating eye injuries',
        'Avoid restricting airway with tight bandaging around neck'
      ],
      safetyNotes: [
        'Head bandages can shift and require frequent checking',
        'Monitor for signs of increased intracranial pressure',
        'Ensure patient comfort and ability to communicate'
      ],
      equipmentNeeded: [
        'Triangular bandage large enough for head coverage',
        'Sterile gauze pads for wound coverage',
        'Additional padding if needed for comfort'
      ]
    },
    {
      id: 'bandage-step-7',
      stepNumber: 7,
      title: 'Circulation and Comfort Assessment',
      description: 'Assess bandage effectiveness and patient comfort, adjusting as needed',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Check circulation distal to bandage: color, warmth, capillary refill',
        'Assess sensation and movement in affected area',
        'Ask patient about comfort level and pain changes',
        'Look for signs of bandage being too tight: swelling, numbness',
        'Check that bandage maintains position and provides adequate coverage',
        'Assess for pressure points or chafing from bandage edges',
        'Adjust tightness if circulation appears compromised',
        'Document circulation status and bandage effectiveness'
      ],
      safetyNotes: [
        'Compromised circulation requires immediate bandage adjustment',
        'Swelling may occur after initial application requiring loosening',
        'Regular monitoring essential for early complication detection'
      ],
      equipmentNeeded: [
        'Assessment tools for circulation evaluation',
        'Additional bandage materials for adjustments',
        'Documentation materials for monitoring records'
      ]
    },
    {
      id: 'bandage-step-8',
      stepNumber: 8,
      title: 'Patient Education and Follow-up Instructions',
      description: 'Educate patient on bandage care and provide instructions for monitoring and follow-up',
      isRequired: true,
      isCritical: false,
      timeEstimate: 180,
      keyPoints: [
        'Explain signs of circulation problems requiring immediate attention',
        'Teach patient how to check for numbness, tingling, or color changes',
        'Provide instructions for keeping bandage dry and clean',
        'Explain when to change bandage and how to do it safely',
        'Describe signs of infection requiring medical attention',
        'Provide wound care instructions and activity limitations',
        'Schedule appropriate follow-up appointment for wound evaluation',
        'Give written instructions for home care and warning signs'
      ],
      safetyNotes: [
        'Patient education critical for preventing complications',
        'Clear instructions prevent improper self-care',
        'Follow-up ensures proper healing and complication detection'
      ],
      equipmentNeeded: [
        'Patient education materials and written instructions',
        'Demonstration materials for teaching bandage care',
        'Contact information for follow-up questions',
        'Additional bandage supplies for home use'
      ]
    }
  ],

  'bandage-triangular-application': {
    name: 'Application of Bandage/Triangular Bandage',
    category: 'trauma',
    difficultyLevel: 'BEGINNER' as const,
    timeEstimateMinutes: 15,
    isCritical: false,
    objectives: [
      'Assess wound characteristics and determine appropriate bandaging requirements',
      'Demonstrate proper triangular bandage folding techniques for different applications',
      'Apply triangular bandages to head, scalp, and facial wounds using correct technique',
      'Secure chest and abdominal wounds with appropriate bandage applications',
      'Create slings and support devices for arm and shoulder injuries',
      'Monitor bandage effectiveness and assess for circulation compromise',
      'Recognize and manage complications related to bandage application'
    ],
    indications: [
      'Open wounds requiring protection and hemorrhage control',
      'Lacerations and abrasions needing secure dressing coverage',
      'Arm injuries requiring sling support and immobilization',
      'Head and scalp wounds needing pressure and protection',
      'Burns requiring non-adherent dressing coverage',
      'Any wound requiring secure, long-term dressing stability'
    ],
    contraindications: [
      'Impaled objects requiring stabilization rather than bandage coverage',
      'Severely contaminated wounds needing surgical debridement first',
      'Circumferential burns where bandages might compromise circulation'
    ],
    equipment: [
      'Triangular bandages in various sizes for different body areas',
      'Sterile gauze pads and non-adherent dressings',
      'Medical tape and securing materials',
      'Scissors for cutting and trimming bandage materials',
      'Safety pins for securing bandage ends if appropriate',
      'Antiseptic solution for wound cleaning prior to bandaging'
    ]
  },

  'nebulization-medication': {
    name: 'Nebulization of Medication',
    category: 'pharmacology',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Assess patient respiratory status and verify indications for nebulized therapy',
      'Set up and operate nebulizer equipment with proper medication preparation',
      'Position patient optimally and provide education about nebulizer treatment',
      'Administer nebulized medications using correct technique and monitoring',
      'Monitor patient response and vital signs throughout treatment duration',
      'Evaluate treatment effectiveness and determine need for additional therapy',
      'Recognize and manage adverse reactions to nebulized medications',
      'Document treatment comprehensively and communicate results to receiving team'
    ],
    indications: [
      'Acute asthma exacerbation with bronchospasm requiring bronchodilator therapy',
      'COPD exacerbation with respiratory distress and airway obstruction',
      'Respiratory distress with wheeze responsive to bronchodilator treatment',
      'Allergic reactions with bronchospasm as component of anaphylaxis treatment',
      'Croup or other upper airway conditions responsive to nebulized therapy'
    ],
    contraindications: [
      'Known hypersensitivity to specific nebulized medications (albuterol, ipratropium)',
      'Severe cardiac arrhythmias that may be worsened by beta-agonist therapy',
      'Patient inability to cooperate with treatment or protect airway',
      'Severe upper airway obstruction preventing effective medication delivery'
    ],
    equipment: [
      'Nebulizer device with mask or mouthpiece attachments',
      'Oxygen source or air compressor with appropriate flow capabilities',
      'Prescribed medications including albuterol and ipratropium bromide',
      'Normal saline for medication dilution if required',
      'Pulse oximetry for continuous oxygen saturation monitoring',
      'Stethoscope for respiratory assessment before and after treatment'
    ]
  },

  'etco2-monitoring': {
    name: 'ETCO2 Monitoring',
    category: 'monitoring',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 25,
    isCritical: true,
    description: 'Continuous monitoring of end-tidal carbon dioxide levels to assess ventilation, circulation, and metabolism',
    objectives: [
      'Establish baseline ETCO2 values and waveform morphology for trending',
      'Continuously monitor patient ventilatory status and respiratory function',
      'Detect early signs of respiratory compromise or airway complications',
      'Guide mechanical ventilation parameters and therapeutic interventions',
      'Monitor effectiveness of resuscitation efforts during cardiac arrest',
      'Assess patient response to bronchodilator and other respiratory therapies',
      'Identify technical problems with airway devices or monitoring equipment',
      'Provide objective data for clinical decision-making and patient transport'
    ],
    indications: [
      'All intubated patients requiring mechanical ventilation support',
      'Patients receiving conscious sedation or general anesthesia',
      'Spontaneously breathing patients with respiratory compromise or failure',
      'During cardiopulmonary resuscitation to assess CPR effectiveness',
      'Patients with suspected airway obstruction or bronchospasm',
      'Monitoring during transport of critically ill patients with airway devices',
      'Patients receiving nebulized bronchodilator therapy for respiratory distress',
      'Post-intubation confirmation and ongoing airway monitoring'
    ],
    contraindications: [
      'Patient safety concerns that outweigh monitoring benefits',
      'Severe facial trauma preventing proper sensor placement',
      'Complete nasal obstruction when using nasal sampling methods',
      'Equipment malfunction or lack of properly functioning monitoring devices'
    ],
    equipment: [
      'ETCO2 monitor/module with waveform display capability',
      'Appropriate sampling lines (nasal cannula or inline adapters)',
      'Power source or charged battery backup for monitoring equipment',
      'Calibration materials and reference standards as required',
      'Documentation materials for recording trends and values',
      'Backup monitoring equipment and replacement sensors'
    ]
  },

  'intramuscular-injection': {
    name: 'Intramuscular Injection',
    category: 'medication',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    description: 'Safe administration of medications via intramuscular route using proper injection techniques and site selection',
    objectives: [
      'Verify patient identity and medication orders using five rights of administration',
      'Select appropriate injection site based on patient anatomy and medication volume',
      'Prepare medication and equipment using sterile technique principles',
      'Perform injection using safe technique to minimize patient discomfort',
      'Monitor patient for immediate adverse reactions and complications',
      'Provide patient education regarding medication effects and follow-up care',
      'Document procedure and patient response according to medical standards',
      'Ensure proper disposal of sharps and maintain infection control protocols'
    ],
    indications: [
      'Medications that require intramuscular absorption for therapeutic effect',
      'Patients unable to take oral medications due to nausea or consciousness level',
      'Emergency medications requiring rapid absorption (epinephrine, naloxone)',
      'Vaccines and immunizations requiring intramuscular administration',
      'Long-acting medications requiring depot injection into muscle tissue',
      'Medications with poor oral bioavailability requiring parenteral route',
      'Patients with contraindications to intravenous medication administration'
    ],
    contraindications: [
      'Known severe allergies to prescribed medication or injection components',
      'Infection, inflammation, or tissue damage at proposed injection site',
      'Severe bleeding disorders or anticoagulation therapy (relative contraindication)',
      'Shock or severe dehydration affecting muscle perfusion and absorption',
      'Patient refusal of treatment after informed consent discussion'
    ],
    equipment: [
      'Prescribed medication in appropriate concentration and volume',
      'Sterile syringe (1-5mL) and needles (drawing and injection)',
      'Alcohol prep pads and antiseptic cleaning supplies',
      'Sterile gloves and appropriate personal protective equipment',
      'Sharps disposal container and medical waste materials',
      'Emergency medications for allergic reactions (epinephrine, diphenhydramine)',
      'Patient identification materials and medication administration record',
      'Gauze pads, adhesive bandages, and post-injection care supplies'
    ]
  },

  'nasopharyngeal-airway-insertion': {
    name: 'Nasopharyngeal Airway Insertion',
    category: 'airway',
    difficultyLevel: 'BEGINNER' as const,
    timeEstimateMinutes: 15,
    isCritical: true,
    description: 'Insertion of nasopharyngeal airway to maintain upper airway patency in patients with compromised consciousness',
    objectives: [
      'Assess patient airway status and determine appropriate indication for NPA use',
      'Select proper nasopharyngeal airway size based on patient anatomy',
      'Insert NPA using safe technique to minimize trauma and complications',
      'Verify proper placement and airway patency after insertion',
      'Secure airway device and establish continuous monitoring protocol',
      'Monitor for complications and maintain airway function during transport',
      'Provide patient education and comfort measures as appropriate',
      'Document procedure and communicate findings to healthcare team'
    ],
    indications: [
      'Decreased level of consciousness with intact gag reflex',
      'Upper airway obstruction due to tongue or soft tissue collapse',
      'Patients requiring airway maintenance during transport or procedures',
      'Alternative to oral airway when mouth cannot be opened',
      'Semiconscious patients who cannot tolerate oral pharyngeal airway',
      'Airway management in patients with trismus or facial trauma',
      'Maintenance of airway patency during sedation or anesthesia'
    ],
    contraindications: [
      'Suspected or confirmed basilar skull fracture',
      'Severe coagulopathy or bleeding disorders',
      'Active severe epistaxis (nosebleed)',
      'Complete nasal obstruction or severe nasal deformity',
      'Recent nasal surgery or trauma with suspected CSF leak'
    ],
    equipment: [
      'Nasopharyngeal airways in multiple sizes (28-36 French for adults)',
      'Water-soluble lubricant (K-Y jelly or similar)',
      'Safety pin or tape for securing airway',
      'Suction equipment and catheters',
      'Pulse oximetry and monitoring equipment',
      'Topical nasal decongestant if available',
      'Personal protective equipment (gloves, face protection)',
      'Backup airway management supplies'
    ]
  },

  'adult-choking-without-equipment': {
    name: 'Adult Choking Without Equipment',
    category: 'airway',
    difficultyLevel: 'BEGINNER' as const,
    timeEstimateMinutes: 10,
    isCritical: true,
    description: 'Emergency management of complete airway obstruction in conscious adults using manual techniques only',
    objectives: [
      'Rapidly recognize and assess severity of choking emergency',
      'Perform effective back blows to attempt obstruction dislodgement',
      'Execute proper abdominal thrusts (Heimlich maneuver) technique',
      'Alternate between back blows and abdominal thrusts until obstruction clears',
      'Manage patient who becomes unconscious during choking episode',
      'Provide post-obstruction care and monitoring for complications',
      'Document incident and arrange appropriate medical follow-up',
      'Recognize when to transition to CPR if patient becomes unconscious'
    ],
    indications: [
      'Complete airway obstruction with inability to speak or cough effectively',
      'Partial obstruction that progresses to complete obstruction',
      'Patient demonstrating universal choking sign (hands clutching throat)',
      'Witnessed foreign body ingestion with subsequent respiratory distress',
      'Silent patient with obvious signs of choking distress and cyanosis'
    ],
    contraindications: [
      'Effective coughing with good air exchange (partial obstruction)',
      'Pregnant patients (use chest thrusts instead of abdominal thrusts)',
      'Infants under 1 year (requires different technique)',
      'Patient with known severe abdominal injuries (relative contraindication)'
    ],
    equipment: [
      'No equipment required for basic manual techniques',
      'Communication device to call for emergency services',
      'Barrier device for rescue breathing if available',
      'Pulse oximetry if available for post-obstruction monitoring',
      'Supplemental oxygen if available',
      'Transport arrangements for medical evaluation'
    ]
  },

  'oropharyngeal-suctioning': {
    name: 'Oropharyngeal Suctioning',
    category: 'airway',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 15,
    isCritical: true,
    description: 'Removal of secretions, blood, or debris from oral cavity and oropharynx to maintain airway patency',
    objectives: [
      'Assess patient need for oropharyngeal suctioning based on clinical indicators',
      'Prepare and test suctioning equipment to ensure proper function',
      'Position patient safely to optimize suctioning effectiveness and prevent aspiration',
      'Perform initial oral cavity suctioning using appropriate technique',
      'Continue with deep pharyngeal suctioning while monitoring patient response',
      'Verify airway clearance and assess improvement in respiratory status',
      'Maintain equipment cleanliness and readiness for continued use',
      'Document procedure and establish ongoing monitoring plan'
    ],
    indications: [
      'Visible secretions, blood, or debris in oral cavity or oropharynx',
      'Ineffective cough reflex with secretion retention',
      'Decreased level of consciousness with inability to clear secretions',
      'Respiratory distress due to airway obstruction from secretions',
      'Post-intubation or airway procedure secretion management',
      'Trauma patients with blood or debris in upper airway',
      'Preparation for airway interventions requiring clear visualization'
    ],
    contraindications: [
      'Severe laryngeal trauma or suspected laryngeal fracture',
      'Suspected epiglottitis in pediatric patients (relative)',
      'Severe coagulopathy with high bleeding risk from stimulation',
      'Conscious patient with strong gag reflex who can clear own secretions'
    ],
    equipment: [
      'Portable or wall-mounted suction unit with adequate pressure capability',
      'Rigid suction catheter (Yankauer tip) for thick secretions',
      'Flexible suction catheters in various sizes',
      'Suction tubing and secure connections',
      'Collection canister with measurement markings',
      'Personal protective equipment (gloves, face shield, gown)',
      'Patient positioning aids and towels',
      'Pulse oximetry and monitoring equipment'
    ]
  },

  'endotracheal-tube-suctioning': {
    name: 'Endotracheal Tube Suctioning',
    category: 'airway',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    description: 'Sterile removal of secretions from endotracheal tube and lower airways in intubated patients',
    objectives: [
      'Assess intubated patient for clinical indicators requiring endotracheal suctioning',
      'Prepare sterile suctioning equipment and maintain strict infection control',
      'Provide adequate pre-oxygenation to prevent hypoxic complications',
      'Insert suction catheter to appropriate depth using sterile technique',
      'Apply effective suctioning while monitoring patient physiological response',
      'Restore mechanical ventilation and assess procedure effectiveness',
      'Maintain equipment sterility and dispose of materials safely',
      'Document procedure and establish ongoing airway management plan'
    ],
    indications: [
      'Visible secretions in endotracheal tube or ventilator circuit',
      'Coarse breath sounds with evidence of secretion retention',
      'Increased peak airway pressures on mechanical ventilator',
      'Decreased tidal volumes or poor chest expansion despite adequate ventilation',
      'Patient agitation or ventilator dysynchrony due to secretions',
      'Arterial blood gas deterioration with retained CO2',
      'Preparation for extubation or airway procedures'
    ],
    contraindications: [
      'Severe hypoxemia that cannot be corrected with pre-oxygenation',
      'Untreated pneumothorax or recent lung surgery',
      'Severe cardiovascular instability or recent myocardial infarction',
      'Increased intracranial pressure (relative contraindication)',
      'Severe coagulopathy with high risk of pulmonary hemorrhage'
    ],
    equipment: [
      'Sterile suction catheters sized appropriately for ETT (10-14 French)',
      'Sterile gloves and normal saline for irrigation',
      'Suction unit with adjustable pressure (100-150 mmHg)',
      'Mechanical ventilator or manual ventilation bag with 100% oxygen',
      'Continuous cardiac and oxygen saturation monitoring',
      'Sterile collection containers and biohazard disposal',
      'Personal protective equipment including eye protection',
      'Emergency resuscitation medications and airway equipment'
    ]
  },

  'modified-valsalva-maneuver': {
    name: 'Modified Valsalva Maneuver',
    category: 'cardiac',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 25,
    isCritical: true,
    description: 'Enhanced vagal maneuver using position changes to convert supraventricular tachycardia to normal sinus rhythm',
    objectives: [
      'Accurately identify appropriate supraventricular tachycardia for vagal maneuver',
      'Properly position and prepare patient for modified Valsalva technique',
      'Execute standard Valsalva maneuver with appropriate monitoring',
      'Perform modified technique with passive leg raise if initial attempt fails',
      'Monitor patient response and assess for successful rhythm conversion',
      'Plan alternative interventions if Valsalva maneuver unsuccessful',
      'Provide patient education and arrange appropriate cardiac follow-up',
      'Document procedure thoroughly and communicate findings to healthcare team'
    ],
    indications: [
      'Narrow-complex supraventricular tachycardia with regular rhythm',
      'Heart rate typically >150 bpm in hemodynamically stable patients',
      'Patient conscious and able to follow instructions for Valsalva',
      'Failed response to simple vagal maneuvers (carotid massage, ice water)',
      'Alternative to immediate pharmacologic intervention in stable patients',
      'Patient preference for non-pharmacologic intervention when appropriate'
    ],
    contraindications: [
      'Hemodynamic instability or signs of cardiovascular compromise',
      'Wide-complex tachycardia or uncertain rhythm diagnosis',
      'Atrial fibrillation or atrial flutter with irregular rhythms',
      'Recent myocardial infarction or unstable angina',
      'Severe heart failure or cardiogenic shock',
      'Patient inability to cooperate or follow instructions',
      'Severe carotid artery disease or history of stroke'
    ],
    equipment: [
      '12-lead ECG machine and continuous cardiac monitoring',
      'Adjustable hospital bed or stretcher for position changes',
      'Blood pressure monitoring and pulse oximetry equipment',
      'IV access and emergency cardiac medications (adenosine, atropine)',
      'Defibrillator with synchronized cardioversion capability',
      'Timer or stopwatch for procedure timing',
      'Emergency resuscitation equipment and airway management supplies',
      'Documentation materials and ECG rhythm strips'
    ]
  },

  'oropharyngeal-airway-insertion': {
    name: 'Oropharyngeal Airway Insertion',
    category: 'airway',
    difficultyLevel: 'BEGINNER' as const,
    timeEstimateMinutes: 12,
    isCritical: true,
    description: 'Insertion of oral airway device to maintain upper airway patency in unconscious patients',
    objectives: [
      'Assess patient consciousness level and appropriateness for oropharyngeal airway',
      'Select proper airway size based on patient anatomy and measurements',
      'Position patient optimally and prepare oral cavity for insertion',
      'Insert OPA using correct technique to avoid airway trauma or obstruction',
      'Verify proper placement and assess improvement in airway patency',
      'Secure airway and establish continuous monitoring protocol',
      'Perform ongoing assessment and maintain optimal airway function',
      'Document procedure and plan for airway transition or advanced management'
    ],
    indications: [
      'Unconscious patient with absent or significantly diminished gag reflex',
      'Upper airway obstruction due to tongue or soft tissue collapse',
      'Need for airway maintenance during bag-valve mask ventilation',
      'Temporary airway management before advanced airway placement',
      'Patient positioning to optimize airway patency during transport',
      'Adjunct to other airway management techniques in unconscious patients'
    ],
    contraindications: [
      'Conscious or semiconscious patient with intact gag reflex',
      'Severe facial trauma preventing proper insertion or sizing',
      'Suspected foreign body obstruction requiring immediate removal',
      'Severe trismus (lockjaw) preventing mouth opening',
      'Recent oral or maxillofacial surgery with tissue friability'
    ],
    equipment: [
      'Oropharyngeal airways in multiple sizes (adult: 80-100mm, pediatric: 40-70mm)',
      'Personal protective equipment (gloves, face shield)',
      'Suction equipment with Yankauer catheter',
      'Bag-valve mask for ventilation assessment',
      'Pulse oximetry and continuous monitoring equipment',
      'Tongue depressors for alternative insertion technique',
      'Medical tape or bite block for securing if needed',
      'Backup airway management supplies (NPA, advanced airway equipment)'
    ]
  },

  'traction-splint': {
    name: 'Traction Splint Application',
    category: 'trauma',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 35,
    isCritical: true,
    description: 'Application of mechanical traction splint for femoral shaft fractures to reduce pain and prevent further injury',
    objectives: [
      'Assess patient for femur fracture and determine appropriateness for traction splinting',
      'Select appropriate traction splint equipment and verify proper function',
      'Prepare patient and position safely for traction splint application',
      'Apply ankle hitch securely while maintaining distal neurovascular function',
      'Position traction splint properly and prepare for mechanical traction',
      'Apply appropriate mechanical traction and secure entire splint system',
      'Assess neurovascular status and establish continuous monitoring protocol',
      'Document procedure and prepare for safe transport with ongoing monitoring'
    ],
    indications: [
      'Closed femoral shaft fractures with deformity and pain',
      'Open femur fractures without protruding bone fragments',
      'Suspected femur fracture with thigh pain, swelling, and shortening',
      'Hemodynamically stable patients with isolated femur injuries',
      'Need for pain control and fracture stabilization during transport'
    ],
    contraindications: [
      'Hip fractures or hip dislocations (absolute contraindication)',
      'Knee injuries or suspected knee dislocation on same extremity',
      'Open fractures with protruding bone fragments',
      'Severe crush injuries to lower extremity',
      'Pelvic fractures with suspected acetabular involvement',
      'Ankle or foot fractures on same extremity',
      'Life-threatening injuries requiring immediate intervention'
    ],
    equipment: [
      'Hare traction splint or Sager splint with all components',
      'Ankle hitch with adequate soft padding materials',
      'Securing straps, buckles, and adjustment mechanisms',
      'Doppler ultrasound for distal pulse assessment',
      'Pain medication and administration supplies if available',
      'Neurovascular assessment tools (cotton, pinprick testing)',
      'Documentation forms and transport securing devices',
      'Photography equipment for documentation if protocols permit'
    ]
  },

  'bag-valve-mask-nebulizer': {
    name: 'Bag Valve Mask with In-line Nebulization',
    category: 'respiratory',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 30,
    isCritical: true,
    description: 'Combined ventilation assistance and nebulized medication delivery for patients with severe bronchospasm',
    objectives: [
      'Assess patient respiratory status and determine need for combined ventilation and medication',
      'Prepare bag-valve mask system with in-line nebulizer and appropriate medications',
      'Position patient optimally and apply mask with proper seal for effective treatment',
      'Initiate assisted ventilation while beginning nebulized medication delivery',
      'Monitor patient response and adjust ventilation technique throughout treatment',
      'Complete full nebulization treatment and assess therapeutic response',
      'Clean equipment properly and prepare for ongoing respiratory care',
      'Document treatment comprehensively and plan for continued care'
    ],
    indications: [
      'Severe bronchospasm with inadequate spontaneous ventilation',
      'Status asthmaticus requiring assisted ventilation and bronchodilators',
      'COPD exacerbation with respiratory failure and bronchospasm',
      'Patients unable to cooperate with standard nebulizer treatments',
      'Need for positive pressure ventilation combined with bronchodilator therapy',
      'Emergency treatment of severe respiratory distress with wheezing'
    ],
    contraindications: [
      'Pneumothorax or suspected pneumothorax (relative contraindication)',
      'Severe hemodynamic instability that would worsen with positive pressure',
      'Known severe allergy to prescribed nebulized medications',
      'Facial trauma preventing adequate mask seal',
      'Active vomiting with high aspiration risk'
    ],
    equipment: [
      'Bag-valve mask with reservoir bag and appropriately sized face masks',
      'In-line nebulizer chamber with oxygen connection tubing',
      'Prescribed nebulized medications (albuterol, ipratropium bromide)',
      'Normal saline for medication dilution and sterile syringes',
      'Oxygen source with adequate flow control (6-8 L/min minimum)',
      'Continuous monitoring equipment (pulse oximetry, cardiac monitor)',
      'Suction equipment ready for immediate use if needed',
      'Peak flow meter and respiratory assessment tools'
    ]
  },

  'phonetic-alphabet': {
    name: 'Phonetic Alphabet Communication',
    category: 'communication',
    difficultyLevel: 'BEGINNER' as const,
    timeEstimateMinutes: 15,
    isCritical: true,
    description: 'Standardized phonetic alphabet usage for clear and accurate radio communication in emergency services',
    objectives: [
      'Assess communication needs and prepare for clear radio transmission',
      'Demonstrate mastery of NATO phonetic alphabet for accurate spelling',
      'Apply phonetic alphabet specifically for medical terms and medication names',
      'Execute proper radio transmission procedures incorporating phonetic protocols',
      'Maintain clear phonetic communication during high-stress emergency situations',
      'Coordinate communications with multiple agencies using standardized phonetics',
      'Implement quality assurance and continuous improvement for communication skills',
      'Document communications appropriately using phonetic spelling standards'
    ],
    indications: [
      'Radio communication in noisy or challenging environments',
      'Transmission of critical patient information requiring accuracy',
      'Medication names with potential for confusion or misinterpretation',
      'Patient names with unusual spelling or pronunciation',
      'Inter-agency communications requiring precise information exchange',
      'Emergency situations where communication clarity is essential',
      'Legal documentation requiring verified spelling accuracy'
    ],
    contraindications: [
      'Time-critical emergencies where phonetic spelling would cause dangerous delays',
      'Situations where standard verbal communication is clearly understood',
      'Non-critical routine communications not requiring precise spelling'
    ],
    equipment: [
      'Functioning radio communication device with clear audio transmission',
      'NATO phonetic alphabet reference card or chart',
      'Backup communication devices (cell phone, alternative radio channels)',
      'Communication log books and documentation forms',
      'Standard operating procedures for radio protocols',
      'Emergency medication reference list for phonetic practice',
      'Multi-agency communication protocols manual',
      'Training materials and continuing education resources'
    ]
  },

  'venous-blood-sampling': {
    name: 'Venous Blood Sampling',
    category: 'diagnostic',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    description: 'Safe collection of venous blood specimens for laboratory analysis using sterile technique',
    objectives: [
      'Assess patient condition and verify orders for blood sampling procedures',
      'Prepare appropriate equipment and verify laboratory requirements',
      'Select optimal venipuncture site and prepare area using sterile technique',
      'Perform venipuncture safely and collect required blood specimens',
      'Provide appropriate post-collection care and ensure hemostasis',
      'Process specimens correctly and verify accurate labeling',
      'Monitor patient for complications and provide follow-up care',
      'Document procedure comprehensively and coordinate with laboratory'
    ],
    indications: [
      'Laboratory testing requiring blood specimens for diagnosis',
      'Monitoring of medication levels or therapeutic drug monitoring',
      'Assessment of organ function through blood chemistry analysis',
      'Evaluation of infection through blood culture collection',
      'Monitoring of coagulation status or bleeding parameters',
      'Blood typing and crossmatching for transfusion preparation'
    ],
    contraindications: [
      'Severe bleeding disorders or extremely low platelet counts',
      'Infection or cellulitis at proposed puncture site',
      'Arteriovenous fistula or graft in extremity (avoid that arm)',
      'Severe burns or trauma at potential puncture sites',
      'Patient refusal after informed consent discussion'
    ],
    equipment: [
      'Blood collection needles in appropriate gauges (21-23G)',
      'Various collection tubes based on laboratory requirements',
      'Tourniquet and antiseptic preparation materials',
      'Sterile gloves and gauze pads for hemostasis',
      'Specimen labels and laboratory requisition forms',
      'Needle safety devices and sharps disposal container',
      'Patient monitoring equipment for vasovagal reactions',
      'Emergency supplies for complication management'
    ]
  },

  'pulse-oximetry-monitoring': {
    name: 'Pulse Oximetry Monitoring',
    category: 'monitoring',
    difficultyLevel: 'BEGINNER' as const,
    timeEstimateMinutes: 15,
    isCritical: true,
    description: 'Continuous non-invasive monitoring of oxygen saturation using pulse oximetry technology',
    objectives: [
      'Assess patient respiratory status and determine need for pulse oximetry monitoring',
      'Select appropriate equipment and prepare for accurate oxygen saturation monitoring',
      'Apply sensor using optimal technique for reliable and accurate readings',
      'Verify initial readings and establish baseline oxygen saturation values',
      'Establish continuous monitoring protocol and analyze saturation trends',
      'Troubleshoot and optimize accuracy by addressing interfering factors',
      'Integrate monitoring data with patient assessment and clinical care planning',
      'Document monitoring comprehensively and ensure continuity of care'
    ],
    indications: [
      'Respiratory distress or suspected hypoxemia',
      'Patients receiving oxygen therapy or respiratory treatments',
      'Continuous monitoring during procedures or transport',
      'Assessment of response to respiratory interventions',
      'Patients with respiratory or cardiac conditions requiring monitoring',
      'Post-procedural monitoring for sedation or anesthesia recovery',
      'Sleep study monitoring or assessment of breathing disorders'
    ],
    contraindications: [
      'No absolute contraindications for non-invasive pulse oximetry',
      'Relative limitations in carbon monoxide or methemoglobin poisoning',
      'Severe peripheral vascular disease affecting sensor site circulation',
      'Excessive patient movement preventing accurate readings'
    ],
    equipment: [
      'Pulse oximeter with functioning display and accurate calibration',
      'Appropriate sensors for fingertip, earlobe, or forehead placement',
      'Spare sensors and batteries for equipment backup',
      'Nail polish remover for cleaning sensor sites if needed',
      'Securing tape or devices to prevent sensor displacement',
      'Alternative sensor sites prepared for troubleshooting',
      'Documentation materials for recording trends and values',
      'Backup monitoring equipment for critical patients'
    ]
  }
};

export default enhancedCriticalSkillSteps;
