"use client";

// Huruf yang ditempel langsung di dinding/lantai museum (seperti vinyl lettering), bukan kartu DOM.
// Karena berada di ruang 3D, teks otomatis miring mengikuti dinding. Tiap baris muncul bergiliran
// saat kamera berhenti di perhentian `k`. Link berupa teks yang bisa diklik.
import { useRef, type ReactNode } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { P } from "../palette";
import { bell } from "../useScrollProgress";
import type { Drive } from "../objects/types";

// Subset latin: hindari karakter di luar jangkauan (mis. "→", "Δ") supaya troika tidak mengunduh font cadangan.
export const FONT = {
  serif: "/fonts-proto/instrument-serif-latin-400-normal.woff",
  serifItalic: "/fonts-proto/instrument-serif-latin-400-italic.woff",
  sans: "/fonts-proto/inter-tight-latin-400-normal.woff",
  sansMedium: "/fonts-proto/inter-tight-latin-500-normal.woff",
  sansSemi: "/fonts-proto/inter-tight-latin-600-normal.woff",
  sansBold: "/fonts-proto/inter-tight-latin-700-normal.woff",
  mono: "/fonts-proto/jetbrains-mono-latin-500-normal.woff",
  hand: "/fonts-proto/caveat-latin-700-normal.woff",
};

type TextMesh = THREE.Mesh & {
  fillOpacity: number;
  textRenderInfo?: { blockBounds: [number, number, number, number] };
};

export type Item =
  | { kind: "kicker"; text: string }
  | { kind: "title"; text: string; size?: number }
  | { kind: "body"; text: string }
  | { kind: "hand"; text: string }
  | { kind: "medium"; text: string }
  | { kind: "facts"; facts: { v: string; k: string }[] }
  | { kind: "links"; links: { label: string; onClick: () => void; accent?: boolean }[] };

const GAP: Record<Item["kind"], number> = { kicker: 0.07, title: 0.06, body: 0.08, hand: 0.06, medium: 0.08, facts: 0.08, links: 0 };

export function hover(on: boolean) {
  document.body.style.cursor = on ? "pointer" : "";
}

/** Raycast three.js tetap mengenai objek tersembunyi, jadi cek visibilitas sampai ke akar. */
export function shown(o: THREE.Object3D | null): boolean {
  for (let x = o; x; x = x.parent) if (!x.visible) return false;
  return true;
}

/**
 * Blok teks bertumpuk. Satuan = meter dunia pada scale 1 (judul ~0.2 m).
 * Tinggi tiap baris diukur dari hasil layout troika, lalu ditumpuk ke bawah tiap frame.
 */
export function Lettering({
  f,
  k,
  items,
  width = 1.9,
  color = P.ink,
  always = false,
  ...props
}: ThreeElements["group"] & { f: Drive; k: number; items: Item[]; width?: number; color?: string; always?: boolean }) {
  const rows = useRef<THREE.Group[]>([]);
  const shown = useRef(0);

  useFrame((_, dt) => {
    shown.current = THREE.MathUtils.damp(shown.current, always ? 1 : bell(f.current, k, 0.3, 0.7), 5, dt);
    let y = 0;
    rows.current.forEach((g, i) => {
      if (!g) return;
      // Muncul bergiliran dari atas ke bawah.
      const a = THREE.MathUtils.clamp(shown.current * 1.8 - i * 0.14, 0, 1);
      const e = a * a * (3 - 2 * a);
      let h = Number(g.userData.h ?? 0);
      g.traverse((o) => {
        const t = o as TextMesh;
        if (t.textRenderInfo) {
          t.fillOpacity = e;
          if (g.userData.measure !== false) {
            const b = t.textRenderInfo.blockBounds;
            h = Math.max(h, -b[1] - t.position.y);
          }
        }
      });
      g.position.y = y - (1 - e) * 0.06;
      g.visible = e > 0.01;
      y -= h + GAP[items[i].kind];
    });
  });

  return (
    <group {...props}>
      {items.map((it, i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) rows.current[i] = g;
          }}
          userData={it.kind === "facts" ? { h: 0.24, measure: false } : it.kind === "links" ? { h: 0.1, measure: false } : {}}
        >
          <Row item={it} width={width} color={color} />
        </group>
      ))}
    </group>
  );
}

/** Halo lembut berwarna kertas di belakang huruf: menjaga keterbacaan tanpa kotak/border. */
const HALO = { outlineWidth: "9%", outlineBlur: "70%", outlineColor: "#FBF7F1", outlineOpacity: 0 } as const;

export function Row({ item, width, color }: { item: Item; width: number; color: string }): ReactNode {
  const common = { anchorX: "left" as const, anchorY: "top" as const, maxWidth: width, fillOpacity: 0, ...HALO };
  switch (item.kind) {
    case "kicker":
      return <Text {...common} font={FONT.mono} fontSize={0.055} letterSpacing={0.06} color={P.terracottaDark}>{item.text.toUpperCase()}</Text>;
    case "title":
      return <Text {...common} font={FONT.sansBold} fontSize={item.size ?? 0.26} lineHeight={1.02} letterSpacing={-0.02} color={color}>{item.text}</Text>;
    case "body":
      return <Text {...common} font={FONT.sansMedium} fontSize={0.085} lineHeight={1.38} color={color}>{item.text}</Text>;
    case "hand":
      return <Text {...common} font={FONT.serifItalic} fontSize={0.11} color={P.terracottaDark}>{item.text}</Text>;
    case "medium":
      return (
        <group>
          <Text {...common} font={FONT.mono} fontSize={0.045} letterSpacing={0.06} color={P.terracottaDark}>MEDIUM</Text>
          <Text {...common} position={[0.3, 0.008, 0]} maxWidth={width - 0.3} font={FONT.sansMedium} fontSize={0.065} lineHeight={1.35} color={color}>
            {item.text}
          </Text>
        </group>
      );
    case "facts": {
      const col = width / item.facts.length;
      return (
        <group>
          {item.facts.map((x, j) => (
            <group key={x.k} position={[j * col, 0, 0]}>
              <Text {...common} maxWidth={col - 0.05} font={FONT.sansBold} fontSize={0.2} letterSpacing={-0.02} color={color}>{x.v}</Text>
              <Text {...common} position={[0, -0.22, 0]} maxWidth={col - 0.05} font={FONT.mono} fontSize={0.046} letterSpacing={0.03} lineHeight={1.3} color={P.ink}>
                {x.k.toUpperCase()}
              </Text>
            </group>
          ))}
        </group>
      );
    }
    case "links":
      return (
        <group>
          {item.links.map((l, j) => (
            <Text
              key={l.label}
              {...common}
              position={[j * (width / item.links.length), 0, 0]}
              font={FONT.sansSemi}
              fontSize={0.075}
              color={l.accent ? P.terracottaDark : color}
              onClick={(e) => {
                if (!shown(e.eventObject)) return;
                e.stopPropagation();
                l.onClick();
              }}
              onPointerOver={(e) => shown(e.eventObject) && hover(true)}
              onPointerOut={() => hover(false)}
            >
              {`${l.label} \u203A`}
            </Text>
          ))}
        </group>
      );
  }
}
