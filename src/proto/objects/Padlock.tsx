"use client";

// Security: gembok terakota. Shackle naik & berputar membuka saat `open` mendekati 1.
import { useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { P } from "../palette";
import type { Drive } from "./types";

type Props = ThreeElements["group"] & { open?: Drive };

export function Padlock({ open, ...props }: Props) {
  const shackle = useRef<THREE.Group>(null);
  const v = useRef(0);

  useFrame((_, dt) => {
    v.current = THREE.MathUtils.damp(v.current, open?.current ?? 0, 7, dt);
    if (!shackle.current) return;
    const lift = THREE.MathUtils.smoothstep(v.current, 0, 0.5);
    const turn = THREE.MathUtils.smoothstep(v.current, 0.45, 1);
    shackle.current.position.y = 0.4 + lift * 0.22;
    shackle.current.rotation.y = -turn * Math.PI * 0.75;
  });

  const metal = <meshStandardMaterial color="#d9d2c6" metalness={0.95} roughness={0.22} />;

  return (
    <group {...props}>
      <RoundedBox args={[1, 0.82, 0.4]} radius={0.1} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial color={P.terracotta} roughness={0.42} metalness={0.05} />
      </RoundedBox>
      {/* Plat depan & lubang kunci */}
      <RoundedBox args={[0.78, 0.6, 0.02]} radius={0.06} position={[0, -0.02, 0.2]}>
        <meshStandardMaterial color={P.terracottaDark} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.04, 0.215]}>
        <circleGeometry args={[0.07, 32]} />
        <meshStandardMaterial color={P.ink} />
      </mesh>
      <mesh position={[0, -0.05, 0.215]}>
        <planeGeometry args={[0.05, 0.16]} />
        <meshStandardMaterial color={P.ink} />
      </mesh>
      {/* Shackle berporos di kaki kanan */}
      <group ref={shackle} position={[0.28, 0.4, 0]}>
        <group position={[-0.28, 0, 0]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <torusGeometry args={[0.28, 0.065, 20, 48, Math.PI]} />
            {metal}
          </mesh>
          {[-0.28, 0.28].map((x) => (
            <mesh key={x} position={[x, 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.065, 0.065, 0.3, 24]} />
              {metal}
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
