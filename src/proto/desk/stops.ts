// Jalur kamera prototipe meja: dari atas (top-down) untuk benda di permukaan meja, miring 3/4 untuk
// benda yang berdiri (rak HP, monitor) dan papan gabus di dinding. Satuan meter; permukaan meja y = TOP.

export type V3 = [number, number, number];
/** `span`: lebar konten (m) di sekitar titik `look` yang harus tetap masuk bingkai di layar sempit (HP). */
/**
 * Satu perhentian kamera. `pos`/`look` memusatkan objek utama; `span` = lebar objek (m).
 * `text`: sisi tempat teks 3D penjelasan (desktop). Kamera otomatis digeser supaya objek mengisi sisi
 * lain bingkai; di layar potret objek naik ke atas dan teks di bawah. Lihat `frame.ts`.
 */
export type Tone = "dark" | "light";
/** `tone`: nada teks sesuai latar di sisi teks (dark di dinding/pegboard, light di kayu/lantai). */
export type DeskStop = {
  id: string;
  pos: V3;
  look: V3;
  span: number;
  text?: { side: 1 | -1; top?: number; tone?: Tone; portraitTone?: Tone };
};

export const TOP = 0.75;
export const DESK = { w: 2.4, d: 1.1 };
export const WALL_Z = -0.78;

export const SPOT = {
  rack: [-0.8, -0.24] as const,
  monitor: [0.1, -0.2] as const,
  mat: [-0.05, 0.28] as const, // cutting mat (pusat hero)
  paper: [-0.15, 0.28] as const,
  about: [0.27, 0.28] as const,
  skills: [-0.9, 0.3] as const,
  phone: [0.64, 0.27] as const,
};

/** Tinggi pusat pegboard. */
export const BOARD_Y = TOP + 1.05;

export const DESK_STOPS: DeskStop[] = [
  // Hero ala P1: hampir tegak lurus di atas cutting mat; kertas "Portofolio" di tengah.
  { id: "hero", pos: [-0.05, TOP + 1.32, 0.78], look: [-0.05, TOP, 0.22], span: 0.86 },
  { id: "about", pos: [0.28, TOP + 0.6, 0.66], look: [0.28, TOP, 0.31], span: 0.36, text: { side: 1, top: -0.2 } },
  // Zoom ke pelat label atas rak: post-it FarmAgent + post-it hasil (100M views / 100K followers)
  // terbaca bersamaan dengan teks 3D di sebelah kirinya — pola yang sama dengan Skills.
  { id: "farmagent", pos: [-0.5, TOP + 0.85, 0.72], look: [-0.8, TOP + 0.63, -0.16], span: 0.62, text: { side: -1, top: 0.3 } },
  // Monitor: pusat panel layar di x 0.1, y TOP+0.30. Teks 3D di kanan atas, di depan dinding putih
  // (bukan di depan meja & Mac mini) supaya kontras dan mudah dibaca.
  { id: "sonar", pos: [0.08, TOP + 0.4, 0.62], look: [0.1, TOP + 0.25, -0.18], span: 0.66, text: { side: 1, top: 0.45 } },
  { id: "promptedsite", pos: [0.1, TOP + 0.4, 0.61], look: [0.11, TOP + 0.25, -0.18], span: 0.66, text: { side: 1, top: 0.45 } },
  { id: "viralengine", pos: [0.08, TOP + 0.4, 0.62], look: [0.1, TOP + 0.25, -0.18], span: 0.66, text: { side: 1, top: 0.45 } },
  { id: "security", pos: [0.1, TOP + 0.4, 0.61], look: [0.11, TOP + 0.25, -0.18], span: 0.66, text: { side: 1, top: 0.45 } },
  { id: "skills", pos: [-0.9, TOP + 0.48, 0.56], look: [-0.9, TOP, 0.3], span: 0.42, text: { side: -1, tone: "light" } },
  // Pegboard: teks di dinding polos di sebelah kiri (pengalaman) / kanan (pendidikan).
  { id: "experience", pos: [-0.76, BOARD_Y - 0.05, WALL_Z + 1.28], look: [-0.76, BOARD_Y - 0.06, WALL_Z], span: 0.72, text: { side: -1, top: -0.12 } },
  { id: "certificates", pos: [0.12, BOARD_Y + 0.02, WALL_Z + 1.0], look: [0.12, BOARD_Y + 0.02, WALL_Z], span: 1.1, text: { side: 1, top: 0.2 } },
  { id: "education", pos: [1.56, BOARD_Y - 0.06, WALL_Z + 0.9], look: [1.54, BOARD_Y - 0.1, WALL_Z], span: 0.62, text: { side: 1, top: 0.3 } },
  // Kontak & footer di layar iPhone
  { id: "contact", pos: [0.645, TOP + 0.25, 0.322], look: [0.642, TOP, 0.262], span: 0.11, text: { side: -1 } },
];

export const deskIndex = (id: string) => DESK_STOPS.findIndex((s) => s.id === id);
