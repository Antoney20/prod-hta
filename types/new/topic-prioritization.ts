export interface DecisionType {
  id: string;
  name: string;
  description: string;
}

export interface TopicPriority {
  /** null when the row comes from a scored intervention with no status update yet */
  id: string | null;
  reference_number: string;
  intervention_name: string;
  decision: DecisionType | null;
  decision_date: string | null;
  feedback: string;
  system_categories: string[];
  is_scored: string | null;
  intervention_id:string | null;

  created_at: string | null;
  updated_at: string | null;
}

export interface TopicPriorityResponse {
  status: string;
  count: number;
  generated_at: string;
  results: TopicPriority[];
}

export type TopicPriorityWritePayload = {
  intervention: string;
  decision?: string | null;
  decision_date?: string | null;
  feedback?: string;
  notes?: string;
  additional_info?: string;
};

export type DecisionTypeWritePayload = Pick<DecisionType, "name" | "description">;