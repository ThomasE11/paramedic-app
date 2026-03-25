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

  // Try loading jsPDF from multiple CDNs for reliability
  const cdnUrls = [
    'https://unpkg.com/jspdf@4.0.0/dist/jspdf.umd.min.js',
    'https://cdn.jsdelivr.net/npm/jspdf@4.0.0/dist/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js',
  ];

  for (const url of cdnUrls) {
    try {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load from ${url}`));
        document.head.appendChild(script);
      });
      if ((window as any).jspdf?.jsPDF) {
        return (window as any).jspdf.jsPDF;
      }
    } catch {
      console.warn(`jsPDF CDN failed: ${url}, trying next...`);
    }
  }

  throw new Error('Failed to load jsPDF from all CDN sources');
}

// ==========================================================================
// DESIGN CONSTANTS - Three font sizes only, consistent spacing
// ==========================================================================
const FONT = {
  HEADER: 12,       // Section headers - bold
  BODY: 9,          // Body text - normal
  LABEL: 8,         // Labels, metadata, small text - normal
} as const;

const LINE_HEIGHT = {
  HEADER: 5.5,      // Line height for 12pt
  BODY: 4.2,        // Line height for 9pt
  LABEL: 3.8,       // Line height for 8pt
} as const;

const SECTION_GAP = 10;       // Consistent 10mm gap before every section
const PAGE_BORDER_INSET = 8;  // Inset for the subtle gray page border

const COLOR = {
  PRIMARY: [59, 130, 246] as [number, number, number],
  BLACK: [0, 0, 0] as [number, number, number],
  BODY_TEXT: [50, 50, 50] as [number, number, number],
  MUTED: [100, 100, 100] as [number, number, number],
  LIGHT_MUTED: [150, 150, 150] as [number, number, number],
  GREEN: [34, 197, 94] as [number, number, number],
  RED: [220, 38, 38] as [number, number, number],
  ORANGE: [234, 146, 60] as [number, number, number],
  YELLOW: [234, 179, 8] as [number, number, number],
  PURPLE: [139, 92, 246] as [number, number, number],
  WHITE: [255, 255, 255] as [number, number, number],
  BG_LIGHT: [248, 250, 252] as [number, number, number],
  BG_GREEN: [240, 253, 244] as [number, number, number],
  BG_RED: [254, 242, 242] as [number, number, number],
  BG_YELLOW: [255, 251, 235] as [number, number, number],
  BG_BLUE: [239, 246, 255] as [number, number, number],
  BORDER_GRAY: [210, 210, 210] as [number, number, number],
  ROW_ALT: [245, 245, 245] as [number, number, number],
};

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

  // Helper: check if we need a new page
  const checkPageBreak = (requiredSpace: number): boolean => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = margin + 5; // Leave room for page border top
      return true;
    }
    return false;
  };

  // Sanitize text to remove Unicode characters that jsPDF can't render
  const sanitizeText = (text: string | undefined | null): string => {
    if (!text) return '';
    return String(text)
      .replace(/→/g, '->')
      .replace(/←/g, '<-')
      .replace(/°/g, ' deg')
      .replace(/[^\x20-\x7E\n]/g, '');
  };

  // Helper: add wrapped text at current yPosition, auto page-breaking
  const addWrappedText = (
    text: string,
    fontSize: number,
    lineHeight: number,
    fontStyle: 'normal' | 'bold' = 'normal',
    rgbColor: [number, number, number] = COLOR.BODY_TEXT,
    xOffset = 0,
  ): void => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(rgbColor[0], rgbColor[1], rgbColor[2]);

    const lines = doc.splitTextToSize(text, contentWidth - xOffset) as string[];
    for (const line of lines) {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin + 5;
      }
      doc.text(line, margin + xOffset, yPosition);
      yPosition += lineHeight;
    }
  };

  // Helper: add a section header with consistent spacing
  const addSectionHeader = (text: string): void => {
    yPosition += SECTION_GAP;
    checkPageBreak(15);
    // Draw blue accent line
    doc.setDrawColor(COLOR.PRIMARY[0], COLOR.PRIMARY[1], COLOR.PRIMARY[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6; // Fixed gap below line before text
    // Header text
    doc.setFontSize(FONT.HEADER);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLOR.PRIMARY[0], COLOR.PRIMARY[1], COLOR.PRIMARY[2]);
    doc.text(sanitizeText(text), margin, yPosition);
    yPosition += LINE_HEIGHT.HEADER + 2; // Fixed gap after header text
  };

  // Helper: add a filled rounded rect
  const addFilledRoundedRect = (x: number, y: number, w: number, h: number, r: number, rgbColor: [number, number, number]): void => {
    doc.setFillColor(rgbColor[0], rgbColor[1], rgbColor[2]);
    doc.roundedRect(x, y, w, h, r, r, 'F');
  };

  // Helper: add a stroked rounded rect
  const addStrokeRoundedRect = (x: number, y: number, w: number, h: number, r: number, rgbColor: [number, number, number]): void => {
    doc.setDrawColor(rgbColor[0], rgbColor[1], rgbColor[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, r, r, 'S');
  };

  // Helper: add text at a specific position (no yPosition mutation)
  const addTextAt = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    fontStyle: 'normal' | 'bold' = 'normal',
    rgbColor: [number, number, number] = COLOR.BLACK,
  ): void => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(rgbColor[0], rgbColor[1], rgbColor[2]);
    doc.text(text, x, y);
  };

  // Helper: add centered text at a specific y
  const addCenteredText = (
    text: string,
    y: number,
    fontSize: number,
    fontStyle: 'normal' | 'bold' = 'normal',
    rgbColor: [number, number, number] = COLOR.BLACK,
  ): void => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(rgbColor[0], rgbColor[1], rgbColor[2]);
    doc.text(text, pageWidth / 2, y, { align: 'center' } as never);
  };

  // Helper: add a clickable link
  const addClickableLink = (text: string, url: string, x: number, y: number): void => {
    doc.setFontSize(FONT.BODY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLOR.PRIMARY[0], COLOR.PRIMARY[1], COLOR.PRIMARY[2]);
    const maxWidth = contentWidth - (x - margin) - 2;
    const truncated = (doc.splitTextToSize(text, maxWidth) as string[])[0];
    doc.textWithLink(truncated, x, y, { url });
  };

  // ========== HEADER BANNER ==========
  addFilledRoundedRect(0, 0, pageWidth, 32, 0, COLOR.PRIMARY);

  doc.setTextColor(255, 255, 255);
  addCenteredText('UAE Paramedic Case Generator', 13, 18, 'bold', COLOR.WHITE);
  addCenteredText('Session Summary Report', 21, FONT.BODY, 'normal', COLOR.WHITE);
  addCenteredText(`Generated: ${new Date().toLocaleString('en-GB')}`, 28, FONT.LABEL, 'normal', COLOR.WHITE);

  yPosition = 40;

  // ========== CASE INFORMATION ==========
  addSectionHeader('Case Information');

  const caseInfo = [
    ['Case Title:', sanitizeText(caseData.title)],
    ['Category:', sanitizeText(caseData.category)],
    ['Priority:', caseData.priority.toUpperCase()],
    ['Complexity:', caseData.complexity.toUpperCase()],
    ['Year Level:', session.studentYear],
    ['Patient:', `${caseData.patientInfo.age}y ${caseData.patientInfo.gender}`],
    ['Location:', sanitizeText(caseData.dispatchInfo.location)],
  ];

  caseInfo.forEach(([label, value]) => {
    checkPageBreak(6);
    addTextAt(label, margin, yPosition, FONT.BODY, 'bold', COLOR.BLACK);
    addTextAt(value, margin + 30, yPosition, FONT.BODY, 'normal', COLOR.BODY_TEXT);
    yPosition += LINE_HEIGHT.BODY + 1;
  });

  // ========== SIMULATION OBJECTIVE ==========
  if (options.simulationObjective) {
    addSectionHeader('Simulation Objective');

    checkPageBreak(20);
    addFilledRoundedRect(margin, yPosition, contentWidth, 16, 2, COLOR.BG_BLUE);
    addStrokeRoundedRect(margin, yPosition, contentWidth, 16, 2, COLOR.PRIMARY);

    addTextAt('Objective:', margin + 3, yPosition + 5, FONT.BODY, 'bold', COLOR.PRIMARY);
    const objLines = doc.splitTextToSize(sanitizeText(options.simulationObjective.primaryObjective), contentWidth - 30) as string[];
    addTextAt(objLines[0], margin + 25, yPosition + 5, FONT.BODY, 'normal', COLOR.BODY_TEXT);

    addTextAt('Skills Focus:', margin + 3, yPosition + 11, FONT.LABEL, 'bold', COLOR.MUTED);
    const skillsText = sanitizeText(options.simulationObjective.skillsFocus.join(', '));
    const skillLines = doc.splitTextToSize(skillsText, contentWidth - 30) as string[];
    addTextAt(skillLines[0], margin + 25, yPosition + 11, FONT.LABEL, 'normal', COLOR.MUTED);

    yPosition += 20;
  }

  // ========== DISPATCH INFORMATION ==========
  addSectionHeader('Dispatch Information');

  const dispatchLines = [
    `Call Reason: ${sanitizeText(caseData.dispatchInfo.callReason)}`,
    `Time of Day: ${sanitizeText(caseData.dispatchInfo.timeOfDay)}`,
    `Caller Info: ${sanitizeText(caseData.dispatchInfo.callerInfo)}`,
  ];

  dispatchLines.forEach((line) => {
    checkPageBreak(6);
    const lines = doc.splitTextToSize(line, contentWidth) as string[];
    for (const l of lines) {
      addTextAt(l, margin, yPosition, FONT.BODY, 'normal', COLOR.BODY_TEXT);
      yPosition += LINE_HEIGHT.BODY + 0.5;
    }
  });

  // ========== VITAL SIGNS ==========
  addSectionHeader('Initial Vital Signs');

  const vitals = caseData.vitalSignsProgression.initial;
  const vitalSignsParts: string[] = [
    `BP: ${vitals.bp}`,
    `Pulse: ${vitals.pulse} bpm`,
    `RR: ${vitals.respiration}/min`,
    `SpO2: ${vitals.spo2}%`,
  ];
  if (vitals.gcs !== undefined) vitalSignsParts.push(`GCS: ${vitals.gcs}/15`);
  if (vitals.temperature !== undefined) vitalSignsParts.push(`Temp: ${vitals.temperature}C`);
  if (vitals.bloodGlucose !== undefined) vitalSignsParts.push(`Glucose: ${vitals.bloodGlucose} mmol/L`);

  addWrappedText(vitalSignsParts.join('    '), FONT.BODY, LINE_HEIGHT.BODY);

  // ========== PERFORMANCE SUMMARY ==========
  addSectionHeader('Performance Summary');

  const percentage = session.totalPossible > 0 ? Math.round((session.score / session.totalPossible) * 100) : 0;

  let grade = 'Needs Improvement';
  let gradeColor: [number, number, number] = COLOR.RED;
  if (percentage >= 90) {
    grade = 'Excellent';
    gradeColor = COLOR.GREEN;
  } else if (percentage >= 75) {
    grade = 'Good';
    gradeColor = COLOR.PRIMARY;
  } else if (percentage >= 60) {
    grade = 'Satisfactory';
    gradeColor = COLOR.YELLOW;
  }

  checkPageBreak(32);

  const scoreBoxY = yPosition;
  const scoreBoxHeight = 28;

  // Score card background
  addFilledRoundedRect(margin, scoreBoxY, contentWidth, scoreBoxHeight, 3, COLOR.BG_LIGHT);
  addStrokeRoundedRect(margin, scoreBoxY, contentWidth, scoreBoxHeight, 3, COLOR.BORDER_GRAY);

  // Score circle (centered vertically in box)
  const circleY = scoreBoxY + scoreBoxHeight / 2 - 10;
  addFilledRoundedRect(margin + 4, circleY, 20, 20, 10, gradeColor);

  // Percentage text centered in circle
  const pctText = `${percentage}%`;
  addTextAt(pctText, margin + 14, circleY + 12, FONT.HEADER, 'bold', COLOR.WHITE);

  // Grade info to the right of circle
  addTextAt(grade, margin + 30, scoreBoxY + 10, FONT.HEADER, 'bold', gradeColor);
  addTextAt(
    `${session.score} / ${session.totalPossible} points`,
    margin + 30, scoreBoxY + 16, FONT.BODY, 'normal', COLOR.MUTED,
  );

  if (elapsedTime) {
    addTextAt(`Time: ${elapsedTime}`, margin + 30, scoreBoxY + 22, FONT.BODY, 'normal', COLOR.MUTED);
  }

  yPosition = scoreBoxY + scoreBoxHeight + 3;

  // ========== COMPLETED ACTIONS ==========
  const completedItems = (caseData.studentChecklist || []).filter(item => session.completedItems.includes(item.id));
  const missedItems = caseData.studentChecklist.filter(item =>
    !session.completedItems.includes(item.id) && item.yearLevel?.includes(session.studentYear)
  );
  const criticalMissedItems = missedItems.filter(item => item.critical);

  if (completedItems.length > 0) {
    addSectionHeader('Completed Actions');

    completedItems.forEach((item) => {
      checkPageBreak(8);
      addFilledRoundedRect(margin, yPosition - 1, contentWidth, 6, 1, COLOR.BG_GREEN);
      addStrokeRoundedRect(margin, yPosition - 1, contentWidth, 6, 1, COLOR.GREEN);

      addTextAt('+', margin + 3, yPosition + 3, FONT.BODY, 'bold', COLOR.GREEN);

      const text = sanitizeText(item.description) + (item.critical ? ' (Critical)' : '');
      const lines = doc.splitTextToSize(text, contentWidth - 12) as string[];
      addTextAt(lines[0], margin + 8, yPosition + 3, FONT.BODY, 'normal', COLOR.BODY_TEXT);

      yPosition += 8;
    });
  }

  // ========== CRITICAL MISSED ACTIONS ==========
  if (criticalMissedItems.length > 0) {
    addSectionHeader('CRITICAL - Missed Actions');

    addFilledRoundedRect(margin, yPosition - 1, contentWidth, 6, 0, COLOR.BG_RED);
    addTextAt('(!) The following critical actions were missed:', margin + 3, yPosition + 3, FONT.BODY, 'bold', COLOR.RED);
    yPosition += 9;

    criticalMissedItems.forEach((item) => {
      checkPageBreak(12);

      const descLines = doc.splitTextToSize(sanitizeText(item.description), contentWidth - 12) as string[];
      const boxH = Math.max(8, descLines.length * LINE_HEIGHT.BODY + 3);

      addStrokeRoundedRect(margin, yPosition, contentWidth, boxH, 2, COLOR.RED);
      addTextAt('x', margin + 3, yPosition + 5, FONT.BODY, 'bold', COLOR.RED);

      descLines.forEach((line: string, i: number) => {
        addTextAt(line, margin + 8, yPosition + 5 + (i * LINE_HEIGHT.BODY), FONT.BODY, 'normal', COLOR.BODY_TEXT);
      });

      yPosition += boxH + 3;
    });
  }

  // ========== OTHER MISSED ITEMS ==========
  const nonCriticalMissed = missedItems.filter(item => !item.critical);
  if (nonCriticalMissed.length > 0) {
    addSectionHeader('Other Items to Review');

    nonCriticalMissed.forEach((item) => {
      checkPageBreak(8);

      addStrokeRoundedRect(margin, yPosition - 1, contentWidth, 6, 1, COLOR.ORANGE);
      addTextAt('-', margin + 3, yPosition + 3, FONT.BODY, 'bold', COLOR.ORANGE);

      const truncatedText = item.description.length > 90
        ? item.description.substring(0, 87) + '...'
        : item.description;
      addTextAt(sanitizeText(truncatedText), margin + 8, yPosition + 3, FONT.BODY, 'normal', COLOR.MUTED);

      yPosition += 8;
    });
  }

  // ========== KEY LEARNING POINTS ==========
  if (caseData.teachingPoints.length > 0) {
    addSectionHeader('Key Learning Points');

    caseData.teachingPoints.forEach((point, i) => {
      checkPageBreak(10);

      addFilledRoundedRect(margin, yPosition - 1, 6, 6, 1, COLOR.BG_BLUE);
      addTextAt(`${i + 1}`, margin + 2.5, yPosition + 3, FONT.BODY, 'bold', COLOR.PRIMARY);

      const lines = doc.splitTextToSize(sanitizeText(point), contentWidth - 12) as string[];
      lines.forEach((line: string, idx: number) => {
        addTextAt(line, margin + 10, yPosition + 3 + (idx * LINE_HEIGHT.BODY), FONT.BODY, 'normal', COLOR.BODY_TEXT);
      });

      yPosition += lines.length * LINE_HEIGHT.BODY + 4;
    });
  }

  // ========== APPLIED TREATMENTS ==========
  if (options.appliedTreatments && options.appliedTreatments.length > 0) {
    addSectionHeader('Applied Treatments & Interventions');

    options.appliedTreatments.forEach((treatment, index) => {
      checkPageBreak(18);

      // Clean description: strip vital-change suffixes like "-- SpO2: 85% -> 92%, HR: 120 -> 105."
      const cleanDesc = sanitizeText(treatment.description || treatment.name)
        // Strip "-- VitalSign: old -> new, VitalSign: old -> new." patterns
        .replace(/\s*[-—]{1,3}\s*(?:[A-Za-z][A-Za-z\d /]*:\s*[\d./%]+\s*(?:->|->)\s*[\d./%]+(?:\s*,\s*)?)+\.?/g, '')
        // Fallback: strip individual vital change mentions
        .replace(/\s*(?:HR|SpO2|BP|RR|GCS|Temp|Temperature|EtCO2):\s*[\d./%]+\s*->\s*[\d./%]+\.?/gi, '')
        // Clean up trailing/double punctuation
        .replace(/\.{2,}/g, '.')
        .replace(/\.\s*$/, '')
        .replace(/,\s*$/, '')
        .trim();

      // Treatment box
      addFilledRoundedRect(margin, yPosition, contentWidth, 14, 2, COLOR.BG_GREEN);
      addStrokeRoundedRect(margin, yPosition, contentWidth, 14, 2, COLOR.GREEN);

      addTextAt(`${index + 1}.`, margin + 3, yPosition + 5, FONT.BODY, 'bold', COLOR.GREEN);

      // Wrap the description within the box width
      const descLines = doc.splitTextToSize(cleanDesc, contentWidth - 18) as string[];
      addTextAt(descLines[0], margin + 10, yPosition + 5, FONT.BODY, 'bold', COLOR.BLACK);

      const timeStr = new Date(treatment.appliedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      addTextAt(`Applied at: ${timeStr}`, margin + 10, yPosition + 10, FONT.LABEL, 'normal', COLOR.MUTED);

      yPosition += 17;

      // Treatment effects
      if (treatment.effects.length > 0) {
        treatment.effects.forEach((effect) => {
          checkPageBreak(6);

          addTextAt('>', margin + 6, yPosition, FONT.LABEL, 'normal', COLOR.MUTED);
          addTextAt(sanitizeText(`${effect.vitalSign}:`), margin + 12, yPosition, FONT.BODY, 'bold', COLOR.BODY_TEXT);
          addTextAt(sanitizeText(String(effect.oldValue)), margin + 45, yPosition, FONT.BODY, 'normal', COLOR.RED);
          addTextAt('->', margin + 65, yPosition, FONT.BODY, 'bold', COLOR.MUTED);
          addTextAt(sanitizeText(String(effect.newValue)), margin + 72, yPosition, FONT.BODY, 'bold', COLOR.GREEN);

          yPosition += LINE_HEIGHT.BODY + 1;
        });
        yPosition += 2;
      }
    });
  }

  // ========== VITAL SIGNS SUMMARY ==========
  if (options.vitalsHistory && options.vitalsHistory.length > 1) {
    addSectionHeader('Vital Signs Summary');

    const initial = options.vitalsHistory[0];
    const final = options.vitalsHistory[options.vitalsHistory.length - 1];

    checkPageBreak(28);

    // Table header row
    addFilledRoundedRect(margin, yPosition, contentWidth, 7, 1, [230, 230, 230]);
    const colPositions = [margin + 20, margin + 50, margin + 75, margin + 100, margin + 125];
    addTextAt('', margin + 2, yPosition + 5, FONT.LABEL, 'bold', COLOR.BODY_TEXT);
    addTextAt('BP', colPositions[0], yPosition + 5, FONT.LABEL, 'bold', COLOR.BODY_TEXT);
    addTextAt('HR', colPositions[1], yPosition + 5, FONT.LABEL, 'bold', COLOR.BODY_TEXT);
    addTextAt('SpO2', colPositions[2], yPosition + 5, FONT.LABEL, 'bold', COLOR.BODY_TEXT);
    addTextAt('RR', colPositions[3], yPosition + 5, FONT.LABEL, 'bold', COLOR.BODY_TEXT);
    yPosition += 8;

    // Initial row
    addTextAt('Initial', margin + 2, yPosition + 5, FONT.LABEL, 'bold', COLOR.MUTED);
    addTextAt(String(initial.bp), colPositions[0], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    addTextAt(String(initial.pulse), colPositions[1], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    addTextAt(String(initial.spo2) + '%', colPositions[2], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    addTextAt(String(initial.respiration), colPositions[3], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    yPosition += 7;

    // Final row
    const hrBetter = Number(final.pulse) < Number(initial.pulse);
    const spo2Better = Number(final.spo2) > Number(initial.spo2);
    addFilledRoundedRect(margin, yPosition, contentWidth, 7, 0, COLOR.ROW_ALT);
    addTextAt('Final', margin + 2, yPosition + 5, FONT.LABEL, 'bold', COLOR.MUTED);
    addTextAt(String(final.bp), colPositions[0], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    addTextAt(String(final.pulse), colPositions[1], yPosition + 5, FONT.LABEL, 'normal', hrBetter ? COLOR.GREEN : COLOR.RED);
    addTextAt(String(final.spo2) + '%', colPositions[2], yPosition + 5, FONT.LABEL, 'normal', spo2Better ? COLOR.GREEN : COLOR.RED);
    addTextAt(String(final.respiration), colPositions[3], yPosition + 5, FONT.LABEL, 'normal', COLOR.BODY_TEXT);
    yPosition += 9;

    addTextAt(`Snapshots recorded: ${options.vitalsHistory.length}`, margin, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);
    yPosition += 5;
  }

  // ========== CLINICAL GUIDELINES & REFERENCES ==========
  if (caseData.uaeProtocols?.applicableGuidelines && caseData.uaeProtocols.applicableGuidelines.length > 0) {
    addSectionHeader('Clinical Guidelines & References');

    caseData.uaeProtocols.applicableGuidelines.forEach((guideline) => {
      checkPageBreak(8);

      addFilledRoundedRect(margin, yPosition - 1, 5, 5, 1, COLOR.BG_BLUE);
      addTextAt('>', margin + 1.5, yPosition + 3, FONT.LABEL, 'normal', COLOR.PRIMARY);

      const lines = doc.splitTextToSize(sanitizeText(guideline), contentWidth - 10) as string[];
      lines.forEach((line: string, idx: number) => {
        addTextAt(line, margin + 8, yPosition + 3 + (idx * LINE_HEIGHT.BODY), FONT.BODY, 'normal', COLOR.BODY_TEXT);
      });

      yPosition += lines.length * LINE_HEIGHT.BODY + 3;
    });
  }

  // ========== COMMON PITFALLS ==========
  if (caseData.commonPitfalls && caseData.commonPitfalls.length > 0) {
    addSectionHeader('Common Pitfalls to Avoid');

    caseData.commonPitfalls.forEach((pitfall) => {
      checkPageBreak(8);

      addTextAt('(!)', margin, yPosition, FONT.BODY, 'normal', COLOR.ORANGE);

      const lines = doc.splitTextToSize(sanitizeText(pitfall), contentWidth - 8) as string[];
      lines.forEach((line: string, idx: number) => {
        addTextAt(line, margin + 7, yPosition + (idx * LINE_HEIGHT.BODY), FONT.BODY, 'normal', COLOR.MUTED);
      });

      yPosition += lines.length * LINE_HEIGHT.BODY + 3;
    });
  }

  // ========== INSTRUCTOR NOTES ==========
  if (session.notes) {
    addSectionHeader('Instructor Notes');

    const noteLines = doc.splitTextToSize(sanitizeText(session.notes), contentWidth) as string[];
    for (const line of noteLines) {
      checkPageBreak(6);
      addTextAt(line, margin, yPosition, FONT.BODY, 'normal', COLOR.BODY_TEXT);
      yPosition += LINE_HEIGHT.BODY + 0.5;
    }
  }

  // ========== INSTRUCTOR ASSESSMENT FEEDBACK ==========
  if (options.instructorAssessmentNotes && options.instructorAssessmentNotes.length > 0) {
    addSectionHeader('Instructor Assessment Feedback');

    const severityColors: Record<string, [number, number, number]> = {
      critical: COLOR.RED,
      important: COLOR.ORANGE,
      'learning-point': COLOR.PRIMARY,
    };

    const categoryColors: Record<string, [number, number, number]> = {
      excellent: COLOR.GREEN,
      'critical-miss': COLOR.RED,
      omitted: COLOR.ORANGE,
      incomplete: COLOR.YELLOW,
      communication: COLOR.PURPLE,
      safety: COLOR.RED,
      'clinical-reasoning': COLOR.PRIMARY,
    };

    for (const note of options.instructorAssessmentNotes) {
      checkPageBreak(24);

      const catColor = categoryColors[note.category] || COLOR.MUTED;
      const severityColor = severityColors[note.severity] || COLOR.MUTED;

      // Note card background
      const bgColor: [number, number, number] = note.category === 'excellent'
        ? COLOR.BG_GREEN : note.category === 'critical-miss'
        ? COLOR.BG_RED : COLOR.BG_YELLOW;
      addFilledRoundedRect(margin, yPosition, contentWidth, 22, 2, bgColor);

      // Left border accent
      doc.setFillColor(catColor[0], catColor[1], catColor[2]);
      doc.rect(margin, yPosition, 2, 22, 'F');

      // Severity badge
      addTextAt(`[${note.severity.toUpperCase()}]`, margin + 5, yPosition + 5, FONT.LABEL, 'bold', severityColor);

      // Phase
      addTextAt(`Phase: ${note.phase}`, margin + 35, yPosition + 5, FONT.LABEL, 'normal', COLOR.MUTED);

      // Timestamp
      const noteTime = new Date(note.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      addTextAt(noteTime, pageWidth - margin - 12, yPosition + 5, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);

      // Finding
      const findingLines = doc.splitTextToSize(sanitizeText(note.finding), contentWidth - 10) as string[];
      addTextAt(findingLines[0], margin + 5, yPosition + 11, FONT.BODY, 'bold', COLOR.BLACK);

      // What was missed
      if (note.whatWasMissed && note.whatWasMissed !== 'Not specified') {
        const missedText = `Missed: ${sanitizeText(note.whatWasMissed)}`;
        const missedLines = doc.splitTextToSize(missedText, contentWidth - 10) as string[];
        addTextAt(missedLines[0], margin + 5, yPosition + 16, FONT.LABEL, 'normal', COLOR.MUTED);
      }

      if (note.improvementAction) {
        addTextAt(sanitizeText(`Action: ${note.improvementAction}`), margin + 5, yPosition + 20, FONT.LABEL, 'normal', COLOR.PRIMARY);
      }

      yPosition += 25;
    }

    // Summary counts
    checkPageBreak(12);
    yPosition += 2;
    const critCount = options.instructorAssessmentNotes.filter(n => n.severity === 'critical').length;
    const strengthCount = options.instructorAssessmentNotes.filter(n => n.category === 'excellent').length;
    const improvCount = options.instructorAssessmentNotes.filter(n => n.category === 'omitted' || n.category === 'incomplete').length;

    addFilledRoundedRect(margin, yPosition, contentWidth, 8, 2, COLOR.BG_LIGHT);
    addTextAt(
      `Summary: ${critCount} critical  |  ${improvCount} areas for improvement  |  ${strengthCount} strengths noted`,
      margin + 5, yPosition + 5, FONT.LABEL, 'bold', COLOR.MUTED,
    );
    yPosition += 12;
  }

  // ========== FURTHER STUDY RESOURCES ==========
  if (options.debriefingResources && options.debriefingResources.length > 0) {
    addSectionHeader('Further Study Resources');

    const typeOrder = ['guideline', 'article', 'image', 'video', 'podcast', 'case-study'];
    const grouped: Record<string, typeof options.debriefingResources> = {};
    for (const r of options.debriefingResources) {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type]!.push(r);
    }

    for (const type of typeOrder) {
      const resources = grouped[type];
      if (!resources || resources.length === 0) continue;

      checkPageBreak(12);

      const typeLabel = type === 'case-study' ? 'Case Studies' : `${type.charAt(0).toUpperCase() + type.slice(1)}s`;
      addTextAt(typeLabel, margin, yPosition, FONT.BODY, 'bold', COLOR.MUTED);
      yPosition += LINE_HEIGHT.BODY + 2;

      const sorted = [...resources].sort((a, b) => {
        const order: Record<string, number> = { essential: 0, important: 1, supplementary: 2 };
        return (order[a.relevance] || 2) - (order[b.relevance] || 2);
      });

      for (const resource of sorted.slice(0, 5)) {
        checkPageBreak(8);

        addTextAt(`[${resource.source}]`, margin + 2, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);
        addClickableLink(sanitizeText(resource.title), resource.url, margin + 40, yPosition);

        if (resource.relevance === 'essential') {
          addTextAt('*', pageWidth - margin - 5, yPosition, FONT.LABEL, 'normal', COLOR.YELLOW);
        }

        yPosition += LINE_HEIGHT.BODY + 3;
      }

      if (resources.length > 5) {
        addTextAt(`+ ${resources.length - 5} more resources available online`, margin + 40, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);
        yPosition += 5;
      }

      yPosition += 2;
    }

    // Source attribution
    checkPageBreak(8);
    addTextAt(
      'Resources from: NICE, Resuscitation Council UK, Radiopaedia, EMDocs, REBEL EM, ALiEM, EM Cases, EMCrit.',
      margin, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED,
    );
    yPosition += 5;
  }

  // ========== CONDITION-SPECIFIC LEARNING RESOURCES ==========
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
      ...getVideosByFindings(caseFindings),
      ...getVideosByCategory(caseData.category),
    ]
      .filter((v, i, arr) => arr.findIndex(x => x.id === v.id) === i)
      .sort((a, b) => {
        const scoreVideo = (v: typeof a) => {
          let s = 0;
          const nameLower = v.name.toLowerCase();
          if (caseData.subcategory && nameLower.includes(caseData.subcategory.replace(/-/g, ' '))) s += 10;
          if (caseData.title && caseFindings.some(f => nameLower.includes(f.toLowerCase()))) s += 5;
          if (caseData.expectedFindings?.mostLikelyDiagnosis && nameLower.includes(caseData.expectedFindings.mostLikelyDiagnosis.toLowerCase())) s += 8;
          return s;
        };
        return scoreVideo(b) - scoreVideo(a);
      })
      .slice(0, 4);

    const matchedArticles = referenceArticles
      .filter(a =>
        a.category === caseData.category ||
        caseFindings.some(f => a.title.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(a.category))
      )
      .sort((a, b) => {
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
      .filter(a => {
        const titleLower = a.title.toLowerCase();
        if (caseData.subcategory) {
          const sub = caseData.subcategory.toLowerCase().replace(/-/g, ' ');
          if (titleLower.includes('heart failure') && !sub.includes('heart failure')) return false;
          if (titleLower.includes('pulmonary edema') && !sub.includes('pulmonary') && !sub.includes('edema')) return false;
          if (titleLower.includes('pulmonary embolism') && !sub.includes('embolism') && !sub.includes('pe')) return false;
        }
        return true;
      })
      .slice(0, 6);

    if (matchedVideos.length > 0 || matchedArticles.length > 0) {
      addSectionHeader('Condition-Specific Learning Resources');

      addTextAt(
        'The following resources are directly relevant to this case condition.',
        margin, yPosition, FONT.LABEL, 'normal', COLOR.MUTED,
      );
      yPosition += 6;

      // Videos
      if (matchedVideos.length > 0) {
        checkPageBreak(10);
        addTextAt('Educational Videos:', margin, yPosition, FONT.BODY, 'bold', COLOR.RED);
        yPosition += LINE_HEIGHT.BODY + 2;

        for (const video of matchedVideos) {
          checkPageBreak(10);

          addTextAt(`[${video.duration}]`, margin + 2, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);

          const videoUrl = getYouTubeWatchUrl(video.youtubeId);
          addClickableLink(sanitizeText(video.name), videoUrl, margin + 18, yPosition);

          addTextAt(video.source, margin + 18, yPosition + LINE_HEIGHT.BODY, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);

          yPosition += LINE_HEIGHT.BODY * 2 + 2;
        }
        yPosition += 2;
      }

      // Articles
      if (matchedArticles.length > 0) {
        checkPageBreak(10);
        addTextAt('Reference Articles & Guidelines:', margin, yPosition, FONT.BODY, 'bold', COLOR.PRIMARY);
        yPosition += LINE_HEIGHT.BODY + 2;

        for (const article of matchedArticles) {
          checkPageBreak(8);

          addTextAt(`[${article.source}]`, margin + 2, yPosition, FONT.LABEL, 'normal', COLOR.LIGHT_MUTED);
          addClickableLink(sanitizeText(article.title), article.url, margin + 40, yPosition);

          yPosition += LINE_HEIGHT.BODY + 3;
        }
        yPosition += 2;
      }
    }
  }

  // ========== PAGE BORDERS + FOOTER ON EVERY PAGE ==========
  const totalPages = (doc.internal.pages.length - 1) as number;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Subtle gray border around the content area of each page
    doc.setDrawColor(COLOR.BORDER_GRAY[0], COLOR.BORDER_GRAY[1], COLOR.BORDER_GRAY[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(
      PAGE_BORDER_INSET,
      PAGE_BORDER_INSET,
      pageWidth - 2 * PAGE_BORDER_INSET,
      pageHeight - 2 * PAGE_BORDER_INSET,
      2, 2, 'S',
    );

    // Footer separator line
    doc.setDrawColor(COLOR.BORDER_GRAY[0], COLOR.BORDER_GRAY[1], COLOR.BORDER_GRAY[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    // Footer text
    addCenteredText(
      `Page ${i} of ${totalPages}  |  UAE Paramedic Case Generator  |  Session: ${session.id}`,
      pageHeight - 9,
      FONT.LABEL,
      'normal',
      COLOR.LIGHT_MUTED,
    );
  }

  // Save the PDF
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
