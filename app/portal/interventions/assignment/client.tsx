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
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Users,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import type { ProposalTracker, ThematicArea, UserType } from '@/types/dashboard/intervention';
import { getProposalTrackers, getThematicAreas, getUsers } from '@/app/api/dashboard/proposals';
import ReviewerAssignmentDialog from '../tabs/assignment-reviewer';

export default function AssignmentClient() {
  const router = useRouter();
  const [trackers, setTrackers] = useState<ProposalTracker[]>([]);
  const [filteredTrackers, setFilteredTrackers] = useState<ProposalTracker[]>([]);
  const [thematicAreas, setThematicAreas] = useState<ThematicArea[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection
  const [selectedTrackers, setSelectedTrackers] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [countyFilter, setCountyFilter] = useState('all');
  const [thematicFilter, setThematicFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<'with_category' | 'without_category' | 'all'>('with_category');
  const [statusFilter, setStatusFilter] = useState<'unassigned' | 'assigned' | 'all'>('unassigned');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trackers, searchTerm, countyFilter, thematicFilter, categoryFilter, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [trackersResponse, areasData, usersData] = await Promise.all([
        getProposalTrackers(),
        getThematicAreas(),
        getUsers()
      ]);
      setTrackers(trackersResponse.results || []);
      setThematicAreas(areasData);
      setUsers(usersData.results || usersData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trackers];

    // Category filter
    if (categoryFilter === 'with_category') {
      filtered = filtered.filter(t => t.thematic_area);
    } else if (categoryFilter === 'without_category') {
      filtered = filtered.filter(t => !t.thematic_area);
    }
    // 'all' shows everything
    
    // Status filter
    if (statusFilter === 'unassigned') {
      filtered = filtered.filter(t => !t.assigned_reviewers || t.assigned_reviewers.length === 0);
    } else if (statusFilter === 'assigned') {
      filtered = filtered.filter(t => t.assigned_reviewers && t.assigned_reviewers.length > 0);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        (t.proposal.reference_number?.toLowerCase() || '').includes(term) ||
        (t.proposal.name?.toLowerCase() || '').includes(term) ||
        (t.proposal.organization?.toLowerCase() || '').includes(term) ||
        (t.proposal.intervention_name?.toLowerCase() || '').includes(term) ||
        (t.proposal.county?.toLowerCase() || '').includes(term)
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

    setFilteredTrackers(filtered);
    setCurrentPage(1);
  };

  const getUniqueCounties = () => {
    return [...new Set(trackers.map(t => t.proposal.county).filter(Boolean))].sort();
  };

  const getUserInitials = (reviewer: any): string => {
    const firstName = reviewer?.first_name || 'N';
    const lastName = reviewer?.last_name || 'A';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(currentTrackers.map(t => t.id));
      setSelectedTrackers(allIds);
    } else {
      setSelectedTrackers(new Set());
    }
  };

  const handleSelectTracker = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedTrackers);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedTrackers(newSelected);
  };

  const handleBulkAssign = () => {
    if (selectedTrackers.size === 0) {
      alert('Please select items first');
      return;
    }
    setDialogOpen(true);
  };

  const handleDialogSuccess = async () => {
    await fetchData();
    setSelectedTrackers(new Set());
  };

  // Stats
  const categorizedTrackers = trackers.filter(t => t.thematic_area);
  const uncategorizedTrackers = trackers.filter(t => !t.thematic_area);
  const stats = {
    total: trackers.length,
    categorized: categorizedTrackers.length,
    uncategorized: uncategorizedTrackers.length,
    unassigned: trackers.filter(t => !t.assigned_reviewers || t.assigned_reviewers.length === 0).length,
    assigned: trackers.filter(t => t.assigned_reviewers && t.assigned_reviewers.length > 0).length,
    reviewers: users.length
  };

  // Pagination
  const totalItems = filteredTrackers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTrackers = filteredTrackers.slice(startIndex, endIndex);
  const allSelected = currentTrackers.length > 0 && currentTrackers.every(t => selectedTrackers.has(t.id));

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviewer Assignment</h1>
          <p className="text-sm text-gray-600 mt-1">
            Assign reviewers to categorized interventions
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total </p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.categorized} categorized, {stats.uncategorized} uncategorized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Need Reviewers</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unassigned}</p>
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
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-green-600">{stats.assigned}</p>
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
                <p className="text-sm font-medium text-gray-600">Available Reviewers</p>
                <p className="text-2xl font-bold text-purple-600">{stats.reviewers}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
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
                setCategoryFilter('with_category');
                setThematicFilter('all');
                setStatusFilter('unassigned');
              }}
              className="h-8 text-xs"
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Row 1: Search and Quick Toggles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">
                  Search Interventions
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by reference, name, organization, intervention..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="show-all" className="text-sm font-medium text-gray-700">
                  Quick View ( show all proposals)
                </Label>
                <Button
                  id="show-all"
                  variant={categoryFilter === 'all' && statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => {
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                  className="w-full h-10"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Show All Proposals
                </Button>
              </div>
            </div>

            {/* Row 2: Main Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="county" className="text-sm font-medium text-gray-700">
                  County
                </Label>
                <Select value={countyFilter} onValueChange={setCountyFilter}>
                  <SelectTrigger id="county" className="h-10">
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="font-medium">All Counties</span>
                    </SelectItem>
                    {getUniqueCounties().map(county => (
                      <SelectItem key={county} value={county}>{county}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Categorization Status
                </Label>
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                  <SelectTrigger id="category" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="with_category">
                      <div className="flex items-center">
                        <Target className="h-3 w-3 mr-2 text-green-600" />
                        With Thematic Area
                      </div>
                    </SelectItem>
                    <SelectItem value="without_category">
                      <div className="flex items-center">
                        <Target className="h-3 w-3 mr-2 text-orange-600" />
                        Without Thematic Area
                      </div>
                    </SelectItem>
                    <SelectItem value="all">
                      <span className="font-medium">All Items</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thematic" className="text-sm font-medium text-gray-700">
                  Thematic Area
                </Label>
                <Select 
                  value={thematicFilter} 
                  onValueChange={setThematicFilter}
                  disabled={categoryFilter === 'without_category'}
                >
                  <SelectTrigger id="thematic" className="h-10">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="font-medium">All Thematic Areas</span>
                    </SelectItem>
                    {thematicAreas.map(area => (
                      <SelectItem key={area.id} value={area.id.toString()}>
                        <div className="flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full mr-2" 
                            style={{ backgroundColor: area.color_code }}
                          />
                          {area.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Reviewer Status
                </Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger id="status" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      <div className="flex items-center">
                        <UserPlus className="h-3 w-3 mr-2 text-orange-600" />
                        Needs Reviewers
                      </div>
                    </SelectItem>
                    <SelectItem value="assigned">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-2 text-green-600" />
                        Has Reviewers
                      </div>
                    </SelectItem>
                    <SelectItem value="all">
                      <span className="font-medium">All Status</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || countyFilter !== 'all' || categoryFilter !== 'with_category' || 
              thematicFilter !== 'all' || statusFilter !== 'unassigned') && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-xs font-medium text-gray-600">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: {searchTerm}
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {countyFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      County: {countyFilter}
                      <button
                        onClick={() => setCountyFilter('all')}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {categoryFilter !== 'with_category' && (
                    <Badge variant="secondary" className="text-xs">
                      Category: {categoryFilter === 'without_category' ? 'Without' : 'All'}
                      <button
                        onClick={() => setCategoryFilter('with_category')}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {thematicFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Area: {thematicAreas.find(a => a.id.toString() === thematicFilter)?.name}
                      <button
                        onClick={() => setThematicFilter('all')}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {statusFilter !== 'unassigned' && (
                    <Badge variant="secondary" className="text-xs">
                      Status: {statusFilter === 'assigned' ? 'Has Reviewers' : 'All'}
                      <button
                        onClick={() => setStatusFilter('unassigned')}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTrackers.size > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-900">
                {selectedTrackers.size} item{selectedTrackers.size > 1 ? 's' : ''} selected
              </span>
              
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={handleBulkAssign} className="bg-purple-600 hover:bg-purple-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Reviewers
                </Button>
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-[140px]">Reference</TableHead>
                  <TableHead className="w-[160px]">Name</TableHead>
                  <TableHead className="w-[120px]">County</TableHead>
                  <TableHead className="max-w-[420px]">Intervention Name</TableHead>
                  <TableHead className="w-[180px]">Thematic Area</TableHead>
                  <TableHead className="w-[110px]">Submitted</TableHead>
                  <TableHead className="w-[180px]">Assigned Reviewers</TableHead>
                  <TableHead className="w-[110px]">Start Date</TableHead>
                  <TableHead className="w-[110px]">Due Date</TableHead>
                  <TableHead className="w-[130px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTrackers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {statusFilter === 'unassigned' 
                          ? 'No interventions need reviewer assignment'
                          : 'No interventions match your filters'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTrackers.map((tracker) => (
                    <TableRow key={tracker.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedTrackers.has(tracker.id)}
                          onCheckedChange={(checked) => 
                            handleSelectTracker(tracker.id, checked as boolean)
                          }
                          aria-label={`Select ${tracker.proposal.reference_number}`}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-blue-600 hover:text-blue-800 font-mono text-xs"
                          onClick={() => router.push(`/portal/interventions/tracker/${tracker.id}`)}
                        >
                          {tracker.proposal.reference_number || 'N/A'}
                        </Button>
                      </TableCell>
                      
                      <TableCell className="font-medium">
                        {tracker.proposal.name || 'N/A'}
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {tracker.proposal.county || 'N/A'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-sm line-clamp-3">
                        {tracker.proposal.intervention_name || (
                          <span className="text-gray-400">Not specified</span>
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
                          >
                            {tracker.thematic_area.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-400 border-gray-300">
                            Not categorized
                          </Badge>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-sm">
                        {tracker.proposal.submitted_at 
                          ? format(new Date(tracker.proposal.submitted_at), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      
                      <TableCell>
                        {tracker.assigned_reviewers && tracker.assigned_reviewers.length > 0 ? (
                          <div className="flex items-center space-x-1">
                            <div className="flex -space-x-2">
                              {tracker.assigned_reviewers.slice(0, 3).map((reviewer) => (
                                <Avatar key={reviewer.id} className="h-6 w-6 border-2 border-white">
                                  <AvatarFallback className="text-xs">
                                    {getUserInitials(reviewer)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            {tracker.assigned_reviewers.length > 3 && (
                              <span className="text-xs text-gray-500 ml-1">
                                +{tracker.assigned_reviewers.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-sm">
                        {tracker.start_date ? (
                          <div className="flex items-center text-gray-700">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(tracker.start_date), 'MMM dd')}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-sm">
                        {tracker.completion_date ? (
                          <div className="flex items-center text-gray-700">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(tracker.completion_date), 'MMM dd')}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          
                          className="w-full text-xs whitespace-nowrap"
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          {tracker.assigned_reviewers && tracker.assigned_reviewers.length > 0 ? 'Change' : 'Assign'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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
                       <SelectItem value="200">200</SelectItem>
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


      <ReviewerAssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedTrackers={Array.from(selectedTrackers).map(id => 
          trackers.find(t => t.id === id)!
        ).filter(Boolean)}
        users={users}
        onSuccess={handleDialogSuccess}
        onRefresh={fetchData}
      />
    </div>
  );
}