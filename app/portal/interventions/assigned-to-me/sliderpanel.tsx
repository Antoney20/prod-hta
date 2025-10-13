"use client";

import { useState, useEffect } from "react";
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
  Target,
  CheckCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  X
} from "lucide-react";
import { format } from "date-fns";
import type { ProposalTracker } from "@/types/dashboard/intervention";
import { addReviewComment } from "@/app/api/dashboard/proposals";

interface ReviewSlideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracker: ProposalTracker | null;
  onSuccess: () => Promise<void>;
}

export default function ReviewSlide({
  open,
  onOpenChange,
  tracker,
  onSuccess,
}: ReviewSlideProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Review form data
  const [comment, setComment] = useState('');
  const [commentType, setCommentType] = useState<string>('general');
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    console.log('ReviewSlide props changed:', { open, tracker: tracker?.id });
    if (!open || !tracker) {
      setComment('');
      setCommentType('general');
      setIsResolved(false);
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

      // Add comment
      await addReviewComment({
        tracker_id: tracker.id,
        content: comment.trim(),
        comment_type: commentType,
        is_resolved: isResolved
      });

      await onSuccess();
      onOpenChange(false);
      
    } catch (error: any) {
      setError(error.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  if (!tracker) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-white bg-opacity-50 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* Slide Panel */}
      <div 
        className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        } w-full lg:w-4/5`}
      >
        <div className="flex-1 h-full overflow-y-auto p-3 space-y-4">
  
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Review Intervention</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-3 space-y-4">
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

            {/* Intervention Details */}
            <Card>
              <CardContent className="p-3">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {tracker.proposal.intervention_name || `Intervention #${tracker.proposal.id}`}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {tracker.proposal.justification}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{tracker.proposal.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500">Organization:</span>
                      <span className="ml-1">{tracker.proposal.organization}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tracker.thematic_area && (
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: tracker.thematic_area.color_code,
                          color: tracker.thematic_area.color_code 
                        }}
                      >
                        {tracker.thematic_area.name}
                      </Badge>
                    )}
                    
                    {tracker.priority_level && (
                      <Badge variant="outline" className="capitalize">
                        {tracker.priority_level} Priority
                      </Badge>
                    )}
                    
                    {tracker.completion_date && (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {format(new Date(tracker.completion_date), 'MMM dd, yyyy')}
                      </Badge>
                    )}
                  </div>

                  {/* Documents */}
                  {tracker.proposal.documents.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Documents:</h5>
                      <div className="space-y-1">
                        {tracker.proposal.documents.map((doc, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.document, '_blank')}
                            className="justify-start h-auto p-2 w-full sm:w-auto"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="truncate">{doc.original_name}</span>
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Review Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900">
                      {tracker.comments?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Comments Added</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="capitalize">
                      {tracker.review_stage.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">Review Stage</p>
                  </div>
                  <div className="text-center">
                    <Badge 
                      variant="outline" 
                      className={tracker.comments && tracker.comments.length > 0 
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-orange-100 text-orange-700 border-orange-300"
                      }
                    >
                      {tracker.comments && tracker.comments.length > 0 ? 'Reviewed' : 'Pending'}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Comment */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Add Review Comment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Comment Type Buttons */}
                <div className="space-y-2">
                  <Label>Comment Type</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'general', label: 'General Comment', icon: MessageSquare },
                      { value: 'revision', label: 'Need Revision', icon: AlertTriangle },
                      { value: 'approval', label: 'Needs Approval', icon: CheckCircle },
                      { value: 'maybe', label: 'Not sure', icon: Target }
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        type="button"
                        variant={commentType === value ? "default" : "outline"}
                        onClick={() => setCommentType(value)}
                        className="h-12 flex flex-col items-center justify-center gap-1 text-xs"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Mark as resolved checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-resolved"
                    checked={isResolved}
                    onChange={(e) => setIsResolved(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="is-resolved" className="text-sm">
                    Mark as resolved
                  </Label>
                </div>

                {/* Comment Content */}
                <div className="space-y-2">
                  <Label htmlFor="comment-content">Comment *</Label>
                  <Textarea
                    id="comment-content"
                    placeholder="Add your review comment here... Be specific about your feedback, concerns, or recommendations."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    {comment.length}/1000 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Existing Comments Preview */}
            {tracker.comments && tracker.comments.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Comments ({tracker.comments.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {tracker.comments.slice(-3).map((comment, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                      
                        <span className="text-gray-500">
                          {format(new Date(comment.created_at), 'MMM dd')}
                        </span>
                      </div>
                      <p className="text-gray-700 line-clamp-2">{comment.content}</p>
                    </div>
                  ))}
                  {tracker.comments.length > 3 && (
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      View all {tracker.comments.length} comments
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !comment.trim()}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Review Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}