import api from "@/app/api/auth";
import { PaginatedResponse } from "@/types/new/shared";
import {
  AppraisalCriteriaEvidence,
  AppraisalCriteriaEvidencePayload,
} from "@/types/new/appraisal-evidence";


export const extractApiError = (err: unknown): string => {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  if (!data) return "Something went wrong.";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.detail === "string") return d.detail;
    const messages = Object.entries(d)
      .flatMap(([field, val]) => {
        if (Array.isArray(val)) return val.map((v) => `${field}: ${v}`);
        if (typeof val === "string") return [`${field}: ${val}`];
        return [];
      })
      .join(" | ");
    if (messages) return messages;
  }
  return "Something went wrong.";
};

export const getAppraisalEvidence = async (
  interventionId?: string
): Promise<AppraisalCriteriaEvidence[]> => {
  try {
    const params = interventionId ? { intervention: interventionId } : {};
    const res = await api.get<PaginatedResponse<AppraisalCriteriaEvidence>>(
      "/v3/appraisal-evidence/",
      { params }
    );
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

export const getAppraisalEvidenceDetail = async (
  id: string
): Promise<AppraisalCriteriaEvidence | null> => {
  try {
    const res = await api.get<AppraisalCriteriaEvidence>(
      `/v3/appraisal-evidence/${id}/`
    );
    return res.data;
  } catch {
    return null;
  }
};

export const createAppraisalEvidence = async (
  body: AppraisalCriteriaEvidencePayload
): Promise<{ data: AppraisalCriteriaEvidence | null; error: string | null }> => {
  try {
    const res = await api.post<AppraisalCriteriaEvidence>(
      "/v3/appraisal-evidence/",
      body
    );
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: extractApiError(err) };
  }
};

export const updateAppraisalEvidence = async (
  id: string,
  body: Partial<AppraisalCriteriaEvidencePayload>
): Promise<{ data: AppraisalCriteriaEvidence | null; error: string | null }> => {
  try {
    const res = await api.patch<AppraisalCriteriaEvidence>(
      `/v3/appraisal-evidence/${id}/`,
      body
    );
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: extractApiError(err) };
  }
};

export const deleteAppraisalEvidence = async (
  id: string
): Promise<{ ok: boolean; error: string | null }> => {
  try {
    await api.delete(`/v3/appraisal-evidence/${id}/`);
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: extractApiError(err) };
  }
};