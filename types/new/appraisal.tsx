import { ISODateString, UUID } from "@/types/new/shared";


export interface CriteriaAppraisalTool {
  id:               UUID;
  criteria:         string;
  description:      string;
  scoring_approach: string;
  score:            number | null;  
  created_at:       ISODateString;
}


// export interface CriteriaAppraisalScore {
//   id:                    UUID;
//   reviewer:              UUID;
//   reviewer_name:         string;
//   reviewer_email:        string;
//   intervention:          UUID;
//   intervention_name:     string;
//   criteria:              UUID;
//   criteria_name:         string;
//   score:                 Record<string, unknown>;
//   comment:               string | null;
//   is_rescored:           boolean;
//   rescored_by:           UUID | null;
//   rescored_by_name:      string | null;
//   created_at:            ISODateString;
//   updated_at:            ISODateString;
// }

// export interface CriteriaAppraisalScoreCreatePayload {
//   intervention: UUID;
//   criteria:     UUID;
//   score:        Record<string, unknown>;
//   comment?:     string;
// }

// export interface BulkAppraisalScorePayload {
//   scores: CriteriaAppraisalScoreCreatePayload[];
// }