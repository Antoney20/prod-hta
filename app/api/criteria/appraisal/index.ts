import api from "@/app/api/auth";
import { PaginatedResponse } from "@/types/new/shared";
import {
  CriteriaAppraisalTool,
  // CriteriaAppraisalScore,
  // CriteriaAppraisalScoreCreatePayload,
  // BulkAppraisalScorePayload,
} from "@/types/new/appraisal";



export const extractApiError = (err: unknown): string => {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  if (!data) return "Something went wrong.";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.detail === "string") return d.detail;
    // field-level errors — join them all
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


export const getAppraisalCriteria = async (): Promise<CriteriaAppraisalTool[]> => {
  try {
    const res = await api.get<PaginatedResponse<CriteriaAppraisalTool>>("/v3/appraisal-criteria/");
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

export const getAppraisalCriteriaDetail = async (
  id: string
): Promise<CriteriaAppraisalTool | null> => {
  try {
    const res = await api.get<CriteriaAppraisalTool>(`/v3/appraisal-criteria/${id}/`);
    return res.data;
  } catch {
    return null;
  }
};

export const createAppraisalCriteria = async (
  body: Partial<CriteriaAppraisalTool>
): Promise<{ data: CriteriaAppraisalTool | null; error: string | null }> => {
  try {
    const res = await api.post<CriteriaAppraisalTool>("/v3/appraisal-criteria/", body);
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: extractApiError(err) };
  }
};

export const updateAppraisalCriteria = async (
  id: string,
  body: Partial<CriteriaAppraisalTool>
): Promise<{ data: CriteriaAppraisalTool | null; error: string | null }> => {
  try {
    const res = await api.patch<CriteriaAppraisalTool>(`/v3/appraisal-criteria/${id}/`, body);
    return { data: res.data, error: null };
  } catch (err) {
    return { data: null, error: extractApiError(err) };
  }
};

export const deleteAppraisalCriteria = async (
  id: string
): Promise<{ ok: boolean; error: string | null }> => {
  try {
    await api.delete(`/v3/appraisal-criteria/${id}/`);
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: extractApiError(err) };
  }
};


// export const getAppraisalScores = async (
//   interventionId?: string
// ): Promise<CriteriaAppraisalScore[]> => {
//   try {
//     const params = interventionId ? { intervention: interventionId } : {};
//     const res = await api.get<PaginatedResponse<CriteriaAppraisalScore>>(
//       "/v3/appraisal-scores/",
//       { params }
//     );
//     return res.data.results ?? [];
//   } catch {
//     return [];
//   }
// };

// export const createAppraisalScore = async (
//   body: CriteriaAppraisalScoreCreatePayload
// ): Promise<{ data: CriteriaAppraisalScore | null; error: string | null }> => {
//   try {
//     const res = await api.post<CriteriaAppraisalScore>("/v3/appraisal-scores/", body);
//     return { data: res.data, error: null };
//   } catch (err) {
//     return { data: null, error: extractApiError(err) };
//   }
// };

// export const bulkCreateAppraisalScores = async (
//   payload: BulkAppraisalScorePayload
// ): Promise<{ data: CriteriaAppraisalScore[] | null; error: string | null }> => {
//   try {
//     const res = await api.post<CriteriaAppraisalScore[]>("/v3/appraisal-scores/bulk/", payload);
//     return { data: res.data, error: null };
//   } catch (err) {
//     return { data: null, error: extractApiError(err) };
//   }
// };

// export const getAppraisalScoresSummary = async (
//   interventionId: string
// ): Promise<CriteriaAppraisalScore[]> => {
//   try {
//     const res = await api.get<CriteriaAppraisalScore[]>("/v3/appraisal-scores/summary/", {
//       params: { intervention: interventionId },
//     });
//     return Array.isArray(res.data) ? res.data : [];
//   } catch {
//     return [];
//   }
// };