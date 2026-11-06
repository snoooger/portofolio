"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Scroll halus Lenis (rAF bawaan Lenis; tanpa GSAP supaya bundel awal ringan). */
export function ProtoScroll() {
  useEffect(() => {
    // Reduced motion tidak mematikan Lenis: Lenis sendiri membuat scroll instan (tanpa animasi halus).
    // syncTouch: sentuhan juga ditangani Lenis supaya snap per perhentian meja konsisten di HP.
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, smoothWheel: true, syncTouch: true, syncTouchLerp: 0.085, touchMultiplier: 1.2 });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    return () => {
      lenis.destroy();
      (window as unknown as { __lenis?: Lenis }).__lenis = undefined;
    };
  }, []);
  return null;
}

/** Scroll halus ke posisi y (memakai Lenis bila aktif). */
export function smoothScrollTo(y: number) {
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) lenis.scrollTo(y, { duration: 1.6 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/** Scroll ke perhentian k dari n di dalam elemen panjang `el`. */
export function scrollToStop(el: HTMLElement | null, k: number, n: number) {
  if (!el) return;
  const max = el.offsetHeight - window.innerHeight;
  smoothScrollTo(el.offsetTop + (max * k) / (n - 1));
}
