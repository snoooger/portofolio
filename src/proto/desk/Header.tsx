"use client";

// Header prototipe meja: satu bilah kaca hijau tua (senada footer) yang melayang di atas scene. Kiri wordmark nama,
// tengah navigasi dengan penanda section aktif (mengikuti scroll), kanan toggle bahasa EN/ID.
// Garis progres tipis di bawah bilah menunjukkan posisi di sepanjang perjalanan meja.
// Di HP navigasi pindah ke menu tarik-turun.
import { useEffect, useRef, useState } from "react";
import type { Drive } from "../objects/types";
import type { Copy, Lang } from "./copy";
import { NAME } from "./copy";
import { deskIndex } from "./stops";

/** Rentang perhentian tiap item navigasi (Work = FarmAgent … Security, Experience = pengalaman … pendidikan). */
const NAV = [
  { id: "about", key: "about", from: deskIndex("about"), to: deskIndex("about") },
  { id: "farmagent", key: "work", from: deskIndex("farmagent"), to: deskIndex("security") },
  { id: "skills", key: "skills", from: deskIndex("skills"), to: deskIndex("skills") },
  { id: "experience", key: "experience", from: deskIndex("experience"), to: deskIndex("education") },
  { id: "contact", key: "contact", from: deskIndex("contact"), to: deskIndex("contact") },
] as const;

export function DeskHeader({
  f,
  count,
  copy,
  lang,
  setLang,
  goTo,
}: {
  f: Drive;
  count: number;
  copy: Copy;
  lang: Lang;
  setLang: (l: Lang) => void;
  goTo: (id: string) => void;
}) {
  const items = NAV.map((n) => ({ id: n.id, label: copy.nav[n.key] }));
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let last = -2;
    const tick = () => {
      const k = Math.round(f.current);
      const i = NAV.findIndex((it) => k >= it.from && k <= it.to);
      if (i !== last) {
        last = i;
        setActive(i);
      }
      if (bar.current) bar.current.style.transform = `scaleX(${f.current / (count - 1)})`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [f, count]);

  const go = (id: string) => {
    setOpen(false);
    goTo(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-6 md:pt-5">
      <div className="relative mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 overflow-hidden rounded-full border border-white/10 bg-[#1d3a2b]/85 pl-1.5 pr-1.5 text-[#fbf3e3] shadow-[0_10px_34px_-12px_rgba(16,36,26,0.6)] backdrop-blur-md md:h-14 md:pl-2 md:pr-2">
        {/* Identitas */}
        {/* Wordmark saja (tanpa logo): nama serif + titik aksen terakota */}
        <button onClick={() => go("hero")} className="flex min-w-0 items-center gap-2 rounded-full py-1 pl-4 pr-3 text-left transition hover:bg-white/5">
          <span className="min-w-0">
            <span className="block truncate font-display text-[19px] leading-none md:text-[22px]">
              {NAME}
              <span className="text-[#f5c84c]">.</span>
            </span>
            <span className="mt-1 hidden truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#fbf3e3]/60 lg:block">{copy.role}</span>
          </span>
        </button>

        {/* Navigasi (desktop) */}
        <nav className="hidden items-center gap-0.5 rounded-full bg-white/[0.06] p-1 md:flex">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => go(it.id)}
              aria-current={active === i ? "true" : undefined}
              className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition ${
                active === i ? "bg-[#f5c84c] text-[#1d3a2b] shadow-sm" : "text-[#fbf3e3]/70 hover:bg-white/10 hover:text-[#fbf3e3]"
              }`}
            >
              {it.label}
            </button>
          ))}
        </nav>

        {/* Bahasa + konsep + menu HP */}
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex rounded-full bg-white/10 p-0.5" role="group" aria-label="Language">
            {(["en", "id"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] transition ${
                  lang === l ? "bg-[#fbf3e3] text-[#1d3a2b] shadow-sm" : "text-[#fbf3e3]/70 hover:text-[#fbf3e3]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Menu"
            className="grid size-9 place-items-center rounded-full bg-[#f5c84c] text-[#1d3a2b] md:hidden"
          >
            <span className="relative block h-2.5 w-4">
              <span className={`absolute left-0 top-0 h-[1.5px] w-4 bg-current transition ${open ? "translate-y-[4.5px] rotate-45" : ""}`} />
              <span className={`absolute bottom-0 left-0 h-[1.5px] w-4 bg-current transition ${open ? "-translate-y-[4.5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>

        {/* Progres sepanjang meja */}
        <span className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-white/10">
          <span ref={bar} className="block h-px origin-left scale-x-0 bg-[#f5c84c]" />
        </span>
      </div>

      {/* Menu HP */}
      <div
        className={`mx-auto mt-2 max-w-5xl origin-top overflow-hidden rounded-3xl border border-white/10 bg-[#1d3a2b]/95 text-[#fbf3e3] shadow-[0_10px_34px_-12px_rgba(16,36,26,0.6)] backdrop-blur-md transition md:hidden ${
          open ? "scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0"
        }`}
      >
        <nav className="flex flex-col p-2">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => go(it.id)}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left font-display text-2xl transition ${
                active === i ? "bg-[#f5c84c] text-[#1d3a2b]" : "hover:bg-white/10"
              }`}
            >
              {it.label}
              <span className="font-mono text-[11px] tracking-[0.08em] opacity-60">0{i + 1}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
