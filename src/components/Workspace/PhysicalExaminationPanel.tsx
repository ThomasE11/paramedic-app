/**
 * PhysicalExaminationPanel - 3D Body Model Integration
 * 
 * Wraps the Body3DModel component for use in the workspace.
 * Provides glassmorphism styling and integration with case data.
 */

import { useState, useCallback, useMemo } from 'react';
import { Body3DModel } from '@/components/Body3DModel';
import type { CaseScenario } from '@/types';
import type { AssessmentStepId } from '@/data/assessmentFramework';
import { User, ChevronDown, ChevronUp } from 'lucide-react';

interface PhysicalExaminationPanelProps {
  caseData: CaseScenario;
  isStudentView?: boolean;
}

export function PhysicalExaminationPanel({ caseData, isStudentView = false }: PhysicalExaminationPanelProps) {
  const [assessedRegions, setAssessedRegions] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(true);

  const handleRegionClick = useCallback((stepId: AssessmentStepId) => {
    setAssessedRegions(prev => {
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);

  // Compute patient sounds from case data
  const patientSounds = useMemo(() => {
    const breathing = caseData.abcde?.breathing;
    const circ = caseData.abcde?.circulation;
    const airway = caseData.abcde?.airway;
    
    // Determine breath sound type
    let leftLung: string = 'clear';
    let rightLung: string = 'clear';
    
    if (breathing?.findings) {
      const findings = breathing.findings.join(' ').toLowerCase();
      if (findings.includes('wheeze')) {
        leftLung = 'wheeze';
        rightLung = 'wheeze';
      } else if (findings.includes('crackle')) {
        leftLung = 'crackles';
        rightLung = 'crackles';
      } else if (findings.includes('diminished') || findings.includes('reduced air entry')) {
        leftLung = 'diminished';
        rightLung = 'diminished';
      } else if (findings.includes('pneumothorax')) {
        leftLung = 'absent';
        rightLung = 'clear';
      }
    }

    // Determine heart sound
    let heartSound: string = 'normal';
    if (circ?.ecgFindings) {
      const ecgText = circ.ecgFindings.join(' ').toLowerCase();
      if (ecgText.includes('stemi') || ecgText.includes('mi')) {
        heartSound = 'gallop';
      } else if (ecgText.includes('tamponade')) {
        heartSound = 'muffled';
      }
    }

    // Determine airway sound
    let airwaySound: string = 'clear';
    if (airway?.findings) {
      const airwayText = airway.findings.join(' ').toLowerCase();
      if (airwayText.includes('stridor')) {
        airwaySound = 'stridor';
      } else if (airwayText.includes('gurgling')) {
        airwaySound = 'rhonchi';
      } else if (airwayText.includes('snoring')) {
        airwaySound = 'snoring';
      }
    }

    return {
      leftLung: leftLung as any,
      rightLung: rightLung as any,
      heartSound: heartSound as any,
      airwaySound: airwaySound as any,
      additionalSounds: [],
      description: '',
    };
  }, [caseData]);

  // Check if patient is in cardiac arrest
  const isInArrest = useMemo(() => {
    return caseData.vitalSignsProgression?.initial?.pulse === 0 || 
           caseData.abcde?.circulation?.pulseRate === 0;
  }, [caseData]);

  return (
    <div className="glass-strong rounded-xl overflow-hidden border border-white/5 dark:border-white/[0.06]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 ring-1 ring-teal-500/15">
            <User className="h-3.5 w-3.5 text-teal-500/80" />
          </div>
          <div>
            <p className="text-[9px] font-medium tracking-[0.25em] uppercase text-muted-foreground/60">Phase 3</p>
            <h3 className="text-sm font-semibold tracking-tight leading-tight">Physical Examination</h3>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* 3D Model */}
      {isExpanded && (
        <div className="p-2">
          <div className="relative w-full" style={{ height: '380px' }}>
            <Body3DModel
              onRegionClick={handleRegionClick}
              assessedRegions={assessedRegions}
              caseData={caseData}
              patientSounds={patientSounds}
              isStudentView={isStudentView}
              caseCategory={caseData.category}
              isInArrest={isInArrest}
            />
          </div>
        </div>
      )}

      {/* Assessment progress */}
      {isExpanded && (
        <div className="px-4 py-2 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {assessedRegions.size} / 11 regions assessed
            </span>
            <div className="flex gap-1">
              {['head', 'face', 'neck-cspine', 'chest', 'abdomen', 'pelvis', 'right-arm', 'left-arm', 'right-leg', 'left-leg', 'posterior-logroll'].map((region) => (
                <div
                  key={region}
                  className={`w-1.5 h-1.5 rounded-full ${
                    assessedRegions.has(region) ? 'bg-emerald-400' : 'bg-muted-foreground/20'
                  }`}
                  title={region}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhysicalExaminationPanel;
