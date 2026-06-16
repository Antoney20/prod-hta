export type Confidence = "high" | "moderate" | "low";
 
export interface KeptMetric {
  field: string;
  raw: string;          
  value?: number;        
  unit?: string;
  confidence: Confidence;
  uncertain: boolean;     
  why?: string;           
}
 
export interface DroppedMetric {
  criterion: string;
  field: string;
  reason: string;        
  why?: string;          
}
 
export interface EvidenceFlag {
  criterion: string;
  field: string | null;
  flag: string;          
}
 
export interface AgenticEvidence {
  id: string;
  intervention_ref: string;
  proposal_kind: "intervention" | "program" | null;
  data: Record<string, KeptMetric[]>;   
  dropped: DroppedMetric[];
  flags: EvidenceFlag[];
  reasoning: Record<string, string>;    
  protocol_version: string | null;
  source_hash: string | null;
  generated_at: string;
  created_by: number | null;
}
 
export interface GenerateEvidencePayload {
  extraction_id: string;
}
 
export interface GenerateSummary {
  total: number;
  generated: number;
  cached: number;
  failed: { ref: string; error: string }[];
}
 
 
export type PageSize = 25 | 50 | 75 | 100;
 
export interface AgenticFilterState {
  search: string;
  kind: "all" | "intervention" | "program";
  flaggedOnly: boolean;
}