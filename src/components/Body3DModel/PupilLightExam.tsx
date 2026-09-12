import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import type { PupilProfile } from '@/lib/pupilExam';
import { stepPupilLightResponse } from './pupilLightResponse';

type LightSide = 'left' | 'right' | null;

export function PupilLightControls({ side, onChange }: { side: LightSide; onChange: (side: LightSide) => void }) {
  const { t } = useTranslation();
  return (
    <section aria-label={t('eyeExam.title', { defaultValue: 'Patient pupil examination' })} className="rounded-xl border border-sky-300/30 bg-slate-950 p-3 text-white">
      <h4 className="text-xs font-semibold">{t('eyeExam.title', { defaultValue: 'Patient pupil examination' })}</h4>
      <p className="mt-2 text-[11px] text-slate-300">{t('eyeExam.guidance', { defaultValue: 'Ask the patient to look into the distance. Shine the light into one eye and observe both pupils on the patient.' })}</p>
      <div className="mt-3 grid gap-2">
        {(['left', 'right'] as const).map(eye => (
          <button key={eye} type="button" aria-pressed={side === eye}
            aria-label={t(`eyeExam.${eye}Label`, { defaultValue: `Shine light: patient's ${eye} eye` })}
            onClick={() => onChange(eye)} className={`rounded-lg border px-3 py-2 text-xs ${side === eye ? 'border-sky-300 bg-sky-700' : 'border-white/20 bg-slate-800'}`}>
            {t(`eyeExam.${eye}`, { defaultValue: eye === 'left' ? "Patient's left eye" : "Patient's right eye" })}
          </button>
        ))}
        <button type="button" onClick={() => onChange(null)} aria-pressed={side === null} className="rounded-lg border border-white/20 px-3 py-2 text-xs">
          {t('eyeExam.off', { defaultValue: 'Penlight off' })}
        </button>
      </div>
      <p className="mt-2 text-[10px] text-slate-300">{t('eyeExam.observe', { defaultValue: 'Compare direct and consensual responses, then remove the light and watch recovery.' })}</p>
    </section>
  );
}

function irisTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  const pixels = context.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (x - size / 2) / (size / 2), dy = (y - size / 2) / (size / 2);
    const radius = Math.hypot(dx, dy), angle = Math.atan2(dy, dx);
    const fibre = Math.sin(angle * 137 + radius * 12) * .15 + Math.sin(angle * 79 - radius * 24) * .10;
    const limbus = 1 - .6 * THREE.MathUtils.smoothstep(radius, .83, 1);
    const ring = .85 + .15 * Math.sin(radius * 45 + Math.sin(angle * 19));
    const shade = Math.max(.15, (1 + fibre) * limbus * ring);
    const offset = (y * size + x) * 4;
    pixels.data.set([Math.round(103 * shade), Math.round(71 * shade), Math.round(40 * shade), 255], offset);
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Mounted only in the pilot's eye exam. Uses the existing eye nodes, not a
 * separate cartoon face. Materials and baseline pupil sizes restore on exit. */
export function PupilLightExam({ side, profile }: { side: LightSide; profile: PupilProfile }) {
  const scene = useThree(state => state.scene);
  const penlight = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const elapsed = useRef(0);
  const sizes = useRef<[number, number]>([profile.leftMm, profile.rightMm]);
  const vectors = useMemo(() => ({ position: new THREE.Vector3(), normal: new THREE.Vector3(), offset: new THREE.Vector3(), rotation: new THREE.Quaternion() }), []);
  useEffect(() => {
    const texture = irisTexture();
    const replacements: Array<{ mesh: THREE.Mesh; material: THREE.Material | THREE.Material[]; replacement: THREE.Material }> = [];
    for (const name of ['irisL', 'irisR', 'eyeL', 'eyeR', 'pupilL', 'pupilR']) {
      const mesh = scene.getObjectByName(name) as THREE.Mesh | undefined;
      if (!mesh?.isMesh) continue;
      const replacement = new THREE.MeshPhysicalMaterial({
        color: name.startsWith('pupil') ? '#020202' : name.startsWith('iris') ? '#ffffff' : '#e8e3d8',
        map: name.startsWith('iris') ? texture : null,
        roughness: name.startsWith('pupil') ? .8 : name.startsWith('iris') ? .52 : .28,
        clearcoat: name.startsWith('pupil') ? 0 : .55, clearcoatRoughness: .14,
      });
      replacement.userData.skipRecolor = true;
      replacements.push({ mesh, material: mesh.material, replacement });
      mesh.material = replacement;
    }
    return () => {
      for (const { mesh, material, replacement } of replacements) { mesh.material = material; replacement.dispose(); }
      texture.dispose();
      scene.getObjectByName('pupilL')?.scale.setScalar(Math.min(1.8, Math.max(.4, profile.leftMm / 5)));
      scene.getObjectByName('pupilR')?.scale.setScalar(Math.min(1.8, Math.max(.4, profile.rightMm / 5)));
    };
  }, [scene, profile.leftMm, profile.rightMm]);
  useFrame((_, dt) => {
    const delta = Math.min(dt, .05);
    elapsed.current = side ? elapsed.current + delta : 0;
    sizes.current = stepPupilLightResponse(sizes.current, profile, !!side, elapsed.current, delta);
    ['pupilL', 'pupilR'].forEach((name, index) => {
      const pupil = scene.getObjectByName(name);
      if (pupil) pupil.scale.setScalar(sizes.current[index] / 5);
    });
    if (!penlight.current || !light.current) return;
    penlight.current.visible = !!side;
    light.current.intensity = side ? .003 : 0;
    const eye = scene.getObjectByName(side === 'left' ? 'eyeL' : 'eyeR');
    if (!side || !eye) return;
    eye.getWorldPosition(vectors.position);
    eye.getWorldQuaternion(vectors.rotation);
    vectors.normal.set(0, 0, 1).applyQuaternion(vectors.rotation);
    vectors.offset.set(side === 'left' ? .04 : -.04, -.025, .085).applyQuaternion(vectors.rotation);
    penlight.current.position.copy(vectors.position).add(vectors.offset);
    penlight.current.lookAt(vectors.position);
    light.current.position.copy(vectors.position).addScaledVector(vectors.offset, .6);
  });
  return <>
    <group ref={penlight} name="pilot-penlight" visible={false}>
      <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => {}}>
        <cylinderGeometry args={[.004, .004, .055, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={.6} roughness={.3} />
      </mesh>
      <mesh position={[0, 0, .028]} raycast={() => {}}>
        <circleGeometry args={[.0035, 16]} />
        <meshBasicMaterial color="#fff5d6" side={THREE.DoubleSide} />
      </mesh>
    </group>
    <pointLight ref={light} name="pilot-penlight-illumination" intensity={0} distance={.13} decay={2} color="#fff5df" />
  </>;
}
