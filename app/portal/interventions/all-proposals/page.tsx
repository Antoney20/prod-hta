"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  FileText, 
  RefreshCw,
  MapPin,
  Calendar,
  FolderOpen,
  Download,
  Eye,
  FileDown
} from 'lucide-react';


import { useGlobalUser } from '@/app/context/guard';
import { getSubmittedProposals } from '@/app/api/dashboard/submitted-proposals';
import { toast } from 'react-toastify';
import InterventionsByDayChart from './chart';
import { SubmittedProposal } from '@/types/dashboard/submittedProposals';

interface FilterState {
  search: string;
  county: string;
  interventionType: string;
  fromDate: string;
  toDate: string;
}

interface StatsData {
  total: number;
  byCounty: Record<string, number>;
  byType: Record<string, number>;
  byMonth: Record<string, number>;
}

function AllInterventionsPage() {
  const router = useRouter();
  const { user, isLoaded } = useGlobalUser();
  
  // State
  const [allProposals, setAllProposals] = useState<SubmittedProposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<SubmittedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    byCounty: {},
    byType: {},
    byMonth: {}
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  
  // Detail Modal
  const [selectedProposal, setSelectedProposal] = useState<SubmittedProposal | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    county: 'all',
    interventionType: 'all',
    fromDate: '',
    toDate: ''
  });

  const calculateStats = (proposals: SubmittedProposal[]): StatsData => {
    const stats: StatsData = {
      total: proposals.length,
      byCounty: {},
      byType: {},
      byMonth: {}
    };

    proposals.forEach(proposal => {
      // County stats
      if (proposal.county) {
        stats.byCounty[proposal.county] = (stats.byCounty[proposal.county] || 0) + 1;
      }

      // Type stats
      if (proposal.intervention_type) {
        stats.byType[proposal.intervention_type] = (stats.byType[proposal.intervention_type] || 0) + 1;
      }

      // Month stats
      if (proposal.date) {
        const month = new Date(proposal.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
      }
    });

    return stats;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const response = await getSubmittedProposals();
      const proposals = response.results || [];
      
      setAllProposals(proposals);
      setStats(calculateStats(proposals));
      
    } catch (error) {
      toast.error('Failed to load interventions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    } else if (isLoaded && !user) {
      setLoading(false);
      toast.error('Please log in to view interventions');
      router.push('/auth/login');
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    filterProposals();
  }, [allProposals, filters]);

  const filterProposals = () => {
    let filtered = [...allProposals];

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(term) ||
        p.organization?.toLowerCase().includes(term) ||
        p.intervention_name?.toLowerCase().includes(term) ||
        p.beneficiary?.toLowerCase().includes(term) ||
        p.reference_number?.toLowerCase().includes(term)
      );
    }

    // County filter
    if (filters.county !== 'all') {
      filtered = filtered.filter(p => p.county === filters.county);
    }

    // Intervention type filter
    if (filters.interventionType !== 'all') {
      filtered = filtered.filter(p => p.intervention_type === filters.interventionType);
    }

    // Date range filter
    if (filters.fromDate) {
      filtered = filtered.filter(p => new Date(p.date) >= new Date(filters.fromDate));
    }
    if (filters.toDate) {
      filtered = filtered.filter(p => new Date(p.date) <= new Date(filters.toDate));
    }

    setFilteredProposals(filtered);
    setCurrentPage(1);
  };

  const getUniqueCounties = (): string[] => {
    return [...new Set(allProposals
      .map(p => p.county)
      .filter((county): county is string => Boolean(county))
    )].sort();
  };

  const getUniqueInterventionTypes = (): string[] => {
    return [...new Set(allProposals
      .map(p => p.intervention_type)
      .filter((type): type is string => Boolean(type))
    )].sort();
  };



  const handleViewDetails = (proposal: SubmittedProposal) => {
    setSelectedProposal(proposal);
    setDetailsOpen(true);
  };

  const handleDownloadDocument = async (documentUrl: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
    }
  };

  const exportToCSV = () => {
    try {
      // Define CSV headers
      const headers = [
        'Reference Number',
        'Name',
        'Email',
        'Phone',
        'Profession',
        'Organization',
        'County',
        'Date Submitted',
        'Intervention Name',
        'Intervention Type',
        'Proposed Beneficiary',
        'Justification',
        'Expected Impact',
        'Additional Info',
        'Documents Count',
        'Document Names',
        'Document Links',
        'Signature'
      ];

      // Convert filtered proposals to CSV rows
      const csvRows = filteredProposals.map(proposal => {
        // Prepare document names and links
        const documentNames = proposal.documents && proposal.documents.length > 0
          ? proposal.documents.map(doc => doc.original_name).join(' | ')
          : '';
        
        const documentLinks = proposal.documents && proposal.documents.length > 0
          ? proposal.documents.map(doc => doc.document_url).join(' | ')
          : '';

        return [
          proposal.reference_number || '',
          proposal.name || '',
          proposal.email || '',
          proposal.phone || '',
          proposal.profession || '',
          proposal.organization || '',
          proposal.county || '',
          proposal.date ? new Date(proposal.date).toLocaleDateString() : '',
          proposal.intervention_name || '',
          proposal.intervention_type || '',
          proposal.beneficiary || '',
          proposal.justification ? `"${proposal.justification.replace(/"/g, '""')}"` : '',
          proposal.expected_impact ? `"${proposal.expected_impact.replace(/"/g, '""')}"` : '',
          proposal.additional_info ? `"${proposal.additional_info.replace(/"/g, '""')}"` : '',
          proposal.documents?.length || 0,
          documentNames ? `"${documentNames}"` : '',
          documentLinks ? `"${documentLinks}"` : '',
          proposal.signature || ''
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `interventions_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      

    } catch (error) {
      toast.error('Failed to export to CSV');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      county: 'all',
      interventionType: 'all',
      fromDate: '',
      toDate: ''
    });
  };

  // Pagination
  const totalItems = filteredProposals.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentProposals = filteredProposals.slice(startIndex, startIndex + pageSize);

  // Get top counties and types for stats
  const topCounties = Object.entries(stats.byCounty)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  const topTypes = Object.entries(stats.byType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Loading state
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
    <div className="space-y-6 p-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Interventions</h1>
          <p className="text-gray-600">View and manage all submitted intervention proposals</p>
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
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top County</p>
                <p className="text-xl font-bold text-gray-900">
                  {topCounties[0] ? topCounties[0][0] : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {topCounties[0] ? `${topCounties[0][1]} proposals` : ''}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Type</p>
                <p className="text-xl font-bold text-gray-900 truncate max-w-[150px]">
                  {topTypes[0] ? topTypes[0][0] : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {topTypes[0] ? `${topTypes[0][1]} proposals` : ''}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.entries(stats.byMonth)[0]?.[1] || 0}
                </p>
                <p className="text-sm text-gray-500">
                  {Object.entries(stats.byMonth)[0]?.[0] || 'N/A'}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Always Open */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Filter Interventions</h3>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">
                Search by Name, Organization or Reference
              </Label>
              <Input
                id="search"
                placeholder="Type to search..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="county" className="text-sm font-medium">
                Filter by County
              </Label>
              <Select value={filters.county} onValueChange={(value) => setFilters({ ...filters, county: value })}>
                <SelectTrigger id="county" className="w-full">
                  <SelectValue placeholder="Select county" />
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
              <Label htmlFor="interventionType" className="text-sm font-medium">
                Filter by Intervention Type
              </Label>
              <Select value={filters.interventionType} onValueChange={(value) => setFilters({ ...filters, interventionType: value })}>
                <SelectTrigger id="interventionType" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getUniqueInterventionTypes().map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageSize" className="text-sm font-medium">
                Results Per Page
              </Label>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger id="pageSize" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="30">30 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromDate" className="text-sm font-medium">
                From Date
              </Label>
              <Input
                id="fromDate"
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate" className="text-sm font-medium">
                To Date
              </Label>
              <Input
                id="toDate"
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} of {totalItems} interventions
          {filteredProposals.length < allProposals.length && (
            <span className="text-blue-600 ml-1">(filtered from {allProposals.length} total)</span>
          )}
        </p>
        {filteredProposals.length > 0 && (
          <Button 
            size="sm"
            onClick={exportToCSV}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        )}
      </div>

      {/* Proposals Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    County
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intervention Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proposed Beneficiary
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProposals.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                      No interventions found
                    </td>
                  </tr>
                ) : (
                  currentProposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        
                          <Button
                            variant="link"
                            className="h-auto p-0 text-blue-600 hover:text-blue-800 font-mono text-xs"
                            onClick={() => router.push(`/portal/interventions/tracker/${proposal.id}`)}
                          >
                            {proposal.reference_number || 'N/A'}
                          </Button>
                      </td>



                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{proposal.name}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{proposal.email || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{proposal.phone}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{proposal.organization}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {proposal.county}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(proposal.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {proposal.intervention_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {proposal.intervention_type || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-[300px] line-clamp-2">
                          {proposal.beneficiary}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {proposal.documents && proposal.documents.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {proposal.documents.map((doc) => (
                              <a
                                key={doc.id}
                                href={doc.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3" />
                                {doc.original_name}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">No documents</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(proposal)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}


      {/* Interventions by Day Chart */}
      <InterventionsByDayChart proposals={allProposals} />

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="min-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Intervention Details</span>
             
            </DialogTitle>
            <DialogDescription>
              Complete information about the submitted intervention proposal
            </DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-6 mt-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Reference Number</Label>
                    <p className="text-sm font-medium">{selectedProposal.reference_number}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Date Submitted</Label>
                    <p className="text-sm">{new Date(selectedProposal.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Name</Label>
                    <p className="text-sm">{selectedProposal.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Email</Label>
                    <p className="text-sm">{selectedProposal.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Phone</Label>
                    <p className="text-sm">{selectedProposal.phone}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Profession</Label>
                    <p className="text-sm">{selectedProposal.profession}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Organization</Label>
                    <p className="text-sm">{selectedProposal.organization}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">County</Label>
                    <p className="text-sm">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {selectedProposal.county}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Intervention Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Intervention Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Intervention Name</Label>
                    <p className="text-sm">{selectedProposal.intervention_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Intervention Type</Label>
                    <p className="text-sm">{selectedProposal.intervention_type || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Proposed Beneficiary</Label>
                  <p className="text-sm">{selectedProposal.beneficiary}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Justification</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedProposal.justification}</p>
                </div>
                {selectedProposal.expected_impact && (
                  <div>
                    <Label className="text-xs text-gray-500">Expected Impact</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedProposal.expected_impact}</p>
                  </div>
                )}
                {selectedProposal.additional_info && (
                  <div>
                    <Label className="text-xs text-gray-500">Additional Information</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedProposal.additional_info}</p>
                  </div>
                )}
              </div>

              {/* Documents */}
              {selectedProposal.documents && selectedProposal.documents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Documents</h3>
                  <div className="space-y-2">
                    {selectedProposal.documents.map((doc) => (
                      <div key={`modal-doc-${doc.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span className="text-sm">{doc.original_name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.document_url, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc.document_url, doc.original_name)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signature */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Signature</h3>
                <div>
                  <Label className="text-xs text-gray-500">Signed By</Label>
                  <p className="text-sm font-medium">{selectedProposal.signature}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AllInterventionsPage;