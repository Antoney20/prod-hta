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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, UserPlus, Search, AlertTriangle, Users, X, Calendar, Star } from "lucide-react";
import type { ProposalTracker, UserType } from "@/types/dashboard/intervention";
import { assignReviewers, updateProposalTracker } from "@/app/api/dashboard/proposals";

interface ReviewerAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTrackers: ProposalTracker[];
  users: UserType[];
  onSuccess: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function ReviewerAssignmentDialog({
  open,
  onOpenChange,
  selectedTrackers,
  users,
  onSuccess,
  onRefresh,
}: ReviewerAssignmentDialogProps) {
  const [selectedReviewers, setSelectedReviewers] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Additional assignment data
  const [priorityLevel, setPriorityLevel] = useState<string>('medium');
  const [startDate, setStartDate] = useState<string>('');
  const [completionDate, setCompletionDate] = useState<string>('');

  useEffect(() => {
    if (!open) {
      setSelectedReviewers(new Set());
      setError(null);
      setNotes('');
      setSearchTerm('');
      setPriorityLevel('medium');
      setStartDate('');
      setCompletionDate('');
    }
    
    // Set default dates when opening
    if (open && !startDate) {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      
      // Set default completion date to 2 weeks from today
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
      setCompletionDate(twoWeeksFromNow.toISOString().split('T')[0]);
    }
  }, [open, startDate]);

  const handleReviewerToggle = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedReviewers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedReviewers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviewers(new Set(filteredUsers.map(u => u.id)));
    } else {
      setSelectedReviewers(new Set());
    }
  };

  const handleAssign = async () => {
    if (selectedReviewers.size === 0 || selectedTrackers.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Assign reviewers and update tracker settings for each selected tracker
      const promises = selectedTrackers.map(async (tracker) => {
        // First assign reviewers
        await assignReviewers({
          tracker_id: tracker.id,
          reviewer_ids: Array.from(selectedReviewers),
          notes: notes.trim() || undefined
        });

        // Then update tracker with priority and dates
        const updateData: any = {
          priority_level: priorityLevel,
        };

        if (startDate) {
          updateData.start_date = startDate;
        }
        
        if (completionDate) {
          updateData.completion_date = completionDate;
        }

        await updateProposalTracker(tracker.id, updateData);
      });

      await Promise.all(promises);
      
      await onSuccess();
      onOpenChange(false);
      
    } catch (error: any) {
      setError(error.message || "Failed to assign reviewers");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (user.first_name?.toLowerCase().includes(term)) ||
      (user.last_name?.toLowerCase().includes(term)) ||
      user.email.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term)
    );
  });

  const allSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedReviewers.has(u.id));

  if (selectedTrackers.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              Assign Reviewers
            </DialogTitle>
          </DialogHeader>
          
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Selected</h3>
              <p className="text-gray-600 mb-4">Please select interventions to assign reviewers.</p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Go Back</Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-600" />
            Assign Reviewers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
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

          {/* Selected Trackers */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Selected Items ({selectedTrackers.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedTrackers.map((tracker) => (
                  <div key={tracker.id} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="font-medium">
                      {tracker.proposal.intervention_name || `#${tracker.proposal.id}`}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{tracker.proposal.name} - {tracker.proposal.organization}</span>
                      {tracker.thematic_area && (
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            borderColor: tracker.thematic_area.color_code,
                            color: tracker.thematic_area.color_code 
                          }}
                        >
                          {tracker.thematic_area.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviewer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Reviewers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Select All */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reviewers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm font-medium">
                      Select All ({filteredUsers.length})
                    </Label>
                  </div>
                  {selectedReviewers.size > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedReviewers.size} selected
                    </span>
                  )}
                </div>
              </div>

              {/* Reviewers List */}
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 ${
                        selectedReviewers.has(user.id) ? 'bg-purple-50 border border-purple-200' : ''
                      }`}
                    >
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedReviewers.has(user.id)}
                        onCheckedChange={(checked) => handleReviewerToggle(user.id, checked as boolean)}
                      />
                      
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {(user.first_name?.[0] || user.username[0] || 'U').toUpperCase()}
                          {(user.last_name?.[0] || user.username[1] || '').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : user.username
                          }
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No reviewers found</p>
                  </div>
                )}
              </div>

              {/* Assignment Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Assignment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Priority Level */}
                    <div className="space-y-2">
                      <Label htmlFor="priority-select">Priority Level *</Label>
                      <Select value={priorityLevel} onValueChange={setPriorityLevel}>
                        <SelectTrigger id="priority-select">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                              Low Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                              Medium Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                              High Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="urgent">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                              Urgent
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Completion Date */}
                    <div className="space-y-2">
                      <Label htmlFor="completion-date">Expected Completion</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="completion-date"
                          type="date"
                          value={completionDate}
                          onChange={(e) => setCompletionDate(e.target.value)}
                          min={startDate}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {/* Duration Display */}
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-gray-50">
                        {startDate && completionDate ? (
                          <span className="text-sm text-gray-700">
                            {Math.ceil((new Date(completionDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Select dates</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {(priorityLevel || startDate || completionDate) && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Assignment Preview:</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline" className="bg-white">
                          Priority: {priorityLevel}
                        </Badge>
                        {startDate && (
                          <Badge variant="outline" className="bg-white">
                            Start: {new Date(startDate).toLocaleDateString()}
                          </Badge>
                        )}
                        {completionDate && (
                          <Badge variant="outline" className="bg-white">
                            Due: {new Date(completionDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="assignment-notes">Assignment Notes (Optional)</Label>
                <Textarea
                  id="assignment-notes"
                  placeholder="Add any notes for the reviewers..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedReviewers.size === 0 || loading}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign {selectedReviewers.size} Reviewer{selectedReviewers.size > 1 ? 's' : ''} to {selectedTrackers.length} Item{selectedTrackers.length > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}