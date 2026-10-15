// Peta perjalanan prototipe final: satu museum, satu kamera. Tiap perhentian = satu section situs asli.
// Hero = satu-satunya meja: meja penjaga di lobi (dari atas). Lalu kamera mundur dan berjalan masuk.

export type V3 = [number, number, number];
export type FinalStop = { id: string; label: string; pos: V3; look: V3 };

/** Tata letak museum (dipakai MuseumWorld). */
export const MUSEUM = {
  hw: 3.5, // setengah lebar lorong
  ceil: 4.2,
  lobbyZ: 10.2, // dinding belakang lobi (pintu masuk gedung)
  gateZ: 2, // gapura pameran
  guard: [2.05, 6.3] as const, // meja penjaga (x, z)
  end: -27, // ujung lorong proyek
  back: -35, // dinding belakang galeri
  hallX: 30, // dinding paling ujung
  plinthZ: (i: number) => -3.8 - i * 4.6,
  plinthSide: (i: number) => (i % 2 === 0 ? -1 : 1),
  jobX: (i: number) => 4.3 + i * 1.8,
  certX: (i: number) => 13 + i * 2.0,
  diplomaZ: -29.2,
  exitZ: -32.4, // pintu keluar di dinding ujung
  card: [28.75, -31.2] as const, // dudukan kartu nama (x, z)
};

// Kamera menghadap objek dari sisi seberang lorong; objek tampil di sisi plinth, teks melayang di sisi lain.
const plinth = (i: number, high = false): Pick<FinalStop, "pos" | "look"> => {
  const z = MUSEUM.plinthZ(i), side = MUSEUM.plinthSide(i);
  // `high`: kamera lebih tinggi & menunduk, untuk maket yang perlu dilihat dari atas (Sonar).
  return high
    ? { pos: [side * 0.75, 2.2, z + 1.2], look: [side * 2.05, 1.1, z - 0.15] }
    : { pos: [-side * 0.3, 1.62, z + 1.75], look: [side * 1.45, 1.45, z - 0.35] };
};

const [gx, gz] = MUSEUM.guard;
const GT = 0.788; // tinggi meja penjaga (model metal_office_desk)
const [cx, cz] = MUSEUM.card;

export const FINAL_STOPS: FinalStop[] = [
  { id: "hero", label: "Home", pos: [gx, GT + 1.3, gz + 0.32], look: [gx, GT, gz - 0.02] },
  // Mundur dari meja penjaga: lobi, gapura pameran, dan teks About melayang.
  { id: "about", label: "About", pos: [1.5, 1.75, 9.5], look: [-0.5, 1.85, 3.2] },
  { id: "farmagent", label: "FarmAgent", ...plinth(0) },
  { id: "sonar", label: "Sonar", ...plinth(1, true) },
  { id: "promptedsite", label: "PromptedSite", ...plinth(2) },
  { id: "viralengine", label: "ViralEngine", ...plinth(3) },
  { id: "security", label: "Security", ...plinth(4) },
  { id: "materials", label: "Skills", pos: [0, 1.7, -26.5], look: [0, 1.75, MUSEUM.back] },
  { id: "experience", label: "Experience", pos: [3.6, 1.65, -27.4], look: [3.6, 1.75, MUSEUM.back] },
  { id: "certificates", label: "Certificates", pos: [11.6, 1.75, -27.6], look: [17.2, 2.0, MUSEUM.back] },
  { id: "education", label: "Education", pos: [24.9, 1.6, -30.4], look: [30, 1.75, -29.0] },
  { id: "contact", label: "Contact", pos: [cx - 0.75, 1.75, cz + 0.3], look: [cx + 0.15, 1.0, cz - 0.12] },
];

export const stopIndex = (id: string) => FINAL_STOPS.findIndex((s) => s.id === id);
