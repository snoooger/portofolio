"use client";

// Pemuat model HD (Sketchfab, CC-BY) yang menskalakan ke ukuran dunia nyata:
// `fit` = panjang sumbu tertentu (meter). Model diletakkan di tengah x/z dengan alas di y = 0.
// `only` menyaring mesh berdasarkan nama (mis. hanya HP dari paket dus Redmi 9).
// `onMesh` memberi akses ke tiap mesh untuk mengganti material (mis. panel layar monitor).
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

export const HD = {
  phone: "/assets-3d/sketchfab/phone.glb",
  macmini: "/assets-3d/sketchfab/macmini.glb",
  display: "/assets-3d/sketchfab/display.glb",
  keyboard: "/assets-3d/sketchfab/keyboard.glb",
  pegboard: "/assets-3d/sketchfab/pegboard.glb",
} as const;

export type Fit = { axis: "x" | "y" | "z"; size: number };

export function Model({
  src,
  fit,
  only,
  onMesh,
  center = true,
  ...props
}: ThreeElements["group"] & {
  src: string;
  fit?: Fit;
  only?: (name: string) => boolean;
  onMesh?: (m: THREE.Mesh) => void;
  center?: boolean;
}) {
  const { scene } = useGLTF(src);
  const obj = useMemo(() => {
    const root = scene.clone(true);
    root.updateMatrixWorld(true);
    const keep: THREE.Mesh[] = [];
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (only && !only(m.name)) {
        m.visible = false;
        return;
      }
      m.castShadow = true;
      m.receiveShadow = true;
      keep.push(m);
    });
    // Bounding box hanya dari mesh yang ditampilkan.
    const box = new THREE.Box3();
    keep.forEach((m) => box.expandByObject(m));
    const size = box.getSize(new THREE.Vector3());
    const s = fit ? fit.size / size[fit.axis] : 1;
    const wrap = new THREE.Group();
    wrap.add(root);
    root.scale.setScalar(s);
    if (center) {
      const c = box.getCenter(new THREE.Vector3());
      root.position.set(-c.x * s, -box.min.y * s, -c.z * s);
    }
    keep.forEach((m) => onMesh?.(m));
    return wrap;
  }, [scene, fit, only, onMesh, center]);
  return (
    <group {...props}>
      <primitive object={obj} />
    </group>
  );
}

Object.values(HD).forEach((m) => useGLTF.preload(m));
