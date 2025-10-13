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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Download,
  Search,
  RefreshCw,
  Target,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import type { ProposalTracker } from '@/types/dashboard/intervention';
import { getProposalTrackers } from '@/app/api/dashboard/proposals';

export default function OverviewClient() {
  const router = useRouter();
  const [trackers, setTrackers] = useState<ProposalTracker[]>([]);
  const [filteredTrackers, setFilteredTrackers] = useState<ProposalTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [countyFilter, setCountyFilter] = useState('all');
  const [thematicFilter, setThematicFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  useEffect(() => {
    fetchTrackers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trackers, searchTerm, countyFilter, thematicFilter, priorityFilter]);

  const fetchTrackers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getProposalTrackers();
      setTrackers(response.results || []);
    } catch (err) {
      setError('Failed to load interventions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trackers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        (t.proposal.reference_number?.toLowerCase() || '').includes(term) ||
        (t.proposal.name?.toLowerCase() || '').includes(term) ||
        (t.proposal.email?.toLowerCase() || '').includes(term) ||
        (t.proposal.organization?.toLowerCase() || '').includes(term) ||
        (t.proposal.intervention_name?.toLowerCase() || '').includes(term) ||
        (t.proposal.county?.toLowerCase() || '').includes(term)
      );
    }

    if (countyFilter !== 'all') {
      filtered = filtered.filter(t => t.proposal.county === countyFilter);
    }

    if (thematicFilter !== 'all') {
      if (thematicFilter === 'unassigned') {
        filtered = filtered.filter(t => !t.thematic_area);
      } else {
        filtered = filtered.filter(t => t.thematic_area?.id.toString() === thematicFilter);
      }
    }

    if (priorityFilter !== 'all') {
      if (priorityFilter === 'unassigned') {
        filtered = filtered.filter(t => !t.priority_level);
      } else {
        filtered = filtered.filter(t => t.priority_level === priorityFilter);
      }
    }

    setFilteredTrackers(filtered);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = [
      'Reference Number',
      'Name',
      'Email',
      'County',
      'Organization',
      'Intervention Name',
      'Intervention Type',
      'Beneficiary',
      'Submitted Date',
      'Thematic Area',
      'Priority',
      'Reviewers',
      'Reviewer Count',
      'Start Date',
      'Completion Date',
    ];

    const rows = filteredTrackers.map(t => [
      t.proposal.reference_number || 'N/A',
      t.proposal.name || 'N/A',
      t.proposal.email || 'N/A',
      t.proposal.county || 'N/A',
      t.proposal.organization || 'N/A',
      t.proposal.intervention_name || 'N/A',
      t.proposal.intervention_type || 'N/A',
      t.proposal.beneficiary || 'N/A',
      t.proposal.submitted_at ? format(new Date(t.proposal.submitted_at), 'yyyy-MM-dd') : 'N/A',
      t.thematic_area?.name || 'Not assigned',
      t.priority_level || 'Not set',
      t.assigned_reviewers?.map(r => `${r.first_name || ''} ${r.last_name || ''}`.trim()).join('; ') || 'None',
      t.assigned_reviewers?.length || 0,
      t.start_date ? format(new Date(t.start_date), 'yyyy-MM-dd') : 'Not set',
      t.completion_date ? format(new Date(t.completion_date), 'yyyy-MM-dd') : 'Not set',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interventions-overview-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getUniqueCounties = () => {
    return [...new Set(trackers.map(t => t.proposal.county).filter(Boolean))].sort();
  };

  const getUniqueThematicAreas = () => {
    const areas = trackers
      .filter(t => t.thematic_area)
      .map(t => t.thematic_area!)
      .filter((area, index, self) => 
        index === self.findIndex(a => a.id === area.id)
      );
    return areas;
  };

  const getUserInitials = (reviewer: any): string => {
    const firstName = reviewer?.first_name || 'N';
    const lastName = reviewer?.last_name || 'A';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
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

  const getNextAction = (tracker: ProposalTracker) => {
    if (!tracker.thematic_area) {
      return {
        label: "Assign Category",
        href: `/portal/interventions/tracker/${tracker.id}`,
        icon: <Target className="h-3 w-3" />,
      };
    }
    
    if (!tracker.assigned_reviewers || tracker.assigned_reviewers.length === 0) {
      return {
        label: "Assign Reviewers",
        href: `/portal/interventions/reviewers/${tracker.id}`,
        icon: <Users className="h-3 w-3" />,
      };
    }
    
    return null;
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interventions Overview</h1>
          <p className="text-sm text-gray-600 mt-1">
            {totalItems} total intervention{totalItems !== 1 ? 's' : ''} • {filteredTrackers.length} filtered
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchTrackers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            disabled={filteredTrackers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV ({filteredTrackers.length})
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search interventions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="county" className="text-sm font-medium">
                County
              </Label>
              <Select value={countyFilter} onValueChange={setCountyFilter}>
                <SelectTrigger id="county">
                  <SelectValue placeholder="All Counties" />
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
              <Label htmlFor="thematic" className="text-sm font-medium">
                Thematic Area
              </Label>
              <Select value={thematicFilter} onValueChange={setThematicFilter}>
                <SelectTrigger id="thematic">
                  <SelectValue placeholder="All Thematic Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Thematic Areas</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {getUniqueThematicAreas().map(area => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority Level
              </Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
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
                  <TableHead className="w-[160px]">Name</TableHead>
                  <TableHead className="w-[200px]">Email</TableHead>
                  <TableHead className="w-[120px]">County</TableHead>
                  <TableHead className="w-[220px]">Intervention Name</TableHead>
                  <TableHead className="w-[140px]">Type</TableHead>
                  <TableHead className="w-[110px]">Submitted</TableHead>
                  <TableHead className="w-[180px]">Thematic Area</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[140px]">Reviewers</TableHead>
                  <TableHead className="w-[110px]">Start Date</TableHead>
                  <TableHead className="w-[110px]">End Date</TableHead>
                  <TableHead className="w-[130px]">Next Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTrackers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {searchTerm || countyFilter !== 'all' || thematicFilter !== 'all' || priorityFilter !== 'all'
                          ? 'No interventions match your filters'
                          : 'No interventions found'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTrackers.map((tracker) => {
                    const nextAction = getNextAction(tracker);
                    
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
                        
                        <TableCell className="font-medium">{tracker.proposal.name || 'N/A'}</TableCell>
                        
                        <TableCell className="text-sm">{tracker.proposal.email || 'N/A'}</TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {tracker.proposal.county || 'N/A'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-sm">
                          {tracker.proposal.intervention_name || (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </TableCell>
                        
                        <TableCell className="text-sm">
                          {tracker.proposal.intervention_type || (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </TableCell>
                        
                        <TableCell className="text-sm">
                          {tracker.proposal.submitted_at 
                            ? format(new Date(tracker.proposal.submitted_at), 'MMM dd, yyyy')
                            : 'N/A'}
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
                            <Badge className={`${getPriorityColor(tracker.priority_level)} capitalize`}>
                              {tracker.priority_level}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Not set</span>
                          )}
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
                          {nextAction ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(nextAction.href)}
                              className="w-full justify-center text-xs whitespace-nowrap"
                            >
                              {nextAction.icon}
                              <span className="ml-1">{nextAction.label}</span>
                            </Button>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
                              Assigned
                            </Badge>
                          )}
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t">
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
    </div>
  );
}