import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { applyWoundsToTextures } from './WoundLayer';
import type { BodyInjury } from '@/lib/injuryMap';

function makeSkinMesh(posed = false): THREE.SkinnedMesh {
  const geometry = new THREE.BoxGeometry(0.4, 1.8, 0.25, 4, 18, 2);
  geometry.translate(0, 0.9, 0);
  const image = {
    width: 64,
    height: 64,
    getContext: () => ({
      save() {},
      restore() {},
      translate() {},
      rotate() {},
      beginPath() {},
      closePath() {},
      fill() {},
      stroke() {},
      moveTo() {},
      lineTo() {},
      quadraticCurveTo() {},
      bezierCurveTo() {},
      ellipse() {},
      arc() {},
      rect() {},
      fillRect() {},
      setLineDash() {},
      createRadialGradient: () => ({ addColorStop() {} }),
      createLinearGradient: () => ({ addColorStop() {} }),
    }),
  };
  const texture = { image, flipY: true, needsUpdate: false } as unknown as THREE.CanvasTexture;
  const mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshStandardMaterial());
  mesh.bind(new THREE.Skeleton([new THREE.Bone()]));
  mesh.userData.eyesOpenTex = texture;
  if (posed) {
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.98;
    mesh.updateMatrixWorld(true);
  }
  return mesh;
}

describe('applyWoundsToTextures bind-space classification', () => {
  it('still paints a chest wound after the mesh is laid onto a stretcher', () => {
    const injuries: Array<Pick<BodyInjury, 'id' | 'kind' | 'label' | 'detail' | 'severity' | 'region'>> = [{
      id: 'chest-wound-bind',
      kind: 'wound',
      label: 'Chest laceration',
      detail: 'Deep cut to the anterior chest',
      severity: 'major',
      region: 'chest',
    }];
    const standing = applyWoundsToTextures(makeSkinMesh(false), injuries, () => 'chest');
    const posed = applyWoundsToTextures(makeSkinMesh(true), injuries, () => 'chest');
    expect(standing).toBeGreaterThan(0);
    expect(posed).toBe(standing);
  });
});
