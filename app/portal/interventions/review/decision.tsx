"use client";

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  MessageSquare,
  User,
  FileText,
  MapPin,
  Building,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import type { ProposalTracker } from '@/types/dashboard/intervention';
import type { CreateDecisionRationaleData } from '@/types/dashboard/decision';
import { createDecisionRationale } from '@/app/api/dashboard/decision-rationale';
import { getDecisionRationales } from '@/app/api/dashboard/decision-rationale';

interface DecisionSidebarProps {
  open: boolean;
  onClose: () => void;
  tracker: ProposalTracker | null;
  onDecisionSubmitted: () => void;
}

interface DecisionForm {
  decision: string;
  detailed_rationale: string;
  approval_conditions: string;
  comment_content: string;
}

export default function DecisionSidebar({
  open,
  onClose,
  tracker,
  onDecisionSubmitted
}: DecisionSidebarProps) {
  const [decisionForm, setDecisionForm] = useState<DecisionForm>({
    decision: '',
    detailed_rationale: '',
    approval_conditions: '',
    comment_content: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setDecisionForm({
      decision: '',
      detailed_rationale: '',
      approval_conditions: '',
      comment_content: ''
    });
    onClose();
  };

  const handleDecisionSelect = (decision: string) => {
    setDecisionForm(prev => ({ ...prev, decision }));
  };

  const handleSubmit = async () => {
    if (!tracker) {
      toast.error('No tracker selected');
      return;
    }

    if (!tracker.id) {
      toast.error('Invalid tracker: Missing ID');

      return;
    }

    // Validate decision selection
    if (!decisionForm.decision) {
      toast.error('Please select a decision');
      return;
    }

    // Validate rationale
    if (!decisionForm.detailed_rationale.trim()) {
      toast.error('Please provide a detailed rationale for your decision');
      return;
    }

    // Warn about missing approval conditions if approved
    if (decisionForm.decision === 'approved' && !decisionForm.approval_conditions.trim()) {
      toast.warning('Consider adding approval conditions if any');
    }

 // Check if decision already exists
    try {
      const response = await getDecisionRationales({ tracker_id: tracker.id as any });
      if (response.results && response.results.length > 0) {
        toast.warning('Decision already made. Updates can only be done on the next stage.');
        return;
      }
    } catch (error) {
      console.error('Failed to check existing decision:', error);
      toast.error('Failed to check existing decision');
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateDecisionRationaleData = {
        tracker_id: tracker.id,
        decision: decisionForm.decision as 'approved' | 'rejected' | 'not_sure',
        detailed_rationale: decisionForm.detailed_rationale,
        approval_conditions: decisionForm.approval_conditions || null,
        comment_content: decisionForm.comment_content || null
      };

      await createDecisionRationale(payload);

      toast.success('Decision submitted successfully');
      handleClose();
      onDecisionSubmitted();
    } catch (error: any) {

      toast.error(error.message || 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  const getCommentTypeColor = (commentType: string) => {
    const colors = {
      approval: "bg-green-100 text-green-700 border-green-200",
      rejection: "bg-red-100 text-red-700 border-red-200",
      concern: "bg-orange-100 text-orange-700 border-orange-200",
      question: "bg-blue-100 text-blue-700 border-blue-200",
      general: "bg-gray-100 text-gray-700 border-gray-200",
      decision: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[commentType as keyof typeof colors] || colors.general;
  };

  const getCommentTypeIcon = (commentType: string) => {
    const icons = {
      approval: CheckCircle2,
      rejection: XCircle,
      concern: AlertCircle,
      question: HelpCircle,
      decision: CheckCircle2,
      general: MessageSquare,
    };
    const Icon = icons[commentType as keyof typeof icons] || MessageSquare;
    return <Icon className="h-4 w-4" />;
  };

  if (!tracker) return null;

  const proposal = tracker.proposal;
  const sortedComments = [...(tracker.comments || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-y-auto">
        <div className="flex flex-col min-h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b bg-gray-50 sticky top-0 z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-xl font-bold text-gray-900">
                  Make Decision
                </SheetTitle>
                <SheetDescription className="mt-1 text-sm">
                  Review intervention details and submit your decision
                </SheetDescription>
               
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1">
            <div className="px-6 py-6 space-y-6">
              {/* Proposal Details Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Proposal Information</h3>
                  <Badge variant="outline" className="font-mono text-xs">
                    {proposal.reference_number || 'N/A'}
                  </Badge>
                </div>

                <Separator className="bg-blue-200" />

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600">Intervention Name</p>
                      <p className="text-sm font-medium text-gray-900 break-words">
                        {proposal.intervention_name || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600">Submitter</p>
                      <p className="text-sm font-medium text-gray-900">{proposal.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600">Organization</p>
                      <p className="text-sm font-medium text-gray-900">
                        {proposal.organization || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600">County</p>
                      <p className="text-sm font-medium text-gray-900">{proposal.county}</p>
                    </div>
                  </div>

                  {tracker.thematic_area && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600">Thematic Area</p>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: tracker.thematic_area.color_code,
                            color: tracker.thematic_area.color_code
                          }}
                          className="text-xs mt-1"
                        >
                          {tracker.thematic_area.name}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-gray-600">Documents</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {proposal.documents?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Comments</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {tracker.comments?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    Review Comments ({sortedComments.length})
                  </h3>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {sortedComments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No comments yet</p>
                    </div>
                  ) : (
                    sortedComments.map((comment, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {comment.reviewer?.username || 'Unknown'}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {new Date(comment.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${getCommentTypeColor(comment.comment_type || 'general')} capitalize text-xs flex items-center gap-1`}
                          >
                            {getCommentTypeIcon(comment.comment_type || 'general')}
                            {comment.comment_type || 'general'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 pl-10">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Separator />

              {/* Decision Buttons */}
              <div>
                <Label className="text-base font-semibold text-gray-900 mb-3 block">
                  Select Decision <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={decisionForm.decision === 'approved' ? 'default' : 'outline'}
                    className={`h-24 flex flex-col items-center justify-center gap-2 ${
                      decisionForm.decision === 'approved'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'hover:bg-green-50 hover:border-green-300'
                    }`}
                    onClick={() => handleDecisionSelect('approved')}
                  >
                    <ThumbsUp className="h-6 w-6" />
                    <span className="text-sm font-medium">Approve</span>
                  </Button>

                  <Button
                    type="button"
                    variant={decisionForm.decision === 'rejected' ? 'default' : 'outline'}
                    className={`h-24 flex flex-col items-center justify-center gap-2 ${
                      decisionForm.decision === 'rejected'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'hover:bg-red-50 hover:border-red-300'
                    }`}
                    onClick={() => handleDecisionSelect('rejected')}
                  >
                    <ThumbsDown className="h-6 w-6" />
                    <span className="text-sm font-medium">Reject</span>
                  </Button>

                  <Button
                    type="button"
                    variant={decisionForm.decision === 'not_sure' ? 'default' : 'outline'}
                    className={`h-24 flex flex-col items-center justify-center gap-2 ${
                      decisionForm.decision === 'not_sure'
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'hover:bg-yellow-50 hover:border-yellow-300'
                    }`}
                    onClick={() => handleDecisionSelect('not_sure')}
                  >
                    <HelpCircle className="h-6 w-6" />
                    <span className="text-sm font-medium">Not Sure</span>
                  </Button>
                </div>
              </div>

              {/* Detailed Rationale */}
              <div>
                <Label htmlFor="rationale" className="text-base font-semibold text-gray-900 mb-2 block">
                  Detailed Rationale <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-600 mb-2">
                  Provide a comprehensive explanation for your decision
                </p>
                <Textarea
                  id="rationale"
                  placeholder="Explain your decision in detail. Include factors considered, concerns addressed, and reasoning..."
                  value={decisionForm.detailed_rationale}
                  onChange={(e) =>
                    setDecisionForm(prev => ({ ...prev, detailed_rationale: e.target.value }))
                  }
                  className="min-h-32 resize-none"
                  disabled={submitting}
                />
              </div>

              {/* Approval Conditions (only if approved) */}
              {decisionForm.decision === 'approved' && (
                <div>
                  <Label htmlFor="conditions" className="text-base font-semibold text-gray-900 mb-2 block">
                    Approval Conditions (Optional)
                  </Label>
                  <p className="text-xs text-gray-600 mb-2">
                    Specify any conditions or requirements for this approval
                  </p>
                  <Textarea
                    id="conditions"
                    placeholder="e.g., Must submit quarterly reports, Budget adjustments required, Additional documentation needed..."
                    value={decisionForm.approval_conditions}
                    onChange={(e) =>
                      setDecisionForm(prev => ({ ...prev, approval_conditions: e.target.value }))
                    }
                    className="min-h-24 resize-none"
                    disabled={submitting}
                  />
                </div>
              )}

              {/* Additional Comments */}
              <div>
                <Label htmlFor="comments" className="text-base font-semibold text-gray-900 mb-2 block">
                  Additional Comments (Optional)
                </Label>
                <p className="text-xs text-gray-600 mb-2">
                  Add any additional feedback or notes
                </p>
                <Textarea
                  id="comments"
                  placeholder="Any other comments or observations..."
                  value={decisionForm.comment_content}
                  onChange={(e) =>
                    setDecisionForm(prev => ({ ...prev, comment_content: e.target.value }))
                  }
                  className="min-h-24 resize-none"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t px-6 py-4 bg-gray-50 sticky bottom-0 z-10">
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !decisionForm.decision || !decisionForm.detailed_rationale.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Decision
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}