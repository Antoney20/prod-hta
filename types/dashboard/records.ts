export interface Record {
  id: string;
  title: string;
  type?: string;
  description?: string;
  documents?: string;
  images?: string;
  link?: string;
  created_by: string;
  created_at: string;
    reference_number: string;
       created_by_name: string;
}

export interface CreateRecordData {
  title: string;
  type?: string;
  description?: string;
  documents?: File;
  images?: File;
  link?: string;
}

export interface UpdateRecordData extends Partial<CreateRecordData> {
  id: string;
}

export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

