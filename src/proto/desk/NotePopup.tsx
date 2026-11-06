"use client";

// Popup catatan: salinan gambar post-it/kartu/layar diterbangkan dari posisinya di adegan 3D ke tengah
// layar (benda aslinya disembunyikan selama terbuka), disertai keterangan section. Tombol tutup, klik
// latar, atau Esc → terbang kembali ke posisi benda semula, lalu benda 3D tampil lagi.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { popup, type PopItem, type Quad } from "./popup";
import { summaryFor } from "./content";
import type { Copy } from "./copy";
import { EMAIL, GITHUB, LINKEDIN } from "./copy";

const lenisOf = () => (window as unknown as { __lenis?: Lenis }).__lenis;
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";

type Layout = { cx: number; cy: number; W: number; H: number; cap: { x: number; y: number; w: number } };

function layoutFor(aspect: number, vw: number, vh: number): Layout {
  const wide = vw >= 860;
  const capW = wide ? 340 : Math.min(vw - 40, 460);
  const maxW = wide ? Math.min(vw - capW - 160, 680) : vw * 0.84;
  const maxH = wide ? vh * 0.74 : vh * 0.55;
  let W = maxW, H = W / aspect;
  if (H > maxH) {
    H = maxH;
    W = H * aspect;
  }
  if (wide) {
    const total = W + 48 + capW;
    const x0 = (vw - total) / 2;
    return { cx: x0 + W / 2, cy: vh / 2, W, H, cap: { x: x0 + W + 48, y: vh / 2, w: capW } };
  }
  const cy = Math.max(70, vh * 0.06) + H / 2;
  return { cx: vw / 2, cy, W, H, cap: { x: (vw - capW) / 2, y: cy + H / 2 + 24, w: capW } };
}

const transformFrom = (q: Quad, L: Layout) =>
  `translate(${q.cx - L.cx}px, ${q.cy - L.cy}px) rotate(${q.angle}rad) scale(${q.w / L.W}, ${q.h / L.H})`;

export function NotePopup({ copy }: { copy: Copy }) {
  const [item, setItem] = useState<PopItem | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [shown, setShown] = useState(false);
  const fig = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const prevFocus = useRef<Element | null>(null);
  const closing = useRef(false);

  // Item baru dibuka → siapkan tata letak
  const cur = useRef<PopItem | null>(null);
  useEffect(
    () =>
      popup.subscribe(() => {
        const o = popup.get().open;
        if (!o || o === cur.current) return;
        cur.current = o;
        closing.current = false;
        prevFocus.current = document.activeElement;
        setItem(o);
        setLayout(layoutFor(o.aspect(), window.innerWidth, window.innerHeight));
        lenisOf()?.stop();
      }),
    [],
  );

  // Gambar + animasi terbang masuk
  useLayoutEffect(() => {
    if (!item || !layout || !fig.current || !cv.current) return;
    const src = item.image();
    const c = cv.current;
    if (src) {
      const s = src as { naturalWidth?: number; naturalHeight?: number; width: number; height: number };
      c.width = s.naturalWidth || s.width;
      c.height = s.naturalHeight || s.height;
      c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
    }
    const q = item.quad();
    item.setHidden(true);
    const end = item.kind === "screen" ? "none" : "rotate(-1.2deg)";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (q && !reduce) {
      fig.current.animate([{ transform: transformFrom(q, layout) }, { transform: end }], { duration: 640, easing: EASE_OUT, fill: "both" });
    } else fig.current.style.transform = end;
    const t = window.setTimeout(() => setShown(true), 140);
    closeBtn.current?.focus({ preventScroll: true });
    return () => window.clearTimeout(t);
  }, [item, layout]);

  const close = () => {
    if (!item || !layout || closing.current) return;
    closing.current = true;
    setShown(false);
    const done = () => {
      item.setHidden(false);
      cur.current = null;
      setItem(null);
      setLayout(null);
      popup.close();
      lenisOf()?.start();
      (prevFocus.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
    const q = item.quad();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = fig.current;
    if (!el || !q || reduce) return done();
    const from = getComputedStyle(el).transform;
    el.getAnimations().forEach((a) => a.cancel());
    const a = el.animate([{ transform: from === "none" ? "none" : from }, { transform: transformFrom(q, layout) }], { duration: 520, easing: EASE_IN_OUT, fill: "both" });
    a.onfinish = done;
  };

  // Esc menutup, Tab berputar di dalam dialog
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        const root = fig.current?.parentElement;
        const els = root ? Array.from(root.querySelectorAll<HTMLElement>("a[href],button")) : [];
        if (!els.length) return;
        const i = els.indexOf(document.activeElement as HTMLElement);
        const n = e.shiftKey ? (i <= 0 ? els.length - 1 : i - 1) : i === els.length - 1 ? 0 : i + 1;
        e.preventDefault();
        els[n].focus();
      }
    };
    const onResize = () => setLayout(layoutFor(item.aspect(), window.innerWidth, window.innerHeight));
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", onResize);
    };
  });

  if (!item || !layout) return null;
  const stop = item.stop();
  const card = summaryFor(stop, copy);
  const links = stop === "about" || stop === "contact"
    ? [
        { label: copy.links.email, href: `mailto:${EMAIL}` },
        { label: copy.links.linkedin, href: LINKEDIN },
        { label: copy.links.github, href: GITHUB },
      ]
    : card?.links ?? [];
  const screen = item.kind === "screen";
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="note-title" className="fixed inset-0 z-[55]">
      <div
        onClick={close}
        className={`absolute inset-0 bg-[#1e1b18]/55 backdrop-blur-[3px] transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={fig}
        className="absolute will-change-transform"
        style={{
          left: layout.cx - layout.W / 2,
          top: layout.cy - layout.H / 2,
          width: layout.W,
          height: layout.H,
          borderRadius: screen ? layout.W * 0.135 : 3,
          overflow: "hidden",
          background: item.color?.() ?? (screen ? "#000" : "#fbf7f1"),
          boxShadow: screen ? "0 0 0 6px #1c1c1e, 0 40px 90px -20px rgba(0,0,0,0.7)" : "0 36px 80px -24px rgba(0,0,0,0.6), 0 6px 14px rgba(0,0,0,0.18)",
        }}
      >
        <canvas ref={cv} aria-hidden className="block size-full" />
        <p className="sr-only">{item.alt()}</p>
      </div>
      <aside
        className={`absolute rounded-3xl bg-[#fbf7f1] p-6 text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)] transition-[opacity,transform] duration-500 ${shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        style={{ left: layout.cap.x, top: layout.cap.y, width: layout.cap.w, transform: window.innerWidth >= 860 ? `translateY(-50%)` : undefined }}
      >
        {card && <p className="mono-label text-terracotta">{card.kicker}</p>}
        <h2 id="note-title" className="mt-2 font-display text-[34px] leading-[1.02]">
          {card?.title ?? item.alt()}
        </h2>
        {card?.lines[0] && <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{card.lines[0]}</p>}
        {links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#1d3a2b] bg-[#f5c84c] px-4 py-2 text-[13px] font-semibold text-[#1d3a2b] transition-colors hover:bg-[#1d3a2b] hover:text-[#f5c84c]"
              >
                {l.label}
                <span aria-hidden>↗</span>
              </a>
            ))}
          </div>
        )}
      </aside>
      <button
        ref={closeBtn}
        onClick={close}
        aria-label={copy.popup.close}
        className={`absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-[#fbf7f1] text-ink shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] transition-[opacity,transform,background-color] duration-300 hover:bg-[#f5c84c] md:right-8 md:top-8 ${shown ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
