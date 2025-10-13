"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  Download,
  Users,
  Target,
  CheckCircle,
  Clock
} from 'lucide-react';

import type { ProposalTracker, ThematicArea } from '@/types/dashboard/intervention';
import { getProposalTrackers } from '@/app/api/dashboard/proposals';
import { toast } from 'react-toastify';
import OverviewFilters from './overview-filters';
import InterventionsTable from './overview-table';

type TabType = 'overview' | 'thematic' | 'assignment' | 'review';

interface OverviewStats {
  total: number;
  needsCategorization: number;
  needsAssignment: number;
  inProgress: number;
}

interface FilterState {
  search: string;
  reviewStage: string;
  county: string;
  thematicArea: string;
  priorityLevel: string;
  implementationStatus: string;
}

function Overview() {
  const router = useRouter();
  const [allTrackers, setAllTrackers] = useState<ProposalTracker[]>([]);
  const [filteredTrackers, setFilteredTrackers] = useState<ProposalTracker[]>([]);
  const [thematicAreas, setThematicAreas] = useState<ThematicArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedTrackers, setSelectedTrackers] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    reviewStage: 'all',
    county: 'all',
    thematicArea: 'all',
    priorityLevel: 'all',
    implementationStatus: 'all',
  });
  
  const [stats, setStats] = useState<OverviewStats>({
    total: 0,
    needsCategorization: 0,
    needsAssignment: 0,
    inProgress: 0
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Filter trackers based on active tab and filters
  useEffect(() => {
    filterTrackers();
  }, [allTrackers, activeTab, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const trackersResponse = await getProposalTrackers();
      const trackers = trackersResponse.results || [];

      // Extract unique thematic areas from trackers
      const uniqueThematicAreas = trackers
        .filter(tracker => tracker.thematic_area)
        .reduce((acc, tracker) => {
          if (tracker.thematic_area && !acc.find(area => area.id === tracker.thematic_area!.id)) {
            acc.push(tracker.thematic_area);
          }
          return acc;
        }, [] as ThematicArea[]);

      setAllTrackers(trackers);
      setThematicAreas(uniqueThematicAreas);
      
      // Calculate stats
      calculateStats(trackers);
      
    } catch (error) {;
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (trackers: ProposalTracker[]) => {
    const stats = {
      total: trackers.length,
      needsCategorization: trackers.filter(t => !t.thematic_area).length,
      needsAssignment: trackers.filter(t => 
        t.thematic_area && 
        (!t.assigned_reviewers || t.assigned_reviewers.length === 0)
      ).length,
      inProgress: trackers.filter(t => 
        t.assigned_reviewers && 
        t.assigned_reviewers.length > 0 && 
        t.review_stage !== 'approved' && 
        t.review_stage !== 'rejected'
      ).length,
    };
    setStats(stats);
  };

  const filterTrackers = () => {
    let filtered = [...allTrackers];

    // Tab-based filtering
    switch (activeTab) {
      case 'thematic':
        filtered = filtered.filter(t => !t.thematic_area);
        break;
      case 'assignment':
        filtered = filtered.filter(t => 
          t.thematic_area && 
          (!t.assigned_reviewers || t.assigned_reviewers.length === 0)
        );
        break;
      case 'review':
        filtered = filtered.filter(t => 
          t.assigned_reviewers && 
          t.assigned_reviewers.length > 0
        );
        break;
      case 'overview':
      default:
        // Show all for overview
        break;
    }

    // Apply filters
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.proposal.name.toLowerCase().includes(term) ||
        t.proposal.organization.toLowerCase().includes(term) ||
        t.proposal.intervention_name?.toLowerCase().includes(term) ||
        t.proposal.justification.toLowerCase().includes(term) ||
        t.proposal.beneficiary.toLowerCase().includes(term) ||
        t.notes.toLowerCase().includes(term)
      );
    }

    if (filters.reviewStage !== 'all') {
      filtered = filtered.filter(t => t.review_stage === filters.reviewStage);
    }

    if (filters.county !== 'all') {
      filtered = filtered.filter(t => t.proposal.county === filters.county);
    }

    if (filters.thematicArea !== 'all') {
      filtered = filtered.filter(t => t.thematic_area?.id.toString() === filters.thematicArea);
    }

    if (filters.priorityLevel !== 'all') {
      filtered = filtered.filter(t => t.priority_level === filters.priorityLevel);
    }

    if (filters.implementationStatus !== 'all') {
      filtered = filtered.filter(t => t.implementation_status === filters.implementationStatus);
    }

    setFilteredTrackers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getWorkflowStage = (tracker: ProposalTracker): string => {
    if (!tracker.thematic_area) {
      return 'needs_categorization';
    }
    
    if (!tracker.assigned_reviewers || tracker.assigned_reviewers.length === 0) {
      return 'needs_assignment';
    }
    
    return 'in_progress';
  };

  const handleRefresh = async () => {
    await fetchData();
    toast.success('Data refreshed');
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTrackers.size === 0) {
      toast.warning('Please select items first');
      return;
    }

    try {
      switch (action) {
        case 'assign_thematic':
          const ids = Array.from(selectedTrackers).join(',');
          router.push(`/portal/interventions/bulk-thematic?ids=${ids}`);
          return;
          
        case 'assign_reviewers':
          const reviewerIds = Array.from(selectedTrackers).join(',');
          router.push(`/portal/interventions/bulk-reviewers?ids=${reviewerIds}`);
          return;
      }
      
      setSelectedTrackers(new Set());
      
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const getUniqueCounties = () => {
    return [...new Set(allTrackers.map(t => t.proposal.county))].sort();
  };

  // Pagination
  const totalItems = filteredTrackers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTrackers = filteredTrackers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interventions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Need Categorization</p>
                <p className="text-2xl font-bold text-orange-600">{stats.needsCategorization}</p>
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
                <p className="text-sm font-medium text-gray-600">Need Assignment</p>
                <p className="text-2xl font-bold text-purple-600">{stats.needsAssignment}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-green-600">{stats.inProgress}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', count: stats.total },
                { id: 'thematic', label: 'Thematic Assignment', count: stats.needsCategorization },
                { id: 'assignment', label: 'Reviewer Assignment', count: stats.needsAssignment },
                { id: 'review', label: 'Under Review', count: stats.inProgress },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className="relative"
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Export functionality */}}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedTrackers.size} item{selectedTrackers.size > 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {activeTab === 'thematic' && (
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('assign_thematic')}
                  >
                    Assign Thematic Areas
                  </Button>
                )}
                
                {activeTab === 'assignment' && (
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('assign_reviewers')}
                  >
                    Assign Reviewers
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedTrackers(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interventions Table */}
      <InterventionsTable
        trackers={currentTrackers}
        onRefresh={handleRefresh}
        router={router}
        getWorkflowStage={getWorkflowStage}
        activeTab={activeTab}
        selectedTrackers={selectedTrackers}
        onSelectionChange={setSelectedTrackers}
        // Pagination props
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

export default Overview;