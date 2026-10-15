// Ringkasan fakta per proyek untuk prototipe (sumber: CV + messages/en.json).

export type ProtoProject = {
  key: "farmagent" | "sonar" | "promptedsite" | "viralengine" | "security";
  no: string;
  name: string;
  line: string;
  note: string; // anotasi tulisan tangan
  facts: { v: string; k: string }[];
  stack: string;
  internal: boolean;
};

export const protoProjects: ProtoProject[] = [
  {
    key: "farmagent",
    no: "01",
    name: "FarmAgent",
    line: "A dozen-plus real Android phones, six platforms, one dashboard. Posting and warm-up run by themselves.",
    note: "real phones, not emulators!",
    facts: [
      { v: "12+", k: "devices" },
      { v: "6", k: "platforms" },
      { v: "1", k: "dashboard" },
    ],
    stack: "Electron · Node.js · ADB · 9router",
    internal: true,
  },
  {
    key: "sonar",
    no: "02",
    name: "Sonar",
    line: "An office of AI agents that reads your site the way search engines and AI answers do — then fixes it.",
    note: "5 agent teams in one office",
    facts: [
      { v: "3", k: "SEO · AEO · GEO" },
      { v: "5", k: "agent teams" },
      { v: "A/B", k: "control group" },
    ],
    stack: "Next.js · Supabase · OpenRouter · Perplexity",
    internal: true,
  },
  {
    key: "promptedsite",
    no: "03",
    name: "PromptedSite",
    line: "500+ motion prompts that become websites. Bought by nearly 100 people worldwide.",
    note: "live → promptedsite.com",
    facts: [
      { v: "500+", k: "prompts" },
      { v: "~100", k: "customers" },
      { v: "$49", k: "lifetime" },
    ],
    stack: "Next.js · Supabase · Polar · Alchemy",
    internal: false,
  },
  {
    key: "viralengine",
    no: "04",
    name: "ViralEngine",
    line: "What is viral now — and what is about to be. A trend radar across six platforms.",
    note: "catch it before it peaks",
    facts: [
      { v: "6", k: "platforms" },
      { v: "2", k: "layers" },
      { v: "Δv", k: "velocity" },
    ],
    stack: "Next.js · Supabase · Web scraping",
    internal: true,
  },
  {
    key: "security",
    no: "05",
    name: "Security & Research",
    line: "I test the walls before someone else does. My thesis blocks online gambling sites in real time.",
    note: "97.62% — thesis model",
    facts: [
      { v: "97.62%", k: "accuracy" },
      { v: "8", k: "pentest phases" },
      { v: "±200", k: "records disclosed safely" },
    ],
    stack: "Kali Linux · Python · FastAPI · BiLSTM",
    internal: false,
  },
];

export const me = {
  name: "Zaidan Jibran Azhar",
  role: "Fullstack Developer & AI Automation Engineer",
  edu: "B.Eng. Informatics, Institut Teknologi PLN — GPA 3.65",
  email: "ZaidanJibran86@gmail.com",
};
