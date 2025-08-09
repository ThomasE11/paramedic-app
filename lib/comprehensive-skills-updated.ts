// Comprehensive paramedic skills with detailed steps from official skill documents
// Extracted from individual skill sheet .docx files in skills_documents directory

import extractedSkills from '@/data/extracted_paramedic_skills.json';
import extractedSkillSteps from '@/data/extracted_skill_steps.json';
import { enhancedCriticalSkillSteps, criticalSkillsMetadata } from './enhanced-critical-skills';

export interface SkillStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  isRequired: boolean;
  keyPoints?: string[];
  timeEstimate?: number;
  isCritical?: boolean;
}

export interface AssessmentCriterion {
  id: string;
  skillId: string;
  criterion: string;
  maxPoints: number;
  isRequired: boolean;
}

export interface Category {
  id: string;
  name: string;
  colorCode: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  isActive: boolean;
  minimumRequirement: number;
  timeEstimateMinutes: number;
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  createdAt: string;
  updatedAt: string;
  category: Category;
  steps: SkillStep[];
  assessmentCriteria: AssessmentCriterion[];
  equipment?: string[];
  isCritical?: boolean;
  objectives?: string[];
  indications?: string[];
  contraindications?: string[];
  commonErrors?: string[];
}

// Enhanced category mapping based on paramedic training standards
const categories: { [key: string]: Category } = {
  'bls': {
    id: 'bls',
    name: 'Basic Life Support (BLS)',
    colorCode: '#3B82F6',
  },
  'als': {
    id: 'als',
    name: 'Advanced Life Support (ALS)',
    colorCode: '#EF4444',
  },
  'pediatric': {
    id: 'pediatric',
    name: 'Pediatric Care',
    colorCode: '#10B981',
  },
  'obstetric': {
    id: 'obstetric',
    name: 'Obstetric Care',
    colorCode: '#F59E0B',
  },
  'trauma': {
    id: 'trauma',
    name: 'Trauma Management',
    colorCode: '#8B5CF6',
  },
  'medical': {
    id: 'medical',
    name: 'Medical Procedures',
    colorCode: '#06B6D4',
  },
  'airway': {
    id: 'airway',
    name: 'Airway Management',
    colorCode: '#EC4899',
  },
  'assessment': {
    id: 'assessment',
    name: 'Patient Assessment',
    colorCode: '#84CC16',
  },
  'pharmacology': {
    id: 'pharmacology',
    name: 'Pharmacology',
    colorCode: '#F97316',
  },
  'cardiac': {
    id: 'cardiac',
    name: 'Cardiac Care',
    colorCode: '#DC2626',
  }
};

// Advanced skill categorization function
function mapSkillToCategory(skillName: string): string {
  const name = skillName.toLowerCase();
  
  // BLS Skills
  if (name.includes('cpr') || name.includes('choking') || name.includes('recovery') || 
      name.includes('hand wash') || name.includes('bleeding control') || name.includes('shock')) {
    return 'bls';
  }
  
  // Pediatric/Neonatal Skills
  if (name.includes('pediatric') || name.includes('infant') || name.includes('paediatric') || 
      name.includes('neonatal') || name.includes('child')) {
    return 'pediatric';
  }
  
  // Obstetric Skills
  if (name.includes('childbirth') || name.includes('delivery') || name.includes('umbilical') || 
      name.includes('prolapsed') || name.includes('vaginal') || name.includes('cord')) {
    return 'obstetric';
  }
  
  // Airway Management Skills
  if (name.includes('airway') || name.includes('intubation') || name.includes('ventilation') || 
      name.includes('suction') || name.includes('laryngeal') || name.includes('endotracheal') || 
      name.includes('bag valve') || name.includes('cpap') || name.includes('cricothyroidotomy') ||
      name.includes('oropharyngeal') || name.includes('nasopharyngeal') || name.includes('supraglottic')) {
    return 'airway';
  }
  
  // Trauma Skills
  if (name.includes('fracture') || name.includes('splint') || name.includes('wound') || 
      name.includes('bandage') || name.includes('immobilization') || name.includes('traction') ||
      name.includes('spine') || name.includes('cervical')) {
    return 'trauma';
  }
  
  // Assessment Skills
  if (name.includes('ecg') || name.includes('hgt') || name.includes('vital') || 
      name.includes('handover') || name.includes('assessment') || name.includes('prediction') || 
      name.includes('etco2') || name.includes('glucose') || name.includes('ashice')) {
    return 'assessment';
  }
  
  // Pharmacology Skills
  if (name.includes('drug') || name.includes('injection') || name.includes('medication') || 
      name.includes('nebulization') || name.includes('administration')) {
    return 'pharmacology';
  }
  
  // Cardiac Skills
  if (name.includes('cardioversion') || name.includes('pacing') || name.includes('carotid') || 
      name.includes('valsalva') || name.includes('defibrillator')) {
    return 'cardiac';
  }
  
  // ALS Skills (IV, IO, advanced procedures)
  if (name.includes('iv') || name.includes('intravenous') || name.includes('cannulation') || 
      name.includes('io') || name.includes('intraosseous') || name.includes('thoracentesis') ||
      name.includes('ventilator') || name.includes('jugular') || name.includes('femoral')) {
    return 'als';
  }
  
  // Medical Procedures (default for complex procedures)
  if (name.includes('oxygen') || name.includes('cylinder') || name.includes('tube insertion') ||
      name.includes('obstruction') || name.includes('phonetic') || name.includes('alphabet')) {
    return 'medical';
  }
  
  return 'medical'; // default category
}

// Enhanced difficulty mapping
function mapDifficultyLevel(level: string, skillName: string): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  if (level) {
    switch (level.toUpperCase()) {
      case 'BEGINNER':
        return 'BEGINNER';
      case 'INTERMEDIATE':
        return 'INTERMEDIATE';
      case 'ADVANCED':
        return 'ADVANCED';
    }
  }
  
  // Infer difficulty from skill complexity
  const name = skillName.toLowerCase();
  
  // Advanced skills
  if (name.includes('intubation') || name.includes('cricothyroidotomy') || 
      name.includes('thoracentesis') || name.includes('cardioversion') ||
      name.includes('femoral') || name.includes('jugular') || name.includes('prediction')) {
    return 'ADVANCED';
  }
  
  // Beginner skills
  if (name.includes('hand wash') || name.includes('oxygen') || name.includes('vital') ||
      name.includes('recovery') || name.includes('bandage') || name.includes('phonetic')) {
    return 'BEGINNER';
  }
  
  return 'INTERMEDIATE'; // default
}

// Convert extracted skill steps to our format
function convertExtractedSteps(extractedSteps: any[], skillId: string): SkillStep[] {
  // Check if we have enhanced steps for this skill
  const enhancedSteps = enhancedCriticalSkillSteps[skillId];
  if (enhancedSteps) {
    return enhancedSteps.map((step: any) => ({
      id: step.id,
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description,
      isRequired: step.isRequired,
      keyPoints: step.keyPoints || [],
      timeEstimate: step.timeEstimate || 60,
      isCritical: step.isCritical,
    }));
  }
  
  // Fall back to extracted steps
  if (!extractedSteps || extractedSteps.length === 0) {
    return [];
  }
  
  return extractedSteps.map((step: any) => ({
    id: `${skillId}-step-${step.stepNumber}`,
    stepNumber: step.stepNumber,
    title: step.title || `Step ${step.stepNumber}`,
    description: step.description,
    isRequired: step.isCritical !== false,
    keyPoints: step.keyPoints || [],
    timeEstimate: step.timeEstimate || 60,
    isCritical: step.isCritical !== false,
  }));
}

// Enhanced assessment criteria creation
function createAssessmentCriteria(skill: any, skillId: string): AssessmentCriterion[] {
  const criteria: AssessmentCriterion[] = [];
  
  // Add criteria from objectives
  if (skill.objectives) {
    skill.objectives.slice(0, 3).forEach((objective: string, index: number) => {
      criteria.push({
        id: `${skillId}-criteria-${index + 1}`,
        skillId,
        criterion: objective.length > 60 ? objective.substring(0, 60) + '...' : objective,
        maxPoints: 10,
        isRequired: true,
      });
    });
  }

  // Add safety criteria
  criteria.push({
    id: `${skillId}-criteria-safety`,
    skillId,
    criterion: 'Safety awareness and infection control',
    maxPoints: 15,
    isRequired: true,
  });

  // Add technique criteria
  criteria.push({
    id: `${skillId}-criteria-technique`,
    skillId,
    criterion: 'Proper technique and procedure adherence',
    maxPoints: 15,
    isRequired: true,
  });

  return criteria;
}

// Remove duplicates based on skill name
function removeDuplicates(skills: any[]): any[] {
  const seen = new Set();
  return skills.filter(skill => {
    const name = skill.name.trim().toLowerCase();
    if (seen.has(name)) {
      return false;
    }
    seen.add(name);
    return true;
  });
}

// Find matching skill from extracted skill steps by name similarity
function findMatchingSkillSteps(skillName: string): any[] {
  // Handle the case where extractedSkillSteps is an array
  const skillStepsArray = Array.isArray(extractedSkillSteps) ? extractedSkillSteps : [];
  
  // First try exact match
  const exactMatch = skillStepsArray.find((skill: any) => 
    skill.skillName === skillName
  );
  
  if (exactMatch) {
    return exactMatch.steps || [];
  }
  
  // Try case-insensitive match
  const caseInsensitiveMatch = skillStepsArray.find((skill: any) => 
    skill.skillName.toLowerCase() === skillName.toLowerCase()
  );
  
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch.steps || [];
  }
  
  // Special case mappings for common mismatches
  const specialMappings: { [key: string]: string } = {
    'hgt': 'HAEMO-GLUCO-TEST (HGT)',
    'haemo-gluco-test': 'HAEMO-GLUCO-TEST (HGT)',
    'blood glucose': 'HAEMO-GLUCO-TEST (HGT)',
    'glucose test': 'HAEMO-GLUCO-TEST (HGT)',
  };
  
  const lowerSkillName = skillName.toLowerCase();
  const specialMatch = specialMappings[lowerSkillName];
  if (specialMatch) {
    const specialMatchSkill = skillStepsArray.find((skill: any) => 
      skill.skillName === specialMatch
    );
    if (specialMatchSkill) {
      return specialMatchSkill.steps || [];
    }
  }
  
  // Try partial match with improved algorithm
  const partialMatch = skillStepsArray.find((skill: any) => {
    const name = skill.skillName;
    const nameWords = name.toLowerCase().split(/[\s\-\(\)]+/).filter((w: string) => w.length > 2);
    const skillWords = skillName.toLowerCase().split(/[\s\-\(\)]+/).filter(w => w.length > 2);
    
    // Check for abbreviation matches (like HGT)
    if (skillWords.some(word => word.length <= 3)) {
      const abbrevMatch = nameWords.some((nameWord: string) => 
        skillWords.some(skillWord => 
          nameWord.includes(skillWord) || skillWord.includes(nameWord)
        )
      );
      if (abbrevMatch) return true;
    }
    
    // Check if at least 60% of meaningful words match
    const matchingWords = skillWords.filter(word => 
      nameWords.some((nameWord: string) => 
        nameWord.includes(word) || word.includes(nameWord) ||
        (word.length > 3 && nameWord.length > 3 && 
         (word.substring(0, 4) === nameWord.substring(0, 4)))
      )
    );
    
    return matchingWords.length >= Math.ceil(skillWords.length * 0.6);
  });
  
  if (partialMatch) {
    return partialMatch.steps || [];
  }
  
  return [];
}

// Comprehensive skill matching function to find enhanced critical skills
function findMatchingCriticalSkill(extractedSkillName: string): string | undefined {
  const lowerName = extractedSkillName.toLowerCase().trim();
  
  // Direct mapping for known skill names
  const directMappings: { [key: string]: string } = {
    // Exact matches
    'prediction of difficult bag valve mask ventilations': 'difficult-bag-valve-mask-prediction',
    'adult cpr with manual defibrillator': 'adult-cpr-defibrillator',
    'intravenous cannulation': 'intravenous-cannulation',
    'haemo-gluco-test (hgt)': 'blood-glucose-testing',
    'blood glucose testing': 'blood-glucose-testing',
    'spinal immobilization': 'spinal-immobilization-c-spine',
    'hemorrhage control and shock management': 'hemorrhage-control-shock-management',
    'pediatric assessment and emergency care': 'pediatric-assessment-emergency-care',
    'medication administration and dosage calculation': 'medication-administration-dosage-calculation',
    'obstetric emergency and childbirth': 'obstetric-emergency-childbirth',
    'respiratory distress management': 'respiratory-distress-management',
    'cardiac arrest and resuscitation': 'cardiac-arrest-resuscitation-acls',
    'seizure management and neurological emergencies': 'seizure-management-neurological-emergencies',
    'diabetic emergency management': 'diabetic-emergency-management',
    'anaphylaxis and allergic reaction management': 'anaphylaxis-allergic-reaction-management',
    'stroke assessment and management': 'stroke-assessment-management',
    'psychiatric emergency management': 'psychiatric-emergency-management',
    'fracture and orthopedic injury management': 'fracture-orthopedic-management',
    'poisoning and overdose management': 'poisoning-overdose-management',
    'burns and thermal injury management': 'burns-thermal-injury-management',
    'chest pain and acute coronary syndrome': 'chest-pain-acs-management',
    '12-lead ecg lead placement and acquisition': '12-lead-ecg-placement',
    'continuous positive airway pressure (cpap)': 'cpap-ventilation',
    'basic airway management': 'basic-airway-management',
    'advanced airway management': 'advanced-airway-management',
    'trauma assessment': 'trauma-assessment',
    'needle thoracentesis': 'needle-thoracentesis',
    'intravenous fluid therapy': 'intravenous-fluid-therapy',
    'supraglottic airway management': 'supraglottic-airway-management',
    'femoral vein cannulation': 'femoral-vein-cannulation',
    'double lumen airway insertion': 'double-lumen-airway-insertion',
    'adult endotracheal intubation (ett)': 'endotracheal-intubation',
    'surgical cricothyroidotomy': 'surgical-cricothyroidotomy',
    'synchronized cardioversion': 'synchronized-cardioversion',
    'pediatric cpr with manual defibrillator': 'pediatric-cpr-defibrillator',
    'infant cpr with manual defibrillator': 'infant-cpr-defibrillator',
    'neonatal resuscitation': 'neonatal-resuscitation',
    'external jugular vein cannulation': 'external-jugular-vein-cannulation',
    'use of transport ventilator': 'use-transport-ventilator',
    'umbilical vein cannulation': 'umbilical-vein-cannulation',
    'c-spine clearance': 'c-spine-clearance',
    'ez-io distal tibia insertion': 'ez-io-distal-tibia-insertion',
    'prediction of difficult direct endotracheal intubation': 'prediction-difficult-intubation',
    'management of prolapsed cord': 'management-prolapsed-cord',
    'carotid sinus massage': 'carotid-sinus-massage',
    'laryngeal tube airway': 'laryngeal-tube-airway',
    'normal childbirth - pre-delivery and delivery': 'normal-childbirth-delivery',
    'recovery position': 'recovery-position',
    'upper airway obstruction with equipment': 'upper-airway-obstruction-equipment',
    'immobilization of an injury': 'immobilization-injury',
    'disinfection of minor wounds': 'disinfection-minor-wounds',
    'hand washing': 'hand-washing',
    'orogastric and nasogastric tube insertion': 'orogastric-nasogastric-insertion',
    'bag valve mask reservoir ventilation': 'bag-valve-mask-reservoir-ventilation',
    'patient handover': 'patient-handover',
    'drug administration': 'drug-administration',
    'troubleshooting ventilator alarms': 'troubleshooting-ventilator-alarms',
    '3 lead ecg interpretation': '3-lead-ecg-interpretation',
    'application of bandage/triangular bandage': 'bandage-triangular-application',
    'nebulization of medication': 'nebulization-medication',
    
    // Partial matches and variations
    'difficult bag valve mask': 'difficult-bag-valve-mask-prediction',
    'bag valve mask ventilation': 'difficult-bag-valve-mask-prediction',
    'adult cpr': 'adult-cpr-defibrillator',
    'cpr with defibrillator': 'adult-cpr-defibrillator',
    'iv cannulation': 'intravenous-cannulation',
    'intravenous access': 'intravenous-cannulation',
    'blood glucose': 'blood-glucose-testing',
    'hgt': 'blood-glucose-testing',
    'glucose testing': 'blood-glucose-testing',
    'spinal immobilisation': 'spinal-immobilization-c-spine',
    'c-spine immobilization': 'spinal-immobilization-c-spine',
    'hemorrhage control': 'hemorrhage-control-shock-management',
    'shock management': 'hemorrhage-control-shock-management',
    'pediatric care': 'pediatric-assessment-emergency-care',
    'pediatric emergency': 'pediatric-assessment-emergency-care',
    'medication administration': 'medication-administration-dosage-calculation',
    'drug calculation': 'medication-administration-dosage-calculation',
    'obstetric care': 'obstetric-emergency-childbirth',
    'childbirth': 'obstetric-emergency-childbirth',
    'respiratory distress': 'respiratory-distress-management',
    'cardiac arrest': 'cardiac-arrest-resuscitation-acls',
    'resuscitation': 'cardiac-arrest-resuscitation-acls',
    'seizure management': 'seizure-management-neurological-emergencies',
    'neurological emergency': 'seizure-management-neurological-emergencies',
    'diabetes emergency': 'diabetic-emergency-management',
    'diabetic care': 'diabetic-emergency-management',
    'anaphylaxis': 'anaphylaxis-allergic-reaction-management',
    'allergic reaction': 'anaphylaxis-allergic-reaction-management',
    'stroke assessment': 'stroke-assessment-management',
    'stroke care': 'stroke-assessment-management',
    'psychiatric emergency': 'psychiatric-emergency-management',
    'mental health': 'psychiatric-emergency-management',
    'fracture management': 'fracture-orthopedic-management',
    'orthopedic injury': 'fracture-orthopedic-management',
    'poisoning management': 'poisoning-overdose-management',
    'overdose': 'poisoning-overdose-management',
    'burn management': 'burns-thermal-injury-management',
    'thermal injury': 'burns-thermal-injury-management',
    'chest pain': 'chest-pain-acs-management',
    'acute coronary syndrome': 'chest-pain-acs-management',
    '12 lead ecg': '12-lead-ecg-placement',
    'ecg placement': '12-lead-ecg-placement',
    'cpap': 'cpap-ventilation',
    'positive airway pressure': 'cpap-ventilation',
    'basic airway': 'basic-airway-management',
    'airway management': 'basic-airway-management',
    'advanced airway': 'advanced-airway-management',
    'trauma assessment': 'trauma-assessment',
    'thoracentesis': 'needle-thoracentesis',
    'needle decompression': 'needle-thoracentesis',
    'iv fluid therapy': 'intravenous-fluid-therapy',
    'fluid resuscitation': 'intravenous-fluid-therapy',
    'supraglottic airway': 'supraglottic-airway-management',
    'lma': 'supraglottic-airway-management',
    'femoral access': 'femoral-vein-cannulation',
    'femoral cannulation': 'femoral-vein-cannulation',
    'double lumen': 'double-lumen-airway-insertion',
    'combitube': 'double-lumen-airway-insertion',
    'endotracheal intubation': 'endotracheal-intubation',
    'intubation': 'endotracheal-intubation',
    'cricothyroidotomy': 'surgical-cricothyroidotomy',
    'surgical airway': 'surgical-cricothyroidotomy',
    'cardioversion': 'synchronized-cardioversion',
    'electrical cardioversion': 'synchronized-cardioversion',
    'pediatric cpr': 'pediatric-cpr-defibrillator',
    'pediatric resuscitation': 'pediatric-cpr-defibrillator',
    'infant cpr': 'infant-cpr-defibrillator',
    'infant resuscitation': 'infant-cpr-defibrillator',
    'neonatal care': 'neonatal-resuscitation',
    'newborn resuscitation': 'neonatal-resuscitation',
    'external jugular': 'external-jugular-vein-cannulation',
    'ejvc': 'external-jugular-vein-cannulation',
    'transport ventilator': 'use-transport-ventilator',
    'mechanical ventilation': 'use-transport-ventilator',
    'umbilical access': 'umbilical-vein-cannulation',
    'umbilical cannulation': 'umbilical-vein-cannulation',
    'cervical spine clearance': 'c-spine-clearance',
    'c spine clearance': 'c-spine-clearance',
    'intraosseous': 'ez-io-distal-tibia-insertion',
    'io access': 'ez-io-distal-tibia-insertion',
    'difficult intubation': 'prediction-difficult-intubation',
    'intubation assessment': 'prediction-difficult-intubation',
    'prolapsed cord': 'management-prolapsed-cord',
    'cord prolapse': 'management-prolapsed-cord',
    'carotid massage': 'carotid-sinus-massage',
    'vagal maneuver': 'carotid-sinus-massage',
    'laryngeal tube': 'laryngeal-tube-airway',
    'lta': 'laryngeal-tube-airway',
    'normal delivery': 'normal-childbirth-delivery',
    'vaginal delivery': 'normal-childbirth-delivery',
    'lateral position': 'recovery-position',
    'recovery positioning': 'recovery-position',
    'airway obstruction': 'upper-airway-obstruction-equipment',
    'choking': 'upper-airway-obstruction-equipment',
    'injury immobilization': 'immobilization-injury',
    'splinting': 'immobilization-injury',
    'wound disinfection': 'disinfection-minor-wounds',
    'wound cleaning': 'disinfection-minor-wounds',
    'hand hygiene': 'hand-washing',
    'infection control': 'hand-washing',
    'nasogastric tube': 'orogastric-nasogastric-insertion',
    'ng tube': 'orogastric-nasogastric-insertion',
    'orogastric tube': 'orogastric-nasogastric-insertion',
    'bag valve mask': 'bag-valve-mask-reservoir-ventilation',
    'bvm': 'bag-valve-mask-reservoir-ventilation',
    'handover': 'patient-handover',
    'patient transfer': 'patient-handover',
    'drug admin': 'drug-administration',
    'medication admin': 'drug-administration',
    'ventilator alarm': 'troubleshooting-ventilator-alarms',
    'alarm troubleshooting': 'troubleshooting-ventilator-alarms',
    '3 lead ecg': '3-lead-ecg-interpretation',
    'rhythm interpretation': '3-lead-ecg-interpretation',
    'bandage application': 'bandage-triangular-application',
    'triangular bandage': 'bandage-triangular-application',
    'nebulizer': 'nebulization-medication',
    'bronchodilator': 'nebulization-medication',
  };

  // Check direct mappings first
  if (directMappings[lowerName]) {
    return directMappings[lowerName];
  }

  // Check for partial matches in the direct mapping keys
  for (const [key, value] of Object.entries(directMappings)) {
    if (key.includes(lowerName) || lowerName.includes(key)) {
      return value;
    }
  }

  // Fallback to original matching logic for any unmapped skills
  return Object.keys(criticalSkillsMetadata).find(id => 
    lowerName.includes(criticalSkillsMetadata[id].name.toLowerCase().split(' ')[0]) ||
    criticalSkillsMetadata[id].name.toLowerCase().includes(lowerName.split(' ')[0])
  );
}

// Process all skills data with extracted steps
const uniqueExtractedSkills = removeDuplicates(extractedSkills);

export const allProcessedSkills: Skill[] = uniqueExtractedSkills.map((extractedSkill, index) => {
  const skillId = `skill-${(index + 1).toString().padStart(3, '0')}`;
  const categoryId = mapSkillToCategory(extractedSkill.name);
  
  // Check if this is a critical skill with enhanced data using comprehensive matching
  const criticalSkillId = findMatchingCriticalSkill(extractedSkill.name);
  
  // Find matching steps from extracted skill documents
  const extractedSteps = findMatchingSkillSteps(extractedSkill.name);
  
  let steps: SkillStep[];
  if (criticalSkillId && enhancedCriticalSkillSteps[criticalSkillId]) {
    // Use enhanced critical skill steps
    steps = convertExtractedSteps([], criticalSkillId);
  } else if (extractedSteps.length > 0) {
    // Use extracted steps from skill documents
    steps = convertExtractedSteps(extractedSteps, skillId);
  } else {
    // Fallback to basic steps from objectives if no extracted steps found
    const basicSteps = extractedSkill.objectives || [
      'Prepare equipment and assess patient/situation',
      'Perform the skill according to protocol',
      'Verify successful completion and document'
    ];
    
    steps = basicSteps.map((objective: string, stepIndex: number) => ({
      id: `${skillId}-step-${stepIndex + 1}`,
      stepNumber: stepIndex + 1,
      title: `Step ${stepIndex + 1}`,
      description: objective,
      isRequired: true,
      timeEstimate: 60,
      isCritical: true,
    }));
  }

  const assessmentCriteria = createAssessmentCriteria(extractedSkill, skillId);

  // Use enhanced metadata for critical skills
  const enhancedMetadata = criticalSkillId ? criticalSkillsMetadata[criticalSkillId] : null;
  
  return {
    id: skillId,
    name: enhancedMetadata?.name || extractedSkill.name,
    description: enhancedMetadata ? 
      `${extractedSkill.description || ''} Enhanced with best practice guidelines and current clinical protocols.` :
      extractedSkill.description || `Complete ${extractedSkill.name} procedure according to protocol`,
    categoryId: enhancedMetadata?.category || categoryId,
    isActive: true,
    minimumRequirement: steps.length > 10 ? 5 : 3,
    timeEstimateMinutes: enhancedMetadata?.timeEstimateMinutes || (steps.length * 2),
    difficultyLevel: enhancedMetadata?.difficultyLevel || mapDifficultyLevel(extractedSkill.difficulty_level, extractedSkill.name),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: categories[enhancedMetadata?.category || categoryId],
    steps,
    assessmentCriteria,
    equipment: enhancedMetadata?.equipment || extractedSkill.equipment?.map((eq: any) => typeof eq === 'string' ? eq : eq.item) || [],
    isCritical: enhancedMetadata?.isCritical || extractedSkill.is_critical || false,
    objectives: enhancedMetadata?.objectives || extractedSkill.objectives || [],
    indications: enhancedMetadata?.indications || extractedSkill.indications || [],
    contraindications: enhancedMetadata?.contraindications || extractedSkill.contraindications || [],
    commonErrors: extractedSkill.common_errors || [],
  };
});

// Export all categories
export const skillCategories = Object.values(categories);

// Export skills by category
export function getSkillsByCategory(categoryId?: string): Skill[] {
  if (!categoryId) return allProcessedSkills;
  return allProcessedSkills.filter(skill => skill.categoryId === categoryId);
}

// Export skill by ID
export function getSkillById(skillId: string): Skill | undefined {
  return allProcessedSkills.find(skill => skill.id === skillId);
}

// Export skills count
export const totalSkillsCount = allProcessedSkills.length;

// Export categories with skill counts
export const categoriesWithCounts = skillCategories.map(category => ({
  ...category,
  skillCount: allProcessedSkills.filter(skill => skill.categoryId === category.id).length,
}));

// Calculate total steps across all skills
export const totalStepsCount = allProcessedSkills.reduce((total, skill) => total + skill.steps.length, 0);

console.log(`Loaded ${totalSkillsCount} unique skills with ${totalStepsCount} total steps from skill documents`);
console.log(`Skills with detailed steps: ${allProcessedSkills.filter(skill => skill.steps.length > 5).length}`);

export { allProcessedSkills as processedSkills };