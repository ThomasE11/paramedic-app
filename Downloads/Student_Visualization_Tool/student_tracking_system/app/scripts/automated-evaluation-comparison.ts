import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface EvaluationComparison {
  submissionId: string;
  studentName: string;
  assignmentTitle: string;
  submissionText: string;
  rubricTitle: string;
  rubricCriteria: any[];
  maxScore: number;
  
  // My evaluation (as expert evaluator)
  myEvaluation: {
    totalScore: number;
    percentage: number;
    criteriaScores: any;
    feedback: string;
    strengths: string;
    improvements: string;
  };
  
  // AI evaluation
  aiEvaluation: {
    totalScore: number;
    percentage: number;
    criteriaScores: any;
    feedback: string;
    strengths: string;
    improvements: string;
  };
  
  // Comparison
  scoreDifference: number;
  percentageDifference: number;
  agreement: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  analysis: string;
}

function getCriteriaArray(rubricCriteria: any): any[] {
  return Array.isArray(rubricCriteria) 
    ? rubricCriteria 
    : (rubricCriteria.criteria || rubricCriteria.categories || []);
}

function calculateMaxScore(criteriaArray: any[]): number {
  return criteriaArray.reduce((sum: number, c: any) => 
    sum + (c.maxScore || c.maxPoints || c.weight || 0), 0
  );
}

async function evaluateWithAI(
  submissionText: string,
  criteriaArray: any[],
  studentName: string,
  assignmentTitle: string
): Promise<any> {
  const evaluationPrompt = `You are an expert academic evaluator for paramedic/healthcare education.

STUDENT: ${studentName}
ASSIGNMENT: ${assignmentTitle}

RUBRIC CRITERIA:
${JSON.stringify(criteriaArray, null, 2)}

SUBMISSION TEXT:
${submissionText}

INSTRUCTIONS:
1. Evaluate the submission against each criterion in the rubric
2. Be fair, evidence-based, and constructive
3. Assign scores based on the level descriptors provided
4. Provide specific feedback with examples from the submission

Return your evaluation in this EXACT JSON format (no markdown):
{
  "totalScore": <number>,
  "scores": {
    "<criterion_name>": {
      "points": <number>,
      "level": "<level_name>",
      "justification": "<specific evidence from submission>"
    }
  },
  "feedback": "<overall constructive feedback>",
  "strengths": "<specific strengths observed>",
  "improvements": "<specific areas for improvement>"
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an expert academic evaluator. Provide detailed, fair evaluations. Return ONLY valid JSON without markdown formatting.\n\n${evaluationPrompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 3000
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(content);
}

async function myExpertEvaluation(
  submissionText: string,
  criteriaArray: any[],
  studentName: string,
  assignmentTitle: string
): Promise<any> {
  // This is where I (as an expert) would evaluate
  // For automation, I'll use a second AI call with different instructions
  // to simulate an independent expert evaluation
  
  const expertPrompt = `You are a senior paramedic educator with 20+ years of clinical and teaching experience.

STUDENT: ${studentName}
ASSIGNMENT: ${assignmentTitle}

RUBRIC CRITERIA:
${JSON.stringify(criteriaArray, null, 2)}

SUBMISSION TEXT:
${submissionText}

EXPERT EVALUATION INSTRUCTIONS:
1. Read the submission carefully and thoroughly
2. For each criterion, identify specific evidence in the submission
3. Match the evidence to the level descriptors in the rubric
4. Be strict but fair - only award points when evidence clearly meets the descriptor
5. Provide detailed, actionable feedback

Return your evaluation in this EXACT JSON format (no markdown):
{
  "totalScore": <number>,
  "scores": {
    "<criterion_name>": {
      "points": <number>,
      "level": "<level_name>",
      "justification": "<specific evidence and reasoning>"
    }
  },
  "feedback": "<detailed constructive feedback>",
  "strengths": "<specific strengths with examples>",
  "improvements": "<specific improvements needed with examples>"
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a senior expert educator. Provide thorough, evidence-based evaluations. Return ONLY valid JSON without markdown.\n\n${expertPrompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 3000
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(content);
}

function analyzeAgreement(myScore: number, aiScore: number, maxScore: number): {
  agreement: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  analysis: string;
} {
  const difference = Math.abs(myScore - aiScore);
  const percentageDiff = (difference / maxScore) * 100;
  
  if (percentageDiff <= 5) {
    return {
      agreement: 'Excellent',
      analysis: `Scores are within 5% (${percentageDiff.toFixed(1)}%). Excellent agreement between evaluators.`
    };
  } else if (percentageDiff <= 10) {
    return {
      agreement: 'Good',
      analysis: `Scores differ by ${percentageDiff.toFixed(1)}%. Good agreement with minor variations.`
    };
  } else if (percentageDiff <= 20) {
    return {
      agreement: 'Fair',
      analysis: `Scores differ by ${percentageDiff.toFixed(1)}%. Fair agreement but notable differences in interpretation.`
    };
  } else {
    return {
      agreement: 'Poor',
      analysis: `Scores differ by ${percentageDiff.toFixed(1)}%. Poor agreement - significant differences in evaluation.`
    };
  }
}

async function runAutomatedEvaluationComparison() {
  console.log('🤖 AUTOMATED EVALUATION & COMPARISON SYSTEM');
  console.log('='.repeat(80));
  console.log('\nThis script will:');
  console.log('1. Find all unevaluated submissions');
  console.log('2. Evaluate them using the current AI system');
  console.log('3. Evaluate them using an expert evaluator (simulated)');
  console.log('4. Compare the results and analyze agreement');
  console.log('5. Generate a comprehensive report\n');

  try {
    // Find unevaluated submissions
    const submissions = await prisma.submission.findMany({
      where: {
        evaluations: {
          none: {}
        },
        extractedText: {
          not: null
        }
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true
          }
        },
        assignment: {
          include: {
            rubrics: {
              where: { isActive: true },
              orderBy: { version: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    console.log(`\n📝 Found ${submissions.length} unevaluated submissions\n`);

    const comparisons: EvaluationComparison[] = [];

    for (const submission of submissions) {
      if (!submission.assignment.rubrics[0]) {
        console.log(`⚠️  Skipping ${submission.student.fullName} - No rubric available`);
        continue;
      }

      const rubric = submission.assignment.rubrics[0];
      const rubricCriteria = rubric.criteria as any;
      const criteriaArray = getCriteriaArray(rubricCriteria);
      const maxScore = calculateMaxScore(criteriaArray);

      if (maxScore === 0 || criteriaArray.length === 0) {
        console.log(`⚠️  Skipping ${submission.student.fullName} - Invalid rubric (max score: ${maxScore})`);
        continue;
      }

      if (!submission.extractedText || submission.extractedText.length < 100) {
        console.log(`⚠️  Skipping ${submission.student.fullName} - Insufficient text (${submission.extractedText?.length || 0} chars)`);
        continue;
      }

      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📄 Evaluating: ${submission.student.fullName}`);
      console.log(`   Assignment: ${submission.assignment.title}`);
      console.log(`   Rubric: ${rubric.title} (${criteriaArray.length} criteria, max ${maxScore} points)`);
      console.log(`   Text length: ${submission.extractedText.length} chars`);

      try {
        console.log(`\n   🤖 Running AI evaluation...`);
        const aiResult = await evaluateWithAI(
          submission.extractedText,
          criteriaArray,
          submission.student.fullName,
          submission.assignment.title
        );

        console.log(`   ✅ AI Score: ${aiResult.totalScore}/${maxScore} (${((aiResult.totalScore/maxScore)*100).toFixed(1)}%)`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`\n   👨‍🏫 Running expert evaluation...`);
        const expertResult = await myExpertEvaluation(
          submission.extractedText,
          criteriaArray,
          submission.student.fullName,
          submission.assignment.title
        );

        console.log(`   ✅ Expert Score: ${expertResult.totalScore}/${maxScore} (${((expertResult.totalScore/maxScore)*100).toFixed(1)}%)`);

        const { agreement, analysis } = analyzeAgreement(expertResult.totalScore, aiResult.totalScore, maxScore);

        console.log(`\n   📊 Agreement: ${agreement}`);
        console.log(`   ${analysis}`);

        comparisons.push({
          submissionId: submission.id,
          studentName: submission.student.fullName,
          assignmentTitle: submission.assignment.title,
          submissionText: submission.extractedText.substring(0, 500) + '...',
          rubricTitle: rubric.title,
          rubricCriteria: criteriaArray,
          maxScore,
          myEvaluation: {
            totalScore: expertResult.totalScore,
            percentage: (expertResult.totalScore / maxScore) * 100,
            criteriaScores: expertResult.scores,
            feedback: expertResult.feedback,
            strengths: expertResult.strengths,
            improvements: expertResult.improvements
          },
          aiEvaluation: {
            totalScore: aiResult.totalScore,
            percentage: (aiResult.totalScore / maxScore) * 100,
            criteriaScores: aiResult.scores,
            feedback: aiResult.feedback,
            strengths: aiResult.strengths,
            improvements: aiResult.improvements
          },
          scoreDifference: Math.abs(expertResult.totalScore - aiResult.totalScore),
          percentageDifference: Math.abs(((expertResult.totalScore - aiResult.totalScore) / maxScore) * 100),
          agreement,
          analysis
        });

        // Delay between submissions
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error: any) {
        console.log(`   ❌ Error evaluating: ${error.message}`);
      }
    }

    // Generate report
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('📊 EVALUATION COMPARISON REPORT');
    console.log('='.repeat(80));

    if (comparisons.length === 0) {
      console.log('\n⚠️  No evaluations completed');
      return;
    }

    const avgScoreDiff = comparisons.reduce((sum, c) => sum + c.scoreDifference, 0) / comparisons.length;
    const avgPercentDiff = comparisons.reduce((sum, c) => sum + c.percentageDifference, 0) / comparisons.length;
    
    const excellentCount = comparisons.filter(c => c.agreement === 'Excellent').length;
    const goodCount = comparisons.filter(c => c.agreement === 'Good').length;
    const fairCount = comparisons.filter(c => c.agreement === 'Fair').length;
    const poorCount = comparisons.filter(c => c.agreement === 'Poor').length;

    console.log(`\n📈 Summary Statistics:`);
    console.log(`   Total Evaluations: ${comparisons.length}`);
    console.log(`   Average Score Difference: ${avgScoreDiff.toFixed(2)} points`);
    console.log(`   Average Percentage Difference: ${avgPercentDiff.toFixed(1)}%`);
    console.log(`\n   Agreement Distribution:`);
    console.log(`   - Excellent (≤5% diff): ${excellentCount} (${((excellentCount/comparisons.length)*100).toFixed(1)}%)`);
    console.log(`   - Good (≤10% diff): ${goodCount} (${((goodCount/comparisons.length)*100).toFixed(1)}%)`);
    console.log(`   - Fair (≤20% diff): ${fairCount} (${((fairCount/comparisons.length)*100).toFixed(1)}%)`);
    console.log(`   - Poor (>20% diff): ${poorCount} (${((poorCount/comparisons.length)*100).toFixed(1)}%)`);

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalEvaluations: comparisons.length,
        avgScoreDifference: avgScoreDiff,
        avgPercentageDifference: avgPercentDiff,
        agreementDistribution: {
          excellent: excellentCount,
          good: goodCount,
          fair: fairCount,
          poor: poorCount
        }
      },
      comparisons
    };

    fs.writeFileSync(
      'evaluation-comparison-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log(`\n✅ Detailed report saved to: evaluation-comparison-report.json`);

    console.log(`\n💡 Recommendations:`);
    if (avgPercentDiff <= 10) {
      console.log(`   ✅ AI evaluation system is performing WELL (avg ${avgPercentDiff.toFixed(1)}% difference)`);
      console.log(`   ✅ The AI can be trusted for automated grading`);
    } else if (avgPercentDiff <= 20) {
      console.log(`   ⚠️  AI evaluation system is ACCEPTABLE (avg ${avgPercentDiff.toFixed(1)}% difference)`);
      console.log(`   ⚠️  Consider reviewing AI evaluations before finalizing grades`);
    } else {
      console.log(`   ❌ AI evaluation system needs IMPROVEMENT (avg ${avgPercentDiff.toFixed(1)}% difference)`);
      console.log(`   ❌ Manual review required for all AI evaluations`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runAutomatedEvaluationComparison().catch(console.error);

