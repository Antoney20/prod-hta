export interface Resource {
  id: string;
  title: string;
  type?: string;
  description?: string;
  documents?: string;
  images?: string;
  link?: string;
  is_public: boolean;
  complainant_name?: string;
  complainant_email?: string;
  reference_number: string;
  resolution_notes?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  tags?: string;
}

export interface CreateResourceData {
  title: string;
  type?: string;
  description?: string;
  documents?: File;
  images?: File;
  link?: string;
  is_public?: boolean;
  complainant_name?: string;
  complainant_email?: string;
  resolution_notes?: string;
  tags?: string;
}

export interface UpdateResourceData extends Partial<CreateResourceData> {
  id: string;
}

export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}