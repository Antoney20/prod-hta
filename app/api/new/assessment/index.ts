import api from "../../auth";
import {
  AssessmentEvidence,
  AssessmentEvidencePayload,
  EvidenceInterventionRef,
} from "@/types/new/assessment";

// backend wraps everything in { success, message, data }
const unwrap = (res: any) => res?.data?.data ?? res?.data?.results ?? res?.data ?? [];
const errMsg = (e: any, fb = "Something went wrong"): string =>
  e?.response?.data?.message || e?.response?.data?.detail || e?.message || fb;

export const getAssessmentEvidence = async (): Promise<AssessmentEvidence[]> => {
  try {
    const res = await api.get("/v3/assessment-evidence/");
    return unwrap(res);
  } catch {
    return [];
  }
};

export const getAssessmentEvidenceById = async (
  id: number | string,
): Promise<AssessmentEvidence | null> => {
  try {
    const res = await api.get(`/v3/assessment-evidence/${id}/`);
    const data = res?.data?.data ?? res?.data ?? null;
    return data && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
};

// lightweight intervention autocomplete (ref no / name)
export const searchInterventions = async (q: string): Promise<EvidenceInterventionRef[]> => {
  if (!q.trim()) return [];
  try {
    const res = await api.get("/v1/interventions/search/", { params: { q } });
    return res.data?.data ?? [];
  } catch {
    return [];
  }
};

// files + parallel descriptions[] ; ids repeated as form fields
function buildEvidenceForm(payload: AssessmentEvidencePayload): FormData {
  const fd = new FormData();
  if (payload.summary !== undefined) fd.append("summary", payload.summary ?? "");
  (payload.intervention_ids ?? []).forEach((id) => fd.append("intervention_ids", String(id)));
  (payload.program_proposal_ids ?? []).forEach((id) => fd.append("program_proposal_ids", String(id)));
  (payload.documents ?? []).forEach((d) => {
    fd.append("files", d.file);
    fd.append("descriptions", d.description ?? ""); // index-aligned with files
  });
  return fd;
}

export const createAssessmentEvidence = async (
  payload: AssessmentEvidencePayload
): Promise<{ data?: AssessmentEvidence; error?: string }> => {
  try {
    const res = await api.post("/v3/assessment-evidence/", buildEvidenceForm(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { data: res.data?.data as AssessmentEvidence };
  } catch (err: any) {
    return { error: errMsg(err, "Failed to create evidence.") };
  }
};

export const updateAssessmentEvidence = async (
  id: string,
  payload: AssessmentEvidencePayload
): Promise<{ data?: AssessmentEvidence; error?: string }> => {
  try {
    const res = await api.patch(`/v3/assessment-evidence/${id}/`, buildEvidenceForm(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { data: res.data?.data as AssessmentEvidence };
  } catch (err: any) {
    return { error: errMsg(err, "Failed to update evidence.") };
  }
};

export const deleteAssessmentEvidence = async (
  id: string
): Promise<{ ok: boolean; error?: string }> => {
  try {
    await api.delete(`/v3/assessment-evidence/${id}/`);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: errMsg(err, "Failed to delete.") };
  }
};