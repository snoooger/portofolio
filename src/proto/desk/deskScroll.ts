"use client";

// Scroll jacking berbasis scroll (bukan waktu) untuk meja:
// - Tiap perhentian punya ZONA TAHAN: sepanjang HOLD dari jarak antarperhentian, kamera diam di perhentian
//   itu walau pengguna terus scroll (isi section terbaca). Sisa jaraknya = PERJALANAN: kamera bergerak
//   mengikuti jari/roda ke perhentian berikutnya.
// - BATAS: momentum (flick/inersia trackpad) berhenti tepat saat masuk zona tahan sebuah perhentian; gestur
//   yang sama tidak bisa melewatinya. Pengguna harus scroll lagi (gestur baru) melewati zona tahan.
// - Bila berhenti di tengah perjalanan, halaman melengkapi ke tepi zona tahan terdekat (snap halus).
// Semua posisi dihitung dari tinggi layar saat ini, jadi tetap tepat di HP saat bilah alamat muncul/hilang.
import { useEffect, useState, type RefObject } from "react";
import type Lenis from "lenis";

/** Porsi jarak antarperhentian yang menjadi zona tahan (sisanya perjalanan kamera). */
export const HOLD = 0.36;
/** Tinggi tiap perhentian (svh) — menentukan berapa jauh scroll antarperhentian. */
export const STOP_SVH = 110;

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

/**
 * Menghitung DeskDrive tiap frame & memasang batas momentum + snap pada Lenis.
 * `onFooterGap`: posisi di antara akhir meja & dasar halaman (footer) → lengkapi ke salah satunya.
 */
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
    let gesture = 0, lastWheel = 0;
    let arrived = { k: -1, gesture: -1, dir: 0 };
    let timer = 0;

    const virtualScroll = (data: { deltaX: number; deltaY: number; event: Event }) => {
      const e = data.event;
      const type = e.type;
      const now = performance.now();
      if (type === "touchstart") gesture++;
      else if (type === "wheel") {
        if (now - lastWheel > 160) gesture++; // jeda = gestur baru (inersia trackpad = gestur yang sama)
        lastWheel = now;
      }
      const el = root.current;
      if ((e as WheelEvent).ctrlKey || data.deltaY === 0 || !lenis || !el) return true;
      const g = geom(el, n);
      const isTouch = type.startsWith("touch");
      const inertia = type === "touchend";
      const cur = lenis.targetScroll;
      // Hanya di bagian meja; di area footer scroll bebas.
      if (cur > g.end + 1) return true;
      const d = inertia ? Math.sign(data.deltaY) * Math.abs(lenis.velocity) ** lenis.options.touchInertiaExponent : data.deltaY;
      const dir = Math.sign(d);
      const block = () => {
        if (e.cancelable) e.preventDefault();
        return false;
      };
      // Gestur yang sama setelah tiba di sebuah perhentian tidak bisa melanjutkan ke arah yang sama.
      if (arrived.gesture === gesture && arrived.dir === dir) return block();
      const next = cur + d;
      for (let k = 0; k < n; k++) {
        const [A, B] = zone(g, k);
        const hit = dir > 0 ? cur < A - 0.5 && next >= A : cur > B + 0.5 && next <= B;
        if (!hit) continue;
        // Masuk zona tahan: berhenti di tepinya, gestur ini selesai.
        const to = dir > 0 ? A + 1 : B - 1;
        arrived = { k, gesture, dir };
        if (e.cancelable) e.preventDefault();
        lenis.scrollTo(to, {
          programmatic: false,
          lerp: isTouch && lenis.options.syncTouch ? (inertia ? lenis.options.syncTouchLerp : 1) : lenis.options.lerp,
        });
        return false;
      }
      return true;
    };

    // Berhenti di tengah perjalanan → lengkapi ke tepi zona tahan terdekat. Di antara meja & footer →
    // lengkapi ke salah satunya.
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const el = root.current;
        if (!el || !lenis || lenis.isTouching || lenis.isScrolling === "smooth") return;
        const g = geom(el, n);
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (y > g.end + 4 && y < max - 4) {
          lenis.scrollTo(y - g.end > (max - g.end) / 2 ? max : g.end, { duration: 0.8 });
          return;
        }
        const d = driveOf(y, g);
        if (d.hold >= 0) return;
        const k = Math.floor(d.current);
        const t = d.current - k;
        const to = t > 0.5 ? zone(g, k + 1)[0] + 1 : zone(g, k)[1] - 1;
        lenis.scrollTo(to, { duration: 0.7 });
      }, 260);
    };

    const attach = window.setInterval(() => {
      lenis = lenisOf();
      if (!lenis) return;
      window.clearInterval(attach);
      lenis.options.virtualScroll = virtualScroll;
      lenis.on("scroll", onScroll);
    }, 100);
    return () => {
      window.clearInterval(attach);
      window.clearTimeout(timer);
      lenis?.off("scroll", onScroll);
      if (lenis) lenis.options.virtualScroll = undefined;
    };
  }, [root, n]);

  return f;
}

/** Posisi scroll pusat perhentian k (k = n → dasar halaman / footer). */
export function stopY(el: HTMLElement, k: number, n: number) {
  if (k >= n) return document.documentElement.scrollHeight - window.innerHeight;
  const g = geom(el, n);
  return g.top + k * g.S;
}
