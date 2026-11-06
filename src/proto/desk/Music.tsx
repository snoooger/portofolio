"use client";

// Musik latar lo-fi (CC0: “Chill lofi inspired” — omfgdude, OpenGameArt). Browser melarang autoplay
// bersuara, jadi musik mulai pada interaksi pertama pengunjung (klik/tap/tombol) setelah intro selesai,
// kecuali pengunjung pernah mematikannya (diingat di localStorage). Berkas diunduh hanya saat diputar
// (preload="none"), volume naik/turun halus, berhenti saat tab disembunyikan.
import { useCallback, useEffect, useRef, useState } from "react";

const SRC = "/audio/bgm.mp3";
const KEY = "zj-bgm";
const VOL = 0.32;

const pref = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const savePref = (v: "on" | "off") => {
  try {
    localStorage.setItem(KEY, v);
  } catch {}
};

export function useMusic(armed: boolean) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef(0);
  const [on, setOn] = useState(false);

  const ramp = useCallback((to: number, ms: number, then?: () => void) => {
    const a = audio.current;
    if (!a) return;
    cancelAnimationFrame(fade.current);
    const from = a.volume, t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      a.volume = from + (to - from) * k;
      if (k < 1) fade.current = requestAnimationFrame(step);
      else then?.();
    };
    fade.current = requestAnimationFrame(step);
  }, []);

  const play = useCallback(() => {
    if (!audio.current) {
      const a = new Audio(SRC);
      a.loop = true;
      a.preload = "none";
      a.volume = 0;
      audio.current = a;
    }
    const a = audio.current;
    a.play()
      .then(() => {
        setOn(true);
        ramp(VOL, 1800);
      })
      .catch(() => setOn(false));
  }, [ramp]);

  const pause = useCallback(() => {
    setOn(false);
    ramp(0, 500, () => audio.current?.pause());
  }, [ramp]);

  const toggle = useCallback(() => {
    if (on) {
      savePref("off");
      pause();
    } else {
      savePref("on");
      play();
    }
  }, [on, pause, play]);

  // Interaksi pertama → mulai (bila belum pernah dimatikan).
  useEffect(() => {
    if (!armed || pref() === "off") return;
    const start = (e: Event) => {
      // Klik tombol musik ditangani toggle sendiri.
      if ((e.target as HTMLElement | null)?.closest?.("[data-music]")) return cleanup();
      cleanup();
      play();
    };
    const evs = ["pointerdown", "keydown", "touchend"] as const;
    const cleanup = () => evs.forEach((ev) => window.removeEventListener(ev, start, true));
    evs.forEach((ev) => window.addEventListener(ev, start, { capture: true, passive: true }));
    return cleanup;
  }, [armed, play]);

  // Tab disembunyikan → jeda; kembali → lanjut (bila sedang menyala).
  useEffect(() => {
    const vis = () => {
      const a = audio.current;
      if (!a || !on) return;
      if (document.hidden) a.pause();
      else a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, [on]);

  useEffect(
    () => () => {
      cancelAnimationFrame(fade.current);
      audio.current?.pause();
    },
    [],
  );

  return { on, toggle };
}

/** Tombol musik: ikon equalizer yang bergerak saat menyala. */
export function MusicButton({ on, toggle, labels }: { on: boolean; toggle: () => void; labels: { on: string; off: string } }) {
  return (
    <button
      data-music
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? labels.on : labels.off}
      title={on ? labels.on : labels.off}
      className="grid size-9 place-items-center rounded-full bg-white/10 text-[#fbf3e3] transition hover:bg-white/20"
    >
      <span className="flex h-3.5 items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block w-[2.5px] rounded-full bg-current"
            style={{
              height: on ? undefined : `${[35, 60, 45, 30][i]}%`,
              animation: on ? `eq 0.${[9, 7, 8, 6][i]}s ease-in-out ${i * 0.12}s infinite alternate` : undefined,
              opacity: on ? 1 : 0.65,
            }}
          />
        ))}
      </span>
      <style>{`@keyframes eq { from { height: 20% } to { height: 100% } }`}</style>
    </button>
  );
}
