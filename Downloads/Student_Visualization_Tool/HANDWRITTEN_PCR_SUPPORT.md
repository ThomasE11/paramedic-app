# Handwritten PCR Support & 60MB Upload Limit

## Summary of Changes

Your student tracking system has been updated to support **handwritten PCRs** and **larger file uploads (60MB)**.

---

## 1. Upload Limit Increased to 60MB

### Changes Made:
- **File:** `student_tracking_system/app/app/api/upload/route.ts`
- **Line 10:** Changed `MAX_FILE_SIZE` from 10MB to **60MB**
- **Line 46:** Updated error message to reflect new 60MB limit

### What This Means:
- Students can now upload files up to **60 megabytes**
- Supports larger scanned documents, multi-page PDFs, and high-resolution images
- No more upload failures for larger PCR documents

---

## 2. Handwritten Document Support

### A. Image File Support Added

**Allowed file types now include:**
- PDF (`.pdf`)
- Word documents (`.doc`, `.docx`)
- Text files (`.txt`, `.rtf`)
- **NEW: Image files**
  - JPEG (`.jpg`, `.jpeg`)
  - PNG (`.png`)
  - TIFF (`.tiff`)
  - BMP (`.bmp`)

### B. OCR (Optical Character Recognition) Integration

**Technology Added:**
- Installed `tesseract.js` library for text extraction from images and handwritten documents
- Automatic OCR processing for:
  - Image-based PDFs (scanned documents)
  - Direct image uploads (photos of handwritten PCRs)
  - Handwritten text recognition

**How It Works:**

1. **When a handwritten/scanned document is uploaded:**
   ```
   Upload → Detect if image-based → Run OCR → Extract text → Store for evaluation
   ```

2. **Metadata captured:**
   - `isHandwritten: true` flag
   - `extractionMethod: "ocr"`
   - `ocrConfidence: 0-100%` (accuracy rating)
   - `pageCount` for PDFs

3. **Smart handling:**
   - If OCR succeeds → Full text extracted for AI evaluation
   - If OCR partially succeeds → Best effort extraction with notes
   - If OCR fails → File still accepted, AI will process visual content during evaluation

### C. Enhanced PDF Processing

**File:** `app/api/upload/route.ts` (Lines 106-149)

- Detects when PDFs contain scanned images instead of text
- Automatically attempts OCR on image-based PDFs
- Provides clear feedback about extraction success
- Handles encrypted, corrupted, or image-only PDFs gracefully

---

## 3. AI Evaluation Enhanced for Handwritten Content

### Changes to Evaluation System

**File:** `app/api/evaluate/route.ts` (Lines 132-145)

Added special section in AI prompt that activates when handwritten content is detected:

```
⚠️ HANDWRITTEN DOCUMENT DETECTED
This submission was identified as handwritten or image-based content.

SPECIAL CONSIDERATIONS FOR HANDWRITTEN CONTENT:
- Text may contain OCR errors or unclear sections
- Be flexible with spelling/transcription errors while maintaining content standards
- Focus on content understanding rather than perfect transcription
- If text is unclear or incomplete, note this in your evaluation
- Consider the medical/clinical content substance over presentation
```

### What This Means:
- AI evaluator is **aware** when content is handwritten
- More **flexible** with OCR transcription errors
- Focuses on **clinical content** over perfect spelling
- Still maintains **academic standards** for medical knowledge
- Provides **constructive feedback** even with unclear handwriting

---

## 4. How It Works in Practice

### Upload Flow for Handwritten PCRs:

1. **Instructor uploads handwritten PCR** (scanned PDF or photo)
2. **System detects** it's image-based/handwritten
3. **OCR engine runs** to extract text:
   - Progress shown: "OCR Progress: 45%..."
   - Confidence calculated: e.g., "87% confidence"
4. **Extracted text stored** with metadata:
   ```json
   {
     "extractedText": "Patient: John Doe, Age 45, Chief Complaint: Chest pain...",
     "metadata": {
       "isHandwritten": true,
       "extractionMethod": "ocr",
       "ocrConfidence": 0.87,
       "pageCount": 3
     }
   }
   ```
5. **Ready for evaluation** with special handling

### Evaluation Flow:

1. **AI receives** extracted text + handwritten flag
2. **Applies lenient interpretation** for OCR errors
3. **Focuses on clinical accuracy**:
   - ✅ Patient assessment documented
   - ✅ Vital signs recorded
   - ✅ Treatment rationale explained
   - ~ Spelling variations accepted
   - ~ Transcription quirks overlooked
4. **Provides detailed feedback** on clinical content
5. **Grades against rubric** fairly

---

## 5. Testing Recommendations

### Test with these scenarios:

1. **Clean handwritten PCR** (clear writing)
   - Expected: High OCR confidence (>80%)
   - Should extract most text accurately

2. **Messy handwritten PCR** (difficult writing)
   - Expected: Lower OCR confidence (50-70%)
   - AI should still evaluate based on extracted content

3. **Scanned multi-page PDF**
   - Expected: Page-by-page processing
   - All pages should be extracted

4. **Photo of handwritten PCR** (JPEG/PNG)
   - Expected: Direct OCR processing
   - Should work like scanned PDFs

5. **Mixed document** (printed + handwritten notes)
   - Expected: Both text types extracted
   - Should handle combination well

### How to Test:

1. Navigate to **Assignments** page
2. Select an assignment
3. Click **Upload Submission**
4. Choose a handwritten PCR file (up to 60MB)
5. Upload and wait for OCR processing
6. Check extraction results in submission details
7. Trigger **Auto-Evaluate** to test AI grading
8. Review feedback for handwritten-specific considerations

---

## 6. Package Dependencies

### New Package Installed:
```json
{
  "tesseract.js": "^5.x.x"
}
```

**What it does:**
- Pure JavaScript OCR library
- Runs in Node.js (no external dependencies)
- Supports multiple languages (currently configured for English)
- Provides confidence scores for extraction quality

---

## 7. File Locations Changed

| File | What Changed |
|------|-------------|
| `app/api/upload/route.ts` | • Upload limit 60MB<br>• Image file types added<br>• OCR functions added<br>• Handwritten detection |
| `app/api/evaluate/route.ts` | • Handwritten content awareness<br>• Flexible evaluation for OCR errors |
| `next.config.js` | • Configuration updated for App Router |
| `package.json` | • Tesseract.js dependency added |

---

## 8. Current Status

✅ **All changes implemented**
✅ **Tesseract.js installed**
✅ **Server running on http://localhost:3001**
✅ **Ready for testing**

---

## 9. Known Limitations

1. **OCR Accuracy:**
   - Depends on handwriting legibility
   - Works best with clear, printed-style handwriting
   - May struggle with very messy or cursive writing

2. **Processing Time:**
   - OCR takes 5-30 seconds depending on file size
   - Larger files (close to 60MB) may take longer
   - Progress shown in console logs

3. **Language Support:**
   - Currently configured for English only
   - Can be extended to other languages if needed

4. **Complex Layouts:**
   - Works best with standard document layouts
   - May have issues with heavily annotated diagrams
   - Tables might need manual review

---

## 10. Future Enhancements (Optional)

If you need better handwriting recognition:

1. **Azure Form Recognizer** - Better handwriting support
2. **Google Cloud Vision API** - More accurate OCR
3. **AWS Textract** - Medical form specialization
4. **Custom ML Model** - Trained on medical handwriting

These would require API keys and additional configuration.

---

## Questions or Issues?

The system should now:
- ✅ Accept files up to 60MB
- ✅ Process handwritten PCRs automatically
- ✅ Extract text using OCR
- ✅ Evaluate handwritten content fairly
- ✅ Provide appropriate feedback

**Server URL:** http://localhost:3001

Ready to test! Upload a handwritten PCR and see the OCR in action.
