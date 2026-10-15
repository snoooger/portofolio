"use client";

import { useRef, useState } from "react";
import { Stage } from "./Stage";
import { WorkbenchScene, WB_STOPS } from "./scenes/WorkbenchScene";
import { ProtoNav, StopCards, StopDots } from "./ui";
import { AboutCard, ContactPill, projectSlots } from "./slots";
import { useStops } from "./useScrollProgress";

export function WorkbenchProto() {
  const root = useRef<HTMLElement>(null);
  const f = useStops(root, WB_STOPS.length);
  const [running, setRunning] = useState(false);
  const toggle = () => setRunning((r) => !r);

  return (
    <main ref={root} style={{ height: `${WB_STOPS.length * 115}vh` }}>
      <div className="fixed inset-0">
        <Stage camera={{ fov: 30, position: [0, 11, 5], near: 0.1, far: 120 }}>
          <WorkbenchScene f={f} running={running} onToggle={toggle} />
        </Stage>
      </div>
      <ProtoNav index="01" title="The Workbench" />
      <StopDots f={f} count={WB_STOPS.length} />
      <StopCards
        f={f}
        slots={[
          { side: "bottom", node: <p className="font-hand text-3xl text-paper drop-shadow">scroll to clear the desk ↓</p> },
          ...projectSlots({ sides: ["right", "left"], running, onToggle: toggle }),
          { side: "left", node: <AboutCard /> },
          { side: "bottom", node: <ContactPill /> },
        ]}
      />
    </main>
  );
}
