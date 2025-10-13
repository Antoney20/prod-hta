export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  link: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_upcoming: boolean;
  is_past: boolean;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_type?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  link?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}