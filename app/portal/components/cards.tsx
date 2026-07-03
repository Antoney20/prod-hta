'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export interface StatCard {
  label: string
  value: number
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  href?: string
  sub?: string
  accent?: string   
}

export const StatCards: React.FC<{ cards: StatCard[] }> = ({ cards }) => (
  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
    {cards.map((c) => {
      const Icon = c.icon
      const accent = c.accent ?? '#27aae1'
      const inner = (
        <div className="h-full rounded-2xl border border-gray-200 bg-white p-4 hover:border-[#27aae1] transition-colors">
          <div className="flex items-start justify-between">
            <span className="rounded-lg p-2" style={{ background: `${accent}14`, color: accent }}>
              <Icon className="h-5 w-5" />
            </span>
            {c.href && <ArrowUpRight className="h-4 w-4 text-gray-300" />}
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
            {c.value.toLocaleString()}
          </p>
          <p className="text-[13px] font-medium text-gray-500">{c.label}</p>
          {c.sub && <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>}
        </div>
      )
      return c.href
        ? <Link key={c.label} href={c.href} className="block">{inner}</Link>
        : <div key={c.label}>{inner}</div>
    })}
  </div>
)