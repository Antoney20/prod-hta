"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  RefreshCw,
  Settings
} from 'lucide-react';


import type { ProposalTracker, ThematicArea, UserType } from '@/types/dashboard/intervention';
import { getProposalTrackers, getThematicAreas, getUsers } from '@/app/api/dashboard/proposals';
import { toast } from 'react-toastify';
import OverviewFilters from './overview-filters';
import InterventionsTable from './overview-table';
import ReviewerAssignmentDialog from './assignment-reviewer';

interface FilterState {
  search: string;
  reviewStage: string;
  county: string;
  thematicArea: string;
  priorityLevel: string;
  implementationStatus: string;
}

function AssignmentPage() {
  const router = useRouter();
  const [allTrackers, setAllTrackers] = useState<ProposalTracker[]>([]);
  const [filteredTrackers, setFilteredTrackers] = useState<ProposalTracker[]>([]);
  const [thematicAreas, setThematicAreas] = useState<ThematicArea[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrackers, setSelectedTrackers] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  
  // Filters - focusing on items that need reviewer assignment
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    reviewStage: 'all',
    county: 'all',
    thematicArea: 'assigned',
    priorityLevel: 'all',
    implementationStatus: 'all',
  });

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTrackers();
  }, [allTrackers, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trackersResponse, thematicAreasData, usersData] = await Promise.all([
        getProposalTrackers(),
        getThematicAreas(),
        getUsers()
      ]);
      
      const trackers = trackersResponse.results || [];

      setAllTrackers(trackers);
      setThematicAreas(thematicAreasData);
      setUsers(usersData.results || usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterTrackers = () => {
    let filtered = [...allTrackers];

    // Focus on items needing reviewer assignment (have thematic area but no reviewers)
    if (filters.thematicArea === 'assigned') {
      filtered = filtered.filter(t => 
        t.thematic_area && 
        (!t.assigned_reviewers || t.assigned_reviewers.length === 0)
      );
    } else if (filters.thematicArea === 'unassigned') {
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
    setDialogOpen(true);
  };

  const handleDialogSuccess = async () => {
    await fetchData();
    setSelectedTrackers(new Set());
    toast.success('Reviewers assigned successfully');
  };

  // Stats
  const stats = {
    total: allTrackers.length,
    withThematic: allTrackers.filter(t => t.thematic_area).length,
    needsReviewers: allTrackers.filter(t => 
      t.thematic_area && 
      (!t.assigned_reviewers || t.assigned_reviewers.length === 0)
    ).length,
    hasReviewers: allTrackers.filter(t => 
      t.assigned_reviewers && t.assigned_reviewers.length > 0
    ).length
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
    <div className="space-y-3  w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviewer Assignment</h1>
          <p className="text-gray-600">Assign reviewers to categorized interventions</p>
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
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorized</p>
                <p className="text-2xl font-bold text-green-600">{stats.withThematic}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Need Reviewers</p>
                <p className="text-2xl font-bold text-orange-600">{stats.needsReviewers}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Has Reviewers</p>
                <p className="text-2xl font-bold text-purple-600">{stats.hasReviewers}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
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
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-sm font-medium text-purple-900">
                {selectedTrackers.size} item{selectedTrackers.size > 1 ? 's' : ''} selected
              </span>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  onClick={handleBulkAssign}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Reviewers
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
        activeTab="assignment"
        selectedTrackers={selectedTrackers}
        onSelectionChange={setSelectedTrackers}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <ReviewerAssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedTrackers={Array.from(selectedTrackers).map(id => 
          allTrackers.find(t => t.id === id)!
        ).filter(Boolean)}
        users={users}
        onSuccess={handleDialogSuccess}
        onRefresh={fetchData}
      />
    </div>
  );
}

export default AssignmentPage;