// Jalur kamera prototipe meja: dari atas (top-down) untuk benda di permukaan meja, miring 3/4 untuk
// benda yang berdiri (rak HP, monitor) dan papan gabus di dinding. Satuan meter; permukaan meja y = TOP.

export type V3 = [number, number, number];
/**
 * Satu perhentian kamera. `pos`/`look` memusatkan objek utama (penjelasan ada di benda itu sendiri:
 * post-it/layar yang bisa dibuka sebagai popup); `span` = lebar objek (m) yang harus masuk bingkai.
 */
export type DeskStop = {
  id: string;
  pos: V3;
  look: V3;
  span: number;
  /** Pose & lebar khusus layar potret (HP), bila pose umum membuat objek terhalang/terpotong di sana. */
  portrait?: { pos: V3; look: V3; span?: number };
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
  // About: iPhone di meja membuka profil Instagram. Kamera di belakang sisi bawah HP (HP tampil tegak).
  { id: "about", pos: [0.62, TOP + 0.235, 0.375], look: [0.64, TOP + 0.004, 0.27], span: 0.1,
    portrait: { pos: [0.624, TOP + 0.19, 0.35], look: [0.64, TOP + 0.004, 0.27], span: 0.088 } },
  // Zoom ke pelat label atas rak: post-it FarmAgent + post-it hasil (100M views / 100K followers).
  { id: "farmagent", pos: [-0.5, TOP + 0.85, 0.72], look: [-0.8, TOP + 0.63, -0.16], span: 0.62 },
  // Monitor: pusat panel layar di x 0.1, y TOP+0.30; tumpukan post-it di bezel kiri-bawah.
  { id: "sonar", pos: [0.08, TOP + 0.38, 0.52], look: [0.1, TOP + 0.24, -0.18], span: 0.66 },
  { id: "promptedsite", pos: [0.1, TOP + 0.38, 0.51], look: [0.11, TOP + 0.24, -0.18], span: 0.66 },
  { id: "viralengine", pos: [0.08, TOP + 0.38, 0.52], look: [0.1, TOP + 0.24, -0.18], span: 0.66 },
  { id: "security", pos: [0.1, TOP + 0.38, 0.51], look: [0.11, TOP + 0.24, -0.18], span: 0.66 },
  { id: "skills", pos: [-0.9, TOP + 0.48, 0.56], look: [-0.9, TOP, 0.3], span: 0.42 },
  // Pegboard: kartu pengalaman & post-it alat (kiri), sertifikat (tengah), sudut kelulusan (kanan).
  { id: "experience", pos: [-0.76, BOARD_Y + 0.35, WALL_Z + 1.23], look: [-0.76, BOARD_Y, WALL_Z], span: 0.8,
    // Kamera agak tinggi (menunduk ±15°/27°) supaya pelat atas rak FarmAgent di depan pegboard tidak menutupi
    // baris bawah post-it alat; di HP kamera mundur lebih jauh sehingga perlu lebih tinggi & sedikit zoom out.
    portrait: { pos: [-0.76, BOARD_Y + 0.65, WALL_Z + 1.18], look: [-0.76, BOARD_Y + 0.04, WALL_Z], span: 0.95 } },
  { id: "certificates", pos: [0.12, BOARD_Y + 0.02, WALL_Z + 1.0], look: [0.12, BOARD_Y + 0.02, WALL_Z], span: 1.1 },
  { id: "education", pos: [1.47, BOARD_Y - 0.06, WALL_Z + 0.9], look: [1.47, BOARD_Y - 0.1, WALL_Z], span: 0.62 },
  // Kontak & footer di layar iPhone
  { id: "contact", pos: [0.645, TOP + 0.25, 0.322], look: [0.642, TOP, 0.262], span: 0.11 },
];

/** FOV kamera vertikal (derajat) per rasio layar. */
export const fovFor = (aspect: number) => (aspect < 1 ? 55 : 45);

export const deskIndex = (id: string) => DESK_STOPS.findIndex((s) => s.id === id);

/** Lebar konten sebuah perhentian untuk rasio layar tertentu. */
export const spanOf = (s: DeskStop, aspect: number) => (aspect < 1 ? (s.portrait?.span ?? s.span) : s.span);
/** Pose kamera (posisi & titik pandang) sebuah perhentian untuk rasio layar tertentu. */
export const poseOf = (s: DeskStop, aspect: number) => (aspect < 1 && s.portrait ? s.portrait : s);
