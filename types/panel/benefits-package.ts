/* ------------------------------------------------------------------ */
/*  SWG prioritized list                                               */
/* ------------------------------------------------------------------ */

/** One editable column in the dynamic SWG table. `key` maps to the row
 *  object property; `label` is the (editable) header text. */
export interface SwgColumn {
  key: string;
  label: string;
}

export interface SwgSection {
  key: string;
  label: string;
}

/** A prioritised topic row. Flexible — only keys referenced by active
 *  columns matter; extra keys are preserved untouched. */
export interface SwgRow {
  ref?: string;
  intervention?: string;
  package?: string;
  justification?: string;
  next_steps?: string;
  hta_type?: string;        // section tag: rapid | full | panel
  decision?: string;        // include | exclude | ""
  service_type?: string;
  package_access?: string;
  [key: string]: unknown;
}

/** Package-level meta stored in `data`. Column + section shape travels
 *  with the record so the table renders the same everywhere. */
export interface SwgMeta {
  columns?: SwgColumn[];
  sections?: SwgSection[];
  [key: string]: unknown;
}

export interface SwgList {
  id: string;
  name: string;
  cycle: string;
  data: SwgMeta;
  items: SwgRow[];
}

export interface SwgListSummary {
  id: string;
  name: string;
  cycle: string;
  count: number;
}

export interface SwgWrite {
  name?: string;
  cycle?: string;
  data?: SwgMeta;
  items?: SwgRow[];
}

export const DEFAULT_SWG_COLUMNS: SwgColumn[] = [
  { key: "ref", label: "Ref" },
  { key: "intervention", label: "Proposed Intervention" },
  { key: "package", label: "Benefit Package" },
  { key: "justification", label: "Justification" },
  { key: "next_steps", label: "Proposed Next Steps" },
];

export const DEFAULT_SWG_SECTIONS: SwgSection[] = [
  { key: "rapid", label: "Proposed for Rapid HTA" },
  { key: "full", label: "Proposed for Full HTA" },
  { key: "panel", label: "Proposed for Panel Appraisal" },
];

/* ------------------------------------------------------------------ */
/*  Proposed / revised benefit packages                                */
/* ------------------------------------------------------------------ */

export type Decision = "include" | "exclude" | "pending";
export type ProposalKind = "intervention" | "national";

export interface PackageIntervention {
  id?: string;
  ref: string;
  name: string;
  kind: ProposalKind;
  service_type: string;
  package_access: string;
  routing: string;              // from SWG next_steps
  decision: Decision;
  comment: string;
  evidence_id?: string | null;  // null until evidence extracted
}

export interface ServiceGroup {
  service: string;
  interventions: PackageIntervention[];
}

export interface ProposedPackage {
  id: string;
  name: string;
  fund: string;
  current: unknown[];           // current BenefitPackage.items
  services: ServiceGroup[];
}

export interface PackageSummary {
  id: string;
  name: string;
  fund: string;
  count: number;
}

export interface RevisedItem {
  id?: string;
  ref: string;
  name: string;
  kind: ProposalKind;
  service_type: string;
  package_access: string;
  comment: string;
}

export interface RevisedPackage {
  id: string;
  name: string;
  fund: string;
  data?: Record<string, unknown>;
  items: RevisedItem[];
}

export interface DecisionInput {
  ref: string;
  decision: Decision;
  comment?: string;
}

export interface BuildFromSwgInput {
  swg_id: string;
  fund?: string;
  hta_type?: string;      
}