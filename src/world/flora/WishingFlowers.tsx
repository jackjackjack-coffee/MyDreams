import { useMemo } from 'react';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { scatter } from './scatter';

const COUNT = 80;
const STEM_HEIGHT = 1.2;
const BLOOM_RADIUS = 0.18;

// Tall stem with a glowing cyan bloom orb. Scattered across the meadow.
// (Real, clickable dream markers come in step 5 — these are atmosphere.)
export function WishingFlowers() {
  const points = useMemo(
    () =>
      scatter({
        seed: 1337,
        count: COUNT,
        radius: 70,
        minRadius: 6,
        scaleMin: 0.7,
        scaleMax: 1.4,
        avoidOrigin: 5,
      }),
    [],
  );

  const stemGeom = useMemo(
    () => new THREE.CylinderGeometry(0.02, 0.04, STEM_HEIGHT, 4),
    [],
  );
  const bloomGeom = useMemo(
    () => new THREE.SphereGeometry(BLOOM_RADIUS, 8, 8),
    [],
  );
  const stemMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3a5e4d',
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
      {points.map((p, i) => (
        <group
          key={i}
          position={[p.x, p.y, p.z]}
          rotation={[0, p.rotY, 0]}
          scale={p.scale}
        >
          <mesh
            geometry={stemGeom}
            material={stemMat}
            position={[0, STEM_HEIGHT / 2, 0]}
          />
          <mesh
            geometry={bloomGeom}
            material={bloomMat}
            position={[0, STEM_HEIGHT + BLOOM_RADIUS * 0.5, 0]}
          />
        </group>
      ))}

      {/* Drifting cyan motes that drift up from the meadow as a whole */}
      <Sparkles
        count={180}
        scale={[140, 6, 140]}
        position={[0, 3, 0]}
        size={2.5}
        speed={0.2}
        opacity={0.6}
        color="#6dd5d8"
      />
    </group>
  );
}
