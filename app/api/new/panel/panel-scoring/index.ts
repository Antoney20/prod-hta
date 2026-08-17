import api from "@/app/api/auth";
import {
  CriteriaAppraisalTool,
  PanelAppraisalScore,
  PanelScoreCreatePayload,
  PanelScoreSummaryParams,
  PanelScoreSummaryRow,
} from "@/types/new/panel-score";

export const getAppraisalCriteria = async (): Promise<CriteriaAppraisalTool[]> => {
  try {
    const res = await api.get<CriteriaAppraisalTool[] | { results: CriteriaAppraisalTool[] }>(
      "/v3/appraisal-criteria/"
    );
    const data = res.data;
    return Array.isArray(data) ? data : data.results ?? [];
  } catch {
    return [];
  }
};

export const listPanelScores = async (
  params: {
    intervention?: string;
    national_proposal?: string;
    criteria?: string;
    reviewer?: string;
    service?: string;
  } = {}
): Promise<PanelAppraisalScore[]> => {
  try {
    const res = await api.get<PanelAppraisalScore[] | { results: PanelAppraisalScore[] }>(
      "/v3/panel-scores/",
      { params }
    );
    const data = res.data;
    return Array.isArray(data) ? data : data.results ?? [];
  } catch {
    return [];
  }
};

export const getScoresSummary = async (
  params: PanelScoreSummaryParams = {}
): Promise<PanelScoreSummaryRow[]> => {
  try {
    const res = await api.get<{ rows: PanelScoreSummaryRow[] } | PanelScoreSummaryRow[]>(
      "/v3/panel-scores/summary/",
      { params }
    );
    const data = res.data;
    return Array.isArray(data) ? data : data.rows ?? [];
  } catch {
    return [];
  }
};

export const createPanelScore = async (
  payload: PanelScoreCreatePayload
): Promise<PanelAppraisalScore> => {
  const res = await api.post<PanelAppraisalScore>("/v3/panel-scores/", payload);
  return res.data;
};

export interface BulkPanelScoreResult {
  upserted: number;
  failed: { row: number; error: string }[];
}

export const bulkCreatePanelScores = async (
  scores: PanelScoreCreatePayload[]
): Promise<BulkPanelScoreResult> => {
  const res = await api.post<BulkPanelScoreResult>("/v3/panel-scores/bulk/", scores);
  return res.data;
};

export const deletePanelScoresBulk = async (ids: string[]): Promise<{ deleted: number }> => {
  const res = await api.post<{ deleted: number }>("/v3/panel-scores/bulk-delete/", { ids });
  return res.data;
};