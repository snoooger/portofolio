"use client";

// Memuat model glTF CC0 (Poly Haven, 1K) dari public/assets-3d dan menyalakan bayangan.
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

export const MODELS = {
  desk: "/assets-3d/models/metal_office_desk/metal_office_desk_1k.gltf",
  flashlight: "/assets-3d/models/vintage_flashlight/vintage_flashlight_1k.gltf",
  radio: "/assets-3d/models/vintage_radio_transceiver/vintage_radio_transceiver_1k.gltf",
  clock: "/assets-3d/models/alarm_clock_01/alarm_clock_01_1k.gltf",
  lamp: "/assets-3d/models/desk_lamp_arm_01/desk_lamp_arm_01.glb",
  binder: "/assets-3d/models/binder_notebook/binder_notebook.glb",
  cctv: "/assets-3d/models/security_camera_01/security_camera_01_1k.gltf",
  plant: "/assets-3d/models/potted_plant_01/potted_plant_01.glb",
  wallClock: "/assets-3d/models/wall_clock/wall_clock_1k.gltf",
} as const;

export function Asset({ src, hide, ...props }: ThreeElements["group"] & { src: string; hide?: string[] }) {
  const { scene } = useGLTF(src);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
      if (hide?.includes(o.name)) o.visible = false;
    });
    return c;
  }, [scene, hide]);
  return (
    <group {...props}>
      <primitive object={obj} />
    </group>
  );
}

// Tidak di-preload global: tiap halaman hanya mengunduh model yang benar-benar dipakai.
