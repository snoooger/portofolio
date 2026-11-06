"use client";

// Versi ringan untuk browser tanpa akselerasi grafis hardware (WebGL perangkat lunak/mati): poster meja
// + seluruh isi portofolio sebagai halaman biasa. Isinya sama dengan yang ada di benda-benda 3D.
import { EMAIL, GITHUB, LINKEDIN, NAME, type Copy, type Lang } from "./copy";
import { detailsFor, summaryFor } from "./content";
import { Logo } from "./Logo";

const WORK = ["farmagent", "sonar", "promptedsite", "viralengine", "security"];

export function StaticDesk({ copy, lang, setLang, music }: { copy: Copy; lang: Lang; setLang: (l: Lang) => void; music?: React.ReactNode }) {
  const ig = copy.ig;
  return (
    <div className="min-h-svh bg-cream text-ink">
      <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between rounded-full bg-[#1d3a2b] pl-1.5 pr-1.5 text-[#fbf3e3] shadow-[0_10px_34px_-12px_rgba(16,36,26,0.6)]">
          <a href="#top" aria-label={`${NAME} — home`} className="flex items-center gap-2 rounded-full p-1 pr-3">
            <Logo size={38} className="rounded-[10px]" />
            <span className="font-display text-xl max-sm:hidden">{NAME}</span>
          </a>
          <div className="flex items-center gap-1.5">
            {music}
            <div className="flex rounded-full bg-white/10 p-0.5" role="group" aria-label="Language">
              {(["en", "id"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.08em] ${lang === l ? "bg-[#fbf3e3] text-[#1d3a2b]" : "text-[#fbf3e3]/80"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-5xl px-5 pb-24 pt-8">
        <section aria-labelledby="hero-title">
          {/* Poster hanya di layar ≥640px (HP: langsung ke isi, hemat data & LCP dari teks). */}
          <picture>
            <source media="(max-width: 639px)" srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAACH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
            {/* eslint-disable-next-line @next/next/no-img-element -- poster statis kecil, sudah webp & responsif */}
            <img
              src="/assets-3d/poster.webp"
              srcSet="/assets-3d/poster-800.webp 800w, /assets-3d/poster.webp 1200w"
              sizes="(max-width: 1040px) 100vw, 1000px"
              width={1200}
              height={630}
              alt="The 3D workdesk: cutting mat with a Portfolio sheet, keyboard, monitor, Mac mini and an iPhone"
              fetchPriority="high"
              className="w-full rounded-3xl shadow-[0_30px_60px_-30px_rgba(30,27,24,0.5)] max-sm:hidden"
            />
          </picture>
          <h1 id="hero-title" className="mt-8 font-display text-[clamp(40px,7vw,76px)] leading-[0.95]">
            {NAME}
          </h1>
          <p className="mt-3 text-lg text-ink-soft">{copy.role}</p>
          <p className="mt-6 max-w-2xl rounded-2xl bg-[#fbf7f1] p-4 text-[15px] text-ink-soft">
            {copy.fallback.note}{" "}
            <a href="?3d=1" className="font-semibold text-terracotta-dark underline underline-offset-4">
              {copy.fallback.load}
            </a>
          </p>
        </section>

        <section aria-labelledby="about-title" className="mt-16 flex flex-col gap-6 rounded-3xl bg-[#fbf7f1] p-6 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets-3d/profile.webp" width={120} height={120} alt={NAME} loading="lazy" className="size-28 shrink-0 rounded-full object-cover ring-4 ring-[#f5c84c]" />
          <div>
            <p className="mono-label text-terracotta-dark">{copy.nav.about}</p>
            <h2 id="about-title" className="mt-1 font-display text-4xl">
              {copy.summary.about.title}
            </h2>
            <p className="mt-1 text-[15px] text-ink-soft">{ig.category}</p>
            <p className="mt-3 text-[16px]">{ig.bio.join(" ")}</p>
          </div>
        </section>

        <section aria-labelledby="work-title" className="mt-16">
          <h2 id="work-title" className="font-display text-5xl">
            {copy.nav.work}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {WORK.map((id) => {
              const s = summaryFor(id, copy)!;
              const d = detailsFor(id, copy)!;
              return (
                <article key={id} className="rounded-3xl bg-[#fbf7f1] p-6">
                  <p className="mono-label text-terracotta-dark">{s.kicker}</p>
                  <h3 className="mt-1 font-display text-3xl">{s.title}</h3>
                  <p className="mt-2 text-[15px] text-ink-soft">{s.lines[0]}</p>
                  <ul className="mt-3 list-disc pl-5 text-[15px]">
                    {d.lines.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                  {s.links?.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener" className="mt-4 inline-block rounded-full bg-[#1d3a2b] px-4 py-2 text-[13px] font-semibold text-[#f5c84c]">
                      {l.label} ↗
                    </a>
                  ))}
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="skills-title" className="mt-16">
          <h2 id="skills-title" className="font-display text-5xl">
            {copy.summary.skills.title}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {copy.skills.map((s) => (
              <div key={s.title} className="rounded-3xl p-6" style={{ background: s.color }}>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-[15px]">{s.lines.join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="exp-title" className="mt-16">
          <h2 id="exp-title" className="font-display text-5xl">
            {copy.nav.experience}
          </h2>
          <ol className="mt-6 space-y-3">
            {copy.jobs.map((j) => (
              <li key={j.org} className="rounded-3xl bg-[#fbf7f1] p-6">
                <p className="mono-label text-ink-soft">{j.period}</p>
                <h3 className="mt-1 text-lg font-semibold">
                  {j.role} — {j.org}
                </h3>
                <p className="mt-1 text-[15px] text-ink-soft">{j.line}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-[#fbf7f1] p-6">
              <h3 className="font-display text-3xl">{copy.summary.certificates.title}</h3>
              <p className="mt-2 text-[15px] text-ink-soft">{copy.summary.certificates.text}</p>
              <p className="mt-2 text-[15px]">{copy.certificates.lines.join(" ")}</p>
            </div>
            <div className="rounded-3xl bg-[#fbf7f1] p-6">
              <h3 className="font-display text-3xl">{copy.summary.education.title}</h3>
              <p className="mt-2 text-[15px] text-ink-soft">{copy.summary.education.text}</p>
              <p className="mt-2 text-[15px]">
                {copy.education.title} · {copy.education.lines.join(" ")}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="contact-title" className="mt-16 rounded-3xl bg-[#1d3a2b] p-8 text-[#fbf3e3]">
          <h2 id="contact-title" className="font-display text-5xl">
            {copy.cta.a} <span className="italic text-[#f5c84c]">{copy.cta.b}</span>
          </h2>
          <p className="mt-3 text-[15px] text-white/80">{copy.cta.caption}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`mailto:${EMAIL}`} className="rounded-full bg-[#f5c84c] px-5 py-3 text-[15px] font-semibold text-[#1d3a2b]">
              {copy.cta.button}
            </a>
            <a href={LINKEDIN} target="_blank" rel="noopener" className="rounded-full bg-white/10 px-5 py-3 text-[15px]">
              LinkedIn
            </a>
            <a href={GITHUB} target="_blank" rel="noopener" className="rounded-full bg-white/10 px-5 py-3 text-[15px]">
              GitHub
            </a>
          </div>
        </section>
        <footer className="mt-10 text-center text-[12px] text-ink-soft">
          <p>{copy.footer}</p>
          <p className="mx-auto mt-1 max-w-3xl text-[11px]">{copy.credits}</p>
        </footer>
      </main>
    </div>
  );
}
