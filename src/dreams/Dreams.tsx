import { useEffect } from 'react';
import { DreamMarker } from './DreamMarker';
import { startDreamSync, useDreams } from './store';
import type { Dream } from './types';

type Props = {
  onSelect: (dream: Dream) => void;
};

export function Dreams({ onSelect }: Props) {
  const { dreams } = useDreams();

  useEffect(() => {
    startDreamSync();
  }, []);

  return (
    <group>
      {dreams.map((d) => (
        <DreamMarker key={d.id} dream={d} onSelect={onSelect} />
      ))}
    </group>
  );
}
