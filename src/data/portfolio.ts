/**
 * Single source of truth for every piece of portfolio copy.
 * Components stay presentational; editing the site means editing this file.
 *
 * Every number and claim below comes from the 2026 CV
 * (public/assets/CV-Andhana-Utama-2026.pdf). Where the CV gives no metric
 * for a piece of work, none is shown.
 */

export interface ProofPoint {
  id: string;
  value: string;
  label: string;
  /** Where the number comes from, shown under it. */
  source: string;
}

export interface Project {
  id: string;
  index: string;
  org: string;
  period: string;
  role: string;
  title: string;
  summary: string;
  did?: string[];
  results?: string[];
  stack?: string[];
  /** Rendered as the lead case study. */
  featured?: boolean;
}

export interface EarlierProject {
  id: string;
  title: string;
  client: string;
  period: string;
}

export interface Role {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  scope: string;
  /** Roles before 2019 are collapsed behind a toggle. */
  earlier?: boolean;
}

export interface Detail {
  label: string;
  value: string;
}

export interface StackGroup {
  id: string;
  label: string;
  items: string[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  /** Public verification URL, when the issuer provides one. */
  href?: string;
}

export interface ContactLink {
  id: string;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

export const profile = {
  name: "Andhana Utama",
  title: "Senior Backend Engineer and Technical Lead",
  location: "Batam, Indonesia",
  timezone: "GMT+7",
  email: "andhanautama@gmail.com",
  github: "https://github.com/magicwarms",
  linkedin: "https://linkedin.com/in/andhana-utama-4a2b1a130",
  cv: "/assets/CV-Andhana-Utama-2026.pdf",
  photo: "/assets/andhana.jpg",
  availability: "Available now",
  workModes: "Remote, Batam (GMT+7), or relocation anywhere in the world",
  headline: "I build backend systems that scale and stay up.",
  intro:
    "Senior backend engineer and technical lead. 11 years shipping Go and Node.js services for teams in Indonesia, Singapore, and Malaysia. Most recently I led the team at Kirimfresh.id and put its customer-facing AI assistant into production.",
  about: [
    "Most of my work sits behind the API: service design, message queues, caching, and the SQL and NoSQL queries underneath. As a tech lead I also set coding standards and API contracts, review code, mentor engineers, and connect engineering with the business side.",
    "I work AI-native. I use Claude Code across the development cycle and review its output critically instead of trusting it. I have shipped a customer-facing AI assistant to production and built a LangChain deep agent with tool-calling subagents.",
  ],
} as const;

export const proof: ProofPoint[] = [
  {
    id: "years",
    value: "11+",
    label: "years building backends",
    source: "2015-2026",
  },
  { id: "downtime", value: "~30%", label: "less downtime", source: "TreeDots" },
  {
    id: "coverage",
    value: "~90%",
    label: "test coverage, ~50% fewer regressions",
    source: "TreeDots",
  },
  {
    id: "infra",
    value: "~30%",
    label: "lower annual infrastructure cost",
    source: "BrainPoolTech",
  },
];

export const projects: Project[] = [
  {
    id: "kirimfresh",
    index: "01",
    org: "Kirimfresh.id",
    period: "2025-2026",
    role: "Technical Lead",
    title: "Ordering, delivery, and an AI assistant",
    summary:
      "I architected and built the production backend for orders, the product catalog, delivery tracking, payments, and notifications.",
    did: [
      "Go (Fiber) services in a layered handler-service-repository design with dependency injection",
      "RabbitMQ event processing for order events, delivery tracking, and notifications via Firebase FCM",
      "A customer-facing AI assistant for recipe search, nutrition questions, product lookups, and support",
      "Payment gateway and third-party API integrations",
    ],
    stack: ["Go", "Fiber", "PostgreSQL", "Redis", "RabbitMQ", "Meilisearch"],
    featured: true,
  },
  {
    id: "thegamechangers",
    index: "02",
    org: "The Game Changers",
    period: "2026",
    role: "Sole developer",
    title: "A bilingual website for an experiential learning company",
    summary:
      "I built thegamechangers.id on my own, from design to launch. The Game Changers is an experiential learning company in Batam that runs Amazing Race, team building, and cultural experiences.",
    did: [
      "Design, build, and launch of the whole site",
      "English and Indonesian versions with a language switcher",
      "An animated dot background drawn on a canvas, with a still version for visitors who set their device to reduce motion",
    ],
  },
  {
    id: "treedots",
    index: "03",
    org: "TreeDots",
    period: "2022-2024",
    role: "Senior Backend Engineer, remote (Singapore)",
    title: "Stabilising a production platform",
    summary:
      "Critical production issues first, then tests, caching, and refactoring on a legacy codebase.",
    results: [
      "Downtime ~30% lower",
      "Test coverage ~90%, regressions ~50% fewer",
      "Database queries ~50% fewer after caching and SQL optimisation",
      "Feature delivery ~25% faster after refactoring",
      "Bugs ~30% fewer after introducing a code review practice",
      "Third-party integrations that contributed to ~15% customer base growth",
      "Shipped the Issue Handling flow for customer order problems",
    ],
    stack: ["Node.js", "GraphQL", "PostgreSQL", "Redis"],
  },
  {
    id: "brainpooltech",
    index: "04",
    org: "BrainPoolTech",
    period: "2020-2022",
    role: "Backend Engineer, remote (Singapore)",
    title: "Nodes: spatial asset tracking",
    summary:
      "Backend for a spatial-data asset-tracking platform serving events, real estate, insurance, construction, and government clients.",
    results: [
      "Annual infrastructure cost ~30% lower after a stack modernisation",
      "Response times ~30% faster",
      "New-feature implementation time ~20% shorter",
    ],
  },
  {
    id: "cudy",
    index: "05",
    org: "Cudy",
    period: "2019-2020",
    role: "Backend Engineer",
    title: "TutorSMS: find a tutor from chat",
    summary: "A Telegram and WhatsApp chatbot for finding tutors nearby.",
    results: [
      "Third-party integrations up ~60% through new REST APIs",
      "~30% annual infrastructure savings after migrating legacy systems",
    ],
    stack: ["Node.js", "Telegram and WhatsApp APIs"],
  },
];

export const earlierProjects: EarlierProject[] = [
  {
    id: "ksop",
    title: "Government document workflow",
    client: "KSOP Kepulauan Sambu port authority",
    period: "2016",
  },
  {
    id: "pln-batam",
    title: "HSE, billing, and asset-management systems",
    client: "Bright PLN Batam, a state-owned electricity utility",
    period: "2018-2019",
  },
];

export const roles: Role[] = [
  {
    id: "kirimfresh",
    title: "Technical Lead",
    company: "Kirimfresh.id",
    location: "Indonesia",
    period: "2025-2026",
    scope:
      "Owned architecture, infrastructure, and performance decisions, and the delivery cycle through release. Set coding standards, API contracts, and team workflows, and worked as the link between engineering and business stakeholders.",
  },
  {
    id: "silentmode",
    title: "Senior Software Engineer",
    company: "Silentmode Sdn. Bhd.",
    location: "Remote, Malaysia",
    period: "2024-2026",
    scope:
      "Backend services for a fully remote team. Code reviews and mentoring for junior engineers. Production support within SLA, with root-cause analysis on recurring customer issues.",
  },
  {
    id: "treedots",
    title: "Senior Backend Engineer",
    company: "TreeDots Pte. Ltd.",
    location: "Remote, Singapore",
    period: "2022-2024",
    scope:
      "Production stability, test automation, caching, and legacy refactoring.",
  },
  {
    id: "brainpooltech",
    title: "Backend Engineer",
    company: "BrainPoolTech Pte. Ltd.",
    location: "Remote, Singapore",
    period: "2020-2022",
    scope:
      "Stack modernisation and query optimisation. Worked with product managers and designers to turn requirements into technical solutions.",
  },
  {
    id: "cudy",
    title: "Backend Engineer",
    company: "Cudy Pte. Ltd.",
    location: "Singapore / Batam",
    period: "2019-2020",
    scope: "REST APIs, legacy migration, and the TutorSMS chatbot.",
  },
  {
    id: "infopro",
    title: "Software Engineer",
    company: "Infopro Mandiri Solusi",
    location: "Batam",
    period: "2019",
    scope:
      "REST APIs that expanded integration capabilities. API response times ~20% faster.",
    earlier: true,
  },
  {
    id: "tellinet",
    title: "Software Engineer",
    company: "Tellinet Teramedia Indonesia",
    location: "Batam",
    period: "2018",
    scope:
      "Backend services and database query optimisation. Response times ~30% faster.",
    earlier: true,
  },
  {
    id: "little-blue-planet",
    title: "Web Administrator",
    company: "Little Blue Planet Indonesia",
    location: "Batam",
    period: "2017-2018",
    scope:
      "Active Directory and Group Policy. Performance profiling cut memory use ~60%.",
    earlier: true,
  },
  {
    id: "proweb-media",
    title: "Backend Engineer",
    company: "Proweb Media Indonesia",
    location: "Batam",
    period: "2015-2017",
    scope:
      "Backend services and REST APIs for internal products. Resource use ~20% lower.",
    earlier: true,
  },
];

export const workDetails: Detail[] = [
  { label: "Based in", value: "Batam, Indonesia (GMT+7)" },
  {
    label: "Open to",
    value: "Remote, hybrid or on-site in Batam, or relocation to any country",
  },
  { label: "Availability", value: "Available now" },
  { label: "Roles", value: "Senior backend engineer, technical lead" },
  {
    label: "Languages",
    value:
      "Bahasa Indonesia (native), English (professional working proficiency)",
  },
];

export const stackGroups: StackGroup[] = [
  {
    id: "languages",
    label: "Languages",
    items: ["Go", "TypeScript", "JavaScript"],
  },
  {
    id: "frameworks",
    label: "Frameworks",
    items: ["Fiber", "Express.js", "NestJS"],
  },
  {
    id: "apis",
    label: "APIs and messaging",
    items: ["REST", "GraphQL", "Event-driven", "RabbitMQ"],
  },
  {
    id: "data",
    label: "Data and search",
    items: ["PostgreSQL", "Redis", "Firebase", "Meilisearch", "SQL and NoSQL"],
  },
  { id: "cloud", label: "Cloud", items: ["Google Cloud Platform", "AWS"] },
  {
    id: "ai",
    label: "AI",
    items: ["Claude Code", "LangChain", "Production AI assistant"],
  },
  {
    id: "practice",
    label: "Practice",
    items: [
      "Automated testing",
      "Code review",
      "Layered architecture with DI",
      "SLA production support",
      "Mentoring",
    ],
  },
];

export const education = {
  school: "Politeknik Negeri Batam",
  degree: "Ahli Madya (D3 Diploma) in Information Technology",
  period: "2011-2014",
  note: "GPA 3.3",
};

export const certifications: Certification[] = [
  {
    id: "nestjs",
    title: "NestJS Zero to Hero, Modern TypeScript Backend Development",
    issuer: "Udemy",
    date: "Jan 2026",
    href: "https://ude.my/UC-99b148db-4a66-4af9-ae91-48fdb5fa18bf",
  },
  {
    id: "cybersecurity",
    title: "The Absolute Beginners Guide to Cyber Security 2026, Part 1",
    issuer: "Udemy",
    date: "Apr 2026",
    href: "https://ude.my/UC-00937141-1e43-45c5-8ef1-511a37dc0f67",
  },
  {
    id: "fcns",
    title: "Foresec Certified in Networking Security (FCNS)",
    issuer: "FORESEC",
    date: "Jul 2014",
  },
  {
    id: "java",
    title: "Java Fundamentals",
    issuer: "Oracle Academy",
    date: "Jun 2014",
  },
];

export const contactLinks: ContactLink[] = [
  {
    id: "email",
    label: "Email",
    value: profile.email,
    href: "mailto:" + profile.email,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "/in/andhana-utama",
    href: profile.linkedin,
    external: true,
  },
  {
    id: "github",
    label: "GitHub",
    value: "magicwarms",
    href: profile.github,
    external: true,
  },
];

export const contact = {
  heading: "Hiring a senior backend engineer?",
  intro:
    "Open to senior backend and technical lead roles: remote, hybrid or on-site in Batam, or relocation anywhere in the world. Tell me about the role, the team, and the system you're building.",
};

export const navItems = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;
