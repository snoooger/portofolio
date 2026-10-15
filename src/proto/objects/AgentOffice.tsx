"use client";

// Sonar: kubus kaca berisi kantor dua lantai. Lima tim agen (research, content, technical,
// growth, approval) bolak-balik antara meja mereka dan meja approval di tengah.
import { useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { Edges, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { P } from "../palette";
import type { Drive } from "./types";

const TEAMS = [
  { color: P.terracotta, desk: [-0.48, -0.42] },
  { color: P.ink, desk: [0.48, -0.42] },
  { color: P.sage, desk: [-0.48, 0.42] },
  { color: P.sky, desk: [0.48, 0.42] },
] as const;

type Props = ThreeElements["group"] & { size?: number; explode?: Drive };

function Agent({ color, desk, floor, seed }: { color: string; desk: readonly [number, number]; floor: number; seed: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.45 + seed;
    // Pergi ke meja approval lalu kembali, dengan jeda di masing-masing ujung.
    const k = THREE.MathUtils.smoothstep(Math.sin(t) * 0.5 + 0.5, 0.2, 0.8);
    const x = THREE.MathUtils.lerp(desk[0] * 0.7, desk[0] * 0.18, k);
    const z = THREE.MathUtils.lerp(desk[1] * 0.7, desk[1] * 0.18, k);
    if (g.current) {
      g.current.position.set(x, floor + 0.11 + Math.abs(Math.sin(t * 9)) * 0.012 * (k > 0.02 && k < 0.98 ? 1 : 0), z);
      g.current.rotation.y = Math.atan2(-desk[0], -desk[1]) + (Math.cos(t) > 0 ? 0 : Math.PI);
    }
  });
  return (
    <group ref={g}>
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.045, 0.07, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={P.paper} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Floor({ y, size }: { y: number; size: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[size * 0.92, 0.04, size * 0.92]} />
        <meshStandardMaterial color={P.paper} roughness={0.8} />
      </mesh>
      {TEAMS.map((t, i) => (
        <group key={i} position={[t.desk[0] * 0.8, 0.06, t.desk[1] * 0.8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.26, 0.08, 0.16]} />
            <meshStandardMaterial color={P.oak} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.09, -0.04]}>
            <boxGeometry args={[0.16, 0.1, 0.012]} />
            <meshStandardMaterial color={P.ink} emissive={t.color} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
      {/* Meja approval di tengah */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.07, 32]} />
        <meshStandardMaterial color={P.terracottaDark} roughness={0.6} />
      </mesh>
    </group>
  );
}

export function AgentOffice({ size = 1.8, explode, ...props }: Props) {
  const top = useRef<THREE.Group>(null);
  const roof = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }, dt) => {
    const ex = explode?.current ?? 0;
    if (top.current) top.current.position.y = THREE.MathUtils.damp(top.current.position.y, ex * size * 0.55, 8, dt);
    if (roof.current) roof.current.position.y = THREE.MathUtils.damp(roof.current.position.y, size / 2 + 0.02 + ex * size * 1.0, 8, dt);
    // Ping sonar: cincin yang mengembang dari atap.
    rings.current.forEach((m, i) => {
      const k = (clock.elapsedTime * 0.5 + i / 3) % 1;
      m.scale.setScalar(0.2 + k * 1.6);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.7;
    });
  });

  const lower = -size / 2 + 0.06;
  const upper = 0.02;

  return (
    <group {...props}>
      {/* Alas */}
      <RoundedBox args={[size + 0.16, 0.12, size + 0.16]} radius={0.04} position={[0, -size / 2 - 0.04, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={P.ink} roughness={0.6} />
      </RoundedBox>

      <Floor y={lower} size={size} />
      {TEAMS.map((t, i) => (
        <Agent key={`a${i}`} color={t.color} desk={t.desk} floor={lower} seed={i * 1.7} />
      ))}

      <group ref={top}>
        <Floor y={upper} size={size} />
        {TEAMS.map((t, i) => (
          <Agent key={`b${i}`} color={t.color} desk={t.desk} floor={upper} seed={i * 2.3 + 0.9} />
        ))}
        {/* Agen approval tetap di tengah lantai atas */}
        <group position={[0, upper + 0.11, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.05, 0.08, 6, 12]} />
            <meshStandardMaterial color={P.terracottaDark} />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color={P.paper} />
          </mesh>
        </group>
      </group>

      {/* Kaca */}
      <RoundedBox args={[size, size, size]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.35}
          roughness={0.06}
          ior={1.2}
          color="#f6f1ea"
          attenuationColor="#f3d9c9"
          attenuationDistance={6}
          clearcoat={1}
          envMapIntensity={1.2}
        />
      </RoundedBox>
      {/* Rangka tipis supaya kaca terbaca di latar terang */}
      <mesh>
        <boxGeometry args={[size * 1.002, size * 1.002, size * 1.002]} />
        <meshBasicMaterial visible={false} />
        <Edges color={P.inkSoft} lineWidth={1.2} />
      </mesh>

      <group ref={roof} position={[0, size / 2 + 0.02, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            rotation-x={-Math.PI / 2}
            ref={(m) => {
              if (m) rings.current[i] = m;
            }}
          >
            <ringGeometry args={[0.36, 0.38, 64]} />
            <meshBasicMaterial color={P.terracotta} transparent depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
