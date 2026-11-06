"use client";

// Pil di tengah bawah layar, muncul saat kamera diam di sebuah perhentian (bukan di footer):
// - tombol "Buka catatan" (bila section punya catatan/layar) → membuka popup benda utama section itu;
// - ajakan scroll: ikon mouse dengan roda bergerak (desktop) atau panah naik (layar sentuh).
import { useEffect, useRef, useState } from "react";
import type { DeskDrive } from "./deskScroll";
import { DESK_STOPS } from "./stops";
import { popup } from "./popup";

const MONITOR = new Set(["sonar", "promptedsite", "viralengine", "security"]);
const primaryKey = (id: string) => (MONITOR.has(id) ? "monitor" : id);

export function ScrollHint({
  f,
  count,
  label,
  touchLabel,
  read,
  screen,
  enabled,
}: {
  f: DeskDrive;
  count: number;
  label: string;
  touchLabel: string;
  read: string;
  screen: string;
  enabled: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const [touch, setTouch] = useState(false);
  const [stop, setStop] = useState<string | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const on = () => setTouch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    let raf = 0;
    let last: string | null = "";
    const tick = () => {
      const d = el.current;
      if (d) {
        const main = document.querySelector("main");
        const end = main ? main.offsetTop + main.offsetHeight - window.innerHeight : Infinity;
        const show = enabled && f.hold >= 0 && window.scrollY < end + 4 && count > 0 && !popup.get().open;
        d.style.opacity = show ? "1" : "0";
        d.style.transform = `translate(-50%, ${show ? 0 : 10}px)`;
        d.style.visibility = show ? "visible" : "hidden";
        const id = show ? DESK_STOPS[Math.round(f.current)]?.id ?? null : null;
        const key = id && popup.hasPrimary(primaryKey(id)) ? id : null;
        if (key !== last) {
          last = key;
          setStop(key);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [f, count, enabled]);

  return (
    <div
      ref={el}
      className="pointer-events-none fixed bottom-5 left-1/2 z-40 flex items-center gap-2 opacity-0 transition-[opacity,transform] duration-500 md:bottom-7"
      style={{ transform: "translate(-50%, 10px)", visibility: "hidden" }}
    >
      {stop && (
        <button
          onClick={() => popup.openPrimary(primaryKey(stop))}
          className="pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[#1d3a2b] bg-[#f5c84c] py-2 pl-3 pr-4 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1d3a2b] shadow-[0_10px_30px_-12px_rgba(16,36,26,0.6)] transition hover:bg-[#1d3a2b] hover:text-[#f5c84c]"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {stop === "about" ? <path d="M15 3h6v6M21 3l-8 8M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /> : <path d="M4 4h16v11l-5 5H4zM15 20v-5h5" />}
          </svg>
          {stop === "about" ? screen : read}
        </button>
      )}
      <div
        aria-hidden
        className="flex items-center gap-2.5 rounded-full border border-white/15 bg-[#1d3a2b]/85 py-2 pl-3 pr-4 text-[#fbf3e3] shadow-[0_10px_30px_-12px_rgba(16,36,26,0.6)] backdrop-blur-md"
      >
        {touch ? (
          <svg viewBox="0 0 24 24" className="size-5 animate-[hint-up_1.6s_ease-in-out_infinite]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 14l6-6 6 6" />
          </svg>
        ) : (
          <span className="relative block h-[26px] w-[17px] rounded-full border-2 border-[#fbf3e3]/90">
            <span className="absolute left-1/2 top-[5px] block h-[6px] w-[3px] -translate-x-1/2 animate-[hint-wheel_1.6s_ease-in-out_infinite] rounded-full bg-[#f5c84c]" />
          </span>
        )}
        <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] max-sm:hidden">{touch ? touchLabel : label}</span>
      </div>
      <style>{`
        @keyframes hint-wheel { 0% { transform: translate(-50%, 0); opacity: 1 } 70% { transform: translate(-50%, 8px); opacity: 0 } 100% { transform: translate(-50%, 0); opacity: 0 } }
        @keyframes hint-up { 0%,100% { transform: translateY(3px) } 50% { transform: translateY(-3px) } }
      `}</style>
    </div>
  );
}
