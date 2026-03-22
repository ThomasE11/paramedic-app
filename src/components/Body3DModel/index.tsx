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
import { BODY_REGIONS } from './bodyRegions';
import type { AssessmentStepId } from '@/data/assessmentFramework';

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

  const assessedCount = BODY_REGIONS.filter(r => assessedRegions.has(r.id)).length;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-white/50 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-semibold">Physical Examination</span>
        </div>
        <Badge variant={assessedCount === BODY_REGIONS.length ? 'default' : 'secondary'}
          className={`text-[9px] ${assessedCount === BODY_REGIONS.length ? 'bg-green-500' : ''}`}>
          {assessedCount}/{BODY_REGIONS.length} regions
        </Badge>
      </div>

      {/* 3D Canvas */}
      <div className="h-[350px] sm:h-[400px] lg:h-[420px]">
        <Canvas
          camera={{ position: [0, 0.5, 4.5], fov: 40 }}
          dpr={Math.min(window.devicePixelRatio, 2)}
          frameloop="demand"
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 3]} intensity={0.8} castShadow={false} />
          <directionalLight position={[-2, 3, -2]} intensity={0.3} />

          {/* Body mesh */}
          <BodyMesh
            assessedRegions={assessedRegions}
            onRegionClick={onRegionClick}
          />

          {/* Ground shadow */}
          <ContactShadows
            position={[0, -2.1, 0]}
            opacity={0.3}
            scale={4}
            blur={2}
            far={4}
          />

          {/* Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={3}
            maxDistance={7}
            minPolarAngle={Math.PI * 0.15}
            maxPolarAngle={Math.PI * 0.85}
            target={[0, 0.3, 0]}
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
