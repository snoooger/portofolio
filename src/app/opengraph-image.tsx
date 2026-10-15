import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Zaidan Jibran Azhar — Fullstack Developer & AI Automation Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (f: string) => readFile(join(process.cwd(), "public/fonts-proto", f));

/** Gambar pratinjau tautan: kertas krem di atas cutting mat hijau, dengan post-it nama proyek. */
export default async function OpengraphImage() {
  const [serif, hand, mono, sans] = await Promise.all([
    font("instrument-serif-latin-400-normal.woff"),
    font("caveat-latin-700-normal.woff"),
    font("jetbrains-mono-latin-500-normal.woff"),
    font("inter-tight-latin-600-normal.woff"),
  ]);
  const notes = [
    { t: "FarmAgent", c: "#F6DD7A", r: -5, x: 820, y: 70 },
    { t: "Sonar", c: "#BFD7E6", r: 4, x: 970, y: 190 },
    { t: "PromptedSite", c: "#F2B8A8", r: -3, x: 800, y: 300 },
    { t: "ViralEngine", c: "#C9DDB0", r: 6, x: 960, y: 410 },
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#2f6f55", position: "relative" }}>
        {/* Kertas */}
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 70,
            width: 700,
            height: 490,
            background: "#fbf7f1",
            transform: "rotate(-2deg)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontFamily: "Caveat", fontSize: 92, color: "#c2552f", lineHeight: 1 }}>Portfolio</div>
          <div style={{ fontFamily: "Instrument Serif", fontSize: 72, color: "#1e1b18", marginTop: 18 }}>Zaidan Jibran Azhar</div>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 17, letterSpacing: 2, color: "#5c544b", marginTop: 26 }}>
            FULLSTACK DEVELOPER & AI AUTOMATION ENGINEER
          </div>
        </div>
        {notes.map((n) => (
          <div
            key={n.t}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              width: 190,
              height: 150,
              background: n.c,
              transform: `rotate(${n.r}deg)`,
              boxShadow: "0 14px 28px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Inter Tight",
              fontSize: 26,
              color: "#1d2333",
            }}
          >
            {n.t}
          </div>
        ))}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: serif, weight: 400 },
        { name: "Caveat", data: hand, weight: 700 },
        { name: "JetBrains Mono", data: mono, weight: 500 },
        { name: "Inter Tight", data: sans, weight: 600 },
      ],
    },
  );
}
