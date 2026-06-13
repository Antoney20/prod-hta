export interface EvidenceInterventionRef {
  id: string;
  reference_number: string;
  intervention_name: string | null;
  intervention_type: string | null;
}

export interface EvidenceProgramRef {
  id: string;
  reference_number: string;
  title: string;
  program: number;
}

export interface AssessmentEvidenceDocument {
  id: string;          // UUID
  file: string;        // url/path
  name: string;        // derived basename
  description: string;
  uploaded_at: string;
}

export interface AssessmentEvidence {
  id: string;          // UUID
  summary: string;
  interventions: EvidenceInterventionRef[];
  program_proposals: EvidenceProgramRef[];
  documents: AssessmentEvidenceDocument[];
  created_by: number | null;
  created_at: string;
  updated_at: string;
}
export interface EvidenceDocumentInput {
  file: File;
  description?: string;
}

export interface AssessmentEvidencePayload {
  summary?: string;
  intervention_ids?: string[];
  program_proposal_ids?: string[];
  documents?: EvidenceDocumentInput[];
}