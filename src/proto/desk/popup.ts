"use client";

// Penghubung post-it 3D ↔ popup DOM. Tiap benda bertulisan (post-it, kartu, sertifikat, layar HP)
// mendaftar sebagai "item" dengan: gambar kanvas/teksturnya, cara mengukur posisinya di layar (quad
// hasil proyeksi), dan cara menyembunyikan dirinya. Popup menerbangkan salinan gambar dari posisi
// benda ke tengah layar, dan kembali ke posisi yang sama saat ditutup.

export type Quad = { cx: number; cy: number; w: number; h: number; angle: number };

export type PopItem = {
  id: string;
  /** Perhentian (section) pemilik benda ini — menentukan keterangan di popup. */
  stop: () => string;
  image: () => CanvasImageSource | null;
  /** Lebar/tinggi benda (rasio gambar di popup). */
  aspect: () => number;
  alt: () => string;
  color?: () => string | undefined;
  /** Bentuk popup: kertas (post-it, sedikit miring) atau layar (sudut membulat, tegak). */
  kind?: "paper" | "screen";
  quad: () => Quad | null;
  setHidden: (hidden: boolean) => void;
};

type State = { open: PopItem | null };
const items = new Map<string, PopItem>();
/** Item utama tiap perhentian (dibuka oleh tombol "Baca catatan"). */
const primary = new Map<string, string>();
let state: State = { open: null };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const popup = {
  register(item: PopItem, primaryFor?: string) {
    items.set(item.id, item);
    if (primaryFor) primary.set(primaryFor, item.id);
    emit();
    return () => {
      if (items.get(item.id) === item) items.delete(item.id);
      if (primaryFor && primary.get(primaryFor) === item.id) primary.delete(primaryFor);
      emit();
    };
  },
  open(id: string) {
    const it = items.get(id);
    if (!it || state.open || !it.image()) return;
    state = { open: it };
    emit();
  },
  openPrimary(stop: string) {
    const id = primary.get(stop);
    if (id) popup.open(id);
  },
  hasPrimary: (stop: string) => primary.has(stop),
  close() {
    state = { open: null };
    emit();
  },
  get: () => state,
  subscribe(f: () => void) {
    subs.add(f);
    return () => void subs.delete(f);
  },
};
