import api from "../../auth";
import { ApiResponse } from "../shared";
import {
  NationalProgram,
  NationalProgramPayload,
  ProgramProposal,
  ProgramProposalPayload,
} from "@/types/new/program";

const errMsg = (e: any, fallback = "Something went wrong"): string =>
  e?.response?.data?.message || e?.message || fallback;



export const getPrograms = async (activeOnly = false): Promise<NationalProgram[]> => {
  try {
    const res = await api.get<ApiResponse<NationalProgram[]>>(
      `/v3/national-programs/${activeOnly ? "?active=1" : ""}`
    );
    return res.data.data ?? [];
  } catch {
    return [];
  }
};

export const getProgram = async (id: number | string): Promise<NationalProgram | null> => {
  try {
    const res = await api.get<ApiResponse<NationalProgram>>(`/v3/national-programs/${id}/`);
    return res.data.data ?? null;
  } catch {
    return null;
  }
};

export const createProgram = async (payload: NationalProgramPayload) => {
  try {
    const res = await api.post<ApiResponse<NationalProgram>>("/v3/national-programs/", payload);
    return { data: res.data.data as NationalProgram };
  } catch (e: any) {
    return { error: errMsg(e) };
  }
};

export const updateProgram = async (id: number, payload: Partial<NationalProgramPayload>) => {
  try {
    const res = await api.patch<ApiResponse<NationalProgram>>(`/v3/national-programs/${id}/`, payload);
    return { data: res.data.data as NationalProgram };
  } catch (e: any) {
    return { error: errMsg(e) };
  }
};

export const deleteProgram = async (id: number) => {
  try {
    await api.delete(`/v3/national-programs/${id}/`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: errMsg(e) };
  }
};

/* ---------------- Program proposals ---------------- */

export const getProposals = async (program?: number | string): Promise<ProgramProposal[]> => {
  try {
    const q = program !== undefined && program !== "" ? `?program=${program}` : "";
    const res = await api.get<ApiResponse<ProgramProposal[]>>(`/v3/program-proposals/${q}`);
    return res.data.data ?? [];
  } catch {
    return [];
  }
};

export const getProposal = async (id: number | string): Promise<ProgramProposal | null> => {
  try {
    const res = await api.get<ApiResponse<ProgramProposal>>(`/v3/program-proposals/${id}/`);
    return res.data.data ?? null;
  } catch {
    return null;
  }
};

export const createProposal = async (payload: ProgramProposalPayload) => {
  try {
    const res = await api.post<ApiResponse<ProgramProposal>>("/v3/program-proposals/", payload);
    return { data: res.data.data as ProgramProposal };
  } catch (e: any) {
    return { error: errMsg(e) };
  }
};

export const updateProposal = async (id: number, payload: Partial<ProgramProposalPayload>) => {
  try {
    const res = await api.patch<ApiResponse<ProgramProposal>>(`/v3/program-proposals/${id}/`, payload);
    return { data: res.data.data as ProgramProposal };
  } catch (e: any) {
    return { error: errMsg(e) };
  }
};

export const deleteProposal = async (id: number) => {
  try {
    await api.delete(`/v3/program-proposals/${id}/`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: errMsg(e) };
  }
};