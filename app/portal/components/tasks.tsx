'use client'

import React from 'react'
import { CheckSquare, AlertTriangle, Clock, Circle } from 'lucide-react'
import { TaskStats } from '@/types/dashboard/home'
import { Section } from './section'


const STATUS_COLORS: Record<string, string> = {
  new: '#6366f1',
  in_progress: '#f59e0b',
  review: '#3b82f6',
  completed: '#10b981',
  cancelled: '#9ca3af',
}

const bar = (val: number, total: number, color: string) => (
  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{ width: total > 0 ? `${(val / total) * 100}%` : '0%', backgroundColor: color }}
    />
  </div>
)

interface Props {
  tasks: TaskStats
}

export const TasksSection: React.FC<Props> = ({ tasks }) => {
  const completionPct = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0

  return (
    <Section title="Tasks" description="Your workload overview" icon={CheckSquare} iconColor="text-indigo-500">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Total', value: tasks.total, icon: <Circle size={13} className="text-gray-400" /> },
          { label: 'Completed', value: tasks.completed, icon: <CheckSquare size={13} className="text-emerald-500" /> },
          { label: 'Overdue', value: tasks.overdue, icon: <AlertTriangle size={13} className="text-red-500" /> },
          { label: 'Due in 7d', value: tasks.upcoming_7d, icon: <Clock size={13} className="text-amber-500" /> },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              {s.icon}
              <span className="text-xs text-gray-500 font-medium">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Completion progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span className="font-medium text-gray-700">Completion rate</span>
          <span className="font-bold text-gray-900">{completionPct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* By status */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">By Status</p>
        {Object.entries(tasks.by_status).map(([status, count]) => (
          <div key={status}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 capitalize">{status.replace(/_/g, ' ')}</span>
              <span className="text-sm font-semibold text-gray-900">{count}</span>
            </div>
            {bar(count, tasks.total, STATUS_COLORS[status] ?? '#6366f1')}
          </div>
        ))}
      </div>
    </Section>
  )
}