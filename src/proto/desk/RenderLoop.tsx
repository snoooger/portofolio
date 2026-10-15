"use client";

// Render sesuai kebutuhan (Canvas frameloop="demand"): adegan meja statis, jadi GPU hanya bekerja saat
// ada yang berubah — scroll/kamera bergerak, kursor menggeser parallax, post-it jatuh, layar HP farm
// berputar, atau aset baru selesai dimuat. Saat diam di sebuah perhentian (atau footer terbuka),
// tidak ada frame yang dirender: hemat baterai & panas di HP tanpa mengubah tampilan sama sekali.
// Sekaligus mengukur FPS (hanya selama render beruntun) untuk menurunkan tier bila perangkat kewalahan.
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import type { Drive } from "../objects/types";

/** Lama render tetap jalan setelah aktivitas terakhir: cukup untuk damping kamera/teks & animasi kertas jatuh. */
const TAIL = 2600;

export function RenderLoop({
  f,
  busy,
  measure,
  onDecline,
  pokeKey,
}: {
  f: Drive;
  /** Animasi berkelanjutan yang bergantung pada posisi scroll (mis. layar HP farm berputar). */
  busy: (v: number) => boolean;
  /** Adegan siap: mulai mengukur FPS & boleh berhenti render saat diam. */
  measure: boolean;
  onDecline: () => void;
  /** Berubah → render ulang beberapa saat (bahasa, tier, tekstur baru). */
  pokeKey: unknown;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const until = useRef(0); // diisi lewat pokeKey saat mount
  const cfg = useRef({ busy, measure, onDecline });
  useEffect(() => {
    cfg.current = { busy, measure, onDecline };
  });

  useEffect(() => {
    until.current = Math.max(until.current, performance.now() + TAIL);
    invalidate();
  }, [pokeKey, invalidate]);

  useEffect(() => {
    const poke = () => (until.current = Math.max(until.current, performance.now() + TAIL));
    const opts = { passive: true } as const;
    window.addEventListener("pointermove", poke, opts);
    window.addEventListener("pointerdown", poke, opts);
    window.addEventListener("resize", poke, opts);
    document.addEventListener("visibilitychange", poke);

    let raf = 0, last = NaN, prevActive = false, prevT = 0;
    // Pengukuran FPS: jendela 250 ms, dinilai tiap 10 jendela (seperti drei PerformanceMonitor).
    const m = { n: 0, t: 0, windows: 0, low: 0, warm: 0 };
    const tick = (now: number) => {
      const v = f.current;
      if (v !== last) {
        last = v;
        poke();
      }
      // Selama memuat (belum siap) render terus, supaya aset yang datang langsung tampil & bayangan ter-bake.
      const active = !cfg.current.measure || now < until.current || cfg.current.busy(v);
      if (active) invalidate();

      if (active && prevActive && cfg.current.measure) {
        const d = now - prevT;
        if (m.warm < 1500) m.warm += d; // abaikan kompilasi shader & unggah tekstur awal
        else {
          m.n++;
          m.t += d;
          if (m.t >= 250) {
            if ((m.n * 1000) / m.t < 36) m.low++;
            m.windows++;
            m.n = m.t = 0;
            if (m.windows === 10) {
              if (m.low > 7) {
                cfg.current.onDecline();
                m.warm = 0;
              }
              m.windows = m.low = 0;
            }
          }
        }
      } else m.n = m.t = 0;
      prevActive = active;
      prevT = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", poke);
      window.removeEventListener("pointerdown", poke);
      window.removeEventListener("resize", poke);
      document.removeEventListener("visibilitychange", poke);
    };
  }, [f, invalidate]);
  return null;
}
