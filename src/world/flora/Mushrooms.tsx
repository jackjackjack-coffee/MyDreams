import { useMemo } from 'react';
import * as THREE from 'three';
import { Outlines } from '@react-three/drei';
import { scatter } from './scatter';
import { makeToonGradient } from '../toonGradient';

const OUTLINE = '#1a1530';

// Crystalline pink-magenta mushrooms in clusters — dome caps with stem inset.
export function Mushrooms() {
  const clusters = useMemo(
    () => scatter({ count: 10, seed: 23, innerR: 7, outerR: 55, scaleMin: 0.7, scaleMax: 1.3 }),
    [],
  );

  const gradientMap = useMemo(() => makeToonGradient(), []);

  const stemGeom = useMemo(() => new THREE.CylinderGeometry(0.12, 0.18, 0.55, 6), []);

  // Cap: partial sphere — ~104° arc (slightly more than hemisphere) for a soft dome.
  const capGeom = useMemo(
    () => new THREE.SphereGeometry(0.42, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.58),
    [],
  );

  // Brim: thin disc, slightly wider than stem top, sits right where stem meets cap.
  const brimGeom = useMemo(() => new THREE.CylinderGeometry(0.18, 0.18, 0.03, 8), []);

  const stemMat = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: '#e9d6e0',
        gradientMap,
      }),
    [gradientMap],
  );

  const capMat = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: '#d8a0c4',
        emissive: '#a04a7a',
        emissiveIntensity: 0.6,
        gradientMap,
      }),
    [gradientMap],
  );

  const brimMat = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: '#c890b4',
        gradientMap,
      }),
    [gradientMap],
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
                <mesh geometry={stemGeom} material={stemMat} position={[0, 0.275, 0]} castShadow />
                <mesh geometry={brimGeom} material={brimMat} position={[0, 0.55, 0]} castShadow />
                <mesh
                  geometry={capGeom}
                  material={capMat}
                  position={[0, 0.55, 0]}
                  castShadow
                >
                  <Outlines thickness={0.02} color={OUTLINE} />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}
