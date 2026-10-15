"use client";

import { useRef, useState } from "react";
import { Stage } from "./Stage";
import { StudioScene, STUDIO_STOPS } from "./scenes/StudioScene";
import { ProtoNav, StopCards, StopDots } from "./ui";
import { ContactPill, RunButton, type Slot } from "./slots";
import { protoProjects as PP, me } from "./content";
import { useStops } from "./useScrollProgress";

const WORDS = ["Zaidan", "Farm", "Sonar", "Prompt", "Signal", "Lock", "Person", "Hello"];

export function StudioProto() {
  const root = useRef<HTMLElement>(null);
  const f = useStops(root, STUDIO_STOPS);
  const [running, setRunning] = useState(true);
  const toggle = () => setRunning((r) => !r);

  // Kolom kiri (nama & kalimat) + kolom kanan (angka) mengapit objek di tengah.
  const chapters: Slot[] = PP.map((p) => ({
    side: "center",
    node: (
      <div className="grid w-screen grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-[34vw] px-6 md:px-14">
        <div className="pointer-events-auto max-w-sm">
          <p className="mono-label text-ink-soft">
            <span className="text-terracotta">{p.no}</span> / {p.internal ? "internal · described only" : "public"}
          </p>
          <h2 className="mt-3 font-display text-[clamp(2.6rem,4.4vw,4.4rem)] leading-[0.95]">{p.name}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{p.line}</p>
          <p className="mt-4 rotate-[-2deg] font-hand text-2xl text-terracotta">{p.note}</p>
          {p.key === "farmagent" && <RunButton running={running} onToggle={toggle} />}
        </div>
        <dl className="justify-self-end text-right">
          {p.facts.map((x) => (
            <div key={x.k} className="mb-5">
              <dt className="font-display text-[clamp(2.4rem,4vw,4rem)] leading-none">{x.v}</dt>
              <dd className="mono-label mt-1 text-ink-soft">{x.k}</dd>
            </div>
          ))}
          <p className="mono-label max-w-[16rem] text-[10px] text-ink-soft">{p.stack}</p>
        </dl>
      </div>
    ),
  }));

  return (
    <main ref={root} style={{ height: `${STUDIO_STOPS * 115}vh` }}>
      {/* Kata raksasa di belakang objek */}
      <StopCards
        f={f}
        z="z-0"
        lift={120}
        slots={WORDS.map((w) => ({
          side: "center",
          node: (
            <p
              className="select-none whitespace-nowrap font-display text-[24vw] italic leading-none text-transparent"
              style={{ WebkitTextStroke: "1.5px rgba(194,85,47,0.7)" }}
            >
              {w}
            </p>
          ),
        }))}
      />
      <div className="fixed inset-0 z-10">
        <Stage camera={{ fov: 30, position: [0, 1.2, 11] }}>
          <StudioScene f={f} running={running} onToggle={toggle} />
        </Stage>
      </div>
      <ProtoNav index="03" title="Object Studio" />
      <StopDots f={f} count={STUDIO_STOPS} />
      <StopCards
        f={f}
        slots={[
          {
            side: "bottom",
            node: (
              <div className="text-center">
                <h1 className="font-display text-[clamp(2.6rem,5vw,4.8rem)] leading-none">
                  Five machines. <span className="font-hand text-terracotta">One builder.</span>
                </h1>
                <p className="mono-label mt-4 text-ink-soft">{me.role}</p>
              </div>
            ),
          },
          ...chapters,
          {
            side: "bottom",
            node: (
              <div className="max-w-xl text-center">
                <p className="font-display text-4xl leading-tight">{me.edu}.</p>
                <p className="mt-3 font-hand text-2xl text-terracotta">Four roles since 2025 — PLN, PUPR, Timedoor, Kerja Web3.</p>
              </div>
            ),
          },
          {
            side: "bottom",
            node: (
              <div className="flex flex-col items-center gap-4">
                <p className="font-display text-5xl">What should run by itself?</p>
                <ContactPill />
              </div>
            ),
          },
        ]}
      />
    </main>
  );
}
