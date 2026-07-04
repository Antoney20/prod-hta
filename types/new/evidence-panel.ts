export interface CriterionHeader {
  key: string;
  label: string;
  type?: "text" | "number" | "choice";
  options?: string[];
}

export interface Criterion {
  id: string;
  criteria: string;
  description: string;
  scoring_approach: string;
  score: number | null;
  headers: CriterionHeader[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CriterionEvidence {
  id: string;
  criterion: string;
  criterion_name?: string;
  intervention: string | null;
  national_proposal: string | null;
  target: string | null;
  data: Record<string, unknown>;
  score: number | null;
  created_at: string;
  updated_at: string;
}

export type CriterionInput = Partial <Pick<Criterion, "criteria" | "description" | "scoring_approach" |"score" | "headers" | "active">
>;

export type EvidenceInput = {
  criterion: string;
  intervention?: string | null;
  national_proposal?: string | null;
  data?: Record<string, unknown>;
  score?: number | null;
};

export interface BulkResult {
  created: number;
  updated: number;
  failed: { row: number; error: string }[];
}

export type Write<T> = { ok: boolean; data?: T; error?: string };