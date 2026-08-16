

export type AppraisalRow = Record<string, unknown>;

export interface AppraisalColumn {
  key: string;
  label: string;
}

export interface AppraisalReportSummary {
  id: string;
  name: string;
  count: number;
}

export interface AppraisalReport {
  id: string;
  name: string;
  data: AppraisalMeta;
  items: AppraisalRow[];
}

/** Loose meta bag stored on `data`. All optional. */
export interface AppraisalMeta {
  group_key?: string;                 // table grouping field, defaults to "intervention"
  labels?: Record<string, string>;    // optional column-label overrides
  [k: string]: unknown;
}

export interface AppraisalReportInput {
  name?: string;
  data?: AppraisalMeta;
  items?: AppraisalRow[];
}

export type ImportMode = "replace" | "append";

export interface ParsedReport {
  columns: AppraisalColumn[];
  rows: AppraisalRow[];
}