import { terrainHeight, TERRAIN_SIZE } from '../terrain/Terrain';

// Cheap deterministic PRNG so scatter layouts are stable across renders.
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type ScatterPoint = {
  x: number;
  y: number;
  z: number;
  rotY: number;
  scale: number;
};

export function scatter({
  seed,
  count,
  radius = TERRAIN_SIZE / 2 - 5,
  minRadius = 0,
  scaleMin = 0.8,
  scaleMax = 1.2,
  avoidOrigin = 4, // keep clear circle near (0,0) so the player spawns in open space
}: {
  seed: number;
  count: number;
  radius?: number;
  minRadius?: number;
  scaleMin?: number;
  scaleMax?: number;
  avoidOrigin?: number;
}): ScatterPoint[] {
  const rand = mulberry32(seed);
  const points: ScatterPoint[] = [];
  let tries = 0;
  while (points.length < count && tries < count * 8) {
    tries++;
    // sample inside a disc, biased away from center
    const r = Math.sqrt(rand()) * (radius - minRadius) + minRadius;
    const theta = rand() * Math.PI * 2;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    if (Math.hypot(x, z) < avoidOrigin) continue;
    const y = terrainHeight(x, z);
    points.push({
      x,
      y,
      z,
      rotY: rand() * Math.PI * 2,
      scale: scaleMin + rand() * (scaleMax - scaleMin),
    });
  }
  return points;
}
