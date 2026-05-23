import * as THREE from 'three';

// Mountain silhouette far away, with a single warm light point on it.
// Purely visual — no collider, you can never reach it.

const MOUNTAIN_POS: [number, number, number] = [120, 0, -260];

export function FarLight() {
  return (
    <group position={MOUNTAIN_POS}>
      {/* Mountain: tall cone, dark blue-violet */}
      <mesh position={[0, 35, 0]}>
        <coneGeometry args={[55, 70, 7, 1]} />
        <meshStandardMaterial color="#3a3358" roughness={1} flatShading />
      </mesh>
      {/* Secondary smaller peak behind */}
      <mesh position={[-30, 25, -25]}>
        <coneGeometry args={[35, 55, 6, 1]} />
        <meshStandardMaterial color="#322e4f" roughness={1} flatShading />
      </mesh>

      {/* The Far Light: a tiny warm point near the summit */}
      <group position={[2, 58, 2]}>
        <mesh>
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshBasicMaterial color="#ffd99a" toneMapped={false} />
        </mesh>
        {/* halo */}
        <sprite scale={[6, 6, 1]}>
          <spriteMaterial
            color="#e8c279"
            transparent
            opacity={0.6}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
        <pointLight color="#ffd99a" intensity={2} distance={20} />
      </group>
    </group>
  );
}
