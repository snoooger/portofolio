"use client";

// Barang-barang pribadi di meja: mug, pensil, sticky note, kertas judul.
import { useEffect, useMemo } from "react";
import { type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { noteTexture } from "../textures";
import { P } from "../palette";

type G = ThreeElements["group"];

export function Mug(props: G) {
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.3, 0),
      new THREE.Vector2(0.32, 0.02),
      new THREE.Vector2(0.32, 0.62),
      new THREE.Vector2(0.29, 0.62),
      new THREE.Vector2(0.29, 0.05),
      new THREE.Vector2(0, 0.05),
    ];
    return new THREE.LatheGeometry(pts, 48);
  }, []);
  return (
    <group {...props}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={P.paper} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.322, 0.322, 0.12, 48, 1, true]} />
        <meshStandardMaterial color={P.terracotta} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.29, 48]} />
        <meshStandardMaterial color="#3a2417" roughness={0.15} />
      </mesh>
      <mesh position={[0.34, 0.32, 0]} castShadow>
        <torusGeometry args={[0.13, 0.035, 16, 32, Math.PI]} />
        <meshStandardMaterial color={P.paper} roughness={0.35} />
      </mesh>
    </group>
  );
}

/** Pensil heksagonal. `eraser` menambah penghapus merah muda di ujung belakang (pensil kuning klasik). */
export function Pencil({ color = P.terracotta, eraser = false, ...props }: G & { color?: string; eraser?: boolean }) {
  return (
    <group {...props}>
      <mesh rotation-z={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 1.4, 6]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh rotation-z={-Math.PI / 2} position={[0.8, 0, 0]} castShadow>
        <coneGeometry args={[0.045, 0.2, 6]} />
        <meshStandardMaterial color={P.oak} roughness={0.8} />
      </mesh>
      {/* Ujung grafit */}
      <mesh rotation-z={-Math.PI / 2} position={[0.875, 0, 0]}>
        <coneGeometry args={[0.0125, 0.05, 6]} />
        <meshStandardMaterial color="#2b2b2e" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[-0.74, 0, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.047, 0.047, 0.08, 12]} />
        <meshStandardMaterial color="#c9c2b6" metalness={0.8} roughness={0.3} />
      </mesh>
      {eraser && (
        <mesh position={[-0.82, 0, 0]} rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.044, 0.044, 0.09, 12]} />
          <meshStandardMaterial color="#e9a3a0" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}

export function StickyNote({ lines, color = "#F4D9A6", hand, ...props }: G & { lines: string[]; color?: string; hand: string }) {
  const t = useMemo(() => noteTexture(lines, color, hand), [lines, color, hand]);
  useEffect(() => () => t.dispose(), [t]);
  return (
    <mesh {...(props as ThreeElements["mesh"])} receiveShadow castShadow>
      <boxGeometry args={[0.9, 0.9, 0.006]} />
      {[0, 1, 2, 3].map((i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} color={color} />
      ))}
      <meshStandardMaterial attach="material-4" map={t} roughness={0.9} />
      <meshStandardMaterial attach="material-5" color={color} />
    </mesh>
  );
}

/** Lembar kertas dengan tekstur siap pakai (judul hero, sertifikat, dll). */
export function Sheet({ map, w = 3.2, h = 2.2, ...props }: G & { map: THREE.Texture; w?: number; h?: number }) {
  return (
    <group {...props}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.008]} />
        {[0, 1, 2, 3, 5].map((i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color={P.paper} />
        ))}
        <meshStandardMaterial attach="material-4" map={map} roughness={0.85} />
      </mesh>
    </group>
  );
}
