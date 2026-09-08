import type { EnvironmentVariant } from '@/lib/sceneEnvironment';

export interface CameraOrbitSafety {
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
}

const OPEN_SCENE: CameraOrbitSafety = {
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
  maxDistance: 7,
  minPolarAngle: Math.PI / 2 - 0.1,
  maxPolarAngle: Math.PI / 2 + 0.1,
};

// Villa room front (open) at z=+2.8, back wall at z=-2.6, hall extending to
// z=-5.4. Side walls: x=±3.25. Floor ~y=0, ceiling ~y=+2.75. Camera eye ~y=1.6.

/**
 * Keep a first-person camera inside authored indoor shells.
 *
 * The room fronts are deliberately open, so indoor care is viewed from the
 * same side a crew entered. Posterior examination is a patient movement (the
 * Log Roll workflow), not a 180° camera orbit through the back wall.
 */
export function cameraOrbitSafetyForEnvironment(variant: EnvironmentVariant): CameraOrbitSafety {
  if (variant === 'clinic') {
    // Clinic side walls sit at x=±2.05. A smaller arc and tighter bounds.
    return {
      minAzimuthAngle: -Math.PI / 6,
      maxAzimuthAngle: Math.PI / 6,
      maxDistance: 3.7,
      minPolarAngle: Math.PI / 2 - 0.1,
      maxPolarAngle: Math.PI / 2 + 0.1,
    };
  }
  if (variant === 'home') {
    // Villa room front (open) at z=+2.8, back wall at z=-2.6, hall extending to z=-5.4
    // Side walls: x=±3.25. Floor ~y=0, ceiling ~y=+2.75. Camera eye level ~y=+1.6
    // Clamp azimuth to keep camera within room width, clamp distance to stay in front wall
    // and ceiling buffer, use polar-angle limits for floor/ceiling clearance.
    return {
      minAzimuthAngle: -Math.PI / 4,
      maxAzimuthAngle: Math.PI / 4,
      maxDistance: 4.0,
      minPolarAngle: Math.PI / 2 - 0.12, // slightly below eye level but with buffer
      maxPolarAngle: Math.PI / 2 + 0.1,  // above floor plane
    };
  }
  if (variant === 'public') {
    // The venue has open sides but a storefront wall behind the patient.
    return {
      minAzimuthAngle: -Math.PI / 3,
      maxAzimuthAngle: Math.PI / 3,
      maxDistance: 6,
      minPolarAngle: Math.PI / 2 - 0.15,
      maxPolarAngle: Math.PI / 2 + 0.1,
    };
  }
  return OPEN_SCENE;
}
