import { useMemo } from 'react';
import * as THREE from 'three';

// Lavender-rose horizon to indigo zenith. Painted onto the inside of a large sphere.
const vert = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const frag = /* glsl */ `
  varying vec3 vWorldPos;
  uniform vec3 uZenith;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uHorizonGlow;

  void main() {
    vec3 dir = normalize(vWorldPos);
    float h = clamp(dir.y, -0.1, 1.0);

    // Three-stop gradient with a warm horizon kiss.
    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.45, h));
    col = mix(col, uZenith, smoothstep(0.35, 0.95, h));

    // Rosy glow concentrated at the horizon band.
    float glow = pow(1.0 - clamp(h * 1.8, 0.0, 1.0), 3.0);
    col += uHorizonGlow * glow * 0.6;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uZenith: { value: new THREE.Color('#2a2547') },
          uMid: { value: new THREE.Color('#7a5e94') },
          uHorizon: { value: new THREE.Color('#cf8a8a') },
          uHorizonGlow: { value: new THREE.Color('#e8a89a') },
        },
      }),
    [],
  );

  return (
    <mesh material={material} renderOrder={-100}>
      <sphereGeometry args={[450, 32, 32]} />
    </mesh>
  );
}
