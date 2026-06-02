import * as THREE from 'three';

// 3-step toon gradient: shadow / mid / highlight.
// Plug this into MeshToonMaterial's gradientMap to get hand-drawn stepped lighting.
export function makeToonGradient() {
  const data = new Uint8Array([
    60, 60, 60, 255,
    140, 140, 140, 255,
    220, 220, 220, 255,
  ]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}
