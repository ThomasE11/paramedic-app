/**
 * ActiveBleedLayer — a *living* bleed overlay for the treatment bay.
 *
 * Static wound decals read as "paint". This layer makes an active bleed
 * unmistakable at a glance: a soft red glow that pulses with the patient's
 * heart rhythm at the wound site. When the student achieves source control
 * (tourniquet / pressure dressing / chest seal), the glow collapses — the
 * wound "dies" visually, exactly like a real bleeding site under control.
 *
 * Self-contained: no clinical state, pure presentational input.
 *   - `overlays`: the same PatientWoundOverlay[] fed to the body.
 *   - `controlledIds`: wound ids considered controlled.
 *   - `sampler`: projects a 2D landmark onto the real mesh surface.
 *   - `bpm`: heart rate drives the pulse frequency.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PatientWoundOverlay } from '@/lib/patientVisualState';
import type { SurfaceSampler } from './BodyMesh';

const ANCHORS: Record<string, [number, number, number]> = {
  'left-arm': [0.145, 1.10, 0.16],
  'right-arm': [-0.145, 1.10, 0.16],
  'left-leg': [0.165, 0.42, 0.18],
  'right-leg': [-0.165, 0.42, 0.18],
  'chest': [0.0, 1.27, 0.20],
  'abdomen': [0.0, 1.02, 0.24],
  'pelvis': [0.0, 0.90, 0.24],
  'neck': [0.0, 1.46, 0.22],
  'face': [0.0, 1.62, 0.20],
  'posterior': [0.0, 1.10, -0.20],
};

function makeBleedTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  // Hot core that reads against both skin and clothing: bright crimson
  // centre fading through red to transparent — unmistakable as fresh blood.
  const grad = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 40, 30, 0.98)');
  grad.addColorStop(0.28, 'rgba(230, 30, 20, 0.85)');
  grad.addColorStop(0.55, 'rgba(190, 20, 15, 0.55)');
  grad.addColorStop(1, 'rgba(150, 10, 10, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  // Bright rim — a thin ring of alert-red that separates the glow from a
  // red garment underneath.
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 80, 60, 0.9)';
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function ActiveBleedSprites({
  overlays,
  controlledIds,
  sampler,
  bpm = 80,
}: {
  overlays: PatientWoundOverlay[];
  controlledIds: Set<string>;
  sampler: SurfaceSampler | null;
  bpm?: number;
}) {
  const texture = useMemo(() => makeBleedTexture(), []);
  const groupRef = useRef<THREE.Group>(null);

  const sites = useMemo(() => {
    return overlays
      .filter(o => o.kind === 'active_bleeding')
      .map((o, i) => {
        const anchor = ANCHORS[o.region] ?? ANCHORS.chest;
        const pos: [number, number, number] =
          sampler && o.region !== 'posterior'
            ? sampler(anchor[0], anchor[1])
            : anchor;
        // Sampler can return NaN for landmarks outside the sampled mesh —
        // never let a NaN position silently cull the bleed sprite.
        const safePos: [number, number, number] = Number.isFinite(pos[0]) && Number.isFinite(pos[1]) && Number.isFinite(pos[2])
          ? pos
          : anchor;
        const upward: [number, number, number] = ['chest', 'abdomen', 'pelvis', 'face', 'neck'].includes(o.region)
          ? [safePos[0], safePos[1] + 0.06, safePos[2]]
          : o.region === 'posterior'
            ? [safePos[0], safePos[1] - 0.06, safePos[2]]
            : [safePos[0], safePos[1], safePos[2] + 0.045]; // limbs: lateral +Z
        return { pos: upward, id: `bleed-${o.region}-${i}`, region: o.region };
      });
  }, [overlays, sampler]);

  const spritesRef = useRef<THREE.Sprite[]>([]);
  const sitesRef = useRef(sites);
  sitesRef.current = sites;
  const siteSignature = sites.map(site => site.id).join('|');

  // Imperative sprite construction keeps the material under the animation
  // loop's ownership. Rebuild only when the wound identities change, not
  // whenever vitals or breathing mint a fresh position/overlay array.
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    while (g.children.length) g.remove(g.children[0]);
    spritesRef.current = sitesRef.current.map(site => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          depthTest: false,
          toneMapped: false,
          opacity: 0.3,
        }),
      );
      sprite.position.set(site.pos[0], site.pos[1], site.pos[2]);
      sprite.renderOrder = 999;
      g.add(sprite);
      return sprite;
    });
  }, [siteSignature, texture]);

  const controlTokens = useMemo(() => [...controlledIds].map(id => id.toLowerCase()), [controlledIds]);

  const siteIsControlled = (region: string) => {
    const generalControl = controlTokens.some(id =>
      id.includes('direct_pressure')
      || id.includes('pressure_dressing')
      || id.includes('pressure_bandage')
      || id.includes('wound_packing')
      || id.includes('haemostatic')
      || id.includes('hemostatic')
      || id.includes('bandage'),
    );
    if (generalControl) return true;
    if (region === 'chest') {
      return controlTokens.some(id => id.includes('chest_seal') || id.includes('occlusive_dressing'));
    }
    if (region.includes('arm') || region.includes('leg')) {
      return controlTokens.some(id => id.includes('tourniquet'));
    }
    return false;
  };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const freq = Math.min(180, Math.max(30, bpm || 80)) / 60;
    spritesRef.current.forEach((sprite, idx) => {
      const site = sites[idx];
      if (!site) return;
      const mat = sprite.material as THREE.SpriteMaterial;
      // Follow chest/limb movement without replacing the animated material.
      sprite.position.set(site.pos[0], site.pos[1], site.pos[2]);
      const controlled = siteIsControlled(site.region);
      if (controlled) {
        mat.opacity = 0;
        sprite.scale.setScalar(0.4);
        return;
      }
      const pulse = 0.5 + 0.5 * Math.sin(t * Math.min(freq, 1.1) * Math.PI * 2);
      // A wound cue must never become a full-torso flashing disc. Keep the
      // opacity and scale variations subtle; continuous bleeding reads through
      // the crimson texture while motion stays below the flicker threshold.
      const target = 0.72 + 0.05 * pulse;
      mat.opacity += (target - mat.opacity) * 0.08;
      const scale = 0.06 + 0.006 * pulse;
      sprite.scale.setScalar(scale);
    });
  });

  return <group ref={groupRef} />;
}