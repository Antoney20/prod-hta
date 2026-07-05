export type CellStatus = "complete" | "incomplete" | "empty" | "missing";

export type OverallStatus = "complete" | "partial" | "incomplete" | "missing";

export interface CoverageCriterion {
  id: string;
  name: string;
}

export interface CoverageCell {
  criterion: string;  
   criterion_id: string;         
  criterion_name: string;
  evidence_id: string | null; 
  status: CellStatus;
  filled: number;             // labels filled
  total: number;              
}

export interface CoverageTarget {
  id: string;
  kind: "intervention" | "national_proposal";
  reference_number: string | null;
  name: string | null;
  package_name: string | null;
  phase_name: string | null;
  coverage: { covered: number; total: number; percent: number };
  counts: Record<CellStatus, number>;
  overall: OverallStatus;
  criteria: CoverageCell[];
}

/** Tally across all targets, for the summary strip. */
export interface CoverageSummary {
  complete: number;
  partial: number;
  incomplete: number;
  missing: number;
  total: number;
}

/** Full matrix payload from GET /v3/evidence-coverage/ */
export interface CoverageMatrix {
  criteria: CoverageCriterion[];
  targets: CoverageTarget[];
  summary: CoverageSummary;
}

/** A related package/phase reference on the detail view. */
export interface RelRef {
  id: string;
  name: string | null;
  batch_number: string | null;
}

/** Per-criterion breakdown on the target detail view (carries data + score). */
export interface DetailCriterion extends CoverageCell {
  headers: { key: string; label: string; type?: string; options?: string[] }[];
  data: Record<string, unknown>;
  score: number | null;
}

/** Full payload from GET /v3/evidence-coverage/<kind>/<id>/ */
export interface CoverageDetail {
  id: string;
  kind: "intervention" | "national_proposal";
  reference_number: string | null;
  name: string | null;
  package: RelRef | null;
  phase: RelRef | null;
  counts: Record<CellStatus, number>;
  coverage: { covered: number; total: number; percent: number };
  overall: OverallStatus;
  criteria: DetailCriterion[];
}