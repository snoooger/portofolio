"use client";

// Workstation: monitor 27" yang tersambung ke Mac mini, keyboard & mouse. Layar menampilkan proyek
// yang sedang dibahas (Sonar, PromptedSite, ViralEngine, Security) dan berganti mengikuti scroll.
// Di bezel kiri-bawah ada tumpukan post-it: lembar teratas berganti per proyek, lembar lama terkelupas jatuh.
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { Cable } from "../hd/Devices";
import { promptedGallery, sonarLanding, thesisScreen, viralDashboard } from "./screens2";
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
  const fall = useRef<THREE.Mesh>(null);
  const state = useRef({ cur: -1, prev: -1, t: 1 });

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
    s.t = Math.min(1, s.t + dt * 1.6);
    if (fall.current) {
      const k = s.t;
      // Lembar lama terkelupas dari atas, berputar, lalu jatuh dan hilang.
      fall.current.visible = k < 1;
      fall.current.position.set(k * size * 0.4, -k * k * size * 2.2, 0.002 + k * 0.03);
      fall.current.rotation.set(-k * 0.9, 0, -k * 0.6);
      if (fallMat.current) fallMat.current.opacity = 1 - k * k;
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
      <mesh ref={fall} visible={false}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial ref={fallMat} map={notes[0]} roughness={0.85} transparent />
      </mesh>
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
  const screens = useMemo(() => {
    const gallery = promptedGallery(fonts);
    gallery.repeat.set(1, 900 / 2700); // tampilkan setinggi satu layar, lalu gulir
    return [sonarLanding(fonts), gallery, viralDashboard(fonts), thesisScreen(fonts)];
  }, [fonts]);
  useEffect(() => () => screens.forEach((t) => t.dispose()), [screens]);

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
    if (i === 1 && m.map) m.map.offset.y = 1 - m.map.repeat.y - scroll.current * (1 - m.map.repeat.y);

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

      {/* Keyboard mechanical (model HD) & mouse */}
      <Model src={HD.keyboard} fit={KEYB_FIT} position={[-0.02, 0, 0.22]} />
      <RoundedBox args={[0.062, 0.022, 0.115]} radius={0.01} position={[0.27, 0.011, 0.22]} castShadow>
        <meshPhysicalMaterial color="#f2f0ec" roughness={0.3} clearcoat={0.6} />
      </RoundedBox>
    </group>
  );
}
