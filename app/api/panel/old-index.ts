// import api from "@/app/api/auth";
// import {
//   ProtocolGuide,
//   ProtocolGuideInput,
//   ScoringModel,
//   ScoringModelInput,
// } from "@/types/panel/scoring";


// const unwrap = <T,>(res: any): T => {
//   const env = res?.data ?? res;
//   if (env && typeof env === "object" && "ok" in env) {
//     if (!env.ok) {
//       throw new Error(typeof env.error === "string" ? env.error : JSON.stringify(env.error));
//     }
//     return env.data as T;
//   }
//   return env as T;
// };

// /** Flatten DRF / envelope errors into a readable line. */
// export const errMsg = (e: any): string => {
//   const m = e?.message ?? e?.response?.data?.error ?? e?.response?.data?.message ?? e;
//   if (typeof m === "string") return m;
//   if (m && typeof m === "object") {
//     return Object.entries(m)
//       .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
//       .join("; ");
//   }
//   return "Unknown error";
// };

// /* ----------------------------- scoring models ----------------------------- */

// export const listScoringModels = async (): Promise<ScoringModel[]> => {
//   try {
//     const res = await api.get("/v3/scoring-models/");
//     return unwrap<ScoringModel[]>(res);
//   } catch {
//     return [];
//   }
// };

// export const getScoringModel = async (id: string): Promise<ScoringModel | null> => {
//   try {
//     const res = await api.get(`/v3/scoring-models/${id}/`);
//     return unwrap<ScoringModel>(res);
//   } catch {
//     return null;
//   }
// };

// export const createScoringModel = async (input: ScoringModelInput): Promise<ScoringModel> => {
//   const res = await api.post("/v3/scoring-models/", input);
//   return unwrap<ScoringModel>(res);
// };

// export const updateScoringModel = async (
//   id: string,
//   input: ScoringModelInput,
// ): Promise<ScoringModel> => {
//   const res = await api.patch(`/v3/scoring-models/${id}/`, input);
//   return unwrap<ScoringModel>(res);
// };

// export const deleteScoringModel = async (id: string): Promise<{ deleted: string }> => {
//   const res = await api.delete(`/v3/scoring-models/${id}/`);
//   return unwrap<{ deleted: string }>(res);
// };

// export const scoreScoringModel = async (
//   id: string,
//   body: { protocol_id?: string; version?: string } = {},
// ): Promise<ScoringModel> => {
//   const res = await api.post(`/v3/scoring-models/${id}/score/`, body);
//   return unwrap<ScoringModel>(res);
// };

// export const finalizeScoringModel = async (id: string): Promise<ScoringModel> => {
//   const res = await api.post(`/v3/scoring-models/${id}/finalize/`, {});
//   return unwrap<ScoringModel>(res);
// };

// /* ----------------------------- protocol guides ----------------------------- */

// export const listProtocolGuides = async (): Promise<ProtocolGuide[]> => {
//   try {
//     const res = await api.get("/v3/protocol-guides/");
//     return unwrap<ProtocolGuide[]>(res);
//   } catch {
//     return [];
//   }
// };

// export const getProtocolGuide = async (id: string): Promise<ProtocolGuide | null> => {
//   try {
//     const res = await api.get(`/v3/protocol-guides/${id}/`);
//     return unwrap<ProtocolGuide>(res);
//   } catch {
//     return null;
//   }
// };

// export const getActiveProtocol = async (): Promise<ProtocolGuide | null> => {
//   try {
//     const res = await api.get("/v3/protocol-guides/active/");
//     return unwrap<ProtocolGuide>(res);
//   } catch {
//     return null;
//   }
// };

// export const createProtocolGuide = async (input: ProtocolGuideInput): Promise<ProtocolGuide> => {
//   const res = await api.post("/v3/protocol-guides/", input);
//   return unwrap<ProtocolGuide>(res);
// };

// export const updateProtocolGuide = async (
//   id: string,
//   input: ProtocolGuideInput,
// ): Promise<ProtocolGuide> => {
//   const res = await api.patch(`/v3/protocol-guides/${id}/`, input);
//   return unwrap<ProtocolGuide>(res);
// };

// export const deleteProtocolGuide = async (id: string): Promise<{ deleted: string }> => {
//   const res = await api.delete(`/v3/protocol-guides/${id}/`);
//   return unwrap<{ deleted: string }>(res);
// };

// export const activateProtocolGuide = async (id: string): Promise<ProtocolGuide> => {
//   const res = await api.post(`/v3/protocol-guides/${id}/activate/`, {});
//   return unwrap<ProtocolGuide>(res);
// };