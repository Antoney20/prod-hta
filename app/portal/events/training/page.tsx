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
import { Event, CreateEventData, UpdateEventData } from '@/types/dashboard/event';
import { createEvent, getTrainingEvents, updateEvent, deleteEvent } from '@/app/api/dashboard/events';
import EventList from '../list';

const initialFormData: CreateEventData = {
  title: '',
  description: '',
  event_type: 'training',
  start_date: '',
  end_date: '',
  location: '',
  link: ''
};

const TrainingSessionsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>(initialFormData);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrainingEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch training sessions');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleCreateEvent = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const newEvent = await createEvent(formData);
      setEvents(prev => [newEvent, ...prev]);
      setFormData(initialFormData);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError('Failed to create training session');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: Event): void => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type || 'training',
      start_date: event.start_date,
      end_date: event.end_date || '',
      location: event.location || '',
      link: event.link || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEvent = async (): Promise<void> => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      setError(null);
      const updateData: UpdateEventData = {
        id: selectedEvent.id,
        ...formData
      };
      const updatedEvent = await updateEvent(updateData);
      
      setEvents(prev => 
        prev.map(event => 
          event.id === selectedEvent.id ? updatedEvent : event
        )
      );
      
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      setError('Failed to update training session');
      console.error('Error updating event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this training session?')) return;

    try {
      setLoading(true);
      setError(null);
      await deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      setError('Failed to delete training session');
      console.error('Error deleting event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = (event: Event): void => {
    setSelectedEvent(event);
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

  const handleFormDataChange = (field: keyof CreateEventData, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedEvent(null);
  };

  return (
    <div className="lg:p-6 p-0 space-y-6">
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-gray-600">Loading training sessions...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Sessions</h1>
          <p className="text-gray-600 mt-2">
            All training and workshop events
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#27aae1] hover:bg-[#1e90c7] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Training
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Training Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFormDataChange('title', e.target.value)}
                  placeholder="Enter training title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormDataChange('description', e.target.value)}
                  placeholder="Enter training description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date & Time *</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => handleFormDataChange('start_date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date & Time</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => handleFormDataChange('end_date', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleFormDataChange('location', e.target.value)}
                  placeholder="Enter training location"
                />
              </div>
              
              <div>
                <Label htmlFor="link">Meeting Link</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleFormDataChange('link', e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
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
                  onClick={handleCreateEvent} 
                  className="bg-[#27aae1] hover:bg-[#1e90c7]"
                  disabled={loading || !formData.title || !formData.start_date}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Training
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
              placeholder="Search training sessions by title, description, or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-white">
        {!loading && (
          <EventList 
            events={filteredEvents}
            onView={handleViewEvent}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            loading={loading}
          />
        )}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Training Session Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Training
                </span>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Start Date:</span>
                  <p>{formatDate(selectedEvent.start_date)}</p>
                </div>
                {selectedEvent.end_date && (
                  <div>
                    <span className="font-medium">End Date:</span>
                    <p>{formatDate(selectedEvent.end_date)}</p>
                  </div>
                )}
              </div>

              {selectedEvent.location && (
                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <p className="text-gray-700">{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.link && (
                <div>
                  <h4 className="font-medium mb-2">Meeting Link</h4>
                  <a 
                    href={selectedEvent.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#27aae1] hover:underline"
                  >
                    {selectedEvent.link}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Training Session</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-start_date">Start Date & Time *</Label>
                <Input
                  id="edit-start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleFormDataChange('start_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-end_date">End Date & Time</Label>
                <Input
                  id="edit-end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleFormDataChange('end_date', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => handleFormDataChange('location', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-link">Meeting Link</Label>
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
                onClick={handleUpdateEvent} 
                className="bg-[#27aae1] hover:bg-[#1e90c7]"
                disabled={loading || !formData.title || !formData.start_date}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Training
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingSessionsPage;