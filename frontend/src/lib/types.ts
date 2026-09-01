export interface ScanResult {
  file_id: string;
  filename: string;
  status: "clean" | "threat_detected" | "sanitized";
  threats: Threat[];
  sanitized_text: string;
  embedding_id: string | null;
  scan_duration_ms: number;
  total_chunks: number;
  flagged_chunks: number;
}

export interface Threat {
  chunk_id: string;
  threat_type: string;
  confidence: number;
  agent_source: "pattern_scanner" | "semantic_evaluator" | "context_analyzer";
  original_span: string;
  action: "redacted" | "flagged";
}

export interface Alert {
  id: string;
  file_id: string;
  timestamp: string;
  threat_type: string;
  confidence: number;
  agent_source: string;
  action_taken: string;
}

export interface Stats {
  totalScanned: number;
  threatsBlocked: number;
  cleanFiles: number;
  avgScanTimeMs: number;
}

export interface HealthStatus {
  status: string;
  agents: any[];
}
