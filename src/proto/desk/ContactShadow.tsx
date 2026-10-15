"use client";

// Bayangan kontak: bercak bayangan lembut tepat di bawah benda yang menempel di meja (keyboard, Mac mini,
// iPhone, dsb.). Peta bayangan cahaya jendela tidak menangkap benda setinggi 2–4 cm dengan baik, padahal
// gelap halus di titik kontak inilah yang membuat benda terasa "duduk" di meja. Murah: satu bidang
// transparan per benda, tekstur bersama.
import * as THREE from "three";

const TEX = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.filter = "blur(13px)";
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.beginPath();
  ctx.roundRect(26, 26, 76, 76, 10);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  return t;
})();
const ROUND = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.55, "rgba(0,0,0,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();

/** `w`×`d` = jejak benda (m); bercak dibuat ±60% lebih besar supaya tepinya memudar di luar benda. */
export function ContactShadow({
  x,
  z,
  y,
  w,
  d,
  rot = 0,
  opacity = 0.55,
  round = false,
}: {
  x: number;
  z: number;
  y: number;
  w: number;
  d: number;
  rot?: number;
  opacity?: number;
  round?: boolean;
}) {
  return (
    <mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, rot]} renderOrder={1}>
      <planeGeometry args={[w * 1.6, d * 1.6]} />
      <meshBasicMaterial map={round ? ROUND : TEX} color="#24160b" transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
