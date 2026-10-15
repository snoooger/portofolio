// Teks prototipe final dalam dua bahasa. Yang TIDAK diterjemahkan: nama proyek (FarmAgent, Sonar,
// PromptedSite, ViralEngine), judul pameran "Self-Running Machines", nama tools, nama institusi,
// istilah teknis (SEO/AEO/GEO, velocity, dashboard), dan angka.

export type Lang = "en" | "id";

type Fact = { v: string; k: string };
type ProjectCopy = { key: string; name: string; tag: string; line: string; facts: Fact[]; medium: string; note: string };

export const NAME = "Zaidan Jibran Azhar";
export const EMAIL = "ZaidanJibran86@gmail.com";

const PROJECTS: Record<Lang, ProjectCopy[]> = {
  en: [
    {
      key: "farmagent",
      name: "FarmAgent",
      tag: "01 · internal tool",
      line: "A dozen-plus real Android phones, six platforms, one dashboard. Posting and account warm-up run by themselves.",
      facts: [{ v: "12+", k: "phones" }, { v: "6", k: "platforms" }, { v: "1", k: "dashboard" }],
      medium: "Electron, Node.js, ADB, 9router",
      note: "Real phones, not emulators.",
    },
    {
      key: "sonar",
      name: "Sonar",
      tag: "02 · internal tool",
      line: "An office of AI agents that reads a website the way search engines and AI answers do, fixes it, and measures the result.",
      facts: [{ v: "3", k: "SEO · AEO · GEO" }, { v: "5", k: "agent teams" }, { v: "A/B", k: "control group" }],
      medium: "Next.js, Supabase, OpenRouter, Perplexity",
      note: "Five agent teams, one office.",
    },
    {
      key: "promptedsite",
      name: "PromptedSite",
      tag: "03 · public product",
      line: "A marketplace of 500+ motion prompts that become animated websites. Bought by nearly 100 people worldwide.",
      facts: [{ v: "500+", k: "prompts" }, { v: "~100", k: "customers" }, { v: "$49", k: "one-time" }],
      medium: "Next.js, Supabase, Polar, Alchemy",
      note: "Live at promptedsite.com",
    },
    {
      key: "viralengine",
      name: "ViralEngine",
      tag: "04 · internal tool",
      line: "One radar for six platforms: what is viral now, and what is about to be.",
      facts: [{ v: "6", k: "platforms" }, { v: "2", k: "layers" }, { v: "+v", k: "velocity" }],
      medium: "Next.js, Supabase, web scraping",
      note: "Catch it before it peaks.",
    },
    {
      key: "security",
      name: "Security & Research",
      tag: "05 · research",
      line: "Offensive security work, and my thesis: a model that blocks online gambling sites in real time.",
      facts: [{ v: "97.62%", k: "accuracy" }, { v: "8", k: "pentest phases" }, { v: "±200", k: "records reported safely" }],
      medium: "Kali Linux, Python, FastAPI, BiLSTM + attention",
      note: "Thesis model, 97.62% accuracy.",
    },
  ],
  id: [
    {
      key: "farmagent",
      name: "FarmAgent",
      tag: "01 · tool internal",
      line: "Belasan HP Android sungguhan, enam platform, satu dashboard. Posting dan warm-up akun berjalan sendiri.",
      facts: [{ v: "12+", k: "HP" }, { v: "6", k: "platform" }, { v: "1", k: "dashboard" }],
      medium: "Electron, Node.js, ADB, 9router",
      note: "HP sungguhan, bukan emulator.",
    },
    {
      key: "sonar",
      name: "Sonar",
      tag: "02 · tool internal",
      line: "Kantor berisi agen AI yang membaca website seperti mesin pencari dan jawaban AI, memperbaikinya, lalu mengukur hasilnya.",
      facts: [{ v: "3", k: "SEO · AEO · GEO" }, { v: "5", k: "tim agen" }, { v: "A/B", k: "grup kontrol" }],
      medium: "Next.js, Supabase, OpenRouter, Perplexity",
      note: "Lima tim agen, satu kantor.",
    },
    {
      key: "promptedsite",
      name: "PromptedSite",
      tag: "03 · produk publik",
      line: "Marketplace berisi 500+ motion prompt yang menjadi website animasi. Dibeli hampir 100 orang dari berbagai negara.",
      facts: [{ v: "500+", k: "prompt" }, { v: "~100", k: "pelanggan" }, { v: "$49", k: "sekali bayar" }],
      medium: "Next.js, Supabase, Polar, Alchemy",
      note: "Live di promptedsite.com",
    },
    {
      key: "viralengine",
      name: "ViralEngine",
      tag: "04 · tool internal",
      line: "Satu radar untuk enam platform: apa yang sedang viral, dan apa yang akan viral.",
      facts: [{ v: "6", k: "platform" }, { v: "2", k: "lapisan" }, { v: "+v", k: "velocity" }],
      medium: "Next.js, Supabase, web scraping",
      note: "Tangkap sebelum memuncak.",
    },
    {
      key: "security",
      name: "Security & Research",
      tag: "05 · riset",
      line: "Pekerjaan offensive security, dan skripsi saya: model yang memblokir situs judi online secara real time.",
      facts: [{ v: "97.62%", k: "akurasi" }, { v: "8", k: "fase pentest" }, { v: "±200", k: "data dilaporkan aman" }],
      medium: "Kali Linux, Python, FastAPI, BiLSTM + attention",
      note: "Model skripsi, akurasi 97.62%.",
    },
  ],
};

export const COPY = {
  en: {
    nav: { about: "About", work: "Work", skills: "Skills", experience: "Experience", contact: "Contact", concepts: "Concepts" },
    role: "Fullstack Developer & AI Automation Engineer",
    brochure: {
      kicker: "Now showing · free entry",
      body: `Works by ${NAME}, fullstack & AI automation engineer. Five products, built end to end, running in production.`,
      hint: "Scroll to begin the tour",
    },
    about: {
      kicker: "Now showing",
      body: "Five products, each built end to end by one engineer — APIs, interfaces, AI agents, payments — and all running in production today.",
      stats: [{ v: "4", k: "products live" }, { v: "~100", k: "customers" }, { v: "6", k: "platforms" }],
      stats2: [{ v: "97.62%", k: "thesis accuracy" }, { v: "3.65", k: "GPA" }],
    },
    projects: PROJECTS.en,
    mediumLabel: "MEDIUM",
    materials: {
      kicker: "06 · Skills",
      title: "What these machines are made of",
      groups: [
        { t: "Build", d: "Next.js, React, Electron, TypeScript, Python, Tailwind CSS, FastAPI, REST API, Supabase, Cloudflare, Polar, Alchemy" },
        { t: "AI & automation", d: "Multi-agent AI, OpenRouter, 9router, Perplexity API, prompt engineering, web scraping, Android ADB, BiLSTM + attention, Pandas" },
        { t: "Security", d: "Penetration testing, OWASP Top 10, Active Directory, Burp Suite, Nmap, Metasploit, SQLMap, Nuclei, Kali Linux" },
      ],
    },
    experience: {
      kicker: "07 · Experience",
      title: "Where I have worked",
      jobs: [
        "Kerja Web3 · May 2026 — now · Built FarmAgent, Sonar, PromptedSite and ViralEngine end to end.",
        "Timedoor Academy · Jan — Feb 2026 · Taught Scratch, Python and web basics to students aged 8–17.",
        "Kementerian PUPR · Aug — Nov 2025 · Built Insight Hub, an API data catalog with dashboards and RBAC.",
        "PT PLN (Persero) · Feb — Mar 2025 · Automated anomaly detection that flagged 4,422 possible illegal connections.",
      ],
    },
    certificates: { kicker: "08 · Certificates", title: "Seven certificates, 2023 — 2026" },
    education: {
      kicker: "09 · Education",
      title: "B.Eng. Informatics",
      body: "Institut Teknologi PLN, Jakarta. GPA 3.65 / 4.00, graduated September 2026.",
      thesis: "Thesis: a BiLSTM + attention model, served by FastAPI and a Chrome extension, that blocks online gambling sites in real time.",
    },
    contact: {
      kicker: "10 · Exit",
      title: "Take a card on your way out.",
      body: "Open to fullstack and AI automation roles, and to freelance builds.",
      cv: "Download CV",
      footer: `© 2026 ${NAME} · Built with Next.js & three.js · 3D assets: Poly Haven (CC0)`,
    },
  },
  id: {
    nav: { about: "Tentang", work: "Karya", skills: "Skill", experience: "Pengalaman", contact: "Kontak", concepts: "Konsep" },
    role: "Fullstack Developer & AI Automation Engineer",
    brochure: {
      kicker: "Sedang dipamerkan · gratis",
      body: `Karya ${NAME}, fullstack & AI automation engineer. Lima produk, dibangun dari nol sampai jadi, berjalan di production.`,
      hint: "Scroll untuk mulai tur",
    },
    about: {
      kicker: "Sedang dipamerkan",
      body: "Lima produk, masing-masing dibangun utuh oleh satu engineer — API, antarmuka, agen AI, pembayaran — dan semuanya berjalan di production hari ini.",
      stats: [{ v: "4", k: "produk live" }, { v: "~100", k: "pelanggan" }, { v: "6", k: "platform" }],
      stats2: [{ v: "97.62%", k: "akurasi skripsi" }, { v: "3.65", k: "IPK" }],
    },
    projects: PROJECTS.id,
    mediumLabel: "MEDIUM",
    materials: {
      kicker: "06 · Skill",
      title: "Bahan pembuat mesin-mesin ini",
      groups: [
        { t: "Build", d: "Next.js, React, Electron, TypeScript, Python, Tailwind CSS, FastAPI, REST API, Supabase, Cloudflare, Polar, Alchemy" },
        { t: "AI & automation", d: "Multi-agent AI, OpenRouter, 9router, Perplexity API, prompt engineering, web scraping, Android ADB, BiLSTM + attention, Pandas" },
        { t: "Security", d: "Penetration testing, OWASP Top 10, Active Directory, Burp Suite, Nmap, Metasploit, SQLMap, Nuclei, Kali Linux" },
      ],
    },
    experience: {
      kicker: "07 · Pengalaman",
      title: "Tempat saya bekerja",
      jobs: [
        "Kerja Web3 · Mei 2026 — sekarang · Membangun FarmAgent, Sonar, PromptedSite dan ViralEngine dari nol.",
        "Timedoor Academy · Jan — Feb 2026 · Mengajar Scratch, Python dan dasar web untuk siswa usia 8–17.",
        "Kementerian PUPR · Agu — Nov 2025 · Membangun Insight Hub, katalog data API dengan dashboard dan RBAC.",
        "PT PLN (Persero) · Feb — Mar 2025 · Otomatisasi deteksi anomali yang menandai 4.422 dugaan sambungan ilegal.",
      ],
    },
    certificates: { kicker: "08 · Sertifikat", title: "Tujuh sertifikat, 2023 — 2026" },
    education: {
      kicker: "09 · Pendidikan",
      title: "Sarjana Informatika",
      body: "Institut Teknologi PLN, Jakarta. IPK 3.65 / 4.00, lulus September 2026.",
      thesis: "Skripsi: model BiLSTM + attention, dijalankan lewat FastAPI dan ekstensi Chrome, yang memblokir situs judi online secara real time.",
    },
    contact: {
      kicker: "10 · Pintu keluar",
      title: "Ambil kartu sebelum pulang.",
      body: "Terbuka untuk posisi fullstack dan AI automation, juga proyek freelance.",
      cv: "Unduh CV",
      footer: `© 2026 ${NAME} · Dibuat dengan Next.js & three.js · Aset 3D: Poly Haven (CC0)`,
    },
  },
} as const;

export type Copy = (typeof COPY)[Lang];
