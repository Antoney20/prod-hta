import { 
  Resource, 
  CreateResourceData, 
  UpdateResourceData,
  APIResponse 
} from "@/types/dashboard/resources";
import api from "../../auth";

/**
 * Get all resources
 */
export const getResources = async (params?: {
  search?: string;
  type?: string;
  is_public?: boolean;
}): Promise<APIResponse<Resource>> => {
  try {
    const response = await api.get('/v2/proj/resources/', { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch resources');
  }
};

/**
 * Get only public resources
 */
export const getPublicResources = async (): Promise<Resource[]> => {
  try {
    const response = await api.get('/v2/proj/resources/public/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch public resources');
  }
};

/**
 * Get a specific resource by ID
 */
export const getResource = async (id: string): Promise<Resource> => {
  try {
    const response = await api.get(`/v2/proj/resources/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch resource');
  }
};

/**
 * Create a new resource
 */
export const createResource = async (data: CreateResourceData): Promise<Resource> => {
  try {
    const formData = new FormData();
    
    formData.append('title', data.title);
    if (data.type) formData.append('type', data.type);
    if (data.description) formData.append('description', data.description);
    if (data.link) formData.append('link', data.link);
    if (data.tags) formData.append('tags', data.tags);
    if (data.is_public !== undefined) formData.append('is_public', data.is_public.toString());
    if (data.complainant_name) formData.append('complainant_name', data.complainant_name);
    if (data.complainant_email) formData.append('complainant_email', data.complainant_email);
    if (data.resolution_notes) formData.append('resolution_notes', data.resolution_notes);
    if (data.documents) formData.append('documents', data.documents);
    if (data.images) formData.append('images', data.images);

    const response = await api.post('/v2/proj/resources/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create resource');
  }
};

/**
 * Update an existing resource
 */
export const updateResource = async (data: UpdateResourceData): Promise<Resource> => {
  try {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.type) formData.append('type', data.type);
    if (data.description) formData.append('description', data.description);
    if (data.link) formData.append('link', data.link);
    if (data.tags) formData.append('tags', data.tags);
    if (data.is_public !== undefined) formData.append('is_public', data.is_public.toString());
    if (data.complainant_name) formData.append('complainant_name', data.complainant_name);
    if (data.complainant_email) formData.append('complainant_email', data.complainant_email);
    if (data.resolution_notes) formData.append('resolution_notes', data.resolution_notes);
    if (data.documents) formData.append('documents', data.documents);
    if (data.images) formData.append('images', data.images);

    const response = await api.patch(`/v2/proj/resources/${data.id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update resource');
  }
};

/**
 * Delete a resource
 */
export const deleteResource = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v2/proj/resources/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete resource');
  }
};

/**
 * Get resources by type
 */
export const getResourcesByType = async (type: string): Promise<APIResponse<Resource>> => {
  try {
    const response = await api.get('/v2/proj/resources/', {
      params: { type }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch resources by type');
  }
};

/**
 * Search resources
 */
export const searchResources = async (query: string): Promise<APIResponse<Resource>> => {
  try {
    const response = await api.get('/v2/proj/resources/', {
      params: { search: query }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to search resources');
  }
};