"use client";

// Konsep 1 — The Workbench: meja kerja dilihat dari atas. Kertas judul terangkat & terbang,
// lalu kamera menyusuri meja dari satu objek proyek ke objek berikutnya.
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { matTexture, paperTexture, woodTexture } from "../textures";
import { canvasFont } from "../fonts";
import { P } from "../palette";
import { PhoneFarm } from "../objects/PhoneFarm";
import { AgentOffice } from "../objects/AgentOffice";
import { CardFan } from "../objects/CardFan";
import { TrendRadar } from "../objects/TrendRadar";
import { Padlock } from "../objects/Padlock";
import { Mug, Pencil, Sheet, StickyNote } from "../objects/DeskProps";
import { Sun } from "../Stage";
import { bell, stopMix } from "../useScrollProgress";
import type { Drive } from "../objects/types";

/** Perhentian kamera: titik fokus (x, z), ketinggian, dan geser fokus untuk memberi ruang kartu teks. */
export const WB_STOPS = [
  { x: 0, z: 0.3, h: 12.6, shift: 0 }, // hero: kertas judul
  { x: -3.4, z: -1.9, h: 6.2, shift: -1.5 }, // FarmAgent (kartu di kanan → objek ke kiri)
  { x: 3.3, z: -1.8, h: 7.8, shift: 1.9 }, // Sonar
  { x: -3.3, z: 2.2, h: 6.0, shift: -1.5 }, // PromptedSite
  { x: 3.4, z: 2.2, h: 5.6, shift: 1.4 }, // ViralEngine
  { x: 0, z: 3.4, h: 5.2, shift: -1.3 }, // Security
  { x: -6.4, z: -0.9, h: 7.6, shift: 1.8 }, // Tentang saya (sticky notes)
  { x: 0, z: 0.2, h: 11.5, shift: 0 }, // penutup: kertas kontak
] as const;

const TILT = 0.42; // radian dari vertikal

function useFonts() {
  const [fonts, set] = useState<{ serif: string; hand: string } | null>(null);
  useEffect(() => {
    Promise.all([canvasFont("--font-instrument-serif", "150px"), canvasFont("--font-caveat", "700 200px")]).then(([serif, hand]) =>
      set({ serif, hand }),
    );
  }, []);
  return fonts;
}

export function WorkbenchScene({ f, running, onToggle }: { f: Drive; running: boolean; onToggle: () => void }) {
  const fonts = useFonts();
  const mat = useMemo(() => matTexture(), []);
  const wood = useMemo(() => {
    const t = woodTexture();
    t.repeat.set(5, 5);
    return t;
  }, []);
  const papers = useMemo(() => {
    if (!fonts) return null;
    return {
      hero: paperTexture(fonts.serif, fonts.hand, ["I build machines", "that run"], "themselves.", "ZAIDAN JIBRAN AZHAR — FULLSTACK & AI AUTOMATION"),
      end: paperTexture(fonts.serif, fonts.hand, ["Got something that", "should run"], "by itself?", "ZAIDANJIBRAN86@GMAIL.COM"),
    };
  }, [fonts]);
  useEffect(() => () => [mat, wood].forEach((t) => t.dispose()), [mat, wood]);

  const look = useRef(new THREE.Vector3());
  const heroSheet = useRef<THREE.Group>(null);
  const endSheet = useRef<THREE.Group>(null);
  const spread = useRef(0);
  const explode = useRef(0);
  const open = useRef(0);
  const radar = useRef(1);

  useFrame((state, dt) => {
    const { camera, pointer } = state;
    const v = f.current;
    const { a, b, t } = stopMix(v, WB_STOPS.length);
    const A = WB_STOPS[a], B = WB_STOPS[b];
    const x = THREE.MathUtils.lerp(A.x, B.x, t);
    const z = THREE.MathUtils.lerp(A.z, B.z, t);
    const h = THREE.MathUtils.lerp(A.h, B.h, t);
    const sh = THREE.MathUtils.lerp(A.shift, B.shift, t);
    const tx = x - sh + pointer.x * 0.25;
    const tz = z - pointer.y * 0.2;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 4, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, h * Math.cos(TILT), 4, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, tz + h * Math.sin(TILT), 4, dt);
    look.current.set(
      THREE.MathUtils.damp(look.current.x, tx, 4, dt),
      0,
      THREE.MathUtils.damp(look.current.z, tz, 4, dt),
    );
    camera.lookAt(look.current);

    // Kertas judul: terangkat, berputar, terbang keluar meja.
    const fly = THREE.MathUtils.smoothstep(v, 0.05, 0.85);
    if (heroSheet.current) {
      heroSheet.current.position.set(-fly * 9, 0.03 + Math.sin(fly * Math.PI) * 2.6 + fly * 1.5, -fly * 5);
      heroSheet.current.rotation.set(-Math.PI / 2 + fly * 0.9, fly * 0.5, 0.03 - fly * 1.1);
    }
    const land = 1 - THREE.MathUtils.smoothstep(v, 6.2, 6.9);
    if (endSheet.current) {
      endSheet.current.position.set(land * 9, 0.05 + Math.sin(land * Math.PI) * 2.4 + land * 1.5, -land * 4);
      endSheet.current.rotation.set(-Math.PI / 2 + land * 0.8, -land * 0.4, -0.04 + land * 1.0);
    }

    explode.current = bell(v, 2, 0.15, 0.6);
    spread.current = 0.25 + 0.75 * bell(v, 3, 0.2, 0.7);
    open.current = bell(v, 5, 0.15, 0.55);
    radar.current = 0.5 + 0.5 * bell(v, 4, 0.2, 0.8);
  });

  return (
    <>
      <color attach="background" args={[P.oak]} />
      <Sun position={[-6, 12, 5]} size={11} />

      {/* Meja kayu + cutting mat */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial map={wood} roughness={0.75} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]} receiveShadow>
        <boxGeometry args={[11.5, 8.6, 0.02]} />
        <meshStandardMaterial map={mat} roughness={0.85} />
      </mesh>

      {papers && (
        <>
          <group ref={heroSheet}>
            <Sheet map={papers.hero} w={4.6} h={3.16} />
          </group>
          <group ref={endSheet} position={[9, 3, -4]}>
            <Sheet map={papers.end} w={4.6} h={3.16} />
          </group>
        </>
      )}

      {/* Proyek */}
      <PhoneFarm
        rows={3}
        cols={4}
        stand={false}
        running={running}
        onToggle={onToggle}
        rotation-x={-Math.PI / 2}
        position={[-3.4, 0.05, -1.9]}
        scale={0.82}
      />
      <AgentOffice size={1.45} explode={explode} position={[3.3, 0.82, -2.0]} rotation-y={0.35} />
      <CardFan spread={spread} rotation={[-Math.PI / 2, 0, 0.15]} position={[-3.3, 0.06, 2.6]} scale={0.95} />
      <TrendRadar energy={radar} position={[3.4, 0.12, 2.2]} scale={1.05} />
      <Padlock open={open} rotation={[-Math.PI / 2, 0, -0.2]} position={[0, 0.22, 3.45]} scale={0.9} />

      {/* Barang pribadi */}
      <Mug position={[6.6, 0, -3.4]} />
      <Pencil position={[1.6, 0.05, -3.4]} rotation-y={0.5} />
      {fonts && (
        <>
          <StickyNote hand={fonts.hand} lines={["GPA", "3.65"]} rotation={[-Math.PI / 2, 0, 0.12]} position={[-6.9, 0.02, -2.1]} />
          <StickyNote hand={fonts.hand} lines={["IT-PLN", "class of", "'26"]} color="#E9C2AE" rotation={[-Math.PI / 2, 0, -0.1]} position={[-5.7, 0.025, -0.6]} />
          <StickyNote hand={fonts.hand} lines={["4 jobs", "since '25"]} color="#DCE3D0" rotation={[-Math.PI / 2, 0, 0.06]} position={[-7.0, 0.03, 0.4]} />
        </>
      )}
    </>
  );
}
