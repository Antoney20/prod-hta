export interface PublicProposal {
  id: string;
  reference_number: string;
  intervention_name: string | null;
  intervention_type: string | null;
  beneficiary: string | null;
  justification: string | null;
  expected_impact: string | null;
  date: string;
  package?: string | null;
  system_categories?: string[];
}

export interface PublicProposalResponse {
  status: "success";
  count: number;
  generated_at: string;
  results: PublicProposal[];
}
// export interface ApiListResponse<T> {
//   status: "success";
//   count: number;
//   generated_at: string;
//   results: T[];
// }

// export type PublicProposalResponse = ApiListResponse<PublicProposal>;