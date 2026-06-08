import api from "../../auth";
import { AssessmentCriteria, AssessmentEvidence } from "@/types/new/assessment";

export const getAssessmentCriteria = async (): Promise<AssessmentCriteria[]> => {
  const res = await api.get("/v3/assessment-criteria/");
  return res.data.results ?? res.data ?? [];
};

export const getAssessmentEvidence = async (): Promise<AssessmentEvidence[]> => {
  const res = await api.get("/v3/assessment-evidence/");
  return res.data.results ?? res.data ?? [];
};

export const createAssessmentEvidence = async (
  values: Partial<AssessmentEvidence>
): Promise<{ data?: AssessmentEvidence; error?: string }> => {
  try {
    const res = await api.post<AssessmentEvidence>("/v3/assessment-evidence/", values);
    return { data: res.data };
  } catch (err: any) {
    return { error: err?.response?.data?.detail ?? "Failed to create evidence." };
  }
};

export const updateAssessmentEvidence = async (
  id: string,
  values: Partial<AssessmentEvidence>
): Promise<{ data?: AssessmentEvidence; error?: string }> => {
  try {
    const res = await api.patch<AssessmentEvidence>(`/v3/assessment-evidence/${id}/`, values);
    return { data: res.data };
  } catch (err: any) {
    return { error: err?.response?.data?.detail ?? "Failed to update evidence." };
  }
};

export const deleteAssessmentEvidence = async (
  id: string
): Promise<{ ok: boolean; error?: string }> => {
  try {
    await api.delete(`/v3/assessment-evidence/${id}/`);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.response?.data?.detail ?? "Failed to delete." };
  }
};