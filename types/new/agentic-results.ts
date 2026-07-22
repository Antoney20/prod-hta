export type TargetType = "intervention" | "national_proposal";

export interface ScoreNote {
  body: string;
}

export interface AppraisalScoreResult {
  id: string;
  criterion_id: string;
  criterion: string;
  ok: boolean;
  score: number | null;            
  final_score: number | null;      
  effective_score: number | null;  
  verified: boolean;
  edited: boolean;
  reasoning: string | null;       
  notes: string | null;          
  failure_reason: string | null;
}

export interface AppraisalResult {
  id: string;
  success: boolean;
  rank: number | null;
    selected: boolean;              
  final_comments: string | null;
  created_at: string;
  created_by: string | null;
  scores: AppraisalScoreResult[];
}

export interface AgenticResultRow {
  target_type: TargetType;
  target_id: string;
  name: string;
  reference_number: string | null;
  package: string | null;
  phase: string | null;
  appraisal_count: number;         
  latest_appraisal_id: string;
  appraisals: AppraisalResult[];
}


export interface EditScorePayload {
  final_score?: number | null;
  verified?: boolean;
  notes?: string | null;
}

export interface BulkDeletePayload {
  score_ids?: string[];
  appraisal_ids?: string[];
}

export interface BulkDeleteReport {
  requested: number;
  deleted: number;
  missing: string[];
}

export interface BulkDeleteResult {
  scores: BulkDeleteReport | null;
  appraisals: BulkDeleteReport | null;
}

export interface WriteResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface SelectResult {
  id: string;
  selected: boolean;
  final_comments: string | null;
}

export interface BulkSelectResult {
  count: number;
  ids: string[];
}