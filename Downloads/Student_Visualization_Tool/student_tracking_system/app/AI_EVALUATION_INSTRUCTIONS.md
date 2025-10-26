# AI Evaluation Instructions for Handwritten PCRs

## Problem Summary

The AI evaluation system is **working correctly**. It scored 0/25 because the PDF text extraction failed, leaving no content to evaluate. This is the proper behavior—the AI should not fabricate or assume content.

### What Happened:
1. Student uploaded handwritten PCR PDF (48MB)
2. `pdf-parse` library failed with: "Object.defineProperty called on non-object"
3. Error message was stored as `extractedText`
4. AI correctly evaluated the error message and found zero PCR content
5. AI correctly assigned 0/25 with detailed justification for missing elements

## Root Cause

**File**: `app/api/upload/route.ts:150-154`

```typescript
catch (pdfError: any) {
  extractedText = `PDF text extraction failed. Error: ${pdfError.message}...`;
  // ⬆️ This becomes the submission content that AI evaluates
}
```

The issue is **PDF OCR failure**, not AI evaluation logic.

---

## Solution: Extract Handwritten Content Properly

### Option 1: Automated Extraction (Recommended)

Install Claude Vision integration:

```bash
cd student_tracking_system/app
npm install pdf-to-png-converter
```

**Add to `.env`**:
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Update** `app/api/upload/route.ts`:

Replace lines 411-435 with:

```typescript
async function performPdfOcr(pdfBuffer: Buffer, filePath: string): Promise<{
  success: boolean;
  text: string;
  confidence?: number
}> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const { pdfToPng } = await import('pdf-to-png-converter');

    console.log('🔄 Converting PDF to images for OCR...');
    const pngPages = await pdfToPng(filePath, {
      disableFontFace: false,
      useSystemFonts: false,
      viewportScale: 2.0,
    });

    console.log(`✅ Converted ${pngPages.length} pages`);

    let fullText = '';

    for (let i = 0; i < pngPages.length; i++) {
      const page = pngPages[i];
      const base64Image = page.content.toString('base64');

      console.log(`📖 Processing page ${i + 1}/${pngPages.length}...`);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
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
                text: `Extract ALL text from this handwritten PCR page. Include:
- Patient demographics and call details
- All vital signs and assessment findings
- ABCDE primary survey
- SAMPLE history and OPQRST
- Interventions and treatments
- Clinical impressions and management

Transcribe exactly as written. Use [unclear] for illegible text. Include all timestamps, measurements, and annotations.`
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      fullText += `\n\n=== PAGE ${i + 1} ===\n\n${data.content[0].text}`;
    }

    const trimmedText = fullText.trim();
    console.log(`✅ OCR complete: ${trimmedText.length} characters`);

    return {
      success: trimmedText.length > 100,
      text: trimmedText,
      confidence: 0.95
    };

  } catch (error: any) {
    console.error('❌ Claude Vision OCR failed:', error);
    return {
      success: false,
      text: '',
      confidence: 0
    };
  }
}
```

**Update** line 112 call to include filePath:

```typescript
const ocrResult = await performPdfOcr(buffer, filePath);
```

---

### Option 2: Manual Extraction (Immediate Fix)

For the current submission, extract text manually:

#### Step 1: Extract Text

```bash
cd student_tracking_system/app

# Extract text from the handwritten PCR
npx tsx scripts/extract-handwritten-pcr.ts \
  "uploads/submission/cmgfvp7070007rxv5cvbufb3v/MvlQBFYw4lMrFCCrCMGll_1760275044228.pdf" \
  > extracted-pcr-text.txt
```

This will output the extracted text. Review and edit `extracted-pcr-text.txt` if needed.

#### Step 2: Update Submission

```bash
# Update the submission with extracted text
npx tsx scripts/update-submission-text.ts \
  cmgnqb8y60001rxkz96o77kym \
  extracted-pcr-text.txt
```

This will:
- Update the submission's `extractedText` field
- Delete the invalid 0/25 evaluation
- Set status to `pending` for re-evaluation

#### Step 3: Re-Evaluate

```bash
# Trigger evaluation through the API
npx tsx scripts/trigger-evaluation.ts cmgnqb8y60001rxkz96o77kym
```

Or use the web interface:
1. Go to Assignments page
2. Find "PCR Evaluation"
3. Click "View Submissions"
4. Find student "Abdulhamid Bashar Abdulla Hasan Alhaddad"
5. Click "Evaluate"

---

## Teaching the AI to Evaluate Handwritten Content

The AI **already knows how to evaluate handwritten content**. The evaluation prompt in `app/api/evaluate/route.ts:132-145` includes:

```typescript
${submission.metadata && (submission.metadata as any).isHandwritten ? `
⚠️ HANDWRITTEN DOCUMENT DETECTED
This submission was identified as handwritten or image-based content.
- OCR Confidence: ${(submission.metadata as any).ocrConfidence}%

SPECIAL CONSIDERATIONS FOR HANDWRITTEN CONTENT:
- Text may contain OCR errors or unclear sections
- Be flexible with spelling/transcription errors while maintaining content standards
- Focus on content understanding rather than perfect transcription
- If text is unclear or incomplete, note this in your evaluation
- Consider the medical/clinical content substance over presentation
` : ''}
```

The AI **will automatically apply these considerations** once you provide actual PCR content (not an error message).

---

## How the AI Evaluates PCRs

### Evaluation Logic (`app/api/evaluate/route.ts`)

1. **Fetches submission** with student context
2. **Loads rubric** (5 categories, 25 points total)
3. **Prepares evaluation prompt** with:
   - Student history for progress tracking
   - Complete rubric criteria with level descriptions
   - Submission extracted text
   - Special handwritten considerations (if flagged)
   - **Strict evaluation instructions**: literal interpretation, evidence-based scoring

4. **Sends to DeepSeek AI** (temperature: 0.3 for consistency)
5. **Parses JSON response** with:
   - `scores`: per-criterion scores with justification and evidence
   - `totalScore`: sum of all criterion points
   - `feedback`: overall constructive feedback
   - `strengths`: specific strengths with evidence
   - `improvements`: actionable improvement areas
   - `confidence`: AI's confidence in evaluation (0-1)

6. **Saves evaluation** to database
7. **Creates activity log** for student dashboard
8. **Updates student progress** metrics

### What the AI Checks (PCR Rubric)

**Category 1: Case details & Call timings (5 points)**
- Anonymised patient demographics
- 998 call details/code
- Incident type & location
- Accurate timings of call duration

**Category 2: Primary Survey & History taking (5 points)**
- Patient position
- Medical/Trauma primary survey
- SAMPLE history
- OPQRST of chief complaint

**Category 3: Secondary Survey & Vital Signs (5 points)**
- Minimum 3 sets of vital signs
- Accurate GCS calculation
- Annotated silhouette
- Appropriate body systems review

**Category 4: Interventions & Treatments (5 points)**
- CPG adherence
- Scope of practice adherence
- Correct terminology
- ECG interpretation (if applicable)
- Reassessment

**Category 5: Clinical Impression & Documentation (5 points)**
- Clinical understanding
- Correlation between impression and treatment
- Management log quality
- Medical terminology

### Scoring Levels (per category)

- **Best Practice** (5pts): All elements present, excellent quality
- **Standard Met** (4pts): All elements present, adequate quality
- **Approaching Standard** (3pts): Most elements present, some gaps
- **Below Standard** (2pts): Some elements present, significant gaps
- **Standard Not Met** (0pts): Most/all elements missing

---

## Current Status

### For Student: Abdulhamid Bashar Abdulla Hasan Alhaddad (H00441453)

- **Submission ID**: `cmgnqb8y60001rxkz96o77kym`
- **Assignment**: PCR Evaluation (Responder 1)
- **File**: `MvlQBFYw4lMrFCCrCMGll_1760275044228.pdf` (48MB)
- **Issue**: PDF text extraction failed
- **Current Score**: 0/25 (correctly scored by AI due to no content)
- **Status**: `evaluated` (invalid evaluation)

### Action Required

1. ✅ **Extract text** using: `npx tsx scripts/extract-handwritten-pcr.ts <pdf-path>`
2. ✅ **Update submission** using: `npx tsx scripts/update-submission-text.ts <id> <text-file>`
3. ✅ **Re-evaluate** using web interface or: `npx tsx scripts/trigger-evaluation.ts <id>`

---

## Future Prevention

### Implement Automated OCR

1. Install dependencies:
   ```bash
   npm install pdf-to-png-converter
   ```

2. Add `ANTHROPIC_API_KEY` to `.env`

3. Update `app/api/upload/route.ts` with Claude Vision integration (see Option 1 above)

4. Test with new handwritten uploads

### Alternative OCR Services

If Claude Vision API costs are a concern:

- **Tesseract.js** (free, open-source, lower accuracy)
- **Google Cloud Vision API** (paid, high accuracy)
- **AWS Textract** (paid, medical document support)
- **Azure Form Recognizer** (paid, structure-aware)

---

## Verification

After re-extraction and re-evaluation, verify:

```bash
npx tsx scripts/check-latest-evaluation.ts
```

Should show:
- ✅ Score > 0 (actual evaluation based on content)
- ✅ Detailed criterion scores with evidence quotes
- ✅ Strengths and improvements identified
- ✅ Feedback is constructive and specific

---

## Summary

**The AI evaluation is working correctly.** It properly scored 0/25 when given an error message instead of PCR content. The issue is the **PDF text extraction layer**, not the evaluation logic.

**Fix**: Implement Claude Vision OCR (Option 1) or manually extract text (Option 2).

Once proper text is extracted, the AI will:
- ✅ Evaluate against all 5 rubric categories
- ✅ Apply handwritten content considerations
- ✅ Provide detailed, evidence-based feedback
- ✅ Score appropriately based on actual content
