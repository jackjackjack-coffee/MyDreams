import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';
import { terrainHeight } from '../world/terrain/heightmap';
import { DREAM_COLORS, type Dream } from './types';

type Props = {
  dream: Dream;
  onSelect: (dream: Dream) => void;
};

// A dream marker is part of the flora — a tall wishing-stem with a brighter,
// pulsing, color-coded bloom. Walk up and click to read.
export function DreamMarker({ dream, onSelect }: Props) {
  const color = DREAM_COLORS[dream.kind];
  const y = useMemo(() => terrainHeight(dream.x, dream.z), [dream.x, dream.z]);

  const bloomRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const bloomMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 3,
        toneMapped: false,
      }),
    [color],
  );

  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        toneMapped: false,
      }),
    [color],
  );

  const stemMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3f6a5d',
        roughness: 1,
      }),
    [],
  );

  // Gentle breathing pulse so markers feel alive.
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const seed = dream.id.charCodeAt(0) * 0.13;
    const pulse = 0.92 + Math.sin(t * 1.6 + seed) * 0.08;
    if (bloomRef.current) bloomRef.current.scale.setScalar(pulse);
    if (haloRef.current) haloRef.current.scale.setScalar(pulse * 1.05);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(dream);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = '';
  };

  const stemH = 1.4;

  return (
    <group
      position={[dream.x, y, dream.z]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Stem */}
      <mesh material={stemMat} position={[0, stemH / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.08, stemH, 6]} />
      </mesh>

      {/* Bloom orb */}
      <mesh ref={bloomRef} material={bloomMat} position={[0, stemH, 0]}>
        <sphereGeometry args={[0.26, 16, 14]} />
      </mesh>

      {/* Halo */}
      <mesh ref={haloRef} material={haloMat} position={[0, stemH, 0]}>
        <sphereGeometry args={[0.42, 16, 14]} />
      </mesh>

      {/* Color-matched motes */}
      <Sparkles
        count={10}
        scale={[0.8, 1.6, 0.8]}
        position={[0, stemH + 0.5, 0]}
        size={3}
        speed={0.5}
        color={color}
        opacity={0.95}
      />

      {/* Small local light so the marker spills onto nearby grass */}
      <pointLight color={color} intensity={0.8} distance={4} decay={2} position={[0, stemH, 0]} />
    </group>
  );
}
