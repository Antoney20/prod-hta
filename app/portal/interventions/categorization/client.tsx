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
  Target,
  Palette,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import type { ProposalTracker, ThematicArea } from '@/types/dashboard/intervention';
import { getProposalTrackers, getThematicAreas } from '@/app/api/dashboard/proposals';
import ThematicAreasDialog from '../tabs/new-thematic-area';

export default function CategorizationClient() {
  const router = useRouter();
  const [trackers, setTrackers] = useState<ProposalTracker[]>([]);
  const [filteredTrackers, setFilteredTrackers] = useState<ProposalTracker[]>([]);
  const [thematicAreas, setThematicAreas] = useState<ThematicArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection
  const [selectedTrackers, setSelectedTrackers] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [countyFilter, setCountyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'unassigned' | 'assigned' | 'all'>('unassigned');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  // Dialog
  const [dialogMode, setDialogMode] = useState<'assign' | 'manage' | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trackers, searchTerm, countyFilter, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [trackersResponse, areasData] = await Promise.all([
        getProposalTrackers(),
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
    if (statusFilter === 'unassigned') {
      filtered = filtered.filter(t => !t.thematic_area);
    } else if (statusFilter === 'assigned') {
      filtered = filtered.filter(t => t.thematic_area);
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

    setFilteredTrackers(filtered);
    setCurrentPage(1);
  };

  const getUniqueCounties = () => {
    return [...new Set(trackers.map(t => t.proposal.county).filter(Boolean))].sort();
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
    setDialogMode('assign');
  };

  const handleDialogSuccess = async () => {
    await fetchData();
    setSelectedTrackers(new Set());
  };

  // Stats
  const stats = {
    total: trackers.length,
    unassigned: trackers.filter(t => !t.thematic_area).length,
    assigned: trackers.filter(t => t.thematic_area).length,
    areas: thematicAreas.length
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
          <h1 className="text-2xl font-bold text-gray-900">Categorization</h1>
          <p className="text-sm text-gray-600 mt-1">
            Assign thematic areas to intervention proposals
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDialogMode('manage')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Areas
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="status" className="text-sm font-medium">
                Assignment Status
              </Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned Only</SelectItem>
                  <SelectItem value="assigned">Assigned Only</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTrackers.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedTrackers.size} item{selectedTrackers.size > 1 ? 's' : ''} selected
              </span>
              
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={handleBulkAssign}>
                  <Target className="h-4 w-4 mr-2" />
                  Assign Thematic Areas
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
                  <TableHead className="w-[220px]">Intervention Name</TableHead>
                  <TableHead className="w-[110px]">Submitted</TableHead>
                  <TableHead className="w-[180px]">Thematic Area</TableHead>
                  <TableHead className="w-[130px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTrackers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {statusFilter === 'unassigned' 
                          ? 'No unassigned interventions found'
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
                          onClick={() => router.push(`/portal/interventions/tracker/${tracker.proposal.id}`)}
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
                      
                      <TableCell className="text-sm">
                        {tracker.proposal.intervention_name || (
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
                        <Button
                          size="sm"
                          variant="outline"
                          
                          className="w-full text-xs whitespace-nowrap"
                        >
                          <Target className="h-3 w-3 mr-1" />
                          {tracker.thematic_area ? 'Change' : 'Assign'}
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

      {/* Thematic Areas Dialog */}
      <ThematicAreasDialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && setDialogMode(null)}
        mode={dialogMode || 'manage'}
        selectedTrackers={Array.from(selectedTrackers).map(id => 
          trackers.find(t => t.id === id)!
        ).filter(Boolean)}
        thematicAreas={thematicAreas}
        onSuccess={handleDialogSuccess}
        onRefresh={fetchData}
      />
    </div>
  );
}