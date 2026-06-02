import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Animated, additive-blended ribbons drifting across the upper sky.
const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  // Cheap value noise.
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    float t = uTime * 0.04;
    float n = noise(vec2(vUv.x * 3.5 + t, vUv.y * 1.5 - t * 0.6));
    n += 0.5 * noise(vec2(vUv.x * 7.0 - t, vUv.y * 3.0));

    // Vertical band falloff — ribbon, not full curtain.
    float band = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
    // Horizontal feather so edges of the plane don't show.
    float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);

    float a = n * band * edge;
    a = pow(a, 2.0) * 0.9;

    vec3 col = mix(uColorB, uColorA, n);
    gl_FragColor = vec4(col, a);
  }
`;

function Ribbon({
  position,
  rotation,
  scale,
  colorA,
  colorB,
  speed = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  colorA: string;
  colorB: string;
  speed?: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color(colorA) },
          uColorB: { value: new THREE.Color(colorB) },
        },
      }),
    [colorA, colorB],
  );

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime * speed;
  });

  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      material={material}
      ref={matRef as never}
      renderOrder={-50}
    >
      <planeGeometry args={[1, 1, 1, 1]} />
    </mesh>
  );
}

export function Aurora() {
  return (
    <group>
      <Ribbon
        position={[0, 120, -250]}
        rotation={[0.15, 0, -0.1]}
        scale={[420, 110, 1]}
        colorA="#6dd5d8"
        colorB="#e8c279"
        speed={1}
      />
      <Ribbon
        position={[-60, 160, -220]}
        rotation={[0.1, 0, 0.25]}
        scale={[340, 80, 1]}
        colorA="#a8c5e0"
        colorB="#d8a0c4"
        speed={0.6}
      />
      <Ribbon
        position={[80, 100, -280]}
        rotation={[0.2, 0, -0.3]}
        scale={[280, 70, 1]}
        colorA="#6dd5d8"
        colorB="#a8c5e0"
        speed={0.8}
      />
    </group>
  );
}
