import type { Metadata, Viewport } from "next";
import { Caveat, Gochi_Hand, Instrument_Serif, Inter_Tight, JetBrains_Mono, Kalam, Patrick_Hand, Permanent_Marker, Shadows_Into_Light } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ProtoScroll } from "@/proto/ProtoScroll";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-instrument-serif", display: "swap" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
const hand = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-caveat", display: "swap" });
// Ragam tulisan tangan untuk post-it (dimuat tanpa preload: dipakai di kanvas setelah adegan siap).
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker", preload: false });
const kalam = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-kalam", preload: false });
const patrick = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-patrick", preload: false });
const shadows = Shadows_Into_Light({ subsets: ["latin"], weight: "400", variable: "--font-shadows", preload: false });
const gochi = Gochi_Hand({ subsets: ["latin"], weight: "400", variable: "--font-gochi", preload: false });

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  keywords: ["Zaidan Jibran Azhar", "fullstack developer", "AI automation engineer", "portfolio", "Next.js", "FarmAgent", "Sonar", "PromptedSite", "ViralEngine"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    alternateLocale: ["id_ID"],
    firstName: "Zaidan Jibran",
    lastName: "Azhar",
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#f2ebe1",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} ${hand.variable} ${marker.variable} ${kalam.variable} ${patrick.variable} ${shadows.variable} ${gochi.variable}`}
    >
      <body className="paper-grain">
        <ProtoScroll />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
