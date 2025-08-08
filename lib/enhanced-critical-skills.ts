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
  ]
};

// Skill metadata with enhanced information
export const criticalSkillsMetadata = {
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
  }
};

export default enhancedCriticalSkillSteps;