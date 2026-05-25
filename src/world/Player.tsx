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

const SPEED = 5;
const JUMP_VELOCITY = 5;
const PLAYER_EYE_HEIGHT = 0.6;

const camDir = new THREE.Vector3();
const sideDir = new THREE.Vector3();
const movement = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export function Player() {
  const body = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls();
  const { camera } = useThree();

  useFrame(() => {
    if (!body.current) return;

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
    const onGround = Math.abs(linvel.y) < 0.05;

    body.current.setLinvel(
      {
        x: movement.x,
        y: jump && onGround ? JUMP_VELOCITY : linvel.y,
        z: movement.z,
      },
      true,
    );

    const pos = body.current.translation();
    camera.position.set(pos.x, pos.y + PLAYER_EYE_HEIGHT, pos.z);
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
