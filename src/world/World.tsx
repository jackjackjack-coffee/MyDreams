import { Sky } from './sky/Sky';
import { Terrain } from './terrain/Terrain';
import { MotherTree } from './landmarks/MotherTree';
import { FloatingIslands } from './landmarks/FloatingIslands';
import { FarLight } from './landmarks/FarLight';
import { WishingFlowers } from './flora/WishingFlowers';
import { Mushrooms } from './flora/Mushrooms';
import { StandingStones } from './flora/StandingStones';
import { CrystalClusters } from './flora/CrystalClusters';
import { GroundSparkle } from './flora/GroundSparkle';
import { Dreams } from '../dreams/Dreams';
import type { Dream } from '../dreams/types';

type Props = {
  onSelectDream: (dream: Dream) => void;
};

export function World({ onSelectDream }: Props) {
  return (
    <>
      {/* Eternal-twilight atmosphere: deep blue-violet fog hides the world's edge. */}
      <fog attach="fog" args={['#3a3358', 35, 220]} />
      <color attach="background" args={['#2a2547']} />

      {/* Lighting tuned to twilight — cool ambient, warm soft key from the horizon. */}
      <ambientLight intensity={0.55} color="#8a7fb0" />
      <hemisphereLight args={['#cf8a8a', '#3a3358', 0.4]} />
      <directionalLight
        position={[-40, 30, -50]}
        intensity={0.9}
        color="#e8c279"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.0005}
      />

      <Sky />

      <Terrain />

      <MotherTree />
      <FloatingIslands />
      <FarLight />

      <WishingFlowers />
      <Mushrooms />
      <StandingStones />
      <CrystalClusters />
      <GroundSparkle />

      <Dreams onSelect={onSelectDream} />
    </>
  );
}
