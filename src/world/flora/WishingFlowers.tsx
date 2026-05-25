import { useMemo } from 'react';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { scatter } from './scatter';

const COUNT = 36;

// Tall stems with bioluminescent bloom-orbs that release cyan motes.
// Visually distinct from dream markers (those come in step 5 with brighter,
// pulsing orbs and color-coded glow).
export function WishingFlowers() {
  const points = useMemo(() => scatter({ count: COUNT, seed: 11, innerR: 8, outerR: 60 }), []);

  const stemGeom = useMemo(() => new THREE.CylinderGeometry(0.04, 0.06, 1, 5), []);
  const bloomGeom = useMemo(() => new THREE.SphereGeometry(0.18, 12, 10), []);

  const stemMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3f6a5d',
        roughness: 1,
      }),
    [],
  );

  const bloomMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#6dd5d8',
        emissive: '#6dd5d8',
        emissiveIntensity: 2.5,
        toneMapped: false,
      }),
    [],
  );

  return (
    <group>
      {points.map((p, i) => {
        const stemH = 0.9 + (i % 3) * 0.25;
        return (
          <group key={i} position={[p.x, p.y, p.z]} rotation={[0, p.rot, 0]} scale={p.scale}>
            <mesh geometry={stemGeom} material={stemMat} position={[0, stemH / 2, 0]} scale={[1, stemH, 1]} />
            <mesh geometry={bloomGeom} material={bloomMat} position={[0, stemH, 0]} />
            <pointLight color="#6dd5d8" intensity={0.4} distance={3} decay={2} position={[0, stemH, 0]} />
            <Sparkles
              count={6}
              scale={[0.6, 1.2, 0.6]}
              position={[0, stemH + 0.4, 0]}
              size={2}
              speed={0.4}
              color="#6dd5d8"
              opacity={0.8}
            />
          </group>
        );
      })}
    </group>
  );
}
