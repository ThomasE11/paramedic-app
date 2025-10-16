import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectRubricData() {
  console.log('🔍 INSPECTING RUBRIC DATA STRUCTURES\n');
  console.log('='.repeat(80));

  try {
    // Get all rubrics
    const rubrics = await prisma.rubric.findMany({
      include: {
        assignment: {
          include: {
            module: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\nFound ${rubrics.length} rubrics in database\n`);

    for (const rubric of rubrics) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📋 Rubric: ${rubric.title}`);
      console.log(`   ID: ${rubric.id}`);
      console.log(`   Assignment: ${rubric.assignment.title}`);
      console.log(`   Module: ${rubric.assignment.module?.code}`);
      console.log(`   Version: ${rubric.version}`);
      console.log(`   Active: ${rubric.isActive}`);
      console.log(`   File: ${rubric.fileName || 'N/A'}`);
      console.log(`   File Path: ${rubric.filePath || 'N/A'}`);
      console.log(`   Has Extracted Text: ${rubric.extractedText ? 'Yes' : 'No'}`);
      
      if (rubric.extractedText) {
        console.log(`   Extracted Text Length: ${rubric.extractedText.length} chars`);
        console.log(`   Extracted Text Preview (first 500 chars):`);
        console.log(`   ${'-'.repeat(76)}`);
        console.log(`   ${rubric.extractedText.substring(0, 500)}`);
        console.log(`   ${'-'.repeat(76)}`);
      }

      console.log(`\n   📊 Criteria JSON Structure:`);
      console.log(`   ${'-'.repeat(76)}`);
      
      try {
        const criteriaJson = JSON.stringify(rubric.criteria, null, 2);
        console.log(criteriaJson);
        
        // Analyze the structure
        const criteria = rubric.criteria as any;
        console.log(`\n   Analysis:`);
        console.log(`   - Type: ${typeof criteria}`);
        console.log(`   - Is Array: ${Array.isArray(criteria)}`);
        console.log(`   - Keys: ${Object.keys(criteria).join(', ')}`);
        
        if (criteria.criteria) {
          console.log(`   - Has 'criteria' property: Yes (${criteria.criteria.length} items)`);
        }
        if (criteria.categories) {
          console.log(`   - Has 'categories' property: Yes (${criteria.categories.length} items)`);
        }
        
        // Calculate max score
        const criteriaArray = criteria.criteria || criteria.categories || [];
        if (criteriaArray.length > 0) {
          const maxScore = criteriaArray.reduce((sum: number, c: any) => {
            return sum + (c.maxScore || c.maxPoints || c.weight || 0);
          }, 0);
          console.log(`   - Calculated Max Score: ${maxScore}`);
        } else {
          console.log(`   - ⚠️  No criteria array found!`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error parsing criteria JSON: ${error}`);
      }
    }

    // Now let's look at the PCR Assessment Rubric specifically (the one that works)
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('🎯 FOCUSING ON WORKING RUBRIC: PCR Assessment Rubric');
    console.log('='.repeat(80));

    const pcrRubric = rubrics.find(r => r.title.includes('PCR Assessment'));
    if (pcrRubric) {
      console.log(`\n✅ Found PCR Assessment Rubric`);
      console.log(`\nFull Criteria Structure:`);
      console.log(JSON.stringify(pcrRubric.criteria, null, 2));
      
      const criteria = pcrRubric.criteria as any;
      const criteriaArray = criteria.criteria || criteria.categories || [];
      
      console.log(`\n\nDetailed Breakdown:`);
      criteriaArray.forEach((c: any, idx: number) => {
        console.log(`\n${idx + 1}. ${c.name}`);
        console.log(`   Max Score: ${c.maxScore || c.maxPoints || c.weight || 0}`);
        console.log(`   Description: ${c.description || 'N/A'}`);
        if (c.levels && c.levels.length > 0) {
          console.log(`   Levels:`);
          c.levels.forEach((level: any) => {
            console.log(`     - ${level.level}: ${level.score} pts - ${level.descriptor?.substring(0, 100) || 'N/A'}`);
          });
        }
      });
    }

    // Check the broken rubrics
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('❌ EXAMINING BROKEN RUBRICS (0 criteria)');
    console.log('='.repeat(80));

    const brokenRubrics = rubrics.filter(r => {
      const criteria = r.criteria as any;
      const criteriaArray = criteria.criteria || criteria.categories || [];
      return criteriaArray.length === 0;
    });

    console.log(`\nFound ${brokenRubrics.length} broken rubrics\n`);

    for (const rubric of brokenRubrics) {
      console.log(`\n📋 ${rubric.title}`);
      console.log(`   Assignment: ${rubric.assignment.title}`);
      console.log(`   File: ${rubric.fileName || 'N/A'}`);
      console.log(`   Criteria JSON:`);
      console.log(JSON.stringify(rubric.criteria, null, 2));
      
      if (rubric.extractedText) {
        console.log(`\n   Extracted Text (first 1000 chars):`);
        console.log(`   ${'-'.repeat(76)}`);
        console.log(rubric.extractedText.substring(0, 1000));
        console.log(`   ${'-'.repeat(76)}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectRubricData().catch(console.error);

