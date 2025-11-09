import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentEvaluation {
  assignmentTitle: string;
  submittedAt: Date;
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string;
  strengths?: string;
  improvements?: string;
  criteriaScores: Record<string, any>;
}

interface StudentNote {
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  createdBy: string;
}

interface StudentProgressData {
  student: {
    fullName: string;
    studentId: string;
    email: string;
    module?: {
      name: string;
      code: string;
    };
  };
  evaluations: StudentEvaluation[];
  notes: StudentNote[];
  attendance?: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  };
}

/**
 * Generate comprehensive PDF report for student progress
 */
export async function generateStudentProgressPDF(data: StudentProgressData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Progress Report', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // Student Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const studentInfo = [
    ['Name:', data.student.fullName],
    ['Student ID:', data.student.studentId],
    ['Email:', data.student.email],
    ['Module:', data.student.module ? `${data.student.module.name} (${data.student.module.code})` : 'N/A']
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: studentInfo,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 'auto' }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Attendance Summary (if available)
  if (data.attendance) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Attendance Summary', 14, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [['Total Classes', 'Present', 'Absent', 'Attendance %']],
      body: [[
        data.attendance.total.toString(),
        data.attendance.present.toString(),
        data.attendance.absent.toString(),
        `${data.attendance.percentage.toFixed(1)}%`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10, halign: 'center' }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Academic Performance Summary
  if (data.evaluations.length > 0) {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Academic Performance', 14, yPosition);
    yPosition += 8;

    const evaluationTableData = data.evaluations.map(evaluation => [
      evaluation.assignmentTitle,
      new Date(evaluation.submittedAt).toLocaleDateString(),
      `${evaluation.score}/${evaluation.maxScore}`,
      `${evaluation.percentage.toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Assignment', 'Submitted', 'Score', 'Percentage']],
      body: evaluationTableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Detailed Feedback for Each Evaluation
    data.evaluations.forEach((evaluation, index) => {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${evaluation.assignmentTitle}`, 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Score
      doc.setFont('helvetica', 'bold');
      doc.text('Score:', 14, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`${evaluation.score}/${evaluation.maxScore} (${evaluation.percentage.toFixed(1)}%)`, 35, yPosition);
      yPosition += 8;

      // Feedback
      if (evaluation.feedback) {
        doc.setFont('helvetica', 'bold');
        doc.text('Feedback:', 14, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        const feedbackLines = doc.splitTextToSize(evaluation.feedback, pageWidth - 28);
        doc.text(feedbackLines, 14, yPosition);
        yPosition += feedbackLines.length * 5 + 5;
      }

      // Strengths
      if (evaluation.strengths) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text('Strengths:', 14, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        const strengthLines = doc.splitTextToSize(evaluation.strengths, pageWidth - 28);
        doc.text(strengthLines, 14, yPosition);
        yPosition += strengthLines.length * 5 + 5;
      }

      // Areas for Improvement
      if (evaluation.improvements) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text('Areas for Improvement:', 14, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        const improvementLines = doc.splitTextToSize(evaluation.improvements, pageWidth - 28);
        doc.text(improvementLines, 14, yPosition);
        yPosition += improvementLines.length * 5 + 10;
      }

      // Criteria Scores
      if (evaluation.criteriaScores && Object.keys(evaluation.criteriaScores).length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.text('Detailed Criteria Scores:', 14, yPosition);
        yPosition += 6;

        const criteriaData = Object.entries(evaluation.criteriaScores).map(([criterion, data]: [string, any]) => [
          criterion,
          data.level || 'N/A',
          `${data.points || 0} pts`
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Criterion', 'Level', 'Points']],
          body: criteriaData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 60 },
            2: { cellWidth: 30, halign: 'center' }
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 12;
      }
    });
  }

  // Instructor Notes Section
  if (data.notes.length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Instructor Notes', 14, yPosition);
    yPosition += 10;

    data.notes.forEach((note, index) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${note.title}`, 14, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(`Category: ${note.category} | Date: ${new Date(note.createdAt).toLocaleDateString()} | By: ${note.createdBy}`, 14, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(note.content, pageWidth - 28);
      doc.text(noteLines, 14, yPosition);
      yPosition += noteLines.length * 5 + 10;
    });
  }

  // Footer on all pages
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Page ${i} of ${pageCount} | Student Tracking System | Confidential`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

/**
 * Generate PDF for individual assignment evaluation
 */
export async function generateEvaluationPDF(evaluation: StudentEvaluation, studentInfo: any): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Assignment Evaluation Report', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // Student & Assignment Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Student & Assignment Details', 14, yPosition);
  yPosition += 8;

  const detailsInfo = [
    ['Student:', studentInfo.fullName],
    ['Student ID:', studentInfo.studentId],
    ['Assignment:', evaluation.assignmentTitle],
    ['Submitted:', new Date(evaluation.submittedAt).toLocaleDateString()],
    ['Score:', `${evaluation.score}/${evaluation.maxScore} (${evaluation.percentage.toFixed(1)}%)`]
  ];

  autoTable(doc, {
    startY: yPosition,
    body: detailsInfo,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Criteria Breakdown
  if (evaluation.criteriaScores && Object.keys(evaluation.criteriaScores).length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Criteria Breakdown', 14, yPosition);
    yPosition += 8;

    const criteriaData = Object.entries(evaluation.criteriaScores).map(([criterion, data]: [string, any]) => [
      criterion,
      data.level || 'N/A',
      `${data.points || 0}`,
      data.justification || 'No justification provided'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Criterion', 'Level', 'Points', 'Justification']],
      body: criteriaData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 'auto' }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Feedback Section
  if (evaluation.feedback) {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Feedback', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const feedbackLines = doc.splitTextToSize(evaluation.feedback, pageWidth - 28);
    doc.text(feedbackLines, 14, yPosition);
    yPosition += feedbackLines.length * 5 + 12;
  }

  // Strengths
  if (evaluation.strengths) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Strengths', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const strengthLines = doc.splitTextToSize(evaluation.strengths, pageWidth - 28);
    doc.text(strengthLines, 14, yPosition);
    yPosition += strengthLines.length * 5 + 12;
  }

  // Areas for Improvement
  if (evaluation.improvements) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Areas for Improvement', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const improvementLines = doc.splitTextToSize(evaluation.improvements, pageWidth - 28);
    doc.text(improvementLines, 14, yPosition);
    yPosition += improvementLines.length * 5 + 12;
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Page ${i} of ${pageCount} | Student Tracking System | Confidential`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

/**
 * Helper to download PDF blob
 */
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Record of Discussion PDF
 */
interface RecordOfDiscussionData {
  student: {
    studentId: string;
    fullName: string;
    email: string;
    phone: string;
  };
  discussionDate: Date | string;
  discussionTime: string;
  companyNameLocation: string;
  conductorName: string;
  conductorRole: string;
  peoplePresent?: string;
  discussedTopics?: string;
  studentActions?: string;
  evidenceAvailable?: string;
  followUpAttendance?: string;
  attendanceRecorded: boolean;
  attendanceSessions?: number;
  challengesEncountered?: string;
  interestingCases?: string;
  skillsCompleted?: Record<string, boolean>;
  sa2Discussion?: string;
  assessmentCriteriaMet?: string;
  conductorSignature?: string;
  conductorSignatureDate?: Date | string;
  studentSignature?: string;
  studentSignatureDate?: Date | string;
}

export async function generateRecordOfDiscussionPDF(record: RecordOfDiscussionData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - 2 * margin;

  let yPos = margin;

  // Helper functions
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
  };

  const drawCell = (
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    isHeader = false,
    align: 'left' | 'center' | 'right' = 'left'
  ) => {
    // Draw border
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.rect(x, y, width, height);

    // Fill header background
    if (isHeader) {
      doc.setFillColor(30, 58, 138);
      doc.rect(x, y, width, height, 'F');
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(0, 0, 0);
    }

    // Add text
    doc.setFontSize(10);
    const textX = align === 'center' ? x + width / 2 : x + 2;
    const textY = y + height / 2 + 1.5;

    if (text) {
      const lines = doc.splitTextToSize(text, width - 4);
      const lineHeight = 5;
      const startY = textY - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line: string, index: number) => {
        doc.text(line, textX, startY + index * lineHeight, {
          align: align,
        });
      });
    }
  };

  const drawCheckbox = (x: number, y: number, checked: boolean, label: string) => {
    // Draw checkbox
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.rect(x, y, 4, 4);

    if (checked) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('✓', x + 0.5, y + 3.5);
      doc.setFont('helvetica', 'normal');
    }

    // Draw label
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(label, x + 6, y + 3);
  };

  const addSignature = async (signatureData: string | undefined, x: number, y: number, width: number, height: number) => {
    if (signatureData && signatureData.startsWith('data:image')) {
      try {
        doc.addImage(signatureData, 'PNG', x + 2, y + 2, width - 4, height - 4);
      } catch (error) {
        console.error('Error adding signature:', error);
      }
    }
  };

  // Title
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, yPos, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RECORD OF DISCUSSION', pageWidth / 2, yPos + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');

  yPos += 15;

  // Header information
  const headerRowHeight = 8;

  // Row 1: Student Name and ID
  drawCell(margin, yPos, 50, headerRowHeight, 'Student Name', true);
  drawCell(margin + 50, yPos, 80, headerRowHeight, `${record.student.fullName} (${record.student.studentId})`);
  drawCell(margin + 130, yPos, 30, headerRowHeight, 'Student ID #', true);
  drawCell(margin + 160, yPos, 30, headerRowHeight, record.student.studentId);
  yPos += headerRowHeight;

  // Row 2: Discussion Date and Time
  drawCell(margin, yPos, 50, headerRowHeight, 'Discussion Date', true);
  drawCell(margin + 50, yPos, 80, headerRowHeight, formatDate(record.discussionDate));
  drawCell(margin + 130, yPos, 30, headerRowHeight, 'Discussion Time', true);
  drawCell(margin + 160, yPos, 30, headerRowHeight, record.discussionTime || '');
  yPos += headerRowHeight;

  // Row 3: Company Name
  drawCell(margin, yPos, 50, headerRowHeight, 'Company Name & Workplace Location', true);
  drawCell(margin + 50, yPos, 140, headerRowHeight, record.companyNameLocation || '');
  yPos += headerRowHeight;

  // Row 4: Conductor Name
  drawCell(margin, yPos, 50, headerRowHeight, 'Name of Person Conducting Discussion', true);
  drawCell(margin + 50, yPos, 140, headerRowHeight, record.conductorName || '');
  yPos += headerRowHeight;

  // Row 5: Conductor Role
  drawCell(margin, yPos, 50, headerRowHeight, 'Role of Person Conducting Discussion', true);
  const roleX = margin + 52;
  const roleY = yPos + 3;
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.rect(margin + 50, yPos, 140, headerRowHeight);

  drawCheckbox(roleX, roleY, record.conductorRole === 'Work Supervisor', 'Work Supervisor');
  drawCheckbox(roleX + 60, roleY, record.conductorRole === 'HCT Mentor', 'HCT Mentor');
  yPos += headerRowHeight + 3;

  // Record of Discussion section
  drawCell(margin, yPos, contentWidth, 10, 'Record of the Discussion', true);
  yPos += 10;

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const instructions = [
    '• The people present',
    '• What you discussed/questions/answers',
    '• What the student did',
    '• Any audio or visual evidence available'
  ];

  instructions.forEach((instruction, index) => {
    doc.text(instruction, margin + 2, yPos + 4 + (index * 4));
  });
  yPos += 20;

  // Content sections
  const contentSections = [
    { label: 'Follow-up Meeting with Student - Attendance:', content: record.followUpAttendance || '' },
    { label: 'Challenging/Interesting Cases:', content: record.interestingCases || '' },
  ];

  contentSections.forEach(section => {
    drawCell(margin, yPos, contentWidth, 8, section.label, true);
    yPos += 8;

    const cellHeight = 25;
    drawCell(margin, yPos, contentWidth, cellHeight, section.content);
    yPos += cellHeight + 2;
  });

  // Skills Completed
  drawCell(margin, yPos, contentWidth, 8, 'Skills Completed:', true);
  yPos += 8;

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Patient assessment including:', margin + 2, yPos + 4);
  yPos += 7;

  const skills = record.skillsCompleted
    ? Object.entries(record.skillsCompleted)
        .filter(([_, value]) => value === true)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
    : [];

  skills.forEach((skill, index) => {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
    }
    doc.text(`• ${skill}`, margin + 4, yPos + (index * 4));
  });
  yPos += Math.max(skills.length * 4, 15);

  // SA2 Discussion
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = margin;
  }

  drawCell(margin, yPos, contentWidth, 8, 'Discussion on SA 2 Assessment:', true);
  yPos += 8;

  const sa2Content = record.sa2Discussion || 'Reviewed requirements for the upcoming PP presentation and video submission: hand over';
  drawCell(margin, yPos, contentWidth, 20, sa2Content);
  yPos += 25;

  // Signatures
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = margin;
  }

  const signatureHeight = 25;

  // Conductor Signature
  drawCell(margin, yPos, 50, signatureHeight, 'Signature of the Person\nConducting Discussion', true);
  drawCell(margin + 50, yPos, 80, signatureHeight, '');
  if (record.conductorSignature) {
    await addSignature(record.conductorSignature, margin + 50, yPos, 80, signatureHeight);
  }
  drawCell(margin + 130, yPos, 30, signatureHeight, 'Date', true);
  drawCell(margin + 160, yPos, 30, signatureHeight, formatDate(record.conductorSignatureDate));
  yPos += signatureHeight;

  // Student Signature
  drawCell(margin, yPos, 50, signatureHeight, 'Signature of Student', true);
  drawCell(margin + 50, yPos, 80, signatureHeight, '');
  if (record.studentSignature) {
    await addSignature(record.studentSignature, margin + 50, yPos, 80, signatureHeight);
  }
  drawCell(margin + 130, yPos, 30, signatureHeight, 'Date', true);
  drawCell(margin + 160, yPos, 30, signatureHeight, formatDate(record.studentSignatureDate));

  return doc.output('blob');
}

/**
 * Generate AEM230 Record of Discussion PDF - Professional format with HCT branding
 */
export async function generateAEM230PDF(formData: any): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 10;

  // Helper function to draw bordered cells with enhanced styling
  const drawCell = (x: number, y: number, width: number, height: number, text: string, isBold = false, fontSize = 10, fillColor?: [number, number, number]) => {
    // Draw border
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.5);
    doc.rect(x, y, width, height);

    // Fill background if specified
    if (fillColor) {
      doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      doc.rect(x, y, width, height, 'F');
      doc.rect(x, y, width, height); // Redraw border
    }

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(0, 0, 0);

    const lines = doc.splitTextToSize(text, width - 4);
    const lineHeight = fontSize * 0.35;
    const textY = y + 5 + (lineHeight / 2);

    lines.forEach((line: string, index: number) => {
      doc.text(line, x + 2, textY + (index * lineHeight));
    });
  };

  // Helper to add signature image
  const addSignature = async (signatureData: string, x: number, y: number, width: number, height: number) => {
    if (signatureData && signatureData.startsWith('data:image')) {
      try {
        doc.addImage(signatureData, 'PNG', x + 2, y + 2, width - 4, height - 4);
      } catch (error) {
        console.error('Error adding signature:', error);
      }
    }
  };

  // Add HCT Logo and Header
  try {
    // HCT Brand Colors - Blue header
    doc.setFillColor(0, 51, 102); // HCT Navy Blue
    doc.rect(0, 0, pageWidth, 35, 'F');

    // HCT Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Higher Colleges of Technology', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Emergency Medical Services Program', pageWidth / 2, 23, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPos = 40;
  } catch (error) {
    console.error('Error adding header:', error);
    yPos = 15;
  }

  // Document Title with professional styling
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text('CLINICAL VISIT RECORD OF DISCUSSION', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Form number
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Form AEM230-10', pageWidth / 2, yPos, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  // Student Information Table with professional header
  const row1Height = 10;
  const headerColor: [number, number, number] = [230, 240, 250]; // Light blue
  drawCell(margin, yPos, contentWidth * 0.4, row1Height, 'Student Name', true, 10, headerColor);
  drawCell(margin + (contentWidth * 0.4), yPos, contentWidth * 0.4, row1Height, formData.studentName);
  drawCell(margin + (contentWidth * 0.8), yPos, contentWidth * 0.15, row1Height, 'Student ID #', true, 10, headerColor);
  drawCell(margin + (contentWidth * 0.95), yPos, contentWidth * 0.05, row1Height, formData.studentIdNumber);
  yPos += row1Height;

  // Discussion Details Table
  yPos += 5;
  const row2Height = 10;

  // Row 1: Discussion Date and Time
  drawCell(margin, yPos, contentWidth * 0.25, row2Height, 'Discussion Date', true, 10, headerColor);
  drawCell(margin + (contentWidth * 0.25), yPos, contentWidth * 0.25, row2Height, formData.discussionDate);
  drawCell(margin + (contentWidth * 0.5), yPos, contentWidth * 0.25, row2Height, 'Discussion Time', true, 10, headerColor);
  drawCell(margin + (contentWidth * 0.75), yPos, contentWidth * 0.25, row2Height, formData.discussionTime);
  yPos += row2Height;

  // Row 2: Company Name and Workplace Location
  drawCell(margin, yPos, contentWidth * 0.25, row2Height * 2, 'Company Name &\nWorkplace Location', true, 10, headerColor);
  drawCell(margin + (contentWidth * 0.25), yPos, contentWidth * 0.75, row2Height * 2, `${formData.companyName}\n${formData.workplaceLocation}`);
  yPos += row2Height * 2;

  // Row 3: Conductor Name
  drawCell(margin, yPos, contentWidth * 0.25, row2Height, 'Name of Person Conducting Discussion', true, 10, headerColor);
  drawCell(margin + (contentWidth * 0.25), yPos, contentWidth * 0.75, row2Height, formData.conductorName);
  yPos += row2Height;

  // Row 4: Conductor Role
  drawCell(margin, yPos, contentWidth * 0.25, row2Height, 'Role of Person Conducting Discussion', true, 10, headerColor);
  drawCell(margin + (contentWidth * 0.25), yPos, contentWidth * 0.75, row2Height, formData.conductorRole);
  yPos += row2Height;

  // Discussion Record Table
  yPos += 5;

  // Build skills list
  const skillsList = [];
  if (formData.skillsCompleted.bloodPressure) skillsList.push('Blood Pressure (BP)');
  if (formData.skillsCompleted.temperature) skillsList.push('Temperature (Temp)');
  if (formData.skillsCompleted.respiratoryRate) skillsList.push('Respiratory Rate (RR)');
  if (formData.skillsCompleted.heartRate) skillsList.push('Heart Rate (HR)');
  if (formData.skillsCompleted.woundCare) skillsList.push('Wound Care');
  if (formData.skillsCompleted.sutures) skillsList.push('Sutures - Observed');
  if (formData.skillsCompleted.ecg) skillsList.push('ECG');
  if (formData.skillsCompleted.nasalSwabs) skillsList.push('Nasal and Throat Swabs - Observed');
  if (formData.skillsCompleted.xrays) skillsList.push('X-rays Observation - Observed');
  if (formData.skillsCompleted.lucas) skillsList.push('Lucas Mechanical Device');
  if (formData.skillsCompleted.hgt) skillsList.push('HGT Recording - Observed');
  if (formData.skillsCompleted.arterialBloodGases) skillsList.push('Arterial Blood Gases - Observed');
  if (formData.skillsCompleted.theatre) skillsList.push('Theatre Observation');
  if (formData.skillsCompleted.imInjection) skillsList.push('IM Injection');
  if (formData.skillsCompleted.bandaging) skillsList.push('Bandaging');
  if (formData.skillsCompleted.communication) skillsList.push('Communication and Translation');

  // Construct discussion content
  let discussionContent = '';

  if (formData.peoplePresent) {
    discussionContent += `People Present:\n${formData.peoplePresent}\n\n`;
  }

  if (formData.attendance) {
    discussionContent += `Attendance:\n${formData.attendance}\n\n`;
  }

  if (formData.challenges) {
    discussionContent += `Challenges at the Hospital:\n${formData.challenges}\n\n`;
  }

  if (formData.interestingCases) {
    discussionContent += `Interesting Cases:\n${formData.interestingCases}\n\n`;
  }

  if (skillsList.length > 0) {
    discussionContent += `Skills Completed:\n${skillsList.join('\n')}\n\n`;
  }

  if (formData.sa2Discussion) {
    discussionContent += `Discussion on SA2 Assessment:\n${formData.sa2Discussion}`;
  }

  // Record of Discussion - Left column
  const discussionHeight = 100;
  drawCell(margin, yPos, contentWidth * 0.65, discussionHeight,
    'Record of the Discussion\n\nPlease include:\n• The people present\n• What you discussed/questions/answers\n• What the student did\n• Any audio or visual evidence available', true, 9);
  yPos += 15;

  // Discussion content
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const discussionLines = doc.splitTextToSize(discussionContent, (contentWidth * 0.65) - 6);
  let discussionY = yPos;
  discussionLines.forEach((line: string) => {
    if (discussionY < yPos + discussionHeight - 20) {
      doc.text(line, margin + 3, discussionY);
      discussionY += 3;
    }
  });

  // Assessment Criteria - Right column
  const assessmentY = yPos - 15;
  drawCell(margin + (contentWidth * 0.65), assessmentY, contentWidth * 0.35, discussionHeight,
    'Assessment Criteria Met\n\n' + (formData.assessmentCriteriaMet || ''), false, 9);

  yPos = assessmentY + discussionHeight + 5;

  // Signatures section
  const signatureHeight = 25;

  // Conductor Signature
  drawCell(margin, yPos, contentWidth * 0.4, signatureHeight, 'Signature of Person\nConducting Discussion', true, 10, headerColor);
  drawCell(margin + (contentWidth * 0.4), yPos, contentWidth * 0.35, signatureHeight, '');
  if (formData.conductorSignature) {
    await addSignature(formData.conductorSignature, margin + (contentWidth * 0.4), yPos, contentWidth * 0.35, signatureHeight);
  }
  drawCell(margin + (contentWidth * 0.75), yPos, contentWidth * 0.1, signatureHeight, 'Date', true, 10, headerColor);
  drawCell(margin + (contentWidth * 0.85), yPos, contentWidth * 0.15, signatureHeight, formData.conductorSignatureDate);
  yPos += signatureHeight;

  // Student Signature
  drawCell(margin, yPos, contentWidth * 0.4, signatureHeight, 'Signature of Student', true, 10, headerColor);
  drawCell(margin + (contentWidth * 0.4), yPos, contentWidth * 0.35, signatureHeight, '');
  if (formData.studentSignature) {
    await addSignature(formData.studentSignature, margin + (contentWidth * 0.4), yPos, contentWidth * 0.35, signatureHeight);
  }
  drawCell(margin + (contentWidth * 0.75), yPos, contentWidth * 0.1, signatureHeight, 'Date', true, 10, headerColor);
  drawCell(margin + (contentWidth * 0.85), yPos, contentWidth * 0.15, signatureHeight, formData.studentSignatureDate);

  // Add professional footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Higher Colleges of Technology - Emergency Medical Services Program', margin, footerY);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, footerY, { align: 'right' });
  doc.text('Page 1 of 1', pageWidth / 2, footerY, { align: 'center' });

  // Convert to buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

/**
 * Generate Site Visit PDF with signatures
 */
interface SiteVisitData {
  id: string;
  visitDate: Date | string;
  visitTime?: string;
  purpose?: string;
  duration?: number;
  generalNotes?: string;
  mentorFeedback?: string;
  areasOfConcern?: string;
  recommendations?: string;
  followUpRequired: boolean;
  followUpDate?: Date | string;
  instructorSignature?: string;
  instructorSignatureDate?: Date | string;
  instructorName?: string;
  studentSignature?: string;
  studentSignatureDate?: Date | string;
  status: string;
  completedAt?: Date | string;
  site: {
    name: string;
    type: string;
    address?: string;
    city?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  studentNotes: Array<{
    student: {
      fullName: string;
      studentId: string;
      email: string;
      module?: {
        code: string;
        name: string;
      };
    };
    performance?: string;
    strengths?: string;
    areasForDevelopment?: string;
    mentorComments?: string;
    studentReflection?: string;
    skillsAssessed: string[];
    attendanceStatus: string;
    hoursCompleted?: number;
    concerns?: string;
    actionItems?: string;
    grade?: string;
  }>;
}

export async function generateSiteVisitPDF(visit: SiteVisitData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 10;

  // Helper functions
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
  };

  const drawCell = (
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    isHeader = false,
    fontSize = 10,
    fillColor?: [number, number, number]
  ) => {
    // Draw border
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.rect(x, y, width, height);

    // Fill background if specified
    if (fillColor) {
      doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      doc.rect(x, y, width, height, 'F');
      doc.rect(x, y, width, height); // Redraw border
    } else if (isHeader) {
      doc.setFillColor(30, 58, 138);
      doc.rect(x, y, width, height, 'F');
      doc.rect(x, y, width, height);
    }

    // Set text color
    doc.setTextColor(isHeader ? 255 : 0, isHeader ? 255 : 0, isHeader ? 255 : 0);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isHeader ? 'bold' : 'normal');

    if (text) {
      const lines = doc.splitTextToSize(text, width - 4);
      const lineHeight = fontSize * 0.35;
      const textY = y + 5 + (lineHeight / 2);

      lines.forEach((line: string, index: number) => {
        doc.text(line, x + 2, textY + (index * lineHeight));
      });
    }

    // Reset text color
    doc.setTextColor(0, 0, 0);
  };

  const addSignature = async (
    signatureData: string | undefined,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    if (signatureData && signatureData.startsWith('data:image')) {
      try {
        doc.addImage(signatureData, 'PNG', x + 2, y + 2, width - 4, height - 4);
      } catch (error) {
        console.error('Error adding signature:', error);
      }
    }
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Title Header
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SITE VISIT REPORT', pageWidth / 2, 12, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(visit.site.name, pageWidth / 2, 20, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  yPos = 35;

  // Site Information
  const headerColor: [number, number, number] = [230, 240, 250];
  drawCell(margin, yPos, contentWidth, 8, 'SITE INFORMATION', true, 11);
  yPos += 8;

  const siteInfo = [
    ['Site Name:', visit.site.name],
    ['Site Type:', visit.site.type],
    ['Address:', visit.site.address || 'N/A'],
    ['City:', visit.site.city || 'N/A'],
    ['Contact Person:', visit.site.contactPerson || 'N/A'],
    ['Contact Email:', visit.site.contactEmail || 'N/A'],
    ['Contact Phone:', visit.site.contactPhone || 'N/A']
  ];

  siteInfo.forEach(([label, value]) => {
    drawCell(margin, yPos, contentWidth * 0.35, 7, label, false, 9, headerColor);
    drawCell(margin + contentWidth * 0.35, yPos, contentWidth * 0.65, 7, value, false, 9);
    yPos += 7;
  });

  yPos += 5;
  checkPageBreak(40);

  // Visit Details
  drawCell(margin, yPos, contentWidth, 8, 'VISIT DETAILS', true, 11);
  yPos += 8;

  const visitInfo = [
    ['Visit Date:', formatDate(visit.visitDate)],
    ['Visit Time:', visit.visitTime || 'N/A'],
    ['Duration:', visit.duration ? `${visit.duration} minutes` : 'N/A'],
    ['Purpose:', visit.purpose || 'N/A'],
    ['Instructor:', visit.instructorName || 'N/A']
  ];

  visitInfo.forEach(([label, value]) => {
    drawCell(margin, yPos, contentWidth * 0.35, 7, label, false, 9, headerColor);
    drawCell(margin + contentWidth * 0.35, yPos, contentWidth * 0.65, 7, value, false, 9);
    yPos += 7;
  });

  yPos += 5;
  checkPageBreak(50);

  // General Notes
  if (visit.generalNotes) {
    drawCell(margin, yPos, contentWidth, 8, 'GENERAL NOTES', true, 10);
    yPos += 8;
    const noteHeight = 25;
    drawCell(margin, yPos, contentWidth, noteHeight, visit.generalNotes, false, 9);
    yPos += noteHeight + 3;
    checkPageBreak(40);
  }

  // Mentor Feedback
  if (visit.mentorFeedback) {
    drawCell(margin, yPos, contentWidth, 8, 'MENTOR FEEDBACK', true, 10);
    yPos += 8;
    const feedbackHeight = 25;
    drawCell(margin, yPos, contentWidth, feedbackHeight, visit.mentorFeedback, false, 9);
    yPos += feedbackHeight + 3;
    checkPageBreak(40);
  }

  // Areas of Concern
  if (visit.areasOfConcern) {
    drawCell(margin, yPos, contentWidth, 8, 'AREAS OF CONCERN', true, 10);
    yPos += 8;
    const concernHeight = 20;
    drawCell(margin, yPos, contentWidth, concernHeight, visit.areasOfConcern, false, 9);
    yPos += concernHeight + 3;
    checkPageBreak(40);
  }

  // Recommendations
  if (visit.recommendations) {
    drawCell(margin, yPos, contentWidth, 8, 'RECOMMENDATIONS', true, 10);
    yPos += 8;
    const recHeight = 20;
    drawCell(margin, yPos, contentWidth, recHeight, visit.recommendations, false, 9);
    yPos += recHeight + 3;
    checkPageBreak(40);
  }

  // Follow-up
  if (visit.followUpRequired) {
    drawCell(margin, yPos, contentWidth * 0.6, 7, 'Follow-up Required: YES', false, 9, [255, 240, 200]);
    drawCell(margin + contentWidth * 0.6, yPos, contentWidth * 0.4, 7,
      `Follow-up Date: ${formatDate(visit.followUpDate)}`, false, 9, [255, 240, 200]);
    yPos += 10;
  }

  // Student Evaluations
  if (visit.studentNotes && visit.studentNotes.length > 0) {
    checkPageBreak(50);
    drawCell(margin, yPos, contentWidth, 8, `STUDENT EVALUATIONS (${visit.studentNotes.length})`, true, 11);
    yPos += 10;

    visit.studentNotes.forEach((note, index) => {
      checkPageBreak(80);

      // Student Header
      doc.setFillColor(240, 245, 250);
      doc.rect(margin, yPos, contentWidth, 10, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `${index + 1}. ${note.student.fullName} (${note.student.studentId})`,
        margin + 2,
        yPos + 6
      );
      if (note.student.module) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(
          `${note.student.module.code} - ${note.student.module.name}`,
          margin + 2,
          yPos + 9
        );
      }
      yPos += 12;

      // Performance & Attendance
      const perfInfo = [
        ['Performance:', note.performance || 'N/A'],
        ['Attendance:', note.attendanceStatus.toUpperCase()],
        ['Hours Completed:', note.hoursCompleted?.toString() || '0'],
        ['Grade:', note.grade || 'N/A']
      ];

      perfInfo.forEach(([label, value]) => {
        drawCell(margin, yPos, contentWidth * 0.3, 6, label, false, 8, headerColor);
        drawCell(margin + contentWidth * 0.3, yPos, contentWidth * 0.7, 6, value, false, 8);
        yPos += 6;
      });

      yPos += 2;

      // Skills Assessed
      if (note.skillsAssessed && note.skillsAssessed.length > 0) {
        drawCell(margin, yPos, contentWidth * 0.3, 6, 'Skills Assessed:', false, 8, headerColor);
        drawCell(margin + contentWidth * 0.3, yPos, contentWidth * 0.7, 6,
          note.skillsAssessed.join(', '), false, 8);
        yPos += 8;
      }

      // Strengths
      if (note.strengths) {
        drawCell(margin, yPos, contentWidth, 6, 'Strengths:', false, 9, [240, 255, 240]);
        yPos += 6;
        const strengthHeight = Math.min(15, Math.ceil(note.strengths.length / 80) * 5);
        drawCell(margin, yPos, contentWidth, strengthHeight, note.strengths, false, 8);
        yPos += strengthHeight + 2;
      }

      // Areas for Development
      if (note.areasForDevelopment) {
        drawCell(margin, yPos, contentWidth, 6, 'Areas for Development:', false, 9, [255, 245, 230]);
        yPos += 6;
        const devHeight = Math.min(15, Math.ceil(note.areasForDevelopment.length / 80) * 5);
        drawCell(margin, yPos, contentWidth, devHeight, note.areasForDevelopment, false, 8);
        yPos += devHeight + 2;
      }

      // Mentor Comments
      if (note.mentorComments) {
        drawCell(margin, yPos, contentWidth, 6, 'Mentor Comments:', false, 9, headerColor);
        yPos += 6;
        const commentHeight = Math.min(15, Math.ceil(note.mentorComments.length / 80) * 5);
        drawCell(margin, yPos, contentWidth, commentHeight, note.mentorComments, false, 8);
        yPos += commentHeight + 2;
      }

      // Student Reflection
      if (note.studentReflection) {
        drawCell(margin, yPos, contentWidth, 6, 'Student Reflection:', false, 9, [245, 245, 255]);
        yPos += 6;
        const reflectionHeight = Math.min(15, Math.ceil(note.studentReflection.length / 80) * 5);
        drawCell(margin, yPos, contentWidth, reflectionHeight, note.studentReflection, false, 8);
        yPos += reflectionHeight + 2;
      }

      // Concerns & Action Items
      if (note.concerns || note.actionItems) {
        const concernsWidth = note.actionItems ? contentWidth * 0.5 : contentWidth;
        if (note.concerns) {
          drawCell(margin, yPos, concernsWidth, 6, 'Concerns:', false, 8, [255, 240, 240]);
          yPos += 6;
          const concernHeight = Math.min(12, Math.ceil(note.concerns.length / 40) * 5);
          drawCell(margin, yPos, concernsWidth - 1, concernHeight, note.concerns, false, 7);
          yPos -= 6; // Reset for action items on same row
        }

        if (note.actionItems) {
          const actionX = note.concerns ? margin + contentWidth * 0.5 + 1 : margin;
          const actionWidth = note.concerns ? contentWidth * 0.5 - 1 : contentWidth;
          drawCell(actionX, yPos, actionWidth, 6, 'Action Items:', false, 8, [240, 255, 240]);
          yPos += 6;
          const actionHeight = Math.min(12, Math.ceil(note.actionItems.length / 40) * 5);
          drawCell(actionX, yPos, actionWidth, actionHeight, note.actionItems, false, 7);
        }
        yPos += 14;
      }

      yPos += 5;
    });
  }

  // Signatures
  checkPageBreak(60);
  drawCell(margin, yPos, contentWidth, 8, 'SIGNATURES', true, 11);
  yPos += 10;

  const signatureHeight = 25;

  // Instructor Signature
  drawCell(margin, yPos, contentWidth * 0.3, signatureHeight, 'Instructor Signature:', true, 9, headerColor);
  drawCell(margin + contentWidth * 0.3, yPos, contentWidth * 0.4, signatureHeight, '');
  if (visit.instructorSignature) {
    await addSignature(visit.instructorSignature, margin + contentWidth * 0.3, yPos, contentWidth * 0.4, signatureHeight);
  }
  drawCell(margin + contentWidth * 0.7, yPos, contentWidth * 0.15, signatureHeight, 'Date:', true, 9, headerColor);
  drawCell(margin + contentWidth * 0.85, yPos, contentWidth * 0.15, signatureHeight,
    formatDate(visit.instructorSignatureDate), false, 8);
  yPos += signatureHeight + 2;

  // Student Signature (if available)
  if (visit.studentSignature) {
    drawCell(margin, yPos, contentWidth * 0.3, signatureHeight, 'Student Signature:', true, 9, headerColor);
    drawCell(margin + contentWidth * 0.3, yPos, contentWidth * 0.4, signatureHeight, '');
    await addSignature(visit.studentSignature, margin + contentWidth * 0.3, yPos, contentWidth * 0.4, signatureHeight);
    drawCell(margin + contentWidth * 0.7, yPos, contentWidth * 0.15, signatureHeight, 'Date:', true, 9, headerColor);
    drawCell(margin + contentWidth * 0.85, yPos, contentWidth * 0.15, signatureHeight,
      formatDate(visit.studentSignatureDate), false, 8);
    yPos += signatureHeight + 2;
  }

  // Status Badge
  yPos += 5;
  const statusColor: [number, number, number] =
    visit.status === 'completed' ? [34, 197, 94] : [234, 179, 8];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.rect(margin, yPos, 30, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(visit.status.toUpperCase(), margin + 15, yPos + 5, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  if (visit.completedAt) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Completed: ${formatDate(visit.completedAt)}`, margin + 35, yPos + 5);
  }

  // Footer on all pages
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Site Visit Report | ${visit.site.name} | ${formatDate(visit.visitDate)}`,
      margin,
      pageHeight - 7
    );
    doc.text(
      `Page ${i} of ${pageCount} | Generated: ${formatDate(new Date())}`,
      pageWidth - margin,
      pageHeight - 7,
      { align: 'right' }
    );
    doc.text(
      'Student Tracking System | Confidential',
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    );
  }

  // Convert to buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}
