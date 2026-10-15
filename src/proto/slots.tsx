"use client";

// Isi kartu yang sama dipakai semua konsep: hero, lima proyek, "tentang saya", kontak.
import type { ReactNode } from "react";
import { ProjectCard } from "./ui";
import { protoProjects as PP, me } from "./content";

type Side = "left" | "right" | "center" | "bottom";
export type Slot = { node: ReactNode; side: Side } | null;

export function RunButton({ running, onToggle }: { running: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="mono-label mt-5 inline-flex items-center gap-2 rounded-full bg-terracotta px-4 py-2.5 text-paper transition hover:bg-terracotta-dark"
    >
      {running ? "■ Stop the farm" : "▶ Run the farm"}
    </button>
  );
}

export function AboutCard({ title = "Notes on the desk" }: { title?: string }) {
  return (
    <article className="w-[min(400px,86vw)] rounded-[22px] bg-paper/92 p-7 shadow-[0_30px_60px_-30px_rgba(30,27,24,0.45)] ring-1 ring-ink/8">
      <p className="mono-label text-ink-soft">
        <span className="text-terracotta">06</span> / The person
      </p>
      <h2 className="mt-3 font-display text-5xl leading-[0.95]">{title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        {me.edu}. Four roles since 2025 — PLN, PUPR, Timedoor, Kerja Web3.
      </p>
      <p className="mt-4 font-hand text-2xl text-terracotta">I build alone, end to end, in production.</p>
    </article>
  );
}

export function ContactPill() {
  return (
    <a href={`mailto:${me.email}`} className="mono-label rounded-full bg-ink px-5 py-3 text-paper transition hover:bg-terracotta">
      Write to me → {me.email}
    </a>
  );
}

/** Slot untuk 5 proyek berurutan; sisi kartu bergantian kecuali ditentukan. */
export function projectSlots(opts: { sides: Side[]; running: boolean; onToggle: () => void }): Slot[] {
  return PP.map((p, i) => ({
    side: opts.sides[i % opts.sides.length],
    node: (
      <ProjectCard p={p}>{p.key === "farmagent" && <RunButton running={opts.running} onToggle={opts.onToggle} />}</ProjectCard>
    ),
  }));
}
