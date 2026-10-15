"use client";

// Isi layar perangkat, digambar dengan canvas. Tekstur dibuat tinggi lalu digeser (offset) untuk
// efek menggulir, jadi tidak perlu digambar ulang tiap frame.
import * as THREE from "three";

function make(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, repeat = true) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx);
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

/** Pseudo-acak deterministik supaya tiap render sama. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PALETTES = [
  ["#f6a26b", "#c2552f", "#3b1d12"],
  ["#8fd3e8", "#2f6fa3", "#0e1d33"],
  ["#f3d27a", "#d9822b", "#3a2108"],
  ["#c6e3a1", "#5d9c59", "#14280f"],
  ["#e7b4d6", "#9b4f8e", "#2a0f27"],
  ["#d9d4cc", "#7f776d", "#1e1b18"],
];

/** Feed video vertikal (gaya short video) untuk layar HP. Satu "kartu" = satu layar penuh. */
export function phoneFeed(seed: number, sans: string) {
  const W = 360, H = 780, N = 6;
  const r = rng(seed + 11);
  return make(W, H * N, (ctx) => {
    for (let k = 0; k < N; k++) {
      const y0 = k * H;
      const [a, b, c] = PALETTES[(seed + k) % PALETTES.length];
      const g = ctx.createLinearGradient(0, y0, W * 0.4, y0 + H);
      g.addColorStop(0, a);
      g.addColorStop(0.55, b);
      g.addColorStop(1, c);
      ctx.fillStyle = g;
      ctx.fillRect(0, y0, W, H);
      ctx.globalAlpha = 0.35;
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? "#ffffff" : c;
        ctx.beginPath();
        ctx.ellipse(r() * W, y0 + 200 + r() * 360, 60 + r() * 120, 60 + r() * 160, r() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      const shade = ctx.createLinearGradient(0, y0 + H * 0.55, 0, y0 + H);
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, y0 + H * 0.5, W, H * 0.5);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.arc(W - 34, y0 + 400 + i * 88, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = `600 15px ${sans}`;
        ctx.textAlign = "center";
        ctx.fillText(`${(1 + r() * 98).toFixed(1)}K`, W - 34, y0 + 446 + i * 88);
      }
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff";
      ctx.font = `700 19px ${sans}`;
      ctx.fillText(`@account_${String(seed * 7 + k).padStart(3, "0")}`, 18, y0 + H - 118);
      rr(ctx, 18, y0 + H - 98, W * 0.7, 11, 5, "rgba(255,255,255,0.8)");
      rr(ctx, 18, y0 + H - 78, W * 0.48, 11, 5, "rgba(255,255,255,0.55)");
      rr(ctx, 0, y0 + H - 44, W, 3, 0, "rgba(255,255,255,0.25)");
      rr(ctx, 0, y0 + H - 44, W * (0.2 + r() * 0.7), 3, 0, "#fff");
      ctx.fillStyle = "#000";
      ctx.fillRect(0, y0 + H - 40, W, 40);
      for (let i = 0; i < 5; i++) rr(ctx, 30 + i * 68, y0 + H - 28, 22, 16, 4, i === 0 ? "#fff" : "rgba(255,255,255,0.45)");
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = `600 15px ${sans}`;
      ctx.fillText("9:41", 20, y0 + 26);
      rr(ctx, W - 58, y0 + 14, 36, 14, 4, "rgba(255,255,255,0.9)");
    }
  });
}

/** Galeri marketplace bergaya promptedsite.com (gelap, aksen ungu), panjang untuk digulir. */
export function galleryPage(serif: string, sans: string, mono: string) {
  const W = 1280, H = 2560;
  const r = rng(42);
  const titles = [
    "Monochrome Paleontology Landing", "Chrome Horizon Shader", "3D Creator Portfolio", "Deep Space Web3 Landing",
    "Cinematic Space Travel", "Glass Morph Pricing", "Kinetic Type Hero", "Liquid Gradient Agency",
    "Noir Fashion Lookbook", "Isometric SaaS Dashboard", "Particle Logo Reveal", "Editorial Magazine Grid",
  ];
  const cats = ["All", "Heroes", "Landing Pages", "Templates", "Shaders", "UI Systems", "Components", "Portfolios", "Animations", "3D & Games"];
  return make(W, H, (ctx) => {
    ctx.fillStyle = "#0e0e12";
    ctx.fillRect(0, 0, W, H);
    rr(ctx, 300, 30, 680, 64, 32, "#17171d");
    ctx.fillStyle = "#e9e7f2";
    ctx.font = `600 20px ${mono}`;
    ctx.fillText("PROMPTEDSITE", 336, 70);
    ctx.font = `500 18px ${sans}`;
    ["Home", "Gallery", "Pricing"].forEach((t, i) => {
      ctx.fillStyle = i === 1 ? "#ffffff" : "#8d8a99";
      ctx.fillText(t, 560 + i * 92, 69);
    });
    rr(ctx, 832, 42, 132, 40, 20, "#7b5cff");
    ctx.fillStyle = "#fff";
    ctx.font = `600 16px ${sans}`;
    ctx.fillText("Go Unlimited", 850, 68);
    ctx.fillStyle = "#f4f2fb";
    ctx.font = `700 76px ${sans}`;
    ctx.fillText("The", 40, 210);
    ctx.fillStyle = "#8b6dff";
    ctx.font = `italic 400 80px ${serif}`;
    ctx.fillText("gallery.", 196, 210);
    ctx.fillStyle = "#6f6c7c";
    ctx.font = `500 16px ${mono}`;
    ctx.fillText("500+ PROMPTS · NEW DROPS WEEKLY", W - 360, 200);
    let x = 40;
    ctx.font = `500 17px ${sans}`;
    cats.forEach((c, i) => {
      const w = ctx.measureText(c).width + 36;
      rr(ctx, x, 250, w, 42, 21, i === 0 ? "#2a2833" : "#17171d");
      ctx.fillStyle = i === 0 ? "#fff" : "#a9a6b6";
      ctx.fillText(c, x + 18, 277);
      x += w + 12;
    });
    const colW = (W - 80 - 48) / 3;
    let y = 330;
    let t = 0;
    while (y < H - 40) {
      for (let col = 0; col < 3; col++) {
        const cx = 40 + col * (colW + 24);
        const h = 380;
        rr(ctx, cx, y, colW, h, 18, "#15151a");
        const pal = PALETTES[(t * 3) % PALETTES.length];
        const g = ctx.createLinearGradient(cx, y, cx + colW, y + h);
        g.addColorStop(0, pal[0]);
        g.addColorStop(0.6, pal[1]);
        g.addColorStop(1, pal[2]);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cx + 10, y + 10, colW - 20, h - 92, 12);
        ctx.clip();
        ctx.fillStyle = g;
        ctx.fillRect(cx, y, colW, h);
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = i % 2 ? "#fff" : "#000";
          ctx.fillRect(cx + r() * colW, y + r() * h, 40 + r() * 160, 8 + r() * 50);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
        rr(ctx, cx + 22, y + 22, 96, 26, 13, "rgba(0,0,0,0.55)");
        ctx.fillStyle = "#e6e3f0";
        ctx.font = `600 13px ${mono}`;
        ctx.fillText("PREMIUM", cx + 38, y + 40);
        ctx.fillStyle = "#f2f0fa";
        ctx.font = `600 19px ${sans}`;
        ctx.fillText(titles[t % titles.length], cx + 20, y + h - 46);
        ctx.fillStyle = "#7d7a8a";
        ctx.font = `500 15px ${sans}`;
        ctx.fillText(cats[1 + (t % 8)], cx + 20, y + h - 20);
        t++;
      }
      y += 404;
    }
  });
}

const PLATFORMS = ["TikTok", "Instagram", "YouTube", "Facebook", "Douyin", "RedNote"];

/** Satu kolom dashboard tren per platform: daftar konten + sparkline velocity. */
export function trendColumn(i: number, sans: string, mono: string) {
  const W = 640, H = 1440;
  const r = rng(i * 97 + 5);
  return make(W, H, (ctx) => {
    ctx.fillStyle = "#101114";
    ctx.fillRect(0, 0, W, H);
    for (let k = 0; k < 2; k++) {
      const y0 = k * (H / 2);
      ctx.fillStyle = "#16181d";
      ctx.fillRect(0, y0, W, 70);
      ctx.fillStyle = "#f2efe9";
      ctx.font = `700 26px ${sans}`;
      ctx.fillText(PLATFORMS[i], 24, y0 + 45);
      ctx.fillStyle = k === 0 ? "#e9a07f" : "#9fd3a8";
      ctx.font = `600 15px ${mono}`;
      ctx.fillText(k === 0 ? "ALREADY VIRAL" : "POTENTIALLY VIRAL", W - 230, y0 + 44);
      for (let row = 0; row < 6; row++) {
        const y = y0 + 90 + row * 108;
        const pal = PALETTES[(i + row + k) % PALETTES.length];
        const g = ctx.createLinearGradient(24, y, 120, y + 92);
        g.addColorStop(0, pal[0]);
        g.addColorStop(1, pal[2]);
        rr(ctx, 24, y, 64, 92, 8, g);
        rr(ctx, 104, y + 10, 260 + r() * 120, 14, 7, "rgba(242,239,233,0.85)");
        rr(ctx, 104, y + 36, 160 + r() * 80, 12, 6, "rgba(242,239,233,0.4)");
        ctx.fillStyle = "#a7a39b";
        ctx.font = `500 15px ${mono}`;
        ctx.fillText(`${(r() * 9 + 0.5).toFixed(1)}M views`, 104, y + 80);
        ctx.strokeStyle = k === 0 ? "#e9a07f" : "#9fd3a8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let p = 0; p <= 12; p++) {
          const px = 470 + p * 11;
          const grow = k === 0 ? 0.5 + r() * 0.3 : Math.pow(p / 12, 2.4);
          const py = y + 80 - grow * 60 - r() * 6;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.fillStyle = k === 0 ? "#e9a07f" : "#9fd3a8";
        ctx.font = `700 14px ${mono}`;
        ctx.fillText(`+${Math.round(40 + r() * 400)}%`, 470, y + 22);
      }
    }
  });
}

/** Notebook pelatihan model skripsi: kurva akurasi naik per epoch sampai 97.62%. */
export function trainingNotebook(sans: string, mono: string) {
  const W = 1280, H = 800;
  return make(
    W,
    H,
    (ctx) => {
      ctx.fillStyle = "#16171b";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#202228";
      ctx.fillRect(0, 0, W, 48);
      ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(26 + i * 22, 24, 7, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = "#c9c6bf";
      ctx.font = `500 18px ${mono}`;
      ctx.fillText("thesis / bilstm_attention.ipynb", 110, 31);
      ctx.fillStyle = "#e9e5dd";
      ctx.font = `700 30px ${sans}`;
      ctx.fillText("BiLSTM + Bahdanau attention", 48, 110);
      ctx.fillStyle = "#8e8a82";
      ctx.font = `500 18px ${mono}`;
      ctx.fillText("1.66M params · 3,646 pages · 546 test samples", 48, 144);
      // Grafik akurasi validasi per epoch
      const gx = 48, gy = 190, gw = 760, gh = 520;
      ctx.strokeStyle = "#2c2e35";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        ctx.beginPath();
        ctx.moveTo(gx, gy + (gh / 5) * i);
        ctx.lineTo(gx + gw, gy + (gh / 5) * i);
        ctx.stroke();
      }
      ctx.strokeStyle = "#e9a07f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let e = 0; e <= 30; e++) {
        const acc = 0.62 + (0.9762 - 0.62) * (1 - Math.exp(-e / 6));
        const x = gx + (gw / 30) * e;
        const y = gy + gh - ((acc - 0.5) / 0.5) * gh;
        if (e === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "#8e8a82";
      ctx.font = `500 16px ${mono}`;
      ctx.fillText("epoch", gx + gw - 52, gy + gh + 28);
      ctx.fillText("val accuracy", gx, gy - 12);
      // Kartu metrik
      const metrics: [string, string][] = [
        ["Accuracy", "97.62%"],
        ["F1", "0.9762"],
        ["ROC-AUC", "0.9936"],
      ];
      metrics.forEach(([k, v], i) => {
        const y = 200 + i * 170;
        rr(ctx, 860, y, 370, 140, 14, "#1e2026");
        ctx.fillStyle = "#8e8a82";
        ctx.font = `500 18px ${mono}`;
        ctx.fillText(k.toUpperCase(), 888, y + 40);
        ctx.fillStyle = i === 0 ? "#e9a07f" : "#e9e5dd";
        ctx.font = `700 54px ${sans}`;
        ctx.fillText(v, 888, y + 108);
      });
    },
    false,
  );
}

/** Halaman yang ditampilkan ekstensi Chrome saat situs judi online terdeteksi. */
export function blockedPage(serif: string, sans: string, mono: string) {
  const W = 720, H = 1440;
  return make(
    W,
    H,
    (ctx) => {
      ctx.fillStyle = "#fbf7f1";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ece6dc";
      ctx.fillRect(0, 0, W, 120);
      rr(ctx, 30, 50, W - 60, 48, 24, "#ffffff");
      ctx.fillStyle = "#8c8478";
      ctx.font = `500 22px ${sans}`;
      ctx.fillText("https://  ·····  (blocked)", 56, 82);
      ctx.fillStyle = "#c2552f";
      ctx.beginPath();
      ctx.arc(W / 2, 420, 110, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fbf7f1";
      ctx.fillRect(W / 2 - 60, 405, 120, 30);
      ctx.textAlign = "center";
      ctx.fillStyle = "#1e1b18";
      ctx.font = `76px ${serif}`;
      ctx.fillText("Site blocked", W / 2, 660);
      ctx.fillStyle = "#5c544b";
      ctx.font = `400 28px ${sans}`;
      ctx.fillText("This page looks like an", W / 2, 730);
      ctx.fillText("online gambling site.", W / 2, 770);
      rr(ctx, 120, 840, W - 240, 120, 18, "#efe8dd");
      ctx.fillStyle = "#8c3a1f";
      ctx.font = `600 22px ${mono}`;
      ctx.fillText("CONFIDENCE 0.99", W / 2, 890);
      ctx.fillStyle = "#5c544b";
      ctx.font = `500 20px ${mono}`;
      ctx.fillText("BiLSTM + attention · FastAPI", W / 2, 928);
      rr(ctx, 170, 1020, W - 340, 72, 36, "#1e1b18");
      ctx.fillStyle = "#fbf7f1";
      ctx.font = `600 24px ${sans}`;
      ctx.fillText("Go back to safety", W / 2, 1066);
      ctx.textAlign = "left";
    },
    false,
  );
}
