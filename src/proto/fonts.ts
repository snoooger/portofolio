"use client";

/** Nama font dari variabel CSS next/font, lalu tunggu sampai siap dipakai di canvas. */
export async function canvasFont(cssVar: string, sample = "64px") {
  const family = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim() || "serif";
  // Muat lewat nama font utama saja: face "… Fallback" buatan next/font tidak bisa dimuat dan
  // membuat load() menolak seketika — kanvas lalu menggambar dengan font cadangan.
  const primary = family.split(",")[0].trim();
  try {
    await document.fonts.load(`${sample} ${primary}`, "AaBbGg0123");
  } catch {}
  return family;
}
