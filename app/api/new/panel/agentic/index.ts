
import api from "@/app/api/auth";
import {
  AIProviderKey, AIProviderKeyPayload, AIModel, AIModelPayload,
  PanelAppraisal, PanelAppraisalDetail,
  GenerateResult, BatchGenerateResult, TestRunsResult, TargetType,
  AIProviderKeyUpdate,
} from "@/types/new/agentic";
import { ApiResponse } from "../../shared";


export const getAIKeys = async (): Promise<AIProviderKey[]> => {
  try {
    const res = await api.get<ApiResponse<AIProviderKey[]>>("/v3/ai-keys/");
    return res.data.data ?? [];
  } catch {
    return [];
  }
};

export const createAIKey = async (body: AIProviderKeyPayload): Promise<AIProviderKey | null> => {
  try {
    const res = await api.post<ApiResponse<AIProviderKey>>("/v3/ai-keys/", body);
    return res.data.data ?? null;
  } catch {
    return null;
  }
};

export const updateAIKey = async (
  id: string,
  body: AIProviderKeyUpdate
): Promise<AIProviderKey | null> => {
  try {
    const res = await api.patch<ApiResponse<AIProviderKey>>(`/v3/ai-keys/${id}/`, body);
    return res.data.data ?? null;
  } catch {
    return null;
  }
};

export const deleteAIKey = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/v3/ai-keys/${id}/`);
    return true;
  } catch {
    return false;
  }
};


export const getAIModels = async (): Promise<AIModel[]> => {
  try {
    const res = await api.get<ApiResponse<AIModel[]>>("/v3/ai-models/");
    return res.data.data ?? [];
  } catch {
    return [];
  }
};

export const createAIModel = async (body: AIModelPayload): Promise<AIModel | null> => {
  try {
    const res = await api.post<AIModel>("/v3/ai-models/", body);
    return res.data;
  } catch {
    return null;
  }
};

export const updateAIModel = async (id: string, body: Partial<AIModelPayload>): Promise<AIModel | null> => {
  try {
    const res = await api.patch<AIModel>(`/v3/ai-models/${id}/`, body);
    return res.data;
  } catch {
    return null;
  }
};

export const deleteAIModel = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/v3/ai-models/${id}/`);
    return true;
  } catch {
    return false;
  }
};


export const generateAppraisal = async (
  targetType: TargetType,
  targetId: string,
  extraGuidance = ""
): Promise<GenerateResult | null> => {
  try {
    const res = await api.post<ApiResponse<GenerateResult>>("/v3/appraisals/generate/", {
      target_type: targetType,
      target_id: targetId,
      extra_guidance: extraGuidance,
    });
    return res.data.data ?? null;
  } catch (err: any) {
    // surface config/connection/processing errors to the caller
    const d = err?.response?.data;
    if (d) {
      return {
        success: false,
        target_type: targetType,
        target_id: targetId,
        scores: [],
        error: d.message,
        error_code: d.error_code,
      };
    }
    return null;
  }
};

export const generateBatch = async (
  targets: { target_type: TargetType; target_id: string }[]
): Promise<BatchGenerateResult | null> => {
  try {
    const res = await api.post<ApiResponse<BatchGenerateResult>>("/v3/appraisals/generate-batch/", { targets });
    return res.data.data ?? null;
  } catch {
    return null;
  }
};

// ── Results ───────────────────────────────────────────────────────────────────

export const getAppraisals = async (targetId?: string): Promise<PanelAppraisal[]> => {
  try {
    const params = targetId ? { target: targetId } : undefined;
    const res = await api.get<ApiResponse<PanelAppraisal[]>>("/v3/appraisals/", { params });
    return res.data.data ?? [];
  } catch {
    return [];
  }
};

export const getAppraisalById = async (id: string): Promise<PanelAppraisalDetail | null> => {
  try {
    const res = await api.get<ApiResponse<PanelAppraisalDetail>>(`/v3/appraisals/${id}/`);
    return res.data.data ?? null;
  } catch {
    return null;
  }
};

// ── Multi-run accuracy ────────────────────────────────────────────────────────

export const runAccuracyTest = async (
  targetType: TargetType,
  targetId: string,
  runs = 3
): Promise<TestRunsResult | null> => {
  try {
    const res = await api.post<ApiResponse<TestRunsResult>>("/v3/appraisals/test-runs/", {
      target_type: targetType,
      target_id: targetId,
      runs,
    });
    return res.data.data ?? null;
  } catch {
    return null;
  }
};