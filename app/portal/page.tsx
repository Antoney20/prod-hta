'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar, Clock, Sunrise, Sun, Sunset, Moon,
  FileText, ClipboardList, ActivitySquare, CheckSquare, NotepadTextDashed,
  RefreshCw, AlertCircle, Layers,
} from 'lucide-react'

import { globalUserStore } from '../context/guard'
import { DashboardResponse, DashboardUIData } from '@/types/dashboard/home'
import { getDashboardData } from '../api/dashboard/home'


import { InterventionTrendChart } from './components/trends'

import { Section } from './components/section'
import { StatCard, StatCards } from './components/cards'
import { QuickNav } from './main'

function transformResponse(r: DashboardResponse): DashboardUIData {
  return {
    ...r,
    topPackage: r.packages?.by_package?.[0] ?? null,
  }
}

interface Greeting { text: string; Icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string }
function getGreeting(date: Date): Greeting {
  const h = date.getHours()
  if (h < 12) return { text: 'Good Morning', Icon: Sunrise, color: '#f97316' }
  if (h < 17) return { text: 'Good Afternoon', Icon: Sun, color: '#3b82f6' }
  if (h < 21) return { text: 'Good Evening', Icon: Sunset, color: '#f97316' }
  return { text: 'Good Night', Icon: Moon, color: '#6366f1' }
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardUIData | null>(null)
  const [now, setNow] = useState(new Date())
  const [user] = useState(globalUserStore.userData)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm mb-4">
          <RefreshCw className="w-6 h-6 text-[#27aae1] animate-spin" />
        </div>
        <p className="text-gray-700 font-semibold">Loading dashboard…</p>
        <p className="text-sm text-gray-400 mt-1">Fetching your latest metrics</p>
      </div>
    </div>
  )

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
          className="w-full py-2.5 bg-[#27aae1] hover:bg-[#1d8fc3] text-white font-medium rounded-xl transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )

  if (!data) return null

  const isAdmin = data.counts.scope === 'all'
  const role = user?.role as string | undefined


  const cards: StatCard[] = [
    {
      label: 'Total Interventions',
      value: data.counts.total_intervention_proposals + data.counts.total_national_program_proposals,
      icon: Layers,
      href: '/portal/interventions',
      sub: 'All proposals',
      accent: '#27aae1',
    },
    {
      label: 'Intervention Proposals',
      value: data.counts.total_intervention_proposals,
      icon: FileText,
      href: '/portal/interventions',
      sub: 'View all',
    },
    {
      label: 'National Program Proposals',
      value: data.counts.total_national_program_proposals,
      icon: ActivitySquare,
      href: '/portal/national-programs/proposals',
      sub: 'View proposals',
      accent: '#0ea5e9',
    },
    {
      label: isAdmin ? 'All Tasks' : 'My Tasks',
      value: data.counts.my_tasks,
      icon: CheckSquare,
      href: '/portal/tasks',
      sub: isAdmin ? 'Every task' : 'Assigned to me',
      accent: '#10b981',
    },
    {
      label: isAdmin ? 'All Activities' : 'My Activities',
      value: data.counts.my_activities,
      icon: NotepadTextDashed,
      href: '/portal/activities',
      sub: isAdmin ? 'Every activity' : 'Assigned to me',
      accent: '#f59e0b',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="px-4 py-8 max-w-screen-2xl mx-auto space-y-8">

        <StatCards cards={cards} />

        <InterventionTrendChart trends={data.trends} />


        <QuickNav role={role} />

      </div>
    </div>
  )
}

export default DashboardPage