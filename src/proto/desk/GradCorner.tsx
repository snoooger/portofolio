"use client";

// Sudut pendidikan di dinding, sebelah kanan pegboard (perhentian Education): rak dinding kayu oak
// dengan tanaman kecil, di bawah post-it pendidikan.
import type { ThreeElements } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Asset, MODELS } from "../hd/Asset";

/** `position` = titik tengah komposisi di permukaan dinding (z dinding). */
export function GradCorner(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      {/* Rak dinding oak + 2 siku besi */}
      <group position={[0, -0.36, 0]}>
        <RoundedBox args={[0.34, 0.022, 0.15]} radius={0.004} position={[0, 0, 0.075]} castShadow receiveShadow>
          <meshStandardMaterial color="#b98a5a" roughness={0.6} />
        </RoundedBox>
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} position={[x, -0.035, 0.05]} castShadow>
            <boxGeometry args={[0.012, 0.05, 0.1]} />
            <meshStandardMaterial color="#1f2023" metalness={0.6} roughness={0.45} />
          </mesh>
        ))}
        {/* Tanaman kecil, sedikit ke kanan dari tengah rak (di bawah post-it) */}
        <Asset src={MODELS.plant} position={[0.05, 0.011, 0.075]} scale={0.15} />
      </group>
    </group>
  );
}
