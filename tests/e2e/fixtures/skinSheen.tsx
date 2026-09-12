import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Color } from 'three';
import { BodyMesh } from '../../../src/components/Body3DModel/BodyMesh';

// A Vite-transformed entry keeps the fixture independent of optimiser cache
// filenames. Never imported by the application or included in its build.
const noRegions = new Set<string>();
function SkinSheenFixture() {
  const [appearance, setAppearance] = useState({
    diaphoresis: 1, skinTint: '#ffffff', skinDiaphoretic: false,
    patientGender: 'male' as 'male' | 'female',
  });
  window.setSkinAppearance = patch => setAppearance(previous => ({ ...previous, ...patch }));
  return <Canvas camera={{ position: [0, 1.64, .75], fov: 30 }} onCreated={state => {
    window.skinScene = state.scene;
    state.camera.lookAt(0, 1.62, 0);
  }}>
    <ambientLight intensity={1} />
    <directionalLight position={[1, 2, 2]} intensity={2} />
    <BodyMesh assessedRegions={noRegions} requiredRegions={noRegions} onRegionClick={() => {}}
      patientAge={32} dressed {...appearance} skinTint={new Color(appearance.skinTint)}
      braceHandsOnKnees={appearance.patientGender === 'male'} />
  </Canvas>;
}

createRoot(document.getElementById('root')!).render(<SkinSheenFixture />);
