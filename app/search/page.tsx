import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import Navbar from '@/app/components/layouts/navbar'
import Footer from '@/app/components/layouts/footer'
import { PublicProposal } from '@/types/new/public'
import { News } from '@/types/dashboard/content'
import { slugify } from '@/lib/utils'
import { buildRateLimitCookieValue, checkSearchRateLimit } from '@/lib/search'
import { STATIC_INDEX } from '@/lib/static-info'

interface Props {
  searchParams: { q?: string }
}


async function fetchPublicProposals(): Promise<PublicProposal[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/public/proposals/`,
      { next: { revalidate: 300 } } // cache 5 min
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.results ?? data ?? []
  } catch {
    return []
  }
}

async function fetchNews(): Promise<News[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/content/news/`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.results ?? data ?? []
  } catch {
    return []
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function highlight(text: string, q: string): string {
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="bg-yellow-100 text-yellow-900 rounded-sm px-0.5">$1</mark>'
  )
}

function excerpt(text: string | null, q: string, maxLen = 160): string {
  if (!text) return ''
  const lower = text.toLowerCase()
  const idx = lower.indexOf(q.toLowerCase())
  if (idx === -1) return text.slice(0, maxLen)
  const start = Math.max(0, idx - 60)
  const slice = text.slice(start, start + maxLen)
  return (start > 0 ? '…' : '') + slice + (start + maxLen < text.length ? '…' : '')
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? '').trim()
  if (!q) redirect('/')

  const cookieStore = await cookies()
  const { allowed, remaining } = checkSearchRateLimit(cookieStore)

  if (!allowed) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 py-20 min-h-screen max-w-3xl">
          <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-5">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Search limit reached</p>
              <p className="text-sm text-red-600 mt-1">
                You've used 50 searches this hour. Please try again later.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const qLower = q.toLowerCase()

  const [proposals, news] = await Promise.all([
    fetchPublicProposals(),
    fetchNews(),
  ])

  const matchedProposals = proposals.filter((p) =>
    [p.intervention_name, p.intervention_type, p.beneficiary, p.justification, p.expected_impact, p.reference_number]
      .some((field) => field?.toLowerCase().includes(qLower))
  )

  const matchedNews = news.filter((n) =>
    [n.title, n.excerpt, n.author, n.category]
      .some((field) => field?.toLowerCase().includes(qLower))
  )

  const matchedStatic = STATIC_INDEX.filter((s) =>
    [s.title, s.excerpt].some((field) => field.toLowerCase().includes(qLower))
  )

  const total = matchedProposals.length + matchedNews.length + matchedStatic.length

  // Write incremented rate-limit cookie
  const currentCookieVal = cookieStore.get('_srch_rl')?.value
  const nextCookieVal = buildRateLimitCookieValue(currentCookieVal)
  const windowStart = (() => {
    try { return JSON.parse(atob(currentCookieVal ?? '')).windowStart } catch { return Date.now() }
  })()
  const expiresIn = Math.ceil((windowStart + 60 * 60 * 1000 - Date.now()) / 1000)
  cookieStore.set('_srch_rl', nextCookieVal, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn > 0 ? expiresIn : 3600,
  })

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-12 min-h-screen">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8 pb-6 border-b border-gray-200">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Search results</p>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              &ldquo;{q}&rdquo;
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {total === 0 ? 'No results found' : `${total} result${total !== 1 ? 's' : ''} across all sections`}
              <span className="ml-3 text-gray-300">·</span>
              <span className="ml-3 text-gray-400">{Math.max(0, remaining - 1)} searches remaining this hour</span>
            </p>
          </div>

          {total === 0 && (
            <div className="py-16 text-center text-gray-400">
              <p className="text-lg font-semibold mb-2">Nothing matched &ldquo;{q}&rdquo;</p>
              <p className="text-sm">Try different keywords, or browse the sections directly.</p>
            </div>
          )}

          {matchedProposals.length > 0 && (
            <Section title="Interventions" count={matchedProposals.length}>
              {matchedProposals.map((p) => (
                <ResultCard
                  key={p.id}
                  href={`/interventions/${p.id}`}
                  tag="Intervention"
                  tagColor="blue"
                  title={p.intervention_name ?? p.reference_number}
                  meta={[p.intervention_type, p.beneficiary].filter(Boolean).join(' · ')}
                  excerptHtml={highlight(excerpt(p.justification ?? p.expected_impact, q), q)}
                />
              ))}
            </Section>
          )}

          {matchedNews.length > 0 && (
            <Section title="News" count={matchedNews.length}>
              {matchedNews.map((n) => (
                <ResultCard
                  key={n.id}
                  href={`/news/${slugify(n.title)}`}
                  tag={n.category ?? 'News'}
                  tagColor="teal"
                  title={n.title}
                  meta={[
                    n.author,
                    n.date ? new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
                  ].filter(Boolean).join(' · ')}
                  excerptHtml={highlight(excerpt(n.excerpt, q), q)}
                  image={n.image}
                />
              ))}
            </Section>
          )}

          {matchedStatic.length > 0 && (
            <Section title="Pages & FAQs" count={matchedStatic.length}>
              {matchedStatic.map((s) => (
                <ResultCard
                  key={s.href}
                  href={s.href}
                  tag={s.section}
                  tagColor="gray"
                  title={s.title}
                  excerptHtml={highlight(s.excerpt, q)}
                />
              ))}
            </Section>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-baseline gap-2 mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</h2>
        <span className="text-xs text-gray-300">{count}</span>
      </div>
      <div className="flex flex-col divide-y divide-gray-100 border border-gray-100">
        {children}
      </div>
    </section>
  )
}

const TAG_COLORS: Record<string, string> = {
  blue: 'bg-blue-50 text-[#1d70b8]',
  teal: 'bg-[#27aae1]/10 text-[#27aae1]',
  gray: 'bg-gray-100 text-gray-600',
}

function ResultCard({
  href, tag, tagColor = 'gray', title, meta, excerptHtml, image,
}: {
  href: string
  tag: string
  tagColor?: 'blue' | 'teal' | 'gray'
  title: string
  meta?: string
  excerptHtml?: string
  image?: string | null
}) {
  return (
    <Link href={href} className="group flex items-start gap-4 px-4 py-4 hover:bg-gray-50 transition-colors">
      {image && (
        <div className="relative w-16 h-16 shrink-0 overflow-hidden bg-gray-100 hidden sm:block">
          <Image src={image} alt="" fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${TAG_COLORS[tagColor]}`}>
            {tag}
          </span>
          {meta && <span className="text-xs text-gray-400 truncate">{meta}</span>}
        </div>
        <p className="font-semibold text-gray-900 group-hover:text-[#27aae1] transition-colors text-sm leading-snug mb-1 truncate">
          {title}
        </p>
        {excerptHtml && (
          <p
            className="text-xs text-gray-500 line-clamp-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: excerptHtml }}
          />
        )}
      </div>
      <span className="text-gray-300 group-hover:text-[#27aae1] transition-colors text-lg mt-1 shrink-0">›</span>
    </Link>
  )
}