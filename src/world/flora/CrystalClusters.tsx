import { useMemo } from 'react';
import * as THREE from 'three';
import { scatter } from './scatter';

// Pink crystal clusters as occasional accents.
export function CrystalClusters() {
  const clusters = useMemo(
    () => scatter({ count: 14, seed: 71, innerR: 10, outerR: 55, scaleMin: 0.8, scaleMax: 1.5 }),
    [],
  );

  const crystalGeom = useMemo(() => new THREE.ConeGeometry(0.18, 1.1, 5), []);
  const crystalMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#e8a8d0',
        emissive: '#c860a0',
        emissiveIntensity: 0.5,
        roughness: 0.04,
        metalness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        envMapIntensity: 2.2,
        flatShading: true,
      }),
    [],
  );

  return (
    <group>
      {clusters.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} rotation={[0, c.rot, 0]} scale={c.scale}>
          {[0, 1, 2, 3, 4].map((j) => {
            const a = (j / 5) * Math.PI * 2;
            const r = 0.25 + (j % 2) * 0.15;
            const tilt = (j % 3 === 0 ? 0.25 : -0.18);
            const s = 0.7 + (j % 3) * 0.25;
            return (
              <mesh
                key={j}
                geometry={crystalGeom}
                material={crystalMat}
                position={[Math.cos(a) * r, 0.5 * s, Math.sin(a) * r]}
                rotation={[tilt, j, j * 0.3]}
                scale={s}
                castShadow
              />
            );
          })}
        </group>
      ))}
    </group>
  );
}
