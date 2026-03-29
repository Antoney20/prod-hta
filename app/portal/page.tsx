'use client'

import React, { useState, useEffect } from 'react'
import {
  Activity,
  Clock,
  Calendar,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
  Zap,
  BarChart3,
  GitBranch,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  RefreshCw,
  Loader,
} from 'lucide-react'

import { globalUserStore } from '../context/guard'
import { DashboardResponse, DashboardUIData } from '@/types/dashboard/home'
import { AlertsSection } from './components/alert'

interface MetricCardProps {
  label: string
  value: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  description?: string
  color: 'orange' | 'blue' | 'green' | 'purple'
}

const colorMap = {
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-600' },
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  trend,
  description,
  color,
}) => {
  const colors = colorMap[color]

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 hover:shadow-sm transition-all max-h-80 overflow-y-auto">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colors.bg}`}>{icon}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${
              trend === 'up'
                ? 'text-green-600'
                : trend === 'down'
                  ? 'text-red-600'
                  : 'text-gray-600'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpRight size={14} />
            ) : trend === 'down' ? (
              <ArrowDownRight size={14} />
            ) : null}
            {trend !== 'neutral' && 'vs last month'}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
    </div>
  )
}

interface ProgressItemProps {
  label: string
  value: number
  total: number
  color: string
  showPercentage?: boolean
}

const ProgressItem: React.FC<ProgressItemProps> = ({
  label,
  value,
  total,
  color,
  showPercentage = true,
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {value}
          {showPercentage && ` (${percentage.toFixed(0)}%)`}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  icon: React.ReactNode
  description?: string
  children: React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ title, icon, description, children }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all  max-h-80 overflow-y-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            {icon}
            {title}
          </h3>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

interface GetGreetingReturn {
  text: string
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  color: string
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardUIData | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [user, setUser] = useState(globalUserStore.userData)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Mock data - replace with actual API call
        const mockResponse: DashboardResponse = {
          tasks: {
            total: 1,
            completed: 0,
            overdue: 0,
            upcoming: 1,
            by_status: { new: 1 },
          },
          proposals: {
            total: 14,
            monthly_trend: [
              { month: 'Oct 2025', count: 0 },
              { month: 'Nov 2025', count: 0 },
              { month: 'Dec 2025', count: 0 },
              { month: 'Jan 2026', count: 0 },
              { month: 'Feb 2026', count: 0 },
              { month: 'Mar 2026', count: 14 },
            ],
            by_system_category: [
              {
                name: 'Circulatory System (Heart)',
                count: 3,
              },
              {
                name: 'Skin, Subcutaneous Tissue',
                count: 1,
              },
              {
                name: 'Musculoskeletal System',
                count: 1,
              },
              {
                name: 'Circulatory System (Perfusion)',
                count: 1,
              },
            ],
          },
          scoring: {
            total_scored_interventions: 6,
            by_reviewer: [
              { reviewer_username: 'admin', count: 6 },
              { reviewer_username: 'Tester', count: 3 },
            ],
          },
          decisions: {
            total_updates: 6,
            by_decision: [
              { decision_name: 'Test decision', count: 4 },
              { decision_name: 'discussed', count: 1 },
              { decision_name: 'deferred', count: 1 },
            ],
          },
          system_categories: [
            {
              name: 'Circulatory System (Heart)',
              intervention_count: 3,
            },
            {
              name: 'Musculoskeletal System',
              intervention_count: 1,
            },
            {
              name: 'Skin, Subcutaneous Tissue',
              intervention_count: 1,
            },
            {
              name: 'Circulatory System (Perfusion)',
              intervention_count: 1,
            },
          ],
          users: {
            total_active: 2,
            by_role: [
              { role: 'secretariat', count: 1 },
              { role: 'admin', count: 1 },
            ],
          },
        }

        // Transform data for UI
        const uiData: DashboardUIData = {
          ...mockResponse,
          systemCategories: mockResponse.system_categories,
          proposalCompletionRate:
            mockResponse.proposals.total > 0 ? 65 : 0, // Mock completion rate
          taskCompletionRate:
            mockResponse.tasks.total > 0
              ? (mockResponse.tasks.completed / mockResponse.tasks.total) * 100
              : 0,
          topCategory: mockResponse.system_categories[0] || null,
        }

        setData(uiData)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load dashboard data. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getGreeting = (): GetGreetingReturn => {
    const hour = currentTime.getHours()
    if (hour < 12)
      return { text: 'Good Morning', icon: Sunrise, color: '#f97316' }
    if (hour < 17) return { text: 'Good Afternoon', icon: Sun, color: '#3b82f6' }
    if (hour < 21)
      return { text: 'Good Evening', icon: Sunset, color: '#f97316' }
    return { text: 'Good Night', icon: Moon, color: '#6366f1' }
  }

  const formatDate = (): string => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (): string => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-orange-200 mb-4">
            <RefreshCw className="w-6 h-6 text-orange-600 animate-spin" />
          </div>
          <p className="text-gray-700 font-semibold">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching your latest metrics</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-red-200 p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const greeting = getGreeting()
  const GreetingIcon = greeting.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AlertsSection
          pendingTasks={data.tasks.upcoming}
          pendingNotifications={0}
          customAlerts={[]}
        />
      {/* Header */}
      <div className="px-4 lg:px-8 py-6 border-b border-gray-200 bg-white">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3 md:gap-4">
            <div
              className="p-2.5 md:p-3 rounded-xl"
              style={{ backgroundColor: `${greeting.color}15` }}
            >
              <GreetingIcon  style={{ color: greeting.color }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {greeting.text}, {user?.username || 'User'}!
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome to your personalized dashboard.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{formatDate()}</span>
                </div>
                <span className="hidden sm:inline text-gray-300">•</span>
                <div
                  className="flex items-center gap-2 text-sm font-semibold"
                  style={{ color: greeting.color }}
                >
                  <Clock size={14} />
                  <span>{formatTime()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Primary Metrics */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
            <p className="text-sm text-gray-500 mt-1">
              Key metrics at a glance
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Proposals"
              value={data.proposals.total}
              icon={<FileText className="w-5 h-5 text-orange-600" />}
              color="orange"
              trend="up"
              description="Submissions in system"
            />
            <MetricCard
              label="Interventions Scored"
              value={data.scoring.total_scored_interventions}
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              color="green"
              description="Completed reviews"
            />
            <MetricCard
              label="Active Tasks"
              value={data.tasks.total}
              icon={<Activity className="w-5 h-5 text-blue-600" />}
              color="blue"
              description={`${data.tasks.upcoming} upcoming`}
            />
            <MetricCard
              label="Topic Prioritization "
              value={data.decisions.total_updates}
              icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
              color="purple"
              description="With decision"
            />
          </div>
        </div>

        {/* User Stats (Admin Only) */}
        {data.users && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">User Statistics</h2>
              <p className="text-sm text-gray-500 mt-1">
                System user breakdown and roles
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard
                label="Active Users"
                value={data.users.total_active}
                icon={<Users className="w-5 h-5 text-blue-600" />}
                color="blue"
                description="Registered and active"
              />
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Users by Role
                </h3>
                <div className="space-y-3">
                  {data.users.by_role.map((role, idx) => (
                    <ProgressItem
                      key={idx}
                      label={role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                      value={role.count}
                      total={data.users!.total_active}
                      color={idx % 2 === 0 ? '#f97316' : '#3b82f6'}
                      showPercentage={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Categories */}
          <StatCard
            title="System Categories"
            icon={<GitBranch className="w-5 h-5 text-orange-600" />}
            description="Interventions by category"
          >
            <div className="space-y-3">
              {data.systemCategories.slice(0, 5).map((category, idx) => (
                <ProgressItem
                  key={idx}
                  label={category.name}
                  value={category.intervention_count}
                  total={data.systemCategories.reduce(
                    (sum, c) => sum + c.intervention_count,
                    0
                  )}
                  color={[
                    '#f97316',
                    '#3b82f6',
                    '#10b981',
                    '#8b5cf6',
                    '#ec4899',
                  ][idx % 5]}
                />
              ))}
            </div>
          </StatCard>

          {/* Proposal Status */}
          <StatCard
            title="Task Status Breakdown"
            icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
            description="Current task distribution"
          >
            <div className="space-y-3">
              <ProgressItem
                label="New"
                value={data.tasks.by_status['new'] || 0}
                total={data.tasks.total}
                color="#3b82f6"
              />
              <ProgressItem
                label="In Progress"
                value={data.tasks.by_status['in_progress'] || 0}
                total={data.tasks.total}
                color="#f97316"
              />
              <ProgressItem
                label="Completed"
                value={data.tasks.completed}
                total={data.tasks.total}
                color="#10b981"
              />
            </div>
          </StatCard>
        </div>

        {/* Reviewers & Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Reviewers */}
          <StatCard
            title="Top Reviewers"
            icon={<Users className="w-5 h-5 text-blue-600" />}
            description="Most active scorers"
          >
            <div className="space-y-2">
              {data.scoring.by_reviewer.map((reviewer, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {reviewer.reviewer_username}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {reviewer.count} reviews
                  </span>
                </div>
              ))}
            </div>
          </StatCard>

          {/* Decision Distribution */}
          <StatCard
            title="Decision Distribution"
            icon={<Zap className="w-5 h-5 text-purple-600" />}
            description="Intervention status updates"
          >
            <div className="space-y-2">
              {data.decisions.by_decision.map((decision, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {decision.decision_name}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {decision.count} Interventions
                  </span>
                </div>
              ))}
            </div>
          </StatCard>
        </div>

        {/* Monthly Trends */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Proposal Trends</h2>
            <p className="text-sm text-gray-500 mt-1">
              Monthly submission activity
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.proposals.monthly_trend.map((trend, idx) => (
                <div key={idx} className="text-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    {trend.month}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {trend.count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage