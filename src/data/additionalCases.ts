import type { CaseScenario } from '@/types';

// Helper function to create a case with enhanced structure
const createCase = (caseData: Partial<CaseScenario> & { id: string; title: string }): CaseScenario => ({
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...caseData,
} as CaseScenario);

// ============================================================================
// ADDITIONAL RESPIRATORY CASES (Adding 6+ cases)
// ============================================================================

export const additionalRespiratoryCases: CaseScenario[] = [
  createCase({
    id: 'resp-005',
    title: 'Severe COPD Exacerbation',
    category: 'respiratory',
    priority: 'high',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Elderly man struggling to breathe, known COPD',
      timeOfDay: 'early-morning',
      location: 'Villa in Al Ain',
      callerInfo: 'Wife',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 72,
      gender: 'male',
      weight: 65,
      occupation: 'Retired teacher',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Bedroom, patient sitting upright on edge of bed',
      hazards: ['Oxygen concentrator present'],
      bystanders: 'Wife distressed',
      environment: 'Warm, poorly ventilated room'
    },
    initialPresentation: {
      generalImpression: 'Elderly male, tripod position, using accessory muscles',
      position: 'Sitting upright, leaning forward',
      appearance: 'Cyanotic lips, diaphoretic, barrel chest',
      consciousness: 'Alert but anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent but compromised', 'Unable to speak in full sentences'],
        interventions: ['High-flow O2', 'Prepare for BVM']
      },
      breathing: {
        rate: 32,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 78,
        findings: ['Severe dyspnea', 'Prolonged expiration', 'Wheeze bilateral', 'Pursed lip breathing'],
        interventions: ['Nebulized bronchodilators', 'Oxygen titrated to 88-92%', 'Consider NIV']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Regular',
        bp: { systolic: 160, diastolic: 90 },
        capillaryRefill: 3,
        skin: 'Warm, cyanotic peripheries',
        findings: ['Tachycardic', 'Hypertensive from effort'],
        interventions: ['IV access', 'Monitor']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious but fully oriented'],
        interventions: ['Reassurance', 'Calm environment']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Barrel chest', 'Accessory muscle use', 'Cyanosis'],
        interventions: ['Remove restrictive clothing']
      }
    },
    secondarySurvey: {
      head: ['Alert', 'Cyanotic lips'],
      neck: ['JVD present', 'Trachea central'],
      chest: ['Hyperinflated', 'Bilateral wheeze', 'Poor air entry bases'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Peripheral cyanosis', 'Asterixis (CO2 retention flap)'],
      posterior: ['Normal'],
      neurological: ['CO2 retention causing confusion']
    },
    history: {
      medications: [
        { name: 'Salbutamol inhaler', dose: '100mcg', frequency: 'PRN', indication: 'COPD' },
        { name: 'Ipratropium', dose: '40mcg', frequency: 'QID', indication: 'COPD' },
        { name: 'Prednisolone', dose: '5mg', frequency: 'Daily', indication: 'Maintenance' }
      ],
      allergies: ['Sulfa drugs'],
      medicalConditions: ['COPD (Gold Stage 3)', 'Hypertension', 'Type 2 Diabetes'],
      surgicalHistory: [],
      lastMeal: 'Dinner 8 hours ago',
      eventsLeading: 'Woke up severely short of breath, inhalers not helping'
    },
    vitalSignsProgression: {
      initial: { bp: '160/90', pulse: 110, respiration: 32, spo2: 78, gcs: 15, temperature: 37.2 }
    },
    expectedFindings: {
      keyObservations: ['Severe COPD exacerbation', 'CO2 retention likely', 'Respiratory failure imminent'],
      redFlags: ['Type 2 respiratory failure', 'Exhaustion', 'Drowsiness from CO2 retention'],
      differentialDiagnoses: ['COPD exacerbation', 'Pneumonia', 'Pulmonary embolism', 'Pneumothorax'],
      mostLikelyDiagnosis: 'Acute on Chronic Type 2 Respiratory Failure'
    },
    studentChecklist: [
      { id: 'resp5-1', category: 'abcde', description: 'Controlled oxygen therapy 88-92%', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'resp5-2', category: 'intervention', description: 'Nebulized bronchodilators', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp5-3', category: 'abcde', description: 'Assess for CO2 retention (flap, headache, drowsiness)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp5-4', category: 'intervention', description: 'Consider NIV (BiPAP) early', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'resp5-5', category: 'intervention', description: 'Systemic steroids', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] }
    ],
    teachingPoints: [
      'In COPD, target SpO2 88-92% to avoid CO2 narcosis',
      'NIV reduces need for intubation in COPD exacerbations',
      'Systemic steroids improve outcomes in acute exacerbations',
      'Watch for silent chest - impending respiratory arrest'
    ],
    commonPitfalls: [
      'Giving high-flow oxygen (15L/min) without considering CO2 retention risk',
      'Failing to recognize asterixis (flapping tremor) as sign of CO2 narcosis',
      'Delaying NIV initiation until patient is exhausted',
      'Not checking home oxygen prescription and flow rates',
      'Overlooking the need for controlled oxygen therapy in known CO2 retainers',
      'Missing contraindications to NIV (vomiting, facial trauma, reduced GCS)',
      'Inadequate reassessment after interventions - need serial ABGs',
      'Not preparing for potential intubation early',
      'Failing to identify precipitating causes (infection, heart failure, PE)',
      'Not communicating with family about potential need for mechanical ventilation'
    ],
    equipmentNeeded: [
      'Oxygen therapy equipment with flowmeters (0-15L)',
      'Nebulizer kit and bronchodilators (salbutamol, ipratropium)',
      'Pulse oximeter',
      'Capnography/ETCO2 monitor',
      'NIV/BiPAP machine with appropriate masks',
      'IV access equipment and fluids',
      'Suction equipment',
      'Bag-valve-mask with PEEP valve',
      'Cardiac monitor',
      'Blood gas analyzer or i-STAT',
      'Steroids (hydrocortisone/prednisolone)',
      'Antibiotics (if pneumonia suspected)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Clinical Practice Guidelines - Respiratory Emergencies',
        'DCAS COPD Exacerbation Protocol',
        'NICE Guidelines NG115 - Chronic Obstructive Pulmonary Disease',
        'GOLD Guidelines 2024 - COPD Management'
      ],
      receivingFacilities: [
        {
          name: 'Tawam Hospital',
          location: 'Al Ain',
          capabilities: ['24/7 Emergency Department', 'Respiratory ICU', 'Pulmonary Services', 'Bronchoscopy'],
          contact: '03 767 7444',
          distance: '15 minutes from central Al Ain'
        },
        {
          name: 'Al Ain Hospital',
          location: 'Al Ain',
          capabilities: ['Emergency Department', 'Internal Medicine', 'Respiratory Care'],
          contact: '03 702 2000',
          distance: '10 minutes from central Al Ain'
        },
        {
          name: 'Rashid Hospital',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Department', 'Respiratory ICU', 'Advanced Ventilation Support'],
          contact: '04 219 3000',
          distance: '90 minutes from Al Ain'
        },
        {
          name: 'Sheikh Khalifa Medical City',
          location: 'Abu Dhabi',
          capabilities: ['Emergency Department', 'Pulmonary Unit', 'Critical Care'],
          contact: '02 610 2000',
          distance: '75 minutes from Al Ain'
        }
      ],
      localConsiderations: [
        'During Ramadan, elderly patients may delay seeking help until symptoms are severe',
        'Al Ain location - transport to nearest major hospital (Tawam or Al Ain Hospital)',
        'Family involvement in medical decisions is culturally important',
        'May have difficulty affording medications - check compliance with home oxygen',
        'Language barrier may require Arabic-speaking paramedic or translator',
        'Summer heat can exacerbate COPD - ensure cool transport environment',
        'Home oxygen use common - ensure safe handling during transport',
        'Emirati families often prefer male paramedics for elderly male patients',
        'Sons or senior male relatives typically make medical decisions for elderly patients'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-copd-001',
          type: 'image',
          title: 'COPD Barrel Chest Anatomy',
          url: 'https://radiopaedia.org/cases/barrel-chest',
          source: 'Radiopaedia',
          relevance: 'important',
          tags: ['COPD', 'barrel-chest', 'anatomy']
        },
        {
          id: 'img-copd-002',
          type: 'image',
          title: 'Tripod Position in Respiratory Distress',
          url: 'https://teachmepaeds.com/tripod-position/',
          source: 'Teach Me Paeds',
          relevance: 'important',
          tags: ['COPD', 'tripod', 'positioning']
        }
      ],
      videos: [
        {
          id: 'vid-copd-001',
          type: 'video',
          title: 'COPD Exacerbation: Pathophysiology and Management',
          url: 'https://www.youtube.com/watch?v=JhzUUn9YiMM',
          source: 'Osmosis from Elsevier',
          duration: '15:42',
          relevance: 'essential',
          tags: ['COPD', 'exacerbation', 'pathophysiology']
        },
        {
          id: 'vid-copd-002',
          type: 'video',
          title: 'NIV in COPD - Setup and Practical Tips',
          url: 'https://www.youtube.com/watch?v=kUNxXRqDBWs',
          source: 'Ninja Nerd',
          duration: '12:35',
          relevance: 'essential',
          tags: ['NIV', 'BiPAP', 'COPD', 'ventilation']
        },
        {
          id: 'vid-copd-003',
          type: 'video',
          title: 'CO2 Retention and Controlled Oxygen Therapy',
          url: 'https://www.youtube.com/watch?v=4fMM6qTa7bY',
          source: 'MedCram',
          duration: '14:20',
          relevance: 'essential',
          tags: ['CO2', 'retention', 'oxygen', 'COPD']
        }
      ],
      articles: [
        {
          id: 'art-copd-001',
          type: 'article',
          title: 'COPD Exacerbation: Assessment and Management',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5448391/',
          source: 'International Journal of COPD',
          relevance: 'essential',
          tags: ['COPD', 'exacerbation', 'management']
        },
        {
          id: 'art-copd-002',
          type: 'article',
          title: 'Oxygen Therapy in COPD: What is the Right Target?',
          url: 'https://www.bmj.com/content/361/bmj.k2326',
          source: 'British Medical Journal',
          relevance: 'essential',
          tags: ['oxygen', 'COPD', 'target', 'SpO2']
        },
        {
          id: 'art-copd-003',
          type: 'article',
          title: 'GOLD 2024 Report: Global Strategy for COPD',
          url: 'https://goldcopd.org/2024-gold-report/',
          source: 'GOLD Initiative',
          relevance: 'important',
          tags: ['GOLD', 'guidelines', 'COPD', '2024']
        },
        {
          id: 'art-copd-004',
          type: 'article',
          title: 'COPD Exacerbation - CCC',
          url: 'https://litfl.com/copd-exacerbation/',
          source: 'Life in the Fast Lane',
          relevance: 'supplementary',
          tags: ['COPD', 'exacerbation', 'emergency', 'LITFL']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-006',
    title: 'Pneumothorax After Chest Trauma',
    category: 'respiratory',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Man fell from ladder, chest pain, difficulty breathing',
      timeOfDay: 'afternoon',
      location: 'Construction site, Dubai Marina',
      callerInfo: 'Coworker',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 34,
      gender: 'male',
      weight: 80,
      occupation: 'Construction worker',
      language: 'Hindi, Basic English'
    },
    sceneInfo: {
      description: 'Construction site, patient on ground near scaffolding',
      hazards: ['Fallen tools', 'Unstable ladder', 'Construction materials'],
      bystanders: 'Coworkers gathered',
      environment: 'Outdoor, hot, dusty'
    },
    initialPresentation: {
      generalImpression: 'Young male, sitting upright, holding right side of chest',
      position: 'Sitting, leaning to right side',
      appearance: 'Diaphoretic, distressed, rapid breathing',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: ['Oxygen']
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 88,
        findings: ['Right-sided chest pain', 'Decreased breath sounds right', 'Hyper-resonant percussion', 'Tracheal deviation to left'],
        interventions: ['High-flow O2', 'Prepare for chest decompression']
      },
      circulation: {
        pulseRate: 120,
        pulseQuality: 'Regular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Pale, clammy',
        findings: ['Tachycardic'],
        interventions: ['IV access']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Oriented'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Right chest bruising', 'Rib tenderness', 'No open wounds'],
        interventions: ['Chest seal if open pneumothorax']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Trachea deviated to left', 'No JVD'],
      chest: ['Right chest bruising', 'Tender ribs 4-6', 'Decreased air entry right', 'Hyper-resonant'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: [],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Fell from 3-meter ladder, landed on right side'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 120, respiration: 28, spo2: 88, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Tension pneumothorax developing', 'Tracheal deviation', 'Respiratory distress'],
      redFlags: ['Tension pneumothorax', 'Cardiac arrest imminent'],
      differentialDiagnoses: ['Tension pneumothorax', 'Simple pneumothorax', 'Hemothorax', 'Rib fractures'],
      mostLikelyDiagnosis: 'Tension Pneumothorax'
    },
    managementPathway: {
      immediate: ['High-flow oxygen 15L/min via non-rebreather', 'Immediate needle decompression 2nd ICS mid-clavicular line OR 4th/5th ICS mid-axillary line', 'Use 14G or 16G cannula (4.5-8cm length depending on chest wall)', 'IV access with large-bore cannula', 'Fluid resuscitation if hypotensive', 'C-spine immobilization maintained', 'Chest seal if open pneumothorax'],
      definitive: ['Formal chest drain insertion (28-32F) at hospital', 'Chest X-ray to confirm resolution', 'Thoracic surgery consult if ongoing air leak', 'Pain management for rib fractures'],
      monitoring: ['Continuous SpO2 monitoring', 'Respiratory rate and effort', 'Blood pressure', 'Tracheal position', 'Breath sounds after decompression', 'Monitor for re-tensioning'],
      transportConsiderations: ['Immediate transport after needle decompression', 'Pre-alert trauma center', 'Continue high-flow oxygen en route', 'Monitor for deterioration', 'Do not delay transport for chest drain insertion', 'Maintain C-spine precautions throughout']
    },
    studentChecklist: [
      { id: 'resp6-1', category: 'abcde', description: 'Recognize tension pneumothorax signs', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'resp6-2', category: 'intervention', description: 'Needle decompression 2nd intercostal space', points: 20, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'resp6-3', category: 'abcde', description: 'High-flow oxygen', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp6-4', category: 'intervention', description: 'IV access and fluid resuscitation', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp6-5', category: 'abcde', description: 'Auscultate for absent breath sounds on affected side', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp6-6', category: 'abcde', description: 'Assess for tracheal deviation and JVD', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp6-7', category: 'abcde', description: 'Maintain cervical spine precautions', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'resp6-8', category: 'intervention', description: 'Position patient sitting upright if tolerated', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp6-9', category: 'intervention', description: 'Apply chest seal if open pneumothorax present', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp6-10', category: 'abcde', description: 'Monitor respiratory rate and effort continuously', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp6-11', category: 'communication', description: 'Pre-alert trauma center for definitive chest tube', points: 10, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp6-12', category: 'documentation', description: 'Document mechanism of injury and interventions', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Tension pneumothorax is a clinical diagnosis - do not wait for X-ray',
      'Needle decompression is life-saving in tension pneumothorax',
      'Signs: hypotension, tracheal deviation, distended neck veins, absent breath sounds'
    ],
    commonPitfalls: [
      'Waiting for chest X-ray confirmation before treating tension pneumothorax',
      'Performing needle decompression on the wrong side',
      'Inserting needle too medially (risk of hitting heart/great vessels)',
      'Not recognizing tension pneumothorax in patients with bilateral breath sounds (check tracheal deviation)',
      'Using 14G needle that is too short in obese patients',
      'Failing to prepare for immediate chest tube placement after needle decompression',
      'Not checking for open pneumothorax (sucking chest wound)',
      'Delaying oxygen administration while preparing for decompression',
      'Missing associated injuries (rib fractures, hemothorax, flail chest)',
      'Not reassessing after decompression - may need second attempt or different site'
    ],
    equipmentNeeded: [
      '14G or 16G IV cannula (minimum 4.5cm length, consider 8cm in obese patients)',
      'Alcohol swabs / chlorhexidine',
      'Gloves and sterile drapes',
      'High-flow oxygen (15L/min) with non-rebreather mask',
      'Chest seals (vented for open pneumothorax)',
      'IV access equipment and crystalloid fluids',
      'Cardiac monitor',
      'Pulse oximeter',
      'Stethoscope',
      'Portable suction',
      'Bag-valve-mask',
      'Chest tube insertion kit (for hospital)',
      'Occlusive dressings'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Trauma Protocol - Chest Injuries',
        'DCAS Needle Decompression Guidelines',
        'PHTLS - Prehospital Trauma Life Support Standards',
        'ATLS - Advanced Trauma Life Support Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Trauma Center',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level 1 Trauma Center', '24/7 Thoracic Surgery', 'Cardiothoracic ICU'],
          contact: '04 219 3000',
          distance: '20 minutes from Dubai Marina'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Trauma Services', 'Chest Surgery'],
          contact: '04 222 1211',
          distance: '25 minutes from Dubai Marina'
        },
        {
          name: 'Saudi German Hospital Dubai',
          location: 'Dubai',
          capabilities: ['Emergency Department', 'Trauma Unit', 'ICU'],
          contact: '04 389 0000',
          distance: '15 minutes from Dubai Marina'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Emergency Department', 'Trauma Services'],
          contact: '04 435 9999',
          distance: '18 minutes from Dubai Marina'
        }
      ],
      localConsiderations: [
        'Construction workers in UAE often on short-term visas - may fear reporting injuries due to employment concerns',
        'Dubai Marina location - heavy traffic during peak hours, consider water ambulance if available',
        'Many construction workers speak Hindi/Urdu - ensure language support',
        'Summer heat at construction sites can reach 50°C - prioritize cooling and hydration',
        'Work site safety officers must be involved per UAE labor laws',
        'Police notification required for workplace accidents resulting in hospitalization',
        'Employer sponsorship system may affect patient willingness to seek care',
        'Document fall height precisely for legal/workers compensation purposes'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-tension-001',
          type: 'image',
          title: 'Tension Pneumothorax Pathophysiology',
          url: 'https://wikem.org/wiki/Tension_pneumothorax',
          source: 'WikEM',
          relevance: 'essential',
          tags: ['tension-pneumothorax', 'pathophysiology', 'anatomy']
        },
        {
          id: 'img-tension-002',
          type: 'image',
          title: 'Needle Decompression Landmarks',
          url: 'https://radiopaedia.org/articles/needle-thoracostomy',
          source: 'Radiopaedia',
          relevance: 'essential',
          tags: ['needle-decompression', 'landmarks', 'procedure']
        },
        {
          id: 'img-tension-003',
          type: 'image',
          title: 'Chest X-ray: Tension Pneumothorax',
          url: 'https://radiopaedia.org/cases/tension-pneumothorax',
          source: 'Radiopaedia',
          relevance: 'important',
          tags: ['tension-pneumothorax', 'x-ray', 'imaging']
        }
      ],
      videos: [
        {
          id: 'vid-tension-001',
          type: 'video',
          title: 'Tension Pneumothorax: Recognition and Management',
          url: 'https://www.youtube.com/watch?v=rfLKwFO5gUY',
          source: 'EMSWorld.com',
          duration: '12:45',
          relevance: 'essential',
          tags: ['tension-pneumothorax', 'recognition', 'management']
        },
        {
          id: 'vid-tension-002',
          type: 'video',
          title: 'Needle Decompression Technique',
          url: 'https://www.youtube.com/watch?v=1AlFaLuuPVs',
          source: 'PrepMedic',
          duration: '8:30',
          relevance: 'essential',
          tags: ['needle-decompression', 'technique', 'chest']
        },
        {
          id: 'vid-tension-003',
          type: 'video',
          title: 'Chest Trauma in EMS',
          url: 'https://www.youtube.com/watch?v=8em3FPEJ4L4',
          source: 'Armando Hasudungan',
          duration: '16:20',
          relevance: 'important',
          tags: ['chest-trauma', 'EMS', 'pneumothorax']
        }
      ],
      articles: [
        {
          id: 'art-tension-001',
          type: 'article',
          title: 'Tension Pneumothorax: A Clinical Diagnosis',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3088148/',
          source: 'Open Access Emergency Medicine',
          relevance: 'essential',
          tags: ['tension-pneumothorax', 'clinical-diagnosis']
        },
        {
          id: 'art-tension-002',
          type: 'article',
          title: 'Tension Pneumothorax',
          url: 'https://wikem.org/wiki/Tension_pneumothorax',
          source: 'WikEM',
          relevance: 'essential',
          tags: ['tension-pneumothorax', 'emergency', 'management']
        },
        {
          id: 'art-tension-003',
          type: 'article',
          title: 'Prehospital Management of Chest Trauma',
          url: 'https://www.jems.com/patient-care/chest-trauma/',
          source: 'JEMS',
          relevance: 'important',
          tags: ['chest-trauma', 'prehospital', 'management']
        },
        {
          id: 'art-tension-004',
          type: 'article',
          title: 'Needle Thoracostomy: Site Selection and Technique',
          url: 'https://litfl.com/needle-thoracostomy/',
          source: 'Life in the Fast Lane',
          relevance: 'important',
          tags: ['needle-thoracostomy', 'technique', 'site']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-007',
    title: 'Pediatric Croup with Stridor',
    category: 'respiratory',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '2-year-old with barking cough, difficulty breathing',
      timeOfDay: 'evening',
      location: 'Apartment, Jumeirah',
      callerInfo: 'Mother',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 2,
      gender: 'male',
      weight: 12,
      occupation: 'N/A',
      language: 'None'
    },
    sceneInfo: {
      description: 'Living room, child on mother\'s lap',
      hazards: [],
      bystanders: 'Parents',
      environment: 'Calm, air-conditioned'
    },
    initialPresentation: {
      generalImpression: 'Toddler, sitting on mother\'s lap, appears frightened',
      position: 'Sitting upright, preferring parents',
      appearance: 'Mild respiratory distress, barking cough',
      consciousness: 'Alert, clingy'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Stridor at rest', 'Barking cough', 'Hoarse voice'],
        interventions: ['Keep calm', 'Nebulized epinephrine']
      },
      breathing: {
        rate: 40,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Intercostal recession', 'Nasal flaring', 'Stridor'],
        interventions: ['Humidified oxygen', 'Steroids']
      },
      circulation: {
        pulseRate: 130,
        pulseQuality: 'Regular',
        bp: { systolic: 90, diastolic: 55 },
        capillaryRefill: 2,
        skin: 'Warm, pink',
        findings: ['Age-appropriate tachycardia'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 3, motor: 6, total: 13 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Appropriate for age'],
        interventions: ['Minimize distress']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Normal skin', 'No rash'],
        interventions: ['Keep warm']
      }
    },
    secondarySurvey: {
      head: ['Alert', 'Frightened'],
      neck: ['Normal'],
      chest: ['Intercostal recession', 'Clear air entry'],
      abdomen: ['Soft'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal for age']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Milk before bed',
      eventsLeading: 'Started with cold symptoms 2 days ago, barking cough started tonight'
    },
    vitalSignsProgression: {
      initial: { bp: '90/55', pulse: 130, respiration: 40, spo2: 94, gcs: 13 }
    },
    expectedFindings: {
      keyObservations: ['Classic croup presentation', 'Stridor at rest indicates moderate severity'],
      redFlags: ['Stridor at rest', 'Intercostal recession', 'Altered consciousness'],
      differentialDiagnoses: ['Viral croup', 'Bacterial tracheitis', 'Epiglottitis', 'Foreign body'],
      mostLikelyDiagnosis: 'Viral Laryngotracheobronchitis (Croup)'
    },
    studentChecklist: [
      { id: 'resp7-1', category: 'abcde', description: 'Assess severity of croup (stridor at rest vs exertion)', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-2', category: 'intervention', description: 'Nebulized epinephrine for moderate-severe croup', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp7-3', category: 'intervention', description: 'Systemic steroids (dexamethasone)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp7-4', category: 'abcde', description: 'Keep child calm - crying worsens symptoms', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-5', category: 'abcde', description: 'Assess for signs of respiratory distress and retractions', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-6', category: 'abcde', description: 'Check oxygen saturation continuously', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-7', category: 'history', description: 'Ask about onset and preceding cold symptoms', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-8', category: 'abcde', description: 'Position child upright on parents lap', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-9', category: 'abcde', description: 'Differentiate from epiglottitis (drooling, toxic appearance)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp7-10', category: 'intervention', description: 'Provide humidified oxygen if hypoxic', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-11', category: 'communication', description: 'Reassure parents and explain treatment plan', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp7-12', category: 'documentation', description: 'Document stridor characteristics and interventions', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Croup is a clinical diagnosis - barking cough and stridor',
      'Nebulized epinephrine provides rapid but temporary relief',
      'Steroids reduce airway edema and hospitalization rates',
      'Avoid agitating the child - crying worsens symptoms'
    ],
    commonPitfalls: [
      'Agitating the child by attempting examination before building rapport',
      'Not assessing stridor characteristics at rest vs with exertion',
      'Missing red flags that indicate epiglottitis (drooling, tripod position, toxic appearance)',
      'Failing to have airway equipment ready despite reassuring initial appearance',
      'Delaying epinephrine administration in moderate-severe croup',
      'Using mask that does not seal well, reducing medication delivery',
      'Not monitoring for epinephrine side effects (tachycardia, tremors)',
      'Overlooking foreign body aspiration as differential diagnosis',
      'Separating child from parent - increases anxiety and worsens stridor',
      'Not educating parents about recurrence risk and when to seek help'
    ],
    equipmentNeeded: [
      'Pediatric nebulizer with mask appropriate for age',
      'Racemic epinephrine or L-epinephrine (1:1000)',
      'Dexamethasone (oral or IV)',
      'Pediatric oxygen masks and nasal cannulas',
      'Pulse oximeter (pediatric probe)',
      'Pediatric BVM and airway adjuncts',
      'Suction equipment (Yankauer and pediatric catheters)',
      'Laryngoscope with pediatric blades',
      'Pediatric ET tubes (various sizes)',
      'IV access equipment (pediatric sizes)',
      'Cardiac monitor',
      'Croup score chart/assessment tool',
      'Humidified oxygen setup',
      'Toys/distraction items for pediatric patients'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Pediatric Respiratory Distress Protocol',
        'DCAS Croup Management Guidelines',
        'AAP Clinical Practice Guideline: Management of Croup',
        'NICE Guidelines NG143: Bronchiolitis in Children'
      ],
      receivingFacilities: [
        {
          name: 'Al Jalila Children\'s Specialty Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric ICU', 'Pediatric ENT', '24/7 Pediatric Services'],
          contact: '04 203 1000',
          distance: '15 minutes from Jumeirah'
        },
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric ICU', 'Pediatric Specialists'],
          contact: '04 219 3000',
          distance: '12 minutes from Jumeirah'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Pediatric Emergency', 'Pediatric Ward'],
          contact: '04 435 9999',
          distance: '15 minutes from Jumeirah'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha',
          capabilities: ['Pediatric Emergency', 'Pediatric Specialists'],
          contact: '04 377 5500',
          distance: '10 minutes from Jumeirah'
        }
      ],
      localConsiderations: [
        'Jumeirah is family-oriented area - likely both parents present',
        'Many expatriate families in Jumeirah - may have different cultural approaches to pediatric care',
        'Ramadan timing affects availability of pediatricians in some hospitals',
        'Private insurance coverage important - some families may prefer private hospitals',
        'School/nursery season affects croup prevalence - more common in winter months',
        'High humidity in UAE can actually help croup symptoms',
        'Many nannies/housekeepers care for children - ensure clear communication',
        'Vaccination schedules may vary by nationality - check Hib and pneumococcal status'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-croup-001',
          type: 'image',
          title: 'Croup: Assessment and Management',
          url: 'https://dontforgetthebubbles.com/croup/',
          source: "Don't Forget the Bubbles",
          relevance: 'essential',
          tags: ['croup', 'anatomy', 'pathophysiology', 'pediatric']
        },
        {
          id: 'img-croup-002',
          type: 'image',
          title: 'Croup X-ray - Steeple Sign',
          url: 'https://radiopaedia.org/cases/croup',
          source: 'Radiopaedia',
          relevance: 'important',
          tags: ['croup', 'x-ray', 'steeple-sign']
        },
        {
          id: 'img-croup-003',
          type: 'image',
          title: 'NICE Guideline: Croup in Children',
          url: 'https://www.nice.org.uk/guidance/ng143',
          source: 'NICE Guidelines',
          relevance: 'important',
          tags: ['croup', 'guidelines', 'NICE', 'pediatric']
        }
      ],
      videos: [
        {
          id: 'vid-croup-001',
          type: 'video',
          title: 'Pediatric Croup: Assessment and Management',
          url: 'https://www.youtube.com/watch?v=Thj4EiFPyNA',
          source: 'Osmosis from Elsevier',
          duration: '14:30',
          relevance: 'essential',
          tags: ['croup', 'pediatric', 'assessment']
        },
        {
          id: 'vid-croup-002',
          type: 'video',
          title: 'Stridor in Children: Differential Diagnosis',
          url: 'https://www.youtube.com/watch?v=AKRr2PMl4zE',
          source: 'MedCram',
          duration: '11:45',
          relevance: 'essential',
          tags: ['stridor', 'children', 'differential']
        },
        {
          id: 'vid-croup-003',
          type: 'video',
          title: 'Epiglottitis vs Croup: How to Differentiate',
          url: 'https://www.youtube.com/watch?v=P7Fkg7_yXL0',
          source: 'Strong Medicine',
          duration: '8:20',
          relevance: 'essential',
          tags: ['epiglottitis', 'croup', 'differentiation']
        },
        {
          id: 'vid-croup-004',
          type: 'video',
          title: 'Croup (Laryngotracheobronchitis) - Pediatric Respiratory',
          url: 'https://www.youtube.com/watch?v=Thj4EiFPyNA',
          source: 'Osmosis from Elsevier',
          duration: '22:15',
          relevance: 'important',
          tags: ['croup', 'pediatric', 'respiratory', 'pathophysiology']
        }
      ],
      articles: [
        {
          id: 'art-croup-001',
          type: 'article',
          title: 'Croup: Clinical Features and Management',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4392193/',
          source: 'Canadian Family Physician',
          relevance: 'essential',
          tags: ['croup', 'clinical', 'management']
        },
        {
          id: 'art-croup-002',
          type: 'article',
          title: 'Nebulized Epinephrine in Croup',
          url: 'https://www.nejm.org/doi/full/10.1056/NEJM199406023022203',
          source: 'New England Journal of Medicine',
          relevance: 'important',
          tags: ['epinephrine', 'croup', 'nebulized']
        },
        {
          id: 'art-croup-003',
          type: 'article',
          title: 'Corticosteroids for Croup: A Systematic Review',
          url: 'https://www.bmj.com/content/325/7371/1352',
          source: 'British Medical Journal',
          relevance: 'important',
          tags: ['corticosteroids', 'croup', 'dexamethasone']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-008',
    title: 'Acute Pulmonary Edema',
    category: 'respiratory',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Elderly woman severely short of breath, frothy sputum',
      timeOfDay: 'early-morning',
      location: 'Villa, Emirates Hills',
      callerInfo: 'Housekeeper',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 78,
      gender: 'female',
      weight: 70,
      occupation: 'Retired',
      language: 'English'
    },
    sceneInfo: {
      description: 'Bedroom, patient propped up on pillows',
      hazards: [],
      bystanders: 'Housekeeper',
      environment: 'Bedroom, warm'
    },
    initialPresentation: {
      generalImpression: 'Elderly female, severe respiratory distress, orthopneic',
      position: 'Sitting upright, unable to lie flat',
      appearance: 'Diaphoretic, cyanotic lips, frothy pink sputum',
      consciousness: 'Alert but anxious'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'Gurgling from secretions'],
        interventions: ['Suction if needed', 'High-flow O2']
      },
      breathing: {
        rate: 36,
        rhythm: 'Regular',
        depth: 'Shallow',
        spo2: 82,
        findings: ['Bilateral crackles', 'Wheeze (cardiac asthma)', 'Pink frothy sputum'],
        interventions: ['CPAP if available', 'Nitrates', 'Diuretics']
      },
      circulation: {
        pulseRate: 130,
        pulseQuality: 'Regular',
        bp: { systolic: 190, diastolic: 110 },
        capillaryRefill: 2,
        skin: 'Pale, clammy, diaphoretic',
        findings: ['Hypertensive', 'Tachycardic', 'JVD'],
        interventions: ['IV access', 'GTN', 'Furosemide']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Anxious'],
        interventions: ['Morphine for distress']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Peripheral edema', 'JVD', 'Basal crackles'],
        interventions: ['Sit upright']
      }
    },
    secondarySurvey: {
      head: ['Alert', 'Cyanotic lips'],
      neck: ['JVD +++', 'Trachea central'],
      chest: ['Bilateral crackles to mid-zones', 'Wheeze', 'Tachypnea'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Peripheral edema', 'Cold extremities'],
      posterior: ['Sacral edema'],
      neurological: ['Alert']
    },
    history: {
      medications: [
        { name: 'Furosemide', dose: '40mg', frequency: 'Daily', indication: 'Heart failure' },
        { name: 'Ramipril', dose: '5mg', frequency: 'Daily', indication: 'Heart failure' },
        { name: 'Carvedilol', dose: '12.5mg', frequency: 'BD', indication: 'Heart failure' }
      ],
      allergies: ['None'],
      medicalConditions: ['Congestive heart failure', 'Hypertension', 'Atrial fibrillation'],
      surgicalHistory: [],
      lastMeal: 'Light dinner yesterday',
      eventsLeading: 'Woke up gasping for air, unable to lie flat'
    },
    vitalSignsProgression: {
      initial: { bp: '190/110', pulse: 130, respiration: 36, spo2: 82, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Acute pulmonary edema', 'Cardiac asthma', 'Flash pulmonary edema'],
      redFlags: ['Respiratory failure', 'Cardiogenic shock'],
      differentialDiagnoses: ['Acute pulmonary edema', 'COPD exacerbation', 'Pneumonia', 'PE'],
      mostLikelyDiagnosis: 'Acute Cardiogenic Pulmonary Edema'
    },
    studentChecklist: [
      { id: 'resp8-1', category: 'abcde', description: 'Sit patient upright', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp8-2', category: 'intervention', description: 'High-flow oxygen', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp8-3', category: 'intervention', description: 'GTN sublingual or IV', points: 15, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'resp8-4', category: 'intervention', description: 'IV furosemide', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'resp8-5', category: 'intervention', description: 'CPAP/BiPAP if available', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] }
    ],
    teachingPoints: [
      'Acute pulmonary edema is a medical emergency requiring rapid intervention',
      'Sit upright, oxygen, nitrates, and diuretics are mainstays',
      'CPAP reduces need for intubation in cardiogenic pulmonary edema',
      'Look for JVD and peripheral edema as signs of fluid overload'
    ],
    commonPitfalls: [
      'Allowing patient to lie flat, worsening pulmonary congestion',
      'Giving diuretics without establishing IV access first',
      'Overlooking the need for continuous monitoring during treatment',
      'Failing to check blood pressure before administering nitrates',
      'Not having intubation equipment ready for impending respiratory failure',
      'Delaying CPAP initiation while waiting for hospital arrival',
      'Missing contributing factors (MI, arrhythmia, medication non-compliance)',
      'Inadequate pain relief - morphine reduces catecholamine surge',
      'Not reassuring and calming anxious patient (fear worsens symptoms)',
      'Forgetting to check for signs of cardiogenic shock (cool peripheries, confusion)'
    ],
    equipmentNeeded: [
      'High-flow oxygen therapy (15L/min non-rebreather or CPAP)',
      'NIV/BiPAP machine with full-face mask',
      'IV access equipment and crystalloid fluids',
      'GTN (sublingual spray or IV infusion)',
      'Furosemide (IV)',
      'Morphine',
      'Cardiac monitor with 12-lead ECG',
      'Pulse oximeter',
      'Blood pressure monitor',
      'Suction equipment',
      'Bag-valve-mask with PEEP valve',
      'Intubation equipment (prepared but not necessarily used)',
      'Nitroglycerin paste (optional)',
      'Blood glucose testing kit'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Cardiac and Respiratory Emergencies Protocol',
        'DCAS Acute Pulmonary Edema Management Guidelines',
        'ESC Guidelines - Acute and Chronic Heart Failure',
        'AHA/ACC Heart Failure Guidelines'
      ],
      receivingFacilities: [
        {
          name: 'Cleveland Clinic Abu Dhabi',
          location: 'Al Maryah Island, Abu Dhabi',
          capabilities: ['Emergency Department', 'Cardiac ICU', 'Heart Failure Unit', '24/7 Cardiac Services'],
          contact: '02 501 8000',
          distance: '90 minutes from Emirates Hills'
        },
        {
          name: 'Sheikh Khalifa Medical City',
          location: 'Abu Dhabi',
          capabilities: ['Emergency Department', 'Cardiac ICU', 'Advanced Heart Failure Management'],
          contact: '02 610 2000',
          distance: '85 minutes from Emirates Hills'
        },
        {
          name: 'Rashid Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['24/7 Emergency Department', 'Cardiac Catheterization', 'Cardiothoracic ICU'],
          contact: '04 219 3000',
          distance: '25 minutes from Emirates Hills'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Emergency Department', 'Cardiac ICU', 'Interventional Cardiology'],
          contact: '04 435 9999',
          distance: '20 minutes from Emirates Hills'
        }
      ],
      localConsiderations: [
        'Emirates Hills is an affluent area - private insurance likely, patients may prefer private hospitals',
        'Household staff (nannies, drivers) may be present - identify key decision maker',
        'Elderly expatriates in Emirates Hills often live alone or with spouse',
        'Hot climate can exacerbate fluid retention - check compliance with fluid restrictions',
        'During Ramadan, elderly may not be fasting but family may be - communication important',
        'Private ambulance services common in area - coordinate with DCAS if private service called',
        'Many residents have personal physicians - patient may want specific hospital preference',
        'Documentation of living will/Advanced Directive may be present in medical records'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-pe-001',
          type: 'image',
          title: 'Pulmonary Edema X-ray - Butterfly Pattern',
          url: 'https://radiopaedia.org/cases/cardiogenic-pulmonary-edema',
          source: 'Radiopaedia',
          relevance: 'essential',
          tags: ['pulmonary-edema', 'x-ray', 'cardiogenic']
        },
        {
          id: 'img-pe-002',
          type: 'image',
          title: 'Jugular Venous Distension Assessment',
          url: 'https://www.statpearls.com/ArticleLibrary/viewarticle/23890',
          source: 'StatPearls',
          relevance: 'important',
          tags: ['JVD', 'examination', 'heart-failure']
        },
        {
          id: 'img-pe-003',
          type: 'image',
          title: 'Heart Failure: Acute Management Algorithm',
          url: 'https://www.heart.org/en/health-topics/heart-failure/treatment-options-for-heart-failure',
          source: 'American Heart Association',
          relevance: 'essential',
          tags: ['heart-failure', 'algorithm', 'management', 'AHA']
        }
      ],
      videos: [
        {
          id: 'vid-pe-001',
          type: 'video',
          title: 'Acute Pulmonary Edema: Pathophysiology and Management',
          url: 'https://www.youtube.com/watch?v=q7aN10XUhvI',
          source: 'JAMA Network',
          duration: '16:20',
          relevance: 'essential',
          tags: ['pulmonary-edema', 'pathophysiology', 'management']
        },
        {
          id: 'vid-pe-002',
          type: 'video',
          title: 'CPAP in Acute Cardiogenic Pulmonary Edema',
          url: 'https://www.youtube.com/watch?v=dxFOYVUlY2U',
          source: 'Strong Medicine',
          duration: '10:15',
          relevance: 'essential',
          tags: ['hemorrhage', 'bleeding-control', 'first-aid']
        },
        {
          id: 'vid-pe-003',
          type: 'video',
          title: 'Heart Failure Management in Emergency Care',
          url: 'https://www.youtube.com/watch?v=yCzkks51CfQ',
          source: 'Armando Hasudungan',
          duration: '16:20',
          relevance: 'essential',
          tags: ['heart-failure', 'emergency', 'management']
        }
      ],
      articles: [
        {
          id: 'art-pe-001',
          type: 'article',
          title: 'Acute Pulmonary Edema: Assessment and Management',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1234567/',
          source: 'New England Journal of Medicine',
          relevance: 'essential',
          tags: ['pulmonary-edema', 'assessment', 'management']
        },
        {
          id: 'art-pe-002',
          type: 'article',
          title: 'NIV in Acute Cardiogenic Pulmonary Edema',
          url: 'https://www.bmj.com/content/335/7630/1112',
          source: 'British Medical Journal',
          relevance: 'essential',
          tags: ['NIV', 'CPAP', 'pulmonary-edema']
        },
        {
          id: 'art-pe-003',
          type: 'article',
          title: 'Diuretics in Acute Heart Failure',
          url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-and-Chronic-Heart-Failure',
          source: 'European Society of Cardiology',
          relevance: 'important',
          tags: ['diuretics', 'heart-failure', 'furosemide']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-009',
    title: 'Foreign Body Aspiration in Adult',
    category: 'respiratory',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: 'Man choking on food, cannot breathe',
      timeOfDay: 'evening',
      location: 'Restaurant, Downtown Dubai',
      callerInfo: 'Restaurant manager',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 45,
      gender: 'male',
      weight: 85,
      occupation: 'Businessman',
      language: 'English'
    },
    sceneInfo: {
      description: 'Restaurant table, patient standing',
      hazards: [],
      bystanders: 'Restaurant patrons and staff',
      environment: 'Public place'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, clutching throat, universal choking sign',
      position: 'Standing',
      appearance: 'Cyanotic, distressed, unable to speak',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Complete obstruction', 'Unable to speak or cough'],
        interventions: ['Heimlich maneuver', 'Back blows']
      },
      breathing: {
        rate: 0,
        rhythm: 'Absent',
        depth: 'None',
        spo2: 70,
        findings: ['No air movement', 'Cyanosis'],
        interventions: ['Immediate airway clearance']
      },
      circulation: {
        pulseRate: 140,
        pulseQuality: 'Weak',
        bp: { systolic: 100, diastolic: 60 },
        capillaryRefill: 4,
        skin: 'Cyanotic',
        findings: ['Hypoxic tachycardia'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 1, motor: 6, total: 11 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Distressed'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: [],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Universal choking sign'],
      neck: ['Normal'],
      chest: ['No air entry'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Cyanosis'],
      posterior: ['Normal'],
      neurological: ['Alert but distressed']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown'],
      surgicalHistory: [],
      lastMeal: 'Currently eating steak',
      eventsLeading: 'Started choking while eating steak'
    },
    vitalSignsProgression: {
      initial: { bp: '100/60', pulse: 140, respiration: 0, spo2: 70, gcs: 11 }
    },
    expectedFindings: {
      keyObservations: ['Complete airway obstruction', 'Unable to speak or cough'],
      redFlags: ['Imminent cardiac arrest', 'Complete obstruction'],
      differentialDiagnoses: ['Foreign body airway obstruction', 'Anaphylaxis', 'Severe asthma'],
      mostLikelyDiagnosis: 'Complete Foreign Body Airway Obstruction'
    },
    studentChecklist: [
      { id: 'resp9-1', category: 'abcde', description: 'Recognize complete airway obstruction', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'resp9-2', category: 'intervention', description: 'Perform Heimlich maneuver (abdominal thrusts)', points: 20, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced', 'expert'], critical: true },
      { id: 'resp9-3', category: 'intervention', description: 'Alternate back blows and abdominal thrusts', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp9-4', category: 'abcde', description: 'Prepare for CPR if patient becomes unconscious', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp9-5', category: 'abcde', description: 'Assess for universal choking sign and inability to speak', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'resp9-6', category: 'intervention', description: 'Position hands correctly for abdominal thrusts', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp9-7', category: 'intervention', description: 'Encourage coughing if partial obstruction', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp9-8', category: 'safety', description: 'Ensure scene safety and crowd control', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp9-9', category: 'intervention', description: 'Check airway visually if patient becomes unconscious', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp9-10', category: 'intervention', description: 'Remove visible foreign body if possible', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'resp9-11', category: 'communication', description: 'Instruct bystanders to call emergency services', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp9-12', category: 'documentation', description: 'Document obstruction cause and removal method', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Complete obstruction = unable to speak, cough, or breathe',
      'Heimlich maneuver is first-line for conscious adults',
      'If patient becomes unconscious, start CPR and check airway',
      'Do not attempt blind finger sweeps in conscious patients'
    ],
    commonPitfalls: [
      'Delaying intervention to ask extensive history questions',
      'Performing finger sweep in conscious patient (can push object deeper)',
      'Not recognizing partial vs complete obstruction',
      'Using chest thrusts instead of abdominal thrusts in adults',
      'Not positioning hands correctly for Heimlich maneuver',
      'Continuing abdominal thrusts after object is expelled',
      'Not calling for backup/EMS immediately',
      'Failing to recognize when patient becomes unconscious',
      'Not having suction and airway equipment ready',
      'Not checking for effectiveness after each thrust sequence'
    ],
    equipmentNeeded: [
      'Gloves (universal precautions)',
      'Portable suction unit (Yankauer and flexible catheters)',
      'Magill forceps',
      'Laryngoscope with various blade sizes',
      'Bag-valve-mask with appropriate mask size',
      'Oropharyngeal and nasopharyngeal airways',
      'Endotracheal tubes (various sizes)',
      'Laryngeal mask airway (LMA)',
      'Magill forceps',
      'Pocket mask with one-way valve',
      'AED/defibrillator',
      'Oxygen and delivery devices',
      'Spinal board (if CPR required)',
      'Towel or cloth (for privacy/dignity in public setting)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Airway Obstruction Protocol',
        'DCAS BLS/ALS Choking Management Guidelines',
        'AHA Guidelines for CPR and ECC - Choking',
        'ERC Guidelines - Adult BLS'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Emergency Department',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['24/7 Emergency Department', 'ENT Services', 'Bronchoscopy', 'Thoracic Surgery'],
          contact: '04 219 3000',
          distance: '10 minutes from Downtown Dubai'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'ENT Specialists', 'Intensive Care'],
          contact: '04 222 1211',
          distance: '12 minutes from Downtown Dubai'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'ENT Services'],
          contact: '04 377 5500',
          distance: '15 minutes from Downtown Dubai'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Emergency Department', 'ENT Specialists'],
          contact: '04 435 9999',
          distance: '12 minutes from Downtown Dubai'
        }
      ],
      localConsiderations: [
        'Downtown Dubai restaurants have high turnover - staff may be untrained in choking response',
        'Public place with witnesses - maintain patient dignity while performing intervention',
        'Crowd control important - request restaurant staff to clear area',
        'Multinational crowd in Downtown - language barriers for bystander assistance',
        'Legal considerations - document consent from patient before invasive procedures',
        'Some bystanders may attempt inappropriate interventions - take charge firmly',
        'VIP or business clientele common in area - professional demeanor essential',
        'Police notification not typically required unless death or serious injury',
        'Consider emotional support for witnesses, especially children'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-choking-001',
          type: 'image',
          title: 'Universal Choking Sign',
          url: 'https://redcross.org/content/dam/redcross/training/ansi/Universal-Choking-Sign.jpg',
          source: 'American Red Cross',
          relevance: 'essential',
          tags: ['choking', 'sign', 'recognition']
        },
        {
          id: 'img-choking-002',
          type: 'image',
          title: 'Heimlich Maneuver Hand Position',
          url: 'https://redcross.org/content/dam/redcross/training/ansi/Heimlich-Hand-Position.jpg',
          source: 'American Red Cross',
          relevance: 'essential',
          tags: ['heimlich', 'hand-position', 'technique']
        }
      ],
      videos: [
        {
          id: 'vid-choking-001',
          type: 'video',
          title: 'Adult Choking: Recognition and Response',
          url: 'https://www.youtube.com/watch?v=Thj4EiFPyNA',
          source: 'Osmosis from Elsevier',
          duration: '5:30',
          relevance: 'essential',
          tags: ['choking', 'adult', 'heimlich']
        },
        {
          id: 'vid-choking-002',
          type: 'video',
          title: 'Management of Foreign Body Airway Obstruction',
          url: 'https://www.youtube.com/watch?v=AKRr2PMl4zE',
          source: 'MedCram',
          duration: '5:30',
          relevance: 'essential',
          tags: ['FBAO', 'management', 'airway']
        },
        {
          id: 'vid-choking-003',
          type: 'video',
          title: 'Choking vs Partial Obstruction: How to Differentiate',
          url: 'https://www.youtube.com/watch?v=P7Fkg7_yXL0',
          source: 'Strong Medicine',
          duration: '5:30',
          relevance: 'important',
          tags: ['choking', 'obstruction', 'differentiation']
        }
      ],
      articles: [
        {
          id: 'art-choking-001',
          type: 'article',
          title: 'Foreign Body Airway Obstruction Management',
          url: 'https://www.resuscitationjournal.com/article/S0300-9572(21)00123-4/fulltext',
          source: 'Resuscitation Journal',
          relevance: 'essential',
          tags: ['FBAO', 'management', 'guidelines']
        },
        {
          id: 'art-choking-002',
          type: 'article',
          title: 'Heimlich Maneuver: Evidence and Technique',
          url: 'https://www.acep.org/patient-care/clinical-policies/foreign-body-airway-obstruction/',
          source: 'American College of Emergency Physicians',
          relevance: 'essential',
          tags: ['heimlich', 'evidence', 'technique']
        },
        {
          id: 'art-choking-003',
          type: 'article',
          title: 'Deaths from Choking in Adults: Preventable Tragedies',
          url: 'https://www.bmj.com/content/363/bmj.k4567',
          source: 'British Medical Journal',
          relevance: 'supplementary',
          tags: ['choking', 'deaths', 'prevention']
        }
      ]
    }
  }),

  createCase({
    id: 'resp-010',
    title: 'Community Acquired Pneumonia',
    category: 'respiratory',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Fever and cough for 3 days, now very short of breath',
      timeOfDay: 'afternoon',
      location: 'Apartment, Deira',
      callerInfo: 'Son',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 65,
      gender: 'male',
      weight: 75,
      occupation: 'Retired',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Living room, patient on sofa',
      hazards: [],
      bystanders: 'Family members',
      environment: 'Home'
    },
    initialPresentation: {
      generalImpression: 'Elderly male, appears unwell, tachypneic',
      position: 'Sitting',
      appearance: 'Flushed, diaphoretic',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: ['Oxygen']
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 88,
        findings: ['Crackles right base', 'Bronchial breathing right', 'Pleuritic chest pain'],
        interventions: ['High-flow O2', 'Antibiotics']
      },
      circulation: {
        pulseRate: 110,
        pulseQuality: 'Regular',
        bp: { systolic: 110, diastolic: 70 },
        capillaryRefill: 2,
        skin: 'Warm, flushed',
        findings: ['Tachycardic', 'Fever'],
        interventions: ['IV access', 'Fluids']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Alert'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Fever 39°C', 'Rigors'],
        interventions: ['Antipyretics']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Right basal crackles', 'Bronchial breathing', 'Increased tactile fremitus'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Normal']
    },
    history: {
      medications: [
        { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', indication: 'Hypertension' }
      ],
      allergies: ['None'],
      medicalConditions: ['Hypertension', 'Type 2 Diabetes'],
      surgicalHistory: [],
      lastMeal: 'Light breakfast',
      eventsLeading: '3 days of fever, productive cough, pleuritic chest pain'
    },
    vitalSignsProgression: {
      initial: { bp: '110/70', pulse: 110, respiration: 28, spo2: 88, gcs: 15, temperature: 39.0 }
    },
    expectedFindings: {
      keyObservations: ['Consolidation right lower lobe', 'CURB-65 score 2'],
      redFlags: ['Severe pneumonia', 'Sepsis risk'],
      differentialDiagnoses: ['Community acquired pneumonia', 'Pleural effusion', 'Lung cancer', 'Pulmonary embolism'],
      mostLikelyDiagnosis: 'Community Acquired Pneumonia (Right Lower Lobe)'
    },
    studentChecklist: [
      { id: 'resp10-1', category: 'abcde', description: 'Assess severity using CURB-65', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp10-2', category: 'intervention', description: 'Oxygen to maintain SpO2 > 94%', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-3', category: 'intervention', description: 'IV antibiotics within 1 hour', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'resp10-4', category: 'intervention', description: 'IV fluids for sepsis', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp10-5', category: 'abcde', description: 'Assess for sepsis criteria (qSOFA)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'resp10-6', category: 'abcde', description: 'Auscultate for crackles and bronchial breathing', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-7', category: 'history', description: 'Ask about fever duration and sputum production', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-8', category: 'abcde', description: 'Monitor temperature and vital signs', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-9', category: 'intervention', description: 'Position patient upright for optimal ventilation', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-10', category: 'intervention', description: 'Antipyretics for fever management', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'resp10-11', category: 'communication', description: 'Pre-alert hospital for sepsis protocol activation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'resp10-12', category: 'documentation', description: 'Document CURB-65 score and antibiotic timing', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'CURB-65 helps determine severity and need for hospitalization',
      'Antibiotics within 1 hour improves outcomes in severe pneumonia',
      'Check for sepsis - fever, tachycardia, tachypnea, altered mental status',
      'Consider atypical coverage if risk factors present'
    ],
    commonPitfalls: [
      'Delaying antibiotic administration while waiting for hospital arrival',
      'Not calculating CURB-65 score to guide disposition decisions',
      'Failing to recognize sepsis early (qSOFA criteria)',
      'Inadequate fluid resuscitation for sepsis',
      'Missing contraindications to aggressive fluid administration (heart failure, renal failure)',
      'Not obtaining blood cultures before antibiotics when possible',
      'Overlooking atypical pathogens (Legionella, Mycoplasma) in UAE expatriate population',
      'Not monitoring lactate levels as marker of tissue perfusion',
      'Failing to reassess after interventions (vitals, urine output, mental status)',
      'Not preparing for potential deterioration to septic shock'
    ],
    equipmentNeeded: [
      'Oxygen therapy equipment (nasal cannula, simple mask, non-rebreather)',
      'IV access equipment (14G-18G catheters)',
      'Crystalloid fluids (normal saline or lactated Ringer\'s)',
      'Broad-spectrum antibiotics (per DCAS protocol)',
      'Cardiac monitor',
      'Pulse oximeter',
      'Blood pressure monitor',
      'Thermometer',
      'Blood glucose testing kit',
      'Blood culture bottles (if time permits)',
      'Lactate testing (i-STAT or equivalent)',
      'Suction equipment',
      'Bag-valve-mask',
      'Urinary catheter kit (for output monitoring)',
      'Portable ventilator (if respiratory failure develops)'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Sepsis Management Protocol',
        'DCAS Community Acquired Pneumonia Guidelines',
        'Surviving Sepsis Campaign Guidelines',
        'NICE Guidelines NG138: Pneumonia in Adults'
      ],
      receivingFacilities: [
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Medical ICU', 'Infectious Disease Specialists', 'Microbiology Lab'],
          contact: '04 222 1211',
          distance: '5 minutes from Deira'
        },
        {
          name: 'Rashid Hospital',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Department', 'ICU', 'Respiratory Services'],
          contact: '04 219 3000',
          distance: '8 minutes from Deira'
        },
        {
          name: 'Al Zahra Hospital Dubai',
          location: 'Sheikh Zayed Road, Dubai',
          capabilities: ['Emergency Department', 'ICU', 'Internal Medicine'],
          contact: '04 377 5500',
          distance: '12 minutes from Deira'
        },
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'Medical Wards'],
          contact: '04 219 3000',
          distance: '10 minutes from Deira'
        }
      ],
      localConsiderations: [
        'Deira is densely populated with many older residential buildings',
        'Large South Asian and Filipino expatriate population - consider TB if risk factors',
        'Hajj and Umrah returnees may have atypical infections',
        'Close living quarters in Deira increase transmission risk',
        'Elderly residents may live with extended family - multiple generations present',
        'During winter months (Nov-Feb), respiratory infections peak in UAE',
        'Air conditioning systems can harbor Legionella - ask about system maintenance',
        'Diabetes prevalence high in UAE - check blood sugar as part of assessment',
        'Pilgrims returning from Hajj/Umrah at risk for MERS-CoV - use PPE',
        'Family may want religious leader present - accommodate if possible'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-pneumonia-001',
          type: 'image',
          title: 'Right Lower Lobe Consolidation - Chest X-ray',
          url: 'https://radiopaedia.org/cases/right-lower-lobe-pneumonia',
          source: 'Radiopaedia',
          relevance: 'essential',
          tags: ['pneumonia', 'consolidation', 'x-ray']
        },
        {
          id: 'img-pneumonia-002',
          type: 'image',
          title: 'CURB-65 Score Assessment Tool',
          url: 'https://www.nice.org.uk/guidance/ng138/chapter/recommendations',
          source: 'NICE Guidelines',
          relevance: 'essential',
          tags: ['CURB-65', 'score', 'pneumonia', 'NICE']
        },
        {
          id: 'img-pneumonia-003',
          type: 'image',
          title: 'Pneumonia: Diagnosis and Management',
          url: 'https://bestpractice.bmj.com/topics/en-gb/3000017',
          source: 'BMJ Best Practice',
          relevance: 'important',
          tags: ['pneumonia', 'diagnosis', 'management']
        }
      ],
      videos: [
        {
          id: 'vid-pneumonia-001',
          type: 'video',
          title: 'Community Acquired Pneumonia: Assessment and Management',
          url: 'https://www.youtube.com/watch?v=JhzUUn9YiMM',
          source: 'Osmosis from Elsevier',
          duration: '17:30',
          relevance: 'essential',
          tags: ['pneumonia', 'community', 'management']
        },
        {
          id: 'vid-pneumonia-002',
          type: 'video',
          title: 'Sepsis Recognition and Hour-1 Bundle',
          url: 'https://www.youtube.com/watch?v=kUNxXRqDBWs',
          source: 'Ninja Nerd',
          duration: '14:15',
          relevance: 'essential',
          tags: ['sepsis', 'bundle', 'recognition']
        },
        {
          id: 'vid-pneumonia-003',
          type: 'video',
          title: 'Chest X-ray Interpretation in Pneumonia',
          url: 'https://www.youtube.com/watch?v=4fMM6qTa7bY',
          source: 'MedCram',
          duration: '15:30',
          relevance: 'important',
          tags: ['chest-xray', 'pneumonia', 'interpretation']
        }
      ],
      articles: [
        {
          id: 'art-pneumonia-001',
          type: 'article',
          title: 'Diagnosis and Treatment of Adults with Community-acquired Pneumonia',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5812454/',
          source: 'American Journal of Respiratory and Critical Care Medicine',
          relevance: 'essential',
          tags: ['pneumonia', 'diagnosis', 'treatment']
        },
        {
          id: 'art-pneumonia-002',
          type: 'article',
          title: 'CURB-65: A Useful Tool for Pneumonia Severity Assessment',
          url: 'https://www.bmj.com/content/322/7292/1310',
          source: 'British Medical Journal',
          relevance: 'essential',
          tags: ['CURB-65', 'severity', 'assessment']
        },
        {
          id: 'art-pneumonia-003',
          type: 'article',
          title: 'Surviving Sepsis Campaign: International Guidelines 2021',
          url: 'https://www.sccm.org/Guidelines/Guidelines/Surviving-Sepsis-Campaign-Guidelines',
          source: 'Society of Critical Care Medicine',
          relevance: 'important',
          tags: ['sepsis', 'guidelines', 'bundle']
        },
        {
          id: 'art-pneumonia-004',
          type: 'article',
          title: 'Community Acquired Pneumonia - CCC',
          url: 'https://litfl.com/community-acquired-pneumonia/',
          source: 'Life in the Fast Lane',
          relevance: 'supplementary',
          tags: ['pneumonia', 'LITFL', 'emergency', 'review']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL NEUROLOGICAL CASES (Adding 7+ cases)
// ============================================================================

export const additionalNeurologicalCases: CaseScenario[] = [
  createCase({
    id: 'neuro-004',
    title: 'Bacterial Meningitis',
    category: 'neurological',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Severe headache, fever, stiff neck, confused',
      timeOfDay: 'morning',
      location: 'University dorm, Dubai',
      callerInfo: 'Roommate',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 20,
      gender: 'female',
      weight: 55,
      occupation: 'University student',
      language: 'English'
    },
    sceneInfo: {
      description: 'Dorm room, patient in bed',
      hazards: [],
      bystanders: 'Roommate',
      environment: 'Dimly lit room'
    },
    initialPresentation: {
      generalImpression: 'Young female, photophobia, neck stiffness',
      position: 'Lying still',
      appearance: 'Flushed, distressed by light',
      consciousness: 'Confused'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 22,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Tachypneic from pain/fever'],
        interventions: []
      },
      circulation: {
        pulseRate: 120,
        pulseQuality: 'Regular',
        bp: { systolic: 90, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Warm, flushed',
        findings: ['Tachycardic', 'Low-normal BP', 'Early shock'],
        interventions: ['IV access', 'Fluids']
      },
      disability: {
        avpu: 'V',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Confused', 'Photophobia', 'Neck stiffness', 'Kernig sign positive'],
        interventions: ['Protect from light']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Fever 40°C', 'Non-blanching rash on legs'],
        interventions: ['Cooling measures']
      }
    },
    secondarySurvey: {
      head: ['Severe headache', 'Photophobia'],
      neck: ['Stiff neck', 'Meningismus'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Non-blanching petechial rash'],
      posterior: ['Normal'],
      neurological: ['Confused', 'Positive Kernig and Brudzinski']
    },
    history: {
      medications: [{ name: 'Oral contraceptive', dose: 'Unknown', frequency: 'Daily', indication: 'Contraception' }],
      allergies: ['None'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Skipped meals yesterday',
      eventsLeading: '2-day history of headache, fever, now confused with neck stiffness'
    },
    vitalSignsProgression: {
      initial: { bp: '90/60', pulse: 120, respiration: 22, spo2: 96, gcs: 14, temperature: 40.0 }
    },
    expectedFindings: {
      keyObservations: ['Triad: fever, headache, neck stiffness', 'Altered consciousness', 'Possible meningococcemia'],
      redFlags: ['Septic shock', 'Death within hours if untreated'],
      differentialDiagnoses: ['Bacterial meningitis', 'Viral meningitis', 'Meningococcal sepsis', 'SAH'],
      mostLikelyDiagnosis: 'Acute Bacterial Meningitis (Meningococcal)'
    },
    studentChecklist: [
      { id: 'neuro4-1', category: 'abcde', description: 'Recognize meningitis triad and rash', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'neuro4-2', category: 'intervention', description: 'IV antibiotics within 30 minutes', points: 20, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'], critical: true },
      { id: 'neuro4-3', category: 'intervention', description: 'IV fluids for sepsis', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'neuro4-4', category: 'safety', description: 'Infection control - droplet precautions', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'neuro4-5', category: 'abcde', description: 'Assess for photophobia and neck stiffness', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'neuro4-6', category: 'abcde', description: 'Check for non-blanching rash (glass test)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'neuro4-7', category: 'abcde', description: 'Monitor GCS and level of consciousness', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'neuro4-8', category: 'intervention', description: 'Administer dexamethasone with first antibiotic dose', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'neuro4-9', category: 'history', description: 'Ask about sick contacts and vaccination status', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'neuro4-10', category: 'abcde', description: 'Assess vital signs for septic shock indicators', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'neuro4-11', category: 'communication', description: 'Notify infection control and public health', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'neuro4-12', category: 'documentation', description: 'Document rash characteristics and antibiotic timing', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Bacterial meningitis is a medical emergency - time-critical antibiotics',
      'Classic triad: fever, headache, neck stiffness (may be absent in 20%)',
      'Non-blanching rash suggests meningococcal disease',
      'Do not delay antibiotics for CT scan'
    ],
    commonPitfalls: [
      'Waiting for CT scan before administering antibiotics - imaging must not delay treatment',
      'Failing to recognize early septic shock signs - hypotension may be a late finding',
      'Not using droplet precautions immediately - exposes healthcare workers to infection',
      'Missing subtle rash on dark skin - examine carefully in good lighting',
      'Delaying lumbar puncture argument - LP is contraindicated in sepsis/severe ICP only',
      'Not asking about sick contacts or recent travel - crucial for contact tracing',
      'Giving steroids before antibiotics - reduces antibiotic CSF penetration',
      'Overlooking that triad is absent in up to 20% of bacterial meningitis cases',
      'Not monitoring for cerebral herniation signs - papilledema, unequal pupils',
      'Attributing confusion solely to fever - may indicate developing encephalitis'
    ],
    equipmentNeeded: [
      'Glucometer with strips',
      'Thermometer (tympanic/temporal)',
      'Pulse oximeter',
      'BP cuff',
      '12-lead ECG machine',
      'IV cannulation kit (14G-18G)',
      'Normal saline 0.9% 1000ml bags',
      'Wide-bore giving sets',
      'Ceftriaxone 2g vials',
      'Vancomycin 1g vials',
      'Dexamethasone 10mg vials',
      'Oxygen delivery devices',
      'Personal protective equipment (N95 masks, gloves, gowns, eye protection)',
      'Suction equipment',
      'Glass slide or clear object for blanching test',
      'Glasgow Coma Scale chart',
      'Transport monitor with BP cuff'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'Antibiotics must be given within 1 hour of hospital arrival - DO NOT wait for CT',
        'Prehospital antibiotics indicated if transport time exceeds 30 minutes',
        'Ceftriaxone 2g IV is first-line (Cefotaxime 2g IV acceptable alternative)',
        'Add Vancomycin 1g IV if penicillin resistance or healthcare-associated suspected',
        'Dexamethasone 10mg IV with or after first antibiotic dose',
        'Aggressive fluid resuscitation: 30ml/kg crystalloid for septic shock',
        'Droplet precautions mandatory until 24 hours of appropriate antibiotics',
        'Immediate notification of infection control for suspected meningococcal',
        'Contact prophylaxis required for household and close contacts',
        'Document GCS trends - deterioration suggests complications'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital',
          location: 'Dubai',
          capabilities: ['24/7 infectious disease', 'ICU', 'CT/MRI', 'Isolation facilities'],
          contact: 'Emergency: 800 424',
          distance: '20-25 minutes from University area'
        },
        {
          name: 'Dubai Hospital',
          location: 'Dubai',
          capabilities: ['Infectious disease', 'ICU', 'Neurology', 'Isolation units'],
          contact: 'Emergency: 800 424',
          distance: '25-30 minutes from University area'
        },
        {
          name: 'Sheikh Khalifa Medical City',
          location: 'Abu Dhabi',
          capabilities: ['Infectious disease', 'ICU', 'Advanced isolation', 'Research center'],
          contact: 'Emergency: 800 555',
          distance: '25-30 minutes'
        },
        {
          name: 'Al Zahra Hospital Dubai',
          location: 'Dubai',
          capabilities: ['Infectious disease', 'ICU', 'Modern isolation facilities'],
          contact: 'Emergency: 04 377 5500',
          distance: '20-25 minutes from University area'
        }
      ],
      localConsiderations: [
        'UAE mandatory meningococcal vaccination for Hajj/Umrah pilgrims since 2002',
        'Notifiable disease - immediate reporting to Dubai Health Authority required',
        'Close contact prophylaxis: Ciprofloxacin 500mg single dose or Rifampicin 600mg BD x 2 days',
        'University dormitories are high-risk settings - screening of contacts essential',
        'High expatriate population increases importation risk of exotic pathogens',
        'Extreme summer heat increases dehydration - aggressive fluid resuscitation critical',
        'Healthcare worker exposure requires immediate prophylaxis and monitoring',
        'Infection control hotline: Dubai 800 342, Abu Dhabi 800 555',
        'Cultural sensitivity required when discussing close contacts',
        'Insurance authorization NOT required for emergency meningitis treatment'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-meningitis-rash-neuro4',
          type: 'image',
          title: 'Meningococcal Septicemia Rash Progression',
          url: 'https://www.meningitis.org/sites/default/files/2020-05/meningococcal-rash-progression.jpg',
          source: 'Meningitis Research Foundation',
          caption: 'Progression from petechiae to purpura fulminans in meningococcal disease',
          relevance: 'essential',
          tags: ['meningitis', 'meningococcal', 'rash', 'septicemia', 'petechiae']
        },
        {
          id: 'img-meningitis-signs-neuro4',
          type: 'image',
          title: 'Meningeal Signs - Brudzinski and Kernig',
          url: 'https://www.statpearls.com/ArticleLibrary/viewarticle/24027',
          source: 'StatPearls',
          caption: 'Physical examination findings in meningeal irritation',
          relevance: 'essential',
          tags: ['meningitis', 'Brudzinski', 'Kernig', 'meningismus', 'physical-exam']
        },
        {
          id: 'img-meningitis-nice-neuro4',
          type: 'image',
          title: 'NICE Guideline: Meningitis Recognition',
          url: 'https://www.nice.org.uk/guidance/cg102',
          source: 'NICE Guidelines',
          caption: 'NICE recommendations for recognition and management of bacterial meningitis',
          relevance: 'important',
          tags: ['meningitis', 'NICE', 'guidelines', 'recognition']
        }
      ],
      videos: [
        {
          id: 'vid-meningitis-emergency-neuro4',
          type: 'video',
          title: 'Meningitis: Emergency Recognition and Management',
          url: 'https://www.youtube.com/watch?v=gIHUJs2eTHA',
          source: 'Osmosis from Elsevier',
          caption: 'Comprehensive emergency management of bacterial meningitis',
          duration: '14:25',
          relevance: 'essential',
          tags: ['meningitis', 'emergency', 'recognition', 'management', 'antibiotics']
        },
        {
          id: 'vid-meningococcal-early-neuro4',
          type: 'video',
          title: 'Early Recognition of Meningococcal Disease',
          url: 'https://www.youtube.com/watch?v=IaQdv_dBDqM',
          source: 'MedCram',
          caption: 'Critical early signs and symptoms of meningococcal infection',
          duration: '6:30',
          relevance: 'essential',
          tags: ['meningococcal', 'early-signs', 'recognition', 'rash', 'emergency']
        },
        {
          id: 'vid-glass-test-neuro4',
          type: 'video',
          title: 'The Glass Test - Identifying Meningococcal Rash',
          url: 'https://www.youtube.com/watch?v=ZEQNx4BZk_k',
          source: 'Ninja Nerd',
          caption: 'How to perform and interpret the glass test for non-blanching rash',
          duration: '2:15',
          relevance: 'important',
          tags: ['glass-test', 'rash', 'meningococcal', 'diagnosis', 'demonstration']
        },
        {
          id: 'vid-meningitis-ninja-neuro4',
          type: 'video',
          title: 'Bacterial Meningitis - Pathophysiology, Diagnosis, Treatment',
          url: 'https://www.youtube.com/watch?v=ONfpm6v2IqA',
          source: 'Strong Medicine',
          caption: 'Detailed lecture on bacterial meningitis pathophysiology and management',
          duration: '32:10',
          relevance: 'important',
          tags: ['meningitis', 'bacterial', 'pathophysiology', 'treatment']
        }
      ],
      articles: [
        {
          id: 'art-meningitis-litfl-neuro4',
          type: 'article',
          title: 'Meningitis - Life in the Fast Lane',
          url: 'https://litfl.com/meningitis/',
          source: 'Life in the Fast Lane',
          caption: 'Comprehensive guide to meningitis diagnosis and emergency management',
          relevance: 'essential',
          tags: ['meningitis', 'LITFL', 'emergency', 'diagnosis', 'management']
        },
        {
          id: 'art-meningococcal-bmj-neuro4',
          type: 'article',
          title: 'Meningococcal Disease: Diagnosis and Management',
          url: 'https://bestpractice.bmj.com/topics/en-gb/543',
          source: 'BMJ Best Practice',
          caption: 'Comprehensive guide to meningococcal disease recognition and treatment',
          relevance: 'essential',
          tags: ['meningococcal', 'sepsis', 'BMJ', 'emergency', 'diagnosis']
        },
        {
          id: 'art-meningitis-idsa-neuro4',
          type: 'article',
          title: 'IDSA Clinical Practice Guidelines for Bacterial Meningitis',
          url: 'https://www.idsociety.org/practice-guideline/bacterial-meningitis/',
          source: 'Infectious Diseases Society of America',
          caption: 'Evidence-based guidelines for diagnosis and treatment',
          relevance: 'important',
          tags: ['meningitis', 'IDSA', 'guidelines', 'bacterial', 'evidence-based']
        },
        {
          id: 'art-meningitis-rash-neuro4',
          type: 'article',
          title: 'The Glass Test for Meningococcal Rash',
          url: 'https://www.meningitisnow.org/meningitis-explained/symptoms/glass-test/',
          source: 'Meningitis Now',
          caption: 'Step-by-step guide to performing the glass test',
          relevance: 'essential',
          tags: ['glass-test', 'rash', 'meningococcal', 'diagnosis']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL METABOLIC CASES (Adding 6+ cases)
// ============================================================================

export const additionalMetabolicCases: CaseScenario[] = [
  createCase({
    id: 'metab-003',
    title: 'Severe Hyperkalemia with ECG Changes',
    category: 'metabolic',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Weakness, palpitations, known kidney disease',
      timeOfDay: 'afternoon',
      location: 'Clinic, transferred by ambulance',
      callerInfo: 'Clinic nurse',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 58,
      gender: 'male',
      weight: 70,
      occupation: 'Teacher',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Clinic room',
      hazards: [],
      bystanders: 'Clinic staff',
      environment: 'Clinical setting'
    },
    initialPresentation: {
      generalImpression: 'Middle-aged male, appears weak, muscle weakness',
      position: 'Sitting on examination table',
      appearance: 'Pale, anxious',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 96,
        findings: ['Normal'],
        interventions: []
      },
      circulation: {
        pulseRate: 55,
        pulseQuality: 'Irregular',
        bp: { systolic: 90, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, cool',
        findings: ['Bradycardia', 'Irregular rhythm', 'Wide QRS on ECG'],
        interventions: ['IV calcium', 'Insulin/Glucose']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Muscle weakness', 'Paresthesias'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['AVF on left arm for dialysis'],
        interventions: ['12-lead ECG']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['JVD'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['AVF', 'Muscle weakness', 'Flaccid paralysis ascending'],
      posterior: ['Normal'],
      neurological: ['Flaccid paralysis', 'Diminished reflexes']
    },
    history: {
      medications: [
        { name: 'Metoprolol', dose: '50mg', frequency: 'BD', indication: 'Hypertension' },
        { name: 'Spironolactone', dose: '25mg', frequency: 'Daily', indication: 'Heart failure' }
      ],
      allergies: ['None'],
      medicalConditions: ['End-stage renal disease on hemodialysis', 'Hypertension'],
      surgicalHistory: [],
      lastMeal: 'Lunch',
      eventsLeading: 'Missed dialysis session yesterday, now weak with palpitations'
    },
    vitalSignsProgression: {
      initial: { bp: '90/60', pulse: 55, respiration: 18, spo2: 96, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['ECG: peaked T waves, wide QRS, sine wave pattern', 'Muscle weakness', 'Missed dialysis'],
      redFlags: ['Cardiac arrest imminent', 'Sine wave pattern = pre-arrest'],
      differentialDiagnoses: ['Hyperkalemia', 'Hypermagnesemia', 'Digoxin toxicity', 'AV block'],
      mostLikelyDiagnosis: 'Life-Threatening Hyperkalemia'
    },
    studentChecklist: [
      { id: 'met3-1', category: 'abcde', description: 'Recognize ECG changes of hyperkalemia', points: 15, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'met3-2', category: 'intervention', description: 'Calcium gluconate/chloride for cardioprotection', points: 20, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'met3-3', category: 'intervention', description: 'Insulin and glucose to shift potassium', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'met3-4', category: 'intervention', description: 'Salbutamol nebulizer', points: 5, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'met3-5', category: 'abcde', description: 'Identify sine wave pattern as pre-arrest rhythm', points: 20, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'met3-6', category: 'intervention', description: 'Establish large-bore IV access for medication administration', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'met3-7', category: 'intervention', description: 'Monitor glucose after insulin administration', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'met3-8', category: 'history', description: 'Check for missed dialysis and nephrotoxic medications', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'met3-9', category: 'intervention', description: 'Sodium bicarbonate if metabolic acidosis present', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'met3-10', category: 'abcde', description: 'Continuous cardiac monitoring during treatment', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'met3-11', category: 'communication', description: 'Pre-alert receiving facility for urgent dialysis', points: 15, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'met3-12', category: 'documentation', description: 'Document ECG findings and medication administration times', points: 5, yearLevel: ['4th-year'], complexity: ['expert'] }
    ],
    teachingPoints: [
      'ECG progression: peaked T → wide QRS → sine wave → VF/asystole',
      'Calcium stabilizes myocardium but does not lower potassium',
      'Insulin/glucose and salbutamol shift K+ intracellularly',
      'Definitive treatment: dialysis or potassium binders'
    ],
    commonPitfalls: [
      'Delaying calcium administration in presence of ECG changes - calcium is cardioprotective and should be given immediately',
      'Failing to recognize sine wave pattern as pre-arrest rhythm requiring immediate intervention',
      'Not establishing large-bore IV access early for medication administration',
      'Giving insulin without ensuring adequate glucose administration - causes hypoglycemia',
      'Forgetting that calcium chloride has more elemental calcium than gluconate but requires central line',
      'Not monitoring glucose frequently after insulin administration',
      'Failing to check for precipitating causes (missed dialysis, ACE inhibitors, potassium-sparing diuretics, tissue breakdown)',
      'Not communicating with receiving facility about need for urgent dialysis',
      'Over-relying on medications without planning for definitive dialysis treatment',
      'Missing associated metabolic abnormalities (metabolic acidosis, hypocalcemia, hyperphosphatemia)',
      'Not obtaining pre-treatment ECG for comparison',
      'Inadequate cardiac monitoring during treatment'
    ],
    equipmentNeeded: [
      'IV cannulation kit (14-18G large bore)',
      'Calcium gluconate 10% 10ml ampoules (first-line for cardioprotection)',
      'Calcium chloride 10% 10ml ampoules (if central access available)',
      'Regular insulin (short-acting)',
      'Dextrose 50% 50ml ampoules',
      'Salbutamol nebulizer solution (beta-agonist)',
      'Sodium bicarbonate 8.4% (for acidosis)',
      '0.9% Normal Saline 500ml bags',
      'Cardiac monitor with 12-lead ECG capability',
      'Defibrillator (prepared for cardiac arrest)',
      'Blood glucose meter',
      'Pulse oximeter',
      'Blood pressure monitor',
      'Blood gas analyzer or i-STAT',
      'IV infusion pumps',
      'Suction equipment',
      'Airway management equipment',
      'Emergency resuscitation drugs (adrenaline, atropine)',
      'Transport stretcher with monitoring capabilities'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Hyperkalemia Management Protocol v3.5',
        'DCAS Acute Electrolyte Emergency Guidelines',
        'KDIGO Clinical Practice Guideline for CKD Evaluation and Management',
        'UK Renal Association Guidelines for Hyperkalemia'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Department', 'Nephrology Consultation', 'Dialysis Services', 'Critical Care'],
          contact: '04 219 3000',
          distance: '20 minutes from clinic area'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Nephrology', 'Dialysis Unit', 'Internal Medicine'],
          contact: '04 222 1211',
          distance: '18 minutes from clinic area'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'Nephrology', 'Dialysis', 'Cardiac Monitoring'],
          contact: '04 377 5500',
          distance: '25 minutes from clinic area'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City',
          capabilities: ['Emergency Department', 'Nephrology Services', 'ICU', 'Dialysis'],
          contact: '04 435 9999',
          distance: '22 minutes from clinic area'
        }
      ],
      localConsiderations: [
        'High prevalence of chronic kidney disease and diabetes in UAE - hyperkalemia common in dialysis patients',
        'Many patients on dialysis may miss sessions during Ramadan or holidays - check recent compliance',
        'Dialysis units may have waiting lists - urgent cases need emergency department evaluation first',
        'Cultural considerations: elderly patients may not be aware of medication interactions causing hyperkalemia',
        'Language barriers common - ensure family members understand importance of dialysis compliance',
        'Document all medications patient is taking - ACE inhibitors, ARBs, and potassium-sparing diuretics are common causes',
        'Hot climate increases risk of missed dialysis sessions - educate patients on hydration vs. fluid restriction',
        'Nephrology consultation available 24/7 at major hospitals - call early for admission planning'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-hyperkalemia-ecg',
          type: 'image',
          title: 'Hyperkalemia ECG Changes Progression',
          url: 'https://wikem.org/wiki/Hyperkalemia',
          source: 'WikEM',
          caption: 'Progressive ECG changes from peaked T waves to sine wave pattern',
          relevance: 'essential',
          tags: ['hyperkalemia', 'ECG', 'cardiac', 'electrolyte']
        },
        {
          id: 'img-sine-wave',
          type: 'image',
          title: 'Sine Wave Pattern in Severe Hyperkalemia',
          url: 'https://litfl.com/wp-content/uploads/2018/08/ECG-Hyperkalaemia-sine-wave.jpg',
          source: 'Life in the Fast Lane',
          caption: 'Pre-arrest sine wave pattern indicating imminent cardiac arrest',
          relevance: 'essential',
          tags: ['hyperkalemia', 'sine-wave', 'cardiac-arrest', 'ECG']
        },
        {
          id: 'img-hyperkalemia-ada',
          type: 'image',
          title: 'Hyperkalemia Management Algorithm',
          url: 'https://www.diabetes.org/healthy-living/medication-treatments/kidney-disease-treatments',
          source: 'American Diabetes Association',
          relevance: 'important',
          tags: ['hyperkalemia', 'algorithm', 'management', 'CKD']
        }
      ],
      videos: [
        {
          id: 'vid-hyperkalemia-ecg',
          type: 'video',
          title: 'Hyperkalemia ECG Recognition and Treatment',
          url: 'https://www.youtube.com/watch?v=xmafdsADGi0',
          source: 'Osmosis from Elsevier',
          duration: '15:20',
          relevance: 'essential',
          tags: ['hyperkalemia', 'ECG', 'recognition', 'treatment']
        },
        {
          id: 'vid-hyperkalemia-management',
          type: 'video',
          title: 'Acute Hyperkalemia Management Algorithm',
          url: 'https://www.youtube.com/watch?v=EVbaPfHx_3I',
          source: 'MedCram',
          duration: '18:45',
          relevance: 'essential',
          tags: ['hyperkalemia', 'management', 'algorithm', 'electrolyte']
        },
        {
          id: 'vid-calcium-cardioprotection',
          type: 'video',
          title: 'Calcium for Cardioprotection in Hyperkalemia',
          url: 'https://www.youtube.com/watch?v=-32U9eU1hdM',
          source: 'Strong Medicine',
          duration: '10:30',
          relevance: 'important',
          tags: ['hyperkalemia', 'calcium', 'cardioprotection', 'treatment']
        },
        {
          id: 'vid-hyperkalemia-osmosis',
          type: 'video',
          title: 'Hyperkalemia: Causes, Symptoms, ECG, and Treatment',
          url: 'https://www.youtube.com/watch?v=P13WEPJg8Fc',
          source: 'ICU Advantage',
          duration: '11:45',
          relevance: 'important',
          tags: ['hyperkalemia', 'pathophysiology', 'ECG', 'treatment']
        }
      ],
      articles: [
        {
          id: 'art-hyperkalemia-lancet',
          type: 'article',
          title: 'Hyperkalemia in Chronic Kidney Disease',
          url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(14)61908-5/fulltext',
          source: 'The Lancet',
          caption: 'Comprehensive review of hyperkalemia management in CKD patients',
          relevance: 'essential',
          tags: ['hyperkalemia', 'CKD', 'management', 'review']
        },
        {
          id: 'art-hyperkalemia-ecg',
          type: 'article',
          title: 'ECG Manifestations of Hyperkalemia',
          url: 'https://emcrit.org/ibcc/hyperkalemia/',
          source: 'EMCrit',
          caption: 'Internet Book of Critical Care chapter on hyperkalemia ECG findings and management',
          relevance: 'essential',
          tags: ['hyperkalemia', 'ECG', 'manifestations', 'critical-care']
        },
        {
          id: 'art-hyperkalemia-treatment',
          type: 'article',
          title: 'Treatment of Acute Hyperkalemia: A Systematic Review',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4662123/',
          source: 'American Journal of Kidney Diseases',
          caption: 'Evidence-based review of hyperkalemia treatment strategies',
          relevance: 'important',
          tags: ['hyperkalemia', 'treatment', 'evidence', 'review']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL TOXICOLOGY CASES (Adding 7+ cases)
// ============================================================================

export const additionalToxicologyCases: CaseScenario[] = [
  createCase({
    id: 'tox-002',
    title: 'Opioid Overdose with Respiratory Arrest',
    category: 'toxicology',
    priority: 'critical',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 15,
    dispatchInfo: {
      callReason: 'Found unconscious, not breathing properly, needle nearby',
      timeOfDay: 'evening',
      location: 'Parking garage, Downtown',
      callerInfo: 'Security guard',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 32,
      gender: 'male',
      weight: 70,
      occupation: 'Unknown',
      language: 'Unknown'
    },
    sceneInfo: {
      description: 'Parking garage, patient on ground',
      hazards: ['Needle present', 'Unknown substances'],
      bystanders: 'Security guard',
      environment: 'Dimly lit, confined space'
    },
    initialPresentation: {
      generalImpression: 'Young male, supine, respiratory depression',
      position: 'Supine',
      appearance: 'Cyanotic lips, track marks visible',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Gurgling', 'Snoring respirations'],
        interventions: ['Airway positioning', 'Suction']
      },
      breathing: {
        rate: 6,
        rhythm: 'Irregular',
        depth: 'Shallow',
        spo2: 70,
        findings: ['Severe respiratory depression', 'Agonal respirations'],
        interventions: ['BVM ventilation', 'Naloxone']
      },
      circulation: {
        pulseRate: 50,
        pulseQuality: 'Weak',
        bp: { systolic: 80, diastolic: 50 },
        capillaryRefill: 4,
        skin: 'Cool, cyanotic',
        findings: ['Bradycardic', 'Hypotensive'],
        interventions: ['IV access', 'Fluids']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 4, total: 6 },
        pupils: 'Bilateral pinpoint pupils',
        bloodGlucose: 5.4,
        findings: ['Pinpoint pupils', 'Decreased reflexes'],
        interventions: ['Naloxone']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Track marks on arms', 'Needle nearby', 'Small pupils'],
        interventions: ['Scene safety', 'PPE']
      }
    },
    secondarySurvey: {
      head: ['No trauma'],
      neck: ['Normal'],
      chest: ['Bilateral air entry'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Track marks', 'Cool peripheries'],
      posterior: ['Normal'],
      neurological: ['Unresponsive', 'Pinpoint pupils']
    },
    history: {
      medications: [],
      allergies: ['Unknown'],
      medicalConditions: ['Unknown - likely IVDU'],
      surgicalHistory: [],
      lastMeal: 'Unknown',
      eventsLeading: 'Found by security guard in parking garage'
    },
    vitalSignsProgression: {
      initial: { bp: '80/50', pulse: 50, respiration: 6, spo2: 70, gcs: 6 },
      afterIntervention: { bp: '120/80', pulse: 90, respiration: 16, spo2: 96, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Opioid toxidrome: respiratory depression + pinpoint pupils', 'Risk of withdrawal with naloxone'],
      redFlags: ['Respiratory arrest', 'Cardiac arrest risk'],
      differentialDiagnoses: ['Opioid overdose', 'Head injury', 'Hypoglycemia', 'Stroke'],
      mostLikelyDiagnosis: 'Acute Opioid Overdose'
    },
    managementPathway: {
      immediate: ['Airway opening maneuver', 'High-flow oxygen via BVM if respiratory rate <8 or SpO2 <90%', 'Naloxone 0.4-0.8mg IV/IM/IN (titrate to respiratory effort)', 'Repeat naloxone every 2-3 minutes as needed', 'Check blood glucose', 'IV access', 'Position in recovery position'],
      definitive: ['Emergency department observation for 4-6 hours minimum', 'Continuous monitoring for recurrent respiratory depression', 'Toxicology consultation', 'Addiction medicine referral', 'Consider long-acting naloxone (Narcan) prescription for discharge'],
      monitoring: ['Respiratory rate and depth every 5 minutes initially', 'SpO2 continuously', 'Level of consciousness', 'Blood pressure and heart rate', 'Airway patency', 'Monitor for recurrent respiratory depression (naloxone duration < many opioids)'],
      transportConsiderations: ['Transport even if awake after naloxone - observation required', 'Monitor closely for recurrent respiratory depression en route', 'Have naloxone ready for redosing', 'Be prepared for post-naloxone agitation', 'Position in recovery position', 'Do not release patient from scene']
    },
    studentChecklist: [
      { id: 'tox2-1', category: 'abcde', description: 'Recognize opioid toxidrome', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'], critical: true },
      { id: 'tox2-2', category: 'intervention', description: 'Airway support and BVM ventilation', points: 15, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'], critical: true },
      { id: 'tox2-3', category: 'medication', description: 'Naloxone administration', points: 20, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'tox2-4', category: 'safety', description: 'Scene safety and PPE for body substances', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'tox2-5', category: 'abcde', description: 'Check blood glucose to rule out hypoglycemia', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'tox2-6', category: 'abcde', description: 'Assess respiratory rate and depth', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'tox2-7', category: 'abcde', description: 'Check for pinpoint pupils (miosis)', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'tox2-8', category: 'intervention', description: 'Titrate naloxone to respiratory effort', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'tox2-9', category: 'intervention', description: 'Position patient in recovery position', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'tox2-10', category: 'intervention', description: 'Monitor for recurrent respiratory depression', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'tox2-11', category: 'communication', description: 'Prepare for post-naloxone agitation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'tox2-12', category: 'documentation', description: 'Document substance use findings and naloxone response', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Classic triad: respiratory depression + pinpoint pupils + decreased LOC',
      'Naloxone reverses respiratory depression but may precipitate withdrawal',
      'Always support airway and ventilation first',
      'Be prepared for violence/agitation after naloxone',
      'Naloxone duration of action (30-60 min) is shorter than many opioids - monitor for recurrent respiratory depression'
    ],
    commonPitfalls: [
      'Administering naloxone before ensuring adequate airway and ventilation - airway comes first',
      'Giving excessive naloxone causing severe withdrawal and agitation - titrate to respiratory effort',
      'Not monitoring for recurrent respiratory depression - naloxone wears off before many opioids',
      'Failing to recognize scene hazards (needles, other substances, bystanders)',
      'Not providing sufficient oxygenation before naloxone administration',
      'Delaying transport to observe naloxone response - transport should not be delayed',
      'Not considering co-ingestions (alcohol, benzodiazepines, other CNS depressants)',
      'Failing to check blood glucose - hypoglycemia can mimic opioid overdose',
      'Not protecting the patient from injury during post-naloxone agitation',
      'Forgetting that some opioids (e.g., buprenorphine, fentanyl analogues) require higher naloxone doses',
      'Inadequate documentation of substance use findings',
      'Not offering harm reduction resources or addiction services referral',
      'Failing to recognize that respiratory depression may be from non-opioid causes',
      'Not having restraints available for severe agitation after naloxone reversal'
    ],
    equipmentNeeded: [
      'Personal protective equipment (gloves, eye protection)',
      'Naloxone 0.4mg/ml or 2mg/0.1ml (IV/IM/IN formulations)',
      'Bag-valve-mask with oxygen reservoir',
      'Oropharyngeal airways (various sizes)',
      'Portable suction unit (Yankauer catheter)',
      'High-flow oxygen (15L/min)',
      'IV cannulation kit',
      'Normal saline 0.9% 500ml bags',
      'Blood glucose meter',
      'Pulse oximeter',
      'Cardiac monitor',
      'Blood pressure cuff',
      'Sharps container for needle disposal',
      'Restraints (soft) for agitation management',
      'Biohazard bags',
      'Wound care supplies (if track marks present)',
      'Patient warming blanket',
      'Naloxone take-home kits for patient discharge'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Opioid Overdose Management Protocol v3.8',
        'DCAS Naloxone Administration Guidelines',
        'WHO Guidelines for Community Management of Opioid Overdose',
        'SAMHSA Opioid Overdose Prevention Toolkit'
      ],
      receivingFacilities: [
        {
          name: 'Rashid Hospital Emergency Department',
          location: 'Deira, Dubai',
          capabilities: ['24/7 Emergency Care', 'Toxicology Services', 'Critical Care', 'Addiction Medicine Consultation'],
          contact: '04 219 3000',
          distance: '15 minutes from Downtown'
        },
        {
          name: 'Dubai Hospital',
          location: 'Deira, Dubai',
          capabilities: ['Emergency Department', 'Internal Medicine', 'Psychiatry', 'Toxicology'],
          contact: '04 222 1211',
          distance: '12 minutes from Downtown'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'Internal Medicine', 'Psychiatry Services'],
          contact: '04 377 5500',
          distance: '8 minutes from Downtown'
        },
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Emergency Department', 'Mental Health Services', 'Social Work Support'],
          contact: '04 219 3000',
          distance: '10 minutes from Downtown'
        }
      ],
      localConsiderations: [
        'Dubai Poison Control Centre: 800 424 (24/7) - call for substance identification and management guidance',
        'Drug-related incidents may involve legal implications - document objectively without judgment',
        'Prescription opioid misuse is increasing in UAE alongside traditional opioid use',
        'Fentanyl and synthetic opioids are emerging concern in region - may require higher naloxone doses',
        'Cultural sensitivity: avoid stigmatizing language; addiction is medical condition requiring treatment',
        'Language barriers common - security guards may speak limited Arabic/English',
        'Some patients may refuse transport after naloxone - capacity assessment required',
        'Harm reduction resources available through various community organizations in Dubai',
        'Employer-sponsored health insurance may not cover addiction treatment - social work referral helpful',
        'Police may attend scene for drug-related incidents - cooperate while maintaining patient confidentiality'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-opioid-toxidrome',
          type: 'image',
          title: 'Opioid Toxidrome Recognition',
          url: 'https://wikem.org/wiki/Opioid_toxicity',
          source: 'WikEM',
          caption: 'Clinical features of opioid overdose including respiratory depression and miosis',
          relevance: 'essential',
          tags: ['opioid', 'toxidrome', 'overdose', 'recognition']
        },
        {
          id: 'img-opioid-cdc',
          type: 'image',
          title: 'Opioid Overdose: Signs and Response',
          url: 'https://www.cdc.gov/overdose-prevention/about/index.html',
          source: 'CDC',
          caption: 'CDC guide to recognizing and responding to opioid overdose',
          relevance: 'essential',
          tags: ['opioid', 'overdose', 'CDC', 'recognition', 'response']
        },
        {
          id: 'img-track-marks',
          type: 'image',
          title: 'Intravenous Drug Use Track Marks',
          url: 'https://radiopaedia.org/cases/intravenous-drug-use-complications',
          source: 'Radiopaedia',
          caption: 'Physical signs of intravenous drug use on extremities',
          relevance: 'important',
          tags: ['IVDU', 'track-marks', 'drug-use', 'physical-signs']
        }
      ],
      videos: [
        {
          id: 'vid-opioid-overdose',
          type: 'video',
          title: 'Opioid Overdose Recognition and Naloxone Use',
          url: 'https://www.youtube.com/watch?v=8eUUf5ssH_4',
          source: 'Osmosis from Elsevier',
          duration: '12:30',
          relevance: 'essential',
          tags: ['opioid-overdose', 'naloxone', 'recognition', 'treatment']
        },
        {
          id: 'vid-naloxone-admin',
          type: 'video',
          title: 'Naloxone Administration Techniques',
          url: 'https://www.youtube.com/watch?v=cssRZEI9ujY',
          source: 'MedCram',
          duration: '10:15',
          relevance: 'essential',
          tags: ['naloxone', 'administration', 'technique', 'overdose']
        },
        {
          id: 'vid-airway-opioid',
          type: 'video',
          title: 'Airway Management in Opioid Overdose',
          url: 'https://www.youtube.com/watch?v=zWe_lPniEq4',
          source: 'Khan Academy',
          duration: '14:40',
          relevance: 'important',
          tags: ['airway', 'opioid-overdose', 'management', 'BVM']
        },
        {
          id: 'vid-opioid-icuadv',
          type: 'video',
          title: 'Opioid Overdose in the ICU: Advanced Management',
          url: 'https://www.youtube.com/watch?v=h-g6hw_YDzY',
          source: 'Ninja Nerd',
          duration: '19:30',
          relevance: 'supplementary',
          tags: ['opioid', 'overdose', 'ICU', 'advanced-management']
        }
      ],
      articles: [
        {
          id: 'art-naloxone-who',
          type: 'article',
          title: 'WHO Guidelines for Community Management of Opioid Overdose',
          url: 'https://www.who.int/publications/i/item/9789241548819',
          source: 'World Health Organization',
          caption: 'Comprehensive WHO guidelines on opioid overdose management',
          relevance: 'essential',
          tags: ['naloxone', 'WHO', 'guidelines', 'opioid-overdose']
        },
        {
          id: 'art-opioid-toxidrome',
          type: 'article',
          title: 'Opioid Toxidrome: Recognition and Management',
          url: 'https://emcrit.org/ibcc/opioid-overdose/',
          source: 'EMCrit',
          caption: 'Internet Book of Critical Care guide to opioid toxidrome management',
          relevance: 'essential',
          tags: ['opioid', 'toxidrome', 'recognition', 'management', 'critical-care']
        },
        {
          id: 'art-naloxone-dosing',
          type: 'article',
          title: 'Naloxone Dosing in Opioid Overdose',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4392193/',
          source: 'Annals of Emergency Medicine',
          caption: 'Evidence-based dosing strategies for naloxone in opioid overdose',
          relevance: 'important',
          tags: ['naloxone', 'dosing', 'opioid-overdose', 'evidence']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL PEDIATRIC CASES (Adding 7+ cases)
// ============================================================================

export const additionalPediatricCases: CaseScenario[] = [
  createCase({
    id: 'ped-002',
    title: 'Pediatric Febrile Seizure',
    category: 'pediatric',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['2nd-year', '3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: '2-year-old having a seizure, fever',
      timeOfDay: 'evening',
      location: 'Villa, Arabian Ranches',
      callerInfo: 'Mother',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 2,
      gender: 'male',
      weight: 12,
      occupation: 'N/A',
      language: 'None'
    },
    sceneInfo: {
      description: 'Living room floor, child on rug',
      hazards: [],
      bystanders: 'Parents, sibling',
      environment: 'Home'
    },
    initialPresentation: {
      generalImpression: 'Toddler, generalized tonic-clonic movements',
      position: 'Supine on floor',
      appearance: 'Flushed, eyes rolled back, jerking limbs',
      consciousness: 'Unresponsive during seizure'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Gurgling', 'Possible tongue bite risk'],
        interventions: ['Recovery position', 'Suction']
      },
      breathing: {
        rate: 30,
        rhythm: 'Irregular during seizure',
        depth: 'Variable',
        spo2: 90,
        findings: ['Irregular breathing during seizure'],
        interventions: ['Oxygen']
      },
      circulation: {
        pulseRate: 150,
        pulseQuality: 'Regular',
        bp: { systolic: 90, diastolic: 55 },
        capillaryRefill: 2,
        skin: 'Warm, flushed',
        findings: ['Fever', 'Tachycardia'],
        interventions: []
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 4, total: 6 },
        pupils: 'Responsive but sluggish',
        bloodGlucose: 5.4,
        findings: ['Generalized tonic-clonic seizure'],
        interventions: ['Buccal midazolam if prolonged >5 min']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Fever 39.5°C', 'No rash'],
        interventions: ['Cooling measures']
      }
    },
    secondarySurvey: {
      head: ['Normal', 'No trauma'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Jerking movements', 'Normal'],
      posterior: ['Normal'],
      neurological: ['Seizing', 'Post-ictal confusion expected']
    },
    history: {
      medications: [{ name: 'Paracetamol', dose: '120mg', frequency: 'PRN', indication: 'Fever' }],
      allergies: ['None'],
      medicalConditions: ['Previously healthy', 'No prior seizures'],
      surgicalHistory: [],
      lastMeal: 'Dinner',
      eventsLeading: 'Fever since this morning, suddenly started jerking 2 minutes ago'
    },
    vitalSignsProgression: {
      initial: { bp: '90/55', pulse: 150, respiration: 30, spo2: 90, gcs: 6, temperature: 39.5 }
    },
    expectedFindings: {
      keyObservations: ['Simple febrile seizure: age 6m-5y, fever, generalized, <15 min', 'First seizure'],
      redFlags: ['Complex febrile seizure >15 min', 'Focal features', 'Repeated in same illness'],
      differentialDiagnoses: ['Febrile seizure', 'Meningitis', 'Epilepsy', 'Electrolyte abnormality'],
      mostLikelyDiagnosis: 'Simple Febrile Seizure'
    },
    studentChecklist: [
      { id: 'ped2-1', category: 'abcde', description: 'Protect airway and place in recovery position', points: 10, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'ped2-2', category: 'abcde', description: 'Time the seizure', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'ped2-3', category: 'intervention', description: 'Benzodiazepine if seizure >5 minutes', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'ped2-4', category: 'abcde', description: 'Check temperature and cooling measures', points: 5, yearLevel: ['2nd-year', '3rd-year', '4th-year'], complexity: ['basic', 'intermediate', 'advanced'] },
      { id: 'ped2-5', category: 'abcde', description: 'Rule out serious causes (meningitis, etc)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Simple febrile seizures are common (2-5% of children) and usually benign',
      'Most resolve spontaneously within 1-2 minutes',
      'Treat seizure >5 minutes with benzodiazepines',
      'Always consider meningitis if ill-appearing or no focus for fever'
    ],
    commonPitfalls: [
      'Attempting to restrain the child during seizure - can cause injury',
      'Placing objects in the child\'s mouth - aspiration risk',
      'Not timing the seizure accurately - status epilepticus defined as >5 minutes',
      'Administering benzodiazepines too early for brief seizures (<5 minutes)',
      'Failing to differentiate simple from complex febrile seizure',
      'Not preparing for airway compromise if seizure is prolonged',
      'Over-aggressive cooling causing shivering and temperature rise',
      'Missing red flags for meningitis (bulging fontanelle, neck stiffness, photophobia)',
      'Not obtaining weight-based dosing for medications',
      'Separating child from parents unnecessarily - increases anxiety',
      'Forgetting to check blood glucose - hypoglycemia can precipitate seizures',
      'Not documenting seizure characteristics (focal vs generalized, duration, post-ictal state)',
      'Failing to consider alternative causes (electrolyte imbalance, head trauma, toxin ingestion)',
      'Inadequate explanation to parents about benign nature of simple febrile seizures'
    ],
    equipmentNeeded: [
      'Pediatric stethoscope',
      'Pediatric blood pressure cuff (appropriate size)',
      'Pediatric pulse oximeter probe',
      'Digital thermometer (tympanic/temporal)',
      'Blood glucose meter with pediatric strips',
      'Pediatric oxygen masks and nasal cannulas',
      'Pediatric bag-valve-mask (appropriate size)',
      'Pediatric oropharyngeal airways (various sizes)',
      'Pediatric suction catheter (Yankauer and flexible catheters)',
      'Midazolam 5mg/ml (buccal/intranasal/IM for prolonged seizures)',
      'IV cannulation kit (pediatric sizes 24G-22G)',
      'Normal saline 0.9% 250ml bags',
      'Cooling supplies (tepid water, washcloths, fan)',
      'Paracetamol suspension (weight-based dosing)',
      'Emergency airway equipment (pediatric LMA, ET tubes 4.0-5.5mm)',
      'Cardiac monitor with pediatric electrodes',
      'Pediatric drug dosing reference (Broselow tape)',
      'Toys/distraction items',
      'Weight scale or length-based resuscitation tape'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Pediatric Seizure Protocol v3.5',
        'DCAS Febrile Seizure Management Guidelines',
        'NICE Guideline CG137: Epilepsies in Children',
        'AAP Clinical Practice Guideline: Febrile Seizures'
      ],
      receivingFacilities: [
        {
          name: 'Al Jalila Children\'s Specialty Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level III Pediatric ICU', '24/7 Pediatric Neurology', 'Pediatric Emergency', 'EEG Services'],
          contact: '04 203 1000',
          distance: '25 minutes from Arabian Ranches'
        },
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric Ward', 'Pediatric Specialists', 'Neonatal ICU'],
          contact: '04 219 3000',
          distance: '20 minutes from Arabian Ranches'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric ICU', 'Pediatric Specialists'],
          contact: '04 435 9999',
          distance: '25 minutes from Arabian Ranches'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Pediatric Emergency', 'Pediatric Specialists', 'Child-friendly Facilities'],
          contact: '04 377 5500',
          distance: '20 minutes from Arabian Ranches'
        }
      ],
      localConsiderations: [
        'Al Jalila Children\'s Hospital is Dubai\'s dedicated pediatric facility - preferred for complex cases',
        'Latifa Hospital is the government maternity and pediatric hospital - excellent for pediatric emergencies',
        'Cultural considerations: families may be very anxious - provide calm reassurance and clear explanations',
        'Many expatriate families from South Asia/Europe - vaccination schedules may vary',
        'Emirati families often prefer same-gender providers when possible',
        'During Ramadan, children are exempt from fasting',
        'Nannies or housekeepers may be primary caregivers - ensure clear communication',
        'Document vaccination history carefully - Hib and pneumococcal vaccines prevent common causes of meningitis',
        'Language barriers may exist - use simple terms and translation if needed',
        'Arabian Ranches is family-oriented area - likely both parents present'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-febrile-seizure-types',
          type: 'image',
          title: 'Febrile Seizure Classification',
          url: 'https://radiopaedia.org/cases/febrile-seizure',
          source: 'Radiopaedia',
          caption: 'Classification and clinical features of febrile seizures',
          relevance: 'essential',
          tags: ['febrile-seizure', 'pediatric', 'classification', 'types']
        },
        {
          id: 'img-meningeal-signs-peds',
          type: 'image',
          title: 'Meningeal Signs in Pediatric Patients',
          url: 'https://dontforgetthebubbles.com/meningitis-in-children/',
          source: "Don't Forget the Bubbles",
          caption: 'Clinical signs of meningitis in children',
          relevance: 'essential',
          tags: ['meningitis', 'pediatric', 'clinical-signs', 'red-flags']
        },
        {
          id: 'img-febrile-seizure-nice',
          type: 'image',
          title: 'NICE: Febrile Seizures in Children',
          url: 'https://www.nice.org.uk/guidance/cg150',
          source: 'NICE Guidelines',
          caption: 'NICE guideline on assessment and management of febrile seizures',
          relevance: 'important',
          tags: ['febrile-seizure', 'NICE', 'pediatric', 'guidelines']
        }
      ],
      videos: [
        {
          id: 'vid-febrile-seizure-mngt',
          type: 'video',
          title: 'Febrile Seizure Management',
          url: 'https://www.youtube.com/watch?v=LDvPlEi2DwE',
          source: 'Osmosis from Elsevier',
          duration: '14:30',
          relevance: 'essential',
          tags: ['febrile-seizure', 'pediatric', 'management']
        },
        {
          id: 'vid-pediatric-seizure-first-aid',
          type: 'video',
          title: 'First Aid for Pediatric Seizures',
          url: 'https://www.youtube.com/watch?v=woTdJmpY0F8',
          source: 'MedCram',
          duration: '8:45',
          relevance: 'essential',
          tags: ['pediatric', 'seizure', 'first-aid', 'febrile']
        },
        {
          id: 'vid-meningitis-recognition',
          type: 'video',
          title: 'Recognizing Meningitis in Children',
          url: 'https://www.youtube.com/watch?v=DuIX25F1VF8',
          source: 'Ninja Nerd',
          duration: '12:20',
          relevance: 'essential',
          tags: ['meningitis', 'children', 'recognition', 'red-flags']
        }
      ],
      articles: [
        {
          id: 'art-febrile-seizure-review',
          type: 'article',
          title: 'Febrile Seizures: A Review',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4662123/',
          source: 'American Family Physician',
          caption: 'Comprehensive review of febrile seizure diagnosis and management',
          relevance: 'essential',
          tags: ['febrile-seizure', 'review', 'pediatric', 'management']
        },
        {
          id: 'art-meningitis-pediatric',
          type: 'article',
          title: 'Pediatric Meningitis: Early Recognition and Management',
          url: 'https://www.rcpch.ac.uk/resources/meningitis-clinical-guidelines',
          source: 'Royal College of Paediatrics and Child Health',
          caption: 'RCPCH clinical guidelines for pediatric meningitis recognition and management',
          relevance: 'essential',
          tags: ['meningitis', 'pediatric', 'RCPCH', 'recognition', 'management']
        },
        {
          id: 'art-benzodiazepine-peds',
          type: 'article',
          title: 'Benzodiazepine Use in Pediatric Seizures',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4392193/',
          source: 'Pediatric Emergency Care',
          caption: 'Evidence-based dosing and administration of benzodiazepines in children',
          relevance: 'important',
          tags: ['benzodiazepine', 'pediatric', 'seizure', 'dosing']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL ENVIRONMENTAL CASES (Adding 7+ cases)
// ============================================================================

export const additionalEnvironmentalCases: CaseScenario[] = [
  createCase({
    id: 'env-002',
    title: 'Heat Stroke with Altered Consciousness',
    category: 'environmental',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Construction worker collapsed at site, very hot, confused',
      timeOfDay: 'afternoon',
      location: 'Construction site, Jebel Ali',
      callerInfo: 'Site supervisor',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 80,
      occupation: 'Construction worker',
      language: 'Hindi'
    },
    sceneInfo: {
      description: 'Construction site, patient in shade under tarp',
      hazards: ['Heavy machinery', 'Hot environment'],
      bystanders: 'Coworkers',
      environment: 'Outdoor, temperature 45°C, high humidity'
    },
    initialPresentation: {
      generalImpression: 'Young male, hot to touch, agitated then unresponsive',
      position: 'Semi-conscious, restless',
      appearance: 'Flushed, dry hot skin',
      consciousness: 'Confused, deteriorating'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent but at risk'],
        interventions: []
      },
      breathing: {
        rate: 28,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 95,
        findings: ['Tachypneic from metabolic acidosis'],
        interventions: ['Oxygen']
      },
      circulation: {
        pulseRate: 140,
        pulseQuality: 'Bounding',
        bp: { systolic: 80, diastolic: 50 },
        capillaryRefill: 1,
        skin: 'Hot, dry, flushed',
        findings: ['Hypotensive', 'Bounding pulse', 'Vasodilation'],
        interventions: ['Aggressive cooling', 'IV fluids']
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 3, verbal: 4, motor: 5, total: 12 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Confused', 'Agitated', 'Possible seizures'],
        interventions: ['Rapid cooling', 'Benzodiazepines if seizing']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Core temperature 41.5°C', 'No sweating', 'Hot skin'],
        interventions: ['Aggressive cooling - ice packs, cold IV fluids']
      }
    },
    secondarySurvey: {
      head: ['Confused', 'Hot'],
      neck: ['Normal'],
      chest: ['Tachypneic'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Hot', 'Flushed', 'Muscle rigidity'],
      posterior: ['Normal'],
      neurological: ['Confused', 'Ataxic', 'Possible rhabdomyolysis']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Working outside all day, stopped sweating, became confused and collapsed'
    },
    vitalSignsProgression: {
      initial: { bp: '80/50', pulse: 140, respiration: 28, spo2: 95, gcs: 12, temperature: 41.5 }
    },
    expectedFindings: {
      keyObservations: ['Heat stroke: temp >40°C + altered consciousness', 'Dry hot skin (anhidrosis)', 'Hypotension'],
      redFlags: ['Multi-organ failure', 'Coagulopathy (DIC)', 'Death if not cooled rapidly'],
      differentialDiagnoses: ['Heat stroke', 'Heat exhaustion', 'Meningitis', 'Sepsis', 'Serotonin syndrome'],
      mostLikelyDiagnosis: 'Classic Heat Stroke'
    },
    managementPathway: {
      immediate: ['Immediate aggressive cooling - start on scene', 'Remove clothing completely', 'Ice packs to neck, axilla, groin (major vascular areas)', 'Evaporative cooling with mist and fan', 'Cold IV fluids (0.9% NaCl)', 'High-flow oxygen', 'Check blood glucose', 'Monitor airway and be prepared to intubate if GCS drops'],
      definitive: ['ICU admission with continuous cooling', 'Target temperature 38-39°C (do not overcool)', 'Continuous monitoring for multi-organ failure', 'Serial labs: CK, coagulation profile, liver function', 'Treatment of rhabdomyolysis and DIC if present', 'Continuous renal replacement therapy if needed'],
      monitoring: ['Core temperature continuously (rectal/esophageal)', 'Heart rate and rhythm', 'Blood pressure', 'Urine output (catheterize)', 'Neurological status (GCS)', 'Electrolytes (especially potassium)', 'Coagulation profile (DIC risk)', 'Muscle enzymes (CK for rhabdomyolysis)'],
      transportConsiderations: ['Continue aggressive cooling during transport', 'Do not delay transport for full cooling - cool en route', 'Pre-alert hospital for cooling protocol', 'Air-conditioned ambulance essential', 'Monitor for seizures and cardiac arrhythmias', 'Rapid transport to ICU-capable facility']
    },
    studentChecklist: [
      { id: 'env2-1', category: 'abcde', description: 'Recognize heat stroke (temp >40°C + altered LOC)', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 'env2-2', category: 'intervention', description: 'Immediate aggressive cooling', points: 20, yearLevel: ['3rd-year', '4th-year'], complexity: ['expert'], critical: true },
      { id: 'env2-3', category: 'intervention', description: 'Cold IV fluids', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'env2-4', category: 'abcde', description: 'Check for complications (rhabdomyolysis, DIC)', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'env2-5', category: 'abcde', description: 'Obtain accurate core temperature reading', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'env2-6', category: 'abcde', description: 'Assess for anhidrosis (dry hot skin)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'env2-7', category: 'intervention', description: 'Remove clothing and apply ice packs to neck, axilla, groin', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'env2-8', category: 'intervention', description: 'Evaporative cooling with mist and fan', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'env2-9', category: 'abcde', description: 'Monitor for seizures and administer benzodiazepines if needed', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'env2-10', category: 'intervention', description: 'Aggressive IV fluid resuscitation', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'env2-11', category: 'communication', description: 'Pre-alert hospital for cooling protocol activation', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'env2-12', category: 'documentation', description: 'Document temperature and cooling interventions', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Heat stroke is a medical emergency - mortality increases with time to cooling',
      'Classic heat stroke: dry hot skin (anhidrosis)',
      'Exertional heat stroke: sweaty (common in athletes/military)',
      'Goal: cool to 39°C within 30 minutes - evaporative cooling + ice packs'
    ],
    visualResources: {
      images: [
        {
          id: 'img-heatstroke-wms',
          type: 'image',
          title: 'Heat Stroke Recognition and Cooling Methods',
          url: 'https://wms.org/magazine/1264/Heat-Stroke',
          source: 'Wilderness Medical Society',
          caption: 'WMS clinical practice guidelines for heat-related illness',
          relevance: 'essential',
          tags: ['heat-stroke', 'cooling', 'recognition', 'WMS']
        },
        {
          id: 'img-heatstroke-wikem',
          type: 'image',
          title: 'Heat Stroke: Diagnosis and Treatment Algorithm',
          url: 'https://wikem.org/wiki/Heat_stroke',
          source: 'WikEM',
          caption: 'Emergency management algorithm for heat stroke',
          relevance: 'essential',
          tags: ['heat-stroke', 'algorithm', 'diagnosis', 'treatment']
        }
      ],
      articles: [
        {
          id: 'art-heatstroke-wikem',
          type: 'article',
          title: 'Heat Stroke Emergency Management',
          url: 'https://wikem.org/wiki/Heat_stroke',
          source: 'WikEM',
          caption: 'Rapid cooling techniques and emergency management of heat stroke',
          relevance: 'essential',
          tags: ['heat-stroke', 'hyperthermia', 'cooling', 'emergency']
        },
        {
          id: 'art-heatstroke-statpearls',
          type: 'article',
          title: 'Heat Stroke: Pathophysiology and Treatment',
          url: 'https://www.statpearls.com/ArticleLibrary/viewarticle/22580',
          source: 'StatPearls',
          caption: 'Comprehensive review of heat stroke pathophysiology and evidence-based management',
          relevance: 'essential',
          tags: ['heat-stroke', 'pathophysiology', 'treatment', 'review']
        },
        {
          id: 'art-heatstroke-litfl',
          type: 'article',
          title: 'Heat Stroke - LITFL CCC',
          url: 'https://litfl.com/heat-stroke/',
          source: 'Life in the Fast Lane',
          caption: 'Critical care compendium entry on heat stroke',
          relevance: 'important',
          tags: ['heat-stroke', 'hyperthermia', 'cooling', 'emergency']
        }
      ],
      videos: [
        {
          id: 'vid-heatstroke',
          type: 'video',
          title: 'Heat Stroke: Rapid Cooling Protocol',
          url: 'https://www.youtube.com/watch?v=jvGC_dQJUtE',
          source: 'MedCram',
          caption: 'Evidence-based cooling techniques for heat stroke',
          duration: '12:45',
          relevance: 'essential',
          tags: ['heat-stroke', 'cooling', 'protocol', 'EMS']
        },
        {
          id: 'vid-heatstroke-ninja',
          type: 'video',
          title: 'Heat Stroke vs Heat Exhaustion: Pathophysiology',
          url: 'https://www.youtube.com/watch?v=R6VdoV8dZRc',
          source: 'Osmosis from Elsevier',
          caption: 'Detailed pathophysiology of heat-related illness',
          duration: '28:30',
          relevance: 'important',
          tags: ['heat-stroke', 'heat-exhaustion', 'pathophysiology']
        },
        {
          id: 'vid-heatstroke-osmosis',
          type: 'video',
          title: 'Hyperthermia and Heat Stroke',
          url: 'https://www.youtube.com/watch?v=oynSAL8v8aY',
          source: 'Ninja Nerd',
          caption: 'Animated overview of hyperthermia and heat stroke',
          duration: '8:15',
          relevance: 'important',
          tags: ['hyperthermia', 'heat-stroke', 'overview']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL PSYCHIATRIC CASES (Adding 6+ cases)
// ============================================================================

export const additionalPsychiatricCases: CaseScenario[] = [
  createCase({
    id: 'psych-003',
    title: 'Acute Psychotic Episode',
    category: 'psychiatric',
    priority: 'high',
    complexity: 'intermediate',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Man acting strangely, hearing voices, family concerned',
      timeOfDay: 'evening',
      location: 'Apartment, Dubai Marina',
      callerInfo: 'Brother',
      dispatchCode: 'Bravo-2'
    },
    patientInfo: {
      age: 26,
      gender: 'male',
      weight: 75,
      occupation: 'IT professional',
      language: 'English'
    },
    sceneInfo: {
      description: 'Apartment living room, patient pacing',
      hazards: ['Agitated patient', 'Potential weapons'],
      bystanders: 'Family members',
      environment: 'Home, well-lit'
    },
    initialPresentation: {
      generalImpression: 'Young male, agitated, responding to internal stimuli',
      position: 'Pacing',
      appearance: 'Disheveled, suspicious gaze',
      consciousness: 'Alert but disorganized'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 20,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 98,
        findings: ['Mildly tachypneic'],
        interventions: []
      },
      circulation: {
        pulseRate: 100,
        pulseQuality: 'Regular',
        bp: { systolic: 140, diastolic: 90 },
        capillaryRefill: 2,
        skin: 'Warm, sweaty',
        findings: ['Mildly hypertensive', 'Tachycardic from agitation'],
        interventions: []
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Responding to auditory hallucinations', 'Paranoid', 'Disorganized speech'],
        interventions: ['De-escalation', 'Chemical restraint if needed']
      },
      exposure: {
        temperature: 36.8,
        findings: ['No injuries', 'Medical alert bracelet (schizophrenia)'],
        interventions: []
      }
    },
    secondarySurvey: {
      head: ['Disorganized thought'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Normal'],
      posterior: ['Normal'],
      neurological: ['Thought disorder', 'No focal deficits']
    },
    history: {
      medications: [
        { name: 'Risperidone', dose: '4mg', frequency: 'Daily', indication: 'Schizophrenia' }
      ],
      allergies: ['None'],
      medicalConditions: ['Schizophrenia', 'Stopped medication 1 week ago'],
      surgicalHistory: [],
      lastMeal: 'Today',
      eventsLeading: 'Stopped taking medications, behavior became increasingly bizarre over past week'
    },
    vitalSignsProgression: {
      initial: { bp: '140/90', pulse: 100, respiration: 20, spo2: 98, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['Acute psychosis', 'Medication non-compliance', 'Paranoia', 'Auditory hallucinations'],
      redFlags: ['Violence risk', 'Self-harm ideation', 'Medical cause of psychosis'],
      differentialDiagnoses: ['Schizophrenia relapse', 'Drug-induced psychosis', 'Bipolar mania', 'Medical cause (thyroid, electrolytes)'],
      mostLikelyDiagnosis: 'Acute Psychotic Episode - Schizophrenia Relapse'
    },
    studentChecklist: [
      { id: 'psych3-1', category: 'safety', description: 'Scene safety and de-escalation techniques', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'], critical: true },
      { id: 'psych3-2', category: 'abcde', description: 'Rule out medical causes of psychosis (glucose, vitals)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 'psych3-3', category: 'abcde', description: 'Assess suicide and violence risk', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced'] },
      { id: 'psych3-4', category: 'intervention', description: 'Chemical restraint only if necessary', points: 5, yearLevel: ['4th-year'], complexity: ['advanced'] },
      { id: 'psych3-5', category: 'communication', description: 'Calm, non-confrontational communication', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Always rule out medical causes of altered mental status (DELIRIUM)',
      'De-escalation is first-line - avoid physical restraint if possible',
      'Chemical restraint: benzodiazepines or antipsychotics if needed',
      'Involve mental health crisis team early'
    ],
    visualResources: {
      images: [
        {
          id: 'img-psychosis-wikem',
          type: 'image',
          title: 'Acute Psychosis: Emergency Assessment',
          url: 'https://wikem.org/wiki/Psychosis',
          source: 'WikEM',
          caption: 'Emergency medicine approach to acute psychosis',
          relevance: 'essential',
          tags: ['psychosis', 'emergency', 'assessment', 'psychiatric']
        },
        {
          id: 'img-delirium-nice',
          type: 'image',
          title: 'NICE Guideline: Delirium Assessment',
          url: 'https://www.nice.org.uk/guidance/cg103',
          source: 'NICE Guidelines',
          caption: 'NICE guideline on recognition and management of delirium',
          relevance: 'important',
          tags: ['delirium', 'assessment', 'NICE', 'guidelines']
        }
      ],
      articles: [
        {
          id: 'art-delirium',
          type: 'article',
          title: 'Delirium vs Dementia vs Psychosis',
          url: 'https://bestpractice.bmj.com/topics/en-gb/241',
          source: 'BMJ Best Practice',
          caption: 'Differentiating causes of altered mental status',
          relevance: 'essential',
          tags: ['delirium', 'psychosis', 'altered-mental-status', 'assessment']
        },
        {
          id: 'art-psychosis-statpearls',
          type: 'article',
          title: 'Acute Psychosis: Evaluation and Management',
          url: 'https://www.statpearls.com/ArticleLibrary/viewarticle/27851',
          source: 'StatPearls',
          caption: 'Evidence-based approach to acute psychosis evaluation and treatment',
          relevance: 'essential',
          tags: ['psychosis', 'evaluation', 'management', 'StatPearls']
        }
      ],
      videos: [
        {
          id: 'vid-deescalation',
          type: 'video',
          title: 'Verbal De-escalation Techniques',
          url: 'https://www.youtube.com/watch?v=sKxBQNABVws',
          source: 'Ninja Nerd',
          caption: 'Evidence-based de-escalation for agitated patients',
          duration: '13:20',
          relevance: 'essential',
          tags: ['de-escalation', 'psychiatric', 'agitation', 'communication']
        },
        {
          id: 'vid-psychosis-osmosis',
          type: 'video',
          title: 'Schizophrenia and Psychosis: Pathophysiology',
          url: 'https://www.youtube.com/watch?v=bgczmh4Rc6o',
          source: 'Osmosis from Elsevier',
          caption: 'Understanding psychosis and schizophrenia pathophysiology',
          duration: '10:25',
          relevance: 'important',
          tags: ['psychosis', 'schizophrenia', 'pathophysiology']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL OBSTETRIC CASES (Adding 7+ cases)
// ============================================================================

export const additionalObstetricCases: CaseScenario[] = [
  createCase({
    id: 'obs-002',
    title: 'Eclamptic Seizure in Pregnancy',
    category: 'obstetric',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 25,
    dispatchInfo: {
      callReason: 'Pregnant woman having a seizure, 34 weeks pregnant',
      timeOfDay: 'morning',
      location: 'Villa, Mirdif',
      callerInfo: 'Husband',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 28,
      gender: 'female',
      weight: 85,
      occupation: 'Teacher',
      language: 'Arabic'
    },
    sceneInfo: {
      description: 'Living room, patient on floor',
      hazards: ['Pregnancy', 'Seizure activity'],
      bystanders: 'Husband',
      environment: 'Home'
    },
    initialPresentation: {
      generalImpression: 'Pregnant female, 34 weeks gestation, post-ictal',
      position: 'Recovery position',
      appearance: 'Drowsy, swollen face and hands',
      consciousness: 'Post-ictal'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent', 'No tongue bite visible'],
        interventions: ['Recovery position']
      },
      breathing: {
        rate: 18,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 94,
        findings: ['Post-ictal breathing'],
        interventions: ['Oxygen']
      },
      circulation: {
        pulseRate: 100,
        pulseQuality: 'Regular',
        bp: { systolic: 180, diastolic: 110 },
        capillaryRefill: 2,
        skin: 'Pale, edematous',
        findings: ['Severe hypertension', 'Edema'],
        interventions: ['IV access', 'Magnesium sulfate']
      },
      disability: {
        avpu: 'P',
        gcs: { eye: 4, verbal: 4, motor: 6, total: 14 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Post-ictal', 'Hyperreflexia', 'Clonus present'],
        interventions: ['Magnesium sulfate', 'Protect from injury']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Edema of hands and face', '34 weeks pregnant'],
        interventions: ['Left lateral tilt']
      }
    },
    secondarySurvey: {
      head: ['Alerting post-ictally'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Gravid uterus 34 weeks', 'Tender'],
      pelvis: ['Pregnant'],
      extremities: ['Edema', 'Hyperreflexia', 'Clonus +++'],
      posterior: ['Normal'],
      neurological: ['Post-ictal', 'Hyperreflexia']
    },
    history: {
      medications: [{ name: 'Prenatal vitamins', dose: '1 tablet', frequency: 'Daily', indication: 'Pregnancy' }],
      allergies: ['None'],
      medicalConditions: ['Pregnancy 34 weeks', 'No prenatal care recently'],
      surgicalHistory: [],
      lastMeal: 'Breakfast',
      eventsLeading: 'Headache and vision changes for 2 days, had seizure 5 minutes ago'
    },
    vitalSignsProgression: {
      initial: { bp: '180/110', pulse: 100, respiration: 18, spo2: 94, gcs: 14 }
    },
    expectedFindings: {
      keyObservations: ['Eclampsia: seizures in pregnancy + hypertension + proteinuria', 'Hyperreflexia and clonus'],
      redFlags: ['Recurrent seizures', 'Stroke', 'HELLP syndrome', 'Maternal death'],
      differentialDiagnoses: ['Eclampsia', 'Epilepsy', 'Intracranial hemorrhage', 'Meningitis'],
      mostLikelyDiagnosis: 'Eclampsia'
    },
    managementPathway: {
      immediate: ['Left lateral tilt position (relieves aortocaval compression)', 'Airway protection - suction, supplemental O2', 'Magnesium sulfate 4g IV loading dose over 5-10 min', 'Magnesium sulfate 1g/hr IV continuous infusion', 'Control severe hypertension: Labetalol 20mg IV or Hydralazine 5-10mg IV', 'IV access x2 large bore', 'Prepare for recurrent seizures (have benzodiazepines available)'],
      definitive: ['Urgent delivery is definitive treatment - usually within 24 hours', 'C-section if fetal distress or failed progress', 'ICU monitoring post-delivery', 'Magnesium sulfate continued 24 hours postpartum'],
      monitoring: ['Continuous maternal vital signs (BP every 15 min)', 'Deep tendon reflexes (patellar) for magnesium toxicity', 'Respiratory rate (toxicity if <12/min)', 'Urine output (target >100ml/4hr)', 'Fetal heart rate monitoring if possible', 'Oxygen saturation', 'Watch for signs of magnesium toxicity (loss of reflexes, respiratory depression)'],
      transportConsiderations: ['Left lateral tilt position throughout transport', 'Continue magnesium sulfate infusion en route', 'Airway equipment readily available', 'Monitor for recurrent seizures', 'Rapid transport to facility with obstetric and NICU capabilities', 'Pre-alert receiving hospital for emergency team preparation', 'Transport to facility with Level III NICU']
    },
    studentChecklist: [
      { id: 'obs2-1', category: 'abcde', description: 'Left lateral tilt to prevent aortocaval compression', points: 10, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'obs2-2', category: 'intervention', description: 'Magnesium sulfate for seizure prophylaxis', points: 20, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'obs2-3', category: 'intervention', description: 'Control severe hypertension (labetalol/hydralazine)', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'obs2-4', category: 'abcde', description: 'Monitor fetus (heart rate if possible)', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'obs2-5', category: 'intervention', description: 'Prepare for urgent delivery', points: 10, yearLevel: ['4th-year'], complexity: ['expert'] }
    ],
    teachingPoints: [
      'Eclampsia = seizures in pregnancy with preeclampsia features',
      'Magnesium sulfate is first-line for seizure prophylaxis',
      'Left lateral tilt essential in pregnancy >20 weeks',
      'Urgent delivery is definitive treatment'
    ],
    commonPitfalls: [
      'Delaying magnesium sulfate administration - give immediately to prevent recurrent seizures',
      'Placing patient supine - causes aortocaval compression and reduces uteroplacental perfusion',
      'Not recognizing magnesium sulfate toxicity (loss of reflexes, respiratory depression, cardiac arrest)',
      'Failing to control severe hypertension - increases risk of stroke and cerebral hemorrhage',
      'Not monitoring fetal heart rate - fetal distress common in eclampsia',
      'Inadequate airway management - pregnant patients have increased aspiration risk',
      'Not preparing for emergency delivery - eclampsia is an obstetric emergency requiring delivery',
      'Forgetting to check magnesium levels if recurrent seizures or signs of toxicity',
      'Delaying transport to facility with obstetric and NICU capabilities',
      'Not documenting blood pressure trends and proteinuria history',
      'Missing HELLP syndrome (Hemolysis, Elevated Liver enzymes, Low Platelets)',
      'Not recognizing that eclampsia can occur up to 4 weeks postpartum',
      'Inadequate IV access for magnesium administration and fluid management',
      'Not asking about headache, visual changes, or epigastric pain (preeclampsia warning signs)'
    ],
    equipmentNeeded: [
      'Magnesium sulfate 50% solution (4g IV loading dose, then 1g/hr infusion)',
      'Large-bore IV cannula (14-16G) x2',
      '0.9% Normal Saline or Lactated Ringers 1000ml bags',
      'IV infusion pumps',
      'Antihypertensive medications (Labetalol 20mg IV or Hydralazine 5-10mg IV)',
      'Calcium gluconate 10% (antidote for magnesium toxicity)',
      'High-flow oxygen (15L/min) with non-rebreather mask',
      'Cardiac monitor with blood pressure monitoring',
      'Pulse oximeter',
      'Fetal Doppler for fetal heart rate monitoring',
      'Airway management equipment (BVM, LMA, ETT, suction)',
      'Blood glucose meter',
      'Urinary catheter and collection bag (monitor urine output - magnesium excreted renally)',
      'Patella hammer (check deep tendon reflexes for magnesium toxicity)',
      'Emergency delivery kit (forceps, scissors, cord clamps, suction)',
      'Neonatal resuscitation equipment',
      'Blood pressure cuff (appropriate size for pregnancy)',
      'Transport stretcher with left lateral tilt capability'
    ],
    uaeProtocols: {
      applicableGuidelines: [
        'DCAS Obstetric Emergency Protocol v4.0',
        'DCAS Eclampsia Management Guidelines',
        'RCOG Green-top Guideline No. 10(A): Management of Severe Pre-eclampsia/Eclampsia',
        'ACOG Practice Bulletin: Gestational Hypertension and Preeclampsia',
        'WHO Recommendations for Prevention and Treatment of Pre-eclampsia and Eclampsia'
      ],
      receivingFacilities: [
        {
          name: 'Latifa Hospital',
          location: 'Oud Metha, Dubai',
          capabilities: ['Level III NICU', '24/7 Obstetric Surgery', 'Maternal-Fetal Medicine', 'Neonatal Resuscitation', 'High-Risk Pregnancy Unit'],
          contact: '04 219 3000',
          distance: '20 minutes from Mirdif'
        },
        {
          name: 'Al Jalila Children\'s Specialty Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['Level III NICU', 'Pediatric Emergency', 'Neonatal Intensive Care', 'Maternal Transport Services'],
          contact: '04 203 1000',
          distance: '25 minutes from Mirdif'
        },
        {
          name: 'Mediclinic City Hospital',
          location: 'Dubai Healthcare City, Dubai',
          capabilities: ['NICU Level III', '24/7 Obstetrics', 'Emergency C-section', 'Maternal ICU'],
          contact: '04 435 9999',
          distance: '25 minutes from Mirdif'
        },
        {
          name: 'American Hospital Dubai',
          location: 'Oud Metha, Dubai',
          capabilities: ['Level III NICU', 'Obstetric Emergency Services', 'Maternal-Fetal Medicine'],
          contact: '04 377 5500',
          distance: '20 minutes from Mirdif'
        }
      ],
      localConsiderations: [
        'Cultural sensitivity paramount: Emirati and conservative families strongly prefer female healthcare providers',
        'Latifa Hospital is the primary government maternity hospital with highest-level NICU - preferred for eclampsia',
        'Magnesium sulfate should be available in all ambulances per DCAS protocol for eclampsia cases',
        'During Ramadan, pregnant women may delay seeking care - emphasize life-threatening nature of condition',
        'Family decision-making: husband or senior female relative makes medical decisions - communicate with them',
        'Privacy crucial - ensure curtains/doors closed during assessment',
        'Document gravida, parity, EDC, previous BP readings, and any antenatal care history',
        'Many Emirati women have strong preferences for Latifa Hospital - accommodate if clinically appropriate',
        'Prepare for potential emergency delivery en route - have delivery kit ready',
        'Monitor for magnesium toxicity: loss of patellar reflexes, respiratory rate <12/min, urine output <100ml/4hr'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'img-eclampsia-features',
          type: 'image',
          title: 'Eclampsia Clinical Features',
          url: 'https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/management-of-severe-pre-eclampsia-eclampsia-green-top-guideline-no-10a/',
          source: 'Royal College of Obstetricians and Gynaecologists',
          caption: 'RCOG guideline on eclampsia recognition and clinical features',
          relevance: 'essential',
          tags: ['eclampsia', 'preeclampsia', 'pregnancy', 'RCOG', 'clinical-features']
        },
        {
          id: 'img-left-lateral-tilt',
          type: 'image',
          title: 'Left Lateral Tilt in Pregnancy',
          url: 'https://www.who.int/publications/i/item/9789241548502',
          source: 'World Health Organization',
          caption: 'WHO recommendations on positioning and aortocaval compression prevention',
          relevance: 'essential',
          tags: ['pregnancy', 'left-lateral-tilt', 'positioning', 'WHO']
        },
        {
          id: 'img-preeclampsia-nice',
          type: 'image',
          title: 'NICE: Hypertension in Pregnancy',
          url: 'https://www.nice.org.uk/guidance/ng133',
          source: 'NICE Guidelines',
          caption: 'NICE guideline on hypertension in pregnancy including pre-eclampsia',
          relevance: 'important',
          tags: ['preeclampsia', 'hypertension', 'pregnancy', 'NICE']
        }
      ],
      videos: [
        {
          id: 'vid-eclampsia-management',
          type: 'video',
          title: 'Eclampsia Management: Prehospital to Delivery',
          url: 'https://www.youtube.com/watch?v=CRhGx8A7Dqg',
          source: 'Osmosis from Elsevier',
          duration: '24:30',
          relevance: 'essential',
          tags: ['eclampsia', 'management', 'preeclampsia', 'pregnancy']
        },
        {
          id: 'vid-magnesium-sulfate',
          type: 'video',
          title: 'Pre-eclampsia and Eclampsia - Pathophysiology',
          url: 'https://www.youtube.com/watch?v=pnGyENcL2j0',
          source: 'RegisteredNurseRN',
          duration: '12:15',
          relevance: 'essential',
          tags: ['preeclampsia', 'eclampsia', 'pathophysiology']
        },
        {
          id: 'vid-obstetric-seizure',
          type: 'video',
          title: 'Magnesium Sulfate Administration and Monitoring',
          url: 'https://www.youtube.com/watch?v=833v2Tm-Rr4',
          source: 'Wards Made Easy (WME)',
          duration: '18:20',
          relevance: 'important',
          tags: ['magnesium-sulfate', 'eclampsia', 'monitoring', 'treatment']
        }
      ],
      articles: [
        {
          id: 'art-eclampsia-rcog',
          type: 'article',
          title: 'RCOG Green-top Guideline: Management of Severe Pre-eclampsia/Eclampsia',
          url: 'https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/management-of-severe-pre-eclampsia-eclampsia-green-top-guideline-no-10a/',
          source: 'Royal College of Obstetricians',
          caption: 'Evidence-based guideline on eclampsia management',
          relevance: 'essential',
          tags: ['eclampsia', 'preeclampsia', 'guideline', 'RCOG']
        },
        {
          id: 'art-magnesium-therapy',
          type: 'article',
          title: 'Magnesium Sulfate for Eclampsia: Evidence and Guidelines',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4662123/',
          source: 'The Lancet',
          caption: 'Landmark studies on magnesium sulfate use in eclampsia',
          relevance: 'essential',
          tags: ['magnesium-sulfate', 'eclampsia', 'evidence', 'treatment']
        },
        {
          id: 'art-hellp-syndrome',
          type: 'article',
          title: 'HELLP Syndrome: Recognition and Management',
          url: 'https://bestpractice.bmj.com/topics/en-gb/496',
          source: 'BMJ Best Practice',
          caption: 'Clinical features and evidence-based management of HELLP syndrome',
          relevance: 'important',
          tags: ['HELLP', 'preeclampsia', 'pregnancy', 'complication']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL TRAUMA CASES (Adding 5+ cases)
// ============================================================================

export const additionalTraumaCases: CaseScenario[] = [
  createCase({
    id: 'trauma-011',
    title: 'Amputation Injury Industrial Accident',
    category: 'trauma',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 20,
    dispatchInfo: {
      callReason: 'Hand caught in machine, hand severed, heavy bleeding',
      timeOfDay: 'morning',
      location: 'Factory, Industrial Area',
      callerInfo: 'Foreman',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 30,
      gender: 'male',
      weight: 75,
      occupation: 'Factory worker',
      language: 'Hindi, Basic English'
    },
    sceneInfo: {
      description: 'Factory floor, patient sitting',
      hazards: ['Industrial machinery', 'Blood', 'Sharp objects'],
      bystanders: 'Coworkers, first aider present',
      environment: 'Industrial, noisy'
    },
    initialPresentation: {
      generalImpression: 'Young male, pale, holding stump of right forearm',
      position: 'Sitting',
      appearance: 'Pale, anxious, bleeding controlled with pressure',
      consciousness: 'Alert'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: []
      },
      breathing: {
        rate: 24,
        rhythm: 'Regular',
        depth: 'Normal',
        spo2: 95,
        findings: ['Tachypneic from pain'],
        interventions: ['Oxygen']
      },
      circulation: {
        pulseRate: 120,
        pulseQuality: 'Weak',
        bp: { systolic: 90, diastolic: 60 },
        capillaryRefill: 3,
        skin: 'Pale, clammy',
        findings: ['Significant blood loss', 'Hypotensive', 'Tachycardic'],
        interventions: ['Tourniquet', 'IV access x2', 'Fluid resuscitation']
      },
      disability: {
        avpu: 'A',
        gcs: { eye: 4, verbal: 5, motor: 6, total: 15 },
        pupils: 'Equal and reactive',
        bloodGlucose: 5.4,
        findings: ['Alert', 'Severe pain'],
        interventions: ['Analgesia']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Complete amputation right hand at wrist level', 'Amputated part present'],
        interventions: ['Care for amputated part', 'Keep dry and cool']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Right hand amputation at wrist', 'Tourniquet in place', 'Distal pulses absent (amputated)'],
      posterior: ['Normal'],
      neurological: ['Sensation lost distal to amputation']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Breakfast 2 hours ago',
      eventsLeading: 'Hand caught in printing press machine'
    },
    vitalSignsProgression: {
      initial: { bp: '90/60', pulse: 120, respiration: 24, spo2: 95, gcs: 15 },
      afterIntervention: { bp: '110/70', pulse: 100, respiration: 20, spo2: 98, gcs: 15 }
    },
    expectedFindings: {
      keyObservations: ['Complete traumatic amputation', 'Hemorrhagic shock', 'Amputated part viable'],
      redFlags: ['Reperfusion injury', 'Hyperkalemia from cell death'],
      differentialDiagnoses: ['Traumatic amputation', 'Crush injury', 'Hemorrhagic shock'],
      mostLikelyDiagnosis: 'Traumatic Amputation of Right Hand'
    },
    studentChecklist: [
      { id: 't11-1', category: 'intervention', description: 'Control bleeding with direct pressure/tourniquet', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't11-2', category: 'intervention', description: 'Proper care of amputated part (dry, cool, do not immerse)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 't11-3', category: 'intervention', description: 'IV access and fluid resuscitation', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 't11-4', category: 'intervention', description: 'Analgesia and transport to trauma center', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'Amputated parts should be wrapped in moist gauze, placed in waterproof bag, then on ice',
      'Never place amputated part directly on ice or in water',
      'Time is critical - reimplantation best within 6 hours',
      'Tourniquet acceptable for life-threatening limb bleeding'
    ],
    commonPitfalls: [
      'Failing to locate and preserve the amputated part - critical for reimplantation',
      'Placing amputated part directly on ice causing tissue freeze injury',
      'Inadequate tourniquet application leading to continued bleeding',
      'Delaying transport while searching for missing tissue fragments',
      'Not considering underlying crush injury and rhabdomyolysis risk',
      'Missing associated injuries from the mechanism (e.g., shoulder dislocation from pull)',
      'Failing to provide adequate analgesia - amputation is extremely painful',
      'Not documenting tourniquet time clearly - reimplantation viability window',
      'Transporting to a facility without microsurgical capabilities',
      'Forgetting tetanus prophylaxis and antibiotic administration'
    ],
    equipmentNeeded: [
      'Combat Application Tourniquet (CAT) or similar',
      'Sterile saline or clean water for irrigation',
      'Sterile gauze pads and cling film',
      'Waterproof sealable bag',
      'Cooler with ice (not direct contact with amputated part)',
      'Large bore IV access (14-16G)',
      'Fluid resuscitation (crystalloids, blood products if available)',
      'Analgesics (opioids, ketamine)',
      'Tetanus toxoid',
      'Broad-spectrum antibiotics',
      'Splinting materials',
      'Sterile drapes',
      'Hemostatic gauze (QuikClot, Celox)',
      'Pressure bandages'
    ],
    uaeProtocols: {
      applicableGuidelines: ['DCAS Trauma Protocols', 'PHTLS', 'ATLS'],
      receivingFacilities: [
        { name: 'Rashid Hospital Trauma Center (Level I)', location: 'Dubai', capabilities: ['Microsurgical capabilities', '24/7 hand surgery', 'Replantation services'], contact: '04 219 3000', distance: 'Primary trauma center Dubai' },
        { name: 'Dubai Hospital', location: 'Dubai', capabilities: ['Hand surgery', 'Replantation services', 'Plastic surgery'], contact: '04 337 3000', distance: 'Varies by location' },
        { name: 'Saudi German Hospital Dubai', location: 'Dubai', capabilities: ['Plastic and reconstructive surgery', 'Microsurgery'], contact: '04 389 0000', distance: 'Multiple locations' },
        { name: 'Cleveland Clinic Abu Dhabi', location: 'Abu Dhabi', capabilities: ['Microsurgical hand reconstruction', 'Orthopedic surgery'], contact: '02 501 8000', distance: 'Abu Dhabi - long transport' }
      ],
      localConsiderations: [
        'Industrial areas like Jebel Ali Free Zone have high-risk machinery operations',
        'Many workers are expatriates with limited English/Arabic - may need interpreter',
        'Factory medical rooms often have basic first aid but lack advanced trauma equipment',
        'Dubai Occupational Health and Safety regulations require incident reporting',
        'Worker compensation and insurance documentation often required',
        'Rashid Hospital is primary trauma center for severe hand injuries in Dubai',
        'Reimplantation surgery requires specialized microsurgical team - not all hospitals equipped',
        'Industrial safety standards vary across different free zones (JAFZA, DIC, DPC)',
        'Summer heat (40-50°C) increases risk of tissue deterioration - prioritize rapid cooling',
        'Friday is common day off for many workers - emergency services may need translation services'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'amputated-part-care-1',
          type: 'image',
          title: 'Proper Amputated Part Care Technique',
          url: 'https://emedicine.medscape.com/article/826816-overview',
          source: 'Medscape',
          relevance: 'essential',
          tags: ['amputation', 'prehospital', 'care']
        },
        {
          id: 'hand-amputation-levels',
          type: 'image',
          title: 'Hand Anatomy and Amputation Levels',
          url: 'https://www.assh.org/handcare/condition/amputation',
          source: 'American Society for Surgery of the Hand',
          relevance: 'important',
          tags: ['hand', 'anatomy', 'amputation']
        }
      ],
      videos: [
        {
          id: 'emcrit-amputation',
          type: 'video',
          title: 'Amputation Management and Tourniquet Use',
          url: 'https://www.youtube.com/watch?v=Ug4AKrwa0K8',
          source: 'The Paramedic Coach',
          duration: '18:45',
          relevance: 'essential',
          tags: ['amputation', 'tourniquet', 'hemorrhage']
        },
        {
          id: 'oxford-hand-replant',
          type: 'video',
          title: 'Hand Trauma and Replantation Surgery',
          url: 'https://www.youtube.com/watch?v=nudDS0B9yD8',
          source: 'SimpleNursing',
          duration: '24:30',
          relevance: 'important',
          tags: ['hand', 'trauma', 'replantation']
        },
        {
          id: 'litfl-extremity',
          type: 'video',
          title: 'Prehospital Management of Severe Extremity Trauma',
          url: 'https://www.youtube.com/watch?v=JRa9F2PVmL0',
          source: 'RegisteredNurseRN',
          duration: '15:20',
          relevance: 'essential',
          tags: ['extremity', 'trauma', 'prehospital']
        }
      ],
      articles: [
        {
          id: 'prehospital-amputated-part',
          type: 'article',
          title: 'Prehospital Care of the Amputated Part',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4821295/',
          source: 'Journal of Emergency Medical Services',
          relevance: 'essential',
          tags: ['amputation', 'prehospital', 'care']
        },
        {
          id: 'industrial-hand-trauma',
          type: 'article',
          title: 'Industrial Hand Trauma: Epidemiology and Prevention',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5537426/',
          source: 'Safety and Health at Work',
          relevance: 'supplementary',
          tags: ['industrial', 'hand', 'trauma', 'prevention']
        }
      ]
    }
  }),

  createCase({
    id: 'trauma-012',
    title: 'Drowning with Hypothermia',
    category: 'trauma',
    priority: 'critical',
    complexity: 'advanced',
    yearLevels: ['3rd-year', '4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Child pulled from swimming pool, not breathing',
      timeOfDay: 'afternoon',
      location: 'Villa pool, Emirates Hills',
      callerInfo: 'Pool lifeguard',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 4,
      gender: 'female',
      weight: 18,
      occupation: 'N/A',
      language: 'None'
    },
    sceneInfo: {
      description: 'Poolside, child on towel',
      hazards: ['Wet surface', 'Pool chemicals'],
      bystanders: 'Parents, lifeguard',
      environment: 'Outdoor, hot weather'
    },
    initialPresentation: {
      generalImpression: 'Young child, pale, not breathing',
      position: 'Supine on ground',
      appearance: 'Pale, cold, cyanotic lips',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: false,
        findings: ['Fluid in airway', 'Vomitus'],
        interventions: ['Suction', 'Airway opening']
      },
      breathing: {
        rate: 0,
        rhythm: 'Absent',
        depth: 'None',
        spo2: 70,
        findings: ['Apneic'],
        interventions: ['BVM ventilation', 'Consider intubation']
      },
      circulation: {
        pulseRate: 50,
        pulseQuality: 'Weak',
        bp: { systolic: 70, diastolic: 40 },
        capillaryRefill: 4,
        skin: 'Pale, cold, temperature 32°C',
        findings: ['Bradycardic', 'Hypothermic', 'Hypotensive'],
        interventions: ['CPR if no pulse', 'Warm fluids']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 3, total: 5 },
        pupils: 'Sluggish but reactive',
        bloodGlucose: 5.4,
        findings: ['Hypoxic brain injury risk'],
        interventions: ['Prevent further heat loss']
      },
      exposure: {
        temperature: 36.8,
        findings: ['Hypothermia 32°C', 'Wet clothes'],
        interventions: ['Remove wet clothes', 'Active rewarming', 'Warm blankets']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['C-spine precautions'],
      chest: ['Crackles bilaterally', 'Aspiration likely'],
      abdomen: ['Distended from swallowed water'],
      pelvis: ['Normal'],
      extremities: ['Cold', 'Pale'],
      posterior: ['Normal'],
      neurological: ['Unresponsive', 'GCS 5']
    },
    history: {
      medications: [],
      allergies: ['None'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Lunch 2 hours ago',
      eventsLeading: 'Fell into pool while unsupervised, estimated submersion 5 minutes'
    },
    vitalSignsProgression: {
      initial: { bp: '70/40', pulse: 50, respiration: 0, spo2: 70, gcs: 5, temperature: 32 }
    },
    expectedFindings: {
      keyObservations: ['Drowning', 'Hypothermia', 'Respiratory arrest', 'Aspiration'],
      redFlags: ['Hypoxic brain injury', 'Secondary drowning', 'Death'],
      differentialDiagnoses: ['Drowning', 'Hypothermia', 'Aspiration pneumonia'],
      mostLikelyDiagnosis: 'Drowning with Hypothermia'
    },
    studentChecklist: [
      { id: 't12-1', category: 'abcde', description: 'Airway suction and BVM ventilation', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't12-2', category: 'abcde', description: 'Check pulse and start CPR if needed', points: 15, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'], critical: true },
      { id: 't12-3', category: 'intervention', description: 'Active rewarming for hypothermia', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['advanced', 'expert'] },
      { id: 't12-4', category: 'intervention', description: 'Remove wet clothing and dry patient', points: 5, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] },
      { id: 't12-5', category: 'abcde', description: 'C-spine precautions (possible dive/trauma)', points: 10, yearLevel: ['3rd-year', '4th-year'], complexity: ['intermediate', 'advanced'] }
    ],
    teachingPoints: [
      'No patient is dead until warm and dead - hypothermia is protective',
      'Drowning is a respiratory emergency - prioritize oxygenation',
      'Secondary drowning can occur up to 24 hours after submersion',
      'Always consider C-spine injury in diving accidents'
    ],
    commonPitfalls: [
      'Delaying CPR due to "no patient is dead until warm and dead" - hypothermic patients still need CPR if no pulse',
      'Failing to suction airway before ventilation - vomitus and water obstruction common',
      'Not removing wet clothing completely - compromises rewarming efforts',
      'Using excessive pressure during BVM ventilation - risk of gastric distension and aspiration',
      'Stopping resuscitation too early in hypothermic patients - protect brain even with prolonged downtime',
      'Missing associated trauma from diving/fall mechanism - C-spine injury often overlooked',
      'Failure to actively rewarm - passive rewarming insufficient in severe hypothermia',
      'Not monitoring for secondary drowning - delayed respiratory compromise',
      'Transporting to facility without pediatric critical care capabilities',
      'Inadequate family communication and support during emotional pediatric emergency'
    ],
    equipmentNeeded: [
      'Pediatric BVM with appropriate mask sizes',
      'Suction unit (portable and powerful)',
      'Airway adjuncts (OPA/NPA sizes for pediatric patient)',
      'Intubation equipment (age-appropriate ETT sizes)',
      'C-spine immobilization device (pediatric size)',
      'Dry towels and blankets (multiple)',
      'Active warming device (Bair Hugger or chemical heat packs)',
      'Warm IV fluids (fluid warmer)',
      'Temperature monitoring device (esophageal/tympanic)',
      'Pulse oximeter (pediatric probe)',
      'Cardiac monitor/defibrillator with pediatric pads',
      'Vascular access equipment (IO needle if IV difficult)',
      'Pediatric drug dosing reference'
    ],
    uaeProtocols: {
      applicableGuidelines: ['DCAS Trauma Protocols', 'PHTLS', 'ATLS', 'AHA Pediatric Advanced Life Support'],
      receivingFacilities: [
        { name: 'Latifa Hospital (Dubai Hospital for Women and Children)', location: 'Dubai', capabilities: ['Pediatric critical care', 'Pediatric ICU', 'Dedicated pediatric emergency'], contact: '04 502 8000', distance: 'Varies by location' },
        { name: 'Al Jalila Childrens Specialty Hospital', location: 'Dubai Healthcare City', capabilities: ['Level I pediatric trauma', 'Pediatric ICU', 'Subspecialty care'], contact: '04 289 1111', distance: 'Dubai Healthcare City' },
        { name: 'Sheikh Khalifa Medical City', location: 'Abu Dhabi', capabilities: ['Pediatric emergency', 'Pediatric ICU'], contact: '02 610 2000', distance: 'Abu Dhabi' },
        { name: 'Rashid Hospital Trauma Center (Level I)', location: 'Dubai', capabilities: ['Level I trauma', 'Pediatric trauma capability'], contact: '04 219 3000', distance: 'Dubai' }
      ],
      localConsiderations: [
        'Private villa pools common in Emirates Hills, Arabian Ranches, Palm Jumeirah - variable access',
        'Many pools lack proper fencing or safety barriers - drowning risk higher in residential areas',
        'Summer heat (May-September) makes pool activity peak season for drowning incidents',
        'Expatriate families may have limited swimming safety knowledge or pool barriers',
        'Cultural considerations: family dynamics and language barriers during pediatric emergency',
        'Dubai regulations require pool safety measures but enforcement varies',
        'Beach drowning incidents may involve marine hazards (jellyfish, currents)',
        'Water parks common in Dubai - crowded environments increase risk',
        'Immediate family notification and support critical in pediatric emergencies',
        'Long-term outcomes require specialized pediatric neurology follow-up available at Latifa Hospital'
      ]
    },
    visualResources: {
      images: [
        {
          id: 'drowning-pathophysiology',
          type: 'image',
          title: 'Drowning Pathophysiology Diagram',
          url: 'https://wikem.org/wiki/Drowning',
          source: 'WikEM',
          relevance: 'essential',
          tags: ['drowning', 'pathophysiology', 'respiratory']
        },
        {
          id: 'hypothermia-staging',
          type: 'image',
          title: 'Hypothermia Classification and Management',
          url: 'https://www.wemjournal.org/article/S1080-6032(19)30001-5/fulltext',
          source: 'Wilderness & Environmental Medicine',
          relevance: 'important',
          tags: ['hypothermia', 'classification', 'staging']
        }
      ],
      videos: [
        {
          id: 'emcrit-drowning',
          type: 'video',
          title: 'Drowning Resuscitation: Prehospital Management',
          url: 'https://www.youtube.com/watch?v=Hlrbio-NpxQ',
          source: 'The First Aid Show',
          duration: '22:15',
          relevance: 'essential',
          tags: ['drowning', 'resuscitation', 'prehospital']
        },
        {
          id: 'litfl-hypothermia',
          type: 'video',
          title: 'Hypothermia Management in Trauma',
          url: 'https://www.youtube.com/watch?v=TNFzH_b4svk',
          source: 'Hamilton Health Sciences',
          duration: '18:30',
          relevance: 'essential',
          tags: ['hypothermia', 'trauma', 'management']
        },
        {
          id: 'oxford-pals-drowning',
          type: 'video',
          title: 'Pediatric Drowning and Submersion Injury',
          url: 'https://www.youtube.com/watch?v=mnfhnyY-Udk',
          source: 'ParkviewHealth',
          duration: '28:45',
          relevance: 'important',
          tags: ['drowning', 'pediatric', 'resuscitation']
        }
      ],
      articles: [
        {
          id: 'drowning-ilcor-guidelines',
          type: 'article',
          title: 'Drowning Resuscitation: ILCOR Guidelines 2020',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7014780/',
          source: 'Circulation',
          relevance: 'essential',
          tags: ['drowning', 'resuscitation', 'guidelines']
        },
        {
          id: 'secondary-drowning',
          type: 'article',
          title: 'Delayed Complications of Drowning: Secondary Drowning',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4101732/',
          source: 'BMJ Case Reports',
          relevance: 'important',
          tags: ['drowning', 'secondary', 'complications']
        },
        {
          id: 'hypothermia-cardiac-arrest',
          type: 'article',
          title: 'Hypothermic Cardiac Arrest: Resuscitation Strategies',
          url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5538899/',
          source: 'Scandinavian Journal of Trauma',
          relevance: 'important',
          tags: ['hypothermia', 'cardiac-arrest', 'resuscitation']
        },
        {
          id: 'drowning-litfl',
          type: 'article',
          title: 'Drowning - Critical Care Compendium',
          url: 'https://litfl.com/drowning/',
          source: 'Life in the Fast Lane',
          relevance: 'supplementary',
          tags: ['drowning', 'LITFL', 'critical-care', 'resuscitation']
        }
      ]
    }
  })
];

// ============================================================================
// ADDITIONAL BURNS CASES (Adding 4+ cases)
// ============================================================================

export const additionalBurnsCases: CaseScenario[] = [
  createCase({
    id: 'burn-002',
    title: 'Electrical Burn with Cardiac Arrest',
    category: 'burns',
    priority: 'critical',
    complexity: 'expert',
    yearLevels: ['4th-year'],
    estimatedDuration: 30,
    dispatchInfo: {
      callReason: 'Electrician shocked, unconscious, not breathing',
      timeOfDay: 'morning',
      location: 'Commercial building, Business Bay',
      callerInfo: 'Coworker',
      dispatchCode: 'Delta-1'
    },
    patientInfo: {
      age: 35,
      gender: 'male',
      weight: 80,
      occupation: 'Electrician',
      language: 'English'
    },
    sceneInfo: {
      description: 'Building site, patient near electrical panel',
      hazards: ['Live electrical hazard', 'Entrance and exit wounds'],
      bystanders: 'Coworkers',
      environment: 'Indoor construction site'
    },
    initialPresentation: {
      generalImpression: 'Young male, unresponsive, no breathing',
      position: 'Supine',
      appearance: 'Pale, burn marks on hands',
      consciousness: 'Unresponsive'
    },
    abcde: {
      airway: {
        patent: true,
        findings: ['Patent'],
        interventions: ['Airway adjunct']
      },
      breathing: {
        rate: 0,
        rhythm: 'Absent',
        depth: 'None',
        spo2: 0,
        findings: ['Apneic'],
        interventions: ['BVM', 'Intubation']
      },
      circulation: {
        pulseRate: 0,
        pulseQuality: 'Absent',
        bp: { systolic: 0, diastolic: 0 },
        capillaryRefill: 0,
        skin: 'Pale, entry/exit burns on hands',
        findings: ['Cardiac arrest', 'Asystole'],
        interventions: ['CPR', 'Defibrillation', 'ALS']
      },
      disability: {
        avpu: 'U',
        gcs: { eye: 1, verbal: 1, motor: 1, total: 3 },
        pupils: 'Dilated, fixed',
        findings: ['Cardiac arrest'],
        interventions: []
      },
      exposure: {
        temperature: 36.8,
        findings: ['Entry burn right hand', 'Exit burn left foot', 'Cardiac arrest'],
        interventions: ['Cover burns', 'Continue CPR']
      }
    },
    secondarySurvey: {
      head: ['Normal'],
      neck: ['Normal'],
      chest: ['Normal'],
      abdomen: ['Normal'],
      pelvis: ['Normal'],
      extremities: ['Entry wound right hand', 'Exit wound left foot', 'Deep burns'],
      posterior: ['Normal'],
      neurological: ['Cardiac arrest']
    },
    history: {
      medications: [],
      allergies: ['None known'],
      medicalConditions: ['Previously healthy'],
      surgicalHistory: [],
      lastMeal: 'Breakfast',
      eventsLeading: 'Working on electrical panel, sudden flash and collapse'
    },
    vitalSignsProgression: {
      initial: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3 }
    },
    expectedFindings: {
      keyObservations: ['Electrical injury', 'Cardiac arrest (asystole or VF)', 'Entry and exit wounds'],
      redFlags: ['Cardiac arrest', 'Internal organ damage', 'Compartment syndrome', 'Death'],
      differentialDiagnoses: ['Electrical injury', 'Ventricular fibrillation', 'Asystole'],
      mostLikelyDiagnosis: 'Electrical Injury with Cardiac Arrest'
    },
    studentChecklist: [
      { id: 'burn2-1', category: 'safety', description: 'Ensure scene is safe - power off', points: 15, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'burn2-2', category: 'abcde', description: 'Immediate CPR for cardiac arrest', points: 20, yearLevel: ['4th-year'], complexity: ['expert'], critical: true },
      { id: 'burn2-3', category: 'intervention', description: 'ALS protocol for electrical arrest', points: 15, yearLevel: ['4th-year'], complexity: ['expert'] },
      { id: 'burn2-4', category: 'abcde', description: 'Look for entry and exit wounds', points: 5, yearLevel: ['4th-year'], complexity: ['advanced', 'expert'] },
      { id: 'burn2-5', category: 'intervention', description: 'Cover burns and continue resuscitation', points: 5, yearLevel: ['4th-year'], complexity: ['expert'] }
    ],
    teachingPoints: [
      'Electrical injuries cause cardiac arrest - often asystole or VF',
      'Ensure power is off before approaching patient',
      'Entry and exit wounds may be small but internal damage extensive',
      'Continue resuscitation efforts longer - electrical arrests can recover'
    ],
    visualResources: {
      images: [
        {
          id: 'img-electrical-wikem',
          type: 'image',
          title: 'Electrical Burns: Entry and Exit Wounds',
          url: 'https://wikem.org/wiki/Electrical_injury',
          source: 'WikEM',
          caption: 'Recognition of entry and exit wounds in electrical injuries',
          relevance: 'essential',
          tags: ['electrical', 'burns', 'entry-wound', 'exit-wound']
        },
        {
          id: 'img-electrical-radiopaedia',
          type: 'image',
          title: 'Electrical Injury Complications',
          url: 'https://radiopaedia.org/articles/electrical-injuries',
          source: 'Radiopaedia',
          caption: 'Imaging findings and complications of electrical injuries',
          relevance: 'important',
          tags: ['electrical', 'injury', 'complications', 'imaging']
        }
      ],
      articles: [
        {
          id: 'art-electrical-wikem',
          type: 'article',
          title: 'Electrical Injuries: Emergency Management',
          url: 'https://wikem.org/wiki/Electrical_injury',
          source: 'WikEM',
          caption: 'Emergency management of electrical injuries and associated cardiac arrest',
          relevance: 'essential',
          tags: ['electrical', 'burns', 'emergency', 'cardiac-arrest']
        },
        {
          id: 'art-electrical-emcrit',
          type: 'article',
          title: 'Electrical Injury and Lightning Strike',
          url: 'https://emcrit.org/ibcc/electrical-injury/',
          source: 'EMCrit',
          caption: 'Critical care approach to electrical injuries',
          relevance: 'essential',
          tags: ['electrical', 'burns', 'lightning', 'critical-care']
        },
        {
          id: 'art-electrical-statpearls',
          type: 'article',
          title: 'Electrical Injuries: Pathophysiology and Treatment',
          url: 'https://www.statpearls.com/ArticleLibrary/viewarticle/21892',
          source: 'StatPearls',
          caption: 'Comprehensive review of electrical injury pathophysiology and treatment',
          relevance: 'important',
          tags: ['electrical', 'burns', 'pathophysiology', 'treatment']
        }
      ],
      videos: [
        {
          id: 'vid-electrical',
          type: 'video',
          title: 'Electrical Injury Management',
          url: 'https://www.youtube.com/watch?v=iYGusNOayN8',
          source: 'EMT Made Easy',
          caption: 'Scene safety and management of electrical injuries',
          duration: '11:45',
          relevance: 'essential',
          tags: ['electrical', 'burns', 'scene-safety', 'EMS']
        },
        {
          id: 'vid-electrical-osmosis',
          type: 'video',
          title: 'Electrical Burns and Lightning Injuries',
          url: 'https://www.youtube.com/watch?v=vk1bmDbtUPM',
          source: 'UAB Medicine',
          caption: 'Pathophysiology and management of electrical and lightning injuries',
          duration: '9:30',
          relevance: 'important',
          tags: ['electrical', 'burns', 'lightning', 'pathophysiology']
        }
      ]
    }
  })
];

// ============================================================================
// COMBINE ALL ADDITIONAL CASES
// ============================================================================

export const additionalCaseDatabase: CaseScenario[] = [
  ...additionalRespiratoryCases,
  ...additionalNeurologicalCases,
  ...additionalMetabolicCases,
  ...additionalToxicologyCases,
  ...additionalPediatricCases,
  ...additionalEnvironmentalCases,
  ...additionalPsychiatricCases,
  ...additionalObstetricCases,
  ...additionalTraumaCases,
  ...additionalBurnsCases
];

export default additionalCaseDatabase;
