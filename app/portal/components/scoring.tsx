'use client'

import React from 'react'
import { BarChart3 } from 'lucide-react'
import { ScoringStats } from '@/types/dashboard/home'
import { Section } from './section'


interface Props {
  scoring: ScoringStats
}

export const ScoringSection: React.FC<Props> = ({ scoring }) => {
  const pct = scoring.progress_pct

  // Colour cue for the ring
  const ringColor =
    pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#3b82f6'

  // SVG donut ring  
  const r = 40
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <Section title="Scoring Progress" description="Intervention review coverage" icon={BarChart3} iconColor="text-amber-500">
      {/* Big ring */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex-shrink-0">
          <svg width={100} height={100} viewBox="0 0 100 100">
            <circle cx={50} cy={50} r={r} fill="none" stroke="#f3f4f6" strokeWidth={10} />
            <circle
              cx={50} cy={50} r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth={10}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={circ / 4}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
            <text x={50} y={50} textAnchor="middle" dominantBaseline="central"
              fontSize={16} fontWeight="bold" fill="#111827">
              {pct}%
            </text>
          </svg>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-2xl font-bold text-gray-900">{scoring.scored_interventions}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Scored</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-500">{scoring.unscored_interventions}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Remaining</p>
          </div>
        </div>
      </div>

      {/* By reviewer */}
      {scoring.by_reviewer.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Top Reviewers</p>
          {scoring.by_reviewer.slice(0, 6).map((r, i) => {
            const rpct = scoring.total_interventions > 0
              ? (r.scored_count / scoring.total_interventions) * 100
              : 0
            const colors = ['#3b82f6','#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6']
            return (
              <div key={r.reviewer_username}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 font-medium">{r.reviewer_username}</span>
                  <span className="text-gray-500">{r.scored_count} reviewed</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${rpct}%`, backgroundColor: colors[i % colors.length] }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}