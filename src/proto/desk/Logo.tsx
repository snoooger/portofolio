"use client";

// Logo situs (sama dengan favicon): kotak krem membulat, huruf Z tinta, titik terakota.
// `fill` 0–1 mengisi kotak dengan "cairan" terakota bergelombang dari bawah (dipakai layar pemuatan).
import { useId } from "react";

export function Logo({ size = 36, fill, className }: { size?: number; fill?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const level = fill === undefined ? null : 64 - Math.max(0, Math.min(1, fill)) * 64;
  // Gelombang dua periode lebih lebar dari kotak, digeser horizontal terus-menerus (lihat keyframes di bawah).
  const wave = (y: number) => `M-64 ${y} q8 -3 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 V70 H-64 Z`;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden>
      <defs>
        <clipPath id={`c${id}`}>
          <rect width="64" height="64" rx="14" />
        </clipPath>
      </defs>
      <rect width="64" height="64" rx="14" fill="#f2ebe1" />
      {level !== null && (
        <g clipPath={`url(#c${id})`}>
          <path d={wave(level)} fill="#c2552f" opacity="0.92" style={{ animation: "logo-wave 1.6s linear infinite", transition: "d 0.4s ease" }} />
          <path d={wave(level + 2.5)} fill="#a63f1a" opacity="0.55" style={{ animation: "logo-wave 2.4s linear infinite reverse" }} />
        </g>
      )}
      <path d="M20 19 H44 L20 45 H44" fill="none" stroke="#1e1b18" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="50" cy="45" r="4" fill={level !== null && level < 49 ? "#f5c84c" : "#c2552f"} />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="13.5" fill="none" stroke="rgba(30,27,24,0.18)" strokeWidth="1.5" />
      <style>{`@keyframes logo-wave { from { transform: translateX(0) } to { transform: translateX(32px) } }`}</style>
    </svg>
  );
}
