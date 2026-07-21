/**
 * TwelveLeadReport — print-style 12-lead ECG report.
 *
 * Renders like a real ECG printout on pink graph paper:
 * - 4 columns x 3 rows (I, II, III / aVR, aVL, aVF / V1-V3 / V4-V6)
 * - Continuous Lead II rhythm strip along the bottom
 * - 1mm minor grid + 5mm major grid at 25mm/s, 10mm/mV calibration
 * - Calibration pulse (1mV square) at the start of each row
 * - Machine interpretation header: rate, PR, QRS, QT/QTc, axis
 * - Red ACUTE-MI banner for territorial STEMI
 * - Print / export button
 *
 * Retina-crisp: the canvas backing store is scaled by devicePixelRatio.
 * Animated via a single requestAnimationFrame loop (iPad-safe).
 */

import { useEffect, useRef } from 'react';
import { FileHeart, Printer, X } from 'lucide-react';
import {
  measureRhythm,
  stemiTerritory,
  type ECGRhythm,
  type LeadName,
  type WaveformContext,
} from '@/data/ecgRhythms';

interface TwelveLeadReportProps {
  rhythm: ECGRhythm;
  heartRate: number;
  onClose: () => void;
}

// ECG paper: 25mm/s, 10mm/mV. 4px per mm renders crisp and fits on screen.
const PX_PER_MM = 4;
const SMALL = PX_PER_MM; // 1mm minor grid
const LARGE = PX_PER_MM * 5; // 5mm major grid
const MM_PER_SEC = 25;
const MV_HEIGHT_MM = 10; // 1mV = 10mm deflection

// Layout — the 4x3 grid + rhythm strip. Standard cabrera-ish column order.
const GRID: LeadName[][] = [
  ['I', 'aVR', 'V1', 'V4'],
  ['II', 'aVL', 'V2', 'V5'],
  ['III', 'aVF', 'V3', 'V6'],
];

const LABEL_W = 8 * PX_PER_MM; // left margin for row labels
const CAL_W = 5 * PX_PER_MM; // 5mm calibration pulse
const LEAD_SEC = 2.5; // each lead cell shows 2.5s
const LEAD_W = Math.round(LEAD_SEC * MM_PER_SEC * PX_PER_MM); // 250px
const ROW_H = 20 * PX_PER_MM; // 20mm tall (±1mV headroom) = 80px
const HEADER_H = 66;
const STRIP_H = ROW_H;

const PAPER = '#fff1f2'; // pink ECG paper
const MINOR = 'rgba(244, 160, 170, 0.55)';
const MAJOR = 'rgba(219, 112, 122, 0.75)';
const INK = '#1a1a1a';

const COLS = 4;
const ROWS = 3;
const TOTAL_W = LABEL_W + COLS * (CAL_W + LEAD_W);
const GRID_H = ROWS * ROW_H + STRIP_H;
const TOTAL_H = HEADER_H + GRID_H + 6;

/** Draw a calibration pulse: baseline, up 1mV, plateau, back to baseline. */
function drawCalPulse(ctx: CanvasRenderingContext2D, x: number, midY: number) {
  const calH = MV_HEIGHT_MM * PX_PER_MM;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, midY);
  ctx.lineTo(x + SMALL, midY);
  ctx.lineTo(x + SMALL, midY - calH);
  ctx.lineTo(x + CAL_W - SMALL, midY - calH);
  ctx.lineTo(x + CAL_W - SMALL, midY);
  ctx.lineTo(x + CAL_W, midY);
  ctx.stroke();
}

/** Draw one lead's trace over `widthPx` starting at (startX, midY). */
function drawTrace(
  ctx: CanvasRenderingContext2D,
  rhythm: ECGRhythm,
  lead: LeadName,
  startX: number,
  midY: number,
  widthPx: number,
  pxPerBeat: number,
  heartRate: number,
  scroll: number,
) {
  const wfn = rhythm.leads[lead] ?? rhythm.leads.II;
  const mvPx = MV_HEIGHT_MM * PX_PER_MM;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  let prevBP = 0;
  let beatIdx = 0;
  for (let px = 0; px < widthPx; px++) {
    const beatProgress = ((px + scroll) / pxPerBeat) % 1;
    if (beatProgress < prevBP && prevBP > 0.5) beatIdx++;
    prevBP = beatProgress;
    const ctx12: WaveformContext = { heartRate, beatIndex: beatIdx };
    const y = midY - wfn(beatProgress, ctx12) * mvPx;
    if (px === 0) ctx.moveTo(startX + px, y);
    else ctx.lineTo(startX + px, y);
  }
  ctx.stroke();
}

export function TwelveLeadReport({ rhythm, heartRate, onClose }: TwelveLeadReportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const scrollRef = useRef(0);

  const m = measureRhythm(rhythm, heartRate);
  const territory = stemiTerritory(rhythm.id);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina backing store — draw in CSS px, scale for device pixels.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(TOTAL_W * dpr);
    canvas.height = Math.round(TOTAL_H * dpr);
    canvas.style.width = `${TOTAL_W}px`;
    canvas.style.height = `${TOTAL_H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Rhythm-strip only scrolls; the 12 leads are static frozen samples (like a
    // real printout). Only the bottom Lead II strip animates.
    const beatsPerSec = heartRate > 0 ? heartRate / 60 : 5; // arrest → synthetic tick
    const pxPerBeat = (MM_PER_SEC * PX_PER_MM) / beatsPerSec;
    const pxPerSec = MM_PER_SEC * PX_PER_MM;
    let last = performance.now();

    const drawGrid = () => {
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, TOTAL_W, TOTAL_H);
      const top = HEADER_H;
      ctx.strokeStyle = MINOR;
      ctx.lineWidth = 0.5;
      for (let y = top; y <= top + GRID_H; y += SMALL) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TOTAL_W, y); ctx.stroke();
      }
      for (let x = 0; x <= TOTAL_W; x += SMALL) {
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + GRID_H); ctx.stroke();
      }
      ctx.strokeStyle = MAJOR;
      ctx.lineWidth = 1;
      for (let y = top; y <= top + GRID_H; y += LARGE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TOTAL_W, y); ctx.stroke();
      }
      for (let x = 0; x <= TOTAL_W; x += LARGE) {
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + GRID_H); ctx.stroke();
      }
    };

    const drawHeader = () => {
      ctx.fillStyle = INK;
      ctx.font = 'bold 13px monospace';
      ctx.fillText('12-LEAD ECG', 8, 18);
      ctx.font = '10px monospace';
      const measures = `HR ${m.rate}/min   PR ${m.prIntervalMs ?? '--'} ms   QRS ${m.qrsDurationMs} ms   QT/QTc ${m.qtIntervalMs}/${m.qtcMs} ms   Axis ${m.axisDegrees >= 0 ? '+' : ''}${m.axisDegrees}° (${m.axisLabel})`;
      ctx.fillText(measures, 8, 34);
      ctx.fillStyle = '#555';
      ctx.font = '9px monospace';
      ctx.fillText('25 mm/s    10 mm/mV    1 sq = 0.04s / 0.1mV', 8, 47);

      if (territory) {
        // Red ACUTE MI banner
        const bx = TOTAL_W - 262;
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(bx, 6, 254, 22);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`*** ACUTE MI SUSPECTED ***`, bx + 10, 21);
        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(territory, bx + 4, 42);
      }
    };

    const draw = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      scrollRef.current += pxPerSec * dt;

      drawGrid();
      drawHeader();

      // 12 leads — static (frozen strip), each with a cal pulse.
      GRID.forEach((rowLeads, r) => {
        rowLeads.forEach((lead, c) => {
          const cellX = LABEL_W + c * (CAL_W + LEAD_W);
          const cellY = HEADER_H + r * ROW_H;
          const midY = cellY + ROW_H / 2;
          drawCalPulse(ctx, cellX, midY);
          // Lead label top-left of the cell
          ctx.fillStyle = INK;
          ctx.font = 'bold 10px monospace';
          ctx.fillText(lead, cellX + CAL_W + 3, cellY + 12);
          drawTrace(ctx, rhythm, lead, cellX + CAL_W, midY, LEAD_W, pxPerBeat, heartRate, 0);
        });
      });

      // Rhythm strip — Lead II, full width, animated scroll.
      const stripY = HEADER_H + ROWS * ROW_H;
      const stripMid = stripY + STRIP_H / 2;
      drawCalPulse(ctx, LABEL_W, stripMid);
      ctx.fillStyle = INK;
      ctx.font = 'bold 10px monospace';
      ctx.fillText('II', 4, stripMid - 2);
      ctx.font = '8px monospace';
      ctx.fillText('rhythm', 4, stripMid + 10);
      drawTrace(
        ctx, rhythm, 'II', LABEL_W + CAL_W, stripMid,
        TOTAL_W - LABEL_W - CAL_W, pxPerBeat, heartRate, scrollRef.current,
      );

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [rhythm, heartRate, m, territory]);

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      `<html><head><title>12-Lead ECG — ${rhythm.name}</title></head>` +
      `<body style="margin:0"><img src="${dataUrl}" style="width:100%"/>` +
      `<script>window.onload=function(){window.print();}</script></body></html>`,
    );
    w.document.close();
  };

  return (
    <div className="rounded-xl overflow-hidden border-2 border-gray-700"
      style={{ background: 'linear-gradient(145deg, #2a2d31 0%, #1e2024 100%)' }}>
      {/* Header bar */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-700/50"
        style={{ background: 'linear-gradient(180deg, #3a3d42 0%, #2e3136 100%)' }}>
        <div className="flex items-center gap-3">
          <FileHeart className="h-4 w-4 text-green-400" />
          <span className="text-[11px] font-mono font-bold text-green-400 tracking-wider">12-LEAD ECG REPORT</span>
          <span className="text-[9px] font-mono text-gray-400">{rhythm.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrint}
            className="px-2 py-1 rounded text-[8px] font-mono font-bold text-cyan-400 bg-cyan-900/30 hover:bg-cyan-800/40 border border-cyan-700/50 transition-colors flex items-center gap-1"
          >
            <Printer className="h-3 w-3" /> PRINT
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Paper canvas — horizontally scrollable on narrow screens */}
      <div className="overflow-auto p-2" style={{ background: '#111' }}>
        <canvas ref={canvasRef} className="mx-auto block rounded shadow-lg" />
      </div>

      {/* Machine interpretation footer */}
      <div className="px-3 py-2 border-t border-gray-700/30" style={{ background: 'rgba(0,0,0,0.35)' }}>
        <span className="text-[9px] font-mono text-green-400 font-bold block mb-1">MACHINE INTERPRETATION</span>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
          {m.interpretation.map((line, i) => (
            <span
              key={i}
              className={`text-[9px] font-mono ${line.includes('ACUTE MI') ? 'text-red-400 font-bold' : 'text-gray-300'}`}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
