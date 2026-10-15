"use client";

// Tampilan produksi dua proyek publik di layar monitor, digambar ulang di kanvas mengikuti situs aslinya:
// - Sonar (sonar-seo.vercel.app): krem, neo-brutalis (garis 3px cokelat tua, sudut tajam), Pixelify Sans +
//   Work Sans, label navy, tombol kuning & hijau, ilustrasi kantor pixel "LIVE DEMO".
// - PromptedSite (promptedsite.com): gelap #0a0a0f, Bricolage Grotesque 800 dengan kata aksen ungu tipis,
//   navigasi kapsul kaca, kartu pratinjau, tombol kapsul ungu. Halaman tinggi untuk digulir di jendela.
import { pixelOffice } from "./screens2";

export type SiteFonts = { pixel: string; work: string; brico: string; mono: string };

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d")! };
}
type Ctx = CanvasRenderingContext2D;
function box(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill?: string | CanvasGradient, stroke?: string, lw = 3) {
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
function txt(ctx: Ctx, s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left", spacing = 0) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${spacing}px`;
  ctx.fillText(s, x, y);
  (ctx as Ctx & { letterSpacing: string }).letterSpacing = "0px";
  ctx.textAlign = "left";
}
/** Teks berbaris (wrap) — mengembalikan y baris terakhir. */
function wrap(ctx: Ctx, s: string, x: number, y: number, maxW: number, lh: number, font: string, color: string) {
  ctx.font = font;
  ctx.fillStyle = color;
  let line = "";
  for (const w of s.split(" ")) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lh;
      line = w;
    } else line = t;
  }
  ctx.fillText(line, x, y);
  return y;
}

// ── Sonar ───────────────────────────────────────────────────────────────
const S = {
  bg: "#f4ead2",
  ink: "#2c241a",
  muted: "#6b5841",
  yellow: "#ecbf45",
  cream: "#fcf7ea",
  navy: "#333a6b",
  navyDeep: "#23284f",
  green: "#3f8b56",
};

/** Tombol/kotak neo-brutalis: bayangan keras 4px + garis 3px. */
function brut(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string, shadow = 4) {
  if (shadow) box(ctx, x + shadow, y + shadow, w, h, 0, S.ink);
  box(ctx, x, y, w, h, 0, fill, S.ink, 3);
}

export function sonarSite(f: SiteFonts) {
  const W = 1600, H = 900;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = S.bg;
  ctx.fillRect(0, 0, W, H);
  // tekstur kotak-kotak samar
  ctx.fillStyle = "rgba(44,36,26,0.035)";
  for (let x = 0; x < W; x += 32) ctx.fillRect(x, 0, 1, H);
  for (let y = 0; y < H; y += 32) ctx.fillRect(0, y, W, 1);

  // Nav
  ctx.save();
  ctx.fillStyle = S.ink;
  for (const [dx, dy] of [[0, 0], [8, 0], [16, 0], [4, 8], [12, 8], [8, 16]]) ctx.fillRect(140 + dx, 30 + dy, 6, 6);
  ctx.restore();
  txt(ctx, "sonar", 172, 52, `700 30px ${f.pixel}`, S.ink);
  let nx = 300;
  for (const l of ["The team", "How it works", "For your business", "FAQ"]) {
    txt(ctx, l, nx, 50, `500 18px ${f.work}`, S.ink);
    ctx.font = `500 18px ${f.work}`;
    nx += ctx.measureText(l).width + 28;
  }
  brut(ctx, 930, 22, 70, 46, S.cream, 0);
  txt(ctx, "EN", 965, 52, `700 16px ${f.pixel}`, S.ink, "center");
  brut(ctx, 1010, 22, 150, 46, S.cream, 0);
  box(ctx, 1028, 37, 16, 16, 8, S.yellow, S.ink, 2);
  txt(ctx, "Day office", 1054, 52, `700 16px ${f.pixel}`, S.ink);
  brut(ctx, 1184, 22, 92, 46, S.cream, 0);
  txt(ctx, "Sign in", 1230, 52, `700 16px ${f.pixel}`, S.ink, "center");
  brut(ctx, 1286, 22, 172, 46, S.green, 0);
  txt(ctx, "Request access", 1372, 52, `700 16px ${f.pixel}`, S.cream, "center");

  // Hero kiri
  brut(ctx, 130, 138, 252, 42, S.navy, 0);
  txt(ctx, "AUTOPILOT · SEO · AEO · GEO", 256, 166, `700 15px ${f.pixel}`, S.yellow, "center", 1);
  let y = wrap(ctx, "An office of AI agents that gets your business found.", 130, 268, 580, 70, `700 66px ${f.pixel}`, S.ink);
  y = wrap(ctx, "They check, fix and measure your site for Google and AI answers — every change reviewed, measured and reversible.", 130, y + 66, 560, 32, `400 22px ${f.work}`, S.muted);
  const fy = y + 34;
  brut(ctx, 130, fy, 372, 58, S.cream, 0);
  txt(ctx, "yoursite.com", 154, fy + 37, `400 20px ${f.work}`, "rgba(44,36,26,0.45)");
  brut(ctx, 514, fy, 178, 58, S.yellow);
  txt(ctx, "Free scan  →", 603, fy + 37, `700 20px ${f.pixel}`, S.ink, "center");
  let cx = 130;
  for (const t of ["Read-only scan", "No account needed", "Results in minutes"]) {
    txt(ctx, "✓", cx, fy + 96, `700 16px ${f.work}`, S.green);
    txt(ctx, t, cx + 20, fy + 96, `400 17px ${f.work}`, S.muted);
    ctx.font = `400 17px ${f.work}`;
    cx += ctx.measureText(t).width + 50;
  }

  // Figure kanan: kantor pixel di bingkai navy + label LIVE DEMO
  const fx = 736, fyy = 168, fw = 718, fh = 550;
  brut(ctx, fx, fyy, fw, fh, S.navyDeep, 6);
  const { c: office } = pixelOffice();
  ctx.imageSmoothingEnabled = false;
  const pad = 24;
  const ow = fw - pad * 2, oh = (ow / office.width) * office.height;
  ctx.drawImage(office, fx + pad, fyy + (fh - oh) / 2, ow, oh);
  ctx.imageSmoothingEnabled = true;
  brut(ctx, fx + 16, fyy + 16, 112, 34, S.yellow, 0);
  txt(ctx, "LIVE DEMO", fx + 72, fyy + 39, `700 14px ${f.pixel}`, S.ink, "center", 1);
  // Gelembung status agen
  for (const [bx, by, a, b] of [[fx + 420, fyy + 120, "Researcher", "Mapping AI answers"], [fx + 60, fyy + 400, "Engineer", "Fixing 12 titles"], [fx + 400, fyy + 450, "Editor", "Fact-checking"]] as const) {
    ctx.font = `400 15px ${f.work}`;
    const w = ctx.measureText(b).width + 130;
    brut(ctx, bx, by, w, 36, S.cream, 3);
    txt(ctx, a, bx + 12, by + 24, `700 15px ${f.pixel}`, S.ink);
    txt(ctx, b, bx + 112, by + 24, `400 15px ${f.work}`, S.muted);
  }

  // Measured on
  txt(ctx, "Measured on", 130, 852, `700 18px ${f.pixel}`, S.muted);
  let mx = 268;
  for (const t of ["Google", "AI Overviews", "ChatGPT", "Perplexity", "Gemini", "Claude", "Copilot"]) {
    ctx.font = `700 17px ${f.pixel}`;
    const w = ctx.measureText(t).width + 30;
    brut(ctx, mx, 824, w, 42, S.cream, 0);
    txt(ctx, t, mx + w / 2, 851, `700 17px ${f.pixel}`, S.ink, "center");
    mx += w + 12;
  }
  return c;
}

// ── PromptedSite ─────────────────────────────────────────────────────────
const P = { bg: "#0a0a0f", text: "#f4f4f0", muted: "#8a8a96", accent: "#7c5cff", panel: "rgba(17,17,24,0.85)", line: "rgba(255,255,255,0.09)" };

/** Judul tebal dengan satu kata aksen ungu tipis (gaya situs asli). */
function headline(ctx: Ctx, parts: [string, boolean][], cx: number, y: number, size: number, f: SiteFonts) {
  const font = (accent: boolean) => `${accent ? 300 : 800} ${size}px ${f.brico}`;
  (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${-size * 0.02}px`;
  const widths = parts.map(([s, a]) => {
    ctx.font = font(a);
    return ctx.measureText(s).width;
  });
  let x = cx - widths.reduce((a, b) => a + b, 0) / 2;
  parts.forEach(([s, a], i) => {
    ctx.font = font(a);
    ctx.fillStyle = a ? P.accent : P.text;
    ctx.fillText(s, x, y);
    x += widths[i];
  });
  (ctx as Ctx & { letterSpacing: string }).letterSpacing = "0px";
}
function pill(ctx: Ctx, cx: number, y: number, label: string, f: SiteFonts, size = 18) {
  ctx.font = `500 ${size}px ${f.brico}`;
  const w = ctx.measureText(label).width + 56;
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, "#8b6dff");
  g.addColorStop(1, "#6a48f0");
  box(ctx, cx - w / 2, y, w, size * 3, size * 1.5, g);
  txt(ctx, label, cx, y + size * 1.95, `500 ${size}px ${f.brico}`, P.text, "center");
}

/** Mockup situs hasil prompt (kartu pratinjau): SaaS gelap dengan cahaya ungu-biru. */
function previewSaas(ctx: Ctx, x: number, y: number, w: number, h: number, f: SiteFonts) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.clip();
  ctx.fillStyle = "#07070c";
  ctx.fillRect(x, y, w, h);
  const glow = ctx.createRadialGradient(x + w * 0.62, y + h * 0.35, 10, x + w * 0.62, y + h * 0.35, w * 0.55);
  glow.addColorStop(0, "rgba(124,92,255,0.75)");
  glow.addColorStop(0.45, "rgba(56,120,255,0.3)");
  glow.addColorStop(1, "rgba(7,7,12,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  txt(ctx, "CONVIX", x + 34, y + 46, `800 18px ${f.brico}`, P.text, "left", 2);
  for (const [i, l] of ["Product", "Pricing", "Docs"].entries()) txt(ctx, l, x + w - 280 + i * 84, y + 46, `500 15px ${f.brico}`, P.muted);
  txt(ctx, "Ship AI products", x + 34, y + 150, `800 54px ${f.brico}`, P.text);
  txt(ctx, "at the speed of thought.", x + 34, y + 210, `300 54px ${f.brico}`, "#b9a8ff");
  box(ctx, x + 34, y + 250, 170, 50, 25, P.text);
  txt(ctx, "Start free", x + 119, y + 282, `500 17px ${f.brico}`, "#07070c", "center");
  // kartu UI melayang
  box(ctx, x + w - 330, y + 240, 290, 160, 16, "rgba(255,255,255,0.06)", "rgba(255,255,255,0.14)", 1.5);
  ctx.strokeStyle = "#8b6dff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) {
    const px = x + w - 310 + i * 12.5, py = y + 360 - Math.pow(i / 20, 1.6) * 90 - Math.sin(i * 0.9) * 8;
    if (i) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.stroke();
  txt(ctx, "+248%", x + w - 310, y + 275, `800 26px ${f.brico}`, P.text);
  ctx.restore();
  box(ctx, x, y, w, h, 18, undefined, "rgba(255,255,255,0.12)", 1.5);
}

/** Mockup "REALESTATE" (contoh hasil di situs asli), tema terang. */
function previewEstate(ctx: Ctx, x: number, y: number, w: number, h: number, f: SiteFonts) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.clip();
  ctx.fillStyle = "#f3efe8";
  ctx.fillRect(x, y, w, h);
  txt(ctx, "REALESTATE", x + 34, y + 48, `800 18px ${f.brico}`, "#1b1b1f", "left", 1);
  for (const [i, l] of ["Home", "About", "Property", "Contact"].entries()) txt(ctx, l, x + 360 + i * 92, y + 48, `500 15px ${f.brico}`, "#55555e");
  box(ctx, x + w - 140, y + 22, 110, 40, 20, "#1b1b1f");
  txt(ctx, "Sign Up", x + w - 85, y + 48, `500 15px ${f.brico}`, "#fff", "center");
  txt(ctx, "★ WELCOME TO REALESTATE", x + 34, y + 120, `500 14px ${f.brico}`, "#8a6a2f", "left", 1);
  wrap(ctx, "Find The Best Real Estate On Your Country", x + 34, y + 175, 470, 56, `800 50px ${f.brico}`, "#1b1b1f");
  box(ctx, x + 34, y + 340, 150, 48, 24, "#1b1b1f");
  txt(ctx, "Get Started", x + 109, y + 370, `500 16px ${f.brico}`, "#fff", "center");
  for (const [i, [v, k]] of [["3.5k", "Happy Client"], ["99%", "Satisfaction"], ["69+", "Award Winning"]].entries()) {
    txt(ctx, v, x + 34 + i * 150, y + 450, `800 30px ${f.brico}`, "#1b1b1f");
    txt(ctx, k, x + 34 + i * 150, y + 476, `500 14px ${f.brico}`, "#6b6b74");
  }
  // foto rumah: gradasi langit + siluet
  const hx = x + w * 0.56, hw = w * 0.4;
  const sky = ctx.createLinearGradient(0, y + 90, 0, y + h - 40);
  sky.addColorStop(0, "#9cc0de");
  sky.addColorStop(1, "#e9d6b8");
  box(ctx, hx, y + 90, hw, h - 130, 16, sky);
  ctx.fillStyle = "#3b3a3f";
  ctx.fillRect(hx + 40, y + h - 210, hw - 80, 130);
  ctx.fillStyle = "#2a292e";
  ctx.beginPath();
  ctx.moveTo(hx + 20, y + h - 205);
  ctx.lineTo(hx + hw / 2, y + h - 300);
  ctx.lineTo(hx + hw - 20, y + h - 205);
  ctx.fill();
  ctx.fillStyle = "#f7d98a";
  for (let i = 0; i < 4; i++) ctx.fillRect(hx + 70 + i * ((hw - 160) / 3), y + h - 175, 34, 40);
  box(ctx, hx + 20, y + 110, 130, 56, 12, "#fff");
  txt(ctx, "SALE", hx + 34, y + 134, `800 12px ${f.brico}`, "#c2552f", "left", 1);
  txt(ctx, "$250,000", hx + 34, y + 156, `800 18px ${f.brico}`, "#1b1b1f");
  ctx.restore();
}

export function promptedSite(f: SiteFonts) {
  const W = 1600, H = 2700;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = P.bg;
  ctx.fillRect(0, 0, W, H);
  const top = ctx.createRadialGradient(W / 2, -100, 50, W / 2, -100, 900);
  top.addColorStop(0, "rgba(124,92,255,0.28)");
  top.addColorStop(1, "rgba(124,92,255,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, 900);

  // Nav kapsul kaca
  box(ctx, 430, 24, 740, 66, 33, P.panel, P.line, 1.5);
  txt(ctx, "PromptedSite", 466, 66, `800 20px ${f.brico}`, P.text);
  for (const [i, l] of ["Home", "Gallery", "Pricing", "Sign in"].entries())
    txt(ctx, l, 668 + i * 74, 64, `500 15px ${f.brico}`, i === 0 ? P.text : "rgba(244,244,240,0.7)");
  box(ctx, 1026, 38, 128, 40, 20, P.accent);
  txt(ctx, "Get Lifetime", 1090, 64, `500 15px ${f.brico}`, P.text, "center");

  // Hero
  headline(ctx, [["Make a ", false], ["Premium", true], [" Website in 5 Minutes", false]], W / 2, 196, 46, f);
  previewSaas(ctx, 445, 250, 710, 445, f);
  pill(ctx, W / 2, 728, "See pricing  →", f, 18);

  // Prompts that become websites
  txt(ctx, "500+ PROMPTS · 9 CATEGORIES", W / 2, 900, `500 16px ${f.mono}`, P.muted, "center", 3);
  headline(ctx, [["Prompts that ", false], ["become", true]], W / 2, 1010, 92, f);
  headline(ctx, [["websites.", false]], W / 2, 1104, 92, f);
  pill(ctx, W / 2, 1150, "Get Lifetime — $49  →", f, 18);
  previewEstate(ctx, 300, 1270, 1000, 520, f);

  // Three steps
  txt(ctx, "HOW IT WORKS", 140, 1900, `500 15px ${f.mono}`, P.muted, "left", 3);
  headline(ctx, [["Three steps to a ", false], ["premium website.", true]], W / 2, 1980, 58, f);
  const steps: [string, string, string][] = [
    ["01", "Buy once", "One payment unlocks the whole catalog — every prompt and source file."],
    ["02", "Pick a template", "Browse 500+ production-grade builds across nine categories."],
    ["03", "Copy the prompt", "Paste it into your AI editor and the site builds itself."],
  ];
  steps.forEach(([n, t, d], i) => {
    const x = 140 + i * 450, y = 2040;
    box(ctx, x, y, 420, 300, 18, "rgba(255,255,255,0.03)", P.line, 1.5);
    txt(ctx, n, x + 30, y + 50, `500 16px ${f.mono}`, P.accent);
    txt(ctx, t, x + 30, y + 100, `800 30px ${f.brico}`, P.text);
    wrap(ctx, d, x + 30, y + 140, 360, 26, `400 18px ${f.brico}`, P.muted);
    if (i === 0) {
      txt(ctx, "$149", x + 30, y + 262, `500 22px ${f.brico}`, P.muted);
      ctx.fillStyle = P.muted;
      ctx.fillRect(x + 28, y + 254, 52, 2);
      txt(ctx, "$49", x + 92, y + 266, `800 40px ${f.brico}`, P.text);
      txt(ctx, "LIFETIME ACCESS", x + 190, y + 262, `500 13px ${f.mono}`, P.accent, "left", 2);
    }
  });

  // Rak kategori
  txt(ctx, "BROWSE BY CATEGORY", 140, 2440, `500 15px ${f.mono}`, P.muted, "left", 3);
  const cats: [string, string][] = [["Heroes", "41"], ["Shaders", "84"], ["Folio", "14"], ["Landing Pages", "98"], ["3D & Games", "2"], ["UI Systems", "34"], ["Animations", "12"], ["Templates", "47"], ["Components", "15"]];
  cats.forEach(([n, k], i) => {
    const x = 140 + (i % 5) * 268, y = 2470 + Math.floor(i / 5) * 110;
    box(ctx, x, y, 252, 96, 14, "rgba(255,255,255,0.035)", P.line, 1.5);
    txt(ctx, n, x + 22, y + 44, `800 22px ${f.brico}`, P.text);
    txt(ctx, `${k} PROMPTS`, x + 22, y + 74, `500 13px ${f.mono}`, P.accent, "left", 2);
  });
  return c;
}
