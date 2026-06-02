import { useMemo } from 'react';
import * as THREE from 'three';
import { Sparkles, Outlines } from '@react-three/drei';
import { makeToonGradient } from '../toonGradient';

const TRUNK_COLOR = '#3d4a66';
const OUTLINE = '#1a1530';

type BranchSpec = {
  yaw: number;         // rotation around Y in radians
  tilt: number;        // outward lean in radians
  length: number;
  rBase: number;
  rTip: number;
  // Sub-branches: array of {alongFrac, yawOff, tiltOff, length, rBase, rTip}
  subs: { along: number; yawOff: number; tiltOff: number; length: number; rBase: number; rTip: number }[];
};

const BRANCHES: BranchSpec[] = [
  {
    yaw: 0, tilt: -0.55, length: 28, rBase: 2.4, rTip: 1.2,
    subs: [
      { along: 0.65, yawOff: 0.4,  tiltOff: -0.5, length: 14, rBase: 0.9, rTip: 0.5 },
      { along: 0.55, yawOff: -0.5, tiltOff: -0.45, length: 12, rBase: 0.85, rTip: 0.45 },
    ],
  },
  {
    yaw: 2.094, tilt: -0.5, length: 26, rBase: 2.2, rTip: 1.0,
    subs: [
      { along: 0.6, yawOff: 0.5,  tiltOff: -0.5, length: 13, rBase: 0.85, rTip: 0.45 },
      { along: 0.7, yawOff: -0.4, tiltOff: -0.4, length: 11, rBase: 0.8, rTip: 0.4 },
    ],
  },
  {
    yaw: 4.189, tilt: -0.48, length: 26, rBase: 2.2, rTip: 1.0,
    subs: [
      { along: 0.55, yawOff: 0.45, tiltOff: -0.5, length: 14, rBase: 0.9, rTip: 0.5 },
      { along: 0.7,  yawOff: -0.5, tiltOff: -0.4, length: 11, rBase: 0.8, rTip: 0.4 },
    ],
  },
];

const LOWER_TRUNK_HEIGHT = 42;
const FORK_Y = 40;

// Compute the world tip position of a branch given its yaw/tilt/length, starting from the fork.
function branchTip(yaw: number, tilt: number, length: number, originY: number) {
  // tilt is rotation around Z in the branch's local frame (negative tilt = lean outward).
  // After yaw rotation around Y, the local +Y axis maps to:
  //   (sin(-tilt)*cos(yaw), cos(tilt), sin(-tilt)*sin(yaw))  — i.e. lean is outward
  const lean = -tilt; // positive number — how far it leans
  const dx = Math.sin(lean) * Math.cos(yaw);
  const dz = Math.sin(lean) * Math.sin(yaw);
  const dy = Math.cos(lean);
  return {
    x: dx * length,
    y: originY + dy * length,
    z: dz * length,
  };
}

export function MotherTree({ position = [-35, 0, -55] as [number, number, number] }) {
  const gradientMap = useMemo(() => makeToonGradient(), []);

  // One material per opacity level for canopy — cheaper than cloning per mesh.
  const canopyMaterials = useMemo(
    () =>
      [0, 1, 2, 3, 4].map(
        (i) =>
          new THREE.MeshBasicMaterial({
            color: '#4b5d7e',
            transparent: true,
            opacity: 0.55 - i * 0.09,
            depthWrite: false,
          }),
      ),
    [],
  );

  // Position canopy spheres over branch tips + one central column up high
  const canopyPositions = useMemo(() => {
    const tips = BRANCHES.map((b) => branchTip(b.yaw, b.tilt, b.length, FORK_Y));
    return [
      { pos: tips[0], r: 20 },
      { pos: tips[1], r: 20 },
      { pos: tips[2], r: 20 },
      // Two more, central + above for height
      { pos: { x: 0, y: FORK_Y + 22, z: 0 }, r: 22 },
      { pos: { x: 0, y: FORK_Y + 38, z: 0 }, r: 18 },
    ];
  }, []);

  return (
    <group position={position}>
      {/* Lower trunk */}
      <mesh position={[0, LOWER_TRUNK_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[2.8, 4.5, LOWER_TRUNK_HEIGHT, 10]} />
        <meshToonMaterial color={TRUNK_COLOR} gradientMap={gradientMap} />
        <Outlines thickness={0.03} color={OUTLINE} />
      </mesh>

      {/* Three main branches at fork */}
      {BRANCHES.map((b, i) => (
        <group key={i} position={[0, FORK_Y, 0]} rotation={[0, b.yaw, b.tilt]}>
          {/* Main branch: cylinder positioned at its midpoint along local Y */}
          <mesh position={[0, b.length / 2, 0]} castShadow>
            <cylinderGeometry args={[b.rTip, b.rBase, b.length, 8]} />
            <meshToonMaterial color={TRUNK_COLOR} gradientMap={gradientMap} />
            <Outlines thickness={0.025} color={OUTLINE} />
          </mesh>

          {/* Sub-branches */}
          {b.subs.map((s, j) => (
            <group
              key={j}
              position={[0, b.length * s.along, 0]}
              rotation={[0, s.yawOff, s.tiltOff]}
            >
              <mesh position={[0, s.length / 2, 0]} castShadow>
                <cylinderGeometry args={[s.rTip, s.rBase, s.length, 6]} />
                <meshToonMaterial color={TRUNK_COLOR} gradientMap={gradientMap} />
                <Outlines thickness={0.02} color={OUTLINE} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Canopy: soft blobs over branch tips and rising upward */}
      {canopyPositions.map((c, i) => (
        <mesh
          key={i}
          position={[c.pos.x, c.pos.y, c.pos.z]}
          material={canopyMaterials[i % canopyMaterials.length]}
        >
          <sphereGeometry args={[c.r, 20, 16]} />
        </mesh>
      ))}

      {/* Bioluminescent upward motes */}
      <Sparkles
        count={140}
        scale={[14, 80, 14]}
        position={[0, 40, 0]}
        size={5}
        speed={0.35}
        color="#6dd5d8"
        opacity={0.9}
        noise={2}
      />

      {/* Base glow ring */}
      <pointLight
        position={[0, 2, 0]}
        intensity={6}
        color="#6dd5d8"
        distance={28}
        decay={2}
      />
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5, 9, 32]} />
        <meshBasicMaterial
          color="#6dd5d8"
          transparent
          opacity={0.35}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
