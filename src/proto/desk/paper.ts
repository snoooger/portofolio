"use client";

// Tekstur kertas untuk prototipe meja: post-it tulisan tangan, kartu indeks, papan gabus,
// dan isi layar monitor per proyek. Semua digambar dengan canvas.
import * as THREE from "three";
import { P } from "../palette";
import type { Note } from "./copy";

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
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const INK = "#1d2333"; // spidol biru-hitam

/** Post-it tulisan tangan: judul, beberapa baris, dan (opsional) angka besar. */
export function stickyNote(note: Note, hand: string, w = 768, h = 768) {
  const { c, ctx } = canvas(w, h);
  const base = note.color ?? "#F6DD7A";
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  // Pita perekat di atas sedikit lebih gelap, bayangan lengkung di bawah.
  const top = ctx.createLinearGradient(0, 0, 0, h * 0.16);
  top.addColorStop(0, "rgba(0,0,0,0.07)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, h * 0.16);
  const bot = ctx.createLinearGradient(0, h * 0.8, 0, h);
  bot.addColorStop(0, "rgba(0,0,0,0)");
  bot.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = bot;
  ctx.fillRect(0, h * 0.8, w, h * 0.2);
  const r = rng(note.title.length * 31 + 7);
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = `rgba(0,0,0,${r() * 0.03})`;
    ctx.fillRect(r() * w, r() * h, 2, 2);
  }

  const pad = w * 0.08;
  ctx.fillStyle = INK;
  const bigTitle = note.title.length <= 6 && !note.facts;
  ctx.font = `700 ${bigTitle ? w * 0.3 : w * 0.15}px ${hand}`;
  let y = bigTitle ? h * 0.42 : h * 0.21;
  ctx.fillText(note.title, pad, y);
  // Garis bawah coretan terakota
  if (!bigTitle) {
    const tw = Math.min(ctx.measureText(note.title).width, w - pad * 2);
    ctx.strokeStyle = P.terracotta;
    ctx.lineWidth = w * 0.009;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pad, y + h * 0.03);
    ctx.bezierCurveTo(pad + tw * 0.3, y + h * 0.015, pad + tw * 0.7, y + h * 0.045, pad + tw, y + h * 0.022);
    ctx.stroke();
  }
  y += bigTitle ? h * 0.14 : h * 0.135;
  ctx.font = `700 ${bigTitle ? w * 0.1 : w * 0.084}px ${hand}`;
  for (const l of note.lines) {
    ctx.fillText(l, pad, y);
    y += bigTitle ? h * 0.115 : h * 0.1;
  }
  if (note.facts?.length) {
    const colW = (w - pad * 2) / note.facts.length;
    const fy = h - h * 0.17;
    note.facts.forEach((f, i) => {
      ctx.fillStyle = P.terracottaDark;
      ctx.font = `700 ${w * 0.12}px ${hand}`;
      ctx.fillText(f.v, pad + i * colW, fy);
      ctx.fillStyle = INK;
      ctx.font = `700 ${w * 0.055}px ${hand}`;
      ctx.fillText(f.k, pad + i * colW, fy + h * 0.075);
    });
  }
  return tex(c);
}

/** Kartu indeks bergaris untuk papan gabus (pengalaman kerja). */
/** Goresan krayon/pulpen: jalur digambar 3× dengan getaran kecil & alfa, seperti coretan tangan. */
function scribble(ctx: CanvasRenderingContext2D, pts: [number, number][], color: string, width: number, closed = false, seed = 1) {
  const r = rng(seed * 97 + pts.length);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = ctx.lineJoin = "round";
  for (let pass = 0; pass < 3; pass++) {
    ctx.globalAlpha = pass === 0 ? 0.85 : 0.45;
    ctx.lineWidth = width * (pass === 0 ? 1 : 0.6);
    ctx.beginPath();
    const all = closed ? [...pts, pts[0]] : pts;
    all.forEach(([x, y], i) => {
      const jx = (r() - 0.5) * width * 0.9, jy = (r() - 0.5) * width * 0.9;
      if (i) ctx.lineTo(x + jx, y + jy);
      else ctx.moveTo(x + jx, y + jy);
    });
    ctx.stroke();
  }
  ctx.restore();
}
/** Arsiran zig-zag krayon untuk "mewarnai" area persegi. */
function hatch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, seed = 1) {
  const r = rng(seed * 31);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 14; i++) pts.push([x + (i % 2 ? w : 0) + (r() - 0.5) * 6, y + (i / 14) * h]);
  ctx.save();
  ctx.globalAlpha = 0.5;
  scribble(ctx, pts, color, 7, false, seed);
  ctx.restore();
}
const circlePts = (cx: number, cy: number, rx: number, ry = rx, n = 22): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * rx, cy + Math.sin((i / n) * Math.PI * 2) * ry]);

/** Coretan "logo" perusahaan di samping nama (ikon khas tiap tempat kerja, gaya pulpen & krayon). */
function companyDoodle(ctx: CanvasRenderingContext2D, org: string, x: number, y: number) {
  const o = org.toLowerCase();
  if (o.includes("web3")) {
    // Kubus berantai (blockchain) — pulpen biru
    const cube = (cx: number, cy: number, s: number, seed: number) => {
      scribble(ctx, [[cx, cy - s], [cx + s, cy - s / 2], [cx + s, cy + s / 2], [cx, cy + s], [cx - s, cy + s / 2], [cx - s, cy - s / 2]], "#2f5fb3", 5, true, seed);
      scribble(ctx, [[cx - s, cy - s / 2], [cx, cy], [cx + s, cy - s / 2]], "#2f5fb3", 4, false, seed + 1);
      scribble(ctx, [[cx, cy], [cx, cy + s]], "#2f5fb3", 4, false, seed + 2);
    };
    cube(x + 34, y + 40, 30, 1);
    cube(x + 110, y + 20, 22, 4);
    scribble(ctx, [[x + 62, y + 34], [x + 90, y + 26]], "#2f5fb3", 4, false, 7);
  } else if (o.includes("timedoor")) {
    // Pintu dengan jam di tengahnya — krayon oranye
    scribble(ctx, [[x + 20, y + 100], [x + 20, y], [x + 92, y], [x + 92, y + 100]], "#e07a2b", 8, false, 2);
    hatch(ctx, x + 26, y + 6, 60, 92, "#f3a24a", 2);
    scribble(ctx, circlePts(x + 56, y + 46, 24), "#7a3b12", 5, false, 3);
    scribble(ctx, [[x + 56, y + 46], [x + 56, y + 30]], "#7a3b12", 5, false, 4);
    scribble(ctx, [[x + 56, y + 46], [x + 68, y + 52]], "#7a3b12", 5, false, 5);
    scribble(ctx, circlePts(x + 82, y + 64, 3, 3, 8), "#7a3b12", 4, false, 6);
  } else if (o.includes("pupr")) {
    // Jembatan lengkung di atas air — krayon kuning & biru
    scribble(ctx, Array.from({ length: 13 }, (_, i) => [x + i * 11, y + 62 - Math.sin((i / 12) * Math.PI) * 46] as [number, number]), "#d9a21b", 8, false, 3);
    scribble(ctx, [[x - 4, y + 64], [x + 136, y + 64]], "#7a5a12", 6, false, 4);
    for (let i = 1; i < 6; i++) scribble(ctx, [[x + i * 22, y + 62 - Math.sin(((i * 2) / 12) * Math.PI) * 46], [x + i * 22, y + 64]], "#d9a21b", 4, false, 10 + i);
    for (let k = 0; k < 2; k++)
      scribble(ctx, Array.from({ length: 9 }, (_, i) => [x + i * 17, y + 82 + k * 14 + (i % 2 ? 5 : -5)] as [number, number]), "#2f6fb3", 5, false, 20 + k);
  } else if (o.includes("pln")) {
    // Kotak kuning, petir merah, gelombang biru (mirip logo PLN) — krayon
    scribble(ctx, [[x + 10, y], [x + 110, y], [x + 110, y + 104], [x + 10, y + 104]], "#e0b21a", 6, true, 5);
    hatch(ctx, x + 14, y + 4, 92, 96, "#f5cf3a", 5);
    scribble(ctx, [[x + 68, y + 8], [x + 46, y + 52], [x + 66, y + 52], [x + 50, y + 96]], "#d23b2a", 8, false, 6);
    for (let k = 0; k < 3; k++)
      scribble(ctx, Array.from({ length: 7 }, (_, i) => [x + 16 + i * 15, y + 70 + k * 10 + (i % 2 ? 4 : -4)] as [number, number]), "#2f6fb3", 4, false, 30 + k);
  }
}

export function jobCard(job: { role: string; org: string; period: string; line: string }, serif: string, sans: string, mono: string) {
  const W = 900, H = 560;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#FDFBF6";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(169,194,207,0.6)";
  ctx.lineWidth = 2;
  for (let y = 150; y < H - 20; y += 52) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(194,85,47,0.5)";
  ctx.beginPath();
  ctx.moveTo(0, 110);
  ctx.lineTo(W, 110);
  ctx.stroke();
  ctx.fillStyle = P.terracottaDark;
  ctx.font = `500 30px ${mono}`;
  ctx.fillText(job.period.toUpperCase(), 48, 70);
  ctx.fillStyle = P.ink;
  ctx.font = `64px ${serif}`;
  ctx.fillText(job.org, 46, 192);
  // Coretan logo perusahaan di kanan nama, seperti digambar pakai pulpen/krayon
  companyDoodle(ctx, job.org, Math.min(46 + ctx.measureText(job.org).width + 34, W - 170), 110);
  ctx.font = `600 36px ${sans}`;
  ctx.fillText(job.role, 48, 248);
  ctx.fillStyle = P.inkSoft;
  ctx.font = `400 32px ${sans}`;
  const words = job.line.split(" ");
  let line = "", y = 352;
  for (const wd of words) {
    const t = line ? `${line} ${wd}` : wd;
    if (ctx.measureText(t).width > W - 100) {
      ctx.fillText(line, 48, y);
      line = wd;
      y += 52;
    } else line = t;
  }
  ctx.fillText(line, 48, y);
  return tex(c);
}

/** Papan gabus. */
export function corkTexture() {
  const S = 1024;
  const { c, ctx } = canvas(S, S);
  ctx.fillStyle = "#b98b5c";
  ctx.fillRect(0, 0, S, S);
  const r = rng(99);
  for (let i = 0; i < 26000; i++) {
    const t = r();
    ctx.fillStyle = t > 0.5 ? `rgba(90,55,25,${0.12 + r() * 0.25})` : `rgba(235,200,150,${0.1 + r() * 0.2})`;
    const s = 1 + r() * 4;
    ctx.fillRect(r() * S, r() * S, s, s);
  }
  return tex(c, true);
}

/** Layar Sonar: kantor agen (ilustrasi tiruan, bukan UI asli) + skor SEO/AEO/GEO. */
export function sonarScreen(sans: string, mono: string) {
  const W = 1600, H = 900;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#0f1115";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#171a20";
  ctx.fillRect(0, 0, W, 70);
  ctx.fillStyle = "#e9e5dd";
  ctx.font = `700 30px ${sans}`;
  ctx.fillText("Sonar", 36, 46);
  rr(ctx, 260, 18, 520, 36, 18, "#22262e");
  ctx.fillStyle = "#8e8a82";
  ctx.font = `500 20px ${mono}`;
  ctx.fillText("scan · your-domain.com", 284, 43);
  // Lantai kantor isometrik
  const ox = 520, oy = 470, sx = 120, sy = 64;
  const iso = (x: number, y: number) => [ox + (x - y) * sx, oy + (x + y) * sy * 0.5] as const;
  ctx.fillStyle = "#1b1f26";
  ctx.beginPath();
  [iso(-2, -2), iso(3, -2), iso(3, 3), iso(-2, 3)].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  const teams: [string, string, number, number][] = [
    ["Research", "#8fb3c9", -1, -1],
    ["Content", "#e9a07f", 2, -1],
    ["Technical", "#9aa58b", -1, 2],
    ["Growth", "#e3c27a", 2, 2],
    ["Approval", "#c2552f", 0.5, 0.5],
  ];
  teams.forEach(([name, col, x, y]) => {
    const [px, py] = iso(x, y);
    ctx.fillStyle = "#2a2f38";
    ctx.beginPath();
    ctx.moveTo(px, py - 30);
    ctx.lineTo(px + 70, py);
    ctx.lineTo(px, py + 30);
    ctx.lineTo(px - 70, py);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(px, py - 46, 16, 0, Math.PI * 2);
    ctx.fill();
    rr(ctx, px - 12, py - 34, 24, 34, 8, col);
    ctx.fillStyle = "#e9e5dd";
    ctx.font = `600 20px ${mono}`;
    ctx.textAlign = "center";
    ctx.fillText(name.toUpperCase(), px, py + 58);
    ctx.textAlign = "left";
  });
  // Panel skor
  rr(ctx, 1080, 120, 480, 720, 18, "#171a20");
  ctx.fillStyle = "#e9e5dd";
  ctx.font = `700 30px ${sans}`;
  ctx.fillText("Visibility", 1116, 180);
  ["SEO", "AEO", "GEO"].forEach((k, i) => {
    const y = 260 + i * 150;
    ctx.fillStyle = "#8e8a82";
    ctx.font = `600 22px ${mono}`;
    ctx.fillText(k, 1116, y);
    rr(ctx, 1116, y + 22, 400, 18, 9, "#262a32");
    rr(ctx, 1116, y + 22, 400 * (0.55 + i * 0.12), 18, 9, i === 0 ? "#e9a07f" : i === 1 ? "#8fb3c9" : "#9fd3a8");
  });
  ctx.fillStyle = "#8e8a82";
  ctx.font = `500 20px ${mono}`;
  ctx.fillText("changes vs. control group", 1116, 760);
  return tex(c);
}

const PLATFORMS = ["TikTok", "Instagram", "YouTube", "Facebook", "Douyin", "RedNote"];

/** Layar ViralEngine: 6 kolom platform, dua lapisan (sudah viral / berpotensi viral). Tiruan. */
export function viralScreen(sans: string, mono: string) {
  const W = 1600, H = 900;
  const { c, ctx } = canvas(W, H);
  const r = rng(17);
  ctx.fillStyle = "#101114";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#e9e5dd";
  ctx.font = `700 30px ${sans}`;
  ctx.fillText("ViralEngine", 36, 50);
  [["ALREADY VIRAL", "#e9a07f"], ["POTENTIALLY VIRAL", "#9fd3a8"]].forEach(([t, col], i) => {
    rr(ctx, 300 + i * 260, 22, 240, 40, 20, i === 0 ? "#2a2420" : "#1d2a22");
    ctx.fillStyle = col;
    ctx.font = `600 18px ${mono}`;
    ctx.fillText(t, 322 + i * 260, 48);
  });
  const colW = (W - 72) / 6;
  PLATFORMS.forEach((p, i) => {
    const x = 36 + i * colW;
    rr(ctx, x, 90, colW - 16, H - 120, 14, "#16181d");
    ctx.fillStyle = "#e9e5dd";
    ctx.font = `700 24px ${sans}`;
    ctx.fillText(p, x + 18, 130);
    for (let k = 0; k < 6; k++) {
      const y = 160 + k * 112;
      const g = ctx.createLinearGradient(x, y, x + 60, y + 90);
      g.addColorStop(0, ["#f6a26b", "#8fd3e8", "#f3d27a", "#c6e3a1", "#e7b4d6", "#d9d4cc"][(i + k) % 6]);
      g.addColorStop(1, "#1e1b18");
      rr(ctx, x + 16, y, 54, 92, 8, g);
      rr(ctx, x + 84, y + 10, colW - 130, 12, 6, "rgba(233,229,221,0.8)");
      rr(ctx, x + 84, y + 32, (colW - 130) * 0.6, 10, 5, "rgba(233,229,221,0.4)");
      const viral = k < 3;
      ctx.strokeStyle = viral ? "#e9a07f" : "#9fd3a8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let p2 = 0; p2 <= 8; p2++) {
        const px = x + 84 + p2 * ((colW - 130) / 8);
        const grow = viral ? 0.55 + r() * 0.25 : Math.pow(p2 / 8, 2.2);
        const py = y + 86 - grow * 34;
        if (p2) ctx.lineTo(px, py);
        else ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
  });
  return tex(c);
}

/** Layar Security: notebook skripsi (kurva akurasi) + jendela browser dengan halaman blokir. */
export function securityScreen(serif: string, sans: string, mono: string) {
  const W = 1600, H = 900;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#16171b";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#e9e5dd";
  ctx.font = `700 30px ${sans}`;
  ctx.fillText("bilstm_attention.ipynb", 36, 52);
  ctx.fillStyle = "#8e8a82";
  ctx.font = `500 20px ${mono}`;
  ctx.fillText("1.66M params · 3,646 pages · 546 test samples", 36, 88);
  const gx = 40, gy = 130, gw = 760, gh = 520;
  ctx.strokeStyle = "#2c2e35";
  for (let i = 0; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(gx, gy + (gh / 5) * i);
    ctx.lineTo(gx + gw, gy + (gh / 5) * i);
    ctx.stroke();
  }
  ctx.strokeStyle = "#e9a07f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let e = 0; e <= 30; e++) {
    const acc = 0.62 + (0.9762 - 0.62) * (1 - Math.exp(-e / 6));
    const x = gx + (gw / 30) * e, y = gy + gh - ((acc - 0.5) / 0.5) * gh;
    if (e) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.stroke();
  [["Accuracy", "97.62%"], ["F1", "0.9762"], ["ROC-AUC", "0.9936"]].forEach(([k, v], i) => {
    const x = 40 + i * 260;
    rr(ctx, x, 690, 240, 160, 14, "#1e2026");
    ctx.fillStyle = "#8e8a82";
    ctx.font = `500 20px ${mono}`;
    ctx.fillText(k.toUpperCase(), x + 22, 730);
    ctx.fillStyle = i === 0 ? "#e9a07f" : "#e9e5dd";
    ctx.font = `700 48px ${sans}`;
    ctx.fillText(v, x + 22, 800);
  });
  // Jendela browser dengan halaman blokir ekstensi
  rr(ctx, 860, 110, 700, 760, 16, "#fbf7f1");
  rr(ctx, 860, 110, 700, 64, 16, "#ece6dc");
  rr(ctx, 890, 128, 640, 30, 15, "#ffffff");
  ctx.fillStyle = "#8c8478";
  ctx.font = `500 18px ${sans}`;
  ctx.fillText("https://  ·····  (blocked by extension)", 908, 149);
  ctx.fillStyle = P.terracotta;
  ctx.beginPath();
  ctx.arc(1210, 360, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fbf7f1";
  ctx.fillRect(1160, 348, 100, 24);
  ctx.textAlign = "center";
  ctx.fillStyle = P.ink;
  ctx.font = `72px ${serif}`;
  ctx.fillText("Site blocked", 1210, 560);
  ctx.fillStyle = P.inkSoft;
  ctx.font = `400 26px ${sans}`;
  ctx.fillText("This page looks like an online gambling site.", 1210, 615);
  ctx.fillStyle = P.terracottaDark;
  ctx.font = `600 22px ${mono}`;
  ctx.fillText("CONFIDENCE 0.99 · BiLSTM + attention", 1210, 690);
  ctx.textAlign = "left";
  return tex(c);
}

/** Penanda tempel kecil (sticky flag) berisi satu kata, dipakai sebagai link yang bisa diklik. */
export function stickyFlag(label: string, color: string, hand: string) {
  const W = 640, H = 200;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0, 0, 70, H);
  ctx.fillStyle = INK;
  ctx.font = `700 92px ${hand}`;
  ctx.fillText(`${label} →`, 100, 132);
  return tex(c);
}

/** Pegboard putih bermatriks lubang (diulang). Satu tile = 8×8 lubang. */
export function pegboardTexture() {
  const S = 512, n = 8, step = S / n;
  const { c, ctx } = canvas(S, S);
  ctx.fillStyle = "#f1ede6";
  ctx.fillRect(0, 0, S, S);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const cx = x * step + step / 2, cy = y * step + step / 2;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(cx + 1.5, cy + 1.5, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2b2622";
      ctx.beginPath();
      ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
      ctx.fill();
    }
  return tex(c, true);
}

/* ───────── Post-it beragam gaya ───────── */

export type NoteStyle = {
  hand: "caveat" | "marker" | "kalam" | "patrick" | "shadows" | "gochi";
  ink?: string;
  paper?: "plain" | "lined" | "grid" | "dots";
  deco?: "underline" | "circle" | "highlight" | "box" | "none";
  bullets?: "dash" | "check" | "dot" | "arrow" | "none";
  doodle?: "star" | "arrow" | "smile" | "none";
};
export type HandFamilies = Record<NoteStyle["hand"], string>;

/** Faktor ukuran tiap font agar terlihat setara (font spidol lebih lebar). */
const HAND_SCALE: Record<NoteStyle["hand"], number> = { caveat: 1, marker: 0.74, kalam: 0.8, patrick: 0.94, shadows: 0.9, gochi: 0.92 };
const HAND_WEIGHT: Record<NoteStyle["hand"], string> = { caveat: "700", marker: "400", kalam: "700", patrick: "400", shadows: "400", gochi: "400" };

export const INKS = { marker: "#1d2333", blue: "#21409a", red: "#a4271c", green: "#2c5f3a" };

export function postIt(note: Note, hands: HandFamilies, style: NoteStyle, w = 768, h = 768) {
  const { c, ctx } = canvas(w, h);
  const base = note.color ?? "#F6DD7A";
  const r = rng(note.title.length * 97 + note.lines.length * 13 + style.hand.length);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  // Pola kertas
  ctx.strokeStyle = "rgba(40,60,90,0.16)";
  ctx.fillStyle = "rgba(40,60,90,0.2)";
  ctx.lineWidth = 2;
  if (style.paper === "lined") for (let y = h * 0.3; y < h; y += h * 0.085) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  if (style.paper === "grid") {
    for (let y = 0; y < h; y += h * 0.06) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    for (let x = 0; x < w; x += w * 0.06) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  }
  if (style.paper === "dots") for (let y = h * 0.05; y < h; y += h * 0.06) for (let x = w * 0.05; x < w; x += w * 0.06) { ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill(); }
  // Bayangan perekat & lengkung
  const top = ctx.createLinearGradient(0, 0, 0, h * 0.16);
  top.addColorStop(0, "rgba(0,0,0,0.08)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, h * 0.16);
  const bot = ctx.createLinearGradient(w, h, w * 0.6, h * 0.6);
  bot.addColorStop(0, "rgba(0,0,0,0.12)");
  bot.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bot;
  ctx.fillRect(0, 0, w, h);

  const fam = hands[style.hand];
  const k = HAND_SCALE[style.hand];
  const wt = HAND_WEIGHT[style.hand];
  const ink = style.ink ?? INKS.marker;
  const pad = w * 0.085;
  const fit = (s: string, size: number, maxW: number) => {
    ctx.font = `${wt} ${size}px ${fam}`;
    const m = ctx.measureText(s).width;
    return m > maxW ? (size * maxW) / m : size;
  };
  const bigTitle = note.title.length <= 6 && !note.facts;

  // Judul + dekorasi
  const size = fit(note.title, (bigTitle ? 0.3 : 0.14) * w * k, w - pad * 2);
  let y = bigTitle ? h * 0.42 : h * 0.2;
  ctx.font = `${wt} ${size}px ${fam}`;
  const tw = ctx.measureText(note.title).width;
  if (style.deco === "highlight") {
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.roundRect(pad - 10, y - size * 0.62, tw + 20, size * 0.62, 10);
    ctx.fill();
  }
  ctx.fillStyle = ink;
  ctx.fillText(note.title, pad, y);
  ctx.strokeStyle = P.terracotta;
  ctx.lineWidth = w * 0.009;
  ctx.lineCap = "round";
  if (style.deco === "underline") {
    ctx.beginPath();
    ctx.moveTo(pad, y + h * 0.028);
    ctx.bezierCurveTo(pad + tw * 0.3, y + h * 0.012, pad + tw * 0.7, y + h * 0.045, pad + tw, y + h * 0.02);
    ctx.stroke();
  } else if (style.deco === "circle") {
    ctx.beginPath();
    ctx.ellipse(pad + tw / 2, y - size * 0.3, tw / 2 + 26, size * 0.55, -0.04, 0.2, Math.PI * 2.1);
    ctx.stroke();
  } else if (style.deco === "box") {
    ctx.strokeStyle = ink;
    ctx.lineWidth = w * 0.006;
    ctx.strokeRect(pad - 14, y - size * 0.82, tw + 28, size * 1.02);
  }

  // Baris
  y += bigTitle ? h * 0.14 : h * 0.13;
  const lineSize = (bigTitle ? 0.1 : 0.078) * w * k;
  const lineGap = bigTitle ? h * 0.115 : h * 0.097;
  const bullet = style.bullets ?? "none";
  const indent = bullet === "none" ? 0 : w * 0.06;
  for (const l of note.lines) {
    const s = fit(l, lineSize, w - pad * 2 - indent);
    ctx.font = `${wt} ${s}px ${fam}`;
    ctx.fillStyle = ink;
    if (bullet === "dash") ctx.fillText("–", pad, y);
    if (bullet === "dot") {
      ctx.beginPath();
      ctx.arc(pad + 10, y - s * 0.3, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    if (bullet === "arrow") ctx.fillText("→", pad - 4, y);
    if (bullet === "check") {
      ctx.strokeStyle = ink;
      ctx.lineWidth = 4;
      ctx.strokeRect(pad, y - s * 0.62, s * 0.55, s * 0.55);
      ctx.strokeStyle = P.terracotta;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(pad + 4, y - s * 0.38);
      ctx.lineTo(pad + s * 0.22, y - s * 0.12);
      ctx.lineTo(pad + s * 0.7, y - s * 0.8);
      ctx.stroke();
    }
    ctx.fillText(l, pad + indent, y);
    y += lineGap;
  }

  // Angka
  if (note.facts?.length) {
    const colW = (w - pad * 2) / note.facts.length;
    const fy = h - h * 0.17;
    note.facts.forEach((f, i) => {
      ctx.fillStyle = style.ink === INKS.blue ? INKS.red : P.terracottaDark;
      const fs = fit(f.v, w * 0.13 * k, colW - 12);
      ctx.font = `${wt} ${fs}px ${fam}`;
      ctx.fillText(f.v, pad + i * colW, fy);
      ctx.fillStyle = ink;
      const ks = fit(f.k, w * 0.056 * k, colW - 12);
      ctx.font = `${wt} ${ks}px ${fam}`;
      ctx.fillText(f.k, pad + i * colW, fy + h * 0.072);
    });
  }

  // Doodle kecil di sudut
  ctx.strokeStyle = style.doodle === "star" ? P.terracotta : ink;
  ctx.lineWidth = 5;
  const dx = w - pad - 40, dy = h * 0.12;
  if (style.doodle === "star") {
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr2 = i % 2 ? 14 : 34;
      ctx.lineTo(dx + Math.cos(a) * rr2, dy + Math.sin(a) * rr2);
    }
    ctx.stroke();
  } else if (style.doodle === "arrow") {
    ctx.beginPath();
    ctx.moveTo(dx - 40, dy + 30);
    ctx.quadraticCurveTo(dx, dy - 10, dx + 20, dy + 26);
    ctx.lineTo(dx + 2, dy + 18);
    ctx.moveTo(dx + 20, dy + 26);
    ctx.lineTo(dx + 26, dy + 6);
    ctx.stroke();
  } else if (style.doodle === "smile") {
    ctx.beginPath();
    ctx.arc(dx, dy + 6, 28, 0, Math.PI * 2);
    ctx.moveTo(dx - 14, dy + 14);
    ctx.quadraticCurveTo(dx, dy + 28, dx + 14, dy + 14);
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.fillRect(dx - 11, dy - 4, 5, 8);
    ctx.fillRect(dx + 7, dy - 4, 5, 8);
  }
  void r;
  return tex(c);
}

/**
 * Kertas hero di atas cutting mat: hanya kata "Portfolio" / "Portofolio", tipografi editorial.
 * "Port(o)" tegak tinta hitam + "folio" miring terakota (Instrument Serif), dibingkai garis tipis ganda
 * dan tanda potong di sudut seperti lembar cetak coba.
 */
export function heroPaper(word: string, serif: string) {
  const W = 1600, H = 1100;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = P.paper;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 7000; i++) {
    ctx.fillStyle = `rgba(80,60,40,${Math.random() * 0.035})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  // Bingkai garis ganda + tanda potong
  ctx.strokeStyle = "rgba(30,27,24,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(110, 110, W - 220, H - 220);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(128, 128, W - 256, H - 256);
  ctx.strokeStyle = "rgba(30,27,24,0.4)";
  for (const [x, y] of [[110, 110], [W - 110, 110], [110, H - 110], [W - 110, H - 110]]) {
    const sx = x < W / 2 ? -1 : 1, sy = y < H / 2 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(x + sx * 20, y);
    ctx.lineTo(x + sx * 70, y);
    ctx.moveTo(x, y + sy * 20);
    ctx.lineTo(x, y + sy * 70);
    ctx.stroke();
  }
  // Kata utama: bagian depan tegak, "folio" miring terakota, dipaskan ke lebar bingkai.
  const cut = word.toLowerCase().lastIndexOf("folio");
  const head = cut > 0 ? word.slice(0, cut) : word;
  const tail = cut > 0 ? word.slice(cut) : "";
  let size = 330;
  const measure = () => {
    ctx.font = `${size}px ${serif}`;
    const a = ctx.measureText(head).width;
    ctx.font = `italic ${size}px ${serif}`;
    return a + ctx.measureText(tail).width;
  };
  while (measure() > W - 420 && size > 120) size -= 6;
  const total = measure();
  ctx.font = `${size}px ${serif}`;
  const headW = ctx.measureText(head).width;
  const x0 = (W - total) / 2, base = H / 2 + size * 0.3;
  ctx.textAlign = "left";
  ctx.fillStyle = P.ink;
  ctx.fillText(head, x0, base);
  ctx.font = `italic ${size}px ${serif}`;
  ctx.fillStyle = P.terracotta;
  ctx.fillText(tail, x0 + headW, base);
  // Garis tipis di bawah kata + titik aksen
  ctx.fillStyle = P.ink;
  ctx.fillRect(W / 2 - 90, base + 70, 180, 2);
  ctx.fillStyle = P.terracotta;
  ctx.beginPath();
  ctx.arc(W / 2, base + 71, 7, 0, Math.PI * 2);
  ctx.fill();
  return tex(c);
}
