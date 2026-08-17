import api from "@/app/api/auth";
import {
  EvidenceRow, EvidenceTarget, GenerateInput, GenerateResult, ListResult,
} from "@/types/new/decision-template";

const BASE = "/v3/decision-templates/";

const errMsg = (e: any): string =>
  e?.response?.data?.error ?? e?.response?.data?.detail ?? e?.message ?? "Something went wrong";

const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data) as T;

/** Compact index — targets that have evidence. */
export const listTargets = async (kind?: EvidenceRow["kind"]): Promise<EvidenceRow[]> => {
  try {
    const res = await api.get(BASE, { params: kind ? { kind } : {} });
    return unwrap<ListResult>(res).targets ?? [];
  } catch (e) {
    throw new Error(errMsg(e));
  }
};

/** Full evidence payload for one target. */
export const getTarget = async (id: string): Promise<EvidenceTarget> => {
  try {
    const res = await api.get(`${BASE}${id}`);
    return unwrap<EvidenceTarget>(res);
  } catch (e) {
    throw new Error(errMsg(e));
  }
};

/** Page load — full feed, read-only, for everyone. */
export const generatePayload = async (kind?: EvidenceTarget["kind"]): Promise<EvidenceTarget[]> => {
  try {
    const res = await api.get(BASE, { params: kind ? { kind } : {} });
    return unwrap<GenerateResult>(res).targets ?? [];
  } catch (e) {
    throw new Error(errMsg(e));
  }
};


export const regeneratePayload = async (body: GenerateInput = {}): Promise<EvidenceTarget[]> => {
  try {
    const res = await api.post(BASE, body);
    return unwrap<GenerateResult>(res).targets ?? [];
  } catch (e) {
    throw new Error(errMsg(e));
  }
};



export const getTargetDetailed = async (id: string): Promise<EvidenceTarget> => {
  try {
    const res = await api.get(`${BASE}${id}/detailed/`);
    return unwrap<EvidenceTarget>(res);
  } catch (e) {
    throw new Error(errMsg(e));
  }
};