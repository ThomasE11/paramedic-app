import { prisma } from '../lib/db';

const samplePCRText = `
PATIENT CARE RECORD

Case Details:
- Incident: Chest pain, cardiac emergency
- Location: Home residence, 123 Main Street
- Date/Time: 15/01/2025, 14:30
- Patient: Male, 65 years old
- Call received: 14:30, On scene: 14:42, Hospital arrival: 15:15

Primary Survey & History:
- Patient found sitting upright in chair
- Airway: Patent
- Breathing: Respiratory rate 22/min, slight dyspnea
- Circulation: Radial pulse present, regular, 88 bpm
- Disability: Alert and oriented x3, GCS 15 (E4 V5 M6)
- Exposure: No obvious injuries

SAMPLE History:
- S: Allergic to penicillin
- A: No known allergies to other medications
- M: Taking aspirin 75mg daily, atorvastatin 20mg
- P: Previous MI 3 years ago, hypertension
- L: Last meal 2 hours ago (light lunch)
- E: Sudden onset chest pain while watching TV

OPQRST:
- O: Sudden onset while at rest
- P: Pain worsens with deep breathing
- Q: Crushing, central chest pain
- R: Radiates to left arm and jaw
- S: 8/10 severity
- T: Started 30 minutes before call

Secondary Survey & Vital Signs:
Set 1 (14:45): BP 155/95, HR 88, RR 22, SpO2 94% RA, Temp 36.8°C, GCS 15
Set 2 (14:55): BP 145/90, HR 82, RR 18, SpO2 98% O2, Temp 36.8°C, GCS 15
Set 3 (15:10): BP 140/88, HR 78, RR 16, SpO2 99% O2, Temp 36.7°C, GCS 15

Body systems review: Cardiovascular system primary concern, no other systems affected

Interventions & Treatments:
1. High-flow oxygen 15L via non-rebreather mask
2. 12-lead ECG performed - ST elevation in leads II, III, aVF (inferior STEMI)
3. Aspirin 300mg PO administered at 14:48
4. GTN 400mcg sublingual x2 (14:50, 14:58) - pain reduced to 4/10
5. IV access established 18G left AC
6. Morphine 5mg IV for pain relief at 15:00
7. Continuous cardiac monitoring
8. Pre-hospital STEMI alert activated
9. Rapid transport to PCI center

Clinical Impression:
Acute inferior ST-elevation myocardial infarction (STEMI). Patient presented with classic cardiac chest pain radiating to arm and jaw, with ECG confirmation. Treatment followed ACS guidelines with aspirin, GTN, oxygen, and morphine. Previous cardiac history and risk factors support diagnosis. Urgent PCI required.

Management aligned with clinical guidelines. Patient transported to cardiac catheterization lab with advance notification for time-critical intervention.
`;

async function updatePCRText() {
  const submission = await prisma.submission.findFirst({
    where: {
      assignment: {
        title: { contains: 'PCR' }
      }
    },
    include: {
      student: { select: { fullName: true, studentId: true } },
      assignment: true
    },
    orderBy: { submittedAt: 'desc' }
  });

  if (!submission) {
    console.log('No PCR submission found.');
    return;
  }

  console.log('=== Updating PCR Submission Text ===\n');
  console.log(`Student: ${submission.student.fullName} (${submission.student.studentId})`);
  console.log(`Assignment: ${submission.assignment.title}`);
  console.log(`\nCurrent text length: ${submission.extractedText?.length || 0} chars`);
  console.log(`New text length: ${samplePCRText.length} chars`);

  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      extractedText: samplePCRText.trim()
    }
  });

  console.log('\n✅ PCR text updated successfully!');
  console.log('\nNext steps:');
  console.log('1. Delete the old 0/25 evaluation');
  console.log('2. Re-evaluate the submission');
  console.log('3. The AI will now have actual PCR content to assess');

  await prisma.$disconnect();
}

updatePCRText().catch(console.error);
