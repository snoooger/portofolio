"use client";

// Seluruh bagian 3D (three.js, R3F, drei, model, tekstur) dalam satu chunk terpisah yang dimuat malas
// oleh DeskProto. Kerangka DOM (loader siluet iPhone, header, footer, popup) tampil lebih dulu tanpa
// menunggu chunk ini, jadi first paint & LCP tidak terhambat oleh unduhan/parse three.js.
import { useEffect } from "react";
import * as THREE from "three";
import { useProgress } from "@react-three/drei";
import { Stage } from "../Stage";
import { DeskScene } from "./DeskScene";
import { RenderLoop } from "./RenderLoop";
import { DESK_STOPS } from "./stops";
import type { DeskDrive } from "./deskScroll";
import type { Copy } from "./copy";
import type { Quality } from "./quality";
import type { IntroState } from "./intro";

export default function Scene3D({
  f,
  copy,
  q,
  soft,
  ready,
  introRef,
  busy,
  pokeKey,
  onReady,
  onPhone,
  onDecline,
  onProgress,
}: {
  f: DeskDrive;
  copy: Copy;
  q: Quality;
  /** Tipe peta bayangan ditetapkan sekali dari tier awal (PCSS di high, VSM di mid/low). */
  soft: boolean;
  ready: boolean;
  introRef: { current: IntroState };
  busy: (v: number) => boolean;
  pokeKey: string;
  onReady: () => void;
  onPhone: () => void;
  onDecline: () => void;
  onProgress: (active: boolean, progress: number) => void;
}) {
  const { active, progress } = useProgress();
  useEffect(() => onProgress(active, progress), [active, progress, onProgress]);
  return (
    <Stage
      env="/assets-3d/hdri/museum_of_ethnography_1k.hdr"
      camera={{ fov: 45, position: DESK_STOPS[0].pos, near: 0.02, far: 60 }}
      dpr={q.dpr}
      shadows={soft ? true : "variance"}
      antialias={q.antialias}
      toneMapping={THREE.NeutralToneMapping /* warna lebih natural & dalam daripada ACES */}
      exposure={0.9}
      envIntensity={0.5}
      frameloop="demand"
    >
      {/* Render hanya saat ada perubahan; FPS rata-rata terlalu rendah → turunkan tier (maks. dua kali). */}
      <RenderLoop f={f} busy={busy} measure={ready && !active} onDecline={onDecline} pokeKey={pokeKey} />
      <DeskScene f={f} copy={copy} quality={q} introRef={introRef} onReady={onReady} onPhone={onPhone} />
    </Stage>
  );
}
