import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { scatter } from './scatter';

const COUNT = 36;

// Tall stems with bioluminescent bloom-orbs. One shared Sparkles instance covers
// all flowers (per-flower particle systems and point lights were the biggest
// frame-rate cost on machines without a GPU).
export function WishingFlowers() {
  const points = useMemo(() => scatter({ count: COUNT, seed: 11, innerR: 8, outerR: 60 }), []);
  const flowerRefs = useRef<(THREE.Group | null)[]>([]);

  const stemGeom = useMemo(() => new THREE.CylinderGeometry(0.04, 0.06, 1, 5), []);
  const bloomGeom = useMemo(() => new THREE.SphereGeometry(0.18, 12, 10), []);

  const stemMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#3f6a5d', roughness: 1 }),
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

  // Gentle wind sway — each flower gets a unique phase so they don't all move together.
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    flowerRefs.current.forEach((ref, i) => {
      if (!ref) return;
      ref.rotation.z = Math.sin(t * 0.55 + i * 1.13) * 0.08;
      ref.rotation.x = Math.cos(t * 0.42 + i * 0.87) * 0.05;
    });
  });

  return (
    <group>
      {points.map((p, i) => {
        const stemH = 0.9 + (i % 3) * 0.25;
        return (
          <group
            key={i}
            ref={(el) => { flowerRefs.current[i] = el; }}
            position={[p.x, p.y, p.z]}
            rotation={[0, p.rot, 0]}
            scale={p.scale}
          >
            <mesh geometry={stemGeom} material={stemMat} position={[0, stemH / 2, 0]} scale={[1, stemH, 1]} />
            <mesh geometry={bloomGeom} material={bloomMat} position={[0, stemH, 0]} />
          </group>
        );
      })}

      {/* Shared particle layer covering the whole flower field */}
      <Sparkles
        count={140}
        scale={[120, 2, 120]}
        position={[0, 1.2, 0]}
        size={2.5}
        speed={0.35}
        color="#6dd5d8"
        opacity={0.8}
        noise={1.5}
      />
    </group>
  );
}
