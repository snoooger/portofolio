"use client";

// Penghubung post-it 3D ↔ popup DOM. Tiap benda bertulisan (post-it, kartu, sertifikat, layar HP)
// mendaftar sebagai "item" milik sebuah section (stop): gambar halamannya, cara mengukur posisinya di
// layar (quad hasil proyeksi), dan cara menyembunyikan dirinya. Popup sebuah section berisi semua
// halaman semua item section itu (urut `order`), dengan tombol sebelumnya/berikutnya/tutup.

export type Quad = { cx: number; cy: number; w: number; h: number; angle: number };

export type PopItem = {
  id: string;
  /** Section pemilik benda ini (boleh berubah, mis. bantalan post-it monitor). */
  stop: () => string;
  /** Urutan di dalam section. */
  order: number;
  /** Halaman gambar (halaman 0 = yang terlihat di benda 3D). */
  pages: () => CanvasImageSource[];
  /** Lebar/tinggi benda (rasio gambar di popup). */
  aspect: () => number;
  alt: (page: number) => string;
  color?: () => string | undefined;
  /** Bentuk popup: kertas (post-it, sedikit miring) atau layar (sudut membulat, tegak). */
  kind?: "paper" | "screen";
  quad: () => Quad | null;
  setHidden: (hidden: boolean) => void;
};

export type Entry = { item: PopItem; page: number };
type Open = { stop: string; entries: Entry[]; start: number };

const items = new Map<string, PopItem>();
let open: Open | null = null;
/** Permintaan tutup dari luar (mis. pengguna scroll saat popup terbuka) + aksi setelahnya. */
let closeReq: (() => void) | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function entriesOf(stop: string): Entry[] {
  return [...items.values()]
    .filter((it) => it.stop() === stop)
    .sort((a, b) => a.order - b.order)
    .flatMap((item) => item.pages().map((_, page) => ({ item, page })));
}

export const popup = {
  register(item: PopItem) {
    items.set(item.id, item);
    emit();
    return () => {
      if (items.get(item.id) === item) items.delete(item.id);
      emit();
    };
  },
  /** Buka semua catatan sebuah section, mulai dari item `startId` (bila ada). */
  openSection(stop: string, startId?: string) {
    if (open) return false;
    const entries = entriesOf(stop);
    if (!entries.length) return false;
    const start = Math.max(0, startId ? entries.findIndex((e) => e.item.id === startId) : 0);
    open = { stop, entries, start };
    emit();
    return true;
  },
  /** Buka section milik item yang diklik. */
  openItem(id: string) {
    const it = items.get(id);
    if (it) popup.openSection(it.stop(), id);
  },
  hasSection: (stop: string) => [...items.values()].some((it) => it.stop() === stop),
  /** Dipanggil NotePopup setelah animasi tutup selesai. */
  closed() {
    open = null;
    const r = closeReq;
    closeReq = null;
    emit();
    r?.();
  },
  /** Minta popup menutup (dengan animasi), lalu jalankan `then`. */
  requestClose(then?: () => void) {
    if (!open) return then?.();
    closeReq = then ?? (() => {});
    emit();
  },
  closeRequested: () => closeReq !== null,
  get: () => open,
  subscribe(f: () => void) {
    subs.add(f);
    return () => void subs.delete(f);
  },
};
