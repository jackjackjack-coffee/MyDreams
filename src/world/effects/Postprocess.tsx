import {
  EffectComposer,
  Bloom,
  HueSaturation,
  BrightnessContrast,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';

/**
 * Post-processing for the watercolor-twilight dream world.
 *
 * Goal: a loose, painted, storybook feel — a soft luminous glow on the flora
 * and dream markers, a gently cooled & desaturated palette, and a whisper of
 * film grain so the frame reads as hand-made paper rather than a sharp 3D
 * render. Everything is deliberately subtle and CHEAP so it survives a weak
 * laptop with no dedicated GPU.
 *
 * Design decisions & invariants (do not break these):
 *
 *  - NO <ToneMapping> effect is added. R3F's renderer already applies
 *    ACESFilmicToneMapping + sRGB output. Adding a ToneMapping effect here
 *    would tone-map twice and wash the image out. Because we don't touch it,
 *    the <Canvas> needs NO gl change (no toneMapping override required).
 *
 *  - We NEVER add exposure/brightness. The scene's directly-lit surfaces
 *    already push toward blown highlights, so Bloom is retuned to bleed only
 *    genuinely emissive pixels, and BrightnessContrast pulls brightness DOWN.
 *
 *  - The "hazy far horizon" comes from the scene's existing <fog> in World.tsx
 *    (deep blue-violet, near 35 / far 220), which is effectively free and
 *    depth-correct. We deliberately DON'T add a screen-space blur (TiltShift /
 *    DepthOfField) for this: on a first-person camera a screen-band blur would
 *    smear the periphery (nausea + blurred markers as you turn to aim at them),
 *    and it's a full convolution pass a weak GPU can't afford. Fog does the job.
 *
 * Pass budget on a weak integrated GPU:
 *   RenderPass + Bloom (mipmap blur, runs at reduced res) + ONE merged
 *   grade/grain/vignette pass (HueSaturation + BrightnessContrast + Noise +
 *   Vignette are all single-sample, non-convolution effects, so the composer
 *   fuses them into a single fullscreen shader). ~3 real passes total.
 */
export function Postprocess() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/*
        1. GLOW — kept (this is what makes the flora / dream markers / motes /
        moons read as light), but tamed. Threshold up (0.22 -> 0.34) so only
        genuinely emissive pixels bloom instead of every lit hillside smearing
        toward white; intensity down (1.9 -> 1.35) so highlights stop clipping.
        KernelSize.LARGE (not HUGE) + mipmapBlur keeps the halo soft & wide
        while shaving the single most expensive pass for weak GPUs.
      */}
      <Bloom
        intensity={1.35}
        luminanceThreshold={0.34}
        luminanceSmoothing={0.9}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />

      {/*
        2. GRADE — cool + desaturated (parametric, no LUT file). The old stack
        pushed saturation UP (+0.24) for neon pop; a watercolour wash wants the
        opposite, so pull it gently DOWN and nudge the hue a touch cooler
        (toward the lavender/indigo palette) without turning the gold moon green.
      */}
      <HueSaturation hue={-0.02} saturation={-0.1} />

      {/*
        3. TAME HIGHLIGHTS + a little depth. Brightness stays NEGATIVE (never
        brighten); a small contrast lift keeps the desaturated frame from going
        flat/milky and gives the emissive objects something to pop against.
      */}
      <BrightnessContrast brightness={-0.05} contrast={0.1} />

      {/*
        4. PAPER GRAIN — fine film-grain tooth over the whole frame. It sells
        "hand-painted paper" over "3D render" and, crucially, breaks up colour
        banding in the big smooth twilight sky gradient. SOFT_LIGHT blend at low
        opacity modulates tones gently instead of washing the image; premultiply
        keeps it from lifting the blacks. Nearly free on any GPU.
      */}
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.18} />

      {/*
        5. VIGNETTE — last, so the corners darken the fully finished frame.
        Softer than the old 0.65 so it reads as deepening twilight atmosphere,
        not a hard black ring. NORMAL blend keeps corners blue-violet dusk.
      */}
      <Vignette
        offset={0.26}
        darkness={0.55}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
