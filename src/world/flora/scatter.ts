import { terrainHeight } from '../terrain/heightmap';

// Deterministic pseudo-random — same layout every reload.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Scatter = {
  x: number;
  y: number;
  z: number;
  rot: number;
  scale: number;
};

/**
 * Scatter `count` points across an annulus, snapped to the terrain height.
 * Keeps a clear bubble around origin so the spawn area isn't visually cluttered.
 */
export function scatter({
  count,
  seed,
  innerR = 6,
  outerR = 70,
  scaleMin = 0.8,
  scaleMax = 1.4,
}: {
  count: number;
  seed: number;
  innerR?: number;
  outerR?: number;
  scaleMin?: number;
  scaleMax?: number;
}): Scatter[] {
  const rand = mulberry32(seed);
  const out: Scatter[] = [];
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = innerR + Math.sqrt(rand()) * (outerR - innerR);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = terrainHeight(x, z);
    out.push({
      x,
      y,
      z,
      rot: rand() * Math.PI * 2,
      scale: scaleMin + rand() * (scaleMax - scaleMin),
    });
  }
  return out;
}
