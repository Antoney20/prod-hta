import api from "../../auth";
import {
  EvidenceCriterion,
  EvidenceExtraction,
  EvidenceExtractionPayload,
} from "@/types/new/evidence-extraction";

// backend wraps everything in { success, message, data }
const unwrap = (res: any) => res?.data?.data ?? res?.data?.results ?? res?.data ?? [];
const errMsg = (e: any, fb = "Something went wrong"): string =>
  e?.response?.data?.message || e?.response?.data?.detail || e?.message || fb;

const EXTRACT = "/v3/evidence-extractions/";
const CRITERIA = "/v3/evidence-criteria/";


export const getEvidenceCriteria = async (
  activeOnly = false,
): Promise<EvidenceCriterion[]> => {
  try {
    const res = await api.get(CRITERIA, { params: activeOnly ? { active: 1 } : {} });
    return unwrap(res);
  } catch {
    return [];
  }
};

export const getEvidenceCriterionById = async (
  id: string,
): Promise<EvidenceCriterion | null> => {
  try {
    const res = await api.get(`${CRITERIA}${id}/`);
    const data = res?.data?.data ?? res?.data ?? null;
    return data && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
};

/* ----------------------------- extractions ----------------------------- */
export const getEvidenceExtractions = async (): Promise<EvidenceExtraction[]> => {
  try {
    const res = await api.get(EXTRACT);
    return unwrap(res);
  } catch {
    return [];
  }
};

export const getEvidenceExtractionById = async (
  id: string | number,
): Promise<EvidenceExtraction | null> => {
  try {
    const res = await api.get(`${EXTRACT}${id}/`);
    const data = res?.data?.data ?? res?.data ?? null;
    return data && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
};


export const createEvidenceExtraction = async (
  payload: EvidenceExtractionPayload,
): Promise<EvidenceExtraction> => {
  try {
    const res = await api.post(EXTRACT, payload);
    return unwrap(res);
  } catch (e) {
    throw new Error(errMsg(e, "Could not create the evidence extraction"));
  }
};


export const updateEvidenceExtraction = async (
  id: string | number,
  payload: EvidenceExtractionPayload,
): Promise<EvidenceExtraction> => {
  try {
    const res = await api.patch(`${EXTRACT}${id}/`, payload);
    return unwrap(res);
  } catch (e) {
    throw new Error(errMsg(e, "Could not update the evidence extraction"));
  }
};

// delete: admin only.
export const deleteEvidenceExtraction = async (
  id: string | number,
): Promise<void> => {
  try {
    await api.delete(`${EXTRACT}${id}/`);
  } catch (e) {
    throw new Error(errMsg(e, "Could not delete the evidence extraction"));
  }
};


export const createEvidenceCriterion = async (
  payload: import("@/types/new/evidence-extraction").EvidenceCriterionPayload,
): Promise<EvidenceCriterion> => {
  try {
    const res = await api.post(CRITERIA, payload);
    return unwrap(res);
  } catch (e) {
    throw new Error(errMsg(e, "Could not create the criterion"));
  }
};
 
export const updateEvidenceCriterion = async (
  id: string,
  payload: import("@/types/new/evidence-extraction").EvidenceCriterionPayload,
): Promise<EvidenceCriterion> => {
  try {
    const res = await api.patch(`${CRITERIA}${id}/`, payload);
    return unwrap(res);
  } catch (e) {
    throw new Error(errMsg(e, "Could not update the criterion"));
  }
};

export const deleteEvidenceCriterion = async (id: string): Promise<void> => {
  try {
    await api.delete(`${CRITERIA}${id}/`);
  } catch (e) {
    throw new Error(errMsg(e, "Could not delete the criterion"));
  }
};