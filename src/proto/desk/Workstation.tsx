"use client";

// Workstation: monitor 27" yang tersambung ke Mac mini, dan keyboard. Layar menampilkan proyek
// yang sedang dibahas (Sonar, PromptedSite, ViralEngine, Security) dan berganti mengikuti scroll.
// Di bezel kiri-bawah ada tumpukan post-it: lembar teratas berganti per proyek, lembar lama terkelupas jatuh.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { Cable } from "../hd/Devices";
import { thesisScreen, viralDashboard } from "./screens2";
import { promptedSite, sonarSite, type SiteFonts } from "./sites";
import { canvasFont } from "../fonts";
import { MacDesktop } from "./macos";
import { HD, Model, type Fit } from "./Model";
import type { Drive } from "../objects/types";
import type { Fonts } from "../final/useFonts";

const SCREEN_MESH = "NYVmzMLiovxElXF";

// panel layar di model Apple Studio Display
const MAC_FIT: Fit = { axis: "x", size: 0.197 };
const KEYB_FIT: Fit = { axis: "x", size: 0.33 };
/** Warna rata-rata tiap tampilan layar, untuk cahaya yang dipantulkan layar ke meja & keyboard. */
const SCREEN_GLOW = ["#8e8aa0", "#f1ebfb", "#9fb3d6", "#b9c3cf"];
RectAreaLightUniformsLib.init(); // sekali per modul; wajib untuk RectAreaLight di WebGLRenderer

/** Tumpukan post-it yang lembar atasnya berganti mengikuti `index`. */
export function NotePad({ notes, index, size = 0.12, ...props }: ThreeElements["group"] & { notes: THREE.Texture[]; index: Drive; size?: number }) {
  const top = useRef<THREE.MeshStandardMaterial>(null);
  const fallMat = useRef<THREE.MeshStandardMaterial>(null);
  const pivot = useRef<THREE.Group>(null);
  const sheet = useRef<THREE.Mesh>(null);
  const state = useRef({ cur: -1, prev: -1, t: 1 });

  // Lembar lama: (1) terkelupas dari selotip, berengsel di tepi atas; (2) lepas dan jatuh karena gravitasi,
  // berayun & berputar sedikit; (3) mendarat berbaring di meja di bawah monitor dan tetap di sana
  // sampai lembar berikutnya jatuh. Koordinat lokal post-it (bidangnya miring ±8° mengikuti panel):
  // permukaan meja ada di y ≈ −0.064 bila z lokal = 0.07. Mendarat ±2.5 mm di atas meja — di atas bidang
  // bayangan kontak (1.3 mm) supaya lembar tidak tampak "terpotong" masuk ke meja — dan di kanan keyboard.
  const PEEL = 0.55;
  const LAND = { x: 0.07, y: -0.0622, z: 0.07, rx: -Math.PI / 2 + 0.138, rz: 0.45 };

  useFrame((_, dt) => {
    const s = state.current;
    const want = THREE.MathUtils.clamp(Math.round(index.current), 0, notes.length - 1);
    if (want !== s.cur) {
      s.prev = s.cur;
      s.cur = want;
      s.t = s.prev < 0 ? 1 : 0;
      if (top.current) top.current.map = notes[want];
      if (fallMat.current && s.prev >= 0) fallMat.current.map = notes[s.prev];
    }
    s.t = Math.min(1, s.t + dt / 1.15);
    const g = pivot.current, m = sheet.current;
    if (!g || !m) return;
    g.visible = s.prev >= 0;
    const k = s.t;
    if (k < 0.2) {
      // Terkelupas: berengsel di tepi atas, bagian bawah terangkat keluar
      const p = THREE.MathUtils.smoothstep(k / 0.2, 0, 1);
      g.position.set(0, size / 2, 0.002);
      g.rotation.set(-PEEL * p, 0, 0);
      m.position.set(0, -size / 2, 0);
    } else {
      // Jatuh: pusat lembar mengikuti gravitasi (kuadratik), berayun lalu rebah di meja
      const p = (k - 0.2) / 0.8;
      const y0 = size / 2 - (size / 2) * Math.cos(PEEL), z0 = 0.002 + (size / 2) * Math.sin(PEEL);
      const sway = (1 - p) * Math.sin(p * 9);
      g.position.set(LAND.x * p + sway * 0.012, y0 + (LAND.y - y0) * p * p, z0 + (LAND.z - z0) * p);
      g.rotation.set(
        THREE.MathUtils.lerp(-PEEL, LAND.rx, 1 - (1 - p) * (1 - p)) + (1 - p) * Math.sin(p * 12) * 0.22,
        0,
        LAND.rz * p + sway * 0.18,
      );
      m.position.set(0, 0, 0);
    }
  });

  return (
    <group {...props}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0, -0.0006 * (i + 1)]} castShadow>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color={i === 0 ? "#efe1a2" : "#e6d690"} roughness={0.9} />
        </mesh>
      ))}
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial ref={top} map={notes[0]} roughness={0.85} />
      </mesh>
      {/* Selotip menjembatani tepi atas post-it dan bezel bawah monitor */}
      <mesh position={[0, size / 2, 0.0015]} rotation-z={-0.05}>
        <planeGeometry args={[size * 0.5, size * 0.15]} />
        <meshStandardMaterial color="#efe6cf" transparent opacity={0.72} roughness={0.9} depthWrite={false} />
      </mesh>
      {/* Lembar yang terkelupas & jatuh */}
      <group ref={pivot} visible={false}>
        <mesh ref={sheet} castShadow receiveShadow>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial ref={fallMat} map={notes[0]} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

export function Workstation({
  fonts,
  screen,
  scroll,
  notes,
  noteIndex,
  glow = false,
  ...props
}: ThreeElements["group"] & { fonts: Fonts; screen: Drive; scroll: Drive; notes: THREE.Texture[]; noteIndex: Drive; glow?: boolean }) {
  const area = useRef<THREE.RectAreaLight>(null);
  const panel = useRef<THREE.Mesh | null>(null);
  const placed = useRef(false);
  const glowColor = useMemo(() => SCREEN_GLOW.map((c) => new THREE.Color(c)), []);
  // Tiap proyek tampil di dalam jendela aplikasi pada desktop bergaya macOS (menu bar & dock kaca).
  // Font asli situs Sonar & PromptedSite dimuat dulu (async) sebelum layarnya digambar.
  const [site, setSite] = useState<SiteFonts | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all([
      canvasFont("--font-pixelify", "700 40px"),
      canvasFont("--font-worksans", "500 20px"),
      canvasFont("--font-worksans", "400 20px"),
      canvasFont("--font-bricolage", "800 40px"),
      canvasFont("--font-bricolage", "300 40px"),
      canvasFont("--font-bricolage", "500 20px"),
    ]).then(([pixel, work, , brico]) => alive && setSite({ pixel, work, brico, mono: fonts.mono }));
    return () => {
      alive = false;
    };
  }, [fonts]);
  const desktops = useMemo(() => {
    if (!site) return null;
    const src = (t: THREE.Texture) => {
      const c = t.image as HTMLCanvasElement;
      t.dispose();
      return c;
    };
    return [
      new MacDesktop(sonarSite(site), fonts, { app: "Browser", title: "sonar-seo.vercel.app", url: true, active: 1 }),
      new MacDesktop(promptedSite(site), fonts, { app: "Browser", title: "promptedsite.com", dark: true, url: true, active: 1 }),
      new MacDesktop(src(viralDashboard(fonts)), fonts, { app: "Browser", title: "ViralEngine — Trend radar", dark: true, url: true, active: 1 }),
      new MacDesktop(src(thesisScreen(fonts)), fonts, { app: "Notebook", title: "thesis.ipynb", active: 5 }),
    ];
  }, [fonts, site]);
  useEffect(() => () => desktops?.forEach((d) => d.dispose()), [desktops]);
  const screens = useMemo(() => desktops?.map((d) => d.texture) ?? [], [desktops]);

  // Material layar dipasang ke panel layar model Studio Display.
  const mat = useRef<THREE.MeshBasicMaterial>(new THREE.MeshBasicMaterial({ color: "#0a0a0a", toneMapped: false }));
  const onDisplayMesh = useCallback((m: THREE.Mesh) => {
    if (m.name !== SCREEN_MESH) return;
    m.material = mat.current;
    panel.current = m;
  }, []);
  const cur = useRef(-1);
  const wake = useRef(0);

  useFrame((_, dt) => {
    const m = mat.current;
    if (!m) return;
    const i = Math.round(screen.current);
    const on = i >= 0 && i < screens.length;
    if (on && i !== cur.current) {
      cur.current = i;
      m.map = screens[i];
      m.needsUpdate = true;
      wake.current = 0;
    }
    if (!on) cur.current = -1;
    wake.current = Math.min(1, wake.current + dt * 3);
    // Layar mati (gelap) di luar bagian proyek; menyala dengan kedip singkat saat berganti.
    const level = on ? 0.25 + 0.75 * wake.current : 0.06;
    m.color.setScalar(THREE.MathUtils.damp(m.color.r, level, 8, dt));
    if (i === 1) desktops?.[1].draw(scroll.current); // halaman PromptedSite digulir di dalam jendela

    // Cahaya layar: area light seukuran panel, sedikit di depannya, menghadap pengguna.
    const L = area.current;
    if (!L) return;
    if (!placed.current && panel.current && L.parent) {
      const box = new THREE.Box3().setFromObject(panel.current);
      const c = L.parent.worldToLocal(box.getCenter(new THREE.Vector3()));
      const size = box.getSize(new THREE.Vector3());
      L.position.set(c.x, c.y, c.z + 0.01);
      L.width = size.x * 0.96;
      L.height = size.y * 0.96;
      // Area light memancar ke -z lokalnya; arahkan sepanjang normal panel (panel condong ke belakang ±8°).
      L.lookAt(L.parent.localToWorld(new THREE.Vector3(c.x, c.y + 0.137, c.z + 1)));
      placed.current = true;
    }
    if (on) L.color.lerp(glowColor[i], 1 - Math.exp(-6 * dt));
    L.intensity = THREE.MathUtils.damp(L.intensity, on ? 4.5 * m.color.r : 0, 6, dt);
  });

  return (
    <group {...props}>
      {/* Monitor: Apple Studio Display (model HD); panel layar diganti tampilan proyek */}
      <Model src={HD.display} onMesh={onDisplayMesh} />
      {glow && <rectAreaLight ref={area} intensity={0} color="#8e8aa0" />}
      {/* Menggantung dari bezel bawah (tepi bawah bingkai y 0.121, permukaan depan z ≈ 0.066), diselotip
          di tepi atasnya; bidang post-it mengikuti kemiringan panel ±8°. */}
      <NotePad notes={notes} index={noteIndex} size={0.13} position={[0.2, 0.0545, 0.0761]} rotation={[-0.138, 0, -0.02]} />

      {/* Mac mini (model HD) di kanan monitor + kabel ke monitor */}
      {/* Diputar 180°: port di belakang menghadap dinding, logo & LED di depan */}
      <Model src={HD.macmini} fit={MAC_FIT} position={[0.6, 0, -0.08]} rotation-y={Math.PI - 0.1} />
      <Cable from={new THREE.Vector3(0.52, 0.02, -0.12)} to={new THREE.Vector3(0.03, 0.3, -0.08)} />

      {/* Keyboard mechanical (model HD) */}
      <Model src={HD.keyboard} fit={KEYB_FIT} position={[-0.02, 0, 0.22]} />
    </group>
  );
}
