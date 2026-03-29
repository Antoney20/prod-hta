import React, { useState } from 'react'
import { X, AlertCircle, CheckCircle2, Info, Bell } from 'lucide-react'

export interface AlertItem {
  id: string
  type: 'warning' | 'info' | 'success'
  title: string
  message: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

interface AlertsProps {
  pendingTasks: number
  pendingNotifications: number
  customAlerts?: AlertItem[]
  onAlertClose?: (id: string) => void
}

const getAlertConfig = (type: 'warning' | 'info' | 'success') => {
  const configs = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      title: 'text-yellow-900',
      message: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-700',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      title: 'text-green-900',
      message: 'text-green-700',
    },
  }
  return configs[type]
}

export const AlertItem: React.FC<{
  alert: AlertItem
  onClose: (id: string) => void
}> = ({ alert, onClose }) => {
  const config = getAlertConfig(alert.type)
  const IconComponent = config.icon

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300`}
    >
      <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold ${config.title}`}>
          {alert.title}
        </h4>
        <p className={`text-sm ${config.message} mt-1`}>
          {alert.message}
        </p>
        {alert.action && (
          <div className="mt-3">
            {alert.action.href ? (
              <a
                href={alert.action.href}
                className={`text-sm font-semibold inline-flex items-center gap-1 hover:underline ${
                  alert.type === 'warning'
                    ? 'text-yellow-600 hover:text-yellow-700'
                    : alert.type === 'info'
                      ? 'text-blue-600 hover:text-blue-700'
                      : 'text-green-600 hover:text-green-700'
                }`}
              >
                {alert.action.label}
                <span>→</span>
              </a>
            ) : (
              <button
                onClick={alert.action.onClick}
                className={`text-sm font-semibold inline-flex items-center gap-1 hover:underline ${
                  alert.type === 'warning'
                    ? 'text-yellow-600 hover:text-yellow-700'
                    : alert.type === 'info'
                      ? 'text-blue-600 hover:text-blue-700'
                      : 'text-green-600 hover:text-green-700'
                }`}
              >
                {alert.action.label}
                <span>→</span>
              </button>
            )}
          </div>
        )}
      </div>
      <button
        onClick={() => onClose(alert.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-black/5 rounded"
        aria-label="Close alert"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export const AlertsSection: React.FC<AlertsProps> = ({
  pendingTasks,
  pendingNotifications,
  customAlerts = [],
  onAlertClose,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  )

  const handleCloseAlert = (id: string) => {
    setDismissedAlerts(prev => new Set(prev).add(id))
    onAlertClose?.(id)
  }

  // Build alerts list
  const alerts: AlertItem[] = []

  if (pendingTasks > 0 && !dismissedAlerts.has('pending-tasks')) {
    alerts.push({
      id: 'pending-tasks',
      type: 'warning',
      title: `${pendingTasks} Pending Task${pendingTasks !== 1 ? 's' : ''}`,
      message: `You have ${pendingTasks} task${pendingTasks !== 1 ? 's' : ''} that need${pendingTasks === 1 ? 's' : ''} attention.`,
      action: {
        label: 'View Tasks',
        href: '/portal/tasks',
      },
    })
  }

  if (pendingNotifications > 0 && !dismissedAlerts.has('pending-notifications')) {
    alerts.push({
      id: 'pending-notifications',
      type: 'info',
      title: `${pendingNotifications} New Notification${pendingNotifications !== 1 ? 's' : ''}`,
      message: `You have ${pendingNotifications} notification${pendingNotifications !== 1 ? 's' : ''} to review.`,
      action: {
        label: 'Check Notifications',
        href: 'portal',
      },
    })
  }

  // Add custom alerts that haven't been dismissed
  const visibleCustomAlerts = customAlerts.filter(
    alert => !dismissedAlerts.has(alert.id)
  )

  const allAlerts = [...alerts, ...visibleCustomAlerts]

  // Show "All caught up" if no alerts
  if (allAlerts.length === 0) {
    return (
      <div className="bg-white hidden border border-gray-200 rounded-lg p-4  items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            All caught up! 
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            No pending tasks or notifications right now.
          </p>
        </div>
      </div>
    )
  }

  // Show alerts
  return (
    <div className="space-y-2">
      {allAlerts.map(alert => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onClose={handleCloseAlert}
        />
      ))}
    </div>
  )
}