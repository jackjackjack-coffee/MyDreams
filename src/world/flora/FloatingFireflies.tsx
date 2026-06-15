import { Sparkles } from '@react-three/drei';

// Slow-drifting motes at canopy height — gives the sky a sense of depth and life.
export function FloatingFireflies() {
  return (
    <>
      {/* Cyan motes rising from the mid-canopy zone */}
      <Sparkles
        count={55}
        scale={[110, 18, 110]}
        position={[0, 9, 0]}
        size={2.8}
        speed={0.05}
        color="#6dd5d8"
        opacity={0.65}
        noise={3}
      />
      {/* Sparse gold motes high up near the tree canopy */}
      <Sparkles
        count={30}
        scale={[70, 30, 70]}
        position={[0, 22, 0]}
        size={2.2}
        speed={0.03}
        color="#e8c279"
        opacity={0.5}
        noise={4}
      />
    </>
  );
}
