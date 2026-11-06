"use client";

// Siluet iPhone pemuat (tanpa logika, murni CSS) — ukuran & posisi = iPhone 3D di meja saat kamera intro
// (lihat intro.ts). Dipakai di HTML server (kerangka) dan oleh PhoneLoader di Desk3D.
import { BEZEL, PH, PR, PW } from "./intro";

/** Persentase CSS dari ukuran iPhone (m) — siluet sepenuhnya CSS supaya tampil sejak HTML pertama. */
const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;
const SCR_W = PW - 2 * BEZEL, SCR_H = PH - 2 * BEZEL;

/** Tampilan siluet iPhone pemuat (tanpa logika) — dipakai juga sebagai kerangka di HTML server. */
export function PhoneSilhouette({ label, shown, stage }: { label: string; shown: number; stage: "load" | "wake" | "reveal" }) {
  const r = `${pct(PR, PW)} / ${pct(PR, PH)}`;
  const sr = `${pct(0.0098, SCR_W)} / ${pct(0.0098, SCR_H)}`;
  const inset = { top: pct(BEZEL, PH), bottom: pct(BEZEL, PH), left: pct(BEZEL, PW), right: pct(BEZEL, PW) };
  return (
    <div
      className="fixed inset-0 z-50 transition-opacity ease-out"
      style={{ opacity: stage === "reveal" ? 0 : 1, transitionDuration: "800ms", pointerEvents: stage === "load" ? "auto" : "none" }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(shown)}
    >
      {/* Siluet: tinggi 60% layar (dibatasi lebar di HP) — sama dengan silhouette() di intro.ts */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          height: `min(60dvh, calc(64vw * ${(PH / PW).toFixed(5)}))`,
          aspectRatio: `${PW} / ${PH}`,
          borderRadius: r,
          boxShadow: "0 0 0 300vmax #f2ebe1",
        }}
      >
        {/* Bezel hitam: bayangan lebar dari "lubang" layar, terpotong oleh sudut bodi */}
        <div className="absolute" style={{ ...inset, borderRadius: sr, boxShadow: "0 0 0 80px #050505" }} />
        {/* Tepi titanium */}
        <div className="absolute inset-0" style={{ borderRadius: r, boxShadow: "inset 0 0 0 1.5px #5b5955, inset 0 0 0 3px #2a2927" }} />
        {/* Layar boot: bar progres + persen. Memudar saat "wake" → lock screen 3D di baliknya. */}
        <div
          className="absolute flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-out"
          style={{ ...inset, borderRadius: sr, opacity: stage === "load" ? 1 : 0 }}
        >
          <span className="absolute left-1/2 top-[2%] h-[4.1%] w-[31%] -translate-x-1/2 rounded-full bg-[#050505] ring-1 ring-white/5" />
          <span className="block h-[5px] w-[46%] overflow-hidden rounded-full bg-white/20">
            <span className="block h-full origin-left rounded-full bg-[#fbf3e3]" style={{ transform: `scaleX(${shown / 100})` }} />
          </span>
          <span className="mt-[6%] font-mono text-[clamp(11px,1.6dvh,15px)] tabular-nums text-white/70">{Math.round(shown)}%</span>
        </div>
      </div>
      <p
        className="mono-label absolute inset-x-0 text-center text-ink-soft transition-opacity duration-300"
        style={{ top: "calc(50% + min(30dvh, calc(32vw * 2.0808)) + 18px)", opacity: stage === "load" ? 1 : 0 }}
      >
        {label}
      </p>
    </div>
  );
}

