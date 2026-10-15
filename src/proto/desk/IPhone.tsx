"use client";

// iPhone yang tergeletak di meja (perhentian Contact): lock screen dengan notifikasi yang mengantar ke
// footer. Layar bisa diketuk. Bila model HD iPhone sudah disalin ke
// /assets-3d/sketchfab/iphone.glb, set HAS_IPHONE_MODEL = true; kalau belum, dipakai bodi buatan sendiri.
import { useEffect, useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import type { Fonts } from "../final/useFonts";
import type { Copy } from "./copy";
import { Model, type Fit } from "./Model";

const PW = 0.0767, PH = 0.1596, PD = 0.0083; // iPhone 15 Pro Max (m)
const SW = 590, SH = 1278; // resolusi tekstur layar
const IPHONE_SRC = "/assets-3d/sketchfab/iphone.glb";
const HAS_IPHONE_MODEL = false;
const IPHONE_FIT: Fit = { axis: "z", size: PH };

/**
 * Lock screen bergaya iOS terbaru (liquid glass): status bar, gembok, tanggal, jam raksasa berkilau kaca,
 * widget status, tumpukan notifikasi kaca, tombol senter & kamera kaca. Mengetuk layar → buka footer.
 */
export function lockScreen(f: Fonts, copy: Copy) {
  const c = document.createElement("canvas");
  c.width = SW;
  c.height = SH;
  const ctx = c.getContext("2d")!;
  // Wallpaper gelap senada situs: hijau tua → cokelat espresso, cahaya terakota & kuning lembut
  const g = ctx.createLinearGradient(0, 0, SW * 0.5, SH);
  g.addColorStop(0, "#1d3a2b");
  g.addColorStop(0.6, "#22231a");
  g.addColorStop(1, "#2a1d14");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, SH);
  for (const [x, y, r, col] of [[470, 330, 320, "194,85,47,0.5"], [80, 1050, 360, "245,200,76,0.18"], [330, 820, 280, "194,85,47,0.2"]] as const) {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(${col})`);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, SW, SH);
  }
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
    ctx.fillRect(Math.random() * SW, Math.random() * SH, 2, 2);
  }
  const wall = document.createElement("canvas");
  wall.width = SW;
  wall.height = SH;
  wall.getContext("2d")!.drawImage(c, 0, 0);

  /** Kaca cair: latar diburamkan + putih tipis + kilau tepi atas + garis tepi terang. */
  const glass = (x: number, y: number, w: number, h: number, r: number, alpha = 0.16) => {
    // Blur dikerjakan di kanvas sementara (filter + clip di kanvas utama meninggalkan garis tipis).
    const pad = 40;
    const tmp = document.createElement("canvas");
    tmp.width = w + pad * 2;
    tmp.height = h + pad * 2;
    const tctx = tmp.getContext("2d")!;
    tctx.filter = "blur(22px) saturate(1.5)";
    tctx.drawImage(wall, x - pad, y - pad, w + pad * 2, h + pad * 2, 0, 0, w + pad * 2, h + pad * 2);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.clip();
    ctx.drawImage(tmp, pad, pad, w, h, x, y, w, h);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(x, y, w, h);
    const hl = ctx.createLinearGradient(0, y, 0, y + h);
    hl.addColorStop(0, "rgba(255,255,255,0.22)");
    hl.addColorStop(0.35, "rgba(255,255,255,0)");
    ctx.fillStyle = hl;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    const edge = ctx.createLinearGradient(x, y, x + w, y + h);
    edge.addColorStop(0, "rgba(255,255,255,0.55)");
    edge.addColorStop(0.5, "rgba(255,255,255,0.12)");
    edge.addColorStop(1, "rgba(255,255,255,0.35)");
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, w - 2, h - 2, r);
    ctx.stroke();
  };

  // Status bar: jaringan kiri, sinyal/wifi/baterai kanan, dynamic island
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(SW / 2 - 92, 26, 184, 52, 26);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `600 24px ${f.sans}`;
  ctx.fillText("5G", 58, 64);
  [10, 15, 20, 25].forEach((h, i) => {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(SW - 172 + i * 9, 66 - h, 6, h, 2);
    ctx.fill();
  });
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(SW - 118, 68, 5 + i * 7, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  }
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(SW - 92, 48, 44, 21, 6);
  ctx.stroke();
  ctx.fillRect(SW - 88, 52, 30, 13);
  ctx.fillRect(SW - 46, 54, 3, 9);

  // Gembok
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(SW / 2, 128, 10, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.roundRect(SW / 2 - 15, 126, 30, 22, 5);
  ctx.fill();

  // Tanggal & jam raksasa (kilau kaca)
  const now = new Date();
  const date = now.toLocaleDateString(copy.phone.locale, { weekday: "long", day: "numeric", month: "long" });
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(251,243,227,0.88)";
  ctx.font = `600 30px ${f.sans}`;
  ctx.fillText(date, SW / 2, 214);
  ctx.save();
  ctx.font = `700 210px ${f.sans}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "-6px";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  const cg = ctx.createLinearGradient(0, 230, 0, 410);
  cg.addColorStop(0, "rgba(255,255,255,0.98)");
  cg.addColorStop(0.55, "rgba(251,243,227,0.88)");
  cg.addColorStop(1, "rgba(245,200,76,0.75)");
  ctx.fillStyle = cg;
  ctx.fillText("9:41", SW / 2, 404);
  ctx.restore();

  // Widget status (pil kaca)
  ctx.font = `600 24px ${f.sans}`;
  const sw = ctx.measureText(copy.phone.status).width + 74;
  glass(SW / 2 - sw / 2, 440, sw, 54, 27, 0.14);
  ctx.fillStyle = "#3ee07a";
  ctx.beginPath();
  ctx.arc(SW / 2 - sw / 2 + 32, 467, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.fillText(copy.phone.status, SW / 2 - sw / 2 + 50, 476);

  // Tumpukan notifikasi kaca (dua lapis bayangan di bawah)
  const nx = 30, ny = 780, nw = SW - 60, nh = 168;
  glass(nx + 36, ny + nh - 14, nw - 72, 36, 22, 0.1);
  glass(nx + 18, ny + nh - 26, nw - 36, 36, 26, 0.12);
  glass(nx, ny, nw, nh, 42, 0.2);
  ctx.fillStyle = "#c2552f";
  ctx.beginPath();
  ctx.roundRect(nx + 24, ny + 28, 68, 68, 17);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `36px ${f.serif}`;
  ctx.textAlign = "center";
  ctx.fillText("ZJ", nx + 58, ny + 74);
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = `700 27px ${f.sans}`;
  ctx.fillText(copy.phone.app, nx + 112, ny + 54);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `500 22px ${f.sans}`;
  ctx.fillText("now", nx + nw - 28, ny + 54);
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = `600 26px ${f.sans}`;
  ctx.fillText(copy.phone.title, nx + 112, ny + 92);
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = `400 24px ${f.sans}`;
  ctx.fillText(copy.phone.body, nx + 112, ny + 126);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = `500 21px ${f.sans}`;
  ctx.fillText(copy.phone.reply, SW / 2, ny + nh + 70);

  // Senter & kamera (kaca) + home indicator
  for (const [x, icon] of [[104, "torch"], [SW - 104, "cam"]] as const) {
    glass(x - 50, SH - 200, 100, 100, 50, 0.16);
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";
    ctx.lineWidth = 3.5;
    const cy = SH - 150;
    if (icon === "torch") {
      ctx.beginPath();
      ctx.moveTo(x - 12, cy - 20);
      ctx.lineTo(x + 12, cy - 20);
      ctx.lineTo(x + 7, cy - 4);
      ctx.lineTo(x + 7, cy + 22);
      ctx.lineTo(x - 7, cy + 22);
      ctx.lineTo(x - 7, cy - 4);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(x - 22, cy - 14, 44, 32, 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, cy + 2, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillRect(x - 8, cy - 20, 16, 6);
    }
  }
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(SW / 2 - 100, SH - 26, 200, 8, 4);
  ctx.fill();
  ctx.textAlign = "left";
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
