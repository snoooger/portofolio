"use client";

// Sonar: maket kantor virtual di dalam vitrin kaca museum — sesuai produk aslinya yang menampilkan
// tim agen AI sebagai kantor 3D. Lima meja berlabel (Research, Content, Technical, Growth, Approval),
// agen duduk menghadap monitor, dan papan skor SEO/AEO/GEO di dinding belakang.
// Saat `run` naik (scroll), monitor menyala bergiliran dan bar skor tumbuh.
import { useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { P } from "../palette";
import { FONT } from "../final/Lettering";
import type { Drive } from "../objects/types";

const TEAMS = [
  { name: "Research", color: "#8fb3c9", pos: [-0.34, 0.2] },
  { name: "Content", color: "#e9a07f", pos: [0.34, 0.2] },
  { name: "Technical", color: "#9aa58b", pos: [-0.34, -0.12] },
  { name: "Growth", color: "#e3c27a", pos: [0.34, -0.12] },
  { name: "Approval", color: P.terracotta, pos: [0, -0.34] },
] as const;

const FLOOR = 1.0; // sisi lantai maket (m)

function Workstation({ name, color, index, run }: { name: string; color: string; index: number; run: Drive }) {
  const screen = useRef<THREE.MeshBasicMaterial>(null);
  const agent = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    const on = run.current > 0.12 + index * 0.1 ? 1 : 0;
    if (screen.current) {
      const c = screen.current.color;
      const target = new THREE.Color(on ? color : "#202022");
      c.lerp(target, Math.min(1, dt * 6));
    }
    // Agen "mengetik": kepala dan bahu bergerak halus saat aktif.
    if (agent.current) agent.current.position.y = on ? Math.abs(Math.sin(clock.elapsedTime * 6 + index)) * 0.004 : 0;
  });
  return (
    <group>
      {/* Meja */}
      <RoundedBox args={[0.24, 0.012, 0.13]} radius={0.003} position={[0, 0.075, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e8dcc8" roughness={0.6} />
      </RoundedBox>
      {[-0.11, 0.11].map((x) => (
        <mesh key={x} position={[x, 0.035, 0]}>
          <boxGeometry args={[0.008, 0.07, 0.11]} />
          <meshStandardMaterial color="#2a2623" roughness={0.5} />
        </mesh>
      ))}
      {/* Monitor */}
      <mesh position={[0, 0.115, -0.04]} castShadow>
        <boxGeometry args={[0.11, 0.065, 0.006]} />
        <meshStandardMaterial color="#1a1a1c" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.115, -0.0365]}>
        <planeGeometry args={[0.1, 0.056]} />
        <meshBasicMaterial ref={screen} color="#202022" toneMapped={false} />
      </mesh>
      {/* Kursi + agen duduk menghadap monitor */}
      <group position={[0, 0, 0.07]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.06, 0.008, 0.06]} />
          <meshStandardMaterial color="#2a2623" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.085, 0.028]} castShadow>
          <boxGeometry args={[0.06, 0.07, 0.008]} />
          <meshStandardMaterial color="#2a2623" roughness={0.6} />
        </mesh>
        <group ref={agent}>
          <mesh position={[0, 0.088, 0]} castShadow>
            <capsuleGeometry args={[0.02, 0.035, 6, 12]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.135, -0.004]} castShadow>
            <sphereGeometry args={[0.017, 20, 20]} />
            <meshStandardMaterial color="#f3ece2" roughness={0.45} />
          </mesh>
        </group>
      </group>
      {/* Pelat nama tim di lantai depan meja */}
      <Text position={[0, 0.002, 0.135]} rotation-x={-Math.PI / 2} font={FONT.mono} fontSize={0.018} letterSpacing={0.08} color={P.ink}>
        {name.toUpperCase()}
      </Text>
    </group>
  );
}

export function SonarOffice({ run, ...props }: ThreeElements["group"] & { run: Drive }) {
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((_, dt) => {
    bars.current.forEach((b, i) => {
      if (!b) return;
      // Skor tumbuh setelah tim approval menyala (urutan kerja nyata Sonar: scan → perbaikan → ukur).
      const target = THREE.MathUtils.clamp((run.current - 0.6 - i * 0.05) / 0.3, 0.08, 1) * (0.55 + i * 0.12);
      b.scale.x = THREE.MathUtils.damp(b.scale.x, target, 4, dt);
      b.position.x = -0.11 + (b.scale.x * 0.32) / 2;
    });
  });

  return (
    <group {...props}>
      {/* Alas vitrin */}
      <RoundedBox args={[FLOOR + 0.08, 0.06, FLOOR + 0.08]} radius={0.01} position={[0, 0.03, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#2a2623" roughness={0.5} />
      </RoundedBox>
      {/* Lantai kantor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.062, 0]} receiveShadow>
        <planeGeometry args={[FLOOR, FLOOR]} />
        <meshStandardMaterial color="#cfc3b1" roughness={0.85} />
      </mesh>
      {/* Dinding belakang + papan skor */}
      <mesh position={[0, 0.2, -FLOOR / 2 + 0.01]} receiveShadow>
        <boxGeometry args={[FLOOR, 0.28, 0.02]} />
        <meshStandardMaterial color="#f7f2ea" roughness={0.9} />
      </mesh>
      <group position={[0, 0.22, -FLOOR / 2 + 0.024]}>
        <mesh>
          <planeGeometry args={[0.46, 0.2]} />
          <meshStandardMaterial color="#1c1c1f" roughness={0.4} />
        </mesh>
        {["SEO", "AEO", "GEO"].map((k, i) => (
          <group key={k} position={[0, 0.05 - i * 0.05, 0.002]}>
            <Text position={[-0.2, 0, 0]} anchorX="left" font={FONT.mono} fontSize={0.022} color="#f3ece2">
              {k}
            </Text>
            <mesh position={[0.05, 0, 0]}>
              <planeGeometry args={[0.32, 0.016]} />
              <meshBasicMaterial color="#2c2c30" />
            </mesh>
            <mesh
              ref={(m) => {
                bars.current[i] = m;
              }}
              position={[-0.11, 0, 0.001]}
              scale={[0.08, 1, 1]}
            >
              <planeGeometry args={[0.32, 0.016]} />
              <meshBasicMaterial color={P.terracottaLight} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
      <group position={[0, 0.062, 0.05]}>
        {TEAMS.map((t, i) => (
          <group key={t.name} position={[t.pos[0], 0, t.pos[1]]}>
            <Workstation name={t.name} color={t.color} index={i} run={run} />
          </group>
        ))}
      </group>
      {/* Vitrin kaca */}
      <mesh position={[0, 0.06 + 0.24, 0]}>
        <boxGeometry args={[FLOOR + 0.06, 0.48, FLOOR + 0.06]} />
        <meshPhysicalMaterial transparent opacity={0.12} roughness={0.02} metalness={0} clearcoat={1} color="#eef4f6" envMapIntensity={1.4} depthWrite={false} />
      </mesh>
    </group>
  );
}
