"use client";

// Efek suara kertas untuk post-it, disintesis langsung dengan WebAudio (tanpa berkas audio):
// derau berwarna + "kresek" (impuls acak) melewati filter band-pass yang bergeser, dengan selubung cepat.
// - lift : post-it dicabut dari tempatnya (desis naik + kresek)
// - flip : lembar berganti (sapuan lebih panjang)
// - drop : post-it kembali menempel (desis turun, lebih pendek & lembut)
// Browser hanya mengizinkan audio setelah interaksi (klik/tap/tombol), jadi konteks dibuka di sana.

type Kind = "lift" | "flip" | "drop";
let ac: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function ctx() {
  if (typeof window === "undefined") return null;
  if (!ac) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ac = new C();
  }
  return ac;
}

/** Panggil di dalam handler interaksi pengguna supaya konteks audio boleh berjalan. */
export function unlockSfx() {
  const c = ctx();
  if (c && c.state !== "running") c.resume().catch(() => {});
}

function noiseBuffer(c: AudioContext) {
  if (noise) return noise;
  const len = Math.floor(c.sampleRate * 0.6);
  const b = c.createBuffer(1, len, c.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    // derau pink-ish + kresek jarang
    const white = Math.random() * 2 - 1;
    last = last * 0.86 + white * 0.14;
    const crackle = Math.random() < 0.012 ? (Math.random() * 2 - 1) * 0.9 : 0;
    d[i] = last * 2.2 + white * 0.25 + crackle;
  }
  return (noise = b);
}

const SHAPES: Record<Kind, { dur: number; f0: number; f1: number; q: number; gain: number; attack: number }> = {
  lift: { dur: 0.26, f0: 1400, f1: 4200, q: 0.9, gain: 0.32, attack: 0.012 },
  flip: { dur: 0.34, f0: 2600, f1: 1600, q: 0.7, gain: 0.26, attack: 0.03 },
  drop: { dur: 0.2, f0: 3200, f1: 900, q: 1.1, gain: 0.22, attack: 0.006 },
};

export function paperSfx(kind: Kind) {
  const c = ctx();
  if (!c) return;
  // Konteks baru dibuka di interaksi yang sama (resume asinkron) → bunyikan begitu siap.
  if (c.state !== "running") {
    // Hanya bila pengunjung sudah pernah berinteraksi (kalau tidak, suara akan menumpuk lalu berbunyi bersamaan).
    const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (ua?.hasBeenActive) c.resume().then(() => c.state === "running" && play(c, kind)).catch(() => {});
    return;
  }
  play(c, kind);
}

function play(c: AudioContext, kind: Kind) {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches && kind === "flip") return;
  const s = SHAPES[kind];
  const t = c.currentTime + 0.005;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  src.playbackRate.value = 0.9 + Math.random() * 0.25;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = s.q;
  bp.frequency.setValueAtTime(s.f0, t);
  bp.frequency.exponentialRampToValueAtTime(s.f1, t + s.dur);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 500;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(s.gain, t + s.attack);
  // dua puncak kecil di tengah = tekstur "kresek" kertas
  g.gain.exponentialRampToValueAtTime(s.gain * 0.45, t + s.dur * 0.45);
  g.gain.exponentialRampToValueAtTime(s.gain * 0.7, t + s.dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + s.dur);
  src.connect(bp).connect(hp).connect(g).connect(c.destination);
  src.start(t, Math.random() * 0.2);
  src.stop(t + s.dur + 0.02);
}
