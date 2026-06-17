import api from "@/app/api/auth";
import { BenefitPackage, BenefitPackageInput } from "@/types/new/benefits-package";

const unwrap = (res: any) => res?.data?.data ?? res?.data?.results ?? res?.data ?? [];
const errMsg = (e: any, fb = "Something went wrong"): string =>
  e?.response?.data?.error ||
  e?.response?.data?.message ||
  e?.response?.data?.detail ||
  e?.message ||
  fb;

export const getBenefitPackages = async (fund?: string): Promise<BenefitPackage[]> => {
  try {
    const res = await api.get("/v3/benefit-packages/", { params: fund ? { fund } : {} });
    return unwrap(res);
  } catch {
    return [];
  }
};

export const getBenefitPackage = async (id: string): Promise<BenefitPackage | null> => {
  try {
    const res = await api.get(`/v3/benefit-packages/${id}/`);
    const data = res?.data?.data ?? res?.data ?? null;
    return data && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
};

export const createBenefitPackage = async (
  payload: BenefitPackageInput,
): Promise<{ ok: boolean; data?: BenefitPackage; error?: string }> => {
  try {
    const res = await api.post("/v3/benefit-packages/", payload);
    return { ok: true, data: res?.data?.data ?? res?.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const updateBenefitPackage = async (
  id: string,
  payload: BenefitPackageInput,
): Promise<{ ok: boolean; data?: BenefitPackage; error?: string }> => {
  try {
    const res = await api.patch(`/v3/benefit-packages/${id}/`, payload);
    return { ok: true, data: res?.data?.data ?? res?.data };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};

export const deleteBenefitPackage = async (
  id: string,
): Promise<{ ok: boolean; error?: string }> => {
  try {
    await api.delete(`/v3/benefit-packages/${id}/`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
};