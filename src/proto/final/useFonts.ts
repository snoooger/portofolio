"use client";

import { useEffect, useState } from "react";
import { canvasFont } from "../fonts";

export type Fonts = { serif: string; sans: string; mono: string; hand: string };

/** Tunggu keempat font siap sebelum menggambar tekstur canvas. */
export function useFonts() {
  const [fonts, set] = useState<Fonts | null>(null);
  useEffect(() => {
    Promise.all([
      canvasFont("--font-instrument-serif", "96px"),
      canvasFont("--font-inter-tight", "600 34px"),
      canvasFont("--font-jetbrains-mono", "500 30px"),
      canvasFont("--font-caveat", "700 90px"),
      canvasFont("--font-instrument-serif", "italic 96px"), // kertas hero: "folio" miring
    ]).then(([serif, sans, mono, hand]) => set({ serif, sans, mono, hand }));
  }, []);
  return fonts;
}
