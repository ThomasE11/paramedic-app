import * as THREE from 'three';

export interface AssessmentContactFrame {
  position: [number, number, number];
  normal: [number, number, number];
}

/** Bind once to a skin triangle, then follow its live morph and bone vertices.
 * Unlike label projection this has no 30 mm stand-off and never stays behind
 * when the chest breathes or a limb bends. Reference coordinates are supplied
 * by BodyMesh, in its existing anatomical author frame.
 */
export function createAssessmentContactSampler(
  body: THREE.Mesh,
  reference: readonly Float32Array[],
) {
  const index = body.geometry.index;
  const count = index?.count ?? reference[0].length;
  const cache = new Map<string, { vertices: number[]; weights: THREE.Vector3 }>();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const target = new THREE.Vector3(), closest = new THREE.Vector3();
  const triangle = new THREE.Triangle(a, b, c);
  const normal = new THREE.Vector3(), point = new THREE.Vector3();
  return (x: number, y: number, z: number): AssessmentContactFrame | null => {
    const key = `${x}:${y}:${z}`;
    let anchor = cache.get(key);
    if (!anchor) {
      target.set(x, y, z);
      let best = Infinity;
      for (let i = 0; i + 2 < count; i += 3) {
        const i0 = index ? index.getX(i) : i;
        const i1 = index ? index.getX(i + 1) : i + 1;
        const i2 = index ? index.getX(i + 2) : i + 2;
        a.set(reference[0][i0], reference[1][i0], reference[2][i0]);
        b.set(reference[0][i1], reference[1][i1], reference[2][i1]);
        c.set(reference[0][i2], reference[1][i2], reference[2][i2]);
        triangle.closestPointToPoint(target, closest);
        const distance = closest.distanceToSquared(target);
        if (distance >= best || triangle.getArea() < 1e-10) continue;
        best = distance;
        anchor = { vertices: [i0, i1, i2], weights: triangle.getBarycoord(closest, new THREE.Vector3())! };
      }
      if (!anchor) return null;
      cache.set(key, anchor);
    }
    body.updateWorldMatrix(true, false);
    const skinned = body as THREE.SkinnedMesh;
    if (skinned.isSkinnedMesh) skinned.skeleton.update();
    [a, b, c].forEach((v, offset) => body.getVertexPosition(anchor.vertices[offset], v).applyMatrix4(body.matrixWorld));
    triangle.getNormal(normal);
    point.copy(a).multiplyScalar(anchor.weights.x).addScaledVector(b, anchor.weights.y).addScaledVector(c, anchor.weights.z);
    return { position: point.toArray(), normal: normal.toArray() };
  };
}

export interface ContactLandmark {
  region: string;
  label: string;
  position: [number, number, number];
  actionId?: string;
}

export interface AuscultationStep extends ContactLandmark {
  sound: 'right-upper' | 'left-upper' | 'right' | 'left' | 'right-lower' | 'left-lower' | 'heart';
  durationMs: number;
}

/** Presentation of one existing assessment, not additional scored actions.
 * These are ANTERIOR lung fields; posterior/lateral assessment is still needed
 * for a complete lung examination (Clinical Methods, NCBI NBK356).
 * Cardiac areas follow Open RN Nursing Skills, NCBI NBK596723, figure 9.8.
 * Positions are calibrated only for the resp-001 adult's reference landmarks.
 */
export function getPilotAuscultationSteps(action: string | null, landmarks: readonly ContactLandmark[], respiratoryRate = 32): AuscultationStep[] {
  const site = (suffix: string) => landmarks.find(item => item.region === 'chest' && item.actionId === `chest-auscultate-${suffix}`);
  if (action === 'chest-auscultate-lungs') {
    const ru = site('ru'), lu = site('lu'), rl = site('rl'), ll = site('ll');
    if (!ru || !lu || !rl || !ll) return [];
    // At least one full respiratory cycle, including a slower treated patient.
    const durationMs = Math.max(4000, Math.ceil(75000 / Math.max(6, respiratoryRate || 32)));
    const middle = (upper: ContactLandmark, lower: ContactLandmark, label: string): ContactLandmark => ({
      region: 'chest', label, position: upper.position.map((value, i) => (value + lower.position[i]) / 2) as [number, number, number],
    });
    return [
      { ...ru, sound: 'right-upper', durationMs }, { ...lu, sound: 'left-upper', durationMs },
      { ...middle(ru, rl, 'R mid-zone'), sound: 'right', durationMs },
      { ...middle(lu, ll, 'L mid-zone'), sound: 'left', durationMs },
      { ...rl, sound: 'right-lower', durationMs }, { ...ll, sound: 'left-lower', durationMs },
    ];
  }
  const heart = site('heart');
  if (action !== 'chest-auscultate-heart' || !heart) return [];
  return [
    { label: 'Aortic area', dx: -.09, dy: .08 },
    { label: 'Pulmonic area', dx: -.03, dy: .08 },
    { label: 'Tricuspid area', dx: -.035, dy: 0 },
    { label: 'Mitral / apex', dx: .025, dy: -.02 },
  ].map(({ label, dx, dy }) => ({ ...heart, label, sound: 'heart', durationMs: 3000,
    position: [heart.position[0] + dx, heart.position[1] + dy, heart.position[2]],
  }));
}

/** One cancellable clock drives each visual/audio step. No detached delayed
 * callbacks may survive a new action, region exit, case change or unmount.
 */
export function startAuscultationSequence(steps: readonly AuscultationStep[], onStep: (step: AuscultationStep, index: number) => void, onComplete: () => void) {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const advance = (index: number) => {
    if (cancelled) return;
    if (index >= steps.length) { onComplete(); return; }
    onStep(steps[index], index);
    if (!cancelled) timer = setTimeout(() => advance(index + 1), steps[index].durationMs);
  };
  advance(0);
  return () => { cancelled = true; clearTimeout(timer); };
}

export function resolveAssessmentContact(action: string | null, region: string | null, landmarks: readonly ContactLandmark[], sequenceIndex = 0) {
  if (!action || !region) return null;
  const technique = action.includes('auscultate') || action === 'airway-listen' ? 'auscultate'
    : action.includes('palpate') ? 'palpate' : action.includes('percuss') ? 'percuss' : null;
  if (!technique) return null;
  const tour = getPilotAuscultationSteps(action, landmarks);
  if (tour.length && region === 'chest') {
    const step = tour[Math.min(Math.max(0, sequenceIndex), tour.length - 1)];
    return { ...step, technique, action, bilateral: action === 'chest-auscultate-lungs' };
  }
  // General bilateral actions demonstrate paired contacts in sequence, not
  // four simultaneous stethoscopes. They do not create new regional findings.
  const bilateral = action === 'chest-auscultate-lungs' || action === 'chest-percuss';
  const siteAction = bilateral ? `chest-auscultate-${['ru', 'lu', 'rl', 'll'][sequenceIndex % 4]}`
    : action.startsWith('abd-') ? action.replace(/-(palpate|percuss)$/, '-auscultate')
    : action === 'airway-listen' ? 'trachea-palpate' : action;
  const landmark = landmarks.find(item => item.region === region && item.actionId === siteAction);
  return landmark ? { ...landmark, technique, action, bilateral } : null;
}
