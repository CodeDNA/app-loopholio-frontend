export interface RiskLevel {
  chunk_id: string;
  clause_id: string;
  level: "High" | "Medium" | "Low";
  confidence: number;
  category: string;
  reason: string;
  whyMatters: string;
  recommendation: string;
  exactClause: string; // exact quote from the from the section in question
  source_text: string; // exact text/section in question
  section_title: string;
}

export interface Analysis {
  id: string;
  fileName: string;
  title?: string; // Title from backend for pasted text, or derived from filename for files
  uploadedAt: Date;
  documentPreview: string; // First 100 chars of the document
  riskLevels: RiskLevel[] | [];
  overallRiskLevel: "High" | "Medium" | "Low";
  isStreaming: boolean;
  highRiskCount?: number;
  mediumRiskCount?: number;
  lowRiskCount?: number;
  error?: any; // Details when backend returns an error
}

export interface HistoryItem {
  id: string;
  fileName: string;
  uploadedAt: Date;
  overallRiskLevel: "High" | "Medium" | "Low";
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}
