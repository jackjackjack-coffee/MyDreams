import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type IslandSpec = {
  position: [number, number, number];
  scale: number;
  bobAmp: number;
  bobSpeed: number;
  bobPhase: number;
};

const ISLANDS: IslandSpec[] = [
  { position: [70, 32, -80], scale: 1.2, bobAmp: 0.8, bobSpeed: 0.25, bobPhase: 0 },
  { position: [-90, 40, -120], scale: 1.6, bobAmp: 1.0, bobSpeed: 0.18, bobPhase: 1.7 },
  { position: [40, 50, -180], scale: 0.9, bobAmp: 0.6, bobSpeed: 0.32, bobPhase: 3.2 },
];

function Island({ spec }: { spec: IslandSpec }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y =
      spec.position[1] +
      Math.sin(t * spec.bobSpeed + spec.bobPhase) * spec.bobAmp;
    ref.current.rotation.y = t * 0.02 * spec.bobSpeed;
  });

  return (
    <group ref={ref} position={spec.position} scale={spec.scale}>
      {/* top: green-teal grass dome */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial color="#5e8a7a" roughness={1} flatShading />
      </mesh>
      {/* bottom: rocky hanging underside */}
      <mesh position={[0, -2.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[5.5, 6, 10, 1]} />
        <meshStandardMaterial color="#3f4a66" roughness={1} flatShading />
      </mesh>
      {/* a couple of stones on top */}
      <mesh position={[1.5, 0.6, -0.8]}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#6d7790" roughness={1} flatShading />
      </mesh>
      <mesh position={[-2.2, 0.5, 1.2]}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#6d7790" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

export function FloatingIslands() {
  return (
    <>
      {ISLANDS.map((spec, i) => (
        <Island key={i} spec={spec} />
      ))}
    </>
  );
}
