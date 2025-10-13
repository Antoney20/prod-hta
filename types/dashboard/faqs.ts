export interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  steps?: string[];
  tips?: string[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  videoUrl?: string;
  steps: string[];
  tips: string[];
}