import { EffectComposer, Bloom, Vignette, BrightnessContrast, HueSaturation } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

export function Postprocess() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* Lower threshold so terrain/mushrooms/stones all bleed into the glow pass, not just orbs. */}
      <Bloom
        intensity={1.9}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.88}
        kernelSize={KernelSize.HUGE}
        mipmapBlur
      />
      {/* Deeper saturation — makes the painted palette pop instead of reading as muted. */}
      <HueSaturation saturation={0.24} />
      {/* Slightly darker base so emissive objects contrast more. */}
      <BrightnessContrast brightness={-0.03} contrast={0.14} />
      <Vignette
        offset={0.18}
        darkness={0.65}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
