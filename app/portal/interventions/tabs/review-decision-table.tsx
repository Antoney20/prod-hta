"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye,
  MessageSquare,
  FileText,
  MapPin,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Star,
  ClipboardCheck,
  ThumbsUp,
  ThumbsDown,
  HelpCircle
} from "lucide-react";
import { format } from "date-fns";
import type { ProposalTracker } from "@/types/dashboard/intervention";

interface ReviewDecisionTableProps {
  trackers: ProposalTracker[];
  onRefresh: () => Promise<void>;
  onReview: (tracker: ProposalTracker) => void;
  router: any;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function ReviewDecisionTable({
  trackers,
  onRefresh,
  onReview,
  router,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: ReviewDecisionTableProps) {

  const getReviewStageColor = (stage: string) => {
    const colors = {
      initial: "bg-gray-100 text-gray-700",
      under_review: "bg-blue-100 text-blue-700",
      needs_revision: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      withdrawn: "bg-gray-100 text-gray-700",
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <Star className="h-3 w-3" />;
      default: return null;
    }
  };

  const getReviewStageIcon = (stage: string) => {
    switch (stage) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'needs_revision': return <AlertTriangle className="h-4 w-4" />;
      case 'under_review': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCommentTypeIcon = (type: string) => {
    switch (type) {
      case 'approval': return <ThumbsUp className="h-3 w-3 text-green-600" />;
      case 'concern': return <ThumbsDown className="h-3 w-3 text-red-600" />;
      case 'question': return <HelpCircle className="h-3 w-3 text-blue-600" />;
      default: return <MessageSquare className="h-3 w-3 text-gray-600" />;
    }
  };

  const getLatestComment = (tracker: ProposalTracker) => {
    if (!tracker.comments || tracker.comments.length === 0) return null;
    return tracker.comments[tracker.comments.length - 1];
  };

  const getActionButton = (tracker: ProposalTracker) => {
    const stage = tracker.review_stage;
    
    if (['approved', 'rejected', 'needs_revision'].includes(stage)) {
      return {
        label: 'View Decision',
        icon: <Eye className="h-4 w-4" />,
        variant: 'outline' as const,
      };
    }
    
    return {
      label: 'Make Decision',
      icon: <ClipboardCheck className="h-4 w-4" />,
      variant: 'default' as const,
    };
  };

  if (trackers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No interventions with comments
          </h3>
          <p className="text-gray-600 mb-4">
            Interventions will appear here once reviewers add comments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[300px]">Proposal</TableHead>
                <TableHead className="min-w-[120px]">Documents</TableHead>
                <TableHead className="min-w-[140px]">Thematic Area</TableHead>
                <TableHead className="min-w-[120px]">Assigned Users</TableHead>
                <TableHead className="min-w-[100px]">Priority</TableHead>
                <TableHead className="min-w-[100px]">Start Date</TableHead>
                <TableHead className="min-w-[100px]">Complete Date</TableHead>
                <TableHead className="min-w-[200px]">Latest Comment</TableHead>
                <TableHead className="min-w-[120px]">Decision Status</TableHead>
                <TableHead className="w-[120px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trackers.map((tracker) => {
                const action = getActionButton(tracker);
                const latestComment = getLatestComment(tracker);
                const isOverdue = tracker.completion_date && new Date(tracker.completion_date) < new Date();
                
                return (
                  <TableRow 
                    key={tracker.id} 
                    className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {tracker.proposal.intervention_name || `Intervention #${tracker.proposal.id}`}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {tracker.proposal.justification}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 space-x-3">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {tracker.proposal.name}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {tracker.proposal.county}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {tracker.proposal.documents.length}
                        </span>
                        {tracker.proposal.documents.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(tracker.proposal.documents[0].document, '_blank')}
                            className="h-6 px-2 text-xs"
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {tracker.thematic_area ? (
                        <Badge 
                          variant="outline"
                          className="max-w-[120px] truncate"
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
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {tracker.assigned_reviewers?.length || 0}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {tracker.priority_level ? (
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(tracker.priority_level)}
                          <Badge 
                            variant="outline" 
                            className={`${getPriorityColor(tracker.priority_level)} text-xs capitalize`}
                          >
                            {tracker.priority_level}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not set</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {tracker.start_date ? (
                        <span className="text-sm text-gray-700">
                          {format(new Date(tracker.start_date), 'MMM dd')}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not set</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {tracker.completion_date ? (
                        <div className={`flex items-center text-sm ${
                          isOverdue ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            {format(new Date(tracker.completion_date), 'MMM dd')}
                          </span>
                          {isOverdue && <AlertTriangle className="h-3 w-3 ml-1" />}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not set</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {latestComment ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {getCommentTypeIcon(latestComment.comment_type ?? 'default')}
                            <span className="text-xs text-gray-500 capitalize">
                              {latestComment.comment_type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {latestComment.content}
                          </p>
                        
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No comments</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getReviewStageIcon(tracker.review_stage)}
                        <Badge 
                          variant="outline" 
                          className={`${getReviewStageColor(tracker.review_stage)} text-xs capitalize`}
                        >
                          {tracker.review_stage.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => onReview(tracker)}
                        variant={action.variant}
                        className="w-full justify-center"
                      >
                        {action.icon}
                        <span className="ml-1 text-xs">{action.label}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 gap-4">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 whitespace-nowrap">Rows per page:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-700 px-2 whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}