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
import type { Announcement, CreateAnnouncementData, UpdateAnnouncementData } from '@/types/dashboard/announcements';
import { createAnnouncement, deleteAnnouncement, getAnnouncements, updateAnnouncement, toggleAnnouncementPin } from '@/app/api/dashboard/announcements';
import AnnouncementsList from './list';


const INITIAL_FORM: CreateAnnouncementData = {
  title: "", content: "", type: "", priority: "", documents: undefined, images: undefined,
  link: "", is_public: true, is_pinned: false, expires_at: "", tags: ""
};

const AnnouncementsPage: React.FC = () => {
  // State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAnnouncementData>(INITIAL_FORM);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const isStaff = true;

  // Fetch data
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAnnouncements();
      setAnnouncements(response.results || []);
    } catch (err) {
      setError('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

const uniqueTypes = [...new Set(announcements.map(a => a.type).filter((type): type is string => Boolean(type)))];
const uniquePriorities = [...new Set(announcements.map(a => a.priority).filter((priority): priority is string => Boolean(priority)))];


  const filteredAnnouncements = announcements.filter(announcement => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      announcement.title.toLowerCase().includes(query) ||
      announcement.content.toLowerCase().includes(query) ||
      announcement.type?.toLowerCase().includes(query) ||
      announcement.priority?.toLowerCase().includes(query) ||
      announcement.reference_number.toLowerCase().includes(query) ||
      announcement.tags?.toLowerCase().includes(query);

    const matchesType = typeFilter === "all" || announcement.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || announcement.priority === priorityFilter;

    return matchesSearch && matchesType && matchesPriority;
  });

  // Handlers
  const handleCreate = async () => {
    try {
      setLoading(true);
      const newAnnouncement = await createAnnouncement(formData);
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setFormData(INITIAL_FORM);
      setIsCreateOpen(false);
    } catch (err) {
      setError('Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type || "",
      priority: announcement.priority || "",
      link: announcement.link || "",
      is_public: announcement.is_public,
      is_pinned: announcement.is_pinned,
      expires_at: announcement.expires_at || "",
      tags: announcement.tags || "",
      documents: undefined,
      images: undefined
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedAnnouncement) return;
    try {
      setLoading(true);
      const updated = await updateAnnouncement({ id: selectedAnnouncement.id, ...formData });
      setAnnouncements(prev => prev.map(a => a.id === selectedAnnouncement.id ? updated : a));
      setIsEditOpen(false);
      setSelectedAnnouncement(null);
    } catch (err) {
      setError('Failed to update announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError('Failed to delete announcement');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const updated = await toggleAnnouncementPin(id);
      setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
    } catch (err) {
      setError('Failed to toggle pin');
    }
  };

  const handleView = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewOpen(true);
  };

  const updateFormData = (field: keyof CreateAnnouncementData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: 'documents' | 'images', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file || undefined }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setSelectedAnnouncement(null);
  };

  const formatDateTime = (date: string) => new Date(date).toLocaleString();

  return (
    <div className="lg:p-6 p-0 space-y-6">
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading announcements...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Announcements Management</h1>
          <p className="text-gray-600 mt-2">Manage internal updates and policy changes</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#27aae1] hover:bg-[#1e90c7]">
              <Plus className="h-4 w-4 mr-2" />Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={formData.title} onChange={(e) => updateFormData('title', e.target.value)} />
              </div>
              
              <div>
                <Label>Content *</Label>
                <Textarea value={formData.content} onChange={(e) => updateFormData('content', e.target.value)} rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Input value={formData.type} onChange={(e) => updateFormData('type', e.target.value)} placeholder="policy, urgent, news" />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Input value={formData.priority} onChange={(e) => updateFormData('priority', e.target.value)} placeholder="low, high, urgent" />
                </div>
              </div>
              
              <div>
                <Label>Tags</Label>
                <Input value={formData.tags} onChange={(e) => updateFormData('tags', e.target.value)} placeholder="Comma-separated tags" />
              </div>

              <div>
                <Label>Expiry Date</Label>
                <Input type="datetime-local" value={formData.expires_at} onChange={(e) => updateFormData('expires_at', e.target.value)} />
              </div>
              
              <div>
                <Label>Link</Label>
                <Input type="url" value={formData.link} onChange={(e) => updateFormData('link', e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Document</Label>
                  <Input type="file" onChange={(e) => handleFileChange('documents', e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>Image</Label>
                  <Input type="file" accept="image/*" onChange={(e) => handleFileChange('images', e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.is_public} onCheckedChange={(checked) => updateFormData('is_public', checked)} />
                  <Label>Public announcement</Label>
                </div>
                {isStaff && (
                  <div className="flex items-center space-x-2">
                    <Switch checked={formData.is_pinned} onCheckedChange={(checked) => updateFormData('is_pinned', checked)} />
                    <Label>Pin announcement</Label>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!formData.title || !formData.content}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search announcements..."
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
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {uniquePriorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {!loading && (
        <AnnouncementsList 
          announcements={filteredAnnouncements}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTogglePin={isStaff ? handleTogglePin : undefined}
          isStaff={isStaff}
        />
      )}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedAnnouncement.title}</h3>
                <div className="flex gap-2 mt-2">
                  {selectedAnnouncement.type && <span className="px-2 py-1 bg-gray-100 rounded text-xs">{selectedAnnouncement.type}</span>}
                  {selectedAnnouncement.priority && <span className="px-2 py-1 bg-orange-100 rounded text-xs">{selectedAnnouncement.priority}</span>}
                  <span className="px-2 py-1 bg-blue-100 rounded text-xs">{selectedAnnouncement.is_public ? 'Public' : 'Private'}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Content</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="whitespace-pre-wrap">{selectedAnnouncement.content}</p>
                </div>
              </div>

              {selectedAnnouncement.tags && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex gap-2">
                    {selectedAnnouncement.tags.split(',').map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 rounded text-xs">{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <div className="space-y-1 text-sm">
                    <div>Created by: {selectedAnnouncement.created_by_name}</div>
                    <div>Created: {formatDateTime(selectedAnnouncement.created_at)}</div>
                    {selectedAnnouncement.expires_at && (
                      <div>Expires: {formatDateTime(selectedAnnouncement.expires_at)}</div>
                    )}
                  </div>
                </div>

                {(selectedAnnouncement.documents || selectedAnnouncement.images || selectedAnnouncement.link) && (
                  <div>
                    <h4 className="font-medium mb-2">Attachments</h4>
                    <div className="space-y-2 text-sm">
                      {selectedAnnouncement.documents && (
                        <a href={selectedAnnouncement.documents} target="_blank" className="text-blue-600 hover:underline block">
                          📄 Document
                        </a>
                      )}
                      {selectedAnnouncement.images && (
                        <a href={selectedAnnouncement.images} target="_blank" className="text-blue-600 hover:underline block">
                          🖼️ Image
                        </a>
                      )}
                      {selectedAnnouncement.link && (
                        <a href={selectedAnnouncement.link} target="_blank" className="text-blue-600 hover:underline block">
                          🔗 External Link
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => updateFormData('title', e.target.value)} />
            </div>
            
            <div>
              <Label>Content *</Label>
              <Textarea value={formData.content} onChange={(e) => updateFormData('content', e.target.value)} rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Input value={formData.type} onChange={(e) => updateFormData('type', e.target.value)} />
              </div>
              <div>
                <Label>Priority</Label>
                <Input value={formData.priority} onChange={(e) => updateFormData('priority', e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <Input value={formData.tags} onChange={(e) => updateFormData('tags', e.target.value)} />
            </div>

            <div>
              <Label>Expiry Date</Label>
              <Input type="datetime-local" value={formData.expires_at} onChange={(e) => updateFormData('expires_at', e.target.value)} />
            </div>
            
            <div>
              <Label>Link</Label>
              <Input type="url" value={formData.link} onChange={(e) => updateFormData('link', e.target.value)} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch checked={formData.is_public} onCheckedChange={(checked) => updateFormData('is_public', checked)} />
                <Label>Public announcement</Label>
              </div>
              {isStaff && (
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.is_pinned} onCheckedChange={(checked) => updateFormData('is_pinned', checked)} />
                  <Label>Pin announcement</Label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={!formData.title || !formData.content}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementsPage;