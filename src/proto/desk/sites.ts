"use client";

// Isi jendela monitor. Dua proyek yang live di production ditampilkan PERSIS seperti situs aslinya,
// memakai tangkapan layar halaman produksi (public/assets-3d/sites, 1280 px):
// - usesonarnow.com : satu halaman penuh, digulir mengikuti scroll pengunjung.
// - promptedsite.com: situs scroll-driven, jadi ditampilkan sebagai urutan "layar" yang berganti
//   (cross-fade) mengikuti scroll — seperti pengalaman menggulir situs aslinya.
// Gambar dimuat malas (setelah adegan siap) supaya tidak memperlambat pemuatan awal.
import type { WindowContent } from "./macos";

const load = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.decoding = "async";
    i.onload = () => i.decode().catch(() => {}).then(() => res(i));
    i.onerror = rej;
    i.src = src;
  });

/** Halaman penuh yang digulir di dalam jendela. */
export class ScrollShot implements WindowContent {
  img: HTMLImageElement | null = null;
  constructor(
    private readonly src: string,
    readonly tint: string,
    readonly dark = false,
  ) {}
  load() {
    return load(this.src).then((i) => void (this.img = i));
  }
  draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, scroll: number) {
    const im = this.img;
    if (!im) return;
    const s = w / im.width;
    const visH = h / s;
    const sy = Math.max(0, im.height - visH) * Math.min(1, Math.max(0, scroll));
    ctx.drawImage(im, 0, sy, im.width, visH, x, y, w, h);
  }
}

/** Urutan tangkapan layar yang berganti halus mengikuti scroll. */
export class FrameShots implements WindowContent {
  frames: (HTMLImageElement | null)[];
  constructor(
    private readonly srcs: string[],
    readonly tint: string,
    readonly dark = false,
  ) {
    this.frames = srcs.map(() => null);
  }
  load() {
    return Promise.all(this.srcs.map((s, i) => load(s).then((im) => void (this.frames[i] = im))));
  }
  private put(ctx: CanvasRenderingContext2D, im: HTMLImageElement | null, x: number, y: number, w: number, h: number) {
    if (!im) return;
    // cover: lebar penuh, potong sedikit bawah bila perlu
    const s = w / im.width;
    const visH = Math.min(im.height, h / s);
    ctx.drawImage(im, 0, 0, im.width, visH, x, y, w, visH * s);
  }
  draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, scroll: number) {
    const n = this.frames.length;
    const p = Math.min(1, Math.max(0, scroll)) * (n - 1);
    const i = Math.min(n - 1, Math.floor(p));
    const t = p - i;
    const k = t < 0.3 ? 0 : t > 0.7 ? 1 : (t - 0.3) / 0.4; // diam di tiap layar, berganti di tengah
    this.put(ctx, this.frames[i], x, y, w, h);
    if (k > 0 && i + 1 < n) {
      ctx.globalAlpha = k;
      this.put(ctx, this.frames[i + 1], x, y, w, h);
      ctx.globalAlpha = 1;
    }
  }
}

/** Kanvas buatan sendiri (dasbor ViralEngine, notebook skripsi) di dalam jendela aplikasi. */
export function canvasContent(src: HTMLCanvasElement, tint: string, dark = false): WindowContent {
  return {
    tint,
    dark,
    draw(ctx, x, y, w, h) {
      const s = Math.max(w / src.width, h / src.height);
      const sw = w / s, sh = h / s;
      ctx.drawImage(src, (src.width - sw) / 2, 0, sw, sh, x, y, w, h);
    },
  };
}

export const SONAR_URL = "usesonarnow.com";
export const PROMPTED_URL = "promptedsite.com";

export function liveSites() {
  return {
    sonar: new ScrollShot("/assets-3d/sites/sonar.webp", "#f4ead2"),
    prompted: new FrameShots(
      Array.from({ length: 6 }, (_, i) => `/assets-3d/sites/prompted-${i}.webp`),
      "#0b0a12",
      true,
    ),
  };
}
