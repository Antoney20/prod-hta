
import api from "../../auth";
import { ScoringReport } from "@/types/new/scoring";


export const getScoringReport = async (
  interventionIds?: string[]
): Promise<ScoringReport> => {
  const params: Record<string, string> = {};
  if (interventionIds?.length) {
    params.intervention = interventionIds.join(",");
  }

  const res = await api.get<ScoringReport>("/v3/scoring-report/", { params });
  return res.data;
};



export const getAdminScoringReport = async (
  interventionIds?: string[]
): Promise<ScoringReport> => {
  const params: Record<string, string> = {};
  if (interventionIds?.length) {
    params.intervention = interventionIds.join(",");
  }

  const res = await api.get<ScoringReport>("/v3/admin-report/", { params });
  return res.data;
};










