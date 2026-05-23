import { useMemo } from 'react';
import { RigidBody, HeightfieldCollider } from '@react-three/rapier';
import * as THREE from 'three';

// Big square terrain made of a subdivided plane with hand-rolled
// sine/fbm-style displacement. Matches a Rapier Heightfield collider so
// the player can actually walk on the bumps.

export const TERRAIN_SIZE = 200;
const SEGMENTS = 128; // grid resolution (segments per side)

// Smooth hash + value noise, identical to what's in the aurora shader
// (kept local so terrain stays standalone).
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function smoothNoise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return (
    a * (1 - ux) * (1 - uy) +
    b * ux * (1 - uy) +
    c * (1 - ux) * uy +
    d * ux * uy
  );
}
function fbm(x: number, y: number) {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < 4; i++) {
    v += amp * smoothNoise(x * f, y * f);
    f *= 2;
    amp *= 0.5;
  }
  return v;
}

/**
 * Height in world units at world coords (x, z).
 * Used both by the terrain mesh and by other modules that want to
 * scatter things on the ground (flowers, stones, etc).
 */
export function terrainHeight(x: number, z: number): number {
  // big rolling hills
  const big = fbm(x * 0.012, z * 0.012) * 6.0;
  // medium bumps
  const mid = fbm(x * 0.04 + 17, z * 0.04 + 3) * 1.4;
  // tiny detail
  const small = fbm(x * 0.15, z * 0.15) * 0.25;
  // keep an open valley near origin so the player has somewhere flat to land
  const distToOrigin = Math.sqrt(x * x + z * z);
  const flatten = 1 - Math.exp(-distToOrigin * distToOrigin / 200);
  return (big + mid + small) * flatten - 0.5;
}

export function Terrain() {
  // Build a heightfield array Rapier wants. HeightfieldCollider uses
  // (nrows+1) * (ncols+1) heights laid out row-major.
  const { heights, geometry } = useMemo(() => {
    const nCols = SEGMENTS;
    const nRows = SEGMENTS;
    const heights: number[] = new Array((nRows + 1) * (nCols + 1));

    // Build the mesh geometry first, then read back its computed heights so
    // the collider matches the visible mesh exactly.
    const geom = new THREE.PlaneGeometry(
      TERRAIN_SIZE,
      TERRAIN_SIZE,
      nCols,
      nRows,
    );
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = terrainHeight(x, z);
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();

    // HeightfieldCollider expects heights[row * (ncols+1) + col].
    // PlaneGeometry vertices are also laid out row-major (z then x).
    for (let r = 0; r <= nRows; r++) {
      for (let c = 0; c <= nCols; c++) {
        const idx = r * (nCols + 1) + c;
        heights[idx] = pos.getY(idx);
      }
    }

    return { heights, geometry: geom };
  }, []);

  return (
    <RigidBody type="fixed" colliders={false}>
      {/* HeightfieldCollider args: (nrows, ncols, heights, scale)
          scale.x / scale.z are the full size of the heightfield in world units;
          scale.y is a multiplier on the height values (we already baked the
          true heights in so use 1). */}
      <HeightfieldCollider
        args={[
          SEGMENTS,
          SEGMENTS,
          heights,
          { x: TERRAIN_SIZE, y: 1, z: TERRAIN_SIZE },
        ]}
      />
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial
          color="#5e8a7a"
          roughness={1}
          metalness={0}
          flatShading={false}
        />
      </mesh>
    </RigidBody>
  );
}
