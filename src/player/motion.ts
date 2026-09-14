/** Small kinematic motion model: meters, seconds, explicit fixed-step input. */
export const MOTION = { walk: 4.2, run: 7, gravity: 20, jump: 7, acceleration: 30 };
export function approach(value: number, target: number, maximumDelta: number): number {
  return value < target ? Math.min(target, value + maximumDelta) : Math.max(target, value - maximumDelta);
}
export function horizontalVelocity(current: { x: number; z: number }, desired: { x: number; z: number }, dt: number) {
  const dx = desired.x - current.x, dz = desired.z - current.z;
  const distance = Math.hypot(dx, dz), factor = distance ? Math.min(1, MOTION.acceleration * dt / distance) : 0;
  return { x: current.x + dx * factor, z: current.z + dz * factor };
}
