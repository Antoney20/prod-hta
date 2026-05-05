'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from 'chart.js'
import { TrendRange, DailyTrendPoint, MonthlyTrendPoint } from '@/types/dashboard/home'
import { TrendingUp } from 'lucide-react'
import { Section } from './section'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const RANGES: { label: string; value: TrendRange }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'All', value: 'all' },
]

function filterDaily(data: DailyTrendPoint[], range: TrendRange): DailyTrendPoint[] {
  if (range === 'all') return data
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  return data.slice(-days)
}

function aggregateToWeekly(data: DailyTrendPoint[]): { label: string; count: number }[] {
  const weeks: { label: string; count: number }[] = []
  for (let i = 0; i < data.length; i += 7) {
    const chunk = data.slice(i, i + 7)
    weeks.push({
      label: chunk[0]?.date ?? '',
      count: chunk.reduce((s, d) => s + d.count, 0),
    })
  }
  return weeks
}

interface Props {
  daily: DailyTrendPoint[]
  monthly: MonthlyTrendPoint[]
  defaultRange?: TrendRange
}

export const InterventionTrendChart: React.FC<Props> = ({
  daily,
  monthly,
  defaultRange = '90d',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const [range, setRange] = useState<TrendRange>(defaultRange)
//   const [mode, setMode] = useState<'daily' | 'weekly' | 'monthly'>('daily')
const [mode, setMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly')

  const buildDataset = useCallback((): { labels: string[]; values: number[] } => {
    if (mode === 'monthly') {
      return {
        labels: monthly.map((m) => m.month),
        values: monthly.map((m) => m.count),
      }
    }
    const filtered = filterDaily(daily, range)
    if (mode === 'weekly') {
      const agg = aggregateToWeekly(filtered)
      return {
        labels: agg.map((w) => {
          const d = new Date(w.label)
          return isNaN(d.getTime())
            ? w.label
            : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }),
        values: agg.map((w) => w.count),
      }
    }
    return {
      labels: filtered.map((d) => {
        const dt = new Date(d.date)
        return isNaN(dt.getTime())
          ? d.date
          : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }),
      values: filtered.map((d) => d.count),
    }
  }, [daily, monthly, range, mode])

  useEffect(() => {
    // Always destroy the previous chart first
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    // Guard: canvas must be mounted and have a valid context
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { labels, values } = buildDataset()

const gradient = ctx.createLinearGradient(0, 0, 0, 260)

gradient.addColorStop(0, 'rgba(255,255,255,1)')
gradient.addColorStop(0.8, 'rgba(39,170,225,0.25)')
gradient.addColorStop(0.5, 'rgba(39,170,225,0.08)')
gradient.addColorStop(1, 'rgba(39,170,225,0.45)')

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: '#3b82f6',
            borderWidth: 2,
            fill: true,
            backgroundColor: gradient,
            pointBackgroundColor: '#3b82f6',
            pointRadius: labels.length > 60 ? 0 : 3,
            pointHoverRadius: 5,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              title: (items) => items[0].label,
              label: (item) =>
                ` ${item.raw} submission${Number(item.raw) !== 1 ? 's' : ''}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#9ca3af',
              font: { size: 11 },
              maxTicksLimit: 10,
              maxRotation: 0,
            },
          },
          y: {
            grid: { color: '#f3f4f6' },
            border: { display: false, dash: [4, 4] },
            ticks: { color: '#9ca3af', font: { size: 11 }, precision: 0 },
          },
        },
      },
    })

    // Cleanup when the effect re-runs or the component unmounts
    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [buildDataset])

  const rangeTotal = (mode === 'monthly' ? monthly : filterDaily(daily, range)).reduce(
    (s, d) => s + d.count,
    0,
  )

  const rangeAction = (
    <div className="flex items-center gap-3">
      {/* Group mode */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
        {(['daily', 'weekly', 'monthly'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-2.5 py-1 text-xs font-medium transition-colors capitalize ${
              mode === m ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {m === 'daily' ? 'Day' : m === 'weekly' ? 'Wk' : 'Mo'}
          </button>
        ))}
      </div>

      {/* Range (hidden when monthly) */}
      {mode !== 'monthly' && (
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r.value ? 'bg-[#27aae1] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Section
      title="Interventions Submitted"
      description={`${rangeTotal.toLocaleString()} total in selected range`}
      icon={TrendingUp}
      iconColor="text-blue-500"
      action={rangeAction}
    >
      <div style={{ height: 260 }}>
        <canvas ref={canvasRef} />
      </div>
    </Section>
  )
}