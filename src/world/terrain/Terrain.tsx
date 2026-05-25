import { useMemo } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { terrainHeight } from './heightmap';

const SIZE = 240;
const SEGMENTS = 160;

export function Terrain() {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
    g.rotateX(-Math.PI / 2);

    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const cBase = new THREE.Color('#5e8a7a');
    const cHi = new THREE.Color('#9bc3b0');
    const cLo = new THREE.Color('#3f6a5d');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = terrainHeight(x, z);
      pos.setY(i, y);

      // Vertex colors: subtle variation so flat lighting still reads as painterly.
      const t = THREE.MathUtils.clamp((y + 1.2) / 2.4, 0, 1);
      const c = cBase.clone().lerp(t > 0.5 ? cHi : cLo, Math.abs(t - 0.5) * 1.4);
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <RigidBody type="fixed" colliders="trimesh" friction={0.9}>
      <mesh geometry={geom} receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={1}
          metalness={0}
          flatShading
        />
      </mesh>
    </RigidBody>
  );
}
