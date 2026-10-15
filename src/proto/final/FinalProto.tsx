"use client";

// Prototipe final: satu museum, satu kamera. Hero = meja penjaga di lobi (dari atas) → mundur ke lobi
// (about) → 5 proyek → bahan (skills) → pengalaman → sertifikat → pendidikan → buku tamu (kontak).
// Semua teks berupa teks 3D melayang di dalam scene; DOM hanya navigasi.
import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import Link from "next/link";
import { useProgress } from "@react-three/drei";
import { Stage } from "../Stage";
import { StopDots } from "../ui";
import { useStops } from "../useScrollProgress";
import { scrollToStop } from "../ProtoScroll";
import { FinalScene } from "./FinalScene";
import { FINAL_STOPS, stopIndex } from "./stops";
import { COPY, NAME, type Lang } from "./copy";

const N = FINAL_STOPS.length;

export function FinalProto() {
  const root = useRef<HTMLElement>(null);
  const f = useStops(root, N);
  const goTo = (id: string) => scrollToStop(root.current, stopIndex(id), N);
  const [lang, setLang] = useState<Lang>("en");
  const copy = COPY[lang];

  // Snap lembut: setelah scroll berhenti, geser ke perhentian terdekat supaya teks sempat terbaca.
  useEffect(() => {
    let timer = 0;
    let lenis: Lenis | undefined;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const k = Math.round(f.current);
        if (Math.abs(f.current - k) > 0.03) scrollToStop(root.current, k, N);
      }, 220);
    };
    const attach = window.setInterval(() => {
      lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
      if (lenis) {
        lenis.on("scroll", onScroll);
        window.clearInterval(attach);
      }
    }, 100);
    return () => {
      window.clearInterval(attach);
      window.clearTimeout(timer);
      lenis?.off("scroll", onScroll);
    };
  }, [f]);

  const nav = [
    ["about", copy.nav.about],
    ["farmagent", copy.nav.work],
    ["materials", copy.nav.skills],
    ["experience", copy.nav.experience],
    ["contact", copy.nav.contact],
  ] as const;

  return (
    <main ref={root} style={{ height: `${N * 140}vh` }}>
      <div className="fixed inset-0">
        <Stage env="/assets-3d/hdri/museum_of_ethnography_1k.hdr" camera={{ fov: 52, position: FINAL_STOPS[0].pos, near: 0.02, far: 120 }}>
          <FinalScene f={f} copy={copy} />
        </Stage>
      </div>

      <Loader label={lang === "id" ? "Membuka museum" : "Opening the museum"} />

      {/* Navigasi tipis tanpa kotak: hanya teks, dengan halo agar terbaca di atas lantai gelap */}
      <header
        style={{ textShadow: "0 0 10px rgba(251,247,241,0.95), 0 0 2px rgba(251,247,241,1)" }}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-4 px-5 pt-5 md:px-8 md:pt-6">
        <button onClick={() => goTo("hero")} className="pointer-events-auto text-left">
          <span className="block font-display text-xl leading-none">{NAME}</span>
          <span className="mono-label mt-1 block text-ink-soft">{copy.role}</span>
        </button>
        <nav className="pointer-events-auto hidden items-center gap-5 md:flex">
          {nav.map(([id, label]) => (
            <button key={id} onClick={() => goTo(id)} className="mono-label underline-offset-4 transition hover:text-terracotta hover:underline">
              {label}
            </button>
          ))}
        </nav>
        <div className="pointer-events-auto flex items-center gap-4">
          <span className="mono-label">
            {(["en", "id"] as const).map((l, i) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`${i ? "ml-1.5" : ""} uppercase transition ${lang === l ? "text-ink" : "text-ink-soft hover:text-terracotta"}`}
              >
                {l}
              </button>
            ))}
          </span>
          <Link href="/proto" className="mono-label underline-offset-4 hover:text-terracotta hover:underline">
            {copy.nav.concepts}
          </Link>
        </div>
      </header>

      <StopDots f={f} count={N} />
    </main>
  );
}

/** Layar pemuatan selama model, tekstur & HDRI diunduh. */
function Loader({ label }: { label: string }) {
  const { active, progress, total } = useProgress();
  const [gone, setGone] = useState(false);
  // Selesai = tidak ada unduhan aktif selama 900 ms (juga saat semua aset sudah ada di cache).
  const idle = !active && (progress >= 100 || total === 0);
  useEffect(() => {
    if (!idle) return;
    const t = window.setTimeout(() => setGone(true), 900);
    return () => window.clearTimeout(t);
  }, [idle]);
  if (gone) return null;
  const done = idle;
  return (
    <div className={`fixed inset-0 z-50 grid place-items-center bg-cream transition-opacity duration-500 ${done ? "opacity-0" : "opacity-100"}`}>
      <div className="w-[min(320px,70vw)] text-center">
        <p className="font-display text-3xl">Self-Running Machines</p>
        <p className="mono-label mt-3 text-ink-soft">{label}</p>
        <div className="mt-5 h-px w-full bg-ink/15">
          <div className="h-px bg-terracotta transition-[width] duration-300" style={{ width: `${Math.round(progress)}%` }} />
        </div>
        <p className="mono-label mt-2 text-ink-soft">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
