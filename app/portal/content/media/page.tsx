"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Video, FileText, Image as ImageIcon, Music, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MediaResource, CreateMediaResourceData } from '@/types/dashboard/content';
import { getMediaResources, createMediaResource, updateMediaResource, deleteMediaResource } from '@/app/api/dashboard/content';
import MediaResourcesList from './list';
import { FaFileAlt } from 'react-icons/fa';

const INITIAL_FORM: CreateMediaResourceData = {
  title: "",
  description: "",
  category: "general",
  type: "",
  url: "",
  featured: false,
  hide_resource: false,
  date: ""
};

const RESOURCE_CATEGORIES = [
  { value: 'general', label: 'General', icon: File },
  { value: 'education', label: 'Education', icon: FileText },
  { value: 'training', label: 'Training', icon: Video },
  { value: 'research', label: 'Research', icon: FileText },
  { value: 'policy', label: 'Policy', icon: FileText },
  { value: 'Reports', label: 'Reports', icon: FileText },
  { value: 'Tariffs', label: 'tariffs', icon: FaFileAlt},
  { value: 'Facilities', label: 'Facilities', icon: File },
  { value: 'Other', label: 'Other', icon: File },
  
];

const RESOURCE_TYPES = [
  { value: 'video', label: 'Video', icon: Video },
  { value: 'document', label: 'Document', icon: FileText },
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'image', label: 'Image', icon: ImageIcon },
  { value: 'audio', label: 'Audio', icon: Music },
  { value: 'other', label: 'Other', icon: File },
];

const MediaResourcesPage: React.FC = () => {
  // State
  const [resources, setResources] = useState<MediaResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formData, setFormData] = useState<CreateMediaResourceData>(INITIAL_FORM);
  const [selectedResource, setSelectedResource] = useState<MediaResource | null>(null);

  // Fetch data
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await getMediaResources();
      setResources(response.results || []);
    } catch (err) {
      setError('Failed to fetch media resources');
    } finally {
      setLoading(false);
    }
  };

  const uniqueCategories = [...new Set(resources.map(r => r.category).filter(Boolean))];
  const uniqueTypes = [...new Set(resources.map(r => r.type).filter((type): type is string => Boolean(type)))];

  const filteredResources = resources.filter(resource => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      resource.title.toLowerCase().includes(query) ||
      resource.description?.toLowerCase().includes(query) ||
      resource.category.toLowerCase().includes(query) ||
      resource.type?.toLowerCase().includes(query);

    const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter;
    const matchesType = typeFilter === "all" || resource.type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "visible" && !resource.hide_resource) ||
      (statusFilter === "hidden" && resource.hide_resource) ||
      (statusFilter === "featured" && resource.featured);

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Stats
  const stats = {
    total: resources.length,
    visible: resources.filter(r => !r.hide_resource).length,
    featured: resources.filter(r => r.featured).length,
    byCategory: Object.entries(
      resources.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1])
  };

  // Handlers
  const handleCreate = async () => {
    try {
      setLoading(true);
      const newResource = await createMediaResource(formData);
      setResources(prev => [newResource, ...prev]);
      setFormData(INITIAL_FORM);
      setIsCreateOpen(false);
    } catch (err) {
      setError('Failed to create resource');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource: MediaResource) => {
    setSelectedResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || "",
      category: resource.category || "general",
      type: resource.type || "",
      url: resource.url || "",
      featured: resource.featured,
      hide_resource: resource.hide_resource,
      date: resource.date || ""
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedResource) return;
    try {
      setLoading(true);
      const updated = await updateMediaResource(selectedResource.id, formData);
      setResources(prev => prev.map(r => r.id === selectedResource.id ? updated : r));
      setIsEditOpen(false);
      setSelectedResource(null);
    } catch (err) {
      setError('Failed to update resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMediaResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError('Failed to delete resource');
    }
  };

  const handleView = (resource: MediaResource) => {
    setSelectedResource(resource);
    setIsViewOpen(true);
  };

  const updateFormData = (field: keyof CreateMediaResourceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setSelectedResource(null);
  };

  const getResourceIcon = (type: string | undefined) => {
    const typeObj = RESOURCE_TYPES.find(t => t.value === type);
    const Icon = typeObj?.icon || File;
    return <Icon className="h-5 w-5" />;
  };

  const renderFormContent = (isEdit = false) => (
    <div className="space-y-4">
      <div>
        <Label>Title *</Label>
        <Input 
          value={formData.title} 
          onChange={(e) => updateFormData('title', e.target.value)} 
          placeholder="Enter resource title"
        />
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => updateFormData('description', e.target.value)} 
          rows={3}
          placeholder="Brief description of the resource"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category *</Label>
          <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {cat.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>URL *</Label>
        <Input 
          type="url"
          value={formData.url} 
          onChange={(e) => updateFormData('url', e.target.value)} 
          placeholder="https://example.com/resource"
        />
        <p className="text-xs text-gray-500 mt-1">
          Link to the external resource (YouTube, Google Drive, etc.)
        </p>
      </div>
      
      <div>
        <Label>Date / Period</Label>
        <Input 
          value={formData.date} 
          onChange={(e) => updateFormData('date', e.target.value)} 
          placeholder="e.g., January 2024, Q4 2023, Updated Monthly"
        />
        <p className="text-xs text-gray-500 mt-1">
          Can be a specific date, period, or update frequency
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={formData.featured} 
            onCheckedChange={(checked) => updateFormData('featured', checked)} 
          />
          <Label>Feature this resource</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            checked={formData.hide_resource} 
            onCheckedChange={(checked) => updateFormData('hide_resource', checked)} 
          />
          <Label>Hide resource</Label>
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
          disabled={!formData.title || !formData.url || loading}
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
          <span>Loading resources...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Media Resources</h1>
          <p className="text-gray-600 mt-2">Manage and organize your media content</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#27aae1] hover:bg-[#1e90c7]">
              <Plus className="h-4 w-4 mr-2" />Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Resource</DialogTitle>
            </DialogHeader>
            {renderFormContent(false)}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Resources</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <File className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Visible</p>
                <p className="text-2xl font-bold text-green-600">{stats.visible}</p>
              </div>
              <FileText className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-amber-600">{stats.featured}</p>
              </div>
              <Video className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Top Category</p>
              {stats.byCategory[0] && (
                <div>
                  <p className="text-lg font-bold capitalize">{stats.byCategory[0][0]}</p>
                  <p className="text-sm text-gray-500">{stats.byCategory[0][1]} items</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {!loading && (
        <MediaResourcesList 
          resources={filteredResources}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resource Details</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {getResourceIcon(selectedResource.type || undefined)}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedResource.title}</h3>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 rounded text-xs capitalize">
                      {selectedResource.category}
                    </span>
                    {selectedResource.type && (
                      <span className="px-2 py-1 bg-purple-100 rounded text-xs capitalize">
                        {selectedResource.type}
                      </span>
                    )}
                    {selectedResource.featured && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                        Featured
                      </span>
                    )}
                    {selectedResource.hide_resource ? (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">Hidden</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Visible</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedResource.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="whitespace-pre-wrap">{selectedResource.description}</p>
                  </div>
                </div>
              )}

              {selectedResource.url && (
                <div>
                  <h4 className="font-medium mb-2">Resource Link</h4>
                  <a 
                    href={selectedResource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all flex items-center gap-2"
                  >
                    {selectedResource.url}
                    <span className="text-xs bg-blue-100 px-2 py-1 rounded">Open ↗</span>
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date/Period:</span>
                  <p className="font-medium">{selectedResource.date || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <p className="font-medium">
                    {new Date(selectedResource.created_at).toLocaleDateString()}
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
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          {renderFormContent(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaResourcesPage;