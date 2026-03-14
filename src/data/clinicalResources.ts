/**
 * Clinical Findings Resources Library
 * 
 * Comprehensive collection of visual and audio resources for clinical findings.
 * Used to display images and play sounds during case simulations.
 * 
 * Categories:
 * - Visual Findings: Images of physical signs (rashes, injuries, color changes)
 * - Audio Findings: Sounds (breath sounds, heart sounds, environmental)
 * - ECG Library: Cardiac rhythms
 * - Procedure Images: Step-by-step visual guides
 */

// Clinical Resources Library

// ============================================================================
// CLINICAL FINDINGS - VISUAL RESOURCES
// Images of physical signs, rashes, injuries, and other visual findings
// ============================================================================

export interface ClinicalFindingResource {
  id: string;
  name: string;
  description: string;
  type: 'image' | 'audio' | 'video' | 'diagram';
  category: 'neurological' | 'respiratory' | 'cardiac' | 'dermatological' | 'trauma' | 'abdominal' | 'ophthalmic' | 'ent' | 'general';
  url: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  source: string;
  clinicalSigns: string[];
  relatedConditions: string[];
  relevance: 'essential' | 'important' | 'supplementary';
}

// Neurological Visual Findings
export const neurologicalFindings: ClinicalFindingResource[] = [
  {
    id: 'neuro-cushing-triad',
    name: 'Cushing Triad - Signs of Increased ICP',
    description: 'Hypertension, bradycardia, and irregular respiration indicating increased intracranial pressure',
    type: 'diagram',
    category: 'neurological',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK470312/',
    source: 'StatPearls - NCBI',
    clinicalSigns: ['Systolic hypertension with widening pulse pressure', 'Bradycardia', 'Irregular respirations'],
    relatedConditions: ['Increased intracranial pressure', 'Brain herniation', 'Severe TBI'],
    relevance: 'essential'
  },
  {
    id: 'neuro-hemiparesis',
    name: 'Facial Droop / Hemiparesis (FAST Assessment)',
    description: 'Unilateral facial weakness and arm drift indicating acute stroke',
    type: 'image',
    category: 'neurological',
    url: 'https://www.stroke.org/-/media/stroke-images/stroke-basics/face-arm-speech-time.jpg',
    source: 'American Stroke Association',
    clinicalSigns: ['Facial asymmetry', 'Arm drift', 'Slurred speech', 'Unequal nasolabial folds'],
    relatedConditions: ['Acute ischemic stroke', 'Intracerebral hemorrhage', 'TIA'],
    relevance: 'essential'
  },
  {
    id: 'neuro-meningeal-signs',
    name: 'Meningeal Signs (Kernig and Brudzinski)',
    description: 'Signs of meningeal irritation seen in meningitis',
    type: 'diagram',
    category: 'neurological',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK549860/',
    source: 'StatPearls - NCBI',
    clinicalSigns: ['Resistance to neck flexion', 'Knee pain on leg extension (Kernig)', 'Involuntary hip flexion on neck flexion (Brudzinski)'],
    relatedConditions: ['Bacterial meningitis', 'Viral meningitis', 'Subarachnoid hemorrhage'],
    relevance: 'important'
  }
];

// Respiratory Visual and Audio Findings
export const respiratoryFindings: ClinicalFindingResource[] = [
  {
    id: 'resp-pneumothorax-imaging',
    name: 'Pneumothorax - Imaging Guide',
    description: 'Comprehensive imaging features of pneumothorax including CXR and CT findings',
    type: 'image',
    category: 'respiratory',
    url: 'https://radiopaedia.org/articles/pneumothorax',
    source: 'Radiopaedia',
    clinicalSigns: ['Absent breath sounds unilaterally', 'Hyperresonance to percussion', 'Reduced chest expansion', 'Tracheal deviation (tension)'],
    relatedConditions: ['Tension pneumothorax', 'Spontaneous pneumothorax', 'Traumatic pneumothorax'],
    relevance: 'essential'
  },
  {
    id: 'resp-asthma-acute',
    name: 'Acute Severe Asthma - Emergency Management',
    description: 'Evidence-based approach to acute asthma assessment and escalating management',
    type: 'diagram',
    category: 'respiratory',
    url: 'https://www.emdocs.net/asthma-in-the-emergency-department/',
    source: 'EMDocs',
    clinicalSigns: ['Wheeze', 'Tachypnoea', 'Accessory muscle use', 'Unable to complete sentences', 'Silent chest (life-threatening)'],
    relatedConditions: ['Acute severe asthma', 'Life-threatening asthma', 'Near-fatal asthma'],
    relevance: 'essential'
  },
  {
    id: 'resp-copd-exacerbation',
    name: 'COPD Exacerbation - Oxygen Management',
    description: 'Controlled oxygen therapy and management of COPD exacerbation',
    type: 'diagram',
    category: 'respiratory',
    url: 'https://www.nice.org.uk/guidance/ng115',
    source: 'NICE',
    clinicalSigns: ['Increased dyspnoea', 'Increased sputum', 'Purulent sputum', 'Peripheral oedema', 'CO2 retention'],
    relatedConditions: ['COPD exacerbation', 'Type 2 respiratory failure', 'Cor pulmonale'],
    relevance: 'essential'
  },
  {
    id: 'resp-pleural-effusion',
    name: 'Pleural Effusion - Imaging Features',
    description: 'Imaging recognition and clinical significance of pleural effusion',
    type: 'image',
    category: 'respiratory',
    url: 'https://radiopaedia.org/articles/pleural-effusion',
    source: 'Radiopaedia',
    clinicalSigns: ['Reduced breath sounds', 'Stony dull percussion', 'Reduced chest expansion', 'Mediastinal shift (massive)'],
    relatedConditions: ['Pleural effusion', 'Haemothorax', 'Empyema', 'Heart failure'],
    relevance: 'important'
  },
  {
    id: 'resp-pe-recognition',
    name: 'Pulmonary Embolism Recognition',
    description: 'Clinical features and risk stratification of pulmonary embolism',
    type: 'diagram',
    category: 'respiratory',
    url: 'https://rebelem.com/pulmonary-embolism/',
    source: 'REBEL EM',
    clinicalSigns: ['Pleuritic chest pain', 'Tachycardia', 'Dyspnoea', 'Hypoxia', 'Haemoptysis', 'Syncope'],
    relatedConditions: ['Pulmonary embolism', 'DVT', 'Right heart strain'],
    relevance: 'essential'
  },
];

// Cardiac Findings
export const cardiacFindings: ClinicalFindingResource[] = [
  {
    id: 'cardiac-pulsus-alternans',
    name: 'Pulsus Alternans',
    description: 'Regular alternation of strong and weak pulses indicating severe LV dysfunction',
    type: 'diagram',
    category: 'cardiac',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK559163/',
    source: 'StatPearls - NCBI',
    clinicalSigns: ['Alternating strong and weak pulse beats', 'Regular rhythm', 'Associated with S3 gallop'],
    relatedConditions: ['Severe left ventricular dysfunction', 'Cardiogenic shock', 'Acute heart failure'],
    relevance: 'important'
  }
];

// Dermatological / Color Findings
export const dermatologicalFindings: ClinicalFindingResource[] = [
  {
    id: 'derm-urticaria-anaphylaxis',
    name: 'Urticaria and Anaphylaxis Rash',
    description: 'Recognition of urticaria and skin manifestations of anaphylaxis',
    type: 'image',
    category: 'dermatological',
    url: 'https://dermnetnz.org/topics/acute-urticaria',
    source: 'DermNet NZ',
    clinicalSigns: ['Raised wheals', 'Erythema', 'Angioedema', 'Pruritus', 'Flushing'],
    relatedConditions: ['Urticaria', 'Anaphylaxis', 'Angioedema', 'Allergic reaction'],
    relevance: 'essential'
  },
  {
    id: 'derm-purpura-meningitis',
    name: 'Non-blanching Purpura (Meningococcal)',
    description: 'Recognition of non-blanching purpuric rash indicating meningococcal sepsis',
    type: 'image',
    category: 'dermatological',
    url: 'https://dermnetnz.org/topics/purpura',
    source: 'DermNet NZ',
    clinicalSigns: ['Non-blanching rash', 'Petechiae', 'Purpura', 'Rapid progression'],
    relatedConditions: ['Meningococcal septicaemia', 'DIC', 'Meningitis', 'Sepsis'],
    relevance: 'essential'
  },
  {
    id: 'derm-cyanosis',
    name: 'Central vs Peripheral Cyanosis',
    description: 'Differentiation of central and peripheral cyanosis and clinical significance',
    type: 'diagram',
    category: 'dermatological',
    url: 'https://www.emdocs.net/cyanosis/',
    source: 'EMDocs',
    clinicalSigns: ['Blue lips and tongue (central)', 'Blue fingertips (peripheral)', 'Mottling', 'Poor capillary refill'],
    relatedConditions: ['Hypoxia', 'Shock', 'Heart failure', 'Pulmonary embolism', 'Hypothermia'],
    relevance: 'essential'
  },
  {
    id: 'derm-burns-assessment',
    name: 'Burns Depth and TBSA Assessment',
    description: 'Burns classification by depth and total body surface area estimation',
    type: 'diagram',
    category: 'dermatological',
    url: 'https://dermnetnz.org/topics/burn',
    source: 'DermNet NZ',
    clinicalSigns: ['Erythema (superficial)', 'Blistering (partial thickness)', 'White/charred (full thickness)', 'Circumferential burns'],
    relatedConditions: ['Thermal burns', 'Chemical burns', 'Electrical burns', 'Inhalation injury'],
    relevance: 'important'
  },
];

// Trauma Findings
export const traumaFindings: ClinicalFindingResource[] = [
  {
    id: 'trauma-tension-pneumothorax',
    name: 'Tension Pneumothorax Signs',
    description: 'Clinical signs of tension pneumothorax requiring immediate decompression',
    type: 'image',
    category: 'trauma',
    url: 'https://radiopaedia.org/articles/tension-pneumothorax',
    thumbnailUrl: 'https://radiopaedia.org/articles/tension-pneumothorax',
    source: 'Radiopaedia',
    clinicalSigns: ['Absent breath sounds', 'Tracheal deviation away from affected side', 'Hyperresonance', 'JVD', 'Hemodynamic compromise'],
    relatedConditions: ['Tension pneumothorax', 'Mechanical ventilation complication', 'Trauma'],
    relevance: 'essential'
  },
];

// Ophthalmic Findings
export const ophthalmicFindings: ClinicalFindingResource[] = [
  {
    id: 'oph-pupil-assessment',
    name: 'Pupil Assessment - Unequal Pupils',
    description: 'Assessment of pupil size, reactivity, and clinical significance of anisocoria',
    type: 'diagram',
    category: 'ophthalmic',
    url: 'https://litfl.com/pupil-examination/',
    source: 'LITFL',
    clinicalSigns: ['Unequal pupils (anisocoria)', 'Fixed dilated pupil', 'Pinpoint pupils', 'Sluggish reaction'],
    relatedConditions: ['Raised intracranial pressure', 'Brain herniation', 'Opioid overdose', 'Horner syndrome', 'Third nerve palsy'],
    relevance: 'essential'
  },
  {
    id: 'oph-chemical-burn',
    name: 'Chemical Eye Burns - Emergency Management',
    description: 'Recognition and immediate management of chemical eye injury',
    type: 'diagram',
    category: 'ophthalmic',
    url: 'https://emedicine.medscape.com/article/798696-overview',
    source: 'Medscape',
    clinicalSigns: ['Eye pain', 'Blepharospasm', 'Conjunctival injection', 'Corneal haziness', 'Reduced visual acuity'],
    relatedConditions: ['Chemical burn', 'Alkali burn', 'Acid burn', 'Industrial injury'],
    relevance: 'important'
  },
  {
    id: 'oph-periorbital-trauma',
    name: 'Orbital and Periorbital Trauma',
    description: 'Recognition of orbital fractures and periorbital injuries',
    type: 'image',
    category: 'ophthalmic',
    url: 'https://radiopaedia.org/articles/orbital-fracture',
    source: 'Radiopaedia',
    clinicalSigns: ['Periorbital ecchymosis (raccoon eyes)', 'Enophthalmos', 'Restricted eye movement', 'Infraorbital numbness'],
    relatedConditions: ['Orbital blow-out fracture', 'Base of skull fracture', 'Retrobulbar haemorrhage'],
    relevance: 'important'
  },
];

// ENT Findings
export const entFindings: ClinicalFindingResource[] = [
  {
    id: 'ent-stridor-assessment',
    name: 'Stridor - Assessment and Causes',
    description: 'Recognition and differentiation of stridor in adults and children',
    type: 'diagram',
    category: 'ent',
    url: 'https://litfl.com/stridor/',
    source: 'LITFL',
    clinicalSigns: ['Inspiratory stridor', 'Expiratory stridor', 'Biphasic stridor', 'Drooling', 'Tripod position'],
    relatedConditions: ['Croup', 'Epiglottitis', 'Foreign body aspiration', 'Anaphylaxis', 'Ludwig angina'],
    relevance: 'essential'
  },
  {
    id: 'ent-epistaxis',
    name: 'Epistaxis - Emergency Management',
    description: 'Assessment and management of anterior and posterior epistaxis',
    type: 'diagram',
    category: 'ent',
    url: 'https://www.emdocs.net/epistaxis-management/',
    source: 'EMDocs',
    clinicalSigns: ['Active nasal bleeding', 'Blood in oropharynx (posterior)', 'Haemodynamic instability (severe)'],
    relatedConditions: ['Anterior epistaxis', 'Posterior epistaxis', 'Coagulopathy', 'Hypertension'],
    relevance: 'important'
  },
  {
    id: 'ent-epiglottitis-imaging',
    name: 'Epiglottitis - Imaging Recognition',
    description: 'Imaging features of epiglottitis (thumbprint sign)',
    type: 'image',
    category: 'ent',
    url: 'https://radiopaedia.org/articles/epiglottitis',
    source: 'Radiopaedia',
    clinicalSigns: ['Severe sore throat', 'Muffled voice', 'Drooling', 'Stridor', 'Tripod position'],
    relatedConditions: ['Epiglottitis', 'Supraglottitis', 'Upper airway obstruction'],
    relevance: 'essential'
  },
];

// Abdominal Findings
export const abdominalFindings: ClinicalFindingResource[] = [
  {
    id: 'abdo-aaa-rupture',
    name: 'Ruptured AAA - Clinical Signs',
    description: 'Recognition of ruptured abdominal aortic aneurysm',
    type: 'diagram',
    category: 'abdominal',
    url: 'https://radiopaedia.org/articles/abdominal-aortic-aneurysm-2',
    source: 'Radiopaedia',
    clinicalSigns: ['Abdominal pain radiating to back', 'Pulsatile abdominal mass', 'Hypotension', 'Syncope'],
    relatedConditions: ['Ruptured AAA', 'Abdominal aortic aneurysm', 'Hypovolaemic shock'],
    relevance: 'essential'
  },
  {
    id: 'abdo-acute-abdomen',
    name: 'Acute Abdomen - Systematic Assessment',
    description: 'Systematic approach to acute abdominal pain assessment',
    type: 'diagram',
    category: 'abdominal',
    url: 'https://www.emdocs.net/acute-abdomen/',
    source: 'EMDocs',
    clinicalSigns: ['Guarding', 'Rigidity', 'Rebound tenderness', 'Distension', 'Absent bowel sounds'],
    relatedConditions: ['Appendicitis', 'Peritonitis', 'Bowel obstruction', 'Ruptured ectopic', 'Pancreatitis'],
    relevance: 'essential'
  },
  {
    id: 'abdo-gi-bleed',
    name: 'GI Bleeding - Assessment and Management',
    description: 'Upper and lower GI bleeding recognition and emergency management',
    type: 'diagram',
    category: 'abdominal',
    url: 'https://www.emdocs.net/gi-bleeding-in-the-emergency-department/',
    source: 'EMDocs',
    clinicalSigns: ['Haematemesis', 'Melaena', 'Haematochezia', 'Tachycardia', 'Postural hypotension'],
    relatedConditions: ['Upper GI bleed', 'Lower GI bleed', 'Variceal bleeding', 'Peptic ulcer', 'Diverticular bleed'],
    relevance: 'essential'
  },
];

// Note: Heart sounds audio temporarily removed due to broken external URLs
// Will be re-added once working audio sources are identified

// ============================================================================
// PROCEDURE RESOURCES
// ============================================================================

export const procedureResources: ClinicalFindingResource[] = [
  // Procedure resources temporarily removed - awaiting verified video URLs
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get resources by category
export const getResourcesByCategory = (category: string): ClinicalFindingResource[] => {
  const allResources = [
    ...neurologicalFindings,
    ...respiratoryFindings,
    ...cardiacFindings,
    ...dermatologicalFindings,
    ...traumaFindings,
    ...ophthalmicFindings,
    ...entFindings,
    ...abdominalFindings,
    ...procedureResources
  ];
  
  return allResources.filter(r => r.category === category);
};

// Get resources by clinical finding keywords
export const getResourcesByFinding = (finding: string): ClinicalFindingResource[] => {
  const allResources = [
    ...neurologicalFindings,
    ...respiratoryFindings,
    ...cardiacFindings,
    ...dermatologicalFindings,
    ...traumaFindings,
    ...ophthalmicFindings,
    ...entFindings,
    ...abdominalFindings,
    ...procedureResources
  ];

  const lowerFinding = finding.toLowerCase();

  return allResources.filter(r =>
    r.name.toLowerCase().includes(lowerFinding) ||
    r.description.toLowerCase().includes(lowerFinding) ||
    r.clinicalSigns.some((s: string) => s.toLowerCase().includes(lowerFinding)) ||
    r.relatedConditions.some((c: string) => c.toLowerCase().includes(lowerFinding))
  );
};

// Get all resources
export const getAllClinicalResources = (): ClinicalFindingResource[] => {
  return [
    ...neurologicalFindings,
    ...respiratoryFindings,
    ...cardiacFindings,
    ...dermatologicalFindings,
    ...traumaFindings,
    ...ophthalmicFindings,
    ...entFindings,
    ...abdominalFindings,
    ...procedureResources
  ];
};

// Get resources for a specific case based on findings
export const getResourcesForCase = (caseFindings: string[]): ClinicalFindingResource[] => {
  const allResources = getAllClinicalResources();
  const matchedResources: ClinicalFindingResource[] = [];
  
  caseFindings.forEach(finding => {
    const lowerFinding = finding.toLowerCase();
    const matches = allResources.filter(r =>
      r.name.toLowerCase().includes(lowerFinding) ||
      r.clinicalSigns.some(s => s.toLowerCase().includes(lowerFinding)) ||
      r.relatedConditions.some(c => c.toLowerCase().includes(lowerFinding))
    );
    matchedResources.push(...matches);
  });
  
  // Remove duplicates
  return [...new Map(matchedResources.map(r => [r.id, r])).values()];
};

// Export all resources organized by category
export const clinicalResources = {
  neurological: neurologicalFindings,
  respiratory: respiratoryFindings,
  cardiac: cardiacFindings,
  dermatological: dermatologicalFindings,
  trauma: traumaFindings,
  ophthalmic: ophthalmicFindings,
  ent: entFindings,
  abdominal: abdominalFindings,
  procedures: procedureResources
};

export default clinicalResources;
