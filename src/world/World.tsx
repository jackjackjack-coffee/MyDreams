import { Sparkles } from '@react-three/drei';
import { Sky } from './sky/Sky';
import { Terrain } from './terrain/Terrain';
import { MotherTree } from './landmarks/MotherTree';
import { FloatingIslands } from './landmarks/FloatingIslands';
import { FarLight } from './landmarks/FarLight';
import { WishingFlowers } from './flora/WishingFlowers';
import { Bluebells } from './flora/Bluebells';
import { Mushrooms } from './flora/Mushrooms';
import { StandingStones } from './flora/StandingStones';
import { CrystalClusters } from './flora/CrystalClusters';

export function World() {
  return (
    <>
      {/* Dreamy twilight atmosphere: blue-violet fog hides the edge of the world
          and sets the dusk mood. */}
      <fog attach="fog" args={['#3a3358', 30, 220]} />
      <color attach="background" args={['#3a3358']} />

      <Sky />

      {/* Lighting — soft and cool. The directional light acts like a moon
          glow rather than a sun. */}
      <ambientLight intensity={0.55} color="#a8c5e0" />
      <hemisphereLight
        args={['#cf8a8a', '#3a3358', 0.4]}
      />
      <directionalLight
        position={[80, 60, -40]}
        intensity={0.9}
        color="#f5d99a"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={1}
        shadow-camera-far={200}
      />

      <Terrain />

      <MotherTree />
      <FloatingIslands />
      <FarLight />

      <StandingStones />
      <Mushrooms />
      <CrystalClusters />
      <WishingFlowers />
      <Bluebells />

      {/* Bioluminescent ground sparkle — the "secret sauce" tiny cyan points
          scattered through the grass. Two layers: dense and bright. */}
      <Sparkles
        count={400}
        scale={[160, 1.2, 160]}
        position={[0, 0.4, 0]}
        size={1.5}
        speed={0.05}
        opacity={0.8}
        color="#a8e5e8"
      />
      <Sparkles
        count={160}
        scale={[80, 0.6, 80]}
        position={[0, 0.2, 0]}
        size={2.5}
        speed={0.04}
        opacity={1}
        color="#6dd5d8"
      />
    </>
  );
}
