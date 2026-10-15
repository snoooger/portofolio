"use client";

// FarmAgent: rak phone farm sungguhan — rak baja hitam 3 tingkat, 5 HP Android (model HD Redmi 9) per tingkat berdiri
// di slot, kabel USB-C ke hub per tingkat. HP menyala bergelombang & menggulir feed saat `run` naik (scroll).
import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Cable } from "../hd/Devices";
import { HD, Model, type Fit } from "./Model";
import { fypFeed } from "./fyp";
import type { Drive } from "../objects/types";
import type { Fonts } from "../final/useFonts";

const COLS = 5, ROWS = 3;
const PH = 0.163; // tinggi Redmi 9 (m)
const PHONE_FIT: Fit = { axis: "z", size: PH };
const PHONE_ONLY = (n: string) => n.includes("Phone1");
// Model Redmi berbaring (layar ke +y, atas ke +z); putar 180° pada sumbu (0,1,1) agar berdiri menghadap +z.
const STAND = new THREE.Quaternion(0, Math.SQRT1_2, Math.SQRT1_2, 0);

/** Satu Redmi 9 (model HD) berdiri, dengan layar feed di atas panelnya. */
function PhoneHD({ map, matRef, ...props }: ThreeElements["group"] & { map: THREE.Texture; matRef: (m: THREE.MeshBasicMaterial | null) => void }) {
  return (
    <group {...props}>
      <group quaternion={STAND} position={[0, PH / 2, 0]}>
        <Model src={HD.phone} fit={PHONE_FIT} only={PHONE_ONLY} />
        <mesh position={[0, 0.0107, 0.001]} rotation={[-Math.PI / 2, 0, Math.PI]}>
          <planeGeometry args={[0.066, 0.146]} />
          <meshBasicMaterial ref={matRef} map={map} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
const GAP_X = 0.088, TIER = 0.2, W = COLS * GAP_X + 0.06, D = 0.2;

function Steel() {
  return <meshPhysicalMaterial color="#222326" metalness={0.75} roughness={0.42} clearcoat={0.2} />;
}

export function PhoneFarmRack({ fonts, run, ...props }: ThreeElements["group"] & { fonts: Fonts; run: Drive }) {
  // 5 kanvas feed dipakai bergantian oleh 15 HP (clone berbagi gambar yang sama di GPU), offset tetap per HP.
  const feeds = useMemo(() => {
    const base = Array.from({ length: 5 }, (_, i) => fypFeed(i, fonts.sans));
    return Array.from({ length: COLS * ROWS }, (_, i) => {
      const t = base[i % base.length].clone();
      t.repeat.set(1, 1 / 6);
      return t;
    });
  }, [fonts]);
  useEffect(() => () => feeds.forEach((t) => t.dispose()), [feeds]);
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const leds = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const st = useRef(feeds.map((_, i) => ({ on: 0, card: i % 6, t: (i * 0.37) % 1, off: (i % 6) / 6 })));

  useFrame((_, dt) => {
    const r = run.current;
    st.current.forEach((s, i) => {
      s.on = THREE.MathUtils.damp(s.on, r > 0.1 + i * 0.035 ? 1 : 0, 5, dt);
      if (s.on > 0.5) {
        s.t += dt / (1.3 + (i % 4) * 0.3);
        if (s.t > 1) {
          s.t = 0;
          s.card = (s.card + 1) % 6;
        }
      }
      let diff = s.card / 6 - s.off;
      if (diff < -0.5) diff += 1;
      s.off = (s.off + diff * Math.min(1, dt * 9) + 1) % 1;
      const m = mats.current[i];
      if (m) {
        if (m.map) m.map.offset.y = 1 - s.off - 1 / 6;
        m.color.setScalar(0.04 + 0.96 * s.on);
      }
      const l = leds.current[i];
      if (l) l.color.set(s.on > 0.5 ? "#7ee08a" : "#333");
    });
  });

  const tierY = (r: number) => r * TIER;
  return (
    <group {...props}>
      {/* Tiang sudut */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <RoundedBox key={`${sx}${sz}`} args={[0.016, ROWS * TIER + 0.04, 0.016]} radius={0.003} position={[(sx * W) / 2, (ROWS * TIER) / 2, (sz * D) / 2]} castShadow>
            <Steel />
          </RoundedBox>
        )),
      )}
      {Array.from({ length: ROWS }, (_, r) => {
        const y = tierY(r);
        return (
          <group key={r} position={[0, y, 0]}>
            {/* Papan tingkat dengan slot */}
            <RoundedBox args={[W, 0.012, D]} radius={0.003} position={[0, 0.006, 0]} castShadow receiveShadow>
              <Steel />
            </RoundedBox>
            <RoundedBox args={[W, 0.02, 0.016]} radius={0.003} position={[0, 0.02, 0.03]} castShadow>
              <Steel />
            </RoundedBox>
            {/* Hub USB di belakang tingkat */}
            <RoundedBox args={[W - 0.08, 0.022, 0.04]} radius={0.004} position={[0, 0.023, -0.07]} castShadow>
              <meshPhysicalMaterial color="#efeeea" roughness={0.35} clearcoat={0.5} />
            </RoundedBox>
            {Array.from({ length: COLS }, (_, c) => {
              const i = r * COLS + c;
              const x = (c - (COLS - 1) / 2) * GAP_X;
              return (
                <group key={c}>
                  <mesh position={[x, 0.035, -0.049]}>
                    <boxGeometry args={[0.006, 0.003, 0.001]} />
                    <meshBasicMaterial
                      ref={(m) => {
                        leds.current[i] = m;
                      }}
                      color="#333"
                      toneMapped={false}
                    />
                  </mesh>
                  <PhoneHD
                    map={feeds[i]}
                    position={[x, 0.012, 0.012]}
                    rotation-x={-0.12}
                    matRef={(m) => {
                      mats.current[i] = m;
                    }}
                  />
                  <Cable from={new THREE.Vector3(x, 0.016, 0.004)} to={new THREE.Vector3(x * 0.85, 0.03, -0.05)} />
                </group>
              );
            })}
          </group>
        );
      })}
      {/* Papan atas */}
      <RoundedBox args={[W, 0.012, D]} radius={0.003} position={[0, ROWS * TIER + 0.006, 0]} castShadow>
        <Steel />
      </RoundedBox>
    </group>
  );
}
