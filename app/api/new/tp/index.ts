import api from "../../auth";
import {
  TopicPriority,
  TopicPriorityWritePayload,
  TopicPriorityResponse,
  DecisionType,
  DecisionTypeWritePayload,
} from "@/types/new/topic-prioritization";


export const getTopicPriorities = async (): Promise<TopicPriority[]> => {
  try {
    const res = await api.get<TopicPriorityResponse>("/v3/topic-priority/");
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

export const createTopicPriority = async (
  body: TopicPriorityWritePayload
): Promise<TopicPriority | null> => {
  try {
    const res = await api.post<TopicPriority>("/v3/topic-priority/", body);
    return res.data;
  } catch {
    return null;
  }
};

export const updateTopicPriority = async (
  id: string,
  body: Partial<TopicPriorityWritePayload>
): Promise<TopicPriority | null> => {
  try {
    const res = await api.patch<TopicPriority>(`/v3/topic-priority/${id}/`, body);
    return res.data;
  } catch {
    return null;
  }
};

export const deleteTopicPriority = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/v3/topic-priority/${id}/`);
    return true;
  } catch {
    return false;
  }
};

interface DecisionTypeListResponse {
  count: number;
  results: DecisionType[];
}

export const getDecisionTypes = async (): Promise<DecisionType[]> => {
  try {
    const res = await api.get<DecisionTypeListResponse>("/v3/decision-types/");
    return res.data.results ?? [];
  } catch {
    return [];
  }
};

export const createDecisionType = async (
  body: DecisionTypeWritePayload
): Promise<DecisionType | null> => {
  try {
    const res = await api.post<DecisionType>("/v3/decision-types/", body);
    return res.data;
  } catch {
    return null;
  }
};

export const updateDecisionType = async (
  id: string,
  body: Partial<DecisionTypeWritePayload>
): Promise<DecisionType | null> => {
  try {
    const res = await api.patch<DecisionType>(`/v3/decision-types/${id}/`, body);
    return res.data;
  } catch {
    return null;
  }
};

export const deleteDecisionType = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/v3/decision-types/${id}/`);
    return true;
  } catch {
    return false;
  }
};