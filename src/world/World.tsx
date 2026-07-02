import { Environment, Lightformer } from '@react-three/drei';
import { Sky } from './sky/Sky';
import { Terrain } from './terrain/Terrain';
import { Lake } from './terrain/Lake';
import { MotherTree } from './landmarks/MotherTree';
import { FloatingIslands } from './landmarks/FloatingIslands';
import { FarLight } from './landmarks/FarLight';
import { Grass } from './flora/Grass';
import { Pebbles } from './flora/Pebbles';
import { WishingFlowers } from './flora/WishingFlowers';
import { Mushrooms } from './flora/Mushrooms';
import { StandingStones } from './flora/StandingStones';
import { CrystalClusters } from './flora/CrystalClusters';
import { GroundSparkle } from './flora/GroundSparkle';
import { FloatingFireflies } from './flora/FloatingFireflies';
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

      {/*
        Image-based lighting, generated entirely in-engine from coloured
        Lightformer panels — no external HDR file to fetch (the CDN preset
        would take the whole world down if it failed to load, and code-drawn
        light fits the project's "everything is code" rule). This gives glassy
        crystals and the lake soft twilight reflections. background=false keeps
        our custom sky dome.
      */}
      <Environment resolution={256} background={false}>
        <Lightformer
          intensity={1.3}
          color="#e8c279"
          position={[0, 3, -12]}
          scale={[24, 5, 1]}
        />
        <Lightformer
          intensity={0.9}
          color="#cf8a8a"
          position={[-12, 3, 6]}
          scale={[16, 6, 1]}
        />
        <Lightformer
          intensity={0.5}
          color="#a8c5e0"
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 12, 0]}
          scale={[24, 24, 1]}
        />
        <Lightformer
          intensity={0.4}
          color="#3a3358"
          position={[0, 4, 12]}
          scale={[24, 8, 1]}
        />
      </Environment>

      <Sky />

      <Terrain />
      <Lake />
      <Grass />
      <Pebbles />

      <MotherTree />
      <FloatingIslands />
      <FarLight />

      <WishingFlowers />
      <Mushrooms />
      <StandingStones />
      <CrystalClusters />
      <GroundSparkle />
      <FloatingFireflies />

      <Dreams onSelect={onSelectDream} />
    </>
  );
}
