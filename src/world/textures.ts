import * as THREE from 'three';

// Procedural surface textures, painted onto an offscreen canvas at load time.
// No image files — everything is drawn in code (project rule).
//
// All the color maps here are painted in NEAR-WHITE tones. A material's map
// is multiplied with its base color (and vertex colors), so a near-white
// texture darkens/tints the existing palette instead of replacing it — the
// locked sage-teal / blue-violet palette survives untouched.
//
// Every generator tiles seamlessly: blobs and streaks are stamped at wrapped
// positions across the edges, and the water noise uses integer frequencies.

// Deterministic RNG so the world looks the same on every load.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size: number) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

// Stamp a soft radial blob, repeated across tile edges so the texture wraps.
function wrappedBlob(
  ctx: CanvasRenderingContext2D,
  size: number,
  x: number,
  y: number,
  r: number,
  rgb: string,
  alpha: number,
) {
  for (let ox = -1; ox <= 1; ox++) {
    for (let oy = -1; oy <= 1; oy++) {
      const cx = x + ox * size;
      const cy = y + oy * size;
      if (cx + r < 0 || cx - r > size || cy + r < 0 || cy - r > size) continue;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(${rgb},${alpha})`);
      grad.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
  }
}

// Fine paper-grain speckle. 1px dots don't visibly seam, so no wrapping needed.
function speckle(
  ctx: CanvasRenderingContext2D,
  size: number,
  rand: () => number,
  count: number,
  darkRgb: string,
  lightRgb: string,
  alpha: number,
) {
  for (let i = 0; i < count; i++) {
    const rgb = rand() < 0.5 ? darkRgb : lightRgb;
    ctx.fillStyle = `rgba(${rgb},${alpha * (0.5 + rand() * 0.5)})`;
    ctx.fillRect(Math.floor(rand() * size), Math.floor(rand() * size), 1, 1);
  }
}

function asRepeatingTexture(canvas: HTMLCanvasElement, repeatX: number, repeatY: number) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ---------------------------------------------------------------------------
// Ground: mottled watercolor wash — big soft cool/warm patches, then grain.
// ---------------------------------------------------------------------------
export function makeGroundTexture(repeat = 20) {
  const size = 256;
  const { canvas, ctx } = makeCanvas(size);
  const rand = mulberry32(1234);

  ctx.fillStyle = '#f1efe9';
  ctx.fillRect(0, 0, size, size);

  // Large washes: cool blue-violet shadow pools vs warm cream light.
  for (let i = 0; i < 34; i++) {
    const cool = rand() < 0.55;
    wrappedBlob(
      ctx, size,
      rand() * size, rand() * size,
      30 + rand() * 45,
      cool ? '186,180,208' : '255,246,224',
      0.05 + rand() * 0.07,
    );
  }
  // Mid-size dapples with a hint of teal so the grass shifts hue subtly.
  for (let i = 0; i < 110; i++) {
    const kind = rand();
    const rgb = kind < 0.4 ? '168,190,182' : kind < 0.7 ? '196,188,214' : '255,244,222';
    wrappedBlob(ctx, size, rand() * size, rand() * size, 6 + rand() * 16, rgb, 0.05 + rand() * 0.06);
  }
  speckle(ctx, size, rand, 2600, '104,98,128', '255,250,235', 0.09);

  return asRepeatingTexture(canvas, repeat, repeat);
}

// ---------------------------------------------------------------------------
// Bark: wavy vertical streaks + knots. Streak wobble uses whole sine periods
// so the top edge lines up with the bottom and the texture tiles vertically.
// ---------------------------------------------------------------------------
export function makeBarkTexture(repeatX = 3, repeatY = 4) {
  const size = 256;
  const { canvas, ctx } = makeCanvas(size);
  const rand = mulberry32(5678);

  ctx.fillStyle = '#efede8';
  ctx.fillRect(0, 0, size, size);

  const drawStreak = (x0: number, amp: number, periods: number, phase: number, width: number, style: string) => {
    for (let ox = -1; ox <= 1; ox++) {
      ctx.strokeStyle = style;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let y = 0; y <= size; y += 6) {
        const x = x0 + ox * size + amp * Math.sin((y / size) * Math.PI * 2 * periods + phase);
        if (y === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  // Dark fissures between plates of bark.
  for (let i = 0; i < 26; i++) {
    drawStreak(
      rand() * size,
      3 + rand() * 7,
      1 + Math.floor(rand() * 3),
      rand() * Math.PI * 2,
      1.5 + rand() * 4,
      `rgba(72,66,98,${0.1 + rand() * 0.12})`,
    );
  }
  // Pale highlight ridges catching the twilight.
  for (let i = 0; i < 14; i++) {
    drawStreak(
      rand() * size,
      3 + rand() * 6,
      1 + Math.floor(rand() * 3),
      rand() * Math.PI * 2,
      1 + rand() * 2.5,
      `rgba(255,246,226,${0.08 + rand() * 0.08})`,
    );
  }
  // A few knots.
  for (let i = 0; i < 6; i++) {
    wrappedBlob(ctx, size, rand() * size, rand() * size, 5 + rand() * 9, '66,60,92', 0.18);
  }
  speckle(ctx, size, rand, 1400, '80,74,104', '255,246,228', 0.08);

  return asRepeatingTexture(canvas, repeatX, repeatY);
}

// ---------------------------------------------------------------------------
// Rock: lichen-mottled stone — patches, faint cracks, heavy grain.
// ---------------------------------------------------------------------------
export function makeRockTexture(repeatX = 1, repeatY = 1) {
  const size = 256;
  const { canvas, ctx } = makeCanvas(size);
  const rand = mulberry32(9012);

  ctx.fillStyle = '#eeedeb';
  ctx.fillRect(0, 0, size, size);

  // Weathering patches: cool shadow, warm stain, mossy tint.
  for (let i = 0; i < 60; i++) {
    const kind = rand();
    const rgb = kind < 0.45 ? '178,174,198' : kind < 0.75 ? '236,228,208' : '176,198,184';
    wrappedBlob(ctx, size, rand() * size, rand() * size, 10 + rand() * 34, rgb, 0.06 + rand() * 0.08);
  }

  // Hairline cracks: short jagged random walks, stamped with wrap on x/y.
  for (let i = 0; i < 10; i++) {
    let x = rand() * size;
    let y = rand() * size;
    let dir = rand() * Math.PI * 2;
    ctx.strokeStyle = `rgba(70,64,96,${0.1 + rand() * 0.1})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const steps = 6 + Math.floor(rand() * 8);
    for (let s = 0; s < steps; s++) {
      dir += (rand() - 0.5) * 1.2;
      x += Math.cos(dir) * (4 + rand() * 8);
      y += Math.sin(dir) * (4 + rand() * 8);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  speckle(ctx, size, rand, 3200, '92,88,118', '250,248,240', 0.1);

  return asRepeatingTexture(canvas, repeatX, repeatY);
}

// ---------------------------------------------------------------------------
// Water ripple normal map. Built from a sum of sine waves whose frequencies
// are whole numbers of cycles per tile, so it wraps perfectly — the material
// scrolls two offset copies of it for a moving-water shimmer.
// ---------------------------------------------------------------------------
export function makeWaterNormalTexture() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);

  // [cycles-x, cycles-y, amplitude, phase]
  const waves: [number, number, number, number][] = [
    [3, 2, 1.0, 0.0],
    [5, -3, 0.7, 1.3],
    [-2, 6, 0.55, 2.6],
    [8, 5, 0.35, 4.0],
    [11, -7, 0.25, 0.7],
  ];

  const heightAt = (x: number, y: number) => {
    let h = 0;
    for (const [kx, ky, amp, ph] of waves) {
      h += amp * Math.sin(((kx * x + ky * y) / size) * Math.PI * 2 + ph);
    }
    return h;
  };

  const strength = 3.5;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Finite differences with wrap-around keep the normals seamless too.
      const dx = heightAt(x + 1, y) - heightAt(x - 1, y);
      const dy = heightAt(x, y + 1) - heightAt(x, y - 1);
      const n = new THREE.Vector3(-dx * strength, -dy * strength, 8).normalize();
      const i = (y * size + x) * 4;
      data[i + 0] = Math.round((n.x * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round((n.y * 0.5 + 0.5) * 255);
      data[i + 2] = Math.round((n.z * 0.5 + 0.5) * 255);
      data[i + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 3);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}
