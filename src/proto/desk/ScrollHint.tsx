"use client";

// Tanda ajakan scroll di tengah bawah layar: muncul saat kamera diam di sebuah perhentian (bukan yang
// terakhir & bukan di footer), hilang saat bergerak. Ikon mouse dengan roda bergerak (desktop) atau
// panah naik (layar sentuh).
import { useEffect, useRef, useState } from "react";
import type { DeskDrive } from "./deskScroll";

export function ScrollHint({ f, count, label, touchLabel, enabled }: { f: DeskDrive; count: number; label: string; touchLabel: string; enabled: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const on = () => setTouch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const d = el.current;
      if (d) {
        const main = document.querySelector("main");
        const end = main ? main.offsetTop + main.offsetHeight - window.innerHeight : Infinity;
        // Tampil selama di zona tahan sebuah perhentian; bar terisi seiring scroll menembus zona itu.
        const show = enabled && f.hold >= 0 && window.scrollY < end + 4 && count > 0;
        if (bar.current && f.hold >= 0) bar.current.style.transform = `scaleX(${f.hold})`;
        d.style.opacity = show ? "1" : "0";
        d.style.transform = `translate(-50%, ${show ? 0 : 10}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [f, count, enabled]);

  return (
    <div
      ref={el}
      aria-hidden
      className="pointer-events-none fixed bottom-5 left-1/2 z-40 flex items-center gap-2.5 rounded-full border border-white/15 bg-[#1d3a2b]/80 py-2 pl-3 pr-4 text-[#fbf3e3] opacity-0 shadow-[0_10px_30px_-12px_rgba(16,36,26,0.6)] backdrop-blur-md transition-[opacity,transform] duration-500 md:bottom-7"
      style={{ transform: "translate(-50%, 10px)" }}
    >
      {/* Progres zona tahan: penuh = kamera mulai berpindah ke section berikutnya */}
      <span className="absolute inset-x-3 bottom-[3px] h-[2px] overflow-hidden rounded-full bg-white/15">
        <span ref={bar} className="block h-full w-full origin-left rounded-full bg-[#f5c84c]" style={{ transform: "scaleX(0)" }} />
      </span>
      {touch ? (
        <svg viewBox="0 0 24 24" className="size-5 animate-[hint-up_1.6s_ease-in-out_infinite]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 14l6-6 6 6" />
        </svg>
      ) : (
        <span className="relative block h-[26px] w-[17px] rounded-full border-2 border-[#fbf3e3]/90">
          <span className="absolute left-1/2 top-[5px] block h-[6px] w-[3px] -translate-x-1/2 animate-[hint-wheel_1.6s_ease-in-out_infinite] rounded-full bg-[#f5c84c]" />
        </span>
      )}
      <span className="font-mono text-[11px] uppercase tracking-[0.12em]">{touch ? touchLabel : label}</span>
      <style>{`
        @keyframes hint-wheel { 0% { transform: translate(-50%, 0); opacity: 1 } 70% { transform: translate(-50%, 8px); opacity: 0 } 100% { transform: translate(-50%, 0); opacity: 0 } }
        @keyframes hint-up { 0%,100% { transform: translateY(3px) } 50% { transform: translateY(-3px) } }
      `}</style>
    </div>
  );
}
