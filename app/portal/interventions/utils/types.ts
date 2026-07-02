export interface InterventionDocument {
  id: string | number;
  original_name: string;
  document_url: string;
}


export interface FilterState {
  search: string;
  county: string;
  interventionType: string;
  package_name: string;
  phase_name: string;
  fromDate: string;
  toDate: string;
}

export type PageSize = 25 | 50 | 75 | 100;

export type UserRole = "admin" | "secretariat" | "reviewer" | string;