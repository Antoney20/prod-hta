// types/new/intervention-package.ts

export interface SchemaField {
  key: string;
  value: string;
}

export interface InterventionPackage {
  id: number;
  name: string;
  description: string;
  field_schema: SchemaField[];
  created_at: string;
  updated_at: string;

  // optional read-only annotations if your serializer adds counts
  interventions_count?: number;
  national_proposals_count?: number;
}

export interface InterventionPackagePayload {
  name: string;
  description?: string;
  field_schema?: SchemaField[];
}

/** One bulk row: link the proposal matched by `reference_number` to the existing
 *  package matched by `name` (case-insensitive). */
export interface BulkUploadRow {
  name: string;
  reference_number: string;
}

export interface BulkUploadResult {
  attached: { row: number; ref: string; package: string }[];
  errors: { row: number; ref: string; error: string }[];
}

/* ----- grouped read view ----- */

export interface PackageMember {
  kind: "intervention" | "program";
  id: string;
  reference_number: string;
  name: string | null;
}

export interface GroupedPackage {
  id: number;
  name: string;
  description: string;
  field_schema: SchemaField[];
  members: PackageMember[];
}