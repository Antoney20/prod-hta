'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import {
  LayoutDashboard, ClipboardList, Layers, FileText, CheckSquare,
  NotepadTextDashed, Gavel, BookText, BarChart3, FolderOpen,
  ActivitySquare, Mail, Users, Sparkles, ClipboardCheck, ListChecks,
  SlidersHorizontal, File, Settings,
} from 'lucide-react'

type Role = 'admin' | 'secretariat' | 'swg' | 'panel' | 'assessment' | 'user' | string | undefined

interface NavCard {
  title: string
  description: string
  href: string
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  roles?: Role[]   // omit = everyone
}

const CARDS: NavCard[] = [
  { title: 'Interventions', description: 'Browse all submitted proposals', href: '/portal/interventions', icon: LayoutDashboard },
  { title: 'National Programs', description: 'Programs and their proposals', href: '/portal/national-programs', icon: ActivitySquare },
  { title: 'Benefits Package', description: 'Current package and tariffs', href: '/portal/benefits-package', icon: ClipboardList },
  { title: 'Interventions by Package', description: 'View interventions grouped by package', href: '/portal/benefits-package/packages', icon: Layers },
  { title: 'Tariff Reimbursements', description: 'Annex line-item tariffs', href: '/portal/benefits-package/annex', icon: FileText },
  { title: 'SWG Prioritized Topics', description: 'Prioritized topics for appraisal', href: '/portal/benefits-package/swg-prioritized', icon: ListChecks },
  { title: 'Appraised Interventions & Services', description: 'Appraisal report of interventions', href: '/portal/benefits-package/appraisal-report', icon: ClipboardList },
  { title: 'Proposed Benefits Package', description: 'Draft revised package', href: '/portal/benefits-package/proposed', icon: FileText },
  { title: 'Revised Benefits Package', description: 'Finalized revised package', href: '/portal/benefits-package/revised-package', icon: FileText },
  { title: 'Task Management', description: 'Your tasks and boards', href: '/portal/tasks', icon: CheckSquare },
  { title: 'Activity Tracker', description: 'Activities and sub-activities', href: '/portal/activities', icon: NotepadTextDashed },
  { title: 'Calendar & Events', description: 'Upcoming meetings and training', href: '/portal/events', icon: FolderOpen },

  // role-gated — topic prioritization
  { title: 'Score Interventions', description: 'Topic prioritization scoring', href: '/portal/tp/category', icon: BarChart3, roles: ['admin', 'swg'] },
  { title: 'Weighted Reports', description: 'Individual weighted reports', href: '/portal/tp/weighting', icon: BarChart3, roles: ['admin', 'swg'] },
  { title: 'Scoring Reports', description: 'Aggregate scoring reports', href: '/portal/tp/reports', icon: BarChart3, roles: ['admin'] },
  { title: 'Review Status', description: 'Track review progress', href: '/portal/tracker/review-status', icon: ActivitySquare, roles: ['admin', 'secretariat'] },
  { title: 'Assign to Batch/Phase', description: 'Assign interventions to a phase', href: '/portal/tracker/phase', icon: Layers, roles: ['admin'] },

  // role-gated — assessment / panel evidence & appraisal
  { title: 'Evidence', description: 'Upload and review evidence', href: '/portal/assessment/evidence', icon: BookText, roles: ['admin', 'panel', 'assessment'] },
  { title: 'Panel Criteria Appraisal Tool', description: 'Configure the appraisal tool', href: '/portal/panel/config/tool', icon: Settings, roles: ['admin', 'panel'] },
  { title: 'Appraisal Template', description: 'Decision template evidence', href: '/portal/panel/data', icon: File, roles: ['admin', 'panel'] },
  { title: 'Panel Scoring', description: 'Score interventions and services', href: '/portal/panel/scoring', icon: ClipboardCheck, roles: ['admin', 'panel'] },
  { title: 'Panel Scores Report', description: 'Aggregated panel scores', href: '/portal/panel/scoring/report', icon: BarChart3, roles: ['admin', 'panel'] },
  { title: 'Panel Survey', description: 'HTA criteria weighting survey', href: '/portal/panel/survey', icon: ListChecks, roles: ['admin', 'panel'] },
  { title: 'Agentic Process', description: 'Agentic appraisal pipeline', href: '/portal/panel/agentic', icon: Sparkles, roles: ['admin', 'panel'] },
  { title: 'Appraisal Results', description: 'Panel appraisal outcomes', href: '/portal/panel/appraisal', icon: Gavel, roles: ['admin', 'panel'] },
  { title: 'Panel Decision', description: 'Record panel decisions', href: '/portal/panel/decision', icon: Gavel, roles: ['admin', 'panel'] },

  // role-gated — admin only
  { title: 'Criteria Weights', description: 'Configure criteria weights', href: '/portal/panel/weights', icon: SlidersHorizontal, roles: ['admin'] },
  { title: 'Auto-Score Rules', description: 'Deterministic auto-scoring rules', href: '/portal/panel/scoring/rules', icon: SlidersHorizontal, roles: ['admin'] },
  { title: 'Email Setup', description: 'Send emails and templates', href: '/portal/feedback/home', icon: Mail, roles: ['admin'] },
  { title: 'Member Directory', description: 'People and roles', href: '/portal/members', icon: Users, roles: ['admin'] },
]

export const QuickNav: React.FC<{ role: Role }> = ({ role }) => {
  const [q, setQ] = useState('')

  const visible = useMemo(() => {
    const byRole = CARDS.filter((c) => !c.roles || (role && c.roles.includes(role)))
    const query = q.trim().toLowerCase()
    if (!query) return byRole
    return byRole.filter(
      (c) => c.title.toLowerCase().includes(query) || c.description.toLowerCase().includes(query),
    )
  }, [role, q])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Quick navigation</h3>
          <p className="text-sm text-gray-500">Jump straight into a section</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sections…"
            className="w-full pl-9 pr-3 h-9 text-sm rounded-lg border border-gray-200 focus:border-[#27aae1] focus:ring-1 focus:ring-[#27aae1] outline-none"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No sections match “{q}”.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((c) => {
            const Icon = c.icon
            return (
              <Link
                key={c.href}
                href={c.href}
                className="group flex items-start gap-3 rounded-xl border border-gray-200 p-4 hover:border-[#27aae1] hover:bg-[#27aae1]/[0.03] transition-colors"
              >
                <span className="rounded-lg bg-gray-50 p-2 text-gray-500 group-hover:text-[#27aae1] group-hover:bg-[#27aae1]/10 transition-colors">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    {c.title}
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#27aae1] group-hover:translate-x-0.5 transition-all" />
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">{c.description}</span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}