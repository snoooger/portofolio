"use client";

import { useRef, useState } from "react";
import { Stage } from "./Stage";
import { CityScene, CITY_LABELS, CITY_STOPS } from "./scenes/CityScene";
import { ProtoNav, StopCards, StopDots } from "./ui";
import { AboutCard, ContactPill, projectSlots } from "./slots";
import { useStops } from "./useScrollProgress";
import { scrollToStop } from "./ProtoScroll";
import { me } from "./content";

export function CityProto() {
  const root = useRef<HTMLElement>(null);
  const f = useStops(root, CITY_STOPS.length);
  const [running, setRunning] = useState(true);
  const toggle = () => setRunning((r) => !r);
  const goTo = (k: number) => scrollToStop(root.current, k, CITY_STOPS.length);
  const labels = useRef<(HTMLElement | null)[]>([]);

  return (
    <main ref={root} style={{ height: `${CITY_STOPS.length * 115}vh` }}>
      <div className="fixed inset-0">
        <Stage orthographic camera={{ zoom: 46, position: [30, 30, 30], near: -100, far: 200 }}>
          <CityScene f={f} running={running} onToggle={toggle} labels={labels} />
        </Stage>
      </div>
      <div className="pointer-events-none fixed inset-0 z-[6]">
        {CITY_LABELS.map((l, i) => (
          <button
            key={l.k}
            ref={(el) => {
              labels.current[i] = el;
            }}
            onClick={() => goTo(l.k)}
            className="mono-label pointer-events-auto absolute left-0 top-0 whitespace-nowrap rounded-full bg-paper px-3 py-1.5 text-ink shadow-[0_8px_20px_-8px_rgba(30,27,24,0.5)] ring-1 ring-ink/15 transition-colors hover:bg-terracotta hover:text-paper"
          >
            <span className="text-terracotta">{l.no}</span> {l.name}
          </button>
        ))}
      </div>
      <div className="tilt-shift top" />
      <div className="tilt-shift bottom" />
      <ProtoNav index="02" title="Miniature City" />
      <StopDots f={f} count={CITY_STOPS.length} />
      <StopCards
        f={f}
        slots={[
          {
            side: "bottom",
            node: (
              <div className="text-center">
                <h1 className="font-display text-[clamp(2.6rem,5vw,4.6rem)] leading-none">
                  A small city of <span className="font-hand text-terracotta">self-running</span> machines.
                </h1>
                <p className="mono-label mt-4 text-ink-soft">{me.role} · scroll or click a district</p>
              </div>
            ),
          },
          ...projectSlots({ sides: ["right", "left", "right", "left", "right"], running, onToggle: toggle }),
          { side: "right", node: <AboutCard title="Where I trained" /> },
          {
            side: "bottom",
            node: (
              <div className="flex flex-col items-center gap-4">
                <p className="font-display text-5xl">Want a district of your own?</p>
                <ContactPill />
              </div>
            ),
          },
        ]}
      />
    </main>
  );
}
