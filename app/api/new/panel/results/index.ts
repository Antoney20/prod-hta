
import api from "@/app/api/auth";
import {
  AppraisalScoreResult,
  EditScorePayload,
  BulkDeletePayload,
  BulkDeleteResult,
  WriteResult,
 AgenticResultRow } from "@/types/new/agentic-results";

const BASE = "/v3/appraisal-scores";

export const listAgenticResults = async (target?: string): Promise<AgenticResultRow[]> => {
  try {
    const res = await api.get(`${BASE}/`, { params: target ? { target } : undefined });
    return (res.data?.data ?? []) as AgenticResultRow[];
  } catch {
    return [];
  }
};

export const editScore = async (
  scoreId: string,
  payload: EditScorePayload
): Promise<WriteResult<AppraisalScoreResult>> => {
  try {
    const res = await api.patch(`${BASE}/${scoreId}/edit/`, payload);
    return { ok: true, data: res.data?.data as AppraisalScoreResult };
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.message ?? "Failed to update score." };
  }
};

export const deleteScore = async (scoreId: string): Promise<WriteResult<{ id: string }>> => {
  try {
    const res = await api.delete(`${BASE}/${scoreId}/`);
    return { ok: true, data: res.data?.data as { id: string } };
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.message ?? "Failed to delete score." };
  }
};

export const deleteAppraisal = async (appraisalId: string): Promise<WriteResult<{ id: string }>> => {
  try {
    const res = await api.delete(`${BASE}/appraisals/${appraisalId}/`);
    return { ok: true, data: res.data?.data as { id: string } };
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.message ?? "Failed to delete appraisal." };
  }
};

export const bulkDelete = async (
  payload: BulkDeletePayload
): Promise<WriteResult<BulkDeleteResult>> => {
  try {
    const res = await api.post(`${BASE}/bulk-delete/`, payload);
    return { ok: true, data: res.data?.data as BulkDeleteResult };
  } catch (e: any) {
    return { ok: false, error: e?.response?.data?.message ?? "Bulk delete failed." };
  }
};