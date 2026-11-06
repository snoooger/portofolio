"use client";

// Layar monitor Mac mini bergaya macOS Sequoia: wallpaper gelombang cahaya biru-ungu, menu bar tembus
// pandang (logo Apple, menu aplikasi, ikon status, tanggal & jam), jendela Safari dengan toolbar ringkas
// (lampu lalu lintas, sidebar, navigasi, bilah alamat di tengah yang warnanya mengikuti halaman, share,
// tab baru, ikhtisar tab), dan Dock kaca berisi ikon aplikasi bawaan. Wallpaper, menu bar, Dock, dan
// bingkai jendela digambar SEKALI (base); tiap frame hanya isi jendela yang digambar ulang.
import * as THREE from "three";

type F = { serif: string; sans: string; mono: string };
type Ctx = CanvasRenderingContext2D;
export const SCREEN_W = 1600, SCREEN_H = 900;
const W = SCREEN_W, H = SCREEN_H;
const MENU = 28;
const DOCK = { size: 52, gap: 9, pad: 7, bottom: 6 };
const DOCK_H = DOCK.size + DOCK.pad * 2;
const DOCK_TOP = H - DOCK.bottom - DOCK_H;
/** Toolbar Safari / title bar aplikasi. */
const BAR = { safari: 52, app: 38 };

/** Isi jendela. `draw` menggambar ke area konten (x, y, w, h) dengan progres gulir 0–1. */
export type WindowContent = {
  /** Warna latar atas halaman (toolbar Safari ikut berwarna seperti aslinya). */
  tint: string;
  dark?: boolean;
  draw: (ctx: Ctx, x: number, y: number, w: number, h: number, scroll: number) => void;
};

export type DesktopOpts = {
  app: string;
  menus: string[];
  kind: "safari" | "app";
  /** Domain di bilah alamat (Safari) atau judul jendela (aplikasi). */
  title: string;
  /** Nama ikon Dock yang sedang berjalan selain Finder. */
  running: DockId;
};

function wallpaper(ctx: Ctx) {
  const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
  g.addColorStop(0, "#0b1030");
  g.addColorStop(0.55, "#141a52");
  g.addColorStop(1, "#06091f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.filter = "blur(36px)";
  const ribbon = (y0: number, amp: number, thick: number, c0: string, c1: string, ph: number) => {
    const lg = ctx.createLinearGradient(0, 0, W, 0);
    lg.addColorStop(0, c0);
    lg.addColorStop(1, c1);
    ctx.fillStyle = lg;
    ctx.beginPath();
    for (let x = -100; x <= W + 100; x += 30) ctx.lineTo(x, y0 + Math.sin(x / 300 + ph) * amp + Math.sin(x / 120 + ph * 1.7) * amp * 0.18);
    for (let x = W + 100; x >= -100; x -= 30) ctx.lineTo(x, y0 + thick + Math.sin(x / 300 + ph + 0.5) * amp * 0.8);
    ctx.closePath();
    ctx.fill();
  };
  ribbon(330, 120, 120, "rgba(70,110,255,0.75)", "rgba(160,90,255,0.7)", 0.2);
  ribbon(430, 100, 90, "rgba(40,200,255,0.55)", "rgba(110,70,240,0.6)", 1.4);
  ribbon(560, 90, 140, "rgba(130,60,230,0.65)", "rgba(240,100,200,0.5)", 2.6);
  ribbon(690, 70, 80, "rgba(30,60,170,0.7)", "rgba(80,40,160,0.6)", 0.9);
  ctx.restore();
  // butir halus
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
}

/** Kaca buram (vibrancy): latar di area itu diburamkan, lalu dilapisi warna tipis + garis tepi. */
function glass(ctx: Ctx, src: HTMLCanvasElement, x: number, y: number, w: number, h: number, r: number, tint: string, edge = "rgba(255,255,255,0.28)") {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
  ctx.filter = "blur(24px) saturate(1.6)";
  ctx.drawImage(src, x - 40, y - 40, w + 80, h + 80, x - 40, y - 40, w + 80, h + 80);
  ctx.filter = "none";
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  if (edge) {
    ctx.beginPath();
    ctx.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, r);
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/** Logo Apple (siluet apel tergigit + daun), tinggi ±h. */
function appleLogo(ctx: Ctx, cx: number, cy: number, h: number, color: string) {
  const s = h / 20;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -4.6);
  ctx.bezierCurveTo(-2.2, -6.4, -8.4, -6.6, -8.6, 0.2);
  ctx.bezierCurveTo(-8.8, 5.6, -5.2, 10.6, -2.8, 10.4);
  ctx.bezierCurveTo(-1.4, 10.3, -1.1, 9.6, 0, 9.6);
  ctx.bezierCurveTo(1.1, 9.6, 1.4, 10.3, 2.8, 10.4);
  ctx.bezierCurveTo(5, 10.6, 7.6, 6.6, 8.4, 4.2);
  ctx.bezierCurveTo(5.4, 2.8, 5.2, -2.6, 8, -4);
  ctx.bezierCurveTo(6.4, -6.4, 2.4, -6.6, 0, -4.6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0.2, -6.4);
  ctx.bezierCurveTo(0, -8.6, 1.6, -10.6, 4, -10.8);
  ctx.bezierCurveTo(4.2, -8.4, 2.6, -6.6, 0.2, -6.4);
  ctx.fill();
  ctx.restore();
}

type DockId = "finder" | "launchpad" | "safari" | "messages" | "mail" | "maps" | "photos" | "facetime" | "calendar" | "notes" | "music" | "appstore" | "settings" | "terminal" | "jupyter" | "trash";

const sq = (ctx: Ctx, x: number, y: number, s: number, fill: string | CanvasGradient) => {
  ctx.beginPath();
  ctx.roundRect(x, y, s, s, s * 0.225);
  ctx.fillStyle = fill;
  ctx.fill();
};
const vg = (ctx: Ctx, y: number, s: number, a: string, b: string) => {
  const g = ctx.createLinearGradient(0, y, 0, y + s);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
};

/** Ikon Dock (aproksimasi ikon bawaan macOS). */
function dockIcon(ctx: Ctx, id: DockId, x: number, y: number, s: number, f: F) {
  const cx = x + s / 2, cy = y + s / 2;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  switch (id) {
    case "finder": {
      ctx.beginPath();
      ctx.roundRect(x, y, s, s, s * 0.225);
      ctx.save();
      ctx.clip();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = vg(ctx, y, s, "#e9f1fb", "#cdd9e8");
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = vg(ctx, y, s, "#3ea3f6", "#1a6fd6");
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(cx + s * 0.04, y);
      ctx.bezierCurveTo(cx - s * 0.12, y + s * 0.35, cx - s * 0.1, y + s * 0.62, cx + s * 0.02, y + s);
      ctx.lineTo(x, y + s);
      ctx.fill();
      ctx.restore();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#1b2a3d";
      ctx.fillRect(cx - s * 0.24, cy - s * 0.14, s * 0.04, s * 0.12);
      ctx.fillRect(cx + s * 0.2, cy - s * 0.14, s * 0.04, s * 0.12);
      ctx.strokeStyle = "#1b2a3d";
      ctx.lineWidth = s * 0.035;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.26, cy + s * 0.16);
      ctx.quadraticCurveTo(cx, cy + s * 0.3, cx + s * 0.26, cy + s * 0.16);
      ctx.stroke();
      break;
    }
    case "launchpad":
      sq(ctx, x, y, s, vg(ctx, y, s, "#f2f2f4", "#c9c9cf"));
      ctx.shadowColor = "transparent";
      ["#ff5f57", "#febc2e", "#28c840", "#3d8bfd", "#a56bf5", "#ff7ab2", "#2ec5d3", "#ff9f0a", "#8e8e93"].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.roundRect(x + s * 0.2 + (i % 3) * s * 0.22, y + s * 0.2 + Math.floor(i / 3) * s * 0.22, s * 0.16, s * 0.16, s * 0.04);
        ctx.fill();
      });
      break;
    case "safari": {
      sq(ctx, x, y, s, "#fff");
      ctx.shadowColor = "transparent";
      const r = s * 0.4;
      const g = ctx.createRadialGradient(cx, cy - r * 0.4, r * 0.1, cx, cy, r);
      g.addColorStop(0, "#5fd0ff");
      g.addColorStop(1, "#1167e8");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82);
        ctx.lineTo(cx + Math.cos(a) * r * 0.94, cy + Math.sin(a) * r * 0.94);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "#ff3b30";
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.72);
      ctx.lineTo(r * 0.12, 0);
      ctx.lineTo(-r * 0.12, 0);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(0, r * 0.72);
      ctx.lineTo(r * 0.12, 0);
      ctx.lineTo(-r * 0.12, 0);
      ctx.fill();
      ctx.restore();
      break;
    }
    case "messages":
    case "facetime": {
      sq(ctx, x, y, s, vg(ctx, y, s, "#6af06d", "#16b939"));
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#fff";
      if (id === "messages") {
        ctx.beginPath();
        ctx.ellipse(cx, cy - s * 0.02, s * 0.32, s * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.2, cy + s * 0.14);
        ctx.lineTo(cx - s * 0.28, cy + s * 0.3);
        ctx.lineTo(cx - s * 0.06, cy + s * 0.2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.roundRect(cx - s * 0.3, cy - s * 0.16, s * 0.4, s * 0.32, s * 0.07);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + s * 0.12, cy - s * 0.02);
        ctx.lineTo(cx + s * 0.3, cy - s * 0.14);
        ctx.lineTo(cx + s * 0.3, cy + s * 0.14);
        ctx.lineTo(cx + s * 0.12, cy + s * 0.02);
        ctx.fill();
      }
      break;
    }
    case "mail":
      sq(ctx, x, y, s, vg(ctx, y, s, "#5ec2ff", "#1a74f0"));
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#fff";
      ctx.fillRect(cx - s * 0.3, cy - s * 0.2, s * 0.6, s * 0.4);
      ctx.strokeStyle = "#1a74f0";
      ctx.lineWidth = s * 0.04;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.3, cy - s * 0.2);
      ctx.lineTo(cx, cy + s * 0.04);
      ctx.lineTo(cx + s * 0.3, cy - s * 0.2);
      ctx.stroke();
      break;
    case "maps":
      sq(ctx, x, y, s, vg(ctx, y, s, "#bfe8b0", "#8fd27c"));
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#f7d35c";
      ctx.fillRect(x, cy - s * 0.06, s, s * 0.12);
      ctx.fillStyle = "#6fb7ff";
      ctx.beginPath();
      ctx.moveTo(x + s * 0.55, y);
      ctx.lineTo(x + s * 0.75, y);
      ctx.lineTo(x + s * 0.4, y + s);
      ctx.lineTo(x + s * 0.2, y + s);
      ctx.fill();
      ctx.fillStyle = "#ff3b30";
      ctx.beginPath();
      ctx.arc(cx + s * 0.12, cy - s * 0.16, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "photos":
      sq(ctx, x, y, s, "#fff");
      ctx.shadowColor = "transparent";
      ["#ff9500", "#ffcc00", "#34c759", "#30b0c7", "#007aff", "#af52de", "#ff2d55", "#ff3b30"].forEach((c, i) => {
        const a = (i / 8) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a);
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.17, s * 0.09, s * 0.17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      break;
    case "calendar": {
      sq(ctx, x, y, s, "#fff");
      ctx.shadowColor = "transparent";
      const d = new Date();
      ctx.fillStyle = "#ff3b30";
      ctx.font = `600 ${s * 0.18}px ${f.sans}`;
      ctx.textAlign = "center";
      ctx.fillText(d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase(), cx, y + s * 0.3);
      ctx.fillStyle = "#1d1d1f";
      ctx.font = `300 ${s * 0.5}px ${f.sans}`;
      ctx.fillText(String(d.getDate()), cx, y + s * 0.82);
      ctx.textAlign = "left";
      break;
    }
    case "notes":
      sq(ctx, x, y, s, "#fff");
      ctx.shadowColor = "transparent";
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, s, s, s * 0.225);
      ctx.clip();
      ctx.fillStyle = vg(ctx, y, s * 0.28, "#ffe17a", "#f7c843");
      ctx.fillRect(x, y, s, s * 0.28);
      ctx.restore();
      ctx.strokeStyle = "#d8d8dc";
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + s * 0.12, y + s * (0.45 + i * 0.13));
        ctx.lineTo(x + s * 0.88, y + s * (0.45 + i * 0.13));
        ctx.stroke();
      }
      break;
    case "music":
      sq(ctx, x, y, s, vg(ctx, y, s, "#ff6380", "#f42c48"));
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(cx - s * 0.13, cy + s * 0.16, s * 0.09, s * 0.07, -0.3, 0, Math.PI * 2);
      ctx.ellipse(cx + s * 0.17, cy + s * 0.1, s * 0.09, s * 0.07, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - s * 0.06, cy - s * 0.24, s * 0.035, s * 0.4);
      ctx.fillRect(cx + s * 0.24, cy - s * 0.3, s * 0.035, s * 0.4);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.06, cy - s * 0.24);
      ctx.lineTo(cx + s * 0.275, cy - s * 0.32);
      ctx.lineTo(cx + s * 0.275, cy - s * 0.22);
      ctx.lineTo(cx - s * 0.06, cy - s * 0.14);
      ctx.fill();
      break;
    case "appstore":
      sq(ctx, x, y, s, vg(ctx, y, s, "#3fc3ff", "#1774f1"));
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = s * 0.07;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2, cy + s * 0.22);
      ctx.lineTo(cx + s * 0.06, cy - s * 0.24);
      ctx.moveTo(cx + s * 0.2, cy + s * 0.22);
      ctx.lineTo(cx - s * 0.06, cy - s * 0.24);
      ctx.moveTo(cx - s * 0.26, cy + s * 0.06);
      ctx.lineTo(cx + s * 0.26, cy + s * 0.06);
      ctx.stroke();
      break;
    case "settings":
      sq(ctx, x, y, s, vg(ctx, y, s, "#9a9aa0", "#5d5d63"));
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#e5e5ea";
      ctx.beginPath();
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2, r = i % 2 ? s * 0.33 : s * 0.38;
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.fill();
      ctx.fillStyle = "#6e6e73";
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#d1d1d6";
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "terminal":
      sq(ctx, x, y, s, vg(ctx, y, s, "#4a4a4c", "#1c1c1e"));
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#f2f2f2";
      ctx.font = `700 ${s * 0.26}px ${f.mono}`;
      ctx.fillText(">_", x + s * 0.16, y + s * 0.44);
      break;
    case "jupyter":
      sq(ctx, x, y, s, "#fff");
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "#f37726";
      ctx.lineWidth = s * 0.07;
      ctx.beginPath();
      ctx.ellipse(cx, cy - s * 0.1, s * 0.32, s * 0.12, 0, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy + s * 0.1, s * 0.32, s * 0.12, 0, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
      break;
    case "trash":
      sq(ctx, x, y, s, "rgba(255,255,255,0)");
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "rgba(230,232,236,0.92)";
      ctx.beginPath();
      ctx.moveTo(x + s * 0.22, y + s * 0.2);
      ctx.lineTo(x + s * 0.78, y + s * 0.2);
      ctx.lineTo(x + s * 0.72, y + s * 0.95);
      ctx.lineTo(x + s * 0.28, y + s * 0.95);
      ctx.fill();
      ctx.strokeStyle = "rgba(140,144,150,0.9)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(x + s * (0.34 + i * 0.08), y + s * 0.26);
        ctx.lineTo(x + s * (0.36 + i * 0.07), y + s * 0.9);
        ctx.stroke();
      }
      break;
  }
  ctx.restore();
}

const DOCK_APPS: DockId[] = ["finder", "launchpad", "safari", "messages", "mail", "maps", "photos", "facetime", "calendar", "notes", "music", "appstore", "settings", "terminal", "jupyter"];

/** Ikon status menu bar (putih). */
function statusIcons(ctx: Ctx, f: F) {
  const c = "rgba(255,255,255,0.95)";
  ctx.fillStyle = c;
  ctx.strokeStyle = c;
  ctx.textBaseline = "middle";
  ctx.font = `500 14px ${f.sans}`;
  ctx.textAlign = "right";
  const d = new Date();
  const date = `${d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}  9:41`;
  ctx.fillText(date.replace(",", ""), W - 18, MENU / 2 + 1);
  let x = W - 18 - ctx.measureText(date).width - 26;
  ctx.textAlign = "left";
  // Control Center (dua sakelar)
  ctx.lineWidth = 1.4;
  for (const [dy, knob] of [[-4, 0], [4, 1]] as const) {
    ctx.beginPath();
    ctx.roundRect(x - 8, MENU / 2 + dy - 3, 16, 6, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - 8 + 3 + knob * 10, MENU / 2 + dy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  x -= 30;
  // Spotlight
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x - 2, MENU / 2 - 1, 5, 0, Math.PI * 2);
  ctx.moveTo(x + 2, MENU / 2 + 3);
  ctx.lineTo(x + 6, MENU / 2 + 7);
  ctx.stroke();
  x -= 30;
  // Wi‑Fi
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x, MENU / 2 + 6, 3 + i * 4, -Math.PI * 0.78, -Math.PI * 0.22);
    ctx.stroke();
  }
  x -= 42;
  // Baterai
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x - 12, MENU / 2 - 5.5, 24, 11, 3);
  ctx.stroke();
  ctx.fillRect(x - 10, MENU / 2 - 3.5, 17, 7);
  ctx.fillRect(x + 13, MENU / 2 - 2, 1.6, 4);
  ctx.textBaseline = "alphabetic";
}

/** Desktop macOS berisi satu jendela; `draw(scroll)` menggambar ulang isi jendela saja. */
export class MacDesktop {
  readonly texture: THREE.CanvasTexture;
  private readonly out: HTMLCanvasElement;
  private readonly base: HTMLCanvasElement;
  private last = -1;
  private readonly win: { x: number; y: number; w: number; h: number; bar: number };
  /** Paksa gambar ulang (mis. gambar halaman baru selesai dimuat). */
  dirty = true;

  constructor(
    private readonly content: WindowContent,
    f: F,
    o: DesktopOpts,
  ) {
    const bar = BAR[o.kind];
    // Jendela berakhir sedikit di atas Dock; area konten ±16:9.
    const ch = DOCK_TOP - 14 - (MENU + 12) - bar;
    const cw = Math.round(ch * (16 / 9));
    this.win = { x: Math.round((W - cw) / 2), y: MENU + 12, w: cw, h: ch + bar, bar };

    this.base = document.createElement("canvas");
    this.base.width = W;
    this.base.height = H;
    const ctx = this.base.getContext("2d")!;
    wallpaper(ctx);
    const wall = document.createElement("canvas");
    wall.width = W;
    wall.height = H;
    wall.getContext("2d")!.drawImage(this.base, 0, 0);

    // Menu bar tembus pandang
    glass(ctx, wall, 0, 0, W, MENU, 0, "rgba(10,12,40,0.22)", "");
    appleLogo(ctx, 24, MENU / 2, 17, "#fff");
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    ctx.font = `700 14px ${f.sans}`;
    ctx.fillText(o.app, 50, MENU / 2 + 1);
    let mx = 50 + ctx.measureText(o.app).width + 20;
    ctx.font = `500 14px ${f.sans}`;
    for (const m of o.menus) {
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fillText(m, mx, MENU / 2 + 1);
      mx += ctx.measureText(m).width + 20;
    }
    ctx.textBaseline = "alphabetic";
    statusIcons(ctx, f);

    // Dock kaca + ikon + titik aplikasi berjalan
    const apps = DOCK_APPS;
    const dw = (apps.length + 1) * DOCK.size + apps.length * DOCK.gap + DOCK.pad * 2 + 14;
    const dx = (W - dw) / 2;
    glass(ctx, wall, dx, DOCK_TOP, dw, DOCK_H, 18, "rgba(255,255,255,0.18)", "rgba(255,255,255,0.35)");
    let ix = dx + DOCK.pad;
    const running: DockId[] = ["finder", o.running];
    apps.forEach((id) => {
      dockIcon(ctx, id, ix, DOCK_TOP + DOCK.pad, DOCK.size, f);
      if (running.includes(id)) {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();
        ctx.arc(ix + DOCK.size / 2, DOCK_TOP + DOCK_H - 3, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ix += DOCK.size + DOCK.gap;
    });
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(ix + 2, DOCK_TOP + 10, 1, DOCK_H - 20);
    dockIcon(ctx, "trash", ix + 14, DOCK_TOP + DOCK.pad, DOCK.size, f);

    this.chrome(ctx, f, o);

    this.out = document.createElement("canvas");
    this.out.width = W;
    this.out.height = H;
    this.texture = new THREE.CanvasTexture(this.out);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    this.draw(0);
  }

  /** Bingkai jendela: bayangan, sudut membulat, toolbar Safari / title bar aplikasi. */
  private chrome(ctx: Ctx, f: F, o: DesktopOpts) {
    const { x, y, w, h, bar } = this.win;
    const dark = !!this.content.dark;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 22;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fillStyle = this.content.tint;
    ctx.fill();
    ctx.restore();
    // toolbar (berwarna mengikuti halaman, sedikit lebih gelap/terang)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, bar, [12, 12, 0, 0]);
    ctx.clip();
    ctx.fillStyle = this.content.tint;
    ctx.fillRect(x, y, w, bar);
    ctx.fillStyle = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.035)";
    ctx.fillRect(x, y, w, bar);
    ctx.restore();
    ctx.fillStyle = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
    ctx.fillRect(x, y + bar - 1, w, 1);
    // lampu lalu lintas
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x + 20 + i * 20, y + bar / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });
    const ink = dark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.62)";
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = 1.7;
    ctx.lineCap = ctx.lineJoin = "round";
    const cy = y + bar / 2;
    if (o.kind === "safari") {
      // sidebar
      ctx.beginPath();
      ctx.roundRect(x + 92, cy - 8, 22, 16, 3);
      ctx.moveTo(x + 100, cy - 8);
      ctx.lineTo(x + 100, cy + 8);
      ctx.stroke();
      // kembali / maju
      ctx.beginPath();
      ctx.moveTo(x + 140, cy - 7);
      ctx.lineTo(x + 133, cy);
      ctx.lineTo(x + 140, cy + 7);
      ctx.stroke();
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(x + 162, cy - 7);
      ctx.lineTo(x + 169, cy);
      ctx.lineTo(x + 162, cy + 7);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // bilah alamat
      const aw = Math.min(560, w * 0.46), ax = x + w / 2 - aw / 2;
      ctx.fillStyle = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";
      ctx.beginPath();
      ctx.roundRect(ax, cy - 15, aw, 30, 8);
      ctx.fill();
      ctx.font = `500 14px ${f.sans}`;
      const tw = ctx.measureText(o.title).width;
      // perisai privasi
      const sx = x + w / 2 - tw / 2 - 18;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(sx, cy - 6);
      ctx.lineTo(sx + 5, cy - 8);
      ctx.lineTo(sx + 10, cy - 6);
      ctx.quadraticCurveTo(sx + 10, cy + 4, sx + 5, cy + 7);
      ctx.quadraticCurveTo(sx, cy + 4, sx, cy - 6);
      ctx.stroke();
      ctx.fillStyle = dark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.82)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(o.title, x + w / 2 + 4, cy + 1);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      // muat ulang
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ax + aw - 18, cy, 5.5, -Math.PI * 0.3, Math.PI * 1.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax + aw - 14, cy - 8);
      ctx.lineTo(ax + aw - 13, cy - 4);
      ctx.lineTo(ax + aw - 17, cy - 3);
      ctx.stroke();
      // share, +, ikhtisar tab
      const rx = x + w - 30;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.roundRect(rx - 6, cy - 4, 12, 13, 2);
      ctx.moveTo(rx, cy + 3);
      ctx.lineTo(rx, cy - 10);
      ctx.moveTo(rx - 4, cy - 6);
      ctx.lineTo(rx, cy - 10);
      ctx.lineTo(rx + 4, cy - 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rx - 40, cy - 7);
      ctx.lineTo(rx - 40, cy + 7);
      ctx.moveTo(rx - 47, cy);
      ctx.lineTo(rx - 33, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(rx - 84, cy - 5, 13, 11, 2);
      ctx.roundRect(rx - 80, cy - 9, 13, 11, 2);
      ctx.stroke();
    } else {
      ctx.font = `600 14px ${f.sans}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.78)";
      ctx.fillText(o.title, x + w / 2, cy + 1);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }
  }

  /** Gambar isi jendela; `scroll` 0–1 = progres gulir halaman. */
  draw(scroll: number) {
    if (!this.dirty && Math.abs(scroll - this.last) < 0.0015) return;
    this.dirty = false;
    this.last = scroll;
    const ctx = this.out.getContext("2d")!;
    ctx.drawImage(this.base, 0, 0);
    const { x, y, w, h, bar } = this.win;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y + bar, w, h - bar, [0, 0, 12, 12]);
    ctx.clip();
    ctx.fillStyle = this.content.tint;
    ctx.fillRect(x, y + bar, w, h - bar);
    this.content.draw(ctx, x, y + bar, w, h - bar, scroll);
    ctx.restore();
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}
