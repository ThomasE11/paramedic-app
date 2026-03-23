import type { CaseScenario, CaseSession, AppliedTreatment, VitalSigns, SimulationObjective, DebriefingResource, InstructorAssessmentNote } from '@/types';
import { getVideosByFindings, getVideosByCategory, referenceArticles, getYouTubeWatchUrl } from '@/data/localClinicalResources';

interface ExportOptions {
  session: CaseSession;
  caseData: CaseScenario;
  elapsedTime?: string;
  appliedTreatments?: AppliedTreatment[];
  vitalsHistory?: VitalSigns[];
  instructorNotes?: string;
  instructorAssessmentNotes?: InstructorAssessmentNote[];
  simulationObjective?: SimulationObjective;
  debriefingResources?: DebriefingResource[];
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

  // Helper function to add a clickable link
  const addClickableLink = (text: string, url: string, x: number, y: number, fontSize: number): void => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(59, 130, 246); // Blue
    // Truncate long text
    const maxWidth = contentWidth - (x - margin) - 5;
    const truncated = doc.splitTextToSize(text, maxWidth)[0] as string;
    doc.textWithLink(truncated, x, y, { url });
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

  // ========== SIMULATION OBJECTIVE ==========
  if (options.simulationObjective) {
    yPosition += 5;
    addSectionHeader('Simulation Objective');

    addFilledRoundedRect(margin, yPosition, contentWidth, 18, 2, [239, 246, 255]);
    addStrokeRoundedRect(margin, yPosition, contentWidth, 18, 2, [59, 130, 246]);

    addTextAt('Objective:', margin + 3, yPosition + 6, 9, 'bold', [59, 130, 246]);
    const objLines = doc.splitTextToSize(options.simulationObjective.primaryObjective, contentWidth - 30);
    addTextAt((objLines as string[])[0], margin + 25, yPosition + 6, 9, 'normal', [60, 60, 60]);

    addTextAt('Skills Focus:', margin + 3, yPosition + 13, 8, 'bold', [100, 100, 100]);
    const skillsText = options.simulationObjective.skillsFocus.join(', ');
    const skillLines = doc.splitTextToSize(skillsText, contentWidth - 30);
    addTextAt((skillLines as string[])[0], margin + 25, yPosition + 13, 8, 'normal', [100, 100, 100]);

    yPosition += 22;
  }

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
  if (vitals.temperature !== undefined) vitalSignsParts.push(`Temp: ${vitals.temperature}C`);
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
  const completedItems = (caseData.studentChecklist || []).filter(item => session.completedItems.includes(item.id));
  const missedItems = caseData.studentChecklist.filter(item =>
    !session.completedItems.includes(item.id) && item.yearLevel?.includes(session.studentYear)
  );
  const criticalMissedItems = missedItems.filter(item => item.critical);

  if (completedItems.length > 0) {
    addSectionHeader('Completed Actions');

    completedItems.forEach((item) => {
      checkPageBreak(10);
      addFilledRoundedRect(margin, yPosition, contentWidth, 7, 1, [236, 253, 245]);
      addStrokeRoundedRect(margin, yPosition, contentWidth, 7, 1, [34, 197, 94]);

      addTextAt('+', margin + 3, yPosition + 5, 9, 'bold', [34, 197, 94]);

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
    addTextAt('(!) The following critical actions were missed:', margin + 3, yPosition + 4, 9, 'bold', [220, 38, 38]);
    yPosition += 10;

    criticalMissedItems.forEach((item) => {
      checkPageBreak(15);

      addStrokeRoundedRect(margin, yPosition, contentWidth, 12, 2, [239, 68, 68]);

      addTextAt('x', margin + 3, yPosition + 5, 9, 'bold', [220, 38, 38]);

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

      addTextAt('-', margin + 3, yPosition + 4, 9, 'bold', [251, 146, 60]);

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

  // ========== APPLIED TREATMENTS ==========
  if (options.appliedTreatments && options.appliedTreatments.length > 0) {
    addSectionHeader('Applied Treatments & Interventions');

    options.appliedTreatments.forEach((treatment, index) => {
      checkPageBreak(20);

      // Treatment box
      addFilledRoundedRect(margin, yPosition, contentWidth, 18, 2, [240, 253, 244]);
      addStrokeRoundedRect(margin, yPosition, contentWidth, 18, 2, [34, 197, 94]);

      // Treatment number and description
      addTextAt(`${index + 1}.`, margin + 3, yPosition + 5, 10, 'bold', [34, 197, 94]);
      addTextAt(treatment.description, margin + 12, yPosition + 5, 10, 'bold', [0, 0, 0]);

      // Applied time
      const timeStr = new Date(treatment.appliedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      addTextAt(`Applied at: ${timeStr}`, margin + 12, yPosition + 11, 8, 'normal', [100, 100, 100]);

      yPosition += 22;

      // Treatment effects
      if (treatment.effects.length > 0) {
        treatment.effects.forEach((effect) => {
          checkPageBreak(8);

          addTextAt('  >', margin + 5, yPosition + 3, 8, 'normal', [100, 100, 100]);
          addTextAt(`${effect.vitalSign}:`, margin + 15, yPosition + 3, 9, 'bold', [60, 60, 60]);

          // Old value (red)
          addTextAt(String(effect.oldValue), margin + 50, yPosition + 3, 9, 'normal', [220, 38, 38]);

          // Arrow
          addTextAt('->', margin + 75, yPosition + 3, 9, 'bold', [100, 100, 100]);

          // New value (green)
          addTextAt(String(effect.newValue), margin + 85, yPosition + 3, 9, 'bold', [34, 197, 94]);

          yPosition += 6;
        });
        yPosition += 3;
      }
    });
  }

  // ========== VITALS HISTORY ==========
  if (options.vitalsHistory && options.vitalsHistory.length > 1) {
    addSectionHeader('Vital Signs Progression');

    // Table header
    addFilledRoundedRect(margin, yPosition, contentWidth, 8, 1, [240, 240, 240]);
    addTextAt('Time', margin + 2, yPosition + 5, 8, 'bold', [60, 60, 60]);
    addTextAt('BP', margin + 30, yPosition + 5, 8, 'bold', [60, 60, 60]);
    addTextAt('HR', margin + 60, yPosition + 5, 8, 'bold', [60, 60, 60]);
    addTextAt('SpO2', margin + 80, yPosition + 5, 8, 'bold', [60, 60, 60]);
    addTextAt('RR', margin + 105, yPosition + 5, 8, 'bold', [60, 60, 60]);
    yPosition += 10;

    // Vitals rows
    options.vitalsHistory.forEach((vitals, idx) => {
      checkPageBreak(8);

      const rowColor = idx % 2 === 0 ? [250, 250, 250] : [255, 255, 255];
      addFilledRoundedRect(margin, yPosition, contentWidth, 7, 0, rowColor as [number, number, number]);

      const timeStr = idx === 0 ? 'Initial' : `T+${idx}`;
      addTextAt(timeStr, margin + 2, yPosition + 5, 8, 'normal', [80, 80, 80]);
      addTextAt(String(vitals.bp), margin + 30, yPosition + 5, 8, 'normal', [60, 60, 60]);
      addTextAt(String(vitals.pulse), margin + 60, yPosition + 5, 8, 'normal', [60, 60, 60]);
      addTextAt(String(vitals.spo2) + '%', margin + 80, yPosition + 5, 8, 'normal', [60, 60, 60]);
      addTextAt(String(vitals.respiration), margin + 105, yPosition + 5, 8, 'normal', [60, 60, 60]);

      yPosition += 8;
    });
    yPosition += 5;
  }

  // ========== CLINICAL GUIDELINES & REFERENCES ==========
  if (caseData.uaeProtocols?.applicableGuidelines && caseData.uaeProtocols.applicableGuidelines.length > 0) {
    addSectionHeader('Clinical Guidelines & References');

    caseData.uaeProtocols.applicableGuidelines.forEach((guideline) => {
      checkPageBreak(8);

      addFilledRoundedRect(margin, yPosition, 6, 6, 1, [239, 246, 255]);
      addTextAt('>', margin + 2, yPosition + 4.5, 8, 'normal', [59, 130, 246]);

      const lines = doc.splitTextToSize(guideline, contentWidth - 12);
      (lines as string[]).forEach((line: string, idx: number) => {
        addTextAt(line, margin + 10, yPosition + 4.5 + (idx * 4), 9, 'normal', [60, 60, 60]);
      });

      yPosition += lines.length * 5 + 2;
    });
  }

  // ========== COMMON PITFALLS ==========
  if (caseData.commonPitfalls && caseData.commonPitfalls.length > 0) {
    addSectionHeader('Common Pitfalls to Avoid');

    caseData.commonPitfalls.forEach((pitfall) => {
      checkPageBreak(10);

      addTextAt('(!)', margin, yPosition + 3, 9, 'normal', [251, 146, 60]);

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

  // ========== INSTRUCTOR ASSESSMENT FEEDBACK ==========
  if (options.instructorAssessmentNotes && options.instructorAssessmentNotes.length > 0) {
    addSectionHeader('Instructor Assessment Feedback');

    const severityColors: Record<string, [number, number, number]> = {
      critical: [220, 38, 38],
      important: [234, 146, 60],
      'learning-point': [59, 130, 246],
    };

    const categoryColors: Record<string, [number, number, number]> = {
      excellent: [34, 197, 94],
      'critical-miss': [220, 38, 38],
      omitted: [234, 146, 60],
      incomplete: [234, 179, 8],
      communication: [139, 92, 246],
      safety: [220, 38, 38],
      'clinical-reasoning': [59, 130, 246],
    };

    for (const note of options.instructorAssessmentNotes) {
      checkPageBreak(28);

      const severityColor = severityColors[note.severity] || [80, 80, 80];
      const catColor = categoryColors[note.category] || [80, 80, 80];

      // Note card background
      const bgColor: [number, number, number] = note.category === 'excellent'
        ? [240, 253, 244] : note.category === 'critical-miss'
        ? [254, 242, 242] : [255, 251, 235];
      addFilledRoundedRect(margin, yPosition, contentWidth, 24, 2, bgColor);

      // Left border accent
      doc.setFillColor(catColor[0], catColor[1], catColor[2]);
      doc.rect(margin, yPosition, 2, 24, 'F');

      // Severity badge
      addTextAt(`[${note.severity.toUpperCase()}]`, margin + 5, yPosition + 5, 7, 'bold', severityColor);

      // Phase
      addTextAt(`Phase: ${note.phase}`, margin + 40, yPosition + 5, 7, 'normal', [120, 120, 120]);

      // Timestamp
      const noteTime = new Date(note.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      addTextAt(noteTime, pageWidth - margin - 15, yPosition + 5, 7, 'normal', [150, 150, 150]);

      // Finding
      const findingLines = doc.splitTextToSize(note.finding, contentWidth - 10);
      addTextAt((findingLines as string[])[0], margin + 5, yPosition + 11, 9, 'bold', [30, 30, 30]);

      // What was missed + why it matters
      if (note.whatWasMissed && note.whatWasMissed !== 'Not specified') {
        const missedText = `Missed: ${note.whatWasMissed}`;
        const missedLines = doc.splitTextToSize(missedText, contentWidth - 10);
        addTextAt((missedLines as string[])[0], margin + 5, yPosition + 17, 7, 'normal', [80, 80, 80]);
      }

      if (note.improvementAction) {
        addTextAt(`Action: ${note.improvementAction}`, margin + 5, yPosition + 22, 7, 'normal', [59, 130, 246]);
      }

      yPosition += 28;
    }

    // Summary counts
    checkPageBreak(15);
    yPosition += 3;
    const critCount = options.instructorAssessmentNotes.filter(n => n.severity === 'critical').length;
    const strengthCount = options.instructorAssessmentNotes.filter(n => n.category === 'excellent').length;
    const improvCount = options.instructorAssessmentNotes.filter(n => n.category === 'omitted' || n.category === 'incomplete').length;

    addFilledRoundedRect(margin, yPosition, contentWidth, 10, 2, [248, 250, 252]);
    addTextAt(`Summary: ${critCount} critical  |  ${improvCount} areas for improvement  |  ${strengthCount} strengths noted`, margin + 5, yPosition + 7, 8, 'bold', [80, 80, 80]);
    yPosition += 15;
  }

  // ========== FURTHER STUDY RESOURCES ==========
  if (options.debriefingResources && options.debriefingResources.length > 0) {
    addSectionHeader('Further Study Resources');

    // Group by type
    const typeOrder = ['guideline', 'article', 'image', 'video', 'podcast', 'case-study'];
    const grouped: Record<string, typeof options.debriefingResources> = {};
    for (const r of options.debriefingResources) {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type]!.push(r);
    }

    for (const type of typeOrder) {
      const resources = grouped[type];
      if (!resources || resources.length === 0) continue;

      checkPageBreak(15);

      // Type header
      const typeLabel = type === 'case-study' ? 'Case Studies' : `${type.charAt(0).toUpperCase() + type.slice(1)}s`;
      addTextAt(typeLabel, margin, yPosition + 4, 10, 'bold', [80, 80, 80]);
      yPosition += 8;

      // Essential resources first, limit total
      const sorted = [...resources].sort((a, b) => {
        const order: Record<string, number> = { essential: 0, important: 1, supplementary: 2 };
        return (order[a.relevance] || 2) - (order[b.relevance] || 2);
      });

      for (const resource of sorted.slice(0, 5)) {
        checkPageBreak(12);

        // Source badge
        addTextAt(`[${resource.source}]`, margin + 2, yPosition + 4, 7, 'normal', [150, 150, 150]);

        // Clickable title
        addClickableLink(resource.title, resource.url, margin + 45, yPosition + 4, 9);

        // Relevance indicator
        if (resource.relevance === 'essential') {
          addTextAt('*', pageWidth - margin - 5, yPosition + 4, 8, 'normal', [234, 179, 8]);
        }

        yPosition += 8;
      }

      if (resources.length > 5) {
        addTextAt(`+ ${resources.length - 5} more resources available online`, margin + 45, yPosition + 3, 7, 'normal', [150, 150, 150]);
        yPosition += 6;
      }

      yPosition += 3;
    }

    // Source attribution
    yPosition += 2;
    checkPageBreak(10);
    addTextAt('Resources from: NICE, Resuscitation Council UK, Radiopaedia, EMDocs, REBEL EM, ALiEM, EM Cases, EMCrit, and more.', margin, yPosition + 3, 7, 'normal', [180, 180, 180]);
    yPosition += 8;
  }

  // ========== CONDITION-SPECIFIC VISUAL RESOURCES ==========
  // Pull relevant videos and articles from local clinical resources based on case
  {
    const caseFindings = [
      caseData.subcategory,
      caseData.title,
      caseData.category,
      caseData.dispatchInfo?.callReason,
      ...(caseData.expectedFindings?.keyObservations || []),
      ...(caseData.expectedFindings?.differentialDiagnoses || []),
      caseData.expectedFindings?.mostLikelyDiagnosis,
    ].filter(Boolean) as string[];

    const matchedVideos = [
      ...getVideosByCategory(caseData.category),
      ...getVideosByFindings(caseFindings),
    ].filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i).slice(0, 6);

    const matchedArticles = referenceArticles
      .filter(a =>
        a.category === caseData.category ||
        caseFindings.some(f => a.title.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(a.category))
      )
      .sort((a, b) => {
        // Prioritize subcategory and title matches over broad category matches
        const scoreMatch = (article: typeof a): number => {
          let score = 0;
          const titleLower = article.title.toLowerCase();
          if (caseData.subcategory && titleLower.includes(caseData.subcategory.toLowerCase())) score += 10;
          if (caseData.title && titleLower.includes(caseData.title.toLowerCase())) score += 8;
          if (caseData.expectedFindings?.mostLikelyDiagnosis && titleLower.includes(caseData.expectedFindings.mostLikelyDiagnosis.toLowerCase())) score += 6;
          if (caseFindings.some(f => titleLower.includes(f.toLowerCase()))) score += 3;
          if (article.category === caseData.category) score += 1;
          return score;
        };
        return scoreMatch(b) - scoreMatch(a);
      })
      .slice(0, 6);

    if (matchedVideos.length > 0 || matchedArticles.length > 0) {
      addSectionHeader('Condition-Specific Learning Resources');

      addTextAt(
        'The following resources are directly relevant to this case condition. Use them for further study.',
        margin, yPosition + 3, 8, 'normal', [100, 100, 100]
      );
      yPosition += 8;

      // Videos
      if (matchedVideos.length > 0) {
        checkPageBreak(12);
        addTextAt('Educational Videos:', margin, yPosition + 4, 10, 'bold', [220, 38, 38]);
        yPosition += 8;

        for (const video of matchedVideos) {
          checkPageBreak(12);

          addTextAt(`[${video.duration}]`, margin + 2, yPosition + 4, 7, 'normal', [150, 150, 150]);

          const videoUrl = getYouTubeWatchUrl(video.youtubeId);
          addClickableLink(video.name, videoUrl, margin + 20, yPosition + 4, 9);

          addTextAt(video.source, margin + 20, yPosition + 9, 7, 'normal', [150, 150, 150]);

          yPosition += 13;
        }
        yPosition += 3;
      }

      // Articles
      if (matchedArticles.length > 0) {
        checkPageBreak(12);
        addTextAt('Reference Articles & Guidelines:', margin, yPosition + 4, 10, 'bold', [59, 130, 246]);
        yPosition += 8;

        for (const article of matchedArticles) {
          checkPageBreak(10);

          addTextAt(`[${article.source}]`, margin + 2, yPosition + 4, 7, 'normal', [150, 150, 150]);

          addClickableLink(article.title, article.url, margin + 45, yPosition + 4, 9);

          yPosition += 8;
        }
        yPosition += 3;
      }
    }
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
