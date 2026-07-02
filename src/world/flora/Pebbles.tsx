import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { scatter } from './scatter';
import { makeToonGradient } from '../toonGradient';
import { makeRockTexture } from '../textures';

const COUNT = 120;

// Small scattered rocks — cheap ground clutter that breaks up the bare terrain
// so it reads as a real place rather than an empty lawn. One instanced draw.
export function Pebbles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const gradientMap = useMemo(() => makeToonGradient(), []);

  // IcosahedronGeometry is already non-indexed with per-face normals, so it
  // reads as faceted stone out of the box (MeshToon has no flatShading flag).
  const geom = useMemo(() => new THREE.IcosahedronGeometry(0.22, 0), []);
  const material = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: '#6b7284',
        gradientMap,
        map: makeRockTexture(2, 2),
      }),
    [gradientMap],
  );

  const points = useMemo(
    () => scatter({ count: COUNT, seed: 90, innerR: 4, outerR: 65, scaleMin: 0.4, scaleMax: 1.6 }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    points.forEach((p, i) => {
      // Sink each rock slightly into the ground and squash it so it sits flat.
      dummy.position.set(p.x, p.y - 0.05 * p.scale, p.z);
      dummy.rotation.set(p.rot, p.rot * 1.7, p.rot * 0.5);
      dummy.scale.set(p.scale, p.scale * 0.6, p.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [points]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geom, material, COUNT]}
      castShadow
      receiveShadow
    />
  );
}
