import api from "@/app/api/auth";
import type {
  BuildFromSwgInput,
  DecisionInput,
  PackageSummary,
  ProposedPackage,
  RevisedPackage,
} from "@/types/panel/benefits-package";

export const pkgErr = (e: any): string =>
  e?.response?.data?.message ??
  e?.response?.data?.error ??
  e?.response?.data?.detail ??
  e?.message ??
  "Something went wrong";

const payload = <T,>(res: any): T => {
  const b = res?.data;
  return b && typeof b === "object" && "success" in b && "data" in b ? b.data : b;
};

/* -------- proposed ------------------------------------------------- */

export const listProposed = async (fund?: string): Promise<PackageSummary[]> => {
  try {
    const q = fund ? `?fund=${encodeURIComponent(fund)}` : "";
    return payload<PackageSummary[]>(await api.get(`/v3/proposed-packages/${q}`)) ?? [];
  } catch {
    return [];
  }
};

/** Grouped view: interventions by package → service, with current package alongside. */
export const overviewProposed = async (fund?: string): Promise<ProposedPackage[]> => {
  try {
    const q = fund ? `?fund=${encodeURIComponent(fund)}` : "";
    return payload<ProposedPackage[]>(await api.get(`/v3/proposed-packages/overview/${q}`)) ?? [];
  } catch {
    return [];
  }
};

export const getProposed = async (id: string): Promise<ProposedPackage | null> => {
  try {
    return payload<ProposedPackage>(await api.get(`/v3/proposed-packages/${id}/`)) ?? null;
  } catch {
    return null;
  }
};

export const setDecision = async (id: string, body: DecisionInput) =>
  payload(await api.post(`/v3/proposed-packages/${id}/decision/`, body));

export const buildFromSwg = async (body: BuildFromSwgInput) =>
  payload(await api.post(`/v3/proposed-packages/build-from-swg/`, body));

export const promoteProposed = async (id: string): Promise<RevisedPackage> =>
  payload<RevisedPackage>(await api.post(`/v3/proposed-packages/${id}/promote/`, {}));

export const deleteProposed = async (id: string): Promise<void> => {
  await api.delete(`/v3/proposed-packages/${id}/`);
};

/* -------- revised (included only) ---------------------------------- */

export const listRevised = async (fund?: string): Promise<RevisedPackage[]> => {
  try {
    const q = fund ? `?fund=${encodeURIComponent(fund)}` : "";
    return payload<RevisedPackage[]>(await api.get(`/v3/revised-packages/${q}`)) ?? [];
  } catch {
    return [];
  }
};

export const getRevised = async (id: string): Promise<RevisedPackage | null> => {
  try {
    return payload<RevisedPackage>(await api.get(`/v3/revised-packages/${id}/`)) ?? null;
  } catch {
    return null;
  }
};

export const createProposed = async (
  body: { name: string; fund?: string; data?: Record<string, unknown>; items?: unknown[] },
): Promise<{ id: string }> =>
  payload<{ id: string }>(await api.post(`/v3/proposed-packages/`, body));