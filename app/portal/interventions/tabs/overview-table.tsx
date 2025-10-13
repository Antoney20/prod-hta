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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Eye,
  Edit,
  Users,
  MessageSquare,
  MoreHorizontal,
  FileText,
  MapPin,
  User,
  Building,
  Mail,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import type { ProposalTracker, Document } from "@/types/dashboard/intervention";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TabType = 'overview' | 'thematic' | 'assignment' | 'review';

interface InterventionsTableProps {
  trackers: ProposalTracker[];
  onRefresh: () => Promise<void>;
  router: AppRouterInstance;
  getWorkflowStage: (tracker: ProposalTracker) => string;
  activeTab: TabType;
  selectedTrackers: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  // Pagination props
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const getUserInitials = (reviewer: any): string => {
  const firstName = reviewer.first_name || 'N';
  const lastName = reviewer.last_name || 'A';
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

const ProposalDetailsDialog = ({ 
  tracker, 
  isOpen, 
  onClose 
}: { 
  tracker: ProposalTracker | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!tracker) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {tracker.proposal.intervention_name || `Intervention #${tracker.proposal.id}`}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Submitter Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{tracker.proposal.name}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{tracker.proposal.organization}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{tracker.proposal.email}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{tracker.proposal.county}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Intervention Info</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Profession:</span> {tracker.proposal.profession}
                </div>
                <div>
                  <span className="text-gray-600">Beneficiary:</span> {tracker.proposal.beneficiary}
                </div>
                <div>
                  <span className="text-gray-600">Submitted:</span> {format(new Date(tracker.proposal.submitted_at), 'PPP')}
                </div>
              </div>
            </div>
          </div>

          {/* Justification */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Justification</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {tracker.proposal.justification}
            </p>
          </div>

          {/* Expected Impact */}
          {tracker.proposal.expected_impact && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Expected Impact</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {tracker.proposal.expected_impact}
              </p>
            </div>
          )}

          {/* Documents */}
          {tracker.proposal.documents.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
              <div className="space-y-2">
                {tracker.proposal.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{doc.original_name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(doc.document, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tracker Info */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tracking Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Review Stage:</span>
                <Badge variant="outline" className="ml-2 capitalize">
                  {tracker.review_stage.replace('_', ' ')}
                </Badge>
              </div>
              {tracker.thematic_area && (
                <div>
                  <span className="text-gray-600">Thematic Area:</span>
                  <Badge 
                    variant="outline" 
                    className="ml-2"
                    style={{ 
                      borderColor: tracker.thematic_area.color_code,
                      color: tracker.thematic_area.color_code 
                    }}
                  >
                    {tracker.thematic_area.name}
                  </Badge>
                </div>
              )}
              {tracker.priority_level && (
                <div>
                  <span className="text-gray-600">Priority:</span>
                  <Badge variant="outline" className="ml-2 capitalize">
                    {tracker.priority_level}
                  </Badge>
                </div>
              )}
              <div>
                <span className="text-gray-600">Progress:</span>
                <div className="flex items-center mt-1">
                  <Progress value={tracker.progress} className="flex-1" />
                  <span className="ml-2 text-xs">{tracker.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Document Viewer Popup Component
const DocumentViewerDialog = ({ 
  document, 
  isOpen, 
  onClose 
}: { 
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium">
              {document.original_name}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <iframe
            src={document.document}
            className="w-full h-full border rounded"
            title={document.original_name}
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => window.open(document.document, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function InterventionsTable({
  trackers,
  onRefresh,
  router,
  getWorkflowStage,
  activeTab,
  selectedTrackers,
  onSelectionChange,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: InterventionsTableProps) {
  const [selectedProposal, setSelectedProposal] = useState<ProposalTracker | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  
  const showSelection = activeTab === 'thematic' || activeTab === 'assignment';
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(trackers.map(t => t.id));
      onSelectionChange(allIds);
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectTracker = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedTrackers);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    onSelectionChange(newSelected);
  };

  const handleProposalClick = (tracker: ProposalTracker) => {
    setSelectedProposal(tracker);
    setProposalDialogOpen(true);
  };

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document);
    setDocumentDialogOpen(true);
  };

  const allSelected = trackers.length > 0 && trackers.every(t => selectedTrackers.has(t.id));

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

  const getNextAction = (tracker: ProposalTracker) => {
    if (!tracker.thematic_area) {
      return {
        label: "Assign Category",
        action: () => router.push(`/portal/interventions/tracker/${tracker.id}`),
        icon: <Target className="h-4 w-4" />,
        variant: "default" as const
      };
    }
    
    if (!tracker.assigned_reviewers || tracker.assigned_reviewers.length === 0) {
      return {
        label: "Assign Reviewers",
        action: () => router.push(`/portal/interventions/reviewers/${tracker.id}`),
        icon: <Users className="h-4 w-4" />,
        variant: "default" as const
      };
    }
    
    return {
      label: "Reviews & Comments",
      action: () => router.push(`/portal/interventions/reviews/${tracker.id}`),
      icon: <MessageSquare className="h-4 w-4" />,
      variant: "outline" as const
    };
  };

  if (trackers.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No interventions found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to see more results.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {showSelection && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all interventions"
                      />
                    </TableHead>
                  )}
                  <TableHead className="min-w-[250px]">Proposal</TableHead>
                  <TableHead className="min-w-[150px]">Documents</TableHead>
                  <TableHead className="min-w-[140px]">Review Stage</TableHead>
                  <TableHead className="min-w-[160px]">Thematic Area</TableHead>
                  <TableHead className="min-w-[120px]">Priority</TableHead>
                  <TableHead className="min-w-[160px]">Assigned Reviewers</TableHead>
                  <TableHead className="min-w-[120px]">Start Date</TableHead>
                  <TableHead className="min-w-[120px]">Complete Date</TableHead>
                  <TableHead className="min-w-[100px]">Progress</TableHead>
                  <TableHead className="min-w-[200px]">Notes</TableHead>
                  <TableHead className="w-[150px]">Next Action</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackers.map((tracker) => {
                  const isSelected = selectedTrackers.has(tracker.id);
                  const nextAction = getNextAction(tracker);
                  
                  return (
                    <TableRow key={tracker.id} className="hover:bg-gray-50">
                      {showSelection && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleSelectTracker(tracker.id, checked as boolean)
                            }
                            aria-label={`Select tracker ${tracker.id}`}
                          />
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <div className="space-y-1">
                          <Button
                            variant="link"
                            className="h-auto p-0 text-left font-medium text-blue-600 hover:text-blue-800"
                            onClick={() => handleProposalClick(tracker)}
                          >
                            {tracker.proposal.intervention_name || `Intervention #${tracker.proposal.id}`}
                          </Button>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {tracker.proposal.justification}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
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
                        {tracker.proposal.documents.length > 0 ? (
                          <div className="space-y-1">
                            {tracker.proposal.documents.slice(0, 2).map((doc, index) => (
                              <Button
                                key={index}
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800 truncate max-w-[140px]"
                                onClick={() => handleDocumentClick(doc)}
                              >
                                <FileText className="h-3 w-3 mr-1 shrink-0" />
                                {doc.original_name}
                              </Button>
                            ))}
                            {tracker.proposal.documents.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{tracker.proposal.documents.length - 2} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No documents</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getReviewStageColor(tracker.review_stage)} font-medium capitalize`}
                        >
                          {tracker.review_stage.replace('_', ' ')}
                        </Badge>
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
                          <Badge 
                            variant="outline" 
                            className={`${getPriorityColor(tracker.priority_level)} font-medium capitalize`}
                          >
                            {tracker.priority_level}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">Not set</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {tracker.assigned_reviewers && tracker.assigned_reviewers.length > 0 ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex -space-x-2">
                              {tracker.assigned_reviewers.slice(0, 3).map((reviewer, index) => (
                                <Avatar key={reviewer.id} className="h-6 w-6 border-2 border-white">
                                  <AvatarFallback className="text-xs">
  {getUserInitials(reviewer)}
</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            {tracker.assigned_reviewers.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{tracker.assigned_reviewers.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">None assigned</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {tracker.start_date ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {format(new Date(tracker.start_date), 'MMM dd')}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not set</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {tracker.completion_date ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {format(new Date(tracker.completion_date), 'MMM dd')}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not set</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={tracker.progress} className="h-2" />
                          <span className="text-xs text-gray-600">{tracker.progress}%</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {tracker.notes ? (
                          <p className="text-sm text-gray-700 line-clamp-2 max-w-[200px]">
                            {tracker.notes}
                          </p>
                        ) : (
                          <span className="text-gray-400 text-sm">No notes</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {nextAction && (
                          <Button
                            size="sm"
                            variant={nextAction.variant}
                            onClick={nextAction.action}
                            className="w-full justify-center"
                          >
                            {nextAction.icon}
                            <span className="ml-1 text-xs">{nextAction.label}</span>
                          </Button>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleProposalClick(tracker)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => router.push(`/portal/interventions/tracker/${tracker.id}`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Tracker
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => router.push(`/portal/interventions/comments/${tracker.id}`)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Comments ({tracker.comments?.length || 0})
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => router.push(`/portal/interventions/reviewers/${tracker.id}`)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Manage Reviewers
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => window.open(`mailto:${tracker.proposal.email}`, '_blank')}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Contact Submitter
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-700 px-2">
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

      {/* Proposal Details Dialog */}
      <ProposalDetailsDialog
        tracker={selectedProposal}
        isOpen={proposalDialogOpen}
        onClose={() => {
          setProposalDialogOpen(false);
          setSelectedProposal(null);
        }}
      />

      {/* Document Viewer Dialog */}
      <DocumentViewerDialog
        document={selectedDocument}
        isOpen={documentDialogOpen}
        onClose={() => {
          setDocumentDialogOpen(false);
          setSelectedDocument(null);
        }}
      />
    </>
  );
}