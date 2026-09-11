#!/usr/bin/env tsx
/**
 * Med-ed Curriculum Audit Generator
 * 
 * Analyzes all cases for:
 * 1. Trauma track (category==trauma): 15 cases audit
 * 2. Cohort gating: diploma/1st-4th year availability map
 * 3. Multi-patient/MCI educational value analysis
 * 4. Learning environment optimization (mission board, onboarding)
 * 5. End-to-end clinical learning arc assessment
 * 6. Priority backlog for coding-agent
 */

import { caseDatabase } from '../src/data/cases';
import { enhancedCaseDatabase } from '../src/data/enhancedCases';
import { firstYearCases } from '../src/data/firstYearCases';
import { secondYearCases } from '../src/data/secondYearCases';
import { litflCaseDatabase } from '../src/data/litflCases';

// Import severity variant cases separately - it may be a different structure
try {
  const { severityVariantCases } = await import('../src/data/severityVariantCases');
  // Will merge later if available
} catch (e) {
  console.log('severityVariantCases not directly importable, will check cases.ts for duplicates');
}

const ALL_ENHANCED_CASES = {
  ...caseDatabase,
  ...enhancedCaseDatabase,
  ...firstYearCases || [],
  ...secondYearCases || [],
  ...litflCaseDatabase || []
};

// Remove duplicates by id
const uniqueCasesMap = new Map<string, any>();
let processedCount = 0;

Object.values(ALL_ENHANCED_CASES).forEach((caseData: any) => {
  if (uniqueCasesMap.has(caseData.id)) {
    console.warn(`⚠️ Duplicate case ID: ${caseData.id} (${caseData.title}) - skipping`);
  } else {
    uniqueCasesMap.set(caseData.id, caseData);
    processedCount++;
  }
});

// Export merged case database with id tracking
export const MERGED_CASES = Object.values(uniqueCasesMap) as any[];

console.log(`✅ Loaded ${processedCount} unique cases from all sources (debuplicated)`);

// === AUDIT DELIVERABLE 1: Trauma Track Analysis ===
const TRAUMA_CASES = MERGED_CASES.filter(c => c.category === 'trauma');
console.log(`📊 Found ${TRAUMA_CASES.length} trauma cases in database`);

TRAUMA_CASES.sort((a, b) => a.id.localeCompare(b.id));

TRAUMA_CASES.forEach((caseData: any) => {
  const auditEntry = {
    id: caseData.id,
    title: caseData.title,
    category: caseData.category,
    subcategory: caseData.subcategory || 'N/A',
    yearLevels: Array.isArray(caseData.yearLevels) ? caseData.yearLevels : [caseData.yearLevels || 'unknown'],
    
    // Educational adequacy assessment
    learningObjectiveFit: assessLearningObjectiveFit(caseData),
    realismAdequacy: assessRealism(caseData),
    
    // Component-specific analysis
    sceneAssessment: analyzeScene(caseData),
    woundDecalAnalysis: caseData.scenario?.woundDecals && analyzeScenarioWounds(TRAUMA_CASES.filter(c => c.id === caseData.id)),
    treatmentBreadth: analyzeTreatments(caseData),
    
    // Gap identification
    gaps: identifyGaps(caseData)
  };

  console.log(`  - ${caseData.title}: yearLevels=${Array.isArray(caseData.yearLevels) ? caseData.yearLevels.join(', ') : caseData.yearLevels}`);
});

