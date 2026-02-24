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
    url: 'https://litfl.com/cushings-reflex/',
    source: 'Life in the Fast Lane',
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
    url: 'https://litfl.com/kernig-sign/',
    source: 'Life in the Fast Lane',
    clinicalSigns: ['Resistance to neck flexion', 'Knee pain on leg extension (Kernig)', 'Involuntary hip flexion on neck flexion (Brudzinski)'],
    relatedConditions: ['Bacterial meningitis', 'Viral meningitis', 'Subarachnoid hemorrhage'],
    relevance: 'important'
  }
];

// Respiratory Visual and Audio Findings
export const respiratoryFindings: ClinicalFindingResource[] = [
];

// Note: Audio findings temporarily removed due to broken external URLs
// Will be re-added once working audio sources are identified

// Cardiac Findings
export const cardiacFindings: ClinicalFindingResource[] = [
  {
    id: 'cardiac-pulsus-alternans',
    name: 'Pulsus Alternans',
    description: 'Regular alternation of strong and weak pulses indicating severe LV dysfunction',
    type: 'diagram',
    category: 'cardiac',
    url: 'https://litfl.com/pulsus-alternans/',
    source: 'Life in the Fast Lane',
    clinicalSigns: ['Alternating strong and weak pulse beats', 'Regular rhythm', 'Associated with S3 gallop'],
    relatedConditions: ['Severe left ventricular dysfunction', 'Cardiogenic shock', 'Acute heart failure'],
    relevance: 'important'
  }
];

// Dermatological / Color Findings
export const dermatologicalFindings: ClinicalFindingResource[] = [
];

// Trauma Findings
export const traumaFindings: ClinicalFindingResource[] = [
  {
    id: 'trauma-tension-pneumothorax',
    name: 'Tension Pneumothorax Signs',
    description: 'Clinical signs of tension pneumothorax requiring immediate decompression',
    type: 'image',
    category: 'trauma',
    url: 'https://litfl.com/wp-content/uploads/2018/08/Tension-Pneumothorax.jpg',
    thumbnailUrl: 'https://litfl.com/wp-content/uploads/2018/08/Tension-Pneumothorax.jpg',
    source: 'Life in the Fast Lane',
    clinicalSigns: ['Absent breath sounds', 'Tracheal deviation away from affected side', 'Hyperresonance', 'JVD', 'Hemodynamic compromise'],
    relatedConditions: ['Tension pneumothorax', 'Mechanical ventilation complication', 'Trauma'],
    relevance: 'essential'
  },
];

// Ophthalmic Findings
export const ophthalmicFindings: ClinicalFindingResource[] = [
];

// ENT Findings
export const entFindings: ClinicalFindingResource[] = [
];

// Abdominal Findings
export const abdominalFindings: ClinicalFindingResource[] = [
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
