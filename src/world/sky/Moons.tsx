// Two small moons low on the horizon — one warm gold, one cool silver-blue.
export function Moons() {
  return (
    <group>
      <mesh position={[-180, 35, -380]}>
        <sphereGeometry args={[14, 32, 32]} />
        <meshBasicMaterial color="#e8c279" toneMapped={false} />
      </mesh>
      {/* Soft halo */}
      <mesh position={[-180, 35, -380]}>
        <sphereGeometry args={[18, 32, 32]} />
        <meshBasicMaterial
          color="#e8c279"
          transparent
          opacity={0.18}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[220, 22, -360]}>
        <sphereGeometry args={[9, 32, 32]} />
        <meshBasicMaterial color="#cfdcef" toneMapped={false} />
      </mesh>
      <mesh position={[220, 22, -360]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial
          color="#a8c5e0"
          transparent
          opacity={0.2}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
