"use client";

// Perangkat nyata untuk tiap proyek, dibuat lebih detail daripada versi low-poly:
// rak HP (FarmAgent), monitor studio (PromptedSite), dinding 6 monitor (ViralEngine),
// laptop + HP dengan halaman blokir (Security). Semua animasi digerakkan oleh scroll (Drive), tanpa klik.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { P } from "../palette";
import type { Drive } from "../objects/types";
import type { Fonts } from "../final/useFonts";
import { blockedPage, galleryPage, phoneFeed, trainingNotebook, trendColumn } from "./screens";

type G = ThreeElements["group"];

/* ── Material bersama ─────────────────────────────────────────────── */
export function Aluminium({ color = "#c9c7c3" }: { color?: string }) {
  return <meshPhysicalMaterial color={color} metalness={1} roughness={0.28} clearcoat={0.3} />;
}
export function SpaceGrey() {
  return <meshPhysicalMaterial color="#3a3a3d" metalness={0.9} roughness={0.35} />;
}
export function BlackGlass() {
  return <meshPhysicalMaterial color="#0a0a0b" metalness={0.2} roughness={0.06} clearcoat={1} clearcoatRoughness={0.05} />;
}

/** Bidang layar menyala; kecerahan & offset gulir diatur dari luar lewat ref material. */
export function ScreenPlane({
  map,
  w,
  h,
  matRef,
  position = [0, 0, 0],
}: {
  map: THREE.Texture;
  w: number;
  h: number;
  matRef?: (m: THREE.MeshBasicMaterial | null) => void;
  position?: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial ref={matRef} map={map} toneMapped={false} />
    </mesh>
  );
}

/* ── Smartphone ───────────────────────────────────────────────────── */
export const PW = 0.072, PH = 0.152, PD = 0.0082;

export function Smartphone({ map, matRef, ...props }: G & { map: THREE.Texture; matRef: (m: THREE.MeshBasicMaterial | null) => void }) {
  return (
    <group {...props}>
      {/* Bingkai aluminium */}
      <RoundedBox args={[PW, PH, PD]} radius={0.0095} smoothness={6} castShadow>
        <Aluminium color="#d6d3ce" />
      </RoundedBox>
      {/* Kaca depan */}
      <RoundedBox args={[PW - 0.0012, PH - 0.0012, 0.0012]} radius={0.009} smoothness={6} position={[0, 0, PD / 2]}>
        <BlackGlass />
      </RoundedBox>
      <ScreenPlane map={map} w={PW - 0.0058} h={PH - 0.0058} position={[0, 0, PD / 2 + 0.0007]} matRef={matRef} />
      {/* Dynamic island */}
      <RoundedBox args={[0.019, 0.0055, 0.0004]} radius={0.0027} position={[0, PH / 2 - 0.009, PD / 2 + 0.0009]}>
        <meshBasicMaterial color="#000" />
      </RoundedBox>
      {/* Tombol samping */}
      {[0.03, 0.012].map((y) => (
        <RoundedBox key={y} args={[0.0012, 0.012, 0.003]} radius={0.0005} position={[-PW / 2 - 0.0004, y, 0]}>
          <Aluminium color="#d6d3ce" />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.0012, 0.02, 0.003]} radius={0.0005} position={[PW / 2 + 0.0004, 0.02, 0]}>
        <Aluminium color="#d6d3ce" />
      </RoundedBox>
    </group>
  );
}

/** Kabel USB-C melengkung dari bawah HP ke hub. */
export function Cable({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const geo = useMemo(() => {
    const m1 = from.clone().add(new THREE.Vector3(0, -0.05, 0.02));
    const m2 = to.clone().add(new THREE.Vector3(0, 0.04, 0.03));
    return new THREE.TubeGeometry(new THREE.CubicBezierCurve3(from, m1, m2, to), 32, 0.0018, 8, false);
  }, [from, to]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color="#f1efe9" roughness={0.5} />
    </mesh>
  );
}

/** FarmAgent: rak aluminium 2×4 HP Android sungguhan, kabel ke hub USB. Menyala saat `run` naik. */
export function PhoneRackHD({ fonts, run, ...props }: G & { fonts: Fonts; run: Drive }) {
  const feeds = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const t = phoneFeed(i + 1, fonts.sans);
        t.repeat.set(1, 1 / 6);
        return t;
      }),
    [fonts],
  );
  useEffect(() => () => feeds.forEach((t) => t.dispose()), [feeds]);

  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const leds = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const st = useRef(feeds.map((_, i) => ({ on: 0, card: i % 6, t: (i * 0.37) % 1, off: (i % 6) / 6 })));

  useFrame((_, dt) => {
    const r = run.current;
    st.current.forEach((s, i) => {
      // Menyala bergelombang sesuai urutan di rak.
      const target = r > 0.15 + i * 0.07 ? 1 : 0;
      s.on = THREE.MathUtils.damp(s.on, target, 5, dt);
      if (s.on > 0.5) {
        s.t += dt / (1.4 + (i % 3) * 0.35);
        if (s.t > 1) {
          s.t = 0;
          s.card = (s.card + 1) % 6;
        }
      }
      // Swipe ke video berikutnya dengan easing.
      const goal = s.card / 6;
      let diff = goal - s.off;
      if (diff < -0.5) diff += 1;
      s.off = (s.off + diff * Math.min(1, dt * 9) + 1) % 1;
      const m = mats.current[i];
      if (m) {
        if (m.map) m.map.offset.y = 1 - s.off - 1 / 6;
        m.color.setScalar(0.04 + 0.96 * s.on);
      }
      const l = leds.current[i];
      if (l) l.color.set(s.on > 0.5 ? "#7ee08a" : "#3a3a3a");
    });
  });

  const cols = 4, gapX = 0.094, gapY = 0.19;
  const hub = new THREE.Vector3(0, -0.215, 0.02);
  return (
    <group {...props}>
      {/* Rangka: dua tiang, dua rel bersudut, alas */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.012, 0.42, 0.04]} radius={0.003} position={[s * 0.205, 0, -0.01]} castShadow>
          <Aluminium />
        </RoundedBox>
      ))}
      {[0, 1].map((r) => (
        <group key={r} position={[0, (0.5 - r) * gapY - PH / 2 - 0.006, 0]}>
          <RoundedBox args={[0.41, 0.008, 0.045]} radius={0.003} castShadow receiveShadow>
            <Aluminium />
          </RoundedBox>
          <RoundedBox args={[0.41, 0.014, 0.004]} radius={0.0015} position={[0, 0.007, 0.02]}>
            <Aluminium />
          </RoundedBox>
        </group>
      ))}
      <RoundedBox args={[0.46, 0.012, 0.16]} radius={0.004} position={[0, -0.21, 0.03]} receiveShadow castShadow>
        <SpaceGrey />
      </RoundedBox>
      {/* Hub USB dengan LED status per port */}
      <RoundedBox args={[0.2, 0.022, 0.05]} radius={0.004} position={[hub.x, hub.y + 0.006, hub.z + 0.04]} castShadow>
        <meshPhysicalMaterial color="#1c1c1e" roughness={0.4} metalness={0.3} />
      </RoundedBox>
      {feeds.map((_, i) => (
        <mesh key={i} position={[-0.084 + i * 0.024, hub.y + 0.012, hub.z + 0.066]}>
          <boxGeometry args={[0.006, 0.003, 0.001]} />
          <meshBasicMaterial
            ref={(m) => {
              leds.current[i] = m;
            }}
            color="#3a3a3a"
            toneMapped={false}
          />
        </mesh>
      ))}
      {feeds.map((map, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const x = (c - (cols - 1) / 2) * gapX;
        const y = (0.5 - r) * gapY;
        return (
          <group key={i}>
            <Smartphone
              map={map}
              position={[x, y, 0.004]}
              rotation-x={-0.08}
              matRef={(m) => {
                mats.current[i] = m;
              }}
            />
            <Cable from={new THREE.Vector3(x, y - PH / 2, 0.004)} to={new THREE.Vector3(-0.084 + i * 0.024, hub.y + 0.02, hub.z + 0.05)} />
          </group>
        );
      })}
    </group>
  );
}

/* ── Monitor studio (PromptedSite) ────────────────────────────────── */
export function StudioDisplayHD({ fonts, scroll, ...props }: G & { fonts: Fonts; scroll: Drive }) {
  const SW = 0.62, SH = 0.35;
  const page = useMemo(() => {
    const t = galleryPage(fonts.serif, fonts.sans, fonts.mono);
    // Tampilkan sepotong halaman setinggi rasio layar, lalu gulir.
    t.repeat.set(1, (SH / SW) * (1280 / 2560));
    return t;
  }, [fonts]);
  useEffect(() => () => page.dispose(), [page]);
  const screen = useRef<THREE.MeshBasicMaterial | null>(null);
  useFrame(() => {
    const t = screen.current?.map;
    if (!t) return;
    t.offset.y = 1 - t.repeat.y - scroll.current * (1 - t.repeat.y);
  });
  return (
    <group {...props}>
      <RoundedBox args={[SW + 0.024, SH + 0.024, 0.02]} radius={0.008} smoothness={5} castShadow>
        <Aluminium color="#d9d7d2" />
      </RoundedBox>
      <mesh position={[0, 0, 0.0102]}>
        <planeGeometry args={[SW + 0.016, SH + 0.016]} />
        <meshPhysicalMaterial color="#050506" roughness={0.05} clearcoat={1} />
      </mesh>
      <ScreenPlane
        map={page}
        w={SW}
        h={SH}
        position={[0, 0, 0.0106]}
        matRef={(m) => {
          screen.current = m;
        }}
      />
      {/* Kaki: leher miring + alas */}
      <RoundedBox args={[0.12, 0.28, 0.012]} radius={0.004} position={[0, -0.26, -0.05]} rotation-x={-0.2} castShadow>
        <Aluminium color="#d9d7d2" />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.008, 0.17]} radius={0.004} position={[0, -0.395, -0.02]} castShadow receiveShadow>
        <Aluminium color="#d9d7d2" />
      </RoundedBox>
      {/* Keyboard & mouse di depan monitor */}
      <RoundedBox args={[0.28, 0.008, 0.11]} radius={0.004} position={[-0.03, -0.395, 0.18]} castShadow>
        <Aluminium color="#e4e2dd" />
      </RoundedBox>
      <RoundedBox args={[0.06, 0.012, 0.1]} radius={0.006} position={[0.2, -0.393, 0.18]} castShadow>
        <meshPhysicalMaterial color="#f2f0ec" roughness={0.3} clearcoat={0.6} />
      </RoundedBox>
    </group>
  );
}

/* ── Dinding monitor (ViralEngine) ────────────────────────────────── */
export function MonitorWallHD({ fonts, scroll, ...props }: G & { fonts: Fonts; scroll: Drive }) {
  const MW = 0.34, MH = 0.2;
  const cols = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const t = trendColumn(i, fonts.sans, fonts.mono);
        t.repeat.set(1, (MH / MW) * (640 / 1440));
        return t;
      }),
    [fonts],
  );
  useEffect(() => () => cols.forEach((t) => t.dispose()), [cols]);
  const clock = useRef(0);
  const screens = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  useFrame((_, dt) => {
    clock.current += dt * 0.02 * scroll.current;
    screens.current.forEach((m, i) => {
      const t = m?.map;
      if (t) t.offset.y = (1 - t.repeat.y - (scroll.current * 0.55 + clock.current + i * 0.03)) % 1;
    });
  });
  return (
    <group {...props}>
      {/* Tiang & lengan */}
      <mesh position={[0, -0.05, -0.06]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.72, 24]} />
        <Aluminium />
      </mesh>
      <RoundedBox args={[0.32, 0.012, 0.22]} radius={0.004} position={[0, -0.41, -0.02]} castShadow receiveShadow>
        <SpaceGrey />
      </RoundedBox>
      {[0.12, -0.12].map((y) => (
        <RoundedBox key={y} args={[1.1, 0.03, 0.02]} radius={0.004} position={[0, y, -0.045]} castShadow>
          <Aluminium />
        </RoundedBox>
      ))}
      {cols.map((t, i) => {
        const c = i % 3, r = Math.floor(i / 3);
        return (
          <group key={i} position={[(c - 1) * (MW + 0.022), (0.5 - r) * (MH + 0.03), 0]} rotation-y={(1 - c) * 0.12}>
            <RoundedBox args={[MW + 0.012, MH + 0.012, 0.022]} radius={0.004} castShadow>
              <meshPhysicalMaterial color="#121214" roughness={0.4} metalness={0.4} />
            </RoundedBox>
            <ScreenPlane
              map={t}
              w={MW}
              h={MH}
              position={[0, 0, 0.0115]}
              matRef={(m) => {
                screens.current[i] = m;
              }}
            />
          </group>
        );
      })}
    </group>
  );
}

/* ── Laptop + HP (Security) ───────────────────────────────────────── */
export function LaptopRigHD({ fonts, scroll, ...props }: G & { fonts: Fonts; scroll: Drive }) {
  const notebook = useMemo(() => trainingNotebook(fonts.sans, fonts.mono), [fonts]);
  const blocked = useMemo(() => blockedPage(fonts.serif, fonts.sans, fonts.mono), [fonts]);
  useEffect(() => () => [notebook, blocked].forEach((t) => t.dispose()), [notebook, blocked]);
  const lid = useRef<THREE.Group>(null);
  const keys = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) out.push([-0.132 + c * 0.022, 0, -0.07 + r * 0.021]);
    return out;
  }, []);
  useFrame((_, dt) => {
    // Laptop terbuka saat section aktif.
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.damp(lid.current.rotation.x, scroll.current > 0.05 ? -1.85 : -0.2, 4, dt);
  });
  const LW = 0.31, LD = 0.215;
  return (
    <group {...props}>
      {/* Badan bawah */}
      <RoundedBox args={[LW, 0.012, LD]} radius={0.005} smoothness={4} castShadow receiveShadow>
        <SpaceGrey />
      </RoundedBox>
      {keys.map((k, i) => (
        <RoundedBox key={i} args={[0.0185, 0.002, 0.0175]} radius={0.0015} position={[k[0], 0.0065, k[2]]}>
          <meshStandardMaterial color="#1b1b1d" roughness={0.6} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.11, 0.001, 0.065]} radius={0.004} position={[0, 0.0062, 0.068]}>
        <meshPhysicalMaterial color="#3f3f43" roughness={0.25} metalness={0.6} />
      </RoundedBox>
      {/* Layar berengsel di tepi belakang: saat tertutup rebah di atas badan, membuka ke atas */}
      <group ref={lid} position={[0, 0.006, -LD / 2]} rotation-x={-0.2}>
        <group position={[0, 0.003, LD / 2]}>
          <RoundedBox args={[LW, 0.006, LD]} radius={0.005} smoothness={4} castShadow>
            <SpaceGrey />
          </RoundedBox>
          <mesh position={[0, -0.0032, 0]} rotation-x={Math.PI / 2}>
            <planeGeometry args={[LW - 0.008, LD - 0.008]} />
            <meshPhysicalMaterial color="#050506" roughness={0.05} clearcoat={1} />
          </mesh>
          <mesh position={[0, -0.0034, 0.004]} rotation-x={Math.PI / 2}>
            <planeGeometry args={[LW - 0.02, (LW - 0.02) * (800 / 1280)]} />
            <meshBasicMaterial map={notebook} toneMapped={false} />
          </mesh>
        </group>
      </group>
      {/* HP berdiri di dudukan, menampilkan halaman blokir ekstensi */}
      <group position={[0.24, 0.0, 0.02]} rotation-y={-0.35}>
        <RoundedBox args={[0.06, 0.006, 0.06]} radius={0.003} position={[0, 0, 0]} castShadow>
          <Aluminium />
        </RoundedBox>
        <group position={[0, 0.075, -0.008]} rotation-x={-0.18}>
          <RoundedBox args={[PW, PH, PD]} radius={0.0095} smoothness={6} castShadow>
            <Aluminium color="#d6d3ce" />
          </RoundedBox>
          <mesh position={[0, 0, PD / 2 + 0.0004]}>
            <planeGeometry args={[PW - 0.0058, PH - 0.0058]} />
            <meshBasicMaterial map={blocked} toneMapped={false} />
          </mesh>
        </group>
      </group>
      {/* Pembeda: stiker terakota kecil di sudut laptop */}
      <mesh position={[-0.12, 0.0062, 0.09]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.008, 24]} />
        <meshStandardMaterial color={P.terracotta} />
      </mesh>
    </group>
  );
}
