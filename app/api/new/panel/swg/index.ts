import api from "@/app/api/auth";
import type {  SwgListSummary, SwgWrite , SwgList } from "@/types/panel/benefits-package";

export const swgErr = (e: any): string =>
  e?.response?.data?.message ??
  e?.response?.data?.error ??
  e?.response?.data?.detail ??
  e?.message ??
  "Something went wrong";

/** Unwraps the { success, message, data } envelope, or passes raw through. */
const payload = <T,>(res: any): T => {
  const b = res?.data;
  return b && typeof b === "object" && "success" in b && "data" in b ? b.data : b;
};

export const listSwg = async (cycle?: string): Promise<SwgListSummary[]> => {
  try {
    const q = cycle ? `?cycle=${encodeURIComponent(cycle)}` : "";
    return payload<SwgListSummary[]>(await api.get(`/v3/swg/${q}`)) ?? [];
  } catch {
    return [];
  }
};

export const getSwg = async (id: string): Promise<SwgList | null> => {
  try {
    return payload<SwgList>(await api.get(`/v3/swg/${id}/`)) ?? null;
  } catch {
    return null;
  }
};

export const createSwg = async (body: SwgWrite): Promise<{ id: string }> =>
  payload<{ id: string }>(await api.post(`/v3/swg/`, body));

export const updateSwg = async (id: string, body: SwgWrite): Promise<{ id: string }> =>
  payload<{ id: string }>(await api.patch(`/v3/swg/${id}/`, body));

export const deleteSwg = async (id: string): Promise<void> => {
  await api.delete(`/v3/swg/${id}/`);
};