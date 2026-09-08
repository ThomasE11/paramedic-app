/** A short walking circuit through the clear bedside lane, in metres.
 * Straight passes are joined by half-circle turns. Heading is the tangent
 * of the path, so the patient never walks sideways or snaps backwards.
 */
export function patientWalkingPath(seconds: number) {
  const length = 1.1;
  const radius = 0.24;
  const speed = 0.42;
  const turn = Math.PI * radius;
  const distance = (Math.max(0, Number.isFinite(seconds) ? seconds : 0) * speed) % (2 * (length + turn));
  if (distance < length) return { x: 0, z: distance, yaw: 0 };
  if (distance < length + turn) {
    const angle = (distance - length) / radius;
    return { x: radius * (1 - Math.cos(angle)), z: length + radius * Math.sin(angle), yaw: angle };
  }
  if (distance < 2 * length + turn) return { x: 2 * radius, z: 2 * length + turn - distance, yaw: Math.PI };
  const angle = (distance - 2 * length - turn) / radius;
  return { x: radius * (1 + Math.cos(angle)), z: -radius * Math.sin(angle), yaw: Math.PI + angle };
}
