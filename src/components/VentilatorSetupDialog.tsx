/**
 * Ventilator Setup Dialog
 *
 * Modal for configuring mechanical ventilation settings in the simulator.
 * Students choose mode, tidal volume, rate, FiO2, PEEP, and I:E ratio.
 * The dialog validates common protective-ventilation ranges (e.g. 6–8 mL/kg
 * tidal volume, PEEP 5 cmH2O default) and warns on unsafe combinations.
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Wind, Gauge, Activity } from 'lucide-react';

export interface VentilatorSettings {
  mode: VentilatorMode;
  tidalVolumeMl: number;
  respiratoryRate: number;
  fio2Percent: number;
  peepCmH2O: number;
  ieRatio: string;
}

export type VentilatorMode =
  | 'AC-VC'   // Assist control, volume control — default adult
  | 'AC-PC'   // Assist control, pressure control
  | 'SIMV'    // Synchronized intermittent mandatory ventilation
  | 'PS'      // Pressure support (spontaneous)
  | 'CPAP'    // Continuous positive airway pressure
  | 'BiPAP';  // Bilevel positive airway pressure

interface VentilatorSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (settings: VentilatorSettings) => void;
  patientWeightKg?: number;
  /** Used to pre-populate sensible defaults based on case context. */
  context?: 'ards' | 'copd' | 'arrest' | 'pediatric' | 'default';
}

const MODE_OPTIONS: { value: VentilatorMode; label: string; hint: string }[] = [
  { value: 'AC-VC', label: 'AC / Volume Control', hint: 'Default adult setting — guaranteed tidal volume.' },
  { value: 'AC-PC', label: 'AC / Pressure Control', hint: 'Pressure-limited — useful in ARDS or paediatrics.' },
  { value: 'SIMV', label: 'SIMV', hint: 'Mixed mandatory + spontaneous breaths — weaning.' },
  { value: 'PS', label: 'Pressure Support', hint: 'Spontaneous breathing only — late weaning.' },
  { value: 'CPAP', label: 'CPAP', hint: 'Continuous pressure — obstructive disease, APO.' },
  { value: 'BiPAP', label: 'BiPAP', hint: 'IPAP + EPAP — COPD exacerbation, type-2 failure.' },
];

export function VentilatorSetupDialog({
  open,
  onClose,
  onConfirm,
  patientWeightKg = 70,
  context = 'default',
}: VentilatorSetupDialogProps) {
  // Defaults scale with patient weight using 6 mL/kg (protective ventilation).
  const targetTv = Math.round(patientWeightKg * 6);
  const isPed = context === 'pediatric' || patientWeightKg < 30;

  const [mode, setMode] = useState<VentilatorMode>(context === 'copd' ? 'BiPAP' : 'AC-VC');
  const [tidalVolume, setTidalVolume] = useState(targetTv);
  const [rate, setRate] = useState(isPed ? 20 : context === 'arrest' ? 10 : 14);
  const [fio2, setFio2] = useState(context === 'arrest' || context === 'ards' ? 100 : 40);
  const [peep, setPeep] = useState(context === 'ards' ? 8 : 5);
  const [ieRatio, setIeRatio] = useState(context === 'copd' ? '1:3' : '1:2');

  const warnings = useMemo(() => {
    const w: string[] = [];
    const tvPerKg = tidalVolume / patientWeightKg;
    if (tvPerKg > 8) w.push(`Tidal volume ${tvPerKg.toFixed(1)} mL/kg — above 8 mL/kg protective threshold.`);
    if (tvPerKg < 4) w.push(`Tidal volume ${tvPerKg.toFixed(1)} mL/kg — too low, risk of atelectasis.`);
    if (fio2 >= 80 && peep < 8) w.push('High FiO2 (≥80%) with low PEEP — consider increasing PEEP for shunt.');
    if (peep > 15) w.push('PEEP >15 cmH2O — high risk of barotrauma / haemodynamic compromise.');
    if (context === 'copd' && rate > 16) w.push('High rate in COPD — risk of dynamic hyperinflation (auto-PEEP). Target RR 10–14.');
    if (context === 'arrest' && rate > 10) w.push('In cardiac arrest, ventilate at 10/min. Higher rates reduce coronary perfusion.');
    if (mode === 'CPAP' && rate > 0) w.push('CPAP is spontaneous — the set rate only applies if back-up ventilation is on.');
    return w;
  }, [tidalVolume, rate, fio2, peep, mode, context, patientWeightKg]);

  const handleConfirm = () => {
    onConfirm({
      mode,
      tidalVolumeMl: tidalVolume,
      respiratoryRate: rate,
      fio2Percent: fio2,
      peepCmH2O: peep,
      ieRatio,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Wind className="h-5 w-5" />
            Mechanical Ventilator Setup
          </DialogTitle>
          <DialogDescription>
            Set mode and parameters before initiating ventilation.
            Defaults are calculated from a {patientWeightKg}&nbsp;kg patient.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mode</label>
            <div className="grid grid-cols-2 gap-1.5">
              {MODE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`text-left p-2 rounded-lg border-2 transition-all ${
                    mode === opt.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-border/40 hover:border-blue-400/60 hover:bg-accent/30'
                  }`}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{opt.hint}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Numeric controls — 2 columns on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumericField
              label="Tidal Volume"
              unit="mL"
              value={tidalVolume}
              min={100}
              max={1000}
              step={10}
              onChange={setTidalVolume}
              badge={`${(tidalVolume / patientWeightKg).toFixed(1)} mL/kg`}
              icon={<Gauge className="h-3.5 w-3.5" />}
            />
            <NumericField
              label="Respiratory Rate"
              unit="/min"
              value={rate}
              min={0}
              max={40}
              step={1}
              onChange={setRate}
              icon={<Activity className="h-3.5 w-3.5" />}
            />
            <NumericField
              label="FiO2"
              unit="%"
              value={fio2}
              min={21}
              max={100}
              step={5}
              onChange={setFio2}
              icon={<Wind className="h-3.5 w-3.5" />}
            />
            <NumericField
              label="PEEP"
              unit="cmH2O"
              value={peep}
              min={0}
              max={20}
              step={1}
              onChange={setPeep}
              icon={<Gauge className="h-3.5 w-3.5" />}
            />
          </div>

          {/* I:E ratio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">I:E Ratio</label>
            <div className="flex gap-1.5 flex-wrap">
              {['1:1', '1:2', '1:3', '1:4'].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setIeRatio(ratio)}
                  className={`px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
                    ieRatio === ratio
                      ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                      : 'border-border/40 hover:border-blue-400/60'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="rounded-lg border-2 border-amber-500/40 bg-amber-500/10 p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Check settings</span>
              </div>
              {warnings.map((w, i) => (
                <p key={i} className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">• {w}</p>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="rounded-lg bg-muted/40 border border-border/30 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Summary</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-[10px]">{mode}</Badge>
              <Badge variant="secondary" className="text-[10px]">Vt {tidalVolume} mL</Badge>
              <Badge variant="secondary" className="text-[10px]">RR {rate}</Badge>
              <Badge variant="secondary" className="text-[10px]">FiO2 {fio2}%</Badge>
              <Badge variant="secondary" className="text-[10px]">PEEP {peep}</Badge>
              <Badge variant="secondary" className="text-[10px]">I:E {ieRatio}</Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Wind className="h-4 w-4 mr-1.5" />
            Start Ventilation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NumericField({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  badge,
  icon,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  badge?: string;
  icon?: React.ReactNode;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          {icon}{label}
        </label>
        {badge && <Badge variant="outline" className="text-[9px]">{badge}</Badge>}
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onChange(clamp(value - step))}
          aria-label={`Decrease ${label}`}
        >−</Button>
        <div className="flex-1 text-center font-mono text-sm font-bold bg-muted/30 border border-border/30 rounded-lg py-1.5">
          {value}<span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onChange(clamp(value + step))}
          aria-label={`Increase ${label}`}
        >+</Button>
      </div>
    </div>
  );
}

export default VentilatorSetupDialog;
