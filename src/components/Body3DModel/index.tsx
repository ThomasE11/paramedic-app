/**
 * 3D Physical Examination
 *
 * Three-panel layout when a body region is clicked:
 * LEFT: Assessment options (inspect, palpate, percuss, auscultate)
 * CENTER: 3D body model
 * RIGHT: Findings revealed when an assessment action is clicked
 *
 * When no region is selected, the body model fills the full width.
 */

import { useRef, useCallback, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, User, Eye, Hand, Activity, Stethoscope, Heart, X, ChevronRight } from 'lucide-react';
import { BodyMesh } from './BodyMesh';
import type { AssessmentStepId } from '@/data/assessmentFramework';
import type { CaseScenario } from '@/types';

const TOTAL_REGIONS = 8;

// ============================================================================
// Region config — what exams can be done per body region
// ============================================================================

interface ExamAction {
  id: string;
  label: string;
  technique: 'inspect' | 'palpate' | 'percuss' | 'auscultate';
}

interface SubRegion {
  id: string;
  label: string;
  actions: ExamAction[];
}

const TECHNIQUE_ICONS = { inspect: Eye, palpate: Hand, percuss: Activity, auscultate: Stethoscope };
const TECHNIQUE_COLORS: Record<string, string> = {
  inspect: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800',
  palpate: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800',
  percuss: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/30 dark:border-purple-800',
  auscultate: 'text-cyan-600 bg-cyan-50 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:border-cyan-800',
};

function getSubRegions(regionId: string): SubRegion[] {
  switch (regionId) {
    case 'head': return [
      { id: 'scalp', label: 'Scalp', actions: [
        { id: 'scalp-inspect', label: 'Wounds, bleeding, swelling', technique: 'inspect' },
        { id: 'scalp-palpate', label: 'Depressions, step deformity', technique: 'palpate' },
      ]},
      { id: 'pupils', label: 'Pupils', actions: [
        { id: 'pupils-inspect', label: 'PERRL — size, equality, reactivity', technique: 'inspect' },
      ]},
      { id: 'ears', label: 'Ears', actions: [
        { id: 'ears-inspect', label: "Battle's sign, CSF, blood", technique: 'inspect' },
      ]},
    ];
    case 'face': return [
      { id: 'symmetry', label: 'Facial Symmetry', actions: [
        { id: 'face-inspect', label: 'Droop, asymmetry, FAST', technique: 'inspect' },
      ]},
      { id: 'mouth', label: 'Mouth & Airway', actions: [
        { id: 'mouth-inspect', label: 'Blood, vomit, foreign body, swelling', technique: 'inspect' },
        { id: 'airway-listen', label: 'Stridor, gurgling, snoring', technique: 'auscultate' },
      ]},
      { id: 'jaw', label: 'Jaw & Nose', actions: [
        { id: 'jaw-palpate', label: 'Stability, crepitus, midface', technique: 'palpate' },
        { id: 'nose-inspect', label: 'CSF rhinorrhoea, epistaxis', technique: 'inspect' },
      ]},
    ];
    case 'neck-cspine': return [
      { id: 'trachea', label: 'Trachea', actions: [
        { id: 'trachea-palpate', label: 'Midline or deviated', technique: 'palpate' },
      ]},
      { id: 'jvp', label: 'Jugular Veins', actions: [
        { id: 'jvd-inspect', label: 'JVD — elevated or flat', technique: 'inspect' },
      ]},
      { id: 'cspine', label: 'C-Spine', actions: [
        { id: 'cspine-palpate', label: 'Midline tenderness, step deformity', technique: 'palpate' },
        { id: 'cspine-inspect', label: 'Subcut emphysema, wounds', technique: 'inspect' },
      ]},
    ];
    case 'chest': return [
      { id: 'chest-wall', label: 'Chest Wall', actions: [
        { id: 'chest-inspect', label: 'Symmetry, wounds, flail, paradox', technique: 'inspect' },
        { id: 'chest-palpate', label: 'Tenderness, crepitus, emphysema', technique: 'palpate' },
      ]},
      { id: 'lung-r-upper', label: 'Right Upper Lung', actions: [
        { id: 'rul-percuss', label: 'Percussion note', technique: 'percuss' },
        { id: 'rul-auscultate', label: 'Breath sounds', technique: 'auscultate' },
      ]},
      { id: 'lung-r-lower', label: 'Right Lower Lung', actions: [
        { id: 'rll-percuss', label: 'Percussion note', technique: 'percuss' },
        { id: 'rll-auscultate', label: 'Breath sounds', technique: 'auscultate' },
      ]},
      { id: 'lung-l-upper', label: 'Left Upper Lung', actions: [
        { id: 'lul-percuss', label: 'Percussion note', technique: 'percuss' },
        { id: 'lul-auscultate', label: 'Breath sounds', technique: 'auscultate' },
      ]},
      { id: 'lung-l-lower', label: 'Left Lower Lung', actions: [
        { id: 'lll-percuss', label: 'Percussion note', technique: 'percuss' },
        { id: 'lll-auscultate', label: 'Breath sounds', technique: 'auscultate' },
      ]},
      { id: 'heart', label: 'Heart Sounds', actions: [
        { id: 'heart-aortic', label: 'Aortic (R 2nd ICS)', technique: 'auscultate' },
        { id: 'heart-pulm', label: 'Pulmonary (L 2nd ICS)', technique: 'auscultate' },
        { id: 'heart-tricusp', label: 'Tricuspid (L sternal)', technique: 'auscultate' },
        { id: 'heart-mitral', label: 'Mitral (apex 5th ICS)', technique: 'auscultate' },
      ]},
    ];
    case 'abdomen': return [
      { id: 'abd-general', label: 'General', actions: [
        { id: 'abd-inspect', label: 'Distension, bruising, scars', technique: 'inspect' },
      ]},
      { id: 'ruq', label: 'Right Upper Quadrant', actions: [
        { id: 'ruq-auscultate', label: 'Bowel sounds', technique: 'auscultate' },
        { id: 'ruq-palpate', label: 'Tenderness, hepatomegaly', technique: 'palpate' },
        { id: 'ruq-percuss', label: 'Liver span', technique: 'percuss' },
      ]},
      { id: 'luq', label: 'Left Upper Quadrant', actions: [
        { id: 'luq-auscultate', label: 'Bowel sounds', technique: 'auscultate' },
        { id: 'luq-palpate', label: 'Tenderness, splenomegaly', technique: 'palpate' },
        { id: 'luq-percuss', label: 'Percussion', technique: 'percuss' },
      ]},
      { id: 'rlq', label: 'Right Lower Quadrant', actions: [
        { id: 'rlq-auscultate', label: 'Bowel sounds', technique: 'auscultate' },
        { id: 'rlq-palpate', label: 'Appendicitis signs, rebound', technique: 'palpate' },
        { id: 'rlq-percuss', label: 'Percussion', technique: 'percuss' },
      ]},
      { id: 'llq', label: 'Left Lower Quadrant', actions: [
        { id: 'llq-auscultate', label: 'Bowel sounds', technique: 'auscultate' },
        { id: 'llq-palpate', label: 'Diverticular signs', technique: 'palpate' },
        { id: 'llq-percuss', label: 'Percussion', technique: 'percuss' },
      ]},
    ];
    case 'pelvis': return [
      { id: 'pelvis-test', label: 'Stability', actions: [
        { id: 'pelvis-inspect', label: 'Deformity, bruising', technique: 'inspect' },
        { id: 'pelvis-palpate', label: 'Spring test — compress ONCE', technique: 'palpate' },
      ]},
      { id: 'perineum', label: 'Perineum', actions: [
        { id: 'perineum-inspect', label: 'Bleeding, priapism', technique: 'inspect' },
      ]},
    ];
    case 'extremities': return [
      { id: 'r-arm', label: 'Right Arm', actions: [
        { id: 'rarm-inspect', label: 'Deformity, wounds, swelling', technique: 'inspect' },
        { id: 'rarm-palpate', label: 'Pulses, sensation, motor', technique: 'palpate' },
      ]},
      { id: 'l-arm', label: 'Left Arm', actions: [
        { id: 'larm-inspect', label: 'Deformity, wounds, swelling', technique: 'inspect' },
        { id: 'larm-palpate', label: 'Pulses, sensation, motor', technique: 'palpate' },
      ]},
      { id: 'r-leg', label: 'Right Leg', actions: [
        { id: 'rleg-inspect', label: 'Deformity, wounds, swelling', technique: 'inspect' },
        { id: 'rleg-palpate', label: 'DP/PT pulses, sensation, motor', technique: 'palpate' },
      ]},
      { id: 'l-leg', label: 'Left Leg', actions: [
        { id: 'lleg-inspect', label: 'Deformity, wounds, swelling', technique: 'inspect' },
        { id: 'lleg-palpate', label: 'Pulses, sensation, motor', technique: 'palpate' },
      ]},
    ];
    case 'posterior-logroll': return [
      { id: 'logroll', label: 'Log Roll', actions: [
        { id: 'logroll-inspect', label: 'Maintain C-spine. Roll on command.', technique: 'inspect' },
      ]},
      { id: 'spine', label: 'Spine', actions: [
        { id: 'spine-palpate', label: 'Each process — tenderness, step', technique: 'palpate' },
        { id: 'spine-inspect', label: 'Bruising, wounds, haematoma', technique: 'inspect' },
      ]},
      { id: 'flanks', label: 'Flanks & Buttocks', actions: [
        { id: 'flanks-inspect', label: 'Grey Turner, wounds, bleeding', technique: 'inspect' },
      ]},
    ];
    default: return [];
  }
}

// ============================================================================
// Finding generator — case-specific
// ============================================================================

function getFinding(caseData: CaseScenario, regionId: string, actionId: string): string {
  const ss = caseData.secondarySurvey;
  const breathing = caseData.abcde?.breathing;
  const circ = caseData.abcde?.circulation;
  const disability = caseData.abcde?.disability;
  const airway = caseData.abcde?.airway;

  // Chest auscultation → lung sounds
  if (actionId.includes('auscultate') && (actionId.startsWith('rul') || actionId.startsWith('rll') || actionId.startsWith('lul') || actionId.startsWith('lll'))) {
    if (breathing?.auscultation?.length) return breathing.auscultation.join('. ');
    return 'Vesicular breath sounds. Normal air entry.';
  }
  // Heart sounds
  if (actionId.startsWith('heart-')) {
    return circ?.ecgFindings?.length ? `S1 S2 present. ${circ.ecgFindings[0]}` : 'S1 S2 present. No murmurs.';
  }
  // Chest percussion
  if (actionId.includes('percuss') && (actionId.startsWith('rul') || actionId.startsWith('rll') || actionId.startsWith('lul') || actionId.startsWith('lll'))) {
    if (breathing?.findings?.some(f => f.toLowerCase().includes('pneumothorax'))) return 'Hyper-resonant';
    if (breathing?.findings?.some(f => f.toLowerCase().includes('effusion'))) return 'Dull — fluid';
    return 'Resonant — normal';
  }
  // Chest wall
  if (actionId === 'chest-inspect') return ss?.chest?.filter(f => !f.toLowerCase().includes('clear') && !f.toLowerCase().includes('wheez')).join('. ') || 'Equal expansion. No wounds. No flail.';
  if (actionId === 'chest-palpate') return 'No tenderness. No crepitus. No subcutaneous emphysema.';
  // Abdomen bowel sounds
  if (actionId.includes('auscultate') && (actionId.startsWith('ruq') || actionId.startsWith('luq') || actionId.startsWith('rlq') || actionId.startsWith('llq'))) {
    const abd = ss?.abdomen || [];
    if (abd.some(f => f.toLowerCase().includes('absent bowel'))) return 'Absent bowel sounds';
    if (abd.some(f => f.toLowerCase().includes('hyperactive'))) return 'Hyperactive bowel sounds';
    return 'Normal bowel sounds present';
  }
  // Abdomen palpation
  if (actionId.includes('palpate') && (actionId.startsWith('ruq') || actionId.startsWith('luq') || actionId.startsWith('rlq') || actionId.startsWith('llq'))) {
    return ss?.abdomen?.join('. ') || 'Soft, non-tender. No guarding.';
  }
  // Abdomen inspection
  if (actionId === 'abd-inspect') return 'Not distended. No bruising. No scars.';
  // Abdomen percussion
  if (actionId.includes('percuss') && (actionId.startsWith('ruq') || actionId.startsWith('luq') || actionId.startsWith('rlq') || actionId.startsWith('llq'))) return 'Tympanic — normal';
  // Head
  if (actionId === 'pupils-inspect') return typeof disability?.pupils === 'string' ? disability.pupils : 'Equal and reactive';
  if (actionId === 'ears-inspect') return ss?.headDetailed?.ears?.join('. ') || 'No Battle sign. No CSF. Canals clear.';
  if (actionId.startsWith('scalp')) return ss?.head?.join('. ') || 'No wounds. No deformity.';
  // Face
  if (actionId === 'mouth-inspect') return airway?.findings?.join('. ') || (airway?.patent ? 'Patent. No obstruction.' : 'COMPROMISED');
  if (actionId === 'airway-listen') return airway?.findings?.some(f => f.toLowerCase().includes('stridor')) ? 'Stridor audible' : airway?.findings?.some(f => f.toLowerCase().includes('gurgling')) ? 'Gurgling — suction needed' : 'No abnormal sounds';
  if (actionId === 'face-inspect') return ss?.headDetailed?.face?.join('. ') || 'Symmetrical. No droop.';
  if (actionId === 'jaw-palpate') return 'Jaw stable. No crepitus.';
  if (actionId === 'nose-inspect') return ss?.headDetailed?.nose?.join('. ') || 'No CSF. No epistaxis.';
  // Neck
  if (actionId === 'trachea-palpate') return ss?.neck?.find(f => f.toLowerCase().includes('trachea')) || 'Trachea central';
  if (actionId === 'jvd-inspect') return ss?.neck?.find(f => f.toLowerCase().includes('jvd') || f.toLowerCase().includes('jugular')) || 'No JVD';
  if (actionId.startsWith('cspine')) return ss?.neck?.join('. ') || 'No midline tenderness. No step deformity.';
  // Pelvis
  if (regionId === 'pelvis') return ss?.pelvis?.join('. ') || 'Stable on spring test.';
  // Extremities
  if (regionId === 'extremities') return ss?.extremities?.join('. ') || 'No deformity. Pulses present. Sensation intact.';
  // Posterior
  if (regionId === 'posterior-logroll') return ss?.posterior?.join('. ') || 'No spinal tenderness. No step deformity.';
  return 'No abnormalities detected.';
}

// ============================================================================
// Region label for display
// ============================================================================
const REGION_LABELS: Record<string, string> = {
  head: 'Head', face: 'Face', 'neck-cspine': 'Neck & C-Spine', chest: 'Chest',
  abdomen: 'Abdomen', pelvis: 'Pelvis', extremities: 'Extremities', 'posterior-logroll': 'Posterior',
};

// ============================================================================
// Main Component
// ============================================================================

interface Body3DModelProps {
  onRegionClick: (stepId: AssessmentStepId) => void;
  assessedRegions: Set<string>;
  caseData: CaseScenario;
  isStudentView?: boolean;
}

export function Body3DModel({ onRegionClick, assessedRegions, caseData }: Body3DModelProps) {
  const controlsRef = useRef<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [revealedFindings, setRevealedFindings] = useState<Map<string, string>>(new Map());
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleToggleView = useCallback(() => {
    if (!controlsRef.current) return;
    controlsRef.current.setAzimuthalAngle(isFlipped ? 0 : Math.PI);
    controlsRef.current.update();
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const handleRegionClick = useCallback((stepId: string) => {
    setActiveRegion(stepId);
    setSelectedAction(null);
    onRegionClick(stepId as AssessmentStepId);
  }, [onRegionClick]);

  const handleExamAction = useCallback((actionId: string) => {
    if (!activeRegion) return;
    setSelectedAction(actionId);
    const finding = getFinding(caseData, activeRegion, actionId);
    setRevealedFindings(prev => {
      const next = new Map(prev);
      next.set(actionId, finding);
      return next;
    });
  }, [activeRegion, caseData]);

  const regionIds = ['head', 'face', 'neck-cspine', 'chest', 'abdomen', 'pelvis', 'extremities', 'posterior-logroll'];
  const assessedCount = regionIds.filter(id => assessedRegions.has(id)).length;
  const subRegions = activeRegion ? getSubRegions(activeRegion) : [];

  return (
    <div className="rounded-2xl overflow-hidden border border-border/40 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-white/50 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-semibold">Physical Examination</span>
          {activeRegion && (
            <span className="text-xs text-muted-foreground">
              — {REGION_LABELS[activeRegion] || activeRegion}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={assessedCount === TOTAL_REGIONS ? 'default' : 'secondary'}
            className={`text-[9px] ${assessedCount === TOTAL_REGIONS ? 'bg-green-500' : ''}`}>
            {assessedCount}/{TOTAL_REGIONS}
          </Badge>
          {activeRegion && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setActiveRegion(null); setSelectedAction(null); }}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Three-panel layout when region is active */}
      <div className={`${activeRegion ? 'grid grid-cols-[200px_1fr_1fr] sm:grid-cols-[220px_1fr_1fr]' : ''}`}>

        {/* LEFT: Assessment options (only when region is active) */}
        {activeRegion && (
          <div className="border-r border-border/30 bg-white/30 dark:bg-black/10 p-2 space-y-1.5 overflow-y-auto max-h-[420px]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1">
              Examine
            </p>
            {subRegions.map(sr => (
              <div key={sr.id}>
                <p className="text-[10px] font-semibold text-muted-foreground px-1 pt-1">{sr.label}</p>
                {sr.actions.map(action => {
                  const Icon = TECHNIQUE_ICONS[action.technique];
                  const isRevealed = revealedFindings.has(action.id);
                  const isSelected = selectedAction === action.id;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleExamAction(action.id)}
                      className={`flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded-lg text-[10px] transition-all mt-0.5 border ${
                        isSelected ? 'ring-2 ring-blue-400 ' + TECHNIQUE_COLORS[action.technique]
                        : isRevealed ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400'
                        : TECHNIQUE_COLORS[action.technique]
                      }`}
                    >
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="flex-1 leading-tight">{action.label}</span>
                      {isRevealed && <span className="text-green-500 text-[8px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* CENTER: 3D Body */}
        <div className={`${activeRegion ? 'h-[420px]' : 'h-[320px] sm:h-[380px] lg:h-[420px]'}`}>
          <Canvas
            camera={{ position: [0, 0.9, 3.2], fov: 40 }}
            dpr={Math.min(window.devicePixelRatio, 2)}
            frameloop="demand"
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 8, 4]} intensity={1.0} color="#fff5ee" />
            <directionalLight position={[-3, 5, -2]} intensity={0.4} color="#e8e0ff" />
            <directionalLight position={[0, -2, 3]} intensity={0.2} color="#ffe8d0" />

            <BodyMesh assessedRegions={assessedRegions} onRegionClick={handleRegionClick} />

            <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={3} blur={2.5} far={3} />

            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              minDistance={2}
              maxDistance={7}
              minPolarAngle={Math.PI * 0.15}
              maxPolarAngle={Math.PI * 0.85}
              target={[0, 0.85, 0]}
            />
          </Canvas>
        </div>

        {/* RIGHT: Findings (only when region is active) */}
        {activeRegion && (
          <div className="border-l border-border/30 bg-white/30 dark:bg-black/10 p-3 overflow-y-auto max-h-[420px]">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Findings
            </p>
            {selectedAction && revealedFindings.has(selectedAction) ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">
                    {subRegions.flatMap(sr => sr.actions).find(a => a.id === selectedAction)?.label || 'Finding'}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 leading-relaxed">
                    {revealedFindings.get(selectedAction)}
                  </p>
                </div>
                {/* Show all revealed findings for this region */}
                <div className="space-y-1 mt-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">All findings</p>
                  {[...revealedFindings.entries()]
                    .filter(([id]) => {
                      // Only show findings from current region's actions
                      const regionActions = subRegions.flatMap(sr => sr.actions).map(a => a.id);
                      return regionActions.includes(id);
                    })
                    .map(([id, finding]) => (
                    <div key={id} className="p-2 rounded-lg bg-muted/30 border border-border/30 text-[10px]">
                      <span className="font-medium">{subRegions.flatMap(sr => sr.actions).find(a => a.id === id)?.label}: </span>
                      <span className="text-muted-foreground">{finding}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p className="text-xs text-center">
                  Click an assessment<br />option on the left<br />to reveal findings
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls + footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/50 dark:bg-black/20 border-t border-border/30">
        <p className="text-[9px] text-muted-foreground">
          {activeRegion ? 'Click exams on the left → findings appear on the right' : 'Click a body region to examine'}
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 gap-1 text-[9px] rounded-lg"
          onClick={handleToggleView}
        >
          <RotateCcw className="h-2.5 w-2.5" />
          {isFlipped ? 'Anterior' : 'Posterior'}
        </Button>
      </div>
    </div>
  );
}

export default Body3DModel;
