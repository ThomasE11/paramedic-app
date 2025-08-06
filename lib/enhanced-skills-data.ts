// Enhanced Skills Data with Detailed Educational Content
// This file provides comprehensive step-by-step guidance for paramedic skills
// Each step includes detailed keyPoints to help students understand and perform skills effectively

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

// Enhanced skill steps with comprehensive educational content
export const enhancedSkillSteps: { [skillId: string]: EnhancedSkillStep[] } = {
  
  // OROGASTRIC AND NASOGASTRIC TUBE INSERTION - Enhanced with detailed guidance
  'skill-008': [
    {
      id: 'skill-008-step-1',
      stepNumber: 1,
      title: 'Preparation',
      description: 'Comprehensive preparation for orogastric/nasogastric tube insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Perform hand hygiene and don personal protective equipment (gloves, mask, eye protection)',
        'Gather all necessary equipment: NG tubes (12-18Fr for adults), 60ml catheter-tip syringe, water-soluble lubricant',
        'Obtain lignocaine spray for conscious patients, urine bag for drainage, pH testing strips',
        'Prepare suction equipment and ensure it is functioning properly',
        'Position patient appropriately: sitting upright with neck flexed (conscious) or supine with head elevated 30-45°',
        'Explain procedure to conscious patient and obtain consent',
        'Check patient allergies, particularly to lignocaine if using topical anesthetic'
      ],
      equipmentNeeded: [
        'Nasogastric tubes (12-18Fr for adults)',
        '60ml catheter-tip syringe',
        'Water-soluble lubricant',
        'Lignocaine spray',
        'Urine bag or drainage container',
        'pH testing strips',
        'Suction equipment',
        'Personal protective equipment'
      ],
      safetyNotes: [
        'Ensure patient is conscious and able to protect airway if using nasal route',
        'Have suction immediately available in case of vomiting',
        'Monitor patient for signs of respiratory distress throughout procedure'
      ]
    },
    {
      id: 'skill-008-step-2',
      stepNumber: 2,
      title: 'Rule out contraindications',
      description: 'Assess patient for contraindications to nasogastric tube insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Check for suspected base of skull fracture (raccoon eyes, Battle\'s sign, CSF otorrhea/rhinorrhea)',
        'Assess for severe facial trauma or nasal obstruction',
        'Evaluate patient\'s level of consciousness - use oral route if GCS <8 without airway protection',
        'Check for coagulopathy or bleeding disorders that may increase bleeding risk',
        'Assess for esophageal varices in patients with known portal hypertension',
        'Consider recent nasal surgery or nasal polyps as relative contraindications'
      ],
      contraindications: [
        'Suspected base of skull fracture',
        'Severe maxillofacial trauma',
        'Nasal obstruction or recent nasal surgery',
        'Suspected esophageal perforation',
        'Coagulopathy with active bleeding',
        'Unprotected airway with decreased consciousness'
      ],
      safetyNotes: [
        'If contraindications exist, consider orogastric route or alternative interventions',
        'Document assessment findings and rationale for tube selection'
      ]
    },
    {
      id: 'skill-008-step-3',
      stepNumber: 3,
      title: 'Explain procedure to patient',
      description: 'Provide clear explanation and obtain informed consent',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Explain the purpose: decompression, medication administration, or feeding',
        'Describe the procedure: "I will insert a thin tube through your nose/mouth into your stomach"',
        'Warn about temporary discomfort: "You may feel gagging, tearing, or throat irritation"',
        'Explain patient cooperation needed: "When I ask, please swallow or sip water to help the tube pass"',
        'Reassure about safety measures: "I will stop if you have difficulty breathing"',
        'Obtain verbal consent and answer any questions',
        'Establish hand signals for patient to communicate distress during procedure'
      ],
      safetyNotes: [
        'Ensure patient understands they can signal to stop the procedure',
        'Confirm patient is alert enough to cooperate with instructions'
      ]
    },
    {
      id: 'skill-008-step-4',
      stepNumber: 4,
      title: 'Position conscious patient',
      description: 'Proper positioning for conscious patient safety and comfort',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Seat patient upright at 90° angle or high Fowler\'s position',
        'Ensure head is slightly flexed forward (chin toward chest)',
        'Support patient\'s back with pillows for comfort',
        'Place emesis basin and tissues within easy reach',
        'Ensure adequate lighting to visualize nasal passages',
        'Have patient remove dentures if present',
        'Position suction equipment for immediate access'
      ],
      safetyNotes: [
        'Positioning helps prevent aspiration and facilitates tube passage',
        'Patient should be able to lean forward if needed to clear secretions'
      ]
    },
    {
      id: 'skill-008-step-5',
      stepNumber: 5,
      title: 'Check and assemble equipment',
      description: 'Verify all equipment is present and functioning',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Select appropriate NG tube size: 12-14Fr for drainage, 16-18Fr for lavage',
        'Check tube integrity: no cracks, holes, or defective balloon if present',
        'Test suction equipment and ensure adequate vacuum pressure',
        'Prime 60ml syringe and check for smooth plunger action',
        'Verify pH strips are not expired and color chart is available',
        'Prepare water-soluble lubricant (never use petroleum-based products)',
        'Ensure drainage bag connections are secure and patent'
      ],
      equipmentNeeded: [
        'Nasogastric tubes (various sizes)',
        '60ml catheter-tip syringe',
        'pH testing strips',
        'Water-soluble lubricant',
        'Drainage collection system'
      ]
    },
    {
      id: 'skill-008-step-6',
      stepNumber: 6,
      title: 'Measure tube length',
      description: 'Determine correct insertion depth using anatomical landmarks',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Use NEX method: measure from Nose to Earlobe to Xiphoid process',
        'Mark the measured length on the tube with tape or note the centimeter marking',
        'Alternative: measure from nose to angle of jaw, then to xiphoid process',
        'Add 10-15cm to measured length for gastric placement in adults',
        'Double-check measurement before insertion',
        'Document the intended insertion depth for reference'
      ],
      safetyNotes: [
        'Accurate measurement prevents over-insertion into duodenum',
        'Under-insertion may result in esophageal placement'
      ]
    }
  ],

  // HAND WASHING - Enhanced with infection control focus
  'skill-007': [
    {
      id: 'skill-007-step-1',
      stepNumber: 1,
      title: 'Initial preparation',
      description: 'Remove jewelry and prepare for effective hand hygiene',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Remove all rings, watches, and bracelets before beginning',
        'Roll sleeves up above wrists to prevent contamination',
        'Check hands for cuts or open wounds - cover with waterproof dressing',
        'Avoid touching sink surfaces with hands during the process',
        'Ensure adequate soap supply and paper towels are available',
        'Turn on water using elbow, wrist, or foot controls if available'
      ],
      safetyNotes: [
        'Jewelry harbors bacteria and prevents effective cleaning',
        'Open wounds increase infection risk and must be covered'
      ]
    },
    {
      id: 'skill-007-step-2',
      stepNumber: 2,
      title: 'Wet hands with warm water',
      description: 'Use appropriate water temperature for effective cleansing',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Use warm (not hot) water to avoid skin damage and open pores for better cleaning',
        'Allow water to flow from wrists to fingertips to carry contaminants away',
        'Keep hands lower than elbows to prevent recontamination',
        'Wet hands thoroughly including between fingers and under nails',
        'Avoid splashing water that could contaminate clothing'
      ]
    },
    {
      id: 'skill-007-step-3',
      stepNumber: 3,
      title: 'Apply antimicrobial soap',
      description: 'Use sufficient soap to cover all hand surfaces',
      isRequired: true,
      isCritical: true,
      timeEstimate: 15,
      keyPoints: [
        'Apply 3-5ml of antimicrobial soap (enough to cover all surfaces)',
        'Use liquid soap dispensers to avoid cross-contamination',
        'Avoid using bar soap which can harbor bacteria',
        'Ensure soap covers fingertips, thumbs, and wrist areas',
        'Begin lathering immediately to activate antimicrobial agents'
      ]
    }
  ],

  // CPAP - Enhanced with respiratory care focus
  'skill-005': [
    {
      id: 'skill-005-step-1',
      stepNumber: 1,
      title: 'Equipment identification and setup',
      description: 'Identify all CPAP components and prepare for patient use',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Identify CPAP generator unit and ensure it\'s functioning (listen for motor sound)',
        'Check PEEP valve settings and confirm pressure gauge is working',
        'Inspect patient breathing circuit for cracks, kinks, or obstructions',
        'Verify oxygen supply connection and flow meter functionality',
        'Examine face masks (small, medium, large) for damage or missing seals',
        'Check head straps for elasticity and secure buckles',
        'Ensure reservoir bag is properly attached and inflating',
        'Test manometer readings against known pressure source if available'
      ],
      equipmentNeeded: [
        'CPAP generator unit',
        'PEEP valve (5-20 cmH2O)',
        'Patient breathing circuit',
        'Face masks (multiple sizes)',
        'Head straps',
        'Oxygen supply and tubing',
        'Manometer',
        'Reservoir bag'
      ],
      safetyNotes: [
        'Never use damaged equipment - patient safety depends on proper function',
        'Have backup manual ventilation available in case of equipment failure'
      ]
    },
    {
      id: 'skill-005-step-2',
      stepNumber: 2,
      title: 'Screen for exclusion criteria',
      description: 'Assess patient for contraindications to CPAP therapy',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Check for altered mental status (GCS <13) - patient must be able to protect airway',
        'Assess for vomiting or high aspiration risk - CPAP increases aspiration danger',
        'Evaluate facial trauma or burns that prevent proper mask seal',
        'Check for pneumothorax - CPAP can worsen tension pneumothorax',
        'Assess blood pressure: systolic <90 mmHg may be worsened by positive pressure',
        'Look for signs of impending respiratory arrest requiring immediate intubation',
        'Consider patient anxiety and claustrophobia that may prevent compliance'
      ],
      contraindications: [
        'Altered mental status (GCS <13)',
        'Active vomiting or high aspiration risk',
        'Facial trauma preventing mask seal',
        'Untreated pneumothorax',
        'Severe hypotension (SBP <90 mmHg)',
        'Impending respiratory arrest',
        'Patient unable to cooperate or remove mask'
      ]
    },
    {
      id: 'skill-005-step-3',
      stepNumber: 3,
      title: 'Explain procedure and gain cooperation',
      description: 'Inform patient about CPAP therapy to ensure compliance',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Explain that CPAP will help with breathing: "This mask will make it easier for you to breathe"',
        'Warn about initial discomfort: "The mask may feel tight at first, but this helps your breathing"',
        'Explain the importance of keeping mask on: "Try not to remove the mask as it helps keep your airways open"',
        'Reassure about monitoring: "I will stay with you and monitor how you\'re doing"',
        'Establish communication signals if patient becomes distressed',
        'Address claustrophobia concerns with reassurance and positioning options'
      ],
      safetyNotes: [
        'Patient cooperation is essential for CPAP effectiveness',
        'Be prepared to remove mask immediately if patient becomes severely distressed'
      ]
    },
    {
      id: 'skill-005-step-4',
      stepNumber: 4,
      title: 'Position patient appropriately',
      description: 'Optimize patient positioning for CPAP effectiveness and comfort',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient sitting upright at 45-90 degrees (high Fowler\'s position)',
        'Support patient\'s back and arms with pillows for comfort',
        'Ensure patient can easily communicate and gesture if distressed',
        'Position suction equipment within immediate reach',
        'Keep manual ventilation bag-valve-mask visible and accessible',
        'Ensure adequate lighting to monitor patient\'s condition'
      ],
      safetyNotes: [
        'Upright positioning reduces aspiration risk and improves respiratory mechanics',
        'Patient must be able to remove mask independently if needed'
      ]
    }
  ],

  // IV CANNULATION - Enhanced with vascular access focus
  'skill-009': [
    {
      id: 'skill-009-step-1',
      stepNumber: 1,
      title: 'Preparation and infection control',
      description: 'Prepare equipment and establish sterile technique for IV insertion',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Perform thorough hand hygiene and don sterile gloves',
        'Gather IV cannula (14-22G based on indication), IV fluid, giving set, tape',
        'Prepare alcohol-based antiseptic swabs and gauze pads',
        'Check IV fluid for clarity, expiry date, and correct prescription',
        'Prime IV tubing completely to remove all air bubbles',
        'Prepare securing tape and transparent dressing materials',
        'Ensure sharps disposal container is within reach'
      ],
      equipmentNeeded: [
        'IV cannula (appropriate gauge)',
        'IV fluid and giving set',
        'Alcohol antiseptic swabs',
        'Sterile gauze pads',
        'Medical tape',
        'Transparent dressing',
        'Tourniquet',
        'Sharps container'
      ],
      safetyNotes: [
        'Universal precautions apply - treat all blood and body fluids as potentially infectious',
        'Never recap needles - dispose directly into sharps container'
      ]
    },
    {
      id: 'skill-009-step-2',
      stepNumber: 2,
      title: 'Vein selection and assessment',
      description: 'Identify suitable vein for cannulation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Apply tourniquet 10-15cm above intended insertion site',
        'Assess antecubital fossa first: median cubital, cephalic, and basilic veins',
        'Look for straight, bouncy, non-rolling veins that refill quickly when pressed',
        'Avoid areas of infection, bruising, scarring, or previous unsuccessful attempts',
        'Consider dorsal hand veins if antecubital veins are not suitable',
        'Palpate vein to assess depth, direction, and stability',
        'Choose largest appropriate vein for intended therapy'
      ],
      contraindications: [
        'Infected or inflamed skin at insertion site',
        'Areas of previous phlebitis or infiltration',
        'Limbs with arteriovenous fistulas',
        'Same side as mastectomy or lymph node dissection',
        'Fractured limbs or areas of trauma'
      ],
      safetyNotes: [
        'Never attempt cannulation through infected or compromised tissue',
        'Limit tourniquet time to prevent tissue damage and hemoconcentration'
      ]
    },
    {
      id: 'skill-009-step-3',
      stepNumber: 3,
      title: 'Skin preparation and anesthesia',
      description: 'Clean insertion site and provide local anesthesia if indicated',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Clean insertion site with alcohol swab in circular motion from center outward',
        'Allow antiseptic to dry completely (minimum 30 seconds)',
        'Do not touch cleaned area after preparation',
        'Consider topical local anesthetic for anxious patients or difficult access',
        'Maintain sterile technique throughout preparation',
        'Position patient\'s arm comfortably with good lighting'
      ]
    }
  ],

  // CPR ADULT - Enhanced with resuscitation science focus
  'skill-001': [
    {
      id: 'skill-001-step-1',
      stepNumber: 1,
      title: 'Scene safety and initial assessment',
      description: 'Ensure environment safety and assess patient responsiveness',
      isRequired: true,
      isCritical: true,
      timeEstimate: 30,
      keyPoints: [
        'Check scene for hazards: traffic, fire, electrical dangers, violence',
        'Use personal protective equipment if available (gloves, mask)',
        'Approach patient from the side, kneel beside their shoulders',
        'Tap shoulders firmly and shout "Are you okay?" - check for response',
        'Look for normal breathing for no more than 10 seconds',
        'If unresponsive and not breathing normally, prepare for CPR',
        'Call for help immediately - activate emergency services if not already done'
      ],
      contraindications: [
        'Unsafe scene (fire, electrical hazard, violence)',
        'Signs of obvious death (rigor mortis, decomposition)',
        'Valid Do Not Resuscitate (DNR) order present'
      ],
      safetyNotes: [
        'Your safety is paramount - do not enter unsafe scenes',
        'If patient is responsive but appears unwell, monitor and support'
      ]
    },
    {
      id: 'skill-001-step-2',
      stepNumber: 2,
      title: 'Position patient and prepare for compressions',
      description: 'Position patient correctly for effective chest compressions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 45,
      keyPoints: [
        'Place patient on firm, flat surface (floor is ideal)',
        'Tilt head back slightly and lift chin to open airway',
        'Position yourself beside patient\'s chest',
        'Place heel of one hand on center of chest, between nipples',
        'Place second hand on top, interlacing fingers',
        'Keep arms straight and shoulders directly over hands',
        'Ensure complete chest recoil between compressions'
      ],
      safetyNotes: [
        'Compressions on a soft surface (bed) are less effective',
        'Proper hand placement prevents rib fractures and organ damage'
      ]
    },
    {
      id: 'skill-001-step-3',
      stepNumber: 3,
      title: 'Perform chest compressions',
      description: 'Deliver high-quality chest compressions at correct rate and depth',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Push hard and fast - compress at least 5cm but not more than 6cm deep',
        'Compress at rate of 100-120 compressions per minute',
        'Allow complete chest recoil between compressions',
        'Minimize interruptions - aim for <10 seconds between cycles',
        'Count compressions aloud: "1 and 2 and 3..." up to 30',
        'Switch with another rescuer every 2 minutes to prevent fatigue',
        'Continue until AED/defibrillator arrives or advanced help takes over'
      ],
      safetyNotes: [
        'Quality is more important than speed - ensure adequate depth',
        'Rescuer fatigue significantly reduces compression effectiveness after 2 minutes'
      ]
    }
  ],

  // OXYGEN ADMINISTRATION - Enhanced with respiratory therapy focus
  'skill-010': [
    {
      id: 'skill-010-step-1',
      stepNumber: 1,
      title: 'Equipment preparation and safety checks',
      description: 'Prepare oxygen delivery system and verify safety',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Check oxygen cylinder pressure gauge - ensure adequate supply (>500 psi for transport)',
        'Inspect regulator and flow meter for damage or leaks',
        'Test oxygen flow at various rates to ensure smooth operation',
        'Check delivery device (nasal cannula, simple mask, non-rebreather) for damage',
        'Ensure "No Smoking" signs are visible and enforce no-flame policy',
        'Verify oxygen tubing connections are secure and patent',
        'Have backup oxygen source available if possible'
      ],
      equipmentNeeded: [
        'Oxygen cylinder with regulator',
        'Flow meter',
        'Appropriate delivery device',
        'Oxygen tubing',
        'Pressure gauge',
        'Wrench for connections'
      ],
      safetyNotes: [
        'Oxygen supports combustion - keep away from flames, sparks, and heat sources',
        'Never use oil-based lubricants on oxygen equipment',
        'Secure cylinders to prevent falling and valve damage'
      ]
    },
    {
      id: 'skill-010-step-2',
      stepNumber: 2,
      title: 'Patient assessment and indication determination',
      description: 'Assess patient\'s respiratory status and determine oxygen needs',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Assess respiratory rate, depth, and effort - normal rate 12-20/min for adults',
        'Observe for cyanosis (central vs peripheral), use of accessory muscles',
        'Check pulse oximetry if available - target SpO2 >94% (>88% for COPD patients)',
        'Listen for abnormal breath sounds: wheezing, rales, stridor',
        'Assess level of consciousness and ability to maintain airway',
        'Consider patient history: COPD, asthma, heart failure, trauma',
        'Determine appropriate oxygen concentration and delivery method'
      ],
      contraindications: [
        'Facial trauma preventing mask seal (for certain delivery methods)',
        'Active vomiting with altered consciousness (aspiration risk)',
        'Suspected pneumothorax without decompression'
      ]
    },
    {
      id: 'skill-010-step-3',
      stepNumber: 3,
      title: 'Select appropriate delivery method',
      description: 'Choose correct oxygen delivery device based on patient needs',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Nasal cannula (1-6L/min): Provides 24-44% FiO2, comfortable for conscious patients',
        'Simple face mask (6-10L/min): Provides 35-60% FiO2, minimum 6L/min to prevent rebreathing',
        'Non-rebreather mask (10-15L/min): Provides 60-95% FiO2, for severely hypoxic patients',
        'Venturi mask: Provides precise FiO2 (24%, 28%, 35%, 40%), ideal for COPD patients',
        'Consider patient comfort, mobility needs, and severity of hypoxia',
        'Start with higher concentration and titrate down based on response'
      ]
    }
  ],

  // HGT/GLUCOSE TESTING - Enhanced with blood glucose monitoring focus
  'skill-011': [
    {
      id: 'skill-011-step-1',
      stepNumber: 1,
      title: 'Equipment preparation and calibration',
      description: 'Prepare glucose meter and verify proper function',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Check glucose meter battery level and ensure it\'s functioning',
        'Verify test strips are not expired and stored properly (dry, room temperature)',
        'Insert test strip into meter and wait for "ready" signal',
        'Prepare lancet device with new sterile lancet',
        'Gather alcohol swabs, gauze, and disposal container',
        'Ensure proper hand hygiene before handling equipment',
        'Document meter calibration if required by local protocol'
      ],
      equipmentNeeded: [
        'Blood glucose meter',
        'Test strips (not expired)',
        'Lancet device and sterile lancets',
        'Alcohol swabs',
        'Gauze pads',
        'Gloves',
        'Sharps container'
      ],
      safetyNotes: [
        'Use universal precautions - wear gloves for all blood contact',
        'Each lancet is single-use only to prevent cross-contamination'
      ]
    },
    {
      id: 'skill-011-step-2',
      stepNumber: 2,
      title: 'Patient preparation and site selection',
      description: 'Prepare patient and select appropriate puncture site',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Explain procedure to patient: "I need to check your blood sugar with a small prick"',
        'Select fingertip site: use sides of fingertips, avoid thumb and index finger',
        'Avoid areas that are swollen, infected, or heavily calloused',
        'Warm hands if cold to improve circulation and blood flow',
        'Clean selected site with alcohol swab and allow to dry completely',
        'Position patient comfortably with hand supported'
      ],
      contraindications: [
        'Infected or damaged skin at puncture site',
        'Severe peripheral vascular disease affecting circulation',
        'Patient refusal (conscious patients only)'
      ]
    },
    {
      id: 'skill-011-step-3',
      stepNumber: 3,
      title: 'Obtain blood sample and test',
      description: 'Perform fingerstick and analyze blood glucose',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Hold finger firmly but gently, puncture quickly with confident motion',
        'Squeeze finger gently to encourage blood drop formation',
        'Apply sufficient blood to completely cover test strip pad',
        'Avoid excessive squeezing which can dilute sample with tissue fluid',
        'Apply pressure with gauze to puncture site to control bleeding',
        'Wait for meter to display result (usually 5-15 seconds)',
        'Document result immediately and note time of test'
      ],
      safetyNotes: [
        'Dispose of lancet immediately in sharps container',
        'Ensure bleeding has stopped before leaving patient',
        'Be prepared to treat severe hypoglycemia (<4.0 mmol/L) or hyperglycemia (>15.0 mmol/L)'
      ]
    }
  ],

  // ECG 12-LEAD - Enhanced with cardiac monitoring focus
  'skill-012': [
    {
      id: 'skill-012-step-1',
      stepNumber: 1,
      title: 'Equipment preparation and patient explanation',
      description: 'Prepare ECG machine and explain procedure to patient',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Check ECG machine power, paper supply, and electrode cable connections',
        'Verify all 12 leads are properly connected and labeled',
        'Prepare 10 ECG electrodes, ensuring they are not expired and adhesive is intact',
        'Explain procedure: "I need to check your heart rhythm with electrode stickers"',
        'Reassure patient about safety: "This only reads electrical activity, no electricity is given"',
        'Ensure patient privacy and comfortable positioning',
        'Ask about any chest hair that may need trimming for electrode adhesion'
      ],
      equipmentNeeded: [
        '12-lead ECG machine',
        '10 ECG electrodes',
        'Electrode cables',
        'Razor if needed for hair removal',
        'Alcohol swabs',
        'ECG paper'
      ]
    },
    {
      id: 'skill-012-step-2',
      stepNumber: 2,
      title: 'Limb lead placement',
      description: 'Apply limb electrodes in correct anatomical positions',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Position patient supine with arms at sides, legs uncrossed',
        'Clean electrode sites with alcohol if needed and allow to dry',
        'Right arm (RA/white): Right wrist or upper arm, avoiding bony prominences',
        'Left arm (LA/black): Left wrist or upper arm, mirror image of right',
        'Right leg (RL/green): Right ankle or lower leg - this is the ground electrode',
        'Left leg (LL/red): Left ankle or lower leg, avoid bony areas',
        'Ensure electrodes have good skin contact and are not over joints'
      ],
      safetyNotes: [
        'Avoid placing electrodes over areas of broken skin or surgical scars',
        'Ensure patient is still and relaxed to minimize artifact'
      ]
    },
    {
      id: 'skill-012-step-3',
      stepNumber: 3,
      title: 'Precordial lead placement',
      description: 'Position chest electrodes in precise anatomical locations',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'V1 (red): 4th intercostal space, right sternal border',
        'V2 (yellow): 4th intercostal space, left sternal border',
        'V3 (green): Midway between V2 and V4 positions',
        'V4 (blue): 5th intercostal space, left midclavicular line',
        'V5 (orange): Same horizontal level as V4, left anterior axillary line',
        'V6 (purple): Same horizontal level as V4 and V5, left midaxillary line',
        'Ensure precise placement - errors significantly affect interpretation'
      ]
    }
  ],

  // BAG VALVE MASK VENTILATION - Enhanced with airway management focus
  'skill-013': [
    {
      id: 'skill-013-step-1',
      stepNumber: 1,
      title: 'Equipment assembly and checks',
      description: 'Assemble BVM and verify all components function correctly',
      isRequired: true,
      isCritical: true,
      timeEstimate: 90,
      keyPoints: [
        'Select appropriate mask size - should seal from bridge of nose to cleft of chin',
        'Attach mask to bag-valve unit, ensuring secure connection',
        'Connect oxygen reservoir bag and oxygen tubing',
        'Set oxygen flow to 10-15 L/min to inflate reservoir completely',
        'Test bag function by squeezing - should reinflate quickly when released',
        'Check for leaks in system by covering mask and squeezing bag',
        'Ensure PEEP valve is available if indicated'
      ],
      equipmentNeeded: [
        'Bag-valve-mask (appropriate size)',
        'Oxygen source and tubing',
        'Reservoir bag',
        'Suction equipment',
        'Oropharyngeal airway (if needed)',
        'PEEP valve (if required)'
      ],
      safetyNotes: [
        'Always have suction equipment ready for immediate use',
        'Verify oxygen connections are secure to prevent disconnection during use'
      ]
    },
    {
      id: 'skill-013-step-2',
      stepNumber: 2,
      title: 'Patient positioning and airway opening',
      description: 'Position patient optimally for effective ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 60,
      keyPoints: [
        'Position patient supine with head in neutral or slightly extended position',
        'Use head-tilt, chin-lift maneuver for non-trauma patients',
        'Use jaw-thrust maneuver if cervical spine injury is suspected',
        'Clear visible obstructions from mouth and throat',
        'Consider oropharyngeal airway if patient is unconscious',
        'Ensure optimal mask seal positioning before beginning ventilation'
      ],
      contraindications: [
        'Suspected cervical spine injury (modify technique, don\'t avoid)',
        'Facial trauma preventing adequate mask seal',
        'Active vomiting without suction available'
      ]
    },
    {
      id: 'skill-013-step-3',
      stepNumber: 3,
      title: 'Mask seal and ventilation technique',
      description: 'Establish proper mask seal and deliver effective ventilation',
      isRequired: true,
      isCritical: true,
      timeEstimate: 120,
      keyPoints: [
        'Use C-E grip: thumb and index finger form "C" around mask, remaining fingers form "E" under jaw',
        'Apply gentle downward pressure on mask while lifting jaw upward',
        'Ensure complete seal around mask edges - no air leaks audible',
        'Squeeze bag smoothly over 1 second, delivering 6-7 mL/kg tidal volume',
        'Watch for chest rise with each breath - indicates effective ventilation',
        'Release bag completely and allow passive exhalation',
        'Ventilate at 10-12 breaths/minute for adults, 12-20/minute for children'
      ],
      safetyNotes: [
        'Avoid excessive ventilation rate and volume - can cause gastric insufflation',
        'If chest doesn\'t rise, recheck airway positioning and mask seal'
      ]
    }
  ]
};

// Function to enhance existing skills with detailed keyPoints
export function enhanceSkillWithDetails(skill: any): any {
  const enhancedSteps = enhancedSkillSteps[skill.id];
  
  if (enhancedSteps) {
    return {
      ...skill,
      steps: skill.steps.map((step: any) => {
        const enhancement = enhancedSteps.find(e => e.stepNumber === step.stepNumber);
        if (enhancement) {
          return {
            ...step,
            description: enhancement.description,
            keyPoints: enhancement.keyPoints,
            contraindications: enhancement.contraindications,
            safetyNotes: enhancement.safetyNotes,
            equipmentNeeded: enhancement.equipmentNeeded,
            timeEstimate: enhancement.timeEstimate
          };
        }
        return step;
      })
    };
  }
  
  return skill;
}