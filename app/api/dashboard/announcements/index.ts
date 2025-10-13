

import { 
  Announcement, 
  CreateAnnouncementData, 
  UpdateAnnouncementData,
  APIResponse,
  AnnouncementFilters
} from "@/types/dashboard/announcements";
import api from "../../auth";

/**
 * Get all announcements
 */
export const getAnnouncements = async (params?: AnnouncementFilters): Promise<APIResponse<Announcement>> => {
  try {
    const response = await api.get('/v2/proj/announcements/', { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch announcements');
  }
};

/**
 * Get only public announcements
 */
export const getPublicAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const response = await api.get('/v2/proj/announcements/public/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch public announcements');
  }
};

/**
 * Get pinned announcements
 */
export const getPinnedAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const response = await api.get('/v2/proj/announcements/pinned/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch pinned announcements');
  }
};

/**
 * Get a specific announcement by ID
 */
export const getAnnouncement = async (id: string): Promise<Announcement> => {
  try {
    const response = await api.get(`/v2/proj/announcements/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch announcement');
  }
};

/**
 * Create a new announcement
 */
export const createAnnouncement = async (data: CreateAnnouncementData): Promise<Announcement> => {
  try {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.type) formData.append('type', data.type);
    if (data.priority) formData.append('priority', data.priority);
    if (data.link) formData.append('link', data.link);
    if (data.tags) formData.append('tags', data.tags);
    if (data.expires_at) formData.append('expires_at', data.expires_at);
    if (data.is_public !== undefined) formData.append('is_public', data.is_public.toString());
    if (data.is_pinned !== undefined) formData.append('is_pinned', data.is_pinned.toString());
    if (data.documents) formData.append('documents', data.documents);
    if (data.images) formData.append('images', data.images);

    const response = await api.post('/v2/proj/announcements/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create announcement');
  }
};

/**
 * Update an existing announcement
 */
export const updateAnnouncement = async (data: UpdateAnnouncementData): Promise<Announcement> => {
  try {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.type) formData.append('type', data.type);
    if (data.priority) formData.append('priority', data.priority);
    if (data.link) formData.append('link', data.link);
    if (data.tags) formData.append('tags', data.tags);
    if (data.expires_at) formData.append('expires_at', data.expires_at);
    if (data.is_public !== undefined) formData.append('is_public', data.is_public.toString());
    if (data.is_pinned !== undefined) formData.append('is_pinned', data.is_pinned.toString());
    if (data.documents) formData.append('documents', data.documents);
    if (data.images) formData.append('images', data.images);

    const response = await api.patch(`/v2/proj/announcements/${data.id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update announcement');
  }
};

/**
 * Delete an announcement
 */
export const deleteAnnouncement = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v2/proj/announcements/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete announcement');
  }
};

/**
 * Toggle pin status of an announcement (staff only)
 */
export const toggleAnnouncementPin = async (id: string): Promise<Announcement> => {
  try {
    const response = await api.post(`/v2/proj/announcements/${id}/toggle_pin/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to toggle pin status');
  }
};

/**
 * Get announcements by type
 */
export const getAnnouncementsByType = async (type: string): Promise<APIResponse<Announcement>> => {
  try {
    const response = await api.get('/v2/proj/announcements/', {
      params: { type }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch announcements by type');
  }
};

/**
 * Get announcements by priority
 */
export const getAnnouncementsByPriority = async (priority: string): Promise<APIResponse<Announcement>> => {
  try {
    const response = await api.get('/v2/proj/announcements/', {
      params: { priority }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch announcements by priority');
  }
};

/**
 * Search announcements
 */
export const searchAnnouncements = async (query: string): Promise<APIResponse<Announcement>> => {
  try {
    const response = await api.get('/v2/proj/announcements/', {
      params: { search: query }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to search announcements');
  }
};