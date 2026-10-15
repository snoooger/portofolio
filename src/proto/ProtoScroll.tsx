"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/** Lenis tersinkron dengan ScrollTrigger (sama seperti situs utama). */
export function ProtoScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    // syncTouch: sentuhan juga ditangani Lenis, jadi batas momentum di tiap perhentian meja berlaku di HP.
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: true });
    lenis.on("scroll", ScrollTrigger.update);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
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
