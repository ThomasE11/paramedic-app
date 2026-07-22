/**
 * Stage-3 rendering polish: post-processing pipeline + auto-degrade ladder.
 *
 * PatientPostEffects — the EffectComposer stack for the patient scene:
 *   - N8AO (half-res): grounded contact/crease darkening (chin/neck, axillae,
 *     costal margin, between fingers) beyond the AO already baked into the
 *     diffuse. World-space radius tuned for a 1.8 m human in a ~3 unit frame.
 *   - SMAA: the composer bypasses the default framebuffer, which disables
 *     MSAA (`antialias: true` on the context no longer applies) — SMAA
 *     restores edge quality on the silhouette/limb edges.
 *   - Bloom: GATED. High luminance threshold (1.1) so only genuine HDR
 *     sources bloom — the villa window wash, the key-light specular on skin,
 *     monitor glow. LDR emissives (region-highlight rings) stay below the
 *     gate and never smear. Unmounts with the composer on the first degrade
 *     rung, so weak devices never pay for it.
 *   - DepthOfField: gentle world-space bokeh focused on the patient. The
 *     focus distance is driven per-frame from the shared focusRig — the
 *     camera entrance writes a rack focus (wide/deep -> patient) into it,
 *     and a driver effect inside the composer applies it as a uniform write
 *     (no React re-render at 60 Hz).
 *   - Warm grade: HueSaturation pass after tone mapping — a small positive
 *     saturation lift plus a hair of hue rotation toward amber. Reads as
 *     late-afternoon villa light, keeps skin out of the clinical-grey zone.
 *   - Vignette: subtle edge darkening pulling the eye to the patient.
 *   - Film grain: deliberately absent (iPad budget).
 *
 * AdaptiveQuality — auto-degrade ladder driven by drei's PerformanceMonitor.
 * Sustained low FPS walks DOWN one tier per ~2.5 s decision round; sustained
 * headroom walks back UP. Hysteresis comes from two layers:
 *   1. The bounds gap: degrade below 45 fps, recover only above ~75% of the
 *      detected refresh rate — the dead zone between the two is stable.
 *   2. A reversal guard: if the ladder keeps changing direction (real
 *      oscillation), it pins at the more conservative tier and stops.
 *
 * Tiers (cumulative):
 *   0 full quality: composer on, dpr cap 2, contact shadows on
 *   1 composer off (biggest single cost: N8AO + full-frame passes)
 *   2 dpr -> min(base, 1.5)
 *   3 dpr -> 1
 *   4 contact shadows off
 */

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { DepthOfField, EffectComposer, Bloom, HueSaturation, N8AO, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode, type DepthOfFieldEffect } from 'postprocessing';
import { focusRig } from '@/lib/focusRig';

export type QualityTier = 0 | 1 | 2 | 3 | 4;
const MAX_TIER: QualityTier = 4;

export interface QualitySettings {
  composerEnabled: boolean;
  dpr: number;
  contactShadows: boolean;
}

export function qualityForTier(tier: QualityTier, baseDpr: number): QualitySettings {
  return {
    composerEnabled: tier < 1,
    dpr: tier >= 3 ? 1 : tier >= 2 ? Math.min(baseDpr, 1.5) : baseDpr,
    contactShadows: tier < 4,
  };
}

/**
 * Dev/capture-only forced degrade so the ladder can be demonstrated on a fast
 * machine. Same timing trap as the `unwell` flag (see index.tsx
 * readForcedUnwell): the app strips query params on mount and this component
 * ships in a lazy chunk, so the harness (scripts/measure-fps.mjs
 * --force-degrade) seeds sessionStorage via addInitScript before any app
 * script runs. Never consulted in a production build.
 */
function readForcedDegrade(): boolean {
  if (!import.meta.env.DEV) return false;
  if (typeof window === 'undefined') return false;
  try {
    return (
      new URLSearchParams(window.location.search).has('degrade') ||
      window.sessionStorage.getItem('captureForceDegrade') === '1'
    );
  } catch {
    return false;
  }
}

/**
 * Capture-harness pin: headless Chromium renders well below the 45 fps bound,
 * so without this the ladder degrades DURING a screenshot run and the "after"
 * capture silently loses the composer/shadows it exists to photograph. When
 * the capture flag is present (live `?capture` param — the same one that
 * drives preserveDrawingBuffer — or the sessionStorage seed the harness plants
 * via addInitScript), adaptation is disabled and the scene stays at tier 0.
 * A forced-degrade run overrides the pin (that run exists to film the ladder).
 */
function readCapturePin(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      new URLSearchParams(window.location.search).has('capture') ||
      window.sessionStorage.getItem('capturePinQuality') === '1'
    );
  } catch {
    return false;
  }
}

/** Drives the DepthOfField effect's focus uniforms from the shared focusRig.
 *  Runs inside the composer subtree (still under Canvas, so useFrame is live).
 *  The camera entrance writes the rig from its own raf loop; here we just
 *  flush it onto the effect — direct property setters, no React re-render.
 *  focusDistance/focusRange live on the circle-of-confusion material
 *  (world units, uniform-backed setters); the effect's `target` stays null
 *  so auto-focus never fights these writes. */
function DofDriver({ effectRef }: { effectRef: React.RefObject<DepthOfFieldEffect | null> }) {
  useFrame(() => {
    const effect = effectRef.current;
    if (!effect) return;
    effect.cocMaterial.focusDistance = focusRig.worldDistance;
    effect.cocMaterial.focusRange = focusRig.range;
    effect.bokehScale = focusRig.bokehScale;
  });
  return null;
}

/** Post-processing stack. Mount only while the quality tier allows it —
 *  unmounting (rather than `enabled={false}`) frees the N8AO/SMAA GPU buffers
 *  outright, which is the point of the first degrade rung on an iPad. */
export function PatientPostEffects() {
  const dofRef = useRef<DepthOfFieldEffect | null>(null);
  return (
    // multisampling=0: SMAA replaces MSAA — paying for both would double the
    // AA cost for no visible gain at this scene scale.
    <EffectComposer multisampling={0}>
      <DofDriver effectRef={dofRef} />
      <N8AO
        // World-units. The patient stands 1.8 m in a ~3 unit camera frame;
        // n8ao's guidance is 1–2 magnitudes below scene scale, so ~0.1–0.3.
        // 0.22 shades the real crease features (under-chin, axilla, groin,
        // finger webs) without going "soft" full-body.
        aoRadius={0.22}
        // Ratio of the radius used for depth attenuation. Slightly under the
        // safe 1.0 to cut haloing along the slim limb silhouettes.
        distanceFalloff={0.75}
        // pow(ao, intensity): 2 is n8ao's "soft" benchmark; stay under it so
        // the composer AO layers onto the baked texture AO without crushing
        // skin tones to grey.
        intensity={1.8}
        quality="performance"
        halfRes
        depthAwareUpsampling
      />
      <SMAA />
      {/* World-space focus on the patient, driven per-frame by DofDriver from
          the focusRig: resting values keep the whole body sharp at ~2.5 m
          while the room walls/props melt off; the camera entrance sweeps the
          distance from a deep doorway focus down to the patient (rack focus).
          bokehScale stays low at rest — this is depth cueing, not a portrait
          lens. Props here are just the initial state; the driver owns it. */}
      <DepthOfField
        ref={dofRef}
        focusDistance={focusRig.worldDistance}
        focusRange={focusRig.range}
        bokehScale={focusRig.bokehScale}
      />
      {/* Gated bloom: threshold above LDR white (1.1) so only true HDR sources
          bloom — window wash, key-light specular, monitor glow. The region-
          highlight rings sit in LDR and never smear. mipmapBlur keeps the
          falloff soft and cheap. Must run BEFORE ToneMapping so the bloom
          energy is in HDR and compresses naturally under ACES. */}
      <Bloom luminanceThreshold={1.1} luminanceSmoothing={0.2} intensity={0.35} mipmapBlur />
      {/* The composer renders the scene into a linear half-float buffer, which
          bypasses three's renderer-level tone mapping — without this final
          pass the skin turns bright wet plastic and the low-contrast backdrop
          planes wash out entirely (verified via before/after captures). ACES
          mode reuses three's tonemapping chunk, so the renderer's
          toneMappingExposure (0.9, tuned against the HDRI) still applies. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      {/* Warm grade, in LDR after tone mapping where the shift is predictable:
          a small saturation lift plus a hair of hue rotation toward amber.
          Reads as late-afternoon villa light; keeps skin out of the clinical
          grey zone the ACES curve alone tends toward at this exposure. */}
      <HueSaturation hue={0.02} saturation={0.08} />
      {/* After tone mapping so the darkening is predictable in LDR. */}
      <Vignette eskil={false} offset={0.26} darkness={0.55} />
    </EffectComposer>
  );
}

interface AdaptiveQualityProps {
  tier: QualityTier;
  onTierChange: (next: QualityTier) => void;
}

/**
 * Lives inside <Canvas>. Watches real FPS via PerformanceMonitor and walks the
 * degrade ladder; applies the dpr rung directly through r3f's setDpr.
 * State is minimal: the single `tier` number lives in the parent, everything
 * else here is refs.
 */
export function AdaptiveQuality({ tier, onTierChange }: AdaptiveQualityProps) {
  const setDpr = useThree((s) => s.setDpr);
  const baseDprRef = useRef(
    typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2,
  );

  // Refs, not state: the monitor callbacks fire from the frame loop.
  const tierRef = useRef<QualityTier>(tier);
  tierRef.current = tier;
  const lastDirectionRef = useRef<0 | 1 | -1>(0);
  const reversalsRef = useRef(0);
  const pinnedRef = useRef(false);
  const lastChangeAtRef = useRef(0);

  // Apply the dpr rung whenever the tier crosses it.
  useEffect(() => {
    setDpr(qualityForTier(tier, baseDprRef.current).dpr);
  }, [tier, setDpr]);

  // Dev hook for the measure/verify harness (scripts/measure-fps.mjs).
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const q = qualityForTier(tier, baseDprRef.current);
    (window as unknown as { __adaptiveQuality?: object }).__adaptiveQuality = {
      tier,
      composerEnabled: q.composerEnabled,
      dpr: q.dpr,
      contactShadows: q.contactShadows,
    };
  }, [tier]);

  const move = (direction: 1 | -1) => {
    if (pinnedRef.current) return;
    // Cooldown on top of PerformanceMonitor's ~2.5 s rounds: a tier change
    // itself perturbs the next samples (buffer alloc/free, dpr resize), so
    // ignore verdicts made within 4 s of the last change.
    const now = performance.now();
    if (now - lastChangeAtRef.current < 4000) return;
    const current = tierRef.current;
    const next = (direction === 1
      ? Math.min(MAX_TIER, current + 1)
      : Math.max(0, current - 1)) as QualityTier;
    if (next === current) return;
    // Oscillation guard: bouncing up/down repeatedly means the machine sits
    // exactly on a boundary — pin at the more conservative (higher) tier of
    // the bounce and stop adapting for this session.
    if (lastDirectionRef.current !== 0 && direction !== lastDirectionRef.current) {
      reversalsRef.current += 1;
      if (reversalsRef.current >= 6) {
        pinnedRef.current = true;
        if (direction === -1) return; // refuse the upward move; stay degraded
      }
    }
    lastDirectionRef.current = direction;
    lastChangeAtRef.current = now;
    onTierChange(next);
  };

  // Forced-degrade (ladder demo) beats the capture pin beats live adaptation.
  const forced = readForcedDegrade();
  if (!forced && readCapturePin()) return null;

  return (
    <PerformanceMonitor
      // Decision round = iterations x ms = 10 x 250 ms = 2.5 s of averages;
      // >75% of them must sit past a bound to trigger — "sustained", not spikes.
      bounds={(refreshRate) => [45, Math.max(50, Math.round(refreshRate * 0.75))]}
      onDecline={() => move(1)}
      onIncline={() => move(-1)}
    >
      {forced ? <ForcedDegradeBurner /> : null}
    </PerformanceMonitor>
  );
}

/**
 * Dev-only load generator: busy-waits the main thread inside the frame loop so
 * the REAL PerformanceMonitor detection path trips (we don't fake the tier —
 * we genuinely tank the frame rate, watch the ladder walk down, then release
 * and watch it recover). Active 3 s after mount (letting the monitor first see
 * the true refresh rate) for 18 s.
 */
function ForcedDegradeBurner() {
  const mountedAtRef = useRef(performance.now());
  useFrame(() => {
    const elapsed = performance.now() - mountedAtRef.current;
    if (elapsed < 3000 || elapsed > 21000) return;
    const until = performance.now() + 35; // ~28 fps ceiling
    while (performance.now() < until) {
      /* burn */
    }
  });
  return null;
}
