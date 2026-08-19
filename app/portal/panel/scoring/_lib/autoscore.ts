// import { PanelScoringRule, RuleBand } from "@/types/panel/panel-score";
// import { CriterionGroup } from "./scoring";


// /** lowercase alphanumeric — mirrors backend PanelScoringRule.make_key. This is
//  *  the ONE canonical form used to match a rule to a criterion group. */
// export const ruleKey = (name: string): string =>
//   (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// const num = (v: unknown): number | null => {
//   if (v === null || v === undefined || v === "") return null;
//   const n = Number(String(v).replace(/[,\s]/g, ""));
//   return Number.isFinite(n) ? n : null;
// };

// function matchBand(bands: RuleBand[], value: number): RuleBand | null {
//   for (const b of bands) {
//     const v = b.value;
//     switch (b.op) {
//       case "between":
//         if (Array.isArray(v) && v.length === 2 && value >= v[0] && value <= v[1]) return b;
//         break;
//       case ">":  if (typeof v === "number" && value >  v) return b; break;
//       case ">=": if (typeof v === "number" && value >= v) return b; break;
//       case "<":  if (typeof v === "number" && value <  v) return b; break;
//       case "<=": if (typeof v === "number" && value <= v) return b; break;
//       case "==": if (typeof v === "number" && value === v) return b; break;
//     }
//   }
//   return null;
// }

// function matchCombo(bands: RuleBand[], codes: string[]): RuleBand | null {
//   const want = new Set(codes);
//   for (const b of bands) {
//     const c = b.combo ?? [];
//     if (c.length === want.size && c.every((x) => want.has(x))) return b;
//   }
//   return null;
// }

// export interface AutoPick {
//   score: number;
//   label?: string;
//   value: number | string[];
//   optionId: string | null; // resolved against the group's options
// }

// /** Compute a rule's auto-pick for one criterion group against its evidence
//  *  (band) or explicit codes (combo). Returns null when it can't fire. */
// export function computeAutoPick(
//   rule: PanelScoringRule,
//   group: CriterionGroup,
//   evidence: Record<string, unknown>,
//   codes: string[] = []
// ): AutoPick | null {
//   let band: RuleBand | null = null;
//   let value: number | string[];

//   if (rule.kind === "combo") {
//     band = matchCombo(rule.bands, codes);
//     value = codes;
//   } else {
//     const nums = (rule.target_fields ?? [])
//       .map((f) => num(evidence[f]))
//       .filter((n): n is number => n !== null);
//     if (nums.length === 0) return null;
//     value = rule.aggregate === "sum" ? nums.reduce((a, b) => a + b, 0) : nums[0];
//     band = matchBand(rule.bands, value);
//   }

//   if (!band) return null;
//   const optionId = group.options.find((o) => o.score === band!.score)?.id ?? null;
//   return { score: band.score, label: band.label, value, optionId };
// }

// /** Index active rules by the canonical alphanumeric key (computed from the
//  *  criteria NAME, so it always aligns with ruleKey(group.name) at lookup). */
// export function indexRules(rules: PanelScoringRule[]): Map<string, PanelScoringRule> {
//   const m = new Map<string, PanelScoringRule>();
//   for (const r of rules) if (r.active) m.set(ruleKey(r.criteria), r);
//   return m;
// }

import { PanelScoringRule, RuleBand } from "@/types/panel/panel-score";
import { CriterionGroup } from "./scoring";


/** lowercase alphanumeric — mirrors backend PanelScoringRule.make_key. */
export const ruleKey = (name: string): string =>
  (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
};

function matchBand(bands: RuleBand[], value: number): RuleBand | null {
  for (const b of bands) {
    const v = b.value;
    switch (b.op) {
      case "between":
        if (Array.isArray(v) && v.length === 2 && value >= v[0] && value <= v[1]) return b;
        break;
      case ">":  if (typeof v === "number" && value >  v) return b; break;
      case ">=": if (typeof v === "number" && value >= v) return b; break;
      case "<":  if (typeof v === "number" && value <  v) return b; break;
      case "<=": if (typeof v === "number" && value <= v) return b; break;
      case "==": if (typeof v === "number" && value === v) return b; break;
    }
  }
  return null;
}

function matchCombo(bands: RuleBand[], codes: string[]): RuleBand | null {
  const want = new Set(codes);
  for (const b of bands) {
    const c = b.combo ?? [];
    if (c.length === want.size && c.every((x) => want.has(x))) return b;
  }
  return null;
}

export type AutoFailReason =
  | "no_fields"        // rule has no target_fields mapped
  | "missing_value"    // mapped field(s) absent / non-numeric in evidence
  | "no_band"          // value read but fell outside every band
  | "no_option";       // band matched but no criterion option carries that score

/** Discriminated result: an auto pick, an explained failure, or no rule. */
export type AutoResult =
  | { status: "matched"; score: number; label?: string; value: number | string[]; optionId: string }
  | { status: "failed"; reason: AutoFailReason; value?: number | string[] };

export interface AutoPick {
  score: number;
  label?: string;
  value: number | string[];
  optionId: string;
}

/** Compute a rule against evidence (band) or codes (combo). Returns a matched
 *  pick, or a failure with a reason the UI can show. */
export function computeAuto(
  rule: PanelScoringRule,
  group: CriterionGroup,
  evidence: Record<string, unknown>,
  codes: string[] = []
): AutoResult {
  let band: RuleBand | null = null;
  let value: number | string[];

  if (rule.kind === "combo") {
    if (!codes.length) return { status: "failed", reason: "missing_value" };
    band = matchCombo(rule.bands, codes);
    value = codes;
    if (!band) return { status: "failed", reason: "no_band", value };
  } else {
    const fields = rule.target_fields ?? [];
    if (fields.length === 0) return { status: "failed", reason: "no_fields" };
    const nums = fields.map((f) => num(evidence[f])).filter((n): n is number => n !== null);
    if (nums.length === 0) return { status: "failed", reason: "missing_value" };
    value = rule.aggregate === "sum" ? nums.reduce((a, b) => a + b, 0) : nums[0];
    band = matchBand(rule.bands, value);
    if (!band) return { status: "failed", reason: "no_band", value };
  }

  const option = group.options.find((o) => o.score === band!.score);
  if (!option) return { status: "failed", reason: "no_option", value };

  return { status: "matched", score: band.score, label: band.label, value, optionId: option.id };
}

/** Index active rules by canonical alphanumeric key (from the criteria NAME). */
export function indexRules(rules: PanelScoringRule[]): Map<string, PanelScoringRule> {
  const m = new Map<string, PanelScoringRule>();
  for (const r of rules) if (r.active) m.set(ruleKey(r.criteria), r);
  return m;
}

export const failMessage = (reason: AutoFailReason): string => {
  switch (reason) {
    case "no_fields":     return "No evidence field is mapped for this rule.";
    case "missing_value": return "The required evidence value is missing or not a number.";
    case "no_band":       return "The evidence value didn't fall into any scoring band.";
    case "no_option":     return "No scoring option matches the rule's result.";
  }
};