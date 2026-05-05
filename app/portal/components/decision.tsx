'use client'

import React from 'react'
import { Zap, ArrowRightCircle } from 'lucide-react'
import { DecisionStats } from '@/types/dashboard/home'
import { Section } from './section'


const COLORS = ['#3b82f6','#10b981','#f59e0b','#6366f1','#ef4444','#14b8a6']

interface Props {
  decisions: DecisionStats
}

export const DecisionsSection: React.FC<Props> = ({ decisions }) => {
  const total = decisions.by_decision.reduce((s, d) => s + d.count, 0)

  return (
    <Section
      title="Decisions"
      description={`${decisions.total_status_updates} total updates`}
      icon={Zap}
      iconColor="text-purple-500"
    >
      <div className="flex items-center gap-3 bg-indigo-50 rounded-xl p-4 mb-5 border border-indigo-100">
        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <ArrowRightCircle size={18} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-indigo-700">{decisions.moved_to_panel}</p>
          <p className="text-xs text-indigo-500 font-medium">Moved to Panel Review</p>
        </div>
      </div>

      {/* By decision type */}
      {decisions.by_decision.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">By Decision Type</p>
          {decisions.by_decision.map((d, i) => {
            const pct = total > 0 ? (d.count / total) * 100 : 0
            return (
              <div key={d.decision_name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-700 font-medium">{d.decision_name}</span>
                  <span className="text-gray-900 font-bold">{d.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">No decision data available</p>
      )}
    </Section>
  )
}