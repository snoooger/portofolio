"use client";

// FarmAgent: rak berisi ponsel Android sungguhan. Saat "Run", layar menyala satu per satu
// lalu menggulir feed seperti akun yang sedang di-warm-up.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { feedTexture } from "../textures";
import { P } from "../palette";
import type { Drive } from "./types";

const W = 0.46, H = 0.92, D = 0.06, GAP = 0.12;

type Props = ThreeElements["group"] & {
  rows?: number;
  cols?: number;
  running: boolean;
  stand?: boolean;
  /** 0 = rapi di rak, 1 = ponsel tersebar (tampilan "exploded"). */
  explode?: Drive;
  onToggle?: () => void;
};

export function PhoneFarm({ rows = 3, cols = 5, running, stand = true, explode, onToggle, ...props }: Props) {
  const base = useMemo(() => feedTexture(), []);
  const phones = useMemo(
    () =>
      Array.from({ length: rows * cols }, (_, i) => {
        const t = base.clone();
        t.needsUpdate = true;
        t.repeat.set(1, 0.51);
        t.offset.y = (i * 0.37) % 1;
        const r = Math.floor(i / cols), c = i % cols;
        return {
          t,
          x: (c - (cols - 1) / 2) * (W + GAP),
          y: ((rows - 1) / 2 - r) * (H + GAP * 1.6),
          delay: (r * cols + c) * 0.07,
          period: 1.3 + ((i * 7) % 5) * 0.25,
          ex: new THREE.Vector3((c - (cols - 1) / 2) * 0.5, ((rows - 1) / 2 - r) * 0.45, ((i * 13) % 7) * 0.22 - 0.5),
          rot: ((i * 5) % 7) * 0.12 - 0.36,
        };
      }),
    [base, rows, cols],
  );
  useEffect(() => () => phones.forEach((p) => p.t.dispose()), [phones]);

  const screens = useRef<THREE.MeshBasicMaterial[]>([]);
  const leds = useRef<THREE.MeshStandardMaterial[]>([]);
  const bodies = useRef<THREE.Group[]>([]);
  const state = useRef(phones.map(() => ({ on: 0, phase: 0, swipes: 0, off: 0 })));
  const since = useRef(99);
  const prev = useRef(running);

  useFrame((_, dt) => {
    if (prev.current !== running) {
      prev.current = running;
      since.current = 0;
    }
    since.current += dt;
    const ex = explode?.current ?? 0;
    phones.forEach((p, i) => {
      const s = state.current[i];
      // Menyala/mati bergelombang mengikuti urutan ponsel di rak.
      const target = running ? (since.current > p.delay ? 1 : 0) : since.current > p.delay * 0.5 ? 0 : 1;
      s.on = THREE.MathUtils.damp(s.on, target, 6, dt);
      if (s.on > 0.5) {
        s.phase += dt;
        if (s.phase > p.period) {
          s.phase = 0;
          s.swipes += 1;
        }
      }
      // Geser layar satu "kartu" per swipe dengan easing.
      s.off = THREE.MathUtils.damp(s.off, s.swipes * 0.23, 9, dt);
      p.t.offset.y = (i * 0.37 - s.off) % 1;
      const m = screens.current[i];
      if (m) m.color.setScalar(0.1 + 0.9 * s.on);
      const l = leds.current[i];
      if (l) {
        l.color.set(s.on > 0.5 ? P.terracotta : "#8b847a");
        l.emissiveIntensity = s.on * 2.2;
      }
      const b = bodies.current[i];
      if (b) {
        b.position.set(p.x + p.ex.x * ex, p.y + p.ex.y * ex, p.ex.z * ex * 2.2);
        b.rotation.set(p.rot * ex * 0.6, p.rot * ex, p.rot * ex * 0.5);
      }
    });
  });

  const totalW = cols * (W + GAP) + 0.1;
  const rowY = (r: number) => ((rows - 1) / 2 - r) * (H + GAP * 1.6) - H / 2 - 0.04;

  return (
    <group {...props}>
      {stand && (
        <group>
          <RoundedBox args={[totalW + 0.2, rows * (H + GAP * 1.6) + 0.2, 0.06]} radius={0.03} position={[0, 0, -0.1]} receiveShadow>
            <meshStandardMaterial color={P.sand} roughness={0.9} />
          </RoundedBox>
          {Array.from({ length: rows }, (_, r) => (
            <mesh key={r} position={[0, rowY(r), 0.02]} castShadow receiveShadow>
              <boxGeometry args={[totalW, 0.05, 0.26]} />
              <meshStandardMaterial color={P.oak} roughness={0.7} />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (totalW / 2 + 0.06), 0, 0]} castShadow>
              <boxGeometry args={[0.06, rows * (H + GAP * 1.6) + 0.3, 0.3]} />
              <meshStandardMaterial color={P.terracottaDark} roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}
      {phones.map((p, i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) bodies.current[i] = g;
          }}
          position={[p.x, p.y, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          onPointerOver={() => onToggle && (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "")}
        >
          <RoundedBox args={[W, H, D]} radius={0.05} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#26221f" roughness={0.35} metalness={0.3} />
          </RoundedBox>
          <mesh position={[0, 0, D / 2 + 0.002]}>
            <planeGeometry args={[W - 0.05, H - 0.07]} />
            <meshBasicMaterial
              ref={(m) => {
                if (m) screens.current[i] = m;
              }}
              map={p.t}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, H / 2 - 0.06, D / 2 + 0.004]}>
            <circleGeometry args={[0.012, 12]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          {stand && (
            <mesh position={[0, -H / 2 - 0.035, 0.12]}>
              <sphereGeometry args={[0.022, 12, 12]} />
              <meshStandardMaterial
                ref={(m) => {
                  if (m) leds.current[i] = m;
                }}
                color="#8b847a"
                emissive={P.terracotta}
                emissiveIntensity={0}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
