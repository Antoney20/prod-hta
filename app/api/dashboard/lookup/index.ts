import api from "../../auth";
import { ApiResponse } from "../../new/shared";

export interface ProposalDetail {
  id: string;
  target_type: "intervention" | "national_proposal";
  name: string | null;
  reference_number: string | null;
  package: string | null;
  phase: string | null;
}

export const getProposalById = async (id: string): Promise<ProposalDetail | null> => {
  try {
    const res = await api.get<ApiResponse<ProposalDetail>>(`/v3/proposals/${id}/`);
    return res.data.data ?? null;
  } catch {
    return null;
  }
};