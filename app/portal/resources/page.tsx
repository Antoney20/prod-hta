"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { 
  Resource, 
  CreateResourceData, 
  UpdateResourceData 
} from '@/types/dashboard/resources';
import { createResource, deleteResource, getResources, updateResource } from '@/app/api/dashboard/resources';
import ResourcesList from './list';

const initialFormData: CreateResourceData = {
  title: "",
  type: "",
  description: "",
  link: "",
  is_public: true,
  complainant_name: "",
  complainant_email: "",
  resolution_notes: "",
  documents: undefined,
  images: undefined,
  tags: ""
};

const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  
  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateResourceData>(initialFormData);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Fetch resources once on mount
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources();
      setResources(response.results || []);
    } catch (err) {
      setError('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  // Get unique types for filtering
  const uniqueTypes = [...new Set(
    resources
      .map(r => r.type)
      .filter((type): type is string => Boolean(type))
  )];

  // Client-side filtering
  const filteredResources = resources.filter(resource => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        resource.title.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.type?.toLowerCase().includes(query) ||
        resource.reference_number.toLowerCase().includes(query) ||
        resource.tags?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Type filter
    if (typeFilter !== "all" && resource.type !== typeFilter) {
      return false;
    }

    // Visibility filter
    if (visibilityFilter !== "all") {
      const isPublic = visibilityFilter === "public";
      if (resource.is_public !== isPublic) return false;
    }

    return true;
  });

  const handleCreateResource = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const newResource = await createResource(formData);
      setResources(prev => [newResource, ...prev]);
      setFormData(initialFormData);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError('Failed to create resource');
      console.error('Error creating resource:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditResource = (resource: Resource): void => {
    setSelectedResource(resource);
    setFormData({
      title: resource.title,
      type: resource.type || "",
      description: resource.description || "",
      link: resource.link || "",
      is_public: resource.is_public,
      complainant_name: resource.complainant_name || "",
      complainant_email: resource.complainant_email || "",
      resolution_notes: resource.resolution_notes || "",
      documents: undefined,
      images: undefined,
      tags: resource.tags || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateResource = async (): Promise<void> => {
    if (!selectedResource) return;

    try {
      setLoading(true);
      setError(null);
      const updateData: UpdateResourceData = {
        id: selectedResource.id,
        ...formData
      };
      const updatedResource = await updateResource(updateData);
      
      setResources(prev => 
        prev.map(resource => 
          resource.id === selectedResource.id ? updatedResource : resource
        )
      );
      
      setIsEditDialogOpen(false);
      setSelectedResource(null);
    } catch (err) {
      setError('Failed to update resource');
      console.error('Error updating resource:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteResource(resourceId);
      setResources(prev => prev.filter(r => r.id !== resourceId));
    } catch (err) {
      setError('Failed to delete resource');
      console.error('Error deleting resource:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResource = (resource: Resource): void => {
    setSelectedResource(resource);
    setIsViewDialogOpen(true);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFormDataChange = (field: keyof CreateResourceData, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: 'documents' | 'images', file: File | null): void => {
    setFormData(prev => ({ ...prev, [field]: file || undefined }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedResource(null);
  };

  return (
    <div className="lg:p-6 p-0 space-y-6">
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-gray-600">Loading resources...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources Management</h1>
          <p className="text-gray-600 mt-2">
            Manage SHA guidelines, templates, policies, SOPs, and grievances
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#27aae1] hover:bg-[#1e90c7] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFormDataChange('title', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  placeholder="e.g., guideline, template, policy, grievance"
                  value={formData.type}
                  onChange={(e) => handleFormDataChange('type', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormDataChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Enter tags separated by commas (e.g., urgent, policy, staff)"
                  value={formData.tags}
                  onChange={(e) => handleFormDataChange('tags', e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">Separate multiple tags with commas</p>
              </div>
              
              <div>
                <Label htmlFor="link">External Link</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://"
                  value={formData.link}
                  onChange={(e) => handleFormDataChange('link', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documents">Documents</Label>
                  <Input
                    id="documents"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => handleFileChange('documents', e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <Label htmlFor="images">Images</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('images', e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleFormDataChange('is_public', checked)}
                />
                <Label htmlFor="is_public">Make this resource public</Label>
              </div>
              
              {/* Additional fields */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 text-gray-900">Additional Information (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="complainant_name">Contact Name</Label>
                    <Input
                      id="complainant_name"
                      value={formData.complainant_name}
                      onChange={(e) => handleFormDataChange('complainant_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="complainant_email">Contact Email</Label>
                    <Input
                      id="complainant_email"
                      type="email"
                      value={formData.complainant_email}
                      onChange={(e) => handleFormDataChange('complainant_email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="resolution_notes">Resolution Notes</Label>
                  <Textarea
                    id="resolution_notes"
                    value={formData.resolution_notes}
                    onChange={(e) => handleFormDataChange('resolution_notes', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateResource} 
                  className="bg-[#27aae1] hover:bg-[#1e90c7]"
                  disabled={loading || !formData.title}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Resource
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search resources by title, type, description, tags, or reference number..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <div className="bg-white">
        {!loading && (
          <ResourcesList 
            resources={filteredResources}
            onView={handleViewResource}
            onEdit={handleEditResource}
            onDelete={handleDeleteResource}
            loading={loading}
          />
        )}
      </div>

      {/* View Resource Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resource Details</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedResource.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {selectedResource.type && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {selectedResource.type}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedResource.is_public ? "Public" : "Private"}
                  </span>
                  <span className="text-sm text-gray-500 font-mono">
                    {selectedResource.reference_number}
                  </span>
                </div>
              </div>
              
              {selectedResource.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{selectedResource.description}</p>
                </div>
              )}

              {selectedResource.tags && selectedResource.tags.trim() !== '' && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResource.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created by:</span>
                  <p>{selectedResource.created_by_name}</p>
                </div>
                <div>
                  <span className="font-medium">Created at:</span>
                  <p>{formatDate(selectedResource.created_at)}</p>
                </div>
              </div>

              {(selectedResource.documents || selectedResource.link) && (
                <div>
                  <h4 className="font-medium mb-2">Attachments & Links</h4>
                  <div className="space-y-2">
                    {selectedResource.documents && (
                      <div>
                        <span className="text-sm font-medium">Document: </span>
                        <a 
                          href={selectedResource.documents} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#27aae1] hover:underline text-sm"
                        >
                          {selectedResource.documents.split('/').pop() || 'View Document'}
                        </a>
                      </div>
                    )}
                    {selectedResource.link && (
                      <div>
                        <span className="text-sm font-medium">External Link: </span>
                        <a 
                          href={selectedResource.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#27aae1] hover:underline text-sm"
                        >
                          {selectedResource.link}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedResource.complainant_name || selectedResource.complainant_email) && (
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  {selectedResource.complainant_name && <p>Name: {selectedResource.complainant_name}</p>}
                  {selectedResource.complainant_email && <p>Email: {selectedResource.complainant_email}</p>}
                </div>
              )}

              {selectedResource.resolution_notes && (
                <div>
                  <h4 className="font-medium mb-2">Resolution Notes</h4>
                  <p className="text-gray-700">{selectedResource.resolution_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleFormDataChange('title', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Input
                id="edit-type"
                value={formData.type}
                onChange={(e) => handleFormDataChange('type', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleFormDataChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                placeholder="Enter tags separated by commas"
                value={formData.tags}
                onChange={(e) => handleFormDataChange('tags', e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">Separate multiple tags with commas</p>
            </div>
            <div>
              <Label htmlFor="edit-link">External Link</Label>
              <Input
                id="edit-link"
                type="url"
                value={formData.link}
                onChange={(e) => handleFormDataChange('link', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => handleFormDataChange('is_public', checked)}
              />
              <Label htmlFor="edit-is_public">Make this resource public</Label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateResource} 
                className="bg-[#27aae1] hover:bg-[#1e90c7]"
                disabled={loading || !formData.title}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Resource
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourcesPage;