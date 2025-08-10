// Test CPAP skill mapping
const fs = require('fs');

// Read the extracted skills data
const extractedSkills = JSON.parse(fs.readFileSync('./data/extracted_paramedic_skills.json', 'utf8'));

// Find CPAP skill
const coapSkill = extractedSkills.find(skill => skill.name.toLowerCase() === 'cpap');
console.log('Found CPAP skill:', coapSkill ? coapSkill.name : 'NOT FOUND');

// Test the mapping logic from comprehensive-skills-updated.ts
function findMatchingCriticalSkill(extractedSkillName) {
  const lowerName = extractedSkillName.toLowerCase().trim();
  
  const directMappings = {
    'continuous positive airway pressure (cpap)': 'cpap-ventilation',
    'cpap': 'cpap-ventilation',
    'positive airway pressure': 'cpap-ventilation',
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

  return undefined;
}

const result = findMatchingCriticalSkill('CPAP');
console.log('Mapping result for "CPAP":', result);

const result2 = findMatchingCriticalSkill('cpap');
console.log('Mapping result for "cpap":', result2);