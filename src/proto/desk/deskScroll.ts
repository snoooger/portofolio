"use client";

// Scroll meja berbasis halaman (tidak lengket, tidak loncat-loncat):
// - SATU GESTUR = SATU SECTION. Roda mouse, usapan trackpad, atau swipe di HP memicu perpindahan ke
//   section berikutnya/sebelumnya dengan animasi berdurasi tetap (ease in-out) — jaraknya selalu tepat.
// - Selama animasi & sisa inersia trackpad dari gestur yang sama, input diabaikan, jadi tidak pernah
//   melompati dua section sekaligus. Gestur baru (jeda >220 ms atau dorongan baru yang lebih kuat)
//   langsung jalan begitu animasi selesai — tidak ada kunci baca.
// - Popup catatan terbuka → gestur scroll menutup popup dulu, lalu pindah section.
// - Fallback: posisi di luar perhentian (mis. scrollbar ditarik) dirapikan ke perhentian terdekat.
// Semua posisi dihitung dari tinggi layar saat ini, jadi tetap tepat di HP saat bilah alamat muncul/hilang.
import { useEffect, useState, type RefObject } from "react";
import type Lenis from "lenis";
import { popup } from "./popup";

/** Porsi jarak antarperhentian yang menjadi zona tahan (sisanya perjalanan kamera). */
export const HOLD = 0.04;
/** Tinggi tiap perhentian (svh) — menentukan berapa jauh scroll antarperhentian. */
export const STOP_SVH = 70;
/** Jeda setelah scroll terakhir sebelum snap (ms). */
const IDLE = 260;
/** Durasi perpindahan satu section (detik). */
const DUR = 1.15;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
    let animUntil = 0;
    const gest = { last: 0, mag: 0, acc: 0, used: false };

    /** Indeks perhentian tujuan saat ini (n = footer). Pakai targetScroll supaya tekan beruntun tetap tepat. */
    const indexAt = (y: number) => {
      const el = root.current!;
      const g = geom(el, n);
      if (y > g.end + 4) return n;
      return Math.min(n - 1, Math.max(0, Math.round((y - g.top) / g.S)));
    };
    const go = (dir: number) => {
      const el = root.current;
      if (!el || !lenis) return;
      const cur = indexAt(lenis.targetScroll);
      const k = Math.min(n, Math.max(0, cur + dir));
      if (k === cur) return;
      const dur = k === n || cur === n ? 1.25 : DUR;
      animUntil = performance.now() + dur * 1000 + 60;
      lenis.scrollTo(stopY(el, k, n), { duration: dur, easing: easeInOut, lock: true, force: true });
    };

    const virtualScroll = (data: { deltaX: number; deltaY: number; event: Event }) => {
      const e = data.event;
      const el = root.current;
      if ((e as WheelEvent).ctrlKey || !lenis || !el) return true;
      // Intro / layar lain yang menghentikan Lenis (bukan popup): biarkan Lenis menahan scroll.
      if (lenis.isStopped && !popup.get()) return true;
      const t = e.type;
      const now = performance.now();
      const block = () => {
        if (e.cancelable && t !== "touchstart" && t !== "touchend") e.preventDefault();
        return false;
      };
      if (t === "touchstart") {
        gest.acc = 0;
        gest.used = false;
        return false; // tidak preventDefault: tap/klik tetap berfungsi
      }
      if (t === "touchend") return false; // abaikan inersia sentuh
      if (t === "wheel") {
        const mag = Math.abs(data.deltaY);
        const gap = now - gest.last;
        // Ekor inersia trackpad selalu MENGECIL. Gestur baru = jeda + tidak lebih lemah dari event terakhir,
        // atau jeda panjang, atau dorongan baru yang jelas lebih kuat setelah animasi selesai. Dengan begitu
        // inersia tidak terbaca sebagai gestur baru walau event-nya tersendat (main thread sibuk).
        const fresh = (gap > 240 && mag >= gest.mag * 0.8) || gap > 650 || (now > animUntil && mag > gest.mag * 1.4 + 6);
        gest.last = now;
        gest.mag = mag;
        if (fresh) {
          gest.acc = 0;
          gest.used = false;
        }
      }
      if (now < animUntil || gest.used) return block();
      gest.acc += data.deltaY;
      const need = t === "wheel" ? 18 : 36;
      if (Math.abs(gest.acc) >= need) {
        gest.used = true;
        const dir = Math.sign(gest.acc);
        if (popup.get()) {
          animUntil = now + 700; // popup sedang menutup; perpindahan menyusul setelahnya
          popup.requestClose(() => go(dir));
        } else go(dir);
      }
      return block();
    };

    // Posisi di luar perhentian (scrollbar ditarik, resize) → rapikan ke perhentian terdekat.
    const snap = () => {
      const el = root.current;
      if (!el || !lenis || lenis.isStopped || lenis.isScrolling || performance.now() < animUntil) return;
      const y = window.scrollY;
      const k = indexAt(y);
      const to = stopY(el, k, n);
      if (Math.abs(to - y) > 2) lenis.scrollTo(to, { duration: 0.6, easing: easeInOut });
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(snap, IDLE);
    };
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const el = root.current;
        if (el && lenis && !lenis.isStopped) lenis.scrollTo(stopY(el, indexAt(window.scrollY), n), { immediate: true, force: true });
      }, 150);
    };

    // Keyboard (panah, PageUp/Down, spasi): satu tekan = satu perhentian (n = footer).
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (t && /^(BUTTON|A)$/.test(t.tagName) && e.key === " ") return; // spasi = aktifkan tombol/tautan
      const dir = ["ArrowDown", "PageDown", " "].includes(e.key) ? (e.shiftKey && e.key === " " ? -1 : 1) : ["ArrowUp", "PageUp"].includes(e.key) ? -1 : 0;
      if (!dir || !root.current || !lenis) return;
      if (lenis.isStopped && !popup.get()) return;
      e.preventDefault();
      if (performance.now() < animUntil) return;
      if (popup.get()) {
        animUntil = performance.now() + 700;
        popup.requestClose(() => go(dir));
      } else go(dir);
    };

    const attach = window.setInterval(() => {
      lenis = lenisOf();
      if (!lenis) return;
      window.clearInterval(attach);
      lenis.options.virtualScroll = virtualScroll;
      lenis.on("scroll", onScroll);
      window.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResize);
    }, 100);
    return () => {
      window.clearInterval(attach);
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      lenis?.off("scroll", onScroll);
      if (lenis) lenis.options.virtualScroll = undefined;
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

