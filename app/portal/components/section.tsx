'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface SectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPad?: boolean
}

export const Section: React.FC<SectionProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = 'text-gray-500',
  action,
  children,
  className = '',
  noPad = false,
}) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
    <div className={`flex items-start justify-between ${noPad ? 'px-6 pt-5 pb-4' : 'px-6 pt-5 pb-4'} border-b border-gray-50`}>
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={16} className={iconColor} />}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className={noPad ? '' : 'p-6'}>{children}</div>
  </div>
)