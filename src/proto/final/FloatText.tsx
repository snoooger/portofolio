"use client";

// Teks 3D yang melayang di ruang (tidak menempel di dinding/lantai). Posisinya ditentukan relatif
// terhadap pose kamera di perhentian `k`, menghadap kamera. Saat scroll mendekat teks "zoom in"
// (datang dari jauh, membesar), saat scroll menjauh teks "zoom out" (melewati kamera lalu hilang).
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { P } from "../palette";
import { Row, type Item } from "./Lettering";
import type { Drive } from "../objects/types";
import type { FinalStop } from "./stops";

type TextMesh = THREE.Mesh & { fillOpacity: number; outlineOpacity: number; textRenderInfo?: { blockBounds: [number, number, number, number] } };

const GAP: Record<Item["kind"], number> = { kicker: 0.08, title: 0.09, body: 0.07, hand: 0.07, medium: 0.09, facts: 0.1, links: 0.05 };
const sstep = (x: number, a: number, b: number) => THREE.MathUtils.smoothstep(x, a, b);

export function FloatText({
  f,
  k,
  stop,
  rx,
  ry,
  dist = 1.5,
  yaw = 0,
  scale = 0.42,
  width = 2.2,
  items,
}: {
  f: Drive;
  k: number;
  stop: FinalStop;
  /** Tepi kiri blok di sumbu kanan-kamera (meter, pada jarak `dist`). */
  rx: number;
  /** Tepi atas blok di sumbu atas-kamera. */
  ry: number;
  dist?: number;
  yaw?: number;
  scale?: number;
  width?: number;
  items: Item[];
}) {
  // Posisi & orientasi blok dihitung sekali dari pose kamera di perhentian.
  const frame = useMemo(() => {
    const pos = new THREE.Vector3(...stop.pos);
    const fwd = new THREE.Vector3(...stop.look).sub(pos).normalize();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, fwd).normalize();
    const anchor = pos.clone().addScaledVector(fwd, dist).addScaledVector(right, rx).addScaledVector(up, ry);
    const m = new THREE.Matrix4().makeBasis(right, up, fwd.clone().negate());
    const q = new THREE.Quaternion().setFromRotationMatrix(m);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw));
    return { anchor, q };
  }, [stop, rx, ry, dist, yaw]);

  const rows = useRef<THREE.Group[]>([]);

  useFrame(() => {
    let y = 0;
    rows.current.forEach((g, i) => {
      if (!g) return;
      // Terbaca penuh selama kamera diam di perhentian (|d| < 0.28); masuk & keluar di luar itu.
      const d = f.current - k;
      const a = sstep(d + i * 0.02, -0.5, -0.28); // masuk: zoom in
      const b = sstep(d - i * 0.02, 0.3, 0.52); // keluar: zoom out
      const o = a * (1 - b);
      let h = Number(g.userData.h ?? 0);
      g.traverse((obj) => {
        const t = obj as TextMesh;
        if (t.textRenderInfo) {
          t.fillOpacity = o;
          t.outlineOpacity = o * 0.55;
          if (g.userData.measure !== false) h = Math.max(h, -t.textRenderInfo.blockBounds[1] - t.position.y);
        }
      });
      const s = (0.7 + 0.3 * a) * (1 + 0.45 * b);
      g.scale.setScalar(s);
      // Jauh di belakang saat datang, melaju ke arah kamera saat pergi (satuan lokal blok).
      g.position.set(0, y, -2.2 * (1 - a) + 2.4 * b);
      g.visible = o > 0.01;
      y -= (h + GAP[items[i].kind]) * s;
    });
  });

  return (
    <group position={frame.anchor} quaternion={frame.q} scale={scale}>
      {items.map((it, i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) rows.current[i] = g;
          }}
          userData={it.kind === "facts" ? { h: 0.3, measure: false } : it.kind === "links" ? { h: 0.1, measure: false } : {}}
        >
          <Row item={it} width={width} color={P.ink} />
        </group>
      ))}
    </group>
  );
}
