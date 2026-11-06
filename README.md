# Portofolio Zaidan Jibran Azhar — The Desk

Satu meja kerja 3D yang dijelajahi dengan scroll. Pemuatan dimulai dari siluet iPhone, lalu kamera
"keluar" dari layar HP ke meja: hero di atas cutting mat, About di iPhone (profil ala Instagram), phone farm
FarmAgent, monitor macOS (usesonarnow.com & promptedsite.com seperti live, ViralEngine, Security), toolkit,
pegboard (pengalaman, sertifikat), pendidikan, dan kontak di layar iPhone. Dua bahasa (EN/ID), musik lo-fi CC0.

Next.js 16 (App Router) · React Three Fiber + drei · three.js · Tailwind CSS 4 · GSAP + Lenis.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm run start
```

## Struktur

| Path | Isi |
|---|---|
| `src/app/` | Root layout (metadata/SEO), halaman `/`, OG image, robots, sitemap |
| `src/proto/desk/` | Scene meja: kamera & perhentian (`stops.ts`, `frame.ts`), intro iPhone (`intro.ts`), popup catatan (`popup.ts`, `Poppable.tsx`, `NotePopup.tsx`), monitor macOS (`macos.ts`, `sites.ts`), iPhone + Instagram (`IPhone.tsx`, `instagram.ts`), copy EN/ID (`copy.ts`) |
| `src/proto/desk/Scene3D.tsx` | Chunk 3D yang dimuat malas (three.js/R3F); kerangka DOM tampil lebih dulu |
| `src/proto/desk/StaticDesk.tsx` | Versi ringan untuk browser tanpa akselerasi grafis (dipilih sebelum first paint; `?3d=1` / `?3d=0`) |
| `src/proto/desk/quality.ts` | Tier kualitas otomatis (high/mid/low) per perangkat; uji dengan `?q=low\|mid\|high` |
| `public/assets-3d/` | Model (Sketchfab CC BY 4.0, Poly Haven CC0), tekstur, HDRI, gambar sertifikat |

- Penjelasan hanya ada di post-it/kartu/layar tiap section. Tiba di section → catatannya terbuka otomatis sebagai popup
  (‹ › untuk pindah catatan, tutup → kembali ke tempatnya), dengan efek suara kertas (WebAudio, `sfx.ts`).
  Isi catatan per proyek (berhalaman) ada di `copy.ts` → `notes`.
- Scroll per halaman: satu gestur (roda/trackpad/swipe/panah) = tepat satu section; inersia trackpad tidak bisa melompati section.
- Tangkapan layar situs live ada di `public/assets-3d/sites/` (perbarui bila situsnya berubah).
- Keamanan: CSP & header keamanan di `next.config.ts`.

## Kredit 3D

“Custom - Mechanical Keyboard” (unknown.fbx), “Apple Studio Display” (alboxer2000_), “Apple Mac Mini M1”
(DatSketch), “Android Phone - Xiaomi Redmi 9” (Miguel Adão), “IKEA Pegboard” (jowilam) — CC BY 4.0, Sketchfab.
Lampu, tanaman, binder, tekstur kayu/parket/plester, HDRI — Poly Haven (CC0).
Musik: “Chill lofi inspired” — omfgdude, OpenGameArt (CC0).
