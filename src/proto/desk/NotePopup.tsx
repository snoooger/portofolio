"use client";

// Popup catatan sebuah section. Hanya post-it/kartu itu sendiri yang tampil (tanpa kotak keterangan
// lain): diterbangkan dari posisinya di adegan 3D ke tengah layar (benda aslinya disembunyikan), lalu
// tombol ‹ › berpindah antarcatatan section itu (bergeser seperti lembar kertas ditukar), dan tombol
// tutup / Esc / klik latar menerbangkannya kembali ke tempatnya. Tiap gerakan diiringi suara kertas.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { popup, type Entry } from "./popup";
import type { Copy } from "./copy";
import { paperSfx } from "./sfx";

const lenisOf = () => (window as unknown as { __lenis?: Lenis }).__lenis;
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";
const CTRL = 78;

type Layout = { cx: number; cy: number; W: number; H: number };

function layoutFor(aspect: number, vw: number, vh: number): Layout {
  const top = vw < 640 ? 70 : 84;
  const maxW = Math.min(vw * 0.9, 700);
  const maxH = vh - top - CTRL - 20;
  let W = maxW, H = W / aspect;
  if (H > maxH) {
    H = maxH;
    W = H * aspect;
  }
  return { cx: vw / 2, cy: top + (vh - CTRL - top) / 2, W, H };
}

type Quad = { cx: number; cy: number; w: number; h: number; angle: number };
const fromQuad = (q: Quad, L: Layout) =>
  `translate(${q.cx - L.cx}px, ${q.cy - L.cy}px) rotate(${q.angle}rad) scale(${q.w / L.W}, ${q.h / L.H})`;
const restOf = (e: Entry) => (e.item.kind === "screen" ? "none" : `rotate(${e.page % 2 ? 1 : -1.2}deg)`);
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type View = { stop: string; entries: Entry[]; index: number; dir: number; mode: "fly" | "slide"; seq: number };

export function NotePopup({ copy }: { copy: Copy }) {
  const [view, setView] = useState<View | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [shown, setShown] = useState(false);
  const fig = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const prevFocus = useRef<Element | null>(null);
  const busy = useRef(false);
  const closing = useRef(false);
  const viewRef = useRef<View | null>(null);
  const layoutRef = useRef<Layout | null>(null);
  // Disinkronkan di layout effect (berjalan sebelum effect animasi di bawah, urutan deklarasi).
  useLayoutEffect(() => {
    viewRef.current = view;
    layoutRef.current = layout;
  });

  const close = () => {
    const v = viewRef.current, L = layoutRef.current;
    if (!v || !L || closing.current) return;
    closing.current = true;
    busy.current = true;
    setShown(false);
    const e = v.entries[v.index];
    const done = () => {
      e.item.setHidden(false);
      paperSfx("drop");
      busy.current = false;
      closing.current = false;
      setView(null);
      setLayout(null);
      lenisOf()?.start();
      (prevFocus.current as HTMLElement | null)?.focus?.({ preventScroll: true });
      popup.closed();
    };
    const q = e.item.quad();
    const el = fig.current;
    if (!el || !q || reduced()) return done();
    const from = getComputedStyle(el).transform;
    el.getAnimations().forEach((a) => a.cancel());
    el.animate([{ transform: from === "none" ? "none" : from, opacity: 1 }, { transform: fromQuad(q, L), opacity: 1 }], { duration: 520, easing: EASE_IN_OUT, fill: "both" }).onfinish = done;
  };

  const go = (d: number) => {
    const v = viewRef.current;
    if (!v || busy.current) return;
    const next = v.index + d;
    if (next < 0 || next >= v.entries.length) return;
    busy.current = true;
    paperSfx("flip");
    const cur = v.entries[v.index], ne = v.entries[next];
    const swap = () => {
      if (ne.item !== cur.item) cur.item.setHidden(false);
      setLayout(layoutFor(ne.item.aspect(), window.innerWidth, window.innerHeight));
      setView({ ...v, index: next, dir: d, mode: "slide", seq: v.seq + 1 });
    };
    const el = fig.current;
    if (!el || reduced()) return swap();
    const from = getComputedStyle(el).transform;
    el.getAnimations().forEach((a) => a.cancel());
    el.animate(
      [
        { transform: from === "none" ? "none" : from, opacity: 1 },
        { transform: `translateX(${-d * 90}px) rotate(${-d * 6}deg) scale(0.94)`, opacity: 0 },
      ],
      { duration: 220, easing: "cubic-bezier(0.5, 0, 0.75, 0)", fill: "both" },
    ).onfinish = swap;
  };

  // Section dibuka / diminta tutup dari luar
  useEffect(
    () =>
      popup.subscribe(() => {
        const o = popup.get();
        if (o && !viewRef.current) {
          prevFocus.current = document.activeElement;
          const v: View = { stop: o.stop, entries: o.entries, index: o.start, dir: 0, mode: "fly", seq: 1 };
          viewRef.current = v;
          setView(v);
          setLayout(layoutFor(o.entries[o.start].item.aspect(), window.innerWidth, window.innerHeight));
          lenisOf()?.stop();
          paperSfx("lift");
        } else if (o && popup.closeRequested()) close();
      }),
     
    [],
  );

  // Gambar halaman aktif + animasi masuk (terbang dari benda, atau bergeser dari samping)
  const seq = view?.seq;
  useLayoutEffect(() => {
    const v = viewRef.current, L = layoutRef.current;
    if (!v || !L || !fig.current || !cv.current) return;
    const e = v.entries[v.index];
    const src = e.item.pages()[e.page];
    const c = cv.current;
    if (src) {
      const s = src as { naturalWidth?: number; naturalHeight?: number; width: number; height: number };
      c.width = s.naturalWidth || s.width;
      c.height = s.naturalHeight || s.height;
      c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
    }
    e.item.setHidden(true);
    const rest = restOf(e);
    const el = fig.current;
    el.getAnimations().forEach((a) => a.cancel());
    const q = v.mode === "fly" ? e.item.quad() : null;
    if (reduced()) {
      el.style.transform = rest;
      busy.current = false;
    } else if (v.mode === "fly" && q) el.animate([{ transform: fromQuad(q, L) }, { transform: rest }], { duration: 640, easing: EASE_OUT, fill: "both" });
    else
      el.animate(
        [
          { transform: `translateX(${v.dir * 90}px) rotate(${v.dir * 6}deg) scale(0.94)`, opacity: 0 },
          { transform: rest, opacity: 1 },
        ],
        { duration: 340, easing: EASE_OUT, fill: "both" },
      ).onfinish = () => (busy.current = false);
    if (v.mode === "fly") {
      const t = window.setTimeout(() => setShown(true), 160);
      closeBtn.current?.focus({ preventScroll: true });
      return () => window.clearTimeout(t);
    }
  }, [seq]);

  // Keyboard: Esc tutup, ←/→ pindah catatan, Tab berputar di dalam dialog
  useEffect(() => {
    if (!view) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        const root = fig.current?.parentElement;
        const els = root ? Array.from(root.querySelectorAll<HTMLElement>("a[href],button:not([disabled])")) : [];
        if (!els.length) return;
        const i = els.indexOf(document.activeElement as HTMLElement);
        const n = e.shiftKey ? (i <= 0 ? els.length - 1 : i - 1) : i === els.length - 1 ? 0 : i + 1;
        els[n].focus();
      } else return;
      e.preventDefault();
      e.stopPropagation();
    };
    const onResize = () => {
      const v = viewRef.current;
      if (v) setLayout(layoutFor(v.entries[v.index].item.aspect(), window.innerWidth, window.innerHeight));
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", onResize);
    };
  });

  if (!view || !layout) return null;
  const e = view.entries[view.index];
  const screen = e.item.kind === "screen";
  const n = view.entries.length;
  const cta = copy.summary[view.stop]?.cta;
  const btn =
    "grid size-12 place-items-center rounded-full bg-[#fbf7f1] text-ink shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] transition hover:bg-[#f5c84c] disabled:opacity-35 disabled:hover:bg-[#fbf7f1]";
  return (
    <div role="dialog" aria-modal="true" aria-label={e.item.alt(e.page).split(".")[0]} className="fixed inset-0 z-[55]">
      <div onClick={close} className={`absolute inset-0 bg-[#1e1b18]/55 backdrop-blur-[3px] transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-0"}`} />
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
          background: e.item.color?.() ?? (screen ? "#000" : "#fbf7f1"),
          boxShadow: screen ? "0 0 0 6px #1c1c1e, 0 40px 90px -20px rgba(0,0,0,0.7)" : "0 36px 80px -24px rgba(0,0,0,0.6), 0 6px 14px rgba(0,0,0,0.18)",
        }}
      >
        <canvas ref={cv} aria-hidden className="block size-full" />
      </div>
      <p className="sr-only" aria-live="polite">
        {`${view.index + 1} / ${n}. ${e.item.alt(e.page)}`}
      </p>

      {/* Navigasi catatan: ‹  2 / 5  › (+ tautan situs untuk proyek yang live) */}
      <div
        className={`absolute left-1/2 flex -translate-x-1/2 items-center gap-3 transition-[opacity,translate] duration-500 ${shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        style={{ top: layout.cy + layout.H / 2 + 18 }}
      >
        <button onClick={() => go(-1)} disabled={view.index === 0} aria-label={copy.popup.prev} className={btn}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="min-w-14 rounded-full bg-[#1d3a2b] px-3 py-2 text-center font-mono text-[12px] tabular-nums text-[#fbf3e3]">
          {view.index + 1} / {n}
        </span>
        <button onClick={() => go(1)} disabled={view.index === n - 1} aria-label={copy.popup.next} className={btn}>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {cta && (
          <a
            href={cta.href}
            target="_blank"
            rel="noopener"
            className="ml-1 inline-flex h-12 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-[#1d3a2b] bg-[#f5c84c] px-4 text-[13px] font-semibold text-[#1d3a2b] transition-colors hover:bg-[#1d3a2b] hover:text-[#f5c84c]"
          >
            {cta.href.replace("https://", "")}
            <span aria-hidden>↗</span>
          </a>
        )}
      </div>

      <button
        ref={closeBtn}
        onClick={close}
        aria-label={copy.popup.close}
        className={`absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-[#fbf7f1] text-ink shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] transition-[opacity,scale,background-color] duration-300 hover:bg-[#f5c84c] md:right-8 md:top-8 ${shown ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
