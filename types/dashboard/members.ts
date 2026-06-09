
export interface Member {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  profile_image: string | null;
  phone_number: string | null;
  notes: string | null;
  organization: string;
  role: "admin" | "secretariat" | "user" | "swg" | "content_manager" | "panel" | "assessment";
  assessment_group: boolean;
  assessment_group_name: string | null;
}

export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MembersApiError {
  message: string;
  status?: number;
}
