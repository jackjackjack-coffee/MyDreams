import { useMemo } from 'react';
import * as THREE from 'three';
import { scatter } from './scatter';

// Crystalline pink-magenta mushrooms in clusters.
export function Mushrooms() {
  const clusters = useMemo(
    () => scatter({ count: 14, seed: 23, innerR: 7, outerR: 55, scaleMin: 0.7, scaleMax: 1.3 }),
    [],
  );

  const stemGeom = useMemo(() => new THREE.CylinderGeometry(0.12, 0.18, 0.6, 6), []);
  const capGeom = useMemo(() => new THREE.IcosahedronGeometry(0.45, 0), []);

  const stemMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e9d6e0',
        roughness: 0.7,
        flatShading: true,
      }),
    [],
  );

  const capMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d8a0c4',
        emissive: '#a04a7a',
        emissiveIntensity: 0.6,
        roughness: 0.4,
        flatShading: true,
      }),
    [],
  );

  return (
    <group>
      {clusters.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} rotation={[0, c.rot, 0]} scale={c.scale}>
          {[0, 1, 2, 3].map((j) => {
            const a = (j / 4) * Math.PI * 2 + (i % 5) * 0.4;
            const r = 0.4 + (j % 2) * 0.3;
            const s = 0.6 + ((i + j) % 3) * 0.25;
            return (
              <group key={j} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} scale={s}>
                <mesh geometry={stemGeom} material={stemMat} position={[0, 0.3, 0]} castShadow />
                <mesh geometry={capGeom} material={capMat} position={[0, 0.65, 0]} castShadow />
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}
