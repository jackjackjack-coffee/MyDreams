// Distant mountain peak with a single warm light — "The Far Light," can never be reached.
export function FarLight() {
  return (
    <group position={[0, 0, -300]}>
      {/* Mountain silhouette */}
      <mesh position={[0, 30, 0]}>
        <coneGeometry args={[60, 80, 6]} />
        <meshStandardMaterial color="#3a3358" roughness={1} flatShading />
      </mesh>
      {/* Light at the tip */}
      <mesh position={[0, 72, 1]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial color="#ffd58a" toneMapped={false} />
      </mesh>
      {/* Soft halo around the light */}
      <mesh position={[0, 72, 1]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial
          color="#ffd58a"
          transparent
          opacity={0.25}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
