"use client";

// Footer: terbuka setelah perhentian Contact. Seluruh adegan meja terangkat seperti selembar kertas
// (sudut bawah membulat, pojok kanan tergulung) dan memperlihatkan alas hijau bergrid ala cutting mat
// di bawahnya — berisi CTA, email, tautan, dan kredit. Diletakkan fixed di bawah "kertas" (z lebih rendah).
import { useState } from "react";
import { EMAIL, GITHUB, LINKEDIN, type Copy } from "./copy";

const GREEN = "#1d3a2b";

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <path d={d} />
    </svg>
  );
}
const LINKEDIN_ICON =
  "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.6 4.77 5.98v5.57h-4v-4.94c0-1.18-.02-2.7-1.65-2.7-1.65 0-1.9 1.29-1.9 2.62v5.02h-4v-11Z";
const GITHUB_ICON =
  "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z";

export function DeskFooter({ copy, onTop }: { copy: Copy; onTop: () => void }) {
  const [copied, setCopied] = useState(false);
  const c = copy.cta;
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-0 flex h-[100svh] flex-col overflow-hidden text-[#fbf3e3]"
      style={{
        backgroundColor: GREEN,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
        backgroundSize: "40px 40px, 40px 40px, 200px 200px, 200px 200px",
      }}
    >
      {/* Penggaris di tepi atas, seperti cutting mat */}
      <div className="pointer-events-none absolute inset-x-0 top-[72px] flex justify-between px-[calc(50%-600px)] font-mono text-[10px] text-white/30 max-md:hidden">
        {Array.from({ length: 13 }, (_, i) => (
          <span key={i}>{i * 5}</span>
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 text-center">
        <h2 className="font-display leading-[0.95]">
          <span className="block text-[clamp(52px,9vw,116px)]">{c.a}</span>
          <span className="mt-1 block text-[clamp(38px,6.6vw,92px)] italic text-[#f5c84c]">{c.b}</span>
        </h2>

        {/* Kapsul email + tombol, dengan anotasi tulisan tangan */}
        <div className="relative mt-10 w-full max-w-xl">
          <span className="pointer-events-none absolute -right-2 -top-12 rotate-[-8deg] font-hand text-3xl text-[#f5c84c] max-sm:-top-11 max-sm:right-2 max-sm:text-2xl">
            {c.note}
            <svg viewBox="0 0 60 50" className="absolute -bottom-9 left-1 size-12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <path d="M40 4 C 22 10, 12 22, 14 40" />
              <path d="M6 32 L14 42 L22 33" />
            </svg>
          </span>
          <div className="rounded-[30px] bg-[#fbf7f1] p-2 text-ink shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="truncate text-[17px] text-ink-soft md:text-lg">{EMAIL}</span>
              <button onClick={copyEmail} className="shrink-0 rounded-full border border-ink/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-soft transition hover:border-ink hover:text-ink">
                {copied ? c.copied : c.copy}
              </button>
            </div>
            <a
              href={`mailto:${EMAIL}`}
              className="block rounded-[24px] bg-ink py-4 text-[15px] font-semibold text-paper transition hover:bg-terracotta"
            >
              {c.button}
            </a>
          </div>
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">{c.caption}</p>

        <div className="mt-10 flex items-center gap-3">
          <a href={LINKEDIN} target="_blank" rel="noopener" aria-label="LinkedIn" className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-[#f5c84c] hover:text-ink">
            <Icon d={LINKEDIN_ICON} />
          </a>
          <a href={GITHUB} target="_blank" rel="noopener" aria-label="GitHub" className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-[#f5c84c] hover:text-ink">
            <Icon d={GITHUB_ICON} />
          </a>
          <button onClick={onTop} className="ml-2 rounded-full bg-white/10 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] transition hover:bg-[#f5c84c] hover:text-ink">
            ↑ {c.top}
          </button>
        </div>
      </div>

      <div className="relative px-5 pb-5 text-center text-white/45">
        <p className="text-[12px]">{copy.footer}</p>
        <p className="mx-auto mt-1 max-w-4xl text-[10px] leading-snug text-white/30">{copy.credits}</p>
      </div>
    </footer>
  );
}
