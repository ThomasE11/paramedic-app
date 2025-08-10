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

  'femoral-vein-cannulation': {
    name: 'Femoral Vein Cannulation',
    category: 'vascular-access',
    difficultyLevel: 'ADVANCED' as const,
    timeEstimateMinutes: 20,
    isCritical: true,
    objectives: [
      'Assess patient appropriately for femoral central venous access and rule out contraindications',
      'Demonstrate proper sterile technique and maximum barrier precautions for central line insertion',
      'Identify anatomical landmarks and use ultrasound guidance for safe femoral vein access',
      'Perform Seldinger technique with guidewire insertion and tract dilation safely',
      'Confirm proper catheter placement and secure device to prevent complications',
      'Monitor for immediate complications and provide comprehensive documentation',
      'Communicate catheter placement and care requirements to receiving team'
    ],
    indications: [
      'Failed peripheral IV access in critically ill patient requiring immediate vascular access',
      'Need for rapid large-volume fluid resuscitation or massive transfusion protocol',
      'Administration of vasoactive medications or chemotherapy requiring central access',
      'Hemodynamic monitoring with central venous pressure measurement needs',
      'Emergency hemodialysis, plasmapheresis, or extracorporeal membrane oxygenation access',
      'Cardiac arrest with unsuccessful peripheral IV attempts and ongoing resuscitation needs'
    ],
    contraindications: [
      'Active infection, cellulitis, or open wounds at proposed insertion site',
      'Severe bleeding disorders or coagulopathy with INR >2.0 (relative contraindication)',
      'Anatomical abnormalities, previous surgery, or known venous obstruction at site',
      'Combative or uncooperative patient unable to remain still during procedure',
      'Lack of proper equipment, sterile supplies, or trained personnel for safe insertion'
    ],
    equipment: [
      'Central venous catheter kit with multi-lumen catheter (7Fr triple-lumen preferred)',
      'Maximum barrier precautions: sterile gowns, gloves, drapes, caps, masks',
      'Antiseptic solution (chlorhexidine 2% preferred) and skin preparation materials',
      'Local anesthetic (lidocaine 1-2%) with needles and syringes for infiltration',
      'Ultrasound machine with high-frequency linear probe and sterile probe covers',
      'Suture materials, needle holders, and sterile dressing supplies',
      'Normal saline flushes, catheter caps, and securing tape or devices',
      'Emergency equipment for complication management and post-procedure monitoring'
    ]
  },

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

  'orogastric-nasogastric-insertion': {
    name: 'Orogastric and Nasogastric Tube Insertion',
    category: 'medical',
    difficultyLevel: 'INTERMEDIATE' as const,
    timeEstimateMinutes: 18,
    isCritical: true,
    objectives: [
      'Assess patient condition and select appropriate insertion route',
      'Prepare equipment and position patient optimally for insertion',
      'Measure correct tube insertion depth using anatomical landmarks',
      'Insert tube safely using proper technique and patient cooperation',
      'Verify correct gastric placement using multiple confirmation methods',
      'Secure tube properly and connect to appropriate drainage system',
      'Test tube function and ensure proper drainage',
      'Provide ongoing monitoring and comprehensive documentation'
    ],
    indications: [
      'Gastric decompression for bowel obstruction or ileus',
      'Gastric lavage for overdose or poisoning management',
      'Prevention of aspiration in unconscious patients',
      'Medication administration when oral route not feasible',
      'Enteral feeding access when temporary gastric access needed',
      'Gastric content sampling for diagnostic purposes'
    ],
    contraindications: [
      'Suspected base of skull fracture (nasal route contraindicated)',
      'Severe maxillofacial trauma affecting insertion route',
      'Active upper gastrointestinal bleeding with esophageal varices',
      'Recent nasal, oral, or esophageal surgery',
      'Severe coagulopathy with active bleeding tendency',
      'Complete nasal obstruction (for nasogastric route)'
    ],
    equipment: [
      'Nasogastric or orogastric tubes (14-18Fr various sizes)',
      'Water-soluble lubricant (never petroleum-based)',
      '60ml catheter-tip syringe for aspiration and testing',
      'pH testing strips for gastric content verification',
      'Stethoscope for auscultation confirmation',
      'Suction equipment with pressure regulation',
      'Drainage collection bag and connecting tubing',
      'Medical tape for securing tube'
    ]
  },

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
  ],

  // 29. FEMORAL VEIN CANNULATION - Central vascular access for emergency situations
  'femoral-vein-cannulation': [
    {
      id: 'femoral-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Indication Evaluation',
      description: 'Assess patient condition and determine clinical need for femoral venous access',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess clinical indication: peripheral IV failure, need for central access, hemodialysis',
        'Evaluate hemodynamic status: shock, cardiac arrest, massive transfusion needs',
        'Check for contraindications: infection at site, severe coagulopathy, anatomical abnormalities',
        'Consider alternative access sites: external jugular, subclavian, or intraosseous',
        'Assess patient cooperation and ability to remain still during procedure',
        'Review anticoagulation status and bleeding risk',
        'Ensure proper indication exists for invasive central access',
        'Document indication and obtain consent if patient conscious'
      ],
      indications: [
        'Failed peripheral IV access in critical patient requiring immediate vascular access',
        'Need for rapid large-volume fluid resuscitation or blood product administration',
        'Administration of vasoactive medications requiring central access',
        'Hemodynamic monitoring or blood sampling requirements',
        'Emergency hemodialysis or plasmapheresis access',
        'Cardiac arrest with failed peripheral access attempts'
      ],
      contraindications: [
        'Infection, cellulitis, or open wounds at insertion site',
        'Severe coagulopathy or thrombocytopenia (relative contraindication)',
        'Anatomical abnormalities preventing safe access',
        'Previous vascular surgery or known venous obstruction at site',
        'Combative patient unable to cooperate (relative contraindication)'
      ],
      safetyNotes: [
        'Central venous access carries significant risks - ensure proper indication',
        'Have ultrasound guidance available if possible to improve success and safety',
        'Prepare for potential complications: bleeding, pneumothorax, infection'
      ]
    },
    {
      id: 'femoral-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Sterile Setup',
      description: 'Prepare all necessary equipment and establish sterile field',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Gather central line kit: guidewire, dilator, multi-lumen catheter, introducer needle',
        'Prepare sterile drapes, gowns, gloves, masks, and eye protection',
        'Set up antiseptic solutions: chlorhexidine 2% preferred, or povidone-iodine',
        'Prepare local anesthetic: lidocaine 1-2% with appropriate needles and syringes',
        'Check ultrasound machine function and prepare sterile probe cover',
        'Have sutures, tegaderm dressing, and securing materials ready',
        'Prepare normal saline flushes and caps for catheter lumens',
        'Ensure chest X-ray capability available for post-procedure confirmation'
      ],
      equipmentNeeded: [
        'Central venous catheter kit (multi-lumen preferred)',
        'Sterile gowns, gloves, drapes, and caps',
        'Chlorhexidine 2% or povidone-iodine antiseptic',
        'Local anesthetic (lidocaine 1-2%) with needles/syringes',
        'Ultrasound machine with linear probe and sterile covers',
        'Suture material and needle holder',
        'Sterile gauze, tegaderm dressing materials',
        'Normal saline flushes and catheter caps'
      ],
      safetyNotes: [
        'Maximum barrier precautions reduce infection risk significantly',
        'Check all equipment for damage or expiration before use',
        'Maintain sterile technique throughout entire procedure'
      ]
    },
    {
      id: 'femoral-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Anatomical Landmark Identification',
      description: 'Position patient optimally and identify femoral vessel landmarks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient supine with slight hip abduction and external rotation',
        'Place rolled towel under ipsilateral hip to improve access if needed',
        'Identify femoral pulse: midpoint between anterior superior iliac spine and pubic symphysis',
        'Remember VAN mnemonic: Vein (medial), Artery (middle), Nerve (lateral)',
        'Mark insertion site approximately 2-3 cm below inguinal ligament',
        'Ensure adequate lighting and positioning for ultrasound use',
        'Have assistant available for patient positioning and equipment handling',
        'Expose insertion site adequately while maintaining patient dignity'
      ],
      safetyNotes: [
        'Proper positioning is crucial for safe access and avoiding complications',
        'Anatomical landmarks may be altered in obese or edematous patients',
        'Use ultrasound guidance when available to improve accuracy and safety'
      ]
    },
    {
      id: 'femoral-step-4',
      stepNumber: 4,
      title: 'Sterile Preparation and Local Anesthesia',
      description: 'Create sterile field and provide local anesthesia',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Don sterile gown, gloves, mask, and eye protection following scrub',
        'Clean insertion site with chlorhexidine in circular motion, allow to dry (2 minutes)',
        'Place sterile drapes creating large sterile field around insertion site',
        'Infiltrate local anesthetic at insertion site: skin, subcutaneous, and deeper tissues',
        'Use 25-27G needle for skin, 22G for deeper infiltration',
        'Inject slowly to minimize patient discomfort and tissue distortion',
        'Allow adequate time for anesthetic to take effect (3-5 minutes)',
        'Test anesthesia effectiveness before proceeding with needle insertion'
      ],
      safetyNotes: [
        'Adequate anesthesia improves patient comfort and cooperation',
        'Avoid excessive anesthetic volume which can distort anatomy',
        'Be aware of maximum lidocaine dose limits (4-5 mg/kg without epinephrine)'
      ]
    },
    {
      id: 'femoral-step-5',
      stepNumber: 5,
      title: 'Ultrasound-Guided Needle Insertion and Venous Access',
      description: 'Use ultrasound guidance to safely access femoral vein',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Apply sterile ultrasound probe cover and gel to linear transducer',
        'Identify femoral vein (compressible, medial to artery) using transverse view',
        'Insert introducer needle at 45-degree angle toward ultrasound beam',
        'Advance needle under direct ultrasound visualization into vein',
        'Look for flashback of dark venous blood (versus bright red arterial)',
        'Lower needle angle to 30 degrees and advance catheter over needle',
        'Remove needle while maintaining catheter position in vein',
        'Confirm venous placement: dark blood, low pressure, aspiration of blood easily'
      ],
      safetyNotes: [
        'Real-time ultrasound guidance significantly reduces complications',
        'Distinguish venous from arterial blood: dark vs bright red, low vs high pressure',
        'If arterial puncture occurs, remove needle and apply direct pressure for 10 minutes'
      ]
    },
    {
      id: 'femoral-step-6',
      stepNumber: 6,
      title: 'Guidewire Insertion and Tract Dilation',
      description: 'Insert guidewire and dilate tract for central catheter placement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Thread guidewire through needle into femoral vein with gentle resistance only',
        'Insert guidewire 15-20 cm (never force if resistance encountered)',
        'Remove needle while holding guidewire securely in place',
        'Make small skin incision adjacent to guidewire with scalpel',
        'Thread dilator over guidewire and advance through skin and vessel wall',
        'Remove dilator while maintaining guidewire position',
        'Thread central venous catheter over guidewire to appropriate depth',
        'Remove guidewire once catheter properly positioned and secured'
      ],
      safetyNotes: [
        'Never let go of guidewire - loss into circulation requires surgical removal',
        'Gentle resistance only when inserting wire - stop if significant resistance',
        'Maintain sterile technique and guidewire control throughout procedure'
      ]
    },
    {
      id: 'femoral-step-7',
      stepNumber: 7,
      title: 'Catheter Confirmation and Securing',
      description: 'Confirm proper catheter placement and secure catheter',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Aspirate blood from all catheter lumens to confirm intravascular placement',
        'Flush each lumen with normal saline to ensure patency',
        'Secure catheter to skin with sutures using sterile technique',
        'Apply antimicrobial dressing (chlorhexidine-impregnated if available)',
        'Cover with sterile transparent dressing allowing visualization of site',
        'Label catheter insertion date and time clearly',
        'Document catheter tip position and insertion depth',
        'Obtain chest X-ray if clinically indicated to rule out complications'
      ],
      safetyNotes: [
        'Proper securement prevents catheter dislodgement and complications',
        'Document insertion for infection control tracking and follow-up care',
        'Monitor insertion site for signs of bleeding, hematoma, or infection'
      ]
    },
    {
      id: 'femoral-step-8',
      stepNumber: 8,
      title: 'Complication Monitoring and Documentation',
      description: 'Monitor for immediate complications and provide comprehensive documentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Monitor insertion site for bleeding, hematoma formation, or swelling',
        'Check distal pulses and circulation in affected extremity',
        'Assess for signs of arterial injury: expanding hematoma, absent pulses, ischemia',
        'Document indication, technique used, catheter type and position',
        'Record any complications encountered and management provided',
        'Note patient tolerance of procedure and post-procedure status',
        'Provide instructions for catheter care and monitoring',
        'Communicate placement and plan to receiving facility or team'
      ],
      safetyNotes: [
        'Early recognition of complications allows for prompt intervention',
        'Arterial injury can cause limb-threatening ischemia requiring urgent surgery',
        'Proper documentation protects patient safety and medicolegal interests'
      ]
    }
  ],

  // 30. DOUBLE LUMEN AIRWAY INSERTION - Advanced airway device for difficult airway management
  'double-lumen-airway-insertion': [
    {
      id: 'dla-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Device Indication',
      description: 'Assess patient for double lumen airway need and evaluate airway difficulty',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess level of consciousness: patient must be unconscious with absent gag reflex',
        'Evaluate failed bag-mask ventilation or need for rescue airway',
        'Consider after failed intubation attempts or as primary airway in difficult cases',
        'Assess for upper airway obstruction that may prevent device function',
        'Check mouth opening: minimum 23mm required for adult device insertion',
        'Evaluate cervical spine status and positioning limitations',
        'Consider double lumen airway as bridge to definitive airway management',
        'Review contraindications and ensure appropriate indication exists'
      ],
      indications: [
        'Failed bag-mask ventilation requiring immediate airway rescue',
        'Cannot intubate, cannot oxygenate situation requiring emergency airway',
        'Bridge airway after failed endotracheal intubation attempts',
        'Primary airway in anticipated difficult intubation with maintained ventilation needs',
        'Rescue airway during airway management complications',
        'Alternative to surgical airway when expertise or equipment unavailable'
      ],
      contraindications: [
        'Conscious patient with intact protective airway reflexes',
        'Complete upper airway obstruction above level of device placement',
        'Suspected esophageal or pharyngeal pathology preventing safe insertion',
        'Limited mouth opening <23mm preventing device insertion',
        'Known or suspected caustic ingestion with upper airway burns',
        'Massive facial trauma distorting upper airway anatomy'
      ],
      safetyNotes: [
        'Have surgical airway equipment ready as backup option',
        'Maintain cervical spine immobilization if trauma suspected',
        'Prepare for immediate removal if device fails to provide adequate ventilation'
      ]
    },
    {
      id: 'dla-step-2',
      stepNumber: 2,
      title: 'Device Selection and Equipment Preparation',
      description: 'Select appropriate device size and prepare all necessary equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Select device size based on patient height: Size 3 (30-50kg), Size 4 (50-70kg), Size 5 (>70kg)',
        'Inspect device for damage: check both lumens, cuffs, and pilot balloons',
        'Test cuff inflation and deflation with appropriate syringe volumes',
        'Lubricate device with water-soluble lubricant avoiding silicone products',
        'Prepare bag-valve device with high-flow oxygen and reservoir',
        'Set up suction equipment with large bore catheter for airway clearing',
        'Have end-tidal CO2 monitoring available for placement confirmation',
        'Prepare securing devices and backup airway equipment'
      ],
      equipmentNeeded: [
        'Double lumen airway device (appropriate size)',
        '60mL syringe for pharyngeal cuff inflation',
        '20mL syringe for esophageal cuff inflation',
        'Water-soluble lubricant',
        'Bag-valve device with oxygen reservoir',
        'High-flow oxygen source (15L/min)',
        'Suction equipment with rigid catheter',
        'End-tidal CO2 monitoring device and adaptor',
        'Securing tape or commercial airway holder',
        'Stethoscope for breath sound assessment'
      ],
      safetyNotes: [
        'Proper device sizing is critical for effective seal and ventilation',
        'Check expiration dates and device integrity before insertion',
        'Have multiple sizes available in case primary size inappropriate'
      ]
    },
    {
      id: 'dla-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Airway Preparation',
      description: 'Position patient optimally and prepare airway for device insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient supine with head in neutral or sniffing position',
        'Open mouth using cross-finger technique or tongue blade if needed',
        'Suction oropharynx thoroughly to remove secretions, blood, or debris',
        'Remove loose dentures but may leave well-fitting dentures in place',
        'Ensure adequate lighting and visualization of oral cavity',
        'Have assistant provide jaw support and cervical spine control if indicated',
        'Pre-oxygenate with bag-mask ventilation if time and patient condition permit',
        'Position yourself at patient\'s head for optimal insertion angle'
      ],
      safetyNotes: [
        'Clear airway completely before device insertion to prevent aspiration',
        'Maintain spinal immobilization during positioning if trauma suspected',
        'Be prepared for rapid sequence if patient condition deteriorating'
      ]
    },
    {
      id: 'dla-step-4',
      stepNumber: 4,
      title: 'Device Insertion Technique',
      description: 'Insert double lumen airway using proper technique and landmarks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Hold device like pencil with pharyngeal cuff completely deflated',
        'Insert device blindly along curve of tongue and posterior pharyngeal wall',
        'Advance device until resistance felt and external teeth strap contacts teeth',
        'Ensure device follows natural airway curve without forcing insertion',
        'Inflate pharyngeal cuff with appropriate volume (typically 80-100mL for adults)',
        'Watch for slight outward movement of device indicating proper positioning',
        'Inflate esophageal cuff with 10-15mL air for dual-lumen seal',
        'Attach bag-valve device to appropriate port and attempt ventilation'
      ],
      safetyNotes: [
        'Never force device insertion - may cause pharyngeal or esophageal trauma',
        'Gentle technique reduces risk of airway injury and bleeding',
        'Stop insertion if significant resistance encountered and reassess'
      ]
    },
    {
      id: 'dla-step-5',
      stepNumber: 5,
      title: 'Ventilation Testing and Placement Confirmation',
      description: 'Confirm correct device placement using systematic ventilation testing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'First attempt ventilation through pharyngeal lumen (blue port typically)',
        'Assess for bilateral breath sounds, chest rise, and absence of gastric sounds',
        'If no chest rise from pharyngeal lumen, switch to esophageal lumen (clear port)',
        'Confirm effective ventilation through appropriate lumen with chest rise',
        'Monitor end-tidal CO2 waveform and appropriate values (35-45mmHg)',
        'Auscultate bilaterally for equal breath sounds over chest fields',
        'Check absence of gurgling sounds over stomach during ventilation',
        'Assess oxygen saturation improvement with effective ventilation'
      ],
      safetyNotes: [
        'Device may function through either lumen depending on anatomical positioning',
        'Use multiple confirmation methods to ensure proper ventilation',
        'Continuous waveform capnography provides best placement confirmation'
      ]
    },
    {
      id: 'dla-step-6',
      stepNumber: 6,
      title: 'Device Securement and Ventilation Optimization',
      description: 'Secure device properly and optimize ventilation parameters',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Secure device using integrated strap or tape to prevent displacement',
        'Mark functional lumen clearly and ensure team awareness of correct port',
        'Set appropriate ventilation rate: 10-12 breaths/min adults, 12-20/min pediatrics',
        'Use appropriate tidal volumes: 6-7mL/kg to prevent gastric insufflation',
        'Monitor ventilation pressures keeping peak pressures <30cmH2O',
        'Reassess device position after any patient movement or manipulation',
        'Document device size, functional lumen, and insertion depth at teeth',
        'Consider oro-gastric tube insertion if gastric distension present'
      ],
      safetyNotes: [
        'Proper securement prevents accidental dislodgement during transport',
        'Team communication essential to ensure correct ventilation port used',
        'Monitor for gastric insufflation which may impair ventilation'
      ]
    },
    {
      id: 'dla-step-7',
      stepNumber: 7,
      title: 'Monitoring and Complication Management',
      description: 'Provide continuous monitoring and manage potential complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Continuously monitor end-tidal CO2 waveform for device integrity and ventilation',
        'Assess ventilation adequacy: chest rise, breath sounds, oxygen saturation',
        'Monitor for device migration or displacement during patient movement',
        'Watch for complications: regurgitation, aspiration, pneumothorax, esophageal rupture',
        'Be prepared to manage regurgitation with suction and patient positioning',
        'Monitor cuff pressures to prevent tissue necrosis from over-inflation',
        'Assess need for conversion to endotracheal intubation if clinically indicated',
        'Document ventilation effectiveness and any complications encountered'
      ],
      safetyNotes: [
        'Double lumen airways do not provide complete aspiration protection',
        'Have suction immediately available for airway management',
        'Be prepared for emergent device removal if complications develop'
      ]
    },
    {
      id: 'dla-step-8',
      stepNumber: 8,
      title: 'Transport Management and Definitive Care Planning',
      description: 'Manage device during transport and plan for definitive airway care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Ensure device remains secure and functional throughout transport',
        'Continue monitoring ventilation effectiveness and oxygenation during transport',
        'Communicate with receiving facility about airway device and management',
        'Provide comprehensive report: indication, insertion technique, complications',
        'Ensure receiving team prepared for potential conversion to endotracheal tube',
        'Document total time device in place and overall effectiveness',
        'Be prepared to manage airway emergencies during transport',
        'Plan for appropriate receiving facility with airway management capabilities'
      ],
      safetyNotes: [
        'Transport can cause device displacement - maintain continuous monitoring',
        'Clear communication prevents delays in hospital airway management',
        'Have backup airway management plan ready for transport emergencies'
      ]
    }
  ],

  // 31. ADULT ENDOTRACHEAL INTUBATION - Gold standard definitive airway management
  'adult-endotracheal-intubation': [
    {
      id: 'ett-step-1',
      stepNumber: 1,
      title: 'Pre-intubation Assessment and Preparation',
      description: 'Comprehensive patient assessment and airway evaluation using systematic approach',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess indication for intubation: respiratory failure, airway protection, cardiac arrest',
        'Evaluate airway difficulty using LEMON criteria: Look externally, Evaluate 3-3-2 rule, Mallampati, Obstruction, Neck mobility',
        'Check vital signs and oxygen saturation - pre-oxygenate to >95% if possible',
        'Assess hemodynamic status and consider need for vasopressors post-intubation',
        'Review medical history: previous difficult intubation, cervical spine injury, allergies',
        'Ensure appropriate team members and roles assigned for procedure',
        'Prepare backup airway plan: supraglottic device, surgical airway if indicated',
        'Consider rapid sequence intubation (RSI) vs awake intubation based on clinical scenario'
      ],
      indications: [
        'Respiratory failure with inadequate oxygenation or ventilation',
        'Airway protection in unconscious patient or risk of aspiration',
        'Cardiac arrest requiring definitive airway management',
        'Anticipated clinical deterioration requiring proactive airway management',
        'Need for positive pressure ventilation or mechanical ventilation',
        'Severe trauma with airway compromise or anticipated swelling'
      ],
      contraindications: [
        'Complete upper airway obstruction preventing visualization',
        'Severe facial trauma distorting anatomy (relative - consider surgical airway)',
        'Known difficult airway without backup plan available',
        'Conscious patient who can maintain airway and adequate ventilation'
      ],
      safetyNotes: [
        'Pre-oxygenation is crucial - provides safe apnea time during procedure',
        'Have failed airway algorithm ready and equipment immediately available',
        'Consider delaying intubation if patient stable and alternative management possible'
      ]
    },
    {
      id: 'ett-step-2',
      stepNumber: 2,
      title: 'Equipment Check and Preparation',
      description: 'Systematic preparation of all intubation equipment and backup devices',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Select ETT size: 7.0-7.5mm for average adult women, 8.0-8.5mm for adult men',
        'Test ETT cuff inflation and deflation, check for leaks or damage',
        'Prepare laryngoscope with appropriate blade: Macintosh 3-4 for adults',
        'Check laryngoscope light brightness and blade attachment security',
        'Prepare stylet: lubricate and shape with gentle curve (hockey stick shape)',
        'Set up suction equipment: large bore rigid catheter immediately available',
        'Prepare bag-valve device with PEEP valve and high-flow oxygen',
        'Have backup equipment ready: smaller ETT, supraglottic airway, surgical airway kit'
      ],
      equipmentNeeded: [
        'Endotracheal tubes (7.0, 7.5, 8.0, 8.5mm with tested cuffs)',
        'Laryngoscope handle and blades (Macintosh 3, 4)',
        'Stylet with water-soluble lubricant',
        'Bag-valve-mask with PEEP valve and oxygen reservoir',
        'Suction equipment with Yankauer and flexible catheters',
        'End-tidal CO2 monitoring with waveform capability',
        '10mL syringe for cuff inflation',
        'Securing tape or commercial ETT holder',
        'Backup airway devices and surgical airway kit'
      ],
      safetyNotes: [
        'Test all equipment before patient contact - equipment failure during procedure is dangerous',
        'Have multiple ETT sizes available - initial size estimate may be incorrect',
        'Ensure adequate lighting and positioning for optimal visualization'
      ]
    },
    {
      id: 'ett-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Pre-oxygenation',
      description: 'Optimize patient positioning and maximize oxygen reserves before intubation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Position patient in sniffing position: head elevated 8-10cm, neck extended',
        'Align ear canal with sternal notch for optimal laryngoscopic view',
        'Pre-oxygenate with 100% oxygen for 3-5 minutes if time permits',
        'Use bag-mask ventilation with two-person technique if needed',
        'Clear oropharynx of secretions, blood, or vomitus with suction',
        'Remove dentures and check for loose teeth that could dislodge',
        'Ensure adequate IV/IO access for medication administration',
        'Position team members optimally: intubator at head, assistant at patient\'s side'
      ],
      safetyNotes: [
        'Pre-oxygenation provides 3-8 minutes of safe apnea time depending on patient condition',
        'Obese patients desaturate faster - consider ramped positioning',
        'Maintain cervical spine immobilization if trauma suspected'
      ]
    },
    {
      id: 'ett-step-4',
      stepNumber: 4,
      title: 'Laryngoscopy and Vocal Cord Visualization',
      description: 'Perform direct laryngoscopy to visualize vocal cords and glottic opening',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Hold laryngoscope in left hand, insert blade from right side of mouth',
        'Advance blade to base of tongue, then lift upward and forward (not rock back)',
        'Identify epiglottis and place Macintosh blade in vallecula',
        'Apply gentle upward traction to expose vocal cords and glottic opening',
        'Optimize view with external laryngeal manipulation if needed (BURP maneuver)',
        'Visualize vocal cords: should see white cords opening and closing with breathing',
        'Grade laryngoscopic view using Cormack-Lehane classification',
        'Limit laryngoscopy attempts to <30 seconds to prevent hypoxia'
      ],
      safetyNotes: [
        'Avoid using teeth as fulcrum - can cause dental trauma',
        'If view poor, consider blade repositioning or external manipulation before ETT insertion',
        'Time laryngoscopy attempts - prolonged attempts cause hypoxia and hemodynamic instability'
      ]
    },
    {
      id: 'ett-step-5',
      stepNumber: 5,
      title: 'ETT Insertion and Placement Confirmation',
      description: 'Insert endotracheal tube through vocal cords and confirm proper placement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Insert ETT from right side of mouth, visualizing passage through vocal cords',
        'Advance ETT until cuff disappears 1-2cm past vocal cords',
        'Remove stylet carefully while maintaining ETT position',
        'Inflate cuff with 5-10mL air until minimal leak present',
        'Immediately confirm placement: observe chest rise, auscultate bilaterally',
        'Check for absence of gurgling sounds over stomach during ventilation',
        'Monitor end-tidal CO2 waveform - should show immediate capnogram',
        'Note ETT depth at teeth/lips: typically 21-23cm for adults'
      ],
      safetyNotes: [
        'Direct visualization of ETT passing through cords is most reliable confirmation',
        'Esophageal intubation is immediately life-threatening - multiple confirmation methods essential',
        'Continuous waveform capnography is gold standard for placement confirmation'
      ]
    },
    {
      id: 'ett-step-6',
      stepNumber: 6,
      title: 'Post-intubation Assessment and Securing',
      description: 'Comprehensive assessment of ETT placement and secure tube positioning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Perform systematic confirmation: visual, auscultation, capnography, chest X-ray if available',
        'Auscultate five points: bilateral anterior chest, bilateral mid-axillary, epigastrium',
        'Secure ETT with tape or commercial holder to prevent displacement',
        'Note and document ETT depth marking at teeth/lips',
        'Reassess placement after any patient movement or position change',
        'Monitor vital signs and oxygen saturation continuously',
        'Adjust ventilator settings if mechanical ventilation required',
        'Consider nasogastric tube insertion to decompress stomach'
      ],
      safetyNotes: [
        'ETT displacement can occur with patient movement - continuous monitoring essential',
        'Right main stem bronchus intubation causes left lung collapse',
        'Proper securing prevents catastrophic tube dislodgement during transport'
      ]
    },
    {
      id: 'ett-step-7',
      stepNumber: 7,
      title: 'Post-intubation Management and Monitoring',
      description: 'Ongoing airway management and physiological monitoring after intubation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor continuous end-tidal CO2 waveform for tube displacement or obstruction',
        'Assess ventilation parameters: rate 10-12/min adults, tidal volume 6-8mL/kg',
        'Monitor peak airway pressures: should be <30cmH2O for normal lungs',
        'Watch for post-intubation hypotension and treat with fluids or vasopressors',
        'Provide appropriate sedation and analgesia for patient comfort',
        'Suction ETT as needed based on secretions and ventilation quality',
        'Monitor for complications: pneumothorax, aspiration, cardiovascular instability',
        'Reassess ETT placement with any change in patient condition'
      ],
      safetyNotes: [
        'Post-intubation hypotension is common due to positive pressure ventilation',
        'Loss of end-tidal CO2 waveform indicates tube displacement until proven otherwise',
        'Regular ETT suctioning maintains patency and prevents ventilator-associated pneumonia'
      ]
    },
    {
      id: 'ett-step-8',
      stepNumber: 8,
      title: 'Transport Management and Handoff Communication',
      description: 'Manage intubated patient during transport and provide comprehensive handoff',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Ensure ETT remains secure and patent throughout transport',
        'Monitor capnography continuously during transport for displacement',
        'Maintain appropriate ventilation parameters and oxygenation',
        'Be prepared for airway emergencies: tube obstruction, displacement, pneumothorax',
        'Document intubation: indication, technique, complications, tube size and depth',
        'Communicate with receiving team: airway history, sedation needs, ventilator settings',
        'Provide comprehensive SBAR handoff including airway management details',
        'Ensure receiving facility has capability for ongoing mechanical ventilation'
      ],
      safetyNotes: [
        'Transport vibration can cause ETT displacement - secure connections essential',
        'Have backup ventilation plan ready for equipment failures during transport',
        'Clear communication prevents delays in hospital ventilator management'
      ]
    }
  ],

  // 32. SURGICAL CRICOTHYROIDOTOMY - Emergency surgical airway for failed airway scenarios
  'surgical-cricothyroidotomy': [
    {
      id: 'cric-step-1',
      stepNumber: 1,
      title: 'Emergency Airway Assessment and Indication',
      description: 'Rapidly assess failed airway scenario and confirm need for surgical airway',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Recognize cannot intubate, cannot oxygenate (CICO) emergency situation',
        'Confirm failed attempts at bag-mask ventilation and intubation',
        'Assess failure of supraglottic airway devices to provide adequate oxygenation',
        'Identify rapidly deteriorating oxygen saturation despite all conventional efforts',
        'Rule out upper airway obstruction that could be relieved by other means',
        'Confirm patient unconscious with no protective airway reflexes',
        'Assess for contraindications: significant neck pathology, infection at site',
        'Make rapid decision - time is critical in CICO scenario'
      ],
      indications: [
        'Cannot intubate, cannot oxygenate emergency with failed conventional airway management',
        'Complete upper airway obstruction unrelieved by basic maneuvers',
        'Severe maxillofacial trauma preventing intubation with adequate oxygenation failure',
        'Laryngeal trauma with airway compromise not manageable by other means',
        'Foreign body obstruction not removable by conventional techniques',
        'Severe angioedema or anaphylaxis with complete airway obstruction'
      ],
      contraindications: [
        'Ability to oxygenate patient by alternative means',
        'Conscious patient with intact protective reflexes (unless imminent arrest)',
        'Age <10 years (needle cricothyroidotomy preferred)',
        'Severe neck pathology or previous surgery distorting anatomy'
      ],
      safetyNotes: [
        'This is a life-saving procedure when conventional airway management fails',
        'Speed is essential - prolonged hypoxia causes irreversible brain damage',
        'Have all equipment ready and practice technique regularly'
      ]
    },
    {
      id: 'cric-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Sterile Setup',
      description: 'Rapidly prepare surgical cricothyroidotomy equipment with sterile technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Gather surgical cricothyroidotomy kit or individual components rapidly',
        'Prepare scalpel with #11 blade for vertical and horizontal incisions',
        'Ready tracheal hook or curved hemostat for stabilization',
        'Prepare tracheostomy tube (6.0mm) or endotracheal tube (6.0-7.0mm)',
        'Have bag-valve device with high-flow oxygen immediately available',
        'Set up suction equipment for blood and secretion management',
        'Don gloves rapidly - full sterile technique may not be feasible in emergency',
        'Prepare antiseptic if time permits, but do not delay procedure'
      ],
      equipmentNeeded: [
        'Scalpel handle with #11 blade',
        'Tracheal hook or curved hemostat',
        'Tracheostomy tube (6.0mm) or ETT (6.0-7.0mm)',
        'Tracheal dilator or forceps',
        'Bag-valve device with oxygen',
        'Suction equipment',
        'Sterile gloves and antiseptic',
        '10mL syringe for cuff inflation'
      ],
      safetyNotes: [
        'Speed takes precedence over perfect sterile technique in CICO emergency',
        'Have backup tube sizes available in case primary size inappropriate',
        'Ensure adequate lighting and positioning for optimal visualization'
      ]
    },
    {
      id: 'cric-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Anatomical Landmark Identification',
      description: 'Position patient optimally and identify cricothyroid membrane landmarks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient supine with neck extended (if cervical spine cleared)',
        'Place rolled towel under shoulders to extend neck and expose anatomy',
        'Palpate thyroid cartilage (Adam\'s apple) and cricoid cartilage below',
        'Identify cricothyroid membrane: depression between thyroid and cricoid cartilages',
        'Mark cricothyroid membrane with finger - approximately 2-3cm wide',
        'Ensure membrane is in midline and easily palpable',
        'Position yourself at patient\'s right side for optimal access',
        'Have assistant provide cervical spine control if trauma suspected'
      ],
      safetyNotes: [
        'Accurate landmark identification is crucial for successful procedure',
        'Cricothyroid membrane may be difficult to palpate in obese patients',
        'Use ultrasound guidance if available and time permits'
      ]
    },
    {
      id: 'cric-step-4',
      stepNumber: 4,
      title: 'Vertical Incision and Membrane Exposure',
      description: 'Make vertical skin incision and expose cricothyroid membrane',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Stabilize larynx with non-dominant hand throughout procedure',
        'Make 3-4cm vertical skin incision over cricothyroid membrane',
        'Incise through skin and subcutaneous tissue to expose membrane',
        'Use finger dissection to clear tissue and locate membrane clearly',
        'Identify cricothyroid membrane as white, relatively avascular structure',
        'Control bleeding with pressure - avoid cautery which delays procedure',
        'Ensure clear visualization of membrane before proceeding',
        'Keep incision midline to avoid major vascular structures'
      ],
      safetyNotes: [
        'Vertical incision reduces risk of vascular injury compared to horizontal',
        'Stay in midline to avoid carotid vessels and major bleeding',
        'Control larynx position throughout to prevent loss of landmarks'
      ]
    },
    {
      id: 'cric-step-5',
      stepNumber: 5,
      title: 'Cricothyroid Membrane Incision and Airway Access',
      description: 'Incise cricothyroid membrane and establish airway access',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Make horizontal incision through cricothyroid membrane with scalpel',
        'Incision should be in lower half of membrane to avoid superior vessels',
        'Cut through membrane completely - should hear air escape if patient breathing',
        'Insert tracheal hook into incision to stabilize and maintain opening',
        'Use hook to lift thyroid cartilage cephalad and open airway',
        'Alternatively, use curved hemostat to grasp and stabilize incision edges',
        'Clear any blood or secretions from airway opening with suction',
        'Prepare for immediate tube insertion once airway access confirmed'
      ],
      safetyNotes: [
        'Horizontal membrane incision must be adequate size for tube passage',
        'Tracheal hook prevents loss of airway access during tube insertion',
        'Be prepared for bleeding - continue procedure despite blood in field'
      ]
    },
    {
      id: 'cric-step-6',
      stepNumber: 6,
      title: 'Tracheostomy Tube Insertion and Placement',
      description: 'Insert tracheostomy tube through cricothyroid membrane into trachea',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Insert lubricated tracheostomy tube through membrane incision into trachea',
        'Direct tube caudally (toward feet) at 45-degree angle initially',
        'Advance tube until cuff is completely past incision site',
        'Inflate cuff with 5-10mL air to create seal',
        'Remove tracheal hook or stabilizing instruments carefully',
        'Attach bag-valve device immediately and attempt ventilation',
        'Observe for chest rise and auscultate for bilateral breath sounds',
        'Confirm placement with end-tidal CO2 if available'
      ],
      safetyNotes: [
        'Proper tube direction prevents esophageal placement or posterior tracheal perforation',
        'Cuff inflation creates seal necessary for positive pressure ventilation',
        'Immediate confirmation prevents unrecognized misplacement'
      ]
    },
    {
      id: 'cric-step-7',
      stepNumber: 7,
      title: 'Ventilation Confirmation and Tube Securing',
      description: 'Confirm adequate ventilation and secure tracheostomy tube',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess bilateral chest rise with bag-valve ventilation',
        'Auscultate bilateral breath sounds to confirm proper placement',
        'Monitor oxygen saturation for improvement with ventilation',
        'Check end-tidal CO2 waveform if monitoring available',
        'Secure tube with ties or tape around neck - not too tight',
        'Cover incision site with gauze dressing around tube',
        'Note tube depth at skin level for reference',
        'Begin appropriate ventilation rate and tidal volumes'
      ],
      safetyNotes: [
        'Tube security is essential - displacement can be catastrophic',
        'Monitor for pneumothorax or subcutaneous emphysema',
        'Be prepared to reposition tube if ventilation inadequate'
      ]
    },
    {
      id: 'cric-step-8',
      stepNumber: 8,
      title: 'Post-procedure Monitoring and Documentation',
      description: 'Provide ongoing monitoring and comprehensive documentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Monitor ventilation continuously with capnography and pulse oximetry',
        'Assess for complications: bleeding, pneumothorax, subcutaneous emphysema, infection',
        'Check tube position regularly and secure connections',
        'Provide appropriate sedation if patient becomes conscious',
        'Document indication, technique, complications, and patient response',
        'Communicate with receiving facility about surgical airway management',
        'Plan for formal tracheostomy evaluation and possible conversion',
        'Monitor incision site for bleeding or signs of infection'
      ],
      safetyNotes: [
        'Surgical cricothyroidotomy is temporary - plan for definitive management',
        'Complications can be life-threatening - maintain high level of monitoring',
        'Early recognition of problems allows for prompt intervention'
      ]
    }
  ],

  // 33. SYNCHRONIZED CARDIOVERSION - Emergency electrical cardioversion for unstable tachyarrhythmias
  'synchronized-cardioversion': [
    {
      id: 'cardioversion-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Rhythm Analysis',
      description: 'Assess patient condition and identify tachyarrhythmia requiring cardioversion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess hemodynamic stability: blood pressure, mental status, chest pain, dyspnea',
        'Identify unstable tachyarrhythmia: SVT, atrial fibrillation, atrial flutter, VT with pulse',
        'Check heart rate: typically >150 bpm with signs of hemodynamic compromise',
        'Look for signs of instability: altered mental status, chest pain, hypotension, pulmonary edema',
        'Obtain 12-lead ECG to identify specific rhythm and confirm indication',
        'Rule out contraindications: digitalis toxicity, recent meals (relative), unstable patient',
        'Assess airway and breathing - ensure adequate oxygenation before procedure',
        'Consider urgent vs emergent cardioversion based on patient stability'
      ],
      indications: [
        'Unstable supraventricular tachycardia (SVT) with hemodynamic compromise',
        'Unstable atrial fibrillation or atrial flutter with rapid ventricular response',
        'Unstable ventricular tachycardia with pulse and preserved blood pressure',
        'Monomorphic VT in hemodynamically stable patient when medications fail',
        'Any tachyarrhythmia causing hemodynamic instability unresponsive to medications'
      ],
      contraindications: [
        'Hemodynamically stable patient with well-tolerated arrhythmia',
        'Digitalis toxicity (may precipitate ventricular arrhythmias)',
        'Multifocal atrial tachycardia (rarely responds to cardioversion)',
        'Sinus tachycardia (treat underlying cause, not rhythm)'
      ],
      safetyNotes: [
        'Ensure proper indication - cardioversion carries risks and should not be used for stable rhythms',
        'Have advanced airway management ready in case complications occur',
        'Prepare for potential bradycardia or asystole post-cardioversion'
      ]
    },
    {
      id: 'cardioversion-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Safety Setup',
      description: 'Prepare defibrillator equipment and ensure environmental safety',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Prepare biphasic defibrillator with synchronized cardioversion capability',
        'Check paddle/pad placement sites and clean with alcohol if needed',
        'Apply defibrillator pads: anteroposterior or anterolateral placement',
        'Ensure sync function is activated - look for sync markers on R waves',
        'Test defibrillator function and confirm sync mode is working',
        'Prepare sedation medications: midazolam, etomidate, or propofol',
        'Have atropine, dopamine, and pacing equipment available for post-conversion care',
        'Remove oxygen delivery devices during shock to prevent fire hazard'
      ],
      equipmentNeeded: [
        'Biphasic defibrillator with synchronization capability',
        'Defibrillator pads (anteroposterior or anterolateral)',
        'Sedation medications (midazolam, etomidate)',
        'Emergency medications (atropine, dopamine, epinephrine)',
        'Bag-valve-mask with oxygen',
        'IV access and fluids',
        'Transcutaneous pacing capability',
        'Advanced airway equipment'
      ],
      safetyNotes: [
        'Synchronized mode prevents shock delivery during vulnerable T-wave period',
        'Remove all oxygen sources during shock delivery to prevent combustion',
        'Ensure all team members are clear of patient and bed during procedure'
      ]
    },
    {
      id: 'cardioversion-step-3',
      stepNumber: 3,
      title: 'Patient Preparation and Sedation',
      description: 'Prepare patient for procedure and provide appropriate sedation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Establish secure IV access and ensure patency before sedation',
        'Explain procedure to conscious patient: "We need to reset your heart rhythm"',
        'Pre-oxygenate with high-flow oxygen via bag-mask or non-rebreather',
        'Administer procedural sedation: midazolam 2-5mg IV or etomidate 0.3mg/kg',
        'Monitor level of consciousness and respiratory status during sedation',
        'Position patient supine with head elevated 30 degrees if possible',
        'Ensure patient has no jewelry or metal objects in contact with pads',
        'Have airway management equipment immediately available'
      ],
      safetyNotes: [
        'Adequate sedation is essential for patient comfort during electrical shock',
        'Monitor respiratory status closely - sedation can cause respiratory depression',
        'Be prepared to assist ventilation or manage airway complications'
      ]
    },
    {
      id: 'cardioversion-step-4',
      stepNumber: 4,
      title: 'Energy Selection and Synchronization Check',
      description: 'Select appropriate energy level and confirm synchronization',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Select initial energy based on rhythm: SVT 50-100J, A-fib/flutter 120-200J, VT 100-200J',
        'Confirm sync mode is activated and sync markers appear on R waves',
        'Check that sync markers are consistently identifying QRS complexes',
        'Start with lowest effective energy and increase if unsuccessful',
        'Charge defibrillator to selected energy level',
        'Ensure team is ready and positioned safely around patient',
        'Perform final safety check before shock delivery',
        'Be prepared to increase energy for subsequent attempts if needed'
      ],
      safetyNotes: [
        'Improper synchronization can deliver shock during T-wave causing VF',
        'Some rhythms may be difficult to synchronize - ensure sync markers are present',
        'If sync fails, may need to switch to unsynchronized shock for VT'
      ]
    },
    {
      id: 'cardioversion-step-5',
      stepNumber: 5,
      title: 'Shock Delivery and Team Coordination',
      description: 'Deliver synchronized electrical shock with proper team coordination',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Announce "Charging" when defibrillator is charging',
        'Ensure all team members step back from patient and bed',
        'Remove oxygen delivery devices and turn off oxygen flow',
        'Perform final visual sweep to ensure everyone is clear',
        'Announce "Shocking" and deliver shock by pressing both paddle buttons',
        'Shock will be delivered at next R wave due to synchronization',
        'Immediately assess rhythm on monitor after shock delivery',
        'Check pulse and blood pressure to assess hemodynamic response'
      ],
      safetyNotes: [
        'All personnel must be completely clear of patient contact during shock',
        'Synchronized shock may have slight delay as device waits for R wave',
        'Be prepared for potential rhythm changes including bradycardia or VF'
      ]
    },
    {
      id: 'cardioversion-step-6',
      stepNumber: 6,
      title: 'Post-cardioversion Assessment and Monitoring',
      description: 'Assess cardioversion success and monitor patient response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Immediately assess cardiac rhythm and rate on monitor',
        'Check pulse quality and blood pressure within 1-2 minutes',
        'Assess patient\'s level of consciousness and neurological status',
        'Monitor for signs of improved perfusion: better color, alertness',
        'Obtain 12-lead ECG to document post-cardioversion rhythm',
        'Continue cardiac monitoring for potential rhythm recurrence',
        'Assess for complications: chest burns, muscle soreness, memory loss',
        'Document pre and post-cardioversion rhythms, energy used, patient response'
      ],
      safetyNotes: [
        'Patient may be confused or disoriented after sedation and cardioversion',
        'Monitor closely for rhythm recurrence - may need repeat cardioversion',
        'Watch for bradycardia requiring atropine or pacing'
      ]
    },
    {
      id: 'cardioversion-step-7',
      stepNumber: 7,
      title: 'Unsuccessful Cardioversion Management',
      description: 'Manage unsuccessful cardioversion attempts and plan next interventions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'If unsuccessful, increase energy for next attempt: double previous energy',
        'Maximum energies: SVT 200J, A-fib/flutter 360J, VT 360J (biphasic)',
        'Consider changing pad position: anteroposterior vs anterolateral',
        'Ensure adequate sedation before repeat attempts',
        'Consider antiarrhythmic medications: amiodarone or procainamide',
        'Reassess patient stability - may need urgent transport if deteriorating',
        'Consider chemical cardioversion with appropriate medications',
        'Limit to 3-4 cardioversion attempts unless patient deteriorating'
      ],
      safetyNotes: [
        'Higher energies increase risk of complications but may be necessary',
        'Consider underlying electrolyte abnormalities or drug toxicity',
        'Some rhythms may be refractory to electrical cardioversion'
      ]
    },
    {
      id: 'cardioversion-step-8',
      stepNumber: 8,
      title: 'Post-procedure Care and Transport Planning',
      description: 'Provide ongoing care and prepare for appropriate transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Continue cardiac monitoring and frequent vital sign assessment',
        'Monitor for rhythm recurrence and be prepared for repeat cardioversion',
        'Assess need for antiarrhythmic maintenance therapy',
        'Provide supportive care: oxygen, IV fluids, pain management',
        'Document entire procedure: indications, energies, outcomes, complications',
        'Communicate with receiving facility about cardioversion and current status',
        'Transport to facility with cardiac monitoring and intervention capabilities',
        'Be prepared to manage recurrent arrhythmias during transport'
      ],
      safetyNotes: [
        'Successful cardioversion doesn\'t guarantee sustained rhythm - monitor closely',
        'Have defibrillator ready for immediate use if rhythm deteriorates',
        'Clear documentation important for ongoing cardiac care'
      ]
    }
  ],

  // 34. TRANSCUTANEOUS PACING - Emergency electrical cardiac pacing for severe bradycardia
  'transcutaneous-pacing': [
    {
      id: 'tcp-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Pacing Indication',
      description: 'Assess patient for symptomatic bradycardia requiring emergency pacing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess hemodynamic stability: blood pressure, mental status, chest pain, dyspnea',
        'Identify symptomatic bradycardia: heart rate <60 bpm with signs of poor perfusion',
        'Look for signs of hemodynamic compromise: hypotension, altered mental status, chest pain',
        'Check for high-degree AV blocks: second-degree type II, third-degree complete heart block',
        'Assess for bradycardia-related symptoms: syncope, near-syncope, fatigue, dyspnea',
        'Rule out reversible causes: hypothermia, drug toxicity, electrolyte abnormalities',
        'Consider urgency: emergent vs urgent pacing based on patient stability',
        'Ensure atropine has been tried and was ineffective or contraindicated'
      ],
      indications: [
        'Symptomatic sinus bradycardia unresponsive to atropine with hemodynamic compromise',
        'Second-degree AV block type II (Mobitz II) with hemodynamic instability',
        'Third-degree (complete) heart block with wide QRS escape rhythm',
        'Bradycardia-dependent ventricular tachycardia or torsades de pointes',
        'Asystole or severe bradycardia in cardiac arrest (consider as bridge therapy)',
        'Post-cardioversion bradycardia causing hemodynamic instability'
      ],
      contraindications: [
        'Asymptomatic bradycardia with stable hemodynamics',
        'Bradycardia due to hypothermia (treat underlying condition first)',
        'Bradycardia from increased intracranial pressure',
        'Terminal rhythm in end-stage disease with poor prognosis'
      ],
      safetyNotes: [
        'TCP is painful for conscious patients - consider sedation and analgesia',
        'Have backup transcutaneous pacing equipment available',
        'Prepare for potential need for transvenous pacing'
      ]
    },
    {
      id: 'tcp-step-2',
      stepNumber: 2,
      title: 'Equipment Setup and Pad Placement',
      description: 'Prepare transcutaneous pacing equipment and apply electrodes properly',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Use defibrillator/monitor with transcutaneous pacing capability',
        'Select large pacing electrodes (8-10cm diameter for adults)',
        'Clean electrode placement sites with alcohol and dry completely',
        'Apply anterior electrode: right of sternum, below right clavicle',
        'Apply posterior electrode: left subscapular area, avoiding scapula and spine',
        'Alternative placement: anterior-lateral if posterior access difficult',
        'Ensure good electrode contact with skin - press firmly to eliminate air bubbles',
        'Connect pacing cables to monitor and verify proper connections'
      ],
      equipmentNeeded: [
        'Defibrillator/monitor with transcutaneous pacing function',
        'Large transcutaneous pacing electrodes (anterior/posterior)',
        'ECG monitoring leads and cables',
        'Sedation/analgesia medications (if patient conscious)',
        'Emergency medications (atropine, epinephrine, dopamine)',
        'IV access materials and fluids',
        'Backup pacing equipment'
      ],
      safetyNotes: [
        'Poor electrode contact can cause ineffective pacing and patient discomfort',
        'Avoid placing electrodes over bony prominences or excessive hair',
        'Ensure patient is not in contact with metal objects during pacing'
      ]
    },
    {
      id: 'tcp-step-3',
      stepNumber: 3,
      title: 'Initial Pacing Parameters and Settings',
      description: 'Set appropriate initial pacing rate and current for patient condition',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Set initial pacing rate: 60-80 bpm for most adult patients',
        'Start with current at minimum setting (usually 0 mA)',
        'Select pacing mode: demand (synchronous) vs fixed rate (asynchronous)',
        'Ensure ECG monitoring leads are properly connected for sensing',
        'Verify pacing spike artifacts are visible on ECG monitor',
        'Begin with demand mode to avoid competing with patient\'s intrinsic rhythm',
        'Have emergency medications readily available',
        'Prepare patient for discomfort if conscious'
      ],
      safetyNotes: [
        'Demand mode is safer as it avoids R-on-T phenomenon',
        'Fixed rate mode may be needed if intrinsic rhythm interferes with sensing',
        'Monitor continuously for changes in rhythm or hemodynamics'
      ]
    },
    {
      id: 'tcp-step-4',
      stepNumber: 4,
      title: 'Current Threshold Determination',
      description: 'Gradually increase current to achieve electrical and mechanical capture',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Gradually increase current in 5-10 mA increments starting from minimum',
        'Watch for electrical capture: QRS complex following each pacing spike',
        'Continue increasing until consistent electrical capture achieved',
        'Check for mechanical capture: palpable pulse with each paced beat',
        'Assess hemodynamic response: improved blood pressure and perfusion',
        'Set final current 10-20 mA above threshold to ensure reliable capture',
        'Typical capture threshold: 40-80 mA for most adults',
        'Document capture threshold and final settings used'
      ],
      safetyNotes: [
        'Electrical capture without mechanical capture indicates ineffective pacing',
        'High current settings increase patient discomfort significantly',
        'Loss of capture may indicate electrode displacement or poor contact'
      ]
    },
    {
      id: 'tcp-step-5',
      stepNumber: 5,
      title: 'Patient Comfort and Sedation Management',
      description: 'Manage patient discomfort and provide appropriate sedation if indicated',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Assess patient comfort level - TCP is often painful for conscious patients',
        'Explain procedure to patient: "This will help your heart beat regularly"',
        'Provide analgesics: morphine 2-4mg IV or fentanyl 25-50mcg IV',
        'Consider sedation if patient distressed: midazolam 1-2mg IV titrated',
        'Monitor respiratory status closely with sedation',
        'Reassure patient that discomfort is temporary and necessary',
        'Use minimum effective current to reduce discomfort while maintaining capture',
        'Have airway management equipment available if sedation required'
      ],
      safetyNotes: [
        'Balance patient comfort with need for effective pacing',
        'Over-sedation can compromise airway and breathing',
        'Some patients may require significant analgesia for comfort'
      ]
    },
    {
      id: 'tcp-step-6',
      stepNumber: 6,
      title: 'Hemodynamic Monitoring and Response Assessment',
      description: 'Monitor patient response to pacing and assess hemodynamic improvement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor blood pressure and pulse quality with paced rhythm',
        'Assess improvement in mental status and overall perfusion',
        'Check oxygen saturation and respiratory status',
        'Monitor for return of intrinsic cardiac rhythm',
        'Watch for pacing failure: loss of capture, sensing problems',
        'Assess for complications: chest wall muscle stimulation, skin burns',
        'Document patient response to pacing intervention',
        'Be prepared to adjust settings if capture is lost'
      ],
      safetyNotes: [
        'Paced rhythm should produce hemodynamic improvement',
        'Loss of capture can cause rapid deterioration',
        'Monitor electrode sites for skin irritation or burns'
      ]
    },
    {
      id: 'tcp-step-7',
      stepNumber: 7,
      title: 'Troubleshooting and Complication Management',
      description: 'Identify and manage common pacing problems and complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Loss of capture: check electrode contact, increase current, reposition electrodes',
        'Undersensing: adjust sensitivity settings, check lead connections',
        'Oversensing: reduce sensitivity, check for electrical interference',
        'Failure to pace: check battery, connections, replace electrodes if needed',
        'Chest wall stimulation: reposition electrodes, reduce current if possible',
        'Skin burns: check electrode contact, consider electrode repositioning',
        'Patient intolerance: increase analgesia/sedation, reassess need for pacing',
        'Have backup pacing equipment ready for equipment failure'
      ],
      safetyNotes: [
        'Rapid identification of problems prevents loss of effective pacing',
        'Some complications may require immediate electrode repositioning',
        'Always have alternative pacing methods available'
      ]
    },
    {
      id: 'tcp-step-8',
      stepNumber: 8,
      title: 'Transport Planning and Definitive Care Coordination',
      description: 'Plan transport and coordinate care for definitive pacing therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Continue transcutaneous pacing throughout transport if effective',
        'Monitor pacing continuously during transport - vibration can affect capture',
        'Prepare for potential pacing failure during transport',
        'Communicate with receiving facility about pacing requirements',
        'Transport to facility with cardiology consultation and transvenous pacing capability',
        'Document pacing indication, settings, patient response, and complications',
        'Provide comprehensive handoff including pacing history and current status',
        'Plan for potential need for permanent pacemaker evaluation'
      ],
      safetyNotes: [
        'TCP is temporary bridge therapy - definitive treatment usually required',
        'Transport can cause electrode displacement and loss of capture',
        'Clear communication ensures appropriate receiving facility selection'
      ]
    }
  ],

  // 35. NEONATAL RESUSCITATION - Specialized newborn resuscitation using NRP guidelines
  'neonatal-resuscitation': [
    {
      id: 'nrp-step-1',
      stepNumber: 1,
      title: 'Rapid Assessment and Initial Stabilization',
      description: 'Perform immediate assessment of newborn and initiate resuscitation sequence',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess three key questions: Term gestation? Good muscle tone? Breathing/crying?',
        'If any answer is "no", begin immediate resuscitation steps',
        'Note time of birth for accurate timing of interventions',
        'Provide initial care: warmth, clear airway if needed, dry and stimulate',
        'Position newborn supine with head in neutral position',
        'Remove wet linens and cover with warm blankets to prevent hypothermia',
        'Assess breathing effort: look for gasping, absent, or inadequate respirations',
        'Check heart rate: <100 bpm requires positive pressure ventilation'
      ],
      indications: [
        'Newborn not breathing or gasping at birth despite initial stimulation',
        'Heart rate less than 100 beats per minute at any time during resuscitation',
        'Persistent central cyanosis despite adequate ventilation and oxygenation',
        'Poor muscle tone and lack of response to initial resuscitation efforts',
        'Preterm infant requiring immediate resuscitation support',
        'Newborn with obvious signs of distress: grunting, retractions, cyanosis'
      ],
      contraindications: [
        'Vigorous newborn with good tone, crying, and heart rate >100 bpm',
        'Obvious signs of death: extreme prematurity with no signs of life',
        'Severe congenital anomalies incompatible with life'
      ],
      safetyNotes: [
        'Most newborns respond to basic steps: warmth, drying, stimulation',
        'Time is critical - begin positive pressure ventilation if HR <100 after initial steps',
        'Avoid hyperoxia in preterm infants - use air initially'
      ]
    },
    {
      id: 'nrp-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Team Assignment',
      description: 'Prepare neonatal resuscitation equipment and assign team roles',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Use neonatal bag-mask device with pressure relief valve (40 cmH2O)',
        'Select appropriate mask size: covers mouth and nose, not eyes',
        'Prepare suction equipment: bulb syringe or mechanical suction with 8-10 Fr catheter',
        'Set up pulse oximetry with neonatal sensor for oxygen saturation monitoring',
        'Prepare intubation equipment: size 2.5-3.5 ETT, laryngoscope with size 0-1 blade',
        'Have emergency medications ready: epinephrine 1:10,000, normal saline',
        'Assign roles: primary resuscitator, assistant, recorder, family support',
        'Ensure radiant warmer is on and pre-warmed'
      ],
      equipmentNeeded: [
        'Neonatal bag-mask with pressure relief valve',
        'Face masks (preemie, newborn, infant sizes)',
        'Suction equipment (bulb syringe, mechanical suction)',
        'Pulse oximetry with neonatal sensor',
        'Intubation equipment (ETT 2.5-3.5, laryngoscope)',
        'Emergency medications (epinephrine, normal saline)',
        'Radiant warmer and warming materials',
        'Stethoscope and timing device'
      ],
      safetyNotes: [
        'Equipment must be appropriate size for newborns - adult equipment can cause injury',
        'Pressure relief valve prevents barotrauma from excessive ventilation pressures',
        'Have multiple team members trained in neonatal resuscitation'
      ]
    },
    {
      id: 'nrp-step-3',
      stepNumber: 3,
      title: 'Positive Pressure Ventilation Initiation',
      description: 'Begin effective positive pressure ventilation for newborn with HR <100',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Position newborn with head in neutral position - avoid hyperextension',
        'Apply mask with proper seal covering mouth and nose, not eyes',
        'Begin ventilation at 40-60 breaths per minute with adequate pressure',
        'Initial pressures: 20-25 cmH2O, may need up to 40 cmH2O for first few breaths',
        'Watch for chest rise with each breath - indicator of effective ventilation',
        'If no chest rise: reposition head, check mask seal, increase pressure',
        'Use room air initially, add oxygen only if needed for persistent cyanosis',
        'Continue for 15 seconds then reassess heart rate and breathing'
      ],
      safetyNotes: [
        'Effective ventilation is key to successful neonatal resuscitation',
        'Chest rise is most important indicator of adequate ventilation',
        'Avoid excessive oxygen - can be harmful to preterm infants'
      ]
    },
    {
      id: 'nrp-step-4',
      stepNumber: 4,
      title: 'Heart Rate Assessment and Escalation Decision',
      description: 'Assess heart rate response and determine need for chest compressions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Check heart rate after 15 seconds of effective positive pressure ventilation',
        'Palpate umbilical cord pulse or auscultate precordium for heart rate',
        'If HR >100 and increasing: continue ventilation, begin weaning as tolerated',
        'If HR 60-100: continue effective ventilation, may not need chest compressions',
        'If HR <60 despite adequate ventilation: begin chest compressions immediately',
        'Ensure ventilation is truly effective before starting compressions',
        'Consider intubation if bag-mask ventilation ineffective',
        'Reassess every 30 seconds during ongoing resuscitation'
      ],
      safetyNotes: [
        'Heart rate is primary indicator of resuscitation effectiveness',
        'Most newborns respond to effective ventilation alone',
        'Chest compressions only indicated if HR <60 despite adequate ventilation'
      ]
    },
    {
      id: 'nrp-step-5',
      stepNumber: 5,
      title: 'Chest Compressions and Coordinated CPR',
      description: 'Perform neonatal chest compressions coordinated with ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Use thumb technique: thumbs on lower third of breastbone, hands encircling chest',
        'Compress one-third of chest depth (approximately 1.5-2 cm)',
        'Provide 3 compressions to 1 ventilation ratio (3:1)',
        'Count "one-and-two-and-three-and-breathe-and" for timing',
        'Achieve rate of 120 events per minute (90 compressions, 30 breaths)',
        'Ensure complete chest recoil between compressions',
        'Coordinate with ventilator to avoid simultaneous compression and ventilation',
        'Reassess heart rate every 30 seconds and adjust interventions'
      ],
      safetyNotes: [
        'Neonatal CPR ratio is 3:1, different from pediatric/adult ratios',
        'Thumb technique preferred over two-finger technique in newborns',
        'Coordinate compressions and ventilations to avoid interference'
      ]
    },
    {
      id: 'nrp-step-6',
      stepNumber: 6,
      title: 'Medication Administration and Advanced Interventions',
      description: 'Administer emergency medications and consider advanced interventions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'If HR remains <60 after 30 seconds of coordinated CPR, prepare epinephrine',
        'Establish vascular access: umbilical vein catheter preferred, or IO access',
        'Epinephrine dose: 0.01-0.03 mg/kg (0.1-0.3 mL/kg of 1:10,000) IV/IO',
        'If IV/IO unavailable, may give via ETT: 0.05-0.1 mg/kg (0.5-1.0 mL/kg)',
        'Volume expansion: 10 mL/kg normal saline if suspected blood loss',
        'Consider advanced airway: endotracheal intubation if bag-mask ineffective',
        'Repeat epinephrine every 3-5 minutes if HR remains <60',
        'Consider reversible causes: pneumothorax, hypovolemia, acidosis'
      ],
      safetyNotes: [
        'IV/IO epinephrine is preferred route - ETT absorption is unpredictable',
        'Volume expansion only indicated if blood loss suspected',
        'Bicarbonate not routinely recommended in neonatal resuscitation'
      ]
    },
    {
      id: 'nrp-step-7',
      stepNumber: 7,
      title: 'Response Assessment and Ongoing Management',
      description: 'Assess response to interventions and provide ongoing neonatal care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor heart rate, respiratory effort, and oxygen saturation continuously',
        'Target oxygen saturations: 60-65% at 1 min, 65-70% at 2 min, 70-75% at 3 min',
        'Gradually wean ventilation support as newborn improves',
        'Assess for spontaneous breathing and adequate respiratory effort',
        'Monitor temperature - prevent hypothermia which worsens outcomes',
        'Check blood glucose if indicated - newborns prone to hypoglycemia',
        'Consider transport to NICU for continued specialized care',
        'Provide family updates and emotional support during resuscitation'
      ],
      safetyNotes: [
        'Avoid hyperoxia - titrate oxygen to target saturations',
        'Hypothermia significantly worsens neonatal outcomes',
        'Most newborns who respond will do so within first few minutes'
      ]
    },
    {
      id: 'nrp-step-8',
      stepNumber: 8,
      title: 'Documentation and Disposition Planning',
      description: 'Document resuscitation and plan appropriate disposition and follow-up care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Document birth time, initial presentation, and all interventions with timing',
        'Record Apgar scores at 1 and 5 minutes (and 10 minutes if <7)',
        'Note response to each intervention and final outcome',
        'Consider withholding or discontinuing resuscitation after 10 minutes if no response',
        'If successful: plan NICU transport for continued monitoring and care',
        'Debrief with family about resuscitation and newborn\'s condition',
        'Complete required documentation for birth certificate and medical records',
        'Coordinate with receiving NICU team for transport and continued care'
      ],
      safetyNotes: [
        'Resuscitation beyond 10 minutes with no response has very poor prognosis',
        'Successful resuscitation requires continued specialized neonatal care',
        'Family needs clear communication about newborn\'s condition and prognosis'
      ]
    }
  ],

  // 37. PEDIATRIC CPR WITH MANUAL DEFIBRILLATOR - Specialized CPR and defibrillation for children (1-8 years)
  'pediatric-cpr-defibrillator': [
    {
      id: 'ped-cpr-defib-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Initial Pediatric Assessment',
      description: 'Ensure scene safety and perform age-appropriate assessment of pediatric patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Check scene for hazards: traffic, electrical dangers, violence, toxic substances',
        'Use universal precautions - pediatric patients have higher infectious risk',
        'Approach child calmly - sudden movements may frighten conscious children',
        'Assess responsiveness: tap shoulders gently and call loudly "Are you okay?"',
        'Look for normal breathing for no more than 10 seconds (children breathe faster)',
        'Check pulse at carotid (>1 year) or brachial (<1 year) for 10 seconds maximum',
        'Activate emergency services immediately if unresponsive with absent/abnormal breathing',
        'Consider traumatic vs. medical causes - pediatric cardiac arrest often respiratory in origin'
      ],
      contraindications: [
        'Unsafe scene conditions (fire, electrical hazards, violence)',
        'Signs of obvious death (rigor mortis, decomposition)',
        'Valid DNR order with appropriate guardian consent'
      ],
      safetyNotes: [
        'Children are at higher risk for cervical spine injury than adults',
        'Respiratory causes are more common than primary cardiac causes in pediatrics',
        'Scene safety is paramount - do not become a second victim'
      ]
    },
    {
      id: 'ped-cpr-defib-step-2',
      stepNumber: 2,
      title: 'Proper Pediatric Patient Positioning',
      description: 'Position pediatric patient correctly for effective chest compressions and airway management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Place child on firm, flat surface (floor ideal - beds too soft for compressions)',
        'Position on back with head in neutral position (avoid hyperextension)',
        'Open airway using head-tilt, chin-lift (jaw-thrust if trauma suspected)',
        'Remove visible foreign objects from mouth - do not blind finger sweep',
        'Position yourself beside child\'s chest for optimal compression angle',
        'For infants: consider placing on firm surface with head slightly elevated',
        'Ensure adequate space for two-rescuer CPR and defibrillator placement'
      ],
      safetyNotes: [
        'Neutral head position is optimal for pediatric airway (not extended like adults)',
        'Never perform blind finger sweeps - can push objects deeper',
        'Firm surface essential for effective chest compressions'
      ]
    },
    {
      id: 'ped-cpr-defib-step-3',
      stepNumber: 3,
      title: 'Age-Appropriate Chest Compression Technique',
      description: 'Perform high-quality chest compressions using correct pediatric technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Hand placement: Lower half of breastbone, just below nipple line',
        'Children (1-8 years): Use heel of one or two hands (based on child size)',
        'Compression depth: At least 1/3 chest depth (approximately 5cm for children)',
        'Compression rate: 100-120 compressions per minute (same as adults)',
        'Allow complete chest recoil between compressions - crucial for venous return',
        'Minimize interruptions: <10 seconds between cycles for rhythm checks',
        'Count aloud: "1 and 2 and 3..." to maintain proper rate and rhythm',
        'Switch compressors every 2 minutes to prevent fatigue and maintain quality'
      ],
      equipmentNeeded: [
        'Pediatric AED pads or manual defibrillator',
        'Appropriate sized bag-valve mask',
        'Pediatric airway adjuncts',
        'Oxygen source'
      ],
      safetyNotes: [
        'Use appropriate force - pediatric chest more compliant than adults',
        'Complete recoil essential - incomplete recoil reduces cardiac output',
        'Quality over speed - ensure adequate depth and rate'
      ]
    },
    {
      id: 'ped-cpr-defib-step-4',
      stepNumber: 4,
      title: 'Pediatric Airway Management and Ventilation',
      description: 'Provide effective rescue breathing using age-appropriate techniques and equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Use pediatric-sized bag-valve mask - adult masks too large and cause leaks',
        'Ventilation ratio: 30:2 (compressions:ventilations) for single rescuer',
        'Two-rescuer CPR: 15:2 ratio preferred for pediatric patients',
        'Ventilation volume: Just enough to make chest rise visibly (6-7 mL/kg)',
        'Ventilation rate: 1 breath every 6 seconds when giving rescue breaths',
        'Avoid hyperventilation - reduces venous return and cardiac output',
        'Consider advanced airway if trained: LMA, endotracheal intubation',
        'If advanced airway placed: continuous compressions, 10 breaths/minute'
      ],
      safetyNotes: [
        'Pediatric airways more easily obstructed than adults',
        'Excessive ventilation pressure can cause gastric insufflation and vomiting',
        'Monitor chest rise - indicator of adequate ventilation volume'
      ]
    },
    {
      id: 'ped-cpr-defib-step-5',
      stepNumber: 5,
      title: 'Prepare Manual Defibrillator for Pediatric Use',
      description: 'Set up manual defibrillator with appropriate pediatric energy doses and pad placement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Use pediatric electrode pads if available (smaller size, appropriate energy attenuation)',
        'If only adult pads available: ensure no overlap, trim if necessary',
        'Pad placement: Anterolateral (right upper chest, left lower chest)',
        'Alternative: Anterior-posterior if chest too small for anterolateral',
        'Energy selection: 2 J/kg for initial shock, 4 J/kg for subsequent shocks',
        'Maximum energy: Adult dose (200 J biphasic or 360 J monophasic)',
        'Charge defibrillator only after rhythm analysis confirms shockable rhythm',
        'Ensure all team members clear before charging and shocking'
      ],
      equipmentNeeded: [
        'Manual defibrillator with pediatric capabilities',
        'Pediatric defibrillator pads (preferred)',
        'Conductive gel or pads',
        'Pediatric energy dose calculator if available'
      ],
      safetyNotes: [
        'Never exceed maximum pediatric energy dose unless using adult-sized patient',
        'Ensure proper pad adherence - poor contact reduces effectiveness',
        'Clear all personnel before charging and delivering shock'
      ]
    },
    {
      id: 'ped-cpr-defib-step-6',
      stepNumber: 6,
      title: 'Rhythm Analysis and Defibrillation Decision',
      description: 'Analyze cardiac rhythm and determine need for defibrillation in pediatric patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Stop compressions briefly (<10 seconds) for rhythm analysis',
        'Identify shockable rhythms: Ventricular fibrillation (VF), pulseless VT',
        'Pediatric VF often has lower amplitude than adult VF - analyze carefully',
        'Non-shockable rhythms: Asystole, PEA (more common in pediatric arrests)',
        'If VF/VT present: prepare for immediate defibrillation',
        'If asystole/PEA: continue CPR and consider reversible causes (H\'s and T\'s)',
        'Confirm rhythm in two leads if possible to avoid artifact',
        'Consider underlying pediatric causes: hypoxia, hypovolemia, hypothermia'
      ],
      contraindications: [
        'Patient has pulse (confirm absence before shocking)',
        'Rhythm clearly non-shockable (asystole, normal rhythm)',
        'Unsafe environment for defibrillation'
      ],
      safetyNotes: [
        'Pediatric VF may appear different from adult VF - lower amplitude',
        'Respiratory arrest more common than VF in pediatric patients',
        'Always confirm pulselessness before defibrillation'
      ]
    },
    {
      id: 'ped-cpr-defib-step-7',
      stepNumber: 7,
      title: 'Safe Defibrillation Procedure',
      description: 'Deliver electrical therapy safely and effectively for pediatric patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Ensure all team members are clear: "Everybody clear, I\'m charging"',
        'Charge defibrillator to appropriate pediatric energy dose (2 J/kg initially)',
        'Perform final safety check: no one touching patient or equipment',
        'Deliver shock with firm pad pressure: "Shocking now, stay clear"',
        'Immediately resume CPR after shock - do not check pulse initially',
        'Perform 2 minutes of high-quality CPR before next rhythm check',
        'If still in VF/VT: increase to 4 J/kg for second shock',
        'Consider antiarrhythmic medications after third shock if available'
      ],
      safetyNotes: [
        'Ensure complete electrical isolation before shocking',
        'Resume CPR immediately - even successful shocks may not restore circulation immediately',
        'Monitor for return of spontaneous circulation during CPR'
      ]
    },
    {
      id: 'ped-cpr-defib-step-8',
      stepNumber: 8,
      title: 'Post-Resuscitation Care and Transport',
      description: 'Provide ongoing pediatric advanced life support and prepare for transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Check for return of spontaneous circulation (ROSC): pulse, blood pressure, breathing',
        'If ROSC achieved: support airway, breathing, circulation (pediatric post-arrest care)',
        'Target temperature management: avoid hyperthermia, maintain normothermia',
        'Blood glucose management: check and treat hypoglycemia (<4.0 mmol/L)',
        'Consider pediatric advanced interventions: IV/IO access, medications',
        'Prepare for immediate transport to pediatric-capable emergency department',
        'Continue monitoring: heart rate, respiratory rate, oxygen saturation',
        'Family support: explain situation clearly and provide emotional support'
      ],
      equipmentNeeded: [
        'Pediatric transport monitors',
        'IV/IO supplies',
        'Pediatric emergency medications',
        'Pediatric airway equipment'
      ],
      safetyNotes: [
        'Pediatric arrests have different causes and outcomes than adults',
        'Post-arrest care requires pediatric expertise and equipment',
        'Family presence during resuscitation may be beneficial if appropriate'
      ]
    }
  ],

  // 38. INFANT CPR WITH MANUAL DEFIBRILLATOR - Specialized CPR and defibrillation for infants (<1 year)
  'infant-cpr-defibrillator': [
    {
      id: 'inf-cpr-defib-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Infant-Specific Assessment',
      description: 'Ensure scene safety and perform age-appropriate assessment of infant patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Check scene for hazards: choking hazards, toxic substances, unsafe sleeping environment',
        'Use universal precautions - infants have immature immune systems',
        'Approach gently to avoid startling - speak softly and move slowly',
        'Assess responsiveness: tap bottom of feet and call loudly "Baby, are you okay?"',
        'Look for normal breathing for no more than 10 seconds (infants normally breathe 30-60/min)',
        'Check pulse at brachial artery (inside upper arm) for maximum 10 seconds',
        'Activate emergency services immediately if unresponsive with absent/abnormal breathing',
        'Consider SIDS, respiratory causes, or metabolic causes as primary etiology'
      ],
      contraindications: [
        'Unsafe scene conditions (hazardous environment, violence)',
        'Signs of obvious death (rigor mortis, dependent lividity)',
        'Obvious futile resuscitation (severe congenital anomalies incompatible with life)'
      ],
      safetyNotes: [
        'Infant necks are more fragile - use gentle movements',
        'Respiratory causes are most common cause of cardiac arrest in infants',
        'SIDS patients may appear normal initially - always begin resuscitation'
      ]
    },
    {
      id: 'inf-cpr-defib-step-2',
      stepNumber: 2,
      title: 'Proper Infant Patient Positioning',
      description: 'Position infant correctly for effective chest compressions and airway management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Place infant on firm, flat surface - palm of hand acceptable for single rescuer',
        'Position on back with head in neutral "sniffing" position (avoid hyperextension)',
        'Open airway using gentle head-tilt, chin-lift (jaw-thrust if trauma suspected)',
        'Clear visible foreign objects from mouth - NO blind finger sweeps in infants',
        'Position yourself at infant\'s side or feet depending on surface availability',
        'Ensure airway positioning doesn\'t overextend neck - infants have large occiput',
        'Have adequate lighting and space for two-rescuer CPR if available'
      ],
      safetyNotes: [
        'Infant neck anatomy requires neutral positioning - overextension obstructs airway',
        'Never perform blind finger sweeps - can push objects deeper into airway',
        'Firm surface critical - soft surfaces reduce compression effectiveness'
      ]
    },
    {
      id: 'inf-cpr-defib-step-3',
      stepNumber: 3,
      title: 'Infant-Specific Chest Compression Technique',
      description: 'Perform high-quality chest compressions using correct infant technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Hand placement: Lower half of breastbone, just below nipple line',
        'Single rescuer: Two fingers (index and middle) on breastbone',
        'Two rescuers: Two-thumb encircling hands technique (preferred method)',
        'Compression depth: At least 1/3 chest depth (approximately 4cm for infants)',
        'Compression rate: 100-120 compressions per minute (same as all ages)',
        'Allow complete chest recoil between compressions - critical for venous return',
        'Minimize interruptions: <10 seconds between cycles for rhythm/pulse checks',
        'Count compressions aloud to maintain proper rate and team coordination'
      ],
      equipmentNeeded: [
        'Manual defibrillator with pediatric/infant capability',
        'Infant-sized defibrillator pads',
        'Infant bag-valve-mask device',
        'Infant face masks (size 0, 00)',
        'Oxygen source with flow meter'
      ],
      safetyNotes: [
        'Use gentle pressure appropriate for infant size - ribs more pliable than adults',
        'Two-thumb technique preferred for two rescuers - more effective compressions',
        'Complete recoil essential - partial recoil reduces cardiac output significantly'
      ]
    },
    {
      id: 'inf-cpr-defib-step-4',
      stepNumber: 4,
      title: 'Infant Airway Management and Ventilation',
      description: 'Provide effective rescue breathing using infant-appropriate techniques and equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Use infant-sized bag-valve-mask - adult equipment too large and ineffective',
        'Ventilation ratio: 30:2 (compressions:ventilations) for single rescuer',
        'Two-rescuer CPR: 15:2 ratio preferred for all pediatric patients',
        'Ventilation volume: Just enough to make chest rise gently (4-6 mL/kg)',
        'Ventilation rate: 1 breath every 6 seconds during rescue breathing cycles',
        'Avoid hyperventilation - reduces venous return and impedes circulation',
        'Consider advanced airway: infant LMA or endotracheal tube (3.0-3.5mm)',
        'If advanced airway placed: continuous compressions, 10 breaths/minute'
      ],
      safetyNotes: [
        'Infant airways narrow rapidly with swelling - gentle ventilation essential',
        'Excessive pressure causes gastric insufflation, vomiting, and aspiration risk',
        'Watch chest rise - best indicator of adequate ventilation volume'
      ]
    },
    {
      id: 'inf-cpr-defib-step-5',
      stepNumber: 5,
      title: 'Prepare Manual Defibrillator for Infant Use',
      description: 'Set up manual defibrillator with appropriate infant energy doses and pad placement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Use infant/pediatric electrode pads - significantly smaller than adult pads',
        'If only pediatric pads available: ensure no overlap, may need anterior-posterior placement',
        'Pad placement: Anterior-posterior preferred (chest and back) for small infants',
        'Alternative: Anterolateral if infant large enough and pads don\'t overlap',
        'Energy selection: 2 J/kg for initial shock (typically 6-10 J for infants)',
        'Maximum energy: 4 J/kg for subsequent shocks (typically 12-20 J)',
        'Charge defibrillator only after confirming shockable rhythm',
        'Ensure all personnel clear before charging - announce clearly'
      ],
      equipmentNeeded: [
        'Manual defibrillator with pediatric energy settings',
        'Infant defibrillator pads (smallest available)',
        'Infant weight estimation tools or Broselow tape',
        'Conductive gel if using paddles (pads preferred)'
      ],
      safetyNotes: [
        'Never exceed maximum infant energy dose - can cause myocardial damage',
        'Ensure proper pad adhesion - poor contact reduces shock effectiveness',
        'Anterior-posterior placement often necessary due to infant size limitations'
      ]
    },
    {
      id: 'inf-cpr-defib-step-6',
      stepNumber: 6,
      title: 'Rhythm Analysis and Defibrillation Decision',
      description: 'Analyze cardiac rhythm and determine need for defibrillation in infant patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Stop compressions briefly (<10 seconds) for rhythm analysis',
        'Identify shockable rhythms: VF, pulseless VT (rare in infants)',
        'Infant VF often very fine and may appear like asystole - analyze carefully',
        'Non-shockable rhythms: Asystole, PEA, bradycardia (most common in infants)',
        'If VF/VT present: prepare for immediate defibrillation',
        'If asystole/PEA: continue CPR, consider reversible causes (6 H\'s and 6 T\'s)',
        'Confirm rhythm on monitor - check lead connections for artifacts',
        'Remember: Primary cardiac causes rare in infants - focus on oxygenation'
      ],
      contraindications: [
        'Patient has palpable pulse (confirm absence before shocking)',
        'Rhythm clearly non-shockable (asystole, organized rhythm with pulse)',
        'Unsafe environment for electrical therapy delivery'
      ],
      safetyNotes: [
        'Shockable rhythms extremely rare in infants - most arrests are asystolic',
        'Primary focus should be on effective ventilation and oxygenation',
        'Always confirm pulselessness before delivering electrical therapy'
      ]
    },
    {
      id: 'inf-cpr-defib-step-7',
      stepNumber: 7,
      title: 'Safe Defibrillation Procedure',
      description: 'Deliver electrical therapy safely and effectively for infant patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Ensure all team members are clear: "Everyone clear, charging to [energy]"',
        'Charge defibrillator to appropriate infant energy dose (2 J/kg initially)',
        'Perform final safety check: no one touching infant or equipment',
        'Deliver shock with appropriate pad pressure: "Shocking now, stay clear"',
        'Immediately resume CPR after shock - do not check pulse initially',
        'Perform 2 minutes of high-quality CPR before next rhythm check',
        'If still in VF/VT: increase to 4 J/kg for second and subsequent shocks',
        'Consider epinephrine if available after failed defibrillation attempts'
      ],
      safetyNotes: [
        'Ensure complete electrical isolation - water, metal objects removed',
        'Resume CPR immediately after shock - circulation unlikely to return immediately',
        'Monitor for return of spontaneous circulation during compression cycles'
      ]
    },
    {
      id: 'inf-cpr-defib-step-8',
      stepNumber: 8,
      title: 'Post-Resuscitation Care and Family Support',
      description: 'Provide ongoing infant advanced life support and comprehensive family care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Check for return of spontaneous circulation: pulse, spontaneous breathing',
        'If ROSC achieved: support airway, breathing, circulation (post-arrest care)',
        'Temperature management: prevent both hypothermia and hyperthermia',
        'Blood glucose: check and treat hypoglycemia (<2.6 mmol/L in infants)',
        'Consider infant-specific interventions: umbilical or peripheral IV access',
        'Prepare for immediate transport to pediatric emergency department with NICU capability',
        'Family support: explain situation sensitively, allow family presence if appropriate',
        'Consider SIDS counseling and support resources for family members'
      ],
      equipmentNeeded: [
        'Infant transport monitoring equipment',
        'Infant IV/umbilical supplies',
        'Infant emergency medications',
        'Temperature control equipment',
        'Family support materials'
      ],
      safetyNotes: [
        'Infant cardiac arrests have poorer prognosis than pediatric arrests',
        'Post-arrest care requires specialized pediatric/neonatal expertise',
        'Family support critical - sudden infant events often unexpected and traumatic'
      ]
    }
  ],

  // 39. EXTERNAL JUGULAR VEIN CANNULATION - Alternative vascular access for emergency situations
  'external-jugular-cannulation': [
    {
      id: 'ejv-step-1',
      stepNumber: 1,
      title: 'Scene Safety and Patient Assessment',
      description: 'Assess scene safety and evaluate patient suitability for external jugular cannulation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Ensure scene safety and use universal precautions with full PPE',
        'Assess patient consciousness level and ability to cooperate',
        'Evaluate hemodynamic status and urgency of vascular access need',
        'Check for contraindications: neck trauma, previous neck surgery, coagulopathy',
        'Assess anatomical landmarks: sternocleidomastoid muscle, clavicle, mandible',
        'Consider alternative access sites if EJV not suitable',
        'Explain procedure to conscious patient and obtain consent',
        'Position patient appropriately for optimal venous distention'
      ],
      contraindications: [
        'Suspected or confirmed cervical spine injury',
        'Penetrating neck trauma or hematoma',
        'Previous neck surgery or radiation therapy',
        'Severe coagulopathy or anticoagulant therapy',
        'Infection or cellulitis overlying insertion site',
        'Anatomical abnormalities preventing safe access'
      ],
      safetyNotes: [
        'EJV cannulation requires careful anatomical knowledge',
        'Always assess for cervical spine injury before positioning',
        'Have backup vascular access plan ready'
      ]
    },
    {
      id: 'ejv-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Sterile Setup',
      description: 'Prepare all necessary equipment and establish sterile field',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Perform thorough hand hygiene and don sterile gloves',
        'Select appropriate catheter: 14-16G for adults, 18-20G for pediatrics',
        'Prepare IV fluids, tubing, and ensure all connections are secure',
        'Gather antiseptic solution (chlorhexidine or povidone-iodine)',
        'Prepare sterile drapes and gauze pads',
        'Have suture materials ready for catheter securement',
        'Prepare transparent dressing and securing tape',
        'Ensure adequate lighting and suction availability'
      ],
      equipmentNeeded: [
        'Large-bore IV catheter (14-16G preferred)',
        'Sterile gloves and PPE',
        'Antiseptic solution (chlorhexidine 2%)',
        'Sterile drapes and gauze pads',
        'IV fluids and administration set',
        'Suture material (3-0 or 4-0 nylon)',
        'Transparent dressing',
        'Local anesthetic (lidocaine 1%)'
      ],
      safetyNotes: [
        'Maintain strict sterile technique throughout procedure',
        'Have emergency airway equipment immediately available',
        'Ensure backup vascular access supplies ready'
      ]
    },
    {
      id: 'ejv-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Anatomical Landmarks',
      description: 'Position patient optimally and identify anatomical landmarks for safe cannulation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position patient supine with 15-30 degree Trendelenburg position',
        'Turn head 45 degrees away from insertion side (if cervical spine cleared)',
        'Extend neck slightly to optimize vein visualization',
        'Identify external jugular vein: from angle of jaw to mid-clavicle',
        'Palpate sternocleidomastoid muscle borders for reference',
        'Use Valsalva maneuver or gentle jugular compression to distend vein',
        'Identify optimal insertion point: upper third of visible vein',
        'Mark insertion site and ensure adequate lighting'
      ],
      safetyNotes: [
        'Trendelenburg position helps distend vein and prevent air embolism',
        'Gentle neck manipulation only if cervical spine cleared',
        'Optimal vein distention critical for successful cannulation'
      ]
    },
    {
      id: 'ejv-step-4',
      stepNumber: 4,
      title: 'Skin Preparation and Local Anesthesia',
      description: 'Prepare insertion site with sterile technique and provide local anesthesia',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Clean insertion site with antiseptic in circular motion',
        'Allow antiseptic to dry completely (minimum 30 seconds)',
        'Apply sterile drapes leaving insertion site exposed',
        'Infiltrate skin with local anesthetic if patient conscious',
        'Use small gauge needle (25-27G) for anesthetic injection',
        'Inject 1-2 mL lidocaine 1% into skin and subcutaneous tissue',
        'Wait 2-3 minutes for anesthetic effect',
        'Maintain sterile field throughout preparation'
      ],
      safetyNotes: [
        'Do not touch prepared area after antiseptic application',
        'Local anesthesia improves patient comfort and cooperation',
        'Avoid excessive anesthetic infiltration which can obscure landmarks'
      ]
    },
    {
      id: 'ejv-step-5',
      stepNumber: 5,
      title: 'Venipuncture and Catheter Advancement',
      description: 'Perform venipuncture and advance catheter using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Insert needle at 30-45 degree angle toward ipsilateral nipple',
        'Advance needle slowly while aspirating for blood return',
        'Once blood return confirmed, reduce angle to 15-20 degrees',
        'Advance needle 2-3mm further to ensure catheter tip in vein',
        'Thread catheter over needle while maintaining venous access',
        'Remove needle while holding catheter in place',
        'Immediately apply pressure to insertion site',
        'Confirm blood return through catheter before securing'
      ],
      safetyNotes: [
        'Gentle technique prevents vessel perforation',
        'Immediate pressure application prevents hematoma formation',
        'Never advance catheter without confirmed blood return'
      ]
    },
    {
      id: 'ejv-step-6',
      stepNumber: 6,
      title: 'Catheter Securement and Confirmation',
      description: 'Secure catheter properly and confirm correct placement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Connect IV tubing and flush with normal saline',
        'Confirm easy flow of fluids without resistance or swelling',
        'Secure catheter with sutures through catheter wings',
        'Apply transparent dressing over insertion site',
        'Loop tubing to prevent accidental dislodgement',
        'Document insertion site, catheter gauge, and complications',
        'Initiate IV therapy as clinically indicated',
        'Monitor insertion site for signs of infiltration or extravasation'
      ],
      safetyNotes: [
        'Proper securement prevents catheter migration or dislodgement',
        'Continuous monitoring essential for early complication detection',
        'Document procedure thoroughly for continuity of care'
      ]
    },
    {
      id: 'ejv-step-7',
      stepNumber: 7,
      title: 'Complication Recognition and Management',
      description: 'Monitor for complications and provide appropriate management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Monitor for immediate complications: arterial puncture, hematoma',
        'Assess for pneumothorax: chest pain, shortness of breath',
        'Check for air embolism: sudden cardiovascular collapse',
        'Monitor for thrombophlebitis: pain, redness, swelling',
        'Assess catheter patency and function regularly',
        'Watch for infection signs: fever, purulent drainage',
        'If complications occur: stop infusion, apply pressure, seek advanced care',
        'Document any complications and management provided'
      ],
      contraindications: [
        'If arterial puncture occurs: apply direct pressure for 10 minutes',
        'If pneumothorax suspected: prepare for needle decompression',
        'If air embolism suspected: position patient left lateral decubitus'
      ],
      safetyNotes: [
        'Early recognition of complications critical for patient safety',
        'EJV complications can be life-threatening',
        'Always have advanced airway and decompression equipment available'
      ]
    },
    {
      id: 'ejv-step-8',
      stepNumber: 8,
      title: 'Ongoing Monitoring and Transport Preparation',
      description: 'Provide continuous monitoring and prepare for transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Continuously monitor catheter function and insertion site',
        'Assess patient response to IV therapy administration',
        'Secure all IV connections and tubing for transport',
        'Position patient safely to prevent catheter dislodgement',
        'Monitor vital signs and hemodynamic response',
        'Prepare comprehensive report for receiving facility',
        'Document procedure, complications, and patient response',
        'Plan for potential catheter removal or replacement at hospital'
      ],
      safetyNotes: [
        'EJV catheters may not be suitable for long-term use',
        'Transport positioning critical to prevent complications',
        'Clear communication with receiving team essential'
      ]
    }
  ],

  // 40. USE OF TRANSPORT VENTILATOR - Mechanical ventilation during patient transport
  'transport-ventilator': [
    {
      id: 'tv-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Ventilation Need',
      description: 'Assess patient condition and determine need for mechanical ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess respiratory status: rate, depth, effort, oxygen saturation',
        'Evaluate level of consciousness and ability to protect airway',
        'Check for signs of respiratory failure: cyanosis, accessory muscle use',
        'Assess hemodynamic stability and cardiovascular status',
        'Review indications: respiratory failure, airway protection, long transport',
        'Consider patient comfort and sedation requirements',
        'Evaluate contraindications and potential complications',
        'Ensure advanced airway in place (endotracheal tube, supraglottic device)'
      ],
      contraindications: [
        'Unstable airway without proper advanced airway device',
        'Untreated pneumothorax (relative contraindication)',
        'Severe hemodynamic instability without adequate resuscitation',
        'Equipment malfunction or inadequate backup ventilation available'
      ],
      safetyNotes: [
        'Transport ventilator requires established advanced airway',
        'Always have backup manual ventilation immediately available',
        'Patient assessment guides ventilator settings and monitoring needs'
      ]
    },
    {
      id: 'tv-step-2',
      stepNumber: 2,
      title: 'Equipment Setup and Safety Check',
      description: 'Prepare transport ventilator and perform comprehensive safety checks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Perform pre-use inspection: power, battery level, circuit integrity',
        'Test all alarms: high pressure, low pressure, disconnect, power failure',
        'Check oxygen supply and backup oxygen sources',
        'Verify patient circuit connections and humidification system',
        'Test ventilator modes and parameter adjustment functions',
        'Ensure backup manual bag-valve device immediately available',
        'Check suction equipment and airway management supplies',
        'Verify monitoring equipment: capnography, pulse oximetry'
      ],
      equipmentNeeded: [
        'Transport ventilator with patient circuit',
        'Oxygen source with adequate supply for transport duration',
        'Backup bag-valve-mask device',
        'Suction equipment and catheters',
        'Capnography and pulse oximetry monitoring',
        'Backup battery and power sources',
        'Ventilator circuit and humidification system',
        'Emergency airway equipment'
      ],
      safetyNotes: [
        'Never use transport ventilator without thorough equipment check',
        'Battery life must exceed transport time with adequate reserve',
        'All alarm systems must be functional before patient connection'
      ]
    },
    {
      id: 'tv-step-3',
      stepNumber: 3,
      title: 'Initial Ventilator Settings Configuration',
      description: 'Set appropriate initial ventilator parameters based on patient assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Select ventilation mode: volume control (VCV) or pressure control (PCV)',
        'Set tidal volume: 6-8 mL/kg ideal body weight (lung protective)',
        'Adjust respiratory rate: 12-20 breaths/minute for adults',
        'Set PEEP: 5 cmH2O initially, adjust based on oxygenation needs',
        'Configure FiO2: start at 100%, titrate to SpO2 >94%',
        'Set pressure limits: 30-40 cmH2O peak inspiratory pressure',
        'Adjust inspiratory time: I:E ratio 1:2 to 1:3',
        'Configure alarm limits: high/low pressure, minute ventilation, disconnect'
      ],
      safetyNotes: [
        'Use lung protective ventilation strategies to prevent ventilator-induced injury',
        'Initial settings should err on side of safety - adjust based on response',
        'All alarm limits must be set appropriately before patient connection'
      ]
    },
    {
      id: 'tv-step-4',
      stepNumber: 4,
      title: 'Patient Connection and Transition',
      description: 'Connect patient to transport ventilator and transition from manual ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Pre-oxygenate patient with 100% FiO2 via manual ventilation',
        'Connect transport ventilator to established airway device',
        'Initiate mechanical ventilation and immediately assess chest rise',
        'Verify bilateral breath sounds and adequate air entry',
        'Check capnography waveform and ETCO2 values',
        'Monitor oxygen saturation and hemodynamic response',
        'Assess patient comfort and synchrony with ventilator',
        'Confirm all connections secure and circuit intact'
      ],
      safetyNotes: [
        'Never leave patient unattended during ventilator connection',
        'Be prepared to immediately return to manual ventilation if problems occur',
        'Continuous monitoring essential during transition period'
      ]
    },
    {
      id: 'tv-step-5',
      stepNumber: 5,
      title: 'Ventilator Parameter Optimization',
      description: 'Adjust ventilator settings based on patient response and clinical assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Titrate FiO2 to maintain SpO2 94-98% (88-92% for COPD patients)',
        'Adjust tidal volume based on plateau pressure (<30 cmH2O)',
        'Modify respiratory rate to achieve appropriate minute ventilation',
        'Titrate PEEP for optimal oxygenation while preventing hemodynamic compromise',
        'Assess patient-ventilator synchrony and adjust trigger sensitivity',
        'Monitor peak and plateau pressures to prevent barotrauma',
        'Evaluate ETCO2 trends and adjust ventilation accordingly',
        'Consider sedation needs for patient comfort and ventilator compliance'
      ],
      safetyNotes: [
        'Small incremental changes prevent sudden deterioration',
        'Monitor hemodynamics closely - positive pressure affects venous return',
        'Document all parameter changes and patient response'
      ]
    },
    {
      id: 'tv-step-6',
      stepNumber: 6,
      title: 'Continuous Monitoring and Alarm Management',
      description: 'Provide ongoing monitoring and respond appropriately to alarms',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Monitor respiratory parameters: tidal volume, minute ventilation, pressures',
        'Assess oxygenation: SpO2, FiO2 requirements, PEEP effects',
        'Track ventilation: ETCO2, respiratory rate, patient effort',
        'Evaluate hemodynamic status: blood pressure, heart rate, perfusion',
        'Respond to alarms systematically: high pressure, low pressure, disconnect',
        'Perform regular circuit checks and condensation management',
        'Monitor battery level and power source continuously',
        'Document ventilator parameters and patient response regularly'
      ],
      safetyNotes: [
        'Never silence alarms without addressing underlying cause',
        'High pressure alarms may indicate pneumothorax or obstruction',
        'Low pressure alarms often indicate circuit disconnect or leak'
      ]
    },
    {
      id: 'tv-step-7',
      stepNumber: 7,
      title: 'Complication Recognition and Management',
      description: 'Identify and manage ventilator-related complications during transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Recognize pneumothorax: sudden deterioration, high pressures, absent breath sounds',
        'Identify circuit problems: leaks, disconnections, obstructions',
        'Assess for ventilator-induced lung injury: high pressures, poor compliance',
        'Monitor for hemodynamic compromise: hypotension, decreased cardiac output',
        'Detect patient-ventilator asynchrony: fighting ventilator, ineffective breathing',
        'Manage equipment malfunctions: power failure, mechanical problems',
        'If complications occur: return to manual ventilation immediately',
        'Prepare for emergency interventions: needle decompression, medication administration'
      ],
      contraindications: [
        'If pneumothorax suspected: prepare for immediate needle decompression',
        'If equipment failure: switch to manual ventilation immediately',
        'If severe patient-ventilator asynchrony: consider sedation or manual ventilation'
      ],
      safetyNotes: [
        'When in doubt, return to manual ventilation - it is always safer',
        'Have emergency decompression equipment immediately available',
        'Continuous vigilance essential - complications can develop rapidly'
      ]
    },
    {
      id: 'tv-step-8',
      stepNumber: 8,
      title: 'Transport Preparation and Handover',
      description: 'Prepare for transport and provide comprehensive handover to receiving team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Secure all equipment and connections for transport movement',
        'Ensure adequate oxygen supply for entire transport duration plus reserve',
        'Verify backup power sources and manual ventilation equipment accessible',
        'Position ventilator and monitoring equipment safely in transport vehicle',
        'Prepare comprehensive report: initial settings, changes made, patient response',
        'Document complications encountered and interventions performed',
        'Communicate ventilator parameters and patient status to receiving team',
        'Plan for potential need to return to manual ventilation during transport'
      ],
      equipmentNeeded: [
        'Adequate oxygen supply for transport duration plus 50% reserve',
        'Backup power sources and charged batteries',
        'Secure mounting system for transport',
        'Manual ventilation equipment immediately accessible'
      ],
      safetyNotes: [
        'Transport ventilator use requires constant vigilance and preparation',
        'Clear communication with receiving team essential for continuity of care',
        'Always have plan for reverting to manual ventilation if needed'
      ]
    }
  ],

  // 41. UMBILICAL VEIN CANNULATION - Emergency vascular access in newborns
  'umbilical-vein-cannulation': [
    {
      id: 'uvc-step-1',
      stepNumber: 1,
      title: 'Newborn Assessment and Indication Determination',
      description: 'Assess newborn condition and determine need for umbilical vein cannulation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess newborn stability: heart rate, respiratory effort, color, tone',
        'Evaluate need for emergency vascular access: medication administration, volume expansion',
        'Determine gestational age and birth weight for appropriate catheter sizing',
        'Check for contraindications: omphalitis, abdominal wall defects',
        'Assess umbilical cord condition: fresh, adequate length, vessel patency',
        'Consider timing: ideally within first 24-48 hours when vessels remain patent',
        'Evaluate alternative access routes: intraosseous, peripheral IV',
        'Prepare for potential complications and emergency interventions'
      ],
      contraindications: [
        'Omphalitis or umbilical infection',
        'Significant abdominal wall defects (omphalocele, gastroschisis)',
        'Necrotizing enterocolitis with abdominal distention',
        'Suspected vascular anomalies or portal hypertension',
        'Peritonitis or abdominal contamination'
      ],
      safetyNotes: [
        'UVC placement requires sterile technique and appropriate timing',
        'Anatomical knowledge critical for safe vessel identification',
        'Have emergency resuscitation equipment immediately available'
      ]
    },
    {
      id: 'uvc-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Sterile Setup',
      description: 'Prepare all necessary equipment and establish sterile field for umbilical cannulation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Perform thorough hand hygiene and don sterile gloves and gown',
        'Select appropriate catheter: 3.5Fr for <1.5kg, 5Fr for >1.5kg',
        'Prepare sterile umbilical catheter tray with all instruments',
        'Gather antiseptic solution (povidone-iodine or chlorhexidine)',
        'Prepare umbilical tape or silk ties for hemostasis',
        'Have scalpel blade (#11) and fine-tipped forceps ready',
        'Prepare flush solution: heparinized saline (1 unit/mL)',
        'Ensure adequate lighting and radiant warmer for temperature control'
      ],
      equipmentNeeded: [
        'Sterile umbilical catheter (3.5Fr or 5Fr)',
        'Sterile gloves, gown, and drapes',
        'Antiseptic solution (povidone-iodine)',
        'Umbilical tape or silk ties',
        'Scalpel with #11 blade',
        'Fine-tipped forceps and scissors',
        '3-way stopcock and extension tubing',
        'Heparinized saline flush solution'
      ],
      safetyNotes: [
        'Maintain strict sterile technique throughout procedure',
        'Temperature control essential - use radiant warmer',
        'All equipment must be immediately accessible'
      ]
    },
    {
      id: 'uvc-step-3',
      stepNumber: 3,
      title: 'Umbilical Cord Preparation and Vessel Identification',
      description: 'Prepare umbilical cord stump and identify appropriate vessels for cannulation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position newborn supine with umbilical area exposed',
        'Clean umbilical cord stump and surrounding area with antiseptic',
        'Apply sterile drapes leaving umbilical stump exposed',
        'Tie umbilical tape around base of cord stump for hemostasis',
        'Cut cord stump to approximately 1-2 cm length with scalpel',
        'Identify umbilical vessels: 1 large vein (thin-walled) and 2 arteries (thick-walled)',
        'Clear any clots from umbilical vein using gentle irrigation',
        'Dilate umbilical vein gently with closed forceps if needed'
      ],
      safetyNotes: [
        'Umbilical vein is larger and thin-walled compared to arteries',
        'Gentle technique prevents vessel damage and bleeding',
        'Adequate hemostasis essential before vessel cannulation'
      ]
    },
    {
      id: 'uvc-step-4',
      stepNumber: 4,
      title: 'Catheter Insertion and Advancement',
      description: 'Insert umbilical catheter and advance to appropriate position',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Fill catheter with heparinized saline to prevent air embolism',
        'Insert catheter tip into umbilical vein using gentle pressure',
        'Advance catheter slowly while maintaining slight traction on cord',
        'Advance 4-5 cm for term infant (to level of diaphragm)',
        'Feel for resistance and stop if significant resistance encountered',
        'Aspirate for blood return to confirm intravascular position',
        'If no blood return, withdraw slightly and reposition',
        'Secure catheter at appropriate depth based on infant size'
      ],
      safetyNotes: [
        'Never force catheter advancement against resistance',
        'Correct depth prevents cardiac complications',
        'Blood return confirms intravascular placement'
      ]
    },
    {
      id: 'uvc-step-5',
      stepNumber: 5,
      title: 'Position Confirmation and Catheter Securement',
      description: 'Confirm correct catheter position and secure appropriately',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Confirm easy aspiration of blood and smooth infusion of fluids',
        'Check for appropriate catheter depth: tip at diaphragm level',
        'Avoid advancement into heart (would see cardiac waveform)',
        'Secure catheter to umbilical stump with sutures or tape',
        'Apply sterile dressing around insertion site',
        'Loop catheter to prevent inadvertent dislodgement',
        'Label catheter clearly as umbilical venous catheter',
        'Document insertion depth and position'
      ],
      safetyNotes: [
        'Proper positioning prevents cardiac arrhythmias',
        'Secure attachment prevents catheter migration',
        'Clear labeling prevents medication errors'
      ]
    },
    {
      id: 'uvc-step-6',
      stepNumber: 6,
      title: 'Functional Testing and Initial Use',
      description: 'Test catheter function and initiate appropriate therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Flush catheter with small volume of heparinized saline',
        'Test aspiration and infusion capabilities',
        'Connect to appropriate IV fluids or medication infusion',
        'Begin emergency medications if indicated: epinephrine, volume expanders',
        'Monitor for signs of catheter malfunction or displacement',
        'Assess newborn response to initial interventions',
        'Document all medications and fluids administered',
        'Prepare for potential catheter complications'
      ],
      safetyNotes: [
        'Use smallest volumes possible for flushing',
        'Monitor for signs of fluid overload in small infants',
        'All medications should be appropriate for umbilical route'
      ]
    },
    {
      id: 'uvc-step-7',
      stepNumber: 7,
      title: 'Complication Monitoring and Management',
      description: 'Monitor for complications and provide appropriate management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Monitor for arrhythmias: bradycardia, ectopic beats (catheter too deep)',
        'Assess for bleeding: umbilical site, catheter connections',
        'Watch for signs of infection: temperature instability, lethargy',
        'Check for thrombosis: decreased perfusion, cyanosis',
        'Monitor for air embolism: sudden deterioration, cardiac arrest',
        'Assess catheter patency: ability to flush and aspirate',
        'If arrhythmias occur: withdraw catheter 1-2 cm',
        'If complications develop: remove catheter and seek alternative access'
      ],
      contraindications: [
        'If persistent arrhythmias: remove catheter immediately',
        'If signs of thrombosis: discontinue use and consider anticoagulation',
        'If infection suspected: remove catheter and start antibiotics'
      ],
      safetyNotes: [
        'Cardiac arrhythmias indicate catheter tip too close to heart',
        'Early recognition of complications crucial for newborn safety',
        'Have emergency resuscitation drugs immediately available'
      ]
    },
    {
      id: 'uvc-step-8',
      stepNumber: 8,
      title: 'Transport Preparation and Handover',
      description: 'Prepare for transport and provide comprehensive care transition',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Secure all catheter connections and tubing for transport',
        'Ensure continuous monitoring during transport: heart rate, oxygen saturation',
        'Maintain temperature control: radiant warmer or transport incubator',
        'Document all procedures, medications, and complications encountered',
        'Prepare comprehensive report for NICU team including catheter details',
        'Plan for potential catheter removal or replacement at receiving facility',
        'Ensure family is informed of procedure and newborn status',
        'Continue monitoring for late complications during transport'
      ],
      equipmentNeeded: [
        'Transport monitoring equipment',
        'Temperature control devices',
        'Emergency medications for transport',
        'Backup vascular access supplies'
      ],
      safetyNotes: [
        'UVCs require continuous monitoring and expert neonatal care',
        'Clear communication with NICU team essential',
        'Family support and explanation important for ongoing care'
      ]
    }
  ],

  // 42. EZ-IO DISTAL TIBIA INSERTION - Intraosseous vascular access for emergency situations
  'ez-io-distal-tibia': [
    {
      id: 'ezio-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Indication Determination',
      description: 'Assess patient condition and determine need for intraosseous access',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess patient consciousness level and hemodynamic stability',
        'Evaluate for failed peripheral IV attempts or difficult vascular access',
        'Consider urgency: cardiac arrest, shock, severe dehydration, critical medications needed',
        'Check for contraindications: fracture at insertion site, infection, previous IO at site',
        'Assess age and weight: EZ-IO appropriate for patients >40kg (typically >12 years)',
        'Evaluate alternative access sites: humeral head, proximal tibia if indicated',
        'Consider patient comfort needs: conscious patients require local anesthesia',
        'Review indication: emergency vascular access when IV access impossible or delayed'
      ],
      contraindications: [
        'Fracture at or near insertion site',
        'Infection, cellulitis, or burn at insertion site',
        'Previous orthopedic hardware at insertion site',
        'Suspected compartment syndrome in affected limb',
        'Severe peripheral vascular disease (relative contraindication)',
        'Previous intraosseous insertion at same site within 48 hours'
      ],
      safetyNotes: [
        'IO access should be established within 60 seconds in emergency situations',
        'Multiple failed peripheral IV attempts indicate need for IO access',
        'IO route has same pharmacokinetics as central venous access'
      ]
    },
    {
      id: 'ezio-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Safety Check',
      description: 'Prepare EZ-IO device and verify all components are functional',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Check EZ-IO driver battery level and ensure full charge',
        'Select appropriate needle size: 15mm for thin patients, 25mm for average, 45mm for obese',
        'Verify needle set integrity: needle, stylet, and stabilizer intact',
        'Prepare antiseptic solution (alcohol-based or povidone-iodine)',
        'Gather local anesthetic: 2% lidocaine for conscious patients',
        'Prepare IV tubing, normal saline flush, and pressure bag',
        'Ensure sharps disposal container immediately available',
        'Have backup manual IO device available in case of equipment failure'
      ],
      equipmentNeeded: [
        'EZ-IO driver (fully charged)',
        'EZ-IO needle set (appropriate length)',
        'Antiseptic solution',
        'Local anesthetic (2% lidocaine)',
        'Normal saline flush syringes',
        'IV tubing and pressure bag',
        'Gauze pads and medical tape',
        'Sharps disposal container'
      ],
      safetyNotes: [
        'Always test EZ-IO driver function before patient use',
        'Use appropriate needle length to avoid inadequate penetration or over-penetration',
        'Have backup IO equipment immediately available'
      ]
    },
    {
      id: 'ezio-step-3',
      stepNumber: 3,
      title: 'Anatomical Landmark Identification and Site Selection',
      description: 'Locate correct anatomical landmarks for distal tibia IO insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient supine or sitting with leg accessible',
        'Locate medial malleolus (bony prominence on inside of ankle)',
        'Measure 2 fingerbreadths (3-4 cm) proximal to medial malleolus',
        'Identify flat medial surface of tibia - avoid curved anterior surface',
        'Palpate for soft tissue depth to select appropriate needle length',
        'Mark insertion site with skin marker or mental note',
        'Ensure adequate lighting and comfortable working position',
        'Position leg to prevent movement during insertion'
      ],
      safetyNotes: [
        'Correct landmark identification crucial for successful insertion',
        'Avoid insertion too close to ankle joint to prevent joint damage',
        'Medial surface is preferred due to minimal soft tissue coverage'
      ]
    },
    {
      id: 'ezio-step-4',
      stepNumber: 4,
      title: 'Skin Preparation and Local Anesthesia',
      description: 'Prepare insertion site and provide local anesthesia for conscious patients',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Clean insertion site with antiseptic in circular motion expanding outward',
        'Allow antiseptic to dry completely (minimum 30 seconds)',
        'For conscious patients: inject 1-2 mL lidocaine 2% into skin and periosteum',
        'Use small gauge needle (25-27G) for lidocaine injection',
        'Inject slowly to minimize discomfort and allow adequate anesthesia',
        'Wait 2-3 minutes for anesthetic effect before IO insertion',
        'Maintain sterile technique throughout preparation',
        'Warn patient about pressure sensation during needle insertion'
      ],
      safetyNotes: [
        'Local anesthesia essential for conscious patients - bone penetration is painful',
        'Lidocaine injection should reach periosteum for adequate anesthesia',
        'Avoid excessive anesthetic volume which may obscure landmarks'
      ]
    },
    {
      id: 'ezio-step-5',
      stepNumber: 5,
      title: 'EZ-IO Needle Insertion Technique',
      description: 'Insert IO needle using proper technique and EZ-IO driver',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Hold EZ-IO driver firmly with dominant hand like a pencil',
        'Place needle set firmly against insertion site at 90-degree angle',
        'Apply gentle downward pressure and activate driver trigger',
        'Advance needle until hub reaches skin level (usually 10-15 seconds)',
        'Stop drilling when resistance suddenly decreases (cortex penetrated)',
        'Remove stylet by pulling straight out - save for potential repositioning',
        'Needle should stand upright without support if properly placed',
        'Observe for immediate complications: extravasation, severe pain'
      ],
      safetyNotes: [
        'Maintain 90-degree angle to prevent needle deflection',
        'Do not over-penetrate - stop when resistance decreases',
        'If needle wobbles or feels loose, remove and select new site'
      ]
    },
    {
      id: 'ezio-step-6',
      stepNumber: 6,
      title: 'Position Confirmation and Patency Testing',
      description: 'Confirm correct needle placement and test for proper function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Attach 10 mL syringe and attempt to aspirate bone marrow',
        'Aspiration of marrow confirms placement but absence doesn\'t rule out success',
        'Flush with 5-10 mL normal saline - should flow easily without resistance',
        'Watch for signs of extravasation: swelling, fluid tracking under skin',
        'Needle should remain upright and stable without wobbling',
        'Patient should report minimal discomfort if properly anesthetized',
        'If resistance to flushing or extravasation: remove needle and retry at new site',
        'Document successful placement and any complications encountered'
      ],
      safetyNotes: [
        'Inability to flush indicates malposition or needle obstruction',
        'Extravasation can cause compartment syndrome - monitor closely',
        'Successful flush is more important than marrow aspiration for confirmation'
      ]
    },
    {
      id: 'ezio-step-7',
      stepNumber: 7,
      title: 'Medication Administration and Monitoring',
      description: 'Administer medications through IO route and monitor patient response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Connect IV tubing and prime with normal saline',
        'For conscious patients: inject 2 mL lidocaine 2% through IO before medications',
        'Administer emergency medications at same doses as IV route',
        'Use pressure bag or manual pressure for faster infusion rates',
        'Monitor insertion site continuously for signs of infiltration',
        'Flush with 5-10 mL saline after each medication to ensure delivery',
        'Document all medications administered with times and patient response',
        'Monitor vital signs and clinical response to interventions'
      ],
      safetyNotes: [
        'IO medications have same onset time and bioavailability as IV route',
        'Lidocaine through IO prevents pain during medication infusion',
        'Pressure may be needed for adequate flow rates in emergency situations'
      ]
    },
    {
      id: 'ezio-step-8',
      stepNumber: 8,
      title: 'Ongoing Care and Removal Planning',
      description: 'Provide ongoing IO management and plan for definitive vascular access',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Secure IO needle with gauze and medical tape to prevent movement',
        'Continue monitoring insertion site for complications throughout transport',
        'Establish peripheral IV access as soon as possible to replace IO',
        'Document total volume infused and all medications administered',
        'Plan for IO removal once stable IV access established',
        'Communicate IO placement and medications to receiving facility',
        'Monitor for late complications: osteomyelitis risk with prolonged use',
        'IO should be removed within 24 hours or replaced with central access'
      ],
      equipmentNeeded: [
        'Gauze and medical tape for securement',
        'Documentation materials',
        'Peripheral IV supplies for replacement access'
      ],
      safetyNotes: [
        'IO access is temporary bridge until definitive vascular access obtained',
        'Risk of osteomyelitis increases with prolonged use beyond 24 hours',
        'Always attempt to establish conventional IV access once patient stabilized'
      ]
    }
  ],

  // 43. C-SPINE CLEARANCE - Clinical cervical spine clearance assessment
  'c-spine-clearance': [
    {
      id: 'csc-step-1',
      stepNumber: 1,
      title: 'Scene Assessment and Mechanism Evaluation',
      description: 'Assess mechanism of injury and determine potential for cervical spine involvement',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Evaluate mechanism: motor vehicle crash, fall >3 feet, diving, sports injury',
        'Assess force vectors: axial loading, hyperflexion, hyperextension, rotation',
        'Determine high-risk mechanisms: high-speed MVA, rollover, ejection',
        'Consider age factors: >65 years increases fracture risk significantly',
        'Review dangerous mechanisms: axial loading (diving, fallen headfirst)',
        'Assess for distracting injuries that may mask neck pain',
        'Consider intoxication: alcohol, drugs affecting pain perception',
        'Document mechanism clearly for decision-making process'
      ],
      contraindications: [
        'High-risk mechanism with unclear history',
        'Multiple trauma with altered consciousness',
        'Intoxication preventing reliable assessment',
        'Language barrier preventing clear communication',
        'Cognitive impairment affecting cooperation'
      ],
      safetyNotes: [
        'When in doubt, maintain immobilization - false positive better than false negative',
        'Multiple trauma patients require different risk stratification',
        'Age >65 significantly increases fracture risk even with minor trauma'
      ]
    },
    {
      id: 'csc-step-2',
      stepNumber: 2,
      title: 'Initial Patient Assessment and Neurological Screen',
      description: 'Perform initial assessment focusing on neurological function and alertness',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess level of consciousness: GCS must be 15 for clearance consideration',
        'Evaluate alertness and orientation: person, place, time, situation',
        'Screen for intoxication: alcohol odor, slurred speech, inappropriate behavior',
        'Check for head injury: scalp lacerations, facial trauma, altered mental status',
        'Perform rapid neurological screen: motor function in all extremities',
        'Assess for sensory deficits: numbness, tingling, altered sensation',
        'Check for signs of spinal shock: bradycardia with hypotension',
        'Document baseline neurological status before clearance attempt'
      ],
      safetyNotes: [
        'Any neurological deficit requires immediate immobilization',
        'GCS <15 excludes patient from clinical clearance protocols',
        'Spinal shock can mask neurological deficits initially'
      ]
    },
    {
      id: 'csc-step-3',
      stepNumber: 3,
      title: 'Apply Clinical Decision Rules',
      description: 'Apply validated clinical decision rules: NEXUS or Canadian C-Spine Rule',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'NEXUS Criteria - All 5 must be negative: no midline tenderness, no focal deficits',
        'NEXUS continued: normal alertness, no intoxication, no distracting injury',
        'Canadian C-Spine Rule: Age, mechanism, ability to rotate neck actively',
        'High-risk factors (Canadian): age >65, dangerous mechanism, extremity paresthesias',
        'Low-risk factors: simple rear-end MVA, sitting position, ambulatory at scene',
        'Safe assessment: able to actively rotate neck 45 degrees each direction',
        'Choose appropriate rule based on training and protocol requirements',
        'Document which rule applied and results of each criterion'
      ],
      safetyNotes: [
        'Both rules require specific training and understanding for safe application',
        'Canadian C-Spine Rule may be more sensitive but requires specific technique',
        'Never apply rules if patient doesn\'t meet basic inclusion criteria'
      ]
    },
    {
      id: 'csc-step-4',
      stepNumber: 4,
      title: 'Physical Examination of Cervical Spine',
      description: 'Perform systematic physical examination of cervical spine and related structures',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Inspect neck visually: deformity, swelling, bruising, penetrating injury',
        'Palpate spinous processes C1-T1: tenderness, step-offs, muscle spasm',
        'Assess posterior neck muscles: spasm, guarding, tenderness',
        'Check range of motion: ONLY if decision rules suggest safe assessment',
        'Active range of motion only: patient moves own head, never passive',
        'Test all directions: flexion, extension, lateral flexion, rotation',
        'Monitor for pain, apprehension, or neurological symptoms during movement',
        'Stop immediately if pain or neurological symptoms develop'
      ],
      safetyNotes: [
        'Never perform passive range of motion during clearance',
        'Any pain or neurological symptoms during movement requires immobilization',
        'Range of motion testing only appropriate if decision rules indicate safe'
      ]
    },
    {
      id: 'csc-step-5',
      stepNumber: 5,
      title: 'Comprehensive Neurological Assessment',
      description: 'Perform detailed neurological examination to detect subtle deficits',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Motor function: test strength in all major muscle groups bilaterally',
        'Sensory function: light touch and pain sensation in all dermatomes',
        'Reflexes: deep tendon reflexes, pathological reflexes (Babinski)',
        'Coordination: finger-to-nose, rapid alternating movements',
        'Cranial nerves: especially those affected by high cervical injury',
        'Autonomic function: heart rate, blood pressure, temperature regulation',
        'Reassess throughout examination: deficits may become apparent over time',
        'Document all findings systematically and objectively'
      ],
      safetyNotes: [
        'Subtle neurological deficits may indicate significant spinal injury',
        'Spinal cord injury without radiographic abnormality (SCIWORA) possible',
        'Serial neurological assessments more reliable than single examination'
      ]
    },
    {
      id: 'csc-step-6',
      stepNumber: 6,
      title: 'Assessment of Distracting Injuries',
      description: 'Identify and evaluate distracting injuries that may mask cervical spine pain',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Long bone fractures: femur, humerus, tibia causing significant pain',
        'Visceral injuries: chest pain, abdominal pain, pelvic pain',
        'Large lacerations or burns causing significant discomfort',
        'Other spinal injuries: thoracic or lumbar spine fractures',
        'Severe intoxication: alcohol or drug impairment affecting pain perception',
        'Consider pain severity: would injury prevent patient from noticing neck pain?',
        'Evaluate pain medication effects: opioids, muscle relaxants',
        'Document all potentially distracting injuries and their severity'
      ],
      contraindications: [
        'Any distracting injury that could mask cervical spine pain',
        'Pain medication administration prior to clearance',
        'Multiple trauma with ongoing pain from other injuries'
      ],
      safetyNotes: [
        'Distracting injuries are one of the most common causes of missed C-spine injury',
        'When in doubt about distraction, maintain immobilization',
        'Consider cumulative effect of multiple minor injuries'
      ]
    },
    {
      id: 'csc-step-7',
      stepNumber: 7,
      title: 'Clinical Decision and Documentation',
      description: 'Make clinical decision about cervical spine clearance based on assessment findings',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Review all assessment findings systematically before decision',
        'Apply decision rule criteria strictly - all criteria must be met for clearance',
        'Consider patient-specific factors: age, comorbidities, medication effects',
        'If ALL clearance criteria met: cervical spine may be cleared clinically',
        'If ANY criteria not met: maintain immobilization and transport',
        'Document decision-making process and rationale clearly',
        'Communicate findings and decision to receiving facility',
        'Provide clear instructions to patient if cleared'
      ],
      safetyNotes: [
        'Clinical clearance requires meeting ALL criteria - no exceptions',
        'Documentation must support decision-making process',
        'Patient education important if spine cleared clinically'
      ]
    },
    {
      id: 'csc-step-8',
      stepNumber: 8,
      title: 'Post-Clearance Monitoring and Transport Planning',
      description: 'Provide ongoing monitoring and appropriate transport based on clearance decision',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'If cleared: remove immobilization devices and allow normal movement',
        'Educate patient: watch for delayed symptoms (pain, numbness, weakness)',
        'Advise return precautions: seek care if symptoms develop',
        'If not cleared: maintain immobilization throughout transport and care',
        'Continue neurological monitoring throughout transport',
        'Reassess neurological status if clinical condition changes',
        'Communicate clearance status clearly to receiving facility',
        'Document any changes in neurological status during transport'
      ],
      equipmentNeeded: [
        'Cervical collar (appropriate size)',
        'Spinal board or vacuum mattress',
        'Head blocks and strapping system',
        'Neurological assessment tools'
      ],
      safetyNotes: [
        'Cleared patients should still be monitored for delayed symptoms',
        'Any deterioration in neurological status requires re-immobilization',
        'Clear communication prevents unnecessary imaging at hospital'
      ]
    }
  ],

  // 44. MANAGEMENT OF PROLAPSED CORD - Obstetric emergency management
  'management-prolapsed-cord': [
    {
      id: 'mpc-step-1',
      stepNumber: 1,
      title: 'Recognition and Initial Assessment',
      description: 'Recognize cord prolapse and perform rapid initial assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Identify cord prolapse: visible or palpable umbilical cord at or beyond cervix',
        'Assess fetal viability: check for cord pulsations indicating fetal circulation',
        'Evaluate cervical dilation and station of presenting part',
        'Determine gestational age: viability threshold typically >24 weeks',
        'Assess maternal vital signs and hemodynamic stability',
        'Check fetal heart rate if fetal monitor available',
        'Consider occult prolapse: cord alongside presenting part but not visible',
        'Activate emergency protocols immediately - time critical emergency'
      ],
      contraindications: [
        'Fetal demise confirmed prior to prolapse recognition',
        'Non-viable fetus <24 weeks gestation',
        'Maternal cardiac arrest requiring resuscitation priority'
      ],
      safetyNotes: [
        'Cord prolapse is a true obstetric emergency requiring immediate action',
        'Fetal hypoxia and death can occur within minutes',
        'Every minute of delay increases morbidity and mortality risk'
      ]
    },
    {
      id: 'mpc-step-2',
      stepNumber: 2,
      title: 'Immediate Cord Protection Measures',
      description: 'Implement immediate measures to prevent cord compression and fetal hypoxia',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Do NOT attempt to replace cord - this may cause vasospasm',
        'Handle cord minimally and gently to prevent vasospasm',
        'Keep exposed cord warm and moist with sterile saline-soaked gauze',
        'Cover cord to prevent drying and temperature loss',
        'Avoid excessive manipulation or touching of cord',
        'Monitor cord pulsations to assess fetal circulation',
        'Position to minimize cord compression between fetus and pelvis',
        'Prepare for immediate delivery or emergency transport'
      ],
      equipmentNeeded: [
        'Sterile gauze pads',
        'Warm sterile normal saline',
        'Sterile gloves',
        'Obstetric emergency kit'
      ],
      safetyNotes: [
        'Never attempt to push cord back into uterus',
        'Gentle handling essential - cord vasospasm can be fatal',
        'Keep cord warm and moist to maintain circulation'
      ]
    },
    {
      id: 'mpc-step-3',
      stepNumber: 3,
      title: 'Maternal Positioning and Gravity Relief',
      description: 'Position mother to relieve pressure on prolapsed cord using gravity',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Knee-chest position: mother on hands and knees with chest down',
        'Trendelenburg position: head down, feet elevated 15-30 degrees',
        'Left lateral position with hips elevated if knee-chest not possible',
        'Use gravity to move presenting part away from cord',
        'Ensure airway remains patent in chosen position',
        'Support mother in position with pillows or assistants',
        'Maintain position throughout transport and delivery preparation',
        'Monitor maternal respiratory status in chosen position'
      ],
      safetyNotes: [
        'Positioning must not compromise maternal airway or breathing',
        'Knee-chest position most effective but may be difficult to maintain',
        'Any position that relieves cord compression is beneficial'
      ]
    },
    {
      id: 'mpc-step-4',
      stepNumber: 4,
      title: 'Manual Elevation of Presenting Part',
      description: 'Manually elevate fetal presenting part to relieve cord compression',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Insert two fingers into vagina using sterile gloves',
        'Identify presenting part: head, breech, or shoulder',
        'Gently elevate presenting part away from pelvic inlet',
        'Maintain constant upward pressure to keep cord decompressed',
        'Avoid pushing against cord directly',
        'Maintain elevation throughout transport and until delivery',
        'Second provider may need to relieve first provider during transport',
        'Document time of initial elevation and any changes in cord pulsation'
      ],
      safetyNotes: [
        'Maintain sterile technique throughout procedure',
        'Gentle, sustained pressure - avoid intermittent pushing',
        'Provider fatigue may require team rotation for sustained elevation'
      ]
    },
    {
      id: 'mpc-step-5',
      stepNumber: 5,
      title: 'Oxygen Administration and Maternal Support',
      description: 'Provide maternal oxygenation and supportive care during emergency',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Administer high-flow oxygen via non-rebreather mask at 15 L/min',
        'Monitor maternal vital signs: blood pressure, pulse, respirations',
        'Establish IV access with large-bore catheter if time permits',
        'Provide emotional support and clear explanation of situation',
        'Keep mother informed of interventions and transport plans',
        'Monitor for signs of maternal distress or complications',
        'Prepare for potential maternal hypotension from positioning',
        'Maintain maternal temperature and comfort'
      ],
      equipmentNeeded: [
        'High-flow oxygen and non-rebreather mask',
        'Vital signs monitoring equipment',
        'IV supplies and isotonic fluids',
        'Blankets for warmth and comfort'
      ],
      safetyNotes: [
        'Maternal oxygenation improves fetal oxygen delivery',
        'Positioning may cause maternal hypotension',
        'Emotional support crucial during this frightening emergency'
      ]
    },
    {
      id: 'mpc-step-6',
      stepNumber: 6,
      title: 'Rapid Transport Coordination',
      description: 'Coordinate immediate transport to facility capable of emergency cesarean',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Contact receiving hospital immediately - notify of cord prolapse emergency',
        'Request obstetric team and operating room preparation',
        'Provide estimated time of arrival and current fetal status',
        'Continue all interventions during transport without interruption',
        'Consider helicopter transport if available and faster than ground',
        'Maintain manual elevation and positioning throughout transport',
        'Monitor cord pulsations and document changes',
        'Prepare for potential emergency delivery en route'
      ],
      safetyNotes: [
        'Transport speed must be balanced with intervention quality',
        'Maintain all protective measures throughout transport',
        'Communication with receiving hospital essential for preparation'
      ]
    },
    {
      id: 'mpc-step-7',
      stepNumber: 7,
      title: 'Monitoring and Ongoing Assessment',
      description: 'Provide continuous monitoring and assessment during transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Continuously monitor cord pulsations - strong, weak, or absent',
        'Assess fetal heart rate if monitoring equipment available',
        'Monitor maternal vital signs every 5 minutes',
        'Evaluate effectiveness of positioning and manual elevation',
        'Watch for signs of cord vasospasm: loss of pulsations',
        'Assess for progression of labor or impending delivery',
        'Document all interventions and timeline of events',
        'Prepare for emergency field delivery if transport delayed'
      ],
      safetyNotes: [
        'Loss of cord pulsations indicates severe fetal compromise',
        'Continuous assessment guides intervention effectiveness',
        'Be prepared for emergency delivery if imminent'
      ]
    },
    {
      id: 'mpc-step-8',
      stepNumber: 8,
      title: 'Delivery Preparation and Handover',
      description: 'Prepare for emergency delivery and provide comprehensive handover',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'If delivery imminent: prepare for emergency delivery with cord prolapse',
        'Maintain cord decompression throughout any delivery process',
        'Assist with rapid delivery to minimize cord compression time',
        'Continue manual elevation until baby and cord are delivered',
        'Provide comprehensive report to receiving team: timeline, interventions',
        'Document exact time of prolapse recognition and all interventions',
        'Report cord pulsation status and any changes observed',
        'Assist with emergency cesarean preparation if indicated'
      ],
      equipmentNeeded: [
        'Emergency delivery kit',
        'Neonatal resuscitation equipment',
        'Suction and airway management supplies',
        'Documentation materials'
      ],
      safetyNotes: [
        'Emergency cesarean often required for best fetal outcome',
        'Field delivery may be necessary if transport not possible',
        'Detailed timeline documentation essential for medical-legal purposes'
      ]
    }
  ],

  // 45. CAROTID SINUS MASSAGE - Vagal maneuver for supraventricular tachycardia
  'carotid-sinus-massage': [
    {
      id: 'csm-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Indication Verification',
      description: 'Assess patient condition and verify appropriate indications for carotid sinus massage',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Confirm narrow-complex supraventricular tachycardia (SVT) on 12-lead ECG',
        'Verify heart rate >150 bpm with regular rhythm',
        'Assess hemodynamic stability: blood pressure, perfusion, consciousness',
        'Rule out contraindications: carotid bruits, known carotid disease',
        'Evaluate patient age: increased risk in elderly patients >65 years',
        'Check for signs of acute coronary syndrome or heart failure',
        'Consider alternative causes: atrial fibrillation, atrial flutter, sinus tachycardia',
        'Document baseline vital signs and cardiac rhythm before intervention'
      ],
      contraindications: [
        'Carotid bruits or known carotid artery disease',
        'Recent stroke or transient ischemic attack (<6 months)',
        'Known carotid stenosis or previous carotid surgery',
        'Hemodynamic instability requiring immediate cardioversion',
        'Wide-complex tachycardia or ventricular tachycardia',
        'Digoxin toxicity or suspected digitalis poisoning'
      ],
      safetyNotes: [
        'Carotid sinus massage can cause stroke in high-risk patients',
        'Always listen for carotid bruits before attempting procedure',
        'Age >65 years significantly increases stroke risk'
      ]
    },
    {
      id: 'csm-step-2',
      stepNumber: 2,
      title: 'Pre-procedure Preparation and Monitoring Setup',
      description: 'Prepare equipment and establish continuous cardiac monitoring',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Establish continuous cardiac monitoring with clear rhythm display',
        'Prepare defibrillator and ensure pads are readily available',
        'Set up IV access for potential medication administration',
        'Have atropine 0.5-1.0 mg ready for bradycardia or asystole',
        'Ensure transcutaneous pacing capability available',
        'Position patient supine with slight neck extension',
        'Have suction and airway equipment immediately available',
        'Brief team on potential complications and response plans'
      ],
      equipmentNeeded: [
        'Cardiac monitor with continuous display',
        'Defibrillator with transcutaneous pacing',
        'IV access and emergency medications',
        'Atropine 0.5-1.0 mg prepared',
        'Airway management equipment',
        'Blood pressure monitoring'
      ],
      safetyNotes: [
        'Continuous monitoring essential - asystole can occur',
        'Have emergency medications drawn up and ready',
        'Team should be prepared for immediate intervention'
      ]
    },
    {
      id: 'csm-step-3',
      stepNumber: 3,
      title: 'Carotid Artery Assessment and Positioning',
      description: 'Locate carotid pulse and assess for contraindications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position patient supine with head slightly extended',
        'Locate carotid pulse at level of thyroid cartilage',
        'Listen carefully for carotid bruits using stethoscope',
        'Palpate both carotids separately to assess quality',
        'Choose stronger pulse for massage site (usually right carotid)',
        'Avoid pressure on both carotids simultaneously',
        'Position fingers medial to sternocleidomastoid muscle',
        'Ensure clear access and comfortable hand position'
      ],
      safetyNotes: [
        'Never compress both carotid arteries simultaneously',
        'Presence of bruits is absolute contraindication',
        'Weak or absent pulse suggests significant carotid disease'
      ]
    },
    {
      id: 'csm-step-4',
      stepNumber: 4,
      title: 'Carotid Sinus Massage Technique',
      description: 'Perform carotid sinus massage using proper technique and pressure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Apply firm, steady pressure using fingertips (not palm)',
        'Locate carotid sinus just below angle of mandible',
        'Apply pressure in circular massaging motion',
        'Maintain pressure for 10-15 seconds maximum',
        'Apply sufficient pressure to compress carotid against vertebrae',
        'Monitor cardiac rhythm continuously during procedure',
        'Stop immediately if conversion occurs or complications develop',
        'Document time of massage and rhythm response'
      ],
      safetyNotes: [
        'Never exceed 15 seconds of continuous pressure',
        'Stop immediately if asystole or severe bradycardia occurs',
        'Excessive pressure can cause arterial dissection'
      ]
    },
    {
      id: 'csm-step-5',
      stepNumber: 5,
      title: 'Rhythm Monitoring and Response Assessment',
      description: 'Monitor cardiac rhythm and assess patient response to intervention',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Observe cardiac monitor continuously during and after massage',
        'Look for rhythm conversion to normal sinus rhythm',
        'Monitor for complications: asystole, bradycardia, heart block',
        'Assess hemodynamic response: blood pressure, perfusion',
        'Check neurological status: consciousness, speech, motor function',
        'Document rhythm changes and time of conversion if successful',
        'If unsuccessful after first attempt, may repeat once after 2-3 minutes',
        'Prepare alternative treatments if massage unsuccessful'
      ],
      safetyNotes: [
        'Asystole or severe bradycardia requires immediate treatment',
        'Neurological changes may indicate stroke - stop procedure',
        'Success rate decreases with repeated attempts'
      ]
    },
    {
      id: 'csm-step-6',
      stepNumber: 6,
      title: 'Complication Recognition and Management',
      description: 'Identify and manage complications of carotid sinus massage',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Monitor for asystole: prepare transcutaneous pacing, administer atropine',
        'Watch for severe bradycardia: atropine 0.5-1.0 mg IV if HR <50 bpm',
        'Assess for neurological complications: stroke, TIA, altered consciousness',
        'Check for arterial dissection: neck pain, neurological deficits',
        'Monitor blood pressure: hypotension may require fluids or pressors',
        'If complications occur: stop massage, provide supportive care',
        'Consider alternative treatments: adenosine, cardioversion',
        'Document all complications and treatments provided'
      ],
      contraindications: [
        'If asystole >10 seconds: begin transcutaneous pacing',
        'If stroke symptoms: activate stroke protocols immediately',
        'If severe bradycardia persists: consider atropine or pacing'
      ],
      safetyNotes: [
        'Complications can be life-threatening and require immediate treatment',
        'Stroke risk highest in elderly patients with vascular disease',
        'Have emergency interventions ready before beginning procedure'
      ]
    },
    {
      id: 'csm-step-7',
      stepNumber: 7,
      title: 'Post-procedure Monitoring and Assessment',
      description: 'Provide ongoing monitoring and assessment after carotid sinus massage',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Continue cardiac monitoring for at least 15-20 minutes post-procedure',
        'Monitor neurological status: speech, motor function, consciousness',
        'Assess for delayed complications: bradycardia, heart block',
        'Check blood pressure and hemodynamic stability',
        'Document success or failure of rhythm conversion',
        'If successful: monitor for recurrence of SVT',
        'If unsuccessful: prepare alternative treatments (adenosine, cardioversion)',
        'Evaluate need for cardiology consultation or advanced care'
      ],
      safetyNotes: [
        'Complications may develop several minutes after procedure',
        'Successful conversion may be temporary - monitor for recurrence',
        'Neurological assessment crucial for early stroke detection'
      ]
    },
    {
      id: 'csm-step-8',
      stepNumber: 8,
      title: 'Documentation and Follow-up Planning',
      description: 'Document procedure and plan appropriate follow-up care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Document indication, technique, duration, and outcome of massage',
        'Record pre- and post-procedure vital signs and cardiac rhythms',
        'Note any complications encountered and treatments provided',
        'Document neurological assessment findings before and after',
        'If successful: plan monitoring for SVT recurrence',
        'If unsuccessful: document alternative treatments attempted',
        'Communicate findings to receiving facility or cardiology team',
        'Educate patient about procedure and potential complications'
      ],
      equipmentNeeded: [
        'Documentation materials',
        'Rhythm strips for medical record',
        'Vital signs flow sheet',
        'Communication with receiving facility'
      ],
      safetyNotes: [
        'Thorough documentation important for medical-legal purposes',
        'Clear communication prevents unnecessary repeat procedures',
        'Patient education about recurrence signs important for follow-up'
      ]
    }
  ],

  // 46. LARYNGEAL TUBE AIRWAY - Supraglottic airway management
  'laryngeal-tube-airway': [
    {
      id: 'lta-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Device Selection',
      description: 'Assess patient airway needs and select appropriate laryngeal tube size',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess airway patency and need for supraglottic airway device',
        'Evaluate patient size and weight for appropriate device selection',
        'Select size based on patient height: Size 3 (4-5 feet), Size 4 (5-6 feet), Size 5 (>6 feet)',
        'Check for contraindications: intact gag reflex, conscious patient',
        'Assess for difficult airway predictors using LEMON criteria',
        'Consider alternative if upper airway obstruction suspected',
        'Verify adequate mouth opening (at least 2-3 cm)',
        'Position patient optimally for insertion'
      ],
      contraindications: [
        'Conscious patients with intact protective reflexes',
        'Known or suspected upper airway obstruction',
        'Patients with intact gag reflex',
        'Severe facial trauma preventing proper seal',
        'Suspected esophageal perforation or injury'
      ],
      safetyNotes: [
        'Only use in unconscious patients without protective reflexes',
        'Have backup airway plan ready including endotracheal intubation',
        'Proper sizing critical for effective seal and ventilation'
      ]
    },
    {
      id: 'lta-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Testing',
      description: 'Prepare laryngeal tube and verify all components function properly',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Remove laryngeal tube from sterile package and inspect for defects',
        'Test cuff integrity by inflating with appropriate volume of air',
        'Check that cuff deflates completely after testing',
        'Apply water-soluble lubricant to cuff and tip generously',
        'Prepare 60-80 mL syringe for cuff inflation',
        'Have bag-valve device ready for immediate ventilation',
        'Ensure suction equipment immediately available',
        'Position monitoring equipment for capnography'
      ],
      equipmentNeeded: [
        'Laryngeal tube (appropriate size)',
        '60-80 mL syringe for cuff inflation',
        'Water-soluble lubricant',
        'Bag-valve device with oxygen',
        'Suction equipment and catheters',
        'Capnography monitoring',
        'Pulse oximetry'
      ],
      safetyNotes: [
        'Never use damaged or defective device',
        'Proper lubrication essential for smooth insertion',
        'Have all equipment ready before insertion attempt'
      ]
    },
    {
      id: 'lta-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Preparation',
      description: 'Position patient optimally for laryngeal tube insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient supine with head in neutral position',
        'Slightly extend neck if no cervical spine concerns',
        'Open mouth using jaw lift or tongue blade',
        'Clear visible secretions or debris with suction',
        'Pre-oxygenate patient with bag-valve mask if possible',
        'Ensure adequate lighting and visualization',
        'Position provider at head of patient for optimal access',
        'Have assistant ready to apply cricoid pressure if needed'
      ],
      safetyNotes: [
        'Avoid hyperextension of neck in trauma patients',
        'Suction carefully to avoid stimulating gag reflex',
        'Pre-oxygenation improves safety margin during insertion'
      ]
    },
    {
      id: 'lta-step-4',
      stepNumber: 4,
      title: 'Laryngeal Tube Insertion Technique',
      description: 'Insert laryngeal tube using proper technique and anatomical landmarks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Hold laryngeal tube like a pencil with dominant hand',
        'Insert device along natural curve of airway',
        'Advance gently until resistance felt at hypopharynx',
        'Rotate device 90 degrees during insertion as needed',
        'Continue advancing until black line aligns with teeth',
        'Do not force insertion - gentle pressure only',
        'Complete insertion typically when resistance increases',
        'Remove introducer if present while holding device stable'
      ],
      safetyNotes: [
        'Never force insertion - risk of esophageal placement',
        'Gentle technique prevents trauma to airway structures',
        'Proper depth indicated by anatomical landmarks'
      ]
    },
    {
      id: 'lta-step-5',
      stepNumber: 5,
      title: 'Cuff Inflation and Seal Verification',
      description: 'Inflate cuff to appropriate pressure and verify proper seal',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Inflate cuff slowly with recommended volume (varies by size)',
        'Size 3: 60-80 mL, Size 4: 80-100 mL, Size 5: 90-120 mL',
        'Stop inflation when resistance felt or adequate seal achieved',
        'Check for audible leak during positive pressure ventilation',
        'Adjust cuff pressure to achieve adequate seal without over-inflation',
        'Verify bilateral breath sounds with stethoscope',
        'Watch for chest rise with each ventilation',
        'Remove syringe and cap inflation port'
      ],
      safetyNotes: [
        'Over-inflation can cause airway trauma and poor seal',
        'Under-inflation results in inadequate seal and aspiration risk',
        'Proper seal essential for effective ventilation'
      ]
    },
    {
      id: 'lta-step-6',
      stepNumber: 6,
      title: 'Placement Confirmation and Ventilation',
      description: 'Confirm correct placement and establish effective ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Attach bag-valve device and begin gentle ventilation',
        'Observe chest rise and fall with each ventilation',
        'Listen for bilateral breath sounds in all lung fields',
        'Check for absent breath sounds over epigastrium',
        'Monitor capnography waveform and ETCO2 values',
        'Assess oxygen saturation response to ventilation',
        'Verify adequate tidal volume delivery (6-8 mL/kg)',
        'Document successful placement and initial vital signs'
      ],
      safetyNotes: [
        'Absence of chest rise indicates malposition',
        'Gastric sounds suggest esophageal placement',
        'Capnography most reliable method for placement confirmation'
      ]
    },
    {
      id: 'lta-step-7',
      stepNumber: 7,
      title: 'Securing Device and Ongoing Management',
      description: 'Secure laryngeal tube and provide ongoing airway management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Secure device with tape or commercial securing device',
        'Note depth marking at teeth for reference',
        'Insert bite block to prevent device damage',
        'Continue controlled ventilation at appropriate rate',
        'Monitor for complications: aspiration, displacement',
        'Reassess breath sounds and chest rise regularly',
        'Watch for signs of airway obstruction or device failure',
        'Prepare for possible conversion to endotracheal intubation'
      ],
      equipmentNeeded: [
        'Medical tape or tube securing device',
        'Bite block or oral airway',
        'Continuous monitoring equipment'
      ],
      safetyNotes: [
        'Proper securing prevents accidental dislodgement',
        'Continuous monitoring essential for early problem detection',
        'Be prepared to remove device if complications develop'
      ]
    },
    {
      id: 'lta-step-8',
      stepNumber: 8,
      title: 'Transport and Handover Preparation',
      description: 'Prepare for transport and provide comprehensive handover information',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Ensure device remains secure during patient movement',
        'Continue ventilation and monitoring throughout transport',
        'Document insertion time, size used, and complications',
        'Monitor cuff pressure - may need adjustment with altitude changes',
        'Prepare handover report including indication and ease of insertion',
        'Communicate any difficulties encountered during placement',
        'Advise receiving team of device type and settings',
        'Plan for potential device removal or conversion at hospital'
      ],
      safetyNotes: [
        'Transport movement can cause device displacement',
        'Altitude changes may affect cuff pressure',
        'Clear communication prevents unnecessary device manipulation'
      ]
    }
  ],

  // 47. NORMAL CHILDBIRTH - PRE-DELIVERY AND DELIVERY - Emergency obstetric care
  'normal-childbirth-delivery': [
    {
      id: 'ncd-step-1',
      stepNumber: 1,
      title: 'Initial Assessment and Labor Evaluation',
      description: 'Assess maternal condition and determine stage of labor',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Obtain focused obstetric history: due date, previous births, complications',
        'Assess contraction frequency and intensity (timing, duration, strength)',
        'Check maternal vital signs and overall condition',
        'Evaluate for imminent delivery signs: urge to push, visible crowning',
        'Ask about premature rupture of membranes and fluid characteristics',
        'Screen for complications: bleeding, cord prolapse, breech presentation',
        'Determine if transport is possible or delivery is imminent',
        'Assess for multiple gestation if fundal height appears large'
      ],
      contraindications: [
        'Significant antepartum hemorrhage',
        'Prolapsed umbilical cord',
        'Breech or abnormal presentation',
        'Multiple gestation with complications'
      ],
      safetyNotes: [
        'If delivery not imminent, transport to hospital is preferred',
        'Be prepared for complications including shoulder dystocia',
        'Maintain universal precautions throughout assessment'
      ]
    },
    {
      id: 'ncd-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Sterile Setup',
      description: 'Prepare delivery equipment and establish sterile field',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Open obstetric delivery kit maintaining sterile technique',
        'Prepare sterile gloves, towels, and draping materials',
        'Ready cord clamps and sterile scissors for cord cutting',
        'Prepare bulb syringe for infant airway suctioning',
        'Set up blankets and towels for infant warming',
        'Ensure adequate lighting and working space',
        'Have neonatal resuscitation equipment available',
        'Prepare maternal perineal care supplies'
      ],
      equipmentNeeded: [
        'Obstetric delivery kit',
        'Sterile gloves and gowns',
        'Cord clamps and sterile scissors',
        'Bulb syringe and suction',
        'Warm blankets and towels',
        'Neonatal resuscitation equipment',
        'Plastic bags for placenta',
        'Perineal irrigation supplies'
      ],
      safetyNotes: [
        'Maintain strict sterile technique to prevent infection',
        'Have neonatal resuscitation equipment immediately available',
        'Ensure maternal and infant warming capabilities'
      ]
    },
    {
      id: 'ncd-step-3',
      stepNumber: 3,
      title: 'Positioning and Comfort Measures',
      description: 'Position mother optimally for delivery and provide support',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position mother in semi-recumbent or supported sitting position',
        'Support mother\'s back and thighs with pillows or assistants',
        'Ensure adequate hip flexion and thigh abduction',
        'Place sterile drapes under buttocks and around perineum',
        'Provide emotional support and reassurance throughout',
        'Coach breathing techniques during contractions',
        'Encourage mother to rest between contractions',
        'Keep perineal area clean and properly draped'
      ],
      safetyNotes: [
        'Avoid supine hypotensive syndrome with left lateral tilt',
        'Mother should never push until full cervical dilation',
        'Provide continuous emotional support and encouragement'
      ]
    },
    {
      id: 'ncd-step-4',
      stepNumber: 4,
      title: 'Crowning and Head Delivery',
      description: 'Manage fetal head delivery with controlled technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Support perineum with sterile gauze to prevent tearing',
        'Apply gentle counter-pressure to fetal head to control delivery',
        'Allow head to deliver slowly between contractions',
        'Check for nuchal cord (cord around neck) immediately',
        'If nuchal cord present: attempt to slip over head or clamp and cut',
        'Suction infant\'s mouth and nose once head is delivered',
        'Support head with both hands in neutral position',
        'Wait for external rotation before assisting shoulder delivery'
      ],
      contraindications: [
        'Never apply excessive traction to fetal head',
        'Do not rush delivery - allow natural progression',
        'Avoid aggressive perineal massage during crowning'
      ],
      safetyNotes: [
        'Controlled head delivery prevents maternal lacerations',
        'Nuchal cord management critical to prevent fetal hypoxia',
        'Proper suctioning clears airway before first breath'
      ]
    },
    {
      id: 'ncd-step-5',
      stepNumber: 5,
      title: 'Shoulder and Body Delivery',
      description: 'Complete infant delivery with proper shoulder technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Wait for external rotation - head will turn naturally',
        'Apply gentle downward traction to deliver anterior shoulder',
        'Then apply gentle upward traction to deliver posterior shoulder',
        'Support infant\'s body as it delivers rapidly after shoulders',
        'Never pull on infant - guide and support only',
        'Watch for shoulder dystocia - shoulders stuck behind pubic bone',
        'If shoulder dystocia: McRoberts position and suprapubic pressure',
        'Receive infant onto sterile towels and keep at level of perineum'
      ],
      safetyNotes: [
        'Shoulder dystocia is obstetric emergency requiring immediate action',
        'Never apply excessive traction - risk of brachial plexus injury',
        'Keep infant at perineal level until cord is clamped and cut'
      ]
    },
    {
      id: 'ncd-step-6',
      stepNumber: 6,
      title: 'Immediate Neonatal Care',
      description: 'Provide initial newborn assessment and resuscitation if needed',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Dry infant immediately and wrap in warm blankets',
        'Assess breathing, heart rate, and color (APGAR components)',
        'Suction mouth and nose if secretions present',
        'Provide tactile stimulation if infant not breathing spontaneously',
        'Begin positive pressure ventilation if HR <100 or not breathing',
        'Clamp umbilical cord 6 inches from infant, then 2 inches from first',
        'Cut cord between clamps with sterile scissors',
        'Continue warming and assessment while preparing for transport'
      ],
      equipmentNeeded: [
        'Warm blankets and towels',
        'Bulb syringe for suctioning',
        'Bag-valve-mask for neonates',
        'Cord clamps and sterile scissors',
        'Infant warming supplies'
      ],
      safetyNotes: [
        'Hypothermia major risk for newborns - aggressive warming essential',
        'If infant not breathing: begin resuscitation immediately',
        'Delay cord clamping for 1-3 minutes if possible for healthy infants'
      ]
    },
    {
      id: 'ncd-step-7',
      stepNumber: 7,
      title: 'Placental Delivery Management',
      description: 'Manage third stage of labor and placental delivery',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Watch for signs of placental separation: cord lengthening, gush of blood',
        'Never pull on umbilical cord to deliver placenta',
        'Apply gentle pressure above pubic bone while mother bears down',
        'Deliver placenta by controlled cord traction only after separation',
        'Inspect placenta for completeness - all cotyledons present',
        'Examine for retained placental fragments',
        'Massage uterine fundus to promote contraction and control bleeding',
        'Inspect birth canal for lacerations requiring repair'
      ],
      contraindications: [
        'Never apply traction to cord before placental separation',
        'Do not massage uterus before placental delivery',
        'Avoid aggressive cord traction'
      ],
      safetyNotes: [
        'Retained placenta causes severe hemorrhage',
        'Uterine massage essential for bleeding control',
        'Transport immediately if placenta not delivered within 30 minutes'
      ]
    },
    {
      id: 'ncd-step-8',
      stepNumber: 8,
      title: 'Post-Delivery Care and Transport Preparation',
      description: 'Provide post-delivery care for mother and infant',
      isRequired: true,
      isCritical: true,
      timeEstimate: 360,
      keyPoints: [
        'Continue uterine massage every 15 minutes to prevent hemorrhage',
        'Monitor maternal vital signs and bleeding status',
        'Inspect perineum for lacerations and apply pressure if bleeding',
        'Encourage breastfeeding to promote uterine contraction',
        'Keep both mother and infant warm during transport',
        'Document delivery time, APGAR scores, and complications',
        'Prepare comprehensive report for receiving hospital',
        'Transport placenta in plastic bag for hospital examination'
      ],
      safetyNotes: [
        'Postpartum hemorrhage is leading cause of maternal mortality',
        'Both mother and infant require continuous monitoring',
        'Clear documentation essential for continuity of care'
      ]
    }
  ],

  // 48. PREDICTION OF DIFFICULT DIRECT ENDOTRACHEAL INTUBATION - Airway assessment
  'prediction-difficult-intubation': [
    {
      id: 'pdi-step-1',
      stepNumber: 1,
      title: 'Systematic Airway Assessment Using LEMON Criteria',
      description: 'Perform comprehensive airway assessment using validated predictors',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'L - Look externally: assess facial features for difficult airway signs',
        'Check for small mouth, large tongue, short neck, receding jaw',
        'Assess facial trauma, burns, or swelling that may distort anatomy',
        'E - Evaluate 3-3-2 rule: 3 fingers mouth opening, 3 fingers hyoid-mental distance',
        'M - Mallampati score: visualize soft palate, fauces, uvula, pillars',
        'O - Obstruction: assess for upper airway obstruction or masses',
        'N - Neck mobility: evaluate cervical spine range of motion',
        'Document findings systematically for clinical decision-making'
      ],
      contraindications: [
        'Do not delay emergency intubation for extensive assessment',
        'Avoid aggressive airway assessment in unstable patients',
        'Do not manipulate cervical spine if injury suspected'
      ],
      safetyNotes: [
        'Quick assessment essential - do not delay emergency airway management',
        'Multiple predictors increase difficulty probability significantly',
        'Prepare backup airway devices based on assessment findings'
      ]
    },
    {
      id: 'pdi-step-2',
      stepNumber: 2,
      title: 'Physical Examination and Anatomical Assessment',
      description: 'Perform detailed physical examination of airway anatomy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Measure thyromental distance: >6.5 cm normal, <6 cm predicts difficulty',
        'Assess mouth opening: >4 cm good, <3 cm indicates difficulty',
        'Examine dentition: prominent upper teeth, loose teeth, or dental appliances',
        'Evaluate neck circumference: >40 cm associated with difficult visualization',
        'Check for beard, which may interfere with mask seal and visualization',
        'Assess for pregnancy, obesity, or other conditions affecting positioning',
        'Test jaw protrusion: inability to protrude lower jaw indicates difficulty',
        'Document weight and BMI as obesity increases difficulty significantly'
      ],
      equipmentNeeded: [
        'Measuring tape or ruler',
        'Penlight for oral cavity examination',
        'Assessment forms or checklist'
      ],
      safetyNotes: [
        'Multiple anatomical predictors compound intubation difficulty',
        'Obesity significantly increases both difficulty and desaturation risk',
        'Consider awake intubation techniques if multiple predictors present'
      ]
    },
    {
      id: 'pdi-step-3',
      stepNumber: 3,
      title: 'Historical and Clinical Context Assessment',
      description: 'Gather relevant history and assess clinical factors affecting intubation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Obtain history of previous difficult intubation or anesthesia complications',
        'Ask about sleep apnea, snoring, or upper airway problems',
        'Assess current medical conditions: rheumatoid arthritis, ankylosing spondylitis',
        'Review medications that may affect airway or hemodynamics',
        'Evaluate current clinical status: hypoxia, hemodynamic instability',
        'Consider time constraints and urgency of intubation need',
        'Assess patient cooperation level and ability to position',
        'Document relevant allergies and contraindications to medications'
      ],
      contraindications: [
        'Do not delay life-saving intubation for extensive history taking',
        'Avoid detailed questioning in emergency situations',
        'Prioritize immediate assessment over historical factors'
      ],
      safetyNotes: [
        'Previous difficult intubation is strongest predictor of future difficulty',
        'Medical conditions affecting connective tissue increase difficulty',
        'Clinical instability may mandate rapid sequence approach'
      ]
    },
    {
      id: 'pdi-step-4',
      stepNumber: 4,
      title: 'Risk Stratification and Backup Planning',
      description: 'Classify difficulty risk and prepare appropriate backup strategies',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Classify as low, moderate, or high probability of difficult intubation',
        'Low risk: 0-1 predictors, standard approach with backup plan',
        'Moderate risk: 2-3 predictors, enhanced preparation and additional providers',
        'High risk: 4+ predictors, consider alternative techniques or awake approach',
        'Prepare backup airway devices: supraglottic airways, bougie, video laryngoscope',
        'Have surgical airway equipment immediately available for high-risk cases',
        'Assign roles to team members and communicate plan clearly',
        'Consider patient positioning adjustments to optimize conditions'
      ],
      equipmentNeeded: [
        'Video laryngoscope if available',
        'Supraglottic airway devices',
        'Bougie or stylet',
        'Surgical airway kit',
        'Additional laryngoscope handles and blades'
      ],
      safetyNotes: [
        'Failed intubation leads to cannot intubate, cannot ventilate scenarios',
        'Backup plan must be immediately executable',
        'Team communication essential for coordinated response'
      ]
    },
    {
      id: 'pdi-step-5',
      stepNumber: 5,
      title: 'Equipment Preparation and Setup',
      description: 'Prepare appropriate equipment based on difficulty assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Select appropriate laryngoscope blade: Macintosh 3-4 or Miller 2-3',
        'Have multiple blade types available for difficult visualization',
        'Prepare endotracheal tubes: primary size and one size smaller',
        'Set up bougie or stylet for difficult cases',
        'Prepare video laryngoscope if available and indicated',
        'Check suction equipment and ensure high-flow capability',
        'Prepare backup supraglottic airways appropriate for patient size',
        'Have cricothyrotomy kit immediately available for high-risk cases'
      ],
      safetyNotes: [
        'Equipment failure during difficult intubation can be catastrophic',
        'Multiple backup options essential for patient safety',
        'Test all equipment before beginning procedure'
      ]
    },
    {
      id: 'pdi-step-6',
      stepNumber: 6,
      title: 'Patient Preparation and Positioning',
      description: 'Optimize patient positioning and preparation for intubation attempt',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Position patient in "sniffing" position: head elevated, neck extended',
        'Use shoulder roll or pillow to optimize head position',
        'Clear airway of secretions, blood, or vomit with suction',
        'Pre-oxygenate with 100% oxygen for maximum duration possible',
        'Consider applying cricoid pressure if indicated and trained assistant available',
        'Ensure adequate muscle relaxation if using paralytic agents',
        'Have assistant available for bimanual laryngoscopy if needed',
        'Prepare monitoring equipment: capnography, pulse oximetry'
      ],
      safetyNotes: [
        'Pre-oxygenation extends safe apnea time significantly',
        'Proper positioning critical for successful laryngoscopy',
        'Suction must be immediately available throughout procedure'
      ]
    },
    {
      id: 'pdi-step-7',
      stepNumber: 7,
      title: 'First Attempt Optimization',
      description: 'Execute first intubation attempt with optimal conditions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Ensure all conditions are optimized before first attempt',
        'Use systematic approach: BURP maneuver if poor view',
        'Limit first attempt to 30 seconds to prevent hypoxia',
        'If poor view: reposition patient, adjust blade placement',
        'Use bougie if grade 3 or 4 view obtained',
        'Maintain cricoid pressure if applied (controversial)',
        'If unsuccessful: ventilate patient before second attempt',
        'Document laryngoscopy grade and reasons for difficulty'
      ],
      contraindications: [
        'Do not persist with direct laryngoscopy if consistently poor view',
        'Avoid prolonged attempts causing hypoxia',
        'Do not continue without adequate oxygenation between attempts'
      ],
      safetyNotes: [
        'First attempt has highest success rate',
        'Multiple attempts increase complications exponentially',
        'Maintain oxygenation between attempts essential'
      ]
    },
    {
      id: 'pdi-step-8',
      stepNumber: 8,
      title: 'Alternative Approach and Emergency Management',
      description: 'Implement alternative techniques or emergency procedures if indicated',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'If second attempt fails: move to alternative technique immediately',
        'Consider video laryngoscopy for improved visualization',
        'Use supraglottic airway if ventilation becomes difficult',
        'Prepare for surgical airway if cannot intubate, cannot ventilate',
        'Call for additional help and expertise if available',
        'Document all attempts, techniques used, and complications',
        'Consider fibroptic intubation if equipment and expertise available',
        'Communicate clearly with team about changing approach'
      ],
      equipmentNeeded: [
        'Video laryngoscope',
        'Supraglottic airway device',
        'Surgical cricothyrotomy kit',
        'Fiberoptic bronchoscope if available'
      ],
      safetyNotes: [
        'Cannot intubate, cannot ventilate is life-threatening emergency',
        'Surgical airway may be required within minutes',
        'Team coordination essential during crisis management'
      ]
    }
  ],

  // 49. RECOVERY POSITION - Basic patient positioning for unconscious patients
  'recovery-position': [
    {
      id: 'rp-step-1',
      stepNumber: 1,
      title: 'Initial Assessment and Indication Determination',
      description: 'Assess patient and determine appropriateness of recovery position',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Confirm patient is unconscious but breathing spontaneously',
        'Check pulse and ensure hemodynamic stability',
        'Assess airway patency and spontaneous respiratory effort',
        'Rule out spinal injury based on mechanism and clinical findings',
        'Evaluate for contraindications: trauma, pregnancy, respiratory distress',
        'Consider alternative positioning if spinal precautions needed',
        'Determine if recovery position will improve airway management',
        'Assess environment for safe positioning space'
      ],
      contraindications: [
        'Suspected spinal injury or cervical spine trauma',
        'Respiratory arrest or inadequate breathing',
        'Hemodynamic instability or shock',
        'Pregnancy beyond 20 weeks gestation',
        'Vomiting with risk of aspiration requiring suction',
        'Need for immediate advanced airway management'
      ],
      safetyNotes: [
        'Recovery position only appropriate for stable unconscious patients',
        'Continuous monitoring essential throughout positioning',
        'Be prepared to reposition if condition deteriorates'
      ]
    },
    {
      id: 'rp-step-2',
      stepNumber: 2,
      title: 'Preparation and Equipment Setup',
      description: 'Prepare environment and gather necessary equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Clear adequate space around patient for positioning maneuver',
        'Remove any obstacles or hazards from area',
        'Gather pillows or soft padding for support if available',
        'Ensure suction equipment is immediately accessible',
        'Have monitoring equipment ready: pulse oximetry, blood pressure',
        'Position additional help if available for assistance',
        'Prepare blankets for patient warmth and dignity',
        'Ensure clear pathway for emergency access if needed'
      ],
      equipmentNeeded: [
        'Suction equipment',
        'Pulse oximetry monitor',
        'Pillows or padding for support',
        'Blankets for warmth',
        'Gloves and personal protective equipment'
      ],
      safetyNotes: [
        'Environment must be safe for both patient and provider',
        'Have emergency equipment immediately available',
        'Ensure adequate space for positioning maneuver'
      ]
    },
    {
      id: 'rp-step-3',
      stepNumber: 3,
      title: 'Initial Patient Positioning',
      description: 'Position patient supine and prepare for recovery position',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Ensure patient is lying flat on back on firm surface',
        'Straighten both legs and place arms at sides',
        'Tilt head back slightly and lift chin to open airway',
        'Check that airway remains clear before proceeding',
        'Position yourself beside patient at hip level',
        'Remove glasses, dentures, or loose objects from mouth',
        'Assess patient comfort and adjust as needed',
        'Ensure dignity maintained throughout procedure'
      ],
      safetyNotes: [
        'Maintain airway patency throughout initial positioning',
        'Handle patient gently to prevent injury',
        'Monitor breathing continuously during positioning'
      ]
    },
    {
      id: 'rp-step-4',
      stepNumber: 4,
      title: 'Arm and Hand Positioning',
      description: 'Position arms correctly for safe lateral positioning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Place arm nearest to you straight out at right angle to body',
        'Bend elbow and position hand palm-upward near head',
        'Bring far arm across chest and hold back of hand against near cheek',
        'Keep this hand in position against cheek throughout roll',
        'Ensure shoulder is not compressed or hyperextended',
        'Check that arms will not be trapped during turning',
        'Maintain gentle but secure grip on hand at cheek',
        'Prepare to guide arm movement during lateral roll'
      ],
      safetyNotes: [
        'Proper arm positioning prevents injury during roll',
        'Avoid hyperextension or compression of joints',
        'Maintain control of arm throughout maneuver'
      ]
    },
    {
      id: 'rp-step-5',
      stepNumber: 5,
      title: 'Leg Positioning and Body Preparation',
      description: 'Position legs appropriately for stable lateral position',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Bend far leg at knee, keeping foot flat on ground',
        'Use bent leg as leverage point for turning body',
        'Keep near leg straight to provide stability base',
        'Ensure legs are positioned to prevent rolling back',
        'Check that leg positioning allows controlled roll',
        'Avoid excessive bending that could compromise circulation',
        'Position legs to maintain dignity and comfort',
        'Prepare to support body weight during turning motion'
      ],
      safetyNotes: [
        'Proper leg positioning essential for stable final position',
        'Avoid positions that compromise circulation',
        'Leg positioning must support stable lateral posture'
      ]
    },
    {
      id: 'rp-step-6',
      stepNumber: 6,
      title: 'Lateral Rolling Maneuver',
      description: 'Execute controlled roll to lateral recovery position',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Hold hand against cheek while pulling on far leg above knee',
        'Roll patient toward you in one smooth, controlled motion',
        'Support head and neck during rolling to maintain alignment',
        'Use bent leg to control speed and stability of roll',
        'Ensure patient rolls onto side completely',
        'Check that airway remains open throughout rolling',
        'Monitor breathing continuously during position change',
        'Adjust position immediately if any compromise noted'
      ],
      contraindications: [
        'Stop immediately if breathing becomes compromised',
        'Do not continue if spinal injury suspected',
        'Avoid if patient becomes hemodynamically unstable'
      ],
      safetyNotes: [
        'Controlled rolling prevents injury and maintains airway',
        'Monitor patient continuously throughout maneuver',
        'Be prepared to reposition if complications arise'
      ]
    },
    {
      id: 'rp-step-7',
      stepNumber: 7,
      title: 'Final Position Adjustment and Stabilization',
      description: 'Adjust final position for optimal airway and stability',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Adjust head position to maintain open airway with slight extension',
        'Position upper arm to support upper body and prevent rolling back',
        'Ensure lower arm is not compressed or trapped under body',
        'Adjust upper leg position for stability and comfort',
        'Check that mouth is angled slightly downward for drainage',
        'Verify chest expansion is not restricted by positioning',
        'Place padding or pillow under head for comfort if needed',
        'Ensure stable position that prevents rolling in either direction'
      ],
      safetyNotes: [
        'Final position must maintain airway patency',
        'Position must be stable and comfortable for patient',
        'Avoid positions that restrict breathing or circulation'
      ]
    },
    {
      id: 'rp-step-8',
      stepNumber: 8,
      title: 'Monitoring and Ongoing Care',
      description: 'Provide continuous monitoring and supportive care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor respiratory rate, depth, and effort continuously',
        'Check pulse and blood pressure regularly',
        'Assess airway patency and clear secretions if needed',
        'Monitor level of consciousness for any changes',
        'Watch for signs of aspiration or airway compromise',
        'Maintain body temperature with blankets as needed',
        'Document positioning time and patient response',
        'Prepare for repositioning or advanced interventions if condition changes'
      ],
      equipmentNeeded: [
        'Continuous pulse oximetry monitoring',
        'Suction equipment for airway maintenance',
        'Blood pressure monitoring equipment',
        'Blankets for temperature regulation',
        'Documentation materials'
      ],
      safetyNotes: [
        'Recovery position requires continuous monitoring',
        'Be prepared to change position if condition deteriorates',
        'Have advanced airway equipment immediately available'
      ]
    }
  ],

  // 50. UPPER AIRWAY OBSTRUCTION WITH EQUIPMENT - Advanced choking management
  'upper-airway-obstruction-equipment': [
    {
      id: 'uao-step-1',
      stepNumber: 1,
      title: 'Rapid Assessment and Obstruction Recognition',
      description: 'Quickly identify and assess severity of upper airway obstruction',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Recognize universal choking sign: hands clutching throat',
        'Assess ability to speak: partial vs complete obstruction',
        'Evaluate breathing effort: stridor, retractions, cyanosis',
        'Check level of consciousness and patient cooperation',
        'Determine if patient can cough effectively',
        'Assess for foreign body visibility in oral cavity',
        'Look for signs of severe distress: panic, agitation',
        'Quickly identify if obstruction is partial or complete'
      ],
      contraindications: [
        'Do not perform interventions on conscious patients with effective cough',
        'Avoid blind finger sweeps in pediatric patients',
        'Do not use instruments without direct visualization'
      ],
      safetyNotes: [
        'Complete obstruction is life-threatening emergency',
        'Time is critical - seconds count in complete obstruction',
        'Partial obstruction may worsen with inappropriate interventions'
      ]
    },
    {
      id: 'uao-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Setup',
      description: 'Rapidly prepare appropriate equipment for obstruction management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Gather suction equipment: high-flow, large-bore catheters',
        'Prepare laryngoscope with appropriate blade size',
        'Ready Magill forceps for foreign body removal',
        'Set up bag-valve-mask device with oxygen',
        'Prepare endotracheal intubation equipment as backup',
        'Have surgical airway kit immediately available',
        'Ensure adequate lighting for visualization',
        'Position equipment for immediate access during procedure'
      ],
      equipmentNeeded: [
        'High-flow suction unit with large-bore catheters',
        'Laryngoscope with Macintosh and Miller blades',
        'Magill forceps (adult and pediatric sizes)',
        'Bag-valve-mask device with oxygen reservoir',
        'Endotracheal tubes (multiple sizes)',
        'Surgical cricothyrotomy kit',
        'Pulse oximetry and monitoring equipment'
      ],
      safetyNotes: [
        'Have all equipment immediately available before starting',
        'Backup plans essential due to high failure potential',
        'Surgical airway may be required within minutes'
      ]
    },
    {
      id: 'uao-step-3',
      stepNumber: 3,
      title: 'Direct Visualization and Assessment',
      description: 'Perform direct laryngoscopy to visualize obstruction',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient supine with head slightly extended',
        'Use laryngoscope to visualize vocal cords and obstruction',
        'Identify location and nature of foreign body',
        'Assess accessibility for removal with available instruments',
        'Evaluate for multiple foreign bodies or fragmentation',
        'Check for associated trauma or swelling',
        'Note position relative to vocal cords and epiglottis',
        'Determine best approach for safe removal'
      ],
      safetyNotes: [
        'Maintain oxygenation during visualization attempts',
        'Avoid pushing foreign body deeper into airway',
        'Be prepared for complete obstruction during manipulation'
      ]
    },
    {
      id: 'uao-step-4',
      stepNumber: 4,
      title: 'Suction-Assisted Foreign Body Removal',
      description: 'Use high-flow suction to remove liquid or small particulate obstructions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Use high-flow suction with largest catheter possible',
        'Suction under direct visualization only',
        'Work systematically from visible areas outward',
        'Use rigid-tip catheter for better control and visualization',
        'Apply suction while withdrawing catheter to avoid impaction',
        'Clear liquid materials, blood, or small particles first',
        'Maintain continuous visualization during suctioning',
        'Assess airway patency after each suction attempt'
      ],
      contraindications: [
        'Do not suction blindly without visualization',
        'Avoid excessive negative pressure that could worsen obstruction',
        'Do not suction solid objects that could fragment'
      ],
      safetyNotes: [
        'Suction effective for liquids and soft materials only',
        'Maintain direct visualization throughout procedure',
        'Be prepared for sudden airway opening with suction'
      ]
    },
    {
      id: 'uao-step-5',
      stepNumber: 5,
      title: 'Magill Forceps Foreign Body Extraction',
      description: 'Use Magill forceps to remove solid foreign bodies under direct vision',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Insert Magill forceps under direct laryngoscopic visualization',
        'Grasp foreign body firmly but gently to avoid fragmentation',
        'Remove object in straight line without rotation',
        'Avoid pushing object deeper or against vocal cords',
        'Work quickly but deliberately to minimize airway obstruction time',
        'If unsuccessful, reattempt with different approach angle',
        'Limit attempts to prevent airway trauma',
        'Be prepared to convert to surgical airway if unsuccessful'
      ],
      equipmentNeeded: [
        'Magill forceps (appropriate size)',
        'Laryngoscope for direct visualization',
        'Suction equipment for clearing field'
      ],
      safetyNotes: [
        'Only attempt under direct visualization',
        'Avoid excessive force that could fragment object',
        'Limit attempts to prevent airway trauma and swelling'
      ]
    },
    {
      id: 'uao-step-6',
      stepNumber: 6,
      title: 'Alternative Airway Management Techniques',
      description: 'Implement alternative techniques if direct removal unsuccessful',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Attempt bag-valve-mask ventilation to push object distally',
        'Try gentle positive pressure to dislodge partial obstruction',
        'Consider endotracheal intubation past obstruction if possible',
        'Use smaller endotracheal tube to bypass partial obstruction',
        'Attempt supraglottic airway placement as bridge',
        'Prepare for immediate surgical airway if ventilation fails',
        'Consider percutaneous needle cricothyrotomy as temporary measure',
        'Call for additional expertise and backup immediately'
      ],
      contraindications: [
        'Do not delay surgical airway if other methods fail',
        'Avoid excessive positive pressure with complete obstruction',
        'Do not attempt intubation if foreign body at vocal cord level'
      ],
      safetyNotes: [
        'Time-sensitive: surgical airway may be required within minutes',
        'Positive pressure techniques may worsen complete obstruction',
        'Have surgical equipment immediately ready'
      ]
    },
    {
      id: 'uao-step-7',
      stepNumber: 7,
      title: 'Post-Removal Airway Assessment and Management',
      description: 'Assess airway patency and provide ongoing management after removal',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess breathing effort and air movement immediately',
        'Listen for stridor or abnormal breath sounds',
        'Check for residual foreign body fragments',
        'Evaluate for airway trauma or swelling from procedure',
        'Provide supplemental oxygen and monitor oxygen saturation',
        'Consider endotracheal intubation if significant airway edema',
        'Monitor for delayed complications: swelling, bleeding',
        'Prepare for transport and provide comprehensive report'
      ],
      safetyNotes: [
        'Airway edema may develop after successful removal',
        'Monitor closely for delayed obstruction from swelling',
        'Have advanced airway equipment available for complications'
      ]
    },
    {
      id: 'uao-step-8',
      stepNumber: 8,
      title: 'Emergency Surgical Airway Management',
      description: 'Perform emergency cricothyrotomy if other methods fail',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Recognize indications: failed removal with cannot ventilate situation',
        'Palpate cricothyroid membrane between thyroid and cricoid cartilages',
        'Prepare skin with antiseptic if time permits',
        'Make vertical skin incision over cricothyroid membrane',
        'Locate membrane and make horizontal incision through membrane',
        'Insert tube or dilator to maintain airway',
        'Secure airway device and confirm placement',
        'Provide immediate ventilation and prepare for urgent transport'
      ],
      equipmentNeeded: [
        'Surgical cricothyrotomy kit',
        'Scalpel with #11 blade',
        'Tracheal hook or dilator',
        'Small cuffed tube (6.0-7.0mm)',
        'Antiseptic solution',
        'Sterile gloves and gauze'
      ],
      contraindications: [
        'Age less than 12 years (needle cricothyrotomy preferred)',
        'Massive neck trauma obscuring landmarks',
        'Suspected laryngeal fracture'
      ],
      safetyNotes: [
        'Last resort procedure when patient cannot be ventilated',
        'Time-critical: perform immediately if indicated',
        'Requires urgent surgical consultation after procedure'
      ]
    }
  ],

  // 51. IMMOBILIZATION OF AN INJURY - Trauma stabilization and injury management
  'immobilization-injury': [
    {
      id: 'ii-step-1',
      stepNumber: 1,
      title: 'Initial Assessment and Injury Evaluation',
      description: 'Assess injury severity and determine appropriate immobilization strategy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Perform systematic trauma assessment using ABCDE approach',
        'Identify all injuries requiring immobilization or stabilization',
        'Assess for neurovascular compromise: pulses, sensation, movement',
        'Evaluate mechanism of injury to predict associated injuries',
        'Check for open fractures, deformity, or angulation',
        'Assess pain level and patient comfort during assessment',
        'Document baseline neurological and vascular status',
        'Prioritize life-threatening injuries over isolated fractures'
      ],
      contraindications: [
        'Life-threatening conditions take priority over isolated fractures',
        'Do not delay critical interventions for fracture immobilization',
        'Avoid manipulation of suspected spinal injuries without proper technique'
      ],
      safetyNotes: [
        'Always assess distal neurovascular status before and after immobilization',
        'Pain management should be considered early in treatment',
        'Document baseline function to track changes during treatment'
      ]
    },
    {
      id: 'ii-step-2',
      stepNumber: 2,
      title: 'Equipment Selection and Preparation',
      description: 'Select appropriate immobilization equipment based on injury type',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Select splinting material appropriate for injury location and size',
        'Gather padding materials: gauze, towels, or foam padding',
        'Prepare securing materials: bandages, tape, or straps',
        'Have slings and swathes available for upper extremity injuries',
        'Prepare traction splints for femur fractures if indicated',
        'Gather ice packs for swelling control if available',
        'Ensure adequate pain medication is available',
        'Prepare materials for wound care if open fracture present'
      ],
      equipmentNeeded: [
        'Rigid splints (cardboard, aluminum, or commercial splints)',
        'Soft splinting materials (pillows, blankets)',
        'Padding materials (gauze, towels, foam)',
        'Securing materials (elastic bandages, medical tape)',
        'Slings and swathes for shoulder/arm injuries',
        'Traction splint for femur fractures',
        'Ice packs and cold therapy supplies',
        'Pain medication and administration supplies'
      ],
      safetyNotes: [
        'Choose splint length to immobilize joint above and below injury',
        'Ensure adequate padding to prevent pressure sores',
        'Have multiple splint options available for different injury types'
      ]
    },
    {
      id: 'ii-step-3',
      stepNumber: 3,
      title: 'Pain Management and Patient Preparation',
      description: 'Provide appropriate pain relief and prepare patient for immobilization',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess pain level using appropriate pain scale (0-10)',
        'Administer pain medication as indicated and available',
        'Provide emotional support and reassurance to patient',
        'Explain immobilization procedure to reduce anxiety',
        'Position patient comfortably before beginning immobilization',
        'Consider sedation for severely anxious or combative patients',
        'Apply ice to injury if no contraindications present',
        'Allow time for pain medication to take effect before manipulation'
      ],
      contraindications: [
        'Avoid pain medication in patients with altered mental status',
        'Do not delay critical care for pain management',
        'Avoid ice application if circulatory compromise present'
      ],
      safetyNotes: [
        'Adequate pain control improves patient cooperation',
        'Monitor respiratory status with opioid pain medications',
        'Ice should be applied with barrier to prevent frostbite'
      ]
    },
    {
      id: 'ii-step-4',
      stepNumber: 4,
      title: 'Injury Stabilization and Alignment',
      description: 'Stabilize injury in anatomical position with gentle traction if needed',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Apply gentle manual traction to realign severely angulated fractures',
        'Maintain traction throughout splinting process',
        'Do not attempt to reduce fractures unless severe angulation',
        'Stabilize fracture fragments to prevent further injury',
        'Position injured extremity in functional position when possible',
        'Maintain normal anatomical curves and joint positions',
        'Use assistant to help maintain position during splinting',
        'Monitor for changes in neurovascular status during manipulation'
      ],
      contraindications: [
        'Do not manipulate injuries with suspected neurovascular compromise',
        'Avoid reduction attempts for complex or unstable fractures',
        'Do not apply traction if resistance or crepitus increases'
      ],
      safetyNotes: [
        'Gentle traction may improve circulation and reduce pain',
        'Stop manipulation if neurovascular status worsens',
        'Maintain alignment throughout immobilization process'
      ]
    },
    {
      id: 'ii-step-5',
      stepNumber: 5,
      title: 'Splint Application and Padding',
      description: 'Apply appropriate splint with adequate padding for comfort',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Place adequate padding over bony prominences and pressure points',
        'Apply splint to immobilize joint above and below fracture site',
        'Ensure splint extends adequately beyond injury to provide support',
        'Use rigid splint for long bone fractures and deformed injuries',
        'Apply soft splinting for stable injuries or when rigid unavailable',
        'Mold splint to anatomical contours for better fit',
        'Avoid gaps between splint and extremity that allow movement',
        'Check that splint does not create pressure points or constriction'
      ],
      safetyNotes: [
        'Inadequate padding can cause pressure ulcers and nerve damage',
        'Splint should be snug but not tight enough to impair circulation',
        'Proper length essential for effective immobilization'
      ]
    },
    {
      id: 'ii-step-6',
      stepNumber: 6,
      title: 'Securing and Fastening Techniques',
      description: 'Secure splint properly while maintaining circulation and comfort',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Use elastic bandages or tape to secure splint to extremity',
        'Start wrapping distally and work proximally',
        'Apply even tension throughout wrapping process',
        'Avoid wrapping directly over fracture site if possible',
        'Secure splint at minimum of two points above and below injury',
        'Leave fingertips or toes exposed for circulation checks',
        'Ensure wrapping is snug but does not impair circulation',
        'Use figure-8 wrapping technique around joints for better stability'
      ],
      contraindications: [
        'Do not wrap too tightly - should be able to slip finger under bandage',
        'Avoid circumferential wrapping if significant swelling expected',
        'Do not cover fingers/toes completely - need for circulation checks'
      ],
      safetyNotes: [
        'Check circulation frequently after securing splint',
        'Adjust tension if signs of impaired circulation develop',
        'Document how splint is secured for continuity of care'
      ]
    },
    {
      id: 'ii-step-7',
      stepNumber: 7,
      title: 'Neurovascular Assessment and Documentation',
      description: 'Perform comprehensive post-immobilization assessment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Check distal pulses: radial, ulnar for arms; dorsalis pedis, posterior tibial for legs',
        'Assess capillary refill in fingernails or toenails (<2 seconds normal)',
        'Test sensation: light touch, two-point discrimination',
        'Evaluate motor function: finger/toe movement, grip strength',
        'Compare injured side to uninjured side for baseline',
        'Document all findings before and after immobilization',
        'Note color, temperature, and swelling of extremity',
        'Record pain level after immobilization completion'
      ],
      safetyNotes: [
        'Any decrease in neurovascular function requires immediate splint adjustment',
        'Document findings for medical-legal protection',
        'Repeat assessments regularly during transport'
      ]
    },
    {
      id: 'ii-step-8',
      stepNumber: 8,
      title: 'Transport Preparation and Ongoing Monitoring',
      description: 'Prepare for transport and provide continuous monitoring',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Position patient comfortably for transport with injured extremity elevated',
        'Apply additional support during patient movement and loading',
        'Recheck neurovascular status after any patient movement',
        'Monitor for increasing pain, swelling, or discoloration',
        'Adjust immobilization if circulation becomes compromised',
        'Provide ongoing pain management and emotional support',
        'Document any changes in condition during transport',
        'Prepare comprehensive report for receiving hospital staff'
      ],
      equipmentNeeded: [
        'Pillows or supports for elevation',
        'Additional padding for comfort',
        'Pain medication for ongoing management',
        'Monitoring equipment for vital signs'
      ],
      safetyNotes: [
        'Transport movement can shift splints and compromise circulation',
        'Regular reassessment essential for early complication detection',
        'Be prepared to modify immobilization if complications develop'
      ]
    }
  ],

  // 52. DISINFECTION OF MINOR WOUNDS - Evidence-based wound care and infection prevention
  'disinfection-minor-wounds': [
    {
      id: 'dmw-step-1',
      stepNumber: 1,
      title: 'Initial Wound Assessment and Classification',
      description: 'Assess wound characteristics and determine appropriate treatment approach',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess wound size, depth, and location systematically',
        'Classify wound type: abrasion, laceration, puncture, or avulsion',
        'Evaluate for foreign bodies or embedded debris',
        'Assess contamination level: clean, clean-contaminated, or dirty',
        'Check for signs of infection: redness, swelling, warmth, purulent drainage',
        'Evaluate surrounding tissue for viability and circulation',
        'Document wound characteristics including measurements',
        'Consider tetanus immunization status and wound mechanism'
      ],
      contraindications: [
        'Deep wounds requiring surgical closure',
        'Wounds with major vascular or nerve involvement',
        'Severely contaminated wounds requiring surgical debridement',
        'Infected wounds requiring antibiotic therapy'
      ],
      safetyNotes: [
        'Any wound showing signs of serious infection requires medical evaluation',
        'Deep puncture wounds may require exploration for foreign bodies',
        'Document baseline wound appearance for follow-up comparison'
      ]
    },
    {
      id: 'dmw-step-2',
      stepNumber: 2,
      title: 'Personal Protection and Infection Control',
      description: 'Establish proper infection control measures and personal protective equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Perform thorough hand hygiene with antimicrobial soap or alcohol-based sanitizer',
        'Don appropriate personal protective equipment: gloves, gown, eye protection',
        'Use sterile or clean technique appropriate for wound type',
        'Prepare sterile field with appropriate draping if indicated',
        'Ensure adequate lighting and workspace organization',
        'Have sharps disposal container immediately available',
        'Prepare irrigation solutions and cleansing agents',
        'Organize equipment to maintain sterile technique throughout procedure'
      ],
      equipmentNeeded: [
        'Sterile or non-sterile gloves (depending on wound type)',
        'Personal protective equipment (gown, eye protection)',
        'Sterile saline or clean water for irrigation',
        'Antiseptic solutions (povidone iodine, chlorhexidine)',
        'Sterile gauze pads and dressings',
        'Irrigation syringe or pressurized saline',
        'Sharps disposal container'
      ],
      safetyNotes: [
        'Universal precautions apply to all wound care procedures',
        'Change gloves if contaminated during procedure',
        'Maintain sterile technique for deep or high-risk wounds'
      ]
    },
    {
      id: 'dmw-step-3',
      stepNumber: 3,
      title: 'Pain Management and Patient Preparation',
      description: 'Provide appropriate analgesia and prepare patient for wound care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess pain level using appropriate pain scale (0-10)',
        'Explain wound care procedure to patient to reduce anxiety',
        'Administer topical anesthetic if available and appropriate',
        'Consider systemic pain medication for extensive or painful wounds',
        'Position patient comfortably with wound accessible',
        'Provide emotional support and reassurance throughout procedure',
        'Allow adequate time for topical anesthetic to take effect',
        'Have patient report any increase in pain during cleaning'
      ],
      contraindications: [
        'Avoid topical anesthetics if patient has known allergies',
        'Do not delay critical care for minor wound pain management',
        'Avoid excessive pain medication in altered mental status patients'
      ],
      safetyNotes: [
        'Some disinfectants may cause stinging or burning sensation',
        'Adequate pain control improves patient cooperation',
        'Monitor for allergic reactions to topical medications'
      ]
    },
    {
      id: 'dmw-step-4',
      stepNumber: 4,
      title: 'Mechanical Cleansing and Debris Removal',
      description: 'Remove gross contamination and debris through mechanical cleansing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Begin with gentle irrigation using sterile saline or clean water',
        'Use low-pressure irrigation for delicate tissues (1-4 psi)',
        'Use moderate pressure irrigation for contaminated wounds (4-15 psi)',
        'Remove visible foreign bodies with sterile forceps or irrigation',
        'Clean from center of wound outward in circular motion',
        'Use gentle mechanical scrubbing for embedded particles',
        'Irrigate thoroughly to remove all loose debris and contaminants',
        'Inspect wound carefully after initial cleaning for remaining debris'
      ],
      equipmentNeeded: [
        'Sterile saline solution or clean water',
        '35-60 mL irrigation syringe',
        '18-19 gauge needle or catheter tip for pressure',
        'Sterile forceps for debris removal',
        'Sterile gauze for gentle scrubbing',
        'Basin for collecting irrigation fluid'
      ],
      safetyNotes: [
        'Excessive irrigation pressure can drive bacteria deeper into tissue',
        'Remove all visible foreign material to prevent infection',
        'Gentle technique prevents additional tissue damage'
      ]
    },
    {
      id: 'dmw-step-5',
      stepNumber: 5,
      title: 'Antiseptic Application and Disinfection',
      description: 'Apply appropriate antiseptic agents for wound disinfection',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Select appropriate antiseptic based on wound type and contamination level',
        'Povidone iodine 10%: broad spectrum, good for contaminated wounds',
        'Chlorhexidine 2-4%: excellent for gram-positive bacteria, longer lasting',
        'Hydrogen peroxide 3%: good for initial cleaning but limit use',
        'Apply antiseptic from center of wound outward using sterile technique',
        'Allow adequate contact time for antiseptic effectiveness (30-60 seconds)',
        'Do not use alcohol directly on open wounds (causes tissue damage)',
        'Rinse antiseptic if cytotoxic effects are concern'
      ],
      contraindications: [
        'Avoid iodine products in patients with iodine allergy',
        'Do not use hydrogen peroxide repeatedly (tissue damage)',
        'Avoid cytotoxic antiseptics in clean surgical wounds'
      ],
      safetyNotes: [
        'Some antiseptics can delay wound healing if overused',
        'Test for allergic reactions in sensitive patients',
        'Balance infection control with tissue preservation'
      ]
    },
    {
      id: 'dmw-step-6',
      stepNumber: 6,
      title: 'Wound Inspection and Final Assessment',
      description: 'Perform thorough inspection of cleaned wound and assess for complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Inspect wound edges for viable tissue and proper approximation',
        'Check for complete removal of foreign bodies and debris',
        'Assess wound depth and involvement of underlying structures',
        'Evaluate for active bleeding and achieve hemostasis if needed',
        'Look for signs of tissue necrosis or devitalization',
        'Determine if wound requires closure or can heal by secondary intention',
        'Document final wound appearance and any complications',
        'Assess need for referral to higher level of care'
      ],
      safetyNotes: [
        'Deep wounds may require surgical exploration',
        'Persistent bleeding may indicate vascular injury',
        'Document wound characteristics for medicolegal purposes'
      ]
    },
    {
      id: 'dmw-step-7',
      stepNumber: 7,
      title: 'Dressing Application and Protection',
      description: 'Apply appropriate dressing to protect wound and promote healing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Select dressing appropriate for wound type and drainage amount',
        'Apply sterile non-adherent pad directly over wound',
        'Use absorbent secondary dressing for wounds with drainage',
        'Secure dressing with tape or bandage without constricting circulation',
        'Ensure dressing covers wound completely with adequate margin',
        'Apply dressing snugly but not tight enough to impair healing',
        'Leave fingers/toes exposed if extremity wounded for circulation checks',
        'Document dressing type and application technique'
      ],
      equipmentNeeded: [
        'Sterile non-adherent pads',
        'Absorbent gauze dressings',
        'Medical tape or bandages',
        'Elastic wrap if compression needed',
        'Waterproof dressing if appropriate'
      ],
      safetyNotes: [
        'Dressing should protect wound while allowing healing',
        'Too tight dressing can impair circulation and healing',
        'Change dressing if it becomes saturated or contaminated'
      ]
    },
    {
      id: 'dmw-step-8',
      stepNumber: 8,
      title: 'Patient Education and Follow-up Instructions',
      description: 'Provide comprehensive wound care instructions and follow-up guidance',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Instruct patient on proper wound care and dressing changes',
        'Provide signs and symptoms of infection to watch for',
        'Explain when to change dressing and how to keep wound clean',
        'Discuss activity restrictions and wound protection measures',
        'Address tetanus immunization needs and schedule if required',
        'Provide written instructions for wound care at home',
        'Schedule follow-up appointment or instruct when to seek medical care',
        'Document all patient education provided and understanding demonstrated'
      ],
      safetyNotes: [
        'Patient education critical for preventing wound complications',
        'Ensure patient understands infection warning signs',
        'Clear follow-up instructions prevent delayed complications'
      ]
    }
  ],

  // 53. HAND WASHING - Foundation of infection control and patient safety
  'hand-washing': [
    {
      id: 'hw-step-1',
      stepNumber: 1,
      title: 'Initial Preparation and Assessment',
      description: 'Prepare for effective hand hygiene and assess contamination level',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Remove all jewelry including rings, watches, and bracelets',
        'Roll sleeves up above wrists to prevent contamination',
        'Assess hands for cuts, abrasions, or open wounds',
        'Check fingernails: short, clean, no artificial nails or polish',
        'Determine level of contamination to guide washing duration',
        'Ensure adequate soap and paper towel supplies are available',
        'Position at sink to avoid touching surfaces with hands',
        'Cover any open wounds with waterproof dressing before washing'
      ],
      contraindications: [
        'Open wounds on hands without waterproof covering',
        'Severe dermatitis or allergic reaction to available soap',
        'Emergency situation requiring immediate patient intervention'
      ],
      safetyNotes: [
        'Jewelry harbors bacteria and prevents effective cleaning',
        'Long or artificial nails increase bacterial load significantly',
        'Open wounds on hands increase infection risk for provider and patient'
      ]
    },
    {
      id: 'hw-step-2',
      stepNumber: 2,
      title: 'Water Temperature and Initial Rinse',
      description: 'Use appropriate water temperature and perform initial rinse',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Turn on water using foot pedals, knee controls, or elbow if available',
        'Adjust to warm (not hot) water temperature to avoid skin damage',
        'Wet hands and wrists thoroughly from fingertips to wrists',
        'Keep hands lower than elbows throughout washing process',
        'Allow water to flow from least contaminated (wrists) to most contaminated (fingertips)',
        'Avoid touching sink or faucet surfaces with clean hands',
        'Use continuous water flow during entire washing process'
      ],
      equipmentNeeded: [
        'Sink with running water',
        'Antimicrobial or regular soap',
        'Paper towels',
        'Hands-free controls preferred'
      ],
      safetyNotes: [
        'Hot water can damage skin and reduce cleaning effectiveness',
        'Proper water flow direction prevents recontamination',
        'Keep hands lower than elbows to prevent contaminated water from flowing back'
      ]
    },
    {
      id: 'hw-step-3',
      stepNumber: 3,
      title: 'Soap Application and Lathering',
      description: 'Apply appropriate soap and create effective lather',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Apply 3-5 mL of liquid antimicrobial soap to hands',
        'Use liquid soap dispensers to avoid cross-contamination',
        'Avoid using bar soap which can harbor bacteria',
        'Work soap into rich lather covering all hand surfaces',
        'Ensure soap covers fingertips, thumbs, and wrist areas',
        'Begin mechanical action immediately to maximize effectiveness',
        'Use antimicrobial soap for healthcare settings when available',
        'Regular soap acceptable when antimicrobial not available'
      ],
      safetyNotes: [
        'Sufficient soap volume essential for effective cleaning',
        'Liquid dispensers reduce cross-contamination risk',
        'Antimicrobial agents provide additional protection against pathogens'
      ]
    },
    {
      id: 'hw-step-4',
      stepNumber: 4,
      title: 'Systematic Hand Scrubbing Technique',
      description: 'Perform thorough mechanical cleaning using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 20,
      keyPoints: [
        'Rub palm to palm with fingers interlaced',
        'Scrub back of each hand with opposite palm and interlaced fingers',
        'Clean between fingers by rubbing fingers to fingers with interlaced digits',
        'Clean thumbs by clasping with opposite hand and rotating',
        'Scrub fingertips by rubbing in opposite palm in circular motion',
        'Clean under fingernails with fingertips of opposite hand',
        'Scrub wrists with circular motions using opposite hand',
        'Continue scrubbing for minimum 15 seconds (20 seconds if contaminated)'
      ],
      safetyNotes: [
        'Systematic approach ensures all surfaces are cleaned',
        'Mechanical action more important than soap type',
        'Adequate duration essential for microbial removal'
      ]
    },
    {
      id: 'hw-step-5',
      stepNumber: 5,
      title: 'Thorough Rinsing Process',
      description: 'Rinse hands completely to remove soap and loosened contaminants',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Rinse hands thoroughly under running water',
        'Keep hands pointed downward during rinsing',
        'Ensure all soap is completely removed from all surfaces',
        'Rinse from wrists toward fingertips to prevent recontamination',
        'Continue rinsing until water runs clear without soap residue',
        'Avoid touching sink or faucet during rinsing process',
        'Ensure adequate rinse time to remove all loosened microorganisms'
      ],
      safetyNotes: [
        'Incomplete rinsing can leave soap residue and bacteria',
        'Proper hand position prevents recontamination',
        'Thorough rinsing essential for removing loosened pathogens'
      ]
    },
    {
      id: 'hw-step-6',
      stepNumber: 6,
      title: 'Proper Drying Technique',
      description: 'Dry hands using method that prevents recontamination',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Use clean paper towels to dry hands thoroughly',
        'Pat hands dry rather than rubbing to prevent skin damage',
        'Dry from wrists toward fingertips following same direction as rinsing',
        'Use separate clean towel for each hand if heavily contaminated',
        'Ensure hands are completely dry, especially between fingers',
        'Avoid shaking hands to air dry (increases bacterial spread)',
        'Do not use shared cloth towels which can spread contamination'
      ],
      equipmentNeeded: [
        'Clean paper towels',
        'Hands-free towel dispenser preferred'
      ],
      safetyNotes: [
        'Wet hands transfer bacteria more readily than dry hands',
        'Paper towels prevent cross-contamination better than cloth',
        'Complete drying essential for preventing bacterial growth'
      ]
    },
    {
      id: 'hw-step-7',
      stepNumber: 7,
      title: 'Faucet and Environmental Decontamination',
      description: 'Turn off water and manage environment without recontamination',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Use clean paper towel to turn off manual faucet handles',
        'Avoid touching faucet or sink with clean hands',
        'Use same paper towel to open door if no automatic opener',
        'Dispose of paper towels in appropriate waste container',
        'Use foot pedal or automatic dispensers when available',
        'Avoid touching any surfaces after hand washing until necessary',
        'Maintain clean hands until next patient contact or contamination'
      ],
      safetyNotes: [
        'Faucet handles are heavily contaminated surfaces',
        'Clean paper towel prevents recontamination',
        'Proper disposal prevents environmental contamination'
      ]
    },
    {
      id: 'hw-step-8',
      stepNumber: 8,
      title: 'Hand Care and Skin Protection',
      description: 'Maintain skin integrity and plan for continued hand hygiene',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Apply hand moisturizer to prevent dryness and cracking',
        'Use alcohol-based hand sanitizer between washings when appropriate',
        'Inspect hands for signs of dermatitis or skin breakdown',
        'Avoid excessive washing that can damage skin barrier',
        'Report skin problems that might compromise hand hygiene',
        'Plan timing of hand washing to maximize effectiveness',
        'Consider glove use for extended patient contact',
        'Maintain short, clean fingernails at all times'
      ],
      equipmentNeeded: [
        'Hand moisturizer or skin protectant',
        'Alcohol-based hand sanitizer for interim cleaning'
      ],
      safetyNotes: [
        'Damaged skin harbors more bacteria and is harder to clean',
        'Regular moisturizing prevents skin breakdown',
        'Balance effective cleaning with skin protection'
      ]
    }
  ],

  // 54. OROGASTRIC AND NASOGASTRIC TUBE INSERTION - Gastric decompression and access
  'orogastric-nasogastric-insertion': [
    {
      id: 'ont-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Route Selection',
      description: 'Assess patient condition and determine appropriate insertion route',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assess level of consciousness and gag reflex presence',
        'Evaluate for contraindications: base of skull fracture, severe facial trauma',
        'Check nasal passages for obstruction, bleeding, or previous surgery',
        'Determine indication: gastric decompression, medication administration, lavage',
        'Select nasogastric route for conscious patients with intact reflexes',
        'Choose orogastric route for unconscious patients or nasal contraindications',
        'Consider patient comfort and cooperation level',
        'Document rationale for route selection'
      ],
      contraindications: [
        'Suspected base of skull fracture (contraindication for nasal route)',
        'Severe maxillofacial trauma',
        'Esophageal varices with active bleeding',
        'Recent nasal or esophageal surgery',
        'Severe coagulopathy with active bleeding',
        'Complete nasal obstruction'
      ],
      safetyNotes: [
        'Orogastric route safer in unconscious patients',
        'Nasal route contraindicated if cerebrospinal fluid leak suspected',
        'Consider airway protection needs before insertion'
      ]
    },
    {
      id: 'ont-step-2',
      stepNumber: 2,
      title: 'Equipment Preparation and Patient Positioning',
      description: 'Prepare appropriate equipment and position patient optimally',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Select appropriate tube size: 14-16Fr for decompression, 18Fr for lavage',
        'Prepare water-soluble lubricant (never petroleum-based)',
        'Ready 60ml catheter-tip syringe for placement verification',
        'Prepare pH testing strips and stethoscope for confirmation',
        'Set up suction equipment and drainage collection system',
        'Position patient sitting upright or in high semi-Fowler\'s position',
        'Tilt head slightly forward for conscious patients',
        'Have emesis basin and tissues readily available'
      ],
      equipmentNeeded: [
        'Nasogastric or orogastric tubes (various sizes)',
        'Water-soluble lubricant',
        '60ml catheter-tip syringe',
        'pH testing strips',
        'Stethoscope for placement verification',
        'Suction equipment and tubing',
        'Drainage bag or collection system',
        'Tape for securing tube'
      ],
      safetyNotes: [
        'Proper positioning reduces aspiration risk',
        'Have suction immediately available throughout procedure',
        'Water-soluble lubricant essential - petroleum products can cause pneumonia'
      ]
    },
    {
      id: 'ont-step-3',
      stepNumber: 3,
      title: 'Tube Measurement and Marking',
      description: 'Measure correct insertion depth using anatomical landmarks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Use NEX method: measure from Nose (or mouth) to Earlobe to Xiphoid process',
        'Add 10-15 cm to NEX measurement for gastric placement',
        'Mark measurement point on tube with tape or pen',
        'Double-check measurement for accuracy',
        'Document intended insertion depth',
        'Consider patient size and anatomy variations',
        'Prepare alternative measurement if initial attempt fails'
      ],
      safetyNotes: [
        'Accurate measurement prevents duodenal placement',
        'Under-measurement may result in esophageal placement',
        'Over-insertion can cause gastric perforation in rare cases'
      ]
    },
    {
      id: 'ont-step-4',
      stepNumber: 4,
      title: 'Initial Tube Insertion',
      description: 'Insert tube through selected route using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Apply generous amount of water-soluble lubricant to tube tip',
        'For nasal route: insert tube along nasal floor, not upward',
        'For oral route: insert over tongue toward back of throat',
        'Advance tube slowly and steadily with gentle pressure',
        'Ask conscious patient to swallow or sip water when tube reaches throat',
        'Stop immediately if patient shows signs of respiratory distress',
        'Never force tube if significant resistance encountered',
        'Monitor patient continuously for coughing, choking, or cyanosis'
      ],
      contraindications: [
        'Do not continue if patient develops respiratory distress',
        'Stop if blood appears or significant resistance met',
        'Avoid forcing tube if patient cannot swallow'
      ],
      safetyNotes: [
        'Patient swallowing helps guide tube into esophagus',
        'Respiratory distress may indicate tracheal placement',
        'Never force insertion - risk of perforation'
      ]
    },
    {
      id: 'ont-step-5',
      stepNumber: 5,
      title: 'Placement Verification',
      description: 'Confirm correct gastric placement using multiple methods',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Aspirate gastric contents with 60ml syringe',
        'Test aspirated fluid pH: gastric contents typically pH <5',
        'Auscultate over epigastrium while injecting 30-50ml air',
        'Listen for characteristic whooshing sound over stomach',
        'Check for absence of breath sounds over lungs during air injection',
        'Observe for return of gastric contents upon aspiration',
        'Use multiple confirmation methods - no single method is 100% reliable',
        'If placement uncertain, obtain X-ray confirmation'
      ],
      safetyNotes: [
        'Multiple verification methods essential for safety',
        'Respiratory placement can be life-threatening',
        'When in doubt, remove tube and reattempt'
      ]
    },
    {
      id: 'ont-step-6',
      stepNumber: 6,
      title: 'Tube Securing and Connection',
      description: 'Secure tube properly and connect to drainage system',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Secure tube to nose or mouth with appropriate tape',
        'Use skin-friendly tape to prevent irritation',
        'Create strain relief loop to prevent accidental dislodgement',
        'Mark tube length at nostril/mouth for monitoring displacement',
        'Connect tube to low intermittent suction or gravity drainage',
        'Set suction to 80-120 mmHg for gastric decompression',
        'Ensure all connections are secure and patent',
        'Position drainage bag below level of patient\'s stomach'
      ],
      equipmentNeeded: [
        'Medical tape (skin-friendly)',
        'Suction equipment with pressure regulation',
        'Drainage collection bag',
        'Connecting tubing'
      ],
      safetyNotes: [
        'Proper securing prevents accidental removal',
        'Excessive suction pressure can damage gastric mucosa',
        'Gravity drainage prevents reflux into stomach'
      ]
    },
    {
      id: 'ont-step-7',
      stepNumber: 7,
      title: 'Initial Function Testing',
      description: 'Test tube function and ensure proper drainage',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Observe for return of gastric contents through tube',
        'Note color, consistency, and volume of drainage',
        'Test tube patency by gentle aspiration with syringe',
        'Irrigate with 30ml normal saline if needed for patency',
        'Document initial drainage characteristics',
        'Monitor for complications: bleeding, perforation signs',
        'Ensure patient comfort and proper tube positioning',
        'Check that tube is not kinked or obstructed'
      ],
      contraindications: [
        'Do not irrigate if blood in drainage or signs of perforation',
        'Avoid excessive irrigation volume',
        'Stop procedure if patient develops severe pain'
      ],
      safetyNotes: [
        'Initial drainage should be monitored for abnormalities',
        'Large volume bloody drainage may indicate trauma',
        'Patient discomfort should decrease after proper placement'
      ]
    },
    {
      id: 'ont-step-8',
      stepNumber: 8,
      title: 'Patient Monitoring and Documentation',
      description: 'Provide ongoing monitoring and comprehensive documentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Monitor patient for signs of complications: bleeding, perforation, aspiration',
        'Check tube position regularly for displacement',
        'Document insertion time, route, size, and verification methods',
        'Record initial drainage volume and characteristics',
        'Monitor vital signs and patient comfort level',
        'Provide mouth care and nasal hygiene as appropriate',
        'Educate patient about tube care and movement restrictions',
        'Plan for ongoing monitoring and tube management during transport'
      ],
      safetyNotes: [
        'Tube displacement can occur with patient movement',
        'Regular monitoring essential for early complication detection',
        'Patient education improves cooperation and reduces displacement risk'
      ]
    }
  ],

  // 55. BAG VALVE MASK RESERVOIR VENTILATION - Advanced ventilation with oxygen reservoir
  'bag-valve-mask-reservoir': [
    {
      id: 'bvmr-step-1',
      stepNumber: 1,
      title: 'Equipment Assembly and Oxygen Setup',
      description: 'Assemble BVM system with reservoir bag and establish oxygen supply',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Select appropriate BVM size: adult (1600ml), child (700ml), infant (280ml)',
        'Attach reservoir bag to BVM ensuring secure connection',
        'Connect oxygen tubing to BVM oxygen port',
        'Set oxygen flow rate to 10-15 L/min to fully inflate reservoir',
        'Check that reservoir bag inflates completely with oxygen flow',
        'Verify all connections are secure and airtight',
        'Test bag function by squeezing - should reinflate quickly',
        'Ensure backup BVM available in case of equipment failure'
      ],
      equipmentNeeded: [
        'Bag-valve-mask device (appropriate size)',
        'Oxygen reservoir bag',
        'Oxygen source with flow meter',
        'Oxygen tubing',
        'Face masks (multiple sizes)',
        'Pressure manometer if available'
      ],
      safetyNotes: [
        'Reservoir bag essential for delivering high FiO2 concentrations',
        'Inadequate oxygen flow prevents reservoir inflation',
        'Test all equipment before patient use'
      ]
    },
    {
      id: 'bvmr-step-2',
      stepNumber: 2,
      title: 'Patient Assessment and Mask Selection',
      description: 'Assess patient ventilation needs and select appropriate mask',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess patient breathing: rate, depth, effort, and adequacy',
        'Check for respiratory distress signs: cyanosis, retractions, accessory muscle use',
        'Evaluate airway patency and need for airway adjuncts',
        'Select mask size: should cover from bridge of nose to cleft of chin',
        'Check for facial trauma or anatomy that may prevent good seal',
        'Consider beard or facial hair that may compromise mask seal',
        'Assess patient consciousness level and cooperation',
        'Determine if one-person or two-person technique needed'
      ],
      contraindications: [
        'Complete airway obstruction requiring immediate surgical airway',
        'Massive facial trauma preventing effective seal',
        'Active vomiting without suction capability',
        'Patient able to maintain adequate ventilation independently'
      ],
      safetyNotes: [
        'Proper mask size essential for effective seal',
        'Two-person technique preferred for optimal ventilation',
        'Have suction immediately available for airway management'
      ]
    },
    {
      id: 'bvmr-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Airway Opening',
      description: 'Position patient optimally and establish open airway',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient supine with head in neutral or slightly extended position',
        'Use head-tilt, chin-lift maneuver for non-trauma patients',
        'Apply jaw-thrust technique if cervical spine injury suspected',
        'Insert oropharyngeal or nasopharyngeal airway if indicated',
        'Clear visible secretions or foreign material from airway',
        'Position provider at head of patient for optimal mask seal',
        'Ensure adequate lighting and workspace around patient',
        'Have assistant positioned for two-person technique if available'
      ],
      safetyNotes: [
        'Proper airway positioning essential for effective ventilation',
        'Airway adjuncts improve ventilation effectiveness',
        'Clear airway of obstructions before beginning ventilation'
      ]
    },
    {
      id: 'bvmr-step-4',
      stepNumber: 4,
      title: 'Mask Seal Technique and Hand Positioning',
      description: 'Establish effective mask seal using proper hand technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Use C-E grip: thumb and index finger form "C" around mask',
        'Remaining three fingers form "E" under jaw to lift mandible',
        'Apply gentle downward pressure on mask while lifting jaw',
        'Maintain mask seal around entire perimeter',
        'Use both hands for mask seal if two-person technique available',
        'Avoid excessive pressure that could obstruct venous return',
        'Check for air leaks by listening for escaping air',
        'Adjust mask position and grip to achieve optimal seal'
      ],
      safetyNotes: [
        'Effective mask seal essential for adequate ventilation',
        'Two-person technique provides better seal and ventilation',
        'Excessive facial pressure can cause tissue damage'
      ]
    },
    {
      id: 'bvmr-step-5',
      stepNumber: 5,
      title: 'Controlled Ventilation Delivery',
      description: 'Deliver appropriate tidal volumes with proper timing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Squeeze bag smoothly over 1 second for breath delivery',
        'Deliver tidal volume of 6-7 mL/kg (approximately 500-600ml for adults)',
        'Watch for chest rise with each ventilation - indicates adequate volume',
        'Allow complete passive exhalation between breaths',
        'Ventilate at appropriate rate: 10-12/min adults, 12-20/min children',
        'Use only force needed to achieve visible chest rise',
        'Monitor reservoir bag - should deflate partially with each breath',
        'Coordinate ventilation with chest compressions if CPR in progress'
      ],
      contraindications: [
        'Do not over-ventilate - can cause gastric insufflation',
        'Avoid excessive rate that prevents complete exhalation',
        'Do not use excessive pressure causing barotrauma'
      ],
      safetyNotes: [
        'Visible chest rise indicates adequate tidal volume',
        'Excessive ventilation can impede venous return',
        'Reservoir bag deflation confirms oxygen delivery'
      ]
    },
    {
      id: 'bvmr-step-6',
      stepNumber: 6,
      title: 'Monitoring and Assessment',
      description: 'Continuously monitor ventilation effectiveness and patient response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Observe chest rise and fall with each ventilation cycle',
        'Monitor skin color for improvement in cyanosis',
        'Check pulse oximetry if available for oxygen saturation trending',
        'Listen for bilateral breath sounds during ventilation',
        'Assess for gastric insufflation - epigastric distension',
        'Monitor for signs of pneumothorax: decreased breath sounds, difficulty ventilating',
        'Check mask seal regularly and reposition as needed',
        'Assess patient responsiveness and spontaneous breathing return'
      ],
      safetyNotes: [
        'Continuous monitoring essential for detecting complications',
        'Gastric insufflation increases aspiration risk',
        'Pneumothorax can develop from excessive ventilation pressure'
      ]
    },
    {
      id: 'bvmr-step-7',
      stepNumber: 7,
      title: 'Complication Recognition and Management',
      description: 'Recognize and manage ventilation complications promptly',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Identify inadequate chest rise: check mask seal, airway position',
        'Manage gastric insufflation: decompress stomach if needed',
        'Recognize pneumothorax: decreased breath sounds, increased resistance',
        'Handle mask seal problems: reposition, two-person technique',
        'Address airway obstruction: suction, repositioning, airway adjuncts',
        'Manage equipment failure: switch to backup BVM immediately',
        'Deal with patient agitation: consider sedation if appropriate',
        'Transition to advanced airway if BVM ineffective'
      ],
      equipmentNeeded: [
        'Suction equipment for airway clearance',
        'Backup BVM device',
        'Advanced airway equipment',
        'Needle decompression kit for pneumothorax'
      ],
      safetyNotes: [
        'Early recognition of complications prevents deterioration',
        'Have backup plan ready for BVM failure',
        'Some complications require immediate advanced intervention'
      ]
    },
    {
      id: 'bvmr-step-8',
      stepNumber: 8,
      title: 'Transition Planning and Documentation',
      description: 'Plan for ongoing ventilation needs and document care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess need for advanced airway management',
        'Plan for transport ventilation and equipment needs',
        'Consider mechanical ventilator if available for long transport',
        'Document ventilation effectiveness and patient response',
        'Record complications encountered and interventions provided',
        'Note oxygen concentrations delivered and saturation response',
        'Prepare comprehensive report for receiving facility',
        'Ensure adequate oxygen supply for continued transport needs'
      ],
      safetyNotes: [
        'Long-term BVM ventilation is physically demanding',
        'Advanced airway may be needed for extended transport',
        'Adequate documentation supports continuity of care'
      ]
    }
  ],

  // 56. PATIENT HANDOVER - Professional communication and continuity of care
  'patient-handover': [
    {
      id: 'ph-step-1',
      stepNumber: 1,
      title: 'Pre-Handover Preparation and Organization',
      description: 'Organize information and prepare for effective communication',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Gather all patient documentation: assessment forms, medication records',
        'Review patient timeline and sequence of events chronologically',
        'Organize vital signs trends and response to treatments',
        'Prepare medication list including doses, routes, and times given',
        'Review diagnostic results: ECGs, glucose readings, pulse oximetry',
        'Identify key family/contact information and next of kin',
        'Note any patient belongings, valuables, or personal effects',
        'Prepare concise summary focusing on most critical information'
      ],
      equipmentNeeded: [
        'Patient care records and documentation',
        'Medication administration records',
        'Diagnostic results and rhythm strips',
        'Patient identification and insurance information'
      ],
      safetyNotes: [
        'Complete documentation essential for continuity of care',
        'Organized information prevents critical details from being missed',
        'Patient safety depends on accurate information transfer'
      ]
    },
    {
      id: 'ph-step-2',
      stepNumber: 2,
      title: 'SBAR Communication Structure Setup',
      description: 'Structure handover using Situation, Background, Assessment, Recommendation format',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Situation: patient demographics, chief complaint, current condition',
        'Background: relevant medical history, medications, allergies',
        'Assessment: current vital signs, physical findings, interventions',
        'Recommendation: suggested treatments, concerns, follow-up needs',
        'Practice clear, concise delivery of each SBAR component',
        'Prioritize information by clinical significance',
        'Prepare for questions about assessment findings and treatments',
        'Have specific times and dosages ready for all interventions'
      ],
      safetyNotes: [
        'SBAR format ensures systematic information transfer',
        'Structured approach reduces risk of omitting critical information',
        'Clear communication prevents medical errors'
      ]
    },
    {
      id: 'ph-step-3',
      stepNumber: 3,
      title: 'Patient Introduction and Identity Verification',
      description: 'Formally introduce patient and verify identity with receiving team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'State patient name, age, and date of birth clearly',
        'Confirm patient identity with receiving nurse/physician',
        'Provide brief overview of why patient is being transferred',
        'Mention any special precautions: isolation, fall risk, allergies',
        'Identify yourself and your service/agency',
        'State transport origin and approximate transport time',
        'Note any family members or contacts present',
        'Ensure receiving team is ready to accept report'
      ],
      safetyNotes: [
        'Proper patient identification prevents mix-ups',
        'Clear identification of transport team ensures accountability',
        'Receiving team must be ready to receive full report'
      ]
    },
    {
      id: 'ph-step-4',
      stepNumber: 4,
      title: 'Clinical History and Assessment Presentation',
      description: 'Present comprehensive clinical information systematically',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'State chief complaint and history of present illness',
        'Describe onset, duration, and progression of symptoms',
        'Present relevant past medical history and current medications',
        'Report known allergies and adverse drug reactions',
        'Describe physical assessment findings systematically (head-to-toe)',
        'Present vital signs trends and significant changes',
        'Report diagnostic findings: ECG interpretation, blood glucose',
        'Note mental status and neurological assessment findings'
      ],
      safetyNotes: [
        'Systematic presentation ensures completeness',
        'Trends more important than single values',
        'Neurological status critical for ongoing care decisions'
      ]
    },
    {
      id: 'ph-step-5',
      stepNumber: 5,
      title: 'Interventions and Treatment Response',
      description: 'Report all treatments provided and patient response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'List all medications given with exact doses, routes, and times',
        'Describe procedures performed: IV access, airway management',
        'Report patient response to each intervention',
        'Note any complications or adverse reactions encountered',
        'Describe pain management efforts and effectiveness',
        'Report fluid therapy: types, volumes, and patient response',
        'Mention oxygen therapy and respiratory support provided',
        'Include any failed attempts or difficulties encountered'
      ],
      safetyNotes: [
        'Complete medication history prevents dangerous interactions',
        'Response to treatments guides ongoing care decisions',
        'Failed interventions important for avoiding repeated attempts'
      ]
    },
    {
      id: 'ph-step-6',
      stepNumber: 6,
      title: 'Current Status and Ongoing Concerns',
      description: 'Describe patient\'s current condition and immediate needs',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Report most recent vital signs and trend direction',
        'Describe current level of consciousness and orientation',
        'Note any ongoing symptoms or patient complaints',
        'Report current IV access status and patency',
        'Describe airway status and respiratory effort',
        'Note any monitoring equipment in place',
        'Mention pain level and comfort measures needed',
        'Identify any immediate priorities for continuing care'
      ],
      safetyNotes: [
        'Current status most relevant for immediate care decisions',
        'Ongoing concerns help receiving team prioritize interventions',
        'Equipment status ensures continuity of monitoring'
      ]
    },
    {
      id: 'ph-step-7',
      stepNumber: 7,
      title: 'Questions, Clarifications, and Documentation Transfer',
      description: 'Address questions and transfer all documentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Ask if receiving team has any questions about care provided',
        'Clarify any unclear information or unusual findings',
        'Provide additional details if requested by receiving team',
        'Transfer all original documentation and copies',
        'Hand over medication vials, ECG strips, and diagnostic results',
        'Provide contact information for follow-up questions',
        'Ensure receiving team accepts responsibility for patient care',
        'Document time and person receiving handover report'
      ],
      equipmentNeeded: [
        'Complete patient care documentation',
        'Medication vials and administration records',
        'ECG strips and diagnostic results',
        'Contact information for transport service'
      ],
      safetyNotes: [
        'Questions ensure complete understanding',
        'Documentation transfer provides legal protection',
        'Clear acceptance of care responsibility essential'
      ]
    },
    {
      id: 'ph-step-8',
      stepNumber: 8,
      title: 'Professional Closure and Availability',
      description: 'Complete handover professionally and maintain availability',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Confirm receiving team has all necessary information',
        'Offer to stay briefly if questions arise during initial assessment',
        'Provide business card or contact information if appropriate',
        'Thank receiving team for accepting the patient',
        'Complete any required facility documentation or signatures',
        'Ensure patient comfort during transition',
        'Say appropriate goodbye to conscious patients',
        'Document completion of handover in patient record'
      ],
      safetyNotes: [
        'Professional closure maintains good working relationships',
        'Brief availability helps resolve immediate questions',
        'Patient comfort important during care transitions'
      ]
    }
  ],

  // 57. DRUG ADMINISTRATION - Safe medication administration and pharmacology
  'drug-administration': [
    {
      id: 'da-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Medication Verification',
      description: 'Assess patient and verify medication order using systematic approach',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Verify patient identity using two identifiers: name, date of birth',
        'Check medication order against protocol or physician directive',
        'Confirm indication for medication based on patient presentation',
        'Review patient medical history and current medications',
        'Check for known allergies and previous adverse drug reactions',
        'Assess contraindications specific to the medication',
        'Verify appropriate route of administration for clinical situation',
        'Document baseline vital signs and relevant clinical parameters'
      ],
      contraindications: [
        'Known allergy to medication or class of drugs',
        'Medication-specific contraindications (pregnancy, renal failure, etc.)',
        'Inability to verify patient identity',
        'No clear indication for medication administration',
        'Lack of proper authorization or medical direction'
      ],
      safetyNotes: [
        'Patient identification is first priority for medication safety',
        'Never administer medication without clear indication',
        'When in doubt about allergies or contraindications, consult medical control'
      ]
    },
    {
      id: 'da-step-2',
      stepNumber: 2,
      title: 'Six Rights of Medication Administration',
      description: 'Apply the six rights systematically before medication administration',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Right Patient: verify identity with two identifiers',
        'Right Drug: confirm medication name and concentration',
        'Right Dose: calculate dose based on weight/indication, double-check math',
        'Right Route: IV, IM, SQ, PO, inhaled - match route to indication',
        'Right Time: verify timing relative to symptoms and previous doses',
        'Right Documentation: prepare to document all aspects of administration',
        'Use independent double-check for high-risk medications',
        'Verify expiration dates on all medications'
      ],
      safetyNotes: [
        'The six rights are minimum safety standards - all must be verified',
        'High-risk medications require independent verification by second provider',
        'Never skip verification steps even in emergency situations'
      ]
    },
    {
      id: 'da-step-3',
      stepNumber: 3,
      title: 'Dosage Calculation and Preparation',
      description: 'Calculate correct dose and prepare medication using sterile technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Calculate dose using standard formulas: Dose = (Desired/Have) × Volume',
        'Use patient weight in kilograms for weight-based calculations',
        'Double-check calculations independently or with partner',
        'Draw up medication using sterile technique and appropriate syringe',
        'Label syringe with medication name, concentration, and dose',
        'Check for medication compatibility if mixing with IV fluids',
        'Prepare appropriate diluent if medication requires dilution',
        'Have reversal agents available for high-risk medications'
      ],
      equipmentNeeded: [
        'Appropriate syringes and needles',
        'Medication vials or ampules',
        'Alcohol swabs for vial preparation',
        'Medication calculation aids or charts',
        'Labels for syringes',
        'Diluent (normal saline, D5W) as needed'
      ],
      safetyNotes: [
        'Calculation errors are common cause of medication errors',
        'Independent verification essential for complex calculations',
        'Proper labeling prevents mix-ups during administration'
      ]
    },
    {
      id: 'da-step-4',
      stepNumber: 4,
      title: 'Route-Specific Administration Technique',
      description: 'Administer medication using appropriate technique for selected route',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'IV route: verify IV patency, inject at appropriate rate, flush line',
        'IM route: select appropriate site (deltoid, vastus lateralis), inject at 90°',
        'Subcutaneous: pinch skin, inject at 45° angle in fatty tissue',
        'Inhaled: coordinate administration with patient breathing pattern',
        'Oral: ensure patient can swallow safely, position upright',
        'Sublingual: place under tongue, instruct patient not to swallow',
        'Monitor injection site for complications during administration',
        'Use appropriate needle size for route and patient body habitus'
      ],
      contraindications: [
        'IV route: infiltrated or non-patent IV access',
        'IM route: infection at injection site, severe coagulopathy',
        'Oral route: altered mental status, nausea/vomiting',
        'Inhaled route: severe bronchospasm or airway obstruction'
      ],
      safetyNotes: [
        'Each route has specific technique requirements for safety',
        'Monitor injection sites for signs of infiltration or extravasation',
        'Aspiration before injection prevents intravascular injection'
      ]
    },
    {
      id: 'da-step-5',
      stepNumber: 5,
      title: 'Patient Monitoring During Administration',
      description: 'Monitor patient response and vital signs during medication delivery',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Monitor vital signs: blood pressure, heart rate, respiratory rate, oxygen saturation',
        'Watch for immediate adverse reactions: allergic responses, hypotension',
        'Assess for therapeutic response appropriate to medication given',
        'Monitor cardiac rhythm if giving medications affecting cardiovascular system',
        'Watch for signs of medication extravasation or local reactions',
        'Assess pain relief if analgesic medications administered',
        'Monitor level of consciousness for CNS-active medications',
        'Be prepared to stop administration if adverse reactions occur'
      ],
      equipmentNeeded: [
        'Continuous vital signs monitoring equipment',
        'Pulse oximetry',
        'Cardiac monitor if indicated',
        'Emergency resuscitation equipment'
      ],
      safetyNotes: [
        'Some adverse reactions can be immediate and life-threatening',
        'Continuous monitoring allows early detection of problems',
        'Be prepared to treat allergic reactions or medication toxicity'
      ]
    },
    {
      id: 'da-step-6',
      stepNumber: 6,
      title: 'Post-Administration Assessment',
      description: 'Evaluate therapeutic response and monitor for delayed effects',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Assess therapeutic effectiveness: pain relief, symptom improvement',
        'Monitor for delayed adverse reactions (15-30 minutes post-administration)',
        'Reassess vital signs and compare to baseline measurements',
        'Evaluate need for additional doses or alternative treatments',
        'Check injection site for local complications if parenteral route used',
        'Assess patient comfort and overall clinical improvement',
        'Document patient response and any side effects observed',
        'Prepare for potential need for reversal agents or supportive care'
      ],
      safetyNotes: [
        'Some medications have delayed onset of action and side effects',
        'Continuous assessment needed to determine treatment effectiveness',
        'Early recognition of inadequate response allows for timely intervention'
      ]
    },
    {
      id: 'da-step-7',
      stepNumber: 7,
      title: 'Adverse Reaction Recognition and Management',
      description: 'Recognize and manage medication adverse reactions promptly',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Recognize allergic reactions: rash, hives, bronchospasm, hypotension',
        'Identify medication toxicity signs specific to drug administered',
        'Assess for drug interactions with patient\'s existing medications',
        'Stop medication administration if adverse reaction suspected',
        'Administer appropriate antidotes or reversal agents if available',
        'Provide supportive care: IV fluids, oxygen, vasopressors as needed',
        'Document adverse reaction thoroughly including timeline and severity',
        'Report adverse reactions to medical control and receiving facility'
      ],
      equipmentNeeded: [
        'Epinephrine for severe allergic reactions',
        'Naloxone for opioid reversal',
        'Flumazenil for benzodiazepine reversal',
        'IV fluids and vasopressor medications',
        'Airway management equipment'
      ],
      safetyNotes: [
        'Early recognition and treatment of adverse reactions saves lives',
        'Have reversal agents immediately available for high-risk medications',
        'Some adverse reactions may be delayed and require ongoing monitoring'
      ]
    },
    {
      id: 'da-step-8',
      stepNumber: 8,
      title: 'Documentation and Communication',
      description: 'Provide comprehensive documentation and communication of medication administration',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Document medication name, dose, route, and exact time of administration',
        'Record indication for medication and authorization source',
        'Note patient response including vital signs before and after',
        'Document any adverse reactions or complications encountered',
        'Record lot numbers and expiration dates for controlled substances',
        'Communicate medication given to receiving facility during handover',
        'Complete controlled substance documentation per agency policy',
        'Include medication administration in overall patient care narrative'
      ],
      safetyNotes: [
        'Complete documentation provides legal protection',
        'Accurate records essential for continuity of care',
        'Controlled substance documentation has specific legal requirements'
      ]
    }
  ],

  // 58. TROUBLESHOOTING VENTILATOR ALARMS - Equipment management and patient safety
  'troubleshooting-ventilator-alarms': [
    {
      id: 'tva-step-1',
      stepNumber: 1,
      title: 'Initial Response and Patient Safety Assessment',
      description: 'Immediately assess patient safety and ventilator alarm status',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Assess patient immediately: color, chest rise, consciousness level',
        'Check pulse oximetry and capnography readings',
        'Listen for breath sounds bilaterally',
        'Look at patient first, ventilator second',
        'If patient in distress: disconnect from ventilator and manually ventilate',
        'Note specific alarm type and message displayed',
        'Check ventilator display for alarm priority (high, medium, low)',
        'Ensure patient safety is maintained throughout troubleshooting'
      ],
      contraindications: [
        'Never ignore high-priority alarms',
        'Do not troubleshoot equipment before ensuring patient safety',
        'Avoid silencing alarms without addressing underlying cause'
      ],
      safetyNotes: [
        'Patient safety always takes priority over equipment concerns',
        'Manual ventilation may be needed while troubleshooting',
        'High-priority alarms require immediate intervention'
      ]
    },
    {
      id: 'tva-step-2',
      stepNumber: 2,
      title: 'High-Priority Alarm Assessment',
      description: 'Systematically assess and address high-priority ventilator alarms',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Apnea alarm: check patient breathing effort, consider sedation level',
        'High pressure alarm: assess for bronchospasm, secretions, tube obstruction',
        'Low pressure alarm: check for disconnection, leaks, or tube displacement',
        'Power failure alarm: ensure backup battery or alternate power source',
        'Check endotracheal tube position and cuff inflation',
        'Assess for patient-ventilator synchrony and fighting',
        'Listen for air leaks around ETT cuff or circuit connections',
        'Verify ventilator settings match physician orders'
      ],
      equipmentNeeded: [
        'Bag-valve-mask for manual ventilation',
        'Suction equipment',
        'Stethoscope',
        'Syringe for cuff pressure check',
        'Backup ventilator if available'
      ],
      safetyNotes: [
        'High-pressure alarms may indicate life-threatening conditions',
        'Low-pressure alarms suggest inadequate ventilation',
        'Be prepared to switch to manual ventilation immediately'
      ]
    },
    {
      id: 'tva-step-3',
      stepNumber: 3,
      title: 'Circuit and Connection Inspection',
      description: 'Systematically inspect ventilator circuit and all connections',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Check all circuit connections from ventilator to patient',
        'Inspect inspiratory and expiratory limbs for disconnections',
        'Look for kinks, water accumulation, or obstructions in tubing',
        'Check heat and moisture exchanger (HME) for obstruction',
        'Inspect nebulizer connections if in use',
        'Verify PEEP valve connection and setting',
        'Check oxygen supply connection and pressure',
        'Examine circuit for cracks, holes, or damaged components'
      ],
      safetyNotes: [
        'Small leaks can cause significant ventilation problems',
        'Water accumulation can obstruct gas flow',
        'Damaged circuits must be replaced immediately'
      ]
    },
    {
      id: 'tva-step-4',
      stepNumber: 4,
      title: 'Airway Assessment and Management',
      description: 'Evaluate endotracheal tube and airway status',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Check ETT position: proper depth marking at teeth/lips',
        'Assess cuff pressure: should be 20-30 cmH2O',
        'Listen for air leak around cuff during inspiration',
        'Check for ETT obstruction: secretions, blood, kinking',
        'Suction ETT if secretions present using sterile technique',
        'Verify bilateral breath sounds and chest expansion',
        'Assess for ETT migration: too deep (right main bronchus) or shallow',
        'Consider bronchospasm if high pressures with wheeze'
      ],
      equipmentNeeded: [
        'Suction catheters and equipment',
        'Cuff pressure manometer',
        'Stethoscope',
        'End-tidal CO2 monitoring',
        'Bronchodilator medications if indicated'
      ],
      safetyNotes: [
        'ETT obstruction can be rapidly fatal',
        'High cuff pressures can cause tracheal injury',
        'ETT malposition requires immediate correction'
      ]
    },
    {
      id: 'tva-step-5',
      stepNumber: 5,
      title: 'Patient-Ventilator Synchrony Assessment',
      description: 'Evaluate patient-ventilator interaction and comfort',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Observe patient breathing pattern and ventilator response',
        'Check for patient "fighting" or asynchrony with ventilator',
        'Assess sedation level and need for anxiolysis',
        'Evaluate trigger sensitivity settings',
        'Check respiratory rate and tidal volume settings',
        'Assess for auto-PEEP (breath stacking)',
        'Monitor patient work of breathing and comfort',
        'Consider need for sedation or paralysis if severe asynchrony'
      ],
      safetyNotes: [
        'Patient-ventilator asynchrony increases work of breathing',
        'Fighting the ventilator can worsen patient condition',
        'Proper sedation improves ventilator tolerance'
      ]
    },
    {
      id: 'tva-step-6',
      stepNumber: 6,
      title: 'Ventilator Settings Verification and Adjustment',
      description: 'Verify and adjust ventilator settings as appropriate',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Verify current settings match physician orders',
        'Check mode: volume control, pressure control, SIMV, etc.',
        'Confirm tidal volume (6-8 mL/kg ideal body weight)',
        'Verify respiratory rate and I:E ratio settings',
        'Check PEEP and pressure support levels',
        'Assess FiO2 setting and oxygen supply',
        'Review alarm limits: appropriate for patient condition',
        'Document any setting changes and rationale'
      ],
      contraindications: [
        'Do not change settings without physician order except in emergencies',
        'Avoid excessive tidal volumes (>10 mL/kg)',
        'Do not adjust alarms to avoid triggering'
      ],
      safetyNotes: [
        'Inappropriate settings can cause ventilator-induced lung injury',
        'Alarm limits should be appropriate for patient condition',
        'Document all changes for continuity of care'
      ]
    },
    {
      id: 'tva-step-7',
      stepNumber: 7,
      title: 'Equipment Replacement and Backup Procedures',
      description: 'Replace faulty equipment and implement backup procedures',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Replace faulty ventilator circuit if leaks or damage identified',
        'Switch to backup ventilator if primary unit malfunction persists',
        'Ensure continuous patient monitoring during equipment changes',
        'Test replacement equipment before connecting to patient',
        'Have manual ventilation ready during equipment transitions',
        'Check oxygen supply and backup oxygen sources',
        'Verify all connections and settings on replacement equipment',
        'Document equipment problems and actions taken'
      ],
      equipmentNeeded: [
        'Replacement ventilator circuits',
        'Backup ventilator unit',
        'Manual resuscitation bags',
        'Oxygen supply and backup tanks'
      ],
      safetyNotes: [
        'Never leave patient unattended during equipment changes',
        'Test all equipment before patient connection',
        'Have backup plans for equipment failure'
      ]
    },
    {
      id: 'tva-step-8',
      stepNumber: 8,
      title: 'Ongoing Monitoring and Documentation',
      description: 'Establish ongoing monitoring plan and document interventions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Monitor ventilator function and alarm status continuously',
        'Assess patient response to troubleshooting interventions',
        'Document alarm cause and corrective actions taken',
        'Check ventilator settings and patient parameters regularly',
        'Monitor for recurring alarms or new problems',
        'Communicate equipment issues to receiving facility',
        'Ensure backup equipment remains available',
        'Plan for ongoing ventilator management during transport'
      ],
      safetyNotes: [
        'Continuous monitoring essential after alarm episodes',
        'Document all interventions for legal and clinical continuity',
        'Recurrent alarms may indicate ongoing problems'
      ]
    }
  ],

  // 59. 3 LEAD ECG INTERPRETATION - Cardiac rhythm monitoring and analysis
  '3-lead-ecg-interpretation': [
    {
      id: '3ecg-step-1',
      stepNumber: 1,
      title: 'Equipment Setup and Lead Placement',
      description: 'Prepare 3-lead ECG monitoring system and apply electrodes correctly',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Select appropriate monitoring leads: Lead II most commonly used for rhythm analysis',
        'Clean electrode sites with alcohol and allow to dry completely',
        'Apply electrodes: RA (right arm/shoulder), LA (left arm/shoulder), LL (left leg/lower chest)',
        'Ensure electrodes have good adhesion and skin contact',
        'Connect lead wires with correct color coding: white (RA), black (LA), red (LL)',
        'Check ECG display for clear waveform without excessive artifact',
        'Set appropriate gain (usually 1 mV = 10mm) and sweep speed (25 mm/sec)',
        'Activate rhythm monitoring and set appropriate alarm parameters'
      ],
      equipmentNeeded: [
        '3-lead ECG monitor',
        'ECG electrodes (3 minimum)',
        'Lead wires with color coding',
        'Alcohol wipes for skin prep',
        'Razor for hair removal if needed'
      ],
      safetyNotes: [
        'Proper electrode placement essential for accurate interpretation',
        'Poor skin contact causes artifact that may mimic arrhythmias',
        'Lead II provides best view of P waves for rhythm analysis'
      ]
    },
    {
      id: '3ecg-step-2',
      stepNumber: 2,
      title: 'Systematic Rhythm Analysis',
      description: 'Perform systematic assessment of cardiac rhythm components',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'RATE: Count R-waves in 6-second strip × 10, or 300 ÷ number of large boxes between R-waves',
        'RHYTHM: Assess regularity - measure R-R intervals with calipers or paper',
        'P WAVES: Present before each QRS? Same shape? Atrial rate if different from ventricular',
        'PR INTERVAL: Normal 0.12-0.20 seconds (3-5 small boxes)',
        'QRS COMPLEX: Normal <0.12 seconds (3 small boxes), wide suggests ventricular origin',
        'Calculate heart rate: Normal 60-100 bpm, <60 bradycardia, >100 tachycardia',
        'Identify any ectopic beats, pauses, or irregular patterns',
        'Correlate rhythm with patient clinical presentation and hemodynamic status'
      ],
      contraindications: [
        'Do not rely on artifact-laden tracings for critical decisions',
        'Single-lead monitoring cannot diagnose STEMI - use 12-lead ECG'
      ],
      safetyNotes: [
        'Systematic approach prevents missed abnormalities',
        'Clinical correlation essential - treat the patient, not the monitor',
        'Artifact can mimic dangerous arrhythmias'
      ]
    },
    {
      id: '3ecg-step-3',
      stepNumber: 3,
      title: 'Common Arrhythmia Recognition',
      description: 'Identify and classify common cardiac arrhythmias',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'NORMAL SINUS RHYTHM: Rate 60-100, regular R-R, P before each QRS, normal PR/QRS',
        'SINUS BRADYCARDIA: <60 bpm, otherwise normal - assess hemodynamic stability',
        'SINUS TACHYCARDIA: >100 bpm, otherwise normal - identify underlying cause',
        'ATRIAL FIBRILLATION: Irregularly irregular rhythm, absent distinct P waves',
        'ATRIAL FLUTTER: Sawtooth flutter waves at 250-350 bpm, variable AV conduction',
        'VENTRICULAR TACHYCARDIA: Wide QRS >0.12, rate >150, regular rhythm',
        'VENTRICULAR FIBRILLATION: Chaotic, irregular waveform without identifiable complexes',
        'AV BLOCKS: First degree (PR >0.20), second degree (dropped beats), third degree (dissociation)'
      ],
      safetyNotes: [
        'VT and VF are immediately life-threatening - prepare for defibrillation',
        'Hemodynamically unstable rhythms require immediate intervention',
        'Some rhythms may appear similar - consider clinical context'
      ]
    },
    {
      id: '3ecg-step-4',
      stepNumber: 4,
      title: 'Ectopic Beat and Pause Assessment',
      description: 'Identify and evaluate premature beats and conduction disturbances',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'PREMATURE ATRIAL CONTRACTIONS (PACs): Early P wave, different morphology, usually narrow QRS',
        'PREMATURE VENTRICULAR CONTRACTIONS (PVCs): Wide QRS, no preceding P wave, compensatory pause',
        'Assess PVC frequency: occasional vs frequent (>6/min), unifocal vs multifocal',
        'Look for dangerous PVC patterns: R-on-T, couplets, runs of 3+ (non-sustained VT)',
        'ESCAPE BEATS: Late beats during sinus pause, usually narrow (junctional) or wide (ventricular)',
        'PAUSES: Measure length, determine if sinus pause, blocked PAC, or AV block',
        'Bigeminy/Trigeminy: Every 2nd or 3rd beat is ectopic',
        'Document frequency and clinical significance of ectopic activity'
      ],
      safetyNotes: [
        'Frequent PVCs may herald more dangerous arrhythmias',
        'R-on-T PVCs can trigger ventricular fibrillation',
        'Long pauses may cause syncope or hemodynamic compromise'
      ]
    },
    {
      id: '3ecg-step-5',
      stepNumber: 5,
      title: 'Artifact Recognition and Troubleshooting',
      description: 'Identify and correct common sources of ECG artifact',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'MUSCLE ARTIFACT: Irregular baseline fluctuation - check electrode contact, patient movement',
        'ELECTRICAL INTERFERENCE: 60-Hz artifact (power line) - check grounding, move away from electrical equipment',
        'MOTION ARTIFACT: Irregular spikes during movement - secure electrodes, minimize patient movement',
        'POOR ELECTRODE CONTACT: Intermittent loss of signal - replace electrodes, clean skin',
        'LEAD WIRE PROBLEMS: Sudden loss of signal - check connections, replace damaged wires',
        'BASELINE WANDER: Slow drift of baseline - check electrode adhesion, respiratory artifact',
        'Distinguish artifact from real arrhythmias: artifact usually affects baseline, not QRS morphology',
        'When in doubt, check pulse manually and compare with ECG display'
      ],
      safetyNotes: [
        'Artifact can mimic life-threatening arrhythmias',
        'Never treat artifact - always verify with pulse check',
        'Poor tracings can lead to missed real arrhythmias'
      ]
    },
    {
      id: '3ecg-step-6',
      stepNumber: 6,
      title: 'Clinical Correlation and Treatment Decisions',
      description: 'Correlate ECG findings with patient condition and determine appropriate interventions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Assess hemodynamic stability: blood pressure, perfusion, mental status',
        'Correlate rhythm with symptoms: chest pain, dyspnea, syncope, palpitations',
        'UNSTABLE RHYTHMS: Prepare for cardioversion (VT with pulse, symptomatic SVT)',
        'STABLE RHYTHMS: Consider medication therapy, 12-lead ECG, continuous monitoring',
        'BRADYCARDIA: Assess for symptoms, consider atropine or pacing if hemodynamically unstable',
        'TACHYCARDIA: Identify narrow vs wide complex, regular vs irregular patterns',
        'Document rhythm strips showing abnormalities for receiving physician',
        'Communicate findings clearly to receiving facility and medical control'
      ],
      contraindications: [
        'Do not cardiovert atrial fibrillation without anticoagulation consideration',
        'Avoid adenosine in irregular wide-complex rhythms (may be atrial fibrillation)',
        'Do not give calcium channel blockers in ventricular tachycardia'
      ],
      safetyNotes: [
        'Always treat the patient, not just the monitor',
        'Hemodynamic stability takes priority over rhythm appearance',
        'Obtain 12-lead ECG when possible for complete assessment'
      ]
    },
    {
      id: '3ecg-step-7',
      stepNumber: 7,
      title: 'Continuous Monitoring and Trend Analysis',
      description: 'Establish ongoing cardiac monitoring and assess rhythm changes over time',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Set appropriate alarm parameters: high/low heart rate, arrhythmia detection',
        'Monitor for rhythm changes during transport and treatment',
        'Assess response to interventions: medications, cardioversion, pacing',
        'Look for trends: increasing ectopy, developing AV blocks, rate changes',
        'Document rhythm strips before and after interventions',
        'Monitor ST segment for elevation/depression if lead placement allows',
        'Watch for signs of hemodynamic deterioration with rhythm changes',
        'Prepare equipment for potential rhythm emergencies during transport'
      ],
      equipmentNeeded: [
        'Defibrillator/monitor with rhythm analysis',
        'Emergency cardiac medications',
        'External pacing capability if available',
        'Documentation materials for rhythm strips'
      ],
      safetyNotes: [
        'Rhythm can change rapidly during acute cardiac events',
        'Continuous monitoring essential during transport',
        'Be prepared for sudden deterioration to life-threatening rhythms'
      ]
    },
    {
      id: '3ecg-step-8',
      stepNumber: 8,
      title: 'Documentation and Communication',
      description: 'Document ECG findings and communicate effectively with receiving team',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Print rhythm strips showing baseline rhythm and any abnormalities',
        'Document heart rate, rhythm interpretation, and clinical correlation',
        'Record time of rhythm changes and relationship to interventions',
        'Include rhythm strips in patient care report with interpretations',
        'Communicate rhythm findings to receiving physician clearly and concisely',
        'Report any interventions performed for rhythm management',
        'Note patient response to treatments and ongoing rhythm stability',
        'Ensure continuous monitoring capability during handoff to receiving team'
      ],
      safetyNotes: [
        'Clear communication prevents errors in continuing care',
        'Rhythm strips provide objective evidence of patient condition',
        'Documentation supports medical-legal protection'
      ]
    }
  ],

  // 60. APPLICATION OF BANDAGE/TRIANGULAR BANDAGE - Wound care and hemorrhage control
  'bandage-triangular-application': [
    {
      id: 'bandage-step-1',
      stepNumber: 1,
      title: 'Wound Assessment and Preparation',
      description: 'Evaluate wound characteristics and prepare for appropriate bandaging',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess wound size, depth, and location to determine bandage requirements',
        'Check for active bleeding and apply direct pressure if needed',
        'Look for foreign objects - do not remove impaled objects',
        'Evaluate circulation distal to wound (pulse, color, sensation)',
        'Clean hands and don appropriate personal protective equipment',
        'Expose wound area adequately while maintaining patient modesty',
        'Control any active bleeding before applying bandage',
        'Assess for signs of infection: redness, warmth, purulent drainage'
      ],
      equipmentNeeded: [
        'Triangular bandages (various sizes)',
        'Gauze pads and roll gauze',
        'Medical tape',
        'Scissors',
        'Antiseptic solution',
        'Personal protective equipment'
      ],
      contraindications: [
        'Do not bandage over impaled objects - stabilize instead',
        'Avoid circumferential bandages that might compromise circulation',
        'Do not apply bandages to infected wounds without cleaning first'
      ],
      safetyNotes: [
        'Universal precautions apply for all wound care',
        'Check circulation before and after bandage application',
        'Impaled objects require stabilization, not removal'
      ]
    },
    {
      id: 'bandage-step-2',
      stepNumber: 2,
      title: 'Wound Cleaning and Initial Dressing',
      description: 'Clean wound appropriately and apply primary dressing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Irrigate wound gently with sterile saline if available and appropriate',
        'Do not scrub or use harsh antiseptics on deep wounds',
        'Remove only loose debris - leave embedded material for physician',
        'Apply sterile gauze pad directly over wound as primary dressing',
        'Use non-adherent dressing for burns or wounds likely to stick',
        'Ensure dressing covers entire wound with adequate margins',
        'Apply gentle pressure if bleeding continues',
        'Prepare triangular bandage for secondary securing'
      ],
      safetyNotes: [
        'Gentle cleaning prevents further tissue damage',
        'Sterile technique reduces infection risk',
        'Do not delay transport for extensive wound cleaning'
      ]
    },
    {
      id: 'bandage-step-3',
      stepNumber: 3,
      title: 'Triangular Bandage Folding Techniques',
      description: 'Prepare triangular bandage using appropriate folding technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'BROAD FOLD: Bring point to center of base, fold in half again - for head/chest wounds',
        'NARROW FOLD: Fold broad fold in half again - for limb bandaging and ties',
        'FULL TRIANGLE: Use unfolded for slings, head bandages, or large area coverage',
        'Check triangular bandage for tears or damage before use',
        'Ensure bandage is clean and preferably sterile',
        'Select appropriate size triangular bandage for wound location',
        'Have scissors available for trimming excess bandage material',
        'Prepare safety pins if needed for securing (avoid near face/airway)'
      ],
      safetyNotes: [
        'Different fold techniques for different anatomical areas',
        'Damaged bandages may not provide adequate support',
        'Safety pins should be avoided near airways and major vessels'
      ]
    },
    {
      id: 'bandage-step-4',
      stepNumber: 4,
      title: 'Head and Scalp Bandaging Technique',
      description: 'Apply triangular bandage to head and scalp wounds',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Place base of triangle across forehead just above eyebrows',
        'Bring point of triangle down over back of head to nape of neck',
        'Cross the two base ends behind the head below the occipital protuberance',
        'Bring ends forward and tie in front of one ear, not over the wound',
        'Tuck point up inside the bandage at back of head or secure with safety pin',
        'Ensure bandage covers wound but does not obstruct vision or breathing',
        'Check that bandage is snug but not too tight - should fit one finger underneath',
        'Monitor for signs of increased intracranial pressure during transport'
      ],
      contraindications: [
        'Do not apply if cervical spine injury suspected without spinal immobilization',
        'Avoid covering both eyes unless absolutely necessary',
        'Do not tie knots over wounds or bony prominences'
      ],
      safetyNotes: [
        'Head wounds can bleed extensively and look worse than they are',
        'Monitor airway and breathing with head bandages',
        'Scalp wounds may indicate underlying skull fracture'
      ]
    },
    {
      id: 'bandage-step-5',
      stepNumber: 5,
      title: 'Chest and Abdominal Bandaging',
      description: 'Secure bandages for chest and abdominal wounds',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'For chest wounds: use broad fold, wrap around chest under arms',
        'Secure chest bandages during expiration to allow for breathing expansion',
        'For abdominal wounds: use full triangle or broad fold, support eviscerated organs',
        'Do not push protruding organs back into abdomen - cover with moist sterile dressing',
        'Wrap bandage around waist, tie at side away from wound',
        'Ensure bandage supports without restricting respiratory movement',
        'Monitor breathing effort continuously with chest bandages',
        'Position patient appropriately: chest wounds - affected side down if possible'
      ],
      contraindications: [
        'Do not bandage chest wounds too tightly - impairs breathing',
        'Never push eviscerated organs back into abdominal cavity',
        'Avoid circumferential abdominal bandages in pregnancy'
      ],
      safetyNotes: [
        'Chest wounds may cause pneumothorax - monitor breathing',
        'Abdominal wounds with evisceration are surgical emergencies',
        'Tight bandages can compromise ventilation'
      ]
    },
    {
      id: 'bandage-step-6',
      stepNumber: 6,
      title: 'Extremity and Joint Bandaging',
      description: 'Apply triangular bandages to arms, legs, and joints',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Use narrow fold for spiral bandaging of limbs',
        'Start distally and work proximally with overlapping turns',
        'For joints: use figure-8 pattern to provide support and flexibility',
        'Knee/elbow: bend joint slightly, wrap above and below joint, cross over joint',
        'Ankle: start with anchor around lower leg, figure-8 around foot and ankle',
        'Leave fingers/toes exposed to monitor circulation',
        'Check pulse distal to bandage before and after application',
        'Secure bandage with tape, safety pin, or by tucking end under previous wrap'
      ],
      safetyNotes: [
        'Monitor distal circulation - check pulse, color, sensation',
        'Bandages should be snug but not tight enough to impair circulation',
        'Joint bandages should allow some movement unless fracture suspected'
      ]
    },
    {
      id: 'bandage-step-7',
      stepNumber: 7,
      title: 'Sling Application for Arm Injuries',
      description: 'Create and apply triangular bandage sling for arm support',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Position injured arm across chest with elbow at 90 degrees',
        'Place triangular bandage with point toward elbow, base along uninjured side',
        'Bring upper end over shoulder on uninjured side',
        'Bring lower end up and over shoulder on injured side',
        'Tie knot at side of neck, not at back where it would be uncomfortable',
        'Adjust sling so hand is slightly higher than elbow',
        'Secure point at elbow with safety pin or tape',
        'Use swathe bandage around body to further immobilize if needed'
      ],
      contraindications: [
        'Do not use sling if shoulder dislocation suspected until reduced',
        'Avoid slings that pull on neck if cervical spine injury possible'
      ],
      safetyNotes: [
        'Slings provide support but should not replace splinting for fractures',
        'Check circulation in fingers regularly',
        'Shoulder injuries may require additional immobilization'
      ]
    },
    {
      id: 'bandage-step-8',
      stepNumber: 8,
      title: 'Bandage Assessment and Monitoring',
      description: 'Evaluate bandage effectiveness and monitor for complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Check bandage security - should not slip or loosen with movement',
        'Assess distal circulation: pulse, color, capillary refill, sensation',
        'Monitor for signs of compartment syndrome: 5 Ps (Pain, Pallor, Paresthesia, Pulselessness, Paralysis)',
        'Watch for breakthrough bleeding - reinforce bandage, do not remove',
        'Check bandage tightness - should allow one finger to slip underneath',
        'Document bandage application and circulation checks',
        'Re-evaluate during transport and adjust if circulation compromised',
        'Prepare to remove or loosen bandage if circulation impaired'
      ],
      safetyNotes: [
        'Bandages can become tighter as swelling increases',
        'Loss of pulse distal to bandage requires immediate loosening',
        'Compartment syndrome is a surgical emergency',
        'Regular monitoring prevents serious complications'
      ]
    }
  ],

  // 61. NEBULIZATION OF MEDICATION - Respiratory therapy and bronchodilator administration
  'nebulization-medication': [
    {
      id: 'nebulizer-step-1',
      stepNumber: 1,
      title: 'Patient Assessment and Indication Verification',
      description: 'Assess patient respiratory status and verify indications for nebulized therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess respiratory distress: rate, effort, accessory muscle use, wheeze',
        'Check oxygen saturation and baseline vital signs',
        'Auscultate chest for bronchospasm, decreased air entry, or wheeze',
        'Verify medication orders and patient allergies',
        'Confirm appropriate indications: asthma, COPD exacerbation, bronchospasm',
        'Check patient consciousness level - must be able to cooperate',
        'Assess for contraindications to specific medications',
        'Evaluate patient history of bronchodilator use and response'
      ],
      equipmentNeeded: [
        'Nebulizer with mask or mouthpiece',
        'Oxygen source or air compressor',
        'Prescribed medication (albuterol, ipratropium)',
        'Normal saline if needed',
        'Stethoscope for assessment',
        'Pulse oximeter'
      ],
      contraindications: [
        'Beta-agonist hypersensitivity (for albuterol)',
        'Severe cardiac arrhythmias (relative contraindication)',
        'Inability to cooperate with treatment',
        'Severe upper airway obstruction'
      ],
      safetyNotes: [
        'Check patient allergies before medication administration',
        'Monitor for cardiac side effects with beta-agonists',
        'Ensure patient can protect airway during treatment'
      ]
    },
    {
      id: 'nebulizer-step-2',
      stepNumber: 2,
      title: 'Equipment Assembly and Preparation',
      description: 'Set up nebulizer equipment and prepare medication',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Assemble nebulizer: connect medication cup to compressor tubing',
        'Attach mask or mouthpiece to nebulizer cup',
        'Connect oxygen tubing to nebulizer and set flow to 6-8 L/min',
        'Test nebulizer function - should produce fine mist when activated',
        'Prepare medication: typical dose albuterol 2.5mg in 3ml normal saline',
        'Add ipratropium 0.5mg if ordered for combination therapy',
        'Pour medication into nebulizer cup, avoiding contamination',
        'Ensure all connections are secure and patent'
      ],
      safetyNotes: [
        'Use sterile technique when handling medications',
        'Check expiration dates on all medications',
        'Proper flow rate essential for adequate nebulization'
      ]
    },
    {
      id: 'nebulizer-step-3',
      stepNumber: 3,
      title: 'Patient Positioning and Education',
      description: 'Position patient optimally and explain nebulizer treatment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Position patient sitting upright or high Fowler\'s position',
        'Ensure patient is comfortable and can breathe without restriction',
        'Explain procedure: "This medication mist will help open your airways"',
        'Instruct on breathing technique: slow, deep breaths through mouth',
        'Demonstrate how to hold nebulizer cup upright to ensure proper mist',
        'Advise patient to breathe normally if deep breaths cause distress',
        'Explain treatment duration: typically 5-10 minutes or until mist stops',
        'Establish signal for patient to indicate distress during treatment'
      ],
      safetyNotes: [
        'Upright positioning improves drug delivery and comfort',
        'Patient cooperation essential for treatment effectiveness',
        'Monitor patient throughout treatment for adverse reactions'
      ]
    },
    {
      id: 'nebulizer-step-4',
      stepNumber: 4,
      title: 'Nebulizer Administration Technique',
      description: 'Administer nebulized medication using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 600,
      keyPoints: [
        'Apply mask snugly over nose and mouth, or have patient seal lips around mouthpiece',
        'Start oxygen flow and confirm mist production',
        'Encourage slow, deep breathing through mouth when possible',
        'Hold nebulizer cup upright to ensure proper medication delivery',
        'Occasionally tap sides of nebulizer to prevent medication sticking',
        'Continue treatment until no more mist is produced (usually 5-10 minutes)',
        'Monitor patient response: decreased wheeze, improved air entry, easier breathing',
        'Watch for side effects: increased heart rate, tremor, anxiety'
      ],
      safetyNotes: [
        'Monitor vital signs during treatment, especially heart rate',
        'Stop treatment if severe adverse reactions occur',
        'Some patients may experience paradoxical bronchospasm'
      ]
    },
    {
      id: 'nebulizer-step-5',
      stepNumber: 5,
      title: 'Patient Monitoring During Treatment',
      description: 'Continuously monitor patient response and vital signs',
      isRequired: true,
      isCritical: true,
      timeEstimate: 600,
      keyPoints: [
        'Monitor oxygen saturation continuously during treatment',
        'Check heart rate and blood pressure every 2-3 minutes',
        'Assess respiratory rate and effort for improvement',
        'Listen to chest sounds during and after treatment',
        'Watch for signs of improvement: less wheeze, better air entry, reduced dyspnea',
        'Monitor for side effects: tachycardia >120 bpm, tremor, restlessness',
        'Check patient comfort and ability to tolerate treatment',
        'Be prepared to stop treatment if adverse reactions occur'
      ],
      safetyNotes: [
        'Beta-agonists can cause significant cardiovascular effects',
        'Elderly patients more susceptible to side effects',
        'Overdose can cause severe tachycardia and arrhythmias'
      ]
    },
    {
      id: 'nebulizer-step-6',
      stepNumber: 6,
      title: 'Post-Treatment Assessment',
      description: 'Evaluate treatment effectiveness and patient response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Reassess respiratory status: rate, effort, wheeze, air entry',
        'Check oxygen saturation and compare to pre-treatment values',
        'Auscultate chest for improvement in air movement and wheeze',
        'Assess patient subjectively: "How does your breathing feel now?"',
        'Monitor vital signs: heart rate should stabilize within 15 minutes',
        'Document treatment response: improved, unchanged, or worsened',
        'Consider need for additional treatment based on response',
        'Prepare for potential repeat dosing if protocols allow'
      ],
      contraindications: [
        'Do not repeat treatment if severe tachycardia or arrhythmias develop',
        'Avoid additional doses if patient shows no improvement and develops side effects'
      ],
      safetyNotes: [
        'Lack of response may indicate need for more aggressive therapy',
        'Some patients may require multiple treatments',
        'Worsening condition despite treatment requires immediate medical evaluation'
      ]
    },
    {
      id: 'nebulizer-step-7',
      stepNumber: 7,
      title: 'Equipment Cleaning and Medication Storage',
      description: 'Properly clean equipment and store medications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Disconnect nebulizer from oxygen and disassemble components',
        'Rinse nebulizer cup and mask with water to remove medication residue',
        'Allow equipment to air dry or follow manufacturer cleaning instructions',
        'Store remaining medications according to requirements (temperature, light)',
        'Dispose of single-use components appropriately',
        'Check medication inventory and expiration dates',
        'Clean and disinfect reusable equipment between patients',
        'Document medication administration and equipment used'
      ],
      safetyNotes: [
        'Proper cleaning prevents cross-contamination',
        'Medications may degrade if not stored properly',
        'Equipment contamination can cause infections'
      ]
    },
    {
      id: 'nebulizer-step-8',
      stepNumber: 8,
      title: 'Documentation and Follow-up Care',
      description: 'Document treatment and plan ongoing respiratory management',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Document medication administered: drug, dose, time, route',
        'Record pre- and post-treatment vital signs and respiratory assessment',
        'Note patient response to treatment and any side effects',
        'Document need for additional treatments or alternative therapies',
        'Communicate treatment effectiveness to receiving facility',
        'Plan ongoing respiratory monitoring during transport',
        'Consider need for continuous nebulizer therapy for severe cases',
        'Ensure adequate medication supply for potential repeat treatments'
      ],
      safetyNotes: [
        'Complete documentation protects patient and provider',
        'Clear communication ensures continuity of care',
        'Some patients may need multiple treatments during transport'
      ]
    }
  ],

  // 62. ADULT CHOKING WITHOUT EQUIPMENT - Basic life support for airway obstruction
  'adult-choking-without-equipment': [
    {
      id: 'choking-step-1',
      stepNumber: 1,
      title: 'Recognition and Initial Assessment',
      description: 'Recognize signs of airway obstruction and assess severity',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Look for universal choking sign - hands clutching throat',
        'Ask "Are you choking?" - inability to speak indicates complete obstruction',
        'Assess for severe distress: inability to cough, speak, or breathe effectively',
        'Check for partial vs complete airway obstruction',
        'Partial obstruction: strong cough, able to speak, some air movement',
        'Complete obstruction: unable to speak, weak/absent cough, cyanosis',
        'Observe patient position - may be leaning forward, panicked appearance',
        'Act immediately for complete obstruction - time is critical'
      ],
      contraindications: [
        'Do not interfere with effective coughing in partial obstruction',
        'Do not perform abdominal thrusts on unconscious patients',
        'Avoid back blows in conscious adults (not recommended by AHA)'
      ],
      safetyNotes: [
        'Complete airway obstruction is a medical emergency',
        'Patient may lose consciousness rapidly',
        'Be prepared to provide CPR if patient becomes unconscious'
      ],
      equipmentNeeded: ['None required for basic technique', 'Phone for emergency services activation']
    },
    {
      id: 'choking-step-2',
      stepNumber: 2,
      title: 'Patient Positioning and Preparation',
      description: 'Position patient appropriately for abdominal thrust technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Stand behind the patient if they are standing or sitting',
        'Wrap your arms around patient\'s waist from behind',
        'Position yourself to the side if patient is in wheelchair',
        'Make a fist with one hand, thumb side against patient\'s abdomen',
        'Place fist slightly above navel and well below breastbone',
        'Grasp fist with other hand to provide leverage',
        'Ensure patient is stable and supported',
        'Have patient lean slightly forward to help dislodge object'
      ],
      safetyNotes: [
        'Proper positioning is crucial for effective thrusts',
        'Avoid applying pressure directly over ribs or breastbone',
        'Support patient to prevent falls during procedure'
      ],
      equipmentNeeded: ['Clear area around patient', 'Stable surface for support if needed']
    },
    {
      id: 'choking-step-3',
      stepNumber: 3,
      title: 'Abdominal Thrust Technique (Heimlich Maneuver)',
      description: 'Perform abdominal thrusts using correct technique and force',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Make quick, upward thrusts into the abdomen',
        'Use firm, deliberate pressure directed upward toward diaphragm',
        'Each thrust should be separate and distinct movement',
        'Apply enough force to generate artificial cough',
        'Continue thrusts until object is expelled or patient becomes unconscious',
        'Check mouth between thrusts for visible object',
        'Encourage patient to cough if object partially dislodged',
        'Be prepared for patient to vomit after successful removal'
      ],
      contraindications: [
        'Do not use excessive force that could cause injury',
        'Modify technique for pregnant or obese patients (chest thrusts)',
        'Stop if patient becomes unconscious - begin CPR protocol'
      ],
      safetyNotes: [
        'Abdominal thrusts can cause internal injuries - use appropriate force',
        'May cause rib fractures or organ injury even when performed correctly',
        'Patient should be evaluated medically after successful removal'
      ],
      equipmentNeeded: ['None required', 'Have phone ready to call for medical evaluation']
    },
    {
      id: 'choking-step-4',
      stepNumber: 4,
      title: 'Modified Technique for Special Populations',
      description: 'Apply appropriate modifications for pregnant or obese patients',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'PREGNANT PATIENTS: Use chest thrusts instead of abdominal thrusts',
        'Position hands on lower half of breastbone, between nipples',
        'Apply firm, quick thrusts straight back toward spine',
        'OBESE PATIENTS: May require chest thrusts if unable to wrap arms around abdomen',
        'Stand behind patient and place arms under patient\'s armpits',
        'Position hands on breastbone and perform chest thrusts',
        'SEATED PATIENTS: Stand behind chair and perform abdominal thrusts',
        'Modify positioning but maintain same thrust technique'
      ],
      safetyNotes: [
        'Chest thrusts carry risk of rib fracture',
        'Pregnant patients require immediate medical evaluation after incident',
        'Adjust force appropriately for patient size and condition'
      ],
      equipmentNeeded: ['Stable chair if patient seated', 'Clear space for proper positioning']
    },
    {
      id: 'choking-step-5',
      stepNumber: 5,
      title: 'Transition to CPR if Patient Becomes Unconscious',
      description: 'Recognize unconsciousness and transition to CPR protocol',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'If patient loses consciousness, help them to ground safely',
        'Position patient supine on firm, flat surface',
        'Call for emergency medical services immediately',
        'Open airway and look for visible foreign object',
        'Remove visible objects with finger sweep (only if visible)',
        'Attempt rescue breathing - if unsuccessful, begin chest compressions',
        'Do not check for pulse - begin CPR immediately',
        'Each time you open airway, look for and remove visible objects'
      ],
      contraindications: [
        'Do not perform blind finger sweeps - may push object deeper',
        'Do not attempt ventilation if object clearly visible in airway'
      ],
      safetyNotes: [
        'Unconscious choking patients require immediate CPR',
        'Chest compressions may help dislodge foreign object',
        'Continue CPR until object expelled or EMS arrives'
      ],
      equipmentNeeded: ['Firm surface for CPR', 'Phone for EMS activation', 'Barrier device for rescue breathing if available']
    },
    {
      id: 'choking-step-6',
      stepNumber: 6,
      title: 'Post-Obstruction Care and Assessment',
      description: 'Provide care after successful foreign object removal',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Once object is expelled, monitor patient\'s breathing and color',
        'Encourage patient to remain calm and breathe normally',
        'Assess for signs of respiratory distress or continued obstruction',
        'Check for injuries from abdominal thrusts: pain, tenderness',
        'Monitor for vomiting - turn patient to side if occurs',
        'Keep object that was removed for medical evaluation if possible',
        'Provide reassurance and emotional support to patient',
        'Recommend medical evaluation even after successful removal'
      ],
      safetyNotes: [
        'Patient may have sustained injuries from thrusts or hypoxia',
        'Residual swelling or trauma may cause delayed airway problems',
        'Medical evaluation recommended even after successful treatment'
      ],
      equipmentNeeded: ['Container to save expelled object', 'Position for recovery if needed', 'Comfort measures']
    },
    {
      id: 'choking-step-7',
      stepNumber: 7,
      title: 'Complications Recognition and Management',
      description: 'Identify and manage potential complications from choking incident',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'Monitor for signs of internal injury: abdominal pain, bruising, tenderness',
        'Assess for rib fractures: pain with breathing, point tenderness',
        'Watch for delayed respiratory distress or partial obstruction',
        'Check for aspiration: coughing, fever, respiratory symptoms',
        'Monitor vital signs: blood pressure, pulse, respiratory rate',
        'Look for signs of hypoxic injury: confusion, altered mental status',
        'Assess for psychological trauma: anxiety, panic, emotional distress',
        'Document incident details for medical providers'
      ],
      contraindications: [
        'Do not dismiss ongoing symptoms as minor',
        'Do not delay medical evaluation if any concerning signs present'
      ],
      safetyNotes: [
        'Complications may not be immediately apparent',
        'Internal injuries can be serious even without obvious external signs',
        'Hypoxic injury can cause delayed neurological problems'
      ],
      equipmentNeeded: ['Monitoring equipment if available', 'Documentation materials', 'Communication device for medical consultation']
    },
    {
      id: 'choking-step-8',
      stepNumber: 8,
      title: 'Documentation and Follow-up Planning',
      description: 'Document incident and ensure appropriate medical follow-up',
      isRequired: true,
      isCritical: true,
      timeEstimate: 300,
      keyPoints: [
        'Document time and circumstances of choking incident',
        'Record object involved, technique used, and number of thrusts performed',
        'Note patient response and time to object removal',
        'Document any complications or injuries noted',
        'Record vital signs and patient condition post-incident',
        'Provide clear instructions for seeking medical care',
        'Inform patient of signs and symptoms requiring immediate attention',
        'Ensure patient has transportation to medical facility if recommended'
      ],
      safetyNotes: [
        'Thorough documentation important for medical continuity',
        'Follow-up medical care may identify delayed complications',
        'Clear instructions help patient recognize when to seek help'
      ],
      equipmentNeeded: ['Documentation forms', 'Emergency contact information', 'Transportation arrangements if needed']
    }
  ]
};

export default enhancedCriticalSkillSteps;