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
import type { ClinicalSoundState } from '@/data/clinicalSounds';
import { playBreathSound, playHeartSound, playPercussionSound, stopAllSounds } from '@/data/clinicalSounds';

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
      { id: 'head-exam', label: 'Head', actions: [
        { id: 'scalp-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'scalp-palpate', label: 'Palpate', technique: 'palpate' },
        { id: 'pupils-inspect', label: 'Pupils', technique: 'inspect' },
        { id: 'ears-inspect', label: 'Ears', technique: 'inspect' },
      ]},
    ];
    case 'face': return [
      { id: 'face-exam', label: 'Face', actions: [
        { id: 'face-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'mouth-inspect', label: 'Mouth & Airway', technique: 'inspect' },
        { id: 'airway-listen', label: 'Auscultate Airway', technique: 'auscultate' },
        { id: 'jaw-palpate', label: 'Palpate', technique: 'palpate' },
      ]},
    ];
    case 'neck-cspine': return [
      { id: 'neck-exam', label: 'Neck & C-Spine', actions: [
        { id: 'cspine-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'cspine-palpate', label: 'Palpate', technique: 'palpate' },
        { id: 'trachea-palpate', label: 'Trachea', technique: 'palpate' },
        { id: 'jvd-inspect', label: 'JVP', technique: 'inspect' },
      ]},
    ];
    case 'chest': return [
      { id: 'chest-exam', label: 'Chest', actions: [
        { id: 'chest-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'chest-palpate', label: 'Palpate', technique: 'palpate' },
        { id: 'chest-percuss', label: 'Percuss', technique: 'percuss' },
        { id: 'chest-auscultate-lungs', label: 'Auscultate — Lungs', technique: 'auscultate' },
        { id: 'chest-auscultate-heart', label: 'Auscultate — Heart', technique: 'auscultate' },
      ]},
    ];
    // Abdomen: Clinical exam order is Inspect → Auscultate → Percuss → Palpate
    case 'abdomen': return [
      { id: 'abd-exam', label: 'Abdomen', actions: [
        { id: 'abd-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'abd-auscultate', label: 'Auscultate', technique: 'auscultate' },
        { id: 'abd-percuss', label: 'Percuss', technique: 'percuss' },
        { id: 'abd-palpate', label: 'Palpate', technique: 'palpate' },
      ]},
    ];
    case 'pelvis': return [
      { id: 'pelvis-exam', label: 'Pelvis', actions: [
        { id: 'pelvis-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'pelvis-palpate', label: 'Palpate', technique: 'palpate' },
      ]},
    ];
    case 'extremities': return [
      { id: 'upper-limbs', label: 'Upper Limbs', actions: [
        { id: 'arms-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'arms-palpate', label: 'Palpate', technique: 'palpate' },
      ]},
      { id: 'lower-limbs', label: 'Lower Limbs', actions: [
        { id: 'legs-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'legs-palpate', label: 'Palpate', technique: 'palpate' },
      ]},
    ];
    case 'posterior-logroll': return [
      { id: 'posterior-exam', label: 'Posterior', actions: [
        { id: 'logroll-inspect', label: 'Log Roll', technique: 'inspect' },
        { id: 'spine-inspect', label: 'Inspect Spine', technique: 'inspect' },
        { id: 'spine-palpate', label: 'Palpate Spine', technique: 'palpate' },
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

  // Chest — consolidated techniques
  if (actionId === 'chest-inspect') {
    const chestFindings = ss?.chest?.filter(f => !f.toLowerCase().includes('clear') && !f.toLowerCase().includes('wheez') && !f.toLowerCase().includes('breath'));
    return chestFindings?.length ? chestFindings.join('. ') : 'Equal bilateral chest expansion. No wounds, bruising, or deformity. No paradoxical movement.';
  }
  if (actionId === 'chest-palpate') {
    return ss?.chest?.some(f => f.toLowerCase().includes('crepitus') || f.toLowerCase().includes('tender'))
      ? ss.chest.filter(f => f.toLowerCase().includes('crepitus') || f.toLowerCase().includes('tender') || f.toLowerCase().includes('emphysema')).join('. ')
      : 'No tenderness. No crepitus. No subcutaneous emphysema. Trachea central.';
  }
  if (actionId === 'chest-percuss') {
    if (breathing?.findings?.some(f => f.toLowerCase().includes('pneumothorax'))) return 'Hyper-resonant percussion note — suggests pneumothorax.';
    if (breathing?.findings?.some(f => f.toLowerCase().includes('effusion') || f.toLowerCase().includes('haemothorax'))) return 'Dull percussion note — suggests fluid collection.';
    return 'Resonant percussion note bilaterally — normal.';
  }
  if (actionId === 'chest-auscultate-lungs') {
    if (breathing?.auscultation?.length) return breathing.auscultation.join('. ');
    const lungFindings = breathing?.findings?.filter(f => f.toLowerCase().includes('wheez') || f.toLowerCase().includes('crackle') || f.toLowerCase().includes('air entry') || f.toLowerCase().includes('diminished'));
    return lungFindings?.length ? lungFindings.join('. ') : 'Vesicular breath sounds bilaterally. Good air entry throughout.';
  }
  if (actionId === 'chest-auscultate-heart') {
    if (circ?.ecgFindings?.length) return `Heart sounds: S1 S2 present. ${circ.ecgFindings[0]}`;
    return 'Heart sounds: S1 S2 present. No murmurs, rubs, or gallops.';
  }
  // Abdomen — consolidated techniques (each covers the whole abdomen)
  if (actionId === 'abd-inspect') {
    const abd = ss?.abdomen || [];
    const inspectFindings = abd.filter(f => f.toLowerCase().includes('distend') || f.toLowerCase().includes('bruis') || f.toLowerCase().includes('scar') || f.toLowerCase().includes('visible'));
    return inspectFindings.length ? inspectFindings.join('. ') : 'Abdomen flat, symmetrical. No distension. No visible bruising, scars, or peristalsis.';
  }
  if (actionId === 'abd-auscultate') {
    const abd = ss?.abdomen || [];
    if (abd.some(f => f.toLowerCase().includes('absent bowel'))) return 'Absent bowel sounds — no sounds heard over 2 minutes in all 4 quadrants.';
    if (abd.some(f => f.toLowerCase().includes('hyperactive'))) return 'Hyperactive bowel sounds — high-pitched, frequent gurgling throughout.';
    if (abd.some(f => f.toLowerCase().includes('tinkling'))) return 'Tinkling bowel sounds — suggests obstruction.';
    return 'Normal bowel sounds present in all 4 quadrants — 5-30 sounds per minute.';
  }
  if (actionId === 'abd-percuss') {
    const abd = ss?.abdomen || [];
    if (abd.some(f => f.toLowerCase().includes('ascites') || f.toLowerCase().includes('fluid'))) return 'Shifting dullness present — suggests free fluid.';
    if (abd.some(f => f.toLowerCase().includes('hepato'))) return 'RUQ: Dull — enlarged liver span >12cm. Rest: Tympanic.';
    return 'Tympanic throughout all quadrants — normal gas-filled bowel.';
  }
  if (actionId === 'abd-palpate') {
    const abd = ss?.abdomen || [];
    if (abd.length) return abd.join('. ');
    return 'Soft, non-tender in all 4 quadrants. No guarding, rigidity, or masses.';
  }
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
  if (actionId === 'pelvis-inspect') return ss?.pelvis?.some(f => f.toLowerCase().includes('deform') || f.toLowerCase().includes('bruis')) ? ss.pelvis.join('. ') : 'No deformity. No bruising. Leg length equal.';
  if (actionId === 'pelvis-palpate') return ss?.pelvis?.join('. ') || 'Pelvis stable on single spring test. No instability.';
  // Extremities
  if (actionId === 'arms-inspect') return ss?.extremities?.filter(f => f.toLowerCase().includes('arm') || f.toLowerCase().includes('upper') || f.toLowerCase().includes('wrist') || f.toLowerCase().includes('hand')).join('. ') || 'No deformity, wounds, or swelling. Colour normal bilaterally.';
  if (actionId === 'arms-palpate') return ss?.extremities?.length ? ss.extremities.join('. ') : 'Radial pulses present and equal. Sensation intact. Full motor power bilaterally.';
  if (actionId === 'legs-inspect') return ss?.extremities?.filter(f => f.toLowerCase().includes('leg') || f.toLowerCase().includes('lower') || f.toLowerCase().includes('ankle') || f.toLowerCase().includes('foot') || f.toLowerCase().includes('femur') || f.toLowerCase().includes('knee')).join('. ') || 'No deformity, wounds, or swelling. Colour normal bilaterally.';
  if (actionId === 'legs-palpate') return ss?.extremities?.length ? ss.extremities.join('. ') : 'Dorsalis pedis and posterior tibial pulses present. Sensation intact. Full motor power bilaterally.';
  // Posterior
  if (actionId === 'logroll-inspect') return 'Log roll performed with manual in-line C-spine stabilisation. Patient rolled on command.';
  if (actionId === 'spine-inspect') return ss?.posterior?.join('. ') || 'No bruising, wounds, or haematoma along spine.';
  if (actionId === 'spine-palpate') return ss?.posterior?.join('. ') || 'No midline tenderness. No step deformity. No muscle spasm.';
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
  patientSounds?: ClinicalSoundState | null;
  isStudentView?: boolean;
}

export function Body3DModel({ onRegionClick, assessedRegions, caseData, patientSounds }: Body3DModelProps) {
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

  // Y-center positions for each region (must match BodyMesh REGION_RANGES)
  const regionCenters: Record<string, number> = useMemo(() => ({
    'head': 1.76, 'face': 1.64, 'neck-cspine': 1.50,
    'chest': 1.32, 'abdomen': 1.09, 'pelvis': 0.905,
    'extremities': 0.42, 'posterior-logroll': 1.20,
  }), []);

  const handleRegionClick = useCallback((stepId: string) => {
    setActiveRegion(stepId);
    setSelectedAction(null);
    onRegionClick(stepId as AssessmentStepId);

    // Zoom camera to focus on the selected region
    if (controlsRef.current) {
      const centerY = regionCenters[stepId] ?? 0.85;
      controlsRef.current.target.set(0, centerY, 0);
      // Zoom in closer for head/face/neck, stay wider for extremities
      const zoomDistance = stepId === 'extremities' ? 3.5 : stepId === 'head' || stepId === 'face' ? 2.0 : 2.5;
      const currentPos = controlsRef.current.object.position;
      const dir = currentPos.clone().sub(controlsRef.current.target).normalize();
      controlsRef.current.object.position.copy(dir.multiplyScalar(zoomDistance).add(controlsRef.current.target));
      controlsRef.current.update();
    }
  }, [onRegionClick, regionCenters]);

  const handleExamAction = useCallback((actionId: string) => {
    if (!activeRegion) return;
    setSelectedAction(actionId);
    const finding = getFinding(caseData, activeRegion, actionId);
    setRevealedFindings(prev => {
      const next = new Map(prev);
      next.set(actionId, finding);
      return next;
    });

    // Play sounds for auscultation actions
    if (actionId.includes('auscultate') && patientSounds) {
      stopAllSounds();
      if (actionId === 'chest-auscultate-lungs') {
        // Play both lung sounds sequentially (left then right)
        playBreathSound(patientSounds.leftLung, 4000);
      } else if (actionId === 'chest-auscultate-heart') {
        playHeartSound(patientSounds.heartSound, 5000);
      } else if (actionId === 'abd-auscultate') {
        // Bowel sounds
        playBreathSound('clear', 3000); // Placeholder — bowel sound synthesis TODO
      } else if (actionId === 'airway-listen') {
        // Airway sounds
        playBreathSound(patientSounds.leftLung, 3000);
      }
    }

    // Play percussion sound
    if (actionId.includes('percuss')) {
      stopAllSounds();
      const percFinding = getFinding(caseData, activeRegion!, actionId);
      const percType = percFinding.toLowerCase().includes('hyper') ? 'hyper-resonant'
        : percFinding.toLowerCase().includes('dull') ? 'dull'
        : percFinding.toLowerCase().includes('tympanic') ? 'tympanic'
        : 'resonant';
      playPercussionSound(percType);
    }
  }, [activeRegion, caseData, patientSounds]);

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

      {/* Body always centered. When region active, exam options and findings appear below on all screens */}
      <div>

        {/* Exam options and findings go BELOW the 3D body, not beside it */}

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

        {/* Findings panel removed from here — now below canvas */}
      </div>

      {/* Controls + footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/50 dark:bg-black/20 border-t border-border/30">
        <p className="text-[9px] text-muted-foreground">
          {activeRegion ? 'Perform each examination technique below' : 'Click a body region to examine'}
        </p>
        <div className="flex gap-1.5">
          {activeRegion && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[9px] rounded-lg" onClick={() => {
              setActiveRegion(null);
              setSelectedAction(null);
              // Reset camera
              if (controlsRef.current) {
                controlsRef.current.target.set(0, 0.85, 0);
                controlsRef.current.object.position.set(0, 0.9, 3.2);
                controlsRef.current.update();
              }
            }}>
              <X className="h-2.5 w-2.5" /> Back
            </Button>
          )}
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

      {/* ===== EXAM PANEL: Below body, shows when region is active ===== */}
      {activeRegion && (
        <div className="border-t border-border/30 bg-white/60 dark:bg-slate-900/60">
          {/* Two-column: techniques left, findings right */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border/30">
            {/* LEFT: Examination techniques */}
            <div className="p-3 space-y-1.5">
              <p className="text-xs font-bold text-foreground dark:text-white mb-2">
                {REGION_LABELS[activeRegion]} — Examination
              </p>
              {subRegions.map(sr => (
                <div key={sr.id} className="space-y-1">
                  {sr.actions.map(action => {
                    const Icon = TECHNIQUE_ICONS[action.technique];
                    const isRevealed = revealedFindings.has(action.id);
                    const isSelected = selectedAction === action.id;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleExamAction(action.id)}
                        className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all border-2 ${
                          isSelected ? 'ring-2 ring-blue-400 shadow-md border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                          : isRevealed ? 'border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                          : 'border-border/40 dark:border-slate-700 hover:border-blue-300 hover:bg-accent/30 text-foreground dark:text-slate-200'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 font-medium">{action.label}</span>
                        {isRevealed && <span className="text-green-500 font-bold shrink-0">✓</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* RIGHT: Findings */}
            <div className="p-3">
              <p className="text-xs font-bold text-foreground dark:text-white mb-2">Findings</p>
              {selectedAction && revealedFindings.has(selectedAction) ? (
                <div className="space-y-2">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-700">
                    <p className="text-sm font-bold text-green-800 dark:text-green-200 mb-1">
                      {subRegions.flatMap(sr => sr.actions).find(a => a.id === selectedAction)?.label}
                    </p>
                    <p className="text-base text-green-700 dark:text-green-300 leading-relaxed">
                      {revealedFindings.get(selectedAction)}
                    </p>
                  </div>
                  {/* Previous findings */}
                  {(() => {
                    const regionActions = subRegions.flatMap(sr => sr.actions).map(a => a.id);
                    const others = [...revealedFindings.entries()].filter(([id]) => regionActions.includes(id) && id !== selectedAction);
                    if (others.length === 0) return null;
                    return (
                      <div className="space-y-1.5 pt-2">
                        {others.map(([id, finding]) => (
                          <div key={id} className="p-2.5 rounded-lg bg-muted/30 dark:bg-slate-800/40 border border-border/30">
                            <span className="text-xs font-semibold dark:text-slate-200">{subRegions.flatMap(sr => sr.actions).find(a => a.id === id)?.label}: </span>
                            <span className="text-xs text-muted-foreground dark:text-slate-400">{finding}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 text-muted-foreground">
                  <p className="text-sm text-center dark:text-slate-500">
                    Select an examination technique
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Body3DModel;
