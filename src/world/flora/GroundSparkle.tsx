import { Sparkles } from '@react-three/drei';

export function GroundSparkle() {
  return (
    <>
      {/* Knee-height bioluminescent grass sparkle */}
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
      {/* Slower silver-blue motes just above ground */}
      <Sparkles
        count={40}
        scale={[80, 3, 80]}
        position={[0, 1.5, 0]}
        size={3.5}
        speed={0.15}
        color="#a8c5e0"
        opacity={0.6}
      />
      {/* Warm firefly layer — drifts slowly at waist-to-chest height */}
      <Sparkles
        count={70}
        scale={[130, 6, 130]}
        position={[0, 2.8, 0]}
        size={3}
        speed={0.07}
        color="#e8c279"
        opacity={0.75}
        noise={2.5}
      />
    </>
  );
}
