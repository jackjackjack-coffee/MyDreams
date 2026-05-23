import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scatter } from './scatter';

const COUNT = 140;

// Foreground bluebell-like cyan glow flowers — denser, smaller, closer to
// where the player spawns. Hung downward (bell shape) and pulsing gently.
export function Bluebells() {
  const points = useMemo(
    () =>
      scatter({
        seed: 2024,
        count: COUNT,
        radius: 35, // close to spawn
        minRadius: 3,
        scaleMin: 0.6,
        scaleMax: 1.1,
        avoidOrigin: 2.5,
      }),
    [],
  );

  const stemGeom = useMemo(
    () => new THREE.CylinderGeometry(0.015, 0.025, 0.6, 4),
    [],
  );
  const bellGeom = useMemo(
    () => new THREE.ConeGeometry(0.09, 0.18, 6, 1, true),
    [],
  );
  const stemMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#3a5e4d', roughness: 1 }),
    [],
  );
  const bellMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#a8e5e8',
        emissive: '#6dd5d8',
        emissiveIntensity: 3.5,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  // Gentle global pulse on the emissive — synced across all bells.
  const matRef = useRef(bellMat);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    matRef.current.emissiveIntensity = 3.0 + Math.sin(t * 1.2) * 0.6;
  });

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
            position={[0, 0.3, 0]}
          />
          {/* Bell hangs downward — rotate cone tip-up to point down */}
          <mesh
            geometry={bellGeom}
            material={bellMat}
            position={[0, 0.55, 0]}
            rotation={[Math.PI, 0, 0]}
          />
        </group>
      ))}
    </group>
  );
}
