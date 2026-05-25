import { useMemo } from 'react';
import * as THREE from 'three';
import { scatter } from './scatter';

// Mossy weathered standing stones in small clusters.
export function StandingStones() {
  const clusters = useMemo(
    () => scatter({ count: 5, seed: 47, innerR: 14, outerR: 60, scaleMin: 0.9, scaleMax: 1.4 }),
    [],
  );

  const stoneGeom = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
  const stoneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#5b6680',
        roughness: 1,
        flatShading: true,
      }),
    [],
  );

  return (
    <group>
      {clusters.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} rotation={[0, c.rot, 0]} scale={c.scale}>
          {[0, 1, 2, 3].map((j) => {
            const a = (j / 4) * Math.PI * 2 + i;
            const r = 1.4;
            const h = 1.2 + (j % 3) * 0.4;
            return (
              <mesh
                key={j}
                geometry={stoneGeom}
                material={stoneMat}
                position={[Math.cos(a) * r, h / 2, Math.sin(a) * r]}
                scale={[0.7, h, 0.7]}
                rotation={[0, j * 0.4, (j % 2 === 0 ? 0.05 : -0.05)]}
                castShadow
                receiveShadow
              />
            );
          })}
        </group>
      ))}
    </group>
  );
}
