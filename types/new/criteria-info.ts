export type CriteriaTargetType = "intervention" | "national_proposal";
export type BODType = "DALY" | "QALY" | "PREVALENCE" | "INCIDENCE";

export interface CriteriaInformation {
  id: string;

  intervention: string | null;
  intervention_name: string | null;
  intervention_reference_number: string | null;

  national_proposal: string | null;
  national_proposal_name: string | null;
  national_proposal_reference_number: string | null;

  target_type: CriteriaTargetType;
  package_name: string | null;

  created_by: string | null;
  created_by_name: string | null;

  brief_info: string | null;
  clinical_effectiveness: string | null;
  burden_of_disease: string | null;
  bod_type: BODType | null;
  population: string | null;
  equity: string | null;
  cost_effectiveness: string | null;
  budget_impact_affordability: string | null;
  feasibility_of_implementation: string | null;
  catastrophic_health_expenditure: string | null;
  access_to_healthcare: string | null;
  congruence_with_health_priorities: string | null;
  additional_info: string | null;

  created_at: string;
  updated_at: string;
}

export type CriteriaInformationPayload = {
  intervention?: string | null;
  national_proposal?: string | null;

  brief_info: string | null;
  clinical_effectiveness: string | null;
  burden_of_disease: string | null;
  bod_type: BODType | null;
  population: string | null;
  equity: string | null;
  cost_effectiveness: string | null;
  budget_impact_affordability: string | null;
  feasibility_of_implementation: string | null;
  catastrophic_health_expenditure: string | null;
  access_to_healthcare: string | null;
  congruence_with_health_priorities: string | null;
  additional_info: string | null;
};

export interface InterventionSearchResult {
  id: string;
  reference_number: string | null;
  intervention_name: string | null;
  county: string | null;
  intervention_type: string | null;
}