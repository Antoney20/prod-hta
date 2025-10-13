
import { APIResponse, Event, CreateEventData, UpdateEventData } from "@/types/dashboard/event";
import api from "../../auth";

/**
 * Get all events
 */
export const getEvents = async (params?: {
  search?: string;
  event_type?: string;
}): Promise<APIResponse<Event>> => {
  try {
    const response = await api.get('/v2/proj/events/', { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch events');
  }
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (): Promise<Event[]> => {
  try {
    const response = await api.get('/v2/proj/events/upcoming/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch upcoming events');
  }
};

/**
 * Get past events
 */
export const getPastEvents = async (): Promise<Event[]> => {
  try {
    const response = await api.get('/v2/proj/events/past/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch past events');
  }
};

/**
 * Get training events
 */
export const getTrainingEvents = async (): Promise<Event[]> => {
  try {
    const response = await api.get('/v2/proj/events/training/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch training events');
  }
};

/**
 * Get a specific event by ID
 */
export const getEvent = async (id: string): Promise<Event> => {
  try {
    const response = await api.get(`/v2/proj/events/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch event');
  }
};

/**
 * Create a new event
 */
export const createEvent = async (data: CreateEventData): Promise<Event> => {
  try {
    const response = await api.post('/v2/proj/events/', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create event');
  }
};

/**
 * Update an existing event
 */
export const updateEvent = async (data: UpdateEventData): Promise<Event> => {
  try {
    const { id, ...updateData } = data;
    const response = await api.patch(`/v2/proj/events/${id}/`, updateData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update event');
  }
};

/**
 * Delete an event
 */
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v2/proj/events/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete event');
  }
};