"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Palette, 
  RefreshCw,
  Plus,
  Settings
} from 'lucide-react';

import type { ProposalTracker, ThematicArea } from '@/types/dashboard/intervention';
import { getProposalTrackers, getThematicAreas } from '@/app/api/dashboard/proposals';
import { toast } from 'react-toastify';
import OverviewFilters from './overview-filters';
import InterventionsTable from './overview-table';
import ThematicAreasDialog from './new-thematic-area';

interface FilterState {
  search: string;
  reviewStage: string;
  county: string;
  thematicArea: string;
  priorityLevel: string;
  implementationStatus: string;
}

function ThematicPage() {
  const router = useRouter();
  const [allTrackers, setAllTrackers] = useState<ProposalTracker[]>([]);
  const [filteredTrackers, setFilteredTrackers] = useState<ProposalTracker[]>([]);
  const [thematicAreas, setThematicAreas] = useState<ThematicArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrackers, setSelectedTrackers] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  
  // Filters - focusing on unassigned items
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    reviewStage: 'all',
    county: 'all',
    thematicArea: 'unassigned',
    priorityLevel: 'all',
    implementationStatus: 'all',
  });

  // Dialog states
  const [dialogMode, setDialogMode] = useState<'assign' | 'manage' | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTrackers();
  }, [allTrackers, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch both trackers and thematic areas
      const [trackersResponse, thematicAreasData] = await Promise.all([
        getProposalTrackers(),
        getThematicAreas()
      ]);
      
      const trackers = trackersResponse.results || [];

      setAllTrackers(trackers);
      setThematicAreas(thematicAreasData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterTrackers = () => {
    let filtered = [...allTrackers];

    if (filters.thematicArea === 'unassigned') {
      filtered = filtered.filter(t => !t.thematic_area);
    } else if (filters.thematicArea !== 'all') {
      filtered = filtered.filter(t => t.thematic_area?.id.toString() === filters.thematicArea);
    }

    // Apply other filters
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.proposal.name.toLowerCase().includes(term) ||
        t.proposal.organization.toLowerCase().includes(term) ||
        t.proposal.intervention_name?.toLowerCase().includes(term) ||
        t.proposal.justification.toLowerCase().includes(term)
      );
    }

    if (filters.reviewStage !== 'all') {
      filtered = filtered.filter(t => t.review_stage === filters.reviewStage);
    }

    if (filters.county !== 'all') {
      filtered = filtered.filter(t => t.proposal.county === filters.county);
    }

    if (filters.priorityLevel !== 'all') {
      filtered = filtered.filter(t => t.priority_level === filters.priorityLevel);
    }

    setFilteredTrackers(filtered);
    setCurrentPage(1);
  };

  const getWorkflowStage = (tracker: ProposalTracker): string => {
    if (!tracker.thematic_area) return 'needs_categorization';
    if (!tracker.assigned_reviewers || tracker.assigned_reviewers.length === 0) return 'needs_assignment';
    return 'in_progress';
  };

  const getUniqueCounties = () => {
    return [...new Set(allTrackers.map(t => t.proposal.county))].sort();
  };

  const handleRefresh = async () => {
    await fetchData();
    toast.success('Data refreshed');
  };

  const handleBulkAssign = () => {
    if (selectedTrackers.size === 0) {
      toast.warning('Please select items first');
      return;
    }
    setDialogMode('assign');
  };

  const handleDialogSuccess = async () => {
    await fetchData();
    setSelectedTrackers(new Set());
    toast.success('Thematic areas assigned successfully');
  };

  // Stats
  const stats = {
    total: allTrackers.length,
    unassigned: allTrackers.filter(t => !t.thematic_area).length,
    assigned: allTrackers.filter(t => t.thematic_area).length,
    areas: thematicAreas.length
  };

  // Pagination
  const totalItems = filteredTrackers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentTrackers = filteredTrackers.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4  w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thematic Areas</h1>
          <p className="text-gray-600">Categorize interventions by thematic areas</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setDialogMode('manage')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Areas
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interventions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unassigned}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-green-600">{stats.assigned}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Palette className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thematic Areas</p>
                <p className="text-2xl font-bold text-purple-600">{stats.areas}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <OverviewFilters
        filters={filters}
        onFiltersChange={setFilters}
        counties={getUniqueCounties()}
        thematicAreas={thematicAreas}
      />

      {/* Bulk Actions */}
      {selectedTrackers.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedTrackers.size} item{selectedTrackers.size > 1 ? 's' : ''} selected
              </span>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  onClick={handleBulkAssign}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Assign Thematic Areas
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedTrackers(new Set())}
                  className="w-full sm:w-auto"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <InterventionsTable
        trackers={currentTrackers}
        onRefresh={handleRefresh}
        router={router}
        getWorkflowStage={getWorkflowStage}
        activeTab="thematic"
        selectedTrackers={selectedTrackers}
        onSelectionChange={setSelectedTrackers}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <ThematicAreasDialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && setDialogMode(null)}
        mode={dialogMode || 'manage'}
        selectedTrackers={Array.from(selectedTrackers).map(id => 
          allTrackers.find(t => t.id === id)!
        ).filter(Boolean)}
        thematicAreas={thematicAreas}
        onSuccess={handleDialogSuccess}
        onRefresh={fetchData}
      />
    </div>
  );
}

export default ThematicPage;