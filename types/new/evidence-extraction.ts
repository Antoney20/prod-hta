export interface EvidenceField {
  key: string;
  label: string;
  type?: string;          // number | percentage | ratio | rate | text | timeseries | ordinal | ...
  definition?: string;
  formula?: string;
  example?: string;
  required?: boolean;
  options?: string[];
}

export interface EvidenceCriterion {
  id: string;
  name: string;
  code: string;
  description: string | null;
  field_schema: EvidenceField[];
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type EvidenceCriterionPayload = Partial<
  Pick<
    EvidenceCriterion,
    "name" | "code" | "description" | "field_schema" | "position" | "is_active"
  >
>;

/** Extracted values, nested by criterion code:
 *  { clinical_effectiveness: { survival_rate: "70.2% (2025)" }, safety: { odds_ratio: "2.4" } } */
export type EvidenceValue = string | number | boolean | null;
export type EvidenceData = Record<string, Record<string, EvidenceValue>>;

/** One intervention's extracted evidence — a single Outcomes-sheet row.
 *  Attaches to exactly one proposal: national OR intervention. Both ids are UUID strings. */
export interface EvidenceExtraction {
  id: string;
  national_proposal: string | null;        // UUID — NationalProgramProposal.id
  intervention_proposal: string | null;    // UUID — InterventionProposal.id
  routing_decision: string | null;
  icd_11: string | null;
  disease_definition: string | null;
  registrar: string | null;
  assigned_person: string | null;
  data: EvidenceData;
  created_by: number | string | null;
  proposal_reference: string | null;       // read-only convenience from the serializer
  proposal_kind: "program" | "intervention" | null;  // read-only, from the serializer
  created_at: string;
  updated_at: string;
}

/** Writable fields only — server owns created_by / timestamps / id. */
export type EvidenceExtractionPayload = Partial<
  Pick<
    EvidenceExtraction,
    | "national_proposal"
    | "intervention_proposal"
    | "routing_decision"
    | "icd_11"
    | "disease_definition"
    | "registrar"
    | "assigned_person"
    | "data"
  >
>;