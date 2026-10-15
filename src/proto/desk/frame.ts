// Komposisi kamera per perhentian, dipakai bersama oleh kamera (DeskScene) dan teks 3D (DeskText)
// supaya teks selalu jatuh tepat di area yang dirancang, di layar apa pun.
//
// Lanskap (desktop): objek mengisi ±58% bingkai, sisi lain untuk teks (`side` = +1 kanan, −1 kiri).
// Potret (HP): objek di tengah atas, teks di bawah. Kamera hanya pernah MUNDUR (tidak mendekat) dari
// pose rancangan, jadi komposisi desktop lebar tetap seperti yang dirancang.
import * as THREE from "three";

export const OBJECT_FRAC = 0.58;
/** Geser komposisi ke atas pada layar potret (pecahan setengah-tinggi). */
const PORTRAIT_LIFT = 0.34;

export const fovFor = (aspect: number) => (aspect < 1 ? 55 : 45);

export type Axes = { dir: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 };
export const makeAxes = (): Axes => ({ dir: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3() });

export function axesOf(p: THREE.Vector3, l: THREE.Vector3, ax: Axes) {
  ax.dir.subVectors(l, p).normalize();
  ax.right.crossVectors(ax.dir, THREE.Object3D.DEFAULT_UP).normalize();
  ax.up.crossVectors(ax.right, ax.dir);
  return ax;
}

/**
 * Ubah pose rancangan (p, l) menjadi pose akhir untuk rasio layar `aspect`.
 * `side` −1…1 (boleh pecahan saat transisi), `text` 0…1 = seberapa besar ruang teks dipakai.
 */
export function applyFraming(p: THREE.Vector3, l: THREE.Vector3, span: number, side: number, text: number, aspect: number, ax: Axes) {
  const fov = fovFor(aspect);
  const tanH = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const halfW = tanH * aspect;
  const landscape = aspect >= 1;
  const frac = landscape ? 1 - (1 - OBJECT_FRAC) * Math.abs(side) * text : 1;
  let dist = p.distanceTo(l);
  const pull = THREE.MathUtils.clamp(span / 2 / frac / (halfW * dist), 1, landscape ? 2.0 : 1.8);
  if (pull > 1) {
    p.sub(l).multiplyScalar(pull).add(l);
    dist *= pull;
  }
  axesOf(p, l, ax);
  if (landscape) {
    // Objek ke sisi seberang teks: pusat objek di x = −side·(1 − frac) bingkai.
    const k = side * text * (1 - OBJECT_FRAC) * halfW * dist;
    p.addScaledVector(ax.right, k);
    l.addScaledVector(ax.right, k);
  } else {
    const k = -PORTRAIT_LIFT * tanH * dist * text;
    p.addScaledVector(ax.up, k);
    l.addScaledVector(ax.up, k);
  }
  return fov;
}
