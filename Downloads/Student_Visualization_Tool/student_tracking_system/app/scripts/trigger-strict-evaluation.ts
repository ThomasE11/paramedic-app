import { prisma } from '../lib/db';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

async function triggerStrictEvaluation() {
  try {
    // Find submission
    const submission = await prisma.submission.findFirst({
      where: {
        fileName: { contains: 'PCRNo.1', mode: 'insensitive' }
      },
      include: {
        assignment: {
          include: {
            module: true
          }
        },
        student: {
          include: {
            submissions: {
              include: {
                evaluations: true
              },
              orderBy: { submittedAt: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    if (!submission) {
      console.log('Submission not found');
      return;
    }

    // Find rubric
    const rubric = await prisma.rubric.findFirst({
      where: {
        title: { contains: 'PCR Assessment', mode: 'insensitive' }
      }
    });

    if (!rubric) {
      console.log('Rubric not found');
      return;
    }

    console.log('='.repeat(80));
    console.log('STRICT PCR EVALUATION');
    console.log('='.repeat(80));
    console.log('Student:', submission.student.fullName);
    console.log('Assignment:', submission.assignment.title);
    console.log('Rubric:', rubric.title);
    console.log('\nStarting evaluation with STRICT criteria...\n');

    const rubricCriteria = rubric.criteria as any;
    const criteriaArray = rubricCriteria.criteria || rubricCriteria.categories || [];
    const studentHistory = submission.student.submissions
      .filter(s => s.id !== submission.id)
      .map(s => ({
        assignment: s.assignment,
        evaluations: s.evaluations
      }));

    const evaluationPrompt = `
You are an expert academic evaluator for ${submission.assignment.module?.name} (${submission.assignment.module?.code}).
You will evaluate a student's ${submission.assignment.type} submission against the provided rubric.

STUDENT CONTEXT:
- Name: ${submission.student.fullName}
- Student ID: ${submission.student.studentId}
- Module: ${submission.assignment.module?.name}
- Assignment: ${submission.assignment.title}

RUBRIC CRITERIA:
${JSON.stringify(criteriaArray, null, 2)}

SUBMISSION CONTENT:
${submission.extractedText || 'No text content available'}

CRITICAL EVALUATION INSTRUCTIONS:
You must be STRICT and LITERAL in applying the rubric. Do NOT make assumptions or be generous.

1. LITERAL INTERPRETATION: Each rubric criterion lists specific required elements
   - ALL elements must be explicitly present in the submission to award full marks
   - DO NOT assume elements are "implied" - they must be explicitly documented
   - DO NOT give credit for partial or implied completion

2. EVIDENCE-BASED SCORING:
   - Quote specific text from the submission to justify scores
   - If an element is not explicitly documented, it is MISSING
   - Count missing/incomplete elements accurately

3. LEVEL SELECTION:
   - Read each level's description carefully
   - Match the submission to the MOST ACCURATE level (not the highest possible)
   - Best Practice (highest score) requires ALL elements complete and excellent
   - If ANY required element is missing, incomplete, or poor quality → lower level

4. SPECIFIC RUBRIC REQUIREMENTS:
   For PCR/Skill Assessments:
   - "998 call details/code" means explicit call code must be documented (e.g., "Code 3 Cardiac")
   - "Annotated silhouette" requires a visual body diagram with markings (not just text description)
   - "Body systems review" requires systematic documentation of multiple systems (CVS, Resp, Neuro, etc.)
   - "Rationale for treatments" means explicit explanation for decisions (not just listing interventions)
   - "Reassessment" requires documented post-intervention changes with specific values

5. QUALITY STANDARDS:
   - Identify strengths and areas for improvement objectively
   - Suggest specific, actionable improvements
   - Be constructive but rigorous

6. CONFIDENCE RATING:
   - Rate your confidence in the evaluation (0-1)
   - Lower confidence if submission is unclear, incomplete, or hard to assess

RESPONSE FORMAT (JSON):
{
  "scores": {
    "criterionName1": {
      "points": number,
      "level": "string",
      "justification": "detailed explanation with specific quotes/evidence",
      "missingElements": ["list any missing required elements"],
      "evidence": "specific text from submission that supports this score"
    }
  },
  "totalScore": number,
  "feedback": "Overall constructive feedback",
  "strengths": "Specific strengths identified with evidence",
  "improvements": "Specific areas for improvement with actionable steps",
  "suggestions": "Actionable suggestions for future work",
  "progressNotes": "Notes on student's progress compared to previous submissions",
  "confidence": number (0-1)
}

Remember: Be STRICT, LITERAL, and EVIDENCE-BASED. Do not be generous or assume implied content.
`;

    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

    const startTime = Date.now();
    const aiResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: "system",
            content: "You are an expert academic evaluator. Be STRICT and LITERAL in applying rubrics. Do not be generous. Provide detailed, evidence-based evaluations following the exact JSON format requested."
          },
          {
            role: "user",
            content: evaluationPrompt
          }
        ],
        temperature: 0.2, // Lower temperature for more consistent, strict evaluation
        max_tokens: 3000
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`DeepSeek API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    let responseContent = aiData.choices[0].message.content || '{}';
    responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const evaluationResult = JSON.parse(responseContent);
    const processingTime = Date.now() - startTime;

    console.log('✅ AI Evaluation Complete');
    console.log('Processing time:', processingTime, 'ms');
    console.log('\n' + '='.repeat(80));
    console.log('EVALUATION RESULTS (STRICT CRITERIA)');
    console.log('='.repeat(80));
    console.log('\nTotal Score:', evaluationResult.totalScore);
    console.log('Confidence:', evaluationResult.confidence);
    console.log('\n--- CATEGORY SCORES ---\n');

    for (const [category, details] of Object.entries(evaluationResult.scores)) {
      const detail = details as any;
      console.log(`${category}: ${detail.points}/5 - ${detail.level}`);
      console.log(`  Justification: ${detail.justification}`);
      if (detail.missingElements && detail.missingElements.length > 0) {
        console.log(`  ❌ Missing: ${detail.missingElements.join(', ')}`);
      }
      console.log();
    }

    console.log('--- FEEDBACK ---\n');
    console.log('Overall:', evaluationResult.feedback);
    console.log('\nStrengths:', evaluationResult.strengths);
    console.log('\nImprovements:', evaluationResult.improvements);
    console.log('\nSuggestions:', evaluationResult.suggestions);

    // Calculate maxScore
    const maxScore = criteriaArray.reduce((sum: number, c: any) => sum + (c.maxPoints || c.weight || 0), 0);
    const percentage = maxScore > 0 ? (evaluationResult.totalScore / maxScore) * 100 : 0;

    console.log('\n' + '='.repeat(80));
    console.log('Saving to database...');

    // Create evaluation record
    const evaluation = await prisma.evaluation.create({
      data: {
        submissionId: submission.id,
        rubricId: rubric.id,
        totalScore: evaluationResult.totalScore,
        maxScore: maxScore,
        percentage: percentage,
        feedback: evaluationResult.feedback,
        criteriaScores: evaluationResult.scores,
        strengths: evaluationResult.strengths,
        improvements: evaluationResult.improvements,
        evaluatedBy: 'ai'
      }
    });

    // Update submission status
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: 'evaluated' }
    });

    console.log('✅ Evaluation saved to database');
    console.log('Evaluation ID:', evaluation.id);
    console.log('\nFinal Score:', evaluationResult.totalScore, '/', maxScore, `(${percentage.toFixed(1)}%)`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

triggerStrictEvaluation();
