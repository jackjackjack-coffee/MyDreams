import { useMemo } from 'react';
import * as THREE from 'three';
import { Outlines } from '@react-three/drei';
import { scatter } from './scatter';
import { makeToonGradient } from '../toonGradient';
import { makeRockTexture } from '../textures';

const OUTLINE = '#1a1530';

// Fewer, larger, hand-hewn standing stones. Tall pentagonal prisms feel
// more deliberate than dodecahedron blobs.
export function StandingStones() {
  const clusters = useMemo(
    () => scatter({ count: 5, seed: 47, innerR: 18, outerR: 62, scaleMin: 1.2, scaleMax: 2.0 }),
    [],
  );

  const gradientMap = useMemo(() => makeToonGradient(), []);

  // Pentagonal prism — 5 sides, tall, slight taper toward top.
  const stoneGeom = useMemo(() => new THREE.CylinderGeometry(0.5, 0.7, 3.5, 5), []);

  const stoneMat = useMemo(() => {
    // Same mottled canvas doubles as color map and bump so the twilight
    // light catches faint relief on the faces.
    const rock = makeRockTexture(1.4, 1.8);
    const mat = new THREE.MeshToonMaterial({
      color: '#5b6680',
      gradientMap,
      map: rock,
      bumpMap: rock,
      bumpScale: 0.6,
    });
    return mat;
  }, [gradientMap]);

  return (
    <group>
      {clusters.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} rotation={[0, c.rot, 0]} scale={c.scale}>
          {[0, 1, 2].map((j) => {
            const a = (j / 3) * Math.PI * 2 + i;
            const r = 2.0;
            const h = 1.0 + (j % 3) * 0.35;
            return (
              <mesh
                key={j}
                geometry={stoneGeom}
                material={stoneMat}
                position={[Math.cos(a) * r, (3.5 * h) / 2, Math.sin(a) * r]}
                scale={[1, h, 1]}
                rotation={[0, j * 0.7 + i * 0.3, (j % 2 === 0 ? 0.06 : -0.06)]}
                castShadow
                receiveShadow
              >
                <Outlines thickness={0.025} color={OUTLINE} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}
