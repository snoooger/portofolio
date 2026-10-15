"use client";

import { useEffect, useState } from "react";
import { canvasFont } from "../fonts";

/** Keluarga font tulisan tangan untuk post-it (dimuat sebelum digambar ke canvas). */
export type Hands = { caveat: string; marker: string; kalam: string; patrick: string; shadows: string; gochi: string };
export type HandKey = keyof Hands;

export function useHands() {
  const [hands, set] = useState<Hands | null>(null);
  useEffect(() => {
    Promise.all([
      canvasFont("--font-caveat", "700 80px"),
      canvasFont("--font-marker", "80px"),
      canvasFont("--font-kalam", "700 80px"),
      canvasFont("--font-patrick", "80px"),
      canvasFont("--font-shadows", "80px"),
      canvasFont("--font-gochi", "80px"),
    ]).then(([caveat, marker, kalam, patrick, shadows, gochi]) => set({ caveat, marker, kalam, patrick, shadows, gochi }));
  }, []);
  return hands;
}
