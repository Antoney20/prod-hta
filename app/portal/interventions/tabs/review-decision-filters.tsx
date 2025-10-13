"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ThematicArea } from '@/types/dashboard/intervention';

interface FilterState {
  search: string;
  reviewStage: string;
  county: string;
  thematicArea: string;
  priorityLevel: string;
  implementationStatus: string;
  completionStatus: string;
  dueDateRange: string;
}

interface ReviewDecisionFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  counties: string[];
  thematicAreas: ThematicArea[];
}

const ReviewDecisionFilters: React.FC<ReviewDecisionFiltersProps> = ({
  filters,
  onFiltersChange,
  counties,
  thematicAreas,
}) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      reviewStage: 'all',
      county: 'all',
      thematicArea: 'all',
      priorityLevel: 'all',
      implementationStatus: 'all',
      completionStatus: 'ready_for_decision',
      dueDateRange: 'all',
    });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'completionStatus') return value !== 'ready_for_decision';
      return value !== 'all';
    }
  );

  const getCompletionStatusInfo = (status: string) => {
    const statusInfo = {
      ready_for_decision: { label: 'Ready for Decision', icon: <Clock className="h-4 w-4" />, color: 'text-orange-600' },
      completed_review: { label: 'Completed Review (100%)', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600' },
      pending_decision: { label: 'Pending Decision', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-yellow-600' },
      decided: { label: 'Decision Made', icon: <CheckCircle className="h-4 w-4" />, color: 'text-blue-600' },
      overdue: { label: 'Overdue', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600' },
      all: { label: 'All Interventions', icon: null, color: 'text-gray-600' }
    };
    return statusInfo[status as keyof typeof statusInfo] || statusInfo.all;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Primary Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search interventions..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => updateFilter('search', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {/* Completion Status - Most Important Filter */}
            <div className="lg:col-span-2">
              <Select 
                value={filters.completionStatus} 
                onValueChange={(value) => updateFilter('completionStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Review Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ready_for_decision">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      Ready for Decision (≥75%)
                    </div>
                  </SelectItem>
                  <SelectItem value="completed_review">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Completed Review (100%)
                    </div>
                  </SelectItem>
                  <SelectItem value="pending_decision">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Pending Decision
                    </div>
                  </SelectItem>
                  <SelectItem value="decided">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      Decision Made
                    </div>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Overdue
                    </div>
                  </SelectItem>
                  <SelectItem value="all">All Interventions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Review Stage */}
            <Select 
              value={filters.reviewStage} 
              onValueChange={(value) => updateFilter('reviewStage', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Decision Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="initial">Initial Review</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="needs_revision">Needs Revision</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Level */}
            <Select 
              value={filters.priorityLevel} 
              onValueChange={(value) => updateFilter('priorityLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Urgent
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    High
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Low
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Due Date Range */}
            <Select 
              value={filters.dueDateRange} 
              onValueChange={(value) => updateFilter('dueDateRange', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Due Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="this_week">Due This Week</SelectItem>
                <SelectItem value="this_month">Due This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Secondary Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* County */}
            <Select 
              value={filters.county} 
              onValueChange={(value) => updateFilter('county', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="County" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {counties.map(county => (
                  <SelectItem key={county} value={county}>
                    {county}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Thematic Area */}
            <Select 
              value={filters.thematicArea} 
              onValueChange={(value) => updateFilter('thematicArea', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Thematic Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {thematicAreas.map(area => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: area.color_code }}
                      />
                      {area.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600 py-1">Active filters:</span>
              
              {filters.search && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Search: "{filters.search}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 text-blue-600 hover:text-blue-800"
                    onClick={() => updateFilter('search', '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.completionStatus !== 'ready_for_decision' && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  {getCompletionStatusInfo(filters.completionStatus).label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 text-orange-600 hover:text-orange-800"
                    onClick={() => updateFilter('completionStatus', 'ready_for_decision')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.reviewStage !== 'all' && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Stage: {filters.reviewStage.replace('_', ' ')}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 text-green-600 hover:text-green-800"
                    onClick={() => updateFilter('reviewStage', 'all')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.priorityLevel !== 'all' && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  Priority: {filters.priorityLevel}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 text-red-600 hover:text-red-800"
                    onClick={() => updateFilter('priorityLevel', 'all')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {filters.dueDateRange !== 'all' && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Due: {filters.dueDateRange.replace('_', ' ')}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 text-purple-600 hover:text-purple-800"
                    onClick={() => updateFilter('dueDateRange', 'all')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewDecisionFilters;