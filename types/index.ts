export interface TrustReceipt {
  run_id: string;
  generated_at: string;
  input_hash: string;
  raw_output_hash: string;
  governed_output_hash: string;
  final_output_hash: string;
  intervention: boolean;
  intervention_reason: string;
  semantic_diff_score: number;
  M: number;
  stability_timeline: { stage: string; stability: number }[];
  integrity_signature: string;
  key_id: string;
  receipt_version: string;
}

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
  trust_receipt?: TrustReceipt | null;
}

export interface PreEvalResult {
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  predictedC: number;
  predictedR: number;
  predictedS: number;
  confidence: number;
}

export interface AuthUser {
  id: string;
  email: string;
  company_name: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export interface AuthToken {
  access_token: string;
  token_type: 'bearer';
  expires_at: string;
  user: AuthUser;
}
