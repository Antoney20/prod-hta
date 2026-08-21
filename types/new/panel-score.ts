import { ISODateString, UUID } from "@/types/new/shared";

export type TargetType = "intervention" | "national_proposal";

export interface CriteriaHeader {
  key:      string;
  label:    string;
  formula?: string;
  [key: string]: unknown;
}

export interface CriteriaAppraisalTool {
  id:               UUID;
  criteria:         string;
  description:      string;
  scoring_approach: string;
  score:            number | null;
  headers:          CriteriaHeader[];
  active:           boolean;
  created_at:       ISODateString;
  updated_at:       ISODateString;
}

export interface PanelAppraisalScore {
  id:         UUID;
  score:      Record<string, unknown>;
  comment:    string | null;
  created_at: ISODateString;
  updated_at: ISODateString;

  reviewer:          UUID;
  intervention:      UUID | null;
  national_proposal: UUID | null;
  criteria:          UUID;

  service:     string;
  service_key: string;

  reviewer_name:          string;
  reviewer_email:         string;
  target_type:            TargetType;
  target_id:              UUID | "";
  intervention_name:      string;
  intervention_reference: string;
  criteria_name:          string;
  package:                string | null;
  phase:                  string | null;
}

export interface PanelScoreCreatePayload {
  intervention?:      UUID;
  national_proposal?: UUID;
  criteria:           UUID;
  service?:           string;
  score:              Record<string, unknown>;
  comment?:           string;
}

/* ------------------------------------------------------------ scores report */

/** One reviewer's pick for one criterion within a scored unit. */
export interface PanelScoreDetail {
      id:               UUID;
  reviewer_id:      number;
  reviewer_name:    string;
  criteria_id:      UUID | null;
  criteria_name:    string;
  scoring_approach: string;              // HTML — the chosen option's wording
  score:            number | null;
  criteria_label:   string | null;
  comment:          string;
  created_at:       ISODateString | null;
}

/** One scored unit (target + service), with its reviewers' scores nested. */
export interface PanelScoreSummaryRow {
  target_id:        UUID;
  target_type:      TargetType;
  intervention:     string;
  reference_number: string | null;
  service:          string;              // "" = general
  phase:            string | null;
  package:          string | null;
  reviewers_scored: number;
  scores:           PanelScoreDetail[];
  submitted_at: string | null;
    scored_at: string | null;
}

export interface PanelScoreSummaryParams {
  intervention?:      UUID;
  national_proposal?: UUID;
  package?:           string;
  phase?:             string;
  service?:           string;
}