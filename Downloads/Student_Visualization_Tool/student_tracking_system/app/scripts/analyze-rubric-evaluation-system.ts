import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RubricCriteria {
  name: string;
  description?: string;
  maxScore?: number;
  maxPoints?: number;
  weight?: number;
  levels?: any[];
}

interface RubricStructure {
  criteria?: RubricCriteria[];
  categories?: RubricCriteria[];
  totalMaxScore?: number;
}

async function analyzeRubricEvaluationSystem() {
  console.log('🔍 RUBRIC & EVALUATION SYSTEM ANALYSIS');
  console.log('=' .repeat(80));

  try {
    // 1. Get all assignments with their rubrics and submissions
    const assignments = await prisma.assignment.findMany({
      include: {
        rubrics: {
          where: { isActive: true },
          orderBy: { version: 'desc' }
        },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                fullName: true
              }
            },
            evaluations: {
              include: {
                rubric: true
              }
            }
          }
        },
        module: true
      }
    });

    console.log(`\n📚 Total Assignments: ${assignments.length}\n`);

    let totalSubmissions = 0;
    let evaluatedSubmissions = 0;
    let unevaluatedSubmissions = 0;
    let zeroScoreEvaluations = 0;
    let failedEvaluations = 0;
    const rubricIssues: any[] = [];
    const submissionsToEvaluate: any[] = [];

    for (const assignment of assignments) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📝 Assignment: ${assignment.title}`);
      console.log(`   Module: ${assignment.module?.code} - ${assignment.module?.name}`);
      console.log(`   Type: ${assignment.type}`);
      console.log(`   Due: ${assignment.dueDate?.toLocaleDateString() || 'N/A'}`);

      // Analyze rubrics
      console.log(`\n   📋 Rubrics (${assignment.rubrics.length}):`);
      
      if (assignment.rubrics.length === 0) {
        console.log(`   ⚠️  WARNING: No rubrics found for this assignment!`);
        rubricIssues.push({
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          issue: 'No rubrics'
        });
      }

      for (const rubric of assignment.rubrics) {
        const rubricData = rubric.criteria as RubricStructure;

        // Handle three rubric structures:
        // 1. Direct array: [{ name, maxScore, ... }]
        // 2. Object with criteria: { criteria: [...] }
        // 3. Object with categories: { categories: [...] }
        const criteriaArray = Array.isArray(rubricData)
          ? rubricData
          : (rubricData.criteria || rubricData.categories || []);

        // Calculate max score
        let maxScore = 0;
        if (criteriaArray.length > 0) {
          maxScore = criteriaArray.reduce((sum: number, c: any) => {
            return sum + (c.maxScore || c.maxPoints || c.weight || 0);
          }, 0);
        }

        console.log(`\n   ├─ Rubric: ${rubric.title} (v${rubric.version})`);
        console.log(`   │  Active: ${rubric.isActive ? '✅' : '❌'}`);
        console.log(`   │  Criteria Count: ${criteriaArray.length}`);
        console.log(`   │  Calculated Max Score: ${maxScore}`);
        console.log(`   │  Has Extracted Text: ${rubric.extractedText ? 'Yes' : 'No'}`);
        console.log(`   │  File: ${rubric.fileName || 'N/A'}`);

        // Check for rubric structure issues
        if (criteriaArray.length === 0) {
          console.log(`   │  ⚠️  WARNING: No criteria found in rubric!`);
          rubricIssues.push({
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
            rubricId: rubric.id,
            rubricTitle: rubric.title,
            issue: 'No criteria in rubric'
          });
        }

        if (maxScore === 0) {
          console.log(`   │  ⚠️  WARNING: Max score is 0!`);
          rubricIssues.push({
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
            rubricId: rubric.id,
            rubricTitle: rubric.title,
            issue: 'Max score is 0'
          });
        }

        // Show criteria structure
        console.log(`   │  Criteria Structure:`);
        criteriaArray.forEach((criterion: any, idx: number) => {
          const score = criterion.maxScore || criterion.maxPoints || criterion.weight || 0;
          console.log(`   │    ${idx + 1}. ${criterion.name}: ${score} points`);
        });
      }

      // Analyze submissions
      console.log(`\n   📤 Submissions (${assignment.submissions.length}):`);
      totalSubmissions += assignment.submissions.length;

      for (const submission of assignment.submissions) {
        const hasEvaluation = submission.evaluations.length > 0;
        const latestEvaluation = submission.evaluations[0];

        if (hasEvaluation) {
          evaluatedSubmissions++;
          
          if (latestEvaluation.totalScore === 0) {
            zeroScoreEvaluations++;
            console.log(`\n   ├─ ⚠️  ${submission.student.fullName} (${submission.student.studentId})`);
            console.log(`   │  Status: ${submission.status}`);
            console.log(`   │  Score: ${latestEvaluation.totalScore}/${latestEvaluation.maxScore} (${latestEvaluation.percentage.toFixed(1)}%)`);
            console.log(`   │  ⚠️  ZERO SCORE - Possible Issues:`);
            console.log(`   │     - Extracted Text Length: ${submission.extractedText?.length || 0} chars`);
            console.log(`   │     - Feedback: ${latestEvaluation.feedback.substring(0, 100)}...`);
            
            if (latestEvaluation.feedback.includes('failed') || latestEvaluation.feedback.includes('error')) {
              failedEvaluations++;
              console.log(`   │     - ❌ EVALUATION FAILED`);
            }
          } else {
            console.log(`   ├─ ✅ ${submission.student.fullName}: ${latestEvaluation.totalScore}/${latestEvaluation.maxScore} (${latestEvaluation.percentage.toFixed(1)}%)`);
          }
        } else {
          unevaluatedSubmissions++;
          console.log(`   ├─ ⏳ ${submission.student.fullName} (${submission.student.studentId})`);
          console.log(`   │  Status: ${submission.status}`);
          console.log(`   │  NOT EVALUATED YET`);
          console.log(`   │  Extracted Text Length: ${submission.extractedText?.length || 0} chars`);
          console.log(`   │  Has File: ${submission.fileName ? 'Yes' : 'No'}`);
          
          // Add to list of submissions to evaluate
          if (assignment.rubrics.length > 0 && submission.extractedText && submission.extractedText.length > 50) {
            submissionsToEvaluate.push({
              submissionId: submission.id,
              assignmentId: assignment.id,
              assignmentTitle: assignment.title,
              studentName: submission.student.fullName,
              studentId: submission.student.studentId,
              rubricId: assignment.rubrics[0].id,
              textLength: submission.extractedText.length
            });
          }
        }
      }
    }

    // Summary Report
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('📊 SUMMARY REPORT');
    console.log('='.repeat(80));
    console.log(`\n📈 Submission Statistics:`);
    console.log(`   Total Submissions: ${totalSubmissions}`);
    console.log(`   Evaluated: ${evaluatedSubmissions} (${((evaluatedSubmissions/totalSubmissions)*100).toFixed(1)}%)`);
    console.log(`   Unevaluated: ${unevaluatedSubmissions} (${((unevaluatedSubmissions/totalSubmissions)*100).toFixed(1)}%)`);
    console.log(`   Zero Score Evaluations: ${zeroScoreEvaluations}`);
    console.log(`   Failed Evaluations: ${failedEvaluations}`);

    console.log(`\n⚠️  Rubric Issues Found: ${rubricIssues.length}`);
    if (rubricIssues.length > 0) {
      rubricIssues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue.assignmentTitle}: ${issue.issue}`);
      });
    }

    console.log(`\n📝 Submissions Ready to Evaluate: ${submissionsToEvaluate.length}`);
    if (submissionsToEvaluate.length > 0) {
      console.log(`\n   Submissions that can be auto-evaluated:`);
      submissionsToEvaluate.forEach((sub, idx) => {
        console.log(`   ${idx + 1}. ${sub.studentName} - ${sub.assignmentTitle} (${sub.textLength} chars)`);
      });
    }

    // Save results to file for automation
    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSubmissions,
        evaluatedSubmissions,
        unevaluatedSubmissions,
        zeroScoreEvaluations,
        failedEvaluations
      },
      rubricIssues,
      submissionsToEvaluate
    };

    const fs = require('fs');
    fs.writeFileSync(
      'rubric-analysis-results.json',
      JSON.stringify(results, null, 2)
    );

    console.log(`\n✅ Analysis complete! Results saved to rubric-analysis-results.json`);
    console.log(`\n💡 Next Steps:`);
    console.log(`   1. Review rubric issues and fix any with 0 max score`);
    console.log(`   2. Run automated evaluation on ${submissionsToEvaluate.length} unevaluated submissions`);
    console.log(`   3. Re-evaluate ${zeroScoreEvaluations} submissions with zero scores`);

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeRubricEvaluationSystem().catch(console.error);

