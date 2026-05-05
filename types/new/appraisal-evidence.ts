import { ISODateString, UUID } from "@/types/new/shared";


export interface AppraisalCriteriaEvidence {
  id: UUID;
  intervention: UUID;
  intervention_name: string;
  reference_number: string | null;
  system_categories: string | null;
  created_by: UUID | null;
  created_by_name: string | null;

  brief_info: string | null;
  clinical_effectiveness: string | null;
  safety: string | null;
  quality: string | null;
  burden_of_disease_mortality: string | null;
  burden_of_disease_morbidity: string | null;
  population: string | null;
  equity: string | null;
  cost_effectiveness: string | null;
  budget_impact_affordability: string | null;
  feasibility_of_implementation: string | null;
  catastrophic_health_expenditure: string | null;
  access_to_healthcare: string | null;
  congruence_with_health_priorities: string | null;
  additional_info: string | null;

  documents: AppraisalEvidenceDocument[];
  images: AppraisalEvidenceImage[];

  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface AppraisalEvidenceDocument {
  id: UUID;
  file: string;
  name: string | null;
  uploaded_at: ISODateString;
}

export interface AppraisalEvidenceImage {
  id: UUID;
  image: string;
  caption: string | null;
  uploaded_at: ISODateString;
}

export interface AppraisalCriteriaEvidencePayload {
  intervention: UUID;
brief_info: string | null;
clinical_effectiveness: string | null;
safety: string | null;
quality: string | null;
burden_of_disease_mortality: string | null;
burden_of_disease_morbidity: string | null;
population: string | null;
equity: string | null;
cost_effectiveness: string | null;
budget_impact_affordability: string | null;
feasibility_of_implementation: string | null;
catastrophic_health_expenditure: string | null;
access_to_healthcare: string | null;
congruence_with_health_priorities: string | null;
additional_info: string | null;
}