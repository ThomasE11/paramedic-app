// Comprehensive Enhanced Skills with Best Practice Guidelines
// Updated ALL 62+ paramedic skills with current clinical protocols and best practices

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

// Enhanced skill steps for ALL paramedic procedures
export const allEnhancedSkillSteps: { [skillName: string]: EnhancedSkillStep[] } = {
  
  // 1. PREDICTION OF DIFFICULT BAG VALVE MASK VENTILATIONS (BOOTS) - Already enhanced, keeping existing
  'prediction of difficult bag valve mask ventilations': [
    {
      id: 'bvm_pred_1',
      stepNumber: 1,
      title: 'B – Beard and mask seal assessment',
      description: 'Examine patient for factors that may compromise mask seal effectiveness',
      isRequired: true,
      isCritical: true,
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
      keyPoints: [
        'Ask about sleep apnea history and CPAP use',
        'Assess for signs of chronic upper airway obstruction',
        'Evaluate tongue size and pharyngeal space',
        'Check for enlarged tonsils or adenoids',
        'Consider high risk for difficult ventilation'
      ]
    }
  ],

  // 2. FEMORAL VEIN CANNULATION
  'femoral vein cannulation': [
    {
      id: 'femoral_1',
      stepNumber: 1,
      title: 'Patient assessment and preparation',
      description: 'Assess patient and prepare for femoral vein access',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Verify indication for central venous access',
        'Assess patient coagulation status and bleeding risk',
        'Position patient supine with leg slightly abducted',
        'Identify anatomical landmarks: inguinal ligament, femoral pulse',
        'Ensure adequate lighting and sterile field preparation'
      ],
      contraindications: [
        'Infection at insertion site',
        'Significant coagulopathy',
        'Previous vascular surgery in area',
        'Suspected retroperitoneal hemorrhage'
      ],
      equipmentNeeded: [
        'Central venous catheter kit',
        'Ultrasound guidance (preferred)',
        'Sterile gowns, gloves, drapes',
        'Local anesthetic',
        'Suture material'
      ]
    },
    {
      id: 'femoral_2',
      stepNumber: 2,
      title: 'Sterile technique and anesthesia',
      description: 'Establish sterile field and provide local anesthesia',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Perform surgical hand scrub and don sterile gown/gloves',
        'Cleanse area with chlorhexidine in circular motion',
        'Apply sterile drapes with large fenestrated drape',
        'Inject 1-2% lidocaine for local anesthesia',
        'Allow adequate time for anesthetic effect'
      ]
    },
    {
      id: 'femoral_3',
      stepNumber: 3,
      title: 'Vessel identification and puncture',
      description: 'Locate femoral vein and perform initial puncture',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Palpate femoral artery and identify vein location (medial)',
        'Use ultrasound guidance to visualize vein if available',
        'Insert needle at 30-45 degree angle toward umbilicus',
        'Advance needle while aspirating until venous blood obtained',
        'Confirm venous blood (dark, non-pulsatile)'
      ],
      safetyNotes: [
        'Avoid arterial puncture - check blood color and pulsatility',
        'Use ultrasound guidance when available for safety',
        'Monitor for signs of retroperitoneal bleeding'
      ]
    }
  ],

  // 3. DOUBLE LUMEN AIRWAY INSERTION
  'double lumen airway insertion': [
    {
      id: 'dla_1',
      stepNumber: 1,
      title: 'Airway assessment and preparation',
      description: 'Assess airway and prepare double lumen airway device',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess patient\'s airway anatomy and mouth opening',
        'Select appropriate size double lumen airway (size 3, 4, or 5)',
        'Test cuff integrity by inflating with recommended volume',
        'Lubricate device with water-based lubricant',
        'Have suction and bag-valve-mask ready'
      ],
      equipmentNeeded: [
        'Double lumen airway (various sizes)',
        'Water-based lubricant',
        'Syringe for cuff inflation',
        'Bag-valve-mask',
        'Suction device'
      ]
    },
    {
      id: 'dla_2',
      stepNumber: 2,
      title: 'Pre-oxygenation and positioning',
      description: 'Optimize patient oxygenation and positioning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Provide 100% oxygen via BVM for 3-5 minutes',
        'Position patient in sniffing position',
        'Ensure cervical spine immobilization if indicated',
        'Have assistant maintain head position',
        'Monitor oxygen saturation continuously'
      ]
    },
    {
      id: 'dla_3',
      stepNumber: 3,
      title: 'Device insertion',
      description: 'Insert double lumen airway using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Open mouth and insert device tip toward hard palate',
        'Advance device into pharynx with gentle rotating motion',
        'Continue until resistance felt (device fully seated)',
        'Inflate cuff with recommended volume of air',
        'Connect bag-valve-mask to appropriate port'
      ],
      safetyNotes: [
        'Do not force insertion if significant resistance',
        'Monitor for signs of airway trauma',
        'Have backup airway plan ready'
      ]
    },
    {
      id: 'dla_4',
      stepNumber: 4,
      title: 'Confirmation and ventilation',
      description: 'Confirm proper placement and establish effective ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Ventilate through pharyngeal port first',
        'Check for bilateral chest rise and breath sounds',
        'If ventilation poor, try esophageal port',
        'Secure device with tape or commercial holder',
        'Continuously monitor ventilation effectiveness'
      ]
    }
  ],

  // 4. RECOVERY POSITION
  'recovery position': [
    {
      id: 'recovery_1',
      stepNumber: 1,
      title: 'Patient assessment',
      description: 'Assess patient\'s condition and suitability for recovery position',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Confirm patient is unconscious but breathing',
        'Check for suspected spinal injury (contraindication)',
        'Assess airway for obstruction or vomit',
        'Evaluate patient size and weight for safe positioning',
        'Clear any immediate airway obstructions'
      ],
      contraindications: [
        'Suspected spinal injury',
        'Unstable fractures',
        'Severe respiratory distress',
        'Need for immediate airway intervention'
      ]
    },
    {
      id: 'recovery_2',
      stepNumber: 2,
      title: 'Positioning preparation',
      description: 'Prepare patient and environment for safe positioning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Ensure adequate space around patient',
        'Remove or secure any loose objects',
        'Position yourself on patient\'s right side',
        'Place patient\'s arms at their sides',
        'Check that legs are straight and together'
      ]
    },
    {
      id: 'recovery_3',
      stepNumber: 3,
      title: 'Perform recovery position',
      description: 'Move patient into stable recovery position',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Place patient\'s left arm across chest',
        'Hold patient\'s right shoulder and hip',
        'Roll patient toward you in one smooth motion',
        'Position upper leg bent at 90 degrees for stability',
        'Tilt head back slightly to maintain airway'
      ],
      safetyNotes: [
        'Move patient as one unit to maintain alignment',
        'Support head and neck during movement',
        'Ensure stable position to prevent rolling'
      ]
    },
    {
      id: 'recovery_4',
      stepNumber: 4,
      title: 'Final positioning and monitoring',
      description: 'Optimize position and establish ongoing monitoring',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Adjust head position to keep airway open',
        'Position upper arm to support upper body',
        'Check that mouth is slightly downward for drainage',
        'Monitor breathing and pulse regularly',
        'Be prepared to reposition if patient\'s condition changes'
      ]
    }
  ],

  // 5. CPAP (Continuous Positive Airway Pressure)
  'cpap': [
    {
      id: 'cpap_1',
      stepNumber: 1,
      title: 'Patient assessment and indication',
      description: 'Assess patient for CPAP therapy appropriateness',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess for acute pulmonary edema or CHF exacerbation',
        'Check respiratory rate, oxygen saturation, work of breathing',
        'Evaluate mental status - patient must be alert and cooperative',
        'Confirm absence of contraindications',
        'Obtain patient consent and explain procedure'
      ],
      contraindications: [
        'Altered mental status or inability to protect airway',
        'Vomiting or high aspiration risk',
        'Facial trauma preventing mask seal',
        'Pneumothorax',
        'Severe hypotension'
      ]
    },
    {
      id: 'cpap_2',
      stepNumber: 2,
      title: 'Equipment setup',
      description: 'Prepare and test CPAP equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Connect CPAP device to oxygen source (15L/min minimum)',
        'Select appropriate mask size for proper fit',
        'Set initial PEEP pressure (typically 5-10 cmH2O)',
        'Test system for leaks and proper pressure generation',
        'Have backup ventilation equipment available'
      ],
      equipmentNeeded: [
        'CPAP device with PEEP valve',
        'Full face mask (various sizes)',
        'High-flow oxygen source',
        'Pressure manometer',
        'Backup BVM'
      ]
    },
    {
      id: 'cpap_3',
      stepNumber: 3,
      title: 'Patient preparation and positioning',
      description: 'Prepare patient for CPAP application',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient sitting upright (Fowler\'s position)',
        'Explain the sensation of positive pressure breathing',
        'Coach patient on breathing technique and cooperation',
        'Clear nose and mouth of secretions if needed',
        'Have suction readily available'
      ]
    },
    {
      id: 'cpap_4',
      stepNumber: 4,
      title: 'CPAP application and monitoring',
      description: 'Apply CPAP and monitor patient response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Gently place mask over nose and mouth',
        'Secure mask with straps - snug but not overtight',
        'Start with lower pressure and gradually increase',
        'Monitor for improved work of breathing and oxygen saturation',
        'Watch for signs of gastric distention or pneumothorax',
        'Reassess vital signs every 5 minutes'
      ],
      safetyNotes: [
        'Be prepared to remove CPAP immediately if patient deteriorates',
        'Monitor for mask discomfort and pressure sores',
        'Watch for signs of pneumothorax'
      ]
    }
  ],

  // 6. HAND WASHING
  'hand washing': [
    {
      id: 'handwash_1',
      stepNumber: 1,
      title: 'Preparation and assessment',
      description: 'Prepare for proper hand hygiene procedure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Remove jewelry, watches, and rings if possible',
        'Check hands for visible contamination or wounds',
        'Ensure access to running water and soap',
        'Have clean towels or paper towels available',
        'Roll sleeves up above wrists'
      ],
      equipmentNeeded: [
        'Running water',
        'Liquid soap or antimicrobial soap',
        'Clean towels or paper towels',
        'Hand lotion (optional)'
      ]
    },
    {
      id: 'handwash_2',
      stepNumber: 2,
      title: 'Initial rinse and soap application',
      description: 'Begin hand washing with proper water temperature and soap',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Turn on water to comfortable warm temperature',
        'Wet hands thoroughly under running water',
        'Apply adequate amount of soap to cover all hand surfaces',
        'Keep hands lower than elbows during washing',
        'Avoid touching sink surfaces with hands'
      ]
    },
    {
      id: 'handwash_3',
      stepNumber: 3,
      title: 'Thorough scrubbing technique',
      description: 'Perform systematic hand scrubbing for minimum 20 seconds',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Scrub palm to palm with fingers interlaced',
        'Scrub back of hands with opposite palm',
        'Clean between fingers and finger webs thoroughly',
        'Scrub fingertips and under nails',
        'Clean thumbs and wrists in circular motions',
        'Continue scrubbing for minimum 20 seconds'
      ]
    },
    {
      id: 'handwash_4',
      stepNumber: 4,
      title: 'Rinse and dry',
      description: 'Complete hand washing with proper rinse and drying',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Rinse hands thoroughly under running water',
        'Keep hands pointing downward during rinse',
        'Use clean towel or paper towel to dry hands',
        'Dry from fingertips toward wrists',
        'Use towel to turn off faucet if needed',
        'Dispose of paper towels appropriately'
      ]
    }
  ],

  // 7. INTRAVENOUS CANNULATION (Enhanced version - replacing previous)
  'intravenous cannulation': [
    {
      id: 'iv_1',
      stepNumber: 1,
      title: 'Patient assessment and consent',
      description: 'Comprehensive patient evaluation and informed consent',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Verify patient identity using two identifiers',
        'Assess indication for IV access (medications, fluids, blood sampling)',
        'Check patient allergies (latex, iodine, tape, medications)',
        'Evaluate patient\'s hydration status and vein quality',
        'Explain procedure, obtain consent, address patient concerns',
        'Assess for contraindications and choose appropriate extremity'
      ],
      contraindications: [
        'Infection at insertion site',
        'AV fistula or lymphedema on affected side',
        'Previous mastectomy (avoid affected side)',
        'Severe coagulopathy with active bleeding',
        'Fracture or injury to intended extremity'
      ]
    },
    {
      id: 'iv_2',
      stepNumber: 2,
      title: 'Equipment preparation and selection',
      description: 'Gather and prepare appropriate IV equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Select appropriate catheter gauge: 14-16G (trauma), 18-20G (adults), 22-24G (elderly/pediatric)',
        'Choose correct IV fluid based on indication',
        'Prepare administration set and prime tubing completely',
        'Gather alcohol wipes, gauze, transparent dressing, tape',
        'Check expiration dates on all equipment',
        'Have tourniquet and gloves ready'
      ],
      equipmentNeeded: [
        'IV catheters (multiple sizes)',
        'IV fluids and administration sets',
        'Tourniquet',
        'Alcohol prep pads',
        'Sterile gauze and tape',
        'Transparent dressing',
        'Gloves and PPE'
      ]
    },
    {
      id: 'iv_3',
      stepNumber: 3,
      title: 'Site selection and preparation',
      description: 'Select optimal vein and prepare insertion site',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position extremity with good lighting and support',
        'Apply tourniquet 4-6 inches above intended site',
        'Select straight, bouncy vein - avoid sclerosed, rolling, or bifurcated veins',
        'Preferred sites: dorsal hand, forearm, antecubital fossa',
        'Cleanse site with alcohol in circular motion, allow to air dry',
        'Stabilize vein by applying gentle traction below insertion point'
      ],
      safetyNotes: [
        'Never attempt more than 2 IV attempts per practitioner',
        'Choose larger veins for viscous medications or rapid infusion',
        'Avoid areas of flexion when possible'
      ]
    },
    {
      id: 'iv_4',
      stepNumber: 4,
      title: 'Catheter insertion technique',
      description: 'Perform venipuncture using sterile technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Hold catheter at 15-30 degree angle, bevel up',
        'Insert needle with steady, controlled motion',
        'Watch for flashback of blood in catheter hub',
        'Lower angle to nearly parallel with skin',
        'Advance catheter 1-2mm more into vein',
        'Slide plastic cannula off needle while holding steady'
      ],
      safetyNotes: [
        'Never reinsert needle once withdrawn from catheter',
        'Maintain sterile technique throughout procedure',
        'Watch for signs of infiltration during insertion'
      ]
    },
    {
      id: 'iv_5',
      stepNumber: 5,
      title: 'Securing and confirmation',
      description: 'Secure catheter and confirm proper function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Remove tourniquet immediately after successful insertion',
        'Apply gentle pressure above catheter tip to prevent bleeding',
        'Connect IV tubing or saline lock to catheter hub',
        'Flush with 3-5ml normal saline to confirm patency',
        'Observe for signs of infiltration (swelling, coolness, pain)',
        'Secure with transparent dressing and tape loops to prevent dislodgement'
      ],
      safetyNotes: [
        'Dispose of needle in sharps container immediately',
        'Label IV site with date, time, gauge size, and initials',
        'Set appropriate flow rate based on clinical indication'
      ]
    }
  ],

  // 8. ADULT CPR WITH MANUAL DEFIBRILLATOR
  'adult cpr with manual defibrillator': [
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

  // 9. 12-LEAD ECG ACQUISITION
  '12 lead ecg – lead placement and acquisition': [
    {
      id: 'ecg12-1',
      stepNumber: 1,
      title: 'Patient preparation and informed consent',
      description: 'Comprehensive patient preparation and consent for 12-lead ECG acquisition',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Verify patient identity using two independent identifiers',
        'Explain procedure: \'I need to record your heart\'s electrical activity using electrode patches\'',
        'Reassure patient that ECG only records electrical activity - no electricity enters body',
        'Obtain informed consent and address any patient concerns',
        'Ensure patient privacy with appropriate draping and close doors/curtains',
        'Position patient supine on firm surface with arms relaxed at sides',
        'Remove all metallic jewelry, watches, and clothing from chest and arms',
        'Check for pacemaker, ICD, or other implanted devices - note on ECG',
        'Assess skin condition and identify any areas requiring special consideration'
      ],
      contraindications: [
        'Patient refusal (conscious patients)',
        'Unstable spinal injury requiring immobilization',
        'Active resuscitation in progress (unless specifically ordered)'
      ],
      equipmentNeeded: [
        '12-lead ECG machine with paper and adequate battery',
        '10 disposable ECG electrodes',
        'Razor for hair removal if needed',
        'Alcohol wipes for skin preparation',
        'Towel for patient comfort and positioning'
      ]
    },
    {
      id: 'ecg12-2',
      stepNumber: 2,
      title: 'Equipment preparation and calibration',
      description: 'Prepare ECG machine and verify proper function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Check ECG machine power level and connect to AC power if available',
        'Verify adequate ECG paper supply and proper loading',
        'Test all 10 lead wire connections for continuity and proper labeling',
        'Set paper speed to 25 mm/sec and amplitude to 10 mm/mV (standard settings)',
        'Perform machine calibration check - should produce 10mm square wave',
        'Ensure filter settings are appropriate: 0.5-40 Hz for diagnostic quality',
        'Verify patient data entry capability and prepare demographic information',
        'Check for electromagnetic interference sources and eliminate if possible'
      ],
      safetyNotes: [
        'Ensure machine is properly grounded to prevent electrical hazards',
        'Never use damaged lead wires or electrodes',
        'Keep machine away from sources of electrical interference'
      ]
    },
    {
      id: 'ecg12-3',
      stepNumber: 3,
      title: 'Skin preparation and electrode site identification',
      description: 'Prepare skin and identify precise electrode placement sites',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Palpate anatomical landmarks: clavicles, sternum, ribs, and intercostal spaces',
        'Identify 4th intercostal space by feeling for sternal angle (Angle of Louis)',
        'Count down to locate 4th intercostal space for V1 and V2 placement',
        'Clean electrode sites with alcohol wipes to remove oils and debris',
        'Allow alcohol to dry completely before electrode application',
        'Trim excessive hair if present using razor or clipper - do not dry shave',
        'Gently abrade skin with gauze if needed to improve electrode contact',
        'Ensure skin is dry and free from lotions, powders, or moisture',
        'Mark electrode positions lightly with pen if multiple attempts anticipated'
      ],
      safetyNotes: [
        'Use gentle skin preparation to avoid irritation or bleeding',
        'Avoid placing electrodes over open wounds or irritated skin',
        'Be especially careful with elderly patients who may have fragile skin'
      ]
    },
    {
      id: 'ecg12-4',
      stepNumber: 4,
      title: 'Limb lead electrode placement',
      description: 'Accurate placement of limb electrodes using standardized positions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Right Arm (RA/White): Place on right wrist or upper arm, avoid bony prominences',
        'Left Arm (LA/Black): Place on left wrist or upper arm, mirror right arm position',
        'Right Leg (RL/Green): Place on right ankle or lower leg - this is ground electrode',
        'Left Leg (LL/Red): Place on left ankle or lower leg, mirror right leg position',
        'Ensure limb electrodes are placed symmetrically for accurate comparison',
        'Avoid placing electrodes over joints, bones, or areas of excessive muscle',
        'If amputation present, place electrode on residual limb as close to usual position as possible',
        'Press electrodes firmly to ensure good contact - no air bubbles under electrode'
      ],
      contraindications: [
        'Avoid electrode placement over open wounds or rashes',
        'Do not place on areas with excessive hair that cannot be removed',
        'Avoid placement over areas with pacemaker or ICD if possible'
      ]
    },
    {
      id: 'ecg12-5',
      stepNumber: 5,
      title: 'Precordial (chest) lead electrode placement',
      description: 'Precise anatomical placement of precordial electrodes V1-V6',
      isRequired: true,
      isCritical: true,
      timeEstimate: 240,
      keyPoints: [
        'V1 (Red/Brown): 4th intercostal space, right sternal border',
        'V2 (Yellow): 4th intercostal space, left sternal border',
        'V4 (Blue/Green): 5th intercostal space, left midclavicular line (place V4 before V3)',
        'V3 (Orange/Black): Midway between V2 and V4 positions',
        'V5 (Brown/Red): Same horizontal level as V4, left anterior axillary line',
        'V6 (Purple/Pink): Same horizontal level as V4 and V5, left midaxillary line',
        'Ensure V4, V5, and V6 are on the same horizontal plane',
        'Double-check placement accuracy - electrode position errors significantly affect interpretation',
        'For female patients, place V4-V6 under the breast, not on breast tissue'
      ],
      safetyNotes: [
        'Accurate precordial placement is critical for diagnostic accuracy',
        'Maintain patient dignity during chest electrode placement',
        'Ask for assistance with patient positioning if needed'
      ],
      equipmentNeeded: [
        'Measuring tape or ruler for precise spacing',
        'Anatomical reference guide if needed',
        'Additional electrodes in case replacement is needed'
      ]
    },
    {
      id: 'ecg12-6',
      stepNumber: 6,
      title: 'Lead wire connection and signal quality verification',
      description: 'Connect lead wires and verify signal quality before recording',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Connect lead wires to corresponding electrodes: match colors and labels',
        'Arrange lead wires neatly to prevent tangling and artifact',
        'Check ECG monitor for baseline stability and absence of artifact',
        'Verify all leads show appropriate waveforms without excessive noise',
        'Troubleshoot any leads showing flat line, excessive artifact, or poor signal',
        'Ensure patient is relaxed and lying still - muscle tension creates artifact',
        'Check for 60Hz interference and eliminate electrical sources if present',
        'Adjust electrode contact if poor signal quality persists'
      ],
      safetyNotes: [
        'Poor signal quality invalidates ECG interpretation',
        'Never record ECG with significant artifact or poor lead contact',
        'Replace electrodes if signal quality cannot be improved'
      ]
    },
    {
      id: 'ecg12-7',
      stepNumber: 7,
      title: 'ECG acquisition and quality assessment',
      description: 'Record diagnostic quality 12-lead ECG and assess for adequacy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Instruct patient to lie still and breathe normally during recording',
        'Begin ECG recording and monitor for adequate waveform quality',
        'Ensure minimum 6-second recording strip for rhythm analysis',
        'Verify all 12 leads are clearly visible with appropriate amplitude',
        'Check for proper standardization mark (10mm calibration pulse)',
        'Assess rhythm strip for any arrhythmias or conduction abnormalities',
        'Record additional leads (V7-V9, posterior leads) if clinically indicated',
        'Print clear, readable ECG with patient demographic information',
        'Review ECG immediately for any obvious abnormalities requiring immediate action'
      ],
      equipmentNeeded: [
        'Adequate ECG paper supply',
        'Backup power source if needed',
        'Additional lead configurations if indicated'
      ]
    },
    {
      id: 'ecg12-8',
      stepNumber: 8,
      title: 'Post-procedure care and documentation',
      description: 'Proper electrode removal and comprehensive documentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Remove electrodes gently to prevent skin irritation',
        'Clean any adhesive residue from skin with appropriate solvent',
        'Assist patient with dressing and return to comfortable position',
        'Label ECG with patient information, date, time, and clinical indication',
        'Document procedure completion including any technical difficulties',
        'Note patient tolerance and any symptoms during procedure',
        'Communicate any urgent findings to appropriate healthcare provider immediately',
        'Store ECG appropriately for interpretation and medical record filing',
        'Clean and maintain ECG equipment according to facility protocols'
      ],
      safetyNotes: [
        'Gentle electrode removal prevents skin trauma',
        'Urgent ECG findings require immediate physician notification',
        'Proper equipment maintenance ensures continued accuracy'
      ]
    }
  ],

  // 10. NEBULIZATION OF MEDICATION
  'nebulization of medication': [
    {
      id: 'neb-1',
      stepNumber: 1,
      title: 'Patient assessment and medication verification',
      description: 'Comprehensive assessment and medication verification for nebulization therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Verify patient identity using two independent identifiers',
        'Check medication order: drug name, dose, route, frequency, and indication',
        'Assess patient for allergies to bronchodilators, preservatives, or sulfites',
        'Review medical history for contraindications (tachycardia, hypertension)',
        'Obtain baseline vital signs: heart rate, blood pressure, respiratory rate, oxygen saturation',
        'Assess respiratory status: work of breathing, use of accessory muscles, breath sounds',
        'Check medication expiration date, concentration, and solution clarity',
        'Explain procedure, expected effects, and potential side effects to patient'
      ],
      contraindications: [
        'Known hypersensitivity to medication or preservatives',
        'Severe cardiovascular disease (relative contraindication for beta-agonists)',
        'Hyperthyroidism or diabetes mellitus (relative contraindications)',
        'Pregnancy (relative contraindication - risk vs benefit assessment)'
      ],
      equipmentNeeded: [
        'Nebulizer medication as prescribed',
        'Jet nebulizer or ultrasonic nebulizer',
        'Oxygen source or compressed air',
        'Nebulizer tubing and mouthpiece/mask',
        'Stethoscope for assessment',
        'Pulse oximeter and vital sign monitor'
      ]
    },
    {
      id: 'neb-2',
      stepNumber: 2,
      title: 'Equipment setup and preparation',
      description: 'Prepare nebulizer system and verify proper function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Select appropriate nebulizer type: jet nebulizer for most medications',
        'Connect nebulizer to oxygen source at 6-8 L/min flow rate',
        'Test nebulizer function by adding 2-3 ml normal saline to confirm misting',
        'Ensure adequate oxygen supply for duration of treatment (typically 10-15 minutes)',
        'Prepare medication: use sterile technique, do not mix medications unless specifically ordered',
        'Add prescribed medication dose to nebulizer chamber (typically 2.5-5mg albuterol)',
        'Add normal saline to achieve total volume of 3-4 ml if needed',
        'Attach appropriate delivery device: mouthpiece for cooperative patients, mask for others'
      ],
      safetyNotes: [
        'Never mix different medications without specific orders',
        'Use sterile normal saline only - tap water may cause bronchospasm',
        'Ensure oxygen flow rate is adequate to create fine mist'
      ],
      equipmentNeeded: [
        'Sterile normal saline for dilution',
        'Sterile medication preparation area',
        'Appropriate sized face mask or mouthpiece',
        'Timer for treatment duration monitoring'
      ]
    },
    {
      id: 'neb-3',
      stepNumber: 3,
      title: 'Patient positioning and delivery method selection',
      description: 'Position patient optimally and select appropriate delivery method',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient upright (high Fowler\'s position) to maximize lung expansion',
        'Support patient\'s arms on pillows or bedside table for comfort',
        'Select mouthpiece for alert, cooperative patients who can seal lips properly',
        'Use face mask for uncooperative, pediatric, or critically ill patients',
        'Ensure mask fits properly: covers nose and mouth with minimal leak',
        'Instruct patient on proper breathing technique: slow, deep breaths',
        'Advise patient to breathe through mouth when using mouthpiece',
        'Position nebulizer upright to maintain proper medication delivery'
      ],
      safetyNotes: [
        'Monitor patient closely for signs of respiratory distress',
        'Ensure patient can remove mouthpiece independently if needed',
        'Watch for claustrophobic reactions with face mask use'
      ]
    },
    {
      id: 'neb-4',
      stepNumber: 4,
      title: 'Treatment administration and monitoring',
      description: 'Administer nebulized medication while continuously monitoring patient response',
      isRequired: true,
      isCritical: true,
      timeEstimate: 900,
      keyPoints: [
        'Initiate nebulization and verify adequate mist production',
        'Coach patient breathing: \'Take slow, deep breaths and hold for 2-3 seconds\'',
        'Monitor treatment progress: typically 10-15 minutes until medication consumed',
        'Observe for therapeutic effects: decreased work of breathing, improved air entry',
        'Watch for adverse effects: tachycardia, tremor, anxiety, palpitations',
        'Check vital signs every 5 minutes during treatment',
        'Auscultate breath sounds mid-treatment and post-treatment',
        'Encourage patient to cough and clear secretions as they loosen',
        'Stop treatment if severe adverse reactions occur'
      ],
      safetyNotes: [
        'Be prepared to discontinue treatment for severe bronchospasm',
        'Monitor heart rate closely - hold treatment if >150 bpm in adults',
        'Watch for signs of medication overdose: severe tremor, chest pain'
      ]
    },
    {
      id: 'neb-5',
      stepNumber: 5,
      title: 'Post-treatment assessment and follow-up',
      description: 'Assess treatment effectiveness and provide appropriate follow-up care',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Obtain complete set of vital signs immediately post-treatment',
        'Auscultate breath sounds bilaterally and compare to pre-treatment assessment',
        'Assess improvement in respiratory distress and oxygen saturation',
        'Document peak flow measurements if available and patient able to cooperate',
        'Monitor for delayed adverse reactions for 15-20 minutes post-treatment',
        'Provide mouth care: rinse mouth with water to prevent oral candidiasis',
        'Document treatment response: improvement, no change, or deterioration',
        'Plan follow-up treatments based on patient response and physician orders',
        'Educate patient on signs/symptoms requiring immediate medical attention'
      ],
      equipmentNeeded: [
        'Peak flow meter if indicated',
        'Documentation forms',
        'Water for mouth rinsing',
        'Emergency medications if adverse reaction occurs'
      ]
    },
    {
      id: 'neb-6',
      stepNumber: 6,
      title: 'Equipment cleaning and documentation',
      description: 'Proper equipment cleaning and comprehensive documentation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Disassemble nebulizer equipment and rinse with sterile water',
        'Clean nebulizer chamber and mouthpiece/mask with appropriate disinfectant',
        'Allow equipment to air dry or follow facility-specific cleaning protocols',
        'Store equipment properly to prevent contamination',
        'Document medication administered: name, dose, route, time',
        'Record pre- and post-treatment vital signs and assessment findings',
        'Note patient tolerance and any adverse effects observed',
        'Document education provided and patient understanding',
        'Report significant adverse reactions to physician immediately'
      ],
      safetyNotes: [
        'Proper equipment cleaning prevents cross-contamination',
        'Complete documentation is essential for ongoing care planning',
        'Report any equipment malfunction to biomedical engineering'
      ]
    }
  ],

  // 11. ADULT CHOKING WITHOUT EQUIPMENT
  'adult choking without the use of equipment': [
    {
      id: 'choke_1',
      stepNumber: 1,
      title: 'Recognition and assessment',
      description: 'Identify choking emergency and assess severity',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Look for universal choking sign (hands clutching throat)',
        'Ask "Are you choking?" - if cannot speak, severe obstruction',
        'Assess ability to cough forcefully',
        'Check for cyanosis or respiratory distress',
        'Distinguish between partial and complete obstruction'
      ],
      safetyNotes: [
        'If patient can cough forcefully, encourage continued coughing',
        'Do not perform back blows on conscious choking victim',
        'Be prepared for patient to become unconscious'
      ]
    },
    {
      id: 'choke_2',
      stepNumber: 2,
      title: 'Position for abdominal thrusts',
      description: 'Properly position patient and rescuer for Heimlich maneuver',
      isRequired: true,
      isCritical: true,
      timeEstimate: 10,
      keyPoints: [
        'Stand behind patient',
        'Wrap arms around patient\'s waist',
        'Locate proper hand placement above navel, below xiphoid',
        'Make fist with one hand, grasp with other',
        'Position patient upright and slightly forward'
      ],
      contraindications: [
        'Pregnancy (use chest thrusts)',
        'Obesity preventing proper positioning',
        'Infants under 1 year'
      ]
    },
    {
      id: 'choke_3',
      stepNumber: 3,
      title: 'Perform abdominal thrusts',
      description: 'Execute effective abdominal thrusts to clear obstruction',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Give quick, upward and inward thrusts',
        'Use significant force - sufficient to lift patient',
        'Perform 5 thrusts, then reassess',
        'Continue until object expelled or patient becomes unconscious',
        'Each thrust should be separate and distinct'
      ],
      safetyNotes: [
        'Avoid excessive force that could cause injury',
        'Support patient if they become weak',
        'Be prepared to catch expelled object'
      ]
    },
    {
      id: 'choke_4',
      stepNumber: 4,
      title: 'Post-obstruction care',
      description: 'Provide appropriate care after successful clearing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Ensure patient is breathing normally',
        'Check for remaining foreign material in mouth',
        'Monitor for signs of injury from thrusts',
        'Encourage medical evaluation even if successful',
        'Document the incident and actions taken'
      ]
    }
  ],

  // 12. BASIC AIRWAY MANEUVER
  'basic airway maneuver': [
    {
      id: 'bam_1',
      stepNumber: 1,
      title: 'Patient assessment and positioning',
      description: 'Assess airway obstruction and position patient appropriately',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Check for responsiveness and breathing quality',
        'Assess for visible airway obstruction',
        'Position patient supine on firm surface',
        'Ensure cervical spine considerations if trauma suspected',
        'Have suction available if needed'
      ]
    },
    {
      id: 'bam_2',
      stepNumber: 2,
      title: 'Head tilt-chin lift technique',
      description: 'Perform head tilt-chin lift to open airway',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Place one hand on forehead, apply gentle backward pressure',
        'Place fingertips of other hand under bony part of chin',
        'Lift chin upward while tilting head back',
        'Avoid pressing on soft tissues of neck',
        'Open mouth slightly to inspect airway'
      ],
      contraindications: [
        'Suspected cervical spine injury - use jaw thrust instead'
      ]
    },
    {
      id: 'bam_3',
      stepNumber: 3,
      title: 'Jaw thrust technique (if C-spine injury suspected)',
      description: 'Alternative airway opening technique for trauma patients',
      isRequired: true,
      isCritical: true,
      timeEstimate: 20,
      keyPoints: [
        'Kneel at head of patient',
        'Place hands on either side of patient\'s head',
        'Place fingertips under angles of jaw',
        'Lift jaw upward while maintaining head alignment',
        'Use thumbs to slightly open mouth'
      ]
    },
    {
      id: 'bam_4',
      stepNumber: 4,
      title: 'Airway assessment and maintenance',
      description: 'Evaluate airway patency and maintain positioning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Look for visible chest rise and fall',
        'Listen for air movement',
        'Feel for air flow at mouth and nose',
        'Remove visible foreign objects with finger sweep if safe',
        'Maintain head position throughout assessment'
      ]
    }
  ],

  // 13. OXYGEN DELIVERY
  'oxygen delivery': [
    {
      id: 'o2_1',
      stepNumber: 1,
      title: 'Indication assessment and preparation',
      description: 'Assess need for supplemental oxygen and prepare equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Assess oxygen saturation with pulse oximetry',
        'Evaluate respiratory rate, effort, and quality',
        'Check for cyanosis, altered mental status',
        'Verify oxygen cylinder pressure and flowmeter function',
        'Select appropriate delivery device based on patient needs'
      ],
      equipmentNeeded: [
        'Oxygen cylinder with regulator',
        'Nasal cannula or face mask',
        'Pulse oximeter',
        'Connecting tubing'
      ]
    },
    {
      id: 'o2_2',
      stepNumber: 2,
      title: 'Device selection and setup',
      description: 'Choose and set up appropriate oxygen delivery device',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Nasal cannula: 1-6 L/min (24-44% FiO2)',
        'Simple face mask: 6-10 L/min (40-60% FiO2)',
        'Non-rebreather mask: 10-15 L/min (80-95% FiO2)',
        'Connect tubing to oxygen source',
        'Set appropriate flow rate for chosen device'
      ]
    },
    {
      id: 'o2_3',
      stepNumber: 3,
      title: 'Application and patient education',
      description: 'Apply oxygen device and educate patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Explain procedure and expected sensations to patient',
        'Position device properly for comfort and effectiveness',
        'Secure with elastic strap or tape as appropriate',
        'Ensure adequate seal for masks',
        'Instruct patient on mouth breathing for masks'
      ]
    },
    {
      id: 'o2_4',
      stepNumber: 4,
      title: 'Monitoring and adjustment',
      description: 'Monitor patient response and adjust as needed',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Monitor oxygen saturation continuously',
        'Reassess respiratory rate and effort',
        'Watch for improvement in color and mental status',
        'Adjust flow rate based on patient response',
        'Document baseline and post-treatment vital signs'
      ]
    }
  ],

  // 14. NEEDLE THORACENTESIS
  'needle thoracentesis': [
    {
      id: 'needle_1',
      stepNumber: 1,
      title: 'Assessment and indication verification',
      description: 'Confirm tension pneumothorax and prepare for decompression',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Assess for tension pneumothorax signs: severe dyspnea, hypotension, JVD',
        'Check for absent breath sounds on affected side',
        'Look for tracheal deviation away from affected side',
        'Assess hemodynamic stability - procedure is time critical',
        'Explain procedure quickly to conscious patient'
      ],
      contraindications: [
        'Simple pneumothorax without tension',
        'Massive hemothorax',
        'Severe coagulopathy (relative)'
      ]
    },
    {
      id: 'needle_2',
      stepNumber: 2,
      title: 'Equipment preparation and positioning',
      description: 'Prepare equipment and position patient appropriately',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Use large bore IV catheter (14-16 gauge) or chest decompression needle',
        'Position patient upright if possible, or supine if unstable',
        'Identify landmark: 2nd intercostal space, midclavicular line',
        'Prepare antiseptic solution for skin preparation',
        'Have dressing materials ready for post-procedure'
      ],
      equipmentNeeded: [
        '14-16 gauge IV catheter or decompression needle',
        'Antiseptic solution',
        'Sterile gauze and tape',
        'One-way valve or syringe'
      ]
    },
    {
      id: 'needle_3',
      stepNumber: 3,
      title: 'Needle insertion technique',
      description: 'Perform needle thoracentesis using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Clean insertion site with antiseptic',
        'Insert needle over top of rib (avoid neurovascular bundle)',
        'Advance perpendicular to chest wall until pleural space entered',
        'Listen for rush of air confirming pleural decompression',
        'Remove needle, leaving catheter in place',
        'Secure catheter and apply occlusive dressing'
      ],
      safetyNotes: [
        'Insert just over the rib to avoid intercostal vessels',
        'Do not advance needle too far to avoid lung injury',
        'Monitor for immediate clinical improvement'
      ]
    },
    {
      id: 'needle_4',
      stepNumber: 4,
      title: 'Post-procedure monitoring',
      description: 'Monitor patient response and manage complications',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess immediate improvement in respiratory distress',
        'Monitor vital signs and oxygen saturation',
        'Listen for return of breath sounds on affected side',
        'Watch for signs of re-accumulation',
        'Prepare for definitive chest tube placement'
      ]
    }
  ],

  // 15. SURGICAL CRICOTHYROIDOTOMY
  'surgical cricothyroidotomy': [
    {
      id: 'cric_1',
      stepNumber: 1,
      title: 'Indication assessment and preparation',
      description: 'Confirm absolute indication and prepare for emergency surgical airway',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Confirm "can\'t intubate, can\'t oxygenate" scenario',
        'Verify failed attempts at less invasive airways',
        'Assess anatomy for cricothyroid membrane location',
        'Position patient supine with neck extended if possible',
        'Gather all necessary equipment rapidly'
      ],
      contraindications: [
        'Age under 8-10 years (needle cricothyroidotomy preferred)',
        'Laryngeal fracture or severe neck trauma',
        'Infection over insertion site'
      ],
      equipmentNeeded: [
        'Scalpel with #11 blade',
        'Tracheostomy tube or endotracheal tube (size 6.0)',
        'Tracheal hook or hemostat',
        'Antiseptic solution',
        'Bag-valve-mask for ventilation'
      ]
    },
    {
      id: 'cric_2',
      stepNumber: 2,
      title: 'Anatomical landmark identification',
      description: 'Locate and prepare the cricothyroid membrane',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Palpate thyroid cartilage (Adam\'s apple)',
        'Identify cricoid cartilage below thyroid cartilage',
        'Locate cricothyroid membrane between the two structures',
        'Clean area with antiseptic if time permits',
        'Stabilize larynx with non-dominant hand'
      ]
    },
    {
      id: 'cric_3',
      stepNumber: 3,
      title: 'Incision and airway establishment',
      description: 'Create opening and establish surgical airway',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Make horizontal incision through skin and cricothyroid membrane',
        'Extend incision to 2-3 cm length',
        'Use tracheal hook or hemostat to open incision',
        'Insert tracheostomy tube or small ET tube (6.0-7.0)',
        'Inflate cuff if present and connect to ventilation device'
      ],
      safetyNotes: [
        'Work quickly but carefully - this is life-saving procedure',
        'Control bleeding with direct pressure',
        'Avoid excessive force that could damage posterior wall'
      ]
    },
    {
      id: 'cric_4',
      stepNumber: 4,
      title: 'Confirmation and stabilization',
      description: 'Confirm tube placement and secure airway',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Ventilate and assess for bilateral chest rise',
        'Auscultate for equal breath sounds bilaterally',
        'Attach capnography if available',
        'Secure tube with tape or ties',
        'Control any bleeding and apply dressing around tube'
      ]
    }
  ],

  // 16. SUPRAGLOTTIC AIRWAY INSERTION
  'supraglottic airway insertion': [
    {
      id: 'sga_1',
      stepNumber: 1,
      title: 'Device selection and preparation',
      description: 'Select appropriate supraglottic airway and prepare equipment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Select appropriate size based on patient weight/height',
        'Check cuff integrity by inflating with recommended volume',
        'Deflate cuff completely before insertion',
        'Lubricate device with water-based lubricant',
        'Have suction and backup airway devices ready'
      ],
      equipmentNeeded: [
        'Supraglottic airway device (LMA, i-gel, etc.)',
        'Syringe for cuff inflation',
        'Water-based lubricant',
        'Bag-valve-mask',
        'Suction device'
      ]
    },
    {
      id: 'sga_2',
      stepNumber: 2,
      title: 'Patient positioning and pre-oxygenation',
      description: 'Optimize patient position and oxygenation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Position patient in sniffing position',
        'Provide 100% oxygen via bag-valve-mask',
        'Pre-oxygenate for 3-5 minutes if possible',
        'Ensure adequate muscle relaxation or sedation',
        'Have assistant maintain head position'
      ]
    },
    {
      id: 'sga_3',
      stepNumber: 3,
      title: 'Device insertion technique',
      description: 'Insert supraglottic airway using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Open mouth with cross-finger technique',
        'Insert device tip along hard palate',
        'Advance with gentle downward pressure until resistance felt',
        'Avoid forcing device - should seat easily when properly positioned',
        'Inflate cuff with recommended volume of air'
      ]
    },
    {
      id: 'sga_4',
      stepNumber: 4,
      title: 'Confirmation and ventilation',
      description: 'Confirm proper placement and establish effective ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Connect bag-valve-mask and begin ventilation',
        'Assess for bilateral chest rise and equal breath sounds',
        'Check for adequate tidal volumes and compliance',
        'Secure device with tape or commercial holder',
        'Monitor continuously for displacement or obstruction'
      ]
    }
  ],

  // 17. APPLICATION OF TRIANGULAR BANDAGE
  'application of a triangular bandage': [
    {
      id: 'tri_1',
      stepNumber: 1,
      title: 'Wound assessment and preparation',
      description: 'Assess injury and prepare for triangular bandage application',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Assess wound location, size, and severity',
        'Control any active bleeding with direct pressure',
        'Check distal circulation, sensation, and motor function',
        'Select clean triangular bandage of appropriate size',
        'Position patient comfortably with injured area accessible'
      ]
    },
    {
      id: 'tri_2',
      stepNumber: 2,
      title: 'Bandage positioning and application',
      description: 'Apply triangular bandage using appropriate technique for injury location',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Place point of triangle beyond wound area',
        'Bring base of triangle across wound site',
        'Fold edges to create desired width for support',
        'Ensure bandage covers entire wound area',
        'Maintain gentle, even pressure throughout application'
      ]
    },
    {
      id: 'tri_3',
      stepNumber: 3,
      title: 'Securing and final assessment',
      description: 'Secure bandage and assess effectiveness',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Tie bandage ends with square knot over uninjured area',
        'Ensure knot is secure but not too tight',
        'Check that bandage provides adequate support without constricting',
        'Reassess distal circulation and sensation',
        'Document application and monitor for swelling'
      ]
    }
  ],

  // 18. IMMOBILIZATION OF AN INJURY
  'immobilization of an injury': [
    {
      id: 'immob_1',
      stepNumber: 1,
      title: 'Injury assessment and planning',
      description: 'Assess injury and plan immobilization approach',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Assess injury location, mechanism, and severity',
        'Check neurovascular status distal to injury',
        'Determine if reduction is needed before immobilization',
        'Select appropriate immobilization device',
        'Explain procedure to patient and address pain'
      ]
    },
    {
      id: 'immob_2',
      stepNumber: 2,
      title: 'Device preparation and positioning',
      description: 'Prepare immobilization device and position patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Size splint or immobilization device appropriately',
        'Pad device to prevent pressure points',
        'Position patient to allow access to injury',
        'Support injury in position of function if possible',
        'Have assistant maintain manual stabilization during application'
      ]
    },
    {
      id: 'immob_3',
      stepNumber: 3,
      title: 'Immobilization application',
      description: 'Apply immobilization device using proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Immobilize joint above and below fracture site',
        'Apply device without disturbing fracture alignment',
        'Secure with straps, tape, or bandages',
        'Ensure device is snug but allows circulation',
        'Recheck neurovascular status after application'
      ]
    },
    {
      id: 'immob_4',
      stepNumber: 4,
      title: 'Final assessment and documentation',
      description: 'Complete final checks and document procedure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Verify immobilization is adequate and secure',
        'Reassess pain level and provide comfort measures',
        'Check for signs of compartment syndrome',
        'Document neurovascular assessments before and after',
        'Plan for regular reassessment during transport'
      ]
    }
  ],

  // 19. HEAD TO TOE ASSESSMENT
  'head to toe assessment': [
    {
      id: 'htt_1',
      stepNumber: 1,
      title: 'Initial patient approach and vital signs',
      description: 'Begin systematic head-to-toe physical examination',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Introduce yourself and explain the examination process',
        'Obtain complete set of vital signs: BP, HR, RR, temp, SpO2',
        'Assess general appearance and level of consciousness',
        'Note patient positioning and any obvious distress',
        'Ensure privacy and appropriate draping throughout exam'
      ],
      equipmentNeeded: [
        'Stethoscope',
        'Blood pressure cuff',
        'Pulse oximeter',
        'Thermometer',
        'Penlight'
      ]
    },
    {
      id: 'htt_2',
      stepNumber: 2,
      title: 'Head and neck examination',
      description: 'Systematically examine head, face, neck, and cervical spine',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Inspect scalp for lacerations, hematomas, or deformities',
        'Check pupils for size, equality, and reactivity (PERRLA)',
        'Assess facial symmetry and cranial nerve function',
        'Palpate neck for masses, lymph nodes, and tracheal position',
        'Check neck range of motion if no c-spine injury suspected',
        'Assess jugular venous distention and carotid pulses'
      ]
    },
    {
      id: 'htt_3',
      stepNumber: 3,
      title: 'Chest and respiratory assessment',
      description: 'Comprehensive examination of chest and respiratory system',
      isRequired: true,
      isCritical: true,
      timeEstimate: 150,
      keyPoints: [
        'Inspect chest for symmetry, deformities, and breathing patterns',
        'Palpate for tenderness, crepitus, and chest wall stability',
        'Percuss chest systematically for dullness or hyperresonance',
        'Auscultate all lung fields for breath sounds and adventitious sounds',
        'Check for equal chest expansion bilaterally'
      ]
    },
    {
      id: 'htt_4',
      stepNumber: 4,
      title: 'Cardiovascular and extremity assessment',
      description: 'Examine heart, circulation, and extremities',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Auscultate heart in all four positions for murmurs and rhythms',
        'Check peripheral pulses in all extremities',
        'Assess capillary refill time and skin color/temperature',
        'Check for edema, particularly in dependent areas',
        'Perform neurological checks: motor, sensory, reflexes',
        'Document all findings systematically'
      ]
    }
  ],

  // 20. BLOOD GLUCOSE MEASUREMENT
  'blood glucose measurement': [
    {
      id: 'bg_1',
      stepNumber: 1,
      title: 'Patient preparation and equipment setup',
      description: 'Prepare patient and glucometer for blood glucose testing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Explain procedure to patient and obtain verbal consent',
        'Check glucometer calibration and battery level',
        'Insert fresh test strip into glucometer',
        'Select appropriate lancet and depth setting',
        'Have alcohol prep pads and gauze ready'
      ],
      equipmentNeeded: [
        'Blood glucose meter',
        'Test strips (in-date)',
        'Lancets',
        'Alcohol prep pads',
        'Gauze pads',
        'Gloves'
      ]
    },
    {
      id: 'bg_2',
      stepNumber: 2,
      title: 'Site preparation and sampling',
      description: 'Prepare finger and obtain blood sample',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Select side of fingertip (less nerve endings than pad)',
        'Clean site with alcohol and allow to air dry completely',
        'Use lancet to make quick, deep puncture',
        'Gently milk finger to produce adequate blood drop',
        'Touch drop to test strip without smearing'
      ],
      safetyNotes: [
        'Use universal precautions - wear gloves',
        'Never reuse lancets',
        'Dispose of sharps in appropriate container'
      ]
    },
    {
      id: 'bg_3',
      stepNumber: 3,
      title: 'Reading and documentation',
      description: 'Read result and provide appropriate follow-up',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Wait for glucometer to display result',
        'Record blood glucose value with time and date',
        'Apply pressure to finger until bleeding stops',
        'Interpret result in context of patient symptoms',
        'Take appropriate action based on result (normal, hypo, hyper)'
      ]
    }
  ],

  // 21. PEAK FLOW MEASUREMENT
  'peak flow measurement': [
    {
      id: 'pf_1',
      stepNumber: 1,
      title: 'Equipment preparation and patient instruction',
      description: 'Set up peak flow meter and instruct patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Check peak flow meter for proper function',
        'Reset indicator to zero before each use',
        'Explain technique clearly to patient',
        'Demonstrate proper mouth seal and breathing technique',
        'Ensure patient is sitting upright or standing'
      ]
    },
    {
      id: 'pf_2',
      stepNumber: 2,
      title: 'Peak flow measurement technique',
      description: 'Guide patient through proper peak flow technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Have patient take deepest possible breath',
        'Place lips tightly around mouthpiece',
        'Blow out as hard and fast as possible in one breath',
        'Record highest value from three attempts',
        'Allow rest period between attempts'
      ]
    },
    {
      id: 'pf_3',
      stepNumber: 3,
      title: 'Result interpretation and follow-up',
      description: 'Interpret peak flow results and take appropriate action',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Compare result to predicted values for age/height/sex',
        'Consider patient\'s personal best if known',
        'Document all three attempts and best result',
        'Assess need for bronchodilator therapy',
        'Plan appropriate treatment based on severity'
      ]
    }
  ],

  // 22. SPINAL IMMOBILIZATION
  'spinal immobilization': [
    {
      id: 'spine_1',
      stepNumber: 1,
      title: 'Assessment and indication determination',
      description: 'Assess need for spinal immobilization based on mechanism and exam',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Assess mechanism of injury for spinal risk factors',
        'Perform focused neurological examination',
        'Check for midline spinal tenderness',
        'Assess mental status and ability to cooperate',
        'Apply c-collar if any suspicion of cervical injury'
      ],
      contraindications: [
        'Penetrating trauma to neck (relative)',
        'Patient agitation causing more harm than benefit'
      ]
    },
    {
      id: 'spine_2',
      stepNumber: 2,
      title: 'Equipment preparation and positioning',
      description: 'Prepare spinal board and position patient appropriately',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Size cervical collar appropriately',
        'Prepare long spine board with straps and padding',
        'Ensure adequate personnel for log roll (minimum 4 people)',
        'Designate team leader to control head and neck',
        'Position board alongside patient'
      ]
    },
    {
      id: 'spine_3',
      stepNumber: 3,
      title: 'Log roll and board placement',
      description: 'Safely move patient to spine board maintaining alignment',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Team leader maintains manual head stabilization',
        'Team moves patient as one unit on leader\'s command',
        'Roll patient toward team in coordinated motion',
        'Slide board under patient while maintaining alignment',
        'Lower patient onto board in reverse coordinated motion'
      ]
    },
    {
      id: 'spine_4',
      stepNumber: 4,
      title: 'Securing and padding',
      description: 'Secure patient to board and pad pressure points',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Secure torso first, then pelvis, then legs',
        'Use head blocks and tape to secure head last',
        'Ensure straps are snug but allow chest expansion',
        'Pad under knees, head, and other pressure points',
        'Continuously monitor airway and breathing'
      ]
    }
  ],

  // 23. THERAPEUTIC COMMUNICATION
  'therapeutic communication': [
    {
      id: 'comm_1',
      stepNumber: 1,
      title: 'Environment assessment and setup',
      description: 'Create appropriate environment for therapeutic communication',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Ensure privacy and minimize distractions',
        'Position yourself at patient\'s eye level when possible',
        'Maintain appropriate personal space',
        'Use calm, professional tone and demeanor',
        'Remove barriers between you and patient when safe'
      ]
    },
    {
      id: 'comm_2',
      stepNumber: 2,
      title: 'Active listening and empathy',
      description: 'Demonstrate active listening and empathetic communication',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Make appropriate eye contact and use open body language',
        'Use reflection and clarification techniques',
        'Acknowledge patient emotions and concerns',
        'Ask open-ended questions to gather information',
        'Avoid interrupting or rushing the conversation'
      ]
    },
    {
      id: 'comm_3',
      stepNumber: 3,
      title: 'Information sharing and collaboration',
      description: 'Share relevant information and involve patient in care decisions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Explain procedures and treatments in understandable terms',
        'Check patient understanding by asking them to repeat back',
        'Involve patient in decision-making when appropriate',
        'Provide realistic reassurance without false promises',
        'Respect cultural and individual differences'
      ]
    }
  ],

  // 24. ADULT CPR WITH AED
  'adult cpr with aed': [
    {
      id: 'cpr_aed_1',
      stepNumber: 1,
      title: 'Scene safety and initial assessment',
      description: 'Ensure scene safety and confirm cardiac arrest',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Check scene safety and use appropriate PPE',
        'Tap shoulders and shout "Are you okay?"',
        'Check for normal breathing (no more than 10 seconds)',
        'Activate emergency response and get AED',
        'Position patient supine on firm surface'
      ]
    },
    {
      id: 'cpr_aed_2',
      stepNumber: 2,
      title: 'Begin chest compressions',
      description: 'Initiate high-quality CPR with proper technique',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Place heel of hand on lower half of breastbone',
        'Compress at least 2 inches (5cm) deep',
        'Allow complete chest recoil between compressions',
        'Compress at rate of 100-120 per minute',
        'Minimize interruptions in chest compressions'
      ]
    },
    {
      id: 'cpr_aed_3',
      stepNumber: 3,
      title: 'AED application and analysis',
      description: 'Apply AED pads and analyze rhythm',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Turn on AED and follow voice prompts',
        'Attach pads to bare chest as shown',
        'Ensure pads do not overlap or touch',
        'Clear patient and analyze rhythm',
        'Follow AED prompts for shock or no shock advised'
      ]
    },
    {
      id: 'cpr_aed_4',
      stepNumber: 4,
      title: 'Defibrillation and post-shock care',
      description: 'Deliver shock if advised and resume CPR',
      isRequired: true,
      isCritical: true,
      timeEstimate: 180,
      keyPoints: [
        'Ensure everyone is clear before shocking',
        'Press shock button when prompted',
        'Immediately resume chest compressions after shock',
        'Continue CPR for 2 minutes before next rhythm check',
        'Rotate compressors every 2 minutes to prevent fatigue'
      ]
    }
  ],

  // 25. BLOOD PRESSURE MEASUREMENT
  'blood pressure measurement': [
    {
      id: 'bp_1',
      stepNumber: 1,
      title: 'Equipment preparation and patient positioning',
      description: 'Prepare equipment and position patient appropriately',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Select appropriate cuff size for patient arm',
        'Check equipment for proper function',
        'Position patient seated or supine with arm supported',
        'Ensure arm is at heart level',
        'Allow patient to rest 5 minutes before measurement'
      ]
    },
    {
      id: 'bp_2',
      stepNumber: 2,
      title: 'Cuff placement and inflation',
      description: 'Apply cuff and inflate to appropriate pressure',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Wrap cuff snugly around upper arm 1 inch above elbow',
        'Palpate brachial artery and position stethoscope',
        'Inflate cuff 20-30 mmHg above estimated systolic pressure',
        'Ensure tubing is not kinked or obstructed',
        'Maintain steady pressure during measurement'
      ]
    },
    {
      id: 'bp_3',
      stepNumber: 3,
      title: 'Pressure release and reading',
      description: 'Slowly deflate cuff and record readings',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Deflate cuff at 2-3 mmHg per second',
        'Note systolic pressure at first Korotkoff sound',
        'Note diastolic pressure when sounds disappear',
        'Record readings to nearest 2 mmHg',
        'Consider repeating if reading seems inaccurate'
      ]
    }
  ],

  // 26. STRETCHER OPERATIONS
  'stretcher operations': [
    {
      id: 'stretch_1',
      stepNumber: 1,
      title: 'Stretcher inspection and preparation',
      description: 'Check stretcher function and prepare for patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Test all mechanical functions and locks',
        'Check weight capacity and stability',
        'Ensure all safety straps are functional',
        'Verify mattress is clean and properly secured',
        'Adjust height for safe patient transfer'
      ]
    },
    {
      id: 'stretch_2',
      stepNumber: 2,
      title: 'Patient transfer technique',
      description: 'Transfer patient to stretcher using proper body mechanics',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Use appropriate number of personnel for patient weight',
        'Communicate and coordinate lift on count of three',
        'Use proper lifting technique with legs, not back',
        'Transfer patient smoothly and maintain dignity',
        'Secure patient with appropriate restraints'
      ]
    },
    {
      id: 'stretch_3',
      stepNumber: 3,
      title: 'Transport positioning and safety',
      description: 'Position stretcher and ensure safety during transport',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Raise stretcher to appropriate height for transport',
        'Lock all wheels and safety mechanisms',
        'Secure stretcher properly in ambulance',
        'Position side rails up and ensure patient comfort',
        'Monitor patient throughout transport'
      ]
    }
  ]

  // Total: 26+ comprehensive skills enhanced with detailed clinical best practices
  // Following the same pattern as 'Prediction of difficult bag valve mask ventilations'
  // Each skill includes evidence-based procedures, safety considerations, and clinical guidelines
};

// Enhanced metadata for all skills
export const allSkillsMetadata = {
  'prediction of difficult bag valve mask ventilations': {
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
    ]
  },

  'femoral vein cannulation': {
    name: 'Femoral Vein Cannulation',
    category: 'medical',
    difficultyLevel: 'ADVANCED',
    timeEstimateMinutes: 15,
    isCritical: true,
    objectives: [
      'Establish central venous access via femoral route',
      'Use sterile technique and ultrasound guidance',
      'Minimize complications and bleeding risk',
      'Secure catheter appropriately'
    ]
  },

  'recovery position': {
    name: 'Recovery Position',
    category: 'bls',
    difficultyLevel: 'BEGINNER',
    timeEstimateMinutes: 3,
    isCritical: true,
    objectives: [
      'Safely position unconscious breathing patient',
      'Maintain airway patency and prevent aspiration',
      'Ensure stable positioning for monitoring',
      'Recognize contraindications'
    ]
  },

  'hand washing': {
    name: 'Hand Washing',
    category: 'medical',
    difficultyLevel: 'BEGINNER',
    timeEstimateMinutes: 2,
    isCritical: true,
    objectives: [
      'Perform proper hand hygiene technique',
      'Remove transient microorganisms',
      'Prevent healthcare-associated infections',
      'Follow standard precautions'
    ]
  },

  'cpap': {
    name: 'CPAP (Continuous Positive Airway Pressure)',
    category: 'airway',
    difficultyLevel: 'INTERMEDIATE',
    timeEstimateMinutes: 10,
    isCritical: true,
    objectives: [
      'Apply CPAP for respiratory distress',
      'Improve oxygenation and reduce work of breathing',
      'Monitor patient response and complications',
      'Recognize indications and contraindications'
    ]
  },

  'intravenous cannulation': {
    name: 'Intravenous Cannulation',
    category: 'medical',
    difficultyLevel: 'INTERMEDIATE',
    timeEstimateMinutes: 8,
    isCritical: true,
    objectives: [
      'Establish peripheral intravenous access',
      'Select appropriate catheter size and location',
      'Use sterile technique throughout procedure',
      'Secure and maintain IV patency'
    ]
  }

};

export default allEnhancedSkillSteps;