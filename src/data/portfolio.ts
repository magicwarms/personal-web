/**
 * Single source of truth for every piece of portfolio copy.
 * Components stay presentational; editing the site means editing this file.
 */

export interface Stat {
  value: string
  label: string
}

export interface Project {
  id: string
  index: string
  title: string
  org: string
  stack: string
  highlights: string[]
}

export interface Role {
  id: string
  title: string
  company: string
  period: string
  highlights: string[]
  /** Roles before 2019 are collapsed behind a toggle. */
  earlier?: boolean
}

export interface StackGroup {
  id: string
  label: string
  items: string[]
}

export interface Certification {
  id: string
  title: string
  meta: string
}

export interface ContactLink {
  id: string
  label: string
  value: string
  href: string
  external?: boolean
}

export const profile = {
  name: 'Andhana Utama',
  title: 'Senior Backend Engineer · Technical Lead',
  location: 'Batam, Kepulauan Riau, Indonesia',
  timezone: 'Batam, Indonesia · GMT+7',
  email: 'andhanautama@gmail.com',
  github: 'https://github.com/magicwarms',
  linkedin: 'https://linkedin.com/in/andhanautama-4a2b1a130',
  cv: '/assets/CV-Andhana-Utama-2026.pdf',
  photo: '/assets/andhana.jpg',
  intro:
    'Eight years building and scaling backend systems in Go and Node.js across Indonesia, Singapore, and Malaysia. Distributed systems, API design, and the cloud infrastructure underneath them.',
  about: [
    'Senior Backend Engineer and Technical Lead with 8+ years building and scaling backend systems in Go and Node.js across startups and established companies in Indonesia, Singapore, and Malaysia.',
    'Deep expertise in distributed systems, API design (REST, GraphQL, event-driven), and cloud infrastructure (GCP, AWS). Track record of reducing downtime by 30%, cutting infrastructure costs by 30%, and mentoring engineers while shipping business-critical systems.',
  ],
  languages: 'Bahasa Indonesia (native) · English (professional working proficiency)',
  availability: 'Available for new work',
} as const

export const roleTitles = ['Backend Engineer', 'Technical Lead', 'Systems Architect'] as const

export const stats: Stat[] = [
  { value: '8+', label: 'Years engineering' },
  { value: '30%', label: 'Less downtime' },
  { value: '90%', label: 'Test coverage' },
  { value: '30%', label: 'Infra cost cut' },
]

export const projects: Project[] = [
  {
    id: 'kirimfresh-platform',
    index: '01',
    title: 'Order, catalog & delivery platform',
    org: 'Kirimfresh.id · 2025—Present',
    stack: 'Go (Fiber) · PostgreSQL · Redis · RabbitMQ · Meilisearch',
    highlights: [
      'Architected and developed backend system applying a clean handler-service-repository pattern with dependency injection',
      'Designed and maintained RESTful APIs and real-time features supporting order processing, product catalog, and delivery tracking',
      'Supported event-driven architecture using RabbitMQ for asynchronous processing (order events, notifications)',
    ],
  },
  {
    id: 'treedots-testing',
    index: '02',
    title: 'Test automation & caching overhaul',
    org: 'TreeDots · 2022—2024',
    stack: 'Node.js · GraphQL · Redis · PostgreSQL',
    highlights: [
      'Introduced automated testing, increasing test coverage to 90% and cutting regressions by 50%',
      'Implemented caching strategies that reduced database queries by 50% and significantly lowered server load',
      'Refactored legacy codebases, reducing complexity by 30% and increasing feature delivery speed by 25%',
    ],
  },
  {
    id: 'treedots-issue-handling',
    index: '03',
    title: 'Issue Handling for customer orders',
    org: 'TreeDots · 2022—2024',
    stack: 'REST · Third-party integrations',
    highlights: [
      'Built an "Issue Handling" feature for customer order problems, smoothing the customer support flow',
      'Diagnosed and resolved critical production issues, reducing downtime by 30% and improving overall system stability',
      'Integrated third-party APIs, enabling new services and contributing to 15% customer base growth',
    ],
  },
  {
    id: 'cudy-chatbot',
    index: '04',
    title: 'Nearby-tutor chatbot',
    org: 'Cudy · 2019—2020',
    stack: 'Node.js · Telegram & WhatsApp APIs',
    highlights: [
      'Built a chatbot (Telegram and WhatsApp) for finding nearby tutors',
      'Designed and built RESTful APIs that increased third-party integrations by 60%',
      'Migrated legacy systems to more efficient technologies, improving maintainability and reducing technical debt',
    ],
  },
]

export const roles: Role[] = [
  {
    id: 'kirimfresh',
    title: 'Technical Lead',
    company: 'Kirimfresh.id',
    period: '2025—Present · Indonesia',
    highlights: [
      'Led technical decision-making including system architecture, infrastructure choices, and performance optimization strategies',
      'Managed end-to-end delivery lifecycle: backlog grooming, sprint planning, execution tracking, release management',
      'Integrated external services including payment gateways, Firebase FCM, and third-party APIs',
      'Defined and enforced coding standards, API contracts, and development workflows across the team',
    ],
  },
  {
    id: 'silentmode',
    title: 'Senior Software Engineer',
    company: 'Silentmode Sdn. Bhd.',
    period: '2024—2026 · Remote, Malaysia',
    highlights: [
      'Designed and delivered scalable backend solutions with a strong focus on performance, reliability, and maintainability',
      'Led code reviews and mentored junior engineers, accelerating team capability and code quality',
      'Provided production support within SLA, performing root-cause analysis to reduce recurring customer issues',
      'Contributed to system architecture decisions, particularly around scalability and performance under load',
    ],
  },
  {
    id: 'treedots',
    title: 'Senior Backend Engineer',
    company: 'TreeDots Pte. Ltd.',
    period: '2022—2024 · Remote, Singapore',
    highlights: [
      'Diagnosed and resolved critical production issues, reducing downtime by 30% and improving overall system stability',
      'Introduced automated testing, increasing test coverage to 90% and cutting regressions by 50%',
      'Implemented caching strategies that reduced database queries by 50% and significantly lowered server load',
    ],
  },
  {
    id: 'brainpooltech',
    title: 'Back End Engineer',
    company: 'BrainPoolTech Pte. Ltd.',
    period: '2020—2022 · Remote, Singapore',
    highlights: [
      'Evaluated and modernised the tech stack, reducing annual infrastructure costs by 30%',
      'Optimised database queries and backend logic, improving response times by 30%',
      'Worked closely with product managers and designers to translate business requirements into technical solutions',
    ],
  },
  {
    id: 'cudy',
    title: 'Backend Engineer',
    company: 'Cudy Pte. Ltd.',
    period: '2019—2020 · Singapore / Batam',
    highlights: [
      'Designed and built RESTful APIs that increased third-party integrations by 60%',
      'Improved application performance through query optimisation and caching strategies',
      'Integrated external APIs to expand product features and business partnerships',
    ],
  },
  {
    id: 'infopro',
    title: 'Software Engineer',
    company: 'Infopro Mandiri Solusi',
    period: '2019 · Batam, Indonesia',
    earlier: true,
    highlights: [
      'Developed RESTful APIs that significantly expanded integration capabilities',
      'Collaborated across teams to optimise API usage, improving response times by 20%',
    ],
  },
  {
    id: 'tellinet',
    title: 'Software Engineer',
    company: 'Tellinet Teramedia Indonesia',
    period: '2018 · Batam, Indonesia',
    earlier: true,
    highlights: [
      'Optimised backend services and database queries, reducing response times by 30%',
      'Implemented client-side caching strategies, reducing server load and improving page load times',
    ],
  },
  {
    id: 'little-blue-planet',
    title: 'Web Administrator',
    company: 'Little Blue Planet Indonesia',
    period: '2017—2018 · Batam, Indonesia',
    earlier: true,
    highlights: [
      'Managed Active Directory and Group Policy, improving access control and system security',
      'Performed performance profiling and optimisation, reducing memory usage by 60%',
    ],
  },
  {
    id: 'proweb-media',
    title: 'Backend Engineer',
    company: 'Proweb Media Indonesia',
    period: '2015—2017 · Batam, Indonesia',
    earlier: true,
    highlights: [
      'Built and maintained backend services and RESTful APIs supporting multiple internal products',
      'Integrated third-party services to expand application functionality and revenue streams',
    ],
  },
]

export const stackGroups: StackGroup[] = [
  { id: 'languages', label: 'Languages', items: ['Go', 'JavaScript', 'TypeScript'] },
  {
    id: 'frameworks',
    label: 'Backend frameworks',
    items: ['Node.js', 'Express.js', 'GoFiber', 'NestJS'],
  },
  {
    id: 'apis',
    label: 'APIs & messaging',
    items: ['REST', 'GraphQL', 'Event-driven', 'RabbitMQ'],
  },
  {
    id: 'data',
    label: 'Data & search',
    items: ['PostgreSQL', 'SQL & NoSQL', 'Redis', 'Firebase', 'Meilisearch'],
  },
  { id: 'cloud', label: 'Cloud & infrastructure', items: ['Google Cloud Platform', 'AWS'] },
]

export const education = {
  index: '01',
  school: 'Politeknik Negeri Batam',
  meta: '2011—2014 · GPA 3.3',
  detail:
    'Ahli Madya (Associate Expert / D3 Diploma) in Information Technology. Member of the IT Organization in college.',
}

export const certifications: Certification[] = [
  { id: 'nestjs', title: 'NestJS — Zero to Hero Backend Development', meta: 'Jan 2026' },
  {
    id: 'cybersecurity',
    title: 'The Absolute Beginners Guide to Cyber Security 2026 — Part 1',
    meta: 'Apr 2026 · Udemy · 5 hours',
  },
]

export const contactLinks: ContactLink[] = [
  {
    id: 'email',
    label: 'Email',
    value: profile.email,
    href: 'mailto:' + profile.email,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    value: '/in/andhanautama',
    href: profile.linkedin,
    external: true,
  },
  {
    id: 'github',
    label: 'GitHub',
    value: 'magicwarms',
    href: profile.github,
    external: true,
  },
]

export const contactIntro =
  'Open to senior backend and technical lead roles, remote or Batam-based. If you have a system that needs to scale or stay up, get in touch.'

export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'stack', label: 'Stack' },
  { id: 'credentials', label: 'Credentials' },
] as const
