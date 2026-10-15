import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy. Semua aset (model, tekstur, HDRI, font) dilayani dari origin sendiri.
 * - 'unsafe-inline' script: skrip inline hidrasi Next.js & JSON-LD.
 * - 'wasm-unsafe-eval': dekoder meshopt (WebAssembly) untuk model .glb terkompresi.
 * - blob: script/worker/connect/img: worker teks troika (memuat modulnya lewat importScripts(blob:))
 *   & tekstur hasil dekode GLTFLoader. URL blob hanya bisa dibuat skrip dari origin sendiri.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

// Aset 3D & font berukuran besar jarang berubah: simpan seminggu di browser/CDN, perbarui di latar belakang.
const assetCache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/assets-3d/:path*", headers: assetCache },
      { source: "/fonts-proto/:path*", headers: assetCache },
    ];
  },
};

export default nextConfig;
