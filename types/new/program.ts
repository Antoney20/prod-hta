export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "integer"
  | "boolean"
  | "date"
  | "select"
  | "multiselect"
  | "url"
  | "email";

export interface ProgramField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];      
  placeholder?: string;
  hint?: string;
}

export interface NationalProgram {
  id: number;
  name: string;
  code: string;                 // MOH-HIV, MOH-NCD, SHA, NRFH
  description?: string;
  field_schema: ProgramField[];
  reference_template?: string;  // read-only, e.g. INTERV-MOH-NCD
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NationalProgramPayload {
  name: string;
  code: string;
  description?: string;
  field_schema?: ProgramField[];
  is_active?: boolean;
}

export interface ProgramProposal {
  id: string;
  program: number;
  program_code?: string;
  program_name?: string;
  reference_number: string;
  title: string;
  justification?: string;
  package?: string;
  package_name?: string;
  data: Record<string, unknown>;   // dynamic, program-specific
  submitted_date: string;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
}

export interface ProgramProposalPayload {
  program: number;
  title: string;
  justification?: string;
  data?: Record<string, unknown>;
  submitted_date?: string;
}