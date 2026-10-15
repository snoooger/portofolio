"use client";

// Lapisan DOM bersama: navigasi atas, kartu proyek editorial, dan penggerak opasitas kartu.
import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import type { ProtoProject } from "./content";
import { me } from "./content";
import { bell } from "./useScrollProgress";

export function ProtoNav({ index, title }: { index: string; title: string }) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-5 pt-5 md:px-8 md:pt-6">
      <div className="pointer-events-auto rounded-2xl bg-paper/85 px-3.5 py-2.5 backdrop-blur">
        <p className="font-display text-xl leading-none">{me.name}</p>
        <p className="mono-label mt-1 text-ink-soft">{me.role}</p>
      </div>
      <p className="mono-label hidden rounded-full border border-ink/15 bg-paper/70 px-3 py-1.5 backdrop-blur md:block">
        <span className="text-terracotta">{index}</span> — {title}
      </p>
      <Link href="/proto" className="mono-label pointer-events-auto rounded-full bg-ink px-3 py-1.5 text-paper transition hover:bg-terracotta">
        ← All concepts
      </Link>
    </header>
  );
}

/** Kartu editorial satu proyek. */
export function ProjectCard({ p, children, tone = "paper" }: { p: ProtoProject; children?: ReactNode; tone?: "paper" | "clear" }) {
  return (
    <article
      className={`relative w-[min(420px,86vw)] rounded-[22px] p-6 md:p-7 ${
        tone === "paper" ? "bg-paper/92 shadow-[0_30px_60px_-30px_rgba(30,27,24,0.45)] ring-1 ring-ink/8 backdrop-blur" : ""
      }`}
    >
      <p className="mono-label flex items-center gap-2 text-ink-soft">
        <span className="text-terracotta">{p.no}</span> / Project
        {p.internal && <span className="rounded-full border border-ink/20 px-2 py-0.5 text-[10px]">internal · described only</span>}
      </p>
      <h2 className="mt-3 font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-[0.95]">{p.name}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{p.line}</p>
      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-ink/10 pt-4">
        {p.facts.map((f) => (
          <div key={f.k}>
            <dt className="font-display text-3xl leading-none text-ink">{f.v}</dt>
            <dd className="mono-label mt-1.5 text-[9.5px] leading-snug text-ink-soft">{f.k}</dd>
          </div>
        ))}
      </dl>
      <p className="mono-label mt-4 text-[10px] text-ink-soft">{p.stack}</p>
      {children}
      <p className="absolute -top-5 right-5 rotate-[3deg] rounded-md bg-[#F4D9A6] px-3 py-1 font-hand text-xl text-ink shadow-md">{p.note}</p>
    </article>
  );
}

/**
 * Kartu-kartu fixed yang muncul hanya saat kamera berhenti di perhentian-nya.
 * `slots[k]` = isi untuk perhentian k (null = kosong), `side` = posisi kartu.
 */
export function StopCards({
  f,
  slots,
  z = "z-30",
  lift = 28,
}: {
  f: { current: number };
  slots: ({ node: ReactNode; side: "left" | "right" | "center" | "bottom" } | null)[];
  z?: string;
  lift?: number;
}) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const tick = () => {
      refs.current.forEach((el, k) => {
        if (!el) return;
        const a = bell(f.current, k);
        el.style.opacity = String(a);
        el.style.transform = `translate3d(0, ${(1 - a) * lift * Math.sign(f.current - k || 1) * -1}px, 0)`;
        el.style.pointerEvents = a > 0.6 ? "auto" : "none";
        el.style.visibility = a < 0.01 ? "hidden" : "visible";
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [f, lift]);

  const pos = {
    left: "left-5 md:left-12 top-1/2 -translate-y-1/2",
    right: "right-5 md:right-12 top-1/2 -translate-y-1/2",
    center: "inset-x-0 top-1/2 -translate-y-1/2 flex justify-center",
    bottom: "inset-x-0 bottom-10 flex justify-center",
  };

  return (
    <>
      {slots.map((s, k) =>
        s ? (
          <div key={k} className={`pointer-events-none fixed ${z} ${pos[s.side]}`}>
            <div
              ref={(el) => {
                refs.current[k] = el;
              }}
              style={{ opacity: 0, visibility: "hidden" }}
            >
              {s.node}
            </div>
          </div>
        ) : null,
      )}
    </>
  );
}

/** Indikator kemajuan: titik per perhentian. */
export function StopDots({ f, count }: { f: { current: number }; count: number }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    const tick = () =>
      refs.current.forEach((el, k) => {
        if (!el) return;
        const a = bell(f.current, k, 0.3, 0.6);
        el.style.transform = `scaleY(${1 + a * 2.2})`;
        el.style.backgroundColor = a > 0.5 ? "var(--terracotta)" : "rgba(30,27,24,0.25)";
      });
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [f]);
  return (
    <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex">
      {Array.from({ length: count }, (_, k) => (
        <span
          key={k}
          ref={(el) => {
            refs.current[k] = el;
          }}
          className="block h-2.5 w-[3px] origin-center rounded-full transition-colors"
        />
      ))}
    </div>
  );
}

export function ScrollHint({ label = "scroll" }: { label?: string }) {
  return (
    <p className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 font-hand text-2xl text-terracotta">
      {label} ↓
    </p>
  );
}
