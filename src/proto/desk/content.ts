// Isi tiap perhentian dari copy, dipisah dua lapis supaya tidak ada duplikasi di layar:
// - summaryFor: ringkasan (label, judul, satu kalimat) → teks 3D.
// - detailsFor: detail pelengkap (post-it, kartu, angka, daftar) → sudah tampil di benda-benda scene;
//   di sini hanya dipakai untuk salinan tersembunyi bagi pembaca layar & mesin pencari.
import { EMAIL, GITHUB, LINKEDIN, type Copy } from "./copy";

export type Card = {
  kicker: string;
  title: string;
  lines: string[];
  facts?: { v: string; k: string }[];
  list?: { a: string; b: string; c?: string }[];
  links?: { label: string; href: string }[];
};

const WORK = ["farmagent", "sonar", "promptedsite", "viralengine", "security"];

function kickerFor(id: string, copy: Copy) {
  const n = copy.nav;
  if (WORK.includes(id)) return `${n.work} · ${String(WORK.indexOf(id) + 1).padStart(2, "0")} / 05`;
  if (id === "certificates" || id === "education") return n.experience;
  return (n as Record<string, string>)[id] ?? "";
}

export function summaryFor(id: string, copy: Copy): Card | null {
  const sm = copy.summary[id];
  return sm ? { kicker: kickerFor(id, copy), title: sm.title, lines: [sm.text] } : null;
}

export function detailsFor(id: string, copy: Copy): Card | null {
  const n = copy.nav;
  if (id === "about") {
    const [intro, ...stats] = copy.about;
    return { kicker: n.about, title: intro.title, lines: intro.lines, facts: stats.map((s) => ({ v: s.title, k: s.lines.join(" ") })) };
  }
  if (WORK.includes(id)) {
    const p = copy.projects[id];
    return { kicker: `${n.work} · ${String(WORK.indexOf(id) + 1).padStart(2, "0")} / 05`, title: p.title, lines: p.lines, facts: p.facts };
  }
  if (id === "skills")
    return { kicker: n.skills, title: n.skills, lines: [], list: copy.skills.map((s) => ({ a: s.title, b: s.lines.join(" · ") })) };
  if (id === "experience")
    return { kicker: n.experience, title: copy.experience.title, lines: [copy.experience.lines[0]], list: copy.jobs.map((j) => ({ a: j.role, b: j.org, c: j.period })) };
  if (id === "certificates") return { kicker: n.experience, title: copy.certificates.title, lines: copy.certificates.lines };
  if (id === "education") return { kicker: n.experience, title: copy.education.title, lines: copy.education.lines };
  if (id === "contact")
    return {
      kicker: n.contact,
      title: copy.contact.title,
      lines: copy.contact.lines,
      links: [
        { label: copy.links.email, href: `mailto:${EMAIL}` },
        { label: copy.links.linkedin, href: LINKEDIN },
        { label: copy.links.github, href: GITHUB },
      ],
    };
  return null;
}

