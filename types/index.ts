export interface GovernanceResponse {
  raw_output: string;
  governed_output: string;
  metrics: {
    c: number;
    r: number;
    s: number;
    m: number;
  };
  intervention?: {
    triggered: boolean;
    reason?: string;
  };
  diff?: {
    removed: string[];
    added: string[];
    unchanged: string[];
  };
  upgrade_required?: boolean;
}

export interface PreEvalResult {
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  predictedC: number;
  predictedR: number;
  predictedS: number;
  confidence: number;
}
