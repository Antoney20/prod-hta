
import api from "@/app/api/auth";
import { WeightingReport, WeightingReportSuccess } from "@/types/new/weighting";

export const getWeightingReport = async (
  interventionIds?: string[]
): Promise<{ data: WeightingReportSuccess | null; error: string | null }> => {
  try {
    const params = interventionIds?.length
      ? { intervention_ids: interventionIds.join(",") }
      : undefined;

    const res = await api.get<WeightingReport>("/v3/weighting/", { params });

    if (!res.data.success) {
      return { data: null, error: res.data.message ?? res.data.error ?? "Unknown error" };
    }

    return { data: res.data, error: null };
  } catch (err: any) {
    const message =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Failed to fetch weighting report";
    return { data: null, error: message };
  }
};