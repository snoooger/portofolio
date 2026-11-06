// Intro "keluar dari layar HP": layar pemuatan berupa siluet iPhone di tengah layar, dan kamera 3D
// dimulai tepat di atas iPhone di meja sehingga iPhone 3D menempati posisi & ukuran yang SAMA persis
// dengan siluet DOM. Saat adegan siap, siluet menghilang (iPhone 3D sudah ada di baliknya) lalu
// kamera mundur keluar ke pose hero. Fungsi di sini dipakai bersama oleh loader (DOM) dan kamera.
import { SPOT, TOP, fovFor, type V3 } from "./stops";

/** Ukuran bodi iPhone 15 Pro Max (m) — sama dengan IPhone.tsx. */
export const PW = 0.0767;
export const PH = 0.1596;
export const PD = 0.0083;
/** Radius sudut bodi & sisi bezel layar (m). */
export const PR = 0.0118;
export const BEZEL = 0.0017;
/** Rotasi iPhone di meja (sumbu y). */
export const PHONE_YAW = -0.2;
export const PHONE_POS: V3 = [SPOT.phone[0], TOP, SPOT.phone[1]];

/** Ukuran siluet di layar (px) untuk viewport vw×vh: ±60% tinggi layar, dibatasi lebar di HP. */
export function silhouette(vw: number, vh: number) {
  const h = Math.min(vh * 0.6, (vw * 0.64 * PH) / PW);
  return { h, w: (h * PW) / PH, frac: h / vh, px: h / PH };
}

/** Arah "bawah" iPhone di dunia (kamera digeser sedikit ke sini supaya iPhone tampil tegak). */
export const phoneDown = (): V3 => [Math.sin(PHONE_YAW), 0, Math.cos(PHONE_YAW)];

/**
 * Pose kamera intro: tegak lurus di atas pusat iPhone, jaraknya membuat tinggi bodi iPhone = `frac`
 * tinggi layar. Pergeseran mikro ke arah bawah iPhone menentukan orientasi lookAt (atas HP = atas layar).
 */
export function introPose(aspect: number, frac: number): { pos: V3; look: V3; fov: number } {
  const fov = fovFor(aspect);
  const d = PH / (2 * frac * Math.tan(((fov / 2) * Math.PI) / 180));
  const [x, , z] = PHONE_POS;
  const y = TOP + PD;
  const [dx, , dz] = phoneDown();
  const e = 0.0004;
  return { pos: [x + dx * e, y + d, z + dz * e], look: [x, y, z], fov };
}

/** Status intro, dibagi antara loader (DOM) dan kamera (useFrame). */
export type IntroState = { phase: "hold" | "zoom" | "done"; t0: number };
export const INTRO_MS = 2100;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
