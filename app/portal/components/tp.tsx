'use client'

import React, { useRef, useEffect } from 'react'
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { GitBranch } from 'lucide-react'
import { TopicPrioritizationStats } from '@/types/dashboard/home'
import { Section } from './section'


Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

const PALETTE = ['#3b82f6','#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316']

interface Props {
  data: TopicPrioritizationStats
}

export const TopicPrioritizationSection: React.FC<Props> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  const cats = data.by_system_category.slice(0, 7)
  const total = cats.reduce((s, c) => s + c.intervention_count, 0)

  useEffect(() => {
    if (!canvasRef.current || cats.length === 0) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current.getContext('2d')!, {
      type: 'doughnut',
      data: {
        labels: cats.map((c) => c.name),
        datasets: [{
          data: cats.map((c) => c.intervention_count),
          backgroundColor: PALETTE,
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => ` ${item.raw} intervention${Number(item.raw) !== 1 ? 's' : ''}`,
            },
          },
        },
      },
    })
    return () => { chartRef.current?.destroy() }
  }, [data])

  return (
    <Section
      title="Topic Prioritization"
      description={`${data.total_system_categories} categories · ${data.uncategorised_interventions} uncategorised`}
      icon={GitBranch}
      iconColor="text-indigo-500"
    >
      {cats.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No category data yet</p>
      ) : (
        <div className="flex gap-6 items-center">
          {/* Doughnut */}
          <div className="flex-shrink-0" style={{ width: 130, height: 130 }}>
            <canvas ref={canvasRef} />
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 min-w-0">
            {cats.map((c, i) => {
              const pct = total > 0 ? Math.round((c.intervention_count / total) * 100) : 0
              return (
                <div key={c.name} className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                  />
                  <span
                    className="text-xs text-gray-600 overflow-hidden line-clamp-1"
                    style={{ width: '25%', minWidth: 0 }}
                  >
                    {c.name}
                  </span>
                  <span className="text-xs font-semibold text-gray-800 flex-shrink-0">
                    {c.intervention_count}
                    <span className="text-gray-400 font-normal ml-1">({pct}%)</span>
                  </span>
                </div>
              )
            })}
            {data.uncategorised_interventions > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-gray-200 flex-shrink-0" />
                <span
                  className="text-xs text-gray-400 overflow-hidden line-clamp-1"
                  style={{ width: '25%', minWidth: 0 }}
                >
                  Uncategorised
                </span>
                <span className="text-xs font-semibold text-gray-500">{data.uncategorised_interventions}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Section>
  )
}