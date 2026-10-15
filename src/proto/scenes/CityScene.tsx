"use client";

// Konsep 2 — Miniature City: diorama isometrik. Tiap proyek adalah satu distrik;
// kamera ortografik bergeser & memperbesar ke distrik yang sedang dibahas.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { P } from "../palette";
import { PhoneFarm } from "../objects/PhoneFarm";
import { AgentOffice } from "../objects/AgentOffice";
import { CardFan } from "../objects/CardFan";
import { TrendRadar } from "../objects/TrendRadar";
import { Padlock } from "../objects/Padlock";
import { Sun } from "../Stage";
import { bell, stopMix } from "../useScrollProgress";
import type { Drive } from "../objects/types";

const L = 2.7; // jarak jalan dari pusat
const HALF = 8; // setengah sisi diorama

/** Titik jangkar label distrik (dirender di DOM, diproyeksikan tiap frame). */
export const CITY_LABELS = [
  { k: 1, no: "01", name: "FarmAgent", pos: [-5.2, 2.6, -5.2] },
  { k: 2, no: "02", name: "Sonar", pos: [5.2, 3.3, -5.2] },
  { k: 3, no: "03", name: "PromptedSite", pos: [-5.2, 2.9, 5.2] },
  { k: 4, no: "04", name: "ViralEngine", pos: [5.2, 2.4, 5.2] },
  { k: 5, no: "05", name: "Security", pos: [0, 2.3, 0] },
  { k: 6, no: "06", name: "IT-PLN", pos: [-5.4, 2.2, 0] },
] as const;

export const CITY_STOPS = [
  // s = sisi kartu teks (+1 kanan, -1 kiri): distrik digeser ke sisi sebaliknya.
  { x: 1.6, z: 1.6, zoom: 40, s: 0 },
  { x: -5.2, z: -5.2, zoom: 105, s: 1 },
  { x: 5.2, z: -5.2, zoom: 100, s: -1 },
  { x: -5.2, z: 5.2, zoom: 100, s: 1 },
  { x: 5.2, z: 5.2, zoom: 105, s: -1 },
  { x: 0, z: 0, zoom: 110, s: 1 },
  { x: -5.4, z: 0, zoom: 115, s: 1 },
  { x: 1.6, z: 1.6, zoom: 40, s: 0 },
] as const;

const ISO = new THREE.Vector3(1, 1.05, 1).normalize().multiplyScalar(40);

function Tree({ position, s = 1 }: { position: [number, number, number]; s?: number }) {
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#7a5a3c" />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <coneGeometry args={[0.22, 0.6, 10]} />
        <meshStandardMaterial color={P.sage} roughness={0.8} />
      </mesh>
    </group>
  );
}

function House({ position, color = P.paper, roof = P.terracotta, r = 0 }: { position: [number, number, number]; color?: string; roof?: string; r?: number }) {
  return (
    <group position={position} rotation-y={r}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.62, 0]} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[0.47, 0.3, 4]} />
        <meshStandardMaterial color={roof} roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Mobil kecil yang melaju bolak-balik di satu jalur. */
function Cars() {
  const cars = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const road = i % 4; // 0,1 = sejajar x; 2,3 = sejajar z
        const lane = i % 8 < 4 ? 0.22 : -0.22;
        return {
          road,
          axisX: road < 2,
          fixed: (road % 2 === 0 ? -L : L) + lane,
          dir: lane > 0 ? 1 : -1,
          speed: 0.9 + ((i * 0.37) % 0.6),
          off: (i * 3.7) % (HALF * 2),
          color: [P.terracotta, P.paper, P.ink, P.sky, P.sand][i % 5],
        };
      }),
    [],
  );
  const refs = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    cars.forEach((c, i) => {
      const g = refs.current[i];
      if (!g) return;
      const span = HALF * 2 - 0.6;
      const s = (((c.off + clock.elapsedTime * c.speed * c.dir) % span) + span) % span - span / 2;
      if (c.axisX) {
        g.position.set(s, 0.12, c.fixed);
        g.rotation.y = c.dir > 0 ? 0 : Math.PI;
      } else {
        g.position.set(c.fixed, 0.12, s);
        g.rotation.y = c.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
      }
    });
  });
  return (
    <>
      {cars.map((c, i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) refs.current[i] = g;
          }}
        >
          <RoundedBox args={[0.34, 0.12, 0.18]} radius={0.04} castShadow>
            <meshStandardMaterial color={c.color} roughness={0.4} />
          </RoundedBox>
          <RoundedBox args={[0.18, 0.09, 0.16]} radius={0.03} position={[-0.02, 0.09, 0]}>
            <meshStandardMaterial color="#2c2824" roughness={0.2} />
          </RoundedBox>
        </group>
      ))}
    </>
  );
}

export function CityScene({
  f,
  running,
  onToggle,
  labels,
}: {
  f: Drive;
  running: boolean;
  onToggle: () => void;
  labels: { current: (HTMLElement | null)[] };
}) {
  const v3 = useMemo(() => new THREE.Vector3(), []);
  const target = useRef(new THREE.Vector3());
  const spread = useRef(1);
  const open = useRef(0);

  useFrame((state, dt) => {
    const { camera, pointer, size } = state;
    const v = f.current;
    const { a, b, t } = stopMix(v, CITY_STOPS.length);
    const A = CITY_STOPS[a], B = CITY_STOPS[b];
    // Geser fokus sepanjang sumbu "kanan layar" (1, 0, -1) agar distrik tidak tertutup kartu.
    const side = THREE.MathUtils.lerp(A.s, B.s, t) * ((state.size.width * 0.19) / camera.zoom) * Math.SQRT1_2;
    const x = THREE.MathUtils.lerp(A.x, B.x, t) + side + pointer.x * 0.3;
    const z = THREE.MathUtils.lerp(A.z, B.z, t) - side - pointer.y * 0.3;
    // Saat pindah antar-distrik, mundur sedikit (zoom out) supaya terasa terbang di atas kota.
    const hop = Math.sin(t * Math.PI) * (a !== b ? 0.35 : 0);
    const zoom = THREE.MathUtils.lerp(A.zoom, B.zoom, t) * (1 - hop);
    target.current.set(THREE.MathUtils.damp(target.current.x, x, 4, dt), 0, THREE.MathUtils.damp(target.current.z, z, 4, dt));
    camera.position.copy(target.current).add(ISO);
    camera.lookAt(target.current);
    camera.zoom = THREE.MathUtils.damp(camera.zoom, zoom, 4, dt);
    camera.updateProjectionMatrix();

    // Label DOM mengikuti posisi distrik di layar.
    const { width, height } = size;
    CITY_LABELS.forEach((l, i) => {
      const el = labels.current[i];
      if (!el) return;
      v3.set(l.pos[0], l.pos[1], l.pos[2]).project(camera);
      el.style.transform = `translate3d(${((v3.x + 1) / 2) * width}px, ${((1 - v3.y) / 2) * height}px, 0) translate(-50%, -50%)`;
    });

    spread.current = 0.35 + 0.65 * bell(v, 3, 0.2, 0.7);
    open.current = bell(v, 5, 0.15, 0.5);
  });

  const roads = (
    <>
      {[-L, L].map((p) => (
        <group key={`x${p}`}>
          <mesh position={[0, 0.03, p]} receiveShadow>
            <boxGeometry args={[HALF * 2, 0.04, 0.95]} />
            <meshStandardMaterial color="#3a3531" roughness={0.9} />
          </mesh>
          <mesh position={[p, 0.031, 0]} receiveShadow>
            <boxGeometry args={[0.95, 0.04, HALF * 2]} />
            <meshStandardMaterial color="#3a3531" roughness={0.9} />
          </mesh>
          {Array.from({ length: 16 }, (_, i) => (
            <group key={i}>
              <mesh position={[-HALF + 0.5 + i, 0.052, p]}>
                <boxGeometry args={[0.4, 0.005, 0.04]} />
                <meshBasicMaterial color={P.paper} />
              </mesh>
              <mesh position={[p, 0.053, -HALF + 0.5 + i]}>
                <boxGeometry args={[0.04, 0.005, 0.4]} />
                <meshBasicMaterial color={P.paper} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </>
  );

  return (
    <>
      <color attach="background" args={[P.cream]} />
      <Sun position={[-8, 14, 6]} size={12} intensity={1.8} />

      {/* Lantai bayangan (warna latar tetap krem) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.25, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial opacity={0.18} />
      </mesh>

      {/* Alas diorama */}
      <RoundedBox args={[HALF * 2, 1.2, HALF * 2]} radius={0.12} position={[0, -0.62, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={P.terracotta} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0.0, 0]} receiveShadow>
        <boxGeometry args={[HALF * 2 - 0.3, 0.04, HALF * 2 - 0.3]} />
        <meshStandardMaterial color="#E9DFD0" roughness={0.95} />
      </mesh>
      {roads}
      <Cars />

      {/* 01 FarmAgent — pabrik ponsel */}
      <group position={[-5.2, 0, -5.2]}>
        <mesh position={[-0.2, 0.7, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 1.4, 1.6]} />
          <meshStandardMaterial color={P.paper} roughness={0.85} />
        </mesh>
        {[-1.4, -0.6, 0.2, 1.0].map((x) => (
          <mesh key={x} position={[x, 1.6, -0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 1.6, 3, 1, false]} />
            <meshStandardMaterial color={P.terracottaLight} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[1.3, 1.5, -1.1]} castShadow>
          <cylinderGeometry args={[0.16, 0.2, 1.8, 16]} />
          <meshStandardMaterial color={P.terracottaDark} />
        </mesh>
        <PhoneFarm rows={2} cols={6} running={running} onToggle={onToggle} position={[-0.2, 0.78, 0.36]} scale={0.56} />
        <Tree position={[1.6, 0, 1.4]} />
        <Tree position={[-1.8, 0, 1.5]} s={0.8} />
      </group>

      {/* 02 Sonar — menara kaca kantor agen */}
      <group position={[5.2, 0, -5.2]}>
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.0, 2.1, 0.2, 48]} />
          <meshStandardMaterial color={P.sand} />
        </mesh>
        <AgentOffice size={2.2} position={[0, 1.42, 0]} rotation-y={Math.PI / 4} />
        <Tree position={[-1.8, 0.2, 1.4]} s={0.9} />
        <Tree position={[1.7, 0.2, 1.5]} s={0.7} />
      </group>

      {/* 03 PromptedSite — plaza dengan papan kartu */}
      <group position={[-5.2, 0, 5.2]}>
        <mesh position={[0, 0.06, 0]} receiveShadow>
          <boxGeometry args={[4, 0.12, 4]} />
          <meshStandardMaterial color="#F1E6D6" />
        </mesh>
        <CardFan spread={spread} position={[0, 1.15, 0]} rotation-y={Math.PI / 4} scale={1.25} />
        <House position={[-1.4, 0.12, 1.4]} roof={P.ink} />
        <House position={[1.4, 0.12, -1.4]} />
      </group>

      {/* 04 ViralEngine — observatorium di bukit */}
      <group position={[5.2, 0, 5.2]}>
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.6, 2.2, 0.5, 48]} />
          <meshStandardMaterial color={P.sage} roughness={0.9} />
        </mesh>
        <TrendRadar position={[0, 0.62, 0]} scale={1.35} />
        <Tree position={[1.9, 0, -1.2]} />
      </group>

      {/* 05 Security — benteng gembok di tengah */}
      <group position={[0, 0, 0]}>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.55, 0.3 + (i % 2) * 0.08, Math.sin(a) * 1.55]} rotation-y={-a} castShadow receiveShadow>
              <boxGeometry args={[0.18, 0.6 + (i % 2) * 0.16, 0.58]} />
              <meshStandardMaterial color={P.sand} roughness={0.85} />
            </mesh>
          );
        })}
        <Padlock open={open} position={[0, 0.75, 0]} rotation-y={Math.PI / 4} scale={1.05} />
      </group>

      {/* Personal — kampus IT-PLN & rumah */}
      <group position={[-5.4, 0, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 1, 1.2]} />
          <meshStandardMaterial color={P.paper} />
        </mesh>
        <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.0, 1.3, 0.4, 4, 1]} />
          <meshStandardMaterial color={P.terracottaDark} />
        </mesh>
        {[-0.8, -0.4, 0, 0.4, 0.8].map((x) => (
          <mesh key={x} position={[x, 0.45, 0.66]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.9, 12]} />
            <meshStandardMaterial color={P.sand} />
          </mesh>
        ))}
        <mesh position={[1.4, 0.8, 0.6]}>
          <cylinderGeometry args={[0.02, 0.02, 1.6, 8]} />
          <meshStandardMaterial color={P.ink} />
        </mesh>
        <mesh position={[1.62, 1.45, 0.6]}>
          <boxGeometry args={[0.42, 0.26, 0.01]} />
          <meshStandardMaterial color={P.terracotta} side={THREE.DoubleSide} />
        </mesh>
        <Tree position={[-1.5, 0, 1.5]} />
        <Tree position={[0.4, 0, 1.6]} s={0.8} />
      </group>
      <group position={[5.2, 0, 0]}>
        <House position={[-0.8, 0, -0.9]} />
        <House position={[0.7, 0, -0.6]} roof={P.ink} r={0.4} />
        <House position={[-0.5, 0, 0.9]} color={P.sand} />
        <Tree position={[1.2, 0, 1.0]} />
        <Tree position={[0.4, 0, 0.3]} s={0.7} />
      </group>
      <group position={[0, 0, -5.4]}>
        {Array.from({ length: 9 }, (_, i) => (
          <Tree key={i} position={[((i * 1.37) % 3) - 1.5, 0, ((i * 0.83) % 2.6) - 1.3]} s={0.7 + (i % 3) * 0.2} />
        ))}
      </group>
      <group position={[0, 0, 5.4]}>
        <House position={[-1, 0, 0]} roof={P.terracottaDark} />
        <House position={[0.2, 0, -0.6]} color={P.sand} />
        <House position={[1.2, 0, 0.5]} roof={P.ink} r={-0.3} />
      </group>

    </>
  );
}
