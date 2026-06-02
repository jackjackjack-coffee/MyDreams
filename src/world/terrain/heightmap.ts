// Shared heightmap function so visible geometry and collider agree.
// Cheap, deterministic, smooth — no external noise lib needed.
export function terrainHeight(x: number, z: number): number {
  const a = 0.75 * Math.sin(x * 0.07) * Math.cos(z * 0.06);
  const b = 0.4 * Math.sin(x * 0.17 + 1.7) * Math.cos(z * 0.21 + 0.4);
  const c = 0.18 * Math.sin(x * 0.41 + 3.1) * Math.cos(z * 0.38 - 2.2);

  // Flatten near origin so spawn area is gentle and walkable.
  const r = Math.hypot(x, z);
  const flatten = Math.min(1, Math.max(0, (r - 3) / 6));

  return (a + b + c) * flatten;
}
