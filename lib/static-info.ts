import { PublicProposal } from '@/types/new/public'
import { Governance, News } from '@/types/dashboard/content'
import { getGovernanceMembers } from '@/app/api/dashboard/content'

export interface StaticResult {
  title: string
  excerpt: string
  href: string
  section: 'About' | 'FAQs' | 'Governance' | 'Page' | 'Auth' | 'Resources' | 'News' | 'Interventions'
}

export const STATIC_INDEX: StaticResult[] = [
  // ── About ──────────────────────────────────────────────────────
  {
    title: 'About BPTAP',
    excerpt: 'The Benefits Package and Tariffs Advisory Panel is an initiative to promote a transparent, evidence-informed approach to the operationalization of the Social Health Authority (SHA) program in Kenya.',
    href: '/about-us',
    section: 'About',
  },
  {
    title: 'Our mandate and objectives',
    excerpt: 'BPTAP reviews the benefits package for the SHA program, advises on fair pricing and tariffs for healthcare services, and monitors the program for continuous improvement and sustainability.',
    href: '/about-us#mandate',
    section: 'About',
  },
  {
    title: 'Our mission',
    excerpt: 'We promote a transparent, evidence-informed approach to healthcare programs while institutionalizing health technology assessment methodologies in Kenya.',
    href: '/about-us#mission',
    section: 'About',
  },
  {
    title: 'Our vision',
    excerpt: 'To be the leading authority in evidence-informed healthcare decision-making, contributing significantly to the achievement of Universal Health Coverage in Kenya.',
    href: '/about-us#vision',
    section: 'About',
  },
  {
    title: 'What is Health Technology Assessment (HTA)?',
    excerpt: 'HTA is a systematic evaluation process that helps governments decide which healthcare interventions — medicines, devices, procedures — should be adopted based on clinical effectiveness, cost-effectiveness, and social impact.',
    href: '/about-us#hta',
    section: 'About',
  },
  {
    title: 'Why is HTA important in Kenya?',
    excerpt: 'HTA ensures optimal use of limited healthcare resources, promotes equitable access, supports evidence-based policy, and advances Universal Health Coverage by prioritizing cost-effective interventions.',
    href: '/about-us#htaa',
    section: 'About',
  },

  // ── Governance — Structure ──────────────────────────────────────
  {
    title: 'Governance structure',
    excerpt: 'Overview of how BPTAP is structured, including the advisory panel, secretariat, and scientific working groups responsible for evidence-informed decision making.',
    href: '/governance',
    section: 'Governance',
  },

  // ── Governance — Advisory Panel members ────────────────────────
  {
    title: 'Advisory panel members',
    excerpt: 'The BPTAP advisory panel comprises independent experts in health economics, clinical medicine, public health, and health policy from across Kenya.',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Prof. Walter G. Jaoko — Chairperson',
    excerpt: 'Chairperson of the BPTAP Advisory Panel. Affiliated with KAVI – University of Nairobi.',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Dr. Patrick Amoth — Panel Member',
    excerpt: 'Director General for Health and member of the BPTAP Advisory Panel.',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Dr. Mary Kigasia Amuyunzu-Nyamongo — Vice Chairperson',
    excerpt: 'Vice Chairperson of the BPTAP Advisory Panel. Representing the NCD Alliance.',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Dr. Gabriel Muswali — Panel Member',
    excerpt: 'Member of the BPTAP Advisory Panel, representing HENNET.',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Georgina Bonnet Arroyo — Panel Member',
    excerpt: 'Ex-Officio member of the BPTAP Advisory Panel, representing DPHK.',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Dr. Hajara El Busaidy — Panel Member',
    excerpt: 'Member of the BPTAP Advisory Panel, representing the Council of Governors (COG).',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Margaret Macharia — Panel Member',
    excerpt: 'Member of the BPTAP Advisory Panel, representing the Social Health Authority (SHA).',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Nehemiah Odera — Panel Member',
    excerpt: 'Member of the BPTAP Advisory Panel, representing the National Treasury.',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Robert Rapando — Panel Member',
    excerpt: 'Member of the BPTAP Advisory Panel, representing the Council of Governors (CoG).',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Stephen Kaboro — Panel Member',
    excerpt: 'Member of the BPTAP Advisory Panel, representing the Ministry of Health (MoH).',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Dr. Valeria Makory — Panel Member',
    excerpt: 'Member of the BPTAP Advisory Panel, representing the Ministry of Health (MoH).',
    href: '/governance#panel',
    section: 'Governance',
  },
  {
    title: 'Dr. Walter Oyamo Obita — Panel Member',
    excerpt: 'Member of the BPTAP Advisory Panel, representing the Kenya Health Federation (KHF).',
    href: '/governance#panel',
    section: 'Governance',
  },

  // ── Governance — Panel Mandate ──────────────────────────────────
  {
    title: 'Advisory Panel mandate',
    excerpt: 'The BPTAP Advisory Panel is mandated to review and update the existing benefits package and tariffs using health technology assessment, and to identify health interventions not yet available in Kenya.',
    href: '/governance#mandate',
    section: 'Governance',
  },
  {
    title: 'Review and update the benefits package',
    excerpt: 'The panel reviews and updates Kenya\'s existing healthcare benefits package in accordance with applicable health technology assessment standards.',
    href: '/governance#mandate',
    section: 'Governance',
  },
  {
    title: 'Review and update tariffs',
    excerpt: 'The panel reviews and updates existing healthcare tariffs in accordance with applicable health technology assessment methodologies.',
    href: '/governance#mandate',
    section: 'Governance',
  },
  {
    title: 'Identify unavailable health interventions',
    excerpt: 'The panel identifies and defines health interventions that are not yet available in Kenya for potential inclusion in the benefits package.',
    href: '/governance#mandate',
    section: 'Governance',
  },

  // ── Governance — Secretariat members ───────────────────────────
  {
    title: 'Secretariat',
    excerpt: 'The BPTAP secretariat, hosted at the University of Nairobi, coordinates panel activities, manages submissions, and supports evidence review processes.',
    href: '/governance#secretariat',
    section: 'Governance',
  },
  {
    title: 'Dr. Abdiaziz Abdikadir Ahmed — Secretariat Member',
    excerpt: 'Member of the BPTAP Joint Secretariat, representing the University of Nairobi (UoN).',
    href: '/governance#secretariat',
    section: 'Governance',
  },
  {
    title: 'Dr. Christine Wambugu — Secretariat Member',
    excerpt: 'Member of the BPTAP Joint Secretariat, representing the Ministry of Health (MoH).',
    href: '/governance#secretariat',
    section: 'Governance',
  },
  {
    title: 'Francis Motiri, HSC — Secretariat Member',
    excerpt: 'Member of the BPTAP Joint Secretariat, representing the Ministry of Health (MoH).',
    href: '/governance#secretariat',
    section: 'Governance',
  },
  {
    title: 'Dr. Patricia Nyokabi — Secretariat Member',
    excerpt: 'Member of the BPTAP Joint Secretariat, representing CEMA.',
    href: '/governance#secretariat',
    section: 'Governance',
  },
  {
    title: 'Dr. Tabitha Okech — Secretariat Member',
    excerpt: 'Member of the BPTAP Joint Secretariat, representing CEMA.',
    href: '/governance#secretariat',
    section: 'Governance',
  },

  // ── Governance — Secretariat Mandate ───────────────────────────
  {
    title: 'Secretariat mandate',
    excerpt: 'The secretariat brings deep expertise in medicine, health economics, and epidemiology to provide technical assistance and secretarial support to the panel — ensuring every decision is informed, efficient, and impactful.',
    href: '/governance#secretariat-mandate',
    section: 'Governance',
  },
  {
    title: 'Technical assistance and secretarial support',
    excerpt: 'The BPTAP secretariat empowers the panel with specialised knowledge across medicine, health economics, and epidemiology, supporting evidence review and administrative coordination.',
    href: '/governance#secretariat-mandate',
    section: 'Governance',
  },

  // ── Interventions ──────────────────────────────────────────────
  {
    title: 'Browse intervention proposals',
    excerpt: 'View all submitted intervention proposals currently under review by the BPTAP panel, filterable by type, status, and beneficiary group.',
    href: '/interventions',
    section: 'Interventions',
  },
  {
    title: 'Submit an intervention proposal',
    excerpt: 'Stakeholders, organisations, and individuals may submit intervention proposals through the online form for consideration by the BPTAP panel.',
    href: '/interventions-form',
    section: 'Interventions',
  },
  {
    title: 'Intervention assessment criteria',
    excerpt: 'Proposals are assessed on clinical effectiveness, cost-effectiveness, budget impact, equity considerations, and alignment with Kenya\'s health priorities.',
    href: '/interventions#criteria',
    section: 'Interventions',
  },

  // ── Resources ──────────────────────────────────────────────────
  {
    title: 'Resources and media centre',
    excerpt: 'Access comprehensive resources, regulations, guidelines, and documents for Kenya\'s Social Health Authority and Universal Health Coverage initiatives.',
    href: '/resources/media',
    section: 'Resources',
  },
  {
    title: 'Stakeholder resources',
    excerpt: 'Resources and information for stakeholders engaging with the BPTAP process, including submission guidelines and assessment criteria documents.',
    href: '/resources/stakeholders',
    section: 'Resources',
  },

  // ── News ───────────────────────────────────────────────────────
  {
    title: 'News and updates',
    excerpt: 'Stay updated with the latest news, announcements, publications, and events from BPTAP and Kenya\'s universal health coverage programme.',
    href: '/news',
    section: 'News',
  },
  {
    title: 'Research publications',
    excerpt: 'Browse peer-reviewed research, health technology assessment reports, and policy briefs published by BPTAP and partner institutions.',
    href: '/news?category=Research',
    section: 'News',
  },
  {
    title: 'Events and announcements',
    excerpt: 'Find upcoming BPTAP events, stakeholder consultations, public hearings, and panel meeting announcements.',
    href: '/news?category=Events',
    section: 'News',
  },

  // ── Contact & Pages ────────────────────────────────────────────
  {
    title: 'Contact us',
    excerpt: 'Reach the BPTAP secretariat at the University of Nairobi. Email: hbtap@uonbi.ac.ke. Located in Nairobi, Kenya.',
    href: '/contact',
    section: 'Page',
  },

  // ── Auth ───────────────────────────────────────────────────────
  {
    title: 'Sign in to your account',
    excerpt: 'Log in to access the BPTAP portal, submit proposals, review interventions, and manage your account.',
    href: '/auth/login',
    section: 'Auth',
  },
  {
    title: 'Login to Portal',
    excerpt: 'Access the BPTAP portal to manage submissions, review interventions, and update your account.',
    href: '/auth/login',
    section: 'Auth',
  },
  {
    title: 'Sign in to Dashboard',
    excerpt: 'Sign in to your BPTAP dashboard to track progress, manage proposals, and monitor activities.',
    href: '/auth/login',
    section: 'Auth',
  },
  {
    title: 'Portal Sign in',
    excerpt: 'Log in to the BPTAP portal and continue working on your submissions and interventions.',
    href: '/auth/login',
    section: 'Auth',
  },
  {
    title: 'Dashboard Login',
    excerpt: 'Access your dashboard to manage your account, review updates, and handle your BPTAP tasks.',
    href: '/auth/login',
    section: 'Auth',
  },
  {
    title: 'Access Portal Dashboard',
    excerpt: 'Securely log in to the BPTAP portal dashboard and stay on top of your proposals and progress.',
    href: '/auth/login',
    section: 'Auth',
  },
  {
    title: 'Create an account',
    excerpt: 'Register to join the BPTAP platform. Sign up to submit intervention proposals and participate in the review process.',
    href: '/auth/register',
    section: 'Auth',
  },
  {
    title: 'Forgot password',
    excerpt: 'Reset your BPTAP account password. Enter your email address to receive a password reset link.',
    href: '/auth/forgot-password',
    section: 'Auth',
  },

  // ── FAQs ───────────────────────────────────────────────────────
  {
    title: 'What is BPTAP?',
    excerpt: 'BPTAP is an independent advisory body that guides the benefits package for Kenya\'s universal health coverage programme under the Social Health Authority.',
    href: '/faqs#what-is-bptap',
    section: 'FAQs',
  },
  {
    title: 'Who can submit proposals?',
    excerpt: 'Any registered healthcare stakeholder, organisation, or individual may submit an intervention proposal for consideration by the BPTAP panel.',
    href: '/faqs#who-can-submit',
    section: 'FAQs',
  },
  {
    title: 'How are interventions assessed?',
    excerpt: 'Proposals are assessed using health technology assessment methods including clinical effectiveness, cost-effectiveness, and social impact criteria.',
    href: '/faqs#assessment-process',
    section: 'FAQs',
  },
  {
    title: 'What is the Social Health Authority (SHA)?',
    excerpt: 'The SHA is Kenya\'s social health insurance programme. BPTAP advises on which interventions and tariffs should be included in its benefits package.',
    href: '/faqs#sha',
    section: 'FAQs',
  },
  {
    title: 'How long does the review process take?',
    excerpt: 'Review timelines vary depending on the complexity of the intervention and evidence availability. Submitters are notified at each stage.',
    href: '/faqs#timeline',
    section: 'FAQs',
  },
  {
    title: 'How do I track my submission?',
    excerpt: 'After submitting a proposal, track its progress through your BPTAP portal account. You will also receive email notifications at key review milestones.',
    href: '/faqs#tracking',
    section: 'FAQs',
  },
]

// const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

const BASE = "/api"

interface DynamicCache {
  proposals: PublicProposal[]
  news: News[]
  governance: Governance[]
  loadedAt: number | null
}

const cache: DynamicCache = {
  proposals: [],
  news: [],
  governance: [],
  loadedAt: null,
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function loadDynamicIndex(): Promise<void> {
  const now = Date.now()
  if (cache.loadedAt && now - cache.loadedAt < CACHE_TTL_MS) return

  const [proposalsRes, newsRes, governanceRes] = await Promise.allSettled([
    fetch(`${BASE}/v3/proposals/`).then((r) => r.json()),
    fetch(`${BASE}/v1/news/`).then((r) => r.json()),
    getGovernanceMembers(),
  ])

  if (proposalsRes.status === 'fulfilled') {
    cache.proposals = proposalsRes.value?.results ?? []
  }

  if (newsRes.status === 'fulfilled') {
    cache.news = newsRes.value?.results ?? newsRes.value ?? []
  }

  if (governanceRes.status === 'fulfilled') {
    cache.governance = governanceRes.value?.results ?? governanceRes.value ?? []
  }

  cache.loadedAt = now
}

export function searchDynamic(q: string): StaticResult[] {
  if (!q.trim()) return []
  const qLower = q.toLowerCase()
  const results: StaticResult[] = []

  cache.proposals
    .filter((p) =>
      [p.intervention_name, p.intervention_type, p.beneficiary, p.justification, p.reference_number]
        .some((f) => f?.toLowerCase().includes(qLower))
    )
    .slice(0, 4)
    .forEach((p) =>
      results.push({
        title: p.intervention_name ?? p.reference_number,
        excerpt: [p.intervention_type, p.beneficiary].filter(Boolean).join(' · ') || p.justification?.slice(0, 90) || '',
        href: `/interventions/${p.reference_number}`,
        section: 'Interventions',
      })
    )

  cache.news
    .filter((n) =>
      [n.title, n.excerpt, n.category, n.author]
        .some((f) => f?.toLowerCase().includes(qLower))
    )
    .slice(0, 3)
    .forEach((n) =>
      results.push({
        title: n.title,
        excerpt: n.excerpt?.slice(0, 90) ?? '',
        href: `/news/${n.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
        section: 'News',
      })
    )

  // Dynamic governance — live member data from the API
  cache.governance
    .filter((g) =>
      [g.name, g.title, g.role, g.from_organization, g.description]
        .some((f) => f?.toLowerCase().includes(qLower))
    )
    .slice(0, 4)
    .forEach((g) =>
      results.push({
        title: `${g.name}${g.title ? ` — ${g.title}` : ''}`,
        excerpt: [g.role, g.from_organization].filter(Boolean).join(' · ') || g.description?.slice(0, 90) || '',
        href: g.is_secretariat ? '/governance#secretariat' : '/governance#panel',
        section: 'Governance',
      })
    )

  return results
}