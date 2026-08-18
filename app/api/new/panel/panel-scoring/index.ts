import api from "@/app/api/auth";
import {
  CriteriaAppraisalTool,
  PanelAppraisalScore,
  PanelScoreCreatePayload,
  PanelScoreSummaryParams,
  PanelScoreSummaryRow,
} from "@/types/new/panel-score";
import { PanelScoringRule, RulePreviewResult } from "@/types/panel/panel-score";

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





export const getPanelRules = async (
  params: { active?: boolean; criteria?: string } = {}
): Promise<PanelScoringRule[]> => {
  try {
    const res = await api.get<PanelScoringRule[] | { results: PanelScoringRule[] }>(
      "/v3/panel-scoring-rules/",
      { params }
    );
    const data = res.data;
    return Array.isArray(data) ? data : data.results ?? [];
  } catch {
    return [];
  }
};

export const createPanelRule = async (
  payload: Partial<PanelScoringRule>
): Promise<PanelScoringRule> => {
  const res = await api.post<PanelScoringRule>("/v3/panel-scoring-rules/", payload);
  return res.data;
};

export const updatePanelRule = async (
  id: string,
  payload: Partial<PanelScoringRule>
): Promise<PanelScoringRule> => {
  const res = await api.patch<PanelScoringRule>(`/v3/panel-scoring-rules/${id}/`, payload);
  return res.data;
};

export const deletePanelRule = async (id: string): Promise<void> => {
  await api.delete(`/v3/panel-scoring-rules/${id}/`);
};

export const previewPanelRule = async (payload: {
  rule_id: string;
  evidence?: Record<string, unknown>;
  codes?: string[];
}): Promise<RulePreviewResult> => {
  const res = await api.post<RulePreviewResult>("/v3/panel-scoring-rules/preview/", payload);
  return res.data;
};

export interface RuleImportResult {
  created: number;
  updated: number;
  failed: { row: number; criterion?: string; error: unknown }[];
}

export const importPanelRules = async (
  rules: unknown[]
): Promise<RuleImportResult> => {
  const res = await api.post<RuleImportResult>("/v3/panel-scoring-rules/import/", rules);
  return res.data;
};