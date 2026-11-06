"use client";

// Halaman meja. Mode dipilih sebelum first paint (quality.ts → kelas `lite`): browser tanpa akselerasi
// grafis mendapat versi ringan (StaticDesk); selainnya meja 3D (Desk3D, dimuat malas).
import { Suspense, lazy, useCallback, useState, useSyncExternalStore } from "react";
import { COPY, type Lang } from "./copy";
import { MusicButton, useMusic } from "./Music";
import { StaticDesk } from "./StaticDesk";
import { detectTier, lowerTier, softwareGL, type Tier } from "./quality";
import { PhoneSilhouette } from "./PhoneSilhouette";

const Desk3D = lazy(() => import("./Desk3D"));


// Mode & tier perangkat dideteksi sekali di klien (null saat render server).
let detected: { tier: Tier; light: boolean } | null = null;
const snap = () => {
  if (detected) return detected;
  const light = softwareGL(); // versi ringan tidak perlu deteksi GPU lagi
  return (detected = { tier: light ? "low" : detectTier(), light });
};
const noSubscribe = () => () => {};

/** Tier aktif: hasil deteksi, bisa diturunkan saat FPS jatuh. */
function useDevice() {
  const base = useSyncExternalStore(noSubscribe, snap, () => null);
  const [drops, setDrops] = useState(0);
  let tier = base?.tier ?? null;
  for (let i = 0; tier && i < drops; i++) tier = lowerTier(tier);
  // Tier yang dipaksa lewat ?q= tidak diturunkan (untuk pengujian).
  const decline = useCallback(() => {
    if (!new URLSearchParams(window.location.search).has("q")) setDrops((d) => Math.min(2, d + 1));
  }, []);
  return { base, tier, decline };
}

export function DeskProto() {
  const [lang, setLang] = useState<Lang>("en");
  const copy = COPY[lang];
  const { base, tier, decline } = useDevice();
  const [introDone, setIntroDone] = useState(false);
  const music = useMusic(introDone || !!base?.light);
  const musicBtn = <MusicButton on={music.on} toggle={music.toggle} labels={copy.music} />;

  // Server (base = null): versi ringan + siluet pemuat; CSS (kelas `lite` dari skrip inline) menampilkan
  // salah satunya sejak first paint. Setelah hidrasi, versi yang tidak dipakai dilepas.
  return (
    <>
      {base?.light !== false && (
        <div className="lite-only">
          <StaticDesk copy={copy} lang={lang} setLang={setLang} music={musicBtn} />
        </div>
      )}
      {base === null && (
        // HTML server: hanya siluet pemuat (ringan untuk dihidrasi); kerangka 3D dipasang setelah mode diketahui.
        <div className="desk-only">
          <PhoneSilhouette label={copy.loading} shown={0} stage="load" />
        </div>
      )}
      {base && !base.light && (
        <div className="desk-only">
          <Suspense fallback={<PhoneSilhouette label={copy.loading} shown={0} stage="load" />}>
          <Desk3D copy={copy} lang={lang} setLang={setLang} base={base?.tier ?? null} tier={tier} decline={decline} introDone={introDone} onIntroDone={() => setIntroDone(true)} music={musicBtn} />
          </Suspense>
        </div>
      )}
    </>
  );
}

