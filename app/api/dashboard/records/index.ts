
import { APIResponse, CreateRecordData, UpdateRecordData, Record } from "@/types/dashboard/records";
import api from "../../auth";




/**
 * Get all records
 */
export const getRecords = async (params?: {
  search?: string;
  type?: string;
}): Promise<APIResponse<Record>> => {
  try {
    const response = await api.get('/v2/proj/records/', { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch records');
  }
};

/**
 * Get a specific record by ID
 */
export const getRecord = async (id: string): Promise<Record> => {
  try {
    const response = await api.get(`/v2/proj/records/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch record');
  }
};

/**
 * Create a new record
 */
export const createRecord = async (data: CreateRecordData): Promise<Record> => {
  try {
    const formData = new FormData();
    
    formData.append('title', data.title);
    if (data.type) formData.append('type', data.type);
    if (data.description) formData.append('description', data.description);
    if (data.link) formData.append('link', data.link);
    if (data.documents) formData.append('documents', data.documents);
    if (data.images) formData.append('images', data.images);

    const response = await api.post('/v2/proj/records/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create record');
  }
};

/**
 * Update an existing record
 */
export const updateRecord = async (data: UpdateRecordData): Promise<Record> => {
  try {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.type) formData.append('type', data.type);
    if (data.description) formData.append('description', data.description);
    if (data.link) formData.append('link', data.link);
    if (data.documents) formData.append('documents', data.documents);
    if (data.images) formData.append('images', data.images);

    const response = await api.patch(`/v2/proj/records/${data.id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update record');
  }
};

/**
 * Delete a record
 */
export const deleteRecord = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v2/proj/records/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete record');
  }
};
