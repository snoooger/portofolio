// Tier kualitas render per perangkat. Dipilih sekali saat halaman dibuka (RAM, jumlah core, layar sentuh,
// lebar layar, GPU), lalu bisa turun otomatis bila FPS jatuh (PerformanceMonitor di DeskProto).
//   high : desktop kuat  — bayangan lembut PCSS, cahaya layar monitor, lampu meja berbayang, post-processing
//   mid  : laptop/HP bagus — bayangan biasa 1024, bloom saja
//   low  : HP/laptop lemah — bayangan bake 1024, tanpa post-processing, dpr ≤ 1.5

export type Tier = "high" | "mid" | "low";

export type Quality = {
  tier: Tier;
  /** Rentang device-pixel-ratio kanvas. */
  dpr: [number, number];
  shadows: boolean;
  shadowMap: number;
  /** Bayangan lembut PCSS (drei SoftShadows). */
  soft: boolean;
  /** Cahaya pantulan layar monitor + lampu meja yang ikut berbayang. */
  practicals: boolean;
  post: "full" | "bloom" | "none";
  antialias: boolean;
};

export const QUALITY: Record<Tier, Quality> = {
  // dpr maksimum 2: layar HP (dpr 3) tetap tajam tanpa biaya render 9× lipat.
  // Bayangan di-bake sekali (adegan statis), jadi resolusi peta bayangan bisa tinggi & tier low tetap berbayang.
  high: { tier: "high", dpr: [1, 2], shadows: true, shadowMap: 4096, soft: true, practicals: true, post: "full", antialias: true },
  mid: { tier: "mid", dpr: [1, 2], shadows: true, shadowMap: 2048, soft: false, practicals: true, post: "none", antialias: true },
  low: { tier: "low", dpr: [1, 1.5], shadows: true, shadowMap: 1024, soft: false, practicals: false, post: "none", antialias: true },
};

/** GPU kelas bawah yang dikenali dari nama renderer WebGL. */
const WEAK_GPU = /(mali-[gt]?[0-9]{1,2}\b|adreno \(tm\) [2-5][0-9]{2}\b|powervr|intel\(r\) (hd|uhd) graphics [2-6]|swiftshader|llvmpipe|software)/i;

function gpuName() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return "none";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return name;
  } catch {
    return "";
  }
}

export function detectTier(): Tier {
  if (typeof window === "undefined") return "mid";
  // Override manual untuk pengujian: ?q=low|mid|high
  const q = new URLSearchParams(window.location.search).get("q");
  if (q === "low" || q === "mid" || q === "high") return q;

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const mem = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const touch = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;
  const gpu = gpuName();

  if (gpu === "none" || WEAK_GPU.test(gpu) || nav.connection?.saveData) return "low";
  if (mem <= 2 || cores <= 2) return "low";
  if (touch || small) return mem >= 4 && cores >= 6 ? "mid" : "low";
  if (mem <= 4 || cores <= 4) return "mid";
  return "high";
}

export const lowerTier = (t: Tier): Tier => (t === "high" ? "mid" : "low");
