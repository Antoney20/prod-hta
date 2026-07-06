import api from "@/app/api/auth";
import {
  CriteriaRule, RuleInput, GuideDocument, GuideInput, BulkRuleResult, Write,
} from "@/types/new/criteria-rules";

const errMsg = (e: any): string =>
  e?.response?.data?.error ?? e?.response?.data?.detail ?? e?.message ?? "Something went wrong";


export const getRules = async (criterion?: string): Promise<CriteriaRule[]> => {
  try {
    const q = criterion ? `?criterion=${criterion}` : "";
    const res = await api.get<CriteriaRule[]>(`/v3/criteria-rules/${q}`);
    return res.data ?? [];
  } catch {
    return [];
  }
};

export const getRule = async (id: string): Promise<CriteriaRule | null> => {
  try {
    const res = await api.get<CriteriaRule>(`/v3/criteria-rules/${id}/`);
    return res.data ?? null;
  } catch {
    return null;
  }
};

export const createRule = async (payload: RuleInput): Promise<Write<CriteriaRule>> => {
  try {
    const res = await api.post<CriteriaRule>(`/v3/criteria-rules/`, payload);
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const updateRule = async (id: string, payload: RuleInput): Promise<Write<CriteriaRule>> => {
  try {
    const res = await api.patch<CriteriaRule>(`/v3/criteria-rules/${id}/`, payload);
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const deleteRule = async (id: string): Promise<Write<null>> => {
  try {
    await api.delete(`/v3/criteria-rules/${id}/`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const bulkUploadRules = async (rules: RuleInput[]): Promise<Write<BulkRuleResult>> => {
  try {
    const res = await api.post<BulkRuleResult>(`/v3/criteria-rules/bulk/`, { rules });
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};


export const addDocument = async (ruleId: string, payload: GuideInput): Promise<Write<GuideDocument>> => {
  try {
    let res;
    if (payload.file) {
      const fd = new FormData();
      fd.append("label", payload.label);
      if (payload.description) fd.append("description", payload.description);
      if (payload.link) fd.append("link", payload.link);
      fd.append("file", payload.file);
      res = await api.post<GuideDocument>(`/v3/criteria-rules/${ruleId}/documents/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      res = await api.post<GuideDocument>(`/v3/criteria-rules/${ruleId}/documents/`, {
        label: payload.label,
        description: payload.description ?? "",
        link: payload.link ?? "",
      });
    }
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const deleteDocument = async (docId: string): Promise<Write<null>> => {
  try {
    await api.delete(`/v3/criteria-rules/documents/${docId}/`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};