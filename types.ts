
export enum ClaimStatus {
  APPLICABLE = 'APPLICABLE',
  POTENTIAL = 'POTENTIAL',
  NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export interface Rider {
  id: string;
  name: string;
  category?: string; // Optional category for better AI context
  coverageAmount: number;
  description: string;
}

export interface Policy {
  id: string;
  company: string;
  mainPlanName: string;
  mainPlanCategory?: string; // Optional category
  mainCoverageAmount: number;
  riders: Rider[];
}

export interface MedicalEvent {
  diagnosis: string;
  hospitalizationDays: number;
  surgeryName: string;
  outpatientVisits: number;
  totalExpense: number; // Self-payment amount
  retainedAmount: number; // Deductible/Retained amount
  incidentDate: string;
  evidenceFiles: string[]; // base64 strings
}

export interface ClaimItem {
  policyId: string;
  componentName: string;
  estimatedAmount: number;
  status: ClaimStatus;
  reason: string;
}

export interface AdviceItem {
  title: string;
  content: string;
  type: 'strategy' | 'warning' | 'tip';
}

export interface EstimationResult {
  summary: string;
  totalEstimatedAmount: number;
  items: ClaimItem[];
  evaluationPoints: string[];
  communicationAdvice: AdviceItem[];
}
