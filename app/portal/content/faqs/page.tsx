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
import type { FAQ, CreateFAQData, UpdateFAQData } from '@/types/dashboard/content';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '@/app/api/dashboard/content';
import FAQsList from './list';

const INITIAL_FORM: CreateFAQData = {
  question: "",
  answer: "",
  published: false,
  order: 0
};

const FAQsPage: React.FC = () => {
  // State
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formData, setFormData] = useState<CreateFAQData>(INITIAL_FORM);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

  // Fetch data
  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await getFAQs();
      setFaqs(response.results || []);
    } catch (err) {
      setError('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const query = searchQuery.toLowerCase();
    return !query || 
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query);
  });

  // Handlers
  const handleCreate = async () => {
    try {
      setLoading(true);
      const newFAQ = await createFAQ(formData);
      setFaqs(prev => [newFAQ, ...prev]);
      setFormData(INITIAL_FORM);
      setIsCreateOpen(false);
    } catch (err) {
      setError('Failed to create FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      published: faq.published,
      order: faq.order
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedFAQ) return;
    try {
      setLoading(true);
      const updated = await updateFAQ(selectedFAQ.id, formData);
      setFaqs(prev => prev.map(f => f.id === selectedFAQ.id ? updated : f));
      setIsEditOpen(false);
      setSelectedFAQ(null);
    } catch (err) {
      setError('Failed to update FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFAQ(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError('Failed to delete FAQ');
    }
  };

  const handleView = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setIsViewOpen(true);
  };

  const updateFormData = (field: keyof CreateFAQData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setSelectedFAQ(null);
  };

  return (
    <div className="lg:p-6 p-0 space-y-6">
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading FAQs...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">FAQs Management</h1>
          <p className="text-gray-600 mt-2">Manage frequently asked questions</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#27aae1] hover:bg-[#1e90c7]">
              <Plus className="h-4 w-4 mr-2" />Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New FAQ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Question *</Label>
                <Input 
                  value={formData.question} 
                  onChange={(e) => updateFormData('question', e.target.value)} 
                  placeholder="Enter the question"
                />
              </div>
              
              <div>
                <Label>Answer *</Label>
                <Textarea 
                  value={formData.answer} 
                  onChange={(e) => updateFormData('answer', e.target.value)} 
                  rows={6}
                  placeholder="Enter the answer"
                />
              </div>

              <div>
                <Label>Display Order</Label>
                <Input 
                  type="number"
                  value={formData.order} 
                  onChange={(e) => updateFormData('order', parseInt(e.target.value) || 0)} 
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData.published} 
                  onCheckedChange={(checked) => updateFormData('published', checked)} 
                />
                <Label>Publish FAQ</Label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={!formData.question || !formData.answer}
                >
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search FAQs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {!loading && (
        <FAQsList 
          faqs={filteredFAQs}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>FAQ Details</DialogTitle>
          </DialogHeader>
          {selectedFAQ && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Question</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-lg font-semibold">{selectedFAQ.question}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Answer</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="whitespace-pre-wrap">{selectedFAQ.answer}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium">
                    {selectedFAQ.published ? 'Published' : 'Draft'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Order:</span>
                  <p className="font-medium">{selectedFAQ.order}</p>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>
                  <p className="font-medium">
                    {new Date(selectedFAQ.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question *</Label>
              <Input 
                value={formData.question} 
                onChange={(e) => updateFormData('question', e.target.value)} 
              />
            </div>
            
            <div>
              <Label>Answer *</Label>
              <Textarea 
                value={formData.answer} 
                onChange={(e) => updateFormData('answer', e.target.value)} 
                rows={6}
              />
            </div>

            <div>
              <Label>Display Order</Label>
              <Input 
                type="number"
                value={formData.order} 
                onChange={(e) => updateFormData('order', parseInt(e.target.value) || 0)} 
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={formData.published} 
                onCheckedChange={(checked) => updateFormData('published', checked)} 
              />
              <Label>Publish FAQ</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={!formData.question || !formData.answer}
              >
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

export default FAQsPage;