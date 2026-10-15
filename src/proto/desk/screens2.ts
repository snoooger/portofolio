"use client";

// Desain ulang layar monitor (1600×900, 16:9). Sonar mengikuti gaya situs aslinya (sonar-seo.vercel.app):
// gelap, serif besar dengan baris miring, label mono, tombol pil krem, ilustrasi pixel-art kantor isometrik.
// PromptedSite mengikuti gaya galeri promptedsite.com. ViralEngine & skripsi: desain dashboard sendiri.
import * as THREE from "three";

type F = { serif: string; sans: string; mono: string };

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d")! };
}
function tex(c: HTMLCanvasElement, repeat = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill?: string | CanvasGradient, stroke?: string, lw = 1.5) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}
function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left", spacing = 0) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacing}px`;
  ctx.fillText(s, x, y);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  ctx.textAlign = "left";
}
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ─────────────────────────── SONAR ─────────────────────────── */

const SON = { bg: "#141413", panel: "#1a1a19", line: "#2c2b29", cream: "#ede6d8", dim: "#9b968c", green: "#7fd6a0" };

/** Kantor pixel-art isometrik (digambar kecil lalu diperbesar tanpa smoothing). */
function pixelOffice() {
  const W = 260, H = 170;
  const { c, ctx } = canvas(W, H);
  const ox = 130, oy = 46, tw = 9, th = 4.5;
  const p = (i: number, j: number, h = 0) => [Math.round(ox + (i - j) * tw), Math.round(oy + (i + j) * th - h)] as const;
  const poly = (pts: (readonly [number, number])[], fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
  };
  const N = 11;
  // Dinding kiri & kanan (navy) dengan jendela & rak buku
  const WH = 40;
  poly([p(0, 0), p(N, 0), p(N, 0, WH), p(0, 0, WH)], "#2c3a6e");
  poly([p(0, 0), p(0, N), p(0, N, WH), p(0, 0, WH)], "#24315d");
  poly([p(0, 0, WH), p(N, 0, WH), p(N, 0, WH + 3), p(0, 0, WH + 3)], "#3b4b86");
  poly([p(0, 0, WH), p(0, N, WH), p(0, N, WH + 3), p(0, 0, WH + 3)], "#33427a");
  // jendela
  for (const a of [2, 7]) poly([p(a, 0, 30), p(a + 2, 0, 30), p(a + 2, 0, 14), p(a, 0, 14)], "#9ccbe6");
  for (const a of [6]) poly([p(0, a, 30), p(0, a + 2, 30), p(0, a + 2, 14), p(0, a, 14)], "#8bbcd9");
  // rak buku di dinding kanan
  for (const a of [4.5, 9]) {
    poly([p(a, 0, 34), p(a + 1.6, 0, 34), p(a + 1.6, 0, 0), p(a, 0, 0)], "#7a4e2c");
    for (let r = 0; r < 4; r++) {
      const cols = ["#c9503a", "#e3c27a", "#5e8fb8", "#7fbf7a", "#d9d4cc"];
      for (let b = 0; b < 4; b++) poly([p(a + 0.15 + b * 0.35, 0, 30 - r * 8), p(a + 0.4 + b * 0.35, 0, 30 - r * 8), p(a + 0.4 + b * 0.35, 0, 24 - r * 8), p(a + 0.15 + b * 0.35, 0, 24 - r * 8)], cols[(r + b + Math.round(a)) % 5]);
    }
  }
  poly([p(0, 2, 34), p(0, 3.6, 34), p(0, 3.6, 0), p(0, 2, 0)], "#7a4e2c");
  // Lantai kotak-kotak
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) poly([p(i, j), p(i + 1, j), p(i + 1, j + 1), p(i, j + 1)], (i + j) % 2 ? "#e6d3ad" : "#cdb68b");
  // Karpet
  poly([p(1.5, 7), p(4.5, 7), p(4.5, 9.5), p(1.5, 9.5)], "#9c3b2e");
  poly([p(2, 7.4), p(4, 7.4), p(4, 9.1), p(2, 9.1)], "#b85a3c");
  poly([p(7, 7.5), p(9.5, 7.5), p(9.5, 9.8), p(7, 9.8)], "#3f7a4b");
  // Kotak isometrik (meja, kursi, tanaman, agen)
  const box = (i: number, j: number, w: number, d: number, h: number, top: string, left: string, right: string, z = 0) => {
    poly([p(i, j + d, z), p(i + w, j + d, z), p(i + w, j + d, z + h), p(i, j + d, z + h)], left);
    poly([p(i + w, j, z), p(i + w, j + d, z), p(i + w, j + d, z + h), p(i + w, j, z + h)], right);
    poly([p(i, j, z + h), p(i + w, j, z + h), p(i + w, j + d, z + h), p(i, j + d, z + h)], top);
  };
  const agentCols = ["#e9a07f", "#8fb3c9", "#9aa58b", "#e3c27a", "#c2552f", "#b7a1d8"];
  const desks: [number, number][] = [
    [2, 2], [5, 2], [8, 2], [2, 4.6], [5, 4.6], [8, 4.6], [5.2, 7.8],
  ];
  desks.forEach(([i, j], k) => {
    box(i, j, 2, 1, 6, "#b9875a", "#8c613c", "#a2714a");
    box(i + 0.3, j + 0.15, 0.7, 0.2, 5, "#2c2c2c", "#1e1e1e", "#262626", 6);
    poly([p(i + 0.35, j + 0.35, 10), p(i + 0.95, j + 0.35, 10), p(i + 0.95, j + 0.35, 7), p(i + 0.35, j + 0.35, 7)], "#7fd6a0");
    box(i + 1.15, j + 0.2, 0.6, 0.18, 4, "#d9d4cc", "#b5b0a6", "#c8c3b9", 6);
    // kursi + agen
    box(i + 0.6, j + 1.25, 0.7, 0.6, 4, "#3b4b86", "#2c3a6e", "#33427a");
    const col = agentCols[k % agentCols.length];
    box(i + 0.75, j + 1.35, 0.4, 0.3, 7, col, col, col, 4);
    box(i + 0.8, j + 1.4, 0.3, 0.2, 3, "#f1c9a5", "#e0b28d", "#e8bd98", 11);
  });
  // Tanaman
  for (const [i, j] of [[9.6, 9.6], [0.6, 9.4], [9.8, 0.6]] as [number, number][]) {
    box(i, j, 0.6, 0.6, 4, "#8c5a3c", "#6e452c", "#7c4e33");
    ctx.fillStyle = "#3f8a4b";
    const [x, y] = p(i + 0.3, j + 0.3, 12);
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5aa864";
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  return { c, p };
}

export function sonarLanding(f: F) {
  const W = 1600, H = 900;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = SON.bg;
  ctx.fillRect(0, 0, W, H);
  // Nav
  ctx.strokeStyle = SON.cream;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(52, 50, 12, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(52, 50, 6, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  text(ctx, "sonar", 74, 58, `34px ${f.serif}`, SON.cream);
  ["HOW IT WORKS", "LEVERS", "CONNECTIONS", "FREE SCAN", "METHODOLOGY"].forEach((n, i) => text(ctx, n, 230 + i * 150, 55, `500 15px ${f.mono}`, SON.cream, "left", 1));
  rr(ctx, 1040, 32, 70, 38, 19, undefined, SON.line);
  text(ctx, "EN ⌄", 1075, 56, `500 14px ${f.mono}`, SON.cream, "center");
  rr(ctx, 1124, 32, 160, 38, 19, undefined, SON.line);
  rr(ctx, 1128, 36, 74, 30, 15, "#2a2927");
  text(ctx, "DARK", 1165, 56, `500 13px ${f.mono}`, SON.cream, "center", 1);
  text(ctx, "LIGHT", 1243, 56, `500 13px ${f.mono}`, SON.dim, "center", 1);
  text(ctx, "SIGN IN", 1340, 56, `500 15px ${f.mono}`, SON.cream, "center", 1);
  rr(ctx, 1400, 30, 168, 42, 21, SON.cream);
  text(ctx, "REQUEST ACCESS", 1484, 57, `600 14px ${f.mono}`, "#141413", "center", 1);
  ctx.fillStyle = SON.line;
  ctx.fillRect(0, 96, W, 1.5);

  // Hero kiri
  text(ctx, "An office of AI agents,", 64, 236, `82px ${f.serif}`, SON.cream);
  text(ctx, "working on how", 64, 322, `italic 82px ${f.serif}`, SON.cream);
  text(ctx, "engines see you.", 64, 408, `italic 82px ${f.serif}`, SON.cream);
  ["They research, write, fix and measure your", "site for Google and AI answers. On autopilot —", "every change is checked, measured and reversible."].forEach((l, i) =>
    text(ctx, l, 66, 482 + i * 40, `400 27px ${f.sans}`, "rgba(237,230,216,0.86)"),
  );
  rr(ctx, 64, 616, 620, 70, 35, "#1b1b1a", SON.line, 2);
  text(ctx, "yoursite.com", 98, 660, `400 22px ${f.mono}`, "#7d7a73");
  rr(ctx, 468, 626, 206, 50, 25, SON.cream);
  text(ctx, "FREE SCAN  →", 571, 658, `600 17px ${f.mono}`, "#141413", "center", 1);
  rr(ctx, 64, 704, 230, 50, 25, undefined, SON.line, 2);
  text(ctx, "REQUEST ACCESS", 179, 736, `500 16px ${f.mono}`, SON.cream, "center", 1);

  // Panel demo kanan + pixel office
  const px = 780, py = 132, pw = 760, ph = 560;
  rr(ctx, px, py, pw, ph, 18, "#161c33", SON.line, 2);
  const off = pixelOffice();
  ctx.imageSmoothingEnabled = false;
  const scale = 2.85;
  const ix = px + (pw - off.c.width * scale) / 2, iy = py + 70;
  ctx.drawImage(off.c, ix, iy, off.c.width * scale, off.c.height * scale);
  ctx.imageSmoothingEnabled = true;
  rr(ctx, px + 22, py + 22, 270, 38, 19, "#141413", SON.line);
  ctx.fillStyle = SON.green;
  ctx.beginPath();
  ctx.arc(px + 44, py + 41, 5, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, "DEMO · EXAMPLE TASKS", px + 60, py + 47, `500 15px ${f.mono}`, SON.cream, "left", 1);
  const tip = (label: string, task: string, x: number, y: number) => {
    ctx.font = `500 15px ${f.mono}`;
    const w = ctx.measureText(`${label}  ${task}`).width + 30;
    rr(ctx, x, y, w, 34, 6, "#f4efe4", "#1a1a19", 2);
    text(ctx, label, x + 14, y + 23, `600 15px ${f.mono}`, "#141413");
    text(ctx, task, x + 16 + ctx.measureText(label + " ").width + 6, y + 23, `400 15px ${f.sans}`, "#3a3833");
  };
  tip("Engineer", "Fixing 12 titles", px + 150, py + 300);
  tip("Editor", "Fact-checking a draft", px + 430, py + 300);
  tip("Researcher", "Mapping AI answers", px + 260, py + 170);

  // Pita titik + baris mesin
  const r = rng(5);
  for (let y = 730; y < 790; y += 12)
    for (let x = 8; x < W; x += 12) {
      const a = r();
      ctx.fillStyle = `rgba(237,230,216,${a > 0.82 ? 0.55 : a > 0.5 ? 0.16 : 0.07})`;
      ctx.beginPath();
      ctx.arc(x, y, a > 0.82 ? 2.6 : 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  ctx.fillStyle = SON.line;
  ctx.fillRect(0, 806, W, 1.5);
  const eng: [string, string][] = [["GOOGLE", "AI OVERVIEWS"], ["CHATGPT", "OAI-SEARCHBOT"], ["PERPLEXITY", "PERPLEXITYBOT"], ["GEMINI", "GOOGLE-EXTENDED"], ["COPILOT", "BINGBOT"], ["CLAUDE", "CLAUDEBOT"], ["GROK", "XAI"]];
  const cw = W / eng.length;
  eng.forEach(([a, b], i) => {
    if (i) ctx.fillRect(i * cw, 806, 1.5, 94);
    text(ctx, a, i * cw + cw / 2, 848, `600 17px ${f.mono}`, SON.cream, "center", 1);
    text(ctx, b, i * cw + cw / 2, 876, `400 13px ${f.mono}`, SON.dim, "center", 1);
  });
  return tex(c);
}

/* ─────────────────────────── PROMPTEDSITE ─────────────────────────── */

type Thumb = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, f: F) => void;

const THUMBS: Thumb[] = [
  // Editorial monokrom
  (ctx, x, y, w, h, f) => {
    rr(ctx, x, y, w, h, 12, "#ecebe7");
    text(ctx, "TIMELESS", x + 24, y + h * 0.55, `800 ${w * 0.15}px ${f.sans}`, "#111", "left", -2);
    text(ctx, "WONDERS", x + 24, y + h * 0.55 + w * 0.14, `800 ${w * 0.15}px ${f.sans}`, "#111", "left", -2);
    const g = ctx.createRadialGradient(x + w * 0.72, y + h * 0.36, 4, x + w * 0.72, y + h * 0.36, w * 0.2);
    g.addColorStop(0, "#d8d5ce");
    g.addColorStop(1, "#8f8b83");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x + w * 0.72, y + h * 0.36, w * 0.18, 0, Math.PI * 2);
    ctx.fill();
    rr(ctx, x + 24, y + h - 46, 110, 26, 13, "#111");
  },
  // Chrome blob 3D
  (ctx, x, y, w, h, f) => {
    rr(ctx, x, y, w, h, 12, "#08080b");
    const g = ctx.createRadialGradient(x + w * 0.45, y + h * 0.4, 6, x + w * 0.5, y + h * 0.5, w * 0.32);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.25, "#9aa0ad");
    g.addColorStop(0.6, "#2a2d36");
    g.addColorStop(1, "#08080b");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.5, w * 0.28, h * 0.32, 0.4, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, "CHROME HORIZON", x + w / 2, y + 40, `600 ${w * 0.045}px ${f.mono}`, "#cfd3dc", "center", 3);
  },
  // Portofolio karakter
  (ctx, x, y, w, h, f) => {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, "#1c2b4a");
    g.addColorStop(1, "#0b1020");
    rr(ctx, x, y, w, h, 12, g);
    text(ctx, "HI, I'M JACK", x + 24, y + 70, `900 ${w * 0.11}px ${f.sans}`, "#fff", "left", -1);
    const c = ctx.createRadialGradient(x + w * 0.62, y + h * 0.62, 6, x + w * 0.62, y + h * 0.62, w * 0.26);
    c.addColorStop(0, "#ffd29a");
    c.addColorStop(1, "#c46b2f");
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + w * 0.62, y + h * 0.66, w * 0.2, 0, Math.PI * 2);
    ctx.fill();
    rr(ctx, x + w - 92, y + 26, 68, 24, 12, "#b14bff");
  },
  // Space Web3
  (ctx, x, y, w, h, f) => {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, "#2b1055");
    g.addColorStop(1, "#d53369");
    rr(ctx, x, y, w, h, 12, g);
    const r = rng(9);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillRect(x + r() * w, y + r() * h, 2, 2);
    }
    const p = ctx.createRadialGradient(x + w * 0.7, y + h * 0.7, 4, x + w * 0.7, y + h * 0.7, w * 0.3);
    p.addColorStop(0, "#9fd3ff");
    p.addColorStop(1, "#3a2a7a");
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.arc(x + w * 0.74, y + h * 0.82, w * 0.3, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, "BEYOND EARTH", x + 24, y + 70, `800 ${w * 0.085}px ${f.sans}`, "#fff", "left", -1);
  },
  // Kinetic type
  (ctx, x, y, w, h, f) => {
    rr(ctx, x, y, w, h, 12, "#f2ff5a");
    for (let i = 0; i < 4; i++) text(ctx, "MOTION", x + 18 - i * 30, y + 70 + i * w * 0.12, `900 ${w * 0.14}px ${f.sans}`, i % 2 ? "#111" : "rgba(17,17,17,0.18)", "left", -3);
  },
  // Glass pricing
  (ctx, x, y, w, h, f) => {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, "#5b5bf0");
    g.addColorStop(1, "#ff8ac7");
    rr(ctx, x, y, w, h, 12, g);
    for (let i = 0; i < 3; i++) rr(ctx, x + 24 + i * (w - 48) / 3, y + 50 + (i === 1 ? -12 : 0), (w - 48) / 3 - 12, h - 100, 12, "rgba(255,255,255,0.22)", "rgba(255,255,255,0.5)");
    text(ctx, "$49", x + w / 2, y + h * 0.5, `800 ${w * 0.07}px ${f.sans}`, "#fff", "center");
  },
  // Liquid gradient agency
  (ctx, x, y, w, h, f) => {
    rr(ctx, x, y, w, h, 12, "#0e0e0e");
    for (let i = 0; i < 3; i++) {
      const c = ctx.createRadialGradient(x + w * (0.3 + i * 0.25), y + h * 0.55, 4, x + w * (0.3 + i * 0.25), y + h * 0.55, w * 0.25);
      c.addColorStop(0, ["#ff6a3d", "#ffb13d", "#7b5cff"][i]);
      c.addColorStop(1, "rgba(14,14,14,0)");
      ctx.fillStyle = c;
      ctx.fillRect(x, y, w, h);
    }
    text(ctx, "Liquid studio", x + 24, y + 60, `italic ${w * 0.09}px ${f.serif}`, "#fff");
  },
  // Isometric dashboard
  (ctx, x, y, w, h) => {
    rr(ctx, x, y, w, h, 12, "#f5f6fb");
    rr(ctx, x + 20, y + 20, w * 0.22, h - 40, 10, "#e3e6f3");
    for (let i = 0; i < 3; i++) rr(ctx, x + w * 0.3 + i * w * 0.22, y + 24, w * 0.2, 60, 10, "#fff", "#e3e6f3");
    ctx.strokeStyle = "#5b5bf0";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) ctx.lineTo(x + w * 0.3 + i * w * 0.064, y + h - 50 - Math.sin(i * 0.8) * 30 - i * 6);
    ctx.stroke();
  },
  // Noir lookbook
  (ctx, x, y, w, h, f) => {
    rr(ctx, x, y, w, h, 12, "#191716");
    for (let i = 0; i < 3; i++) {
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, "#5a524c");
      g.addColorStop(1, "#1f1c1a");
      rr(ctx, x + 20 + i * (w - 40) / 3, y + 40, (w - 40) / 3 - 14, h - 80, 6, g);
    }
    text(ctx, "NOIR", x + w / 2, y + 34, `600 ${w * 0.05}px ${f.mono}`, "#e9e2d8", "center", 8);
  },
];

const PS_CARDS = [
  ["Monochrome Paleontology Landing", "Landing Pages", "Premium"],
  ["Chrome Horizon Shader", "Shaders", "Premium"],
  ["3D Creator Portfolio", "Portfolios", "Copy"],
  ["Deep Space Web3 Landing", "Landing Pages", "Premium"],
  ["Kinetic Type Hero", "Heroes", "Copy"],
  ["Glass Morph Pricing", "Components", "Premium"],
  ["Liquid Gradient Agency", "Templates", "Premium"],
  ["Isometric SaaS Dashboard", "UI Systems", "Copy"],
  ["Noir Fashion Lookbook", "Templates", "Premium"],
];

/** Galeri PromptedSite (1600×2700, digulir di layar). */
export function promptedGallery(f: F) {
  const W = 1600, H = 2700;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#0d0d11";
  ctx.fillRect(0, 0, W, H);
  // Nav pil
  rr(ctx, 420, 30, 760, 66, 33, "#16161c", "#24242c");
  text(ctx, "PROMPTEDSIT", 458, 72, `600 20px ${f.mono}`, "#ecebf3", "left", 2);
  text(ctx, "E", 458 + 146, 72, `600 20px ${f.mono}`, "#8b6dff", "left", 2);
  ["Home", "Gallery", "Pricing", "Sign In"].forEach((t, i) => text(ctx, t, 660 + i * 92, 71, `500 18px ${f.sans}`, i === 1 ? "#fff" : "#8d8a99"));
  rr(ctx, 1014, 42, 150, 42, 21, "#7b5cff");
  text(ctx, "Go Unlimited", 1089, 70, `600 17px ${f.sans}`, "#fff", "center");
  // Judul
  text(ctx, "The", 60, 236, `700 110px ${f.sans}`, "#f4f2fb", "left", -3);
  text(ctx, "gallery.", 270, 236, `italic 118px ${f.serif}`, "#8b6dff");
  text(ctx, "500+ PROMPTS · NEW DROPS WEEKLY", W - 60, 226, `500 17px ${f.mono}`, "#6f6c7c", "right", 2);
  let x = 60;
  ["All", "Heroes", "Landing Pages", "Templates", "Shaders", "UI Systems", "Components", "Portfolios", "Animations", "3D & Games"].forEach((cat, i) => {
    ctx.font = `500 18px ${f.sans}`;
    const w = ctx.measureText(cat).width + 40;
    rr(ctx, x, 290, w, 46, 23, i === 0 ? "#2b2934" : "#16161c", i === 0 ? undefined : "#24242c");
    text(ctx, cat, x + 20, 320, `500 18px ${f.sans}`, i === 0 ? "#fff" : "#a9a6b6");
    x += w + 12;
  });
  rr(ctx, 60, 360, 520, 52, 12, "#14141a", "#24242c");
  text(ctx, "Search prompts...", 88, 393, `400 19px ${f.sans}`, "#5f5c6b");
  rr(ctx, W - 300, 360, 240, 52, 12, "#14141a", "#24242c");
  text(ctx, "Popular  ⌄", W - 180, 393, `500 18px ${f.sans}`, "#a9a6b6", "center");
  // Grid kartu
  const gap = 28, colW = (W - 120 - gap * 2) / 3, cardH = 470, thumbH = 340;
  PS_CARDS.forEach(([title, cat, tag], i) => {
    const cx = 60 + (i % 3) * (colW + gap);
    const cy = 450 + Math.floor(i / 3) * (cardH + gap);
    rr(ctx, cx, cy, colW, cardH, 18, "#14141a", "#202027");
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx + 12, cy + 12, colW - 24, thumbH, 12);
    ctx.clip();
    THUMBS[i % THUMBS.length](ctx, cx + 12, cy + 12, colW - 24, thumbH, f);
    ctx.restore();
    rr(ctx, cx + 26, cy + 26, 104, 28, 14, "rgba(0,0,0,0.55)");
    text(ctx, "PREMIUM", cx + 78, cy + 46, `600 13px ${f.mono}`, "#e6e3f0", "center", 1.5);
    text(ctx, title, cx + 22, cy + thumbH + 62, `600 22px ${f.sans}`, "#f2f0fa");
    text(ctx, cat, cx + 22, cy + thumbH + 94, `400 17px ${f.sans}`, "#7d7a8a");
    rr(ctx, cx + colW - 132, cy + thumbH + 52, 110, 40, 20, tag === "Copy" ? "#7b5cff" : "#22212a");
    text(ctx, tag === "Copy" ? "⧉ Copy" : "★ Premium", cx + colW - 77, cy + thumbH + 78, `600 15px ${f.sans}`, tag === "Copy" ? "#fff" : "#cfc9ff", "center");
  });
  return tex(c, true);
}

/* ─────────────────────────── VIRALENGINE ─────────────────────────── */

export function viralDashboard(f: F) {
  const W = 1600, H = 900;
  const { c, ctx } = canvas(W, H);
  const r = rng(21);
  ctx.fillStyle = "#0e0f12";
  ctx.fillRect(0, 0, W, H);
  // Sidebar
  ctx.fillStyle = "#121418";
  ctx.fillRect(0, 0, 250, H);
  rr(ctx, 28, 30, 36, 36, 10, "#ff6a3d");
  text(ctx, "ViralEngine", 76, 56, `700 24px ${f.sans}`, "#f2efe9");
  ["Overview", "Already viral", "About to be viral", "Creators", "Niches", "Alerts"].forEach((n, i) => {
    if (i === 0) rr(ctx, 18, 104 + i * 52, 214, 42, 10, "#1d2027");
    rr(ctx, 36, 118 + i * 52, 14, 14, 4, i === 0 ? "#ff6a3d" : "#3a3e48");
    text(ctx, n, 64, 131 + i * 52, `${i === 0 ? 600 : 500} 18px ${f.sans}`, i === 0 ? "#fff" : "#8e94a2");
  });
  text(ctx, "PLATFORMS", 36, 480, `600 13px ${f.mono}`, "#5b606c", "left", 2);
  const plat: [string, string][] = [["TikTok", "#25f4ee"], ["Instagram", "#e1306c"], ["YouTube", "#ff3b30"], ["Facebook", "#4c7bf3"], ["Douyin", "#fe2c55"], ["RedNote", "#ff2442"]];
  plat.forEach(([n, col], i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(42, 514 + i * 40, 6, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, n, 60, 520 + i * 40, `500 17px ${f.sans}`, "#c9cdd6");
  });
  // Header
  text(ctx, "Trend radar", 290, 66, `700 34px ${f.sans}`, "#f4f2ee");
  text(ctx, "What is viral now — and what is about to be.", 290, 98, `400 18px ${f.sans}`, "#8e94a2");
  rr(ctx, 1290, 38, 130, 42, 21, "#1a1d23", "#2a2e37");
  text(ctx, "Last 24h ⌄", 1355, 65, `500 16px ${f.sans}`, "#c9cdd6", "center");
  rr(ctx, 1434, 38, 130, 42, 21, "#1a1d23", "#2a2e37");
  text(ctx, "DEMO DATA", 1499, 65, `600 13px ${f.mono}`, "#ffb13d", "center", 1.5);
  // KPI
  const kpis: [string, string, string][] = [["Tracked posts", "48.2K", "+12%"], ["Rising now", "137", "+31"], ["Avg. velocity", "4.8×", "+0.6"], ["Creators watched", "1,204", "+18"]];
  kpis.forEach(([k, v, d], i) => {
    const x = 290 + i * 320;
    rr(ctx, x, 128, 300, 120, 16, "#15171c", "#22252d");
    text(ctx, k, x + 24, 166, `500 16px ${f.sans}`, "#8e94a2");
    text(ctx, v, x + 24, 222, `700 42px ${f.sans}`, "#f4f2ee", "left", -1);
    rr(ctx, x + 200, 196, 76, 30, 15, "rgba(72,199,116,0.15)");
    text(ctx, d, x + 238, 217, `600 15px ${f.mono}`, "#48c774", "center");
  });
  // Grafik velocity
  const gx = 290, gy = 272, gw = 820, gh = 380;
  rr(ctx, gx, gy, gw, gh, 16, "#15171c", "#22252d");
  text(ctx, "Engagement velocity", gx + 24, gy + 42, `600 20px ${f.sans}`, "#f4f2ee");
  [["Already viral", "#ff6a3d"], ["About to be viral", "#48c774"]].forEach(([n, col], i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(gx + gw - 330 + i * 150, gy + 36, 6, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, n, gx + gw - 318 + i * 150, gy + 42, `500 15px ${f.sans}`, "#c9cdd6");
  });
  const plot = (fn: (t: number) => number, col: string) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48;
      pts.push([gx + 40 + t * (gw - 70), gy + gh - 40 - fn(t) * (gh - 120)]);
    }
    const grad = ctx.createLinearGradient(0, gy + 60, 0, gy + gh - 40);
    grad.addColorStop(0, col + "55");
    grad.addColorStop(1, col + "00");
    ctx.beginPath();
    pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineTo(pts[pts.length - 1][0], gy + gh - 40);
    ctx.lineTo(pts[0][0], gy + gh - 40);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = col;
    ctx.lineWidth = 3.5;
    ctx.stroke();
  };
  ctx.strokeStyle = "#20232a";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(gx + 40, gy + 80 + i * 65);
    ctx.lineTo(gx + gw - 30, gy + 80 + i * 65);
    ctx.stroke();
  }
  plot((t) => 0.55 + Math.sin(t * 5) * 0.08 + t * 0.15, "#ff6a3d");
  plot((t) => 0.08 + Math.pow(t, 2.6) * 0.82 + Math.sin(t * 9) * 0.02, "#48c774");
  ["00", "04", "08", "12", "16", "20", "24"].forEach((h, i) => text(ctx, `${h}:00`, gx + 40 + i * ((gw - 70) / 6), gy + gh - 12, `500 13px ${f.mono}`, "#5b606c", "center"));
  // Daftar "about to be viral"
  const lx = 1130, lw = 434;
  rr(ctx, lx, gy, lw, gh, 16, "#15171c", "#22252d");
  text(ctx, "About to be viral", lx + 22, gy + 42, `600 20px ${f.sans}`, "#f4f2ee");
  for (let k = 0; k < 5; k++) {
    const y = gy + 68 + k * 60;
    const [pn, pc] = plat[k % plat.length];
    const g = ctx.createLinearGradient(lx + 22, y, lx + 66, y + 48);
    g.addColorStop(0, ["#f6a26b", "#8fd3e8", "#f3d27a", "#c6e3a1", "#e7b4d6"][k]);
    g.addColorStop(1, "#1e1b18");
    rr(ctx, lx + 22, y, 40, 50, 8, g);
    rr(ctx, lx + 76, y + 8, 180 + r() * 60, 12, 6, "rgba(242,239,233,0.85)");
    ctx.fillStyle = pc;
    ctx.beginPath();
    ctx.arc(lx + 82, y + 38, 5, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, pn, lx + 94, y + 43, `500 14px ${f.sans}`, "#8e94a2");
    rr(ctx, lx + lw - 112, y + 12, 90, 30, 15, "rgba(72,199,116,0.15)");
    text(ctx, `+${Math.round(120 + r() * 380)}%/h`, lx + lw - 67, y + 33, `600 14px ${f.mono}`, "#48c774", "center");
  }
  // Baris "already viral"
  text(ctx, "Already viral", 290, 700, `600 20px ${f.sans}`, "#f4f2ee");
  for (let k = 0; k < 6; k++) {
    const x = 290 + k * 214;
    rr(ctx, x, 720, 200, 150, 14, "#15171c", "#22252d");
    const g = ctx.createLinearGradient(x, 720, x + 200, 820);
    g.addColorStop(0, ["#ff8a5c", "#7cc6e8", "#f0c35c", "#9ad08a", "#d79bc9", "#c9c3b9"][k]);
    g.addColorStop(1, "#1a1a1d");
    rr(ctx, x + 10, 730, 180, 88, 10, g);
    text(ctx, `${(1 + r() * 9).toFixed(1)}M views`, x + 14, 846, `600 15px ${f.sans}`, "#f4f2ee");
    ctx.fillStyle = plat[k][1];
    ctx.beginPath();
    ctx.arc(x + 182, 841, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  return tex(c);
}

/* ─────────────────────────── SECURITY / SKRIPSI ─────────────────────────── */

export function thesisScreen(f: F) {
  const W = 1600, H = 900;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#e9e4dc";
  ctx.fillRect(0, 0, W, H);
  // Jendela notebook
  const nx = 40, ny = 40, nw = 900, nh = 820;
  rr(ctx, nx, ny, nw, nh, 14, "#fbfaf7", "#d6d0c6");
  rr(ctx, nx, ny, nw, 46, 14, "#f0ece5");
  ctx.fillStyle = "#f0ece5";
  ctx.fillRect(nx, ny + 30, nw, 16);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(nx + 24 + i * 22, ny + 23, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  text(ctx, "bilstm_attention.ipynb", nx + nw / 2, ny + 30, `500 16px ${f.mono}`, "#6b655c", "center");
  // Sel kode
  const code: [string, string][][] = [
    [["model", "#1d2333"], [" = ", "#6b655c"], ["BiLSTMAttention", "#8c3a1f"], ["(vocab, emb=", "#1d2333"], ["128", "#2f6fa3"], [", layers=", "#1d2333"], ["2", "#2f6fa3"], [")", "#1d2333"]],
    [["history", "#1d2333"], [" = ", "#6b655c"], ["model.fit", "#8c3a1f"], ["(train, val, epochs=", "#1d2333"], ["30", "#2f6fa3"], [")", "#1d2333"]],
    [["evaluate", "#8c3a1f"], ["(model, test)  ", "#1d2333"], ["# 546 samples", "#8a857c"]],
  ];
  rr(ctx, nx + 24, ny + 70, nw - 48, 120, 10, "#f3f0ea", "#e2ddd4");
  text(ctx, "[3]:", nx + 34, ny + 104, `500 16px ${f.mono}`, "#8a857c");
  code.forEach((line, li) => {
    let x = nx + 90;
    line.forEach(([s, col]) => {
      ctx.font = `500 18px ${f.mono}`;
      ctx.fillStyle = col;
      ctx.fillText(s, x, ny + 104 + li * 32);
      x += ctx.measureText(s).width;
    });
  });
  // Grafik akurasi & loss
  const gx = nx + 60, gy = ny + 230, gw = nw - 120, gh = 360;
  text(ctx, "Training · 30 epochs", gx, gy - 14, `600 20px ${f.sans}`, "#1d2333");
  [["val accuracy", "#c2552f"], ["val loss", "#2f6fa3"]].forEach(([n, col], i) => {
    ctx.fillStyle = col;
    ctx.fillRect(gx + gw - 300 + i * 160, gy - 24, 18, 4);
    text(ctx, n, gx + gw - 274 + i * 160, gy - 16, `500 15px ${f.sans}`, "#4a463f");
  });
  ctx.strokeStyle = "#e4dfd6";
  for (let i = 0; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(gx, gy + (gh / 5) * i);
    ctx.lineTo(gx + gw, gy + (gh / 5) * i);
    ctx.stroke();
  }
  const line = (fn: (e: number) => number, col: string) => {
    ctx.beginPath();
    for (let e = 0; e <= 30; e++) {
      const x = gx + (gw / 30) * e, y = gy + gh - fn(e) * gh;
      if (e) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = col;
    ctx.lineWidth = 4;
    ctx.stroke();
  };
  line((e) => (0.62 + (0.9762 - 0.62) * (1 - Math.exp(-e / 6)) - 0.5) / 0.5, "#c2552f");
  line((e) => 0.85 * Math.exp(-e / 7) + 0.06, "#2f6fa3");
  // Metrik
  [["Accuracy", "97.62%"], ["F1", "0.9762"], ["ROC-AUC", "0.9936"]].forEach(([k, v], i) => {
    const x = nx + 40 + i * 280;
    rr(ctx, x, ny + 650, 260, 130, 12, i === 0 ? "#c2552f" : "#f3f0ea", i === 0 ? undefined : "#e2ddd4");
    text(ctx, k.toUpperCase(), x + 22, ny + 688, `600 15px ${f.mono}`, i === 0 ? "#fbe6dc" : "#8a857c", "left", 1.5);
    text(ctx, v, x + 22, ny + 752, `700 50px ${f.sans}`, i === 0 ? "#fff" : "#1d2333", "left", -1);
  });
  // Jendela browser + halaman blokir
  const bx = 970, by = 40, bw = 590, bh = 820;
  rr(ctx, bx, by, bw, bh, 14, "#fbf7f1", "#d6d0c6");
  rr(ctx, bx, by, bw, 76, 14, "#f0ece5");
  ctx.fillStyle = "#f0ece5";
  ctx.fillRect(bx, by + 60, bw, 16);
  rr(ctx, bx + 24, by + 22, bw - 110, 36, 18, "#ffffff", "#e2ddd4");
  text(ctx, "🔒  ••••••••.com  (blocked)", bx + 46, by + 46, `500 16px ${f.sans}`, "#8c8478");
  rr(ctx, bx + bw - 70, by + 22, 40, 36, 10, "#c2552f");
  text(ctx, "ZJ", bx + bw - 50, by + 46, `700 14px ${f.mono}`, "#fff", "center");
  // Ikon perisai
  const sx = bx + bw / 2, sy = by + 250;
  ctx.fillStyle = "#c2552f";
  ctx.beginPath();
  ctx.moveTo(sx, sy - 80);
  ctx.lineTo(sx + 70, sy - 52);
  ctx.quadraticCurveTo(sx + 66, sy + 40, sx, sy + 80);
  ctx.quadraticCurveTo(sx - 66, sy + 40, sx - 70, sy - 52);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(sx - 26, sy - 4);
  ctx.lineTo(sx + 26, sy - 4);
  ctx.stroke();
  text(ctx, "Site blocked", sx, by + 420, `72px ${f.serif}`, "#1e1b18", "center");
  text(ctx, "This page looks like an online", sx, by + 478, `400 24px ${f.sans}`, "#5c544b", "center");
  text(ctx, "gambling site.", sx, by + 512, `400 24px ${f.sans}`, "#5c544b", "center");
  rr(ctx, bx + 70, by + 560, bw - 140, 110, 14, "#efe8dd");
  text(ctx, "CONFIDENCE  0.99", sx, by + 604, `600 20px ${f.mono}`, "#8c3a1f", "center", 2);
  text(ctx, "BiLSTM + attention · FastAPI", sx, by + 640, `500 17px ${f.mono}`, "#5c544b", "center");
  rr(ctx, sx - 150, by + 706, 300, 60, 30, "#1e1b18");
  text(ctx, "Back to safety", sx, by + 744, `600 20px ${f.sans}`, "#fbf7f1", "center");
  return tex(c);
}
