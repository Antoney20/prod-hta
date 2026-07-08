import {
  BulkRescorePayload, InterventionProposal, InterventionScore, InterventionScoreResponse,
  InterventionSystemCategory, ScorePatchPayload, SelectionTool, SystemCategory,
} from "@/types/new/client";
import api from "../../auth";
import { PaginatedResponse } from "@/types/new/shared";

// ── Selection tools ───────────────────────────────────────────────────────────

export const getSelectionTools = async (): Promise<SelectionTool[]> => {
  try {
    const res = await api.get<PaginatedResponse<SelectionTool>>("/v3/selection-tools/");
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

export const getSelectionToolDetail = async (id: string): Promise<SelectionTool | null> => {
  try {
    const res = await api.get<SelectionTool>(`/v3/selection-tools/${id}/`);
    return res.data;
  } catch {
    return null;
  }
};

export const createSelectionTool = async (body: Partial<SelectionTool>): Promise<SelectionTool | null> => {
  try {
    const res = await api.post<SelectionTool>("/v3/selection-tools/", body);
    return res.data;
  } catch {
    return null;
  }
};

export const updateSelectionTool = async (
  id: string,
  body: Partial<SelectionTool>
): Promise<SelectionTool | null> => {
  try {
    const res = await api.patch<SelectionTool>(`/v3/selection-tools/${id}/`, body);
    return res.data;
  } catch {
    return null;
  }
};

export const deleteSelectionTool = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/v3/selection-tools/${id}/`);
    return true;
  } catch {
    return false;
  }
};

// ── System categories ─────────────────────────────────────────────────────────

export const getSystemCategories = async (): Promise<SystemCategory[]> => {
  try {
    const res = await api.get<PaginatedResponse<SystemCategory>>("/v3/system-categories/");
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

export const getSystemCategoryDetail = async (id: string): Promise<SystemCategory | null> => {
  try {
    const res = await api.get<SystemCategory>(`/v3/system-categories/${id}/`);
    return res.data;
  } catch {
    return null;
  }
};

export const createSystemCategory = async (body: Partial<SystemCategory>): Promise<SystemCategory | null> => {
  try {
    const res = await api.post<SystemCategory>("/v3/system-categories/", body);
    return res.data;
  } catch {
    return null;
  }
};

export const updateSystemCategory = async (
  id: string,
  body: Partial<SystemCategory>
): Promise<SystemCategory | null> => {
  try {
    const res = await api.patch<SystemCategory>(`/v3/system-categories/${id}/`, body);
    return res.data;
  } catch {
    return null;
  }
};

export const deleteSystemCategory = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/v3/system-categories/${id}/`);
    return true;
  } catch {
    return false;
  }
};

// ── Intervention ↔ category links ─────────────────────────────────────────────

export const getInterventionCategories = async (interventionId?: string): Promise<InterventionSystemCategory[]> => {
  try {
    const params = interventionId ? { intervention: interventionId } : undefined;
    const res = await api.get<PaginatedResponse<InterventionSystemCategory>>("/v3/intervention-categories/", { params });
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

export const createInterventionCategory = async (
  body: Pick<InterventionSystemCategory, "intervention" | "system_category">
): Promise<InterventionSystemCategory | null> => {
  try {
    const res = await api.post<InterventionSystemCategory>("/v3/intervention-categories/", body);
    return res.data;
  } catch {
    return null;
  }
};

export const deleteInterventionCategory = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/v3/intervention-categories/${id}/`);
    return true;
  } catch {
    return false;
  }
};

// ── Scores (interventions + national programs, same endpoint) ─────────────────

export const getInterventionScores = async (interventionId?: string): Promise<InterventionScore[]> => {
  try {
    const params = interventionId ? { intervention: interventionId } : undefined;
    const res = await api.get<PaginatedResponse<InterventionScore>>("/v3/intervention-scores/", { params });
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

/** National-program scores — same endpoint, national_proposal query param. */
export const getNationalScores = async (nationalProposalId: string): Promise<InterventionScore[]> => {
  try {
    const res = await api.get<PaginatedResponse<InterventionScore>>("/v3/intervention-scores/", {
      params: { national_proposal: nationalProposalId },
    });
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

export const getInterventionScoreDetail = async (id: string): Promise<InterventionScore | null> => {
  try {
    const res = await api.get<InterventionScore>(`/v3/intervention-scores/${id}/`);
    return res.data;
  } catch {
    return null;
  }
};

export const createInterventionScore = async (
  scores: Array<
    Pick<InterventionScore, "criteria" | "score" | "comment"> &
      ({ intervention: string } | { national_proposal: string })
  >
): Promise<InterventionScore[]> => {
  const res = await api.post<InterventionScore[]>("/v3/intervention-scores/bulk/", { scores });
  return res.data;
};

export const updateInterventionScore = async (
  id: string,
  body: Partial<Pick<InterventionScore, "score" | "comment">>
): Promise<InterventionScore | null> => {
  try {
    const res = await api.patch<InterventionScore>(`/v3/intervention-scores/${id}/`, body);
    return res.data;
  } catch {
    return null;
  }
};

export const deleteInterventionScore = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/v3/intervention-scores/${id}/`);
    return true;
  } catch {
    return false;
  }
};

// ── Proposals ─────────────────────────────────────────────────────────────────

export const getInterventionProposals = async (): Promise<InterventionProposal[]> => {
  try {
    const res = await api.get<PaginatedResponse<InterventionProposal>>("/v3/re-open/");
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

/** Single national program proposal by id (for scoring/detail headers). */
export const getNationalProgramById = async (id: string): Promise<any | null> => {
  try {
    const res = await api.get(`/v3/program-proposals/${id}/`);
    return res.data;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Rescore window  (admin / SWG / secretariat only)
// ---------------------------------------------------------------------------

export const openRescoreWindow = async (
  interventionId: string
): Promise<{ detail: string } | null> => {
  try {
    const res = await api.post<{ detail: string }>(`/v3/re-open/${interventionId}/open-rescore/`);
    return res.data;
  } catch {
    return null;
  }
};

export const closeRescoreWindow = async (
  interventionId: string
): Promise<{ detail: string } | null> => {
  try {
    const res = await api.post<{ detail: string }>(`/v3/re-open/${interventionId}/close-rescore/`);
    return res.data;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Rescoring  — edits the existing row in-place, requires rescore window open
// ---------------------------------------------------------------------------

export const rescoreIntervention = async (
  scoreId: string,
  payload: ScorePatchPayload
): Promise<InterventionScoreResponse | null> => {
  try {
    const res = await api.patch<InterventionScoreResponse>(
      `/v3/intervention-scores/${scoreId}/rescore/`,
      payload
    );
    return res.data;
  } catch {
    return null;
  }
};

export const bulkRescoreIntervention = async (
  payload: BulkRescorePayload
): Promise<InterventionScoreResponse[]> => {
  const res = await api.post<InterventionScoreResponse[]>(
    "/v3/intervention-scores/bulk-rescore/",
    payload
  );
  return res.data;
};