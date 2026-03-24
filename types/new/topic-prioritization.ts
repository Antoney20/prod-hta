export interface DecisionType {
  id: string;
  name: string;
  description: string;
}

export interface SystemCategorySummary {
  id: string;
  name: string;
}

export type TopicPriorityStatus = "PENDING" | "ON_REVIEW" | "DECIDED" | "CLOSED";

export interface TopicPriority {
  id: string;
  reference_number: string;
  intervention_name: string;
  status: TopicPriorityStatus;
  decision: DecisionType | null;
  decision_date: string | null;
  feedback: string;
  system_categories: SystemCategorySummary[];
  created_at: string;
  updated_at: string;
}

export interface TopicPriorityResponse {
  status: string;
  count: number;
  generated_at: string;
  results: TopicPriority[];
}

export type TopicPriorityWritePayload = {
  intervention: string;
  status?: TopicPriorityStatus;
  decision?: string | null;
  decision_date?: string | null;
  feedback?: string;
  justification?: string;
  additional_info?: string;
};

export type DecisionTypeWritePayload = Pick<DecisionType, "name" | "description">;