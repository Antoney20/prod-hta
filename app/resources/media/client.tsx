'use client'

import { getMediaResources } from '@/app/api/dashboard/content'
import Footer from '@/app/components/layouts/footer'
import Navbar from '@/app/components/layouts/navbar'
import { MediaResource } from '@/types/dashboard/content'
import React, { useState, useEffect, useMemo } from 'react'
import {
  FileText, Hospital, Shield, Scale
, Search, Calendar, BookOpen, ChevronRight,
  Users, Heart, Globe, FileDown, ChevronLeft, Loader2, Star,
  Clipboard,
  ExternalLink,
} from 'lucide-react'


const ICON_MAP: Record<string, React.ElementType> = {
  'PDF Document':    FileDown,
  'Web Resource':    FileText,
  'Database':        Hospital,
  'Web Directory':   Heart,
  'Draft Bill':      Shield,
  'Legal Framework': Users,
  'Policy Document': Clipboard,
  default:           FileText,
}

function getIcon(type: string): React.ElementType {
  return ICON_MAP[type] ?? ICON_MAP.default
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const ITEMS_PER_PAGE = 6

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_IDS = ['Regulations', 'Facilities', 'Tariffs', 'Legislation', 'Privacy'] as const

// ─── Resource card (list style) ───────────────────────────────────────────────

function ResourceRow({ resource }: { resource: MediaResource }) {
  const Icon = getIcon(resource.type)
  return (
    <div className="group bg-white border border-gray-200 hover:border-[#27aae1] transition-colors duration-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#27aae1] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

      <div className="flex flex-col lg:flex-row items-start gap-5 p-6">
        {/* Icon */}
        <div className="w-10 h-10 flex items-center justify-center border border-gray-200 group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5 transition-colors duration-200 flex-shrink-0">
          <Icon className="w-4 h-4 text-[#27aae1]" strokeWidth={1.75} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 mb-1 leading-snug">{resource.title}</h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">{resource.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="font-bold uppercase tracking-wider text-[#27aae1] border border-[#27aae1]/20 bg-[#27aae1]/5 px-2 py-0.5">
              {resource.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(resource.date)}
            </span>
            <span className="bg-gray-100 px-2 py-0.5 text-gray-500">{resource.type}</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex-shrink-0 lg:self-center">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#27aae1] hover:bg-[#1a8fc4] text-white text-xs font-bold px-4 py-2.5 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] focus-visible:ring-offset-2 whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Access Resource
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Featured card ────────────────────────────────────────────────────────────

function FeaturedCard({ resource }: { resource: MediaResource }) {
  const Icon = getIcon(resource.type)
  return (
    <div className="group bg-white border border-gray-200 hover:border-[#27aae1] transition-colors duration-200 relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#27aae1] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="w-9 h-9 flex items-center justify-center border border-gray-200 group-hover:border-[#27aae1] group-hover:bg-[#27aae1]/5 transition-colors duration-200">
            <Icon className="w-4 h-4 text-[#27aae1]" strokeWidth={1.75} />
          </div>
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
        </div>

        <h4 className="text-sm font-bold text-gray-900 leading-snug mb-2 line-clamp-2">{resource.title}</h4>
        <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3 flex-1">{resource.description}</p>

        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#27aae1] border border-[#27aae1]/20 bg-[#27aae1]/5 px-2 py-0.5">
            {resource.category}
          </span>
          <span className="text-xs text-gray-400">{formatDate(resource.date)}</span>
        </div>

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#27aae1] hover:bg-[#1a8fc4] text-white text-xs font-bold px-4 py-2.5 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] focus-visible:ring-offset-2"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Access Resource
        </a>
      </div>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 hover:border-[#27aae1] hover:text-[#27aae1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {[...Array(total)].map((_, i) => {
        const p = i + 1
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 flex items-center justify-center text-xs font-bold border transition-colors ${
              current === p
                ? 'bg-[#27aae1] text-white border-[#27aae1]'
                : 'border-gray-300 text-gray-700 hover:border-[#27aae1] hover:text-[#27aae1]'
            }`}
          >
            {p}
          </button>
        )
      })}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-500 hover:border-[#27aae1] hover:text-[#27aae1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const MediaCenter = () => {
  const [searchTerm, setSearchTerm]         = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [resources, setResources]           = useState<MediaResource[]>([])
  const [loading, setLoading]               = useState(true)
  const [currentPage, setCurrentPage]       = useState(1)

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        const response = await getMediaResources()
        setResources(response.results || [])
      } catch (error) {
        console.error('Failed to load resources:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchResources()
  }, [])

  const visible = useMemo(
    () => resources.filter((r) => !r.hide_resource),
    [resources]
  )

  const categories = useMemo(() => [
    { id: 'all', name: 'All Resources', count: visible.length },
    ...CATEGORY_IDS.map((id) => ({
      id,
      name: id,
      count: visible.filter((r) => r.category === id).length,
    })),
  ], [visible])

  const filteredResources = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return visible.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [visible, searchTerm, selectedCategory])

  const featuredResources = useMemo(
    () => visible.filter((r) => r.featured).slice(0, 4),
    [visible]
  )

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE)
  const paginatedResources = filteredResources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategory = (id: string) => {
    setSelectedCategory(id)
    setCurrentPage(1)
  }

  const handleSearch = (q: string) => {
    setSearchTerm(q)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white mt-[57px]">
          <Loader2 className="w-7 h-7 animate-spin text-[#27aae1]" />
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white mt-[57px]">

        {/* ── Page header ── */}
        <section className="bg-white">
          <div className="container mx-auto px-4 sm:px-6 py-12  border-b-2 border-gray-900">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-8 bg-[#27aae1]" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
                    Media Centre
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
                  Resources &amp;{' '}
                  <span className="text-[#27aae1]">Documents</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
                  Access comprehensive resources, regulations, and guidelines for Kenya's Social
                  Health Authority and Universal Health Coverage initiatives.
                </p>
              </div>

              {/* Search */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search resources…"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#27aae1] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Category filters ── */}
        <section className="bg-white  sticky top-[57px] z-10">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 flex-shrink-0 mr-2">Filter:</span>
              {categories.map(({ id, name, count }) => (
                <button
                  key={id}
                  onClick={() => handleCategory(id)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#27aae1] ${
                    selectedCategory === id
                      ? 'bg-[#27aae1] text-white border-[#27aae1]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#27aae1] hover:text-[#27aae1]'
                  }`}
                >
                  {name}
                  <span className={`px-1.5 py-0.5 text-[10px] font-black ${
                    selectedCategory === id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 space-y-12">

          {/* ── Featured resources ── */}
          {selectedCategory === 'all' && !searchTerm && featuredResources.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-[#27aae1]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">Featured</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
                {featuredResources.map((resource) => (
                  <FeaturedCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}

          {/* ── All / filtered resources ── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[#27aae1]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#27aae1]">
                  {selectedCategory === 'all'
                    ? 'All Resources'
                    : `${categories.find((c) => c.id === selectedCategory)?.name} Resources`}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {filteredResources.length} item{filteredResources.length !== 1 ? 's' : ''}
              </span>
            </div>

            {paginatedResources.length > 0 ? (
              <div className="space-y-px border border-gray-200">
                {paginatedResources.map((resource) => (
                  <ResourceRow key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-gray-300">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold text-sm">No resources found</p>
                <p className="text-gray-400 text-xs mt-1">
                  Try adjusting your search terms or selecting a different category.
                </p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setCurrentPage(1) }}
                  className="mt-5 inline-flex items-center gap-2 bg-[#27aae1] hover:bg-[#1a8fc4] text-white text-xs font-bold px-4 py-2.5 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            <Pagination current={currentPage} total={totalPages} onChange={handlePageChange} />
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default MediaCenter