import { useMemo } from 'react';
import { Sparkles, Cloud, Clouds } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { terrainHeight } from '../terrain/Terrain';

const POSITION: [number, number, number] = [-35, 0, -55];
const TRUNK_HEIGHT = 90;
const TRUNK_RADIUS_BOTTOM = 2.4;
const TRUNK_RADIUS_TOP = 0.9;

export function MotherTree() {
  const ground = terrainHeight(POSITION[0], POSITION[2]);

  // Trunk geometry: tapered cylinder, slight curve via a small vertical lerp.
  const trunkGeom = useMemo(() => {
    const g = new THREE.CylinderGeometry(
      TRUNK_RADIUS_TOP,
      TRUNK_RADIUS_BOTTOM,
      TRUNK_HEIGHT,
      18,
      8,
      true,
    );
    g.translate(0, TRUNK_HEIGHT / 2, 0);
    return g;
  }, []);

  // Canopy: a few overlapping spheres fading upward — gives the
  // "lost in low clouds" look without textures.
  const canopyLayers = useMemo(
    () => [
      { y: TRUNK_HEIGHT - 8, r: 10, opacity: 0.95, color: '#5b6f96' },
      { y: TRUNK_HEIGHT - 2, r: 13, opacity: 0.85, color: '#6a82a8' },
      { y: TRUNK_HEIGHT + 5, r: 16, opacity: 0.6, color: '#8aa0c4' },
      { y: TRUNK_HEIGHT + 12, r: 19, opacity: 0.35, color: '#b1c4de' },
      { y: TRUNK_HEIGHT + 20, r: 22, opacity: 0.15, color: '#cfd9ea' },
    ],
    [],
  );

  return (
    <group position={[POSITION[0], ground, POSITION[2]]}>
      {/* Trunk — collidable */}
      <RigidBody type="fixed" colliders={false}>
        <CapsuleCollider
          args={[TRUNK_HEIGHT / 2 - 1, TRUNK_RADIUS_BOTTOM]}
          position={[0, TRUNK_HEIGHT / 2, 0]}
        />
        <mesh geometry={trunkGeom} castShadow receiveShadow>
          <meshStandardMaterial
            color="#3f4a66"
            roughness={1}
            metalness={0}
            flatShading
          />
        </mesh>
      </RigidBody>

      {/* Canopy layers fading into the sky */}
      {canopyLayers.map((l, i) => (
        <mesh key={i} position={[0, l.y, 0]}>
          <sphereGeometry args={[l.r, 18, 14]} />
          <meshStandardMaterial
            color={l.color}
            transparent
            opacity={l.opacity}
            depthWrite={false}
            roughness={1}
            flatShading
          />
        </mesh>
      ))}

      {/* Low clouds wrapping the top of the canopy — the "lost in clouds" feel */}
      <Clouds material={THREE.MeshLambertMaterial} limit={50}>
        <Cloud
          seed={1}
          segments={28}
          bounds={[20, 6, 20]}
          volume={14}
          color="#cfd9ea"
          opacity={0.55}
          speed={0.05}
          position={[0, TRUNK_HEIGHT + 8, 0]}
        />
        <Cloud
          seed={5}
          segments={20}
          bounds={[18, 5, 18]}
          volume={11}
          color="#b1c4de"
          opacity={0.4}
          speed={0.04}
          position={[4, TRUNK_HEIGHT + 18, -3]}
        />
      </Clouds>

      {/* Blue motes drifting up from the base */}
      <Sparkles
        count={120}
        scale={[8, 30, 8]}
        position={[0, 12, 0]}
        size={4}
        speed={0.25}
        opacity={0.9}
        color="#6dd5d8"
      />
      <Sparkles
        count={40}
        scale={[4, 14, 4]}
        position={[0, 4, 0]}
        size={6}
        speed={0.15}
        opacity={1}
        color="#a8e5e8"
      />
    </group>
  );
}
