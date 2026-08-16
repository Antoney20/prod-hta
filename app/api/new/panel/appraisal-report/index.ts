import api from "@/app/api/auth";
import type {
  AppraisalReport,
  AppraisalReportInput,
  AppraisalReportSummary,
} from "@/types/panel/appraisal-report";

export const reportErr = (e: any): string =>
  e?.response?.data?.message ??
  e?.response?.data?.error ??
  e?.response?.data?.detail ??
  e?.message ??
  "Something went wrong";

/** Unwrap the { ok|success, data, message } envelope; pass raw bodies through. */
const unwrap = <T,>(res: any): T => {
  const b = res?.data;
  if (b && typeof b === "object" && ("ok" in b || "success" in b) && "data" in b) {
    return b.data as T;
  }
  return b as T;
};

const BASE = "/v3/appraised-lists"; // adjust prefix if your router mounts elsewhere

export const listReports = async (): Promise<AppraisalReportSummary[]> => {
  try {
    return unwrap<AppraisalReportSummary[]>(await api.get(`${BASE}/`)) ?? [];
  } catch {
    return [];
  }
};

export const getReport = async (id: string): Promise<AppraisalReport | null> => {
  try {
    return unwrap<AppraisalReport>(await api.get(`${BASE}/${id}/`)) ?? null;
  } catch {
    return null;
  }
};

export const createReport = async (
  input: AppraisalReportInput,
): Promise<{ id: string }> => unwrap<{ id: string }>(await api.post(`${BASE}/`, input));

export const updateReport = async (
  id: string,
  input: AppraisalReportInput,
): Promise<{ id: string }> => unwrap<{ id: string }>(await api.patch(`${BASE}/${id}/`, input));

export const deleteReport = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`${BASE}/${id}/`);
    return true;
  } catch {
    return false;
  }
};