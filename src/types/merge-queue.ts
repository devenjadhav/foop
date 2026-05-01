export type MergeRequestStatus =
  | "pending"
  | "validating"
  | "processing"
  | "merged"
  | "failed"
  | "cancelled";

export type MergeRequestPriority = "critical" | "high" | "normal" | "low";

export type GateStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export interface GateResult {
  name: string;
  status: GateStatus;
  startedAt?: Date;
  completedAt?: Date;
  output?: string;
  errorMessage?: string;
}

export interface MergeRequest {
  id: string;
  title: string;
  description?: string;
  sourceBranch: string;
  targetBranch: string;
  status: MergeRequestStatus;
  priority: MergeRequestPriority;
  submittedBy: string;
  submittedAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  position: number;
  gates: GateResult[];
  conflictsWith?: string[];
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  commitSha: string;
  baseSha: string;
  labels: string[];
}

export interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  merged: number;
  failed: number;
  averageWaitTimeMs: number;
  averageProcessTimeMs: number;
  throughputPerHour: number;
}

export interface RefineryConfig {
  maxConcurrent: number;
  gateTimeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  gates: string[];
  autoRebase: boolean;
  bisectOnFailure: boolean;
}
