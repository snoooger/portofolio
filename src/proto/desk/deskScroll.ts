"use client";

// Scroll meja yang ringan (tidak "lengket"):
// - Scroll bebas & halus (Lenis); kamera bergerak mengikuti scroll di sepanjang jalur perhentian.
// - Tiap perhentian punya ZONA TAHAN kecil (HOLD) supaya kamera benar-benar berhenti tepat di objek.
// - Tidak ada kunci baca dan tidak ada batas momentum: satu gestur boleh melewati beberapa section.
// - Setelah scroll berhenti di tengah perjalanan, halaman melengkapi ke perhentian terdekat — condong
//   searah gerakan terakhir (cukup 22% perjalanan untuk lanjut ke section berikutnya).
// Semua posisi dihitung dari tinggi layar saat ini, jadi tetap tepat di HP saat bilah alamat muncul/hilang.
import { useEffect, useState, type RefObject } from "react";
import type Lenis from "lenis";

/** Porsi jarak antarperhentian yang menjadi zona tahan (sisanya perjalanan kamera). */
export const HOLD = 0.12;
/** Tinggi tiap perhentian (svh) — menentukan berapa jauh scroll antarperhentian. */
export const STOP_SVH = 70;
/** Jeda setelah scroll terakhir sebelum snap (ms). */
const IDLE = 150;

export type DeskDrive = {
  /** Perhentian 0 … n−1, tepat bilangan bulat di zona tahan. */
  current: number;
  /** Progres linier (tanpa zona tahan), satuan perhentian. */
  raw: number;
  /** Progres di dalam zona tahan 0–1 (−1 bila sedang dalam perjalanan). */
  hold: number;
};

export type Geom = { top: number; S: number; h: number; end: number; n: number };

export function geom(el: HTMLElement, n: number): Geom {
  const top = el.offsetTop;
  const R = Math.max(1, el.offsetHeight - window.innerHeight);
  const S = R / (n - 1);
  return { top, S, h: (HOLD / 2) * S, end: top + R, n };
}

/** Zona tahan perhentian k: [A, B] dalam px scroll. */
export const zone = (g: Geom, k: number): [number, number] => {
  const c = g.top + k * g.S;
  return [Math.max(g.top, c - g.h), Math.min(g.end, c + g.h)];
};

/** Posisi scroll → perhentian (bertangga) + progres linier + progres tahan. */
export function driveOf(y: number, g: Geom): DeskDrive {
  const raw = Math.min(g.n - 1, Math.max(0, (y - g.top) / g.S));
  const k = Math.min(g.n - 2, Math.floor(raw));
  const frac = raw - k;
  const H = HOLD / 2;
  let current: number;
  if (frac <= H) current = k;
  else if (frac >= 1 - H) current = k + 1;
  else current = k + (frac - H) / (1 - 2 * H);
  const s = Math.round(current);
  let hold = -1;
  if (current === s) {
    const [A, B] = zone(g, s);
    hold = B > A ? Math.min(1, Math.max(0, (y - A) / (B - A))) : 1;
  }
  return { current, raw, hold };
}

const lenisOf = () => (window as unknown as { __lenis?: Lenis }).__lenis;

/** Menghitung DeskDrive tiap frame & memasang snap lembut + navigasi keyboard pada Lenis. */
export function useDeskScroll(root: RefObject<HTMLElement | null>, n: number) {
  // Objek stabil yang dimutasi tiap frame (dibaca scene 3D & UI lewat .current, seperti ref).
  const [f] = useState<DeskDrive>(() => ({ current: 0, raw: 0, hold: 0 }));

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = root.current;
      if (el) Object.assign(f, driveOf(window.scrollY, geom(el, n)));
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [f, root, n]);

  useEffect(() => {
    let lenis: Lenis | undefined;
    let timer = 0;
    let lastDir = 1;

    const snap = () => {
      const el = root.current;
      if (!el || !lenis || lenis.isStopped || lenis.isTouching || lenis.isScrolling === "smooth") return;
      const g = geom(el, n);
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Di antara meja & footer → lengkapi ke salah satunya.
      if (y > g.end + 4 && y < max - 4) {
        lenis.scrollTo(lastDir > 0 ? (y - g.end > (max - g.end) * 0.2 ? max : g.end) : y - g.end < (max - g.end) * 0.8 ? g.end : max, { duration: 0.8 });
        return;
      }
      const d = driveOf(y, g);
      if (d.hold >= 0) return;
      const k = Math.floor(d.current);
      const t = d.current - k;
      const forward = lastDir > 0 ? t > 0.22 : t > 0.78;
      const to = forward ? g.top + (k + 1) * g.S : g.top + k * g.S;
      lenis.scrollTo(to, { duration: 0.75 });
    };

    const onScroll = () => {
      if (lenis && lenis.direction) lastDir = lenis.direction;
      window.clearTimeout(timer);
      timer = window.setTimeout(snap, IDLE);
    };

    // Keyboard (panah, PageUp/Down, spasi): satu tekan = satu perhentian (n = footer).
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (t && /^(BUTTON|A)$/.test(t.tagName) && e.key === " ") return; // spasi = aktifkan tombol/tautan
      if (lenis?.isStopped) return;
      const dir = ["ArrowDown", "PageDown", " "].includes(e.key) ? (e.shiftKey && e.key === " " ? -1 : 1) : ["ArrowUp", "PageUp"].includes(e.key) ? -1 : 0;
      const el = root.current;
      if (!dir || !el || !lenis) return;
      e.preventDefault();
      const g = geom(el, n);
      const cur = window.scrollY > g.end + 4 ? n : Math.round(f.current);
      const k = Math.min(n, Math.max(0, cur + dir));
      if (k === cur) return;
      lenis.scrollTo(stopY(el, k, n), { duration: 0.9 });
    };

    const attach = window.setInterval(() => {
      lenis = lenisOf();
      if (!lenis) return;
      window.clearInterval(attach);
      lenis.on("scroll", onScroll);
      window.addEventListener("keydown", onKey);
      // Sentuhan: snap setelah jari diangkat & inersia habis.
      window.addEventListener("touchend", onScroll, { passive: true });
    }, 100);
    return () => {
      window.clearInterval(attach);
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchend", onScroll);
      lenis?.off("scroll", onScroll);
    };
  }, [f, root, n]);

  return f;
}

/** Posisi scroll pusat perhentian k (k = n → dasar halaman / footer). */
export function stopY(el: HTMLElement, k: number, n: number) {
  if (k >= n) return document.documentElement.scrollHeight - window.innerHeight;
  const g = geom(el, n);
  return g.top + k * g.S;
}

const sstep = (x: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** Interpolasi antar perhentian dengan "diam" sejenak di sekitar tiap perhentian. */
export function stopMix(f: number, count: number, hold = 0.22) {
  const g = Math.min(count - 1, Math.max(0, Math.floor(f)));
  const n = Math.min(count - 1, g + 1);
  return { a: g, b: n, t: sstep(f - g, hold, 1 - hold) };
}
