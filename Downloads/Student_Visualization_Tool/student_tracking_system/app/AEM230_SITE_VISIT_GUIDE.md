# AEM230 Site Visit Form - User Guide

## Overview

The AEM230 Record of Discussion form is now fully integrated into the Student Tracking System. This digital form allows clinical instructors to document site visits with students, capture dual signatures, and generate perfectly formatted PDFs matching the original AEM230 document.

## Accessing the Form

**URL**: `http://localhost:3005/modules/aem230-site-visit`

Navigate to this URL while the development server is running to access the form.

## Form Sections

### 1. Student Information
- **Student Selection**: Dropdown menu to select the student for this visit
- **Student ID**: Automatically populated based on selected student

### 2. Discussion Details
- **Discussion Date**: Date of the site visit (defaults to today)
- **Discussion Time**: Time of the discussion (defaults to current time)
- **Company Name**: Name of the healthcare facility or organization
- **Workplace Location**: Specific location/department within the facility

### 3. Conductor Information
- **Conductor Name**: Name of the person conducting the discussion (clinical instructor/supervisor)
- **Conductor Role**: Select from:
  - Work Supervisor
  - Clinical Instructor
  - Preceptor
  - Other

### 4. Discussion Record

#### People Present
Text area to document who attended the discussion (e.g., student, instructor, ward manager, etc.)

#### Attendance
Document the student's attendance record for this rotation period

#### Challenges at the Hospital
Record any challenges or obstacles the student encountered during placement

#### Interesting Cases
Document notable or educational cases the student was involved with

### 5. Skills Completed Checklist

Check all skills that the student completed or observed during this placement:

- ☑ Blood Pressure (BP)
- ☑ Temperature (Temp)
- ☑ Respiratory Rate (RR)
- ☑ Heart Rate (HR)
- ☑ Wound Care
- ☑ Sutures - Observed
- ☑ ECG
- ☑ Nasal and Throat Swabs - Observed
- ☑ X-rays Observation - Observed
- ☑ Lucas Mechanical Device
- ☑ HGT Recording - Observed
- ☑ Arterial Blood Gases - Observed
- ☑ Theatre Observation
- ☑ IM Injection
- ☑ Bandaging
- ☑ Communication and Translation

### 6. Assessment Discussion

#### SA2 Assessment Discussion
Document any discussion about the student's SA2 assessment, progress, or concerns

#### Assessment Criteria Met
List the specific assessment criteria that were met during this placement period

### 7. Signatures

#### Conductor Signature
1. Click the signature pad area
2. Use your mouse/trackpad to sign
3. Click "Clear" if you need to redo the signature
4. Signature date is automatically set to today

#### Student Signature
1. Click the signature pad area
2. Use mouse/trackpad to sign
3. Click "Clear" to redo if needed
4. Signature date is automatically set to today

## Form Actions

### Clear Form
- Resets all fields to their default values
- Clears both signature pads
- Does not save any data
- Use this to start a fresh form

### Save Site Visit
1. Click the "Save Site Visit" button
2. System validates that all required fields are filled
3. Form data is saved to the database
4. Success message appears: "Site visit saved successfully"
5. Form can still be downloaded as PDF after saving

### Download PDF
1. Click the "Download PDF" button
2. PDF is generated with exact AEM230 formatting
3. File downloads automatically with naming format: `AEM230_[StudentID]_[Date].pdf`
4. PDF includes:
   - All form data in bordered table format
   - Embedded signature images
   - Professional formatting matching original document

## PDF Format Details

The generated PDF matches the official AEM230 Record of Discussion form with:
- **Title**: "RECORD OF DISCUSSION"
- **Form Number**: "10"
- **Student Information Table**: Name and ID
- **Discussion Details Table**: Date, time, location, conductor info
- **Record of Discussion**: Left column (65% width) with all discussion content
- **Assessment Criteria**: Right column (35% width)
- **Skills List**: Automatically formatted from checked items
- **Signature Sections**: Embedded signature images with dates

## Workflow Recommendations

### Standard Workflow
1. **Before the site visit**: Have the form open and ready
2. **During/after the visit**: Fill out all discussion details
3. **Check skills**: Mark all skills the student completed
4. **Capture signatures**: Get both conductor and student signatures
5. **Save**: Click "Save Site Visit" to store in database
6. **Download**: Click "Download PDF" for records/student portfolio

### Tips for Best Results
- Complete all sections before capturing signatures
- Ensure signature pads are filled (required for PDF)
- Use clear, concise language in text areas
- Review the form before saving
- Download PDF immediately after completion for backup

## Technical Notes

### Database Storage
- All site visits are stored in the database with student linkage
- Signatures stored as base64 image data
- Retrieve past site visits via API: `/api/site-visits/aem230?studentId=[ID]`

### API Endpoints
- **Save**: `POST /api/site-visits/aem230`
- **Retrieve**: `GET /api/site-visits/aem230`
- **PDF Generation**: `POST /api/site-visits/aem230/pdf`

### Authentication
- All endpoints require valid session authentication
- Users must be logged in to access the form

## Troubleshooting

### Form Won't Save
- Verify all required fields are filled
- Check that student is selected
- Ensure both signatures are captured
- Verify you're logged in

### PDF Won't Download
- Check browser popup blocker settings
- Ensure signatures are captured
- Verify date fields are filled
- Check browser console for errors

### Signature Pad Not Working
- Click directly in the signature area
- Try using a mouse instead of trackpad
- Use "Clear" button and retry
- Refresh page if pad becomes unresponsive

## Future Enhancements

Potential additions to consider:
- View previously saved site visits
- Edit existing site visit records
- Bulk PDF generation for multiple visits
- Email PDF directly to student
- Integration with student portfolio system
- Mobile-responsive signature capture

---

**Form Location**: `/app/app/modules/aem230-site-visit/page.tsx`
**PDF Generator**: `/app/lib/pdf-generator.ts` - `generateAEM230PDF()`
**API Routes**: `/app/app/api/site-visits/aem230/`

For technical support or feature requests, contact the system administrator.
