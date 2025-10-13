import { 
  FAQ,
  CreateFAQData,
  UpdateFAQData,
  FAQFilters,
  News,
  CreateNewsData,
  UpdateNewsData,
  NewsFilters,
  Governance,
  CreateGovernanceData,
  UpdateGovernanceData,
  GovernanceFilters,
  MediaResource,
  CreateMediaResourceData,
  UpdateMediaResourceData,
  MediaResourceFilters,
  APIResponse
} from "@/types/dashboard/content";
import api from "../../auth";

// ==================== FAQ APIs ====================

/**
 * Get all FAQs
 */
export const getFAQs = async (params?: FAQFilters): Promise<APIResponse<FAQ>> => {
  try {
    const response = await api.get('/v1/faqs/', { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch FAQs');
  }
};

/**
 * Get single FAQ by ID
 */
export const getFAQ = async (id: number): Promise<FAQ> => {
  try {
    const response = await api.get(`/v1/faqs/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch FAQ');
  }
};

/**
 * Create new FAQ
 */
export const createFAQ = async (data: CreateFAQData): Promise<FAQ> => {
  try {
    const response = await api.post('/v1/faqs/', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create FAQ');
  }
};

/**
 * Update FAQ
 */
export const updateFAQ = async (id: number, data: UpdateFAQData): Promise<FAQ> => {
  try {
    const response = await api.patch(`/v1/faqs/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update FAQ');
  }
};

/**
 * Delete FAQ
 */
export const deleteFAQ = async (id: number): Promise<void> => {
  try {
    await api.delete(`/v1/faqs/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete FAQ');
  }
};

// ==================== News APIs ====================

/**
 * Get all news articles
 */
export const getNews = async (params?: NewsFilters): Promise<APIResponse<News>> => {
  try {
    const response = await api.get('/v1/news/', { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch news articles');
  }
};

/**
 * Get single news article by ID
 */
export const getNewsArticle = async (id: number): Promise<News> => {
  try {
    const response = await api.get(`/v1/news/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch news article');
  }
};

/**
 * Create new news article
 */
export const createNews = async (data: CreateNewsData): Promise<News> => {
  try {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await api.post('/v1/news/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create news article');
  }
};

/**
 * Update news article
 */
export const updateNews = async (id: number, data: UpdateNewsData): Promise<News> => {
  try {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await api.patch(`/v1/news/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update news article');
  }
};

/**
 * Delete news article
 */
export const deleteNews = async (id: number): Promise<void> => {
  try {
    await api.delete(`/v1/news/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete news article');
  }
};

// ==================== Governance APIs ====================

/**
 * Get all governance members
 */
export const getGovernanceMembers = async (params?: GovernanceFilters): Promise<APIResponse<Governance>> => {
  try {
    const response = await api.get('/v1/governance/', { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch governance members');
  }
};

/**
 * Get single governance member by ID
 */
export const getGovernanceMember = async (id: number): Promise<Governance> => {
  try {
    const response = await api.get(`/v1/governance/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch governance member');
  }
};

/**
 * Create new governance member
 */
export const createGovernanceMember = async (data: CreateGovernanceData): Promise<Governance> => {
  try {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await api.post('/v1/governance/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create governance member');
  }
};

/**
 * Update governance member
 */
export const updateGovernanceMember = async (id: number, data: UpdateGovernanceData): Promise<Governance> => {
  try {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await api.patch(`/v1/governance/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update governance member');
  }
};

/**
 * Delete governance member
 */
export const deleteGovernanceMember = async (id: number): Promise<void> => {
  try {
    await api.delete(`/v1/governance/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete governance member');
  }
};

// ==================== Media Resource APIs ====================

/**
 * Get all media resources
 */
export const getMediaResources = async (params?: MediaResourceFilters): Promise<APIResponse<MediaResource>> => {
  try {
    const response = await api.get('/v1/media-resources/', { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch media resources');
  }
};

/**
 * Get single media resource by ID
 */
export const getMediaResource = async (id: number): Promise<MediaResource> => {
  try {
    const response = await api.get(`/v1/media-resources/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch media resource');
  }
};

/**
 * Create new media resource
 */
export const createMediaResource = async (data: CreateMediaResourceData): Promise<MediaResource> => {
  try {
    const response = await api.post('/v1/media-resources/', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create media resource');
  }
};

/**
 * Update media resource
 */
export const updateMediaResource = async (id: number, data: UpdateMediaResourceData): Promise<MediaResource> => {
  try {
    const response = await api.patch(`/v1/media-resources/${id}/`, data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to update media resource');
  }
};

/**
 * Delete media resource
 */
export const deleteMediaResource = async (id: number): Promise<void> => {
  try {
    await api.delete(`/v1/media-resources/${id}/`);
  } catch (error) {
    throw new Error('Failed to delete media resource');
  }
};