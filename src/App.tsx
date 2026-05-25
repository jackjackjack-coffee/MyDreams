import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, PointerLockControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { World } from './world/World';
import { Player } from './world/Player';
import { Postprocess } from './world/effects/Postprocess';
import { Settings } from './ui/Settings';
import { DreamForm } from './dreams/DreamForm';
import { DreamPopup } from './dreams/DreamPopup';
import type { Dream } from './dreams/types';

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
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Dream | null>(null);

  useEffect(() => {
    localStorage.setItem(SENSITIVITY_KEY, String(sensitivity));
  }, [sensitivity]);

  // Press E to leave a dream. Only while locked (in-game), and only when no
  // other modal is already open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return;
      if (!locked) return;
      if (formOpen || selected) return;
      e.preventDefault();
      document.exitPointerLock();
      setFormOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, formOpen, selected]);

  // Selecting a dream marker (from inside the Canvas) opens the popup and
  // releases pointer lock so the user can interact with the modal.
  const handleSelectDream = (d: Dream) => {
    document.exitPointerLock();
    setSelected(d);
  };

  const modalOpen = formOpen || selected !== null;

  return (
    <div className="relative h-full w-full">
      <KeyboardControls map={KEYS}>
        <Canvas
          shadows
          camera={{ position: [0, 1.7, 6], fov: 70 }}
          gl={{ antialias: true }}
        >
          <Physics gravity={[0, -20, 0]}>
            <World onSelectDream={handleSelectDream} />
            <Player />
          </Physics>
          <PointerLockControls
            pointerSpeed={sensitivity}
            onLock={() => setLocked(true)}
            onUnlock={() => setLocked(false)}
          />
          <Postprocess />
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

      <DreamForm open={formOpen} onClose={() => setFormOpen(false)} />
      <DreamPopup dream={selected} onClose={() => setSelected(null)} />

      {!locked && !modalOpen && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-lg bg-black/60 px-6 py-4 text-center text-white/90 ring-1 ring-white/10">
            <p className="text-sm font-medium">Click to enter</p>
            <p className="mt-1 text-xs text-white/60">
              WASD to walk · mouse to look · Space to jump · E to leave a dream · Esc to release
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
