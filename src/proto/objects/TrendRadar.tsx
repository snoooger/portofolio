"use client";

// ViralEngine: layar radar bundar. Sapuan berputar; setiap sinyal yang tersapu naik menjadi
// batang tren. Terakota = sudah viral, kertas = berpotensi viral (velocity sedang naik).
import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { sweepTexture } from "../textures";
import { P } from "../palette";
import type { Drive } from "./types";

const R = 0.9;

type Props = ThreeElements["group"] & { energy?: Drive };

export function TrendRadar({ energy, ...props }: Props) {
  const sweep = useMemo(() => sweepTexture(), []);
  useEffect(() => () => sweep.dispose(), [sweep]);
  const blips = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const a = (i * 2.399) % (Math.PI * 2);
        const r = 0.22 + ((i * 0.37) % 0.6);
        return { a, r, viral: i % 3 === 0, peak: 0.25 + ((i * 0.53) % 0.5) };
      }),
    [],
  );
  const sweepRef = useRef<THREE.Mesh>(null);
  const dish = useRef<THREE.Group>(null);
  const bars = useRef<THREE.Mesh[]>([]);
  const heat = useRef(blips.map(() => 0));
  const angle = useRef(0);

  useFrame((_, dt) => {
    const e = energy?.current ?? 1;
    angle.current = (angle.current + dt * 1.4) % (Math.PI * 2);
    if (sweepRef.current) sweepRef.current.rotation.z = angle.current;
    if (dish.current) dish.current.rotation.y += dt * 0.6;
    blips.forEach((b, i) => {
      // Selisih sudut antara sapuan dan sinyal: kena sapuan → panas naik, lalu meluruh.
      const diff = (angle.current - b.a + Math.PI * 4) % (Math.PI * 2);
      if (diff < 0.12) heat.current[i] = 1;
      heat.current[i] = Math.max(0, heat.current[i] - dt * (b.viral ? 0.35 : 0.6));
      const m = bars.current[i];
      if (m) {
        const h = 0.02 + b.peak * (0.25 + 0.75 * heat.current[i]) * e;
        m.scale.y = h;
        m.position.y = 0.11 + h / 2;
      }
    });
  });

  return (
    <group {...props}>
      {/* Alas */}
      <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R + 0.12, R + 0.18, 0.2, 64]} />
        <meshStandardMaterial color={P.sand} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.085, 0]} receiveShadow>
        <cylinderGeometry args={[R, R, 0.02, 64]} />
        <meshStandardMaterial color="#201c19" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Cincin jarak */}
      {[0.3, 0.6, 0.88].map((r) => (
        <mesh key={r} position={[0, 0.097, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[r - 0.005, r + 0.005, 96]} />
          <meshBasicMaterial color={P.terracottaLight} transparent opacity={0.55} toneMapped={false} />
        </mesh>
      ))}
      {[0, Math.PI / 2].map((a) => (
        <mesh key={a} position={[0, 0.097, 0]} rotation={[-Math.PI / 2, 0, a]}>
          <planeGeometry args={[R * 2, 0.008]} />
          <meshBasicMaterial color={P.terracottaLight} transparent opacity={0.35} toneMapped={false} />
        </mesh>
      ))}
      {/* Sapuan */}
      <mesh ref={sweepRef} position={[0, 0.1, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[R - 0.01, 96]} />
        <meshBasicMaterial map={sweep} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {/* Batang tren */}
      {blips.map((b, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) bars.current[i] = m;
          }}
          position={[Math.cos(b.a) * b.r, 0.2, -Math.sin(b.a) * b.r]}
          castShadow
        >
          <boxGeometry args={[0.06, 1, 0.06]} />
          <meshStandardMaterial
            color={b.viral ? P.terracotta : P.paper}
            emissive={b.viral ? P.terracotta : P.terracottaLight}
            emissiveIntensity={b.viral ? 0.5 : 0.15}
          />
        </mesh>
      ))}
      {/* Antena parabola kecil di tepi */}
      <group position={[R + 0.05, 0.08, -0.35]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.03, 0.4, 12]} />
          <meshStandardMaterial color={P.ink} />
        </mesh>
        <group ref={dish} position={[0, 0.42, 0]}>
          <mesh rotation-x={-Math.PI / 3} castShadow>
            <sphereGeometry args={[0.2, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
            <meshStandardMaterial color={P.paper} side={THREE.DoubleSide} roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
