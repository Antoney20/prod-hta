export interface Guide {
  label: string;
  description: string | null;
  link: string | null;
  file: string | null;
}

/** One evidence record within a criterion. Criteria that hold more than one
 *  record (duplicates) expose each here; `evidence` remains the merged view. */
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
  evidence: Record<string, unknown>;   // merged view — all records folded together
  children?: EvidenceRecord[];         // one entry per record; length > 1 ⇒ duplicated
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