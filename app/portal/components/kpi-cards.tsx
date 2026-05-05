'use client'

import React from 'react'
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string | number
  subValue?: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  border?: string
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendLabel,
  border = 'border-gray-100',
}) => (
  <div className={`bg-white rounded-2xl border ${border} p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      {trend && trend !== 'neutral' && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
          trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendLabel}
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 leading-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-wide">{label}</p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  </div>
)

interface KpiGridProps {
  cards: KpiCardProps[]
}

export const KpiGrid: React.FC<KpiGridProps> = ({ cards }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {cards.map((card, i) => (
      <KpiCard key={i} {...card} />
    ))}
  </div>
)