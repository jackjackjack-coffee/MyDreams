import { Sparkles } from '@react-three/drei';

// Bioluminescent ground sparkle — the secret-sauce detail. Scattered cyan light
// points through the grass at knee height.
export function GroundSparkle() {
  return (
    <>
      <Sparkles
        count={200}
        scale={[120, 1.2, 120]}
        position={[0, 0.4, 0]}
        size={2.5}
        speed={0.25}
        color="#6dd5d8"
        opacity={0.8}
        noise={0.4}
      />
      {/* A small handful of brighter, slower drifting motes for variety */}
      <Sparkles
        count={40}
        scale={[80, 3, 80]}
        position={[0, 1.5, 0]}
        size={3.5}
        speed={0.15}
        color="#a8c5e0"
        opacity={0.6}
      />
    </>
  );
}
