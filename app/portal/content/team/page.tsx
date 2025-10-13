"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Governance, CreateGovernanceData } from '@/types/dashboard/content';
import { getGovernanceMembers, createGovernanceMember, updateGovernanceMember, deleteGovernanceMember } from '@/app/api/dashboard/content';
import GovernanceList from './list';

const INITIAL_FORM: CreateGovernanceData = {
  name: "",
  title: "",
  role: "",
  from_organization: "",
  description: "",
  is_secretariat: false,
  is_panel_member: false,
  hide_profile: false,
  deactivate_user: false,
  image: null
};

const GovernancePage: React.FC = () => {
  // State
  const [members, setMembers] = useState<Governance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formData, setFormData] = useState<CreateGovernanceData>(INITIAL_FORM);
  const [selectedMember, setSelectedMember] = useState<Governance | null>(null);

  // Fetch data
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getGovernanceMembers();
      setMembers(response.results || []);
    } catch (err) {
      setError('Failed to fetch governance members');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      member.name.toLowerCase().includes(query) ||
      member.role?.toLowerCase().includes(query) ||
      member.from_organization?.toLowerCase().includes(query) ||
      member.title?.toLowerCase().includes(query);

    const matchesType = typeFilter === "all" || 
      (typeFilter === "secretariat" && member.is_secretariat) ||
      (typeFilter === "panel" && member.is_panel_member);

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && !member.deactivate_user && !member.hide_profile) ||
      (statusFilter === "hidden" && member.hide_profile) ||
      (statusFilter === "inactive" && member.deactivate_user);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handlers
  const handleCreate = async () => {
    try {
      setLoading(true);
      const newMember = await createGovernanceMember(formData);
      setMembers(prev => [newMember, ...prev]);
      setFormData(INITIAL_FORM);
      setIsCreateOpen(false);
    } catch (err) {
      setError('Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: Governance) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      title: member.title || "",
      role: member.role || "",
      from_organization: member.from_organization || "",
      description: member.description || "",
      is_secretariat: member.is_secretariat,
      is_panel_member: member.is_panel_member,
      hide_profile: member.hide_profile,
      deactivate_user: member.deactivate_user,
      image: null
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedMember) return;
    try {
      setLoading(true);
      const updated = await updateGovernanceMember(selectedMember.id, formData);
      setMembers(prev => prev.map(m => m.id === selectedMember.id ? updated : m));
      setIsEditOpen(false);
      setSelectedMember(null);
    } catch (err) {
      setError('Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteGovernanceMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError('Failed to delete member');
    }
  };

  const handleView = (member: Governance) => {
    setSelectedMember(member);
    setIsViewOpen(true);
  };

  const updateFormData = (field: keyof CreateGovernanceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, image: file }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setSelectedMember(null);
  };

  const renderFormContent = (isEdit = false) => (
    <div className="space-y-4">
      <div>
        <Label>Name *</Label>
        <Input 
          value={formData.name} 
          onChange={(e) => updateFormData('name', e.target.value)} 
          placeholder="Enter full name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input 
            value={formData.title} 
            onChange={(e) => updateFormData('title', e.target.value)} 
            placeholder="e.g., Prof., Dr., "
          />
        </div>
        <div>
          <Label>Role</Label>
          <Input 
            value={formData.role} 
            onChange={(e) => updateFormData('role', e.target.value)} 
            placeholder="e.g., Chairperson, Member"
          />
        </div>
      </div>
      
      <div>
        <Label>Organization</Label>
        <Input 
          value={formData.from_organization} 
          onChange={(e) => updateFormData('from_organization', e.target.value)} 
          placeholder="Organization name"
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => updateFormData('description', e.target.value)} 
          rows={4}
          placeholder="Brief description or bio"
        />
      </div>

      <div>
        <Label>Profile Image</Label>
        <Input 
          type="file" 
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)} 
        />
        {isEdit && selectedMember?.image && (
          <p className="text-xs text-gray-500 mt-1">
            Current image: {selectedMember.image}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={formData.is_secretariat} 
            onCheckedChange={(checked) => updateFormData('is_secretariat', checked)} 
          />
          <Label>Secretariat member</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            checked={formData.is_panel_member} 
            onCheckedChange={(checked) => updateFormData('is_panel_member', checked)} 
          />
          <Label>Panel member</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            checked={formData.hide_profile} 
            onCheckedChange={(checked) => updateFormData('hide_profile', checked)} 
          />
          <Label>Hide profile</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            checked={formData.deactivate_user} 
            onCheckedChange={(checked) => updateFormData('deactivate_user', checked)} 
          />
          <Label>Deactivate user</Label>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => { 
          isEdit ? setIsEditOpen(false) : setIsCreateOpen(false); 
          resetForm(); 
        }}>
          Cancel
        </Button>
        <Button 
          onClick={isEdit ? handleUpdate : handleCreate} 
          disabled={!formData.name || loading}
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="lg:p-6 p-0 space-y-6">
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading governance members...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Governance Management</h1>
          <p className="text-gray-600 mt-2">Manage governance members and profiles</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#27aae1] hover:bg-[#1e90c7]">
              <Plus className="h-4 w-4 mr-2" />Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Member</DialogTitle>
            </DialogHeader>
            {renderFormContent(false)}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="secretariat">Secretariat</SelectItem>
                <SelectItem value="panel">Panel</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {!loading && (
        <GovernanceList 
          members={filteredMembers}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              {selectedMember.image && (
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedMember.image} 
                      alt={selectedMember.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold">
                  {selectedMember.title && `${selectedMember.title} `}
                  {selectedMember.name}
                </h3>
                {selectedMember.role && (
                  <p className="text-lg text-gray-600 mt-1">{selectedMember.role}</p>
                )}
                {selectedMember.from_organization && (
                  <p className="text-sm text-gray-500 mt-1">{selectedMember.from_organization}</p>
                )}
              </div>

              <div className="flex gap-2 justify-center flex-wrap">
                {selectedMember.is_secretariat && (
                  <span className="px-3 py-1 bg-purple-100 rounded text-sm">Secretariat</span>
                )}
                {selectedMember.is_panel_member && (
                  <span className="px-3 py-1 bg-blue-100 rounded text-sm">Panel Member</span>
                )}
                {selectedMember.deactivate_user ? (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm">Inactive</span>
                ) : selectedMember.hide_profile ? (
                  <span className="px-3 py-1 bg-gray-100 rounded text-sm">Hidden</span>
                ) : (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>
                )}
              </div>

              {selectedMember.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="whitespace-pre-wrap">{selectedMember.description}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <p className="font-medium">
                    {new Date(selectedMember.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>
                  <p className="font-medium">
                    {new Date(selectedMember.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          {renderFormContent(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GovernancePage;