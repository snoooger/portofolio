"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/** Progres scroll 0–1 sepanjang elemen `target`, disimpan di ref (dibaca tiap frame oleh scene 3D). */
export function useScrollProgress(target: RefObject<HTMLElement | null>) {
  const p = useRef(0);
  useEffect(() => {
    if (!target.current) return;
    const st = ScrollTrigger.create({
      trigger: target.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => (p.current = s.progress),
    });
    return () => st.kill();
  }, [target]);
  return p;
}

/** Progres lokal 0–1 untuk segmen ke-i dari n segmen yang sama panjang. */
export function seg(p: number, i: number, n: number) {
  return Math.min(1, Math.max(0, p * n - i));
}

const sstep = (x: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** 1 saat f tepat di perhentian k, turun ke 0 saat menjauh (untuk teks & efek per section). */
export function bell(f: number, k: number, inner = 0.2, outer = 0.45) {
  return 1 - sstep(Math.abs(f - k), inner, outer);
}

/** Interpolasi antar perhentian dengan "diam" di sekitar tiap perhentian. */
export function stopMix(f: number, count: number, hold = 0.22) {
  const g = Math.min(count - 1, Math.max(0, Math.floor(f)));
  const n = Math.min(count - 1, g + 1);
  return { a: g, b: n, t: sstep(f - g, hold, 1 - hold) };
}

/** Progres perhentian f (0 … n-1) dari scroll; ref diperbarui oleh ScrollTrigger. */
export function useStops(target: RefObject<HTMLElement | null>, n: number) {
  const p = useScrollProgress(target);
  const f = useRef(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      f.current = p.current * (n - 1);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [p, n]);
  return f;
}
