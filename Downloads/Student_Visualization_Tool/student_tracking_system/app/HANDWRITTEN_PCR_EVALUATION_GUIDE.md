# Handwritten PCR Evaluation Guide

## Problem Identified

The system is scoring handwritten PCRs as 0/25 because:

1. **PDF Text Extraction Failure**: The `pdf-parse` library throws error: "Object.defineProperty called on non-object" on handwritten/scanned PDFs
2. **No OCR Fallback**: The OCR functions `performPdfOcr()` and `performImageOcr()` return empty results
3. **AI Evaluates Error Message**: The AI receives the error message instead of actual content, correctly scoring 0/25 for missing content

## Root Cause

**File**: [app/api/upload/route.ts:95-155](app/api/upload/route.ts#L95-L155)

```typescript
// Line 95-104: pdf-parse fails on handwritten PDFs
const pdfData = await pdfParse(buffer);
extractedText = pdfData.text.trim();

// Line 150-154: When it fails, error message is stored as extracted text
extractedText = `PDF text extraction failed. Error: ${pdfError.message}...`;
```

This error message becomes the submission's `extractedText`, which the AI then evaluates.

## Solution: Two-Phase Approach

### Phase 1: Immediate Fix (Use Claude Vision API)

Instead of relying on Tesseract OCR (which isn't configured), use Claude's Vision API to read handwritten content directly.

### Phase 2: Proper OCR Integration

Set up Tesseract.js or a cloud OCR service for automated extraction.

---

## Implementation: Phase 1 (Claude Vision)

### Step 1: Update Upload Route to Use Claude Vision

**File**: `app/api/upload/route.ts`

```typescript
// Add at top of file
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function performPdfOcrWithClaude(filePath: string): Promise<{
  success: boolean;
  text: string;
  confidence?: number
}> {
  try {
    // Convert PDF to images using pdf-to-png
    const { pdfToPng } = await import('pdf-to-png-converter');
    const pngPages = await pdfToPng(filePath, {
      disableFontFace: false,
      useSystemFonts: false,
      viewportScale: 2.0,
    });

    let fullText = '';
    let pageNum = 1;

    for (const page of pngPages) {
      console.log(`Processing page ${pageNum}/${pngPages.length} with Claude Vision...`);

      // Convert PNG buffer to base64
      const base64Image = page.content.toString('base64');

      // Call Claude Vision API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: `Extract ALL text from this handwritten Patient Care Report (PCR) page.

CRITICAL INSTRUCTIONS:
- Transcribe EVERY word, number, time, and notation exactly as written
- Preserve ALL medical terminology, abbreviations, and codes
- Include ALL sections: patient demographics, call details, vital signs, assessments, interventions
- If handwriting is unclear, provide your best interpretation in [brackets]
- Maintain the document structure (sections, labels, fields)
- Include ALL timestamps, measurements, and numerical data
- Note any diagrams, checkboxes, or annotated body silhouettes

Output Format: Plain text with clear section headers. Be thorough and precise.`
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      const pageText = data.content[0].text;

      fullText += `\n\n=== PAGE ${pageNum} ===\n\n${pageText}`;
      pageNum++;
    }

    return {
      success: true,
      text: fullText.trim(),
      confidence: 0.95 // Claude Vision is highly accurate
    };

  } catch (error) {
    console.error('Claude Vision OCR error:', error);
    return {
      success: false,
      text: '',
      confidence: 0
    };
  }
}

// Replace the existing performPdfOcr function (lines 411-435)
async function performPdfOcr(pdfBuffer: Buffer, filePath: string): Promise<{
  success: boolean;
  text: string;
  confidence?: number
}> {
  // Use Claude Vision for handwritten content
  return await performPdfOcrWithClaude(filePath);
}
```

### Step 2: Update the PDF Processing Logic

**File**: `app/api/upload/route.ts` (lines 92-155)

```typescript
} else if (file.type === 'application/pdf') {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(buffer);
    extractedText = pdfData.text.trim();

    metadata = {
      pageCount: pdfData.numpages,
      wordCount: extractedText.split(/\s+/).filter(w => w).length,
      extractedChars: extractedText.length
    };

    // If PDF has insufficient text, use Claude Vision OCR
    if (!extractedText || extractedText.length < 50) {
      console.log('PDF appears image-based or handwritten, using Claude Vision OCR...');

      const ocrResult = await performPdfOcr(buffer, filePath);

      if (ocrResult.success && ocrResult.text && ocrResult.text.length > 100) {
        extractedText = ocrResult.text;
        metadata = {
          pageCount: pdfData.numpages,
          extractionMethod: 'claude-vision',
          ocrConfidence: ocrResult.confidence,
          isHandwritten: true,
          wordCount: extractedText.split(/\s+/).filter(w => w).length,
          extractedChars: extractedText.length
        };
        console.log('✅ Claude Vision OCR successful:', {
          textLength: extractedText.length,
          confidence: ocrResult.confidence
        });
      } else {
        throw new Error('OCR extraction yielded insufficient content');
      }
    }

  } catch (pdfError: any) {
    console.error('PDF processing failed:', pdfError);

    // CRITICAL: Try Claude Vision OCR as last resort
    console.log('Attempting Claude Vision OCR as fallback...');
    try {
      const ocrResult = await performPdfOcr(buffer, filePath);

      if (ocrResult.success && ocrResult.text && ocrResult.text.length > 100) {
        extractedText = ocrResult.text;
        metadata = {
          extractionMethod: 'claude-vision-fallback',
          originalError: pdfError.message,
          isHandwritten: true,
          ocrConfidence: ocrResult.confidence,
          wordCount: extractedText.split(/\s+/).filter(w => w).length,
          extractedChars: extractedText.length
        };
        console.log('✅ Fallback Claude Vision OCR successful');
      } else {
        throw new Error('All extraction methods failed');
      }
    } catch (fallbackError) {
      // Only NOW store error message
      extractedText = `EXTRACTION FAILED: Unable to read this document.

Error: ${pdfError.message}
Fallback Error: ${fallbackError.message}

Please either:
1. Re-upload as a clearer scan/photo
2. Upload as images (JPG/PNG) instead of PDF
3. Type the content manually into a text file`;

      metadata = {
        extractionFailed: true,
        primaryError: pdfError.message,
        fallbackError: fallbackError.message
      };
    }
  }
}
```

### Step 3: Install Required Dependencies

```bash
npm install pdf-to-png-converter
```

### Step 4: Update Environment Variables

**File**: `.env`

```bash
# Add if not present
ANTHROPIC_API_KEY=your_claude_api_key_here
```

---

## How to Manually Evaluate Handwritten PCR

Until the automated fix is deployed, follow these steps:

### Manual Evaluation Process

1. **Download the PCR PDF** from the uploads folder
2. **Open the file** and read it manually
3. **Use the evaluation script** with manual input:

```bash
npx tsx scripts/manual-evaluate-handwritten.ts
```

**Create**: `scripts/manual-evaluate-handwritten.ts`

```typescript
import { prisma } from '@/lib/db';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function manualEvaluate() {
  try {
    // Get the latest PCR submission
    const submission = await prisma.submission.findFirst({
      where: {
        assignment: {
          type: 'skill_assessment'
        }
      },
      include: {
        assignment: true,
        student: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    if (!submission) {
      console.log('No PCR submission found');
      return;
    }

    console.log(`\n=== PCR SUBMISSION ===`);
    console.log(`Student: ${submission.student.fullName}`);
    console.log(`Assignment: ${submission.assignment.title}`);
    console.log(`File: ${submission.filePath}`);
    console.log(`\nExtracted Text: ${submission.extractedText}\n`);

    // Get rubric
    const rubric = await prisma.rubric.findFirst({
      where: {
        assignmentId: submission.assignmentId,
        isActive: true
      }
    });

    if (!rubric) {
      console.log('No active rubric found');
      return;
    }

    const criteria = (rubric.criteria as any).categories || [];
    console.log(`\n=== RUBRIC (${criteria.length} categories, ${rubric.maxScore} total points) ===\n`);

    // Manual scoring
    const scores: any = {};
    let totalScore = 0;

    for (const category of criteria) {
      console.log(`\n--- ${category.name} (${category.maxPoints} points) ---`);
      console.log(`Description: ${category.description}\n`);

      console.log(`Levels:`);
      category.levels.forEach((level: any, idx: number) => {
        console.log(`  ${idx + 1}. ${level.level} (${level.points}pts): ${level.description}`);
      });

      const levelChoice = await question(`\nSelect level (1-${category.levels.length}): `);
      const selectedLevel = category.levels[parseInt(levelChoice) - 1];

      const justification = await question(`Justification: `);
      const evidence = await question(`Evidence (quote from PCR): `);
      const missing = await question(`Missing elements (comma-separated, or press Enter): `);

      scores[category.name] = {
        level: selectedLevel.level,
        points: selectedLevel.points,
        justification,
        evidence,
        missingElements: missing ? missing.split(',').map(s => s.trim()) : []
      };

      totalScore += selectedLevel.points;
    }

    console.log(`\n=== OVERALL FEEDBACK ===`);
    const feedback = await question(`Overall feedback: `);
    const strengths = await question(`Key strengths: `);
    const improvements = await question(`Areas for improvement: `);

    // Save evaluation
    const evaluation = await prisma.evaluation.create({
      data: {
        submissionId: submission.id,
        rubricId: rubric.id,
        totalScore,
        maxScore: rubric.maxScore,
        percentage: (totalScore / rubric.maxScore) * 100,
        feedback,
        criteriaScores: scores,
        strengths,
        improvements,
        evaluatedBy: 'manual'
      }
    });

    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: 'evaluated' }
    });

    console.log(`\n✅ Evaluation saved! Score: ${totalScore}/${rubric.maxScore} (${evaluation.percentage.toFixed(1)}%)`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

manualEvaluate();
```

---

## Testing the Fix

### Test Script: Verify OCR Extraction

**Create**: `scripts/test-ocr-extraction.ts`

```typescript
import { readFile } from 'fs/promises';
import { join } from 'path';

async function testClaudeOcr(pdfPath: string) {
  try {
    const { pdfToPng } = await import('pdf-to-png-converter');

    console.log('Converting PDF to images...');
    const pngPages = await pdfToPng(pdfPath, {
      disableFontFace: false,
      useSystemFonts: false,
      viewportScale: 2.0,
    });

    console.log(`✅ Converted ${pngPages.length} pages`);

    for (let i = 0; i < pngPages.length; i++) {
      const page = pngPages[i];
      const base64Image = page.content.toString('base64');

      console.log(`\n=== Processing Page ${i + 1} ===`);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: 'Extract ALL text from this handwritten PCR page. Be thorough and precise.'
              }
            ]
          }]
        })
      });

      const data = await response.json();
      const extractedText = data.content[0].text;

      console.log(`\n--- Extracted Text (${extractedText.length} chars) ---`);
      console.log(extractedText);
      console.log(`\n--- End Page ${i + 1} ---\n`);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Get PDF path from command line
const pdfPath = process.argv[2] || 'uploads/submission/cmgfvp7070007rxv5cvbufb3v/PCR 1 RESPONDER.pdf';
testClaudeOcr(pdfPath);
```

**Run test**:
```bash
npx tsx scripts/test-ocr-extraction.ts "path/to/pcr.pdf"
```

---

## Summary

### Current Issue
- ❌ PDF extraction fails with "Object.defineProperty" error
- ❌ OCR functions return empty results
- ❌ AI evaluates error message → 0/25 score

### Solution
- ✅ Use Claude Vision API to read handwritten content
- ✅ Fall back gracefully if extraction fails
- ✅ Provide clear error messages for truly unreadable documents

### Immediate Action
1. Install `pdf-to-png-converter`: `npm install pdf-to-png-converter`
2. Add `ANTHROPIC_API_KEY` to `.env`
3. Update `app/api/upload/route.ts` with Claude Vision integration
4. Test with existing handwritten PCR

### Files to Modify
- ✅ `app/api/upload/route.ts` - Add Claude Vision OCR
- ✅ `scripts/test-ocr-extraction.ts` - Test OCR functionality
- ✅ `scripts/manual-evaluate-handwritten.ts` - Manual evaluation tool

---

**Status**: Ready to implement. The AI is working correctly—it just needs proper OCR input.
