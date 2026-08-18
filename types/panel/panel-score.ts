import { ISODateString, UUID } from "../new/shared";

export type RuleKind = "band" | "combo";
export type RuleOp = ">=" | ">" | "<=" | "<" | "==" | "between";

export interface RuleBand {
  op?:    RuleOp;              // band rules
  value?: number | number[];  // number, or [lo, hi] for "between"
  combo?: string[];           // combo rules — the code set
  score:  number;
  label?: string;
}

export interface RuleItemLevel { code: string; desc: string; }
export interface RuleItem { key: string; label: string; levels: RuleItemLevel[]; }

export interface PanelScoringRule {
  id:            UUID;
  criteria:      string;
  criteria_key:  string;
  kind:          RuleKind;
  description:   string;
  target_fields: string[];
  aggregate:     "" | "sum" | "combo";
  items:         RuleItem[];
  bands:         RuleBand[];
  active:        boolean;
  created_at:    ISODateString;
  updated_at:    ISODateString;
}

export interface RulePreviewResult {
  matched:    boolean;
  score?:     number;
  label?:     string;
  value?:     number | string[];
  option_id?: UUID | null;
}