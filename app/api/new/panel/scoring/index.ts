import api from "@/app/api/auth";
import {
  PanelIntervention,
  PanelInterventionResponse,
  CriteriaAppraisalScore,
  CriteriaAppraisalTool,
  BulkScorePayload,
  ScorePayload,
} from "@/types/new/panel-appraisal";

export {
  getSystemCategories,
  getInterventionCategories as getInterventionSystemCategories,
} from "@/app/api/new/client";


export const getPanelInterventions = async (): Promise<PanelIntervention[]> => {
  try {
    const res = await api.get<PanelInterventionResponse>("/v3/topic-priority/");
    const results = res.data.results ?? [];
    return results.filter(
      (r) => r.move_to_panel === true && r.intervention_id != null
    );
  } catch {
    return [];
  }
};

export const getAllInterventionsCount = async (): Promise<number> => {
  try {
    const res = await api.get<{ count: number }>("/v3/proposals/?page_size=1");
    return res.data.count ?? 0;
  } catch {
    return 0;
  }
};

// ── Criteria tools ────────────────────────────────────────────────────────────

export const getAppraisalCriteria = async (): Promise<CriteriaAppraisalTool[]> => {
  try {
    const res = await api.get<{ results: CriteriaAppraisalTool[] }>(
      "/v3/appraisal-criteria/"
    );
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

// ── My scores ─────────────────────────────────────────────────────────────────

export const getMyScores = async (
  interventionId?: string
): Promise<CriteriaAppraisalScore[]> => {
  try {
    const params = interventionId ? `?intervention=${interventionId}` : "";
    const res = await api.get<{ results: CriteriaAppraisalScore[] }>(
      `/v3/appraisal-scores/${params}`
    );
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

// ── Write ─────────────────────────────────────────────────────────────────────

export const createScore = async (
  interventionId: string,
  payload: ScorePayload
): Promise<CriteriaAppraisalScore> => {
  const res = await api.post<CriteriaAppraisalScore>("/v3/appraisal-scores/", {
    intervention: interventionId,
    criteria_id: payload.criteria_id,
    score: payload.score,
    comment: payload.comment,
  });
  return res.data;
};

export const bulkCreateScores = async (
  payload: BulkScorePayload
): Promise<CriteriaAppraisalScore[]> => {
  const res = await api.post<CriteriaAppraisalScore[]>(
    "/v3/appraisal-scores/bulk/",
    payload
  );
  return res.data;
};