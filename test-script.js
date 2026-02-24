/**
 * Test script for patient simulator treatment effects
 * Run this in browser console at http://localhost:5173/
 */

// Test the treatment effects module
async function testTreatmentEffects() {
  console.log('=== Testing Patient Simulator Treatment Effects ===\n');
  
  // Test 1: Check if module loads
  try {
    const module = await import('/src/data/treatmentEffects.ts');
    console.log('✓ Treatment effects module loaded');
    console.log('  - applyTreatmentEffectEnhanced:', typeof module.applyTreatmentEffectEnhanced);
    console.log('  - ensureCompleteVitals:', typeof module.ensureCompleteVitals);
    console.log('  - getCaseType:', typeof module.getCaseType);
  } catch (e) {
    console.error('✗ Failed to load treatment effects module:', e);
  }
  
  // Test 2: Check React app state
  console.log('\n=== Checking React App State ===');
  
  // Check if app is mounted
  const root = document.getElementById('root');
  if (root) {
    console.log('✓ React app mounted');
    console.log('  - Root element found:', root.tagName);
    console.log('  - Child elements:', root.children.length);
  } else {
    console.error('✗ React app not mounted - no #root element');
  }
  
  // Test 3: Check for checklist UI
  console.log('\n=== Checking Checklist UI ===');
  const checklistCards = document.querySelectorAll('[class*="checklist"], [class*="Checklist"]');
  console.log(`  - Found ${checklistCards.length} checklist-related elements`);
  
  const checkboxLabels = document.querySelectorAll('label');
  console.log(`  - Found ${checkboxLabels.length} label elements (potential checklist items)`);
  
  // Test 4: Check for vital signs display
  console.log('\n=== Checking Vital Signs Display ===');
  const vitalElements = document.querySelectorAll('[class*="vital"], [class*="Vital"]');
  console.log(`  - Found ${vitalElements.length} vital signs elements`);
  
  // Test 5: Check console for errors
  console.log('\n=== Console Error Check ===');
  console.log('  - Check browser console for any red error messages');
  console.log('  - Look for TypeScript or runtime errors');
  
  console.log('\n=== Test Complete ===');
  console.log('If you see ✓ marks above, the core functionality is working.');
  console.log('If you see ✗ marks, there may be issues to fix.');
}

// Run the test
testTreatmentEffects();

// Also expose a function to test specific treatments
window.testTreatment = function(treatmentName, caseCategory) {
  console.log(`\nTesting treatment: ${treatmentName} on ${caseCategory} case`);
  
  // Find checklist items
  const labels = document.querySelectorAll('label');
  let found = false;
  
  labels.forEach(label => {
    const text = label.textContent?.toLowerCase() || '';
    if (text.includes(treatmentName.toLowerCase())) {
      console.log(`  Found: ${label.textContent?.substring(0, 50)}...`);
      found = true;
      
      // Try to click the checkbox
      const checkbox = label.querySelector('input[type="checkbox"]');
      if (checkbox) {
        console.log('  Clicking checkbox...');
        checkbox.click();
      }
    }
  });
  
  if (!found) {
    console.log('  ✗ Treatment not found in checklist');
  }
};

console.log('Test script loaded. Run testTreatmentEffects() to test.');
console.log('Or use window.testTreatment("oxygen", "respiratory") to test specific treatments.');
