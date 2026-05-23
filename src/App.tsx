import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, PointerLockControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { World } from './world/World';
import { Player } from './world/Player';
import { Settings } from './ui/Settings';

const KEYS = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
];

const SENSITIVITY_KEY = 'mydreams.mouseSensitivity';

function loadSensitivity(): number {
  const v = parseFloat(localStorage.getItem(SENSITIVITY_KEY) ?? '1');
  return Number.isFinite(v) && v > 0 ? v : 1;
}

export default function App() {
  const [locked, setLocked] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sensitivity, setSensitivity] = useState(loadSensitivity);

  useEffect(() => {
    localStorage.setItem(SENSITIVITY_KEY, String(sensitivity));
  }, [sensitivity]);

  return (
    <div className="relative h-full w-full">
      <KeyboardControls map={KEYS}>
        <Canvas
          shadows
          camera={{ position: [0, 1.7, 6], fov: 70 }}
          gl={{ antialias: true }}
        >
          <Physics gravity={[0, -20, 0]}>
            <World />
            <Player />
          </Physics>
          <PointerLockControls
            pointerSpeed={sensitivity}
            onLock={() => setLocked(true)}
            onUnlock={() => setLocked(false)}
          />
        </Canvas>
      </KeyboardControls>

      <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 text-center">
        <h1 className="text-2xl font-light tracking-wider text-white/90 drop-shadow">
          MyDreams
        </h1>
        <p className="text-xs text-white/60">
          a place to leave a wish for a stranger
        </p>
      </div>

      <Settings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        sensitivity={sensitivity}
        onSensitivityChange={setSensitivity}
        locked={locked}
      />

      {!locked && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-lg bg-black/60 px-6 py-4 text-center text-white/90 ring-1 ring-white/10">
            <p className="text-sm font-medium">Click to enter</p>
            <p className="mt-1 text-xs text-white/60">
              WASD to walk · mouse to look · Space to jump · Esc to release
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
