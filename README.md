# Portofolio Zaidan Jibran Azhar — The Desk

Satu meja kerja 3D yang dijelajahi dengan scroll: hero di atas cutting mat, phone farm FarmAgent,
monitor (Sonar, PromptedSite, ViralEngine, Security), toolkit, pegboard (pengalaman, sertifikat),
pendidikan, dan kontak di layar iPhone. Dua bahasa (EN/ID).

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
| `src/proto/desk/` | Scene meja: kamera & perhentian (`stops.ts`, `frame.ts`), teks 3D (`DeskText.tsx`), post-it, rak HP, monitor, iPhone, copy EN/ID (`copy.ts`) |
| `src/proto/desk/quality.ts` | Tier kualitas otomatis (high/mid/low) per perangkat; uji dengan `?q=low\|mid\|high` |
| `public/assets-3d/` | Model (Sketchfab CC BY 4.0, Poly Haven CC0), tekstur, HDRI, gambar sertifikat |

- **Teks 3D** = ringkasan tiap section; **post-it & benda** = detail pelengkap (tidak diulang).
- Scroll bertahap: satu gestur = satu section, lalu jeda baca singkat.
- Keamanan: CSP & header keamanan di `next.config.ts`.

## Kredit 3D

“Custom - Mechanical Keyboard” (unknown.fbx), “Apple Studio Display” (alboxer2000_), “Apple Mac Mini M1”
(DatSketch), “Android Phone - Xiaomi Redmi 9” (Miguel Adão), “IKEA Pegboard” (jowilam) — CC BY 4.0, Sketchfab.
Lampu, tanaman, binder, tekstur kayu/parket/plester, HDRI — Poly Haven (CC0).
