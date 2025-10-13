"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search,
  RefreshCw,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  MessageSquare,
  PlayCircle,
  MapPin,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import type { ProposalTracker, ThematicArea } from '@/types/dashboard/intervention';
import { getMyAssignments, getThematicAreas } from '@/app/api/dashboard/proposals';
import ReviewDialog from './dialogue';


export default function MyInterventionsClient() {
  const router = useRouter();
  
  const [trackers, setTrackers] = useState<ProposalTracker[]>([]);
  const [filteredTrackers, setFilteredTrackers] = useState<ProposalTracker[]>([]);
  const [thematicAreas, setThematicAreas] = useState<ThematicArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected for review
  const [selectedTracker, setSelectedTracker] = useState<ProposalTracker | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [countyFilter, setCountyFilter] = useState('all');
  const [thematicFilter, setThematicFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'reviewed' | 'all'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trackers, searchTerm, countyFilter, thematicFilter, priorityFilter, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [trackersResponse, areasData] = await Promise.all([
        getMyAssignments(),
        getThematicAreas()
      ]);
      setTrackers(trackersResponse.results || []);
      setThematicAreas(areasData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trackers];

    // Status filter
    if (statusFilter === 'pending') {
      filtered = filtered.filter(t => !t.comments || t.comments.length === 0);
    } else if (statusFilter === 'reviewed') {
      filtered = filtered.filter(t => t.comments && t.comments.length > 0);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        (t.proposal.reference_number?.toLowerCase() || '').includes(term) ||
        (t.proposal.name?.toLowerCase() || '').includes(term) ||
        (t.proposal.organization?.toLowerCase() || '').includes(term) ||
        (t.proposal.intervention_name?.toLowerCase() || '').includes(term) ||
        (t.proposal.justification?.toLowerCase() || '').includes(term)
      );
    }

    // County filter
    if (countyFilter !== 'all') {
      filtered = filtered.filter(t => t.proposal.county === countyFilter);
    }

    // Thematic area filter
    if (thematicFilter !== 'all') {
      filtered = filtered.filter(t => t.thematic_area?.id.toString() === thematicFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority_level === priorityFilter);
    }

    setFilteredTrackers(filtered);
    setCurrentPage(1);
  };

  const getUniqueCounties = () => {
    return [...new Set(trackers.map(t => t.proposal.county).filter(Boolean))].sort();
  };

  const handleReview = (tracker: ProposalTracker) => {
    setSelectedTracker(tracker);
    setReviewDialogOpen(true);
  };

  const handleReviewSuccess = async () => {
    await fetchData();
  };

  const getPriorityColor = (priority: string | null | undefined) => {
    if (!priority) return "bg-gray-100 text-gray-600";
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-600";
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent' || priority === 'high') {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return null;
  };

  // Stats
  const stats = {
    total: trackers.length,
    pending: trackers.filter(t => !t.comments || t.comments.length === 0).length,
    reviewed: trackers.filter(t => t.comments && t.comments.length > 0).length,
    highPriority: trackers.filter(t => t.priority_level === 'high' || t.priority_level === 'urgent').length,
    overdue: trackers.filter(t => t.completion_date && new Date(t.completion_date) < new Date()).length
  };

  // Pagination
  const totalItems = filteredTrackers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTrackers = filteredTrackers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="p-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!loading && trackers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Interventions</h1>
            <p className="text-sm text-gray-600 mt-1">
              Review interventions assigned to you
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Interventions Assigned</h3>
            <p className="text-gray-500">You don't have any interventions assigned to you yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Interventions</h1>
          <p className="text-sm text-gray-600 mt-1">
            {totalItems} intervention{totalItems !== 1 ? 's' : ''} assigned to you
          </p>
        </div>
        
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reviewed</p>
                <p className="text-2xl font-bold text-green-600">{stats.reviewed}</p>
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
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filters</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setCountyFilter('all');
                setThematicFilter('all');
                setPriorityFilter('all');
                setStatusFilter('all');
              }}
              className="h-8 text-xs"
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="county" className="text-sm font-medium text-gray-700">
                County
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
              <Label htmlFor="thematic" className="text-sm font-medium text-gray-700">
                Thematic Area
              </Label>
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
              <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                Priority
              </Label>
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
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Review Status
              </Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger id="status" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
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
                  <TableHead className="w-[140px]">Reference</TableHead>
                  <TableHead className="w-[200px]">Intervention</TableHead>
                  <TableHead className="w-[150px]">Submitter</TableHead>
                  <TableHead className="w-[120px]">County</TableHead>
                  <TableHead className="w-[180px]">Thematic Area</TableHead>
                  <TableHead className="w-[120px]">Priority</TableHead>
                  <TableHead className="w-[110px]">Due Date</TableHead>
                  <TableHead className="w-[90px]">Comments</TableHead>
                  <TableHead className="w-[130px]">Status</TableHead>
                  <TableHead className="w-[130px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTrackers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No interventions match your filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTrackers.map((tracker) => {
                    const isOverdue = tracker.completion_date && new Date(tracker.completion_date) < new Date();
                    const hasComments = tracker.comments && tracker.comments.length > 0;
                    
                    return (
                      <TableRow key={tracker.id} className="hover:bg-gray-50">
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
                          {tracker.thematic_area ? (
                            <Badge
                              variant="outline"
                              style={{
                                borderColor: tracker.thematic_area.color_code,
                                color: tracker.thematic_area.color_code
                              }}
                            >
                              {tracker.thematic_area.name}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Not assigned</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {tracker.priority_level ? (
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(tracker.priority_level)}
                              <Badge className={`${getPriorityColor(tracker.priority_level)} capitalize text-xs`}>
                                {tracker.priority_level}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not set</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {tracker.completion_date ? (
                            <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(tracker.completion_date), 'MMM dd, yyyy')}
                              {isOverdue && <AlertTriangle className="h-3 w-3 ml-1" />}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not set</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">{tracker.comments?.length || 0}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={hasComments ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}
                          >
                            {hasComments ? 'Reviewed' : 'Pending'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Button
                            size="sm"
                            variant={hasComments ? 'outline' : 'default'}
                            onClick={() => handleReview(tracker)}
                            className="w-full text-xs whitespace-nowrap"
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            {hasComments ? 'Update' : 'Add Review'}
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
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
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

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        tracker={selectedTracker}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}