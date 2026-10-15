"use client";

// iPhone yang tergeletak di meja (perhentian Contact): lock screen dengan notifikasi yang mengantar ke
// footer. Layar bisa diketuk. Bila model HD iPhone sudah disalin ke
// /assets-3d/sketchfab/iphone.glb, set HAS_IPHONE_MODEL = true; kalau belum, dipakai bodi buatan sendiri.
import { useEffect, useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { P } from "../palette";
import type { Fonts } from "../final/useFonts";
import type { Copy } from "./copy";
import { Model, type Fit } from "./Model";

const PW = 0.0767, PH = 0.1596, PD = 0.0083; // iPhone 15 Pro Max (m)
const SW = 590, SH = 1278; // resolusi tekstur layar
const IPHONE_SRC = "/assets-3d/sketchfab/iphone.glb";
const HAS_IPHONE_MODEL = false;
const IPHONE_FIT: Fit = { axis: "z", size: PH };

/** Lock screen: jam, lalu notifikasi "Punya proyek?" yang mengantar ke footer (CTA & kontak). */
function lockScreen(f: Fonts, copy: Copy) {
  const c = document.createElement("canvas");
  c.width = SW;
  c.height = SH;
  const ctx = c.getContext("2d")!;
  // Wallpaper: gradasi hangat terakota → krem dengan lingkaran lembut
  const g = ctx.createLinearGradient(0, 0, SW * 0.4, SH);
  g.addColorStop(0, "#c2552f");
  g.addColorStop(0.55, "#e3a07a");
  g.addColorStop(1, "#f2e3cf");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, SH);
  for (const [x, y, r, a] of [[120, 360, 260, 0.18], [480, 900, 320, 0.14], [300, 1180, 220, 0.12]]) {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(255,248,236,${a})`);
    rg.addColorStop(1, "rgba(255,248,236,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, SW, SH);
  }
  // Dynamic island + status
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(SW / 2 - 92, 26, 184, 52, 26);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(SW - 108, 42, 50, 24, 7);
  ctx.fill();
  // Tanggal & jam
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `600 30px ${f.sans}`;
  ctx.fillText(copy.phone.date, SW / 2, 200);
  ctx.fillStyle = "#fff";
  ctx.font = `200px ${f.serif}`;
  ctx.fillText("9:41", SW / 2, 370);
  // Notifikasi
  const nx = 32, ny = 470, nw = SW - 64, nh = 172;
  ctx.fillStyle = "rgba(255,250,243,0.9)";
  ctx.beginPath();
  ctx.roundRect(nx, ny, nw, nh, 40);
  ctx.fill();
  ctx.fillStyle = P.terracotta;
  ctx.beginPath();
  ctx.roundRect(nx + 26, ny + 30, 64, 64, 16);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `36px ${f.serif}`;
  ctx.fillText("ZJ", nx + 58, ny + 74);
  ctx.textAlign = "left";
  ctx.fillStyle = P.inkSoft;
  ctx.font = `600 22px ${f.sans}`;
  ctx.fillText(copy.phone.app.toUpperCase(), nx + 110, ny + 52);
  ctx.textAlign = "right";
  ctx.font = `400 22px ${f.sans}`;
  ctx.fillText("now", nx + nw - 28, ny + 52);
  ctx.textAlign = "left";
  ctx.fillStyle = P.ink;
  ctx.font = `700 30px ${f.sans}`;
  ctx.fillText(copy.phone.title, nx + 110, ny + 92);
  ctx.fillStyle = P.inkSoft;
  ctx.font = `400 25px ${f.sans}`;
  ctx.fillText(copy.phone.body, nx + 110, ny + 128);
  // Senter & kamera + home bar
  for (const x of [110, SW - 110]) {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.arc(x, SH - 150, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(x - 10, SH - 168, 20, 36, 6);
    ctx.fill();
  }
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(SW / 2 - 100, SH - 26, 200, 8, 4);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Persegi panjang bersudut membulat (bidang XY) dengan UV 0–1. */
function roundedShape(w: number, h: number, r: number) {
  const sh = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  sh.moveTo(x + r, y);
  sh.lineTo(x + w - r, y);
  sh.quadraticCurveTo(x + w, y, x + w, y + r);
  sh.lineTo(x + w, y + h - r);
  sh.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  sh.lineTo(x + r, y + h);
  sh.quadraticCurveTo(x, y + h, x, y + h - r);
  sh.lineTo(x, y + r);
  sh.quadraticCurveTo(x, y, x + r, y);
  return sh;
}
function roundedPlane(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedShape(w, h, r), 12);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / w + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / h + 0.5;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

/** Bodi iPhone 15 Pro: siluet bersudut membulat, bingkai titanium berbevel, kaca depan, tombol samping. */
function Body() {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedShape(PW - 0.001, PH - 0.001, 0.0118), {
      depth: PD - 0.0012,
      bevelEnabled: true,
      bevelThickness: 0.0006,
      bevelSize: 0.0005,
      bevelSegments: 4,
      curveSegments: 24,
    });
    g.translate(0, 0, 0.0006);
    return g;
  }, []);
  const glass = useMemo(() => roundedPlane(PW - 0.0012, PH - 0.0012, 0.0112), []);
  useEffect(() => () => [geo, glass].forEach((g) => g.dispose()), [geo, glass]);
  const titanium = <meshPhysicalMaterial color="#4a4845" metalness={1} roughness={0.38} clearcoat={0.3} />;
  return (
    <group rotation-x={-Math.PI / 2}>
      {/* Bodi diekstrusi sepanjang +z lokal = atas meja */}
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial attach="material-0" color="#1c1c1e" roughness={0.2} metalness={0.2} />
        <meshPhysicalMaterial attach="material-1" color="#4a4845" metalness={1} roughness={0.38} clearcoat={0.3} />
      </mesh>
      <mesh geometry={glass} position={[0, 0, PD + 0.00005]}>
        <meshPhysicalMaterial color="#050505" roughness={0.04} clearcoat={1} clearcoatRoughness={0.02} />
      </mesh>
      {/* Tombol: action + volume (kiri), power (kanan) */}
      {[
        [-1, 0.052, 0.008],
        [-1, 0.031, 0.016],
        [-1, 0.008, 0.016],
        [1, 0.028, 0.024],
      ].map(([side, y, len], i) => (
        // Kapsul memanjang di sumbu y bodi (sepanjang sisi HP), bukan tegak keluar dari bodi.
        <mesh key={i} position={[side * (PW / 2 + 0.0002), y, PD / 2]}>
          <capsuleGeometry args={[0.0009, len, 4, 8]} />
          {titanium}
        </mesh>
      ))}
    </group>
  );
}

export function IPhone({ fonts, copy, onOpen, ...props }: ThreeElements["group"] & { fonts: Fonts; copy: Copy; onOpen?: () => void }) {
  const screen = useMemo(() => lockScreen(fonts, copy), [fonts, copy]);
  useEffect(() => () => screen.dispose(), [screen]);

  const screenGeo = useMemo(() => roundedPlane(PW - 0.0034, PH - 0.0034, 0.0098), []);
  useEffect(() => () => screenGeo.dispose(), [screenGeo]);
  return (
    <group {...props}>
      {HAS_IPHONE_MODEL ? <Model src={IPHONE_SRC} fit={IPHONE_FIT} /> : <Body />}
      {/* Layar: kontak + footer, baris tautan bisa diklik */}
      {/* Layar: lock screen; ketuk notifikasi → buka footer (CTA & kontak) */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, PD + 0.0006, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onOpen?.();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <primitive object={screenGeo} attach="geometry" />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
    </group>
  );
}
