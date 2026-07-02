// Procedural ambient soundscape — everything is synthesised in code with the
// Web Audio API, so there are no sound files to ship. Three layers:
//   1. Wind   — brown noise through a slowly-drifting band-pass filter.
//   2. Drone  — a calm low chord (open fifth) with a gentle tremolo.
//   3. Chimes — occasional bell tones on a pentatonic scale, randomly timed.
// Plus a one-shot footstep() the player calls while walking.
//
// Must be started from a user gesture (browsers block audio otherwise) — we
// kick it off on "Click to enter".

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let started = false;
let muted = false;
let chimeTimer = 0;

const MUTE_KEY = 'mydreams.muted';
const BASE_VOLUME = 0.5;

export function initMuteFromStorage() {
  muted = localStorage.getItem(MUTE_KEY) === '1';
}

export function isMuted() {
  return muted;
}

function makeContext(): AudioContext {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  return new AC();
}

export function startAmbient() {
  if (started) {
    // Tab was backgrounded / browser suspended the context — wake it up.
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return;
  }
  started = true;

  ctx = makeContext();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : BASE_VOLUME;
  master.connect(ctx.destination);
  void ctx.resume();

  buildWind(ctx, master);
  buildDrone(ctx, master);
  scheduleChimes(ctx, master);
}

export function setMuted(m: boolean) {
  muted = m;
  localStorage.setItem(MUTE_KEY, m ? '1' : '0');
  if (ctx && master) {
    master.gain.setTargetAtTime(m ? 0 : BASE_VOLUME, ctx.currentTime, 0.2);
  }
}

// --- Wind ----------------------------------------------------------------------
function buildWind(ctx: AudioContext, out: AudioNode) {
  const size = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Brown noise: integrate white noise so it's weighted toward low frequencies.
  let last = 0;
  for (let i = 0; i < size; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;

  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 500;
  band.Q.value = 0.6;

  const gain = ctx.createGain();
  gain.gain.value = 0.35;

  // Slowly sweep the filter so the wind never sits still.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 300;
  lfo.connect(lfoDepth).connect(band.frequency);

  // Slower swell on volume = distant gusts.
  const gust = ctx.createOscillator();
  gust.frequency.value = 0.03;
  const gustDepth = ctx.createGain();
  gustDepth.gain.value = 0.15;
  gust.connect(gustDepth).connect(gain.gain);

  src.connect(band).connect(gain).connect(out);
  src.start();
  lfo.start();
  gust.start();
}

// --- Drone ---------------------------------------------------------------------
function buildDrone(ctx: AudioContext, out: AudioNode) {
  // C2 / G2 / C3 — an open fifth, calm and unresolved.
  const freqs = [65.41, 98.0, 130.81];
  const gain = ctx.createGain();
  gain.gain.value = 0.08;
  gain.connect(out);

  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    osc.detune.value = (i - 1) * 4; // slight spread so it breathes
    const g = ctx.createGain();
    g.gain.value = 0.5;
    osc.connect(g).connect(gain);
    osc.start();
  });

  const trem = ctx.createOscillator();
  trem.frequency.value = 0.08;
  const tremDepth = ctx.createGain();
  tremDepth.gain.value = 0.03;
  trem.connect(tremDepth).connect(gain.gain);
  trem.start();
}

// --- Chimes --------------------------------------------------------------------
function scheduleChimes(ctx: AudioContext, out: AudioNode) {
  // C5 D5 E5 G5 A5 — major pentatonic, no dissonant intervals possible.
  const scale = [523.25, 587.33, 659.25, 783.99, 880.0];
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  gain.connect(out);

  const ping = () => {
    if (!ctx) return;
    const f = scale[Math.floor(Math.random() * scale.length)];
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.6, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, t + 3.5);

    // Soft octave shimmer on top.
    const harm = ctx.createOscillator();
    harm.type = 'sine';
    harm.frequency.value = f * 2.01;
    const harmEnv = ctx.createGain();
    harmEnv.gain.setValueAtTime(0, t);
    harmEnv.gain.linearRampToValueAtTime(0.15, t + 0.02);
    harmEnv.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

    osc.connect(env).connect(gain);
    harm.connect(harmEnv).connect(gain);
    osc.start(t);
    osc.stop(t + 4);
    harm.start(t);
    harm.stop(t + 2.5);

    chimeTimer = window.setTimeout(ping, 4000 + Math.random() * 9000);
  };

  chimeTimer = window.setTimeout(ping, 2000 + Math.random() * 3000);
}

// --- Footstep (one-shot) -------------------------------------------------------
export function footstep() {
  if (!ctx || !master || muted) return;
  const dur = 0.12;
  const size = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Noise burst with a fast decay — a soft, grassy scuff.
  for (let i = 0; i < size; i++) {
    const decay = Math.pow(1 - i / size, 2);
    data[i] = (Math.random() * 2 - 1) * decay;
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 350 + Math.random() * 120;
  const g = ctx.createGain();
  g.gain.value = 0.25;

  src.connect(lp).connect(g).connect(master);
  src.start();
}

export function stopChimes() {
  if (chimeTimer) window.clearTimeout(chimeTimer);
}
