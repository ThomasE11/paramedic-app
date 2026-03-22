/**
 * 3D Rotatable Human Body Model with Detailed Region Assessment
 *
 * Interactive Three.js body where students click body regions to perform
 * detailed clinical examinations. Each region opens a sub-panel with
 * specific exam techniques (inspect, palpate, percuss, auscultate).
 */

import { useRef, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, User } from 'lucide-react';
import { BodyMesh } from './BodyMesh';
import { RegionAssessmentPanel } from './RegionAssessmentPanel';
import type { AssessmentStepId } from '@/data/assessmentFramework';
import type { CaseScenario } from '@/types';

const TOTAL_REGIONS = 8;

interface Body3DModelProps {
  onRegionClick: (stepId: AssessmentStepId) => void;
  assessedRegions: Set<string>;
  caseData: CaseScenario;
  isStudentView?: boolean;
}

export function Body3DModel({ onRegionClick, assessedRegions, caseData, isStudentView }: Body3DModelProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [revealedFindings, setRevealedFindings] = useState<Set<string>>(new Set());

  const handleToggleView = useCallback(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const targetAzimuth = isFlipped ? 0 : Math.PI;
    controls.setAzimuthalAngle(targetAzimuth);
    controls.update();
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  // When a region is clicked on the 3D model, open its detail panel
  const handleRegionClick = useCallback((stepId: string) => {
    setActiveRegion(stepId);
    // Also trigger the assessment step in the tracker
    onRegionClick(stepId as AssessmentStepId);
  }, [onRegionClick]);

  // When a specific exam action is performed in the detail panel
  const handleFindingRevealed = useCallback((regionId: string, subRegionId: string, actionId: string) => {
    setRevealedFindings(prev => {
      const next = new Set(prev);
      next.add(`${regionId}:${subRegionId}:${actionId}`);
      return next;
    });
  }, []);

  const regionIds = ['head', 'face', 'neck-cspine', 'chest', 'abdomen', 'pelvis', 'extremities', 'posterior-logroll'];
  const assessedCount = regionIds.filter(id => assessedRegions.has(id)).length;

  return (
    <div className="space-y-3">
      {/* 3D Model */}
      <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-white/50 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold">Physical Examination</span>
          </div>
          <Badge variant={assessedCount === TOTAL_REGIONS ? 'default' : 'secondary'}
            className={`text-[9px] ${assessedCount === TOTAL_REGIONS ? 'bg-green-500' : ''}`}>
            {assessedCount}/{TOTAL_REGIONS} regions
          </Badge>
        </div>

        {/* 3D Canvas */}
        <div className="h-[320px] sm:h-[380px] lg:h-[420px]">
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

            <BodyMesh
              assessedRegions={assessedRegions}
              onRegionClick={handleRegionClick}
            />

            <ContactShadows
              position={[0, -0.01, 0]}
              opacity={0.4}
              scale={3}
              blur={2.5}
              far={3}
            />

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

        {/* Controls overlay */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5 text-[10px] rounded-lg shadow-md bg-white/90 dark:bg-black/70 backdrop-blur"
            onClick={handleToggleView}
          >
            <RotateCcw className="h-3 w-3" />
            {isFlipped ? 'Anterior' : 'Posterior'}
          </Button>
        </div>

        {/* Instruction text */}
        <div className="px-3 py-1.5 bg-white/50 dark:bg-black/20 border-t border-border/30">
          <p className="text-[9px] text-muted-foreground text-center">
            Rotate: drag | Zoom: scroll | Click a body region for detailed examination
          </p>
        </div>
      </div>

      {/* Region Detail Panel — opens when a region is clicked */}
      {activeRegion && (
        <RegionAssessmentPanel
          regionId={activeRegion}
          caseData={caseData}
          onClose={() => setActiveRegion(null)}
          onFindingRevealed={handleFindingRevealed}
          revealedFindings={revealedFindings}
          isStudentView={isStudentView}
        />
      )}
    </div>
  );
}

export default Body3DModel;
