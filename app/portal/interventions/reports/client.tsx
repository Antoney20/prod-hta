"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  Users,
  Target,
  Activity
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { getProposalTrackers } from '@/app/api/dashboard/proposals';
import { getDecisionRationales } from '@/app/api/dashboard/decision-rationale';
import { getImplementations, getImplementationStatistics } from '@/app/api/dashboard/implementation';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

export default function ReportsAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  
  // Data states
  const [proposalStats, setProposalStats] = useState({
    total: 0,
    counties: 0,
    byCounty: {} as Record<string, number>,
    byThematic: {} as Record<string, number>,
    byPriority: {} as Record<string, number>
  });
  
  const [decisionStats, setDecisionStats] = useState({
    approved: 0,
    rejected: 0,
    not_sure: 0,
    byUser: {} as Record<string, { approved: number; rejected: number; not_sure: number }>
  });
  
  const [implementationStats, setImplementationStats] = useState({
    total: 0,
    completed: 0,
    in_progress: 0,
    overdue: 0,
    average_progress: 0,
    monthlyTrend: [] as Array<{ month: string; count: number; completed: number }>
  });

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [proposalsResponse, decisionsResponse, implementationsResponse, implStatsResponse] = await Promise.all([
        getProposalTrackers(),
        getDecisionRationales(),
        getImplementations(),
        getImplementationStatistics()
      ]);

      // Process proposals
      const proposals = proposalsResponse.results || [];
      const countiesSet = new Set<string>();
      const countyCount: Record<string, number> = {};
      const thematicCount: Record<string, number> = {};
      const priorityCount: Record<string, number> = {};

      proposals.forEach(proposal => {
        if (proposal.proposal?.county) {
          countiesSet.add(proposal.proposal.county);
          countyCount[proposal.proposal.county] = (countyCount[proposal.proposal.county] || 0) + 1;
        }
        if (proposal.thematic_area?.name) {
          thematicCount[proposal.thematic_area.name] = (thematicCount[proposal.thematic_area.name] || 0) + 1;
        }
        if (proposal.priority_level) {
          priorityCount[proposal.priority_level] = (priorityCount[proposal.priority_level] || 0) + 1;
        }
      });

      setProposalStats({
        total: proposals.length,
        counties: countiesSet.size,
        byCounty: countyCount,
        byThematic: thematicCount,
        byPriority: priorityCount
      });

      // Process decisions
      const decisions = decisionsResponse.results || [];
      const userDecisions: Record<string, { approved: number; rejected: number; not_sure: number }> = {};
      let approved = 0, rejected = 0, not_sure = 0;

      decisions.forEach(decision => {
        if (decision.decision === 'approved') approved++;
        else if (decision.decision === 'rejected') rejected++;
        else if (decision.decision === 'not_sure') not_sure++;

        if (!userDecisions[decision.decided_by]) {
          userDecisions[decision.decided_by] = { approved: 0, rejected: 0, not_sure: 0 };
        }
        userDecisions[decision.decided_by][decision.decision as keyof typeof userDecisions[string]]++;
      });

      setDecisionStats({
        approved,
        rejected,
        not_sure,
        byUser: userDecisions
      });

      // Process implementations
      const implementations = implementationsResponse.results || [];
      const monthlyData: Record<string, { count: number; completed: number }> = {};

      implementations.forEach(impl => {
        if (impl.implementation_start_date) {
          const month = new Date(impl.implementation_start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          if (!monthlyData[month]) {
            monthlyData[month] = { count: 0, completed: 0 };
          }
          monthlyData[month].count++;
          if (impl.is_completed) {
            monthlyData[month].completed++;
          }
        }
      });

      const monthlyTrend = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      setImplementationStats({
        ...implStatsResponse,
        monthlyTrend
      });

    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Report exported successfully');
  };

  // Chart configurations
  const countyChartData = {
    labels: Object.keys(proposalStats.byCounty).slice(0, 10),
    datasets: [{
      label: 'Proposals by County',
      data: Object.values(proposalStats.byCounty).slice(0, 10),
      backgroundColor: 'rgba(39, 170, 225, 0.8)',
      borderColor: 'rgba(39, 170, 225, 1)',
      borderWidth: 1
    }]
  };

  const decisionChartData = {
    labels: ['Approved', 'Rejected', 'Needs Revision'],
    datasets: [{
      data: [decisionStats.approved, decisionStats.rejected, decisionStats.not_sure],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(251, 191, 36, 0.8)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(251, 191, 36, 1)'
      ],
      borderWidth: 2
    }]
  };

  const userDecisionsChartData = {
    labels: Object.keys(decisionStats.byUser).slice(0, 8),
    datasets: [
      {
        label: 'Approved',
        data: Object.values(decisionStats.byUser).slice(0, 8).map(u => u.approved),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Rejected',
        data: Object.values(decisionStats.byUser).slice(0, 8).map(u => u.rejected),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
      {
        label: 'Needs Revision',
        data: Object.values(decisionStats.byUser).slice(0, 8).map(u => u.not_sure),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
      }
    ]
  };

  const implementationTrendData = {
    labels: implementationStats.monthlyTrend.map(d => d.month),
    datasets: [
      {
        label: 'Started',
        data: implementationStats.monthlyTrend.map(d => d.count),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Completed',
        data: implementationStats.monthlyTrend.map(d => d.completed),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const thematicChartData = {
    labels: Object.keys(proposalStats.byThematic).slice(0, 6),
    datasets: [{
      label: 'Proposals by Thematic Area',
      data: Object.values(proposalStats.byThematic).slice(0, 6),
      backgroundColor: [
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Comprehensive insights into intervention proposals</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchAllData}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Proposals</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{proposalStats.total}</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Counties</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{proposalStats.counties}</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{decisionStats.approved}</p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{decisionStats.rejected}</p>
              </div>
              <div className="bg-red-100 rounded-lg p-3">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section 1: Proposal Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <CardTitle>Proposal Distribution by County</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Top 10 counties with most submissions</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar data={countyChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section 2: Decision Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <CardTitle>Decision Status Overview</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Distribution of all decisions made</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-full h-full">
                <Doughnut data={decisionChartData} options={pieChartOptions} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <CardTitle>Thematic Area Distribution</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Top 6 thematic areas</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-full h-full">
                <Doughnut data={thematicChartData} options={pieChartOptions} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section 3: User Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <CardTitle>Decision by Reviewer</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Top 8 reviewers by decision</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar 
              data={userDecisionsChartData} 
              options={{
                ...chartOptions,
                scales: {
                  x: { stacked: true },
                  y: { stacked: true }
                }
              }} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section 4: Implementation Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              <CardTitle>Implementation Trends</CardTitle>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">In Progress: {implementationStats.in_progress}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Completed: {implementationStats.completed}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Overdue: {implementationStats.overdue}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={implementationTrendData} options={chartOptions} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Average Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {implementationStats.average_progress.toFixed(1)}%
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {implementationStats.total > 0 
                  ? ((implementationStats.completed / implementationStats.total) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}