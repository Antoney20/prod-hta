"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  MessageSquare, 
  User, 
  Calendar, 
  AlertTriangle,
  FileText,
  ExternalLink,
  X,
  Building,
  MapPin,
  Send,
  Star
} from "lucide-react";
import { format } from "date-fns";
import type { ProposalTracker } from "@/types/dashboard/intervention";
import { addReviewComment } from "@/app/api/dashboard/proposals";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracker: ProposalTracker | null;
  onSuccess: () => Promise<void>;
}

export default function ReviewDialog({
  open,
  onOpenChange,
  tracker,
  onSuccess,
}: ReviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Review form data
  const [comment, setComment] = useState('');
  const [commentType, setCommentType] = useState<string>('general');

  useEffect(() => {
    if (!open || !tracker) {
      setComment('');
      setCommentType('general');
      setError(null);
    }
  }, [open, tracker]);

  const handleSubmit = async () => {
    if (!tracker) return;
    
    const hasComment = comment.trim().length > 0;
    
    if (!hasComment) {
      setError('Please add a comment');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await addReviewComment({
        tracker_id: tracker.id,
        content: comment.trim(),
        comment_type: commentType,
        is_resolved: false
      });

      await onSuccess();
      onOpenChange(false);
      
    } catch (error: any) {
      setError(error.message || "Failed to add comment");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const commentTypes = [
    { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    { value: 'question', label: 'Question', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { value: 'concern', label: 'Concern', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    { value: 'suggestion', label: 'Suggestion', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { value: 'approval', label: 'Approval', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { value: 'rejection', label: 'Rejection', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  ];

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

  const getCommentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      general: 'border-l-gray-400',
      question: 'border-l-blue-500',
      concern: 'border-l-yellow-500',
      suggestion: 'border-l-purple-500',
      approval: 'border-l-green-500',
      rejection: 'border-l-red-500',
    };
    return colors[type] || 'border-l-gray-400';
  };

  if (!tracker) return null;

  const isOverdue = tracker.completion_date && new Date(tracker.completion_date) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full min-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            Review Intervention
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Intervention Details */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Intervention Info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {tracker.proposal.intervention_name || 'Untitled Intervention'}
                    </CardTitle>
                    <a
                      href={`/portal/interventions/tracker/${tracker.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 font-mono mt-1 inline-flex items-center gap-1"
                    >
                      {tracker.proposal.reference_number}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    {tracker.priority_level && (
                      <Badge className={`${getPriorityColor(tracker.priority_level)} capitalize`}>
                        {tracker.priority_level === 'urgent' || tracker.priority_level === 'high' ? (
                          <Star className="h-3 w-3 mr-1" />
                        ) : null}
                        {tracker.priority_level}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {tracker.proposal.justification}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{tracker.proposal.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{tracker.proposal.organization}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{tracker.proposal.county}</span>
                    </div>
                    {tracker.completion_date && (
                      <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        <Calendar className="h-4 w-4" />
                        <span>Due: {format(new Date(tracker.completion_date), 'MMM dd, yyyy')}</span>
                        {isOverdue && <AlertTriangle className="h-4 w-4" />}
                      </div>
                    )}
                  </div>
                </div>

                {tracker.thematic_area && (
                  <div className="pt-2">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: tracker.thematic_area.color_code,
                        color: tracker.thematic_area.color_code
                      }}
                    >
                      {tracker.thematic_area.name}
                    </Badge>
                  </div>
                )}

                {tracker.proposal.documents && tracker.proposal.documents.length > 0 && (
                  <div className="pt-2">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h5>
                    <div className="flex flex-wrap gap-2">
                      {tracker.proposal.documents.map((doc, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.document, '_blank')}
                          className="text-xs"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {doc.original_name}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Comment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Your Review Comment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Comment Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {commentTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant="outline"
                        size="sm"
                        onClick={() => setCommentType(type.value)}
                        className={`${
                          commentType === type.value
                            ? type.color + ' border-2'
                            : 'border-gray-200'
                        }`}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment-content">Your Comment *</Label>
                  <Textarea
                    id="comment-content"
                    placeholder="Share your feedback, questions, concerns, or recommendations..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                    className="w-full resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {comment.length}/1000 characters
                    </p>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !comment.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Comments History */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Comments ({tracker.comments?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!tracker.comments || tracker.comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs mt-1">Be the first to add a review</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {tracker.comments.map((comment, index) => (
                      <div
                        key={index}
                        className={`border-l-4 ${getCommentTypeColor(comment.comment_type || 'general')} pl-3 py-2 bg-gray-50 rounded-r`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {comment.comment_type || 'general'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.created_at), 'MMM dd')}
                          </span>
                        </div>
                       
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}