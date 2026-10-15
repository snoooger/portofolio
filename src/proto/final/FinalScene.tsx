"use client";

// Pengendali kamera prototipe final: satu museum, kamera berjalan dari perhentian ke perhentian
// (lihat FINAL_STOPS). Tidak ada lompatan dunia — semua perpindahan adalah gerak kamera biasa.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { P } from "../palette";
import { stopMix } from "../useScrollProgress";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { MuseumWorld } from "./MuseumWorld";
import { FINAL_STOPS } from "./stops";
import { useFonts } from "./useFonts";
import type { Drive } from "../objects/types";
import type { Copy } from "./copy";

export function FinalScene({ f, copy }: { f: Drive; copy: Copy }) {
  const fonts = useFonts();
  const look = useRef(new THREE.Vector3(...FINAL_STOPS[0].look));
  const vecs = useMemo(
    () => FINAL_STOPS.map((s) => ({ p: new THREE.Vector3(...s.pos), l: new THREE.Vector3(...s.look) })),
    [],
  );
  const tmp = useRef({ p: new THREE.Vector3(), l: new THREE.Vector3() });

  useFrame((state, dt) => {
    const { camera, pointer } = state;
    const { a, b, t } = stopMix(f.current, FINAL_STOPS.length, 0.3);
    const { p, l } = tmp.current;
    p.lerpVectors(vecs[a].p, vecs[b].p, t);
    l.lerpVectors(vecs[a].l, vecs[b].l, t);
    // Saat berpindah antar-section kamera sedikit naik, seperti pengunjung yang melangkah.
    p.y += Math.sin(t * Math.PI) * 0.15;
    // Parallax kursor sebanding jarak pandang, supaya objek dekat (meja, buku tamu) tidak bergeser liar.
    const reach = Math.min(1, p.distanceTo(l) / 7);
    l.x += pointer.x * 0.45 * reach;
    l.y += pointer.y * 0.25 * reach;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, p.x, 4.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, p.y, 4.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, p.z, 4.5, dt);
    look.current.x = THREE.MathUtils.damp(look.current.x, l.x, 4.5, dt);
    look.current.y = THREE.MathUtils.damp(look.current.y, l.y, 4.5, dt);
    look.current.z = THREE.MathUtils.damp(look.current.z, l.z, 4.5, dt);
    camera.lookAt(look.current);
  });

  return (
    <>
      <color attach="background" args={[P.cream]} />
      <fog attach="fog" args={[P.cream, 22, 60]} />
      <MuseumWorld fonts={fonts} f={f} copy={copy} />
      {/* Efek render: ambient occlusion, bloom halus untuk layar, vignette */}
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.2} intensity={0.35} />
        <Vignette offset={0.3} darkness={0.4} />
      </EffectComposer>
    </>
  );
}
