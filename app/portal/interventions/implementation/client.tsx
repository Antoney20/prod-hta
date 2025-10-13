"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  AlertCircle,
  Calendar,
  FileText,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getImplementations,
  createImplementation,
  updateImplementation,
  deleteImplementation,
  getImplementationStatistics,
  markImplementationComplete
} from '@/app/api/dashboard/implementation';
import { getDecisionRationales } from '@/app/api/dashboard/decision-rationale';
import type { ImplementationTracking, CreateImplementationData, UpdateImplementationData } from '@/types/dashboard/implementation';
import type { DecisionRationale } from '@/types/dashboard/decision';

export default function ImplementationClient() {
  const router = useRouter();
  const [implementations, setImplementations] = useState<ImplementationTracking[]>([]);
  const [approvedDecisions, setApprovedDecisions] = useState<DecisionRationale[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, in_progress: 0, overdue: 0, average_progress: 0, completion_rate: 0 });
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedImpl, setSelectedImpl] = useState<ImplementationTracking | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [implResponse, statsData, decisionsResponse] = await Promise.all([
        getImplementations(),
        getImplementationStatistics(),
        getDecisionRationales({ decision: 'approved' })
      ]);
      
      setImplementations(implResponse.results || []);
      setStats(statsData);
      setApprovedDecisions(decisionsResponse.results || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = implementations.filter(impl => {
    const matchesSearch = searchTerm === '' || 
      impl.proposal_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      impl.intervention_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      impl.county.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'completed' && impl.is_completed) ||
      (statusFilter === 'in_progress' && !impl.is_completed && !impl.is_overdue) ||
      (statusFilter === 'overdue' && impl.is_overdue && !impl.is_completed);
    
    return matchesSearch && matchesStatus;
  });

  // Check if a decision already has an implementation
  const isDecisionImplemented = (decisionId: number): boolean => {
    return implementations.some(impl => impl.decision_rationale === decisionId);
  };

  // Get available decisions (those without implementations)
  const availableDecisions = approvedDecisions.filter(
    decision => !isDecisionImplemented(decision.id)
  );

  const openCreateForm = () => {
    if (availableDecisions.length === 0) {
      toast.warning('All approved decisions already have implementation records');
      return;
    }
    setEditMode(false);
    setFormData({ decision_rationale_id: 0, progress_percentage: 0 });
    setFormOpen(true);
  };

  const openEditForm = (impl: ImplementationTracking) => {
    setEditMode(true);
    setSelectedImpl(impl);
    setFormData({
      implementation_start_date: impl.implementation_start_date,
      expected_completion_date: impl.expected_completion_date,
      progress_percentage: impl.progress_percentage,
      current_status: impl.current_status,
      key_activities_completed: impl.key_activities_completed,
      implementation_notes: impl.implementation_notes
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (editMode && selectedImpl) {
        await updateImplementation(selectedImpl.id, formData as UpdateImplementationData);
        toast.success('Implementation updated successfully');
      } else {
        // Validate before creating
        if (!formData.decision_rationale_id || formData.decision_rationale_id === 0) {
          toast.error('Please select a decision rationale');
          setSubmitting(false);
          return;
        }

        // Check if implementation already exists
        if (isDecisionImplemented(formData.decision_rationale_id)) {
          toast.error('Implementation already exists for this decision');
          setSubmitting(false);
          return;
        }

        await createImplementation(formData as CreateImplementationData);
        toast.success('Implementation created successfully');
      }
      
      setFormOpen(false);
      setFormData({});
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this implementation?')) return;
    
    try {
      await deleteImplementation(id);
      toast.success('Implementation deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleMarkComplete = async (impl: ImplementationTracking) => {
    const remarks = prompt('Enter completion remarks:');
    if (!remarks) return;
    
    try {
      await markImplementationComplete(impl.id, { completion_remarks: remarks });
      toast.success('Marked as complete');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark as complete');
    }
  };

  const getStatusBadge = (impl: ImplementationTracking) => {
    if (impl.is_completed) {
      return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
    }
    if (impl.is_overdue) {
      return <Badge className="bg-red-100 text-red-700">Overdue</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Implementation Tracking</h1>
          <p className="text-sm text-gray-600 mt-1">{implementations.length} active implementations</p>
        </div>
        <Button onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Implementation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{stats.in_progress}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.average_progress.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by reference, name, county..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intervention</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">County</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No implementations found</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((impl) => (
                    <tr key={impl.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{impl.proposal_reference}</td>
                      <td className="px-4 py-3 font-medium">{impl.intervention_name || 'N/A'}</td>
                      <td className="px-4 py-3">{impl.county}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <Progress value={impl.progress_percentage} className="h-2" />
                          <span className="text-xs text-gray-600">{impl.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(impl)}</td>
                      <td className="px-4 py-3">
                        {impl.expected_completion_date ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {new Date(impl.expected_completion_date).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedImpl(impl); setViewOpen(true); }}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditForm(impl)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          {!impl.is_completed && (
                            <Button size="sm" variant="outline" onClick={() => handleMarkComplete(impl)} className="text-green-600">
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleDelete(impl.id)} className="text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit' : 'Create'} Implementation</DialogTitle>
            <DialogDescription>
              {editMode ? 'Update implementation tracking details' : 'Create a new implementation tracking record'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!editMode && (
              <div className="space-y-2">
                <Label>Decision Rationale *</Label>
                {availableDecisions.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      All approved decisions already have implementation records.
                    </p>
                  </div>
                ) : (
                  <Select value={formData.decision_rationale_id?.toString()} onValueChange={(v) => setFormData({ ...formData, decision_rationale_id: Number(v) })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-w-2xl">
                      <div className="sticky top-0 bg-white px-2 pb-2 pt-1 z-10">
                        <Input
                          placeholder="Search by reference or intervention name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      {availableDecisions
                        .filter(d => 
                          !searchTerm || 
                          d.proposal_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.intervention_name?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((decision) => (
                          <SelectItem key={decision.id} value={decision.id.toString()} className="cursor-pointer">
                            <div className="flex flex-col py-1">
                              <span className="font-mono text-xs text-blue-600">{decision.proposal_reference}</span>
                              <span className="text-sm font-medium">{decision.intervention_name || 'No intervention name'}</span>
                            </div>
                          </SelectItem>
                        ))}
                      {availableDecisions.filter(d => 
                        !searchTerm || 
                        d.proposal_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.intervention_name?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center py-6 text-sm text-gray-500">
                          No decisions found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formData.implementation_start_date || ''} onChange={(e) => setFormData({ ...formData, implementation_start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Expected Completion</Label>
                <Input type="date" value={formData.expected_completion_date || ''} onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Progress (%)</Label>
              <Input type="number" min="0" max="100" value={formData.progress_percentage || 0} onChange={(e) => setFormData({ ...formData, progress_percentage: Number(e.target.value) })} />
            </div>

            <div className="space-y-2">
              <Label>Current Status</Label>
              <Textarea value={formData.current_status || ''} onChange={(e) => setFormData({ ...formData, current_status: e.target.value })} placeholder="Brief status description..." rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Key Activities Completed</Label>
              <Textarea value={formData.key_activities_completed || ''} onChange={(e) => setFormData({ ...formData, key_activities_completed: e.target.value })} placeholder="List of completed activities..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Implementation Notes</Label>
              <Textarea value={formData.implementation_notes || ''} onChange={(e) => setFormData({ ...formData, implementation_notes: e.target.value })} placeholder="Additional notes..." rows={3} />
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || (!editMode && availableDecisions.length === 0)} className="bg-blue-600 hover:bg-blue-700">
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Implementation Details</DialogTitle>
          </DialogHeader>

          {selectedImpl && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Reference</p>
                  <p className="font-medium">{selectedImpl.proposal_reference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">County</p>
                  <p className="font-medium">{selectedImpl.county}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedImpl.progress_percentage} className="flex-1" />
                    <span className="font-medium">{selectedImpl.progress_percentage}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {getStatusBadge(selectedImpl)}
                </div>
              </div>

              {selectedImpl.current_status && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Status</p>
                  <p className="text-sm">{selectedImpl.current_status}</p>
                </div>
              )}

              {selectedImpl.key_activities_completed && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Key Activities Completed</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedImpl.key_activities_completed}</p>
                </div>
              )}

              {selectedImpl.implementation_notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedImpl.implementation_notes}</p>
                </div>
              )}

              {selectedImpl.is_completed && selectedImpl.completion_remarks && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Completion Remarks</p>
                  <p className="text-sm">{selectedImpl.completion_remarks}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}