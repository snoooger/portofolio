"use client";

/** Nama font dari variabel CSS next/font, lalu tunggu sampai siap dipakai di canvas. */
export async function canvasFont(cssVar: string, sample = "64px") {
  const family = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim() || "serif";
  try {
    await document.fonts.load(`${sample} ${family}`);
  } catch {}
  return family;
}
