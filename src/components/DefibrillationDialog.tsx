/**
 * Defibrillation Dialog
 *
 * Modal for selecting defibrillation/cardioversion parameters:
 * - Energy level (50J, 100J, 150J, 200J, 360J)
 * - Synchronized vs Unsynchronized
 * - Shows current rhythm context
 * - Warns about inappropriate settings
 */

import { useState } from 'react';
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
import { AlertTriangle, Zap, Activity, Shield } from 'lucide-react';
import type { DefibrillationParams } from '@/data/dynamicTreatmentEngine';

interface DefibrillationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (params: DefibrillationParams) => void;
  currentRhythm: string;
  currentPulse: number;
}

const ENERGY_LEVELS = [50, 100, 150, 200, 360] as const;

export function DefibrillationDialog({
  open,
  onClose,
  onConfirm,
  currentRhythm,
  currentPulse,
}: DefibrillationDialogProps) {
  const [selectedEnergy, setSelectedEnergy] = useState<number>(150);
  const [synchronized, setSynchronized] = useState(false);

  const hasPulse = currentPulse > 0;
  const isShockableRhythm = ['Ventricular Fibrillation', 'Ventricular Tachycardia', 'SVT'].includes(currentRhythm);
  const isNonShockable = ['Asystole', 'PEA'].includes(currentRhythm);
  const isVT = currentRhythm === 'Ventricular Tachycardia';
  const isVF = currentRhythm === 'Ventricular Fibrillation';

  // Determine warnings
  const warnings: string[] = [];
  if (isNonShockable) {
    warnings.push(`${currentRhythm} is a NON-SHOCKABLE rhythm. Defibrillation is NOT indicated.`);
  }
  if (isVT && hasPulse && !synchronized) {
    warnings.push('VT with a pulse should be treated with SYNCHRONIZED cardioversion. Unsynchronized shock may cause VF.');
  }
  if (isVF && synchronized) {
    warnings.push('VF should be treated with UNSYNCHRONIZED defibrillation. Sync mode may fail to identify R wave.');
  }
  if (!isShockableRhythm && !isNonShockable) {
    warnings.push('Current rhythm does not appear to require defibrillation.');
  }

  const handleConfirm = () => {
    onConfirm({
      energy: selectedEnergy,
      synchronized,
      currentRhythm,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-500/10">
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            Defibrillation / Cardioversion
          </DialogTitle>
          <DialogDescription>
            Select energy level and mode. Verify rhythm before shocking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current Rhythm Display */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Current Rhythm</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isShockableRhythm ? 'destructive' : isNonShockable ? 'secondary' : 'outline'}>
                {currentRhythm}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {hasPulse ? `Pulse: ${currentPulse} bpm` : 'No pulse detected'}
              </span>
            </div>
          </div>

          {/* Energy Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Energy Level (Joules)</label>
            <div className="grid grid-cols-5 gap-1.5">
              {ENERGY_LEVELS.map((energy) => (
                <button
                  key={energy}
                  onClick={() => setSelectedEnergy(energy)}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                    selectedEnergy === energy
                      ? 'bg-yellow-500 text-white shadow-lg scale-105'
                      : 'bg-muted hover:bg-muted/80 text-foreground border border-border/50'
                  }`}
                >
                  {energy}J
                </button>
              ))}
            </div>
          </div>

          {/* Sync Mode */}
          <div>
            <label className="text-sm font-medium mb-2 block">Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSynchronized(false)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  !synchronized
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 ring-2 ring-red-500/30'
                    : 'bg-card border-border/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className={`h-4 w-4 ${!synchronized ? 'text-red-600' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-semibold ${!synchronized ? 'text-red-700 dark:text-red-300' : ''}`}>
                    Defibrillation
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Unsynchronized. For VF/pulseless VT.
                </p>
              </button>

              <button
                onClick={() => setSynchronized(true)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  synchronized
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/30'
                    : 'bg-card border-border/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className={`h-4 w-4 ${synchronized ? 'text-blue-600' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-semibold ${synchronized ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                    Cardioversion
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Synchronized. For VT with pulse, SVT, AF.
                </p>
              </button>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-1.5">
              {warnings.map((warning, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-amber-800 dark:text-amber-300">{warning}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Zap className="h-4 w-4 mr-1" />
            Shock {selectedEnergy}J {synchronized ? '(Sync)' : '(Defib)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DefibrillationDialog;
