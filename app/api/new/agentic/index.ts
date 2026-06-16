import api from "../../auth";
import {
  AgenticEvidence,
  GenerateEvidencePayload,
  GenerateSummary,
} from "@/types/new/agentic";
 

const unwrap = (res: any) => res?.data?.data ?? res?.data?.results ?? res?.data ?? [];
const errMsg = (e: any, fb = "Something went wrong"): string =>
  e?.response?.data?.message || e?.response?.data?.detail || e?.message || fb;
 
export const getAgenticEvidence = async (): Promise<AgenticEvidence[]> => {
  try {
    const res = await api.get("/v3/agentic/");
    return unwrap(res);
  } catch {
    return [];
  }
};
 
export const getAgenticEvidenceById = async (
  id: string,
): Promise<AgenticEvidence | null> => {
  try {
    const res = await api.get(`/v3/agentic/${id}/`);
    const data = res?.data?.data ?? res?.data ?? null;
    return data && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
};
 
export const generateAgenticEvidence = async (
  payload: GenerateEvidencePayload,
): Promise<{ ok: boolean; data?: AgenticEvidence; error?: string }> => {
  try {
    const res = await api.post("/v3/agentic/generate/", payload);
    return { ok: true, data: res?.data?.data ?? res?.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};
 
export const generateAllAgenticEvidence = async (): Promise<{
  ok: boolean;
  summary?: GenerateSummary;
  error?: string;
}> => {
  try {
    const res = await api.post("/v3/agentic/generate-all/");
    return { ok: true, summary: res?.data?.data ?? res?.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};