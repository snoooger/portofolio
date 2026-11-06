"use client";

// Layar profil bergaya Instagram (mode terang) untuk iPhone di perhentian About: status bar, nama
// akun, foto profil bercincin story, angka (proyek/posisi/sertifikat — bukan follower palsu), bio
// ringkasan diri, tombol, sorotan story, tab, dan grid postingan berisi proyek. Satuan desain = point
// iPhone 15 Pro Max (430 pt lebar) dikali skala kanvas.
import * as THREE from "three";
import type { Fonts } from "../final/useFonts";

export const IG_W = 720;
export const IG_H = 1534;
const u = IG_W / 430;
const PT_H = IG_H / u;

export type IgCopy = {
  handle: string;
  name: string;
  category: string;
  bio: string[];
  link: string;
  stats: { v: string; k: string }[];
  buttons: [string, string, string];
  highlights: string[];
  posts: { title: string; sub: string; bg: string; fg: string }[];
};

export type IgImages = { avatar: HTMLImageElement; sonar: HTMLImageElement; prompted: HTMLImageElement };

const INK = "#000", MUTED = "#737373", LINE = "#dbdbdb", BLUE = "#0095f6";

export function loadIgImages(): Promise<IgImages> {
  const load = (src: string) =>
    new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.decoding = "async";
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    });
  return Promise.all([load("/assets-3d/profile.webp"), load("/assets-3d/sites/ig-sonar.webp"), load("/assets-3d/sites/ig-prompted.webp")]).then(
    ([avatar, sonar, prompted]) => ({ avatar, sonar, prompted }),
  );
}

export function instagramProfile(f: Fonts, t: IgCopy, img: IgImages) {
  const c = document.createElement("canvas");
  c.width = IG_W;
  c.height = IG_H;
  const ctx = c.getContext("2d")!;
  ctx.scale(u, u);
  const font = (w: number, s: number) => `${w} ${s}px ${f.sans}`;
  const text = (s: string, x: number, y: number, w: number, size: number, color = INK, align: CanvasTextAlign = "left") => {
    ctx.font = font(w, size);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(s, x, y);
    ctx.textAlign = "left";
  };
  const line = (lw = 2, color = INK) => {
    ctx.lineWidth = lw;
    ctx.strokeStyle = color;
    ctx.lineCap = ctx.lineJoin = "round";
  };

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 430, PT_H);

  // Status bar + dynamic island
  text("9:41", 52, 37, 600, 17, INK, "center");
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(215 - 63, 11, 126, 37, 19);
  ctx.fill();
  [5, 7.5, 10, 12.5].forEach((h, i) => {
    ctx.beginPath();
    ctx.roundRect(326 + i * 5, 38 - h, 3.2, h, 1);
    ctx.fill();
  });
  line(1.8);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(358, 39, 2.5 + i * 3.6, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
  }
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.roundRect(372, 28, 25, 12, 3.5);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.roundRect(374, 30, 21, 8, 2);
  ctx.fill();

  // Header: gembok kecil + username ˅, ikon + dan ≡
  let y = 84;
  line(1.8);
  ctx.beginPath();
  ctx.roundRect(16, y - 12, 10, 8, 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(21, y - 12, 3.3, Math.PI, 0);
  ctx.stroke();
  text(t.handle, 32, y, 700, 22);
  ctx.font = font(700, 22);
  const hw = ctx.measureText(t.handle).width;
  ctx.beginPath();
  ctx.moveTo(40 + hw, y - 9);
  ctx.lineTo(45 + hw, y - 4);
  ctx.lineTo(50 + hw, y - 9);
  ctx.stroke();
  line(2);
  ctx.beginPath();
  ctx.roundRect(352, y - 20, 22, 22, 6);
  ctx.moveTo(363, y - 14);
  ctx.lineTo(363, y - 4);
  ctx.moveTo(358, y - 9);
  ctx.lineTo(368, y - 9);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(392, y - 17 + i * 7);
    ctx.lineTo(412, y - 17 + i * 7);
    ctx.stroke();
  }

  // Foto profil bercincin story (gradasi kuning → oranye → merah muda → ungu)
  const ax = 16 + 46, ay = 160, ar = 43;
  const ring = ctx.createLinearGradient(ax - ar, ay + ar, ax + ar, ay - ar);
  ring.addColorStop(0, "#feda75");
  ring.addColorStop(0.3, "#fa7e1e");
  ring.addColorStop(0.6, "#d62976");
  ring.addColorStop(1, "#962fbf");
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(ax, ay, ar + 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(ax, ay, ar + 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(ax, ay, ar - 2.5, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img.avatar, ax - ar + 2.5, ay - ar + 2.5, (ar - 2.5) * 2, (ar - 2.5) * 2);
  ctx.restore();

  // Nama + angka
  text(t.name, 124, 136, 600, 15);
  t.stats.forEach((s, i) => {
    const x = 124 + i * 98;
    text(s.v, x, 168, 700, 17);
    text(s.k, x, 186, 400, 13.5);
  });

  // Bio
  y = 232;
  text(t.category, 16, y, 400, 13.5, MUTED);
  y += 20;
  for (const l of t.bio) {
    text(l, 16, y, 400, 14);
    y += 19;
  }
  // tautan
  line(1.6, "#00376b");
  ctx.beginPath();
  ctx.moveTo(18, y - 5);
  ctx.lineTo(26, y - 13);
  ctx.moveTo(21, y - 13);
  ctx.lineTo(26, y - 13);
  ctx.lineTo(26, y - 8);
  ctx.stroke();
  text(t.link, 32, y, 600, 14, "#00376b");

  // Tombol
  y += 18;
  const bw = (430 - 32 - 8 * 2 - 34) / 2;
  const btn = (x: number, w: number, label: string, fill: string, color: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x, y, w, 33, 8);
    ctx.fill();
    text(label, x + w / 2, y + 21.5, 600, 14, color, "center");
  };
  btn(16, bw, t.buttons[0], BLUE, "#fff");
  btn(16 + bw + 8, bw, t.buttons[1], "#efefef", INK);
  ctx.fillStyle = "#efefef";
  ctx.beginPath();
  ctx.roundRect(16 + bw * 2 + 16, y, 34, 33, 8);
  ctx.fill();
  // ikon tambah orang
  line(1.7);
  const px = 16 + bw * 2 + 16 + 15, py = y + 16;
  ctx.beginPath();
  ctx.arc(px - 1, py - 4, 4, 0, Math.PI * 2);
  ctx.moveTo(px - 8, py + 8);
  ctx.quadraticCurveTo(px - 1, py - 2, px + 6, py + 8);
  ctx.moveTo(px + 8, py - 5);
  ctx.lineTo(px + 8, py + 1);
  ctx.moveTo(px + 5, py - 2);
  ctx.lineTo(px + 11, py - 2);
  ctx.stroke();

  // Sorotan story
  y += 58;
  const hl = [
    ["#fde9c4", "#c2552f"],
    ["#e1ecf7", "#21409a"],
    ["#fbe1dc", "#a4271c"],
    ["#e4efdb", "#2c5f3a"],
    ["#efe6fa", "#6a48f0"],
  ];
  t.highlights.forEach((label, i) => {
    const cx = 16 + 32 + i * 80, cy = y + 32;
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = hl[i % hl.length][0];
    ctx.beginPath();
    ctx.arc(cx, cy, 28.5, 0, Math.PI * 2);
    ctx.fill();
    text(label.slice(0, 2).toUpperCase(), cx, cy + 7, 800, 19, hl[i % hl.length][1], "center");
    text(label, cx, cy + 50, 400, 12, INK, "center");
  });

  // Tab: grid, reels, tagged
  y += 104;
  ctx.fillStyle = LINE;
  ctx.fillRect(0, y + 44, 430, 0.8);
  ctx.fillStyle = INK;
  ctx.fillRect(0, y + 43, 143, 1.6);
  line(1.8);
  // grid
  ctx.beginPath();
  ctx.roundRect(60, y + 12, 22, 22, 3);
  ctx.moveTo(67.3, y + 12);
  ctx.lineTo(67.3, y + 34);
  ctx.moveTo(74.6, y + 12);
  ctx.lineTo(74.6, y + 34);
  ctx.moveTo(60, y + 19.3);
  ctx.lineTo(82, y + 19.3);
  ctx.moveTo(60, y + 26.6);
  ctx.lineTo(82, y + 26.6);
  ctx.stroke();
  line(1.8, MUTED);
  // reels
  ctx.beginPath();
  ctx.roundRect(204, y + 12, 22, 22, 5);
  ctx.moveTo(204, y + 18);
  ctx.lineTo(226, y + 18);
  ctx.moveTo(210, y + 12);
  ctx.lineTo(213, y + 18);
  ctx.moveTo(217, y + 12);
  ctx.lineTo(220, y + 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(212, y + 22);
  ctx.lineTo(219, y + 26);
  ctx.lineTo(212, y + 30);
  ctx.closePath();
  ctx.stroke();
  // tagged
  ctx.beginPath();
  ctx.roundRect(348, y + 12, 22, 22, 4);
  ctx.moveTo(352, y + 34);
  ctx.quadraticCurveTo(359, y + 23, 366, y + 34);
  ctx.moveTo(363, y + 20);
  ctx.arc(359, y + 20, 4, 0, Math.PI * 2);
  ctx.stroke();

  // Grid postingan: proyek nyata
  const gy = y + 45;
  const cell = (430 - 2) / 3;
  const tiles = t.posts;
  tiles.forEach((p, i) => {
    const x = (i % 3) * (cell + 1), yy = gy + Math.floor(i / 3) * (cell * 1.333 + 1);
    const h = cell * 1.333;
    if (yy > PT_H) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, yy, cell, h);
    ctx.clip();
    if (i === 0 || i === 1) {
      const im = i === 0 ? img.sonar : img.prompted;
      const s = h / im.height;
      ctx.drawImage(im, x + cell / 2 - (im.width * s) / 2, yy, im.width * s, h);
      ctx.fillStyle = "rgba(0,0,0,0.0)";
    } else {
      ctx.fillStyle = p.bg;
      ctx.fillRect(x, yy, cell, h);
      // pola halus
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = p.fg;
      for (let k = 0; k < 6; k++) {
        ctx.beginPath();
        ctx.arc(x + cell * (0.15 + ((k * 37) % 70) / 100), yy + h * (0.12 + ((k * 53) % 80) / 100), 10 + ((k * 13) % 22), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      text(p.title, x + 12, yy + h - 34, 800, 17, p.fg);
      text(p.sub, x + 12, yy + h - 15, 500, 11.5, p.fg);
    }
    ctx.restore();
    // ikon multi-foto (pojok kanan atas)
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.roundRect(x + cell - 22, yy + 8, 13, 13, 2.5);
    ctx.fill();
  });

  // Bilah navigasi bawah + home indicator
  const ny = PT_H - 84;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, ny, 430, 84);
  ctx.fillStyle = LINE;
  ctx.fillRect(0, ny, 430, 0.6);
  line(2);
  const nav = [43, 129, 215, 301, 387];
  // home
  ctx.beginPath();
  ctx.moveTo(nav[0] - 11, ny + 32);
  ctx.lineTo(nav[0], ny + 20);
  ctx.lineTo(nav[0] + 11, ny + 32);
  ctx.lineTo(nav[0] + 11, ny + 44);
  ctx.lineTo(nav[0] - 11, ny + 44);
  ctx.closePath();
  ctx.stroke();
  // search
  ctx.beginPath();
  ctx.arc(nav[1] - 2, ny + 30, 9, 0, Math.PI * 2);
  ctx.moveTo(nav[1] + 5, ny + 37);
  ctx.lineTo(nav[1] + 11, ny + 43);
  ctx.stroke();
  // reels
  ctx.beginPath();
  ctx.roundRect(nav[2] - 11, ny + 21, 22, 22, 5);
  ctx.moveTo(nav[2] - 11, ny + 27);
  ctx.lineTo(nav[2] + 11, ny + 27);
  ctx.stroke();
  // pesan (pesawat kertas)
  ctx.beginPath();
  ctx.moveTo(nav[3] - 11, ny + 23);
  ctx.lineTo(nav[3] + 11, ny + 23);
  ctx.lineTo(nav[3] + 1, ny + 44);
  ctx.lineTo(nav[3] - 2, ny + 32);
  ctx.closePath();
  ctx.moveTo(nav[3] - 2, ny + 32);
  ctx.lineTo(nav[3] + 11, ny + 23);
  ctx.stroke();
  // profil (aktif)
  ctx.save();
  ctx.beginPath();
  ctx.arc(nav[4], ny + 32, 12, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img.avatar, nav[4] - 12, ny + 20, 24, 24);
  ctx.restore();
  line(1.6);
  ctx.beginPath();
  ctx.arc(nav[4], ny + 32, 13.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.roundRect(215 - 70, PT_H - 13, 140, 5, 2.5);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
