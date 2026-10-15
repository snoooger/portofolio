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
    // Logo Kerja Web3: lencana hijau + kubus kecil (titik kubus di logonya) — krayon
    scribble(ctx, [[x + 8, y + 4], [x + 112, y + 4], [x + 112, y + 104], [x + 8, y + 104]], "#18a34a", 6, true, 1);
    hatch(ctx, x + 12, y + 8, 96, 92, "#22c55e", 1);
    const cx = x + 60, cy = y + 54, k = 26;
    scribble(ctx, [[cx, cy - k], [cx + k, cy - k / 2], [cx + k, cy + k / 2], [cx, cy + k], [cx - k, cy + k / 2], [cx - k, cy - k / 2]], "#fbfaf6", 6, true, 2);
    scribble(ctx, [[cx - k, cy - k / 2], [cx, cy], [cx + k, cy - k / 2]], "#fbfaf6", 5, false, 3);
    scribble(ctx, [[cx, cy], [cx, cy + k]], "#fbfaf6", 5, false, 4);
  } else if (o.includes("timedoor")) {
    // Logo Timedoor Academy: lencana hijau, bingkai pintu putih, titik & garis orbit — krayon
    scribble(ctx, [[x + 8, y + 4], [x + 112, y + 4], [x + 112, y + 104], [x + 8, y + 104]], "#2fa012", 6, true, 2);
    hatch(ctx, x + 12, y + 8, 96, 92, "#4cc21f", 2);
    scribble(ctx, [[x + 34, y + 18], [x + 84, y + 18], [x + 84, y + 92], [x + 34, y + 92]], "#fbfaf6", 7, false, 3);
    scribble(ctx, [[x + 34, y + 18], [x + 34, y + 42]], "#fbfaf6", 6, false, 4);
    scribble(ctx, circlePts(x + 52, y + 50, 4, 4, 8), "#fbfaf6", 6, false, 5);
    scribble(ctx, Array.from({ length: 12 }, (_, i) => {
      const a = Math.PI * (0.95 + (i / 11) * 1.1);
      return [x + 60 + Math.cos(a) * 46, y + 62 + Math.sin(a) * 12 - (i / 11) * 18] as [number, number];
    }), "#fbfaf6", 5, false, 6);
  } else if (o.includes("pupr")) {
    // Logo Kementerian PUPR: kotak kuning, bentuk navy dengan tiga lengkung kuning — krayon
    const s4 = 104 / 400; // koordinat logo asli 400×400 → 104 px
    const X = (v: number) => x + 8 + v * s4, Y = (v: number) => y + v * s4;
    scribble(ctx, [[X(0), Y(0)], [X(400), Y(0)], [X(400), Y(400)], [X(0), Y(400)]], "#e8b21a", 6, true, 3);
    hatch(ctx, X(4), Y(4), 396 * s4, 392 * s4, "#f7c52a", 3);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X(85), Y(28));
    ctx.lineTo(X(215), Y(28));
    ctx.lineTo(X(215), Y(262));
    ctx.lineTo(X(375), Y(262));
    ctx.lineTo(X(375), Y(370));
    ctx.lineTo(X(25), Y(370));
    ctx.lineTo(X(25), Y(255));
    ctx.lineTo(X(85), Y(255));
    ctx.closePath();
    ctx.clip();
    for (let i = 0; i < 3; i++) hatch(ctx, X(20), Y(24 + i * 4), 360 * s4, 350 * s4, "#2f4580", 10 + i);
    // lengkung kuning yang "menggigit" bentuk navy
    for (const [cx, cy, r] of [[85, 150, 68], [130, 372, 86], [295, 262, 80]]) {
      ctx.beginPath();
      ctx.arc(X(cx), Y(cy), r * s4, 0, Math.PI * 2);
      ctx.fillStyle = "#f7c52a";
      ctx.fill();
    }
    ctx.restore();
    scribble(ctx, [[X(85), Y(28)], [X(215), Y(28)], [X(215), Y(262)]], "#2f4580", 4, false, 20);
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

/**
 * Post-it statistik FarmAgent, digambar seperti coretan: grafik batang naik + panah (views),
 * kepala-kepala kecil (followers), dan catatan 12 niche × 6 platform. Angka dari pemilik portofolio.
 */
export function statsNote(t: { title: string; views: string; viewsLabel: string; followers: string; followersLabel: string; scope: string }, hands: HandFamilies, w = 768, h = 768) {
  const { c, ctx } = canvas(w, h);
  ctx.fillStyle = "#C9DDB0";
  ctx.fillRect(0, 0, w, h);
  const sh = ctx.createLinearGradient(0, 0, 0, 120);
  sh.addColorStop(0, "rgba(0,0,0,0.07)");
  sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sh;
  ctx.fillRect(0, 0, w, 120);
  // kertas bertitik
  ctx.fillStyle = "rgba(29,35,51,0.12)";
  for (let y = 40; y < h; y += 44) for (let x = 40; x < w; x += 44) ctx.fillRect(x, y, 4, 4);
  const ink = "#1d2333";
  const font = (px: number) => `400 ${px}px ${hands.marker}`;

  ctx.fillStyle = ink;
  ctx.font = font(64);
  ctx.fillText(t.title, 54, 104);
  scribble(ctx, [[54, 126], [140, 120], [260, 128], [360, 121]], "#a4271c", 7, false, 1);

  // Grafik batang naik + panah (views)
  const bx = 60, by = 410;
  [70, 120, 185, 265].forEach((bh, i) => {
    const x = bx + i * 58;
    scribble(ctx, [[x, by], [x, by - bh], [x + 40, by - bh], [x + 40, by]], ink, 6, false, 10 + i);
    hatch(ctx, x + 4, by - bh + 6, 32, bh - 8, "#21409a", 10 + i);
  });
  scribble(ctx, [[bx - 10, by + 8], [bx + 250, by + 8]], ink, 6, false, 20);
  scribble(ctx, [[bx + 10, by - 100], [bx + 90, by - 150], [bx + 150, by - 180], [bx + 230, by - 262]], "#a4271c", 7, false, 21);
  scribble(ctx, [[bx + 196, by - 258], [bx + 232, by - 264], [bx + 226, by - 228]], "#a4271c", 7, false, 22);
  /** Label kecil yang membungkus ke baris berikutnya bila melewati tepi kanan post-it. */
  const label = (text: string, x: number, y: number) => {
    ctx.font = font(38);
    let line = "";
    for (const word of text.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > w - x - 36 && line) {
        ctx.fillText(line, x, y);
        y += 44;
        line = word;
      } else line = next;
    }
    ctx.fillText(line, x, y);
  };
  ctx.fillStyle = ink;
  ctx.font = font(104);
  ctx.fillText(t.views, 350, 300);
  label(t.viewsLabel, 356, 350);

  // Kepala-kepala kecil (followers)
  const fy = 520;
  for (let i = 0; i < 4; i++) {
    const x = 74 + i * 52;
    scribble(ctx, circlePts(x, fy, 17, 17, 14), ink, 5, false, 30 + i);
    scribble(ctx, Array.from({ length: 9 }, (_, k) => [x - 26 + (k / 8) * 52, fy + 58 - Math.sin((k / 8) * Math.PI) * 30] as [number, number]), ink, 5, false, 40 + i);
  }
  ctx.font = font(84);
  ctx.fillText(t.followers, 330, 556);
  label(t.followersLabel, 336, 602);

  // Lingkup: 12 niche × 6 platform
  ctx.font = font(40);
  ctx.fillStyle = "#2c5f3a";
  ctx.fillText(t.scope, 54, 712);
  scribble(ctx, [[46, 726], [w - 70, 722]], "#2c5f3a", 4, false, 50);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
