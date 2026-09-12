import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { DepthOfFieldEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from 'postprocessing';
import { HalfFloatType, NoToneMapping, Vector3, type Group } from 'three';

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
  const composer = useRef<EffectComposer | null>(null);
  const { gl, scene, camera, size } = useThree();
  // Own allocation and disposal in the same effect. The React composer wrapper
  // memoises an instance across effect replay / Suspense reconnection; disposing
  // that instance externally can leave its next addPass with a null renderer.
  // Each setup here creates a fresh, complete pipeline; cleanup owns all passes.
  useEffect(() => {
    const autoClear = gl.autoClear;
    const toneMapping = gl.toneMapping;
    gl.toneMapping = NoToneMapping;
    const instance = new EffectComposer(gl, { multisampling: 0, frameBufferType: HalfFloatType });
    const focus = new DepthOfFieldEffect(camera, { bokehScale: 0 });
    const tone = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
    instance.addPass(new RenderPass(scene, camera));
    instance.addPass(new EffectPass(camera, focus, tone));
    composer.current = instance;
    effect.current = focus;
    return () => {
      composer.current = null;
      effect.current = null;
      instance.dispose();
      gl.autoClear = autoClear;
      gl.toneMapping = toneMapping;
    };
  }, [gl, scene, camera]);
  useEffect(() => { composer.current?.setSize(size.width, size.height); }, [size.width, size.height, gl, camera, scene]);
  useFrame((_, delta) => { composer.current?.render(delta); }, 1);
  return <FaceFocus active={active} face={face} effect={effect} />;
}
