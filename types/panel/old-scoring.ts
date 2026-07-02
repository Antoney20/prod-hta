

// export type ScoringStatus = "draft" | "scored" | "final";


// export interface ScoringRow {
//   intervention_ref: string;
//   kind: string;
//   [field: string]: any;
// }

// export interface CriterionScore {
//   score: number | null;
//   label: string;
//   evidence: Record<string, any>;
// }

// /** scores blob written back after a run. */
// export interface ScoreResults {
//   protocol?: { name: string; version: string; scored_at: string };
//   results?: Record<string, Record<string, CriterionScore>>; // ref -> criterion -> score
// }

// export interface ScoringModel {
//   id: string;
//   title: string;
//   description: string;
//   version: string;
//   fields: string[];
//   rows: ScoringRow[];
//   scores: ScoreResults;
//   status: ScoringStatus | null;
//   row_count: number;
//   uploaded_at: string;
//   updated_at: string;
// }

// export type ScoringModelInput = Partial<
//   Pick<ScoringModel, "title" | "description" | "version" | "fields" | "rows">
// >;

// /* ----------------------------- protocol guide ----------------------------- */

// export type RuleOp = "<" | "<=" | ">" | ">=" | "==" | "!=" | "in" | "between";

// export interface RuleClause {
//   field: string;
//   op: RuleOp;
//   value: number | string | (number | string)[];
// }

// export interface RuleCondition {
//   all?: RuleClause[];
//   any?: RuleClause[];
//   else?: boolean;
//   score: number;
//   label?: string;
// }

// export interface CriterionRules {
//   conditions: RuleCondition[];
// }

// export type ProtocolRules = Record<string, CriterionRules>;

// export interface ProtocolGuide {
//   id: string;
//   name: string;
//   version: string;
//   description: string;
//   rules: ProtocolRules;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export type ProtocolGuideInput = Partial<
//   Pick<ProtocolGuide, "name" | "version" | "description" | "rules" | "is_active">
// >;