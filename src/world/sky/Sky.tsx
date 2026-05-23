import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const SKYDOME_RADIUS = 500;

const skyVertex = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const skyFragment = /* glsl */ `
  varying vec3 vWorldPos;
  uniform vec3 uHorizon;
  uniform vec3 uMid;
  uniform vec3 uZenith;
  uniform vec3 uGlow;
  uniform vec3 uGlowDir;

  void main() {
    vec3 dir = normalize(vWorldPos);
    // 0 at horizon, 1 at zenith
    float h = clamp(dir.y * 0.85 + 0.15, 0.0, 1.0);
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.45, h));
    col = mix(col, uZenith, smoothstep(0.35, 1.0, h));

    // soft warm glow toward the moons' direction
    float glow = max(dot(dir, normalize(uGlowDir)), 0.0);
    glow = pow(glow, 4.0) * (1.0 - h * 0.7);
    col += uGlow * glow * 0.35;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function SkyDome() {
  const uniforms = useMemo(
    () => ({
      uHorizon: { value: new THREE.Color('#cf8a8a') }, // rose
      uMid: { value: new THREE.Color('#7a5e94') }, // lavender
      uZenith: { value: new THREE.Color('#2a2547') }, // indigo
      uGlow: { value: new THREE.Color('#e8c279') }, // warm gold
      uGlowDir: { value: new THREE.Vector3(0.6, 0.1, -0.8).normalize() },
    }),
    [],
  );

  return (
    <mesh scale={[-1, 1, 1]} renderOrder={-1}>
      <sphereGeometry args={[SKYDOME_RADIUS, 48, 32]} />
      <shaderMaterial
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}

function Moon({
  position,
  color,
  size,
  glowColor,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  glowColor: string;
}) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* soft halo */}
      <sprite scale={[size * 6, size * 6, 1]}>
        <spriteMaterial
          color={glowColor}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

const auroraVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Cheap watercolor-feel aurora: layered hashed noise that drifts,
// confined to a vertical band so the ribbon shape feels natural.
const auroraFragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;

  // hash + value noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p); p *= 2.0; a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    // band: brightest in the middle of the strip
    float band = smoothstep(0.0, 0.35, uv.y) * (1.0 - smoothstep(0.65, 1.0, uv.y));
    // wavering ribbon
    float n = fbm(vec2(uv.x * 3.0 + uTime * 0.05, uv.y * 1.5 - uTime * 0.02));
    float ribbon = smoothstep(0.4, 0.85, n) * band;
    vec3 col = mix(uColorA, uColorB, n);
    float alpha = ribbon * uIntensity;
    gl_FragColor = vec4(col, alpha);
  }
`;

function AuroraRibbon({
  position,
  rotation,
  scale,
  colorA,
  colorB,
  intensity = 0.55,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
  colorA: string;
  colorB: string;
  intensity?: number;
}) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uIntensity: { value: intensity },
    }),
    [colorA, colorB, intensity],
  );

  useFrame((_, dt) => {
    if (ref.current) {
      (ref.current.uniforms.uTime as { value: number }).value += dt;
    }
  });

  return (
    <mesh position={position} rotation={rotation} renderOrder={-0.5}>
      <planeGeometry args={[scale[0], scale[1], 1, 1]} />
      <shaderMaterial
        ref={ref}
        vertexShader={auroraVertex}
        fragmentShader={auroraFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        side={THREE.DoubleSide}
        fog={false}
      />
    </mesh>
  );
}

export function Sky() {
  return (
    <>
      <SkyDome />

      {/* Stars: sparse, small, low magnitude — a few first ones of evening */}
      <Stars
        radius={SKYDOME_RADIUS * 0.85}
        depth={50}
        count={900}
        factor={3}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Two moons low on the horizon */}
      <Moon
        position={[180, 30, -260]}
        color="#f5d99a"
        size={6}
        glowColor="#e8c279"
      />
      <Moon
        position={[-220, 22, -180]}
        color="#cfdcef"
        size={4.2}
        glowColor="#a8c5e0"
      />

      {/* Aurora ribbons drifting across the upper sky */}
      <AuroraRibbon
        position={[0, 140, -300]}
        rotation={[0, 0, -0.18]}
        scale={[700, 110]}
        colorA="#6dd5d8"
        colorB="#e8c279"
        intensity={0.6}
      />
      <AuroraRibbon
        position={[-40, 180, -260]}
        rotation={[0, 0, 0.22]}
        scale={[600, 80]}
        colorA="#a8c5e0"
        colorB="#6dd5d8"
        intensity={0.4}
      />
    </>
  );
}
