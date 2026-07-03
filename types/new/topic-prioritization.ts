export interface DecisionType {
  id: string;
  name: string;
  description: string;
}

// add routing_decision to the read row
export interface TopicPriority {
  id: string | null;
  target_type?: "intervention" | "national_proposal";
  reference_number: string;
  intervention_id: string;
  intervention_name: string;
  package: string | null;
  phase: string | null;
  decision: DecisionType | null;
  routing_decision: string | null;   // NEW
  decision_date: string | null;
  feedback: string | null;
  system_categories: string[];
  is_scored: boolean;
  move_to_panel: boolean;
  created_at: string | null;
  updated_at: string | null;
}

// add routing_decision to the write payload
export interface TopicPriorityWritePayload {
  intervention: string;
  decision: string | null;
  decision_date: string | null;
  feedback: string;
  routing_decision?: string | null;   // NEW
  notes?: string;
  additional_info?: string;
}

export interface TopicPriorityResponse {
  status: string;
  count: number;
  generated_at: string;
  results: TopicPriority[];
}



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