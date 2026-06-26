// app/api/new/intervention-package/index.ts
import api from "../../auth";
import type {
  InterventionPackage,
  InterventionPackagePayload,
  BulkUploadRow,
  BulkUploadResult,
  GroupedPackage,
} from "@/types/new/intervention-package";

// backend wraps everything in { success, message, data }
const unwrap = (res: any) => res?.data?.data ?? res?.data?.results ?? res?.data ?? [];
const one = (res: any) => {
  const d = res?.data?.data ?? res?.data ?? null;
  return d && !Array.isArray(d) ? d : null;
};
export const errMsg = (e: any, fb = "Something went wrong"): string =>
  e?.response?.data?.message || e?.response?.data?.detail || e?.message || fb;

// router.register(r"intervention-package", ...). Adjust the version prefix if yours differs.
const PKG = "/v3/intervention-package/";


export const getPackages = async (): Promise<InterventionPackage[]> => {
  try {
    const res = await api.get(PKG);
    return unwrap(res);
  } catch {
    return [];
  }
};

export const getPackage = async (id: number | string): Promise<InterventionPackage | null> => {
  try {
    return one(await api.get(`${PKG}${id}/`));
  } catch {
    return null;
  }
};

export const createPackage = async (payload: InterventionPackagePayload): Promise<InterventionPackage> => {
  const res = await api.post(PKG, payload);
  return one(res) as InterventionPackage;
};

export const updatePackage = async (
  id: number | string,
  payload: Partial<InterventionPackagePayload>,
): Promise<InterventionPackage> => {
  const res = await api.patch(`${PKG}${id}/`, payload);
  return one(res) as InterventionPackage;
};

export const deletePackage = async (id: number | string): Promise<void> => {
  await api.delete(`${PKG}${id}/`);
};

/* ----------------------------- bulk ----------------------------- */
// POSTs already-parsed rows. The handler (handler.ts) turns a spreadsheet into these.
export const bulkUploadPackages = async (rows: BulkUploadRow[]): Promise<BulkUploadResult> => {
  const res = await api.post(`${PKG}bulk-upload/`, { rows });
  return unwrap(res) as BulkUploadResult;
};

/* ----------------------------- single link ----------------------------- */
// Attach ONE intervention / national program to an existing package by PATCHing
// the proposal's `package` FK directly. Requires `package` to be writable on the
// proposal serializer (fields="__all__" gives you this for free).
export const linkInterventionToPackage = async (
  interventionId: string | number,
  packageId: number | null,
): Promise<void> => {
  await api.patch(`/v1/proposals/${interventionId}/`, { package: packageId });
};

export const linkProgramToPackage = async (
  programId: string | number,
  packageId: number | null,
): Promise<void> => {
  await api.patch(`/v3/program-proposals/${programId}/`, { package: packageId });
};


/* ----------------------------- grouped (read path) ----------------------------- */
// Packages with their linked interventions / national programs nested, for the
// grouped table. One GET returns the whole structure.
export const getGroupedPackages = async (): Promise<GroupedPackage[]> => {
  try {
    const res = await api.get(`${PKG}grouped/`);
    return unwrap(res);
  } catch {
    return [];
  }
};
 
/* ----------------------------- single link ----------------------------- */
// The proposal endpoints don't allow PATCH, so single-link reuses the bulk path:
// one row = link this reference to this (existing) package by name.
export const linkOne = (packageName: string, reference_number: string): Promise<BulkUploadResult> =>
  bulkUploadPackages([{ name: packageName, reference_number }]);
 


export const unlinkProposal = async (packageId: number, reference_number: string): Promise<void> => {
  await api.post(`${PKG}${packageId}/unlink/`, { reference_number });
};
 