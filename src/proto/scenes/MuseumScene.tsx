"use client";

// Konsep 4 — The Museum (ide Zaidan): masuk lewat gerbang, menyusuri lorong proyek
// (objek di atas plinth kiri-kanan), belok kanan ke ruang sertifikat, berakhir di dinding pendidikan.
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { P } from "../palette";
import { canvasFont } from "../fonts";
import { certTexture, placardTexture, wallTextTexture } from "../textures";
import { protoProjects as PP } from "../content";
import { PhoneFarm } from "../objects/PhoneFarm";
import { AgentOffice } from "../objects/AgentOffice";
import { CardFan } from "../objects/CardFan";
import { TrendRadar } from "../objects/TrendRadar";
import { Padlock } from "../objects/Padlock";
import { bell, stopMix } from "../useScrollProgress";
import type { Drive } from "../objects/types";

const EYE = 1.6;
const HW = 3.5; // setengah lebar lorong
const CEIL = 4.2;
const END = -27; // ujung lorong / awal ruang sertifikat
const HALL_X = 17; // ujung ruang sertifikat

/** Plinth: z & sisi (−1 kiri, +1 kanan). */
const PLINTHS = PP.map((p, i) => ({ p, z: -3.5 - i * 5, side: i % 2 === 0 ? -1 : 1 }));

export const MUSEUM_STOPS = [
  { pos: [0, EYE, 7.5], look: [0, 2.2, 0] }, // gerbang
  ...PLINTHS.map((pl) => ({
    pos: [-pl.side * 0.4, EYE, pl.z + 2.9],
    look: [pl.side * 2.3, 1.45, pl.z - 0.3],
  })),
  { pos: [3.2, 1.7, -29.6], look: [9, 1.75, -33] }, // dinding sertifikat
  { pos: [10.5, EYE, -30], look: [HALL_X, 1.8, -30] }, // dinding pendidikan & kontak
] as const;

const CERTS = [
  ["Penetration Testing Bootcamp", "ID-Networkers", "2026"],
  ["HCIA-Security", "Huawei", "2026"],
  ["Google Cybersecurity Professional", "Google", "2026"],
  ["Azure AI Fundamentals", "Microsoft", "2026"],
  ["Cyber Security & Computer Network", "Coding Studio", "2025"],
  ["Penetration Testing & Command Linux", "Coding Studio", "2024"],
  ["MOS Word 2019", "Microsoft", "2023"],
] as const;

type Fonts = { serif: string; sans: string; mono: string; hand: string };

function useFonts() {
  const [fonts, set] = useState<Fonts | null>(null);
  useEffect(() => {
    Promise.all([
      canvasFont("--font-instrument-serif", "96px"),
      canvasFont("--font-inter-tight", "34px"),
      canvasFont("--font-jetbrains-mono", "500 30px"),
      canvasFont("--font-caveat", "700 90px"),
    ]).then(([serif, sans, mono, hand]) => set({ serif, sans, mono, hand }));
  }, []);
  return fonts;
}

function Box({ size, position, color, rough = 0.9 }: { size: [number, number, number]; position: [number, number, number]; color: string; rough?: number }) {
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} />
    </mesh>
  );
}

/** Dinding dengan pita terakota di bagian bawah (wainscot). */
function Wall({ from, to }: { from: [number, number]; to: [number, number] }) {
  const dx = to[0] - from[0], dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const cx = (from[0] + to[0]) / 2, cz = (from[1] + to[1]) / 2;
  const rot = Math.atan2(dx, dz) + Math.PI / 2;
  return (
    <group position={[cx, 0, cz]} rotation-y={rot}>
      <mesh position={[0, CEIL / 2, 0]} receiveShadow>
        <boxGeometry args={[len, CEIL, 0.2]} />
        <meshStandardMaterial color={P.paper} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.45, 0]} receiveShadow>
        <boxGeometry args={[len, 0.9, 0.24]} />
        <meshStandardMaterial color={P.terracotta} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Framed({ map, w, h, position, rotY = 0, frame = "#3b2a1f" }: { map: THREE.Texture; w: number; h: number; position: [number, number, number]; rotY?: number; frame?: string }) {
  return (
    <group position={position} rotation-y={rotY}>
      <mesh castShadow>
        <boxGeometry args={[w + 0.12, h + 0.12, 0.06]} />
        <meshStandardMaterial color={frame} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={map} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function MuseumScene({ f, running, onToggle }: { f: Drive; running: boolean; onToggle: () => void }) {
  const fonts = useFonts();
  const tex = useMemo(() => {
    if (!fonts) return null;
    return {
      gate: wallTextTexture("A MUSEUM OF SELF-RUNNING MACHINES", "Zaidan Jibran Azhar", "come in, the machines are running", fonts.serif, fonts.mono, fonts.hand),
      end: wallTextTexture("THE PERSON BEHIND THEM", "B.Eng. Informatics", "IT-PLN · GPA 3.65 · class of 2026", fonts.serif, fonts.mono, fonts.hand),
      placards: PP.map((p) => placardTexture(p.no, p.name, p.line, fonts.serif, fonts.sans, fonts.mono)),
      certs: CERTS.map(([t, i, y]) => certTexture(t, i, y, fonts.serif, fonts.mono)),
      jobs: [
        ["Kerja Web3", "Fullstack & AI Automation", "2026 — now"],
        ["Timedoor Academy", "Programming Teacher", "2026"],
        ["Kementerian PUPR", "Frontend Developer Intern", "2025"],
        ["PT PLN (Persero)", "Data Analyst Intern", "2025"],
      ].map(([o, r, y]) => certTexture(r, o, y, fonts.serif, fonts.mono)),
    };
  }, [fonts]);
  useEffect(
    () => () => {
      if (!tex) return;
      [tex.gate, tex.end, ...tex.placards, ...tex.certs, ...tex.jobs].forEach((t) => t.dispose());
    },
    [tex],
  );

  const look = useRef(new THREE.Vector3(0, 2.2, 0));
  const spread = useRef(0.4);
  const open = useRef(0);
  const explode = useRef(0);
  const spots = useRef<THREE.SpotLight[]>([]);

  useFrame((state, dt) => {
    const { camera, pointer } = state;
    const v = f.current;
    const { a, b, t } = stopMix(v, MUSEUM_STOPS.length);
    const A = MUSEUM_STOPS[a], B = MUSEUM_STOPS[b];
    const px = THREE.MathUtils.lerp(A.pos[0], B.pos[0], t);
    const py = THREE.MathUtils.lerp(A.pos[1], B.pos[1], t) + Math.sin(v * Math.PI * 2 * 2) * 0.03; // langkah kaki halus
    const pz = THREE.MathUtils.lerp(A.pos[2], B.pos[2], t);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px, 5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, py, 5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, pz, 5, dt);
    const lx = THREE.MathUtils.lerp(A.look[0], B.look[0], t) + pointer.x * 0.6;
    const ly = THREE.MathUtils.lerp(A.look[1], B.look[1], t) + pointer.y * 0.3;
    const lz = THREE.MathUtils.lerp(A.look[2], B.look[2], t);
    look.current.set(
      THREE.MathUtils.damp(look.current.x, lx, 5, dt),
      THREE.MathUtils.damp(look.current.y, ly, 5, dt),
      THREE.MathUtils.damp(look.current.z, lz, 5, dt),
    );
    camera.lookAt(look.current);

    // Lampu sorot plinth menyala saat pengunjung berdiri di depannya.
    spots.current.forEach((s, i) => {
      if (s) s.intensity = THREE.MathUtils.damp(s.intensity, 6 + 30 * bell(v, i + 1, 0.2, 0.7), 6, dt);
    });
    explode.current = bell(v, 2, 0.15, 0.6) * 0.6;
    spread.current = 0.3 + 0.7 * bell(v, 3, 0.2, 0.7);
    open.current = bell(v, 5, 0.15, 0.5);
  });

  const objects = [
    <PhoneFarm key="f" rows={2} cols={4} running={running} onToggle={onToggle} scale={0.42} position={[0, 0.48, 0]} />,
    <AgentOffice key="s" size={0.95} explode={explode} position={[0, 0.58, 0]} rotation-y={0.5} />,
    <CardFan key="p" spread={spread} scale={0.55} position={[0, 0.44, 0]} />,
    <TrendRadar key="v" scale={0.55} position={[0, 0.06, 0]} />,
    <Padlock key="l" open={open} scale={0.62} position={[0, 0.3, 0]} />,
  ];

  return (
    <>
      <color attach="background" args={[P.cream]} />
      <fog attach="fog" args={[P.cream, 18, 46]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff6ea", "#cbb59a", 0.9]} />
      <directionalLight
        castShadow
        position={[6, 14, -8]}
        intensity={0.9}
        color="#fff1df"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0005}
      />

      {/* Lantai kayu & plafon dengan skylight */}
      <mesh rotation-x={-Math.PI / 2} position={[6, 0, -12]} receiveShadow>
        <planeGeometry args={[40, 50]} />
        <meshStandardMaterial color="#D9C2A0" roughness={0.55} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[6, CEIL, -12]}>
        <planeGeometry args={[40, 50]} />
        <meshStandardMaterial color={P.paper} roughness={1} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} rotation-x={Math.PI / 2} position={[0, CEIL - 0.01, 4 - i * 5]}>
          <planeGeometry args={[2.2, 1.4]} />
          <meshBasicMaterial color="#FFF8EE" toneMapped={false} />
        </mesh>
      ))}

      {/* Dinding */}
      <Wall from={[-HW, 9]} to={[-HW, -33]} />
      <Wall from={[HW, 9]} to={[HW, END]} />
      <Wall from={[-HW, -33]} to={[HALL_X, -33]} />
      <Wall from={[HW, END]} to={[HALL_X, END]} />
      <Wall from={[HALL_X, END]} to={[HALL_X, -33]} />

      {/* Gerbang masuk dengan judul */}
      <Box size={[1.4, CEIL, 0.5]} position={[-HW + 0.7, CEIL / 2, 2]} color={P.paper} />
      <Box size={[1.4, CEIL, 0.5]} position={[HW - 0.7, CEIL / 2, 2]} color={P.paper} />
      <Box size={[HW * 2, 1.2, 0.5]} position={[0, CEIL - 0.6, 2]} color={P.paper} />
      {tex && (
        <mesh position={[0, CEIL - 0.6, 2.26]}>
          <planeGeometry args={[4.4, 1.29]} />
          <meshStandardMaterial map={tex.gate} roughness={0.9} />
        </mesh>
      )}

      {/* Lorong proyek */}
      {PLINTHS.map((pl, i) => {
        const x = pl.side * 2.25;
        return (
          <group key={pl.p.key}>
            <group position={[x, 0, pl.z]}>
              <Box size={[1.15, 1.0, 1.15]} position={[0, 0.5, 0]} color={P.paper} rough={0.7} />
              <Box size={[1.2, 0.05, 1.2]} position={[0, 1.02, 0]} color={P.terracotta} rough={0.6} />
              <group position={[0, 1.05, 0]} rotation-y={-pl.side * 0.5}>
                {objects[i]}
              </group>
            </group>
            <spotLight
              ref={(s) => {
                if (!s) return;
                spots.current[i] = s;
                s.target.position.set(x, 1, pl.z);
                s.target.updateMatrixWorld();
              }}
              position={[x * 0.7, CEIL - 0.2, pl.z + 1.2]}
              angle={0.45}
              penumbra={0.8}
              intensity={6}
              distance={8}
              decay={1.4}
              color="#ffe9d2"
            />
            {tex && (
              <group position={[pl.side * (HW - 0.12), 1.95, pl.z - 0.1]} rotation-y={-pl.side * Math.PI / 2}>
                <mesh>
                  <planeGeometry args={[1.5, 1.0]} />
                  <meshStandardMaterial map={tex.placards[i]} roughness={0.9} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* Ruang sertifikat: dinding belakang penuh bingkai */}
      {tex &&
        tex.certs.map((m, i) => (
          <Framed key={i} map={m} w={1.3} h={0.98} position={[1.4 + i * 2.05, 1.7 + (i % 2 ? 0.35 : -0.1), -33 + 0.14]} />
        ))}

      {/* Dinding penutup: pendidikan + 4 pengalaman kerja */}
      {tex && (
        <group position={[HALL_X - 0.14, 0, -30]} rotation-y={-Math.PI / 2}>
          <mesh position={[0, 2.85, 0]}>
            <planeGeometry args={[4.6, 1.35]} />
            <meshStandardMaterial map={tex.end} roughness={0.9} />
          </mesh>
          {tex.jobs.map((m, i) => (
            <Framed key={i} map={m} w={1.05} h={0.79} position={[-1.95 + i * 1.3, 1.35, 0.02]} frame={i === 0 ? P.terracottaDark : "#3b2a1f"} />
          ))}
        </group>
      )}
    </>
  );
}
