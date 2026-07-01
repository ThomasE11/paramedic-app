import { useState, useEffect, useRef } from 'react';
import type { VitalSigns } from '@/types';

interface WaveformData {
  hr: number;
  bp: string;
  spo2: number;
  rr: number;
  temp: number;
  gcs: number;
  etco2: number;
}

interface DeteriorationStatus {
  status: 'stable' | 'worsening' | 'critical' | 'periarrest';
  timeRemaining: number;
  percentDeteriorated: number;
  urgency: 'low' | 'medium' | 'high' | 'extreme';
}

interface PatientMonitorProps {
  vitals: VitalSigns | null;
  previousVitals?: VitalSigns | null;
  deteriorationStatus?: DeteriorationStatus;
}

export function PatientMonitor({ vitals, previousVitals, deteriorationStatus }: PatientMonitorProps) {
  const [time, setTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const data: WaveformData = {
    hr: vitals?.pulse || 72,
    bp: vitals?.bp || '120/80',
    spo2: vitals?.spo2 || 98,
    rr: vitals?.respiration || 16,
    temp: vitals?.temperature || 36.5,
    gcs: vitals?.gcs || 15,
    etco2: vitals?.etco2 || 35,
  };

  const isCritical = data.hr > 120 || data.hr < 50 || data.spo2 < 92 || data.rr > 30;

  // Draw ECG waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Grid
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // ECG waveform
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(20, 184, 166, 0.5)';
      ctx.shadowBlur = 4;
      ctx.beginPath();

      const speed = data.hr / 60;
      for (let x = 0; x < width; x++) {
        const t = (x + offset) * 0.05 * speed;
        let y = height / 2;
        
        // P wave
        y -= Math.sin(t * 0.5) * 5 * Math.exp(-Math.pow((t % 6.28 - 1) * 2, 2));
        // QRS complex
        const qrsPhase = (t % 6.28 + 5.5) % 6.28;
        if (qrsPhase < 0.3) {
          y += Math.sin(qrsPhase * 10) * 25;
        }
        // T wave
        y -= Math.sin(t * 0.3) * 8 * Math.exp(-Math.pow((t % 6.28 - 4) * 1.5, 2));
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      offset += 2;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [data.hr]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const parseBP = (bp: string) => {
    const parts = bp.split('/');
    return { systolic: parseInt(parts[0]) || 120, diastolic: parseInt(parts[1]) || 80 };
  };
  const bp = parseBP(data.bp);

  return (
    <div className="glass-strong rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
        <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Patient Monitor</span>
        <div className="flex items-center gap-2">
          {deteriorationStatus && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              deteriorationStatus.urgency === 'extreme' ? 'bg-red-500/20 text-red-400' :
              deteriorationStatus.urgency === 'high' ? 'bg-orange-500/20 text-orange-400' :
              deteriorationStatus.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {deteriorationStatus.status}
            </span>
          )}
          <span className="text-[10px] font-mono text-surface-400">{formatTime(time)}</span>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isCritical ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
        </div>
      </div>

      <div className="monitor-grid p-4 space-y-4">
        {/* ECG Lead II */}
        <div className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-emerald-400/70">LEAD II</span>
            <span className={`text-[10px] font-mono vital-value vital-pulse ${data.hr > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
              {data.hr}
            </span>
          </div>
          <svg viewBox="0 0 300 60" className="w-full h-14">
            <path 
              className="ecg-path" 
              d="M0,30 L20,30 L25,20 L30,40 L35,30 L50,30 L55,15 L60,45 L65,30 L80,30 L85,25 L90,35 L95,30 L110,30 L115,10 L120,50 L125,30 L140,30 L145,20 L150,40 L155,30 L170,30 L175,15 L180,45 L185,30 L200,30 L205,25 L210,35 L215,30 L230,30 L235,10 L240,50 L245,30 L260,30 L265,20 L270,40 L275,30 L290,30 L295,25 L300,35"
              fill="none"
              stroke="#14b8a6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 4px rgba(20,184,166,0.5)) drop-shadow(0 0 8px rgba(20,184,166,0.3))' }}
            />
          </svg>
        </div>

        {/* SpO2 Waveform */}
        <div className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-sky-400/70">SpO2</span>
            <span className="text-[10px] font-mono text-sky-400 vital-value">{data.spo2}%</span>
          </div>
          <svg viewBox="0 0 300 40" className="w-full h-10">
            <path 
              d="M0,20 Q15,5 30,20 Q45,35 60,20 Q75,5 90,20 Q105,35 120,20 Q135,5 150,20 Q165,35 180,20 Q195,5 210,20 Q225,35 240,20 Q255,5 270,20 Q285,35 300,20"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.5))' }}
            />
          </svg>
        </div>

        {/* Numeric Vitals Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-lg p-2 border ${data.hr > 100 || data.hr < 50 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className="text-[9px] font-mono text-surface-400 uppercase mb-0.5">HR</div>
            <div className="flex items-baseline gap-1">
              <div className={`text-xl font-mono font-bold vital-value ${data.hr > 100 || data.hr < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                {data.hr}
              </div>
              {previousVitals?.pulse && (
                <span className={`text-[10px] ${data.hr > previousVitals.pulse ? 'text-red-400' : data.hr < previousVitals.pulse ? 'text-emerald-400' : 'text-surface-500'}`}>
                  {data.hr > previousVitals.pulse ? '↑' : data.hr < previousVitals.pulse ? '↓' : '−'}
                </span>
              )}
            </div>
            <div className="text-[9px] font-mono text-emerald-400/50">bpm</div>
          </div>
          <div className={`rounded-lg p-2 border ${bp.systolic < 90 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className="text-[9px] font-mono text-surface-400 uppercase mb-0.5">BP</div>
            <div className="flex items-baseline gap-1">
              <div className={`text-xl font-mono font-bold vital-value ${bp.systolic < 90 ? 'text-red-400' : 'text-amber-400'}`}>
                {data.bp}
              </div>
              {previousVitals?.bp && (
                <span className="text-[10px] text-surface-500">
                  {bp.systolic < parseInt(previousVitals.bp.split('/')[0]) ? '↓' : bp.systolic > parseInt(previousVitals.bp.split('/')[0]) ? '↑' : '−'}
                </span>
              )}
            </div>
            <div className="text-[9px] font-mono text-amber-400/50">mmHg</div>
          </div>
          <div className={`rounded-lg p-2 border ${data.spo2 < 92 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className="text-[9px] font-mono text-surface-400 uppercase mb-0.5">SpO2</div>
            <div className="flex items-baseline gap-1">
              <div className={`text-xl font-mono font-bold vital-value ${data.spo2 < 92 ? 'text-red-400' : 'text-sky-400'}`}>
                {data.spo2}
              </div>
              {previousVitals?.spo2 && (
                <span className={`text-[10px] ${data.spo2 < previousVitals.spo2 ? 'text-red-400' : data.spo2 > previousVitals.spo2 ? 'text-emerald-400' : 'text-surface-500'}`}>
                  {data.spo2 < previousVitals.spo2 ? '↓' : data.spo2 > previousVitals.spo2 ? '↑' : '−'}
                </span>
              )}
            </div>
            <div className="text-[9px] font-mono text-sky-400/50">%</div>
          </div>
          <div className={`rounded-lg p-2 border ${data.rr > 30 || data.rr < 8 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className="text-[9px] font-mono text-surface-400 uppercase mb-0.5">RR</div>
            <div className="flex items-baseline gap-1">
              <div className={`text-xl font-mono font-bold vital-value ${data.rr > 30 || data.rr < 8 ? 'text-red-400' : 'text-surface-300'}`}>
                {data.rr}
              </div>
              {previousVitals?.respiration && (
                <span className={`text-[10px] ${data.rr > previousVitals.respiration ? 'text-red-400' : data.rr < previousVitals.respiration ? 'text-emerald-400' : 'text-surface-500'}`}>
                  {data.rr > previousVitals.respiration ? '↑' : data.rr < previousVitals.respiration ? '↓' : '−'}
                </span>
              )}
            </div>
            <div className="text-[9px] font-mono text-surface-400/50">/min</div>
          </div>
        </div>

        {/* Temp & GCS */}
        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="text-[9px] font-mono text-surface-400 uppercase">Temp</div>
            <div className="text-sm font-mono font-bold text-surface-300 vital-value">{data.temp}°C</div>
          </div>
          <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="text-[9px] font-mono text-surface-400 uppercase">GCS</div>
            <div className="text-sm font-mono font-bold text-surface-300 vital-value">{data.gcs}</div>
          </div>
          <div className="flex-1 bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="text-[9px] font-mono text-surface-400 uppercase">EtCO2</div>
            <div className="text-sm font-mono font-bold text-surface-300 vital-value">{data.etco2}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
