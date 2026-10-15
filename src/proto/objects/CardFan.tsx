"use client";

// PromptedSite: tumpukan kartu website yang mengipas terbuka. Kartu yang disentuh kursor terangkat.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { webCardTexture } from "../textures";
import { P } from "../palette";
import type { Drive } from "./types";

const CW = 0.9, CH = 1.12;

type Props = ThreeElements["group"] & { count?: number; spread?: Drive };

export function CardFan({ count = 7, spread, ...props }: Props) {
  const mats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: P.paper, roughness: 0.9 });
    return Array.from({ length: count }, (_, i) => {
      const front = new THREE.MeshStandardMaterial({ map: webCardTexture(i), roughness: 0.55 });
      return [edge, edge, edge, edge, front, edge];
    });
  }, [count]);
  useEffect(
    () => () =>
      mats.forEach((m) => {
        m[4].map?.dispose();
        m[4].dispose();
      }),
    [mats],
  );

  const cards = useRef<THREE.Group[]>([]);
  const hover = useRef(-1);
  const lift = useRef(mats.map(() => 0));

  useFrame(({ clock }, dt) => {
    const s = spread?.current ?? 1;
    const breathe = Math.sin(clock.elapsedTime * 0.8) * 0.015;
    cards.current.forEach((g, i) => {
      if (!g) return;
      const k = i - (count - 1) / 2;
      lift.current[i] = THREE.MathUtils.damp(lift.current[i], hover.current === i ? 1 : 0, 10, dt);
      g.rotation.z = -k * (0.17 + breathe) * s;
      const inner = g.children[0];
      inner.position.y = CH / 2 + 0.55 * s + lift.current[i] * 0.22;
      inner.position.z = i * 0.014 + lift.current[i] * 0.05;
    });
  });

  return (
    <group {...props}>
      {mats.map((m, i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) cards.current[i] = g;
          }}
          position={[0, -0.75, 0]}
        >
          <mesh
            material={m}
            castShadow
            receiveShadow
            onPointerOver={(e) => {
              e.stopPropagation();
              hover.current = i;
            }}
            onPointerOut={() => hover.current === i && (hover.current = -1)}
          >
            <boxGeometry args={[CW, CH, 0.012]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
