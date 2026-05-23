import { Sky } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function World() {
  return (
    <>
      <Sky sunPosition={[100, 20, 100]} turbidity={6} rayleigh={1} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[10, 20, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Ground: thin invisible collider + visible plane */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[100, 0.1, 100]} position={[0, -0.1, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#5b8a4a" />
        </mesh>
      </RigidBody>

      {/* Placeholder landmark so you can see something while walking */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1, -4]} castShadow>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#d97757" />
        </mesh>
      </RigidBody>
    </>
  );
}
