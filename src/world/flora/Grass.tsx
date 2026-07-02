import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { terrainHeight } from '../terrain/heightmap';

// Deterministic RNG so the meadow is identical every reload.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COUNT = 9000;
const FIELD = 120; // blades spread across a FIELD × FIELD square around origin
const BLADE_H = 0.55;

// A dense meadow of instanced blades — one draw call for the whole field.
// Wind is applied on the GPU in a tiny vertex-shader patch so the CPU cost is
// just the single time-uniform update below.
export function Grass() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef({ value: 0 });

  // A thin blade: a plane taller than it is wide, base sitting on the ground.
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.07, BLADE_H, 1, 3);
    g.translate(0, BLADE_H / 2, 0); // pivot at the root, not the centre

    // Vertex colours: darker at the root, silver-tipped sage at the crown —
    // matches the "silver-tipped grass" note in the visual brief.
    const root = new THREE.Color('#3f6a5d');
    const tip = new THREE.Color('#9ec9b4');
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const h = THREE.MathUtils.clamp(pos.getY(i) / BLADE_H, 0, 1);
      const c = root.clone().lerp(tip, h);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    // Inject wind: sway grows with height up the blade (roots stay planted),
    // and each blade gets a phase from its world position so they ripple
    // rather than all leaning together.
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = timeRef.current;
      shader.vertexShader =
        'uniform float uTime;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           float heightFrac = position.y / ${BLADE_H.toFixed(3)};
           vec3 instPos = vec3(instanceMatrix[3].x, instanceMatrix[3].y, instanceMatrix[3].z);
           float phase = instPos.x * 0.5 + instPos.z * 0.5;
           float swayX = sin(uTime * 1.5 + phase) * 0.14 * heightFrac;
           float swayZ = cos(uTime * 0.9 + phase * 1.3) * 0.08 * heightFrac;
           transformed.x += swayX;
           transformed.z += swayZ;`,
        );
    };
    return mat;
  }, []);

  // Place every blade once, after the mesh has mounted.
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const rand = mulberry32(1337);
    const dummy = new THREE.Object3D();
    const half = FIELD / 2;
    let placed = 0;
    for (let i = 0; i < COUNT; i++) {
      const x = (rand() - 0.5) * FIELD;
      const z = (rand() - 0.5) * FIELD;
      // Leave the immediate spawn circle a little clearer.
      if (Math.hypot(x, z) < 2.5) continue;
      // Thin blades out toward the edges so the field fades into fog.
      if (Math.hypot(x, z) > half && rand() > 0.4) continue;

      dummy.position.set(x, terrainHeight(x, z), z);
      dummy.rotation.y = rand() * Math.PI;
      const s = 0.7 + rand() * 0.9;
      dummy.scale.set(0.8 + rand() * 0.5, s, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(placed, dummy.matrix);
      placed++;
    }
    mesh.count = placed;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false; // field is centred on the player's whole range
  }, []);

  useFrame(({ clock }) => {
    timeRef.current.value = clock.elapsedTime;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geom, material, COUNT]}
      receiveShadow
    />
  );
}
