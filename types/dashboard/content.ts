// FAQ Types
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  order: number;
}

export interface CreateFAQData {
  question: string;
  answer: string;
  published?: boolean;
  order?: number;
}

export interface UpdateFAQData extends Partial<CreateFAQData> {}

export interface FAQFilters {
  published?: boolean;
  search?: string;
  ordering?: string;
}

// News Types
export interface News {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  author_role: string;
  featured: boolean;
  published: boolean;
  date: string;
  category: string;
  image: string | null;
  tags: string;
  tags_list: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateNewsData {
  title: string;
  excerpt?: string;
  content?: string;
  author?: string;
  author_role?: string;
  featured?: boolean;
  published?: boolean;
  date?: string;
  category?: string;
  image?: File | null;
  tags?: string;
}

export interface UpdateNewsData extends Partial<CreateNewsData> {}

export interface NewsFilters {
  published?: boolean;
  featured?: boolean;
  category?: string;
  search?: string;
  ordering?: string;
}

// Governance Types
export interface Governance {
  id: number;
  name: string;
  image: string | null;
  title: string;
  role: string;
  from_organization: string;
  description: string;
  is_secretariat: boolean;
  is_panel_member: boolean;
  hide_profile: boolean;
  deactivate_user: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGovernanceData {
  name: string;
  image?: File | null;
  title?: string;
  role?: string;
  from_organization?: string;
  description?: string;
  is_secretariat?: boolean;
  is_panel_member?: boolean;
  hide_profile?: boolean;
  deactivate_user?: boolean;
}

export interface UpdateGovernanceData extends Partial<CreateGovernanceData> {}

export interface GovernanceFilters {
  is_secretariat?: boolean;
  is_panel_member?: boolean;
  hide_profile?: boolean;
  deactivate_user?: boolean;
  search?: string;
  ordering?: string;
}

// Media Resource Types
export interface MediaResource {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  featured: boolean;
  hide_resource: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMediaResourceData {
  title: string;
  description?: string;
  category?: string;
  type?: string;
  url?: string;
  featured?: boolean;
  hide_resource?: boolean;
  date?: string;
}

export interface UpdateMediaResourceData extends Partial<CreateMediaResourceData> {}

export interface MediaResourceFilters {
  category?: string;
  type?: string;
  featured?: boolean;
  hide_resource?: boolean;
  search?: string;
  ordering?: string;
}

// Generic API Response
export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}