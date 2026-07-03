'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip,
} from 'chart.js'
import { TrendingUp } from 'lucide-react'
import { DashboardTrends, TrendMode } from '@/types/dashboard/home'
import { Section } from './section'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip)

const MODES: { label: string; value: TrendMode }[] = [
  { label: 'Day', value: 'daily' },
  { label: 'Week', value: 'weekly' },
  { label: 'Month', value: 'monthly' },
]

interface Props {
  trends: DashboardTrends
  defaultMode?: TrendMode
}

export const InterventionTrendChart: React.FC<Props> = ({ trends, defaultMode = 'monthly' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const [mode, setMode] = useState<TrendMode>(defaultMode)

  const series = trends[mode] ?? []

  const draw = useCallback(() => {
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const labels = series.map((p) => p.label)
    const values = series.map((p) => p.count)

    const gradient = ctx.createLinearGradient(0, 0, 0, 260)
    gradient.addColorStop(0, 'rgba(39,170,225,0.35)')
    gradient.addColorStop(1, 'rgba(39,170,225,0.00)')

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: '#27aae1',
          borderWidth: 2.5,
          fill: true,
          backgroundColor: gradient,
          pointBackgroundColor: '#27aae1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: labels.length > 40 ? 0 : 4,
          pointHoverRadius: 6,
          tension: 0.42,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500, easing: 'easeOutQuart' },
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            padding: 12,
            cornerRadius: 10,
            displayColors: false,
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => ` ${item.raw} submission${Number(item.raw) !== 1 ? 's' : ''}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#9ca3af', font: { size: 11 }, maxTicksLimit: 10, maxRotation: 0 },
          },
          y: {
            grid: { color: '#f1f5f9' },
            border: { display: false },
            ticks: { color: '#9ca3af', font: { size: 11 }, precision: 0 },
            beginAtZero: true,
          },
        },
      },
    })
  }, [series])

  useEffect(() => {
    draw()
    return () => { chartRef.current?.destroy(); chartRef.current = null }
  }, [draw])

  const total = series.reduce((s, d) => s + d.count, 0)

  const action = (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
      {MODES.map((m) => (
        <button
          key={m.value}
          onClick={() => setMode(m.value)}
          className={`px-3 py-1 text-xs font-medium transition-colors ${
            mode === m.value ? 'bg-[#27aae1] text-white' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )

  return (
    <Section
      title="Interventions Submitted"
      description={`${total.toLocaleString()} in the selected window`}
      icon={TrendingUp}
      iconColor="text-[#27aae1]"
      action={action}
    >
      <div style={{ height: 260 }}>
        <canvas ref={canvasRef} />
      </div>
    </Section>
  )
}