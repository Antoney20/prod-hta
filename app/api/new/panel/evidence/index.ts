import api from "@/app/api/auth";
import {
  Criterion,
  CriterionEvidence,
  CriterionInput,
  EvidenceInput,
  BulkResult,
  Write,
} from "@/types/new/evidence-panel";

const errMsg = (e: any): string =>
  e?.response?.data?.error ?? e?.response?.data?.detail ?? e?.message ?? "Something went wrong";


export const getCriteria = async (activeOnly?: boolean): Promise<Criterion[]> => {
  try {
    const q = activeOnly ? "?active=true" : "";
    const res = await api.get<Criterion[]>(`/v3/criteria/${q}`);
    return res.data ?? [];
  } catch {
    return [];
  }
};

export const getCriterion = async (id: string): Promise<Criterion | null> => {
  try {
    const res = await api.get<Criterion>(`/v3/criteria/${id}/`);
    return res.data ?? null;
  } catch {
    return null;
  }
};

export const createCriterion = async (payload: CriterionInput): Promise<Write<Criterion>> => {
  try {
    const res = await api.post<Criterion>(`/v3/criteria/`, payload);
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const updateCriterion = async (
  id: string,
  payload: CriterionInput
): Promise<Write<Criterion>> => {
  try {
    const res = await api.patch<Criterion>(`/v3/criteria/${id}/`, payload);
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const configureCriterion = async (
  id: string,
  payload: CriterionInput
): Promise<Write<Criterion>> => {
  try {
    const res = await api.patch<Criterion>(`/v3/criteria/${id}/panel/`, payload);
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const deleteCriterion = async (id: string): Promise<Write<null>> => {
  try {
    await api.delete(`/v3/criteria/${id}/`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

/* ── evidence ─────────────────────────────── */

export const getEvidence = async (params?: {
  criterion?: string;
  intervention?: string;
  national_proposal?: string;
}): Promise<CriterionEvidence[]> => {
  try {
    const qs = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => v) as [string, string][]
    ).toString();
    const res = await api.get<{ results: CriterionEvidence[] }>(
      `/v3/evidence/${qs ? `?${qs}` : ""}`
    );
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

export const createEvidence = async (
  payload: EvidenceInput
): Promise<Write<CriterionEvidence>> => {
  try {
    const res = await api.post<CriterionEvidence>(`/v3/evidence/`, payload);
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const updateEvidence = async (
  id: string,
  payload: Partial<EvidenceInput>
): Promise<Write<CriterionEvidence>> => {
  try {
    const res = await api.patch<CriterionEvidence>(`/v3/evidence/${id}/`, payload);
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const deleteEvidence = async (id: string): Promise<Write<null>> => {
  try {
    await api.delete(`/v3/evidence/${id}/`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const bulkUploadEvidence = async (
  rows: EvidenceInput[]
): Promise<Write<BulkResult>> => {
  try {
    const res = await api.post<BulkResult>(`/v3/evidence/bulk-upload/`, { rows });
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const bulkDeleteEvidence = async (
  ids: string[]
): Promise<Write<{ deleted: number }>> => {
  try {
    const res = await api.post<{ deleted: number }>(`/v3/evidence/bulk-delete/`, { ids });
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};