import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { DepthOfField, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode, type DepthOfFieldEffect, type EffectComposer as Composer } from 'postprocessing';
import { Vector3, type Group } from 'three';

function FaceFocus({ active, face, effect }: {
  active: boolean;
  face: Group | null;
  effect: React.RefObject<DepthOfFieldEffect | null>;
}) {
  const point = useRef(new Vector3());
  const scene = useThree(state => state.scene);
  useEffect(() => () => { delete scene.userData.conversationFocus; }, [scene]);
  useFrame(({ camera, scene }) => {
    const dof = effect.current;
    if (!dof) return;
    const enabled = active && face !== null;
    if (enabled) {
      face.updateWorldMatrix(true, false);
      point.current.set(0, 1.43, 0.06).applyMatrix4(face.matrixWorld);
      dof.cocMaterial.focusDistance = camera.position.distanceTo(point.current);
    }
    // A generous sharp zone retains eyes, mouth, mask and chest movement.
    // Assessment never blurs findings: the parent unmounts the portrait pass
    // entirely when returning to hands-on care, restoring renderer auto-clear.
    dof.cocMaterial.focusRange = 1.2;
    dof.bokehScale = enabled ? 1.4 : 0;
    const evidence = scene.userData.conversationFocus ??= {};
    Object.assign(evidence, { active: enabled, distance: dof.cocMaterial.focusDistance,
      range: dof.cocMaterial.focusRange, bokeh: dof.bokehScale });
  });
  return null;
}

/** Reference-scene-only portrait focus. Deliberately excludes the unstable
 * AO/upscale stack; the adaptive ladder can unmount this whole component. */
export function ConversationFocus({ active, face }: { active: boolean; face: Group | null }) {
  const effect = useRef<DepthOfFieldEffect | null>(null);
  const composer = useRef<Composer | null>(null);
  const lifecycle = useRef({ generation: 0 });
  const gl = useThree(state => state.gl);
  // The composer constructor disables auto-clear, but the React wrapper only
  // restores tone mapping. Capture the direct renderer state before mounting it.
  const originalAutoClear = useRef(gl.autoClear);
  useEffect(() => {
    const autoClear = originalAutoClear.current;
    const instance = composer.current;
    const lifetime = lifecycle.current;
    const generation = ++lifetime.generation;
    return () => {
      gl.autoClear = autoClear;
      // The wrapper removes passes but retains its own render/depth buffers.
      // Defer disposal past React's synchronous StrictMode effect replay so
      // the replay can keep using the same composer; real unmounts release it.
      queueMicrotask(() => {
        if (lifetime.generation === generation) instance?.dispose();
      });
    };
  }, [gl]);
  return <EffectComposer ref={composer} multisampling={0}>
    <FaceFocus active={active} face={face} effect={effect} />
    <DepthOfField ref={effect} focusDistance={2} focusRange={1.2} bokehScale={0} />
    <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
  </EffectComposer>;
}
