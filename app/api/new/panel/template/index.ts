import api from "@/app/api/auth";
import { DecisionTemplate, GenerateInput, GenerateResult, Write } from "@/types/new/decision-template";

const errMsg = (e: any): string =>
  e?.response?.data?.error ?? e?.response?.data?.detail ?? e?.message ?? "Something went wrong";

/** All templates with full criteria — the comparison grid. */
export const getAllTemplatesFull = async (): Promise<DecisionTemplate[]> => {
  try {
    const res = await api.get<DecisionTemplate[]>(`/v3/decision-templates/?full=1`);
    return res.data ?? [];
  } catch {
    return [];
  }
};

export const getTemplate = async (id: string): Promise<DecisionTemplate | null> => {
  try {
    const res = await api.get<DecisionTemplate>(`/v3/decision-templates/${id}/`);
    return res.data ?? null;
  } catch {
    return null;
  }
};

/** Generate = create. POST to the collection builds templates from criteria + rules + evidence. */
export const generateTemplates = async (payload?: GenerateInput): Promise<Write<GenerateResult>> => {
  try {
    const res = await api.post<GenerateResult>(`/v3/decision-templates/`, payload ?? {});
    return { ok: true, data: res.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const deleteTemplate = async (id: string): Promise<Write<null>> => {
  try {
    await api.delete(`/v3/decision-templates/${id}/`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};