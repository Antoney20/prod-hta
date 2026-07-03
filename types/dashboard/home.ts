export interface DashboardCounts {
  total_intervention_proposals: number;
  total_national_programs: number;
  total_national_program_proposals: number;
  my_tasks: number;
  my_activities: number;
  scope: 'all' | 'self';
}

export interface TrendPoint {
  label: string;   
  date: string;    
  count: number;
}

export interface DashboardTrends {
  daily: TrendPoint[];
  weekly: TrendPoint[];
  monthly: TrendPoint[];
}

export interface PackageCount {
  id: string;
  name: string;
  intervention_count: number;
}

export interface DashboardPackages {
  total_packages: number;
  by_package: PackageCount[];
  unassigned_interventions: number;
}

export interface DashboardResponse {
  counts: DashboardCounts;
  trends: DashboardTrends;
  packages: DashboardPackages;
}

export interface DashboardUIData extends DashboardResponse {
  topPackage: PackageCount | null;
}

export type TrendMode = 'daily' | 'weekly' | 'monthly';