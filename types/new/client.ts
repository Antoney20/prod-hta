import { User } from "@/app/api/auth";
import { ISODateString, UUID } from "./shared";

export interface Document {
  document: string;
  original_name: string;
  is_public: boolean;
}

export interface InterventionProposal {
  id: UUID;
  name: string;
  phone: string;
  email: string | null;
  profession: string | null;
  organization: string | null;
  county: string | null;
  intervention_name: string | null;
  intervention_type: string | null;
  beneficiary: string | null;
  justification: string | null;
  expected_impact: string | null;
  additional_info: string | null;
  reference_number: string | null;
  signature: string;
  date: ISODateString | null;
  submitted_at: ISODateString;
  is_public: boolean;
  documents: Document[];
  user?: User | null;
  rescore_open : boolean;
}


export interface SelectionTool {
  id: UUID;
  criteria: string;
  description: string;
  scoring_mechanism: string | null;
  scores: number | null;
  mortality_score: number | null;
  morbidity_score: number | null;
  created_at: ISODateString;
}


export interface SystemCategory {
  id: UUID;
  name: string;
  description: string;
  created_at: ISODateString;
}

export interface InterventionSystemCategory {
  id: UUID;
  intervention: UUID;
  system_category: UUID;
    system_category_detail: {
    id: UUID;
    name: string;
    description: string;
  };
      package: string | null; // null → Unassigned
  phase: string | null;   // null → Not assigned
  created_at: ISODateString;
}


export interface InterventionScore {
  id: UUID;
  reviewer: UUID;
  intervention: UUID | null;
  national_proposal: UUID | null;
  target_type: "intervention" | "national_proposal";
  criteria: UUID;
  score: Record<string, unknown>;
  comment: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  reviewer_name: string;
  reviewer_email: string;
  intervention_name: string;      
  intervention_reference: string;
  package: string | null;
  phase: string | null;
}




export interface InterventionScoreDetail extends Omit<InterventionScore, "reviewer" | "criteria"> {
  reviewer: Pick<User, "id" | "username" | "email">;
  criteria: SelectionTool;
}

 
/** Patch payload — same shape for both a normal update and a rescore */
export type ScorePatchPayload = Partial<Pick<InterventionScore, "score" | "comment">>;
 
/** Single item inside a bulk-rescore call */
export type BulkRescoreItem = ScorePatchPayload & { criteria: string };
 
/** Full bulk-rescore request body */
export interface BulkRescorePayload {
  intervention: string;
  scores: BulkRescoreItem[];
}
 
/**
 * Extra fields the backend stamps on InterventionScore after a rescore.
 * Extend InterventionScore with this when reading scores back from the API.
 */
export interface RescoreMetadata {
  is_rescored: boolean;
  rescored_by: string | null; // reviewer's user id
}
 
/** Score as returned by the API — includes rescore tracking */
export type InterventionScoreResponse = InterventionScore & RescoreMetadata;
 