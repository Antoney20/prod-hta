"use client";

import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, ExternalLink, Clock, Edit, Trash2, MoreVertical, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Event, CreateEventData, UpdateEventData } from '@/types/dashboard/event';
import { createEvent, getEvents, updateEvent, deleteEvent } from '@/app/api/dashboard/events';
import { Badge } from '@/components/ui/badge';

const initialFormData: CreateEventData = {
  title: '',
  description: '',
  event_type: '',
  start_date: '',
  end_date: '',
  location: '',
  link: ''
};

const eventTypeOptions = [
  { value: 'meeting', label: 'Meeting', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'training', label: 'Training', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'workshop', label: 'Workshop', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'conference', label: 'Conference', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { value: 'seminar', label: 'Seminar', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200' }
];

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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
      const response = await getEvents();
      setEvents(response.results || []);
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const groupEventsByDate = () => {
    const grouped: { [key: string]: Event[] } = {};
    
    events.forEach(event => {
      const date = new Date(event.start_date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    
    return grouped;
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.start_date) >= now)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 5);
  };

  const handleCreateEvent = async (): Promise<void> => {
    try {
      setLoading(true);
      const newEvent = await createEvent(formData);
      setEvents(prev => [newEvent, ...prev]);
      setFormData(initialFormData);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: Event): void => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type || '',
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
      setError('Failed to update event');
    } finally {
      setLoading(false);
    }
  };


  const handleViewEvent = (event: Event): void => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventTypeColor = (type: string) => {
    return eventTypeOptions.find(opt => opt.value === type)?.color || 'bg-gray-100 text-gray-700';
  };

  const groupedEvents = groupEventsByDate();
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events Calendar</h1>
            <p className="text-gray-600 mt-1">Manage your schedule and upcoming events</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#27aae1] hover:bg-[#1e8bb8] text-white shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select 
                    value={formData.event_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter event description"
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
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date & Time</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter event location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="link">Meeting Link</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setFormData(initialFormData);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateEvent} 
                    className="bg-[#27aae1] hover:bg-[#1e8bb8]"
                    disabled={!formData.title || !formData.start_date}
                  >
                    Create Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{monthName}</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousMonth}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="h-8 px-3 text-sm"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextMonth}
                  className="h-8 w-8 p-0 rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Weekday Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Calendar Days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === date.toDateString();

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square rounded-xl p-2 transition-all duration-200 relative
                      ${isToday ? 'bg-[#27aae1] text-white font-semibold' : 'hover:bg-gray-50'}
                      ${isSelected && !isToday ? 'ring-2 ring-[#27aae1] bg-blue-50' : ''}
                      ${dayEvents.length > 0 && !isToday ? 'font-medium' : ''}
                    `}
                  >
                    <div className="text-sm">{day}</div>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                        {dayEvents.slice(0, 3).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-[#27aae1]'}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No upcoming events</p>
                ) : (
                  upcomingEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => handleViewEvent(event)}
                      className="p-3 rounded-xl border border-gray-100 hover:border-[#27aae1] hover:bg-blue-50/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#27aae1]">
                          {event.title}
                        </h4>
                        {event.event_type && (
                          <Badge className={`text-xs ${getEventTypeColor(event.event_type)} border`}>
                            {event.event_type}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(event.start_date)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Event Type Legend */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Event Types</h3>
              <div className="space-y-2">
                {eventTypeOptions.map(type => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${type.color}`} />
                    <span className="text-sm text-gray-600">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Events by Day View */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <div className="space-y-3">
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No events scheduled for this day</p>
              ) : (
                getEventsForDate(selectedDate).map(event => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-[#27aae1] hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-base font-semibold text-gray-900">{event.title}</h4>
                          {event.event_type && (
                            <Badge className={`text-xs ${getEventTypeColor(event.event_type)} border`}>
                              {event.event_type}
                            </Badge>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                        )}

                        <div className="space-y-1.5">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {formatTime(event.start_date)}
                            {event.end_date && ` - ${formatTime(event.end_date)}`}
                          </div>

                          {event.location && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {event.location}
                            </div>
                          )}

                          {event.link && (
                            <a
                              href={event.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-[#27aae1] hover:text-[#1e8bb8]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Join meeting
                            </a>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewEvent(event)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                         
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* View Event Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                  {selectedEvent.event_type && (
                    <Badge className={`mt-2 ${getEventTypeColor(selectedEvent.event_type)} border`}>
                      {selectedEvent.event_type}
                    </Badge>
                  )}
                </div>
                
                {selectedEvent.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-700">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Start:</span>
                    {formatDate(selectedEvent.start_date)}
                  </div>
                  {selectedEvent.end_date && (
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium mr-2">End:</span>
                      {formatDate(selectedEvent.end_date)}
                    </div>
                  )}
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.link && (
                  <div>
                    <h4 className="font-medium mb-2">Meeting Link</h4>
                    <a 
                      href={selectedEvent.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#27aae1] hover:underline flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {selectedEvent.link}
                    </a>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-event_type">Event Type</Label>
                <Select 
                  value={formData.event_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end_date">End Date & Time</Label>
                  <Input
                    id="edit-end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-link">Meeting Link</Label>
                <Input
                  id="edit-link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setFormData(initialFormData);
                    setSelectedEvent(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateEvent} 
                  className="bg-[#27aae1] hover:bg-[#1e8bb8]"
                  disabled={!formData.title || !formData.start_date}
                >
                  Update Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EventsPage;