"use client";

// Prototipe final konsep meja (lanjutan P1). DOM hanya untuk navigasi, bahasa, loader, dan footer;
// semua penjelasan ada di post-it di dalam scene.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import type Lenis from "lenis";
import { PerformanceMonitor, useProgress } from "@react-three/drei";
import { Stage } from "../Stage";
import { StopDots } from "../ui";
import { useStops } from "../useScrollProgress";
import { scrollToStop } from "../ProtoScroll";
import { DeskScene } from "./DeskScene";
import { DESK_STOPS, deskIndex } from "./stops";
import { COPY, NAME, type Lang } from "./copy";
import { DeskHeader } from "./Header";
import { SeoContent } from "./SeoContent";
import { DeskFooter } from "./Footer";
import { QUALITY, detectTier, lowerTier, type Tier } from "./quality";

const N = DESK_STOPS.length;
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
  const f = useStops(root, N);
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
  const { base, tier, decline } = useTier();
  const q = tier ? QUALITY[tier] : null;

  // Snap lembut ke perhentian terdekat setelah scroll berhenti, supaya tulisan sempat terbaca.
  useEffect(() => {
    let timer = 0;
    let lenis: Lenis | undefined;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        // Jangan snap di tengah scroll terprogram (klik navigasi); frame lambat di HP bisa memicu timer.
        if (lenis?.isScrolling === "smooth") return;
        // Di antara meja & footer: lengkapi ke salah satunya.
        const { end, max } = bounds();
        if (window.scrollY > end + 4 && window.scrollY < max - 4) {
          lenis?.scrollTo(window.scrollY - end > (max - end) / 2 ? max : end, { duration: 0.8 });
          return;
        }
        const k = Math.round(f.current);
        if (Math.abs(f.current - k) > 0.03) scrollToStop(root.current, k, N);
      }, 220);
    };

    // Satu gestur = satu section. Setelah tiba, input diabaikan sejenak (DWELL) supaya isi section
    // sempat terbaca sebelum bisa lanjut. Roda mouse, swipe sentuh, dan tombol keyboard.
    const DWELL = 650, TRAVEL = 1.0;
    const step = { busy: false, until: 0, acc: 0 };
    const go = (dir: number) => {
      const el = root.current;
      if (!el || !lenis) return;
      const now = performance.now();
      if (step.busy || now < step.until) return;
      // Indeks 0…N−1 = perhentian meja, N = footer.
      const { end, max } = bounds();
      const cur = window.scrollY > end + 4 ? N : Math.round(f.current);
      const k = clampInt(cur + dir, 0, N);
      if (k === cur && (k === N || Math.abs(f.current - k) < 0.03)) return;
      step.busy = true;
      const y = k === N ? max : el.offsetTop + ((el.offsetHeight - window.innerHeight) * k) / (N - 1);
      lenis.scrollTo(y, {
        duration: TRAVEL,
        lock: true,
        onComplete: () => {
          step.busy = false;
          step.until = performance.now() + (k === 0 ? 250 : DWELL);
          step.acc = 0;
        },
      });
    };
    const virtualScroll = ({ deltaY, event }: { deltaY: number; event: Event }) => {
      if ((event as WheelEvent).ctrlKey || deltaY === 0) return true; // zoom, tap & klik tetap jalan
      if (event.cancelable) event.preventDefault(); // tahan scroll bawaan (termasuk sentuh)
      if (step.busy || performance.now() < step.until) return false;
      step.acc += deltaY;
      if (Math.abs(step.acc) >= (event.type.startsWith("touch") ? 24 : 14)) {
        go(Math.sign(step.acc));
        step.acc = 0;
      }
      return false;
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(t.tagName))) return;
      const dir = ["ArrowDown", "PageDown", " "].includes(e.key) ? (e.shiftKey && e.key === " " ? -1 : 1) : ["ArrowUp", "PageUp"].includes(e.key) ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      go(dir);
    };

    const attach = window.setInterval(() => {
      lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
      if (lenis) {
        lenis.on("scroll", onScroll);
        lenis.options.virtualScroll = virtualScroll;
        window.addEventListener("keydown", onKey);
        window.clearInterval(attach);
      }
    }, 100);
    return () => {
      window.clearInterval(attach);
      window.clearTimeout(timer);
      lenis?.off("scroll", onScroll);
      if (lenis) lenis.options.virtualScroll = undefined;
      window.removeEventListener("keydown", onKey);
    };
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
    <main ref={root} style={{ height: `${N * 140}svh` }}>
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
          >
            {/* FPS rata-rata terlalu rendah beberapa kali berturut-turut → turunkan tier (maks. dua kali). */}
            {ready && <PerformanceMonitor flipflops={3} bounds={() => [36, 58]} onDecline={decline} />}
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

      <Loader kicker={copy.portfolio} title={NAME} label={copy.loading} ready={ready} />

      <SeoContent copy={copy} />
      <DeskHeader f={f} count={N} copy={copy} lang={lang} setLang={setLang} goTo={goTo} />

      <StopDots f={f} count={N} />
    </main>
    {/* Ruang scroll untuk membuka footer di bawah "kertas" */}
    <div aria-hidden style={{ height: "100svh" }} />
    <DeskFooter copy={copy} onTop={() => lenisOf()?.scrollTo(0, { duration: 2 })} />
    </>
  );
}

/** Layar pemuatan selama model, tekstur & HDRI diunduh. */
function Loader({ kicker, title, label, ready }: { kicker: string; title: string; label: string; ready: boolean }) {
  const { active, progress } = useProgress();
  const [gone, setGone] = useState(false);
  // Hilang hanya setelah adegan benar-benar ter-render (ready) dan tidak ada unduhan aktif.
  const idle = ready && !active;
  useEffect(() => {
    if (!idle) return;
    const t = window.setTimeout(() => setGone(true), 900);
    return () => window.clearTimeout(t);
  }, [idle]);
  if (gone) return null;
  return (
    <div className={`fixed inset-0 z-50 grid place-items-center bg-cream transition-opacity duration-500 ${idle ? "opacity-0" : "opacity-100"}`}>
      <div className="w-[min(420px,80vw)] text-center">
        <p className="font-hand text-3xl leading-none text-terracotta">{kicker}</p>
        <p className="mt-1 font-display text-4xl leading-tight">{title}</p>
        <p className="mono-label mt-3 text-ink-soft">{label}</p>
        <div className="mt-5 h-px w-full bg-ink/15">
          <div className="h-px bg-terracotta transition-[width] duration-300" style={{ width: `${Math.round(progress)}%` }} />
        </div>
        <p className="mono-label mt-2 text-ink-soft">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
