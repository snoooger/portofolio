"use client";

// Museum: lobi dengan satu-satunya meja (meja penjaga, hero) → gapura pameran (about) → lorong 5 proyek
// → skills → galeri pengalaman & sertifikat → dinding pendidikan → pintu keluar + kartu nama (kontak/footer).
// Teks penjelasan = teks 3D melayang (FloatText) yang zoom in/out mengikuti scroll. Semua gerak objek
// mengikuti scroll; yang bisa diklik hanya link kontak.
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { P } from "../palette";
import { businessCardTexture, certTexture } from "../textures";
import { bell } from "../useScrollProgress";
import { PhoneRackHD, StudioDisplayHD, MonitorWallHD, LaptopRigHD } from "../hd/Devices";
import { SonarOffice } from "../hd/SonarOffice";
import { Asset, MODELS } from "../hd/Asset";
import { FINAL_STOPS, MUSEUM as M, stopIndex } from "./stops";
import { GuardDesk } from "./GuardDesk";
import { FloatText } from "./FloatText";
import { FONT, type Item } from "./Lettering";
import { EMAIL, NAME, type Copy } from "./copy";
import type { Fonts } from "./useFonts";
import type { Drive } from "../objects/types";

const JOB_FRAMES = [
  { role: "Fullstack & AI Automation", org: "Kerja Web3", period: "2026 — now" },
  { role: "Programming Teacher", org: "Timedoor Academy", period: "2026" },
  { role: "Frontend Developer Intern", org: "Kementerian PUPR", period: "2025" },
  { role: "Data Analyst Intern", org: "PT PLN (Persero)", period: "2025" },
];

export const CERTS = [
  ["Penetration Testing Bootcamp", "ID-Networkers", "2026"],
  ["HCIA-Security", "Huawei", "2026"],
  ["Google Cybersecurity Professional", "Google", "2026"],
  ["Azure AI Fundamentals", "Microsoft", "2026"],
  ["Cyber Security & Computer Network", "Coding Studio", "2025"],
  ["Penetration Testing & Command Linux", "Coding Studio", "2024"],
  ["MOS Word 2019", "Microsoft", "2023"],
] as const;

const LINKEDIN = "https://linkedin.com/in/zaidanjibranazhar";
const GITHUB = "https://github.com/snoooger";
const CV = "/cv/Zaidan-Jibran-Azhar-CV.pdf";

function openUrl(url: string) {
  if (url.startsWith("mailto:")) window.location.href = url;
  else window.open(url, "_blank", "noopener");
}

/** Tekstur PBR (Poly Haven) untuk lantai parket & dinding plester. */
function usePBR() {
  const floor = useTexture({
    map: "/assets-3d/textures/herringbone_parquet/herringbone_parquet_diff_1k.jpg",
    normalMap: "/assets-3d/textures/herringbone_parquet/herringbone_parquet_nor_gl_1k.jpg",
    roughnessMap: "/assets-3d/textures/herringbone_parquet/herringbone_parquet_rough_1k.jpg",
  });
  // Dinding: hanya relief (normal & roughness) dari plester; warnanya tetap putih hangat.
  const wall = useTexture({
    normalMap: "/assets-3d/textures/white_plaster_02/white_plaster_02_nor_gl_1k.jpg",
    roughnessMap: "/assets-3d/textures/white_plaster_02/white_plaster_02_rough_1k.jpg",
  });
  return useMemo(() => {
    const prep = (set: Record<string, THREE.Texture>, rx: number, ry: number) => {
      const out: Record<string, THREE.Texture> = {};
      for (const [k, t] of Object.entries(set)) {
        const c = t.clone();
        c.wrapS = c.wrapT = THREE.RepeatWrapping;
        c.repeat.set(rx, ry);
        c.anisotropy = 8;
        if (k === "map") c.colorSpace = THREE.SRGBColorSpace;
        c.needsUpdate = true;
        out[k] = c;
      }
      return out;
    };
    return { floor: prep(floor, 30, 30), wall: (len: number) => prep(wall, len / 2.5, M.ceil / 2.5) };
  }, [floor, wall]);
}

function Wall({ from, to, pbr }: { from: [number, number]; to: [number, number]; pbr: (len: number) => Record<string, THREE.Texture> }) {
  const dx = to[0] - from[0], dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const rot = Math.atan2(dx, dz) + Math.PI / 2;
  const maps = useMemo(() => pbr(len), [pbr, len]);
  return (
    <group position={[(from[0] + to[0]) / 2, 0, (from[1] + to[1]) / 2]} rotation-y={rot}>
      <mesh position={[0, M.ceil / 2, 0]} receiveShadow>
        <boxGeometry args={[len, M.ceil, 0.2]} />
        <meshStandardMaterial {...maps} color="#f3ede4" normalScale={new THREE.Vector2(0.8, 0.8)} />
      </mesh>
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[len, 0.14, 0.23]} />
        <meshStandardMaterial color={P.terracotta} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Framed({
  map,
  w,
  h,
  position,
  rotY = 0,
  frame = "#2e2620",
  onMaterial,
}: {
  map: THREE.Texture;
  w: number;
  h: number;
  position: [number, number, number];
  rotY?: number;
  frame?: string;
  onMaterial?: (m: THREE.MeshStandardMaterial | null) => void;
}) {
  return (
    <group position={position} rotation-y={rotY}>
      <RoundedBox args={[w + 0.12, h + 0.12, 0.05]} radius={0.01} castShadow>
        <meshStandardMaterial color={frame} roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[w + 0.04, h + 0.04]} />
        <meshStandardMaterial color="#fbf8f2" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.027]}>
        <planeGeometry args={[w - 0.06, h - 0.06]} />
        <meshStandardMaterial ref={onMaterial} map={map} roughness={0.8} emissive="#ffffff" emissiveMap={map} emissiveIntensity={0} />
      </mesh>
    </group>
  );
}

function Plinth({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.1, 1.0, 1.1]} radius={0.02} smoothness={3} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f7f3ec" roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[1.14, 0.04, 1.14]} radius={0.012} position={[0, 1.02, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={P.terracotta} roughness={0.45} />
      </RoundedBox>
    </group>
  );
}

/** Pintu keluar di dinding ujung: kusen, cahaya siang di luar, papan EXIT. */
function ExitDoor({ z }: { z: number }) {
  const x = M.hallX - 0.1;
  return (
    <group position={[x, 0, z]} rotation-y={-Math.PI / 2}>
      <mesh position={[0, 1.15, 0]}>
        <planeGeometry args={[1.5, 2.3]} />
        <meshBasicMaterial color="#fffaf0" toneMapped={false} />
      </mesh>
      {[-0.8, 0.8].map((dx) => (
        <RoundedBox key={dx} args={[0.1, 2.45, 0.12]} radius={0.01} position={[dx, 1.22, 0.02]} castShadow>
          <meshStandardMaterial color="#2e2620" roughness={0.5} />
        </RoundedBox>
      ))}
      <RoundedBox args={[1.7, 0.1, 0.12]} radius={0.01} position={[0, 2.42, 0.02]} castShadow>
        <meshStandardMaterial color="#2e2620" roughness={0.5} />
      </RoundedBox>
      <group position={[0, 2.75, 0.04]}>
        <RoundedBox args={[0.62, 0.2, 0.05]} radius={0.01}>
          <meshStandardMaterial color="#2f6b46" roughness={0.4} />
        </RoundedBox>
        <Text position={[0, 0, 0.027]} font={FONT.sansBold} fontSize={0.09} letterSpacing={0.12} color="#f3f7f2">
          EXIT · KELUAR
        </Text>
      </group>
    </group>
  );
}

/** Dudukan kartu nama di samping pintu keluar. */
function CardStand({ fonts, position, role }: { fonts: Fonts; position: [number, number, number]; role: string }) {
  const card = useMemo(
    () => businessCardTexture(NAME, role, [EMAIL, "linkedin.com/in/zaidanjibranazhar", "github.com/snoooger"], fonts.serif, fonts.sans, fonts.mono),
    [fonts, role],
  );
  useEffect(() => () => card.dispose(), [card]);
  return (
    <group position={position} rotation-y={-Math.PI / 2 + 0.35}>
      <RoundedBox args={[0.42, 1.0, 0.32]} radius={0.015} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f7f3ec" roughness={0.55} />
      </RoundedBox>
      <group position={[0, 1.02, 0.02]} rotation-x={-0.5}>
        {/* Wadah akrilik */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.11, 0.07, 0.03]} />
          <meshPhysicalMaterial transmission={1} roughness={0.05} thickness={0.01} transparent />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, 0.032, -0.008 + i * 0.003]} castShadow>
            <boxGeometry args={[0.089, 0.051, 0.0008]} />
            <meshStandardMaterial color="#FDFBF6" roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 0.032, 0.0047]}>
          <planeGeometry args={[0.089, 0.051]} />
          <meshStandardMaterial map={card} roughness={0.8} />
        </mesh>
      </group>
      {/* Satu kartu tergeletak di atas dudukan, lebih besar dan mudah terbaca */}
      <mesh position={[0.0, 1.003, -0.07]} rotation={[-Math.PI / 2, 0, 0.1]} castShadow>
        <planeGeometry args={[0.26, 0.149]} />
        <meshStandardMaterial map={card} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function MuseumWorld({ fonts, f, copy }: { fonts: Fonts | null; f: Drive; copy: Copy }) {
  const pbr = usePBR();
  const tex = useMemo(() => {
    if (!fonts) return null;
    return {
      jobs: JOB_FRAMES.map((j) => certTexture(j.role, j.org, j.period, fonts.serif, fonts.mono, "EXPERIENCE")),
      certs: CERTS.map(([t, i, y]) => certTexture(t, i, y, fonts.serif, fonts.mono)),
      diploma: certTexture("Informatics", "Institut Teknologi PLN", "GPA 3.65 / 4.00 · 2026", fonts.serif, fonts.mono, "BACHELOR OF ENGINEERING"),
    };
  }, [fonts]);
  useEffect(
    () => () => {
      if (tex) [tex.diploma, ...tex.jobs, ...tex.certs].forEach((t) => t.dispose());
    },
    [tex],
  );

  const S = {
    about: stopIndex("about"),
    first: stopIndex("farmagent"),
    materials: stopIndex("materials"),
    jobs: stopIndex("experience"),
    certs: stopIndex("certificates"),
    edu: stopIndex("education"),
    contact: stopIndex("contact"),
  };

  // Penggerak scroll per objek (0–1). Tidak ada klik: semua mengikuti posisi scroll.
  const r0 = useRef(0), r1 = useRef(0), r2 = useRef(0), r3 = useRef(0), r4 = useRef(0);
  const runs = [r0, r1, r2, r3, r4];
  const spots = useRef<THREE.SpotLight[]>([]);
  const glows = useRef<Record<string, THREE.MeshStandardMaterial | null>>({});
  const setGlow = useCallback(
    (key: string) => (m: THREE.MeshStandardMaterial | null) => {
      glows.current[key] = m;
    },
    [],
  );

  useFrame((_, dt) => {
    const v = f.current;
    runs.forEach((d, i) => {
      const k = S.first + i;
      d.current = THREE.MathUtils.clamp((v - (k - 0.5)) / 0.9, 0, 1) * (v > k + 0.75 ? 0 : 1);
    });
    spots.current.forEach((s, i) => {
      if (s) s.intensity = THREE.MathUtils.damp(s.intensity, 4 + 26 * bell(v, S.first + i, 0.2, 0.7), 6, dt);
    });
    const lit = (key: string, k: number) => {
      const m = glows.current[key];
      if (m) m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, 0.14 * bell(v, k, 0.2, 0.6), 6, dt);
    };
    JOB_FRAMES.forEach((_, i) => lit(`job${i}`, S.jobs));
    CERTS.forEach((_, i) => lit(`cert${i}`, S.certs));
    lit("diploma", S.edu);
  });

  const exhibit = (key: string, i: number) => {
    if (!fonts) return null;
    const run = runs[i];
    switch (key) {
      case "farmagent":
        return <PhoneRackHD fonts={fonts} run={run} scale={2.0} position={[0, 0.45, 0]} />;
      case "sonar":
        return <SonarOffice run={run} scale={1.3} position={[0, 0.0, 0]} />;
      case "promptedsite":
        return <StudioDisplayHD fonts={fonts} scroll={run} scale={1.5} position={[0, 0.61, 0]} />;
      case "viralengine":
        return <MonitorWallHD fonts={fonts} scroll={run} scale={1.05} position={[0, 0.46, 0]} />;
      case "security":
        return <LaptopRigHD fonts={fonts} scroll={run} scale={2.0} position={[-0.12, 0.015, 0.05]} />;
    }
  };

  const projectItems = (i: number): Item[] => {
    const p = copy.projects[i];
    return [
      { kind: "kicker", text: p.tag },
      { kind: "title", text: p.name },
      { kind: "body", text: p.line },
      { kind: "facts", facts: [...p.facts] },
      { kind: "medium", text: p.medium },
      { kind: "hand", text: p.note },
    ];
  };

  const [gx, gz] = M.guard;
  const [cx, cz] = M.card;

  return (
    <group>
      <ambientLight intensity={0.25} />
      <hemisphereLight args={["#fff6ea", "#cbb59a", 0.55]} />
      <directionalLight
        castShadow
        position={[10, 16, -6]}
        intensity={1.0}
        color="#fff1df"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      >
        <object3D attach="target" position={[10, 0, -12]} />
      </directionalLight>

      {/* Lantai parket herringbone, plafon, skylight */}
      <mesh rotation-x={-Math.PI / 2} position={[12, 0, -12]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial {...pbr.floor} color="#eadfce" />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[12, M.ceil, -12]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#f7f3ec" roughness={1} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={`a${i}`} rotation-x={Math.PI / 2} position={[0, M.ceil - 0.01, 8 - i * 4.6]}>
          <planeGeometry args={[2.2, 1.4]} />
          <meshBasicMaterial color="#FFF8EE" toneMapped={false} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`b${i}`} rotation-x={Math.PI / 2} position={[2 + i * 5, M.ceil - 0.01, (M.end + M.back) / 2]}>
          <planeGeometry args={[1.4, 2.2]} />
          <meshBasicMaterial color="#FFF8EE" toneMapped={false} />
        </mesh>
      ))}

      {/* Dinding */}
      <Wall pbr={pbr.wall} from={[-M.hw, M.lobbyZ]} to={[M.hw, M.lobbyZ]} />
      <Wall pbr={pbr.wall} from={[-M.hw, M.lobbyZ]} to={[-M.hw, M.back]} />
      <Wall pbr={pbr.wall} from={[M.hw, M.lobbyZ]} to={[M.hw, M.end]} />
      <Wall pbr={pbr.wall} from={[-M.hw, M.back]} to={[M.hallX, M.back]} />
      <Wall pbr={pbr.wall} from={[M.hw, M.end]} to={[M.hallX, M.end]} />
      <Wall pbr={pbr.wall} from={[M.hallX, M.end]} to={[M.hallX, M.back]} />

      {/* Lobi: satu-satunya meja (penjaga), CCTV, jam dinding, tanaman, gapura pameran */}
      <GuardDesk f={f} position={[gx, 0, gz]} copy={copy} />
      <Asset src={MODELS.cctv} position={[M.hw - 0.15, 3.7, 9.9]} rotation-y={-2.4} />
      <Asset src={MODELS.wallClock} position={[M.hw - 0.11, 2.75, 6.3]} rotation-y={-Math.PI / 2} />
      <Asset src={MODELS.plant} position={[-2.85, 0, 9.5]} />
      <Asset src={MODELS.plant} position={[2.9, 0, 2.9]} rotation-y={1.4} scale={0.9} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (M.hw - 0.7), M.ceil / 2, M.gateZ]} castShadow receiveShadow>
          <boxGeometry args={[1.4, M.ceil, 0.5]} />
          <meshStandardMaterial color="#f4efe7" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, M.ceil - 0.6, M.gateZ]} castShadow>
        <boxGeometry args={[M.hw * 2, 1.2, 0.5]} />
        <meshStandardMaterial color="#f4efe7" roughness={0.9} />
      </mesh>
      <FloatText
        f={f}
        k={S.about}
        stop={FINAL_STOPS[S.about]}
        rx={-1.22}
        ry={0.62}
        dist={1.7}
        yaw={0.12}
        scale={0.4}
        width={2.4}
        items={[
          { kind: "kicker", text: copy.about.kicker },
          { kind: "title", text: "Self-Running Machines", size: 0.3 },
          { kind: "body", text: copy.about.body },
          { kind: "facts", facts: [...copy.about.stats] },
          { kind: "facts", facts: [...copy.about.stats2] },
        ]}
      />

      {/* Lorong proyek */}
      {copy.projects.map((p, i) => {
        const z = M.plinthZ(i), side = M.plinthSide(i), x = side * 2.25;
        return (
          <group key={p.key}>
            <Plinth position={[x, 0, z]} />
            <group position={[x, 1.04, z]} rotation-y={-side * 0.6}>
              {exhibit(p.key, i)}
            </group>
            <spotLight
              ref={(s) => {
                if (!s) return;
                spots.current[i] = s;
                s.target.position.set(x, 1.2, z);
                s.target.updateMatrixWorld();
              }}
              position={[x * 0.6, M.ceil - 0.2, z + 1.3]}
              angle={0.42}
              penumbra={0.85}
              intensity={4}
              distance={8}
              decay={1.4}
              color="#ffe9d2"
            />
            <FloatText
              f={f}
              k={S.first + i}
              stop={FINAL_STOPS[S.first + i]}
              rx={side < 0 ? 0.06 : -1.04}
              ry={0.52}
              yaw={side < 0 ? -0.1 : 0.1}
              scale={0.38}
              width={2.45}
              items={projectItems(i)}
            />
          </group>
        );
      })}

      {/* Skills */}
      <FloatText
        f={f}
        k={S.materials}
        stop={FINAL_STOPS[S.materials]}
        rx={-1.2}
        ry={0.55}
        dist={1.7}
        scale={0.38}
        width={6.2}
        items={[
          { kind: "kicker", text: copy.materials.kicker },
          { kind: "title", text: copy.materials.title, size: 0.3 },
          ...copy.materials.groups.map((g) => ({ kind: "body" as const, text: `${g.t} — ${g.d}` })),
        ]}
      />

      {tex && (
        <>
          {tex.jobs.map((m, i) => (
            <Framed key={i} map={m} w={1.4} h={1.05} position={[M.jobX(i), 1.9, M.back + 0.13]} frame={i === 0 ? P.terracottaDark : "#2e2620"} onMaterial={setGlow(`job${i}`)} />
          ))}
          {tex.certs.map((m, i) => (
            <Framed key={i} map={m} w={1.3} h={0.98} position={[M.certX(i), 1.75 + (i % 2 ? 0.35 : -0.1), M.back + 0.13]} onMaterial={setGlow(`cert${i}`)} />
          ))}
          <Framed map={tex.diploma} w={1.9} h={1.42} position={[M.hallX - 0.13, 1.75, M.diplomaZ]} rotY={-Math.PI / 2} frame={P.terracottaDark} onMaterial={setGlow("diploma")} />
        </>
      )}
      <FloatText
        f={f}
        k={S.jobs}
        stop={FINAL_STOPS[S.jobs]}
        rx={-1.02}
        ry={0.5}
        dist={1.5}
        scale={0.34}
        width={2.4}
        items={[
          { kind: "kicker", text: copy.experience.kicker },
          { kind: "title", text: copy.experience.title, size: 0.28 },
          ...copy.experience.jobs.map((j) => ({ kind: "body" as const, text: j })),
        ]}
      />
      <FloatText
        f={f}
        k={S.certs}
        stop={FINAL_STOPS[S.certs]}
        rx={-1.02}
        ry={0.5}
        dist={1.5}
        scale={0.34}
        width={2.4}
        items={[
          { kind: "kicker", text: copy.certificates.kicker },
          { kind: "title", text: copy.certificates.title, size: 0.28 },
          { kind: "body", text: CERTS.map(([t, i, y]) => `${t} — ${i}, ${y}`).join("\n") },
        ]}
      />
      <FloatText
        f={f}
        k={S.edu}
        stop={FINAL_STOPS[S.edu]}
        rx={-1.02}
        ry={0.5}
        dist={1.5}
        scale={0.36}
        width={2.3}
        items={[
          { kind: "kicker", text: copy.education.kicker },
          { kind: "title", text: copy.education.title, size: 0.3 },
          { kind: "body", text: copy.education.body },
          { kind: "body", text: copy.education.thesis },
        ]}
      />

      {/* Pintu keluar + kartu nama: kontak sekaligus footer */}
      <ExitDoor z={M.exitZ} />
      {fonts && <CardStand fonts={fonts} position={[cx, 0, cz]} role={copy.role} />}
      <FloatText
        f={f}
        k={S.contact}
        stop={FINAL_STOPS[S.contact]}
        rx={-1.1}
        ry={0.55}
        dist={1.5}
        scale={0.34}
        width={2.2}
        items={[
          { kind: "kicker", text: copy.contact.kicker },
          { kind: "title", text: copy.contact.title, size: 0.28 },
          { kind: "body", text: copy.contact.body },
          { kind: "links", links: [{ label: EMAIL, onClick: () => openUrl(`mailto:${EMAIL}`), accent: true }] },
          { kind: "links", links: [{ label: "LinkedIn", onClick: () => openUrl(LINKEDIN) }, { label: "GitHub", onClick: () => openUrl(GITHUB) }] },
          { kind: "links", links: [{ label: copy.contact.cv, onClick: () => openUrl(CV) }] },
          { kind: "kicker", text: copy.contact.footer },
        ]}
      />
    </group>
  );
}
