import api from "@/app/api/auth";
import { CoverageMatrix, CoverageDetail, OverallStatus } from "@/types/new/evidence-coverage";


export const getCoverage = async (status?: OverallStatus): Promise<CoverageMatrix | null> => {
  try {
    const q = status ? `?status=${status}` : "";
    const res = await api.get<CoverageMatrix>(`/v3/evidence-coverage/${q}`);
    return res.data ?? null;
  } catch {
    return null;
  }
};


/**
 * Fetch one target's breakdown by id. The backend resolves whether the id
 * is an intervention or a national proposal, so the caller needs no kind.
 */
export const getCoverageDetail = async (id: string): Promise<CoverageDetail | null> => {
  try {
    const res = await api.get<CoverageDetail>(`/v3/evidence-coverage/${id}/`);
    return res.data ?? null;
  } catch {
    return null;
  }
};