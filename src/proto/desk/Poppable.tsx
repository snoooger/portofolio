"use client";

// Pembungkus benda 3D yang bisa diklik untuk dibuka sebagai popup (lihat popup.ts). Ukuran bidang
// benda (w×h, bidang XY lokal grup, pusat di titik asal) dipakai untuk memproyeksikan quad ke layar.
// Saat kursor di atasnya, benda sedikit terangkat & kursor berubah jadi tangan.
import { useEffect, useRef, type ReactNode } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { popup, type PopItem } from "./popup";

const corners = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

export function Poppable({
  id,
  stop,
  order = 0,
  w,
  h,
  image,
  pages,
  alt,
  color,
  kind = "paper",
  enabled = true,
  lift = 0.004,
  onPick,
  children,
}: {
  id: string;
  stop: string | (() => string);
  /** Urutan di dalam section (popup berpindah sesuai urutan ini). */
  order?: number;
  w: number;
  h: number;
  /** Satu halaman (gambar benda). */
  image?: () => CanvasImageSource | null;
  /** Beberapa halaman (mis. lembar-lembar catatan sebuah proyek); halaman 0 = yang terlihat. */
  pages?: () => CanvasImageSource[];
  alt: string | ((page: number) => string);
  color?: string | (() => string | undefined);
  kind?: PopItem["kind"];
  enabled?: boolean;
  /** Seberapa jauh benda terangkat (sumbu z lokal) saat disorot. */
  lift?: number;
  /** Ganti aksi klik (mis. iPhone di perhentian Contact membuka footer). */
  onPick?: () => boolean;
  children: ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const get = useThree((s) => s.get);
  const hover = useRef(false);
  const latest = useRef({ stop, alt, color, image, pages, w, h });
  useEffect(() => {
    latest.current = { stop, alt, color, image, pages, w, h };
  });

  useEffect(() => {
    if (!enabled) return;
    const item: PopItem = {
      id,
      kind,
      stop: () => (typeof latest.current.stop === "function" ? latest.current.stop() : latest.current.stop),
      order,
      pages: () => {
        const L = latest.current;
        if (L.pages) return L.pages();
        const im = L.image?.();
        return im ? [im] : [];
      },
      aspect: () => latest.current.w / latest.current.h,
      alt: (page) => (typeof latest.current.alt === "function" ? latest.current.alt(page) : latest.current.alt),
      color: () => (typeof latest.current.color === "function" ? latest.current.color() : latest.current.color),
      quad: () => {
        const grp = g.current;
        if (!grp) return null;
        const { camera, size } = get();
        grp.updateWorldMatrix(true, false);
        const { w: W, h: H } = latest.current;
        const pts = [
          [-W / 2, H / 2],
          [W / 2, H / 2],
          [W / 2, -H / 2],
          [-W / 2, -H / 2],
        ].map(([x, y], i) => {
          const v = corners[i].set(x, y, 0).applyMatrix4(grp.matrixWorld).project(camera);
          return { x: (v.x * 0.5 + 0.5) * size.width + size.left, y: (-v.y * 0.5 + 0.5) * size.height + size.top };
        });
        const [tl, tr, br, bl] = pts;
        const cx = (tl.x + tr.x + br.x + bl.x) / 4, cy = (tl.y + tr.y + br.y + bl.y) / 4;
        const w = (Math.hypot(tr.x - tl.x, tr.y - tl.y) + Math.hypot(br.x - bl.x, br.y - bl.y)) / 2;
        const h = (Math.hypot(bl.x - tl.x, bl.y - tl.y) + Math.hypot(br.x - tr.x, br.y - tr.y)) / 2;
        const angle = Math.atan2(tr.y - tl.y + (br.y - bl.y), tr.x - tl.x + (br.x - bl.x));
        return { cx, cy, w, h, angle };
      },
      setHidden: (hidden) => {
        if (g.current) g.current.visible = !hidden;
        get().invalidate();
      },
    };
    return popup.register(item);
  }, [id, kind, order, enabled, get]);

  useFrame((_, dt) => {
    const i = inner.current;
    if (!i) return;
    const z = THREE.MathUtils.damp(i.position.z, hover.current ? lift : 0, 14, dt);
    if (Math.abs(z - i.position.z) > 1e-6) {
      i.position.z = z;
      get().invalidate();
    }
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!enabled) return;
    e.stopPropagation();
    if (onPick?.()) return;
    popup.openItem(id);
  };
  return (
    <group
      ref={g}
      onClick={onClick}
      onPointerOver={(e) => {
        if (!enabled) return;
        e.stopPropagation();
        hover.current = true;
        document.body.style.cursor = "pointer";
        get().invalidate();
      }}
      onPointerOut={() => {
        hover.current = false;
        document.body.style.cursor = "";
        get().invalidate();
      }}
    >
      <group ref={inner}>{children}</group>
    </group>
  );
}
