"use client";

import { useRef, useState } from "react";
import { Stage } from "./Stage";
import { MuseumScene, MUSEUM_STOPS } from "./scenes/MuseumScene";
import { ProtoNav, StopCards, StopDots } from "./ui";
import { AboutCard, ContactPill, projectSlots } from "./slots";
import { useStops } from "./useScrollProgress";

export function MuseumProto() {
  const root = useRef<HTMLElement>(null);
  const f = useStops(root, MUSEUM_STOPS.length);
  const [running, setRunning] = useState(true);
  const toggle = () => setRunning((r) => !r);

  return (
    <main ref={root} style={{ height: `${MUSEUM_STOPS.length * 120}vh` }}>
      <div className="fixed inset-0">
        <Stage camera={{ fov: 50, position: [0, 1.6, 7.5], near: 0.05, far: 80 }}>
          <MuseumScene f={f} running={running} onToggle={toggle} />
        </Stage>
      </div>
      <ProtoNav index="04" title="The Museum" />
      <StopDots f={f} count={MUSEUM_STOPS.length} />
      <StopCards
        f={f}
        slots={[
          { side: "bottom", node: <p className="font-hand text-3xl text-terracotta">scroll to walk in ↓</p> },
          // Plinth kiri → kartu di kanan, dan sebaliknya.
          ...projectSlots({ sides: ["right", "left"], running, onToggle: toggle }),
          {
            side: "right",
            node: (
              <article className="w-[min(360px,86vw)] rounded-[22px] bg-paper/92 p-7 shadow-[0_30px_60px_-30px_rgba(30,27,24,0.45)] ring-1 ring-ink/8">
                <p className="mono-label text-ink-soft">
                  <span className="text-terracotta">06</span> / Certificates
                </p>
                <h2 className="mt-3 font-display text-5xl leading-[0.95]">Seven frames, 2023 → 2026</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                  Offensive security, cloud AI and networking — from Huawei, Google, Microsoft, ID-Networkers and Coding Studio.
                </p>
              </article>
            ),
          },
          {
            side: "left",
            node: (
              <div className="flex flex-col items-start gap-4">
                <AboutCard title="The person behind them" />
                <ContactPill />
              </div>
            ),
          },
        ]}
      />
    </main>
  );
}
