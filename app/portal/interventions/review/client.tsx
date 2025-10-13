"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Download,
  Search,
  FileText,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Filter
} from 'lucide-react';

import type { ProposalTracker, ThematicArea } from '@/types/dashboard/intervention';
import { getProposalTrackers, getThematicAreas } from '@/app/api/dashboard/proposals';
import { toast } from 'react-toastify';
import DecisionSidebar from './decision';


function ReviewDecisionClient() {
  const router = useRouter();
  const [allTrackers, setAllTrackers] = useState<ProposalTracker[]>([]);
  const [filteredTrackers, setFilteredTrackers] = useState<ProposalTracker[]>([]);
  const [thematicAreas, setThematicAreas] = useState<ThematicArea[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Decision sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<ProposalTracker | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [countyFilter, setCountyFilter] = useState('all');
  const [thematicFilter, setThematicFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [decisionFilter, setDecisionFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allTrackers, searchTerm, countyFilter, thematicFilter, priorityFilter, decisionFilter, stageFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [trackersResponse, areasData] = await Promise.all([
        getProposalTrackers(),
        getThematicAreas()
      ]);

      const trackers = trackersResponse.results || [];
      const trackersWithComments = trackers.filter(t => t.comments && t.comments.length > 0);
      
      setAllTrackers(trackersWithComments);
      setThematicAreas(areasData);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTrackers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        (t.proposal.reference_number?.toLowerCase() || '').includes(term) ||
        (t.proposal.intervention_name?.toLowerCase() || '').includes(term) ||
        (t.proposal.name?.toLowerCase() || '').includes(term) ||
        (t.proposal.organization?.toLowerCase() || '').includes(term) ||
        (t.proposal.county?.toLowerCase() || '').includes(term)
      );
    }

    if (countyFilter !== 'all') {
      filtered = filtered.filter(t => t.proposal.county === countyFilter);
    }

    if (thematicFilter !== 'all') {
      filtered = filtered.filter(t => t.thematic_area?.id.toString() === thematicFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority_level === priorityFilter);
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter(t => t.review_stage === stageFilter);
    }

    if (decisionFilter !== 'all') {
      filtered = filtered.filter(t => 
        t.comments?.some(c => c.comment_type === decisionFilter)
      );
    }

    setFilteredTrackers(filtered);
    setCurrentPage(1);
  };

  const getUniqueCounties = () => {
    return [...new Set(allTrackers.map(t => t.proposal.county).filter(Boolean))].sort();
  };

  const openDecisionSidebar = (tracker: ProposalTracker) => {
    setSelectedTracker(tracker);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedTracker(null);
  };

  const handleDecisionSubmitted = () => {
    fetchData(); // Refresh the data
  };

  const handleExportCSV = () => {
    const headers = [
      'Reference Number',
      'Intervention Name',
      'Submitter Name',
      'Organization',
      'County',
      'Thematic Area',
      'Priority',
      'Start Date',
      'End Date',
      'Assigned Users',
      'Documents Count',
      'Comments Count',
      'Latest Decision',
      'Review Stage',
      'Latest Comment'
    ];

    const rows = filteredTrackers.map(tracker => {
      const latestComment = tracker.comments?.[tracker.comments.length - 1];
      const assignedUsers = tracker.assigned_reviewers?.map(r => r.username).join(', ') || 'None';
      
      return [
        tracker.proposal.reference_number || 'N/A',
        tracker.proposal.intervention_name || 'N/A',
        tracker.proposal.name || 'N/A',
        tracker.proposal.organization || 'N/A',
        tracker.proposal.county || 'N/A',
        tracker.thematic_area?.name || 'N/A',
        tracker.priority_level || 'N/A',
        tracker.start_date || 'N/A',
        tracker.completion_date || 'N/A',
        assignedUsers,
        tracker.proposal.documents?.length || 0,
        tracker.comments?.length || 0,
        latestComment?.comment_type || 'N/A',
        tracker.review_stage || 'N/A',
        latestComment?.content?.substring(0, 100) || 'N/A'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `review-decisions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV exported successfully');
  };

  const getDecisionColor = (decisionType: string) => {
    const colors = {
      approval: "bg-green-100 text-green-700 border-green-200",
      rejection: "bg-red-100 text-red-700 border-red-200",
      concern: "bg-orange-100 text-orange-700 border-orange-200",
      question: "bg-blue-100 text-blue-700 border-blue-200",
      general: "bg-gray-100 text-gray-700 border-gray-200",
      decision: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[decisionType as keyof typeof colors] || colors.general;
  };

  const getStageColor = (stage: string) => {
    const colors = {
      initial: "bg-gray-100 text-gray-700",
      under_review: "bg-blue-100 text-blue-700",
      needs_revision: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[stage as keyof typeof colors] || colors.initial;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const stats = {
    total: filteredTrackers.length,
    approved: filteredTrackers.filter(t => 
      t.review_stage === 'approved' || t.comments?.some(c => c.comment_type === 'approval')
    ).length,
    rejected: filteredTrackers.filter(t => 
      t.review_stage === 'rejected' || t.comments?.some(c => c.comment_type === 'rejection')
    ).length,
    needsRevision: filteredTrackers.filter(t => t.review_stage === 'needs_revision').length,
    pendingDecision: filteredTrackers.filter(t => 
      ['initial', 'under_review'].includes(t.review_stage)
    ).length,
  };

  const totalItems = filteredTrackers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentTrackers = filteredTrackers.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
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
    <div className="space-y-6">
      {/* Decision Sidebar */}
      <DecisionSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        tracker={selectedTracker}
        onDecisionSubmitted={handleDecisionSubmitted}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review & Decision Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            {totalItems} intervention{totalItems !== 1 ? 's' : ''} with comments ready for review
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredTrackers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Needs Revision</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.needsRevision}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Decision</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingDecision}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-base">Filters</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setCountyFilter('all');
                setThematicFilter('all');
                setPriorityFilter('all');
                setDecisionFilter('all');
                setStageFilter('all');
              }}
              className="h-8 text-xs"
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Reference, name, county..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="county" className="text-sm font-medium">County</Label>
              <Select value={countyFilter} onValueChange={setCountyFilter}>
                <SelectTrigger id="county" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counties</SelectItem>
                  {getUniqueCounties().map(county => (
                    <SelectItem key={county} value={county}>{county}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thematic" className="text-sm font-medium">Thematic Area</Label>
              <Select value={thematicFilter} onValueChange={setThematicFilter}>
                <SelectTrigger id="thematic" className="h-10">
                  <SelectValue />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger id="priority" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="decision" className="text-sm font-medium">Decision Type</Label>
              <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                <SelectTrigger id="decision" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Decisions</SelectItem>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="rejection">Rejection</SelectItem>
                  <SelectItem value="concern">Concern</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="decision">Decision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage" className="text-sm font-medium">Review Stage</Label>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger id="stage" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[130px]">Reference No.</TableHead>
                  <TableHead className="w-[200px]">Intervention Name</TableHead>
                  <TableHead className="w-[150px]">Submitter</TableHead>
                  <TableHead className="w-[120px]">County</TableHead>
                  <TableHead className="w-[80px]">Documents</TableHead>
                  <TableHead className="w-[150px]">Assigned Users</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[150px]">Thematic Area</TableHead>
                  <TableHead className="w-[90px]">Comments</TableHead>
                  <TableHead className="w-[130px]">Reviewer Decision</TableHead>
                  <TableHead className="w-[130px]">Review Stage</TableHead>
                  <TableHead className="w-[110px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTrackers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No interventions match your filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTrackers.map((tracker) => {
                    const latestComment = tracker.comments?.[tracker.comments.length - 1];
                    const isOverdue = tracker.completion_date && new Date(tracker.completion_date) < new Date();
                    
                    return (
                      <TableRow key={tracker.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                        <TableCell>
                          <Button
                            variant="link"
                            className="h-auto p-0 text-blue-600 hover:text-blue-800 font-mono text-xs"
                            onClick={() => router.push(`/portal/interventions/tracker/${tracker.proposal.id}`)}
                          >
                            {tracker.proposal.reference_number || 'N/A'}
                          </Button>
                        </TableCell>
                        
                        <TableCell>
                          <p className="font-medium text-sm line-clamp-2">
                            {tracker.proposal.intervention_name || 'Not specified'}
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{tracker.proposal.name}</p>
                            <p className="text-xs text-gray-500">{tracker.proposal.organization}</p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {tracker.proposal.county}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">{tracker.proposal.documents?.length || 0}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {tracker.assigned_reviewers && tracker.assigned_reviewers.length > 0 ? (
                              tracker.assigned_reviewers.map((reviewer, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {reviewer.username}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">None</span>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {tracker.priority_level ? (
                            <Badge className={`${getPriorityColor(tracker.priority_level)} capitalize text-xs`}>
                              {tracker.priority_level}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Not set</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {tracker.thematic_area ? (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: tracker.thematic_area.color_code,
                                color: tracker.thematic_area.color_code
                              }}
                              className="text-xs"
                            >
                              {tracker.thematic_area.name}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Not assigned</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">{tracker.comments?.length || 0}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {latestComment ? (
                            <Badge
                              variant="outline"
                              className={`${getDecisionColor(latestComment.comment_type || 'general')} capitalize text-xs`}
                            >
                              {latestComment.comment_type || 'general'}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">No decision</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getStageColor(tracker.review_stage)} capitalize text-xs`}
                          >
                            {tracker.review_stage.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => openDecisionSidebar(tracker)}
                            className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                          >
                            <Gavel className="h-3 w-3 mr-1" />
                            Make Decision
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} results
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="pageSize" className="text-sm text-gray-700 whitespace-nowrap">
                    Rows per page:
                  </Label>
                  <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                    <SelectTrigger id="pageSize" className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm whitespace-nowrap">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ReviewDecisionClient;