export interface InterventionPhase {
  id: number;
  name: string;
  description: string;
  order: number;
  is_active: boolean;
  interventions_count?: number;
  national_proposals_count?: number;
  created_at: string;
  updated_at: string;
}

export interface InterventionPhasePayload {
  name: string;
  description?: string;
  order?: number;
  is_active?: boolean;
}

export interface PhaseBulkUploadRow {
  name: string;
  reference_number: string;
}

export interface PhaseBulkUploadResult {
  attached: { row: number; ref: string; phase: string }[];
  errors: { row: number; ref: string; error: string }[];
}

export interface GroupedPhaseMember {
  kind: "intervention" | "program";
  id: string;
  reference_number: string;
  name: string | null;
}

export interface GroupedPhase {
  id: number;
  name: string;
  description: string;
  order: number;
  is_active: boolean;
  members: GroupedPhaseMember[];
}