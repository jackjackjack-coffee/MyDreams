import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import {
  RigidBody,
  CapsuleCollider,
  type RapierRigidBody,
} from '@react-three/rapier';
import * as THREE from 'three';
import { setPlayerPos } from '../dreams/playerPos';
import { consumeTeleport } from './teleport';
import { footstep } from '../audio/ambient';

const SPEED = 5;
const JUMP_VELOCITY = 5;
const PLAYER_EYE_HEIGHT = 0.6;

// View-bob: a gentle vertical sway while walking so movement feels embodied.
// Kept small — too much reads as seasickness.
const BOB_AMPLITUDE = 0.06;
const BOB_FREQUENCY = 1.1; // bob cycles per unit of distance walked

// Wider tolerance so terrain bumps don't keep the player from being "grounded"
// while walking. Combined with a short post-jump cooldown to prevent double
// jumps when the player's velocity passes through 0 at the apex.
const GROUND_VY_TOL = 0.5;
const JUMP_COOLDOWN = 0.3;

const camDir = new THREE.Vector3();
const sideDir = new THREE.Vector3();
const movement = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export function Player() {
  const body = useRef<RapierRigidBody>(null);
  const lastJumpAt = useRef(0);
  const bobPhase = useRef(0);
  const lastStep = useRef(0);
  const [, get] = useKeyboardControls();
  const { camera } = useThree();

  useFrame(({ clock }, delta) => {
    if (!body.current) return;

    const tp = consumeTeleport();
    if (tp) {
      body.current.setTranslation(tp, true);
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    const { forward, backward, left, right, jump } = get();

    camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();
    sideDir.crossVectors(camDir, UP).normalize();

    movement.set(0, 0, 0);
    if (forward) movement.add(camDir);
    if (backward) movement.sub(camDir);
    if (right) movement.add(sideDir);
    if (left) movement.sub(sideDir);
    if (movement.lengthSq() > 0) movement.normalize().multiplyScalar(SPEED);

    const linvel = body.current.linvel();
    const t = clock.elapsedTime;
    const onGround = Math.abs(linvel.y) < GROUND_VY_TOL;
    const wantsJump = jump && onGround && t - lastJumpAt.current > JUMP_COOLDOWN;
    if (wantsJump) lastJumpAt.current = t;

    body.current.setLinvel(
      {
        x: movement.x,
        y: wantsJump ? JUMP_VELOCITY : linvel.y,
        z: movement.z,
      },
      true,
    );

    // View-bob + footsteps: advance a phase by how far we actually moved along
    // the ground this frame, so the bob speed matches walking speed and stops
    // dead when standing still or airborne.
    const horizSpeed = Math.hypot(linvel.x, linvel.z);
    const walking = horizSpeed > 0.5 && onGround;
    let bob = 0;
    if (walking) {
      bobPhase.current += delta * horizSpeed * BOB_FREQUENCY;
      bob = Math.sin(bobPhase.current * 2) * BOB_AMPLITUDE;
      // One footstep per bob dip (every PI of phase) — a natural stride cadence.
      const stepIndex = Math.floor(bobPhase.current / Math.PI);
      if (stepIndex !== lastStep.current) {
        lastStep.current = stepIndex;
        footstep();
      }
    }

    const pos = body.current.translation();
    camera.position.set(pos.x, pos.y + PLAYER_EYE_HEIGHT + bob, pos.z);
    setPlayerPos(pos.x, pos.y, pos.z);
  });

  return (
    <RigidBody
      ref={body}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[0, 2, 6]}
      enabledRotations={[false, false, false]}
      friction={0.2}
    >
      <CapsuleCollider args={[0.5, 0.4]} />
    </RigidBody>
  );
}
