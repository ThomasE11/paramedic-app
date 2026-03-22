/**
 * 3D Rotatable Human Body Model
 *
 * Interactive Three.js body where students click body regions to perform
 * secondary survey assessments. Rotate with mouse drag, zoom with scroll.
 * Assessed regions highlight green. Anterior/Posterior toggle for quick flip.
 */

import { useRef, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, User } from 'lucide-react';
import { BodyMesh } from './BodyMesh';
import type { AssessmentStepId } from '@/data/assessmentFramework';

const TOTAL_REGIONS = 8; // head, face, neck, chest, abdomen, pelvis, extremities, posterior

interface Body3DModelProps {
  onRegionClick: (stepId: AssessmentStepId) => void;
  assessedRegions: Set<string>;
  isStudentView?: boolean;
}

export function Body3DModel({ onRegionClick, assessedRegions }: Body3DModelProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleToggleView = useCallback(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    // Toggle between anterior (front) and posterior (back) view
    const targetAzimuth = isFlipped ? 0 : Math.PI;
    // Animate by setting azimuthal angle
    controls.setAzimuthalAngle(targetAzimuth);
    controls.update();
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const regionIds = ['head', 'face', 'neck-cspine', 'chest', 'abdomen', 'pelvis', 'extremities', 'posterior-logroll'];
  const assessedCount = regionIds.filter(id => assessedRegions.has(id)).length;

  return (
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
      <div className="h-[380px] sm:h-[440px] lg:h-[480px]">
        <Canvas
          camera={{ position: [0, 0.9, 3.2], fov: 40 }}
          dpr={Math.min(window.devicePixelRatio, 2)}
          frameloop="demand"
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          {/* Studio lighting for anatomical model */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 8, 4]} intensity={1.0} color="#fff5ee" />
          <directionalLight position={[-3, 5, -2]} intensity={0.4} color="#e8e0ff" />
          <directionalLight position={[0, -2, 3]} intensity={0.2} color="#ffe8d0" />

          {/* Body mesh */}
          <BodyMesh
            assessedRegions={assessedRegions}
            onRegionClick={onRegionClick}
          />

          {/* Ground shadow */}
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.4}
            scale={3}
            blur={2.5}
            far={3}
          />

          {/* Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={3}
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
          Rotate: drag | Zoom: scroll | Click a body region to assess
        </p>
      </div>
    </div>
  );
}

export default Body3DModel;
