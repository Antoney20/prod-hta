'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, Search, Loader2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { slugify } from '@/lib/utils'
import { loadDynamicIndex, searchDynamic, STATIC_INDEX } from '@/lib/static-info'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about-us', label: 'About' },
  { href: '/governance', label: 'Governance' },
  {
    href: '/resources',
    label: 'Resources',
    subLinks: [
      { href: '/resources/stakeholders', label: 'Stakeholders' },
      { href: '/resources/media', label: 'Media Centre' },
    ],
  },
  {
    href: '/interventions',
    label: 'Interventions',
    subLinks: [
      { href: '/interventions', label: 'Browse Interventions' },
      { href: '/interventions-form', label: 'Submit a Proposal' },
    ],
  },
  { href: '/news', label: 'News' },
]

interface SearchResult {
  id: string
  title: string
  section: string
  href: string
  meta?: string
  excerpt?: string
}

async function fetchSearchPreview(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return []
  const qLower = q.toLowerCase()
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
  const results: SearchResult[] = []

  const staticMatches = STATIC_INDEX
    .filter((s) =>
      s.title.toLowerCase().includes(qLower) ||
      s.excerpt.toLowerCase().includes(qLower)
    )
    .slice(0, 4)
    .map((s): SearchResult => ({
      id: `static-${s.href}`,
      title: s.title,
      section: s.section,
      href: s.href,
      excerpt: s.excerpt.slice(0, 80),
    }))

  results.push(...staticMatches)

  try {
    const [proposalsRes, newsRes] = await Promise.allSettled([
      fetch(`${base}/public/proposals/`).then((r) => r.json()),
      fetch(`${base}/content/news/`).then((r) => r.json()),
    ])

    if (proposalsRes.status === 'fulfilled') {
      const proposals: any[] = proposalsRes.value?.results ?? proposalsRes.value ?? []
      proposals
        .filter((p) =>
          [p.intervention_name, p.intervention_type, p.beneficiary, p.reference_number]
            .some((f: string | null) => f?.toLowerCase().includes(qLower))
        )
        .slice(0, 3)
        .forEach((p) =>
          results.push({
            id: `p-${p.id}`,
            title: p.intervention_name ?? p.reference_number,
            section: 'Intervention',
            href: `/interventions/${p.reference_number}`,
            meta: p.intervention_type ?? undefined,
          })
        )
    }

    if (newsRes.status === 'fulfilled') {
      const news: any[] = newsRes.value?.results ?? newsRes.value ?? []
      news
        .filter((n) =>
          [n.title, n.excerpt, n.category]
            .some((f: string | null) => f?.toLowerCase().includes(qLower))
        )
        .slice(0, 2)
        .forEach((n) =>
          results.push({
            id: `n-${n.id}`,
            title: n.title,
            section: n.category ?? 'News',
            href: `/news/${slugify(n.title)}`,
            meta: n.author ?? undefined,
          })
        )
    }
  } catch {
    // silent
  }

  return results.slice(0, 8)
}

// ── Active indicator ──────────────────────────────────────────────────────────

function ActiveIndicator() {
  return (
    <motion.span
      layoutId="nav-active-pill"
      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#27aae1]"
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    />
  )
}

// ── Search box ────────────────────────────────────────────────────────────────

// function SearchBox({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
//   const router = useRouter()
//   const [query, setQuery] = useState('')
//   const [results, setResults] = useState<SearchResult[]>([])
//   const [loading, setLoading] = useState(false)
//   const [open, setOpen] = useState(false)
//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
//   const containerRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     if (debounceRef.current) clearTimeout(debounceRef.current)
//     if (!query.trim()) {
//       setResults([])
//       setOpen(false)
//       return
//     }

//     const qLower = query.toLowerCase()
//     const immediateStatic = STATIC_INDEX
//       .filter((s) =>
//         s.title.toLowerCase().includes(qLower) ||
//         s.excerpt.toLowerCase().includes(qLower)
//       )
//       .slice(0, 4)
//       .map((s): SearchResult => ({
//         id: `static-${s.href}`,
//         title: s.title,
//         section: s.section,
//         href: s.href,
//         excerpt: s.excerpt.slice(0, 80),
//       }))

//     if (immediateStatic.length > 0) {
//       setResults(immediateStatic)
//       setOpen(true)
//     }

//     setLoading(true)
//     debounceRef.current = setTimeout(async () => {
//       const res = await fetchSearchPreview(query)
//       setResults(res)
//       setOpen(true)
//       setLoading(false)
//     }, 300)

//     return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
//   }, [query])



function SearchBox({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load dynamic data once on mount — plain fetch, no auth
  useEffect(() => {
    loadDynamicIndex().catch(() => {/* silent — dynamic results just won't show */})
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }

    const qLower = query.toLowerCase()

    // Static — instant
    const staticMatches: SearchResult[] = STATIC_INDEX
      .filter((s) =>
        s.title.toLowerCase().includes(qLower) ||
        s.excerpt.toLowerCase().includes(qLower)
      )
      .slice(0, 5)
      .map((s) => ({
        id: `static-${s.href}`,
        title: s.title,
        section: s.section,
        href: s.href,
        excerpt: s.excerpt.slice(0, 90),
      }))

    // Dynamic — from in-memory cache (already loaded)
    const dynamicMatches: SearchResult[] = searchDynamic(query)
      .slice(0, 4)
      .map((s) => ({
        id: `dyn-${s.href}`,
        title: s.title,
        section: s.section,
        href: s.href,
        excerpt: s.excerpt,
      }))

    const merged = [...staticMatches, ...dynamicMatches].slice(0, 9)
    setResults(merged)
    setOpen(merged.length > 0)
  }, [query])


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const goToSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const q = query.trim()
    if (!q) return
    setOpen(false)
    setQuery('')
    onNavigate?.()
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const handleResultClick = () => {
    setOpen(false)
    setQuery('')
    onNavigate?.()
  }

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.section]) acc[r.section] = []
    acc[r.section].push(r)
    return acc
  }, {})

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form
        onSubmit={goToSearch}
        className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 hover:border-[#27aae1] transition-colors bg-white"
      >
        {/* {loading
          ? <Loader2 className="h-4 w-4 text-gray-300 animate-spin shrink-0" />
          : <Search className="h-4 w-4 text-gray-400 shrink-0" />
        } */}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder="Search…"
          className="text-sm outline-none bg-transparent w-40 text-gray-800 placeholder:text-gray-400"
        />
      </form>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1 w-96 bg-white border border-gray-200 shadow-xl z-50 max-h-[480px] overflow-y-auto"
          >
            <div className="h-0.5 w-full bg-[#27aae1]" />

            {results.length === 0 ? (
              <p className="px-4 py-4 text-sm text-gray-400">
                No results for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <>
                {Object.entries(grouped).map(([section, items]) => (
                  <div key={section}>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {section}
                    </p>
                    <ul>
                      {items.map((r) => (
                        <li key={r.id}>
                          <Link
                            href={r.href}
                            onClick={handleResultClick}
                            className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#27aae1] transition-colors truncate leading-snug">
                                {r.title}
                              </p>
                              {(r.meta || r.excerpt) && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                  {r.meta ?? r.excerpt}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-[#27aae1] transition-colors mt-1 shrink-0" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="border-t border-gray-100 sticky bottom-0 bg-white">
                  <button
                    onClick={goToSearch}
                    className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-[#27aae1] hover:bg-[#f0f9ff] transition-colors"
                  >
                    <span>View all results for &ldquo;{query}&rdquo;</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    setOpenDropdown(null)
    setMobileOpenDropdown(null)
  }, [pathname])

  const handleMouseEnter = (href: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setOpenDropdown(href)
  }

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 120)
  }

  const isLinkActive = (link: (typeof links)[number]) => {
    if ('subLinks' in link && link.subLinks) {
      return pathname === link.href || link.subLinks.some((s) => pathname === s.href)
    }
    return pathname === link.href
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white" />

      <nav className={cn(
        'fixed top-1 left-0 right-0 z-40 bg-white transition-all duration-300',
        scrolled
          ? 'shadow-[0_1px_0_0_#e5e7eb,0_4px_16px_-4px_rgba(0,0,0,0.08)] py-2'
          : 'border-b border-gray-200 py-0'
      )}>
        <div className="container mx-auto">
          <div className="flex items-stretch justify-between h-16">

            <Link href="/" className="flex items-center shrink-0 border-r border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1]">
              <Image src="/images/logo.png" alt="BPTAP" height={110} width={110} className="w-auto h-18 object-contain" priority />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-stretch flex-1 pl-2">
              {links.map((link) => {
                const hasDropdown = 'subLinks' in link && !!link.subLinks
                const isActive = isLinkActive(link)
                const isThisOpen = openDropdown === link.href

                if (hasDropdown) {
                  return (
                    <div
                      key={link.href}
                      className="relative flex items-stretch"
                      onMouseEnter={() => handleMouseEnter(link.href)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button className={cn(
                        'relative flex items-center gap-1 px-3 text-base font-semibold tracking-wide transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#27aae1]',
                        isActive ? 'text-[#27aae1]' : 'text-black hover:text-[#27aae1]'
                      )}>
                        {link.label}
                        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', isThisOpen ? 'rotate-180' : '')} />
                        {isActive && <ActiveIndicator />}
                      </button>

                      <AnimatePresence>
                        {isThisOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-0 w-52 bg-white border border-gray-200 shadow-lg z-50"
                          >
                            <div className="h-0.5 w-full bg-[#27aae1]" />
                            {link.subLinks!.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={cn(
                                  'block px-4 py-3 text-base  border-b border-gray-100 last:border-0 transition-colors',
                                  pathname === sub.href
                                    ? 'text-[#27aae1] bg-blue-50'
                                    : 'text-gray-900 hover:text-[#27aae1] hover:bg-[#f0f9ff]'
                                )}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative flex items-center px-3 text-lg  font-semibold tracking-wide transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#27aae1]',
                      isActive ? 'text-[#27aae1]' : 'text-black hover:text-[#27aae1]'
                    )}
                  >
                    {link.label}
                    {isActive && <ActiveIndicator />}
                  </Link>
                )
              })}

              <div className="flex items-center ml-auto">
                <SearchBox />
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center pl-4 border-l border-gray-100">
              <Link href="/contact" className="inline-flex items-center gap-1.5 bg-[#27aae1] hover:bg-[#1a8fc4] active:bg-[#1279a8] text-white text-sm font-bold px-5 py-2 transition-colors duration-150">
                Contact Us
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="lg:hidden flex items-center">
              <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className="p-2 text-gray-700 hover:text-[#27aae1] transition-colors"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isOpen ? (
                    <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} className="block">
                      <X size={22} />
                    </motion.span>
                  ) : (
                    <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="block">
                      <Menu size={22} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden overflow-hidden border-t-2 border-[#27aae1] bg-white"
            >
              <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col divide-y divide-gray-100">
                {links.map((link, i) => {
                  const hasDropdown = 'subLinks' in link && !!link.subLinks
                  const isActive = isLinkActive(link)
                  const isMobileOpen = mobileOpenDropdown === link.href

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      {hasDropdown ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setMobileOpenDropdown(isMobileOpen ? null : link.href)}
                            className={cn(
                              'w-full flex items-center justify-between py-3 text-sm font-semibold transition-colors',
                              isActive ? 'text-[#27aae1]' : 'text-gray-800'
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {isActive && <span className="w-1 h-4 bg-[#27aae1] rounded-full" />}
                              {link.label}
                            </span>
                            <ChevronDown className={cn('h-4 w-4 transition-transform duration-200 text-gray-400', isMobileOpen ? 'rotate-180' : '')} />
                          </button>
                          <AnimatePresence>
                            {isMobileOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 pb-2 flex flex-col border-l-2 border-[#27aae1]/30 ml-1">
                                  {link.subLinks!.map((sub) => (
                                    <Link
                                      key={sub.href}
                                      href={sub.href}
                                      className={cn(
                                        'py-2.5 text-sm font-medium transition-colors',
                                        pathname === sub.href
                                          ? 'text-[#27aae1] font-semibold'
                                          : 'text-gray-600 hover:text-[#27aae1]'
                                      )}
                                    >
                                      {sub.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={link.href}
                          className={cn(
                            'flex items-center gap-2 py-3 text-sm font-semibold transition-colors',
                            isActive ? 'text-[#27aae1]' : 'text-gray-800 hover:text-[#27aae1]'
                          )}
                        >
                          {isActive && <span className="w-1 h-4 bg-[#27aae1] rounded-full flex-shrink-0" />}
                          {link.label}
                        </Link>
                      )}
                    </motion.div>
                  )
                })}

                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: links.length * 0.04, duration: 0.2 }}
                  className="py-3"
                >
                  <SearchBox onNavigate={() => setIsOpen(false)} className="w-full" />
                </motion.div>

                <div className="pt-4 pb-2">
                  <Link href="/contact" className="flex items-center justify-center bg-[#27aae1] hover:bg-[#1a8fc4] text-white text-sm font-bold py-3 px-6 w-full transition-colors">
                    Contact Us
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}