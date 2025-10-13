"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { SubmittedProposal } from '@/types/dashboard/submittedProposals';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface InterventionsByDayChartProps {
  proposals: SubmittedProposal[];
}

type ChartType = 'line' | 'bar';
type DateRange = '7' | '14' | '30' | '60' | '90' | 'custom' | 'all';

const InterventionsByDayChart: React.FC<InterventionsByDayChartProps> = ({ proposals }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calculate date range
  const getDateRange = () => {
    const today = new Date();
    const startDate = new Date();
    
    if (dateRange === 'custom') {
      if (customStartDate && customEndDate) {
        return {
          start: new Date(customStartDate),
          end: new Date(customEndDate)
        };
      }
      return { start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), end: today };
    }
    
    if (dateRange === 'all') {
      // Get earliest and latest dates from proposals
      const dates = proposals.map(p => new Date(p.date));
      return {
        start: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : startDate,
        end: today
      };
    }
    
    const days = parseInt(dateRange);
    startDate.setDate(today.getDate() - days);
    return { start: startDate, end: today };
  };

  // Process data for chart
  const chartData = useMemo(() => {
    const { start, end } = getDateRange();
    
    // Filter proposals within date range
    const filteredProposals = proposals.filter(p => {
      const proposalDate = new Date(p.date);
      return proposalDate >= start && proposalDate <= end;
    });

    // Group by date
    const dateCountMap: Record<string, number> = {};
    
    // Fill in all dates in range with 0
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateCountMap[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Count proposals per date
    filteredProposals.forEach(proposal => {
      const dateStr = proposal.date;
      if (dateCountMap.hasOwnProperty(dateStr)) {
        dateCountMap[dateStr]++;
      } else {
        dateCountMap[dateStr] = 1;
      }
    });

    // Sort dates and prepare chart data
    const sortedDates = Object.keys(dateCountMap).sort();
    const counts = sortedDates.map(date => dateCountMap[date]);
    
    // Format labels based on range
    const labels = sortedDates.map(date => {
      const d = new Date(date);
      if (dateRange === 'all' || parseInt(dateRange) > 60) {
        // Show month/day for longer ranges
        return d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      }
      // Show day/month for shorter ranges
      return d.toLocaleDateString('default', { day: 'numeric', month: 'short' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Interventions Submitted',
          data: counts,
          fill: chartType === 'line',
          backgroundColor: chartType === 'line' 
            ? 'rgba(59, 130, 246, 0.1)'
            : 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: chartType === 'line' ? 4 : 0,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [proposals, dateRange, customStartDate, customEndDate, chartType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} intervention${context.parsed.y !== 1 ? 's' : ''}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Number of Interventions',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  // Calculate statistics
  const totalInRange = chartData.datasets[0].data.reduce((sum: number, count: number) => sum + count, 0);
  const avgPerDay = totalInRange / chartData.labels.length;
  const maxInDay = Math.max(...chartData.datasets[0].data.map(d => Number(d)));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle>Interventions by Day</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                max={customEndDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                min={customStartDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total in Range</p>
            <p className="text-2xl font-bold text-blue-600">{totalInRange}</p>
          </div>
       
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Highest in a Day</p>
            <p className="text-2xl font-bold text-purple-600">{maxInDay}</p>
          </div>
        </div>

        <div className="w-full h-[400px]">
          {chartData.labels.length > 0 ? (
            chartType === 'line' ? (
              <Line data={chartData} options={options} />
            ) : (
              <Bar data={chartData} options={options} />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No data available for the selected range</p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {chartData.labels.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing data from {chartData.labels[0]} to {chartData.labels[chartData.labels.length - 1]}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InterventionsByDayChart;