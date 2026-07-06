import { CriterionHeader } from "@/types/new/evidence-panel";

/** One scoring band. Shape depends on the rule's kind:
 *  - quantitative threshold: { op, value, score }
 *  - equity factor-combo:    { combo, score }
 *  - descriptive prose:      { label, score }
 */
export interface RuleBand {
  field?: string;      
  op?: "<" | "<=" | ">" | ">=" | "==" | "!=" | "in" | "between";
  value?: number | string | (number | string)[];
  combo?: string[];
  label?: string;
  score: number;
}

/** A factor definition (equity's E/R/N and their coded levels). */
export interface RuleItem {
  key: string;
  label: string;
  levels?: { code: string; desc: string }[];
}

/** A guide document — link to published literature, or an uploaded file. */
export interface GuideDocument {
  id: string;
  rule: string;
  label: string;
  description: string;
  link: string;
  file: string | null;
  file_url: string | null;
  created_at: string;
}

/** A rule attached to one criterion. One rule per criterion. */
export interface CriteriaRule {
  id: string;
  criterion: string;
  criterion_name: string;
  description: string;
  kind: string;                 // "quantitative" | "descriptive"
  target_fields: string[];      // header keys this rule reads
  aggregate: string;            // "" | "average" | "sum" | "combo"
  items: RuleItem[];
  bands: RuleBand[];
  active: boolean;
  documents: GuideDocument[];
  created_at: string;
  updated_at: string;
}

export type RuleInput = Partial<Pick<CriteriaRule, "criterion" | "description" | "kind" | "target_fields" | "aggregate" | "items" | "bands" | "active">> & { criterion_name?: string };

export type GuideInput = {
  label: string;
  description?: string;
  link?: string;
  file?: File | null;
};

export interface BulkRuleResult {
  created: number;
  updated: number;
  failed: { row: number; error: string }[];
}

export type Write<T> = { ok: boolean; data?: T; error?: string };