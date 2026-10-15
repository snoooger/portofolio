"use client";

// Sudut kelulusan di dinding, sebelah kanan pegboard (perhentian Education): panji kain "ITPLN 2026"
// dipaku di dinding, rak dinding kayu oak dengan tumpukan buku, topi toga + rumbai, dan tanaman kecil.
import { useEffect, useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Asset, MODELS } from "../hd/Asset";
import type { Fonts } from "../final/useFonts";

/** Panji segitiga: tekstur kain dengan tulisan, sisi kiri lurus (dipaku), ujung kanan meruncing. */
function pennantTexture(f: Fonts) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 400;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#1d3a2b";
  ctx.fillRect(0, 0, 1024, 400);
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * 1024, Math.random() * 400, 2, 2);
  }
  ctx.fillStyle = "#c2552f";
  ctx.fillRect(0, 0, 70, 400);
  ctx.fillStyle = "#f5c84c";
  ctx.textBaseline = "middle";
  ctx.font = `700 150px ${f.sans}`;
  ctx.fillText("ITPLN", 110, 190);
  ctx.fillStyle = "#fbf3e3";
  ctx.font = `500 48px ${f.mono}`;
  ctx.fillText("CLASS OF 2026", 116, 300);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function pennantGeometry(len: number, h: number) {
  const s = new THREE.Shape();
  s.moveTo(0, -h / 2);
  s.lineTo(len, 0);
  s.lineTo(0, h / 2);
  s.closePath();
  const g = new THREE.ShapeGeometry(s, 1);
  const p = g.attributes.position;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    uv[i * 2] = p.getX(i) / len;
    uv[i * 2 + 1] = p.getY(i) / h + 0.5;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

const PAGE = "#f1e9da";
function Book({ w, h, d, color, ...props }: ThreeElements["group"] & { w: number; h: number; d: number; color: string }) {
  return (
    <group {...props}>
      {/* sampul atas & bawah */}
      <RoundedBox args={[w, h * 0.16, d]} radius={0.0015} position={[0, h * 0.42, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[w, h * 0.16, d]} radius={0.0015} position={[0, -h * 0.42, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.7} />
      </RoundedBox>
      {/* punggung buku (kiri) + halaman */}
      <mesh position={[-w / 2 + 0.003, 0, 0]} castShadow>
        <boxGeometry args={[0.006, h, d]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0.002, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.008, h * 0.7, d - 0.006]} />
        <meshStandardMaterial color={PAGE} roughness={0.95} />
      </mesh>
    </group>
  );
}

function Mortarboard(props: ThreeElements["group"]) {
  const black = <meshStandardMaterial color="#141414" roughness={0.55} />;
  return (
    <group {...props}>
      <mesh position={[0, 0.022, 0]} castShadow>
        <cylinderGeometry args={[0.062, 0.068, 0.044, 32]} />
        {black}
      </mesh>
      <mesh position={[0, 0.047, 0]} rotation-y={Math.PI / 4} castShadow receiveShadow>
        <boxGeometry args={[0.19, 0.006, 0.19]} />
        {black}
      </mesh>
      <mesh position={[0, 0.052, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.006, 16]} />
        <meshStandardMaterial color="#f5c84c" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Rumbai kuning menjuntai di tepi */}
      <mesh position={[0.06, 0.05, 0.03]} rotation-z={-0.35}>
        <cylinderGeometry args={[0.0015, 0.0015, 0.07, 6]} />
        <meshStandardMaterial color="#f5c84c" roughness={0.6} />
      </mesh>
      <mesh position={[0.098, 0.006, 0.03]} castShadow>
        <cylinderGeometry args={[0.006, 0.01, 0.04, 12]} />
        <meshStandardMaterial color="#f5c84c" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** `position` = titik tengah komposisi di permukaan dinding (z dinding). */
export function GradCorner({ fonts, ...props }: ThreeElements["group"] & { fonts: Fonts }) {
  const tex = useMemo(() => pennantTexture(fonts), [fonts]);
  const geo = useMemo(() => pennantGeometry(0.3, 0.12), []);
  useEffect(() => () => [tex, geo].forEach((x) => x.dispose()), [tex, geo]);
  return (
    <group {...props}>
      {/* Panji di atas post-it, sedikit miring, dipaku di sisi kiri */}
      <group position={[-0.15, 0.2, 0.004]} rotation-z={-0.06}>
        <mesh geometry={geo} castShadow receiveShadow>
          <meshStandardMaterial map={tex} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.012, 0, 0.004]}>
          <sphereGeometry args={[0.006, 12, 12]} />
          <meshStandardMaterial color="#c9c7c3" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>

      {/* Rak dinding oak + 2 siku besi */}
      <group position={[0, -0.3, 0]}>
        <RoundedBox args={[0.5, 0.022, 0.15]} radius={0.004} position={[0, 0, 0.075]} castShadow receiveShadow>
          <meshStandardMaterial color="#b98a5a" roughness={0.6} />
        </RoundedBox>
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, -0.035, 0.05]} castShadow>
            <boxGeometry args={[0.012, 0.05, 0.1]} />
            <meshStandardMaterial color="#1f2023" metalness={0.6} roughness={0.45} />
          </mesh>
        ))}
        {/* Tumpukan buku + topi toga */}
        <group position={[-0.1, 0.011, 0.075]}>
          <Book w={0.21} h={0.032} d={0.14} color="#1d3a2b" position={[0, 0.016, 0]} rotation-y={0.06} />
          <Book w={0.19} h={0.028} d={0.13} color="#c2552f" position={[0.008, 0.046, 0]} rotation-y={-0.08} />
          <Book w={0.17} h={0.026} d={0.12} color="#2b3550" position={[-0.004, 0.073, 0]} rotation-y={0.12} />
          <Mortarboard position={[0.004, 0.086, 0]} rotation-y={0.5} />
        </group>
        {/* Tanaman kecil di ujung kanan rak */}
        <Asset src={MODELS.plant} position={[0.16, 0.011, 0.075]} scale={0.14} />
      </group>
    </group>
  );
}
