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
