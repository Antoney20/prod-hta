export interface InterventionProposal {
  id: number;
  documents: ProposalDocument[];
  name: string;
  phone: string;
  email: string;
  profession: string;
  organization: string;
  county: string;
  intervention_name: string | null;
  intervention_type: string | null;
  beneficiary: string;
  justification: string;
  expected_impact: string | null;
  additional_info: string | null;
  signature: string;
  date: string;
  ip_address: string;
  user_agent: string;
  submitted_at: string;
  is_public: boolean;
  user: number | null;
}

export interface ProposalDocument {
  id: number;
  file: string;
  uploaded_at: string;
  file_size: number;
  file_type: string;
  proposal: number;
}

export interface ProposalTracker {
  id: string;
  proposal: InterventionProposal;
  review_stage: 'initial' | 'under_review' | 'needs_revision' | 'approved' | 'rejected' | 'withdrawn';
  thematic_area: ThematicArea | null;
  priority_level: 'low' | 'medium' | 'high' | 'urgent' | null;
  implementation_status: 'not_started' | 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled' | null;
  assigned_reviewers: CustomUser[];
  start_date: string | null;
  completion_date: string | null;
  progress: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ThematicArea {
  id: number;
  name: string;
  description: string | null;
  color_code: string;
  is_active: boolean;
  created_at: string;
}

export interface CustomUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface ReviewerAssignment {
  id: number;
  tracker: ProposalTracker;
  reviewer: CustomUser;
  notes: string | null;
  assigned_at: string;
  assigned_by: CustomUser | null;
  progress: number | null;
  complete_date: string | null;
}

export interface ReviewComment {
  id: string;
  tracker: ProposalTracker;
  reviewer: CustomUser | null;
  comment_type: 'general' | 'revision' | 'approval' | 'rejection' | 'clarification';
  content: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}