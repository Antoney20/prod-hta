export enum ReviewStage {
  INITIAL = 'initial',
  UNDER_REVIEW = 'under_review',
  NEEDS_REVISION = 'needs_revision',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export enum ImplementationStatus {
  NOT_STARTED = 'not_started',
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Base interfaces
export interface ThematicArea {
  id: number;
  name: string;
  description?: string;
  color_code: string;
  is_active: boolean;
  created_at: string;
}

export interface Document {
  document: string;
  original_name: string;
  is_public: boolean;
}

export interface InterventionProposal {
  id: number;
  name: string;
  phone: string;
  email: string;
  profession: string;
  organization: string;
  county: string;
  intervention_name?: string;
  intervention_type?: string;
  beneficiary: string;
  justification: string;
  expected_impact?: string;
  additional_info?: string;
  reference_number?: string;
  signature: string;
  date: string;
  submitted_at: string;
  is_public: boolean;
  documents: Document[];
}

export interface UserType {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string;
}

export interface Comment {
  id: number;
  content: string;
  reviewer: UserType | null;
  created_at: string;
  updated_at: string;
  comment_type ?: string;
}

export interface ProposalTracker {
  id: string; // UUID
  proposal: InterventionProposal;
  review_stage: ReviewStage;
  thematic_area?: ThematicArea;
  priority_level?: PriorityLevel;
  implementation_status?: ImplementationStatus;
  assigned_reviewers: UserType[];
  start_date?: string;
  completion_date?: string;
  progress: number; // 0-100
  notes: string;
  created_at: string;
  updated_at: string;
  comments: Comment[];
}

// Assignment-related interfaces
export interface ReviewerAssignment {
  id: string;
  tracker: string; // UUID of the tracker
  tracker_id: string; // Same as tracker, for clarity
  reviewer: UserType;
  reviewer_id: number;
  assigned_by: UserType;
  assigned_by_id: number;
  assigned_at: string; // Matches your backend field name
  complete_date?: string;
  notes?: string;
  progress: number; // Individual reviewer progress
}

// For when we need the full tracker data with assignment info
export interface ReviewerAssignmentWithTracker {
  id: string;
  tracker: ProposalTracker; // Full tracker object
  reviewer: UserType;
  assigned_by: UserType;
  assigned_at: string;
  complete_date?: string;
  notes?: string;
  progress: number;
}

// Extended ProposalTracker for assignments (if needed for special cases)
export interface AssignedProposalTracker extends ProposalTracker {
  // Assignment-specific fields
  assignment_id: string;
  assignment_progress: number;
  assignment_notes?: string;
  assigned_at: string;
  complete_date?: string;
  assigned_by: UserType;
  reviewer: UserType;
}

// API Response wrapper type
export interface APIResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results: T[];
}

// For API calls - main responses
export type ProposalTrackersResponse = APIResponse<ProposalTracker>;
export type ReviewerAssignmentsResponse = APIResponse<ReviewerAssignment>;
export type ReviewerAssignmentsWithTrackersResponse = APIResponse<ReviewerAssignmentWithTracker>;

// API Response for assignments (using the correct type)
export interface AssignmentsAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReviewerAssignment[];
}

// API Response for assignments with full tracker data
export interface AssignmentsWithTrackersAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReviewerAssignmentWithTracker[];
}

// Utility types for forms/updates
export interface CreateProposalTracker {
  proposal_id: number;
  review_stage?: ReviewStage;
  thematic_area_id?: number;
  priority_level?: PriorityLevel;
  implementation_status?: ImplementationStatus;
  start_date?: string;
  completion_date?: string;
  progress?: number;
  notes?: string;
}

export interface UpdateProposalTracker {
  review_stage?: ReviewStage;
  thematic_area_id?: number;
  priority_level?: PriorityLevel;
  implementation_status?: ImplementationStatus;
  start_date?: string;
  completion_date?: string;
  progress?: number;
  notes?: string;
}

export interface ProposalTrackerFilters {
  review_stage?: ReviewStage;
  thematic_area?: number;
  priority_level?: PriorityLevel;
  implementation_status?: ImplementationStatus;
  assigned_reviewer?: number;
  county?: string;
  organization?: string;
  date_from?: string;
  date_to?: string;
}


