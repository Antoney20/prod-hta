export interface AssessmentCriteria {
  id: string;
  order: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface AssessmentEvidenceDocument {
  id: string;
  file: string;
  filename: string;
  description: string;
  uploaded_at: string;
}

export interface AssessmentEvidenceImage {
  id: string;
  image: string;
  caption: string;
  alt_text: string;
  uploaded_at: string;
}

export interface AssessmentEvidence {
  id: string;
  criteria: string;
  criteria_name: string;
  interventions: string[];
  title: string;
  notes: string;
  documents: AssessmentEvidenceDocument[];
  images: AssessmentEvidenceImage[];
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}