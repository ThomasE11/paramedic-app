import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

async function triggerEvaluation() {
  const submissionId = 'cmglh2ce40009rxuim78dag19';
  const rubricId = 'cmglii8ls0001rxd3ucidhhk5';

  // Fetch submission
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: { include: { module: true } },
      student: { select: { id: true, studentId: true, fullName: true, email: true } }
    }
  });

  if (!submission) {
    console.log('Submission not found');
    return;
  }

  // Fetch rubric
  const rubric = await prisma.rubric.findUnique({
    where: { id: rubricId }
  });

  if (!rubric) {
    console.log('Rubric not found');
    return;
  }

  console.log('=== Starting Evaluation ===\n');
  console.log(`Student: ${submission.student.fullName}`);
  console.log(`Assignment: ${submission.assignment.title}`);
  console.log(`Text length: ${submission.extractedText?.length || 0} chars`);

  // Handle both rubric structures
  const rubricCriteria = rubric.criteria as any;
  const criteriaArray = rubricCriteria.criteria || rubricCriteria.categories || [];
  const maxScore = criteriaArray.reduce((sum: number, c: any) => sum + (c.maxPoints || c.maxScore || c.weight || 0), 0);

  console.log(`Max score: ${maxScore}`);
  console.log(`Criteria count: ${criteriaArray.length}\n`);

  const evaluationPrompt = `You are an expert academic evaluator for Advanced Paramedicine education.

ASSIGNMENT: ${submission.assignment.title}
STUDENT: ${submission.student.fullName} (${submission.student.studentId})
MODULE: ${submission.assignment.module?.name}

RUBRIC CRITERIA:
${JSON.stringify(criteriaArray, null, 2)}

STUDENT SUBMISSION:
${submission.extractedText || 'No text content available'}

EVALUATION INSTRUCTIONS:
1. Evaluate the submission against each criterion in the rubric
2. For each criterion, determine the appropriate level and assign points based on the rubric descriptors
3. Provide specific, constructive feedback with evidence from the submission
4. Identify strengths and areas for improvement
5. Suggest specific actions for improvement
6. Be thorough, fair, and academically rigorous

RESPONSE FORMAT (JSON only, no markdown code blocks):
{
  "scores": {
    "criterionName1": {
      "points": number,
      "level": "string",
      "justification": "detailed explanation with quotes from submission"
    }
  },
  "totalScore": number,
  "feedback": "Overall constructive feedback",
  "strengths": "Specific strengths identified",
  "improvements": "Specific areas for improvement",
  "suggestions": "Actionable suggestions for future work"
}

Be thorough, fair, and constructive in your evaluation.`;

  console.log('Calling DeepSeek API...\n');

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
          content: "You are an expert academic evaluator. Provide detailed, constructive, and fair evaluations. Return ONLY valid JSON without markdown formatting."
        },
        {
          role: "user",
          content: evaluationPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    })
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error('DeepSeek API error:', errorText);
    return;
  }

  const aiData = await aiResponse.json();

  // Clean markdown code blocks
  let responseContent = aiData.choices[0].message.content || '{}';
  responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  console.log('AI Response:\n', responseContent.substring(0, 500) + '...\n');

  const evaluationResult = JSON.parse(responseContent);
  const percentage = (evaluationResult.totalScore / maxScore) * 100;

  console.log(`\n=== Evaluation Result ===`);
  console.log(`Score: ${evaluationResult.totalScore}/${maxScore} (${percentage.toFixed(1)}%)`);

  // Create evaluation
  const evaluation = await prisma.evaluation.create({
    data: {
      submissionId,
      rubricId,
      totalScore: evaluationResult.totalScore,
      maxScore: maxScore,
      percentage: percentage,
      feedback: evaluationResult.feedback,
      criteriaScores: evaluationResult.scores,
      strengths: evaluationResult.strengths,
      improvements: evaluationResult.improvements,
      evaluatedBy: 'ai-script'
    }
  });

  // Update submission status
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: 'evaluated' }
  });

  console.log(`\n✅ Evaluation created: ${evaluation.id}`);
  console.log('\nCriteria Scores:');
  Object.entries(evaluationResult.scores).forEach(([name, data]: [string, any]) => {
    console.log(`  ${name}: ${data.points} pts - ${data.level}`);
  });

  await prisma.$disconnect();
}

triggerEvaluation().catch(console.error);
