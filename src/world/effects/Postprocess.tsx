import { EffectComposer, Bloom, Vignette, BrightnessContrast, HueSaturation } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

// The dreamy-bloom + soft-contrast pass that makes everything glow and feel painted.
// Watercolor-grade smoothing without a custom shader — bloom does most of the heavy lifting,
// vignette + a touch of saturation finish the storybook feel.
export function Postprocess() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={1.4}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.85}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />
      <HueSaturation saturation={0.08} />
      <BrightnessContrast brightness={0.02} contrast={0.05} />
      <Vignette
        offset={0.2}
        darkness={0.55}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
