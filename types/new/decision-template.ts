export interface Guide {
  label: string;
  description: string | null;
  link: string | null;
  file: string | null;
}

/** One uploaded evidence record within a criterion. A criterion may carry
 *  several — each is a separate submission kept whole, with its own scalar
 *  data. Records are never merged across each other, so no field ever becomes
 *  a parallel `[a, b]` value list. */
export interface EvidenceRecord {
  evidence_id: string;
  score: number | null;
  created_at: string | null;
  evidence: Record<string, unknown>;
}

export interface EvidenceCriterion {
  id: string;
  criterion: string;
  type: string;
  target_fields: string[];
  /** One entry per uploaded record, in upload order. Each carries that
   *  record's own scalar values — this replaces the old merged `evidence`
   *  object and the separate `children` list. */
  evidence: EvidenceRecord[];
  guides: Guide[];
}

export interface EvidenceTarget {
  id: string;
  reference_number: string | null;
  name: string | null;
  kind: "intervention" | "national_proposal";
  package: string | null;
  phase: string | null;
  criteria: EvidenceCriterion[];
  assessment_evidence?: string | null;
}

/** Compact index row (list). */
export interface EvidenceRow {
  id: string;
  reference_number: string | null;
  name: string | null;
  kind: "intervention" | "national_proposal";
  package: string | null;
  phase: string | null;
  criteria_count: number;
}

export type ListResult = { count: number; targets: EvidenceRow[] };
export type GenerateResult = { count: number; targets: EvidenceTarget[] };

export type GenerateInput = {
  interventions?: string[];
  national_proposals?: string[];
};