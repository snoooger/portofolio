// Teks prototipe meja (lanjutan P1), dua bahasa. Semua penjelasan ditulis di post-it, jadi kalimatnya
// dibuat pendek. Tidak diterjemahkan: nama proyek, "Self-Running Machines", nama tools, institusi,
// istilah teknis (SEO/AEO/GEO, dashboard, velocity, warm-up), dan angka.

export type Lang = "en" | "id";
export type Note = { title: string; lines: string[]; facts?: { v: string; k: string }[]; color?: string };

export const NAME = "Zaidan Jibran Azhar";
export const EMAIL = "ZaidanJibran86@gmail.com";
export const LINKEDIN = "https://linkedin.com/in/zaidanjibranazhar";
export const GITHUB = "https://github.com/snoooger";

/** Kredit model 3D (CC BY 4.0 dari Sketchfab, CC0 dari Poly Haven). Wajib tampil untuk CC BY. */
const CREDITS =
  "3D: “Custom - Mechanical Keyboard” by unknown.fbx · “Apple Studio Display” by alboxer2000_ · “Apple Mac Mini M1” by DatSketch · “Android Phone - Xiaomi Redmi 9” by Miguel Adão · “IKEA Pegboard” by jowilam — CC BY 4.0, Sketchfab · Lamp, plant, wood, parquet, HDRI: Poly Haven (CC0)";

export const YELLOW = "#F6DD7A";
export const PINK = "#F2B8A8";
export const GREEN = "#C9DDB0";
export const BLUE = "#BFD7E6";
export const ORANGE = "#F3B97E";

const en = {
  nav: { about: "About", work: "Work", skills: "Skills", experience: "Experience", contact: "Contact", concepts: "Concepts" },
  role: "Fullstack Developer & AI Automation Engineer",
  loading: "Setting up the desk",
  scroll: { hint: "Scroll to explore", touch: "Swipe up to explore" },
  /** Kertas hero & layar pemuatan: "Portfolio" + nama lengkap. */
  portfolio: "Portfolio",
  about: [
    { title: "End to end", lines: ["I build & ship products alone:", "API, backend, frontend,", "AI agents, payments, deploy."], color: YELLOW },
    { title: "AI", lines: ["automation", "& AI agents"], color: PINK },
    { title: "Web dev", lines: ["fullstack,", "front to back"], color: GREEN },
    { title: "Security", lines: ["my second", "specialty"], color: BLUE },
  ] as Note[],
  projects: {
    farmagent: {
      title: "How it runs",
      lines: ["Auto-post, auto-scroll & warm-up", "on 12+ real Android phones:", "IG · Facebook · YouTube", "TikTok · RedNote · Douyin"],
      facts: [{ v: "12+", k: "phones" }, { v: "6", k: "platforms" }],
      color: YELLOW,
    },
    sonar: {
      title: "What it does",
      lines: ["An office of AI agents.", "Scores a site on SEO, AEO, GEO,", "fixes it, measures the result."],
      facts: [{ v: "5", k: "agent teams" }, { v: "A/B", k: "control" }],
      color: BLUE,
    },
    promptedsite: {
      title: "In numbers",
      lines: ["500+ prompts in the library.", "Live at promptedsite.com"],
      facts: [{ v: "~100", k: "buyers" }, { v: "$49", k: "one-time" }],
      color: PINK,
    },
    viralengine: {
      title: "Two layers",
      lines: ["1: already viral, scraped", "2: about to go viral (creators'", "engagement velocity)", "Screen shows demo data."],
      facts: [{ v: "6", k: "platforms" }, { v: "2", k: "layers" }],
      color: GREEN,
    },
    security: {
      title: "The details",
      lines: ["Found & responsibly reported", "a data exposure (±200 ASN)", "at Pemprov DKI Jakarta.", "Thesis: real-time site blocker."],
      facts: [{ v: "±200", k: "ASN" }, { v: "97.62%", k: "accuracy" }],
      color: ORANGE,
    },
  } as Record<string, Note>,
  stack: "internal tool — described only",
  skills: [
    { title: "Build", lines: ["Next.js · React · Electron", "TypeScript · Python", "FastAPI · Supabase", "Cloudflare · Polar · Alchemy"], color: YELLOW },
    { title: "AI & automation", lines: ["Multi-agent AI · OpenRouter", "9router · Perplexity API", "Scraping · Android ADB", "BiLSTM + attention"], color: BLUE },
    { title: "Security", lines: ["Pentesting · OWASP Top 10", "Active Directory · Burp", "Nmap · Metasploit · SQLMap", "Nuclei · Kali Linux"], color: PINK },
  ] as Note[],
  experience: { title: "Right now", lines: ["Kerja Web3, since May 2026.", "Before: Timedoor,", "PUPR and PLN."], color: YELLOW } as Note,
  jobs: [
    { role: "Fullstack & AI Automation", org: "Kerja Web3", period: "May 2026 — now", line: "Built FarmAgent, Sonar, PromptedSite and ViralEngine end to end." },
    { role: "Programming Teacher", org: "Timedoor Academy", period: "Jan — Feb 2026", line: "Taught Scratch, Python and web basics, ages 8–17." },
    { role: "Frontend Developer Intern", org: "Kementerian PUPR", period: "Aug — Nov 2025", line: "Built Insight Hub: API catalog, dashboards, RBAC." },
    { role: "Data Analyst Intern", org: "PT PLN (Persero)", period: "Feb — Mar 2025", line: "Anomaly detection: 4,422 possible illegal connections flagged." },
  ],
  certificates: { title: "Issued by", lines: ["Huawei, Google, Microsoft,", "ID-Networkers, Coding Studio.", "2024 — 2026"], color: GREEN } as Note,
  education: { title: "GPA 3.65 / 4.00", lines: ["Graduated", "September 2026"], color: BLUE } as Note,
  contact: {
    title: "Let's talk!",
    lines: ["Open to fullstack & AI", "automation roles,", "and freelance builds."],
    color: YELLOW,
  } as Note,
  /** Post-it hasil FarmAgent (angka dari pemilik): 12 niche × 6 platform. */
  farmStats: { title: "The results", views: "100M", viewsLabel: "views, all accounts", followers: "100K", followersLabel: "followers, all platforms", scope: "12 niches × 6 platforms" },
  /** Lock screen iPhone: notifikasi yang mengantar ke footer. */
  phone: { app: "Zaidan", title: "Got a project?", body: "Scroll down — my inbox is open.", locale: "en-GB", status: "Open for freelance", reply: "Tap to open" },
  /** Footer (dibuka setelah Contact): CTA + kontak + kredit. */
  cta: {
    a: "Let's build",
    b: "something that runs itself.",
    button: "Email me",
    copy: "Copy",
    copied: "Copied",
    note: "say hi!",
    caption: "Open to fullstack & AI automation roles · freelance builds",
    top: "Back to the desk",
  },
  /** Teks 3D: ringkasan tiap section. Detail ada di post-it / benda di scene, jadi tidak diulang. */
  summary: {
    about: { title: "Hi, I'm Zaidan", text: "Fullstack developer & AI automation engineer." },
    farmagent: { title: "FarmAgent", text: "Phone-farm automation: real phones auto-post and warm up accounts on 6 social platforms." },
    sonar: { title: "Sonar", text: "AI agents that improve how search engines and AI answers see a website.", cta: { label: "Visit sonar-seo.vercel.app", href: "https://sonar-seo.vercel.app" } },
    promptedsite: { title: "PromptedSite", text: "A marketplace of motion prompts that turn into websites.", cta: { label: "Visit promptedsite.com", href: "https://promptedsite.com" } },
    viralengine: { title: "ViralEngine", text: "Spots what goes viral, and what is about to, on TikTok, Instagram, YouTube, Facebook, Douyin and RedNote." },
    security: { title: "Security & thesis", text: "Pentesting, a responsible disclosure to Pemprov DKI Jakarta, and an ML thesis." },
    skills: { title: "Toolkit", text: "What I build with, in three groups." },
    experience: { title: "Experience", text: "Four roles, from data analysis to building products end to end." },
    certificates: { title: "Certificates", text: "Nine certificates in security, networking, cloud and AI." },
    education: { title: "Education", text: "B.Eng. in Informatics, Institut Teknologi PLN." },
    contact: { title: "Let's talk!", text: "My inbox is one scroll away." },
  } as Record<string, { title: string; text: string; cta?: { label: string; href: string } }>,
  links: { email: "Email me", linkedin: "LinkedIn", github: "GitHub" },
  footer: `© 2026 ${NAME} · Built with Next.js & three.js`,
  credits: CREDITS,
};

const id: typeof en = {
  nav: { about: "Tentang", work: "Karya", skills: "Skill", experience: "Pengalaman", contact: "Kontak", concepts: "Konsep" },
  role: "Fullstack Developer & AI Automation Engineer",
  loading: "Menyiapkan meja",
  scroll: { hint: "Scroll untuk menjelajah", touch: "Geser ke atas" },
  portfolio: "Portofolio",
  about: [
    { title: "End to end", lines: ["Membangun & merilis produk", "sendiri: API, backend, frontend,", "AI agent, pembayaran, deploy."], color: YELLOW },
    { title: "AI", lines: ["otomasi", "& agen AI"], color: PINK },
    { title: "Web dev", lines: ["fullstack,", "frontend–backend"], color: GREEN },
    { title: "Security", lines: ["spesialisasi", "kedua"], color: BLUE },
  ],
  projects: {
    farmagent: {
      title: "Cara kerjanya",
      lines: ["Auto-post, auto-scroll & warm-up", "di 12+ HP Android sungguhan:", "IG · Facebook · YouTube", "TikTok · RedNote · Douyin"],
      facts: [{ v: "12+", k: "HP" }, { v: "6", k: "platform" }],
      color: YELLOW,
    },
    sonar: {
      title: "Yang dikerjakan",
      lines: ["Kantor berisi agen AI.", "Menilai situs: SEO, AEO, GEO,", "memperbaiki, lalu mengukur."],
      facts: [{ v: "5", k: "tim agen" }, { v: "A/B", k: "kontrol" }],
      color: BLUE,
    },
    promptedsite: {
      title: "Dalam angka",
      lines: ["500+ prompt di galeri.", "Live di promptedsite.com"],
      facts: [{ v: "~100", k: "pembeli" }, { v: "$49", k: "sekali bayar" }],
      color: PINK,
    },
    viralengine: {
      title: "Dua lapisan",
      lines: ["1: sudah viral, hasil scraping", "2: akan viral (velocity", "engagement kreator)", "Layar memakai data demo."],
      facts: [{ v: "6", k: "platform" }, { v: "2", k: "lapisan" }],
      color: GREEN,
    },
    security: {
      title: "Detailnya",
      lines: ["Menemukan & melaporkan", "kebocoran data ±200 ASN", "Pemprov DKI Jakarta.", "Skripsi: pemblokir situs real time."],
      facts: [{ v: "±200", k: "ASN" }, { v: "97.62%", k: "akurasi" }],
      color: ORANGE,
    },
  },
  stack: "tool internal — hanya dijelaskan",
  skills: [
    { title: "Build", lines: ["Next.js · React · Electron", "TypeScript · Python", "FastAPI · Supabase", "Cloudflare · Polar · Alchemy"], color: YELLOW },
    { title: "AI & automation", lines: ["Multi-agent AI · OpenRouter", "9router · Perplexity API", "Scraping · Android ADB", "BiLSTM + attention"], color: BLUE },
    { title: "Security", lines: ["Pentesting · OWASP Top 10", "Active Directory · Burp", "Nmap · Metasploit · SQLMap", "Nuclei · Kali Linux"], color: PINK },
  ],
  experience: { title: "Sekarang", lines: ["Kerja Web3, sejak Mei 2026.", "Sebelumnya: Timedoor,", "PUPR dan PLN."], color: YELLOW },
  jobs: [
    { role: "Fullstack & AI Automation", org: "Kerja Web3", period: "Mei 2026 — sekarang", line: "Membangun FarmAgent, Sonar, PromptedSite dan ViralEngine dari nol." },
    { role: "Programming Teacher", org: "Timedoor Academy", period: "Jan — Feb 2026", line: "Mengajar Scratch, Python dan dasar web, usia 8–17." },
    { role: "Frontend Developer Intern", org: "Kementerian PUPR", period: "Agu — Nov 2025", line: "Membangun Insight Hub: katalog API, dashboard, RBAC." },
    { role: "Data Analyst Intern", org: "PT PLN (Persero)", period: "Feb — Mar 2025", line: "Deteksi anomali: 4.422 dugaan sambungan ilegal ditandai." },
  ],
  certificates: { title: "Diterbitkan oleh", lines: ["Huawei, Google, Microsoft,", "ID-Networkers, Coding Studio.", "2024 — 2026"], color: GREEN },
  education: { title: "IPK 3.65 / 4.00", lines: ["Lulus", "September 2026"], color: BLUE },
  contact: {
    title: "Ayo ngobrol!",
    lines: ["Terbuka untuk posisi fullstack", "& AI automation,", "juga proyek freelance."],
    color: YELLOW,
  },
  farmStats: { title: "Hasilnya", views: "100M", viewsLabel: "views, semua akun", followers: "100K", followersLabel: "followers, semua platform", scope: "12 niche × 6 platform" },
  phone: { app: "Zaidan", title: "Punya proyek?", body: "Scroll ke bawah — inbox saya terbuka.", locale: "id-ID", status: "Terbuka untuk freelance", reply: "Ketuk untuk membuka" },
  cta: {
    a: "Ayo bangun",
    b: "sesuatu yang jalan sendiri.",
    button: "Kirim email",
    copy: "Salin",
    copied: "Tersalin",
    note: "sapa saya!",
    caption: "Terbuka untuk posisi fullstack & AI automation · proyek freelance",
    top: "Kembali ke meja",
  },
  summary: {
    about: { title: "Halo, saya Zaidan", text: "Fullstack developer & AI automation engineer." },
    farmagent: { title: "FarmAgent", text: "Otomasi phone farm: HP sungguhan auto-post & warm-up akun di 6 platform sosial media." },
    sonar: { title: "Sonar", text: "Agen AI yang memperbaiki cara mesin pencari dan jawaban AI melihat sebuah situs.", cta: { label: "Kunjungi sonar-seo.vercel.app", href: "https://sonar-seo.vercel.app" } },
    promptedsite: { title: "PromptedSite", text: "Marketplace motion prompt yang menjadi website.", cta: { label: "Kunjungi promptedsite.com", href: "https://promptedsite.com" } },
    viralengine: { title: "ViralEngine", text: "Menangkap konten yang viral dan yang akan viral di TikTok, Instagram, YouTube, Facebook, Douyin, dan RedNote." },
    security: { title: "Security & skripsi", text: "Pentesting, responsible disclosure ke Pemprov DKI Jakarta, dan skripsi machine learning." },
    skills: { title: "Toolkit", text: "Yang saya pakai untuk membangun, dalam tiga kelompok." },
    experience: { title: "Pengalaman", text: "Empat posisi, dari analisis data sampai membangun produk dari nol." },
    certificates: { title: "Sertifikat", text: "Sembilan sertifikat: keamanan, jaringan, cloud, dan AI." },
    education: { title: "Pendidikan", text: "Sarjana Informatika, Institut Teknologi PLN." },
    contact: { title: "Ayo ngobrol!", text: "Inbox saya tinggal satu scroll lagi." },
  },
  links: { email: "Kirim email", linkedin: "LinkedIn", github: "GitHub" },
  footer: `© 2026 ${NAME} · Dibuat dengan Next.js & three.js`,
  credits: CREDITS,
};

export const COPY = { en, id };
export type Copy = typeof en;
