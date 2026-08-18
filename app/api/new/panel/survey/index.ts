import api from "@/app/api/auth";
import type {
  WeightingResponse,
  WeightingResponsePayload,
  WeightingScores,
  WeightingSurvey,
} from "@/types/panel/survey";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const BASE = "/v3/weighting/surveys";

export const listSurveys = async (): Promise<WeightingSurvey[]> => {
  const { data } = await api.get<WeightingSurvey[] | Envelope<WeightingSurvey[]>>(`${BASE}/`);
  // DRF list returns a bare array; keep tolerant of either shape.
  return Array.isArray(data) ? data : data.data;
};

export const getSurvey = async (id: number): Promise<WeightingSurvey> => {
  const { data } = await api.get<WeightingSurvey>(`${BASE}/${id}/`);
  return data;
};

export const createSurvey = async (
  payload: Partial<WeightingSurvey>
): Promise<WeightingSurvey> => {
  const { data } = await api.post<Envelope<WeightingSurvey>>(`${BASE}/`, payload);
  return data.data;
};

export const deleteSurvey = async (id: number): Promise<void> => {
  await api.delete(`${BASE}/${id}/`);
};

// Id-less: submits against the active survey; backend fills the respondent
// from request.user (email or username).
export const submitResponse = async (
  payload: WeightingResponsePayload
): Promise<WeightingResponse> => {
  const { data } = await api.post<Envelope<WeightingResponse>>(`${BASE}/submit/`, payload);
  return data.data;
};

// Id-less: committee aggregation for the active survey.
export const getScores = async (): Promise<WeightingScores> => {
  const { data } = await api.get<Envelope<WeightingScores>>(`${BASE}/scores/`);
  return data.data;
};