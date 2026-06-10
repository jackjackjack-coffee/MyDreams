// Imperative cross-Canvas-boundary state, same pattern as playerPos: UI code
// (App) requests a teleport; Player.tsx applies it on the next physics frame.
type Target = { x: number; y: number; z: number };

let pending: Target | null = null;

export function requestTeleport(x: number, y: number, z: number) {
  pending = { x, y, z };
}

export function consumeTeleport(): Target | null {
  const t = pending;
  pending = null;
  return t;
}
