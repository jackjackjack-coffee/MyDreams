import { useMemo } from 'react';
import * as THREE from 'three';
import { scatter, mulberry32 } from './scatter';

const CLUSTER_COUNT = 14;
const PER_CLUSTER = 5;

// Crystalline pink-magenta mushrooms in small clusters.
// Low-poly octahedron caps with a slight glow.
export function Mushrooms() {
  const clusters = useMemo(
    () =>
      scatter({
        seed: 4242,
        count: CLUSTER_COUNT,
        radius: 80,
        minRadius: 8,
        scaleMin: 0.8,
        scaleMax: 1.3,
        avoidOrigin: 8,
      }),
    [],
  );

  const stemGeom = useMemo(
    () => new THREE.CylinderGeometry(0.08, 0.12, 0.4, 6),
    [],
  );
  const capGeom = useMemo(() => new THREE.OctahedronGeometry(0.3, 0), []);
  const stemMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d4c4b8', roughness: 1 }),
    [],
  );
  const capMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d8a0c4',
        emissive: '#a04a85',
        emissiveIntensity: 0.6,
        roughness: 0.4,
        flatShading: true,
      }),
    [],
  );

  return (
    <group>
      {clusters.map((c, ci) => {
        const r = mulberry32(ci * 991 + 7);
        return (
          <group
            key={ci}
            position={[c.x, c.y, c.z]}
            rotation={[0, c.rotY, 0]}
            scale={c.scale}
          >
            {Array.from({ length: PER_CLUSTER }).map((_, mi) => {
              const dx = (r() - 0.5) * 1.4;
              const dz = (r() - 0.5) * 1.4;
              const s = 0.6 + r() * 0.9;
              const rot = r() * Math.PI * 2;
              return (
                <group
                  key={mi}
                  position={[dx, 0, dz]}
                  rotation={[0, rot, 0]}
                  scale={s}
                >
                  <mesh
                    geometry={stemGeom}
                    material={stemMat}
                    position={[0, 0.2, 0]}
                    castShadow
                  />
                  <mesh
                    geometry={capGeom}
                    material={capMat}
                    position={[0, 0.5, 0]}
                    castShadow
                  />
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
