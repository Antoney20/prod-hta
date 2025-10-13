"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ClipboardCheck, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

import type { ProposalTracker, ThematicArea } from '@/types/dashboard/intervention';
import { getProposalTrackers, getThematicAreas } from '@/app/api/dashboard/proposals';
import { toast } from 'react-toastify';
import ReviewDecisionTable from './review-decision-table';

function ReviewDecisionPage() {
  const router = useRouter();
  const [allTrackers, setAllTrackers] = useState<ProposalTracker[]>([]);
  const [filteredTrackers, setFilteredTrackers] = useState<ProposalTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTracker, setSelectedTracker] = useState<ProposalTracker | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter to only show trackers with comments (ready for decision)
    const filtered = allTrackers.filter(tracker => 
      tracker.comments && tracker.comments.length > 0
    );
    setFilteredTrackers(filtered);
  }, [allTrackers]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const trackersResponse = await getProposalTrackers();
      const trackers = trackersResponse.results || [];

      setAllTrackers(trackers);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
    toast.success('Data refreshed');
  };

  const handleReviewTracker = (tracker: ProposalTracker) => {
    // Navigate to detailed view or open decision modal
    router.push(`/portal/interventions/${tracker.proposal.id}`);
  };

  // Stats based on interventions with comments
  const stats = {
    withComments: filteredTrackers.length,
    approved: filteredTrackers.filter(t => t.review_stage === 'approved').length,
    rejected: filteredTrackers.filter(t => t.review_stage === 'rejected').length,
    needsRevision: filteredTrackers.filter(t => t.review_stage === 'needs_revision').length,
    pendingDecision: filteredTrackers.filter(t => 
      ['initial', 'under_review'].includes(t.review_stage)
    ).length,
  };

  // Pagination
  const totalItems = filteredTrackers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentTrackers = filteredTrackers.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="space-y-6 p-4">
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
    <div className="space-y-6 p-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review & Decision</h1>
          <p className="text-gray-600">Review interventions with comments and make decisions</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Comments</p>
                <p className="text-2xl font-bold text-blue-600">{stats.withComments}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
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
                <ClipboardCheck className="h-6 w-6 text-orange-600" />
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
      </div>

      {/* Review Table */}
      <ReviewDecisionTable
        trackers={currentTrackers}
        onRefresh={handleRefresh}
        onReview={handleReviewTracker}
        router={router}
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

export default ReviewDecisionPage;