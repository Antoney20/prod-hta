"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
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
import type { Record, CreateRecordData, UpdateRecordData } from '@/types/dashboard/records';
import { createRecord, getRecords, updateRecord } from '@/app/api/dashboard/records';
import RecordsList from '../list';


const initialFormData: CreateRecordData = {
  title: '',
  type: 'minutes',
  description: '',
  link: '',
  documents: undefined,
  images: undefined
};

const OfficialMinutessPage: React.FC = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateRecordData>(initialFormData);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRecords();
      const filtered = (response.results || []).filter(
        (r: Record) => r.type === 'minutes'
      );
      setRecords(filtered);
    } catch (err) {
      setError('Failed to fetch  Minutess');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        record.title.toLowerCase().includes(query) ||
        record.description?.toLowerCase().includes(query) ||
        record.reference_number?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleCreateRecord = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const newRecord = await createRecord(formData);
      setRecords(prev => [newRecord, ...prev]);
      setFormData(initialFormData);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError('Failed to create official Minutes');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (record: Record): void => {
    setSelectedRecord(record);
    setFormData({
      title: record.title,
      type: record.type || 'minutes',
      description: record.description || "",
      link: record.link || "",
      documents: undefined,
      images: undefined
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRecord = async (): Promise<void> => {
    if (!selectedRecord) return;

    try {
      setLoading(true);
      setError(null);
      const updateData: UpdateRecordData = {
        id: selectedRecord.id,
        ...formData
      };
      const updatedRecord = await updateRecord(updateData);
      
      setRecords(prev => 
        prev.map(record => 
          record.id === selectedRecord.id ? updatedRecord : record
        )
      );
      
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
    } catch (err) {
      setError('Failed to update official Minutes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (record: Record): void => {
    setSelectedRecord(record);
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

  const handleFormDataChange = (field: keyof CreateRecordData, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: 'documents' | 'images', file: File | null): void => {
    setFormData(prev => ({ ...prev, [field]: file || undefined }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedRecord(null);
  };

  return (
    <div className="lg:p-6 p-0 space-y-6">
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-gray-600">Loading  Minutess...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Official Minutess</h1>
          <p className="text-gray-600 mt-2">
            Manage official Minutess, circulars, memos, and notices
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#27aae1] hover:bg-[#1e90c7] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Minutes
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Official Minutes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFormDataChange('title', e.target.value)}
                  placeholder="Enter Minutes title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormDataChange('description', e.target.value)}
                  placeholder="Enter Minutes description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="link">Link</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleFormDataChange('link', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documents">Documents</Label>
                  <Input
                    id="documents"
                    type="file"
                    onChange={(e) => handleFileChange('documents', e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </div>
                
                <div>
                  <Label htmlFor="images">Images</Label>
                  <Input
                    id="images"
                    type="file"
                    onChange={(e) => handleFileChange('images', e.target.files?.[0] || null)}
                    accept="image/*"
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
                  onClick={handleCreateRecord} 
                  className="bg-[#27aae1] hover:bg-[#1e90c7]"
                  disabled={loading || !formData.title}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Minutes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Minutess by title, description, or reference number..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-white">
        {!loading && (
          <RecordsList 
            records={filteredRecords}
            onView={handleViewRecord}
            onEdit={handleEditRecord}
            onDelete={() => {}}
            loading={loading}
          />
        )}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Minutes Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedRecord.title}</h3>
                {selectedRecord.reference_number && (
                  <span className="text-sm text-gray-500 font-mono mt-2 block">
                    {selectedRecord.reference_number}
                  </span>
                )}
              </div>
              
              {selectedRecord.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{selectedRecord.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created by:</span>
                  <p>{selectedRecord.created_by_name || selectedRecord.created_by}</p>
                </div>
                <div>
                  <span className="font-medium">Created at:</span>
                  <p>{formatDate(selectedRecord.created_at)}</p>
                </div>
              </div>

              {(selectedRecord.documents || selectedRecord.images || selectedRecord.link) && (
                <div>
                  <h4 className="font-medium mb-2">Attachments & Links</h4>
                  <div className="space-y-2">
                    {selectedRecord.documents && (
                      <div>
                        <a href={selectedRecord.documents} target="_blank" rel="noopener noreferrer" className="text-[#27aae1] hover:underline">
                          View Document
                        </a>
                      </div>
                    )}
                    {selectedRecord.images && (
                      <div>
                        <a href={selectedRecord.images} target="_blank" rel="noopener noreferrer" className="text-[#27aae1] hover:underline">
                          View Image
                        </a>
                      </div>
                    )}
                    {selectedRecord.link && (
                      <div>
                        <a href={selectedRecord.link} target="_blank" rel="noopener noreferrer" className="text-[#27aae1] hover:underline">
                          {selectedRecord.link}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Minutes</DialogTitle>
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
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleFormDataChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-link">Link</Label>
              <Input
                id="edit-link"
                type="url"
                value={formData.link}
                onChange={(e) => handleFormDataChange('link', e.target.value)}
              />
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
                onClick={handleUpdateRecord} 
                className="bg-[#27aae1] hover:bg-[#1e90c7]"
                disabled={loading || !formData.title}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Minutes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficialMinutessPage;