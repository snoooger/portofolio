"use client";

// Salinan teks seluruh perhentian untuk pembaca layar & mesin pencari. Tampilan visualnya ada di
// scene (post-it + teks 3D), jadi bagian ini tidak terlihat.
import { NAME, type Copy } from "./copy";
import { DESK_STOPS } from "./stops";
import { detailsFor, summaryFor } from "./content";

export function SeoContent({ copy }: { copy: Copy }) {
  return (
    <div className="sr-only">
      <h1>
        {NAME} — {copy.role}
      </h1>
      {DESK_STOPS.map((s) => {
        const c = detailsFor(s.id, copy);
        const sm = summaryFor(s.id, copy);
        if (!c) return null;
        return (
          <section key={s.id}>
            <h2>{sm?.title ?? c.title}</h2>
            {sm && <p>{sm.lines[0]}</p>}
            {sm && sm.title !== c.title && <h3>{c.title}</h3>}
            {c.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
            {c.facts?.map((x) => (
              <p key={x.k}>
                {x.v} {x.k}
              </p>
            ))}
            {c.list?.map((x) => (
              <p key={x.a}>
                {x.a} — {x.b} {x.c}
              </p>
            ))}
            {c.links?.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </section>
        );
      })}
    </div>
  );
}
