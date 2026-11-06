"use client";

// Kerangka halaman meja 3D (dimuat malas — versi ringan tidak mengunduhnya): navigasi, bahasa, musik,
// loader iPhone, popup catatan, footer, dan adegan 3D (Scene3D, chunk terpisah lagi).
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import { scrollToStop } from "../ProtoScroll";
import { DESK_STOPS, deskIndex } from "./stops";
import type { COPY, Lang } from "./copy";
import { DeskHeader } from "./Header";
import { SeoContent } from "./SeoContent";
import { DeskFooter } from "./Footer";
import { ScrollHint } from "./ScrollHint";
import { StopDots } from "./StopDots";
import { NotePopup } from "./NotePopup";
import { unlockSfx } from "./sfx";
import { STOP_SVH, useDeskScroll } from "./deskScroll";
import { QUALITY, type Tier } from "./quality";
import type { IntroState } from "./intro";
import { PhoneSilhouette } from "./PhoneSilhouette";

const Scene3D = lazy(() => import("./Scene3D"));

const N = DESK_STOPS.length;
const FARM = deskIndex("farmagent");
/** Layar HP di rak FarmAgent terus menggulir selama perhentian itu terlihat. */
const farmBusy = (v: number) => v > FARM - 0.5 && v < FARM + 0.8;
const lenisOf = () => (window as unknown as { __lenis?: Lenis }).__lenis;

export default function Desk3D({
  copy,
  lang,
  setLang,
  base,
  tier,
  decline,
  introDone,
  onIntroDone,
  music,
}: {
  copy: (typeof COPY)[Lang];
  lang: Lang;
  setLang: (l: Lang) => void;
  base: Tier | null;
  tier: Tier | null;
  decline: () => void;
  introDone: boolean;
  onIntroDone: () => void;
  music: React.ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const f = useDeskScroll(root, N);
  const goTo = (id: string) => scrollToStop(root.current, deskIndex(id), N);
  const sheet = useRef<HTMLDivElement>(null);
  const curl = useRef<HTMLDivElement>(null);
  /** Batas scroll: akhir perjalanan meja (perhentian terakhir) dan dasar halaman (footer terbuka penuh). */
  const bounds = () => {
    const el = root.current!;
    return { end: el.offsetTop + el.offsetHeight - window.innerHeight, max: document.documentElement.scrollHeight - window.innerHeight };
  };
  const openFooter = useCallback(() => lenisOf()?.scrollTo(document.documentElement.scrollHeight - window.innerHeight, { duration: 1.2 }), []);
  const [ready, setReady] = useState(false);
  const [load, setLoad] = useState({ active: true, progress: 0 });
  const onProgress = useCallback((active: boolean, progress: number) => setLoad({ active, progress }), []);
  const onReady = useCallback(() => setReady(true), []);
  const introRef = useRef<IntroState>({ phase: "hold", t0: 0 });
  const busy = useCallback((v: number) => farmBusy(v) || introRef.current.phase !== "done", []);
  const q = tier ? QUALITY[tier] : null;

  // Audio efek kertas boleh berbunyi setelah interaksi pertama (aturan autoplay browser).
  useEffect(() => {
    const evs = ["pointerdown", "keydown", "touchend"] as const;
    const on = () => {
      unlockSfx();
      evs.forEach((e) => window.removeEventListener(e, on, true));
    };
    evs.forEach((e) => window.addEventListener(e, on, { capture: true, passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, on, true));
  }, []);

  // Intro selalu dimulai dari atas; scroll dikunci sampai kamera selesai keluar dari layar HP.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      const l = lenisOf();
      if (!l) return void (raf = requestAnimationFrame(apply));
      if (introDone) l.start();
      else l.stop();
    };
    apply();
    return () => cancelAnimationFrame(raf);
  }, [introDone]);

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
          {q && base && (
            <Suspense fallback={null}>
              <Scene3D
                f={f}
                copy={copy}
                q={q}
                soft={QUALITY[base].soft}
                ready={ready}
                introRef={introRef}
                busy={busy}
                pokeKey={`${lang}:${tier}:${ready}:${load.active}`}
                onReady={onReady}
                onPhone={openFooter}
                onDecline={decline}
                onProgress={onProgress}
              />
            </Suspense>
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

        <PhoneLoader label={copy.loading} ready={ready} active={load.active} progress={load.progress} introRef={introRef} onGone={onIntroDone} />

        <SeoContent copy={copy} />
        <DeskHeader f={f} count={N} copy={copy} lang={lang} setLang={setLang} goTo={goTo} music={music} />

        <StopDots f={f} count={N} />
        <ScrollHint f={f} count={N} label={copy.scroll.hint} touchLabel={copy.scroll.touch} read={copy.popup.read} screen={copy.popup.screen} enabled={introDone} />
      </main>
      {/* Ruang scroll untuk membuka footer di bawah "kertas" */}
      <div aria-hidden style={{ height: "100svh" }} />
      <DeskFooter copy={copy} onTop={() => lenisOf()?.scrollTo(0, { duration: 2 })} />
      <NotePopup copy={copy} />
    </>
  );
}

/**
 * Layar pemuatan: siluet iPhone (ukuran & posisi = iPhone 3D di meja saat kamera intro, lihat intro.ts),
 * layarnya menampilkan bar progres + persen seperti layar boot. Selesai →
 *  1. "wake"  : layar boot memudar, lock screen iPhone 3D terlihat tepat di baliknya;
 *  2. "reveal": krem di sekeliling & bingkai DOM memudar, meja muncul di sekitar HP, kamera mundur
 *               keluar dari layar HP menuju hero (DeskScene, INTRO_MS).
 */
function PhoneLoader({
  label,
  ready,
  active,
  progress,
  introRef,
  onGone,
}: {
  label: string;
  ready: boolean;
  active: boolean;
  progress: number;
  introRef: { current: IntroState };
  onGone: () => void;
}) {
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  const [stage, setStage] = useState<"load" | "wake" | "reveal" | "gone">("load");
  // Hilang hanya setelah adegan benar-benar ter-render (ready) dan tidak ada unduhan aktif.
  const idle = ready && !active;
  // Unduhan = 0–90%, menyiapkan adegan (font, tekstur, shader) = 90–100%. Angka naik halus, tidak loncat.
  const target = idle ? 100 : Math.min(90, 4 + progress * 0.86);
  useEffect(() => {
    let raf = 0;
    let v = shownRef.current;
    const tick = () => {
      v = Math.abs(target - v) < 0.4 ? target : v + (target - v) * 0.08;
      shownRef.current = v;
      setShown(v);
      if (v !== target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  const done = idle && shown >= 99.5;
  const gone = useRef(onGone);
  useEffect(() => {
    gone.current = onGone;
  });

  useEffect(() => {
    if (!done) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Satu frame agar lock screen 3D pasti sudah digambar di balik siluet.
    const ts: number[] = [];
    ts.push(window.setTimeout(() => setStage("wake"), 120));
    ts.push(
      window.setTimeout(() => {
        setStage("reveal");
        const intro = introRef.current;
        if (reduce) intro.phase = "done";
        else {
          intro.t0 = performance.now() + 220;
          intro.phase = "zoom";
        }
      }, reduce ? 200 : 620),
    );
    ts.push(
      window.setTimeout(() => {
        setStage("gone");
        gone.current();
      }, reduce ? 700 : 1500),
    );
    return () => ts.forEach(window.clearTimeout);
  }, [done, introRef]);

  if (stage === "gone") return null;
  return <PhoneSilhouette label={label} shown={shown} stage={stage} />;
}

