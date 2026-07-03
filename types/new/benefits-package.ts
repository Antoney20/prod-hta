export interface BenefitPackageItem {
  specialty?: string;
  intervention?: string;
  tariff?: number | string;
  [key: string]: any; 
}

export interface BenefitPackage {
  id: string;
  name: string;
  fund: string;
  data: Record<string, any>;
  items: BenefitPackageItem[];
  created_at: string;
  updated_at: string;
}

export interface BenefitPackageInput {
  name: string;
  fund?: string;
  data?: Record<string, any>;
  items?: BenefitPackageItem[];
}