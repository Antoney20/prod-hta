import api from "../../auth";
import type {
  InterventionPhase,
  InterventionPhasePayload,
  PhaseBulkUploadRow,
  PhaseBulkUploadResult,
  GroupedPhase,
} from "@/types/new/intervention-phase";

const unwrap = (res: any) => res?.data?.data ?? res?.data?.results ?? res?.data ?? [];
const one = (res: any) => {
  const d = res?.data?.data ?? res?.data ?? null;
  return d && !Array.isArray(d) ? d : null;
};
export const errMsg = (e: any, fb = "Something went wrong"): string =>
  e?.response?.data?.message || e?.response?.data?.detail || e?.message || fb;

const PHASE = "/v3/intervention-phases/";

export const getPhases = async (): Promise<InterventionPhase[]> => {
  try {
    return unwrap(await api.get(PHASE));
  } catch {
    return [];
  }
};

export const getPhase = async (id: number | string): Promise<InterventionPhase | null> => {
  try {
    return one(await api.get(`${PHASE}${id}/`));
  } catch {
    return null;
  }
};

export const createPhase = async (payload: InterventionPhasePayload): Promise<InterventionPhase> =>
  one(await api.post(PHASE, payload)) as InterventionPhase;

export const updatePhase = async (
  id: number | string,
  payload: Partial<InterventionPhasePayload>,
): Promise<InterventionPhase> =>
  one(await api.patch(`${PHASE}${id}/`, payload)) as InterventionPhase;

export const deletePhase = async (id: number | string): Promise<void> => {
  await api.delete(`${PHASE}${id}/`);
};

/* ----------------------------- bulk ----------------------------- */
export const bulkUploadPhases = async (rows: PhaseBulkUploadRow[]): Promise<PhaseBulkUploadResult> =>
  unwrap(await api.post(`${PHASE}bulk-upload/`, { rows })) as PhaseBulkUploadResult;

/* ----------------------------- single link ----------------------------- */
// Proposal endpoints don't allow PATCH of `phase`, so single-link reuses the bulk path.
export const linkOne = (phaseName: string, reference_number: string): Promise<PhaseBulkUploadResult> =>
  bulkUploadPhases([{ name: phaseName, reference_number }]);

/* ----------------------------- grouped (read path) ----------------------------- */
export const getGroupedPhases = async (): Promise<GroupedPhase[]> => {
  try {
    return unwrap(await api.get(`${PHASE}grouped/`));
  } catch {
    return [];
  }
};

export const unlinkProposal = async (phaseId: number, reference_number: string): Promise<void> => {
  await api.post(`${PHASE}${phaseId}/unlink/`, { reference_number });
};