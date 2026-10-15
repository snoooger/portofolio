"use client";

import { EffectComposer, Bloom, SSAO, Vignette } from "@react-three/postprocessing";
import type { Quality } from "./quality";

/** Efek layar sesuai tier: AO + bloom + vignette (high), bloom (mid), tanpa post (low). */
export function Post({ mode }: { mode: Quality["post"] }) {
  if (mode === "none") return null;
  if (mode === "bloom")
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.2} intensity={0.3} />
      </EffectComposer>
    );
  return (
    <EffectComposer multisampling={4} enableNormalPass>
      {/* Ambient occlusion: sudut & sela antar benda menggelap halus (skala meja, satuan meter) */}
      <SSAO
        samples={16}
        rings={5}
        radius={0.05}
        intensity={14}
        luminanceInfluence={0.6}
        bias={0.02}
        worldDistanceThreshold={3}
        worldDistanceFalloff={1}
        worldProximityThreshold={0.03}
        worldProximityFalloff={0.02}
        color="#2a1d12"
      />
      <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.2} intensity={0.3} />
      <Vignette offset={0.3} darkness={0.35} />
    </EffectComposer>
  );
}
