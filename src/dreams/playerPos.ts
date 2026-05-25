// Imperative cross-Canvas-boundary state: Player.tsx writes the live position
// every frame; the place-a-dream form reads it on submit.
let pos = { x: 0, y: 0, z: 0 };

export function setPlayerPos(x: number, y: number, z: number) {
  pos.x = x;
  pos.y = y;
  pos.z = z;
}

export function getPlayerPos() {
  return { ...pos };
}
