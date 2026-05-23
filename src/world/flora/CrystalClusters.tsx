import { useMemo } from 'react';
import * as THREE from 'three';
import { scatter, mulberry32 } from './scatter';

const CLUSTER_COUNT = 8;
const SHARDS_PER_CLUSTER = 4;

// Pink-magenta crystal shards as occasional accents.
export function CrystalClusters() {
  const clusters = useMemo(
    () =>
      scatter({
        seed: 7777,
        count: CLUSTER_COUNT,
        radius: 70,
        minRadius: 14,
        scaleMin: 0.9,
        scaleMax: 1.5,
        avoidOrigin: 9,
      }),
    [],
  );

  const shardGeom = useMemo(() => {
    const g = new THREE.ConeGeometry(0.25, 1.4, 5, 1);
    return g;
  }, []);
  const shardMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d8a0c4',
        emissive: '#a04a85',
        emissiveIntensity: 1.1,
        roughness: 0.25,
        metalness: 0.1,
        flatShading: true,
        transparent: true,
        opacity: 0.92,
      }),
    [],
  );

  return (
    <group>
      {clusters.map((c, ci) => {
        const r = mulberry32(ci * 313 + 29);
        return (
          <group
            key={ci}
            position={[c.x, c.y, c.z]}
            rotation={[0, c.rotY, 0]}
            scale={c.scale}
          >
            {Array.from({ length: SHARDS_PER_CLUSTER }).map((_, si) => {
              const dx = (r() - 0.5) * 1.0;
              const dz = (r() - 0.5) * 1.0;
              const tiltX = (r() - 0.5) * 0.6;
              const tiltZ = (r() - 0.5) * 0.6;
              const rotY = r() * Math.PI * 2;
              const s = 0.7 + r() * 0.7;
              return (
                <mesh
                  key={si}
                  geometry={shardGeom}
                  material={shardMat}
                  position={[dx, 0.55 * s, dz]}
                  rotation={[tiltX, rotY, tiltZ]}
                  scale={s}
                  castShadow
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
