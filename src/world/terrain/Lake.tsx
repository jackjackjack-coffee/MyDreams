import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial, Sparkles } from '@react-three/drei';
import { makeWaterNormalTexture } from '../textures';

// A shallow reflective pool between spawn and the Mother Tree.
// The flat plane sits slightly below ground level — where the terrain
// dips lower than the lake surface you see water; where it rises above,
// the terrain hides it, giving a natural pond-in-a-hollow feel.
export function Lake() {
  // Procedural ripple normals: scrolling the texture offset makes the
  // twilight highlights crawl across the surface like slow-moving water.
  // The same texture feeds `distortionMap` so the mirror image wavers.
  const ripples = useMemo(() => makeWaterNormalTexture(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    ripples.offset.set(t * 0.012, t * 0.019);
  });

  return (
    <group position={[-22, -0.55, -38]}>
      {/* Water surface — real-time reflection of the sky + scene */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 20]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={512}
          mirror={0.9}
          mixBlur={0.88}
          mixStrength={1.6}
          roughness={0.75}
          depthScale={1.0}
          minDepthThreshold={0.25}
          maxDepthThreshold={1.5}
          color="#14213d"
          metalness={0.75}
          normalMap={ripples}
          normalScale={new THREE.Vector2(0.35, 0.35)}
          distortionMap={ripples}
          distortion={0.22}
        />
      </mesh>

      {/* Knee-height mist drifting off the water surface */}
      <Sparkles
        count={28}
        scale={[26, 1.8, 20]}
        position={[0, 0.35, 0]}
        size={28}
        speed={0.035}
        color="#a8c5e0"
        opacity={0.12}
        noise={1.2}
      />
    </group>
  );
}
