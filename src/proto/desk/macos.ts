"use client";

// Layar monitor bergaya desktop macOS: wallpaper abstrak bernada situs (hijau tua, terakota, kuning),
// menu bar & dock berefek kaca (glassmorphism: latar diburamkan + lapisan putih tipis), dan jendela
// aplikasi berbayang dengan tombol merah-kuning-hijau tempat tampilan proyek dirender.
// Ikon dock digambar sebagai bentuk sederhana (tanpa logo merek).
import * as THREE from "three";

type F = { serif: string; sans: string; mono: string };
const W = 1600, H = 900;
const MENU = 30;
// Jendela memuat tampilan 16:9 utuh (1360×765 + title bar); tepi bawahnya tertutup dock, seperti di macOS.
const WIN = { x: 120, y: 42, w: 1360, h: 765 + 38, bar: 38 };
const DOCK = { size: 58, gap: 12, pad: 12, bottom: 10 };

function wallpaper(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#10231a");
  g.addColorStop(0.5, "#1d3a2b");
  g.addColorStop(1, "#3a1d12");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.filter = "blur(28px)";
  const band = (y0: number, amp: number, color: string, phase: number) => {
    ctx.beginPath();
    ctx.moveTo(-100, H + 100);
    for (let x = -100; x <= W + 100; x += 40) ctx.lineTo(x, y0 + Math.sin(x / 260 + phase) * amp + Math.sin(x / 90 + phase * 2) * amp * 0.15);
    ctx.lineTo(W + 100, H + 100);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
  band(360, 90, "rgba(194,85,47,0.55)", 0.4);
  band(470, 70, "rgba(245,200,76,0.28)", 1.6);
  band(560, 80, "rgba(194,85,47,0.5)", 2.7);
  band(700, 60, "rgba(29,58,43,0.9)", 0.9);
  ctx.restore();
  for (let i = 0; i < 12000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.025})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
}

/** Kaca buram: salin latar di area itu dengan blur, lalu lapisi putih tipis + garis tepi terang. */
function glass(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, x: number, y: number, w: number, h: number, r: number, tint: string) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
  ctx.filter = "blur(18px) saturate(1.4)";
  ctx.drawImage(src, x - 30, y - 30, w + 60, h + 60, x - 30, y - 30, w + 60, h + 60);
  ctx.filter = "none";
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, r);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

type Glyph = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => void;
const stroke = (ctx: CanvasRenderingContext2D, lw = 3.5) => {
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = lw;
  ctx.lineCap = ctx.lineJoin = "round";
};
const ICONS: { bg: [string, string]; glyph: Glyph }[] = [
  // Folder
  { bg: ["#7cc4ff", "#2f7fe0"], glyph: (c, x, y) => { c.fillStyle = "#fff"; c.beginPath(); c.roundRect(x - 16, y - 10, 32, 22, 4); c.fill(); c.beginPath(); c.roundRect(x - 16, y - 14, 14, 8, 3); c.fill(); } },
  // Browser (kompas)
  { bg: ["#e9f4ff", "#9fc7f2"], glyph: (c, x, y) => { c.strokeStyle = "#1f6fd1"; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 17, 0, Math.PI * 2); c.stroke(); c.fillStyle = "#e5483f"; c.beginPath(); c.moveTo(x + 9, y - 9); c.lineTo(x + 3, y + 3); c.lineTo(x - 3, y - 3); c.fill(); c.fillStyle = "#1f6fd1"; c.beginPath(); c.moveTo(x - 9, y + 9); c.lineTo(x - 3, y - 3); c.lineTo(x + 3, y + 3); c.fill(); } },
  // Mail
  { bg: ["#62b6ff", "#1c7cf2"], glyph: (c, x, y) => { c.fillStyle = "#fff"; c.beginPath(); c.roundRect(x - 17, y - 12, 34, 24, 4); c.fill(); stroke(c, 2.5); c.strokeStyle = "#1c7cf2"; c.beginPath(); c.moveTo(x - 15, y - 9); c.lineTo(x, y + 2); c.lineTo(x + 15, y - 9); c.stroke(); } },
  // Pesan
  { bg: ["#7be07b", "#28b84a"], glyph: (c, x, y) => { c.fillStyle = "#fff"; c.beginPath(); c.ellipse(x, y - 1, 17, 13, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(x - 10, y + 8); c.lineTo(x - 14, y + 16); c.lineTo(x - 3, y + 10); c.fill(); } },
  // Catatan
  { bg: ["#fff3b0", "#f5c84c"], glyph: (c, x, y) => { c.fillStyle = "#fffdf5"; c.fillRect(x - 15, y - 17, 30, 34); stroke(c, 2.5); c.strokeStyle = "#c9a227"; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x - 10, y - 9 + i * 7); c.lineTo(x + 10, y - 9 + i * 7); c.stroke(); } } },
  // Editor kode
  { bg: ["#3a7bd5", "#1b3f7a"], glyph: (c, x, y) => { stroke(c); c.beginPath(); c.moveTo(x - 6, y - 10); c.lineTo(x - 16, y); c.lineTo(x - 6, y + 10); c.moveTo(x + 6, y - 10); c.lineTo(x + 16, y); c.lineTo(x + 6, y + 10); c.moveTo(x + 3, y - 13); c.lineTo(x - 3, y + 13); c.stroke(); } },
  // Terminal
  { bg: ["#3a3a3a", "#141414"], glyph: (c, x, y) => { stroke(c); c.beginPath(); c.moveTo(x - 14, y - 9); c.lineTo(x - 5, y); c.lineTo(x - 14, y + 9); c.moveTo(x - 1, y + 10); c.lineTo(x + 14, y + 10); c.stroke(); } },
  // Musik
  { bg: ["#ff7a8a", "#e0334a"], glyph: (c, x, y) => { c.fillStyle = "#fff"; c.beginPath(); c.ellipse(x - 8, y + 10, 6, 5, -0.3, 0, Math.PI * 2); c.ellipse(x + 10, y + 6, 6, 5, -0.3, 0, Math.PI * 2); c.fill(); stroke(c, 3.5); c.beginPath(); c.moveTo(x - 3, y + 9); c.lineTo(x - 3, y - 13); c.lineTo(x + 15, y - 17); c.lineTo(x + 15, y + 5); c.stroke(); } },
  // Pengaturan
  { bg: ["#b9bec7", "#6b717c"], glyph: (c, x, y) => { stroke(c, 4); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; c.beginPath(); c.moveTo(x + Math.cos(a) * 11, y + Math.sin(a) * 11); c.lineTo(x + Math.cos(a) * 17, y + Math.sin(a) * 17); c.stroke(); } c.lineWidth = 3.5; c.beginPath(); c.arc(x, y, 9, 0, Math.PI * 2); c.stroke(); } },
];

export type DesktopOpts = { app: string; title: string; dark?: boolean; url?: boolean; active: number };

/** Desktop berisi satu jendela; `draw(scroll)` menggambar ulang isi jendela (untuk halaman yang digulir). */
export class MacDesktop {
  readonly texture: THREE.CanvasTexture;
  private readonly out: HTMLCanvasElement;
  private readonly base: HTMLCanvasElement;
  private last = -1;
  private active = 0;
  private behind: HTMLCanvasElement | null = null;

  constructor(
    private readonly source: HTMLCanvasElement,
    f: F,
    o: DesktopOpts,
  ) {
    this.base = document.createElement("canvas");
    this.base.width = W;
    this.base.height = H;
    const ctx = this.base.getContext("2d")!;
    wallpaper(ctx);
    const wall = document.createElement("canvas");
    wall.width = W;
    wall.height = H;
    wall.getContext("2d")!.drawImage(this.base, 0, 0);

    // Menu bar kaca
    glass(ctx, wall, 0, 0, W, MENU, 0, "rgba(16,16,16,0.28)");
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(26, MENU / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.textBaseline = "middle";
    ctx.font = `700 15px ${f.sans}`;
    ctx.fillText(o.app, 46, MENU / 2 + 1);
    ctx.font = `500 15px ${f.sans}`;
    let mx = 54 + ctx.measureText(o.app).width + 18;
    for (const m of ["File", "Edit", "View", "Window", "Help"]) {
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText(m, mx, MENU / 2 + 1);
      mx += ctx.measureText(m).width + 22;
    }
    ctx.textAlign = "right";
    ctx.fillText("Thu 9:41", W - 20, MENU / 2 + 1);
    // ikon status: baterai + wifi
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(W - 128, 9, 26, 12, 3);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillRect(W - 125, 12, 17, 6);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(W - 152, 22, 4 + i * 4, -Math.PI * 0.78, -Math.PI * 0.22);
      ctx.stroke();
    }
    ctx.textAlign = "left";

    // Jendela: bayangan, badan, title bar
    const { x, y, w, h, bar } = WIN;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 24;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fillStyle = o.dark ? "#1b1b1d" : "#f6f3ee";
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = o.dark ? "#2a2a2c" : "#ebe6de";
    ctx.beginPath();
    ctx.roundRect(x, y, w, bar, [14, 14, 0, 0]);
    ctx.fill();
    ctx.fillStyle = o.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    ctx.fillRect(x, y + bar - 1, w, 1);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x + 22 + i * 21, y + bar / 2, 6.5, 0, Math.PI * 2);
      ctx.fill();
    });
    // Judul / bilah alamat di tengah
    const pillW = 440;
    if (o.url) {
      ctx.fillStyle = o.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.roundRect(x + w / 2 - pillW / 2, y + 7, pillW, bar - 14, 8);
      ctx.fill();
    }
    ctx.fillStyle = o.dark ? "rgba(255,255,255,0.75)" : "rgba(30,27,24,0.7)";
    ctx.font = `500 14px ${f.sans}`;
    ctx.textAlign = "center";
    ctx.fillText(o.title, x + w / 2, y + bar / 2 + 1);
    ctx.textAlign = "left";

    this.active = o.active;

    this.out = document.createElement("canvas");
    this.out.width = W;
    this.out.height = H;
    this.texture = new THREE.CanvasTexture(this.out);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    this.draw(0);
  }

  /** Gambar isi jendela; `scroll` 0–1 menggulir halaman yang lebih tinggi dari jendela. */
  draw(scroll: number) {
    if (Math.abs(scroll - this.last) < 0.002) return;
    this.last = scroll;
    const ctx = this.out.getContext("2d")!;
    ctx.drawImage(this.base, 0, 0);
    const { x, y, w, h, bar } = WIN;
    const cw = w, ch = h - bar;
    const s = cw / this.source.width;
    const visH = ch / s;
    const sy = Math.max(0, this.source.height - visH) * scroll;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y + bar, cw, ch, [0, 0, 14, 14]);
    ctx.clip();
    ctx.drawImage(this.source, 0, sy, this.source.width, Math.min(visH, this.source.height), x, y + bar, cw, Math.min(ch, this.source.height * s));
    ctx.restore();
    this.dock(ctx);
    this.texture.needsUpdate = true;
  }

  /** Dock kaca di atas segalanya: latar (wallpaper + jendela) di bawahnya diburamkan. */
  private dock(ctx: CanvasRenderingContext2D) {
    const n = ICONS.length;
    const dw = n * DOCK.size + (n - 1) * DOCK.gap + DOCK.pad * 2;
    const dh = DOCK.size + DOCK.pad * 2 - 4;
    const dx = (W - dw) / 2, dy = H - DOCK.bottom - dh;
    if (!this.behind) {
      this.behind = document.createElement("canvas");
      this.behind.width = W;
      this.behind.height = H;
    }
    const behind = this.behind;
    behind.getContext("2d")!.drawImage(this.out, dx - 40, dy - 40, dw + 80, dh + 80, dx - 40, dy - 40, dw + 80, dh + 80);
    glass(ctx, behind, dx, dy, dw, dh, 22, "rgba(255,255,255,0.16)");
    ICONS.forEach((ic, i) => {
      const ix = dx + DOCK.pad + i * (DOCK.size + DOCK.gap), iy = dy + DOCK.pad - 2;
      const g = ctx.createLinearGradient(0, iy, 0, iy + DOCK.size);
      g.addColorStop(0, ic.bg[0]);
      g.addColorStop(1, ic.bg[1]);
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.roundRect(ix, iy, DOCK.size, DOCK.size, 14);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
      ic.glyph(ctx, ix + DOCK.size / 2, iy + DOCK.size / 2);
      if (i === this.active) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(ix + DOCK.size / 2, dy + dh - 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  dispose() {
    this.texture.dispose();
  }
}
