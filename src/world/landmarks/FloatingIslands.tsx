import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeToonGradient } from '../toonGradient';

type IslandSpec = {
  position: [number, number, number];
  radius: number;
  phase: number;
};

const ISLANDS: IslandSpec[] = [
  { position: [60, 45, -90], radius: 8, phase: 0 },
  { position: [-80, 55, -120], radius: 11, phase: 1.3 },
  { position: [110, 70, -150], radius: 6, phase: 2.6 },
];

function Island({ spec }: { spec: IslandSpec }) {
  const ref = useRef<THREE.Group>(null);
  const baseY = spec.position[1];
  const gradientMap = useMemo(() => makeToonGradient(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = baseY + Math.sin(clock.elapsedTime * 0.4 + spec.phase) * 0.8;
  });

  return (
    <group ref={ref} position={spec.position}>
      {/* Top grass cap */}
      <mesh castShadow>
        <sphereGeometry args={[spec.radius, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color="#5e8a7a" gradientMap={gradientMap} />
      </mesh>
      {/* Rocky underside — inverted cone-ish */}
      <mesh position={[0, -spec.radius * 0.4, 0]} castShadow>
        <coneGeometry args={[spec.radius * 0.95, spec.radius * 1.5, 8]} />
        <meshToonMaterial color="#3d4a66" gradientMap={gradientMap} />
      </mesh>
    </group>
  );
}

export function FloatingIslands() {
  return (
    <group>
      {ISLANDS.map((s, i) => (
        <Island key={i} spec={s} />
      ))}
    </group>
  );
}
