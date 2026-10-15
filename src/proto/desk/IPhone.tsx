"use client";

// iPhone yang tergeletak di meja: layar serbaguna untuk section tertentu (di sini: kontak + footer).
// Baris tautan di layar bisa diklik (hit-test lewat koordinat UV). Bila model HD iPhone sudah disalin ke
// /assets-3d/sketchfab/iphone.glb, set HAS_IPHONE_MODEL = true; kalau belum, dipakai bodi buatan sendiri.
import { useEffect, useMemo } from "react";
import type { ThreeElements, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { P } from "../palette";
import type { Fonts } from "../final/useFonts";
import { EMAIL, GITHUB, LINKEDIN, NAME, type Copy } from "./copy";
import { Model, type Fit } from "./Model";

const PW = 0.0767, PH = 0.1596, PD = 0.0083; // iPhone 15 Pro Max (m)
const SW = 590, SH = 1278; // resolusi tekstur layar
const IPHONE_SRC = "/assets-3d/sketchfab/iphone.glb";
const HAS_IPHONE_MODEL = false;
const IPHONE_FIT: Fit = { axis: "z", size: PH };

/** Baris tautan: posisi y (px tekstur) dipakai untuk menggambar dan untuk hit-test klik. */
const ROW0 = 640, ROWH = 104;

function openUrl(url: string) {
  if (url.startsWith("mailto:")) window.location.href = url;
  else window.open(url, "_blank", "noopener");
}

function contactScreen(f: Fonts, copy: Copy, links: { label: string; sub: string }[]) {
  const c = document.createElement("canvas");
  c.width = SW;
  c.height = SH;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, SH);
  g.addColorStop(0, "#f6f1e8");
  g.addColorStop(1, "#efe6d8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, SH);
  // Status bar + dynamic island
  ctx.fillStyle = P.ink;
  ctx.font = `600 26px ${f.sans}`;
  ctx.fillText("9:41", 58, 62);
  ctx.beginPath();
  ctx.roundRect(SW / 2 - 92, 26, 184, 52, 26);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.fillStyle = P.ink;
  ctx.beginPath();
  ctx.roundRect(SW - 108, 42, 50, 24, 7);
  ctx.fill();
  // Kartu profil
  ctx.fillStyle = P.terracotta;
  ctx.beginPath();
  ctx.arc(SW / 2, 230, 78, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `64px ${f.serif}`;
  ctx.textAlign = "center";
  ctx.fillText("ZJ", SW / 2, 252);
  ctx.fillStyle = P.ink;
  ctx.font = `46px ${f.serif}`;
  ctx.fillText(NAME, SW / 2, 372);
  ctx.fillStyle = P.terracottaDark;
  ctx.font = `500 19px ${f.mono}`;
  ctx.fillText(copy.role.toUpperCase(), SW / 2, 412);
  ctx.fillStyle = P.inkSoft;
  ctx.font = `400 25px ${f.sans}`;
  ctx.fillText(copy.phoneNote, SW / 2, 520);
  ctx.textAlign = "left";
  // Baris tautan (gaya daftar iOS)
  ctx.fillStyle = "#fffdf9";
  ctx.beginPath();
  ctx.roundRect(36, ROW0 - 10, SW - 72, links.length * ROWH + 20, 28);
  ctx.fill();
  links.forEach((l, i) => {
    const y = ROW0 + i * ROWH;
    if (i) {
      ctx.fillStyle = "rgba(30,27,24,0.08)";
      ctx.fillRect(130, y, SW - 166, 2);
    }
    ctx.fillStyle = [P.terracotta, "#2f6fa3", "#1e1b18", "#5d9c59"][i % 4];
    ctx.beginPath();
    ctx.roundRect(60, y + 24, 54, 54, 14);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `700 24px ${f.sans}`;
    ctx.textAlign = "center";
    ctx.fillText(["@", "in", "</>", "CV"][i % 4], 87, y + 60);
    ctx.textAlign = "left";
    ctx.fillStyle = P.ink;
    ctx.font = `600 27px ${f.sans}`;
    ctx.fillText(l.label, 134, y + 48);
    ctx.fillStyle = P.inkSoft;
    ctx.font = `400 20px ${f.sans}`;
    ctx.fillText(l.sub, 134, y + 76);
    ctx.fillStyle = "rgba(30,27,24,0.35)";
    ctx.font = `600 30px ${f.sans}`;
    ctx.fillText("›", SW - 76, y + 62);
  });
  // Footer
  ctx.fillStyle = P.inkSoft;
  ctx.font = `400 17px ${f.sans}`;
  ctx.textAlign = "center";
  ctx.fillText(copy.footer, SW / 2, SH - 150);
  ctx.font = `400 13px ${f.sans}`;
  const words = copy.credits.split(" · ");
  words.forEach((w, i) => ctx.fillText(w, SW / 2, SH - 118 + i * 19));
  ctx.textAlign = "left";
  ctx.fillStyle = P.ink;
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

export function IPhone({ fonts, copy, ...props }: ThreeElements["group"] & { fonts: Fonts; copy: Copy }) {
  const links = useMemo(
    () => [
      { label: copy.links.email, sub: EMAIL, url: `mailto:${EMAIL}` },
      { label: copy.links.linkedin, sub: "in/zaidanjibranazhar", url: LINKEDIN },
      { label: copy.links.github, sub: "github.com/snoooger", url: GITHUB },
    ],
    [copy],
  );
  const screen = useMemo(() => contactScreen(fonts, copy, links), [fonts, copy, links]);
  useEffect(() => () => screen.dispose(), [screen]);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!e.uv) return;
    e.stopPropagation();
    const y = (1 - e.uv.y) * SH;
    const i = Math.floor((y - ROW0) / ROWH);
    if (i >= 0 && i < links.length) openUrl(links[i].url);
  };

  const screenGeo = useMemo(() => roundedPlane(PW - 0.0034, PH - 0.0034, 0.0098), []);
  useEffect(() => () => screenGeo.dispose(), [screenGeo]);
  return (
    <group {...props}>
      {HAS_IPHONE_MODEL ? <Model src={IPHONE_SRC} fit={IPHONE_FIT} /> : <Body />}
      {/* Layar: kontak + footer, baris tautan bisa diklik */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, PD + 0.0006, 0]}
        onClick={onClick}
        onPointerMove={(e) => {
          const y = e.uv ? (1 - e.uv.y) * SH : -1;
          const on = y > ROW0 && y < ROW0 + links.length * ROWH;
          document.body.style.cursor = on ? "pointer" : "";
        }}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <primitive object={screenGeo} attach="geometry" />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
    </group>
  );
}
