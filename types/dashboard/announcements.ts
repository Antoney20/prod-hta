export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string | null;
  priority: string | null;
  documents: string | null;
  images: string | null;
  link: string | null;
  is_public: boolean;
  is_pinned: boolean;
  expires_at: string | null;
  reference_number: string;
  tags: string | null;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  is_expired: boolean;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  type: string;
  priority: string;
  documents?: File;
  images?: File;
  link: string;
  is_public: boolean;
  is_pinned: boolean;
  expires_at: string;
  tags: string;
}

export interface UpdateAnnouncementData extends CreateAnnouncementData {
  id: string;
}

export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AnnouncementFilters {
  search?: string;
  type?: string;
  priority?: string;
  is_public?: boolean;
  is_pinned?: boolean;
  include_expired?: boolean;
}