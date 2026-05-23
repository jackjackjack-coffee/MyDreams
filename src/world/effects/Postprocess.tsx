import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  Vignette,
  HueSaturation,
  BrightnessContrast,
  ToneMapping,
} from '@react-three/postprocessing';
import { BlendFunction, Effect, ToneMappingMode } from 'postprocessing';
import { Uniform } from 'three';

// Watercolor-feel post-process: soft directional smudge (cheap kuwahara-ish
// box blur biased by local luminance) + paper grain. Subtle on purpose — we
// want a painterly hint, not a smear.
const watercolorFrag = /* glsl */ `
  uniform float uStrength;
  uniform float uGrain;
  uniform float uTime;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 px = 1.0 / resolution.xy;

    vec3 c = texture2D(inputBuffer, uv).rgb * 0.36;
    c += texture2D(inputBuffer, uv + vec2( 1.5,  0.0) * px * uStrength).rgb * 0.16;
    c += texture2D(inputBuffer, uv + vec2(-1.5,  0.0) * px * uStrength).rgb * 0.16;
    c += texture2D(inputBuffer, uv + vec2( 0.0,  1.5) * px * uStrength).rgb * 0.16;
    c += texture2D(inputBuffer, uv + vec2( 0.0, -1.5) * px * uStrength).rgb * 0.16;

    float lum = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
    float lumBlur = dot(c, vec3(0.299, 0.587, 0.114));
    float edge = clamp(abs(lum - lumBlur) * 8.0, 0.0, 1.0);
    vec3 painted = mix(c, inputColor.rgb, edge);

    float g = hash(uv * resolution.xy * 0.5 + uTime * 0.0);
    painted += (g - 0.5) * uGrain;

    painted.r *= 1.02;
    painted.b *= 1.01;

    outputColor = vec4(painted, inputColor.a);
  }
`;

class WatercolorEffect extends Effect {
  constructor() {
    super('WatercolorEffect', watercolorFrag, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['uStrength', new Uniform(1.2)],
        ['uGrain', new Uniform(0.035)],
        ['uTime', new Uniform(0)],
      ]),
    });
  }
}

function Watercolor() {
  const effect = useMemo(() => new WatercolorEffect(), []);
  useFrame((_, dt) => {
    const u = effect.uniforms.get('uTime');
    if (u) u.value += dt;
  });
  return <primitive object={effect} dispose={null} />;
}

export function Postprocess() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={1.1}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.4}
        mipmapBlur
        radius={0.85}
      />
      <HueSaturation hue={0.0} saturation={0.08} />
      <BrightnessContrast brightness={-0.02} contrast={0.08} />
      <Watercolor />
      <Vignette eskil={false} offset={0.2} darkness={0.55} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
