export interface AnalysisResult {
  suspicion: number;
  flags: string[];
  reasoning: string;
  warning?: string; 
}