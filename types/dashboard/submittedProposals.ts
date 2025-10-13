export interface ProposalDocument {
  id: number;
  document: string;
  document_url: string;
  original_name: string;
  is_public: boolean;
}

export interface SubmittedProposal {
  id: number;
  name: string;
  phone: string;
  email: string;
  profession: string;
  organization: string;
  county: string;
  intervention_name: string | null;
  intervention_type: string | null;
  beneficiary: string;
  justification: string;
  expected_impact: string | null;
  additional_info: string | null;
  reference_number: string;
  signature: string;
  date: string;
  is_public: boolean;
  documents: ProposalDocument[];
}

export interface SubmittedProposalsAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SubmittedProposal[];
}

export interface CreateProposalPayload {
  name: string;
  phone: string;
  email: string;
  profession: string;
  organization: string;
  county: string;
  intervention_name?: string;
  intervention_type?: string;
  beneficiary: string;
  justification: string;
  expected_impact?: string;
  additional_info?: string;
  signature: string;
  date: string;
  is_public: boolean;
  uploaded_documents?: File[];
  uploadedDocument?: File;
}