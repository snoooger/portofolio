"use client";

// Prototipe final konsep meja (lanjutan P1). DOM hanya untuk navigasi, bahasa, loader, dan footer;
// semua penjelasan ada di post-it di dalam scene.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import type Lenis from "lenis";
import { useProgress } from "@react-three/drei";
import { Stage } from "../Stage";
import { StopDots } from "../ui";
import { scrollToStop } from "../ProtoScroll";
import { DeskScene } from "./DeskScene";
import { DESK_STOPS, deskIndex } from "./stops";
import { COPY, type Lang } from "./copy";
import { DeskHeader } from "./Header";
import { SeoContent } from "./SeoContent";
import { DeskFooter } from "./Footer";
import { Logo } from "./Logo";
import { ScrollHint } from "./ScrollHint";
import { RenderLoop } from "./RenderLoop";
import { STOP_SVH, stopY, useDeskScroll } from "./deskScroll";
import { QUALITY, detectTier, lowerTier, type Tier } from "./quality";

const N = DESK_STOPS.length;
const FARM = deskIndex("farmagent");
/** Layar HP di rak FarmAgent terus menggulir selama perhentian itu terlihat. */
const farmBusy = (v: number) => v > FARM - 0.5 && v < FARM + 0.8;
const clampInt = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Tier perangkat dideteksi sekali di klien (null saat render server).
let detected: Tier | null = null;
const tierSnapshot = () => (detected ??= detectTier());
const noSubscribe = () => () => {};

/** Tier aktif: hasil deteksi, bisa diturunkan saat FPS jatuh. */
function useTier() {
  const base = useSyncExternalStore(noSubscribe, tierSnapshot, () => null);
  const [drops, setDrops] = useState(0);
  let tier = base;
  for (let i = 0; tier && i < drops; i++) tier = lowerTier(tier);
  // Tier yang dipaksa lewat ?q= tidak diturunkan (untuk pengujian).
  const decline = () => {
    if (!new URLSearchParams(window.location.search).has("q")) setDrops((d) => Math.min(2, d + 1));
  };
  return { base, tier, decline };
}

export function DeskProto() {
  const root = useRef<HTMLElement>(null);
  // Scroll jacking berbasis scroll: zona tahan di tiap perhentian + batas momentum (lihat deskScroll.ts).
  const drive = useDeskScroll(root, N);
  const f = drive;
  const [lang, setLang] = useState<Lang>("en");
  const copy = COPY[lang];
  const goTo = (id: string) => scrollToStop(root.current, deskIndex(id), N);
  const sheet = useRef<HTMLDivElement>(null);
  const curl = useRef<HTMLDivElement>(null);
  const lenisOf = () => (window as unknown as { __lenis?: Lenis }).__lenis;
  /** Batas scroll: akhir perjalanan meja (perhentian terakhir) dan dasar halaman (footer terbuka penuh). */
  const bounds = () => {
    const el = root.current!;
    return { end: el.offsetTop + el.offsetHeight - window.innerHeight, max: document.documentElement.scrollHeight - window.innerHeight };
  };
  const openFooter = () => lenisOf()?.scrollTo(bounds().max, { duration: 1.2 });
  const [ready, setReady] = useState(false);
  const { active: loading } = useProgress();
  const { base, tier, decline } = useTier();
  const q = tier ? QUALITY[tier] : null;

  // Tombol keyboard (panah, PageUp/Down, spasi): satu tekan = satu perhentian (N = footer).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(t.tagName))) return;
      const dir = ["ArrowDown", "PageDown", " "].includes(e.key) ? (e.shiftKey && e.key === " " ? -1 : 1) : ["ArrowUp", "PageUp"].includes(e.key) ? -1 : 0;
      const el = root.current, lenis = lenisOf();
      if (!dir || !el || !lenis) return;
      e.preventDefault();
      const cur = window.scrollY > bounds().end + 4 ? N : Math.round(f.current);
      const k = clampInt(cur + dir, 0, N);
      if (k !== cur) lenis.scrollTo(stopY(el, k, N), { duration: 1.0, lock: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [f]);

  // "Kertas" meja terangkat mengikuti scroll setelah perhentian terakhir, memperlihatkan footer.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = sheet.current;
      if (el && root.current) {
        const { end, max } = bounds();
        const over = Math.max(0, Math.min(window.scrollY - end, max - end));
        const t = max > end ? over / (max - end) : 0;
        el.style.transform = over > 0 ? `translate3d(0, ${-over}px, 0)` : "";
        el.style.borderBottomLeftRadius = el.style.borderBottomRightRadius = `${Math.min(1, t * 6) * 36}px`;
        el.style.boxShadow = over > 0 ? `0 30px 70px rgba(0,0,0,${0.45 * Math.min(1, t * 4)})` : "";
        if (curl.current) curl.current.style.opacity = String(Math.min(1, t * 5));
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
    <main ref={root} style={{ height: `${N * STOP_SVH}svh` }}>
      <div ref={sheet} className="fixed inset-0 z-10 overflow-hidden bg-cream will-change-transform" aria-hidden>
        {q && (
          <Stage
            env="/assets-3d/hdri/museum_of_ethnography_1k.hdr"
            camera={{ fov: 45, position: DESK_STOPS[0].pos, near: 0.02, far: 60 }}
            dpr={q.dpr}
            // Tipe peta bayangan ditetapkan sekali dari tier awal: high = PCF + PCSS, mid/low = VSM lembut.
            shadows={QUALITY[base!].soft ? true : "variance"}
            antialias={q.antialias}
            toneMapping={THREE.NeutralToneMapping /* warna lebih natural & dalam daripada ACES */}
            exposure={0.9}
            envIntensity={0.5}
            frameloop="demand"
          >
            {/* Render hanya saat ada perubahan; FPS rata-rata terlalu rendah → turunkan tier (maks. dua kali). */}
            <RenderLoop f={f} busy={farmBusy} measure={ready && !loading} onDecline={decline} pokeKey={`${lang}:${tier}:${ready}:${loading}`} />
            <DeskScene f={f} copy={copy} quality={q} onReady={() => setReady(true)} onPhone={openFooter} />
          </Stage>
        )}
        {/* Pojok kanan bawah tergulung saat kertas terangkat */}
        <div
          ref={curl}
          className="pointer-events-none absolute bottom-0 right-0 size-24 opacity-0 md:size-32"
          style={{
            background: "linear-gradient(315deg, transparent 0 46%, rgba(0,0,0,0.18) 50%, #f4efe7 52%, #ffffff 64%, #e6dfd3 78%)",
            borderTopLeftRadius: "100% 100%",
            filter: "drop-shadow(-6px -6px 10px rgba(0,0,0,0.18))",
          }}
        />
      </div>

      <Loader label={copy.loading} ready={ready} />

      <SeoContent copy={copy} />
      <DeskHeader f={f} count={N} copy={copy} lang={lang} setLang={setLang} goTo={goTo} />

      <StopDots f={f} count={N} />
      <ScrollHint f={f} count={N} label={copy.scroll.hint} touchLabel={copy.scroll.touch} enabled={ready} />
    </main>
    {/* Ruang scroll untuk membuka footer di bawah "kertas" */}
    <div aria-hidden style={{ height: "100svh" }} />
    <DeskFooter copy={copy} onTop={() => lenisOf()?.scrollTo(0, { duration: 2 })} />
    </>
  );
}

/** Layar pemuatan: logo terisi "cairan" dari bawah mengikuti persentase, angka persen di bawahnya. */
function Loader({ label, ready }: { label: string; ready: boolean }) {
  const { active, progress } = useProgress();
  const [gone, setGone] = useState(false);
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  // Hilang hanya setelah adegan benar-benar ter-render (ready) dan tidak ada unduhan aktif.
  const idle = ready && !active;
  // Unduhan = 0–90%, menyiapkan adegan (font, tekstur, shader) = 90–100%. Angka naik halus, tidak loncat.
  const target = idle ? 100 : Math.min(90, progress * 0.9);
  useEffect(() => {
    let raf = 0;
    let v = shownRef.current;
    const tick = () => {
      v = Math.abs(target - v) < 0.4 ? target : v + (target - v) * 0.08;
      shownRef.current = v;
      setShown(v);
      if (v !== target) raf = requestAnimationFrame(tick); // berhenti setelah sampai target
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  const done = idle && shown >= 99.5;
  const cloud = useRef<HTMLCanvasElement>(null);
  const [dissolving, setDissolving] = useState<false | "cloud" | "fade">(false);
  // Selesai → latar krem "terurai" seperti awan: gumpalan lembut terbuka dari tengah ke tepi.
  useEffect(() => {
    if (!done) return;
    const c = cloud.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!c || reduce) {
      setDissolving("fade");
      const t = window.setTimeout(() => setGone(true), 500);
      return () => window.clearTimeout(t);
    }
    const stop = cloudDissolve(c, 1700, () => setGone(true));
    setDissolving("cloud");
    return stop;
  }, [done]);
  if (gone) return null;
  return (
    <div
      className={`fixed inset-0 z-50 grid place-items-center ${dissolving ? "pointer-events-none" : "bg-cream"} ${dissolving === "fade" ? "opacity-0 transition-opacity duration-500" : ""}`}
    >
      <canvas ref={cloud} aria-hidden className="absolute inset-0 size-full" />
      <div
        className={`relative flex flex-col items-center text-center transition-[opacity,transform,filter] duration-500 ease-out ${dissolving ? "scale-110 opacity-0 blur-sm" : ""}`}
      >
        <Logo size={112} fill={shown / 100} className="drop-shadow-[0_18px_30px_rgba(30,27,24,0.18)]" />
        <p className="mt-6 font-display text-5xl leading-none tabular-nums">
          {Math.round(shown)}
          <span className="text-terracotta">%</span>
        </p>
        <p className="mono-label mt-3 text-ink-soft">{label}</p>
      </div>
    </div>
  );
}

/**
 * Latar krem pemuat terurai seperti awan: kanvas diisi krem, lalu puluhan gumpalan lembut (gradasi radial)
 * "dihapus" dan membesar bertahap dari tengah ke tepi, dengan tepi gumpalan sedikit lebih terang
 * (kesan volume awan). Kanvas digambar ulang tiap frame selama `ms`, lalu `onEnd`.
 */
function cloudDissolve(c: HTMLCanvasElement, ms: number, onEnd: () => void) {
  const dpr = Math.min(1.5, window.devicePixelRatio || 1); // gradasi lembut tidak butuh resolusi penuh
  const W = window.innerWidth, H = window.innerHeight;
  c.width = Math.round(W * dpr);
  c.height = Math.round(H * dpr);
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const big = Math.max(W, H);
  const step = big / 7;
  const puffs: { x: number; y: number; r: number; delay: number }[] = [];
  for (let y = -step / 2; y < H + step; y += step * 0.8)
    for (let x = -step / 2; x < W + step; x += step * 0.8) {
      const px = x + (rnd() - 0.5) * step * 0.7, py = y + (rnd() - 0.5) * step * 0.7;
      const d = Math.hypot(px - W / 2, py - H / 2) / Math.hypot(W / 2, H / 2);
      puffs.push({ x: px, y: py, r: step * (0.9 + rnd() * 0.6), delay: d * 0.5 + rnd() * 0.14 });
    }
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const t0 = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const T = (now - t0) / ms;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, W, H);
    if (T >= 1) return onEnd();
    ctx.fillStyle = "#f2ebe1";
    ctx.fillRect(0, 0, W, H);
    const grow = puffs.map((p) => ({ p, k: ease(Math.min(1, Math.max(0, (T - p.delay) / 0.42))) })).filter((g) => g.k > 0);
    // Tepi awan sedikit terang
    for (const { p, k } of grow) {
      const r = p.r * k * 1.25;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0.55, "rgba(255,255,255,0)");
      g.addColorStop(0.8, `rgba(255,255,255,${0.4 * (1 - T)})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
    }
    // Inti gumpalan menghapus krem → adegan terlihat dari baliknya
    ctx.globalCompositeOperation = "destination-out";
    for (const { p, k } of grow) {
      const r = p.r * k;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.5, "rgba(0,0,0,0.9)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
    }
    // Sisa tipis memudar total di akhir
    if (T > 0.75) {
      ctx.fillStyle = `rgba(0,0,0,${(T - 0.75) / 0.25})`;
      ctx.fillRect(0, 0, W, H);
    }
    raf = requestAnimationFrame(frame);
  };
  // Frame pertama digambar sinkron supaya tidak ada kedip saat latar div dilepas.
  frame(t0);
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
