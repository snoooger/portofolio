import Link from "next/link";

export const metadata = { title: "Not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-6 text-center">
      <div>
        <p className="font-hand text-3xl text-terracotta">404</p>
        <h1 className="mt-1 font-display text-5xl">This page isn&apos;t on the desk.</h1>
        <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-paper hover:bg-terracotta">
          Back to the desk
        </Link>
      </div>
    </main>
  );
}
