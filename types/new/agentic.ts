import { UUID, ISODateString } from "./shared";

export interface AIProviderKey {
  id: UUID;
  provider: string;
  label: string;
  model_string: string;
  temperature: number;
  is_default: boolean;
  is_active: boolean;
  created_at: ISODateString;
}

export type AIProviderKeyPayload = {
  provider: string;
  label?: string;
  key: string;
  model_string: string;
  temperature?: number;
  is_default?: boolean;
  is_active?: boolean;
};

export type AIProviderKeyUpdate = Partial<Omit<AIProviderKeyPayload, "key">> & {
  key?: string;
};
export interface AIModel {
  id: UUID;
  name: string;
  provider: string;
  model_string: string;
  is_default: boolean;
  is_active: boolean;
  temperature: number;
  max_tokens: number;
  created_at: ISODateString;
}

export type AIModelPayload = Omit<AIModel, "id" | "created_at">;

export interface AppraisalScore {
  id: UUID;
  criterion: UUID;
  criterion_name: string;
  ok: boolean;
  score: number | null;
  reasoning: string | null;
  failure_reason: string | null;
  created_at: ISODateString;
}

export interface AppraisalRun {
  id: UUID;
  parsed_ok: boolean;
  error: string;
  duration_ms: number | null;
  created_at: ISODateString;
}

export interface PanelAppraisal {
  id: UUID;
  target_type: "intervention" | "national_proposal";
  target_name: string;
  reference_number: string | null;
  intervention: UUID | null;
  national_proposal: UUID | null;
  success: boolean;
  total_score: number;
  rank: number | null;
  created_at: ISODateString;
}

export interface PanelAppraisalDetail extends PanelAppraisal {
  scores: AppraisalScore[];
  runs: AppraisalRun[];
}


export interface GenerateScore {
  criterion: string;
  ok: boolean;
  score: number | null;
  reasoning: string | null;
  failure_reason: string | null;
}

export interface GenerateResult {
  success: boolean;
  appraisal_id?: string;
  target_type: "intervention" | "national_proposal";
  target_id: string;
  total_score?: number;
  model?: string;
  provider?: string;
  duration_ms?: number;
  scores: GenerateScore[];
  error?: string;
  error_code?: "config_error" | "connection_error" | "processing_error";
}

export interface BatchGenerateResult {
  results: GenerateResult[];
  count: number;
}


export interface ConsistencyRow {
  criterion: string;
  runs_scored: number;
  distinct_scores: number[];
  min: number;
  max: number;
  stable: boolean;
}

export interface TestRunsResult {
  target_type: "intervention" | "national_proposal";
  target_id: string;
  runs: number;
  results: GenerateResult[];
  consistency: ConsistencyRow[];
}

export type TargetType = "intervention" | "national_proposal";