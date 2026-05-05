'use client'

import React from 'react'
import { Users, BadgeCheck } from 'lucide-react'
import { UserStats } from '@/types/dashboard/home'
import { Section } from './section'


const ROLE_COLORS: Record<string, string> = {
  admin: '#ef4444',
  secretariat: '#f59e0b',
  swg: '#3b82f6',
  panel: '#10b981',
  content_manager: '#8b5cf6',
  user: '#9ca3af',
}

interface Props {
  users: UserStats
}

export const UsersSection: React.FC<Props> = ({ users }) => {
  if (users.scope === 'self') {
    return (
      <Section title="My Profile" icon={BadgeCheck} iconColor="text-blue-500">
        <div className="flex items-center gap-4">
          {users.avatar ? (
            <img src={users.avatar} alt={users.username} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700">
              {users.username.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-gray-900">{users.username}</p>
            <p className="text-xs text-gray-400">{users.email}</p>
            {users.role && (
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                style={{
                  backgroundColor: `${ROLE_COLORS[users.role] ?? '#9ca3af'}18`,
                  color: ROLE_COLORS[users.role] ?? '#9ca3af',
                }}>
                {users.role}
              </span>
            )}
          </div>
        </div>
      </Section>
    )
  }

  const total = users.total_active

  return (
    <Section
      title="Users"
      description={`${total} active accounts`}
      icon={Users}
      iconColor="text-blue-500"
    >
      <div className="flex items-end justify-between mb-4">
        <p className="text-4xl font-bold text-gray-900">{total.toLocaleString()}</p>
        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">Active</span>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">By Role</p>
        {users.by_role.map((r) => {
          const pct = total > 0 ? (r.count / total) * 100 : 0
          const color = ROLE_COLORS[r.role] ?? '#9ca3af'
          return (
            <div key={r.role}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700 capitalize">{r.role.replace(/_/g, ' ')}</span>
                <span className="text-gray-500">{r.count} ({Math.round(pct)}%)</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}