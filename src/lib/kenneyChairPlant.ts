/**
 * Kenney furniture-kit chairs are authored at doll scale (seat ~0.20–0.31 m)
 * with a corner origin (x,z ≥ 0, backrest at min-z). The seated patient plant
 * in BodyMesh expects a 0.53 m seat pan centred on world z=0.32, same as the
 * previous procedural chairs, so the pelvis stays on the pan and the backrest
 * stays behind the torso.
 */
export const PATIENT_CHAIR_SEAT_Y = 0.53;
export const PATIENT_CHAIR_SEAT_Z = 0.32;

export const KENNEY_CHAIR_NATIVE = {
  dining: {
    url: '/models/props/kenney-chair.glb',
    centerX: 0.1,
    seatY: 0.21,
    seatZ: -0.112,
    backZ: -0.18,
  },
  cushion: {
    url: '/models/props/kenney-cushion-chair.glb',
    centerX: 0.1,
    seatY: 0.211,
    seatZ: -0.109,
    backZ: -0.18,
  },
  desk: {
    url: '/models/props/kenney-desk-chair.glb',
    centerX: 0.1675,
    seatY: 0.307,
    seatZ: -0.166,
    backZ: -0.292,
  },
} as const;

export type KenneyChairKind = keyof typeof KENNEY_CHAIR_NATIVE;

export function kenneyChairPlant(kind: KenneyChairKind): {
  url: string;
  scale: number;
  position: [number, number, number];
} {
  const native = KENNEY_CHAIR_NATIVE[kind];
  const scale = PATIENT_CHAIR_SEAT_Y / native.seatY;
  return {
    url: native.url,
    scale,
    position: [
      -native.centerX * scale,
      0,
      PATIENT_CHAIR_SEAT_Z - native.seatZ * scale,
    ],
  };
}

export function kenneyChairWorldSeat(kind: KenneyChairKind): {
  seatY: number;
  seatZ: number;
  backZ: number;
} {
  const native = KENNEY_CHAIR_NATIVE[kind];
  const { scale, position } = kenneyChairPlant(kind);
  return {
    seatY: position[1] + native.seatY * scale,
    seatZ: position[2] + native.seatZ * scale,
    backZ: position[2] + native.backZ * scale,
  };
}
