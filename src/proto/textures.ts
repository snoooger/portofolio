"use client";

// Tekstur yang digambar dengan canvas: tidak ada file gambar, semua dari kode.
import * as THREE from "three";
import { P } from "./palette";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return { c, ctx };
}

function tex(c: HTMLCanvasElement, repeat = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
  }
  return t;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

/** Cutting mat terakota dengan grid ukur, angka tepi, dan garis sudut. */
/** Cutting mat bergaris; `color` = warna dasar (default terakota; meja final memakai hijau klasik). */
export function matTexture(color: string = P.terracotta) {
  const W = 2048, H = 1536;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  // butir halus
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  const step = 40, ox = 90, oy = 90;
  for (let x = ox, i = 0; x < W - 40; x += step, i++) {
    ctx.strokeStyle = i % 5 === 0 ? "rgba(251,247,241,0.55)" : "rgba(251,247,241,0.22)";
    ctx.lineWidth = i % 5 === 0 ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, H - 50); ctx.stroke();
    if (i % 5 === 0) {
      ctx.fillStyle = "rgba(251,247,241,0.7)";
      ctx.font = "22px monospace";
      ctx.fillText(String(i), x - 8, oy - 24);
    }
  }
  for (let y = oy, i = 0; y < H - 40; y += step, i++) {
    ctx.strokeStyle = i % 5 === 0 ? "rgba(251,247,241,0.55)" : "rgba(251,247,241,0.22)";
    ctx.lineWidth = i % 5 === 0 ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(W - 50, y); ctx.stroke();
    if (i % 5 === 0) {
      ctx.fillStyle = "rgba(251,247,241,0.7)";
      ctx.font = "22px monospace";
      ctx.fillText(String(i), oy - 60, y + 8);
    }
  }
  ctx.strokeStyle = "rgba(251,247,241,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + 1300, oy + 1300); ctx.stroke();
  ctx.beginPath(); ctx.arc(ox + 400, oy + 400, 320, 0, Math.PI * 2); ctx.stroke();
  return tex(c);
}

/** Meja kayu oak terang dengan serat sederhana. */
export function woodTexture() {
  const W = 1024, H = 1024;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = P.oak;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 140; i++) {
    const y = Math.random() * H;
    ctx.strokeStyle = `rgba(120,80,40,${0.04 + Math.random() * 0.07})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 6);
    ctx.stroke();
  }
  return tex(c, true);
}

/** Feed konten vertikal untuk layar ponsel (diulang & digeser untuk efek scroll). */
export function feedTexture() {
  const W = 256, H = 1024;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#121110";
  ctx.fillRect(0, 0, W, H);
  const colors = [P.terracotta, P.sand, P.sage, P.terracottaLight, P.sky, "#3a3530"];
  let y = 10;
  let k = 0;
  while (y < H) {
    const h = 150 + ((k * 37) % 90);
    ctx.fillStyle = colors[k % colors.length];
    rr(ctx, 14, y, W - 28, h, 14);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    rr(ctx, 14, y + h + 10, (W - 28) * 0.7, 10, 5);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    rr(ctx, 14, y + h + 28, (W - 28) * 0.45, 10, 5);
    y += h + 56;
    k++;
  }
  return tex(c, true);
}

/** Kartu website mini untuk PromptedSite (variasi warna per indeks). */
export function webCardTexture(i: number) {
  const W = 512, H = 640;
  const { c, ctx } = canvas(W, H);
  const themes = [
    [P.paper, P.terracotta, P.ink],
    [P.ink, P.terracottaLight, P.paper],
    [P.sand, P.ink, P.terracotta],
    ["#E7EDF0", P.sky, P.ink],
    [P.terracotta, P.paper, P.ink],
    ["#EEF0E8", P.sage, P.ink],
    [P.cream, P.terracottaDark, P.ink],
  ];
  const [bg, acc, fg] = themes[i % themes.length];
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = fg;
  rr(ctx, 28, 26, 90, 14, 7);
  for (let k = 0; k < 3; k++) rr(ctx, 300 + k * 64, 26, 46, 12, 6);
  ctx.fillStyle = acc;
  rr(ctx, 28, 80, W - 56, 250, 22);
  ctx.fillStyle = fg;
  rr(ctx, 28, 356, 330, 26, 10);
  rr(ctx, 28, 394, 230, 26, 10);
  ctx.globalAlpha = 0.6;
  for (let k = 0; k < 3; k++) rr(ctx, 28 + k * 156, 450, 140, 150, 16);
  ctx.globalAlpha = 1;
  return tex(c);
}

/** Lembar kertas berjudul (serif + satu kata tulisan tangan), dipakai di hero & penutup. */
export function paperTexture(
  serif: string,
  script: string,
  lines: [string, string],
  word: string,
  footer: string,
) {
  const W = 1600, H = 1100;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = P.paper;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 6000; i++) {
    ctx.fillStyle = `rgba(80,60,40,${Math.random() * 0.035})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  ctx.fillStyle = P.ink;
  ctx.textAlign = "center";
  ctx.font = `150px ${serif}`;
  ctx.fillText(lines[0], W / 2, 330);
  ctx.fillText(lines[1], W / 2, 500);
  ctx.fillStyle = P.terracotta;
  ctx.font = `700 240px ${script}`;
  ctx.fillText(word, W / 2, 760);
  // garis bawah coretan
  ctx.strokeStyle = P.terracotta;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 330, 815);
  ctx.bezierCurveTo(W / 2 - 100, 790, W / 2 + 120, 840, W / 2 + 340, 800);
  ctx.stroke();
  ctx.fillStyle = P.inkSoft;
  ctx.font = "32px monospace";
  ctx.fillText(footer, W / 2, 970);
  return tex(c);
}

/** Sticky note bertulisan tangan. */
export function noteTexture(lines: string[], bg: string, hand: string) {
  const W = 512, H = 512;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, 90);
  g.addColorStop(0, "rgba(0,0,0,0.08)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 90);
  ctx.fillStyle = P.ink;
  ctx.textAlign = "center";
  const size = lines.length > 2 ? 92 : 112;
  ctx.font = `700 ${size}px ${hand}`;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * size * 1.05 + size * 0.3));
  return tex(c);
}

/** Sapuan radar: gradien kerucut dari transparan ke terakota. */
export function sweepTexture() {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  const g = ctx.createConicGradient(0, S / 2, S / 2);
  g.addColorStop(0, "rgba(233,160,127,0.85)");
  g.addColorStop(0.16, "rgba(194,85,47,0.0)");
  g.addColorStop(1, "rgba(194,85,47,0.0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  ctx.fill();
  return tex(c);
}

/** Label kecil gaya stiker (dipakai di kota miniatur). */
export function labelTexture(text: string, sub: string, mono: string, serif: string) {
  const W = 640, H = 200;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = P.paper;
  rr(ctx, 6, 6, W - 12, H - 12, 28);
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(6, 6, W - 12, H - 12, 28);
  ctx.stroke();
  ctx.fillStyle = P.ink;
  ctx.font = `86px ${serif}`;
  ctx.fillText(text, 36, 112);
  ctx.fillStyle = P.terracotta;
  ctx.font = `500 26px ${mono}`;
  ctx.fillText(sub.toUpperCase(), 40, 162);
  return tex(c);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = w;
      y += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
}

/** Plakat museum: nomor, nama, kalimat singkat. */
export function placardTexture(no: string, title: string, line: string, serif: string, sans: string, mono: string, medium?: string) {
  const W = 900, H = 600;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = P.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.terracotta;
  ctx.font = `500 30px ${mono}`;
  ctx.fillText(no, 60, 90);
  ctx.fillStyle = P.ink;
  ctx.font = `96px ${serif}`;
  ctx.fillText(title, 56, 210);
  ctx.fillStyle = P.inkSoft;
  ctx.font = `34px ${sans}`;
  wrap(ctx, line, 60, 290, W - 120, 48);
  if (medium) {
    // Seperti label karya di museum: "Medium" = bahan yang dipakai.
    ctx.fillStyle = "rgba(30,27,24,0.12)";
    ctx.fillRect(60, H - 120, W - 120, 2);
    ctx.fillStyle = P.ink;
    ctx.font = `500 24px ${mono}`;
    ctx.fillText("MEDIUM", 60, H - 76);
    ctx.fillStyle = P.inkSoft;
    ctx.font = `30px ${sans}`;
    wrap(ctx, medium, 190, H - 76, W - 250, 36);
  }
  return tex(c);
}

/** Sertifikat berbingkai: judul, penerbit, tahun, stempel terakota. */
export function certTexture(title: string, issuer: string, year: string, serif: string, mono: string, heading = "CERTIFICATE") {
  const W = 800, H = 600;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#FDFBF6";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = P.sand;
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.textAlign = "center";
  ctx.fillStyle = P.inkSoft;
  ctx.font = `500 22px ${mono}`;
  ctx.fillText(heading, W / 2, 110);
  ctx.fillStyle = P.ink;
  ctx.font = `60px ${serif}`;
  wrap(ctx, title, W / 2, 210, W - 160, 66);
  ctx.fillStyle = P.inkSoft;
  ctx.font = `500 24px ${mono}`;
  ctx.fillText(`${issuer.toUpperCase()} · ${year}`, W / 2, 470);
  ctx.fillStyle = P.terracotta;
  ctx.beginPath();
  ctx.arc(W - 120, H - 120, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = P.paper;
  ctx.font = `700 22px ${mono}`;
  ctx.fillText("ZJA", W - 120, H - 112);
  return tex(c);
}

/** Teks besar di dinding (judul pintu masuk, dinding penutup). */
export function wallTextTexture(kicker: string, title: string, sub: string, serif: string, mono: string, hand: string) {
  const W = 2048, H = 600;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = P.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = P.terracotta;
  ctx.font = `500 36px ${mono}`;
  ctx.fillText(kicker, W / 2, 120);
  ctx.fillStyle = P.ink;
  ctx.font = `200px ${serif}`;
  ctx.fillText(title, W / 2, 330);
  ctx.fillStyle = P.terracotta;
  ctx.font = `700 90px ${hand}`;
  ctx.fillText(sub, W / 2, 480);
  return tex(c);
}

/** Kartu indeks bergaris berisi kalimat panjang (manifesto). */
export function indexCardTexture(kicker: string, text: string, sign: string, serif: string, mono: string, hand: string) {
  const W = 1200, H = 800;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#FDFBF6";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(169,194,207,0.55)";
  ctx.lineWidth = 2;
  for (let y = 190; y < H - 40; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(194,85,47,0.45)";
  ctx.beginPath();
  ctx.moveTo(110, 0);
  ctx.lineTo(110, H);
  ctx.stroke();
  ctx.fillStyle = P.terracotta;
  ctx.font = `500 28px ${mono}`;
  ctx.fillText(kicker, 150, 110);
  ctx.fillStyle = P.ink;
  ctx.font = `58px ${serif}`;
  wrap(ctx, text, 150, 240, W - 220, 64);
  ctx.fillStyle = P.terracotta;
  ctx.font = `700 64px ${hand}`;
  ctx.fillText(sign, W - 470, H - 50);
  return tex(c);
}

/** Papan nama kecil (maket museum, pintu keluar). */
export function signTexture(top: string, main: string, serif: string, mono: string, bg: string = P.ink, fg: string = P.paper) {
  const W = 1024, H = 256;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = P.terracottaLight;
  ctx.font = `500 34px ${mono}`;
  ctx.fillText(top, W / 2, 80);
  ctx.fillStyle = fg;
  ctx.font = `110px ${serif}`;
  ctx.fillText(main, W / 2, 200);
  return tex(c);
}

/** Panel dinding "Materials & techniques": tiga kolom daftar tools. */
export function materialsTexture(groups: { title: string; items: string[] }[], serif: string, sans: string, mono: string) {
  const W = 2400, H = 1200;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = P.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.terracotta;
  ctx.font = `500 34px ${mono}`;
  ctx.fillText("THE COLLECTION · MATERIALS & TECHNIQUES", 120, 140);
  ctx.fillStyle = P.ink;
  ctx.font = `150px ${serif}`;
  ctx.fillText("What these machines are made of", 110, 300);
  const colW = (W - 240) / groups.length;
  groups.forEach((g, i) => {
    const x = 120 + i * colW;
    ctx.fillStyle = P.terracotta;
    ctx.fillRect(x, 400, colW - 80, 4);
    ctx.fillStyle = P.ink;
    ctx.font = `64px ${serif}`;
    ctx.fillText(g.title, x, 490);
    ctx.fillStyle = P.inkSoft;
    ctx.font = `40px ${sans}`;
    g.items.forEach((it, k) => ctx.fillText(it, x, 570 + k * 54));
  });
  return tex(c);
}

/** Buku tamu terbuka: halaman kiri judul, halaman kanan kontak bertulisan tangan. */
export function guestbookTexture(serif: string, mono: string, hand: string, lines: string[]) {
  const W = 1600, H = 1000;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#FBF6EC";
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(W / 2 - 60, 0, W / 2 + 60, 0);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.5, "rgba(80,50,30,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(W / 2 - 60, 0, 120, H);
  ctx.fillStyle = P.terracotta;
  ctx.font = `500 30px ${mono}`;
  ctx.fillText("GUESTBOOK", 110, 170);
  ctx.fillStyle = P.ink;
  ctx.font = `110px ${serif}`;
  ctx.fillText("Commission", 100, 330);
  ctx.fillText("a machine.", 100, 450);
  ctx.fillStyle = P.inkSoft;
  ctx.font = `700 54px ${hand}`;
  ctx.fillText("tell me what should", 110, 600);
  ctx.fillText("run by itself.", 110, 665);
  ctx.strokeStyle = "rgba(169,194,207,0.6)";
  ctx.lineWidth = 2;
  for (let y = 240; y < H - 80; y += 90) {
    ctx.beginPath();
    ctx.moveTo(W / 2 + 90, y);
    ctx.lineTo(W - 100, y);
    ctx.stroke();
  }
  ctx.fillStyle = P.ink;
  ctx.font = `700 60px ${hand}`;
  lines.forEach((l, i) => ctx.fillText(l, W / 2 + 110, 225 + i * 180));
  return tex(c);
}

/** Halaman buku terbuka kosong bergaris (isi ditulis dengan teks 3D). */
export function bookPagesTexture() {
  const W = 1600, H = 1000;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#FBF6EC";
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(W / 2 - 60, 0, W / 2 + 60, 0);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.5, "rgba(80,50,30,0.2)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(W / 2 - 60, 0, 120, H);
  ctx.strokeStyle = "rgba(169,194,207,0.5)";
  ctx.lineWidth = 2;
  for (let y = 150; y < H - 60; y += 70) {
    for (const [a, b] of [[80, W / 2 - 80], [W / 2 + 80, W - 80]]) {
      ctx.beginPath();
      ctx.moveTo(a, y);
      ctx.lineTo(b, y);
      ctx.stroke();
    }
  }
  return tex(c);
}

/** Kertas bergaris tipis (brosur, buku jaga). */
export function plainPaperTexture(lines = false) {
  const W = 512, H = 512;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = P.paper;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = `rgba(80,60,40,${Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  if (lines) {
    ctx.strokeStyle = "rgba(169,194,207,0.6)";
    for (let y = 60; y < H; y += 34) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(W - 20, y);
      ctx.stroke();
    }
  }
  return tex(c);
}

/** Lantai papan kayu oak terang (diulang). */
export function plankTexture() {
  const W = 1024, H = 1024;
  const { c, ctx } = canvas(W, H);
  const rows = 8;
  const ph = H / rows;
  for (let r = 0; r < rows; r++) {
    let x = -((r * 337) % 600);
    while (x < W) {
      const len = 380 + ((r * 7 + x) % 5) * 90;
      const tone = 196 + ((r * 13 + Math.floor(x)) % 7) * 4;
      ctx.fillStyle = `rgb(${tone + 22},${tone + 2},${tone - 34})`;
      ctx.fillRect(x, r * ph, len, ph);
      for (let i = 0; i < 26; i++) {
        ctx.strokeStyle = `rgba(120,80,40,${0.04 + Math.random() * 0.06})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        const yy = r * ph + Math.random() * ph;
        ctx.beginPath();
        ctx.moveTo(x, yy);
        ctx.bezierCurveTo(x + len * 0.3, yy + (Math.random() - 0.5) * 8, x + len * 0.7, yy + (Math.random() - 0.5) * 8, x + len, yy);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(60,40,20,0.35)";
      ctx.fillRect(x, r * ph, 2, ph);
      x += len;
    }
    ctx.fillStyle = "rgba(60,40,20,0.3)";
    ctx.fillRect(0, r * ph, W, 2);
  }
  return tex(c, true);
}

/** Kartu nama di dudukan pintu keluar (footer). */
export function businessCardTexture(name: string, role: string, lines: string[], serif: string, sans: string, mono: string) {
  const W = 1050, H = 600;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#FDFBF6";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = P.terracotta;
  ctx.fillRect(0, 0, 18, H);
  ctx.fillStyle = P.ink;
  ctx.font = `76px ${serif}`;
  ctx.fillText(name, 80, 170);
  ctx.fillStyle = P.terracottaDark;
  ctx.font = `500 26px ${mono}`;
  ctx.fillText(role.toUpperCase(), 84, 222);
  ctx.fillStyle = P.inkSoft;
  ctx.font = `500 32px ${sans}`;
  lines.forEach((l, i) => ctx.fillText(l, 84, 360 + i * 56));
  return tex(c);
}
