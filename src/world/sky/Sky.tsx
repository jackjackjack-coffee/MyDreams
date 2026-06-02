import { Stars } from '@react-three/drei';
import { SkyDome } from './SkyDome';
import { Moons } from './Moons';
import { Aurora } from './Aurora';

export function Sky() {
  return (
    <>
      <SkyDome />
      <Stars
        radius={300}
        depth={50}
        count={1200}
        factor={4}
        saturation={0}
        fade
        speed={0.3}
      />
      <Aurora />
      <Moons />
    </>
  );
}
