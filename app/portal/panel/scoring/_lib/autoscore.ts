import { PanelScoringRule, RuleBand } from "@/types/panel/panel-score";
import { CriterionGroup } from "./scoring";


/** lowercase alphanumeric — mirrors backend PanelScoringRule.make_key. This is
 *  the ONE canonical form used to match a rule to a criterion group. */
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

export interface AutoPick {
  score: number;
  label?: string;
  value: number | string[];
  optionId: string | null; // resolved against the group's options
}

/** Compute a rule's auto-pick for one criterion group against its evidence
 *  (band) or explicit codes (combo). Returns null when it can't fire. */
export function computeAutoPick(
  rule: PanelScoringRule,
  group: CriterionGroup,
  evidence: Record<string, unknown>,
  codes: string[] = []
): AutoPick | null {
  let band: RuleBand | null = null;
  let value: number | string[];

  if (rule.kind === "combo") {
    band = matchCombo(rule.bands, codes);
    value = codes;
  } else {
    const nums = (rule.target_fields ?? [])
      .map((f) => num(evidence[f]))
      .filter((n): n is number => n !== null);
    if (nums.length === 0) return null;
    value = rule.aggregate === "sum" ? nums.reduce((a, b) => a + b, 0) : nums[0];
    band = matchBand(rule.bands, value);
  }

  if (!band) return null;
  const optionId = group.options.find((o) => o.score === band!.score)?.id ?? null;
  return { score: band.score, label: band.label, value, optionId };
}

/** Index active rules by the canonical alphanumeric key (computed from the
 *  criteria NAME, so it always aligns with ruleKey(group.name) at lookup). */
export function indexRules(rules: PanelScoringRule[]): Map<string, PanelScoringRule> {
  const m = new Map<string, PanelScoringRule>();
  for (const r of rules) if (r.active) m.set(ruleKey(r.criteria), r);
  return m;
}