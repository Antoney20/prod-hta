export interface BenefitPackage {
  id: string;
  name: string;
  fund: string;
  data: Record<string, any>; 
  created_at: string;
  updated_at: string;
}
 
export interface BenefitPackageInput {
  name: string;
  fund?: string;
  data?: Record<string, any>;
}
 