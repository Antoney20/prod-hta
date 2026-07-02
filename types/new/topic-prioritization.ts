export interface DecisionType {
  id: string;
  name: string;
  description: string;
}

export interface TopicPriority {
  id: string | null;
  reference_number: string;
  intervention_name: string;
  decision: DecisionType | null;
  decision_date: string | null;
  feedback: string;
  system_categories: string[];
  is_scored: string | null;
  intervention_id:string | null;
  move_to_panel: boolean;   
  package: string | null;
  phase: string | null;

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

export type BulkMoveToPanelPayload = {   
  ids: string[];
};

export interface UndoMoveToPanelResult {
  detail: string;
  intervention_id: string;
  intervention_name: string;
}

export interface UndoMoveToPanelError {
  detail: string;
  reason: "has_scores" | "not_on_panel" | "unknown";
}

export type DecisionTypeWritePayload = Pick<DecisionType, "name" | "description">;