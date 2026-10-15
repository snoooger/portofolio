"use client";

// Teks 3D penjelasan tiap perhentian, melayang di udara di depan kamera (bukan kartu, bukan tempelan).
// Posisi dihitung dari pose kamera akhir di perhentian itu (frame.ts), jadi saat kamera berhenti teks
// selalu jatuh di area yang dirancang: sisi kosong bingkai di desktop, bagian bawah di HP. Satuan lokal
// blok = setengah tinggi layar pada jarak teks, sehingga ukuran huruf konsisten di layar mana pun.
// Masuk: zoom in dari belakang; keluar: zoom out melewati kamera (mengikuti scroll).
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";
import type { Drive } from "../objects/types";
import type { Copy } from "./copy";
import { summaryFor, type Card } from "./content";
import { DESK_STOPS, poseOf, spanOf, type DeskStop } from "./stops";
import { OBJECT_FRAC, applyFraming, makeAxes } from "./frame";

const FONT = {
  serif: "/fonts-proto/instrument-serif-latin-400-normal.woff",
  bold: "/fonts-proto/inter-tight-latin-700-normal.woff",
  sans: "/fonts-proto/inter-tight-latin-600-normal.woff",
  sansSemi: "/fonts-proto/inter-tight-latin-700-normal.woff",
  mono: "/fonts-proto/jetbrains-mono-latin-500-normal.woff",
};
/**
 * Huruf tebal tanpa kontur/glow, warna dari palet situs. Dua nada sesuai latar di sisi teks:
 * - dark : latar terang (dinding plester, pegboard, kayu) — judul terakota, isi cokelat espresso,
 *          label mustard tua.
 * - light: latar gelap (lantai parket) — judul krem, isi krem, label kuning.
 */
type Theme = { title: string; body: string; soft: string; accent: string };
const THEME: Record<"dark" | "light", Theme> = {
  dark: { title: "#a63f1a", body: "#2a1d14", soft: "#3a2a1e", accent: "#6a470c" },
  light: { title: "#fff3da", body: "#f8ecd4", soft: "#f1e2c4", accent: "#f5c84c" },
};

type TextMesh = THREE.Mesh & { fillOpacity: number; outlineOpacity: number; textRenderInfo?: { blockBounds: [number, number, number, number] } };
type Row =
  | { kind: "kicker" | "title" | "body"; text: string }
  | { kind: "facts"; facts: { v: string; k: string }[] }
  | { kind: "item"; a: string; b: string }
  | { kind: "cta"; label: string; href: string };

const GAP: Record<Row["kind"], number> = { kicker: 0.035, title: 0.05, body: 0.06, facts: 0.04, item: 0.035, cta: 0.04 };
const CTA_H = 0.09;
const sstep = THREE.MathUtils.smoothstep;

/** Gradasi vertikal krem: pekat di bawah, transparan di atas (latar teks di layar potret). */
const SCRIM = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(242,235,225,0)");
  g.addColorStop(0.35, "rgba(242,235,225,0.82)");
  g.addColorStop(1, "rgba(242,235,225,0.94)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

function rowsOf(card: Card): Row[] {
  const rows: Row[] = [{ kind: "kicker", text: card.kicker.toUpperCase() }, { kind: "title", text: card.title }];
  if (card.lines.length) rows.push({ kind: "body", text: card.lines.join(" ") });
  if (card.facts?.length) rows.push({ kind: "facts", facts: card.facts });
  card.list?.forEach((x) => rows.push({ kind: "item", a: x.a, b: x.c ? `${x.b} · ${x.c}` : x.b }));
  card.links?.forEach((l) => rows.push({ kind: "cta", label: l.label, href: l.href }));
  return rows;
}

/** Satu baris/blok huruf (tanpa kontur). */
function T({ children, font, size, color, width, ...props }: { children: string; font: string; size: number; color: string; width?: number; th: Theme } & Record<string, unknown>) {
  return (
    <Text
      font={font}
      fontSize={size}
      color={color}
      maxWidth={width}
      anchorX="left"
      anchorY="top"
      renderOrder={20}
      {...props}
    >
      {children}
      <meshBasicMaterial attach="material" transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </Text>
  );
}

/**
 * Tombol CTA di bawah teks 3D: link HTML sungguhan (drei <Html>) yang menempel pada titik 3D baris ini,
 * jadi klik/tap selalu bekerja seperti link biasa. Opasitas & klik mengikuti animasi teksnya.
 */
function Cta({ label, href, fade }: { label: string; href: string; fade: { current: number } }) {
  const el = useRef<HTMLAnchorElement>(null);
  useFrame(() => {
    const a = el.current;
    if (!a) return;
    const o = fade.current;
    a.style.opacity = String(o);
    a.style.pointerEvents = o > 0.6 ? "auto" : "none";
    a.style.visibility = o > 0.01 ? "visible" : "hidden";
  });
  return (
    <Html position={[0, -0.005, 0]} zIndexRange={[30, 20]} style={{ pointerEvents: "none" }}>
      <a
        ref={el}
        href={href}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[#1d3a2b] bg-[#f5c84c] px-4 py-2 font-sans text-[13px] font-semibold text-[#1d3a2b] shadow-[0_6px_18px_-6px_rgba(16,36,26,0.55)] transition-colors hover:bg-[#1d3a2b] hover:text-[#f5c84c] md:text-[14px]"
        style={{ opacity: 0, visibility: "hidden" }}
      >
        {label}
        <span aria-hidden>↗</span>
      </a>
    </Html>
  );
}

function StopText({ f, k, stop, card, aspect }: { f: Drive; k: number; stop: DeskStop; card: Card; aspect: number }) {
  const portrait = aspect < 1;
  // Jangkar & orientasi dihitung dari pose akhir kamera di perhentian (sama persis dengan DeskScene).
  const frame = useMemo(() => {
    const pose = poseOf(stop, aspect);
    const p = new THREE.Vector3(...pose.pos);
    const l = new THREE.Vector3(...pose.look);
    const ax = makeAxes();
    const fov = applyFraming(p, l, spanOf(stop, aspect), stop.text!.side, 1, aspect, ax);
    const D = Math.min(0.42, p.distanceTo(l) * 0.55);
    const halfH = D * Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const side = stop.text!.side;
    // Kotak teks dalam satuan setengah-tinggi (x: −aspect … +aspect, y: −1 … +1).
    const box = portrait
      ? { x: -0.88 * aspect, y: -0.4, w: 1.76 * aspect, s: 0.82 }
      : side > 0
        ? { x: (-1 + 2 * OBJECT_FRAC + 0.08) * aspect, y: stop.text!.top ?? 0.5, w: (2 - 2 * OBJECT_FRAC - 0.16) * aspect, s: 1 }
        : { x: -0.92 * aspect, y: stop.text!.top ?? 0.5, w: (2 - 2 * OBJECT_FRAC - 0.16) * aspect, s: 1 };
    const anchor = p.clone().addScaledVector(ax.dir, D).addScaledVector(ax.right, box.x * halfH).addScaledVector(ax.up, box.y * halfH);
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(ax.right, ax.up, ax.dir.clone().negate()));
    // Layar potret: gradasi krem selebar layar di belakang teks (dari tepi bawah, memudar ke atas),
    // dalam satuan lokal blok (sudah dibagi skala s), relatif terhadap pojok kiri-atas blok.
    const scrim = portrait
      ? { cx: (-box.x) / box.s, cy: ((-1.05 + box.y + 0.32) / 2 - box.y) / box.s, w: (2 * aspect + 0.2) / box.s, h: (box.y + 0.32 + 1.05) / box.s }
      : null;
    return { anchor, q, halfH, w: box.w / box.s, s: box.s, scrim };
  }, [stop, aspect, portrait]);

  const rows = useMemo(() => rowsOf(card), [card]);
  // Di layar potret teks selalu di atas gradasi krem → nada gelap.
  const th = THEME[portrait ? "dark" : (stop.text!.tone ?? "dark")];
  const scrimMat = useRef<THREE.MeshBasicMaterial>(null);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const ctaFade = useRef(0);

  useFrame((_, dt) => {
    let y = 0;
    const d = f.current - k;
    if (scrimMat.current) {
      // Gradasi baru muncul setelah kamera benar-benar berhenti di perhentian ini (scroll sudah "terkunci"),
      // dan langsung memudar begitu mulai berpindah — tidak ikut terbang bersama teks.
      const m = scrimMat.current;
      const settled = Math.abs(d) < 0.02;
      m.opacity = THREE.MathUtils.damp(m.opacity, settled ? 1 : 0, settled ? 5 : 14, dt);
      m.visible = m.opacity > 0.01;
    }
    refs.current.forEach((g, i) => {
      if (!g) return;
      const a = sstep(d + i * 0.025, -0.55, -0.22); // datang: zoom in dari belakang
      const b = sstep(d - i * 0.025, 0.22, 0.5); // pergi: zoom out ke arah kamera
      const o = a * (1 - b);
      g.visible = o > 0.01;
      let h = 0;
      g.traverse((obj) => {
        const t = obj as TextMesh;
        if (!t.textRenderInfo) return;
        t.fillOpacity = o;
        h = Math.max(h, -t.textRenderInfo.blockBounds[1] - t.position.y);
      });
      if (g.userData.h) h = Math.max(h, g.userData.h as number);
      if (rows[i].kind === "cta") ctaFade.current = o;
      const s = 0.82 + 0.18 * a + 0.5 * b;
      g.scale.setScalar(s);
      g.position.set(0, y, -0.9 * (1 - a) + 0.7 * b);
      y -= (h + GAP[rows[i].kind]) * s;
    });
  });

  const W = frame.w;
  return (
    <group position={frame.anchor} quaternion={frame.q} scale={frame.halfH * frame.s}>
      {frame.scrim && (
        <mesh position={[frame.scrim.cx, frame.scrim.cy, -0.02]} renderOrder={19}>
          <planeGeometry args={[frame.scrim.w, frame.scrim.h]} />
          <meshBasicMaterial ref={scrimMat} map={SCRIM} transparent opacity={0} depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
      {rows.map((r, i) => (
        <group key={i} ref={(g) => void (refs.current[i] = g)} visible={false} userData={r.kind === "facts" ? { h: 0.15 } : r.kind === "cta" ? { h: CTA_H } : {}}>
          {r.kind === "kicker" && (
            // Label section: huruf tebal (bukan mono tipis) supaya tetap terbaca di layar kecil.
            <T font={FONT.bold} size={portrait ? 0.044 : 0.034} color={th.accent} th={th} letterSpacing={0.12} width={W}>
              {r.text}
            </T>
          )}
          {r.kind === "title" && (
            <T font={FONT.bold} size={0.115} color={th.title} th={th} lineHeight={1.0} letterSpacing={-0.025} width={W}>
              {r.text}
            </T>
          )}
          {r.kind === "body" && (
            <T font={FONT.sans} size={portrait ? 0.053 : 0.046} color={th.body} th={th} lineHeight={1.4} width={Math.min(W, 1.05)}>
              {r.text}
            </T>
          )}
          {r.kind === "facts" &&
            r.facts.map((x, j) => {
              const col = Math.min(W / r.facts.length, 0.36);
              return (
                <group key={x.k} position={[j * col, 0, 0]}>
                  <T font={FONT.serif} size={0.088} color={th.title} th={th} width={col}>
                    {x.v}
                  </T>
                  <T font={FONT.mono} size={0.029} color={th.soft} th={th} letterSpacing={0.06} lineHeight={1.25} width={col - 0.03} position={[0, -0.1, 0]}>
                    {x.k.toUpperCase()}
                  </T>
                </group>
              );
            })}
          {r.kind === "cta" && <Cta label={r.label} href={r.href} fade={ctaFade} />}
          {r.kind === "item" && (
            <>
              <T font={FONT.sansSemi} size={0.042} color={th.title} th={th} width={W}>
                {r.a}
              </T>
              <T font={FONT.sans} size={0.036} color={th.soft} th={th} lineHeight={1.35} width={Math.min(W, 1.05)} position={[0, -0.056, 0]}>
                {r.b}
              </T>
            </>
          )}
        </group>
      ))}
    </group>
  );
}

export function DeskText({ f, copy }: { f: Drive; copy: Copy }) {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  return (
    <>
      {DESK_STOPS.map((s, k) => {
        if (!s.text) return null;
        const card = summaryFor(s.id, copy);
        return card ? <StopText key={s.id} f={f} k={k} stop={s} card={card} aspect={aspect} /> : null;
      })}
    </>
  );
}
