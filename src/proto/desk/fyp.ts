"use client";

// Layar HP phone farm bergaya beranda "For You" aplikasi video pendek: video layar penuh, bilah
// "Following | For You", rel ikon kanan (avatar, suka, komentar, simpan, bagikan, piringan musik),
// username + caption + tagar + nama suara di kiri bawah, dan bilah navigasi bawah.
// Isi "video" digambar prosedural (tanpa gambar/logo pihak ketiga). Satu tekstur = 6 video bertumpuk
// vertikal; HP menggulir di antaranya lewat texture offset.
import * as THREE from "three";

const W = 360, H = 780, N = 6;

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Ctx = CanvasRenderingContext2D;
type Scene = (ctx: Ctx, y0: number, r: () => number) => void;

const grad = (ctx: Ctx, y0: number, stops: [number, string][], y1 = 0, y2 = H) => {
  const g = ctx.createLinearGradient(0, y0 + y1, 0, y0 + y2);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
};

// ── "Video" ────────────────────────────────────────────────────────────
const sunset: Scene = (ctx, y0, r) => {
  ctx.fillStyle = grad(ctx, y0, [[0, "#2b1d4a"], [0.35, "#c2456b"], [0.55, "#f39a4c"], [0.6, "#ffd27a"]], 0, 470);
  ctx.fillRect(0, y0, W, 470);
  const sun = ctx.createRadialGradient(180, y0 + 430, 10, 180, y0 + 430, 140);
  sun.addColorStop(0, "rgba(255,240,190,1)");
  sun.addColorStop(0.35, "rgba(255,200,120,0.8)");
  sun.addColorStop(1, "rgba(255,160,90,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, y0 + 280, W, 200);
  ctx.fillStyle = grad(ctx, y0, [[0, "#3b2f5c"], [1, "#0c1026"]], 470, H);
  ctx.fillRect(0, y0 + 470, W, H - 470);
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = `rgba(255,200,140,${0.15 + r() * 0.5})`;
    const w = 20 + r() * 90;
    ctx.fillRect(180 - w / 2 + (r() - 0.5) * 60, y0 + 478 + i * 9 + r() * 4, w, 2);
  }
  // Pohon kelapa siluet
  ctx.strokeStyle = "#140c1c";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(40, y0 + 560);
  ctx.quadraticCurveTo(70, y0 + 400, 52, y0 + 260);
  ctx.stroke();
  ctx.fillStyle = "#140c1c";
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI + (i / 6) * Math.PI * 1.1;
    ctx.beginPath();
    ctx.ellipse(52 + Math.cos(a) * 44, y0 + 262 + Math.sin(a) * 18, 52, 9, a, 0, Math.PI * 2);
    ctx.fill();
  }
};

const city: Scene = (ctx, y0, r) => {
  ctx.fillStyle = grad(ctx, y0, [[0, "#0b1030"], [0.6, "#2a1747"], [1, "#4b2050"]], 0, 520);
  ctx.fillRect(0, y0, W, H);
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(255,${150 + r() * 80},${120 + r() * 100},${0.08 + r() * 0.12})`;
    ctx.beginPath();
    ctx.arc(r() * W, y0 + 60 + r() * 250, 12 + r() * 30, 0, Math.PI * 2);
    ctx.fill();
  }
  let x = -10;
  while (x < W) {
    const w = 34 + r() * 46, h = 160 + r() * 300;
    ctx.fillStyle = r() > 0.5 ? "#0d0f22" : "#141631";
    ctx.fillRect(x, y0 + 600 - h, w, h);
    for (let wy = y0 + 600 - h + 10; wy < y0 + 590; wy += 13)
      for (let wx = x + 6; wx < x + w - 6; wx += 9) if (r() > 0.55) {
        ctx.fillStyle = r() > 0.2 ? "rgba(255,214,140,0.9)" : "rgba(140,200,255,0.9)";
        ctx.fillRect(wx, wy, 4, 6);
      }
    x += w + 3;
  }
  ctx.fillStyle = "#07070f";
  ctx.fillRect(0, y0 + 600, W, H - 600);
  for (let i = 0; i < 14; i++) {
    ctx.strokeStyle = i % 2 ? "rgba(255,70,60,0.8)" : "rgba(255,240,210,0.85)";
    ctx.lineWidth = 2 + r() * 2;
    ctx.beginPath();
    const yy = y0 + 625 + r() * 40;
    ctx.moveTo(r() * 60 - 40, yy);
    ctx.lineTo(W + 40, yy + (r() - 0.5) * 10);
    ctx.stroke();
  }
};

const noodles: Scene = (ctx, y0, r) => {
  ctx.fillStyle = grad(ctx, y0, [[0, "#6b4128"], [1, "#3e2516"]]);
  ctx.fillRect(0, y0, W, H);
  ctx.strokeStyle = "rgba(30,15,6,0.35)";
  for (let i = 0; i < 40; i++) {
    ctx.lineWidth = 1 + r() * 2;
    ctx.beginPath();
    const yy = y0 + r() * H;
    ctx.moveTo(0, yy);
    ctx.bezierCurveTo(120, yy + 8, 240, yy - 8, W, yy + 4);
    ctx.stroke();
  }
  const cx = 180, cy = y0 + 360;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(cx + 10, cy + 16, 150, 150, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f4efe6";
  ctx.beginPath();
  ctx.arc(cx, cy, 150, 0, Math.PI * 2);
  ctx.fill();
  const broth = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, 125);
  broth.addColorStop(0, "#f2a64a");
  broth.addColorStop(1, "#b5571d");
  ctx.fillStyle = broth;
  ctx.beginPath();
  ctx.arc(cx, cy, 125, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f7d983";
  ctx.lineWidth = 4;
  for (let i = 0; i < 22; i++) {
    ctx.beginPath();
    let px = cx - 90 + r() * 60, py = cy - 60 + r() * 120;
    ctx.moveTo(px, py);
    for (let s = 0; s < 6; s++) {
      px += 18 + r() * 8;
      py += (r() - 0.5) * 30;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  for (const [ex, ey] of [[cx + 40, cy - 40], [cx + 70, cy + 10]]) {
    ctx.fillStyle = "#fffaf0";
    ctx.beginPath();
    ctx.ellipse(ex, ey, 30, 22, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f1a524";
    ctx.beginPath();
    ctx.arc(ex + 2, ey, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#4f9a3c";
  for (let i = 0; i < 30; i++) ctx.fillRect(cx - 80 + r() * 150, cy - 90 + r() * 170, 7, 5);
  ctx.strokeStyle = "#2a1a10";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  for (const o of [0, 16]) {
    ctx.beginPath();
    ctx.moveTo(W + 10, y0 + 120 + o);
    ctx.lineTo(cx - 20, cy - 10 + o);
    ctx.stroke();
  }
};

const mountains: Scene = (ctx, y0, r) => {
  ctx.fillStyle = grad(ctx, y0, [[0, "#9cc2e6"], [0.5, "#f3d3b6"], [1, "#e8b99a"]], 0, 520);
  ctx.fillRect(0, y0, W, H);
  const layers = ["#7a8fb0", "#5b6f94", "#3d4f73", "#24324f", "#141d33"];
  layers.forEach((c, li) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    let yy = y0 + 300 + li * 80;
    ctx.moveTo(0, yy);
    for (let x = 0; x <= W; x += 20) {
      yy += (r() - 0.5) * (60 - li * 6);
      yy = Math.min(Math.max(yy, y0 + 230 + li * 70), y0 + 420 + li * 80);
      ctx.lineTo(x, yy);
    }
    ctx.lineTo(W, y0 + H);
    ctx.lineTo(0, y0 + H);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(0, y0 + 330 + li * 80, W, 26);
  });
  ctx.fillStyle = "#0c111f";
  ctx.beginPath();
  ctx.arc(250, y0 + 548, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(244, y0 + 556, 12, 30);
};

const latte: Scene = (ctx, y0, r) => {
  ctx.fillStyle = grad(ctx, y0, [[0, "#d9c3a5"], [1, "#b89a78"]]);
  ctx.fillRect(0, y0, W, H);
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = `rgba(90,60,30,${r() * 0.08})`;
    ctx.fillRect(r() * W, y0 + r() * H, 2, 2);
  }
  const cx = 180, cy = y0 + 380;
  ctx.fillStyle = "rgba(60,40,20,0.25)";
  ctx.beginPath();
  ctx.arc(cx + 12, cy + 18, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fbf8f2";
  ctx.beginPath();
  ctx.arc(cx, cy, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 108, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#8a5a2f";
  ctx.beginPath();
  ctx.arc(cx, cy, 96, 0, Math.PI * 2);
  ctx.fill();
  // Latte art: hati berlapis
  for (let k = 0; k < 4; k++) {
    const s = 58 - k * 12;
    ctx.fillStyle = k % 2 ? "#a06b3a" : "#f6ead6";
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.9);
    ctx.bezierCurveTo(cx - s * 1.5, cy - s * 0.1, cx - s * 0.6, cy - s * 1.2, cx, cy - s * 0.35);
    ctx.bezierCurveTo(cx + s * 0.6, cy - s * 1.2, cx + s * 1.5, cy - s * 0.1, cx, cy + s * 0.9);
    ctx.fill();
  }
  ctx.fillStyle = "#fbf8f2";
  ctx.beginPath();
  ctx.roundRect(cx + 140, cy - 22, 60, 44, 20);
  ctx.fill();
};

const room: Scene = (ctx, y0, r) => {
  ctx.fillStyle = grad(ctx, y0, [[0, "#1b1030"], [1, "#0b0716"]]);
  ctx.fillRect(0, y0, W, H);
  const glow = ctx.createRadialGradient(180, y0 + 230, 20, 180, y0 + 230, 260);
  glow.addColorStop(0, "rgba(255,90,200,0.55)");
  glow.addColorStop(1, "rgba(255,90,200,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, y0, W, 500);
  ctx.strokeStyle = "#ff7ad9";
  ctx.lineWidth = 7;
  ctx.shadowColor = "#ff7ad9";
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(180, y0 + 220, 90, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#2a1e3c";
  ctx.fillRect(0, y0 + 470, W, 24);
  ctx.fillStyle = "#0f0b18";
  ctx.fillRect(0, y0 + 494, W, H - 494);
  ctx.fillStyle = "#111";
  ctx.fillRect(90, y0 + 360, 180, 104);
  ctx.fillStyle = grad(ctx, y0, [[0, "#3c7bff"], [1, "#a33cff"]], 366, 458);
  ctx.fillRect(96, y0 + 366, 168, 92);
  ctx.fillStyle = "#222";
  ctx.fillRect(170, y0 + 464, 20, 8);
  ctx.fillStyle = "#e9e6f0";
  ctx.fillRect(110, y0 + 478, 140, 8);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `hsl(${r() * 360},80%,65%)`;
    ctx.fillRect(112 + i * 23, y0 + 479, 18, 6);
  }
};

const meme = (text: string[]): Scene => (ctx, y0, r) => {
  const g = ctx.createLinearGradient(0, y0, W, y0 + H);
  const h = r() * 360;
  g.addColorStop(0, `hsl(${h},55%,42%)`);
  g.addColorStop(1, `hsl(${(h + 70) % 360},60%,22%)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, W, H);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.06})`;
    ctx.beginPath();
    ctx.arc(r() * W, y0 + r() * H, 60 + r() * 120, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textAlign = "center";
  ctx.font = `900 34px Impact, "Arial Black", sans-serif`;
  ctx.lineJoin = "round";
  text.forEach((t, i) => {
    const yy = y0 + 300 + i * 44;
    ctx.lineWidth = 7;
    ctx.strokeStyle = "#000";
    ctx.strokeText(t, W / 2, yy);
    ctx.fillStyle = "#fff";
    ctx.fillText(t, W / 2, yy);
  });
  ctx.textAlign = "left";
};

const SCENES: { draw: Scene; user: string; caption: string; tags: string; sound: string }[] = [
  { draw: sunset, user: "sunset.chaser", caption: "golden hour never misses", tags: "#fyp #sunset #bali", sound: "original sound - sunset.chaser" },
  { draw: city, user: "nightdrive.jkt", caption: "3am city lights hit different", tags: "#fyp #jakarta #night", sound: "lofi drive - beats.daily" },
  { draw: noodles, user: "dailybites.id", caption: "ramen 15 menit, rasa restoran", tags: "#resep #foryou #ramen", sound: "original sound - dailybites.id" },
  { draw: mountains, user: "hike.with.rara", caption: "sunrise di 3.142 mdpl", tags: "#hiking #fyp #mountain", sound: "cinematic - rara.audio" },
  { draw: latte, user: "kopi.pagi", caption: "latte art attempt #47", tags: "#coffee #latteart #fyp", sound: "cafe jazz - kopi.pagi" },
  { draw: room, user: "desk.setups", caption: "my setup at night ✦", tags: "#setup #desk #fyp", sound: "synthwave - neon.tape" },
  { draw: meme(["POV:", "15 phones posting", "by themselves"]), user: "meme.harian", caption: "the farm never sleeps", tags: "#pov #fyp #meme", sound: "original sound - meme.harian" },
  { draw: meme(["day 47 of", "warming up", "new accounts"]), user: "growth.lab", caption: "consistency > motivation", tags: "#growth #fyp #creator", sound: "motivation - growth.lab" },
];

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(Math.round(n)));

// ── Ikon ───────────────────────────────────────────────────────────────
function heart(ctx: Ctx, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.45);
  ctx.bezierCurveTo(cx - s * 1.15, cy - s * 0.25, cx - s * 0.55, cy - s * 1.0, cx, cy - s * 0.35);
  ctx.bezierCurveTo(cx + s * 0.55, cy - s * 1.0, cx + s * 1.15, cy - s * 0.25, cx, cy + s * 0.45);
  ctx.fill();
}
function bubble(ctx: Ctx, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2, s, s * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.3, cy + s * 0.6);
  ctx.lineTo(cx + s * 0.75, cy + s * 1.05);
  ctx.lineTo(cx + s * 0.75, cy + s * 0.4);
  ctx.fill();
  ctx.fillStyle = "#222";
  for (const d of [-1, 0, 1]) {
    ctx.beginPath();
    ctx.arc(cx + d * s * 0.42, cy - 2, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
}
function bookmark(ctx: Ctx, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.6, cy - s);
  ctx.lineTo(cx + s * 0.6, cy - s);
  ctx.lineTo(cx + s * 0.6, cy + s);
  ctx.lineTo(cx, cy + s * 0.5);
  ctx.lineTo(cx - s * 0.6, cy + s);
  ctx.closePath();
  ctx.fill();
}
function share(ctx: Ctx, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(cx + s, cy - s * 0.1);
  ctx.lineTo(cx + s * 0.05, cy - s);
  ctx.lineTo(cx + s * 0.05, cy - s * 0.5);
  ctx.quadraticCurveTo(cx - s, cy - s * 0.4, cx - s, cy + s * 0.9);
  ctx.quadraticCurveTo(cx - s * 0.4, cy + s * 0.1, cx + s * 0.05, cy + s * 0.25);
  ctx.lineTo(cx + s * 0.05, cy + s * 0.8);
  ctx.closePath();
  ctx.fill();
}

function ui(ctx: Ctx, y0: number, r: () => number, sc: (typeof SCENES)[number], sans: string, hue: number) {
  ctx.save();
  // Gelap tipis atas & bawah supaya UI terbaca
  ctx.fillStyle = grad(ctx, y0, [[0, "rgba(0,0,0,0.35)"], [1, "rgba(0,0,0,0)"]], 0, 120);
  ctx.fillRect(0, y0, W, 120);
  ctx.fillStyle = grad(ctx, y0, [[0, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,0.6)"]], H - 330, H - 52);
  ctx.fillRect(0, y0 + H - 330, W, 280);
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 4;
  // Status bar
  ctx.fillStyle = "#fff";
  ctx.font = `600 14px ${sans}`;
  ctx.fillText("9:41", 22, y0 + 24);
  ctx.fillRect(W - 50, y0 + 13, 26, 12);
  ctx.fillRect(W - 23, y0 + 16, 2, 6);
  // Bilah atas: LIVE · Following | For You · cari
  ctx.font = `600 17px ${sans}`;
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText("Following", 136, y0 + 64);
  ctx.fillStyle = "#fff";
  ctx.font = `700 17px ${sans}`;
  ctx.fillText("For You", 234, y0 + 64);
  ctx.fillRect(220, y0 + 74, 28, 3);
  ctx.textAlign = "left";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.strokeRect(18, y0 + 50, 22, 16);
  ctx.font = `800 7px ${sans}`;
  ctx.fillText("LIVE", 20, y0 + 61);
  ctx.beginPath();
  ctx.arc(W - 32, y0 + 57, 8, 0, Math.PI * 2);
  ctx.moveTo(W - 26, y0 + 63);
  ctx.lineTo(W - 20, y0 + 69);
  ctx.stroke();

  // Rel kanan
  const rx = W - 34;
  let y = y0 + 352;
  ctx.fillStyle = `hsl(${hue},55%,60%)`;
  ctx.beginPath();
  ctx.arc(rx, y, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `700 18px ${sans}`;
  ctx.textAlign = "center";
  ctx.fillText(sc.user[0].toUpperCase(), rx, y + 6);
  ctx.fillStyle = "#fe2c55";
  ctx.beginPath();
  ctx.arc(rx, y + 22, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(rx - 5, y + 21, 10, 2);
  ctx.fillRect(rx - 1, y + 17, 2, 10);
  const counts = [fmt(2000 + r() * 400000), fmt(50 + r() * 9000), fmt(100 + r() * 30000), fmt(20 + r() * 8000)];
  const liked = r() > 0.6;
  y += 70;
  ctx.font = `600 12px ${sans}`;
  ctx.fillStyle = liked ? "#fe2c55" : "#fff";
  heart(ctx, rx, y, 17);
  ctx.fillStyle = "#fff";
  ctx.fillText(counts[0], rx, y + 30);
  y += 62;
  ctx.fillStyle = "#fff";
  bubble(ctx, rx, y, 15);
  ctx.fillStyle = "#fff";
  ctx.fillText(counts[1], rx, y + 30);
  y += 62;
  bookmark(ctx, rx, y, 14);
  ctx.fillText(counts[2], rx, y + 30);
  y += 62;
  share(ctx, rx, y, 15);
  ctx.fillText(counts[3], rx, y + 30);
  // Piringan musik
  y += 70;
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(rx, y, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `hsl(${(hue + 40) % 360},60%,55%)`;
  ctx.beginPath();
  ctx.arc(rx, y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "left";

  // Kiri bawah: username, caption + tagar, suara
  ctx.fillStyle = "#fff";
  ctx.font = `700 16px ${sans}`;
  ctx.fillText(`@${sc.user}`, 16, y0 + H - 142);
  ctx.font = `400 14px ${sans}`;
  ctx.fillText(sc.caption, 16, y0 + H - 118);
  ctx.font = `700 14px ${sans}`;
  ctx.fillText(sc.tags, 16, y0 + H - 98);
  ctx.font = `400 13px ${sans}`;
  ctx.fillText(`♫  ${sc.sound}`, 16, y0 + H - 74);
  // Progres video
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(0, y0 + H - 54, W, 2);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, y0 + H - 54, W * (0.15 + r() * 0.7), 2);
  // Navigasi bawah
  ctx.fillStyle = "#000";
  ctx.fillRect(0, y0 + H - 52, W, 52);
  const labels = ["Home", "Friends", "", "Inbox", "Profile"];
  labels.forEach((t, i) => {
    const x = 36 + i * 72;
    const yy = y0 + H - 34;
    ctx.fillStyle = i === 0 ? "#fff" : "rgba(255,255,255,0.7)";
    if (i === 2) {
      ctx.fillStyle = "#25f4ee";
      ctx.beginPath();
      ctx.roundRect(x - 22, yy - 10, 40, 26, 7);
      ctx.fill();
      ctx.fillStyle = "#fe2c55";
      ctx.beginPath();
      ctx.roundRect(x - 18, yy - 10, 40, 26, 7);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.roundRect(x - 20, yy - 10, 40, 26, 7);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.fillRect(x - 8, yy + 2, 16, 3);
      ctx.fillRect(x - 1.5, yy - 5, 3, 17);
      return;
    }
    ctx.beginPath();
    if (i === 0) {
      ctx.moveTo(x - 9, yy);
      ctx.lineTo(x, yy - 9);
      ctx.lineTo(x + 9, yy);
      ctx.lineTo(x + 9, yy + 9);
      ctx.lineTo(x - 9, yy + 9);
      ctx.fill();
    } else if (i === 4) {
      ctx.arc(x, yy - 3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 8, yy + 4, 16, 6);
    } else {
      ctx.roundRect(x - 9, yy - 7, 18, 15, 3);
      ctx.fill();
    }
    ctx.font = `500 9px ${sans}`;
    ctx.textAlign = "center";
    ctx.fillText(t, x, yy + 21);
    ctx.textAlign = "left";
  });
  ctx.restore();
}

/** Satu tekstur feed: 6 video FYP bertumpuk vertikal (dipakai dengan repeat.y = 1/6). */
export function fypFeed(seed: number, sans: string) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H * N;
  const ctx = c.getContext("2d")!;
  const r = rng(seed + 5);
  for (let k = 0; k < N; k++) {
    const y0 = k * H;
    const sc = SCENES[(seed * 3 + k) % SCENES.length];
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y0, W, H);
    ctx.clip();
    sc.draw(ctx, y0, r);
    ui(ctx, y0, r, sc, sans, (seed * 67 + k * 41) % 360);
    ctx.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
