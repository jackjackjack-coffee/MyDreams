import { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { scatter, mulberry32 } from './scatter';

const CLUSTER_COUNT = 6;
const PER_CLUSTER = 4;

// Mossy weathered standing stones in small clusters. Collidable so they
// feel solid when the player bumps into them.
export function StandingStones() {
  const clusters = useMemo(
    () =>
      scatter({
        seed: 9001,
        count: CLUSTER_COUNT,
        radius: 60,
        minRadius: 12,
        scaleMin: 1,
        scaleMax: 1.4,
        avoidOrigin: 10,
      }),
    [],
  );

  const stoneGeom = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
  const stoneMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#6d7790',
        roughness: 1,
        flatShading: true,
      }),
    [],
  );
  const mossMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#5e8a7a',
        roughness: 1,
        flatShading: true,
        transparent: true,
        opacity: 0.6,
      }),
    [],
  );

  return (
    <group>
      {clusters.map((c, ci) => {
        const r = mulberry32(ci * 661 + 19);
        return (
          <group
            key={ci}
            position={[c.x, c.y, c.z]}
            rotation={[0, c.rotY, 0]}
            scale={c.scale}
          >
            {Array.from({ length: PER_CLUSTER }).map((_, si) => {
              const dx = (r() - 0.5) * 4;
              const dz = (r() - 0.5) * 4;
              const sy = 1.4 + r() * 1.8;
              const sx = 0.5 + r() * 0.4;
              const sz = 0.5 + r() * 0.4;
              const rot = r() * Math.PI * 2;
              return (
                <RigidBody
                  key={si}
                  type="fixed"
                  colliders={false}
                  position={[dx, sy * 0.5, dz]}
                  rotation={[0, rot, 0]}
                >
                  <CuboidCollider args={[sx, sy * 0.5, sz]} />
                  <mesh
                    geometry={stoneGeom}
                    material={stoneMat}
                    scale={[sx, sy * 0.5, sz]}
                    castShadow
                    receiveShadow
                  />
                  {/* moss cap blob */}
                  <mesh
                    geometry={stoneGeom}
                    material={mossMat}
                    scale={[sx * 0.7, sy * 0.2, sz * 0.7]}
                    position={[0, sy * 0.4, 0]}
                  />
                </RigidBody>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
