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
import { Search, Filter, X } from 'lucide-react';
import type { ThematicArea } from '@/types/dashboard/intervention';

interface FilterState {
  search: string;
  reviewStage: string;
  county: string;
  thematicArea: string;
  priorityLevel: string;
  implementationStatus: string;
}

interface OverviewFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  counties: string[];
  thematicAreas: ThematicArea[];
}

const OverviewFilters: React.FC<OverviewFiltersProps> = ({
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
    });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'search' && value !== 'all'
  ) || filters.search !== '';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
          
          {/* Review Stage */}
          <Select 
            value={filters.reviewStage} 
            onValueChange={(value) => updateFilter('reviewStage', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Review Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="initial">Initial</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="needs_revision">Needs Revision</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>

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
                  {area.name}
                </SelectItem>
              ))}
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
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          {/* Implementation Status */}
          <Select 
            value={filters.implementationStatus} 
            onValueChange={(value) => updateFilter('implementationStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Implementation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Search: "{filters.search}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0 text-blue-600 hover:text-blue-800"
                  onClick={() => updateFilter('search', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            )}
            {filters.reviewStage !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Stage: {filters.reviewStage.replace('_', ' ')}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0 text-green-600 hover:text-green-800"
                  onClick={() => updateFilter('reviewStage', 'all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            )}
            {filters.county !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                County: {filters.county}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0 text-purple-600 hover:text-purple-800"
                  onClick={() => updateFilter('county', 'all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            )}
            {filters.thematicArea !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                Area: {thematicAreas.find(a => a.id.toString() === filters.thematicArea)?.name || filters.thematicArea}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0 text-yellow-600 hover:text-yellow-800"
                  onClick={() => updateFilter('thematicArea', 'all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            )}
            {filters.priorityLevel !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                Priority: {filters.priorityLevel}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0 text-red-600 hover:text-red-800"
                  onClick={() => updateFilter('priorityLevel', 'all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            )}
            {filters.implementationStatus !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                Status: {filters.implementationStatus.replace('_', ' ')}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0 text-indigo-600 hover:text-indigo-800"
                  onClick={() => updateFilter('implementationStatus', 'all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverviewFilters;