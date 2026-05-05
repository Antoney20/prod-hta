'use client'

import React from 'react'
import { Users, ClipboardList, Layers } from 'lucide-react'
import { PanelStats } from '@/types/dashboard/home'
import { Section } from './section'


const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
]

interface Props {
  panel: PanelStats
}

export const PanelSection: React.FC<Props> = ({ panel }) => (
  <Section title="Panel" description="Review panel overview" icon={Users} iconColor="text-emerald-500">
    {/* Stats row */}
    <div className="grid grid-cols-2 gap-3 mb-5">
      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
        <div className="flex items-center gap-1.5 mb-1">
          <ClipboardList size={13} className="text-emerald-600" />
          <span className="text-xs text-emerald-600 font-medium">Scored</span>
        </div>
        <p className="text-2xl font-bold text-emerald-700">{panel.total_scored_interventions}</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
        <div className="flex items-center gap-1.5 mb-1">
          <Layers size={13} className="text-blue-600" />
          <span className="text-xs text-blue-600 font-medium">In Panel</span>
        </div>
        <p className="text-2xl font-bold text-blue-700">{panel.in_panel_count}</p>
      </div>
    </div>

    {/* Members */}
    {panel.panel_members.length > 0 ? (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Members</p>
        {panel.panel_members.map((m, i) => (
          <div key={m.username} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            {m.avatar ? (
              <img src={m.avatar} alt={m.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                {m.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{m.username}</p>
              <p className="text-xs text-gray-400 truncate">{m.email}</p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-400 text-center py-4">No panel members assigned</p>
    )}

    {panel.note && (
      <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-50 italic">{panel.note}</p>
    )}
  </Section>
)