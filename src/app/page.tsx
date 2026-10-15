import { DeskProto } from "@/proto/desk/DeskProto";
import { EMAIL, GITHUB, LINKEDIN } from "@/proto/desk/copy";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/** Data terstruktur (schema.org) untuk mesin pencari: profil & orang di balik portofolio. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL.origin}/#person`,
      name: SITE_NAME,
      url: SITE_URL.origin,
      email: `mailto:${EMAIL}`,
      jobTitle: "Fullstack Developer & AI Automation Engineer",
      alumniOf: { "@type": "CollegeOrUniversity", name: "Institut Teknologi PLN" },
      sameAs: [LINKEDIN, GITHUB],
      knowsAbout: ["Next.js", "React", "TypeScript", "Python", "FastAPI", "Supabase", "AI automation", "Multi-agent AI", "Penetration testing"],
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL.origin}/#page`,
      url: SITE_URL.origin,
      name: `${SITE_NAME} — Portfolio`,
      description: SITE_DESCRIPTION,
      mainEntity: { "@id": `${SITE_URL.origin}/#person` },
      inLanguage: ["en", "id"],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <DeskProto />
    </>
  );
}
