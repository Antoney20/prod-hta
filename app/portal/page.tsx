'use client'

import React, { useState, useEffect } from 'react';
import { Activity, Clock, User, TrendingUp, AlertCircle, Calendar, Sun, Moon, Sunrise, Sunset, BarChart3, Target, Users, FileText, RefreshCw } from 'lucide-react';
import {
  DashboardData,
  RecentActivity,
  ReviewerWorkload,
  MonthlyTrend
} from '@/types/dashboard/home';
import { getDashboardData, refreshDashboard } from '../api/dashboard/home';
import AuthGuard, { globalUserStore } from "../context/guard";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(globalUserStore.userData);

  console.log("user data", user);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getDashboardData();
        setData(result);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sunrise, color: '#fe7105' };
    if (hour < 17) return { text: 'Good Afternoon', icon: Sun, color: '#27aae1' };
    if (hour < 21) return { text: 'Good Evening', icon: Sunset, color: '#fe7105' };
    return { text: 'Good Night', icon: Moon, color: '#27aae1' };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const MetricCard = ({ icon: Icon, label, value, subtitle, description, color, trend }: {
    icon: any;
    label: string;
    value: number;
    subtitle?: string;
    description?: string;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 hover:border-gray-300 group cursor-pointer relative">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}10` }}>
          <Icon size={20} className="md:w-6 md:h-6" style={{ color }} />
        </div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-50 text-green-700' :
            trend === 'down' ? 'bg-red-50 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs md:text-sm text-gray-600 mb-1 font-medium">{label}</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mb-1">{subtitle}</p>}
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, total, color, description, showPercentage = true }: {
    label: string;
    value: number;
    total: number;
    color: string;
    description?: string;
    showPercentage?: boolean;
  }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="mb-3 group relative">
        <div className="flex justify-between items-center text-xs md:text-sm mb-2">
          <span className="text-gray-700 font-medium truncate pr-2 group-hover:text-gray-900">{label}</span>
          <span className="text-gray-900 font-semibold flex-shrink-0">
            {value} {showPercentage && `(${percentage.toFixed(1)}%)`}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-500 ease-out group-hover:shadow-inner"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  };

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'proposal': return <TrendingUp size={16} className="md:w-5 md:h-5 text-white" />;
        case 'announcement': return <AlertCircle size={16} className="md:w-5 md:h-5 text-white" />;
        case 'task': return <Activity size={16} className="md:w-5 md:h-5 text-white" />;
        case 'comment': return <FileText size={16} className="md:w-5 md:h-5 text-white" />;
        default: return <Clock size={16} className="md:w-5 md:h-5 text-white" />;
      }
    };

    const getColor = () => {
      return activity.type === 'proposal' || activity.type === 'task' ? '#fe7105' : '#27aae1';
    };

    const getDescription = () => {
      switch (activity.type) {
        case 'proposal': return `A new proposal titled "${activity.title}" was submitted by ${activity.user}.`;
        case 'announcement': return `New announcement: "${activity.title}" shared by ${activity.user}.`;
        case 'task': return `Task "${activity.title}" marked as completed by ${activity.user}.`;
        case 'comment': return `New comment added by ${activity.user} on a proposal review.`;
        default: return activity.description;
      }
    };

    return (
      <div className="flex gap-3 md:gap-4 py-3 md:py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-3 md:px-4 -mx-3 md:-mx-4 rounded-lg transition-colors cursor-pointer group">
        <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transform group-hover:scale-105 transition-transform" style={{ backgroundColor: getColor() }}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-semibold text-gray-900 truncate group-hover:text-gray-700">{activity.title}</p>
          <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{getDescription()}</p>
          <div className="flex items-center gap-2 md:gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <User size={11} className="md:w-3 md:h-3" />
              <span className="truncate max-w-[100px] md:max-w-none">{activity.user}</span>
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={11} className="md:w-3 md:h-3" />
              {activity.timestamp}
            </span>
          </div>
        </div>
        {activity.status && (
          <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-700 h-fit flex-shrink-0 font-medium group-hover:bg-gray-200">
            {activity.status}
          </span>
        )}
      </div>
    );
  };

  const ReviewerCard = ({ reviewer }: { reviewer: ReviewerWorkload }) => {
    const progressColor = reviewer.average_progress >= 75 ? '#27aae1' : reviewer.average_progress >= 50 ? '#fe7105' : '#6b7280';
    
    return (
      <div className="p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all transform hover:-translate-y-1 bg-white group cursor-pointer relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${progressColor}15` }}>
              <span className="text-sm font-bold" style={{ color: progressColor }}>
                {reviewer.reviewer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-gray-700">{reviewer.reviewer_name}</p>
              <p className="text-xs text-gray-500">{reviewer.assigned_proposals} proposals assigned</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <p className="text-lg font-bold" style={{ color: progressColor }}>
              {reviewer.average_progress}%
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-green-50 rounded-lg p-2 hover:bg-green-100 transition-colors">
            <p className="text-xs text-green-700 font-medium">Completed Reviews</p>
            <p className="text-lg font-bold text-green-900">{reviewer.completed_reviews}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-2 hover:bg-orange-100 transition-colors">
            <p className="text-xs text-orange-700 font-medium">Pending Reviews</p>
            <p className="text-lg font-bold text-orange-900">{reviewer.pending_reviews}</p>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500 group-hover:shadow-inner"
            style={{
              width: `${reviewer.average_progress}%`,
              backgroundColor: progressColor
            }}
          />
        </div>
      </div>
    );
  };

  const MonthlyTrendItem = ({ trend }: { trend: MonthlyTrend }) => (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-3 rounded-lg transition-colors cursor-pointer group">
      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fe710510' }}>
        <TrendingUp size={16} className="text-[#fe7105]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm font-semibold text-gray-900 group-hover:text-gray-700">{trend.month}</p>
        <p className="text-xs text-gray-600 line-clamp-2">
          {trend.proposals_submitted} proposals submitted, {trend.proposals_approved} approved, {trend.proposals_rejected} rejected.
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 mx-auto mb-4" style={{ borderTopColor: '#fe7105' }} />
          <p className="text-gray-600 text-sm md:text-base font-medium">Loading your personalized dashboard...</p>
          <p className="text-xs text-gray-500 mt-2">Fetching the latest insights and metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center px-4 max-w-md">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} style={{ color: '#fe7105' }} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 text-sm mb-2">{error}</p>
          <p className="text-xs text-gray-500 mb-6">Please try refreshing or contact support if the issue persists.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity shadow-md"
            style={{ backgroundColor: '#27aae1' }}
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalProposals = data.proposal_status_distribution.reduce((sum, item) => sum + item.count, 0);
  const underReview = data.proposal_status_distribution.find(s => s.status === 'Under Review')?.count || 0;
  const approved = data.proposal_status_distribution.find(s => s.status === 'Approved')?.count || 0;

  return (
    <div className="min-h-screen  ">
      {/* Header Section */}
      <div className=" px-2 lg:px-4 py-5  ">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2.5 md:p-3 rounded-xl animate-pulse" style={{ backgroundColor: `${greeting.color}10` }}>
              <GreetingIcon size={24} className="md:w-7 md:h-7" style={{ color: greeting.color }} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 animate-fade-in">
                {greeting.text}, {user?.username || 'User'}!
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Welcome to your personalized dashboard.</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1.5">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <Calendar size={14} className="md:w-4 md:h-4" />
                  <span>{formatDate()}</span>
                </div>
                <span className="hidden sm:inline text-gray-400">•</span>
                <div className="flex items-center gap-2 text-xs md:text-sm font-semibold" style={{ color: greeting.color }}>
                  <Clock size={14} className="md:w-4 md:h-4" />
                  <span>{formatTime()}</span>
                </div>
              </div>
            </div>
          </div>
         
        </div>
      </div>
 
  <hr/>
      {/* Main Content */}
      <div className="px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Key Metrics Grid */}
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 size={20} className="md:w-6 md:h-6 text-gray-700" />
            Key Metrics
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mb-4">Overview of critical performance indicators for your projects.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <MetricCard
              icon={FileText}
              label="Total Proposals"
              value={totalProposals}
              description="Total number of proposals submitted across all categories."
              color="#fe7105"
              trend="up"
            />
            <MetricCard
              icon={Activity}
              label="Under Review"
              value={underReview}
              subtitle="Active reviews"
              description="Proposals currently in the review process."
              color="#27aae1"
            />
            <MetricCard
              icon={TrendingUp}
              label="Approved"
              value={approved}
              subtitle="Success rate"
              description="Proposals that have been approved for implementation."
              color="#fe7105"
              trend="up"
            />
            <MetricCard
              icon={Users}
              label="Active Reviewers"
              value={data.stats.active_reviewers}
              subtitle={`${data.stats.pending_reviews} pending`}
              description="Number of reviewers actively working on proposals."
              color="#27aae1"
            />
          </div>
        </div>

        <div>
       
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <MetricCard
              icon={Users}
              label="Total Users"
              value={data.stats.total_users}
              description="Total active users registered in the system."
              color="#fe7105"
            />
            <MetricCard
              icon={AlertCircle}
              label="Announcements"
              value={data.stats.total_announcements}
              description="Active announcements shared with users."
              color="#27aae1"
            />
            <MetricCard
              icon={Activity}
              label="Active Tasks"
              value={data.stats.total_tasks}
              description="Tasks currently in progress."
              color="#fe7105"
            />
            <MetricCard
              icon={Calendar}
              label="Upcoming Events"
              value={data.stats.total_events}
              description="Events scheduled in the near future."
              color="#27aae1"
            />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Proposal Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Target size={18} className="md:w-5 md:h-5" style={{ color: '#fe7105' }} />
              <h3 className="text-base md:text-lg font-bold text-gray-900">Proposal Status Distribution</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-5">Breakdown of proposals by their current review stage.</p>
            {data.proposal_status_distribution.map((item, idx) => (
              <ProgressBar
                key={idx}
                label={item.status}
                value={item.count}
                total={totalProposals}
                color={idx % 2 === 0 ? '#fe7105' : '#27aae1'}
                description={`Proposals in ${item.status} stage: ${item.count} (${item.percentage}%)`}
              />
            ))}
          </div>

          {/* Thematic Areas */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={18} className="md:w-5 md:h-5" style={{ color: '#27aae1' }} />
              <h3 className="text-base md:text-lg font-bold text-gray-900">Thematic Areas</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-5">Distribution of proposals across key thematic categories.</p>
            {data.thematic_areas.slice(0, 5).map((area) => (
              <ProgressBar
                key={area.id}
                label={area.name}
                value={area.proposal_count}
                total={totalProposals}
                color={area.color_code}
                description={`${area.name}: ${area.proposal_count} proposals`}
              />
            ))}
          </div>

          {/* Priority Distribution */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={18} className="md:w-5 md:h-5" style={{ color: '#fe7105' }} />
              <h3 className="text-base md:text-lg font-bold text-gray-900">Priority Levels</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-5">Proposals categorized by priority level.</p>
            <div className="grid grid-cols-2 gap-3">
              {data.priority_distribution.map((item, idx) => (
                <div key={idx} className="text-center p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow group relative">
                  <p className="text-2xl font-bold mb-1" style={{ color: idx % 2 === 0 ? '#fe7105' : '#27aae1' }}>
                    {item.count}
                  </p>
                  <p className="text-xs font-medium text-gray-700">{item.priority}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.percentage.toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity & Trends Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity size={18} className="md:w-5 md:h-5 text-gray-700" />
                <h3 className="text-base md:text-lg font-bold text-gray-900">Recent Activity</h3>
              </div>
              <span className="text-xs text-gray-500 font-medium">{data.recent_activities?.length || 0} recent updates</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-5">Latest updates on proposals, tasks, announcements, and comments.</p>
            <div className="space-y-0 max-h-[500px] overflow-y-auto">
              {data.recent_activities?.length > 0 ? (
                data.recent_activities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">No recent activities to display.</p>
                  <p className="text-xs text-gray-400 mt-1">Check back later for updates.</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="md:w-5 md:h-5" style={{ color: '#fe7105' }} />
                <h3 className="text-base md:text-lg font-bold text-gray-900">Monthly Trends</h3>
              </div>
              <span className="text-xs text-gray-500 font-medium">{data.monthly_trends?.length || 0} months</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-5">Recent trends in proposal submissions and outcomes.</p>
            <div className="space-y-0 max-h-[500px] overflow-y-auto">
              {data.monthly_trends?.length > 0 ? (
                data.monthly_trends.map((trend, idx) => (
                  <MonthlyTrendItem key={idx} trend={trend} />
                ))
              ) : (
                <div className="text-center py-12">
                  <TrendingUp size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">No trend data available.</p>
                  <p className="text-xs text-gray-400 mt-1">Trends will appear as data is collected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Reviewers */}
        {/* <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users size={18} className="md:w-5 md:h-5" style={{ color: '#27aae1' }} />
              <h3 className="text-base md:text-lg font-bold text-gray-900">Top Reviewers</h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">{data.reviewer_workload?.length || 0} active reviewers</span>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-5">Performance overview of top reviewers by workload and progress.</p>
          <div className="space-y-4">
            {data.reviewer_workload?.length > 0 ? (
              data.reviewer_workload.map(reviewer => (
                <ReviewerCard key={reviewer.id} reviewer={reviewer} />
              ))
            ) : (
              <div className="text-center py-12">
                <Users size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No reviewer data available.</p>
                <p className="text-xs text-gray-400 mt-1">Assign reviewers to see workload details.</p>
              </div>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default DashboardPage;