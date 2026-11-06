"use client";

// Penanda perhentian di tepi kanan (desktop): garis kecil yang memanjang & berwarna di section aktif.
import { useEffect, useRef } from "react";

const bell = (v: number, k: number, inner: number, outer: number) => {
  const d = Math.abs(v - k);
  if (d <= inner) return 1;
  if (d >= outer) return 0;
  const t = (d - inner) / (outer - inner);
  return 1 - t * t * (3 - 2 * t);
};

export function StopDots({ f, count }: { f: { current: number }; count: number }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      refs.current.forEach((el, k) => {
        if (!el) return;
        const a = bell(f.current, k, 0.3, 0.6);
        el.style.transform = `scaleY(${1 + a * 2.2})`;
        el.style.backgroundColor = a > 0.5 ? "var(--terracotta)" : "rgba(30,27,24,0.25)";
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [f]);
  return (
    <div aria-hidden className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex">
      {Array.from({ length: count }, (_, k) => (
        <span key={k} ref={(el) => void (refs.current[k] = el)} className="block h-2.5 w-[3px] origin-center rounded-full transition-colors" />
      ))}
    </div>
  );
}
