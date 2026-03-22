/**
 * Full human body assembled from clickable region meshes.
 * Each region triggers a secondary survey assessment step when clicked.
 */

import { BODY_REGIONS } from './bodyRegions';
import { BodyRegion } from './BodyRegion';

interface BodyMeshProps {
  assessedRegions: Set<string>;
  onRegionClick: (stepId: string) => void;
}

export function BodyMesh({ assessedRegions, onRegionClick }: BodyMeshProps) {
  return (
    <group position={[0, -2, 0]}>
      {BODY_REGIONS.map((region) => (
        <BodyRegion
          key={region.id}
          def={region}
          isAssessed={assessedRegions.has(region.id)}
          onRegionClick={onRegionClick}
        />
      ))}
    </group>
  );
}
