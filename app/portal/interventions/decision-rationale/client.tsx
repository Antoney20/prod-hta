"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Download,
  Search,
  MapPin,
  User,
  Calendar,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Gavel,
  AlertCircle,
  Edit,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getDecisionRationales,
  updateDecisionRationale 
} from '@/app/api/dashboard/decision-rationale';
import { getProposalTrackers } from '@/app/api/dashboard/proposals';
import type { DecisionRationale, UpdateDecisionRationaleData } from '@/types/dashboard/decision';
import type { ProposalTracker } from '@/types/dashboard/intervention';

interface DecisionWithTracker extends DecisionRationale {
  tracker_details?: ProposalTracker;
}

function DecisionRationaleClient() {
  const router = useRouter();
  const [allDecisions, setAllDecisions] = useState<DecisionWithTracker[]>([]);
  const [filteredDecisions, setFilteredDecisions] = useState<DecisionWithTracker[]>([]);
  const [trackers, setTrackers] = useState<Map<string, ProposalTracker>>(new Map());
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('all');
  const [countyFilter, setCountyFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<DecisionWithTracker | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateDecisionRationaleData>({
    decision: 'approved',
    detailed_rationale: '',
    approval_conditions: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allDecisions, searchTerm, decisionFilter, countyFilter, dateFromFilter, dateToFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [decisionsResponse, trackersResponse] = await Promise.all([
        getDecisionRationales(),
        getProposalTrackers()
      ]);

      const decisions = decisionsResponse.results || [];
      const trackersData = trackersResponse.results || [];
      
      const trackersMap = new Map<string, ProposalTracker>();
      trackersData.forEach(tracker => {
        trackersMap.set(String(tracker.id), tracker);
      });
      
      setTrackers(trackersMap);
      
      const enhancedDecisions = decisions.map(decision => ({
        ...decision,
        tracker_details: trackersMap.get(String(decision.tracker))
      }));
      
      setAllDecisions(enhancedDecisions);
    } catch (error) {
      toast.error('Failed to load decision rationales');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allDecisions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        (d.proposal_reference?.toLowerCase() || '').includes(term) ||
        (d.intervention_name?.toLowerCase() || '').includes(term) ||
        (d.tracker_details?.proposal?.name?.toLowerCase() || '').includes(term) ||
        (d.tracker_details?.proposal?.organization?.toLowerCase() || '').includes(term) ||
        (d.tracker_details?.proposal?.county?.toLowerCase() || '').includes(term)
      );
    }

    if (decisionFilter !== 'all') {
      filtered = filtered.filter(d => d.decision === decisionFilter);
    }

    if (countyFilter !== 'all') {
      filtered = filtered.filter(d => d.tracker_details?.proposal?.county === countyFilter);
    }

    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      filtered = filtered.filter(d => new Date(d.decided_at) >= fromDate);
    }

    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(d => new Date(d.decided_at) <= toDate);
    }

    setFilteredDecisions(filtered);
    setCurrentPage(1);
  };

  const openEditDialog = (decision: DecisionWithTracker) => {
    setSelectedDecision(decision);
    setEditFormData({
      decision: decision.decision,
      detailed_rationale: decision.detailed_rationale || '',
      approval_conditions: decision.approval_conditions || '',
    });
    setEditDialogOpen(true);
  };

  const openViewDialog = (decision: DecisionWithTracker) => {
    setSelectedDecision(decision);
    setViewDialogOpen(true);
  };

  const handleUpdateDecision = async () => {
    if (!selectedDecision) return;

    try {
      setSubmitting(true);
      await updateDecisionRationale(selectedDecision.id, editFormData);
      toast.success('Decision updated successfully');
      setEditDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update decision');
    } finally {
      setSubmitting(false);
    }
  };

  const getUniqueCounties = () => {
    const counties = new Set<string>();
    allDecisions.forEach(d => {
      if (d.tracker_details?.proposal?.county) {
        counties.add(d.tracker_details.proposal.county);
      }
    });
    return Array.from(counties).sort();
  };

  const handleExportCSV = () => {
    const headers = [
      'Decision ID',
      'Reference Number',
      'Intervention Name',
      'Submitter Name',
      'Organization',
      'County',
      'Thematic Area',
      'Priority',
      'Review Stage',
      'Decision',
      'Detailed Rationale',
      'Approval Conditions',
      'Decided By',
      'Decided At'
    ];

    const rows = filteredDecisions.map(decision => {
      const tracker = decision.tracker_details;
      return [
        decision.id,
        decision.proposal_reference || 'N/A',
        decision.intervention_name || tracker?.proposal?.intervention_name || 'N/A',
        tracker?.proposal?.name || 'N/A',
        tracker?.proposal?.organization || 'N/A',
        tracker?.proposal?.county || 'N/A',
        tracker?.thematic_area?.name || 'N/A',
        tracker?.priority_level || 'N/A',
        tracker?.review_stage || 'N/A',
        decision.decision,
        decision.detailed_rationale,
        decision.approval_conditions || 'N/A',
        decision.decided_by,
        new Date(decision.decided_at).toLocaleString()
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `decision-rationales-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV exported successfully');
  };

  const getDecisionColor = (decision: string) => {
    const colors = {
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      not_sure: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return colors[decision as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'not_sure': return HelpCircle;
      default: return AlertCircle;
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    const colors = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return priority ? colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-700" : "bg-gray-100 text-gray-700";
  };

  const stats = {
    total: filteredDecisions.length,
    approved: filteredDecisions.filter(d => d.decision === 'approved').length,
    rejected: filteredDecisions.filter(d => d.decision === 'rejected').length,
    not_sure: filteredDecisions.filter(d => d.decision === 'not_sure').length,
  };

  const totalItems = filteredDecisions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentDecisions = filteredDecisions.slice(startIndex, startIndex + pageSize);

  const clearAllFilters = () => {
    setSearchTerm('');
    setDecisionFilter('all');
    setCountyFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Decision Rationales</h1>
          <p className="text-sm text-gray-600 mt-1">
            {totalItems} decision{totalItems !== 1 ? 's' : ''} recorded
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredDecisions.length === 0}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Decisions</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gavel className="h-6 w-6 text-blue-600" />
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
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </p>
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
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%
                </p>
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
                <p className="text-2xl font-bold text-yellow-600">{stats.not_sure}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.not_sure / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-base">Filter Decisions</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-xs"
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                Search Keywords
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Reference, name, organization, county..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="decision" className="text-sm font-medium text-gray-700">
                Decision Status
              </Label>
              <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                <SelectTrigger id="decision" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Decisions</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="not_sure">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="county" className="text-sm font-medium text-gray-700">
                County Location
              </Label>
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
              <Label htmlFor="dateFrom" className="text-sm font-medium text-gray-700">
                Date From
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo" className="text-sm font-medium text-gray-700">
                Date To
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="h-10"
              />
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
                  <TableHead className="w-[200px]">Intervention</TableHead>
                  <TableHead className="w-[150px]">Submitter</TableHead>
                  <TableHead className="w-[120px]">County</TableHead>
                  <TableHead className="w-[150px]">Thematic Area</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[120px]">Decision</TableHead>
                  <TableHead className="w-[150px]">Decided By</TableHead>
                  <TableHead className="w-[150px]">Decided At</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentDecisions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No decisions match your filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentDecisions.map((decision) => {
                    const tracker = decision.tracker_details;
                    const DecisionIcon = getDecisionIcon(decision.decision);
                    
                    return (
                      <TableRow key={decision.id} className="hover:bg-gray-50">
                        <TableCell>
                          <span className="text-blue-600 hover:text-blue-800 font-mono text-xs cursor-pointer"
                            onClick={() => tracker && router.push(`/portal/interventions/tracker/${tracker.proposal.id}`)}>
                            {decision.proposal_reference || 'N/A'}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <p className="font-medium text-sm line-clamp-2">
                            {decision.intervention_name || tracker?.proposal?.intervention_name || 'Not specified'}
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{tracker?.proposal?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{tracker?.proposal?.organization || 'N/A'}</p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {tracker?.proposal?.county || 'N/A'}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {tracker?.thematic_area ? (
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
                          {tracker?.priority_level ? (
                            <Badge className={`${getPriorityColor(tracker.priority_level)} capitalize text-xs`}>
                              {tracker.priority_level}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Not set</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getDecisionColor(decision.decision)} capitalize text-xs flex items-center gap-1 w-fit`}
                          >
                            <DecisionIcon className="h-3 w-3" />
                            {decision.decision.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <User className="h-3 w-3 mr-1 text-gray-400" />
                            {decision.decided_by}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(decision.decided_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(decision.decided_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                openViewDialog(decision);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(decision);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Decision</DialogTitle>
            <DialogDescription>
              Update the decision status and rationale for this proposal
            </DialogDescription>
          </DialogHeader>

          {selectedDecision && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Reference</p>
                    <p className="font-mono text-sm font-medium">{selectedDecision.proposal_reference}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Intervention</p>
                    <p className="text-sm font-medium line-clamp-1">
                      {selectedDecision.intervention_name || selectedDecision.tracker_details?.proposal?.intervention_name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-decision">Decision Status *</Label>
                <Select 
                  value={editFormData.decision} 
                  onValueChange={(v) => setEditFormData({ ...editFormData, decision: v as any })}
                >
                  <SelectTrigger id="edit-decision">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Approved</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>Rejected</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="not_sure">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-yellow-600" />
                        <span>Needs Revision</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-rationale">Detailed Rationale *</Label>
                <Textarea
                  id="edit-rationale"
                  value={editFormData.detailed_rationale}
                  onChange={(e) => setEditFormData({ ...editFormData, detailed_rationale: e.target.value })}
                  placeholder="Provide detailed reasoning for this decision..."
                  rows={5}
                  className="resize-none"
                />
              </div>

              {editFormData.decision === 'approved' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-conditions">Approval Conditions</Label>
                  <Textarea
                    id="edit-conditions"
                    value={editFormData.approval_conditions || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, approval_conditions: e.target.value })}
                    placeholder="Any conditions or requirements for approval..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDecision}
              disabled={submitting || !editFormData.detailed_rationale}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Update Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Decision Details</DialogTitle>
          </DialogHeader>

          {selectedDecision && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reference Number</p>
                    <p className="font-mono text-sm font-medium">{selectedDecision.proposal_reference}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Intervention Name</p>
                    <p className="text-sm font-medium">
                      {selectedDecision.intervention_name || 
                       selectedDecision.tracker_details?.proposal?.intervention_name || 
                       'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Decision Status</p>
                    <Badge
                      variant="outline"
                      className={`${getDecisionColor(selectedDecision.decision)} capitalize`}
                    >
                      {(() => {
                        const DecisionIcon = getDecisionIcon(selectedDecision.decision);
                        return (
                          <div className="flex items-center gap-1">
                            <DecisionIcon className="h-3 w-3" />
                            {selectedDecision.decision.replace('_', ' ')}
                          </div>
                        );
                      })()}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Submitter</p>
                    <p className="text-sm font-medium">
                      {selectedDecision.tracker_details?.proposal?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedDecision.tracker_details?.proposal?.organization || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">County</p>
                    <p className="text-sm font-medium">
                      {selectedDecision.tracker_details?.proposal?.county || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Decided By</p>
                    <p className="text-sm font-medium">{selectedDecision.decided_by}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedDecision.decided_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Detailed Rationale</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedDecision.detailed_rationale || 'No rationale provided'}
                  </p>
                </div>
              </div>

              {selectedDecision.approval_conditions && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Approval Conditions</p>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedDecision.approval_conditions}
                    </p>
                  </div>
                </div>
              )}

              {selectedDecision.tracker_details && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Proposal Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Thematic Area</p>
                      <p className="text-sm">
                        {selectedDecision.tracker_details.thematic_area?.name || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Priority Level</p>
                      <Badge className={`${getPriorityColor(selectedDecision.tracker_details.priority_level)} capitalize text-xs mt-1`}>
                        {selectedDecision.tracker_details.priority_level || 'Not set'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Review Stage</p>
                      <p className="text-sm">{selectedDecision.tracker_details.review_stage || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setViewDialogOpen(false);
                selectedDecision && openEditDialog(selectedDecision);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DecisionRationaleClient;