// export enum ScoringLevel {
//   PANEL = 'panel',
//   APPRAISAL = 'appraisal',
// }

// export enum ScoringWindowStatus {
//   DISABLED = 'disabled',
//   SCHEDULED = 'scheduled',
//   OPEN = 'open',
//   GRACE = 'grace',
//   CLOSED = 'closed',
// }

// export interface InterventionRef {
//   id: string;
//   intervention_name?: string | null;
//   reference_number?: string | null;
// }

// export interface UserRef {
//   id: number;
//   username: string;
//   email?: string;
//   profile_image?: string | null;
// }

// export interface ScoringWindow {
//   id: string;
//   intervention: string | InterventionRef;
//   level: ScoringLevel;
//   starts_at: string;          // ISO datetime
//   ends_at: string;            // ISO datetime
//   submission_delay_minutes: number;
//   is_active: boolean;
//   notes?: string;

//   // Derived (read-only from API)
//   status: ScoringWindowStatus;
//   is_open: boolean;
//   effective_close_at: string;

//   created_by?: UserRef | null;
//   updated_by?: UserRef | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface CreateScoringWindowData {
//   intervention: string;
//   level: ScoringLevel;
//   starts_at: string;
//   ends_at: string;
//   submission_delay_minutes?: number;
//   is_active?: boolean;
//   notes?: string;
// }

// export type UpdateScoringWindowData = Partial<CreateScoringWindowData>;

// export interface APIResponse<T> {
//   success: boolean;
//   message: string;
//   data: T | null;
//   errors?: Record<string, string[]>;
// }

// export type ScoringWindowListResponse = APIResponse<ScoringWindow[]>;
// export type ScoringWindowResponse     = APIResponse<ScoringWindow>;

// export interface ScoringWindowFilters {
//   intervention?: string;
//   ref?: string;
//   level?: ScoringLevel;
// }