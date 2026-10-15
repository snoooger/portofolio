import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Zaidan Jibran Azhar — Open for freelance: Fullstack Developer & AI Automation Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const file = (p: string) => readFile(join(process.cwd(), "public", p));

/**
 * Gambar pratinjau tautan (Threads, LinkedIn, WhatsApp, X): render asli meja 3D sebagai latar,
 * gradasi hijau tua (senada footer) di kiri, badge "Open for freelance", nama, peran, layanan, alamat.
 */
export default async function OpengraphImage() {
  const [bg, serif, serifItalic, sans, sansBold, mono] = await Promise.all([
    file("og/desk.jpg"),
    file("fonts-proto/instrument-serif-latin-400-normal.woff"),
    file("fonts-proto/instrument-serif-latin-400-italic.woff"),
    file("fonts-proto/inter-tight-latin-600-normal.woff"),
    file("fonts-proto/inter-tight-latin-700-normal.woff"),
    file("fonts-proto/jetbrains-mono-latin-500-normal.woff"),
  ]);
  const bgSrc = `data:image/jpeg;base64,${bg.toString("base64")}`;
  const cream = "#fbf3e3", yellow = "#f5c84c", green = "#10241a";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: green }}>
        <img src={bgSrc} alt="" width={1200} height={630} style={{ position: "absolute", left: 250, top: 0, width: 1200, height: 630, objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: "linear-gradient(90deg, rgba(16,36,26,1) 0%, rgba(16,36,26,0.97) 40%, rgba(16,36,26,0.6) 60%, rgba(16,36,26,0) 80%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px", width: 640 }}>
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: yellow,
                color: green,
                fontFamily: "Inter Tight",
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: 2,
                padding: "10px 20px",
                borderRadius: 999,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 999, background: "#1f8a4c", marginRight: 12 }} />
              OPEN FOR FREELANCE
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 30, fontFamily: "Instrument Serif", fontSize: 88, lineHeight: 0.95, color: cream }}>
            <span>Zaidan Jibran</span>
            <span>Azhar</span>
          </div>
          <div style={{ display: "flex", marginTop: 14, fontFamily: "Instrument Serif Italic", fontSize: 40, color: yellow }}>
            Fullstack & AI Automation Engineer
          </div>
          <div style={{ display: "flex", marginTop: 30 }}>
            {["Web App", "Landing Page 3D", "AI Automation"].map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  border: "2px solid rgba(251,243,227,0.55)",
                  color: cream,
                  fontFamily: "Inter Tight",
                  fontWeight: 600,
                  fontSize: 20,
                  padding: "8px 16px",
                  borderRadius: 999,
                  marginRight: 10,
                }}
              >
                {s}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 36, fontFamily: "JetBrains Mono", fontSize: 22, color: "rgba(251,243,227,0.85)" }}>
            zaidanjibran.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: serif, weight: 400 },
        { name: "Instrument Serif Italic", data: serifItalic, weight: 400 },
        { name: "Inter Tight", data: sans, weight: 600 },
        { name: "Inter Tight", data: sansBold, weight: 700 },
        { name: "JetBrains Mono", data: mono, weight: 500 },
      ],
    },
  );
}
