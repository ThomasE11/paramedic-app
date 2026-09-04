import type { EnvironmentVariant } from '@/lib/sceneEnvironment';

export interface CameraOrbitSafety {
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  maxDistance: number;
}

const OPEN_SCENE: CameraOrbitSafety = {
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
  maxDistance: 7,
};

/**
 * Keep a first-person camera inside authored indoor shells.
 *
 * The room fronts are deliberately open, so indoor care is viewed from the
 * same side a crew entered. Posterior examination is a patient movement (the
 * Log Roll workflow), not a 180° camera orbit through the back wall.
 */
export function cameraOrbitSafetyForEnvironment(variant: EnvironmentVariant): CameraOrbitSafety {
  if (variant === 'clinic') {
    // Clinic side walls sit at x=±2.05. A 30° arc at the 3.7 m distance cap
    // leaves a small camera clearance while retaining useful oblique views.
    return {
      minAzimuthAngle: -Math.PI / 6,
      maxAzimuthAngle: Math.PI / 6,
      maxDistance: 3.7,
    };
  }
  if (variant === 'home') {
    // Villa side walls sit at x=±3.25; the front is open at z=2.8.
    return {
      minAzimuthAngle: -Math.PI / 4,
      maxAzimuthAngle: Math.PI / 4,
      maxDistance: 4.3,
    };
  }
  if (variant === 'public') {
    // The venue has open sides but a storefront wall behind the patient.
    return {
      minAzimuthAngle: -Math.PI / 2,
      maxAzimuthAngle: Math.PI / 2,
      maxDistance: 7,
    };
  }
  return OPEN_SCENE;
}
