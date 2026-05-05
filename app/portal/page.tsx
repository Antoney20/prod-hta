'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  FileText,
  CheckCircle2,
  Activity,
  Users,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

import { globalUserStore } from '../context/guard'
import { DashboardResponse, DashboardUIData } from '@/types/dashboard/home'

import { getDashboardData } from '../api/dashboard/home'
import { AlertsSection } from './components/alert'
import { KpiGrid } from './components/kpi-cards'
import { InterventionTrendChart } from './components/trends'
import { TasksSection } from './components/tasks'
import { TopicPrioritizationSection } from './components/tp'
import { ScoringSection } from './components/scoring'
import { DecisionsSection } from './components/decision'
import { PanelSection } from './components/panel'
import { UsersSection } from './components/users'
import { FeedbackSection } from './components/feedback'


function transformResponse(r: DashboardResponse): DashboardUIData {
  return {
    ...r,
    taskCompletionRate: r.tasks.total > 0
      ? Math.round((r.tasks.completed / r.tasks.total) * 100)
      : 0,
    proposalScoringRate: r.scoring && r.proposals.total > 0
      ? Math.round((r.scoring.scored_interventions / r.proposals.total) * 100)
      : 0,
    topCategory: r.topic_prioritization?.by_system_category?.[0] ?? null,
  }
}

// ─────────────────────────────────────────────────────────────
// Greeting
// ─────────────────────────────────────────────────────────────
interface Greeting { text: string; Icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string }

function getGreeting(date: Date): Greeting {
  const h = date.getHours()
  if (h < 12) return { text: 'Good Morning', Icon: Sunrise, color: '#f97316' }
  if (h < 17) return { text: 'Good Afternoon', Icon: Sun, color: '#3b82f6' }
  if (h < 21) return { text: 'Good Evening', Icon: Sunset, color: '#f97316' }
  return { text: 'Good Night', Icon: Moon, color: '#6366f1' }
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardUIData | null>(null)
  const [now, setNow] = useState(new Date())
  const [user] = useState(globalUserStore.userData)

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Fetch
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const resp: DashboardResponse = await getDashboardData()
        setData(transformResponse(resp))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const greeting = getGreeting(now)
  const { Icon: GreetingIcon, color: greetingColor, text: greetingText } = greeting

  const formatDate = () =>
    now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const formatTime = () =>
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm mb-4">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
        <p className="text-gray-700 font-semibold">Loading dashboard…</p>
        <p className="text-sm text-gray-400 mt-1">Fetching your latest metrics</p>
      </div>
    </div>
  )

  // ── Error ──
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-md w-full shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )

  if (!data) return null

  // ── Build KPI cards ──
  const kpiCards = [
    {
      label: 'Total Proposals',
      value: data.proposals.total,
      icon: FileText,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      subValue: 'Submissions in system',
    },
    ...(data.scoring ? [{
      label: 'Interventions Scored',
      value: data.scoring.scored_interventions,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      subValue: `${data.scoring.progress_pct}% coverage`,
    }] : []),
    {
      label: 'Total Tasks',
      value: data.tasks.total,
      icon: Activity,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      subValue: `${data.tasks.completed} completed`,
    },
    ...(data.users && data.users.scope === 'all' ? [{
      label: 'Active Users',
      value: data.users.total_active,
      icon: Users,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      subValue: 'Registered accounts',
    }] : []),
    ...(data.decisions ? [{
      label: 'Moved to Panel',
      value: data.decisions.moved_to_panel,
      icon: Activity,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      subValue: `${data.decisions.total_status_updates} total updates`,
    }] : []),
  ].slice(0, 4) // cap at 4

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertsSection pendingNotifications={0} customAlerts={[]} />

      {/* ── Header (unchanged) ── */}
      <div className="px-4 lg:px-8 py-6 border-b border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2.5 md:p-3 rounded-xl" style={{ backgroundColor: `${greetingColor}15` }}>
              <GreetingIcon style={{ color: greetingColor }} className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {greetingText}, {user?.username || 'User'}!
              </h1>
              <p className="text-sm text-gray-500 mt-1">Welcome to your personalized dashboard.</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{formatDate()}</span>
                </div>
                <span className="hidden sm:inline text-gray-300">•</span>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: greetingColor }}>
                  <Clock size={14} />
                  <span>{formatTime()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="px-4  py-8 max-w-screen-2xl mx-auto space-y-8">

        <KpiGrid cards={kpiCards as any} />

        <InterventionTrendChart
          daily={data.proposals.daily_trend}
          monthly={data.proposals.monthly_trend}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TasksSection tasks={data.tasks} />
          <TopicPrioritizationSection data={data.topic_prioritization} />
        </div>

        {(data.scoring || data.decisions) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.scoring && <ScoringSection scoring={data.scoring} />}
            {data.decisions && <DecisionsSection decisions={data.decisions} />}
          </div>
        )}

        {(data.panel || data.users) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.panel && <PanelSection panel={data.panel} />}
            {data.users && <UsersSection users={data.users} />}
          </div>
        )}

        {data.feedback && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeedbackSection feedback={data.feedback} />
          </div>
        )}

      </div>
    </div>
  )
}

export default DashboardPage