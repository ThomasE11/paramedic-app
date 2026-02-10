import type { CaseScenario, CaseSession } from '@/types';

interface ExportOptions {
  session: CaseSession;
  caseData: CaseScenario;
  elapsedTime?: string;
}

/**
 * Load jsPDF dynamically from CDN (works better with Vite than npm package)
 */
async function loadJsPDF(): Promise<any> {
  if ((window as any).jspdf?.jsPDF) {
    return (window as any).jspdf.jsPDF;
  }

  // Load jsPDF from unpkg CDN
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/jspdf@4.0.0/dist/jspdf.umd.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });

  return (window as any).jspdf.jsPDF;
}

/**
 * Generate a PDF export of the session summary
 */
export async function exportSessionToPDF(options: ExportOptions): Promise<void> {
  const { session, caseData, elapsedTime } = options;

  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number): boolean => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal', rgbColor: [number, number, number] = [0, 0, 0]): number => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(rgbColor[0], rgbColor[1], rgbColor[2]);

    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.5;

    (lines as string[]).forEach((line: string) => {
      if (yPosition > pageHeight - margin - lineHeight) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    return yPosition;
  };

  // Helper function to add a section header
  const addSectionHeader = (text: string): void => {
    yPosition += 8;
    checkPageBreak(15);
    doc.setDrawColor(59, 130, 246); // Primary blue color
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);
    addText(text, 14, 'bold', [59, 130, 246]);
  };

  // Helper function to add a rounded rect with fill
  // jsPDF v4 requires separate rx, ry radius values
  const addFilledRoundedRect = (x: number, y: number, w: number, h: number, r: number, rgbColor: [number, number, number]): void => {
    doc.setFillColor(rgbColor[0], rgbColor[1], rgbColor[2]);
    doc.roundedRect(x, y, w, h, r, r, 'F');
  };

  // Helper function to add a rounded rect with stroke
  const addStrokeRoundedRect = (x: number, y: number, w: number, h: number, r: number, rgbColor: [number, number, number]): void => {
    doc.setDrawColor(rgbColor[0], rgbColor[1], rgbColor[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, r, r, 'S');
  };

  // Helper function to add text at position
  const addTextAt = (text: string, x: number, y: number, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal', rgbColor: [number, number, number] = [0, 0, 0]): void => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(rgbColor[0], rgbColor[1], rgbColor[2]);
    doc.text(text, x, y);
  };

  // Helper function to add centered text
  const addCenteredText = (text: string, y: number, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal'): void => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.text(text, pageWidth / 2, y, { align: 'center' } as never);
  };

  // ========== HEADER ==========
  // Title background
  addFilledRoundedRect(0, 0, pageWidth, 35, 0, [59, 130, 246]);

  addCenteredText('UAE Paramedic Case Generator', 15, 22, 'bold');
  addCenteredText('Session Summary Report', 23, 12);
  addCenteredText(`Generated: ${new Date().toLocaleString('en-GB')}`, 30, 9);

  yPosition = 45;

  // ========== CASE INFORMATION ==========
  addSectionHeader('Case Information');

  const caseInfo = [
    [`Case Title:`, caseData.title],
    [`Category:`, caseData.category],
    [`Priority:`, caseData.priority.toUpperCase()],
    [`Complexity:`, caseData.complexity.toUpperCase()],
    [`Year Level:`, session.studentYear],
    [`Patient:`, `${caseData.patientInfo.age}y ${caseData.patientInfo.gender}`],
    [`Location:`, caseData.dispatchInfo.location],
  ];

  caseInfo.forEach(([label, value]) => {
    addTextAt(label, margin, yPosition, 10, 'bold', [0, 0, 0]);
    addTextAt(value, margin + 35, yPosition, 10, 'normal', [60, 60, 60]);
    yPosition += 6;
  });

  // ========== DISPATCH INFO ==========
  yPosition += 5;
  addSectionHeader('Dispatch Information');

  const dispatchLines = [
    `Call Reason: ${caseData.dispatchInfo.callReason}`,
    `Time of Day: ${caseData.dispatchInfo.timeOfDay}`,
    `Caller Info: ${caseData.dispatchInfo.callerInfo}`,
  ];

  dispatchLines.forEach((line) => {
    const lines = doc.splitTextToSize(line, contentWidth);
    (lines as string[]).forEach((l: string) => {
      addTextAt(l, margin, yPosition, 10, 'normal', [60, 60, 60]);
      yPosition += 5;
    });
  });

  // ========== VITAL SIGNS ==========
  yPosition += 5;
  addSectionHeader('Initial Vital Signs');

  const vitals = caseData.vitalSignsProgression.initial;
  const vitalSignsParts: string[] = [`BP: ${vitals.bp}`, `Pulse: ${vitals.pulse} bpm`, `RR: ${vitals.respiration}/min`, `SpO2: ${vitals.spo2}%`];
  if (vitals.gcs !== undefined) vitalSignsParts.push(`GCS: ${vitals.gcs}/15`);
  if (vitals.temperature !== undefined) vitalSignsParts.push(`Temp: ${vitals.temperature}°C`);
  if (vitals.bloodGlucose !== undefined) vitalSignsParts.push(`Glucose: ${vitals.bloodGlucose} mmol/L`);

  addText(vitalSignsParts.join('    '), 10);

  // ========== SCORE SUMMARY ==========
  yPosition += 5;
  addSectionHeader('Performance Summary');

  const percentage = session.totalPossible > 0 ? Math.round((session.score / session.totalPossible) * 100) : 0;

  // Grade calculation
  let grade = 'Needs Improvement';
  let gradeColor: [number, number, number] = [239, 68, 68]; // red
  if (percentage >= 90) {
    grade = 'Excellent';
    gradeColor = [34, 197, 94]; // green
  } else if (percentage >= 75) {
    grade = 'Good';
    gradeColor = [59, 130, 246]; // blue
  } else if (percentage >= 60) {
    grade = 'Satisfactory';
    gradeColor = [234, 179, 8]; // yellow
  }

  // Add score card
  checkPageBreak(40);

  const scoreBoxY = yPosition;
  const scoreBoxHeight = 35;

  // Score card background
  addFilledRoundedRect(margin, scoreBoxY, contentWidth, scoreBoxHeight, 3, [248, 250, 252]);

  // Score circle
  addFilledRoundedRect(margin + 3, scoreBoxY + scoreBoxHeight / 2 - 12, 24, 24, 12, gradeColor);

  addTextAt(`${percentage}%`, margin + 15, scoreBoxY + scoreBoxHeight / 2 + 5, 14, 'bold', [255, 255, 255]);
  // Re-center the percentage text in the circle
  doc.text(`${percentage}%`, margin + 15, scoreBoxY + scoreBoxHeight / 2 + 5, { align: 'center' } as never);

  // Grade info
  addTextAt(grade, margin + 35, scoreBoxY + 12, 16, 'bold', gradeColor);
  addTextAt(`${session.score} points out of ${session.totalPossible} possible`, margin + 35, scoreBoxY + 22, 11, 'normal', [80, 80, 80]);

  // Time info
  if (elapsedTime) {
    addTextAt(`Time: ${elapsedTime}`, margin + 35, scoreBoxY + 30, 11, 'normal', [80, 80, 80]);
  }

  yPosition = scoreBoxY + scoreBoxHeight + 10;

  // ========== COMPLETED ITEMS ==========
  const completedItems = caseData.studentChecklist.filter(item => session.completedItems.includes(item.id));
  const missedItems = caseData.studentChecklist.filter(item =>
    !session.completedItems.includes(item.id) && item.yearLevel.includes(session.studentYear)
  );
  const criticalMissedItems = missedItems.filter(item => item.critical);

  if (completedItems.length > 0) {
    addSectionHeader('Completed Actions');

    completedItems.forEach((item) => {
      checkPageBreak(10);
      addFilledRoundedRect(margin, yPosition, contentWidth, 7, 1, [236, 253, 245]);
      addStrokeRoundedRect(margin, yPosition, contentWidth, 7, 1, [34, 197, 94]);

      addTextAt('✓', margin + 3, yPosition + 5, 9, 'bold', [34, 197, 94]);

      const text = item.description + (item.critical ? ' (Critical)' : '');
      const lines = doc.splitTextToSize(text, contentWidth - 12);
      addTextAt((lines as string[])[0], margin + 8, yPosition + 5, 9, 'normal', [60, 60, 60]);

      yPosition += 10;
    });
  }

  // ========== CRITICAL MISSED ITEMS ==========
  if (criticalMissedItems.length > 0) {
    addSectionHeader('CRITICAL - Missed Actions');

    addFilledRoundedRect(margin, yPosition, contentWidth, 6, 0, [254, 226, 226]);
    addTextAt('⚠ The following critical actions were missed:', margin + 3, yPosition + 4, 9, 'bold', [220, 38, 38]);
    yPosition += 10;

    criticalMissedItems.forEach((item) => {
      checkPageBreak(15);

      addStrokeRoundedRect(margin, yPosition, contentWidth, 12, 2, [239, 68, 68]);

      addTextAt('✗', margin + 3, yPosition + 5, 9, 'bold', [220, 38, 38]);

      const lines = doc.splitTextToSize(item.description, contentWidth - 10);
      (lines as string[]).forEach((line: string, i: number) => {
        addTextAt(line, margin + 8, yPosition + 5 + (i * 4), 9, 'normal', [60, 60, 60]);
      });

      yPosition += 14;
    });
  }

  // ========== OTHER MISSED ITEMS ==========
  const nonCriticalMissed = missedItems.filter(item => !item.critical);
  if (nonCriticalMissed.length > 0) {
    addSectionHeader('Other Items to Review');

    nonCriticalMissed.forEach((item) => {
      checkPageBreak(8);

      addStrokeRoundedRect(margin, yPosition, contentWidth, 6, 1, [251, 146, 60]);

      addTextAt('○', margin + 3, yPosition + 4, 9, 'bold', [251, 146, 60]);

      const truncatedText = item.description.length > 90
        ? item.description.substring(0, 87) + '...'
        : item.description;
      addTextAt(truncatedText, margin + 8, yPosition + 4, 9, 'normal', [80, 80, 80]);

      yPosition += 8;
    });
  }

  // ========== TEACHING POINTS ==========
  if (caseData.teachingPoints.length > 0) {
    addSectionHeader('Key Learning Points');

    caseData.teachingPoints.forEach((point, i) => {
      checkPageBreak(10);

      addFilledRoundedRect(margin, yPosition, 6, 6, 1, [239, 246, 255]);

      addTextAt(`${i + 1}`, margin + 3, yPosition + 4.5, 9, 'bold', [59, 130, 246]);

      const lines = doc.splitTextToSize(point, contentWidth - 12);
      (lines as string[]).forEach((line: string, idx: number) => {
        addTextAt(line, margin + 10, yPosition + 4.5 + (idx * 4), 9, 'normal', [60, 60, 60]);
      });

      yPosition += lines.length * 5 + 3;
    });
  }

  // ========== COMMON PITFALLS ==========
  if (caseData.commonPitfalls && caseData.commonPitfalls.length > 0) {
    addSectionHeader('Common Pitfalls to Avoid');

    caseData.commonPitfalls.forEach((pitfall) => {
      checkPageBreak(10);

      addTextAt('⚠', margin, yPosition + 3, 9, 'normal', [251, 146, 60]);

      const lines = doc.splitTextToSize(pitfall, contentWidth - 8);
      (lines as string[]).forEach((line: string, idx: number) => {
        addTextAt(line, margin + 6, yPosition + 3 + (idx * 4), 9, 'normal', [80, 80, 80]);
      });

      yPosition += lines.length * 5 + 2;
    });
  }

  // ========== INSTRUCTOR NOTES ==========
  if (session.notes) {
    addSectionHeader('Instructor Notes');

    const noteLines = doc.splitTextToSize(session.notes, contentWidth);
    (noteLines as string[]).forEach((line: string) => {
      checkPageBreak(6);
      addTextAt(line, margin, yPosition, 10, 'normal', [60, 60, 60]);
      yPosition += 5;
    });
  }

  // ========== FOOTER ==========
  const totalPages = (doc.internal.pages.length - 1) as number;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addCenteredText(
      `Page ${i} of ${totalPages}  |  UAE Paramedic Case Generator  |  Session ID: ${session.id}`,
      pageHeight - 10,
      8
    );
  }

  // Save the PDF using blob approach for better browser compatibility
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Case-${caseData.category}-${session.studentYear}-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
