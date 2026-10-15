"use client";

// Konsep 3 — Object Studio: kelima objek melayang membentuk cincin di hero. Tiap bab menarik
// satu objek ke tengah (besar, berputar pelan, mengikuti kursor) dan menyingkirkan yang lain.
import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { PhoneFarm } from "../objects/PhoneFarm";
import { AgentOffice } from "../objects/AgentOffice";
import { CardFan } from "../objects/CardFan";
import { TrendRadar } from "../objects/TrendRadar";
import { Padlock } from "../objects/Padlock";
import { Sun } from "../Stage";
import { bell } from "../useScrollProgress";
import type { Drive } from "../objects/types";

export const STUDIO_STOPS = 8; // hero, 5 proyek, tentang, kontak

/** Skala di cincin vs saat difokuskan, dan kemiringan dasar tiap objek. */
const POSE = [
  { ring: 0.34, focus: 0.62, tilt: [0.05, 0, 0] },
  { ring: 0.58, focus: 1.05, tilt: [0.32, 0, 0] },
  { ring: 0.66, focus: 1.2, tilt: [0.05, 0, 0] },
  { ring: 0.7, focus: 1.35, tilt: [0.55, 0, 0] },
  { ring: 0.85, focus: 1.6, tilt: [0.15, 0, 0] },
] as const;

function Slot({ i, f, children }: { i: number; f: Drive; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const v = f.current;
    const t = state.clock.elapsedTime;
    const w = bell(v, i + 1, 0.22, 0.85);
    let others = 0;
    for (let j = 0; j < 5; j++) if (j !== i) others += bell(v, j + 1, 0.22, 0.85);
    const ring = Math.max(0, 1 - w - others);

    const a = (i / 5) * Math.PI * 2 + t * 0.12;
    const rp = new THREE.Vector3(Math.cos(a) * 3.9, 0.15 + Math.sin(a * 2) * 0.3, Math.sin(a) * 2.2 - 1.2);
    const fp = new THREE.Vector3(0, 0.1, 0.4);
    const hp = new THREE.Vector3(rp.x * 1.6, -5, -3);
    g.current.position.set(0, 0, 0).addScaledVector(rp, ring).addScaledVector(fp, w).addScaledVector(hp, others);
    g.current.position.y += Math.sin(t * 0.9 + i) * 0.06;
    const sc = POSE[i].ring * ring + POSE[i].focus * w + 0.15 * others;
    g.current.scale.setScalar(sc);
    const p = state.pointer;
    g.current.rotation.set(
      POSE[i].tilt[0] - p.y * 0.25 * w,
      Math.sin(t * 0.35 + i) * 0.45 + p.x * 0.55 * w + (1 - w) * a * 0.4,
      Math.sin(t * 0.5 + i) * 0.03,
    );
  });
  return <group ref={g}>{children}</group>;
}

export function StudioScene({ f, running, onToggle }: { f: Drive; running: boolean; onToggle: () => void }) {
  const explode = useRef(0);
  const sonar = useRef(0);
  const spread = useRef(0);
  const open = useRef(0);
  const energy = useRef(0.4);

  useFrame(() => {
    const v = f.current;
    // Ponsel tersebar saat terbang masuk, lalu tersusun rapi di rak ketika berhenti.
    explode.current = (1 - bell(v, 1, 0.1, 0.45)) * bell(v, 1, 0.3, 1.0);
    sonar.current = bell(v, 2, 0.15, 0.6);
    spread.current = 0.2 + 0.8 * bell(v, 3, 0.15, 0.6);
    energy.current = 0.4 + 0.6 * bell(v, 4, 0.2, 0.7);
    open.current = bell(v, 5, 0.15, 0.5);
  });

  return (
    <>
      <Sun position={[-4, 8, 7]} size={6} intensity={1.6} />
      <Slot i={0} f={f}>
        <PhoneFarm rows={3} cols={4} running={running} onToggle={onToggle} explode={explode} />
      </Slot>
      <Slot i={1} f={f}>
        <AgentOffice size={1.6} explode={sonar} rotation-y={Math.PI / 4} />
      </Slot>
      <Slot i={2} f={f}>
        <CardFan spread={spread} />
      </Slot>
      <Slot i={3} f={f}>
        <TrendRadar energy={energy} />
      </Slot>
      <Slot i={4} f={f}>
        <Padlock open={open} />
      </Slot>
      <ContactShadows position={[0, -1.7, 0]} opacity={0.28} scale={14} blur={2.6} far={4} resolution={512} color="#5c3a26" />
    </>
  );
}
