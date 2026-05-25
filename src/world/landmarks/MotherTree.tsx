import { useMemo } from 'react';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';

const TRUNK_HEIGHT = 90;
const TRUNK_BASE_R = 4.5;
const TRUNK_TOP_R = 1.5;

// Tall slate-blue trunk that fades into low clouds; bioluminescent motes drift upward from its base.
export function MotherTree({ position = [-35, 0, -55] as [number, number, number] }) {
  const trunkGeom = useMemo(
    () => new THREE.CylinderGeometry(TRUNK_TOP_R, TRUNK_BASE_R, TRUNK_HEIGHT, 12, 4, false),
    [],
  );

  const canopyMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#4b5d7e',
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      }),
    [],
  );

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh geometry={trunkGeom} position={[0, TRUNK_HEIGHT / 2, 0]} castShadow>
        <meshStandardMaterial
          color="#3d4a66"
          roughness={1}
          metalness={0}
          flatShading
        />
      </mesh>

      {/* Canopy: stacked soft blobs fading upward into the clouds. */}
      {[0, 1, 2, 3, 4].map((i) => {
        const y = TRUNK_HEIGHT + i * 11;
        const r = 26 - i * 2;
        const opacity = 0.55 - i * 0.09;
        return (
          <mesh key={i} position={[0, y, 0]}>
            <sphereGeometry args={[r, 20, 16]} />
            <primitive
              object={canopyMaterial.clone()}
              attach="material"
              opacity={opacity}
            />
          </mesh>
        );
      })}

      {/* Bioluminescent upward motes */}
      <Sparkles
        count={140}
        scale={[14, 80, 14]}
        position={[0, 40, 0]}
        size={5}
        speed={0.35}
        color="#6dd5d8"
        opacity={0.9}
        noise={2}
      />

      {/* Base glow ring */}
      <pointLight
        position={[0, 2, 0]}
        intensity={6}
        color="#6dd5d8"
        distance={28}
        decay={2}
      />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5, 9, 32]} />
        <meshBasicMaterial
          color="#6dd5d8"
          transparent
          opacity={0.35}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
