import { InterventionSearchResult } from "@/types/new/criteria-info";
import { ApiResponse } from "../shared";
import api from "../../auth";


import { EvidenceInterventionRef } from "@/types/new/assessment";
import { ProgramProposal } from "@/types/new/program";

export const searchInterventions = async (q: string): Promise<InterventionSearchResult[]> => {
  if (!q || q.trim().length < 1) return [];
  try {
    const res = await api.get<ApiResponse<InterventionSearchResult[]>>("/v3/interventions/search/", {
      params: { q: q.trim().slice(0, 20) },
    });
    return res.data.data ?? [];
  } catch {
    return [];
  }
};






const list = (res: any) => res?.data?.data ?? res?.data?.results ?? res?.data ?? [];

/**
 * Fetch ALL interventions once. Callers keep the result in memory and filter
 * client-side (see filterInterventions) so per-keystroke search never hits the DB.
 */
export async function getInterventions(): Promise<EvidenceInterventionRef[]> {
  try {
    const res = await api.get("/v1/proposals/");
    return list(res).map((p: any) => ({
      id: p.id,                                 
      reference_number: p.reference_number,
      intervention_name: p.intervention_name ?? null,
      intervention_type: p.intervention_type ?? null,
    }));
  } catch {
    return [];
  }
}

/** Fetch ALL national program proposals once (same in-memory-search pattern). */
export async function getNationalPrograms(): Promise<ProgramProposal[]> {
  try {
    const res = await api.get("/v3/program-proposals/");
    return list(res);
  } catch {
    return [];
  }
}

/* ---- pure client-side filters (no network) ---- */

export function filterInterventions(items: EvidenceInterventionRef[], q: string): EvidenceInterventionRef[] {
  const s = q.trim().toLowerCase();
  if (!s) return items;
  return items.filter(
    (i) =>
      i.reference_number?.toLowerCase().includes(s) ||
      (i.intervention_name ?? "").toLowerCase().includes(s)
  );
}

export function filterPrograms(items: ProgramProposal[], q: string): ProgramProposal[] {
  const s = q.trim().toLowerCase();
  if (!s) return items;
  return items.filter(
    (p) =>
      p.reference_number?.toLowerCase().includes(s) ||
      (p.title ?? "").toLowerCase().includes(s)
  );
}